# pages/rb-explorer.html

**Purpose:** "Randomized Benchmarking" — the SPAM problem, Clifford twirling, RB decay model, interleaved RB, two-qubit specifics, and neutral-atom results.

## Flow
1. Page hero.
2. **9 sections, no route-panel**: Why RB? The SPAM Problem → The Clifford Group → The RB Decay Model → Interactive Standard RB Calculator → Interleaved RB (IRB) → Two-Qubit RB Specifics → Practical Considerations → Results in Neutral Atom Experiments → References.

## Review outcome: approved, no changes
Motivate → build concept → theory → hands-on calculator → extensions (interleaved, two-qubit) → practical caveats → real experimental results → references. Clean progression, no route-panel to check for mismatches.


## Home integration (later pass)
Added a `QC 05` tools-grid card on `home.html` (icon 📈, color `#c084fc`), matching the treatment `remote-entanglement.html` already had. Previously this page was reachable only via the nav dropdown, footer link, or an incidental guided-path route — noted as a discoverability gap in the September 2026 technical audit (`docs/technical-audit-2026-09.md`).
## Interactive correctness audit update (2026-09)
Removed a dead/unused intermediate expression in `rbDecay()` that was immediately overwritten by the correct, actually-used depolarizing-parameter formula. No behavior change — the live code was already correct. See docs/interactive-audit-2026-09.md.

## Design audit update (2026-09)
`--accent`/`--accent-dim`/`--accent-border` were leftover neon-purple (#c084fc, the old dark-theme's `--c-learn` value) never remapped during the redesign. Remapped to `--ink-blue` (#2c4a63) with matching bg/border tints, consistent with other QC/fidelity-adjacent pages. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 16 table column headers. (This page's own `<label for=>` usage was already correct — noted in the audit as a rare working counter-example.) See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
