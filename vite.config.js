import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home:         resolve(__dirname, 'index.html'),
        audiovisual:  resolve(__dirname, 'projects/audiovisual.html'),
        graphics:     resolve(__dirname, 'projects/graphics.html'),
        sculptures:   resolve(__dirname, 'projects/sculptures.html'),
      },
    },
  },
});