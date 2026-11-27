# AMO Career — Claude Code Project Guide

> Read this file first. It replaces the need to open any HTML file to understand the project.

**Before restructuring navigation, route-panels, or section order on any page**, read `docs/site-philosophy.md` (the design reasoning behind page flow — when route-cards must be 1:1 with tabs vs. can be conceptual, the "no phantom features" rule, theory-before-tool ordering, etc.) and the matching file in `docs/page-notes/<slug>.md` if one exists (per-page purpose, flow, and the specific review decisions already made for it — including things deliberately left as-is, so they don't get re-litigated).

**Live site:** https://amotoolkit.com/
**Author:** Saumitra Phatak — Purdue Physics PhD, Hood Lab (ultracold atoms / optical tweezers); now a Quantum Engineer at Atom Computing. Site was built during his graduate years.
**Purpose:** Career toolkit for AMO physicists — interactive calculators, lab technique guides, quantum computing context, and an educational quantum fundamentals section.

---

## Tech Stack (Critical Constraints)

- **Pure static HTML / CSS / Vanilla JS.** No npm, no node, no build step whatsoever.
- **No package manager on this machine** — do not suggest `npm install`, `pip install`, etc.
- **Libraries are vendored, not installed** (since 2026-11-27; see `vendor/README.md`). No build step: the files are committed as published.
  - Chart.js `4.4.3` — `vendor/chart.js/4.4.3/chart.umd.js` — all interactive charts and plots
  - KaTeX `0.16.11` + auto-render — `vendor/katex/0.16.11/` (byte-identical to the old CDN copies; `.woff2` fonts only)
  - Still from CDNs: Google Fonts (Source Serif 4, Inter, JetBrains Mono) and Plotly on `polarimetry.html` only.
  - To upgrade a library, add a new version folder, switch every page, update `sw.js` `CORE_ASSETS`, then retire the old folder.
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
│   ├── main.js             # SINGLE shared JS file — NAV data, renderNav(), global search, all shared logic
│   ├── search-sections.js  # GENERATED section-heading index for search (tests/browser/build-section-index.js); loaded on first search
│   ├── hero3d.js           # home.html only — live 3D Li+Cs tweezer-array hero (raw WebGL, no library)
│   ├── orbit3d.js          # shared drag-to-rotate helper for 3D figures (opt-in per page, not in main.js)
│   ├── globe3d.js          # shared rotatable dotted-Earth globe (amo-groups, qc-landscape); needs orbit3d.js
│   ├── collection3d.js     # imaging-calculator only — emission pattern + NA collection cone; needs orbit3d.js
│   ├── cavity3d.js         # cavity-qed only — TEM₀₀ standing wave + atom position; needs orbit3d.js
│   ├── sitemap3d.js        # start-here only — 3D constellation built from the page's own lists; needs orbit3d.js
│   ├── cloud3d.js          # release-recapture + tof-calculator — true-to-scale 3D view of released atoms; needs orbit3d.js
│   ├── atom-explorer.js    # atom-library only — Periodic Table Explorer (table, lenses, inspector); reads #atom-table
│   ├── surface3d.js        # zernike only — rotatable shaded height-map surface (wavefront W and PSF); needs orbit3d.js
│   ├── rydberg3d.js        # rydberg-calculator only — 3D tweezer array with the blockade sphere from the page's R_b; needs orbit3d.js
│   ├── motion.js           # AMOMotion.loop(): pause button / offscreen stop / reduced motion for looping canvases
│   ├── canvas-ink.js       # AMOInk.wrap(ctx): light-theme canvas inks → dark-theme inks as they're set (opt-in per page)
│   ├── versus.js           # comparison pages: Tug of war (from the Edge column) + Race replay (from the Section-03 timelines)
│   ├── vs-ions.js          # quantinuum-vs-ionq only — laser QCCD vs electronic control 3D scene; needs orbit3d.js
│   ├── vs-lattice.js       # google-vs-ibm only — square vs heavy-hex lattice lab (routing / SWAP counts; keyboard: Tab, arrows, Enter)
│   ├── vs-photons.js       # psiquantum-vs-xanadu only — photon loss-budget chain
│   ├── vs-erasure.js       # rb87-vs-yb171 only — "throw errors at a code" (e + 2t ≤ d − 1)
│   ├── syllabus3d.js       # paper-syllabus.html only — 3D "time tower" of the papers; needs orbit3d.js
│   └── tweezer3d.js        # tweezer-designer.html only — true-to-scale 3D tweezer-array view (raw WebGL)
├── tests/
│   └── formula_regression.py  # Physics/content regression checks
├── assets/cooling/         # GIFs (gray-molasses-cooling, resolved-sideband-cooling) used by tool pages
└── pages/                  # All tool and content pages (32 files)
    ├── atom-library.html       # Atomic Species Selector
    ├── laser-planner.html      # Laser System Planner
    ├── mot-designer.html       # MOT Designer
    ├── control-systems.html    # Experiment Control Systems (Build 07)
    ├── automation.html         # Automating the Experiment (Build 10)
    ├── teach.html              # Teach with AMO Toolkit: 14-week course + problem sets (not in NAV stories)
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
    ├── virtual-lab.html        # Virtual Tweezer Lab (load → image → rearrange → verify → entangle → readout, Monte Carlo)
    ├── learn-quantum.html      # Quantum Computing Learning Path (15 topics, one page)
    ├── decoherence-lab.html    # Decoherence Lab (T1/T2/T2* Bloch-sphere + signal sim)
    ├── rydberg-calculator.html # Rydberg Blockade Lab
    ├── fidelity-budget.html    # Rydberg Gate Error Budget
    ├── rb-explorer.html        # Randomized Benchmarking (NOT rubidium — RB as in gate-fidelity characterization)
    ├── dd-playground.html      # Dynamical Decoupling
    ├── remote-entanglement.html# Remote Entanglement (photon-mediated qubit linking)
    ├── atom-processor.html     # Zoned Atom Processor (circuit → AOD trips → global Rydberg pulses, live state vector)
    ├── amo-groups.html         # AMO Group Finder (career map, 98 mapped groups + watchlist)
    ├── paper-syllabus.html     # AMO Paper Roadmap (55 papers)
    ├── qc-landscape.html       # Quantum Industry Map
    ├── rb87-vs-yb171.html      # Rb vs Yb Qubit Comparison
    ├── quantinuum-vs-ionq.html # Quantinuum vs IonQ (trapped-ion comparison)
    ├── google-vs-ibm.html      # Google vs IBM (superconducting comparison)
    ├── psiquantum-vs-xanadu.html # PsiQuantum vs Xanadu (photonic comparison)
    └── start-here.html         # Site Map & Start Here (navigation index; not in NAV.tools)
```

**Page count is 40** in `pages/` as of 2026-11-25, after `follow-one-atom.html`, `apparatus.html` and `records.html` (outside the NAV stories); 37 on 2026-11-22, after `teach.html` (course plan, not part of the NAV stories) was added; 36 after `automation.html` (Build 10); 35 earlier the same day, after `control-systems.html` (Build 07); 34 as of 2026-11-19, after `virtual-lab.html` and `atom-processor.html` were added (the history: was 19 when this file was first written, grew to 27 with 10 new pages — laser-planner, cavity-qed, vacuum-systems, tweezer-designer, absorption-imaging, rb-explorer, dd-playground, remote-entanglement, amo-groups, paper-syllabus — then to 28 with `decoherence-lab.html`, and now to 32 with 4 more: `quantinuum-vs-ionq.html`, `google-vs-ibm.html`, `psiquantum-vs-xanadu.html` (company-comparison deep dives) and `start-here.html` (a site map / recommended-order index, not part of `NAV.tools`). `llms.txt`/`llms-full.txt` were refreshed alongside this note (2026-09-28) and now list all 32 pages/tools; re-check both any time a page is added or removed so they don't drift stale again.

---

## The NAV Object — Single Source of Truth

All navigation is driven by the `NAV` object at the top of `js/main.js`. It is now organized into **workflow categories** (not a single flat tool list) so the nav and homepage can group tools by "job to be done" rather than alphabetically. **Every nav group is a numbered story (2026-11-21):** Build (`NAV.build`, building a lab, 10 steps) → Trap, Image & Cool (`NAV.trapImageCool`, a first experiment, 8) → Quantum Computing (`NAV.quantum`, building a quantum computer, 8) → Career & Literature (`NAV.career`, starting a career, 7). Each entry has `step`, a sentence-case `label` that is the step ("Design a MOT") and `tool`, the page's own name ("MOT Designer"). The nav shows step numbers with the tool name underneath; `initStoryTrail()` (driven by `STORIES`) adds a step-N-of-M trail with previous/next links to each page, and the last step of one story opens the next. `NAV.measure`/`NAV.cooling` are now derived from `NAV.trapImageCool`. Changing a story means updating, together: the NAV array, the numbered cards and footer columns in `home.html`, the matching `start-here.html` section, and the page eyebrows (`test_build_story_order` checks all four stories).

**To add a new tool: add one entry to the right category array** (`build`, `measure`, `cooling`, `quantum`, or `career`). `NAV.tools` is auto-derived — nothing else needs to change.

```javascript
const NAV = {
  // Build reads as one story, in the order a lab actually gets built: choose the atom, get its lasers,
  // pump down, lock, set polarizations, catch atoms in a MOT, wire up the control system, trap them in tweezers, clean up the optics,
  // add a cavity, then keep it all running. `label` is the step; `tool` is the page's own name.
  build: [
    { key: 'atom-library',     step: 1,  label: 'Select an atomic species',       tool: 'Atomic Species Selector',     kind: 'Reference',   icon: '⚛️', color: '#a13c1c', href: 'pages/atom-library.html'     },
    { key: 'laser-planner',    step: 2,  label: 'Pick lasers for that atom',      tool: 'Laser System Planner',        kind: 'Design tool', icon: '💡', color: '#2c4a63', href: 'pages/laser-planner.html'    },
    { key: 'vacuum-systems',   step: 3,  label: 'Pump down to ultra-high vacuum', tool: 'Vacuum Systems Guide',        kind: 'Guide',       icon: '⚗️', color: '#3f5d3f', href: 'pages/vacuum-systems.html'   },
    { key: 'laser-locking',    step: 4,  label: 'Lock the lasers to the atom',    tool: 'Laser Locking Guide',         kind: 'Guide',       icon: '🔐', color: '#a13c1c', href: 'pages/laser-locking.html'    },
    { key: 'polarimetry',      step: 5,  label: 'Analyze the polarization',       tool: 'Polarimetry Simulator',       kind: 'Simulator',   icon: '🔭', color: '#2c4a63', href: 'pages/polarimetry.html'      },
    { key: 'mot-designer',     step: 6,  label: 'Design a MOT',                   tool: 'MOT Designer',                kind: 'Calculator',  icon: '🧲', color: '#3f5d3f', href: 'pages/mot-designer.html'     },
    { key: 'control-systems',  step: 7,  label: 'Control the experiment',         tool: 'Experiment Control Systems',  kind: 'Guide',       icon: '🎛️', color: '#2c4a63', href: 'pages/control-systems.html' },
    { key: 'tweezer-designer', step: 8,  label: 'Assemble a tweezer array',       tool: 'Tweezer Array Design Lab',    kind: 'Design lab',  icon: '🔦', color: '#a13c1c', href: 'pages/tweezer-designer.html' },
    { key: 'zernike',          step: 9,  label: 'Get rid of aberrations',         tool: 'Zernike Wavefront Lab',       kind: 'Simulator',   icon: '🌊', color: '#2c4a63', href: 'pages/zernike.html'          },
    { key: 'automation',       step: 10, label: 'Automate the experiment',        tool: 'Automating the Experiment',   kind: 'Guide',       icon: '🤖', color: '#0f6b5f', href: 'pages/automation.html'       },
    { key: 'cavity-qed',       step: 11, label: 'Couple atoms to a cavity',       tool: 'Cavity QED Coupling Lab',     kind: 'Calculator',  icon: '💎', color: '#3f5d3f', href: 'pages/cavity-qed.html'       },
    { key: 'lab-techniques',   step: 12, label: 'Run the lab day to day',         tool: 'AMO Lab Operations Handbook', kind: 'Guide',       icon: '🔬', color: '#a13c1c', href: 'pages/lab-techniques.html'   },
  ],
  // Trap, Image & Cool continues the story with a first experiment: cool and image a cloud, then one atom, then run the cycle.
  trapImageCool: [
    { key: 'cooling-simulator',  step: 1,  label: 'Cool atoms with laser light',          tool: 'Laser Cooling Simulator', kind: 'Simulator', icon: '❄️', color: '#a13c1c', href: 'pages/cooling-simulator.html' },
    { key: 'absorption-imaging', step: 2,  label: 'Image the atom cloud',                 tool: 'Absorption Imaging Lab',  kind: 'Imaging lab', icon: '🌑', color: '#2c4a63', href: 'pages/absorption-imaging.html' },
    { key: 'tof-calculator',     step: 3,  label: 'Measure the cloud’s temperature',      tool: 'MOT Temperature',         kind: 'Calculator', icon: '🌡️', color: '#3f5d3f', href: 'pages/tof-calculator.html' },
    { key: 'imaging-calculator', step: 4,  label: 'See a single atom',                    tool: 'Single-atom Imaging',     kind: 'Calculator', icon: '📷', color: '#a13c1c', href: 'pages/imaging-calculator.html' },
    { key: 'release-recapture',  step: 5,  label: 'Measure a single atom’s temperature',  tool: 'Single-atom Temperature', kind: 'Simulator', icon: '🎯', color: '#2c4a63', href: 'pages/release-recapture.html' },
    { key: 'laser-cooling',      step: 6,  label: 'Cool a single atom to its ground state', tool: 'Single-atom Cooling',     kind: 'Deep dive', icon: '🧊', color: '#3f5d3f', href: 'pages/laser-cooling.html' },
    { key: 'virtual-lab',        step: 7,  label: 'Run a full experimental cycle',        tool: 'Virtual Tweezer Lab',     kind: 'Simulator', icon: '🧩', color: '#a13c1c', href: 'pages/virtual-lab.html' },
    { key: 'lab-calculators',    step: 8,  label: 'Do the everyday lab math',             tool: 'Quick Lab Console',       kind: 'Calculator', icon: '🧮', color: '#2c4a63', href: 'pages/lab-calculators.html' },
  ],
  // Quantum Computing turns the trapped atoms into a processor: qubits, coherence, gates, errors, circuits, then links.
  quantum: [
    { key: 'learn-quantum',       step: 1,  label: 'Learn how qubits work',                tool: 'Quantum Computing Learning Path', kind: 'Learning path', icon: '🔵', color: '#a13c1c', href: 'pages/learn-quantum.html' },
    { key: 'decoherence-lab',     step: 2,  label: 'Watch a qubit lose coherence',         tool: 'Decoherence Lab',                 kind: 'Deep dive', icon: '🌀', color: '#2c4a63', href: 'pages/decoherence-lab.html' },
    { key: 'dd-playground',       step: 3,  label: 'Protect qubits with decoupling pulses',    tool: 'Dynamical Decoupling',            kind: 'Simulator', icon: '🛡️', color: '#3f5d3f', href: 'pages/dd-playground.html' },
    { key: 'rydberg-calculator',  step: 4,  label: 'Entangle atoms with Rydberg blockade', tool: 'Rydberg Blockade Lab',            kind: 'Calculator', icon: '🔮', color: '#a13c1c', href: 'pages/rydberg-calculator.html' },
    { key: 'fidelity-budget',     step: 5,  label: 'Budget the gate errors',               tool: 'Rydberg Gate Error Budget',       kind: 'Calculator', icon: '📊', color: '#2c4a63', href: 'pages/fidelity-budget.html' },
    { key: 'rb-explorer',         step: 6,  label: 'Benchmark the gates',                  tool: 'Randomized Benchmarking',         kind: 'Deep dive', icon: '📈', color: '#3f5d3f', href: 'pages/rb-explorer.html' },
    { key: 'atom-processor',      step: 7,  label: 'Run a circuit on moving atoms',        tool: 'Zoned Atom Processor',            kind: 'Simulator', icon: '🎛️', color: '#a13c1c', href: 'pages/atom-processor.html' },
    { key: 'remote-entanglement', step: 8,  label: 'Link processors with photons',         tool: 'Remote Entanglement',             kind: 'Deep dive', icon: '🔗', color: '#2c4a63', href: 'pages/remote-entanglement.html' },
  ],
  // Career & Literature: read the field, find a group, map the industry, compare the platforms.
  career: [
    { key: 'paper-syllabus',       step: 1,  label: 'Read the papers that built the field', tool: 'AMO Paper Roadmap',         kind: 'Syllabus', icon: '📚', color: '#a13c1c', href: 'pages/paper-syllabus.html' },
    { key: 'amo-groups',           step: 2,  label: 'Find a research group',                tool: 'AMO Group Finder',          kind: 'Career map', icon: '🌍', color: '#2c4a63', href: 'pages/amo-groups.html' },
    { key: 'qc-landscape',         step: 3,  label: 'Map the quantum industry',             tool: 'Quantum Industry Map',      kind: 'Landscape', icon: '💻', color: '#3f5d3f', href: 'pages/qc-landscape.html' },
    { key: 'rb87-vs-yb171',        step: 4,  label: 'Compare neutral-atom qubits',          tool: 'Rb vs Yb Qubit Comparison', kind: 'Deep dive', icon: '⚖️', color: '#a13c1c', href: 'pages/rb87-vs-yb171.html' },
    { key: 'quantinuum-vs-ionq',   step: 5,  label: 'Compare trapped-ion companies',        tool: 'Quantinuum vs IonQ',        kind: 'Deep dive', icon: '🔗', color: '#2c4a63', href: 'pages/quantinuum-vs-ionq.html' },
    { key: 'google-vs-ibm',        step: 6,  label: 'Compare superconducting companies',    tool: 'Google vs IBM',             kind: 'Deep dive', icon: '🖥️', color: '#3f5d3f', href: 'pages/google-vs-ibm.html' },
    { key: 'psiquantum-vs-xanadu', step: 7,  label: 'Compare photonic companies',           tool: 'PsiQuantum vs Xanadu',      kind: 'Deep dive', icon: '💡', color: '#a13c1c', href: 'pages/psiquantum-vs-xanadu.html' },
  ],
  learn: [
    { key: 'bloch-sphere',       label: 'Bloch Sphere',          icon: '🔵',  href: 'pages/learn-quantum.html#bloch'        },
    { key: 'superposition',      label: 'Superposition',         icon: '〰️', href: 'pages/learn-quantum.html#superposition' },
    { key: 'rabi-oscillations',  label: 'Rabi Oscillations',     icon: '🌀',  href: 'pages/learn-quantum.html#rabi'         },
    { key: 'quantum-gates',      label: 'Quantum Gates',         icon: '⚡',  href: 'pages/learn-quantum.html#gates'        },
    { key: 'measurement',        label: 'Measurement',           icon: '📏',  href: 'pages/learn-quantum.html#measurement'  },
    { key: 'optical-pumping',    label: 'Optical Pumping',       icon: '💡',  href: 'pages/learn-quantum.html#optical-pumping' },
    { key: 'hyperfine-qubits',   label: 'Hyperfine Qubits',      icon: '🔑',  href: 'pages/learn-quantum.html#hyperfine'       },
    { key: 'entanglement',       label: 'Entanglement',          icon: '🔗',  href: 'pages/learn-quantum.html#entanglement' },
    { key: 'rydberg-atoms',      label: 'Rydberg Atoms',         icon: '⚛️',  href: 'pages/learn-quantum.html#rydberg'      },
    { key: 'two-qubit-gates',    label: 'Two-Qubit Gates',       icon: '🔀',  href: 'pages/learn-quantum.html#twoqubit'     },
    { key: 'decoherence',        label: 'Decoherence',           icon: '📉',  href: 'pages/learn-quantum.html#decoherence'  },
    { key: 'quantum-algorithms', label: 'Quantum Algorithms',    icon: '⚙️',  href: 'pages/learn-quantum.html#algorithms'   },
    { key: 'analog-sim',         label: 'Analog Simulation',     icon: '🔬',  href: 'pages/learn-quantum.html#analog-sim'   },
    { key: 'qec',                label: 'Error Correction',      icon: '🛡️',  href: 'pages/learn-quantum.html#qec'            },
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
<div id="amo-nav-ready" hidden></div>   <!-- right after the renderNav script: see Transitions below -->

<!-- home.html uses root: '' -->
<script src="js/main.js?v=13"></script>
<script>
  renderNav({ active: 'home', root: '' });
</script>
```

**Cache busting:** The `?v=N` suffix forces browsers to reload files after changes. As of 2026-11-22 the live values are `main.js?v=54` and `styles.css?v=37` on all 39 HTML files (home, 404 and the 37 pages) — the `v=13` in the templates and sed lines in this file is illustrative, so grep for the live value before bumping. Page-local scripts carry their own `?v=N` and are bumped only where referenced: `hero3d.js?v=2` (home.html), `orbit3d.js?v=2` (learn-quantum, decoherence-lab, dd-playground, tweezer-designer, mot-designer, amo-groups, qc-landscape, paper-syllabus), `globe3d.js?v=2` (amo-groups, qc-landscape), `syllabus3d.js?v=2` (paper-syllabus), `tweezer3d.js?v=1` (tweezer-designer), `collection3d.js?v=1` (imaging-calculator), `cavity3d.js?v=1` (cavity-qed), `sitemap3d.js?v=3` (start-here), `cloud3d.js?v=1` (release-recapture, tof-calculator), `rydberg3d.js?v=1` (rydberg-calculator), `surface3d.js?v=1` (zernike), `atom-explorer.js?v=1` (atom-library), `motion.js?v=2` (learn-quantum, dd-playground, decoherence-lab, rb87-vs-yb171, mot-designer, zernike, cooling-simulator, laser-locking, imaging-calculator, vacuum-systems, lab-techniques, laser-cooling, rydberg-calculator, remote-entanglement, cavity-qed, fidelity-budget), `canvas-ink.js?v=2` (atom-library, zernike, cooling-simulator, rb-explorer, laser-locking, fidelity-budget, imaging-calculator, vacuum-systems, lab-calculators, lab-techniques, laser-cooling, rydberg-calculator). Comparison pages: `versus.js?v=3` (all four vs pages), `vs-ions.js?v=1`, `vs-lattice.js?v=3`, `vs-photons.js?v=1`, `vs-erasure.js?v=2` (one each), and `orbit3d.js?v=2` on quantinuum-vs-ionq. `orbit3d.js?v=2` is now also on imaging-calculator, cavity-qed, start-here, release-recapture, tof-calculator, rydberg-calculator and zernike. **Increment to `v=14` (then `v=15`, etc.) whenever you make significant changes to `main.js` or `styles.css`** so users don't get stale cached files. Use sed to update all pages at once — **include `404.html`, it has been missed before and drifted out of sync**:
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
  <link rel="stylesheet" href="../vendor/katex/0.16.11/katex.min.css">
  <!-- Chart.js if needed: -->
  <script src="../vendor/chart.js/4.4.3/chart.umd.js"></script>
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

  <script src="../vendor/katex/0.16.11/katex.min.js" defer></script>
  <script src="../vendor/katex/0.16.11/contrib/auto-render.min.js" defer></script>
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
- The eyebrow is now **one** pill (`.page-hero-eyebrow`) reading `"{icon} {Category} {NN} · {Tool Name}"` (e.g. `"🧲 Build 03 · MOT Designer"`), where `{Category}` is the NAV category (Build/Measure/Cooling/Quantum/Career) and `{NN}` is that tool's position within the category. **Since 2026-11-21 the eyebrow carries the story step, not the tool name** (e.g. `"🧲 Build 06 · Design a MOT"`, `"🔗 Quantum 08 · Link processors with photons"`), while the `<h1>` keeps the tool name.
- The `<h1>` uses a `.grad-text` span for a two-color gradient highlight on part of the title (defined in styles.css only since 2026-11-21; before that it rendered as plain text. Both ends are mixed toward the theme's text colour so any `--ga`/`--gb` stays readable), not a numbered `<span class="accent">01</span>` prefix — the numbered `.accent` prefix is used for **section titles inside** `.page-content`, not the page `<h1>` itself.
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
`.tool-card-num` reads `"{CATEGORY} {NN}"` — must match the tool's position in its `NAV` category array, **and the cards must sit in the grid in that same ascending order** (BUILD 01→10, then TRAP 01→07 = `NAV.measure` + `NAV.cooling`, then QC 01→06 = `NAV.quantum` minus `learn-quantum`, which has its own home section; CAREER cards live in the separate career row). Before 2026-09-26 the badges were right but the cards were interleaved (BUILD 01, BUILD 05, QC 01, TRAP 02 …) and TRAP 06 (`laser-cooling.html`) was missing — see `docs/navigation-audit-2026-09-26.md`.

The `home.html` footer has 3 `.footer-links` columns whose names match the nav's top-level menus: **Build** (all 10 `build` tools), **Trap, Image & Cool** (`NAV.measure` + `NAV.cooling`, 7 tools), and **Quantum Computing & Career** (`NAV.quantum` + `NAV.career`, 14 tools); the brand block links to the Site Map. (Before 2026-09-26 the columns were a separate, mismatched "Measure & QC" / "Learn & Career" split.) The footer deliberately stays a complete index — every tool has exactly one footer link.

**Guided Paths (home `#paths`) and the Site Map share data — keep them in sync.** Each home `.path-card` shows a one-line summary plus a "See full path →" link to `pages/start-here.html#path-…`, and carries a `data-steps="pages/a.html,pages/b.html,…"` attribute. `initPathConceptMap()` in `main.js` builds the concept-map graph from `data-steps` (falling back to `.path-step[href]` links). The full 4-step lists live in `start-here.html`. Changing a path means editing **both** the `data-steps` attribute and the start-here list. (Removing the step links without `data-steps` once collapsed the concept map to a single node labelled "null" — commit `e9fd8c3`.)

### 7. Scroll Reveal Animation
Add `class="anim-in delay-N"` (N = 1 to 9, in multiples of ~100ms delay) to any element that should animate in on scroll. Handled automatically by `main.js` IntersectionObserver.

---

## Adding a New Tool Page — Checklist

1. **Create** `pages/new-tool.html` using the page template above (`.page-hero-2col` structure, `.page-hero-eyebrow` pill, standard meta tags). Include the transition hooks: `<link rel="expect" href="#amo-nav-ready" blocking="render">` right after the styles.css link, and `<div id="amo-nav-ready" hidden></div>` right after the `renderNav(...)` script (see Known Issues → Transitions)
2. **Add to the right NAV category array** in `js/main.js` (`build`, `measure`, `cooling`, `quantum`, or `career`) — do NOT edit `NAV.tools` directly, it's auto-derived:
   ```javascript
   { key: 'new-tool', label: 'Tool Name', kind: 'Calculator', icon: '🔧', color: '#HEX', href: 'pages/new-tool.html' },
   ```
3. **Add a tool card** to `home.html` in the `.tools-grid`, numbered consistently with its NAV category position (e.g. `BUILD 11`) **and placed in the grid at that position** (cards display in badge order)
4. **Add a footer link** to `home.html` in the matching `.footer-links` column (Build / Trap, Image & Cool / Quantum Computing & Career — see the Home Page Tool Cards section above)
4b. **Add a line to `pages/start-here.html`** in the matching category section (and, if it belongs in a guided path, update both that path's list there and the home card's `data-steps`)
5. **Update** the `.section-desc` under "Browse by workflow, not by alphabet" only if the workflow framing itself changes (rare)
6. **Spot-check** the hero stat fallback on `home.html` — the live number auto-updates from `NAV.tools.length` via `updateHeroStats()`, but the hand-typed no-JS fallback in the HTML should be kept roughly in sync
7. **Bump cache version**: update `styles.css?v=N` and `main.js?v=N` consistently across **all** of `pages/*.html`, `home.html`, **and `404.html`** (404.html has drifted out of sync before — always grep-verify, see Cache Busting section above)
8. **Update** `llms.txt` and `llms-full.txt` to describe the new tool (these two files are known to already be behind — refreshing them fully is a good periodic task, not just a per-tool add)
9. **Commit** and push to `main` → auto-deploys to GitHub Pages

---

## All Primary Tool Pages — Physics Summary

### 1. Atom Library (`atom-library.html`)
15 isotopes of 9 elements, organized around a **Periodic Table Explorer** (`js/atom-explorer.js`, 2026-09-29).
- **Table.** A full 118-element table; the nine library elements are buttons. Symbols and names come from TeX Live `nucleardata` elementlist.csv, embedded at build time.
- **Summary.** The selected element sits in the table's own gap (periods 1–3, groups 3–12) with isotope pills and key numbers.
- **"Colour by" lenses.** Family, cooling-light colour, T_D, Γ, recoil, hyperfine, statistics, magnetic moment; each has a physics caption and a text list of the values.
- **Inspector.** Energy-level diagram (the old `drawLevelDiagram`, whose markup had gone missing), family note, the per-element notes/data sheets (formerly the family tabs) and research groups (formerly a separate list).
- **Rest of the page.** Compare mode (reuses `selectForCompare`/`updateComparePanel`, now with isotope pickers), then the data table (isotope cells open the explorer), charts and resources.
- **Single source.** Every number is read from `#atom-table`; only the ground-state magnetic moments live in `LIB`.
- **Deep links.** `#Rb-87` and similar open an isotope.

### 2. AMO Lab Operations Handbook (`lab-techniques.html`)
8 experimental techniques with deep-dive accordion sections (from thesis Ch. 6): laser cooling, MOT loading, evaporative cooling, optical tweezers, fluorescence imaging, absorption imaging, RF/microwave spectroscopy, optical lattices.

### 3. Rydberg Blockade Lab (`rydberg-calculator.html`)
Principal quantum number n (30–120), atom species (Rb87, Cs133, Yb171, Sr88). Computes: Rydberg state lifetime τ ~ n³ (with BBR correction), C₆ coefficient (van der Waals, ∝ n¹¹), blockade radius R_b = (C₆/ℏΩ)^(1/6), gate fidelity estimate. Chart.js: τ and R_b vs n curves.

### 4. Imaging SNR Calculator (`imaging-calculator.html`)
7 atom species with D2 line data (Rb87, Cs133, Li6/7, Na23, K39/40). Inputs: NA, detuning Δ, saturation s, exposure time, camera type (EMCCD/sCMOS/Ideal). Computes: scattering rate R_sc, collection efficiency η, photon counts N_sig, SNR via full noise model (shot + read + dark + background), detection fidelity F via normCDF. Chart: SNR vs exposure time curve. Min exposure finder for SNR=10 and SNR=50.

### 5. TOF Thermometry (`tof-calculator.html`)
9 species (Rb85/87, Cs133, Li6/7, Na23, K39/40/41). Ballistic expansion law: σ²(t) = σ₀² + (k_BT/m)t². Temperature from linear regression of σ² vs t² data. Computes: de Broglie wavelength, peak density, phase-space density (BEC threshold at PSD ≥ 2.612), Doppler and recoil limits. Chart.js: σ(t) expansion curve + fit from data table.

### 6. MOT Designer (`mot-designer.html`)
5 species (Rb87, Cs133, Na23, Li7, K39). Section 01 MOT Calculator: damping α, spring κ, ω_MOT, capture velocity, Doppler temperature vs detuning Δ and saturation s. Section 02 Detuning Optimization (live chart). Section 03 Species at a Glance (comparison table). Section 04 the MOT-to-experiment cooling cascade (source → 3D MOT → cMOT → gray molasses/PGC → tweezer/lattice). No magnetic-trap (Ioffe-Pritchard) calculator despite the historical page title — renamed from "MOT & Magnetic Trap Designer" to "MOT Designer" since that content was never built. The "Live MOT Visualization" is a rotatable 3D MOT (since 2026-09-28): six beams, anti-Helmholtz coils with current arrows, quadrupole field B = G(−x/2, −y/2, z) scaled by the dB/dz slider, cloud compressed along the coil axis (σ_z = σ_r/√2), and handedness rings (axial pair opposite to the radial beams). Schematic geometry; cloud size still comes from `updateMOTViz(κ, α, T)`.

### Showcase and "live figures" (since 2026-11-19, `main.js?v=45` / `styles.css?v=32`)
- **Home `#showcase`** sits right after the hero (the hero's primary button "Watch the simulations" points to it): a bento grid of 9 cards, one big (Zoned Atom Processor) and 8 small, each a static WebP still of the real figure in `assets/showcase/` (captured from the dark theme with Playwright, cropped, ≤ 65 KB each), a "Live" badge, the page and section, a hook line and a deep link (`virtual-lab.html`, `fidelity-budget.html#cz-pulse`, `cavity-qed.html#photon-race`, `remote-entanglement.html#repeater`, `rydberg-calculator.html#pair-dyn`, `laser-locking.html#pdh-phasor` (inside a chapter; AMOChapters opens it), `learn-quantum.html#teleport`, `laser-cooling.html#sb-thermometry`). `test_showcase_links_resolve` checks every image and anchor. **When a figure changes a lot, re-capture its still**; when a new flagship figure is added, consider swapping it into the grid (keep 1 big + 8 small so the 4-column grid stays full).
- **Tool cards** for pages that contain at least one `.amo-eyebrow` carry a small "● Live" marker (`.tool-card-live`, static HTML in home.html; add it when a page gains its first live figure).
- **`initLiveFigures()` (main.js)** turns every `.amo-eyebrow` on a page into a live figure: it names it from the nearest heading (next sibling, else up to 3 previous siblings, else the next few), gives the eyebrow an id (`live-<slug>`) if it has none, adds a "Live on this page" chip strip to `.page-hero-text`, and a floating "N live figures" button (bottom right, shown once the strip scrolls away) with a jump menu. Jumps go through `AMOSections.go(id)`, so figures inside chapters/tabs/accordions are opened first. **To make a new interactive figure discoverable, give it an `.amo-eyebrow` ("Interactive") next to its heading.**

### 7. Rydberg Gate Error Budget (`fidelity-budget.html`)
4 species (Rb87, Cs133, Yb171, Sr88). 8 error sources for Rydberg two-qubit gates: spontaneous emission εₛₑ = Γ_Ryd·t_gate, Doppler dephasing ε_D = ½(k·v_rms·t_gate)², laser phase noise ε_φ = π·Δν·t_gate, blockade leakage ε_blk = 1/(U/Ω)², SPAM ε_sp, atom loss ε_loss = t_gate/τ_trap, B-field dephasing ε_B = ½(μ_B·ΔB·t_gate/ℏ)², Rabi inhomogeneity ε_Ω = ½(π·δΩ/Ω/2)². Fidelity F = 1 − Σεᵢ. Color-coded meter (≥99.9% green). SOTA comparison: Evered 2023 (99.5%, peer-reviewed), Muniz 2025 (99.72% post-selected / 99.40% raw), Evered 2026 preprint (99.854% raw / 99.941% post-selected, arXiv:2604.25987, not yet peer-reviewed), approximate FTQC thresholds. Since 2026-11-19 section 03 is **Inside the CZ Pulse** (`#cz-pulse`; SOTA, formulas and references renumbered 04–06): exact Levine–Pichler two-pulse gate with finite V and Rydberg decay (`window.CZPULSE`: `LP`, `expm`, `gate`, `fidelity`), always-dark canvas `#fxCv` (two atoms + timeline, two Bloch-sphere loops, P(rr) bar, qubit-phase phasors), a button that copies Ω, U/Ω and τ_Ryd from the budget, and an exact error-vs-Ω sweep against the budget formulas. Loads motion.js.

### 8. Release-Recapture (`release-recapture.html`)
Interactive simulator for single-atom tweezer thermometry. Atom released from trap, evolves under gravity + thermal velocity, then is recaptured if its energy is below the Gaussian trap depth. Chart: recapture probability vs release time. Assumes known waist/depth; not a direct trap-frequency measurement.

### 9. Quick Lab Console (`lab-calculators.html`)
Large multi-section calculator suite organized in tabs:
- **Optics**: beam waist, Rayleigh range, NA, fiber coupling, telescope magnification, dBm↔mW, AOM shift, shot noise
- **Atomic physics**: photon recoil, Doppler temperature, single-recoil and scatter-heating scales, de Broglie wavelength, Zeeman shift, I_sat
- **Trap**: tweezer frequency ω_r = √(4U₀/mw₀²), Lamb-Dicke parameter η = k·x_zpf, cavity FSR, mode matching
- **Clebsch-Gordan**: CG coefficient table + decomposition for arbitrary j₁, j₂, m₁, m₂

### 10. Laser Locking (`laser-locking.html`)
Guide + interactive tool for saturated absorption spectroscopy (SAS), PDH locking, and offset locking. Subsections: SAS Doppler-free signal, crossover resonances, beat-note offset lock, PDH error signal derivation ε(ν), cavity finesse F = π√R/(1-R), linewidth δν_cav = FSR/F, PDH optical chain.

### 11. Zernike Polynomials (`zernike.html`)
Interactive wavefront aberration analyzer. OSA/ANSI Zernike polynomial Z_n^m(ρ,θ) = R_n^|m|(ρ)·Θ_m(θ). Coefficients slider for tip, tilt, defocus, astigmatism, coma, trefoil, spherical, etc. Canvas wavefront display. Strehl ratio computation. Application to SLM phase patterns for LG modes. PSFs come from `computePSF` (512×512 FFT, crop centred on the zero-frequency bin, 0.25 λ/D per pixel); the "Build & Diagnose" tab also shows W and the PSF as rotatable 3D surfaces (`js/surface3d.js`, fed by the `zern:wavefront` event / `window.ZERN_WF_LAST`). RMS WFE is piston-free (standard deviation about the mean).

### 12. Polarimetry Simulator (`polarimetry.html`)
Stokes parameter visualization for polarization state characterization. Quarter-wave plate rotation analysis, degree of polarization, Poincaré sphere visualization. Applications to optical pumping setup. The Poincaré spheres are Plotly 3D plots (already rotatable) — deliberately left alone in the 2026-09-28 3D pass.

### 13. Laser System Planner (`laser-planner.html`)
Design tool: pick an atom species, get the required laser beams (cooling, repump, imaging, Rydberg/clock as applicable) with wavelengths, a system block diagram, and which nonlinear-optics stages (SHG, frequency doubling) are needed to reach each wavelength from available diode/fiber laser lines.

### 14. Cavity QED Coupling Lab (`cavity-qed.html`)
Calculator for atom-cavity coupling: given cavity/atom parameters, computes single-photon coupling rate g, cavity decay κ, atomic decay γ, and derived figures of merit; charts coupling rates vs cavity finesse; classifies the system into strong/weak/bad-cavity coupling regimes with reference systems and a common-mistakes section. Since 2026-11-19 section 04 is **Watch One Photon Leave** (`#photon-race`; later sections renumbered 05–07): always-dark canvas `#cqCv` with π-pulse, standing-wave brightness ∝ |c₁|², atom glow ∝ |c_e|², photons to a fiber/detector or free space; it follows `window.CQED_LAST` (unrounded values) unless a slider or regime example is used. `window.CQPHOTON` exposes `amps`, `pCav`, `jumpTime`, `trajectory`. The β results card shows the exact C/(1+C)·κ/(κ+γ) underneath (`#res_beta_exact`). Loads motion.js for the pause button.

### 15. Vacuum Systems Guide (`vacuum-systems.html`)
Reference guide covering why UHV matters for cold-atom experiments, the pressure landscape (rough/high/ultra-high vacuum regimes), the pumping chain (roughing, turbo, ion, getter pumps), bake-out procedure, materials/connections (conflat flanges, leak checking), how to read vacuum gauges, and a practical setup checklist.

### 16. Tweezer Array Design Lab (`tweezer-designer.html`)
Design lab for optical tweezer arrays: single-tweezer trap physics (waist, depth, trap frequency), a trap-parameter calculator, array geometry planning (spacing, SLM/AOD generation), and a species/wavelength reference table for common tweezer-trapped atoms. Section 03 has a **3D view** (default, `js/tweezer3d.js`) and the original **Top view**: every beam drawn to true scale as its Gaussian envelope over ±3 z_R from the page's own w₀ = (√2/π)λ/NA ≈ 0.45λ/NA (1/e² radius matched to a filled-pupil Airy focus; never the 0.51λ/NA Airy FWHM, which is a diameter), z_R = πw₀²/λ, d, Nx, Ny — so the d/w₀ crosstalk warning is visible (beams merge away from focus at small d).

### 17. Absorption Imaging Lab (`absorption-imaging.html`)
Companion to the fluorescence Imaging SNR Calculator, focused on absorption imaging: how it works (Beer-Lambert optical density), an imaging calculator section, species reference table, and practical considerations (resonant vs off-resonant, saturation effects, high-intensity imaging).

### 18. Randomized Benchmarking (`rb-explorer.html`)
**Not about rubidium** — despite the filename, this is a deep-dive on the RB gate-fidelity characterization protocol: the SPAM problem, Clifford group twirling, the exponential decay model F(m) = A·p^m + B, extracting average error rate r_C = (d−1)(1−p)/d (with 1- and 2-qubit special cases), interleaved RB (IRB) for isolating a specific gate's error, and practical design choices. Includes working calculators for standard RB and interleaved RB, plus SOTA neutral-atom results.

### 19. Dynamical Decoupling (`dd-playground.html`)
Interactive playground for qubit coherence and π-pulse decoupling sequences. Models free-induction decay under Gaussian dephasing W_FID(T) = e^(−(T/T₂*)²) vs Markovian/exponential decay W_FID(T) = e^(−T/T₂*), and shows how DD sequences (Hahn echo, CPMG, etc.) act as spectral filter functions that extend coherence by refocusing low-frequency noise.

### 20. Remote Entanglement (`remote-entanglement.html`)
Deep dive on photon-mediated entanglement between physically separated qubits/tweezer modules — motivated by the idea that connecting independent quantum processors (not single-qubit fidelity) is the scaling bottleneck. Covers heralded entanglement protocols, photon collection/loss budgets, and reference experimental results linking remote atoms via optical fiber/free-space photon links. Since 2026-11-19 section 09 is a **Quantum Repeater Chain** (`#repeater`, landscape renumbered to 10): animated always-dark chain canvas `#rpCv` driven by an event-driven Monte Carlo (`window.REPEATER`: `linkOf`, `Sim`, `simulate`, `plob`), parameter grid, and rate/fidelity-vs-distance charts with the repeaterless bound; its pause button comes from motion.js. Defaults for node efficiency, overhead, memory time, link fidelity and swap quality are tagged illustrative.

Sections since 2026-11-21: 01 Why · 02 Protocol · 03 Atom–photon · 04 BSM & HOM · 05 Challenges · 06 Approaches · 07 Rate calculator + link simulator · 08 Distillation (`#distillation`) · 09 Repeater chain (`#repeater`) · 10 Landscape · 11 History · 12 References. Every figure uses the Hofmann et al. (2012) two-photon polarization scheme (H₁V₂/V₁H₂ → Ψ⁻, H₁V₁/H₂V₂ → Ψ⁺); keep them consistent. The stepper (`protoCv`) and link sim (`bkCanvas`) switch to taller phone layouts below ~600 px. Details: `docs/page-notes/remote-entanglement.md`.

### 21. AMO Group Finder (`amo-groups.html`)
Career-mapping tool: 98 mapped groups (`GROUPS`) plus a 141-entry watchlist (`WATCHLIST_SECTIONS`) and four curated subfield lists (`SUBFIELD_SHORTLISTS`). Since the 2026-11-21 rebuild the page is one finder driven by a single `STATE` object: 01 area cards (one per `tag`), 02 toolbar (search over directory + watchlist, atom/region/technique/type selects, sort, area chips with faceted counts) with results beside a sticky `js/globe3d.js` globe and a "My list" (starred names in `localStorage['amo-groups-starred']`, always behind try/catch; export as text/CSV or a `?list=` link), 03 "Names to know" (names in the directory open the profile drawer), 04 the watchlist minus names already in the directory. `directoryIndexFor(name, inst)` links a watchlist/shortlist name to a group: first + last name, or a unique surname plus a shared institution word (nicknames), using only the first person of an "A / B" entry. Filters and the open profile (`?g=`) are kept in the URL. Do not reintroduce hiring/"PhD-friendly" labels: nothing on the page can verify them. `status` is shown as a badge and is set only where checked against an institutional page (currently Hinds, emeritus). See `test_group_finder_rebuild`.

### 22. AMO Paper Roadmap (`paper-syllabus.html`)
"55 Papers That Build an AMO Career" — a curated reading list/syllabus organized by career stage (undergrad entry, grad year 1, advanced grad, postdoc/career), meant to guide a physicist through the foundational and current literature of the field in order. Since 2026-09-28 a 3D "time tower" (`js/syllabus3d.js`) above the stage tabs plots every paper by year (height) and stage (face); it reads the `.paper-card` elements at load, so it never needs separate updating.
Since 2026-11-21 it is a reader: reading-track buttons (each card has `data-tracks`, letters e/t/n/j), search across all stages, read ticks with progress (`localStorage` `amo-papers-read`, DOI-keyed), and copy/download of the current list. Each card names its toolkit links in `data-tools` (nav keys, `learn-quantum#anchor` allowed); `initPaperToolBridge()` renders them with nav story labels — never guess them from card text again. `test_paper_roadmap_rebuild` guards duplicates, numbering, stage sizes and tool keys.

### 23. Decoherence Lab (`decoherence-lab.html`)
Deep-dive companion to `learn-quantum.html#decoherence`: paired live Bloch-sphere + detector-signal simulations of dissipation (T1), dephasing (T2*/Tφ), and combined decoherence (T2) for a driven two-level atom, all integrated in real time (RK4) from Steck's optical Bloch equations rather than pre-baked animations. First entry in `NAV.quantum`. No route-panel (linear scroll with a sticky topic-nav instead); has its own numbered "08 References" section (Steck, Fox, Zurek 2003). The four section Bloch spheres are rotatable in 3D (drag/arrow keys, `js/orbit3d.js`); the RK4 engine is unchanged and trails are stored in 3D and re-projected each frame. The small hero sphere stays fixed (decorative, inside `aria-hidden`).

### Formula Regression Tests
Run `python3 tests/formula_regression.py` after formula edits. The tests check recoil conventions, imaging-fidelity mapping, beat-note RF prefactors, QC claim qualification, release-recapture wording, presence of key site UX features, and Rb/Yb comparison-panel fact boundaries (`test_rb_yb_panel_fact_boundaries`, added since this section was last verified). `test_physics_audit_2026_11` pins the fixes from the November 2026 physics audit (see below).

**Physics conventions to check on every formula edit (from the 2026-11-13 audit, which found ~100 slips after a reader caught the tweezer waist):**
- Widths: w₀ is a 1/e² intensity **radius**; FWHM and fiber MFD are diameters (FWHM = √(2 ln 2)·w; rms σ = w/2). Diffraction-limited filled pupil: w₀ ≈ (√2/π)λ/NA ≈ 0.45λ/NA, not the Airy FWHM 0.51λ/NA.
- 2π: data tables give Γ/2π in MHz; rates (R = (Γ/2)s/…, τ = 1/Γ, ħΓ/2k_B) need Γ = 2π × that. E/h vs E/ħ: divide ħ-energies by 2π, not by h.
- Dipole potential U = α I/(2ε₀c) with I₀ = 2P/(πw₀²).
- Cavity: with C = g₀²/(κγ) (half-widths), F_P = C and β = C/(1+C); the 2C forms belong to C₁ = g₀²/(2κγ).
- RB: F(m) = A p^m + B with B = 1/d and A = F(0) − 1/d ≤ 1 − 1/d.
- Numerical integrals over oscillating filter functions must resolve the oscillation (grid step ≪ 1/N in log ω for N pulses); check convergence by doubling the grid.
- Every worked example and reference table must be reproducible from the page's own calculator, or say where its numbers come from.

---

## Learn Quantum (`learn-quantum.html`)

All four Bloch spheres on this page (`blochCanvas`, `gatesBlochCanvas`, `measBlochCanvas`, `rabiBlochCanvas`) are rotatable in 3D via `js/orbit3d.js` (since 2026-09-28). `bsProject()` reads each canvas's view from `BS_VIEWS`; the default equals the old fixed 30°/36° projection.

The animated canvases (MZI, live Rabi sphere + trace, Bell, Grover, Rydberg array) draw with light-theme inks; a page-local `LQ_INK` helper (above the MZI script) makes them follow the theme: `LQ_INK.wrap(ctx)` remaps those inks to dark counterparts as they're set, and `LQ_INK.track(frame)` / `LQ_INK.onTheme(fn)` repaint the current frame on a theme toggle. New canvas code on this page can keep writing light-theme colours and wrap its context; add any new dark-ink colour to the `HEX` table.

15 topics on one long scrollable page with a sticky internal nav:

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
| `#magic` | Magic States | Gottesman–Knill (Clifford circuits are simulable despite entanglement), \|T⟩ and T-gate teleportation, {H,S} vs {H,T} Bloch random-walk demo, R gates/synthesis, simulator-cost readout, distillation vs cultivation table |

---

## Other Tools (Less Frequently Edited)

- **`cooling-simulator.html`** — Doppler and Sisyphus cooling animation; momentum diffusion vs damping coefficient
- **`laser-cooling.html`** — "Single-atom Cooling" deep dive; narrative/derivation companion to `cooling-simulator.html`, same NAV `cooling` category
- **`virtual-lab.html`** — Virtual Tweezer Lab (NAV `cooling`, home card TRAP 08). One shot of a tweezer array animated on an always-dark camera canvas (`#vlCam`, photons placed one by one, magma colour map), then a 1,000-shot Monte Carlo, hole-cause bars, a Poisson count histogram and a log-scale P(defect-free) vs K sweep. Model in section 05 of the page; `window.VLAB` exposes `threshold`, `binomTail`, `assign` and `shot` for tests. Loss/timing defaults are labelled illustrative (amber tags); loading 0.5 and 0.89, and F = 0.995, are cited (green tags). Its canvases carry `data-export-ready` and opt out of the global 280px canvas cap.
- **`atom-processor.html`** — Zoned Atom Processor (NAV `quantum`, home card QC 07, eyebrow "Quantum 07", start-here 08). Circuit presets (Bell, GHZ-4/8, Grover, Bernstein–Vazirani with a selectable secret, seeded random) → compiler (CX→H·CZ·H, self-inverse cancellation, ASAP layers, AOD-order trips via interval scheduling, exhaustive placement optimiser) → always-dark device canvas `#zpCv` (960×600) + circuit canvas + state-vector panel, and a 1,000-shot Pauli-trajectory histogram. `window.ZAP` exposes `compile`, `trips`, `optimise`, `runIdeal`, `fidOf`; `test_atom_processor_compiler` pins GHZ-8 trips (7 naive, 3 optimised), BV/Grover outputs and the depolarizing conversions.
- **`rb87-vs-yb171.html`** — Side-by-side platform comparison (Rb87 alkali vs Yb171 alkaline-earth-like) for choosing a qubit species; lives under the `career` NAV category as a "deep dive"
- Clebsch-Gordan coefficients live inside **`lab-calculators.html`**
- PDH error-signal material lives inside **`laser-locking.html`**
- **`qc-landscape.html`** — Company profiles (IonQ, Quantinuum, IBM, Google, PsiQuantum, etc.), job roles, skills mapping for AMO physicists, roadmaps. Since 2026-11-21 the 13 numbered sections run durable → news: 01 DiVincenzo · 02 analog vs digital · 03 snapshot table · 04 comparison (radar + log-scale qubit counts + fidelities) · 05 company globe · 06 deep dives · 07 where the field stands · 08 FT timeline · 09 neutral-atom milestones · 10 flash points (newest first) · 11 investment · 12 AMO → industry · 13 references. Section ids are linked from the hero pills and the "How this page is laid out" panel; the stats strip carries a source line per number. `test_industry_map_rebuild` checks the order and the corrected facts. The "Where the Hardware Is Built" globe (before Platform Deep Dives) has one entry per deep-dive company card in an inline `SITES` array; add/remove an entry whenever a company card is added/removed.

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
- **Section search index:** search shows section hits from `js/search-sections.js`, generated by `node tests/browser/build-section-index.js` (Playwright; reads `AMOSections.collect()` on every page). Section links use `#s-<slug>` made from the heading's own text (no ids needed); `AMOSections.go()` opens the chapter / tab / accordion and scrolls. Re-run the builder after adding or renaming sections (a renamed heading's old link just lands at the page top), then bump `search-sections.js?v=` in `initGlobalSearch`.
- **Printing figures that draw lazily:** main.js fires `amo:print` (paper theme on, synchronously before the print snapshot). A canvas that only draws when its chapter opens or a button is pressed must draw *synchronously* in an `amo:print` listener (no requestAnimationFrame: the browser prints before the next frame), or it prints as a one-line "not drawn" note. Examples: zernike mode atlas, surface3d.js, polarimetry E-field, fidelity-budget waterfall.
- **Button text color:** Global `button { color: inherit; }` is set — do not add browser-default buttons without explicit color.
- **Formula boxes:** Never add `white-space: pre` or `font-family: var(--mono)` to `.formula-box` — breaks KaTeX rendering.
- **Page-local formula-box styles:** Some pages have `<style>.formula-box { background:...; border:...; }</style>` for custom colors. Keep only `background`, `border`, `border-radius`, `padding` — never font or white-space overrides.
- **Tool counts DO auto-update (fixed):** The homepage hero stat used to be a hand-typed number and silently went stale — that's fixed now. `js/main.js`'s `updateHeroStats()` sets `#stat-tools-count` from `NAV.tools.length` and `#stat-concepts-count` from `NAV.learn.length` at runtime. The raw HTML in `home.html` still hard-codes a fallback number for no-JS/pre-hydration display — keep that fallback roughly in sync when `NAV` changes, but it's cosmetic only; the live page is always correct.
- **Site branding vs repo name:** The live site and all page titles/meta say **"AMO Toolkit"** (custom domain `amotoolkit.com`, see `CNAME`) — the repo/folder is still named `amo-career` and this file's own title still says "AMO Career" for historical/identification reasons. Don't "fix" page titles back to "AMO Career" — that would be reverting an intentional rebrand.
- **`llms.txt` / `llms-full.txt` drift:** Not automatically regenerated — refreshed on 2026-11-22 to list all 37 pages plus the book, but they will drift again the next time a page is added/removed unless someone remembers to update them by hand.
- **home.html nav:** Uses `root: ''` (empty string, not `'../'`).
- **index.html:** Only a redirect — never edit it.
- **Home hero is a live WebGL scene (`js/hero3d.js`, home.html only).** It animates a dual-species Li + Cs tweezer array through load → image → rearrange → merge Li–Cs pairs. A tiny inline `<head>` script adds `html.hero3d-on` when WebGL exists; `hero3d.js` removes it on context failure/loss so the original Li/Cs `.atom-box` cards show instead. Its styles live in a `<style>` block in home.html (not styles.css, so editing them needs no sitewide cache bump). Two deliberate details: the canvas id `hero-canvas-3d` contains `hero-canvas` so `initExportButtons()` skips it (no "Export PNG" button in the hero), and it needs `max-height: none !important` to beat the global Chart.js canvas cap, whose `:not(#id)` chain outranks any class selector. It honors `prefers-reduced-motion` (single static frame), pauses offscreen and in hidden tabs, and steps resolution down on GPUs under 30 fps. A **Pause animation / Play animation** button in the caption (WCAG 2.2.2) keeps it stopped across scrolling and is hidden under reduced motion. Bump `hero3d.js?v=N` in home.html when editing it (currently `v=2`). The old 2D `#hero-canvas` drifting-dots script was removed — it had been running an animation loop on a `display:none` canvas.
- **Transitions (since 2026-09-28, `main.js?v=32` / `styles.css?v=22`).** One motion language site-wide; the rationale and a map of what animates are in `docs/motion-and-transitions.md`. In short:
  - Page → page uses cross-document View Transitions (`@view-transition { navigation: auto }` in styles.css). The nav is named `site-nav` only during a transition (set in `pageswap`/`pagereveal` in main.js), so it stays still while the content dissolves and rises.
  - Every page holds its first paint until the nav exists: `<link rel="expect" href="#amo-nav-ready" blocking="render">` in `<head>` plus `<div id="amo-nav-ready" hidden></div>` right after the `renderNav(...)` script. Before this, some pages (start-here, home) painted without the nav and it popped in. **A new page without these two lines will still work, but its nav can flash in and the transition into it looks worse.** Don't put the marker at the very end of `<body>` on pages that load Chart.js from the CDN at the bottom, or first paint waits on the network.
  - Links are prefetched on hover (Speculation Rules; `<link rel=prefetch>` fallback).
  - **Shared-element morph (since `main.js?v=38` / `styles.css?v=27`; v39 keeps the emoji and its label in one inline run so flex badges wrap exactly as before).** Clicking a card whose link contains `.tool-card-icon`, `.intent-icon` or `.see-also-icon` flies that icon into the next page's hero icon: the leading emoji of the first text before the hero `<h1>` (`.page-hero-eyebrow`, `.page-tag`, `.pill`, `.page-hero-label`, …), wrapped on demand in `span.amo-vt-glyph`. Both sides are named `amo-tool-icon` only during that transition, only when on screen and only when the two glyphs are equal; going back reverses it. A one-shot `sessionStorage` key `amo-vt-icon` carries the glyph across. **Keep a page's hero icon identical to its `NAV` icon, home card and start-here see-also icon**, or the morph quietly doesn't happen (all 32 pages matched on 2026-09-29). `AMOPageMorph.heroIcon()` returns a page's hero icon element for checks.
  - Shared helpers are on `window.AMOTransitions`: `swap(fromEl, toEl, doSwap, dir)` (panel change with height morph), `expand(el)` / `collapse(el, done)`, `enter(el)` / `leave(el, done)`, and `attachInk(bar, activeSelector)` (sliding tab underline). `initTabs`, `initAccordions`, derivation toggles, the mobile menu and search use them. So do polarimetry's `polTab()` and laser-locking's `togglePrac()`. **Any new page-local tab or toggle code should call these rather than flip `display` directly.**
  - All of it becomes instant under `prefers-reduced-motion` and is skipped in browsers without the APIs (Firefox has no cross-document view transitions; pages there just navigate normally).
  - Anchor links now use the document position rather than `offsetTop` (which was wrong inside positioned containers), update the URL hash, and `[id]` has `scroll-margin-top: 84px`, so targets land below the fixed nav.
- **Overnight build runs (since 2026-09-28).** A scheduled task fires hourly overnight (Mountain time) and follows `docs/overnight-runbook.md`: it picks the next item from `docs/overnight-backlog.md`, verifies it, commits it and appends to `docs/overnight-log.md`.
  - Its lock and test tarballs live inside `.git/` (`overnight-lock`, `overnight-*.tar`), so they are never committed.
  - It cannot push (the Mac VM's proxy blocks github.com), so Saumitra pushes the morning's commits.
  - Rendered-page smoke test for anyone: `node tests/browser/smoke.js <siteRoot> [--baseline <oldRoot>]` (needs Playwright; checks every page in both themes plus 390 px for errors and horizontal overflow).
- **Comparison pages read their own content (`js/versus.js`).**
  - Tug of war tallies the Full Head-to-Head table's Edge column, using the `win <side>` classes or Edge text that starts with a side name.
  - Race replay parses the Section-03 `.tl-item` year text.
  - So edits to those tables and timelines flow through automatically. Keep the formats: Edge text starting with the side name or "Tie"; `tl-year` as "Mon YYYY · Label" or "YYYY (target)".
  - Conditional Edge calls ("if…", "pending…") count half.
  - "At a glance" (`AMOVersus.glance`, since 2026-11-21) renders one card per table category at the end of section 01 (`#vs-glance-mount`), from the same parse, so the answer comes first and can never disagree with the table.
  - Side colours used as text go through `color-mix(in srgb, <side> 50%, var(--text-primary))`; raw accent colours failed contrast in one theme or the other.
- **Looping canvas animations must be pausable (`js/motion.js`).** WCAG 2.2.2: anything that moves for more than 5 s needs a pause control. Don't self-schedule `requestAnimationFrame` in a forever loop; pass the per-frame function to `AMOMotion.loop(canvases, frame, {anchors})`. It adds the button, stops the loop offscreen and in hidden tabs, and starts paused on a still frame under `prefers-reduced-motion`. It also hands the frame a timestamp that doesn't advance while paused, so dt-based simulations resume cleanly. Used by learn-quantum (5 loops), dd-playground, decoherence-lab, rb87-vs-yb171 and mot-designer (the 3D MOT; its `render(false)` repaints without stepping the cloud, for theme toggles and drags while paused). The self-contained 3D widgets (globe, tower, constellation, collection photons, TOF cloud) have their own pause buttons.
- **Canvases drawn with cream-theme inks (`js/canvas-ink.js`).** Many older 2D canvases fill `#faf5e9` and draw with dark inks meant for the cream paper, so they were cream blocks in the (default) dark theme. Instead of rewriting their colours, load `canvas-ink.js?v=2` and wrap the context: `const ctx = AMOInk.wrap(cvs.getContext('2d'))`. While the dark theme is on, each light ink set on that context (fillStyle / strokeStyle / shadowColor / gradient stops) is mapped to its dark counterpart from one table (paper `#faf5e9` and the other cream fills `#f2ead9` / `#efe7d6` → `#0c1526`, `#1e3a5f` → slate, `#926a03` → `#fbbf24`, …); bright accents pass through. Repaint on toggle with `AMOInk.track(frame)` (dt-based frames: re-calls the last timestamp) or `AMOInk.onTheme(fn)`. Give the canvas CSS background `var(--bg-card)`. Never draw text in `#faf5e9`: it's the paper colour (several labels were invisible that way). learn-quantum has the same helper inline as `LQ_INK`.
- **Top-level `const` is not on `window`.** tof-calculator's cloud animation silently ignored the sliders for a long time because its hook read `window.ATOMS`, and `const ATOMS` at script top level is not a window property. Read such tables directly (`typeof ATOMS !== 'undefined'`), not through `window.`.
- **Keyboard stepping on the 3D pickers (since 2026-09-29).** The globe (`globe3d.js` v2), time tower (`syllabus3d.js` v2) and constellation (`sitemap3d.js` v2) keep arrow keys for rotation (orbit3d) and use <kbd>]</kbd> / <kbd>[</kbd> (also . / ,) to step through their items, pin the card, and announce it in a visually hidden aria-live line; Enter does what a click does; Esc closes. The lattice lab (`vs-lattice.js` v2) is a tab stop with arrow-key focus-ring navigation. New canvas pickers should follow the same keys.
- **Rotatable 3D figures (`js/orbit3d.js`).** Shared, opt-in helper (not part of `main.js`, so adding it to a page needs no sitewide cache bump): `AMO3D.orbit(elementOrArray, {az, el, label, onChange, hintParent})` gives drag (touch: sideways swipes rotate, vertical swipes still scroll the page), arrow keys, Home / double-click reset, and a one-time "drag to rotate" hint; `AMO3D.project(view, x, y, z)` → `[X right, Y up, D toward viewer]` with lab z up. Used by learn-quantum (4 spheres), decoherence-lab (4 spheres), dd-playground (FID + CPMG share one view), tweezer-designer (3D array), mot-designer (3D MOT), and via `globe3d.js`/`syllabus3d.js` by amo-groups, qc-landscape and paper-syllabus. Drag is "grab" (the surface follows the pointer) since `v=2`. The globe/tower canvases need the same two canvas-trap fixes as the hero: `max-height:none !important` and `data-export-ready="true"`. Every sphere's default view reproduces its old fixed projection exactly. It appends rotate instructions to an existing `aria-label` rather than replacing it; don't attach it inside `aria-hidden` regions (that's why decoherence-lab's hero sphere stays fixed).
- **Canvas traps for any new figure** (all hit during the 2026-09-28 3D work — see `docs/3d-visualization-audit-2026-09-28.md`): (1) the global Chart.js cap `canvas:not(#id…){max-height:280px}` has 15 ids of specificity — a new tall canvas needs `max-height: none !important` or its id added to that list; (2) `initExportButtons()` inserts "Export PNG" before canvases in sections — skip it with `data-export-ready="true"` on the canvas (WebGL canvases export blank anyway); (3) an absolutely positioned `<canvas>` does not stretch between `left`/`right` like a div — give it explicit width/height; (4) an author `display:` rule overrides the HTML `hidden` attribute — add a scoped `[hidden]{display:none!important}` if you toggle with `hidden`.
- **Phone-width rules (since the 2026-09-28 overnight overflow fix, `styles.css?v=23`).** Every page is now no wider than the screen at 390 and 360 px, with KaTeX rendered. To keep it that way:
  - A `<table>` that isn't already inside `.data-table-wrap` or another scroller goes in `<div class="table-scroll">` (scrolls sideways only below 900 px, so desktop margins still collapse as before).
  - Grid columns: `.two-col`, `.three-col` and `.side-by-side` children have `min-width:0`. A new page-local grid needs `minmax(0,1fr)` columns or `min-width:0` children, or one wide equation/table/canvas sets the column's minimum width.
  - `.katex-display` scrolls sideways on its own; fixed-size canvases in half-width columns need `max-width:100%; height:auto`.
  - `.tip[data-tip]` tooltips are only laid out while hovered/focused (a hidden `opacity:0` bubble still widened the page), are anchored to the nearer screen edge by `alignTip` in main.js (first line box), and don't inherit uppercase label styling. Since `main.js?v=35` they are also focusable (tabindex 0 added at load), carry their text as `aria-describedby`, open on tap/click (`.tip-open`; tap again, tap elsewhere or Esc closes) and hide on Esc while focused (`.tip-dismissed`). Just write `<span class="tip" data-tip="…">symbol</span>`; nothing else is needed.
  - **Prices and KaTeX.** Auto-render pairs any two `$` in one text node into maths. On the industry pages every amount is written `<span class="money">$1.5B</span>`, and the auto-render call in main.js has `ignoredClasses: ['no-math', 'money']`. Widgets that copy page text before KaTeX runs (the `versus.js` Tug of war / Race replay) carry `no-math`.
  - `tests/browser/smoke.js` now renders real KaTeX and Chart.js (they are vendored, so served locally). That is how it found that KaTeX's hidden MathML copy, absolutely positioned, escaped scrolling tables and widened decoherence-lab and laser-cooling to ~500 px on phones; `.katex { position: relative }` in styles.css (v43) contains it.
- **Chapter pages (since `main.js?v=37` / `styles.css?v=26`).** Pages whose main content is tabs put `data-chapters` on that tab bar. Today that is lab-techniques, lab-calculators, laser-locking, cooling-simulator, zernike and paper-syllabus; polarimetry's `.pol-tab-nav` also sets `data-chapter-panels=".pol-section"`.
  - **What `AMOChapters` (main.js) adds:** it wraps the bar in a sticky `.chapter-nav` (under the 64 px site nav, with an "n / N" counter), appends a `.chapter-pager` (previous/next) to every chapter, and keeps `#ch-<slug>` in the URL. Loading or linking to `#ch-…`, or to any `#id` inside a hidden chapter, opens that chapter; `initSmoothScroll` calls `AMOChapters.reveal()`.
  - **Index cards:** elements with `data-chapter="n"` (1-based: route-cards, zernike's path steps, and similar index cards) become buttons that open chapter n. Put `data-chapter-index` on their container for the phone layout and the "N chapters" note. A page with no such cards gets an automatic `.chapter-strip` of chips after the Page Playbook.
  - **Tab switching** still goes through each page's own handler (`btn.click()`).
  - **Keep the index honest:** when you add, remove or reorder a chapter tab, update its `data-chapter` card too (site-philosophy §2 and §8).
  - **Page Playbook:** now a slim `<aside class="page-playbook-panel">` note (lead, "Use it for", "Read with care"), no longer a `workflow-panel` card.
- **Printing (since `main.js?v=40` / `styles.css?v=28`).** Until 2026-10-26 a printed page lost almost everything: every `.anim-in` block not yet scrolled into view stayed at opacity 0 (cavity-qed printed 296 words over 6 pages), the default dark theme printed grey text, and closed chapters printed empty charts. Now:
  - styles.css `@media print` shows all `.anim-in`, accordions, tab/chapter panels and the page-local collapsibles (`.prac-body`, `.approach-body`, `.pump-card-body`); hides nav, topic-nav, pause/export buttons and orbit hints; prints the Cite-this-page panel; keeps canvases at their drawn aspect (≤ 11 cm, `object-fit: contain`); writes external link URLs after the link (`a[data-print-url]::after`). A new page-local collapsible that hides with `display:none` needs adding to that list.
  - `AMOPrint` (end of main.js) on `beforeprint`: drops the dark theme until `afterprint` (so AMOInk canvases and AMOChartInk charts repaint in paper inks), labels every chapter panel ("Chapter n of N · Title") and tab panel (its tab's text) and derivation view, opens closed `<details>`, adds a source line (address with calculator query string + date), resizes every Chart.js chart to its container capped at 680 CSS px (briefly showing a closed panel so hidden charts get a size) and draws it at once, fires `amo:print` (motion.js loops draw a frame, so never-seen canvases aren't empty), then replaces any still-uniform 2D canvas with a one-line "not drawn when printed" note. `afterprint` undoes all of it.
  - It gives a context-less canvas a 2D context when it checks it: a WebGL canvas created lazily (after load) must carry `data-print-skip`.
  - Check prints with Playwright `page.pdf()` (it fires before/afterprint) and `pdftoppm`; `pdftotext … | wc -w` is a quick content count.
- **Chart.js colours follow the theme (since `main.js?v=36`).** Chart configs across the site mix cream-theme inks (tick/legend text `#5c503c`, `#22190f`, `#8c8066`, Chart's default `#666`, tooltip paper `#faf5e9`) with dark-theme inks (grids `#1e293b`, `#0f1e35`, `rgba(255,255,255,.04)`). A block at the end of main.js (`AMOChartInk`) registers a Chart.js plugin that wraps every chart's 2D context and translates those inks for the current theme as they are set (the `js/canvas-ink.js` idea, both directions); data-series accents pass through, and a theme toggle re-renders every chart. So write chart configs with the cream inks, or with explicitly theme-aware colours; don't hard-code a text ink that only works on one background. Add an ink to the tables in main.js only if it is a text, grid or tooltip ink.
- **Case-safe symbols in uppercase labels (since `main.js?v=34` / `styles.css?v=24`).** `text-transform: uppercase` on labels, `th` and `h5` turned symbols into different symbols (γ/2π → Γ/2Π, mW → MW, ms → MS, μK → ΜK, Cs → CS). A block at the end of main.js now wraps, inside any uppercase-styled text, the tokens that must keep their case in `<span class="case-keep">` (`text-transform:none`), after KaTeX has run and again for text added later (MutationObserver):
  - whole tokens with a Greek lowercase letter, sub/superscript, `_`, `^`, ⟨⟩ or `/2π` (unless the part before `_`/`^` is an ordinary word: "β-factor" keeps only β);
  - SI units with prefixes (nm, mW/cm², kHz, μK, mbar, m/s), single-letter variables (t, n, r, `F(v)`), element symbols and AMO molecules (Rb, Cs-133, ¹⁷¹Yb, KRb);
  - text containing `$` is skipped so KaTeX can still pair delimiters; `.katex` itself now has `text-transform:none`.
  - So new labels can be written naturally ("Trap depth (mK)", "κ/2π (MHz)") and will display correctly. Opt a block out with class `no-case-keep`. `AMOCaseKeep.fix(el)` reprocesses a subtree by hand, `AMOCaseKeep.keepWhole(token)` shows how a token is classified.
- **Page Playbook panel is live.** `initPagePlaybookPanel()` renders the `PAGE_PLAYBOOKS` "Use it for / Read with care" strip at the top of tool pages that have an entry (plus "Teach with it" and "In Python" lines). The never-wired Reference Trail, assumption badges, source-confidence panels, lab notebook and expert-mode toggle were deleted from main.js on 2026-11-22 and their CSS removed in the audit the same day.
- **Verifying visual changes.** Static checks (tag balance, `node --check`, regression tests) don't catch rendering bugs — the Guided Paths "null" concept map passed all of them. For anything visual, render it: headless Chromium via Playwright with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` gives software WebGL; serve the repo locally and block external requests, but **stub `window.Chart`** (e.g. via `addInitScript`) — with the Chart.js CDN blocked, pages throw `Chart is not defined` and the rest of their inline script never runs. Method and limits are written up in `docs/3d-visualization-audit-2026-09-28.md`.

### Cite panel (main.js `initCiteThisPage`, same on every page)
- One generator for all pages, so every page's citation looks the same. It asks readers to cite the page they used, to cite the original paper for quoted results, and to cite the thesis (or the paper) for results from Saumitra's PhD research.
- `CITE_THESIS` holds the thesis citation (Purdue HAMMER, 2026); `CITE_PAPERS` + `CITE_RESEARCH` attach the paper a page is built on (laser-cooling and cooling-simulator: Phatak et al., PRA 110, 043116, 2024) and open that drawer by default. Add a page there when it is built on another of his papers.
- The citation box gives attribution, not tracking: nobody is notified when a BibTeX entry is pasted. Tracking is Google Scholar alerts on the thesis and papers (Scholar is unlikely to index individual toolkit pages) plus web search for "AMO Toolkit".

## Teach with AMO Toolkit (pages/teach.html, 2026-11-22)
- A 14-week course: week cards (two lectures, the pages, an in-class demo) and one problem set per week, with 3 problems per page tagged Use the tool / By hand / Design. Solutions are not published; instructors request them by email (button in Section 05).
- Edit `pages/teach.html` directly. Each page's problems sit in `<div class="te-ps" id="ps-<key>">` inside `<details class="te-set" id="ps-week-NN">`; a hash such as `#ps-mot-designer` opens its week. Keep the hero counts (pages, problems) in step; `test_teach_page` checks them.
- `COURSE_WEEK` in main.js (key → week) drives the "Teach with it" line in every page's playbook note; `test_teach_page` checks it matches the page and that every story page except the career comparisons has problems. When a page is added to a story, add its problems and its `COURSE_WEEK` entry.
- "Teach" sits in the desktop nav (buttons slightly tighter below 1400 px so "Guided Paths" stays on one line at 1280 px) and in the mobile menu, the home "Guided Paths" intro, the home footer and the Start Here hero.

## Python notebooks (notebooks/, 2026-11-22)
- 19 executed `.ipynb` files, one per calculator page, each reproducing the page's formulas with the page's own constants and ending with a cell that checks the numbers against what the live page shows at its defaults. Linked from each page's playbook note ("In Python": Colab and download, driven by `NOTEBOOKS` in main.js) and from Teach §05.
- Sources live in `notebooks/_build/`: `specs/<page>.py` (cells), `build.py` (executes them, embeds outputs and figures, fails on any mismatch), `scrape.js` (reads a page's displayed values with Playwright). **If you change a calculator's formula, constants or defaults, update its spec's check values and rebuild**: `python3 notebooks/_build/build.py notebooks/_build/specs notebooks`. `test_notebooks` checks that every notebook passed its page check, is listed in `NOTEBOOKS` and on the Teach page, and has a spec.

## The book: Building with Atoms (book/, 2026-11-22)
- `book/index.html` (read online) and `book/building-with-atoms.pdf` (7 × 10 in, ~448 pages, ~15 MB after the `qpdf` pass in polish.js, PDF outline and clickable links) are the whole site as one book: five parts following the NAV stories (I Build a lab, II Trap, image and cool, III From atoms to a quantum computer, IV Into the field, V the course), one chapter per story page in NAV order, then appendices (A Python notebooks, B CODATA constants, C how to cite, D using the material responsibly, E notation, F glossary, G formula sheet, H where the field stands, I index). Every chapter opens with links to its live page, notebook and course week and ends with that page's problems from Teach.
- Interactive parts appear as their output at the page's default settings (stat chips, SVG figures, canvas snapshots) with an "Interactive on the website" box linking back. Links point to `https://amotoolkit.com/pages/...`.
- **Edition 1.1 (2026-11-26, ~447 pages)** added, all generated from site data: a map of scales (`book-ref.json`, which also holds Appendix E notation, F glossary and G formula sheet, the last three added by Gemini); a prologue built from `follow-one-atom.html` and an exploded-apparatus still from `apparatus.html` (`extras.js`); Appendix H from the records board (`records.html` `CATS`, with its "Last checked" date); Appendix I, an index whose terms and patterns are in `index-terms.json` and whose page numbers `index.py` finds in the printed PDF; and the research-group chapter set as tables from `amo-groups.html`'s `GROUPS`/`SUBFIELD_SHORTLISTS`/`WATCHLIST_SECTIONS` (`extras.groupsBody`). `polish.js` `bookish()` numbers figures and tables per chapter (captions from the nearest heading), caps tiny SVG icons, lets long cards break across pages, and boxes number-only `.stats` panels as "Key numbers" (panels of links or numbered steps are left alone: not every `.stats` is calculator output). Equations are numbered in `transform()`. If you rename a NAV key or a page's data constant, these generators fail loudly rather than silently.
- Chapter titles, "In this chapter" goals, prerequisites, bridges and summaries come from `book/_build/textbook-meta.json` (keyed by page). They are claims in a book students keep, so check each against its page before changing it (the 2026-11-22 audit corrected eight).
- **The book is generated, not hand-written.** After changing pages, regenerate it (Node + Playwright + sharp, KaTeX, pypdf; Lora and Inter installed for the PDF): `node book/_build/extract.js . /tmp/raw && node book/_build/build.js . /tmp/raw book && node book/_build/polish.js book`. For CSS-only changes, `node book/_build/polish.js book --reprint`. See `book/_build/README.md`. `test_book` checks chapters, images, contents page numbers and the site links.
- The desktop nav bar has no Search button or "Guided Paths" button (removed 2026-11-22 to declutter it): search opens with the `/` key on desktop and from the mobile menu; Guided Paths stay on the home page and in the mobile menu.
- Linked from the desktop nav ("Book", after "Teach"; buttons slightly tighter below 1400 px so the bar fits at 1280 px), the mobile menu, the home hero, Guided Paths intro and footer, Start Here, Teach §01 and site search.

## Service worker and cross-tool handoff (2026-11-22)
- `sw.js` (registered from `renderNav()` on http/https only): network-first for HTML with a cache fallback, stale-while-revalidate for CSS/JS/fonts/images (including the vendored KaTeX and Chart.js, which are also precached) and the Plotly/Google Fonts CDNs. It skips range requests, `.pdf`, `.ipynb` and `.zip` (the ~15 MB book PDF must not land in visitors' storage), caches only status-200 (or opaque CDN) responses, and redirects an offline navigation to an uncached page to `home.html` (serving home.html under another URL breaks its relative paths). **When you bump `styles.css`/`main.js` versions, bump them in `CORE_ASSETS` too**; `test_service_worker` checks they match.
- `initCrossToolHandoff()` in main.js adds a "Carry these parameters to a connected tool" bar to tweezer-designer, imaging-calculator and release-recapture, built from the source page's current controls into the target page's URL parameters (applied by `initShareableCalculatorParams`, selects before sliders). Units match across the three pages (nm, mW, µm, NA×100); tweezer-designer's wavelength slider has 1 nm steps and power 0.5 mW steps so handed-over values (1064 nm, 1.5 mW) are not rounded. The book extractor skips this bar.

## Follow One Atom, the Apparatus Map and the Records Board (2026-11-25)
- Three pages outside the NAV stories (like Teach and the book), linked from a "three ways in" strip under the home hero (`.ways-strip` in styles.css), a line in the Start Here hero, the mobile menu's Start Here section and search (`SEARCH_KEYWORDS` + the `byHref` loop next to Teach). `test_explorer_pages` checks all of it.
- `pages/follow-one-atom.html`: ten scroll-driven stages; a sticky canvas scene and three log gauges (temperature, speed, quantum size) driven by the `S` array in the page script, computed from ⁸⁷Rb constants. The prose quotes the same numbers; **if you change a stage's value, change the text and the test together** (`test_explorer_pages` recomputes them). The intro uses `.page-hero-eyebrow` inside its own `.fa-intro` header, and the closing section is `.page-content > .container` so the cite and feedback panels land at the bottom.
- `pages/apparatus.html`: a small canvas 3D renderer (faces, line segments, atoms; painter's algorithm, back-face culling for opaque solids) on `AMO3D.orbit`. Parts live in `PARTS` (id, story, explode direction, text, links) and their geometry right below. Add a part by adding both. The part list under the figure is the accessible route. Canvases on these pages need `max-height: none !important` because of the site-wide 280 px Chart.js cap.
- `pages/records.html`: all entries are in `CATS` in the page script (platform, status `peer`/`pre`/`co`, value, description, who/when, sources, flags). **Update "Last checked" when you revise it**, quote numbers as published, and keep preprint and peer-reviewed bests side by side when they differ. Sources were checked against arXiv abstracts or publisher pages on 2026-11-25; where a publisher page could not be read, the card links the site's own comparison chapter that carries the citation.

## Dark-theme inks for hard-coded colours (2026-11-27)
- Some pages hard-code saturated light-theme colours inline (`style="color:#0556b9"`) or in page `<style>` rules. Write them as `color: var(--dk-blue, #0556b9)`: `[data-theme="dark"]` in styles.css defines `--dk-blue`, `--dk-sky`, `--dk-cyan`, `--dk-green`, `--dk-lime`, `--dk-violet`, `--dk-purple`, `--dk-indigo`, `--dk-amber`, `--dk-orange`, `--dk-pink` and `--dk-red`; the light theme defines none, so it keeps the page's own colour. This replaced six per-page "dark-mode inline-color contrast pass" blocks of attribute selectors (cooling-simulator, google-vs-ibm, psiquantum-vs-xanadu, qc-landscape, tof-calculator, vacuum-systems). Don't add new patch blocks; use the tokens.

## Page scripts in js/pages/ (2026-11-27)
- The two heaviest pages keep only their `renderNav(...)` bootstrap inline; their scripts live in `js/pages/learn-quantum.js`, `learn-quantum-protocols.js`, `remote-entanglement.js`, `remote-entanglement-repeater.js` and `remote-entanglement-hero.js`, loaded as classic scripts at the same place (so they run exactly as the inline blocks did) and cached separately. Bump their `?v=N` when you edit them. `read()` in `tests/formula_regression.py` appends a page's `js/pages/*.js` to its text, so formula checks work wherever the code sits.

## Working alongside other agents (Gemini, scheduled runs)
- Claude and Gemini both edit this repo, sometimes at the same hour, and scheduled tasks run here too (`docs/book-rebuild-runbook.md` nightly, `docs/records-check-runbook.md` monthly, and the overnight builder when enabled).
- Before multi-file work, read `.git/overnight-lock`. If it says `running <time> <who/area>` less than 2 hours ago and your work overlaps that area, wait or pick other work. When you start, write `running <UTC time> <your name>: <area>`; when you finish, `free <UTC time>`.
- **`book/_build/` and the generated book have one owner at a time.** Never hand-edit `book/index.html` or the PDF; change the pages or `book/_build/*`, then rebuild (or let the nightly task do it).
- Run `GIT_OPTIONAL_LOCKS=0 git status --short` first. Files already modified belong to whoever is working on them: don't edit or commit them unless Saumitra says to. Commit your own work promptly, with explicit paths.

## The online book reader (book/_build/reader.js, 2026-11-27)
- One script, inlined by `build.js`, runs the online edition: theme, contents drawer with filter, "N / 35 chapters read" and "★ Saved only", reading progress, back to top, **search** (`/` or Ctrl/Cmd+K: chapters, sections, figures, tables, glossary, formula sheet, index terms), **figure zoom** (click or Enter on a figure), **resume reading** (pill on the cover), **bookmarks** and **mark as read** per chapter, **§ permalinks** on numbered sections and click-to-copy equation numbers, and **text size** (A−/A+). State is per browser (`amo-book-*` localStorage keys). Gemini designed most of these (and their CSS in `book.css`); they were consolidated here so a rebuild keeps them.
- It returns at once when `window.__BOOK_BUILD__` is set, which `polish.js` does while rendering, so none of the buttons it adds are baked into `index.html` or the PDF. Add reader features here, never by editing `book/index.html` (a rebuild overwrites it). Never write a literal closing script tag in it.
- `polish.js` also builds the **List of figures and tables** (front matter, after Contents): every numbered figure and table carries a hidden `@@CH:fig-…@@` / `@@CH:tab-…@@` marker, so the PDF list has page numbers like the contents. Figure ids are `fig-<chapter>-<n>` (prologue `fig-P-<n>`), table ids `tab-<chapter>-<n>`, glossary terms `gl-<slug>`, section headings `sec-<chapter>-<n>`, equations `eq-<chapter>-<n>`.

## Usage log (js/main.js, Gemini, 2026-11-27)
- `AMOTrack` in main.js counts book-PDF downloads, notebook opens, figure exports, prints and citation copies: a GA4 event through the existing gtag, plus a per-browser log (`amo-activity-log`) shown on home.html under "Recently used tools". The book's reader.js writes the same log. `AMO_TELEMETRY_URL` is empty, so nothing goes anywhere else; `scripts/telemetry-apps-script.gs` is an optional Google Apps Script receiver (Sheet + email alert) if Saumitra ever deploys one and pastes its URL there. Citation copies count only cite/citation/BibTeX buttons and the cite panel, not every "Copy" button.
