# Animato

Visual editor for GSAP animations. Tune animations on your running site, save config as JSON in your repo, ship clean code.

> **Status:** Sprint 2 of 6 — editor shell + live property editing. Timeline + JSON persistence land Sprint 3.

## What's working in Sprint 2

**From Sprint 1 (runtime foundation):**
- `<AnimatoProvider>` + `<Animato>` React components
- Runtime executes animations from `animato.config.json` via GSAP
- Two render modes: wrapping `<div>` or `as="fragment"` clone-ref
- Honors `prefers-reduced-motion`
- Vanilla `initAnimato({ config })` with `data-animato-id="..."`
- Dev warnings for duplicate ids and missing config entries

**New in Sprint 2 (editor):**
- Floating editor panel rendered in shadow DOM (host page styles can't leak in/out)
- **Cmd/Ctrl+Shift+E** to toggle the editor
- Draggable + collapsible panel, position persisted to localStorage
- Sidebar lists every `<Animato>` element on the page, click to select
- Selection outline overlay on the live page
- Pick mode: click any element on the page to select it (button: ⛶)
- Element badges overlay: small id labels per element (button: `#`)
- Properties panel: sliders for `x`, `y`, `rotation`, `scale`, `opacity`; color inputs for `backgroundColor` and `color`
- **From / To** state tabs
- Live preview — slider drags apply via `gsap.set()` immediately
- ▶ Replay button re-runs the entrance with current values
- Reset overrides button (clears editor's in-memory edits)
- First-load toast hint so users discover the hotkey
- Editor code is its own lazy chunk (15 KB / 4.9 KB gzipped) — never loads when `editor={false}`

## What's NOT yet working

- **JSON persistence** — edits live in memory; Sprint 3 adds Vite plugin that writes to `animato.config.json`
- **Timeline / keyframes** — single from/to per element only; multi-keyframe timeline lands Sprint 3
- **Undo / redo** — Sprint 3 (paired with config-state machine)
- **ScrollTrigger UI** — Sprint 4 (runtime already supports it via JSON)
- **Resizable panel** — deferred to polish sprint
- **Presets, docs, Next.js plugin** — Sprints 5–6

## Repo structure

```
animato/
├── packages/
│   ├── core/           @animato/core    — framework-agnostic runtime + types
│   ├── react/          @animato/react   — <AnimatoProvider>, <Animato>
│   └── editor/         @animato/editor  — shadow-DOM editor UI (lazy-loaded)
├── apps/
│   └── playground/     Vite + React demo (Sprint 1 + 2 acceptance test)
├── BRD.md              Business requirements
├── SPRINT_PLAN.md      6-sprint plan to v1 GA
└── README.md           You are here
```

## Quick start (try Sprint 1 yourself)

Requires **Node 20+** and **npm 9+** (already installed if you have Node ≥ 20).

```bash
# Install all workspace deps
npm install

# Build the libraries
npm run build

# Run the playground (Vite, port 5173)
npm run dev -w @animato/playground
```

Open http://localhost:5173 — you should see "Animato" fade in from below, a subtitle and CTA stagger in after it, and a diamond rotating forever. Open `apps/playground/animato.config.json`, change a value (try `"ease": "elastic.out(1, 0.3)"` on `hero-title`), refresh — animation updates.

## Architecture (one page)

```
                         ┌──────────────────────────┐
                         │   animato.config.json    │  committed to repo
                         │   { elements: { ... } }  │
                         └────────────┬─────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │                                       │
        ┌─────────▼─────────┐                  ┌──────────▼──────────┐
        │  @animato/react   │                  │   @animato/core     │
        │  (React bindings) │  depends on ──►  │  (vanilla runtime)  │
        └─────────┬─────────┘                  └──────────┬──────────┘
                  │                                       │
                  │  uses                          uses   │
                  │                                       │
                  └────────────────┬──────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │      GSAP       │  peer dep
                          └─────────────────┘
```

## API surface (Sprint 1)

### React

```tsx
import { AnimatoProvider, Animato } from '@animato/react';
import animatoConfig from './animato.config.json';

export function App() {
  return (
    <AnimatoProvider config={animatoConfig}>
      <Animato id="hero-title" as="fragment">
        <h1>Welcome</h1>
      </Animato>

      <Animato id="cta">
        <button>Get started</button>
      </Animato>
    </AnimatoProvider>
  );
}
```

### Vanilla / data-attributes

```ts
import { initAnimato } from '@animato/core';
import config from './animato.config.json';

initAnimato({ config });
```

```html
<h1 data-animato-id="hero-title">Welcome</h1>
<button data-animato-id="cta">Get started</button>
```

### Config schema

See `packages/core/src/types.ts`. Minimal example:

```json
{
  "version": 1,
  "elements": {
    "hero-title": {
      "from": { "opacity": 0, "y": 30 },
      "to":   { "opacity": 1, "y": 0  },
      "duration": 0.9,
      "ease": "power3.out"
    }
  }
}
```

## Roadmap

| Sprint | Milestone | What ships |
|---|---|---|
| 1 ✅ | M0 Architecture proven | Runtime, React bindings, playground |
| 2 ✅ | — | Editor shell + properties panel (live editing in shadow DOM overlay) |
| 3 | M1 Closed alpha | Timeline + Vite plugin + JSON persistence to repo |
| 4 | — | ScrollTrigger visual UX + vanilla data-attribute API |
| 5 | M2 Public beta | Next.js plugin + presets library |
| 6 | M3 v1 GA | Polish, docs site, public launch |

See `SPRINT_PLAN.md` for the full breakdown.

## License

MIT
