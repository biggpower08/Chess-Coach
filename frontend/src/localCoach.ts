import { formatEval, type ClassifiedMove, type PositionEvaluation } from './chessLogic';

type CoachInput = {
  currentMove: ClassifiedMove | null;
  evaluation: PositionEvaluation | null;
  skillLevel: string;
  status: string;
};

export function generateLocalCoachText({ currentMove, evaluation, skillLevel, status }: CoachInput) {
  const evalText = evaluation ? formatEval(evaluation.score) : 'unknown';
  const source = evaluation?.source === 'stockfish' ? 'Stockfish' : 'material fallback';

  if (!currentMove) {
    if (skillLevel === 'beginner') {
      return `You are at the current position. The board status is: ${status}. The local eval is ${evalText}. Look first for checks, captures, and pieces that are not defended.`;
    }
    return `Position read: ${status}. ${source} evaluation is ${evalText}. Start with forcing moves, king safety, and loose pieces before choosing a plan.`;
  }

  const label = currentMove.classification ?? 'unclassified';
  const swing = currentMove.loss === null ? '' : ` The eval swing was about ${(currentMove.loss / 100).toFixed(1)} pawns from the mover's perspective.`;

  if (skillLevel === 'beginner') {
    if (label === 'blunder' || label === 'mistake') {
      return `${currentMove.move.san} was marked as a ${label}.${swing} That usually means something important became loose or the opponent got a strong threat. Before moving, ask: what can they take next?`;
    }
    if (label === 'inaccuracy') {
      return `${currentMove.move.san} was a small slip.${swing} The position is still playable, but there may have been a clearer move that improved a piece or protected the king.`;
    }
    return `${currentMove.move.san} looks healthy. Keep building: safe king, active pieces, and pawns that support your plan.`;
  }

  if (skillLevel === 'advanced') {
    return `${currentMove.move.san}: ${label}. Eval after the move is ${evalText}.${swing} Use the PV and candidate-move comparison to decide whether the issue was tactical, positional, or a missed forcing continuation.`;
  }

  return `${currentMove.move.san} is classified as ${label}. Eval now: ${evalText}.${swing} The lesson is to compare your intended plan against forcing replies and the opponent's most active resource.`;
}
