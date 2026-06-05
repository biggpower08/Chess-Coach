from app.models import CoachingContext, CoachingResponse


async def generate_mock_coaching_response(
    context: CoachingContext,
) -> CoachingResponse:
    move_count = len(context.san_moves)
    if context.task == "coach_game":
        summary = (
            "Mock coach: what happened is the game reached a review point where plans "
            "matter more than raw moves. Why it matters: repeated unclear plans become "
            "recurring weaknesses. Better idea: compare forcing moves, piece activity, "
            "and king safety before choosing. Concept to practice: candidate-move discipline."
        )
    else:
        summary = (
            f"Mock coach: I parsed {move_count} moves. What happened: the game is ready "
            "for a structured review. Why it matters: the biggest learning usually comes "
            "from one or two critical decisions. Better idea: identify a critical position "
            "and write down candidate moves first. Concept to practice: explain your plan "
            "before checking the engine."
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
