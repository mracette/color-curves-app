import { useEffect, useRef } from 'react';
import { colorAt, simulateCVD, stops, type Palette } from 'color-curves';
import { useAppStore } from '../state/store';
import { themeColors } from '../theme';

const MIN_RANGE_GAP = 0.02;

// Render the untrimmed traversal for the bar background so the trim window
// has context; memoized because doc snapshots are immutable.
const fullCache = new WeakMap<Palette, Palette>();
function untrimmed(doc: Palette): Palette {
  if (!doc.range) return doc;
  let full = fullCache.get(doc);
  if (!full) {
    full = { ...doc };
    delete full.range;
    fullCache.set(doc, full);
  }
  return full;
}

export function PaletteBar() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const sizeRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    const draw = () => {
      rafRef.current = 0;
      const [w, h] = sizeRef.current;
      if (w < 4 || h < 4) return;
      const state = useAppStore.getState();
      const { doc, display, cvd } = state;
      const colors = themeColors(state.resolvedTheme);
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const [r0, r1] = doc.range ?? [0, 1];

      if (display.mode === 'continuous') {
        const full = untrimmed(doc);
        const slices = Math.min(512, Math.max(64, Math.floor(w)));
        for (let i = 0; i < slices; i++) {
          const t = slices === 1 ? 0 : i / (slices - 1);
          let rgb = colorAt(full, t).rgb;
          if (cvd !== 'none') rgb = simulateCVD(rgb, cvd);
          ctx.fillStyle = `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(
            rgb.b * 255,
          )})`;
          const x0 = (i / slices) * w;
          const x1 = ((i + 1) / slices) * w;
          ctx.fillRect(x0, 0, x1 - x0 + 1, h);
        }
      } else {
        // Discrete stops of the real (trimmed) palette, laid out inside the
        // trim window so it's clear where the output comes from.
        const list = stops(doc, display.count);
        const winX = r0 * w;
        const winW = (r1 - r0) * w;
        ctx.fillStyle = colors.inset;
        ctx.fillRect(0, 0, w, h);
        list.forEach((c, i) => {
          let rgb = c.rgb;
          if (cvd !== 'none') rgb = simulateCVD(rgb, cvd);
          ctx.fillStyle = `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(
            rgb.b * 255,
          )})`;
          const x0 = winX + (i / list.length) * winW;
          const x1 = winX + ((i + 1) / list.length) * winW;
          ctx.fillRect(x0, 0, x1 - x0, h);
        });
      }

      // Dim the trimmed-out ends.
      if (r0 > 0 || r1 < 1) {
        ctx.fillStyle = state.resolvedTheme === 'dark' ? 'rgba(19,19,22,0.7)' : 'rgba(247,247,248,0.75)';
        if (r0 > 0) ctx.fillRect(0, 0, r0 * w, h);
        if (r1 < 1) ctx.fillRect(r1 * w, 0, (1 - r1) * w, h);
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1;
        ctx.strokeRect(r0 * w + 0.5, 0.5, (r1 - r0) * w - 1, h - 1);
      }

      // Position the DOM trim handles.
      if (startRef.current) startRef.current.style.left = `${r0 * 100}%`;
      if (endRef.current) endRef.current.style.left = `${r1 * 100}%`;
    };

    const scheduleDraw = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = [Math.round(rect.width), Math.round(rect.height)];
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      scheduleDraw();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();
    const unsubscribe = useAppStore.subscribe(scheduleDraw);

    return () => {
      observer.disconnect();
      unsubscribe();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  const makeHandleProps = (which: 'start' | 'end') => ({
    onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      useAppStore.getState().beginGesture();
    },
    onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      useAppStore.getState().updateDoc((d) => {
        const [r0, r1] = d.range ?? [0, 1];
        const next: [number, number] =
          which === 'start'
            ? [Math.min(t, r1 - MIN_RANGE_GAP), r1]
            : [r0, Math.max(t, r0 + MIN_RANGE_GAP)];
        if (next[0] <= 0 && next[1] >= 1) {
          if (!d.range) return d;
          const out = { ...d };
          delete out.range;
          return out;
        }
        return { ...d, range: [Math.max(0, next[0]), Math.min(1, next[1])] };
      });
    },
    onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      useAppStore.getState().commitGesture();
    },
    onDoubleClick() {
      useAppStore.getState().updateDoc((d) => {
        if (!d.range) return d;
        const [r0, r1] = d.range;
        const next: [number, number] = which === 'start' ? [0, r1] : [r0, 1];
        if (next[0] === 0 && next[1] === 1) {
          const out = { ...d };
          delete out.range;
          return out;
        }
        return { ...d, range: next };
      });
    },
  });

  return (
    <div ref={wrapRef} className="palette-bar">
      <canvas ref={canvasRef} className="palette-bar__canvas" />
      <div
        ref={startRef}
        className="palette-bar__handle"
        title="Trim start (double-click to reset)"
        {...makeHandleProps('start')}
      />
      <div
        ref={endRef}
        className="palette-bar__handle"
        title="Trim end (double-click to reset)"
        {...makeHandleProps('end')}
      />
    </div>
  );
}
