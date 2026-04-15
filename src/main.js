import './style.css';
import { initGrid } from './shader/grid.js';
import { initControls } from './ui/controls.js';

const canvas = document.getElementById('grid');
const controlsContainer = document.getElementById('controls-container');

const getParams = initControls(controlsContainer);
initGrid(canvas, getParams);

