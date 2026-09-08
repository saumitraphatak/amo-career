# Content Flow & Pedagogy Audit — September 2026

Scope: audit #4 of the broader audit menu. Not science accuracy (already audited) and not visual design (already audited) — whether each page actually teaches its material in a good order for a first-time reader: forward references, abrupt jumps, buried ledes, redundancy, missing motivation, and whether a page's own "route panel" (the reading-path blurb near the top of most pages) still matches its real structure.

Method: read `docs/site-philosophy.md` and every `docs/page-notes/*.md` first, since this site has already been through several rounds of flow-focused editing (documented fixes for route-panel/tab mismatches, a prior `learn-quantum.html` reorder, and an explicit decision to leave `laser-cooling.html`'s technique order interleaved) — the goal was to find what those passes hadn't already caught, not re-litigate settled calls. Then read the full text of all 28 pages plus `home.html`.

## Fixed

**`home.html`'s "Learn the underlying physics" teaser grid was stale relative to the page it links to.** It previewed 11 of `learn-quantum.html`'s 14 real sections, in an order that didn't match the target page (e.g. "Rabi Oscillations" was the 8th card here but is actually taught 3rd on the real page), and ended with a "🔮 More coming" placeholder tile implying the missing topics (Optical Pumping, Hyperfine Qubits, Quantum Error Correction) don't exist yet — they're all fully built sections. A first-time visitor previews the course in one order, then finds it taught in a different one. Rebuilt the grid: all 14 sections, in the actual teaching order, placeholder tile removed.

**`learn-quantum.html` itself had a genuine forward-reference**, and while investigating it I found the file's internal structure had drifted significantly further than that one issue. In order:

1. *The forward reference:* "Rydberg Atoms & Blockade" was taught before "Two-Qubit Gates," but the Rydberg section's own theory box already said Rydberg blockade "enable[es] two-qubit entangling gates" and showed a gate-fidelity formula — using a concept (what a two-qubit gate is, CNOT/CZ/iSWAP, the 4D two-qubit Hilbert space) the very next section was about to introduce. Everywhere else on the page, the generic operation is taught before a physical implementation of it. Swapped the two sections so Two-Qubit Gates comes first.
2. *What the swap uncovered:* every one of the page's 15 internal section-marker HTML comments (`<!-- N. TOPIC NAME -->`, used to label each section for anyone editing the file) was wrong — mismatched numbers, wrong topic names, two even carrying no number at all. This looks like the residue of an earlier documented reorder (the "Rabi fix" in `docs/page-notes/learn-quantum.md`) where section bodies were physically moved but their labeling comments weren't moved with them. This has **zero visible effect** — HTML comments don't render — but it's a real trap for the next person (or the next me) editing this file, since the comments actively lie about what follows them. Relabeled all 15 to match their actual content and the corrected order.
3. Also updated, to stay consistent with the swap: the page's `topic-nav` quick-jump link order, the "Many-qubit physics" route-card's one-line description ("Entanglement, Rydberg blockade, two-qubit gates, decoherence" → "...two-qubit gates, Rydberg blockade..."), and a hardcoded JS array used for scroll-position highlighting (functionally harmless either way — the highlight logic keys off element IDs, not array order — but tidied for consistency while already in the file).

Verified throughout: regression suite 11/11, HTML tag-balance clean on both files.

## Checked, fine as-is

Read all 28 pages in full; aside from the two items above, no genuine comprehension-blocking flow issues found. The site has clearly already absorbed real editing discipline here — the "route panel must match actual structure" rule, the "no phantom/aspirational features" rule, and "theory before tool" ordering are all documented conventions that were checked against and held up on every other page, including reference/lookup pages (`atom-library.html`, `laser-planner.html`) which are intentionally table-shaped rather than narrative-shaped.

## Minor polish — noted, not changed

- `mot-designer.html`: the MOT-force derivation and the optimal-damping callout (|Δ| ≈ Γ/(2√3) ≈ 0.29Γ) appear once inline near the calculator and again, nearly verbatim, in the standalone "Physics Reference" section. Not wrong, just a spot that could drift out of sync if one copy is ever edited without the other. Could link one to the other instead of repeating the full derivation — low priority.
- `learn-quantum.html`, Analog Quantum Simulation section: "on-site interaction (Feshbach resonance tunable)" is the only mention of Feshbach resonance on the page and it's never defined, which stands out on a page that advertises "no prior quantum background required." A 4-5 word parenthetical would close the gap.
- `rb87-vs-yb171.html`: the "6,100-atom, 12.6s result is Cs-133, not Rb87" caveat appears near-verbatim in ~6 places. This is intentional — it's the exact fact-boundary phrase the science audit asked to be repeated everywhere the number comes up, and it's guarded by the regression suite — so not touched, just noting it reads as repetitive end-to-end.
