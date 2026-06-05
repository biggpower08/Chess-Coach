from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.ai.openai_coach import get_coach_response
from app.chess.analysis import classify_moves_placeholder
from app.chess.pgn_parser import PgnParseError, parse_pgn
from app.models import (
    CoachingContext,
    CoachGameRequest,
    PlayerProfileResponse,
    PgnAnalysisRequest,
    PgnAnalysisResponse,
)

app = FastAPI(title="Personal Chess Coach AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "personal-chess-coach-ai"}


@app.post("/api/analyze-pgn", response_model=PgnAnalysisResponse)
async def analyze_pgn(request: PgnAnalysisRequest) -> PgnAnalysisResponse:
    try:
        metadata, san_moves = parse_pgn(request.pgn)
    except PgnParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    move_classifications = classify_moves_placeholder(san_moves)
    context = CoachingContext(
        task="pgn_analysis",
        player_id=request.player_id,
        metadata=metadata,
        san_moves=san_moves,
        move_classifications=move_classifications,
    )
    coach = await get_coach_response(context)

    return PgnAnalysisResponse(
        move_count=len(san_moves),
        san_moves=san_moves,
        metadata=metadata,
        white_player=metadata.white,
        black_player=metadata.black,
        result=metadata.result,
        move_classifications=move_classifications,
        coach=coach,
    )


@app.post("/api/coach-game")
async def coach_game(request: CoachGameRequest):
    context = CoachingContext(
        task="coach_game",
        player_id=request.player_id,
        metadata=request.metadata,
        san_moves=request.san_moves,
        move_classifications=request.move_classifications,
        question=request.question,
    )
    return await get_coach_response(context)


@app.get("/api/player-profile/{player_id}", response_model=PlayerProfileResponse)
async def get_player_profile(player_id: str) -> PlayerProfileResponse:
    return PlayerProfileResponse(
        player_id=player_id,
        strengths=[
            "Willingness to review full games rather than only final mistakes."
        ],
        weaknesses=[
            "Recurring weaknesses will be learned after game history is stored."
        ],
        suggested_training_focus=[
            "Import three recent games.",
            "Review repeated opening and tactical patterns.",
        ],
        note="Database-backed player memory is planned for a later phase.",
    )
