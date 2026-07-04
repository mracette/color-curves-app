import { describe, expect, it } from 'vitest';
import { createPalette } from 'color-curves';
import { FORMATS, buildSwatchSvg } from './formats';
import { getSamples } from '../state/selectors';

const doc = createPalette({ name: 'Test Palette' });
const samples = getSamples(doc, 5, 'none');

describe('export formats', () => {
  it('every text format produces non-empty output', () => {
    for (const f of FORMATS) {
      if (f.kind === 'png') continue;
      const out = f.generate(samples, doc);
      expect(out.length, f.id).toBeGreaterThan(0);
    }
  });

  it('hex list has one hex per stop', () => {
    const out = FORMATS.find((f) => f.id === 'hex')!.generate(samples, doc);
    const lines = out.split('\n');
    expect(lines.length).toBe(5);
    for (const line of lines) expect(line).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('css custom properties use the palette slug', () => {
    const out = FORMATS.find((f) => f.id === 'css-props')!.generate(samples, doc);
    expect(out).toContain('--test-palette-1:');
    expect(out).toContain('--test-palette-5:');
  });

  it('interpolator snippet embeds valid JSON', () => {
    const out = FORMATS.find((f) => f.id === 'interpolator')!.generate(samples, doc);
    const m = out.match(/parsePalette\((".*")\)/);
    expect(m).toBeTruthy();
    expect(() => JSON.parse(JSON.parse(m![1]!) as string)).not.toThrow();
  });

  it('svg swatches contain one rect per stop', () => {
    const svg = buildSwatchSvg(samples);
    expect(svg.match(/<rect/g)?.length).toBe(5);
    expect(svg).toContain('<svg xmlns');
  });
});

describe('getSamples caching', () => {
  it('returns the same array for the same inputs', () => {
    expect(getSamples(doc, 5, 'none')).toBe(getSamples(doc, 5, 'none'));
    expect(getSamples(doc, 5, 'none')).not.toBe(getSamples(doc, 6, 'none'));
    expect(getSamples(doc, 5, 'none')).not.toBe(getSamples(doc, 5, 'deutan'));
  });
});
