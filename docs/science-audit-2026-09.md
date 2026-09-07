# Science Content Audit — September 2026

Scope: verify the site's physics/quantum-computing claims against current literature, and find places to make the science richer or more current. Unlike the earlier technical audit (`docs/technical-audit-2026-09.md`), this one is about *content accuracy and depth*, not code/SEO/consistency.

Method: web search + primary-source fetch (arXiv, Nature, Nature Physics, PRX Quantum, company press), cross-checked against what's currently on the page. Two headline findings below are big enough that I'm flagging them for your sign-off before touching anything, per the site's own "ask before large judgment calls" convention. A few smaller ones are safe to just do.

---

## Finding 1 — New Rb-87 gate-fidelity record supersedes the site's "state of the art" (BIG, needs your call)

**What's on the site now:** Evered et al., *Nature* 622, 268 (2023) — 99.5% CZ gate fidelity, 60 atom pairs in parallel — is cited as the best published Rb-87 two-qubit gate result on `rb87-vs-yb171.html` (hero stat chip, a stat-card, an inline KaTeX formula, a chart caption, several bullet lists, the head-to-head table, and the "Current gap" summary paragraph) and on `fidelity-budget.html`'s SOTA comparison + references section. The current narrative on `rb87-vs-yb171.html` frames Yb-171 (Muniz et al. 2025, 99.72% with post-selection) as having the edge in raw per-pair fidelity, with Rb-87 leading only in logical-processor maturity and parallel-gate scale.

**What's new:** Evered, Xu, Li, Geim, Bonilla Ataides, Kalinowski, Bluvstein, Maskara, Kokail, Greiner, Vuletić, Lukin (same Harvard/Lukin group), *"High-fidelity entangling gates and nonlocal circuits with neutral atoms,"* [arXiv:2604.25987](https://arxiv.org/abs/2604.25987), submitted April 28, 2026:
- **CZ gate fidelity: 99.854(4)% raw, 99.941(3)% with loss post-selection** — stable over 10 hours of continuous operation.
- Uses a high-Rabi-frequency smooth-amplitude pulse plus state-selective readout and qubit reuse for fast calibration.

This is not an incremental update — **it beats the Yb-171 number the site currently presents as the leader (99.72%)**, on the same group's own follow-up to the very paper the site cites. The "Current gap" paragraph's framing (Yb-171 ahead on raw per-pair fidelity) would need to flip, and the hero stat chip / stat-card / table cell all currently show "99.5%" as Rb-87's headline number.

**Why I'm asking first:** this touches a lot of surface area on one page (`rb87-vs-yb171.html`) and changes the page's actual thesis in one section, not just a number. I'd rather write the replacement paragraph past you than silently rewrite the comparison's conclusion.

**Proposed scope if you approve:**
1. `rb87-vs-yb171.html`: update hero stat chip, stat-card, KaTeX formula, chart caption, key-facts bullets, table cell, Rb87-scaling timeline (add a 2026 entry), and rewrite the "Current gap" box to reflect the new number — while being careful to note this is a single-group, not-yet-independently-reproduced result and that it's arXiv (not yet peer-reviewed/journal-published as of Sept 2026), same "source-confidence" tagging convention the page already uses elsewhere.
2. `fidelity-budget.html`: add a 4th SOTA card for Evered 2026, keep 2023 for context or replace it, add the arXiv link to "05 Key References."
3. `atom-library.html` line ~1706: the inline generated-text note citing "Evered et al. 2023 ... F = 99.50 ± 0.06%" — update or add the 2026 figure.
4. `CLAUDE.md` "Physics Summary" list and `llms-full.txt` if they cite this number anywhere (I'll grep before touching).

---

## Finding 2 — Rich new numbers for the Erasure Conversion section (safe to add, adds real depth)

**What's on the site now:** `rb87-vs-yb171.html` section "09 Erasure Conversion" describes the concept qualitatively (Yb-171's structural shelving advantage) and cites Ma et al. 2023 (98.0% metastable-qubit gate + mid-circuit erasure conversion, also on `fidelity-budget.html`'s SOTA grid).

**What's new:** Zhang, Liu, Bornet, Horvath, Peng, Ma, Huang, Puri, Thompson (Princeton, same group as Ma et al. 2023), *"Logical qubits with erasure conversion using metastable neutral atoms,"* [arXiv:2506.13724](https://arxiv.org/abs/2506.13724) (June 2025, v2 June 2026), published in *Nature Physics*, DOI [10.1038/s41567-026-03309-0](https://www.nature.com/articles/s41567-026-03309-0). This is a substantial follow-on with real numbers, not just a qualitative advance:

- **Anti-refocusing (AR) two-qubit gate fidelity: 98.4(1)%**, vs. **98.9(1)%** for a conventional time-optimal gate — the AR gate trades a bit of raw fidelity for a gate-error scaling that goes as (ΔI/I₀)⁴ instead of (ΔI/I₀)² (much less sensitive to laser intensity noise), and **detects 38(6)% of its own errors as erasures** mid-circuit.
- **Coherent transport: <6×10⁻⁴ dephasing+bit-flip probability per one-way trip** (~2.5 ms), with atom loss during transport at **1.1(4)%** — about half of which is caught as a detectable erasure.
- **[[4,2,2]] logical code, state-preparation fidelity:** 87.4(4)% unconditional → 90.2(3)% using erasure information → 98.1(2)% with flag post-selection → 99.5(1)% with flag *and* erasure post-selection. The logical error rate falls off **3.6(1)× faster** when erasure information is used.
- **Logical-qubit teleportation fidelity:** 77.1(9)% with random ancilla selection and syndrome post-selection, rising to 87(2)% with erasure post-selection and 80.2(8)% with adaptive (erasure-informed) ancilla selection.

This is exactly the kind of "erasure errors are cheaper to correct" argument the page already makes conceptually — these numbers would let it show the argument working end-to-end (physical gate → transport → logical state prep → teleportation), which no other page-cited paper currently does at this level of detail.

**Proposed scope (I can just do this, it's additive, no existing narrative to reverse):**
- Expand "09 Erasure Conversion" with a subsection walking through the AR-gate / transport / [[4,2,2]] / teleportation numbers above, framed as "erasure conversion, demonstrated end-to-end."
- Add the arXiv/Nature Physics link to the page's references.
- Consider a compact table (matches the page's existing `.sota-card`-style pattern) showing the four fidelity numbers (87.4% → 90.2% → 98.1% → 99.5%) as a "what erasure information buys you" ladder — this is a nice concrete visual and fits the toolkit's interactive/visual style.

---

## Finding 3 — `dd-playground.html` is already excellent and current (no action needed)

I went in expecting to find something to update here and instead confirmed the page is in great shape: it already cites Manetsch et al., *Nature* 647, 60 (2025) — the 6,100-atom Cs-133 array with **T₂* = 14.0(1) ms free Ramsey dephasing extended to T₂ = 12.6(1) s via XY-16 dynamical decoupling** — correctly, in multiple places (hero physics-context line, the actual noise-spectroscopy application section, references). That is in fact the current record for hyperfine-qubit coherence in an optical tweezer array (I checked; nothing published since beats it). No changes recommended here — flagging only so you know it was checked, not skipped.

---

## Finding 4 — `qc-landscape.html` is stamped "Data updated May 2026" and is now ~4 months stale

Given the page explicitly timestamps itself, a few things have moved since May:

- **Atom Computing raised a new funding round.** [Atom Computing announced $300M+ (Series C / US Commerce Dept letter of intent for $100M of it) in June 2026](https://thequantuminsider.com/2026/06/17/atom-computing-raises-more-than-300-million-to-accelerate-deployment-of-fault-tolerant-neutral-atom-quantum-computers/) to accelerate deployment of fault-tolerant neutral-atom systems. The page's "Investment Landscape" grid currently has cards for PsiQuantum, Quantinuum, QuEra, and IBM — Atom Computing isn't in that grid at all (it appears elsewhere on the page only as the 1,180-qubit Yb loading demo from 2023). Given you now work there, this seems like an obviously-worth-adding card, and it's also just a real, sourced, current industry data point.
- I did not do a full pass on every company tile (IBM/Google/Quantinuum roadmaps may have incremental updates too) — happy to do a deeper freshness pass on the rest of that page if you want it, but didn't want to over-scope this report with lower-confidence "maybe stale" items.

**Proposed scope:** add an Atom Computing investment card (with the $300M+ figure, sourced, dated June 2026) and bump the page's "Data updated" stamp accordingly. Low-risk, purely additive.

---

## Finding 5 — `paper-syllabus.html` has no 2025/2026 papers yet (optional enrichment)

The "Postdoc / Career Transition" tier's most recent hardware paper is Bluvstein et al., *Nature* 626 (2024). Two strong, citable candidates from this audit would fit naturally as new entries:
- Manetsch et al., *Nature* 647, 60 (2025) — 6,100-atom array, record coherence (already correctly used on `dd-playground.html`, just not in the syllabus).
- Evered et al. 2026 (arXiv:2604.25987) once/if Finding 1 is implemented — could be tagged "Experiment, arXiv preprint" since it isn't journal-published yet.

Low priority, purely additive, no existing content to reconcile.

---

## Not pursued further (checked, nothing actionable)
- `atom-library.html`'s atomic constants (D-line wavelengths, hyperfine splittings, magnetic moments) — spot-checked several against Steck/NIST conventions during earlier passes; no discrepancies found.
- Randomized benchmarking (`rb-explorer.html`) and general dynamical-decoupling literature — searched for anything published since the page's existing citations; nothing supersedes what's already there once dd-playground.html's Manetsch 2025 citation is accounted for (see Finding 3).

---

## Suggested order

1. You decide on **Finding 1** (the Rb-87 record) — it's the one narrative-inverting change.
2. I implement **Finding 2** (erasure-conversion numbers) — purely additive, ready to go whenever you say go.
3. I implement **Finding 4** (Atom Computing funding card) — quick, purely additive.
4. **Finding 5** (syllabus additions) — whenever, low priority.