# Overnight log

Newest entries at the bottom. Each overnight run appends one entry covering: date/time (UTC), items worked, commits, sources used, tests run, and anything left in progress or needing Saumitra.

---

## 2026-09-28 04:20 UTC — setup (interactive session, not an overnight run)
- **Created the overnight system:** `docs/overnight-runbook.md` (rules), `docs/overnight-backlog.md` (queue) and this log.
- **Added `tests/browser/smoke.js` + `tests/browser/chartstub.js`.** This is a reusable rendered-page smoke test: every page, dark/light at 1280 px, dark at 390 px, page and console errors, horizontal overflow, and an optional baseline comparison.
- **First smoke run against the current site.** It found no page or console errors on any of the 34 pages, but **12 pages overflow horizontally at 390 px**. That is now the top P0 item in the backlog.
- **Pushing.** Pushing from the Mac VM fails (the proxy returns 403 for github.com), so overnight commits stay local until Saumitra pushes.

## 2026-09-28 05:49–06:55 UTC — overnight run 1
- **Item: P0 horizontal overflow on phones.** Done: all 34 pages now fit at 390 px and 360 px, with KaTeX rendered and without. `smoke.js` against the HEAD baseline: 34 pages × 3 configs, new problems 0 (and 0 remaining overall).
  - **Method.** Rendered each page in the cloud with a local KaTeX copy routed in place of the CDN, because several overflows only appear once maths renders (lab-calculators, and most of the width on rydberg-calculator, dd-playground, polarimetry). Clipped candidate elements one at a time to find the real cause instead of guessing.
  - **Causes and fixes** (details in each page note):
    - 31 tables with no scroll wrapper on 11 pages: now in `<div class="table-scroll">`, which only scrolls below 900 px so desktop spacing is unchanged.
    - Grid columns stretched by wide content: `min-width:0` on `.two-col`/`.three-col`/`.side-by-side` children, `.katex-display` scrolls sideways.
    - Hidden `.tip` tooltips widening the page (cavity-qed): only laid out when shown, edge-aware, and no longer uppercased ("κ" had shown as "K").
    - Page-local layout: fixed-size Bloch canvases (dd-playground, rb87-vs-yb171), inline 2- and 3-column grids that never collapsed (rydberg-calculator, imaging-calculator), polarimetry grids, the laser-cooling repo card, a remote-entanglement slider.
  - **Found on the way, fixed: prices rendered as maths.** On psiquantum-vs-xanadu, qc-landscape and quantinuum-vs-ionq, KaTeX paired dollar signs ("$1B raise, … $7B") into italic maths, which also made psiquantum and qc-landscape wider than the screen at 1280 px. 95 amounts are now in `<span class="money">`; the auto-render call ignores `.money`/`.no-math`, and versus.js widgets are `no-math`.
  - **Checks.**
    - Formula tests OK 11; `node --check` on main.js/versus.js and every inline script; tag balance unchanged on all pages.
    - The Mac working tree was tarred and diffed against the tested cloud tree (identical).
    - 1280 px full-page screenshots of all 21 edited pages were compared with HEAD: only animation frames differ, except the 3 price pages, which got narrower/shorter as intended.
    - 390 px element screenshots (dark and light) of every fixed spot were reviewed.
  - **Cache.** main.js v=33, styles.css v=23 (all pages + 404), versus.js v=2.
- **New backlog items:**
  - Greek letters and units mangled by uppercase labels (P0, sitewide, e.g. γ/2π shown as Γ/2Π).
  - Keyboard access for `.tip` tooltips (P1).
- **Left alone.** paper-syllabus is briefly wider than the screen during the tab-switch animation (gone after it settles). It is transient and pre-existing, so no action was taken.


## 2026-09-28 08:48–09:40 UTC — overnight run 2
- **Lock.** Found `running 2026-09-28T05:48:55Z` (3 h old, so stale) and took it. No `.git/index.lock`. Working tree had only Saumitra's untracked `Claude outputs/*.png`, left alone.
- **Item: P0 Greek letters and units mangled by uppercase labels.** Done.
  - **Cause.** `text-transform: uppercase` on labels, `th`, `h5`, chip and card labels uppercases every character, so κ/2π showed as Κ/2Π, g₀ as G₀, mW/cm² as MW/CM² (megawatts), ms as MS, μK as ΜK, Cs-133 as CS-133, ⟨n⟩ as ⟨N⟩. KaTeX inside such labels was uppercased as well (rb-explorer's r_C and ε_gate headers, one formula on laser-cooling).
  - **Fix.** A block at the end of `js/main.js` (after the KaTeX render) wraps the tokens that must keep their case in `<span class="case-keep">`, only inside text whose computed style is uppercase; a MutationObserver handles text added later. Rules are in CLAUDE.md ("Case-safe symbols"). `styles.css`: `.case-keep, .katex { text-transform:none }`. Labels keep their look; the symbols are right.
  - **Result.** Rendered scan of every page (KaTeX served locally): 136 labels on 25 pages now display differently, all intended (before/after examples in each page note). Every token the pass kept, across all pages with tabs/accordions opened, was listed and reviewed: 115 distinct tokens, all symbols/units/elements, no ordinary words.
  - **Checks.** Formula tests OK 11; `node --check js/main.js`; HTML changed only in the cache version, so tag balance is unchanged. `smoke.js` against the HEAD baseline: 34 pages × 3 configs, new problems 0. Targeted Playwright run on 12 pages: no page errors, and zero mutations touching `.case-keep` over 1.5 s after load (no observer feedback loop, including animated pages). Screenshots reviewed: cavity-qed parameter table, tweezer-designer output cards, rb-explorer chips, mot-designer cards, rydberg cards, decoherence-lab panel label; dark and light at 1280 px and light at 390 px.
  - **Cache.** main.js v=34, styles.css v=24 (all pages + 404).
- **Noticed, not changed.** decoherence-lab: the oscilloscope panel is as tall as the Bloch sphere panel, leaving a large empty area under the trace at 1280 px (pre-existing layout).
