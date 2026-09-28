# pages/release-recapture.html

**Purpose:** "Single-atom Temperature" — release-recapture thermometry: forward-simulate survival probability vs release time at several candidate temperatures, to compare against a measured curve by eye.

## Flow
1. Route panel — "Read the survival curve before worrying about the derivation" + 4 cards (see below).
2. **What the Survival Curve Means** (concept) → **Run the Monte Carlo Thermometer** (the actual forward simulator: pick species/trap params + a list of candidate temperatures, see generated survival curves + trajectory snapshot) → **Species Polarizability Data** (D1/D2 transition table) → **Assumptions & Failure Modes**.
3. Sources.

## Review outcome: changed
Route-card 03 said "Fit temperature — Use experimental survival points to infer a temperature for the assumed trap potential." **That feature doesn't exist.** The tool only runs forward simulations at temperatures *you* pick; there is no UI to enter real experimental data points and have the tool fit/infer a temperature. Meanwhile the real "Species Polarizability Data" section had zero card representation.

Fixed by relabeling card 03 to describe Species Polarizability Data instead, and softened the intro paragraph's "measure survival, and fit temperature" to "...and compare against simulated curves to estimate temperature." Also found and fixed the same overclaim in `main.js`'s `PAGE_PLAYBOOKS` entry ("Fit temperature from survival" → "Estimate temperature from survival"). Second instance of the "no phantom features" pattern — see `docs/site-philosophy.md` §3. (First was mot-designer's magnetic-trap claims.)

Note: `tof-calculator.html`'s "Fit Temperature from Data" section is **not** a phantom feature — that one genuinely does a linear-regression fit of σ² vs t² from a real data table. Don't confuse the two pages.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 11 table column headers; wired `for=`/`id` on 9 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 8 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 8 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.

## Cross-page consistency re-audit (2026-09-18)
`BreadcrumbList` JSON-LD named this page's category "Measure & Cool" (the category's pre-rename name), while the hero eyebrow and NAV dropdown already said "Trap, Image & Cool." Corrected the breadcrumb to match. See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its page-footer signature line used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## Trajectory snapshot is now 3D (2026-09-28)
The "Atom Trajectory Snapshot" canvas (`#trajCanvas`) now draws through `js/cloud3d.js?v=1` (plus `js/orbit3d.js?v=2`). It is a rotatable, true-to-scale 3D view of the same 120 sampled atoms, driven by the same τ slider and Play button.

- **What's drawn.** The tweezer's 1/e² envelope w(z) = w₀√(1 + z²/z_R²), with the waist and ±z_R rings, the gravity direction, and a scale bar.
- **Scope.** The view is ±8 w₀ around the trap. The caption shows τ and P_cap.
- **Two bugs fixed in the old 2D drawing.**
  1. The y coordinate was never propagated (it used `y0` instead of `y0 + vy·τ`), so the snapshot's recapture test didn't match `runMC()`.
  2. The vertical axis was flipped, so released atoms fell *upward* on screen.
- **New shared check.** Both are fixed by a single `trajAtomAt(a, τ, tp)` helper that uses the same recapture test as `runMC()`. Tested: over 120 atoms, the snapshot's recaptured fraction matches a 20,000-atom `runMC()` at the same τ within sampling noise (e.g. 0.10 vs 0.071 at 0.45 ms; σ ≈ 0.024).
- The old canvas also had a hard-coded cream background in dark mode. The new view is theme-aware.
- **Pre-existing.** After a run, at 390 px, `.sum-table` / `.chart-card` overflow the page to 393 px.
