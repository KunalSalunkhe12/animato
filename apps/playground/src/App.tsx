import { AnimatoProvider, Animato } from '@animato/react';
import animatoConfig from '../animato.config.json';
import type { AnimatoConfig } from '@animato/core';

const config = animatoConfig as AnimatoConfig;

export function App(): JSX.Element {
  return (
    <AnimatoProvider config={config} editor={import.meta.env.DEV}>
      <main className="page">
        <header className="hero">
          <Animato id="hero-title" as="fragment">
            <h1 className="hero__title">Animato</h1>
          </Animato>

          <Animato id="hero-subtitle" as="fragment">
            <p className="hero__subtitle">
              Visual GSAP editing. Animations live in your repo as JSON, ship as clean code.
            </p>
          </Animato>

          <Animato id="hero-cta">
            <button className="hero__cta" type="button">
              Get started
            </button>
          </Animato>
        </header>

        <section className="demo">
          <h2>Looping animation</h2>
          <Animato id="spinner">
            <div className="spinner" aria-hidden="true">
              ◆
            </div>
          </Animato>
        </section>

        <footer className="footer">
          <p>
            <strong>Sprint 2 ✓</strong> — Press <kbd>Ctrl+Shift+E</kbd> or click the purple{' '}
            <strong>A</strong> in the bottom-right to open the editor. Pick an element from the
            sidebar, drag the sliders, hit ▶ Replay.
            <br />
            Edits live in memory only — Sprint 3 adds JSON persistence.
          </p>
        </footer>
      </main>
    </AnimatoProvider>
  );
}
