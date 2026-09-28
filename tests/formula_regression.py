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


def test_decoherence_lab_t1_t2_relation() -> None:
    # Steck's boxed relation (gamma_c: pure/homogeneous dephasing, not echo-recoverable).
    assert_contains("pages/decoherence-lab.html", r"\gamma_\perp = \frac{\Gamma}{2} + \gamma_c")
    # Fox's equivalent form (T_2' in Fox's notation == T_phi here) -- same equation, different letters.
    assert_contains("pages/decoherence-lab.html", r"\frac{1}{T_2} = \frac{1}{2T_1} + \frac{1}{T_\phi}")
    assert_contains("pages/decoherence-lab.html", "Torrey's exact resonance solution")
    assert_contains("pages/decoherence-lab.html", "Steck")
    assert_contains("pages/decoherence-lab.html", "Fox")
    assert_contains("pages/decoherence-lab.html", "References &amp; Further Reading")

    # Numeric self-consistency: gamma_perp = Gamma/2 + gamma_c must be algebraically
    # identical to 1/T2 = 1/(2*T1) + 1/T_phi under T1=1/Gamma, T2=1/gamma_perp, T_phi=1/gamma_c.
    # Catches a sign/factor slip if either form of the relation is ever edited independently.
    Gamma, gamma_c = 3.7, 1.3  # arbitrary positive test values, consistent units
    gamma_perp = Gamma / 2 + gamma_c
    T1, T2, T_phi = 1 / Gamma, 1 / gamma_perp, 1 / gamma_c
    assert math.isclose(1 / T2, 1 / (2 * T1) + 1 / T_phi, rel_tol=1e-12)


def test_imaging_histogram_presets_match_notes() -> None:
    """Each histogram preset note must quote the SNR the page computes for that preset,
    and the histogram must use a direct upper-tail function (no 1 - (1 - tail) floor)."""
    import re
    text = read("pages/imaging-calculator.html")
    block = text[text.index("const HIST_PRESETS = {"):text.index("// Gaussian PDF")]
    presets = re.findall(
        r"(\w+): \{\s*muBright: ([\d.]+), sigBright: ([\d.]+), muDark: ([\d.]+), sigDark: ([\d.]+),\s*note: '([^']*)'",
        block)
    assert len(presets) == 4, f"expected 4 histogram presets, found {len(presets)}"

    def q(x: float) -> float:
        return 0.5 * math.erfc(x / math.sqrt(2))

    for key, mb, sb, md, sd, note in presets:
        mb, sb, md, sd = map(float, (mb, sb, md, sd))
        snr = (mb - md) / math.hypot(sb, sd)
        quoted = re.search(r"SNR (?:= [^≈]*)?≈ ([\d.]+)", note)
        assert quoted, f"{key} note does not quote the page's SNR"
        val = quoted.group(1)
        decimals = len(val.split(".")[1]) if "." in val else 0
        tol = 0.5 * 10 ** -decimals + 0.01  # the quoted value must round from the computed one
        assert abs(float(val) - snr) <= tol, f"{key}: note says SNR {val}, page computes {snr:.2f}"
        # optimal-threshold fidelity by brute force
        best = min(q((mb - t) / sb) + q((t - md) / sd) for t in [md + i * 0.1 for i in range(int((mb - md) * 10))])
        if key == "Marginal":
            assert "F ≈ 88%" in note and abs((1 - best / 2) - 0.8775) < 0.001
    assert "function normTail" in text
    assert "1 - normCDF((theta - muD) / sigD)" not in text
    assert "Marginal (SNR≈1.6)" in text


def test_mot_viz_matches_calculator_sigma() -> None:
    """The 3D MOT's cloud label must report the calculator's σ = √(k_B T_MOT/κ), not a clamped
    drawing size or the Doppler-limit temperature."""
    assert_contains("pages/mot-designer.html", "const sigma_m = kappa > 0 ? Math.sqrt(kB * T_MOT / kappa) : 0;")
    assert_contains("pages/mot-designer.html", "updateMOTViz(kappa, alpha, T_MOT)")
    assert_contains("pages/mot-designer.html", "√(k_BT_MOT/κ)")
    assert_not_contains("pages/mot-designer.html", "(curSigma*10).toFixed(0)} μm")


def test_cooling_simulator_doppler_temperature() -> None:
    """Live MB animation: T(δ, s) = T_D (1 + s + (2δ/Γ)²)/(4|δ|/Γ), minimum T_D at δ = −Γ/2."""
    assert_contains("pages/cooling-simulator.html", "return T_Doppler_cs * (1 + s + x*x) / (4 * Math.abs(dG) + 1e-6);")
    # the Doppler-tab chart uses the same form in units of T_D
    assert_contains("pages/cooling-simulator.html", "Ts.push((1 + (2*d)**2) / (4*Math.abs(d)));")
    t = lambda dG, s: (1 + s + (2 * dG) ** 2) / (4 * abs(dG))
    assert abs(t(-0.5, 0.0) - 1.0) < 1e-12
    assert min(t(-d / 1000, 0.0) for d in range(50, 3000)) >= 1.0 - 1e-12
    # Cs D2: T_D = hbar*Gamma/(2 kB) with Gamma/2pi = 5.234 MHz is about 125.6 uK
    hbar, kB = 1.054_571_817e-34, 1.380_649e-23
    assert abs(hbar * 2 * math.pi * 5.234e6 / (2 * kB) * 1e6 - 125.6) < 0.1
    # Sisyphus: k_B T ~ U0 ∝ I/|δ| (Cohen-Tannoudji, RMP 70, 707), not U0²/E_r
    assert_not_contains("pages/cooling-simulator.html", r"\frac{U_0^2}{E_r}")
    assert_contains("pages/cooling-simulator.html", r"k_{\rm B}T_{\rm Sisyphus} \sim U_0 \propto \frac{I}{|\delta|}")


def test_imaging_histogram_preview_uses_calculator_counts() -> None:
    """Section-06 preview: atom-present mean includes background, per-shot counts come from
    compute() (not the background-rate label), EMCCD read noise is divided by the gain."""
    page = "pages/imaging-calculator.html"
    assert_contains(page, "window.IMG_LAST = { N_sig, N_bg, N_dark, sigma_read, camType, emGain };")
    assert_contains(page, "const lamB = Math.max(0.1, v.N_sig) + lamD;")
    assert_contains(page, "v.sigma_read / Math.max(1, v.emGain)")
    assert_not_contains(page, "parseFloat(document.getElementById('bgLbl').textContent)")
    assert_not_contains(page, "const eff_sig = _N_sig + _sigRead*_sigRead")


def test_hand_typed_counts_match_content() -> None:
    """Counts typed into cards/pills elsewhere must match the pages they describe."""
    import re
    groups = read("pages/amo-groups.html")
    blk = groups[groups.index("const GROUPS = ["):groups.index("const WATCHLIST_SECTIONS")]
    n_groups = len(re.findall(r"\{ name:'", blk))
    wl = groups[groups.index("const WATCHLIST_SECTIONS"):]
    wl = wl[:wl.index("\n];")]
    n_watch = len(re.findall(r"^\s+'(?:[^'\\]|\\.)+',?$", wl, re.M))   # single-quoted, \' allowed
    assert n_groups == 99 and n_watch == 141, (n_groups, n_watch)
    assert_contains("home.html", f"world map of {n_groups} leading AMO research groups, plus a {n_watch}-entry watchlist")
    assert_contains("home.html", f'<span class="chip">{n_groups} mapped groups</span>')
    assert_contains("pages/start-here.html", f"{n_groups} groups on a world map, plus a {n_watch}-entry watchlist")
    assert_contains("pages/amo-groups.html", f'<strong id="groups-globe-count">{n_groups} groups</strong>')
    # Paper Roadmap: 55 paper cards
    n_papers = read("pages/paper-syllabus.html").count('class="paper-card')
    assert n_papers == 55
    for rel in ("home.html", "pages/start-here.html", "pages/paper-syllabus.html"):
        assert_contains(rel, f"{n_papers} papers")
    # Quantum Industry Map: one ↗ link per company / lab card
    qc = read("pages/qc-landscape.html")
    n_co = qc.count(" ↗</a></h4>")
    assert_contains("pages/qc-landscape.html", f"{n_co} Companies &amp; Labs")
    assert_contains("pages/qc-landscape.html", f"{n_co} companies &amp; labs")
    # platform families = the deep-dive tabs
    n_plat = len(re.findall(r'<div class="tab-panel[^"]*" data-tab="\w+" data-group="platforms"', qc))
    assert n_plat == 6, n_plat
    assert_contains("pages/qc-landscape.html", f'<span class="company-pill">{n_plat} Platforms</span>')
    assert_contains("home.html", f'<span class="chip">{n_plat} platforms</span>')
    # home hero no-JS fallback = NAV.tools length (main.js updates it at runtime)
    nav = read("js/main.js")
    nav = nav[nav.index("const NAV = {"):nav.index("learn:", nav.index("const NAV = {"))]
    n_tools = len(set(re.findall(r"key:\s*'([^']+)'", nav)))
    assert_contains("home.html", f'<span id="stat-tools-count">{n_tools}</span>')
    # Atomic Species Selector: 15 species tiles
    n_atoms = read("pages/atom-library.html").count('class="atom-tile')
    assert_contains("home.html", f'<span class="chip">{n_atoms} atoms</span>')
    assert_contains("pages/start-here.html", f"Spectroscopic constants for {n_atoms} species")


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
        test_decoherence_lab_t1_t2_relation,
        test_imaging_histogram_presets_match_notes,
        test_mot_viz_matches_calculator_sigma,
        test_cooling_simulator_doppler_temperature,
        test_imaging_histogram_preview_uses_calculator_counts,
        test_hand_typed_counts_match_content,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"OK {len(tests)} formula/site regression tests passed")


if __name__ == "__main__":
    main()
