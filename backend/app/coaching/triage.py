TEACHABLE_CLASSIFICATIONS = {"brilliant", "great", "inaccuracy", "mistake"}


def should_request_deep_coaching(classification: str | None, phase: str | None = None) -> bool:
    if not classification:
        return False
    if classification in {"brilliant", "great", "inaccuracy"}:
        return True
    if phase == "endgame" and classification in {"mistake", "inaccuracy"}:
        return True
    return False
