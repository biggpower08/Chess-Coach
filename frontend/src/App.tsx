import { Brain } from 'lucide-react';
import { useMemo, useState } from 'react';

import { analyzePgn, type AnalysisResponse } from './api';
import { ChessBoardPlaceholder } from './components/ChessBoardPlaceholder';
import { CoachPanel } from './components/CoachPanel';
import { MoveList } from './components/MoveList';
import { PgnImport } from './components/PgnImport';
import { PlayerProfile } from './components/PlayerProfile';
import { TrainingPlan } from './components/TrainingPlan';

const samplePgn = `[Event "Friendly"]
[Site "Local"]
[Date "2026.06.05"]
[White "Player"]
[Black "Opponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`;

export function App() {
  const [pgn, setPgn] = useState(samplePgn);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!analysis) return 'Personalized Chess Coach AI';
    const white = analysis.white_player ?? 'White';
    const black = analysis.black_player ?? 'Black';
    return `${white} vs ${black}`;
  }, [analysis]);

  async function handleAnalyzeGame() {
    setIsAnalyzing(true);
    setError(null);

    try {
      setAnalysis(await analyzePgn(pgn));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Personalized Chess Coach AI</p>
            <h1>{title}</h1>
          </div>
          <button onClick={handleAnalyzeGame} disabled={isAnalyzing || !pgn.trim()}>
            <Brain size={18} aria-hidden="true" />
            {isAnalyzing ? 'Analyzing' : 'Analyze Game'}
          </button>
        </header>

        <section className="analysis-grid">
          <ChessBoardPlaceholder />
          <PgnImport pgn={pgn} error={error} onChange={setPgn} />
          <MoveList moves={analysis?.san_moves ?? []} />
          <CoachPanel coach={analysis?.coach ?? null} />
          <PlayerProfile />
          <TrainingPlan items={analysis?.coach.suggested_training ?? []} />
        </section>
      </section>
    </main>
  );
}
