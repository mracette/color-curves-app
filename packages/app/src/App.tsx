import { useEffect, useRef, useState } from 'react';
import { decodePaletteUrl, encodePaletteUrl } from 'color-curves';
import { useAppStore } from './state/store';
import { TopBar } from './components/TopBar';
import { SurfaceEditor } from './components/SurfaceEditor';
import { ShapeRow } from './components/ShapeRow';
import { PaletteBar } from './components/PaletteBar';
import { StopControls } from './components/StopControls';
import { InspectorPanel } from './components/InspectorPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { initPersistence, loadLibrary } from './state/persist';
import { saveCurrentPalette } from './state/actions';
import { A11yPanel } from './components/A11yPanel';
import { ExportPanel } from './components/ExportPanel';
import { AboutModal } from './components/AboutModal';
import { VizPreviews } from './components/viz/VizPreviews';

function currentHash(): string {
  const s = useAppStore.getState();
  const mode = s.display.mode === 'discrete' ? 'd' : 'c';
  return `#p=${encodePaletteUrl(s.doc)}&m=${mode}&n=${s.display.count}`;
}

export function App() {
  const [toast, setToast] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = useAppStore((s) => s.theme);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // Boot once: theme pref, saved library, and — only if the user arrived
  // via a share link — the palette from the URL fragment. Plain editing
  // never writes the URL or storage, so a refresh gives a fresh slate.
  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('cc:v1:prefs') ?? '{}') as { theme?: string };
      if (prefs.theme === 'light' || prefs.theme === 'dark') {
        useAppStore.getState().setTheme(prefs.theme);
      }
      localStorage.removeItem('cc:v1:draft'); // retired autosave key
    } catch {
      // ignore unreadable prefs
    }
    useAppStore.getState().setSaved(loadLibrary());

    const p = location.hash.match(/[#&]p=([A-Za-z0-9_-]+)/);
    if (p) {
      try {
        useAppStore.setState({ doc: decodePaletteUrl(p[1]!), revision: 1 });
      } catch {
        showToast('Could not read the shared palette link');
      }
    }
    const m = location.hash.match(/[#&]m=(d|c)/);
    const n = location.hash.match(/[#&]n=(\d+)/);
    if (m || n) {
      useAppStore.getState().setDisplay({
        ...(m ? { mode: m[1] === 'd' ? ('discrete' as const) : ('continuous' as const) } : {}),
        ...(n ? { count: Math.min(64, Math.max(2, Number(n[1]))) } : {}),
      });
    }
    return initPersistence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve and apply the theme; follow the OS while on 'system'.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
      useAppStore.getState().setResolvedTheme(resolved);
      try {
        localStorage.setItem('cc:v1:prefs', JSON.stringify({ theme }));
      } catch {
        // storage may be unavailable
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  // Global undo/redo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key.toLowerCase() === 'z') {
        if (e.shiftKey) useAppStore.getState().redo();
        else useAppStore.getState().undo();
        e.preventDefault();
      } else if (e.key.toLowerCase() === 's') {
        setToast(`Saved “${saveCurrentPalette()}”`);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const share = () => {
    history.replaceState(null, '', currentHash());
    navigator.clipboard
      .writeText(location.href)
      .then(() => showToast('Share link copied to clipboard'))
      .catch(() => showToast('Copy failed — the link is in the address bar'));
  };

  return (
    <div className="app">
      <TopBar onShare={share} onAbout={() => setAboutOpen(true)} />
      <div className="app-body">
        <LibraryPanel onToast={showToast} />
        <main className="editor-column">
          <div className="editor-column__inner">
            <PaletteBar />
            <StopControls />
            <SurfaceEditor surface="wheel" />
            <ShapeRow surface="wheel" />
            <SurfaceEditor surface="strip" />
            <ShapeRow surface="strip" />
          </div>
        </main>
        <InspectorPanel
          preview={<VizPreviews />}
          a11y={<A11yPanel />}
          exporter={<ExportPanel onToast={showToast} />}
        />
      </div>
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
