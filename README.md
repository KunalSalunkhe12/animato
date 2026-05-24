# Animato

Visual editor for GSAP animations. Tune animations on your running site, save config as JSON in your repo, ship clean code.

> **Status:** Sprint 1 of 6 — runtime foundation. Editor lands in Sprint 2.

## What's working in Sprint 1

- `<AnimatoProvider>` + `<Animato>` React components
- Runtime executes animations from `animato.config.json` via GSAP
- Two render modes: wrapping `<div>` or `as="fragment"` clone-ref
- Honors `prefers-reduced-motion`
- Vanilla `initAnimato({ config })` with `data-animato-id="..."` (no editor wiring yet)
- Dev warnings for duplicate ids and missing config entries

## What's NOT yet working

- The visual editor (Sprint 2)
- Vite/Next build plugins for live JSON persistence (Sprint 3)
- ScrollTrigger UI (Sprint 4 — but the runtime already supports it if you write `scroll` in JSON)
- Presets, docs site, Next.js (Sprints 5–6)

## Repo structure

```
animato/
├── packages/
│   ├── core/           @animato/core — framework-agnostic runtime
│   └── react/          @animato/react — <AnimatoProvider>, <Animato>
├── apps/
│   └── playground/     Vite + React demo (Sprint 1 acceptance test)
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
| 2 | — | Editor shell + properties panel (live editing in shadow DOM overlay) |
| 3 | M1 Closed alpha | Timeline + Vite plugin + JSON persistence to repo |
| 4 | — | ScrollTrigger visual UX + vanilla data-attribute API |
| 5 | M2 Public beta | Next.js plugin + presets library |
| 6 | M3 v1 GA | Polish, docs site, public launch |

See `SPRINT_PLAN.md` for the full breakdown.

## License

MIT
