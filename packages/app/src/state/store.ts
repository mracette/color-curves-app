import { create } from 'zustand';
import { createPalette, shapes, type Palette } from 'color-curves';
import type { CVDType } from 'color-curves';

export type Surface = 'wheel' | 'strip';

export interface Selection {
  surface: Surface;
  index: number;
}

export interface DisplayState {
  mode: 'continuous' | 'discrete';
  count: number;
}

export interface SavedPalette {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  doc: Palette;
}

export type ThemeSetting = 'system' | 'light' | 'dark';
export type CvdSetting = 'none' | CVDType;
export type InspectorTab = 'preview' | 'a11y' | 'export';

const UNDO_CAP = 100;

export interface AppState {
  doc: Palette;
  display: DisplayState;
  /** Bumps on every doc change; cheap cache key for canvas redraws. */
  revision: number;
  past: Palette[];
  future: Palette[];
  transientBase: Palette | null;

  selection: Selection | null;
  inspectorTab: InspectorTab;
  contrastMode: 'wcag' | 'apca';
  cvd: CvdSetting;
  theme: ThemeSetting;
  /** What the theme actually resolved to (system follows the OS). */
  resolvedTheme: 'light' | 'dark';
  libraryOpen: boolean;
  saved: SavedPalette[];

  updateDoc(fn: (d: Palette) => Palette, opts?: { transient?: boolean }): void;
  setDisplay(patch: Partial<DisplayState>): void;
  beginGesture(): void;
  commitGesture(): void;
  cancelGesture(): void;
  undo(): void;
  redo(): void;
  /** Load a palette wholesale (preset, saved, URL) as a single undo entry. */
  loadDoc(doc: Palette): void;
  select(sel: Selection | null): void;
  setInspectorTab(tab: InspectorTab): void;
  setContrastMode(mode: 'wcag' | 'apca'): void;
  setCvd(cvd: CvdSetting): void;
  setTheme(theme: ThemeSetting): void;
  setResolvedTheme(theme: 'light' | 'dark'): void;
  setLibraryOpen(open: boolean): void;
  setSaved(saved: SavedPalette[]): void;
}

export function defaultDoc(): Palette {
  return createPalette({
    wheel: shapes.arc({ radius: 0.62, startAngle: Math.PI * 0.85, endAngle: Math.PI * 0.1 }),
    light: shapes.ramp(0.25, 0.9),
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  doc: defaultDoc(),
  display: { mode: 'continuous', count: 8 },
  revision: 0,
  past: [],
  future: [],
  transientBase: null,

  selection: null,
  inspectorTab: 'export',
  contrastMode: 'wcag',
  cvd: 'none',
  theme: 'system',
  resolvedTheme: 'light',
  libraryOpen: true,
  saved: [],

  updateDoc(fn, opts) {
    const { doc, past, revision, transientBase } = get();
    const next = fn(doc);
    if (next === doc) return;
    if (opts?.transient || transientBase !== null) {
      set({ doc: next, revision: revision + 1 });
    } else {
      set({
        doc: next,
        revision: revision + 1,
        past: [...past.slice(-UNDO_CAP + 1), doc],
        future: [],
      });
    }
  },

  setDisplay(patch) {
    set((s) => ({ display: { ...s.display, ...patch } }));
  },

  beginGesture() {
    const { transientBase, doc } = get();
    if (transientBase === null) set({ transientBase: doc });
  },

  commitGesture() {
    const { transientBase, doc, past } = get();
    if (transientBase === null) return;
    if (transientBase !== doc) {
      set({
        transientBase: null,
        past: [...past.slice(-UNDO_CAP + 1), transientBase],
        future: [],
      });
    } else {
      set({ transientBase: null });
    }
  },

  cancelGesture() {
    const { transientBase, revision } = get();
    if (transientBase === null) return;
    set({ transientBase: null, doc: transientBase, revision: revision + 1 });
  },

  undo() {
    const { past, future, doc, revision } = get();
    const prev = past[past.length - 1];
    if (!prev) return;
    set({
      doc: prev,
      revision: revision + 1,
      past: past.slice(0, -1),
      future: [...future, doc],
      selection: null,
    });
  },

  redo() {
    const { past, future, doc, revision } = get();
    const next = future[future.length - 1];
    if (!next) return;
    set({
      doc: next,
      revision: revision + 1,
      future: future.slice(0, -1),
      past: [...past, doc],
      selection: null,
    });
  },

  loadDoc(doc) {
    const { past, revision } = get();
    set({
      doc,
      revision: revision + 1,
      past: [...past.slice(-UNDO_CAP + 1), get().doc],
      future: [],
      selection: null,
      transientBase: null,
    });
  },

  select(sel) {
    set({ selection: sel });
  },

  setInspectorTab(tab) {
    set({ inspectorTab: tab });
  },

  setContrastMode(mode) {
    set({ contrastMode: mode });
  },

  setCvd(cvd) {
    set({ cvd });
  },

  setTheme(theme) {
    set({ theme });
  },

  setResolvedTheme(resolvedTheme) {
    set({ resolvedTheme });
  },

  setLibraryOpen(open) {
    set({ libraryOpen: open });
  },

  setSaved(saved) {
    set({ saved });
  },
}));

// Test hook for Playwright (dev/preview only usage).
declare global {
  interface Window {
    __cc?: typeof useAppStore;
  }
}
if (typeof window !== 'undefined') {
  window.__cc = useAppStore;
}
