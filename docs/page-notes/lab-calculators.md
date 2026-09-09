# pages/lab-calculators.html

**Purpose:** "Quick Lab Console" — the site's grab-bag of small, frequently-needed calculators, organized by lab question rather than alphabetically.

## Flow
1. Page hero.
2. Route panel — "Pick the calculation by the lab question" + workflow cards (now 7, see below).
3. **7 tabs**: 🔭 Beam & Imaging Optics, 📡 RF Power & AOMs, ⚛️ Atomic Scales, 🪤 Tweezers & Cavities, 🔢 Angular Momentum (Clebsch-Gordan), 🎛️ Modulators (EOM/AOM sidebands), 🔄 Unit Converter.

## Review outcome: changed (largest mismatch found)
Route panel had only 4 cards for 7 tabs — **2 entire tabs** (Beam & Imaging Optics, Angular Momentum) had zero card representation at all, and "Check an AOM/RF chain" ambiguously tried to cover both the RF Power tab and the separate Modulators tab. Expanded to 7 cards, one per tab, in exact tab-bar order: Design beam optics → Check an AOM/RF chain → Estimate atom scales → Design a tweezer → Couple angular momenta → Check modulator sidebands → Convert lab units fast.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; converted the CG-table's single-line `<div class="accordion-header">Background &amp; Selection Rules</div>` to a real `<button>`; added `scope="col"` to the Key-β-Values table and to the JS-generated Clebsch–Gordan table's column headers, and converted the CG table's `<td class="row-label">` row headers to `<th scope="row">` (added a matching `table.cgt th.row-label` CSS rule so the visual style, originally written for a `td` selector, still applies); wired `for=`/`id` on 102 label/input pairs — by far the largest single-page instance of the site's most common accessibility gap (visually-adjacent but programmatically unassociated labels). See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.
