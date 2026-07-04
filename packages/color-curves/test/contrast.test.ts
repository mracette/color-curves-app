import { describe, expect, it } from 'vitest';
import { contrastWCAG, contrastAPCA, relativeLuminance } from '../src/analyze/contrast';
import { simulateCVD } from '../src/analyze/cvd';
import { deltaEOK } from '../src/analyze/deltaE';
import { parseHex } from '../src/spaces/srgb';

const WHITE = { r: 1, g: 1, b: 1 };
const BLACK = { r: 0, g: 0, b: 0 };

describe('WCAG contrast', () => {
  it('white on black is 21', () => {
    expect(contrastWCAG(WHITE, BLACK)).toBeCloseTo(21, 4);
    expect(contrastWCAG(BLACK, WHITE)).toBeCloseTo(21, 4);
  });

  it('#767676 on white is ~4.54', () => {
    expect(contrastWCAG(parseHex('#767676'), WHITE)).toBeCloseTo(4.54, 2);
  });

  it('luminance endpoints', () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 6);
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 6);
  });
});

describe('APCA contrast', () => {
  // Published apca-w3 0.0.98G-4g test vectors.
  it('matches the published test vectors', () => {
    expect(contrastAPCA(parseHex('#888888'), parseHex('#ffffff'))).toBeCloseTo(63.056469930209424, 6);
    expect(contrastAPCA(parseHex('#ffffff'), parseHex('#888888'))).toBeCloseTo(-68.54146436644962, 6);
    expect(contrastAPCA(parseHex('#000000'), parseHex('#aaaaaa'))).toBeCloseTo(58.146262578561334, 6);
    expect(contrastAPCA(parseHex('#aaaaaa'), parseHex('#000000'))).toBeCloseTo(-56.24113336839742, 6);
  });

  it('pins additional regression values', () => {
    expect(contrastAPCA(parseHex('#123456'), parseHex('#abcdef'))).toBeCloseTo(67.49580801281017, 6);
    expect(contrastAPCA(parseHex('#abcdef'), parseHex('#123456'))).toBeCloseTo(-68.09425609561465, 6);
  });

  it('identical colors have zero contrast', () => {
    expect(contrastAPCA(parseHex('#777777'), parseHex('#777777'))).toBe(0);
  });
});

describe('CVD simulation', () => {
  it('severity 0 is identity', () => {
    const rgb = { r: 0.7, g: 0.3, b: 0.2 };
    for (const type of ['protan', 'deutan', 'tritan'] as const) {
      const out = simulateCVD(rgb, type, 0);
      expect(out.r).toBeCloseTo(rgb.r, 6);
      expect(out.g).toBeCloseTo(rgb.g, 6);
      expect(out.b).toBeCloseTo(rgb.b, 6);
    }
  });

  it('protanopia collapses red-green difference', () => {
    const red = simulateCVD({ r: 1, g: 0, b: 0 }, 'protan');
    const green = simulateCVD({ r: 0, g: 0.65, b: 0 }, 'protan');
    expect(deltaEOK(red, green)).toBeLessThan(
      deltaEOK({ r: 1, g: 0, b: 0 }, { r: 0, g: 0.65, b: 0 }),
    );
  });

  it('output stays in range', () => {
    for (const type of ['protan', 'deutan', 'tritan'] as const) {
      for (const rgb of [WHITE, BLACK, { r: 1, g: 0, b: 0 }, { r: 0, g: 0, b: 1 }]) {
        const out = simulateCVD(rgb, type);
        for (const v of [out.r, out.g, out.b]) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
          expect(Number.isFinite(v)).toBe(true);
        }
      }
    }
  });
});

describe('deltaEOK', () => {
  it('is zero for identical colors and symmetric', () => {
    const a = { r: 0.4, g: 0.5, b: 0.6 };
    const b = { r: 0.6, g: 0.2, b: 0.1 };
    expect(deltaEOK(a, a)).toBe(0);
    expect(deltaEOK(a, b)).toBeCloseTo(deltaEOK(b, a), 12);
    expect(deltaEOK(a, b)).toBeGreaterThan(0);
  });
});
