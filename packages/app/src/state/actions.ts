import { defaultDoc, useAppStore, type SavedPalette } from './store';

/** Fresh slate: default document, and any share-link hash leaves the URL. */
export function newPalette(): void {
  useAppStore.getState().loadDoc(defaultDoc());
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

/** Save the current document into the local library; returns the name used. */
export function saveCurrentPalette(): string {
  const state = useAppStore.getState();
  const doc = state.doc;
  const name = (doc.name ?? '').trim() || 'Untitled palette';
  const now = Date.now();
  const entry: SavedPalette = {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    doc: doc.name ? doc : { ...doc, name },
  };
  state.setSaved([entry, ...state.saved]);
  return name;
}
