import type { Palette } from 'color-curves';
import { getRamp } from '../../state/selectors';
import type { CvdSetting } from '../../state/store';
import { HEATMAP } from './vizData';

const W = 200;
const H = 140;
const PAD = 10;
const GAP = 1;

export function HeatmapViz({ doc, cvd }: { doc: Palette; cvd: CvdSetting }) {
  const ramp = getRamp(doc, 24, cvd);
  const rows = HEATMAP.length;
  const cols = HEATMAP[0]?.length ?? 0;
  const cellW = (W - PAD * 2 - GAP * (cols - 1)) / cols;
  const cellH = (H - PAD * 2 - GAP * (rows - 1)) / rows;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Heatmap preview">
      {HEATMAP.map((row, r) =>
        row.map((v, c) => (
          <rect
            key={`${r}-${c}`}
            x={(PAD + c * (cellW + GAP)).toFixed(2)}
            y={(PAD + r * (cellH + GAP)).toFixed(2)}
            width={cellW.toFixed(2)}
            height={cellH.toFixed(2)}
            fill={ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))]}
          />
        )),
      )}
    </svg>
  );
}
