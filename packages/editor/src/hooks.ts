import { useSyncExternalStore, useEffect, useState, useCallback, useRef } from 'react';
import type { EditorHost, ElementConfig, RegisteredElement } from '@animato/core';
import type { EditorStore, EditorUiState } from './store.js';

/** Subscribe a React component to editor UI state. */
export function useEditorState(store: EditorStore): EditorUiState {
  return useSyncExternalStore(
    (l) => store.subscribe(l),
    () => store.getState(),
    () => store.getState(),
  );
}

/** Subscribe a React component to the host's element registry. */
export function useRegistered(host: EditorHost): RegisteredElement[] {
  return useSyncExternalStore(
    host.subscribe,
    () => host.getRegistered(),
    () => host.getRegistered(),
  );
}

/**
 * Subscribe to the live config for one element id. Re-renders when:
 *  - the user changes a value (override write) for that id
 *  - the underlying file config changes
 *
 * Returns undefined when id is null. Stable reference between unrelated changes
 * (host.getElementConfig caches per-id), so React won't loop.
 */
export function useElementConfig(host: EditorHost, id: string | null): ElementConfig | undefined {
  return useSyncExternalStore(
    host.subscribe,
    () => (id ? host.getElementConfig(id) : undefined),
    () => (id ? host.getElementConfig(id) : undefined),
  );
}

/**
 * Cmd/Ctrl+Shift+E → toggle editor visibility.
 *
 * Why E and not A: Chrome claims Ctrl+Shift+A globally for "Search tabs" and
 * eats the keypress before any page handler can see it. Ctrl+Shift+E is
 * unbound in all major browsers.
 */
export function useHotkey(store: EditorStore): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.code === 'KeyE') {
        e.preventDefault();
        store.toggleVisible();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);
}

/**
 * Make a node draggable by a handle. Returns an `onPointerDown` to attach to the handle.
 * Mutates state on the store directly so position persists.
 */
export function useDraggable(
  store: EditorStore,
  panelRef: React.RefObject<HTMLElement | null>,
): (e: React.PointerEvent) => void {
  return useCallback(
    (e: React.PointerEvent) => {
      // Only left-button drags. Ignore drags that started on a button (collapse/close).
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('button')) return;
      const node = panelRef.current;
      if (!node) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const { x: px, y: py } = store.getState().panelPos;
      const move = (ev: PointerEvent): void => {
        const nx = Math.max(0, Math.min(window.innerWidth - 60, px + (ev.clientX - startX)));
        const ny = Math.max(0, Math.min(window.innerHeight - 30, py + (ev.clientY - startY)));
        store.set({ panelPos: { x: nx, y: ny } });
      };
      const up = (): void => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [panelRef, store],
  );
}

/**
 * Track the bounding rect of an element, re-measuring on scroll, resize, and
 * via ResizeObserver. Returns null when there is no element.
 */
export function useElementRect(element: HTMLElement | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!element) {
      setRect(null);
      return;
    }
    const measure = (): void => setRect(element.getBoundingClientRect());
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(element);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [element]);

  return rect;
}

/**
 * Convenience: stable ref that holds the latest value.
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
