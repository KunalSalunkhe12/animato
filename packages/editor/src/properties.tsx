import { gsap } from 'gsap';
import type { AnimatableProps, EditorHost, ElementConfig } from '@animato/core';
import { useElementConfig } from './hooks.js';

interface PropertiesPanelProps {
  host: EditorHost;
  selectedId: string | null;
  element: HTMLElement | null;
  stateTab: 'from' | 'to';
  onStateTabChange: (tab: 'from' | 'to') => void;
}

interface PropDef {
  key: keyof AnimatableProps;
  label: string;
  kind: 'number' | 'color';
  min?: number;
  max?: number;
  step?: number;
}

const NUMERIC_PROPS: PropDef[] = [
  { key: 'x', label: 'x', kind: 'number', min: -500, max: 500, step: 1 },
  { key: 'y', label: 'y', kind: 'number', min: -500, max: 500, step: 1 },
  { key: 'rotation', label: 'rotate', kind: 'number', min: -360, max: 360, step: 1 },
  { key: 'scale', label: 'scale', kind: 'number', min: 0, max: 4, step: 0.05 },
  { key: 'opacity', label: 'opacity', kind: 'number', min: 0, max: 1, step: 0.05 },
];

const COLOR_PROPS: PropDef[] = [
  { key: 'backgroundColor', label: 'bg', kind: 'color' },
  { key: 'color', label: 'color', kind: 'color' },
];

export function PropertiesPanel({
  host,
  selectedId,
  element,
  stateTab,
  onStateTabChange,
}: PropertiesPanelProps): JSX.Element {
  // Subscribe to live config changes for the selected id. Triggers re-render
  // every time the user moves a slider (override write fires notify()).
  const liveConfig = useElementConfig(host, selectedId);

  if (!selectedId) {
    return (
      <div className="props">
        <div className="props__empty">Select an element from the sidebar to edit its animation.</div>
      </div>
    );
  }

  const config = liveConfig ?? {};
  const state: AnimatableProps = (config[stateTab] as AnimatableProps | undefined) ?? {};

  const update = (key: keyof AnimatableProps, value: number | string | undefined): void => {
    const next: AnimatableProps = { ...state };
    if (value === undefined || value === '') {
      delete next[key];
    } else {
      (next as Record<string, unknown>)[key] = value;
    }
    const nextConfig: ElementConfig = { ...config, [stateTab]: next };
    host.setElementConfigOverride(selectedId, nextConfig);
    // Live-preview: snap the actual element to the new "to" state immediately.
    // Editing "from" doesn't visibly change anything until the user replays.
    if (stateTab === 'to' && element) {
      gsap.set(element, next as gsap.TweenVars);
    }
  };

  const reset = (): void => {
    host.setElementConfigOverride(selectedId, undefined);
    if (element) gsap.set(element, { clearProps: 'all' });
  };

  const replay = (): void => {
    if (!element) return;
    const cfg = host.getElementConfig(selectedId);
    if (!cfg) return;
    // Re-run the entrance with current values directly. We don't go through
    // the runtime's applyAnimation here to avoid coupling, and because the
    // editor's job is just to preview — Save (Sprint 3) writes the override
    // back to the JSON file, which is what makes the new values persistent.
    gsap.set(element, { clearProps: 'all' });
    const baseVars: gsap.TweenVars = {
      duration: cfg.duration ?? 0.6,
      ease: cfg.ease ?? 'power2.out',
      delay: cfg.delay,
    };
    if (cfg.from && cfg.to) {
      gsap.fromTo(element, cfg.from as gsap.TweenVars, { ...cfg.to, ...baseVars });
    } else if (cfg.from) {
      gsap.from(element, { ...cfg.from, ...baseVars });
    } else if (cfg.to) {
      gsap.to(element, { ...cfg.to, ...baseVars });
    }
  };

  return (
    <div className="props">
      <div className="tabs" role="tablist">
        <button
          type="button"
          className={`tab${stateTab === 'from' ? ' active' : ''}`}
          onClick={() => onStateTabChange('from')}
        >
          From
        </button>
        <button
          type="button"
          className={`tab${stateTab === 'to' ? ' active' : ''}`}
          onClick={() => onStateTabChange('to')}
        >
          To
        </button>
      </div>

      <div className="section-label">Transform &amp; opacity</div>
      {NUMERIC_PROPS.map((prop) => (
        <NumericField
          key={prop.key}
          def={prop}
          value={state[prop.key] as number | string | undefined}
          onChange={(v) => update(prop.key, v)}
        />
      ))}

      <div className="section-label">Color</div>
      {COLOR_PROPS.map((prop) => (
        <ColorField
          key={prop.key}
          def={prop}
          value={state[prop.key] as string | undefined}
          onChange={(v) => update(prop.key, v)}
        />
      ))}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={replay}>
          ▶ Replay
        </button>
        <button type="button" className="btn" onClick={reset}>
          Reset overrides
        </button>
      </div>
    </div>
  );
}

function NumericField({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: number | string | undefined;
  onChange: (v: number | undefined) => void;
}): JSX.Element {
  const numeric = typeof value === 'number' ? value : value ? Number(value) : undefined;
  const display = numeric ?? 0;
  return (
    <div className="field">
      <label className="field__label">{def.label}</label>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={display}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        type="number"
        step={def.step}
        value={numeric ?? ''}
        placeholder="—"
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? undefined : Number(v));
        }}
      />
    </div>
  );
}

function ColorField({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}): JSX.Element {
  return (
    <div className="field">
      <label className="field__label">{def.label}</label>
      <input
        type="color"
        value={normalizeColor(value)}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        value={value ?? ''}
        placeholder="—"
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </div>
  );
}

function normalizeColor(value: string | undefined): string {
  if (!value) return '#000000';
  if (value.startsWith('#') && (value.length === 7 || value.length === 4)) return value;
  // The native color input only accepts #RRGGBB. For rgb()/hsl() values we
  // fall back to black in the swatch — the text input still shows the actual value.
  return '#000000';
}
