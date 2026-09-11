# pages/laser-cooling.html

**Purpose:** "Single-atom Cooling" — narrative/derivation companion to cooling-simulator.html. No route-panel; a long-form deep dive.

## Flow
1. Page hero.
2. Why Cool to Ground State? → The Lamb-Dicke Regime → **Resolved Sideband Cooling** (in-trap) → **Unresolved Sideband Cooling** (in-trap) → **Dark-State Sideband Cooling** (in-trap) → **Polarization Gradient Cooling** (free-space) → **Gray Molasses Cooling** (free-space) → **EIT and Λ-Enhanced Gray Molasses** (free-space) → **Raman Sideband Cooling** (in-trap) → Technique Comparison → Papers/Textbooks/Videos.

## Review outcome: flagged, left as-is (user's call)
The technique order interleaves free-space (pre-trap) and sideband (in-trap, Lamb-Dicke-regime) methods rather than grouping them in real cooling-cascade order — 3 sideband sections, then 3 free-space sections, then a 4th sideband section (Raman) stranded at the end. Proposed regrouping into two coherent blocks (free-space first, then all sideband techniques together) matching mot-designer's own cooling-cascade diagram. **User chose to leave the order as-is.** Don't re-raise this unless asked — it was a deliberate decision, not an oversight we missed.

## Cross-page consistency audit update (2026-09)
Hero eyebrow read "Trap, Image & Cool 05" — a duplicate of absorption-imaging.html's badge number, breaking the otherwise-clean 01-07 sequence across the category. Bumped to "06" (its correct position in `NAV.trapImageCool` order, right after absorption-imaging). See docs/cross-page-consistency-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark (same stray-comment correction as cooling-simulator.html — verified the div's true close point via nesting-depth trace rather than trusting the misplaced `<!-- /page-wrap -->` comment); added `scope="col"` to 7 table column headers; wired `for=`/`id` on 12 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
