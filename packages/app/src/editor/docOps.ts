import {
  evalFn,
  evalPath,
  insertPoint,
  removePoint,
  type ControlPoint,
  type FnSpline,
  type Palette,
  type PathSpline,
  type Vec2,
} from 'color-curves';
import type { Surface } from '../state/store';
import { effectiveHandles } from './hitTest';

const X_EPSILON = 0.001;

export function getSpline(doc: Palette, surface: Surface): PathSpline | FnSpline {
  return surface === 'wheel' ? doc.wheel : doc.light;
}

export function withSpline(doc: Palette, surface: Surface, spline: PathSpline | FnSpline): Palette {
  return surface === 'wheel'
    ? { ...doc, wheel: spline as PathSpline }
    : { ...doc, light: spline as FnSpline };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Move a point to surface coords, applying per-surface constraints. */
export function movePointTo(
  doc: Palette,
  surface: Surface,
  index: number,
  sx: number,
  sy: number,
): Palette {
  const spline = getSpline(doc, surface);
  const pt = spline.points[index];
  if (!pt) return doc;
  let x = sx;
  let y = sy;
  if (surface === 'strip') {
    y = clamp(y, 0, 1);
    if (index === 0) x = 0;
    else if (index === spline.points.length - 1) x = 1;
    else {
      const prev = spline.points[index - 1]!;
      const next = spline.points[index + 1]!;
      x = clamp(x, prev.x + X_EPSILON, next.x - X_EPSILON);
    }
  }
  const points = spline.points.slice();
  points[index] = { ...pt, x, y };
  return withSpline(doc, surface, { ...spline, points });
}

/** Translate the whole curve (wheel: both axes; strip: lightness only). */
export function translateCurve(doc: Palette, surface: Surface, dx: number, dy: number): Palette {
  const spline = getSpline(doc, surface);
  if (surface === 'strip') {
    let lo = Infinity;
    let hi = -Infinity;
    for (const pt of spline.points) {
      lo = Math.min(lo, pt.y);
      hi = Math.max(hi, pt.y);
    }
    const d = clamp(dy, -lo, 1 - hi);
    if (d === 0) return doc;
    const points = spline.points.map((pt) => ({ ...pt, y: pt.y + d }));
    return withSpline(doc, surface, { ...spline, points });
  }
  const points = spline.points.map((pt) => ({ ...pt, x: pt.x + dx, y: pt.y + dy }));
  return withSpline(doc, surface, { ...spline, points });
}

/** Rotate the whole wheel curve about the disk center — a hue rotation. */
export function rotateWheelCurve(doc: Palette, angle: number): Palette {
  if (angle === 0) return doc;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rot = (v: Vec2): Vec2 => [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
  const points = doc.wheel.points.map((pt) => {
    const [x, y] = rot([pt.x, pt.y]);
    const next: ControlPoint = { ...pt, x, y };
    if (pt.hIn) next.hIn = rot(pt.hIn);
    if (pt.hOut) next.hOut = rot(pt.hOut);
    return next;
  });
  return { ...doc, wheel: { ...doc.wheel, points } };
}

/**
 * Scale the whole wheel curve about the disk center — a chroma/saturation
 * change. The factor is capped so the curve can neither collapse to a point
 * nor blow past the serializable coordinate range.
 */
export function scaleWheelCurve(doc: Palette, factor: number): Palette {
  if (factor === 1) return doc;
  let maxR = 0;
  for (const pt of doc.wheel.points) {
    maxR = Math.max(maxR, Math.hypot(pt.x, pt.y));
  }
  if (maxR === 0) return doc;
  const f = Math.min(Math.max(factor, 0.05 / maxR), 3.5 / maxR);
  const points = doc.wheel.points.map((pt) => {
    const next: ControlPoint = { ...pt, x: pt.x * f, y: pt.y * f };
    if (pt.hIn) next.hIn = [pt.hIn[0] * f, pt.hIn[1] * f];
    if (pt.hOut) next.hOut = [pt.hOut[0] * f, pt.hOut[1] * f];
    return next;
  });
  return { ...doc, wheel: { ...doc.wheel, points } };
}

/**
 * Alt-drag on a point: convert to explicit smooth handles pulled toward v
 * (hOut = v, hIn mirrored).
 */
export function pullHandles(doc: Palette, surface: Surface, index: number, v: Vec2): Palette {
  const spline = getSpline(doc, surface);
  const pt = spline.points[index];
  if (!pt) return doc;
  const points = spline.points.slice();
  points[index] = { ...pt, mode: 'smooth', hOut: v, hIn: [-v[0], -v[1]] };
  return withSpline(doc, surface, { ...spline, points });
}

function norm(v: Vec2): Vec2 {
  const len = Math.hypot(v[0], v[1]);
  return len === 0 ? [0, 0] : [v[0] / len, v[1] / len];
}

/** Set one tangent handle; smooth points mirror the opposite direction. */
export function setHandle(
  doc: Palette,
  surface: Surface,
  index: number,
  which: 'in' | 'out',
  v: Vec2,
): Palette {
  const spline = getSpline(doc, surface);
  const pt = spline.points[index];
  if (!pt) return doc;
  const next: ControlPoint = { ...pt };
  if (which === 'out') next.hOut = v;
  else next.hIn = v;
  if ((pt.mode ?? 'auto') !== 'corner') {
    next.mode = 'smooth';
    const d = norm(v);
    if (which === 'out') {
      const len = pt.hIn ? Math.hypot(pt.hIn[0], pt.hIn[1]) : Math.hypot(v[0], v[1]);
      next.hIn = [-d[0] * len, -d[1] * len];
    } else {
      const len = pt.hOut ? Math.hypot(pt.hOut[0], pt.hOut[1]) : Math.hypot(v[0], v[1]);
      next.hOut = [-d[0] * len, -d[1] * len];
    }
  }
  const points = spline.points.slice();
  points[index] = next;
  return withSpline(doc, surface, { ...spline, points });
}

/**
 * Set a point's tangent mode. 'auto' strips explicit handles; 'smooth' and
 * 'corner' bake the current effective handles first so the shape doesn't
 * jump, then let the editor adjust them.
 */
export function setPointMode(
  doc: Palette,
  surface: Surface,
  index: number,
  mode: 'auto' | 'smooth' | 'corner',
): Palette {
  const spline = getSpline(doc, surface);
  const pt = spline.points[index];
  if (!pt) return doc;
  const points = spline.points.slice();
  if (mode === 'auto') {
    const next: ControlPoint = { x: pt.x, y: pt.y };
    if (pt.t !== undefined) next.t = pt.t;
    points[index] = next;
  } else {
    const { hIn, hOut } = effectiveHandles(spline, index);
    const next: ControlPoint = { ...pt, mode };
    if (hIn) next.hIn = [hIn[0] - pt.x, hIn[1] - pt.y];
    if (hOut) next.hOut = [hOut[0] - pt.x, hOut[1] - pt.y];
    if (mode === 'smooth' && next.hOut && next.hIn) {
      // Re-align: keep the out direction, mirror it into the in handle.
      const d = norm(next.hOut);
      const len = Math.hypot(next.hIn[0], next.hIn[1]);
      next.hIn = [-d[0] * len, -d[1] * len];
    }
    points[index] = next;
  }
  return withSpline(doc, surface, { ...spline, points });
}

/** Insert a point at parameter t; returns the new doc and the point index. */
export function insertAt(
  doc: Palette,
  surface: Surface,
  t: number,
): { doc: Palette; index: number } {
  const spline = getSpline(doc, surface);
  const next = insertPoint(spline, t);
  if (next === spline) return { doc, index: -1 };
  // Locate the inserted point: the index whose coords match none of the old
  // points' identities is where lengths diverge; find first structural diff.
  let index = next.points.length - 1;
  const target =
    spline.kind === 'path'
      ? evalPath(spline as PathSpline, t)
      : ([t, evalFn(spline as FnSpline, t)] as const);
  let best = Infinity;
  for (let i = 0; i < next.points.length; i++) {
    const pt = next.points[i]!;
    const d = Math.hypot(pt.x - target[0], pt.y - target[1]);
    if (d < best) {
      best = d;
      index = i;
    }
  }
  return { doc: withSpline(doc, surface, next), index };
}

export function canRemove(doc: Palette, surface: Surface, index: number): boolean {
  const spline = getSpline(doc, surface);
  if (surface === 'strip') {
    if (index === 0 || index === spline.points.length - 1) return false;
    return spline.points.length > 2;
  }
  const min = (spline as PathSpline).closed ? 3 : 2;
  return spline.points.length > min;
}

export function removeAt(doc: Palette, surface: Surface, index: number): Palette {
  if (!canRemove(doc, surface, index)) return doc;
  return withSpline(doc, surface, removePoint(getSpline(doc, surface), index));
}

/** Nearest curve parameter to a surface point (path: sampled scan; fn: x). */
export function nearestT(doc: Palette, surface: Surface, sx: number, sy: number): number {
  if (surface === 'strip') return Math.min(1, Math.max(0, sx));
  const spline = doc.wheel;
  let best = 0;
  let bestDist = Infinity;
  const N = 256;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = evalPath(spline, t);
    const d = Math.hypot(x - sx, y - sy);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return best;
}

/** Median of the lightness curve — the wheel raster's display lightness. */
export function medianLightness(doc: Palette): number {
  const samples: number[] = [];
  for (let i = 0; i < 33; i++) {
    samples.push(Math.min(1, Math.max(0, evalFn(doc.light, i / 32))));
  }
  samples.sort((a, b) => a - b);
  return samples[16]!;
}
