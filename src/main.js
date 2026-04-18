import './style.css';
import { initGrid } from './shader/grid.js';
import { initControls } from './ui/controls.js';

const canvas = document.getElementById('grid');
const getParams = initControls();

if (canvas && getParams) {
  initGrid(canvas, getParams);
}

