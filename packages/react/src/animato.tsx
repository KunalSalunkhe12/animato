'use client';

import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useGSAP } from '@gsap/react';
import { applyAnimation, type ElementConfig, type ScrollConfig } from '@animato/core';
import { useAnimatoContext } from './provider.js';

export interface AnimatoProps {
  /** Unique id for this element. Must match an entry in animato.config.json. */
  id: string;
  /**
   * Render mode:
   *   - "div" (default): wraps `children` in a `<div>` with the ref attached.
   *   - "fragment": clones the single child and attaches the ref directly (no wrapper).
   */
  as?: 'div' | 'fragment';
  /** Inline override for ScrollTrigger config. Merged on top of config-file scroll. */
  scroll?: ScrollConfig;
  /** Skip animation conditionally. */
  disabled?: boolean;
  /** Extra className applied when wrapping in a div. */
  className?: string;
  /** Extra inline style applied when wrapping in a div. */
  style?: React.CSSProperties;
  children: ReactNode;
}

/**
 * `<Animato id="hero-title">` — wraps an element and runs the animation
 * defined for `id` in `animato.config.json`.
 */
export const Animato = forwardRef<HTMLElement, AnimatoProps>(function Animato(
  props,
  forwardedRef,
): JSX.Element {
  const { id, as = 'div', scroll, disabled, className, style, children } = props;
  const ctx = useAnimatoContext();
  const innerRef = useRef<HTMLElement | null>(null);

  // Read directly from the file config. We intentionally do NOT subscribe to
  // overrides here — the editor manages overrides for live preview via
  // `gsap.set()` and its own Replay button. If we re-ran the animation on
  // every override write, dragging a slider would re-trigger the entrance.
  const fileConfig = ctx.config.elements[id];
  const elementConfig: ElementConfig | undefined = (() => {
    if (!fileConfig && !scroll && !disabled) return undefined;
    return {
      ...fileConfig,
      ...(scroll ? { scroll: { ...fileConfig?.scroll, ...scroll } } : {}),
      ...(disabled ? { disabled: true } : {}),
    };
  })();

  // Dev-only: register id for duplicate detection.
  useEffect(() => {
    ctx._bumpId(id);
    return () => ctx._dropId(id);
  }, [ctx, id]);

  // Register the actual DOM node so the editor can list / highlight it.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.setAttribute('data-animato-id', id);
    ctx._register(id, el);
    return () => {
      ctx._unregister(id, el);
    };
  }, [ctx, id]);

  // Re-run when config or overrides change. useGSAP cleans up on unmount.
  useGSAP(
    () => {
      const el = innerRef.current;
      if (!el || !elementConfig) return;
      const handle = applyAnimation(id, el, elementConfig);
      return () => handle.kill();
    },
    { dependencies: [id, elementConfig], scope: innerRef },
  );

  // Warn (dev only) if no config exists for this id.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!ctx.config.elements[id] && !scroll) {
      console.warn(
        '[animato] No config entry for id "%s". Add it to animato.config.json or open the editor.',
        id,
      );
    }
  }, [id, ctx.config, scroll]);

  const setRef = (node: HTMLElement | null): void => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  if (as === 'fragment') {
    if (!isValidElement(children)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[animato] <Animato as="fragment" id="%s"> requires a single valid React element as a child.',
          id,
        );
      }
      return <>{children}</>;
    }
    const child = children as ReactElement<{ ref?: Ref<HTMLElement> }>;
    return cloneElement(child, { ref: setRef });
  }

  return (
    <div ref={setRef as Ref<HTMLDivElement>} className={className} style={style}>
      {children}
    </div>
  );
});
