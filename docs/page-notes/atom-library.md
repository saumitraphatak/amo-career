# pages/atom-library.html

**Purpose:** "Choose an Atomic Species" — the entry point for any species-dependent decision on the site.

## Flow
1. Page hero.
2. Route panel — 4-step workflow blurb (choose species → compare platforms → design lasers → find groups/papers).
3. **Quick Comparison** — clickable tile grid of all 15 species (Alkali / Alkaline-Earth / Magnetic), family filter bar, and a 2-atom "Compare" mode across 4 tabs (Overview / Rydberg Gates / Clocks / Quantum Sim).
4. **Visual Comparison** — static bar charts (Doppler temperature, linewidth) across all species at once, plus a callout on narrow intercombination lines (Sr, Yb).
5. **Atom Details** — full per-atom data sheets, tabbed by family.
6. **US Research Groups** — who uses which species.
7. **Essential Resources & Tools**.

## Review outcome: approved, no changes
Reads as a coherent narrowing funnel: compare-any-two → see-all-at-a-glance → drill into one → who's using it → further reading. Sections 3 and 4 both compare atoms on similar axes (temperature/linewidth) through different UI (interactive picker vs static chart) — judged complementary, not redundant.

## Science audit update (2026-09, Finding 1)
The generated comparison text for Yb171 (`W(Yb,cYb)...`) cited Evered et al. 2023's 99.50% Rb CZ-gate number as the best demonstrated result; added a note that a 2026 preprint (arXiv:2604.25987) reports 99.854% raw, not yet peer-reviewed. See docs/science-audit-2026-09.md.

## Link audit update (2026-09)
The potassium data-sheet reference (`tobiastiecke.nl/archive/PotassiumProperties.pdf`, linked twice) is confirmed dead (404) — and it's the same dead link Steck's own canonical alkali-data index points to, so no site-specific fix was obviously available. Searched for a trustworthy mirror and didn't find one; de-linked both references to plain text ("— source offline") rather than link to a low-quality mirror. See docs/link-audit-2026-09.md.
