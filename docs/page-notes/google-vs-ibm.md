# pages/google-vs-ibm.html

**Purpose:** "Google vs IBM, Superconducting Qubit Showdown" — new page (2026-09-22), the superconducting-qubit
company equivalent of `quantinuum-vs-ionq.html`. Built alongside `psiquantum-vs-xanadu.html` after Saumitra approved
two of three brainstormed comparison-page ideas ("Yes can you do those two? Google vs IBM and PsiQuantum vs
Xanadu?").

## Flow
Hero (Google blue vs IBM purple, page-scoped `--goog`/`--ibm`/`--page` CSS vars) → sticky topic-nav → 10 numbered
sections: 01 Overview → 02 Architecture (fixed-frequency near-square lattice vs heavy-hex-then-square-lattice pivot)
→ 03 Hardware Generations (dual timeline, Foxtail/Bristlecone→Sycamore→Willow vs Eagle→Osprey→Condor→Heron→
Nighthawk, plus a qubit-count bar chart) → 04 Gate Fidelity (formula box distinguishing Willow's two differently-
tuned chip variants, bar chart) → 05 Fault Tolerance (below-threshold surface-code formula, IBM's bivariate-bicycle
qLDPC roadmap Loon→Kookaburra→Cockatoo→Starling) → 06 Advantage & Utility Claims (a section unique to this page:
both companies' headline claims — 2019 Sycamore supremacy, 2025 Quantum Echoes, 2023 IBM utility — presented
alongside the classical-simulation rebuttals each one received) → 07 Full Comparison table (10 rows) → 08 Business,
Investment & Roadmaps → 09 Ecosystem → 10 Key Papers & References.

## Sourcing discipline applied
- Willow's spec sheet reports **two distinct chip variants** with different calibration numbers (Chip 1, QEC-tuned:
  99.965%/99.67%/99.23%, T1=68μs; Chip 2, RCS-tuned: 99.964%/99.86%/99.33%, T1=98μs) — kept explicitly separate
  everywhere on the page rather than conflated into one "Willow fidelity" number, since Google's own spec sheet
  attributes the split to a deliberate geometry tradeoff between shielding and coherence, not measurement noise.
- IBM's 2023 "utility" claim (Nature 618, kicked Ising model on 127-qubit Eagle) is presented together with its
  rebuttal: Tindall/Fishman et al.'s classical tensor-network simulation (arXiv:2306.14887, later PRX Quantum
  5:010308) that reproduced the same physics "significantly more accurate and precise" than IBM's noise-mitigated
  quantum output. IBM's own paper is quoted acknowledging it "fully expect[ed]" this to happen — used to frame the
  rebuttal as normal scientific process, not a "gotcha."
- Google's 2019 Sycamore supremacy claim is likewise presented with its own disputed history (IBM's contemporaneous
  2.5-day classical-runtime rebuttal, later GPU-cluster simulation work) for symmetry — this page does not let
  either company's headline claim stand unchallenged while contesting the other's.
- Google's 2025 Quantum Echoes claim (13,000× speedup, Nature, Oct 2025) is flagged as differing materially from
  both companies' earlier claims because it was cross-validated against real NMR spectroscopy data (with UC
  Berkeley), not solely against classical simulation — explicitly noted as a stronger, though not conclusive, form
  of verification, and explicitly noted that no classical rebuttal has appeared as of this writing.
- Business section is honest about an actual data limitation: neither company discloses standalone quantum-computing
  financials (Google folds Quantum AI into Alphabet's broader R&D; IBM's quantum unit sits inside a larger
  Technology segment) — the section compares public-communication *strategy* (dated physics milestones vs dated
  commercial/revenue targets) rather than fabricating a false financial comparison.
- IBM's $10B+ investment figure (Jun 2026) and 2028–2029 revenue-impact guidance are both tagged `company-roadmap`
  and dated to their specific announcement, not presented as realized results.

## Site integration
- `js/main.js`: added `google-vs-ibm` (and `psiquantum-vs-xanadu`, same commit) entries to `NAV.career`,
  `SEARCH_KEYWORDS`, `SOURCE_PROFILES`, `PAGE_PLAYBOOKS`, `RELATED_TOOLS`, `REFERENCE_TRAILS` — the same six
  touchpoints used by `quantinuum-vs-ionq`. Cache-bust bumped `main.js` v25 → v26 sitewide (32 files).
- `sitemap.xml`: new `<url>` entry added.
- Manual `.see-also` cross-links added both directions: `qc-landscape.html` and `quantinuum-vs-ionq.html` now link to
  this page; this page links back to `qc-landscape.html`, `quantinuum-vs-ionq.html`, and `rb87-vs-yb171.html`.

## Verification
`tests/formula_regression.py`: 11/11 pass. Tag-balance (div/section/ul/li/a/table/tr/td/th/thead/tbody/nav/button/
main/footer/style/script) clean. No duplicate `id` attributes; both `formula-box` KaTeX blocks have balanced `$$`
pairs. `node --check` passes on all inline `<script>` blocks; both JSON-LD `<script type="application/ld+json">`
blocks validate as JSON. Cache-bust versions grep-verified consistent sitewide (main.js v=26 × 32 files, styles.css
unchanged at v=21 since no shared CSS file was touched). File transferred to device via `device_commit_files` and
committed locally; **not pushed from this session** (device_bash has no network egress) — user must push via
GitHub Desktop or terminal.
