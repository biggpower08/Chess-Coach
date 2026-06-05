import { Chess, type Move, type Square } from 'chess.js';
import {
  Brain,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  FlipHorizontal2,
  Moon,
  RotateCcw,
  StepBack,
  Sun
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  classifyHistory,
  createGameAtMove,
  getGameStatus,
  squareFromDrag,
  type PositionEvaluation
} from './chessLogic';
import { BrowserEngine, type EngineStatus } from './engine';
import { generateLocalCoachText } from './localCoach';
import { ChessBoard } from './components/ChessBoard';
import { CoachPanel } from './components/CoachPanel';
import { EngineSettings } from './components/EngineSettings';
import { EvalBar } from './components/EvalBar';
import { MoveList } from './components/MoveList';
import { PgnImport } from './components/PgnImport';
import { PlayerProfile } from './components/PlayerProfile';
import { Toast } from './components/Toast';
import { TrainingPlan } from './components/TrainingPlan';

const samplePgn = `[Event "Friendly"]
[Site "Local"]
[Date "2026.06.05"]
[White "Player"]
[Black "Opponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`;

const DEFAULT_COACH =
  'Play, import, or replay a game. The static coach uses local board state and engine/material analysis only.';

export function App() {
  const [game, setGame] = useState(() => new Chess());
  const [history, setHistory] = useState<Move[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pgn, setPgn] = useState(samplePgn);
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Array<PositionEvaluation | null>>([]);
  const [engineStatus, setEngineStatus] = useState<{ status: EngineStatus; message: string }>({
    status: 'loading',
    message: 'Engine loading...'
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('chess-coach-engine-settings');
    return saved ? JSON.parse(saved) as { depth: number; multiPV: number } : { depth: 12, multiPV: 1 };
  });
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [theme, setTheme] = useState(() => localStorage.getItem('chess-coach-theme') ?? 'light');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coachMessage, setCoachMessage] = useState(DEFAULT_COACH);
  const [toast, setToast] = useState<string | null>(null);
  const engineRef = useRef<BrowserEngine | null>(null);

  const viewingHistory = viewIndex < history.length;
  const viewedGame = useMemo(() => createGameAtMove(history, viewIndex), [history, viewIndex]);
  const activeGame = viewingHistory ? viewedGame : game;
  const status = getGameStatus(activeGame, viewingHistory, viewIndex, history.length);
  const classifiedMoves = useMemo(() => classifyHistory(history, evaluations), [history, evaluations]);
  const currentEvaluation = evaluations[viewIndex] ?? null;
  const currentMove = viewIndex > 0 ? classifiedMoves[viewIndex - 1] ?? null : null;

  const legalTargets = useMemo(() => {
    if (!selectedSquare || viewingHistory) return [];
    return activeGame.moves({ square: selectedSquare, verbose: true }).map((move) => move.to as Square);
  }, [activeGame, selectedSquare, viewingHistory]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('chess-coach-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chess-coach-engine-settings', JSON.stringify(settings));
    engineRef.current?.configure(settings.depth, settings.multiPV);
  }, [settings]);

  useEffect(() => {
    const engine = new BrowserEngine((statusValue, message) => {
      setEngineStatus({ status: statusValue, message });
    });
    engine.configure(settings.depth, settings.multiPV);
    engine.init();
    engineRef.current = engine;
    void analyzePosition(new Chess().fen(), 0);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function analyzePosition(fen: string, index: number) {
    const evaluation = await engineRef.current?.analyze(fen);
    if (!evaluation) return;
    setEvaluations((previous) => {
      const next = [...previous];
      next[index] = evaluation;
      return next;
    });
  }

  async function analyzeFullGame(moves = history) {
    const runner = new Chess();
    const positions = [runner.fen()];
    for (const move of moves) {
      runner.move(move.san);
      positions.push(runner.fen());
    }
    setToast(`Analyzing ${positions.length} positions...`);
    for (let index = 0; index < positions.length; index += 1) {
      await analyzePosition(positions[index], index);
    }
    setToast('Game analysis complete');
  }

  function showToast(message: string) {
    setToast(message);
  }

  function commitGame(nextGame: Chess, nextHistory: Move[], nextViewIndex = nextHistory.length) {
    setGame(nextGame);
    setHistory(nextHistory);
    setViewIndex(nextViewIndex);
    setSelectedSquare(null);
  }

  function handleMove(from: Square, to: Square) {
    if (viewingHistory) {
      showToast('Jump to the latest move before playing.');
      return;
    }

    const nextGame = new Chess(game.fen());
    const move = nextGame.move({ from, to, promotion: 'q' });
    if (!move) {
      showToast('Illegal move');
      return;
    }

    const nextHistory = [...history, move];
    commitGame(nextGame, nextHistory);
    void analyzePosition(nextGame.fen(), nextHistory.length);
  }

  function handleSelectSquare(square: Square) {
    if (viewingHistory) return;
    const piece = game.get(square);

    if (selectedSquare) {
      if (legalTargets.includes(square)) {
        handleMove(selectedSquare, square);
        return;
      }
      setSelectedSquare(null);
    }

    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    }
  }

  function goToMove(index: number) {
    const nextIndex = Math.max(0, Math.min(index, history.length));
    setViewIndex(nextIndex);
    setSelectedSquare(null);
  }

  function resetGame() {
    commitGame(new Chess(), [], 0);
    setEvaluations([]);
    setCoachMessage(DEFAULT_COACH);
    void analyzePosition(new Chess().fen(), 0);
  }

  function undoMove() {
    if (viewingHistory) {
      goToMove(history.length);
      return;
    }
    const nextHistory = history.slice(0, -1);
    const nextGame = createGameAtMove(nextHistory, nextHistory.length);
    commitGame(nextGame, nextHistory);
    setEvaluations((previous) => previous.slice(0, nextHistory.length + 1));
  }

  function loadPgn() {
    try {
      const imported = new Chess();
      imported.loadPgn(pgn.trim());
      const importedHistory = imported.history({ verbose: true });
      if (importedHistory.length === 0) throw new Error('PGN did not contain any legal moves.');
      setPgnError(null);
      commitGame(imported, importedHistory);
      setEvaluations([]);
      setCoachMessage('Game loaded. Use the move list and navigation buttons to review it.');
      void analyzeFullGame(importedHistory);
    } catch (error) {
      setPgnError(error instanceof Error ? error.message : 'Could not parse PGN.');
    }
  }

  async function exportPgn() {
    const exportGame = createGameAtMove(history, history.length);
    const exported = exportGame.pgn();
    if (!exported) {
      showToast('No moves to export');
      return;
    }
    setPgn(exported);
    try {
      await navigator.clipboard.writeText(exported);
      showToast('PGN copied to clipboard');
    } catch {
      showToast('PGN exported to the textarea');
    }
  }

  function coachCurrentMove() {
    setCoachMessage(
      generateLocalCoachText({
        currentMove,
        evaluation: currentEvaluation,
        skillLevel,
        status
      })
    );
  }

  const title = history.length > 0 ? 'Reviewing game' : 'Personalized Chess Coach AI';

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Personalized Chess Coach AI</p>
            <h1>{title}</h1>
            <p className={`game-status ${engineStatus.status}`}>{status}</p>
          </div>
          <div className="top-actions">
            <select value={skillLevel} onChange={(event) => setSkillLevel(event.target.value)} aria-label="Skill level">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle theme" type="button">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <EngineSettings
              depth={settings.depth}
              isOpen={settingsOpen}
              multiPV={settings.multiPV}
              onChange={setSettings}
              onClose={() => setSettingsOpen(false)}
              onOpen={() => setSettingsOpen(true)}
            />
          </div>
        </header>

        <section className="analysis-grid">
          <section className="board-area">
            <EvalBar evaluation={currentEvaluation} />
            <ChessBoard
              game={activeGame}
              legalTargets={legalTargets}
              onMove={handleMove}
              onSelectSquare={handleSelectSquare}
              orientation={orientation}
              selectedSquare={selectedSquare}
            />
            <div className="board-controls">
              <button onClick={() => setOrientation(orientation === 'white' ? 'black' : 'white')} type="button">
                <FlipHorizontal2 size={17} /> Flip
              </button>
              <button onClick={() => goToMove(0)} type="button"><ChevronFirst size={17} /> First</button>
              <button onClick={() => goToMove(viewIndex - 1)} type="button"><ChevronLeft size={17} /> Prev</button>
              <button onClick={() => goToMove(viewIndex + 1)} type="button"><ChevronRight size={17} /> Next</button>
              <button onClick={() => goToMove(history.length)} type="button"><ChevronLast size={17} /> Last</button>
              <button onClick={undoMove} type="button"><StepBack size={17} /> Undo</button>
              <button onClick={resetGame} type="button"><RotateCcw size={17} /> Reset</button>
            </div>
            <p className={`engine-status ${engineStatus.status}`}>{engineStatus.message}</p>
          </section>

          <PgnImport pgn={pgn} error={pgnError} onChange={setPgn} onLoad={loadPgn} />

          <section className="panel pgn-actions">
            <button onClick={exportPgn} type="button">
              <Clipboard size={18} /> Export / Copy PGN
            </button>
            <button onClick={() => void analyzeFullGame()} type="button">
              <Brain size={18} /> Analyze Full Game
            </button>
          </section>

          <MoveList
            moves={classifiedMoves}
            onGoToMove={goToMove}
            skillLevel={skillLevel}
            viewIndex={viewIndex}
          />
          <CoachPanel message={coachMessage} onCoachMove={coachCurrentMove} />
          <PlayerProfile />
          <TrainingPlan items={currentMove?.classification ? [`Study this ${currentMove.classification}`, 'Compare your move to the engine line'] : []} />
        </section>
      </section>
      <Toast message={toast} />
    </main>
  );
}
