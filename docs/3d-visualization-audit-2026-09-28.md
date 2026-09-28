# 3D Visualization — Build & Verification Record (2026-09-28)

A record of the site's 3D work, in the same shape as the audit files so future passes can find it: what was built and why, the conventions it follows, the traps found along the way, how it was verified, and what's still open. Five commits:

| Commit | What |
|---|---|
| `360db31` | Home hero → live 3D Li + Cs optical-tweezer array (`js/hero3d.js`) |
| `19c7330` | Bloch spheres rotatable on learn-quantum, decoherence-lab, dd-playground (`js/orbit3d.js`) |
| `40bf043` | Tweezer Array Design Lab: true-to-scale 3D array view (`js/tweezer3d.js`) |
| `c95884e` | MOT Designer: 2D cross-section → rotatable 3D MOT |
| `c70f815` | Home hero: pause/play control |

## Why these places, and not others

Saumitra asked for 3D, then asked that it not live on just one page but go "several places where it feels useful." The rule applied: **3D only where the figure is 3D physics that a fixed view flattens**. Nothing sitewide and decorative — no card tilt, parallax scrolling or page transitions. That matches the note in `styles.css` that the old particle animation was removed because it "read as generic AI/tech chrome."

Survey of every page with a 3D-ish figure before choosing:

| Page | Existing figure | Decision |
|---|---|---|
| `home.html` | Hidden 2D particle canvas + Li/Cs Bohr-model cards | 3D tweezer-array hero (Li/Cs cards kept as the no-WebGL fallback) |
| `learn-quantum.html` | 4 Bloch spheres (one shared projection, fixed 30°/36°) | Rotatable |
| `decoherence-lab.html` | 4 SVG section spheres + 1 small hero sphere | Section spheres rotatable; hero sphere left fixed (decorative, inside `aria-hidden`) |
| `dd-playground.html` | FID and CPMG spin-ensemble spheres | Rotatable, one linked view |
| `polarimetry.html` | Poincaré spheres | **No change** — already Plotly 3D and rotatable |
| `tweezer-designer.html` | 2D top view of the array only | New true-to-scale 3D view + toggle |
| `mot-designer.html` | 2D cross-section (two beam pairs) | Replaced with rotatable 3D MOT |
| rydberg-calculator, laser-cooling, others | 2D schematic diagrams | Left 2D; 3D wouldn't add understanding |

## Architecture

- **No Three.js or other 3D library.** Raw WebGL 1 (hero, tweezer view) and Canvas 2D / SVG (spheres, MOT). No new CDN dependency and no render-blocking weight, in keeping with the performance audits. `hero3d.js` is about 30 KB with comments (roughly 9 KB gzipped) versus roughly 170 KB gzipped for Three.js.
- **Nothing added to `main.js` or `styles.css`.** Each file is opt-in, loaded only by the pages that use it, so there is no sitewide cache bump. Styles are page-local `<style>` blocks.
  - `js/hero3d.js?v=2`: home.html only.
  - `js/orbit3d.js?v=1`: learn-quantum, decoherence-lab, dd-playground, tweezer-designer, mot-designer.
  - `js/tweezer3d.js?v=1`: tweezer-designer only.
- **`orbit3d.js` conventions:**
  - The lab frame has z up. `AMO3D.project(view, x, y, z)` returns `[X right, Y up, D toward viewer]`: azimuth rotates about z, and el > 0 looks down from above.
  - With `az = π/6, el = π/5` it reproduces exactly the fixed projection every site Bloch sphere used before. Each figure's default view is identical to its old picture; only depth cues were added (far halves fainter, and a vector pointing away drawn at half opacity).
  - Input: pointer drag; on touch, `touch-action: pan-y`, so sideways swipes rotate and vertical swipes still scroll the page. Arrow keys work, Shift for bigger steps, and Home or double-click resets. A one-time hint ("drag to rotate · double-click to reset", or "swipe sideways to rotate" on touch-only devices) hides on first use.
  - Accessibility: it appends instructions to an existing `aria-label` rather than replacing it, so decoherence-lab's descriptive labels survive. Mouse `mousedown` is `preventDefault`ed so a drag doesn't leave a focus ring; keyboard users still reach the figure with Tab.
  - Several elements can share one view object (dd-playground's two spheres).
- **Theme-aware.**
  - Dark theme: additive glow.
  - Light theme: ink outlines on the graph-paper background, the "Lab Notebook" look.
  - Theme toggles re-render live through a `MutationObserver` on `data-theme`.

## Per-feature record

### Home hero (`360db31`, pause in `c70f815`)
- **Sequence (about a 12 s loop):**
  1. Li and Cs load stochastically, at roughly 58% per site, from a dual-species MOT cloud into a 10 × 7 array.
  2. A fluorescence image flashes every loaded atom.
  3. Mobile tweezers rearrange each species into a defect-free 6 × 5 block. They route through the gaps between static traps: half-pitch lanes, then along the row, then along the column. Extra atoms are released and fall under gravity.
  4. Each Li is carried onto its Cs neighbour, making Li–Cs pairs "toward LiCs molecules."
- **Scene details:**
  - Species are assigned by column (even columns Li, odd columns Cs), in the Li-blue and Cs-orange of the cards the hero replaced.
  - Beams are Gaussian envelopes w(y) = w₀√(1+(y/z_R)²), exaggerated for visibility.
  - The caption reports the real shot, for example "Imaging: 44 of 70 tweezers loaded", or "2 sites short this shot" when loading comes up short.
  - The first cycle is chosen to be defect-free; later cycles are fully random.
- **Behaviour:**
  - `prefers-reduced-motion` gets one static frame of the assembled array.
  - The loop pauses offscreen (IntersectionObserver) and in hidden tabs.
  - Adaptive quality: if the first 90 frames average under 30 fps, canvas resolution drops ×0.72, at most twice.
  - Without WebGL, or on context loss, `html.hero3d-on` is removed and the original Li/Cs cards show.
- **Removed dead code.** The legacy `#hero-canvas` drifting-dots script had kept a `requestAnimationFrame` loop running on a `display:none` canvas.
- **Pause control (`c70f815`).** A real `<button>` with `aria-pressed`, per WCAG 2.2.2, which requires a way to stop auto-playing motion that lasts over 5 s. A paused hero stays paused when scrolled away and back, and the button is hidden under reduced motion.

### Bloch spheres (`19c7330`)
- **learn-quantum.** `bsProject()` reads a per-canvas view from `BS_VIEWS`, and `drawBloch()` remembers its last arguments in `BS_LAST`, so gate trails and measurement axes rotate with the sphere. The Rabi precession sphere uses its own view. No state or physics math changed.
- **decoherence-lab.**
  - The chrome used to be ellipses precomputed for one tilt; it is now re-projected from 3D when the view changes.
  - The ensemble-average trail now stores 3D Bloch vectors and re-projects them every frame. It used to store screen points, which would have left the trail behind at the old angle.
  - Under reduced motion, rotating re-renders the still frame without advancing the simulation.
  - The RK4 optical-Bloch integrator and every Γ, γ⊥, Δ value are untouched.
- **dd-playground.** FID and CPMG share one view, so they're always compared from the same angle. Looking straight down shows the equatorial spin fan-out that the old side view flattened.

### Tweezer Array Design Lab (`40bf043`)
- **Toggle.** Section 03 gets a **3D view** (the default) and the original **Top view**.
- **True to scale.** Every beam is drawn from the page's own numbers (w₀ = 0.52λ/NA, z_R = πw₀²/λ, d, Nx, Ny) as its Gaussian envelope over ±3 z_R. Atoms sit at focus, with a focal-plane grid and a scale bar, and the caption prints the exact values used.
- **What it shows.** At d = 5 μm (d/w₀ ≈ 6) the hourglasses are separate. At d = 2 μm, where the page already warns "marginal — verify crosstalk," the beams visibly merge away from focus.
- **Rendering.** WebGL, rendering on demand only (input change, drag, resize, theme), with no idle animation loop; it draws one small mesh once per site. In dark mode each beam gets a rim term so the hourglass silhouettes read against the glow. The camera fits the rotated content box, not a bounding sphere.
- **Export buttons.** The auto "Export PNG/SVG" buttons belong to the top-view canvas, so they are hidden while 3D is showing; the 3D canvas carries `data-export-ready="true"`.
- **Fallback.** Without WebGL the page shows only the top view, exactly as before.
- The route panel and its anchors (the site's reference implementation) are untouched.

### MOT Designer (`c95884e`)
- It uses the same canvas and the same `updateMOTViz(κ, α, T)` hook as before, so the calculator still drives the cloud.
- **Physics encoded in the picture:**
  - Anti-Helmholtz field B = G(−x/2, −y/2, z) with G = the dB/dz slider, so the axial gradient is twice the radial one and of opposite sign. Arrow lengths follow the slider.
  - The coil current arrows are drawn consistent with that sign: the top coil runs counter-clockwise seen from +z, the bottom coil clockwise.
  - The cloud is compressed along the coil axis: κ_z = 2κ_r gives σ_z = σ_r/√2. The calculator's σ is the axial one, because its κ uses dB/dz; the readout now shows both.
  - Rings show each beam's circular polarization about its own propagation direction. The **axial pair has the opposite handedness to the four radial beams**, which is the convention-independent statement.
- A caption under the figure says the geometry is schematic.

## Traps found, and how each was handled

These are the kinds of thing that break the next visual change, so they're now also listed in `CLAUDE.md`.

1. **The global Chart.js canvas cap** `canvas:not(#id…){max-height:280px}` has 15 ids of specificity, so no class selector can beat it. Fix: `max-height: none !important`, scoped to the new canvases.
2. **`initExportButtons()`** injects "Export PNG" before every canvas inside a section. Fix: the hero's canvas id `hero-canvas-3d` contains `hero-canvas`, which the existing skip regex already matches; the tweezer canvas uses `data-export-ready="true"`.
3. **An absolutely positioned `<canvas>` rendered at its default 300 × 150.** `left`/`right` don't stretch a replaced element. Fix: explicit width and height.
4. **An author `display:` rule overrides the HTML `hidden` attribute**, so the tweezer view toggle would have silently hidden nothing. Fix: a scoped `[hidden]{display:none!important}`.
5. **Existing SVG `aria-label`s would have been overwritten** by the rotate instructions. Fix: append instead of replace.
6. **A mouse focus ring appeared on SVG spheres after dragging.** Fix: `mousedown` `preventDefault`; keyboard focus is unaffected.
7. **A `const` reassignment in the MOT draw loop** would have thrown on every frame. Caught before running.
8. **The hero's retina check compared canvas width to the phone cutoff**, capping every desktop at 1.5×. Fix: compare viewport width.
9. **The hero's fit ignored the grid's rotated footprint**, so the array ran off-screen at about 1150 px. Fix: fit the rotated extent, nudge into the column gap, then shrink if still needed.
10. **The tweezer view's bounding-sphere fit** left the array a fifth of the frame. Fix: project the box corners.
11. **Dark-mode additive beams washed into one glow**, hiding the beam shape the view exists to show. Fix: a rim term plus opacity scaled by array size.

## Verification method (reusable)

- **Rendered, not just parsed.** Headless Chromium (Playwright) in the cloud workspace, with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` for software WebGL, against a local static server with external requests blocked.
- **Chart.js stub.** With the CDN blocked, pages throw `Chart is not defined` and the rest of their inline script never runs. That hid the Rabi sphere's initialization in the first test run, and it fails the original pages identically. A minimal `window.Chart` stub injected with `addInitScript` removes that noise.
- **Checks run:**
  - Screenshots of every hero phase in both themes at 390, 1024, 1150, 1280 and 1440 px.
  - Every sphere compared original → new default → after a real mouse drag → after Home.
  - The tweezer view at normal and tight spacing, then dragged, then toggled.
  - The MOT view default, then dragged at maximum gradient.
  - Pause, including after scrolling away and back; reduced-motion; a forced no-WebGL fallback.
  - Theme toggled live.
  - Zero page errors, no horizontal scroll at 390 px, and learn-quantum's gate buttons and measurement exercised.
  - Tag balance, duplicate ids, JSON-LD and inline-script syntax diffed against the original files; `tests/formula_regression.py` 11/11.
- **Limits.**
  - Software rendering runs at roughly 5–10 fps, so real-GPU smoothness was not observed, and adaptive quality always stepped down in testing.
  - Touch was verified only as pointer semantics (`pan-y`), not on a physical phone.
  - `npm` access to Chart.js was blocked by workspace policy, hence the stub rather than the real library.

## Open items / decisions for Saumitra

1. **Physics check:**
   - MOT: the handedness rings (axial opposite to radial) and the field and current sign.
   - Hero: species by column, about 58% loading, Li carried onto Cs rather than the reverse, and the "toward LiCs molecules" wording.
2. **Look on real hardware** (Mac and phone): smoothness, brightness, cycle speed.
3. **Pre-existing, same accessibility gap as the hero (not changed):**
   - dd-playground's FID/CPMG animation and learn-quantum's looping animations run indefinitely with no pause control and no reduced-motion handling.
   - decoherence-lab has a reduced-motion still frame but no pause control.
   - WCAG 2.2.2 applies to all of them.
4. **Pre-existing colours (not changed).**
   - learn-quantum's spheres draw `#1e3a5f` lines on a transparent canvas, so in dark theme they're faint.
   - dd-playground, the Rabi sphere and the MOT canvas use a hard-coded cream background in both themes.
5. **By design:** on phones you can rotate but not tilt, since vertical swipes stay as page scroll. decoherence-lab's small hero sphere stays fixed.

## Suggested next pass
- The pause and reduced-motion gap in item 3: a small shared control would cover all three pages.
- Theme-aware sphere colours (item 4), if dark mode matters for those pages.
