# pages/fidelity-budget.html

**Purpose:** "Gate Fidelity Budget" — Rydberg two-qubit gate error budget across 8 error sources.

## Flow
1. Page hero.
2. **5 numbered sections, no route-panel**: 01 Gate & Atom Setup (inputs) → 02 Gate Fidelity & Error Budget (the 8-source computed results) → 03 State-of-the-Art Comparison (Evered/Muniz benchmarks) → 04 Error Source Formulas → 05 Key References.

## Review outcome: approved, no changes
Clean linear flow: set up → see your budget → compare to real published results → understand the underlying formulas → references.

## Science audit update (2026-09, Finding 1)
Added a 4th SOTA card for Evered et al. 2026 (arXiv:2604.25987, preprint — 99.854% raw / 99.941% post-sel) alongside the existing peer-reviewed Evered 2023 card, plus the arXiv link in "05 Key References". See docs/science-audit-2026-09.md and docs/page-notes/rb87-vs-yb171.md for the full context.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 4 table column headers; wired `for=`/`id` on 12 label/input pairs; added `aria-hidden="true"` to 5 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Gate Fidelity Budget" -- stale from whenever this page was renamed to "Rydberg Gate Error Budget" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 9 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 9 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s), its page-footer signature line, and its BreadcrumbList JSON-LD leaf name used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The per-source budget table is wrapped in `<div class="table-scroll">` (scrolls sideways below 900 px only, so desktop spacing is unchanged).

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 4 labels rendered differently after the fix, e.g. "TOTAL GATE FIDELITY F = 1 − ΣΕᵢ" → "TOTAL GATE FIDELITY F = 1 − Σεᵢ"; "RYDBERG LIFETIME Τ" → "RYDBERG LIFETIME τ". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight run 3): error waterfall follows the theme; label fixes
- The "Error waterfall" canvas was cream in the (default) dark theme. Its context now goes through the shared `js/canvas-ink.js` (`AMOInk.wrap`), the canvas has CSS background `var(--bg-card)`, and a theme toggle redraws it instantly (`drawWaterfall(…, instant)`). The 0.8 s grow-in is skipped under reduced motion.
- Bar labels were the first word cut to 6 letters ("Dopple", "Blocka", "B-fiel"); they now use short names (Doppler, Spont., Laser φ, SPAM, Blockade, B-field, Rabi δΩ, Loss), and 5-letter ones when the columns are narrower than 48 px (phones), where the old labels ran into each other. The "99.9%" target label sat on top of the "0.0e+0" y tick; it now reads "99.9% target" at the right end of the dashed line.
- Checks: `smoke.js` 0 new problems; Playwright dark/light 1280 and 390, toggle repaint; screenshots reviewed.
- **Not changed, flagged (Needs Saumitra in the backlog):** at the default settings (⁸⁷Rb, n = 60, t_gate = 2 μs, T = 5 μK) the Doppler term is 0.16 and dominates the budget, because `k_Ryd = 2π/λ_Ryd` uses a single 480 nm photon. For the usual counter-propagating two-photon excitation the relevant wavevector is |k₁ − k₂| (e.g. 780 + 480 nm: k_eff ≈ 5.0×10⁶ m⁻¹ vs 1.31×10⁷ m⁻¹, so ε_D would be ≈ 7× smaller).
