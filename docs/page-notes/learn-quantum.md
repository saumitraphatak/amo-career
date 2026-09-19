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


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Science-content refresh (2026-09-15)
The "2024–25 State of the Art" box (Bell-inequality/QEC section) cited Quantinuum H2's 2024 99.9% two-qubit fidelity as the trapped-ion reference point. Extended the box (retitled "2024–26") with one added sentence noting Quantinuum's Helios system (98 qubits, all-to-all) pushed this to a peer-reviewed 99.92% two-qubit fidelity and 48 fully error-corrected logical qubits in 2026 — see the qc-landscape.html note above for the full verification. Left the original Willow/Bluvstein/H2 sentences untouched; this was a single additive sentence, not a rewrite.

## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 23 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 23 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its page-footer signature line used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`.

Also fixed: the "2024–26 State of the Art" theory box states Bluvstein/Harvard reached "48 logical qubits" and, two sentences later, that Quantinuum's Helios also reached "48 fully error-corrected logical qubits" — a coincidental identical headline number for two unrelated platforms stated back-to-back with nothing signaling it's a coincidence. Added "separately" before the second mention for clarity. See docs/flow-audit-2026-09-19.md.
