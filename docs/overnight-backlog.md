# Overnight backlog

This is the work queue for the overnight runs (see `docs/overnight-runbook.md`). Take the **first unchecked item** in priority order; P0 always comes before P1/P2. Tick an item (`- [x]`) with the date and commit hash when it ships.

An item may be split into smaller pieces. Add new ideas at the right priority, and keep them scientific and grounded in what the page already teaches.

---

## P0: bugs and correctness (do these first)

- [x] **Horizontal overflow on phones (390 px), 12 pages.** Done 2026-09-28 overnight (commit: see log). All 34 pages fit at 390 and 360 px with KaTeX rendered; the smoke test reports no overflow. Also fixed on the way: dollar amounts typeset as maths on 3 industry pages. Found by `tests/browser/smoke.js` on 2026-09-28. Widths at 390 px:
  - cavity-qed 409 · dd-playground 436 · decoherence-lab 736 · fidelity-budget 432
  - imaging-calculator 501 · lab-techniques 426 · laser-cooling 582 · polarimetry 636
  - rb-explorer 569 · rb87-vs-yb171 432 · rydberg-calculator 413 · vacuum-systems 555

  Find the widest offending element per page. Known causes include `.fidelity-badge` / `.noise-table` (imaging), `.sys-table` (cavity-qed) and the sticky topic-nav (rb87). The fix is usually a wide table without a scroll wrapper (`overflow-x:auto`), a fixed-width canvas/SVG, or a long unbroken mono string. Fix the cause (wrap tables, `max-width:100%`, `overflow-wrap:anywhere` on mono strings), not with `overflow-x:hidden` on body. Done when `smoke.js` reports no overflow on any page. Do a few pages per run if needed.
- [x] **Greek letters and units mangled by uppercase labels (sitewide, correctness).** Done 2026-09-28 overnight run 2 (see log): a case-keep pass in main.js; 136 labels on 25 pages now display the right symbols, plus KaTeX in uppercase labels. CSS `text-transform: uppercase` on labels, table headers and `h5`s turns symbols into different symbols: γ/2π → Γ/2Π (cavity-qed: γ and Γ are different rates), κ → K, σ → Σ, η → Η, μm → ΜM, nm → NM, MHz → MHZ, k_B → K_B. Found by a scan of every page on 2026-09-28 (≈75 labels on 19 pages: absorption-imaging, atom-library, cavity-qed, decoherence-lab, fidelity-budget, imaging-calculator, lab-calculators, lab-techniques, laser-locking, learn-quantum, mot-designer, polarimetry, rb-explorer, remote-entanglement, rydberg-calculator, tof-calculator, tweezer-designer, zernike, plus table headers). Suggested fix: a small main.js pass after KaTeX that wraps Greek letters, unit tokens (nm, μm, MHz, kHz, μK, ms, μs, mbar, …) and `x_y` subscripts inside uppercase-styled text in `<span class="case-keep">` (`text-transform:none`). Keeps the label style, restores the physics. Screenshot a few labels in both themes.
- [x] **imaging-calculator η wording.** Done 2026-09-28 overnight run 2 (see log). Also fixed two histogram-preset notes (EMCCD/sCMOS contradiction; 556 nm called the clock line). The Hood Lab tooltip says "NA 0.6 → η ≈ 8%" and the alkali card says "NA=0.5, η≈5%". Both look like totals including transmission × QE, since η_geo would be 10% and 6.7%. Reword each to say which η it means (e.g. "total detection efficiency ≈ 8% (η_geo 10% × optics × QE)"), using the page's own formula. Don't change the calculator.
- [x] **imaging-calculator histogram presets: check the "SNR~N → F>…" claims against the page's own definitions.** Done 2026-09-28 overnight run 3 (see log): notes now quote the page's own SNR/F; Marginal button SNR≈1.6; Sr88 cites Covey et al. PRL 122, 173201 (2019). The Hood Lab part stays under "Needs Saumitra". The Rb87 note says "Peak separation SNR~11 → F>99.98%", but with its own peaks (800±42 vs 55±14) (μ_b−μ_d)/√(σ_b²+σ_d²) ≈ 16.8 and the optimal-threshold fidelity is far above 99.98%. Yb171 says "SNR~16", Sr88 "F~99.95%", Marginal "F~97–98%". Compute each from the page's `detectionFidelityGaussian` / threshold code for the preset numbers and make the notes match (or drop the figure). Also the Hood Lab callout: "~600 photons" in 2 ms at s ≈ 2, Δ = −2Γ implies R_sc ≈ 2×10⁶/s → ~4000 scattered, so ~600 collected needs η ≈ 15%, above the tooltip's 8% total. Ask Saumitra before changing his lab's numbers (put it under "Needs Saumitra" if unsure).
- [x] **Oxford Ionics is now part of IonQ** Done 2026-09-28 overnight run 2 (qc-landscape card rewritten with sources; quantinuum-vs-ionq already correct). (acquisition completed September 2025, per IonQ's investor release). The deep-dive card on `qc-landscape.html` and any mention on `quantinuum-vs-ionq.html` should say so. The globe tooltip already does. Verify with a primary source first.
- [ ] **Hard-coded cream canvas backgrounds in dark theme.** Several older canvases draw `#faf5e9` in both themes. They are listed in `docs/3d-visualization-audit-2026-09-28.md` open item 4 (learn-quantum spheres and animations, dd-playground FID/CPMG, the Rabi sphere). Make them theme-aware (read `document.documentElement.dataset.theme`, redraw on the existing theme MutationObservers) without changing the physics. Check both themes by screenshot.
  - Run 2 found **18 canvases on 11 pages** that paint or show `#faf5e9` in dark theme (rendered check: CSS background or corner pixel):
    - [x] dd-playground `fidCanvas`, `cpmgCanvas` (2026-09-28 run 2; pattern: `PAL.light/PAL.dark` picked per frame + a `data-theme` MutationObserver that repaints the current frame);
    - [ ] learn-quantum `mziCanvas`, `rabiBlochCanvas`, `rabiTraceCanvas`, `tqBellCanvas`, `groverCanvas`, `rydbergArrayCanvas`;
    - [x] rb87-vs-yb171 `rbBlochCanvas`, `ybBlochCanvas` (2026-09-28 run 2; also got a pause control via `AMOMotion.loop`, it had none);
    - [ ] mot-designer `motCanvas`;
    - [ ] cooling-simulator `mbCanvas`; fidelity-budget `waterfallCanvas`; imaging-calculator `fluorHistCanvas`; laser-locking `lockCanvas`; rb-explorer `rbAnimCanvas`; vacuum-systems `.mol-canvas`; zernike `gsFlowCanvas`.
    - Chart.js tooltips with `backgroundColor:'#faf5e9'` (atom-library, cavity-qed, dd-playground, fidelity-budget, imaging-calculator, lab-techniques, mot-designer, rb-explorer, tof-calculator) belong to the P1 Chart.js dark-theme audit.
- [ ] **Stale-number sweep.** Hero chips and stat pills that hard-code counts ("25+ Companies", "100+ groups", "55 Papers", "15 species") should match the page content. Fix, or derive from the DOM where cheap.
- [ ] **llms.txt / llms-full.txt** should mention the 2026-09-28 additions (globes, time tower, constellation, comparison-page interactives). Keep them factual.

## P1: polish that makes it feel finished

- [ ] **Shared-element page transitions.** On home → tool page navigation, morph the clicked tool card's icon into the page hero's eyebrow icon. The cross-document view transitions are already on (`docs/motion-and-transitions.md`). Name only the clicked element (set `view-transition-name` in `pageswap` on the card's icon and in `pagereveal` on the target hero) so names stay unique.
- [ ] **Keyboard access for canvas/SVG interactives** that are mouse-only today:
  - lattice lab qubits (google-vs-ibm): arrow keys move a focus ring, Enter picks;
  - time tower papers (paper-syllabus);
  - constellation stars (start-here);
  - globe markers (a "list of markers" button is acceptable).
- [ ] **Print stylesheet** (`@media print` in styles.css):
  - hide the nav, topic-nav, pause buttons, search and 3D canvases that don't print well;
  - expand all accordions and show every tab panel with its tab label as a heading;
  - black-on-white, with link URLs after external links.

  Researchers print these pages. Needs the sitewide cache bump.
- [ ] **Search: jump to sections, not just pages.** Index every page's `h2`/`h3` (id + text) at build time into a small static JSON (generated by a one-off script and committed, since there's no build step). Show section hits under page hits in the search modal and scroll to the anchor.
- [ ] **Symbol tooltips for keyboard and touch.** Also: a `.tip` whose anchor text wraps onto two lines gets a mis-placed bubble (alignTip measures the whole two-line box); imaging-calculator's was fixed with `&nbsp;`, a general fix would measure `getClientRects()[0]`. `.tip[data-tip]` bubbles (cavity-qed, imaging-calculator, lab-calculators) show on hover and `:focus-visible`, but the spans aren't focusable, so keyboard users never see them. Make them focusable (`tabindex=0`) or fold them into the glossary hovercards below.
- [ ] **Glossary hovercards.** For ~40 core terms (Lamb–Dicke parameter, Rabi frequency, cooperativity, SPAM, T₂*, erasure, quantum volume, …), add a small `js/glossary.js`. It wraps the first occurrence per page in a dotted-underline term with a one-line, sourced definition, and links to the page that teaches it. Opt-in per page, no sitewide auto-wrapping of every occurrence.
- [ ] **imaging-calculator histogram tails below double precision.** `normCDF` returns the lower tail as 1 − (1 − tail), so for well-separated peaks P_miss/P_false print 0.0000% and `computeOptThreshold` lands anywhere on a flat floor (Sr88 preset: 519 e⁻, true minimiser ≈214 e⁻ where the two weighted densities cross). Add an upper-tail function that never subtracts from 1 (e.g. `0.5*erfc(x/√2)` with a proper erfc), minimise log(P_miss+P_false) or solve for the density crossing, and show tiny probabilities in scientific notation ("3×10⁻¹⁷"). Add a regression test.
- [ ] **Chart.js dark-theme audit.** Screenshot every chart in both themes (the real Chart.js is blocked in the sandbox: check whether the page sets theme-aware colours in code, and if it doesn't, add a small helper). Grid and tick colours must be readable in both themes.

## P2: new "amaze" features (scientific, built from each page's own physics)

Each one:
- sits inside the page's existing section structure;
- uses the page's own formulas and inputs;
- is labelled "schematic" where it isn't to scale;
- has a text version of the numbers.

- [ ] **Zernike Wavefront Lab: 3D wavefront surface.** Draw the page's computed wavefront as a rotatable height map (`AMO3D.orbit`), next to the existing colour map, so astigmatism's saddle, defocus's bowl and coma's tilt read instantly. Include the PSF as a second surface if cheap.
- [ ] **Rydberg Blockade Lab: 3D blockade spheres.** A small 3D tweezer array with translucent spheres of radius R_b = (C₆/ħΩ)^{1/6}, computed live from the page's own C₆ and Ω. Pairs inside R_b are highlighted, with counts of blockaded nearest and next-nearest neighbours.
- [ ] **Laser Cooling Simulator: velocity-space flow.** Arrows show the page's Doppler/Sisyphus force F(v) acting on a Maxwell–Boltzmann cloud relaxing toward the Doppler limit (Monte Carlo with the page's parameters). Include a pause button.
- [ ] **Polarimetry: Poincaré trajectory.** As a waveplate rotates, trace the output polarization's path on the sphere (the page's Jones/Mueller maths), with QWP and HWP presets.
- [ ] **Absorption Imaging: 3D column-density surface.** Show the page's simulated OD image as a surface; the cursor reads out column density at a point.
- [ ] **Fidelity budget: animated error waterfall.** The 8 error sources stack into total infidelity. Clicking a source zeroes it to show "what if we fixed this".
- [ ] **Randomized benchmarking: live sequence.** Random Clifford sequences of growing length as cards; survival points fall onto the fitted decay curve in real time.
- [ ] **Remote entanglement: Barrett–Kok timeline.** Photons leave two nodes, meet at the beam splitter, and detector clicks herald success. Tally the success rate against the page's η and loss numbers.
- [ ] **Vacuum systems: pump-down curve.** An interactive pressure-vs-time model with chamber volume, pumping speed, outgassing rate and bakeout, using standard textbook forms (cite a source such as Hablanian or the Pfeiffer vacuum handbook). Mark the UHV regimes.
- [ ] **Atom library: level-diagram explorer.** For the selected species, draw the cooling transition, repumper and qubit levels (Grotrian-style) from the page's own constants, with wavelengths on the arrows.
- [ ] **Home: "today in AMO".** A rotating, sourced fact card built from the site's own references (e.g. the record numbers already cited on pages), linking to the page that explains it. No external feeds.

## Needs Saumitra (don't do these unattended)
- **imaging-calculator Hood Lab callout numbers** (found 2026-09-28 run 2). It says ~600 photons collected from Rb in 2 ms at s ≈ 2, Δ = −2Γ with an NA 0.6 objective and total η ≈ 8%. The two-level scattering rate at those settings is (Γ/2)·s/(1 + s + 4Δ²/Γ²) ≈ 2.0×10⁶ s⁻¹, so ~4000 photons are scattered in 2 ms and 8% of that is ~320, not ~600 (600 would need η ≈ 15%, above the 10% geometric limit at NA 0.6). Which number is right: the photon count, the exposure, the saturation/detuning, or the efficiency? Gray molasses during imaging changes the scattering, so the two-level estimate may not apply; worth one line of explanation on the page either way.
