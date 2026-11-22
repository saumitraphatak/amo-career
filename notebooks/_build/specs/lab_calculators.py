from _check import CHECK
PAGE = "lab-calculators"
TITLE = "Quick Lab Console"
CELLS = [
("md", """Everyday lab arithmetic, as small functions you can import into your own analysis. Each block follows one calculator on the page and is run here with the page's default inputs."""),
("code", """import numpy as np
from math import factorial
from scipy.special import jv
h, hbar, c, kB, amu, muB = 6.62607015e-34, 1.054571817e-34, 299792458, 1.380649e-23, 1.66053906660e-27, 9.2740100783e-24"""),
("md", """## Fibre collimation and refocusing
A fibre of mode-field radius w<sub>f</sub> collimated by f₁ gives $w = f_1\\lambda/\\pi w_f$; a lens f₂ then focuses it to $w_0 = f_2\\lambda/\\pi w$."""),
("code", """def fibre(lam_nm=852, mfd_um=5.3, f1_mm=11, f2_mm=200):
    lam, wf = lam_nm * 1e-9, mfd_um * 1e-6 / 2
    w = f1_mm * 1e-3 * lam / (np.pi * wf); w0 = f2_mm * 1e-3 * lam / (np.pi * w)
    return dict(w_col_mm=w * 1e3, w_focus_um=w0 * 1e6, zR_mm=np.pi * w0**2 / lam * 1e3)
fib = fibre(); print(fib)"""),
("md", """## Telescope, AOM geometry, cavity
Telescope magnification f₂/f₁. AOM: acoustic wavelength Λ = v/f, Bragg angle λ/2Λ, first-order deflection λf/v. Cavity: FSR = c/2nL, finesse π√R/(1−R), linewidth FSR/F."""),
("code", """tel = dict(M=200 / 25, w_out_mm=200 / 25 * 0.5)
lam, f, v = 852e-9, 80e6, 613
aom = dict(Lambda_um=v / f * 1e6, bragg_mrad=lam / (2 * v / f) * 1e3, deflect_mrad=lam * f / v * 1e3)
L, R = 0.1, 0.9999
cav = dict(FSR_GHz=c / (2 * L) / 1e9, finesse=np.pi * np.sqrt(R) / (1 - R), linewidth_kHz=c / (2 * L) / (np.pi * np.sqrt(R) / (1 - R)) / 1e3, round_trip_ns=2 * L / c * 1e9)
print(tel); print(aom); print(cav)"""),
("md", """## Zeeman shift, trap frequencies, Lamb–Dicke parameter
Linear Zeeman shift $g_F m_F \\mu_B B/h$ (μ<sub>B</sub>/h ≈ 1.4 MHz/G). Gaussian trap of depth U₀ and waist w₀: $\\omega_r = \\sqrt{4U_0/mw_0^2}$, $\\omega_z = \\sqrt{2U_0/mz_R^2}$. Lamb–Dicke parameter along a beam at angle θ to the motion: $\\eta = k\\sqrt{\\hbar/2m\\omega}\\cos\\theta$."""),
("code", """zee = dict(shift_MHz=0.25 * 4 * muB * 10e-4 / h / 1e6, per_G_MHz=0.25 * 4 * muB * 1e-4 / h / 1e6)
U0, w0, m, lam_t = 0.5e-3 * kB, 0.95e-6, 133 * amu, 1064e-9
zR = np.pi * w0**2 / lam_t
trapf = dict(f_r_kHz=np.sqrt(4 * U0 / (m * w0**2)) / (2 * np.pi * 1e3), f_z_kHz=np.sqrt(2 * U0 / (m * zR**2)) / (2 * np.pi * 1e3), zR_um=zR * 1e6)
x = np.sqrt(hbar / (2 * 133 * amu * 2 * np.pi * 100e3))
ld = dict(x_zpf_nm=x * 1e9, eta=2 * np.pi / 852e-9 * x * np.cos(np.radians(45)))
print(zee); print(trapf); print(ld)"""),
("md", """## Mode matching
Power overlap of two Gaussian beams with waists w₁, w₂ and a focus offset Δz (the page's formula):
$\\eta = 4/[(w_1/w_2(z) + w_2(z)/w_1)^2 + (\\pi w_1 w_2(z)/\\lambda R_2(z))^2]$."""),
("code", """def overlap(w1_um=5.0, w2_um=4.8, dz_um=0.0, lam_nm=852):
    w1, w2, dz, lam = w1_um * 1e-6, w2_um * 1e-6, dz_um * 1e-6, lam_nm * 1e-9
    if dz == 0: return (2 * w1 * w2 / (w1**2 + w2**2)) ** 2
    zR2 = np.pi * w2**2 / lam; w2z = w2 * np.sqrt(1 + (dz / zR2) ** 2); R2 = dz * (1 + (zR2 / dz) ** 2)
    return 4 / ((w1 / w2z + w2z / w1) ** 2 + (np.pi * w1 * w2z / (lam * R2)) ** 2)
mm = overlap()
print(f"overlap {100*mm:.2f}%; with a 20 µm focus offset {100*overlap(dz_um=20):.2f}%")"""),
("md", """## Phase-modulation sidebands and Clebsch–Gordan coefficients
A phase modulator with depth β puts a fraction $J_n(\\beta)^2$ of the power in the n-th sideband; the PDH slope ∝ J₀J₁ is largest near β ≈ 1.08. Clebsch–Gordan coefficients from the Racah formula (checked here against a textbook value)."""),
("code", """beta = 1.08
eom = {n: jv(n, beta) for n in range(6)}
print({n: f"J={v:.4f}, power {100*v*v:.2f}%" for n, v in eom.items()})
print("J0·J1 =", round(jv(0, beta) * jv(1, beta), 4))

def cg(j1, m1, j2, m2, J, M):
    if abs(m1 + m2 - M) > 1e-9 or not abs(j1 - j2) <= J <= j1 + j2: return 0.0
    F = lambda x: factorial(int(round(x)))
    pref = (2 * J + 1) * F(j1 + j2 - J) * F(j1 - j2 + J) * F(-j1 + j2 + J) / F(j1 + j2 + J + 1)
    pref *= F(j1 + m1) * F(j1 - m1) * F(j2 + m2) * F(j2 - m2) * F(J + M) * F(J - M)
    s = 0.0
    for k in range(0, int(round(j1 + j2 - J)) + 1):
        args = [k, j1 + j2 - J - k, j1 - m1 - k, j2 + m2 - k, J - j2 + m1 + k, J - j1 - m2 + k]
        if min(args) < -1e-9: continue
        s += (-1) ** k / np.prod([F(a) for a in args])
    return np.sqrt(pref) * s
print("⟨1/2 1/2; 1/2 −1/2 | 1 0⟩ =", round(cg(0.5, 0.5, 0.5, -0.5, 1, 0), 6), "(expected 1/√2 = 0.707107)")"""),
("md", """## Check against the page"""),
("code", CHECK + """
ours = dict(w_col=fib["w_col_mm"], w_foc=fib["w_focus_um"], zR_fib=fib["zR_mm"], M=tel["M"], Lam=aom["Lambda_um"], bragg=aom["bragg_mrad"],
            defl=aom["deflect_mrad"], zee=zee["shift_MHz"], fr=trapf["f_r_kHz"], fz=trapf["f_z_kHz"], zR_t=trapf["zR_um"], xz=ld["x_zpf_nm"],
            eta=ld["eta"], FSR=cav["FSR_GHz"], F=cav["finesse"], lw=cav["linewidth_kHz"], mm=100 * mm, J0=eom[0], J1=eom[1])
DECIMALS = dict(w_col=3, w_foc=3, zR_fib=2, M=3, Lam=2, bragg=3, defl=3, zee=4, fr=2, fz=4, zR_t=2, xz=2, eta=4, FSR=4, F=0, lw=2, mm=2, J0=4, J1=4)
page = dict(w_col=1.126, w_foc=48.182, zR_fib=8.56, M=8.0, Lam=7.66, bragg=55.595, defl=111.191, zee=13.9962, fr=59.24, fz=14.9333,
            zR_t=2.66, xz=19.49, eta=0.1017, FSR=1.4990, F=31414, lw=47.72, mm=99.83, J0=0.7290, J1=0.4650)
check(ours, page)"""),
]
