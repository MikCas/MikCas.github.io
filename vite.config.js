import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home:            resolve(__dirname, 'index.html'),
        // Category index pages
        audiovisual:     resolve(__dirname, 'projects/audiovisual.html'),
        graphics:        resolve(__dirname, 'projects/graphics.html'),
        sculptures:      resolve(__dirname, 'projects/sculptures.html'),
        // Audiovisual project pages
        strudelAv:       resolve(__dirname, 'projects/strudel-av.html'),
        liveCodingSet:   resolve(__dirname, 'projects/live-coding-set.html'),
        signalStudies:   resolve(__dirname, 'projects/signal-studies.html'),
        // Graphics project pages
        raytracer:       resolve(__dirname, 'projects/raytracer.html'),
        particleSystem:  resolve(__dirname, 'projects/particle-system.html'),
        gridShader:      resolve(__dirname, 'projects/grid-shader.html'),
        // Sculpture project pages
        mesh01:          resolve(__dirname, 'projects/mesh-01.html'),
        mesh02:          resolve(__dirname, 'projects/mesh-02.html'),
      },
    },
  },
});
