# pages/zernike.html

**Purpose:** "Zernike Wavefront Lab" — the optical vocabulary behind imperfect objectives, shaped tweezers, SLM holograms, and PSFs.

## Flow
1. Page hero — animated SVG wavefront; frames: start from one mode, combine aberrations, watch Strehl fall, connect pupil phase to focal-plane light.
2. **"What problem is this page solving?"** — plain-language framing card before any interactivity.
3. **5 numbered tabs**: 01 Learn a Mode → 02 Build & Diagnose → 03 SLM → Far Field → 04 Recover Hologram → 05 Mode Atlas.
4. Sources.

## Review outcome: approved, no changes
Same pedagogical shape as polarimetry (single concept → combine → apply to real hardware → invert the problem → reference atlas). The "what problem is this solving" framing card is a nice touch not present on every page.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark (same stray-comment correction as cooling-simulator.html/laser-cooling.html — verified the true close point via nesting-depth trace). Added `scope="col"` to 3 table column headers; wired `for=`/`id` on 12 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added its missing `.footer-link` entry to home.html's Build footer column (present in NAV and the nav dropdown, but absent from the footer). See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 12 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 12 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.


## Accessibility re-audit update (2026-09-20)
The dynamically-generated "Wavefront Builder" mode rows (`renderWFModes()`'s template string: an n-select, m-select, coefficient input, and remove button per row) had zero accessible names on any control — no `<label>` anywhere in the template and no static header row above the container either. Added `aria-label`s built from the same `${idx}` the template already uses ("Radial index n for term N", "Azimuthal index m for term N", "Coefficient for term N", "Remove term N"). See docs/accessibility-audit-2026-09-20.md.
