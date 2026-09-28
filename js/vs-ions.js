/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — vs-ions.js: "Two ways to talk to an ion" for
   quantinuum-vs-ionq.html, Section 02. Schematic, not to scale.

   Left  — laser-driven QCCD (as described for Quantinuum Helios on the
           page): ions wait in a rotatable storage ring, a pair is shuttled
           through a four-way junction into a gate zone, and two steered
           laser beams drive the gate.
   Right — Electronic Qubit Control (IonQ Superion, per the page): a
           chain of ions floats above a chip; the gate is driven by the
           electrodes underneath, with no per-gate steered beams.

   Canvas 2D + the shared AMO3D.orbit (js/orbit3d.js). Pause button;
   still frame under prefers-reduced-motion; paused offscreen.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var AMO3D = window.AMO3D = window.AMO3D || {};
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  AMO3D.ionScenes = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d'); if (!ctx) return null;
    var root = document.documentElement;
    var view = AMO3D.orbit(canvas, { az: -0.25, el: 0.62, minEl: 0.1, maxEl: 1.4, label: opts.label || 'Two ion-trap architectures' });
    var W = 0, H = 0, S = 1, T = 0, CY = 0, stacked = false;
    var cA = opts.colorA || '#8b5cf6', cB = opts.colorB || '#3b82f6';
    function css(v, f) { var x = getComputedStyle(canvas).getPropertyValue(v).trim(); return x || f; }

    function resize() {
      var r = canvas.getBoundingClientRect(); if (r.width < 2) return false;
      var dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stacked = W < 560;
      S = stacked ? Math.min(W / 3.3, H / 5.4) : Math.min(W / 5.2, H / 2.7); return true;
    }
    function P(cx, x, y, z) { var q = AMO3D.project(view, x, y, z); return [cx + S * q[0], CY - S * q[1], q[2]]; }
    function dot(p, r, fill, glow) {
      if (glow) { var g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 3.2); g.addColorStop(0, glow); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r * 3.2, 0, 6.2832); ctx.fill(); }
      ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.2832); ctx.fill();
    }
    function poly(cx, pts, fill, stroke) {
      ctx.beginPath(); pts.forEach(function (v, i) { var p = P(cx, v[0], v[1], v[2]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    }
    function path(cx, pts, stroke, w, dash) {
      ctx.beginPath(); pts.forEach(function (v, i) { var p = P(cx, v[0], v[1], v[2]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = stroke; ctx.lineWidth = w || 1; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
    }
    function lerp(a, b, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; }
    function ease(u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

    /* Left scene: ring (centre (0, 0.55), r 0.5) → junction at (0, −0.25) → gate zone at (−0.95, −0.25) */
    var RING = { c: [0, 0.55], r: 0.5, n: 14 }, JX = [0, -0.25, 0], GZ = [-0.95, -0.25, 0], GZ2 = [0.95, -0.25, 0];
    function leftScene(cx, dark, phase) {
      var trap = dark ? 'rgba(148,163,184,.55)' : 'rgba(58,42,24,.45)', ion = dark ? '#e2e8f0' : '#1f2937';
      // base plate
      poly(cx, [[-1.35, -0.75, -0.02], [1.35, -0.75, -0.02], [1.35, 1.2, -0.02], [-1.35, 1.2, -0.02]], dark ? 'rgba(30,41,59,.55)' : 'rgba(234,224,205,.7)', trap);
      // ring channel
      var ring = []; for (var k = 0; k <= 60; k++) { var a = k / 60 * 6.2832; ring.push([RING.c[0] + RING.r * Math.cos(a), RING.c[1] + RING.r * Math.sin(a), 0]); }
      path(cx, ring, trap, 5);
      // four-way junction arms: up to ring, left & right to gate zones, down (stub)
      path(cx, [[0, RING.c[1] - RING.r, 0], JX], trap, 5);
      path(cx, [GZ, GZ2], trap, 5);
      path(cx, [JX, [0, -0.7, 0]], trap, 5);
      [GZ, GZ2].forEach(function (g) { poly(cx, [[g[0] - 0.2, g[1] - 0.1, 0.001], [g[0] + 0.2, g[1] - 0.1, 0.001], [g[0] + 0.2, g[1] + 0.1, 0.001], [g[0] - 0.2, g[1] + 0.1, 0.001]], 'rgba(0,0,0,0)', cA); });
      // cycle: 0–.3 travel ring→junction→gate, .3–.62 gate (lasers), .62–.9 return, rest idle
      var rot = 0, travel = [RING.c[0], RING.c[1] - RING.r, 0];
      var pair = null, lasers = 0;
      if (phase < 0.3) { var u = ease(phase / 0.3); pair = u < 0.45 ? lerp(travel, JX, u / 0.45) : lerp(JX, GZ, (u - 0.45) / 0.55); }
      else if (phase < 0.62) { pair = GZ; lasers = Math.sin((phase - 0.3) / 0.32 * Math.PI); }
      else if (phase < 0.9) { var w = ease((phase - 0.62) / 0.28); pair = w < 0.55 ? lerp(GZ, JX, w / 0.55) : lerp(JX, travel, (w - 0.55) / 0.45); }
      // ring ions (a two-ion gap at the bottom while the pair is away)
      for (var i = 0; i < RING.n; i++) {
        var ang = -Math.PI / 2 + (i + 1) / (RING.n + 2) * 6.2832;       // gap at the bottom = the pair's home slot
        var p = P(cx, RING.c[0] + RING.r * Math.cos(ang + rot), RING.c[1] + RING.r * Math.sin(ang + rot), 0.03);
        dot(p, 3.2, ion, dark ? 'rgba(226,232,240,.35)' : null);
      }
      if (pair) {
        [-0.05, 0.05].forEach(function (o) { dot(P(cx, pair[0] + o, pair[1], 0.03), 3.6, cA, cA + '88'); });
      }
      if (lasers > 0.02) {
        [[-1.1, 0.6, 1.1], [-0.6, -1.0, 1.1]].forEach(function (src) {
          var a = P(cx, src[0], src[1], src[2]), b = P(cx, GZ[0], GZ[1], 0.03);
          ctx.strokeStyle = 'rgba(56,189,248,' + (0.85 * lasers).toFixed(2) + ')'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          dot(a, 3, 'rgba(56,189,248,.9)');
        });
        dot(P(cx, GZ[0], GZ[1], 0.03), 6 * lasers, 'rgba(56,189,248,.35)');
      }
      label(cx, [0, 1.35, 0], 'Laser-driven QCCD', cA);
      label(cx, [0, -0.95, 0], phase < 0.3 ? 'shuttle pair → gate zone' : phase < 0.62 ? 'steered laser beams drive the gate' : phase < 0.9 ? 'shuttle back to storage ring' : 'storage ring', dark ? '#94a3b8' : '#6b5a45', true);
    }

    /* Right scene: chip at z = 0, ion chain along x at z = 0.28 */
    function rightScene(cx, dark, phase) {
      var n = 8, gi = Math.floor(phase * 3.999) % 4 * 2, gate = Math.sin((phase * 4 % 1) * Math.PI);
      poly(cx, [[-1.3, -0.55, 0], [1.3, -0.55, 0], [1.3, 0.55, 0], [-1.3, 0.55, 0]], dark ? 'rgba(30,41,59,.75)' : 'rgba(226,232,240,.9)', dark ? 'rgba(148,163,184,.6)' : 'rgba(58,42,24,.4)');
      // electrode tiles under each ion, two rows
      for (var i = 0; i < n; i++) {
        var x = -1.05 + i * 0.3;
        [-0.28, 0.08].forEach(function (y) {
          var on = (i === gi || i === gi + 1) ? gate : 0;
          var f = on > 0.05 ? 'rgba(' + hexRgb(cB) + ',' + (0.25 + 0.6 * on).toFixed(2) + ')' : (dark ? 'rgba(148,163,184,.22)' : 'rgba(100,116,139,.25)');
          poly(cx, [[x - 0.11, y, 0.002], [x + 0.11, y, 0.002], [x + 0.11, y + 0.2, 0.002], [x - 0.11, y + 0.2, 0.002]], f, dark ? 'rgba(148,163,184,.4)' : 'rgba(58,42,24,.3)');
        });
      }
      // fine wiring pads along the edge (it is a fabricated chip)
      for (var k = 0; k < 14; k++) { var xx = -1.2 + k * 0.185; poly(cx, [[xx - 0.04, -0.52, 0.002], [xx + 0.04, -0.52, 0.002], [xx + 0.04, -0.45, 0.002], [xx - 0.04, -0.45, 0.002]], dark ? 'rgba(234,179,8,.45)' : 'rgba(180,83,9,.45)'); }
      for (i = 0; i < n; i++) {
        var p = P(cx, -1.05 + i * 0.3, -0.08, 0.28), g = (i === gi || i === gi + 1) ? gate : 0;
        var base = P(cx, -1.05 + i * 0.3, -0.08, 0);
        ctx.strokeStyle = dark ? 'rgba(148,163,184,.25)' : 'rgba(58,42,24,.2)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.setLineDash([]);
        if (g > 0.05) {                                   // field ripple from the electrodes
          for (var r = 1; r <= 2; r++) { ctx.strokeStyle = 'rgba(' + hexRgb(cB) + ',' + (0.5 * g / r).toFixed(2) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], 6 + r * 6 * g, 0, 6.2832); ctx.stroke(); }
        }
        dot(p, g > 0.05 ? 3.8 : 3.2, g > 0.05 ? cB : (dark ? '#e2e8f0' : '#1f2937'), g > 0.05 ? cB + '88' : (dark ? 'rgba(226,232,240,.35)' : null));
      }
      label(cx, [0, 1.0, 0.1], 'Electronic Qubit Control', cB);
      label(cx, [0, -0.95, 0], stacked ? 'electrodes drive the gate' : 'on-chip electrodes drive the gate — no steered beams', dark ? '#94a3b8' : '#6b5a45', true);
    }
    function hexRgb(h) { h = h.replace('#', ''); var n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16); return (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255); }
    function label(cx, v, t, c, small) {
      var p = P(cx, v[0], v[1], v[2]);
      ctx.fillStyle = c; ctx.font = (small ? '11px system-ui,sans-serif' : '700 13px system-ui,sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(t, p[0], p[1]);
    }
    function draw() {
      if (!W && !resize()) return;
      var dark = root.getAttribute('data-theme') === 'dark';
      ctx.clearRect(0, 0, W, H);
      var phase = (T / 6) % 1;                            // 6 s cycle
      ctx.strokeStyle = dark ? 'rgba(148,163,184,.25)' : 'rgba(58,42,24,.2)'; ctx.beginPath();
      if (stacked) {
        CY = H * 0.27; leftScene(W / 2, dark, phase);
        CY = H * 0.77; rightScene(W / 2, dark, phase);
        ctx.moveTo(20, H / 2); ctx.lineTo(W - 20, H / 2);
      } else {
        CY = H * 0.56; leftScene(W * 0.26, dark, phase); rightScene(W * 0.74, dark, phase);
        ctx.moveTo(W / 2, 20); ctx.lineTo(W / 2, H - 20);
      }
      ctx.stroke();
    }

    var paused = reduced, raf = 0, last = 0, visible = true, pb = opts.pauseButton;
    function syncBtn() { if (!pb) return; pb.hidden = reduced; pb.setAttribute('aria-pressed', String(paused)); pb.textContent = paused ? '▶ Play' : '❚❚ Pause'; }
    if (pb) pb.addEventListener('click', function () { paused = !paused; syncBtn(); kick(); });
    function frame(now) {
      raf = 0; var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      if (!paused) T += dt; draw();
      if (!paused && visible && !document.hidden) raf = requestAnimationFrame(frame); else last = 0;
    }
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    view.onChange(function () { if (!raf) requestAnimationFrame(draw); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; kick(); }, { threshold: 0.05 }).observe(canvas);
    document.addEventListener('visibilitychange', kick);
    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (reduced) T = 6 * 0.45;                            // still frame mid-gate on both
    syncBtn(); resize(); draw(); kick();
    return { view: view, redraw: draw };
  };
})();
