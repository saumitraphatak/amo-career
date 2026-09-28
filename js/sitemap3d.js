/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — sitemap3d.js: the whole site as a rotatable
   constellation (start-here.html only).

   Built entirely from start-here's own markup at load:
     • nodes  = every .see-also-card inside the four category sections
                (#build, #trap-image-cool, #quantum-computing, #career),
                in the page's recommended order;
     • paths  = every .path-card (its .path-step links, in order).
   So the constellation can never list a page the directory doesn't.

   Layout: one cluster per category on a horizontal ring (alternately
   raised and lowered); inside a cluster the pages sit on a small
   circle in reading order, joined by a faint "reading order" thread. Guided paths are
   drawn as coloured arcs; choosing a path lights it up and dims the rest.
   Hover names a page; click opens it. The lists below remain the
   accessible version. Slow turn with a pause button (WCAG 2.2.2), still
   under prefers-reduced-motion, paused offscreen.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var AMO3D = window.AMO3D = window.AMO3D || {};

  var CATS = [
    { id: 'build',             name: 'Build',               dark: '#fbbf24', light: '#b45309', at: [1.25, 0, 0.3] },
    { id: 'trap-image-cool',   name: 'Trap, Image & Cool',  dark: '#34d399', light: '#047857', at: [0, 1.25, -0.3] },
    { id: 'quantum-computing', name: 'Quantum Computing',   dark: '#a78bfa', light: '#6d28d9', at: [-1.25, 0, 0.3] },
    { id: 'career',            name: 'Career & Literature', dark: '#f472b6', light: '#be185d', at: [0, -1.25, -0.3] }
  ];
  var PATH_COLORS = ['#38bdf8', '#f97316', '#22c55e', '#e879f9', '#facc15', '#f43f5e'];

  function norm(v) { var n = Math.hypot(v[0], v[1], v[2]); return [v[0] / n, v[1] / n, v[2] / n]; }
  function file(href) { return (href || '').split('#')[0].split('/').pop(); }

  function readSite(doc) {
    var nodes = [], byFile = {};
    CATS.forEach(function (cat, ci) {
      var sec = doc.getElementById(cat.id); if (!sec) return;
      var cards = Array.prototype.slice.call(sec.querySelectorAll('.see-also-card'));
      // clusters sit on a horizontal ring (alternately raised/lowered); inside a cluster the pages
      // run round a small circle facing outward (horizontal tangent e1, vertical e2), in reading order
      var c = cat.at, n = cards.length;
      var e1 = norm([-c[1], c[0], 0]), e2 = [0, 0, 1];
      cards.forEach(function (a, k) {
        var ang = Math.PI / 2 - (n > 1 ? k / n : 0) * 6.2832, rad = 0.42;
        var p = [0, 1, 2].map(function (i) { return c[i] + rad * (Math.cos(ang) * e1[i] + Math.sin(ang) * e2[i]); });
        var node = {
          cat: ci, order: k + 1, href: a.getAttribute('href'), file: file(a.getAttribute('href')),
          name: ((a.querySelector('.see-also-name') || {}).textContent || '').trim(),
          desc: ((a.querySelector('.see-also-desc') || {}).textContent || '').trim(),
          icon: ((a.querySelector('.see-also-icon') || {}).textContent || '').trim(),
          p: p, paths: []
        };
        nodes.push(node); byFile[node.file] = node;
      });
    });
    var paths = [];
    doc.querySelectorAll('.path-card').forEach(function (card, pi) {
      var steps = [];
      card.querySelectorAll('.path-step[href]').forEach(function (s) { var nd = byFile[file(s.getAttribute('href'))]; if (nd) steps.push(nd); });
      var title = ((card.querySelector('.path-title') || {}).textContent || '').trim();
      if (steps.length > 1) {
        paths.push({ id: card.id, title: title, steps: steps, color: PATH_COLORS[pi % PATH_COLORS.length] });
        steps.forEach(function (nd) { if (nd.paths.indexOf(title) < 0) nd.paths.push(title); });
      }
    });
    return { nodes: nodes, paths: paths };
  }
  AMO3D.readSiteMap = readSite;

  AMO3D.siteConstellation = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var data = readSite(document);
    if (!data.nodes.length) return null;
    var root = document.documentElement;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var view = AMO3D.orbit(canvas, { az: 0.39, el: 0.42, label: opts.label || 'Constellation of every page on the site' });
    var W = 0, H = 0, S = 1, CX = 0, CY = 0, active = null, hover = null;

    var host = canvas.parentElement;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var tip = document.createElement('div'); tip.className = 'const3d-tip'; tip.hidden = true; host.appendChild(tip);

    function dark() { return root.getAttribute('data-theme') === 'dark'; }
    function catCol(ci) { return dark() ? CATS[ci].dark : CATS[ci].light; }
    function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min((W / 2 - 24) / 1.7, (H / 2 - 24) / 1.3); CX = W / 2; CY = H / 2 + 10;
      return true;
    }
    function P(v) { var q = AMO3D.project(view, v[0], v[1], v[2]); return [CX + S * q[0], CY - S * q[1], q[2]]; }
    // arc between two nodes: quadratic Bézier bowed toward the centre so paths read as "crossing over"
    function arc(a, b, bow) {
      var m = [(a[0] + b[0]) / 2 * bow, (a[1] + b[1]) / 2 * bow, (a[2] + b[2]) / 2 * bow], pts = [];
      for (var i = 0; i <= 16; i++) {
        var t = i / 16, u = 1 - t;
        pts.push(P([u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1], u * u * a[2] + 2 * u * t * m[2] + t * t * b[2]]));
      }
      return pts;
    }

    var screen = [];
    function draw() {
      if (!W && !resize()) return;
      var D = dark(), txt = D ? '#e2e8f0' : '#22190f', muted = D ? 'rgba(148,163,184,0.9)' : 'rgba(58,42,24,0.75)';
      ctx.clearRect(0, 0, W, H);

      // reading-order thread inside each category
      CATS.forEach(function (c, ci) {
        var list = data.nodes.filter(function (n) { return n.cat === ci; });
        ctx.strokeStyle = rgba(catCol(ci), active ? 0.12 : 0.35); ctx.lineWidth = 1.2;
        ctx.beginPath();
        list.forEach(function (n, i) { var p = P(n.p); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
        ctx.stroke();
      });

      // guided paths
      data.paths.forEach(function (pa) {
        var on = !active || active === pa.id;
        ctx.strokeStyle = rgba(pa.color, on ? (active ? 0.95 : 0.45) : 0.07); ctx.lineWidth = active === pa.id ? 2.6 : 1.4;
        for (var i = 0; i < pa.steps.length - 1; i++) {
          var pts = arc(pa.steps[i].p, pa.steps[i + 1].p, 0.55);
          ctx.beginPath(); pts.forEach(function (p, j) { j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
          if (active === pa.id) {           // arrowhead at the end of each hop
            var e = pts[16], f = pts[13], ang = Math.atan2(e[1] - f[1], e[0] - f[0]);
            ctx.fillStyle = pa.color; ctx.beginPath(); ctx.moveTo(e[0], e[1]);
            ctx.lineTo(e[0] - 9 * Math.cos(ang - 0.4), e[1] - 9 * Math.sin(ang - 0.4));
            ctx.lineTo(e[0] - 9 * Math.cos(ang + 0.4), e[1] - 9 * Math.sin(ang + 0.4)); ctx.fill();
          }
        }
      });

      // category labels
      CATS.forEach(function (c, ci) {
        var p = P([c.at[0], c.at[1], c.at[2] + 0.62]);
        ctx.globalAlpha = p[2] < -0.3 ? 0.45 : 1;
        ctx.fillStyle = catCol(ci); ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var hw = ctx.measureText(c.name).width / 2 + 4;
        ctx.fillText(c.name, Math.max(hw, Math.min(W - hw, p[0])), Math.max(12, p[1]));
        ctx.globalAlpha = 1;
      });

      // nodes, back to front
      var act = active && data.paths.filter(function (p) { return p.id === active; })[0];
      var list = data.nodes.map(function (n) { var p = P(n.p); return { n: n, x: p[0], y: p[1], d: p[2] }; }).sort(function (a, b) { return a.d - b.d; });
      screen = [];
      list.forEach(function (m) {
        var n = m.n, inAct = act && act.steps.indexOf(n) >= 0, depth = 0.55 + 0.45 * (m.d + 1.2) / 2.4;
        var r = (inAct ? 7.5 : 5.5) * (0.8 + 0.25 * depth), col = catCol(n.cat);
        ctx.globalAlpha = act && !inAct ? 0.25 : Math.min(1, depth + 0.1);
        if (D) {
          var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 3);
          g.addColorStop(0, rgba(col, 0.5)); g.addColorStop(1, rgba(col, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, r * 3, 0, 6.2832); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, 6.2832); ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = 1.2; ctx.strokeStyle = D ? 'rgba(2,8,15,0.9)' : 'rgba(255,255,255,0.95)'; ctx.stroke();
        if (inAct || (hover && hover.n === n)) {
          var step = inAct ? act.steps.indexOf(n) + 1 : 0;
          ctx.globalAlpha = 1; ctx.fillStyle = txt; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          var lbl = (step ? step + '. ' : '') + n.name, lw = ctx.measureText(lbl).width;
          if (m.x + r + 6 + lw > W - 4) { ctx.textAlign = 'right'; ctx.fillText(lbl, m.x - r - 6, m.y); }
          else ctx.fillText(lbl, m.x + r + 6, m.y);
        }
        ctx.globalAlpha = 1;
        screen.push({ x: m.x, y: m.y, r: r + 4, d: m.d, n: n });
      });
      if (!act) {
        ctx.fillStyle = muted; ctx.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace'; ctx.textAlign = 'left';
        ctx.fillText(data.nodes.length + ' pages · ' + data.paths.length + ' guided paths', 10, H - 12);
      }
    }

    /* ── hover / click ── */
    function hit(ev) {
      var r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = null, bs = -1e9;
      screen.forEach(function (s) { var d = Math.hypot(s.x - x, s.y - y); if (d <= s.r) { var sc = s.d * 3 - d * 0.2; if (sc > bs) { bs = sc; best = s; } } });
      return best;
    }
    function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
    function showTip(s, pin) {
      var n = s.n;
      tip.innerHTML = '<div class="const3d-head" style="color:' + catCol(n.cat) + '">' + esc(CATS[n.cat].name) + ' · ' + String(n.order).padStart(2, '0') + '</div>' +
        '<b>' + esc(n.icon + ' ' + n.name) + '</b><small>' + esc(n.desc) + '</small>' +
        (n.paths.length ? '<div class="const3d-paths">On: ' + n.paths.map(esc).join(' · ') + '</div>' : '') +
        (pin ? '<a class="const3d-go" href="' + esc(n.href) + '">Open page →</a>' : '<div class="const3d-hint">click to open</div>');
      tip.hidden = false; tip.classList.toggle('pinned', !!pin);
      var cr = canvas.getBoundingClientRect(), hr = host.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = s.x + (cr.left - hr.left) + 14, y = s.y + (cr.top - hr.top) - 12;
      if (x + tw > host.clientWidth - 4) x = s.x + (cr.left - hr.left) - tw - 14;
      tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, Math.min(y, host.clientHeight - th - 4)) + 'px';
    }
    function hideTip() { tip.hidden = true; pinned = null; }
    var pinned = null, down = null;
    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; interacted(); });
    canvas.addEventListener('pointerup', function (e) {
      if (!down) return;
      var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 5) return;
      var s = hit(e);
      if (!s) { hideTip(); hover = null; draw(); return; }
      if (e.pointerType === 'mouse') { window.location.href = s.n.href; return; }
      pinned = s; hover = s; showTip(s, true); draw();          // touch: first tap shows the card with a link
    });
    canvas.addEventListener('pointermove', function (e) {
      if (pinned || e.pointerType === 'touch') return;
      var s = hit(e);
      canvas.style.cursor = s ? 'pointer' : '';
      if (s) { if (!hover || hover.n !== s.n) { hover = s; showTip(s, false); draw(); } interacted(); }
      else if (hover) { hover = null; hideTip(); draw(); }
    });
    canvas.addEventListener('pointerleave', function () { if (!pinned && hover) { hover = null; hideTip(); draw(); } });
    document.addEventListener('pointerdown', function (e) { if (pinned && !host.contains(e.target)) { hideTip(); hover = null; draw(); } });

    /* ── slow turn + pause ── */
    var paused = !!reduced, userIdleAt = 0, raf = 0, last = 0, visible = true;
    var pauseBtn = opts.pauseButton || null;
    function syncBtn() {
      if (!pauseBtn) return;
      pauseBtn.hidden = !!reduced;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.textContent = paused ? '▶ Turn' : '❚❚ Stop turning';
    }
    if (pauseBtn) pauseBtn.addEventListener('click', function () { paused = !paused; syncBtn(); kick(); });
    syncBtn();
    function interacted() { userIdleAt = performance.now() + 6000; }
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      var moving = !paused && now > userIdleAt && !hover && !pinned;
      if (moving) view.az += 0.12 * dt;
      draw();
      if (moving && visible && !document.hidden) raf = requestAnimationFrame(frame);
      else { last = 0; if (!paused && visible && !document.hidden) setTimeout(kick, 1000); }
    }
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    view.onChange(function () { interacted(); if (!raf) requestAnimationFrame(function () { draw(); if (pinned) showTip(pinned, true); }); });

    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    else window.addEventListener('resize', function () { if (resize()) draw(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }, { threshold: 0.05 }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    new MutationObserver(function () { draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    resize(); draw(); kick();
    return {
      data: data, view: view, redraw: draw,
      setPath: function (id) { active = id || null; hover = null; hideTip(); draw(); }
    };
  };

  if (!document.getElementById('const3d-style')) {
    var st = document.createElement('style'); st.id = 'const3d-style';
    st.textContent =
      '.const3d-tip{position:absolute;z-index:5;max-width:280px;background:var(--bg-card);border:1px solid var(--border-med);border-radius:10px;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.25);padding:9px 11px;font-size:.8rem;line-height:1.4;color:var(--text-primary);pointer-events:none}' +
      '.const3d-tip.pinned{pointer-events:auto}' +
      '.const3d-tip b{display:block;margin:2px 0 3px}' +
      '.const3d-tip small{display:block;color:var(--text-muted);font-size:.74rem}' +
      '.const3d-head{font-family:var(--font-mono);font-size:.64rem;text-transform:uppercase;letter-spacing:.05em}' +
      '.const3d-paths{margin-top:5px;font-size:.7rem;color:var(--text-secondary)}' +
      '.const3d-hint{color:var(--text-muted);font-size:.68rem;margin-top:4px}' +
      '.const3d-go{display:inline-block;margin-top:7px;font-size:.76rem;font-weight:600;color:var(--c-atom);text-decoration:none}';
    document.head.appendChild(st);
  }
})();
