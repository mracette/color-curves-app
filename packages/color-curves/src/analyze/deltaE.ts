import type { RGB } from '../types';
import { rgbToOklab, type Oklab } from '../spaces/oklab';

export function deltaEOKLab(a: Oklab, b: Oklab): number {
  return Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
}

/** Euclidean distance in OKLab. ~0.02 is a just-noticeable difference. */
export function deltaEOK(a: RGB, b: RGB): number {
  return deltaEOKLab(rgbToOklab(a), rgbToOklab(b));
}
