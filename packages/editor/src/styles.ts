/**
 * All editor CSS, scoped via :host. Injected into the shadow root so host-page
 * styles can't bleed in and editor styles can't leak out.
 *
 * Kept in one string to avoid a separate CSS pipeline. We can split later if it grows.
 */
export const EDITOR_CSS = /* css */ `
  :host {
    all: initial;
    --bg: #0e0e14;
    --bg-2: #16161f;
    --bg-3: #1f1f2c;
    --border: #2a2a3a;
    --fg: #ececf1;
    --fg-dim: #8b8b9d;
    --accent: #a78bfa;
    --accent-soft: rgba(167, 139, 250, 0.15);
    --warn: #f59e0b;
    --danger: #ef4444;
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    color: var(--fg);
    color-scheme: dark;
  }

  *, *::before, *::after { box-sizing: border-box; }

  .panel {
    position: fixed;
    width: 360px;
    max-height: 80vh;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 2147483647;
    pointer-events: auto;
  }

  .panel.collapsed { max-height: 38px; }

  .panel__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--bg-2);
    border-bottom: 1px solid var(--border);
    cursor: grab;
    user-select: none;
  }
  .panel__header:active { cursor: grabbing; }

  .panel__title {
    font-weight: 600;
    font-size: 13px;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .panel__title-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
  }

  .panel__spacer { flex: 1; }

  .icon-btn {
    background: transparent;
    color: var(--fg-dim);
    border: 1px solid transparent;
    width: 24px; height: 24px;
    border-radius: 6px;
    display: grid; place-items: center;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
  }
  .icon-btn:hover { background: var(--bg-3); color: var(--fg); }
  .icon-btn.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }

  .panel__body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .sidebar {
    width: 130px;
    border-right: 1px solid var(--border);
    background: var(--bg-2);
    overflow-y: auto;
    flex-shrink: 0;
  }
  .sidebar__empty {
    padding: 16px 12px;
    color: var(--fg-dim);
    font-size: 12px;
  }
  .sidebar__item {
    padding: 8px 12px;
    cursor: pointer;
    border-left: 2px solid transparent;
    font-size: 12px;
    color: var(--fg);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sidebar__item:hover { background: var(--bg-3); }
  .sidebar__item.selected {
    background: var(--accent-soft);
    border-left-color: var(--accent);
    color: var(--accent);
  }

  .props {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 12px;
  }
  .props__empty {
    color: var(--fg-dim);
    font-size: 12px;
    padding: 12px 4px;
  }

  .tabs {
    display: flex;
    gap: 2px;
    background: var(--bg-2);
    padding: 2px;
    border-radius: 6px;
    margin-bottom: 12px;
  }
  .tab {
    flex: 1;
    background: transparent;
    color: var(--fg-dim);
    border: 0;
    padding: 5px 8px;
    border-radius: 4px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
  }
  .tab.active {
    background: var(--bg-3);
    color: var(--fg);
  }

  .field {
    display: grid;
    grid-template-columns: 70px 1fr 56px;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .field__label {
    font-size: 11px;
    color: var(--fg-dim);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .field input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
  }
  .field input[type="number"], .field input[type="text"], .field input[type="color"] {
    background: var(--bg-2);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px 6px;
    width: 100%;
    font: inherit;
    font-size: 12px;
  }
  .field input[type="color"] {
    padding: 0;
    height: 28px;
    cursor: pointer;
  }

  .section-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-dim);
    margin: 14px 0 8px;
  }

  .actions {
    display: flex;
    gap: 6px;
    margin-top: 14px;
    flex-wrap: wrap;
  }
  .btn {
    background: var(--bg-3);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
  }
  .btn:hover { background: var(--border); }
  .btn--primary {
    background: var(--accent);
    color: #0b0b10;
    border-color: var(--accent);
  }
  .btn--primary:hover { background: #c4b5fd; }

  .fab {
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent);
    color: #0b0b10;
    border: 0;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    font-size: 16px;
    display: grid;
    place-items: center;
    box-shadow: 0 8px 24px rgba(167, 139, 250, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    z-index: 2147483647;
    pointer-events: auto;
    transition: transform 100ms ease, box-shadow 100ms ease;
  }
  .fab:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(167, 139, 250, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }
  .fab:active { transform: translateY(0); }

  .toast {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-3);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 14px;
    color: var(--fg);
    z-index: 2147483647;
    pointer-events: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }
`;
