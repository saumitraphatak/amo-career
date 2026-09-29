# pages/cooling-simulator.html

**Purpose:** Interactive Doppler + Sisyphus/gray-molasses cooling simulator.

## Flow
1. Route panel — "Separate free-space cooling from trapped-atom cooling" + 4 cards.
2. **6 tabs**: ① Doppler Cooling, ② Sub-Doppler & Gray Molasses, ③ Sideband Cooling, ④ Method Comparison, ⑤ Simulation Codes (links to `pylcp` etc.), ⑥ References.

## Review outcome: approved, no changes
Cards 01-04 map cleanly to tabs ①-④. Tabs ⑤ and ⑥ are reference/supplementary material (external code links, citations), not workflow steps — same category the site consistently excludes from route-panels everywhere (see `docs/site-philosophy.md` §2). Checked the mapping explicitly before concluding this — it's a legitimate exclusion, not a gap like lab-calculators/lab-techniques had.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.

## Cross-page consistency audit update (2026-09)
Hero eyebrow read "Trap, Image & Cool 06" — one off from its correct position once laser-cooling.html (the previous page in `NAV.trapImageCool` order) was corrected from a duplicate "05" to "06". Bumped to "07". See docs/cross-page-consistency-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark (found and corrected a stray, misleading `<!-- /page-wrap -->` comment in the process — the div actually already closed before the footer, matching the site norm); added `scope="col"` to 6 table column headers; wired `for=`/`id` on 8 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Cooling Simulator" -- stale from whenever this page was renamed to "Laser Cooling Simulator" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 5 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 5 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.

## Cross-page consistency re-audit (2026-09-18)
`BreadcrumbList` JSON-LD named this page's category "Measure & Cool" (the category's pre-rename name), while the hero eyebrow and NAV dropdown already said "Trap, Image & Cool." Corrected the breadcrumb to match. See docs/cross-page-consistency-audit-2026-09-18.md.

## Cross-page consistency re-audit (2026-09-18)
Home page's tools-grid badge for this page said "TRAP 06," one behind this page's own hero eyebrow ("07", set when laser-cooling.html took "06" in the original audit) — the home badge was never updated at the time. Fixed to "TRAP 07". Also fixed a stale "Measure & Cool" breadcrumb category name to "Trap, Image & Cool" (see separate note above). See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its BreadcrumbList JSON-LD leaf name used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 4 labels rendered differently after the fix, e.g. "FORCE CURVE F(V), INTERACTIVE" → "FORCE CURVE F(v), INTERACTIVE"; "T_DOPPLER VS DETUNING" → "T_Doppler VS DETUNING". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight run 3): live Doppler-cooling histogram, a factor-2 temperature bug and theme/pause
- **Temperature was 2× too high (physics bug).** `computeTTarget` returned T_D·(1 + s + (2δ/Γ)²)/(2|δ/Γ|). Doppler theory gives k_BT = (ℏΓ/4)(1 + s + (2δ/Γ)²)/(2|δ|/Γ), i.e. T = T_D·(1 + s + (2δ/Γ)²)/(4|δ/Γ|), which is T_D at δ = −Γ/2, s → 0 (the same form the page's own Doppler-tab chart uses, `(1 + (2δ)²)/(4|δ|)` in units of T_D, and mot-designer's T_MOT). At the defaults (δ = −0.5Γ, s₀ = 0.5) the readout now settles at 157 μK = 1.25 T_D instead of 314 μK; at δ = −1.5Γ, 220 μK = 1.75 T_D. Regression test `test_cooling_simulator_doppler_temperature` added.
- **Readout.** It printed "T ≈ 300000 mK" at the start; temperatures ≥ 1 K now print in K.
- **Axis.** The labels were drawn in the paper colour (invisible) and said "−v_rms / +v_rms" at the edges, which are at ±3.5 v_rms(300 K) = ±479 m/s for Cs; they now print ±479 m/s. The Doppler-limit marker is now ±σ_v at T_D (the 1D rms √(k_BT_D/m) ≈ 9 cm/s, the same σ as the histogram) instead of √(2k_BT_D/m); at this scale it sits on the zero line either way. A code comment said v_rms(300 K) ≈ 170 m/s for Cs; it is ≈ 137 m/s.
- **Theme and motion.** The canvas was cream in the dark theme; it now uses `js/canvas-ink.js` (`AMOInk.wrap`) with CSS background `var(--bg-card)`. The forever `requestAnimationFrame` loop is now `AMOMotion.loop` (Pause button under the readout row, offscreen stop, reduced-motion still frame). While paused, slider changes jump straight to the new equilibrium so the histogram and readout still respond; theme toggles and resizes repaint without stepping. `role="img"` + `aria-label` on the canvas.
- Checks: formula tests OK 14; `smoke.js` 0 new problems; Playwright dark/light 1280 animating + pause, 390 reduced motion with a slider change (157 → 220 μK) and a theme toggle; screenshots reviewed.

## 2026-09-28 (overnight run 3): Sisyphus temperature scaling corrected
- The Sub-Doppler tab gave T_Sisyphus ∝ U₀²/E_r ∝ I²/(δ²E_r). Sisyphus cooling gives k_BT_Sis ~ U₀, the light-shift depth, with U₀ ∝ Ω²/|δ| ∝ I/|δ| for |δ| ≫ Γ (C. Cohen-Tannoudji, Nobel lecture, Rev. Mod. Phys. 70, 707 (1998); also Dalibard & Cohen-Tannoudji, JOSA B 6, 2023 (1989)), down to a floor of tens of recoil energies. The formula box now reads k_BT_Sisyphus ~ U₀ ∝ I/|δ| (|δ| ≫ Γ) with one sentence and the citation; llms-full.txt had the same formula and was corrected. Rendered with KaTeX (local copy) and checked by screenshot. Guarded in `test_cooling_simulator_doppler_temperature`.

## 2026-09-29: chapter navigation (Saumitra: "not obvious that the page has more information")
The page's main tabs are now "chapters" (`data-chapters`, `AMOChapters` in main.js; see `docs/site-philosophy.md` §8):
- a chapter bar pinned under the site nav, with an n / N counter;
- a Previous/Next pager at the end of every chapter;
- deep links: `#ch-…`, or any `#id` inside a hidden chapter, opens that chapter.

The four route-cards open chapters 1–4. Simulation Codes and References have no card, as agreed earlier (reference material); they are in the pinned bar and the pagers. The Page Playbook above it is now a slim two-line note instead of a large card. Checked with Playwright in dark 1280 and light 390 px:
- the bar sticks at 64 px while scrolling a chapter;
- clicking a tab deep inside a chapter lands at the start of the new one;
- the pager, index cards, keyboard (Enter), deep links and hash updates all work.

`smoke.js` on all 34 pages: 0 new problems.
