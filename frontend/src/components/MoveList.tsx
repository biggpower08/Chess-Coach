import { ClipboardList } from 'lucide-react';

import { describeMoveForSkill, type ClassifiedMove } from '../chessLogic';

type MoveListProps = {
  moves: ClassifiedMove[];
  viewIndex: number;
  skillLevel: string;
  onGoToMove: (index: number) => void;
};

const ICONS: Record<string, string> = {
  brilliant: '!!',
  great: '!',
  good: '✓',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??'
};

export function MoveList({ moves, viewIndex, skillLevel, onGoToMove }: MoveListProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <ClipboardList size={18} aria-hidden="true" />
        <h2>Move List</h2>
      </div>
      <div className="move-list">
        {moves.map((item) => (
          <button
            key={`${item.move.san}-${item.index}`}
            className={[
              'move-pill',
              viewIndex === item.index + 1 ? 'active' : '',
              item.classification ? `move-${item.classification}` : ''
            ].join(' ')}
            onClick={() => onGoToMove(item.index + 1)}
            type="button"
          >
            {item.index % 2 === 0 ? `${Math.floor(item.index / 2) + 1}. ` : ''}
            {describeMoveForSkill(item.move, skillLevel)}
            {item.classification && <strong>{ICONS[item.classification]}</strong>}
          </button>
        ))}
        {moves.length === 0 && <p className="muted">Parsed SAN moves will appear here.</p>}
      </div>
    </section>
  );
}
