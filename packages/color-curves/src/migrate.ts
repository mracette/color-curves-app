import type { ControlPoint, FnSpline, Palette, PathSpline, Vec2 } from './types';
import { evalFn, evalPath } from './spline';

/**
 * Importer for palettes authored with the legacy color-curves library
 * (v0.0.7). The old model is re-implemented here exactly — including its
 * quirks — so imported palettes reproduce the original colors, then the
 * sampled result is fitted with splines in the new model.
 */

// ---------------------------------------------------------------------------
// d3-ease@1.0.6 (the version the legacy presets were authored against),
// ported verbatim. This version does not normalize exp/elastic endpoints.
// ---------------------------------------------------------------------------

type Ease = (t: number) => number;

const polyIn =
  (e: number): Ease =>
  (t) =>
    Math.pow(t, e);
const polyOut =
  (e: number): Ease =>
  (t) =>
    1 - Math.pow(1 - t, e);
const polyInOut =
  (e: number): Ease =>
  (t) =>
    ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;

const HALF_PI = Math.PI / 2;
const sinIn: Ease = (t) => 1 - Math.cos(t * HALF_PI);
const sinOut: Ease = (t) => Math.sin(t * HALF_PI);
const sinInOut: Ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;

const expIn: Ease = (t) => Math.pow(2, 10 * t - 10);
const expOut: Ease = (t) => 1 - Math.pow(2, -10 * t);
const expInOut: Ease = (t) =>
  ((t *= 2) <= 1 ? Math.pow(2, 10 * t - 10) : 2 - Math.pow(2, 10 - 10 * t)) / 2;

const TAU = 2 * Math.PI;

const elasticIn = (a: number, p: number): Ease => {
  a = Math.max(1, a);
  p /= TAU;
  const s = Math.asin(1 / a) * p;
  return (t) => {
    t -= 1;
    return a * Math.pow(2, 10 * t) * Math.sin((s - t) / p);
  };
};
const elasticOut = (a: number, p: number): Ease => {
  a = Math.max(1, a);
  p /= TAU;
  const s = Math.asin(1 / a) * p;
  return (t) => 1 - a * Math.pow(2, -10 * t) * Math.sin((t + s) / p);
};
const elasticInOut = (a: number, p: number): Ease => {
  a = Math.max(1, a);
  p /= TAU;
  const s = Math.asin(1 / a) * p;
  return (t) => {
    t = t * 2 - 1;
    return (
      (t < 0
        ? a * Math.pow(2, 10 * t) * Math.sin((s - t) / p)
        : 2 - a * Math.pow(2, -10 * t) * Math.sin((s + t) / p)) / 2
    );
  };
};

const backIn =
  (s: number): Ease =>
  (t) =>
    t * t * ((s + 1) * t - s);
const backOut =
  (s: number): Ease =>
  (t) => {
    t -= 1;
    return t * t * ((s + 1) * t + s) + 1;
  };
const backInOut =
  (s: number): Ease =>
  (t) => {
    t *= 2;
    if (t < 1) return (t * t * ((s + 1) * t - s)) / 2;
    t -= 2;
    return (t * t * ((s + 1) * t + s) + 2) / 2;
  };

const b1 = 4 / 11;
const b2 = 6 / 11;
const b3 = 8 / 11;
const b4 = 3 / 4;
const b5 = 9 / 11;
const b6 = 10 / 11;
const b7 = 15 / 16;
const b8 = 21 / 22;
const b9 = 63 / 64;
const b0 = 1 / b1 / b1;

function bounceOutFn(t: number): number {
  return t < b1
    ? b0 * t * t
    : t < b3
      ? b0 * (t -= b2) * t + b4
      : t < b6
        ? b0 * (t -= b5) * t + b7
        : b0 * (t -= b8) * t + b9;
}
const bounceIn: Ease = (t) => 1 - bounceOutFn(1 - t);
const bounceOut: Ease = bounceOutFn;
const bounceInOut: Ease = (t) =>
  ((t *= 2) <= 1 ? 1 - bounceOutFn(1 - t) : bounceOutFn(t - 1) + 1) / 2;

// ---------------------------------------------------------------------------
// Legacy curve model (Curve/Arc/Function + surfaces), ported exactly
// ---------------------------------------------------------------------------

type Params = Record<string, unknown>;
type SurfaceType = 'unitCircle' | 'unitSquare';

interface LegacyCurve {
  surface: SurfaceType;
  overflow: 'clamp' | 'project';
  reverse: boolean;
  rotation: number;
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  /** Pre-transform coords: arc geometry or (n, ease(n)). */
  local: (n: number) => { x: number; y: number };
  clampStart: number;
  clampEnd: number;
}

interface LegacyModel {
  hs: LegacyCurve;
  l: LegacyCurve;
  start: number;
  end: number;
  name?: string;
  author?: string;
}

// Function-curve scale/translation defaults from the legacy Function class.
const FN_CIRCLE_SCALE_X = Math.cos(Math.PI * (9 / 8)) * -2;
const FN_CIRCLE_SCALE_Y = Math.sin(Math.PI * (9 / 8)) * -2;
const FN_CIRCLE_TRANSLATE_X = Math.cos(Math.PI * (9 / 8));
const FN_CIRCLE_TRANSLATE_Y = Math.sin(Math.PI * (9 / 8));

function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

function makeEase(type: string, p: Params): Ease {
  const variation = p.variation === 'out' || p.variation === 'in-out' ? p.variation : 'in';
  switch (type) {
    case 'polynomial': {
      const eRaw = num(p.exponent);
      const e = eRaw !== undefined && eRaw > 0 ? eRaw : 3;
      return variation === 'in' ? polyIn(e) : variation === 'out' ? polyOut(e) : polyInOut(e);
    }
    case 'sinusoidal':
      return variation === 'in' ? sinIn : variation === 'out' ? sinOut : sinInOut;
    case 'exponential':
      return variation === 'in' ? expIn : variation === 'out' ? expOut : expInOut;
    case 'elastic': {
      const aRaw = num(p.amplitude);
      const a = aRaw !== undefined && aRaw >= 1 ? aRaw : 1;
      const perRaw = num(p.period);
      const per = perRaw !== undefined && perRaw > 0 ? perRaw : 0.3;
      return variation === 'in'
        ? elasticIn(a, per)
        : variation === 'out'
          ? elasticOut(a, per)
          : elasticInOut(a, per);
    }
    case 'back': {
      const s = num(p.overshoot) ?? 1.70158;
      return variation === 'in' ? backIn(s) : variation === 'out' ? backOut(s) : backInOut(s);
    }
    case 'bounce':
      return variation === 'in' ? bounceIn : variation === 'out' ? bounceOut : bounceInOut;
    default:
      // 'linear', plus unknown types (the old library warned and used Linear)
      return (n) => n;
  }
}

function makeLegacyCurve(p: Params, surface: SurfaceType): LegacyCurve {
  const type = typeof p.type === 'string' ? p.type : 'linear';
  const isArc = type === 'arc';
  const square = surface === 'unitSquare';

  const scale = (typeof p.scale === 'object' && p.scale !== null ? p.scale : {}) as Params;
  const translation = (
    typeof p.translation === 'object' && p.translation !== null ? p.translation : {}
  ) as Params;

  let local: (n: number) => { x: number; y: number };
  if (isArc) {
    const radius = num(p.radius) ?? (square ? 0.25 : 0.5);
    const angleStart = num(p.angleStart) ?? 0;
    const angleEnd = num(p.angleEnd) ?? Math.PI * 2;
    const angleOffset = num(p.angleOffset) ?? 0;
    local = (n) => {
      const theta = angleOffset + angleStart + n * (angleEnd - angleStart);
      return { x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
    };
  } else {
    const ease = makeEase(type, p);
    local = (n) => ({ x: n, y: ease(n) });
  }

  return {
    surface,
    overflow: p.overflow === 'project' ? 'project' : 'clamp',
    reverse: !!p.reverse,
    rotation: num(p.rotation) ?? 0,
    scaleX: num(scale.x) ?? (isArc ? 1 : square ? 1 : FN_CIRCLE_SCALE_X),
    scaleY: num(scale.y) ?? (isArc ? 1 : square ? 0.5 : FN_CIRCLE_SCALE_Y),
    translateX: num(translation.x) ?? (isArc ? (square ? 0.5 : 0) : square ? 0 : FN_CIRCLE_TRANSLATE_X),
    translateY: num(translation.y) ?? (isArc ? (square ? 0.5 : 0) : square ? 0.25 : FN_CIRCLE_TRANSLATE_Y),
    local,
    clampStart: 0,
    clampEnd: 1,
  };
}

/** Port of Curve#getCurveCoordsAt: transform pipeline + overflow projection. */
function legacyCoordsAt(
  c: LegacyCurve,
  n: number,
): { x: number; y: number; clamped: boolean } {
  if (c.reverse) n = 1 - n;

  const local = c.local(n);
  let x = local.x * c.scaleX;
  let y = local.y * c.scaleY;
  x += c.translateX;
  y += c.translateY;

  const cx = c.surface === 'unitCircle' ? 0 : 0.5;
  const cy = cx;
  const sin = Math.sin(c.rotation);
  const cos = Math.cos(c.rotation);
  const xRot = (x - cx) * cos - (y - cy) * sin + cx;
  // Verbatim from the old library, including its (x - cy) bug in the first
  // term; harmless because cx === cy on both surfaces.
  const yRot = (x - cy) * sin + (y - cy) * cos + cy;

  if (c.surface === 'unitSquare') {
    return {
      x: Math.min(1, Math.max(0, xRot)),
      y: Math.min(1, Math.max(0, yRot)),
      clamped: xRot < 0 || xRot > 1 || yRot < 0 || yRot > 1,
    };
  }
  const clamped = xRot * xRot + yRot * yRot > 1;
  const r = Math.sqrt(xRot * xRot + yRot * yRot);
  const theta = Math.atan2(yRot, xRot);
  const rc = Math.max(-1, Math.min(1, r));
  return { x: rc * Math.cos(theta), y: rc * Math.sin(theta), clamped };
}

/** Port of Curve#setClampBounds (resolution 128, early exit and all). */
function setClampBounds(c: LegacyCurve): void {
  const resolution = 128;
  let clampStart: number | null = null;
  let clampEnd: number | null = null;
  let prevClamped = false;
  let i = 0;

  while (i <= resolution && (clampStart === null || clampEnd === null)) {
    const coords = legacyCoordsAt(c, i / resolution);
    if (i === 0) {
      if (!coords.clamped) clampStart = 0;
    } else {
      if (clampStart === null && prevClamped && !coords.clamped) clampStart = i / resolution;
      if (clampEnd === null && !prevClamped && coords.clamped) clampEnd = i / resolution;
    }
    if (i === resolution && coords.clamped && clampStart === null && clampEnd === null) {
      clampEnd = 0;
    }
    prevClamped = coords.clamped;
    i++;
  }

  c.clampStart = clampStart === null ? 0 : clampStart;
  c.clampEnd = clampEnd === null ? 1 : clampEnd;
}

function parseCurveParams(input: string | object): Params {
  if (typeof input === 'string') {
    try {
      const o: unknown = JSON.parse(input);
      if (o && typeof o === 'object') return o as Params;
    } catch {
      // fall through: bare curve-type strings ('arc', 'linear', …) are valid
    }
    return { type: input };
  }
  return input as Params;
}

function parsePaletteParams(input: string | object | undefined): Params {
  if (input === undefined) return {};
  if (typeof input === 'string') {
    try {
      const o: unknown = JSON.parse(input);
      if (o && typeof o === 'object') return o as Params;
    } catch {
      // the old library silently ignored non-JSON palette params
    }
    return {};
  }
  return input as Params;
}

function buildLegacyModel(
  hsCurve: string | object,
  lCurve: string | object,
  palette?: string | object,
): LegacyModel {
  const hs = makeLegacyCurve(parseCurveParams(hsCurve), 'unitCircle');
  const l = makeLegacyCurve(parseCurveParams(lCurve), 'unitSquare');
  if (hs.overflow === 'clamp') setClampBounds(hs);
  if (l.overflow === 'clamp') setClampBounds(l);

  const p = parsePaletteParams(palette);
  return {
    hs,
    l,
    start: num(p.start) ?? 0,
    end: num(p.end) ?? 1,
    ...(typeof p.name === 'string' ? { name: p.name } : {}),
    ...(typeof p.author === 'string' ? { author: p.author } : {}),
  };
}

/** Port of ColorPalette#getColorValues. */
function legacyColorValues(m: LegacyModel, n: number): { h: number; s: number; l: number } {
  const hsStart = m.hs.overflow === 'clamp' ? Math.max(m.start, m.hs.clampStart) : m.start;
  const hsEnd = m.hs.overflow === 'clamp' ? Math.min(m.end, m.hs.clampEnd) : m.end;
  const lStart = m.l.overflow === 'clamp' ? Math.max(m.start, m.l.clampStart) : m.start;
  const lEnd = m.l.overflow === 'clamp' ? Math.min(m.end, m.l.clampEnd) : m.end;

  const hsC = legacyCoordsAt(m.hs, hsStart + n * (hsEnd - hsStart));
  const h = ((Math.atan2(hsC.y, hsC.x) * 180) / Math.PI) % 360;
  const s = Math.max(0, Math.min(1, Math.sqrt(hsC.x * hsC.x + hsC.y * hsC.y)));

  const lC = legacyCoordsAt(m.l, lStart + n * (lEnd - lStart));
  const l = Math.max(0, Math.min(1, lC.y));

  return { h, s, l };
}

/**
 * Exact legacy-model evaluator, exposed for the golden fidelity tests.
 * Returns hue in degrees (possibly negative, as the old library produced)
 * and saturation/lightness in [0, 1].
 */
export function _evalLegacy(
  hsCurve: string | object,
  lCurve: string | object,
  palette?: string | object,
): (n: number) => { h: number; s: number; l: number } {
  const m = buildLegacyModel(hsCurve, lCurve, palette);
  return (n) => legacyColorValues(m, n);
}

// ---------------------------------------------------------------------------
// Spline fitting
// ---------------------------------------------------------------------------

// 257 dense samples; knots land on the legacy 129-sample grid (even indices),
// while the fit error is also checked at the midpoints between them.
const DENSE = 256;
const FIT_TOLERANCE = 0.005;

function crHandles(
  prev: Vec2 | undefined,
  cur: Vec2,
  next: Vec2 | undefined,
): { hIn: Vec2; hOut: Vec2 } {
  if (prev && next) {
    const hOut: Vec2 = [(next[0] - prev[0]) / 6, (next[1] - prev[1]) / 6];
    return { hIn: [-hOut[0], -hOut[1]], hOut };
  }
  if (next) return { hIn: [0, 0], hOut: [(next[0] - cur[0]) / 3, (next[1] - cur[1]) / 3] };
  if (prev) return { hIn: [(prev[0] - cur[0]) / 3, (prev[1] - cur[1]) / 3], hOut: [0, 0] };
  return { hIn: [0, 0], hOut: [0, 0] };
}

function knotIndices(stride: number): number[] {
  const idx: number[] = [];
  for (let i = 0; i <= DENSE; i += stride) idx.push(i);
  return idx; // stride divides DENSE, so the last index is DENSE
}

function buildWheel(samples: Vec2[], stride: number): PathSpline {
  const idx = knotIndices(stride);
  const points: ControlPoint[] = idx.map((si, j) => {
    const cur = samples[si]!;
    const prev = j > 0 ? samples[idx[j - 1]!]! : undefined;
    const next = j < idx.length - 1 ? samples[idx[j + 1]!]! : undefined;
    const { hIn, hOut } = crHandles(prev, cur, next);
    // t anchors preserve the legacy easing timing at every knot.
    return { x: cur[0], y: cur[1], mode: 'smooth', hIn, hOut, t: si / DENSE };
  });
  return { kind: 'path', points };
}

function buildLight(samples: number[], stride: number): FnSpline {
  const idx = knotIndices(stride);
  const points: ControlPoint[] = idx.map((si, j) => {
    const cur: Vec2 = [si / DENSE, samples[si]!];
    const prev: Vec2 | undefined =
      j > 0 ? [idx[j - 1]! / DENSE, samples[idx[j - 1]!]!] : undefined;
    const next: Vec2 | undefined =
      j < idx.length - 1 ? [idx[j + 1]! / DENSE, samples[idx[j + 1]!]!] : undefined;
    const { hIn, hOut } = crHandles(prev, cur, next);
    return { x: cur[0], y: cur[1], mode: 'smooth', hIn, hOut };
  });
  return { kind: 'fn', points };
}

function fitWheel(samples: Vec2[]): PathSpline {
  for (let stride = 16; ; stride >>= 1) {
    const spline = buildWheel(samples, stride);
    if (stride === 2) return spline; // knot at every legacy sample: exact there
    let maxErr = 0;
    for (let i = 0; i <= DENSE; i++) {
      const [x, y] = evalPath(spline, i / DENSE);
      const s = samples[i]!;
      maxErr = Math.max(maxErr, Math.hypot(x - s[0], y - s[1]));
    }
    if (maxErr <= FIT_TOLERANCE) return spline;
  }
}

function fitLight(samples: number[]): FnSpline {
  for (let stride = 16; ; stride >>= 1) {
    const spline = buildLight(samples, stride);
    if (stride === 2) return spline;
    let maxErr = 0;
    for (let i = 0; i <= DENSE; i++) {
      maxErr = Math.max(maxErr, Math.abs(evalFn(spline, i / DENSE) - samples[i]!));
    }
    if (maxErr <= FIT_TOLERANCE) return spline;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Import a legacy color-curves palette (the three JSON params of the old
 * ColorPalette constructor) as a new-model Palette in the 'hsl' space.
 * Start/end trims, clamp bounds and reverse flags are baked into the fitted
 * splines, so `range` is omitted from the result.
 */
export function importLegacy(
  hsCurve: string | object,
  lCurve: string | object,
  palette?: string | object,
): Palette {
  const m = buildLegacyModel(hsCurve, lCurve, palette);

  const hsStart = m.hs.overflow === 'clamp' ? Math.max(m.start, m.hs.clampStart) : m.start;
  const hsEnd = m.hs.overflow === 'clamp' ? Math.min(m.end, m.hs.clampEnd) : m.end;
  const lStart = m.l.overflow === 'clamp' ? Math.max(m.start, m.l.clampStart) : m.start;
  const lEnd = m.l.overflow === 'clamp' ? Math.min(m.end, m.l.clampEnd) : m.end;

  const wheelSamples: Vec2[] = [];
  const lightSamples: number[] = [];
  for (let i = 0; i <= DENSE; i++) {
    const n = i / DENSE;
    const w = legacyCoordsAt(m.hs, hsStart + n * (hsEnd - hsStart));
    wheelSamples.push([w.x, w.y]);
    const lc = legacyCoordsAt(m.l, lStart + n * (lEnd - lStart));
    lightSamples.push(Math.max(0, Math.min(1, lc.y)));
  }

  return {
    version: 1,
    space: 'hsl',
    wheel: fitWheel(wheelSamples),
    light: fitLight(lightSamples),
    ...(m.name !== undefined ? { name: m.name } : {}),
    ...(m.author !== undefined ? { author: m.author } : {}),
  };
}
