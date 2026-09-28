# pages/start-here.html

**Purpose:** "Site Map & Start Here" — a navigation index, not a physics tool. Maps every AMO Toolkit page by
Build / Trap-Image-Cool / Quantum Computing / Career and gives recommended-order paths for common workflows. Uses a
`CollectionPage` + `BreadcrumbList` JSON-LD schema (correctly has no `headline` field — that's an `Article`-only
property, not a bug). Linked from the global nav (`main.js`'s `NAV_LINKS`/nav-btn, both desktop and mobile) but is
not itself one of the 31 `NAV.tools` entries, so it doesn't appear in the tools grid or hero tool-count stat.

## Technical/SEO/consistency audit update (2026-09-28)
First page-notes entry for this page (it had none before). Two mechanical fixes found by the rotation technical
audit: (1) `og:title` had a literal unescaped `&` (`Site Map & Start Here — AMO Toolkit`) while `<title>` correctly
used `&amp;` — made both consistent with `&amp;`; (2) meta description was 169 characters (9 over the 160-char
limit) — trimmed "plus the full recommended-order paths" to "plus recommended-order paths" to land exactly at 160.
See docs/technical-audit-2026-09-28.md.


## Origin (2026-09-26) — recorded 2026-09-28
Created by the 2026-09-26 IA restructure (commit `35387f6`) as the single canonical directory: every page once, in the nav's four categories and true order, plus the full four-step lists for the six guided paths (anchors `#path-mot`, `#path-lasers`, `#path-imaging`, `#path-cooling`, `#path-qc`, `#path-career`) that the home page's condensed Guided Paths cards link to. The global nav's "Start Here" (desktop and mobile) points here. When a page is added, add its line here; when a guided path changes, change it here **and** in the home card's `data-steps`. See docs/navigation-audit-2026-09-26.md.
