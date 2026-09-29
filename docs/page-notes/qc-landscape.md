# pages/qc-landscape.html

**Purpose:** "Quantum Industry Map" — a researcher's guide to the QC hardware race: platforms, companies, metrics, and where neutral atoms fit.

## Flow
1. Page hero — updated-to-date stamped (May 2026), 6 platforms.
2. Route panel — "Use this as a map, not a press-release feed" + 4 cards: What changed recently → Compare platforms → Neutral-atom relevance → Read caution labels.
3. **~15 top-level sections** (2024-2026 Flash Points, The NISQ Era, The Qubit Race, DiVincenzo Criteria, Analog vs Digital, Platform Comparison [2 chart tabs], Platform Deep Dives [6 hardware-type tabs: Superconducting/Trapped Ions/Neutral Atoms/Silicon Spins/Photonic/Defects & Topo], Road to Fault-Tolerant QC, Platform Snapshot Table, Investment Landscape, Neutral Atom Roadmap, AMO Physics → Quantum Industry, References).

## Review outcome: approved, no changes (autonomous pass)
Same category as rydberg-calculator: the 4 route-cards describe a **conceptual reading strategy** across a large survey page, not a literal 1:1 index of ~15 sections plus 8 sub-tabs — that many cards would over-fragment a clean 4-step mental model (site-philosophy.md §2). Not treated as a mismatch requiring expansion.

## Science audit update (2026-09, Finding 4)
Page was stamped "Data updated May 2026" and missing Atom Computing's June 2026 $300M+ raise. Added an Atom Computing card to the Investment Landscape grid (switched `.invest-grid` to `auto-fit` so a 5th card wraps cleanly) and bumped the footer timestamp to September 2026. See docs/science-audit-2026-09.md.

## Link audit update (2026-09)
Three company links pointed at pre-rebrand domains that still redirect but are stale: D-Wave (`dwavesys.com` → `www.dwavequantum.com`), IQM (`meetiqm.com` → `iqm.tech`), Silicon Quantum Computing (`sqc.com.au` → `sqc.com`). Updated all three to their current canonical domains. See docs/link-audit-2026-09.md.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; added `scope="col"` to 7 table column headers. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Science-content refresh (2026-09-15)
Follow-up freshness pass (rotating back through the science-content audit per the maintenance-mode instructions). Verified via arXiv/Nature and independently cross-checked before editing: Quantinuum's Helios system (98 fully-connected trapped-ion qubits, launched Nov 2025) succeeded the H2/H2-1 numbers this page previously used as its trapped-ion reference throughout — peer-reviewed with Sandia in *Nature* June 2026 at 99.9975% 1Q / 99.921% 2Q fidelity, plus 48 fully error-corrected logical qubits. Added Helios data alongside (not replacing) the existing H2 mentions across the flash-card grid, both bar charts, the qubit-race canvas, the platform-snapshot table, the DiVincenzo status paragraph, the Companies deep-dive, the investment grid, the trapped-ion timeline, and both references lists — following the same "add new, keep old for context, cite precisely" convention as the original Finding 1 (Rb87 preprint) update. Also added a new flash-card for QuEra's June 2026 "Gigaquop-class" fault-tolerance roadmap (Libra ~2028 megaquop system → gigaquop system with 1,000+ logical qubits at 10⁻⁹ error rate) and updated the PsiQuantum card with its September 2026 $100M CHIPS Act R&D award (verified against NIST's own announcement — a distinct program from Atom Computing's earlier DoC letter of intent, not a duplicate). Also updated `llms-full.txt`'s hardware-platform table (Quantinuum H2 → Helios). No narrative was inverted (trapped ions were already framed as fidelity leaders and remain so); this was purely additive/updating, same treatment as prior science-audit findings.

## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Quantum Computing Landscape" -- stale from whenever this page was renamed to "Quantum Industry Map" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its BreadcrumbList JSON-LD leaf name used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`.

Also fixed: (1) the Fault-Tolerance Roadmap timeline's 2025 Neutral Atoms entry said "6,100 coherent Rb qubits," contradicting both this page's own later, correct statement ("6,100 highly coherent ¹³³Cs atoms") and the site-wide guarded fact that the 6,100-atom/12.6s record is Cs-133, not Rb-87 (enforced by tests/formula_regression.py on rb87-vs-yb171.html) — corrected to Cs. (2) The hero paragraph said "Updated to May 2026" while the footer already said "Data updated September 2026" (from the 2026-09-15 science pass) — the hero timestamp was never bumped to match. Updated hero to September 2026. See docs/flow-audit-2026-09-19.md.

## Science-content refresh (2026-09-26)
Rotation re-check (science-content audit last rechecked 2026-09-15; this was the most-overdue item in the rotation). Fixed two internal inconsistencies that had crept in since the 2026-09-15 pass: (1) the Companies deep-dive's Quantinuum profile card still said Helios uses "98 trapped ¹⁷¹Yb⁺ ions" — wrong; Helios uses ¹³⁷Ba⁺ qubits with ¹⁷¹Yb⁺ only as a sympathetic-cooling species (this page's own "qubit race" canvas already had the correct species from the 2026-09-22 `quantinuum-vs-ionq.html` work, but the prose Companies card was never updated to match) — corrected to ¹³⁷Ba⁺. (2) The IonQ Companies profile card and the platform-snapshot table's trapped-ion qubit-count range ("56–98") were stale — they didn't mention IonQ's Superion 256 (256-qubit EQC system, launched Sep 2026), even though the qubit-race canvas already had it. Added a Superion 256 sentence to the IonQ card and widened the table range to 56–256.

Also added, purely additive, verified against primary/near-primary sources: two 2026 Quantinuum logical-qubit preprints not previously on the site — "Skinny Logic" iceberg codes (Feb 2026, arXiv:2602.22211: up to 94 error-detected / 48 error-corrected logical qubits on Helios) and the "Helix" compact code (Sep 2026, arXiv:2609.03194: 10 physical ions per logical qubit at distance 6, logical error rates below the physical baseline) — added to the Helios flash-card and the Status(2025–2026) summary paragraph, tagged preprint/not-yet-peer-reviewed. Microsoft's Majorana flash-card got a sentence on the Sep 2026 Majorana 2 chip (Al→Pb material stack) plus DARPA on-site testing access and the new Maryland Quantum Research Center. Pasqal's card got its Sep 17 2026 Nasdaq listing (PSQL). The Investment Landscape grid got a new card for Anderon (IBM's standalone quantum-foundry subsidiary), which finalized a $1B CHIPS Act award matched by $1B IBM investment (Sep 2026) for a 300mm quantum wafer foundry in Albany, NY. See docs/science-audit-2026-09-26.md.

## Company globe (2026-09-28)
New section **"Where the Hardware Is Built"** (`#company-globe`), placed directly before Platform Deep Dives, which now has `id="platform-deep-dives"`. The route panel is conceptual (see above), so no route card changes.

**What it shows.** A rotatable globe (`js/globe3d.js?v=1` + `js/orbit3d.js?v=2`) with exactly the 27 companies and labs that have a card in the six deep-dive tabs' "Companies" lists, coloured by platform (the chart palette plus `#14b8a6` for Defects & Topo).

**Mapping is 1:1 and was verified programmatically.** Every globe entry resolves to a `.plat-card` `h4` in its tab, and no deep-dive company card is left unmapped.

**Interaction.**
- Clicking a marker switches to that platform's tab, scrolls to the company card and flashes it (`.plat-card.is-highlighted`).
- Nearby sites cluster within 1°, for example "3 here · Berkeley / Palo Alto" or "3 here · Paris / Palaiseau / Massy". Clicking a cluster lists its companies.
- Platform chips filter the globe and re-centre it.

**Locations.** City-level headquarters or main hardware site, checked September 2026. The caption says this.
- D-Wave is placed at Burnaby, BC (hardware centre). Its HQ is moving from Palo Alto to Boca Raton, FL (announced 2026-01-27).
- Infleqtion is placed at Louisville, CO (new global HQ, opened August 2026).
- Atom Computing is placed at Berkeley (HQ). Its operations centre is in Boulder.
- Pasqal is placed at Palaiseau (global HQ). Quandela is placed at Massy (factory). Quantum Brilliance is placed at Sydney; it also has sites in Stuttgart and Freiburg.
- Oxford Ionics is placed at Oxford. It has been part of IonQ since September 2025.
- Sources are listed in docs/3d-visualization-audit-2026-09-28.md.

**Sync rule.** When a company card is added to or removed from a deep-dive tab, update the `SITES` array in the inline script at the bottom of the page. Also check that the card's `h4` still starts with the entry's `card` string.

**Content note, not changed.** The deep-dive Oxford Ionics card doesn't mention the IonQ acquisition; only the globe tooltip does. Worth folding in at the next science pass.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- **Dollar amounts were being typeset as maths.** KaTeX auto-render pairs any two `$` in one text node, so "$1B raise, … $7B" became italic maths with the words run together (and on this page the result could not wrap, so the page was wider than the screen even on desktop). Every amount is now wrapped in `<span class="money">`, and main.js's auto-render call ignores `.money` and `.no-math`. The Tug-of-war and Race-replay widgets built by `js/versus.js` (v=2) carry `no-math`, since they copy the page's text (including prices) before KaTeX runs. Keep writing prices as `<span class="money">$1.5B</span>` on these pages.

## 2026-09-28 (overnight): Oxford Ionics is part of IonQ
- The Trapped Ions tab's Oxford Ionics card still read like an independent startup ("£30M Series A (2023)", "single-qubit fidelity >99.9% in ⁴⁰Ca⁺"). It now opens with **part of IonQ since 17 September 2025** and cites sources for every figure:
  - completion date: [IonQ press release](https://www.ionq.com/news/ionq-completes-acquisition-of-oxford-ionics-rapidly-accelerating-its-quantum);
  - 99.97% 2Q / 99.9992% 1Q gate fidelity: [Oxford Ionics announcement, 11 July 2024](https://www.oxionics.com/announcements/oxford-ionics-breaks-global-quantum-performance-records/), tagged `company`;
  - >99.99% 2Q fidelity without ground-state cooling (error 8.4(7)×10⁻⁵ at Doppler temperature): [arXiv:2510.17286](https://arxiv.org/abs/2510.17286), tagged `preprint`.
- The Series A and ⁴⁰Ca⁺ claims were dropped: no source was found this run.
- The career-fit list now says "Quantinuum / IonQ (incl. Oxford Ionics)". The globe tooltip already said "part of IonQ since 2025"; quantinuum-vs-ionq.html already covered the acquisition, so it was not changed.

## 2026-09-28 (overnight run 3): stale-number sweep
- Hero pill "25+ Companies" → "27 Companies & Labs": the Platform Deep Dives have 27 company/lab cards (one ↗ link each: 6 superconducting, 5 trapped-ion, 4 neutral-atom, 4 silicon, 4 photonic, 4 defects/topological), which is also what the globe counts ("27 companies & labs"). "6 Platforms" matches the six deep-dive tabs. Guarded by `test_hand_typed_counts_match_content`.

## 2026-09-29: qubit-race canvas readable in both themes; RSA-2048 estimates updated
- **Qubit race canvas.**
  - **Bug:** the canvas filled cream (`#f2ead9`) in both themes and drew its axis labels (`#faf5e9`) and value labels (`rgba(250,245,233,.85)`) in cream too, so the numbers were invisible in both themes and the canvas was a cream block in the dark theme.
  - **Fix:** it now picks inks per theme (dark card, slate grid and labels; on cream, deeper shades of the same hues for bars and names). It redraws on a theme toggle and on resize (a resize used to leave it blank), and shows the final frame under reduced motion.
- **RSA-2048 resource estimates.** The page gave only the ~20 million noisy qubits figure (Gidney & Ekerå, Quantum 5, 433 (2021), arXiv:1905.09749). It now also gives the 2025 estimate of under a million noisy qubits in under a week, at 0.1% gate error, 1 μs cycle and 10 μs reaction time (C. Gidney, arXiv:2505.15917, https://arxiv.org/abs/2505.15917, preprint, flagged as such).
  - Updated in the "long-term" card, "The Gap" box (now "roughly 3–4 orders of magnitude"), the surface-code card and the references list.
  - The race's dashed line sat at 10⁶ but its caption said "order 10⁷"; it is now labelled "RSA-2048 est. (2025)" with a caption giving both estimates.
- **Charts** also get the sitewide theme-aware Chart.js inks (main.js v36; see CLAUDE.md).
- **Checked:** Playwright, dark/light at 1280 and dark at 390 px, theme toggle; screenshots reviewed.

## 2026-09-29: hero particle network is time-limited
The hero's decorative particle network drifted forever. It now moves for at most 5 s (WCAG 2.2.2), draws a still frame under prefers-reduced-motion, and redraws on resize.
