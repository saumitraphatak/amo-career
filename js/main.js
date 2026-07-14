/* =====================================================
   AMO Toolkit — Shared JS
   Nav renderer · Canvas animation · Scroll reveal · Accordions · Tabs
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   THEME — light (default) / dark toggle, persisted
   ───────────────────────────────────────────────────── */
const THEME_KEY = 'amo-theme';

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.setAttribute('aria-pressed', theme === 'dark');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    const icon = btn.querySelector('[data-theme-icon]') || btn;
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    const label = btn.querySelector('[data-theme-label]');
    if (label) label.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  });
  // #hero-canvas is display:none in light mode, so anything that measured
  // its size while hidden (offsetWidth/Height = 0) needs to re-measure now
  // that the toggle may have changed its visibility. home.html's inline
  // hero-canvas script listens for 'resize' to do exactly that.
  window.dispatchEvent(new Event('resize'));
}

// Theme-aware "ink" colour for canvas/Plotly drawing code that can't use
// CSS variables directly. Mirrors --text-primary in both themes so grid
// lines, axes, and labels stay visible whichever theme is active.
function amoInk(alpha) {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? `rgba(226,232,240,${alpha})`
    : `rgba(34,25,15,${alpha})`;
}
window.amoInk = amoInk;

// The actual flash-prevention happens via an inline <head> script (before
// first paint, before this file is even fetched). This call just syncs
// toggle-button icons/aria-state and re-dispatches 'resize' once the DOM
// (and any [data-theme-toggle] buttons from renderNav) exist.
applyTheme(getStoredTheme());

function initThemeToggle() {
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = getStoredTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  });
}

/* ─────────────────────────────────────────────────────
   NAV DATA
   ───────────────────────────────────────────────────── */
const NAV = {
  build: [
    { key: 'atom-library',   label: 'Atomic Species Selector',                kind: 'Reference', icon: '⚛️', color: '#a13c1c', href: 'pages/atom-library.html'   },
    { key: 'laser-planner',  label: 'Laser System Planner',        kind: 'Design tool', icon: '💡', color: '#2c4a63', href: 'pages/laser-planner.html'  },
    { key: 'mot-designer',   label: 'MOT Designer',                         kind: 'Calculator', icon: '🧲', color: '#3f5d3f', href: 'pages/mot-designer.html'   },
    { key: 'laser-locking',  label: 'Laser Locking Guide',   kind: 'Guide', icon: '🔐', color: '#a13c1c', href: 'pages/laser-locking.html'  },
    { key: 'lab-techniques', label: 'AMO Lab Operations Handbook',      kind: 'Guide', icon: '🔬', color: '#2c4a63', href: 'pages/lab-techniques.html' },
    { key: 'polarimetry',    label: 'Polarimetry Simulator', kind: 'Simulator', icon: '🔭', color: '#3f5d3f', href: 'pages/polarimetry.html'    },
    { key: 'zernike',        label: 'Zernike Wavefront Lab', kind: 'Simulator', icon: '🌊', color: '#a13c1c', href: 'pages/zernike.html'      },
    { key: 'cavity-qed',     label: 'Cavity QED Coupling Lab',       kind: 'Calculator', icon: '💎', color: '#2c4a63', href: 'pages/cavity-qed.html'   },
    { key: 'vacuum-systems',    label: 'Vacuum Systems Guide',        kind: 'Guide',      icon: '⚗️', color: '#3f5d3f', href: 'pages/vacuum-systems.html'    },
    { key: 'tweezer-designer', label: 'Tweezer Array Design Lab', kind: 'Design lab', icon: '🔦', color: '#a13c1c', href: 'pages/tweezer-designer.html' },
  ],
  measure: [
    { key: 'imaging-calculator', label: 'Single-atom Imaging',  kind: 'Calculator', icon: '📷', color: '#2c4a63', href: 'pages/imaging-calculator.html' },
    { key: 'release-recapture',  label: 'Single-atom Temperature',  kind: 'Simulator', icon: '🎯', color: '#3f5d3f', href: 'pages/release-recapture.html'  },
    { key: 'tof-calculator',     label: 'MOT Temperature',     kind: 'Calculator', icon: '🌡️', color: '#a13c1c', href: 'pages/tof-calculator.html'     },
    { key: 'lab-calculators',     label: 'Quick Lab Console',      kind: 'Calculator', icon: '🧮', color: '#2c4a63', href: 'pages/lab-calculators.html'    },
    { key: 'absorption-imaging', label: 'Absorption Imaging Lab',       kind: 'Imaging lab', icon: '🌑', color: '#3f5d3f', href: 'pages/absorption-imaging.html'  },
  ],
  cooling: [
    { key: 'laser-cooling',      label: 'Single-atom Cooling',     kind: 'Deep dive', icon: '❄️', color: '#a13c1c', href: 'pages/laser-cooling.html' },
    { key: 'cooling-simulator', label: 'Laser Cooling Simulator',   kind: 'Simulator', icon: '🌡️', color: '#2c4a63', href: 'pages/cooling-simulator.html' },
  ],
  quantum: [
    { key: 'decoherence-lab',    label: 'Decoherence Lab',       kind: 'Deep dive', icon: '🌀', color: '#a13c1c', href: 'pages/decoherence-lab.html' },
    { key: 'learn-quantum',      label: 'Quantum Computing Learning Path',              kind: 'Learning path', icon: '🔵', color: '#2c4a63', href: 'pages/learn-quantum.html' },
    { key: 'rydberg-calculator', label: 'Rydberg Blockade Lab',  kind: 'Calculator', icon: '🔮', color: '#3f5d3f', href: 'pages/rydberg-calculator.html' },
    { key: 'fidelity-budget',    label: 'Rydberg Gate Error Budget', kind: 'Calculator', icon: '📊', color: '#a13c1c', href: 'pages/fidelity-budget.html' },
    { key: 'rb-explorer',        label: 'Randomized Benchmarking',     kind: 'Deep dive', icon: '📈', color: '#2c4a63', href: 'pages/rb-explorer.html' },
    { key: 'dd-playground',      label: 'Dynamical Decoupling', kind: 'Simulator', icon: '🛡️', color: '#3f5d3f', href: 'pages/dd-playground.html' },
    { key: 'remote-entanglement', label: 'Remote Entanglement', kind: 'Deep dive', icon: '🔗', color: '#a13c1c', href: 'pages/remote-entanglement.html' },
  ],
  career: [
    { key: 'amo-groups',     label: 'AMO Group Finder',        kind: 'Career map', icon: '🌍', color: '#3f5d3f', href: 'pages/amo-groups.html' },
    { key: 'paper-syllabus', label: 'AMO Paper Roadmap',           kind: 'Syllabus', icon: '📚', color: '#3f5d3f', href: 'pages/paper-syllabus.html' },
    { key: 'qc-landscape',   label: 'Quantum Industry Map',      kind: 'Landscape', icon: '💻', color: '#2c4a63', href: 'pages/qc-landscape.html' },
    { key: 'rb87-vs-yb171',  label: 'Rb vs Yb Qubit Comparison', kind: 'Deep dive', icon: '⚖️', color: '#a13c1c', href: 'pages/rb87-vs-yb171.html' },
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

NAV.trapImageCool = [...NAV.measure, ...NAV.cooling];
NAV.tools = [...new Map([
  ...NAV.build,
  ...NAV.trapImageCool,
  ...NAV.quantum,
  ...NAV.career,
].map(item => [item.key || item.href, item])).values()];
NAV.industry = NAV.career;


/* ─────────────────────────────────────────────────────
   RENDER NAV
   Call: renderNav({ active: 'atom-library', root: '../' })
   ───────────────────────────────────────────────────── */
function renderNav({ active = '', root = '' } = {}) {
  const el = document.getElementById('nav-root');
  if (!el) return;

  const groupIsActive = group => group.some(t => t.key === active);
  const itemHTML = t => `
    <a class="nav-drop-item" href="${root}${t.href}" ${t.key && active === t.key ? 'aria-current="page"' : ''}>
      <span class="nav-drop-dot" style="background:${t.color || '#38bdf8'}"></span>
      <span style="display:flex;flex-direction:column;gap:.08rem;min-width:0">
        <span>${t.label}</span>
        ${t.kind ? `<small style="color:var(--text-muted);font-size:.68rem;letter-spacing:.02em">${t.kind}</small>` : ''}
      </span>
    </a>
  `;
  const mobileItemHTML = t => `
    <a class="nav-mobile-link" href="${root}${t.href}">
      <span class="nav-drop-dot" style="background:${t.color || '#38bdf8'};width:8px;height:8px;border-radius:50%;flex-shrink:0"></span>
      ${t.label}
    </a>
  `;
  const dropdown = (label, group, section, minWidth = 520) => `
    <div class="nav-item" role="none">
      <button class="nav-btn ${groupIsActive(group) ? 'active' : ''}" role="menuitem" aria-haspopup="true" aria-expanded="false">
        ${label}
        <svg class="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>
      <div class="nav-drop" role="menu" style="min-width:${minWidth}px">
        <div class="nav-drop-section">${section}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.05rem .25rem;">
          ${group.map(itemHTML).join('')}
        </div>
      </div>
    </div>
  `;
  const mobileSection = (title, group) => `
    <div class="nav-mobile-section">
      <div class="nav-mobile-section-title">${title}</div>
      ${group.map(mobileItemHTML).join('')}
    </div>
  `;

  el.innerHTML = `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <div class="nav-inner">
        <a class="nav-logo" href="${root}home.html" aria-label="AMO Toolkit home">
          <div class="nav-logo-mark">⚛️</div>
          <div>
            <div class="nav-logo-text"><span class="amo">AMO</span> Toolkit</div>
            <div class="nav-logo-sub">AMO physics tools</div>
          </div>
        </a>

        <div class="nav-links" role="menubar">
          <a class="nav-btn" href="${root}home.html#intent-paths">Start Here</a>
          ${dropdown('Build', NAV.build, 'Design and assemble an AMO experiment', 560)}
          ${dropdown('Trap, Image & Cool', NAV.trapImageCool, 'Trap atoms, measure signals, and model cooling', 620)}
          ${dropdown('Quantum Computing', NAV.quantum, 'Neutral-atom QC concepts, gates, and platforms', 560)}
          ${dropdown('Career & Literature', NAV.career, 'Groups, papers, and industry orientation', 520)}
          <a class="nav-btn" href="${root}home.html#about">About</a>
        </div>

        <div class="nav-right">
          <button class="nav-theme-toggle" data-theme-toggle type="button" aria-pressed="false" aria-label="Switch to dark theme">🌙</button>
          <button class="nav-search-btn" id="global-search-btn" type="button" aria-label="Search AMO Toolkit">
            <span>Search</span>
            <kbd>/</kbd>
          </button>
          <a class="nav-cta" href="${root}home.html#paths">Guided Paths</a>
        </div>

        <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <div class="nav-mobile-overlay" id="nav-mobile" role="dialog" aria-label="Mobile navigation">
      <div class="nav-mobile-section">
        <div class="nav-mobile-section-title">Start Here</div>
        <a class="nav-mobile-link" href="${root}home.html#intent-paths"><span>🧭</span> I am trying to...</a>
        <a class="nav-mobile-link" href="${root}home.html#paths"><span>🗺️</span> Guided Paths</a>
      </div>
      ${mobileSection('Build', NAV.build)}
      ${mobileSection('Trap, Image & Cool', NAV.trapImageCool)}
      ${mobileSection('Quantum Computing', NAV.quantum)}
      ${mobileSection('Career & Literature', NAV.career)}
      <div class="nav-mobile-section">
        <button class="nav-mobile-link nav-mobile-search" id="global-search-btn-mobile" type="button">
          <span>⌕</span> Search AMO Toolkit
        </button>
        <button class="nav-mobile-link" data-theme-toggle type="button" aria-pressed="false">
          <span data-theme-icon>🌙</span> <span data-theme-label>Dark theme</span>
        </button>
        <a class="nav-mobile-link" href="${root}home.html#about"><span>👤</span> About</a>
      </div>
    </div>

    <div class="global-search" id="global-search" hidden>
      <div class="global-search-backdrop" data-search-close></div>
      <div class="global-search-panel" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
        <div class="global-search-head">
          <div>
            <div class="global-search-kicker">Find by species, formula, technique, company, keyword</div>
            <h2 id="global-search-title">Search AMO Toolkit</h2>
          </div>
          <button class="global-search-close" type="button" data-search-close aria-label="Close search">×</button>
        </div>
        <input id="global-search-input" class="global-search-input" type="search"
          placeholder="Try: Cs, recoil, MOT, Rydberg, QuEra, polarimetry..." autocomplete="off">
        <div class="global-search-results" id="global-search-results" role="listbox"></div>
      </div>
    </div>
  `;

  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
    }
  });

  document.querySelectorAll('.nav-btn[aria-haspopup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.nav-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
      btn.setAttribute('aria-expanded', !wasOpen);
    });
  });

  initGlobalSearch(root);
  initThemeToggle();
  applyTheme(getStoredTheme());
}


/* ─────────────────────────────────────────────────────
   SCROLL REVEAL
   ───────────────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.anim-in');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────────────
   ACCORDION
   ───────────────────────────────────────────────────── */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const acc = header.closest('.accordion');
      const isOpen = acc.classList.toggle('open');
      header.setAttribute('aria-expanded', isOpen);
    });
  });
}

/* ─────────────────────────────────────────────────────
   TABS
   ───────────────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.tab-bar').forEach(bar => {
    const group = bar.dataset.group;
    bar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        // Update buttons
        bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panels — only filter by group when the panel declares one
        const wrap = bar.closest('[data-tabs-wrap]') || document;
        wrap.querySelectorAll(`.tab-panel[data-tab]`).forEach(p => {
          if (p.dataset.group && group && p.dataset.group !== group) return;
          p.classList.toggle('active', p.dataset.tab === target);
        });
      });
    });
  });
}

/* ─────────────────────────────────────────────────────
   SMOOTH ANCHOR SCROLL (for in-page links)
   ───────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // nav height
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────────────
   SEARCH, RECENTS, SHARE LINKS, EXPORTS
   ───────────────────────────────────────────────────── */
const RECENT_TOOLS_KEY = 'amo_recent_tools_v1';

const SEARCH_KEYWORDS = {
  'atom-library': 'species isotope constants Rb Cs Li Sr Yb Dy Er K Na Ca Ba Doppler linewidth recoil hyperfine Steck NIST D1 D2',
  'lab-techniques': 'optics fibers AOM polarimetry optical pumping laser systems RF antenna Gaussian process lab workflow alignment vacuum',
  'laser-planner': 'laser system planner wavelength source diode SHG SFG AOM fiber species beam path power',
  'rydberg-calculator': 'Rydberg blockade C6 quantum defect lifetime Förster two-qubit gate radius alkali',
  'imaging-calculator': 'SNR fidelity photons EMCCD sCMOS histogram survival fluorescence single atom readout',
  'tof-calculator': 'time of flight thermometry temperature expansion PSD BEC Maxwell Boltzmann',
  'mot-designer': 'MOT magneto-optical trap gradient spring damping capture detuning Zeeman cooling cascade',
  'fidelity-budget': 'Rydberg gate error budget blockade Doppler phase SPAM lifetime intensity noise fidelity',
  'release-recapture': 'tweezer thermometry recapture release Monte Carlo trap depth temperature',
  'lab-calculators': 'beam waist dBm recoil Doppler Zeeman saturation cavity FSR finesse trap frequency Clebsch Gordan',
  'laser-locking': 'SAS PDH beat note offset lock PLL cavity servo linewidth frequency stabilization',
  'zernike': 'wavefront aberration SLM hologram Gerchberg Saxton Zernike tweezer correction',
  'polarimetry': 'Stokes Poincare QWP HWP PBS RCP LCP sigma polarization ellipticity',
  'qc-landscape': 'company roadmap IBM Google Quantinuum QuEra Atom Computing Microsoft IonQ Pasqal PsiQuantum interviews',
  'rb87-vs-yb171': 'qubit species comparison rubidium ytterbium neutral atom hyperfine nuclear spin clock',
  'rb-explorer': 'randomized benchmarking Clifford SPAM gate fidelity decay interleaved RB',
  'dd-playground': 'coherence Ramsey echo XY16 CPMG dynamical decoupling dephasing noise',
  'amo-groups': 'AMO research groups professors labs universities postdoc graduate school Rydberg clocks BEC molecules cavity QED',
  'paper-syllabus': 'AMO reading list papers syllabus reviews foundational literature Nobel cooling traps clocks Rydberg',
  'cooling-simulator': 'Doppler cooling molasses scattering temperature force simulator',
  'laser-cooling': 'Lamb-Dicke sideband gray molasses EIT Raman RSB polarization gradient cooling',
  'learn-quantum': 'Bloch sphere gates superposition measurement entanglement algorithms qubit basics',
};

function getSearchEntries(root = '') {
  const fromNav = [
    ...NAV.tools,
    ...NAV.industry,
    ...NAV.cooling.map(item => ({ key: item.key || 'laser-cooling', ...item })),
    ...NAV.learn.map(item => ({ ...item, href: 'pages/learn-quantum.html' + (item.href.includes('#') ? item.href.slice(item.href.indexOf('#')) : '') })),
  ];

  const byHref = new Map();
  fromNav.forEach(item => {
    const key = item.key || item.href.split('/').pop().replace('.html', '').split('#')[0];
    const baseHref = item.href.includes('#') ? item.href : item.href;
    const normalized = baseHref.replace(/^pages\//, '');
    const href = item.href.startsWith('pages/') ? `${root}${item.href}` : `${root}${item.href}`;
    const id = `${key}:${normalized}`;
    if (byHref.has(id)) return;
    byHref.set(id, {
      key,
      title: item.label,
      icon: item.icon || '•',
      href,
      keywords: `${item.label} ${SEARCH_KEYWORDS[key] || ''}`.toLowerCase(),
      color: item.color || '#38bdf8',
    });
  });

  byHref.set('laser-cooling:overview', {
    key: 'laser-cooling',
    title: 'Single-atom Cooling Guide',
    icon: '❄️',
    href: `${root}pages/laser-cooling.html`,
    color: '#a13c1c',
    keywords: SEARCH_KEYWORDS['laser-cooling'].toLowerCase(),
  });

  return Array.from(byHref.values());
}

function normalizeHref(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.pathname.replace(/\/+$/, '') + url.hash;
  } catch {
    return href;
  }
}

function siteRelativeHref(href) {
  try {
    const url = new URL(href, window.location.href);
    const marker = '/amo-career/';
    const path = url.pathname.includes(marker)
      ? url.pathname.slice(url.pathname.indexOf(marker) + marker.length)
      : url.pathname.replace(/^\/+/, '');
    return `${path}${url.hash}`;
  } catch {
    return href.replace(/^\.\.\//, '');
  }
}

function recordRecentTool(entry) {
  if (!entry || !entry.href) return;
  const item = {
    title: entry.title,
    href: siteRelativeHref(entry.href),
    icon: entry.icon || '•',
    color: entry.color || '#38bdf8',
    ts: Date.now(),
  };
  const current = JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) || '[]')
    .filter(x => x.href !== item.href);
  current.unshift(item);
  localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(current.slice(0, 6)));
}

function renderRecentTools() {
  const el = document.getElementById('recent-tools');
  if (!el) return;
  const recent = JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) || '[]');
  if (!recent.length) {
    el.innerHTML = `
      <div class="recent-empty">
        Your recently used tools will appear here after you open a calculator or guide.
      </div>`;
    return;
  }
  const root = location.pathname.includes('/pages/') ? '../' : '';
  el.innerHTML = recent.map(item => `
    <a class="recent-tool" href="${root}${item.href.replace(/^\.\.\//, '')}">
      <span class="recent-tool-dot" style="background:${item.color}"></span>
      <span>${item.icon}</span>
      <strong>${item.title}</strong>
    </a>
  `).join('');
}

function initGlobalSearch(root = '') {
  const modal = document.getElementById('global-search');
  const input = document.getElementById('global-search-input');
  const results = document.getElementById('global-search-results');
  const openBtns = [document.getElementById('global-search-btn'), document.getElementById('global-search-btn-mobile')].filter(Boolean);
  if (!modal || !input || !results || modal.dataset.ready) return;
  modal.dataset.ready = 'true';
  const entries = getSearchEntries(root);

  function score(entry, q) {
    if (!q) return 1;
    const hay = `${entry.title} ${entry.key} ${entry.keywords}`;
    return q.split(/\s+/).reduce((acc, token) => acc + (hay.includes(token) ? 2 : 0) + (entry.title.toLowerCase().includes(token) ? 3 : 0), 0);
  }

  function render(q = '') {
    const query = q.trim().toLowerCase();
    const matches = entries
      .map(entry => ({ entry, s: score(entry, query) }))
      .filter(x => !query || x.s > 0)
      .sort((a, b) => b.s - a.s || a.entry.title.localeCompare(b.entry.title))
      .slice(0, 12);

    results.innerHTML = matches.map(({ entry }) => `
      <a class="search-result" href="${entry.href}" data-search-href="${entry.href}">
        <span class="search-result-icon" style="--sr:${entry.color}">${entry.icon}</span>
        <span>
          <strong>${entry.title}</strong>
          <small>${(SEARCH_KEYWORDS[entry.key] || '').split(' ').slice(0, 8).join(' ')}</small>
        </span>
      </a>
    `).join('') || '<div class="search-no-results">No matches yet. Try a species, equation, or company name.</div>';
  }

  function openSearch() {
    modal.hidden = false;
    document.body.classList.add('search-open');
    render(input.value);
    setTimeout(() => input.focus(), 20);
  }

  function closeSearch() {
    modal.hidden = true;
    document.body.classList.remove('search-open');
  }

  openBtns.forEach(btn => btn.addEventListener('click', openSearch));
  modal.querySelectorAll('[data-search-close]').forEach(btn => btn.addEventListener('click', closeSearch));
  input.addEventListener('input', () => render(input.value));
  results.addEventListener('click', e => {
    const a = e.target.closest('a.search-result');
    if (!a) return;
    const entry = entries.find(x => normalizeHref(x.href) === normalizeHref(a.href));
    recordRecentTool(entry);
  });

  document.addEventListener('keydown', e => {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (e.key === '/' && !typing && modal.hidden) {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && !modal.hidden) closeSearch();
  });
}

function initRecentTracking() {
  const root = location.pathname.includes('/pages/') ? '../' : '';
  const entries = getSearchEntries(root);
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = normalizeHref(a.href);
    const entry = entries.find(x => normalizeHref(x.href) === href || href.endsWith(normalizeHref(x.href)));
    if (entry) {
      recordRecentTool({
        ...entry,
        href: a.getAttribute('href'),
      });
    }
  });
}

function initDerivationToggles() {
  document.querySelectorAll('.derivation-mode').forEach(box => {
    if (box.dataset.ready) return;
    box.dataset.ready = 'true';
    const buttons = box.querySelectorAll('[data-deriv-tab]');
    const panels = box.querySelectorAll('[data-deriv-panel]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.derivTab;
        buttons.forEach(b => b.classList.toggle('active', b === btn));
        panels.forEach(p => p.hidden = p.dataset.derivPanel !== target);
      });
    });
  });
}

function initShareableCalculatorParams() {
  const calculatorPath = /calculator|designer|recapture|fidelity-budget|lab-calculators|cooling-simulator/.test(location.pathname);
  if (!calculatorPath) return;
  const controls = Array.from(document.querySelectorAll('.ctrl-panel input[id], .ctrl-panel select[id], .calc-card input[id], .calc-card select[id]'))
    .filter(el => !['button', 'submit', 'reset'].includes(el.type));
  if (!controls.length) return;

  const params = new URLSearchParams(location.search);
  let applied = false;
  controls.forEach(el => {
    if (!params.has(el.id)) return;
    el.value = params.get(el.id);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    applied = true;
  });
  if (applied && typeof window.compute === 'function') window.compute();

  let timer;
  function updateUrl() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const next = new URLSearchParams(location.search);
      controls.forEach(el => {
        if (el.value !== '' && el.value !== null) next.set(el.id, el.value);
      });
      const qs = next.toString();
      history.replaceState(null, '', `${location.pathname}${qs ? '?' + qs : ''}${location.hash}`);
    }, 150);
  }
  controls.forEach(el => {
    el.addEventListener('input', updateUrl);
    el.addEventListener('change', updateUrl);
  });

  const target = document.querySelector('.page-hero .container') || document.querySelector('.container');
  if (target && !document.querySelector('.share-url-card')) {
    const share = document.createElement('div');
    share.className = 'share-url-card';
    share.innerHTML = `
      <span>Share this calculator state with URL parameters.</span>
      <button class="mini-action" type="button" data-copy-share-url>Copy current URL</button>
    `;
    target.appendChild(share);
    share.querySelector('button').addEventListener('click', async () => {
      const next = new URLSearchParams(location.search);
      controls.forEach(el => {
        if (el.value !== '' && el.value !== null) next.set(el.id, el.value);
      });
      const qs = next.toString();
      history.replaceState(null, '', `${location.pathname}${qs ? '?' + qs : ''}${location.hash}`);
      await navigator.clipboard?.writeText(location.href);
      share.classList.add('copied');
      setTimeout(() => share.classList.remove('copied'), 1200);
    });
  }
}

function isToolLikePage() {
  return /calculator|designer|recapture|fidelity-budget|cooling-simulator|polarimetry|cavity-qed|lab-techniques|laser-cooling|tof|imaging|rydberg/.test(location.pathname);
}

function getPageContainer() {
  return document.querySelector('.page-content > .container')
    || document.querySelector('.page-content')
    || document.querySelector('main .container')
    || document.querySelector('main');
}

function getPageControls() {
  return Array.from(document.querySelectorAll('main input[id], main select[id], main textarea[id], .page-content input[id], .page-content select[id], .page-content textarea[id]'))
    .filter(el => !['button', 'submit', 'reset', 'hidden'].includes(el.type))
    .filter(el => !el.closest('.global-search, .nav, .nav-mobile-overlay, .lab-notebook-panel'));
}

function currentPageKey() {
  const file = location.pathname.split('/').pop()?.replace('.html', '') || 'home';
  return file;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function hasCalculatorState() {
  const controls = getPageControls()
    .filter(el => !el.closest('.source-confidence-panel, .assumption-panel'));
  const outputs = document.querySelectorAll('.result-value, .metric-value, .output-value, .kpi-value, .calc-output, canvas');
  return controls.length > 0 || outputs.length > 0;
}

const ASSUMPTION_DEFS = {
  'two-level atom': 'Treats the atom as an effective closed transition. Breaks down when hyperfine branching, dark states, or optical pumping dominate.',
  'low saturation': 'Uses weak-excitation or near-linear scattering estimates. At high saturation, power broadening and multilevel dynamics matter.',
  'Gaussian beam': 'Assumes an ideal TEM00 beam. Aberrations, clipping, and mode mismatch change intensity and trap frequencies.',
  'harmonic approximation': 'Expands the trap near the bottom. It is accurate for cold atoms but not for hot tails near the trap edge.',
  'far-detuned trap': 'Assumes the trap light mostly produces conservative AC Stark shifts. Near resonances, scattering and vector/tensor shifts require care.',
  'classical thermometry': 'Uses classical phase-space sampling. Near the motional ground state, sideband thermometry is more direct.',
  'Lamb-Dicke approximation': 'Assumes recoil is small compared with the trap length scale. Check eta^2(2n+1) << 1.',
  'ballistic expansion': 'Assumes interactions and trap forces are negligible after release. Dense clouds or imperfect switch-off can violate this.',
  'independent noise': 'Adds photon, camera, and background noise independently. Technical correlations can make real histograms wider.',
  'Rydberg scaling estimate': 'Uses scaling laws or simplified C6 estimates. Near Förster resonances, pair-state calculations are required.',
  'independent error budget': 'Adds gate error channels as if they are separable. Coherent errors can interfere and require full simulation.',
};

const PAGE_ASSUMPTIONS = {
  'imaging-calculator': ['two-level atom', 'low saturation', 'independent noise'],
  'release-recapture': ['classical thermometry', 'Gaussian beam', 'ballistic expansion', 'harmonic approximation'],
  'tof-calculator': ['classical thermometry', 'ballistic expansion'],
  'lab-calculators': ['Gaussian beam', 'far-detuned trap', 'harmonic approximation', 'two-level atom'],
  'mot-designer': ['two-level atom', 'low saturation'],
  'rydberg-calculator': ['Rydberg scaling estimate', 'independent error budget'],
  'fidelity-budget': ['independent error budget', 'Rydberg scaling estimate', 'Lamb-Dicke approximation'],
  'laser-cooling': ['Lamb-Dicke approximation', 'two-level atom', 'low saturation'],
  'cooling-simulator': ['two-level atom', 'low saturation', 'classical thermometry'],
  'polarimetry': ['independent noise'],
  'cavity-qed': ['Gaussian beam', 'two-level atom'],
};

function initAssumptionBadges() {
  if (!isToolLikePage()) return;
  const assumptions = PAGE_ASSUMPTIONS[currentPageKey()];
  if (!assumptions?.length) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.assumption-panel')) return;
  const panel = document.createElement('section');
  panel.className = 'assumption-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head compact">
      <div>
        <div class="eyebrow">Assumption Badges</div>
        <h2>Know when the formula breaks</h2>
      </div>
      <p class="assumption-explain" aria-live="polite">Click a badge to see the failure mode.</p>
    </div>
    <div class="assumption-badges">
      ${assumptions.map(a => `<button class="assumption-badge" type="button" data-assumption="${a}">${a}</button>`).join('')}
    </div>
  `;
  const afterIntro = document.querySelector('.source-confidence-panel') || document.querySelector('.page-playbook-panel');
  if (afterIntro) afterIntro.after(panel);
  else container.prepend(panel);
  const explain = panel.querySelector('.assumption-explain');
  panel.addEventListener('click', e => {
    const badge = e.target.closest('[data-assumption]');
    if (!badge) return;
    panel.querySelectorAll('.assumption-badge').forEach(b => b.classList.toggle('active', b === badge));
    explain.textContent = ASSUMPTION_DEFS[badge.dataset.assumption] || 'This is a user-adjustable modeling choice; check the page text before treating the output as a measurement.';
  });
}

const SOURCE_PROFILES = {
  'qc-landscape': [
    ['peer-reviewed', 'Use peer-reviewed papers for demonstrated fidelities, logical-qubit experiments, and algorithms.'],
    ['company roadmap', 'Treat future dates and product claims as roadmap claims, not independent physics results.'],
    ['rough estimate', 'Cross-platform tables compress many hardware-specific definitions into approximate comparisons.'],
  ],
  'rb87-vs-yb171': [
    ['peer-reviewed', 'Atomic constants, gate demonstrations, and clock/tweezer results should trace to papers or data tables.'],
    ['rough estimate', 'Architecture-level comparisons depend strongly on assumptions about cooling, loading, and error correction.'],
  ],
  'paper-syllabus': [
    ['peer-reviewed', 'Primary source for each card is the linked paper or review.'],
    ['textbook', 'Use textbooks/reviews for standard derivations and definitions.'],
  ],
  defaultTool: [
    ['textbook', 'Core formulas follow standard AMO optics, laser-cooling, and quantum-optics references.'],
    ['peer-reviewed', 'Benchmark numbers and experimentally demonstrated regimes should be checked against papers.'],
    ['rough estimate', 'Calculator outputs are design estimates unless the page explicitly models the full apparatus.'],
    ['user-adjustable assumption', 'Inputs like waist, power, collection efficiency, and background are experiment-dependent.'],
  ],
  defaultPage: [
    ['textbook', 'Introductory explanations use standard AMO and quantum-information conventions.'],
    ['peer-reviewed', 'Specific scientific claims should be traceable to the linked papers or references on the page.'],
  ],
};

function initSourceConfidencePanels() {
  if (!location.pathname.includes('/pages/')) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.source-confidence-panel')) return;
  const key = currentPageKey();
  const sources = SOURCE_PROFILES[key] || (isToolLikePage() ? SOURCE_PROFILES.defaultTool : SOURCE_PROFILES.defaultPage);
  const tagClass = tag => String(tag).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const panel = document.createElement('details');
  panel.className = 'source-confidence-panel workflow-panel';
  panel.innerHTML = `
    <summary>
      <span>
        <span class="eyebrow">Sources and Confidence</span>
        <strong>How to read this page</strong>
      </span>
      <span class="source-summary-hint">expand</span>
    </summary>
    <div class="source-confidence-grid">
      ${sources.map(([tag, body]) => `
        <div class="source-confidence-card">
          <span class="source-tag ${tagClass(tag)}">${tag}</span>
          <p>${body}</p>
        </div>
      `).join('')}
    </div>
  `;
  const afterAssumptions = document.querySelector('.assumption-panel') || document.querySelector('.expert-mode-panel') || document.querySelector('.page-playbook-panel');
  if (afterAssumptions) afterAssumptions.after(panel);
  else container.prepend(panel);
}

function initLabNotebook() {
  if (!isToolLikePage()) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.lab-notebook-panel')) return;
  if (!hasCalculatorState()) return;
  const panel = document.createElement('section');
  panel.className = 'lab-notebook-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head">
      <div>
        <div class="eyebrow">Lab Notebook Mode</div>
        <h2>Save this calculation locally</h2>
        <p>Snapshots stay in this browser via localStorage. Export Markdown for your notebook or JSON for scripts.</p>
      </div>
      <div class="notebook-count" aria-live="polite"></div>
    </div>
    <textarea id="labNotebookNotes" rows="3" placeholder="Notes: apparatus, assumptions, why this setting matters..."></textarea>
    <div class="notebook-actions">
      <button class="mini-action" type="button" data-save-notebook>Save snapshot</button>
      <button class="mini-action" type="button" data-export-notebook-md>Export Markdown</button>
      <button class="mini-action" type="button" data-export-notebook-json>Export JSON</button>
      <button class="mini-action muted" type="button" data-clear-notebook>Clear local snapshots</button>
    </div>
  `;
  const afterSources = document.querySelector('.source-confidence-panel') || document.querySelector('.assumption-panel') || document.querySelector('.page-playbook-panel');
  if (afterSources) afterSources.after(panel);
  else container.prepend(panel);

  const key = 'amo_lab_notebook_v1';
  const count = panel.querySelector('.notebook-count');
  const read = () => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
  };
  const write = items => localStorage.setItem(key, JSON.stringify(items));
  const updateCount = () => { count.textContent = `${read().length} saved snapshots`; };
  const collectOutputs = () => Array.from(document.querySelectorAll('.result-value, .metric-value, .output-value, .kpi-value, td, .info-banner'))
    .slice(0, 40)
    .map(el => el.textContent.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
  const snapshot = () => ({
    title: document.querySelector('h1')?.textContent.trim() || currentPageKey(),
    page: location.pathname.split('/').pop(),
    url: location.href,
    savedAt: new Date().toISOString(),
    controls: Object.fromEntries(getPageControls().map(el => [el.id, el.type === 'checkbox' ? el.checked : el.value])),
    outputs: collectOutputs(),
    notes: panel.querySelector('#labNotebookNotes').value.trim(),
  });
  const toMarkdown = items => items.map(item => [
    `# ${item.title}`,
    `- Saved: ${item.savedAt}`,
    `- Page: ${item.url}`,
    item.notes ? `- Notes: ${item.notes}` : '',
    '',
    '## Inputs',
    ...Object.entries(item.controls).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## Outputs',
    ...item.outputs.map(v => `- ${v}`),
  ].filter(Boolean).join('\n')).join('\n\n---\n\n');
  panel.addEventListener('click', e => {
    if (e.target.matches('[data-save-notebook]')) {
      const items = read();
      items.unshift(snapshot());
      write(items.slice(0, 50));
      panel.querySelector('#labNotebookNotes').value = '';
      updateCount();
    }
    if (e.target.matches('[data-export-notebook-md]')) {
      downloadText('amo-lab-notebook.md', toMarkdown(read()), 'text/markdown');
    }
    if (e.target.matches('[data-export-notebook-json]')) {
      downloadText('amo-lab-notebook.json', JSON.stringify(read(), null, 2), 'application/json');
    }
    if (e.target.matches('[data-clear-notebook]')) {
      write([]);
      updateCount();
    }
  });
  updateCount();
}

function initExpertModeToggles() {
  const densePages = /laser-cooling|rydberg-calculator|imaging-calculator|fidelity-budget|polarimetry/.test(location.pathname);
  if (!densePages) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.expert-mode-panel')) return;
  const mode = localStorage.getItem('amo_density_mode') || 'working';
  const panel = document.createElement('section');
  panel.className = 'expert-mode-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head compact">
      <div>
        <div class="eyebrow">Reading Depth</div>
        <h2>Beginner / Working / Expert</h2>
      </div>
      <div class="mode-toggle" role="group" aria-label="Reading depth">
        <button type="button" data-mode="beginner">Beginner</button>
        <button type="button" data-mode="working">Working</button>
        <button type="button" data-mode="expert">Expert</button>
      </div>
    </div>
    <p class="mode-copy" aria-live="polite"></p>
  `;
  const afterPlaybook = document.querySelector('.page-playbook-panel');
  if (afterPlaybook) afterPlaybook.after(panel);
  else container.prepend(panel);
  const copy = panel.querySelector('.mode-copy');
  const apply = next => {
    document.body.dataset.depthMode = next;
    localStorage.setItem('amo_density_mode', next);
    panel.querySelectorAll('[data-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === next));
    copy.textContent = {
      beginner: 'Read for intuition first: formula boxes and derivation blocks are hidden so pictures, meaning, and common failure modes lead.',
      working: 'Use the page as a lab tool: equations, knobs, and operational examples are emphasized.',
      expert: 'Read with assumptions in mind: derivations, edge cases, and model limits are the main thing to check.',
    }[next];
  };
  panel.addEventListener('click', e => {
    const btn = e.target.closest('[data-mode]');
    if (btn) apply(btn.dataset.mode);
  });
  apply(mode);
}

/* ─────────────────────────────────────────────────────
   Shared page-identity helper used by Cite This Page and
   the error-report widget below.
   ───────────────────────────────────────────────────── */
function getPageMeta() {
  const canonical = document.querySelector('link[rel="canonical"]');
  const url = canonical ? canonical.href : location.href;
  const rawTitle = document.title || currentPageKey();
  const title = rawTitle.replace(/\s*[—,]\s*AMO Toolkit\s*$/, '').trim();
  return { url, title };
}

/* ─────────────────────────────────────────────────────
   CITE THIS PAGE — plain-text + BibTeX citation, on every
   tool/guide page (anything using the .page-wrap template).
   ───────────────────────────────────────────────────── */
function initCiteThisPage() {
  if (!document.querySelector('.page-wrap')) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.cite-panel')) return;

  const { url, title } = getPageMeta();
  const year = new Date().getFullYear();
  const accessed = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const slug = currentPageKey().replace(/[^a-z0-9]/gi, '');

  const plain = `Phatak, S. (${year}). ${title}. AMO Toolkit. Retrieved ${accessed}, from ${url}`;
  const bibtex = `@misc{phatak${year}${slug},\n  author       = {Phatak, Saumitra},\n  title        = {${title}},\n  year         = {${year}},\n  howpublished = {\\url{${url}}},\n  note         = {AMO Toolkit}\n}`;

  const panel = document.createElement('section');
  panel.className = 'cite-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head compact">
      <div>
        <div class="eyebrow">Cite This Page</div>
        <h2>Reference this tool or guide</h2>
      </div>
    </div>
    <p style="margin-bottom:var(--sp-4)">If a formula, number, or figure from this page ended up in a thesis, paper, or lab notebook, here is a ready-made citation.</p>
    <div class="cite-block">
      <div class="cite-block-label">Plain text</div>
      <pre class="cite-pre">${escapeHtml(plain)}</pre>
      <button class="mini-action" type="button" data-copy-cite="plain">Copy citation</button>
    </div>
    <div class="cite-block" style="margin-top:var(--sp-4)">
      <div class="cite-block-label">BibTeX</div>
      <pre class="cite-pre">${escapeHtml(bibtex)}</pre>
      <button class="mini-action" type="button" data-copy-cite="bibtex">Copy BibTeX</button>
    </div>
  `;
  container.appendChild(panel);

  panel.addEventListener('click', e => {
    const btn = e.target.closest('[data-copy-cite]');
    if (!btn || !navigator.clipboard) return;
    const text = btn.dataset.copyCite === 'plain' ? plain : bibtex;
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = original; }, 1400);
    }).catch(() => {});
  });
}

/* ─────────────────────────────────────────────────────
   REPORT AN ERROR — visible trust signal that this content
   is maintained and correctable, not a one-shot static dump.
   ───────────────────────────────────────────────────── */
function initErrorReportWidget() {
  if (!document.querySelector('.page-wrap')) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.feedback-panel')) return;

  const { url, title } = getPageMeta();
  const issueTitle = encodeURIComponent(`[${title}] `);
  const issueBody = encodeURIComponent(`Page: ${url}\n\nWhat's wrong or unclear?\n`);
  const issueUrl = `https://github.com/saumitraphatak/amo-career/issues/new?title=${issueTitle}&body=${issueBody}`;
  const mailSubject = encodeURIComponent(`AMO Toolkit — issue on "${title}"`);
  const mailBody = encodeURIComponent(`Page: ${url}\n\nWhat's wrong or unclear?\n`);
  const mailUrl = `mailto:saumitraphatak@gmail.com?subject=${mailSubject}&body=${mailBody}`;

  const panel = document.createElement('section');
  panel.className = 'feedback-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head compact">
      <div>
        <div class="eyebrow">Found a Problem?</div>
        <h2>Report an error or suggest an improvement</h2>
      </div>
    </div>
    <p style="margin-bottom:var(--sp-4)">This site is maintained by one person and cross-checked with a physics regression test suite — but if a formula, number, or explanation here is wrong, unclear, or out of date, flagging it directly is the fastest way to get it fixed.</p>
    <div class="notebook-actions">
      <a class="mini-action" href="${issueUrl}" target="_blank" rel="noopener">Open a GitHub issue</a>
      <a class="mini-action" href="${mailUrl}">Email the author</a>
    </div>
  `;
  container.appendChild(panel);
}

function initPaperToolBridge() {
  if (currentPageKey() !== 'paper-syllabus') return;
  const cards = document.querySelectorAll('.paper-card');
  if (!cards.length || document.querySelector('.paper-tool-bridge')) return;
  const root = '../';
  const bridges = [
    { re: /ashkin|dipole trap|optical tweez|schlosser|kaufman/i, links: [['Trap tools', 'pages/lab-calculators.html'], ['Tweezer thermometry', 'pages/release-recapture.html']] },
    { re: /raab|mot|magneto-optical/i, links: [['MOT designer', 'pages/mot-designer.html'], ['Cooling overview', 'pages/laser-cooling.html']] },
    { re: /dalibard|cohen|tannoudji|chu|phillips|cooling|sisyphus|gray molasses|sideband/i, links: [['Laser cooling', 'pages/laser-cooling.html'], ['Cooling simulator', 'pages/cooling-simulator.html']] },
    { re: /rydberg|jaksch|saffman|evered|blockade|förster|foerster/i, links: [['Rydberg calculator', 'pages/rydberg-calculator.html'], ['Fidelity budget', 'pages/fidelity-budget.html']] },
    { re: /ytterbium|yb|strontium|sr|jenkins|clock/i, links: [['Rb vs Yb', 'pages/rb87-vs-yb171.html'], ['Atom library', 'pages/atom-library.html']] },
    { re: /kaufman|ni|molecule|molecular|polar molecule/i, links: [['Atom library', 'pages/atom-library.html'], ['AMO groups', 'pages/amo-groups.html']] },
    { re: /manetsch|logical|fault|neutral atom|quantum processor|quera|harvard/i, links: [['QC landscape', 'pages/qc-landscape.html'], ['Rb vs Yb', 'pages/rb87-vs-yb171.html']] },
    { re: /cavity|strong coupling|cooperativity/i, links: [['Cavity QED', 'pages/cavity-qed.html'], ['Lab techniques', 'pages/lab-techniques.html']] },
    { re: /bose-einstein|condensation|feshbach|dilute atomic vapor/i, links: [['TOF thermometry (BEC threshold)', 'pages/tof-calculator.html'], ['Analog simulation', 'pages/learn-quantum.html#analog-sim']] },
    { re: /optical lattice|quantum simulation|hubbard/i, links: [['Analog simulation', 'pages/learn-quantum.html#analog-sim'], ['QC landscape', 'pages/qc-landscape.html']] },
  ];
  cards.forEach(card => {
    const text = card.textContent;
    const match = bridges.find(b => b.re.test(text));
    if (!match) return;
    const box = document.createElement('div');
    box.className = 'paper-tool-bridge';
    box.innerHTML = `
      <span>Paper-to-tool bridge:</span>
      ${match.links.map(([label, href]) => `<a href="${root}${href.replace(/^pages\//, 'pages/')}">${label}</a>`).join('')}
    `;
    card.querySelector('.paper-body')?.appendChild(box);
  });
}

/* ─────────────────────────────────────────────────────
   GUIDED PATHS CONCEPT MAP — reads the existing .path-card
   list on home.html (single source of truth) and renders it
   as an interactive radial graph: nodes = tools, edges = the
   step-to-step order within each guided path.
   ───────────────────────────────────────────────────── */
function initPathConceptMap() {
  const root = document.getElementById('concept-map-root');
  if (!root || root.dataset.built) return;

  const cards = Array.from(document.querySelectorAll('.path-card'));
  if (!cards.length) return;

  const PATH_COLORS = ['#fb923c', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#fbbf24'];

  const paths = cards.map((card, i) => ({
    icon: card.querySelector('.path-icon')?.textContent.trim() || '•',
    title: card.querySelector('.path-title')?.textContent.trim() || `Path ${i + 1}`,
    color: PATH_COLORS[i % PATH_COLORS.length],
    steps: Array.from(card.querySelectorAll('.path-step')).map(a => a.getAttribute('href')),
  }));

  // Category order matches the site's own workflow grouping (Build →
  // Measure & Cool → Quantum → Career) so the radial layout reads the
  // same way the tool grid and footer already do.
  const categoryOrder = [
    ...NAV.build, ...NAV.measure, ...NAV.cooling, ...NAV.quantum, ...NAV.career,
  ];
  const nodeHrefs = [...new Set(paths.flatMap(p => p.steps))];
  nodeHrefs.sort((a, b) => {
    const ia = categoryOrder.findIndex(t => t.href === a);
    const ib = categoryOrder.findIndex(t => t.href === b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const N = nodeHrefs.length;
  const SIZE = 640, CX = 320, CY = 320, R = 248;
  const nodes = nodeHrefs.map((href, i) => {
    const tool = NAV.tools.find(t => t.href === href);
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
    return {
      href,
      label: tool ? tool.label : href,
      color: tool ? tool.color : '#38bdf8',
      x: CX + R * Math.cos(angle),
      y: CY + R * Math.sin(angle),
      angle,
    };
  });
  const nodeByHref = new Map(nodes.map(n => [n.href, n]));

  const edges = [];
  paths.forEach((p, pi) => {
    for (let i = 0; i < p.steps.length - 1; i++) {
      const a = nodeByHref.get(p.steps[i]);
      const b = nodeByHref.get(p.steps[i + 1]);
      if (a && b) edges.push({ a, b, pathIndex: pi, color: p.color });
    }
  });

  const edgeSvg = edges.map((e, i) => `
    <line class="cmap-edge" data-path="${e.pathIndex}"
      x1="${e.a.x.toFixed(1)}" y1="${e.a.y.toFixed(1)}"
      x2="${e.b.x.toFixed(1)}" y2="${e.b.y.toFixed(1)}"
      stroke="${e.color}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
  `).join('');

  const nodeSvg = nodes.map(n => {
    const onRight = Math.cos(n.angle) >= 0;
    const lx = CX + (R + 16) * Math.cos(n.angle);
    const ly = CY + (R + 16) * Math.sin(n.angle);
    return `
    <a href="${escapeHtml(n.href)}" class="cmap-node-link" aria-label="Open ${escapeHtml(n.label)}">
      <circle class="cmap-node" data-href="${escapeHtml(n.href)}" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="7" fill="${n.color}" stroke="var(--bg-base)" stroke-width="2">
        <title>${escapeHtml(n.label)}</title>
      </circle>
      <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${onRight ? 'start' : 'end'}"
        dominant-baseline="middle" style="fill:var(--text-secondary);font-size:9.5px;font-family:var(--font-sans,sans-serif)">${escapeHtml(n.label)}</text>
    </a>
  `;
  }).join('');

  const legendSvg = paths.map((p, i) => `
    <button type="button" class="cmap-legend-btn" data-path="${i}" style="--path-color:${p.color}">
      <span class="cmap-legend-dot"></span>${p.icon} ${escapeHtml(p.title)}
    </button>
  `).join('');

  root.innerHTML = `
    <p class="cmap-caption">Click a path to trace it through the graph, or click any node to open that tool directly.</p>
    <div class="cmap-legend">${legendSvg}</div>
    <svg class="cmap-svg" viewBox="0 0 ${SIZE} ${SIZE}" role="group" aria-label="Guided paths concept map">
      <g class="cmap-edges">${edgeSvg}</g>
      <g class="cmap-nodes">${nodeSvg}</g>
    </svg>
  `;
  root.dataset.built = 'true';

  let active = null;
  const svg = root.querySelector('.cmap-svg');
  const setActive = idx => {
    active = active === idx ? null : idx;
    root.querySelectorAll('.cmap-legend-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.path) === active);
    });
    const activePathHrefs = active === null ? null : new Set(paths[active].steps);
    svg.querySelectorAll('.cmap-edge').forEach(line => {
      const onPath = active === null || Number(line.dataset.path) === active;
      line.setAttribute('opacity', onPath ? '0.85' : '0.08');
      line.setAttribute('stroke-width', onPath && active !== null ? '3' : '2');
    });
    svg.querySelectorAll('.cmap-node').forEach(circle => {
      const onPath = !activePathHrefs || activePathHrefs.has(circle.dataset.href);
      circle.setAttribute('opacity', onPath ? '1' : '0.25');
    });
  };
  root.querySelectorAll('.cmap-legend-btn').forEach(btn => {
    btn.addEventListener('click', () => setActive(Number(btn.dataset.path)));
  });
}

/* ─────────────────────────────────────────────────────
   QUANTUM QUIZ — spaced-repetition question bank for
   learn-quantum.html, two questions per topic anchor.
   Leitner-style: each question has a "box" (0-4) tracked in
   localStorage; wrong answers reset to box 0, correct answers
   advance the box; session sampling favors low-box questions.
   ───────────────────────────────────────────────────── */
const QUANTUM_QUIZ = [
  { id: 'bloch-1', topic: 'Bloch Sphere', anchor: '#bloch',
    q: 'For |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩, what is P(|1⟩)?',
    options: ['sin²(θ/2)', 'cos²(θ/2)', 'sin²(θ)', 'e^{iφ}'], correct: 0,
    explain: 'The Born rule applied to the Bloch-sphere parametrization gives P(|1⟩) = sin²(θ/2) and P(|0⟩) = cos²(θ/2).' },
  { id: 'bloch-2', topic: 'Bloch Sphere', anchor: '#bloch',
    q: 'In the Mach-Zehnder unitary U = H·R_z(φ)·H, what is the output P(|0⟩)?',
    options: ['sin²(φ/2)', 'cos²(φ/2)', '1/2 always', 'cos²(φ)'], correct: 1,
    explain: 'The interferometer phase φ maps directly onto qubit output probabilities: P(|0⟩) = cos²(φ/2).' },
  { id: 'gates-1', topic: 'Quantum Gates', anchor: '#gates',
    q: 'Which minimal gate set is universal for quantum computation?',
    options: ['{X, Y, Z}', '{H, CNOT} alone', '{H, T, CNOT}', '{S, T} alone'], correct: 2,
    explain: '{H, T, CNOT} — the "Clifford + T" set — is the standard universal gate set used across quantum hardware.' },
  { id: 'gates-2', topic: 'Quantum Gates', anchor: '#gates',
    q: 'How many CNOT gates does a SWAP gate decompose into?',
    options: ['1', '2', '3', '4'], correct: 2,
    explain: 'SWAP = 3 CNOTs with alternating control/target qubits.' },
  { id: 'superposition-1', topic: 'Superposition', anchor: '#superposition',
    q: 'For |ψ⟩ = α|0⟩ + β|1⟩, what must α and β satisfy?',
    options: ['|α| + |β| = 1', '|α|² + |β|² = 1', 'α + β = 1', 'αβ = 1'], correct: 1,
    explain: 'Normalization requires |α|² + |β|² = 1 so the Born-rule probabilities sum to 1.' },
  { id: 'superposition-2', topic: 'Superposition', anchor: '#superposition',
    q: 'What happens to a superposition upon measurement?',
    options: ['It doubles in amplitude', 'It collapses irreversibly', 'Nothing changes', 'The phase reverses'], correct: 1,
    explain: 'Measurement collapses the superposition onto one outcome; the process cannot be undone.' },
  { id: 'measurement-1', topic: 'Measurement', anchor: '#measurement',
    q: 'What does the no-cloning theorem forbid?',
    options: ['Measuring a qubit twice', 'Copying an unknown quantum state exactly', 'Entangling two qubits', 'Applying two gates in sequence'], correct: 1,
    explain: 'No-cloning: there is no operation that copies an arbitrary unknown quantum state exactly.' },
  { id: 'measurement-2', topic: 'Measurement', anchor: '#measurement',
    q: 'What is the quantum Zeno effect?',
    options: ['Gates get faster at low temperature', 'Frequent measurement suppresses evolution', 'Decoherence increases with measurement', 'Photons freeze inside a cavity'], correct: 1,
    explain: 'Repeated, rapid measurement can effectively "freeze" a quantum system in its current state.' },
  { id: 'entanglement-1', topic: 'Entanglement', anchor: '#entanglement',
    q: 'What is the classical (local hidden variable) bound on the CHSH inequality?',
    options: ['1', '2', '2√2', '4'], correct: 1,
    explain: 'Classical/local-realistic theories are bounded by |CHSH| ≤ 2; quantum mechanics can reach 2√2 ≈ 2.83.' },
  { id: 'entanglement-2', topic: 'Entanglement', anchor: '#entanglement',
    q: 'In quantum teleportation, what does Alice send Bob?',
    options: ['The qubit itself, via a quantum channel', 'Two classical bits from her Bell measurement', 'Nothing at all', 'A perfect copy of |ψ⟩'], correct: 1,
    explain: 'Alice measures her two qubits and sends 2 classical bits so Bob can apply the matching correction — no faster-than-light signaling occurs.' },
  { id: 'rydberg-1', topic: 'Rydberg Atoms', anchor: '#rydberg',
    q: 'How does the van der Waals coefficient C₆ scale with principal quantum number n?',
    options: ['n³', 'n⁶', 'n¹¹', 'n²'], correct: 2,
    explain: 'C₆ ∝ n¹¹ — this steep scaling is why blockade radii grow so quickly with n.' },
  { id: 'rydberg-2', topic: 'Rydberg Atoms', anchor: '#rydberg',
    q: 'Typical Rydberg blockade radii fall in which range?',
    options: ['5–15 pm', '5–15 nm', '5–15 μm', '5–15 mm'], correct: 2,
    explain: 'For typical Rydberg experiments R_b ~ 5–15 μm, depending on n and Rabi frequency.' },
  { id: 'twoqubit-1', topic: 'Two-Qubit Gates', anchor: '#twoqubit',
    q: 'In the Rydberg blockade CZ protocol, what happens to |11⟩?',
    options: ["It's unaffected", 'It picks up a −1 phase', 'It becomes |00⟩', "It's measured immediately"], correct: 1,
    explain: 'The π–2π–π blockade sequence leaves |11⟩ → −|11⟩, implementing the CZ phase.' },
  { id: 'twoqubit-2', topic: 'Two-Qubit Gates', anchor: '#twoqubit',
    q: 'What does the Mølmer-Sørensen gate use to entangle two trapped ions?',
    options: ['A shared motional (phonon) mode', 'Direct dipole-dipole interaction', 'Photon exchange through a cavity', 'Magnetic field gradients'], correct: 0,
    explain: 'MS gates couple qubits through a shared vibrational mode of the ion chain.' },
  { id: 'rabi-1', topic: 'Rabi Oscillations', anchor: '#rabi',
    q: 'On resonance (Δ=0), what is the excited-state population P_e(t)?',
    options: ['sin²(Ωt/2)', 'cos²(Ωt)', 'a constant 1/2', 'e^{−Ωt}'], correct: 0,
    explain: 'On resonance the generalized Rabi frequency Ω′ = Ω, giving full-contrast Rabi flopping P_e(t) = sin²(Ωt/2).' },
  { id: 'rabi-2', topic: 'Rabi Oscillations', anchor: '#rabi',
    q: 'Which pulse area drives a full |g⟩ → |e⟩ population transfer?',
    options: ['π/2 pulse', 'π pulse', '2π pulse', '4π pulse'], correct: 1,
    explain: 'A π pulse (t = π/Ω) fully transfers population; π/2 creates an equal superposition; 2π returns population to the start with a phase.' },
  { id: 'decoherence-1', topic: 'Decoherence', anchor: '#decoherence',
    q: 'What is the fundamental relationship between T₂ and T₁?',
    options: ['T₂ = T₁', 'T₂ ≥ 2T₁', 'T₂ ≤ 2T₁', 'No relationship'], correct: 2,
    explain: 'T₂ ≤ 2T₁ is a fundamental bound — dephasing cannot be slower than energy relaxation allows.' },
  { id: 'decoherence-2', topic: 'Decoherence', anchor: '#decoherence',
    q: 'Which technique recovers the true T₂ from the faster apparent T₂*?',
    options: ['Increasing laser power', 'A Hahn spin echo', 'Cooling the atoms further', 'Raising the magnetic field'], correct: 1,
    explain: 'A Hahn echo (π/2–τ–π–τ–π/2) refocuses static inhomogeneous dephasing, revealing the true T₂.' },
  { id: 'hyperfine-1', topic: 'Hyperfine Qubits', anchor: '#hyperfine',
    q: "What makes a pair like ⁸⁷Rb's |F=1,m_F=0⟩↔|F=2,m_F=0⟩ a good 'clock state' qubit?",
    options: ['It has the highest transition frequency', 'First-order insensitivity to magnetic field', 'It optically pumps fastest', 'It has the largest recoil shift'], correct: 1,
    explain: 'm_F=0 ↔ m_F=0 clock transitions are first-order field-insensitive, making them robust, long-coherence qubit choices.' },
  { id: 'hyperfine-2', topic: 'Hyperfine Qubits', anchor: '#hyperfine',
    q: "What is ⁸⁷Rb's ground-state hyperfine clock transition frequency?",
    options: ['1.42 GHz', '6.834683 GHz', '9.192631770 GHz', '3.4 GHz'], correct: 1,
    explain: "6.834683 GHz is ⁸⁷Rb's clock frequency; 9.192631770 GHz is ¹³³Cs's — the frequency that defines the SI second." },
  { id: 'optical-pumping-1', topic: 'Optical Pumping', anchor: '#optical-pumping',
    q: 'What Δm_F selection rule does σ⁺ light drive?',
    options: ['Δm_F = 0', 'Δm_F = −1', 'Δm_F = +1', 'Δm_F = ±2'], correct: 2,
    explain: 'σ⁺ light drives Δm_F = +1 transitions, pumping population toward higher m_F.' },
  { id: 'optical-pumping-2', topic: 'Optical Pumping', anchor: '#optical-pumping',
    q: 'After ~20 scattering events of σ⁺ light on an F=1 ground state, where does population end up?',
    options: ['Evenly spread over all m_F', '>95% in the m_F=+1 dark state', 'Back in m_F=−1', 'Lost entirely to the excited state'], correct: 1,
    explain: 'm_F=+1 is a dark state for σ⁺ light — it cannot absorb and decay further — so population accumulates there.' },
  { id: 'qec-1', topic: 'Error Correction', anchor: '#qec',
    q: 'How many physical qubits does the Shor code use per logical qubit?',
    options: ['3', '5', '7', '9'], correct: 3,
    explain: "Shor's 1995 code uses 9 physical qubits and corrects any single-qubit error (bit-flip, phase, or both)." },
  { id: 'qec-2', topic: 'Error Correction', anchor: '#qec',
    q: "Roughly what is the surface code's error-rate threshold?",
    options: ['~50%', '~10%', '~1%', '~0.001%'], correct: 2,
    explain: "The surface code's threshold is roughly 1% per gate for realistic noise — current hardware is approaching this." },
  { id: 'algorithms-1', topic: 'Quantum Algorithms', anchor: '#algorithms',
    q: "How many queries does Grover's algorithm need to find a marked item among N?",
    options: ['O(N)', 'O(log N)', 'O(√N)', 'O(1)'], correct: 2,
    explain: "Grover's algorithm gives a quadratic speedup: O(√N) queries versus O(N) classically." },
  { id: 'algorithms-2', topic: 'Quantum Algorithms', anchor: '#algorithms',
    q: "What is Shor's algorithm's complexity for factoring an N-bit integer?",
    options: ['O((log N)³)', 'O(2^N)', 'O(N²)', 'O(N!)'], correct: 0,
    explain: "Shor's algorithm factors in O((log N)³) via quantum period-finding — exponentially faster than known classical methods." },
  { id: 'analog-sim-1', topic: 'Analog Simulation', anchor: '#analog-sim',
    q: 'In the Bose-Hubbard model, what transition occurs at U/J ~ 5.8z?',
    options: ['BEC-BCS crossover', 'Superfluid-to-Mott-insulator transition', 'Doppler-to-sub-Doppler transition', 'Blockade transition'], correct: 1,
    explain: 'Greiner et al. (Nature, 2002) first demonstrated this quantum phase transition in an optical lattice.' },
  { id: 'analog-sim-2', topic: 'Analog Simulation', anchor: '#analog-sim',
    q: 'What platform has been used to simulate the transverse-field Ising model near J/h = 1?',
    options: ['Trapped-ion crystals only', 'Rydberg atom arrays', 'Superconducting qubits exclusively', 'Photonic circuits'], correct: 1,
    explain: 'Groups including QuEra and Harvard have used Rydberg atom arrays to realize this quantum phase transition.' },
];

function initQuantumQuiz() {
  if (currentPageKey() !== 'learn-quantum') return;
  const root = document.getElementById('quiz-root');
  if (!root || root.dataset.built) return;
  root.dataset.built = 'true';

  const SRS_KEY = 'amo_quiz_srs_v1';
  const SESSION_SIZE = 8;
  const MASTERED_BOX = 3;
  const readSRS = () => { try { return JSON.parse(localStorage.getItem(SRS_KEY) || '{}'); } catch (_) { return {}; } };
  const writeSRS = srs => localStorage.setItem(SRS_KEY, JSON.stringify(srs));

  const masteredCount = srs => QUANTUM_QUIZ.filter(q => (srs[q.id]?.box || 0) >= MASTERED_BOX).length;

  const pickSession = srs => {
    const pool = QUANTUM_QUIZ.map(q => ({ q, weight: Math.max(1, 5 - (srs[q.id]?.box || 0)) }));
    const picked = [];
    while (picked.length < Math.min(SESSION_SIZE, pool.length) && pool.length) {
      const total = pool.reduce((s, p) => s + p.weight, 0);
      let r = Math.random() * total, idx = 0;
      for (; idx < pool.length - 1; idx++) { r -= pool[idx].weight; if (r <= 0) break; }
      picked.push(pool.splice(idx, 1)[0].q);
    }
    return picked;
  };

  let session = [], sIndex = 0, sScore = 0;

  function renderIntro() {
    const srs = readSRS();
    const mastered = masteredCount(srs);
    root.innerHTML = `
      <section class="quiz-panel workflow-panel">
        <div class="workflow-panel-head compact">
          <div>
            <div class="eyebrow">Quantum Quiz</div>
            <h2>Test your understanding</h2>
          </div>
          <div class="notebook-count">${mastered}/${QUANTUM_QUIZ.length} mastered</div>
        </div>
        <p style="margin-bottom:var(--sp-4)">${SESSION_SIZE} questions pulled from all 14 topics below, weighted toward whatever you've missed before. Progress is saved in this browser.</p>
        <button class="mini-action" type="button" data-quiz-start>Start quiz (${SESSION_SIZE} questions)</button>
      </section>
    `;
    root.querySelector('[data-quiz-start]').addEventListener('click', () => {
      session = pickSession(readSRS());
      sIndex = 0; sScore = 0;
      renderQuestion();
    });
  }

  function renderQuestion() {
    const q = session[sIndex];
    root.innerHTML = `
      <section class="quiz-panel workflow-panel">
        <div class="workflow-panel-head compact">
          <div>
            <div class="eyebrow">Quantum Quiz · ${escapeHtml(q.topic)}</div>
            <h2>Question ${sIndex + 1} of ${session.length}</h2>
          </div>
        </div>
        <p class="quiz-q">${escapeHtml(q.q)}</p>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `<button class="quiz-opt" type="button" data-idx="${i}">${escapeHtml(opt)}</button>`).join('')}
        </div>
        <div class="quiz-feedback" hidden></div>
      </section>
    `;
    root.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => answer(Number(btn.dataset.idx)));
    });
  }

  function answer(idx) {
    const q = session[sIndex];
    const correct = idx === q.correct;
    if (correct) sScore++;

    const srs = readSRS();
    const s = srs[q.id] || { box: 0, seen: 0, correct: 0 };
    s.seen++;
    if (correct) { s.correct++; s.box = Math.min(4, s.box + 1); } else { s.box = 0; }
    srs[q.id] = s;
    writeSRS(srs);

    root.querySelectorAll('.quiz-opt').forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add('correct');
      else if (i === idx) btn.classList.add('wrong');
    });
    const fb = root.querySelector('.quiz-feedback');
    fb.hidden = false;
    fb.innerHTML = `
      <p class="quiz-explain">${correct ? '✓ Correct.' : '✗ Not quite.'} ${escapeHtml(q.explain)}
        <a href="${q.anchor}" class="quiz-review-link">Review this topic ↑</a></p>
      <button class="mini-action" type="button" data-quiz-next>${sIndex + 1 < session.length ? 'Next question' : 'See results'}</button>
    `;
    fb.querySelector('[data-quiz-next]').addEventListener('click', () => {
      sIndex++;
      if (sIndex < session.length) renderQuestion(); else renderResults();
    });
  }

  function renderResults() {
    const srs = readSRS();
    const mastered = masteredCount(srs);
    root.innerHTML = `
      <section class="quiz-panel workflow-panel">
        <div class="workflow-panel-head compact">
          <div>
            <div class="eyebrow">Quantum Quiz — Results</div>
            <h2>${sScore} / ${session.length} correct</h2>
          </div>
          <div class="notebook-count">${mastered}/${QUANTUM_QUIZ.length} mastered</div>
        </div>
        <p style="margin-bottom:var(--sp-4)">Missed questions come back sooner next round; questions you get right a few times in a row show up less often.</p>
        <button class="mini-action" type="button" data-quiz-again>Practice again</button>
      </section>
    `;
    root.querySelector('[data-quiz-again]').addEventListener('click', renderIntro);
  }

  renderIntro();
}

const PAGE_PLAYBOOKS = {
  'atom-library': ['Choose a species', 'Compare transition constants, recoil scales, and cooling limits before opening design tools.', 'Use data-sheet links when a number will enter an experiment.'],
  'laser-planner': ['Plan laser architecture', 'Select a species to see required wavelengths, power classes, nonlinear optics, and control elements.', 'Treat powers as starting points; vendors, linewidths, and beam geometry still need lab-specific checks.'],
  'mot-designer': ['Estimate MOT behavior', 'Adjust detuning, saturation, beam size, and gradients to see damping, scattering, and capture trends.', 'Use it for scale and intuition before measuring loading curves.'],
  'laser-locking': ['Choose a stabilization route', 'Compare saturated absorption, PDH, and beat-note locking from signal generation to failure modes.', 'Keep sign conventions and RF prefactors visible when translating to the lab.'],
  'lab-techniques': ['Orient lab practice', 'Use the technique cards as an operations checklist for alignment, loading, imaging, and troubleshooting.', 'Open calculators from the related-tool panel when a number is needed.'],
  'polarimetry': ['Debug polarization', 'Move from Stokes vectors to waveplate rotations and Mueller-matrix intuition.', 'Use the references when matching angle conventions to your polarimeter.'],
  'zernike': ['Diagnose aberrations', 'Explore low-order Zernike modes, Strehl degradation, and SLM phase patterns.', 'Use exported plots as qualitative diagnostics, not direct wavefront-sensor replacement.'],
  'cavity-qed': ['Classify cavity regimes', 'Enter finesse, length, waist, and atomic linewidth to estimate g0, kappa, gamma, C, and Purcell scales.', 'Check Hz versus angular-frequency conventions before comparing with papers.'],
  'vacuum-systems': ['Design UHV choices', 'Move from pressure regimes to pumps, gauges, bakeout, materials, and leak checks.', 'Use the checklist style for planning and lab debugging.'],
  'tweezer-designer': ['Design tweezer geometry', 'Estimate trap depth, frequencies, Lamb-Dicke parameter, scattering, array spacing, and power budget.', 'Check validity when atoms are hot or when aberrations dominate the waist.'],
  'imaging-calculator': ['Estimate readout fidelity', 'Set species, NA, exposure, saturation, camera model, and background to compare photons, SNR, and fidelity.', 'Use histogram separation, not only SNR, when discussing survival and state detection.'],
  'release-recapture': ['Estimate temperature from survival', 'Set trap geometry, release times, and Monte Carlo size to model recapture probability at several candidate temperatures.', 'This is thermometry for an assumed potential, not direct trap-frequency metrology.'],
  'tof-calculator': ['Extract cloud temperature', 'Fit sigma-squared versus time-squared and compare PSD, recoil, and Doppler scales.', 'Be careful with pixel calibration and initial cloud size.'],
  'lab-calculators': ['Get quick AMO numbers', 'Use the tabbed console for optics, recoil, Zeeman shifts, traps, cavities, and Clebsch-Gordan coefficients.', 'Confirm unit conventions before copying results into a notebook.'],
  'absorption-imaging': ['Analyze ensemble images', 'Connect optical depth, column density, atom number, saturation correction, and shot noise.', 'Check imaging intensity and detuning before trusting OD at high density.'],
  'laser-cooling': ['Understand cooling mechanisms', 'Read across Lamb-Dicke, sideband, gray molasses, EIT, Raman, and comparison sections.', 'Use the animations as mechanism cartoons; use equations and references for quantitative claims.'],
  'cooling-simulator': ['Build cooling intuition', 'Tune detuning, saturation, recoil, and sub-Doppler parameters to see forces and diffusion.', 'Use trends rather than exact numbers when a multilevel model is required.'],
  'decoherence-lab': ['Tell T1, T2*, and T2 apart', 'Watch live Bloch-sphere and detector-signal simulations of dissipation, dephasing, and combined decoherence, run from the actual optical Bloch equations.', 'Use the measurement-protocol table to match what you fit in lab (Rabi decay, Ramsey, echo) to the mechanism it isolates.'],
  'learn-quantum': ['Learn neutral-atom QC language', 'Move topic by topic through qubits, gates, measurement, Rydberg blockade, error correction, and algorithms.', 'Use this as conceptual scaffolding before opening hardware-specific calculators.'],
  'rydberg-calculator': ['Estimate blockade scales', 'Adjust n, Rabi frequency, spacing, and species to compare lifetime, C6, blockade radius, and gate scales.', 'Near Förster resonances, treat simple scaling laws as estimates.'],
  'fidelity-budget': ['Build gate-error intuition', 'Vary independent error channels to see which terms limit a Rydberg two-qubit gate.', 'Coherent errors can combine nonlinearly; this is a budget, not a full master-equation solver.'],
  'rb-explorer': ['Interpret benchmarking data', 'Connect decay curves, SPAM offsets, Clifford twirling, and interleaved RB to gate fidelity.', 'Do not overinterpret RB as a full diagnosis of coherent or leakage errors.'],
  'dd-playground': ['Explore coherence protection', 'Compare CPMG, XY-style sequences, and filter functions against noise spectra.', 'Pulse errors and finite Rabi frequency matter in real experiments.'],
  'remote-entanglement': ['Map networking tradeoffs', 'Follow photon collection, Bell-state measurement, loss, and rate bottlenecks for remote links.', 'Use rates as order-of-magnitude design estimates.'],
  'amo-groups': ['Find research fits', 'Filter groups by platform, species, technique, and career relevance.', 'Use this as a discovery map; verify current openings and project direction on group pages.'],
  'paper-syllabus': ['Read with purpose', 'Follow staged paper lists and use paper-to-tool bridges to connect literature to calculators.', 'Prefer primary papers for claims and reviews for orientation.'],
  'qc-landscape': ['Translate AMO skills to industry', 'Compare hardware platforms, company claims, job roles, and roadmap maturity.', 'Separate demonstrated hardware from roadmap language.'],
  'rb87-vs-yb171': ['Compare qubit species', 'Use side-by-side evidence for Rb and Yb choices across cooling, gates, imaging, clocks, and scaling.', 'Check whether a benchmark is Rb, Yb, Cs, or architecture-level before reusing it.'],
};

const RELATED_TOOLS = {
  'atom-library': ['laser-planner', 'mot-designer', 'lab-calculators'],
  'laser-planner': ['atom-library', 'laser-locking', 'lab-techniques'],
  'mot-designer': ['atom-library', 'tof-calculator', 'cooling-simulator'],
  'laser-locking': ['lab-techniques', 'polarimetry', 'zernike'],
  'lab-techniques': ['laser-planner', 'vacuum-systems', 'lab-calculators'],
  'polarimetry': ['laser-locking', 'lab-techniques', 'zernike'],
  'zernike': ['tweezer-designer', 'imaging-calculator', 'polarimetry'],
  'cavity-qed': ['atom-library', 'lab-calculators', 'remote-entanglement'],
  'vacuum-systems': ['lab-techniques', 'mot-designer', 'atom-library'],
  'tweezer-designer': ['atom-library', 'release-recapture', 'rydberg-calculator'],
  'imaging-calculator': ['release-recapture', 'tweezer-designer', 'absorption-imaging'],
  'release-recapture': ['imaging-calculator', 'tweezer-designer', 'laser-cooling'],
  'tof-calculator': ['mot-designer', 'absorption-imaging', 'cooling-simulator'],
  'lab-calculators': ['atom-library', 'tweezer-designer', 'cavity-qed'],
  'absorption-imaging': ['tof-calculator', 'imaging-calculator', 'atom-library'],
  'laser-cooling': ['cooling-simulator', 'release-recapture', 'lab-calculators'],
  'cooling-simulator': ['laser-cooling', 'mot-designer', 'tof-calculator'],
  'decoherence-lab': ['learn-quantum', 'dd-playground', 'fidelity-budget'],
  'learn-quantum': ['decoherence-lab', 'rydberg-calculator', 'fidelity-budget'],
  'rydberg-calculator': ['fidelity-budget', 'rb87-vs-yb171', 'learn-quantum'],
  'fidelity-budget': ['decoherence-lab', 'rydberg-calculator', 'rb-explorer'],
  'rb-explorer': ['fidelity-budget', 'dd-playground', 'learn-quantum'],
  'dd-playground': ['decoherence-lab', 'rb-explorer', 'learn-quantum'],
  'remote-entanglement': ['cavity-qed', 'fidelity-budget', 'qc-landscape'],
  'amo-groups': ['paper-syllabus', 'qc-landscape', 'rb87-vs-yb171'],
  'paper-syllabus': ['amo-groups', 'learn-quantum', 'laser-cooling'],
  'qc-landscape': ['amo-groups', 'fidelity-budget', 'rb87-vs-yb171'],
  'rb87-vs-yb171': ['atom-library', 'rydberg-calculator', 'qc-landscape'],
};

const REFERENCE_TRAILS = {
  'atom-library': [
    ['data sheet', 'Steck alkali data sheets and NIST ASD anchor the alkali transition constants.'],
    ['review', 'Use species-specific cold-atom reviews for scattering, cooling, and clock-transition context.'],
  ],
  'laser-planner': [
    ['lab practice', 'Beam lists follow common AMO laser architectures for alkali and alkaline-earth experiments.'],
    ['vendor/data sheet', 'Final diode, SHG, fiber, and AOM choices should be checked against current vendor specifications.'],
  ],
  'amo-groups': [
    ['live web', 'Group membership, openings, and topics change; use the directory as a starting map.'],
    ['career context', 'Filter tags summarize public group descriptions rather than ranking scientific quality.'],
  ],
  'paper-syllabus': [
    ['primary literature', 'Paper cards point to the original paper or review when possible.'],
    ['reading path', 'Ordering is pedagogical: entry points first, then mechanism and frontier papers.'],
  ],
  'laser-cooling': [
    ['review', 'Cooling limits and mechanisms should be checked against laser-cooling reviews and primary tweezer papers.'],
    ['theory model', 'The unified cooling language follows effective Hamiltonian, optical pumping, and Lamb-Dicke approximations.'],
  ],
  'qc-landscape': [
    ['peer-reviewed', 'Demonstrated fidelities and logical-qubit claims should trace to papers.'],
    ['roadmap', 'Company roadmaps and projected qubit counts are not experimental demonstrations.'],
  ],
  'rb87-vs-yb171': [
    ['peer-reviewed', 'Species comparisons rely on cited clock, tweezer, gate, and imaging benchmarks.'],
    ['scope note', 'Some array-scale benchmarks are Cs or architecture-level context, not Rb/Yb measurements.'],
  ],
  defaultTool: [
    ['textbook', 'Core equations use standard AMO, optics, and quantum-optics conventions.'],
    ['peer-reviewed', 'Experimental benchmark numbers should be traced to the page references or source confidence panel.'],
  ],
  defaultPage: [
    ['curated source', 'This page is a guide or map; verify time-sensitive details from linked primary sources.'],
    ['context note', 'Use the page for orientation, not as a substitute for current papers or group websites.'],
  ],
};

function navItemByKey(key) {
  return [...NAV.tools, ...NAV.learn].find(item => item.key === key);
}

function initPagePlaybookPanel() {
  if (!location.pathname.includes('/pages/')) return;
  const key = currentPageKey();
  const play = PAGE_PLAYBOOKS[key];
  const container = getPageContainer();
  if (!play || !container || document.querySelector('.page-playbook-panel')) return;
  const panel = document.createElement('section');
  panel.className = 'page-playbook-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head compact">
      <div>
        <div class="eyebrow">Page Playbook</div>
        <h2>${play[0]}</h2>
      </div>
    </div>
    <div class="page-playbook-grid">
      <div><span>Use it for</span><p>${play[1]}</p></div>
      <div><span>Read with care</span><p>${play[2]}</p></div>
    </div>
  `;
  container.prepend(panel);
}

function initReferenceTrailPanel() {
  if (!location.pathname.includes('/pages/')) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.reference-trail-panel')) return;
  const key = currentPageKey();
  const refs = REFERENCE_TRAILS[key] || (isToolLikePage() ? REFERENCE_TRAILS.defaultTool : REFERENCE_TRAILS.defaultPage);
  const panel = document.createElement('section');
  panel.className = 'reference-trail-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head compact">
      <div>
        <div class="eyebrow">References and Source Trail</div>
        <h2>What the page is grounded in</h2>
      </div>
    </div>
    <div class="source-confidence-grid">
      ${refs.map(([tag, body]) => `
        <div class="source-confidence-card">
          <span class="source-tag ${String(tag).toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${tag}</span>
          <p>${body}</p>
        </div>
      `).join('')}
    </div>
  `;
  const explicitRefs = Array.from(container.querySelectorAll('h2,h3,strong')).find(el => /references|further reading|key references/i.test(el.textContent));
  const anchor = explicitRefs?.closest('section, .content-section, .section-block, .tool-section');
  if (anchor) anchor.before(panel);
  else container.appendChild(panel);
}

function initRelatedToolsPanel() {
  if (!location.pathname.includes('/pages/')) return;
  const key = currentPageKey();
  const related = RELATED_TOOLS[key];
  const container = getPageContainer();
  if (!related?.length || !container || document.querySelector('.auto-related-tools')) return;
  const root = location.pathname.includes('/pages/') ? '' : 'pages/';
  const cards = related.map(k => navItemByKey(k)).filter(Boolean).map(item => `
    <a class="see-also-card" href="${root}${item.href.replace(/^pages\//, '')}">
      <span class="see-also-icon">${item.icon || '•'}</span>
      <div>
        <div class="see-also-name">${item.label}</div>
        <div class="see-also-desc">${item.kind || 'AMO Toolkit page'}</div>
      </div>
    </a>
  `).join('');
  if (!cards) return;
  const panel = document.createElement('section');
  panel.className = 'see-also auto-related-tools';
  panel.innerHTML = `
    <div class="see-also-title">Related tools</div>
    <div class="see-also-grid">${cards}</div>
  `;
  const footer = container.querySelector('footer, .footer');
  if (footer) footer.before(panel);
  else container.appendChild(panel);
}


function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function tableToCSV(table) {
  return Array.from(table.querySelectorAll('tr')).map(row =>
    Array.from(row.children).map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function exportTableCSV(table, filename = 'amo-career-table.csv') {
  downloadText(filename, tableToCSV(table), 'text/csv');
}

function exportCanvasPNG(canvas, filename = 'amo-career-plot.png') {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

function exportCanvasSVG(canvas, filename = 'amo-career-plot.svg') {
  const png = canvas.toDataURL('image/png');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image href="${png}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
  downloadText(filename, svg, 'image/svg+xml');
}

function initExportButtons() {
  document.querySelectorAll('table').forEach((table, i) => {
    if (table.dataset.exportReady || table.closest('.no-auto-export')) return;
    table.dataset.exportReady = 'true';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mini-action export-float';
    btn.textContent = 'Export CSV';
    btn.addEventListener('click', () => exportTableCSV(table, `amo-career-table-${i + 1}.csv`));
    table.before(btn);
  });

  document.querySelectorAll('canvas').forEach((canvas, i) => {
    const skip = /hero-canvas|trajCanvas|waterfallCanvas/.test(canvas.id);
    if (canvas.dataset.exportReady || skip) return;
    canvas.dataset.exportReady = 'true';
    const parent = canvas.closest('.chart-card, .concept-box, .calc-card, .panel, section');
    if (!parent) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mini-action export-float';
    btn.textContent = 'Export PNG';
    btn.addEventListener('click', () => exportCanvasPNG(canvas, `${canvas.id || 'amo-career-plot-' + (i + 1)}.png`));
    canvas.before(btn);
    const svgBtn = document.createElement('button');
    svgBtn.type = 'button';
    svgBtn.className = 'mini-action export-float';
    svgBtn.textContent = 'Export SVG';
    svgBtn.addEventListener('click', () => exportCanvasSVG(canvas, `${canvas.id || 'amo-career-plot-' + (i + 1)}.svg`));
    canvas.before(svgBtn);
  });
}

/* ─────────────────────────────────────────────────────
   COPY-ON-CLICK RESULT VALUES
   Click any computed result value to copy it.
   ───────────────────────────────────────────────────── */
function initCopyOnClick() {
  const SEL = [
    '.prop-card-val', '.blk-val', '.fid-value',
    '.result-val', '.out-val', '.calc-metric-val',
    '.metric-val', '.sc-val', '.sl-val',
  ].join(',');

  function showTip(el) {
    const r = el.getBoundingClientRect();
    const tip = document.createElement('div');
    tip.textContent = '✓ copied';
    tip.style.cssText = [
      'position:fixed',
      `top:${r.top - 30}px`,
      `left:${r.left + r.width / 2}px`,
      'transform:translateX(-50%)',
      'background:#1e293b',
      'border:1px solid #4ade80',
      'color:#4ade80',
      'font-size:.7rem',
      'font-family:var(--font-mono,monospace)',
      'padding:3px 8px',
      'border-radius:4px',
      'pointer-events:none',
      'z-index:9999',
      'opacity:1',
      'transition:opacity .4s .5s',
    ].join(';');
    document.body.appendChild(tip);
    requestAnimationFrame(() => requestAnimationFrame(() => { tip.style.opacity = '0'; }));
    setTimeout(() => tip.remove(), 950);
  }

  document.addEventListener('click', e => {
    const el = e.target.closest(SEL);
    if (!el) return;
    const text = el.textContent.trim();
    if (!text || text === '—' || text === '–') return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showTip(el)).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showTip(el); } catch (_) {}
      document.body.removeChild(ta);
    }
  });
}

window.AMOCareer = {
  exportTableCSV,
  exportCanvasPNG,
  exportCanvasSVG,
  downloadText,
  recordRecentTool,
};

/* ─────────────────────────────────────────────────────
   INIT — run everything on DOMContentLoaded
   ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initAccordions();
  initTabs();
  initSmoothScroll();
  initRecentTracking();
  renderRecentTools();
  initDerivationToggles();
  initRelatedToolsPanel();
  initShareableCalculatorParams();
  initPaperToolBridge();
  initExportButtons();
  initCopyOnClick();
  initCiteThisPage();
  initErrorReportWidget();
  initPathConceptMap();
  initQuantumQuiz();
  updateHeroStats();
});

// home.html's hero stats used to be hand-typed numbers that silently went
// stale as tools were added (see CLAUDE.md known issues). Derive them from
// NAV directly so they can never drift again.
function updateHeroStats() {
  const toolsEl = document.getElementById('stat-tools-count');
  if (toolsEl) toolsEl.textContent = NAV.tools.length;
  const conceptsEl = document.getElementById('stat-concepts-count');
  if (conceptsEl) conceptsEl.textContent = NAV.learn.length;
}

/* ─────────────────────────────────────────────────────────
   KATEX AUTO-RENDER
   Runs after DOM + KaTeX scripts are loaded (defer order)
   ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true  },
        { left: '$',  right: '$',  display: false },
      ],
      throwOnError: false,
    });
  }
});
