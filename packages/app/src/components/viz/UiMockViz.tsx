import type { Palette } from 'color-curves';
import { getSamples } from '../../state/selectors';
import type { CvdSetting } from '../../state/store';
import { SPARK } from './vizData';

export function UiMockViz({ doc, cvd }: { doc: Palette; cvd: CvdSetting }) {
  const samples = getSamples(doc, 5, cvd);
  const sparkPts = SPARK.map((v, i) => {
    const x = 130 + (i / (SPARK.length - 1)) * 38;
    const y = 124 - v * 28;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 200 140" role="img" aria-label="UI mock preview">
      {/* card */}
      <rect x={24} y={10} width={152} height={120} rx={6} fill="var(--bg-panel)" stroke="var(--border)" />
      {/* header band, rounded only on top */}
      <path d="M24 16 a6 6 0 0 1 6 -6 h140 a6 6 0 0 1 6 6 v24 h-152 z" fill={samples[1]?.hex} />
      {/* title + body skeleton */}
      <rect x={34} y={50} width={80} height={8} rx={4} fill="var(--bg-inset)" />
      <rect x={34} y={66} width={132} height={5} rx={2.5} fill="var(--bg-inset)" />
      <rect x={34} y={76} width={108} height={5} rx={2.5} fill="var(--bg-inset)" />
      {/* primary button */}
      <rect x={34} y={100} width={46} height={16} rx={4} fill={samples[0]?.hex} />
      <rect x={42} y={106} width={30} height={4} rx={2} fill="#ffffff" fillOpacity={0.9} />
      {/* secondary badge */}
      <rect x={88} y={100} width={34} height={16} rx={8} fill={samples[2]?.hex} fillOpacity={0.18} />
      <rect x={96} y={106} width={18} height={4} rx={2} fill={samples[2]?.hex} />
      {/* mini sparkline */}
      <polyline
        points={sparkPts}
        fill="none"
        stroke={samples[4]?.hex}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
