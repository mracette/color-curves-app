import type { RGB } from '../types';

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function clampRgb(rgb: RGB): RGB {
  return {
    r: Math.min(1, Math.max(0, rgb.r)),
    g: Math.min(1, Math.max(0, rgb.g)),
    b: Math.min(1, Math.max(0, rgb.b)),
  };
}

function channelHex(c: number): string {
  const v = Math.round(Math.min(1, Math.max(0, c)) * 255);
  return v.toString(16).padStart(2, '0');
}

export function formatHex(rgb: RGB): string {
  return `#${channelHex(rgb.r)}${channelHex(rgb.g)}${channelHex(rgb.b)}`;
}

export function parseHex(hex: string): RGB {
  const s = hex.startsWith('#') ? hex.slice(1) : hex;
  const full = s.length === 3 ? s.replace(/./g, (ch) => ch + ch) : s;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new TypeError(`invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}
