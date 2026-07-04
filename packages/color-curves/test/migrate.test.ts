import { describe, expect, it } from 'vitest';
import { importLegacy, _evalLegacy } from '../src/migrate';
import { colorAt } from '../src/palette';
import { hslToRgb } from '../src/spaces/hsl';
import { deltaEOK } from '../src/analyze/deltaE';
import { presets } from '../src/presets';
import { legacyPresets } from '../scripts/legacy-palettes';

const SAMPLES = 64;

function fidelity(preset: (typeof legacyPresets)[number]) {
  const legacy = _evalLegacy(preset.hs, preset.l, preset.palette);
  const imported = importLegacy(preset.hs, preset.l, preset.palette);
  let sum = 0;
  let max = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const { h, s, l } = legacy(t);
    const dE = deltaEOK(hslToRgb(h, s, l), colorAt(imported, t).rgb);
    sum += dE;
    max = Math.max(max, dE);
  }
  return { mean: sum / SAMPLES, max };
}

describe('importLegacy golden fidelity', () => {
  for (const preset of legacyPresets) {
    const name = (JSON.parse(preset.palette) as { name: string }).name;
    it(`reproduces ${name} within tolerance`, () => {
      const { mean, max } = fidelity(preset);
      expect(mean).toBeLessThan(0.01);
      expect(max).toBeLessThan(0.03);
    });
  }
});

describe('importLegacy input handling', () => {
  const hsObj = {
    type: 'linear',
    overflow: 'clamp',
    translation: { x: -0.5, y: 0 },
    scale: { x: 1, y: 0.3 },
    rotation: 0,
  };
  const lObj = {
    type: 'linear',
    overflow: 'clamp',
    translation: { x: 0, y: 0.2 },
    scale: { x: 1, y: 0.5 },
    rotation: 0,
  };

  it('accepts objects and JSON strings interchangeably', () => {
    const fromObjects = importLegacy(hsObj, lObj, { start: 0, end: 1, name: 'X' });
    const fromStrings = importLegacy(
      JSON.stringify(hsObj),
      JSON.stringify(lObj),
      JSON.stringify({ start: 0, end: 1, name: 'X' }),
    );
    expect(fromObjects).toEqual(fromStrings);
    expect(fromObjects.name).toBe('X');
  });

  it('sets space hsl and omits range', () => {
    const p = importLegacy(hsObj, lObj);
    expect(p.space).toBe('hsl');
    expect(p.version).toBe(1);
    expect(p.range).toBeUndefined();
    expect(p.name).toBeUndefined();
  });

  it('sets name and author from palette params', () => {
    const p = importLegacy(hsObj, lObj, '{"name":"N","author":"A"}');
    expect(p.name).toBe('N');
    expect(p.author).toBe('A');
  });

  it('handles a fully out-of-bounds clamp curve as a constant palette', () => {
    // hs curve entirely outside the unit circle: legacy clamp bounds
    // degenerate to [0, 0], so every sample is the same projected point.
    const p = importLegacy(
      { type: 'linear', overflow: 'clamp', translation: { x: 5, y: 0 } },
      lObj,
    );
    const a = colorAt(p, 0);
    const b = colorAt(p, 1);
    expect(a.coords[0]).toBeCloseTo(b.coords[0], 6);
    expect(a.coords[1]).toBeCloseTo(b.coords[1], 6);
    for (const v of [a.rgb.r, a.rgb.g, a.rgb.b]) expect(Number.isFinite(v)).toBe(true);
  });
});

describe('presets', () => {
  it('contains the 13 legacy presets in alphabetical order', () => {
    const names = presets.map((p) => p.name);
    expect(names).toEqual([
      'All Around',
      'Beyond Belief',
      'Candy Paint',
      'Coral Scrub',
      'Goldfish Deluxe',
      'On Vacation',
      'Phyto Plankton',
      'Polar Beyond',
      'Power Washed',
      'Stock Image',
      'Trix Sky',
      'Un-American',
      'Warm Magma',
    ]);
    for (const p of presets) expect(p.space).toBe('hsl');
  });

  it('matches fresh importLegacy output within rounding error', () => {
    for (let i = 0; i < legacyPresets.length; i++) {
      const preset = legacyPresets[i]!;
      const fresh = importLegacy(preset.hs, preset.l, preset.palette);
      for (let j = 0; j <= 8; j++) {
        const t = j / 8;
        const dE = deltaEOK(colorAt(presets[i]!, t).rgb, colorAt(fresh, t).rgb);
        expect(dE).toBeLessThan(0.005);
      }
    }
  });
});
