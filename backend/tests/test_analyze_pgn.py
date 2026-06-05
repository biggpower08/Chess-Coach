from fastapi.testclient import TestClient

from app.main import app


SAMPLE_PGN = """
[Event "Friendly"]
[White "Player"]
[Black "Opponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0
"""


def test_analyze_pgn_returns_mock_analysis(monkeypatch):
    monkeypatch.setenv("USE_MOCK_AI", "true")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    client = TestClient(app)

    response = client.post("/api/analyze-pgn", json={"pgn": SAMPLE_PGN})

    assert response.status_code == 200
    data = response.json()
    assert data["move_count"] == 6
    assert data["san_moves"][0] == "e4"
    assert data["white_player"] == "Player"
    assert data["black_player"] == "Opponent"
    assert data["result"] == "1-0"
    assert data["coach"]["provider"] == "mock"
    assert data["coach"]["is_mock"] is True


def test_analyze_pgn_bad_pgn_returns_clean_error():
    client = TestClient(app)

    response = client.post("/api/analyze-pgn", json={"pgn": "this is not a PGN"})

    assert response.status_code == 400
    assert "PGN" in response.json()["detail"]
