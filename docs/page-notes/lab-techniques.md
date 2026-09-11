# pages/lab-techniques.html

**Purpose:** "AMO Lab Operations Handbook" — an operations reference organized by lab task, not component name.

## Flow
1. Page hero.
2. Route panel — "Start from the lab problem, then open the matching drawer" + workflow cards (now 6, see below).
3. **6 tabs**: 🔦 Align Light, 🌀 Prepare Atomic States, 📡 Drive RF & Microwaves, 💻 Optimize & Simulate, 🔴 Lock & Route Lasers, ⚠️ Debugging & Pitfalls — each holding nested accordions (e.g. under Align Light: mode-matching + calculator, PM fiber alignment, cat's-eye retroreflector geometry, AOM types).
4. **References & Further Reading**.

## Review outcome: changed
Route panel originally had only 4 cards for 6 tabs — "Stabilize and optimize" tried to summarize *three* separate tabs (Optimize & Simulate, Lock & Route Lasers, Debugging & Pitfalls) at once. Expanded to 6 cards, one per tab, in the tab bar's exact left-to-right order (`.route-grid` uses `auto-fit`, so no CSS change was needed for the extra cards). This was the first instance of the "route-cards must match literal tabs" pattern — see `docs/site-philosophy.md` §2.

## Interactive correctness audit update (2026-09)
The loop-antenna radiation-resistance formula (`calcAntenna()` and its matching displayed KaTeX box) had a factor-of-4 error: used `20π²(2πA/λ²)²` instead of the standard Balanis small-loop result `20π²(4πA/λ²)²` (≡ `320π⁴(A/λ²)²`). Fixed in both the JS and the displayed formula, verified numerically (10cm loop @ 100MHz: 23.7mΩ correct vs 5.9mΩ old). See docs/interactive-audit-2026-09.md.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; converted 9 `<div class="accordion-header">`s to real `<button>`s for keyboard access; added `scope="col"` to 14 table column headers; wired `for=`/`id` on 7 label/input pairs; added `aria-hidden="true"` to 17 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
