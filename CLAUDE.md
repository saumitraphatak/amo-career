# AMO Career — Claude Code Project Guide

> Read this file first. It replaces the need to open any HTML file to understand the project.

**Live site:** https://amotoolkit.com/
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
├── home.html               # Main landing page (hero, job-to-be-done tool sections, learn section, about)
├── 404.html                # Custom 404 page — has its own styles.css/main.js tags; needs cache-bust bumps too
├── CLAUDE.md               # This file — AI project guide
├── llms.txt                # LLM-readable site index (public standard) — currently lags actual tool count
├── llms-full.txt           # Full content dump for LLM/RAG ingestion — currently lags actual tool count
├── README.md               # Human-readable project overview
├── CNAME                   # Custom domain: amotoolkit.com
├── robots.txt              # Crawler permissions (all AI bots allowed)
├── sitemap.xml             # Search engine sitemap
├── css/
│   └── styles.css          # SINGLE design system file — all variables, components
├── js/
│   └── main.js             # SINGLE shared JS file — NAV data, renderNav(), global search, all shared logic
├── tests/
│   └── formula_regression.py  # Physics/content regression checks
├── assets/cooling/         # GIFs (gray-molasses-cooling, resolved-sideband-cooling) used by tool pages
└── pages/                  # All tool and content pages (27 files)
    ├── atom-library.html       # Atomic Species Selector
    ├── laser-planner.html      # Laser System Planner
    ├── mot-designer.html       # MOT Designer
    ├── laser-locking.html      # Laser Locking Guide
    ├── lab-techniques.html     # AMO Lab Operations Handbook (8 techniques)
    ├── polarimetry.html        # Polarimetry Simulator
    ├── zernike.html            # Zernike Wavefront Lab
    ├── cavity-qed.html         # Cavity QED Coupling Lab
    ├── vacuum-systems.html     # Vacuum Systems Guide
    ├── tweezer-designer.html   # Tweezer Array Design Lab
    ├── imaging-calculator.html # Single-atom Imaging (SNR Calculator)
    ├── release-recapture.html  # Single-atom Temperature (Release-Recapture Simulator)
    ├── tof-calculator.html     # MOT Temperature (TOF Thermometry)
    ├── lab-calculators.html    # Quick Lab Console (optics, atomic, trap, CG)
    ├── absorption-imaging.html # Absorption Imaging Lab
    ├── laser-cooling.html      # Single-atom Cooling (laser cooling deep dive)
    ├── cooling-simulator.html  # Laser Cooling Simulator (Doppler / Sisyphus)
    ├── learn-quantum.html      # Quantum Computing Learning Path (14 topics, one page)
    ├── rydberg-calculator.html # Rydberg Blockade Lab
    ├── fidelity-budget.html    # Rydberg Gate Error Budget
    ├── rb-explorer.html        # Randomized Benchmarking (NOT rubidium — RB as in gate-fidelity characterization)
    ├── dd-playground.html      # Dynamical Decoupling
    ├── remote-entanglement.html# Remote Entanglement (photon-mediated qubit linking)
    ├── amo-groups.html         # AMO Group Finder (career map, 100+ groups)
    ├── paper-syllabus.html     # AMO Paper Roadmap (53 papers)
    ├── qc-landscape.html       # Quantum Industry Map
    └── rb87-vs-yb171.html      # Rb vs Yb Qubit Comparison
```

**Page count grew from 19 → 27** since this file was last verified. 10 new pages were added: laser-planner, cavity-qed, vacuum-systems, tweezer-designer, absorption-imaging, rb-explorer, dd-playground, remote-entanglement, amo-groups, paper-syllabus. Treat `llms.txt`/`llms-full.txt` as stale documentation (still describe a "13 tools" snapshot) rather than source of truth until someone refreshes them.

---

## The NAV Object — Single Source of Truth

All navigation is driven by the `NAV` object at the top of `js/main.js`. It is now organized into **workflow categories** (not a single flat tool list) so the nav and homepage can group tools by "job to be done" rather than alphabetically. **To add a new tool: add one entry to the right category array** (`build`, `measure`, `cooling`, `quantum`, or `career`). `NAV.tools` is auto-derived — nothing else needs to change.

```javascript
const NAV = {
  build: [                   // Designing/setting up an experiment
    { key: 'atom-library',   label: 'Atomic Species Selector',      kind: 'Reference',   icon: '⚛️', color: '#38bdf8', href: 'pages/atom-library.html'   },
    { key: 'laser-planner',  label: 'Laser System Planner',         kind: 'Design tool',  icon: '💡', color: '#f472b6', href: 'pages/laser-planner.html'  },
    { key: 'mot-designer',   label: 'MOT Designer', kind: 'Calculator',   icon: '🧲', color: '#fb923c', href: 'pages/mot-designer.html'   },
    { key: 'laser-locking',  label: 'Laser Locking Guide',          kind: 'Guide',        icon: '🔐', color: '#f87171', href: 'pages/laser-locking.html'  },
    { key: 'lab-techniques', label: 'AMO Lab Operations Handbook',  kind: 'Guide',        icon: '🔬', color: '#34d399', href: 'pages/lab-techniques.html' },
    { key: 'polarimetry',    label: 'Polarimetry Simulator',        kind: 'Simulator',    icon: '🔭', color: '#e879f9', href: 'pages/polarimetry.html'    },
    { key: 'zernike',        label: 'Zernike Wavefront Lab',        kind: 'Simulator',    icon: '🌊', color: '#2dd4bf', href: 'pages/zernike.html'        },
    { key: 'cavity-qed',     label: 'Cavity QED Coupling Lab',      kind: 'Calculator',   icon: '💎', color: '#c084fc', href: 'pages/cavity-qed.html'     },
    { key: 'vacuum-systems',    label: 'Vacuum Systems Guide',      kind: 'Guide',        icon: '⚗️', color: '#22d3ee', href: 'pages/vacuum-systems.html'    },
    { key: 'tweezer-designer', label: 'Tweezer Array Design Lab',   kind: 'Design lab',   icon: '🔦', color: '#f59e0b', href: 'pages/tweezer-designer.html' },
  ],
  measure: [                  // Imaging / thermometry in the lab
    { key: 'imaging-calculator', label: 'Single-atom Imaging',    kind: 'Calculator', icon: '📷', color: '#34d399', href: 'pages/imaging-calculator.html' },
    { key: 'release-recapture',  label: 'Single-atom Temperature',kind: 'Simulator',  icon: '🎯', color: '#fb923c', href: 'pages/release-recapture.html'  },
    { key: 'tof-calculator',     label: 'MOT Temperature',        kind: 'Calculator', icon: '🌡️', color: '#38bdf8', href: 'pages/tof-calculator.html'     },
    { key: 'lab-calculators',    label: 'Quick Lab Console',      kind: 'Calculator', icon: '🧮', color: '#fbbf24', href: 'pages/lab-calculators.html'    },
    { key: 'absorption-imaging', label: 'Absorption Imaging Lab', kind: 'Imaging lab',icon: '🌑', color: '#818cf8', href: 'pages/absorption-imaging.html' },
  ],
  cooling: [                   // Laser cooling deep dives
    { key: 'laser-cooling',     label: 'Single-atom Cooling',      kind: 'Deep dive', icon: '❄️', color: '#60a5fa', href: 'pages/laser-cooling.html'     },
    { key: 'cooling-simulator', label: 'Laser Cooling Simulator',  kind: 'Simulator', icon: '🌡️', color: '#34d399', href: 'pages/cooling-simulator.html' },
  ],
  quantum: [                   // Quantum computing tools + learning
    { key: 'learn-quantum',      label: 'Quantum Computing Learning Path', kind: 'Learning path', icon: '🔵', color: '#c084fc', href: 'pages/learn-quantum.html' },
    { key: 'rydberg-calculator', label: 'Rydberg Blockade Lab',            kind: 'Calculator',    icon: '🔮', color: '#818cf8', href: 'pages/rydberg-calculator.html' },
    { key: 'fidelity-budget',    label: 'Rydberg Gate Error Budget',       kind: 'Calculator',    icon: '📊', color: '#f87171', href: 'pages/fidelity-budget.html' },
    { key: 'rb-explorer',        label: 'Randomized Benchmarking',        kind: 'Deep dive',     icon: '📈', color: '#c084fc', href: 'pages/rb-explorer.html' },
    { key: 'dd-playground',      label: 'Dynamical Decoupling',           kind: 'Simulator',     icon: '🛡️', color: '#4ade80', href: 'pages/dd-playground.html' },
    { key: 'remote-entanglement', label: 'Remote Entanglement',           kind: 'Deep dive',     icon: '🔗', color: '#0ea5e9', href: 'pages/remote-entanglement.html' },
  ],
  career: [                     // Industry / career navigation
    { key: 'amo-groups',     label: 'AMO Group Finder',          kind: 'Career map', icon: '🌍', color: '#4ade80', href: 'pages/amo-groups.html' },
    { key: 'paper-syllabus', label: 'AMO Paper Roadmap',         kind: 'Syllabus',   icon: '📚', color: '#818cf8', href: 'pages/paper-syllabus.html' },
    { key: 'qc-landscape',   label: 'Quantum Industry Map',      kind: 'Landscape',  icon: '💻', color: '#a78bfa', href: 'pages/qc-landscape.html' },
    { key: 'rb87-vs-yb171',  label: 'Rb vs Yb Qubit Comparison', kind: 'Deep dive',  icon: '⚖️', color: '#f59e0b', href: 'pages/rb87-vs-yb171.html' },
  ],
  learn: [                    // 14 entries → "Quantum Computing Learning Path — 14 topics"
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

// Derived, auto-computed — do not hand-maintain:
NAV.trapImageCool = [...NAV.measure, ...NAV.cooling];
NAV.tools = [...new Map([
  ...NAV.build,
  ...NAV.trapImageCool,
  ...NAV.quantum,
  ...NAV.career,
].map(item => [item.key || item.href, item])).values()];
NAV.industry = NAV.career;
```

`NAV.tools` (used for counts, global search indexing, and "all tools" listings) is auto-derived by flattening `build` + `measure` + `cooling` + `quantum` + `career` and de-duping by `key`. **Never hand-maintain `NAV.tools` — add new entries to the specific category array instead.** Each tool entry now also carries a `kind` field (e.g. `'Calculator'`, `'Guide'`, `'Simulator'`, `'Deep dive'`) used as a subtitle in the nav dropdown — set this when adding a tool.

The Learn Quantum dropdown count still updates automatically from `NAV.learn.length` — no manual string updates needed there.

**Known stale spot:** `home.html`'s hero stat ("14+ Interactive Tools") is a hand-typed number, not derived from `NAV.tools.length` — it does NOT auto-update and should be spot-checked whenever tools are added or removed (there are more than 14 in `NAV.tools` as of this writing).

---

## renderNav() — How Every Page Loads the Nav

Every page (except home.html) calls this at the end of `<body>`:

```html
<!-- sub-pages use root: '../' -->
<script src="../js/main.js?v=13"></script>
<script src="../css/styles.css?v=13"></script>  <!-- already in <head> -->
<script>
  renderNav({ active: 'page-key', root: '../' });
</script>

<!-- home.html uses root: '' -->
<script src="js/main.js?v=13"></script>
<script>
  renderNav({ active: 'home', root: '' });
</script>
```

**Cache busting:** The `?v=N` suffix forces browsers to reload files after changes. The current version is `v=13`. **Increment to `v=14` (then `v=15`, etc.) whenever you make significant changes to `main.js` or `styles.css`** so users don't get stale cached files. Use sed to update all pages at once — **include `404.html`, it has been missed before and drifted out of sync**:
```bash
sed -i '' 's/main\.js?v=13/main.js?v=14/g' pages/*.html home.html 404.html
sed -i '' 's/styles\.css?v=13/styles.css?v=14/g' pages/*.html home.html 404.html
```
Always grep-verify after bumping: `grep -roh 'main\.js?v=[0-9]*' pages/*.html home.html 404.html | sort -u` should return exactly one version string.

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
  <title>Tool Name — AMO Toolkit</title>
  <!-- + standard og:/twitter: meta tags, canonical link, ld+json — copy from a sibling page -->
  <link rel="stylesheet" href="../css/styles.css?v=13">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <!-- Chart.js if needed: -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
</head>
<body>
<div id="nav-root"></div>

<div class="page-wrap" id="main-content">
  <div class="page-hero" style="--page-color:#HEX;--page-bg:rgba(R,G,B,0.07);--page-border:rgba(R,G,B,0.2);">
    <div class="container page-hero-2col">
      <div class="page-hero-text">
        <div class="page-hero-eyebrow" style="background:rgba(R,G,B,0.08);border-color:rgba(R,G,B,0.2);color:#HEX;">🔬 Build 03 · Tool Name</div>
        <h1>Tool <span class="grad-text" style="--ga:#HEX1;--gb:#HEX2;">Name</span></h1>
        <p class="page-hero-desc">
          One- to two-sentence description of what the tool computes/simulates and why it matters.
        </p>
      </div>
      <div class="page-hero-anim" aria-hidden="true">
        <!-- optional inline animated SVG illustration -->
      </div>
    </div>
  </div>

  <div class="page-content">
    <h2 class="section-title"><span class="accent">01</span> Section Title</h2>
    <!-- sections, calculators, accordions, tabs, etc. -->
  </div>
</div>

  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" defer></script>
  <script src="../js/main.js?v=13"></script>
  <script>
    renderNav({ active: 'page-key', root: '../' });
    // page-specific JS here
  </script>
</body>
</html>
```

Notes on the current template (this evolved since the guide was first written):
- The hero is `.page-hero-2col` — a text column (`.page-hero-text`) plus an optional animated SVG illustration column (`.page-hero-anim`). The old single-column `.page-hero-inner` / `.page-eyebrow` / two `.page-tag` spans / `.page-title` pattern is deprecated; do not copy it into new pages.
- The eyebrow is now **one** pill (`.page-hero-eyebrow`) reading `"{icon} {Category} {NN} · {Tool Name}"` (e.g. `"🧲 Build 03 · MOT Designer"`), where `{Category}` is the NAV category (Build/Measure/Cooling/Quantum/Career) and `{NN}` is that tool's position within the category.
- The `<h1>` uses a `.grad-text` span for a two-color gradient highlight on part of the title, not a numbered `<span class="accent">01</span>` prefix — the numbered `.accent` prefix is used for **section titles inside** `.page-content`, not the page `<h1>` itself.
- Title tag and all social meta now say **"— AMO Toolkit"**, not "— AMO Career" (site rebrand; the repo/folder name `amo-career` did not change, only on-site branding and the custom domain `amotoolkit.com`).

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
Cards live in the `.tools-grid` inside `<section id="tools">` and are grouped/labeled by NAV category, not a flat list:
```html
<!-- Build 03. Tool Name -->
<a class="tool-card anim-in delay-N"
   href="pages/tool.html"
   style="--card-color:#HEX; --card-bg:rgba(R,G,B,0.08)">
  <span class="tool-card-num">BUILD 03</span>
  <div class="tool-card-icon">🔬</div>
  <h3 class="tool-card-name">Tool Name</h3>
  <p class="tool-card-desc">One to two sentence description.</p>
  <div class="tool-card-tags">
    <span class="chip">tag1</span>
    <span class="chip">tag2</span>
  </div>
  <div class="tool-card-cta">Open Tool →</div>
</a>
```
`.tool-card-num` reads `"{CATEGORY} {NN}"` — must match the tool's position in its `NAV` category array. The `home.html` footer also has one `.footer-links` column per category (Build / Measure & Cool / Quantum / Career) — add a matching `.footer-link` entry there too.

### 7. Scroll Reveal Animation
Add `class="anim-in delay-N"` (N = 1 to 9, in multiples of ~100ms delay) to any element that should animate in on scroll. Handled automatically by `main.js` IntersectionObserver.

---

## Adding a New Tool Page — Checklist

1. **Create** `pages/new-tool.html` using the page template above (`.page-hero-2col` structure, `.page-hero-eyebrow` pill, standard meta tags)
2. **Add to the right NAV category array** in `js/main.js` (`build`, `measure`, `cooling`, `quantum`, or `career`) — do NOT edit `NAV.tools` directly, it's auto-derived:
   ```javascript
   { key: 'new-tool', label: 'Tool Name', kind: 'Calculator', icon: '🔧', color: '#HEX', href: 'pages/new-tool.html' },
   ```
3. **Add a tool card** to `home.html` in the `.tools-grid`, numbered consistently with its NAV category position (e.g. `BUILD 11`)
4. **Add a footer link** to `home.html` in the matching category's `.footer-links` column
5. **Update** the `.section-desc` under "Browse by workflow, not by alphabet" only if the workflow framing itself changes (rare)
6. **Spot-check** the hero stat on `home.html` (currently a hand-typed "N+ Interactive Tools" — it does NOT auto-update from `NAV.tools.length`)
7. **Bump cache version**: update `styles.css?v=N` and `main.js?v=N` consistently across **all** of `pages/*.html`, `home.html`, **and `404.html`** (404.html has drifted out of sync before — always grep-verify, see Cache Busting section above)
8. **Update** `llms.txt` and `llms-full.txt` to describe the new tool (these two files are known to already be behind — refreshing them fully is a good periodic task, not just a per-tool add)
9. **Commit** and push to `main` → auto-deploys to GitHub Pages

---

## All Primary Tool Pages — Physics Summary

### 1. Atom Library (`atom-library.html`)
15 laser-coolable atoms in 4 family tabs (alkali, alkaline-earth, rare-earth, other). Table: mass, D1/D2 wavelengths, natural linewidth Γ, I_sat, recoil scale, Doppler temperature. US research groups per atom. Interactive family switching.

### 2. Lab Techniques (`lab-techniques.html`)
8 experimental techniques with deep-dive accordion sections (from thesis Ch. 6): laser cooling, MOT loading, evaporative cooling, optical tweezers, fluorescence imaging, absorption imaging, RF/microwave spectroscopy, optical lattices.

### 3. Rydberg Calculator (`rydberg-calculator.html`)
Principal quantum number n (30–120), atom species (Rb87, Cs133, Yb171, Sr88). Computes: Rydberg state lifetime τ ~ n³ (with BBR correction), C₆ coefficient (van der Waals, ∝ n¹¹), blockade radius R_b = (C₆/ℏΩ)^(1/6), gate fidelity estimate. Chart.js: τ and R_b vs n curves.

### 4. Imaging SNR Calculator (`imaging-calculator.html`)
7 atom species with D2 line data (Rb87, Cs133, Li6/7, Na23, K39/40). Inputs: NA, detuning Δ, saturation s, exposure time, camera type (EMCCD/sCMOS/Ideal). Computes: scattering rate R_sc, collection efficiency η, photon counts N_sig, SNR via full noise model (shot + read + dark + background), detection fidelity F via normCDF. Chart: SNR vs exposure time curve. Min exposure finder for SNR=10 and SNR=50.

### 5. TOF Thermometry (`tof-calculator.html`)
9 species (Rb85/87, Cs133, Li6/7, Na23, K39/40/41). Ballistic expansion law: σ²(t) = σ₀² + (k_BT/m)t². Temperature from linear regression of σ² vs t² data. Computes: de Broglie wavelength, peak density, phase-space density (BEC threshold at PSD ≥ 2.612), Doppler and recoil limits. Chart.js: σ(t) expansion curve + fit from data table.

### 6. MOT Designer (`mot-designer.html`)
5 species (Rb87, Cs133, Na23, Li7, K39). Section 01 MOT Calculator: damping α, spring κ, ω_MOT, capture velocity, Doppler temperature vs detuning Δ and saturation s. Section 02 Detuning Optimization (live chart). Section 03 Species at a Glance (comparison table). Section 04 the MOT-to-experiment cooling cascade (source → 3D MOT → cMOT → gray molasses/PGC → tweezer/lattice). No magnetic-trap (Ioffe-Pritchard) calculator despite the historical page title — renamed from "MOT & Magnetic Trap Designer" to "MOT Designer" since that content was never built.

### 7. Gate Fidelity Budget (`fidelity-budget.html`)
4 species (Rb87, Cs133, Yb171, Sr88). 8 error sources for Rydberg two-qubit gates: spontaneous emission εₛₑ = Γ_Ryd·t_gate, Doppler dephasing ε_D = ½(k·v_rms·t_gate)², laser phase noise ε_φ = π·Δν·t_gate, blockade leakage ε_blk = 1/(U/Ω)², SPAM ε_sp, atom loss ε_loss = t_gate/τ_trap, B-field dephasing ε_B = ½(μ_B·ΔB·t_gate/ℏ)², Rabi inhomogeneity ε_Ω = ½(π·δΩ/Ω/2)². Fidelity F = 1 − Σεᵢ. Color-coded meter (≥99.9% green). SOTA comparison: Evered 2023 (99.5%), Muniz 2025 (99.72% post-selected / 99.40% raw), approximate FTQC thresholds.

### 8. Release-Recapture (`release-recapture.html`)
Interactive simulator for single-atom tweezer thermometry. Atom released from trap, evolves under gravity + thermal velocity, then is recaptured if its energy is below the Gaussian trap depth. Chart: recapture probability vs release time. Assumes known waist/depth; not a direct trap-frequency measurement.

### 9. Lab Calculators (`lab-calculators.html`)
Large multi-section calculator suite organized in tabs:
- **Optics**: beam waist, Rayleigh range, NA, fiber coupling, telescope magnification, dBm↔mW, AOM shift, shot noise
- **Atomic physics**: photon recoil, Doppler temperature, single-recoil and scatter-heating scales, de Broglie wavelength, Zeeman shift, I_sat
- **Trap**: tweezer frequency ω_r = √(4U₀/mw₀²), Lamb-Dicke parameter η = k·x_zpf, cavity FSR, mode matching
- **Clebsch-Gordan**: CG coefficient table + decomposition for arbitrary j₁, j₂, m₁, m₂

### 10. Laser Locking (`laser-locking.html`)
Guide + interactive tool for saturated absorption spectroscopy (SAS), PDH locking, and offset locking. Subsections: SAS Doppler-free signal, crossover resonances, beat-note offset lock, PDH error signal derivation ε(ν), cavity finesse F = π√R/(1-R), linewidth δν_cav = FSR/F, PDH optical chain.

### 11. Zernike Polynomials (`zernike.html`)
Interactive wavefront aberration analyzer. OSA/ANSI Zernike polynomial Z_n^m(ρ,θ) = R_n^|m|(ρ)·Θ_m(θ). Coefficients slider for tip, tilt, defocus, astigmatism, coma, trefoil, spherical, etc. Canvas wavefront display. Strehl ratio computation. Application to SLM phase patterns for LG modes.

### 12. Polarimetry Explorer (`polarimetry.html`)
Stokes parameter visualization for polarization state characterization. Quarter-wave plate rotation analysis, degree of polarization, Poincaré sphere visualization. Applications to optical pumping setup.

### 13. Laser System Planner (`laser-planner.html`)
Design tool: pick an atom species, get the required laser beams (cooling, repump, imaging, Rydberg/clock as applicable) with wavelengths, a system block diagram, and which nonlinear-optics stages (SHG, frequency doubling) are needed to reach each wavelength from available diode/fiber laser lines.

### 14. Cavity QED Coupling Lab (`cavity-qed.html`)
Calculator for atom-cavity coupling: given cavity/atom parameters, computes single-photon coupling rate g, cavity decay κ, atomic decay γ, and derived figures of merit; charts coupling rates vs cavity finesse; classifies the system into strong/weak/bad-cavity coupling regimes with reference systems and a common-mistakes section.

### 15. Vacuum Systems Guide (`vacuum-systems.html`)
Reference guide covering why UHV matters for cold-atom experiments, the pressure landscape (rough/high/ultra-high vacuum regimes), the pumping chain (roughing, turbo, ion, getter pumps), bake-out procedure, materials/connections (conflat flanges, leak checking), how to read vacuum gauges, and a practical setup checklist.

### 16. Tweezer Array Design Lab (`tweezer-designer.html`)
Design lab for optical tweezer arrays: single-tweezer trap physics (waist, depth, trap frequency), a trap-parameter calculator, array geometry planning (spacing, SLM/AOD generation), and a species/wavelength reference table for common tweezer-trapped atoms.

### 17. Absorption Imaging Lab (`absorption-imaging.html`)
Companion to the fluorescence Imaging SNR Calculator, focused on absorption imaging: how it works (Beer-Lambert optical density), an imaging calculator section, species reference table, and practical considerations (resonant vs off-resonant, saturation effects, high-intensity imaging).

### 18. Randomized Benchmarking (`rb-explorer.html`)
**Not about rubidium** — despite the filename, this is a deep-dive on the RB gate-fidelity characterization protocol: the SPAM problem, Clifford group twirling, the exponential decay model F(m) = A·p^m + B, extracting average error rate r_C = (d−1)(1−p)/d (with 1- and 2-qubit special cases), interleaved RB (IRB) for isolating a specific gate's error, and practical design choices. Includes working calculators for standard RB and interleaved RB, plus SOTA neutral-atom results.

### 19. Dynamical Decoupling (`dd-playground.html`)
Interactive playground for qubit coherence and π-pulse decoupling sequences. Models free-induction decay under Gaussian dephasing W_FID(T) = e^(−(T/T₂*)²) vs Markovian/exponential decay W_FID(T) = e^(−T/T₂*), and shows how DD sequences (Hahn echo, CPMG, etc.) act as spectral filter functions that extend coherence by refocusing low-frequency noise.

### 20. Remote Entanglement (`remote-entanglement.html`)
Deep dive on photon-mediated entanglement between physically separated qubits/tweezer modules — motivated by the idea that connecting independent quantum processors (not single-qubit fidelity) is the scaling bottleneck. Covers heralded entanglement protocols, photon collection/loss budgets, and reference experimental results linking remote atoms via optical fiber/free-space photon links.

### 21. AMO Group Finder (`amo-groups.html`)
Career-mapping tool: a directory of 100+ AMO research groups (a "Featured Mapped Directory" of the most relevant groups plus a broader "Global Watchlist"), with a "Highest-Priority Shortlists" section for narrowing down where to apply for grad school/postdoc positions based on subfield (ultracold atoms, Rydberg, cavity QED, precision measurement, etc.).

### 22. AMO Paper Roadmap (`paper-syllabus.html`)
"53 Papers That Build an AMO Career" — a curated reading list/syllabus organized by career stage (undergrad entry, grad year 1, advanced grad, postdoc/career), meant to guide a physicist through the foundational and current literature of the field in order.

### Formula Regression Tests
Run `python3 tests/formula_regression.py` after formula edits. The tests check recoil conventions, imaging-fidelity mapping, beat-note RF prefactors, QC claim qualification, release-recapture wording, presence of key site UX features, and Rb/Yb comparison-panel fact boundaries (`test_rb_yb_panel_fact_boundaries`, added since this section was last verified).

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
- **`laser-cooling.html`** — "Single-atom Cooling" deep dive; narrative/derivation companion to `cooling-simulator.html`, same NAV `cooling` category
- **`rb87-vs-yb171.html`** — Side-by-side platform comparison (Rb87 alkali vs Yb171 alkaline-earth-like) for choosing a qubit species; lives under the `career` NAV category as a "deep dive"
- Clebsch-Gordan coefficients live inside **`lab-calculators.html`**
- PDH error-signal material lives inside **`laser-locking.html`**
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

- **Cache busting:** After any change to `main.js` or `styles.css`, increment `?v=N` in **every** page (use sed) — including `404.html`, which has its own `<link>`/`<script>` tags and has previously drifted out of sync (found at `v=8` while the rest of the site was at `v=13`; fixed, but re-check next time you bump the version).
- **Button text color:** Global `button { color: inherit; }` is set — do not add browser-default buttons without explicit color.
- **Formula boxes:** Never add `white-space: pre` or `font-family: var(--mono)` to `.formula-box` — breaks KaTeX rendering.
- **Page-local formula-box styles:** Some pages have `<style>.formula-box { background:...; border:...; }</style>` for custom colors. Keep only `background`, `border`, `border-radius`, `padding` — never font or white-space overrides.
- **Tool counts do NOT auto-update:** Unlike `NAV.learn.length` (used for the Learn Quantum dropdown count), the homepage hero stat ("N+ Interactive Tools") is a hand-typed number in `home.html` — it will silently go stale as tools are added/removed. Spot-check it whenever `NAV` changes. There is no `NAV.tools.length` string anywhere in the codebase to grep for; `NAV.tools` is a derived array (see NAV Object section above), not something referenced live in the DOM for counts.
- **Site branding vs repo name:** The live site and all page titles/meta say **"AMO Toolkit"** (custom domain `amotoolkit.com`, see `CNAME`) — the repo/folder is still named `amo-career` and this file's own title still says "AMO Career" for historical/identification reasons. Don't "fix" page titles back to "AMO Career" — that would be reverting an intentional rebrand.
- **`llms.txt` / `llms-full.txt` drift:** These describe a "13 tools" snapshot from before 10 new pages were added. They are not automatically regenerated — treat them as documentation debt, not ground truth, until manually refreshed.
- **home.html nav:** Uses `root: ''` (empty string, not `'../'`).
- **index.html:** Only a redirect — never edit it.
