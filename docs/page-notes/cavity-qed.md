# pages/cavity-qed.html

**Purpose:** "Cavity QED Coupling Lab" — turn cavity/atom geometry into a coupling-regime classification.

## Flow
1. Page hero.
2. Route panel — "Turn geometry into a physical regime" + workflow cards (now 6, see below).
3. **6 numbered sections** (linear scroll, not tabs): 01 Cavity & Atom Parameters → 02 Results → 03 Coupling Rates vs Finesse (chart) → 04 Coupling Regimes → 05 Reference Systems → 06 Common Mistakes.

## Review outcome: changed
Route panel had 4 cards for 6 sections — card "Classify regime" skipped over section 03's chart entirely, and "Check intuition" quietly folded together sections 05 and 06. Expanded to 6 cards, 1:1 with the numbered sections (`.route-grid` again `auto-fit`, no CSS change needed).

Note: this page is a linear scroll, not tabs, so the mismatch was lower-stakes than lab-techniques' (nothing was actually hidden from a reader who scrolls the whole page) — but the user's call was still to fix it for consistency. Contrast with rydberg-calculator, where a similar-looking gap was judged intentional and left alone (site-philosophy.md §2).

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted 3 `<div class="accordion-header">`s to real `<button>`s for keyboard access; added `scope="col"` to 10 table column headers; wired `for=`/`id` on 8 previously-unassociated `<label>`/`<input>` pairs; added `aria-hidden="true"` to 3 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. Added its missing `.footer-link` entry to home.html's Build footer column (present in NAV and the nav dropdown, but absent from the footer). See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.
