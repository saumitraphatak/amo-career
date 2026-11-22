/* =====================================================
   AMO Toolkit — Shared JS
   Nav renderer · Transitions · Scroll reveal · Accordions · Tabs
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   THEME — dark (default) / light toggle, persisted
   ───────────────────────────────────────────────────── */
const THEME_KEY = 'amo-theme';

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
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

/* ─────────────────────────────────────────────────────
   TRANSITIONS — one motion language for the whole site
   • page → page: cross-document View Transitions (CSS @view-transition);
     the nav stays put while the page content cross-fades/rises
   • links are prefetched on hover/touch so the next page is already here
   • tabs: a sliding underline + the new panel eases in (height morphs)
   • accordions, mobile menu, search: open and close with the same curve
   • theme switch: circular reveal from the toggle
   Everything collapses to instant under prefers-reduced-motion, and is
   skipped (not broken) in browsers without the relevant API.
   ───────────────────────────────────────────────────── */
const AMO_EASE = 'cubic-bezier(.22,.8,.26,1)';   // fast out of the gate, soft landing
const AMO_EASE_IN = 'cubic-bezier(.45,0,.9,.4)';  // for things leaving

function motionOK() {
  return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) &&
    typeof Element !== 'undefined' && !!Element.prototype.animate;
}

const AMOTransitions = (() => {
  function stop(el) { if (el && el.getAnimations) el.getAnimations().forEach(a => a.cancel()); }
  function clipDuring(el, anim) {
    const prev = el.style.overflow;
    el.style.overflow = 'clip';
    const done = () => { el.style.overflow = prev; };
    anim.addEventListener('finish', done); anim.addEventListener('cancel', done);
  }

  // Swap one panel for another. doSwap() performs the actual DOM/class change.
  // dir: −1 / +1 = the new panel came from the left / right (tabs), 0 = no direction.
  function swap(fromEl, getTo, doSwap, dir = 0) {
    if (!motionOK()) { doSwap(); return; }
    stop(fromEl);
    const h0 = fromEl ? fromEl.getBoundingClientRect().height : 0;
    doSwap();
    const to = typeof getTo === 'function' ? getTo() : getTo;
    if (!to || to === fromEl) return;
    stop(to);
    const h1 = to.getBoundingClientRect().height;
    to.animate([
      { opacity: 0, transform: dir ? `translateX(${dir * 16}px)` : 'translateY(8px)' },
      { opacity: 1, transform: 'none' }
    ], { duration: 300, easing: AMO_EASE });
    if (h0 > 0 && h1 > 0 && Math.abs(h1 - h0) > 2) {
      const a = to.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 360, easing: AMO_EASE });
      clipDuring(to, a);
    }
  }

  // Grow an element open from zero height (padding included), or shrink it shut.
  function expand(el) {
    if (!motionOK() || !el) return;
    stop(el);
    const cs = getComputedStyle(el), h = el.getBoundingClientRect().height;
    if (!h) return;
    const a = el.animate([
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
      { height: h + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 }
    ], { duration: 340, easing: AMO_EASE });
    clipDuring(el, a);
  }
  function collapse(el, done) {
    if (!motionOK() || !el) { done(); return; }
    stop(el);
    const cs = getComputedStyle(el), h = el.getBoundingClientRect().height;
    if (!h) { done(); return; }
    const a = el.animate([
      { height: h + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 },
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }
    ], { duration: 260, easing: AMO_EASE_IN });
    clipDuring(el, a);
    a.addEventListener('finish', done);
  }

  // Overlays (mobile menu, search): fade + a small travel in, reverse on the way out.
  function enter(el, from = 'translateY(-8px)') {
    if (!motionOK() || !el) return;
    stop(el);
    el.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], { duration: 280, easing: AMO_EASE });
  }
  function leave(el, done, to = 'translateY(-6px)') {
    if (!motionOK() || !el) { done(); return; }
    stop(el);
    const a = el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: to }], { duration: 180, easing: AMO_EASE_IN });
    a.addEventListener('finish', done);
  }

  // Sliding underline for a row of tab buttons. Only used where the active
  // tab is drawn with a bottom border (so pill-style bars are left alone).
  function attachInk(bar, activeSel) {
    if (!bar || bar.__ink) return bar && bar.__ink;
    const active = bar.querySelector(activeSel);
    if (!active) return null;
    const cs = getComputedStyle(active);
    if (parseFloat(cs.borderBottomWidth) < 1.5 || cs.borderBottomColor === 'transparent' || /rgba\(.*,\s*0\)$/.test(cs.borderBottomColor)) return null;
    const ink = document.createElement('span');
    ink.className = 'tab-ink';
    ink.setAttribute('aria-hidden', 'true');
    bar.appendChild(ink);
    bar.classList.add('has-ink');
    function place(animate) {
      const btn = bar.querySelector(activeSel);
      if (!btn || !btn.offsetWidth) return;
      if (!animate || !motionOK()) ink.style.transition = 'none';
      ink.style.width = btn.offsetWidth + 'px';
      ink.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop + btn.offsetHeight - 2}px)`;
      ink.style.color = getComputedStyle(btn).color;
      if (!animate || !motionOK()) { void ink.offsetWidth; ink.style.transition = ''; }
      // keep the active tab in view on narrow screens
      if (animate && bar.scrollWidth > bar.clientWidth) {
        const l = btn.offsetLeft - 24, r = btn.offsetLeft + btn.offsetWidth + 24;
        if (l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: Math.max(0, l), behavior: motionOK() ? 'smooth' : 'auto' });
      }
    }
    bar.__ink = { place };
    place(false);
    if (window.ResizeObserver) new ResizeObserver(() => place(false)).observe(bar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(false));
    return bar.__ink;
  }

  return { swap, expand, collapse, enter, leave, attachInk, stop };
})();
window.AMOTransitions = AMOTransitions;

/* Page → page: keep the nav fixed during cross-document view transitions,
   and show above-the-fold content at once (the transition itself is the
   entrance), instead of fading it in a second time.

   Shared-element morph (2026-09-29): when a card with an icon is clicked
   (home tool cards and intent cards, start-here "see also" cards), that icon
   flies into the same icon on the next page's hero badge. Only the clicked
   icon and its twin are named ('amo-tool-icon'), only for the duration of
   the transition, and only when both are on screen and show the same glyph,
   so names stay unique and nothing morphs into something unrelated. Going
   back to the page with the cards reverses it. A one-shot sessionStorage
   note carries "which icon" across the navigation. */
(function initPageTransitions() {
  const nav = () => document.querySelector('#nav-root .nav');
  const VT_ICON = 'amo-tool-icon', KEY = 'amo-vt-icon';
  const ICON_SEL = '.tool-card-icon, .intent-icon, .see-also-icon';
  const EMOJI_RE = /^(\s*)(\p{Extended_Pictographic}[️⃣]?(?:‍\p{Extended_Pictographic}️?)*)/u;
  const glyph = s => (s || '').replace(/[\s︎️]/g, '');
  const pagePath = u => {
    try { const x = new URL(u, location.href); return x.origin + x.pathname.replace(/\/(index\.html)?$/, '/home.html'); }
    catch (e) { return ''; }
  };
  const onScreen = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 64 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const store = v => { try { v ? sessionStorage.setItem(KEY, JSON.stringify(v)) : sessionStorage.removeItem(KEY); } catch (e) {} };
  const take = () => { let v = null; try { v = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch (e) {} return v; };
  let named = [];
  const name = el => { el.style.viewTransitionName = VT_ICON; named.push(el); };
  const unname = () => { named.forEach(el => { el.style.viewTransitionName = ''; }); named = []; };

  // The hero badge's leading emoji (".page-hero-eyebrow", ".page-tag", ".pill", …):
  // the first non-blank text before the page <h1>. Wrapped in a span on demand.
  function heroIcon() {
    const hero = document.querySelector('.page-hero');
    const h1 = hero && hero.querySelector('h1');
    if (!h1) return null;
    const w = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (h1.contains(n) || (h1.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING)) return null;
      const p = n.parentElement;
      if (!n.data.trim() || !p || p.closest('[aria-hidden="true"], script, style, svg')) continue;
      if (p.classList.contains('amo-vt-glyph')) return p;
      const m = n.data.match(EMOJI_RE);
      if (!m) return null;
      // Where the label's first letter sits now; if wrapping the emoji moved
      // it at all, a margin puts it back.
      const firstX = (node, from) => {
        const k = node.data.slice(from).search(/\S/);
        if (k < 0) return null;
        const r = document.createRange(); r.setStart(node, from + k); r.setEnd(node, from + k + 1);
        return r.getBoundingClientRect().left;
      };
      const x0 = firstX(n, m[0].length);
      const glyphNode = n.splitText(m[1].length);
      const tail = glyphNode.splitText(m[2].length);
      // The emoji and the rest of its text stay together in one inline run,
      // so a flex badge still sees a single item (same wrapping as before).
      const run = document.createElement('span');
      const span = document.createElement('span');
      span.className = 'amo-vt-glyph';
      span.style.display = 'inline-block';
      glyphNode.replaceWith(run);
      run.append(span, tail);
      span.appendChild(glyphNode);
      const x1 = firstX(tail, 0);
      if (x0 != null && x1 != null && Math.abs(x0 - x1) > 0.25) span.style.marginRight = (x0 - x1) + 'px';
      return span;
    }
    return null;
  }
  // Cards on this page that open `path`, with their icon.
  const cardIcons = path => [...document.querySelectorAll('a[href]')]
    .filter(a => pagePath(a.href) === path)
    .map(a => a.querySelector(ICON_SEL)).filter(Boolean);

  let clicked = null;
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    const icon = a && a.querySelector(ICON_SEL);
    clicked = icon ? { href: a.href, icon } : null;
  }, true);

  window.addEventListener('pageswap', e => {
    unname();
    const c = clicked; clicked = null;
    if (!e.viewTransition) return;
    if (nav()) nav().style.viewTransitionName = 'site-nav';
    const dest = e.activation && e.activation.entry && e.activation.entry.url;
    if (!dest) return store(null);
    const to = pagePath(dest), here = pagePath(location.href);
    if (c && pagePath(c.href) === to && !new URL(dest).hash && onScreen(c.icon)) {
      // Forward: a card icon → the next page's hero icon.
      name(c.icon);
      store({ to, glyph: glyph(c.icon.textContent) });
    } else {
      // Backward: this page's hero icon → the matching card icon, if the
      // next page has one on screen (it decides on arrival).
      const h = heroIcon();
      if (h && onScreen(h)) { name(h); store({ to, from: here, glyph: glyph(h.textContent) }); }
      else store(null);
    }
  });
  window.addEventListener('pagereveal', e => {
    unname();
    const note = take();
    if (!e.viewTransition) return;
    const n = nav();
    if (n) n.style.viewTransitionName = 'site-nav';
    if (note && note.to === pagePath(location.href) && note.glyph) {
      const twin = note.from
        ? cardIcons(note.from).find(el => glyph(el.textContent) === note.glyph && onScreen(el))
        : heroIcon();
      if (twin && glyph(twin.textContent) === note.glyph && onScreen(twin)) name(twin);
    }
    document.querySelectorAll('.anim-in:not(.visible)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { el.style.transition = 'none'; el.classList.add('visible'); }
    });
    e.viewTransition.finished.finally(() => {
      if (n) n.style.viewTransitionName = '';
      unname();
      document.querySelectorAll('.anim-in.visible').forEach(el => { if (el.style.transition === 'none') el.style.transition = ''; });
    });
  });
  window.addEventListener('pageshow', () => { const n = nav(); if (n) n.style.viewTransitionName = ''; });
  window.AMOPageMorph = { heroIcon, glyph };
})();

/* Prefetch the next page on intent (hover ≥ ~200 ms, touch start, focus),
   so navigation feels instant. Speculation Rules where supported; a plain
   <link rel=prefetch> fallback elsewhere. Same-origin .html links only. */
(function initPrefetch() {
  if (window.__amoPrefetch) return; window.__amoPrefetch = true;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return;
  if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    const s = document.createElement('script');
    s.type = 'speculationrules';
    s.textContent = JSON.stringify({
      prefetch: [{
        source: 'document',
        where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[target=_blank], [download], [rel~=nofollow]' } }] },
        eagerness: 'moderate'
      }]
    });
    document.head.appendChild(s);
    return;
  }
  const done = new Set();
  function maybe(e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    let u; try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname) || u.pathname === location.pathname) return;
    if (done.has(u.pathname)) return;
    done.add(u.pathname);
    const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.pathname; document.head.appendChild(l);
  }
  document.addEventListener('pointerover', maybe, { passive: true });
  document.addEventListener('touchstart', maybe, { passive: true });
  document.addEventListener('focusin', maybe);
})();

function initThemeToggle() {
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = getStoredTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      if (!document.startViewTransition || !motionOK()) { applyTheme(next); return; }
      // Circular reveal of the new theme, growing out of the toggle itself.
      const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const root = document.documentElement;
      root.classList.add('amo-theme-vt');
      const vt = document.startViewTransition(() => applyTheme(next));
      vt.ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 560, easing: AMO_EASE, pseudoElement: '::view-transition-new(root)' });
      }).catch(() => {});
      vt.finished.finally(() => root.classList.remove('amo-theme-vt'));
    });
  });
}

/* ─────────────────────────────────────────────────────
   NAV DATA
   ───────────────────────────────────────────────────── */
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
    { key: 'magic-states',       label: 'Magic States',          icon: '✨',  href: 'pages/learn-quantum.html#magic'          },
  ],
};

const MEASURE_KEYS = ['imaging-calculator', 'release-recapture', 'tof-calculator', 'lab-calculators', 'absorption-imaging'];
NAV.measure = NAV.trapImageCool.filter(t => MEASURE_KEYS.includes(t.key));        // older two-way split, still used by search
NAV.cooling = NAV.trapImageCool.filter(t => !MEASURE_KEYS.includes(t.key));
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
      ${t.step ? `<span class="nav-step-n" style="--step-c:${t.color}">${t.step}</span>` : `<span class="nav-drop-dot" style="background:${t.color || '#38bdf8'}"></span>`}
      <span style="display:flex;flex-direction:column;gap:.08rem;min-width:0">
        <span>${t.label}</span>
        ${t.tool || t.kind ? `<small style="color:var(--text-muted);font-size:.68rem;letter-spacing:.02em">${t.tool || t.kind}</small>` : ''}
      </span>
    </a>
  `;
  const mobileItemHTML = t => `
    <a class="nav-mobile-link" href="${root}${t.href}">
      ${t.step ? `<span class="nav-step-n" style="--step-c:${t.color}">${t.step}</span>` : `<span class="nav-drop-dot" style="background:${t.color || '#38bdf8'};width:8px;height:8px;border-radius:50%;flex-shrink:0"></span>`}
      <span style="display:flex;flex-direction:column;gap:.05rem;min-width:0">
        <span>${t.label}</span>
        ${t.tool || t.kind ? `<small style="color:var(--text-muted);font-size:.68rem;letter-spacing:.02em">${t.tool || t.kind}</small>` : ''}
      </span>
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
          <a class="nav-btn" href="${root}pages/start-here.html">Start Here</a>
          ${dropdown('Build', NAV.build, 'Build an AMO lab, step by step', 580)}
          ${dropdown('Trap, Image & Cool', NAV.trapImageCool, 'Run your first experiment, step by step', 660)}
          ${dropdown('Quantum Computing', NAV.quantum, 'Turn trapped atoms into a quantum computer', 640)}
          ${dropdown('Career & Literature', NAV.career, 'Take it into a career', 640)}
          <a class="nav-btn" href="${root}pages/teach.html">Teach</a>
          <a class="nav-btn" href="${root}book/">Book</a>
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
        <a class="nav-mobile-link" href="${root}pages/start-here.html"><span>🗺️</span> Site Map &amp; Start Here</a>
        <a class="nav-mobile-link" href="${root}pages/teach.html"><span>🎓</span> Teach with AMO Toolkit</a>
        <a class="nav-mobile-link" href="${root}book/"><span>📘</span> The book: Building with Atoms</a>
        <a class="nav-mobile-link" href="${root}home.html#intent-paths"><span>🧭</span> I am trying to...</a>
        <a class="nav-mobile-link" href="${root}home.html#paths"><span>🧩</span> Guided Paths (home)</a>
      </div>
      ${mobileSection('Build a lab, step by step', NAV.build)}
      ${mobileSection('Run a first experiment', NAV.trapImageCool)}
      ${mobileSection('Build a quantum computer', NAV.quantum)}
      ${mobileSection('Start a career', NAV.career)}
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
          placeholder="Try: Cs, recoil, MOT, Rydberg, QuEra, polarimetry..." autocomplete="off"
          aria-label="Search AMO Toolkit">
        <div class="global-search-results" id="global-search-results" role="listbox"></div>
      </div>
    </div>
  `;

  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  hamburger.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open') || mobileMenu.dataset.closing === '1';
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      delete mobileMenu.dataset.closing;
      mobileMenu.classList.add('open');
      AMOTransitions.enter(mobileMenu, 'translateY(-10px)');
    } else {
      mobileMenu.dataset.closing = '1';
      AMOTransitions.leave(mobileMenu, () => {
        if (mobileMenu.dataset.closing === '1') { mobileMenu.classList.remove('open'); delete mobileMenu.dataset.closing; }
      });
    }
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

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register(`${root}sw.js`).catch(() => {});
  }
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
      const body = acc.querySelector(':scope > .accordion-body') || acc.querySelector('.accordion-body');
      const opening = !acc.classList.contains('open') || acc.dataset.closing === '1';
      header.setAttribute('aria-expanded', opening);
      if (opening) {
        delete acc.dataset.closing;
        acc.classList.add('open');
        AMOTransitions.expand(body);
      } else {
        acc.dataset.closing = '1';
        acc.classList.add('closing');
        AMOTransitions.collapse(body, () => {
          if (acc.dataset.closing === '1') acc.classList.remove('open');
          acc.classList.remove('closing'); delete acc.dataset.closing;
        });
      }
    });
  });
}

/* ─────────────────────────────────────────────────────
   TABS
   ───────────────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.tab-bar').forEach(bar => {
    const group = bar.dataset.group;
    bar.setAttribute('role', 'tablist');

    // Accessible-name the panels this bar controls (only filter by group when declared)
    const wrap = bar.closest('[data-tabs-wrap]') || document;
    const panelsForBar = Array.from(wrap.querySelectorAll('.tab-panel[data-tab]'))
      .filter(p => !(p.dataset.group && group && p.dataset.group !== group));
    panelsForBar.forEach(p => p.setAttribute('role', 'tabpanel'));

    bar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');

      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        const btns = Array.from(bar.querySelectorAll('.tab-btn'));
        const prevBtn = bar.querySelector('.tab-btn.active');
        if (prevBtn === btn) return;
        const dir = prevBtn ? Math.sign(btns.indexOf(btn) - btns.indexOf(prevBtn)) : 0;
        const mine = p => !(p.dataset.group && group && p.dataset.group !== group);
        const panels = Array.from(wrap.querySelectorAll('.tab-panel[data-tab]')).filter(mine);
        const fromPanel = panels.find(p => p.classList.contains('active'));
        const toPanel = panels.find(p => p.dataset.tab === target);

        AMOTransitions.swap(fromPanel, toPanel, () => {
          // Update buttons
          btns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          // Update panels — only filter by group when the panel declares one
          panels.forEach(p => p.classList.toggle('active', p.dataset.tab === target));
        }, dir);
        if (bar.__ink) bar.__ink.place(true);
      });
    });
    AMOTransitions.attachInk(bar, '.tab-btn.active');
  });
}

/* ─────────────────────────────────────────────────────
   SMOOTH ANCHOR SCROLL (for in-page links)
   ───────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (hash === '#') return;
      let target = null;
      try { target = document.querySelector(hash); } catch (err) { return; }
      if (!target) return;
      e.preventDefault();
      if (window.AMOChapters) AMOChapters.reveal(target);   // target may sit in a hidden chapter
      const offset = 80 + (window.AMOChapters ? AMOChapters.offsetFor(target) : 0); // nav (+ pinned chapter bar)
      // Document position (offsetTop is relative to the offsetParent, which is wrong inside positioned containers)
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: motionOK() ? 'smooth' : 'auto' });
      if (history.pushState && location.hash !== hash) history.pushState(null, '', hash);
    });
  });
}

/* ─────────────────────────────────────────────────────
   SEARCH, RECENTS, SHARE LINKS, EXPORTS
   ───────────────────────────────────────────────────── */
const RECENT_TOOLS_KEY = 'amo_recent_tools_v1';

const SEARCH_KEYWORDS = {
  'atom-library': 'species isotope constants rubidium cesium lithium strontium ytterbium Rb Cs Li Sr Yb Dy Er K Na Ca Ba Doppler linewidth recoil hyperfine Steck NIST D1 D2',
  'lab-techniques': 'optics fibers AOM polarimetry optical pumping laser systems RF antenna Gaussian process lab workflow alignment vacuum eddy current Feshbach coil bucking coil fast field switching Kell magnetic field control',
  'laser-planner': 'laser system planner wavelength source diode SHG SFG AOM fiber species beam path power',
  'rydberg-calculator': 'Rydberg blockade C6 quantum defect lifetime Förster two-qubit gate radius alkali',
  'imaging-calculator': 'SNR fidelity photons EMCCD sCMOS histogram survival fluorescence single atom readout',
  'tof-calculator': 'time of flight thermometry temperature expansion PSD BEC Maxwell Boltzmann',
  'mot-designer': 'MOT magneto-optical trap gradient spring damping capture detuning Zeeman cooling cascade',
  'automation': 'automation feedback feedforward servo PID intensity stabilisation power AOM photodiode quadrant QPD beam pointing stabiliser MRC fibre coupling auto-alignment relock calibration optimisation optimizer Bayesian Gaussian process M-LOOP Nelder-Mead machine learning reinforcement learning neural network AI agent LLM monitoring Grafana',
  'control-systems': 'experiment control ARTIQ Sinara labscript NI DAQ PulseBlaster FPGA TTL DAC ADC DDS AWG timing sequence pulse shaping python git github',
  'fidelity-budget': 'Rydberg gate error budget blockade Doppler phase SPAM lifetime intensity noise fidelity',
  'release-recapture': 'tweezer thermometry recapture release Monte Carlo trap depth temperature',
  'lab-calculators': 'beam waist dBm recoil Doppler Zeeman saturation cavity FSR finesse trap frequency Clebsch Gordan',
  'laser-locking': 'SAS PDH beat note offset lock PLL cavity servo linewidth frequency stabilization ultrastable cavity ULE glass finesse ring-down mode matching thermal Brownian noise vibration insensitive mounting zero-crossing temperature ion pump Boyd Lahaye',
  'zernike': 'wavefront aberration SLM hologram Gerchberg Saxton Zernike tweezer correction',
  'polarimetry': 'Stokes Poincare QWP HWP PBS RCP LCP sigma polarization ellipticity qubit tomography density matrix Pauli Bloch sphere maximum likelihood James Kwiat',
  'qc-landscape': 'company roadmap IBM Google Quantinuum QuEra Atom Computing Microsoft IonQ Pasqal PsiQuantum interviews',
  'rb87-vs-yb171': 'qubit species comparison rubidium ytterbium neutral atom hyperfine nuclear spin clock',
  'quantinuum-vs-ionq': 'trapped ion quantum computing company comparison QCCD electronic qubit control EQC barium ytterbium Helios Tempo Superion fault tolerance logical qubits',
  'google-vs-ibm': 'superconducting qubit quantum computing company comparison transmon Willow Nighthawk quantum advantage utility claim qLDPC surface code fault tolerance',
  'psiquantum-vs-xanadu': 'photonic quantum computing company comparison fusion based loss tolerance silicon photonics Omega Aurora Borealis squeezed light Gaussian boson sampling',
  'rb-explorer': 'randomized benchmarking Clifford SPAM gate fidelity decay interleaved RB',
  'dd-playground': 'coherence Ramsey echo XY16 CPMG dynamical decoupling dephasing noise',
  'amo-groups': 'AMO research groups professors labs universities postdoc graduate school Rydberg clocks BEC molecules cavity QED',
  'paper-syllabus': 'AMO reading list papers syllabus reviews foundational literature Nobel cooling traps clocks Rydberg',
  'cooling-simulator': 'Doppler cooling molasses scattering temperature force simulator',
  'virtual-lab': 'tweezer array loading rearrangement defect-free assembly imaging threshold fluorescence camera monte carlo bell pair readout quantum computer cycle',
  'laser-cooling': 'Lamb-Dicke sideband gray molasses EIT Raman RSB polarization gradient cooling',
  'learn-quantum': 'Bloch sphere gates superposition measurement entanglement algorithms qubit basics',
  'cavity-qed': 'cavity QED coupling rate Purcell finesse strong weak bad-cavity coupling atom-photon Jaynes-Cummings',
  'vacuum-systems': 'UHV XHV ultra-high vacuum bakeout ion pump turbo pump roughing conflat flange leak check gauge',
  'tweezer-designer': 'optical tweezer array SLM AOD hologram trap depth waist spacing single atom loading',
  'absorption-imaging': 'absorption imaging Beer-Lambert optical density column density atom number resonant off-resonant saturation phase contrast dispersive imaging non-destructive Andrews dense cloud SLM phase mask',
  'decoherence-lab': 'T1 T2 T2 star dephasing dissipation Bloch sphere Ramsey echo optical Bloch equations relaxation',
  'remote-entanglement': 'remote entanglement photon collection heralded Bell state fiber link loss budget entanglement swapping distillation purification',
  'atom-processor': 'zoned architecture neutral atom quantum processor compiler AOD transport atom shuttling rydberg CZ global pulse entangling zone storage readout circuit state vector GHZ Grover Bernstein-Vazirani qubit placement',
  'bloch-sphere': 'Bloch sphere qubit state vector superposition rotation',
  'quantum-gates': 'quantum gates Hadamard Pauli X Y Z CNOT T-gate circuit',
  'superposition': 'superposition Born rule probability amplitude measurement collapse',
  'measurement': 'projective measurement expectation value no-cloning theorem',
  'entanglement': 'entanglement Bell states EPR CHSH quantum teleportation',
  'rydberg-atoms': 'Rydberg atoms n-scaling C6 blockade radius dipole-dipole interaction',
  'two-qubit-gates': 'two-qubit gates CZ CNOT controlled-phase Rydberg blockade gate',
  'rabi-oscillations': 'Rabi oscillations Rabi frequency dressed states Bloch vector precession rotating frame',
  'decoherence': 'decoherence T1 T2 T2 star inhomogeneous echo sequences',
  'hyperfine-qubits': 'hyperfine qubits clock states Zeeman shift Rb87 Cs133 qubit transitions',
  'optical-pumping': 'optical pumping selection rules population transfer three-level system',
  'qec': 'quantum error correction bit-flip Shor code surface code threshold theorem',
  'magic-states': 'magic state T gate non-Clifford Clifford Gottesman-Knill stabilizer distillation cultivation gate teleportation universality',
  'quantum-algorithms': 'quantum algorithms Deutsch-Jozsa Grover Shor VQE',
  'analog-sim': 'analog simulation Hubbard model Ising Hamiltonian BEC-BCS crossover',
  'start-here': 'site map directory start here where to begin guided paths recommended order navigation overview',
  'book': 'book pdf download offline building with atoms training kit read print chapters everything in one place',
  'teach': 'teach course syllabus lectures semester 14 weeks problem sets homework exercises instructors solutions final projects curriculum',
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
      keywords: `${item.label} ${item.tool || ''} ${SEARCH_KEYWORDS[key] || ''}`.toLowerCase(),
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

  byHref.set('book:overview', {
    key: 'book',
    title: 'Building with Atoms (the book)',
    icon: '📘',
    href: `${root}book/`,
    color: '#a13c1c',
    keywords: SEARCH_KEYWORDS['book'].toLowerCase(),
  });

  byHref.set('teach:overview', {
    key: 'teach',
    title: 'Teach with AMO Toolkit',
    icon: '🎓',
    href: `${root}pages/teach.html`,
    color: '#3d3f8f',
    keywords: SEARCH_KEYWORDS['teach'].toLowerCase(),
  });

  byHref.set('start-here:overview', {
    key: 'start-here',
    title: 'Site Map & Start Here',
    icon: '🗺️',
    href: `${root}pages/start-here.html`,
    color: '#38bdf8',
    keywords: SEARCH_KEYWORDS['start-here'].toLowerCase(),
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

  // Section hits: js/search-sections.js (built by tests/browser/build-section-index.js) lists every
  // page's section headings; it is loaded the first time search opens. Links use #s-<slug>, which
  // AMOSections resolves on the target page (opening the chapter, tab or accordion that holds it).
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let sectionsLoading = false;
  function loadSections() {
    if (window.AMO_SECTION_INDEX || sectionsLoading) return;
    sectionsLoading = true;
    const s = document.createElement('script');
    s.src = `${root}js/search-sections.js?v=1`;
    s.onload = () => { if (!modal.hidden) render(input.value); };
    document.head.appendChild(s);
  }
  function sectionMatches(query) {
    const idx = window.AMO_SECTION_INDEX;
    if (!idx || query.length < 2) return [];
    const tokens = query.split(/\s+/).filter(Boolean);
    const byKey = new Map(entries.map(e => [e.key, e]));
    return idx.map(x => {
      const t = x.t.toLowerCase(), page = byKey.get(x.p);
      const s = tokens.reduce((acc, tok) => acc + (t.includes(tok) ? 3 : 0) + (page && page.keywords.includes(tok) ? 0.5 : 0), 0);
      const all = tokens.every(tok => t.includes(tok) || (page && page.title.toLowerCase().includes(tok)));
      return { x, page, s: all ? s : 0 };
    }).filter(m => m.s >= 3 && m.page)
      .sort((a, b) => b.s - a.s || a.x.t.length - b.x.t.length)
      .slice(0, 8);
  }

  function render(q = '') {
    const query = q.trim().toLowerCase();
    const matches = entries
      .map(entry => ({ entry, s: score(entry, query) }))
      .filter(x => !query || x.s > 0)
      .sort((a, b) => b.s - a.s || a.entry.title.localeCompare(b.entry.title))
      .slice(0, 12);

    const pageHtml = matches.map(({ entry }) => `
      <a class="search-result" href="${entry.href}" data-search-href="${entry.href}">
        <span class="search-result-icon" style="--sr:${entry.color}">${entry.icon}</span>
        <span>
          <strong>${entry.title}</strong>
          <small>${(SEARCH_KEYWORDS[entry.key] || '').split(' ').slice(0, 8).join(' ')}</small>
        </span>
      </a>
    `).join('');
    const secs = sectionMatches(query);
    const secHtml = secs.length ? `<div class="search-group-label">Sections</div>` + secs.map(({ x, page }) => {
      const href = `${page.href.split('#')[0]}#${x.s}`;
      return `
      <a class="search-result search-result-section" href="${href}" data-search-href="${href}">
        <span class="search-result-icon" style="--sr:${page.color}" aria-hidden="true">§</span>
        <span>
          <strong>${esc(x.t)}</strong>
          <small>${esc(page.title)}${x.c ? ' · ' + esc(x.c) : ''}</small>
        </span>
      </a>`;
    }).join('') : '';
    results.innerHTML = (pageHtml + secHtml) || '<div class="search-no-results">No matches yet. Try a species, equation, or company name.</div>';
  }

  const panel = modal.querySelector('.global-search-panel'), backdrop = modal.querySelector('.global-search-backdrop');
  function openSearch() {
    delete modal.dataset.closing;
    modal.hidden = false;
    document.body.classList.add('search-open');
    render(input.value);
    loadSections();
    AMOTransitions.enter(panel, 'translateY(-10px) scale(.985)');
    AMOTransitions.enter(backdrop, 'none');
    setTimeout(() => input.focus(), 20);
  }

  function closeSearch() {
    if (modal.hidden || modal.dataset.closing) return;
    modal.dataset.closing = '1';
    document.body.classList.remove('search-open');
    AMOTransitions.leave(backdrop, () => {}, 'none');
    AMOTransitions.leave(panel, () => {
      if (modal.dataset.closing) { modal.hidden = true; delete modal.dataset.closing; }
    }, 'translateY(-6px) scale(.99)');
  }

  openBtns.forEach(btn => btn.addEventListener('click', openSearch));
  modal.querySelectorAll('[data-search-close]').forEach(btn => btn.addEventListener('click', closeSearch));
  input.addEventListener('input', () => render(input.value));
  results.addEventListener('click', e => {
    const a = e.target.closest('a.search-result');
    if (!a) return;
    const entry = entries.find(x => normalizeHref(x.href) === normalizeHref(a.href.split('#')[0]) || normalizeHref(x.href) === normalizeHref(a.href));
    if (entry) recordRecentTool(entry);
    // a section on the page we are already on: resolve it here (no navigation, maybe no hashchange)
    const u = new URL(a.href, location.href);
    if (u.pathname === location.pathname && u.hash) {
      e.preventDefault();
      closeSearch();
      if (/^#s-/.test(u.hash)) { history.pushState(null, '', u.hash); AMOSections.go(u.hash.slice(1)); }
      else location.hash = u.hash;   // chapters (#ch-…) and ids: AMOChapters / the browser handle it
    }
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
        const from = Array.from(panels).find(p => !p.hidden);
        const to = Array.from(panels).find(p => p.dataset.derivPanel === target);
        if (from === to) return;
        AMOTransitions.swap(from, to, () => {
          buttons.forEach(b => b.classList.toggle('active', b === btn));
          panels.forEach(p => p.hidden = p.dataset.derivPanel !== target);
        });
      });
    });
  });
}

function initShareableCalculatorParams() {
  const calculatorPath = /calculator|designer|recapture|fidelity-budget|lab-calculators|cooling-simulator/.test(location.pathname);
  if (!calculatorPath) return;
  const controls = Array.from(document.querySelectorAll('.ctrl-panel input[id], .ctrl-panel select[id], .calc-card input[id], .calc-card select[id], .calc-panel input[id], .calc-panel select[id], .sim-card input[id], .sim-card select[id]'))
    .filter(el => !['button', 'submit', 'reset'].includes(el.type))
    .filter(el => !['tempAddIn', 'trajSlider'].includes(el.id));
  if (!controls.length) return;

  const params = new URLSearchParams(location.search);
  // Apply <select> controls before <input> sliders so species-change handlers
  // (which reset default wavelength) do not overwrite explicit URL params.
  const ordered = [
    ...controls.filter(el => el.tagName === 'SELECT'),
    ...controls.filter(el => el.tagName !== 'SELECT'),
  ];
  let applied = false;
  ordered.forEach(el => {
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

function initCrossToolHandoff() {
  const key = currentPageKey();
  const val = id => document.getElementById(id)?.value;
  const SP_TO_RR = { Rb87: 'Rb', Cs133: 'Cs', Li6: 'Li', Na23: 'Na' };
  const RR_TO_SP = { Rb: 'Rb87', Cs: 'Cs133', Li: 'Li6', Na: 'Na23' };
  const IMG_SPECIES = new Set(['Rb87', 'Cs133', 'Li6', 'Li7', 'Na23', 'K39']);
  const buildQS = obj => {
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, v); });
    const s = p.toString();
    return s ? '?' + s : '';
  };

  const configs = {
    'tweezer-designer': {
      anchor: () => document.querySelector('#trap-calculator .twz-grid'),
      links: [
        {
          label: 'Send NA & species to Single-atom Imaging →',
          href: () => {
            const sp = val('sp-sel');
            return 'imaging-calculator.html' + buildQS({
              speciesSel: IMG_SPECIES.has(sp) ? sp : undefined,
              naSlide: val('na-s'),
            });
          },
        },
        {
          label: 'Send trap & waist to Release & Recapture →',
          href: () => {
            const sp = val('sp-sel');
            const w0 = parseFloat(document.getElementById('o-w0')?.textContent);
            return 'release-recapture.html' + buildQS({
              speciesSel: SP_TO_RR[sp],
              lambdaIn: val('wl-s'),
              powerIn: val('pw-s'),
              waistIn: Number.isFinite(w0) ? w0.toFixed(2) : undefined,
            });
          },
        },
      ],
    },
    'imaging-calculator': {
      anchor: () => document.querySelector('.ctrl-panel'),
      links: [
        {
          label: 'Send NA & species to Tweezer Designer →',
          href: () => {
            const sp = val('speciesSel');
            return 'tweezer-designer.html' + buildQS({
              'sp-sel': sp === 'K40' ? 'K39' : sp,
              'na-s': val('naSlide'),
            });
          },
        },
        {
          label: 'Send species to Release & Recapture →',
          href: () => 'release-recapture.html' + buildQS({ speciesSel: SP_TO_RR[val('speciesSel')] }),
        },
      ],
    },
    'release-recapture': {
      anchor: () => document.querySelector('.sim-card'),
      links: [
        {
          label: 'Send trap & wavelength to Tweezer Designer →',
          href: () => 'tweezer-designer.html' + buildQS({
            'sp-sel': RR_TO_SP[val('speciesSel')],
            'wl-s': val('lambdaIn'),
            'pw-s': val('powerIn'),
          }),
        },
        {
          label: 'Send species to Single-atom Imaging →',
          href: () => 'imaging-calculator.html' + buildQS({ speciesSel: RR_TO_SP[val('speciesSel')] }),
        },
      ],
    },
  };

  const cfg = configs[key];
  const anchor = cfg?.anchor();
  if (!cfg || !anchor || document.querySelector('.cross-tool-handoff')) return;

  const bar = document.createElement('div');
  bar.className = 'share-url-card cross-tool-handoff';
  bar.innerHTML = `
    <span>Carry these parameters to a connected tool:</span>
    <span style="display:flex;flex-wrap:wrap;gap:.5rem">
      ${cfg.links.map((l, idx) => `<a class="mini-action" href="${l.href()}" data-handoff-idx="${idx}">${l.label}</a>`).join('')}
    </span>
  `;
  anchor.after(bar);

  bar.addEventListener('click', e => {
    const a = e.target.closest('a[data-handoff-idx]');
    if (!a) return;
    const link = cfg.links[Number(a.dataset.handoffIdx)];
    if (link) a.href = link.href();
  });
}

function getPageContainer() {
  return document.querySelector('.page-content > .container')
    || document.querySelector('.page-content')
    || document.querySelector('main .container')
    || document.querySelector('main');
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
/* ─────────────────────────────────────────────────────
   STORY TRAIL — each nav group is one story told in steps (build a lab →
   run a first experiment → build a quantum computer → start a career).
   At the end of every step page: where it sits, every step linked, and the
   previous / next step; the last step of a story opens the next story.
   ───────────────────────────────────────────────────── */
const STORIES = [
  { name: 'Building a lab',               items: NAV.build },
  { name: 'Running a first experiment',   items: NAV.trapImageCool },
  { name: 'Building a quantum computer',  items: NAV.quantum },
  { name: 'Starting a career',            items: NAV.career },
];
function initStoryTrail() {
  if (!location.pathname.includes('/pages/')) return;
  const key = currentPageKey(), si = STORIES.findIndex(st => st.items.some(t => t.key === key));
  const container = getPageContainer();
  if (si < 0 || !container || document.querySelector('.build-trail')) return;
  const story = STORIES[si], list = story.items, i = list.findIndex(t => t.key === key);
  const href = t => t.href.replace(/^pages\//, '');
  const prev = list[i - 1], next = list[i + 1], cur = list[i], nextStory = STORIES[si + 1];
  const nav = document.createElement('nav');
  nav.className = 'build-trail';
  nav.setAttribute('aria-label', story.name + ', step by step');
  nav.style.setProperty('--bt-n', list.length);
  nav.innerHTML = `
    <div class="bt-head"><span class="bt-eyebrow">${story.name} · step ${cur.step} of ${list.length}</span><span class="bt-cur">${cur.label}</span></div>
    <ol class="bt-steps">${list.map((t, j) => `<li><a href="${href(t)}" class="${j < i ? 'done' : j === i ? 'here' : ''}" ${j === i ? 'aria-current="step"' : ''} title="${t.step}. ${t.label}"><span>${t.step}</span><em>${t.label}</em></a></li>`).join('')}</ol>
    <div class="bt-links">
      ${prev ? `<a class="bt-prev" href="${href(prev)}"><small>← Step ${prev.step}</small>${prev.label}</a>` : '<span></span>'}
      ${next ? `<a class="bt-next" href="${href(next)}"><small>Step ${next.step} →</small>${next.label}</a>`
        : nextStory ? `<a class="bt-next" href="${href(nextStory.items[0])}"><small>Next story: ${nextStory.name} →</small>${nextStory.items[0].label}</a>`
        : `<a class="bt-next" href="start-here.html"><small>The end →</small>Back to the site map</a>`}
    </div>`;
  container.appendChild(nav);
}

/* The author's own scholarly work. Pages built on one of these papers list it in
   CITE_RESEARCH so readers who use its results cite the paper, not only the page. */
const CITE_THESIS = {   // as listed by Google Scholar (Purdue University Graduate School, 2026)
  plain: 'Phatak, S. S. (2026). Cooling Lithium and Cesium Single Atoms in Optical Tweezers (Doctoral dissertation, Purdue University Graduate School). https://hammer.purdue.edu/articles/thesis/_b_Cooling_Lithium_and_Cesium_Single_Atoms_in_Optical_Tweezers_b_/32867018',
  bibtex: '@phdthesis{phatak2026cooling,\n  title  = {Cooling Lithium and Cesium Single Atoms in Optical Tweezers},\n  author = {Phatak, Saumitra Sudhir},\n  school = {Purdue University Graduate School},\n  year   = {2026},\n  url    = {https://hammer.purdue.edu/articles/thesis/_b_Cooling_Lithium_and_Cesium_Single_Atoms_in_Optical_Tweezers_b_/32867018}\n}',
};
const CITE_PAPERS = {
  'phatak2024cooling': {
    short: 'Phatak et al., Phys. Rev. A 110, 043116 (2024)',
    plain: 'Phatak, S. S., Blodgett, K. N., Peana, D., Chen, M. R., & Hood, J. D. (2024). A generalized theory for optical cooling of a trapped atom with spin. Physical Review A, 110, 043116. https://doi.org/10.1103/PhysRevA.110.043116',
    bibtex: '@article{phatak2024cooling,\n  author  = {Phatak, Saumitra S. and Blodgett, Karl N. and Peana, David and Chen, Meng Raymond and Hood, Jonathan D.},\n  title   = {A generalized theory for optical cooling of a trapped atom with spin},\n  journal = {Physical Review A},\n  volume  = {110},\n  pages   = {043116},\n  year    = {2024},\n  doi     = {10.1103/PhysRevA.110.043116}\n}',
  },
};
const CITE_RESEARCH = { 'laser-cooling': ['phatak2024cooling'], 'cooling-simulator': ['phatak2024cooling'] };

function initCiteThisPage() {
  if (!document.querySelector('.page-wrap')) return;
  const container = getPageContainer();
  if (!container || document.querySelector('.cite-panel')) return;

  const { url, title } = getPageMeta();
  const now = new Date();
  const year = now.getFullYear();
  const accessed = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const isoDate = now.toISOString().slice(0, 10);
  const key = currentPageKey();
  const slug = key.replace(/[^a-z0-9]/gi, '');

  const texts = {
    'page-plain': `Phatak, S. S. (${year}). ${title}. AMO Toolkit. Retrieved ${accessed}, from ${url}`,
    'page-bibtex': `@misc{phatak${year}${slug},\n  author       = {Phatak, Saumitra S.},\n  title        = {${title}},\n  year         = {${year}},\n  howpublished = {\\url{${url}}},\n  urldate      = {${isoDate}},\n  note         = {AMO Toolkit}\n}`,
    'thesis-plain': CITE_THESIS.plain,
    'thesis-bibtex': CITE_THESIS.bibtex,
  };
  const papers = (CITE_RESEARCH[key] || []).map(id => CITE_PAPERS[id]).filter(Boolean);
  papers.forEach((pp, i) => { texts[`paper${i}-plain`] = pp.plain; texts[`paper${i}-bibtex`] = pp.bibtex; });

  const block = (label, id, btn) => `
    <div class="cite-block">
      <div class="cite-block-label">${label}</div>
      <pre class="cite-pre">${escapeHtml(texts[id])}</pre>
      <button class="mini-action" type="button" data-copy-cite="${id}">${btn}</button>
    </div>`;
  const research = papers.length
    ? `<strong>Results from my doctoral research.</strong> This page is built on ${papers.map(pp => escapeHtml(pp.short)).join(' and ')}; if you use its results or derivations, please cite the paper (and the thesis where it helps).`
    : `<strong>Results from my doctoral research.</strong> For scientific results, derivations or material that originate in my PhD work, please also cite my thesis or the published paper.`;

  const panel = document.createElement('section');
  panel.className = 'cite-panel workflow-panel';
  panel.innerHTML = `
    <div class="workflow-panel-head compact">
      <div>
        <div class="eyebrow">Cite This Page</div>
        <h2>Reference this tool or guide</h2>
      </div>
    </div>
    <p class="cite-intro">If you use AMO Toolkit in your research, please consider citing the relevant page. If a formula, numerical result, figure, explanation or calculator from this page finds its way into your thesis, paper, presentation or lab notebook, the citations below are ready to copy.</p>
    <ul class="cite-which">
      <li><strong>This page,</strong> for its explanations, calculators, figures and worked numbers.</li>
      <li><strong>The original source,</strong> for any measured value or published result the page quotes; it is linked where it appears. Acknowledge the page too if it helped.</li>
      <li>${research}</li>
    </ul>
    <div class="cite-grid">
      ${block('This page · plain text', 'page-plain', 'Copy citation')}
      ${block('This page · BibTeX', 'page-bibtex', 'Copy BibTeX')}
    </div>
    <details class="cite-more"${papers.length ? ' open' : ''}>
      <summary>${papers.length ? 'The paper behind this page, and my thesis' : 'My thesis'}</summary>
      <div class="cite-grid">
        ${papers.map((pp, i) => block(escapeHtml(pp.short) + ' · plain text', `paper${i}-plain`, 'Copy citation') + block(escapeHtml(pp.short) + ' · BibTeX', `paper${i}-bibtex`, 'Copy BibTeX')).join('')}
        ${block('PhD thesis (Purdue, 2026) · plain text', 'thesis-plain', 'Copy citation')}
        ${block('PhD thesis (Purdue, 2026) · BibTeX', 'thesis-bibtex', 'Copy BibTeX')}
      </div>
    </details>
    <p class="cite-thanks">Thank you for acknowledging the work that goes into keeping these resources free.</p>
  `;
  container.appendChild(panel);

  panel.addEventListener('click', e => {
    const btn = e.target.closest('[data-copy-cite]');
    if (!btn) return;
    const text = texts[btn.dataset.copyCite];
    if (!text) return;
    const done = ok => {
      const original = btn.textContent;
      btn.textContent = ok ? 'Copied ✓' : 'Select and copy';
      setTimeout(() => { btn.textContent = original; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
    else done(false);
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
  const cards = document.querySelectorAll('.paper-card[data-tools]');
  if (!cards.length || document.querySelector('.paper-tool-bridge')) return;
  // Each card names its tools explicitly (data-tools="mot-designer,learn-quantum#qec");
  // labels come from the nav so the bridge uses the same story titles as the menus.
  const ANCHORS = {
    'learn-quantum#analog-sim': 'Simulate many-body physics with atoms',
    'learn-quantum#qec': 'Correct quantum errors',
  };
  cards.forEach(card => {
    const links = card.dataset.tools.split(',').map(k => k.trim()).filter(Boolean).map(k => {
      const [key, hash] = k.split('#');
      const item = navItemByKey(key);
      if (!item) return '';
      const label = ANCHORS[k] || item.label;
      return `<a href="../${item.href}${hash ? '#' + hash : ''}" title="${escapeHtml(item.tool)}">${escapeHtml(label)}</a>`;
    }).filter(Boolean);
    if (!links.length) return;
    const box = document.createElement('div');
    box.className = 'paper-tool-bridge';
    box.innerHTML = `<span>Try it in the toolkit:</span>${links.join('')}`;
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
    steps: card.dataset.steps
      ? card.dataset.steps.split(',').map(s => s.trim()).filter(Boolean)
      : Array.from(card.querySelectorAll('.path-step[href]')).map(a => a.getAttribute('href')),
  }));

  // Category order matches the site's own workflow grouping (Build →
  // Measure & Cool → Quantum → Career) so the radial layout reads the
  // same way the tool grid and footer already do.
  const categoryOrder = [
    ...NAV.build, ...NAV.trapImageCool, ...NAV.quantum, ...NAV.career,
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
  { id: 'magic-1', topic: 'Magic States', anchor: '#magic',
    q: 'Why does a fault-tolerant quantum computer need magic states (like |T⟩) in addition to Clifford gates?',
    options: ['Clifford gates cannot create entanglement', 'Clifford circuits alone are efficiently classically simulable (Gottesman-Knill theorem)', 'Magic states eliminate all SPAM errors', 'Clifford gates only work on trapped ions'], correct: 1,
    explain: 'By the Gottesman-Knill theorem, Clifford gates plus Pauli measurements are classically simulable; injecting a non-Clifford magic state (such as |T⟩) via gate teleportation unlocks universal quantum computation.' },
  { id: 'magic-2', topic: 'Magic States', anchor: '#magic',
    q: 'What is the purpose of magic-state distillation (or magic-state cultivation)?',
    options: ['To convert many noisy non-Clifford states into fewer higher-fidelity magic states', 'To cool neutral atoms to their motional ground state', 'To measure T₁ and T₂ simultaneously', 'To replace all two-qubit gates with single-qubit rotations'], correct: 0,
    explain: 'Because non-Clifford gates like T are not transversal in the 2D surface code, noisy magic states are purified via distillation or prepared with low error via cultivation before being injected into the circuit.' },
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
        <p style="margin-bottom:var(--sp-4)">${SESSION_SIZE} questions pulled from all 15 topics below, weighted toward whatever you've missed before. Progress is saved in this browser.</p>
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
  'automation': ['Automate the experiment', 'See how servos, feedforward, beam stabilisers, relock and calibration scripts, optimisers and AI agents keep an experiment running, and follow a workflow for optimising one stage.', 'The servo simulator and optimiser race use illustrative toy models; the paper results are as reported by their authors, and several are preprints.'],
  'control-systems': ['Control the experiment', 'Learn the signals (TTL, DAC, ADC, DDS, AWG), how hardware timing and delays work, how pulses are shaped, and how a shot is written in Python and shared with git.', 'Delay values in the shot diagram are illustrative; measure your own shutters, AOMs and coils.'],
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
  'virtual-lab': ['See the whole experimental cycle', 'Load, image, rearrange, verify, entangle and read out a tweezer array, then run a thousand shots to see which step spoils them.', 'Loss rates and timing are illustrative defaults; set them from your own apparatus.'],
  'decoherence-lab': ['Tell T1, T2*, and T2 apart', 'Watch live Bloch-sphere and detector-signal simulations of dissipation, dephasing, and combined decoherence, run from the actual optical Bloch equations.', 'Use the measurement-protocol table to match what you fit in lab (Rabi decay, Ramsey, echo) to the mechanism it isolates.'],
  'learn-quantum': ['Learn neutral-atom QC language', 'Move topic by topic through qubits, gates, measurement, Rydberg blockade, error correction, and algorithms.', 'Use this as conceptual scaffolding before opening hardware-specific calculators.'],
  'rydberg-calculator': ['Estimate blockade scales', 'Adjust n, Rabi frequency, spacing, and species to compare lifetime, C6, blockade radius, and gate scales.', 'Near Förster resonances, treat simple scaling laws as estimates.'],
  'fidelity-budget': ['Build gate-error intuition', 'Vary independent error channels to see which terms limit a Rydberg two-qubit gate.', 'Coherent errors can combine nonlinearly; this is a budget, not a full master-equation solver.'],
  'rb-explorer': ['Interpret benchmarking data', 'Connect decay curves, SPAM offsets, Clifford twirling, and interleaved RB to gate fidelity.', 'Do not overinterpret RB as a full diagnosis of coherent or leakage errors.'],
  'dd-playground': ['Explore coherence protection', 'Compare CPMG, XY-style sequences, and filter functions against noise spectra.', 'Pulse errors and finite Rabi frequency matter in real experiments.'],
  'remote-entanglement': ['Map networking tradeoffs', 'Follow photon collection, Bell-state measurement, loss, and rate bottlenecks for remote links.', 'Use rates as order-of-magnitude design estimates.'],
  'atom-processor': ['See a circuit run on moving atoms', 'Compile GHZ, Grover, Bernstein–Vazirani or random circuits onto storage, entangling and readout zones, compare qubit placements, and sample noisy shots.', 'Geometry is schematic and only one AOD row is modelled; treat times and fidelities as relative comparisons.'],
  'amo-groups': ['Find research fits', 'Filter groups by research area, atom, region and technique, and keep a list you can export or share.', 'Use this as a discovery map; verify current openings and project direction on group pages.'],
  'paper-syllabus': ['Read with purpose', 'Pick a reading track, tick papers off as you go, and follow each paper\'s toolkit links to put its physics to work.', 'Prefer primary papers for claims and reviews for orientation.'],
  'qc-landscape': ['Translate AMO skills to industry', 'Compare hardware platforms, company claims, job roles, and roadmap maturity.', 'Separate demonstrated hardware from roadmap language.'],
  'rb87-vs-yb171': ['Compare qubit species', 'Use side-by-side evidence for Rb and Yb choices across cooling, gates, imaging, clocks, and scaling.', 'Check whether a benchmark is Rb, Yb, Cs, or architecture-level before reusing it.'],
  'quantinuum-vs-ionq': ['Compare trapped-ion companies', 'Use side-by-side evidence for Quantinuum and IonQ across architecture, fidelity, logical qubits, and roadmaps.', 'Separate peer-reviewed, full-system numbers from preprint, component-level, or company-roadmap claims.'],
  'google-vs-ibm': ['Compare superconducting-qubit companies', 'Use side-by-side evidence for Google and IBM across architecture, fidelity, advantage claims, and fault-tolerance roadmaps.', 'Both companies\' headline advantage/utility claims were later challenged by classical-simulation papers; read both sides.'],
  'psiquantum-vs-xanadu': ['Compare photonic quantum computing companies', 'Use side-by-side evidence for PsiQuantum and Xanadu across architecture, component fidelity, demonstrated systems, and business.', 'PsiQuantum\'s public results are component-level; Xanadu has run and published full, peer-reviewed systems.'],
};

const RELATED_TOOLS = {
  'atom-library': ['laser-planner', 'mot-designer', 'lab-calculators'],
  'laser-planner': ['atom-library', 'laser-locking', 'lab-techniques'],
  'mot-designer': ['atom-library', 'tof-calculator', 'cooling-simulator'],
  'automation': ['control-systems', 'laser-locking', 'lab-techniques'],
  'control-systems': ['laser-locking', 'tweezer-designer', 'virtual-lab'],
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
  'virtual-lab': ['tweezer-designer', 'imaging-calculator', 'atom-processor'],
  'decoherence-lab': ['learn-quantum', 'dd-playground', 'fidelity-budget'],
  'learn-quantum': ['decoherence-lab', 'rydberg-calculator', 'fidelity-budget'],
  'rydberg-calculator': ['fidelity-budget', 'rb87-vs-yb171', 'learn-quantum'],
  'fidelity-budget': ['decoherence-lab', 'rydberg-calculator', 'rb-explorer'],
  'rb-explorer': ['fidelity-budget', 'dd-playground', 'learn-quantum'],
  'dd-playground': ['decoherence-lab', 'rb-explorer', 'learn-quantum'],
  'remote-entanglement': ['cavity-qed', 'fidelity-budget', 'qc-landscape'],
  'atom-processor': ['virtual-lab', 'fidelity-budget', 'learn-quantum'],
  'amo-groups': ['paper-syllabus', 'qc-landscape', 'rb87-vs-yb171'],
  'paper-syllabus': ['amo-groups', 'learn-quantum', 'laser-cooling'],
  'qc-landscape': ['amo-groups', 'fidelity-budget', 'rb87-vs-yb171'],
  'rb87-vs-yb171': ['atom-library', 'rydberg-calculator', 'qc-landscape'],
  'quantinuum-vs-ionq': ['qc-landscape', 'rb87-vs-yb171', 'fidelity-budget'],
  'google-vs-ibm': ['qc-landscape', 'quantinuum-vs-ionq', 'fidelity-budget'],
  'psiquantum-vs-xanadu': ['qc-landscape', 'google-vs-ibm', 'quantinuum-vs-ionq'],
};



function navItemByKey(key) {
  return [...NAV.tools, ...NAV.learn].find(item => item.key === key);
}

// Week of the course on pages/teach.html that uses each page (its problems sit at teach.html#ps-<key>).
const COURSE_WEEK = {
  'learn-quantum': 1,
  'atom-library': 1,
  'laser-planner': 2,
  'polarimetry': 2,
  'laser-locking': 3,
  'vacuum-systems': 4,
  'lab-techniques': 4,
  'lab-calculators': 4,
  'cooling-simulator': 5,
  'mot-designer': 5,
  'absorption-imaging': 6,
  'tof-calculator': 6,
  'control-systems': 7,
  'tweezer-designer': 8,
  'zernike': 8,
  'imaging-calculator': 9,
  'release-recapture': 9,
  'laser-cooling': 10,
  'virtual-lab': 10,
  'decoherence-lab': 11,
  'dd-playground': 11,
  'rydberg-calculator': 12,
  'fidelity-budget': 12,
  'rb-explorer': 13,
  'atom-processor': 13,
  'automation': 13,
  'cavity-qed': 14,
  'remote-entanglement': 14,
  'paper-syllabus': 14,
};

// Pages with a Python notebook in notebooks/<key>.ipynb that reproduces their calculator (built and checked by notebooks/_build).
const NOTEBOOKS = new Set([
  'absorption-imaging',
  'automation',
  'cavity-qed',
  'control-systems',
  'cooling-simulator',
  'dd-playground',
  'fidelity-budget',
  'imaging-calculator',
  'lab-calculators',
  'laser-cooling',
  'laser-locking',
  'mot-designer',
  'rb-explorer',
  'release-recapture',
  'remote-entanglement',
  'rydberg-calculator',
  'tof-calculator',
  'tweezer-designer',
  'vacuum-systems',
]);
const COLAB_BASE = 'https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/';

function initPagePlaybookPanel() {
  if (!location.pathname.includes('/pages/')) return;
  const key = currentPageKey();
  const play = PAGE_PLAYBOOKS[key];
  const container = getPageContainer();
  if (!play || !container || document.querySelector('.page-playbook-panel')) return;
  // A slim two-line note, not a card: it used to be a large panel that sat
  // between the hero and the page's real content and pushed it down.
  const panel = document.createElement('aside');
  panel.className = 'page-playbook-panel';
  panel.setAttribute('aria-label', 'How to use this page');
  panel.innerHTML = `
    <p class="pp-lead">${play[0]}</p>
    <p><span class="pp-k">Use it for</span>${play[1]}</p>
    <p><span class="pp-k">Read with care</span>${play[2]}</p>
    ${COURSE_WEEK[key] ? `<p><span class="pp-k">Teach with it</span><a href="teach.html#ps-${key}">Problems for this page, week ${COURSE_WEEK[key]} of the course →</a></p>` : ''}
    ${NOTEBOOKS.has(key) ? `<p><span class="pp-k">In Python</span><a href="${COLAB_BASE}${key}.ipynb" target="_blank" rel="noopener">Open the notebook in Colab</a> · <a href="../notebooks/${key}.ipynb" download>download .ipynb</a></p>` : ''}
  `;
  // pages whose hero sits inside the content container keep the hero first
  const hero = container.querySelector(':scope > .page-hero');
  if (hero) hero.after(panel); else container.prepend(panel);
}



function initRelatedToolsPanel() {
  if (!location.pathname.includes('/pages/')) return;
  const key = currentPageKey();
  const related = RELATED_TOOLS[key];
  const container = getPageContainer();
  if (!related?.length || !container || document.querySelector('.see-also')) return;
  const root = location.pathname.includes('/pages/') ? '' : 'pages/';
  const cards = related.map(k => navItemByKey(k)).filter(Boolean).map(item => `
    <a class="see-also-card" href="${root}${item.href.replace(/^pages\//, '')}">
      <span class="see-also-icon">${item.icon || '•'}</span>
      <div>
        <div class="see-also-name">${item.label}</div>
        <div class="see-also-desc">${item.tool || item.kind || 'AMO Toolkit page'}</div>
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

/* ─────────────────────────────────────────────────────
   CHAPTER NAVIGATION — pages whose main content lives in tabs
   (lab-techniques, lab-calculators, laser-locking, cooling-simulator,
   zernike, paper-syllabus, polarimetry). Opt-in: `data-chapters` on the
   page's main .tab-bar (or .pol-tab-nav with data-chapter-panels=".pol-section").

   A thin tab row below a long intro read as a divider, and once a reader
   was inside a 4000–7000 px panel nothing said other chapters existed.
   So each chapter page gets:
     • a sticky chapter bar (under the site nav) with "n / N";
     • "Previous / Next chapter" at the end of every chapter;
     • the page's own index cards (route-cards etc. marked data-chapter="n")
       become real links that open chapter n, and highlight the open one;
       pages without such cards get a compact "N chapters" strip up top;
     • deep links: #ch-<title> opens a chapter, and any #id inside a
       hidden chapter opens that chapter first (also for in-page links).
   Tab switching itself stays with each page's own handler (btn.click()).
   ───────────────────────────────────────────────────── */
const AMOChapters = (() => {
  const NAV_H = 64;
  const models = [];
  const cleanTitle = s => s.replace(/\s+/g, ' ').trim()
    .replace(/^[^\p{L}\p{N}]+/u, '')                       // leading emoji / symbols
    .replace(/^(\d{1,2}\s*[.·:)]\s*|[①-⑳]\s*)/u, '')  // "01 · ", "1. ", "①"
    .trim();
  const slug = s => 'ch-' + cleanTitle(s).toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function cur(m) { return m.btns.findIndex(b => b.classList.contains('active')); }
  function stuck(m) { return m.sentinel.getBoundingClientRect().top < NAV_H + 1; }
  function scrollToStart(m, instant) {
    const top = Math.round(m.sentinel.getBoundingClientRect().top + window.scrollY - NAV_H);
    if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: motionOK() && !instant ? 'smooth' : 'auto' });
  }
  function setHash(m) {
    const h = '#' + m.slugs[cur(m)];
    if (location.hash === h || !history.replaceState) return;
    if (!location.hash || /^#ch-/.test(location.hash)) history.replaceState(null, '', h);
  }
  function update(m, withHash) {
    const i = cur(m), n = m.btns.length;
    m.count.innerHTML = `<b>${i + 1}</b> / ${n}`;
    m.links.forEach(l => {
      const on = +l.dataset.chapter - 1 === i;
      l.classList.toggle('is-current', on);
      const hint = l.querySelector('.chapter-open');
      if (hint) hint.textContent = on ? 'Open now ↓' : 'Open chapter →';
    });
    if (m.strip) m.strip.querySelectorAll('.chapter-chip').forEach((c, k) => c.classList.toggle('is-current', k === i));
    if (withHash) setHash(m);
  }
  function activate(m, i, opts = {}) {
    if (i < 0 || i >= m.btns.length) return;
    if (cur(m) !== i) m.btns[i].click();
    update(m, opts.hash !== false);
    if (opts.scroll) requestAnimationFrame(() => scrollToStart(m));
  }

  function pager(m, i) {
    const n = m.btns.length, pc = m.pageColor;
    const nav = document.createElement('nav');
    nav.className = 'chapter-pager';
    nav.setAttribute('aria-label', 'Chapter navigation');
    if (pc) nav.style.setProperty('--page-color', pc);
    const btn = (cls, dir, title, to) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = cls;
      b.innerHTML = `<span class="cp-dir">${dir}</span><span class="cp-title"></span>`;
      b.querySelector('.cp-title').textContent = title;
      b.addEventListener('click', () => activate(m, to, { scroll: true }));
      return b;
    };
    if (i > 0) nav.appendChild(btn('cp-prev', '← Previous chapter', m.titles[i - 1], i - 1));
    const c = document.createElement('span');
    c.className = 'cp-count';
    c.textContent = i === n - 1 ? `Chapter ${n} of ${n} · the last one` : `Chapter ${i + 1} of ${n}`;
    nav.appendChild(c);
    if (i < n - 1) nav.appendChild(btn('cp-next', 'Next chapter →', m.titles[i + 1], i + 1));
    else nav.appendChild(btn('cp-next', 'Back to the first chapter ↺', m.titles[0], 0));
    return nav;
  }

  function build(bar) {
    if (bar.__chapters) return;
    const btns = Array.from(bar.querySelectorAll('.tab-btn, .pol-tab-btn'));
    let panels;
    if (bar.dataset.chapterPanels) {
      panels = Array.from(document.querySelectorAll(bar.dataset.chapterPanels));
    } else {
      const group = bar.dataset.group, wrap = bar.closest('[data-tabs-wrap]') || document;
      const all = Array.from(wrap.querySelectorAll('.tab-panel[data-tab]'))
        .filter(p => !(p.dataset.group && group && p.dataset.group !== group));
      panels = btns.map(b => all.find(p => p.dataset.tab === b.dataset.tab));
    }
    if (btns.length < 2 || panels.length !== btns.length || panels.some(p => !p)) return;

    const m = {
      bar, btns, panels, links: [], strip: null,
      titles: btns.map(b => cleanTitle(b.textContent)),
      slugs: btns.map(b => slug(b.textContent)),
      pageColor: getComputedStyle(bar).getPropertyValue('--page-color').trim(),
    };
    bar.__chapters = m;
    models.push(m);

    // sticky bar: sentinel (to know when it is stuck) + wrapper with the n / N counter
    m.sentinel = document.createElement('div');
    m.sentinel.className = 'chapter-sentinel';
    m.sentinel.setAttribute('aria-hidden', 'true');
    m.nav = document.createElement('div');
    m.nav.className = 'chapter-nav';
    if (m.pageColor) m.nav.style.setProperty('--page-color', m.pageColor);
    m.count = document.createElement('span');
    m.count.className = 'chapter-count';
    m.count.setAttribute('aria-hidden', 'true');
    bar.before(m.sentinel);
    bar.before(m.nav);
    m.nav.append(m.count, bar);
    if (bar.__ink) bar.__ink.place(false);

    const fades = () => {
      const over = bar.scrollWidth > bar.clientWidth + 2;
      m.nav.classList.toggle('fade-l', over && bar.scrollLeft > 2);
      m.nav.classList.toggle('fade-r', over && bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2);
    };
    bar.addEventListener('scroll', fades, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(fades).observe(bar);
    fades();

    if (window.IntersectionObserver) {
      new IntersectionObserver(([e]) => {
        m.nav.classList.toggle('is-stuck', !e.isIntersecting && e.boundingClientRect.top < NAV_H + 1);
      }, { rootMargin: `-${NAV_H + 1}px 0px 0px 0px` }).observe(m.sentinel);
    }

    panels.forEach((p, i) => { p.setAttribute('data-chapter-panel', ''); p.appendChild(pager(m, i)); });

    btns.forEach(b => {
      b.addEventListener('pointerdown', () => { m.wasStuck = stuck(m); });
      b.addEventListener('click', e => {
        const was = m.wasStuck !== undefined ? m.wasStuck : stuck(m);
        m.wasStuck = undefined;
        requestAnimationFrame(() => {
          update(m, true);
          // a reader deep inside a long chapter lands at the start of the new one
          if (e.isTrusted && was) scrollToStart(m);
        });
      });
    });
    update(m, false);
  }

  function linkCards() {
    const m = models[0];
    if (!m) return;
    document.querySelectorAll('[data-chapter]').forEach(el => {
      const i = +el.dataset.chapter - 1;
      if (!(i >= 0 && i < m.btns.length) || el.__chapterLink) return;
      el.__chapterLink = true;
      el.classList.add('chapter-link');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `Open chapter ${i + 1}: ${m.titles[i]}`);
      if (m.pageColor) el.style.setProperty('--page-color', m.pageColor);
      if (!el.closest('[data-chapter-hint="off"]')) {
        const hint = document.createElement('span');
        hint.className = 'chapter-open';
        hint.setAttribute('aria-hidden', 'true');
        const para = el.querySelector('p');
        (para ? para.parentElement : el).appendChild(hint);
      }
      const go = () => activate(m, i, { scroll: true });
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      m.links.push(el);
    });
    document.querySelectorAll('[data-chapter-index]').forEach(box => {
      if (box.querySelector('.chapter-index-note')) return;
      const note = document.createElement('p');
      note.className = 'chapter-index-note';
      note.textContent = `${m.btns.length} chapters on this page. Open one from a card, or from the chapter bar below, which stays pinned while you read.`;
      box.appendChild(note);
    });
    // no index cards on the page: a compact strip near the top says what is inside
    if (!m.links.length) {
      const strip = document.createElement('nav');
      strip.className = 'chapter-strip';
      strip.setAttribute('aria-label', 'Chapters on this page');
      if (m.pageColor) strip.style.setProperty('--page-color', m.pageColor);
      strip.innerHTML = `<span class="chapter-strip-label">${m.btns.length} chapters on this page</span>`;
      m.titles.forEach((t, i) => {
        const c = document.createElement('button');
        c.type = 'button'; c.className = 'chapter-chip';
        c.innerHTML = `<span class="n">${i + 1}</span>`;
        c.appendChild(document.createTextNode(t));
        c.addEventListener('click', () => activate(m, i, { scroll: true }));
        strip.appendChild(c);
      });
      const after = document.querySelector('.page-playbook-panel');
      const container = getPageContainer();
      if (after) after.after(strip);
      else if (container) container.prepend(strip);
      m.strip = strip;
    }
    update(m, false);
  }

  // Open the chapter that contains el (if it is hidden in one). Returns true if it switched.
  function reveal(el) {
    for (const m of models) {
      const i = m.panels.findIndex(p => p.contains(el));
      if (i >= 0 && cur(m) !== i) { activate(m, i, { hash: false }); return true; }
    }
    return false;
  }
  // extra top offset for an element inside a chapter (the pinned chapter bar)
  function offsetFor(el) {
    const m = models.find(mm => mm.panels.some(p => p.contains(el)));
    return m ? m.nav.getBoundingClientRect().height : 0;
  }
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    for (const m of models) {
      const i = m.slugs.indexOf(h);
      if (i >= 0) { activate(m, i, { hash: false }); requestAnimationFrame(() => scrollToStart(m, true)); return; }
    }
    const el = document.getElementById(h);
    if (el && reveal(el)) {
      requestAnimationFrame(() => {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_H - offsetFor(el) - 12;
        window.scrollTo({ top, behavior: 'auto' });
      });
    }
  }

  function init() {
    document.querySelectorAll('[data-chapters]').forEach(build);
    if (!models.length) return;
    linkCards();
    if (document.readyState === 'complete') fromHash();
    else window.addEventListener('load', fromHash, { once: true });
    window.addEventListener('hashchange', fromHash);
  }

  return { init, reveal, offsetFor, activate: (i, opts) => models[0] && activate(models[0], i, opts),
           models: () => models.map(m => ({ panels: m.panels.slice(), titles: m.titles.slice(), slugs: m.slugs.slice() })) };
})();
window.AMOChapters = AMOChapters;

window.AMOCareer = {
  exportTableCSV,
  exportCanvasPNG,
  exportCanvasSVG,
  downloadText,
  recordRecentTool,
};

/* ─────────────────────────────────────────────────────
   SECTION ANCHORS for search: #s-<slug>
   Every section heading gets a stable address made from its own text, so the
   search index needs no ids in the HTML. collect() lists the headings (used
   by tests/browser/build-section-index.js to write js/search-sections.js);
   go(slug) finds the heading, opens the chapter / tab / accordion holding it
   and scrolls to it. Maths is dropped from the text (KaTeX may or may not
   have run), so the slug is the same on every load.
   ───────────────────────────────────────────────────── */
const AMOSections = (() => {
  const SEL = 'h2, h3, .section-title, .sec-title, .tech-section-title, .rb-section-title, .pol-h2, .accordion-header';
  const SKIP = 'nav, footer, .global-search, .see-also, .related-tools, .print-only, [aria-hidden="true"], .hero, .page-hero, .cite-panel, .feedback-panel';
  const GENERIC = /^(sources|references|further reading|see also)$/i;
  const textOf = el => {
    const c = el.cloneNode(true);
    c.querySelectorAll('.katex, svg, .accent, .accordion-chevron, script, style, .tip-bubble').forEach(n => n.remove());
    return c.textContent.replace(/\$[^$]*\$/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/^[^\p{L}\p{N}(]+/u, '').replace(/^(?:§\s*)?\d{1,2}[.:)]?\s+(?=\S)/, '').trim();
  };
  const slugOf = t => 's-' + t.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64).replace(/-+$/, '');
  function list() {
    const main = document.getElementById('main-content') || document.body, seen = new Map(), out = [];
    main.querySelectorAll(SEL).forEach(el => {
      if (el.closest(SKIP) || el.parentElement.closest(SEL)) return;
      const t = textOf(el);
      if (t.length < 3 || t.length > 120 || GENERIC.test(t)) return;
      let s = slugOf(t);
      if (s.length < 4) return;
      const n = (seen.get(s) || 0) + 1; seen.set(s, n);
      if (n > 1) s += '-' + n;
      out.push({ el, t, s });
    });
    return out;
  }
  function chapterOf(el) {
    const models = window.AMOChapters && AMOChapters.models ? AMOChapters.models() : [];
    for (const m of models) { const i = m.panels.findIndex(p => p.contains(el)); if (i >= 0) return m.titles[i]; }
    return '';
  }
  // headings, plus each chapter itself (its #ch-… address is handled by AMOChapters)
  function collect() {
    const models = window.AMOChapters && AMOChapters.models ? AMOChapters.models() : [];
    const chapters = [];
    models.forEach(m => m.titles.forEach((t, i) => chapters.push({ t, s: m.slugs[i], c: 'Chapter ' + (i + 1) + ' of ' + m.titles.length })));
    return chapters.concat(list().map(({ el, t, s }) => ({ t, s, c: chapterOf(el) })));
  }
  function go(slug) {
    let el = document.getElementById(slug);
    if (!el) {
      const hit = list().find(x => x.s === slug);
      if (!hit) return false;
      el = hit.el;
      if (!el.id) el.id = slug;
    }
    if (window.AMOChapters) AMOChapters.reveal(el);
    // plain tab bars (not chapters): click the tab that owns the panel
    const tp = el.closest('.tab-panel[data-tab]');
    if (tp && !tp.classList.contains('active')) {
      const wrap = tp.closest('[data-tabs-wrap]') || document;
      const btn = Array.from(wrap.querySelectorAll('.tab-btn[data-tab]')).find(b => b.dataset.tab === tp.dataset.tab &&
        (!tp.dataset.group || !b.closest('.tab-bar') || b.closest('.tab-bar').dataset.group === tp.dataset.group));
      if (btn) btn.click();
    }
    // a closed accordion: open it (its header is the target, or holds it)
    const acc = el.matches('.accordion-header') ? el : null;
    if (acc && acc.getAttribute('aria-expanded') === 'false') acc.click();
    const parentAcc = el.closest('.accordion');
    if (!acc && parentAcc) { const h = parentAcc.querySelector('.accordion-header[aria-expanded="false"]'); if (h) h.click(); }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const offset = 80 + (window.AMOChapters ? AMOChapters.offsetFor(el) : 0);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset - 8, behavior: 'auto' });
      el.classList.add('section-flash');
      setTimeout(() => el.classList.remove('section-flash'), 1600);
    }));
    return true;
  }
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (/^s-/.test(h)) go(h);
  }
  function init() {
    if (document.readyState === 'complete') setTimeout(fromHash, 0);
    else window.addEventListener('load', () => setTimeout(fromHash, 0), { once: true });
    window.addEventListener('hashchange', fromHash);
  }
  return { init, collect, go, slugOf };
})();
window.AMOSections = AMOSections;

/* ─────────────────────────────────────────────────────
   LIVE FIGURES — every .amo-eyebrow ("Interactive") marks a live figure.
   A page with any gets a "Live on this page" chip strip in its hero and a
   floating jump menu once the hero has scrolled away, so the animations
   are hard to miss. Jumps go through AMOSections.go(), which opens the
   chapter / tab / accordion holding the figure first.
   ───────────────────────────────────────────────────── */
function initLiveFigures() {
  const main = document.getElementById('main-content');
  if (!main || document.querySelector('.live-fab')) return;
  const H = 'h2, h3, h4, h5';
  const titleOf = h => {
    const c = h.cloneNode(true);
    c.querySelectorAll('.katex, svg, .accent, script, style').forEach(n => n.remove());
    return c.textContent.replace(/\$[^$]*\$/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(?:§\s*)?\d{1,2}[.:)]?\s+(?=\S)/, '');
  };
  const figs = [], used = new Set();
  main.querySelectorAll('.amo-eyebrow').forEach(eb => {
    if (eb.closest('.page-hero, .see-also, nav, footer')) return;
    let h = eb.nextElementSibling && eb.nextElementSibling.matches(H) ? eb.nextElementSibling : null;
    for (let p = eb.previousElementSibling, i = 0; !h && p && i < 3; p = p.previousElementSibling, i++) if (p.matches(H)) h = p;
    for (let p = eb.nextElementSibling, i = 0; !h && p && i < 4; p = p.nextElementSibling, i++) h = p.matches(H) ? p : p.querySelector(H);
    if (!h) return;
    const t = titleOf(h);
    if (t.length < 3) return;
    let id = eb.id;
    if (!id) {
      const base = 'live-' + t.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '');
      id = base; for (let n = 2; used.has(id) || document.getElementById(id); n++) id = base + '-' + n;
      eb.id = id;
    }
    used.add(id); figs.push({ id, t });
  });
  if (!figs.length) return;
  const go = (e, id) => {
    e.preventDefault();
    if (history.pushState) history.pushState(null, '', '#' + id);
    if (!AMOSections.go(id)) { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: 'start' }); }
  };
  // hero chip strip
  const host = document.querySelector('.page-hero .page-hero-text') || document.querySelector('.page-hero .container');
  let strip = null;
  if (host) {
    strip = document.createElement('nav');
    strip.className = 'live-strip'; strip.setAttribute('aria-label', 'Live figures on this page');
    strip.innerHTML = `<span class="live-strip-label"><span class="live-dot" aria-hidden="true"></span>Live on this page</span>` +
      figs.map(f => `<a class="live-chip" href="#${f.id}">${escapeHtml(f.t)}</a>`).join('');
    host.appendChild(strip);
    strip.querySelectorAll('a').forEach((a, i) => a.addEventListener('click', e => go(e, figs[i].id)));
  }
  // floating jump menu
  const fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'live-fab'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'live-menu');
  fab.innerHTML = `<span class="live-dot" aria-hidden="true"></span>${figs.length} live figure${figs.length > 1 ? 's' : ''}`;
  const menu = document.createElement('div');
  menu.className = 'live-menu'; menu.id = 'live-menu'; menu.hidden = true;
  menu.innerHTML = `<h6>Jump to a live figure</h6>` + figs.map((f, i) => `<a href="#${f.id}"><span>${String(i + 1).padStart(2, '0')}</span>${escapeHtml(f.t)}</a>`).join('');
  document.body.append(menu, fab);
  const close = () => { menu.hidden = true; fab.setAttribute('aria-expanded', 'false'); };
  fab.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; fab.setAttribute('aria-expanded', String(open)); if (open) menu.querySelector('a').focus(); });
  menu.querySelectorAll('a').forEach((a, i) => a.addEventListener('click', e => { close(); go(e, figs[i].id); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { close(); fab.focus(); } });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && !fab.contains(e.target)) close(); });
  // show the button only once the hero strip is off screen
  fab.dataset.hidden = 'true';
  if (strip && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => { const vis = es[0].isIntersecting; fab.dataset.hidden = String(vis); if (vis) close(); }).observe(strip);
  } else {
    const upd = () => { fab.dataset.hidden = String(window.scrollY < 400); };
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }
}

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
  initPagePlaybookPanel();
  AMOChapters.init();
  AMOSections.init();
  initRelatedToolsPanel();
  initShareableCalculatorParams();
  initCrossToolHandoff();
  initPaperToolBridge();
  initExportButtons();
  initCopyOnClick();
  initStoryTrail();
  initCiteThisPage();
  initErrorReportWidget();
  initPathConceptMap();
  initQuantumQuiz();
  initLiveFigures();
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
   SYMBOL TOOLTIPS (.tip[data-tip]) — keep the bubble on screen.
   It is centred over the symbol by default; near either edge of the
   viewport it is anchored to that side instead (CSS in styles.css).
   ───────────────────────────────────────────────────────── */
function alignTip(e) {
  const t = e.target && e.target.closest && e.target.closest('.tip');
  if (!t) return;
  // first line box: an anchor that wraps onto two lines has a much wider bounding box
  const r = (t.getClientRects && t.getClientRects()[0]) || t.getBoundingClientRect();
  const half = Math.min(240, window.innerWidth * 0.72) / 2 + 8;
  const c = r.left + r.width / 2;
  if (c + half > document.documentElement.clientWidth) t.dataset.tipAlign = 'end';
  else if (c - half < 0) t.dataset.tipAlign = 'start';
  else delete t.dataset.tipAlign;
}
document.addEventListener('pointerover', alignTip);
document.addEventListener('focusin', alignTip);

/* Keyboard, touch and screen readers (WCAG 1.4.13 / 2.1.1):
   • every .tip[data-tip] is focusable, and its text is its accessible description;
   • a tap or click pins the bubble open (tap again, tap elsewhere or Esc closes it);
   • Esc also hides the bubble of a focused tip until focus moves on. */
(function initTipAccess() {
  let seq = 0;
  function setup() {
    const tips = document.querySelectorAll('.tip[data-tip]:not([data-tip-ready])');
    if (!tips.length) return;
    let box = document.getElementById('amo-tip-descs');
    if (!box) { box = document.createElement('div'); box.id = 'amo-tip-descs'; box.hidden = true; document.body.appendChild(box); }
    tips.forEach(t => {
      t.dataset.tipReady = '1';
      if (!t.hasAttribute('tabindex')) t.tabIndex = 0;
      const d = document.createElement('span');
      d.id = 'amo-tip-' + (++seq);
      d.textContent = t.dataset.tip;
      box.appendChild(d);
      t.setAttribute('aria-describedby', ((t.getAttribute('aria-describedby') || '') + ' ' + d.id).trim());
    });
  }
  const closeAll = except => document.querySelectorAll('.tip.tip-open').forEach(t => { if (t !== except) t.classList.remove('tip-open'); });
  document.addEventListener('click', e => {
    const t = e.target && e.target.closest && e.target.closest('.tip[data-tip]');
    if (!t) {
      // a tip inside a <label>: the label then "clicks" its input; don't let that close the tip
      const open = document.querySelector('.tip.tip-open');
      if (open && e.target.labels && Array.prototype.some.call(e.target.labels, l => l.contains(open))) return;
    }
    closeAll(t);
    if (!t) return;
    alignTip({ target: t });
    t.classList.remove('tip-dismissed');
    t.classList.toggle('tip-open');
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeAll(null);
    const a = document.activeElement;
    if (a && a.matches && a.matches('.tip[data-tip]')) a.classList.add('tip-dismissed');
  });
  document.addEventListener('focusout', e => {
    const t = e.target;
    if (!t || !t.classList || !t.classList.contains('tip')) return;
    t.classList.remove('tip-dismissed');
    // tapping a tip inside a <label> moves focus to the label's input: keep the tip open then
    const lab = t.closest('label');
    if (!(lab && e.relatedTarget && lab.control === e.relatedTarget)) t.classList.remove('tip-open');
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();

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
      // Prices like "$1B … $7B" must not pair up into inline math:
      // .money wraps one amount; .no-math marks widgets built from page text.
      ignoredClasses: ['no-math', 'money'],
      throwOnError: false,
    });
  }
});

/* ─────────────────────────────────────────────────────────
   CASE-SAFE SYMBOLS IN UPPERCASE LABELS
   Labels, table headers and h5s use `text-transform: uppercase`, which
   turns physics symbols into different symbols: γ/2π → Γ/2Π (a different
   rate), σ → Σ, mW → MW (megawatt), ms → MS, μK → ΜK, k_B → K_B,
   Cs-133 → CS-133. After KaTeX has run, this wraps the symbol-like tokens
   inside uppercase text in <span class="case-keep"> (text-transform:none),
   so the label keeps its style and the physics keeps its meaning.
   What counts as a symbol (whole token kept):
     • tokens with a Greek lowercase letter, sub/superscript, _ or ^,
       ⟨⟩ or /2π, unless the part before _/^ holds an ordinary word
       ("β-factor" keeps only β; "photons²" is left alone);
     • SI units with a prefix (nm, mW, kHz, μK, mbar, m/s, …);
     • single-letter variables (t, n, r, "F(v)") and element symbols
       or AMO molecules (Rb, Cs-133, ¹⁷¹Yb, KRb).
   Otherwise only the Greek letters themselves are kept. Add class
   `no-case-keep` to opt a block out. New or changed text (calculator
   outputs, tab panels) is handled by a MutationObserver.
   ───────────────────────────────────────────────────────── */
(function () {
  const GREEK = 'α-ωϑϕϖϰϱϵµ';
  const SUPSUB = '²³¹⁰-ₜᴬ-ᵪ';
  const MARK = new RegExp('[_^' + GREEK + SUPSUB + '⟨⟩]|/2π');
  const GREEK_RUN = new RegExp('([' + GREEK + ']+)');
  const PRE = '[pnμµmkMG]';
  const UNIT1 = '(?:' + PRE + '?(?:Hz|eV|dBm?|mol|s|m|g|K|W|V|T|J|A|L|Ω)|' + PRE + '(?:bar|rad|Pa|Torr)|cm)[²³¹⁰-⁻]*';
  const UNIT = new RegExp('^[\\d.,]*' + UNIT1 + '(?:[/·]' + UNIT1 + ')*$');
  const VAR = /^(?:[b-z]|[A-Za-z]\([a-z,]{1,5}\))$/;
  const EL = 'Rb|Cs|Yb|Sr|Na|Li|Er|Dy|Ca|Mg|Hg|Ba|Ho|Tm|Cr|Kr|Xe|Cd|Lu|Eu|KRb|NaK|NaCs|RbCs|NaRb|LiCs|LiK|LiRb|NaLi|CaF|SrF|YbF|BaF|SrOH|CaOH|AlF';
  const EL_MASS = 'Be|He|Ne|Ar|Al|Zn|Si';   // English-looking: only with a mass number
  const ELEMENT = new RegExp('^(?:\\d*(?:' + EL + ')|(?:' + EL + '|' + EL_MASS + ')-\\d+|\\d+(?:' + EL_MASS + '))$');
  const SKIP = 'script,style,textarea,select,option,svg,code,pre,.katex,.case-keep,.no-case-keep,[contenteditable]';
  const upper = new WeakMap();

  function isUpper(el) {
    let v = upper.get(el);
    if (v === undefined) { v = getComputedStyle(el).textTransform === 'uppercase'; upper.set(el, v); }
    return v;
  }
  function keepWhole(t) {
    if (!t || t.toUpperCase() === t) return false;
    if (MARK.test(t) && !/[a-z]{4,}/.test(t.split(/[_^]/)[0])) return true;
    if (UNIT.test(t) || VAR.test(t)) return true;
    return /[a-z]/.test(t) && t.split(/[/–]/).every(p => ELEMENT.test(p) || /^\d+$/.test(p));
  }
  function greekRuns(s) {
    return s.split(GREEK_RUN).map((p, i) => [p, i % 2]);
  }
  function segCore(core) {
    if (keepWhole(core)) return [[core, 1]];
    if (/^(?:n\/a|w\/o|w\/)$/i.test(core)) return [[core, 0]];
    const pieces = core.split(/([-/])/);
    if (pieces.length > 1 && pieces.some((p, i) => i % 2 === 0 && keepWhole(p))) {
      const out = [];
      pieces.forEach((p, i) => out.push(...(i % 2 ? [[p, 0]] : keepWhole(p) ? [[p, 1]] : greekRuns(p))));
      return out;
    }
    return greekRuns(core);
  }
  function segToken(tok) {
    let lead = '', core = tok, trail = '';
    while (/^[(\[{"'“‘]/.test(core)) { lead += core[0]; core = core.slice(1); }
    for (;;) {
      const c = core.slice(-1);
      const n = s => core.split(s).length - 1;
      if (/[,;:.!?"'”’]/.test(c) || (c === ')' && n('(') < n(')')) ||
          (c === ']' && n('[') < n(']')) || (c === '}' && n('{') < n('}'))) {
        trail = c + trail; core = core.slice(0, -1);
      } else break;
    }
    return [[lead, 0], ...segCore(core), [trail, 0]];
  }
  function fixText(node) {
    const text = node.nodeValue, el = node.parentElement;
    if (!el || !/[a-zµα-ω]/.test(text) || /\$|\\\(|\\\[/.test(text)) return;
    if (!isUpper(el) || el.closest(SKIP)) return;
    const segs = [];
    text.split(/(\s+)/).forEach(tok => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) segs.push([tok, 0]); else segs.push(...segToken(tok));
    });
    if (!segs.some(([s, k]) => k && s)) return;
    const frag = document.createDocumentFragment();
    let buf = '';
    for (const [s, k] of segs) {
      if (!s) continue;
      if (!k) { buf += s; continue; }
      if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ''; }
      const span = document.createElement('span');
      span.className = 'case-keep';
      span.textContent = s;
      frag.appendChild(span);
    }
    if (buf) frag.appendChild(document.createTextNode(buf));
    el.replaceChild(frag, node);
  }
  function fixTree(root) {
    if (!root || !root.isConnected) return;
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 || root.closest(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
    nodes.forEach(fixText);
  }
  function start() {
    fixTree(document.body);
    new MutationObserver(recs => {
      for (const r of recs) {
        if (r.type === 'characterData') fixTree(r.target);
        else r.addedNodes.forEach(fixTree);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  // Registered after the KaTeX listener above, so maths is already typeset.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.AMOCaseKeep = { fix: fixTree, keepWhole };
})();

/* ─────────────────────────────────────────────────────────
   CHART.JS INKS FOLLOW THE THEME
   The site's charts were written with a mix of cream-theme inks (tick and
   legend text #5c503c / #22190f, tooltip paper #faf5e9) and dark-theme
   inks (grid #1e293b, rgba(255,255,255,.05)), so each theme had some
   unreadable parts: dark legend text on the dark card, black grids on
   cream. Instead of editing ~60 chart configs, every chart's 2D context
   translates known inks for the current theme as they are set (the same
   idea as js/canvas-ink.js). Chart configs keep their colours; accent
   colours (data series) pass through. A theme toggle re-renders every
   chart. Add an ink here only if it is a text/grid/tooltip ink.
   ───────────────────────────────────────────────────────── */
(function () {
  if (!window.Chart || window.AMOChartInk) return;
  const root = document.documentElement;
  const TO_DARK = {
    '#5c503c': '#94a3b8', '#8c8066': '#94a3b8', '#666': '#94a3b8', '#666666': '#94a3b8',
    '#3a2a18': '#cbd5e1', '#22190f': '#e2e8f0',
    '#faf5e9': '#0c1526',                                   // tooltip paper → card
    '#1e3a5f': 'rgba(148,163,184,0.45)',                    // tooltip border
    'rgba(0,0,0,0.1)': 'rgba(148,163,184,0.16)',            // Chart.js default grid/border
    'rgba(255,255,255,0.75)': 'rgba(12,21,38,0.75)'         // Chart.js default tick backdrop (radar)
  };
  const RGB_DARK = { '92,80,60': '148,163,184', '34,25,15': '226,232,240', '58,42,24': '203,213,225' };
  const TO_LIGHT = {
    '#1e293b': 'rgba(58,42,24,0.13)', '#0f1e35': 'rgba(58,42,24,0.13)', '#0d2236': 'rgba(58,42,24,0.13)',
    '#c4b5fd': '#6d28d9'                                    // pale violet labels on cream
  };
  const norm = v => v.replace(/\s+/g, '').toLowerCase();
  function map(v) {
    if (typeof v !== 'string') return v;
    const k = norm(v), dark = root.getAttribute('data-theme') === 'dark';
    if (dark) {
      if (TO_DARK[k]) return TO_DARK[k];
      const m = k.match(/^rgba?\((\d+),(\d+),(\d+)(,[\d.]+)?\)$/);
      if (m && RGB_DARK[m[1] + ',' + m[2] + ',' + m[3]]) return 'rgba(' + RGB_DARK[m[1] + ',' + m[2] + ',' + m[3]] + (m[4] || ',1') + ')';
      return v;
    }
    if (TO_LIGHT[k]) return TO_LIGHT[k];
    // faint white lines (dark-theme grids) → faint ink on cream; bright whites (text on bars) stay
    const w = k.match(/^rgba\(255,255,255,([\d.]+)\)$/);
    if (w && +w[1] < 0.5) return 'rgba(58,42,24,' + Math.min(0.6, Math.max(0.1, +w[1] * 2.5)).toFixed(2) + ')';
    return v;
  }
  function wrap(ctx) {
    if (!ctx || ctx.__amoChartInk) return;
    ctx.__amoChartInk = true;
    const proto = Object.getPrototypeOf(ctx);
    ['fillStyle', 'strokeStyle'].forEach(prop => {
      const d = Object.getOwnPropertyDescriptor(proto, prop);
      if (!d || !d.set) return;
      Object.defineProperty(ctx, prop, {
        configurable: true,
        get() { return d.get.call(ctx); },
        set(v) { d.set.call(ctx, map(v)); }
      });
    });
  }
  try {
    Chart.register({ id: 'amoChartInk', beforeInit(chart) { wrap(chart.ctx); } });
    Object.values(Chart.instances || {}).forEach(c => { wrap(c.ctx); c.render(); });
  } catch (e) { return; }
  let dark = root.getAttribute('data-theme') === 'dark';
  new MutationObserver(() => {
    const d = root.getAttribute('data-theme') === 'dark';
    if (d === dark) return;
    dark = d;
    Object.values(Chart.instances || {}).forEach(c => { try { c.render(); } catch (e) {} });
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  window.AMOChartInk = { map };
})();

/* ─────────────────────────────────────────────────────
   PRINT — what paper needs that the print CSS can't do alone
   (styles.css @media print does the rest). On beforeprint:
   • the dark theme is dropped until afterprint, so canvases (AMOInk) and
     Chart.js charts (AMOChartInk) repaint with paper inks;
   • every chapter and tab panel prints, each under a label naming its
     chapter ("Chapter 2 of 6 · …") or tab, and closed <details> open;
   • a source line records the page address (calculator inputs travel in
     its query string) and the date, since the figures print the values on
     screen at that moment;
   • external links get data-print-url so the URL is written after them;
   • 'amo:print' fires once the paper theme is on, so looping canvases that
     never came on screen draw a frame (js/motion.js).
   ───────────────────────────────────────────────────── */
const AMOPrint = (() => {
  const root = document.documentElement;
  let prepared = false, wasDark = false, opened = [], source = null;

  const label = (cls, text) => {
    const el = document.createElement('div');
    el.className = 'print-only ' + cls;
    el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    return el;
  };
  const shortUrl = href => href.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

  function prepare() {
    if (prepared) return;
    prepared = true;
    const done = new Set();
    // chapters (AMOChapters): "Chapter n of N · Title" above each panel
    (window.AMOChapters && AMOChapters.models ? AMOChapters.models() : []).forEach(m => {
      m.panels.forEach((p, i) => {
        done.add(p);
        p.classList.add('print-show');
        p.before(label('print-chapter-label', `Chapter ${i + 1} of ${m.panels.length} · ${m.titles[i]}`));
      });
    });
    // other tab bars: the tab's own label above its panel (same pairing as initTabs)
    document.querySelectorAll('.tab-bar').forEach(bar => {
      const group = bar.dataset.group, wrap = bar.closest('[data-tabs-wrap]') || document;
      const panels = Array.from(wrap.querySelectorAll('.tab-panel[data-tab]'))
        .filter(p => !(p.dataset.group && group && p.dataset.group !== group));
      bar.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        const p = panels.find(q => q.dataset.tab === btn.dataset.tab);
        if (!p || done.has(p)) return;
        done.add(p);
        const text = btn.textContent.replace(/\s+/g, ' ').trim();
        if (text) p.before(label('print-tab-label', text));
      });
    });
    // derivation boxes: every view, each under its button's label
    document.querySelectorAll('.derivation-mode').forEach(box => {
      box.querySelectorAll('[data-deriv-panel]').forEach(p => {
        const btn = box.querySelector(`[data-deriv-tab="${CSS.escape(p.dataset.derivPanel)}"]`);
        p.classList.add('print-show');
        if (btn) p.before(label('print-tab-label', btn.textContent.replace(/\s+/g, ' ').trim()));
      });
    });
    // external links: write the address out after the link text
    const main = document.getElementById('main-content') || document.body;
    main.querySelectorAll('a[href^="http"]').forEach(a => {
      if (a.host === location.host || /(^|\.)amotoolkit\.com$/.test(a.hostname)) return;
      if (a.querySelector('div, p, h2, h3, h4, li, img, svg, canvas')) return;   // cards, not inline links
      const url = shortUrl(a.href), text = a.textContent.replace(/\s+/g, '');
      if (!url || text.includes(url.replace(/\s+/g, '')) || text.includes(a.hostname.replace(/^www\./, ''))) return;
      a.dataset.printUrl = url;
    });
    // source line at the very top of the page content
    source = label('print-source', '');
    main.prepend(source);
  }

  function before() {
    prepare();
    const when = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    const addr = location.protocol.startsWith('http') && /amotoolkit\.com$/.test(location.hostname)
      ? shortUrl(location.href) : 'amotoolkit.com' + location.pathname.replace(/^.*?(\/pages\/|\/)([^/]*)$/, '$1$2') + location.search;
    if (source) source.textContent = `AMO Toolkit · ${addr} · printed ${when}. Calculators and figures show the values that were on screen when printed.`;
    opened = Array.from(document.querySelectorAll('details:not([open])'));
    opened.forEach(d => { d.open = true; });
    wasDark = root.getAttribute('data-theme') === 'dark';
    if (wasDark) root.removeAttribute('data-theme');
    root.classList.add('amo-printing');
    // after the theme observers (AMOInk, AMOChartInk) have run: size the
    // charts for paper, let looping canvases draw a paper-ink frame
    // (js/motion.js), then mark canvases that are still empty
    queueMicrotask(() => {
      sizeCharts();
      window.dispatchEvent(new Event('amo:print'));
      markBlank();
    });
  }
  // Chart.js sizes a chart from its container, but a chart in a closed
  // chapter or tab has no size, so it would print empty, and an open one is
  // sized for the screen. For each chart, briefly show any closed panel
  // around it (no paint happens in between), fit the chart to its container,
  // then cap it at a paper width (A4 less margins ≈ 680 CSS px) keeping that
  // shape, and draw it at once. Charts go back to responsive sizing after
  // printing.
  const PAPER_W = 680;
  let sized = [];
  function sizeCharts() {
    if (!window.Chart || !Chart.instances) return;
    sized = Object.values(Chart.instances);
    const shown = [];
    sized.forEach(c => {
      for (let a = c.canvas.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).display !== 'none') continue;
        shown.push([a, a.style.getPropertyValue('display'), a.style.getPropertyPriority('display')]);
        a.style.setProperty('display', 'block', 'important');
      }
    });
    sized.forEach(c => {
      try {
        c.resize();
        const ok = c.width > 0 && c.height > 0;
        const w = ok ? Math.min(c.width, PAPER_W) : PAPER_W;
        c.resize(w, Math.round(w / (ok ? c.width / c.height : 2.5)));
        c.update('none');                                 // final positions, no animation
        c.draw();                                         // and paint now, not on the next frame
      } catch (e) {}
    });
    shown.reverse().forEach(([a, v, pr]) => { if (v) a.style.setProperty('display', v, pr); else a.style.removeProperty('display'); });
  }
  // A canvas that is still one flat colour after all that (a figure that
  // draws only when its tab is opened or its button pressed) would print as
  // an empty box; print a one-line note in its place instead.
  let blanks = [];
  function markBlank() {
    document.querySelectorAll('canvas').forEach(c => {
      // (a canvas with no context yet gets a 2D one here: a WebGL canvas that is
      // created lazily must carry data-print-skip)
      if (!c.width || !c.height || c.closest('[aria-hidden="true"], .nav, .hero-3d, [data-print-skip]')) return;
      let g = null;
      try { g = c.getContext('2d'); } catch (e) {}
      if (!g) return;                                     // WebGL: prints as drawn
      let px;
      try { px = new Uint32Array(g.getImageData(0, 0, c.width, c.height).data.buffer); } catch (e) { return; }
      for (let i = 1; i < px.length; i++) if (px[i] !== px[0]) return;   // every pixel: thin chart lines count
      c.classList.add('print-blank');
      let note = c.nextElementSibling;
      if (!note || !note.classList.contains('print-figure-note')) {
        note = label('print-figure-note', 'Interactive figure: it had not been drawn when this page was printed. Open the page to use it.');
        c.after(note);
      }
      blanks.push(c);
    });
  }
  function after() {
    opened.forEach(d => { d.open = false; });
    opened = [];
    blanks.forEach(c => c.classList.remove('print-blank'));
    blanks = [];
    sized.forEach(c => { try { c.resize(); } catch (e) {} });
    sized = [];
    if (wasDark) root.setAttribute('data-theme', 'dark');
    wasDark = false;
    root.classList.remove('amo-printing');
  }
  window.addEventListener('beforeprint', before);
  window.addEventListener('afterprint', after);
  return { before, after };
})();
window.AMOPrint = AMOPrint;
