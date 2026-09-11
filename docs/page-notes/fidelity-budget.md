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
