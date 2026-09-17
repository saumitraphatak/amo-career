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


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Randomized Benchmarking Explorer" -- stale from whenever this page was renamed to "Randomized Benchmarking" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.

## Design/visual-consistency audit update (2026-09-17)
Two undefined-CSS-variable bugs, both silently falling back to the wrong font: (1) `var(--mono)` used in 7 rules — `--mono` doesn't exist site-wide, only `--font-mono` does; replaced all 7. (2) the Clifford-group table's first column used `font-family: var(--font-body, Inter, sans-serif)` — `--font-body` also doesn't exist, so with its own inline fallback this cell was permanently stuck in Inter/sans-serif regardless of theme, unlike the rest of the page's text which correctly switches serif/sans-serif with the light/dark toggle via `var(--font-sans)`. Replaced with `var(--font-sans)`. This page's Chart.js decay-curve colors (`#c084fc` purple, `#60a5fa`/`#34d399` for the paired series) were also checked as part of this pass — these are deliberate per-series data-differentiation colors, not leftover unmapped page-identity accent (the page's own `--accent` chrome variable was already correctly remapped to ink-blue in the prior design audit), so left untouched; recoloring the purple series to match the page's blue chrome would have made the two-series RB decay charts harder to read. See docs/design-audit-2026-09-17.md.
