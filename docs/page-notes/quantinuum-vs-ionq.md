# pages/quantinuum-vs-ionq.html

**Purpose:** "Quantinuum vs IonQ, Trapped-Ion Showdown" — new page (2026-09-22), the trapped-ion-company equivalent
of `rb87-vs-yb171.html`. Requested directly by Saumitra: "make a page for that... thorough... lots of references...
make it an amazing page."

## Flow
Hero (Quantinuum violet vs IonQ blue, page-scoped `--qtm`/`--ionq`/`--page` CSS vars, distinct from the rb/yb page's
orange/emerald) → sticky topic-nav → 10 numbered sections: 01 Overview → 02 Architecture & Qubit Control (laser QCCD
vs Electronic Qubit Control, the central technical thesis of the page) → 03 Hardware Generations (dual timeline,
H1→H2→Helios→Sol/Apollo vs Harmony→Forte→Tempo→Superion 256/10K, plus a demonstrated-qubit-count bar chart) → 04 Gate
Fidelity (formula box + bar chart, explicit peer-reviewed-vs-preprint-vs-component-level framing) → 05 Fault Tolerance
& Logical Qubits (QEC threshold-scaling formula, Microsoft/Quantinuum logical-qubit history, IonQ qLDPC break-even
preprint) → 06 Full Comparison table (10 categories, ~24 rows) → 07 Business & Markets → 08 Roadmaps (line chart of
IonQ's published 2026–2030 logical-qubit targets vs a single Quantinuum Apollo order-of-magnitude marker) → 09
Ecosystem → 10 Key Papers & References (peer-reviewed / preprint / company sections kept visually separate, same
convention as the rb/yb page).

## Sourcing discipline applied
- Quantinuum Helios's peer-reviewed *Nature* numbers (99.9975% 1Q / 99.921% 2Q / 99.967% SPAM, arXiv-independent,
  Nature 655:81-86, 2026) are used as the authoritative figures; the company's own launch blog rounds SPAM to
  "99.99%" and that discrepancy is called out explicitly (Section 04) as a worked example of peer-reviewed vs
  marketing rounding, in the same spirit as the rb/yb page's source-confidence framing.
- IonQ's headline "99.99% two-qubit fidelity" (arXiv:2510.17286) is flagged everywhere it appears as a **two-ion,
  component-level, preprint** result, not a full-system peer-reviewed number — the page is explicit that neither
  company currently has a peer-reviewed full-system number above ~99.93%.
- IonQ's qLDPC break-even preprint (arXiv:2606.06455) is flagged as reportedly using ¹³³Ba⁺ ions per two independent
  secondary sources — inconsistent with IonQ's commercial ¹⁷¹Yb⁺ product line — noted as "worth independent
  verification" rather than stated as settled fact.
- Every multi-year roadmap figure (IonQ's 2025-2030 table, Quantinuum's Sol/Apollo targets) is tagged
  `company-roadmap` and the page states directly that IonQ's implied ~10×/1-2yr qubit-count growth rate has no
  historical precedent in any qubit modality.
- Business figures (IPO valuation, market cap, quarterly revenue) are each given a specific date, since both are
  volatile and public-market figures — avoided an unreliable one-off market-cap figure for IonQ (~$27B) found in a
  single survey article that conflicted with a dedicated, dated market-data source (~$14.72B, Sep 15 2026); used the
  latter.

## Site integration
- `js/main.js`: added `quantinuum-vs-ionq` entries to `NAV.career`, `SEARCH_KEYWORDS`, `SOURCE_PROFILES`,
  `PAGE_PLAYBOOKS`, `RELATED_TOOLS`, `REFERENCE_TRAILS` — same six touchpoints `rb87-vs-yb171` uses. Cache-bust
  bumped `main.js` v24 → v25 sitewide (30 files) since main.js content changed.
- `sitemap.xml`: new `<url>` entry added.
- Manual `.see-also` cross-links added both directions: `rb87-vs-yb171.html` and `qc-landscape.html` now link to
  this page, and this page links back to both plus `fidelity-budget.html`.
- Bonus accuracy fix while in `qc-landscape.html`: the animated "qubit race" canvas data had Quantinuum Helios
  labeled "98 Yb⁺" — corrected to "98 Ba⁺ (Yb⁺ coolant)" to match the peer-reviewed Nature paper's actual qubit
  species (Helios switched from ytterbium to barium; ytterbium is only the sympathetic-cooling species). Also
  updated IonQ's entry in that same chart from a stale "#AQ64 Tempo benchmark / 64 qubits" to "Superion 256 (Sep
  2026) / 256 qubits" to reflect the newer system.

## Verification
`tests/formula_regression.py`: 11/11 pass. Tag-balance (div/section/ul/li/a/table/tr/td) clean on the new page and
both edited pages (`rb87-vs-yb171.html`, `qc-landscape.html`). `node --check js/main.js` passes. Cache-bust versions
grep-verified consistent sitewide (main.js v=25 × 30 files, styles.css unchanged at v=21 since no CSS file was
touched — the new page's styling is entirely in its own page-scoped `<style>` block, following the rb/yb page's
pattern).
