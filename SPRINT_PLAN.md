# Animato — Sprint Plan

**Companion to:** `BRD.md` (v2 — wrapper-library approach)
**Cadence:** 2-week sprints
**Team assumed:** 2 frontend, 1 designer (part-time), 1 PM (part-time)
**Total to v1 GA:** 6 sprints (~3 months)
**Post-v1 roadmap:** Sprints 7–12 (Pro features, AI, more frameworks)

> Solo dev? Multiply by ~2.5× and cut all P2/P3 work.

---

## Release Milestones

| Milestone | Sprint | What's shippable |
|---|---|---|
| **M0 — Architecture proven** | 1 | `<Animato>` wraps an element, runs a hardcoded animation |
| **M1 — Closed alpha** | 3 | Editor edits live, saves to JSON file via Vite plugin, 10 testers |
| **M2 — Public beta** | 5 | ScrollTrigger working, Next plugin, vanilla API, 100+ users |
| **M3 — v1 GA** | 6 | Docs site, presets, polish, public launch |
| **M4 — Pro launch** | 10 | Cloud sync, AI assist, premium presets |
| **M5 — Ecosystem** | 12 | Vue/Svelte adapters, VS Code extension |

---

## Pre-Sprint 0 — Discovery (3 days)

- [x] Name chosen: **Animato** (verify npm + .com availability before public launch)
- [ ] Stack confirm: monorepo (npm workspaces + Turborepo), TypeScript strict, Vitest, Playwright for editor E2E, Biome for lint/format
- [ ] Repo: GitHub public from day 1 ("build in public"), MIT license, contribution guide stub
- [ ] Spike: prove editor-in-shadow-DOM works without leaking host styles (1 day)
- [ ] Spike: prove Vite dev-server WS endpoint can write to project files cleanly (1 day)
- [ ] Spike: prove `as="fragment"` clone-ref mode works for entrance animations (1 day)
- [ ] Read Theatre.js studio source — what to steal, what to avoid
- [ ] Interview 5 React devs already using GSAP — what would make them switch?

**Exit:** name chosen, three spikes green, no blocker uncovered.

---

## Sprint 1 — Runtime Foundation (M0)
**Goal:** `<Animato>` wraps a div, runs a hardcoded GSAP animation. No editor yet.

### Packages
- [ ] Monorepo scaffold: `@animato/core`, `@animato/react`, `@animato/vite-plugin`, `apps/playground`, `apps/docs`
- [ ] Build setup: tsup for libs, Vite for playground/docs
- [ ] CI: typecheck, test, build matrix per package

### Runtime
- [ ] `<AnimatoProvider config={...}>` — reads config, exposes context
- [ ] `<Animato id="..." />` wrapper component
  - [ ] Wrapping mode (adds `<div>`)
  - [ ] `as="fragment"` clone-ref mode
  - [ ] Forwards ref
  - [ ] Uses `useGSAP()` from `@gsap/react`
- [ ] Runtime: given a config and a registered element, run `gsap.to()` / `gsap.from()`
- [ ] Dev warning for duplicate ids
- [ ] Honor `prefers-reduced-motion`

### Playground app
- [ ] Sample page with 3 `<Animato>` instances, hand-written `animato.config.json`
- [ ] Animations run on page load

**Demo:** open playground → 3 elements animate per the JSON config. Change JSON → reload → animation changes.

---

## Sprint 2 — Editor Shell + Properties Panel
**Goal:** Open the editor, pick an element on the page, edit its properties — see live changes.

- [ ] Editor entry point: dynamic-imported when `editor={true}`
- [ ] Floating panel in shadow DOM, draggable + resizable + collapsible
- [ ] Hotkey to toggle (Cmd/Ctrl+Shift+A)
- [ ] Sidebar: list of all registered Animato elements (auto-discovered from `<AnimatoProvider>` registry)
- [ ] Click element in list → highlight on page (outline overlay)
- [ ] "Pick" mode: click element on page → select it
- [ ] Properties panel: edit transform (x, y, rotation, scale), opacity, color
- [ ] Live preview — edits update the actual DOM element
- [ ] Editor undo/redo within session
- [ ] "From / To" state tabs
- [ ] Element badge overlay toggle (small id label next to each element)

**Demo:** open playground, hit hotkey, pick the hero text, change its scale and opacity, see it update live.

**Risk gate:** if shadow DOM doesn't isolate cleanly across test sites, switch to iframe editor before Sprint 3.

---

## Sprint 3 — Timeline + Vite Plugin + JSON Persistence (M1 — Closed Alpha)
**Goal:** Real animations via timeline. Saves persist to `animato.config.json` in the repo.

### Editor — timeline
- [ ] Timeline panel for selected element (per-property tracks)
- [ ] Add / drag / delete keyframes
- [ ] Auto-keyframe (record) mode
- [ ] Easing presets per keyframe pair (dropdown)
- [ ] Visual bezier easing editor (drag curve handles, live preview)
- [ ] Play / pause / loop / scrub
- [ ] Speed control (0.1×–4×)

### Vite plugin
- [ ] `@animato/vite-plugin`: reads `animato.config.json`, exposes typed import
- [ ] Dev-only WebSocket endpoint: editor → plugin → write file
- [ ] Pretty-prints JSON, atomic writes (temp file + rename)
- [ ] Prod build: replace `editor` flag with `false`, verify editor code is tree-shaken (size assertion in CI)
- [ ] Config schema validation at build time

### Editor — fallback path
- [ ] Detect when no plugin present → save to localStorage + show "Download config" button

### Alpha
- [ ] Recruit 10 alpha testers (GSAP power users from Twitter, Discord)
- [ ] Telemetry stub (anonymous opt-in usage events via Plausible or self-hosted)

**Demo:** open project, build a 4-keyframe entrance with bounce easing, save → see the JSON file updated in the repo, commit it, reload — animation runs from the saved config.

**Decision gate:** alpha feedback determines whether to push on or rework editor UX. If <7/10 testers say "I'd use this in real work," slip a polish sprint before Sprint 4.

---

## Sprint 4 — ScrollTrigger + Vanilla API
**Goal:** Cover the hardest GSAP use case + open up the non-React audience.

### ScrollTrigger in editor
- [ ] Toggle ScrollTrigger on per element
- [ ] **Live overlay markers** on the page — start/end as draggable horizontal rules over the actual scrollable content
- [ ] Pin toggle
- [ ] Scrub vs. trigger-once
- [ ] Trigger target selector (self vs. another Animato id)
- [ ] Live preview: editor scrolls the page to test, markers update
- [ ] Runtime: emit `ScrollTrigger.create()` per config

### Vanilla / data-attribute API
- [ ] `@animato/core` exports `initAnimato({ config, editor })`
- [ ] `data-animato-id` attribute discovery
- [ ] MutationObserver picks up dynamically added elements
- [ ] UMD build for CDN use
- [ ] Editor works against vanilla-marked elements identically

### Polish
- [ ] Stagger across multi-selected elements
- [ ] Timeline labels / markers
- [ ] `prefers-reduced-motion` simulation toggle in editor

**Demo:** Build a pinned hero section that fades + scales as you scroll. Build a vanilla HTML demo with the same animation. Both look identical.

---

## Sprint 5 — Next.js Plugin + Presets + Beta (M2 — Public Beta)
**Goal:** Cover Next.js (App + Pages router) and ship for real.

### Next.js plugin
- [ ] `@animato/next-plugin` wraps `next.config.js`
- [ ] App Router compatibility (RSC boundaries documented)
- [ ] Pages Router compatibility
- [ ] Same file-write WS endpoint as Vite plugin
- [ ] Sample Next.js starter in repo

### Presets library
- [ ] 20 built-in presets: fade-in-up, slide-in-left/right/up/down, scale-in, blur-in, magnetic-hover, parallax-slow/med/fast, pinned-reveal, horizontal-scroll-section, etc.
- [ ] One-click apply in editor → populates keyframes (editable)
- [ ] Preset preview thumbnails

### Beta launch prep
- [ ] Docs site v1 (`apps/docs`): install, quickstart, API reference, recipes, ScrollTrigger guide, RSC patterns
- [ ] StackBlitz playground template ("Try Animato in 30 seconds")
- [ ] Public showcase: 3 demo sites built with Animato
- [ ] "Eject to code" — generate a standalone GSAP file from config
- [ ] Public beta announce: Show HN, GSAP forum, React Status newsletter, Twitter

**Demo:** open a brand-new Next.js project, `npm install`, add provider, animate something visually in 60 seconds.

---

## Sprint 6 — v1 GA Hardening (M3)
**Goal:** Ship.

- [ ] Bug bash week (whole team)
- [ ] Browser QA matrix (Chrome, Edge, Firefox, Safari × 2 versions)
- [ ] Bundle size audit — confirm runtime ≤ 6 KB gzip, editor 100% tree-shaken
- [ ] Perf benchmark: editor stays at 60fps with 50 registered elements
- [ ] Codemod / CLI: `npx <product> init` scaffolds plugin + provider + sample config
- [ ] Improved error messages (id collisions point to file:line via Vite plugin)
- [ ] Docs site polish: search, dark mode, copy-paste-friendly examples
- [ ] Tutorial videos: "Your first Animato animation" (3 min), "Building a scroll-driven hero" (8 min)
- [ ] Public launch: Product Hunt, Hacker News, Reddit (r/reactjs, r/javascript), GSAP forum, React Status, JS Weekly, dev Twitter
- [ ] "Interested in Pro features?" waitlist form on docs site

**v1 done.**

---

# Post-v1 Roadmap (Sprints 7–12)

## Sprint 7 — Polish from beta feedback
Reserve 80% capacity for whatever users yell about. Pre-planned 20%:
- [ ] Command palette (Cmd+K) in editor
- [ ] Multi-viewport preview (resize host frame to common breakpoints)
- [ ] Editor keyboard shortcut audit + cheatsheet

## Sprint 8–9 — Pro foundation
- [ ] Account system (auth via Clerk/Supabase)
- [ ] Cloud config sync (multi-device, with conflict resolution)
- [ ] Stripe billing, Free / Pro tiers
- [ ] License-key flow for self-hosted setups
- [ ] Custom user presets (saved to cloud)

## Sprint 10 — AI assist (M4 — Pro launch)
- [ ] "Describe an animation" → generated keyframes (Claude/GPT-4 backend)
- [ ] Easing suggestion by intent ("snappy", "playful", "elegant")
- [ ] Code-to-config: paste GSAP → reconstruct visual config

## Sprint 11 — More frameworks
- [ ] `@animato/vue` (Vue 3 composition API)
- [ ] `@animato/svelte` (Svelte action)
- [ ] Astro integration

## Sprint 12 — Ecosystem (M5)
- [ ] VS Code extension (jump from config entry → editor focused on that id)
- [ ] Figma plugin: import frame layout → scaffold Animato ids
- [ ] Premium preset packs (Pro)
- [ ] Community preset gallery

---

## Sprint Mechanics

### Definition of Done (per ticket)
- Works in Chrome + Safari
- Unit tests for any pure logic (config schema, generator, easing math)
- Playwright E2E for editor flows
- TypeScript types exported and tested via `tsd`
- Docs page updated
- Telemetry event added (opt-in)
- PR reviewed + merged

### Rituals
- Mon W1: planning (1h)
- Daily: 10-min standup
- Thu W2: demo (30 min, recorded)
- Fri W2: retro (45 min)

### Velocity expectations
Expect 30% drop in Sprint 3 (timeline) and Sprint 4 (ScrollTrigger overlay markers — the hardest UX problem). Don't pad — surface it.

### Re-planning triggers
- Bundle size > 8 KB gzip → freeze features, optimize before continuing
- Alpha NPS < 30 → run a polish-only sprint before Sprint 4
- Build plugin complexity blows up Next integration → cut Next from v1, ship Vite-only

---

## Out-of-Plan Reserve

Listed in BRD but deliberately not in v1:
- Vue, Svelte, Astro adapters → Sprint 11
- Cloud sync, accounts, billing → Sprint 8–9
- AI assist → Sprint 10
- VS Code / Figma plugins → Sprint 12
- Property graph editor → not planned (only build if users ask)
- Custom CSS escape hatch → defer
- Lottie import → not planned

Resist cramming these into v1. The pitch is **"animate your real site visually, get clean GSAP, ship it"** — not feature count. Every extra feature is one more thing reviewers tell you sucks on launch day.
