# pages/psiquantum-vs-xanadu.html

**Purpose:** "PsiQuantum vs Xanadu, Photonic Quantum Computing" — new page (2026-09-22), the photonic-quantum-
computing company equivalent of `quantinuum-vs-ionq.html` and `google-vs-ibm.html`. Built alongside
`google-vs-ibm.html` in the same session, after Saumitra approved both of two brainstormed comparison pages.

## Flow
Hero (PsiQuantum violet vs Xanadu teal, page-scoped `--psi`/`--xan`/`--page` CSS vars) → sticky topic-nav → 9
numbered sections (one fewer than the other two pages — see "structural note" below): 01 Overview → 02 Architecture
(silicon-photonic fusion-based QC vs squeezed-light-then-fusion-based pivot) → 03 Milestones (dual timeline,
funding/infrastructure-heavy for PsiQuantum vs working-system-heavy for Xanadu, plus a modes/qubits scale chart) →
04 Component Fidelity Deep Dive → 05 Fault Tolerance & Loss-Tolerant Codes → 06 Full Comparison table (10 rows,
several explicitly marked "Tie / not comparable" rather than forced) → 07 Business, Funding & Public Markets → 08
Ecosystem → 09 Key Papers & References.

## Structural note: why this page is built differently
Unlike the other two comparison pages, PsiQuantum and Xanadu are **not reporting the same kind of result** —
PsiQuantum's public record is component/subsystem-level only (record photonic-component fidelities, no publicly
demonstrated full multi-qubit computer), while Xanadu has built and run two complete systems (Borealis 2022,
Aurora 2025). Rather than force a symmetric "fidelity vs fidelity" framing the way the trapped-ion and
superconducting pages do, Section 01's info-box states this asymmetry explicitly up front and the whole page is
organized around "what has each company actually run, end-to-end, in public" as the central question. This is
flagged directly in the page copy, not just in these notes, since presenting the two companies as directly
interchangeable would be the single easiest way for this page to mislead a reader.

## Sourcing discipline applied
- Every PsiQuantum fidelity figure (99.98% SPAM, 99.5% two-photon interference, 99.22% fusion, 99.72% interconnect)
  is explicitly labeled **"conditional on photon detection"** — i.e. computed only from trials where photons were
  successfully detected, excluding loss, the dominant photonic error source. The page separately surfaces PsiQuantum's
  own reported on-chip detection efficiency (88.9% ± 3.5%) as the actually loss-inclusive number, and a formula box
  makes the distinction quantitatively explicit (Section 04) rather than leaving "conditional" as an unexplained
  caveat.
- Xanadu's Borealis (Nature 606, 2022) and Aurora (Nature methods paper + Jan 2025 launch) are both presented as
  full-system, peer-reviewed-or-peer-reviewed-adjacent results — with Aurora's much smaller qubit count (12, vs
  Borealis's 216 modes) stated plainly rather than glossed over, since "universal" (Aurora) and "216 modes" (Borealis,
  non-universal Gaussian boson sampling) are answering different questions and conflating them would overstate
  Aurora's scale.
- PsiQuantum's valuation history is dated precisely across two rounds ($7B, Sep 2025; $10.5B, May 2026) rather than
  using a single ambiguous figure — cross-checked against a dedicated funding-tracking source (Sacra) rather than
  taken from a single news article's headline number.
- Xanadu's transition to a public company (SPAC merger with Crane Harbor Acquisition Corp., $3B pre-money valuation
  announced Nov 2025, closed and began trading as XNDU on Nasdaq/TSX Mar 27 2026) is dated at each stage
  (announcement vs shareholder approval vs actual listing) rather than collapsed into one date, since those are
  materially different milestones.
- The comparison table (Section 06) marks several rows "Tie / not comparable" rather than manufacturing a false
  edge where the two companies' public disclosures genuinely aren't measuring the same thing (e.g. Xanadu's Aurora
  component fidelities are not separately publicized to the granularity PsiQuantum's Omega disclosures reach).

## Site integration
- `js/main.js`: added `psiquantum-vs-xanadu` (and `google-vs-ibm`, same commit) entries to `NAV.career`,
  `SEARCH_KEYWORDS`, `SOURCE_PROFILES`, `PAGE_PLAYBOOKS`, `RELATED_TOOLS`, `REFERENCE_TRAILS`. Cache-bust bumped
  `main.js` v25 → v26 sitewide (32 files, shared with the google-vs-ibm change).
- `sitemap.xml`: new `<url>` entry added.
- Manual `.see-also` cross-links: `qc-landscape.html` now links to this page; this page links to `qc-landscape.html`,
  `google-vs-ibm.html`, and `quantinuum-vs-ionq.html` (the three sibling hardware-modality comparison pages).

## Verification
`tests/formula_regression.py`: 11/11 pass. Tag-balance (div/section/ul/li/a/table/tr/td/th/thead/tbody/nav/button/
main/footer/style/script) clean. No duplicate `id` attributes; both `formula-box` KaTeX blocks have balanced `$$`
pairs. `node --check` passes on all inline `<script>` blocks; both JSON-LD `<script type="application/ld+json">`
blocks validate as JSON. Cache-bust versions grep-verified consistent sitewide (main.js v=26 × 32 files, styles.css
unchanged at v=21). File transferred to device via `device_commit_files` and committed locally; **not pushed from
this session** (device_bash has no network egress) — user must push via GitHub Desktop or terminal.
