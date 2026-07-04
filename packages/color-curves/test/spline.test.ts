import { describe, expect, it } from 'vitest';
import { evalPath, evalFn, insertPoint, toSegments } from '../src/spline';
import { shapes } from '../src/shapes';
import type { FnSpline, PathSpline } from '../src/types';

describe('path splines', () => {
  it('interpolates anchor points exactly', () => {
    const s: PathSpline = {
      kind: 'path',
      points: [
        { x: -0.8, y: -0.2 },
        { x: 0, y: 0.5 },
        { x: 0.7, y: -0.4 },
      ],
    };
    const start = evalPath(s, 0);
    const end = evalPath(s, 1);
    expect(start[0]).toBeCloseTo(-0.8, 9);
    expect(start[1]).toBeCloseTo(-0.2, 9);
    expect(end[0]).toBeCloseTo(0.7, 9);
    expect(end[1]).toBeCloseTo(-0.4, 9);
  });

  it('a two-point auto spline is a straight line', () => {
    const s = shapes.line([-0.5, -0.5], [0.5, 0.5]);
    for (let i = 0; i <= 10; i++) {
      const [x, y] = evalPath(s, i / 10);
      expect(y).toBeCloseTo(x, 9);
    }
    const mid = evalPath(s, 0.5);
    expect(mid[0]).toBeCloseTo(0, 6);
  });

  it('circle shape stays within radial tolerance', () => {
    const s = shapes.circle({ radius: 0.6 });
    for (let i = 0; i <= 200; i++) {
      const [x, y] = evalPath(s, i / 200);
      expect(Math.abs(Math.hypot(x, y) - 0.6)).toBeLessThan(1e-3);
    }
  });

  it('samples arc-length uniformly', () => {
    const s: PathSpline = {
      kind: 'path',
      points: [
        { x: -0.9, y: 0 },
        { x: -0.3, y: 0.6 },
        { x: 0.4, y: -0.5 },
        { x: 0.9, y: 0.2 },
      ],
    };
    const n = 200;
    const gaps: number[] = [];
    let prev = evalPath(s, 0);
    for (let i = 1; i <= n; i++) {
      const pt = evalPath(s, i / n);
      gaps.push(Math.hypot(pt[0] - prev[0], pt[1] - prev[1]));
      prev = pt;
    }
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    for (const g of gaps) {
      expect(Math.abs(g - mean) / mean).toBeLessThan(0.02);
    }
  });

  it('closed splines are cyclic and C1 at the seam', () => {
    const s: PathSpline = {
      kind: 'path',
      closed: true,
      points: [
        { x: 0.6, y: 0 },
        { x: 0, y: 0.6 },
        { x: -0.6, y: 0 },
        { x: 0, y: -0.6 },
      ],
    };
    const a = evalPath(s, 0);
    const b = evalPath(s, 1);
    expect(a[0]).toBeCloseTo(b[0], 9);
    expect(a[1]).toBeCloseTo(b[1], 9);

    // Tangent continuity across the seam.
    const eps = 1e-3;
    const before = evalPath(s, 1 - eps);
    const after = evalPath(s, eps);
    const din = [b[0] - before[0], b[1] - before[1]];
    const dout = [after[0] - a[0], after[1] - a[1]];
    const angleIn = Math.atan2(din[1]!, din[0]!);
    const angleOut = Math.atan2(dout[1]!, dout[0]!);
    let diff = Math.abs(angleIn - angleOut);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    expect(diff).toBeLessThan(0.05);
  });

  it('explicit t anchors re-time the knots', () => {
    const s: PathSpline = {
      kind: 'path',
      points: [
        { x: 0, y: 0, t: 0 },
        { x: 1, y: 0, t: 0.8 },
        { x: 2, y: 0, t: 1 },
      ],
    };
    expect(evalPath(s, 0.4)[0]).toBeCloseTo(0.5, 3);
    expect(evalPath(s, 0.8)[0]).toBeCloseTo(1, 3);
    expect(evalPath(s, 0.9)[0]).toBeCloseTo(1.5, 3);
  });

  it('holds endpoints outside the anchored range', () => {
    const s: PathSpline = {
      kind: 'path',
      points: [
        { x: 0, y: 0, t: 0.2 },
        { x: 1, y: 0 },
      ],
    };
    expect(evalPath(s, 0)[0]).toBeCloseTo(0, 9);
    expect(evalPath(s, 0.1)[0]).toBeCloseTo(0, 9);
  });

  it('insertPoint preserves the shape', () => {
    const s: PathSpline = {
      kind: 'path',
      points: [
        { x: -0.9, y: 0.1 },
        { x: -0.2, y: 0.7, mode: 'smooth', hIn: [-0.2, -0.1], hOut: [0.25, 0.125] },
        { x: 0.5, y: -0.5 },
        { x: 0.9, y: 0.3 },
      ],
    };
    const before = Array.from({ length: 101 }, (_, i) => evalPath(s, i / 100));
    const inserted = insertPoint(s, 0.37);
    expect(inserted.points.length).toBe(5);
    for (let i = 0; i <= 100; i++) {
      const after = evalPath(inserted, i / 100);
      const dist = Math.hypot(after[0] - before[i]![0], after[1] - before[i]![1]);
      expect(dist).toBeLessThan(2e-3);
    }
  });

  it('insertPoint into a closed seam segment works', () => {
    const s = shapes.circle({ radius: 0.5 });
    const before = Array.from({ length: 101 }, (_, i) => evalPath(s, i / 100));
    const inserted = insertPoint(s, 0.95);
    expect(inserted.points.length).toBe(5);
    for (let i = 0; i <= 100; i++) {
      const after = evalPath(inserted, i / 100);
      const dist = Math.hypot(after[0] - before[i]![0], after[1] - before[i]![1]);
      expect(dist).toBeLessThan(2e-3);
    }
  });
});

describe('fn splines', () => {
  it('matches an independent brute-force cubic-bezier inversion', () => {
    const s: FnSpline = {
      kind: 'fn',
      points: [
        { x: 0, y: 0, mode: 'smooth', hOut: [0.25, 0.1] },
        { x: 1, y: 1, mode: 'smooth', hIn: [-0.75, 0] },
      ],
    };
    // Equivalent CSS cubic-bezier(0.25, 0.1, 0.25, 1).
    const ref = (x: number) => {
      let bestY = 0;
      let bestErr = Infinity;
      for (let i = 0; i <= 100000; i++) {
        const u = i / 100000;
        const v = 1 - u;
        const xu = 3 * v * v * u * 0.25 + 3 * v * u * u * 0.25 + u * u * u;
        const err = Math.abs(xu - x);
        if (err < bestErr) {
          bestErr = err;
          bestY = 3 * v * v * u * 0.1 + 3 * v * u * u * 1 + u * u * u;
        }
      }
      return bestY;
    };
    for (const x of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(evalFn(s, x)).toBeCloseTo(ref(x), 4);
    }
  });

  it('clamps handle x to keep x(u) monotone and solvable', () => {
    const s: FnSpline = {
      kind: 'fn',
      points: [
        { x: 0, y: 0, mode: 'corner', hOut: [2, 0.5] },
        { x: 1, y: 1, mode: 'corner', hIn: [-2, -0.5] },
      ],
    };
    let prev = -Infinity;
    for (let i = 0; i <= 100; i++) {
      const y = evalFn(s, i / 100);
      expect(Number.isFinite(y)).toBe(true);
      // y should still be monotone here since the curve is symmetric
      expect(y).toBeGreaterThanOrEqual(prev - 1e-6);
      prev = y;
    }
  });

  it('auto tangents pass through every point', () => {
    const s: FnSpline = {
      kind: 'fn',
      points: [
        { x: 0, y: 0.2 },
        { x: 0.3, y: 0.8 },
        { x: 0.7, y: 0.4 },
        { x: 1, y: 0.9 },
      ],
    };
    expect(evalFn(s, 0)).toBeCloseTo(0.2, 6);
    expect(evalFn(s, 0.3)).toBeCloseTo(0.8, 6);
    expect(evalFn(s, 0.7)).toBeCloseTo(0.4, 6);
    expect(evalFn(s, 1)).toBeCloseTo(0.9, 6);
  });

  it('insertPoint preserves fn shape', () => {
    const s: FnSpline = {
      kind: 'fn',
      points: [
        { x: 0, y: 0.1 },
        { x: 0.5, y: 0.9 },
        { x: 1, y: 0.3 },
      ],
    };
    const inserted = insertPoint(s, 0.25);
    expect(inserted.points.length).toBe(4);
    for (let i = 0; i <= 100; i++) {
      expect(evalFn(inserted, i / 100)).toBeCloseTo(evalFn(s, i / 100), 4);
    }
  });
});

describe('toSegments', () => {
  it('returns one segment per span', () => {
    expect(toSegments(shapes.line([0, 0], [1, 1])).length).toBe(1);
    expect(toSegments(shapes.circle()).length).toBe(4);
    const fn = shapes.ramp(0.2, 0.8);
    expect(toSegments(fn).length).toBe(1);
  });
});
