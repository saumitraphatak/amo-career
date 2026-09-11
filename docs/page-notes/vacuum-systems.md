# pages/vacuum-systems.html

**Purpose:** "Vacuum Systems Guide" — "before you trap a single atom, you must first remove 10²³ of them."

## Flow
1. Page hero — "Build 09."
2. **7 numbered sections, no route-panel** (straight linear guide, not a calculator): 01 Why Vacuum? → 02 The Pressure Landscape → 03 The Pumping Chain → 04 Baking Out → 05 Materials & Connections → 06 Reading Your Vacuum → 07 Practical Checklist.
3. See Also cross-links (MOT Designer, Imaging Calculator, etc).

## Review outcome: approved, no changes
No route-panel means no card-count risk. Clean conceptual-to-practical progression ending in a checklist — the right shape for a reference guide rather than a calculator.

(Also fixed here during the mot-designer rename pass: the "See also" cross-link text changed from "MOT & Magnetic Trap" to "MOT".)

## Design audit update (2026-09)
`--vac`/`--vac-bg`/`--vac-border` were leftover neon-cyan (#22d3ee) values from the pre-redesign 16-hue dark-theme palette, never remapped to the site's current three-ink accent system. Remapped to `--ink-blue` (#2c4a63) with matching bg/border tints, consistent with how other equipment/lab pages are inked. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; made all 4 hand-rolled `.pump-card-head` accordion toggles keyboard-operable with a synced `aria-expanded` state (previously CSS-class-only); added `scope="col"` to 20 table column headers; added `aria-label` to the interactive pressure-explorer slider, which had no accessible name at all; added `aria-hidden="true"` to decorative chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
