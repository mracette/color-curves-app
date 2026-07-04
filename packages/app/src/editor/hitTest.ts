import { toSegments, type FnSpline, type PathSpline } from 'color-curves';
import type { SurfaceMapping } from './mapping';

export type HitTarget =
  | { type: 'point'; index: number }
  | { type: 'handleIn'; index: number }
  | { type: 'handleOut'; index: number }
  | { type: 'curve' };

const TOL_HANDLE = 10;
const TOL_POINT = 13;
const TOL_CURVE = 8;
const FLATTEN_STEPS = 24;

/** Effective absolute handle positions of a point, from resolved segments. */
export function effectiveHandles(
  spline: PathSpline | FnSpline,
  index: number,
): { hIn: [number, number] | null; hOut: [number, number] | null } {
  const segments = toSegments(spline);
  const n = spline.points.length;
  const closed = spline.kind === 'path' && spline.closed === true;
  const outSeg = index < segments.length ? segments[index] : closed ? segments[index % segments.length] : undefined;
  const inSegIdx = closed ? (index - 1 + segments.length) % segments.length : index - 1;
  const inSeg = inSegIdx >= 0 ? segments[inSegIdx] : undefined;
  const hasOutSeg = closed || index < n - 1;
  const hasInSeg = closed || index > 0;
  return {
    hIn: hasInSeg && inSeg ? [inSeg.c2[0], inSeg.c2[1]] : null,
    hOut: hasOutSeg && outSeg ? [outSeg.c1[0], outSeg.c1[1]] : null,
  };
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const u = lenSq === 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
}

/**
 * Hit-test in CSS px. Priority: tangent handle (selected point only) >
 * control point > curve body.
 */
export function hitTest(
  spline: PathSpline | FnSpline,
  mapping: SurfaceMapping,
  px: number,
  py: number,
  opts: { selectedIndex: number | null; touch: boolean },
): HitTarget | null {
  const mult = opts.touch ? 2 : 1;

  if (opts.selectedIndex !== null) {
    const pt = spline.points[opts.selectedIndex];
    if (pt && (pt.hIn || pt.hOut)) {
      const { hIn, hOut } = effectiveHandles(spline, opts.selectedIndex);
      for (const [which, pos] of [
        ['handleOut', hOut],
        ['handleIn', hIn],
      ] as const) {
        if (!pos) continue;
        const [sx, sy] = mapping.toScreen(pos[0], pos[1]);
        if (Math.hypot(px - sx, py - sy) <= TOL_HANDLE * mult) {
          return { type: which, index: opts.selectedIndex };
        }
      }
    }
  }

  let bestPoint = -1;
  let bestDist = TOL_POINT * mult;
  for (let i = 0; i < spline.points.length; i++) {
    const pt = spline.points[i]!;
    const [sx, sy] = mapping.toScreen(pt.x, pt.y);
    const d = Math.hypot(px - sx, py - sy);
    if (d <= bestDist) {
      bestDist = d;
      bestPoint = i;
    }
  }
  if (bestPoint >= 0) return { type: 'point', index: bestPoint };

  const segments = toSegments(spline);
  const tol = TOL_CURVE * mult;
  for (const seg of segments) {
    let prevX: number | null = null;
    let prevY: number | null = null;
    for (let k = 0; k <= FLATTEN_STEPS; k++) {
      const u = k / FLATTEN_STEPS;
      const v = 1 - u;
      const b0 = v * v * v;
      const b1 = 3 * v * v * u;
      const b2 = 3 * v * u * u;
      const b3 = u * u * u;
      const x = b0 * seg.p0[0] + b1 * seg.c1[0] + b2 * seg.c2[0] + b3 * seg.p3[0];
      const y = b0 * seg.p0[1] + b1 * seg.c1[1] + b2 * seg.c2[1] + b3 * seg.p3[1];
      const [sx, sy] = mapping.toScreen(x, y);
      if (prevX !== null && segDist(px, py, prevX, prevY!, sx, sy) <= tol) {
        return { type: 'curve' };
      }
      prevX = sx;
      prevY = sy;
    }
  }
  return null;
}
