// src/ui/controls.js

const CONTROLS_HTML = `
<details id="controls" open>
  <summary>parameters</summary>
  <div class="row"><label>cell</label><input type="range" id="pCellSize" min="20" max="300" value="80" step="1"><span class="val" id="vCell">80</span></div>
  <div class="row"><label>subdiv</label><input type="range" id="pSub" min="1" max="12" value="4" step="1"><span class="val" id="vSub">4</span></div>
  <div class="row"><label>minor w</label><input type="range" id="pMinW" min="0" max="100" value="30" step="1"><span class="val" id="vMinW">30</span></div>
  <div class="row"><label>major w</label><input type="range" id="pMajW" min="0" max="100" value="50" step="1"><span class="val" id="vMajW">50</span></div>
  <div class="row"><label>axis w</label><input type="range" id="pAxW" min="0" max="100" value="60" step="1"><span class="val" id="vAxW">60</span></div>
  <div class="row"><label>opacity</label><input type="range" id="pMinO" min="0" max="100" value="40" step="1"><span class="val" id="vMinO">40</span></div>
  <div class="row"><label>bg</label><input type="color" id="cBg" value="#c8c8c8"></div>
  <div class="row"><label>minor</label><input type="color" id="cMin" value="#999999"></div>
  <div class="row"><label>major</label><input type="color" id="cMaj" value="#666666"></div>
  <div class="row"><label>axis x</label><input type="color" id="cAX" value="#cc4444"></div>
  <div class="row"><label>axis y</label><input type="color" id="cAY" value="#44aa44"></div>
  <button id="btnRand">randomize</button>
</details>
`;

const hex = (h) => [
  parseInt(h.slice(1,3), 16) / 255,
  parseInt(h.slice(3,5), 16) / 255,
  parseInt(h.slice(5,7), 16) / 255,
];
const $ = (id) => document.getElementById(id);
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const rh = () => '#' + [0,0,0].map(() => ri(40,220).toString(16).padStart(2,'0')).join('');

export function initControls(container) {
  // BUILD UI
  container.innerHTML = CONTROLS_HTML;

  // NUMBER OF READOUTS IN SYNC WITH THE SLIDER
  const sliders = [
    ['pCellSize', 'vCell'],
    ['pSub',      'vSub'],
    ['pMinW',     'vMinW'],
    ['pMajW',     'vMajW'],
    ['pAxW',      'vAxW'],
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
    $('pAxW').value      = ri(20, 100);
    $('pMinO').value     = ri(10, 80);
    $('cBg').value  = rh();
    $('cMin').value = rh();
    $('cMaj').value = rh();
    $('cAX').value  = rh();
    $('cAY').value  = rh();
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
      axW:   +$('pAxW').value  / 100,
      minO:  +$('pMinO').value / 100,
      fade:  9999.0,
      bg:    hex($('cBg').value),
      minC:  hex($('cMin').value),
      majC:  hex($('cMaj').value),
      aXC:   hex($('cAX').value),
      aYC:   hex($('cAY').value),
      off:   [0, 0],
    };
  };
}
