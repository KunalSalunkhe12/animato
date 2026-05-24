import { applyAnimation } from './runtime.js';
import { validateConfig } from './schema.js';
import type { AnimationHandle, AnimatoConfig, InitOptions } from './types.js';

const DATA_ATTR = 'data-animato-id';

/**
 * Vanilla / data-attribute API.
 *
 * Scans the document for elements with `data-animato-id`, runs their
 * animations per the config, and watches the DOM for new ones added later.
 *
 * @returns A teardown function that kills all animations and disconnects observers.
 */
export function initAnimato(options: InitOptions): () => void {
  const config = validateConfig(options.config);
  const respectReducedMotion = options.respectReducedMotion ?? true;
  const handles = new Map<Element, AnimationHandle>();

  function register(element: Element): void {
    if (!(element instanceof HTMLElement)) return;
    if (handles.has(element)) return;
    const id = element.getAttribute(DATA_ATTR);
    if (!id) return;
    const elConfig = config.elements[id];
    if (!elConfig) {
      console.warn(
        '[animato] Element with %s="%s" has no entry in config. Open the editor to configure it.',
        DATA_ATTR,
        id,
      );
      return;
    }
    const handle = applyAnimation(id, element, elConfig, { respectReducedMotion });
    handles.set(element, handle);
  }

  function unregister(element: Element): void {
    const handle = handles.get(element);
    if (handle) {
      handle.kill();
      handles.delete(element);
    }
  }

  // Initial pass
  for (const el of document.querySelectorAll(`[${DATA_ATTR}]`)) {
    register(el);
  }

  // Watch for added / removed elements
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.hasAttribute(DATA_ATTR)) register(node);
        for (const desc of node.querySelectorAll?.(`[${DATA_ATTR}]`) ?? []) {
          register(desc);
        }
      }
      for (const node of m.removedNodes) {
        if (!(node instanceof Element)) continue;
        if (handles.has(node)) unregister(node);
        for (const desc of node.querySelectorAll?.(`[${DATA_ATTR}]`) ?? []) {
          unregister(desc);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Editor: dynamic import (zero impact when editor=false)
  if (options.editor) {
    // Placeholder — editor package lands in Sprint 2.
    console.info('[animato] Editor mode requested but editor package not yet implemented (Sprint 2).');
  }

  return function teardown(): void {
    observer.disconnect();
    for (const handle of handles.values()) handle.kill();
    handles.clear();
  };
}

/**
 * Re-export for advanced consumers (e.g. the React package).
 */
export { applyAnimation };

/**
 * Re-export validator / empty config helpers.
 */
export { validateConfig } from './schema.js';
export { emptyConfig } from './schema.js';

/**
 * Inspection helpers.
 */
export function getConfigForElement(
  config: AnimatoConfig,
  id: string,
): AnimatoConfig['elements'][string] | undefined {
  return config.elements[id];
}
