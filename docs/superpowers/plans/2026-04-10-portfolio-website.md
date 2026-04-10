# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal portfolio website with a ported TouchDesigner pristine grid shader as a full-screen WebGL background, and HUD-style HTML/CSS content panels floating on top.

**Architecture:** Vite bundles a vanilla JS app. Three.js renders the grid shader on a full-viewport fixed canvas. HTML content layers above the canvas via CSS z-index. GitHub Actions auto-deploys the Vite build output to GitHub Pages.

**Tech Stack:** Vite, vite-plugin-glsl, Three.js, vanilla HTML/CSS/JS, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-04-10-portfolio-website-design.md`

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Dependencies (three, vite, vite-plugin-glsl) and scripts |
| `vite.config.js` | GLSL plugin registration |
| `index.html` | Entry HTML — canvas element + content container |
| `src/main.js` | App entry — creates GridScene, starts render loop |
| `src/grid/GridScene.js` | Three.js scene setup, camera, resize handling, mouse controls |
| `src/grid/grid.vert.glsl` | Ported vertex shader |
| `src/grid/grid.frag.glsl` | Ported fragment shader (pristine grid) |
| `src/styles/main.css` | Global styles, canvas positioning, UI panel styles |
| `public/assets/` | Directory for images, thumbnails, resume PDF (empty initially) |
| `.github/workflows/deploy.yml` | GitHub Pages auto-deploy on push to main |

---

## Task 1: Scaffold Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js` (placeholder)
- Create: `src/styles/main.css` (placeholder)

- [ ] **Step 1: Initialize the project**

```bash
cd /Users/mikhailcassar/Documents/PROJECTS/Portfolio
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install three
npm install -D vite vite-plugin-glsl
```

- [ ] **Step 3: Create `vite.config.js`**

```js
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()],
  // If deploying to username.github.io/portfolio, set base: '/portfolio/'
  // If deploying to username.github.io (user site), remove this line
  base: '/portfolio/',
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mikhail Cassar</title>
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  <div id="content"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create placeholder `src/main.js`**

```js
import './styles/main.css';

console.log('Portfolio app loaded');
```

- [ ] **Step 6: Create placeholder `src/styles/main.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #000;
}

#bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

#content {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 7: Update `package.json` scripts**

Replace the `"scripts"` section in `package.json` with:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```
(This replaces the default `"test": "echo..."` from `npm init -y`.)

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Terminal shows `Local: http://localhost:5173/`. Browser shows a black page with "Portfolio app loaded" in the console.

- [ ] **Step 9: Initialize git and commit**

```bash
mkdir -p public/assets
touch public/assets/.gitkeep
git init
echo "node_modules\ndist\n.DS_Store" > .gitignore
git add .
git commit -m "feat: scaffold Vite project with Three.js and GLSL plugin"
```

---

## Task 2: Port the Vertex Shader

**Files:**
- Create: `src/grid/grid.vert.glsl`

**Source reference:** `/Users/mikhailcassar/Documents/PROJECTS/grid-td/src/glsl/vertex.glsl`

- [ ] **Step 1: Create the ported vertex shader**

```glsl
// Ported from TouchDesigner vertex shader
// TD functions replaced with Three.js built-ins

varying vec3 vWorldSpacePos;
varying vec3 vCamPos;

void main() {
  // Three.js provides: modelMatrix, viewMatrix, projectionMatrix, cameraPosition, position
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * viewMatrix * worldPos;

  vCamPos = cameraPosition;
  vWorldSpacePos = worldPos.xyz;
}
```

**What changed from TD:**
- `TDDeform(TDPos())` → `modelMatrix * vec4(position, 1.0)`
- `TDWorldToProj(worldPos)` → `projectionMatrix * viewMatrix * worldPos`
- `uTDMats[TDCameraIndex()].camInverse[3].xyz` → `cameraPosition` (Three.js built-in uniform)
- `out` → `varying` (Three.js default GLSL mode)
- Removed `TD_PICKING_ACTIVE` block (TD-specific feature)

- [ ] **Step 2: Commit**

```bash
git add src/grid/grid.vert.glsl
git commit -m "feat: port vertex shader from TouchDesigner to Three.js"
```

---

## Task 3: Port the Fragment Shader

**Files:**
- Create: `src/grid/grid.frag.glsl`

**Source reference:** `/Users/mikhailcassar/Documents/PROJECTS/grid-td/src/glsl/pixel.glsl`

- [ ] **Step 1: Create the ported fragment shader**

```glsl
// Pristine Infinite Grid Shader — ported from TouchDesigner
// Based on: https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8

// GRID
uniform int   uPlaneMode;    // Grid plane: 0 = XY (Front), 1 = YZ (Right), 2 = ZX (Top)
uniform float uCellSize;     // World-space size of one major grid cell
uniform float uSubdivisions; // Minor cells per major cell

// WIDTH
uniform float uMaxLineWidth; // Maximum line width in UV space
uniform float uMinWidth;     // Minor grid line width [0–1]
uniform float uMajWidth;     // Major grid line width [0–1]
uniform float uAxisWidth;    // Axis line width [0–1]

// COLOR
uniform vec4  uMinColor;     // Minor grid line color (RGBA)
uniform vec4  uMajColor;     // Major grid line color (RGBA)
uniform vec4  uBgColor;      // Background color (RGBA)
uniform float uMinOpacity;   // Minor grid line opacity [0–1]
uniform float uFadeDistance;  // Distance at which the grid fully fades out
uniform vec4  uColorX;       // X-axis color
uniform vec4  uColorY;       // Y-axis color
uniform vec4  uColorZ;       // Z-axis color

varying vec3 vWorldSpacePos;
varying vec3 vCamPos;

// Resolution-independent AA grid (unchanged from TD)
float pristineGrid(vec2 uv, vec2 lineWidth) {
    vec2 ddx = dFdx(uv);
    vec2 ddy = dFdy(uv);
    vec2 uvDeriv = vec2(length(vec2(ddx.x, ddy.x)), length(vec2(ddx.y, ddy.y)));

    vec2 drawWidth = max(lineWidth, uvDeriv);
    vec2 lineAA = uvDeriv * 1.5;
    vec2 gridUV = 1.0 - abs(fract(uv) * 2.0 - 1.0);

    vec2 grid2 = 1.0 - smoothstep(drawWidth - lineAA, drawWidth + lineAA, gridUV);
    grid2 *= clamp(lineWidth / drawWidth, 0.0, 1.0);
    grid2 = mix(grid2, lineWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));

    return mix(grid2.x, 1.0, grid2.y);
}

// Anti-aliased axis line at uv = 0 (unchanged from TD)
vec2 axisLine(vec2 uv, float width) {
    vec2 axisW = vec2(width);
    vec2 dAxis = fwidth(uv);
    vec2 drawW = max(axisW, dAxis);
    vec2 aa = dAxis * 1.5;

    vec2 mask = 1.0 - smoothstep(drawW - aa, drawW + aa, abs(uv));
    mask *= clamp(axisW / drawW, 0.0, 1.0);
    return mask;
}

void main() {
    // UV SETUP (unchanged logic from TD)
    vec2 uv;
    vec2 fadePlane;
    vec4 axisColorU;
    vec4 axisColorV;
    vec3 wp = vWorldSpacePos;

    if (uPlaneMode == 0) {        // XY plane (Front view)
        uv = wp.xy / uCellSize;
        fadePlane = wp.xy - vCamPos.xy;
        axisColorU = uColorX;
        axisColorV = uColorY;
    } else if (uPlaneMode == 1) { // YZ plane (Right view)
        uv = wp.yz / uCellSize;
        fadePlane = wp.yz - vCamPos.yz;
        axisColorU = uColorY;
        axisColorV = uColorZ;
    } else {                      // ZX plane (Top view)
        uv = wp.xz / uCellSize;
        fadePlane = wp.xz - vCamPos.xz;
        axisColorU = uColorX;
        axisColorV = uColorZ;
    }

    // WIDTH SCALING
    float minW = uMinWidth * uMaxLineWidth;
    float majW = uMajWidth * uMaxLineWidth;
    float axisW = uAxisWidth * uMaxLineWidth;

    // GRID MASKS
    float minorMask = pristineGrid(uv * uSubdivisions, vec2(minW));
    float majorMask = pristineGrid(uv, vec2(majW));

    // AXIS MASKS
    vec2 axisMask = axisLine(uv, axisW);

    // COMPOSITE
    vec4 bg = vec4(uBgColor.rgb * uBgColor.a, uBgColor.a);
    vec4 color = mix(bg, uMinColor, minorMask * uMinOpacity);
    color = mix(color, uMajColor, majorMask);
    color = mix(color, axisColorU, axisMask.x);
    color = mix(color, axisColorV, axisMask.y);

    // DISTANCE FADE
    float dist = length(fadePlane);
    float alphaFade = 1.0 - smoothstep(0.0, uFadeDistance, dist);
    color = mix(bg, color, alphaFade);

    // Alpha discard (replaces TDAlphaTest)
    if (color.a < 0.01) discard;

    gl_FragColor = color;
}
```

**What changed from TD:**
- Removed `TDCheckDiscard()` call
- Replaced `TDAlphaTest(color.a)` with `if (color.a < 0.01) discard;`
- Replaced `TDOutputSwizzle(color)` → use `color` directly via `gl_FragColor`
- Changed `in` → `varying`, removed `out vec4 oFragColor`
- All math functions (`pristineGrid`, `axisLine`) are unchanged

- [ ] **Step 2: Commit**

```bash
git add src/grid/grid.frag.glsl
git commit -m "feat: port fragment shader from TouchDesigner to Three.js"
```

---

## Task 4: Create the Three.js Grid Scene

**Files:**
- Create: `src/grid/GridScene.js`

- [ ] **Step 1: Create `GridScene.js`**

This module creates the Three.js scene, camera, grid mesh with ShaderMaterial, and the render loop.

```js
import * as THREE from 'three';
import vertexShader from './grid.vert.glsl';
import fragmentShader from './grid.frag.glsl';

export function createGridScene(canvas) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Scene
  const scene = new THREE.Scene();

  // Camera — perspective, looking down at the grid
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 12);
  camera.lookAt(0, 0, 0);

  // Shader uniforms
  const uniforms = {
    uPlaneMode:    { value: 2 },       // ZX (top-down floor)
    uCellSize:     { value: 1.0 },
    uSubdivisions: { value: 4.0 },
    uMaxLineWidth: { value: 0.05 },
    uMinWidth:     { value: 0.02 },
    uMajWidth:     { value: 0.04 },
    uAxisWidth:    { value: 0.06 },
    uMinColor:     { value: new THREE.Vector4(0.2, 0.2, 0.2, 1.0) },
    uMajColor:     { value: new THREE.Vector4(0.4, 0.4, 0.4, 1.0) },
    uBgColor:      { value: new THREE.Vector4(0.0, 0.0, 0.0, 1.0) },
    uMinOpacity:   { value: 0.5 },
    uFadeDistance:  { value: 50.0 },
    uColorX:       { value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0) },
    uColorY:       { value: new THREE.Vector4(0.0, 1.0, 0.0, 1.0) },
    uColorZ:       { value: new THREE.Vector4(0.0, 0.0, 1.0, 1.0) },
  };

  // Grid mesh — large flat plane with custom shader
  const geometry = new THREE.PlaneGeometry(200, 200);
  geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const gridMesh = new THREE.Mesh(geometry, material);
  scene.add(gridMesh);

  // Resize handler
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Return handles for mouse controls (Task 5)
  return { renderer, scene, camera, uniforms };
}
```

- [ ] **Step 2: Wire up `src/main.js`**

```js
import './styles/main.css';
import { createGridScene } from './grid/GridScene.js';

const canvas = document.getElementById('bg-canvas');
createGridScene(canvas);
```

- [ ] **Step 3: Verify the grid renders**

```bash
npm run dev
```

Expected: Browser shows a black background with the pristine grid rendered in perspective — grey grid lines fading into the distance, colored axis lines at the origin. The camera looks down at the grid from an angle.

**Troubleshooting if blank screen:**
- Open browser DevTools console — check for shader compilation errors
- Common issue: GLSL version mismatch. If Three.js complains, the `varying` keyword and `gl_FragColor` should work with Three.js's default WebGL2 shader preamble
- If axis colors or grid lines are not visible, check that uniform values are non-zero

- [ ] **Step 4: Commit**

```bash
git add src/grid/GridScene.js src/main.js
git commit -m "feat: render pristine grid with Three.js ShaderMaterial"
```

---

## Task 5: Add Mouse Controls

**Files:**
- Modify: `src/grid/GridScene.js`

- [ ] **Step 1: Add mouse orbit to `GridScene.js`**

Add this after the `animate()` call, before the `return` statement in `createGridScene`:

```js
  // Mouse orbit — drag to rotate camera around the origin
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  // Spherical coordinates for camera position
  let spherical = { radius: 15, theta: Math.PI / 4, phi: Math.PI / 3 };

  function updateCameraFromSpherical() {
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 0, 0);
  }
  updateCameraFromSpherical();

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    prevMouse = { x: e.clientX, y: e.clientY };

    spherical.theta -= dx * 0.005;
    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.01, spherical.phi - dy * 0.005));
    updateCameraFromSpherical();
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    spherical.radius = Math.max(5, Math.min(50, spherical.radius + e.deltaY * 0.05));
    updateCameraFromSpherical();
  }, { passive: false });
```

Also remove these two lines from earlier in `createGridScene` (the spherical controls now handle camera positioning):
```js
  // DELETE these two lines:
  camera.position.set(0, 8, 12);
  camera.lookAt(0, 0, 0);
```

- [ ] **Step 2: Verify mouse interaction**

```bash
npm run dev
```

Expected:
- Click and drag rotates the camera around the grid
- Vertical drag changes the viewing angle (clamped so you can't go below the grid)
- Scroll wheel zooms in/out
- Grid stays centered and visible from all angles

- [ ] **Step 3: Commit**

```bash
git add src/grid/GridScene.js
git commit -m "feat: add mouse orbit and zoom controls to grid scene"
```

---

## Task 6: Add First UI Panel (Name/Title)

**Files:**
- Modify: `index.html`
- Modify: `src/styles/main.css`

This establishes the visual language for all UI panels.

- [ ] **Step 1: Add name/title HTML to `index.html`**

Replace the `<div id="content"></div>` with:

```html
<div id="content">
  <header class="panel" id="hero-panel">
    <h1>Mikhail Cassar</h1>
    <p class="subtitle">Creative Technologist</p>
  </header>
</div>
```

- [ ] **Step 2: Add panel styles to `src/styles/main.css`**

```css
/* Typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #e0e0e0;
}

/* Content layer */
#content {
  position: relative;
  z-index: 1;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* Let clicks pass through to canvas */
}

/* Glass panel base style */
.panel {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 2rem 3rem;
  pointer-events: auto; /* Re-enable clicks on panels */
}

/* Hero panel */
#hero-panel {
  text-align: center;
}

#hero-panel h1 {
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

#hero-panel .subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
}
```

- [ ] **Step 3: Verify the panel renders over the grid**

```bash
npm run dev
```

Expected: A frosted glass panel with "Mikhail Cassar" / "Creative Technologist" floating centered over the grid. The grid is visible through the blurred panel background. Mouse drag still orbits the grid (clicks pass through the content layer except on the panel itself).

- [ ] **Step 4: Commit**

```bash
git add index.html src/styles/main.css
git commit -m "feat: add hero panel with glass aesthetic over grid"
```

---

## Task 7: Add Remaining UI Panels (Iterative)

**Files:**
- Modify: `index.html`
- Modify: `src/styles/main.css`

> **Note:** The spec calls for About, Projects, and Contact panels. Per the design discussion, these are built iteratively — each panel is positioned based on what looks right against the grid. Task 6 establishes the glass panel visual language. This task adds the remaining panels using that same `.panel` class.

- [ ] **Step 1: Add About panel to `index.html`**

Add after `#hero-panel` inside `#content`:

```html
<section class="panel" id="about-panel">
  <h2>About</h2>
  <p>Short bio goes here — skills, background, what you do.</p>
</section>
```

- [ ] **Step 2: Add Projects panel to `index.html`**

```html
<section class="panel" id="projects-panel">
  <h2>Projects</h2>
  <div class="project-card">
    <h3>Project Title</h3>
    <p>Short description of the project.</p>
    <a href="#">View Project</a>
  </div>
</section>
```

- [ ] **Step 3: Add Contact panel to `index.html`**

```html
<nav class="panel" id="contact-panel">
  <a href="mailto:your@email.com">Email</a>
  <a href="https://github.com/mikhailcassar">GitHub</a>
  <a href="https://linkedin.com/in/mikhailcassar">LinkedIn</a>
</nav>
```

- [ ] **Step 4: Add layout and panel positioning styles to `src/styles/main.css`**

Update `#content` to position panels. The exact layout will be refined visually, but start with:

```css
#content {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-areas:
    "hero hero"
    "about projects"
    "contact contact";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 2rem;
  pointer-events: none;
}

#hero-panel    { grid-area: hero; justify-self: center; }
#about-panel   { grid-area: about; align-self: start; }
#projects-panel { grid-area: projects; align-self: start; }
#contact-panel { grid-area: contact; justify-self: center; }

#contact-panel a {
  color: #e0e0e0;
  text-decoration: none;
  margin: 0 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
#contact-panel a:hover { opacity: 1; }
```

- [ ] **Step 5: Verify all panels render and adjust positions visually**

```bash
npm run dev
```

Expected: All four panels (hero, about, projects, contact) render as frosted glass panels over the grid. Adjust grid-template and positioning until the layout feels right. Mouse orbit still works through gaps between panels.

- [ ] **Step 6: Commit**

```bash
git add index.html src/styles/main.css
git commit -m "feat: add about, projects, and contact UI panels"
```

---

## Task 8: Set Up GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the GitHub Actions workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify production build works locally**

```bash
npm run build && npm run preview
```

Expected: `dist/` folder created with `index.html`, bundled JS, and CSS. Preview server shows the same grid + panel as dev mode.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

- [ ] **Step 4: Create GitHub repo and push**

```bash
# Create the repo on GitHub (requires gh CLI)
gh repo create portfolio --public --source=. --remote=origin
git push -u origin main
```

Then enable GitHub Pages in the repo settings:
1. Go to repo Settings → Pages
2. Under "Build and deployment", select "GitHub Actions"
3. The workflow will run automatically on the next push

- [ ] **Step 5: Verify deployment**

After the Actions workflow completes (~1 min), visit the GitHub Pages URL. The grid and hero panel should render identically to local dev.

- [ ] **Step 6: Verify base path is correct**

The `base` path was set in `vite.config.js` during Task 1. Confirm the deployed site loads assets correctly (no 404s in DevTools Network tab). If using a user site (`username.github.io`), update `base` to `'/'` in `vite.config.js`, commit, and push.

---

## Task 9: Final Verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Clean build, no errors, no warnings.

- [ ] **Step 2: Visual check**

Open `npm run dev` and verify:
- Grid renders full-screen with anti-aliased lines
- Mouse drag orbits, scroll zooms
- Hero panel floats over grid with glass blur effect
- Window resize adapts canvas and grid without distortion

- [ ] **Step 3: Add `prefers-reduced-motion` support**

Add this CSS to `src/styles/main.css`:

```css
@media (prefers-reduced-motion: reduce) {
  #bg-canvas {
    /* Render a single frame, then hide canvas interaction cues */
    pointer-events: none;
  }
}
```

And in `src/grid/GridScene.js`, wrap the mouse event listeners in a check:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  canvas.addEventListener('mousedown', ...);
  window.addEventListener('mousemove', ...);
  // ... etc
}
```

This disables mouse orbit/zoom when the user has requested reduced motion. The grid still renders (single static frame) but doesn't respond to interaction.

- [ ] **Step 4: Run Lighthouse audit**

Open the deployed site (or `npm run preview`) in Chrome. Run Lighthouse (DevTools → Lighthouse tab → check Performance and Accessibility → Analyze). Target: Performance > 90, Accessibility > 90. Fix any flagged issues.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass for v1"
git push
```
