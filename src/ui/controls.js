import './controls.css';

const PALETTE = [
  '#000000', // black
  '#ffffff', // white
  '#888888', // gray
  '#ff2200', // red
  '#00cc44', // green
  '#0044ff', // blue
  '#ffdd00', // yellow
];

const MODES = [
  { name: 'square',  labelA: null,      labelB: null },
  { name: 'rotated', labelA: 'angle',   labelB: null },
  { name: 'moire',   labelA: 'angle 1', labelB: 'angle 2' },
  { name: 'brick',   labelA: 'offset x', labelB: 'offset y' },
  { name: 'polar',   labelA: 'rings',   labelB: 'spokes' },
  { name: 'dots',    labelA: 'size',    labelB: null },
  { name: 'waves',   labelA: 'amp',     labelB: 'freq' },
];

const hex = (h) => [
  parseInt(h.slice(1,3), 16) / 255,
  parseInt(h.slice(3,5), 16) / 255,
  parseInt(h.slice(5,7), 16) / 255,
];
const $ = (id) => document.getElementById(id);
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

// Shader parameters persist across page navigations within a session, but a
// full reload resets them — so refreshing feels like a clean slate.
const STORAGE_KEY = 'gridShaderState';

(function clearOnReload() {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'reload') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) { console.warn(e); }
})();

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { console.warn(e); return null; }
}

function saveState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      modeIndex,
      cell:   $('pCellSize').value,
      sub:    $('pSub').value,
      minW:   $('pMinW').value,
      majW:   $('pMajW').value,
      paramA: $('pParamA').value,
      paramB: $('pParamB').value,
      swatchIdx: { ...swatchIdx },
    }));
  } catch (e) { console.warn(e); }
}

const DEFAULTS = {
  modeIndex: 0,
  cell:   80,
  sub:    4,
  minW:   30,
  majW:   50,
  paramA: 50,
  paramB: 50,
  swatchIdx: { bg: 1, minor: 2, major: 0 }, // white, gray, black
};

const swatchIdx = { ...DEFAULTS.swatchIdx };

function applySwatch(slot) {
  const ids = { bg: 'swBg', minor: 'swMinor', major: 'swMajor' };
  $(ids[slot]).style.backgroundColor = PALETTE[swatchIdx[slot]];
}

function cycleSwatch(slot) {
  swatchIdx[slot] = (swatchIdx[slot] + 1) % PALETTE.length;
  applySwatch(slot);
}

let modeIndex = 0;

function applyMode() {
  const m = MODES[modeIndex];
  $('btnMode').textContent = m.name;

  const rowA = $('rowA');
  const rowB = $('rowB');
  if (m.labelA) {
    rowA.classList.remove('placeholder');
    $('lblA').textContent = m.labelA;
  } else {
    rowA.classList.add('placeholder');
  }
  if (m.labelB) {
    rowB.classList.remove('placeholder');
    $('lblB').textContent = m.labelB;
  } else {
    rowB.classList.add('placeholder');
  }
}

export function initControls() {

  if (!$('btnMode')) return null;

  const saved = loadState();
  if (saved) {
    modeIndex = saved.modeIndex ?? modeIndex;
    if (saved.cell   != null) $('pCellSize').value = saved.cell;
    if (saved.sub    != null) $('pSub').value      = saved.sub;
    if (saved.minW   != null) $('pMinW').value     = saved.minW;
    if (saved.majW   != null) $('pMajW').value     = saved.majW;
    if (saved.paramA != null) $('pParamA').value   = saved.paramA;
    if (saved.paramB != null) $('pParamB').value   = saved.paramB;
    if (saved.swatchIdx) Object.assign(swatchIdx, saved.swatchIdx);
  }

  ['bg', 'minor', 'major'].forEach(applySwatch);

  $('swBg').addEventListener('click',    () => { cycleSwatch('bg');    saveState(); });
  $('swMinor').addEventListener('click', () => { cycleSwatch('minor'); saveState(); });
  $('swMajor').addEventListener('click', () => { cycleSwatch('major'); saveState(); });

  applyMode();
  $('btnMode').addEventListener('click', () => {
    modeIndex = (modeIndex + 1) % MODES.length;
    applyMode();
    saveState();
  });

  const sliders = [
    ['pCellSize', 'vCell'],
    ['pSub',      'vSub'],
    ['pMinW',     'vMinW'],
    ['pMajW',     'vMajW'],
    ['pParamA',   'vParamA'],
    ['pParamB',   'vParamB'],
  ];
  sliders.forEach(([inputId, valId]) => {
    const input = $(inputId);
    const val   = $(valId);
    if (!input || !val) return;
    val.textContent = input.value;
    input.addEventListener('input', () => {
      val.textContent = input.value;
      saveState();
    });
  });

  $('btnReset').addEventListener('click', () => {
    modeIndex = DEFAULTS.modeIndex;
    $('pCellSize').value = DEFAULTS.cell;
    $('pSub').value      = DEFAULTS.sub;
    $('pMinW').value     = DEFAULTS.minW;
    $('pMajW').value     = DEFAULTS.majW;
    $('pParamA').value   = DEFAULTS.paramA;
    $('pParamB').value   = DEFAULTS.paramB;
    sliders.forEach(([i, v]) => { const el = $(v); if (el) el.textContent = $(i).value; });

    Object.assign(swatchIdx, DEFAULTS.swatchIdx);
    ['bg', 'minor', 'major'].forEach(applySwatch);

    applyMode();
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { console.warn(e); }
  });

  $('btnRand').addEventListener('click', () => {
    modeIndex = ri(0, MODES.length - 1);
    applyMode();

    $('pCellSize').value = ri(25, 200);
    $('pSub').value      = ri(1, 8);
    $('pMinW').value     = ri(5, 80);
    $('pMajW').value     = ri(10, 90);
    $('pParamA').value   = ri(0, 100);
    $('pParamB').value   = ri(0, 100);
    sliders.forEach(([i, v]) => { const el = $(v); if (el) el.textContent = $(i).value; });

    const idxs = Array.from({ length: PALETTE.length }, (_, i) => i);
    for (let i = 0; i < 3; i++) {
      const j = i + ri(0, idxs.length - 1 - i);
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    swatchIdx.bg    = idxs[0];
    swatchIdx.minor = idxs[1];
    swatchIdx.major = idxs[2];
    ['bg', 'minor', 'major'].forEach(applySwatch);

    saveState();
  });

  return function getParams() {
    return {
      cell:   +$('pCellSize').value,
      sub:    +$('pSub').value,
      maxLW:  0.04,
      minW:   +$('pMinW').value / 100,
      majW:   +$('pMajW').value / 100,
      fade:   9999.0,
      mode:   modeIndex,
      paramA: +$('pParamA').value,
      paramB: +$('pParamB').value,
      bg:     hex(PALETTE[swatchIdx.bg]),
      minC:   hex(PALETTE[swatchIdx.minor]),
      majC:   hex(PALETTE[swatchIdx.major]),
      off:    [0, 0],
    };
  };
}
