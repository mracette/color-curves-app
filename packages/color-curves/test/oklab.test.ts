import { describe, expect, it } from 'vitest';
import { rgbToOklab, oklabToRgb, rgbToOklch, oklchToRgb } from '../src/spaces/oklab';

describe('oklab', () => {
  // CSS Color 4 / Ottosson reference values for sRGB primaries.
  it('matches published vectors', () => {
    const red = rgbToOklab({ r: 1, g: 0, b: 0 });
    expect(red.L).toBeCloseTo(0.62796, 4);
    expect(red.a).toBeCloseTo(0.22486, 4);
    expect(red.b).toBeCloseTo(0.12585, 4);

    const green = rgbToOklab({ r: 0, g: 1, b: 0 });
    expect(green.L).toBeCloseTo(0.86644, 4);
    expect(green.a).toBeCloseTo(-0.23389, 4);
    expect(green.b).toBeCloseTo(0.1795, 4);

    const blue = rgbToOklab({ r: 0, g: 0, b: 1 });
    expect(blue.L).toBeCloseTo(0.45201, 4);
    expect(blue.a).toBeCloseTo(-0.03246, 4);
    expect(blue.b).toBeCloseTo(-0.31153, 4);

    const white = rgbToOklab({ r: 1, g: 1, b: 1 });
    expect(white.L).toBeCloseTo(1, 4);
    expect(white.a).toBeCloseTo(0, 4);
    expect(white.b).toBeCloseTo(0, 4);

    const black = rgbToOklab({ r: 0, g: 0, b: 0 });
    expect(black.L).toBeCloseTo(0, 6);
  });

  it('round-trips over an rgb lattice', () => {
    for (let ri = 0; ri <= 16; ri++) {
      for (let gi = 0; gi <= 16; gi++) {
        for (let bi = 0; bi <= 16; bi++) {
          const rgb = { r: ri / 16, g: gi / 16, b: bi / 16 };
          const back = oklabToRgb(rgbToOklab(rgb));
          expect(Math.abs(back.r - rgb.r)).toBeLessThan(5e-6);
          expect(Math.abs(back.g - rgb.g)).toBeLessThan(5e-6);
          expect(Math.abs(back.b - rgb.b)).toBeLessThan(5e-6);
        }
      }
    }
  });

  it('oklch round-trips and wraps hue into [0, 360)', () => {
    const rgb = { r: 0.8, g: 0.3, b: 0.5 };
    const lch = rgbToOklch(rgb);
    expect(lch.h).toBeGreaterThanOrEqual(0);
    expect(lch.h).toBeLessThan(360);
    const back = oklchToRgb(lch.l, lch.c, lch.h);
    expect(back.r).toBeCloseTo(rgb.r, 6);
    expect(back.g).toBeCloseTo(rgb.g, 6);
    expect(back.b).toBeCloseTo(rgb.b, 6);
  });
});
