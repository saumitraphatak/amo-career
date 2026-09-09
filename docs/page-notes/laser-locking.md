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
