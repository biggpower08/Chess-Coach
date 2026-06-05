import { ClipboardList } from 'lucide-react';

type MoveListProps = {
  moves: string[];
};

export function MoveList({ moves }: MoveListProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <ClipboardList size={18} aria-hidden="true" />
        <h2>Move List</h2>
      </div>
      <div className="move-list">
        {moves.map((move, index) => (
          <span key={`${move}-${index}`}>
            {index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ''}
            {move}
          </span>
        ))}
        {moves.length === 0 && <p className="muted">Parsed SAN moves will appear here.</p>}
      </div>
    </section>
  );
}
