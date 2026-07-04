import {
  colorAt,
  formatCss,
  formatHex,
  simulateCVD,
  stops,
  type Palette,
  type RGB,
} from 'color-curves';
import type { CvdSetting } from './store';

export interface PaletteSample {
  t: number;
  hex: string;
  rgb: RGB;
  css: string;
  inGamut: boolean;
}

// Doc snapshots are immutable, so a WeakMap keyed on the doc is both correct
// and self-GC'ing. Every consumer (preview, a11y, exports, viz) reads
// through here — nothing samples the palette independently.
const cache = new WeakMap<Palette, Map<string, PaletteSample[]>>();

export function getSamples(doc: Palette, count: number, cvd: CvdSetting): PaletteSample[] {
  let byKey = cache.get(doc);
  if (!byKey) {
    byKey = new Map();
    cache.set(doc, byKey);
  }
  const key = `${count}:${cvd}`;
  const hit = byKey.get(key);
  if (hit) return hit;

  const colors = stops(doc, count);
  const samples = colors.map((c, i) => {
    const rgb = cvd === 'none' ? c.rgb : simulateCVD(c.rgb, cvd);
    return {
      t: (i + 0.5) / count,
      hex: formatHex(rgb),
      rgb,
      css: formatCss(c),
      inGamut: c.inGamut,
    };
  });
  byKey.set(key, samples);
  return samples;
}

/** Continuous ramp of hex colors (for gradients, previews). */
export function getRamp(doc: Palette, count: number, cvd: CvdSetting): string[] {
  let byKey = cache.get(doc);
  if (!byKey) {
    byKey = new Map();
    cache.set(doc, byKey);
  }
  const key = `ramp:${count}:${cvd}`;
  const hit = byKey.get(key);
  if (hit) return hit.map((s) => s.hex);

  const samples: PaletteSample[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const c = colorAt(doc, t);
    const rgb = cvd === 'none' ? c.rgb : simulateCVD(c.rgb, cvd);
    samples.push({ t, hex: formatHex(rgb), rgb, css: formatCss(c), inGamut: c.inGamut });
  }
  byKey.set(key, samples);
  return samples.map((s) => s.hex);
}

/** CSS gradient string for library swatches and preview chrome. */
export function docGradient(doc: Palette, cvd: CvdSetting = 'none'): string {
  const ramp = getRamp(doc, 16, cvd);
  const parts = ramp.map((hex, i) => `${hex} ${((i / (ramp.length - 1)) * 100).toFixed(1)}%`);
  return `linear-gradient(90deg, ${parts.join(', ')})`;
}
