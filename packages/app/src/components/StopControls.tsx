import { reversed } from 'color-curves';
import { useAppStore } from '../state/store';
import { useThrottledStore } from '../state/useThrottled';

export function StopControls() {
  const display = useAppStore((s) => s.display);
  const range = useThrottledStore((s) => s.doc.range, 100);
  const state = useAppStore.getState();
  const [r0, r1] = range ?? [0, 1];

  const setRange = (start: number, end: number) => {
    state.updateDoc((d) => {
      const a = Math.min(Math.max(0, start), end - 0.02);
      const b = Math.max(Math.min(1, end), start + 0.02);
      if (a <= 0 && b >= 1) {
        if (!d.range) return d;
        const out = { ...d };
        delete out.range;
        return out;
      }
      return { ...d, range: [a, b] };
    });
  };

  return (
    <div className="stop-controls">
      <div className="segmented" role="group" aria-label="Palette type">
        <button
          className={display.mode === 'continuous' ? 'is-active' : ''}
          onClick={() => state.setDisplay({ mode: 'continuous' })}
        >
          Continuous
        </button>
        <button
          className={display.mode === 'discrete' ? 'is-active' : ''}
          onClick={() => state.setDisplay({ mode: 'discrete' })}
        >
          Discrete
        </button>
      </div>

      <label className="field">
        <span>Stops</span>
        <input
          type="number"
          min={2}
          max={64}
          value={display.count}
          disabled={display.mode !== 'discrete'}
          onChange={(e) => {
            const v = Math.round(Number(e.target.value));
            if (Number.isFinite(v)) state.setDisplay({ count: Math.min(64, Math.max(2, v)) });
          }}
        />
      </label>

      <label className="field">
        <span>Start</span>
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={Number(r0.toFixed(2))}
          onChange={(e) => setRange(Number(e.target.value), r1)}
        />
      </label>
      <label className="field">
        <span>End</span>
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={Number(r1.toFixed(2))}
          onChange={(e) => setRange(r0, Number(e.target.value))}
        />
      </label>

      <button
        className="button"
        title="Reverse the palette"
        onClick={() => state.updateDoc((d) => reversed(d))}
      >
        ⇆ Reverse
      </button>
    </div>
  );
}
