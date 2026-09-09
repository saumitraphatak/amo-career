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
