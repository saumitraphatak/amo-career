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
