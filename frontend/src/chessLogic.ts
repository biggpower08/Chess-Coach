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

export function squareFromDrag(value: string | null): Square | null {
  if (!value || !/^[a-h][1-8]$/.test(value)) return null;
  return value as Square;
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
