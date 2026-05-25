/**
 * @animato/editor — visual editor UI for Animato.
 *
 * The provider in @animato/react dynamic-imports this module when `editor={true}`.
 * Public surface is intentionally tiny — just `mountEditor(host)`.
 */

import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { EditorHost } from '@animato/core';
import { EditorRoot } from './EditorRoot.js';
import { EditorStore } from './store.js';
import { EDITOR_CSS } from './styles.js';

const HOST_ID = 'animato-editor-root';
const HINT_KEY = 'animato.editor.hint-shown';

/**
 * Mount the editor. Returns a teardown function.
 *
 * Idempotent: calling twice is a no-op (returns the first teardown).
 */
export function mountEditor(host: EditorHost): () => void {
  if (typeof document === 'undefined') return () => undefined;

  // Idempotency guard — avoid double-mount during React StrictMode double-effect.
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    return () => {
      existing.remove();
    };
  }

  const container = document.createElement('div');
  container.id = HOST_ID;
  // Keep the host node itself non-interactive; only the rendered panel uses pointer-events.
  container.style.cssText = `position: fixed; inset: 0; pointer-events: none; z-index: 2147483647;`;
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = EDITOR_CSS;
  shadow.appendChild(style);

  const reactMount = document.createElement('div');
  shadow.appendChild(reactMount);

  const store = new EditorStore();

  // First-load hint so users discover the hotkey.
  showHintOnce(shadow);

  const root: Root = createRoot(reactMount);
  root.render(
    <StrictMode>
      <EditorRoot host={host} store={store} />
    </StrictMode>,
  );

  return () => {
    root.unmount();
    container.remove();
  };
}

function showHintOnce(shadow: ShadowRoot): void {
  try {
    if (localStorage.getItem(HINT_KEY)) return;
    localStorage.setItem(HINT_KEY, '1');
  } catch {
    /* ignore */
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'Animato editor ready — Ctrl+Shift+E or click the A button';
  shadow.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}
