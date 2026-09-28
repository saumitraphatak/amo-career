/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — cavity3d.js: the TEM₀₀ standing wave of a Fabry–Pérot
   cavity with one atom in it (cavity-qed.html).

   Lab frame: cavity axis = x (mirrors at x = ±1), z up.
   Mode intensity  |E|² ∝ cos²(k x) · exp(−2 r²/w₀²), drawn as nested
   isosurfaces ("beads"). The drawing is SCHEMATIC along the
   axis: a real cavity has 2L/λ antinodes (≈1,300 for 0.5 mm at 780 nm),
   far too many to draw, so a fixed handful is shown and the caption
   gives the real number. Radial scale is w₀.

   Position-dependent coupling (near the waist, z_R ≫ L):
       g(r, x) = g₀ · cos(k x) · exp(−r²/w₀²)       (field amplitude)
       C(r, x) = C  · cos²(k x) · exp(−2 r²/w₀²)
   Rotation via the shared AMO3D.orbit (js/orbit3d.js). Static drawing —
   nothing animates, so no pause control is needed.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var AMO3D = window.AMO3D = window.AMO3D || {};

  var HALF = 1.0;          // mirror half-separation (drawn units)
  var WR = 0.32;           // drawn waist radius w₀
  var NLOBE = 9;           // antinodes drawn (odd: one sits at the centre; nodes at both mirrors)

  AMO3D.cavityMode = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var root = document.documentElement;
    var view = AMO3D.orbit(canvas, { az: 0.42, el: 0.32, label: opts.label || 'Cavity mode and atom' });
    var W = 0, H = 0, S = 1, CX = 0, CY = 0;
    var atom = { axial: 0, radial: 0 };     // axial: 0 = antinode … 1 = node; radial: r/w₀
    var kx = (NLOBE / 2) * Math.PI / HALF;  // cos(kx): antinode at x = 0, NLOBE antinodes, nodes at x = ±HALF

    // Isosurfaces of |E|² = cos²(kx)·exp(−2r²/w₀²) at a few levels ℓ:
    // radius r_ℓ(x) = w₀·√(ln(cos²(kx)/ℓ)/2) where cos²(kx) > ℓ. Drawn as stacked
    // translucent discs, which reads as a string of glowing beads.
    var LEVELS = [[0.08, 0.035], [0.35, 0.06], [0.75, 0.11]];      // [ℓ, alpha per disc]
    var DISCS = [];
    (function () {
      var n = NLOBE * 26;
      for (var i = 0; i <= n; i++) {
        var x = -HALF + 2 * HALF * i / n, c2 = Math.pow(Math.cos(kx * x), 2);
        LEVELS.forEach(function (L, li) { if (c2 > L[0]) DISCS.push({ x: x, r: WR * Math.sqrt(Math.log(c2 / L[0]) / 2), a: L[1], li: li }); });
      }
    })();

    function pal() {
      return root.getAttribute('data-theme') === 'dark'
        ? { mode: '248,113,113', mirror: '148,197,255', edge: 'rgba(148,197,255,0.85)', axis: 'rgba(148,163,184,0.35)', atom: '#fbbf24', text: '#e2e8f0', muted: 'rgba(148,163,184,0.9)' }
        : { mode: '185,28,28', mirror: '37,99,235', edge: 'rgba(29,78,216,0.85)', axis: 'rgba(58,42,24,0.3)', atom: '#b45309', text: '#22190f', muted: 'rgba(58,42,24,0.75)' };
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min((W - 40) / 2.5, (H - 40) / 1.35); CX = W / 2; CY = H / 2;
      return true;
    }
    function P(x, y, z) { var q = AMO3D.project(view, x, y, z); return [CX + S * q[0], CY - S * q[1], q[2]]; }
    function atomPos() {
      var x0 = 0;                                           // the central antinode
      return [x0 + atom.axial * (Math.PI / 2) / kx, 0, atom.radial * WR];
    }

    function mirror(sign, C, front) {
      // a thin disc in the y–z plane at x = ±HALF, radius 0.62, slightly curved (concave toward the centre)
      var R = 0.52, pts = [];
      for (var k = 0; k <= 48; k++) {
        var a = k / 48 * 6.2832, y = R * Math.cos(a), z = R * Math.sin(a);
        pts.push(P(sign * (HALF + 0.06 * (y * y + z * z) / (R * R)), y, z));
      }
      var c = P(sign * HALF, 0, 0);
      if (front !== (c[2] > 0)) return;
      ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.fillStyle = 'rgba(' + C.mirror + ',' + (front ? 0.16 : 0.1) + ')'; ctx.fill();
      ctx.strokeStyle = C.edge; ctx.lineWidth = 1.5; ctx.stroke();
    }

    function draw() {
      if (!W && !resize()) return;
      var C = pal(), k;
      ctx.clearRect(0, 0, W, H);
      mirror(-1, C, false); mirror(1, C, false);

      // optical axis
      var a0 = P(-HALF - 0.2, 0, 0), a1 = P(HALF + 0.2, 0, 0);
      ctx.strokeStyle = C.axis; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke(); ctx.setLineDash([]);

      // 1/e² waist outline (two lines at ±w₀ in the plane facing the viewer)
      ctx.strokeStyle = 'rgba(' + C.mode + ',0.28)';
      [[0, WR], [0, -WR]].forEach(function (o) {
        var b0 = P(-HALF, o[0], o[1]), b1 = P(HALF, o[0], o[1]);
        ctx.beginPath(); ctx.moveTo(b0[0], b0[1]); ctx.lineTo(b1[0], b1[1]); ctx.stroke();
      });

      // mode: discs sorted back to front
      var o = P(0, 0, 0), dirs = [];
      for (k = 0; k < 20; k++) { var t = k / 20 * 6.2832, e = P(0, Math.cos(t), Math.sin(t)); dirs.push([e[0] - o[0], e[1] - o[1]]); }
      var list = DISCS.map(function (d) { var c = P(d.x, 0, 0); return { c: c, d: d }; }).sort(function (m, n) { return m.c[2] - n.c[2]; });
      for (k = 0; k < list.length; k++) {
        var it = list[k], c = it.c, r = it.d.r;
        ctx.beginPath();
        for (var j = 0; j < dirs.length; j++) { var X = c[0] + r * dirs[j][0], Y = c[1] + r * dirs[j][1]; j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + C.mode + ',' + it.d.a + ')'; ctx.fill();
      }

      // atom + its projection onto the axis
      var A = atomPos(), pa = P(A[0], A[1], A[2]), pb = P(A[0], 0, 0);
      ctx.strokeStyle = C.atom; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pb[0], pb[1]); ctx.lineTo(pa[0], pa[1]); ctx.stroke(); ctx.setLineDash([]);
      var g = ctx.createRadialGradient(pa[0], pa[1], 0, pa[0], pa[1], 14);
      g.addColorStop(0, C.atom); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pa[0], pa[1], 14, 0, 6.2832); ctx.fill();
      ctx.fillStyle = C.atom; ctx.beginPath(); ctx.arc(pa[0], pa[1], 4, 0, 6.2832); ctx.fill();
      ctx.fillStyle = C.text; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('atom', pa[0] + 10, pa[1] - 12);

      mirror(-1, C, true); mirror(1, C, true);

      // waist label
      var wl = P(HALF * 0.55, 0, WR);
      ctx.fillStyle = C.muted; ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textAlign = 'center';
      ctx.fillText('w₀', wl[0], wl[1] - 10);
    }

    view.onChange(function () { requestAnimationFrame(draw); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    else window.addEventListener('resize', function () { if (resize()) draw(); });
    new MutationObserver(function () { draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    resize(); draw();

    return {
      setAtom: function (axial, radial) { atom.axial = axial; atom.radial = radial; draw(); },
      // factors relative to an atom on the axis at an antinode
      factors: function () {
        var amp = Math.cos(atom.axial * Math.PI / 2) * Math.exp(-atom.radial * atom.radial);
        return { g: amp, C: amp * amp };
      },
      view: view, redraw: draw, drawnAntinodes: NLOBE
    };
  };
})();
