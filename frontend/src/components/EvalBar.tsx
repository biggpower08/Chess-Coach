import { evalBarPercent, formatEval, type PositionEvaluation } from '../chessLogic';

type EvalBarProps = {
  evaluation: PositionEvaluation | null;
};

export function EvalBar({ evaluation }: EvalBarProps) {
  const percent = evaluation ? evalBarPercent(evaluation.score) : 50;
  const label = evaluation ? formatEval(evaluation.score) : '0.0';

  return (
    <div className="eval-wrap" aria-label={`Evaluation ${label}`}>
      <div className="eval-bar">
        <span className="eval-fill" style={{ height: `${percent}%` }} />
      </div>
      <strong>{label}</strong>
    </div>
  );
}
