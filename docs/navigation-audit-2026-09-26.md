# Navigation / Information-Architecture Review & Restructure — 2026-09-26

Recorded 2026-09-28. The work itself landed on 2026-09-26 in four commits: `35387f6` (restructure), `3c46b32` (sitemap), `d752da7` (404 cache-bust), `e9fd8c3` (concept-map regression fix). It sits in the navigation rotation because it changed the nav, the home page's entry points and the footer; the next navigation re-check should start from here rather than from `navigation-audit-2026-09-23.md`.

Scope: Saumitra asked for a big-picture judgement — is there too much information everywhere, and does the site need re-arrangement or a better structure so a visitor can tell what's happening and how to navigate without getting lost or bored? Method: read `home.html` in full, mapped the `NAV` object and `renderNav()` in `js/main.js` (four mega-menus, search modal, mobile overlay), inventoried every link on the home page, and measured per-page density across all 31 tool/content pages (lines, tabs, accordions, formula blocks, citation markers).

## Verdict

Not a content-density problem — an information-architecture problem, concentrated on the home page.

- **The same pages were offered through seven overlapping lists.** `home.html` had **96 internal links to only 30 unique pages** (3.2 links per page on average; `laser-planner.html` appeared 5 times), spread across the hero CTAs, the six "I am trying to…" intent cards, the 22-card "Browse by workflow" tools grid, the 3-card career row, the 14-card Learn row (anchors into one page), Guided Paths (6 cards × 4 step-links = 24 links) and the footer (~31 links). A first-time visitor had to work out that most of these lists pointed at the same destinations.
- **The tools-grid numbering promised an order it didn't show.** Badges were numbered correctly per category, but the cards were interleaved in the DOM: BUILD 01, BUILD 05, QC 01, QC 02, TRAP 02, TRAP 04, TRAP 07, TRAP 05, BUILD 04, BUILD 07, BUILD 06, TRAP 01 … — a broken sequence reads as arbitrary, which is worse than no numbers.
- **TRAP 06 was missing.** `laser-cooling.html` (one of the site's largest pages, 26 formula blocks) had no tools-grid card at all, which is why the TRAP badges jumped from 05 to 07.
- **Three taxonomies for one set of pages.** The nav used Build / Trap, Image & Cool / Quantum Computing / Career & Literature; the grid badges matched it; the footer used its own "Build / Measure & QC / Learn & Career" split that matched neither.
- **"Start Here" had nowhere to go.** The nav's Start Here button pointed at an anchor on the home page (`#intent-paths`), not at a destination.

Per-page density was high (roughly 490 lines for `decoherence-lab.html` to 3,250 for `learn-quantum.html`, with some pages carrying 10–12 tabs or 15+ accordions) but well structured and consistent with the site's "PhD-level" purpose. Individual pages were not changed.

**Correction to the initial verdict (recorded for honesty).** The first write-up told Saumitra that every tool page stacks three auto-injected panels (Page Playbook + Reference Trail + Related Tools). Tracing the code showed only `initRelatedToolsPanel()` was ever called — `initPagePlaybookPanel()` and `initReferenceTrailPanel()` were defined, with their data (`PAGE_PLAYBOOKS`, `REFERENCE_TRAILS`) and CSS in place, but never wired in. Per-page chrome was therefore lighter than first claimed, and the planned "merge three panels into one" change was dropped in favour of what's described below.

## Changes

### `35387f6` — restructure (34 files)
- **New `pages/start-here.html`** — the canonical directory: every page, once, in the nav's four categories, in true sequential order, one line each; plus the full four-step detail of all six guided paths (anchors `#path-mot`, `#path-lasers`, `#path-imaging`, `#path-cooling`, `#path-qc`, `#path-career`). Built from shared CSS (`.path-card`, `.see-also-grid`/`.see-also-card`) plus a few page-local `.sm-*` rules. `CollectionPage` + `BreadcrumbList` JSON-LD. Not added to `NAV.tools` (it's an index, not a tool).
- **Tools grid reordered** so cards display BUILD 01→10, TRAP 01→07, QC 01→06. Card contents unchanged; only DOM order.
- **Added the missing TRAP 06 card** (Single-atom Cooling → `laser-cooling.html`).
- **Guided Paths condensed from 24 step-links to 6.** Each card keeps its icon/title/audience, shows a one-line summary ("Species → laser plan → MOT design → lab technique"), and links "See full path →" to its anchor on the Site Map. The concept-map visualisation above the cards was kept.
- **Footer taxonomy aligned with the nav.** Middle columns renamed and regrouped to "Trap, Image & Cool" (`NAV.measure` + `NAV.cooling`, 7 tools) and "Quantum Computing & Career" (`NAV.quantum` + `NAV.career`, 14 tools); Build unchanged (10). Added "🗺️ Full Site Map & Recommended Order →" in the footer brand block.
- **`js/main.js`:** desktop nav "Start Here" → `pages/start-here.html`; mobile menu gains "Site Map & Start Here" above the existing "I am trying to…" and "Guided Paths (home)" links; `start-here` added to `SEARCH_KEYWORDS` and to `getSearchEntries()`; **`initPagePlaybookPanel()` wired into the `DOMContentLoaded` init** (renders the two-sentence "Use it for / Read with care" strip at the top of tool pages with a `PAGE_PLAYBOOKS` entry — not on home or start-here).
- **Cache bust** `main.js?v=30` → `v=31` on all pages and `home.html` (each of the 31 existing pages changed on that one line only — verified by per-file `git diff`).

### `3c46b32` — `sitemap.xml`
Added the `start-here.html` entry (priority 0.9). Validated as XML; 34 `<url>` entries.

### `d752da7` — `404.html`
`404.html` had been sitting at `main.js?v=31` on disk, uncommitted, while git history still had `v=26` — it had never been included in earlier bump commits. Committed as-is (no content change).

## Regression introduced — and fixed (`e9fd8c3`)

Condensing Guided Paths replaced each `<a class="path-step" href="…">` with a plain `<span>`. `initPathConceptMap()` built its graph by reading those `href`s, so every path resolved to `null`: the concept map rendered **one node labelled "null" and zero edges**. It passed every static check (tag balance, JS syntax, the 11 regression tests) and was caught by Saumitra from a screenshot.

Fix: each home `.path-card` now carries `data-steps="pages/a.html,pages/b.html,…"` (the full ordered list, invisible), and `initPathConceptMap()` reads `data-steps` first, falling back to `.path-step[href]`. Verified by simulating the parse against the real file: 21 nodes, 18 edges. This is why later visual work (the 2026-09-28 3D pass) was verified in a rendered browser, not just with static checks.

## Deliberately not changed
- **Footer kept as a complete index** (all 31 tools). A long, below-the-fold footer sitemap is a normal low-cost pattern and wasn't the source of confusion; the redundancy that mattered was Guided Paths duplicating the grid in the main scroll.
- **`initReferenceTrailPanel()` left unwired.** Pages already carry real, specific citations (see the 2026-09 science audits); a generic "what this page is grounded in" panel on top would add chrome, not information.
- **Intent cards, career row and Learn row kept** — each frames the pages differently enough to earn its place (`site-philosophy.md` §1).
- **Mega-menus unchanged** — four clear menus are fine; the problem was the home page, not the nav.

## Sync rules this created (also in `CLAUDE.md`)
- Guided-path steps live in two places: the home card's `data-steps` and the full list in `start-here.html`. Change both.
- A new page gets a line in `start-here.html` in its category section, in addition to the existing NAV / grid card / footer steps.
- Grid cards must sit in badge order.

## Verification performed
- Tag balance (div/section/ul/li/a/table/tr/td/th/nav/button/main/footer/style/script) on `home.html` and `start-here.html`; JSON-LD parsed; every inline script `node --check`ed; `js/main.js` `node --check`ed.
- `tests/formula_regression.py`: 11/11 before and after.
- `main.js?v=` grep showed a single value across all pages + `home.html` + `404.html`.
- Tools-grid badge sequence re-extracted after the reorder: 26 badges in order (BUILD 01–10, TRAP 01–07, QC 01–06, CAREER 01–03).
- After `e9fd8c3`: concept-map node/edge count simulated from the committed file (21/18).

## Open decisions for Saumitra
- Keep or delete the four other never-called panel functions (`initAssumptionBadges`, `initSourceConfidencePanels`, `initLabNotebook`, `initExpertModeToggles`) and `initReferenceTrailPanel` — also flagged in `performance-audit-2026-09-26.md`.

## Suggested next rotation
- Re-check that the three `data-steps` / start-here / grid-order sync rules above have held.
- Spot-check that the Page Playbook panel's `PAGE_PLAYBOOKS` text still matches each page after future content edits (it now renders live, so stale text is visible).
