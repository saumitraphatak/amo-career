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
