# pages/imaging-calculator.html

**Purpose:** Single-atom fluorescence imaging SNR calculator — "follow the photons from atom to threshold."

## Flow (post-fix)
1. Page hero.
2. Route panel — 7 cards, 1:1 with sections (see below).
3. **01 Imaging Beam** (transition/scattering-rate inputs) → **02 Collection & Camera** (NA/QE/camera model) → **03 Results** (live SNR meter) → **04 SNR vs Exposure Time** (chart) → **05 Imaging Histogram & Detection Fidelity** (theory: what bright/dark peaks and detection fidelity mean) → **06 Fluorescence Histogram — Threshold Preview** (live canvas driven by current inputs) → **07 Physics & Formulas** → **08 References**.

## Review outcome: changed (significant, two issues)
1. **Ordering bug:** originally, section 05 (the *live* histogram preview) appeared **before** section 07 (the *theory* explaining what a bimodal histogram, dark/bright peaks, and detection fidelity actually are). A first-time visitor hit the live simulation before the concept that makes it legible. Fixed by moving the theory section to sit right before the live preview: old 07 → new 05, old 05 → new 06, old 06 (Physics & Formulas) → new 07. Verified with an exact line-range extraction + assertion that each moved block started with its own expected heading, plus a post-write balance check (`<section>`/`</section>`, `<div>`/`</div>` counts) and a full regression-suite run — see `docs/site-philosophy.md` §4 and §7.
2. **Route-panel mismatch:** 4 cards for 7 real sections; "06 Physics & Formulas" wasn't represented by any card at all. Expanded to 7 cards matching the new order exactly.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 4 table column headers; wired `for=`/`id` on 17 label/input pairs; added `aria-hidden="true"` to 7 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 8 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 8 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.

## Cross-page consistency re-audit (2026-09-18)
`BreadcrumbList` JSON-LD named this page's category "Measure & Cool" (the category's pre-rename name), while the hero eyebrow and NAV dropdown already said "Trap, Image & Cool." Corrected the breadcrumb to match. See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 3D photon-collection figure (2026-09-28)
A new "Where the photons go" panel (`#coll3d`, from `js/collection3d.js?v=1` plus `js/orbit3d.js?v=2`) sits at the end of section 02, "Collection & Camera", and follows the NA slider.

- **What the figure shows.** The atom sits at the centre with its emission pattern drawn as a wireframe. The collected cap θ < θ_max = arcsin NA (n = 1) is bright on a reference sphere, with the objective drawn beyond it. A Monte Carlo photon stream is sampled from the chosen pattern, and its running tally converges on η.
- **Three emission patterns and their η.**
  - Isotropic: η = (1 − c)/2. This is exactly the page's `collectionGeo()` and is what the calculator uses.
  - Dipole ⊥ optical axis: η = (3/8)[(1 − c) + (1 − c³)/3]. σ± light with the quantization axis along the objective gives the same φ-averaged pattern, (1 + cos²θ)/2, so the same η.
  - Dipole ∥ axis: η = (3/4)[(1 − c) − (1 − c³)/3].
  - In all three, c = √(1 − NA²).
  - All three formulas were checked against a 10⁶-sample Monte Carlo at NA 0.3, 0.5, 0.7 and 0.95; they agree to within 0.1%.
- **Scope.** The calculator itself is unchanged and still uses the isotropic value. The panel says so, and says that η here is geometric only (the calculator then applies T and QE).
- **Motion.** There is a "Pause photons" button (WCAG 2.2.2). Under reduced motion there is no photon stream; the static geometry remains. The animation also pauses offscreen.
- **Fact fix.** The "Collection geometry" accordion said isotropic emission at NA = 0.95 captures "~26%". The page's own exact formula gives 34.4%, so it now says ~34%.
- **Not changed (ambiguous, flagged).**
  - The Hood Lab tooltip says "NA 0.6 → η ≈ 8%", and the alkali card says "NA=0.5, η≈5%". These look like totals including T·QE rather than η_geo (which would be 10% and 6.7%). Worth rewording to say which η they mean.
- **Pre-existing, not caused by this change.** At 390 px the page scrolls horizontally to 501 px because of `.fidelity-badge` and `.noise-table`.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The two inline three-card grids (η / scattered / detected, and fidelity / t_min) are now `.trio-row`: three columns on desktop, and on phones the first card spans the width with two below. The noise-budget table is wrapped in `.table-scroll`.
- Noticed but not changed here: the uppercase `.prop-card-label` turns "η" into "Η" and "θ_opt" into "Θ_OPT" (sitewide Greek-in-uppercase issue, now a backlog item).

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 6 labels rendered differently after the fix, e.g. "R_MAX AT SATURATION" → "R_max AT SATURATION"; "COLLECTION EFFICIENCY Η" → "COLLECTION EFFICIENCY η". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight): which η, and two preset-note errors
- **η wording (backlog P0).** The page's calculator uses η = η_geo × QE × T with η_geo = (1 − √(1 − NA²))/2. The Hood Lab tooltip said "NA 0.6 → η ≈ 8%" and the alkali card "NA=0.5, η≈5%", but η_geo is 10.0% at NA 0.6 and 6.7% at NA 0.5, so both figures are totals. They now say so: "η_geo = 10% …; total η = η_geo × QE × T ≈ 8%" and "(η_geo ≈ 6.7%; total η … ≈ 5%)". The ≈8%/≈5% figures themselves are unchanged; 5% is consistent with the card's own ~750 detected photons at R_sc = 3×10⁶/s for 5 ms. The calculator is untouched.
- The tooltip's anchor text is now non-breaking ("NA&nbsp;=&nbsp;0.6&nbsp;objective"): at 390 px it wrapped over two lines and the bubble was cut off at the right edge.
- **Histogram preset notes.**
  - Rb87 said "EMCCD" and then "sCMOS read noise". It now derives its own σ_bright: √(2·800 + 12²) ≈ 42 e⁻ (EMCCD excess noise doubles the shot-noise variance, plus the 12 e⁻ read noise), which matches the preset's 42.
  - Yb171 called 556 nm "the clock line" with a "higher scatter rate". 556 nm is the ¹S₀→³P₁ intercombination line (Γ/2π ≈ 182 kHz, vs ≈ 29 MHz at 399 nm); the clock line is 578 nm (Γ/2π ≈ 7.6 mHz). Source: "¹⁷¹Yb Reference Data", arXiv:2509.04416 (preprint), Tables 8–10. The unsupported "higher scatter rate" clause was removed.
  - Sr88 ended "Ericsson/Ye-group typical parameters", an attribution with no citation; it now says "Illustrative parameters".

## 2026-09-28 (overnight run 3): histogram preset notes match the page's own numbers
The four "Interactive Histogram Simulator" preset notes quoted SNR and fidelity figures that the page's own code does not produce for those presets. Recomputed each with the page's `computeHistMetrics` / `computeOptThreshold` / `normCDF` (and cross-checked with an exact erfc in Python):

| Preset | Peaks (μ±σ, bright / dark) | Old note | Page computes |
|---|---|---|---|
| ⁸⁷Rb | 800±42 / 55±14 | SNR~11 → F>99.98% | SNR 16.83; Gaussian overlap error ≈ 1×10⁻⁴⁰ |
| ¹⁷¹Yb | 1200±38 / 40±11 | SNR~16, "F>99.99% routinely achievable" in "Kaufman-group style tweezers" | SNR 29.32; overlap error ≈ 3×10⁻¹²⁴ |
| ⁸⁸Sr | 950±52 / 65±18 | F~99.95% | SNR 16.08; overlap error ≈ 5×10⁻³⁷ |
| Marginal | 280±85 / 120±55 | button "SNR≈4", F~97–98% | SNR 1.58; F 87.75% at θ_opt = 195 (P_miss 15.9%, P_false 8.6%) |

- The notes now quote the page's values, say that at these separations the two-Gaussian overlap is negligible and real experiments are limited by what the model leaves out (atom loss or heating during the exposure, non-Gaussian tails such as EMCCD multiplication noise), and are marked "Illustrative parameters". The Marginal button reads "Marginal (SNR≈1.6)". Preset numbers are unchanged, so the histograms look the same.
- The unsourced "Kaufman-group style" attribution and "F>99.99% routinely achievable" were dropped. In their place the Sr88 note cites a measured benchmark on the same 461 nm line: Covey, Madjarov, Cooper & Endres, *2000-times repeated imaging of strontium atoms in clock-magic tweezer arrays*, PRL 122, 173201 (2019), arXiv:1811.06014 (⁸⁸Sr, 813.4 nm tweezers, Sisyphus cooling on the intercombination line): imaging fidelity 0.99991(1), survival 0.99932(8). Checked against https://arxiv.org/abs/1811.06014 and the PDF.
- **Follow-up, same run: tails below double precision.** `normCDF` returns the lower tail as 1 − (1 − tail), which floors at ~10⁻¹⁶. So for these presets P_miss/P_false printed 0.0000%, the fidelity 100.000%, and the "optimal" threshold search wandered on a flat floor (Sr88: 519 e⁻ instead of the true minimiser 293.7 e⁻; Rb87 452 vs 242.1; Yb171 885 vs 300.9). The histogram now uses `normTail(x) = erfc(x/√2)/2` with the Numerical Recipes `erfcc` fit (fractional error < 1.2×10⁻⁷ for all x; checked against Python's `math.erfc` from x = −3 to 26), so θ_opt lands on the true minimiser (242 / 301 / 294 / 195 e⁻, matching a brute-force exact search to < 0.5 e⁻) and tiny values print as "1 − 9.7×10⁻⁴¹" and "1.4×10⁻³⁸%". The Marginal preset's numbers are unchanged (87.750%). At 390 px the long values first overflowed the two-column card grid; the grid is now `minmax(0,1fr)` columns and scientific values use a smaller `.hist-sci` style with a real `<sup>` exponent. A regression test (`test_imaging_histogram_presets_match_notes`) checks that each note's quoted SNR rounds from the preset's numbers, that the Marginal note's F ≈ 88% holds, and that the histogram uses `normTail`. The main calculator's `detectionFidelityGaussian` still uses `normCDF` (it only prints the fidelity to 3 decimals, so the floor doesn't show there).
- The Hood Lab callout (~600 photons) is still under "Needs Saumitra" in the backlog.

## 2026-09-28 (overnight run 3): section 06 histogram preview uses the calculator's numbers and camera model
The animated "Fluorescence Histogram — Threshold Preview" (`fluorHistCanvas`) showed **F_det = 0.00%, P_false_alarm = 1** at the default settings. Causes, all fixed:
- It read the **background rate** label (photons/s, default 100) as the per-shot background count; the calculator's per-shot N_bg at the default exposure is 0.5. `compute()` now publishes its own `N_sig, N_bg, N_dark, σ_read, camera, gain` as `window.IMG_LAST` and the preview uses those.
- **Atom-present shots had no background**: their mean is now N_sig + N_bg + N_dark (empty: N_bg + N_dark), as in the calculator's `detectionFidelityGaussian`.
- The fidelity used Poisson CDFs whose **mean had the read-noise variance added to it** (λ + σ²), which shifts the distribution instead of widening it; with EMCCD read noise 30–60 e⁻ that put the empty-tweezer peak far above the threshold.
- The read noise was a triangular ±σ distribution (rms σ/√6), and the EMCCD's pre-gain read noise was used undivided.

New model (one comment block in the code, source cited): sCMOS / ideal = Poisson + Gaussian read noise σ_read (0 for ideal); EMCCD = Poisson photo-electrons, each multiplied in the gain register, n → Gamma(n, 1) in input-e⁻ units (high-gain model of Basden, Haniff & Mackay, MNRAS 345, 985 (2003), arXiv:astro-ph/0307305, which gives the √2 excess-noise factor the calculator uses), + σ_read/G. The same model is evaluated exactly on the integer count grid (Gaussian above 1500 counts) to get θ_opt (atom ⇔ count ≥ θ, minimising P_miss + P_false), P_miss, P_false and the dotted envelopes (now binned expected counts; before they were a Poisson pmf at bin centres, not scaled by the ~3-count bin width). Checked against 2×10⁵-shot Monte Carlo of the page's own sampler for six parameter sets (sCMOS, ideal, EMCCD at low and high counts): means and variances agree (EMCCD variance 2λ), total-variation distance ≤ 0.03.
- Results at the defaults: F_det > 1 − 10⁻¹² (printed as a bound; the model's sums are good to ~10⁻¹⁵). At a 0.1 ms exposure (N_sig = 5.7): EMCCD F_det = 69.97% (P_miss 0.21, P_false 0.093), whose equal-prior average 1 − (P_miss + P_false)/2 = 84.9% matches the calculator's 85.2%; sCMOS 74.2% vs the calculator's 87.1%.
- The section text now says what is simulated and that this preview's F = 1 − P_miss − P_false is the stricter convention while the calculator quotes 1 − (P_miss + P_false)/2.
- **Theme and motion:** cream canvas in the dark theme → `js/canvas-ink.js` + `var(--bg-card)`; the forever `requestAnimationFrame` loop → `AMOMotion.loop` (Pause button in the readout row). Under reduced motion or while paused it shows the finished 300-shot histogram (and refills it when settings change) instead of an empty one. On canvases narrower than 520 px the legend takes two lines, the θ label moves inside the plot and the P values are only shown below the canvas (they overlapped).
- Regression test `test_imaging_histogram_preview_uses_calculator_counts`.

## 2026-09-28 (overnight run 3): symbol tooltips work with keyboard, touch and screen readers
Sitewide change in main.js / styles.css (`main.js?v=35`, `styles.css?v=25`). The dashed-underline `.tip[data-tip]` symbols (2 on this page) only showed their bubble on mouse hover: the spans weren't focusable, a tap on a phone did nothing reliable, and screen readers never got the text. Now each is focusable (Tab shows the bubble, with a focus ring), its text is its accessible description (`aria-describedby` → a hidden `#amo-tip-descs` list), a tap or click pins the bubble open (tap again, tap elsewhere or Esc closes it), and Esc hides a keyboard-focused bubble (WCAG 1.4.13). A tip inside a `<label>` stays open when the tap moves focus to the label's input. Edge alignment now measures the first line box, so an anchor that wraps no longer misplaces its bubble. Checked in Playwright: all tips focusable with matching descriptions, focus shows / Esc hides / refocus shows, tap opens at 390 px (touch emulation), click elsewhere closes; `smoke.js` 0 new problems on all 34 pages.
