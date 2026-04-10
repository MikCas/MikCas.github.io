# Portfolio Website Design Spec

## Context

Mikhail needs a personal portfolio website to showcase his resume and projects. The site should be fast, accessible, and visually distinctive — not a generic template. The visual hook is his custom "pristine infinite grid" GLSL shader (originally built in TouchDesigner), rendered as a full-screen WebGL background. The portfolio UI floats on top of this grid as HUD-style panels rather than a traditional scrolling webpage.

## Tech Stack

| Tool | Purpose |
|---|---|
| **Vite** | Dev server (instant HMR) + production bundler |
| **vite-plugin-glsl** | Import `.glsl` files directly as ES modules |
| **Three.js** | WebGL scene management, camera, projection, render loop |
| **Vanilla HTML/CSS/JS** | All content and UI — no framework |
| **GitHub Pages** | Hosting (auto-deploy via GitHub Actions) |

**No React, Vue, or other UI framework.** The site is a single page with a shader background — frameworks add complexity and bundle size for zero benefit here.

## Architecture

### Layer Model

```
┌─────────────────────────────────────┐
│  UI Layer (z-index: 1)              │
│  HTML/CSS panels: name, about,      │
│  projects, contact — HUD-style,     │
│  glass/frosted aesthetic             │
├─────────────────────────────────────┤
│  3D Layer (z-index: 0)              │
│  Fixed full-viewport <canvas>       │
│  Three.js scene with grid shader    │
│  on a large PlaneGeometry           │
└─────────────────────────────────────┘
```

### Project Structure

```
Portfolio/
├── index.html              # Single entry point
├── src/
│   ├── main.js             # Entry — initializes scene + UI
│   ├── grid/
│   │   ├── GridScene.js    # Three.js scene, camera, render loop, mouse controls
│   │   ├── grid.vert.glsl  # Vertex shader (ported from TD)
│   │   └── grid.frag.glsl  # Fragment shader (ported from TD)
│   └── styles/
│       └── main.css        # All styling
├── public/
│   └── assets/             # Images, thumbnails, resume PDF
├── vite.config.js          # GLSL plugin config
└── package.json
```

## Shader Porting Plan

Source: `/Users/mikhailcassar/Documents/PROJECTS/grid-td/src/glsl/pixel.glsl` and `vertex.glsl`

### What changes

| TouchDesigner | Three.js Equivalent |
|---|---|
| `TDDeform(TDPos())` | `modelMatrix * vec4(position, 1.0)` |
| `TDWorldToProj(pos)` | `projectionMatrix * viewMatrix * pos` |
| `TDCheckDiscard()` | Remove |
| `TDAlphaTest(a)` | `if (a < 0.01) discard;` |
| `TDOutputSwizzle(c)` | Use color directly |
| `uTDMats[TDCameraIndex()].camInverse[3].xyz` | `cameraPosition` (Three.js built-in) |

### What stays the same

The core math ports unchanged:
- `pristineGrid()` — resolution-independent anti-aliased grid using `dFdx`/`dFdy`
- `axisLine()` — per-axis line masks
- All uniform-driven parameters (cell size, subdivisions, line widths, colors, fade)

### Three.js Scene Setup

- **Geometry:** `PlaneGeometry(200, 200)` — large flat quad (200 units extends the grid further to the horizon for a better fade effect)
- **Material:** `ShaderMaterial` with ported vertex/fragment shaders and uniform object
- **Camera:** `PerspectiveCamera` angled down at the plane
- **Controls:** Custom mouse handlers for orbit/rotation (no OrbitControls import to keep it light)
- **Render loop:** `requestAnimationFrame` → `renderer.render(scene, camera)`
- **Plane mode:** `uPlaneMode = 2` (ZX / top-down) for a floor/ground-plane look

### Uniforms (wired via ShaderMaterial)

```js
{
  uPlaneMode: 2, uCellSize: 1.0, uSubdivisions: 4.0,
  uMaxLineWidth: 0.05, uMinWidth: 0.02, uMajWidth: 0.04, uAxisWidth: 0.06,
  uMinColor: [0.2, 0.2, 0.2, 1], uMajColor: [0.4, 0.4, 0.4, 1],
  uBgColor: [0, 0, 0, 1], uMinOpacity: 0.5, uFadeDistance: 50.0,
  uColorX: [1, 0, 0, 1], uColorY: [0, 1, 0, 1], uColorZ: [0, 0, 1, 1]
}
```

## Content Design

### Philosophy

The portfolio is not a traditional scrolling webpage. It is a **UI/interface** — content elements are HUD-style panels floating over the grid environment, similar to a creative tool's interface.

### Build Order (Iterative)

1. Get the grid rendering full-screen with mouse interaction
2. Add one UI panel (name + title) to establish the visual language: font, glass effect, panel style
3. Layer in additional panels one at a time (about, projects, contact), positioning based on what looks right against the grid
4. Each panel uses `backdrop-filter: blur()` for frosted glass, semi-transparent backgrounds

### v1 Content Scope

- **Name/title** — prominent, establishes identity
- **About** — short bio, skills, background
- **Projects** — cards with thumbnail, title, description, link (start with 2-3)
- **Contact** — email, GitHub, LinkedIn as icon links

### NOT in v1

- No blog or video section (future)
- No contact form (just links)
- No dark/light toggle
- No CMS — content in HTML
- No page transitions or routing
- No mobile/touch optimization (desktop-first, mobile is a future pass)
- Accessibility basics (semantic HTML, `prefers-reduced-motion` for the shader) will be included, but full WCAG audit is post-v1

## Deployment

### GitHub Pages via GitHub Actions

1. Create repo (e.g., `mikhailcassar.github.io` or `portfolio`)
2. Add `.github/workflows/deploy.yml` — on push to `main`: install deps, `npm run build`, deploy `dist/`
3. Enable Pages in repo settings pointing at Actions output
4. Site live at `https://mikhailcassar.github.io`

**Workflow:** `git push` → auto-build → auto-deploy (< 1 minute)

Custom domain can be added later via DNS + CNAME file.

## Verification Plan

1. `npm run dev` — grid renders full-screen, anti-aliased, with mouse orbit working
2. Resize browser window — canvas and grid adapt without distortion
3. UI panels render over the grid with glass effect, readable text
4. `npm run build` — produces clean `dist/` with no errors
5. `npm run preview` — production build looks identical to dev
6. Push to GitHub — Actions workflow succeeds, site is live and accessible
7. Lighthouse audit — performance score > 90, accessibility score > 90
