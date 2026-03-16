/* =====================================================
   AMO Career — Shared JS
   Nav renderer · Canvas animation · Scroll reveal · Accordions · Tabs
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   NAV DATA
   ───────────────────────────────────────────────────── */
const NAV = {
  tools: [
    { key: 'atom-library',      label: 'Atom Library',       icon: '⚛️',  color: '#38bdf8', href: 'pages/atom-library.html'      },
    { key: 'lab-techniques',    label: 'Lab Techniques',     icon: '🔬',  color: '#34d399', href: 'pages/lab-techniques.html'    },
    { key: 'qc-landscape',      label: 'QC Landscape',       icon: '💻',  color: '#a78bfa', href: 'pages/qc-landscape.html'      },
    { key: 'cooling-simulator', label: 'Cooling Simulator',  icon: '❄️',  color: '#60a5fa', href: 'pages/cooling-simulator.html' },
    { key: 'release-recapture', label: 'Release-Recapture',  icon: '🎯',  color: '#fb923c', href: 'pages/release-recapture.html' },
    { key: 'lab-calculators',   label: 'Lab Calculators',    icon: '🧮',  color: '#fbbf24', href: 'pages/lab-calculators.html'   },
    { key: 'clebsch-gordan',    label: 'Clebsch-Gordan',     icon: '🔢',  color: '#f472b6', href: 'pages/clebsch-gordan.html'    },
    { key: 'laser-locking',     label: 'Laser Locking',      icon: '🔐',  color: '#f87171', href: 'pages/laser-locking.html'     },
    { key: 'zernike',           label: 'Zernike Polynomials',icon: '🌊',  color: '#2dd4bf', href: 'pages/zernike.html'           },
    { key: 'polarimetry',       label: 'Polarimetry Explorer',icon: '🔭', color: '#e879f9', href: 'pages/polarimetry.html'        },
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
    { key: 'laser-cooling-phy',  label: 'Laser Cooling Physics', icon: '🌡️',  href: 'pages/learn-quantum.html#cooling'      },
    { key: 'wigner-function',    label: 'Wigner Function',       icon: '🌊',  href: 'pages/learn-quantum.html#wigner'       },
  ],
};

/* ─────────────────────────────────────────────────────
   RENDER NAV
   Call: renderNav({ active: 'atom-library', root: '../' })
   ───────────────────────────────────────────────────── */
function renderNav({ active = '', root = '' } = {}) {
  const el = document.getElementById('nav-root');
  if (!el) return;

  const toolsHTML = NAV.tools.map(t => `
    <a class="nav-drop-item" href="${root}${t.href}" ${active === t.key ? 'aria-current="page"' : ''}>
      <span class="nav-drop-dot" style="background:${t.color}"></span>
      ${t.label}
    </a>
  `).join('');

  const learnHTML = NAV.learn.map(t => `
    <a class="nav-drop-item" href="${root}${t.href}">
      <span style="font-size:1rem;width:20px;text-align:center">${t.icon}</span>
      ${t.label}
    </a>
  `).join('');

  // Mobile tools
  const mobileTools = NAV.tools.map(t => `
    <a class="nav-mobile-link" href="${root}${t.href}">
      <span class="nav-drop-dot" style="background:${t.color};width:8px;height:8px;border-radius:50%;flex-shrink:0"></span>
      ${t.label}
    </a>
  `).join('');

  const mobileLearn = NAV.learn.map(t => `
    <a class="nav-mobile-link" href="${root}${t.href}">
      <span style="font-size:1.1rem">${t.icon}</span>
      ${t.label}
    </a>
  `).join('');

  el.innerHTML = `
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <div class="nav-inner">

        <!-- Logo -->
        <a class="nav-logo" href="${root}home.html" aria-label="AMO Career home">
          <div class="nav-logo-mark">⚛️</div>
          <div>
            <div class="nav-logo-text"><span class="amo">AMO</span> Career</div>
            <div class="nav-logo-sub">AMO Physics Toolkit</div>
          </div>
        </a>

        <!-- Desktop links -->
        <div class="nav-links" role="menubar">

          <!-- Tools dropdown -->
          <div class="nav-item" role="none">
            <button class="nav-btn ${NAV.tools.some(t=>t.key===active)?'active':''}" role="menuitem" aria-haspopup="true" aria-expanded="false">
              Tools
              <svg class="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            </button>
            <div class="nav-drop" role="menu">
              <div class="nav-drop-section">9 Primary Tools</div>
              ${toolsHTML}
            </div>
          </div>

          <!-- Learn dropdown -->
          <div class="nav-item" role="none">
            <button class="nav-btn" role="menuitem" aria-haspopup="true" aria-expanded="false">
              Learn Quantum
              <svg class="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            </button>
            <div class="nav-drop" role="menu" style="min-width:300px">
              <div class="nav-drop-section">Quantum Fundamentals</div>
              ${learnHTML}
            </div>
          </div>

          <a class="nav-btn" href="${root}home.html#about">About</a>
        </div>

        <!-- Right side -->
        <div class="nav-right">
          <a class="nav-cta" href="${root}home.html#tools">Explore Tools</a>
        </div>

        <!-- Hamburger -->
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

      </div>
    </nav>

    <!-- Mobile overlay -->
    <div class="nav-mobile-overlay" id="nav-mobile" role="dialog" aria-label="Mobile navigation">
      <div class="nav-mobile-section">
        <div class="nav-mobile-section-title">Tools</div>
        ${mobileTools}
      </div>
      <div class="nav-mobile-section">
        <div class="nav-mobile-section-title">Learn Quantum</div>
        ${mobileLearn}
      </div>
      <div class="nav-mobile-section">
        <a class="nav-mobile-link" href="${root}home.html#about">
          <span>👤</span> About
        </a>
      </div>
    </div>
  `;

  // Hamburger toggle
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Keyboard nav: click outside closes dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
    }
  });

  // Toggle dropdown on button click (for keyboard / touch)
  document.querySelectorAll('.nav-btn[aria-haspopup]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = btn.closest('.nav-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
      btn.setAttribute('aria-expanded', !wasOpen);
    });
  });
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
   INIT — run everything on DOMContentLoaded
   ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initAccordions();
  initTabs();
  initSmoothScroll();
  initHeroCanvas();
});
