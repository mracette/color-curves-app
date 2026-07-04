import { useRef, useSyncExternalStore } from 'react';
import { useAppStore, type AppState } from './store';

/**
 * Subscribe to the store with a trailing throttle: during drags DOM
 * consumers (a11y matrix, exports, viz) re-render at most every `ms`,
 * with a final trailing update guaranteed after the burst ends.
 */
export function useThrottledStore<T>(selector: (s: AppState) => T, ms = 100): T {
  const ref = useRef<{ subscribe: (cb: () => void) => () => void } | null>(null);
  if (ref.current === null) {
    ref.current = {
      subscribe(cb: () => void) {
        let last = 0;
        let timer: ReturnType<typeof setTimeout> | null = null;
        const unsub = useAppStore.subscribe(() => {
          const now = Date.now();
          const elapsed = now - last;
          if (elapsed >= ms) {
            last = now;
            cb();
          } else if (timer === null) {
            timer = setTimeout(() => {
              timer = null;
              last = Date.now();
              cb();
            }, ms - elapsed);
          }
        });
        return () => {
          if (timer !== null) clearTimeout(timer);
          unsub();
        };
      },
    };
  }
  return useSyncExternalStore(ref.current.subscribe, () => selector(useAppStore.getState()));
}
