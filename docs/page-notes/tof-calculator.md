# pages/tof-calculator.html

**Purpose:** "MOT Temperature" — ballistic expansion / time-of-flight thermometry.

## Flow
1. Page hero.
2. **5 numbered sections, no route-panel**: 01 Atom & Temperature (inputs) → 02 Cloud Expansion σ(t) (chart) → 03 Fit Temperature from Data (**real** σ² vs t² linear regression from a data table) → 04 Cooling Limit Reference → 05 References.

## Review outcome: approved, no changes
Clean linear calculator flow: set up → visualize → fit real data → contextualize against physical limits → references. Confirmed section 03's "Fit Temperature from Data" is a genuine linear-regression fit (unlike release-recapture.html's phantom fitting claim — this page actually does what it says).


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 4 table column headers; wired `for=`/`id` on 7 label/input pairs; added `aria-hidden="true"` to 3 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
