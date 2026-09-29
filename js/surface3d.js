/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — surface3d.js: a rotatable shaded height-map surface.

   Used by zernike.html ("Build & Diagnose" tab) to show the page's own
   wavefront W(ρ,θ) and its PSF as 3D surfaces. The page supplies every
   value; this file only draws. Needs js/orbit3d.js.

   AMO3D.surface(canvas, {label}) → { set(spec), view }
     spec = {
       rows, cols,                  mesh size
       at(r, c) → [x, y, value]     x, y in the figure's units (fit to ±extent);
                                    return null for a hole
       wrapCols: bool               join the last column to the first (polar meshes)
       zOf(value) → height          same units as x, y
       colorOf(value) → [r, g, b]
       wireEvery: n                 draw every n-th mesh line (0 = none)
       ring: radius                 dashed reference circle at z = 0 (optional)
       extent: number               half-width to fit in the view
       readout(r, c, value) → text  shown for the vertex under the pointer
       caption: text                top-left (wraps at ' · ' on narrow canvases)
       pole: {z, label}             dashed reference line from the origin up to height z
     }
   Painter's algorithm (quads sorted back to front), Lambert shading.
   Static drawing: it only moves when the user drags, so no pause control.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var AMO3D = window.AMO3D = window.AMO3D || {};

  AMO3D.surface = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d'); if (!ctx) return null;
    var root = document.documentElement;
    var view = AMO3D.orbit(canvas, { az: -0.6, el: 0.62, minEl: -0.1, maxEl: 1.5, label: opts.label || '3D surface' });
    var W = 0, H = 0, spec = null, V = [], scr = [], hover = -1, raf = 0;

    function dark() { return root.getAttribute('data-theme') === 'dark'; }
    function resize() {
      var r = canvas.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (Math.abs(r.width - W) < 0.5 && Math.abs(r.height - H) < 0.5 && canvas.width === Math.round(r.width * dpr)) return true;
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }
    function build() {
      V = [];
      if (!spec) return;
      for (var r = 0; r < spec.rows; r++) for (var c = 0; c < spec.cols; c++) {
        var p = spec.at(r, c);
        V.push(p && isFinite(p[2]) ? { x: p[0], y: p[1], v: p[2], z: spec.zOf(p[2]) } : null);
      }
    }
    function idx(r, c) { return r * spec.cols + c; }

    function draw() {
      raf = 0;
      if (!resize()) return;
      ctx.clearRect(0, 0, W, H);
      if (!spec || !V.length) return;
      var dk = dark();
      var ink = dk ? '226,232,240' : '34,25,15', muted = dk ? 'rgba(148,163,184,.9)' : 'rgba(58,42,24,.78)';
      var ext = spec.extent || 1, S = Math.min(W / 2, H / 1.7) / (ext * 1.45), CX = W / 2, CY = H * 0.54;
      function P(x, y, z) { var q = AMO3D.project(view, x, y, z); return [CX + S * q[0], CY - S * q[1], q[2]]; }

      // reference ring at z = 0 (drawn first; the surface paints over the parts it hides)
      if (spec.ring) {
        ctx.beginPath();
        for (var k = 0; k <= 96; k++) { var t = k / 96 * 2 * Math.PI, q = P(spec.ring * Math.cos(t), spec.ring * Math.sin(t), 0); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        ctx.strokeStyle = 'rgba(' + ink + ',.35)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      }

      scr = V.map(function (p) { return p ? P(p.x, p.y, p.z) : null; });
      var quads = [], cmax = spec.wrapCols ? spec.cols : spec.cols - 1;
      for (var r = 0; r < spec.rows - 1; r++) for (var c = 0; c < cmax; c++) {
        var c2 = (c + 1) % spec.cols, a = idx(r, c), b = idx(r, c2), d = idx(r + 1, c2), e = idx(r + 1, c);
        if (!V[a] || !V[b] || !V[d] || !V[e]) continue;
        quads.push({ r: r, c: c, k: [a, b, d, e], depth: (scr[a][2] + scr[b][2] + scr[d][2] + scr[e][2]) / 4 });
      }
      quads.sort(function (m, n) { return m.depth - n.depth; });
      var L = [-0.45, 0.35, 0.82], Ln = Math.hypot(L[0], L[1], L[2]); L = [L[0] / Ln, L[1] / Ln, L[2] / Ln];
      var we = spec.wireEvery || 0, wire = dk ? 'rgba(15,23,42,.45)' : 'rgba(34,25,15,.28)';
      quads.forEach(function (q) {
        var A = V[q.k[0]], B = V[q.k[1]], D = V[q.k[2]], E = V[q.k[3]];
        // normal from the two diagonals (lab frame, z up)
        var u = [D.x - A.x, D.y - A.y, D.z - A.z], w = [E.x - B.x, E.y - B.y, E.z - B.z];
        var n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], nl = Math.hypot(n[0], n[1], n[2]) || 1;
        if (n[2] < 0) nl = -nl;                                     // face up
        var lam = Math.abs((n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / nl), sh = 0.62 + 0.38 * lam;
        var col = spec.colorOf((A.v + B.v + D.v + E.v) / 4);
        var rgb = 'rgb(' + Math.round(col[0] * sh) + ',' + Math.round(col[1] * sh) + ',' + Math.round(col[2] * sh) + ')';
        ctx.beginPath();
        ctx.moveTo(scr[q.k[0]][0], scr[q.k[0]][1]); ctx.lineTo(scr[q.k[1]][0], scr[q.k[1]][1]);
        ctx.lineTo(scr[q.k[2]][0], scr[q.k[2]][1]); ctx.lineTo(scr[q.k[3]][0], scr[q.k[3]][1]); ctx.closePath();
        ctx.fillStyle = rgb; ctx.fill(); ctx.strokeStyle = rgb; ctx.lineWidth = 0.7; ctx.stroke();
        if (we) {
          ctx.strokeStyle = wire; ctx.lineWidth = 0.6; ctx.beginPath();
          if (q.r % we === 0) { ctx.moveTo(scr[q.k[0]][0], scr[q.k[0]][1]); ctx.lineTo(scr[q.k[1]][0], scr[q.k[1]][1]); }
          if (q.c % we === 0) { ctx.moveTo(scr[q.k[0]][0], scr[q.k[0]][1]); ctx.lineTo(scr[q.k[3]][0], scr[q.k[3]][1]); }
          ctx.stroke();
        }
      });

      ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      if (spec.pole) {                                          // reference height (e.g. the unaberrated peak)
        var p0 = P(0, 0, 0), p1 = P(0, 0, spec.pole.z);
        ctx.strokeStyle = 'rgba(' + ink + ',.55)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(p1[0] - 6, p1[1]); ctx.lineTo(p1[0] + 6, p1[1]); ctx.stroke();
        if (spec.pole.label) { ctx.fillStyle = muted; ctx.textBaseline = 'middle'; ctx.fillText(spec.pole.label, p1[0] + 9, p1[1]); ctx.textBaseline = 'top'; }
      }
      if (spec.caption) {
        ctx.fillStyle = muted;
        var parts = spec.caption.split(' · '), line = '', y0 = 10;
        parts.forEach(function (part, k) {
          var tryL = line ? line + ' · ' + part : part;
          if (line && ctx.measureText(tryL).width > W - 20) { ctx.fillText(line, 10, y0); y0 += 14; line = part; } else line = tryL;
        });
        if (line) ctx.fillText(line, 10, y0);
      }
      if (hover >= 0 && V[hover] && scr[hover]) {
        var s = scr[hover];
        ctx.fillStyle = dk ? '#f8fafc' : '#1c1917'; ctx.strokeStyle = dk ? '#0f172a' : '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s[0], s[1], 4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        if (spec.readout) {
          var txt = spec.readout(Math.floor(hover / spec.cols), hover % spec.cols, V[hover].v);
          ctx.textBaseline = 'bottom'; ctx.fillStyle = 'rgb(' + ink + ')'; ctx.fillText(txt, 10, H - 8);
        }
      }
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(draw); }

    function pick(ev) {                                      // front-most vertex within 10 px of the pointer
      var b = canvas.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top, best = -1, bz = -1e9;
      for (var i = 0; i < scr.length; i++) {
        var s = scr[i]; if (!s || Math.hypot(s[0] - x, s[1] - y) > 10) continue;
        if (s[2] > bz) { bz = s[2]; best = i; }
      }
      return best;
    }
    canvas.addEventListener('pointermove', function (e) {
      if (e.buttons) return;
      var i = pick(e); if (i !== hover) { hover = i; schedule(); }
    });
    canvas.addEventListener('pointerleave', function () { if (hover >= 0) { hover = -1; schedule(); } });
    view.onChange(schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(canvas);
    new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return {
      set: function (s) { spec = s; hover = -1; build(); schedule(); },
      view: view,
      redraw: schedule
    };
  };
})();
