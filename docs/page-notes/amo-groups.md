# pages/amo-groups.html

**Purpose:** "100+ AMO Research Groups Worldwide" — career-mapping directory of research groups by focus, region, atom species, and technique.

## Flow
1. Page hero (with an animated network-graph SVG).
2. Filter/search UI (unlabeled — see note below).
3. **02 Featured Directory** — the link-checked, structured, most-relevant groups; searchable.
4. **03 Global Watchlist** — broader, less curated field map; separately searchable.
5. **04 Highest-Priority Shortlists** — narrowed-down groups for grad school/postdoc applications.

## Review outcome: approved, no changes (autonomous pass)
Sensible narrowing funnel: filter/search → curated directory → broader watchlist → prioritized shortlist.

**Minor cosmetic note, not fixed:** section numbering starts at "02" — there's an unlabeled filter/search block before "02 Featured Directory" that would logically be "01," but nothing is hidden or broken by the gap. Purely cosmetic; low priority, didn't interrupt the user for it per their autonomous-review instruction. Worth a one-line fix (`01 Filter & Search` header) next time this page is touched for something else.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Link audit update (2026-09-16)
`GROUP_WEBSITES["Ketterle Lab"]` pointed at `cua.mit.edu/groups/ketterle-group/`, which now 404s (the sibling Vuletic/Zwierlein group URLs still work fine, so this was slug-specific, not a site-wide restructuring). Repointed to his current CUA profile, `cua.mit.edu/people/wolfgang-ketterle`. See docs/link-audit-2026-09-16.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.


## Performance audit re-check (2026-09-26)
Re-checked the missing-Google-Fonts issue the original 2026-09-11 performance audit flagged for this page but declined to fix (unsure if it was a bug or a deliberate choice). Turned out to already be resolved: Saumitra added the standard font-loading block himself directly (commit 5460d65, 2026-09-25, before this run started) — confirming it was indeed a bug, not a deliberate choice. No page content changed by this run; noting the closure for the record. See docs/performance-audit-2026-09-26.md.

## 3D globe (2026-09-28)
Added a rotatable dotted-Earth globe above the directory (`js/globe3d.js?v=1`, which needs `js/orbit3d.js?v=2`). One marker per Featured Directory group (99), coloured with the same research-area colours as the filter buttons. Markers within about 40 km (0.35°) merge into one numbered marker, e.g. "6 groups · Harvard University / MIT" in Boston.

- **Same data, same filters.** Built from the page's own `GROUPS` array. `applyFilters()` now ends with `updateGlobe(filtered, true)`, so every filter updates the globe and the globe re-centres when the result is regional. Tested: the Europe filter gives 37 and the Asia filter 15, matching the directory count each time.
- **Click behaviour.** A single marker opens the existing group panel (`showPanel`). A cluster first lists its groups; picking one opens the panel.
- **Progressive enhancement.** The globe container is `hidden` until the script initialises, so without JS the page is unchanged.
- **Fixes a phantom feature.** The home-page tool card has always promised an "interactive world map … click any marker", but the page had no map. The card is now accurate. It says "100+ groups", which is the page's own count including the Global Watchlist; the globe shows the 99 directory groups.
- **Land outline.** Natural Earth 1:50m (public domain), rasterised to a 1° mask and embedded in the script, so there are no map tiles or map service.
- Auto-spin has a Stop/Spin button (WCAG 2.2.2), is off under `prefers-reduced-motion`, and pauses offscreen.

See docs/3d-visualization-audit-2026-09-28.md, "Globes and the time tower".

## 2026-09-29 (overnight): globe works from the keyboard
- Arrow keys already turned the globe. Now <kbd>]</kbd> / <kbd>[</kbd> (also . / ,) step through the markers from west to east (50 places for the 99 groups at the default filter; the filters apply), turning the globe to each one and pinning its card; a visually hidden aria-live line reads e.g. "2 groups · UC Berkeley: Stamper-Kurn Lab; Müller Group. Place 3 of 50, west to east." Enter opens a single group's panel, or moves focus into a cluster's list (Tab/Enter there; Esc returns to the globe). The caption says so. Shared code: `js/globe3d.js?v=2`.
- Fixed on the way: single-group markers were titled "1 groups · …"; now "1 group · …".
- A pinned card now follows its marker while the globe turns (it used to stay where the marker had been).
- Checked in Playwright, dark 1280 and light 390 with reduced motion; `smoke.js` 0 new problems.
