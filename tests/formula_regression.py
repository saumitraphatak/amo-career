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
    assert_contains("pages/absorption-imaging.html", "Na23:  { name:'Na-23',  λ:589.158e-9, Γ:2*Math.PI*9.795e6, σ0:1.657e-13, Isat:62.6")
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
    # Atomic Species Selector: one data-table row per isotope (the periodic-table explorer
    # reads its numbers from these rows, so they are the page's source of truth)
    n_atoms = len(re.findall(r'<tr data-family=', read("pages/atom-library.html")))
    assert n_atoms == 15, n_atoms
    assert_contains("home.html", f'<span class="chip">{n_atoms} atoms</span>')
    assert_contains("pages/atom-library.html", f"The {n_atoms} isotopes in this library")
    assert_contains("pages/atom-library.html", f"All {n_atoms} isotopes at a glance")
    assert_contains("pages/start-here.html", f"Spectroscopic constants for {n_atoms} species")


def test_zernike_psf_centred_and_piston_free() -> None:
    """Zernike lab: the PSF crop must centre the zero-frequency bin (it used to centre the
    Nyquist bin, so the PSF and SLM far-field panels showed aliasing noise), and the RMS
    wavefront error behind the Maréchal Strehl must be taken about the mean (piston-free;
    Mahajan, JOSA 73, 860 (1983): the Strehl depends on the aberration variance)."""
    page = "pages/zernike.html"
    assert_contains(page, "const idx_s=si*Nfft+sj;")
    assert_not_contains(page, "((si+c0)%Nfft)")
    assert_contains(page, "const rms = Math.sqrt(Math.max(0, st.rms*st.rms - wmean*wmean));")
    # the crop mapping in pure Python: output pixel (hw, hw) must read raw DFT bin (0, 0)
    Nin, Nfft = 128, 512
    hw = Nin >> 1
    si = (hw - hw + Nfft) % Nfft
    assert si * Nfft + si == 0
    # one output pixel is (Nin-1)/Nfft of lambda/D; the first Airy zero (1.22 lambda/D) is ~5 pixels out
    assert abs(1.22 / ((Nin - 1) / Nfft) - 4.92) < 0.01


def test_physics_audit_2026_11() -> None:
    """Convention slips found in the Nov 2026 audit (prompted by a reader's report that the
    tweezer waist was the Airy FWHM diameter). Each guard pins the corrected form."""
    # Tweezer waist: 1/e² radius of the Gaussian matched to a filled-pupil Airy focus.
    # Same peak intensity (P·π·NA²/λ² vs 2P/πw²) ⇒ w0 = (√2/π)·λ/NA ≈ 0.450 λ/NA,
    # not the Airy FWHM diameter 0.514 λ/NA.
    w_peak = math.sqrt(2) / math.pi
    assert abs(w_peak - 0.450) < 1e-3
    # same central curvature: [2J1(x)/x]² ≈ 1 − x²/4 with x = k·NA·r, Gaussian ≈ 1 − 2r²/w²
    w_curv = 2 * math.sqrt(2) / (2 * math.pi)
    assert abs(w_curv - w_peak) < 1e-12
    tw = "pages/tweezer-designer.html"
    assert_contains(tw, "const W0_PER_LAMBDA_NA = Math.SQRT2 / Math.PI;")
    assert_not_contains(tw, "0.52 * λm / NA")
    assert_not_contains(tw, "0.52*(λ*1e-9)/NA")
    assert_not_contains(tw, r"w_0 \approx 0.52\lambda")
    assert_contains(tw, "(Γ/(ω0-ω) + Γ/(ω0+ω))")          # counter-rotating term kept
    assert_not_contains("js/tweezer3d.js", "0.52 λ/NA")
    assert_not_contains("llms-full.txt", "0.52λ/NA")
    # scattering rate needs Γ in s⁻¹, not Γ/2π
    assert_contains("pages/imaging-calculator.html", "const Gamma = 2 * Math.PI * Gamma_MHz * 1e6;  // s⁻¹")
    assert_not_contains("pages/imaging-calculator.html", "const G = Gamma_MHz * 1e6;  // Hz")
    # dipole potential U = α I /(2 ε0 c)
    assert_contains("pages/release-recapture.html", "const U0 = alpha * I_peak / (2 * c_l * eps0);")
    # recoil frequency E_rec/h and lifetime τ = 1/Γ
    assert_contains("pages/lab-calculators.html", "hbar * k**2 / (2 * m) / (2 * Math.PI) / 1e3")
    assert_contains("pages/lab-calculators.html", "const tau   = 1.0 / Gam;")
    # Purcell factor and β with C = g0²/(κγ) (half-widths): Fp = C, β = C/(1+C)
    cq = "pages/cavity-qed.html"
    assert_contains(cq, "const FP = C;")
    assert_contains(cq, "const beta = C / (1 + C);")
    assert_not_contains(cq, "2 * C / (1 + 2 * C)")
    assert_contains("llms-full.txt", r"g_0 = \xi\sqrt{\frac{3\pi\Gamma c^3}{2\omega^2 V}}")
    # ¹⁷¹Yb nuclear Zeeman: 2μB/h with μ = 0.4919 μN and μN/h = 762.26 Hz/G ⇒ 0.750 kHz/G;
    # crossover with the Rb clock qubit (2·575.15 Hz/G² · B0) at B0 ≈ 0.65 G
    yb = 2 * 0.4919 * 762.259
    assert abs(yb - 750) < 3
    assert abs(yb / (2 * 575.15) - 0.65) < 0.01
    assert_not_contains("pages/rb87-vs-yb171.html", "2.592")
    assert_contains("pages/rb87-vs-yb171.html", r"B_0 \approx 0.65\;\text{G}")
    # Doppler force F = R(δ − kv) − R(δ + kv): damping for red detuning
    assert_contains("pages/cooling-simulator.html", "const dp = delta - vi;")
    assert_contains("pages/cooling-simulator.html", r"\alpha = 8\hbar k^2")
    # resolved-sideband floor keeps the recoil term α (Phatak et al. Eq. 38)
    assert_not_contains("pages/laser-cooling.html", r"\left(\frac{\Gamma}{4\nu}\right)^2")
    assert_contains("pages/laser-cooling.html", r"\left(\alpha + \frac{1}{4}\right)")
    # RB: A = F(0) − 1/d, so the survival curve never exceeds 1
    assert_contains("pages/rb-explorer.html", "const A1 = A - B1, A2 = A - B2;")
    assert_contains("pages/rb-explorer.html", "const pInt = pRef * Math.max(0, 1 - 2*rGate);")
    # CPMG closed form (Cywiński 2008) equals the explicit switching-function sum
    def explicit(w, N, T):
        times = [0.0] + [(2 * k + 1) * T / (2 * N) for k in range(N)] + [T]
        re = im = 0.0
        for i in range(len(times) - 1):
            s = 1 if i % 2 == 0 else -1
            re += s * (math.sin(w * times[i + 1]) - math.sin(w * times[i])) / w
            im += s * (math.cos(w * times[i]) - math.cos(w * times[i + 1])) / w
        return re * re + im * im
    def closed(w, N, T):
        h = math.sin(w * T / 2) if N % 2 == 0 else math.cos(w * T / 2)
        return 16 * math.sin(w * T / (4 * N)) ** 4 * h * h / (w * w * math.cos(w * T / (2 * N)) ** 2)
    for N in (1, 2, 3, 4, 8):
        for w in (0.37, 1.9, 5.3, 11.1, 23.7):
            a, b = explicit(w, N, 1.3), closed(w, N, 1.3)
            assert abs(a - b) <= 1e-9 * max(1.0, a), (N, w, a, b)
    assert_contains("pages/dd-playground.html", "function filterFuncSqCPMG(omega, N, T)")
    assert_contains("pages/dd-playground.html", "const Nw = Math.max(600, 60 * N);")
    # background-gas lifetime: σ_eff = 3e-14 cm² reproduces τ ≈ 2e-8 Torr·s / P
    kB = 1.380_649e-23
    n = 1e-6 / (kB * 293)                       # 1e-8 mbar = 1e-6 Pa
    tau = 1 / (n * 3e-18 * 470)
    assert abs(tau - 2e-8 / 7.50062e-9) < 0.5, tau
    assert_contains("pages/vacuum-systems.html", "const sigma = 3e-18;")
    # rotated surface code: 2d² − 1 physical qubits
    assert_contains("pages/learn-quantum.html", "label: `d=${d} (${2*d*d-1} qubits)`,")


def test_section_search_index() -> None:
    """Site search lists sections from js/search-sections.js (built by
    tests/browser/build-section-index.js). Every entry must point at an existing page,
    use an address the pages resolve (#s-… by AMOSections, #ch-… by AMOChapters),
    and be unique per page."""
    import json, re
    text = read("js/search-sections.js")
    rows = [json.loads(l.strip().rstrip(",")) for l in text.splitlines() if l.strip().startswith('{"p"')]
    assert len(rows) > 300, len(rows)
    seen = set()
    for r in rows:
        assert (ROOT / "pages" / f"{r['p']}.html").exists(), r
        assert re.fullmatch(r"(s|ch)-[a-z0-9-]+", r["s"]), r
        assert (r["p"], r["s"]) not in seen, r
        seen.add((r["p"], r["s"]))
    assert_contains("js/main.js", "const AMOSections = (() => {")
    assert_contains("js/main.js", "js/search-sections.js?v=")


def test_magic_states_and_distillation() -> None:
    """Magic-state section and entanglement distillation: pin the physics the pages state."""
    import cmath
    r = 1 / math.sqrt(2)
    T = [1 * r, cmath.exp(1j * math.pi / 4) * r]                 # |T> = T|+>
    # SX|T> = e^{i pi/4} |T>
    X = [T[1], T[0]]
    SX = [X[0], 1j * X[1]]
    ph = cmath.exp(1j * math.pi / 4)
    assert all(abs(SX[k] - ph * T[k]) < 1e-12 for k in range(2))
    # T-gate teleportation: data controls CNOT onto |T>, outcome 1 needs S (S T^dagger = T)
    a, b = 0.6, 0.8j
    w = cmath.exp(1j * math.pi / 4)
    out0 = [a, b * w]                       # ancilla measured 0
    out1 = [a * w, b]                       # ancilla measured 1, = w * T^dagger|psi>
    fixed = [out1[0], 1j * out1[1]]         # apply S
    assert all(abs(fixed[k] - w * out0[k]) < 1e-12 for k in range(2))
    # |T> lies outside the stabilizer octahedron |x|+|y|+|z| <= 1
    assert abs(r) + abs(r) > 1
    page = "pages/learn-quantum.html"
    assert_contains(page, 'id="magic"')
    assert_contains(page, "SX|T⟩".replace("SX|T⟩", "S X\\,|T\\rangle = e^{i\\pi/4}\\,|T\\rangle"))
    assert_contains(page, "fidelity ≥ 0.9999(1)")
    assert_contains("js/main.js", "href: 'pages/learn-quantum.html#magic'")
    # BBPSSW recurrence for Werner states (Bennett et al. 1996)
    def rnd(F):
        q = (1 - F) / 3
        d = F * F + 2 * F * q + 5 * q * q
        return (F * F + q * q) / d, d
    F1, p1 = rnd(0.8)
    assert abs(F1 - 0.8382) < 1e-4 and abs(p1 - 0.7689) < 1e-4
    assert abs(rnd(0.5)[0] - 0.5) < 1e-12           # fixed point at F = 1/2
    assert_contains("pages/remote-entanglement.html", 'id="distillation"')
    assert_contains("pages/remote-entanglement.html", "const q = (1 - F) / 3, p = F * F + 2 * F * q + 5 * q * q;")
    assert_contains("pages/google-vs-ibm.html", "Magic state cultivation on a superconducting quantum processor")


def test_explainer_sweep_2026_11() -> None:
    """Explainer figures added 2026-11-14: each must use the physics its text states."""
    # tweezer focus card: same-power Gaussian peak relative to the Airy peak is 2/(π² w²) (w in λ/NA)
    w = math.sqrt(2) / math.pi
    assert abs(2 / (math.pi ** 2 * w * w) - 1) < 1e-12
    assert abs(2 / (math.pi ** 2 * 0.52 ** 2) - 0.749) < 1e-3          # "25% low"
    assert_contains("pages/tweezer-designer.html", "const gauss = (u, w) => (2 / (Math.PI * Math.PI * w * w)) * Math.exp(-2 * u * u / (w * w));")
    # cavity spectrum: t(0) = κ/(κ + g²/γ) = 1/(1 + C)
    k, g, y = 3.0, 9.0, 2.6
    C = g * g / (k * y)
    t0 = k / (k + g * g / y)
    assert abs(t0 - 1 / (1 + C)) < 1e-12
    assert_contains("pages/cavity-qed.html", "const den = y * y + d * d, re = k + g * g * y / den, im = -d + g * g * d / den;")
    # MOT force: slope at the centre equals −κ = −α μ′B′/(ħk)
    hbar = 1.054571817e-34
    G, kk, s_, Delta, beta = 2 * math.pi * 6.065e6, 2 * math.pi / 780e-9, 1.0, -1.5 * 2 * math.pi * 6.065e6, 2.0e9
    D = lambda u: 1 + s_ + 4 * u * u / (G * G)
    F = lambda x: hbar * kk * G / 2 * s_ * (1 / D(Delta - beta * x) - 1 / D(Delta + beta * x))
    h = 1e-9
    slope = (F(h) - F(-h)) / (2 * h)
    alpha = 8 * hbar * kk * kk * s_ * abs(Delta / G) / D(Delta) ** 2
    kappa = alpha * beta / kk          # β = μ′B′/ħ, so κ = α μ′B′/(ħk) = α β / k
    assert abs(slope + kappa) < 1e-6 * kappa
    assert_contains("pages/mot-designer.html", "const f = s * (1 / D(Delta - beta * x) - 1 / D(Delta + beta * x));")
    # polarimetry: retarder Mueller rows match the page's QWP matrix at δ = π/2
    assert_contains("pages/polarimetry.html", "return [ (c * c + s * s * cd) * s1 + c * s * (1 - cd) * s2 - s * sd * s3,")
    assert_contains("pages/polarimetry.html", "s * sd * s1 - c * sd * s2 + cd * s3 ];")
    # absorption OD surface: noise-free sum over ±4σ recovers N
    sig, cell, N = 20e-6, 0.2 * 20e-6, 1e4
    tot = sum(N / (2 * math.pi * sig * sig) * math.exp(-((i * cell) ** 2 + (j * cell) ** 2) / (2 * sig * sig)) * cell * cell
              for i in range(-20, 21) for j in range(-20, 21))
    assert abs(tot / N - 1) < 1e-3
    assert_contains("pages/absorption-imaging.html", "const Nrec = sum * cell * cell / r.σ_Δ, dN = dOD * cell * cell * n / r.σ_Δ;")


def test_explainer_sweep_2026_11b() -> None:
    """Second explainer batch (2026-11-14): PDH phasor, sideband thermometry, conductance, two-atom blockade."""
    # PDH (Black 2001): F = ix/(1-ix); for Ω ≫ κ, Im χ → -2 Im F = -2x/(1+x²), the page's error-signal shape (×2)
    F = lambda x: complex(0, x) / complex(1, -x)
    chi = lambda x, w: F(x) * F(x + w).conjugate() - F(x).conjugate() * F(x - w)
    for x in (-2.0, -0.3, 0.7, 3.0):
        assert abs(chi(x, 400).imag - (-2 * x / (1 + x * x))) < 2e-2
        assert abs(abs(F(x)) ** 2 - x * x / (1 + x * x)) < 1e-12                 # matches the Airy-dip chart
        assert abs(abs(F(x)) - abs(F(-x))) < 1e-12 and abs(F(x).imag + F(-x).imag) < 1e-12   # same power, opposite phase
    assert_contains("pages/laser-locking.html", "const F = x => { const d = 1 + x * x; return [-x * x / d, x / d]; };")
    assert_contains("pages/laser-locking.html", "const Ve = -(d/kap) / (1 + (d/kap)*(d/kap));")
    # sideband thermometry: Σ p_n n / Σ p_n (n+1) = n̄/(n̄+1) for a thermal distribution
    nbar = 0.37
    p = [(nbar / (1 + nbar)) ** n / (1 + nbar) for n in range(400)]
    red = sum(pn * n for n, pn in enumerate(p)); blue = sum(pn * (n + 1) for n, pn in enumerate(p))
    assert abs(red / blue - nbar / (nbar + 1)) < 1e-9 and abs(p[0] - 1 / (nbar + 1)) < 1e-12
    assert_contains("pages/laser-cooling.html", "const sb = (n, eta) => ({ red: eta * eta * n, blue: eta * eta * (n + 1), R: n / (n + 1), P0: 1 / (n + 1) });")
    # conductance: Dushman-style series of aperture 11.6 A and tube 12.1 d³/L (air, L/s, cm), series with the pump
    d, L, S = 3.8, 15.0, 100.0
    Cap, Ct = 11.6 * math.pi * d * d / 4, 12.1 * d ** 3 / L
    C = 1 / (1 / Cap + 1 / Ct); Se = 1 / (1 / S + 1 / C)
    assert abs(C - 33.1) < 0.1 and abs(Se - 24.9) < 0.1
    assert_contains("pages/vacuum-systems.html", "const g = Math.sqrt(28.96 / M), Cap = 11.6 * Math.PI * dcm * dcm / 4 * g;")
    assert_contains("pages/vacuum-systems.html", "const Ct = 12.1 * dcm * dcm * dcm / Lcm * g;")
    # two-atom blockade: U = 0 → independent atoms, P_rr = sin⁴(Ωt/2); U ≫ Ω → |W⟩ at √2 Ω, max P_rr → (Ω/U)²/2
    def evolve(Om, U, t, steps=4000):
        w, u = 2 * math.pi * Om / math.sqrt(2), 2 * math.pi * U
        c = [1 + 0j, 0j, 0j]; dt = t / steps
        Hc = lambda c: [-1j * (w * c[1]), -1j * (w * c[0] + w * c[2]), -1j * (w * c[1] + u * c[2])]
        for _ in range(steps):                         # RK4, independent of the page's eigen-solver
            k1 = Hc(c); k2 = Hc([c[i] + dt / 2 * k1[i] for i in range(3)])
            k3 = Hc([c[i] + dt / 2 * k2[i] for i in range(3)]); k4 = Hc([c[i] + dt * k3[i] for i in range(3)])
            c = [c[i] + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) for i in range(3)]
        return [abs(z) ** 2 for z in c]
    t = 0.37
    assert abs(evolve(1.0, 0.0, t)[2] - math.sin(math.pi * t) ** 4) < 1e-8
    assert abs(evolve(1.0, 200.0, t, 40000)[1] - math.sin(math.sqrt(2) * math.pi * t) ** 2) < 2e-4
    assert_contains("pages/rydberg-calculator.html", "const { E, V } = jacobi3([[0, w, 0], [w, 0, w], [0, w, u]]);")
    assert_contains("pages/rydberg-calculator.html", "if (window.updatePairDyn) updatePairDyn(U_MHz, Omega, r, Rb);")


def test_explainer_sweep_2026_11c() -> None:
    """Third explainer batch (2026-11-14): teleportation, repetition code, thermal vs BEC expansion."""
    import itertools
    # teleportation: X flips (y, z), Z flips (x, y); the four pre-correction states average to the origin
    r = (0.3, -0.5, math.sqrt(1 - 0.34))
    def bob(r, m1, m2):
        x, y, z = r
        if m1: x, y = -x, -y
        if m2: y, z = -y, -z
        return (x, y, z)
    avg = [sum(bob(r, a, b)[j] for a in (0, 1) for b in (0, 1)) / 4 for j in range(3)]
    assert max(abs(v) for v in avg) < 1e-12
    assert_contains("pages/learn-quantum.html", "const bob = (r, m1, m2) => { let [x, y, z] = r; if (m1) { x = -x; y = -y; } if (m2) { y = -y; z = -z; } return [x, y, z]; };")
    # repetition code: minimum-weight decoding fails iff more than half flip; p_L = binomial tail
    for d in (3, 5, 7):
        p = 0.13
        brute = sum(p ** sum(e) * (1 - p) ** (d - sum(e)) for e in itertools.product((0, 1), repeat=d) if 2 * sum(e) > d)
        tail = sum(math.comb(d, k) * p ** k * (1 - p) ** (d - k) for k in range(d // 2 + 1, d + 1))
        assert abs(brute - tail) < 1e-12
        assert abs(sum(math.comb(d, k) * 0.5 ** d for k in range(d // 2 + 1, d + 1)) - 0.5) < 1e-12   # all cross at 50%
    assert_contains("pages/learn-quantum.html", "return 2 * w <= a.length ? a : a.map(v => 1 - v);")
    # TOF: thermal aspect → 1; condensate (Castin–Dum) matches the ε ≪ 1 analytic solution
    eps, wp = 0.05, 1.0
    wz = eps * wp
    s, t, h, T = [1.0, 1.0, 0.0, 0.0], 0.0, 1e-3, 10.0
    f_ = lambda s: [s[2], s[3], wp * wp / (s[0] ** 3 * s[1]), wz * wz / (s[0] ** 2 * s[1] ** 2)]
    while t < T - 1e-12:
        k1 = f_(s); k2 = f_([s[i] + h / 2 * k1[i] for i in range(4)]); k3 = f_([s[i] + h / 2 * k2[i] for i in range(4)]); k4 = f_([s[i] + h * k3[i] for i in range(4)])
        s = [s[i] + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) for i in range(4)]; t += h
    tau = wp * T
    assert abs(s[0] - math.sqrt(1 + tau * tau)) < 2e-2 * s[0]
    assert abs(s[1] - (1 + eps * eps * (tau * math.atan(tau) - math.log(math.sqrt(1 + tau * tau))))) < 2e-3
    assert abs(math.sqrt((1 / wz ** 2 + 1e6) / (1 / wp ** 2 + 1e6)) - 1) < 1e-3
    assert_contains("pages/tof-calculator.html", "const f = s => [s[2], s[3], wp * wp / (s[0] ** 3 * s[1]), wz * wz / (s[0] ** 2 * s[1] ** 2)];")
    assert_contains("pages/tof-calculator.html", "const thermalAspect = (wp, wz, t) => Math.sqrt((1 / (wz * wz) + t * t) / (1 / (wp * wp) + t * t));")


def test_citation_and_contrast_audit_2026_11() -> None:
    """2026-11-14 citation check: DOIs that pointed at a different paper stay fixed; muted text stays readable."""
    import glob
    site = "\n".join(open(p, encoding="utf-8").read() for p in glob.glob(str(ROOT / "pages" / "*.html")))
    wrong = ["PhysRevA.82.030306", "RevModPhys.86.361", "nature08232", "PhysRevLett.93.163602", "BF00799212",
             "PhysRevLett.109.163006", "PhysRevA.99.043421", "PhysRevA.71.052312", "s41586-024-07875-6", "s41567-022-01743-4",
             "nature06147", "science.357.6347", "nature04917", "s41586-022-04702-0", "AO.11.002327", "1.578381", "1.5006809",
             "PhysRevA.70.031401", "978-3-319-14732-8"]
    for w in wrong:
        assert w not in site, w
    for right in ["RevModPhys.82.2313", "nature08470", "BF00702605", "PhysRevX.2.041014", "nature22310", "nature07127",
                  "science.aam9288", "nature06118", "s41586-022-04764-4", "RevModPhys.70.685", "PhysRevLett.59.2631"]:
        assert right in site, right
    # mot-designer's Anderson 1995 card links the Science paper, not Davis et al. (PRL 75, 3969)
    mot = read("pages/mot-designer.html")
    i = mot.index("Anderson et al. (1995)")
    assert "science.269.5221.198" in mot[i - 300:i]
    css = read("css/styles.css")
    assert "--text-muted:     #6b604b;" in css and "--text-muted:     #7a8aa3;" in css
    # second pass (Crossref / arXiv records): links that resolved to unrelated papers stay gone
    for w in ["1.1141263", "arxiv.org/abs/2402.08748", "arxiv.org/abs/2401.08618", "arxiv.org/abs/1605.01818",
              "arxiv.org/abs/2110.14206", "arxiv.org/abs/2107.09341", "arxiv.org/abs/2111.11798", "60 km fiber"]:
        assert w not in site, w
    for right in ["10.1063/1.1142305", "10.1364/OE.25.008670", "10.1364/JOSAB.21.001889", "10.1088/1464-4266/7/10/021",
                  "10.1038/s41567-021-01409-7", "10.1103/RevModPhys.95.045006", "arxiv.org/abs/2401.09541", "linked by a 60 m fiber"]:
        assert right in site, right


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
        test_zernike_psf_centred_and_piston_free,
        test_physics_audit_2026_11,
        test_section_search_index,
        test_magic_states_and_distillation,
        test_explainer_sweep_2026_11,
        test_explainer_sweep_2026_11b,
        test_explainer_sweep_2026_11c,
        test_citation_and_contrast_audit_2026_11,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"OK {len(tests)} formula/site regression tests passed")


if __name__ == "__main__":
    main()
