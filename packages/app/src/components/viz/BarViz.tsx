import type { Palette } from 'color-curves';
import { getSamples } from '../../state/selectors';
import type { CvdSetting } from '../../state/store';
import { BAR_VALUES } from './vizData';

const W = 200;
const H = 140;
const PAD = 10;
const GAP = 8;

export function BarViz({ doc, cvd }: { doc: Palette; cvd: CvdSetting }) {
  const samples = getSamples(doc, 6, cvd);
  const barW = (W - PAD * 2 - GAP * (BAR_VALUES.length - 1)) / BAR_VALUES.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bar chart preview">
      {BAR_VALUES.map((v, i) => {
        const h = v * (H - PAD * 2);
        return (
          <rect
            key={i}
            x={PAD + i * (barW + GAP)}
            y={H - PAD - h}
            width={barW}
            height={h}
            rx={2}
            fill={samples[i]?.hex}
          />
        );
      })}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
    </svg>
  );
}
