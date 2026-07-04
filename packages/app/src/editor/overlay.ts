import {
  colorAt,
  evalFn,
  evalPath,
  toSegments,
  type FnSpline,
  type Palette,
  type PathSpline,
} from 'color-curves';
import type { Selection, Surface } from '../state/store';
import type { ThemeColors } from '../theme';
import type { SurfaceMapping } from './mapping';
import type { HitTarget } from './hitTest';
import { effectiveHandles } from './hitTest';

const POINT_RADIUS = 5.5;
const HANDLE_RADIUS = 4;

function splinePath(spline: PathSpline | FnSpline, mapping: SurfaceMapping): Path2D {
  const path = new Path2D();
  const segments = toSegments(spline);
  if (segments.length === 0) return path;
  const [mx, my] = mapping.toScreen(segments[0]!.p0[0], segments[0]!.p0[1]);
  path.moveTo(mx, my);
  for (const seg of segments) {
    const [c1x, c1y] = mapping.toScreen(seg.c1[0], seg.c1[1]);
    const [c2x, c2y] = mapping.toScreen(seg.c2[0], seg.c2[1]);
    const [px, py] = mapping.toScreen(seg.p3[0], seg.p3[1]);
    path.bezierCurveTo(c1x, c1y, c2x, c2y, px, py);
  }
  return path;
}

interface OverlayOptions {
  doc: Palette;
  surface: Surface;
  mapping: SurfaceMapping;
  selection: Selection | null;
  hover: HitTarget | null;
  colors: ThemeColors;
  dark: boolean;
}

/**
 * Small chevrons along the wheel curve showing traversal direction
 * (t = 0 → 1, i.e. palette order). Spaced in screen pixels, kept clear of
 * the anchor dots, same halo treatment as the curve stroke.
 */
function drawDirectionChevrons(
  ctx: CanvasRenderingContext2D,
  spline: PathSpline,
  mapping: SurfaceMapping,
  dark: boolean,
) {
  const N = 128;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const [x, y] = evalPath(spline, i / N);
    const [sx, sy] = mapping.toScreen(x, y);
    pts.push([sx, sy]);
  }
  const cum: number[] = [0];
  for (let i = 1; i <= N; i++) {
    const prev = pts[i - 1]!;
    const cur = pts[i]!;
    cum.push(cum[i - 1]! + Math.hypot(cur[0] - prev[0], cur[1] - prev[1]));
  }
  const total = cum[N]!;
  if (total < 48) return;

  const anchors = spline.points.map((pt) => mapping.toScreen(pt.x, pt.y));
  const spacing = Math.max(64, total / 6);
  const size = 4.5;

  for (let s = spacing * 0.55; s < total - 14; s += spacing) {
    let i = 1;
    while (i < N && cum[i]! < s) i++;
    const back = pts[Math.max(0, i - 2)]!;
    const fwd = pts[Math.min(N, i + 1)]!;
    const pos = pts[i]!;
    if (anchors.some(([ax, ay]) => Math.hypot(pos[0] - ax, pos[1] - ay) < 15)) continue;
    const angle = Math.atan2(fwd[1] - back[1], fwd[0] - back[0]);
    const a1 = angle + Math.PI * 0.78;
    const a2 = angle - Math.PI * 0.78;
    const chevron = new Path2D();
    chevron.moveTo(pos[0] + Math.cos(a1) * size, pos[1] + Math.sin(a1) * size);
    chevron.lineTo(pos[0], pos[1]);
    chevron.lineTo(pos[0] + Math.cos(a2) * size, pos[1] + Math.sin(a2) * size);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = dark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 4;
    ctx.stroke(chevron);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.75;
    ctx.stroke(chevron);
  }
}

function drawCurveStroke(ctx: CanvasRenderingContext2D, path: Path2D, dark: boolean) {
  // Contrast halo + line reads on any background.
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = dark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 4;
  ctx.stroke(path);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1.75;
  ctx.stroke(path);
}

function drawColoredFnStroke(
  ctx: CanvasRenderingContext2D,
  doc: Palette,
  mapping: SurfaceMapping,
) {
  // The lightness spline is stroked in palette colors so the hue interaction
  // is visible without re-rastering anything.
  const [r0, r1] = doc.range ?? [0, 1];
  const N = 96;
  ctx.lineCap = 'round';
  let prev = mapping.toScreen(0, Math.min(1, Math.max(0, evalFn(doc.light, 0))));
  for (let i = 1; i <= N; i++) {
    const x = i / N;
    const y = Math.min(1, Math.max(0, evalFn(doc.light, x)));
    const cur = mapping.toScreen(x, y);
    const mid = (i - 0.5) / N;
    const t = r1 > r0 ? Math.min(1, Math.max(0, (mid - r0) / (r1 - r0))) : 0;
    const c = colorAt(doc, t).rgb;
    ctx.strokeStyle = `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(
      c.b * 255,
    )})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(prev[0], prev[1]);
    ctx.lineTo(cur[0], cur[1]);
    ctx.stroke();
    prev = cur;
  }
}

function drawPoints(ctx: CanvasRenderingContext2D, opts: OverlayOptions) {
  const { doc, surface, mapping, selection, hover, colors } = opts;
  const spline = surface === 'wheel' ? doc.wheel : doc.light;
  const closed = spline.kind === 'path' && spline.closed === true;
  const selectedIndex = selection && selection.surface === surface ? selection.index : null;

  // Tangent handles for the selected point (only when explicit).
  if (selectedIndex !== null) {
    const pt = spline.points[selectedIndex];
    if (pt && (pt.hIn || pt.hOut)) {
      const { hIn, hOut } = effectiveHandles(spline, selectedIndex);
      const [px, py] = mapping.toScreen(pt.x, pt.y);
      for (const pos of [hIn, hOut]) {
        if (!pos) continue;
        const [hx, hy] = mapping.toScreen(pos[0], pos[1]);
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(hx, hy, HANDLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = opts.colors.panel;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  for (let i = 0; i < spline.points.length; i++) {
    const pt = spline.points[i]!;
    const [px, py] = mapping.toScreen(pt.x, pt.y);
    const isSelected = selectedIndex === i;
    const isHovered = hover?.type === 'point' && hover.index === i;
    const isStart = i === 0;
    const isEnd = !closed && i === spline.points.length - 1;
    const r = POINT_RADIUS + (isSelected ? 1.5 : isHovered ? 1 : 0);

    ctx.beginPath();
    if ((pt.mode ?? 'auto') === 'corner') {
      ctx.rect(px - r, py - r, r * 2, r * 2);
    } else {
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = isStart ? '#2fb46c' : isEnd ? '#e05656' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = isSelected ? colors.accent : 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = isSelected ? 2 : 1.25;
    ctx.stroke();
  }
}

export function drawWheelOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: OverlayOptions,
  contour: Float32Array | null,
) {
  ctx.clearRect(0, 0, width, height);
  const { doc, mapping, colors } = opts;

  // Disk rim.
  const [cx, cy] = mapping.toScreen(0, 0);
  const [rx] = mapping.toScreen(1, 0);
  const radius = rx - cx;
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // sRGB gamut contour (OKLCH only).
  if (contour) {
    ctx.strokeStyle = opts.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= contour.length; i++) {
      const idx = i % contour.length;
      const angle = (idx / contour.length) * Math.PI * 2;
      const r = contour[idx]!;
      const [sx, sy] = mapping.toScreen(Math.cos(angle) * r, Math.sin(angle) * r);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const path = splinePath(doc.wheel, mapping);
  drawCurveStroke(ctx, path, opts.dark);
  drawDirectionChevrons(ctx, doc.wheel, mapping, opts.dark);
  drawPoints(ctx, opts);
}

export function drawStripOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: OverlayOptions,
) {
  ctx.clearRect(0, 0, width, height);
  const { doc, mapping, colors } = opts;

  // Frame.
  const [x0, y1] = mapping.toScreen(0, 1);
  const [x1, y0] = mapping.toScreen(1, 0);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x0, y1, x1 - x0, y0 - y1);

  drawColoredFnStroke(ctx, doc, mapping);
  drawPoints(ctx, opts);
}
