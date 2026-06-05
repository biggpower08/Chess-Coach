import pytest

from app.ai.mock_coach import generate_mock_coaching_response
from app.ai.openai_coach import get_coach_response
from app.config import get_settings
from app.models import CoachingContext


@pytest.mark.anyio
async def test_mock_coach_works_without_openai_key(monkeypatch):
    monkeypatch.setenv("USE_MOCK_AI", "true")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    get_settings.cache_clear()

    response = await get_coach_response(
        CoachingContext(task="pgn_analysis", san_moves=["e4", "e5"])
    )

    assert response.provider == "mock"
    assert response.is_mock is True
    assert response.summary


@pytest.mark.anyio
async def test_direct_mock_coach_returns_training_items():
    response = await generate_mock_coaching_response(
        CoachingContext(task="coach_game", san_moves=["e4", "e5"])
    )

    assert response.provider == "mock"
    assert response.suggested_training
