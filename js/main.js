/* =====================================================
   AMO Toolkit — Shared JS
   Nav renderer · Canvas animation · Scroll reveal · Accordions · Tabs
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   NAV DATA
   ───────────────────────────────────────────────────── */
const NAV = {
  build: [
    { key: 'atom-library',   label: 'Atomic Species Selector',                kind: 'Reference', icon: '⚛️', color: '#38bdf8', href: 'pages/atom-library.html'   },
    { key: 'laser-planner',  label: 'Laser System Planner',        kind: 'Design tool', icon: '💡', color: '#f472b6', href: 'pages/laser-planner.html'  },
    { key: 'mot-designer',   label: 'MOT & Magnetic Trap Designer',         kind: 'Calculator', icon: '🧲', color: '#fb923c', href: 'pages/mot-designer.html'   },
    { key: 'laser-locking',  label: 'Laser Locking Guide',   kind: 'Guide', icon: '🔐', color: '#f87171', href: 'pages/laser-locking.html'  },
    { key: 'lab-techniques', label: 'AMO Lab Operations Handbook',      kind: 'Guide', icon: '🔬', color: '#34d399', href: 'pages/lab-techniques.html' },
    { key: 'polarimetry',    label: 'Polarimetry Simulator', kind: 'Simulator', icon: '🔭', color: '#e879f9', href: 'pages/polarimetry.html'    },
    { key: 'zernike',        label: 'Zernike Wavefront Lab', kind: 'Simulator', icon: '🌊', color: '#2dd4bf', href: 'pages/zernike.html'      },
    { key: 'cavity-qed',     label: 'Cavity QED Coupling Lab',       kind: 'Calculator', icon: '💎', color: '#c084fc', href: 'pages/cavity-qed.html'   },
    { key: 'vacuum-systems',    label: 'Vacuum Systems Guide',        kind: 'Guide',      icon: '⚗️', color: '#22d3ee', href: 'pages/vacuum-systems.html'    },
    { key: 'tweezer-designer', label: 'Tweezer Array Design Lab', kind: 'Design lab', icon: '🔦', color: '#f59e0b', href: 'pages/tweezer-designer.html' },
  ],
  measure: [
    { key: 'imaging-calculator', label: 'Single-atom Imaging',  kind: 'Calculator', icon: '📷', color: '#34d399', href: 'pages/imaging-calculator.html' },
    { key: 'release-recapture',  label: 'Single-atom Temperature',  kind: 'Simulator', icon: '🎯', color: '#fb923c', href: 'pages/release-recapture.html'  },
    { key: 'tof-calculator',     label: 'MOT Temperature',     kind: 'Calculator', icon: '🌡️', color: '#38bdf8', href: 'pages/tof-calculator.html'     },
    { key: 'lab-calculators',     label: 'Quick Lab Console',      kind: 'Calculator', icon: '🧮', color: '#fbbf24', href: 'pages/lab-calculators.html'    },
    { key: 'absorption-imaging', label: 'Absorption Imaging Lab',       kind: 'Imaging lab', icon: '🌑', color: '#818cf8', href: 'pages/absorption-imaging.html'  },
  ],
  cooling: [
    { key: 'laser-cooling',      label: 'Single-atom Cooling',     kind: 'Deep dive', icon: '❄️', color: '#60a5fa', href: 'pages/laser-cooling.html' },
    { key: 'cooling-simulator', label: 'Laser Cooling Simulator',   kind: 'Simulator', icon: '🌡️', color: '#34d399', href: 'pages/cooling-simulator.html' },
  ],
  quantum: [
    { key: 'learn-quantum',      label: 'Quantum Computing Learning Path',              kind: 'Learning path', icon: '🔵', color: '#c084fc', href: 'pages/learn-quantum.html' },
    { key: 'rydberg-calculator', label: 'Rydberg Blockade Lab',  kind: 'Calculator', icon: '🔮', color: '#818cf8', href: 'pages/rydberg-calculator.html' },
    { key: 'fidelity-budget',    label: 'Rydberg Gate Error Budget', kind: 'Calculator', icon: '📊', color: '#f87171', href: 'pages/fidelity-budget.html' },
    { key: 'rb-explorer',        label: 'Randomized Benchmarking',     kind: 'Deep dive', icon: '📈', color: '#c084fc', href: 'pages/rb-explorer.html' },
    { key: 'dd-playground',      label: 'Dynamical Decoupling', kind: 'Simulator', icon: '🛡️', color: '#4ade80', href: 'pages/dd-playground.html' },
    { key: 'remote-entanglement', label: 'Remote Entanglement', kind: 'Deep dive', icon: '🔗', color: '#0ea5e9', href: 'pages/remote-entanglement.html' },
  ],
  career: [
    { key: 'amo-groups',     label: 'AMO Group Finder',        kind: 'Career map', icon: '🌍', color: '#4ade80', href: 'pages/amo-groups.html' },
    { key: 'paper-syllabus', label: 'AMO Paper Roadmap',           kind: 'Syllabus', icon: '📚', color: '#818cf8', href: 'pages/paper-syllabus.html' },
    { key: 'qc-landscape',   label: 'Quantum Industry Map',      kind: 'Landscape', icon: '💻', color: '#a78bfa', href: 'pages/qc-landscape.html' },
    { key: 'rb87-vs-yb171',  label: 'Rb vs Yb Qubit Comparison', kind: 'Deep dive', icon: '⚖️', color: '#f59e0b', href: 'pages/rb87-vs-yb171.html' },
  ],
  learn: [
    { key: 'bloch-sphere',       label: 'Bloch Sphere',          icon: '🔵',  href: 'pages/learn-quantum.html#bloch'        },
    { key: 'quantum-gates',      label: 'Quantum Gates',         icon: '⚡',  href: 'pages/learn-quantum.html#gates'        },
    { key: 'superposition',      label: 'Superposition',         icon: '〰️', href: 'pages/learn-quantum.html#superposition' },
    { key: 'measurement',        label: 'Measurement',           icon: '📏',  href: 'pages/learn-quantum.html#measurement'  },
    { key: 'entanglement',       label: 'Entanglement',          icon: '🔗',  href: 'pages/learn-quantum.html#entanglement' },
    { key: 'rydberg-atoms',      label: 'Rydberg Atoms',         icon: '⚛️',  href: 'pages/learn-quantum.html#rydberg'      },
    { key: 'two-qubit-gates',    label: 'Two-Qubit Gates',       icon: '🔀',  href: 'pages/learn-quantum.html#twoqubit'     },
    { key: 'rabi-oscillations',  label: 'Rabi Oscillations',     icon: '🌀',  href: 'pages/learn-quantum.html#rabi'         },
    { key: 'decoherence',        label: 'Decoherence',           icon: '📉',  href: 'pages/learn-quantum.html#decoherence'  },
    { key: 'hyperfine-qubits',   label: 'Hyperfine Qubits',      icon: '🔑',  href: 'pages/learn-quantum.html#hyperfine'       },
    { key: 'optical-pumping',    label: 'Optical Pumping',       icon: '💡',  href: 'pages/learn-quantum.html#optical-pumping' },
    { key: 'qec',                label: 'Error Correction',      icon: '🛡️',  href: 'pages/learn-quantum.html#qec'            },
    { key: 'quantum-algorithms', label: 'Quantum Algorithms',    icon: '⚙️',  href: 'pages/learn-quantum.html#algorithms'   },
    { key: 'analog-sim',         label: 'Analog Simulation',     icon: '🔬',  href: 'pages/learn-quantum.html#analog-sim'   },
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
   HERO CANVAS — floating atom particle network
   ───────────────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  // Quantum color palette
  const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#2dd4bf'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkParticle() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 2 + 1.2,
      color,
      alpha: Math.random() * 0.5 + 0.3,
      pulse: Math.random() * Math.PI * 2,  // phase offset
    };
  }

  function init() {
    resize();
    const count = Math.min(90, Math.floor((W * H) / 9500));
    particles = Array.from({ length: count }, mkParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now() * 0.001;

    // Update & draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Soft bounce
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Pulsing glow
      const pulseFactor = 0.7 + 0.3 * Math.sin(now * 1.5 + p.pulse);
      const r = p.r * pulseFactor;

      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
      grad.addColorStop(0,   p.color + 'cc');
      grad.addColorStop(0.4, p.color + '33');
      grad.addColorStop(1,   'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * pulseFactor;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130;
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(56,189,248,${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  // Handle resize with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { init(); }, 200);
  });

  init();
  draw();

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
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
  'mot-designer': 'MOT magnetic trap gradient spring damping capture detuning Zeeman evaporation Ioffe Pritchard Majorana',
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
    color: '#60a5fa',
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

function getPresetControlMatches(preset) {
  if (!preset?.values) return [];
  return Object.keys(preset.values).filter(id => document.getElementById(id));
}

function getApplicablePresets() {
  return CALCULATOR_PRESETS
    .map(preset => ({ ...preset, matchCount: getPresetControlMatches(preset).length }))
    .filter(preset => preset.matchCount > 0);
}

function hasCalculatorState() {
  const controls = getPageControls()
    .filter(el => !el.closest('.source-confidence-panel, .assumption-panel, .worked-examples-panel, .calculator-presets-panel'));
  const outputs = document.querySelectorAll('.result-value, .metric-value, .output-value, .kpi-value, .calc-output, canvas');
  return controls.length > 0 || outputs.length > 0;
}

function setControlValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (el.tagName === 'SELECT') {
    const requested = String(value).toLowerCase();
    const option = Array.from(el.options).find(opt =>
      opt.value.toLowerCase() === requested ||
      opt.textContent.trim().toLowerCase() === requested ||
      opt.textContent.trim().toLowerCase().includes(requested)
    );
    if (!option) return false;
    el.value = option.value;
  } else if (el.type === 'checkbox') {
    el.checked = Boolean(value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function refreshAfterControlChange() {
  [
    'onSpeciesChange',
    'compute',
    'calculate',
    'update',
    'updateCalc',
    'updateAll',
    'draw',
    'runSimulation',
  ].forEach(name => {
    if (typeof window[name] === 'function') {
      try { window[name](); } catch (_) { /* Page calculators are intentionally independent. */ }
    }
  });
}

const CALCULATOR_PRESETS = [
  {
    name: 'Rb87 tweezer',
    tag: 'alkali',
    why: 'A common neutral-atom QC starting point: 1064 nm tweezer, sub-micron waist, Rb D2 imaging.',
    values: { speciesSel: 'Rb87', lambdaIn: 1064, powerIn: 3, waistIn: 0.85, strehlIn: 0.9, naSlide: 55, qeSlide: 80, tOptSlide: 70, detSlide: 0, satSlide: 0 },
  },
  {
    name: 'Cs133 tweezer',
    tag: 'alkali',
    why: 'Useful for Cs tweezer thermometry and imaging estimates near a 1 mK-scale trap.',
    values: { speciesSel: 'Cs133', lambdaIn: 1064, powerIn: 5.4, waistIn: 0.95, strehlIn: 0.9, naSlide: 55, qeSlide: 80, tOptSlide: 70, detSlide: 0, satSlide: 0 },
  },
  {
    name: 'Li6 tweezer',
    tag: 'light atom',
    why: 'Large recoil, tight confinement, and fast motion make this a good stress test for tools.',
    values: { speciesSel: 'Li6', lambdaIn: 1064, powerIn: 8, waistIn: 0.8, strehlIn: 0.9, naSlide: 50, qeSlide: 80, tOptSlide: 70, detSlide: 0, satSlide: -2 },
  },
  {
    name: 'Yb171 clock',
    tag: 'alkaline-earth',
    why: 'Clock-qubit thinking: narrow-line cooling, magic trapping, low-scattering estimates.',
    values: { speciesSel: 'Yb171', lambdaIn: 759, powerIn: 5, waistIn: 0.75, strehlIn: 0.9, naSlide: 70, qeSlide: 85, tOptSlide: 75, detSlide: 0, satSlide: -5 },
  },
  {
    name: 'Sr87 narrow-line',
    tag: 'alkaline-earth',
    why: 'A Sr intercombination-line style preset for narrow-line cooling and clock intuition.',
    values: { speciesSel: 'Sr87', lambdaIn: 813, powerIn: 5, waistIn: 0.8, strehlIn: 0.9, naSlide: 70, qeSlide: 85, tOptSlide: 75, detSlide: 0, satSlide: -5 },
  },
  {
    name: 'typical MOT',
    tag: 'first pass',
    why: 'Reasonable initial knobs before you start optimizing a vapor-cell or 2D-MOT-loaded trap.',
    values: { speciesSel: 'Rb87', detSlide: 15, satSlide: 10, beamSlide: 10, gradSlide: 15 },
  },
  {
    name: 'typical high-NA objective',
    tag: 'optics',
    why: 'A high collection-efficiency imaging setup with realistic transmission and quantum efficiency.',
    values: { naSlide: 60, qeSlide: 85, tOptSlide: 70, waistIn: 0.8, strehlIn: 0.9 },
  },
];

const WORKED_EXAMPLES = {
  'release-recapture': [
    ['Estimate Cs trap frequencies', 'Cs133 tweezer', 'Use the Cs preset, then adjust power until the depth is near 1 mK and compare radial/axial frequencies.'],
    ['Check sensitivity to waist', 'typical high-NA objective', 'Change waist from 0.8 to 1.2 um; the radial frequency should move roughly as 1/w0^2 at fixed depth.'],
  ],
  'imaging-calculator': [
    ['How many photons for 99.9% detection?', 'typical high-NA objective', 'Increase exposure or saturation until the bright/dark histogram overlap reaches the target fidelity.'],
    ['Why Li imaging is hard', 'Li6 tweezer', 'Compare detected photons and recoil risk against Rb/Cs for the same NA and exposure.'],
    ['sCMOS vs EMCCD tradeoff', 'Cs133 tweezer', 'Hold the optical parameters fixed and change the camera noise model.'],
  ],
  'rydberg-calculator': [
    ['Rb 70S blockade radius', 'Rb87 tweezer', 'Set Rb and n approximately 70; compare blockade radius against a 5 um tweezer spacing.'],
    ['Cs vs Rb gate intuition', 'Cs133 tweezer', 'Compare lifetime, blockade, and estimated gate error at the same Rabi frequency.'],
  ],
  'mot-designer': [
    ['What MOT gradient should I start with?', 'typical MOT', 'Use detuning around 2-3 linewidths and gradient around 10-20 G/cm, then optimize experimentally.'],
    ['Light species sanity check', 'Li6 tweezer', 'Lithium typically needs more careful slowing/loading strategy; use this as an order-of-magnitude check only.'],
  ],
  'tof-calculator': [
    ['Extract temperature from sigma^2 vs t^2', 'Rb87 tweezer', 'Change the initial size and temperature; the fitted slope is kBT/m.'],
    ['When does initial size matter?', 'Sr87 narrow-line', 'Compare short and long TOF windows to see when sigma0 dominates.'],
  ],
  'fidelity-budget': [
    ['Temperature-limited Rydberg gate', 'Cs133 tweezer', 'Sweep temperature and observe how motional error competes with Rydberg decay.'],
    ['What does stronger blockade buy?', 'Rb87 tweezer', 'Increase blockade shift until blockade leakage is no longer the dominant term.'],
  ],
  'lab-calculators': [
    ['Photon recoil sanity check', 'Cs133 tweezer', 'Compare Cs, Rb, and Li recoil temperatures; the light atom penalty should jump out.'],
    ['Gaussian tweezer frequency estimate', 'typical high-NA objective', 'Use waist and depth to estimate whether you are in the Lamb-Dicke regime.'],
  ],
  default: [
    ['Start from a real atom', 'Rb87 tweezer', 'Apply a species preset, then change one knob at a time.'],
    ['Compare heavy and light atoms', 'Li6 tweezer', 'Use Li and Cs presets back-to-back to build recoil and trap-frequency intuition.'],
  ],
};

function currentPageKey() {
  const file = location.pathname.split('/').pop()?.replace('.html', '') || 'home';
  return file;
}

function applyPreset(presetName) {
  const preset = CALCULATOR_PRESETS.find(p => p.name === presetName);
  if (!preset) return 0;
  let applied = 0;
  Object.entries(preset.values).forEach(([id, value]) => {
    if (setControlValue(id, value)) applied += 1;
  });
  refreshAfterControlChange();
  return applied;
}

function initCalculatorPresets() {
  if (!isToolLikePage()) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.calculator-presets-panel')) return;
  const applicablePresets = getApplicablePresets();
  if (!applicablePresets.length) return;

  const panel = document.createElement('section');
  panel.className = 'calculator-presets-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head">
      <div>
        <div class="eyebrow">Calculator Presets</div>
        <h2>Start from a physically plausible setup</h2>
        <p>Only presets with controls on this page are shown. Applying one changes the calculator inputs immediately.</p>
      </div>
      <div class="preset-status" aria-live="polite">${applicablePresets.length} usable preset${applicablePresets.length === 1 ? '' : 's'} on this page.</div>
    </div>
    <div class="preset-grid">
      ${applicablePresets.map(p => `
        <button class="preset-card" type="button" data-preset="${p.name}">
          <span class="preset-tag">${p.tag}</span>
          <strong>${p.name}</strong>
          <small>${p.why}</small>
          <small class="preset-match-count">${p.matchCount} matching input${p.matchCount === 1 ? '' : 's'}</small>
        </button>
      `).join('')}
    </div>
  `;
  container.prepend(panel);
  const status = panel.querySelector('.preset-status');
  panel.addEventListener('click', e => {
    const btn = e.target.closest('[data-preset]');
    if (!btn) return;
    const count = applyPreset(btn.dataset.preset);
    status.textContent = `Applied ${count} matching parameter${count === 1 ? '' : 's'}.`;
  });
}

function initWorkedExamples() {
  if (!isToolLikePage()) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.worked-examples-panel')) return;
  const rawExamples = WORKED_EXAMPLES[currentPageKey()];
  if (!rawExamples?.length) return;
  const usablePresetNames = new Set(getApplicablePresets().map(p => p.name));
  const examples = rawExamples.filter(([, preset]) => usablePresetNames.has(preset));
  if (!examples.length) return;
  const panel = document.createElement('section');
  panel.className = 'worked-examples-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head">
      <div>
        <div class="eyebrow">Worked Examples</div>
        <h2>Try the calculator like an experimentalist</h2>
        <p>Each example gives a concrete question, a starting preset, and the knob to vary.</p>
      </div>
    </div>
    <div class="worked-grid">
      ${examples.map(([title, preset, body]) => `
        <article class="worked-card">
          <h3>${title}</h3>
          <p>${body}</p>
          <button class="mini-action" type="button" data-preset="${preset}">Apply ${preset}</button>
        </article>
      `).join('')}
    </div>
  `;
  const afterPresets = document.querySelector('.calculator-presets-panel');
  if (afterPresets) afterPresets.after(panel);
  else container.prepend(panel);
  panel.addEventListener('click', e => {
    const btn = e.target.closest('[data-preset]');
    if (!btn) return;
    applyPreset(btn.dataset.preset);
    btn.textContent = 'Preset applied';
    setTimeout(() => { btn.textContent = `Apply ${btn.dataset.preset}`; }, 1200);
  });
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
  const afterExamples = document.querySelector('.worked-examples-panel') || document.querySelector('.calculator-presets-panel');
  if (afterExamples) afterExamples.after(panel);
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
  const afterAssumptions = document.querySelector('.assumption-panel') || document.querySelector('.worked-examples-panel') || document.querySelector('.calculator-presets-panel');
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
  const afterSources = document.querySelector('.source-confidence-panel') || document.querySelector('.assumption-panel') || document.querySelector('.worked-examples-panel');
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
  container.prepend(panel);
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
    parent.insertBefore(btn, canvas);
    const svgBtn = document.createElement('button');
    svgBtn.type = 'button';
    svgBtn.className = 'mini-action export-float';
    svgBtn.textContent = 'Export SVG';
    svgBtn.addEventListener('click', () => exportCanvasSVG(canvas, `${canvas.id || 'amo-career-plot-' + (i + 1)}.svg`));
    parent.insertBefore(svgBtn, canvas);
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
  applyPreset,
};

/* ─────────────────────────────────────────────────────
   INIT — run everything on DOMContentLoaded
   ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initAccordions();
  initTabs();
  initSmoothScroll();
  initHeroCanvas();
  initRecentTracking();
  renderRecentTools();
  initDerivationToggles();
  initShareableCalculatorParams();
  initCalculatorPresets();
  initWorkedExamples();
  initPaperToolBridge();
  initExportButtons();
  initCopyOnClick();
});

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
