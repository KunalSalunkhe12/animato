# Animato — Business Requirements Document

**Product:** Animato — A library + visual editor that lets developers tune GSAP animations directly on their running site, with config saved as a JSON file in their repo.
**Author:** AlphaTeam
**Date:** 2026-05-24
**Status:** Draft v2 (pivoted from canvas-editor approach)

---

## 1. Executive Summary

### 1.1 Problem
Writing GSAP animations is a slow edit-refresh-tweak loop. Designers can't participate because the artifact is code. Existing visual animation tools (Webflow, Framer, Rive) lock you into their runtime — you can't keep your own React/Vite/Next codebase and just tune the animation visually.

### 1.2 Solution
Animato ships as **two npm packages**:

1. **`@animato/react`** — a `<AnimatoProvider>` + `<Animato>` component pair. Wrap any element to make it animatable.
2. **`@animato/core`** — vanilla-JS runtime. Mark any element with `data-animato-id="hero"` to make it animatable.

In **dev mode**, a floating editor panel overlays the running site. Click any registered element → tune position, scale, rotation, opacity, color via UI → set keyframes and easing on a timeline → configure ScrollTrigger by dragging visual markers on the live page. Edits save to `animato.config.json` in the repo via a Vite/Next build plugin.

In **prod mode**, only the runtime ships (~6 KB gzip target). It reads `animato.config.json` at build time and runs `gsap.timeline()` per registered element. The editor is tree-shaken out.

### 1.3 Why this approach beats a canvas editor
| Concern | Canvas editor | Animato library |
|---|---|---|
| Selector remapping | Required, painful | Eliminated — wrapper is the targeting |
| Designer-in-the-loop | Yes, but on fake elements | Yes, on the real site with real content/responsive behavior |
| Sees real site context | No | Yes |
| Competes with | Webflow, Framer, Rive | (Nothing direct for DOM + GSAP) |
| Effort to v1 | ~12 sprints | ~6 sprints |

### 1.4 Target users
| Persona | Need |
|---|---|
| **React developer** | Animate existing components without the edit-refresh loop |
| **Vanilla JS developer** | Add GSAP to any site without rewriting in a framework |
| **Designer working alongside devs** | Tune motion on the real site without touching code |
| **Agency teams** | Ship animation-heavy landing pages faster |

### 1.5 Out of scope (deferred or excluded)
- **Design-from-scratch / element creation.** Animato animates elements that already exist in the user's code. Adding new elements requires editing source. (Could become "Animato Studio" v2 later.)
- **Backend / cloud sync / accounts** — v1 is pure npm. Cloud sync becomes a Pro feature post-v1.
- **Vue, Svelte** — deferred to post-v1 once React + vanilla pattern is proven.
- **Canvas/WebGL animations** (Three.js, Pixi).
- **Real-time multi-user editing.**

### 1.6 Success metrics (12 months post-launch)
- 5,000 GitHub stars
- 2,000 weekly npm downloads
- 50 production sites publicly using Animato (tracked via public showcase)
- 1,000 Discord/community members
- Path-to-monetize signal: 200+ users on Pro waitlist (cloud sync, team configs, AI assist)

---

## 2. Architecture Overview

### 2.1 Packages
```
@animato/core         — vanilla runtime + editor (framework-agnostic core)
@animato/react        — React bindings (<AnimatoProvider>, <Animato>)
@animato/vite-plugin  — dev-time config persistence + prod-time tree-shaking
@animato/next-plugin  — same for Next.js (App + Pages router)
```

### 2.2 Runtime API (React)
```jsx
import { AnimatoProvider, Animato } from '@animato/react';
import animatoConfig from './animato.config.json';

<AnimatoProvider config={animatoConfig} editor={import.meta.env.DEV}>
  <Animato id="hero-title">
    <h1>Welcome</h1>
  </Animato>

  <Animato id="hero-cta" scroll={{ pin: true, scrub: true }}>
    <Button>Get started</Button>
  </Animato>
</AnimatoProvider>
```

### 2.3 Runtime API (vanilla)
```html
<script type="module">
  import { initAnimato } from '@animato/core';
  import config from './animato.config.json' assert { type: 'json' };
  initAnimato({ config, editor: false });
</script>

<h1 data-animato-id="hero-title">Welcome</h1>
<button data-animato-id="hero-cta">Get started</button>
```

### 2.4 Config file (committed to repo)
```json
{
  "version": 1,
  "elements": {
    "hero-title": {
      "from": { "opacity": 0, "y": 30 },
      "to": { "opacity": 1, "y": 0 },
      "duration": 0.8,
      "ease": "power3.out"
    },
    "hero-cta": {
      "scroll": { "trigger": "self", "start": "top 80%", "end": "top 20%", "scrub": true, "pin": true },
      "to": { "scale": 1.1, "rotation": 5 }
    }
  }
}
```

### 2.5 Editor architecture
- Loads only when `editor={true}` (typically `import.meta.env.DEV`)
- Dynamic import — zero impact on prod bundle
- Renders into a portal at `<body>` end; reset CSS via shadow DOM to avoid host-site styles bleeding in
- Communicates with build plugin over WebSocket (dev-server-only endpoint) to write `animato.config.json`
- Fallback when no plugin detected: writes to `localStorage` + "Download config" button

---

## 3. Functional Requirements

### 3.1 Wrapper Component (React)
| ID | Requirement | Priority |
|---|---|---|
| F-WR-01 | `<Animato id="..." />` accepts a single child, wraps in a div by default | P0 |
| F-WR-02 | `<Animato as="fragment">` clones child + attaches ref (no wrapper div) | P0 |
| F-WR-03 | `id` prop required; dev warning if duplicate ids exist on the page | P0 |
| F-WR-04 | `scroll` prop for ScrollTrigger config (overrides config file) | P0 |
| F-WR-05 | `disabled` prop to skip animation conditionally | P0 |
| F-WR-06 | Forward ref to underlying DOM node | P0 |
| F-WR-07 | Uses `@gsap/react` `useGSAP()` hook internally for proper cleanup | P0 |
| F-WR-08 | Must be a Client Component (`'use client'`); documented constraint for RSC | P0 |
| F-WR-09 | `key` re-keying triggers animation reset (entrance replays) | P1 |

### 3.2 Vanilla / Data-Attribute API
| ID | Requirement | Priority |
|---|---|---|
| F-VA-01 | `data-animato-id="..."` opts an element into the runtime | P0 |
| F-VA-02 | `initAnimato({ config, editor })` boots runtime | P0 |
| F-VA-03 | MutationObserver picks up dynamically added elements | P0 |
| F-VA-04 | Optional `data-animato-scope="..."` for grouped elements | P1 |
| F-VA-05 | Works without any build tooling (CDN-friendly UMD build) | P1 |

### 3.3 Editor — Element Discovery & Selection
| ID | Requirement | Priority |
|---|---|---|
| F-ED-01 | Floating editor panel opens on hotkey (Cmd/Ctrl+Shift+A) | P0 |
| F-ED-02 | Sidebar lists all registered Animato elements on the page | P0 |
| F-ED-03 | Click any list item to select; element highlights on the live page | P0 |
| F-ED-04 | Click directly on a page element (with editor in "pick" mode) to select | P0 |
| F-ED-05 | Search/filter elements by id | P1 |
| F-ED-06 | Element badge overlay (small id label) toggle | P1 |

### 3.4 Editor — Properties & Initial State
| ID | Requirement | Priority |
|---|---|---|
| F-EP-01 | Edit transform: x, y, rotation, scale, skew | P0 |
| F-EP-02 | Edit opacity, blur, color (fill, background) | P0 |
| F-EP-03 | Edit width, height (numeric + unit) | P0 |
| F-EP-04 | Edit transform-origin via draggable pivot on the live element | P0 |
| F-EP-05 | "From" / "To" state tabs (entrance animation = animate from "from" to actual) | P0 |
| F-EP-06 | Live preview — edits apply to the element immediately | P0 |
| F-EP-07 | Reset to defaults | P0 |
| F-EP-08 | CSS custom property editing | P2 |

### 3.5 Editor — Timeline & Keyframes
| ID | Requirement | Priority |
|---|---|---|
| F-TL-01 | Timeline panel per selected element, showing keyframes per property | P0 |
| F-TL-02 | Add keyframe at playhead; drag to retime; delete via key | P0 |
| F-TL-03 | Auto-keyframe (record) mode: editing properties inserts keyframes | P0 |
| F-TL-04 | Per-keyframe easing (presets + visual bezier editor) | P0 |
| F-TL-05 | Easing presets: power1–4, sine, expo, back, elastic, bounce, steps | P0 |
| F-TL-06 | Scrub timeline → element animates live on the page | P0 |
| F-TL-07 | Play / pause / loop / yoyo / speed controls | P0 |
| F-TL-08 | Stagger config across multiple selected elements | P1 |
| F-TL-09 | Timeline labels / markers | P1 |
| F-TL-10 | Multi-element sequencing in a shared timeline (scenes) | P1 |
| F-TL-11 | Copy / paste keyframes across elements | P1 |

### 3.6 Editor — ScrollTrigger Visual UX
| ID | Requirement | Priority |
|---|---|---|
| F-ST-01 | Toggle ScrollTrigger on for selected element | P0 |
| F-ST-02 | **Live overlay markers** — start/end shown as draggable horizontal rules on the actual page (huge UX win over canvas editor) | P0 |
| F-ST-03 | Pin toggle | P0 |
| F-ST-04 | Scrub toggle (vs. trigger-once) | P0 |
| F-ST-05 | Trigger target selector (self vs. another Animato id) | P0 |
| F-ST-06 | Snap-to-section config | P1 |
| F-ST-07 | Horizontal scroll mode | P2 |
| F-ST-08 | Parallax preset shortcuts | P1 |

### 3.7 Build Plugins (Vite + Next)
| ID | Requirement | Priority |
|---|---|---|
| F-BP-01 | Vite plugin reads `animato.config.json` from project root | P0 |
| F-BP-02 | Vite plugin exposes dev-server WS endpoint for editor → file writes | P0 |
| F-BP-03 | In prod build, replaces `editor` flag with `false`, tree-shakes editor code | P0 |
| F-BP-04 | Validates config schema at build time; fails build on malformed JSON | P0 |
| F-BP-05 | Next.js plugin (App + Pages router) with same behavior | P0 |
| F-BP-06 | Plugin warns on unused ids in config (config has `hero-x` but no element uses it) | P1 |
| F-BP-07 | Plugin warns on missing ids (element uses `data-animato-id` not in config) | P1 |

### 3.8 Editor — Config Persistence
| ID | Requirement | Priority |
|---|---|---|
| F-CP-01 | When build plugin detected, save writes directly to `animato.config.json` | P0 |
| F-CP-02 | When no plugin, save writes to `localStorage` + UI shows "Download config" button | P0 |
| F-CP-03 | "Eject to code" — generate a standalone GSAP `.ts/.js` file from current config | P1 |
| F-CP-04 | Versioned schema; auto-migrate on load | P0 |

### 3.9 Editor — Developer Ergonomics
| ID | Requirement | Priority |
|---|---|---|
| F-DV-01 | Floating panel is collapsible, draggable, resizable | P0 |
| F-DV-02 | Editor in shadow DOM — host site styles can't break the editor UI | P0 |
| F-DV-03 | Editor never affects the host page's layout (uses `position: fixed`, overlays only) | P0 |
| F-DV-04 | Undo / redo within the editor (per-session history) | P0 |
| F-DV-05 | Keyboard-driven: space = play/pause, K = keyframe at playhead, V = pick mode | P1 |
| F-DV-06 | `prefers-reduced-motion` simulation toggle in editor | P1 |
| F-DV-07 | Performance HUD (FPS, jank warnings) toggle | P2 |
| F-DV-08 | Multi-viewport preview (resize the host iframe wrapper to common breakpoints) | P1 |

### 3.10 Presets & Templates
| ID | Requirement | Priority |
|---|---|---|
| F-PT-01 | Built-in preset library (fade-in-up, slide-in-left, scale-in, magnetic hover, etc.) | P0 |
| F-PT-02 | Apply preset → preset's keyframes populate timeline (editable after) | P0 |
| F-PT-03 | Scroll-driven presets (parallax, pinned-reveal, horizontal-scroll-section) | P1 |
| F-PT-04 | User-saved custom presets (local) | P2 |
| F-PT-05 | Shareable presets via gist-like URL (post-v1) | P3 |

### 3.11 Documentation & DX
| ID | Requirement | Priority |
|---|---|---|
| F-DX-01 | Docs site with copy-pasteable examples per framework | P0 |
| F-DX-02 | Playground / "try in browser" with a StackBlitz template | P0 |
| F-DX-03 | TypeScript types for config schema (autocomplete in IDEs editing the JSON) | P0 |
| F-DX-04 | Codemod / CLI: `npx anima init` scaffolds plugin + provider + sample config | P1 |
| F-DX-05 | Error messages explain how to fix (e.g., "id 'hero' not unique — found in App.tsx:12 and Hero.tsx:8") | P1 |

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Prod bundle size** | `@animato/react` runtime ≤ 6 KB gzip (excluding GSAP itself). Editor code 100% tree-shaken from prod. |
| **Performance** | 60fps in editor with 50 registered elements + open timeline. |
| **Framework support** | React 18+, Next.js 13+ (App + Pages), Vite 4+. Vanilla via UMD on any modern browser. |
| **Browser support** | Latest 2 versions of Chrome, Edge, Firefox, Safari. |
| **SSR / RSC** | `<Animato>` is a Client Component. Documented; example shows pattern for animating server-rendered children. |
| **Type safety** | First-class TypeScript. Config validated at build time via JSON Schema → generated types. |
| **A11y** | `prefers-reduced-motion` honored automatically by runtime (toggle in config to opt out). Editor UI itself meets WCAG 2.1 AA. |
| **Licensing** | MIT for `@animato/react`, `@animato/core`, build plugins. Pro features (post-v1) gated by license key. |

---

## 5. Risks & Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| Wrapper div breaks user layouts (flex/grid edge cases) | High | Ship `as="fragment"` clone-ref mode from day 1; document layout impact |
| Build plugin complexity (Vite + Next have different conventions) | High | Spike both in Sprint 1; if Next plugin is too gnarly, defer to Sprint 5+ |
| Editing dev-only — once shipped, designer can't tune anymore | Medium | Post-v1: optional cloud-hosted editor that reads/writes against deployed sites with auth |
| Element identification fragility (lists, repeated components) | Medium | Auto-suffix scheme + lint rule via plugin |
| ScrollTrigger overlay markers conflict with site's own fixed elements | Medium | Editor markers use `z-index: 2147483647` + shadow DOM where possible |
| `@gsap/react` peer dep version drift | Low | Pin minimum, test against latest GSAP each release |
| Competitor (Theatre.js, Motion One, etc.) ships similar | Medium | Move fast; differentiate on GSAP-specific output quality and ScrollTrigger UX |

| Open question | Resolve by |
|---|---|
| Does the editor live in the host page or in a sibling iframe? (iframe is safer for style isolation; host is simpler.) Recommend: host page + shadow DOM. | Sprint 1 spike |
| How does the editor work with React Strict Mode double-mount? | Sprint 2 |
| Should `<Animato>` support passing a function-child for full control? | Sprint 3 |
| Naming: `Animato` is taken by an existing Figma-to-React tool. Need a different name. | Before public launch |

---

## 6. Pricing (post-v1)

The npm packages and editor are **free and MIT-licensed forever**. Future monetization:
- **Pro ($15/mo per user):** cloud config sync across devices, presets library, AI assist ("describe this animation"), priority support
- **Team ($50/mo per team):** shared preset libraries, role-based access, audit log

v1 ships with zero billing infrastructure — just an "interested in Pro?" waitlist form.
