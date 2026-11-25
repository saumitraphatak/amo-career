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
    assert_contains("js/main.js", "Try it in the toolkit:")
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
    assert_contains("pages/cavity-qed.html", "$F > \\mathrm{FSR}/(2g_0)$")
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
    assert_contains("pages/remote-entanglement.html", "Rb atom–atom link over telecom fiber (2022)")
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
    assert n_groups == 98 and n_watch == 141, (n_groups, n_watch)
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
    assert_contains("pages/qc-landscape.html", f'<span data-count="{n_co}">{n_co}</span></div>\n        <div class="stat-label">Companies &amp; labs</div>')
    assert_contains("pages/qc-landscape.html", f'<a class="company-pill" href="#company-globe">{n_co} companies &amp; labs</a>')
    # platform families = the deep-dive tabs
    n_plat = len(re.findall(r'<div class="tab-panel[^"]*" data-tab="\w+" data-group="platforms"', qc))
    assert n_plat == 6, n_plat
    assert_contains("pages/qc-landscape.html", f'<a class="company-pill" href="#snapshot">{n_plat} platforms side by side</a>')
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
    # third pass: publisher links on the industry map and the syllabus "why" texts
    for w in ["nature.com/articles/35106030", "s41586-022-04903-3", "s41586-022-04566-0", "PhysRevApplied.15.034011",
              "Bruzewicz et al.", "863.2 Hz", "two Harvard group leaders", "§V (BEC-BCS crossover)", "during Raman sideband cooling) is still the template"]:
        assert w not in site, w
    for right in ["nature.com/articles/35051009", "s41586-022-05117-x", "s41586-021-04182-y", "PhysRevApplied.13.034075"]:
        assert right in site, right
    groups = read("pages/amo-groups.html")
    for w in ["s41586-021-04328-y", "s41586-018-0621-1", "PhysRevLett.120.265001", "nphys3500", "nphys4168", "(varies)", "formerly Stanford"]:
        assert w not in groups, w
    for w in ["jila.colorado.edu/YeLabs", "jila.colorado.edu/rey", "jila.colorado.edu/regal", "jila.colorado.edu/thompson",
              "net.technion.ac.il/\"", "quantumlah.org", "lkb.upmc.fr", "spe.sysu.edu.cn", "projects.iq.harvard.edu"]:
        assert w not in groups, w
    for right in ["10.1126/science.aar7797", "10.1038/nature16155", "10.1103/PhysRevLett.103.200402", "https://iontrap.duke.edu/",
                  "kni.faculty.chemistry.harvard.edu", "phsites.technion.ac.il/atomlab", "www.cornishlabs.uk", "boseeinsteincondensates"]:
        assert right in groups, right
    for right in ["10.1063/1.1142305", "10.1364/OE.25.008670", "10.1364/JOSAB.21.001889", "10.1088/1464-4266/7/10/021",
                  "10.1038/s41567-021-01409-7", "10.1103/RevModPhys.95.045006", "arxiv.org/abs/2401.09541", "linked by a 60 m fiber"]:
        assert right in site, right


def test_virtual_lab_model() -> None:
    """Virtual Tweezer Lab (2026-11-19): threshold rule, enough-atoms bound, quoted numbers, citations."""
    page = read("pages/virtual-lab.html")
    pois_cdf = lambda n, lam: sum(math.exp(-lam) * lam ** k / math.factorial(k) for k in range(n + 1)) if n >= 0 else 0.0
    def threshold(nb, ng):
        best, err = 1, float("inf")
        for n in range(1, math.ceil(ng + nb + 6 * math.sqrt(ng + nb) + 5) + 1):
            e = (1 - pois_cdf(n - 1, ng)) + pois_cdf(n - 1, ng + nb)
            if e < err - 1e-15:
                best, err = n, e
        return best
    assert threshold(40, 2) == 14
    assert "const err = (1 - poisCdf(n - 1, nbg)) + poisCdf(n - 1, nbg + nb);" in page
    tail = sum(math.comb(144, j) * 0.5 ** 144 for j in range(64, 145))
    assert abs(tail - 0.922) < 1e-3                     # P(Bin(144, 0.5) >= 64), the default "enough atoms" tile
    assert "j * Math.log(p) + (N - j) * Math.log(1 - p)" in page
    # section 04 numbers
    assert abs(2 ** 64 / 1.8e19 - 1) < 0.03 and abs(0.89 ** 64 / 6e-4 - 1) < 0.05
    assert "2^{64} \\approx 1.8\\times10^{19}" in page and "0.89^{64} \\approx 6\\times 10^{-4}" in page
    # Bell readout: good pairs agree, bad pairs agree half the time
    assert "b2 = good ? b1 : (rnd() < 0.5 ? 1 : 0)" in page and "F + (1-F)/2" in page
    # moves from false detections deliver nothing; landing on a missed atom ejects both
    assert "if (!occ[a]) { m.res = occ0[a] ? 'img' : 'ghost';" in page
    assert "if (occ[b]) { occ[b] = 0; m.res = 'coll';" in page
    for doi in ["10.1038/35082512", "10.1103/PhysRevX.9.011057", "10.1126/science.aah3778", "10.1126/science.aah3752",
                "10.1038/s41586-023-06481-y", "10.1103/PRXQuantum.5.030316", "10.1038/s41586-025-09596-6", "10.1038/s41586-025-09641-4"]:
        assert doi in page, doi
    assert "89% in a single 0.63 mK trap" in page and "80% for 100 traps" in page
    assert "300,000 atoms per second" in page and "1225-site" in page
    assert "key: 'virtual-lab'" in read("js/main.js")
    assert 'href="pages/virtual-lab.html"' in read("home.html") and 'TRAP 08' in read("home.html")
    assert 'href="virtual-lab.html"' in read("pages/start-here.html")


def test_atom_processor_compiler() -> None:
    """Zoned Atom Processor (2026-11-19): AOD-order trips, placement optimiser, algorithm outputs, noise conversions."""
    import itertools
    page = read("pages/atom-processor.html")

    def trips(pairs, pos, sites=4):                     # same greedy interval scheduling as the page
        left = sorted(((min(pos[a], pos[b]), max(pos[a], pos[b])) for a, b in pairs), key=lambda t: t[1])
        n = 0
        while left:
            end, take, rest = -1, 0, []
            for lo, hi in left:
                if lo > end and take < sites:
                    take += 1; end = hi
                else:
                    rest.append((lo, hi))
            n += 1; left = rest
        return n
    ghz8 = [[(0, 1)], [(0, 2), (1, 3)], [(0, 4), (1, 5), (2, 6), (3, 7)]]
    ident = list(range(8))
    assert sum(trips(l, ident) for l in ghz8) == 7
    best = min(sum(trips(l, p) for l in ghz8) for p in itertools.permutations(range(8)))
    assert best == 3                                      # one trip per CNOT layer, e.g. bit-reversed order
    bitrev = [int(f"{q:03b}"[::-1], 2) for q in range(8)]
    assert sum(trips(l, bitrev) for l in ghz8) == 3
    assert "while (left.length) {" in page and "if (it.lo > end && take.length < sites)" in page

    # tiny state-vector check: Grover finds |11>, BV reads the secret (q0 first)
    def run(n, ops):
        amp = [0j] * (1 << n); amp[0] = 1
        r = 1 / math.sqrt(2)
        for g, *q in ops:
            if g == "CZ":
                m = (1 << q[0]) | (1 << q[1]); amp = [-a if (i & m) == m else a for i, a in enumerate(amp)]
                continue
            b = 1 << q[0]; new = amp[:]
            for i in range(1 << n):
                if i & b: continue
                a0, a1 = amp[i], amp[i | b]
                if g == "H": new[i], new[i | b] = r * (a0 + a1), r * (a0 - a1)
                elif g == "X": new[i], new[i | b] = a1, a0
            amp = new
        return [abs(a) ** 2 for a in amp]
    gro = run(2, [("H", 0), ("H", 1), ("CZ", 0, 1), ("H", 0), ("H", 1), ("X", 0), ("X", 1), ("CZ", 0, 1), ("X", 0), ("X", 1), ("H", 0), ("H", 1)])
    assert abs(gro[3] - 1) < 1e-12
    secret = [1, 0, 1, 1]
    ops = [("X", 4)] + [("H", i) for i in range(4)] + [("CZ", i, 4) for i in range(4) if secret[i]] + [("H", i) for i in range(4)]
    p = run(5, ops)                                       # lowered BV: H on the ancilla cancels between CNOTs
    data = sum(p[i] for i in range(32) if [(i >> q) & 1 for q in range(4)] == secret)
    assert abs(data - 1) < 1e-12
    # depolarizing conversions: F_avg = 1 - 2p/3 (one qubit), 1 - 4p/5 (two qubits)
    for F in (0.99, 0.995):
        assert abs((1 - 2 * (1.5 * (1 - F)) / 3) - F) < 1e-12 and abs((1 - 4 * (1.25 * (1 - F)) / 5) - F) < 1e-12
    assert "const p1 = 1.5 * (1 - nz.F1), p2 = 1.25 * (1 - nz.F2)" in page
    for doi in ["10.1038/s41586-023-06927-3", "10.1038/s41586-022-04592-6", "10.1038/s41586-023-06481-y", "10.1103/PhysRevLett.123.170503"]:
        assert doi in page, doi
    assert "0.55 µm/µs" in page and "up to 280 physical qubits" in page
    assert "key: 'atom-processor'" in read("js/main.js") and 'QC 07' in read("home.html")


def test_repeater_chain() -> None:
    """Remote Entanglement section 09 (2026-11-19): repeater-chain formulas and sources."""
    page = read("pages/remote-entanglement.html")
    # repeaterless bound -log2(1-eta) -> 1.44 eta at high loss; log1p form keeps tiny eta finite
    for eta in (1e-3, 1e-12):
        exact = -math.log1p(-eta) / math.log(2)
        assert abs(exact / (eta / math.log(2)) - 1) < 1e-3
    assert "const plob = eta => -Math.log1p(-eta) / Math.LN2;" in page
    # Werner swap: w = w1 w2 (perfect BSM) composes F = (3w+1)/4
    F = lambda w: (3 * w + 1) / 4
    w0 = (4 * 0.98 - 1) / 3
    assert abs(F(w0) - 0.98) < 1e-12 and F(w0 * w0) < F(w0)
    assert "const M = { i: A.i, j: B.j, w: wAt(A, t) * wAt(B, t) * P.ws, tr: t };" in page
    # elementary link: station in the middle, two-photon p = eta^2/2, single-photon 2*alpha*eta with F0 = 1 - alpha
    assert "eta = P.etaN * Math.pow(10, -P.alpha * L0 / 20)" in page
    assert "P.scheme === 'two' ? eta * eta / 2 : Math.min(1, 2 * P.a * eta)" in page
    assert "const F0 = P.scheme === 'two' ? P.F0 : 1 - P.a;" in page
    # geometric waiting time: mean of ceil(ln U / ln(1-p)) is 1/p
    p = 0.01
    mean = sum(k * p * (1 - p) ** (k - 1) for k in range(1, 5000))
    assert abs(mean - 1 / p) < 1e-6
    assert "Math.ceil(Math.log(1 - r) / Math.log1p(-p))" in page
    for doi in ["10.1103/PhysRevLett.81.5932", "10.1038/ncomms15043", "10.1038/s41586-018-0200-5", "10.1103/PhysRevA.71.060310"]:
        assert doi in page, doi
    assert '<a href="#repeater">09 Repeater Chain</a>' in page and '<div class="sec-num">10</div>' in page


def test_remote_entanglement_figures() -> None:
    """Remote Entanglement overhaul (2026-11-21): one detection scheme (Hofmann et al. 2012) in every figure,
    linear-optics Bell sorting checked from scratch, honest rates, and the reordered sections."""
    page = read("pages/remote-entanglement.html")
    from itertools import product
    # two photons on a 50:50 beam splitter: a -> (c + d)/sqrt2, b -> (c - d)/sqrt2, polarization kept.
    # Expand each photonic Bell state and read off which detector pairs (port, polarization) can click.
    def out(terms):                                    # terms: {(polA, polB): amp} for a_polA^dag b_polB^dag
        res = {}
        for (pa, pb), amp in terms.items():
            for (pa_port, sa), (pb_port, sb) in product([("c", 1), ("d", 1)], [("c", 1), ("d", -1)]):
                key = tuple(sorted([pa_port + pa, pb_port + pb]))
                res[key] = res.get(key, 0) + amp * sa * sb / 2
        return {k: v for k, v in res.items() if abs(v) > 1e-12}
    r2 = 2 ** -0.5
    psi_m, psi_p = out({("H", "V"): r2, ("V", "H"): -r2}), out({("H", "V"): r2, ("V", "H"): r2})
    phi_p, phi_m = out({("H", "H"): r2, ("V", "V"): r2}), out({("H", "H"): r2, ("V", "V"): -r2})
    assert set(psi_m) == {("cH", "dV"), ("cV", "dH")}          # different ports, orthogonal: H1V2 / V1H2
    assert set(psi_p) == {("cH", "cV"), ("dH", "dV")}          # same port, orthogonal: H1V1 / H2V2
    for phi in (phi_p, phi_m):                                 # same port, same polarization: one detector
        assert all(k[0] == k[1] for k in phi)
    for s in ["clicks = Math.random() < .5 ? ['H1', 'V2'] : ['V1', 'H2']; herald = true; bell = 'Ψ⁻';",
              "clicks = Math.random() < .5 ? ['H1', 'V1'] : ['H2', 'V2']; herald = true; bell = 'Ψ⁺';",
              "{ clicks: ['H1', 'V2'], k: 'Ψ⁻'", "{ clicks: ['H1', 'V1'], k: 'Ψ⁺'", "{ clicks: ['H2', 'H2'], k: 'Φ'",
              "return { clicks: Math.random() < .5 ? ['H1', 'V2'] : ['V1', 'H2'], herald: 'Ψ⁻' };"]:
        assert s in page, s
    # HOM dip of two exponential wavepackets: P = (1 - M e^{-|tau|/tau_c})/2
    assert "y: 0.5 * (1 - M * Math.exp(-Math.abs(t)))" in page
    # zero-point Doppler spread k v_zpf / 2pi for Rb-87 at 780 nm in a 100 kHz trap
    hbar, amu = 1.054571817e-34, 1.66053907e-27
    v = math.sqrt(hbar * 2 * math.pi * 100e3 / (2 * 86.909 * amu))
    assert abs(v / 780e-9 / 1e3 - 19) < 1, v / 780e-9
    assert "about 19 kHz" in page
    # calculator: attempt slider 0..4 spans 100 kHz..10 MHz; attempts wait 2L/v for the herald
    assert "const frep   = 1e5 * Math.pow(10, repLog / 2);" in page and abs(1e5 * 10 ** (4 / 2) - 1e7) < 1
    assert "const tRound = 2 * L_km * 1e3 / 2.04e8, fMax = 1 / tRound, fEff = Math.min(frep, fMax);" in page
    assert "rough rule of thumb, not a published threshold" in page
    # DFG for the Rb link (van Leent et al. 2022): 1/780 - 1/1607 -> 1517 nm
    assert abs(1 / (1 / 780 - 1 / 1607) - 1517) < 2 and "a 1607 nm pump converts 780 nm photons to 1517 nm" in page
    # facts that were wrong or unsupported before
    for bad in ["acquired by Google", "Roadmap explicitly includes inter-module photonic links by 2027", "~10⁷",
                "nuclear spin $I = 1/2$ serves", "pump 1450 nm", "Bell state fidelity 79%", "duty cycle} = p",
                "Cs atoms in a 2D optical lattice", "Hunger (LMU)", "deployed metrop"]:
        assert bad not in page, bad
    for good in ["arxiv.org/abs/2505.15917", "10.1103/PhysRevLett.124.110501", "arxiv.org/abs/2407.00835",
                 "blog.google/innovation-and-ai/technology/research/neutral-atom-quantum-computers/",
                 "$^{171}$Yb ($I = 1/2$) and $^{87}$Sr ($I = 9/2$)", "Chou et al. (Caltech; <em>Nature</em> 438, 828)"]:
        assert good in page, good
    # page order: theory -> hardware -> numbers -> fixes -> scaling -> context
    order = ["why", "protocol", "atom-photon", "bsm", "challenges", "approaches", "calculator", "distillation",
             "repeater", "landscape", "history", "references"]
    pos = [page.index(f'<section class="ent-section" id="{i}">') for i in order]
    assert pos == sorted(pos)
    for n, i in enumerate(order, 1):
        assert f'<a href="#{i}">{n:02d} ' in page, i
        sec = page[page.index(f'<section class="ent-section" id="{i}">'):]
        assert sec.index(f'<div class="sec-num">{n:02d}</div>') < 200, i


def test_build_story_order() -> None:
    """Nav stories (2026-11-21): every nav group is a numbered story (build a lab, run a first experiment,
    build a quantum computer, start a career), in the same order and with the same titles everywhere."""
    import re
    stories = {
        "build": ("BUILD", "Build", [("atom-library", "Select an atomic species"), ("laser-planner", "Pick lasers for that atom"),
                  ("vacuum-systems", "Pump down to ultra-high vacuum"), ("laser-locking", "Lock the lasers to the atom"),
                  ("polarimetry", "Analyze the polarization"), ("mot-designer", "Design a MOT"),
                  ("control-systems", "Control the experiment"),
                  ("tweezer-designer", "Assemble a tweezer array"), ("zernike", "Get rid of aberrations"),
                  ("automation", "Automate the experiment"),
                  ("cavity-qed", "Couple atoms to a cavity"), ("lab-techniques", "Run the lab day to day")]),
        "trapImageCool": ("TRAP", "Trap, Image &(?:amp;)? Cool", [("cooling-simulator", "Cool atoms with laser light"), ("absorption-imaging", "Image the atom cloud"), ("tof-calculator", "Measure the cloud’s temperature"), ("imaging-calculator", "See a single atom"), ("release-recapture", "Measure a single atom’s temperature"), ("laser-cooling", "Cool a single atom to its ground state"), ("virtual-lab", "Run a full experimental cycle"), ("lab-calculators", "Do the everyday lab math")]),
        "quantum": ("QC", "Quantum", [("learn-quantum", "Learn how qubits work"), ("decoherence-lab", "Watch a qubit lose coherence"), ("dd-playground", "Protect qubits with decoupling pulses"), ("rydberg-calculator", "Entangle atoms with Rydberg blockade"), ("fidelity-budget", "Budget the gate errors"), ("rb-explorer", "Benchmark the gates"), ("atom-processor", "Run a circuit on moving atoms"), ("remote-entanglement", "Link processors with photons")]),
        "career": ("CAREER", "Career", [("paper-syllabus", "Read the papers that built the field"), ("amo-groups", "Find a research group"), ("qc-landscape", "Map the quantum industry"), ("rb87-vs-yb171", "Compare neutral-atom qubits"), ("quantinuum-vs-ionq", "Compare trapped-ion companies"), ("google-vs-ibm", "Compare superconducting companies"), ("psiquantum-vs-xanadu", "Compare photonic companies")]),
    }
    js = read("js/main.js")
    names = list(stories)
    for a, b in zip(names, names[1:] + ["learn"]):
        block = js[js.index(f"  {a}: [\n"):js.index(f"  {b}: [\n")]
        got = re.findall(r"key: '([a-z0-9-]+)',\s+step: (\d+),\s+label: '([^']+)'", block)
        assert got == [(k, str(n), l) for n, (k, l) in enumerate(stories[a][2], 1)], (a, got)
    assert "function initStoryTrail()" in js and "initStoryTrail();\n  initCiteThisPage();" in js
    assert "{ name: 'Building a lab',               items: NAV.build }" in js
    home = read("home.html")
    cards = {}
    for blk in home.split('<a class="tool-card')[1:]:
        num = re.search(r'tool-card-num">([A-Z]+) (\d\d)<', blk)
        if num:
            cards.setdefault(num.group(1), []).append((re.search(r'href="pages/([a-z0-9-]+)\.html"', blk).group(1), num.group(2),
                                                     re.search(r'tool-card-name">([^<]+)<', blk).group(1)))
    sh = read("pages/start-here.html")
    for sid, (prefix, cat, steps) in zip(["build", "trap-image-cool", "quantum-computing", "career"], stories.values()):
        want = [(k, f"{n:02d}", l) for n, (k, l) in enumerate(steps, 1)]
        have = cards[prefix]
        assert have == [w for w in want if w[0] in {h[0] for h in have}], (prefix, have)    # home may show a subset, in order
        sec = sh[sh.index(f'id="{sid}"'):sh.index("</section>", sh.index(f'id="{sid}"'))]
        assert re.findall(r'href="([a-z0-9-]+)\.html"><span class="see-also-icon">[^<]*</span><div><span class="sm-num">(\d\d)</span><span class="see-also-name">([^<]+)<', sec) == want, sid
        for n, (k, l) in enumerate(steps, 1):
            page = read(f"pages/{k}.html")
            assert re.search(rf"{cat} {n:02d}( · | &middot; |</span>\s*<span class=\"page-tag\">){re.escape(l)}\s*<", page), (k, l)
    assert len(cards["CAREER"]) == 3 and len(cards["QC"]) == 8 and len(cards["TRAP"]) == 8 and len(cards["BUILD"]) == 12


def test_group_finder_rebuild() -> None:
    """AMO Group Finder (2026-11-21): one finder (areas → filters → list + globe → names → watchlist),
    no unverifiable hiring claims, standard hero, watchlist linked to the directory, a list kept in the browser."""
    page = read("pages/amo-groups.html")
    for bad in ["hire:", "PhD-friendly", "Postdoc-heavy", "International Hiring", "Typically hires international",
                "page-eyebrow", "Highest-Priority Shortlists", "100+</span>", "curation-note"]:
        assert bad not in page, bad
    assert '<div class="page-hero-eyebrow"' in page and "🌍 Career 02 · Find a research group" in page
    for sec in ['id="areas"', 'id="finder"', 'id="shortlists"', 'id="watchlist"']:
        assert sec in page, sec
    order = [page.index(x) for x in ['id="areas"', 'id="finder"', 'id="shortlists"', 'id="watchlist"']]
    assert order == sorted(order)
    # every stored-state access is guarded, and the page works without it
    assert "try { starred = new Set(JSON.parse(localStorage.getItem(STAR_KEY)" in page and "try { localStorage.setItem(STAR_KEY" in page
    # watchlist ↔ directory links use only the first person of "A / B" entries
    assert "words(name.split(' / ')[0])" in page
    # only checked statuses are shown
    assert page.count("status:'") == 1 and "status:'Emeritus professor'" in page
    assert 'role="dialog" aria-modal="true"' in page and "if (e.key === 'Escape') closePanel();" in page


def test_industry_map_rebuild() -> None:
    """Quantum Industry Map (2026-11-21): durable material first, news last; sourced headline numbers;
    no duplicate qubit-count chart; corrected platform facts."""
    import re
    page = read("pages/qc-landscape.html")
    assert page.count("<!--") == page.count("-->")                      # an unclosed comment once hid four sections
    order = ["divincenzo", "analog-digital", "snapshot", "comparison", "company-globe", "platform-deep-dives",
             "nisq", "roadmap", "neutral-roadmap", "flash-points", "investment", "career", "references"]
    pos = [page.index(f'id="{i}"') for i in order]
    assert pos == sorted(pos)
    for n, i in enumerate(order, 1):
        sec = page[page.index(f'id="{i}"'):]
        assert sec.index(f'<span class="sec-n">{n:02d}</span>') < 160, i
    for href in ["#divincenzo", "#snapshot", "#company-globe", "#roadmap", "#flash-points", "#career", "#nisq"]:
        assert f'href="{href}"' in page, href
    # headline numbers carry their source
    for src in ["Manetsch et al., <em>Nature</em> 2025", "Quantinuum Helios, <em>Nature</em> 2026", "Harvard/QuEra, <em>Nature</em> 2026"]:
        assert src in page, src
    # removed: duplicate log-scale race chart, a projected bar, unsourced or wrong claims
    for bad in ["qubitRaceCanvas", "PsiQ (proj)", "Estimated timeline to cryptographically relevant QC: 2035–2040",
                "millisecond-to-hour", "Oxford–Delft–Eindhoven", "T₂* &gt; 10 ms", "Largest neutral-atom funding round ever",
                "Series B (2023)", "Berkeley-based.", "Sr-88 clock-transition", "the most complex fault-tolerant operation on any platform to date",
                "D-Wave's 7,000+", "Qubit count: 32–56", "Updated to <strong", "&gt;<span class=\"money\">$20B</span>"]:
        assert bad not in page, bad
    for good in ["arxiv.org/abs/2411.11822", "arxiv.org/abs/2604.25987", "Listed on the NYSE since Feb 2026",
                 "financing led by Google and SoftBank (Feb 2025)", "Veldhorst et al.", "Abobeih et al.", "Stolk et al.",
                 "type:'logarithmic', min:10, max:10000"]:
        assert good in page, good
    # flash points newest first
    badges = re.findall(r'<div class="flash-badge"[^>]*>([^<]+)</div>', page)
    assert badges[:2] == ["Jun 2026", "Nov 2025"], badges


def test_paper_roadmap_rebuild() -> None:
    """AMO Paper Roadmap (2026-11-21): no duplicate papers, explicit per-paper tracks and tool links,
    stage counts that match the stage intros, and the standard hero."""
    import re
    page = read("pages/paper-syllabus.html")
    main_js = read("js/main.js")
    assert page.count("<!--") == page.count("-->")
    assert page.count("<div") == page.count("</div>")
    cards = re.findall(r'<div class="paper-card" id="paper-(\d\d)" data-tracks="([etnj]+)" data-tools="([^"]+)">', page)
    assert len(cards) == 55 and [int(c[0]) for c in cards] == list(range(1, 56))
    nums = re.findall(r'<div class="paper-num">(\d+)</div>', page)
    assert [int(n) for n in nums] == list(range(1, 56))
    links = re.findall(r'class="paper-doi" href="([^"]+)"', page)
    assert len(links) == 55 and len(set(l.lower() for l in links)) == 55          # #43 and #51 were once the same review
    titles = [re.sub(r"<[^>]+>", "", t).strip().lower() for t in re.findall(r'<div class="paper-title">(.*?)</div>', page)]
    assert len(set(titles)) == 55
    assert "annurev-conmatphys-031119-050605" in page                              # Kjaergaard et al. replaced the duplicate
    # stage sizes match what the intros promise
    sizes = {}
    for key in ("undergrad", "grad1", "gradAdv", "postdoc"):
        a = page.index(f'data-group="stages" data-tab="{key}">')
        b = page.find('<div class="tab-panel', a + 10)
        sizes[key] = page[a:b if b > 0 else len(page)].count('class="paper-card"')
    assert sizes == {"undergrad": 10, "grad1": 18, "gradAdv": 17, "postdoc": 10}, sizes
    assert "These 17 papers" in page and "These 10 papers" in page
    # every tool key resolves to a nav item (or a known learn-quantum anchor)
    keys = set(re.findall(r"key: '([a-z0-9-]+)'", main_js))
    for _, _, tools in cards:
        for t in tools.split(","):
            k, _, anchor = t.partition("#")
            assert k in keys, t
            if anchor:
                assert f'id="{anchor}"' in read(f"pages/{k}.html"), t
    for t in "etnj":                                                                 # every track has a real reading list
        assert sum(t in c[1] for c in cards) >= 10, t
    # stage 3 topics are no longer mislabelled (the QEC topic once held a dipolar review and two simulators)
    qec = page[page.index("Quantum error correction — The long game"):]
    qec = qec[:qec.index("</div>\n\n    </div>") if "</div>\n\n    </div>" in qec else len(qec)]
    assert "Surface Codes" in qec and "Dipolar" not in qec[:3000] and "Spin Liquids" not in qec[:3000]
    assert 'class="page-hero-eyebrow"' in page and 'class="page-eyebrow"' not in page and 'class="grad-text"' in page
    assert 'id="ps-search"' in page and "amo-papers-read" in page and 'data-track="j"' in page
    assert "card.dataset.tools" in main_js and "/ni/" not in main_js[main_js.index("function initPaperToolBridge"):][:2000]
    assert 'class="paper-tag tag-preprint"' in page


def test_career_comparisons_rebuild() -> None:
    """Career comparison pages (2026-11-21): standard hero, an at-a-glance scoreboard built from the comparison
    table, and facts that were wrong (a valuation quoted in A$ as US$, Sr numbers attributed to Yb, IPO terms)."""
    import re
    vs = read("js/versus.js")
    assert "V.glance = function" in vs and "parseEdges(opts.table" in vs
    for page in ("rb87-vs-yb171", "quantinuum-vs-ionq", "google-vs-ibm", "psiquantum-vs-xanadu"):
        html = read(f"pages/{page}.html")
        assert html.count("<!--") == html.count("-->"), page
        assert 'class="page-hero-eyebrow"' in html and "<h1 style=" not in html, page
        h1 = re.search(r"<h1>(.*?)</h1>", html, re.S).group(1)
        assert not re.search(r"\s,", h1), page                                   # the old "IonQ , Trapped-Ion…" comma
        assert 'id="vs-glance-mount"' in html and "AMOVersus.glance(mount" in html and "versus.js?v=3" in html, page
        assert 'class="vs-checked"' in html, page
        ov = html.index('id="overview"')
        assert ov < html.index('id="vs-glance-mount"') < html.index("</section>", ov), page
    rb = read("pages/rb87-vs-yb171.html")
    assert "arXiv:2411.11822" in rb and "24 entangled logical qubits" in rb          # Yb logical qubits exist (preprint)
    assert "&gt;40 s storage/memory claimed" not in rb and "Phoenix 1180" not in rb   # 42 s T2 echo was 87Sr (Barnes 2022)
    assert "Barnes et al." in rb and "10.1038/s41467-022-29977-z" in rb
    assert "48 logical qubits (color code)" not in rb and "Berkeley-based startup" not in rb
    q = read("pages/quantinuum-vs-ionq.html")
    assert "26.5M shares" not in q and "28M shares at" in q
    assert q.index('id="roadmaps"') < q.index('id="business"') < q.index('id="companies"')
    g = read("pages/google-vs-ibm.html")
    assert "114-year-old" not in g and "over five years" in g
    ps = read("pages/psiquantum-vs-xanadu.html")
    assert "May 2026 private round" not in ps and "usd: 10.5" not in ps and "Series E, Sep 2025" in ps
    assert "<span class=\"money\">$10.5B</span> valuation" not in ps


def test_start_here_rebuild() -> None:
    """Start Here (2026-11-21): no hand-typed page count (it said 32 when there were 34), four story cards
    that link to the four numbered lists, guided paths second, numbered section titles."""
    import re
    sh = read("pages/start-here.html")
    assert "same 32 pages" not in sh and 'class="sm-intro"' not in sh
    assert sh.count('class="sh-story"') == 4
    for sid in ("build", "trap-image-cool", "quantum-computing", "career"):
        assert f'href="#{sid}" data-story="{sid}"' in sh, sid
    order = ["stories", "constellation", "paths", "build", "trap-image-cool", "quantum-computing", "career"]
    pos = [sh.index(f'id="{i}"') for i in order]
    assert pos == sorted(pos)
    assert re.findall(r'<span class="accent">(\d\d)</span>', sh) == ["01", "02", "03", "04", "05", "06"]
    assert "sh-stat-pages" in sh and "querySelectorAll('.see-also-card')" in sh
    assert sh.count("<section") == sh.count("</section>") and sh.count("<div") == sh.count("</div>")
    assert "sitemap3d.js?v=3" in sh and "name: 'Build a lab'" in read("js/sitemap3d.js")


def test_styling_pass_2026_11() -> None:
    """Site-wide styling pass (2026-11-21): classes the templates rely on are defined, every page uses the
    standard hero, and the cite panel separates page / original source / thesis."""
    import re, glob, os
    css = read("css/styles.css")
    for cls in (".grad-text", ".read-links", ".read-link", ".concept-box-label", ".section-lead", ".cite-which", ".cite-more"):
        assert re.search(re.escape(cls) + r"\s*[{,]", css), cls
    assert "background-clip: text" in css[css.index(".grad-text {"):][:900]
    assert ".common-mistake strong { color: #6e5600; }" in css and "color: #896e02" not in css
    for f in sorted(glob.glob(os.path.join(ROOT, "pages", "*.html"))):
        html = open(f, encoding="utf-8").read()
        name = os.path.basename(f)
        assert 'class="page-hero-eyebrow"' in html, name
        assert html.count("<div") == html.count("</div>"), name
        local = "".join(re.findall(r"<style[^>]*>(.*?)</style>", html, re.S))
        if name in ("dd-playground.html", "rb-explorer.html"):                      # were boxed, non-standard heroes
            assert not re.search(r"(^|\n)\s*\.page-hero\s*\{", local), name
    js = read("js/main.js")
    cite = js[js.index("function initCiteThisPage"):][:6000]
    assert "please consider citing the relevant page" in cite and "The original source" in cite and "doctoral research" in cite
    assert "Cooling Lithium and Cesium Single Atoms in Optical Tweezers" in js and "10.1103/PhysRevA.110.043116" in js
    for k in re.findall(r"'([a-z0-9-]+)': \['phatak", js):
        assert os.path.exists(os.path.join(ROOT, "pages", k + ".html")), k
    assert "hero.after(panel)" in js                                               # playbook never lands above a hero


def test_control_systems_page() -> None:
    """Experiment Control Systems (Build 07, 2026-11-22): hardware numbers match the cited datasheets,
    the timing/pulse/budget figures are wired, and the page sits at step 7 of the build story."""
    import re
    html = read("pages/control-systems.html")
    assert "🎛️ Build 07 · Control the experiment" in html
    assert re.findall(r'<span class="accent">(\d\d)</span>', html) == [f"{i:02d}" for i in range(1, 12)]
    for fact in ("minimum pulse 3 ns", "1 GS/s, output &lt;1 to &gt;400 MHz, 0.25 Hz", "1 MS/s shared, 75 kHz",
                 "up to 2.55 MS/s per channel", "1.5 MS/s simultaneous", "1.25 GS/s", "2.86 MS/s (one channel) to 1.25 MS/s",
                 "125 million events per second", "τ ≈ 0.65 d/V", "84, 085111", "10.24425/ijet.2022.139859", "arXiv:2309.17233"):
        assert fact in html, fact
    for el in ('id="cs-seq"', 'id="cs-pulse"', 'id="cs-calc"', 'data-code="branch"', 'data-mode="comp"'):
        assert el in html, el
    assert "0.65 * d / vel" in html and "clk / Math.pow(2, ftw)" in html and "span / Math.pow(2, bits)" in html
    assert html.count("<div") == html.count("</div>") and html.count("<section") == html.count("</section>")
    js = read("js/main.js")
    assert "'control-systems': [" in js and "key: 'control-systems',  step: 7" in js


def test_automation_page() -> None:
    """Automating the Experiment (Build 10, 2026-11-22): paper numbers match their sources, the three
    interactive figures are wired with the stated models, and preprints are flagged."""
    import re
    html = read("pages/automation.html")
    assert "🤖 Build 10 · Automate the experiment" in html
    assert re.findall(r'<span class="accent">(\d\d)</span>', html) == [f"{i:02d}" for i in range(1, 13)]
    for fact in ("0.082 ms · 112 nT", "0.57 ms · 16.1 nT", "2.03 ms · 4.5 nT", "4.3 nT rms (0.29 ppm)", "25-fold",
                 "<em>Optica</em> 11, 945 (2024)", "≥40 dB around 2 MHz with up to 50 MHz",
                 "<em>Sci. Rep.</em> 6, 25890 (2016)", "10 times fewer iterations", "<em>Nat. Commun.</em> 9, 4360 (2018)",
                 "970 ± 20 against 535 ± 8", "<em>Mach. Learn.: Sci. Technol.</em> 1, 015007 (2020)", "Four times the BEC atom number",
                 "<em>Phys. Rev. Research</em> 4, 043216 (2022)", "up to 55 control parameters", "2.8 × 10³", "575 ms",
                 "<em>Nat. Commun.</em> 15, 8532 (2024)", "<em>Phys. Rev. Applied</em> 22, 024011 (2024)", "78.5%",
                 "about 10 s", "200 runs", "nearly four days", "99.87%", "10<sup>8</sup> sub-µK atoms", "arXiv:1803.03226"):
        assert fact in html, fact
    for ax in ("2405.02306", "2405.15421", "2401.04893", "2508.05421", "2607.25145", "2407.19642"):   # preprints are flagged
        i = html.index(f'arxiv.org/abs/{ax}" target="_blank" rel="noopener">arXiv:{ax}</a>', html.index('id="references"'))
        assert "preprint" in html[i:i + 160], ax
    for el in ('id="au-servo"', 'id="au-qc"', 'id="au-qcurve"', 'id="au-race"', 'id="au-ladder"', 'data-m="pi"', 'value="pick"'):
        assert el in html, el
    assert "erf(Math.SQRT2 * st.x / st.w)" in html and "1 / (4 * (o.delay + TP))" in html and "CAL = 0.05" in html
    assert html.count("<div") == html.count("</div>") and html.count("<section") == html.count("</section>")
    js = read("js/main.js")
    assert "'automation': [" in js and "key: 'automation',       step: 10" in js


def test_teach_page() -> None:
    """Teach with AMO Toolkit (2026-11-22): 14 weeks, every listed page has a problem set at #ps-<key>,
    main.js's COURSE_WEEK matches the page, counts in the hero are the real counts, and it is linked site-wide."""
    import re
    html = read("pages/teach.html")
    js = read("js/main.js")
    weeks = re.findall(r'<details class="te-set" id="ps-week-(\d\d)">(.*?)</details>', html, re.S)
    assert [w for w, _ in weeks] == [f"{i:02d}" for i in range(1, 15)]
    week_of = {k: int(w) for w, body in weeks for k in re.findall(r'<div class="te-ps" id="ps-([a-z0-9-]+)">', body)}
    block = js[js.index("const COURSE_WEEK = {"):js.index("};", js.index("const COURSE_WEEK = {"))]
    assert dict((k, int(v)) for k, v in re.findall(r"'([a-z0-9-]+)': (\d+)", block)) == week_of
    nav_keys = set(re.findall(r"key: '([a-z0-9-]+)',\s+step: \d+", js))
    story_pages = nav_keys - {"amo-groups", "qc-landscape", "rb87-vs-yb171", "quantinuum-vs-ionq", "google-vs-ibm", "psiquantum-vs-xanadu"}
    assert story_pages == set(week_of), story_pages ^ set(week_of)
    for k in week_of:
        assert f'href="{k}.html"' in html and (ROOT / "pages" / f"{k}.html").exists(), k
    n_prob = html.count('<li><span class="te-tag ')
    assert f"<span><b>{n_prob}</b> problems</span>" in html and f"<span><b>{len(week_of)}</b> interactive pages</span>" in html
    assert re.findall(r'<span class="accent">(\d\d)</span>', html) == ["01", "02", "03", "04", "05", "06"]
    assert "teach.html#ps-${key}" in js and "pages/teach.html\">Teach</a>" in js and "byHref.set('teach:overview'" in js
    assert 'href="pages/teach.html"' in read("home.html") and 'href="teach.html"' in read("pages/start-here.html")
    assert "subject=AMO%20Toolkit%20course%3A%20solutions%20request" in html
    assert html.count("<div") == html.count("</div>") and html.count("<details") == html.count("</details>")


def test_notebooks() -> None:
    """Python notebooks (2026-11-22): every notebook is valid nbformat 4 for a real page, was built with its
    page-check cell passing, is listed in main.js NOTEBOOKS and on the Teach page, and its spec is kept."""
    import json, re
    nb_dir = ROOT / "notebooks"
    keys = sorted(p.stem for p in nb_dir.glob("*.ipynb"))
    assert len(keys) >= 19, keys
    js = read("js/main.js")
    block = js[js.index("const NOTEBOOKS = new Set(["):js.index("]);", js.index("const NOTEBOOKS = new Set(["))]
    assert sorted(re.findall(r"'([a-z0-9-]+)'", block)) == keys
    teach = read("pages/teach.html")
    assert f"<b>{len(keys)}</b> Python notebooks" in teach
    for k in keys:
        nb = json.loads((nb_dir / f"{k}.ipynb").read_text())
        assert nb["nbformat"] == 4 and nb["metadata"]["amo_toolkit"]["page"] == k, k
        assert (ROOT / "pages" / f"{k}.html").exists(), k
        out = "".join("".join(o.get("text", [])) for c in nb["cells"] if c["cell_type"] == "code" for o in c["outputs"])
        assert "All values match the page." in out and "MISMATCH" not in out, k
        assert f"../notebooks/{k}.ipynb" in teach and (nb_dir / "_build" / "specs" / f"{k.replace('-', '_')}.py").exists(), k
    assert "NOTEBOOKS.has(key)" in js and (nb_dir / "README.md").exists() and (nb_dir / "requirements.txt").exists()


def test_book() -> None:
    """Building with Atoms (2026-11-22): the book has a chapter for every story page, its images exist, its
    contents carry PDF page numbers, it never points at the local build server, and the site links to it."""
    import re
    book = ROOT / "book"
    html = (book / "index.html").read_text()
    js = read("js/main.js")
    keys = re.findall(r"key: '([a-z0-9-]+)',\s+step: \d+", js)
    for k in keys:
        assert f'id="ch-{k}"' in html, k
    assert "127.0.0.1" not in html and "localhost" not in html
    for src in set(re.findall(r'src="(img/[^"]+)"', html)):
        assert (book / src).exists(), src
    pgs = re.findall(r'<span class="pg" data-pg="[^"]+">(\d*)</span>', html)
    assert pgs and all(pgs), "contents without page numbers"
    pdf = book / "building-with-atoms.pdf"
    assert pdf.exists() and pdf.stat().st_size > 1_000_000
    assert 'href="book/"' in read("home.html") and 'href="../book/"' in read("pages/start-here.html") and 'pages/teach.html' in html
    assert "${root}book/" in js and "byHref.set('book:overview'" in js
    assert (book / "_build" / "extract.js").exists() and (book / "katex" / "katex.min.css").exists()


def test_service_worker() -> None:
    """sw.js (2026-11-22): precaches the same CSS/JS versions the pages load, never caches the book PDF,
    notebooks or partial responses, and redirects offline navigations to home.html instead of serving it
    under another URL (its relative paths only resolve at the root)."""
    import re
    sw = read("sw.js")
    html = read("home.html")
    for asset in ("css/styles.css", "js/main.js"):
        page_v = re.search(re.escape(asset) + r"\?v=(\d+)", html).group(1)
        assert f"./{asset}?v={page_v}" in sw, (asset, page_v)
    assert "req.headers.has('range')" in sw and "pdf|ipynb" in sw
    assert "res.status === 200" in sw and "res.ok" not in sw
    assert "Response.redirect(new URL('./home.html', self.location)" in sw
    assert "navigator.serviceWorker.register(`${root}sw.js`)" in read("js/main.js")


def test_explorer_pages() -> None:
    """Follow One Atom, the Apparatus Map and the Records Board (2026-11-25): the story's quoted numbers match
    ⁸⁷Rb physics, every apparatus part links to pages that exist, every record names a source and a review status,
    and all three are reachable from home, Start Here, the mobile menu and search."""
    import re
    h, hb, kB, u = 6.62607015e-34, 6.62607015e-34 / (2 * math.pi), 1.380649e-23, 1.66053906660e-27
    m, lam = 86.909180527 * u, 780.241209686e-9
    k = 2 * math.pi / lam
    fa = read("pages/follow-one-atom.html")
    assert abs(math.sqrt(kB * 400 / m) - 196) < 0.5 and "196 m/s" in fa                       # one-axis rms at 400 K
    assert abs(math.sqrt(8 * kB * 400 / (math.pi * m)) - 312) < 0.5 and "312 m/s" in fa         # mean speed out of the oven
    assert abs(h / math.sqrt(2 * math.pi * m * kB * 400) * 1e12 - 9.4) < 0.05 and "9.4 picometres" in fa
    assert abs(hb * k / m * 1e3 - 5.9) < 0.05 and "5.9 mm/s" in fa                              # recoil velocity
    assert abs(math.sqrt(8 * kB * 400 / (math.pi * m)) / (hb * k / m) - 53000) < 500 and "53,000 photons" in fa
    G = 2 * math.pi * 6.0666e6
    assert abs(hb * G / (2 * kB) * 1e6 - 146) < 0.5 and "146 µK" in fa                         # Doppler limit
    w, nbar = 2 * math.pi * 100e3, 0.05
    assert abs(math.sqrt(hb / (2 * m * w)) * 1e9 - 24) < 0.5 and "24 nm" in fa                  # ground-state wavepacket
    assert abs(hb * w / (kB * math.log(1 + 1 / nbar)) * 1e6 - 1.6) < 0.05 and "1.6 µK" in fa
    assert abs(1 / (1 + nbar) - 0.95) < 0.003 and "95%" in fa
    assert abs(math.log10(400 / (hb * w / (kB * math.log(1 + 1 / nbar)))) - 8.4) < 0.05 and "8.4" in fa
    ap = read("pages/apparatus.html")
    links = re.findall(r"links: \[(.*?)\] \}", ap, re.S)
    assert len(links) >= 18
    for target in set(t for seg in links for t in re.findall(r"\['([a-z0-9-]+)', '", seg)):
        assert (ROOT / "pages" / f"{target}.html").exists(), target
    assert ap.count("{ id: '") >= 18
    rec = read("pages/records.html")
    rows = re.findall(r"\{ pf: '(\w+)', st: '(\w+)'.*?src: \[\[(.*?)\]\]", rec)
    assert len(rows) >= 20
    for pf, st, src in rows:
        assert pf in ("atom", "ion", "sc", "spin", "ph") and st in ("peer", "pre", "co") and ("arx(" in src or "doi(" in src or ".html" in src), (pf, st, src)
    assert "Last checked:" in rec
    js, home, sh = read("js/main.js"), read("home.html"), read("pages/start-here.html")
    for key in ("follow-one-atom", "apparatus", "records"):
        assert f'href="pages/{key}.html"' in home and f'href="{key}.html"' in sh, key
        assert f"pages/{key}.html\"><span>" in js and f"'{key}':" in js, key


def test_cavity_photon_race() -> None:
    """Cavity QED section 04 (2026-11-19): exact single-photon branching and the closed-form propagator."""
    page = read("pages/cavity-qed.html")
    def amps(g, k, y, t):                               # same closed form as the page
        s, d = (k + y) / 2, (k - y) / 2
        e, w2 = math.exp(-s * t), g * g - d * d
        if w2 > 1e-12:
            w = math.sqrt(w2); C, S = math.cos(w * t), math.sin(w * t) / w
        elif w2 < -1e-12:
            m = math.sqrt(-w2); C, S = math.cosh(m * t), math.sinh(m * t) / m
        else:
            C, S = 1.0, t
        return e * (C + d * S), e * g * S
    for g, k, y in [(10, 3, 2.6), (1, 30, 2.6), (5, 5, 5), (20, 1, 1), (0.3, 1, 3)]:
        # propagator satisfies the ODE: check by finite difference
        t, h = 0.13, 1e-6
        a0, b0 = amps(g, k, y, t); a1, b1 = amps(g, k, y, t + h)
        assert abs((a1 - a0) / h - (-y * a0 - g * b0)) < 1e-3 * (1 + abs(g * b0))     # c1 = -i b, so -i g c1 = -g b
        # exact branching ratio by direct integration
        n, T = 200000, 40 / (k + y) + 40 / max(g, 1e-9)
        dt = T / n; Pc = Pf = 0.0
        for i in range(n):
            a, b = amps(g, k, y, (i + 0.5) * dt); Pc += 2 * k * b * b * dt; Pf += 2 * y * a * a * dt
        C = g * g / (k * y)
        assert abs(Pc - C / (1 + C) * k / (k + y)) < 2e-3 and abs(Pc + Pf - 1) < 2e-3
    assert "const pCav = (g, k, y) => { const C = g * g / (k * y); return C / (1 + C) * k / (k + y); };" in page
    assert "rc = 2 * k * b * b, rf = 2 * y * a * a" in page
    assert '<span class="accent">07</span> Common Mistakes' in page and 'id="res_beta_exact"' in page


def test_cz_pulse() -> None:
    """Rydberg budget section 03 (2026-11-19): Levine-Pichler parameters give an exact CZ at V -> infinity."""
    page = read("pages/fidelity-budget.html")
    import cmath
    d, t, xi = 0.377376, 4.292654, 3.902396
    def evolve(c, ph, vec, tau):                         # 2x2 H = [[0, c e^{i ph}], [c e^{-i ph}, -d]], exact propagator
        h = [[0, c * cmath.exp(1j * ph)], [c * cmath.exp(-1j * ph), -d]]
        tr2, det = (h[0][0] + h[1][1]) / 2, h[0][0] * h[1][1] - h[0][1] * h[1][0]
        w = cmath.sqrt(tr2 * tr2 - det)                  # eigenvalues tr2 ± w
        cosw, sinw = cmath.cos(w * tau), (cmath.sin(w * tau) / w if abs(w) > 1e-12 else tau)
        ph0 = cmath.exp(-1j * tr2 * tau)
        u = [[ph0 * (cosw - 1j * sinw * (h[0][0] - tr2)), ph0 * (-1j * sinw * h[0][1])],
             [ph0 * (-1j * sinw * h[1][0]), ph0 * (cosw - 1j * sinw * (h[1][1] - tr2))]]
        return [u[0][0] * vec[0] + u[0][1] * vec[1], u[1][0] * vec[0] + u[1][1] * vec[1]]
    a = evolve(0.5, xi, evolve(0.5, 0, [1, 0], t), t)[0]                       # |01>: coupling Omega/2 (Omega = 1)
    b = evolve(math.sqrt(2) / 2, xi, evolve(math.sqrt(2) / 2, 0, [1, 0], t), t)[0]   # |11>: sqrt(2) Omega / 2 to |W>
    assert abs(abs(a) - 1) < 1e-6 and abs(abs(b) - 1) < 1e-6
    dphi = (cmath.phase(b) - 2 * cmath.phase(a) + math.pi) % (2 * math.pi) - math.pi
    assert abs(abs(dphi) - math.pi) < 1e-5                                     # phi11 = 2 phi01 - pi
    assert abs(2 * t / math.pi - 2.732) < 1e-3                                 # paper: 2 tau ~ 2.732 pi / Omega
    assert "const LP = { d: 0.377376, t: 4.292654, xi: 3.902396 };" in page
    assert "return (tr * tr + ti * ti + 1 + 2 * (a01[0] ** 2 + a01[1] ** 2) + a11[0] ** 2 + a11[1] ** 2) / 20; };" in page
    for doi in ["10.1103/PhysRevLett.123.170503", "10.1016/j.physleta.2007.02.069"]:
        assert doi in page, doi
    assert '<span style="color:#b40909">06 </span>Key References' in page


def test_showcase_links_resolve() -> None:
    """Home showcase (2026-11-19): every card's image exists and its #anchor exists on the target page."""
    import re
    home = read("home.html")
    sec = home[home.index('id="showcase"'):home.index('INTENT PATHS + RECENTS')]
    cards = re.findall(r'<a class="showcase-card[^"]*[^>]*href="pages/([a-z0-9-]+\.html)(#[\w-]+)?"[\s\S]*?src="(assets/showcase/[a-z]+\.webp)"', sec)
    assert len(cards) == 9, len(cards)
    for page, anchor, img in cards:
        assert (ROOT / img).exists(), img
        text = read("pages/" + page)
        if anchor:
            assert f'id="{anchor[1:]}"' in text, (page, anchor)
        assert 'class="amo-eyebrow"' in text, page            # the target really has a live figure
    assert 'href="#showcase"' in home
    assert "function initLiveFigures()" in read("js/main.js") and "initLiveFigures();" in read("js/main.js")


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
        test_virtual_lab_model,
        test_atom_processor_compiler,
        test_repeater_chain,
        test_remote_entanglement_figures,
        test_build_story_order,
        test_group_finder_rebuild,
        test_industry_map_rebuild,
        test_paper_roadmap_rebuild,
        test_career_comparisons_rebuild,
        test_start_here_rebuild,
        test_styling_pass_2026_11,
        test_control_systems_page,
        test_automation_page,
        test_teach_page,
        test_notebooks,
        test_book,
        test_service_worker,
        test_explorer_pages,
        test_cavity_photon_race,
        test_cz_pulse,
        test_showcase_links_resolve,
    ]
    for test in tests:
        test()
        print(f"PASS {test.__name__}")
    print(f"OK {len(tests)} formula/site regression tests passed")


if __name__ == "__main__":
    main()
