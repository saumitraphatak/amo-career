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

## 2026-09-28 09:49–11:10 UTC — overnight run 3
- **Lock.** Found `free 2026-09-28T09:33:04Z` and took it; refreshed it during the run so the 10:49 run would see it as live. No `.git/index.lock`. Working tree had only Saumitra's untracked `Claude outputs/*.png`, left alone. Formula tests green at start (OK 11); OK 16 at the end (5 new tests, none edited).
- **P0 imaging-calculator histogram presets** (f59dd78, 27fcaac). The notes' SNR/F figures now come from the page's own code (Rb87 16.8, Yb171 29.3, Sr88 16.1; Marginal 1.6 and F = 87.75%, button relabelled). Unsourced "Kaufman-group style … F>99.99% routinely" dropped; Sr88 cites a measured benchmark, Covey et al., PRL 122, 173201 (2019) / arXiv:1811.06014 (imaging fidelity 0.99991(1), survival 0.99932(8), ⁸⁸Sr on 461 nm). Follow-up: `normCDF` floored tails at 10⁻¹⁶, so P_miss/P_false showed 0.0000% and θ_opt wandered (Sr88 519 vs 293.7 e⁻); now an erfc-based `normTail` (checked vs Python `math.erfc`, rel. err ≤ 1.2×10⁻⁷ from x = −3 to 26), scientific notation for tiny values, 390 px card layout fixed. Test `test_imaging_histogram_presets_match_notes` (mutation-checked: a wrong SNR in a note fails it).
- **P0 cream canvases, finished** (b81b9bc, 098cee9, 09e6c71, 799e6a6, 28f3be6): all remaining canvases (learn-quantum ×6 + its 3 section spheres, mot-designer, cooling-simulator, laser-locking, rb-explorer, zernike, fidelity-budget, imaging-calculator, vacuum-systems). New shared `js/canvas-ink.js` (`AMOInk.wrap(ctx)` maps light inks to dark ones as they're set; learn-quantum has the same inline as `LQ_INK`); documented in CLAUDE.md. Five forever `requestAnimationFrame` loops without a pause control moved to `AMOMotion.loop`. Physics/content bugs found on the way, all fixed and recorded in the page notes:
  - **cooling-simulator: live temperature was 2× the Doppler result** (T_D(1+s+x²)/(2|δ|) instead of /(4|δ|); disagreed with the page's own Doppler chart). Defaults now 157 μK = 1.25 T_D. Test added.
  - **mot-designer: the 3D MOT label disagreed with the σ card** (100 μm vs 58 μm: T_D vs T_MOT and a clamped drawing size); the card's formula line said T_D while its code uses T_MOT. Test added.
  - **imaging-calculator §06 preview showed F_det = 0.00% at the defaults**: background rate used as counts, no background in atom-present shots, read-noise variance added to the Poisson mean, EMCCD read noise not divided by gain. Rebuilt on the calculator's own counts with an EMCCD gain-register model (Basden, Haniff & Mackay, MNRAS 345, 985 (2003), arXiv:astro-ph/0307305), exact θ/P_miss/P_false on the integer grid, checked against 2×10⁵-shot Monte Carlo (TV distance ≤ 0.03, EMCCD variance 2λ). Test added.
  - Invisible labels drawn in the paper colour (MZI phase plate, P₁ trace axis, GS arrowheads, RB axes, laser-lock trace, cooling axis); overlapping labels (laser-lock, fidelity waterfall on phones, imaging legend at 390 px); a blank P₁ trace under reduced motion; the Rydberg Z₂ array overflowing its canvas; vacuum molecules mostly off-canvas at dpr 2; "300000 mK" readout; truncated waterfall labels.
- **P0 stale-number sweep** (0a0599c): 99 mapped groups (home/start-here said the map had 100+), 27 companies & labs (was 25+), 6 platforms (home said 7), home fallback 31 tools (was 28). Test `test_hand_typed_counts_match_content` recomputes each count from its page.
- **P0 llms.txt / llms-full.txt** (02ce171): interactive-figures sections, counts, date; llms-full's MOT capture velocity formula now matches the page (|Δ|/k). **Also fixed: cooling-simulator's Sisyphus scaling** T ∝ U₀²/E_r → k_BT ~ U₀ ∝ I/|δ| (Cohen-Tannoudji, Rev. Mod. Phys. 70, 707 (1998)).
- **Checks per item:** formula tests; `node --check` on touched JS and every inline script; tag counts vs HEAD (only intended `<script>` additions); `smoke.js` vs baseline (full 34-page run against d613a47 after the canvas work: 0 new problems, 0 pre-existing); targeted Playwright per page (corner pixels/CSS per theme, animating vs paused, reduced-motion start state, theme toggle and drag repaint while paused, slider responses, 390 px overflow) with screenshots reviewed; KaTeX rendered locally for the Sisyphus formula.
- **Needs Saumitra (added):** fidelity-budget's Doppler term uses a single-photon k (480 nm for Rb), so it dominates the default budget at 0.16; for counter-propagating two-photon excitation |k₁ − k₂| would make it ≈ 7× smaller. Details in the backlog. Hood Lab ~600-photon callout still open.
- **Stranded git files** after each commit (HEAD.lock, maintenance.lock, tmp_obj_*) were moved into `.git/_to_delete/` (names end `run3-HHMMSS` / `.git_objects_…`); `git fsck --connectivity-only` clean each time.
- **P1 symbol tooltips for keyboard and touch** (59a142b): the 23 `.tip[data-tip]` symbols (cavity-qed, imaging-calculator, lab-calculators) are focusable, carry their text as `aria-describedby`, pin open on tap/click, close on a second tap / tap elsewhere / Esc, and hide on Esc while focused; a tip inside a `<label>` stays open when the tap focuses the input; alignment uses the first line box. Cache bump main.js v=35, styles.css v=25 on all 34 HTML files (diff checked: only the version strings changed). `smoke.js` all 34 pages vs HEAD: 0 new problems; Playwright keyboard/touch/Esc checks and a 390 px screenshot.
- **Push:** tried `git push` once at the end (see summary); commits stay local for Saumitra if it fails.
- **Next up:** P1 Chart.js dark-theme audit (incl. the cream `#faf5e9` tooltip backgrounds on 9 pages), keyboard access for canvas/SVG interactives, print stylesheet, section search, shared-element transitions; then P2 features. Needs Saumitra: fidelity-budget Doppler k, Hood Lab photon count.

## 2026-09-29 00:05 UTC — interactive session (Saumitra said "continue")
- **Lock.** Took it (`running 2026-09-29T00:05:45Z`) and released it at the end, so tonight's 22:48 MT run starts normally. The tree was clean apart from Saumitra's own commit 805cf00 (`Claude outputs/` screenshots).
- **P2 Rydberg Blockade Lab: 3D blockade spheres.** New `js/rydberg3d.js` (`AMO3D.blockadeArray`) plus a card on rydberg-calculator.
  - It uses the page's own R_b and spacing, with three geometries (square, triangular, two layers).
  - Click or [ / ] moves the excitation.
  - The table shows U/ℏΩ = (R_b/d)⁶ and ε ≈ (d/R_b)¹² per neighbour shell.
  - No new external facts, so no new sources; the formulas are the page's own.
  - Tests: formula tests OK 16; `node --check` on the JS and inline scripts; open/close tag counts balanced; `smoke.js` vs baseline showed 0 new problems; targeted Playwright in both themes at 1280 and 390 px, with geometry toggles, click, keys, drag and slider extremes; screenshots reviewed.
- **Next up:** unchanged; P1 first (Chart.js dark-theme audit, keyboard access, print stylesheet, section search, shared-element transitions), then P2 (Zernike 3D surface next).
- **P2 Zernike 3D surfaces, plus two real bugs** (see `docs/page-notes/zernike.md`).
  - **Bug: the PSF and SLM far-field panels showed FFT noise around the Nyquist bin**, from a double fftshift. Now centred on zero frequency, with 512-point padding and fields labelled ±16 λ/D.
  - **Bug: piston lowered the Maréchal Strehl.** σ is now taken about the mean (Mahajan, JOSA 73, 860 (1983)).
  - **New:** `js/surface3d.js` (`AMO3D.surface`) shows W and the PSF in 3D, giving the sampled peak I/I₀ next to the Maréchal estimate.
  - **llms-full.txt:** fixed the Strehl formula and the SLM/Gouy line.
  - **Tests:** formula tests OK 17 (1 new, mutation-checked); `smoke.js` 0 new problems; Playwright checks as in the page note.
- **P1 Chart.js dark-theme audit** (main.js v36, sitewide cache bump on all 34 HTML files).
  - **Method.** Rendered all 57 charts on 23 pages with the real Chart.js 4.4.3. It came from the GitHub release tarball; npm and the CDNs are blocked here, and SRI attributes were stripped only in the test server. Screenshots were taken in both themes, before and after.
  - **Problems found:**
    - dark legend/tick text (`#22190f`, `#5c503c`) unreadable on the dark card;
    - near-black grids (`#1e293b`) drawn over the cream paper;
    - cream tooltips in the dark theme.
  - **Fix.** `AMOChartInk` at the end of main.js wraps each chart's 2D context and maps known inks for the current theme (both directions); data colours are untouched and a theme toggle re-renders every chart.
  - **Before/after review.** Every chart now reads in both themes. Two charts that are empty until the user computes (dd-playground c0, imaging-calculator c0) are empty in the baseline too.
- **qc-landscape.**
  - The qubit-race canvas had invisible labels in both themes (cream text on a cream fill) and blanked on resize. It is now theme-aware.
  - Its dashed "FTQC target" at 10⁶ contradicted the caption's "order 10⁷". RSA-2048 now cites both Gidney & Ekerå 2021 (~2×10⁷ qubits, 8 h) and Gidney 2025 (arXiv:2505.15917, preprint: <10⁶ qubits, <1 week).
  - llms-full.txt updated to match.
- **Cream canvases, round 2, and forever loops.**
  - **Method.** A rendered scan of every canvas in both themes (pixel brightness, all tabs opened) found 6 canvases still cream in the dark theme. Run 3's list only covered `#faf5e9`; these use `#f2ead9`/`#efe7d6`:
    - lab-calculators `eom_canvas`;
    - lab-techniques `fiberCouplingCanvas` and `aomCanvas`;
    - laser-cooling `phononLadderCanvas` and `sisyphusCanvas`;
    - rydberg-calculator `blockadeCanvas`.
  - **Fix.** `canvas-ink.js` v2 maps those creams; the 7 existing pages were bumped to v2. The 5 animated canvases also moved from forever rAF loops to `AMOMotion.loop`. Invisible cream labels were fixed ("lens"; rydberg's "BLOCKADE ACTIVE").
  - **Tests.** Screenshots in both themes reviewed; `smoke.js` 0 new problems on the touched pages. The other flagged canvases are data colour maps (Zernike RdBu/inferno), left as they are.
  - **Still open (backlog):** forever loops without pause on atom-library (pulse), lab-calculators (Gaussian-beam dot), polarimetry (2 loops), qc-landscape (to check).
- **Forever loops, finished.**
  - lab-calculators (Gaussian-beam dot) and polarimetry (2 E-field canvases) now use `AMOMotion.loop`, with one loop per canvas and the frame swapped on recompute.
  - Two decorative loops (atom-library tile glow, qc-landscape hero network) now stop after 5 s and don't run under reduced motion.
  - **Tests.** Playwright checked animating vs paused, reduced-motion start state, and the tiles and hero still after 5.6 s. `smoke.js` found one new overflow (the polarimetry pause row landed inside a flex row); fixed by anchoring the button below the row, then 0 new problems.
  - A `requestAnimationFrame` grep now finds no forever loop without a pause control or a time limit on any page. The shared `js/*3d.js` helpers either have their own pause controls or animate only while dragging.
- **P2 fidelity-budget what-if** (part of "animated error waterfall": clicking a source zeroes it to show what fixing it would buy). The budget table has a "Set to 0" / "Restore" column; every readout follows, and a note compares against the all-sources budget. Page formulas only. Tests: Playwright toggles in both themes and at 390 px; `smoke.js` 0 new problems.

## 2026-09-29 01:15 UTC: chapter navigation for tabbed pages (interactive, Saumitra's request)
- **Problem (Saumitra).** Pages with main-content tabs don't make clear that more content is hidden in the other tabs, and the Page Playbook overshadows the start of the page.
- **Measured before the fix.** The tab rows sat 1,251–2,291 px down on desktop and up to 3,291 px on phones, after the Playbook card and the route-panel. The route-cards described the tabs but were not clickable. Chapters ran 1,400–7,500 px with no reminder of the other chapters and no "next".
- **Built:** `AMOChapters` (main.js v37, styles.css v26, sitewide bump on 34 files):
  - a pinned chapter bar with an n / N counter;
  - a Previous/Next pager at the end of every chapter;
  - route-cards / path steps / stage pills now open chapters (on phones they become a compact 2-column contents list);
  - an automatic chips strip on pages with no index;
  - `#ch-…` deep links, and `#id` inside a hidden chapter opens it (also from in-page links);
  - Page Playbook turned into a slim two-line note on every page.
- **Pages:** lab-techniques, lab-calculators, cooling-simulator, zernike, paper-syllabus, laser-locking, polarimetry.
- **Result.** On phones the lab-techniques tab row moved up from 2,202 px to 1,258 px; lab-calculators from 2,338 to 1,541; laser-locking from 2,349 to 2,160.
- **Tests:**
  - Playwright on all 7 pages, dark 1280 and light 390: sticky at 64 px, tab-click scroll, pager, cards, strip, keyboard, deep links, hash;
  - `smoke.js`, all 34 pages vs HEAD: 0 new problems;
  - formula tests OK 17; inline scripts parse and tags are balanced on every touched page.
- **Recorded:** principle §8 added to `docs/site-philosophy.md`; CLAUDE.md updated.

## 2026-09-29 (morning, interactive): atom-library reorganized around a Periodic Table Explorer
- **Built:** new `js/atom-explorer.js`, with the page restructured around it (details in `docs/page-notes/atom-library.md`). It adds:
  - the table, with the selected-element summary in the table's own gap;
  - 8 "Colour by" lenses, each with a physics caption and a text list of values;
  - an inspector holding the revived level diagram, notes, data sheets and groups;
  - compare mode with isotope pickers;
  - a link from the data table into the explorer.
- **Fixed on the way:**
  - clicking an atom tile threw an error (the level-diagram panel's markup was missing);
  - ⁴⁰K hyperfine splitting was missing from the table (1.286 GHz, Arimondo et al. RMP 1977);
  - the "¹⁹K" typo.
- **Tests:** formula tests OK 17; `smoke.js` 0 new problems; Playwright interaction checks in both themes and on phones.
- **Note:** there are no overnight-run commits after 9fbec4a. This morning the lock still read "running 2026-09-29T01:38:29Z" from the interactive session; it is older than 55 min, so a run should have treated it as stale. Check the scheduled task's run history (the Mac may have been asleep).

## 2026-09-29 13:14 UTC: overnight run (late firing; scheduled 11:48 UTC)
- **Lock** was free (`free 2026-09-29T12:48:05Z`); took it. Tree clean apart from Saumitra's `Claude outputs/`. Formula tests OK 17 at start.
- **P1 Shared-element page transitions: done.** Clicking a card icon (home tool cards, home intent cards, start-here see-also cards) now flies that icon into the next page's hero icon; going back flies it home.
  - `initPageTransitions` in main.js: the clicked icon is named `amo-tool-icon` in `pageswap`, its twin in `pagereveal`, both only when on screen and showing the same glyph; names are cleared when the transition ends. A one-shot `sessionStorage` note (`amo-vt-icon`) carries the glyph. The hero icon is the leading emoji of the first text before the hero `<h1>`, wrapped on demand; emoji and label stay in one inline run so flex badges wrap exactly as before (checked: first- and last-letter positions identical on all 32 pages at 1280 and 390 px).
  - styles.css: group timing (420 ms, site curve) and `:only-child` rules so a one-sided icon leaves/arrives like the page around it.
  - **Icon consistency fixes** found by a scan of every hero vs `NAV`: laser-cooling ❄️→🧊 and cooling-simulator 🌡️→❄️ (NAV + heroes now match home and start-here; 🌡️ had been shared with tof-calculator), dd-playground 💡→🛡️, rb-explorer label gained 📈, google-vs-ibm 🔗→🖥️, psiquantum-vs-xanadu 🔗→💡, learn-quantum ⚛️→🔵. All 32 heroes now equal their NAV icon.
  - **Note: Saumitra committed f48dbf1 ("...") at 13:18 UTC while this run was mid-item.** It swept up this run's first draft (main.js/styles.css v38, 4 icon fixes) and was pushed. The draft made the emoji its own flex item, which on phones changed how two-line eyebrows wrap (seen in a 390 px screenshot). This run's commit fixes that and bumps `main.js` to v39 (styles.css stays v27) so cached v38 copies refresh.
  - **Tests:** formula tests OK 17; `node --check` main.js and inline scripts of touched pages; tag counts unchanged; `smoke.js` vs HEAD baseline: 34 pages × 3 configs, 0 new problems. Targeted Playwright (dark 1280, light 390 touch): forward morph home → mot-designer / cooling-simulator (pseudo-elements `::view-transition-group(amo-tool-icon)` present, old + new), back navigation (card icon named), tool → start-here (hero icon exits alone, no error), start-here see-also → laser-cooling, reduced motion (no transition, no names, no stale note), names cleared after every transition. Mid-transition frames frozen at 90/200 ms and reviewed.
  - No external facts, so no sources.
- **Needs Saumitra (added):** Quantum section numbering disagrees (heroes/home vs start-here vs learn-quantum's "Quantum 01"); 💡 and 🔗 are each shared by two tools in NAV.
- **P1 keyboard access, part 1: lattice lab (google-vs-ibm): done.** `js/vs-lattice.js` v2: each patch is a tab stop; arrow keys move a focus ring to the nearest qubit in that direction, Enter/Space picks, Esc clears, Home/End. The live message names the qubit. Checked in node that arrow keys reach every qubit from every qubit on both patches, and in Playwright (dark 1280, light 390 with reduced motion) that keyboard routes match mouse routes, the ring only shows for keyboard focus, and nothing overflows; screenshots reviewed. `smoke.js` on the page: 0 new problems. Built in the cloud copy and copied over in one step (to keep the working-tree window short while Saumitra was committing).
- **P1 keyboard access, part 2: time tower (paper-syllabus): done.** `js/syllabus3d.js` v2: ] / [ step through the papers in year order (filter-aware) with ring, pinned card and an aria-live line; Enter opens the note in the list; Esc closes. Also fixed: a pinned card no longer stays behind when the tower turns. Playwright in both themes (390 px with reduced motion): 55 steps cover all papers in year order, Enter lands on the right card, Keystone filter gives 11; screenshots reviewed; `smoke.js` 0 new problems.
- **P1 keyboard access, part 3: constellation (start-here): done.** `js/sitemap3d.js` v2, same pattern as the tower: ] / [ step through the pages (or the chosen path), aria-live line, Enter opens the page, Esc closes; the pinned card follows its star when turned. Playwright both themes (390 px reduced motion): all 31 pages reachable, path chip limits to its steps, Enter navigates; screenshot reviewed; `smoke.js` 0 new problems.
- **P1 keyboard access, part 4: globes (amo-groups, qc-landscape): done.** `js/globe3d.js` v2: ] / [ step through the markers west → east, turning the globe to each and pinning its card, with an aria-live line; Enter opens a single entry (the page's own onPick) or moves focus into a cluster list; Esc closes (also from inside the list). The pinned card now follows its marker while turning. Also fixed amo-groups' "1 groups" marker title. Playwright both themes (390 px reduced motion): all 50 / 20 places reachable, Enter opened the right group panel / company card; screenshots reviewed; `smoke.js` 0 new problems. This finishes the P1 keyboard-access item.
- **New P0 for the next run:** amo-groups' "Andersen Group" entry has Halina Rubinsztein-Dunlop (UQ) as PI; needs checking against the groups' own pages.
- **P0 amo-groups "Andersen Group": done.** The entry was the University of Queensland BEC Laboratory mislabelled with Mikkel Andersen's name (his group is at Otago); its link host no longer resolves. Renamed to "UQ BEC Laboratory" (Tyler Neely & Halina Rubinsztein-Dunlop), link https://www.uq-bec.org/, focus limited to what the sources support, paper year 2017 (Crossref). Sources: uq-bec.org (via search listing; the site blocks fetching), https://about.uq.edu.au/experts/60, https://www.otago.ac.nz/physics/staff/mikkelandersen, https://api.crossref.org/works/10.1088/2040-8978/19/1/013001. Rendered check: the panel shows the new name, PIs and both links; formula tests OK 17. New P2: add Otago's Andersen group.
- **Wrap-up (about 14:05 UTC).** Six commits this run: 924468f (shared-element transitions + hero icon fixes), 14ffc7d (lattice lab keyboard), f258f5b (time tower keyboard), 467bb2d (constellation keyboard), 23e35ab (globes keyboard), 2adeee1 (UQ BEC Laboratory entry), plus this log line. `git push` from the Mac VM failed as expected (proxy 403), so the commits are local and ready for Saumitra to push. Stranded `HEAD.lock` / `maintenance.lock` / `tmp_obj_*` files from each commit were moved to `.git/_to_delete/` (suffixes `run0929b*`); `git fsck --connectivity-only` is clean. Stopped here rather than starting the print stylesheet or section search, because both change main.js/styles.css sitewide and Saumitra was committing in the same tree this morning.
- **Next up:** P1 print stylesheet, P1 section search, P1 glossary hovercards; then P2 (Otago Andersen group, velocity-space flow, Poincaré trajectory, …). Needs Saumitra: Quantum section numbering, shared NAV icons (💡, 🔗), fidelity-budget Doppler k, Hood Lab photon count.
