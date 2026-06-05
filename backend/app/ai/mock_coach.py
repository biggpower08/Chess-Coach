from app.models import CoachingContext, CoachingResponse


async def generate_mock_coaching_response(
    context: CoachingContext,
) -> CoachingResponse:
    move_count = len(context.san_moves)
    if context.task == "coach_game":
        summary = (
            "Mock coach: this game review should focus on when the plan became unclear, "
            "which pieces were left undefended, and whether forcing moves were checked "
            "before quiet moves."
        )
    else:
        summary = (
            f"Mock coach: I parsed {move_count} moves. The first useful review pass is "
            "to identify one critical position, write down candidate moves, then compare "
            "that thinking with engine analysis in a later phase."
        )

    return CoachingResponse(
        provider="mock",
        summary=summary,
        key_takeaways=[
            "Look for checks, captures, and threats before choosing a plan.",
            "Flag moments where the position changed from familiar to unclear.",
            "Track repeated patterns across games once player memory is connected.",
        ],
        suggested_training=[
            "Annotate one critical position without an engine.",
            "Solve tactics based on the opening and middlegame themes from this game.",
        ],
        is_mock=True,
    )
