'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AnimatoConfig, ElementConfig } from '@animato/core';
import { emptyConfig, validateConfig } from '@animato/core';

export interface RegisteredElement {
  id: string;
  element: HTMLElement;
}

/**
 * Subscription callback invoked whenever the registry changes (element mount/unmount)
 * or whenever a config override is applied. Editor uses this to re-render.
 */
type RegistryListener = () => void;

interface AnimatoContextValue {
  config: AnimatoConfig;
  editor: boolean;
  /** Look up the effective config for an id, taking in-memory overrides into account. */
  getElementConfig: (id: string) => ElementConfig | undefined;
  /** Apply an in-memory config override (used by the editor for live preview). */
  setElementConfigOverride: (id: string, override: ElementConfig | undefined) => void;
  /** Snapshot of currently registered elements. */
  getRegistered: () => RegisteredElement[];
  /** Subscribe to registry / override changes. Returns an unsubscribe fn. */
  subscribe: (listener: RegistryListener) => () => void;
  /** Internal: register an element on mount. */
  _register: (id: string, element: HTMLElement) => void;
  /** Internal: unregister on unmount. */
  _unregister: (id: string, element: HTMLElement) => void;
  /** Internal: dev-only duplicate detection. */
  _bumpId: (id: string) => boolean;
  _dropId: (id: string) => void;
}

const AnimatoContext = createContext<AnimatoContextValue | null>(null);

export interface AnimatoProviderProps {
  /** The animato.config.json contents. Pass `undefined` to use an empty config. */
  config?: AnimatoConfig;
  /** Load the editor UI (dev only). Defaults to false. */
  editor?: boolean;
  children: ReactNode;
}

export function AnimatoProvider({
  config,
  editor = false,
  children,
}: AnimatoProviderProps): JSX.Element {
  const validatedConfig = useMemo(() => {
    if (!config) return emptyConfig();
    try {
      return validateConfig(config);
    } catch (err) {
      console.error('[animato] Invalid config — using empty config instead.', err);
      return emptyConfig();
    }
  }, [config]);

  // Mutable refs — registry, overrides, listeners — so we don't churn React state per-mount.
  const registryRef = useRef(new Map<string, HTMLElement>());
  const overridesRef = useRef(new Map<string, ElementConfig>());
  const listenersRef = useRef(new Set<RegistryListener>());
  const idCountsRef = useRef(new Map<string, number>());

  // Cached snapshot for useSyncExternalStore. MUST return the same reference
  // until the underlying data changes — otherwise React loops infinitely
  // ("getSnapshot should be cached" warning).
  const registeredSnapshotRef = useRef<RegisteredElement[]>([]);
  const overrideSnapshotsRef = useRef(new Map<string, ElementConfig | undefined>());

  const rebuildRegisteredSnapshot = (): void => {
    registeredSnapshotRef.current = Array.from(registryRef.current.entries()).map(
      ([id, element]) => ({ id, element }),
    );
  };

  const notify = (): void => {
    for (const l of listenersRef.current) l();
  };

  const value = useMemo<AnimatoContextValue>(
    () => ({
      config: validatedConfig,
      editor,
      getElementConfig(id) {
        // Cache per-id: same reference until override or file config changes.
        const cached = overrideSnapshotsRef.current.get(id);
        const fresh = overridesRef.current.get(id) ?? validatedConfig.elements[id];
        if (cached === fresh) return cached;
        overrideSnapshotsRef.current.set(id, fresh);
        return fresh;
      },
      setElementConfigOverride(id, override) {
        if (override) overridesRef.current.set(id, override);
        else overridesRef.current.delete(id);
        overrideSnapshotsRef.current.delete(id); // invalidate per-id cache
        notify();
      },
      getRegistered() {
        return registeredSnapshotRef.current;
      },
      subscribe(listener) {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      _register(id, element) {
        registryRef.current.set(id, element);
        rebuildRegisteredSnapshot();
        notify();
      },
      _unregister(id, element) {
        if (registryRef.current.get(id) === element) {
          registryRef.current.delete(id);
          rebuildRegisteredSnapshot();
          notify();
        }
      },
      _bumpId(id) {
        const counts = idCountsRef.current;
        const next = (counts.get(id) ?? 0) + 1;
        counts.set(id, next);
        if (next > 1 && process.env.NODE_ENV !== 'production') {
          console.warn(
            '[animato] Duplicate id "%s" detected. Each <Animato id> must be unique on the page.',
            id,
          );
          return false;
        }
        return true;
      },
      _dropId(id) {
        const counts = idCountsRef.current;
        const next = (counts.get(id) ?? 1) - 1;
        if (next <= 0) counts.delete(id);
        else counts.set(id, next);
      },
    }),
    [validatedConfig, editor],
  );

  // Dynamic-import the editor when enabled. Tree-shaken when editor=false.
  const [, setEditorMounted] = useState(false);
  useEffect(() => {
    if (!editor || typeof window === 'undefined') return;
    let teardown: (() => void) | undefined;
    let cancelled = false;
    void import('@animato/editor')
      .then((mod) => {
        if (cancelled) return;
        teardown = mod.mountEditor(value);
        setEditorMounted(true);
      })
      .catch((err: unknown) => {
        console.error(
          '[animato] Failed to load editor. Install @animato/editor to enable visual editing.',
          err,
        );
      });
    return () => {
      cancelled = true;
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return <AnimatoContext.Provider value={value}>{children}</AnimatoContext.Provider>;
}

export function useAnimatoContext(): AnimatoContextValue {
  const ctx = useContext(AnimatoContext);
  if (!ctx) {
    throw new Error(
      '[animato] <Animato> must be used inside <AnimatoProvider>. Wrap your app root with <AnimatoProvider config={...}>.',
    );
  }
  return ctx;
}
