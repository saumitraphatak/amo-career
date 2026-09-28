/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — versus.js: shared interactive pieces for the four
   head-to-head comparison pages (rb87-vs-yb171, quantinuum-vs-ionq,
   google-vs-ibm, psiquantum-vs-xanadu).

   Both widgets are built from the page's OWN content at load, so they
   can never disagree with it:

   AMOVersus.tug(tableEl, opts)   "Tug of war" — tallies the Edge column of
       the Full Head-to-Head table (the page's own editorial calls). A row
       counts for a side if its cells carry the page's `win <side>` class,
       or its Edge text starts with that side's name. Conditional calls
       ("if it scales", "pending review", "if realized") count half and are
       drawn hatched. Readers pick which categories matter to them.

   AMOVersus.race(mountEl, opts)  "Race replay" — the two Section-03
       timelines on one shared time axis, with a scrubbable playhead.
       Roadmap/target items are drawn hollow and dashed.

   Page colours come from the page's own CSS variables. Motion honours
   prefers-reduced-motion. No dependencies.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var V = window.AMOVersus = window.AMOVersus || {};
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function txt(node) { return (node ? node.textContent : '').replace(/\s+/g, ' ').trim(); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clip(t, n) { return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; }
  function flash(node) {
    if (!node) return;
    node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    node.classList.remove('vs-flash'); void node.offsetWidth; node.classList.add('vs-flash');
    setTimeout(function () { node.classList.remove('vs-flash'); }, 2400);
  }
  V.flash = flash;

  /* ═════════ Tug of war ═════════ */
  V.parseEdges = function (table, sides) {
    var rows = [], cat = '';
    Array.prototype.slice.call(table.querySelectorAll('tr')).forEach(function (tr) {
      var cells = tr.querySelectorAll('th, td');
      if (!cells.length || tr.querySelector('th[scope="col"]')) return;
      var first = cells[0], hasCat = first.hasAttribute('rowspan') || cells.length >= 5;
      if (hasCat) cat = txt(first);
      var metric = txt(cells[hasCat ? 1 : 0]), edgeCell = cells[cells.length - 1], edge = txt(edgeCell);
      var who = null;
      Array.prototype.slice.call(cells).forEach(function (c) {
        var m = (c.className || '').match(/\bwin\s+(\w+)/);
        if (m) who = m[1];
      });
      if (who && who !== 'tie' && !sides.some(function (s) { return s.key === who; })) who = null;
      if (!who) {
        if (/^tie\b/i.test(edge)) who = 'tie';
        else sides.forEach(function (s) { if (!who && s.match.test(edge)) who = s.key; });
      }
      var cond = /\bif\b|pending|unverified|projection/i.test(edge);
      rows.push({ tr: tr, cat: cat, metric: metric, edge: edge, who: who || 'even', cond: cond && who && who !== 'tie' });
    });
    return rows;
  };

  V.tug = function (table, opts) {
    if (!table) return null;
    var sides = opts.sides, rows = V.parseEdges(table, sides);
    var cats = []; rows.forEach(function (r) { if (cats.indexOf(r.cat) < 0) cats.push(r.cat); });
    var on = {}; cats.forEach(function (c) { on[c] = true; });

    var box = el('div', 'vs-tug');
    box.innerHTML =
      '<div class="vs-tug-head"><h3>' + esc(opts.title || 'Tug of war') + '</h3>' +
      '<p>' + (opts.intro || 'Every row of the table below ends with an <em>Edge</em> call. Pick the categories you care about and watch the rope move.') + '</p></div>' +
      '<div class="vs-tug-chips" role="group" aria-label="Categories to count"></div>' +
      '<div class="vs-rope" aria-live="polite">' +
        '<div class="vs-rope-side a"><span class="vs-rope-name"></span><span class="vs-rope-n"></span></div>' +
        '<div class="vs-rope-track"><div class="vs-rope-fill"></div><div class="vs-knot" aria-hidden="true"></div><div class="vs-rope-mid" aria-hidden="true"></div></div>' +
        '<div class="vs-rope-side b"><span class="vs-rope-name"></span><span class="vs-rope-n"></span></div>' +
      '</div>' +
      '<div class="vs-verdict"></div>' +
      '<div class="vs-tug-lists"><div class="vs-list a"></div><div class="vs-list even"></div><div class="vs-list b"></div></div>' +
      '<p class="vs-note">A tally of this page’s own <em>Edge</em> column, not a score: rows are not equally important, which is exactly why you choose. ' +
      'Conditional calls (“if it scales”, “pending review”) count half and are hatched. Click any row to jump to it in the table.</p>';
    var A = sides[0], B = sides[1];
    box.style.setProperty('--vs-a', A.color); box.style.setProperty('--vs-b', B.color);
    box.querySelector('.vs-rope-side.a .vs-rope-name').textContent = A.name;
    box.querySelector('.vs-rope-side.b .vs-rope-name').textContent = B.name;

    var chips = box.querySelector('.vs-tug-chips');
    var all = el('button', 'vs-chip', 'All'); all.type = 'button'; all.setAttribute('aria-pressed', 'true');
    chips.appendChild(all);
    var chipEls = cats.map(function (c) {
      var b = el('button', 'vs-chip', esc(c)); b.type = 'button'; b.setAttribute('aria-pressed', 'true'); b.dataset.cat = c;
      chips.appendChild(b); return b;
    });
    all.addEventListener('click', function () {
      var allOn = cats.every(function (c) { return on[c]; });
      cats.forEach(function (c) { on[c] = !allOn; }); if (allOn) on[cats[0]] = true;
      update();
    });
    chipEls.forEach(function (b) {
      b.addEventListener('click', function () {
        on[b.dataset.cat] = !on[b.dataset.cat];
        if (!cats.some(function (c) { return on[c]; })) on[b.dataset.cat] = true;   // never empty
        update();
      });
    });

    function listHTML(list, label) {
      if (!list.length) return '<div class="vs-list-h">' + label + '</div><div class="vs-list-empty">—</div>';
      return '<div class="vs-list-h">' + label + ' · ' + list.length + '</div>' + list.map(function (r) {
        return '<button type="button" class="vs-row' + (r.cond ? ' cond' : '') + '" data-i="' + rows.indexOf(r) + '"><b>' + esc(r.metric) + '</b><small>' + esc(r.edge) + '</small></button>';
      }).join('');
    }
    function update() {
      chipEls.forEach(function (b) { b.setAttribute('aria-pressed', String(!!on[b.dataset.cat])); });
      all.setAttribute('aria-pressed', String(cats.every(function (c) { return on[c]; })));
      var use = rows.filter(function (r) { return on[r.cat]; });
      var a = use.filter(function (r) { return r.who === A.key; }), b = use.filter(function (r) { return r.who === B.key; });
      var ev = use.filter(function (r) { return r.who === 'tie' || r.who === 'even'; });
      function score(l) { return l.reduce(function (s, r) { return s + (r.cond ? 0.5 : 1); }, 0); }
      var sa = score(a), sb = score(b), tot = Math.max(1, sa + sb + ev.length * 0.5);
      var pull = (sb - sa) / tot;                                   // −1 … +1 : knot moves toward the winner
      box.querySelector('.vs-rope-side.a .vs-rope-n').textContent = fmt(sa);
      box.querySelector('.vs-rope-side.b .vs-rope-n').textContent = fmt(sb);
      box.querySelector('.vs-knot').style.left = (50 + 44 * pull) + '%';
      var fill = box.querySelector('.vs-rope-fill');
      fill.style.left = Math.min(50, 50 + 44 * pull) + '%'; fill.style.width = Math.abs(44 * pull) + '%';
      fill.style.background = pull < 0 ? 'var(--vs-a)' : 'var(--vs-b)';
      var v = box.querySelector('.vs-verdict');
      if (Math.abs(sa - sb) < 0.75) v.innerHTML = 'Across these categories it’s <b>roughly even</b> (' + fmt(sa) + ' vs ' + fmt(sb) + ', ' + ev.length + ' even or different).';
      else { var w = sa > sb ? A : B; v.innerHTML = 'Across these categories the table leans <b style="color:' + w.color + '">' + esc(w.name) + '</b> (' + fmt(Math.max(sa, sb)) + ' vs ' + fmt(Math.min(sa, sb)) + ', ' + ev.length + ' even or different).'; }
      box.querySelector('.vs-list.a').innerHTML = listHTML(a, esc(A.name) + ' edge');
      box.querySelector('.vs-list.b').innerHTML = listHTML(b, esc(B.name) + ' edge');
      box.querySelector('.vs-list.even').innerHTML = listHTML(ev, 'Even / different');
      box.querySelectorAll('.vs-row').forEach(function (btn) { btn.addEventListener('click', function () { flash(rows[+btn.dataset.i].tr); }); });
    }
    function fmt(x) { return (Math.round(x * 2) / 2).toString().replace('.5', '½'); }

    (opts.mount || table).insertAdjacentElement(opts.mount ? 'beforeend' : 'beforebegin', box);
    update();
    return { rows: rows, update: update, el: box };
  };

  /* ═════════ Race replay ═════════ */
  var MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  V.parseTimeline = function (tlEl) {
    var out = [];
    tlEl.querySelectorAll('.tl-item').forEach(function (it) {
      var yEl = it.querySelector('.tl-year'), head = txt(yEl), body = txt(it.querySelector('.tl-body'));
      var m = head.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)?[\s\/A-Za-z]*?(?:\d{1,2},\s*)?((?:19|20)\d{2})(?:\s*[–-]\s*((?:19|20)\d{2}))?/);
      if (!m) return;
      var y = +m[2], mo = m[1] ? MON[m[1].slice(0, 3).toLowerCase()] : null;
      var t = y + (mo != null ? (mo + 0.5) / 12 : 0.5), t2 = m[3] ? +m[3] + 0.5 : null;
      var target = /target|roadmap/i.test(head) || !!(yEl && yEl.querySelector('.company-roadmap'));
      var label = head.split('·').slice(1).join('·').replace(/roadmap|preprint/gi, '').replace(/\(\s*\)/g, '').trim();
      if (!label) {                                        // "2029 (target)" style heads: name it from the body
        var b0 = body.replace(/^(company\s+)?target:\s*/i, '');
        label = clip(b0.charAt(0).toUpperCase() + b0.slice(1), 22);
      }
      if (/target/i.test(head) && !/target/i.test(label)) label = label + ' (target)';
      out.push({ item: it, t: t, t2: t2, when: head.split('·')[0].trim(), label: label, body: body, target: target });
    });
    return out;
  };

  V.race = function (mount, opts) {
    if (!mount) return null;
    var lanes = opts.lanes.map(function (l) { return { name: l.name, color: l.color, items: V.parseTimeline(l.el) }; });
    var ts = []; lanes.forEach(function (l) { l.items.forEach(function (i) { ts.push(i.t); if (i.t2) ts.push(i.t2); }); });
    if (!ts.length) return null;
    var t0 = Math.floor(Math.min.apply(null, ts)), t1 = Math.ceil(Math.max.apply(null, ts) + 0.2);
    var nowT = opts.now || 2026.75;

    var box = el('div', 'vs-race');
    box.innerHTML =
      '<div class="vs-race-top"><div><h3>' + esc(opts.title || 'Race replay') + '</h3><p>' + (opts.intro || 'Both timelines below on one clock. Drag the playhead or press play; hollow markers are company roadmap targets, not results.') + '</p></div>' +
      '<button type="button" class="vs-play">▶ Replay</button></div>' +
      '<div class="vs-race-svgwrap"><svg class="vs-race-svg" role="img"></svg></div>' +
      '<input type="range" class="vs-race-slider" aria-label="Playhead year">' +
      '<div class="vs-race-now"></div>';
    mount.appendChild(box);
    var svg = box.querySelector('svg'), slider = box.querySelector('.vs-race-slider'), nowBox = box.querySelector('.vs-race-now'), play = box.querySelector('.vs-play');
    svg.setAttribute('aria-label', 'Timeline of ' + lanes.map(function (l) { return l.name; }).join(' and ') + ' milestones from ' + t0 + ' to ' + t1 + '. The same milestones are listed below.');
    slider.min = t0; slider.max = t1; slider.step = 0.01; slider.value = Math.min(t1, nowT);
    var NS = 'http://www.w3.org/2000/svg', W = 1000, H = 190, PADL = 96, PADR = 20;
    function X(t) { return PADL + (t - t0) / (t1 - t0) * (W - PADL - PADR); }

    function build() {
      var w = Math.max(320, svg.parentNode.clientWidth); W = w; H = w < 560 ? 170 : 250; PADL = w < 560 ? 78 : 96;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = '';
      var laneY = w < 560 ? [H * 0.3, H * 0.72] : [92, 150];
      // axis + year ticks
      for (var y = t0; y <= t1; y++) {
        var x = X(y), line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', x); line.setAttribute('x2', x); line.setAttribute('y1', 14); line.setAttribute('y2', H - 22); line.setAttribute('class', 'vs-tick');
        svg.appendChild(line);
        if (w >= 560 || y % 2 === 0) { var tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', x); tx.setAttribute('y', H - 6); tx.setAttribute('class', 'vs-year'); tx.textContent = y; svg.appendChild(tx); }
      }
      var nowL = document.createElementNS(NS, 'line');
      nowL.setAttribute('x1', X(nowT)); nowL.setAttribute('x2', X(nowT)); nowL.setAttribute('y1', 10); nowL.setAttribute('y2', H - 22); nowL.setAttribute('class', 'vs-today');
      svg.appendChild(nowL);
      var nowT_ = document.createElementNS(NS, 'text'); nowT_.setAttribute('x', X(nowT) + 4); nowT_.setAttribute('y', 12); nowT_.setAttribute('class', 'vs-today-l'); nowT_.textContent = 'today'; svg.appendChild(nowT_);
      lanes.forEach(function (l, li) {
        var yy = laneY[li];
        var track = document.createElementNS(NS, 'line');
        track.setAttribute('x1', PADL - 6); track.setAttribute('x2', W - PADR); track.setAttribute('y1', yy); track.setAttribute('y2', yy);
        track.setAttribute('class', 'vs-lane'); track.style.stroke = l.color; svg.appendChild(track);
        var name = document.createElementNS(NS, 'text'); name.setAttribute('x', 2); name.setAttribute('y', yy + 4); name.setAttribute('class', 'vs-lane-name'); name.style.fill = l.color; name.textContent = l.name; svg.appendChild(name);
        var tierEnd = [-1e9, -1e9, -1e9];                   // greedy label tiers; no free tier → tooltip only
        l.items.forEach(function (it) {
          var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'vs-ms' + (it.target ? ' target' : '')); g.setAttribute('tabindex', '0');
          g.setAttribute('role', 'button'); g.setAttribute('aria-label', it.when + ': ' + it.label + ' (jump to the timeline entry)');
          var x = X(it.t);
          if (it.t2) { var span = document.createElementNS(NS, 'line'); span.setAttribute('x1', x); span.setAttribute('x2', X(it.t2)); span.setAttribute('y1', yy); span.setAttribute('y2', yy); span.setAttribute('class', 'vs-span'); span.style.stroke = l.color; g.appendChild(span); }
          var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', yy); c.setAttribute('r', 7);
          c.style.stroke = l.color; c.style.fill = it.target ? 'var(--bg-card)' : l.color; g.appendChild(c);
          var lab = it.label.length > 24 ? it.label.slice(0, 22) + '…' : it.label, half = lab.length * 3.1 + 6, tier = -1;
          for (var k = 0; k < tierEnd.length; k++) if (x - half > tierEnd[k]) { tier = k; break; }
          if (w >= 560 && tier >= 0) {
            tierEnd[tier] = x + half;
            var ly = li === 0 ? yy - 14 - tier * 14 : yy + 22 + tier * 14;
            var t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', ly); t.setAttribute('class', 'vs-ms-l');
            t.textContent = lab; g.appendChild(t);
            if (tier > 0) { var tk = document.createElementNS(NS, 'line'); tk.setAttribute('x1', x); tk.setAttribute('x2', x); tk.setAttribute('y1', li === 0 ? yy - 9 : yy + 9); tk.setAttribute('y2', li === 0 ? ly + 3 : ly - 10); tk.setAttribute('class', 'vs-leader'); g.appendChild(tk); }
          }
          var tt = document.createElementNS(NS, 'title'); tt.textContent = it.when + ' · ' + it.label; g.appendChild(tt);
          g.addEventListener('click', function () { flash(it.item); });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flash(it.item); } });
          it.g = g; svg.appendChild(g);
        });
      });
      var ph = document.createElementNS(NS, 'line'); ph.setAttribute('class', 'vs-playhead'); ph.setAttribute('y1', 8); ph.setAttribute('y2', H - 22); svg.appendChild(ph);
      svg.__ph = ph; setT(+slider.value);
    }
    function setT(t) {
      var ph = svg.__ph; if (!ph) return;
      ph.setAttribute('x1', X(t)); ph.setAttribute('x2', X(t));
      var html = [];
      lanes.forEach(function (l) {
        var latest = null;
        l.items.forEach(function (it) { var shown = it.t <= t + 1e-6; if (it.g) it.g.classList.toggle('shown', shown); if (shown && !it.target) latest = it; });
        html.push('<div class="vs-now-card" style="--c:' + l.color + '"><span>' + esc(l.name) + ' by ' + Math.floor(t) + '</span>' +
          (latest ? '<b>' + esc(latest.label) + '</b><small>' + esc(latest.when) + ' — ' + esc(clip(latest.body.split(/(?<=\.)\s/)[0], 170)) + '</small>' : '<b>—</b><small>Nothing demonstrated yet on this timeline.</small>') + '</div>');
      });
      nowBox.innerHTML = html.join('');
    }
    slider.addEventListener('input', function () { stopPlay(false); setT(+slider.value); });
    var raf = 0, last = 0;
    function stopPlay(mid) { if (raf) cancelAnimationFrame(raf); raf = 0; box.__mid = !!mid; play.textContent = mid ? '▶ Resume' : '▶ Replay'; }
    play.addEventListener('click', function () {
      if (raf) { stopPlay(true); return; }
      if (reduced) { slider.value = t1; setT(t1); return; }
      if (!box.__mid || +slider.value >= t1 - 0.02) slider.value = t0;       // Replay starts over unless resuming a paused replay
      play.textContent = '❚❚ Pause'; last = 0;
      (function step(now) {
        var dt = last ? (now - last) / 1000 : 0; last = now;
        var v = Math.min(t1, +slider.value + dt * (t1 - t0) / 7);          // whole span in ~7 s
        slider.value = v; setT(v);
        if (v >= t1) { stopPlay(false); return; }
        raf = requestAnimationFrame(step);
      })(performance.now());
    });
    build();
    if (window.ResizeObserver) { var rw = 0; new ResizeObserver(function () { var w = svg.parentNode.clientWidth; if (Math.abs(w - rw) > 4) { rw = w; build(); } }).observe(svg.parentNode); }
    return { lanes: lanes, setT: setT };
  };

  /* shared styles (page accent colours come from --vs-a / --vs-b and inline styles) */
  if (!document.getElementById('versus-style')) {
    var st = document.createElement('style'); st.id = 'versus-style';
    st.textContent = [
      '.vs-tug,.vs-race{border:1px solid var(--border);border-radius:var(--r-lg);background:var(--bg-card);padding:var(--sp-5);margin:0 0 var(--sp-6)}',
      '.vs-tug-head h3,.vs-race h3{margin:0 0 .3rem;font-size:1.08rem}',
      '.vs-tug-head p,.vs-race-top p{margin:0;color:var(--text-secondary);font-size:.86rem;line-height:1.6;max-width:70ch}',
      '.vs-tug-chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.9rem 0 1.1rem}',
      '.vs-chip{font:inherit;font-size:.74rem;color:var(--text-muted);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:3px 11px;cursor:pointer;transition:all .2s var(--ease-out,ease)}',
      '.vs-chip[aria-pressed="true"]{color:var(--text-primary);border-color:var(--text-secondary);background:color-mix(in srgb,var(--text-primary) 7%,transparent)}',
      '.vs-rope{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:1rem}',
      '.vs-rope-side{display:flex;flex-direction:column;align-items:center;min-width:5.5rem}',
      '.vs-rope-side .vs-rope-name{font-size:.8rem;font-weight:700}',
      '.vs-rope-side.a .vs-rope-name{color:var(--vs-a)}.vs-rope-side.b .vs-rope-name{color:var(--vs-b)}',
      '.vs-rope-n{font-family:var(--font-mono);font-size:1.6rem;font-weight:800;line-height:1.1;color:var(--text-primary)}',
      '.vs-rope-track{position:relative;height:14px;border-radius:999px;background:repeating-linear-gradient(115deg,color-mix(in srgb,var(--text-muted) 22%,transparent) 0 6px,color-mix(in srgb,var(--text-muted) 10%,transparent) 6px 12px)}',
      '.vs-rope-fill{position:absolute;top:0;bottom:0;border-radius:999px;opacity:.85;transition:left .7s var(--ease-out,ease),width .7s var(--ease-out,ease),background .3s}',
      '.vs-rope-mid{position:absolute;left:50%;top:-6px;bottom:-6px;width:2px;background:var(--text-muted);opacity:.5;transform:translateX(-1px)}',
      '.vs-knot{position:absolute;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:var(--bg-card);border:3px solid var(--text-primary);box-shadow:0 2px 10px rgba(0,0,0,.25);transition:left .8s cubic-bezier(.34,1.4,.5,1)}',
      '.vs-verdict{text-align:center;margin:.8rem 0 1rem;font-size:.9rem;color:var(--text-secondary)}',
      '.vs-tug-lists{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.8rem}',
      '@media(max-width:760px){.vs-tug-lists{grid-template-columns:1fr}.vs-rope{gap:.5rem}.vs-rope-side{min-width:4rem}}',
      '.vs-list-h{font-family:var(--font-mono);font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:.35rem}',
      '.vs-list.a .vs-list-h{color:var(--vs-a)}.vs-list.b .vs-list-h{color:var(--vs-b)}',
      '.vs-list-empty{color:var(--text-muted);font-size:.8rem}',
      '.vs-row{display:block;width:100%;text-align:left;font:inherit;background:transparent;border:1px solid var(--border);border-radius:8px;padding:.35rem .55rem;margin-bottom:.3rem;color:var(--text-primary);cursor:pointer;transition:background .2s,border-color .2s}',
      '.vs-row:hover{background:var(--bg-card-hover);border-color:var(--border-med)}',
      '.vs-row b{display:block;font-size:.78rem}.vs-row small{display:block;font-size:.72rem;color:var(--text-muted)}',
      '.vs-row.cond{border-style:dashed}',
      '.vs-note{font-size:.74rem;color:var(--text-muted);margin:.8rem 0 0;line-height:1.55}',
      '.vs-flash{animation:vs-flash 2.2s var(--ease-out,ease)}',
      '@keyframes vs-flash{0%,30%{background:color-mix(in srgb,var(--page,#38bdf8) 22%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--page,#38bdf8) 45%,transparent)}100%{background:transparent;box-shadow:none}}',
      '.vs-race-top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem}',
      '.vs-play{font:inherit;font-size:.78rem;font-weight:600;color:var(--text-primary);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:5px 14px;cursor:pointer;white-space:nowrap}',
      '.vs-race-svgwrap{margin-top:.8rem}.vs-race-svg{display:block;width:100%;height:auto;overflow:visible}',
      '.vs-tick{stroke:var(--border);stroke-width:1}.vs-year{font-family:var(--font-mono);font-size:11px;fill:var(--text-muted);text-anchor:middle}',
      '.vs-today{stroke:var(--text-muted);stroke-dasharray:3 4}.vs-today-l{font-size:10px;fill:var(--text-muted);font-family:var(--font-mono)}',
      '.vs-lane{stroke-width:2;opacity:.35}.vs-lane-name{font-size:12px;font-weight:700}',
      '.vs-span{stroke-width:5;stroke-linecap:round;opacity:.35}',
      '.vs-ms{cursor:pointer;opacity:.16;transition:opacity .35s var(--ease-out,ease)}.vs-ms.shown{opacity:1}',
      '.vs-ms circle{stroke-width:2.5;transition:r .3s var(--ease-out,ease)}.vs-ms:hover circle,.vs-ms:focus-visible circle{r:10}',
      '.vs-ms.target circle{stroke-dasharray:3 2.5}',
      '.vs-ms-l{font-size:10.5px;fill:var(--text-secondary);text-anchor:middle}.vs-leader{stroke:var(--text-muted);stroke-width:1;opacity:.5}',
      '.vs-ms:focus{outline:none}.vs-ms:focus-visible circle{stroke-width:4}',
      '.vs-playhead{stroke:var(--text-primary);stroke-width:1.5;opacity:.6}',
      '.vs-race-slider{width:100%;margin:.4rem 0 .6rem;accent-color:var(--page,#38bdf8)}',
      '.vs-race-now{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}',
      '@media(max-width:640px){.vs-race-now{grid-template-columns:1fr}}',
      '.vs-now-card{border-left:3px solid var(--c);padding:.35rem .7rem;background:color-mix(in srgb,var(--c) 6%,transparent);border-radius:0 8px 8px 0}',
      '.vs-now-card span{display:block;font-family:var(--font-mono);font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted)}',
      '.vs-now-card b{display:block;font-size:.88rem;margin:.1rem 0}.vs-now-card small{display:block;font-size:.76rem;color:var(--text-secondary);line-height:1.5}',
      '.vs-card{border:1px solid var(--border);border-radius:var(--r-lg);background:var(--bg-card);padding:var(--sp-5);margin:var(--sp-6) 0}',
      '.vs-card-top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}.vs-card h3{margin:0 0 .3rem;font-size:1.08rem}',
      '.vs-card-top p{margin:0;font-size:.86rem;color:var(--text-secondary);line-height:1.6;max-width:72ch}',
      '.vs-pill{font:inherit;font-size:.74rem;color:var(--text-secondary);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:3px 12px;cursor:pointer;white-space:nowrap}.vs-pill[hidden]{display:none}',
      '.vs-card-note{font-size:.74rem;color:var(--text-muted);margin:.6rem 0 0;line-height:1.55}',
      '.vs-card canvas{display:block;width:100%;height:380px;max-height:none!important;margin-top:.6rem}',
      '@media(max-width:560px){.vs-card canvas.vs-tall-mobile{height:560px}.vs-card-top{flex-direction:column}}',
      '@media (prefers-reduced-motion: reduce){.vs-knot,.vs-rope-fill,.vs-ms,.vs-flash{transition:none!important;animation:none!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }
})();
