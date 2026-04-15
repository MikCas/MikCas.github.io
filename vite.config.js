import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home:      resolve(__dirname, 'index.html'),
        strudel:   resolve(__dirname, 'projects/strudel-av.html'),
        raytracer: resolve(__dirname, 'projects/raytracer.html'),
        particles: resolve(__dirname, 'projects/particle-system.html'),
      },
    },
  },
});