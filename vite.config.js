import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home:           resolve(__dirname, 'index.html'),
        // Category index pages
        audiovisual:    resolve(__dirname, 'projects/audiovisual.html'),
        graphics:       resolve(__dirname, 'projects/graphics.html'),
        sculptures:     resolve(__dirname, 'projects/sculptures.html'),
        // Project pages
        strudelAv:      resolve(__dirname, 'projects/strudel-av.html'),
        raytracer:      resolve(__dirname, 'projects/raytracer.html'),
        particleSystem: resolve(__dirname, 'projects/particle-system.html'),
      },
    },
  },
});
