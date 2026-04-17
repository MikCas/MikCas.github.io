import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home:      resolve(__dirname, 'index.html'),
        // strudel:   resolve(__dirname, 'projects/audiovisual.html'),
        // raytracer: resolve(__dirname, 'projects/graphics.html'),
        // particles: resolve(__dirname, 'projects/sculptures.html'),
      },
    },
  },
});