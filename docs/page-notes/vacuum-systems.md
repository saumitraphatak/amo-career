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


## Link audit update (2026-09-16)
The Kurt J. Lesker Technical Library link 404'd (`lesker.com/newweb/technical_info/technical_info_overview.cfm` — their tech-info hub moved). Repointed to `lesker.com/newweb/techinfo.cfm`. See docs/link-audit-2026-09-16.md.

## Design/visual-consistency audit update (2026-09-17)
Follow-up to the earlier design-audit remap of this page's `--vac`/`--vac-bg`/`--vac-border` from the old leftover neon cyan to ink-blue: three CSS rules had only had the variable-driven half of the same visual element updated, leaving the other half a hardcoded literal copy of the old cyan, so a single element showed two disagreeing colors — the pressure-slider thumb's fill (`var(--vac)`, blue) had a cyan `box-shadow` glow; the history-timeline dot had the same fill/glow mismatch; and the pump-range badge's background was a hardcoded cyan tint while its own text/border already read blue. Fixed all three to use one consistent blue. Left the page's decorative SVG equipment diagrams alone — those use cyan as one color in a deliberate multi-hue legend (chamber vs. ion pump vs. NEG vs. turbo vs. rough pump, each a different color), not as the page's single identity accent, so recoloring just the "chamber" cyan there wasn't a like-for-like fix. See docs/design-audit-2026-09-17.md.
