import { evalFn, evalPath, shapes, type FnSpline, type PathSpline } from 'color-curves';
import { useAppStore, type Surface } from '../state/store';
import { rotateWheelCurve, scaleWheelCurve, withSpline } from '../editor/docOps';

interface ShapeDef {
  id: string;
  label: string;
  make(): PathSpline | FnSpline;
}

const WHEEL_SHAPES: ShapeDef[] = [
  { id: 'arc', label: 'Arc', make: () => shapes.arc() },
  { id: 'circle', label: 'Circle', make: () => shapes.circle() },
  { id: 'line', label: 'Line', make: () => shapes.line([-0.7, -0.45], [0.7, 0.45]) },
  { id: 'wave', label: 'Wave', make: () => shapes.wave() },
  { id: 'scurve', label: 'S-curve', make: () => shapes.sCurve() },
  { id: 'spiral', label: 'Spiral', make: () => shapes.spiral() },
  { id: 'hook', label: 'Hook', make: () => shapes.hook() },
];

const STRIP_SHAPES: ShapeDef[] = [
  { id: 'ramp', label: 'Ramp', make: () => shapes.ramp(0.2, 0.9) },
  { id: 'ease', label: 'Ease', make: () => shapes.ease(0.15, 0.9) },
  { id: 'wave', label: 'Wave', make: () => shapes.fnWave() },
  { id: 'flat', label: 'Flat', make: () => shapes.ramp(0.6, 0.6) },
];

/** Build a tiny svg path preview by sampling the actual shape generator. */
function iconPath(spline: PathSpline | FnSpline): string {
  const N = 32;
  const pts: [number, number][] = [];
  if (spline.kind === 'path') {
    for (let i = 0; i <= N; i++) {
      const [x, y] = evalPath(spline, i / N);
      pts.push([x, y]);
    }
  } else {
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      pts.push([x, evalFn(spline, x)]);
    }
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const span = Math.max(spanX, spanY);
  const pad = 4;
  const size = 20 - pad * 2;
  const ox = pad + ((span - spanX) / span) * (size / 2);
  const oy = pad + ((span - spanY) / span) * (size / 2);
  return pts
    .map(([x, y], i) => {
      const sx = ox + ((x - minX) / span) * size;
      const sy = 20 - (oy + ((y - minY) / span) * size);
      return `${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(' ');
}

const ICON_CACHE = new Map<string, string>();
function shapeIcon(def: ShapeDef, surface: Surface): string {
  const key = `${surface}:${def.id}`;
  let d = ICON_CACHE.get(key);
  if (!d) {
    d = iconPath(def.make());
    ICON_CACHE.set(key, d);
  }
  return d;
}

const ROTATE_STEP = Math.PI / 12; // 15°
const SCALE_STEP = 1.1;

function WheelTransforms() {
  const state = useAppStore.getState();
  const buttons: { id: string; title: string; icon: React.ReactNode; apply(): void }[] = [
    {
      id: 'rotate-ccw',
      title: 'Rotate hues 15° counter-clockwise (or alt-drag the curve)',
      icon: (
        <>
          <path
            d="M2.9 10a7.1 7.1 0 1 0 2.1-5L2.9 7.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M2.9 2.9v4.2h4.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
      apply: () => state.updateDoc((d) => rotateWheelCurve(d, ROTATE_STEP)),
    },
    {
      id: 'rotate-cw',
      title: 'Rotate hues 15° clockwise (or alt-drag the curve)',
      icon: (
        <>
          <path
            d="M17.1 10a7.1 7.1 0 1 1-2.1-5l2.1 2.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M17.1 2.9v4.2h-4.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
      apply: () => state.updateDoc((d) => rotateWheelCurve(d, -ROTATE_STEP)),
    },
    {
      id: 'shrink',
      title: 'Scale the curve down — less chroma (or shift-drag the curve)',
      icon: (
        <>
          <path d="M3.3 11.7h5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.7 8.3h-5v-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m11.7 8.3 5.4-5.4M2.9 17.1l5.4-5.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ),
      apply: () => state.updateDoc((d) => scaleWheelCurve(d, 1 / SCALE_STEP)),
    },
    {
      id: 'grow',
      title: 'Scale the curve up — more chroma (or shift-drag the curve)',
      icon: (
        <>
          <path d="M12.5 2.9h4.6v4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 17.1H2.9v-4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.1 2.9l-5.8 5.8M2.9 17.1l5.8-5.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ),
      apply: () => state.updateDoc((d) => scaleWheelCurve(d, SCALE_STEP)),
    },
  ];
  return (
    <div className="shape-row__transforms" role="group" aria-label="Transform the wheel curve">
      {buttons.map((b) => (
        <button key={b.id} className="icon-button" title={b.title} onClick={b.apply}>
          <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true">
            {b.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ShapeRow({ surface }: { surface: Surface }) {
  const defs = surface === 'wheel' ? WHEEL_SHAPES : STRIP_SHAPES;
  const state = useAppStore.getState();
  return (
    <div className="shape-row" role="group" aria-label={`${surface} starting shapes`}>
      {defs.map((def) => (
        <button
          key={def.id}
          className="shape-row__button"
          title={`Start from a ${def.label.toLowerCase()}`}
          onClick={() => {
            state.select(null);
            state.updateDoc((d) => withSpline(d, surface, def.make()));
          }}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d={shapeIcon(def, surface)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>{def.label}</span>
        </button>
      ))}
      {surface === 'wheel' && <WheelTransforms />}
    </div>
  );
}
