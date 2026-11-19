# pages/virtual-lab.html

**Purpose:** Virtual Tweezer Lab. One full shot of a neutral-atom tweezer quantum computer, animated on a simulated camera, plus Monte Carlo statistics from the same model. Added 2026-11-19 (NAV `cooling`, home card TRAP 08, eyebrow "Trap, Image & Cool 08", start-here 08).

## Flow
1. **01 One shot.** Six-stage strip (Load, Image, Rearrange, Verify, Entangle, Read out); the camera canvas `#vlCam` (always dark, 720×720, magma colour map, photons placed one at a time so an exposure builds up); a shot log with an `aria-live` narration. Run / Step / New load / speed / "Show hidden truth" (white dots mark the true atoms).
2. **02 Settings.** Array M (6–16), target K (≤ M), load probability (buttons for 0.5 and 0.89), photons per atom, background, imaging survival, loss per move, time per move, vacuum lifetime (log slider), Bell fidelity F. Green "lit" tags are cited values, amber "illustrative" tags are teaching defaults.
3. **03 A thousand shots.** Runs automatically (debounced on every setting change). Tiles: Monte Carlo P(defect-free) ± binomial SE, p^(K²), P(Bin(M², p) ≥ K²), moves, holes, Bell agreement vs F + (1−F)/2. Cause bars (a shot counts under every cause that left a hole). Poisson count histogram with the threshold. Log-scale sweep of P(defect-free) vs K (200 shots per K).
4. **04 The exponential wall** and continuous reloading (Norcia 2024, Chiu 2025, Manetsch 2025).
5. **05 Assumptions** and sources.

## Model (also listed on the page)
- Independent loading, never two atoms. Counts Poisson: N_bg empty, N_bg + N_at occupied. Threshold n minimises P(bg ≥ n) + P(bright < n) (n = 14 for the 40 / 2 defaults).
- Empty target sites, centre outward, each take the nearest unused detected atom outside the block. Path crossings ignored; moves are serial (T = moves × t_move).
- A move from a false-positive or image-lost site delivers nothing. A real atom is lost with ε. Landing on an undetected atom ejects both.
- Vacuum survival exp(−T/τ) for every atom after the moves. Defect-free judged from true occupancy; the verification and readout images are for show.
- Hole causes, in order: background-gas loss (atom was there before the vacuum step), the move's failure, false detection / imaging loss of an atom detected on a target site, otherwise "not enough atoms".
- Bell pairs: neighbouring columns; good with probability F (equal bits), else random bits.

## Sources checked this session (2026-11-19)
- Brown et al. 2019, arXiv:1811.01448 abstract: 89% in a single 0.63 mK trap, 80% for 100 atoms, ⁸⁷Rb D1 Λ-enhanced gray molasses; DOI 10.1103/PhysRevX.9.011057.
- Norcia et al., arXiv:2401.16177 + DOAJ record: PRX Quantum 5, 030316 (2024), 1225-site arrays, 99% per-site occupancy, repetitively filled reservoir.
- Chiu et al., arXiv:2506.20660: Nature 646, 1075–1080 (2025), over 3,000 atoms, more than 2 hours, 300,000 atoms/s reloading. Species not stated on the abstract page, so the page does not name it.
- Schlosser 2001, Barredo 2016, Endres 2016, Evered 2023 (99.5%), Manetsch 2025: DOIs already Crossref-verified on other pages.

## Defaults that are illustrative (not measured numbers)
Photons per atom 40, background 2, imaging survival 99%, loss per move 1%, 1 ms per move, τ = 10 s.

## Implementation notes
- `window.VLAB` exposes `threshold`, `binomTail`, `assign`, `shot`, `params`; `test_virtual_lab_model` pins the threshold rule, the binomial tail, the move rules and the cited numbers.
- Canvases carry `data-export-ready` (no auto export buttons) and `.vl-cam canvas, .vl-chart canvas { max-height: none !important }` opts out of the global 280px cap.
- Reduced motion: Run hops through the six stage end-frames 0.9 s apart. `amo:print` jumps to the final readout frame. Theme changes recolour the charts via a MutationObserver on `data-theme`; the camera stays dark in both themes.
- The page uses `.page-content > .container` so the shared cite/feedback panels land at the end of the content.
