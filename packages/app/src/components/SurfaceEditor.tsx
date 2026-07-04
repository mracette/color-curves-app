import { useEffect, useRef } from 'react';
import { useAppStore, type Surface } from '../state/store';
import { useThrottledStore } from '../state/useThrottled';
import { diskMapping, diskRadiusPx, stripMapping, type SurfaceMapping } from '../editor/mapping';
import { gamutContour, quantizeLightness, wheelBackground } from '../editor/wheelRaster';
import { stripBackground } from '../editor/stripRaster';
import { drawStripOverlay, drawWheelOverlay } from '../editor/overlay';
import { attachSurfaceInteractions } from '../editor/interactions';
import {
  canRemove,
  getSpline,
  medianLightness,
  movePointTo,
  removeAt,
  setPointMode,
} from '../editor/docOps';
import { themeColors } from '../theme';
import type { HitTarget } from '../editor/hitTest';

function cursorFor(hit: HitTarget | null, dragging: boolean): string {
  if (dragging) return 'grabbing';
  if (!hit) return 'default';
  if (hit.type === 'curve') return 'move';
  return 'grab';
}

export function SurfaceEditor({ surface }: { surface: Surface }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<HitTarget | null>(null);
  const contourRef = useRef<{ key: string; contour: Float32Array } | null>(null);
  const rafRef = useRef(0);
  const sizeRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const bg = bgRef.current!;
    const fg = fgRef.current!;

    const getMapping = (): SurfaceMapping => {
      const [w, h] = sizeRef.current;
      return surface === 'wheel' ? diskMapping(w, h) : stripMapping(w, h);
    };

    const draw = () => {
      rafRef.current = 0;
      const [w, h] = sizeRef.current;
      if (w < 4 || h < 4) return;
      const state = useAppStore.getState();
      const dark = state.resolvedTheme === 'dark';
      const colors = themeColors(state.resolvedTheme);
      const dpr = window.devicePixelRatio || 1;
      const mapping = getMapping();

      const bctx = bg.getContext('2d')!;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);

      let contour: Float32Array | null = null;

      if (surface === 'wheel') {
        const radius = diskRadiusPx(w, h);
        // Quantize display lightness while dragging so the raster cache
        // hits; render exact on commit.
        const median = medianLightness(state.doc);
        const displayL =
          state.transientBase !== null
            ? quantizeLightness(median)
            : Math.round(median * 200) / 200;
        const raster = wheelBackground({
          size: radius * 2,
          space: state.doc.space,
          lightness: displayL,
        });
        const [cx, cy] = mapping.toScreen(0, 0);
        bctx.imageSmoothingEnabled = true;
        bctx.imageSmoothingQuality = 'high';
        // Clip to an exact vector circle: the raster paints opaque color a
        // few pixels past the rim, so the visible edge is this crisp clip,
        // not the bitmap's scaled anti-aliased fade.
        bctx.save();
        bctx.beginPath();
        bctx.arc(cx, cy, radius, 0, Math.PI * 2);
        bctx.clip();
        bctx.drawImage(raster, cx - radius, cy - radius, radius * 2, radius * 2);
        bctx.restore();

        if (state.doc.space === 'oklch') {
          const contourKey = `${displayL}`;
          if (contourRef.current?.key !== contourKey) {
            contourRef.current = { key: contourKey, contour: gamutContour(displayL) };
          }
          contour = contourRef.current.contour;
        }
      } else {
        const [x0, yTop] = mapping.toScreen(0, 1);
        const [x1, yBottom] = mapping.toScreen(1, 0);
        const raster = stripBackground(x1 - x0, yBottom - yTop, state.doc.space);
        bctx.drawImage(raster, x0, yTop, x1 - x0, yBottom - yTop);
      }

      const fctx = fg.getContext('2d')!;
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const overlayOpts = {
        doc: state.doc,
        surface,
        mapping,
        selection: state.selection,
        hover: hoverRef.current,
        colors,
        dark,
      };
      if (surface === 'wheel') drawWheelOverlay(fctx, w, h, overlayOpts, contour);
      else drawStripOverlay(fctx, w, h, overlayOpts);
    };

    const scheduleDraw = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      sizeRef.current = [w, h];
      for (const canvas of [bg, fg]) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      scheduleDraw();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();

    const unsubscribe = useAppStore.subscribe(scheduleDraw);
    const detach = attachSurfaceInteractions(wrap, {
      surface,
      getMapping,
      onHover(hit, dragging) {
        hoverRef.current = hit;
        wrap.style.cursor = cursorFor(hit, dragging);
        scheduleDraw();
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      const state = useAppStore.getState();
      const sel = state.selection;
      if (!sel || sel.surface !== surface) return;
      const spline = getSpline(state.doc, surface);
      const pt = spline.points[sel.index];
      if (!pt) return;
      const step = (e.shiftKey ? 0.1 : 0.01) * (surface === 'wheel' ? 2 : 1);
      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case 'ArrowLeft':
          dx = -step;
          break;
        case 'ArrowRight':
          dx = step;
          break;
        case 'ArrowUp':
          dy = step;
          break;
        case 'ArrowDown':
          dy = -step;
          break;
        case 'Delete':
        case 'Backspace':
          if (canRemove(state.doc, surface, sel.index)) {
            state.select(null);
            state.updateDoc((d) => removeAt(d, surface, sel.index));
          }
          e.preventDefault();
          return;
        case 'Tab': {
          const next = (sel.index + (e.shiftKey ? -1 : 1) + spline.points.length) % spline.points.length;
          state.select({ surface, index: next });
          e.preventDefault();
          return;
        }
        case 'Escape':
          state.select(null);
          e.preventDefault();
          return;
        case 's':
        case 'S':
          state.updateDoc((d) => setPointMode(d, surface, sel.index, 'smooth'));
          e.preventDefault();
          return;
        case 'c':
        case 'C':
          state.updateDoc((d) => setPointMode(d, surface, sel.index, 'corner'));
          e.preventDefault();
          return;
        case 'a':
        case 'A':
          state.updateDoc((d) => setPointMode(d, surface, sel.index, 'auto'));
          e.preventDefault();
          return;
        default:
          return;
      }
      state.updateDoc((d) => movePointTo(d, surface, sel.index, pt.x + dx, pt.y + dy));
      e.preventDefault();
    };
    wrap.addEventListener('keydown', onKeyDown);

    return () => {
      observer.disconnect();
      unsubscribe();
      detach();
      wrap.removeEventListener('keydown', onKeyDown);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [surface]);

  return (
    <div
      ref={wrapRef}
      className={`surface-editor surface-editor--${surface}`}
      tabIndex={0}
      role="application"
      aria-label={surface === 'wheel' ? 'Hue and chroma wheel editor' : 'Lightness curve editor'}
    >
      <canvas ref={bgRef} className="surface-editor__canvas" />
      <canvas ref={fgRef} className="surface-editor__canvas" />
      {surface === 'wheel' && <WheelLightnessLabel />}
      <PointToolbar surface={surface} />
    </div>
  );
}

function WheelLightnessLabel() {
  const median = useThrottledStore((s) => Math.round(medianLightness(s.doc) * 100) / 100, 150);
  const space = useThrottledStore((s) => s.doc.space, 150);
  if (space !== 'oklch') return null;
  return <div className="wheel-label">wheel at L ≈ {median.toFixed(2)} (median)</div>;
}

/** Inline toolbar for the selected point: smooth/corner/auto + delete. */
function PointToolbar({ surface }: { surface: Surface }) {
  const selection = useAppStore((s) => s.selection);
  const doc = useThrottledStore((s) => s.doc, 100);
  if (!selection || selection.surface !== surface) return null;
  const spline = getSpline(doc, surface);
  const pt = spline.points[selection.index];
  if (!pt) return null;
  const mode = pt.mode ?? 'auto';
  const state = useAppStore.getState();
  return (
    <div className="point-toolbar">
      <button
        className={mode === 'auto' ? 'is-active' : ''}
        title="Automatic tangents (A)"
        onClick={() => state.updateDoc((d) => setPointMode(d, surface, selection.index, 'auto'))}
      >
        auto
      </button>
      <button
        className={mode === 'smooth' ? 'is-active' : ''}
        title="Smooth point (S)"
        onClick={() => state.updateDoc((d) => setPointMode(d, surface, selection.index, 'smooth'))}
      >
        smooth
      </button>
      <button
        className={mode === 'corner' ? 'is-active' : ''}
        title="Corner point (C)"
        onClick={() => state.updateDoc((d) => setPointMode(d, surface, selection.index, 'corner'))}
      >
        corner
      </button>
      <button
        className="point-toolbar__delete"
        title="Delete point (⌫)"
        disabled={!canRemove(doc, surface, selection.index)}
        onClick={() => {
          state.select(null);
          state.updateDoc((d) => removeAt(d, surface, selection.index));
        }}
      >
        ✕
      </button>
    </div>
  );
}
