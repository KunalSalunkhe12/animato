import { gsap } from 'gsap';
import type {
  AnimatableProps,
  AnimationHandle,
  ElementConfig,
  ScrollConfig,
} from './types.js';

/**
 * Lazily registered. ScrollTrigger is a separate plugin import; users must
 * register it themselves if they want scroll-driven animations. We attempt to
 * detect it at runtime and warn (once) if a config uses `scroll` but the plugin
 * isn't registered.
 */
let scrollTriggerWarned = false;

function getScrollTrigger(): unknown {
  // gsap.core has a getPlugin method, but its typing is loose; safer to check on the registered plugins map.
  const plugin = (gsap as unknown as { plugins?: Record<string, unknown> }).plugins?.scrollTrigger;
  return plugin;
}

/**
 * Apply an animation defined by `config` to `element`. Returns a handle that
 * lets callers kill or refresh the animation (e.g. on unmount or config change).
 */
export function applyAnimation(
  id: string,
  element: HTMLElement,
  config: ElementConfig,
  options: { respectReducedMotion?: boolean } = {},
): AnimationHandle {
  const tweens: Array<gsap.core.Tween | gsap.core.Timeline> = [];
  let scrollInstance: { kill: () => void } | undefined;

  const reducedMotion =
    (options.respectReducedMotion ?? true) &&
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function build(): void {
    if (config.disabled) return;

    if (reducedMotion) {
      // Snap directly to the final state instead of animating.
      if (config.to) gsap.set(element, config.to as gsap.TweenVars);
      return;
    }

    const baseVars: gsap.TweenVars = {
      duration: config.duration ?? 0.6,
      ease: config.ease ?? 'power2.out',
      delay: config.delay,
      repeat: config.repeat,
      yoyo: config.yoyo,
    };

    if (config.scroll) {
      const st = getScrollTrigger();
      if (!st) {
        if (!scrollTriggerWarned) {
          console.warn(
            '[animato] Element "%s" uses `scroll` but ScrollTrigger is not registered. ' +
              "Call `gsap.registerPlugin(ScrollTrigger)` before initializing Animato.",
            id,
          );
          scrollTriggerWarned = true;
        }
        return;
      }
      baseVars.scrollTrigger = buildScrollTrigger(element, config.scroll);
    }

    const tween = createTween(element, config.from, config.to, baseVars);
    if (tween) tweens.push(tween);
  }

  function kill(): void {
    for (const t of tweens) t.kill();
    tweens.length = 0;
    scrollInstance?.kill();
    scrollInstance = undefined;
  }

  function refresh(): void {
    kill();
    build();
  }

  build();
  return { id, element, kill, refresh };
}

function createTween(
  element: HTMLElement,
  from: AnimatableProps | undefined,
  to: AnimatableProps | undefined,
  baseVars: gsap.TweenVars,
): gsap.core.Tween | undefined {
  if (from && to) {
    return gsap.fromTo(element, from as gsap.TweenVars, { ...to, ...baseVars });
  }
  if (from) {
    return gsap.from(element, { ...from, ...baseVars });
  }
  if (to) {
    return gsap.to(element, { ...to, ...baseVars });
  }
  return undefined;
}

/**
 * Build a ScrollTrigger config object. Typed loosely because the official
 * ScrollTrigger types only ship when the user imports the plugin, and we keep
 * core dependency-free of it.
 */
function buildScrollTrigger(element: HTMLElement, scroll: ScrollConfig): Record<string, unknown> {
  // Trigger resolution: "self" or an element id (looked up via [data-animato-id])
  let triggerEl: Element | HTMLElement = element;
  if (scroll.trigger && scroll.trigger !== 'self') {
    const found = document.querySelector(`[data-animato-id="${scroll.trigger}"]`);
    if (found) triggerEl = found;
  }

  return {
    trigger: triggerEl,
    start: scroll.start ?? 'top bottom',
    end: scroll.end ?? 'bottom top',
    scrub: scroll.scrub,
    pin: scroll.pin,
    markers: scroll.markers,
  };
}
