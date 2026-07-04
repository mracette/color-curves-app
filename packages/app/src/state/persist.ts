import { parsePalette, toJSON, type Palette } from 'color-curves';
import { useAppStore, type DisplayState, type SavedPalette } from './store';

const LIB_KEY = 'cc:v1:library';
const DRAFT_KEY = 'cc:v1:draft';

interface StoredPalette {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  doc: unknown;
}

export function loadLibrary(): SavedPalette[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LIB_KEY) ?? 'null') as {
      version?: number;
      palettes?: StoredPalette[];
    } | null;
    if (!raw || raw.version !== 1 || !Array.isArray(raw.palettes)) return [];
    const out: SavedPalette[] = [];
    for (const entry of raw.palettes) {
      try {
        out.push({
          id: String(entry.id),
          name: String(entry.name),
          createdAt: Number(entry.createdAt) || 0,
          updatedAt: Number(entry.updatedAt) || 0,
          doc: parsePalette(entry.doc),
        });
      } catch {
        // drop unreadable entries, keep the rest
      }
    }
    return out;
  } catch {
    return [];
  }
}

function saveLibrary(palettes: SavedPalette[]) {
  try {
    localStorage.setItem(
      LIB_KEY,
      JSON.stringify({
        version: 1,
        palettes: palettes.map((p) => ({ ...p, doc: toJSON(p.doc) })),
      }),
    );
  } catch {
    // storage full/unavailable — nothing sensible to do
  }
}

export function loadDraft(): { doc: Palette; display: Partial<DisplayState> } | null {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as {
      doc?: unknown;
      display?: Partial<DisplayState>;
    } | null;
    if (!raw?.doc) return null;
    return { doc: parsePalette(raw.doc), display: raw.display ?? {} };
  } catch {
    return null;
  }
}

/**
 * Wire store → localStorage: the draft (debounced, commits only) and the
 * saved-palette library. Returns an unsubscribe function.
 */
export function initPersistence(): () => void {
  let draftTimer: ReturnType<typeof setTimeout> | null = null;
  const unsub = useAppStore.subscribe((s, prev) => {
    if (s.saved !== prev.saved) saveLibrary(s.saved);

    const committed = prev.transientBase !== null && s.transientBase === null;
    const changed = s.doc !== prev.doc || s.display !== prev.display;
    if ((!changed && !committed) || s.transientBase !== null) return;
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      const cur = useAppStore.getState();
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ doc: toJSON(cur.doc), display: cur.display }),
        );
      } catch {
        // ignore
      }
    }, 500);
  });
  return () => {
    unsub();
    if (draftTimer) clearTimeout(draftTimer);
  };
}
