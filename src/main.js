import './style.css';
import { initGrid } from './shader/grid.js';
import { initControls } from './ui/controls.js';

const canvas = document.getElementById('grid');

const getParams = initControls();
initGrid(canvas, getParams);

