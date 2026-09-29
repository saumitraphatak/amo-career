# pages/rydberg-calculator.html

**Purpose:** Rydberg state properties + blockade estimate calculator.

## Flow
1. Route panel — "Start with the state, then ask whether the interaction is useful" + 4 cards: Choose state → Estimate interaction → Interpret the regime → Check caveats.
2. **6 content blocks** (no numbering, linear scroll): Rydberg State Selector (inputs) → Rydberg Blockade Lab (main C₆/R_b calculation + live visualizer) → Blockade radius vs n (chart) → Quantum defects reference (data table) → C₆ scaling & Förster resonances (theory) → References & Tools.

## Review outcome: assessed, left as-is
The 4 route-cards describe a **conceptual reasoning process**, not a literal 1:1 section index — unlike lab-calculators' literal tabs, nothing here is a distinct navigable destination a visitor could miss. The blockade-vs-n chart and quantum-defects table are supporting detail nested inside the "interaction" and "state" reasoning steps respectively, not separate top-level workflow stages. Presented this distinction explicitly and the user agreed to leave it — don't force this into a 6-card structure for consistency's sake; the judgment call was intentional. Contrast with cavity-qed, which looked similar on the surface but got expanded because the user's call went the other way there.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 5 table column headers; wired `for=`/`id` on 5 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Rydberg Calculator" -- stale from whenever this page was renamed to "Rydberg Blockade Lab" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 9 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 9 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s), its page-footer signature line, and its BreadcrumbList JSON-LD leaf name used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The theory section's inline two-column grid is now the page's own `.two-col` (one column below 800 px, like the rest of the page); it stayed two columns at every width and was 616 px wide on phones once KaTeX rendered.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 4 labels rendered differently after the fix, e.g. "ORBITAL RADIUS ⟨R⟩" → "ORBITAL RADIUS ⟨r⟩"; "BLOCKADE RADIUS RB" → "BLOCKADE RADIUS Rb". No markup on the page changed apart from the cache version.

## 2026-09-29: 3D blockade array (backlog P2 "3D blockade spheres")
New card at the end of the calculator section, "In an array: how many neighbours does one excitation block?", drawn by `js/rydberg3d.js` (`AMO3D.blockadeArray`, needs `js/orbit3d.js`).
- **Inputs.** It takes the page's own R_b (from `blockadeRadius_um(C6, Ω)`) and the atom-separation slider as the lattice spacing a. `window.updateBlockadeViz` is wrapped so the existing 2D pair view keeps working and the array follows every `compute()`.
- **Geometries.** 5 × 5 square, 5 × 5 triangular, or two square layers one spacing apart (drag to rotate). Click an atom, or focus the figure and press [ / ], to move the excitation.
- **Maths.** For each neighbour shell the table lists distance, count, U/ℏΩ = (R_b/d)⁶ (from |U(R_b)| = ℏΩ and U ∝ 1/d⁶), blockaded yes/no, and the page's own ε ≈ (d/R_b)¹² for blockaded pairs.
- **Caveats.** Same as the page: isotropic vdW, approximate C₆, no angular dependence or Förster resonances. This is stated under the figure.
- **Default.** At the page defaults (n = 50, Ω/2π = 1 MHz, r = 5 µm) R_b/a ≈ 0.99, so nothing is blockaded; the summary says so and points to the separation slider.
- **Checked.** Playwright, dark/light at 1280 and 390 px, all three geometries, click and keys, drag, and r = 3 and 30 µm. Table values match (R_b/d)⁶ by hand (e.g. R_b = 4.97 µm, d = 3 µm → 20.6). `smoke.js` against the baseline showed no new problems.
