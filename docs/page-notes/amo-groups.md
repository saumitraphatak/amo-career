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
