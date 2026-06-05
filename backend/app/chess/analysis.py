from app.models import MoveClassification


def classify_moves_placeholder(san_moves: list[str]) -> list[MoveClassification]:
    labels = ["good", "inaccuracy", "mistake", "blunder"]
    classifications: list[MoveClassification] = []
    for index, san in enumerate(san_moves):
        # Temporary deterministic labels; real Stockfish analysis will replace this.
        classifications.append(
            MoveClassification(
                move_number=(index // 2) + 1,
                san=san,
                side="white" if index % 2 == 0 else "black",
                classification=labels[index % len(labels)],
            )
        )
    return classifications
