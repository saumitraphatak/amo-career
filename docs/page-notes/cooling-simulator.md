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
