"""Unit tests use a MOCKED provider (no network). The live test is skipped without a real key."""
import json, os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services import ai_service
from app.services.validators import char_count, is_near_duplicate

client = TestClient(app)
PAYLOAD = {"objective": "Engagement", "products": "Oversized tees, hoodies and sneakers for streetwear fans"}
WORDS = "amber zebra quartz violin harbor pickle rocket meadow lantern velvet".split()


def good(n=10):
    return {"brand_voice": {"summary": ["a", "b", "c"], "tone": ["Bold"], "target_audience": "x", "content_themes": ["y"], "writing_style": "z", "analysis_basis": "inferred"},
            "tweets": [{"id": i, "category": "Engagement", "text": f"{WORDS[i % 10]} {WORDS[(i * 3) % 10]} story number {i}: {WORDS[(i * 7) % 10]} meets {WORDS[(i + 5) % 10]}", "rationale": "r"} for i in range(1, n + 1)]}


@pytest.fixture
def key(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test")


def mock(monkeypatch, outputs):
    calls = {"n": 0}
    async def fake(messages, settings, temperature):
        out = outputs[min(calls["n"], len(outputs) - 1)]
        calls["n"] += 1
        return out if isinstance(out, str) else json.dumps(out)
    monkeypatch.setattr(ai_service, "call_provider", fake)
    return calls


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_missing_required_fields():
    r = client.post("/api/generate", json={"brand_name": "x"})
    assert r.status_code == 422 and {e["field"] for e in r.json()["errors"]} >= {"objective", "products"}


def test_missing_api_key(monkeypatch):
    monkeypatch.setattr(ai_service, "get_settings", lambda: {"key": "", "model": "m", "base_url": "", "origins": []})
    r = client.post("/api/generate", json=PAYLOAD)
    assert r.status_code == 503 and r.json()["code"] == "missing_api_key"


def test_success_schema(key, monkeypatch):
    mock(monkeypatch, [good()])
    d = client.post("/api/generate", json=PAYLOAD).json()
    assert len(d["tweets"]) == 10 and [t["id"] for t in d["tweets"]] == list(range(1, 11))
    assert all(t["character_count"] == len(t["text"]) for t in d["tweets"])
    assert 3 <= len(d["brand_voice"]["summary"]) <= 4


def test_repair_then_success(key, monkeypatch):
    calls = mock(monkeypatch, ["not json", good()])
    assert client.post("/api/generate", json=PAYLOAD).status_code == 200 and calls["n"] == 2


def test_malformed_gives_502_without_infinite_retry(key, monkeypatch):
    calls = mock(monkeypatch, ["garbage"])
    r = client.post("/api/generate", json=PAYLOAD)
    assert r.status_code == 502 and calls["n"] == 2 and "Traceback" not in r.text


def test_wrong_count_rejected(key, monkeypatch):
    mock(monkeypatch, [good(9)])
    assert client.post("/api/generate", json=PAYLOAD).status_code == 502


def test_duplicates_rejected(key, monkeypatch):
    bad = good(); bad["tweets"][1]["text"] = bad["tweets"][0]["text"]
    mock(monkeypatch, [bad])
    assert client.post("/api/generate", json=PAYLOAD).status_code == 502


def test_provider_failure(key, monkeypatch):
    async def boom(*a, **k): raise ai_service.AIProviderError("down.")
    monkeypatch.setattr(ai_service, "call_provider", boom)
    assert client.post("/api/generate", json=PAYLOAD).status_code == 502


def test_helpers_and_oversize():
    assert char_count("héllo") == 5 and is_near_duplicate("Hello world!", "hello world")
    assert client.post("/api/generate", content="x" * 40000, headers={"content-type": "application/json"}).status_code == 413


@pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="LIVE test: needs a real OPENAI_API_KEY")
def test_live_generation():
    import asyncio
    from app.schemas import GenerateRequest
    r = asyncio.run(ai_service.generate(GenerateRequest(**PAYLOAD)))
    assert len(r.tweets) == 10
