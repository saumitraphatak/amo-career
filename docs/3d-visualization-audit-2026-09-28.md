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

## Globes and the time tower (second pass, same day)

Saumitra asked for "3D globe type" views on the Group Finder, the Paper Roadmap and the Industry Map, "wherever it fits and however it's useful". Two of the three pages hold geographic data, so they got globes. The Roadmap's data is not geographic, so it got a time tower instead of a forced map.

### Shared globe: `js/globe3d.js?v=1`
`AMO3D.globe(canvas, {points, onPick, pauseButton, center, clusterDeg, clusterTitle})` draws a Canvas-2D orthographic dotted Earth and rotates it with `AMO3D.orbit`.

- **Land data.** Natural Earth 1:50m land polygons (public domain), from the `world-atlas` `land-50m` TopoJSON. They are rasterised once to a 1° bitmask (180 × 360 bits; row 0 = 89.5°N, col 0 = 179.5°W) and embedded as 10.8 KB of base64 (8.1 KB decoded). There is no map service, no tiles and no runtime download.
- **How the mask was built.** The TopoJSON was fetched in the desktop browser pane, because package registries and the container proxy were blocked. It was rasterised in-page with an even-odd scanline fill and carried over in two halves. The second half was re-sent run-length-encoded after a transcription error, then checked for:
  - total land cells = 18,698;
  - an identical hash on both sides;
  - spot checks: land at Kansas, Boston, the UK, the Sahara, Australia and Antarctica; ocean at the mid-Atlantic, the Pacific and the Caspian.
- **Dots.** Land dots have uniform density on the sphere (lat step 1.6°, lon step scaled by 1/cos lat, staggered rows). There is limb darkening, a near-side 30° graticule, and theme-aware palettes (dark: navy ocean with a halo; light: parchment).
- **Markers.** Markers cluster greedily by great-circle distance: `clusterDeg` defaults to 0.35° (about 40 km); qc-landscape uses 1°. Hover shows a tooltip. Clicking a single marker calls `onPick`; clicking a cluster pins a chooser list. `setPoints(list, {focus:true})` animates to the centroid when the points are regional (mean resultant length above 0.35).
- **Motion.** Auto-spin at 0.11 rad/s resumes 6 s after interaction. It has a pause button (WCAG 2.2.2), is off under reduced motion, and pauses offscreen and in hidden tabs.

### Group Finder globe (`amo-groups.html`)
- **Scope.** All 99 Featured Directory groups, driven by the page's own `GROUPS` array and filters. Picking a group opens the existing group panel.
- **Phantom feature fixed.** The home card's "interactive world map … click any marker" had no map behind it. Now it does.
- **Tested.**
  - Boston shows a cluster of 6 (Harvard / MIT). Picking Lukin Lab opens the panel.
  - The Europe filter gives 37 and the Asia filter 15, matching the directory, and the globe re-centres.
  - This was re-run after the clustering change.

### Industry Map globe (`qc-landscape.html`)
- **Scope.** 27 companies and labs, one per company card in the six Platform Deep Dive tabs (verified 27/27 mapped, none missing). They sit at the city-level HQ or main hardware site, coloured by platform. Clicking opens the tab and flashes the card.
- **Location sources, checked September 2026.**
  - D-Wave's HQ move to Boca Raton (announced 2026-01-27; Burnaby hardware centre used for the marker): [D-Wave press release](https://www.dwavequantum.com/company/newsroom/press-release/d-wave-selects-boca-raton-for-new-corporate-headquarters-and-u-s-r-d-facility/).
  - Infleqtion's Louisville, CO global HQ (August 2026): [Denver Gazette](https://www.denvergazette.com/2026/08/19/colorados-infleqtion-opens-new-hq-as-it-races-to-commercialize-quantum/) and [BizWest](https://bizwest.com/2026/08/19/infleqtion-consolidating-at-expanded-louisville-hq/).
  - Atom Computing, Berkeley HQ with a Boulder centre: [Wikipedia](https://en.wikipedia.org/wiki/Atom_Computing) and [Quantum Insider 2022](https://thequantuminsider.com/2022/09/28/silicon-valley-up-start-atom-computing-chooses-colorado-to-build-next-generation-quantum-computers/).
  - Pasqal, Palaiseau global HQ: [pasqal.com/about-us](https://www.pasqal.com/about-us/).
  - Quandela, Massy factory: [Quandela](https://www.quandela.com/about-us/newsroom/quandelas-first-quantum-computer-manufacturing-facility/).
  - Quantum Brilliance: [about us](https://quantumbrilliance.com/about-us/).
  - Oxford Ionics, part of IonQ since September 2025: [IonQ investors](https://investors.ionq.com/news/news-details/2025/IonQ-Completes-Acquisition-of-Oxford-Ionics-Rapidly-Accelerating-Its-Quantum-Computing-Roadmap/default.aspx).
  - Quantinuum, Broomfield: [Wikipedia](https://en.wikipedia.org/wiki/Quantinuum).
  - Equal1, Dublin (a UCD spin-out): [UCD](https://www.ucd.ie/newsandopinion/news/2026/january/15/ucdspin-outraises515minfundingtorolloutquantumcomputers/).
  - eleQtron, Siegen: [Universität Siegen](https://www.uni-siegen.de/en/news/millions-in-funding-for-university-spin-off).
  - QuiX Quantum, Enschede: [QuiX](https://www.quixquantum.com/about).
  - The remaining sites are long-established: IBM Research Yorktown Heights, Google Quantum AI Santa Barbara, Rigetti Berkeley, IQM Espoo, Alice & Bob Paris, IonQ College Park, AQT Innsbruck, QuEra Boston, Intel Hillsboro, Quantum Motion London, SQC Sydney/UNSW, PsiQuantum Palo Alto, Xanadu Toronto, Microsoft Redmond, Argonne (Lemont, IL) and QuTech (Delft).

### Paper Roadmap time tower (`js/syllabus3d.js?v=1`, `paper-syllabus.html`)
- **Layout.** Height is publication year on a linear scale with decade rings. The four faces are the four stage tabs, with page order running left to right on each face. Keystones are ringed.
- **Data.** Read from the 55 `.paper-card` elements at load, so it can't drift from the list.
- **Controls.** Type chips dim other papers. A "papers per decade" line is computed from the same data. Clicking a paper opens the stage tab, scrolls to the card and flashes it; on touch, the first tap shows the card with a button.
- **Why a tower, not a globe.** Papers have no geography. Year × stage is the information the page actually holds.

### Drag direction changed: `orbit3d.js?v=2`
The first version rotated the view *with* the pointer, so the surface under the cursor moved the opposite way. That felt wrong once a globe made it obvious. Drag is now "grab": the surface follows the pointer. The arrow keys were swapped to match. Tested: the front point's screen X goes from 0 to +0.43 after a rightward drag.

All eight pages that load `orbit3d.js` now reference `v=2`: the five from the first pass plus amo-groups, qc-landscape and paper-syllabus. The sphere, tweezer, MOT and hero-pause tests were re-run with no errors.

### Verification (this pass)
- **Rendered-browser runs** (Chromium with SwiftShader WebGL; external requests blocked; Chart.js stubbed) in both themes at 1280 and 390 px:
  - no page errors;
  - no horizontal overflow;
  - hover, click-through and filter tests as above;
  - reduced motion: pause buttons hidden and frames static;
  - touch tap on the tower pins the card, and its button reaches the right paper.
- **Static checks.** Tag balance unchanged against the originals; JSON-LD parses; every inline script and the three JS files pass `node --check`.
- `tests/formula_regression.py`: 11/11.

## Third pass: physics figures, the site constellation and pause controls (same day)

Saumitra picked five items from a shortlist of places where 3D adds information: the photon collection cone, the cavity mode with an atom, the site constellation, 3D ballistic expansion, and pause controls for the older looping animations. He did not pick the Zernike wavefront surface or the Rydberg blockade spheres; they remain ideas.

Four new opt-in helpers were added, each loaded only by its own page(s):

| File | Pages | What it does |
|---|---|---|
| `js/collection3d.js?v=1` | imaging-calculator | Atom emission pattern, collection cone and objective; Monte Carlo photon stream |
| `js/cavity3d.js?v=1` | cavity-qed | Standing-wave TEM₀₀ mode drawn as nested isosurfaces, plus an atom |
| `js/sitemap3d.js?v=1` | start-here | Constellation built from the page's own lists |
| `js/cloud3d.js?v=1` | release-recapture, tof-calculator | Generic true-to-scale renderer for released atoms (the pages do the physics) |
| `js/motion.js?v=1` | learn-quantum, dd-playground, decoherence-lab | `AMOMotion.loop()`: pause button, offscreen stop, paused-time-aware timestamps, reduced-motion still frame |

### What each adds, and what was checked
- **Photon collection (imaging-calculator).**
  - The panel shows η for three emission patterns: isotropic (the calculator's own `collectionGeo`), dipole ⊥ axis (equal to σ± with the quantization axis along the objective), and dipole ∥ axis.
  - All three closed forms matched a 10⁶-sample Monte Carlo at four NAs to within 0.1%.
  - The calculator itself is unchanged.
  - Fixed a wrong number in the page's prose: "NA 0.95 captures ~26%" is now ~34%.
- **Cavity mode (cavity-qed).**
  - Position-dependent coupling: g = g₀cos(kx)e^(−r²/w₀²) and C ∝ g². It uses the calculator's own g₀ and C via `window.CQED_LAST` and the `cqed:update` event.
  - Schematic along the axis (9 antinodes drawn); the real count 2nL/λ appears in the caption.
  - It lives inside section 02, so the route cards stay 1:1 with the sections.
- **Site constellation (start-here).**
  - 31 pages and 6 paths, all read from the page's own lists; all 24 path steps resolve to a star.
  - Hover shows a card; click opens the page (tested: it navigates).
- **Ballistic expansion.**
  - Release-recapture: the snapshot is now 3D and true to scale, with the tweezer envelope drawn. Two old 2D bugs were fixed: y was not propagated, and gravity was drawn upward. A shared `trajAtomAt()` now matches `runMC()` within sampling noise.
  - TOF: a 500-atom sampled cloud, coloured by speed, with a falling-frame / lab-frame toggle. Fixed a silent bug: the old animation's hook read `window.ATOMS` (a top-level `const`, so undefined) and never followed the sliders. Also fixed the invisible "1 mm" label and the endless loop with no pause. Tested: σ at 30 ms and 100 μK matches the formula (2.93 vs 2.934 mm).
- **Pause controls.**
  - Covered: 5 loops on learn-quantum, the FID/CPMG loop on dd-playground, and the shared RK4 loop on decoherence-lab (buttons in the hero and in each section header).
  - Tested: each loop animates, freezes on Pause and resumes. Under reduced motion each starts still, and Play works.
  - These loops also no longer run while offscreen; before, all seven ran forever.
  - This closes open item 3 below.

### Verification (this pass)
- **Rendered-browser runs.** Chromium, SwiftShader, external requests blocked, Chart.js stubbed. Dark and light themes at 1280 px, dark at 390 px. No page errors.
- **Reduced motion.** Static frames, and pause buttons hidden where nothing would move.
- **Mobile overflow.** No new horizontal overflow. Three pre-existing mobile overflows were found and left alone (listed below).
- **Static checks.** Tag balance unchanged against the originals; JSON-LD parses; inline scripts and the five new files pass `node --check`; no duplicate ids.
- `tests/formula_regression.py`: 11/11.

## Open items / decisions for Saumitra

1. **Physics check:**
   - MOT: the handedness rings (axial opposite to radial) and the field and current sign.
   - Hero: species by column, about 58% loading, Li carried onto Cs rather than the reverse, and the "toward LiCs molecules" wording.
2. **Look on real hardware** (Mac and phone): smoothness, brightness, cycle speed.
3. **Closed in the third pass (see above).** Was: same accessibility gap as the hero:
   - dd-playground's FID/CPMG animation and learn-quantum's looping animations run indefinitely with no pause control and no reduced-motion handling.
   - decoherence-lab has a reduced-motion still frame but no pause control.
   - WCAG 2.2.2 applies to all of them.
4. **Pre-existing colours (not changed).**
   - learn-quantum's spheres draw `#1e3a5f` lines on a transparent canvas, so in dark theme they're faint.
   - dd-playground, the Rabi sphere and the MOT canvas use a hard-coded cream background in both themes.
5. **By design:** on phones you can rotate but not tilt, since vertical swipes stay as page scroll. decoherence-lab's small hero sphere stays fixed.

6. **Globe and tower follow-ups (second pass).**
   - The Europe markers on the Industry Map globe sit close together at the default size. Zoom (wheel or pinch) would help, but it is not built.
   - Do you want AWS (Pasadena) or Anderon (Albany) on the Industry Map globe? They are mentioned elsewhere on the page but have no deep-dive card, so they were left off to keep the globe 1:1 with the cards.

7. **Third-pass follow-ups.**
   - imaging-calculator's two "η ≈ 8% / 5%" mentions look like totals including T·QE. They should say which η they mean.
   - Pre-existing mobile overflow at 390 px: imaging-calculator (`.fidelity-badge` / `.noise-table`, 501 px), cavity-qed (`.sys-table`, 409 px) and release-recapture after a run (`.sum-table`, 393 px).
   - Unbuilt ideas from the shortlist: the Zernike wavefront as a 3D surface, and 3D blockade spheres on the Rydberg page.

## Suggested next pass
- The pause and reduced-motion gap in item 3: a small shared control would cover all three pages.
- Theme-aware sphere colours (item 4), if dark mode matters for those pages.
