# AMO Toolkit

A comprehensive career resource for Atomic, Molecular & Optical (AMO) physicists — 20+ interactive research tools organized by workflow (Build, Measure, Cool, Quantum, Career), lab technique and vacuum/laser-system guides, quantum computing context, and a 14-topic quantum fundamentals section. Built by a Purdue Physics PhD researcher in the Hood Lab (ultracold atoms, optical tweezers).

**Live site:** https://amotoolkit.com/

---

## The Research Tools

Organized by workflow — build the apparatus, measure what it does, cool and trap atoms, then connect the result to quantum computing and career decisions.

| Tool | Description |
|---|---|
| **Atomic Species Selector** | Properties of 15 laser-coolable atoms — linewidth, I_sat, T_Doppler, recoil scale, US research groups |
| **Laser System Planner** | Pick a species, get required laser beams, wavelengths, block diagram, nonlinear-optics needs |
| **MOT Designer** | MOT damping/spring constants, detuning optimization curve, 5-species comparison, MOT-to-experiment cooling cascade |
| **Laser Locking Guide** | SAS, PDH, beat-note offset locking — error signal derivation, cavity finesse, linewidth |
| **AMO Lab Operations Handbook** | 8 core experimental techniques with deep-dive accordions (MOT, tweezers, evaporation, imaging, lattices) |
| **Polarimetry Simulator** | Stokes parameters, QWP rotation analysis, degree of polarization |
| **Zernike Wavefront Lab** | Wavefront aberration visualizer — OSA/ANSI Zernike terms, Strehl ratio, SLM phase patterns |
| **Cavity QED Coupling Lab** | Atom-cavity coupling rates, finesse, strong/weak/bad-cavity regime classifier |
| **Vacuum Systems Guide** | Pressure regimes, pumping chain, bake-out, materials, gauges, practical checklist |
| **Tweezer Array Design Lab** | Single-tweezer trap physics, trap-parameter calculator, array geometry, species reference |
| **Single-atom Imaging** | Fluorescence SNR — full EMCCD/sCMOS noise model, detection fidelity, min exposure finder |
| **Single-atom Temperature** | Interactive tweezer thermometry simulation from recapture probability vs free-flight time |
| **MOT Temperature** | Temperature from time-of-flight: σ²(t) expansion fit, PSD, BEC threshold indicator |
| **Quick Lab Console** | Optics (beam waist, NA, AOM, dBm), atomic physics (recoil, Zeeman, I_sat), trap (ω_r, ω_z, η_LD), CG coefficients |
| **Absorption Imaging Lab** | Beer-Lambert optical density imaging, species reference, practical considerations |
| **Single-atom Cooling** | Laser cooling deep dive — narrative companion to the cooling simulator |
| **Laser Cooling Simulator** | Doppler and Sisyphus cooling animation — force vs velocity, damping, momentum diffusion, sub-Doppler mechanisms |
| **Rydberg Blockade Lab** | n-scaling: lifetime τ ~ n³, C₆ ~ n¹¹, blockade radius R_b vs principal quantum number |
| **Rydberg Gate Error Budget** | 8-error Rydberg two-qubit gate budget; fidelity meter; SOTA comparison (Evered 2023: 99.5%) |
| **Randomized Benchmarking** | Gate-fidelity characterization — Clifford twirling, decay model, interleaved RB, SOTA results |
| **Dynamical Decoupling** | π-pulse sequences as spectral filters extending qubit coherence (T₂, T₂*) |
| **Remote Entanglement** | Photon-mediated entanglement between separate qubit/tweezer modules |
| **AMO Group Finder** | Directory of 100+ AMO research groups, mapped and prioritized for grad/postdoc applications |
| **AMO Paper Roadmap** | 53 papers organized by career stage, from undergrad entry to postdoc |
| **Quantum Industry Map** | Company profiles, hardware platforms, job roles, career roadmaps |
| **Rb vs Yb Qubit Comparison** | Side-by-side platform comparison for choosing a neutral-atom qubit species |

---

## Learn Quantum (14 Topics)

Bloch Sphere · Quantum Gates · Superposition · Measurement · Entanglement · Rydberg Atoms · Two-Qubit Gates · Rabi Oscillations · Decoherence · Hyperfine Qubits · Optical Pumping · Error Correction · Quantum Algorithms · Analog Simulation

---

## Site UX Features

- **Global search** from the nav bar or `/`: species, formulas, techniques, companies, and keywords.
- **"I am trying to..." paths** on the homepage for MOT building, single-atom imaging, qubit-species choice, trap-frequency estimates, and AMO industry interview prep.
- **Persistent recently used tools** stored in local browser storage.
- **Shareable calculator URLs**: calculator controls are encoded into query strings where practical.
- **Educational depth widgets**: derivation-mode toggles, common-mistake boxes, and AMO intuition cards.
- **Source confidence tags**: textbook, peer-reviewed, company roadmap, and rough estimate.
- **Export helpers**: CSV export for tables and PNG/SVG export for canvas plots.

---

## Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — zero dependencies, zero build step
- **Chart.js** (via CDN) — all interactive plots and simulator charts
- **KaTeX** (via CDN) — LaTeX math rendering (`$$...$$` display, `$...$` inline)
- **Google Fonts** — Inter (body) + JetBrains Mono (equations/code)

No npm. No webpack. No React. Open `home.html` in a browser and it works.

## Verification

Run the lightweight physics regression checks after editing formulas:

```bash
python3 tests/formula_regression.py
```

These tests guard recoil-energy conventions, imaging-fidelity mapping, beat-note RF prefactors, QC claim qualification, release-recapture wording, presence of key site UX features, and Rb/Yb comparison-panel fact boundaries.

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
├── home.html               # Main landing page (workflow-grouped tool cards, learn section, about)
├── 404.html                # Custom 404 page
├── CLAUDE.md               # AI coding assistant project guide
├── CNAME                   # Custom domain: amotoolkit.com
├── llms.txt                # LLM site index (llmstxt.org standard)
├── llms-full.txt           # Full content for LLM/RAG ingestion
├── css/
│   └── styles.css          # Full design system (dark quantum theme, all CSS variables)
├── js/
│   └── main.js             # renderNav(), global search, canvas animation, scroll reveal, accordions, tabs
├── tests/
│   └── formula_regression.py
└── pages/                  # 27 tool and content pages, grouped by NAV workflow category
    ├── atom-library.html, laser-planner.html, mot-designer.html, laser-locking.html,
    │   lab-techniques.html, polarimetry.html, zernike.html, cavity-qed.html,
    │   vacuum-systems.html, tweezer-designer.html          # Build
    ├── imaging-calculator.html, release-recapture.html, tof-calculator.html,
    │   lab-calculators.html, absorption-imaging.html       # Measure
    ├── laser-cooling.html, cooling-simulator.html          # Cool
    ├── learn-quantum.html, rydberg-calculator.html, fidelity-budget.html,
    │   rb-explorer.html, dd-playground.html, remote-entanglement.html   # Quantum
    └── amo-groups.html, paper-syllabus.html, qc-landscape.html,
        rb87-vs-yb171.html                                  # Career
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
| **Nav** | `renderNav({ active: 'page-key', root: '../' })` — driven by the `NAV` object (grouped into Build/Measure/Cooling/Quantum/Career) and feeds the global search index |
| **Math** | `$$...$$` display, `$...$` inline — KaTeX auto-renders on all pages |
| **Accordions** | `.accordion` > `.accordion-header` + `.accordion-body` |
| **Tabs** | `.tab-bar[data-group]` > `.tab-btn[data-tab]` + `.tab-panel[data-tab]` |
| **Derivation modes** | `.derivation-mode` with `[data-deriv-tab]` buttons and `[data-deriv-panel]` panels |
| **Source confidence** | `.source-tag.textbook`, `.source-tag.peer-reviewed`, `.source-tag.company-roadmap`, `.source-tag.rough-estimate` |
| **Exports** | Auto-injected table CSV and canvas PNG/SVG buttons from `js/main.js` |
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
