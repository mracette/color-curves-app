import type { ControlPoint, FnSpline, PathSpline, Vec2 } from './types';

/** Handle length that makes a cubic Bézier best fit a circular arc of sweep Δ. */
function arcHandle(radius: number, sweep: number): number {
  return (4 / 3) * Math.tan(Math.abs(sweep) / 4) * radius;
}

interface ArcOptions {
  cx?: number;
  cy?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

function arcPoints(o: Required<ArcOptions>): ControlPoint[] {
  const sweep = o.endAngle - o.startAngle;
  const steps = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2)));
  const delta = sweep / steps;
  const k = arcHandle(o.radius, delta);
  const dir = Math.sign(sweep) || 1;
  const points: ControlPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = o.startAngle + delta * i;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tangent: Vec2 = [-sin * dir, cos * dir];
    const pt: ControlPoint = {
      x: o.cx + o.radius * cos,
      y: o.cy + o.radius * sin,
      mode: 'smooth',
    };
    if (i > 0) pt.hIn = [-tangent[0] * k, -tangent[1] * k];
    if (i < steps) pt.hOut = [tangent[0] * k, tangent[1] * k];
    points.push(pt);
  }
  return points;
}

function arc(o: ArcOptions = {}): PathSpline {
  const opts = {
    cx: o.cx ?? 0,
    cy: o.cy ?? 0,
    radius: o.radius ?? 0.6,
    startAngle: o.startAngle ?? Math.PI * 0.75,
    endAngle: o.endAngle ?? -Math.PI * 0.25,
  };
  return { kind: 'path', points: arcPoints(opts) };
}

function circle(o: { cx?: number; cy?: number; radius?: number } = {}): PathSpline {
  const cx = o.cx ?? 0;
  const cy = o.cy ?? 0;
  const radius = o.radius ?? 0.6;
  const k = arcHandle(radius, Math.PI / 2);
  const points: ControlPoint[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    points.push({
      x: cx + radius * cos,
      y: cy + radius * sin,
      mode: 'smooth',
      hIn: [sin * k, -cos * k],
      hOut: [-sin * k, cos * k],
    });
  }
  return { kind: 'path', points, closed: true };
}

function line(from: Vec2, to: Vec2): PathSpline {
  return {
    kind: 'path',
    points: [
      { x: from[0], y: from[1] },
      { x: to[0], y: to[1] },
    ],
  };
}

interface WaveOptions {
  from?: Vec2;
  to?: Vec2;
  amplitude?: number;
  periods?: number;
}

function wave(o: WaveOptions = {}): PathSpline {
  const from = o.from ?? [-0.75, -0.25];
  const to = o.to ?? [0.75, 0.25];
  const amplitude = o.amplitude ?? 0.3;
  const periods = o.periods ?? 1.5;
  const chord: Vec2 = [to[0] - from[0], to[1] - from[1]];
  const len = Math.hypot(chord[0], chord[1]) || 1;
  const perp: Vec2 = [-chord[1] / len, chord[0] / len];
  // One point per quarter period (peaks and zero crossings); auto tangents
  // smooth them into a wave.
  const steps = Math.max(2, Math.round(periods * 4));
  const points: ControlPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const offset = amplitude * Math.sin(2 * Math.PI * periods * t);
    points.push({
      x: from[0] + chord[0] * t + perp[0] * offset,
      y: from[1] + chord[1] * t + perp[1] * offset,
    });
  }
  return { kind: 'path', points };
}

function sCurve(o: { from?: Vec2; to?: Vec2; strength?: number } = {}): PathSpline {
  const from = o.from ?? [-0.65, -0.55];
  const to = o.to ?? [0.65, 0.55];
  const strength = o.strength ?? 0.8;
  const chord: Vec2 = [to[0] - from[0], to[1] - from[1]];
  const len = Math.hypot(chord[0], chord[1]) || 1;
  const perp: Vec2 = [-chord[1] / len, chord[0] / len];
  const d = (strength * len) / 3;
  return {
    kind: 'path',
    points: [
      {
        x: from[0],
        y: from[1],
        mode: 'smooth',
        hOut: [chord[0] / 3 + perp[0] * d, chord[1] / 3 + perp[1] * d],
      },
      {
        x: to[0],
        y: to[1],
        mode: 'smooth',
        hIn: [-chord[0] / 3 + perp[0] * d, -chord[1] / 3 + perp[1] * d],
      },
    ],
  };
}

interface SpiralOptions {
  cx?: number;
  cy?: number;
  turns?: number;
  startRadius?: number;
  endRadius?: number;
  startAngle?: number;
}

function spiral(o: SpiralOptions = {}): PathSpline {
  const cx = o.cx ?? 0;
  const cy = o.cy ?? 0;
  const turns = o.turns ?? 1.25;
  const startRadius = o.startRadius ?? 0.15;
  const endRadius = o.endRadius ?? 0.9;
  const startAngle = o.startAngle ?? Math.PI / 2;
  const sweep = turns * 2 * Math.PI;
  const steps = Math.max(2, Math.ceil(turns * 4));
  const delta = sweep / steps;
  const drdTheta = (endRadius - startRadius) / sweep;
  const points: ControlPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + delta * i;
    const radius = startRadius + (endRadius - startRadius) * (i / steps);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Velocity of (r(θ)·cosθ, r(θ)·sinθ), normalized.
    const vel: Vec2 = [drdTheta * cos - radius * sin, drdTheta * sin + radius * cos];
    const vlen = Math.hypot(vel[0], vel[1]) || 1;
    const k = arcHandle(radius, delta);
    const tangent: Vec2 = [(vel[0] / vlen) * k, (vel[1] / vlen) * k];
    const pt: ControlPoint = {
      x: cx + radius * cos,
      y: cy + radius * sin,
      mode: 'smooth',
    };
    if (i > 0) pt.hIn = [-tangent[0], -tangent[1]];
    if (i < steps) pt.hOut = [tangent[0], tangent[1]];
    points.push(pt);
  }
  return { kind: 'path', points };
}

function hook(o: { cx?: number; cy?: number } = {}): PathSpline {
  const cx = o.cx ?? -0.35;
  const cy = o.cy ?? 0.35;
  // A tight 3/4 curl that releases into a sweep across the disk.
  const curl = arcPoints({
    cx,
    cy,
    radius: 0.3,
    startAngle: Math.PI / 2,
    endAngle: -Math.PI,
  });
  const last = curl[curl.length - 1]!;
  delete last.hOut;
  curl.push({ x: 0.7, y: -0.5 });
  return { kind: 'path', points: curl };
}

function ramp(y0 = 0.2, y1 = 0.85): FnSpline {
  return {
    kind: 'fn',
    points: [
      { x: 0, y: y0 },
      { x: 1, y: y1 },
    ],
  };
}

function ease(y0 = 0.15, y1 = 0.85, bias = 0.55): FnSpline {
  return {
    kind: 'fn',
    points: [
      { x: 0, y: y0, mode: 'smooth', hOut: [bias, 0] },
      { x: 1, y: y1, mode: 'smooth', hIn: [-bias, 0] },
    ],
  };
}

function fnWave(o: { y0?: number; y1?: number; amplitude?: number; periods?: number } = {}): FnSpline {
  const y0 = o.y0 ?? 0.35;
  const y1 = o.y1 ?? 0.75;
  const amplitude = o.amplitude ?? 0.25;
  const periods = o.periods ?? 1.5;
  const steps = Math.max(2, Math.round(periods * 4));
  const points: ControlPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    const base = y0 + (y1 - y0) * x;
    const y = Math.min(1, Math.max(0, base + amplitude * Math.sin(2 * Math.PI * periods * x)));
    points.push({ x, y });
  }
  return { kind: 'fn', points };
}

export const shapes = {
  arc,
  circle,
  line,
  wave,
  sCurve,
  spiral,
  hook,
  ramp,
  ease,
  fnWave,
};
