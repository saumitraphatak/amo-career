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
