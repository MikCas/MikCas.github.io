import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()],
  // If deploying to username.github.io/portfolio, set base: '/portfolio/'
  // If deploying to username.github.io (user site), remove this line
  base: '/portfolio/',
});
