# pages/cavity-qed.html

**Purpose:** "Cavity QED Coupling Lab" — turn cavity/atom geometry into a coupling-regime classification.

## Flow
1. Page hero.
2. Route panel — "Turn geometry into a physical regime" + workflow cards (now 6, see below).
3. **6 numbered sections** (linear scroll, not tabs): 01 Cavity & Atom Parameters → 02 Results → 03 Coupling Rates vs Finesse (chart) → 04 Coupling Regimes → 05 Reference Systems → 06 Common Mistakes.

## Review outcome: changed
Route panel had 4 cards for 6 sections — card "Classify regime" skipped over section 03's chart entirely, and "Check intuition" quietly folded together sections 05 and 06. Expanded to 6 cards, 1:1 with the numbered sections (`.route-grid` again `auto-fit`, no CSS change needed).

Note: this page is a linear scroll, not tabs, so the mismatch was lower-stakes than lab-techniques' (nothing was actually hidden from a reader who scrolls the whole page) — but the user's call was still to fix it for consistency. Contrast with rydberg-calculator, where a similar-looking gap was judged intentional and left alone (site-philosophy.md §2).

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted 3 `<div class="accordion-header">`s to real `<button>`s for keyboard access; added `scope="col"` to 10 table column headers; wired `for=`/`id` on 8 previously-unassociated `<label>`/`<input>` pairs; added `aria-hidden="true"` to 3 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. Added its missing `.footer-link` entry to home.html's Build footer column (present in NAV and the nav dropdown, but absent from the footer). See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its page-footer signature line used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 3D cavity mode + atom position (2026-09-28)
Inside section 02 (Results), after the conventions paragraph, there is a new panel "Where the atom sits matters" (`#cav3d`, from `js/cavity3d.js?v=1` plus `js/orbit3d.js?v=2`). It is not a new numbered section, so the route cards stay 1:1 with sections 01–06.

- **What the figure shows.** A rotatable TEM₀₀ standing wave between two mirrors. The mode is drawn as nested isosurfaces of cos²(kx)·e^(−2r²/w₀²) ("beads"), with an atom placed in it.
  - It is schematic along the axis: 9 antinodes are drawn, and the caption gives the real count 2nL/λ (e.g. ≈1,282 for the default 0.5 mm at 780 nm). The radial scale is w₀.
- **Sliders and readout.** Two sliders set the atom's position: along the axis (antinode → node) and off axis (r/w₀). The readout gives:
  - g = g₀·cos(kx)·e^(−r²/w₀²);
  - g/g₀;
  - C at the atom = C·cos²(kx)·e^(−2r²/w₀²);
  - β = 2C/(1 + 2C).
  - This is the near-waist formula (z_R ≫ L, true for the presets).
- **How the numbers reach the panel.** `cqedCalc()` now also publishes `window.CQED_LAST = {g0, kappa, gamma, C, L_mm, w0_um, lam_nm, n}` and fires `cqed:update`. The panel uses the calculator's own g₀ and C rather than recomputing them.
- **Tested.** Halfway to a node at r = w₀, g/g₀ = cos(π/4)·e⁻¹ = 0.260 and C = 9.42 × 0.0677 = 0.638, matching the readout.
- Nothing animates, so there is no pause control.
- **Pre-existing.** At 390 px, `.sys-table` overflows the page (409 px).

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- **Cause of the 409 px width was not `.sys-table`** (it already sits in `.data-table-wrap`). It was the hidden `.tip` tooltips on the right-hand metric cards: an `opacity:0` pseudo-element still counts toward page width. Fixed in styles.css: the tooltip is only laid out while hovered/focused, is anchored to the nearer edge near the screen sides (small `alignTip` handler in main.js), and no longer inherits the card's uppercase label style (it showed "κ = FSR/(2F)" as "K = FSR/(2F)").
