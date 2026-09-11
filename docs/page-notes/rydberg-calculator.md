# pages/rydberg-calculator.html

**Purpose:** Rydberg state properties + blockade estimate calculator.

## Flow
1. Route panel — "Start with the state, then ask whether the interaction is useful" + 4 cards: Choose state → Estimate interaction → Interpret the regime → Check caveats.
2. **6 content blocks** (no numbering, linear scroll): Rydberg State Selector (inputs) → Rydberg Blockade Lab (main C₆/R_b calculation + live visualizer) → Blockade radius vs n (chart) → Quantum defects reference (data table) → C₆ scaling & Förster resonances (theory) → References & Tools.

## Review outcome: assessed, left as-is
The 4 route-cards describe a **conceptual reasoning process**, not a literal 1:1 section index — unlike lab-calculators' literal tabs, nothing here is a distinct navigable destination a visitor could miss. The blockade-vs-n chart and quantum-defects table are supporting detail nested inside the "interaction" and "state" reasoning steps respectively, not separate top-level workflow stages. Presented this distinction explicitly and the user agreed to leave it — don't force this into a 6-card structure for consistency's sake; the judgment call was intentional. Contrast with cavity-qed, which looked similar on the surface but got expanded because the user's call went the other way there.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 5 table column headers; wired `for=`/`id` on 5 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
