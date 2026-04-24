import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Auto-discover every HTML file under /projects/ (except partials prefixed with `_`).
// Adding a new project page needs no config edit.
const projectEntries = Object.fromEntries(
  readdirSync(resolve(__dirname, 'projects'))
    .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
    .map((f) => [f.replace(/\.html$/, ''), resolve(__dirname, 'projects', f)])
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        ...projectEntries,
      },
    },
  },
});
