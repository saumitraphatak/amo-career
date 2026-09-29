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

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; converted 16 `<div class="accordion-header">`s (both the species accordions and the group-directory accordions) to real `<button>`s for keyboard access; made all 15 `.atom-tile` species-picker tiles keyboard-operable (`tabindex`, `role="button"`, `onkeydown` mirroring the existing `onclick`); added `scope="col"` to the 18 column headers in the atom comparison/data tables; added `aria-hidden="true"` to 16 decorative accordion-chevron icons. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords (also closed a Rb/rubidium search-synonym gap versus rb87-vs-yb171.html) — this page previously had none, relying on title-word matching only. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Link audit update (2026-09-16)
The Ketterle Lab group-card link (`cua.mit.edu/groups/ketterle-group/`) 404s. Repointed to `cua.mit.edu/people/wolfgang-ketterle`, his current CUA profile page. See docs/link-audit-2026-09-16.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its page-footer signature line used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 5 labels rendered differently after the fix, e.g. "COOL. Λ (NM)" → "COOL. λ (nm)"; "Γ/2Π (MHZ)" → "Γ/2π (MHz)". No markup on the page changed apart from the cache version.

## 2026-09-29: tile glow is time-limited
The decorative pulse on the atom selector tiles ran forever (a `requestAnimationFrame` loop rewriting every tile's background). It now runs for at most 5 s, so WCAG 2.2.2 needs no pause control, and not at all under prefers-reduced-motion; the tiles then settle at their static 0.12 tint.

## 2026-09-29: reorganized around a Periodic Table Explorer (Saumitra's request)
- **Asked for:** "should there be a periodic table at the start … re-organize the page around that table … keep all information but blend it in better."
- **New flow:**
  1. hero and route panel;
  2. **Periodic Table Explorer**;
  3. "All 15 isotopes at a glance" (filter and data table);
  4. Visual Comparison charts and the narrow-line note;
  5. Resources.
- **The explorer (`js/atom-explorer.js`):**
  - **Table.** All 118 elements, with the nine library elements lit and colour-coded by family (palette slots 1–3; family is always also labelled in text). The element symbols and names come from TeX Live's `nucleardata` elementlist.csv.
  - **Summary in the table's gap.** The selected element sits in the empty periods 1–3 × groups 3–12 block (below the f-block on narrow screens): a big tile, isotope pills, cooling λ, Γ/2π, T_D, 2E_r/k_B, I, hyperfine, statistics and magnetic moment. On phones a row of element buttons replaces the tiny tiles as the main picker.
  - **"Colour by" lenses.** Family; cooling light (the tile takes the approximate colour of the cooling wavelength, near-IR drawn dark red); Doppler limit; linewidth; recoil; hyperfine qubit; bosons/fermions; magnetic moment. Numeric lenses use a single-hue blue ramp (log where the range spans decades) with the value printed in the tile, a text list of all values, and a caption on the physics trend.
  - **Inspector.** The energy-level diagram, which had been dead code: `selectAtom()` looked for a `#spec-panel` that no longer existed, so clicking a tile threw an error. It is now HiDPI, theme-aware and labelled schematic. Beside it are the family note, the element's "Why it's used / lines / qubit / data sheets" block (moved from the three family tabs) and its research-group cards (moved from the separate group list). A link points to the AMO Group Finder for the full directory.
  - **Compare mode.** Pick two elements; the old tile highlighting is replaced by rings on the table, and each side has an isotope picker, so pairs like ⁸⁵Rb vs ⁸⁷Rb are reachable. The page's own comparison logic and verdicts are unchanged.
  - **Data table.** The isotope cells open that isotope in the explorer. The selected row is tinted, and "Row in the table ↓" jumps to it.
- **Content preserved.** A text diff of old vs new page shows only UI headings and prompts changed. All 9 element write-ups, 3 family notes, 7 group lists and every link are kept (0 links lost).
- **Data fixes:**
  - ⁴⁰K ground-state hyperfine splitting was "—" in the table (the comparison data already had it). It is now 1.286 GHz = |A|(I+½) with A = −285.73 MHz, I = 4 (Arimondo, Inguscio & Violino, Rev. Mod. Phys. 49, 31 (1977); consistent with arXiv:2609.02572, preprint).
  - The group heading "²³Na & ¹⁹K" became "²³Na & K" (19 is K's Z, not a mass number).
- **Magnetic moments** (not in the table, added to the explorer): ≈1 μ_B for the alkali ²S₁/₂ ground state, 0 for ¹S₀ Sr/Yb (J = 0), ≈7 μ_B for Er and ≈10 μ_B for Dy (see Chomaz et al., RMP 2023, already cited on the page).
- **Removed:** the decorative tile glow, since the tiles are gone.
- **Checked:**
  - Playwright in dark and light at 1280 and dark at 390 px: select by tile, chip and table cell; isotope pills; every lens; compare with the isotope picker; `#Cs-133` deep link; no page errors; no horizontal overflow; screenshots reviewed.
  - `smoke.js` 0 new problems.
  - Formula tests OK 17: the species count now comes from the table rows, and the explorer's "15 isotopes" wording is also checked.
