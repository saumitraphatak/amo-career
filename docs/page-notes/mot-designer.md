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
