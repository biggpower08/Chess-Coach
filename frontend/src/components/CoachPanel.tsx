import { Brain } from 'lucide-react';

import type { AnalysisResponse } from '../api';

type CoachPanelProps = {
  coach: AnalysisResponse['coach'] | null;
};

export function CoachPanel({ coach }: CoachPanelProps) {
  return (
    <section className="panel coach-panel">
      <div className="panel-heading">
        <Brain size={18} aria-hidden="true" />
        <h2>Coach Feedback</h2>
      </div>
      <p>{coach?.summary ?? 'Your coach summary will appear after analysis.'}</p>
      {coach?.is_mock && <p className="badge">Mock coaching mode</p>}
    </section>
  );
}
