import type { Palette } from 'color-curves';
import { getSamples } from '../../state/selectors';
import type { CvdSetting } from '../../state/store';
import { SCATTER_CLUSTERS } from './vizData';

const W = 200;
const H = 140;
const PAD = 12;

export function ScatterViz({ doc, cvd }: { doc: Palette; cvd: CvdSetting }) {
  const samples = getSamples(doc, 4, cvd);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Scatter plot preview">
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
      {SCATTER_CLUSTERS.map((cluster, c) =>
        cluster.map((p, i) => (
          <circle
            key={`${c}-${i}`}
            cx={(PAD + p.x * (W - PAD * 2)).toFixed(1)}
            cy={(H - PAD - p.y * (H - PAD * 2)).toFixed(1)}
            r={3}
            fill={samples[c]?.hex}
            fillOpacity={0.85}
          />
        )),
      )}
    </svg>
  );
}
