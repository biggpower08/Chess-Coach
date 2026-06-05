import { Brain } from 'lucide-react';

type CoachPanelProps = {
  message: string;
  onCoachMove: () => void;
  variation: string[];
  isShowingVariation: boolean;
  onShowVariation: () => void;
  onBackToGame: () => void;
};

export function CoachPanel({
  message,
  onCoachMove,
  variation,
  isShowingVariation,
  onShowVariation,
  onBackToGame
}: CoachPanelProps) {
  return (
    <section className="panel coach-panel">
      <div className="panel-heading">
        <Brain size={18} aria-hidden="true" />
        <h2>Coach Feedback</h2>
      </div>
      <p>{message}</p>
      <div className="coach-actions">
        <button className="secondary-button" onClick={onCoachMove} type="button">
          Coach me on this move
        </button>
        {variation.length > 0 && (
          <button className="secondary-button" onClick={onShowVariation} type="button">
            Show me
          </button>
        )}
        {isShowingVariation && (
          <button className="secondary-button" onClick={onBackToGame} type="button">
            Back to game
          </button>
        )}
      </div>
      {variation.length > 0 && <p className="muted">Line: {variation.slice(0, 6).join(' ')}</p>}
      <p className="badge">Static local coach</p>
    </section>
  );
}
