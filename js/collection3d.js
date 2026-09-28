/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — collection3d.js: how much of an atom's fluorescence a
   lens of numerical aperture NA actually catches (imaging-calculator).

   Lab frame: z = optical axis, pointing at the objective; atom at origin.
   The collected solid angle is the cap θ < θ_max = arcsin(NA) (n = 1)
   of a reference sphere. Three emission patterns, all normalised to
   one photon out:
     isotropic          I ∝ 1                  η = (1 − c)/2
     dipole ⊥ axis      I ∝ 1 − (d̂·x̂)²         η = (3/8)[(1 − c) + (1 − c³)/3]
       (same φ-averaged pattern as σ± light with the quantization axis
        along the objective, (1 + cos²θ)/2, so the same η)
     dipole ∥ axis      I ∝ 1 − (d̂·ẑ)²         η = (3/4)[(1 − c) − (1 − c³)/3]
   with c = cos θ_max = √(1 − NA²). The isotropic value is exactly the
   page's collectionGeo(NA), i.e. what the calculator uses.

   Photons are Monte Carlo samples of the chosen pattern (rejection
   sampling), so the running tally converges to η. Rotation via the
   shared AMO3D.orbit (js/orbit3d.js). Pause button (WCAG 2.2.2); no
   photon stream under prefers-reduced-motion; paused offscreen.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var AMO3D = window.AMO3D = window.AMO3D || {};

  var PATTERNS = {
    iso:  { I: function () { return 1; } },
    perp: { I: function (x) { return 1 - x * x; } },          // dipole along x
    para: { I: function (x, y, z) { return 1 - z * z; } }     // dipole along z (optical axis)
  };
  function etaOf(pattern, NA) {
    var c = Math.sqrt(Math.max(0, 1 - NA * NA)), a = 1 - c, b = (1 - c * c * c) / 3;
    if (pattern === 'perp') return 0.375 * (a + b);
    if (pattern === 'para') return 0.75 * (a - b);
    return a / 2;
  }
  AMO3D.collectionEta = etaOf;

  AMO3D.collectionCone = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var root = document.documentElement;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var view = AMO3D.orbit(canvas, { az: -0.55, el: 0.28, label: opts.label || 'Photon collection geometry' });
    var state = { NA: opts.NA || 0.5, pattern: opts.pattern || 'iso' };
    var W = 0, H = 0, S = 1, CX = 0, CY = 0;
    var photons = [], emitted = 0, caught = 0;

    function pal() {
      return root.getAttribute('data-theme') === 'dark'
        ? { on: '52,211,153', off: '148,163,184', lens: '96,165,250', text: '#e2e8f0', muted: 'rgba(148,163,184,0.9)', atom: '#fbbf24', dip: '#f472b6' }
        : { on: '4,120,87', off: '100,90,75', lens: '29,78,216', text: '#22190f', muted: 'rgba(58,42,24,0.75)', atom: '#b45309', dip: '#be185d' };
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min(W * 0.34, H * 0.4); CX = W / 2 - S * 0.12; CY = H / 2 + S * 0.1;
      return true;
    }
    function P(x, y, z) { var q = AMO3D.project(view, x, y, z); return [CX + S * q[0], CY - S * q[1], q[2]]; }
    function thetaMax() { return Math.asin(Math.min(0.999, state.NA)); }

    function draw() {
      if (!W && !resize()) return;
      var C = pal(), tm = thetaMax(), ct = Math.cos(tm), st = Math.sin(tm), I = PATTERNS[state.pattern].I;
      ctx.clearRect(0, 0, W, H);
      var k, j, a, p, q;

      // reference sphere (r = 1): faint outline, dots, the collected cap bright
      ctx.strokeStyle = 'rgba(' + C.off + ',0.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(CX, CY, S, 0, 6.2832); ctx.stroke();
      for (k = 0; k < 900; k++) {
        var zz = 1 - 2 * (k + 0.5) / 900, rr = Math.sqrt(1 - zz * zz), ph = k * 2.39996;
        var x = rr * Math.cos(ph), y = rr * Math.sin(ph);
        p = P(x, y, zz);
        var inCap = zz >= ct, depth = 0.35 + 0.65 * (p[2] + 1) / 2;
        ctx.fillStyle = 'rgba(' + (inCap ? C.on : C.off) + ',' + ((inCap ? 0.95 : 0.3) * depth).toFixed(3) + ')';
        var s = inCap ? 2.6 : 1.5;
        ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
      }

      // collection cone: edges from the atom to the cap rim + rim circle
      var o = P(0, 0, 0);
      ctx.lineWidth = 1;
      for (k = 0; k < 16; k++) {
        a = k / 16 * 6.2832; q = P(st * Math.cos(a), st * Math.sin(a), ct);
        ctx.strokeStyle = 'rgba(' + C.on + ',' + (q[2] > 0 ? 0.35 : 0.15) + ')';
        ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      }
      // objective: a lens disc just beyond the cap
      var zl = 1.08 * ct, rl = 1.08 * st;
      ctx.beginPath();
      for (k = 0; k <= 64; k++) { a = k / 64 * 6.2832; q = P(rl * Math.cos(a), rl * Math.sin(a), zl); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
      ctx.fillStyle = 'rgba(' + C.lens + ',0.14)'; ctx.fill();
      ctx.strokeStyle = 'rgba(' + C.lens + ',0.8)'; ctx.lineWidth = 1.6; ctx.stroke();
      // label beside the lens: right-most projected rim point, fixed in screen space
      var rx = -1e9, ry = 0, top = 1e9;
      for (k = 0; k < 64; k++) { a = k / 64 * 6.2832; q = P(rl * Math.cos(a), rl * Math.sin(a), zl); if (q[0] > rx) { rx = q[0]; ry = q[1]; } if (q[1] < top) top = q[1]; }
      var t1 = 'objective · NA ' + state.NA.toFixed(2), t2 = 'θmax = ' + (tm * 180 / Math.PI).toFixed(1) + '°';
      ctx.font = '600 12px system-ui,sans-serif';
      var tw = ctx.measureText(t1).width + 4, lx = rx + 12, ly = ry;
      if (lx + tw > W - 4) { lx = Math.max(4, Math.min(W - 4 - tw, CX - tw / 2)); ly = Math.max(24, top - 26); }   // no room beside it: go above
      ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(t1, lx, ly - 8);
      ctx.fillStyle = C.muted; ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace';
      ctx.fillText(t2, lx, ly + 8);
      ctx.textAlign = 'center';

      // emission pattern: wireframe, radius ∝ intensity (max 0.5)
      var R0 = 0.5;
      function E(th, fi) {
        var dx = Math.sin(th) * Math.cos(fi), dy = Math.sin(th) * Math.sin(fi), dz = Math.cos(th), r = R0 * I(dx, dy, dz);
        return [r * dx, r * dy, r * dz, th <= tm];
      }
      function seg(u, v) {
        var pu = P(u[0], u[1], u[2]), pv = P(v[0], v[1], v[2]), on = u[3] && v[3];
        ctx.strokeStyle = 'rgba(' + (on ? C.on : C.off) + ',' + (on ? 0.9 : 0.4) + ')';
        ctx.lineWidth = on ? 1.4 : 0.9;
        ctx.beginPath(); ctx.moveTo(pu[0], pu[1]); ctx.lineTo(pv[0], pv[1]); ctx.stroke();
      }
      var NT = 18, NF = 24;
      for (j = 0; j < NF; j += 2) for (k = 0; k < NT; k++) {
        var f = j / NF * 6.2832; seg(E(k / NT * Math.PI, f), E((k + 1) / NT * Math.PI, f));
      }
      for (k = 1; k < NT; k += 2) for (j = 0; j < NF; j++) {
        var t = k / NT * Math.PI; seg(E(t, j / NF * 6.2832), E(t, (j + 1) / NF * 6.2832));
      }

      // dipole axis arrow
      if (state.pattern !== 'iso') {
        var d = state.pattern === 'perp' ? [1, 0, 0] : [0, 0, 1], L = 0.3;
        var d0 = P(-L * d[0], -L * d[1], -L * d[2]), d1 = P(L * d[0], L * d[1], L * d[2]);
        ctx.strokeStyle = C.dip; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(d0[0], d0[1]); ctx.lineTo(d1[0], d1[1]); ctx.stroke();
        [d0, d1].forEach(function (e, i) {
          var b = i ? d0 : d1, ang = Math.atan2(e[1] - b[1], e[0] - b[0]);
          ctx.beginPath(); ctx.moveTo(e[0], e[1]);
          ctx.lineTo(e[0] - 8 * Math.cos(ang - 0.45), e[1] - 8 * Math.sin(ang - 0.45));
          ctx.lineTo(e[0] - 8 * Math.cos(ang + 0.45), e[1] - 8 * Math.sin(ang + 0.45)); ctx.closePath();
          ctx.fillStyle = C.dip; ctx.fill();
        });
        ctx.fillStyle = C.dip; ctx.font = '700 12px system-ui,sans-serif';
        ctx.fillText('d', d1[0] + 10, d1[1] - 8);
      }

      // photons
      photons.forEach(function (ph) {
        var r = ph.r, pp = P(ph.u[0] * r, ph.u[1] * r, ph.u[2] * r);
        ctx.fillStyle = 'rgba(' + (ph.hit ? C.on : C.off) + ',' + (ph.hit ? 0.95 : 0.55) + ')';
        ctx.beginPath(); ctx.arc(pp[0], pp[1], ph.hit ? 2.3 : 1.6, 0, 6.2832); ctx.fill();
      });

      // atom
      var g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], 12);
      g.addColorStop(0, C.atom); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o[0], o[1], 12, 0, 6.2832); ctx.fill();
      ctx.fillStyle = C.atom; ctx.beginPath(); ctx.arc(o[0], o[1], 3.5, 0, 6.2832); ctx.fill();
    }

    /* ── Monte Carlo photon stream ── */
    function sample() {
      var I = PATTERNS[state.pattern].I;
      for (var n = 0; n < 50; n++) {
        var z = 2 * Math.random() - 1, f = 6.2832 * Math.random(), r = Math.sqrt(1 - z * z);
        var u = [r * Math.cos(f), r * Math.sin(f), z];
        if (Math.random() <= I(u[0], u[1], u[2])) return u;
      }
      return [0, 0, 1];
    }
    function reset() { photons = []; emitted = 0; caught = 0; report(); }
    function report() { if (opts.onTally) opts.onTally(emitted, caught); }

    var paused = !!reduced, raf = 0, last = 0, visible = true, acc = 0;
    var pauseBtn = opts.pauseButton || null;
    function syncBtn() {
      if (!pauseBtn) return;
      pauseBtn.hidden = !!reduced;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.textContent = paused ? '▶ Emit photons' : '❚❚ Pause photons';
    }
    if (pauseBtn) pauseBtn.addEventListener('click', function () { paused = !paused; syncBtn(); kick(); });
    syncBtn();

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      if (!paused) {
        acc += dt * 90;                                   // ≈ 90 photons per second
        var ct = Math.cos(thetaMax());
        while (acc >= 1) {
          acc -= 1;
          var u = sample(), hit = u[2] >= ct;
          photons.push({ u: u, r: 0.04, hit: hit });
          emitted++; if (hit) caught++;
        }
        photons.forEach(function (p) { p.r += dt * 0.55; });
        photons = photons.filter(function (p) { return p.r < (p.hit ? 1.08 : 1.25); });
        if (photons.length > 400) photons.splice(0, photons.length - 400);
        report();
      }
      draw();
      if (!paused && visible && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    view.onChange(function () { if (!raf) requestAnimationFrame(draw); });

    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    else window.addEventListener('resize', function () { if (resize()) draw(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }, { threshold: 0.05 }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    new MutationObserver(function () { draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    resize(); draw(); kick();
    return {
      set: function (o) {
        var changed = false;
        if (o.NA != null && o.NA !== state.NA) { state.NA = o.NA; changed = true; }
        if (o.pattern && o.pattern !== state.pattern) { state.pattern = o.pattern; changed = true; }
        if (changed) { reset(); draw(); }
      },
      state: state, view: view, redraw: draw
    };
  };
})();
