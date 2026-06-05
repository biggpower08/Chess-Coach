import { Brain } from 'lucide-react';

type CoachPanelProps = {
  message: string;
  onCoachMove: () => void;
};

export function CoachPanel({ message, onCoachMove }: CoachPanelProps) {
  return (
    <section className="panel coach-panel">
      <div className="panel-heading">
        <Brain size={18} aria-hidden="true" />
        <h2>Coach Feedback</h2>
      </div>
      <p>{message}</p>
      <button className="secondary-button" onClick={onCoachMove} type="button">
        Coach me on this move
      </button>
      <p className="badge">Static local coach</p>
    </section>
  );
}
