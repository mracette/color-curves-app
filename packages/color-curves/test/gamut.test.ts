import { describe, expect, it } from 'vitest';
import { gamutMapOklch, inGamut, maxChroma, MAX_CHROMA } from '../src/spaces/gamut';
import { oklchToRgb } from '../src/spaces/oklab';

describe('gamut', () => {
  it('leaves in-gamut colors untouched', () => {
    const { rgb, clipped } = gamutMapOklch(0.6, 0.1, 30);
    const raw = oklchToRgb(0.6, 0.1, 30);
    expect(clipped).toBe(false);
    expect(rgb.r).toBeCloseTo(raw.r, 6);
    expect(rgb.g).toBeCloseTo(raw.g, 6);
    expect(rgb.b).toBeCloseTo(raw.b, 6);
  });

  it('always returns displayable sRGB', () => {
    for (let h = 0; h < 360; h += 15) {
      for (let l = 0.05; l < 1; l += 0.1) {
        const { rgb } = gamutMapOklch(l, MAX_CHROMA, h);
        expect(rgb.r).toBeGreaterThanOrEqual(0);
        expect(rgb.r).toBeLessThanOrEqual(1);
        expect(rgb.g).toBeGreaterThanOrEqual(0);
        expect(rgb.g).toBeLessThanOrEqual(1);
        expect(rgb.b).toBeGreaterThanOrEqual(0);
        expect(rgb.b).toBeLessThanOrEqual(1);
        expect(Number.isFinite(rgb.r)).toBe(true);
      }
    }
  });

  it('handles the lightness fast paths', () => {
    expect(gamutMapOklch(0, 0.2, 100).rgb).toEqual({ r: 0, g: 0, b: 0 });
    expect(gamutMapOklch(1, 0.2, 100).rgb).toEqual({ r: 1, g: 1, b: 1 });
    expect(gamutMapOklch(-0.1, 0, 0).rgb).toEqual({ r: 0, g: 0, b: 0 });
    expect(gamutMapOklch(1.1, 0, 0).rgb).toEqual({ r: 1, g: 1, b: 1 });
  });

  it('maxChroma brackets the gamut boundary', () => {
    for (let h = 0; h < 360; h += 30) {
      for (const l of [0.3, 0.5, 0.7, 0.9]) {
        const c = maxChroma(l, h);
        expect(c).toBeGreaterThan(0);
        expect(inGamut(oklchToRgb(l, Math.max(0, c - 1e-3), h))).toBe(true);
        if (c < MAX_CHROMA) {
          expect(inGamut(oklchToRgb(l, c + 1e-3, h))).toBe(false);
        }
      }
    }
    expect(maxChroma(0, 180)).toBe(0);
    expect(maxChroma(1, 180)).toBe(0);
  });
});
