import { Chess, type Move, type Square } from 'chess.js';

export type EvalScore =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number };

export type PositionEvaluation = {
  score: EvalScore;
  depth: number;
  pv: string[];
  source: 'stockfish' | 'material';
};

export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export type ClassifiedMove = {
  move: Move;
  index: number;
  classification: MoveClassification | null;
  evalBefore: PositionEvaluation | null;
  evalAfter: PositionEvaluation | null;
  loss: number | null;
};

export const CLASSIFICATION_THRESHOLDS = {
  brilliantGain: -80,
  greatGain: -30,
  goodLoss: 30,
  inaccuracyLoss: 100,
  mistakeLoss: 250
};

export const OPENING_BOOK: Array<{ moves: string[]; name: string; idea: string }> = [
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], name: 'Ruy Lopez', idea: 'Pressure the e5 pawn while developing smoothly and preparing to castle.' },
  { moves: ['e4', 'c5'], name: 'Sicilian Defense', idea: 'Black fights for the center from the flank and creates an unbalanced game.' },
  { moves: ['e4', 'e6'], name: 'French Defense', idea: 'Black builds a solid pawn chain and challenges White later with ...c5.' },
  { moves: ['d4', 'Nf6', 'c4', 'g6'], name: "King's Indian Defense", idea: 'Black lets White build the center, then attacks it with piece pressure and pawn breaks.' },
  { moves: ['d4', 'd5', 'c4'], name: "Queen's Gambit", idea: 'White offers a wing pawn to pull Black away from the center.' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], name: 'Italian Game', idea: 'White develops quickly and aims at the sensitive f7 square.' },
  { moves: ['e4', 'c6'], name: 'Caro-Kann Defense', idea: 'Black builds a durable center and tries to reach a sound structure.' }
];

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0
};

export function createGameAtMove(moves: Move[], viewIndex: number) {
  const game = new Chess();
  for (let index = 0; index < viewIndex; index += 1) {
    game.move(moves[index].san);
  }
  return game;
}

export function getGameStatus(game: Chess, viewingHistory: boolean, viewIndex: number, total: number) {
  if (viewingHistory) return `Viewing move ${viewIndex} of ${total}`;
  const turn = game.turn() === 'w' ? 'White' : 'Black';
  if (game.isCheckmate()) return `Checkmate. ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
  if (game.isStalemate()) return 'Stalemate. Draw.';
  if (game.isInsufficientMaterial()) return 'Draw by insufficient material.';
  if (game.isDrawByFiftyMoves()) return 'Draw by the fifty-move rule.';
  if (game.isDraw()) return 'Draw.';
  if (game.inCheck()) return `${turn} is in check.`;
  return `${turn} to move.`;
}

export function fallbackEvaluateFen(fen: string): PositionEvaluation {
  const game = new Chess(fen);
  const board = game.board();
  let score = 0;

  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] ?? 0;
      score += piece.color === 'w' ? value : -value;
    }
  }

  if (game.isCheckmate()) {
    const sideToMove = game.turn();
    return {
      score: { type: 'mate', value: sideToMove === 'w' ? -1 : 1 },
      depth: 0,
      pv: [],
      source: 'material'
    };
  }

  return {
    score: { type: 'cp', value: score },
    depth: 0,
    pv: [],
    source: 'material'
  };
}

export function evalToNumber(score: EvalScore) {
  if (score.type === 'mate') {
    return score.value > 0 ? 10000 - score.value : -10000 - score.value;
  }
  return score.value;
}

export function formatEval(score: EvalScore) {
  if (score.type === 'mate') return `${score.value > 0 ? '+' : '-'}M${Math.abs(score.value)}`;
  const pawns = score.value / 100;
  return `${pawns >= 0 ? '+' : ''}${pawns.toFixed(1)}`;
}

export function evalBarPercent(score: EvalScore) {
  if (score.type === 'mate') return score.value > 0 ? 96 : 4;
  const percent = 50 + 50 * (2 / (1 + Math.exp(-score.value / 250)) - 1);
  return Math.max(4, Math.min(96, percent));
}

export function classifyMove(
  before: PositionEvaluation | null,
  after: PositionEvaluation | null,
  isWhiteMove: boolean
): { classification: MoveClassification | null; loss: number | null } {
  if (!before || !after) return { classification: null, loss: null };

  const beforeValue = evalToNumber(before.score);
  const afterValue = evalToNumber(after.score);
  const loss = isWhiteMove ? beforeValue - afterValue : afterValue - beforeValue;

  if (before.score.type === 'mate' && after.score.type !== 'mate') {
    const missedMate = isWhiteMove ? before.score.value > 0 : before.score.value < 0;
    if (missedMate) return { classification: 'blunder', loss };
  }

  if (after.score.type === 'mate') {
    const walkedIntoMate = isWhiteMove ? after.score.value < 0 : after.score.value > 0;
    if (walkedIntoMate) return { classification: 'blunder', loss };
  }

  if (loss <= CLASSIFICATION_THRESHOLDS.brilliantGain) return { classification: 'brilliant', loss };
  if (loss <= CLASSIFICATION_THRESHOLDS.greatGain) return { classification: 'great', loss };
  if (loss <= CLASSIFICATION_THRESHOLDS.goodLoss) return { classification: 'good', loss };
  if (loss <= CLASSIFICATION_THRESHOLDS.inaccuracyLoss) return { classification: 'inaccuracy', loss };
  if (loss <= CLASSIFICATION_THRESHOLDS.mistakeLoss) return { classification: 'mistake', loss };
  return { classification: 'blunder', loss };
}

export function classifyHistory(moves: Move[], evaluations: Array<PositionEvaluation | null>) {
  return moves.map((move, index): ClassifiedMove => {
    const result = classifyMove(evaluations[index] ?? null, evaluations[index + 1] ?? null, index % 2 === 0);
    return {
      move,
      index,
      classification: result.classification,
      evalBefore: evaluations[index] ?? null,
      evalAfter: evaluations[index + 1] ?? null,
      loss: result.loss
    };
  });
}

export function describeMoveForSkill(move: Move, skillLevel: string) {
  if (skillLevel !== 'beginner') return move.san;
  const pieceNames: Record<string, string> = {
    p: 'Pawn',
    n: 'Knight',
    b: 'Bishop',
    r: 'Rook',
    q: 'Queen',
    k: 'King'
  };
  if (move.san === 'O-O') return 'Castles kingside';
  if (move.san === 'O-O-O') return 'Castles queenside';
  const piece = pieceNames[move.piece] ?? 'Piece';
  const action = move.captured ? 'takes on' : 'moves to';
  const suffix = move.san.includes('#') ? ' with checkmate' : move.san.includes('+') ? ' with check' : '';
  return `${piece} ${action} ${move.to}${suffix}`;
}

export function detectOpening(moves: Move[]) {
  const sanMoves = moves.map((move) => move.san.replace(/[+#?!]+/g, ''));
  let best = OPENING_BOOK[0];
  let bestScore = 0;

  for (const opening of OPENING_BOOK) {
    const score = opening.moves.reduce((count, move, index) => {
      return sanMoves[index] === move ? count + 1 : count;
    }, 0);
    if (score > bestScore) {
      best = opening;
      bestScore = score;
    }
  }

  if (bestScore < 2) {
    return {
      name: 'Unidentified opening',
      idea: 'Develop pieces, contest the center, and keep your king safe.',
      confidence: 'low' as const
    };
  }

  return { ...best, confidence: bestScore >= best.moves.length ? 'high' as const : 'partial' as const };
}

export function detectPhase(game: Chess) {
  const board = game.board();
  let nonPawnMaterial = 0;
  let queens = 0;

  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      if (piece.type === 'q') queens += 1;
      if (piece.type !== 'p' && piece.type !== 'k') nonPawnMaterial += 1;
    }
  }

  if (nonPawnMaterial <= 6 || queens === 0) {
    return {
      phase: 'endgame',
      note: 'Endgame principles matter now: king activity, passed pawns, and clean conversion.'
    };
  }

  if (game.moveNumber() <= 10) {
    return {
      phase: 'opening',
      note: 'Opening priorities: develop, castle, and fight for central squares.'
    };
  }

  return {
    phase: 'middlegame',
    note: 'Middlegame priorities: improve your worst piece, calculate forcing moves, and pick a plan.'
  };
}

export function shouldAutoCoach(move: ClassifiedMove | null, phase: string) {
  if (!move?.classification) return false;
  if (move.classification === 'brilliant' || move.classification === 'great') return true;
  if (move.classification === 'inaccuracy') return true;
  if (phase === 'endgame' && ['mistake', 'inaccuracy'].includes(move.classification)) return true;
  return false;
}

export function buildGameReport(moves: ClassifiedMove[]) {
  const counts = {
    brilliant: 0,
    great: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0
  };

  for (const move of moves) {
    if (move.classification) counts[move.classification] += 1;
  }

  const total = moves.filter((move) => move.classification).length || 1;
  const accuracy =
    ((counts.brilliant * 1 + counts.great * 0.95 + counts.good * 0.85 + counts.inaccuracy * 0.6 + counts.mistake * 0.35) /
      total) *
    100;

  const recurringMistakes = [
    counts.blunder + counts.mistake > 0 ? 'Large tactical swings: slow down before forcing replies.' : '',
    counts.inaccuracy > 2 ? 'Small positional slips: improve worst piece before committing pawns.' : '',
    counts.good + counts.great + counts.brilliant > total * 0.65 ? 'Stable decision-making: most moves kept the evaluation under control.' : ''
  ].filter(Boolean);

  return {
    counts,
    accuracy: Math.round(accuracy),
    recurringMistakes,
    topLessons: recurringMistakes.length
      ? recurringMistakes
      : ['Keep building the habit of comparing candidate moves before committing.']
  };
}
