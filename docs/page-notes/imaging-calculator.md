# pages/imaging-calculator.html

**Purpose:** Single-atom fluorescence imaging SNR calculator — "follow the photons from atom to threshold."

## Flow (post-fix)
1. Page hero.
2. Route panel — 7 cards, 1:1 with sections (see below).
3. **01 Imaging Beam** (transition/scattering-rate inputs) → **02 Collection & Camera** (NA/QE/camera model) → **03 Results** (live SNR meter) → **04 SNR vs Exposure Time** (chart) → **05 Imaging Histogram & Detection Fidelity** (theory: what bright/dark peaks and detection fidelity mean) → **06 Fluorescence Histogram — Threshold Preview** (live canvas driven by current inputs) → **07 Physics & Formulas** → **08 References**.

## Review outcome: changed (significant, two issues)
1. **Ordering bug:** originally, section 05 (the *live* histogram preview) appeared **before** section 07 (the *theory* explaining what a bimodal histogram, dark/bright peaks, and detection fidelity actually are). A first-time visitor hit the live simulation before the concept that makes it legible. Fixed by moving the theory section to sit right before the live preview: old 07 → new 05, old 05 → new 06, old 06 (Physics & Formulas) → new 07. Verified with an exact line-range extraction + assertion that each moved block started with its own expected heading, plus a post-write balance check (`<section>`/`</section>`, `<div>`/`</div>` counts) and a full regression-suite run — see `docs/site-philosophy.md` §4 and §7.
2. **Route-panel mismatch:** 4 cards for 7 real sections; "06 Physics & Formulas" wasn't represented by any card at all. Expanded to 7 cards matching the new order exactly.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 4 table column headers; wired `for=`/`id` on 17 label/input pairs; added `aria-hidden="true"` to 7 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 8 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 8 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.

## Cross-page consistency re-audit (2026-09-18)
`BreadcrumbList` JSON-LD named this page's category "Measure & Cool" (the category's pre-rename name), while the hero eyebrow and NAV dropdown already said "Trap, Image & Cool." Corrected the breadcrumb to match. See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 3D photon-collection figure (2026-09-28)
A new "Where the photons go" panel (`#coll3d`, from `js/collection3d.js?v=1` plus `js/orbit3d.js?v=2`) sits at the end of section 02, "Collection & Camera", and follows the NA slider.

- **What the figure shows.** The atom sits at the centre with its emission pattern drawn as a wireframe. The collected cap θ < θ_max = arcsin NA (n = 1) is bright on a reference sphere, with the objective drawn beyond it. A Monte Carlo photon stream is sampled from the chosen pattern, and its running tally converges on η.
- **Three emission patterns and their η.**
  - Isotropic: η = (1 − c)/2. This is exactly the page's `collectionGeo()` and is what the calculator uses.
  - Dipole ⊥ optical axis: η = (3/8)[(1 − c) + (1 − c³)/3]. σ± light with the quantization axis along the objective gives the same φ-averaged pattern, (1 + cos²θ)/2, so the same η.
  - Dipole ∥ axis: η = (3/4)[(1 − c) − (1 − c³)/3].
  - In all three, c = √(1 − NA²).
  - All three formulas were checked against a 10⁶-sample Monte Carlo at NA 0.3, 0.5, 0.7 and 0.95; they agree to within 0.1%.
- **Scope.** The calculator itself is unchanged and still uses the isotropic value. The panel says so, and says that η here is geometric only (the calculator then applies T and QE).
- **Motion.** There is a "Pause photons" button (WCAG 2.2.2). Under reduced motion there is no photon stream; the static geometry remains. The animation also pauses offscreen.
- **Fact fix.** The "Collection geometry" accordion said isotropic emission at NA = 0.95 captures "~26%". The page's own exact formula gives 34.4%, so it now says ~34%.
- **Not changed (ambiguous, flagged).**
  - The Hood Lab tooltip says "NA 0.6 → η ≈ 8%", and the alkali card says "NA=0.5, η≈5%". These look like totals including T·QE rather than η_geo (which would be 10% and 6.7%). Worth rewording to say which η they mean.
- **Pre-existing, not caused by this change.** At 390 px the page scrolls horizontally to 501 px because of `.fidelity-badge` and `.noise-table`.
