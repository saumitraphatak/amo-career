/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — rydberg3d.js: blockade spheres in a tweezer array
   (rydberg-calculator.html, Rydberg Blockade Lab).

   Uses only the page's own results: the blockade radius R_b (from its
   C₆ and Ω) and the lattice spacing a (its "atom separation" slider).
   For a site excited to |r⟩, every other atom at distance d feels
       U(d)/ℏΩ = (R_b/d)⁶          (from |U(R_b)| = ℏΩ and U ∝ 1/d⁶)
   so atoms with d < R_b are blockaded. The page's own leakage estimate
   ε ≈ (ℏΩ/U)² = (d/R_b)¹² is listed per neighbour shell.

   Geometries: square, triangular, and a two-layer square stack (layer
   spacing = a). Rotation via AMO3D.orbit (js/orbit3d.js). Click an atom
   (or focus the canvas and press [ / ]) to move the excitation. Static drawing — the
   only motion is the user's, so no pause control is needed.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var AMO3D = window.AMO3D = window.AMO3D || {};

  function sites(kind, N) {
    var out = [], h = (N - 1) / 2;
    if (kind === 'tri') {
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) out.push([c - h + (r % 2 ? 0.5 : 0) - 0.25, (r - h) * Math.sqrt(3) / 2, 0]);
    } else {
      var L = kind === 'bilayer' ? 2 : 1;
      for (var l = 0; l < L; l++) for (var r2 = 0; r2 < N; r2++) for (var c2 = 0; c2 < N; c2++) out.push([c2 - h, r2 - h, L === 2 ? l - 0.5 : 0]);
    }
    return out;
  }
  function shells(pts, i) {                                   // distinct neighbour distances (in units of a) with counts
    var m = {};
    pts.forEach(function (p, j) {
      if (j === i) return;
      var d = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]), k = d.toFixed(3);
      m[k] = (m[k] || 0) + 1;
    });
    return Object.keys(m).map(function (k) { return { d: +k, n: m[k] }; }).sort(function (a, b) { return a.d - b.d; });
  }
  AMO3D.blockadeShells = shells; AMO3D.blockadeSites = sites;

  AMO3D.blockadeArray = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d'); if (!ctx) return null;
    var root = document.documentElement;
    var st = { kind: 'square', N: 5, Rb: 10, a: 5, sel: 12 };
    var pts = sites(st.kind, st.N);
    var view = AMO3D.orbit(canvas, { az: 0.35, el: 0.75, minEl: -0.2, maxEl: 1.45, label: opts.label || 'Tweezer array with a Rydberg blockade sphere' });
    var W = 0, H = 0, S = 1, CX = 0, CY = 0, screen = [], hoverI = -1;

    function resize() {
      var r = canvas.getBoundingClientRect(); if (r.width < 2) return false;
      var dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      CX = W / 2; CY = H / 2; return true;
    }
    function P(x, y, z) { var q = AMO3D.project(view, x, y, z); return [CX + S * q[0], CY - S * q[1], q[2]]; }
    function pal() {
      return root.getAttribute('data-theme') === 'dark'
        ? { atom: '#cbd5e1', ryd: '#f472b6', blk: '#818cf8', free: '#34d399', ring: '129,140,248', text: '#e2e8f0', muted: 'rgba(148,163,184,.9)', grid: 'rgba(148,163,184,.14)' }
        : { atom: '#475569', ryd: '#be185d', blk: '#4f46e5', free: '#047857', ring: '79,70,229', text: '#22190f', muted: 'rgba(58,42,24,.75)', grid: 'rgba(58,42,24,.12)' };
    }
    function draw() {
      if (!W && !resize()) return;
      var C = pal(), rb = st.Rb / st.a;                      // blockade radius in lattice units
      var ext = (st.N - 1) / 2 + 0.8;
      S = Math.min(W, H) / 2 / Math.max(ext * 1.15, Math.min(rb, ext * 1.6) * 1.05);
      ctx.clearRect(0, 0, W, H);
      var sel = pts[st.sel];
      // lattice bonds (nearest neighbours) as faint guide lines
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) {
        var d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
        if (Math.abs(d - 1) < 1e-3) { var a = P(pts[i][0], pts[i][1], pts[i][2]), b = P(pts[j][0], pts[j][1], pts[j][2]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      }
      // blockade sphere around the excited atom: translucent disc + 3 great circles
      var c0 = P(sel[0], sel[1], sel[2]), R = rb * S;
      var g = ctx.createRadialGradient(c0[0] - R * 0.3, c0[1] - R * 0.35, R * 0.1, c0[0], c0[1], R);
      g.addColorStop(0, 'rgba(' + C.ring + ',.16)'); g.addColorStop(1, 'rgba(' + C.ring + ',.05)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c0[0], c0[1], R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = 'rgba(' + C.ring + ',.55)'; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (ax, k) {
        ctx.beginPath();
        for (var s = 0; s <= 72; s++) {
          var t = s / 72 * 6.2832, u = Math.cos(t) * rb, v = Math.sin(t) * rb, p;
          p = k === 0 ? P(sel[0], sel[1] + u, sel[2] + v) : k === 1 ? P(sel[0] + u, sel[1], sel[2] + v) : P(sel[0] + u, sel[1] + v, sel[2]);
          s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.strokeStyle = 'rgba(' + C.ring + ',' + (k === 2 ? .35 : .18) + ')'; ctx.lineWidth = 1; ctx.stroke();
      });
      // atoms, back to front
      screen = pts.map(function (p, i) { var q = P(p[0], p[1], p[2]); return { i: i, x: q[0], y: q[1], d: q[2] }; }).sort(function (m, n) { return m.d - n.d; });
      screen.forEach(function (s) {
        var p = pts[s.i], dist = Math.hypot(p[0] - sel[0], p[1] - sel[1], p[2] - sel[2]), isSel = s.i === st.sel, inB = !isSel && dist < rb;
        var col = isSel ? C.ryd : inB ? C.blk : C.free, r = isSel ? 8 : 6, depth = .6 + .4 * Math.max(0, Math.min(1, (s.d + 1) / 2));
        if (isSel || inB) { var gl = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 2.6); gl.addColorStop(0, col + '66'); gl.addColorStop(1, col + '00'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(s.x, s.y, r * 2.6, 0, 6.2832); ctx.fill(); }
        ctx.globalAlpha = depth; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
        if (s.i === hoverI) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, r + 4, 0, 6.2832); ctx.stroke(); }
      });
      ctx.fillStyle = C.muted; ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('R_b = ' + st.Rb.toFixed(2) + ' μm · a = ' + st.a.toFixed(1) + ' μm · R_b/a = ' + rb.toFixed(2), 10, 10);
      if (rb > ext * 1.6) ctx.fillText('sphere larger than the view: every atom shown is blockaded', 10, 26);
    }
    function report() {
      var rb = st.Rb / st.a, sh = shells(pts, st.sel), blocked = 0;
      sh.forEach(function (s) { if (s.d < rb) blocked += s.n; });
      if (opts.onReport) opts.onReport({ rb: rb, shells: sh, blocked: blocked, total: pts.length - 1, a: st.a, Rb: st.Rb });
    }
    function hit(ev) {
      var r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = -1, bd = 14;
      screen.forEach(function (s) { var d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = s.i; } });
      return best;
    }
    var down = null;
    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointerup', function (e) {
      if (!down) return; var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 5) return; var i = hit(e); if (i >= 0) { st.sel = i; draw(); report(); }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var i = hit(e); canvas.style.cursor = i >= 0 ? 'pointer' : '';
      if (i !== hoverI) { hoverI = i; draw(); }
    });
    canvas.addEventListener('pointerleave', function () { if (hoverI >= 0) { hoverI = -1; draw(); } });
    // keyboard: [ and ] step the excitation through the sites (arrow keys stay with rotation)
    canvas.addEventListener('keydown', function (e) {
      if (e.key === ']' || e.key === '[') { e.preventDefault(); st.sel = (st.sel + (e.key === ']' ? 1 : pts.length - 1)) % pts.length; draw(); report(); }
    });
    view.onChange(function () { requestAnimationFrame(draw); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    resize(); draw();
    function centre() { var best = 0, bd = 1e9; pts.forEach(function (p, i) { var d = Math.hypot(p[0], p[1], p[2] + (p[2] < 0 ? 0 : 0.0001)); if (d < bd) { bd = d; best = i; } }); return best; }
    return {
      set: function (o) {
        if (o.kind && o.kind !== st.kind) { st.kind = o.kind; pts = sites(st.kind, st.N); st.sel = centre(); }
        if (o.Rb != null) st.Rb = o.Rb; if (o.a != null) st.a = o.a;
        draw(); report();
      },
      state: st, view: view
    };
  };
})();
