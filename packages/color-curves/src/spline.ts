import type { ControlPoint, CubicSegment, FnSpline, PathSpline, Vec2 } from './types';

const LUT_STEPS = 32;

interface ResolvedPoint {
  p: Vec2;
  hIn: Vec2;
  hOut: Vec2;
}

function norm(v: Vec2): Vec2 {
  const len = Math.hypot(v[0], v[1]);
  return len === 0 ? [0, 0] : [v[0] / len, v[1] / len];
}

function neg(v: Vec2): Vec2 {
  return [-v[0], -v[1]];
}

/**
 * Compute effective tangent handles for every point. 'auto' points get
 * Catmull-Rom tangents with per-side chord-length scaling; 'smooth' points
 * mirror a missing side from the present one; 'corner' points treat a missing
 * side as a zero handle (straight entry/exit).
 */
function resolvePoints(points: ControlPoint[], closed: boolean): ResolvedPoint[] {
  const n = points.length;
  return points.map((pt, i) => {
    const p: Vec2 = [pt.x, pt.y];
    const prev = closed ? points[(i - 1 + n) % n] : i > 0 ? points[i - 1] : undefined;
    const next = closed ? points[(i + 1) % n] : i < n - 1 ? points[i + 1] : undefined;
    const mode = pt.mode ?? 'auto';

    if (mode === 'corner') {
      return { p, hIn: pt.hIn ?? [0, 0], hOut: pt.hOut ?? [0, 0] };
    }
    if (mode === 'smooth' && (pt.hIn || pt.hOut)) {
      const hIn = pt.hIn ?? (pt.hOut ? neg(pt.hOut) : [0, 0]);
      const hOut = pt.hOut ?? (pt.hIn ? neg(pt.hIn) : [0, 0]);
      return { p, hIn, hOut };
    }

    // 'auto' (or handle-less 'smooth')
    if (prev && next) {
      const d = norm([next.x - prev.x, next.y - prev.y]);
      const lenOut = Math.hypot(next.x - pt.x, next.y - pt.y) / 3;
      const lenIn = Math.hypot(pt.x - prev.x, pt.y - prev.y) / 3;
      return {
        p,
        hIn: [-d[0] * lenIn, -d[1] * lenIn],
        hOut: [d[0] * lenOut, d[1] * lenOut],
      };
    }
    if (next) {
      return { p, hIn: [0, 0], hOut: [(next.x - pt.x) / 3, (next.y - pt.y) / 3] };
    }
    if (prev) {
      return { p, hIn: [(prev.x - pt.x) / 3, (prev.y - pt.y) / 3], hOut: [0, 0] };
    }
    return { p, hIn: [0, 0], hOut: [0, 0] };
  });
}

function buildSegments(resolved: ResolvedPoint[], closed: boolean): CubicSegment[] {
  const n = resolved.length;
  const count = closed ? n : n - 1;
  const segments: CubicSegment[] = [];
  for (let i = 0; i < count; i++) {
    const a = resolved[i]!;
    const b = resolved[(i + 1) % n]!;
    segments.push({
      p0: a.p,
      c1: [a.p[0] + a.hOut[0], a.p[1] + a.hOut[1]],
      c2: [b.p[0] + b.hIn[0], b.p[1] + b.hIn[1]],
      p3: b.p,
    });
  }
  return segments;
}

function bezierPoint(seg: CubicSegment, u: number): Vec2 {
  const v = 1 - u;
  const b0 = v * v * v;
  const b1 = 3 * v * v * u;
  const b2 = 3 * v * u * u;
  const b3 = u * u * u;
  return [
    b0 * seg.p0[0] + b1 * seg.c1[0] + b2 * seg.c2[0] + b3 * seg.p3[0],
    b0 * seg.p0[1] + b1 * seg.c1[1] + b2 * seg.c2[1] + b3 * seg.p3[1],
  ];
}

// ---------------------------------------------------------------------------
// Path splines: arc-length parameterization with optional per-point t anchors
// ---------------------------------------------------------------------------

interface CompiledPath {
  segments: CubicSegment[];
  /** Per segment: cumulative chord lengths at LUT_STEPS+1 samples. */
  lut: Float64Array[];
  /** Cumulative length at the start of each segment; last entry = total. */
  cumLen: number[];
  totalLen: number;
  /** Parameter position of each knot (points, plus wrapped seam if closed). */
  knotT: number[];
  /** Arc position (absolute length) of each knot. */
  knotS: number[];
}

const pathCache = new WeakMap<PathSpline, CompiledPath>();

function compilePath(spline: PathSpline): CompiledPath {
  const cached = pathCache.get(spline);
  if (cached) return cached;

  const closed = spline.closed === true;
  const resolved = resolvePoints(spline.points, closed);
  const segments = buildSegments(resolved, closed);

  const lut: Float64Array[] = [];
  const cumLen: number[] = [0];
  let total = 0;
  for (const seg of segments) {
    const samples = new Float64Array(LUT_STEPS + 1);
    let acc = 0;
    let prev = seg.p0;
    for (let k = 1; k <= LUT_STEPS; k++) {
      const pt = bezierPoint(seg, k / LUT_STEPS);
      acc += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
      samples[k] = acc;
      prev = pt;
    }
    lut.push(samples);
    total += acc;
    cumLen.push(total);
  }

  // Knots: one per point, plus the wrapped seam for closed splines.
  const knotCount = segments.length + 1;
  const knotS: number[] = [];
  for (let i = 0; i < knotCount; i++) knotS.push(cumLen[i]!);

  // Anchored knots get their explicit t; the rest interpolate by arc length.
  const knotT: number[] = new Array(knotCount).fill(-1);
  knotT[0] = spline.points[0]?.t ?? 0;
  if (closed) {
    knotT[knotCount - 1] = 1;
  } else {
    knotT[knotCount - 1] = spline.points[spline.points.length - 1]?.t ?? 1;
  }
  for (let i = 1; i < knotCount - 1; i++) {
    const t = spline.points[i]?.t;
    if (t !== undefined) knotT[i] = t;
  }
  let anchor = 0;
  for (let i = 1; i < knotCount; i++) {
    if (knotT[i] === -1) continue;
    const sA = knotS[anchor]!;
    const sB = knotS[i]!;
    const tA = knotT[anchor]!;
    const tB = knotT[i]!;
    for (let j = anchor + 1; j < i; j++) {
      knotT[j] =
        sB > sA
          ? tA + ((knotS[j]! - sA) / (sB - sA)) * (tB - tA)
          : tA + ((j - anchor) / (i - anchor)) * (tB - tA);
    }
    anchor = i;
  }

  const compiled: CompiledPath = { segments, lut, cumLen, totalLen: total, knotT, knotS };
  pathCache.set(spline, compiled);
  return compiled;
}

/** Map an absolute arc position to a point on the path. */
function pointAtLength(c: CompiledPath, s: number): Vec2 {
  const target = Math.min(Math.max(s, 0), c.totalLen);
  // Find the segment containing the target length.
  let lo = 0;
  let hi = c.segments.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (c.cumLen[mid + 1]! < target) lo = mid + 1;
    else hi = mid;
  }
  const seg = c.segments[lo]!;
  const local = target - c.cumLen[lo]!;
  const samples = c.lut[lo]!;
  const segTotal = samples[LUT_STEPS]!;
  if (segTotal === 0) return seg.p0 as Vec2;
  // Invert the per-segment LUT.
  let a = 0;
  let b = LUT_STEPS;
  while (a < b) {
    const mid = (a + b) >> 1;
    if (samples[mid + 1]! < local) a = mid + 1;
    else b = mid;
  }
  const l0 = samples[a]!;
  const l1 = samples[a + 1]!;
  const frac = l1 > l0 ? (local - l0) / (l1 - l0) : 0;
  return bezierPoint(seg, (a + frac) / LUT_STEPS);
}

/**
 * Evaluate a path spline at t ∈ [0, 1]. Sampling is arc-length uniform
 * between knots; explicit per-point t anchors re-time the knots
 * (gradient-stop semantics — t outside the anchored range holds the
 * endpoint).
 */
export function evalPath(spline: PathSpline, t: number): Vec2 {
  const c = compilePath(spline);
  if (c.totalLen === 0) {
    const p = spline.points[0];
    return p ? [p.x, p.y] : [0, 0];
  }
  const first = c.knotT[0]!;
  const last = c.knotT[c.knotT.length - 1]!;
  const tt = Math.min(Math.max(t, first), last);
  // Find the knot interval containing tt.
  let lo = 0;
  let hi = c.knotT.length - 2;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (c.knotT[mid + 1]! < tt) lo = mid + 1;
    else hi = mid;
  }
  const t0 = c.knotT[lo]!;
  const t1 = c.knotT[lo + 1]!;
  const s0 = c.knotS[lo]!;
  const s1 = c.knotS[lo + 1]!;
  const frac = t1 > t0 ? (tt - t0) / (t1 - t0) : 0;
  return pointAtLength(c, s0 + frac * (s1 - s0));
}

// ---------------------------------------------------------------------------
// Fn splines: y = f(x), monotone x
// ---------------------------------------------------------------------------

interface CompiledFn {
  segments: CubicSegment[];
}

const fnCache = new WeakMap<FnSpline, CompiledFn>();

function compileFn(spline: FnSpline): CompiledFn {
  const cached = fnCache.get(spline);
  if (cached) return cached;
  const resolved = resolvePoints(spline.points, false);
  const segments = buildSegments(resolved, false);
  // Clamp control-point x into each segment's x range: with both interior
  // controls inside [x0, x3], x(u) is monotone and solvable.
  for (const seg of segments) {
    const x0 = seg.p0[0];
    const x3 = seg.p3[0];
    const min = Math.min(x0, x3);
    const max = Math.max(x0, x3);
    seg.c1 = [Math.min(Math.max(seg.c1[0], min), max), seg.c1[1]];
    seg.c2 = [Math.min(Math.max(seg.c2[0], min), max), seg.c2[1]];
  }
  const compiled = { segments };
  fnCache.set(spline, compiled);
  return compiled;
}

function bezier1d(a: number, b: number, c: number, d: number, u: number): number {
  const v = 1 - u;
  return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d;
}

/** Solve x(u) = x on one segment: Newton with bisection fallback. */
function solveU(seg: CubicSegment, x: number): number {
  const x0 = seg.p0[0];
  const x3 = seg.p3[0];
  if (x3 === x0) return 0;
  let u = (x - x0) / (x3 - x0);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 12; i++) {
    const xu = bezier1d(x0, seg.c1[0], seg.c2[0], x3, u);
    const err = xu - x;
    if (Math.abs(err) < 1e-7) return u;
    if (err > 0) hi = u;
    else lo = u;
    const v = 1 - u;
    const dx =
      3 * v * v * (seg.c1[0] - x0) +
      6 * v * u * (seg.c2[0] - seg.c1[0]) +
      3 * u * u * (x3 - seg.c2[0]);
    const next = dx !== 0 ? u - err / dx : (lo + hi) / 2;
    u = next > lo && next < hi ? next : (lo + hi) / 2;
  }
  return u;
}

/** Evaluate a fn spline at x ∈ [0, 1] (x clamped into the covered range). */
export function evalFn(spline: FnSpline, x: number): number {
  const c = compileFn(spline);
  const segments = c.segments;
  if (segments.length === 0) return spline.points[0]?.y ?? 0;
  const firstX = segments[0]!.p0[0];
  const lastX = segments[segments.length - 1]!.p3[0];
  const xx = Math.min(Math.max(x, firstX), lastX);
  let lo = 0;
  let hi = segments.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (segments[mid]!.p3[0] < xx) lo = mid + 1;
    else hi = mid;
  }
  const seg = segments[lo]!;
  const u = solveU(seg, xx);
  return bezier1d(seg.p0[1], seg.c1[1], seg.c2[1], seg.p3[1], u);
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Resolved segments with absolute control points (rendering, hit-testing). */
export function toSegments(spline: PathSpline | FnSpline): CubicSegment[] {
  return spline.kind === 'path'
    ? compilePath(spline).segments
    : compileFn(spline).segments;
}

function lerp2(a: Vec2, b: Vec2, u: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

function bakePoint(pt: ControlPoint, hIn: Vec2, hOut: Vec2): ControlPoint {
  const mode = pt.mode ?? 'auto';
  return {
    ...pt,
    mode: mode === 'corner' ? 'corner' : 'smooth',
    hIn,
    hOut,
  };
}

/**
 * Insert a control point at parameter t (path) or x (fn) without changing
 * the curve's shape (de Casteljau split). The split segment's endpoints are
 * baked to explicit handles so 'auto' neighbors don't reshape.
 */
export function insertPoint<S extends PathSpline | FnSpline>(spline: S, t: number): S {
  let segIdx: number;
  let u: number;
  if (spline.kind === 'path') {
    const c = compilePath(spline as PathSpline);
    if (c.totalLen === 0) return spline;
    const first = c.knotT[0]!;
    const last = c.knotT[c.knotT.length - 1]!;
    const tt = Math.min(Math.max(t, first), last);
    let lo = 0;
    let hi = c.knotT.length - 2;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (c.knotT[mid + 1]! < tt) lo = mid + 1;
      else hi = mid;
    }
    const t0 = c.knotT[lo]!;
    const t1 = c.knotT[lo + 1]!;
    const frac = t1 > t0 ? (tt - t0) / (t1 - t0) : 0;
    const target = c.knotS[lo]! + frac * (c.knotS[lo + 1]! - c.knotS[lo]!);
    // target lies within segment lo by construction (knots sit on segment
    // boundaries); recover u from the segment LUT.
    segIdx = lo;
    const local = target - c.cumLen[lo]!;
    const samples = c.lut[lo]!;
    let a = 0;
    let b = LUT_STEPS;
    while (a < b) {
      const mid = (a + b) >> 1;
      if (samples[mid + 1]! < local) a = mid + 1;
      else b = mid;
    }
    const l0 = samples[a]!;
    const l1 = samples[a + 1]!;
    u = (a + (l1 > l0 ? (local - l0) / (l1 - l0) : 0)) / LUT_STEPS;
  } else {
    const c = compileFn(spline as FnSpline);
    if (c.segments.length === 0) return spline;
    const firstX = c.segments[0]!.p0[0];
    const lastX = c.segments[c.segments.length - 1]!.p3[0];
    const xx = Math.min(Math.max(t, firstX), lastX);
    let lo = 0;
    let hi = c.segments.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (c.segments[mid]!.p3[0] < xx) lo = mid + 1;
      else hi = mid;
    }
    segIdx = lo;
    u = solveU(c.segments[lo]!, xx);
  }

  if (u < 0.001 || u > 0.999) return spline; // too close to an existing point

  const segments = toSegments(spline);
  const seg = segments[segIdx]!;
  const q0 = lerp2(seg.p0, seg.c1, u);
  const q1 = lerp2(seg.c1, seg.c2, u);
  const q2 = lerp2(seg.c2, seg.p3, u);
  const r0 = lerp2(q0, q1, u);
  const r1 = lerp2(q1, q2, u);
  const sp = lerp2(r0, r1, u);

  const n = spline.points.length;
  const iA = segIdx;
  const iB = spline.kind === 'path' && (spline as PathSpline).closed ? (segIdx + 1) % n : segIdx + 1;
  const ptA = spline.points[iA]!;
  const ptB = spline.points[iB]!;

  const newPoint: ControlPoint = {
    x: sp[0],
    y: sp[1],
    mode: 'smooth',
    hIn: [r0[0] - sp[0], r0[1] - sp[1]],
    hOut: [r1[0] - sp[0], r1[1] - sp[1]],
  };

  const prevSeg = segIdx > 0 ? segments[segIdx - 1] : (spline as PathSpline).closed ? segments[segments.length - 1] : undefined;
  const nextSeg = segIdx < segments.length - 1 ? segments[segIdx + 1] : (spline as PathSpline).closed ? segments[0] : undefined;

  const points = spline.points.slice();
  points[iA] = bakePoint(
    ptA,
    prevSeg ? [prevSeg.c2[0] - ptA.x, prevSeg.c2[1] - ptA.y] : ptA.hIn ?? [0, 0],
    [q0[0] - ptA.x, q0[1] - ptA.y],
  );
  points[iB] = bakePoint(
    ptB,
    [q2[0] - ptB.x, q2[1] - ptB.y],
    nextSeg ? [nextSeg.c1[0] - ptB.x, nextSeg.c1[1] - ptB.y] : ptB.hOut ?? [0, 0],
  );
  points.splice(segIdx + 1, 0, newPoint);

  return { ...spline, points };
}

export function removePoint<S extends PathSpline | FnSpline>(spline: S, index: number): S {
  const min = spline.kind === 'path' && (spline as PathSpline).closed ? 3 : 2;
  if (spline.points.length <= min) return spline;
  if (index < 0 || index >= spline.points.length) return spline;
  const points = spline.points.slice();
  points.splice(index, 1);
  return { ...spline, points };
}
