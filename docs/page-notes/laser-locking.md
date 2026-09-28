# pages/laser-locking.html

**Purpose:** "Laser Stabilization Guide" — teaches the 3 complementary locking techniques and how a real lab combines them.

## Flow
1. Page hero — frames the problem (MHz drift, comparable to atomic linewidths).
2. **4 tabs**: 📡 SAS Lock, 🎵 Beat-Note Lock, 🏛️ PDH Cavity Lock, 🗺️ Summary. Each of the first 3 covers "how it works" + species-specific notes for that one technique in isolation.
3. **Summary tab** synthesizes: comparison table, a layered "typical laboratory hierarchy" diagram (Layer 0 absolute → Layer 1 derived → Layer 2 narrow), key equations at a glance, error-signal slopes compared, and a concrete "Our lab: Cs + Li system" real example.
4. **04 Sources**.

## Review outcome: approved, no changes
"Learn each piece separately, then see how they compose into a real system" — tabs 1-3 teach individually, tab 4 shows real-lab composition. The personal "our lab" hierarchy example anchors the abstraction concretely.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 28 table column headers (the page's many SAS/PDH/beat-note reference tables); wired `for=`/`id` on 16 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Laser Locking" -- stale from whenever this page was renamed to "Laser Locking Guide" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 4 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 4 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its BreadcrumbList JSON-LD leaf name used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## Transitions (2026-09-28)
The four "Practical notes" toggles (`togglePrac()`) now open and close with the shared height animation (`AMOTransitions.expand` / `collapse`). See docs/motion-and-transitions.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The slope table is wrapped in `.table-scroll`.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 2 labels rendered differently after the fix, e.g. "FM ERROR SIGNAL DS/DΝ" → "FM ERROR SIGNAL dS/dν"; "PDH ERROR SIGNAL IM[R(Ω)]" → "PDH ERROR SIGNAL Im[r(ω)]". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight run 3): lock visualiser follows the theme, can be paused, labels fixed
- **Theme.** The drift/lock visualiser was a cream panel in the (default) dark theme (`#lockVizWrap` background and the canvas fill). The wrapper now uses `var(--bg-card)` and the canvas context goes through the shared `js/canvas-ink.js` (`AMOInk.wrap`).
- **Pause control (WCAG 2.2.2).** The forever `requestAnimationFrame` loop is now `AMOMotion.loop`; the Pause button sits in the Lock / Perturb row. `draw(false)` repaints without stepping the servo, used for theme toggles and resizes, and after Lock / Perturb clicks so they show while paused.
- **Labels.** The trace's "+60 / 0 / −60 MHz" labels were drawn in the paper colour (invisible). The "error signal" label was drawn exactly on top of "Absorption + Lamb dip"; the error-signal trace itself sat on the bottom edge at ~4 px amplitude. Now: "Absorption + Lamb dip" top-left, "error signal" beside its trace, which is 10 px higher and drawn ~4× taller (±16 px; the dispersive shape, ∝ dL/dx of the page's Lorentzian, is unchanged). A code comment called Γ/2π = 5.234 MHz the HWHM; the Lorentzian uses it as the FWHM (HWHM = Γ/2), and the comment now says so.
- `role="img"` + `aria-label` on the canvas. Checks: `smoke.js` 0 new problems; Playwright dark/light 1280 animating + pause, 390 reduced motion + toggle; screenshots dark 1280, light 1280 and light 390 reviewed.
