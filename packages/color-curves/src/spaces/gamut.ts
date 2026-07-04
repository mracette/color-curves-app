import type { RGB } from '../types';
import { oklchToRgb, rgbToOklab, oklchToOklab } from './oklab';
import { clampRgb } from './srgb';
import { deltaEOKLab } from '../analyze/deltaE';

/**
 * Display scale of the OKLCH wheel: radius 1 ⇔ chroma 0.4. Exceeds the
 * maximum sRGB chroma (~0.32) so the entire sRGB gamut fits inside the disk.
 * A format constant of palette version 1 — changing it rescales the color
 * meaning of every serialized wheel curve.
 */
export const MAX_CHROMA = 0.4;

const JND = 0.02;
const EPSILON = 1e-4;

export function inGamut(rgb: RGB, eps = 1e-6): boolean {
  return (
    rgb.r >= -eps && rgb.r <= 1 + eps &&
    rgb.g >= -eps && rgb.g <= 1 + eps &&
    rgb.b >= -eps && rgb.b <= 1 + eps
  );
}

/**
 * CSS Color 4 style gamut mapping: hold L and H, bisect chroma, with the
 * clipped-candidate early exit when the clip is within a just-noticeable
 * difference of the candidate.
 */
export function gamutMapOklch(l: number, c: number, h: number): { rgb: RGB; clipped: boolean } {
  if (l <= 0) return { rgb: { r: 0, g: 0, b: 0 }, clipped: l < 0 || c > 0 };
  if (l >= 1) return { rgb: { r: 1, g: 1, b: 1 }, clipped: l > 1 || c > 0 };

  const raw = oklchToRgb(l, c, h);
  if (inGamut(raw)) return { rgb: clampRgb(raw), clipped: false };

  let min = 0;
  let max = c;
  let current = raw;
  while (max - min > EPSILON) {
    const chroma = (min + max) / 2;
    current = oklchToRgb(l, chroma, h);
    if (inGamut(current)) {
      min = chroma;
    } else {
      const clipped = clampRgb(current);
      if (deltaEOKLab(rgbToOklab(clipped), oklchToOklab(l, chroma, h)) < JND) {
        return { rgb: clipped, clipped: true };
      }
      max = chroma;
    }
  }
  return { rgb: clampRgb(current), clipped: true };
}

/** Max sRGB-representable OKLCH chroma at (l, h). */
export function maxChroma(l: number, h: number): number {
  if (l <= 0 || l >= 1) return 0;
  let lo = 0;
  let hi = MAX_CHROMA;
  if (inGamut(oklchToRgb(l, hi, h))) return hi;
  while (hi - lo > EPSILON) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToRgb(l, mid, h))) lo = mid;
    else hi = mid;
  }
  return lo;
}
