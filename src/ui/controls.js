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

// --- Persistence ---
// Shader params survive link navigation within the same tab so that
// visitors browsing the site don't see the background jump between pages.
// A full reload wipes the saved state so each fresh visit starts clean.
const STORAGE_KEY = 'gridShaderState';

(function clearOnReload() {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'reload') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* ignore — storage / perf API unavailable */ }
})();

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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
  } catch { /* ignore — quota or private mode */ }
}

// --- Swatch state ---
const swatchIdx = { bg: 1, minor: 2, major: 0 }; // initial: white, gray, black

function applySwatch(slot) {
  const ids = { bg: 'swBg', minor: 'swMinor', major: 'swMajor' };
  $(ids[slot]).style.backgroundColor = PALETTE[swatchIdx[slot]];
}

function cycleSwatch(slot) {
  swatchIdx[slot] = (swatchIdx[slot] + 1) % PALETTE.length;
  applySwatch(slot);
}

// --- Mode state ---
let modeIndex = 0;

function applyMode() {
  const m = MODES[modeIndex];
  $('btnMode').textContent = m.name;

  // Use .placeholder to hide while preserving the row's height — keeps panel size fixed
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
  // If the controls markup isn't on this page (e.g. project pages), skip wiring.
  if (!$('btnMode')) return null;

  // Restore any persisted state before painting the initial UI
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

  // Init swatches to their (possibly-restored) colours
  ['bg', 'minor', 'major'].forEach(applySwatch);

  // Swatch click handlers
  $('swBg').addEventListener('click',    () => { cycleSwatch('bg');    saveState(); });
  $('swMinor').addEventListener('click', () => { cycleSwatch('minor'); saveState(); });
  $('swMajor').addEventListener('click', () => { cycleSwatch('major'); saveState(); });

  // Mode button
  applyMode();
  $('btnMode').addEventListener('click', () => {
    modeIndex = (modeIndex + 1) % MODES.length;
    applyMode();
    saveState();
  });

  // Slider readout sync
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

  // Randomize
  $('btnRand').addEventListener('click', () => {
    // Random mode
    modeIndex = ri(0, MODES.length - 1);
    applyMode();

    // Random knob values
    $('pCellSize').value = ri(25, 200);
    $('pSub').value      = ri(1, 8);
    $('pMinW').value     = ri(5, 80);
    $('pMajW').value     = ri(10, 90);
    $('pParamA').value   = ri(0, 100);
    $('pParamB').value   = ri(0, 100);
    sliders.forEach(([i, v]) => { const el = $(v); if (el) el.textContent = $(i).value; });

    // 3 distinct random palette colours (Fisher-Yates on first 3 of shuffled indices)
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

  // Live getter — called every frame by grid.js
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
