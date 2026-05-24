/**
 * @animato/react — React bindings for Animato.
 *
 * Quickstart:
 * ```tsx
 * import { AnimatoProvider, Animato } from '@animato/react';
 * import animatoConfig from './animato.config.json';
 *
 * <AnimatoProvider config={animatoConfig} editor={import.meta.env.DEV}>
 *   <Animato id="hero-title"><h1>Welcome</h1></Animato>
 * </AnimatoProvider>
 * ```
 */

export { AnimatoProvider, useAnimatoContext } from './provider.js';
export type { AnimatoProviderProps } from './provider.js';

export { Animato } from './animato.js';
export type { AnimatoProps } from './animato.js';

// Re-export core types for convenience
export type {
  AnimatableProps,
  AnimatoConfig,
  ElementConfig,
  ScrollConfig,
} from '@animato/core';
