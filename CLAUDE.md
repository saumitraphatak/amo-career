# AMO Career — Claude Code Project Guide

> Read this file first. It replaces the need to open any HTML file to understand the project.

**Live site:** https://saumitraphatak.github.io/amo-career/
**Author:** Saumitra Phatak — Purdue Physics PhD, Hood Lab (ultracold atoms / optical tweezers)
**Purpose:** Career toolkit for AMO physicists — interactive calculators, lab technique guides, quantum computing context, and an educational quantum fundamentals section.

---

## Tech Stack (Critical Constraints)

- **Pure static HTML / CSS / Vanilla JS.** No npm, no node, no build step whatsoever.
- **No package manager on this machine** — do not suggest `npm install`, `pip install`, etc.
- **CDN dependencies only** (loaded via `<script src="https://...">` tags in each page):
  - Chart.js `@4.4.3` — all interactive charts and plots
  - KaTeX `@0.16.11` + auto-render extension — LaTeX math rendering
  - Google Fonts — Inter (body) + JetBrains Mono (code/mono)
- **Git** is available at `/usr/bin/git`. Branch: `main`.
- **Python3** at `/Users/curious/anaconda3/bin/python3` (only if needed for local server).
- Open `home.html` directly in a browser to develop locally. No server required.

---

## File Structure

```
amo-career/
├── index.html              # GitHub Pages redirect → home.html (do not edit)
├── home.html               # Main landing page (hero, 12 tool cards, learn section, about)
├── CLAUDE.md               # This file — AI project guide
├── llms.txt                # LLM-readable site index (public standard)
├── llms-full.txt           # Full content dump for LLM/RAG ingestion
├── README.md               # Human-readable project overview
├── robots.txt              # Crawler permissions (all AI bots allowed)
├── sitemap.xml             # Search engine sitemap
├── css/
│   └── styles.css          # SINGLE design system file — all variables, components
├── js/
│   └── main.js             # SINGLE shared JS file — NAV data, renderNav(), all shared logic
└── pages/                  # All tool and content pages (17 files)
    ├── atom-library.html       # Atom Library
    ├── lab-techniques.html     # Lab Techniques (8 techniques)
    ├── rydberg-calculator.html # Rydberg Calculator
    ├── imaging-calculator.html # Imaging SNR Calculator
    ├── tof-calculator.html     # TOF Thermometry
    ├── mot-designer.html       # MOT / Magnetic Trap Designer
    ├── fidelity-budget.html    # Gate Fidelity Budget
    ├── release-recapture.html  # Release-Recapture Simulator
    ├── lab-calculators.html    # Lab Calculators (optics, atomic, trap, CG)
    ├── laser-locking.html      # Laser Locking Guide
    ├── zernike.html            # Zernike Polynomial Visualizer
    ├── polarimetry.html        # Polarimetry Explorer
    ├── cooling-simulator.html  # Doppler / Sisyphus Cooling Simulator
    ├── clebsch-gordan.html     # Clebsch-Gordan Calculator
    ├── pdh-explorer.html       # PDH Error Signal Explorer
    ├── qc-landscape.html       # QC Industry Landscape
    └── learn-quantum.html      # Quantum Fundamentals (14 topics, all on one page)
```

---

## The NAV Object — Single Source of Truth

All navigation is driven by the `NAV` object at the top of `js/main.js`. **To add a new tool: add one entry to `NAV.tools`. Nothing else in the nav needs to change.**

```javascript
const NAV = {
  tools: [                   // 12 entries → "12 AMO Research Tools" in dropdown
    { key: 'atom-library',         label: 'Atom Library',            icon: '⚛️',  color: '#38bdf8', href: 'pages/atom-library.html'         },
    { key: 'lab-techniques',       label: 'Lab Techniques',          icon: '🔬',  color: '#34d399', href: 'pages/lab-techniques.html'       },
    { key: 'rydberg-calculator',   label: 'Rydberg Calculator',      icon: '🔮',  color: '#818cf8', href: 'pages/rydberg-calculator.html'   },
    { key: 'imaging-calculator',   label: 'Imaging SNR Calculator',  icon: '📷',  color: '#34d399', href: 'pages/imaging-calculator.html'   },
    { key: 'tof-calculator',       label: 'TOF Thermometry',         icon: '🌡️',  color: '#38bdf8', href: 'pages/tof-calculator.html'       },
    { key: 'mot-designer',         label: 'MOT Designer',            icon: '🧲',  color: '#fb923c', href: 'pages/mot-designer.html'         },
    { key: 'fidelity-budget',      label: 'Gate Fidelity Budget',    icon: '📊',  color: '#f87171', href: 'pages/fidelity-budget.html'      },
    { key: 'release-recapture',    label: 'Release-Recapture',       icon: '🎯',  color: '#fb923c', href: 'pages/release-recapture.html'   },
    { key: 'lab-calculators',      label: 'Lab Calculators',         icon: '🧮',  color: '#fbbf24', href: 'pages/lab-calculators.html'     },
    { key: 'laser-locking',        label: 'Laser Locking',           icon: '🔐',  color: '#f87171', href: 'pages/laser-locking.html'       },
    { key: 'zernike',              label: 'Zernike Polynomials',     icon: '🌊',  color: '#2dd4bf', href: 'pages/zernike.html'             },
    { key: 'polarimetry',          label: 'Polarimetry Explorer',    icon: '🔭',  color: '#e879f9', href: 'pages/polarimetry.html'         },
  ],
  industry: [
    { key: 'qc-landscape', label: 'QC Industry Landscape', icon: '💻', color: '#a78bfa', href: 'pages/qc-landscape.html' },
  ],
  learn: [                   // 14 entries → "Quantum Fundamentals — 14 topics"
    { key: 'bloch-sphere',       label: 'Bloch Sphere',          icon: '🔵', href: 'pages/learn-quantum.html#bloch'          },
    { key: 'quantum-gates',      label: 'Quantum Gates',         icon: '⚡', href: 'pages/learn-quantum.html#gates'          },
    { key: 'superposition',      label: 'Superposition',         icon: '〰️', href: 'pages/learn-quantum.html#superposition' },
    { key: 'measurement',        label: 'Measurement',           icon: '📏', href: 'pages/learn-quantum.html#measurement'    },
    { key: 'entanglement',       label: 'Entanglement',          icon: '🔗', href: 'pages/learn-quantum.html#entanglement'   },
    { key: 'rydberg-atoms',      label: 'Rydberg Atoms',         icon: '⚛️', href: 'pages/learn-quantum.html#rydberg'        },
    { key: 'two-qubit-gates',    label: 'Two-Qubit Gates',       icon: '🔀', href: 'pages/learn-quantum.html#twoqubit'       },
    { key: 'rabi-oscillations',  label: 'Rabi Oscillations',     icon: '🌀', href: 'pages/learn-quantum.html#rabi'           },
    { key: 'decoherence',        label: 'Decoherence',           icon: '📉', href: 'pages/learn-quantum.html#decoherence'    },
    { key: 'hyperfine-qubits',   label: 'Hyperfine Qubits',      icon: '🔑', href: 'pages/learn-quantum.html#hyperfine'      },
    { key: 'optical-pumping',    label: 'Optical Pumping',       icon: '💡', href: 'pages/learn-quantum.html#optical-pumping'},
    { key: 'qec',                label: 'Error Correction',      icon: '🛡️', href: 'pages/learn-quantum.html#qec'            },
    { key: 'quantum-algorithms', label: 'Quantum Algorithms',    icon: '⚙️', href: 'pages/learn-quantum.html#algorithms'     },
    { key: 'analog-sim',         label: 'Analog Simulation',     icon: '🔬', href: 'pages/learn-quantum.html#analog-sim'     },
  ],
};
```

The nav dropdown label and Learn Quantum dropdown count update **automatically** from `NAV.tools.length` and `NAV.learn.length` — no manual string updates needed.

---

## renderNav() — How Every Page Loads the Nav

Every page (except home.html) calls this at the end of `<body>`:

```html
<!-- sub-pages use root: '../' -->
<script src="../js/main.js?v=3"></script>
<script src="../css/styles.css?v=3"></script>  <!-- already in <head> -->
<script>
  renderNav({ active: 'page-key', root: '../' });
</script>

<!-- home.html uses root: '' -->
<script src="js/main.js?v=3"></script>
<script>
  renderNav({ active: 'home', root: '' });
</script>
```

**Cache busting:** The `?v=N` suffix forces browsers to reload files after changes. The current version is `v=4`. **Increment to `v=5` (then `v=6`, etc.) whenever you make significant changes to `main.js` or `styles.css`** so users don't get stale cached files. Use sed to update all pages at once:
```bash
sed -i '' 's/main\.js?v=4/main.js?v=5/g' pages/*.html home.html
sed -i '' 's/styles\.css?v=4/styles.css?v=5/g' pages/*.html home.html
```

---

## Design System (css/styles.css)

### Background & Surface Colors
```css
--bg-base:        #02080f;   /* deepest background */
--bg-surface:     #060e1c;   /* page background */
--bg-card:        #0c1526;   /* card background */
--bg-card-hover:  #101d30;   /* card hover state */
```

### Typography
```css
--text-primary:   #e2e8f0;   /* headings, labels */
--text-secondary: #94a3b8;   /* body text */
--text-muted:     #475569;   /* captions, footnotes */
--font-mono:      'JetBrains Mono', monospace;
```

### Tool Accent Colors (one per tool)
```css
--c-atom:  #38bdf8;   /* sky blue    — Atom Library         */
--c-lab:   #34d399;   /* emerald     — Lab Techniques       */
--c-qc:    #a78bfa;   /* violet      — QC Landscape         */
--c-cool:  #60a5fa;   /* blue        — Cooling Simulator    */
--c-rr:    #fb923c;   /* orange      — Release-Recapture    */
--c-calc:  #fbbf24;   /* amber       — Lab Calculators      */
--c-cg:    #f472b6;   /* pink        — Clebsch-Gordan       */
--c-lock:  #f87171;   /* red         — Laser Locking        */
--c-zern:  #2dd4bf;   /* teal        — Zernike / PDH        */
/* New tools: pick a color from this palette or a nearby hue */
```

### Borders, Radius, Spacing
```css
--border:    rgba(255,255,255,0.06);
--border-med:rgba(255,255,255,0.10);
--r:    8px;    --r-md: 10px;   --r-lg: 14px;
--sp-1: 4px;   --sp-2: 8px;    --sp-3: 12px;
--sp-4: 16px;  --sp-5: 20px;   --sp-6: 24px;
--t: 200ms ease;
```

---

## Component Patterns

### 1. Page Template (every tool page follows this structure)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tool Name — AMO Career</title>
  <link rel="stylesheet" href="../css/styles.css?v=3">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <!-- Chart.js if needed: -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
  <style>
    .page-wrap { --page-color: #HEX; --page-bg: rgba(R,G,B,0.08); --page-border: rgba(R,G,B,0.2); }
    /* page-specific overrides only */
  </style>
</head>
<body>
  <div id="nav-root"></div>

  <main class="page-wrap">
    <div class="page-hero">
      <div class="page-hero-inner">
        <div class="page-eyebrow">
          <span class="page-tag">🔬 AMO Career</span>
          <span class="page-tag">Tool Name</span>
        </div>
        <h1 class="page-title"><span class="accent">01</span> Section Title</h1>
        <p class="page-subtitle">Description...</p>
      </div>
    </div>

    <div class="page-content">
      <!-- sections, calculators, accordions, etc. -->
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" defer></script>
  <script src="../js/main.js?v=3"></script>
  <script>
    renderNav({ active: 'page-key', root: '../' });
    // page-specific JS here
  </script>
</body>
</html>
```

### 2. Accordion Pattern
```html
<div class="accordion">
  <button class="accordion-header" aria-expanded="false">
    <span class="accordion-title">Section Title</span>
    <svg class="accordion-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 6l4 4 4-4"/>
    </svg>
  </button>
  <div class="accordion-body">
    <p>Content...</p>
  </div>
</div>
```
Accordions are initialized automatically by `main.js` via `initAccordions()`.

### 3. Tab Pattern
```html
<div class="tab-bar" data-group="group-name">
  <button class="tab-btn active" data-tab="tab1">Tab 1</button>
  <button class="tab-btn" data-tab="tab2">Tab 2</button>
</div>
<div class="tab-panel active" data-group="group-name" data-tab="tab1">Panel 1</div>
<div class="tab-panel" data-group="group-name" data-tab="tab2">Panel 2</div>
```
Tabs are initialized automatically by `main.js` via `initTabs()`.

### 4. Formula Boxes with KaTeX
KaTeX auto-render is initialized in `main.js` using `$$...$$` (display) and `$...$` (inline) delimiters.

```html
<!-- Display math (centered, block): -->
<div class="formula-box">
  $$R_{\rm sc} = \frac{\Gamma}{2} \cdot \frac{s}{1 + s + (2\Delta/\Gamma)^2}$$
  where $s = I/I_{\rm sat}$ is the saturation parameter
</div>

<!-- Inline in text: -->
<p>The de Broglie wavelength $\lambda_{\rm dB} = h/\sqrt{2\pi m k_{\rm B} T}$ ...</p>
```

**Do NOT** use `white-space: pre`, `font-family: var(--mono)` on `.formula-box` — these break KaTeX rendering. The global CSS handles `.formula-box` styling.

### 5. Section Numbering Convention
Sections inside tool pages are labeled `01`, `02`, `03`, ... using `.accent` span:
```html
<h2 class="section-title"><span class="accent">01</span> Input Parameters</h2>
```

### 6. Home Page Tool Cards
```html
<a class="tool-card" href="pages/tool.html" style="--card-color:#HEX; --card-bg:rgba(R,G,B,0.08);">
  <div class="tool-card-icon">🔬</div>
  <div class="tool-card-body">
    <h3>Tool Name</h3>
    <p>One-sentence description.</p>
    <div class="tool-tags">
      <span class="tag">tag1</span>
      <span class="tag">tag2</span>
    </div>
  </div>
  <div class="tool-cta">Open →</div>
</a>
```

### 7. Scroll Reveal Animation
Add `class="anim-in delay-N"` (N = 1 to 9, in multiples of ~100ms delay) to any element that should animate in on scroll. Handled automatically by `main.js` IntersectionObserver.

---

## Adding a New Tool Page — Checklist

1. **Create** `pages/new-tool.html` using the page template above
2. **Add to NAV.tools** in `js/main.js`:
   ```javascript
   { key: 'new-tool', label: 'Tool Name', icon: '🔧', color: '#HEX', href: 'pages/new-tool.html' },
   ```
3. **Add tool card** to `home.html` in the tools grid
4. **Add footer link** to `home.html` in the footer tools list
5. **Update** the eyebrow on `home.html` ("12 AMO Research Tools" → "13 AMO Research Tools")
6. **Update** hero stat on `home.html` ("13+ Interactive Tools" → "14+")
7. **Bump cache version**: `sed -i '' 's/v=3/v=4/g' pages/*.html home.html`
8. **Update** `llms.txt` and `llms-full.txt` to describe the new tool
9. **Commit** and push to `main` → auto-deploys to GitHub Pages

---

## All 12 Tool Pages — Physics Summary

### 1. Atom Library (`atom-library.html`)
15 laser-coolable atoms in 4 family tabs (alkali, alkaline-earth, rare-earth, other). Table: mass, D1/D2 wavelengths, natural linewidth Γ, I_sat, recoil temperature, Doppler temperature. US research groups per atom. Interactive family switching.

### 2. Lab Techniques (`lab-techniques.html`)
8 experimental techniques with deep-dive accordion sections (from thesis Ch. 6): laser cooling, MOT loading, evaporative cooling, optical tweezers, fluorescence imaging, absorption imaging, RF/microwave spectroscopy, optical lattices.

### 3. Rydberg Calculator (`rydberg-calculator.html`)
Principal quantum number n (30–120), atom species (Rb87, Cs133, Yb171, Sr88). Computes: Rydberg state lifetime τ ~ n³ (with BBR correction), C₆ coefficient (van der Waals, ∝ n¹¹), blockade radius R_b = (C₆/ℏΩ)^(1/6), gate fidelity estimate. Chart.js: τ and R_b vs n curves.

### 4. Imaging SNR Calculator (`imaging-calculator.html`)
7 atom species with D2 line data (Rb87, Cs133, Li6/7, Na23, K39/40). Inputs: NA, detuning Δ, saturation s, exposure time, camera type (EMCCD/sCMOS/Ideal). Computes: scattering rate R_sc, collection efficiency η, photon counts N_sig, SNR via full noise model (shot + read + dark + background), detection fidelity F via normCDF. Chart: SNR vs exposure time curve. Min exposure finder for SNR=10 and SNR=50.

### 5. TOF Thermometry (`tof-calculator.html`)
9 species (Rb85/87, Cs133, Li6/7, Na23, K39/40/41). Ballistic expansion law: σ²(t) = σ₀² + (k_BT/m)t². Temperature from linear regression of σ² vs t² data. Computes: de Broglie wavelength, peak density, phase-space density (BEC threshold at PSD ≥ 2.612), Doppler and recoil limits. Chart.js: σ(t) expansion curve + fit from data table.

### 6. MOT Designer (`mot-designer.html`)
5 species (Rb87, Cs133, Na23, Li7, K39). Section 01 MOT: damping α, spring κ, ω_MOT, capture velocity, Doppler temperature vs detuning Δ and saturation s. Section 02 Ioffe-Pritchard trap: radial/axial frequencies ω_r, ω_z, trap depth U₀, evaporation parameter η = U₀/k_BT, Majorana loss warning for B₀ < 3G. Chart: trap potential U(r) with thermal energy reference line.

### 7. Gate Fidelity Budget (`fidelity-budget.html`)
4 species (Rb87, Cs133, Yb171, Sr88). 8 error sources for Rydberg two-qubit gates: spontaneous emission εₛₑ = Γ_Ryd·t_gate, Doppler dephasing ε_D = ½(k·v_rms·t_gate)², laser phase noise ε_φ = π·Δν·t_gate, blockade leakage ε_blk = 1/(U/Ω)², SPAM ε_sp, atom loss ε_loss = t_gate/τ_trap, B-field dephasing ε_B = ½(μ_B·ΔB·t_gate/ℏ)², Rabi inhomogeneity ε_Ω = ½(π·δΩ/Ω/2)². Fidelity F = 1 − Σεᵢ. Color-coded meter (≥99.9% green). SOTA comparison: Evered 2023 (99.5%), Ma 2023 (99.3%), FTQC threshold (99%).

### 8. Release-Recapture (`release-recapture.html`)
Interactive simulator for tweezer trap frequency measurement. Atom released from trap, evolves under gravity + thermal velocity, recaptured if within trap volume. Chart: recapture probability vs release time. Extracts trap frequency ω_r from fit.

### 9. Lab Calculators (`lab-calculators.html`)
Large multi-section calculator suite organized in tabs:
- **Optics**: beam waist, Rayleigh range, NA, fiber coupling, telescope magnification, dBm↔mW, AOM shift, shot noise
- **Atomic physics**: photon recoil, Doppler temperature, recoil temperature, de Broglie wavelength, Zeeman shift, I_sat
- **Trap**: tweezer frequency ω_r = √(4U₀/mw₀²), Lamb-Dicke parameter η = k·x_zpf, cavity FSR, mode matching
- **Clebsch-Gordan**: CG coefficient table + decomposition for arbitrary j₁, j₂, m₁, m₂

### 10. Laser Locking (`laser-locking.html`)
Guide + interactive tool for saturated absorption spectroscopy (SAS), PDH locking, and offset locking. Subsections: SAS Doppler-free signal, crossover resonances, beat-note offset lock, PDH error signal derivation ε(ν), cavity finesse F = π√R/(1-R), linewidth δν_cav = FSR/F, PDH optical chain.

### 11. Zernike Polynomials (`zernike.html`)
Interactive wavefront aberration analyzer. OSA/ANSI Zernike polynomial Z_n^m(ρ,θ) = R_n^|m|(ρ)·Θ_m(θ). Coefficients slider for tip, tilt, defocus, astigmatism, coma, trefoil, spherical, etc. Canvas wavefront display. Strehl ratio computation. Application to SLM phase patterns for LG modes.

### 12. Polarimetry Explorer (`polarimetry.html`)
Stokes parameter visualization for polarization state characterization. Quarter-wave plate rotation analysis, degree of polarization, Poincaré sphere visualization. Applications to optical pumping setup.

---

## Learn Quantum (`learn-quantum.html`)

14 topics on one long scrollable page with a sticky internal nav:

| Anchor | Topic | Key content |
|---|---|---|
| `#bloch` | Bloch Sphere | State ψ = cos(θ/2)\|0⟩ + e^{iφ}sin(θ/2)\|1⟩, interactive rotation, MZI unitary |
| `#gates` | Quantum Gates | Hadamard, Pauli X/Y/Z, CNOT, T-gate; circuit diagram examples |
| `#superposition` | Superposition | Born rule, probability amplitude, measurement collapse |
| `#measurement` | Measurement | Projective measurement, expectation values, no-cloning theorem |
| `#entanglement` | Entanglement | Bell states, EPR paradox, CHSH inequality, quantum teleportation |
| `#rydberg` | Rydberg Atoms | n-scaling rules, C₆ ∝ n¹¹, blockade radius, dipole-dipole interaction |
| `#twoqubit` | Two-Qubit Gates | CZ gate, CNOT from CZ, controlled-phase, Rydberg blockade gate |
| `#rabi` | Rabi Oscillations | Rabi frequency Ω, dressed states, Bloch vector precession, rotating frame |
| `#decoherence` | Decoherence | T₁ (energy), T₂ (phase), T₂* (inhomogeneous), echo sequences |
| `#hyperfine` | Hyperfine Qubits | Hₕf = A_hf·I·J, clock states, Zeeman shift, 87Rb and 133Cs qubit transitions |
| `#optical-pumping` | Optical Pumping | σ⁺ selection rules, F=1 population to m_F=+1, interactive 3-level simulation |
| `#qec` | Error Correction | 3-qubit bit-flip, Shor code, surface code, threshold theorem |
| `#algorithms` | Quantum Algorithms | Deutsch-Jozsa, Grover O(√N), Shor O((log N)³), VQE |
| `#analog-sim` | Analog Simulation | Hubbard model, Ising Hamiltonian, BEC-BCS crossover |

---

## Other Tools (Less Frequently Edited)

- **`cooling-simulator.html`** — Doppler and Sisyphus cooling animation; momentum diffusion vs damping coefficient
- **`clebsch-gordan.html`** — Wigner 3j symbols, CG decomposition, selection rules table
- **`pdh-explorer.html`** — PDH error signal vs cavity detuning, reflection coefficient, cavity pole
- **`qc-landscape.html`** — Company profiles (IonQ, Quantinuum, IBM, Google, PsiQuantum, etc.), job roles, skills mapping for AMO physicists, roadmaps

---

## KaTeX LaTeX Quick Reference for AMO Physics

```
Greek:      \hbar  \Gamma  \Delta  \Omega  \omega  \varphi  \lambda  \eta
            \sigma  \rho  \alpha  \beta  \kappa  \mu  \tau  \varepsilon  \theta
Operators:  \frac{a}{b}  \sqrt{x}  \sum_i  \int_0^\infty  \langle  \rangle
Kets:       |0\rangle  |1\rangle  |\psi\rangle
Subscript:  k_{\rm B}  I_{\rm sat}  R_{\rm sc}  N_{\rm sig}
Common:     \cdot  \times  \approx  \propto  \ll  \gg  \rightarrow
Alignment:  \begin{aligned} a &= b \\ c &= d \end{aligned}
Text in eq: \text{any text}  \rm{roman font}
```

---

## Known Issues / Watch-outs

- **Cache busting:** After any change to `main.js` or `styles.css`, increment `?v=N` in all pages (use sed). Failing to do this causes users to see old nav/styles.
- **Button text color:** Global `button { color: inherit; }` is set — do not add browser-default buttons without explicit color.
- **Formula boxes:** Never add `white-space: pre` or `font-family: var(--mono)` to `.formula-box` — breaks KaTeX rendering.
- **Page-local formula-box styles:** Some pages have `<style>.formula-box { background:...; border:...; }</style>` for custom colors. Keep only `background`, `border`, `border-radius`, `padding` — never font or white-space overrides.
- **NAV count auto-updates:** Never hardcode "N AMO Research Tools" anywhere — it's `${NAV.tools.length}` in `main.js`.
- **home.html nav:** Uses `root: ''` (empty string, not `'../'`).
- **index.html:** Only a redirect — never edit it.
