import { useAppStore } from '../state/store';
import { useThrottledStore } from '../state/useThrottled';

export function TopBar({
  onShare,
  onAbout,
  onReset,
}: {
  onShare(): void;
  onAbout(): void;
  onReset(): void;
}) {
  const name = useThrottledStore((s) => s.doc.name ?? '', 100);
  const space = useThrottledStore((s) => s.doc.space, 100);
  const canUndo = useAppStore((s) => s.past.length > 0);
  const canRedo = useAppStore((s) => s.future.length > 0);
  const theme = useAppStore((s) => s.theme);
  const state = useAppStore.getState;

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__brand" title="Start a new palette" onClick={onReset}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M 5 15 C 8 8, 12 18, 19 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Color Curves</span>
        </button>

        <input
          className="topbar__name"
          placeholder="Untitled palette"
          value={name}
          onFocus={() => state().beginGesture()}
          onBlur={() => state().commitGesture()}
          onChange={(e) => state().updateDoc((d) => ({ ...d, name: e.target.value }))}
          aria-label="Palette name"
        />
      </div>

      <div className="segmented" role="group" aria-label="Color space">
        <button
          className={space === 'hsl' ? 'is-active' : ''}
          title="HSL — classic wheel (default)"
          onClick={() => state().updateDoc((d) => ({ ...d, space: 'hsl' }))}
        >
          HSL
        </button>
        <button
          className={space === 'oklch' ? 'is-active' : ''}
          title="OKLCH — perceptually uniform, gamut-aware"
          onClick={() => state().updateDoc((d) => ({ ...d, space: 'oklch' }))}
        >
          OKLCH
        </button>
      </div>

      <div className="topbar__actions">
        <button className="icon-button" title="Undo (⌘Z)" disabled={!canUndo} onClick={() => state().undo()}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M6.7 3.2 3.2 6.7l3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.6 6.7h5.2a4 4 0 0 1 0 8H6.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button className="icon-button" title="Redo (⇧⌘Z)" disabled={!canRedo} onClick={() => state().redo()}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="m9.3 3.2 3.5 3.5-3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.4 6.7H7.2a4 4 0 0 0 0 8h2.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button className="button button--primary" onClick={onShare}>
          Share
        </button>
        <button
          className="icon-button"
          title={`Theme: ${theme}`}
          onClick={() => {
            const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
            state().setTheme(next);
          }}
        >
          {theme === 'dark' ? '☾' : theme === 'light' ? '☀' : '◐'}
        </button>
        <button className="icon-button" title="About" onClick={onAbout}>
          ?
        </button>
      </div>
    </header>
  );
}
