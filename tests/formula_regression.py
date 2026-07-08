#!/usr/bin/env python3
"""Formula regression checks for the AMO Toolkit static site.

These tests intentionally avoid browser/Node dependencies so they can run on a
plain Python install. They guard the common physics convention mistakes that are
easy to reintroduce when editing explanatory HTML.
"""
from __future__ import annotations

import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def assert_contains(rel: str, needle: str) -> None:
    text = read(rel)
    assert needle in text, f"{rel} is missing expected text: {needle!r}"


def assert_not_contains(rel: str, needle: str) -> None:
    text = read(rel)
    assert needle not in text, f"{rel} still contains stale text: {needle!r}"


def test_recoil_convention_values() -> None:
    hbar = 1.054_571_817e-34
    kB = 1.380_649e-23
    amu = 1.660_539_066_60e-27

    def recoil_nK(lambda_nm: float, mass_amu: float) -> float:
        k = 2 * math.pi / (lambda_nm * 1e-9)
        return (hbar * hbar * k * k / (2 * mass_amu * amu * kB)) * 1e9

    rb_single = recoil_nK(780.241, 86.909)
    cs_single = recoil_nK(852.347, 132.905)
    li_single = recoil_nK(670.977, 6.015)

    assert abs(rb_single - 181.0) < 2.0
    assert abs(2 * rb_single - 362.0) < 4.0
    assert abs(cs_single - 99.2) < 1.5
    assert abs(li_single / 1000 - 3.54) < 0.08

    assert_contains("pages/lab-calculators.html", "const T_rec = 0.5 * m * v_rec**2 / kB;")
    assert_contains("pages/atom-library.html", "2E_r/k_B = absorption-plus-emission recoil scale")
    assert_not_contains("pages/lab-techniques.html", "recoil temperature 7.1")


def test_imaging_fidelity_convention() -> None:
    assert_contains("pages/imaging-calculator.html", "function detectionFidelityGaussian")
    assert_contains("pages/imaging-calculator.html", "\\Phi({\\rm SNR}/2)")
    assert_not_contains("pages/imaging-calculator.html", "2\\sqrt{2}")
    assert_not_contains("llms-full.txt", "F_det = Φ(SNR/√2)")


def test_beat_note_prefactor() -> None:
    assert_contains("pages/laser-locking.html", "const i_ac_sq = 2 * R * R * P1 * P2")
    assert_contains("pages/laser-locking.html", "P_RF (dBm) = 10 log₁₀[2R²P₁P₂Z₀ / 1 mW]")
    assert_not_contains("pages/laser-locking.html", "½ · R² · P₁ · P₂")


def test_saturation_intensity_constants_are_consistent() -> None:
    assert_contains("pages/imaging-calculator.html", "Li6:   { label: '⁶Li D2',   lambda_nm: 670.977, Gamma_MHz: 5.8724, Isat_mWcm2: 2.56")
    assert_contains("pages/imaging-calculator.html", "Li7:   { label: '⁷Li D2',   lambda_nm: 670.977, Gamma_MHz: 5.8724, Isat_mWcm2: 2.56")
    assert_contains("pages/mot-designer.html", "Li7:   { label:'⁷Li',   mass_u:7.016,   Gamma_MHz:5.8724, lambda_nm:670.977, Isat:2.54")
    assert_contains("pages/absorption-imaging.html", "Na23:  { name:'Na-23',  λ:589.00e-9, Γ:2*Math.PI*9.795e6, σ0:1.657e-13, Isat:62.6")
    assert_not_contains("pages/imaging-calculator.html", "Isat_mWcm2: 7.590")
    assert_not_contains("pages/imaging-calculator.html", "Gamma_MHz: 5.924")
    assert_not_contains("pages/mot-designer.html", "Isat:7.590")
    assert_not_contains("pages/absorption-imaging.html", "Isat:93.9")


def test_qc_claims_are_qualified() -> None:
    assert_contains("pages/qc-landscape.html", "96 Logical Qubits")
    assert_contains("pages/qc-landscape.html", "roadmap claims are not equivalent to demonstrated hardware")
    assert_contains("pages/qc-landscape.html", "treat this as a high-risk frontier rather than a settled platform")
    assert_not_contains("pages/qc-landscape.html", "Microsoft major investment in Quantinuum")


def test_release_recapture_is_thermometry_not_frequency_claim() -> None:
    assert_contains("pages/release-recapture.html", "Release-recapture is action-first thermometry")
    assert_contains("pages/release-recapture.html", "Thermometry, not direct trap-frequency metrology")
    assert_not_contains("pages/release-recapture.html", "recapture probability oscillates with the trap frequency")


def test_site_ux_features_present() -> None:
    assert_contains("js/main.js", "function initGlobalSearch")
    assert_contains("js/main.js", "function initShareableCalculatorParams")
    assert_contains("js/main.js", "function exportCanvasPNG")
    assert_contains("js/main.js", "function exportCanvasSVG")
    assert_contains("js/main.js", "function renderRecentTools")
    assert_contains("js/main.js", "function initPaperToolBridge")
    assert_contains("js/main.js", "Paper-to-tool bridge")
    assert_contains("home.html", "I am trying to...")
    assert_contains("home.html", 'id="recent-tools"')
    assert_contains("css/styles.css", ".source-tag.peer-reviewed")
    assert_contains("pages/imaging-calculator.html", "Common mistake, SNR is not fidelity")
    assert_contains("pages/lab-calculators.html", "Common mistake, recoil factor-of-two")


def test_rb_yb_panel_fact_boundaries() -> None:
    assert_contains("pages/rb87-vs-yb171.html", "The 6100-atom, 12.6 s coherence result is a <strong>Cs-133</strong> benchmark")
    assert_contains("pages/rb87-vs-yb171.html", "575.15 Hz/G²")
    assert_contains("pages/rb87-vs-yb171.html", "99.40(3)% raw and 99.72(3)% with post-selection")
    assert_contains("pages/rb87-vs-yb171.html", "48 logical qubits encoded in 280 physical atoms")
    assert_contains("pages/rb87-vs-yb171.html", "state discrimination fidelity 0.993(4) with state-averaged survival 0.994(3)")
    assert_not_contains("pages/rb87-vs-yb171.html", "6100-qubit Rb87")
    assert_not_contains("pages/rb87-vs-yb171.html", "Rb87 coherence T₂")
    assert_not_contains("pages/rb87-vs-yb171.html", "1288 Hz/G²")
    assert_not_contains("pages/rb87-vs-yb171.html", "roughly 50–70%")


def test_cavity_qed_conventions() -> None:
    assert_contains("pages/cavity-qed.html", "g_0 = \\xi\\sqrt{\\frac{3\\pi\\Gamma c^3}{2\\omega^2 V}}")
    assert_contains("pages/cavity-qed.html", "const g0_rad  = xi * Math.sqrt(3 * _PI * Gam_rad * _c**3 / (2 * omega**2 * V_mode));")
    assert_contains("pages/cavity-qed.html", "F &gt; \\mathrm{FSR}/(2g₀)")
    assert_contains("pages/cavity-qed.html", "\\mathcal{F} > \\frac{\\pi c}{2 L g_0}")
    assert_not_contains("pages/cavity-qed.html", "Math.sqrt(3 * Gam_rad")


def test_currentness_and_wording_guardrails() -> None:
    assert_contains("pages/laser-planner.html", "≈518,295,836,590,864 Hz")
    assert_contains("pages/laser-planner.html", "versus about 7 THz for Rb")
    assert_contains("pages/laser-planner.html", "one of the leading Sr optical lattice clock groups")
    assert_contains("pages/vacuum-systems.html", "Respect the ion-pump bake rating")
    assert_contains("pages/vacuum-systems.html", "Often the dominant peak in a clean, baked stainless-steel UHV system")
    assert_contains("pages/qc-landscape.html", "#AQ 64 Tempo benchmark")
    assert_contains("pages/qc-landscape.html", "Identical qubits: same species, locally tunable shifts")
    assert_contains("pages/qc-landscape.html", "reported quantum volume 33,554,432")
    assert_contains("pages/qc-landscape.html", "a publicly accessible neutral-atom analog QPU")
    assert_contains("pages/qc-landscape.html", "the best published physical two-qubit fidelities are now around the 99.9% level")
    assert_contains("pages/qc-landscape.html", "Major photonic QC bet")
    assert_contains("pages/qc-landscape.html", "distinguish those cloud partnerships from Microsoft’s separate topological-qubit research program")
    assert_contains("pages/laser-cooling.html", "one of the highest-fidelity routes to motional ground-state preparation")
    assert_contains("pages/dd-playground.html", "In the ideal static-offset model, this refocusing is exact")
    assert_contains("pages/dd-playground.html", "In the ideal perfect-pulse limit")
    assert_contains("pages/laser-locking.html", "in the usual low-signal beat-note setup, amplify before the mixer")
    assert_contains("pages/imaging-calculator.html", "In the shot-noise-dominated model")
    assert_contains("pages/atom-library.html", "518,295,836,590,864 Hz")
    assert_contains("pages/remote-entanglement.html", "6,100-atom Cs benchmark")
    assert_contains("pages/remote-entanglement.html", "magnetic sensitivity is suppressed to the nuclear-magneton scale")
    assert_contains("pages/remote-entanglement.html", "Rb fiber link with QFC")
    assert_contains("pages/remote-entanglement.html", "coherent Cs atom array reported in 2025")
    assert_contains("pages/remote-entanglement.html", "the perfect-HOM limit has no coincidence counts")
    assert_contains("pages/remote-entanglement.html", "about 0.18–0.25 dB/km near 1550 nm")
    assert_contains("pages/remote-entanglement.html", "end-to-end efficiency and added noise remain experiment-specific")
    assert_contains("pages/remote-entanglement.html", "Each module can be optimized locally")
    assert_contains("pages/tweezer-designer.html", "key Rb benchmark for neutral-atom gates")
    assert_contains("pages/paper-syllabus.html", "mid-circuit readout, feed-forward, and several logical encodings")
    assert_contains("pages/rb87-vs-yb171.html", "A major published coherent neutral-atom array benchmark is Cs-133")
    assert_not_contains("pages/atom-library.html", "518,295,836,590.863 Hz")
    assert_not_contains("pages/remote-entanglement.html", "A single optical tweezer array can hold ~1,000–3,000 atoms today")
    assert_not_contains("pages/tweezer-designer.html", "current SOTA benchmark")
    assert_not_contains("pages/remote-entanglement.html", "every serious neutral-atom quantum computing company")
    assert_not_contains("pages/remote-entanglement.html", "has no magnetic moment to first order")
    assert_not_contains("pages/remote-entanglement.html", "where loss is 0.3–0.35 dB/km")
    assert_not_contains("pages/remote-entanglement.html", "Each module already works perfectly")
    assert_not_contains("pages/remote-entanglement.html", "Rb fiber-link record")
    assert_not_contains("pages/remote-entanglement.html", "largest coherent neutral-atom array reported")
    assert_not_contains("pages/remote-entanglement.html", "they always bunch")
    assert_not_contains("pages/vacuum-systems.html", "the molecule ion pumps hate")
    assert_not_contains("pages/vacuum-systems.html", "Never bake with an ion pump running")
    assert_not_contains("pages/laser-planner.html", "vs 15 THz for Rb")
    assert_not_contains("pages/laser-planner.html", "world leader in Sr optical lattice clocks")
    assert_not_contains("pages/qc-landscape.html", "atoms are perfect copies")
    assert_not_contains("pages/qc-landscape.html", "only fab-compatible path")
    assert_not_contains("pages/qc-landscape.html", "largest publicly accessible neutral-atom QPU")
    assert_not_contains("pages/qc-landscape.html", "current best physical gate fidelity")
    assert_not_contains("pages/qc-landscape.html", "Strategic investment in Quantinuum")
    assert_not_contains("pages/qc-landscape.html", "State-of-art")
    assert_not_contains("pages/qc-landscape.html", "record quantum volume")
    assert_not_contains("pages/qc-landscape.html", "first metropolitan QKD links")
    assert_not_contains("pages/rb87-vs-yb171.html", "largest coherent neutral-atom array demonstrated")
    assert_not_contains("pages/laser-cooling.html", "highest fidelity ground-state preparation currently available")
    assert_not_contains("pages/dd-playground.html", "This works perfectly as long as")
    assert_not_contains("pages/laser-locking.html", "always amplify before the mixer")
    assert_not_contains("pages/imaging-calculator.html", "bright peak is always wider")


def main() -> None:
    tests = [
        test_recoil_convention_values,
        test_imaging_fidelity_convention,
        test_beat_note_prefactor,
        test_saturation_intensity_constants_are_consistent,
        test_qc_claims_are_qualified,
        test_release_recapture_is_thermometry_not_frequency_claim,
        test_site_ux_features_present,
        test_rb_yb_panel_fact_boundaries,
        test_cavity_qed_conventions,
        test_currentness_and_wording_guardrails,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"OK {len(tests)} formula/site regression tests passed")


if __name__ == "__main__":
    main()
