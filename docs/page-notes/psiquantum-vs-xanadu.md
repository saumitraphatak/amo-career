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

## Technical/SEO/consistency audit update (2026-09-28)
Rotation re-check of the technical/SEO/consistency audit. Meta description was 205 characters (45 over the 160-char limit) — trimmed to 154 chars preserving the same facts. Also added this page (plus its three siblings) to `llms.txt`/`llms-full.txt`, which had drifted to only list 26/32 pages. See docs/technical-audit-2026-09-28.md.

## Interactive pass (2026-09-28): "make the comparison pages more interesting"
Three additions, built from the page's own content:
- **Race replay** (top of Section 03, `js/versus.js`). Both Section-03 timelines on one shared time axis, parsed from the `.tl-item` year text.
  - Controls: a scrubbable playhead, ▶ Replay, and a "by <year>" card per company with the latest demonstrated milestone.
  - Roadmap/target items (`(target)` in the year, or a `company-roadmap` tag) are drawn hollow and dashed and are never shown as the latest demonstrated milestone.
  - Clicking a marker flashes the full timeline entry. It opens at "today" (Sep 2026); Replay starts from the beginning.
  - Maintenance: new timeline items appear automatically. Keep the `tl-year` format "Mon YYYY · Label" or "YYYY (target)".
- **Tug of war** (top of the Full Head-to-Head section, `js/versus.js`).
  - What it does: tallies the table's own *Edge* column, and readers toggle which categories count.
  - How a row is attributed: by the page's `win <side>` classes; otherwise by the Edge text starting with a side's name.
  - Conditional calls ("if it scales", "pending review", "if realized") count ½ and are drawn dashed.
  - Clicking a row flashes it in the table.
  - The caption says this is a tally of the page's calls, not a score. No new claims are made.
  - Editing the table (or its Edge text / `win` classes) updates the widget automatically.
- **Loss budget: follow the photons** (end of Section 05, `js/vs-photons.js`). A five-stage optical chain (source, on-chip routing, chip-to-chip coupling, fiber link, detector) with efficiency sliders.
  - What it computes: η_total = Π ηᵢ (Section 05's formula), photons lost per 1,000, and the probability a k-photon resource state arrives complete (η_total^k, with k marked "illustrative").
  - A Monte Carlo photon stream drops photons at the stage that lost them.
  - The only company figure used is PsiQuantum's reported 88.9% on-chip detection efficiency (first preset; other stages lossless). The other presets are "every stage 99% / 97%".
  - No per-stage losses are attributed to either company, and the caption says so.
  - Pause button; no stream under reduced motion.
