from typing import Literal

from pydantic import BaseModel, Field


class GameMetadata(BaseModel):
    event: str | None = None
    site: str | None = None
    date: str | None = None
    round: str | None = None
    white: str | None = None
    black: str | None = None
    result: str | None = None


class MoveClassification(BaseModel):
    move_number: int
    san: str
    side: Literal["white", "black"]
    classification: str = "unreviewed"
    note: str = "Engine-backed classification will be added in a later phase."


class PgnAnalysisRequest(BaseModel):
    pgn: str = Field(..., min_length=1)
    player_id: str | None = None


class CoachGameRequest(BaseModel):
    player_id: str | None = None
    metadata: GameMetadata | None = None
    san_moves: list[str] = Field(default_factory=list)
    move_classifications: list[MoveClassification] = Field(default_factory=list)
    question: str | None = None


class CoachingContext(BaseModel):
    task: str
    player_id: str | None = None
    metadata: GameMetadata | None = None
    san_moves: list[str] = Field(default_factory=list)
    fen: str | None = None
    question: str | None = None
    move_classifications: list[MoveClassification] = Field(default_factory=list)


class CoachingResponse(BaseModel):
    provider: str
    summary: str
    key_takeaways: list[str] = Field(default_factory=list)
    suggested_training: list[str] = Field(default_factory=list)
    is_mock: bool = False


class PgnAnalysisResponse(BaseModel):
    move_count: int
    san_moves: list[str]
    metadata: GameMetadata
    white_player: str | None = None
    black_player: str | None = None
    result: str | None = None
    move_classifications: list[MoveClassification]
    coach: CoachingResponse


class PlayerProfileResponse(BaseModel):
    player_id: str
    strengths: list[str]
    weaknesses: list[str]
    suggested_training_focus: list[str]
    note: str
