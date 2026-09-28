# pages/tof-calculator.html

**Purpose:** "MOT Temperature" — ballistic expansion / time-of-flight thermometry.

## Flow
1. Page hero.
2. **5 numbered sections, no route-panel**: 01 Atom & Temperature (inputs) → 02 Cloud Expansion σ(t) (chart) → 03 Fit Temperature from Data (**real** σ² vs t² linear regression from a data table) → 04 Cooling Limit Reference → 05 References.

## Review outcome: approved, no changes
Clean linear calculator flow: set up → visualize → fit real data → contextualize against physical limits → references. Confirmed section 03's "Fit Temperature from Data" is a genuine linear-regression fit (unlike release-recapture.html's phantom fitting claim — this page actually does what it says).


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 4 table column headers; wired `for=`/`id` on 7 label/input pairs; added `aria-hidden="true"` to 3 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 6 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 6 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.

## Cross-page consistency re-audit (2026-09-18)
`BreadcrumbList` JSON-LD named this page's category "Measure & Cool" (the category's pre-rename name), while the hero eyebrow and NAV dropdown already said "Trap, Image & Cool." Corrected the breadcrumb to match. See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## TOF expansion is now 3D (2026-09-28)
The "Live TOF expansion" strip is replaced by a rotatable 3D cloud (`#tofCloudCanvas`, from `js/cloud3d.js?v=1` plus `js/orbit3d.js?v=2`).

- **The sample.** 500 atoms, with positions drawn from N(0, σ₀²) and velocities from N(0, k_BT/m) per axis, so σ(t)² = σ₀² + (k_BT/m)t². Colour is speed (blue slow → orange fast), which shows why the edge of the cloud is the hot tail.
- **Controls.**
  - Frame toggle: "Falling with the cloud" (default) or "Lab frame", which shows gravity, the release point and the distance fallen, ½gt².
  - The expansion plays 0 → t_max in 3 s, holds, and repeats.
  - There is a Pause button (WCAG 2.2.2). Under reduced motion it shows a still frame at t_max. It is paused offscreen.
- **Bugs fixed with the old animation.**
  1. Its hook read `window.ATOMS`, but `ATOMS` is a top-level `const` and not a window property. The hook therefore returned early every time, and the animation never followed the sliders (it was always Rb, 1 μK, 10 μm, 20 ms). The new code reads `ATOMS` directly.
  2. It ran forever with no pause, even offscreen.
  3. Its "1 mm" scale label was drawn in the background colour, so it was invisible.
  4. It "contracted" the cloud back after expanding, which is unphysical.
- **Tested.** After moving the temperature slider to 100 μK, the label reads σ = 2.93 mm at 30 ms, against 2.934 mm from the formula.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The fit table is wrapped in `.table-scroll`.
