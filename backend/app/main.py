import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.schemas import GenerateRequest, GenerateResponse
from app.services import ai_service

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="BrandVoice AI")
app.add_middleware(CORSMiddleware, allow_origins=get_settings()["origins"], allow_methods=["GET", "POST"], allow_headers=["*"])
MAX_BODY = 30_000


@app.middleware("http")
async def limit_body(request: Request, call_next):
    if int(request.headers.get("content-length", 0) or 0) > MAX_BODY:
        return JSONResponse({"detail": "Request too large."}, status_code=413)
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def on_validation(_, exc: RequestValidationError):
    errs = [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse({"detail": "Please check your inputs.", "errors": errs}, status_code=422)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    try:
        return await ai_service.generate(req)
    except ai_service.AIConfigError:
        return JSONResponse({"detail": "The server is missing its AI API key. Set OPENAI_API_KEY in backend/.env (see README) and restart.", "code": "missing_api_key"}, status_code=503)
    except ai_service.AIProviderError as e:
        return JSONResponse({"detail": f"{e} Please try again shortly.", "code": "provider_error"}, status_code=502)
    except ai_service.AIOutputError:
        return JSONResponse({"detail": "The AI returned an invalid result. Please try again.", "code": "invalid_output"}, status_code=502)
