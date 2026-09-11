# pages/rb87-vs-yb171.html

**Purpose:** "Rb87 vs Yb171, Neutral Atom Qubit Showdown" — side-by-side platform comparison for choosing a qubit species.

## Flow
1. Page hero — alkali Rb87 (hyperfine qubit, Harvard/QuEra ecosystem) vs alkaline-earth Yb171 (Atom Computing ecosystem).
2. **12 numbered sections, no route-panel**: 01 Why These Two Atoms? → 02 Atomic Physics Deep Dive → 03 Qubit Encoding → 04 Laser Cooling & State Preparation → 05 Coherence & Decoherence → 06 Gate Performance → 07 Readout & SPAM → 08 Array Size & Scalability → 09 Erasure Conversion (Yb171's structural advantage) → 10 Full Head-to-Head Comparison → 11 Companies & Ecosystem → 12 Key Papers & References.

## Review outcome: approved, no changes (autonomous pass)
Sensible build-up-then-synthesize structure: motivate the comparison, then work category by category through the physics (atomic structure → encoding → cooling → coherence → gates → readout → scalability → Yb171's special erasure-conversion advantage), *then* the full head-to-head summary table near the end (section 10, after all supporting detail is established) — followed by industry/ecosystem context and references. No route-panel to check for card mismatches.


## Science audit update (2026-09, docs/science-audit-2026-09.md, Finding 1 + Finding 2)
- **Finding 1 (narrative-affecting, approved by Saumitra):** Evered et al. reported a new Rb87 CZ-gate record in an April 2026
  arXiv preprint (arXiv:2604.25987) — 99.854(4)% raw / 99.941(3)% with loss post-selection, global echo RB averaged over
  17 gate sites in a 442-atom array, stable over 10 hours / ~2M RB runs. This exceeds the page's previously-headline Yb171
  number (99.72% post-sel, Muniz 2025, peer-reviewed) on both raw and post-selected fidelity. Updated: hero chip, overview
  info-box (added a dated update paragraph, did not remove the original peer-reviewed sentence the regression tests guard),
  a 5th stat-row card (color-flagged `preprint`, not `rb`/`yb`), Section 06 gate-results bullet + formula-box + chart caption
  + fidelityChart data (2 new bars) + the section insight box (rewritten to state the ranking is provisional pending peer
  review), Section 08 Rb87 scaling bullet (clarifying 442 atoms is a fidelity benchmark, not a new array-size record),
  Section 10 comparison table (added a second "incl. preprints" row rather than overwriting the peer-reviewed row; bumped
  rowspan 4→6), and a new paper-card in Section 12. Added a new `.source-tag.preprint` CSS class (cyan, `css/styles.css`)
  matching the page's existing `peer-reviewed`/`company-roadmap`/`rough-estimate` tag pattern, used throughout to flag this
  result as not yet independently reproduced or journal-published.
- **Finding 2 (additive, no approval needed):** added a new experimental block to Section 09 (Erasure Conversion) citing
  Zhang et al., *Nature Physics* 2026 / arXiv:2506.13724 — the first end-to-end demonstration that erasure information helps
  at every stage (AR-gate fidelity, transport, [[4,2,2]] logical state-prep, logical teleportation), plus a matching
  paper-card in Section 12.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 5 table column headers. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
