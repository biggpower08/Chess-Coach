import os
from functools import lru_cache

from pydantic import BaseModel


class Settings(BaseModel):
    openai_api_key: str | None = None
    use_mock_ai: bool = True
    openai_model: str = "gpt-4.1-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings(
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
        use_mock_ai=_env_bool("USE_MOCK_AI", default=True),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    )


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}
