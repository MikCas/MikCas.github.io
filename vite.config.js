import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  plugins: [glsl()],
  // Only set base path for production builds (GitHub Pages)
  // Dev server always uses '/' so localhost:5173 works normally
  // User site (MikCas.github.io) — no subpath needed
  base: '/',
}));
