# pages/dd-playground.html

**Purpose:** "Qubit Coherence & Decoupling" — how π-pulse sequences extend coherence by engineering the noise filter function.

## Flow
1. Page hero — Quantum 05.
2. **11 sections, no route-panel**: T₂* vs T₂: Why Coherence Decays (concept) → Ramsey Spectroscopy (basic technique) → Hahn Echo (1 pulse) → CPMG (N pulses) → XY-4/8/16 (pulse-error-cancelling refinements) → Filter Function Formalism (unifying theory) → Filter Function Viewer (interactive tool) → T₂ vs N Enhancement Factor Calculator (interactive tool) → Noise Spectroscopy via DD (application) → Connection to Neutral Atom Experiments (real results, Manetsch 2025) → Sources.

## Review outcome: approved, no changes (autonomous pass)
Concept → increasingly sophisticated pulse sequences → unifying theory → interactive tools applying that theory → application → real experiments → sources. Already follows the theory-before-interactive-tool ordering established elsewhere (see `docs/site-philosophy.md` §4) without needing a fix — Filter Function Formalism sits directly before the Filter Function Viewer.


## Home integration (later pass)
Added a `QC 06` tools-grid card on `home.html` (icon 🛡️, color `#4ade80`), matching the treatment `remote-entanglement.html` already had. Same rationale as `rb-explorer.html` — see its page-note and `docs/technical-audit-2026-09.md`.

## Accessibility audit update (2026-09)
Fixed a genuine skip-link bug: `id="main-content"` was on an empty placeholder `<div>` sitting above the real content instead of on the actual page wrapper. Moved the id onto the wrapper (now a real `<main>`) and removed the empty div; also moved the wrapper's closing tag to before `<footer>` (it was previously nested inside, which would have stripped the footer's landmark role once the wrapper became `<main>`). Added `scope="col"` to 5 table column headers; wired `for=`/`id` on 4 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Dynamical Decoupling & T2 Playground" -- stale from whenever this page was renamed to "Dynamical Decoupling" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.


## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 4 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 4 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.
