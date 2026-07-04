export type Vec2 = readonly [number, number];

export type PointMode = 'auto' | 'smooth' | 'corner';

export interface ControlPoint {
  x: number;
  y: number;
  /** default 'auto': tangents computed from neighbors (Catmull-Rom style) */
  mode?: PointMode;
  /** Tangent handles, RELATIVE to (x, y). Present when explicitly pulled. */
  hIn?: Vec2;
  hOut?: Vec2;
  /**
   * Optional explicit position of this point along t in [0, 1] (path splines
   * only). Points without t are spaced by arc length between anchored
   * neighbors.
   */
  t?: number;
}

/** 2D path on the color wheel (angle → hue, radius → chroma/saturation). */
export interface PathSpline {
  kind: 'path';
  points: ControlPoint[];
  /** Closed loop ⇒ cyclic palette (color at 0 === color at 1). */
  closed?: boolean;
}

/**
 * Lightness as a true function y = f(x) with x = t. Point x strictly
 * increasing; first point at x = 0, last at x = 1. `t` and `closed` unused.
 */
export interface FnSpline {
  kind: 'fn';
  points: ControlPoint[];
}

export type ColorSpaceId = 'oklch' | 'hsl';

export interface Palette {
  version: 1;
  space: ColorSpaceId;
  wheel: PathSpline;
  light: FnSpline;
  /** Trim of the sampled range, default [0, 1]. */
  range?: [number, number];
  name?: string;
  author?: string;
}

/** sRGB with components in [0, 1]. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Color {
  space: ColorSpaceId;
  /** Pre-gamut-map coords: [L, C, H] (oklch) or [H, S, L] (hsl). H in degrees. */
  coords: readonly [number, number, number];
  /** Gamut-mapped, displayable sRGB. */
  rgb: RGB;
  /** False if coords were outside sRGB and chroma-reduced. Always true in 'hsl'. */
  inGamut: boolean;
}

export interface CubicSegment {
  p0: Vec2;
  c1: Vec2;
  c2: Vec2;
  p3: Vec2;
}
