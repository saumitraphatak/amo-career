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
