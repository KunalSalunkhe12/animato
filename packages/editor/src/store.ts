/**
 * Minimal pub/sub store for editor UI state.
 * Kept dependency-free — no Zustand/Jotai — so the editor bundle stays small.
 */

export interface EditorUiState {
  visible: boolean;
  collapsed: boolean;
  selectedId: string | null;
  pickMode: boolean;
  showBadges: boolean;
  /** Active "From" or "To" tab in properties panel. */
  stateTab: 'from' | 'to';
  /** Panel position (top-left corner) in viewport pixels. */
  panelPos: { x: number; y: number };
}

const STORAGE_KEY = 'animato.editor.ui';

function loadPersisted(): Partial<EditorUiState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<EditorUiState>;
  } catch {
    return {};
  }
}

function persist(state: EditorUiState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        visible: state.visible,
        collapsed: state.collapsed,
        showBadges: state.showBadges,
        panelPos: state.panelPos,
      }),
    );
  } catch {
    /* ignore quota */
  }
}

function defaultState(): EditorUiState {
  const persisted = loadPersisted();
  return {
    visible: persisted.visible ?? false,
    collapsed: persisted.collapsed ?? false,
    selectedId: null,
    pickMode: false,
    showBadges: persisted.showBadges ?? false,
    stateTab: 'to',
    panelPos: persisted.panelPos ?? { x: 16, y: 16 },
  };
}

export type Listener = (state: EditorUiState) => void;

export class EditorStore {
  private state: EditorUiState = defaultState();
  private listeners = new Set<Listener>();

  getState(): EditorUiState {
    return this.state;
  }

  set(partial: Partial<EditorUiState>): void {
    this.state = { ...this.state, ...partial };
    persist(this.state);
    for (const l of this.listeners) l(this.state);
  }

  toggleVisible(): void {
    this.set({ visible: !this.state.visible });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener) as unknown as void;
  }
}
