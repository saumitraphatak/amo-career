/* remote-entanglement.html — page script, moved out of the HTML on 2026-11-27 so browsers can cache it.
   Loaded as a classic script at the same place in the page; it runs exactly as the inline block did. */
/* ═══════════════════════════════════════════════
   HERO · a two-photon heralded link, as in Hofmann et al., Science 337, 72 (2012)
   Each atom emits a photon entangled with its spin; the photons meet at a 50:50 fiber
   beam splitter; a PBS in each output port sends H and V to separate APDs.
   Coincidences H1V2 / V1H2 herald |Ψ−⟩, H1V1 / H2V2 herald |Ψ+⟩; |Φ±⟩ put both photons
   into one detector and cannot be told apart, so at most half of the arrivals herald.
   Photon loss is shown far less often than in a real link (illustrative).
   ═══════════════════════════════════════════════ */
(function () {
  const cv = document.getElementById('entHeroCv'); if (!cv) return;
  const ctx = cv.getContext('2d'), S = cv.width / 720, W = 720, H = cv.height / S, TAU = 2 * Math.PI;
  const A = [72, 300], B = [648, 300], BS = [360, 214], P1 = [250, 140], P2 = [470, 140];
  const DET = { H1: [250, 72], V1: [176, 140], H2: [470, 72], V2: [544, 140] }, LOGIC = [360, 40];
  const COL = { pho: '255,214,102', H: '251,191,36', V: '56,189,248', ok: '52,211,153', bad: '248,113,113', ex: '192,132,252' };
  const fibA = t => bez([150, 300], [250, 302], [300, 250], [BS[0] - 14, BS[1] + 12], t);
  const fibB = t => bez([570, 300], [470, 302], [420, 250], [BS[0] + 14, BS[1] + 12], t);
  const outP = (port, t) => port === 1 ? bez([BS[0] - 12, BS[1] - 12], [320, 180], [280, 160], P1, t) : bez([BS[0] + 12, BS[1] - 12], [400, 180], [440, 160], P2, t);
  function bez(p0, p1, p2, p3, t) { const m = 1 - t; return [m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]; }
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

  // one attempt: losses (illustrative 25% each), then a Bell outcome with probability 1/4 each
  function attempt() {
    const lostA = Math.random() < 0.25 ? 0.3 + 0.5 * Math.random() : null, lostB = Math.random() < 0.25 ? 0.3 + 0.5 * Math.random() : null;
    if (lostA !== null || lostB !== null) return { lostA, lostB, clicks: [], herald: null };
    const r = Math.floor(Math.random() * 4);
    if (r === 0) return { clicks: Math.random() < .5 ? ['H1', 'V2'] : ['V1', 'H2'], herald: 'Ψ⁻' };
    if (r === 1) return { clicks: Math.random() < .5 ? ['H1', 'V1'] : ['H2', 'V2'], herald: 'Ψ⁺' };
    const d = ['H1', 'V1', 'H2', 'V2'][Math.floor(Math.random() * 4)];
    return { clicks: [d, d], herald: null, bunched: true };
  }
  const STATIC = { clicks: ['H1', 'V2'], herald: 'Ψ⁻' };
  let cur = attempt(), t0 = null, tally = { n: 0, h: 0 };
  const CYCLE = 5.2;

  function glow(x, y, r, rgb, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.3, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  let small = false;                                                       // phones: larger labels, no footer
  function text(s, x, y, col, size, weight, align) { ctx.fillStyle = col; ctx.font = `${weight || 500} ${(size || 11) * (small ? 1.4 : 1)}px JetBrains Mono, monospace`; ctx.textAlign = align || 'center'; ctx.fillText(s, x, y); }
  function path(fn, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const p = fn(i / 40); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); }
  function detRoute(d) {                                                   // PBS centre → detector
    const p = d[1] === '1' ? P1 : P2; return t => lerp(p, DET[d], t);
  }

  function draw(tt, R) {
    small = (cv.clientWidth || 720) < 500;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.fillStyle = '#04070d'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(148,163,184,.06)'; for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) ctx.fillRect(x, y, 1, 1);
    // BSM enclosure
    ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1.2;
    ctx.strokeRect(150, 14, 420, 228); ctx.setLineDash([]);
    if (!small) text('Bell-state measurement', 160, 232, 'rgba(203,213,225,.75)', 10, 600, 'left');
    // fibers
    path(fibA, 'rgba(56,189,248,.35)', 3); path(fibB, 'rgba(56,189,248,.35)', 3);
    path(t => outP(1, t), 'rgba(56,189,248,.35)', 3); path(t => outP(2, t), 'rgba(56,189,248,.35)', 3);
    for (const d of ['H1', 'V1', 'H2', 'V2']) { const p = d[1] === '1' ? P1 : P2; ctx.strokeStyle = 'rgba(148,163,184,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(DET[d][0], DET[d][1]); ctx.stroke(); }
    // coincidence wiring
    ctx.strokeStyle = 'rgba(148,163,184,.18)'; ctx.lineWidth = 1;
    for (const d in DET) { ctx.beginPath(); ctx.moveTo(DET[d][0], DET[d][1] - 12); ctx.lineTo(LOGIC[0], LOGIC[1] + 12); ctx.stroke(); }
    // fiber beam splitter
    ctx.fillStyle = '#0f1b2d'; ctx.strokeStyle = 'rgba(125,211,252,.8)'; ctx.lineWidth = 1.5;
    ctx.fillRect(BS[0] - 22, BS[1] - 13, 44, 26); ctx.strokeRect(BS[0] - 22, BS[1] - 13, 44, 26);
    ctx.strokeStyle = 'rgba(125,211,252,.8)'; ctx.beginPath(); ctx.moveTo(BS[0] - 14, BS[1] + 8); ctx.bezierCurveTo(BS[0] - 4, BS[1], BS[0] + 4, BS[1], BS[0] + 14, BS[1] - 8); ctx.moveTo(BS[0] + 14, BS[1] + 8); ctx.bezierCurveTo(BS[0] + 4, BS[1], BS[0] - 4, BS[1], BS[0] - 14, BS[1] - 8); ctx.stroke();
    text('50:50 fiber BS', BS[0], BS[1] + 50, 'rgba(203,213,225,.85)', 10, 600);
    // PBS cubes
    for (const [p, lab] of [[P1, '1'], [P2, '2']]) {
      ctx.fillStyle = '#0f1b2d'; ctx.strokeStyle = 'rgba(203,213,225,.75)'; ctx.lineWidth = 1.4;
      ctx.fillRect(p[0] - 13, p[1] - 13, 26, 26); ctx.strokeRect(p[0] - 13, p[1] - 13, 26, 26);
      ctx.beginPath(); lab === '1' ? (ctx.moveTo(p[0] + 13, p[1] - 13), ctx.lineTo(p[0] - 13, p[1] + 13)) : (ctx.moveTo(p[0] - 13, p[1] - 13), ctx.lineTo(p[0] + 13, p[1] + 13)); ctx.stroke();
      text('PBS ' + lab, p[0] + (lab === '1' ? 30 : -30), p[1] + 30, 'rgba(203,213,225,.7)', 9, 600);
    }
    // detectors
    const click = {}; const tc = 2.55;
    if (tt >= tc) for (const d of R.clicks) click[d] = (click[d] || 0) + 1;
    for (const d in DET) {
      const [x, y] = DET[d], on = click[d], a = on ? Math.max(0.35, 1 - (tt - tc) / 2) : 0, pol = d[0] === 'H' ? COL.H : COL.V;
      if (on) glow(x, y, 26, pol, a * 0.9);
      ctx.fillStyle = on ? `rgba(${pol},${0.35 + 0.5 * a})` : '#0f1b2d'; ctx.strokeStyle = `rgba(${pol},.9)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 15, y - 11, 30, 22, 5) : ctx.rect(x - 15, y - 11, 30, 22); ctx.fill(); ctx.stroke();
      text(d[0] + (d[1] === '1' ? '₁' : '₂'), x, y + 4, on ? '#04070d' : `rgba(${pol},1)`, 11, 700);
      if (on === 2 && !small) text('2 photons', x, y - 17, `rgba(${COL.bad},${a})`, 9, 700);
    }
    // coincidence logic box + verdict
    ctx.fillStyle = '#0f1b2d'; ctx.strokeStyle = 'rgba(148,163,184,.55)'; ctx.lineWidth = 1.2;
    ctx.fillRect(LOGIC[0] - 70, LOGIC[1] - 14, 140, 28); ctx.strokeRect(LOGIC[0] - 70, LOGIC[1] - 14, 140, 28);
    let verdict = 'coincidence logic', vcol = 'rgba(203,213,225,.8)';
    if (tt >= tc + 0.15) {
      if (R.herald) { verdict = `${R.clicks.map(d => d[0] + (d[1] === '1' ? '₁' : '₂')).join('+')} → |${R.herald}⟩`; vcol = `rgba(${COL.ok},1)`; }
      else if (R.bunched) { verdict = small ? 'no herald' : 'one detector: no herald'; vcol = `rgba(${COL.bad},1)`; }
    }
    if (R.lostA !== null && R.lostA !== undefined || R.lostB !== null && R.lostB !== undefined) { if (tt >= 1.8) { verdict = small ? 'photon lost' : 'photon lost: retry'; vcol = `rgba(${COL.bad},1)`; } }
    text(verdict, LOGIC[0], LOGIC[1] + 4, vcol, 11, 700);
    // atoms, tweezers, objectives
    for (const [p, lab, dir] of [[A, 'atom A', 1], [B, 'atom B', -1]]) {
      const tw = ctx.createLinearGradient(p[0], p[1] - 70, p[0], p[1] + 70);
      tw.addColorStop(0, 'rgba(239,68,68,0)'); tw.addColorStop(0.5, 'rgba(239,68,68,.28)'); tw.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.fillStyle = tw; ctx.beginPath(); ctx.moveTo(p[0] - 14, p[1] - 70); ctx.quadraticCurveTo(p[0], p[1], p[0] - 14, p[1] + 70); ctx.lineTo(p[0] + 14, p[1] + 70); ctx.quadraticCurveTo(p[0], p[1], p[0] + 14, p[1] - 70); ctx.closePath(); ctx.fill();
      const ex = Math.max(0, 1 - Math.abs(tt - 0.25) / 0.2);
      if (ex > 0) glow(p[0], p[1], 30, COL.ex, ex);
      glow(p[0], p[1], 14, '96,165,250', 1);
      const lx = p[0] + dir * 46;
      ctx.strokeStyle = 'rgba(56,189,248,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx + dir * 8, p[1]); ctx.lineTo(dir > 0 ? 150 : 570, p[1]); ctx.stroke();
      ctx.strokeStyle = 'rgba(203,213,225,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(lx, p[1], 6, 26, 0, 0, TAU); ctx.stroke();
      text(lab, p[0], p[1] + 58, 'rgba(226,232,240,.95)', 12, 700);
      if (!small) text(dir > 0 ? 'trap 1' : 'trap 2', p[0], p[1] + 74, 'rgba(148,163,184,.8)', 9, 500);
    }
    // flying photons (violet = polarization entangled with its atom; H/V colour after its PBS)
    const fly = (fn, lostAt, u) => { if (u <= 0) return; if (lostAt !== null && lostAt !== undefined && u > lostAt) { const q = fn(lostAt), a = 1 - (u - lostAt) * 5; if (a > 0) { glow(q[0], q[1], 9, COL.bad, a); text('✗', q[0], q[1] - 12, `rgba(${COL.bad},${a})`, 12, 700); } return; } const q = fn(Math.min(u, 1)); glow(q[0], q[1], 10, COL.pho, 1); };
    const u1 = seg(tt, 0.45, 1.55);
    if (u1 < 1) { fly(fibA, R.lostA, u1); fly(fibB, R.lostB, u1); }
    if (R.clicks.length && tt >= 1.55 && tt < tc) {
      const u2 = seg(tt, 1.6, 2.05), u3 = seg(tt, 2.05, tc);
      R.clicks.forEach((d, i) => {
        const port = +d[1], off = R.clicks[0] === R.clicks[1] ? (i ? 4 : -4) : 0;
        if (u2 < 1) { const q = outP(port, u2); glow(q[0] + off, q[1], 10, COL.pho, 1); }
        else { const q = detRoute(d)(u3), pol = d[0] === 'H' ? COL.H : COL.V; glow(q[0] + off, q[1], 10, pol, 1); }
      });
    }
    // herald back to the nodes, then the shared Bell pair
    if (R.herald && tt > 3.0) {
      const u = seg(tt, 3.0, 3.6);
      ctx.setLineDash([6, 6]); ctx.strokeStyle = `rgba(${COL.ok},.85)`; ctx.lineWidth = 2;
      for (const p of [A, B]) { const end = lerp([LOGIC[0], LOGIC[1] + 14], [p[0], p[1] - 22], u); ctx.beginPath(); ctx.moveTo(LOGIC[0], LOGIC[1] + 14); ctx.lineTo(end[0], end[1]); ctx.stroke(); }
      ctx.setLineDash([]);
      if (tt > 3.6) {
        const v = seg(tt, 3.6, 4.1), x1 = A[0] + (B[0] - A[0]) * v;
        ctx.strokeStyle = `rgba(${COL.ok},1)`; ctx.lineWidth = 3; ctx.shadowColor = `rgba(${COL.ok},1)`; ctx.shadowBlur = 12;
        ctx.beginPath(); for (let x = A[0]; x <= x1; x += 3) { const y = A[1] + 40 + 4 * Math.sin((x - A[0]) / 9 - tt * 6); x === A[0] ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.shadowBlur = 0;
        if (v >= 1) text(`atoms share |${R.herald}⟩ · photons are gone`, W / 2, A[1] + 30, `rgba(${COL.ok},1)`, 12, 700);
      }
    }
    // footer
    if (!small) text(`attempts ${tally.n} · heralds ${tally.h} · losses shown far less often than in a real link`, W / 2, H - 10, 'rgba(148,163,184,.75)', 9, 500);
  }

  function frame(t) {
    if (t0 === null) t0 = t;
    let tt = (t - t0) / 1000;
    if (tt > CYCLE) { cur = attempt(); t0 = t; tt = 0; }
    if (tt >= 2.6 && !cur.counted) { cur.counted = true; tally.n++; if (cur.herald) tally.h++; }
    draw(tt, cur);
  }
  const still = () => draw(4.6, STATIC);
  if (window.AMOMotion) AMOMotion.loop([cv], frame, { anchors: [{ el: document.querySelector('.ent-hero-note'), where: 'beforebegin' }], onStatic: still });
  else { const loop = t => { frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  window.addEventListener('amo:print', still);
})();
