# pages/remote-entanglement.html

**Purpose:** "Remote Entanglement Generation" — photon-mediated entanglement linking atoms in separate quantum processors; argues connectivity, not single-qubit fidelity, is the real scaling bottleneck.

## Flow
1. Page hero.
2. **No route-panel.** Why Remote Entanglement? (motivation) → The Protocol — Step by Step → Atom–Photon Entanglement (mechanism) → Bell State Measurement & Hong-Ou-Mandel Effect (mechanism) → Challenges Specific to Neutral Atoms → Approaches to Photon Collection & Emission → Historical Milestones → Entanglement Rate Calculator (interactive tool) → Where Remote Entanglement Fits in the Computing Landscape → 07 References & Further Reading.

## Review outcome: approved, no changes (autonomous pass)
Interactive calculator comes after all the conceptual/mechanism/historical grounding, consistent with the theory-before-tool principle (`docs/site-philosophy.md` §4). No route-panel to check for card mismatches.

## Cross-page consistency audit update (2026-09)
Hero eyebrow read "Quantum Computing · Deep Dive" — the only Quantum-category page with neither a sequence number nor the shorter "Quantum" category wording every sibling (learn-quantum, rydberg-calculator, fidelity-budget, rb-explorer, dd-playground) uses. Changed to "Quantum 06 · Remote Entanglement Generation", completing the category's 01-06 sequence and matching the page's own `<h1>`/breadcrumb title. See docs/cross-page-consistency-audit-2026-09.md.


## Accessibility audit update (2026-09)
Made all 5 hand-rolled `.approach-head` accordion toggles keyboard-operable (`tabindex`, `role="button"`, `onkeydown`) and gave them a real `aria-expanded` state kept in sync on click/keydown (previously the open/closed state existed only as a CSS class, invisible to assistive tech); added `aria-hidden="true"` to 5 decorative chevron icons; wired `for=`/`id` on 9 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
