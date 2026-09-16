# Science Content Audit — Follow-Up (2026-09-15)

Scope: this is a rotation re-check of the science-content audit (`docs/science-audit-2026-09.md`, 2026-09-08), per the maintenance-mode instructions — all eight original audits in the 2026-09-08 menu are now complete (cross-page-consistency, accessibility, and navigation/IA were finished 2026-09-09; performance was finished 2026-09-11), so this run rotates back to re-checking science content, since quantum-computing records move fastest of anything on this site.

Method: web search + primary-source fetch (arXiv abstract pages, Nature/Nature Physics articles, NIST/company press releases), checked against the specific claims already on the site rather than an open-ended trawl. A research subagent did the first broad pass; every claim it flagged as "new" was independently re-verified here (fetching the actual arXiv/Nature page) before any edit was made, per the site's "delegate research, verify before acting" convention.

---

## Finding 1 — Rb87 preprint record (Evered et al., arXiv:2604.25987): still current, no change

Checked whether the April 2026 preprint the site already cites (99.854% raw / 99.941% post-sel, added in the 2026-09-08 audit) has been journal-published yet, and whether anything has beaten it. Confirmed via the arXiv abstract page: still v1 only, no journal-ref, not yet peer-reviewed as of 2026-09-15. No neutral-atom result was found beating 99.941%. No action taken — the page's existing "preprint, provisional" framing is still accurate.

## Finding 2 — Quantinuum Helios supersedes the H2 numbers used as this site's trapped-ion reference point — IMPLEMENTED (additive, not narrative-inverting)

**What was on the site:** `qc-landscape.html` used Quantinuum's H2/H2-1 processor (56 qubits, 2024, 99.9% two-qubit fidelity) as its reference "best trapped-ion" data point in roughly a dozen places — flash-card grid, both bar charts, the qubit-race canvas, the platform-snapshot table, the DiVincenzo status paragraph, the Companies deep-dive, the investment grid, the trapped-ion timeline, and two references lists. `learn-quantum.html` cited the same H2 99.9% figure once, in a "2024–25 State of the Art" box. `llms-full.txt`'s hardware-platform table also said "Quantinuum (H2)".

**What's new, independently verified:** Quantinuum launched **Helios** (98 fully-connected trapped-ion qubits, full all-to-all connectivity) in November 2025 — nearly double H2's qubit count. Sandia and Quantinuum published peer-reviewed results in *Nature* (June 2026, [10.1038/s41586-026-10676-4](https://www.nature.com/articles/s41586-026-10676-4)): average single-qubit infidelity 2.5(1)×10⁻⁵ (~99.9975%) and two-qubit infidelity 7.9(2)×10⁻⁴ (~99.921%) — beating H2's 99.9%. Helios also demonstrated 48 fully error-corrected logical qubits at a 2:1 encoding rate. This is not a narrative inversion (trapped ions were already the fidelity leader in the site's own framing and remain so) — it's the same platform's own newer, better, peer-reviewed number, so it was safe to add without asking first, following the same "additive, no approval needed" treatment as Finding 2 in the original science audit.

**What was done:** added Helios data *alongside* the existing H2 mentions everywhere H2 appeared (new flash-card, updated bar-chart data points and labels, updated qubit-race entry, updated platform-snapshot table cell, updated status paragraph, updated Companies blurb, updated investment-grid card, added two new timeline entries, added a reference in both reference lists, updated one sentence in `learn-quantum.html`'s SOTA box, updated `llms-full.txt`). Nowhere was H2 deleted or its numbers overwritten — every H2 mention that remains is clearly historical/contextual (e.g. chart note now reads "99.9% fidelity (2024)").

## Finding 3 — QuEra's "Gigaquop-class" fault-tolerance roadmap (June 2026) — IMPLEMENTED (additive)

QuEra published a fault-tolerance roadmap in June 2026 that wasn't reflected anywhere on the industry-landscape page: Libra, a "megaquop-class" (~10⁶ reliable logical operations) system targeted for Amazon Braket around 2028, followed by a "gigaquop-class" (~10⁹ reliable logical operations) system — 1,000+ logical qubits at a 10⁻⁹ logical error rate, built on 20,000+ physical qubits in a single processing core. Verified against QuEra's own press release. Added as a new flash-card, tagged `company-roadmap` (the same source-confidence convention used for IBM's roadmap card).

## Finding 4 — PsiQuantum's September 2026 CHIPS Act award — IMPLEMENTED (additive)

The US Department of Commerce finalized a $100M CHIPS Act R&D award with PsiQuantum on 2026-09-08 (verified against NIST's own announcement) — funding work on electro-optic materials, high-temperature single-photon detectors, and ultra-low-loss photonic packaging. This is a *separate* program from Atom Computing's own $100M DoC letter of intent (already on the page from the 2026-09-08 audit) — double-checked the two are not the same award before adding this as a one-sentence update to PsiQuantum's existing flash-card, with a source link.

## Finding 5 — Yb171 "error-detected" gate fidelity (Senoo et al., companion to the Zhang et al. erasure-conversion paper) — IMPLEMENTED (additive, deliberately not framed as a headline-number replacement)

A research subagent flagged Senoo et al. (JILA/Kaufman group — the same group behind Jenkins et al. 2022, the first Yb171 tweezer-qubit paper already cited on `rb87-vs-yb171.html`), published in the *same* June 2026 *Nature Physics* issue as the Zhang et al. erasure-conversion paper the site already covers. It reports a 99.78(4)% **error-detected** two-qubit gate fidelity — nominally higher than the page's 99.72% Yb171 headline number (Muniz et al.), but on a *different qubit encoding* (metastable/erasure-encoded, not ground-state hyperfine). Independently verified via the arXiv abstract page before acting. Judgment call: rather than treat this as a "new record" that flips the page's Yb171 headline stat (which would misrepresent what was actually measured), added it as a clearly-labeled companion/complementary result — a new paper-card in Section 12, a short paragraph in Section 09 explaining the encoding difference, and one sentence added to the Kaufman-group company-card. The existing 99.72% headline number and comparison table were not touched.

## Finding 6 — `paper-syllabus.html` Finding 5 (from the 2026-09-08 report) implemented — enrichment, no science to reconcile

The original science audit flagged this as optional/low-priority: the Advanced-Grad/Thesis tier's neutral-atom paper sequence ended at Bluvstein et al. 2024 with no 2025/2026 entries. Added two papers directly after it, continuing the existing Urban→Saffman→Evered 2023→Bluvstein 2024 arc: Manetsch et al. 2025 (the 6,100-atom coherence-record paper, already correctly cited on `dd-playground.html`) and Evered et al. 2026 (the arXiv preprint from Finding 1 above, tagged "Preprint"). This required renumbering papers 34–53 to 36–55 and updating the total-paper-count text in four places (page title, SVG badge, route-panel copy, Stage 3 counter-pill). Verified programmatically that the renumbered `paper-num` set is exactly {1..55} with no gaps or duplicates before treating the edit as done.

## Finding 7 — Coherence record (Manetsch et al., 12.6 s) and erasure-conversion numbers (Zhang et al.): still current, no change

Checked whether anything has beaten the 6,100-atom / T₂=12.6(1) s coherence benchmark, or added a significant follow-on to the Zhang et al. erasure-conversion results. Nothing found (one JILA strontium optical-clock coherence claim surfaced but measures a different thing — clock-transition coherence for metrology, not a hyperfine computational-qubit T₂ in a gate array — and isn't a valid comparison). No action needed; both were already confirmed correct in the 2026-09-08 audit and remain so.

---

## Not pursued further (checked, nothing actionable)
- Randomized benchmarking / dynamical-decoupling literature beyond Manetsch 2025: nothing new found.
- Google, IBM: no major milestone announcements found after their last-covered updates (Google's biggest 2026 result predates this site's coverage window; IBM's roadmap is unchanged since the last check).
- IonQ, Rigetti, D-Wave, Microsoft, Pasqal, Infleqtion company profiles: not re-audited this pass — in scope for a future rotation if a deeper industry-landscape freshness pass seems worthwhile.

## Verification performed
- `tests/formula_regression.py`: 11/11 passing after every batch of edits.
- HTML tag-balance (div/ul/li/tr/td/section/p open-vs-close counts) checked clean on all five touched files: `pages/qc-landscape.html`, `pages/rb87-vs-yb171.html`, `pages/learn-quantum.html`, `pages/paper-syllabus.html`, `llms-full.txt`.
- `paper-syllabus.html`'s renumbered `paper-num` sequence verified programmatically to be exactly 1–55 with no gaps or duplicates.
- Every new fact was independently re-fetched from its primary source (arXiv abstract page, Nature article page, or the originating institution's own announcement) before being added — not taken on the research subagent's word alone.
- No CSS/JS shared files were touched this pass, so no cache-busting version bump was needed.

## Open decisions for Saumitra
None — every change this pass was additive (new data alongside old, nothing overwritten or narrative-inverting), so nothing required a judgment call. The only borderline case (Finding 5, Senoo et al.) was resolved by adding it as an explicitly-labeled companion result on a different qubit encoding rather than guessing whether it "counts" as beating the existing headline number.

## Suggested next rotation
- Link audit (last run 2026-09-08, one week+ stale — links rot over time even without new science).
- A deeper industry-landscape freshness pass on `qc-landscape.html`'s remaining company profiles (IonQ, Rigetti, D-Wave, Microsoft, Pasqal, Infleqtion), which weren't re-checked this pass.
