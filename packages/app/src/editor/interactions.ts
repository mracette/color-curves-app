import type { Vec2 } from 'color-curves';
import { useAppStore, type Surface } from '../state/store';
import type { SurfaceMapping } from './mapping';
import { hitTest, type HitTarget } from './hitTest';
import {
  canRemove,
  getSpline,
  insertAt,
  movePointTo,
  nearestT,
  pullHandles,
  removeAt,
  rotateWheelCurve,
  scaleWheelCurve,
  setHandle,
  translateCurve,
} from './docOps';

const DRAG_THRESHOLD = 3;
const DOUBLE_TAP_MS = 350;
const DOUBLE_TAP_PX = 24;

interface DragState {
  kind: 'point' | 'handleIn' | 'handleOut' | 'pull' | 'curve';
  /** Curve-body drags: translate, or (wheel only) rotate/scale about center. */
  transform?: 'translate' | 'rotate' | 'scale';
  index: number;
  pointerId: number;
  startPx: [number, number];
  lastSurface: [number, number];
  grabOffset: [number, number];
  moved: boolean;
}

export interface SurfaceInteractionOptions {
  surface: Surface;
  getMapping(): SurfaceMapping;
  onHover(hit: HitTarget | null, dragging: boolean): void;
}

/**
 * The gesture state machine, shared by both editors and parameterized by
 * the surface mapping. Attaches native pointer listeners (pointer capture,
 * manual double-tap detection for touch) and edits the store document —
 * transient during drags, one undo entry per gesture.
 */
export function attachSurfaceInteractions(
  el: HTMLElement,
  opts: SurfaceInteractionOptions,
): () => void {
  const { surface } = opts;
  let drag: DragState | null = null;
  let lastTap: { time: number; x: number; y: number } | null = null;

  const store = useAppStore;

  const localPoint = (e: PointerEvent | MouseEvent): [number, number] => {
    const rect = el.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const doHitTest = (px: number, py: number, touch: boolean): HitTarget | null => {
    const { doc, selection } = store.getState();
    const selectedIndex = selection && selection.surface === surface ? selection.index : null;
    return hitTest(getSpline(doc, surface), opts.getMapping(), px, py, {
      selectedIndex,
      touch,
    });
  };

  const handleDoubleActivate = (px: number, py: number, touch: boolean) => {
    const state = store.getState();
    const hit = doHitTest(px, py, touch);
    if (hit?.type === 'point') {
      if (canRemove(state.doc, surface, hit.index)) {
        state.select(null);
        state.updateDoc((d) => removeAt(d, surface, hit.index));
      }
      return;
    }
    if (hit?.type === 'curve') {
      const [sx, sy] = opts.getMapping().toSurface(px, py);
      const t = nearestT(state.doc, surface, sx, sy);
      let newIndex = -1;
      state.updateDoc((d) => {
        const result = insertAt(d, surface, t);
        newIndex = result.index;
        return result.doc;
      });
      if (newIndex >= 0) state.select({ surface, index: newIndex });
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    // Only react to presses on the canvases — overlaid DOM (the point
    // toolbar) must receive its own clicks without us clearing selection.
    if (!(e.target instanceof HTMLCanvasElement)) return;
    const touch = e.pointerType === 'touch';
    const [px, py] = localPoint(e);
    const state = store.getState();
    const mapping = opts.getMapping();
    const [sx, sy] = mapping.toSurface(px, py);

    // Manual double-tap for touch (dblclick is unreliable with pointer
    // capture + touch-action: none).
    if (touch) {
      const now = Date.now();
      if (
        lastTap &&
        now - lastTap.time < DOUBLE_TAP_MS &&
        Math.hypot(px - lastTap.x, py - lastTap.y) < DOUBLE_TAP_PX
      ) {
        lastTap = null;
        handleDoubleActivate(px, py, true);
        return;
      }
      lastTap = { time: now, x: px, y: py };
    }

    const hit = doHitTest(px, py, touch);
    el.focus({ preventScroll: true });

    if (!hit) {
      state.select(null);
      opts.onHover(null, false);
      return;
    }

    const spline = getSpline(state.doc, surface);

    if (hit.type === 'point' && e.altKey) {
      state.select({ surface, index: hit.index });
      state.beginGesture();
      const pt = spline.points[hit.index]!;
      const v: Vec2 = [sx - pt.x, sy - pt.y];
      state.updateDoc((d) => pullHandles(d, surface, hit.index, v));
      drag = {
        kind: 'pull',
        index: hit.index,
        pointerId: e.pointerId,
        startPx: [px, py],
        lastSurface: [sx, sy],
        grabOffset: [0, 0],
        moved: true,
      };
    } else if (hit.type === 'point') {
      state.select({ surface, index: hit.index });
      state.beginGesture();
      const pt = spline.points[hit.index]!;
      drag = {
        kind: 'point',
        index: hit.index,
        pointerId: e.pointerId,
        startPx: [px, py],
        lastSurface: [sx, sy],
        grabOffset: [pt.x - sx, pt.y - sy],
        moved: false,
      };
    } else if (hit.type === 'handleIn' || hit.type === 'handleOut') {
      state.beginGesture();
      drag = {
        kind: hit.type,
        index: hit.index,
        pointerId: e.pointerId,
        startPx: [px, py],
        lastSurface: [sx, sy],
        grabOffset: [0, 0],
        moved: false,
      };
    } else {
      // Curve body: drag translates the whole curve; on the wheel, alt-drag
      // rotates about the center (hue rotation) and shift-drag scales
      // (chroma). The move threshold protects double-click insertion.
      state.beginGesture();
      drag = {
        kind: 'curve',
        transform:
          surface === 'wheel' && e.altKey ? 'rotate' : surface === 'wheel' && e.shiftKey ? 'scale' : 'translate',
        index: -1,
        pointerId: e.pointerId,
        startPx: [px, py],
        lastSurface: [sx, sy],
        grabOffset: [0, 0],
        moved: false,
      };
    }
    el.setPointerCapture(e.pointerId);
    opts.onHover(hit, true);
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent) => {
    const [px, py] = localPoint(e);
    const touch = e.pointerType === 'touch';
    if (!drag) {
      if (!(e.target instanceof HTMLCanvasElement)) {
        opts.onHover(null, false);
        return;
      }
      opts.onHover(doHitTest(px, py, touch), false);
      return;
    }
    if (e.pointerId !== drag.pointerId) return;
    if (!drag.moved) {
      if (Math.hypot(px - drag.startPx[0], py - drag.startPx[1]) < DRAG_THRESHOLD) return;
      drag.moved = true;
    }
    const state = store.getState();
    const mapping = opts.getMapping();
    const [sx, sy] = mapping.toSurface(px, py);

    if (drag.kind === 'point') {
      const [ox, oy] = drag.grabOffset;
      state.updateDoc((d) => movePointTo(d, surface, drag!.index, sx + ox, sy + oy));
    } else if (drag.kind === 'pull') {
      // Alt-drag stays a symmetric pull until release.
      const spline = getSpline(state.doc, surface);
      const pt = spline.points[drag.index];
      if (pt) {
        const v: Vec2 = [sx - pt.x, sy - pt.y];
        state.updateDoc((d) => pullHandles(d, surface, drag!.index, v));
      }
    } else if (drag.kind === 'handleIn' || drag.kind === 'handleOut') {
      const spline = getSpline(state.doc, surface);
      const pt = spline.points[drag.index];
      if (pt) {
        const v: Vec2 = [sx - pt.x, sy - pt.y];
        state.updateDoc((d) =>
          setHandle(d, surface, drag!.index, drag!.kind === 'handleIn' ? 'in' : 'out', v),
        );
      }
    } else if (drag.transform === 'rotate') {
      const a0 = Math.atan2(drag.lastSurface[1], drag.lastSurface[0]);
      const a1 = Math.atan2(sy, sx);
      state.updateDoc((d) => rotateWheelCurve(d, a1 - a0));
    } else if (drag.transform === 'scale') {
      const r0 = Math.hypot(drag.lastSurface[0], drag.lastSurface[1]);
      const r1 = Math.hypot(sx, sy);
      if (r0 > 0.03) {
        state.updateDoc((d) => scaleWheelCurve(d, r1 / r0));
      }
    } else {
      const dx = sx - drag.lastSurface[0];
      const dy = sy - drag.lastSurface[1];
      state.updateDoc((d) => translateCurve(d, surface, dx, dy));
    }
    drag.lastSurface = [sx, sy];
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const state = store.getState();
    state.commitGesture();
    drag = null;
    const [px, py] = localPoint(e);
    opts.onHover(doHitTest(px, py, e.pointerType === 'touch'), false);
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    useAppStore.getState().cancelGesture();
    drag = null;
    opts.onHover(null, false);
  };

  const onPointerLeave = () => {
    if (!drag) opts.onHover(null, false);
  };

  const onDoubleClick = (e: MouseEvent) => {
    if (!(e.target instanceof HTMLCanvasElement)) return;
    const [px, py] = localPoint(e);
    handleDoubleActivate(px, py, false);
  };

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerCancel);
  el.addEventListener('pointerleave', onPointerLeave);
  el.addEventListener('dblclick', onDoubleClick);

  return () => {
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerCancel);
    el.removeEventListener('pointerleave', onPointerLeave);
    el.removeEventListener('dblclick', onDoubleClick);
  };
}
