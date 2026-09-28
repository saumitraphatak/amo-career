# Science Content Audit — Rotation Re-check (2026-09-26)

Scope: rotation re-check of the science-content audit (`docs/science-audit-2026-09.md` 2026-09-08, last rechecked `docs/science-audit-2026-09-15.md`). This was the most-overdue item across the eight-audit rotation — every other original-menu audit had a re-check dated 2026-09-16 through 2026-09-26 (technical, link, design, cross-page-consistency, flow, accessibility, navigation, performance), while science content hadn't been rechecked since 2026-09-15, 11 days prior — and quantum-computing hardware records move faster than anything else on this site.

Method: a research subagent did a broad first pass (web search + primary-source fetch across arXiv, Nature, company press, and independent trade press) checking eight specific areas — the neutral-atom gate-fidelity record, trapped-ion records, superconducting-qubit news, neutral-atom company news, erasure-conversion/logical-qubit follow-ons, coherence records, D-Wave/Microsoft/Rigetti news, and general hardware announcements since the 2026-09-15 cutoff. Every item the subagent flagged as new or actionable was independently re-verified here by fetching the primary or near-primary source (arXiv abstract page, company press release, or a specific news article) before any edit was made, per the site's established "delegate research, verify before acting" convention.

---

## Finding 1 — Two internal inconsistencies on `qc-landscape.html` between its own chart and its own prose — IMPLEMENTED (mechanical fix)

The 2026-09-22 `quantinuum-vs-ionq.html` work (see that page's own page-notes) had already corrected this page's animated "qubit race" canvas — Quantinuum's entry was fixed from "98 Yb⁺" to "98 Ba⁺ (Yb⁺ coolant)" and IonQ's entry was updated from "#AQ64 Tempo / 64 qubits" to "Superion 256 (Sep 2026) / 256 qubits" — but two other places on the *same page* were never updated to match, so the page has been contradicting its own chart since 2026-09-22:

- The Companies deep-dive's Quantinuum profile card still said "Helios processor (98 trapped ¹⁷¹Yb⁺ ions...)" — factually wrong; Helios uses ¹³⁷Ba⁺ hyperfine qubits with ¹⁷¹Yb⁺ used only as a sympathetic-cooling species (correctly stated on `quantinuum-vs-ionq.html` in multiple places, and now correctly stated in this page's own chart). Corrected the profile card to match.
- The Companies deep-dive's IonQ profile card, and the platform-snapshot table's trapped-ion qubit-count range ("56–98 gate-quality"), never mentioned Superion 256 at all. Added a Superion 256 sentence to the IonQ card and widened the table range to "56–256 gate-quality (256 = IonQ Superion 256, 2026)".

Both are plain factual corrections with a single right answer, already established elsewhere on the same page and cross-verified on `quantinuum-vs-ionq.html` — no judgment call involved.

## Finding 2 — Two new 2026 Quantinuum logical-qubit preprints, not previously on the site — IMPLEMENTED (additive)

Independently verified via arXiv abstract pages and cross-checked against independent trade-press coverage (Quantum Computing Report, Quantum Zeitgeist, Quantum Brief), since neither has a journal reference yet:

- **"Skinny Logic" iceberg codes** — Dasu, DeCross, Guo, Lavasani, Behrends et al. (Quantinuum), *"Computing with many encoded logical qubits beyond break-even,"* [arXiv:2602.22211](https://arxiv.org/abs/2602.22211), submitted 2026-02-25. High-rate iceberg quantum error-detecting codes and two-level concatenated iceberg error-correcting codes, run on the same 98-qubit Helios hardware already on the site: up to 94 error-detected logical qubits, and separately up to 48 error-corrected logical qubits (these are different benchmark configurations, not simultaneous), GHZ-state fidelity ≈95%, logical gate error ≈10⁻⁴. Preprint, no journal-ref.
- **"Helix" compact code** — Quantinuum, *"Experimental validation of a compact fault-tolerant architecture for trapped ions,"* [arXiv:2609.03194](https://arxiv.org/abs/2609.03194), submitted 2026-09-02 (company blog 2026-09-08). A logical qubit encoded into just 10 physical ions at code distance 6 — logical Clifford-gate error 2.8×10⁻⁴ (vs. ≈1.2×10⁻³ physical baseline, roughly 4.3× better) and logical memory error 4.6×10⁻⁵ per logical qubit per cycle, both below the physical-layer baseline. Preprint, no journal-ref.

Both are purely additive next to the existing Nov 2025 Helios-launch claims (94 entangled/50 error-detected/48 error-corrected logical qubits) — nothing was reversed or replaced. Added to `qc-landscape.html`'s Helios flash-card and Status(2025–2026) summary, and to `quantinuum-vs-ionq.html`'s Section 05 (Logical Qubits & Fault Tolerance) and Section 10 (References), tagged `preprint, not yet peer-reviewed` throughout, matching the convention already used for IonQ's own component-level preprint on the same page.

## Finding 3 — Three company/funding items since 2026-09-15 — IMPLEMENTED (additive, one sentence each)

Each verified against its own primary press release/announcement:

- **Pasqal went public on Nasdaq** (ticker `PSQL`), ringing the closing bell 2026-09-17. Added one sentence to Pasqal's Companies profile card on `qc-landscape.html`, matching how the page already notes IonQ/Rigetti/D-Wave's public-market status.
- **Anderon (IBM's new standalone quantum-foundry subsidiary) finalized a $1B CHIPS Act award**, matched by $1B of IBM's own investment, to build a 300mm pure-play quantum wafer foundry in Albany, NY (finalized 2026-09-16, per IBM's own press release). Added a new Investment Landscape card, following the same pattern as the existing Atom Computing/PsiQuantum CHIPS-adjacent cards.
- **Microsoft introduced a second-generation "Majorana 2" chip** (material stack switched from aluminum to lead) and gave DARPA on-site access to test it independently, alongside opening a new Maryland Quantum Research Center (2026-09-22 announcement). No new qubit-count or fidelity numbers were disclosed. Added one sentence to the existing Majorana flash-card on `qc-landscape.html`.

## Finding 4 — Everything else checked: still current, no action needed

- **Neutral-atom gate-fidelity record** (Evered et al., arXiv:2604.25987, 99.854%/99.941%): still v1-only on arXiv, no journal-ref, still nothing published that beats it. No change.
- **Erasure-conversion / Zhang et al. + Senoo et al.**: no newer follow-on found. No change.
- **Coherence record** (Manetsch et al., 6,100-atom Cs-133 array, T₂=12.6 s): no newer record found. No change.
- **QuEra's gigaquop roadmap, Atom Computing's $300M+ raise**: unchanged since 2026-09-15, still accurately reflected on the site.
- **Google Willow / IBM Heron/Nighthawk/Kookaburra roadmap**: no new technical fidelity/qubit-count milestone found in this window (the Anderon foundry deal, above, is manufacturing/funding news, not a new chip result).
- **D-Wave, Rigetti**: no new technical results found since 2026-09-15 (only routine conference-showcase press).
- A research pass flagged two Sept-16-dated "records" (IonQ >99.9% barium fidelity; Oxford Ionics "1,300% error reduction") that turned out, on checking the underlying source, to be recycled 2024 press releases resurfacing in a news aggregator — not new results. Flagging this here as a caution for future rotations: a "latest news" search result dated this month can still be citing a stale announcement; always check the *original* press-release date, not the aggregator's repost date.

---

## Not pursued this round — needs your call, or lower priority

- **DOE's $215M "Quantum Genesis Q Competition"** (announced 2026-09-18, milestone awards tied to reaching 100/150/200 logical qubits): a genuine, sourced, current policy/funding item, but it isn't tied to any one company's existing card on `qc-landscape.html` and the page doesn't currently have a "government programs" section — adding it well would mean either shoehorning it into an existing card or designing a new section, which felt like more of a judgment call about page structure than this round's scope. Flagging for you to decide: quick one-line mention in the existing `warn-box` about government investment (already says ">$20B... committed"), or skip it as too granular for an already-dense page.
- **Deeper freshness pass on IonQ/Rigetti/D-Wave/Microsoft/Pasqal/Infleqtion company profiles beyond what's covered above** — the 2026-09-15 report suggested this as a next-rotation candidate; this round's research subagent did cover all six but the news was thin (see Finding 3/4 above) — a dedicated pass focused specifically on each company's own roadmap page (rather than news search) might still turn up incremental roadmap-date changes, but didn't seem worth a full separate pass given how little moved in two weeks.

---

## Verification performed
- `tests/formula_regression.py`: 11/11 passing before starting and after every batch of edits.
- HTML tag-balance (div/ul/li/tr/td/section/p open-vs-close counts) checked clean on both touched files: `pages/qc-landscape.html`, `pages/quantinuum-vs-ionq.html`.
- Every edit applied via exact-string substitution with a uniqueness check (fails loudly if a target string doesn't appear exactly once), so no accidental double-edits or partial matches.
- No CSS or JS shared files were touched this pass (all new tags — `.invest-card`, `.source-tag.preprint`, `.flash-card` — already existed), so no cache-busting version bump was needed. Grep-confirmed no stray edits to `css/styles.css` or `js/main.js`.
- Every new fact was independently re-fetched from its primary or near-primary source (arXiv abstract page, company press release, or a specific dated news article) rather than taken on the research subagent's report alone.

## Suggested next rotation
- Link audit (last run 2026-09-16, now the second-most-overdue item after this one).
- If you'd like the DOE Genesis Q Competition item added, let me know how you'd like it framed and I'll add it next time; otherwise it'll age out of relevance on its own.
