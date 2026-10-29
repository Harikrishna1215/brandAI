from difflib import SequenceMatcher
from app.schemas import BrandVoice, GenerateRequest, GenerateResponse, Tweet

TWEET_LIMIT = 280


class OutputError(ValueError):
    pass


def char_count(text: str) -> int:
    return len(text)  # same measure the UI displays (code points)


def is_near_duplicate(a: str, b: str, threshold: float = 0.85) -> bool:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio() >= threshold


def validate_output(raw: dict, req: GenerateRequest) -> GenerateResponse:
    if not isinstance(raw, dict) or "tweets" not in raw or "brand_voice" not in raw:
        raise OutputError("missing brand_voice or tweets")
    voice = BrandVoice(**raw["brand_voice"])
    items = raw["tweets"]
    if not isinstance(items, list) or len(items) != 10:
        raise OutputError(f"expected exactly 10 tweets, got {len(items) if isinstance(items, list) else 'none'}")
    ids = [t.get("id") for t in items if isinstance(t, dict)]
    if len(set(ids)) != 10:
        raise OutputError("tweet ids are not unique")
    tweets: list[Tweet] = []
    for i, t in enumerate(items, 1):
        text = str(t.get("text", "")).strip()
        if not text:
            raise OutputError(f"tweet {i} is empty")
        for prev in tweets:
            if is_near_duplicate(prev.text, text):
                raise OutputError(f"tweets {prev.id} and {i} are near-identical")
        tweets.append(Tweet(id=i, category=str(t.get("category") or "General").strip(),
                            text=text, rationale=str(t.get("rationale", "")).strip(),
                            character_count=char_count(text)))
    warnings = [f"Tweet {t.id} is {t.character_count} characters (over {TWEET_LIMIT})." for t in tweets if t.character_count > TWEET_LIMIT]
    if req.reference_posts.strip():
        basis = "reference_posts"
    elif req.tones or req.guidelines.strip():
        basis = "preferences"
    else:
        basis = "inference"
    return GenerateResponse(brand_voice=voice, tweets=tweets, warnings=warnings, basis=basis)
