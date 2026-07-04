import type { Color, ControlPoint, FnSpline, Palette, PathSpline, RGB, Vec2 } from './types';
import { evalFn, evalPath } from './spline';
import { gamutMapOklch, MAX_CHROMA } from './spaces/gamut';
import { hslToRgb } from './spaces/hsl';
import { formatHex } from './spaces/srgb';
import { shapes } from './shapes';

export function createPalette(init: Partial<Omit<Palette, 'version'>> = {}): Palette {
  return {
    version: 1,
    space: init.space ?? 'oklch',
    wheel: init.wheel ?? shapes.arc(),
    light: init.light ?? shapes.ramp(0.2, 0.85),
    ...(init.range ? { range: init.range } : {}),
    ...(init.name !== undefined ? { name: init.name } : {}),
    ...(init.author !== undefined ? { author: init.author } : {}),
  };
}

export function colorAt(p: Palette, t: number): Color {
  const [r0, r1] = p.range ?? [0, 1];
  const tt = r0 + Math.min(Math.max(t, 0), 1) * (r1 - r0);
  const [x, y] = evalPath(p.wheel, tt);
  const radial = Math.min(Math.hypot(x, y), 1);
  let h = (Math.atan2(y, x) * 180) / Math.PI;
  if (h < 0) h += 360;
  const light = Math.min(Math.max(evalFn(p.light, tt), 0), 1);

  if (p.space === 'hsl') {
    return {
      space: 'hsl',
      coords: [h, radial, light],
      rgb: hslToRgb(h, radial, light),
      inGamut: true,
    };
  }
  const chroma = radial * MAX_CHROMA;
  const { rgb, clipped } = gamutMapOklch(light, chroma, h);
  return { space: 'oklch', coords: [light, chroma, h], rgb, inGamut: !clipped };
}

export function rgbAt(p: Palette, t: number): RGB {
  return colorAt(p, t).rgb;
}

export function hexAt(p: Palette, t: number): string {
  return formatHex(colorAt(p, t).rgb);
}

const round = (v: number, places: number) => {
  const f = 10 ** places;
  return Math.round(v * f) / f;
};

/** Space-native CSS string from the pre-gamut-map coords. */
export function formatCss(color: Color): string {
  if (color.space === 'oklch') {
    const [l, c, h] = color.coords;
    return `oklch(${round(l * 100, 2)}% ${round(c, 4)} ${round(h, 2)})`;
  }
  const [h, s, l] = color.coords;
  return `hsl(${round(h, 2)} ${round(s * 100, 2)}% ${round(l * 100, 2)}%)`;
}

export function cssAt(p: Palette, t: number): string {
  return formatCss(colorAt(p, t));
}

/** Discrete stops sampled at (i + 0.5) / count. */
export function stops(p: Palette, count: number): Color[] {
  const n = Math.max(1, Math.floor(count));
  return Array.from({ length: n }, (_, i) => colorAt(p, (i + 0.5) / n));
}

export interface CssGradientOptions {
  stops?: number;
  kind?: 'linear' | 'conic';
  angle?: string;
}

export function cssGradient(p: Palette, opts: CssGradientOptions = {}): string {
  const n = Math.max(2, Math.floor(opts.stops ?? 16));
  const kind = opts.kind ?? 'linear';
  const list = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return `${hexAt(p, t)} ${round(t * 100, 2)}%`;
  }).join(', ');
  return kind === 'conic'
    ? `conic-gradient(${list})`
    : `linear-gradient(${opts.angle ?? '90deg'}, ${list})`;
}

/** d3-style interpolator: t ∈ [0, 1] → hex string. */
export function interpolator(p: Palette): (t: number) => string {
  return (t) => hexAt(p, t);
}

function reversePathPoint(pt: ControlPoint): ControlPoint {
  const out: ControlPoint = { x: pt.x, y: pt.y };
  if (pt.mode !== undefined) out.mode = pt.mode;
  if (pt.hOut) out.hIn = pt.hOut;
  if (pt.hIn) out.hOut = pt.hIn;
  if (pt.t !== undefined) out.t = 1 - pt.t;
  return out;
}

function mirrorFnPoint(pt: ControlPoint): ControlPoint {
  const out: ControlPoint = { x: 1 - pt.x, y: pt.y };
  if (pt.mode !== undefined) out.mode = pt.mode;
  if (pt.hOut) out.hIn = [-pt.hOut[0], pt.hOut[1]] as Vec2;
  if (pt.hIn) out.hOut = [-pt.hIn[0], pt.hIn[1]] as Vec2;
  return out;
}

export function reversed(p: Palette): Palette {
  const wheelPts = p.wheel.points.slice().reverse();
  if (p.wheel.closed && wheelPts.length > 1) {
    // Keep the seam point first so cyclic palettes keep their phase.
    wheelPts.unshift(wheelPts.pop()!);
  }
  const wheel: PathSpline = {
    ...p.wheel,
    points: wheelPts.map(reversePathPoint),
  };
  const light: FnSpline = {
    ...p.light,
    points: p.light.points.slice().reverse().map(mirrorFnPoint),
  };
  const out: Palette = { ...p, wheel, light };
  if (p.range) out.range = [1 - p.range[1], 1 - p.range[0]];
  return out;
}
