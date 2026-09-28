/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — vs-photons.js: "Loss budget" for psiquantum-vs-xanadu.html
   (Section 05: photonic fault tolerance is a loss problem).

   A photon passes a chain of components; each transmits it with
   efficiency ηᵢ. Losses compound:  η_total = Π ηᵢ  (the page's formula),
   and a resource state of k photons survives intact with η_total^k.
   Photons are drawn as a Monte Carlo stream: each one is dropped at a
   component with probability 1 − ηᵢ, so the survivor tally converges on
   η_total.

   The only platform number used is the page's own: PsiQuantum's reported
   on-chip detection efficiency, 88.9 %. Everything else starts at 100 %
   and is the reader's to change — no per-component losses are attributed
   to either company. Pause button; no stream under reduced motion.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var V = window.AMOVersus = window.AMOVersus || {};
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var COMPS = [
    { key: 'src', name: 'Source', hint: 'photon made & extracted' },
    { key: 'route', name: 'On-chip routing', hint: 'waveguides, rings, MZIs' },
    { key: 'couple', name: 'Chip-to-chip', hint: 'couplers & connectors' },
    { key: 'fiber', name: 'Fiber link', hint: 'delay lines, interconnect' },
    { key: 'det', name: 'Detector', hint: 'photon registered' }
  ];
  var PRESETS = [
    { label: 'Detection only: 88.9%', note: 'PsiQuantum’s reported on-chip detection efficiency; other stages set lossless', v: { src: 100, route: 100, couple: 100, fiber: 100, det: 88.9 } },
    { label: 'Every stage 99%', v: { src: 99, route: 99, couple: 99, fiber: 99, det: 99 } },
    { label: 'Every stage 97%', v: { src: 97, route: 97, couple: 97, fiber: 97, det: 97 } }
  ];

  V.lossBudget = function (etas, k) { var t = etas.reduce(function (p, e) { return p * e; }, 1); return { total: t, state: Math.pow(t, k) }; };

  V.photonLab = function (mount, opts) {
    opts = opts || {};
    var eta = {}; COMPS.forEach(function (c) { eta[c.key] = PRESETS[0].v[c.key]; });
    var k = 4;
    var box = document.createElement('div'); box.className = 'ph-lab';
    box.style.setProperty('--c', opts.color || 'var(--page)');
    box.innerHTML =
      '<div class="ph-top"><div><h3>Loss budget: follow the photons</h3>' +
      '<p>Every optical stage keeps a photon with some efficiency η, and the losses multiply. Set each stage and watch how many photons make it, and how often a whole multi-photon resource state survives intact.</p></div>' +
      '<button type="button" class="ph-pause" aria-pressed="false">❚❚ Pause photons</button></div>' +
      '<div class="ph-presets" role="group" aria-label="Presets">' + PRESETS.map(function (p, i) { return '<button type="button" data-i="' + i + '"' + (i === 0 ? ' aria-pressed="true"' : ' aria-pressed="false"') + (p.note ? ' title="' + p.note + '"' : '') + '>' + p.label + '</button>'; }).join('') + '</div>' +
      '<div class="ph-stage"><canvas class="ph-cvs" data-export-ready="true" aria-label="Photons travelling through five optical stages; lost photons drop out at the stage that lost them. The numbers are given next to the figure."></canvas></div>' +
      '<div class="ph-sliders">' + COMPS.map(function (c) {
        return '<label class="ph-s"><span><b>' + c.name + '</b><small>' + c.hint + '</small></span><input type="range" min="80" max="100" step="0.1" data-k="' + c.key + '" aria-label="' + c.name + ' efficiency"><output></output></label>';
      }).join('') + '</div>' +
      '<div class="ph-out" aria-live="polite"></div>' +
      '<label class="ph-k"><span>Photons per resource state (illustrative): <b></b></span><input type="range" min="1" max="8" step="1" value="4" aria-label="Photons per resource state"></label>' +
      '<p class="ph-note">η<sub>total</sub> = Π η<sub>i</sub>, as in the formula above; a k-photon resource state survives intact with η<sub>total</sub><sup>k</sup>. The only company figure used is PsiQuantum’s reported 88.9% on-chip detection efficiency (the first preset); no per-stage losses are attributed to either company. Fusion-based designs are built to tolerate losing some photons, which is exactly why this number matters.</p>';
    mount.appendChild(box);
    var cvs = box.querySelector('canvas'), ctx = cvs.getContext('2d'), out = box.querySelector('.ph-out');
    var sliders = box.querySelectorAll('.ph-s input'), kS = box.querySelector('.ph-k input');

    function sync(fromPreset) {
      sliders.forEach(function (s) { if (fromPreset) s.value = eta[s.dataset.k]; s.nextElementSibling.textContent = (+eta[s.dataset.k]).toFixed(1) + '%'; });
      var r = V.lossBudget(COMPS.map(function (c) { return eta[c.key] / 100; }), k);
      box.querySelector('.ph-k b').textContent = k;
      out.innerHTML = '<div><b>' + (100 * r.total).toFixed(1) + '%</b><span>of photons survive the chain</span></div>' +
        '<div><b>' + Math.round(1000 * (1 - r.total)) + '</b><span>lost per 1,000 photons</span></div>' +
        '<div><b>' + (100 * r.state).toFixed(1) + '%</b><span>of ' + k + '-photon resource states arrive complete</span></div>' +
        '<div class="ph-tally"><b>—</b><span>Monte Carlo tally below</span></div>';
      tallyEl = out.querySelector('.ph-tally b'); kept = 0; lost = 0;
    }
    var tallyEl = null, kept = 0;
    sliders.forEach(function (s) {
      s.addEventListener('input', function () {
        eta[s.dataset.k] = +s.value;
        box.querySelectorAll('.ph-presets button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        sync(false);
      });
    });
    kS.addEventListener('input', function () { k = +kS.value; sync(false); });
    box.querySelectorAll('.ph-presets button').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = PRESETS[+b.dataset.i]; COMPS.forEach(function (c) { eta[c.key] = p.v[c.key]; });
        box.querySelectorAll('.ph-presets button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        sync(true);
      });
    });

    /* ── canvas stream ── */
    var W = 0, H = 0, photons = [], acc = 0;
    function resize() { var r = cvs.getBoundingClientRect(); if (r.width < 2) return false; var dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cvs.width = W * dpr; cvs.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return true; }
    function stageX(i) { return 40 + (W - 80) * (i + 0.5) / COMPS.length; }
    function col(v) { return getComputedStyle(box).getPropertyValue(v).trim() || '#be185d'; }
    function draw() {
      if (!W && !resize()) return;
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var c = col('--c'), mid = H / 2 - 6;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = dark ? 'rgba(148,163,184,.35)' : 'rgba(58,42,24,.3)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(18, mid); ctx.lineTo(W - 18, mid); ctx.stroke();
      photons.forEach(function (p) {
        var a = p.dead ? Math.max(0, 1 - p.fall / 40) : 1;
        ctx.globalAlpha = a;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7);
        g.addColorStop(0, p.dead ? (dark ? '#fca5a5' : '#dc2626') : (dark ? '#fde68a' : '#d97706')); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1;
      });
      COMPS.forEach(function (cp, i) {
        var x = stageX(i), bw = Math.min(118, (W - 80) / COMPS.length - 8);
        ctx.fillStyle = dark ? 'rgba(15,23,42,.9)' : 'rgba(255,255,255,.92)';
        ctx.strokeStyle = c; ctx.lineWidth = 1.5;
        roundRect(x - bw / 2, mid - 17, bw, 34, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = dark ? '#e2e8f0' : '#22190f'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(W < 640 ? cp.name.split(' ')[0].replace('On-chip', 'Routing').replace('Chip-to-chip', 'Coupling') : cp.name, x, mid - 3);
        ctx.font = '10px ui-monospace,Menlo,monospace'; ctx.fillStyle = dark ? '#94a3b8' : '#6b5a45';
        ctx.fillText(eta[cp.key].toFixed(1) + '%', x, mid + 10);
      });
      ctx.fillStyle = dark ? '#94a3b8' : '#6b5a45'; ctx.font = '11px ui-monospace,Menlo,monospace'; ctx.textAlign = 'left';
      ctx.fillText('photons in →', 10, H - 10); ctx.textAlign = 'right'; ctx.fillText('→ detected', W - 10, H - 10);
    }
    function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    // Monte Carlo stream; bookkeeping counts each photon once, at the moment it is lost or detected
    var lost = 0;
    function step(dt) {
      var mid = H / 2 - 6;
      acc += dt * 6;
      while (acc >= 1) { acc -= 1; photons.push({ x: 14, y: mid, next: 0, dead: false, fall: 0 }); }
      photons.forEach(function (p) {
        if (p.dead) { p.fall += dt * 60; p.y += dt * 60; return; }
        p.x += dt * 260;
        if (p.next < COMPS.length && p.x >= stageX(p.next)) {
          if (Math.random() * 100 >= eta[COMPS[p.next].key]) { p.dead = true; lost++; }
          p.next++;
        }
        if (!p.dead && p.x > W - 16) { p.done = true; kept++; }
      });
      photons = photons.filter(function (p) { return !p.done && !(p.dead && p.fall > 40); });
      if (tallyEl && kept + lost > 0) tallyEl.textContent = kept + ' of ' + (kept + lost) + ' (' + (100 * kept / (kept + lost)).toFixed(0) + '%)';
    }

    var paused = reduced, raf = 0, last = 0, visible = true;
    var pb = box.querySelector('.ph-pause');
    function syncBtn() { pb.hidden = reduced; pb.setAttribute('aria-pressed', String(paused)); pb.textContent = paused ? '▶ Send photons' : '❚❚ Pause photons'; }
    pb.addEventListener('click', function () { paused = !paused; syncBtn(); kick(); });
    function frame(now) {
      raf = 0; var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      if (!paused) step(dt);
      draw();
      if (!paused && visible && !document.hidden) raf = requestAnimationFrame(frame); else last = 0;
    }
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; kick(); }, { threshold: 0.05 }).observe(cvs);
    document.addEventListener('visibilitychange', kick);
    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(cvs);
    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    syncBtn(); sync(true); resize(); draw(); kick();
    if (reduced) box.querySelector('.ph-tally span').textContent = 'photon stream off (reduced motion)';
    return { eta: eta };
  };

  if (!document.getElementById('vs-photons-style')) {
    var st = document.createElement('style'); st.id = 'vs-photons-style';
    st.textContent = [
      '.ph-lab{border:1px solid var(--border);border-radius:var(--r-lg);background:var(--bg-card);padding:var(--sp-5);margin:var(--sp-6) 0}',
      '.ph-top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}.ph-top h3{margin:0 0 .3rem;font-size:1.08rem}',
      '.ph-top p{margin:0;font-size:.86rem;color:var(--text-secondary);line-height:1.6;max-width:70ch}',
      '.ph-pause{font:inherit;font-size:.74rem;color:var(--text-secondary);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:3px 12px;cursor:pointer;white-space:nowrap}.ph-pause[hidden]{display:none}',
      '.ph-presets{display:flex;flex-wrap:wrap;gap:.35rem;margin:.9rem 0 .6rem}',
      '.ph-presets button{font:inherit;font-size:.74rem;color:var(--text-secondary);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:3px 11px;cursor:pointer}',
      '.ph-presets button[aria-pressed="true"]{color:var(--text-primary);border-color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}',
      '.ph-cvs{display:block;width:100%;height:150px;max-height:none!important}',
      '.ph-sliders{display:grid;grid-template-columns:repeat(5,1fr);gap:.6rem;margin-top:.6rem}@media(max-width:820px){.ph-sliders{grid-template-columns:1fr 1fr}}',
      '.ph-s{display:flex;flex-direction:column;gap:.2rem;font-size:.76rem}.ph-s b{display:block;font-size:.78rem}.ph-s small{color:var(--text-muted);font-size:.68rem}',
      '.ph-s input{width:100%;accent-color:var(--c)}.ph-s output{font-family:var(--font-mono);font-size:.76rem;color:var(--text-primary)}',
      '.ph-out{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;margin:1rem 0 .6rem}@media(max-width:700px){.ph-out{grid-template-columns:1fr 1fr}}',
      '.ph-out div{border:1px solid var(--border);border-radius:10px;padding:.5rem .6rem;text-align:center}',
      '.ph-out b{display:block;font-family:var(--font-mono);font-size:1.2rem;color:var(--text-primary)}.ph-out span{font-size:.7rem;color:var(--text-muted)}',
      '.ph-k{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;font-size:.8rem;color:var(--text-secondary)}.ph-k input{flex:1;min-width:160px;accent-color:var(--c)}',
      '.ph-note{font-size:.74rem;color:var(--text-muted);margin:.8rem 0 0;line-height:1.55}'
    ].join('\n');
    document.head.appendChild(st);
  }
})();
