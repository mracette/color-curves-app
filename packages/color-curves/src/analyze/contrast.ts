import type { RGB } from '../types';

/** WCAG 2.x relative luminance (uses WCAG's own published linearization). */
export function relativeLuminance(rgb: RGB): number {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

/** WCAG 2.x contrast ratio, 1..21, order-independent. */
export function contrastWCAG(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

// APCA-W3 0.0.98G-4g constants. APCA is formally beta; these are pinned to
// the published constant set and validated against its test vectors.
const SA98G = {
  mainTRC: 2.4,
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  loClip: 0.1,
  deltaYmin: 0.0005,
};

function apcaY(rgb: RGB): number {
  return (
    SA98G.sRco * Math.pow(rgb.r, SA98G.mainTRC) +
    SA98G.sGco * Math.pow(rgb.g, SA98G.mainTRC) +
    SA98G.sBco * Math.pow(rgb.b, SA98G.mainTRC)
  );
}

function softClamp(y: number): number {
  return y < SA98G.blkThrs ? y + Math.pow(SA98G.blkThrs - y, SA98G.blkClmp) : y;
}

/**
 * APCA-W3 lightness contrast Lc. Signed: positive for dark text on a light
 * background, negative for light text on a dark background.
 */
export function contrastAPCA(text: RGB, bg: RGB): number {
  const yTxt = softClamp(apcaY(text));
  const yBg = softClamp(apcaY(bg));
  if (Math.abs(yBg - yTxt) < SA98G.deltaYmin) return 0;

  if (yBg > yTxt) {
    const sapc = (Math.pow(yBg, SA98G.normBG) - Math.pow(yTxt, SA98G.normTXT)) * SA98G.scaleBoW;
    return sapc < SA98G.loClip ? 0 : (sapc - SA98G.loBoWoffset) * 100;
  }
  const sapc = (Math.pow(yBg, SA98G.revBG) - Math.pow(yTxt, SA98G.revTXT)) * SA98G.scaleWoB;
  return sapc > -SA98G.loClip ? 0 : (sapc + SA98G.loWoBoffset) * 100;
}
