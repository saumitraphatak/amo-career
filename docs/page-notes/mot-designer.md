# pages/mot-designer.html

**Purpose:** MOT parameter calculator — damping, spring constant, capture velocity, detuning optimization, species comparison, and the MOT-to-experiment cooling cascade.

## Flow
1. Page hero — "Build 03."
2. **01 MOT Calculator** — damping α, spring κ, ω_MOT, capture velocity vs detuning/saturation.
3. **02 Detuning Optimization** — live tradeoff chart.
4. **03 Species at a Glance** — 5-species comparison table (Rb87, Cs133, Na23, Li7, K39).
5. **04 From MOT to Experiment — The Cooling Cascade** — visual pipeline: Atomic Source → 3D MOT → cMOT → Gray Molasses/PGC → Tweezer/Lattice → Experiment.
6. **05 Physics Reference**, **06 References**.

## Review outcome: changed (significant)
Page was titled **"MOT & Magnetic Trap Designer"** but had zero magnetic-trap content anywhere — no Ioffe-Pritchard calculator, no trap frequencies, no Majorana loss warning, no evaporation parameter. The cooling cascade goes straight from MOT to tweezers/lattice, never mentioning magnetic trapping. This wasn't just the page title: the home-page tool card, `llms.txt`, `llms-full.txt`, `README.md`, and `CLAUDE.md` all described the phantom Ioffe-Pritchard feature in detail.

**Decision: rename, don't build.** Matches the site's tweezer-centric lab focus (author's own lab uses tweezers, not magnetic traps for BEC). Renamed to **"MOT Designer"** everywhere: page `<title>`/og/twitter/JSON-LD/h1/footer credit, home.html tool-card name + description + tags, `NAV` label in `main.js`, the global-search keyword string (dropped "Ioffe Pritchard Majorana evaporation", kept genuinely relevant terms), `llms.txt` entry, `llms-full.txt`'s "TOOL 6" section (replaced the fabricated Ioffe-Pritchard formulas with the real section list), `README.md` table row, and `CLAUDE.md` (3 spots + physics summary).

This is the canonical "no phantom features" example — see `docs/site-philosophy.md` §3.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark (this page's wrapper div was missing its usual `<!-- /page-wrap -->` closing comment — traced the real nesting depth to confirm it was actually balanced and closing at the correct point before retagging, rather than a genuinely unclosed tag). Added `scope="col"` to 7 table column headers; wired `for=`/`id` on 5 label/input pairs; added `aria-hidden="true"` to 4 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 6 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 6 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.


## 3D visualization update (2026-09-28)
The "Live MOT Visualization" was a 2D cross-section; it is now a rotatable 3D MOT (`js/orbit3d.js`), same canvas and same `updateMOTViz(κ, α, T)` hook from the calculator. It shows six beams with propagation arrows, anti-Helmholtz coils with current arrows, the quadrupole field B = G(−x/2, −y/2, z) with arrow length following the dB/dz slider (axial gradient 2× radial, opposite sign; coil currents drawn consistent with that sign), a cloud compressed along the coil axis (κ_z = 2κ_r ⇒ σ_z = σ_r/√2; the calculator's σ is the axial one since its κ uses dB/dz — the readout now shows both), and rings for each beam's circular polarization about its own direction, with the axial pair opposite in handedness to the four radial beams. Geometry is schematic and says so in a short caption under the figure.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 13 labels rendered differently after the fix, e.g. "DAMPING COEFF. Α" → "DAMPING COEFF. α"; "SPRING CONSTANT Κ" → "SPRING CONSTANT κ". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight run 3): 3D MOT follows the theme, can be paused, and its label matches the calculator
- **Dark theme.** The live 3D MOT canvas painted cream `#faf5e9` in the (default) dark theme. It now picks a `PAL.light` / `PAL.dark` palette per frame (light = the original inks; dark: coils `#f59e0b`, B arrows `rgba(96,165,250,…)`, axial/radial rings `#a78bfa` / `#2dd4bf`, paper `--bg-card`). The key under the canvas uses classes (`.mk-coil` etc.) so its colours match the canvas in both themes; the cloud label too.
- **Pause control (WCAG 2.2.2).** The animation was a forever `requestAnimationFrame` loop with no pause. It now runs through `AMOMotion.loop` (`js/motion.js?v=1` added to the page): Pause button under the canvas, stops offscreen, still frame under reduced motion. `render(false)` repaints without stepping the atoms, used for theme toggles, drags and resizes while paused; a calculator change while paused snaps the cloud to its new size.
- **Label vs calculator (bug).** The canvas label read "σ_z ≈ 100 μm · σ_r ≈ 141 μm" at the default settings while the "Cloud radius σ" card read 58 μm, for two reasons: `compute()` passed the Doppler-limit T_D to `updateMOTViz` while the card uses the steady-state T_MOT = (ħΓ/8k_B)(1 + s + 4Δ²/Γ²)/|Δ/Γ| at the chosen detuning, and the label printed the drawn size, which is clamped to 100–680 μm. The viz now gets T_MOT (so it follows the same σ as the card, as its comment intended), the label prints the calculator's σ_z and σ_r = √2 σ_z, and adds "drawn at display limit" when the drawing is clamped. Checked: defaults 58/58, dB/dz = 2 G/cm 158/158, Δ = 40 MHz 224/224 (card/label, μm).
- The σ card's formula line said √(k_BT_D/κ) while its code uses T_MOT; it now says √(k_BT_MOT/κ). Regression test `test_mot_viz_matches_calculator_sigma` guards both.
- **Checks.** `smoke.js` 0 new problems; Playwright: corner pixel dark/light, animates and holds still when paused, reduced-motion starts on "▶ Play animation", toggle and drag repaint while paused, no page errors, no overflow at 390 px. Screenshots dark 1280 and light 390 reviewed.
