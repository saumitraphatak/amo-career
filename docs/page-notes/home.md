# home.html

**Purpose:** The front door. Sells the site's breadth and gives visitors several ways into the same 27 pages depending on their mindset.

## Flow
1. **Hero** — headline, tagline, 2 CTAs, 4 auto-computed stats, decorative atom canvas.
2. **"I am trying to..."** — job-to-be-done intent cards (now 6, see below) + a localStorage-personalized "Recently used tools" row.
3. **"Browse by workflow, not by alphabet"** — the main tools grid, grouped Build / Measure & Cool / Quantum (Career is intentionally not duplicated here — see below).
4. **"Build your AMO career"** — dedicated showcase for the 3 career-resource pages (AMO Group Finder, Paper Roadmap, QC Industry Map), with longer descriptions/tags than a flat grid card would carry.
5. **"Learn the underlying physics"** — Learn Quantum teaser.
6. **"Where should you start?"** — 6 Guided Paths (ordered sequences through 4 tools each) + the interactive concept-map graph (reads the `.path-card` DOM directly, no duplicated data).
7. **About** — author bio.
8. **Footer.**

## Review outcome: changed
Section 2 originally had 9 intent cards; 3 of them (Find AMO groups, Read the key papers, Prepare for AMO industry interviews) pitched the exact same pages as section 4's dedicated showcase with no new framing — pure redundancy. Removed those 3 cards, kept section 4 as the canonical "career" showcase. `.intent-grid` CSS changed from `repeat(5, 1fr)` to `repeat(3, 1fr)` for a clean 2×3 layout of the remaining 6 cards.

Section 6 (Guided Paths) was *not* touched despite also referencing career pages — it presents them as an ordered sequence, a genuinely different job than a flat pitch (see site-philosophy.md §1).

## Flow audit update (2026-09)
The "Learn the underlying physics" teaser grid previewed 11 of learn-quantum.html's 14 sections, in a stale order (predating that page's own prior reorder), plus a "More coming" placeholder implying 3 built sections (Optical Pumping, Hyperfine Qubits, QEC) didn't exist. Rebuilt with all 14 cards in the real teaching order; placeholder removed. See docs/flow-audit-2026-09.md.

## Accessibility audit update (2026-09)
`id="main-content"` (the skip-link target) previously sat only on the hero `<section>`, leaving every other top-level section (`#intent-paths`, `#tools`, `#qc-industry`, `#learn`, `#paths`, `#about`) outside any main landmark. Wrapped all of them in a new `<main id="main-content">…</main>` between the nav and footer; the hero section keeps its `aria-label="Hero"` but no longer carries the id. This was also the run that added the site-wide `prefers-reduced-motion` guard for `.anim-in` scroll-reveal animations and a visible `.btn:focus-visible` outline (both in `css/styles.css`, affecting every page including this one) and ARIA roles for the tab-widget component in `js/main.js` (`initTabs()`) — see docs/accessibility-audit-2026-09.md for the full site-wide list.

## Navigation/IA audit update (2026-09)
Mobile nav links (`mobileItemHTML` in `js/main.js`) were missing the `kind` subtitle ("Calculator"/"Guide"/"Simulator"/etc.) that desktop dropdown links already show — added it, matching desktop. Also added 2 missing `.footer-link` entries (Zernike Wavefront Lab, Cavity QED Coupling Lab — both were in NAV and the nav dropdown but absent from the Build footer column) and fixed a JS bug where every page except decoherence-lab.html was silently rendering two contradictory "related tools" panels back-to-back (see docs/navigation-audit-2026-09.md for the full site-wide list — most of these fixes live in js/main.js and affect every page, not just this one).


## Performance audit update (2026-09)
Same jsdelivr preconnect fix as the tool pages (home.html also loads from jsdelivr). Also: this run's audit flagged (not fixed) that Chart.js/main.js render-blocking on 19 tool pages needs page-by-page verification before it can safely get `defer`, and that 6 functions in js/main.js appear to be unused dead code (~12.5% of the file) — worth confirming with you before removal. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title` was truncated to "AMO Toolkit for AMO Physics", dropping "& Quantum Science" that both `<title>` and `twitter:title` already carry -- a social-media share of the homepage was showing an incomplete title. Fixed to match. See docs/technical-audit-2026-09-16.md.

## Cross-page consistency re-audit (2026-09-18)
Tools-grid `tool-card-num` badges for 4 pages had drifted out of sync with those pages' own hero-eyebrow numbers, left behind by the original cross-page audit's 2026-09-08 renumbering (which fixed eyebrows/breadcrumbs but not this third copy of the same sequence number): `remote-entanglement.html` "QC 04"→"QC 06", `rb-explorer.html` "QC 05"→"QC 04", `dd-playground.html` "QC 06"→"QC 05", `cooling-simulator.html` "TRAP 06"→"TRAP 07". Also added missing `og:image`/`twitter:*` tags to `index.html` (the root redirect stub) to match `home.html`'s. See docs/cross-page-consistency-audit-2026-09-18.md.

## Content-flow & pedagogy audit update (2026-09-19)
Two teaser cards had gone stale relative to the pages they link to. (1) The "AMO Paper Roadmap" career-showcase card said "53 foundational papers" / a "53 papers" chip; `paper-syllabus.html` has carried 55 papers since the 2026-09-15 science audit added two. Updated both to 55. (2) The "Rydberg Gate Error Budget" tool-card's description cited only "Evered 2023: 99.5%" as the state-of-the-art comparison; `fidelity-budget.html`'s own SOTA section was updated by that same 2026-09-15 pass to add a newer Evered et al. 2026 preprint result (99.854%) alongside the 2023 figure, so the home teaser was undeselling the page's actual content. Updated the parenthetical to cite both. See docs/flow-audit-2026-09-19.md.

## Navigation/IA re-audit (2026-09-23)
The 3 comparison pages added 2026-09-22 (`quantinuum-vs-ionq.html`, `google-vs-ibm.html`, `psiquantum-vs-xanadu.html`) had been wired into `NAV.career`, global search, and cross-page `.see-also` links, but never got a `.footer-link` entry — every one of the site's other 28 pages has exactly one, these 3 had zero. Added all 3 to the "Learn & Career" footer column (`#f472b6`/`#38bdf8`/`#2dd4bf` dots), bringing the footer back to a clean 1:1 with all 31 pages (verified: 31 links, 0 duplicates). `CLAUDE.md`'s footer-column doc (which still said "all 4 `career` tools") updated to "all 7" to match. See docs/navigation-audit-2026-09-23.md.
