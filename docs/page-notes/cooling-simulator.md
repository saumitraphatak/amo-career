# pages/cooling-simulator.html

**Purpose:** Interactive Doppler + Sisyphus/gray-molasses cooling simulator.

## Flow
1. Route panel — "Separate free-space cooling from trapped-atom cooling" + 4 cards.
2. **6 tabs**: ① Doppler Cooling, ② Sub-Doppler & Gray Molasses, ③ Sideband Cooling, ④ Method Comparison, ⑤ Simulation Codes (links to `pylcp` etc.), ⑥ References.

## Review outcome: approved, no changes
Cards 01-04 map cleanly to tabs ①-④. Tabs ⑤ and ⑥ are reference/supplementary material (external code links, citations), not workflow steps — same category the site consistently excludes from route-panels everywhere (see `docs/site-philosophy.md` §2). Checked the mapping explicitly before concluding this — it's a legitimate exclusion, not a gap like lab-calculators/lab-techniques had.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.

## Cross-page consistency audit update (2026-09)
Hero eyebrow read "Trap, Image & Cool 06" — one off from its correct position once laser-cooling.html (the previous page in `NAV.trapImageCool` order) was corrected from a duplicate "05" to "06". Bumped to "07". See docs/cross-page-consistency-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark (found and corrected a stray, misleading `<!-- /page-wrap -->` comment in the process — the div actually already closed before the footer, matching the site norm); added `scope="col"` to 6 table column headers; wired `for=`/`id` on 8 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.
