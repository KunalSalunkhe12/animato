/**
 * @animato/core — framework-agnostic runtime for Animato.
 *
 * Public exports:
 *   - initAnimato({ config, editor }) — vanilla / data-attribute API
 *   - applyAnimation(id, element, config) — low-level: run one animation on one element
 *   - validateConfig, emptyConfig — config helpers
 *   - All TypeScript types
 */

export { initAnimato, applyAnimation, getConfigForElement } from './init.js';
export { validateConfig, emptyConfig } from './schema.js';
export type {
  AnimatableProps,
  AnimationHandle,
  AnimatoConfig,
  EditorHost,
  ElementConfig,
  InitOptions,
  RegisteredElement,
  ScrollConfig,
} from './types.js';
