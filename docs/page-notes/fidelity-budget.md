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
