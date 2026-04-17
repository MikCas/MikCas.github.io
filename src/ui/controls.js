import './controls.css';

const hex = (h) => [
  parseInt(h.slice(1,3), 16) / 255,
  parseInt(h.slice(3,5), 16) / 255,
  parseInt(h.slice(5,7), 16) / 255,
];
const $ = (id) => document.getElementById(id);
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const rh = () => '#' + [0,0,0].map(() => ri(40,220).toString(16).padStart(2,'0')).join('');

export function initControls() {
  // NUMBER OF READOUTS IN SYNC WITH THE SLIDER
  const sliders = [
    ['pCellSize', 'vCell'],
    ['pSub',      'vSub'],
    ['pMinW',     'vMinW'],
    ['pMajW',     'vMajW'],
    ['pMinO',     'vMinO'],
  ];
  sliders.forEach(([inputId, valId]) => {
    const input = $(inputId);
    const val = $(valId);
    val.textContent = input.value;
    input.addEventListener('input', () => { val.textContent = input.value; });
  });

  // RANDOMISE
  $('btnRand').addEventListener('click', () => {
    $('pCellSize').value = ri(25, 250);
    $('pSub').value      = ri(1, 10);
    $('pMinW').value     = ri(5, 80);
    $('pMajW').value     = ri(10, 90);
    $('pMinO').value     = ri(10, 80);
    $('cBg').value  = rh();
    $('cMin').value = rh();
    $('cMaj').value = rh();
    // trigger readout update
    sliders.forEach(([i,v]) => $(v).textContent = $(i).value);
  });

  // LIVE GETTER
  return function getParams() {
    return {
      cell:  +$('pCellSize').value,
      sub:   +$('pSub').value,
      maxLW: 0.04,
      minW:  +$('pMinW').value / 100,
      majW:  +$('pMajW').value / 100,
      minO:  +$('pMinO').value / 100,
      fade:  9999.0,
      bg:    hex($('cBg').value),
      minC:  hex($('cMin').value),
      majC:  hex($('cMaj').value),
      off:   [0, 0],
    };
  };
}
