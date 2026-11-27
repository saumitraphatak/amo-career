/* learn-quantum.html — page script, moved out of the HTML on 2026-11-27 so browsers can cache it.
   Loaded as a classic script at the same place in the page; it runs exactly as the inline block did. */
/* ═══════════════════════════════════════════════
   CHSH GAME with |Φ⁺⟩: P(a = b) = cos²(θA − θB) for x–z-plane measurements
   ═══════════════════════════════════════════════ */
(function () {
  const ids = ['chA0', 'chA1', 'chB0', 'chB1'];
  if (!document.getElementById('chA0')) return;
  const deg = Math.PI / 180, fmt = v => (v < 0 ? '−' : '') + Math.abs(v) + '°';
  let wins = 0, rounds = 0;
  const ang = () => ids.map(id => +document.getElementById(id).value * deg);
  function pWin([a0, a1, b0, b1]) {
    const c2 = d => Math.cos(d) ** 2;
    return (c2(a0 - b0) + c2(a0 - b1) + c2(a1 - b0) + (1 - c2(a1 - b1))) / 4;
  }
  function render() {
    ids.forEach(id => document.getElementById(id + 'v').textContent = fmt(+document.getElementById(id).value));
    const A = ang(), p = pWin(A), E = d => Math.cos(2 * d);                  // correlator ⟨ab⟩ in ±1 units
    const S = Math.abs(E(A[0] - A[2]) + E(A[0] - A[3]) + E(A[1] - A[2]) - E(A[1] - A[3]));
    const played = rounds ? `played ${rounds.toLocaleString()} rounds: won ${(100 * wins / rounds).toFixed(1)}% ± ${(100 * Math.sqrt(p * (1 - p) / rounds)).toFixed(1)}%` : 'press Play to sample rounds';
    document.getElementById('chOut').innerHTML =
      `predicted win rate ${(100 * p).toFixed(1)}% · S = ${S.toFixed(3)} ${S > 2 + 1e-9 ? '<b style="color:#1c805b">(> 2: no classical strategy can do this)</b>' : '(≤ 2: a classical strategy could match it)'}<br>${played}`;
    const shown = rounds ? wins / rounds : p;
    document.getElementById('chFill').style.width = Math.max(0, Math.min(100, (shown - 0.5) / 0.5 * 100)) + '%';
  }
  function play() {
    const A = ang();
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() < 0.5 ? 1 : 0, y = Math.random() < 0.5 ? 1 : 0;
      const same = Math.random() < Math.cos(A[x] - A[2 + y]) ** 2;
      if (same !== (x === 1 && y === 1)) wins++;
      rounds++;
    }
    render();
  }
  ids.forEach(id => document.getElementById(id).addEventListener('input', () => { wins = 0; rounds = 0; render(); }));
  document.getElementById('chPlay').addEventListener('click', play);
  document.getElementById('chReset').addEventListener('click', () => { wins = 0; rounds = 0; render(); });
  document.getElementById('chBest').addEventListener('click', () => {
    [0, 45, 22.5, -22.5].forEach((v, i) => document.getElementById(ids[i]).value = v); wins = 0; rounds = 0; render();
  });
  render();
})();

/* ═══════════════════════════════════════════════
   TELEPORTATION: Bob's state for each outcome, and his average without the bits
   ═══════════════════════════════════════════════ */
(function () {
  const grid = document.getElementById('tpGrid');
  if (!grid) return;
  // Bloch-vector action of Bob's pre-correction state X^m2 Z^m1 |ψ⟩
  const bob = (r, m1, m2) => { let [x, y, z] = r; if (m1) { x = -x; y = -y; } if (m2) { y = -y; z = -z; } return [x, y, z]; };
  window.TELEPORT = { bob };                                    // for the regression test
  const CASES = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const FIX = { '00': 'I', '01': 'X', '10': 'Z', '11': 'ZX' };
  const panels = [['in', 'Alice\'s |ψ⟩']].concat(CASES.map(([a, b]) => [`${a}${b}`, `m₁m₂ = ${a}${b} · Bob fixes with ${FIX[`${a}${b}`]}`])).concat([['avg', 'Bob, before the bits arrive']]);
  grid.innerHTML = panels.map(([k, t]) => `<figure class="tele-fig" data-k="${k}"><canvas width="150" height="150" data-export-ready="true" aria-label="Bloch sphere: ${t}"></canvas><figcaption>${t}</figcaption></figure>`).join('');
  const cvs = {}; grid.querySelectorAll('.tele-fig').forEach(f => { cvs[f.dataset.k] = f.querySelector('canvas'); });
  const sTh = document.getElementById('tpTh'), sPh = document.getElementById('tpPh');
  let picked = null, fixed = false;
  function sphere(cv, vec, col, opts = {}) {
    const ctx = LQ_INK.wrap(cv.getContext('2d')), R = 52, CX = 75, CY = 72, az = Math.PI / 6, el = Math.PI / 7;
    const P = (x, y, z) => { const xr = x * Math.cos(az) - y * Math.sin(az), yr = x * Math.sin(az) + y * Math.cos(az); return [CX + R * xr, CY - R * (z * Math.cos(el) + yr * Math.sin(el))]; };
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 2 * Math.PI); ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); for (let i = 0; i <= 64; i++) { const t = 2 * Math.PI * i / 64, q = P(Math.cos(t), Math.sin(t), 0); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.font = '9px Inter, sans-serif'; ctx.fillStyle = '#5c503c';
    const t0 = P(0, 0, 1.18), t1 = P(0, 0, -1.3), tx = P(1.25, 0, 0);
    ctx.fillText('|0⟩', t0[0] - 7, t0[1]); ctx.fillText('|1⟩', t1[0] - 7, t1[1] + 4); ctx.fillText('x', tx[0] - 2, tx[1] + 3);
    if (opts.ghosts) opts.ghosts.forEach(g => { const q = P(...g); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#8c8066'; ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.setLineDash([]); });
    const len = Math.hypot(...vec);
    if (len < 1e-6) { ctx.beginPath(); ctx.arc(CX, CY, 5, 0, 2 * Math.PI); ctx.fillStyle = col; ctx.fill(); return; }
    const q = P(...vec);
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(q[0], q[1]); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.beginPath(); ctx.arc(q[0], q[1], 4.5, 0, 2 * Math.PI); ctx.fillStyle = col; ctx.fill();
  }
  function draw() {
    const th = +sTh.value * Math.PI / 180, ph = +sPh.value * Math.PI / 180;
    document.getElementById('tpThV').textContent = sTh.value + '°'; document.getElementById('tpPhV').textContent = sPh.value + '°';
    const r = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
    sphere(cvs.in, r, '#7a4ff7');
    const all = CASES.map(([a, b]) => bob(r, a, b));
    CASES.forEach(([a, b], i) => {
      const k = `${a}${b}`, isPick = picked === k;
      sphere(cvs[k], isPick && fixed ? r : all[i], isPick ? (fixed ? '#1c805b' : '#926a03') : '#076ce7', isPick && fixed ? { ghosts: [all[i]] } : {});
      cvs[k].parentElement.classList.toggle('pick', isPick); cvs[k].parentElement.classList.toggle('dim', picked !== null && !isPick);
    });
    const avg = [0, 1, 2].map(j => all.reduce((s, v) => s + v[j], 0) / 4);
    sphere(cvs.avg, avg, '#e20b0b', { ghosts: all });
    const out = document.getElementById('tpOut');
    if (picked === null) out.innerHTML = `Bloch vector of |ψ⟩ = (${r.map(v => v.toFixed(2)).join(', ')}). Average of Bob's four possible states = (${avg.map(v => Math.abs(v).toFixed(2)).join(', ')}): the maximally mixed state.`;
    else if (!fixed) out.innerHTML = `Alice measured m₁m₂ = ${picked} (probability 25%). Bob's qubit now points at (${all[CASES.findIndex(c => c.join('') === picked)].map(v => v.toFixed(2)).join(', ')}), but he can't know that until the two bits arrive.`;
    else out.innerHTML = `Bob received “${picked}” and applied ${FIX[picked]}: his qubit is now exactly |ψ⟩. Alice's copy was destroyed by her measurement, so nothing was cloned, and nothing outran the classical message.`;
  }
  [sTh, sPh].forEach(s => s.addEventListener('input', () => { picked = null; fixed = false; document.getElementById('tpFix').disabled = true; draw(); }));
  document.getElementById('tpRun').addEventListener('click', () => { picked = CASES[Math.floor(Math.random() * 4)].join(''); fixed = false; document.getElementById('tpFix').disabled = false; draw(); });
  document.getElementById('tpFix').addEventListener('click', () => { if (picked) { fixed = true; document.getElementById('tpFix').disabled = true; draw(); } });
  draw();
  LQ_INK.onTheme && LQ_INK.onTheme(draw);
  window.addEventListener('amo:print', draw);
})();

/* ═══════════════════════════════════════════════
   REPETITION CODE: syndrome, minimum-weight decoding, and the threshold crossing
   ═══════════════════════════════════════════════ */
(function () {
  const chain = document.getElementById('repChain');
  if (!chain) return;
  const syndrome = e => e.slice(0, -1).map((v, i) => v ^ e[i + 1]);
  // the two error patterns consistent with a syndrome are e and its complement; pick the lighter one
  function decode(s) {
    const a = [0]; s.forEach((v, i) => a.push(a[i] ^ v));
    const w = a.reduce((x, y) => x + y, 0);
    return 2 * w <= a.length ? a : a.map(v => 1 - v);
  }
  const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  const pL = (d, p) => { let s = 0; for (let k = Math.floor(d / 2) + 1; k <= d; k++) s += binom(d, k) * Math.pow(p, k) * Math.pow(1 - p, d - k); return s; };
  window.REPCODE = { syndrome, decode, pL };                       // for the regression test
  let d = 5, err = new Array(5).fill(0);
  function render() {
    const s = syndrome(err), c = decode(s), w = err.reduce((x, y) => x + y, 0);
    const fail = c.some((v, i) => v !== err[i]);
    let html = '';
    err.forEach((v, i) => {
      html += `<button type="button" class="rep-q${v ? ' flip' : ''}${c[i] ? ' fix' : ''}" data-i="${i}" aria-pressed="${!!v}" aria-label="data qubit ${i + 1}${v ? ', flipped' : ''}">${v ? 1 : 0}</button>`;
      if (i < err.length - 1) html += `<span class="rep-s${s[i] ? ' lit' : ''}" aria-label="parity check ${i + 1}: ${s[i] ? 'disagree' : 'agree'}"></span>`;
    });
    chain.innerHTML = html;
    const lit = s.map((v, i) => v ? i + 1 : null).filter(Boolean);
    document.getElementById('repOut').innerHTML =
      `${w} flip${w === 1 ? '' : 's'} · lit checks: ${lit.length ? lit.join(', ') : 'none'} · decoder flips back qubit${c.filter(Boolean).length === 1 ? '' : 's'}: ${c.map((v, i) => v ? i + 1 : null).filter(Boolean).join(', ') || 'none'}<br>` +
      (w === 0 ? 'Stored bit intact, all checks quiet.' : !fail ? `<span style="color:#1c805b">Corrected ✓</span> (the code handles up to ${(d - 1) / 2} flips).`
        : `<span style="color:#cf0a0a">Logical error ✗</span>: ${w} of ${d} flipped, so the lighter explanation (${d - w} flip${d - w === 1 ? '' : 's'}) is wrong and the decoder completes the logical flip. The checks can't tell.`);
    chain.querySelectorAll('.rep-q').forEach(b => b.addEventListener('click', () => { err[+b.dataset.i] ^= 1; render(); }));
  }
  document.querySelectorAll('[data-rep-d]').forEach(b => b.addEventListener('click', () => {
    d = +b.dataset.repD; err = new Array(d).fill(0);
    document.querySelectorAll('[data-rep-d]').forEach(o => o.classList.toggle('active', o === b)); render();
  }));
  document.getElementById('repClear').addEventListener('click', () => { err = new Array(d).fill(0); render(); });
  render();

  // threshold chart
  const DS = [1, 3, 5, 7], COL = { 1: '#8c8066', 3: '#076ce7', 5: '#7a4ff7', 7: '#1c805b' };
  let chart = null, mc = {};
  const sP = document.getElementById('repP');
  function drawChart() {
    if (!window.Chart) return;
    const ps = Array.from({ length: 121 }, (_, i) => 0.005 + i * 0.6 / 120);
    const ds = DS.map(dd => ({ label: dd === 1 ? 'd = 1 (unencoded)' : `d = ${dd}`, data: ps.map(p => ({ x: 100 * p, y: Math.max(1e-9, pL(dd, p)) })), borderColor: COL[dd], borderWidth: 1.8, pointRadius: 0 }));
    DS.forEach(dd => { if (mc[dd]) ds.push({ label: `MC d = ${dd}`, data: [mc[dd]], borderColor: COL[dd], backgroundColor: COL[dd], pointRadius: 5, pointStyle: 'rectRot', showLine: false }); });
    const p = +sP.value;
    ds.push({ label: 'your p', data: [{ x: 100 * p, y: 1e-9 }, { x: 100 * p, y: 1 }], borderColor: '#e20b0b', borderDash: [4, 4], borderWidth: 1.2, pointRadius: 0 });
    if (chart) { chart.data.datasets = ds; chart.update('none'); return; }
    chart = new Chart(document.getElementById('repChart'), {
      type: 'line', data: { datasets: ds },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false, parsing: false,
        scales: {
          x: { type: 'linear', min: 0, max: 60, title: { display: true, text: 'Physical flip probability p (%)', color: '#5c503c' }, ticks: { color: '#5c503c' } },
          y: { type: 'logarithmic', min: 1e-6, max: 1, title: { display: true, text: 'Logical error p_L', color: '#5c503c' }, ticks: { color: '#5c503c', callback: v => [1, 1e-2, 1e-4, 1e-6].includes(v) ? v.toExponential(0) : '' } },
        },
        plugins: { legend: { labels: { color: '#22190f', filter: i => !/^MC|your p/.test(i.text), boxWidth: 14 } },
                   tooltip: { callbacks: { label: c => ` ${c.dataset.label}: p_L = ${c.parsed.y.toExponential(2)} at p = ${c.parsed.x.toFixed(1)}%` } } },
      },
    });
  }
  sP.addEventListener('input', () => { document.getElementById('repPV').textContent = Math.round(100 * +sP.value) + '%'; mc = {}; drawChart(); });
  document.getElementById('repRun').addEventListener('click', () => {
    const p = +sP.value, shots = 20000;
    DS.forEach(dd => {
      let fails = 0;
      for (let n = 0; n < shots; n++) {
        const e = Array.from({ length: dd }, () => Math.random() < p ? 1 : 0), c = decode(syndrome(e));
        if (c.some((v, i) => v !== e[i])) fails++;
      }
      mc[dd] = { x: 100 * p, y: Math.max(1e-6, fails / shots) };
    });
    drawChart();
    document.getElementById('repOut').innerHTML += `<br>At p = ${Math.round(100 * p)}%: ` + DS.map(dd => `d=${dd}: ${(100 * mc[dd].y).toFixed(mc[dd].y < 0.01 ? 3 : 1)}% (theory ${(100 * pL(dd, p)).toFixed(pL(dd, p) < 0.01 ? 3 : 1)}%)`).join(' · ');
  });
  drawChart();
  window.addEventListener('amo:print', drawChart);
})();

/* ═══════════════════════════════════════════════
   MAGIC STATES: Clifford grid vs Clifford + T
   Two random walks from |0⟩, one with {H, S}, one with {H, T}, on a shared
   rotatable view. The state is a complex 2-vector; each frame applies a few
   random gates and records the Bloch vector.
   ═══════════════════════════════════════════════ */
(function () {
  const cvC = document.getElementById('mgCliffCanvas'), cvU = document.getElementById('mgUnivCanvas');
  if (!cvC || !cvU) return;
  const R = 95, CX = 130, CY = 140, r2 = Math.SQRT1_2;
  // gates as [[a, b], [c, d]] of complex numbers [re, im]
  const G = {
    H: [[[r2, 0], [r2, 0]], [[r2, 0], [-r2, 0]]],
    S: [[[1, 0], [0, 0]], [[0, 0], [0, 1]]],
    T: [[[1, 0], [0, 0]], [[0, 0], [r2, r2]]],
  };
  const cm = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
  const ca = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const apply = (g, s) => [ca(cm(g[0][0], s[0]), cm(g[0][1], s[1])), ca(cm(g[1][0], s[0]), cm(g[1][1], s[1]))];
  const bloch = s => {
    const [a, b] = s, ab = [a[0] * b[0] + a[1] * b[1], a[0] * b[1] - a[1] * b[0]];   // a* b
    return [2 * ab[0], 2 * ab[1], a[0] * a[0] + a[1] * a[1] - b[0] * b[0] - b[1] * b[1]];
  };
  const BINS_Z = 10, BINS_P = 20;          // 200 equal-area cells (uniform in z and φ)
  function walk(gates) {
    return { gates, s: [[1, 0], [0, 0]], pts: [[0, 0, 1]], trail: [[0, 0, 1]], seen: new Map(), cells: new Set(), steps: 0 };
  }
  let W = { c: walk(['H', 'S']), u: walk(['H', 'T']) };
  function step(w) {
    const g = w.gates[Math.random() < 0.5 ? 0 : 1];
    w.s = apply(G[g], w.s);
    const n = Math.hypot(w.s[0][0], w.s[0][1], w.s[1][0], w.s[1][1]);           // keep it normalised
    w.s = w.s.map(c => [c[0] / n, c[1] / n]);
    const p = bloch(w.s);
    w.steps++;
    const key = p.map(v => Math.round(v * 1e6)).join(',');
    w.seen.set(key, (w.seen.get(key) || 0) + 1);
    const zi = Math.min(BINS_Z - 1, Math.floor((p[2] + 1) / 2 * BINS_Z));
    const pi = Math.min(BINS_P - 1, Math.floor(((Math.atan2(p[1], p[0]) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * BINS_P));
    w.cells.add(zi * BINS_P + pi);
    if (w.pts.length < 5000) w.pts.push(p);
    w.trail.push(p); if (w.trail.length > 5) w.trail.shift();
  }
  let view = { az: Math.PI / 6, el: Math.PI / 5 };
  const proj = (x, y, z) => {
    if (window.AMO3D && AMO3D.project) { const q = AMO3D.project(view, x, y, z); return [CX + R * q[0], CY - R * q[1], q[2]]; }
    const ca_ = Math.cos(view.az), sa = Math.sin(view.az), ce = Math.cos(view.el), se = Math.sin(view.el);
    const xr = x * ca_ - y * sa, yr = x * sa + y * ca_;
    return [CX + R * xr, CY - R * (z * ce + yr * se), z * se - yr * ce];
  };
  function circle(ctx, f, color, a1, a0) {
    for (const front of [false, true]) {
      ctx.beginPath(); let pen = false;
      for (let i = 0; i <= 96; i++) {
        const q = proj(...f(2 * Math.PI * i / 96));
        if ((q[2] >= 0) === front) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; } else pen = false;
      }
      ctx.globalAlpha = front ? a1 : a0; ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  const V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const VL = ['|+⟩', '|−⟩', '|+i⟩', '|−i⟩', '|0⟩', '|1⟩'];
  function draw(cv, w, accent, isCliff) {
    const ctx = LQ_INK.wrap(cv.getContext('2d'));
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 2 * Math.PI); ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1.5; ctx.stroke();
    circle(ctx, t => [Math.cos(t), Math.sin(t), 0], '#1e3a5f', 0.8, 0.25);
    circle(ctx, t => [Math.sin(t), 0, Math.cos(t)], '#1e3a5f', 0.5, 0.15);
    // stabilizer octahedron
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#8c8066'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
      if (V[i].some((v, k) => v !== 0 && V[j][k] === -v)) continue;          // skip antipodal pairs
      const a = proj(...V[i]), b = proj(...V[j]);
      ctx.globalAlpha = (a[2] + b[2]) / 2 >= 0 ? 0.7 : 0.25;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.setLineDash([]);
    // visited states
    if (isCliff) {
      w.seen.forEach((n, key) => {
        const p = key.split(',').map(v => +v / 1e6), q = proj(...p);
        ctx.globalAlpha = q[2] < 0 ? 0.45 : 1;
        ctx.beginPath(); ctx.arc(q[0], q[1], 3 + 1.4 * Math.log10(1 + n), 0, 2 * Math.PI); ctx.fillStyle = accent; ctx.fill();
      });
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = accent;
      for (const p of w.pts) { const q = proj(...p); ctx.globalAlpha = q[2] < 0 ? 0.22 : 0.7; ctx.fillRect(q[0] - 1.2, q[1] - 1.2, 2.4, 2.4); }
      ctx.globalAlpha = 1;
    }
    // last few steps
    ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.globalAlpha = 0.35; ctx.beginPath();
    w.trail.forEach((p, i) => { const q = proj(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.globalAlpha = 1;
    const cur = proj(...w.trail[w.trail.length - 1]);
    ctx.beginPath(); ctx.arc(cur[0], cur[1], 5, 0, 2 * Math.PI); ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke();
    // |T⟩ = T|+⟩ at φ = 45° on the equator
    const tq = proj(r2, r2, 0);
    ctx.beginPath(); ctx.arc(tq[0], tq[1], 4.5, 0, 2 * Math.PI); ctx.fillStyle = '#7a4ff7'; ctx.fill();
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = '#7a4ff7'; ctx.fillText('|T⟩', tq[0] + 6, tq[1] - 4);
    // vertex labels
    ctx.fillStyle = '#5c503c'; ctx.font = '11px Inter, sans-serif';
    V.forEach((p, i) => { if (i === 2 || i === 3) return; const q = proj(p[0] * 1.14, p[1] * 1.14, p[2] * 1.14); ctx.fillText(VL[i], q[0] - 8, q[1] + 4); });
  }
  function info() {
    const c = W.c, u = W.u;
    document.getElementById('mgCliffInfo').textContent = `${c.steps} gates · ${c.seen.size} distinct states (always ≤ 6)`;
    document.getElementById('mgUnivInfo').textContent = `${u.steps} gates · ${(100 * u.cells.size / (BINS_Z * BINS_P)).toFixed(0)}% of the sphere visited (200 equal-area cells)`;
  }
  let acc = 0, last = null;
  function frame(t) {
    const dt = last === null ? 0 : Math.min(100, t - last); last = t;
    acc += dt;
    const n = Math.floor(acc / 25); acc -= n * 25;                    // ~40 gates per second per walk
    for (let i = 0; i < n; i++) { step(W.c); step(W.u); }
    draw(cvC, W.c, '#e20b0b', true); draw(cvU, W.u, '#076ce7', false); info();
  }
  if (window.AMO3D && AMO3D.orbit) {
    view = AMO3D.orbit([cvC, cvU], { az: Math.PI / 6, el: Math.PI / 5, label: 'Bloch spheres of the two random walks', onChange: () => frame(last || 0) });
  }
  document.getElementById('mgRestart').addEventListener('click', () => { W = { c: walk(['H', 'S']), u: walk(['H', 'T']) }; frame(last || 0); });
  // reduced motion / static frame: precompute a few hundred steps so the picture already makes the point
  for (let i = 0; i < 600; i++) { step(W.c); step(W.u); }
  const tick = LQ_INK.track(frame);
  if (window.AMOMotion) AMOMotion.loop([cvC, cvU], tick, { anchors: [{ el: document.getElementById('mgRestart'), where: 'afterend' }] });
  else requestAnimationFrame(function f(ts) { tick(ts); requestAnimationFrame(f); });
  frame(0);

  // classical cost readout
  const fmtBytes = b => {
    const u = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0; while (b >= 1000 && i < u.length - 1) { b /= 1000; i++; }
    return (b >= 1000 ? b.toExponential(1) : b.toFixed(b < 10 ? 1 : 0)) + ' ' + u[i];
  };
  function cost() {
    const N = +document.getElementById('mgN').value, t = +document.getElementById('mgT').value;
    document.getElementById('mgNLbl').textContent = N; document.getElementById('mgTLbl').textContent = t;
    const sv = 16 * Math.pow(2, N), tab = 2 * N * (2 * N + 1) / 8;
    const lo = Math.pow(2, 0.23 * t), hi = Math.pow(2, 0.5 * t);
    const fx = v => v < 1e4 ? v.toFixed(v < 10 ? 1 : 0) : '10^' + Math.log10(v).toFixed(1);
    document.getElementById('mgCost').innerHTML =
      `state vector: ${fmtBytes(sv)}<br>stabilizer tableau: ${fmtBytes(tab)}` +
      (t ? `<br>× magic overhead ≈ ${fx(lo)} to ${fx(hi)} (t = ${t})` : '<br>Clifford-only: polynomial time');
  }
  ['mgN', 'mgT'].forEach(id => document.getElementById(id).addEventListener('input', cost));
  cost();
})();

/* ═══════════════════════════════════════════════
   LIVE 2D ROTATED SURFACE CODE & Yb-171 ERASURE DECODER
   Exact rotated surface code (d=3, d=5) with Dijkstra + bitmask-DP MWPM
   erasure-weighted decoder and Monte Carlo Pauli vs. Erasure race.
   ═══════════════════════════════════════════════ */
(function () {
  function buildCode(d) {
    const nData = d * d;
    const zChecks = [], xChecks = [];
    // Interior plaquettes
    for (let r = 0; r < d - 1; r++) {
      for (let c = 0; c < d - 1; c++) {
        const qs = [r * d + c, r * d + (c + 1), (r + 1) * d + c, (r + 1) * d + (c + 1)];
        if ((r + c) % 2 === 0) zChecks.push({ type: 'Z', r: r + 0.5, c: c + 0.5, qs, bnd: null });
        else xChecks.push({ type: 'X', r: r + 0.5, c: c + 0.5, qs, bnd: null });
      }
    }
    // Boundary weight-2 Z-checks (left & right)
    for (let r = 1; r < d - 1; r += 2) {
      zChecks.push({ type: 'Z', r: r + 0.5, c: -0.35, qs: [r * d, (r + 1) * d], bnd: 'L' });
    }
    for (let r = 0; r < d - 1; r += 2) {
      zChecks.push({ type: 'Z', r: r + 0.5, c: d - 1 + 0.35, qs: [r * d + (d - 1), (r + 1) * d + (d - 1)], bnd: 'R' });
    }
    // Boundary weight-2 X-checks (top & bottom)
    for (let c = 0; c < d - 1; c += 2) {
      xChecks.push({ type: 'X', r: -0.35, c: c + 0.5, qs: [c, c + 1], bnd: 'T' });
    }
    for (let c = 1; c < d - 1; c += 2) {
      xChecks.push({ type: 'X', r: d - 1 + 0.35, c: c + 0.5, qs: [(d - 1) * d + c, (d - 1) * d + c + 1], bnd: 'B' });
    }

    // Build matching graphs: each data qubit connects exactly 2 vertices (check or boundary)
    function buildGraph(checks, isA, isB) {
      const nCheck = checks.length;
      const nVert = nCheck + 2; // nCheck = bndA, nCheck+1 = bndB
      const qToCheck = Array.from({ length: nData }, () => []);
      checks.forEach((ch, idx) => ch.qs.forEach(q => qToCheck[q].push(idx)));
      const adj = Array.from({ length: nVert }, () => []);
      const edges = [];
      for (let q = 0; q < nData; q++) {
        const r = Math.floor(q / d), c = q % d;
        const verts = qToCheck[q].slice();
        if (isA(r, c)) verts.push(nCheck);
        if (isB(r, c)) verts.push(nCheck + 1);
        const u = verts[0], v = verts[1];
        edges.push({ q, u, v });
        adj[u].push({ to: v, q });
        adj[v].push({ to: u, q });
      }
      return { nCheck, nVert, bndA: nCheck, bndB: nCheck + 1, adj, edges };
    }

    const zGraph = buildGraph(zChecks, r => r === 0, r => r === d - 1);
    const xGraph = buildGraph(xChecks, (_, c) => c === 0, (_, c) => c === d - 1);
    return { d, nData, zChecks, xChecks, zGraph, xGraph };
  }

  function syndrome(checks, err) {
    return checks.map(ch => ch.qs.reduce((acc, q) => acc ^ (err[q] ? 1 : 0), 0));
  }

  function dijkstra(graph, src, weights) {
    const n = graph.nVert;
    const dist = new Float64Array(n).fill(1e9);
    const prevV = new Int32Array(n).fill(-1);
    const prevQ = new Int32Array(n).fill(-1);
    const used = new Uint8Array(n);
    dist[src] = 0;
    for (let iter = 0; iter < n; iter++) {
      let u = -1, best = 1e9;
      for (let i = 0; i < n; i++) if (!used[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u === -1) break;
      used[u] = 1;
      const nbrs = graph.adj[u];
      for (let k = 0; k < nbrs.length; k++) {
        const e = nbrs[k];
        const nd = best + weights[e.q];
        if (nd < dist[e.to]) {
          dist[e.to] = nd;
          prevV[e.to] = u;
          prevQ[e.to] = e.q;
        }
      }
    }
    return { dist, prevV, prevQ };
  }

  function tracePath(res, src, dst) {
    const qs = [];
    let cur = dst;
    while (cur !== src && cur !== -1) {
      qs.push(res.prevQ[cur]);
      cur = res.prevV[cur];
    }
    return qs;
  }

  function decodeGraph(code, graph, syn, erased) {
    const lit = [];
    for (let i = 0; i < syn.length; i++) if (syn[i]) lit.push(i);
    const corr = new Uint8Array(code.nData);
    if (lit.length === 0) return { corr, paths: [] };

    const weights = new Float64Array(code.nData);
    for (let q = 0; q < code.nData; q++) weights[q] = erased && erased[q] ? 0.005 : 1.0;

    const m = lit.length;
    const sp = lit.map(v => dijkstra(graph, v, weights));
    // Best boundary cost and target for each lit vertex
    const bCost = new Float64Array(m), bNode = new Int32Array(m);
    for (let i = 0; i < m; i++) {
      const dA = sp[i].dist[graph.bndA], dB = sp[i].dist[graph.bndB];
      if (dA <= dB) { bCost[i] = dA; bNode[i] = graph.bndA; }
      else { bCost[i] = dB; bNode[i] = graph.bndB; }
    }

    const pairs = [];
    if (m <= 12) {
      const N = 1 << m;
      const dp = new Float64Array(N).fill(1e9);
      const choice = new Int32Array(N).fill(-1);
      dp[0] = 0;
      for (let mask = 1; mask < N; mask++) {
        let i = 0; while (!((mask >> i) & 1)) i++;
        const rest = mask ^ (1 << i);
        let best = bCost[i] + dp[rest], bestC = -1;
        for (let j = i + 1; j < m; j++) {
          if ((rest >> j) & 1) {
            const cost = sp[i].dist[lit[j]] + dp[rest ^ (1 << j)];
            if (cost < best) { best = cost; bestC = j; }
          }
        }
        dp[mask] = best;
        choice[mask] = bestC;
      }
      let mask = N - 1;
      while (mask > 0) {
        let i = 0; while (!((mask >> i) & 1)) i++;
        const c = choice[mask];
        if (c === -1) {
          pairs.push([i, -1]);
          mask ^= (1 << i);
        } else {
          pairs.push([i, c]);
          mask ^= (1 << i) | (1 << c);
        }
      }
    } else {
      const alive = new Uint8Array(m).fill(1);
      for (let i = 0; i < m; i++) {
        if (!alive[i]) continue;
        alive[i] = 0;
        let best = bCost[i], bestJ = -1;
        for (let j = i + 1; j < m; j++) {
          if (alive[j] && sp[i].dist[lit[j]] < best) { best = sp[i].dist[lit[j]]; bestJ = j; }
        }
        if (bestJ !== -1) { alive[bestJ] = 0; pairs.push([i, bestJ]); }
        else pairs.push([i, -1]);
      }
    }

    const paths = [];
    pairs.forEach(([i, j]) => {
      const dst = j === -1 ? bNode[i] : lit[j];
      const qs = tracePath(sp[i], lit[i], dst);
      paths.push(qs);
      qs.forEach(q => { corr[q] ^= 1; });
    });
    return { corr, paths };
  }

  function evaluate(code, errX, errZ, erased) {
    const synZ = syndrome(code.zChecks, errX);
    const synX = syndrome(code.xChecks, errZ);
    const decX = decodeGraph(code, code.zGraph, synZ, erased);
    const decZ = decodeGraph(code, code.xGraph, synX, erased);
    let logX = 0, logZ = 0;
    for (let c = 0; c < code.d; c++) logX ^= (errX[c] ^ decX.corr[c]);
    for (let r = 0; r < code.d; r++) logZ ^= (errZ[r * code.d] ^ decZ.corr[r * code.d]);
    return { synZ, synX, corrX: decX.corr, corrZ: decZ.corr, logX: !!logX, logZ: !!logZ, failed: !!(logX || logZ) };
  }

  function runMonteCarlo(d, p, erasureFrac, shots) {
    const code = buildCode(d);
    let fails = 0;
    const errX = new Uint8Array(code.nData);
    const errZ = new Uint8Array(code.nData);
    const erased = new Uint8Array(code.nData);
    for (let s = 0; s < shots; s++) {
      errX.fill(0); errZ.fill(0); erased.fill(0);
      let any = false;
      for (let q = 0; q < code.nData; q++) {
        if (Math.random() < p) {
          if (Math.random() < erasureFrac) {
            erased[q] = 1;
            if (Math.random() < 0.5) { errX[q] = 1; any = true; }
            if (Math.random() < 0.5) { errZ[q] = 1; any = true; }
          } else {
            const r = Math.random();
            if (r < 1 / 3) { errX[q] = 1; }
            else if (r < 2 / 3) { errZ[q] = 1; }
            else { errX[q] = 1; errZ[q] = 1; }
            any = true;
          }
        }
      }
      if (any && evaluate(code, errX, errZ, erased).failed) fails++;
    }
    return fails / shots;
  }

  window.SURFCODE = { buildCode, syndrome, decodeGraph, evaluate, runMonteCarlo };

  const svg = document.getElementById('scSvg');
  if (!svg) return;

  let d = 3, tool = 'X';
  let code = buildCode(d);
  let errX = new Uint8Array(code.nData);
  let errZ = new Uint8Array(code.nData);
  let erased = new Uint8Array(code.nData);
  let lastDecode = null;

  function resetState(newD) {
    if (newD) { d = newD; code = buildCode(d); }
    errX = new Uint8Array(code.nData);
    errZ = new Uint8Array(code.nData);
    erased = new Uint8Array(code.nData);
    lastDecode = null;
    const dSpan = document.getElementById('scRaceD');
    if (dSpan) dSpan.textContent = d;
    render();
  }

  function render() {
    const W = 420, pad = 68;
    const step = (W - 2 * pad) / (d - 1);
    const px = c => pad + c * step;
    const py = r => pad + r * step;
    const synZ = syndrome(code.zChecks, errX);
    const synX = syndrome(code.xChecks, errZ);

    let out = `<defs>
      <filter id="scGlowC" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="scGlowA" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`;

    out += `<text x="${W / 2}" y="18" text-anchor="middle" fill="#f59e0b" font-family="JetBrains Mono,monospace" font-size="10" opacity="0.8">Z BOUNDARY (X_L runs Top ↔ Bottom)</text>`;
    out += `<text x="${W / 2}" y="${W - 8}" text-anchor="middle" fill="#f59e0b" font-family="JetBrains Mono,monospace" font-size="10" opacity="0.8">Z BOUNDARY</text>`;
    out += `<text x="14" y="${W / 2}" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono,monospace" font-size="10" opacity="0.8" transform="rotate(-90 14 ${W / 2})">X BOUNDARY (Z_L runs Left ↔ Right)</text>`;
    out += `<text x="${W - 14}" y="${W / 2}" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono,monospace" font-size="10" opacity="0.8" transform="rotate(90 ${W - 14} ${W / 2})">X BOUNDARY</text>`;

    function drawPlaquette(ch, lit, color) {
      const fillOp = lit ? 0.42 : 0.10;
      const strokeOp = lit ? 0.98 : 0.34;
      const cls = lit ? ' class="sc-lit"' : '';
      if (!ch.bnd) {
        const r0 = Math.floor(ch.r), c0 = Math.floor(ch.c);
        const x0 = px(c0), y0 = py(r0);
        out += `<rect${cls} x="${x0}" y="${y0}" width="${step}" height="${step}" rx="4" fill="${color}" fill-opacity="${fillOp}" stroke="${color}" stroke-opacity="${strokeOp}" stroke-width="${lit ? 2.4 : 1.1}"${lit ? ' filter="url(#scGlowA)"' : ''}/>`;
      } else {
        const q0 = ch.qs[0], q1 = ch.qs[1];
        const x0 = px(q0 % d), y0 = py(Math.floor(q0 / d));
        const x1 = px(q1 % d), y1 = py(Math.floor(q1 / d));
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        const bulge = step * 0.42;
        let cx = mx, cy = my;
        if (ch.bnd === 'L') cx -= bulge;
        if (ch.bnd === 'R') cx += bulge;
        if (ch.bnd === 'T') cy -= bulge;
        if (ch.bnd === 'B') cy += bulge;
        out += `<path${cls} d="M${x0},${y0} Q${cx},${cy} ${x1},${y1} Z" fill="${color}" fill-opacity="${fillOp}" stroke="${color}" stroke-opacity="${strokeOp}" stroke-width="${lit ? 2.4 : 1.1}"${lit ? ' filter="url(#scGlowA)"' : ''}/>`;
      }
      const lx = px(ch.c), ly = py(ch.r);
      out += `<text x="${lx}" y="${ly + 4}" text-anchor="middle" fill="${lit ? '#ffffff' : color}" font-family="JetBrains Mono,monospace" font-size="${d === 3 ? 11 : 9.5}" font-weight="${lit ? 700 : 500}" opacity="${lit ? 1 : 0.65}">${ch.type}${lit ? '!' : ''}</text>`;
    }

    code.zChecks.forEach((ch, i) => drawPlaquette(ch, !!synZ[i], '#f59e0b'));
    code.xChecks.forEach((ch, i) => drawPlaquette(ch, !!synX[i], '#38bdf8'));

    const qR = d === 3 ? 16 : 12.5;
    for (let q = 0; q < code.nData; q++) {
      const r = Math.floor(q / d), c = q % d;
      const x = px(c), y = py(r);
      const hx = errX[q], hz = errZ[q], he = erased[q];
      const fx = lastDecode && lastDecode.corrX[q];
      const fz = lastDecode && lastDecode.corrZ[q];
      let fill = '#0f172a', stroke = '#475569', lbl = '';
      if (hx && hz) { fill = '#7c3aed'; stroke = '#e879f9'; lbl = 'Y'; }
      else if (hx) { fill = '#991b1b'; stroke = '#f87171'; lbl = 'X'; }
      else if (hz) { fill = '#312e81'; stroke = '#818cf8'; lbl = 'Z'; }
      if (he && !lbl) { fill = '#083344'; stroke = '#22d3ee'; lbl = 'E'; }

      out += `<g class="sc-q-hit" data-q="${q}" role="button" tabindex="0" aria-label="Data qubit row ${r + 1} column ${c + 1}${he ? ', erased' : ''}${hx ? ', X error' : ''}${hz ? ', Z error' : ''}">`;
      if (he) {
        out += `<circle cx="${x}" cy="${y}" r="${qR + 5.5}" fill="none" stroke="#22d3ee" stroke-width="2.4" stroke-dasharray="4 2.5" filter="url(#scGlowC)"/>`;
      }
      if (fx || fz) {
        out += `<circle cx="${x}" cy="${y}" r="${qR + (he ? 9 : 4.5)}" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="3 2"/>`;
      }
      out += `<circle class="sc-q-ring" cx="${x}" cy="${y}" r="${qR}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      if (lbl) {
        out += `<text x="${x}" y="${y + 4}" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono,monospace" font-size="${d === 3 ? 12 : 10}" font-weight="700">${lbl}</text>`;
      } else {
        out += `<text x="${x}" y="${y + 3.5}" text-anchor="middle" fill="#64748b" font-family="JetBrains Mono,monospace" font-size="${d === 3 ? 9.5 : 8.5}">q${q}</text>`;
      }
      out += `</g>`;
    }
    svg.innerHTML = out;

    svg.querySelectorAll('.sc-q-hit').forEach(g => {
      const act = () => {
        const q = +g.dataset.q;
        lastDecode = null;
        if (tool === 'X') errX[q] ^= 1;
        else if (tool === 'Z') errZ[q] ^= 1;
        else {
          if (erased[q]) { erased[q] = 0; }
          else {
            erased[q] = 1;
            if (!errX[q] && !errZ[q]) {
              if (Math.random() < 0.5) errX[q] = 1; else errZ[q] = 1;
            }
          }
        }
        render();
      };
      g.addEventListener('click', act);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });

    const nX = errX.reduce((a, b) => a + b, 0);
    const nZ = errZ.reduce((a, b) => a + b, 0);
    const nE = erased.reduce((a, b) => a + b, 0);
    const litZ = synZ.reduce((a, b) => a + b, 0);
    const litX = synX.reduce((a, b) => a + b, 0);
    const st = document.getElementById('scStatus');
    if (!lastDecode) {
      st.className = 'sc-status';
      if (nX + nZ + nE === 0) {
        st.innerHTML = `Lattice clean (d=${d}, ${code.nData} data + ${code.zChecks.length + code.xChecks.length} ancilla qubits). Click any qubit to inject an error, or pick a demo.`;
      } else {
        st.innerHTML = `Active errors: <b>${nX} X</b>, <b>${nZ} Z</b>, <b>${nE} <sup>171</sup>Yb erasure${nE === 1 ? '' : 's'}</b> &middot; Lit syndromes: <b>${litZ} Z-check</b>, <b>${litX} X-check</b>. Press <b>Decode &amp; Heal</b> to run minimum-weight matching.`;
      }
    } else if (!lastDecode.failed) {
      st.className = 'sc-status ok';
      const fixCount = lastDecode.corrX.reduce((a, b) => a + b, 0) + lastDecode.corrZ.reduce((a, b) => a + b, 0);
      st.innerHTML = `<b>Logical qubit healed ✓</b> — Decoder applied ${fixCount} recovery flip${fixCount === 1 ? '' : 's'} (green dashed rings). Residual error is a trivial stabilizer; logical state intact.`;
    } else {
      st.className = 'sc-status fail';
      const which = [lastDecode.logX ? 'X_L' : '', lastDecode.logZ ? 'Z_L' : ''].filter(Boolean).join(' & ');
      st.innerHTML = `<b>Logical ${which} error ✗</b> — The decoder satisfied every stabilizer, but its shorter recovery path completed a non-trivial chain across the lattice. Try flagging those same qubits as <b><sup>171</sup>Yb erasures</b>!`;
    }
  }

  document.querySelectorAll('[data-sc-d]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-sc-d]').forEach(b => b.classList.toggle('active', b === btn));
    resetState(+btn.dataset.scD);
  }));

  document.querySelectorAll('[data-sc-tool]').forEach(btn => btn.addEventListener('click', () => {
    tool = btn.dataset.scTool;
    document.querySelectorAll('[data-sc-tool]').forEach(b => b.classList.remove('active-x', 'active-z', 'active-e'));
    btn.classList.add(tool === 'X' ? 'active-x' : tool === 'Z' ? 'active-z' : 'active-e');
  }));

  document.getElementById('scDecodeBtn').addEventListener('click', () => {
    lastDecode = evaluate(code, errX, errZ, erased);
    render();
  });
  document.getElementById('scClearBtn').addEventListener('click', () => resetState());
  document.getElementById('scRandBtn').addEventListener('click', () => {
    resetState();
    const p = +document.getElementById('scRaceP').value / 100;
    for (let q = 0; q < code.nData; q++) {
      if (Math.random() < p) {
        if (tool === 'E') {
          erased[q] = 1;
          if (Math.random() < 0.5) errX[q] = 1;
          if (Math.random() < 0.5) errZ[q] = 1;
        } else {
          const r = Math.random();
          if (r < 0.34) errX[q] = 1;
          else if (r < 0.67) errZ[q] = 1;
          else { errX[q] = 1; errZ[q] = 1; }
        }
      }
    }
    render();
  });

  document.getElementById('scPreSingle').addEventListener('click', () => {
    resetState();
    const mid = Math.floor(d / 2) * d + Math.floor(d / 2);
    errX[mid] = 1;
    lastDecode = evaluate(code, errX, errZ, erased);
    render();
  });
  document.getElementById('scPrePauliFail').addEventListener('click', () => {
    if (d !== 3) {
      document.querySelectorAll('[data-sc-d]').forEach(b => b.classList.toggle('active', +b.dataset.scD === 3));
      resetState(3);
    } else resetState();
    errX[0] = 1; errX[3] = 1;
    lastDecode = evaluate(code, errX, errZ, erased);
    render();
  });
  document.getElementById('scPreErasureWin').addEventListener('click', () => {
    if (d !== 3) {
      document.querySelectorAll('[data-sc-d]').forEach(b => b.classList.toggle('active', +b.dataset.scD === 3));
      resetState(3);
    } else resetState();
    errX[0] = 1; errX[3] = 1; erased[0] = 1; erased[3] = 1;
    lastDecode = evaluate(code, errX, errZ, erased);
    render();
  });

  const raceP = document.getElementById('scRaceP');
  const racePV = document.getElementById('scRacePV');
  raceP.addEventListener('input', () => { racePV.textContent = (+raceP.value).toFixed(1) + '%'; });
  function runRace() {
    const p = +raceP.value / 100;
    const shots = d === 3 ? 1500 : 800;
    const rPauli = runMonteCarlo(d, p, 0.0, shots);
    const rErasure = runMonteCarlo(d, p, 0.98, shots);
    document.getElementById('scPauliRate').textContent = (rPauli * 100).toFixed(2) + '%';
    document.getElementById('scErasureRate').textContent = (rErasure * 100).toFixed(2) + '%';
    const scale = Math.max(0.05, rPauli, rErasure);
    document.getElementById('scPauliBar').style.width = Math.min(100, (rPauli / scale) * 100) + '%';
    document.getElementById('scErasureBar').style.width = Math.min(100, (rErasure / scale) * 100) + '%';
    const ratio = rErasure > 0 ? (rPauli / rErasure).toFixed(1) + '× lower logical error' : '0 logical errors in ' + shots + ' shots';
    document.getElementById('scRaceSummary').innerHTML =
      `At <b>p = ${(p * 100).toFixed(1)}%</b> on d=${d} (${shots.toLocaleString()} shots): <sup>171</sup>Yb erasure conversion achieved <b>${ratio}</b> than unflagged Pauli noise.`;
  }
  document.getElementById('scRaceRun').addEventListener('click', runRace);

  render();
  runRace();
})();
