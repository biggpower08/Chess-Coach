from app.models import CoachingContext
from app.coaching.formatters import format_move_classifications, format_recent_moves


def build_coaching_prompt(context: CoachingContext) -> str:
    metadata = context.metadata.model_dump(exclude_none=True) if context.metadata else {}

    return (
        "Create chess coaching feedback from this context.\n"
        "Required shape:\n"
        "1. What happened.\n"
        "2. Why it matters.\n"
        "3. Better idea.\n"
        "4. Concept to practice.\n\n"
        f"Task: {context.task}\n"
        f"Player ID: {context.player_id or 'anonymous'}\n"
        f"Game metadata: {metadata}\n"
        f"Recent moves: {format_recent_moves(context)}\n"
        f"Classifications: {format_move_classifications(context)}\n"
        f"Position FEN: {context.fen or 'not provided'}\n"
        f"Player question: {context.question or 'not provided'}\n"
    )
