import type { Palette } from 'color-curves';
import { getSamples } from '../../state/selectors';
import type { CvdSetting } from '../../state/store';
import { LINE_SERIES } from './vizData';

const W = 200;
const H = 140;
const PAD = 10;

export function LineViz({ doc, cvd }: { doc: Palette; cvd: CvdSetting }) {
  const samples = getSamples(doc, 5, cvd);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart preview">
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
      {LINE_SERIES.map((series, s) => (
        <polyline
          key={s}
          fill="none"
          stroke={samples[s]?.hex}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={series
            .map((v, i) => {
              const x = PAD + (i / (series.length - 1)) * (W - PAD * 2);
              const y = H - PAD - v * (H - PAD * 2);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ')}
        />
      ))}
    </svg>
  );
}
