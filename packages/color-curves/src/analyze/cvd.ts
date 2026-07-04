import type { RGB } from '../types';
import { srgbToLinear, linearToSrgb, clampRgb } from '../spaces/srgb';

export type CVDType = 'protan' | 'deutan' | 'tritan';

// Machado, Oliveira & Fernandes (2009) severity-1.0 simulation matrices,
// applied in linear RGB.
const MATRICES: Record<CVDType, readonly number[]> = {
  protan: [
    0.152286, 1.052583, -0.204868,
    0.114503, 0.786281, 0.099216,
    -0.003882, -0.048116, 1.051998,
  ],
  deutan: [
    0.367322, 0.860646, -0.227968,
    0.280085, 0.672501, 0.047413,
    -0.01182, 0.04294, 0.968881,
  ],
  tritan: [
    1.255528, -0.076749, -0.178779,
    -0.078411, 0.930809, 0.147602,
    0.004733, 0.691367, 0.3039,
  ],
};

/**
 * Simulate color-vision deficiency. `severity` in [0, 1] linearly
 * interpolates the matrix toward identity — an approximation of Machado's
 * per-severity tables, adequate for design previews.
 */
export function simulateCVD(rgb: RGB, type: CVDType, severity = 1): RGB {
  const m = MATRICES[type];
  const s = Math.min(1, Math.max(0, severity));
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  // Clamp in linear space: matrix output can go negative, and a negative
  // base in the transfer function's pow() would yield NaN.
  const mix = (full: number, identity: number) =>
    Math.min(1, Math.max(0, identity + (full - identity) * s));
  const r2 = mix(m[0]! * r + m[1]! * g + m[2]! * b, r);
  const g2 = mix(m[3]! * r + m[4]! * g + m[5]! * b, g);
  const b2 = mix(m[6]! * r + m[7]! * g + m[8]! * b, b);
  return clampRgb({ r: linearToSrgb(r2), g: linearToSrgb(g2), b: linearToSrgb(b2) });
}
