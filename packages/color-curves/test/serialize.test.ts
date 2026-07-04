import { describe, expect, it } from 'vitest';
import { toJSON, parsePalette } from '../src/serialize';
import { encodePaletteUrl, decodePaletteUrl } from '../src/encode';
import { createPalette } from '../src/palette';
import type { Palette } from '../src/types';

const fancy: Palette = {
  version: 1,
  space: 'oklch',
  name: 'Test Palette',
  author: 'Tester',
  range: [0.05, 0.95],
  wheel: {
    kind: 'path',
    closed: true,
    points: [
      { x: 0.6, y: 0, mode: 'smooth', hIn: [0.05, -0.33], hOut: [-0.05, 0.33] },
      { x: 0, y: 0.6, mode: 'corner', hIn: [0.33, 0.05], t: 0.4 },
      { x: -0.6, y: 0, mode: 'smooth', hIn: [0.1, -0.2], hOut: [-0.1, 0.2] },
      { x: 0, y: -0.6 },
    ],
  },
  light: {
    kind: 'fn',
    points: [
      { x: 0, y: 0.15, mode: 'smooth', hOut: [0.4, 0] },
      { x: 0.55, y: 0.5 },
      { x: 1, y: 0.9, mode: 'smooth', hIn: [-0.3, 0] },
    ],
  },
};

describe('JSON serialization', () => {
  it('round-trips exactly (at 4-decimal precision)', () => {
    const json = toJSON(fancy);
    const back = parsePalette(JSON.stringify(json));
    expect(back).toEqual(fancy);
  });

  it('strips defaults', () => {
    const p = createPalette();
    const json = toJSON(p) as unknown as Record<string, unknown>;
    expect(json.range).toBeUndefined();
    expect(json.name).toBeUndefined();
    const points = (json.wheel as { points: Record<string, unknown>[] }).points;
    expect(points.every((pt) => pt.t === undefined)).toBe(true);
  });

  it('accepts a plain object too', () => {
    const back = parsePalette(toJSON(fancy));
    expect(back.space).toBe('oklch');
  });

  it('rejects malformed input with path-annotated errors', () => {
    expect(() => parsePalette('{')).toThrow(TypeError);
    expect(() => parsePalette({ v: 2 })).toThrow(/palette\.v/);
    expect(() => parsePalette({ v: 1, space: 'lab' })).toThrow(/palette\.space/);
    expect(() =>
      parsePalette({
        v: 1,
        space: 'hsl',
        wheel: { points: [{ p: [0, 0] }] },
        light: { points: [{ p: [0, 0.5] }, { p: [1, 0.5] }] },
      }),
    ).toThrow(/wheel\.points/);
    expect(() =>
      parsePalette({
        v: 1,
        space: 'hsl',
        wheel: { points: [{ p: [0, 0] }, { p: [1, 0] }] },
        light: { points: [{ p: [0, 0.5] }, { p: [0.4, 0.6] }, { p: [0.3, 0.7] }, { p: [1, 0.5] }] },
      }),
    ).toThrow(/x must be strictly increasing/);
    expect(() =>
      parsePalette({
        v: 1,
        space: 'hsl',
        wheel: { points: [{ p: [0, 0], t: 0.5 }, { p: [0.5, 0], t: 0.3 }, { p: [1, 0] }] },
        light: { points: [{ p: [0, 0.5] }, { p: [1, 0.5] }] },
      }),
    ).toThrow(/strictly increasing/);
  });
});

describe('URL encoding', () => {
  it('round-trips within quantization error', () => {
    const encoded = encodePaletteUrl(fancy);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    const back = decodePaletteUrl(encoded);

    expect(back.space).toBe(fancy.space);
    expect(back.wheel.closed).toBe(true);
    expect(back.wheel.points.length).toBe(fancy.wheel.points.length);
    expect(back.light.points.length).toBe(fancy.light.points.length);
    expect(back.range![0]).toBeCloseTo(fancy.range![0], 2);
    expect(back.range![1]).toBeCloseTo(fancy.range![1], 2);

    for (let i = 0; i < fancy.wheel.points.length; i++) {
      const a = fancy.wheel.points[i]!;
      const b = back.wheel.points[i]!;
      expect(b.x).toBeCloseTo(a.x, 3);
      expect(b.y).toBeCloseTo(a.y, 3);
      expect(b.mode ?? 'auto').toBe(a.mode ?? 'auto');
      if (a.hIn) {
        expect(b.hIn![0]).toBeCloseTo(a.hIn[0], 3);
        expect(b.hIn![1]).toBeCloseTo(a.hIn[1], 3);
      }
      if (a.t !== undefined) expect(b.t!).toBeCloseTo(a.t, 3);
    }
    // Name/author intentionally excluded from the URL form.
    expect(back.name).toBeUndefined();
  });

  it('stays compact', () => {
    const encoded = encodePaletteUrl(fancy);
    expect(encoded.length).toBeLessThan(200);
  });

  it('rejects garbage', () => {
    expect(() => decodePaletteUrl('!!!')).toThrow(TypeError);
    expect(() => decodePaletteUrl('AA')).toThrow(TypeError);
  });
});
