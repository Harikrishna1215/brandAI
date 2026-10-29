import os
from dotenv import load_dotenv

load_dotenv()


def get_settings() -> dict:
    """Read env on every call so tests/hosts can change it. Never log the key."""
    return {
        "key": os.getenv("OPENAI_API_KEY", "").strip(),
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "base_url": os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
        "origins": [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",") if o.strip()],
    }
