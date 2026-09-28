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
- **Stranded git files after the commit.** `git commit` (d3f4bb4) succeeded but could not unlink `.git/HEAD.lock`, `.git/objects/maintenance.lock` or 71 `tmp_obj_*` files (the VM can't delete). A leftover `HEAD.lock` would block the next commit. Moved them into `.git/_to_delete/` as run 1 had done (names end `.run2` / `.git_objects_…`); `git fsck --connectivity-only` is clean. Added this step to the runbook (§4). Saumitra can empty `.git/_to_delete/` whenever convenient.
- **Item: P0 imaging-calculator η wording.** Done. The tooltip and alkali card now say their η ≈ 8% / 5% are totals (η_geo × QE × T), giving η_geo = 10.0% / 6.7% from the page's own formula (checked with a script). The tooltip anchor no longer wraps at 390 px (the bubble had been cut off at the right edge).
  - **Also fixed, same page (histogram preset notes).** Rb87 said EMCCD and then "sCMOS read noise": it now shows σ_bright = √(2·800 + 12²) ≈ 42 e⁻, which matches the preset. Yb171 called 556 nm the clock line with a higher scatter rate: corrected to the ¹S₀→³P₁ intercombination line (Γ/2π ≈ 182 kHz; 399 nm ≈ 29 MHz; clock 578 nm), source "¹⁷¹Yb Reference Data", arXiv:2509.04416 (preprint), Tables 8–10. Sr88's uncited "Ericsson/Ye-group" attribution became "Illustrative parameters".
  - **Checks.** Formula tests OK 11; inline scripts parse (the two JSON-LD blocks aren't JS); tag counts unchanged. `smoke.js --pages imaging-calculator` vs HEAD: 0 new problems. Playwright: all three presets load and show the new notes, no page errors; tooltip screenshots dark 1280 and light 390 reviewed.
  - **New backlog items.** P0: check the presets' "SNR~N → F>…" figures against the page's own fidelity code. Needs Saumitra: the Hood Lab callout's ~600 photons in 2 ms don't fit an 8% total η under a two-level scattering estimate (details in the backlog).
- **Item: P0 Oxford Ionics → IonQ.** Done. qc-landscape's Oxford Ionics card rewritten: part of IonQ since 17 Sep 2025 ([IonQ release](https://www.ionq.com/news/ionq-completes-acquisition-of-oxford-ionics-rapidly-accelerating-its-quantum)), EQC described, records cited with tags (company announcement July 2024: 99.97% 2Q / 99.9992% 1Q; arXiv:2510.17286 preprint: >99.99% 2Q without ground-state cooling). Dropped the unsourced "£30M Series A (2023)" and "⁴⁰Ca⁺ microwave-only >99.9%" lines. quantinuum-vs-ionq already correct. Checks: formula tests OK 11; tag counts unchanged apart from the 3 new links and 2 source tags; smoke (qc-landscape + imaging-calculator) 0 new problems; card screenshots dark/light 1280 and dark 390 reviewed.
- **Device link dropped** for ~5 min around 09:20 UTC (the Mac didn't respond); nothing was mid-edit. Resumed at 09:29.
- **Item: P0 cream canvases in dark theme, part 1 (dd-playground).** A rendered scan found 18 such canvases on 11 pages (list now in the backlog item). Fixed the two named in the 3D audit, dd-playground's FID/CPMG spheres: theme palette picked per frame, repaint on theme toggle (works while paused / reduced motion), canvas CSS background `var(--bg-card)`. Light theme unchanged. Checks: formula tests OK 11; inline scripts parse; tag counts unchanged; smoke (dd-playground) 0 new problems; screenshots dark/light 1280 and dark 390 reduced-motion, plus a theme toggle on a paused frame, reviewed.
- **Item: cream canvases, part 2 (rb87-vs-yb171).** The two schematic dephasing spheres now follow the theme (dark is the site default, so this was the common view). They also had no pause control and a forever `requestAnimationFrame` loop: now `AMOMotion.loop` with a Pause button, offscreen stop and a reduced-motion still frame. Checks: inline scripts parse, tag counts unchanged, smoke (rb87-vs-yb171) 0 new problems; Playwright: pause button present (starts "Play" under reduced motion), label advances while playing and holds under reduced motion, theme toggle repaints; screenshots dark 1280 and light 390 reviewed.
- **End of run 2.** Commits: d3f4bb4 (case-safe symbols), f9f1036 (imaging η + preset notes), 3a025a1 (Oxford Ionics), c464324 (dd-playground canvases), 69e5569 (rb87-vs-yb171 canvases + pause), plus this log commit. `git push` failed as expected (proxy 403); main is ahead of origin by these commits plus run 1's. Stranded git lock/tmp files from each commit were moved into `.git/_to_delete/`.
- **Next up.** Remaining cream canvases (learn-quantum ×6 first: the Rabi sphere is named in the 3D audit; then mot-designer and the 7 single-canvas pages), then the new P0 on imaging-calculator's preset SNR/fidelity figures, the stale-number sweep and llms.txt.
