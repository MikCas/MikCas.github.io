import './styles/main.css';
import { createGridScene } from './grid/GridScene.js';

const canvas = document.getElementById('bg-canvas');
const { uniforms } = createGridScene(canvas);

// Wire up parameter controls to shader uniforms
document.querySelectorAll('[data-uniform]').forEach((input) => {
  const name = input.dataset.uniform;
  const valueDisplay = input.closest('.param')?.querySelector('.param-value');

  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    if (uniforms[name]) {
      uniforms[name].value = input.tagName === 'SELECT' ? parseInt(input.value) : val;
    }
    if (valueDisplay) {
      valueDisplay.textContent = input.tagName === 'SELECT'
        ? input.options[input.selectedIndex].text
        : val % 1 === 0 ? val.toString() : val.toFixed(3);
    }
  });
});
