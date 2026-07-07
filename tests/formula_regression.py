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
    assert_contains("js/main.js", "function initLabNotebook")
    assert_contains("js/main.js", "function initSourceConfidencePanels")
    assert_contains("js/main.js", "function initAssumptionBadges")
    assert_contains("js/main.js", "function initExpertModeToggles")
    assert_contains("js/main.js", "function initPaperToolBridge")
    assert_contains("js/main.js", "Paper-to-tool bridge")
    assert_contains("css/styles.css", ".lab-notebook-panel")
    assert_contains("home.html", "I am trying to...")
    assert_contains("home.html", 'id="recent-tools"')
    assert_contains("css/styles.css", ".source-tag.peer-reviewed")
    assert_contains("css/styles.css", ".derivation-mode")
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


def main() -> None:
    tests = [
        test_recoil_convention_values,
        test_imaging_fidelity_convention,
        test_beat_note_prefactor,
        test_qc_claims_are_qualified,
        test_release_recapture_is_thermometry_not_frequency_claim,
        test_site_ux_features_present,
        test_rb_yb_panel_fact_boundaries,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"OK {len(tests)} formula/site regression tests passed")


if __name__ == "__main__":
    main()
