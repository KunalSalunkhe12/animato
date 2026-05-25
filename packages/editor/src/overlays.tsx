import { useEffect, useState } from 'react';
import type { RegisteredElement } from '@animato/core';
import { useElementRect } from './hooks.js';

/**
 * A box outline placed over the selected element's bounding rect. Lives in the
 * shadow root so host styles can't affect it; positioned in viewport coords.
 */
export function SelectionOutline({ element }: { element: HTMLElement | null }): JSX.Element | null {
  const rect = useElementRect(element);
  if (!rect) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        border: '2px solid #a78bfa',
        borderRadius: 4,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 0 0 9999px rgba(11,11,16,0.25)',
        pointerEvents: 'none',
        zIndex: 2147483646,
        transition: 'top 60ms linear, left 60ms linear, width 60ms linear, height 60ms linear',
      }}
    />
  );
}

/**
 * Lightweight per-element badge showing its id, anchored to its top-left.
 * Hidden behind a toggle.
 */
export function ElementBadges({
  elements,
  selectedId,
  onSelect,
}: {
  elements: RegisteredElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}): JSX.Element {
  return (
    <>
      {elements.map((el) => (
        <BadgeFor key={el.id} reg={el} selected={el.id === selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}

function BadgeFor({
  reg,
  selected,
  onSelect,
}: {
  reg: RegisteredElement;
  selected: boolean;
  onSelect: (id: string) => void;
}): JSX.Element | null {
  const rect = useElementRect(reg.element);
  if (!rect) return null;
  return (
    <button
      type="button"
      onClick={() => onSelect(reg.id)}
      style={{
        position: 'fixed',
        top: Math.max(0, rect.top - 18),
        left: rect.left,
        background: selected ? '#a78bfa' : 'rgba(167, 139, 250, 0.85)',
        color: '#0b0b10',
        border: 0,
        borderRadius: 4,
        padding: '1px 6px',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        cursor: 'pointer',
        zIndex: 2147483646,
        pointerEvents: 'auto',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }}
    >
      {reg.id}
    </button>
  );
}

/**
 * Picker overlay: when pick mode is on, hovering the document highlights the
 * nearest [data-animato-id] ancestor; clicking selects it.
 */
export function PickerOverlay({
  active,
  onPick,
}: {
  active: boolean;
  onPick: (id: string) => void;
}): JSX.Element | null {
  if (!active) return null;
  return <PickerImpl onPick={onPick} />;
}

function PickerImpl({ onPick }: { onPick: (id: string) => void }): JSX.Element | null {
  const [hoverEl, setHoverEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent): void => {
      const target = e.target as HTMLElement | null;
      const match = target?.closest?.('[data-animato-id]') as HTMLElement | null;
      setHoverEl(match ?? null);
    };
    const onClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement | null;
      const match = target?.closest?.('[data-animato-id]') as HTMLElement | null;
      if (!match) return;
      const id = match.getAttribute('data-animato-id');
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      onPick(id);
    };
    // Capture-phase so we beat the host page's click handlers.
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('click', onClick, true);
    };
  }, [onPick]);

  const rect = useElementRect(hoverEl);

  return (
    <>
      {/* full-viewport hint */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          cursor: 'crosshair',
          zIndex: 2147483645,
          pointerEvents: 'none',
        }}
      />
      {rect && (
        <div
          style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            border: '2px dashed #f472b6',
            borderRadius: 4,
            background: 'rgba(244, 114, 182, 0.08)',
            pointerEvents: 'none',
            zIndex: 2147483646,
          }}
        />
      )}
    </>
  );
}
