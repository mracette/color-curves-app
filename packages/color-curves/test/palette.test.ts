import { describe, expect, it } from 'vitest';
import {
  createPalette,
  colorAt,
  hexAt,
  cssAt,
  stops,
  cssGradient,
  interpolator,
  reversed,
} from '../src/palette';
import { shapes } from '../src/shapes';
import { hslToRgb } from '../src/spaces/hsl';

describe('palette sampling', () => {
  it('creates a sensible default palette', () => {
    const p = createPalette();
    expect(p.space).toBe('oklch');
    const c = colorAt(p, 0.5);
    expect(c.rgb.r).toBeGreaterThanOrEqual(0);
    expect(c.rgb.r).toBeLessThanOrEqual(1);
    expect(hexAt(p, 0)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('maps wheel geometry to hue/saturation in hsl mode', () => {
    // A point at angle 0, radius 0.8 with lightness 0.5 is hsl(0, 80%, 50%).
    const p = createPalette({
      space: 'hsl',
      wheel: shapes.line([0.8, 0], [0.8, 0.0001]),
      light: shapes.ramp(0.5, 0.5),
    });
    const c = colorAt(p, 0);
    const expected = hslToRgb(0, 0.8, 0.5);
    expect(c.rgb.r).toBeCloseTo(expected.r, 3);
    expect(c.rgb.g).toBeCloseTo(expected.g, 3);
    expect(c.rgb.b).toBeCloseTo(expected.b, 3);
    expect(c.inGamut).toBe(true);
  });

  it('projects out-of-disk geometry onto the rim', () => {
    const p = createPalette({
      space: 'hsl',
      wheel: shapes.line([1.5, 0], [2, 0]),
      light: shapes.ramp(0.5, 0.5),
    });
    const c = colorAt(p, 0.5);
    // radius clamped to 1 → full saturation, hue preserved
    expect(c.coords[1]).toBe(1);
    expect(c.coords[0]).toBeCloseTo(0, 6);
  });

  it('flags out-of-gamut oklch colors and returns displayable rgb', () => {
    const p = createPalette({
      wheel: shapes.line([0.99, 0.01], [1, 0.01]),
      light: shapes.ramp(0.97, 0.97),
    });
    const c = colorAt(p, 0.5);
    expect(c.inGamut).toBe(false);
    for (const v of [c.rgb.r, c.rgb.g, c.rgb.b]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('applies range trim', () => {
    const base = createPalette({ space: 'hsl' });
    const trimmed = { ...base, range: [0.5, 1] as [number, number] };
    expect(hexAt(trimmed, 0)).toBe(hexAt(base, 0.5));
    expect(hexAt(trimmed, 1)).toBe(hexAt(base, 1));
  });

  it('closed wheels produce cyclic palettes', () => {
    const p = createPalette({
      wheel: shapes.circle({ radius: 0.5 }),
      light: shapes.ramp(0.6, 0.6),
    });
    expect(hexAt(p, 0)).toBe(hexAt(p, 1));
  });

  it('stops samples midpoints', () => {
    const p = createPalette();
    const s = stops(p, 6);
    expect(s.length).toBe(6);
    expect(s[0]!.rgb).toEqual(colorAt(p, 0.5 / 6).rgb);
  });

  it('cssGradient and cssAt produce plausible css', () => {
    const p = createPalette();
    expect(cssGradient(p)).toMatch(/^linear-gradient\(90deg, #/);
    expect(cssGradient(p, { kind: 'conic', stops: 4 })).toMatch(/^conic-gradient\(#/);
    expect(cssAt(p, 0.3)).toMatch(/^oklch\(/);
    expect(cssAt({ ...p, space: 'hsl' }, 0.3)).toMatch(/^hsl\(/);
  });

  it('interpolator matches hexAt', () => {
    const p = createPalette();
    const f = interpolator(p);
    expect(f(0.42)).toBe(hexAt(p, 0.42));
  });

  it('reversed plays the palette backwards', () => {
    const p = createPalette({
      wheel: shapes.sCurve(),
      light: shapes.ease(0.2, 0.9),
      range: [0.1, 0.9],
    });
    const r = reversed(p);
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const a = colorAt(p, t).rgb;
      const b = colorAt(r, 1 - t).rgb;
      expect(b.r).toBeCloseTo(a.r, 2);
      expect(b.g).toBeCloseTo(a.g, 2);
      expect(b.b).toBeCloseTo(a.b, 2);
    }
  });
});
