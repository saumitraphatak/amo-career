/* remote-entanglement.html — page script, moved out of the HTML on 2026-11-27 so browsers can cache it.
   Loaded as a classic script at the same place in the page; it runs exactly as the inline block did. */
/* ═══════════════════════════════════════════════
   09 · QUANTUM REPEATER CHAIN
   Event-driven Monte Carlo of a swap-as-soon-as-possible chain of N heralded links.
   Elementary link: η = η_node·10^(−α L0/20) per photon (station in the middle),
   two-photon p = η²/2, single-photon p ≈ 2αη with F0 = 1 − α.
   Werner pairs: F = (3w+1)/4; storage w·e^(−2t/T_mem); swap w1·w2·w_swap; cutoff w < w_min.
   window.REPEATER exposes the core for tests/formula_regression.py.
   ═══════════════════════════════════════════════ */
(function () {
  const $ = id => document.getElementById(id);
  const cv = $('rpCv'); if (!cv) return;
  const CF = 299792.458 / 1.47;                                             // km/s in fiber
  const geom = (p, r) => p >= 1 ? 1 : Math.max(1, Math.ceil(Math.log(1 - r) / Math.log1p(-p)));

  function params() {
    return { D: Math.pow(10, +$('rpD').value), N: +$('rpN').value, scheme: document.querySelector('.rp-seg button[aria-pressed="true"]').dataset.sc,
      a: +$('rpA').value, F0: +$('rpF0').value, etaN: Math.pow(10, +$('rpEta').value), alpha: +$('rpAlpha').value,
      tloc: Math.pow(10, +$('rpTp').value), Tm: Math.pow(10, +$('rpTm').value), ws: +$('rpWs').value, Fcut: +$('rpCut').value };
  }
  function linkOf(P) {
    const L0 = P.D / P.N, eta = P.etaN * Math.pow(10, -P.alpha * L0 / 20);
    const p = P.scheme === 'two' ? eta * eta / 2 : Math.min(1, 2 * P.a * eta);
    const F0 = P.scheme === 'two' ? P.F0 : 1 - P.a;
    return { L0, eta, p, F0, w0: (4 * F0 - 1) / 3, tA: L0 / CF + P.tloc * 1e-6, tau: P.Tm / 2, wmin: (4 * P.Fcut - 1) / 3 };
  }
  const plob = eta => -Math.log1p(-eta) / Math.LN2;                                  // ebits per channel use (pure loss)

  function Sim(P, rnd) {
    rnd = rnd || Math.random;
    const K = linkOf(P), N = P.N, next = new Float64Array(N);
    let t = 0, links = [], events = 0;
    const wAt = (L, tt) => L.w * Math.exp(-(tt - L.tr) / K.tau);
    const dieAt = L => K.wmin <= 0 ? Infinity : L.tr + K.tau * Math.log(L.w / K.wmin);
    const restart = (s, t0) => { next[s] = t0 + geom(K.p, rnd()) * K.tA; };
    for (let s = 0; s < N; s++) restart(s, 0);
    function settle(L, cb) {                                                // after a new pair: swap ASAP, deliver
      let cur = L;
      for (;;) {
        if (cur.i === 0 && cur.j === N) {
          const F = (3 * cur.w + 1) / 4; links = []; for (let s = 0; s < N; s++) restart(s, t);
          cb && cb('deliver', { L: cur, F, t }); return true;
        }
        const nb = links.find(o => o !== cur && (o.j === cur.i || o.i === cur.j));
        if (!nb) return false;
        const [A, B] = nb.j === cur.i ? [nb, cur] : [cur, nb];
        const M = { i: A.i, j: B.j, w: wAt(A, t) * wAt(B, t) * P.ws, tr: t };
        links = links.filter(o => o !== A && o !== B);
        cb && cb('swap', { node: A.j, A, B, M, t });
        if (M.w <= K.wmin) { for (let s = M.i; s < M.j; s++) restart(s, t); cb && cb('discard', { L: M, t }); return false; }
        M.die = dieAt(M); links.push(M); cur = M;
      }
    }
    function advance(tEnd, cb, maxEv) {
      let n = 0;
      while (n < (maxEv || Infinity)) {
        let tn = Infinity, sn = -1, td = Infinity, ld = null;
        for (let s = 0; s < N; s++) if (next[s] < tn) { tn = next[s]; sn = s; }
        for (const L of links) if (L.die < td) { td = L.die; ld = L; }
        const te = Math.min(tn, td);
        if (te > tEnd) { t = tEnd; return n; }
        t = te; n++; events++;
        if (td <= tn) { links = links.filter(o => o !== ld); for (let s = ld.i; s < ld.j; s++) restart(s, t); cb && cb('discard', { L: ld, t }); continue; }
        next[sn] = Infinity;
        const L = { i: sn, j: sn + 1, w: K.w0, tr: t };
        if (L.w <= K.wmin) { restart(sn, t); continue; }
        L.die = dieAt(L); links.push(L); cb && cb('link', { L, s: sn, t });
        settle(L, cb);
      }
      return n;
    }
    return { advance, K, get t() { return t; }, get links() { return links; }, get events() { return events; }, next, wAt };
  }
  // Monte Carlo summary: rate (pairs/s) and mean delivered fidelity
  function simulate(P, maxDel, maxEv) {
    const S = Sim(P), K = S.K;
    if (K.w0 <= K.wmin || K.p <= 0) return { n: 0, rate: 0, F: NaN, T: 0 };
    let n = 0, Fs = 0;
    const cb = (k, d) => { if (k === 'deliver') { n++; Fs += d.F; } };
    while (n < maxDel && S.events < maxEv) S.advance(Infinity, cb, Math.min(1000, maxEv - S.events));
    return { n, rate: n / S.t, F: Fs / Math.max(1, n), T: S.t };
  }
  window.REPEATER = { linkOf, plob, Sim, simulate, geom };

  /* ── drawing ── */
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, X0 = 90, X1 = W - 90, YL = 400;
  const Xn = (i, N) => X0 + (X1 - X0) * i / N;
  const hue = F => Math.max(0, Math.min(1, (F - 0.5) / 0.5)) * 135;
  const fmtT = s => s >= 1 ? s.toFixed(s >= 10 ? 0 : 2) + ' s' : s >= 1e-3 ? (s * 1e3).toFixed(s >= 0.01 ? 0 : 1) + ' ms' : (s * 1e6).toFixed(0) + ' µs';
  const fmtR = r => r >= 1 ? r.toFixed(r >= 100 ? 0 : 1) + ' /s' : r > 0 ? (r * 60 >= 1 ? (r * 60).toFixed(1) + ' /min' : (r * 3600).toFixed(2) + ' /h') : '—';
  function arc(i, j, N, col, wdt, alpha, lift) {
    const xa = Xn(i, N), xb = Xn(j, N), h = Math.min(330, 36 + (xb - xa) * 0.26) + (lift || 0);
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.shadowColor = col; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(xa, YL); ctx.quadraticCurveTo((xa + xb) / 2, YL - 2 * h, xb, YL); ctx.stroke(); ctx.restore();
    return [(xa + xb) / 2, YL - h];
  }

  let P = null, S = null, warp = 1, wall = 0, lastT = null, fx = [], tally = null, msg = '';
  function estimateWarp() {
    const r = simulate(P, 12, 60000);
    if (!r.n) { msg = 'No end-to-end pair within the simulated budget: pairs decohere below the cutoff before the chain connects.'; return linkOf(P).tA * 50; }
    msg = ''; return r.T / r.n / 4;                                         // about 4 s on screen per delivered pair
  }
  function restartAnim() { S = Sim(P); fx = []; tally = { n: 0, Fs: 0, swaps: 0, disc: 0 }; warp = estimateWarp(); }
  function onEv(k, d) {
    if (k === 'link') fx.push({ k, s: d.s, w0: wall });
    else if (k === 'swap') { tally.swaps++; fx.push({ k, node: d.node, A: d.A, B: d.B, w0: wall }); }
    else if (k === 'discard') { tally.disc++; fx.push({ k, L: d.L, w0: wall }); }
    else if (k === 'deliver') { tally.n++; tally.Fs += d.F; fx.push({ k, F: d.F, n: tally.n, w0: wall }); }
  }
  function draw() {
    const N = P.N, K = S.K;
    ctx.fillStyle = '#04070d'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(148,163,184,.06)'; for (let x = 20; x < W; x += 40) for (let y = 20; y < H; y += 40) ctx.fillRect(x, y, 1.5, 1.5);
    // fiber + stations + attempts
    const covered = new Uint8Array(N); for (const L of S.links) for (let s = L.i; s < L.j; s++) covered[s] = 1;
    for (let s = 0; s < N; s++) {
      const xa = Xn(s, N), xb = Xn(s + 1, N), xm = (xa + xb) / 2;
      ctx.strokeStyle = 'rgba(56,189,248,.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa, YL); ctx.lineTo(xb, YL); ctx.stroke();
      if (!covered[s]) {
        ctx.save(); ctx.strokeStyle = 'rgba(34,211,238,.85)'; ctx.lineWidth = 3; ctx.setLineDash([3, 11]);
        ctx.lineDashOffset = -wall * 70; ctx.beginPath(); ctx.moveTo(xa + 12, YL); ctx.lineTo(xm - 8, YL); ctx.stroke();
        ctx.lineDashOffset = wall * 70; ctx.beginPath(); ctx.moveTo(xb - 12, YL); ctx.lineTo(xm + 8, YL); ctx.stroke(); ctx.restore();
      }
      ctx.save(); ctx.translate(xm, YL); ctx.rotate(Math.PI / 4); ctx.fillStyle = covered[s] ? '#1e293b' : '#0e3a4f'; ctx.strokeStyle = 'rgba(125,211,252,.7)'; ctx.lineWidth = 1.2;
      ctx.fillRect(-6, -6, 12, 12); ctx.strokeRect(-6, -6, 12, 12); ctx.restore();
    }
    // stored pairs
    for (const L of S.links) {
      const F = (3 * S.wAt(L, S.t) + 1) / 4, col = `hsl(${hue(F)},85%,58%)`;
      const [ax, ay] = arc(L.i, L.j, N, col, 3.5, 1);
      if (L.j - L.i >= 2 || N <= 4) { ctx.fillStyle = col; ctx.font = '600 15px JetBrains Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText('F ' + F.toFixed(2), ax, ay - 8); }
    }
    // effects
    fx = fx.filter(e => wall - e.w0 < 1.6);
    for (const e of fx) {
      const a = 1 - (wall - e.w0) / (e.k === 'deliver' ? 1.6 : 0.8); if (a <= 0) continue;
      if (e.k === 'link') { const xm = (Xn(e.s, N) + Xn(e.s + 1, N)) / 2; ctx.strokeStyle = `rgba(125,211,252,${a})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(xm, YL, 10 + 30 * (1 - a), 0, 2 * Math.PI); ctx.stroke(); }
      else if (e.k === 'swap') {
        const x = Xn(e.node, N); ctx.fillStyle = `rgba(240,171,252,${0.5 * a})`; ctx.beginPath(); ctx.arc(x, YL, 14 + 26 * (1 - a), 0, 2 * Math.PI); ctx.fill();
        arc(e.A.i, e.A.j, N, '#f0abfc', 2, 0.6 * a); arc(e.B.i, e.B.j, N, '#f0abfc', 2, 0.6 * a);
      } else if (e.k === 'discard') arc(e.L.i, e.L.j, N, '#ef4444', 2.5, a, 10 * (1 - a));
      else if (e.k === 'deliver') {
        const [ax, ay] = arc(0, N, N, '#fde68a', 6, a, 0);
        ctx.fillStyle = `rgba(254,243,199,${a})`; ctx.font = '700 22px JetBrains Mono, monospace'; ctx.textAlign = 'center';
        ctx.fillText(`pair #${e.n} · F = ${e.F.toFixed(3)}`, ax, ay - 14);
      }
    }
    // nodes
    const holding = new Uint8Array(N + 1); for (const L of S.links) { holding[L.i] = 1; holding[L.j] = 1; }
    for (let i = 0; i <= N; i++) {
      const x = Xn(i, N), end = i === 0 || i === N;
      const g = ctx.createRadialGradient(x, YL, 0, x, YL, end ? 24 : 18);
      g.addColorStop(0, holding[i] ? 'rgba(255,255,255,1)' : 'rgba(148,163,184,.9)'); g.addColorStop(0.45, holding[i] ? 'rgba(56,189,248,.95)' : 'rgba(71,85,105,.8)'); g.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, YL, end ? 24 : 18, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#cbd5e1'; ctx.font = (end ? '700 18px' : '600 13px') + ' JetBrains Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText(i === 0 ? 'A' : i === N ? 'B' : (N <= 8 ? 'R' + i : ''), x, YL + 44);
    }
    ctx.fillStyle = 'rgba(148,163,184,.8)'; ctx.font = '13px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${P.D.toFixed(0)} km · ${N} segment${N > 1 ? 's' : ''} of ${K.L0.toFixed(K.L0 < 10 ? 1 : 0)} km`, W / 2, YL + 84);
    if (msg) { ctx.fillStyle = '#fca5a5'; ctx.font = '600 16px Inter, sans-serif'; ctx.fillText(msg, W / 2, 120); }
    $('rpHudL').textContent = `1 s on screen = ${fmtT(warp)} of lab time`;
    $('rpHudR').textContent = `lab clock ${fmtT(S.t)}`;
  }
  function tallyOut() {
    const rows = [['Delivered pairs', tally.n], ['Lab time', fmtT(S.t)], ['Rate so far', tally.n ? fmtR(tally.n / S.t) : '—'], ['Mean fidelity', tally.n ? (tally.Fs / tally.n).toFixed(3) : '—'],
      ['Stored pairs now', S.links.length], ['Swaps', tally.swaps], ['Discarded', tally.disc], ['Attempt p', S.K.p < 1e-3 ? S.K.p.toExponential(1) : (100 * S.K.p).toFixed(2) + '%']];
    $('rpTally').innerHTML = rows.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
  }
  function frame(t) {
    if (!S) return;                                                      // reduced motion calls this before init
    const dt = lastT === null ? 0 : Math.min(0.1, (t - lastT) / 1000); lastT = t;
    wall += dt;
    if (dt) S.advance(S.t + dt * warp * +$('rpSpeed').value, onEv, 20000);
    draw(); tallyOut();
  }
  if (window.AMOMotion) AMOMotion.loop([cv], frame, { anchors: [{ el: $('rpRestart'), where: 'beforebegin', inline: true }] });
  else { const loop = t => { frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  window.addEventListener('amo:print', () => { if (S) draw(); });

  /* ── settings ── */
  function labels() {
    P = params(); const K = linkOf(P);
    $('rpDV').textContent = P.D.toFixed(0) + ' km'; $('rpNV').textContent = P.N;
    $('rpAV').textContent = P.a.toFixed(3); $('rpF0V').textContent = P.F0.toFixed(3);
    $('rpEtaV').textContent = (100 * P.etaN).toFixed(P.etaN < 0.1 ? 2 : 1) + '%'; $('rpAlphaV').textContent = P.alpha.toFixed(2) + ' dB/km';
    $('rpTpV').textContent = fmtT(P.tloc * 1e-6); $('rpTmV').textContent = fmtT(P.Tm); $('rpWsV').textContent = P.ws.toFixed(3); $('rpCutV').textContent = P.Fcut.toFixed(3);
    $('rpAwrap').hidden = P.scheme !== 'one'; $('rpFwrap').hidden = P.scheme !== 'two';
    const ed = P.etaN * Math.pow(10, -P.alpha * P.D / 10);
    $('rpDerived').innerHTML = `per photon η = ${(100 * K.eta).toPrecision(3)}% · attempt p = ${K.p.toExponential(2)} · attempt time ${fmtT(K.tA)} · mean wait per segment ${fmtT(K.tA / K.p)} · F₀ = ${K.F0.toFixed(3)}<br>` +
      `repeaterless bound over ${P.D.toFixed(0)} km: ${fmtR(plob(ed) / (P.tloc * 1e-6))} (η = ${ed.toExponential(1)}, one use per ${fmtT(P.tloc * 1e-6)})`;
  }
  let deb = 0;
  function changed() { labels(); restartAnim(); clearTimeout(deb); deb = setTimeout(sweep, 500); }
  ['rpD', 'rpN', 'rpA', 'rpF0', 'rpEta', 'rpAlpha', 'rpTp', 'rpTm', 'rpWs', 'rpCut'].forEach(id => $(id).addEventListener('input', changed));
  document.querySelectorAll('.rp-seg button').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.rp-seg button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); changed(); }));
  $('rpRestart').addEventListener('click', () => restartAnim());
  $('rpUseCalc').addEventListener('click', () => {                         // η_node from the rate calculator (no frequency conversion)
    const NA = +$('r-na').value / 10, fc = +$('r-fc').value / 100, det = +$('r-det').value / 100, pu = +$('r-pu').value;
    const coll = pu > 1 ? (pu - 1) / pu * 0.85 : (1 - Math.sqrt(1 - NA * NA)) / 2;
    const e = coll * fc * det; $('rpEta').value = Math.max(+$('rpEta').min, Math.min(+$('rpEta').max, Math.log10(e))); changed();
  });

  /* ── distance sweep ── */
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888';
  const NS = [1, 2, 4, 8, 16], DS = [10, 20, 50, 100, 200, 300, 500, 750, 1000], COL = { 1: '#64748b', 2: '#0ea5e9', 4: '#22c55e', 8: '#f59e0b', 16: '#ef4444' };
  let rateC = null, fidC = null, swTok = 0, res = null;
  function charts() {
    if (!window.Chart) return;
    const tc = css('--text-secondary'), gc = css('--border-med'), mut = css('--text-muted');
    const bound = DS.map(D => { const e = P.etaN * Math.pow(10, -P.alpha * D / 10); return { x: D, y: plob(e) / (P.tloc * 1e-6) }; });
    const rateSets = NS.map(N => ({ label: N === 1 ? 'direct (1 segment)' : `${N} segments`, data: res[N].map((r, k) => ({ x: DS[k], y: r && r.n ? r.rate : null })), borderColor: COL[N], backgroundColor: COL[N], borderWidth: N === P.N ? 3 : 1.6, pointRadius: N === P.N ? 4 : 2.5, spanGaps: false }));
    rateSets.push({ label: 'repeaterless bound', data: bound, borderColor: mut, borderDash: [6, 4], borderWidth: 1.6, pointRadius: 0 });
    const fidSets = NS.map(N => ({ label: N === 1 ? 'direct' : `${N} seg.`, data: res[N].map((r, k) => ({ x: DS[k], y: r && r.n ? r.F : null })), borderColor: COL[N], backgroundColor: COL[N], borderWidth: N === P.N ? 3 : 1.6, pointRadius: N === P.N ? 4 : 2.5 }));
    const opts = (yLog, ytitle, ymin, ymax) => ({ responsive: true, maintainAspectRatio: false, animation: false, parsing: false,
      scales: { x: { type: 'logarithmic', min: 10, max: 1000, title: { display: true, text: 'distance A → B (km)', color: tc }, ticks: { color: tc, maxRotation: 0, autoSkip: false, callback: v => [10, 20, 50, 100, 200, 500, 1000].includes(v) ? v : '' }, grid: { color: gc } },
                y: Object.assign({ type: yLog ? 'logarithmic' : 'linear', min: yLog ? 1e-8 : undefined, title: { display: true, text: ytitle, color: tc }, ticks: { color: tc }, grid: { color: gc } }, ymin !== undefined ? { min: ymin, max: ymax } : {}) },
      plugins: { legend: { labels: { color: tc, boxWidth: 14 } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${yLog ? fmtR(c.parsed.y) : c.parsed.y.toFixed(3)}` } } } });
    if (rateC) { rateC.data.datasets = rateSets; rateC.options = opts(true, 'end-to-end pairs per second'); rateC.update('none'); }
    else rateC = new Chart($('rpRate'), { type: 'line', data: { datasets: rateSets }, options: opts(true, 'end-to-end pairs per second') });
    rateC.options.scales.y.ticks.callback = v => { const l = Math.log10(v); return Math.abs(l - Math.round(l)) < 1e-9 ? '10' + String(Math.round(l)).replace(/-/g, '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]) : ''; };
    rateC.update('none');
    if (fidC) { fidC.data.datasets = fidSets; fidC.options = opts(false, 'mean delivered fidelity', 0.5, 1); fidC.update('none'); }
    else fidC = new Chart($('rpFid'), { type: 'line', data: { datasets: fidSets }, options: opts(false, 'mean delivered fidelity', 0.5, 1) });
  }
  function sweep() {
    const tok = ++swTok, P0 = Object.assign({}, P), jobs = [];
    res = {}; NS.forEach(N => { res[N] = DS.map(() => null); DS.forEach((D, k) => jobs.push([N, k])); });
    let done = 0;
    $('rpSweepNote').textContent = 'Running the distance sweep…';
    const step = () => {
      if (tok !== swTok) return;
      const t0 = performance.now();
      while (done < jobs.length && performance.now() - t0 < 30) {
        const [N, k] = jobs[done++]; res[N][k] = simulate(Object.assign({}, P0, { N, D: DS[k] }), 150, 300000);
      }
      if (done % 9 === 0 || done === jobs.length) charts();
      if (done < jobs.length) { setTimeout(step, 0); return; }
      charts();
      const missing = NS.reduce((m, N) => m + res[N].filter(r => !r || !r.n).length, 0);
      $('rpSweepNote').textContent = `Each point: event-driven Monte Carlo of up to 150 delivered pairs with the parameters above (thick line = your segment count). ` +
        (missing ? `${missing} point${missing > 1 ? 's' : ''} delivered nothing within the simulated budget and are left out. ` : '') +
        `The repeaterless bound uses the same node efficiency and one channel use per local overhead time.`;
    };
    setTimeout(step, 0);
  }
  new MutationObserver(() => { if (res) charts(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  labels(); restartAnim(); draw(); tallyOut(); setTimeout(sweep, 400);
})();
