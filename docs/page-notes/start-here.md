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

## 2026-09-28 (overnight run 3): stale-number sweep
- AMO Group Finder line said "100+ research groups on a world map"; the map has 99, plus a 141-entry watchlist. Now "99 groups on a world map, plus a 141-entry watchlist". "15 species" and "55 papers" checked and correct. Guarded by `test_hand_typed_counts_match_content`.

## 2026-09-29 (overnight): see-also icons morph
- Clicking a card's icon (home tool/intent cards, start-here "see also" cards) now morphs that icon into this page's hero badge icon during the page transition, and back again on return (main.js v38 `initPageTransitions`; see `docs/motion-and-transitions.md`).
- Found while checking: the see-also icons for laser-cooling (🧊) and cooling-simulator (❄️) disagreed with NAV and the page heroes; NAV and heroes now match these (see those pages' notes).
- Still open (Needs Saumitra, backlog): the Quantum section numbers learn-quantum as 02 and shifts the rest (rydberg 03 … remote-entanglement 07), while the page heroes and home QC cards skip learn-quantum (rydberg = Quantum 02) and learn-quantum's own hero says "Quantum 01", the same as decoherence-lab.

## 2026-09-29 (overnight): constellation works from the keyboard
- Arrow keys already turned it (AMO3D.orbit). Now <kbd>]</kbd> / <kbd>[</kbd> (also . / ,) step through the 31 pages in the directory's order, or through the chosen guided path's steps when a path chip is on. The page gets its label and pinned card (with a keyboard hint line); a visually hidden aria-live line reads e.g. "MOT Designer, Build 03. 3 of 31 pages." / "Step 1 of 4 on this path." Enter opens the page; Esc closes the card.
- Fixed on the way: a pinned card now follows its star when the constellation turns.
- The intro sentence says how to use it from the keyboard. `sitemap3d.js?v=2`.
- Checked in Playwright, dark 1280 and light 390 with reduced motion: 40 steps visit all 31 pages; a path chip restricts stepping to its 4 steps; Enter navigates; `smoke.js` 0 new problems.
