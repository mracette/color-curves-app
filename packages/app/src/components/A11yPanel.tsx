import { contrastAPCA, contrastWCAG, deltaEOK, type RGB } from 'color-curves';
import { useAppStore, type CvdSetting } from '../state/store';
import { useThrottledStore } from '../state/useThrottled';
import { getSamples, type PaletteSample } from '../state/selectors';

const WHITE: RGB = { r: 1, g: 1, b: 1 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };
const MAX_MATRIX = 16;
const JND = 0.02;

const CVD_OPTIONS: { id: CvdSetting; label: string }[] = [
  { id: 'none', label: 'Off' },
  { id: 'protan', label: 'Protanopia' },
  { id: 'deutan', label: 'Deuteranopia' },
  { id: 'tritan', label: 'Tritanopia' },
];

function wcagClass(ratio: number): string {
  if (ratio >= 4.5) return 'is-pass';
  if (ratio >= 3) return 'is-warn';
  return 'is-fail';
}

function apcaClass(lc: number): string {
  const abs = Math.abs(lc);
  if (abs >= 60) return 'is-pass';
  if (abs >= 45) return 'is-warn';
  return 'is-fail';
}

function ContrastMatrix({
  samples,
  mode,
}: {
  samples: PaletteSample[];
  mode: 'wcag' | 'apca';
}) {
  // Columns: backgrounds (white, black, then stops). Rows: text colors (stops).
  const backgrounds: { label: string; rgb: RGB; hex: string }[] = [
    { label: 'on white', rgb: WHITE, hex: '#ffffff' },
    { label: 'on black', rgb: BLACK, hex: '#000000' },
    ...samples.map((s, i) => ({ label: `on ${i + 1}`, rgb: s.rgb, hex: s.hex })),
  ];
  return (
    <div className="a11y-matrix-scroll">
      <table className="a11y-matrix">
        <thead>
          <tr>
            <th />
            {backgrounds.map((bg, i) => (
              <th key={i}>
                <span className="a11y-matrix__chip" style={{ background: bg.hex }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {samples.map((row, ri) => (
            <tr key={ri}>
              <th>
                <span className="a11y-matrix__chip" style={{ background: row.hex }} />
              </th>
              {backgrounds.map((bg, ci) => {
                if (ci >= 2 && ci - 2 === ri) {
                  return <td key={ci} className="a11y-matrix__cell is-self">—</td>;
                }
                const value =
                  mode === 'wcag' ? contrastWCAG(row.rgb, bg.rgb) : contrastAPCA(row.rgb, bg.rgb);
                const cls = mode === 'wcag' ? wcagClass(value) : apcaClass(value);
                const display = mode === 'wcag' ? value.toFixed(1) : Math.round(value).toString();
                return (
                  <td
                    key={ci}
                    className={`a11y-matrix__cell ${cls}`}
                    style={{ background: bg.hex, color: row.hex }}
                    title={`text ${row.hex} ${bg.label}: ${mode === 'wcag' ? `${value.toFixed(2)}:1` : `Lc ${value.toFixed(1)}`}`}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function A11yPanel() {
  const doc = useThrottledStore((s) => s.doc, 150);
  const display = useAppStore((s) => s.display);
  const cvd = useAppStore((s) => s.cvd);
  const contrastMode = useAppStore((s) => s.contrastMode);
  const state = useAppStore.getState;

  const matrixReady = display.mode === 'discrete' && display.count <= MAX_MATRIX;
  const samples = matrixReady ? getSamples(doc, display.count, cvd) : [];

  // Adjacent-stop distinguishability always uses the discrete count (capped).
  const checkCount = Math.min(display.count, MAX_MATRIX);
  const checkSamples = getSamples(doc, checkCount, cvd);
  const nearPairs: { a: number; b: number; d: number }[] = [];
  for (let i = 0; i < checkSamples.length - 1; i++) {
    const d = deltaEOK(checkSamples[i]!.rgb, checkSamples[i + 1]!.rgb);
    if (d < JND) nearPairs.push({ a: i + 1, b: i + 2, d });
  }

  return (
    <div className="a11y-panel">
      <div className="a11y-panel__section">
        <div className="a11y-panel__title">Color vision simulation</div>
        <div className="segmented segmented--wrap">
          {CVD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={cvd === opt.id ? 'is-active' : ''}
              onClick={() => state().setCvd(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {cvd !== 'none' && (
          <p className="a11y-panel__note">
            Previews and the palette bar are simulated. The editing surfaces always show true
            colors, and exports are never simulated.
          </p>
        )}
      </div>

      <div className="a11y-panel__section">
        <div className="a11y-panel__title-row">
          <div className="a11y-panel__title">Contrast</div>
          <div className="segmented">
            <button
              className={contrastMode === 'wcag' ? 'is-active' : ''}
              onClick={() => state().setContrastMode('wcag')}
            >
              WCAG
            </button>
            <button
              className={contrastMode === 'apca' ? 'is-active' : ''}
              onClick={() => state().setContrastMode('apca')}
            >
              APCA
            </button>
          </div>
        </div>
        {matrixReady ? (
          <>
            <ContrastMatrix samples={samples} mode={contrastMode} />
            <p className="a11y-panel__note">
              Rows are text colors, columns are backgrounds (white, black, then each stop).{' '}
              {contrastMode === 'wcag'
                ? 'WCAG ratio: ≥ 4.5 passes AA for body text.'
                : 'APCA Lc: |Lc| ≥ 60 suits body text, ≥ 45 large text.'}
            </p>
          </>
        ) : (
          <p className="a11y-panel__note">
            Switch the palette to Discrete with {MAX_MATRIX} stops or fewer to see the pairwise
            contrast matrix.
          </p>
        )}
      </div>

      <div className="a11y-panel__section">
        <div className="a11y-panel__title">Distinguishability</div>
        {nearPairs.length === 0 ? (
          <p className="a11y-panel__note is-ok">
            All adjacent stops are distinguishable (ΔE<sub>OK</sub> ≥ {JND}).
          </p>
        ) : (
          <ul className="a11y-panel__warnings">
            {nearPairs.map((p) => (
              <li key={p.a}>
                Stops {p.a} and {p.b} are nearly indistinguishable (ΔE
                <sub>OK</sub> {p.d.toFixed(3)})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
