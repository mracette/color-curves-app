import { describe, expect, it } from 'vitest';
import { createPalette, shapes, evalPath } from 'color-curves';
import { rotateWheelCurve, scaleWheelCurve } from './docOps';

const doc = createPalette({ wheel: shapes.arc({ radius: 0.6 }) });

describe('wheel curve transforms', () => {
  it('rotation preserves radii and rotates positions', () => {
    const rotated = rotateWheelCurve(doc, Math.PI / 2);
    for (let i = 0; i < doc.wheel.points.length; i++) {
      const a = doc.wheel.points[i]!;
      const b = rotated.wheel.points[i]!;
      expect(Math.hypot(b.x, b.y)).toBeCloseTo(Math.hypot(a.x, a.y), 9);
      // 90° CCW: (x, y) → (−y, x)
      expect(b.x).toBeCloseTo(-a.y, 9);
      expect(b.y).toBeCloseTo(a.x, 9);
    }
    // Curve geometry rotates as a whole, not just the anchors.
    const mid = evalPath(doc.wheel, 0.5);
    const midRot = evalPath(rotated.wheel, 0.5);
    expect(midRot[0]).toBeCloseTo(-mid[1], 6);
    expect(midRot[1]).toBeCloseTo(mid[0], 6);
  });

  it('scaling multiplies radii and handles', () => {
    const scaled = scaleWheelCurve(doc, 1.2);
    const a = doc.wheel.points[0]!;
    const b = scaled.wheel.points[0]!;
    expect(b.x).toBeCloseTo(a.x * 1.2, 9);
    expect(b.y).toBeCloseTo(a.y * 1.2, 9);
    if (a.hOut) {
      expect(b.hOut![0]).toBeCloseTo(a.hOut[0] * 1.2, 9);
    }
  });

  it('scaling is capped against collapse and blow-up', () => {
    let d = doc;
    for (let i = 0; i < 100; i++) d = scaleWheelCurve(d, 10);
    let maxR = 0;
    for (const pt of d.wheel.points) maxR = Math.max(maxR, Math.hypot(pt.x, pt.y));
    expect(maxR).toBeLessThanOrEqual(3.5 + 1e-9);

    let s = doc;
    for (let i = 0; i < 100; i++) s = scaleWheelCurve(s, 0.01);
    let r = 0;
    for (const pt of s.wheel.points) r = Math.max(r, Math.hypot(pt.x, pt.y));
    expect(r).toBeGreaterThanOrEqual(0.05 - 1e-9);
  });
});
