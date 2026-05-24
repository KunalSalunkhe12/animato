import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'gsap', '@gsap/react'],
  esbuildOptions(options) {
    // "use client" for Next.js App Router compatibility. Injected here because
    // the source-level directive is stripped during bundling.
    options.banner = { js: '"use client";' };
  },
});
