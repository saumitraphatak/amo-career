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
