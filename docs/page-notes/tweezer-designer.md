# pages/tweezer-designer.html

**Purpose:** "Tweezer Array Design Lab" — design one trap, then scale it into an array.

## Flow
1. Page hero.
2. Route panel — "Design one trap, then scale it into an array" + 4 cards that are actual **clickable anchor jump-links** (`href="#single-tweezer-physics"` etc.), not just descriptive text.
3. **5 numbered sections**: 01 Single-Tweezer Physics, 02 Trap Parameter Calculator, 03 Array Geometry, 04 Species & Wavelength Reference, 05 References & Further Reading.

## Review outcome: approved, no changes — best-executed route-panel on the site
Verified the 4 cards map cleanly to sections 01-04 (05 References excluded, consistent with every other page). Verified the anchor hrefs actually resolve to real section IDs. This is the reference implementation of the route-panel pattern — anchor-linked cards are strictly better than purely descriptive ones where the underlying sections have real IDs to target.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Added `scope="col"` to 7 table column headers; wired `for=`/`id` on the species-select label; added `aria-label` to 6 range sliders (trap wavelength, NA, power, Nx, Ny, spacing) that previously had only a sibling caption with no programmatic association; added `aria-hidden="true"` to decorative chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
