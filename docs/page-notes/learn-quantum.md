# pages/learn-quantum.html

**Purpose:** "Quantum Computing Learning Path" — 14 topics as a short course, then a reference. The site's flagship educational page; also hosts the spaced-repetition Quantum Quiz (`#quiz-root`, see below).

## Flow (post-fix)
1. Page hero.
2. Route panel — "Course map" framing 4 topic groups: **Qubit language** (Bloch, Superposition, Rabi) → **Operations** (Gates, Measurement, Optical Pumping, Hyperfine) → **Many-qubit physics** (Entanglement, Rydberg, Two-Qubit, Decoherence) → **Algorithms and QEC** (Algorithms, Analog Sim, QEC).
3. `#quiz-root` — 28-question spaced-repetition quiz (Leitner boxes in localStorage), inserted right after the route panel, before the first topic.
4. **14 topic sections in the order the course map promises** (see below) → Resources.
5. Sticky `topic-nav` at the top mirrors the same order.

## Review outcome: changed (largest reorder on the site)
The 14 sections did **not** follow the promised 4-group order at all — they zigzagged between all four groups repeatedly. Most strikingly, **Rabi Oscillations** was promised in Group 1 ("Qubit language... phase, and Rabi rotations") but the actual section appeared at position 8 of 14, deep into Group-3 territory.

Reordered all 14 sections to: Bloch → Superposition → Rabi → Gates → Measurement → Optical Pumping → Hyperfine → Entanglement → Rydberg → Two-Qubit → Decoherence → Algorithms → Analog Sim → QEC. Also reordered the sticky `topic-nav` links and `NAV.learn` in `main.js` (used by the site-wide nav dropdown) to match.

**Verification method** (see `docs/site-philosophy.md` §7): extracted each of the 14 section blocks by exact line range, asserted each started with its own unique `id=`, reassembled in the new order, then asserted the *sorted line-multiset* of the whole file was identical before vs after — i.e., mathematically guaranteed the reorder was pure reordering with zero content loss/duplication, independent of manual line-number bookkeeping. Ran the JS syntax check and full regression suite afterward.

The quiz's "Review this topic ↑" links use `href="#anchor-id"`, which are order-independent, so the reorder didn't require any quiz-data changes.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.

## Flow audit update (2026-09)
Found a real forward-reference: "Rydberg Atoms & Blockade" was taught before "Two-Qubit Gates" despite already using two-qubit-gate concepts in its own theory box. Swapped the two sections. This also surfaced that all 15 internal section-marker HTML comments (invisible to readers, but used to label sections for editors) were mismatched/stale, likely left behind by the earlier Rabi reorder — relabeled all 15 to match actual content and order. Also updated topic-nav link order, the "Many-qubit physics" route-card blurb, and the scrollspy JS array to match. See docs/flow-audit-2026-09.md.


## Accessibility audit update (2026-09)
Fixed a skip-link targeting bug: the page already had a real `<main class="container">` landmark, but `id="main-content"` was on the *outer* wrapping div (which also contains the sticky topic-nav) instead of on the `<main>` itself — moved the id so "skip to content" now actually skips past the topic-nav. Made all 6 `.bell-card` Bell-state selector tiles keyboard-operable; added `scope="col"` to 12 table column headers; wired `for=`/`id` on 15 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.

## Navigation/IA audit update (2026-09), continued
Also added global-search keywords for all 14 `NAV.learn` sub-topic anchors on this page (Bloch Sphere, Quantum Gates, Rabi Oscillations, etc.) — previously none of them had any keywords at all, so searching e.g. "CNOT" or "T2 star" wouldn't surface the matching in-page section. See docs/navigation-audit-2026-09.md.
