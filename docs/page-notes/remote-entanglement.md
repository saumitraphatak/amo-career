# pages/remote-entanglement.html

**Purpose:** "Remote Entanglement Generation" — photon-mediated entanglement linking atoms in separate quantum processors; argues connectivity, not single-qubit fidelity, is the real scaling bottleneck.

## Flow
1. Page hero.
2. **No route-panel.** Why Remote Entanglement? (motivation) → The Protocol — Step by Step → Atom–Photon Entanglement (mechanism) → Bell State Measurement & Hong-Ou-Mandel Effect (mechanism) → Challenges Specific to Neutral Atoms → Approaches to Photon Collection & Emission → Historical Milestones → Entanglement Rate Calculator (interactive tool) → Where Remote Entanglement Fits in the Computing Landscape → 07 References & Further Reading.

## Review outcome: approved, no changes (autonomous pass)
Interactive calculator comes after all the conceptual/mechanism/historical grounding, consistent with the theory-before-tool principle (`docs/site-philosophy.md` §4). No route-panel to check for card mismatches.

## Cross-page consistency audit update (2026-09)
Hero eyebrow read "Quantum Computing · Deep Dive" — the only Quantum-category page with neither a sequence number nor the shorter "Quantum" category wording every sibling (learn-quantum, rydberg-calculator, fidelity-budget, rb-explorer, dd-playground) uses. Changed to "Quantum 06 · Remote Entanglement Generation", completing the category's 01-06 sequence and matching the page's own `<h1>`/breadcrumb title. See docs/cross-page-consistency-audit-2026-09.md.


## Accessibility audit update (2026-09)
Made all 5 hand-rolled `.approach-head` accordion toggles keyboard-operable (`tabindex`, `role="button"`, `onkeydown`) and gave them a real `aria-expanded` state kept in sync on click/keydown (previously the open/closed state existed only as a CSS class, invisible to assistive tech); added `aria-hidden="true"` to 5 decorative chevron icons; wired `for=`/`id` on 9 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. Added missing global-search keywords — this page previously had none, relying on title-word matching only. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.

## Cross-page consistency re-audit (2026-09-18)
Home page's tools-grid badge for this page said "QC 04", disagreeing with this page's own hero eyebrow ("Quantum 06") — left behind by the original audit's 2026-09-08 renumbering, which updated the eyebrow but not the home-card badge. Fixed the home badge to "QC 06" to match. See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`.

Also fixed: the References & Further Reading section — which comes after this page's own sequentially-numbered sections 01–09 — was itself labeled "07," a leftover from before the page grew to 9 sections. Following the convention used elsewhere on the site (absorption-imaging.html's References is "05" after 4 content sections; decoherence-lab.html's is "08" after 7), renumbered to "10." See docs/flow-audit-2026-09-19.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The HOM visibility slider row no longer overflows at 360 px (`.hom-slider-row input { min-width:0 }`).

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 3 labels rendered differently after the fix, e.g. "RB FIBER LINK WITH QFC" → "Rb FIBER LINK WITH QFC"; "COHERENT CS ATOM ARRAY REPORTED IN 2025" → "COHERENT Cs ATOM ARRAY REPORTED IN 2025". No markup on the page changed apart from the cache version.

## 2026-11-13: physics audit (convention slips)
- Heralded state from a coincidence is Ψ± (anti-correlated), not Φ±. HOM chart now plots the exponential dip the text gives; τ_c = 1/(2πΔν) for a Lorentzian photon.
- Single-photon scheme p ≈ 2εη (ε = 0.05, F ≈ 95%), not η/2; fiber transmission label 10^(−αL/10).
- History fixes: 2007 Moehring et al. (Monroe, Michigan); 2012 Hofmann et al. is Weinfurter (LMU, free-space traps, 20 m) and Ritter et al. is Rempe (cavities, 21 m); 2020 Stephenson et al. is Oxford Sr⁺ ions (182 /s, 94%), not Harvard Rb; Hensen 2015 did not include teleportation or room temperature; HOM is not the 2022 Nobel; Covey is UIUC (formerly Caltech).

## 2026-11-13: link simulator (attempts → heralds)
Section 08 gained "Watch the link run", a Monte Carlo of the calculator's own link (`BKSim`, fed by `updateRate()` through `BKSim.setLink`). Two-photon scheme: both atoms emit, each photon survives with the calculator's total η, a coincidence heralds half the time (p = η²/2). Single-photon scheme: each atom excited with ε = 0.05, exactly one click heralds (p ≈ 2εη). **Slow motion** animates one attempt at a time (lost photons fade with ✗, detectors flash on a herald); **Real time** runs attempts at the lab repetition rate (capped at 2×10⁵ per frame) and shows attempts, lab time, detected photons, heralds, measured rate and p ± √N/N next to the calculator's p (checked: 5.75(5)×10⁻⁴ vs 5.80×10⁻⁴ two-photon; 3.40×10⁻³ vs 3.41×10⁻³ single-photon). Schematic layout; dark counts, jitter, multi-photon emission and HOM visibility are left out, as in the calculator. AMOMotion pause button, AMOInk inks (page now loads canvas-ink.js v2 and motion.js v2).

## 2026-11-14: entanglement distillation (`#distillation`, section 05)
"Fixing noisy pairs" card: bilateral-CNOT recurrence protocol described and drawn (SVG), plus an interactive table of 1–6 rounds of the Bennett et al. (1996) Werner recurrence (F′, P_keep, raw pairs per output = ∏ 2/P_keep), noting the F > 1/2 condition, perfect local gates, and the faster Deutsch et al. (1996) variant. Links to Learn Quantum → Magic States for the QEC-level purification protocols.

## 2026-11-14: citation check + contrast pass
- Citations: Kimble 2008 → nature07127; Wehner 2018 → science.aam9288; Moehring 2007 → nature06118; van Leent 2022 → s41586-022-04764-4 (all four DOIs pointed elsewhere). Light theme: --ent darkened to #0369a1.

## 2026-11-14: citation check 2 + contrast pass 2
- Daiss et al. 2021: the two modules are linked by a 60 m fibre, not 60 km (arXiv:2103.13095 abstract). Azuma et al. → RMP 95, 045006. AEL-memory groups list corrected (Thompson, Covey, Kaufman ⁸⁸Sr/¹⁷¹Yb; Duke Brown group and ⁸⁴Sr removed).


## Quantum repeater chain (2026-11-19)
New section 09 "Quantum Repeater Chain" between the rate calculator and the landscape (landscape is now 10; sticky nav updated).
- **Model:** D split into N segments, middle stations, per-photon η = η_node·10^(−αL₀/20); two-photon p = η²/2, single-photon p ≈ 2αη with F₀ = 1 − α; attempt time L₀/c_f + t_local (c_f = c/1.47). Werner pairs, storage w·e^(−2t/T_mem) (two memories), swap w₁w₂·w_swap as soon as possible, fidelity cutoff discards. Event-driven with geometric waiting times, so tiny p costs nothing. Check: N = 1 with no decoherence gives rate p/t_A (MC 0.098/s vs 0.0999/s exact for 4,000 deliveries).
- **Animation:** chain canvas with attempt dashes, herald rings, swap flashes, fidelity-coloured arcs that fade as memories decohere, discards in red, delivered A–B pairs in gold; time warp set so a delivered pair takes about 4 s on screen. Pause button from motion.js (reduced motion starts paused).
- **Charts:** rate and mean delivered fidelity vs distance (10–1000 km) for 1, 2, 4, 8, 16 segments (up to 150 delivered pairs per point) plus the repeaterless bound −log₂(1−η), η = η_node·10^(−αD/10), at one use per t_local. With the defaults the 8-segment chain beats the bound beyond ~200 km; 16 segments without distillation fall below the 0.5 cutoff unless link and swap fidelities are high.
- **Checked this session:** Crossref records for Briegel 1998, Pirandola 2017, Humphreys 2018, Barrett & Kok 2005; Pirandola Eq. (19)–(20) (−log₂(1−η), ≈1.44η); Barrett & Kok "p = 1/2" ideal and "quadratic dependence on η"; Humphreys state ρ = (1−α)|ψ⟩⟨ψ| + α|↑↑⟩⟨↑↑|. The 2αη success probability is the standard small-η count of one click from either node (consistent with the rate calculator above), not a quote.
- **Contrast fixes on the page:** light-theme "What the animation means" label (was the dark-theme green, 1.4:1) and the pressed Slow motion / Real time button in the dark theme.


## 2026-11-21: every figure rebuilt around one scheme, facts re-checked, sections reordered
Request: "the figures and animations can be much better … make sure everything makes perfect sense … renders well", then "make sure the flow of the page is good from top to bottom".
- **One detection scheme everywhere** (Hofmann et al., Science 337, 72, 2012): each ⁸⁷Rb atom goes F′=0 → m_F = ∓1 with σ± (Volz 2006); 50:50 fiber BS, a PBS in each output, detectors H₁ V₁ H₂ V₂; H₁V₂/V₁H₂ → Ψ⁻, H₁V₁/H₂V₂ → Ψ⁺, Φ± put both photons in one detector. The old stepper mixed Barrett–Kok wording (π/2 superposition, D1 and D2) with this and contradicted the formula box.
- **Hero:** canvas animation of the link (illustrative 25% loss per photon), static frame H₁+V₂ → Ψ⁻. Phones: 1.4× labels, no footer.
- **Module diagram:** SVG with photons meeting at a ◆ BSM and a green link arc; caption carries the text (the in-SVG caption was clipped).
- **Protocol stepper (02):** 5 steps on a canvas: level diagrams, station, state line. Phones get a 480 × 640 stacked layout (levels on top) with wrapped state lines.
- **Atom–photon (03):** level-diagram SVG; text fixed ("ground state decays" was wrong); ground-state cooling box uses the computed 19 kHz zero-point Doppler spread.
- **HOM (04):** wavepacket canvas + dip chart with a delay slider; P(τ) = ½[1 − M e^{−|τ|/τ_c}], F ≤ ½(1 + M e^{−|τ|/τ_c}).
- **Link simulator (07):** redrawn with the four detectors (two-photon) or D₁/D₂ (single-photon); herald text names the Bell state; 480-wide layout on phones.
- **Rate calculator fixes:** the attempt-rate slider computed 10^(x) instead of 10^(x/2) (default showed 10 MHz with a "1 MHz" label); attempts are now capped by the herald round trip 2L/v; fiber length is per arm; telecom options say conversion loss is not included; default fiber 10 m (module-scale link); verdict labelled a rough rule of thumb.
- **Facts:** removed "Atom Computing (acquired by Google)" and QuEra's dated roadmap claim; Google's March 2026 neutral-atom effort (Kaufman, Boulder) cited to Google's blog and JILA; Oxford ion benchmark (Stephenson 2020: 182 /s, 94%) and Main et al. (arXiv:2407.00835). "~10⁷ qubits (Shor)" → <10⁶ noisy qubits for RSA-2048 (Gidney 2025, preprint). ⁸⁷Sr has I = 9/2. DFG pump 1607 nm (not 1450). Thompson-group cavity line replaced with Tiecke et al. 2014 (Lukin/Vuletić). FFP groups fixed (Reichel). First remote-ensemble entanglement is Chou et al. 2005 (Kimble), not Kuzmich 2004. van Leent 2022: buildings 400 m apart, two legs totalling 33 km with extra fiber on spools (checked in arXiv:2111.15526), not "deployed metropolitan". Dropped the unsourced Daiss 79% figure. "Duty cycle = p·f·τ" replaced by ⟨t⟩ = 1/(p f). Landscape cards 2 and 3 labelled illustrative.
- **Order:** 01 Why · 02 Protocol · 03 Atom–photon · 04 BSM & HOM · 05 Challenges · 06 Approaches · 07 Rate calculator (+ link sim, FTQC box) · 08 Distillation (now its own section, anchor `#distillation` kept) · 09 Repeater (unchanged anchor and number, so the home showcase "§09" still holds) · 10 Landscape · 11 History · 12 References (now an `.ent-section` with styled `.read-link` cards; they had no CSS on this page and ran together as one paragraph).
- Tests: new `test_remote_entanglement_figures` (linear-optics Bell sorting derived from scratch, HOM, 19 kHz, calculator, removed claims, section order).
- 2026-11-27: page scripts moved to `js/pages/remote-entanglement.js`, `-repeater.js` and `-hero.js` (HTML 195 KB → 122 KB). Behaviour checked identical with the control sweep.
