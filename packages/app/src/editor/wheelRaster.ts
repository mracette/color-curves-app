import {
  MAX_CHROMA,
  hslToRgb,
  maxChroma,
  oklchToRgb,
  clampRgb,
  type ColorSpaceId,
  type RGB,
} from 'color-curves';

const RASTER_CAP = 360;
const HUE_STEPS = 256;

export interface WheelRasterParams {
  /** CSS px size of the (square) disk area, i.e. 2 × radius. */
  size: number;
  space: ColorSpaceId;
  /** Display lightness (already quantized by the caller for caching). */
  lightness: number;
}

/** Max in-gamut wheel radius (0..1) per hue for the gamut contour. */
export function gamutContour(lightness: number, steps = HUE_STEPS): Float32Array {
  const out = new Float32Array(steps);
  for (let i = 0; i < steps; i++) {
    out[i] = maxChroma(lightness, (i / steps) * 360) / MAX_CHROMA;
  }
  return out;
}

let cache: { key: string; canvas: HTMLCanvasElement } | null = null;

/**
 * The expensive wheel background raster, cached on a single offscreen
 * canvas. Rendered at ≤ RASTER_CAP logical px and upscaled by the caller —
 * invisible for smooth gradients, keeps the per-pixel loop to a few ms.
 */
export function wheelBackground(params: WheelRasterParams): HTMLCanvasElement {
  const raster = Math.min(RASTER_CAP, Math.max(64, Math.round(params.size)));
  const key = `${params.space}:${params.lightness.toFixed(3)}:${raster}`;
  if (cache?.key === key) return cache.canvas;

  const canvas = document.createElement('canvas');
  canvas.width = raster;
  canvas.height = raster;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(raster, raster);
  const data = img.data;
  const half = raster / 2;
  const L = params.lightness;
  // Out-of-gamut territory desaturates toward the achromatic color at this
  // lightness — reads as "no more chroma available here" in either theme.
  const gray = clampRgb(oklchToRgb(L, 0, 0));

  // Precompute per-hue values so the pixel loop stays allocation-free and
  // does at most one oklch→srgb conversion per pixel.
  const maxR = new Float32Array(HUE_STEPS);
  if (params.space === 'oklch') {
    for (let i = 0; i < HUE_STEPS; i++) {
      maxR[i] = maxChroma(L, (i / HUE_STEPS) * 360) / MAX_CHROMA;
    }
  }

  const edge = 1.5 / half; // ~1.5px anti-aliased rim

  for (let y = 0; y < raster; y++) {
    const dy = (half - (y + 0.5)) / half; // y-up
    for (let x = 0; x < raster; x++) {
      const dx = (x + 0.5 - half) / half;
      const r = Math.hypot(dx, dy);
      const idx = (y * raster + x) * 4;
      if (r > 1 + edge) {
        data[idx + 3] = 0;
        continue;
      }
      let h = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (h < 0) h += 360;

      let rgb: RGB;
      let dim = false;
      if (params.space === 'hsl') {
        rgb = hslToRgb(h, Math.min(r, 1), L);
      } else {
        const hueIdx = Math.min(HUE_STEPS - 1, Math.round((h / 360) * HUE_STEPS));
        const rMax = maxR[hueIdx]!;
        if (r <= rMax) {
          rgb = clampRgb(oklchToRgb(L, r * MAX_CHROMA, h));
        } else {
          // Out-of-gamut territory: show the boundary color, pulled toward
          // gray so clipped regions read as muted, not more vivid.
          rgb = clampRgb(oklchToRgb(L, rMax * MAX_CHROMA, h));
          dim = true;
        }
      }
      const mix = dim ? 0.55 : 0;
      const alpha = r > 1 ? Math.max(0, 1 - (r - 1) / edge) : 1;
      data[idx] = Math.round(255 * (rgb.r * (1 - mix) + gray.r * mix));
      data[idx + 1] = Math.round(255 * (rgb.g * (1 - mix) + gray.g * mix));
      data[idx + 2] = Math.round(255 * (rgb.b * (1 - mix) + gray.b * mix));
      data[idx + 3] = Math.round(255 * alpha);
    }
  }
  ctx.putImageData(img, 0, 0);
  cache = { key, canvas };
  return canvas;
}

/** Quantize display lightness to 0.05 buckets for raster cache hits. */
export function quantizeLightness(l: number): number {
  return Math.round(l * 20) / 20;
}
