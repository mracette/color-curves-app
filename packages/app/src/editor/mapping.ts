export interface SurfaceMapping {
  /** CSS px (relative to the canvas) → surface coords. */
  toSurface(px: number, py: number): [number, number];
  /** Surface coords → CSS px. */
  toScreen(x: number, y: number): [number, number];
}

export const WHEEL_PAD = 18;
export const STRIP_PAD = 14;

/** Unit disk, y-up, centered. */
export function diskMapping(width: number, height: number, pad = WHEEL_PAD): SurfaceMapping {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(1, Math.min(width, height) / 2 - pad);
  return {
    toSurface: (px, py) => [(px - cx) / radius, (cy - py) / radius],
    toScreen: (x, y) => [cx + x * radius, cy - y * radius],
  };
}

/** (t, L) rectangle, y-up. */
export function stripMapping(width: number, height: number, pad = STRIP_PAD): SurfaceMapping {
  const x0 = pad;
  const x1 = Math.max(x0 + 1, width - pad);
  const y0 = Math.max(pad + 1, height - pad);
  const y1 = pad;
  return {
    toSurface: (px, py) => [(px - x0) / (x1 - x0), (py - y0) / (y1 - y0)],
    toScreen: (x, y) => [x0 + x * (x1 - x0), y0 + y * (y1 - y0)],
  };
}

/** Radius of the unit disk in CSS px for a given wheel canvas size. */
export function diskRadiusPx(width: number, height: number, pad = WHEEL_PAD): number {
  return Math.max(1, Math.min(width, height) / 2 - pad);
}
