type PgnImportProps = {
  pgn: string;
  error: string | null;
  onChange: (pgn: string) => void;
};

export function PgnImport({ pgn, error, onChange }: PgnImportProps) {
  return (
    <section className="import-panel">
      <label htmlFor="pgn-input">PGN import</label>
      <textarea
        id="pgn-input"
        value={pgn}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
      />
      {error && <p className="error">{error}</p>}
    </section>
  );
}
