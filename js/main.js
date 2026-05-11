/* =====================================================
   AMO Career — Shared JS
   Nav renderer · Canvas animation · Scroll reveal · Accordions · Tabs
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   NAV DATA
   ───────────────────────────────────────────────────── */
const NAV = {
  build: [
    { key: 'atom-library',   label: 'Atom Library',                kind: 'Reference', icon: '⚛️', color: '#38bdf8', href: 'pages/atom-library.html'   },
    { key: 'laser-planner',  label: 'Laser System Planner',        kind: 'Design tool', icon: '💡', color: '#f472b6', href: 'pages/laser-planner.html'  },
    { key: 'mot-designer',   label: 'MOT & Trap Designer',         kind: 'Calculator', icon: '🧲', color: '#fb923c', href: 'pages/mot-designer.html'   },
    { key: 'laser-locking',  label: 'Laser Stabilization Guide',   kind: 'Guide', icon: '🔐', color: '#f87171', href: 'pages/laser-locking.html'  },
    { key: 'lab-techniques', label: 'Lab Setup & Techniques',      kind: 'Guide', icon: '🔬', color: '#34d399', href: 'pages/lab-techniques.html' },
    { key: 'polarimetry',    label: 'Polarization State Analyzer', kind: 'Simulator', icon: '🔭', color: '#e879f9', href: 'pages/polarimetry.html'    },
    { key: 'zernike',        label: 'Wavefront & Aberration Viewer', kind: 'Simulator', icon: '🌊', color: '#2dd4bf', href: 'pages/zernike.html'      },
    { key: 'cavity-qed',     label: 'Cavity QED Calculator',       kind: 'Calculator', icon: '💎', color: '#c084fc', href: 'pages/cavity-qed.html'   },
  ],
  measure: [
    { key: 'imaging-calculator', label: 'Single-Atom Detection SNR',  kind: 'Calculator', icon: '📷', color: '#34d399', href: 'pages/imaging-calculator.html' },
    { key: 'release-recapture',  label: 'Tweezer Thermometry (R&R)',  kind: 'Simulator', icon: '🎯', color: '#fb923c', href: 'pages/release-recapture.html'  },
    { key: 'tof-calculator',     label: 'Atom Temperature (TOF)',     kind: 'Calculator', icon: '🌡️', color: '#38bdf8', href: 'pages/tof-calculator.html'     },
    { key: 'lab-calculators',    label: 'Quick Lab Calculators',      kind: 'Calculator', icon: '🧮', color: '#fbbf24', href: 'pages/lab-calculators.html'    },
    { key: 'fidelity-budget',    label: 'Two-Qubit Gate Error Budget', kind: 'Calculator', icon: '📊', color: '#f87171', href: 'pages/fidelity-budget.html'   },
    { key: 'rb-explorer',        label: 'Gate Benchmarking (RB)',     kind: 'Deep dive', icon: '📈', color: '#c084fc', href: 'pages/rb-explorer.html'        },
    { key: 'dd-playground',      label: 'Qubit Coherence & Decoupling', kind: 'Simulator', icon: '🛡️', color: '#4ade80', href: 'pages/dd-playground.html'     },
  ],
  cooling: [
    { key: 'laser-cooling',      label: 'Laser Cooling Overview',     kind: 'Deep dive', icon: '❄️', color: '#60a5fa', href: 'pages/laser-cooling.html' },
    { label: 'Overview & Lamb-Dicke',      kind: 'Section', icon: '📐', href: 'pages/laser-cooling.html#lamb-dicke',   color: '#60a5fa' },
    { label: 'Resolved Sideband',          kind: 'Section', icon: '📡', href: 'pages/laser-cooling.html#resolved-sb',  color: '#60a5fa' },
    { label: 'Gray Molasses',              kind: 'Section', icon: '☁️', href: 'pages/laser-cooling.html#gm',           color: '#60a5fa' },
    { label: 'EIT / Λ-Enhanced GM',        kind: 'Section', icon: '✨', href: 'pages/laser-cooling.html#eit-lgm',      color: '#60a5fa' },
    { label: 'Raman Sideband',             kind: 'Section', icon: '🔀', href: 'pages/laser-cooling.html#rsb',          color: '#60a5fa' },
    { key: 'cooling-simulator', label: 'Doppler Cooling Simulator',   kind: 'Simulator', icon: '🌡️', color: '#34d399', href: 'pages/cooling-simulator.html' },
    { key: 'mot-designer',      label: 'MOT & Trap Designer',         kind: 'Calculator', icon: '🧲', color: '#fb923c', href: 'pages/mot-designer.html' },
    { key: 'release-recapture', label: 'Release-Recapture Thermometry', kind: 'Simulator', icon: '🎯', color: '#fb923c', href: 'pages/release-recapture.html' },
    { key: 'rydberg-calculator', label: 'Rydberg States & Blockade',  kind: 'Calculator', icon: '🔮', color: '#818cf8', href: 'pages/rydberg-calculator.html' },
  ],
  quantum: [
    { key: 'learn-quantum',      label: 'Learn Quantum',              kind: 'Learning path', icon: '🔵', color: '#c084fc', href: 'pages/learn-quantum.html' },
    { key: 'qc-landscape',       label: 'Quantum Computing Industry', kind: 'Landscape', icon: '💻', color: '#a78bfa', href: 'pages/qc-landscape.html' },
    { key: 'rb87-vs-yb171',      label: 'Rb vs Yb Qubit Comparison',  kind: 'Deep dive', icon: '⚖️', color: '#f59e0b', href: 'pages/rb87-vs-yb171.html' },
    { key: 'rydberg-calculator', label: 'Rydberg States & Blockade',  kind: 'Calculator', icon: '🔮', color: '#818cf8', href: 'pages/rydberg-calculator.html' },
    { key: 'fidelity-budget',    label: 'Two-Qubit Gate Error Budget', kind: 'Calculator', icon: '📊', color: '#f87171', href: 'pages/fidelity-budget.html' },
    { key: 'rb-explorer',        label: 'Gate Benchmarking (RB)',     kind: 'Deep dive', icon: '📈', color: '#c084fc', href: 'pages/rb-explorer.html' },
    { key: 'dd-playground',      label: 'Qubit Coherence & Decoupling', kind: 'Simulator', icon: '🛡️', color: '#4ade80', href: 'pages/dd-playground.html' },
  ],
  career: [
    { key: 'amo-groups',     label: 'AMO Research Groups',        kind: 'Career map', icon: '🌍', color: '#4ade80', href: 'pages/amo-groups.html' },
    { key: 'paper-syllabus', label: 'AMO Reading List',           kind: 'Syllabus', icon: '📚', color: '#818cf8', href: 'pages/paper-syllabus.html' },
    { key: 'qc-landscape',   label: 'QC Industry Landscape',      kind: 'Landscape', icon: '💻', color: '#a78bfa', href: 'pages/qc-landscape.html' },
    { key: 'rb87-vs-yb171',  label: 'Rb vs Yb Platform Comparison', kind: 'Deep dive', icon: '⚖️', color: '#f59e0b', href: 'pages/rb87-vs-yb171.html' },
    { key: 'learn-quantum',  label: 'Learn Quantum',              kind: 'Learning path', icon: '🔵', color: '#c084fc', href: 'pages/learn-quantum.html' },
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

NAV.tools = [...new Map([
  ...NAV.build,
  ...NAV.measure,
  ...NAV.cooling.filter(item => item.key),
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
        <a class="nav-logo" href="${root}home.html" aria-label="AMO Career home">
          <div class="nav-logo-mark">⚛️</div>
          <div>
            <div class="nav-logo-text"><span class="amo">AMO</span> Career</div>
            <div class="nav-logo-sub">AMO Physics Toolkit</div>
          </div>
        </a>

        <div class="nav-links" role="menubar">
          <a class="nav-btn" href="${root}home.html#intent-paths">Start Here</a>
          ${dropdown('Build', NAV.build, 'Design and assemble an AMO experiment', 560)}
          ${dropdown('Measure', NAV.measure, 'Diagnose signals, temperatures, gates, and coherence', 560)}
          ${dropdown('Cool & Trap', NAV.cooling, 'Cooling, trapping, and Rydberg control', 560)}
          ${dropdown('Quantum Computing', NAV.quantum, 'Neutral-atom QC concepts, gates, and platforms', 560)}
          ${dropdown('Career & Literature', NAV.career, 'Groups, papers, and industry orientation', 520)}
          <a class="nav-btn" href="${root}home.html#about">About</a>
        </div>

        <div class="nav-right">
          <button class="nav-search-btn" id="global-search-btn" type="button" aria-label="Search AMO Career">
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
      ${mobileSection('Measure', NAV.measure)}
      ${mobileSection('Cool & Trap', NAV.cooling)}
      ${mobileSection('Quantum Computing', NAV.quantum)}
      ${mobileSection('Career & Literature', NAV.career)}
      <div class="nav-mobile-section">
        <button class="nav-mobile-link nav-mobile-search" id="global-search-btn-mobile" type="button">
          <span>⌕</span> Search AMO Career
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
            <h2 id="global-search-title">Search AMO Career</h2>
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
    title: 'Laser Cooling Guide',
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
  initHeroCanvas();
  initRecentTracking();
  renderRecentTools();
  initDerivationToggles();
  initShareableCalculatorParams();
  initExportButtons();
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
