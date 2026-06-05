export function ChessBoardPlaceholder() {
  return (
    <div className="board-panel" aria-label="Chess board placeholder">
      {Array.from({ length: 64 }).map((_, index) => (
        <span
          key={index}
          className={(Math.floor(index / 8) + index) % 2 === 0 ? 'light' : 'dark'}
        />
      ))}
      <div className="board-overlay">Board playback coming next</div>
    </div>
  );
}
