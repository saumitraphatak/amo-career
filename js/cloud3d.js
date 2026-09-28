/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — cloud3d.js: a rotatable 3D view of released atoms
   (release-recapture.html, tof-calculator.html).

   The pages do the physics and hand this renderer positions in metres:
     cloud.render({
       points:   [{ x, y, z, k }],   // k: 'in' | 'out' | a 0…1 number (speed)
       center:   [x, y, z],          // metres; the view is centred here
       halfSpan: metres,             // half-width of the drawn region
       beam:     { w0, zR } | null,  // Gaussian-beam envelope along z (tweezer)
       gravity:  true | false,       // draw the g arrow (−z)
       marker:   [x, y, z] | null,   // optional cross, e.g. the release point
       caption:  'text'              // top-left, in the canvas
     });
   Lab frame: z up (gravity along −z). Isotropic scale, so shapes are
   true to scale in all three directions. Rotation via AMO3D.orbit
   (js/orbit3d.js). Nothing animates here — the page decides when to
   call render(), so the page owns pause / reduced-motion behaviour.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var AMO3D = window.AMO3D = window.AMO3D || {};

  function nice(x) {                                   // 1, 2, 5 × 10^n just below x
    var p = Math.pow(10, Math.floor(Math.log10(x))), m = x / p;
    return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
  }
  function fmtLen(m) {
    if (m >= 1e-3) return +(m * 1e3).toPrecision(3) + ' mm';
    if (m >= 1e-6) return +(m * 1e6).toPrecision(3) + ' μm';
    return +(m * 1e9).toPrecision(3) + ' nm';
  }
  AMO3D.fmtLen = fmtLen;

  AMO3D.atomCloud = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var root = document.documentElement;
    var view = AMO3D.orbit(canvas, { az: opts.az != null ? opts.az : 0.5, el: opts.el != null ? opts.el : 0.22,
      label: opts.label || 'Rotatable 3D view of the atoms' });
    var W = 0, H = 0, R = 1, CX = 0, CY = 0, last = null;

    function pal() {
      return root.getAttribute('data-theme') === 'dark'
        ? { dark: true, inC: '74,222,128', outC: '248,113,113', beam: '34,211,238', grid: 'rgba(148,163,184,0.16)', text: '#e2e8f0', muted: 'rgba(148,163,184,0.9)', g: '#fbbf24', slow: [96, 165, 250], fast: [251, 146, 60] }
        : { dark: false, inC: '21,128,61', outC: '220,38,38', beam: '8,145,178', grid: 'rgba(58,42,24,0.14)', text: '#22190f', muted: 'rgba(58,42,24,0.75)', g: '#b45309', slow: [29, 78, 216], fast: [194, 65, 12] };
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) / 2 * 0.86; CX = W / 2; CY = H / 2;
      return true;
    }

    function draw() {
      if (!last) return;
      if (!W && !resize()) return;
      var st = last, C = pal(), c0 = st.center || [0, 0, 0], hs = st.halfSpan, k;
      function P(x, y, z) { var q = AMO3D.project(view, (x - c0[0]) / hs, (y - c0[1]) / hs, (z - c0[2]) / hs); return [CX + R * q[0], CY - R * q[1], q[2]]; }
      ctx.clearRect(0, 0, W, H);

      // floor grid at the bottom of the region (depth cue)
      var zf = c0[2] - hs, n = 6;
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      for (k = 0; k <= n; k++) {
        var u = -hs + 2 * hs * k / n, a = P(c0[0] + u, c0[1] - hs, zf), b = P(c0[0] + u, c0[1] + hs, zf);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        a = P(c0[0] - hs, c0[1] + u, zf); b = P(c0[0] + hs, c0[1] + u, zf);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }

      // tweezer beam envelope w(z) = w0·√(1 + (z/zR)²) along z through the origin
      if (st.beam) {
        var w0 = st.beam.w0, zR = st.beam.zR, z0 = c0[2] - hs, z1 = c0[2] + hs;
        function wz(z) { return w0 * Math.sqrt(1 + (z / zR) * (z / zR)); }
        ctx.strokeStyle = 'rgba(' + C.beam + ',0.5)'; ctx.lineWidth = 1.1;
        for (k = 0; k < 8; k++) {                     // meridians of the 1/e² surface
          var ph = k / 8 * 6.2832; ctx.beginPath();
          for (var j = 0; j <= 40; j++) {
            var z = z0 + (z1 - z0) * j / 40, w = Math.min(wz(z), hs * 1.4), p = P(w * Math.cos(ph), w * Math.sin(ph), z);
            j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
          }
          ctx.stroke();
        }
        [0, zR, -zR].forEach(function (zz, i) {        // waist + Rayleigh-range rings
          if (zz < z0 || zz > z1) return;
          ctx.strokeStyle = 'rgba(' + C.beam + ',' + (i ? 0.35 : 0.8) + ')'; ctx.beginPath();
          for (var j = 0; j <= 48; j++) { var a2 = j / 48 * 6.2832, w2 = wz(zz), p2 = P(w2 * Math.cos(a2), w2 * Math.sin(a2), zz); j ? ctx.lineTo(p2[0], p2[1]) : ctx.moveTo(p2[0], p2[1]); }
          ctx.stroke();
        });
        var lb = P(wz(0) * 1.2, 0, 0);
        ctx.fillStyle = 'rgba(' + C.beam + ',0.95)'; ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('tweezer waist', lb[0] + 6, lb[1]);
      }

      // atoms, back to front
      var pts = st.points.map(function (q) { var p = P(q.x, q.y, q.z); return [p[0], p[1], p[2], q.k]; })
        .filter(function (p) { return p[0] > -10 && p[0] < W + 10 && p[1] > -10 && p[1] < H + 10; })
        .sort(function (a, b) { return a[2] - b[2]; });
      var big = pts.length < 300;
      pts.forEach(function (p) {
        var depth = 0.55 + 0.45 * Math.max(0, Math.min(1, (p[2] + 1) / 2)), col;
        if (p[3] === 'in') col = 'rgba(' + C.inC + ',' + (0.9 * depth).toFixed(2) + ')';
        else if (p[3] === 'out') col = 'rgba(' + C.outC + ',' + (0.75 * depth).toFixed(2) + ')';
        else {
          var t = Math.max(0, Math.min(1, p[3]));
          col = 'rgba(' + C.slow.map(function (v, i) { return Math.round(v + (C.fast[i] - v) * t); }).join(',') + ',' + (0.8 * depth).toFixed(2) + ')';
        }
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], (big ? 3 : 1.9) * (0.75 + 0.35 * depth), 0, 6.2832); ctx.fill();
      });

      // release point marker (lab frame)
      if (st.marker) {
        var mk = P(st.marker[0], st.marker[1], st.marker[2]);
        ctx.strokeStyle = C.text; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(mk[0] - 6, mk[1]); ctx.lineTo(mk[0] + 6, mk[1]); ctx.moveTo(mk[0], mk[1] - 6); ctx.lineTo(mk[0], mk[1] + 6); ctx.stroke();
        ctx.fillStyle = C.muted; ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(st.markerLabel || 'release point', mk[0] + 9, mk[1]);
      }

      // gravity arrow: anchored at the left edge, pointing along the projected −z direction
      if (st.gravity) {
        var q0 = AMO3D.project(view, 0, 0, 0), q1 = AMO3D.project(view, 0, 0, -1);
        var dx = q1[0] - q0[0], dy = -(q1[1] - q0[1]), dl = Math.hypot(dx, dy) || 1, L = 46;
        var ga = [28, H / 2 - L / 2 * dy / dl], gb = [ga[0] + L * dx / dl, ga[1] + L * dy / dl];
        ctx.strokeStyle = C.g; ctx.fillStyle = C.g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ga[0], ga[1]); ctx.lineTo(gb[0], gb[1]); ctx.stroke();
        var an = Math.atan2(gb[1] - ga[1], gb[0] - ga[0]);
        ctx.beginPath(); ctx.moveTo(gb[0], gb[1]); ctx.lineTo(gb[0] - 8 * Math.cos(an - 0.45), gb[1] - 8 * Math.sin(an - 0.45));
        ctx.lineTo(gb[0] - 8 * Math.cos(an + 0.45), gb[1] - 8 * Math.sin(an + 0.45)); ctx.fill();
        ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('g', ga[0] + 8, ga[1] + 4);
      }

      // scale bar (screen space; length is true for lines parallel to the screen)
      var sb = nice(hs * 0.5), px = sb / hs * R;
      ctx.strokeStyle = C.text; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W - 14 - px, H - 14); ctx.lineTo(W - 14, H - 14);
      ctx.moveTo(W - 14 - px, H - 18); ctx.lineTo(W - 14 - px, H - 10); ctx.moveTo(W - 14, H - 18); ctx.lineTo(W - 14, H - 10); ctx.stroke();
      ctx.fillStyle = C.text; ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText(fmtLen(sb), W - 14, H - 20);

      if (st.caption) {
        ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        String(st.caption).split('\n').forEach(function (line, i) { ctx.fillText(line, 10, 10 + i * 15); });
      }
    }

    view.onChange(function () { requestAnimationFrame(draw); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    else window.addEventListener('resize', function () { if (resize()) draw(); });
    new MutationObserver(function () { draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    resize();

    return { render: function (st) { last = st; draw(); }, view: view, redraw: draw };
  };
})();
