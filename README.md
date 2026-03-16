# AMO Career Toolkit

A comprehensive career resource for Atomic, Molecular & Optical (AMO) physicists — covering research tools, lab techniques, quantum computing context, and interactive simulators. Built by a Purdue Physics PhD researcher in the Hood Lab (ultracold atoms, optical tweezers).

**Live site:** https://saumitraphatak.github.io/amo-career/

---

## Why This Exists

AMO physics sits at the intersection of fundamental research and quantum technology. Whether you're choosing a trap geometry, calculating a Clebsch-Gordan coefficient, or trying to understand where your skills fit in the quantum computing industry — this toolkit has you covered. It consolidates knowledge that's currently scattered across textbooks, papers, and lab wikis.

---

## The 9 Tools

| Tool | Description |
|---|---|
| **Atom Library** | Properties of 15 laser-coolable atoms — family tabs, energy levels, US research groups |
| **Lab Techniques** | 8 core experimental techniques with deep-dive accordions (from thesis Ch. 6) |
| **QC Landscape** | Where AMO skills fit in the quantum computing industry — companies, roles, roadmaps |
| **Cooling Simulator** | Interactive Doppler / Sisyphus cooling simulation |
| **Release-Recapture** | Interactive release-recapture simulator for trap frequency measurement |
| **Lab Calculators** | Beam waist, trap depth, photon recoil, scattering rate, and more |
| **Clebsch-Gordan** | Interactive CG coefficient calculator with selection rules |
| **Laser Locking** | PDH / side-of-fringe locking guide with error signal visualizer |
| **Zernike Modes** | Zernike polynomial visualizer for wavefront aberration analysis |

---

## Learning Section

| Resource | Description |
|---|---|
| **Learn Quantum** | Fundamentals: quantum states, entanglement, measurement, decoherence |

---

## Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — zero dependencies, zero build step
- **Chart.js** (via CDN) — simulator plots and calculator charts
- **KaTeX** (via CDN) — LaTeX math rendering for formulas
- **Google Fonts** — Inter (body) + JetBrains Mono (equations/code)

No npm. No webpack. No React. Open `home.html` in a browser and it works.

---

## Project Structure

```
amo-career/
├── index.html              # GitHub Pages redirect → home.html
├── home.html               # Main home page (hero, 9 tool cards, learn section, about)
├── css/
│   └── styles.css          # Full design system (dark quantum theme + CSS variables)
├── js/
│   └── main.js             # renderNav(), canvas animation, scroll reveal, accordions, tabs
└── pages/
    ├── atom-library.html
    ├── lab-techniques.html
    ├── qc-landscape.html
    ├── cooling-simulator.html
    ├── release-recapture.html
    ├── lab-calculators.html
    ├── clebsch-gordan.html
    ├── laser-locking.html
    ├── zernike.html
    └── learn-quantum.html
```

---

## Design System

Dark "quantum" theme with a unique accent color per tool:

```css
/* Backgrounds */
--bg-base:    #02080f;
--bg-surface: #060e1c;
--bg-card:    #0c1526;

/* Tool accent colors */
--c-atom: #38bdf8;   /* sky blue    — Atom Library        */
--c-lab:  #34d399;   /* emerald     — Lab Techniques      */
--c-qc:   #a78bfa;   /* violet      — QC Landscape        */
--c-cool: #60a5fa;   /* blue        — Cooling Simulator   */
--c-rr:   #fb923c;   /* orange      — Release-Recapture   */
--c-calc: #fbbf24;   /* amber       — Lab Calculators     */
--c-cg:   #f472b6;   /* pink        — Clebsch-Gordan      */
--c-lock: #f87171;   /* red         — Laser Locking       */
--c-zern: #2dd4bf;   /* teal        — Zernike Modes       */

/* Typography */
--font-mono: 'JetBrains Mono', monospace;  /* formulas, code */
```

### Component Patterns

| Pattern | Implementation |
|---|---|
| **Nav** | `renderNav({ active: 'page-key', root: '../' })` — called in every page |
| **Tool cards** | Inline `--card-color` and `--card-bg` CSS vars on `.tool-card` |
| **Accordions** | `.accordion` > `.accordion-header` + `.accordion-body` |
| **Tabs** | `.tab-bar[data-group]` > `.tab-btn[data-tab]` + `.tab-panel[data-tab]` |
| **Scroll reveal** | Class `anim-in` + `delay-N` (1–9) on elements |
| **Page layout** | `.page-wrap` > `.page-hero` > `.page-content` |
| **Page accent** | CSS vars `--page-color`, `--page-bg`, `--page-border` on `.page-wrap` |

---

## Running Locally

```bash
git clone https://github.com/saumitraphatak/amo-career.git
cd amo-career
open home.html         # macOS
# or just drag home.html into any browser
```

No install step. Chart.js and KaTeX load via CDN.

> **Note:** `index.html` redirects to `home.html` for GitHub Pages compatibility. Open `home.html` directly when developing locally.

---

## Deployment

Deployed via **GitHub Pages** from the `main` branch root.

To deploy your own fork:
1. Fork this repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Live at `https://<your-username>.github.io/amo-career/`

---

## About the Author

**Saumitra Phatak** — Physics PhD candidate at Purdue University, Hood Lab.
Research focus: ultracold atoms, optical tweezers, precision measurement.

This toolkit grew directly out of my own PhD experience — the calculations I run weekly, the concepts I had to piece together from scattered sources, and the career questions I had to navigate entering a field where "quantum computing" means very different things to different people.

- GitHub: [@saumitraphatak](https://github.com/saumitraphatak)

---

## License

MIT — free to use, modify, and distribute.
