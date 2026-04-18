import './style.css';
import { initGrid } from './shader/grid.js';
import { initControls } from './ui/controls.js';

const canvas = document.getElementById('grid');
const getParams = initControls();

// Shader + controls are only present on the homepage and category pages.
// Project pages omit them entirely — skip init if either is missing.
if (canvas && getParams) {
  initGrid(canvas, getParams);
}

