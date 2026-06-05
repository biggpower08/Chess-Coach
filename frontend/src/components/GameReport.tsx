type Counts = {
  brilliant: number;
  great: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
};

type GameReportProps = {
  report: {
    counts: Counts;
    accuracy: number;
    recurringMistakes: string[];
    topLessons: string[];
  };
  opening: { name: string; idea: string; confidence: string };
  phase: { phase: string; note: string };
};

export function GameReport({ report, opening, phase }: GameReportProps) {
  return (
    <section className="panel report-panel">
      <div className="panel-heading">
        <h2>Game Report</h2>
        <span className="badge neon-badge">{report.accuracy}% accuracy</span>
      </div>
      <div className="report-grid">
        {Object.entries(report.counts).map(([label, count]) => (
          <span key={label} className={`report-chip move-${label}`}>
            {label}: {count}
          </span>
        ))}
      </div>
      <p><strong>{opening.name}</strong>: {opening.idea}</p>
      <p><strong>{phase.phase}</strong>: {phase.note}</p>
      <ul>
        {report.topLessons.map((lesson) => (
          <li key={lesson}>{lesson}</li>
        ))}
      </ul>
    </section>
  );
}
