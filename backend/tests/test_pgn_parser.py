from app.chess.pgn_parser import parse_pgn


SAMPLE_PGN = """
[Event "Friendly"]
[Site "Local"]
[Date "2026.06.05"]
[White "Player"]
[Black "Opponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0
"""


def test_parse_pgn_returns_metadata_and_san_moves():
    metadata, san_moves = parse_pgn(SAMPLE_PGN)

    assert metadata.event == "Friendly"
    assert metadata.white == "Player"
    assert san_moves == ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]
