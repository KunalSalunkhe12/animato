/**
 * Animatable CSS / transform properties supported in v1.
 * Mirrors GSAP's most-used properties.
 */
export interface AnimatableProps {
  x?: number | string;
  y?: number | string;
  rotation?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  opacity?: number;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  color?: string;
  borderRadius?: number | string;
  filter?: string;
  transformOrigin?: string;
}

/**
 * ScrollTrigger configuration. Mirrors a subset of GSAP's ScrollTrigger API
 * that we'll expose in the editor.
 */
export interface ScrollConfig {
  /** Element id or "self" — what scroll position to track. Defaults to "self". */
  trigger?: string;
  /** GSAP start string, e.g. "top 80%". Defaults to "top bottom". */
  start?: string;
  /** GSAP end string, e.g. "bottom top". Defaults to "bottom top". */
  end?: string;
  /** Tie progress to scroll position. Boolean or smoothing factor. */
  scrub?: boolean | number;
  /** Pin the element while scrolling through the range. */
  pin?: boolean;
  /** Show GSAP markers (dev only). */
  markers?: boolean;
}

/**
 * Configuration for one registered element.
 * - If `from` is set, animation runs `gsap.from(from)` → element animates from `from` to actual styles.
 * - If `to` is set, animation runs `gsap.to(to)` → element animates from actual styles to `to`.
 * - If both, runs `gsap.fromTo(from, to)`.
 */
export interface ElementConfig {
  /** Starting state (entrance animation). */
  from?: AnimatableProps;
  /** Ending state. */
  to?: AnimatableProps;
  /** Duration in seconds. Defaults to 0.6. */
  duration?: number;
  /** GSAP easing string, e.g. "power2.out", "elastic.out(1, 0.5)". Defaults to "power2.out". */
  ease?: string;
  /** Delay in seconds before animation starts. */
  delay?: number;
  /** Repeat count. -1 for infinite. */
  repeat?: number;
  /** Yoyo (reverse on repeat). */
  yoyo?: boolean;
  /** Attach a ScrollTrigger. */
  scroll?: ScrollConfig;
  /** Disable this animation entirely. */
  disabled?: boolean;
}

/**
 * The full Animato config — committed to the repo as `animato.config.json`.
 */
export interface AnimatoConfig {
  version: 1;
  elements: Record<string, ElementConfig>;
}

/**
 * Options for `initAnimato` (vanilla runtime).
 */
export interface InitOptions {
  config: AnimatoConfig;
  /** Load the editor UI. Defaults to false. */
  editor?: boolean;
  /** Respect prefers-reduced-motion (skip animations). Defaults to true. */
  respectReducedMotion?: boolean;
}

/**
 * Handle returned by registering an element — used to update or kill the animation later.
 */
export interface AnimationHandle {
  id: string;
  element: HTMLElement;
  /** Kill the underlying GSAP tween / ScrollTrigger. */
  kill: () => void;
  /** Re-create the animation (e.g. after config change). */
  refresh: () => void;
}

/**
 * A registered Animato element — exposed by the provider to the editor.
 */
export interface RegisteredElement {
  id: string;
  element: HTMLElement;
}

/**
 * Interface the React provider exposes to the editor.
 * Decouples @animato/editor from @animato/react (no circular import).
 */
export interface EditorHost {
  config: AnimatoConfig;
  getElementConfig: (id: string) => ElementConfig | undefined;
  setElementConfigOverride: (id: string, override: ElementConfig | undefined) => void;
  getRegistered: () => RegisteredElement[];
  subscribe: (listener: () => void) => () => void;
}
