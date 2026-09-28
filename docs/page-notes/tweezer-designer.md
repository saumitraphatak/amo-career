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


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.


## 3D visualization update (2026-09-28)
Section 03 (Array Geometry) gained a **3D view** (default) alongside the original **Top view**, via a two-button toggle. `js/tweezer3d.js` (raw WebGL, renders on demand only) draws every tweezer to true scale from the page's own numbers — w₀ = 0.52λ/NA, z_R = πw₀²/λ, d, Nx, Ny — as its Gaussian envelope over ±3 z_R, with atoms at focus, a focal-plane grid and a scale bar; a caption prints the exact values used. Purpose: make the existing d/w₀ crosstalk warning visible (at small d the beams visibly merge away from focus). Drag to rotate via `js/orbit3d.js`. The auto Export PNG/SVG buttons belong to the top view, so they are hidden while 3D is showing; the 3D canvas carries `data-export-ready` so `initExportButtons()` skips it. Falls back to the top view if WebGL is unavailable or the context is lost. The route panel and its anchors are unchanged.
