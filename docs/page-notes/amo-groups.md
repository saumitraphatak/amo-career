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
