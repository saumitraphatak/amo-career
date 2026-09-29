# pages/zernike.html

**Purpose:** "Zernike Wavefront Lab" — the optical vocabulary behind imperfect objectives, shaped tweezers, SLM holograms, and PSFs.

## Flow
1. Page hero — animated SVG wavefront; frames: start from one mode, combine aberrations, watch Strehl fall, connect pupil phase to focal-plane light.
2. **"What problem is this page solving?"** — plain-language framing card before any interactivity.
3. **5 numbered tabs**: 01 Learn a Mode → 02 Build & Diagnose → 03 SLM → Far Field → 04 Recover Hologram → 05 Mode Atlas.
4. Sources.

## Review outcome: approved, no changes
Same pedagogical shape as polarimetry (single concept → combine → apply to real hardware → invert the problem → reference atlas). The "what problem is this solving" framing card is a nice touch not present on every page.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark (same stray-comment correction as cooling-simulator.html/laser-cooling.html — verified the true close point via nesting-depth trace). Added `scope="col"` to 3 table column headers; wired `for=`/`id` on 12 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added its missing `.footer-link` entry to home.html's Build footer column (present in NAV and the nav dropdown, but absent from the footer). See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 12 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 12 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.


## Accessibility re-audit update (2026-09-20)
The dynamically-generated "Wavefront Builder" mode rows (`renderWFModes()`'s template string: an n-select, m-select, coefficient input, and remove button per row) had zero accessible names on any control — no `<label>` anywhere in the template and no static header row above the container either. Added `aria-label`s built from the same `${idx}` the template already uses ("Radial index n for term N", "Azimuthal index m for term N", "Coefficient for term N", "Remove term N"). See docs/accessibility-audit-2026-09-20.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The Laguerre–Gauss table is wrapped in `.table-scroll`.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 5 labels rendered differently after the fix, e.g. "Z_N^M (OSA, UNITS Λ)" → "Z_n^m (OSA, UNITS λ)"; "RADIAL CROSS-SECTION AT Θ=0" → "RADIAL CROSS-SECTION AT θ=0". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight run 3): GS flow diagram follows the theme and can be paused
- The animated Gerchberg–Saxton loop diagram (`gsFlowCanvas`, "GS" tab) was a cream block in the (default) dark theme, and its arrowheads were drawn in the paper colour, so they were invisible in the light theme too. The context is now wrapped with the new shared `js/canvas-ink.js` (`AMOInk.wrap`: light-theme inks are mapped to dark ones as they are set), the arrowheads use the shaft colour, and the CSS background is `var(--bg-card)`.
- It ran a forever `requestAnimationFrame` loop with no pause; it now uses `AMOMotion.loop` (`js/motion.js`): Pause button, offscreen stop, still frame under reduced motion. A theme toggle repaints the current frame (`AMOInk.track`).
- The first box read "|A|e^{iφ}" (raw TeX in a canvas); it now reads "|A|·exp(iφ)". The canvas has `role="img"` and an `aria-label` describing the loop.
- Checks: `smoke.js` 0 new problems; Playwright on the GS tab: corner/CSS colours per theme, animates, holds when paused, reduced motion starts on "▶ Play animation", toggle repaints; screenshots dark 1280 reviewed.

## 2026-09-29: PSF centring fix, piston-free RMS, 3D wavefront/PSF surfaces
- **Bug: the PSF and SLM far-field panels showed the wrong part of the FFT.**
  - `computePSF` added an extra `+Nfft/2` on top of its fftshift, so the 128 × 128 crop was centred on the **Nyquist** bin instead of zero frequency. Both panels ("Build & Diagnose" PSF and "SLM → Far Field") were aliasing noise: a perfect pupil gave 0 at the centre pixel.
  - Now pixel (64, 64) is the zero-frequency bin. A flat pupil gives an Airy pattern: first zero 5 px = 1.24 λ/D, first ring 0.016 of the peak.
  - Zero padding raised from 256 to 512, so one pixel is 127/512 ≈ 0.25 λ/D and the panels show ±16 λ/D (labelled under each panel).
- **Bug: piston lowered the Strehl.** RMS WFE was √⟨W²⟩, so a pure piston term of 0.3 λ reported σ = 0.3 λ and S ≈ 0.03. It is now the standard deviation about the mean, σ² = ⟨W²⟩ − ⟨W⟩² (the Maréchal/Mahajan form uses the variance; Mahajan, JOSA 73, 860 (1983), https://doi.org/10.1364/JOSA.73.000860). The theory text now says "summed over every term except piston". Other modes have zero mean over the pupil, so their numbers don't change.
- **New: 3D surfaces** (backlog P2), a card under the builder, drawn by `js/surface3d.js` (`AMO3D.surface`, needs `js/orbit3d.js`).
  - **Wavefront.** W on a polar mesh (21 rings × 72 spokes), re-evaluated with the page's own `zernikeAt()` and the same coefficients, in the map's RdBu colours and orientation. Height ∝ W with the peak |W| at half the aperture radius; the note labels this "exaggerated (schematic)".
  - **PSF.** The page's FFT result, ±6 λ/D (49 × 49 samples). Height is I/I₀, with I₀ the peak of an unaberrated pupil on the same grid (drawn as a dashed reference line). The note gives the sampled peak next to the Maréchal estimate. At 0.1 λ astigmatism they agree (0.673 vs 0.676); at the defaults (σ = 0.61 λ) they are 0.034 vs 3 × 10⁻⁷, so the note says the Maréchal form is a small-aberration approximation. With tilt present, the note explains that tilt moves the spot without lowering its peak.
  - Hover shows (ρ, θ, W) or (Δx, Δy in λ/D, I/I₀).
- **Wiring.** `computeWavefront()` publishes `window.ZERN_WF_LAST` and fires `zern:wavefront`.
- **Checked.**
  - New test `test_zernike_psf_centred_and_piston_free` (fails when the old index line is restored).
  - Playwright in dark/light at 1280 and dark at 390 px: flat pupil peak at (64, 64); piston 0.3 λ gives σ = 0, S = 1; tilt, astigmatism and the defaults as above; SLM far field now a centred spot; hover readouts; screenshots reviewed.
  - `smoke.js` against the baseline showed no new problems.
- **llms-full.txt** Strehl line corrected at the same time:
  - it said exp(−σ²) with σ in waves, which is wrong; it now reads exp[−(2πσ)²] with σ in waves;
  - the SLM line no longer puts the Gouy phase into the SLM pattern.

## 2026-09-29: chapter navigation (Saumitra: "not obvious that the page has more information")
The page's main tabs are now "chapters" (`data-chapters`, `AMOChapters` in main.js; see `docs/site-philosophy.md` §8):
- a chapter bar pinned under the site nav, with an n / N counter;
- a Previous/Next pager at the end of every chapter;
- deep links: `#ch-…`, or any `#id` inside a hidden chapter, opens that chapter.

The four "Recommended workflow" steps open chapters 1–4. The Mode Atlas (chapter 5) is reached from step 4's text, the bar and the pager. The Page Playbook above it is now a slim two-line note instead of a large card. Checked with Playwright in dark 1280 and light 390 px:
- the bar sticks at 64 px while scrolling a chapter;
- clicking a tab deep inside a chapter lands at the start of the new one;
- the pager, index cards, keyboard (Enter), deep links and hash updates all work.

`smoke.js` on all 34 pages: 0 new problems.
