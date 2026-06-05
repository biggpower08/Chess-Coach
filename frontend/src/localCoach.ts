import { formatEval, type ClassifiedMove, type PositionEvaluation } from './chessLogic';

type CoachInput = {
  currentMove: ClassifiedMove | null;
  evaluation: PositionEvaluation | null;
  skillLevel: string;
  status: string;
  openingName?: string;
  phase?: string;
  phaseNote?: string;
};

export function generateLocalCoachText({
  currentMove,
  evaluation,
  skillLevel,
  status,
  openingName,
  phase,
  phaseNote
}: CoachInput) {
  const evalText = evaluation ? formatEval(evaluation.score) : 'unknown';
  const source = evaluation?.source === 'stockfish' ? 'Stockfish' : 'material fallback';
  const bestLine = evaluation?.pv?.slice(0, 4).join(' ') || 'no clear line yet';

  if (!currentMove) {
    if (skillLevel === 'beginner') {
      return `Position read: ${status}. The local eval is ${evalText}. In ${openingName ?? 'this opening'}, keep the simple checklist: safe king, active pieces, and no loose pieces. ${phaseNote ?? ''}`;
    }
    return `Position read: ${status}. ${source} evaluation is ${evalText}. Phase: ${phase ?? 'unknown'}. Candidate line: ${bestLine}. Start with forcing moves, king safety, and loose pieces before choosing a plan.`;
  }

  const label = currentMove.classification ?? 'unclassified';
  const swing = currentMove.loss === null ? '' : ` The eval swing was about ${(currentMove.loss / 100).toFixed(1)} pawns from the mover's perspective.`;
  const betterIdea =
    bestLine !== 'no clear line yet'
      ? `A better idea to inspect is the engine line: ${bestLine}.`
      : 'A better idea is to compare two candidate moves before choosing.';
  const concept =
    phase === 'endgame'
      ? 'Endgame concept: king activity and passed pawns often matter more than one flashy tactic.'
      : phase === 'opening'
        ? 'Opening concept: finish development before chasing side quests.'
        : 'Middlegame concept: improve your worst piece and check forcing replies.';

  if (skillLevel === 'beginner') {
    if (label === 'blunder' || label === 'mistake') {
      return `${currentMove.move.san} was a ${label}.${swing} What happened: the position changed too much in the opponent's favor. Why it matters: they may win material or get a direct threat. Better idea: pause and ask what they can take next. ${concept}`;
    }
    if (label === 'inaccuracy') {
      return `${currentMove.move.san} was a small slip.${swing} What happened: nothing exploded, but your position became a little harder to play. Better idea: improve a piece or protect the king before changing the pawn structure.`;
    }
    return `${currentMove.move.san} looks healthy. Why it matters: you kept the position stable. Keep building with safe king, active pieces, and pawns that support your plan.`;
  }

  if (skillLevel === 'advanced') {
    return `${currentMove.move.san}: ${label}. Eval after the move is ${evalText}.${swing} ${betterIdea} Diagnose whether the issue was tactical, positional, or a missed forcing continuation. ${concept}`;
  }

  return `${currentMove.move.san} is classified as ${label}. Eval now: ${evalText}.${swing} What happened: the move changed the practical demands of the position. Why it matters: your opponent's most active reply may matter more than your plan. ${betterIdea} ${concept}`;
}
