import type { Chess, Piece, Square } from 'chess.js';

const PIECES: Record<string, string> = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚'
};

type ChessBoardProps = {
  game: Chess;
  orientation: 'white' | 'black';
  selectedSquare: Square | null;
  legalTargets: Square[];
  onSelectSquare: (square: Square) => void;
  onMove: (from: Square, to: Square) => void;
};

export function ChessBoard({
  game,
  orientation,
  selectedSquare,
  legalTargets,
  onSelectSquare,
  onMove
}: ChessBoardProps) {
  const board = game.board();
  const ranks = orientation === 'white' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = orientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  function pieceAt(square: Square): Piece | null {
    return game.get(square) ?? null;
  }

  return (
    <div className="board-panel playable-board" aria-label="Playable chess board">
      {ranks.flatMap((rank) =>
        files.map((file) => {
          const square = `${file}${rank}` as Square;
          const piece = pieceAt(square);
          const isLight = (files.indexOf(file) + ranks.indexOf(rank)) % 2 === 0;
          const isSelected = selectedSquare === square;
          const isTarget = legalTargets.includes(square);
          const boardPiece = piece ? PIECES[`${piece.color}${piece.type}`] : '';

          return (
            <button
              key={square}
              className={[
                'square',
                isLight ? 'light' : 'dark',
                isSelected ? 'selected' : '',
                isTarget ? 'legal-target' : ''
              ].join(' ')}
              data-square={square}
              draggable={Boolean(piece)}
              onClick={() => onSelectSquare(square)}
              onDragStart={(event) => {
                if (!piece) return;
                event.dataTransfer.setData('text/plain', square);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const from = event.dataTransfer.getData('text/plain') as Square;
                if (from) onMove(from, square);
              }}
              type="button"
            >
              <span className="piece">{boardPiece}</span>
              <span className="square-label">{square}</span>
            </button>
          );
        })
      )}
      <span className="sr-only">{board.length} board rows rendered</span>
    </div>
  );
}
