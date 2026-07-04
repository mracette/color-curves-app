import { useState } from 'react';
import { importLegacy, presets, type Palette } from 'color-curves';
import { useAppStore } from '../state/store';
import { useThrottledStore } from '../state/useThrottled';
import { docGradient } from '../state/selectors';
import { newPalette, saveCurrentPalette } from '../state/actions';

function PaletteTile({
  name,
  author,
  doc,
  onOpen,
  actions,
}: {
  name: string;
  author?: string | undefined;
  doc: Palette;
  onOpen(): void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="palette-tile">
      <button className="palette-tile__main" onClick={onOpen} title={`Open ${name}`}>
        <span className="palette-tile__swatch" style={{ background: docGradient(doc) }} />
        <span className="palette-tile__meta">
          <span className="palette-tile__name">{name}</span>
          {author && <span className="palette-tile__author">by {author}</span>}
        </span>
      </button>
      {actions && <div className="palette-tile__actions">{actions}</div>}
    </div>
  );
}

function ImportLegacyBox({ onDone }: { onDone(msg: string): void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const runImport = () => {
    // Accept anything containing the old exportPaletteParams() JSON triple —
    // pull out the top-level {...} blobs in order.
    const blobs: string[] = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && start >= 0) {
          blobs.push(text.slice(start, i + 1));
          start = -1;
        }
      }
    }
    if (blobs.length < 2) {
      onDone('Could not find curve JSON in the pasted text');
      return;
    }
    try {
      const doc = importLegacy(blobs[0]!, blobs[1]!, blobs[2]);
      useAppStore.getState().loadDoc(doc);
      setText('');
      setOpen(false);
      onDone('Legacy palette imported');
    } catch (e) {
      onDone(`Import failed: ${(e as Error).message}`);
    }
  };
  return (
    <div className="library__import">
      <button className="library__link" onClick={() => setOpen(!open)}>
        {open ? '− Import legacy palette' : '+ Import legacy palette'}
      </button>
      {open && (
        <div className="library__import-body">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'Paste an old new ColorPalette(...) snippet or its JSON params'}
            rows={4}
          />
          <button className="button" onClick={runImport} disabled={!text.trim()}>
            Import
          </button>
        </div>
      )}
    </div>
  );
}

export function LibraryPanel({ onToast }: { onToast(msg: string): void }) {
  const saved = useAppStore((s) => s.saved);
  const currentName = useThrottledStore((s) => s.doc.name ?? '', 200);
  const state = useAppStore.getState;

  const saveCurrent = () => {
    onToast(`Saved “${saveCurrentPalette()}”`);
  };

  return (
    <aside className="library">
      <button
        className="button library__save"
        title="Start over with the default palette (undoable)"
        onClick={() => {
          newPalette();
          onToast('New palette');
        }}
      >
        + New palette
      </button>

      <div className="library__section library__section--presets">
        <div className="library__title">Presets</div>
        <div className="library__list library__list--scroll">
          {presets.map((p) => (
            <PaletteTile
              key={p.name}
              name={p.name ?? 'Preset'}
              author={p.author}
              doc={p}
              onOpen={() => {
                state().loadDoc(p);
                onToast(`Opened “${p.name}”`);
              }}
            />
          ))}
        </div>
      </div>

      <div className="library__section library__section--saved">
        <div className="library__title">Saved</div>
        <button className="button library__save" onClick={saveCurrent}>
          + Save “{currentName.trim() || 'Untitled palette'}”
        </button>
        {saved.length === 0 && <div className="library__hint">Nothing saved yet</div>}
        <div className="library__list library__list--saved">
          {saved.map((entry) => (
            <PaletteTile
              key={entry.id}
              name={entry.name}
              doc={entry.doc}
              onOpen={() => {
                state().loadDoc(entry.doc);
                onToast(`Opened “${entry.name}”`);
              }}
              actions={
                <>
                  <button
                    className="icon-button"
                    title="Duplicate"
                    onClick={() => {
                      const now = Date.now();
                      state().setSaved([
                        {
                          ...entry,
                          id: crypto.randomUUID(),
                          name: `${entry.name} copy`,
                          createdAt: now,
                          updatedAt: now,
                        },
                        ...state().saved,
                      ]);
                    }}
                  >
                    ⧉
                  </button>
                  <button
                    className="icon-button"
                    title="Delete"
                    onClick={() => {
                      state().setSaved(state().saved.filter((p) => p.id !== entry.id));
                      onToast(`Deleted “${entry.name}”`);
                    }}
                  >
                    ✕
                  </button>
                </>
              }
            />
          ))}
        </div>
        <ImportLegacyBox onDone={onToast} />
      </div>
    </aside>
  );
}
