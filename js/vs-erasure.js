/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — vs-erasure.js: "Throw errors at a code" for
   rb87-vs-yb171.html, Section 09 (erasure conversion).

   A distance-d code can always correct any mix of e erasures (errors
   whose location is known) and t unknown Pauli errors as long as
         e + 2t ≤ d − 1.
   Erasures cost 1 of the budget, hidden errors cost 2 — the page's
   "d − 1 erasures but only ⌊(d−1)/2⌋ Pauli errors", in one line.

   Each thrown error is flagged as an erasure with probability 98%
   (Wu, Kolkowitz, Puri et al. 2022 proposal for Yb171/Sr87, as cited on
   the page). The same errors are then scored twice: with those flags,
   and with no flags at all. The no-flag case is deliberately NOT
   labelled "Rb87": the page states there is no single published Rb87
   erasure fraction (atom loss is heraldable, coherent errors are not).
   "Beyond the guarantee" means correction may fail, not that it must.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var V = window.AMOVersus = window.AMOVersus || {};
  var NS = 'http://www.w3.org/2000/svg';
  var FLAG_P = 0.98;

  V.erasureBudget = function (e, t, d) { return { used: e + 2 * t, budget: d - 1, ok: e + 2 * t <= d - 1 }; };

  V.erasureLab = function (mount, opts) {
    opts = opts || {};
    var d = 5, errs = [];                               // errs: [{site, flagged}]
    var box = document.createElement('div'); box.className = 'era-lab';
    box.style.setProperty('--era-flag', opts.flagColor || '#34d399');
    box.innerHTML =
      '<div class="era-top"><div><h3>Throw errors at a code</h3>' +
      '<p>A distance-<i>d</i> code is guaranteed to fix any mix of <b>e</b> erasures (errors whose location is flagged) and <b>t</b> hidden errors while <b>e + 2t ≤ d − 1</b>. ' +
      'Each error you throw is flagged with 98% probability, as in the Yb171/Sr87 erasure-conversion proposal cited above. The same errors are then scored with and without the flags.</p></div></div>' +
      '<div class="era-ctrl"><span class="era-lbl">Code distance</span><span class="era-seg" role="group" aria-label="Code distance">' +
      [3, 5, 7].map(function (k) { return '<button type="button" data-d="' + k + '"' + (k === d ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>d = ' + k + '</button>'; }).join('') +
      '</span><button type="button" class="era-btn era-add">+ Throw an error</button><button type="button" class="era-btn era-clear">Clear</button></div>' +
      '<div class="era-body"><svg class="era-svg" role="img"></svg><div class="era-meters">' +
      '<div class="era-meter flag"><div class="era-mh"><b>With erasure flags</b><span>Yb171-style: 98% of gate errors land in ³P₀ and are seen</span></div><div class="era-bar"></div><div class="era-v"></div></div>' +
      '<div class="era-meter plain"><div class="era-mh"><b>No flags</b><span>every error is a hidden Pauli error</span></div><div class="era-bar"></div><div class="era-v"></div></div>' +
      '</div></div>' +
      '<p class="era-note">Legend: <span class="era-k flag"></span> flagged erasure (location known) · <span class="era-k hid"></span> hidden error (location unknown to the decoder). ' +
      'The no-flag case is not labelled Rb87 on purpose: Rb87 atom loss is heraldable, but most coherent errors are not, and there is no single published Rb87 erasure fraction. Beyond the guarantee, correction <em>may</em> fail; it doesn’t always.</p>';
    mount.appendChild(box);
    var svg = box.querySelector('svg');

    function draw() {
      var s = 44, pad = 26, n = d;
      svg.setAttribute('viewBox', '0 0 ' + (n * s + 2 * pad - s + 2 * 14) + ' ' + (n * s + 2 * pad - s + 2 * 14));
      svg.setAttribute('aria-label', 'Distance-' + d + ' code, ' + d * d + ' data qubits, ' + errs.length + ' errors thrown.');
      svg.innerHTML = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
        var i = r * n + c, x = pad + 14 + c * s, y = pad + 14 + r * s, er = null;
        errs.forEach(function (e) { if (e.site === i) er = e; });
        if (c + 1 < n) line(x, y, x + s, y); if (r + 1 < n) line(x, y, x, y + s);
        var g = document.createElementNS(NS, 'g');
        if (er) g.setAttribute('class', 'era-err ' + (er.flagged ? 'flag' : 'hid') + (er.fresh ? ' fresh' : ''));
        var ci = document.createElementNS(NS, 'circle'); ci.setAttribute('cx', x); ci.setAttribute('cy', y); ci.setAttribute('r', 11); ci.setAttribute('class', 'era-q');
        g.appendChild(ci);
        if (er) {
          var ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', 17); ring.setAttribute('class', 'era-ring'); g.appendChild(ring);
          var tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', x); tx.setAttribute('y', y + 4.5); tx.setAttribute('class', 'era-t'); tx.textContent = er.flagged ? '!' : '?'; g.appendChild(tx);
        }
        svg.appendChild(g);
      }
      errs.forEach(function (e) { e.fresh = false; });
      function line(x1, y1, x2, y2) { var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); l.setAttribute('class', 'era-l'); svg.appendChild(l); }
      meter(box.querySelector('.era-meter.flag'), errs.filter(function (e) { return e.flagged; }).length, errs.filter(function (e) { return !e.flagged; }).length);
      meter(box.querySelector('.era-meter.plain'), 0, errs.length);
      box.querySelector('.era-add').disabled = errs.length >= d * d;
    }
    function meter(m, e, t) {
      var b = V.erasureBudget(e, t, d), cells = Math.max(b.budget, b.used, 1), html = '';
      for (var k = 0; k < cells; k++) {
        var kind = k < e ? 'e' : (k < e + 2 * t ? 't' : '');
        html += '<i class="' + kind + (k >= b.budget ? ' over' : '') + '"></i>';
        if (k === b.budget - 1 && cells > b.budget) html += '<em class="era-limit" title="budget d − 1"></em>';
      }
      m.querySelector('.era-bar').innerHTML = html;
      m.classList.toggle('bad', !b.ok);
      m.querySelector('.era-v').innerHTML = 'e + 2t = ' + e + ' + 2·' + t + ' = <b>' + b.used + '</b> of ' + b.budget + ' → ' +
        (b.ok ? '<span class="ok">guaranteed correctable</span>' : '<span class="no">beyond the guarantee</span>');
    }
    box.querySelectorAll('.era-seg button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        d = +btn.dataset.d; errs = errs.filter(function (e) { return e.site < d * d; });
        box.querySelectorAll('.era-seg button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === btn)); });
        errs = []; draw();
      });
    });
    box.querySelector('.era-add').addEventListener('click', function () {
      var free = []; for (var i = 0; i < d * d; i++) if (!errs.some(function (e) { return e.site === i; })) free.push(i);
      if (!free.length) return;
      errs.push({ site: free[Math.floor(Math.random() * free.length)], flagged: Math.random() < FLAG_P, fresh: true });
      draw();
    });
    box.querySelector('.era-clear').addEventListener('click', function () { errs = []; draw(); });
    draw();
    return { draw: draw };
  };

  if (!document.getElementById('vs-erasure-style')) {
    var st = document.createElement('style'); st.id = 'vs-erasure-style';
    st.textContent = [
      '.era-lab{border:1px solid var(--border);border-radius:var(--r-lg);background:var(--bg-card);padding:var(--sp-5);margin:var(--sp-6) 0}',
      '.era-top h3{margin:0 0 .3rem;font-size:1.08rem}.era-top p{margin:0;font-size:.86rem;color:var(--text-secondary);line-height:1.6;max-width:72ch}',
      '.era-ctrl{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.9rem 0}',
      '.era-lbl{font-size:.78rem;color:var(--text-muted)}',
      '.era-seg{display:inline-flex;border:1px solid var(--border-med);border-radius:999px;overflow:hidden}',
      '.era-seg button{font:inherit;font-size:.76rem;padding:4px 12px;background:transparent;border:0;color:var(--text-secondary);cursor:pointer;transition:background .2s,color .2s}',
      '.era-seg button[aria-pressed="true"]{background:var(--text-primary);color:var(--bg-card)}',
      '.era-btn{font:inherit;font-size:.78rem;font-weight:600;color:var(--text-primary);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:4px 14px;cursor:pointer}',
      '.era-btn:disabled{opacity:.4;cursor:default}',
      '.era-body{display:grid;grid-template-columns:minmax(200px,340px) 1fr;gap:1.2rem;align-items:center}@media(max-width:700px){.era-body{grid-template-columns:1fr}}',
      '.era-svg{display:block;width:100%;height:auto;max-height:340px}',
      '.era-l{stroke:var(--border-med);stroke-width:2}',
      '.era-q{fill:color-mix(in srgb,var(--text-muted) 25%,var(--bg-card));stroke:var(--text-muted);stroke-width:1.5}',
      '.era-err.flag .era-q{fill:var(--era-flag);stroke:var(--era-flag)}.era-err.flag .era-ring{fill:none;stroke:var(--era-flag);stroke-width:2.5;opacity:.7}',
      '.era-err.hid .era-q{fill:color-mix(in srgb,#ef4444 55%,var(--bg-card));stroke:#ef4444}.era-err.hid .era-ring{fill:none;stroke:#ef4444;stroke-width:1.5;stroke-dasharray:3 3;opacity:.6}',
      '.era-t{text-anchor:middle;font-weight:800;font-size:13px;fill:var(--bg-card)}',
      '.era-err.fresh{animation:era-in .45s var(--ease-out,ease) both;transform-box:fill-box;transform-origin:center}',
      '@keyframes era-in{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}',
      '.era-meters{display:flex;flex-direction:column;gap:1rem}',
      '.era-meter{border:1px solid var(--border);border-radius:10px;padding:.7rem .8rem;transition:border-color .3s}',
      '.era-meter.bad{border-color:#ef4444}',
      '.era-mh b{display:block;font-size:.88rem}.era-mh span{font-size:.72rem;color:var(--text-muted)}',
      '.era-bar{display:flex;gap:3px;margin:.55rem 0 .4rem;align-items:center;flex-wrap:wrap}',
      '.era-bar i{display:block;width:22px;height:12px;border-radius:3px;background:color-mix(in srgb,var(--text-muted) 18%,transparent);transition:background .3s}',
      '.era-bar i.e{background:var(--era-flag)}.era-bar i.t{background:#ef4444}.era-bar i.over{outline:1px dashed #ef4444;outline-offset:1px}',
      '.era-limit{display:block;width:2px;height:20px;background:var(--text-primary);margin:0 3px}',
      '.era-v{font-family:var(--font-mono);font-size:.76rem;color:var(--text-secondary)}.era-v .ok{color:#16a34a;font-weight:700}.era-v .no{color:#ef4444;font-weight:700}',
      '.era-note{font-size:.74rem;color:var(--text-muted);margin:.9rem 0 0;line-height:1.55}',
      '.era-k{display:inline-block;width:10px;height:10px;border-radius:50%;vertical-align:middle}.era-k.flag{background:var(--era-flag)}.era-k.hid{background:#ef4444}',
      '@media (prefers-reduced-motion: reduce){.era-err.fresh{animation:none}}'
    ].join('\n');
    document.head.appendChild(st);
  }
})();
