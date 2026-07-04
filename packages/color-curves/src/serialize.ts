import type { ColorSpaceId, ControlPoint, FnSpline, Palette, PathSpline, PointMode, Vec2 } from './types';

export interface PointJSON {
  p: [number, number];
  mode?: 'smooth' | 'corner';
  in?: [number, number];
  out?: [number, number];
  t?: number;
}

export interface PathJSON {
  closed?: true;
  points: PointJSON[];
}

export interface FnJSON {
  points: PointJSON[];
}

export interface PaletteJSON {
  v: 1;
  space: ColorSpaceId;
  name?: string;
  author?: string;
  range?: [number, number];
  wheel: PathJSON;
  light: FnJSON;
}

const PRECISION = 4;

function round(v: number): number {
  const f = 10 ** PRECISION;
  return Math.round(v * f) / f;
}

function pointToJSON(pt: ControlPoint): PointJSON {
  const out: PointJSON = { p: [round(pt.x), round(pt.y)] };
  if (pt.mode === 'smooth' || pt.mode === 'corner') out.mode = pt.mode;
  if (pt.hIn) out.in = [round(pt.hIn[0]), round(pt.hIn[1])];
  if (pt.hOut) out.out = [round(pt.hOut[0]), round(pt.hOut[1])];
  if (pt.t !== undefined) out.t = round(pt.t);
  return out;
}

/** Canonical, compact JSON form: rounded numbers, defaults stripped. */
export function toJSON(p: Palette): PaletteJSON {
  const wheel: PathJSON = { points: p.wheel.points.map(pointToJSON) };
  if (p.wheel.closed) wheel.closed = true;
  const out: PaletteJSON = {
    v: 1,
    space: p.space,
    wheel,
    light: { points: p.light.points.map(pointToJSON) },
  };
  if (p.name !== undefined && p.name !== '') out.name = p.name;
  if (p.author !== undefined && p.author !== '') out.author = p.author;
  if (p.range && (p.range[0] !== 0 || p.range[1] !== 1)) {
    out.range = [round(p.range[0]), round(p.range[1])];
  }
  return out;
}

function fail(path: string, message: string): never {
  throw new TypeError(`${path}: ${message}`);
}

function isVec2(v: unknown): v is [number, number] {
  return (
    Array.isArray(v) &&
    v.length === 2 &&
    typeof v[0] === 'number' &&
    Number.isFinite(v[0]) &&
    typeof v[1] === 'number' &&
    Number.isFinite(v[1])
  );
}

function parsePoint(raw: unknown, path: string): ControlPoint {
  if (typeof raw !== 'object' || raw === null) fail(path, 'expected an object');
  const obj = raw as Record<string, unknown>;
  if (!isVec2(obj.p)) fail(`${path}.p`, 'expected [number, number]');
  const pt: ControlPoint = { x: obj.p[0], y: obj.p[1] };
  if (obj.mode !== undefined) {
    if (obj.mode !== 'smooth' && obj.mode !== 'corner' && obj.mode !== 'auto') {
      fail(`${path}.mode`, `unknown mode ${String(obj.mode)}`);
    }
    if (obj.mode !== 'auto') pt.mode = obj.mode as PointMode;
  }
  if (obj.in !== undefined) {
    if (!isVec2(obj.in)) fail(`${path}.in`, 'expected [number, number]');
    pt.hIn = obj.in as Vec2;
  }
  if (obj.out !== undefined) {
    if (!isVec2(obj.out)) fail(`${path}.out`, 'expected [number, number]');
    pt.hOut = obj.out as Vec2;
  }
  if (obj.t !== undefined) {
    if (typeof obj.t !== 'number' || !Number.isFinite(obj.t) || obj.t < 0 || obj.t > 1) {
      fail(`${path}.t`, 'expected a number in [0, 1]');
    }
    pt.t = obj.t;
  }
  return pt;
}

/**
 * Parse and validate a serialized palette (JSON string or plain object).
 * The single versioned entry point: future format versions migrate forward
 * here. Throws TypeError with a path-annotated message on invalid input.
 */
export function parsePalette(input: string | unknown): Palette {
  let raw: unknown = input;
  if (typeof input === 'string') {
    try {
      raw = JSON.parse(input);
    } catch (e) {
      throw new TypeError(`palette: invalid JSON (${(e as Error).message})`);
    }
  }
  if (typeof raw !== 'object' || raw === null) fail('palette', 'expected an object');
  const obj = raw as Record<string, unknown>;
  if (obj.v !== 1) fail('palette.v', `unsupported version ${String(obj.v)}`);
  if (obj.space !== 'oklch' && obj.space !== 'hsl') {
    fail('palette.space', `unknown space ${String(obj.space)}`);
  }

  const wheelRaw = obj.wheel as Record<string, unknown> | undefined;
  if (!wheelRaw || !Array.isArray(wheelRaw.points)) fail('palette.wheel.points', 'expected an array');
  const closed = wheelRaw.closed === true;
  const wheelPoints = wheelRaw.points.map((pt, i) => parsePoint(pt, `palette.wheel.points[${i}]`));
  if (wheelPoints.length < (closed ? 3 : 2)) {
    fail('palette.wheel.points', `need at least ${closed ? 3 : 2} points`);
  }
  let lastT = -Infinity;
  for (let i = 0; i < wheelPoints.length; i++) {
    const t = wheelPoints[i]!.t;
    if (t === undefined) continue;
    if (t <= lastT) fail(`palette.wheel.points[${i}].t`, 'anchors must be strictly increasing');
    lastT = t;
  }

  const lightRaw = obj.light as Record<string, unknown> | undefined;
  if (!lightRaw || !Array.isArray(lightRaw.points)) fail('palette.light.points', 'expected an array');
  const lightPoints = lightRaw.points.map((pt, i) => parsePoint(pt, `palette.light.points[${i}]`));
  if (lightPoints.length < 2) fail('palette.light.points', 'need at least 2 points');
  for (let i = 1; i < lightPoints.length; i++) {
    if (lightPoints[i]!.x <= lightPoints[i - 1]!.x) {
      fail(`palette.light.points[${i}].p`, 'x must be strictly increasing');
    }
  }
  const first = lightPoints[0]!;
  const last = lightPoints[lightPoints.length - 1]!;
  if (Math.abs(first.x) > 1e-3) fail('palette.light.points[0].p', 'first point must be at x = 0');
  if (Math.abs(last.x - 1) > 1e-3) {
    fail(`palette.light.points[${lightPoints.length - 1}].p`, 'last point must be at x = 1');
  }
  first.x = 0;
  last.x = 1;

  const wheel: PathSpline = closed
    ? { kind: 'path', points: wheelPoints, closed: true }
    : { kind: 'path', points: wheelPoints };
  const light: FnSpline = { kind: 'fn', points: lightPoints };

  const palette: Palette = { version: 1, space: obj.space, wheel, light };
  if (obj.range !== undefined) {
    if (!isVec2(obj.range)) fail('palette.range', 'expected [number, number]');
    const [a, b] = obj.range;
    if (a < 0 || b > 1 || a >= b) fail('palette.range', 'expected 0 <= start < end <= 1');
    if (a !== 0 || b !== 1) palette.range = [a, b];
  }
  if (obj.name !== undefined) {
    if (typeof obj.name !== 'string') fail('palette.name', 'expected a string');
    palette.name = obj.name;
  }
  if (obj.author !== undefined) {
    if (typeof obj.author !== 'string') fail('palette.author', 'expected a string');
    palette.author = obj.author;
  }
  return palette;
}
