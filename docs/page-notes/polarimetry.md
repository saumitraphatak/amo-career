# pages/polarimetry.html

**Purpose:** "Polarimetry Simulator" — interactive learning tool for optical polarimetry.

## Flow
1. Page hero — visualize any polarization state, simulate rotating-QWP measurement, extract Stokes params via Fourier analysis.
2. **5 numbered tabs**: 1. Polarization Basics → 2. Stokes Parameters → 3. Measurement Methods → 4. Interactive Simulator → 5. Reference & Matrices.
3. Sources.

## Review outcome: approved, no changes
Clean teach-then-use-then-reference progression: build concepts (1-3), hand over the simulator (4), matrices/reference appendix (5) for lookup afterward. Numbered tabs make the intended reading order explicit.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 13 table column headers; added `aria-label` to the 4 polarization sliders (ψ, χ, DOP, SNR), which previously had only a sibling `<span>` caption with no programmatic association. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Polarimetry Explorer" -- stale from whenever this page was renamed to "Polarimetry Simulator" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s), its page-footer signature line, and its BreadcrumbList JSON-LD leaf name used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.


## 3D survey (2026-09-28)
Reviewed during the sitewide 3D pass: the Poincaré spheres are already Plotly 3D plots (rotatable), so this page was deliberately left unchanged. See docs/3d-visualization-audit-2026-09-28.md.

## Transitions (2026-09-28)
The six section tabs (`polTab()`) now use the shared transitions: a sliding underline under `.pol-tab-nav`, and the new section eases in with a height morph (`AMOTransitions.swap` / `attachInk`). See docs/motion-and-transitions.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- `.pol-grid2`/`.pol-grid3` drop to one column at ≤600 px (they stayed two columns down to any width, which put the 270 px E-field canvas and the cards side by side at 685 px total); canvases in `.pol-canvas-wrap` scale down. The three Jones/Mueller tables are wrapped in `.table-scroll`.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 2 labels rendered differently after the fix, e.g. "ORIENTATION Ψ" → "ORIENTATION ψ"; "ELLIPTICITY Χ" → "ELLIPTICITY χ". No markup on the page changed apart from the cache version.
