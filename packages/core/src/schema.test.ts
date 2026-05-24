import { describe, expect, it } from 'vitest';
import { emptyConfig, validateConfig } from './schema.js';

describe('validateConfig', () => {
  it('accepts a minimal valid config', () => {
    const cfg = { version: 1, elements: {} };
    expect(validateConfig(cfg)).toBe(cfg);
  });

  it('accepts a config with one element', () => {
    const cfg = {
      version: 1,
      elements: {
        hero: { to: { opacity: 1, y: 0 }, duration: 0.8, ease: 'power3.out' },
      },
    };
    expect(validateConfig(cfg)).toBe(cfg);
  });

  it('rejects non-object input', () => {
    expect(() => validateConfig(null)).toThrow(/must be an object/);
    expect(() => validateConfig('string')).toThrow(/must be an object/);
  });

  it('rejects unsupported versions', () => {
    expect(() => validateConfig({ version: 2, elements: {} })).toThrow(/version/);
  });

  it('rejects missing elements', () => {
    expect(() => validateConfig({ version: 1 })).toThrow(/elements/);
  });

  it('rejects an element with negative duration', () => {
    expect(() =>
      validateConfig({
        version: 1,
        elements: { bad: { duration: -1 } },
      }),
    ).toThrow(/duration/);
  });
});

describe('emptyConfig', () => {
  it('returns a valid empty config', () => {
    const cfg = emptyConfig();
    expect(cfg).toEqual({ version: 1, elements: {} });
    expect(() => validateConfig(cfg)).not.toThrow();
  });
});
