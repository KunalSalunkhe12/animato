'use client';

import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import type { AnimatoConfig } from '@animato/core';
import { emptyConfig, validateConfig } from '@animato/core';

interface AnimatoContextValue {
  config: AnimatoConfig;
  editor: boolean;
  /** Dev-only: registers an id, returns false if it's a duplicate. */
  registerId: (id: string) => boolean;
  /** Dev-only: unregister on unmount. */
  unregisterId: (id: string) => void;
}

const AnimatoContext = createContext<AnimatoContextValue | null>(null);

export interface AnimatoProviderProps {
  /** The animato.config.json contents. Pass `undefined` to use an empty config. */
  config?: AnimatoConfig;
  /** Load the editor UI (dev only). Defaults to false. Editor package lands in Sprint 2. */
  editor?: boolean;
  children: ReactNode;
}

export function AnimatoProvider({
  config,
  editor = false,
  children,
}: AnimatoProviderProps): JSX.Element {
  const validated = useMemo(() => {
    if (!config) return emptyConfig();
    try {
      return validateConfig(config);
    } catch (err) {
      console.error('[animato] Invalid config — using empty config instead.', err);
      return emptyConfig();
    }
  }, [config]);

  const idCounts = useRef(new Map<string, number>());

  const value = useMemo<AnimatoContextValue>(
    () => ({
      config: validated,
      editor,
      registerId(id: string): boolean {
        const counts = idCounts.current;
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
      unregisterId(id: string): void {
        const counts = idCounts.current;
        const next = (counts.get(id) ?? 1) - 1;
        if (next <= 0) counts.delete(id);
        else counts.set(id, next);
      },
    }),
    [validated, editor],
  );

  // Editor mount placeholder — Sprint 2 will dynamic-import the editor here.
  // if (editor && typeof window !== 'undefined') { import('@animato/editor').then(...) }

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
