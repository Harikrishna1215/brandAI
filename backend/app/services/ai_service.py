import asyncio, json, logging
import httpx
from app.config import get_settings
from app.schemas import GenerateRequest, GenerateResponse
from app.services.prompt_builder import build_messages, repair_message
from app.services.validators import validate_output

log = logging.getLogger("brandvoice")


class AIConfigError(Exception): ...
class AIProviderError(Exception): ...
class AIOutputError(Exception): ...


async def call_provider(messages: list[dict], settings: dict, temperature: float) -> str:
    """OpenAI-compatible chat completions. Swap this function to change provider."""
    headers = {"Authorization": f"Bearer {settings['key']}"}
    body = {"model": settings["model"], "messages": messages, "temperature": temperature,
            "response_format": {"type": "json_object"}}
    async with httpx.AsyncClient(timeout=60) as client:
        for attempt in range(3):
            try:
                r = await client.post(f"{settings['base_url']}/chat/completions", headers=headers, json=body)
            except httpx.TransportError:
                if attempt == 2:
                    raise AIProviderError("Could not reach the AI provider.")
                await asyncio.sleep(1 + attempt)
                continue
            if r.status_code in (429, 500, 502, 503, 504) and attempt < 2:
                await asyncio.sleep(1 + attempt)
                continue
            if r.status_code in (401, 403):
                raise AIProviderError("The AI provider rejected the API key.")
            if r.status_code >= 400:
                raise AIProviderError(f"The AI provider returned an error ({r.status_code}).")
            return r.json()["choices"][0]["message"]["content"]
    raise AIProviderError("AI provider unavailable.")


async def generate(req: GenerateRequest) -> GenerateResponse:
    settings = get_settings()
    if not settings["key"]:
        raise AIConfigError("OPENAI_API_KEY is not set on the server.")
    messages = build_messages(req)
    temperature = 0.9 if req.variation else 0.8
    last = "unknown"
    for _ in range(2):  # one initial attempt + one repair attempt
        content = await call_provider(messages, settings, temperature)
        try:
            return validate_output(json.loads(content), req)
        except (ValueError, TypeError, AttributeError) as e:  # includes JSON + pydantic errors
            last = str(e)[:300]
            log.warning("Invalid model output: %s", last)
            messages = messages + [{"role": "assistant", "content": content}, repair_message(last)]
    raise AIOutputError(last)
