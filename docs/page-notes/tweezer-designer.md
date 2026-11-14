# pages/tweezer-designer.html

**Purpose:** "Tweezer Array Design Lab" — design one trap, then scale it into an array.

## Flow
1. Page hero.
2. Route panel — "Design one trap, then scale it into an array" + 4 cards that are actual **clickable anchor jump-links** (`href="#single-tweezer-physics"` etc.), not just descriptive text.
3. **5 numbered sections**: 01 Single-Tweezer Physics, 02 Trap Parameter Calculator, 03 Array Geometry, 04 Species & Wavelength Reference, 05 References & Further Reading.

## Review outcome: approved, no changes — best-executed route-panel on the site
Verified the 4 cards map cleanly to sections 01-04 (05 References excluded, consistent with every other page). Verified the anchor hrefs actually resolve to real section IDs. This is the reference implementation of the route-panel pattern — anchor-linked cards are strictly better than purely descriptive ones where the underlying sections have real IDs to target.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Added `scope="col"` to 7 table column headers; wired `for=`/`id` on the species-select label; added `aria-label` to 6 range sliders (trap wavelength, NA, power, Nx, Ny, spacing) that previously had only a sibling caption with no programmatic association; added `aria-hidden="true"` to decorative chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.


## 3D visualization update (2026-09-28)
Section 03 (Array Geometry) gained a **3D view** (default) alongside the original **Top view**, via a two-button toggle. `js/tweezer3d.js` (raw WebGL, renders on demand only) draws every tweezer to true scale from the page's own numbers — w₀ (0.52λ/NA until 2026-11-13, now (√2/π)λ/NA; see below), z_R = πw₀²/λ, d, Nx, Ny — as its Gaussian envelope over ±3 z_R, with atoms at focus, a focal-plane grid and a scale bar; a caption prints the exact values used. Purpose: make the existing d/w₀ crosstalk warning visible (at small d the beams visibly merge away from focus). Drag to rotate via `js/orbit3d.js`. The auto Export PNG/SVG buttons belong to the top view, so they are hidden while 3D is showing; the 3D canvas carries `data-export-ready` so `initExportButtons()` skips it. Falls back to the top view if WebGL is unavailable or the context is lost. The route panel and its anchors are unchanged.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 14 labels rendered differently after the fix, e.g. "CS, LI, NA COMMON TWEEZER" → "Cs, Li, Na COMMON TWEEZER"; "COMMON RB TWEEZER" → "COMMON Rb TWEEZER". No markup on the page changed apart from the cache version.

## 2026-11-13: physics audit (convention slips)
Prompted by a reader (Mariam, a PhD student cross-checking her thesis numbers), who spotted that the waist used for depth and trap frequencies was the Airy FWHM, a **diameter**, not a 1/e² radius.
- **w₀ fixed:** was `0.52·λ/NA` (Airy FWHM diameter, 0.514λ/NA). Now `W0_PER_LAMBDA_NA = √2/π ≈ 0.450`: the Gaussian with the same peak intensity (Pπ·NA²/λ²) and the same central curvature as a filled-pupil Airy spot, so depth and ω_r are right for a diffraction-limited focus. Old values were depth ×0.75, ω_r ×0.75, z_R ×1.34 and ω_z ×0.65 of the corrected Gaussian-model values. Text explains the FWHM-is-a-diameter trap, the underfilled case (w₀ = λ/πθ), and that the Gaussian model overestimates ω_z for a filled pupil (paraxial Airy effective z_R ≈ 1.1λ/NA² vs 0.64λ/NA²).
- **Counter-rotating term** now kept in U₀ and Γ_sc (Grimm Eqs. 10–11); the RWA dropped 20–30% of the depth for Li/Na at 1064 nm. Displayed formula sign fixed (U₀ < 0 for red detuning).
- **"Sidebands resolved" badge** compared Γ_sc (trap-light scattering) with ω_r; that is not the resolved-sideband condition. Badge now checks η only and states the real condition (Raman/pumping linewidth < ω_r).
- **Reference table:** caption claimed "NA 0.55 and 30 mW", which the calculator does not reproduce; now labelled as representative operating points, and the η column recomputed from the table's own ω_r on the listed line (Li 0.70, Na 0.50, K 0.32, Yb 0.40, Sr 0.44, Cs 0.20).
- Cs/Na wavelengths were air values (852.11, 589.00) → vacuum 852.347, 589.158; δν light-shift formula ħ → h; Kaufman 2014 year/DOI; Kaufman & Ni 2021 is *Nature Physics* 17, 1324 (not Annu. Rev.).
- `js/tweezer3d.js` header comment updated. Guarded by `test_physics_audit_2026_11`.

## 2026-11-14: explainer sweep
Section 01 gained "Diameter or radius? The focal spot the formulas assume" (`.focus-card`): radial profiles of the Airy spot [2J₁(x)/x]², the matched Gaussian (w₀ = (√2/π)λ/NA, same peak and curvature) and the mistaken Gaussian (w₀ = 0.52λ/NA, peak 0.75×), all at the same power in units of λ/NA (Chart.js), plus √I false-colour images of the Airy spot (rings visible) and the Gaussian. Text: rings carry ~16% of the power (1 − J₀² − J₁² at the first zero = 0.838 inside).
