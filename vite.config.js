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
        audiovisual1:       resolve(__dirname, 'projects/av-1.html'),
        audiovisual2:   resolve(__dirname, 'projects/av-2.html'),
        audiovisual3:   resolve(__dirname, 'projects/av-3.html'),
        // Graphics project pages
        graphics1:       resolve(__dirname, 'projects/graphics-1.html'),
        graphics2:  resolve(__dirname, 'projects/graphics-2.html'),
        graphics3:      resolve(__dirname, 'projects/graphics-3.html'),
        // Sculpture project pages
        sculptures1:          resolve(__dirname, 'projects/sculptures-1.html'),
        sculptures2:          resolve(__dirname, 'projects/sculptures-2.html'),
      },
    },
  },
});
