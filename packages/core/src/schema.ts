import type { AnimatoConfig, ElementConfig } from './types.js';

/**
 * Minimal runtime validation for AnimatoConfig.
 * Not Zod — we keep core dependency-free. Build plugins (Sprint 3) will do
 * stricter schema validation at build time.
 */
export function validateConfig(input: unknown): AnimatoConfig {
  if (!input || typeof input !== 'object') {
    throw new Error('[animato] Config must be an object');
  }
  const cfg = input as Partial<AnimatoConfig>;

  if (cfg.version !== 1) {
    throw new Error(
      `[animato] Unsupported config version: ${String(cfg.version)}. Expected version: 1.`,
    );
  }

  if (!cfg.elements || typeof cfg.elements !== 'object') {
    throw new Error('[animato] Config must have an "elements" object');
  }

  for (const [id, el] of Object.entries(cfg.elements)) {
    validateElement(id, el);
  }

  return cfg as AnimatoConfig;
}

function validateElement(id: string, el: unknown): asserts el is ElementConfig {
  if (!el || typeof el !== 'object') {
    throw new Error(`[animato] Element "${id}" config must be an object`);
  }
  const e = el as ElementConfig;
  if (e.duration !== undefined && (typeof e.duration !== 'number' || e.duration < 0)) {
    throw new Error(`[animato] Element "${id}" has invalid duration: ${String(e.duration)}`);
  }
  if (e.ease !== undefined && typeof e.ease !== 'string') {
    throw new Error(`[animato] Element "${id}" has invalid ease: must be a string`);
  }
}

/**
 * Empty default config used when no config is provided.
 */
export function emptyConfig(): AnimatoConfig {
  return { version: 1, elements: {} };
}
