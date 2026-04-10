# Portfolio Website — Project Log

## Session 1: 2026-04-10

### What We Built

A portfolio website that looks and feels like a 3D application (inspired by Rhino/TouchDesigner), not a traditional webpage. The 3D grid viewport IS the portfolio.

### Decisions Made

| Decision | Choice | Why |
|---|---|---|
| Framework | None — vanilla JS | A shader background + static content doesn't need React/Vue overhead |
| Bundler | Vite | Instant dev server, GLSL import plugin, industry standard |
| 3D | Three.js | Handles camera/projection/resize — your shader does the visual work |
| Shader approach | Port from TouchDesigner | Your pristine grid shader (Ben Golus technique) already works, just needed TD→WebGL translation |
| Color scheme | Light gray chrome | Dark theme felt generic. Light gray matches Rhino/professional 3D tool aesthetic |
| Font | Monospace (SF Mono/Cascadia/Fira Code) | Reinforces the tech/tool feel |
| Hosting | GitHub Pages (not set up yet) | Free, auto-deploys on push |

### What Was Done (in order)

1. **Scaffolded Vite project** — npm init, installed three + vite-plugin-glsl
2. **Ported vertex shader** — replaced TD functions (TDDeform, TDWorldToProj) with Three.js built-ins (modelMatrix, projectionMatrix, cameraPosition)
3. **Ported fragment shader** — removed TD-specific calls (TDCheckDiscard, TDOutputSwizzle), kept pristineGrid() and axisLine() math unchanged
4. **Created Three.js scene** — PlaneGeometry(200x200) flat on XZ plane, ShaderMaterial with all uniforms, PerspectiveCamera, render loop
5. **Added mouse controls** — spherical coordinate orbit (drag) + scroll zoom, with prefers-reduced-motion support
6. **Built initial dark UI** — glass panels floating over black grid (later scrapped)
7. **Restyled to app-like UI** — complete redesign to Rhino-inspired layout:
   - Menu bar (top): Portfolio / About / Projects / Contact
   - Toolbar (left): orbit/zoom/pan/settings icons
   - Viewport (center): 3D grid with "Perspective" label
   - Parameter panel (right): live sliders controlling shader uniforms
   - Status bar (bottom): X/Y/Z coordinates
8. **Wired parameter controls** — sliders and dropdown in right panel directly modify shader uniforms in real-time

### Files

```
Portfolio/
├── index.html                          # App shell: menubar, toolbar, viewport, panel, statusbar
├── vite.config.js                      # Vite + GLSL plugin, conditional base path
├── src/
│   ├── main.js                         # Entry: creates scene, wires parameter controls to uniforms
│   ├── grid/
│   │   ├── GridScene.js                # Three.js scene, camera, render loop, mouse orbit
│   │   ├── grid.vert.glsl             # Ported vertex shader
│   │   └── grid.frag.glsl            # Ported fragment shader (pristine grid)
│   └── styles/
│       └── main.css                   # App-like UI styling, light gray chrome
├── .github/workflows/deploy.yml       # GitHub Pages auto-deploy (ready, not pushed yet)
└── docs/
    └── superpowers/
        ├── specs/2026-04-10-portfolio-website-design.md
        └── plans/2026-04-10-portfolio-website.md
```

### Key Technical Details

- **Shader porting**: The core GLSL math (pristineGrid, axisLine) transferred unchanged. Only the TD wrapper functions needed replacing.
- **Canvas sizing**: The canvas is sized to its parent container (`#viewport`), not the window, since the app chrome takes up space around it.
- **Vite base path**: Uses `'/'` in dev, `'/portfolio/'` in production builds (conditional on `command === 'build'`).
- **Derivatives extension**: Added `#extension GL_OES_standard_derivatives` to fragment shader for WebGL 1 compatibility.

### How to Run

```bash
cd /Users/mikhailcassar/Documents/PROJECTS/Portfolio
npm run dev        # → localhost:5173
npm run build      # → dist/ folder
npm run preview    # → preview production build
```

### Not Done Yet

- GitHub repo not created / not deployed
- Menu bar items (About/Projects/Contact) don't navigate anywhere yet
- Toolbar buttons are visual only, not functional
- No actual portfolio content (bio, real projects, real contact links)

---

## Roadmap

### Phase 2: Navigation & Structure
1. **Context-sensitive left toolbar** — toolbar content changes based on active menu item (About/Projects/Contact)
2. **Keyboard shortcuts bar** — thin bar inside viewport bottom showing hints like "H Home  R Reset  G Toggle Grid"

### Phase 3: Content
3. **Projects as viewport side panels** — clicking a project opens a floating panel inside the 3D viewport, grid visible behind it
4. **Real content** — actual bio, project descriptions, links

### Phase 4: Interactive Tools
5. **Tools in right panel** — shader params + creative tools (orbit, select, place shape)
6. **Fun interactive tools** — click-to-place randomized 3D shapes (circle/square/cube/sphere), controllable randomization parameters
