/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — vs-lattice.js: "Lattice lab" for google-vs-ibm.html.

   Two schematic ~50-qubit patches: a square lattice (Google's Sycamore →
   Willow layout family, and IBM Nighthawk since 2025) and a heavy-hex
   lattice (IBM Eagle → Heron R2, 2021–2024). Heavy-hex is built the way
   IBM draws it: rows of qubits joined by "bridge" qubits every fourth
   column, alternating offset, so no qubit has more than 3 neighbours.

   Hover a qubit to see its neighbours; pick two qubits to route a
   two-qubit gate: the shortest coupler path is drawn and the SWAP count
   (distance − 1) given. The stats line compares average degree and the
   average SWAPs over every pair of qubits, computed from these patches.
   Schematic patches, not exact chip maps — the caption says so.

   Keyboard (2026-09-29): each patch is one tab stop. Arrow keys move a
   focus ring to the nearest qubit in that screen direction, Enter/Space
   picks it (two picks route a gate), Esc clears, Home/End jump to the
   first/last qubit. The message line is aria-live, so the neighbour count
   and SWAP result are read out.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var V = window.AMOVersus = window.AMOVersus || {};
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function squarePatch(n) {                       // n × n grid, drawn rotated 45° (Willow-style diamond)
    var nodes = [], edges = [], id = function (r, c) { return r * n + c; };
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      var x = (c - r) * 0.7071, y = (c + r) * 0.7071;
      nodes.push({ x: x, y: y });
      if (c + 1 < n) edges.push([id(r, c), id(r, c + 1)]);
      if (r + 1 < n) edges.push([id(r, c), id(r + 1, c)]);
    }
    return { nodes: nodes, edges: edges };
  }
  function heavyHexPatch(rows, width) {           // rows of `width` qubits + bridge qubits every 4th column
    var nodes = [], edges = [], rowIds = [];
    for (var r = 0; r < rows; r++) {
      rowIds.push([]);
      for (var c = 0; c < width; c++) {
        rowIds[r].push(nodes.length); nodes.push({ x: c, y: r * 2 });
        if (c > 0) edges.push([rowIds[r][c - 1], rowIds[r][c]]);
      }
    }
    for (r = 0; r < rows - 1; r++) {
      for (var c2 = (r % 2 ? 2 : 0); c2 < width; c2 += 4) {
        var b = nodes.length; nodes.push({ x: c2, y: r * 2 + 1, bridge: true });
        edges.push([rowIds[r][c2], b]); edges.push([b, rowIds[r + 1][c2]]);
      }
    }
    return { nodes: nodes, edges: edges };
  }

  function adjacency(g) {
    var adj = g.nodes.map(function () { return []; });
    g.edges.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    return adj;
  }
  function bfs(adj, s) {
    var dist = adj.map(function () { return -1; }), prev = adj.map(function () { return -1; }), q = [s]; dist[s] = 0;
    while (q.length) { var u = q.shift(); adj[u].forEach(function (v) { if (dist[v] < 0) { dist[v] = dist[u] + 1; prev[v] = u; q.push(v); } }); }
    return { dist: dist, prev: prev };
  }
  function stats(g) {
    var adj = adjacency(g), n = g.nodes.length, sum = 0, pairs = 0, maxDeg = 0;
    adj.forEach(function (a) { if (a.length > maxDeg) maxDeg = a.length; });
    for (var i = 0; i < n; i++) { var d = bfs(adj, i).dist; for (var j = i + 1; j < n; j++) { sum += d[j] - 1; pairs++; } }
    return { n: n, e: g.edges.length, avgDeg: 2 * g.edges.length / n, maxDeg: maxDeg, avgSwaps: sum / pairs, adj: adj };
  }
  V.latticeStats = function () { return { square: stats(squarePatch(7)), heavyHex: stats(heavyHexPatch(4, 10)) }; };

  function panel(host, g, meta) {
    var st = stats(g), adj = st.adj;
    var box = document.createElement('div'); box.className = 'lat-panel'; box.style.setProperty('--c', meta.color);
    box.innerHTML = '<div class="lat-h"><b>' + meta.name + '</b><span>' + meta.sub + '</span></div>' +
      '<svg class="lat-svg" role="application" tabindex="0" aria-roledescription="qubit lattice" aria-label="' + meta.name + ' patch of ' + st.n + ' qubits. Average connectivity ' + st.avgDeg.toFixed(2) + ', maximum ' + st.maxDeg + ' neighbours. Arrow keys move between qubits, Enter picks one; pick two to route a gate; Escape clears."></svg>' +
      '<div class="lat-stats"><div><b>' + st.avgDeg.toFixed(2) + '</b><span>avg. neighbours</span></div><div><b>' + st.maxDeg + '</b><span>max neighbours</span></div>' +
      '<div><b>' + st.avgSwaps.toFixed(1) + '</b><span>avg. SWAPs per random gate</span></div></div>' +
      '<div class="lat-msg" aria-live="polite">Hover a qubit, or click two to route a gate.</div>';
    host.appendChild(box);
    var svg = box.querySelector('svg');
    var xs = g.nodes.map(function (p) { return p.x; }), ys = g.nodes.map(function (p) { return p.y; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var pad = 0.8, s = 40;
    svg.setAttribute('viewBox', ((x0 - pad) * s) + ' ' + ((y0 - pad) * s) + ' ' + ((x1 - x0 + 2 * pad) * s) + ' ' + ((y1 - y0 + 2 * pad) * s));
    var edgeEls = g.edges.map(function (e) {
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', g.nodes[e[0]].x * s); l.setAttribute('y1', g.nodes[e[0]].y * s);
      l.setAttribute('x2', g.nodes[e[1]].x * s); l.setAttribute('y2', g.nodes[e[1]].y * s);
      l.setAttribute('class', 'lat-e'); svg.appendChild(l); return l;
    });
    var nodeEls = g.nodes.map(function (p, i) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.x * s); c.setAttribute('cy', p.y * s); c.setAttribute('r', p.bridge ? 7 : 9);
      c.setAttribute('class', 'lat-q' + (p.bridge ? ' bridge' : ''));
      c.addEventListener('mouseenter', function () { hover(i); });
      c.addEventListener('mouseleave', function () { hover(-1); });
      c.addEventListener('click', function () { cursor = i; placeRing(); pick(i); });
      svg.appendChild(c); return c;
    });
    // Keyboard focus ring (shown only while the patch has keyboard focus).
    var ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('class', 'lat-cur'); ring.setAttribute('r', 15);
    svg.appendChild(ring);
    var cursor = 0;
    function placeRing() { ring.setAttribute('cx', g.nodes[cursor].x * s); ring.setAttribute('cy', g.nodes[cursor].y * s); }
    function step(dx, dy) {                       // nearest qubit in a screen direction
      var p = g.nodes[cursor], best = -1, bestScore = Infinity;
      g.nodes.forEach(function (q, j) {
        var vx = q.x - p.x, vy = q.y - p.y, along = vx * dx + vy * dy, perp = Math.abs(vx * dy - vy * dx);
        if (j === cursor || along < 0.05 || perp > along * 1.01 + 1e-9) return;
        var score = along + 2 * perp;
        if (score < bestScore - 1e-9) { bestScore = score; best = j; }
      });
      return best;
    }
    svg.addEventListener('focus', function () {   // mouse clicks focus it too; ring only for keyboard focus
      var kb = true; try { kb = svg.matches(':focus-visible'); } catch (err) {}
      if (kb) { svg.classList.add('kb'); placeRing(); hover(cursor); }
    });
    svg.addEventListener('blur', function () { svg.classList.remove('kb'); hover(-1); });
    svg.addEventListener('keydown', function (e) {
      var k = e.key, next = -1;
      if (k === 'ArrowRight') next = step(1, 0); else if (k === 'ArrowLeft') next = step(-1, 0);
      else if (k === 'ArrowDown') next = step(0, 1); else if (k === 'ArrowUp') next = step(0, -1);
      else if (k === 'Home') next = 0; else if (k === 'End') next = g.nodes.length - 1;
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); svg.classList.add('kb'); placeRing(); pick(cursor); if (sel.length !== 2) hover(cursor); return; }
      else if (k === 'Escape') { if (sel.length) { e.preventDefault(); sel = []; clearPath(); hover(cursor); } return; }
      else return;
      e.preventDefault();
      if (!svg.classList.contains('kb')) { svg.classList.add('kb'); placeRing(); }
      if (next >= 0) { cursor = next; placeRing(); hover(cursor); }
    });
    function edgeIndex(a, b) { for (var k = 0; k < g.edges.length; k++) { var e = g.edges[k]; if ((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)) return k; } return -1; }
    var sel = [], msg = box.querySelector('.lat-msg');
    function hover(i) {
      nodeEls.forEach(function (n) { n.classList.remove('nb', 'hv'); });
      edgeEls.forEach(function (e) { e.classList.remove('nb'); });
      if (i < 0) { if (!sel.length) msg.textContent = 'Hover a qubit, or click two to route a gate.'; return; }
      nodeEls[i].classList.add('hv');
      adj[i].forEach(function (j) { nodeEls[j].classList.add('nb'); var k = edgeIndex(i, j); if (k >= 0) edgeEls[k].classList.add('nb'); });
      if (sel.length !== 2) msg.textContent = (sel.length ? 'Now pick a second qubit. ' : '') + (g.nodes[i].bridge ? 'Bridge qubit' : 'Qubit') + ' ' + (i + 1) + ' of ' + g.nodes.length + ', with ' + adj[i].length + ' neighbour' + (adj[i].length === 1 ? '' : 's') + '.';
    }
    function clearPath() {
      nodeEls.forEach(function (n) { n.classList.remove('sel', 'on-path'); n.style.animationDelay = ''; });
      edgeEls.forEach(function (e) { e.classList.remove('path'); e.style.animationDelay = ''; });
    }
    function route(a, b) {
      clearPath();
      var r = bfs(adj, a), path = [b];
      while (path[0] !== a) path.unshift(r.prev[path[0]]);
      nodeEls[a].classList.add('sel'); nodeEls[b].classList.add('sel');
      for (var k = 0; k < path.length - 1; k++) {
        var ei = edgeIndex(path[k], path[k + 1]);
        edgeEls[ei].style.animationDelay = reduced ? '0s' : (k * 0.09) + 's';
        edgeEls[ei].classList.add('path');
        if (k > 0) { nodeEls[path[k]].style.animationDelay = reduced ? '0s' : (k * 0.09) + 's'; nodeEls[path[k]].classList.add('on-path'); }
      }
      var d = path.length - 1;
      msg.innerHTML = d === 1 ? 'Neighbours: the gate runs directly, <b>0 SWAPs</b>.' :
        'Distance ' + d + ' → <b>' + (d - 1) + ' SWAP' + (d - 1 === 1 ? '' : 's') + '</b> to bring them together (each SWAP is itself ~3 two-qubit gates).';
      return d - 1;
    }
    function pick(i) {
      if (sel.length === 2) { sel = []; clearPath(); }
      sel.push(i); nodeEls[i].classList.add('sel');
      if (sel.length === 1) msg.textContent = 'Now pick a second qubit.';
      if (sel.length === 2) { if (sel[0] === sel[1]) { sel = []; clearPath(); return; } route(sel[0], sel[1]); }
    }
    return {
      st: st,
      randomGate: function (rng) {
        var n = g.nodes.length, a = Math.floor(rng() * n), b = Math.floor(rng() * n);
        while (b === a) b = Math.floor(rng() * n);
        sel = [a, b]; return route(a, b);
      }
    };
  }

  V.lattices = function (mount, opts) {
    opts = opts || {};
    var wrap = document.createElement('div'); wrap.className = 'lat-lab';
    wrap.innerHTML = '<div class="lat-top"><div><h3>Lattice lab: why connectivity matters</h3>' +
      '<p>Both chips can only run a two-qubit gate between <em>coupled</em> neighbours. Anything farther apart must first be moved together with SWAP gates, and every SWAP adds error. Hover a qubit, click two to route a gate, or roll a random one on both lattices at once. Keyboard: Tab to a lattice, arrow keys to move, Enter to pick.</p></div>' +
      '<button type="button" class="lat-roll">🎲 Random gate on both</button></div><div class="lat-row"></div>' +
      '<p class="lat-note">Schematic ~50-qubit patches, not the real chip maps. Willow has 105 qubits with an average connectivity of 3.47 (its spec sheet; edge qubits have fewer than 4); Nighthawk has 120 qubits with up to 4 neighbours; the heavy-hex Heron chips have 133/156. Real compilers route more cleverly than one SWAP chain per gate, but the ranking holds.</p>';
    mount.appendChild(wrap);
    var row = wrap.querySelector('.lat-row');
    var sq = panel(row, squarePatch(7), { name: 'Square lattice', sub: 'Google Sycamore → Willow · IBM Nighthawk (2025–)', color: opts.squareColor || 'var(--goog)' });
    var hh = panel(row, heavyHexPatch(4, 10), { name: 'Heavy-hex lattice', sub: 'IBM Eagle → Heron R2 (2021–2024)', color: opts.hexColor || 'var(--ibm)' });
    var seed = 1;
    function rng() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    wrap.querySelector('.lat-roll').addEventListener('click', function () { seed = (Date.now() % 100000) + 1; sq.randomGate(rng); hh.randomGate(rng); });
    return { square: sq.st, heavyHex: hh.st };
  };

  if (!document.getElementById('vs-lattice-style')) {
    var st = document.createElement('style'); st.id = 'vs-lattice-style';
    st.textContent = [
      '.lat-lab{border:1px solid var(--border);border-radius:var(--r-lg);background:var(--bg-card);padding:var(--sp-5);margin:var(--sp-6) 0}',
      '.lat-top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}',
      '.lat-top h3{margin:0 0 .3rem;font-size:1.08rem}.lat-top p{margin:0;font-size:.86rem;color:var(--text-secondary);line-height:1.6;max-width:70ch}',
      '.lat-roll{font:inherit;font-size:.78rem;font-weight:600;color:var(--text-primary);background:transparent;border:1px solid var(--border-med);border-radius:999px;padding:5px 14px;cursor:pointer;white-space:nowrap}',
      '.lat-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}@media(max-width:760px){.lat-row{grid-template-columns:1fr}.lat-top{flex-direction:column}}',
      '.lat-panel{border:1px solid var(--border);border-radius:12px;padding:.8rem;background:color-mix(in srgb,var(--c) 4%,transparent)}',
      '.lat-h b{display:block;color:var(--c);font-size:.95rem}.lat-h span{font-size:.74rem;color:var(--text-muted)}',
      '.lat-svg{display:block;width:100%;height:auto;max-height:300px;margin:.4rem 0}',
      '.lat-e{stroke:color-mix(in srgb,var(--text-muted) 55%,transparent);stroke-width:3;stroke-linecap:round;transition:stroke .2s,stroke-width .2s}',
      '.lat-e.nb{stroke:var(--c);stroke-width:5}',
      '.lat-e.path{stroke:var(--c);stroke-width:7;animation:lat-draw .45s var(--ease-out,ease) both}',
      '@keyframes lat-draw{from{stroke-opacity:0}to{stroke-opacity:1}}',
      '.lat-q{fill:var(--bg-card);stroke:var(--c);stroke-width:3;cursor:pointer;transition:r .2s var(--ease-out,ease),fill .2s}',
      '.lat-q.bridge{stroke-dasharray:3 2}',
      '.lat-svg:focus{outline:none}.lat-svg:focus-visible{outline:2px solid var(--c);outline-offset:3px;border-radius:8px}',
      '.lat-cur{fill:none;stroke:var(--text-primary);stroke-width:2.5;stroke-dasharray:4 3;pointer-events:none;display:none}.lat-svg.kb .lat-cur{display:inline}',
      '.lat-q:hover,.lat-q.hv{r:12}.lat-q.nb{fill:color-mix(in srgb,var(--c) 45%,var(--bg-card))}',
      '.lat-q.sel{fill:var(--c);r:12}.lat-q.on-path{fill:color-mix(in srgb,var(--c) 70%,var(--bg-card));animation:lat-pop .4s var(--ease-out,ease) both}',
      '@keyframes lat-pop{from{r:6}to{r:10}}',
      '.lat-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;text-align:center}',
      '.lat-stats b{display:block;font-family:var(--font-mono);font-size:1.15rem;color:var(--text-primary)}.lat-stats span{font-size:.68rem;color:var(--text-muted)}',
      '.lat-msg{min-height:2.6em;margin-top:.5rem;font-size:.8rem;color:var(--text-secondary)}.lat-msg b{color:var(--c)}',
      '.lat-note{font-size:.74rem;color:var(--text-muted);margin:.8rem 0 0;line-height:1.55}',
      '@media (prefers-reduced-motion: reduce){.lat-e,.lat-q{transition:none!important;animation:none!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }
})();
