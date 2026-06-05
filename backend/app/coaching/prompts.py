from app.models import CoachingContext


def build_coaching_prompt(context: CoachingContext) -> str:
    metadata = context.metadata.model_dump(exclude_none=True) if context.metadata else {}
    moves = " ".join(context.san_moves[:120])

    return (
        "You are a patient chess coach. Explain patterns, not just tactics. "
        "Give practical training advice for the player's next sessions.\n\n"
        f"Task: {context.task}\n"
        f"Player ID: {context.player_id or 'anonymous'}\n"
        f"Game metadata: {metadata}\n"
        f"Moves: {moves}\n"
        f"Position FEN: {context.fen or 'not provided'}\n"
        f"Player question: {context.question or 'not provided'}\n"
    )
