# pages/absorption-imaging.html

**Purpose:** "Absorption Imaging Lab" — companion to the fluorescence Imaging SNR Calculator, focused on Beer-Lambert absorption imaging.

## Flow
1. Route panel — "Read the page like an experimental sequence" + 5 cards (see below), all real anchor jump-links like tweezer-designer.
2. **01 How Absorption Imaging Works** (`#od-physics`) → **02 Imaging Calculator** (`#imaging-calculator`, covered by 2 cards: "Convert to atoms" and "Budget noise" — two facets of the same calculator) → **03 Species Reference** (`#species-reference`) → **04 Practical Considerations** (`#practical-notes`) → **05 References & Further Reading**.

## Review outcome: changed
Route panel had 4 cards; two of them (`#imaging-calculator` ×2) intentionally described different facets of the same section — that part was fine. But **Species Reference had no anchor ID and no card at all**. Added `id="species-reference"` to that section and a new 4th card ("Check species data") pointing to it, renumbering the failure-modes card to 05.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Added `scope="col"` to 6 table column headers; wired `for=`/`id` on the species-select label; added `aria-label` to 7 range sliders (probe detuning, saturation, exposure time, pixel size, magnification, QE, read noise) that previously had only a sibling caption with no programmatic association; added `aria-hidden="true"` to 6 decorative chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.

## Cross-page consistency re-audit (2026-09-18)
`BreadcrumbList` JSON-LD named this page's category "Measure & Cool" (the category's pre-rename name), while the hero eyebrow and NAV dropdown already said "Trap, Image & Cool." Corrected the breadcrumb to match. See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 9 labels rendered differently after the fix, e.g. "RESONANT CROSS SECTION Σ₀" → "RESONANT CROSS SECTION σ₀"; "CROSS SECTION Σ(Δ)" → "CROSS SECTION σ(Δ)". No markup on the page changed apart from the cache version.

## 2026-11-13: physics audit (convention slips)
- Saturation badge said "~s·50%" error; the thin-cloud bias is s/(1+s) (9% at the default s = 0.1, which was badged "< 5%"). Thresholds now 0.05 / 0.5.
- N_min treated per-pixel OD noise as whole-cloud noise; now sums over the pixels covering the 10 μm cloud (σ_N ∝ √N_pix): default 368 → 27 atoms.
- Single-atom OD text (was 10⁻⁴–10⁻³; σ₀/1 μm² ≈ 0.3); "Optimal I/I_sat marked" claim removed (nothing was marked; noise alone always favours more light).
- Vacuum wavelengths for Cs/Na, K-40 766.70 nm, σ₀ for Li/K from 3λ²/2π, Cs I_sat 1.102.

## 2026-11-14: explainer sweep
Section 02 gained "What the camera gives you: a simulated OD image" (surface3d.js v2, orbit3d): Gaussian cloud OD = σ_Δ·N e^{−r²/2σ²}/(2πσ²) on object-plane pixels (binned to ≤ 41×41 over ±4σ), plus the calculator's per-pixel δOD (scaled by p_obj/bin). Readout: peak OD (flag above 3), peak SNR, recovered N ± √N_pix·δOD·A/σ vs true N. New-noise button (seeded RNG).
