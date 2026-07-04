import { hslToRgb, oklchToRgb, clampRgb, formatHex, type ColorSpaceId } from 'color-curves';

let cache: { key: string; canvas: HTMLCanvasElement } | null = null;

/** Vertical lightness ramp in the palette's own space (white up, black down). */
export function stripBackground(width: number, height: number, space: ColorSpaceId): HTMLCanvasElement {
  const w = Math.max(2, Math.round(width));
  const h = Math.max(2, Math.round(height));
  const key = `${space}:${w}:${h}`;
  if (cache?.key === key) return cache.canvas;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  for (let y = 0; y < h; y++) {
    const light = 1 - y / (h - 1);
    const rgb =
      space === 'hsl' ? hslToRgb(0, 0, light) : clampRgb(oklchToRgb(light, 0, 0));
    ctx.fillStyle = formatHex(rgb);
    ctx.fillRect(0, y, w, 1);
  }
  cache = { key, canvas };
  return canvas;
}
