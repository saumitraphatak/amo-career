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
