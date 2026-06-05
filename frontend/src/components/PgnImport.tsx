type PgnImportProps = {
  pgn: string;
  error: string | null;
  onChange: (pgn: string) => void;
  onLoad: () => void;
};

export function PgnImport({ pgn, error, onChange, onLoad }: PgnImportProps) {
  return (
    <section className="import-panel">
      <label htmlFor="pgn-input">PGN import</label>
      <textarea
        id="pgn-input"
        value={pgn}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
      />
      <button className="secondary-button" onClick={onLoad} type="button">
        Load Game
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
