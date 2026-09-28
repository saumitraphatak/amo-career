# pages/paper-syllabus.html

**Purpose:** "53 Papers That Build an AMO Career" — a curated reading list, primarily organized by career stage.

## Flow
1. Page hero — "curated by career stage... every paper chosen for conceptual leverage, not historical completeness."
2. Route panel — "Do not read all 53 papers the same way" + 4 cards: Experimentalist track, Theory track, Neutral-atom track, Interview prep.
3. **4 career-stage tabs**: 🎓 Undergrad Entry, 🔬 Grad Year 1, ⚛️ Advanced Grad, 🚀 Postdoc/Career.
4. 53 paper cards (each with `.paper-why` annotation, DOI link, and — since the tech-debt pass — an auto-injected "paper-to-tool bridge" for 53/53 papers via `initPaperToolBridge()` in `main.js`).

## Review outcome: approved, no changes (autonomous pass)
Important distinction from the lab-calculators/cavity-qed cases: the 4 route-cards are **not** a workflow index of the 4 tabs. They're a genuinely different, orthogonal organizing axis — "which track are you reading for" (topical focus) layered on top of the primary "which career stage" axis (the tabs). Two legitimate lenses on the same 53-paper corpus, same category as home.html's multiple deliberate entry points (site-philosophy.md §1) — not a case where §2's "cards must match tabs 1:1" rule applies, because the cards were never describing the tabs in the first place.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Science-content refresh (2026-09-15) — Finding 5 from science-audit-2026-09.md implemented
The original science audit (2026-09-08) flagged the Advanced-Grad/Thesis tier's neutral-atom sequence as ending at Bluvstein et al. 2024 with no 2025/2026 follow-on, and proposed adding Manetsch et al. 2025 (6,100-atom coherence record) and Evered et al. 2026 (arXiv preprint gate-fidelity record) as low-priority/optional enrichment. Implemented both: added paper #34 (Manetsch et al., *Nature* 647, 60 (2025), the 6,100-atom Cs-133 coherence-record paper already correctly cited on `dd-playground.html`) and paper #35 (Evered et al., arXiv:2604.25987 (2026), tagged "Preprint" since it isn't journal-published) directly after paper #33 (Bluvstein 2024) in the Advanced Grad / Thesis tab's neutral-atom sequence, continuing the existing Urban→Saffman→Evered 2023→Bluvstein 2024 arc to the current state of the art. This required renumbering papers 34→53 to 36→55 throughout the file (verified programmatically: sorted paper-num set is exactly 1–55 with no gaps or dupes after the edit) and updating the total-paper-count text in three places (page title, decorative SVG badge, route-panel copy) plus the Stage 3 counter-pill (15→17 papers).

## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`.

Also fixed: the Stage 3 ("Advanced Grad / Thesis") tab's intro paragraph still said "These 15 papers represent the state of the art" after the 2026-09-15 science audit added papers #34-35 and bumped the tab to 17 papers everywhere else (counter-pill, paper numbering) — the one prose sentence was missed. Corrected to "17 papers." See docs/flow-audit-2026-09-19.md.


## Performance audit re-check (2026-09-26)
Same issue as `amo-groups.html` — re-checked the missing-Google-Fonts gap the original 2026-09-11 performance audit flagged but declined to fix. Already resolved: Saumitra added the standard font-loading block himself directly (commit 5460d65, 2026-09-25, before this run started). No page content changed by this run; noting the closure for the record. See docs/performance-audit-2026-09-26.md.

## 3D time tower (2026-09-28)
New panel **"All 55 papers in one view"** (`#paper-tower`), placed between the route panel and the stage tabs. The route cards are an orthogonal lens (see above), so nothing changes there. The purpose line at the top of this file still says 53; the page has had 55 papers since 2026-09-15.

**What it shows.** A rotatable Canvas-2D tower (`js/syllabus3d.js?v=1` + `js/orbit3d.js?v=2`).
- Height is publication year: the last 19xx/20xx year in each `.paper-citation`, on a linear scale with decade rings.
- The four faces are the four stage tabs. Within each face, papers run left to right in page order.
- Keystone papers are larger and ringed. Type chips (All / Keystone / Review / Experiment / Theory) dim the other papers.
- A "Papers per decade" line is computed from the same data: 1970s 2 · 1980s 5 · 1990s 9 · 2000s 11 · 2010s 10 · 2020s 18.

**Built from the DOM at load.** The data is read from the `.paper-card` elements, so adding, removing or re-tagging a paper needs no change to the tower.

**Interaction.**
- Hover shows the paper's number, stage, type, title and citation.
- Mouse click opens that stage tab, scrolls to the card and flashes it (`.paper-card.is-highlighted`).
- On touch, the first tap shows the card with a "Read the note in the list ↓" button.

**Motion.** A slow turn with a Stop/Turn button (WCAG 2.2.2); it is static under `prefers-reduced-motion` and pauses offscreen. The panel is hidden until the script initialises.
