# pages/atom-processor.html

**Purpose:** Zoned Atom Processor. A quantum circuit compiled onto a schematic zoned neutral-atom processor (storage, entangling, readout), animated step by step over an exact state vector, with a placement optimiser and 1,000 noisy shots. Added 2026-11-19 (NAV `quantum` after remote-entanglement, home card QC 07, eyebrow "Quantum 07", start-here 08).

## Flow
1. **01 The device** (always-dark panel): circuit preset (Bell, GHZ-4, GHZ-8 default, Grover 2q, Bernstein–Vazirani 4+1 with s0–s3 toggles, seeded random 6q with "New random circuit"), placement In order / Optimised; device canvas `#zpCv` with AOD beams, local pulses, global Rydberg wash and blockade circles, readout with one sampled shot; circuit canvas (one column per device step, so extra trips show as extra columns); side cards: narration (`aria-live`), state-vector bars coloured by phase (scaled to the tallest bar) + top-4 list, compilation numbers.
2. **02 The compiler:** In order vs Optimised table (trips, moves, distance, time, estimated fidelity; winners in green) and the AOD-order explanation.
3. **03 Run it 1,000 times:** CZ F₂ (lit 99.5%), F₁, move dephasing, readout error, transport speed (lit 0.55 µm/µs), idle T₂ (log slider). Tiles: overlap (1 − TVD), product fidelity estimate, right-answer rate for Bell/GHZ/Grover/BV, distinct strings. Chart.js ideal vs noisy bars.
4. **04 Why zones** and how to read the state panel. **05 Assumptions** and sources.

## Model
- CX → H·CZ·H (target); cancel adjacent H·H, X·X, Z·Z on one qubit; ASAP layers split into 1q and CZ kinds.
- One storage row, one AOD row, atoms keep left-to-right order, four gate sites. Pairs with overlapping storage intervals need separate trips (greedy interval scheduling by right end, ≤ 4 pairs per trip). Gate sites chosen as the consecutive block with the least horizontal travel.
- Optimiser: all n! placements (n ≤ 8, ~40 ms for GHZ-8), fewest trips then smallest Σ|pair span|. GHZ-8: 7 trips in index order → 3 (e.g. bit-reversed order).
- Noise per shot: Pauli after 1q gates with 3(1−F₁)/2, two-qubit Pauli after CZ with 5(1−F₂)/4, Z per carried atom per move (in and out), idle Z on every qubit with (1 − e^(−t/T₂))/2 per trip and for the readout move, readout bit flips. Estimate = product of per-operation success probabilities, idle term ((1 + e^(−T/T₂))/2)^n.
- Geometry in µm is schematic (storage y = 80, entangling 45, readout 10; slots 10 µm apart; gate sites at 20/40/60/80 µm, pair spots ±2.8 µm). Times = longest move ÷ speed, in and out; gate durations not included.

## Sources checked this session (2026-11-19)
- Bluvstein et al. 2024, arXiv:2312.03982 (DOI 10.1038/s41586-023-06927-3): "segmented into three zones: storage, entangling, and readout"; single global Rydberg laser on twin pairs; up to 280 physical qubits.
- Bluvstein et al. 2022, arXiv:2112.03923 (Nature 604, 451): crossed 2D AOD; 0.55 µm/µs average separation speed over 110 µm. The "rows and columns never cross" wording could not be confirmed verbatim, so the page states the order rule as this model's assumption, with the physical reason.
- Levine et al. 2019, arXiv:1908.06101 (PRL 123, 170503): CZ fidelity ≥ 97.4(3)%.
- Evered 2023 (99.5%) already Crossref-verified elsewhere on the site.

## Implementation notes
- `window.ZAP` exposes `circuit, lower, layers, trips, optimise, compile, runIdeal, probs, qubitInfo, bits, fidOf`; `test_atom_processor_compiler` re-derives the trip counts, Grover/BV outputs and the depolarizing conversions in Python.
- All canvases carry `data-export-ready`; the device canvases opt out of the global 280px cap. Reduced motion hops through step end-frames; `amo:print` shows the final readout.
