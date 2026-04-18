import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home:          resolve(__dirname, 'index.html'),
        particleSystem: resolve(__dirname, 'projects/particle-system.html'),
        raytracer:     resolve(__dirname, 'projects/raytracer.html'),
        strudelAv:     resolve(__dirname, 'projects/strudel-av.html'),
      },
    },
  },
});
