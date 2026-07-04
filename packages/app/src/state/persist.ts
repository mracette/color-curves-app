import { parsePalette, toJSON } from 'color-curves';
import { useAppStore, type SavedPalette } from './store';

const LIB_KEY = 'cc:v1:library';

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

/**
 * Mirror the saved-palette library to localStorage. Deliberately nothing
 * else: the working document is ephemeral (refresh = fresh slate), and
 * persistence is always explicit — Share links or the saved library.
 */
export function initPersistence(): () => void {
  return useAppStore.subscribe((s, prev) => {
    if (s.saved !== prev.saved) saveLibrary(s.saved);
  });
}
