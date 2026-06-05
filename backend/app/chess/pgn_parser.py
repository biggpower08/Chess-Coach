import io

import chess.pgn

from app.models import GameMetadata


class PgnParseError(ValueError):
    pass


def parse_pgn(pgn_text: str) -> tuple[GameMetadata, list[str]]:
    clean_pgn = pgn_text.strip()
    if not clean_pgn:
        raise PgnParseError("PGN text is required.")

    game = chess.pgn.read_game(io.StringIO(clean_pgn))
    if game is None:
        raise PgnParseError("Could not parse a chess game from the provided PGN.")
    if game.errors:
        raise PgnParseError("The PGN contains invalid chess notation.")

    metadata = GameMetadata(
        event=_clean_header(game.headers.get("Event")),
        site=_clean_header(game.headers.get("Site")),
        date=_clean_header(game.headers.get("Date")),
        round=_clean_header(game.headers.get("Round")),
        white=_clean_header(game.headers.get("White")),
        black=_clean_header(game.headers.get("Black")),
        result=_clean_header(game.headers.get("Result")),
    )

    board = game.board()
    san_moves: list[str] = []
    for move in game.mainline_moves():
        san_moves.append(board.san(move))
        board.push(move)

    if not san_moves:
        raise PgnParseError("The PGN did not contain any legal moves.")

    return metadata, san_moves


def _clean_header(value: str | None) -> str | None:
    if not value or value == "?":
        return None
    return value
