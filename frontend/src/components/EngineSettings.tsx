import { SlidersHorizontal } from 'lucide-react';

type EngineSettingsProps = {
  depth: number;
  multiPV: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (settings: { depth: number; multiPV: number }) => void;
};

export function EngineSettings({
  depth,
  multiPV,
  isOpen,
  onOpen,
  onClose,
  onChange
}: EngineSettingsProps) {
  return (
    <>
      <button className="icon-button" onClick={onOpen} title="Engine settings" type="button">
        <SlidersHorizontal size={18} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
          <section className="settings-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <h2>Engine Settings</h2>
            <label>
              Analysis depth: {depth}
              <input
                max={18}
                min={6}
                onChange={(event) => onChange({ depth: Number(event.target.value), multiPV })}
                type="range"
                value={depth}
              />
            </label>
            <label>
              Lines: {multiPV}
              <input
                max={3}
                min={1}
                onChange={(event) => onChange({ depth, multiPV: Number(event.target.value) })}
                type="range"
                value={multiPV}
              />
            </label>
            <button onClick={onClose} type="button">Done</button>
          </section>
        </div>
      )}
    </>
  );
}
