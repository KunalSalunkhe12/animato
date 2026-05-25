import { useMemo, useRef } from 'react';
import type { EditorHost } from '@animato/core';
import { useDraggable, useEditorState, useHotkey, useRegistered } from './hooks.js';
import type { EditorStore } from './store.js';
import { PropertiesPanel } from './properties.js';
import { ElementBadges, PickerOverlay, SelectionOutline } from './overlays.js';

interface EditorRootProps {
  host: EditorHost;
  store: EditorStore;
}

export function EditorRoot({ host, store }: EditorRootProps): JSX.Element | null {
  const ui = useEditorState(store);
  const registered = useRegistered(host);
  const panelRef = useRef<HTMLDivElement | null>(null);
  useHotkey(store);
  const onPointerDown = useDraggable(store, panelRef);

  const selectedElement = useMemo(
    () => registered.find((r) => r.id === ui.selectedId)?.element ?? null,
    [registered, ui.selectedId],
  );

  if (!ui.visible) {
    // When hidden, render a small launcher button bottom-right so users always
    // have a way to open the editor — even if the hotkey gets hijacked.
    return (
      <button
        type="button"
        className="fab"
        title="Open Animato editor (Ctrl+Shift+E)"
        onClick={() => store.set({ visible: true })}
      >
        A
      </button>
    );
  }

  return (
    <>
      {/* selection outline lives behind the panel */}
      <SelectionOutline element={selectedElement} />

      {/* per-element badges */}
      {ui.showBadges && (
        <ElementBadges
          elements={registered}
          selectedId={ui.selectedId}
          onSelect={(id) => store.set({ selectedId: id, pickMode: false })}
        />
      )}

      {/* pick mode overlay */}
      <PickerOverlay
        active={ui.pickMode}
        onPick={(id) => store.set({ selectedId: id, pickMode: false })}
      />

      <div
        ref={panelRef}
        className={`panel${ui.collapsed ? ' collapsed' : ''}`}
        style={{ top: ui.panelPos.y, left: ui.panelPos.x }}
      >
        <header className="panel__header" onPointerDown={onPointerDown}>
          <span className="panel__title">
            <span className="panel__title-dot" />
            Animato
          </span>
          <span className="panel__spacer" />
          <button
            type="button"
            className={`icon-btn${ui.pickMode ? ' active' : ''}`}
            title="Pick mode (click an element on the page)"
            onClick={() => store.set({ pickMode: !ui.pickMode })}
          >
            ⛶
          </button>
          <button
            type="button"
            className={`icon-btn${ui.showBadges ? ' active' : ''}`}
            title="Toggle element badges"
            onClick={() => store.set({ showBadges: !ui.showBadges })}
          >
            #
          </button>
          <button
            type="button"
            className="icon-btn"
            title={ui.collapsed ? 'Expand' : 'Collapse'}
            onClick={() => store.set({ collapsed: !ui.collapsed })}
          >
            {ui.collapsed ? '▾' : '▴'}
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Close (Cmd/Ctrl+Shift+E to reopen)"
            onClick={() => store.set({ visible: false })}
          >
            ×
          </button>
        </header>

        {!ui.collapsed && (
          <div className="panel__body">
            <aside className="sidebar">
              {registered.length === 0 ? (
                <div className="sidebar__empty">
                  No <code>&lt;Animato&gt;</code> elements found on this page yet.
                </div>
              ) : (
                registered.map((r) => (
                  <div
                    key={r.id}
                    className={`sidebar__item${r.id === ui.selectedId ? ' selected' : ''}`}
                    onClick={() => store.set({ selectedId: r.id })}
                  >
                    {r.id}
                  </div>
                ))
              )}
            </aside>

            <PropertiesPanel
              host={host}
              selectedId={ui.selectedId}
              element={selectedElement}
              stateTab={ui.stateTab}
              onStateTabChange={(tab) => store.set({ stateTab: tab })}
            />
          </div>
        )}
      </div>
    </>
  );
}
