# Site audit — 2026-11-22

Scope: the whole site at commit `5aa0158` (after the Build 10 automation page, Teach, the Python notebooks, the book, and Gemini's service worker / cross-tool handoff / page refresh), plus the book.

## How it was checked

| Check | Tool | Result before fixes | After |
|---|---|---|---|
| Formula/site regression tests | `tests/formula_regression.py` | OK 43 | OK 44 (new `test_service_worker`) |
| Browser smoke (39 pages × dark/light 1280 + dark 390; errors, console, 390 px overflow) | `tests/browser/smoke.js` | 0 problems | 0 problems |
| Full render with real KaTeX and Chart.js (39 pages + book × 3 configs): page/console errors, overflow, raw TeX left in text, KaTeX errors, duplicate ids, dead `#anchors`, broken images, blank canvases, unnamed buttons/links, one `h1` per page | Playwright script | see findings | clean except one item noted below |
| Internal links and anchors in every page and the book (relative, root-absolute, amotoolkit.com, Colab/GitHub paths into this repo) | static resolver | none broken | — |
| Text contrast, both themes | `contrast_all.js` | 1 real failure | fixed |
| Cross-tool handoff (every generated link opened, target controls compared with the values sent) | Playwright | 2 values rounded | fixed |
| Service worker (registration, scope, what gets cached, offline behaviour) | Playwright with offline emulation | 2 bugs | fixed |
| Search index | `build-section-index.js` | unchanged (up to date) | — |
| Sitemap vs pages | static | all 37 pages + home + book | — |
| Counts quoted across README, llms, home, Start Here, Teach, CLAUDE.md | static | 2 stale lines in CLAUDE.md | fixed |
| Book: chapters, page numbers, links, mobile/desktop overflow, PDF pages viewed | `test_book`, Playwright, pdftoppm | stale after Gemini's edits; see findings | regenerated |

External links (580 unique URLs) could not be checked from the build sandbox: its egress proxy refuses most hosts, which says nothing about the links themselves. The last full external check is `link-audit-2026-09-27.md`.

## Findings and fixes

1. **Raw TeX on six pages** — written as plain text with `^{…}` or `\mathrm`, so readers saw the source: cavity-qed (`F > \mathrm{FSR}/(2g₀)`), cooling-simulator (sideband-cooling label), dd-playground (`|C(T)| = e^{-(T/T₂*)ⁿ}`), laser-locking (PDH phase-modulated field), zernike (Gerchberg–Saxton caption), learn-quantum (Bloch state and `e^{−t/T₂}`). All now KaTeX. (Earlier the same day: `\( \)` delimiters on lab-calculators, rydberg-calculator and tof-calculator, which auto-render does not recognise.)
2. **Prose inside display math** on psiquantum-vs-xanadu (`\text{roughly 1 in 9 photons is lost…}`) made a formula 1,300 px wide; the sentence is now text after the formula.
3. **Home: "Automate the experiment" card unreadable in dark mode** (2.9 : 1). Its teal `#0f6b5f` had no dark-theme mapping like the other story colours; added `#5fc4b4`.
4. **Tweezer Designer sliders rounded real values.** Wavelength step 5 nm made 1064 nm and Cs's 938 nm unreachable; power started at 1 mW in 1 mW steps. Release & Recapture's handoff (1064 nm, 1.5 mW) arrived as 1065 nm, 2 mW. Now 1 nm and 0.5 mW steps.
5. **Service worker cached the 17 MB book PDF** (and notebooks) in every visitor's browser, and would have tried to cache 206 partial responses from PDF range requests (which throws). It now leaves `.pdf`/`.ipynb`/`.zip` and range requests to the network and caches only status 200.
6. **Offline fallback broke pages.** Visiting an uncached page offline served `home.html` under that page's URL, so its relative CSS/JS paths failed (`renderNav is not defined`, unstyled page). It now redirects to `home.html`.
7. **Dead CSS** from the panels Gemini deleted (reference trail, source-confidence, assumption badges, lab notebook, expert-mode/depth toggle): ~3.9 KB removed after confirming no page or script uses those classes. `styles.css` v40.
8. **The book was stale** (built before Gemini's page edits) and had small defects: the new handoff bar was extracted as text, two SVG marker ids (`arr`, `arr-r`) were duplicated across chapters so arrowheads could take the wrong figure's style, it had no analytics tag (every site page has GA4), and the build scripts only ran in the original sandbox (hard-coded KaTeX/Chart.js paths). Fixed and regenerated: 410 pages, no overflow at 390 or 1280 px, in both of the reader's themes.
10. **Book redesign committed during the audit (`4b79564`)** added chapter titles, "In this chapter" goals, bridges and summaries from `book/_build/textbook-meta.json`, a dark theme and a filterable contents. It was merged rather than overwritten. Its text was checked against the pages and eight statements corrected: Rydberg scaling (it said polarizability ∝ n¹¹; the page gives C₆ ∝ n*¹¹ and τ ∝ n*³ for low-l states, and R_b needs ħΩ), the Levine et al. two-pulse gate called "time-optimal" and "Levine-Pichler", IBM's Nighthawk described as heavy-hex (it is a square lattice), "derive the MOT from the optical Bloch equations" (the page uses the two-level scattering-rate model), RB SPAM-vs-gate error figures not on the page, a laser-drift figure, and the Rb-vs-Yb summary (Yb has logical-qubit results too, per the page). Its dark-theme toggle stored the choice but never restored it; the book now reopens in the stored theme.
9. **CLAUDE.md**: "100+ groups" (98 mapped), "all 32 pages" (37), and the note that the deleted panels were "dead code awaiting a call" were stale; updated, and a section on the service worker and handoff added.

## Checked and clean

No page or console errors; no broken internal links or anchors; no broken images; every canvas draws once scrolled into view (the 20 "blank" ones were lazy-drawn); no duplicate ids on site pages; one `h1` per page; no unnamed buttons or links; disabled buttons are the only other low-contrast hits; notebooks' Colab/download links resolve to files in the repo; constants appendix matches CODATA 2018 as labelled.

## Left as is (low priority)

- lab-calculators' Clebsch–Gordan output prints `(−1)^{1}` in its monospace result block; readable, but could become a superscript.
- Several labels use plain-text subscripts (`T_D`, `k_B`); consistent with the site's plain-label style, not wrong.
- The book's constants appendix uses CODATA 2018 (as the pages do); CODATA 2022 changes the last one or two digits shown for u, μ_B, a₀ and ε₀ (no effect at the precision any calculator uses).
- Polarimetry loads Plotly from cdn.plot.ly, which the service worker does not cache (works online only).
