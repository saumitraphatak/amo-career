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

## Science-content refresh (2026-09-26)
Rotation re-check of the science-content audit. Added two new 2026 Quantinuum logical-qubit preprints to Section 05 and Section 10, verified against primary/near-primary sources (arXiv abstract pages plus independent press coverage), purely additive alongside the existing Nov 2025 Helios launch claims: "Skinny Logic" iceberg codes (arXiv:2602.22211, Feb 2026 — up to 94 error-detected / 48 error-corrected logical qubits on the same 98-qubit Helios hardware, GHZ fidelity ≈95%) and "Helix" (arXiv:2609.03194, Sep 2026 — a logical qubit in just 10 physical ions at code distance 6, logical Clifford-gate error 2.8×10⁻⁴ and logical memory error 4.6×10⁻⁵/cycle, both below the physical baseline). Both tagged `preprint, not yet peer-reviewed`, consistent with how this page already treats IonQ's component-level 99.99% preprint. No existing claim was changed or reversed. See docs/science-audit-2026-09-26.md.

## Technical/SEO/consistency audit update (2026-09-28)
Rotation re-check of the technical/SEO/consistency audit. Meta description was 202 characters (42 over the 160-char limit) — trimmed to 142 chars preserving the same facts. Also added this page (plus its three siblings) to `llms.txt`/`llms-full.txt`, which had drifted to only list 26/32 pages. See docs/technical-audit-2026-09-28.md.

## Interactive pass (2026-09-28): "make the comparison pages more interesting"
Three additions, all built from the page's own content (nothing new is asserted):
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
- **"Two ways to talk to an ion"** (end of Section 02, `js/vs-ions.js` + `orbit3d.js`). A rotatable schematic 3D scene.
  - Left: ions in a storage ring, a pair shuttled through a four-way junction into a gate zone, and two steered laser beams driving the gate. This follows Section 02's Helios description.
  - Right: an ion chain above a chip, with the electrodes underneath lighting up to drive the gate. This follows the EQC description.
  - Labelled "schematic, not to scale; ion counts illustrative". The ring is drawn static (the "rotatable" ring is not animated) to avoid implying a mechanism.
  - Has a pause button, a still frame under reduced motion, and stacks vertically on phones.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- **Dollar amounts were being typeset as maths.** KaTeX auto-render pairs any two `$` in one text node, so "$1B raise, … $7B" became italic maths with the words run together (the unbreakable run made the page 445–467 px wide on phones). Every amount is now wrapped in `<span class="money">`, and main.js's auto-render call ignores `.money` and `.no-math`. The Tug-of-war and Race-replay widgets built by `js/versus.js` (v=2) carry `no-math`, since they copy the page's text (including prices) before KaTeX runs. Keep writing prices as `<span class="money">$1.5B</span>` on these pages.
