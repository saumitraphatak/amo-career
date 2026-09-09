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
