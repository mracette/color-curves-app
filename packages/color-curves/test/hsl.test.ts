import { describe, expect, it } from 'vitest';
import { hslToRgb, rgbToHsl } from '../src/spaces/hsl';

describe('hsl', () => {
  it('hits the known corners', () => {
    expect(hslToRgb(0, 1, 0.5)).toEqual({ r: 1, g: 0, b: 0 });
    expect(hslToRgb(120, 1, 0.5)).toEqual({ r: 0, g: 1, b: 0 });
    expect(hslToRgb(240, 1, 0.5)).toEqual({ r: 0, g: 0, b: 1 });
    expect(hslToRgb(0, 0, 1)).toEqual({ r: 1, g: 1, b: 1 });
    expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
    const gray = hslToRgb(123, 0, 0.5);
    expect(gray.r).toBeCloseTo(0.5, 10);
    expect(gray.g).toBeCloseTo(0.5, 10);
  });

  it('wraps hue and handles negatives', () => {
    const a = hslToRgb(360 + 45, 0.8, 0.6);
    const b = hslToRgb(45, 0.8, 0.6);
    const c = hslToRgb(45 - 720, 0.8, 0.6);
    expect(a).toEqual(b);
    expect(c).toEqual(b);
  });

  it('round-trips', () => {
    for (let h = 0; h < 360; h += 36) {
      for (const s of [0.2, 0.6, 1]) {
        for (const l of [0.25, 0.5, 0.75]) {
          const rgb = hslToRgb(h, s, l);
          const back = rgbToHsl(rgb);
          expect(back.h).toBeCloseTo(h, 6);
          expect(back.s).toBeCloseTo(s, 6);
          expect(back.l).toBeCloseTo(l, 6);
        }
      }
    }
  });
});
