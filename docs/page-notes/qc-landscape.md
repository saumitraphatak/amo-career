# pages/qc-landscape.html

**Purpose:** "Quantum Industry Map" — a researcher's guide to the QC hardware race: platforms, companies, metrics, and where neutral atoms fit.

## Flow
1. Page hero — updated-to-date stamped (May 2026), 6 platforms.
2. Route panel — "Use this as a map, not a press-release feed" + 4 cards: What changed recently → Compare platforms → Neutral-atom relevance → Read caution labels.
3. **~15 top-level sections** (2024-2026 Flash Points, The NISQ Era, The Qubit Race, DiVincenzo Criteria, Analog vs Digital, Platform Comparison [2 chart tabs], Platform Deep Dives [6 hardware-type tabs: Superconducting/Trapped Ions/Neutral Atoms/Silicon Spins/Photonic/Defects & Topo], Road to Fault-Tolerant QC, Platform Snapshot Table, Investment Landscape, Neutral Atom Roadmap, AMO Physics → Quantum Industry, References).

## Review outcome: approved, no changes (autonomous pass)
Same category as rydberg-calculator: the 4 route-cards describe a **conceptual reading strategy** across a large survey page, not a literal 1:1 index of ~15 sections plus 8 sub-tabs — that many cards would over-fragment a clean 4-step mental model (site-philosophy.md §2). Not treated as a mismatch requiring expansion.

## Science audit update (2026-09, Finding 4)
Page was stamped "Data updated May 2026" and missing Atom Computing's June 2026 $300M+ raise. Added an Atom Computing card to the Investment Landscape grid (switched `.invest-grid` to `auto-fit` so a 5th card wraps cleanly) and bumped the footer timestamp to September 2026. See docs/science-audit-2026-09.md.

## Link audit update (2026-09)
Three company links pointed at pre-rebrand domains that still redirect but are stale: D-Wave (`dwavesys.com` → `www.dwavequantum.com`), IQM (`meetiqm.com` → `iqm.tech`), Silicon Quantum Computing (`sqc.com.au` → `sqc.com`). Updated all three to their current canonical domains. See docs/link-audit-2026-09.md.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 7 table column headers. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
