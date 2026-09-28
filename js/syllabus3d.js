/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — syllabus3d.js: the Paper Roadmap as a rotatable
   "time tower".

   Height  = publication year (the last 19xx/20xx year in the citation).
   Faces   = the four career-stage tabs (Undergrad, Grad Y1, Advanced
             Grad, Postdoc) — each stage owns a 90° sector.
   Within a sector, papers are spread by their number on the page, so
   the reading order runs left → right across each face.

   Everything is read from the page's own .paper-card elements at load,
   so the tower can never disagree with the list below it.
   Rotation uses the shared AMO3D.orbit (js/orbit3d.js must load first).
   Slow auto-turn with a pause button (WCAG 2.2.2); off under
   prefers-reduced-motion; paused while offscreen.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  window.AMO3D = window.AMO3D || {};

  var STAGES = [
    { key: 'undergrad', short: 'Undergrad', dark: '#38bdf8', light: '#0369a1' },
    { key: 'grad1',     short: 'Grad year 1', dark: '#34d399', light: '#047857' },
    { key: 'gradAdv',   short: 'Advanced grad', dark: '#a78bfa', light: '#6d28d9' },
    { key: 'postdoc',   short: 'Postdoc', dark: '#fb923c', light: '#c2410c' }
  ];
  var Y0 = 1966, Y1 = 2030;                    // tower spans these years (bottom → top)
  var RING = 1.05, NODE_R = 0.96, TOP = 1.3;   // ring radius, paper radius, half-height

  function zOf(year) { return -TOP + 2 * TOP * (year - Y0) / (Y1 - Y0); }

  function readPapers(root) {
    var out = [];
    (root || document).querySelectorAll('.tab-panel[data-group="stages"] .paper-card').forEach(function (card) {
      var panel = card.closest('.tab-panel'), stage = panel && panel.dataset.tab;
      var si = STAGES.findIndex(function (s) { return s.key === stage; });
      var cit = (card.querySelector('.paper-citation') || {}).textContent || '';
      var yrs = cit.match(/\b(19|20)\d{2}\b/g);
      if (si < 0 || !yrs) return;
      var titleEl = card.querySelector('.paper-title'), tagEl = titleEl && titleEl.querySelector('.paper-tag');
      var title = '';
      if (titleEl) titleEl.childNodes.forEach(function (n) { if (n !== tagEl) title += n.textContent; });
      var tag = tagEl ? ((tagEl.className.match(/tag-(\w+)/) || [])[1] || 'other') : 'other';
      out.push({
        card: card, stage: si, year: +yrs[yrs.length - 1],
        num: ((card.querySelector('.paper-num') || {}).textContent || '').trim(),
        title: title.replace(/\s+/g, ' ').trim(), cit: cit.replace(/\s+/g, ' ').trim(),
        tag: tag, tagLabel: tagEl ? tagEl.textContent.trim() : ''
      });
    });
    // spread each stage's papers across its sector in page order
    STAGES.forEach(function (s, si) {
      var list = out.filter(function (p) { return p.stage === si; }), n = list.length;
      list.forEach(function (p, k) {
        var a = (si * 90 + 45 - 36 + (n > 1 ? 72 * k / (n - 1) : 36)) * Math.PI / 180;
        p.x = NODE_R * Math.cos(a); p.y = NODE_R * Math.sin(a); p.z = zOf(p.year);
      });
    });
    return out;
  }

  AMO3D.syllabusTower = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var papers = readPapers(opts.root);
    if (!papers.length) return null;
    var root = document.documentElement;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // default view: looking slightly down, Undergrad face to the front-left
    var view = AMO3D.orbit(canvas, { az: -0.35, el: 0.3, minEl: -0.15, maxEl: 1.35,
      label: opts.label || 'Rotatable time tower of the papers', hintParent: opts.hintParent });
    var W = 0, H = 0, S = 1, CX = 0, CY = 0, dpr = 1, filter = null;

    var host = canvas.parentElement;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var tip = document.createElement('div');
    tip.className = 'tower3d-tip'; tip.hidden = true;
    host.appendChild(tip);

    function dark() { return root.getAttribute('data-theme') === 'dark'; }
    function col(si) { return dark() ? STAGES[si].dark : STAGES[si].light; }
    function pal() {
      return dark()
        ? { ring: '148,163,184', text: '#cbd5e1', muted: 'rgba(148,163,184,0.85)', spine: 'rgba(148,163,184,0.35)', edge: 'rgba(2,8,15,0.9)' }
        : { ring: '58,42,24', text: '#22190f', muted: 'rgba(58,42,24,0.7)', spine: 'rgba(58,42,24,0.3)', edge: 'rgba(255,255,255,0.95)' };
    }
    function rgba(hex, a) {
      var n = parseInt(hex.slice(1), 16);
      return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fit: year labels need ~50px on the left; stage labels sit ~0.35 above the top ring
      var ce = Math.cos(0.3), se = Math.sin(0.3);
      S = Math.min((W - 120) / (2 * RING * 1.25), (H - 36) / (2 * TOP * ce + 2 * RING * se + 0.4));
      CX = W / 2 + 22; CY = H / 2 + 12;
      return true;
    }
    function P(x, y, z) { var q = AMO3D.project(view, x, y, z); return [CX + S * q[0], CY - S * q[1], q[2]]; }

    var screen = [];
    function draw() {
      if (!W && !resize()) return;
      var C = pal(), i, k, a, q;
      ctx.clearRect(0, 0, W, H);
      var ce = Math.cos(view.el);

      // decade rings (back half faint, front half stronger) + fixed year labels at the left edge
      ctx.lineWidth = 1;
      for (var yr = 1970; yr <= 2020; yr += 10) {
        var z = zOf(yr);
        for (k = 0; k < 96; k++) {
          var a0 = k / 96 * 6.2832, a1 = (k + 1) / 96 * 6.2832;
          var p0 = P(RING * Math.cos(a0), RING * Math.sin(a0), z), p1 = P(RING * Math.cos(a1), RING * Math.sin(a1), z);
          var back = (p0[2] + p1[2]) / 2 < 0;        // D < 0 → far half of the ring
          ctx.strokeStyle = 'rgba(' + C.ring + ',' + (back ? 0.1 : 0.32) + ')';
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        }
        ctx.fillStyle = C.muted; ctx.font = '600 11px ui-monospace,SFMono-Regular,Menlo,monospace';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(String(yr), CX - S * RING - 10, CY - S * z * ce);
      }

      // spine + lane dividers (vertical edges between the four faces)
      var b = P(0, 0, -TOP), t = P(0, 0, TOP);
      ctx.strokeStyle = C.spine; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.stroke();
      for (k = 0; k < 4; k++) {
        a = k * Math.PI / 2;
        var e0 = P(RING * Math.cos(a), RING * Math.sin(a), zOf(1970)), e1 = P(RING * Math.cos(a), RING * Math.sin(a), zOf(2020));
        ctx.strokeStyle = 'rgba(' + C.ring + ',' + (e0[2] < 0 ? 0.08 : 0.22) + ')';
        ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke(); ctx.setLineDash([]);
      }

      // stage labels above each face
      STAGES.forEach(function (s, si) {
        var ang = (si * 90 + 45) * Math.PI / 180, lp = P(1.02 * Math.cos(ang), 1.02 * Math.sin(ang), TOP + 0.16);
        var n = papers.filter(function (p) { return p.stage === si; }).length;
        ctx.globalAlpha = lp[2] < 0 ? 0.35 : 1;
        ctx.fillStyle = col(si); ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(s.short + ' · ' + n, lp[0], lp[1]);
        ctx.globalAlpha = 1;
      });

      // papers: stems from the spine, then nodes, back to front
      var list = papers.map(function (p) { var s = P(p.x, p.y, p.z); return { p: p, x: s[0], y: s[1], d: s[2] }; })
        .sort(function (m, n) { return m.d - n.d; });
      screen = [];
      list.forEach(function (m) {
        var p = m.p, on = !filter || p.tag === filter, depth = 0.55 + 0.45 * (m.d + 1) / 2;   // d ∈ [-1, 1]
        var c = col(p.stage), sp = P(0, 0, p.z);
        ctx.strokeStyle = rgba(c, (on ? 0.16 : 0.04) * depth); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sp[0], sp[1]); ctx.lineTo(m.x, m.y); ctx.stroke();
        var key = p.tag === 'keystone', r = (key ? 6.2 : 4.3) * (0.8 + 0.2 * depth);
        ctx.globalAlpha = on ? depth : 0.14;
        if (key && on) { ctx.beginPath(); ctx.arc(m.x, m.y, r + 3.2, 0, 6.2832); ctx.strokeStyle = c; ctx.lineWidth = 1.3; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, 6.2832); ctx.fillStyle = c; ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = C.edge; ctx.stroke();
        ctx.globalAlpha = 1;
        if (on) screen.push({ x: m.x, y: m.y, r: r + 3, d: m.d, p: p });
      });
      if (hover && hover.p) ring(hover.p);
    }
    function ring(p) {
      var s = P(p.x, p.y, p.z);
      ctx.beginPath(); ctx.arc(s[0], s[1], 11, 0, 6.2832); ctx.strokeStyle = col(p.stage); ctx.lineWidth = 2; ctx.stroke();
    }

    /* ── hover / click ── */
    var hover = null, pinned = null;
    function hit(ev) {
      var r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = null, bs = -1e9;
      screen.forEach(function (s) {
        var dd = Math.hypot(s.x - x, s.y - y);
        if (dd <= s.r + 4) { var score = s.d * 3 - dd * 0.2; if (score > bs) { bs = score; best = s; } }   // prefer the front-most
      });
      return best;
    }
    function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
    function showTip(s, pin) {
      var p = s.p;
      tip.innerHTML =
        '<div class="tower3d-tip-head"><i style="background:' + col(p.stage) + '"></i>Paper ' + esc(p.num) + ' · ' + esc(STAGES[p.stage].short) +
        (p.tagLabel ? ' · ' + esc(p.tagLabel) : '') + '</div>' +
        '<b>' + esc(p.title) + '</b><small>' + esc(p.cit) + '</small>' +
        (pin ? '<button type="button" class="tower3d-go">Read the note in the list ↓</button>' : '<div class="tower3d-tip-hint">click for the note</div>');
      tip.hidden = false; tip.classList.toggle('pinned', !!pin);
      var cr = canvas.getBoundingClientRect(), hr = host.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = s.x + (cr.left - hr.left) + 16, y = s.y + (cr.top - hr.top) - 12;
      if (x + tw > host.clientWidth - 4) x = s.x + (cr.left - hr.left) - tw - 16;
      tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, Math.min(y, host.clientHeight - th - 4)) + 'px';
      var go = tip.querySelector('.tower3d-go');
      if (go) go.addEventListener('click', function () { hideTip(); openCard(p); });
    }
    function hideTip() { tip.hidden = true; pinned = null; }

    function openCard(p) {
      var btn = document.querySelector('.tab-bar[data-group="stages"] .tab-btn[data-tab="' + STAGES[p.stage].key + '"]');
      if (btn && !btn.classList.contains('active')) btn.click();
      requestAnimationFrame(function () {
        p.card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        p.card.classList.remove('is-highlighted'); void p.card.offsetWidth;
        p.card.classList.add('is-highlighted');
        setTimeout(function () { p.card.classList.remove('is-highlighted'); }, 2600);
        var link = p.card.querySelector('.paper-doi');
        if (link) try { link.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      });
      if (opts.onOpen) opts.onOpen(p);
    }

    var down = null;
    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; interacted(); });
    canvas.addEventListener('pointerup', function (e) {
      if (!down) return;
      var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 5) return;                                   // a drag, not a click
      var s = hit(e);
      if (!s) { hideTip(); return; }
      if (e.pointerType === 'mouse' && pinned === null && hover && hover.p === s.p) { hideTip(); openCard(s.p); return; }
      pinned = s; hover = s; showTip(s, true);                  // touch / pen: first tap shows the card
    });
    canvas.addEventListener('pointermove', function (e) {
      if (pinned || e.pointerType === 'touch') return;
      var s = hit(e);
      canvas.style.cursor = s ? 'pointer' : '';
      if (s) { if (!hover || hover.p !== s.p) { hover = s; showTip(s, false); draw(); } interacted(); }
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
      pauseBtn.textContent = paused ? '▶ Turn tower' : '❚❚ Stop turning';
    }
    if (pauseBtn) pauseBtn.addEventListener('click', function () { paused = !paused; syncBtn(); kick(); });
    syncBtn();
    function interacted() { userIdleAt = performance.now() + 6000; }
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      var moving = !paused && now > userIdleAt && !pinned && !hover;
      if (moving) view.az += 0.16 * dt;
      draw();
      if (moving && visible && !document.hidden) raf = requestAnimationFrame(frame);
      else { last = 0; if (!paused && visible && !document.hidden) setTimeout(kick, 1000); }   // re-check after hover/idle
    }
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    view.onChange(function () {
      interacted();
      if (!raf) requestAnimationFrame(function () { draw(); if (pinned) showTip(pinned, true); });
    });

    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    else window.addEventListener('resize', function () { if (resize()) draw(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }, { threshold: 0.05 }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    new MutationObserver(function () { draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    resize(); draw(); kick();
    return {
      papers: papers, view: view, redraw: draw,
      setFilter: function (tag) { filter = tag || null; hover = null; hideTip(); draw(); }
    };
  };

  if (!document.getElementById('tower3d-style')) {
    var st = document.createElement('style'); st.id = 'tower3d-style';
    st.textContent =
      '.tower3d-tip{position:absolute;z-index:5;max-width:300px;background:var(--bg-card);border:1px solid var(--border-med);border-radius:10px;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.25);padding:9px 11px;font-size:.8rem;line-height:1.4;color:var(--text-primary);pointer-events:none}' +
      '.tower3d-tip.pinned{pointer-events:auto}' +
      '.tower3d-tip b{display:block;margin:2px 0 3px}' +
      '.tower3d-tip small{display:block;color:var(--text-muted);font-size:.72rem}' +
      '.tower3d-tip-head{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:.64rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted)}' +
      '.tower3d-tip-head i{width:9px;height:9px;border-radius:50%;flex-shrink:0}' +
      '.tower3d-tip-hint{color:var(--text-muted);font-size:.68rem;margin-top:4px}' +
      '.tower3d-go{margin-top:7px;font:inherit;font-size:.74rem;font-weight:600;color:var(--c-atom);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:3px 10px;cursor:pointer}' +
      '.tower3d-go:hover{background:var(--bg-card-hover)}';
    document.head.appendChild(st);
  }
})();
