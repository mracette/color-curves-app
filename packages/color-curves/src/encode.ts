import type { ControlPoint, FnSpline, Palette, PathSpline, Vec2 } from './types';

// Compact binary share-link encoding: fixed-point little-endian fields,
// base64url without padding. Typical palettes land around 100 characters.
// Name/author are deliberately excluded.

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const COORD_SCALE = 8192; // i16 fixed point, covers ±4 at ~1.2e-4 resolution

function bytesToBase64url(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64[b0 >> 2]!;
    out += B64[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)]!;
    if (b1 === undefined) break;
    out += B64[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)]!;
    if (b2 === undefined) break;
    out += B64[b2 & 63]!;
  }
  return out;
}

function base64urlToBytes(s: string): number[] {
  const values: number[] = [];
  for (const ch of s) {
    const v = B64.indexOf(ch);
    if (v === -1) throw new TypeError(`palette url: invalid character '${ch}'`);
    values.push(v);
  }
  const bytes: number[] = [];
  for (let i = 0; i < values.length; i += 4) {
    const v0 = values[i]!;
    const v1 = values[i + 1];
    if (v1 === undefined) throw new TypeError('palette url: truncated');
    bytes.push((v0 << 2) | (v1 >> 4));
    const v2 = values[i + 2];
    if (v2 === undefined) continue;
    bytes.push(((v1 & 15) << 4) | (v2 >> 2));
    const v3 = values[i + 3];
    if (v3 === undefined) continue;
    bytes.push(((v2 & 3) << 6) | v3);
  }
  return bytes;
}

class Writer {
  bytes: number[] = [];

  u8(v: number) {
    this.bytes.push(v & 0xff);
  }

  u16(v: number) {
    this.bytes.push(v & 0xff, (v >> 8) & 0xff);
  }

  i16(v: number) {
    this.u16(v < 0 ? v + 0x10000 : v);
  }

  coord(v: number) {
    const clamped = Math.min(3.999, Math.max(-3.999, v));
    this.i16(Math.round(clamped * COORD_SCALE));
  }
}

class Reader {
  private pos = 0;

  constructor(private bytes: number[]) {}

  u8(): number {
    const v = this.bytes[this.pos++];
    if (v === undefined) throw new TypeError('palette url: truncated');
    return v;
  }

  u16(): number {
    return this.u8() | (this.u8() << 8);
  }

  i16(): number {
    const v = this.u16();
    return v >= 0x8000 ? v - 0x10000 : v;
  }

  coord(): number {
    return this.i16() / COORD_SCALE;
  }
}

const MODE_CODE = { auto: 0, smooth: 1, corner: 2 } as const;
const MODE_FROM_CODE = ['auto', 'smooth', 'corner'] as const;

function writePoint(w: Writer, pt: ControlPoint, allowT: boolean) {
  const mode = MODE_CODE[pt.mode ?? 'auto'];
  const hasT = allowT && pt.t !== undefined;
  w.u8(mode | (pt.hIn ? 4 : 0) | (pt.hOut ? 8 : 0) | (hasT ? 16 : 0));
  w.coord(pt.x);
  w.coord(pt.y);
  if (pt.hIn) {
    w.coord(pt.hIn[0]);
    w.coord(pt.hIn[1]);
  }
  if (pt.hOut) {
    w.coord(pt.hOut[0]);
    w.coord(pt.hOut[1]);
  }
  if (hasT) w.u16(Math.round(pt.t! * 65535));
}

function readPoint(r: Reader): ControlPoint {
  const flags = r.u8();
  const mode = MODE_FROM_CODE[flags & 3];
  if (mode === undefined) throw new TypeError('palette url: bad point mode');
  const pt: ControlPoint = { x: r.coord(), y: r.coord() };
  if (mode !== 'auto') pt.mode = mode;
  if (flags & 4) pt.hIn = [r.coord(), r.coord()] as Vec2;
  if (flags & 8) pt.hOut = [r.coord(), r.coord()] as Vec2;
  if (flags & 16) pt.t = r.u16() / 65535;
  return pt;
}

export function encodePaletteUrl(p: Palette): string {
  const w = new Writer();
  const hasRange = p.range !== undefined && (p.range[0] !== 0 || p.range[1] !== 1);
  w.u8(
    1 | // version, low 4 bits
      ((p.space === 'hsl' ? 1 : 0) << 4) |
      ((p.wheel.closed ? 1 : 0) << 6) |
      ((hasRange ? 1 : 0) << 7),
  );
  if (hasRange) {
    w.u8(Math.round(p.range![0] * 255));
    w.u8(Math.round(p.range![1] * 255));
  }
  w.u8(p.wheel.points.length);
  w.u8(p.light.points.length);
  for (const pt of p.wheel.points) writePoint(w, pt, true);
  for (const pt of p.light.points) writePoint(w, pt, false);
  return bytesToBase64url(w.bytes);
}

export function decodePaletteUrl(s: string): Palette {
  const r = new Reader(base64urlToBytes(s));
  const header = r.u8();
  const version = header & 15;
  if (version !== 1) throw new TypeError(`palette url: unsupported version ${version}`);
  const space = (header >> 4) & 3 ? 'hsl' : 'oklch';
  const closed = ((header >> 6) & 1) === 1;
  const hasRange = ((header >> 7) & 1) === 1;
  let range: [number, number] | undefined;
  if (hasRange) range = [r.u8() / 255, r.u8() / 255];
  const wheelCount = r.u8();
  const lightCount = r.u8();
  if (wheelCount < 2 || lightCount < 2) throw new TypeError('palette url: bad point counts');
  const wheelPoints: ControlPoint[] = [];
  for (let i = 0; i < wheelCount; i++) wheelPoints.push(readPoint(r));
  const lightPoints: ControlPoint[] = [];
  for (let i = 0; i < lightCount; i++) {
    const pt = readPoint(r);
    delete pt.t;
    lightPoints.push(pt);
  }
  // Snap fn endpoints (quantization can nudge them off 0/1).
  lightPoints[0]!.x = 0;
  lightPoints[lightPoints.length - 1]!.x = 1;

  const wheel: PathSpline = closed
    ? { kind: 'path', points: wheelPoints, closed: true }
    : { kind: 'path', points: wheelPoints };
  const light: FnSpline = { kind: 'fn', points: lightPoints };
  const palette: Palette = { version: 1, space, wheel, light };
  if (range) palette.range = range;
  return palette;
}
