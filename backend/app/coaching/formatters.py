from app.models import CoachingContext


def format_recent_moves(context: CoachingContext, limit: int = 12) -> str:
    if not context.san_moves:
        return "No moves provided."
    return " ".join(context.san_moves[-limit:])


def format_move_classifications(context: CoachingContext) -> str:
    if not context.move_classifications:
        return "No move classifications provided."
    return "\n".join(
        f"{item.move_number}. {item.side} {item.san}: {item.classification}"
        for item in context.move_classifications[-10:]
    )
