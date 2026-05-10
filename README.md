# AMO Career Toolkit

A comprehensive career resource for Atomic, Molecular & Optical (AMO) physicists — covering 13 interactive research tools, lab technique guides, quantum computing context, laser cooling references, and a 14-topic quantum fundamentals section. Built by a Purdue Physics PhD researcher in the Hood Lab (ultracold atoms, optical tweezers).

**Live site:** https://saumitraphatak.github.io/amo-career/

---

## The 13 Research Tools

| Tool | Description |
|---|---|
| **Atom Library** | Properties of 15 laser-coolable atoms — linewidth, I_sat, T_Doppler, recoil scale, US research groups |
| **Lab Techniques** | 8 core experimental techniques with deep-dive accordions (MOT, tweezers, evaporation, imaging, lattices) |
| **Rydberg Calculator** | n-scaling: lifetime τ ~ n³, C₆ ~ n¹¹, blockade radius R_b vs principal quantum number |
| **Imaging SNR Calculator** | Single-atom fluorescence SNR — full EMCCD/sCMOS noise model, detection fidelity, min exposure finder |
| **TOF Thermometry** | Temperature from time-of-flight: σ²(t) expansion fit, PSD, BEC threshold indicator |
| **MOT / Trap Designer** | MOT damping/spring constants + Ioffe-Pritchard trap frequencies, evaporation η, Majorana warning |
| **Gate Fidelity Budget** | 8-error Rydberg two-qubit gate budget; fidelity meter; SOTA comparison (Evered 2023: 99.5%) |
| **Release-Recapture** | Interactive tweezer trap frequency measurement simulation |
| **Lab Calculators** | Optics (beam waist, NA, AOM, dBm), atomic physics (recoil, Zeeman, I_sat), trap (ω_r, ω_z, η_LD), CG coefficients |
| **Laser Cooling Simulator** | Doppler and Sisyphus cooling animation — force vs velocity, damping, momentum diffusion, sub-Doppler mechanisms |
| **Laser Locking** | SAS, PDH, beat-note offset locking — error signal derivation, cavity finesse, linewidth |
| **Zernike Polynomials** | Wavefront aberration visualizer — OSA/ANSI Zernike terms, Strehl ratio, SLM phase patterns |
| **Polarimetry Explorer** | Stokes parameters, QWP rotation analysis, degree of polarization |

---

## Quantum Computing Section

| Resource | Description |
|---|---|
| **QC Landscape** | Where AMO physics skills fit — company profiles, hardware platforms, job roles, career roadmaps |

---

## Learn Quantum (14 Topics)

Bloch Sphere · Quantum Gates · Superposition · Measurement · Entanglement · Rydberg Atoms · Two-Qubit Gates · Rabi Oscillations · Decoherence · Hyperfine Qubits · Optical Pumping · Error Correction · Quantum Algorithms · Analog Simulation

---

## Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — zero dependencies, zero build step
- **Chart.js** (via CDN) — all interactive plots and simulator charts
- **KaTeX** (via CDN) — LaTeX math rendering (`$$...$$` display, `$...$` inline)
- **Google Fonts** — Inter (body) + JetBrains Mono (equations/code)

No npm. No webpack. No React. Open `home.html` in a browser and it works.

---

## LLM / AI Accessibility

This site ships three files for AI-readable access:

| File | Purpose |
|---|---|
| [`llms.txt`](llms.txt) | Lightweight index — descriptions + links for all pages. Follows [llmstxt.org](https://llmstxt.org) spec. |
| [`llms-full.txt`](llms-full.txt) | Full content dump — all physics, formulas, and descriptions in Markdown. For RAG pipelines or large-context models. |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code project guide — tech stack, patterns, design tokens, and tool summaries for AI-assisted development. |

---

## Project Structure

```
amo-career/
├── index.html              # GitHub Pages redirect → home.html
├── home.html               # Main landing page (13 tool cards, learn section, about)
├── CLAUDE.md               # AI coding assistant project guide
├── llms.txt                # LLM site index (llmstxt.org standard)
├── llms-full.txt           # Full content for LLM/RAG ingestion
├── css/
│   └── styles.css          # Full design system (dark quantum theme, all CSS variables)
├── js/
│   └── main.js             # renderNav(), canvas animation, scroll reveal, accordions, tabs
└── pages/                  # 19 tool and content pages
    ├── atom-library.html
    ├── lab-techniques.html
    ├── rydberg-calculator.html
    ├── imaging-calculator.html
    ├── tof-calculator.html
    ├── mot-designer.html
    ├── fidelity-budget.html
    ├── release-recapture.html
    ├── lab-calculators.html
    ├── laser-locking.html
    ├── zernike.html
    ├── polarimetry.html
    ├── cooling-simulator.html
    ├── laser-cooling.html
    ├── rb-explorer.html
    ├── rb87-vs-yb171.html
    ├── dd-playground.html
    ├── qc-landscape.html
    └── learn-quantum.html
```

---

## Design System

Dark "quantum" theme with a unique accent color per tool:

```css
/* Backgrounds */
--bg-base:    #02080f;    /* deepest */
--bg-surface: #060e1c;    /* page bg */
--bg-card:    #0c1526;    /* cards */

/* Tool accent colors */
--c-atom: #38bdf8;   /* sky blue    — Atom Library        */
--c-lab:  #34d399;   /* emerald     — Lab Techniques      */
--c-qc:   #a78bfa;   /* violet      — QC Landscape        */
--c-cool: #60a5fa;   /* blue        — Cooling Simulator   */
--c-rr:   #fb923c;   /* orange      — Release-Recapture   */
--c-calc: #fbbf24;   /* amber       — Lab Calculators     */
--c-lock: #f87171;   /* red         — Laser Locking       */
--c-zern: #2dd4bf;   /* teal        — Zernike / PDH       */
```

### Component Patterns

| Pattern | Implementation |
|---|---|
| **Nav** | `renderNav({ active: 'page-key', root: '../' })` — auto-updates count from NAV object |
| **Math** | `$$...$$` display, `$...$` inline — KaTeX auto-renders on all pages |
| **Accordions** | `.accordion` > `.accordion-header` + `.accordion-body` |
| **Tabs** | `.tab-bar[data-group]` > `.tab-btn[data-tab]` + `.tab-panel[data-tab]` |
| **Scroll reveal** | Class `anim-in` + `delay-N` (1–9) |
| **Page layout** | `.page-wrap` > `.page-hero` > `.page-content` |
| **Page accent** | `--page-color`, `--page-bg`, `--page-border` CSS vars on `.page-wrap` |

---

## Running Locally

```bash
git clone https://github.com/saumitraphatak/amo-career.git
cd amo-career
open home.html         # macOS
```

No install step. Chart.js and KaTeX load via CDN.

---

## Deployment

Deployed via **GitHub Pages** from the `main` branch root. Push to `main` → auto-deploys.

To deploy your own fork:
1. Fork this repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Live at `https://<your-username>.github.io/amo-career/`

---

## About the Author

**Saumitra Phatak** — Physics PhD candidate at Purdue University, Hood Lab.
Research focus: ultracold atoms, optical tweezers, precision measurement.

- GitHub: [@saumitraphatak](https://github.com/saumitraphatak)

---

## License

MIT — free to use, modify, and distribute.
