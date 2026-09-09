# pages/laser-planner.html

**Purpose:** "Laser System Planner" — single-input design tool: pick a species, get the entire laser stack.

## Flow
1. Page hero — "Build 02" eyebrow.
2. **Section 01: Select Atom Species** — a tile selector (same interaction pattern as atom-library). Placeholder until a species is picked.
3. Once selected, JS renders inline: **02 Required Laser Beams**, **03 System Block Diagram**, **04 Nonlinear Optics Required** (only if needed), **05 Practical Warnings** — all inside the same section-01 container.
4. **References & Further Reading** — always-visible static list.
5. **See Also** — cross-links to Laser Locking, Lab Calculators, Lab Techniques.

## Review outcome: approved, no changes
Clean single-input → multi-output design tool. Mirrors the atom-library tile-selector pattern, reinforcing a consistent interaction language across the "Build" category.


## Accessibility audit update (2026-09)
Added `scope="col"` to 6 table column headers. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.
