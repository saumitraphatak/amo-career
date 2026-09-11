# pages/mot-designer.html

**Purpose:** MOT parameter calculator — damping, spring constant, capture velocity, detuning optimization, species comparison, and the MOT-to-experiment cooling cascade.

## Flow
1. Page hero — "Build 03."
2. **01 MOT Calculator** — damping α, spring κ, ω_MOT, capture velocity vs detuning/saturation.
3. **02 Detuning Optimization** — live tradeoff chart.
4. **03 Species at a Glance** — 5-species comparison table (Rb87, Cs133, Na23, Li7, K39).
5. **04 From MOT to Experiment — The Cooling Cascade** — visual pipeline: Atomic Source → 3D MOT → cMOT → Gray Molasses/PGC → Tweezer/Lattice → Experiment.
6. **05 Physics Reference**, **06 References**.

## Review outcome: changed (significant)
Page was titled **"MOT & Magnetic Trap Designer"** but had zero magnetic-trap content anywhere — no Ioffe-Pritchard calculator, no trap frequencies, no Majorana loss warning, no evaporation parameter. The cooling cascade goes straight from MOT to tweezers/lattice, never mentioning magnetic trapping. This wasn't just the page title: the home-page tool card, `llms.txt`, `llms-full.txt`, `README.md`, and `CLAUDE.md` all described the phantom Ioffe-Pritchard feature in detail.

**Decision: rename, don't build.** Matches the site's tweezer-centric lab focus (author's own lab uses tweezers, not magnetic traps for BEC). Renamed to **"MOT Designer"** everywhere: page `<title>`/og/twitter/JSON-LD/h1/footer credit, home.html tool-card name + description + tags, `NAV` label in `main.js`, the global-search keyword string (dropped "Ioffe Pritchard Majorana evaporation", kept genuinely relevant terms), `llms.txt` entry, `llms-full.txt`'s "TOOL 6" section (replaced the fabricated Ioffe-Pritchard formulas with the real section list), `README.md` table row, and `CLAUDE.md` (3 spots + physics summary).

This is the canonical "no phantom features" example — see `docs/site-philosophy.md` §3.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark (this page's wrapper div was missing its usual `<!-- /page-wrap -->` closing comment — traced the real nesting depth to confirm it was actually balanced and closing at the correct point before retagging, rather than a genuinely unclosed tag). Added `scope="col"` to 7 table column headers; wired `for=`/`id` on 5 label/input pairs; added `aria-hidden="true"` to 4 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
