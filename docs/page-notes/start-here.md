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

## 3D constellation (2026-09-28)
A new panel "The whole site at a glance" (`#constellation`, from `js/sitemap3d.js?v=1` plus `js/orbit3d.js?v=2`) sits between the section links and "Recommended sequences".

- **Built from this page's own markup at load.** Stars are every `.see-also-card` in the four category sections (31 pages; this page itself isn't listed). Guided paths come from each `.path-card`'s `.path-step` links (6 paths × 4 steps). So the constellation can't drift from the lists: edit the lists and it follows.
- **Layout.** One cluster per category on a ring. Inside each cluster the pages run in reading order, joined by a thread. The guided paths are coloured arcs. Choosing a path chip lights up its steps with numbered labels and arrowheads.
- **Interaction.** Hover shows a card with the page name, description and which paths it's on. A mouse click opens the page. On touch, the first tap shows the card with an "Open page" link.
- **Motion.** A slow turn with a Stop/Turn button; still under reduced motion; paused offscreen.
- It is deliberately on Start Here and not on the home page: the 2026-09-26 IA review found the home page already offered too many overlapping ways in. The lists below remain the accessible version.
