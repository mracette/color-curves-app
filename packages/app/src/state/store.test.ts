import { beforeEach, describe, expect, it } from 'vitest';
import { shapes } from 'color-curves';
import { defaultDoc, useAppStore } from './store';

function reset() {
  useAppStore.setState({
    doc: defaultDoc(),
    revision: 0,
    past: [],
    future: [],
    transientBase: null,
    selection: null,
  });
}

describe('store undo semantics', () => {
  beforeEach(reset);

  it('plain updates push one undo entry each', () => {
    const s = useAppStore.getState();
    s.updateDoc((d) => ({ ...d, name: 'one' }));
    s.updateDoc((d) => ({ ...d, name: 'two' }));
    expect(useAppStore.getState().past.length).toBe(2);
    s.undo();
    expect(useAppStore.getState().doc.name).toBe('one');
    s.redo();
    expect(useAppStore.getState().doc.name).toBe('two');
  });

  it('a gesture collapses many transient updates into one entry', () => {
    const s = useAppStore.getState();
    s.beginGesture();
    for (let i = 0; i < 20; i++) {
      s.updateDoc((d) => ({ ...d, name: `step-${i}` }));
    }
    s.commitGesture();
    const st = useAppStore.getState();
    expect(st.past.length).toBe(1);
    expect(st.doc.name).toBe('step-19');
    st.undo();
    expect(useAppStore.getState().doc.name).toBeUndefined();
  });

  it('an unchanged gesture adds no undo entry', () => {
    const s = useAppStore.getState();
    s.beginGesture();
    s.commitGesture();
    expect(useAppStore.getState().past.length).toBe(0);
  });

  it('cancelGesture restores the pre-gesture doc', () => {
    const s = useAppStore.getState();
    s.beginGesture();
    s.updateDoc((d) => ({ ...d, name: 'oops' }));
    s.cancelGesture();
    expect(useAppStore.getState().doc.name).toBeUndefined();
    expect(useAppStore.getState().past.length).toBe(0);
  });

  it('new edits clear the redo stack', () => {
    const s = useAppStore.getState();
    s.updateDoc((d) => ({ ...d, name: 'a' }));
    s.undo();
    s.updateDoc((d) => ({ ...d, wheel: shapes.circle() }));
    expect(useAppStore.getState().future.length).toBe(0);
  });
});
