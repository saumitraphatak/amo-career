/* remote-entanglement.html — page script, moved out of the HTML on 2026-11-27 so browsers can cache it.
   Loaded as a classic script at the same place in the page; it runs exactly as the inline block did. */
  /* ─── Protocol step widget: the two-photon polarization link of Hofmann et al. (2012) ───
     Each ⁸⁷Rb atom: pump to |F=1, m_F=0⟩, π pulse to |F′=0, m_F′=0⟩, decay to m_F = ∓1 with σ± light
     (Volz et al. 2006): (|↓⟩|σ⁺⟩ + |↑⟩|σ⁻⟩)/√2. Photons interfere on a 50:50 fiber BS; PBSs + 4 APDs.
     H₁V₂ / V₁H₂ → |Ψ⁻⟩, H₁V₁ / H₂V₂ → |Ψ⁺⟩, Φ± → both photons in one detector (no herald). */
  const STEPS = [
    { label: '① Prepare',
      desc: '<strong>Optical pumping puts each atom in the same state</strong>, |F=1, m<sub>F</sub>=0⟩ (call it |0⟩). The two atoms are in a product state |0⟩<sub>A</sub>|0⟩<sub>B</sub>: nothing connects them yet, and the qubit states |↓⟩ = m<sub>F</sub>=−1 and |↑⟩ = m<sub>F</sub>=+1 are empty.' },
    { label: '② Excite → emit',
      desc: '<strong>A short π pulse lifts each atom to |F′=0, m<sub>F′</sub>=0⟩.</strong> From there it can decay to |↓⟩ by emitting σ⁺ light or to |↑⟩ by emitting σ⁻ (decay back to m<sub>F</sub>=0 gives π light, which is not emitted along the collection axis). The atom ends up entangled with the polarization of the photon it sent into the fiber: (|↓⟩|σ⁺⟩ + |↑⟩|σ⁻⟩)/√2, the state measured by Volz et al. (2006).' },
    { label: '③ Photons → station',
      desc: '<strong>Both photons fly to the Bell-state measurement</strong> (in Hofmann et al. 2012, through 5 m and 30 m of fiber from labs 20 m apart). Fiber birefringence is undone with waveplates so σ⁺ → H and σ⁻ → V, and the photons must arrive with the same timing, frequency and spatial mode so that they are indistinguishable (section 04). Rewriting the four-qubit state shows why measuring the photons entangles the atoms: |Ψ⟩<sub>A</sub>|Ψ⟩<sub>B</sub> = ½ Σ<sub>β</sub> |β⟩<sub>atoms</sub>|β⟩<sub>photons</sub>, summed over the four Bell states β.' },
    { label: '④ Interfere + detect',
      desc: '<strong>Two-photon interference sorts the Bell states.</strong> Photons in |Ψ⁻⟩ always leave the 50:50 beam splitter by different ports and, after the PBSs, click H₁+V₂ or V₁+H₂. Photons in |Ψ⁺⟩ leave by the same port with orthogonal polarizations: H₁+V₁ or H₂+V₂. Photons in |Φ±⟩ end up in the same port with the same polarization, so both hit one detector, which cannot tell one photon from two. Only two of the four Bell states are identified: the 50% limit of linear optics.' },
    { label: '⑤ Herald',
      desc: '<strong>A coincidence is the herald.</strong> It tells both nodes, over a classical channel, that the atoms now share the same Bell state the photons were projected onto: (|↑↓⟩ − |↓↑⟩)/√2 for H₁V₂/V₁H₂, (|↑↓⟩ + |↓↑⟩)/√2 for H₁V₁/H₂V₂, and a local rotation can turn one into the other. Every attempt succeeds with probability η<sub>A</sub>η<sub>B</sub>/2. Hofmann et al. recorded 3,637 heralds in about 107 hours with fidelity ≈ 0.81 for both states.' },
  ];
  let currentStep = 0, stepT0 = null;
  const pcv = document.getElementById('protoCv'), pctx = pcv ? pcv.getContext('2d') : null;
  // wide: 1000 × 400, everything on one row. Phones: 480 × 640, level diagrams on top, nodes + station below, text 1.2× larger.
  const PS = 2, PT = 2 * Math.PI;
  let PW, PH, DY, FS, LEVX, NODE, PBS_, PBS0, PDET, XC, pnarrow = null;
  function playout() {
    const n = pcv ? (pcv.clientWidth || 1000) < 600 : false;
    if (n === pnarrow) return false; pnarrow = n;
    PW = n ? 480 : 1000; PH = n ? 640 : 400; DY = n ? 190 : 0; FS = n ? 1.2 : 1; XC = PW / 2;
    NODE = n ? [{ x: 50, lab: 'atom A' }, { x: 430, lab: 'atom B' }] : [{ x: 120, lab: 'atom A' }, { x: 880, lab: 'atom B' }];
    LEVX = n ? [120, 360] : [120, 880];
    const dx = n ? 70 : 80;
    PBS_ = [[XC - dx, 196 + DY], [XC + dx, 196 + DY]]; PBS0 = [XC, 286 + DY];
    PDET = { H1: [XC - dx, 134 + DY], V1: [XC - dx - 68, 196 + DY], H2: [XC + dx, 134 + DY], V2: [XC + dx + 68, 196 + DY] };
    if (pcv) { pcv.width = PW * PS; pcv.height = PH * PS; pcv.style.aspectRatio = PW + ' / ' + PH; }
    return true;
  }
  playout();
  const PC = { ex: '192,132,252', pho: '255,214,102', H: '251,191,36', V: '56,189,248', ok: '52,211,153', bad: '248,113,113', dim: 'rgba(148,163,184,.45)', txt: 'rgba(226,232,240,.95)', mut: 'rgba(148,163,184,.85)' };
  const pz = (x, a, b) => Math.max(0, Math.min(1, (x - a) / (b - a)));
  const pl = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function pglow(x, y, r, rgb, a) { const g = pctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.3, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); pctx.fillStyle = g; pctx.beginPath(); pctx.arc(x, y, r, 0, PT); pctx.fill(); }
  function ptext(s, x, y, col, size, w, al) { pctx.fillStyle = col; pctx.font = `${w || 500} ${(size || 13) * FS}px JetBrains Mono, monospace`; pctx.textAlign = al || 'center'; pctx.fillText(s, x, y); }
  function parrow(x1, y1, x2, y2, col, w, dash) {
    pctx.strokeStyle = col; pctx.fillStyle = col; pctx.lineWidth = w || 2; pctx.setLineDash(dash || []);
    pctx.beginPath(); pctx.moveTo(x1, y1); pctx.lineTo(x2, y2); pctx.stroke(); pctx.setLineDash([]);
    const a = Math.atan2(y2 - y1, x2 - x1); pctx.beginPath(); pctx.moveTo(x2, y2); pctx.lineTo(x2 - 9 * Math.cos(a - .4), y2 - 9 * Math.sin(a - .4)); pctx.lineTo(x2 - 9 * Math.cos(a + .4), y2 - 9 * Math.sin(a + .4)); pctx.fill();
  }
  // level diagram of one atom; pop: {m0, e, dn, up} occupation weights 0..1
  function levels(cx, pop, opts) {
    const y0 = 48, y1 = 156, xs = { dn: cx - 52, m0: cx, up: cx + 52 };
    pctx.strokeStyle = 'rgba(203,213,225,.8)'; pctx.lineWidth = 2;
    pctx.beginPath(); pctx.moveTo(cx - 22, y0); pctx.lineTo(cx + 22, y0); pctx.stroke();
    for (const k of ['dn', 'm0', 'up']) { pctx.beginPath(); pctx.moveTo(xs[k] - 18, y1); pctx.lineTo(xs[k] + 18, y1); pctx.stroke(); }
    ptext("F′=0", cx + 30, y0 + 4, PC.mut, 11, 500, 'left');
    ptext('|↓⟩', xs.dn, y1 + 20, PC.txt, 13, 700); ptext('|0⟩', xs.m0, y1 + 20, PC.mut, 12, 600); ptext('|↑⟩', xs.up, y1 + 20, PC.txt, 13, 700);
    ptext('m=−1', xs.dn, y1 + 35, PC.mut, 10); ptext('m=0', xs.m0, y1 + 35, PC.mut, 10); ptext('m=+1', xs.up, y1 + 35, PC.mut, 10);
    if (opts && opts.decay) {
      const a = opts.decay;
      parrow(cx - 6, y0 + 6, xs.dn + 4, y1 - 8, `rgba(${PC.pho},${a})`, 2);
      parrow(cx + 6, y0 + 6, xs.up - 4, y1 - 8, `rgba(${PC.pho},${a})`, 2);
      parrow(cx, y0 + 8, cx, y1 - 10, `rgba(148,163,184,${0.35 * a})`, 1.2, [3, 4]);
      ptext('σ⁺', (cx + xs.dn) / 2 - 16, (y0 + y1) / 2, `rgba(${PC.pho},${a})`, 13, 700);
      ptext('σ⁻', (cx + xs.up) / 2 + 16, (y0 + y1) / 2, `rgba(${PC.pho},${a})`, 13, 700);
    }
    if (opts && opts.pump) parrow(cx - 4, y1 - 6, cx - 4, y0 + 8, `rgba(${PC.ex},${opts.pump})`, 3);
    if (opts && opts.opt) { const a = opts.opt; parrow(xs.dn + 6, y1 - 12, cx - 8, y1 - 12, `rgba(${PC.ex},${a})`, 1.6, [4, 3]); parrow(xs.up - 6, y1 - 12, cx + 8, y1 - 12, `rgba(${PC.ex},${a})`, 1.6, [4, 3]); }
    const dot = (x, y, w, col) => { if (w > 0.02) pglow(x, y, 7 + 5 * w, col, Math.min(1, 0.25 + w)); };
    dot(cx, y0, pop.e || 0, PC.ex); dot(xs.m0, y1, pop.m0 || 0, '96,165,250'); dot(xs.dn, y1, pop.dn || 0, '96,165,250'); dot(xs.up, y1, pop.up || 0, '96,165,250');
  }
  function fiberPt(side, t) {                                              // node → fiber BS input
    const n = NODE[side], x0 = n.x + (side ? -40 : 40), x3 = PBS0[0] + (side ? 14 : -14), d1 = pnarrow ? 50 : 120, d2 = pnarrow ? 40 : 80;
    const p0 = [x0, 286 + DY], p1 = [x0 + (side ? -d1 : d1), 330 + DY], p2 = [x3 + (side ? d2 : -d2), 330 + DY], p3 = [x3, PBS0[1] + 8], m = 1 - t;
    return [m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]];
  }
  const portPt = (port, t) => pl([PBS0[0] + (port === 1 ? -10 : 10), PBS0[1] - 10], PBS_[port - 1], t);
  function station(clicks, ta) {
    pctx.strokeStyle = 'rgba(56,189,248,.35)'; pctx.lineWidth = 3;
    for (const side of [0, 1]) { pctx.beginPath(); for (let i = 0; i <= 30; i++) { const q = fiberPt(side, i / 30); i ? pctx.lineTo(q[0], q[1]) : pctx.moveTo(q[0], q[1]); } pctx.stroke(); }
    for (const port of [1, 2]) { const a = portPt(port, 0), b = portPt(port, 1); pctx.beginPath(); pctx.moveTo(a[0], a[1]); pctx.lineTo(b[0], b[1]); pctx.stroke(); }
    pctx.strokeStyle = 'rgba(148,163,184,.3)'; pctx.lineWidth = 1.5;
    for (const d in PDET) { const p = PBS_[+d[1] - 1]; pctx.beginPath(); pctx.moveTo(p[0], p[1]); pctx.lineTo(PDET[d][0], PDET[d][1]); pctx.stroke(); }
    pctx.fillStyle = '#0f1b2d'; pctx.strokeStyle = 'rgba(125,211,252,.85)'; pctx.lineWidth = 1.5;
    pctx.fillRect(PBS0[0] - 22, PBS0[1] - 12, 44, 24); pctx.strokeRect(PBS0[0] - 22, PBS0[1] - 12, 44, 24);
    ptext('50:50 BS', PBS0[0], PBS0[1] + 30, PC.mut, 11, 600);
    PBS_.forEach((p, i) => { pctx.fillStyle = '#0f1b2d'; pctx.strokeStyle = 'rgba(203,213,225,.75)'; pctx.fillRect(p[0] - 12, p[1] - 12, 24, 24); pctx.strokeRect(p[0] - 12, p[1] - 12, 24, 24); pctx.beginPath(); i ? (pctx.moveTo(p[0] - 12, p[1] - 12), pctx.lineTo(p[0] + 12, p[1] + 12)) : (pctx.moveTo(p[0] + 12, p[1] - 12), pctx.lineTo(p[0] - 12, p[1] + 12)); pctx.stroke(); ptext('PBS', p[0] + (i ? -26 : 26), p[1] + 30, PC.mut, 10, 600); });
    const on = {}; (clicks || []).forEach(d => { on[d] = (on[d] || 0) + 1; });
    for (const d in PDET) {
      const [x, y] = PDET[d], pol = d[0] === 'H' ? PC.H : PC.V, c = on[d];
      if (c) pglow(x, y, 26, pol, ta);
      pctx.fillStyle = c ? `rgba(${pol},${0.3 + 0.6 * ta})` : '#0f1b2d'; pctx.strokeStyle = `rgba(${pol},.9)`; pctx.lineWidth = 1.5;
      pctx.fillRect(x - 16, y - 12, 32, 24); pctx.strokeRect(x - 16, y - 12, 32, 24);
      ptext(d[0] + (d[1] === '1' ? '₁' : '₂'), x, y + 5, c ? '#04070d' : `rgba(${pol},1)`, 13, 700);
      if (c === 2) ptext('2 photons, 1 click', x, y - 20, `rgba(${PC.bad},${ta})`, 10, 700);
    }
  }
  function nodes(glowEx) {
    NODE.forEach((n, i) => {
      const y = 286 + DY, tw = pctx.createLinearGradient(n.x, y - 60, n.x, y + 60); tw.addColorStop(0, 'rgba(239,68,68,0)'); tw.addColorStop(.5, 'rgba(239,68,68,.25)'); tw.addColorStop(1, 'rgba(239,68,68,0)');
      pctx.fillStyle = tw; pctx.fillRect(n.x - 10, y - 60, 20, 120);
      if (glowEx) pglow(n.x, y, 30, PC.ex, glowEx);
      pglow(n.x, y, 13, '96,165,250', 1);
      pctx.strokeStyle = 'rgba(203,213,225,.7)'; pctx.lineWidth = 2; pctx.beginPath(); pctx.ellipse(n.x + (i ? -34 : 34), y, 5, 22, 0, 0, PT); pctx.stroke();
      ptext(n.lab, n.x + (pnarrow ? (i ? -6 : 6) : 0), y + (pnarrow ? 64 : 84), PC.txt, 13, 700);
    });
  }
  function photonsTo(u) { for (const s of [0, 1]) { const q = fiberPt(s, u); pglow(q[0], q[1], 10, PC.pho, 1); } }
  function photonsOut(clicks, u) {                                          // u: 0..1 from BS to detectors
    clicks.forEach((d, i) => { const off = clicks[0] === clicks[1] ? (i ? 4 : -4) : 0, port = +d[1];
      if (u < .5) { const q = portPt(port, u / .5); pglow(q[0] + off, q[1], 10, PC.pho, 1); }
      else { const q = pl(PBS_[port - 1], PDET[d], (u - .5) / .5); pglow(q[0] + off, q[1], 10, d[0] === 'H' ? PC.H : PC.V, 1); } });
  }
  const CASES = [{ clicks: ['H1', 'V2'], k: 'Ψ⁻', txt: 'photons in |Ψ⁻⟩ → different ports, orthogonal polarizations: herald |Ψ⁻⟩', ok: true },
    { clicks: ['H1', 'V1'], k: 'Ψ⁺', txt: 'photons in |Ψ⁺⟩ → same port, orthogonal polarizations: herald |Ψ⁺⟩', ok: true },
    { clicks: ['H2', 'H2'], k: 'Φ', txt: 'photons in |Φ±⟩ → both in one detector: one click, no herald', ok: false }];
  function drawProto(t) {
    if (!pctx) return;
    pctx.setTransform(PS, 0, 0, PS, 0, 0); pctx.fillStyle = '#04070d'; pctx.fillRect(0, 0, PW, PH);
    pctx.fillStyle = 'rgba(148,163,184,.06)'; for (let x = 12; x < PW; x += 24) for (let y = 12; y < PH; y += 24) pctx.fillRect(x, y, 1, 1);
    const k = currentStep, L = 3.6, u = (t % L) / L;
    let bottom = '', bcol = PC.txt, clicks = [], ta = 0;
    if (k === 0) {
      const f = pz(u, .1, .7);
      LEVX.forEach(cx => levels(cx, { dn: (1 - f) / 2, up: (1 - f) / 2, m0: f }, { opt: Math.sin(Math.PI * Math.min(1, u * 1.4)) }));
      nodes(0); station([], 0);
      bottom = '|ψ⟩ = |0⟩ᴬ ⊗ |0⟩ᴮ        product state: no entanglement';
    } else if (k === 1) {
      const fe = pz(u, .05, .25), fd = pz(u, .3, .55);
      LEVX.forEach(cx => levels(cx, { m0: 1 - fe, e: fe * (1 - fd), dn: fd / 2, up: fd / 2 }, { pump: u < .3 ? Math.sin(Math.PI * pz(u, 0, .3)) : 0, decay: fd }));
      nodes(u < .3 ? Math.sin(Math.PI * pz(u, 0, .3)) : 0); station([], 0);
      if (u > .45) photonsTo(pz(u, .45, 1) * 0.35);
      bottom = '|Ψ⟩ = (|↓⟩|σ⁺⟩ + |↑⟩|σ⁻⟩)/√2   for each atom and its photon'; bcol = `rgba(${PC.pho},1)`;
    } else if (k === 2) {
      LEVX.forEach(cx => levels(cx, { dn: .5, up: .5 }, {}));
      nodes(0); station([], 0); photonsTo(.35 + .65 * pz(u, 0, .85));
      ptext('σ⁺ → H, σ⁻ → V (birefringence compensated)', XC, pnarrow ? 290 : 352, PC.mut, 11);
      bottom = '|Ψ⟩ᴬ|Ψ⟩ᴮ = ½ ( |Ψ⁻⟩|Ψ⁻⟩ + |Ψ⁺⟩|Ψ⁺⟩ + |Φ⁻⟩|Φ⁻⟩ + |Φ⁺⟩|Φ⁺⟩ )   each term: atoms ⊗ photons'; bcol = `rgba(${PC.ex},1)`;
    } else if (k === 3) {
      const c = CASES[Math.floor(t / L) % 3];
      LEVX.forEach(cx => levels(cx, { dn: .5, up: .5 }, {}));
      nodes(0);
      if (u > .55) { clicks = c.clicks; ta = 1 - pz(u, .9, 1) * .6; }
      station(clicks, ta);
      if (u < .3) photonsTo(.7 + .3 * pz(u, 0, .3)); else if (u <= .55) photonsOut(c.clicks, pz(u, .3, .55));
      bottom = c.txt; bcol = `rgba(${c.ok ? PC.ok : PC.bad},1)`;
    } else {
      LEVX.forEach(cx => levels(cx, { dn: .5, up: .5 }, {}));
      nodes(0); station(['H1', 'V2'], 1 - pz(u, .7, 1) * .5);
      const h = pz(u, .05, .35);
      pctx.setLineDash([6, 6]); pctx.strokeStyle = `rgba(${PC.ok},.9)`; pctx.lineWidth = 2;
      const h0 = pnarrow ? [XC, 278] : [XC, 72];
      NODE.forEach((n, i) => { const e = pl(h0, pnarrow ? [LEVX[i], 236] : [n.x, 250], h); pctx.beginPath(); pctx.moveTo(h0[0], h0[1]); pctx.lineTo(e[0], e[1]); pctx.stroke(); });
      pctx.setLineDash([]);
      ptext('H₁ + V₂ coincidence → herald', XC, pnarrow ? 296 : 62, `rgba(${PC.ok},1)`, 12, 700);
      if (u > .35) {
        const xa = NODE[0].x, xb = NODE[1].x, v = pz(u, .35, .6), x1 = xa + (xb - xa) * v, yw = 336 + DY;
        pctx.strokeStyle = `rgba(${PC.ok},1)`; pctx.lineWidth = 3; pctx.shadowColor = `rgba(${PC.ok},1)`; pctx.shadowBlur = 10;
        pctx.beginPath(); for (let x = xa; x <= x1; x += 3) { const y = yw + 4 * Math.sin((x - xa) / 10 - t * 5); x === xa ? pctx.moveTo(x, y) : pctx.lineTo(x, y); } pctx.stroke(); pctx.shadowBlur = 0;
      }
      bottom = 'atoms: |Ψ⁻⟩ = (|↑↓⟩ − |↓↑⟩)/√2      success per attempt: ηᴬηᴮ / 2'; bcol = `rgba(${PC.ok},1)`;
    }
    ptext(STEPS[k].label.replace(/^[①-⑤]\s*/, 'step ' + (k + 1) + ' · '), 16, 24, PC.mut, 12, 700, 'left');
    // bottom state line: wrap at wide gaps first, then at spaces, to fit the canvas width
    pctx.font = `700 ${13 * FS}px JetBrains Mono, monospace`;
    const lines = [];
    (pctx.measureText(bottom).width > PW - 24 ? bottom.split(/\s{3,}/) : [bottom]).forEach(seg => {
      let ln = '';
      for (const w of seg.split(' ')) { const tryL = ln ? ln + ' ' + w : w; if (ln && pctx.measureText(tryL).width > PW - 24) { lines.push(ln); ln = w; } else ln = tryL; }
      lines.push(ln);
    });
    const bh = lines.length * 20 * FS + 10;
    pctx.fillStyle = 'rgba(15,27,45,.9)'; pctx.fillRect(0, PH - bh, PW, bh);
    lines.forEach((ln, i) => ptext(ln, PW / 2, PH - bh + (i + 1) * 20 * FS, bcol, 13, 700));
  }
  function renderProtoStep(i) {
    currentStep = i; stepT0 = null;
    document.getElementById('proto-caption').innerHTML = STEPS[i].desc;
    document.querySelectorAll('.proto-step-btn').forEach((b, j) => { b.classList.toggle('active', j === i); b.setAttribute('aria-pressed', String(j === i)); });
    document.getElementById('proto-prev').disabled = (i === 0);
    document.getElementById('proto-next').disabled = (i === STEPS.length - 1);
    if (protoStatic) drawProto(STILL[i]);
  }
  function protoNav(dir) { renderProtoStep(Math.max(0, Math.min(STEPS.length - 1, currentStep + dir))); }
  const STILL = [3.0, 2.9, 2.6, 3.2, 3.2];                                  // representative frames (s) per step
  let protoStatic = false, protoClock = 0, protoLast = null;
  const btnWrap = document.getElementById('proto-step-btns');
  STEPS.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'proto-step-btn'; b.textContent = s.label;
    b.onclick = () => renderProtoStep(i);
    btnWrap.appendChild(b);
  });
  renderProtoStep(0);
  if (pcv) {
    if (window.ResizeObserver) new ResizeObserver(() => { if (playout() && (protoStatic || !window.AMOMotion)) drawProto(STILL[currentStep]); }).observe(pcv);
    const pframe = t => { const dt = protoLast === null ? 0 : Math.min(100, t - protoLast) / 1000; protoLast = t; if (stepT0 === null) { stepT0 = t; protoClock = 0; } protoClock += dt; drawProto(protoClock); };
    if (window.AMOMotion) AMOMotion.loop([pcv], pframe, { anchors: [{ el: document.getElementById('proto-next'), where: 'afterend', inline: true }], onStatic: () => { protoStatic = true; drawProto(STILL[currentStep]); } });
    else { const g = t => { pframe(t); requestAnimationFrame(g); }; requestAnimationFrame(g); }
    window.addEventListener('amo:print', () => drawProto(STILL[currentStep]));
  }

  /* ─── HOM: wavepackets + dip ─── P(τ) = ½[1 − M e^{−|τ|/τc}], F ≤ ½(1 + M e^{−|τ|/τc}) */
  let homChart = null;
  const homCss = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888';
  function homParams() { return { M: +document.getElementById('hom-slider').value / 100, tau: +document.getElementById('hom-delay').value }; }
  function drawWaves() {
    const cv = document.getElementById('hom-waves'); if (!cv) return;
    const { M, tau } = homParams(), g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 40, base = H - 70;
    const X = t => pad + (t + 3.5) / 10 * (W - 2 * pad), Ya = I => base - I * (H - 90);
    const ink = homCss('--text-secondary'), mut = homCss('--text-muted'), cA = '#0ea5e9', cB = '#8b5cf6';
    g.clearRect(0, 0, W, H);
    g.strokeStyle = mut; g.globalAlpha = .5; g.lineWidth = 1.5; g.beginPath(); g.moveTo(pad, base); g.lineTo(W - pad, base); g.stroke(); g.globalAlpha = 1;
    const tA = 0, tB = tau, I = (t, t0) => t < t0 ? 0 : Math.exp(-(t - t0));
    // overlap of amplitudes: √(I_A I_B)
    g.fillStyle = 'rgba(16,185,129,.28)'; g.beginPath(); g.moveTo(X(-3.5), base);
    for (let t = -3.5; t <= 6.5; t += 0.01) g.lineTo(X(t), Ya(Math.sqrt(I(t, tA) * I(t, tB))));
    g.lineTo(X(6.5), base); g.closePath(); g.fill();
    for (const [t0, col, lab] of [[tA, cA, 'photon from A'], [tB, cB, 'photon from B']]) {
      g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(X(-3.5), base);
      for (let t = -3.5; t <= 6.5; t += 0.01) g.lineTo(X(t), Ya(I(t, t0)));
      g.stroke();
      const ly = col === cA ? 30 : 60; g.fillStyle = col; g.fillRect(pad + 4, ly - 8, 28, 5); g.font = '600 20px Inter, sans-serif'; g.textAlign = 'left'; g.fillText(lab, pad + 40, ly);
    }
    g.fillStyle = ink; g.font = '20px Inter, sans-serif'; g.textAlign = 'center';
    g.fillText('time / τc', W / 2, H - 8);
    for (let t = -2; t <= 6; t += 2) { g.fillStyle = mut; g.fillText(String(t), X(t), base + 24); }
    g.fillStyle = '#059669'; g.textAlign = 'right'; g.font = '600 20px Inter, sans-serif';
    g.fillText(`packet overlap e^(−|τ|/τc) = ${Math.exp(-Math.abs(tau)).toFixed(2)}`, W - pad, 30);
  }
  function homData(M) { const pts = []; for (let t = -4; t <= 4.0001; t += 0.04) pts.push({ x: +t.toFixed(2), y: 0.5 * (1 - M * Math.exp(-Math.abs(t))) }); return pts; }
  function initHOMChart() {
    const { M, tau } = homParams(), tc = homCss('--text-secondary'), gc = homCss('--border-med');
    homChart = new Chart(document.getElementById('hom-chart'), {
      type: 'line',
      data: { datasets: [
        { label: 'P_coinc(τ)', data: homData(M), borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.10)', borderWidth: 2.5, fill: true, pointRadius: 0, tension: 0 },
        { label: 'now', data: [{ x: tau, y: 0.5 * (1 - M * Math.exp(-Math.abs(tau))) }], borderColor: '#8b5cf6', backgroundColor: '#8b5cf6', pointRadius: 6, showLine: false },
        { label: 'distinguishable', data: [{ x: -4, y: 0.5 }, { x: 4, y: 0.5 }], borderColor: gc, borderDash: [5, 4], borderWidth: 1.2, pointRadius: 0 } ] },
      options: { responsive: true, maintainAspectRatio: false, animation: false, parsing: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { type: 'linear', min: -4, max: 4, title: { display: true, text: 'delay τ / τc', color: tc }, grid: { color: gc }, ticks: { color: tc } },
                  y: { min: 0, max: 0.6, title: { display: true, text: 'P(coincidence)', color: tc }, grid: { color: gc }, ticks: { color: tc, stepSize: 0.1, callback: v => v.toFixed(1) } } } }
    });
  }
  function updateHOM() {
    const { M, tau } = homParams(), ov = M * Math.exp(-Math.abs(tau)), P = 0.5 * (1 - ov);
    document.getElementById('hom-val').textContent = M.toFixed(2);
    document.getElementById('hom-delay-v').textContent = tau.toFixed(2);
    document.getElementById('hom-read').innerHTML = `<span>P(coincidence) <b>${P.toFixed(3)}</b></span><span>dip visibility <b>${M.toFixed(2)}</b></span><span>max Bell fidelity <b>${(0.5 * (1 + ov)).toFixed(3)}</b></span>`;
    drawWaves();
    if (homChart) { homChart.data.datasets[0].data = homData(M); homChart.data.datasets[1].data = [{ x: tau, y: P }]; homChart.update('none'); }
  }
  ['hom-slider', 'hom-delay'].forEach(id => document.getElementById(id).addEventListener('input', updateHOM));
  new MutationObserver(() => { if (!homChart) return; const tc = homCss('--text-secondary'), gc = homCss('--border-med'); const o = homChart.options.scales;
    o.x.ticks.color = o.y.ticks.color = o.x.title.color = o.y.title.color = tc; o.x.grid.color = o.y.grid.color = gc; homChart.data.datasets[2].borderColor = gc; homChart.update('none'); drawWaves(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('amo:print', drawWaves);

  /* ─── Rate Calculator ─── */
  function setSliderFill(el, frac) {
    const pct = (frac * 100).toFixed(1) + '%';
    el.style.background = `linear-gradient(to right, var(--ent) ${pct}, #0d2236 ${pct})`;
  }

  function fmtRate(r) {
    if (r >= 1e6) return (r/1e6).toFixed(2) + ' MHz';
    if (r >= 1e3) return (r/1e3).toFixed(1) + ' kHz';
    if (r >= 1)   return r.toFixed(1) + ' Hz';
    if (r >= 1e-3) return (r*1e3).toFixed(1) + ' mHz';
    return r.toExponential(2) + ' Hz';
  }
  function fmtTime(s) {
    if (s <= 0 || !isFinite(s)) return '∞';
    if (s < 1e-3) return (s*1e6).toFixed(1) + ' μs';
    if (s < 1)    return (s*1e3).toFixed(1) + ' ms';
    if (s < 60)   return s.toFixed(2) + ' s';
    return (s/60).toFixed(1) + ' min';
  }
  function fmtPct(v) { return (v*100).toFixed(2) + '%'; }

  function updateRate() {
    const naIdx  = +document.getElementById('r-na').value;   // 1..9
    const NA     = naIdx / 10;
    const fc     = +document.getElementById('r-fc').value / 100;
    const det    = +document.getElementById('r-det').value / 100;
    const repLog = +document.getElementById('r-rep').value;  // 0..4 → 100k..10M
    const frep   = 1e5 * Math.pow(10, repLog / 2);
    const lenRaw = +document.getElementById('r-len').value;  // slider 0..50
    // Map 0→0.01 km, 50→50 km (log-ish)
    const L_km   = lenRaw === 0 ? 0.01 : lenRaw;
    const alpha  = +document.getElementById('r-wav').value;  // dB/km
    const bsmFac = +document.getElementById('r-bsm').value;  // 0.5 or 1
    const purcell = +document.getElementById('r-pu').value;

    // Collection efficiency: (1-sqrt(1-NA²))/2, then Purcell enhanced beta=C/(1+C), C=purcell-1
    const C = purcell - 1;
    const beta = (purcell === 1) ? 1 : C / (1 + C); // fraction emitted into mode
    const eta_geom = (1 - Math.sqrt(1 - NA*NA)) / 2;
    const eta_coll = (purcell > 1) ? beta * 0.85 : eta_geom; // cavity: use beta × mirror coupling

    const T = Math.pow(10, -alpha * L_km / 10);
    const eta_total = eta_coll * fc * T * det;
    let p_success;
    if (bsmFac === 0.5) {
      p_success = eta_total * eta_total / 2;
    } else {
      // single-photon (Cabrillo) scheme: each atom excited with probability ε; fidelity ≈ 1 − ε
      const eps = 0.05;
      p_success = 2 * eps * eta_total;
    }
    // each attempt waits for the photon to reach the station and the herald to come back: 2L/v, v ≈ c/1.47 in fiber
    const tRound = 2 * L_km * 1e3 / 2.04e8, fMax = 1 / tRound, fEff = Math.min(frep, fMax);
    const rate = fEff * p_success;
    const tpair = 1 / rate;
    if (window.BKSim) BKSim.setLink({ eta: eta_total, p: p_success, frep: fEff, single: bsmFac !== 0.5, eps: 0.05, L_km });
    document.getElementById('r-cap').textContent = fEff < frep
      ? `Attempts run at ${fmtRate(fEff)}, not ${frep >= 1e6 ? (frep/1e6).toFixed(1)+' MHz' : (frep/1e3).toFixed(0)+' kHz'}: each attempt waits 2L/v = ${fmtTime(tRound)} for the photon to reach the station and the herald to return (no multiplexing).`
      : `Attempt rate ${frep >= 1e6 ? (frep/1e6).toFixed(1)+' MHz' : (frep/1e3).toFixed(0)+' kHz'} (the 2L/v = ${fmtTime(tRound)} herald round trip is not the limit here).`;

    // Update display values
    document.getElementById('r-na-v').textContent  = 'NA = ' + NA.toFixed(2);
    document.getElementById('r-fc-v').textContent  = (+document.getElementById('r-fc').value) + '%';
    document.getElementById('r-det-v').textContent = (+document.getElementById('r-det').value) + '%';
    document.getElementById('r-rep-v').textContent = frep >= 1e6 ? (frep/1e6).toFixed(1)+' MHz' : (frep/1e3).toFixed(0)+' kHz';
    document.getElementById('r-len-v').textContent = L_km < 1 ? (L_km*1000).toFixed(0)+' m' : L_km.toFixed(1)+' km';
    document.getElementById('r-pu-v').textContent  = purcell === 1 ? '1× (no cavity)' : purcell.toFixed(1) + '× · β = ' + Math.round(beta * 100) + '%';

    document.getElementById('r-coll').textContent  = fmtPct(eta_coll);
    document.getElementById('r-trans').textContent = fmtPct(T);
    document.getElementById('r-eta').textContent   = fmtPct(eta_total);
    document.getElementById('r-psucc').textContent = fmtPct(p_success);
    document.getElementById('r-rate').textContent  = fmtRate(rate);
    document.getElementById('r-tpair').textContent = fmtTime(tpair);

    // Progress bar: log scale 1 Hz → 1 MHz
    const barPct = Math.max(0, Math.min(100, (Math.log10(Math.max(rate,0.1)) + 2) / 8 * 100));
    const barEl = document.getElementById('r-bar');
    barEl.style.width = barPct + '%';
    barEl.style.background = rate >= 1000 ? '#4ade80' : rate >= 100 ? '#fbbf24' : '#f87171';

    const verdict = (rate >= 1000 ? '✓ Above ~1 kHz: in the range often discussed for linking modules' :
                    rate >= 100  ? '⚠ 100 Hz–1 kHz: fine for demonstrations, slow for linking modules' :
                                   '✗ Below 100 Hz: networking demos only; cavities or multiplexing would help') + ' (rough rule of thumb, not a published threshold)';
    document.getElementById('r-verdict').textContent = verdict;
  }

  // Init sliders with fills
  ['r-na','r-fc','r-det','r-rep','r-len','r-pu'].forEach(id => {
    const el = document.getElementById(id);
    const min = +el.min, max = +el.max, val = +el.value;
    setSliderFill(el, (val-min)/(max-min));
  });

  /* ─── Sticky nav active state ─── */
  const sections = document.querySelectorAll('.ent-section[id]');
  const navLinks = document.querySelectorAll('.topic-nav a');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+e.target.id));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => obs.observe(s));


  /* ─── Entanglement distillation (BBPSSW recurrence, Werner pairs) ─── */
  (function () {
    const fEl = document.getElementById('dist-f'), nEl = document.getElementById('dist-n');
    if (!fEl || !nEl) return;
    function round(F) {
      const q = (1 - F) / 3, p = F * F + 2 * F * q + 5 * q * q;
      return [(F * F + q * q) / p, p];
    }
    function render() {
      let F = +fEl.value / 100, cost = 1;
      const n = +nEl.value;
      document.getElementById('dist-f-v').textContent = F.toFixed(2);
      document.getElementById('dist-n-v').textContent = n;
      let rows = `<tr><td>0 (raw)</td><td>${F.toFixed(4)}</td><td>—</td><td>1</td></tr>`;
      for (let i = 1; i <= n; i++) {
        const [F2, p] = round(F); F = F2; cost *= 2 / p;
        rows += `<tr><td>${i}</td><td>${F.toFixed(4)}</td><td>${(100 * p).toFixed(1)}%</td><td>${cost < 1e4 ? cost.toFixed(1) : cost.toExponential(1)}</td></tr>`;
      }
      document.getElementById('dist-body').innerHTML = rows;
    }
    [fEl, nEl].forEach(el => el.addEventListener('input', () => { render(); setSliderFill(el, (el.value - el.min) / (el.max - el.min)); }));
    setSliderFill(fEl, (fEl.value - fEl.min) / (fEl.max - fEl.min)); setSliderFill(nEl, (nEl.value - nEl.min) / (nEl.max - nEl.min));
    render();
  })();

  /* ─── Link simulator: attempts → heralds (Monte Carlo of the calculator's link) ─── */
  const BKSim = window.BKSim = (() => {
    const cv = document.getElementById('bkCanvas');
    if (!cv) return null;
    const ctx = window.AMOInk ? AMOInk.wrap(cv.getContext('2d')) : cv.getContext('2d');
    // drawn in logical units at 2× resolution: 720 × 230 on wide screens, 480 × 300 on phones (bigger text, flash line on top)
    const SC = 2;
    let W, H, XA, XB, XC, OY, BSY, POS, PB, narrow = null;
    function layout() {
      const n = (cv.clientWidth || 720) < 560;
      if (n === narrow) return; narrow = n;
      W = n ? 480 : 720; H = n ? 300 : 230; OY = n ? 62 : 0;
      XA = n ? 44 : 70; XB = W - XA; XC = W / 2; BSY = 150 + OY;
      POS = { H1: [XC - 70, 30 + OY], V1: [XC - 128, 84 + OY], H2: [XC + 70, 30 + OY], V2: [XC + 128, 84 + OY], D1: [XC - 70, 62 + OY], D2: [XC + 70, 62 + OY] };
      PB = { 1: [XC - 70, 84 + OY], 2: [XC + 70, 84 + OY] };
      cv.width = W * SC; cv.height = H * SC; cv.style.aspectRatio = W + ' / ' + H;
    }
    layout();
    if (window.ResizeObserver) new ResizeObserver(() => { const was = narrow; layout(); if (was !== narrow) draw(lastT || 0); }).observe(cv);
    let link = { eta: 0.01, p: 5e-5, frep: 1e6, single: false, eps: 0.05, L_km: 0.01 };
    let mode = 'slow', tally, cur = null, lastT = null, flash = 0, flashText = '', fastLast = 0;
    function reset() {
      tally = { n: 0, a: 0, b: 0, both: 0, h: 0 };
      cur = null; flash = 0; render(); draw(lastT || 0);
    }
    // one attempt: who emits, who arrives, which detectors click, does the BSM herald?
    // two-photon: both arrive → |Ψ⁻⟩ (H1V2/V1H2) or |Ψ⁺⟩ (H1V1/H2V2) 1/4 each, |Φ±⟩ (both in one detector) 1/2
    // single-photon: exactly one click at D1 or D2 heralds; two clicks are rejected
    function attempt() {
      const emitA = link.single ? Math.random() < link.eps : true;
      const emitB = link.single ? Math.random() < link.eps : true;
      const arrA = emitA && Math.random() < link.eta, arrB = emitB && Math.random() < link.eta;
      let herald = false, clicks = [], bell = '';
      if (link.single) {
        const n = (arrA ? 1 : 0) + (arrB ? 1 : 0);
        clicks = n === 0 ? [] : n === 1 ? [Math.random() < .5 ? 'D1' : 'D2'] : [Math.random() < .5 ? 'D1' : 'D2', Math.random() < .5 ? 'D1' : 'D2'];
        herald = n === 1; bell = herald ? (clicks[0] === 'D1' ? 'Ψ⁺' : 'Ψ⁻') : '';
      } else if (arrA && arrB) {
        const r = Math.random();
        if (r < .25) { clicks = Math.random() < .5 ? ['H1', 'V2'] : ['V1', 'H2']; herald = true; bell = 'Ψ⁻'; }
        else if (r < .5) { clicks = Math.random() < .5 ? ['H1', 'V1'] : ['H2', 'V2']; herald = true; bell = 'Ψ⁺'; }
        else { const d = ['H1', 'V1', 'H2', 'V2'][Math.floor(Math.random() * 4)]; clicks = [d, d]; }
      } else if (arrA || arrB) clicks = [['H1', 'V1', 'H2', 'V2'][Math.floor(Math.random() * 4)]];
      return { emitA, emitB, arrA, arrB, herald, clicks, bell, lossA: 0.15 + 0.8 * Math.random(), lossB: 0.15 + 0.8 * Math.random() };
    }
    function count(r) {
      tally.n++; if (r.arrA) tally.a++; if (r.arrB) tally.b++; if (r.arrA && r.arrB) tally.both++; if (r.herald) tally.h++;
    }
    const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : String(n);
    function render() {
      const el = document.getElementById('bkTally'); if (!el) return;
      const t = tally.n / link.frep, pm = tally.n ? tally.h / tally.n : 0, err = tally.n ? Math.sqrt(tally.h) / tally.n : 0;
      el.innerHTML =
        `<div>attempts<b>${fmtN(tally.n)}</b>lab time ${fmtTime(t || 0)}</div>` +
        `<div>photons detected<b>${fmtN(tally.a)} · ${fmtN(tally.b)}</b>A · B (η = ${fmtPct(link.eta)})</div>` +
        `<div>heralded pairs<b>${fmtN(tally.h)}</b>${tally.h ? fmtRate(tally.h / t) + ' measured' : 'none yet'}</div>` +
        `<div>p per attempt<b>${tally.h ? pm.toExponential(2) + ' ± ' + err.toExponential(1) : '—'}</b>calculator ${link.p.toExponential(2)}</div>`;
    }
    function dot(x, y, col, a) { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 6, 0, 2 * Math.PI); ctx.fill(); ctx.globalAlpha = 1; }
    function photonIn(x0, f, lostAt, emitted) {                              // node → beam splitter (f 0..1)
      if (!emitted) return;
      const lost = lostAt !== null && f > lostAt, x = x0 + (XC - x0) * Math.min(f, lostAt !== null ? lostAt : 1);
      dot(x, BSY, '#b45309', lost ? Math.max(0, 1 - (f - lostAt) * 4) : 1);
      if (lost && f - lostAt < .25) { ctx.fillStyle = '#e20b0b'; ctx.font = 'bold 13px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✗ lost', x, BSY - 14); }
    }
    function photonOut(d, f, off) {                                          // beam splitter → detector (f 0..1)
      const port = d[1], tgt = POS[d], start = [XC + (port === '1' ? -10 : 10), BSY - 10], mid = link.single ? tgt : PB[port];
      const p = f < .5 || link.single ? [start[0] + (mid[0] - start[0]) * Math.min(1, f / (link.single ? 1 : .5)), start[1] + (mid[1] - start[1]) * Math.min(1, f / (link.single ? 1 : .5))]
        : [mid[0] + (tgt[0] - mid[0]) * (f - .5) / .5, mid[1] + (tgt[1] - mid[1]) * (f - .5) / .5];
      dot(p[0] + off, p[1], link.single || f < .5 ? '#b45309' : d[0] === 'H' ? '#926a03' : '#076ce7', 1);
    }
    function draw(t) {
      ctx.setTransform(SC, 0, 0, SC, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#faf5e9'; ctx.fillRect(0, 0, W, H);
      // fibers in, fiber outputs to the detection stage
      ctx.strokeStyle = '#8c8066'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(XA + 22, BSY); ctx.lineTo(XC - 22, BSY); ctx.moveTo(XC + 22, BSY); ctx.lineTo(XB - 22, BSY); ctx.stroke(); ctx.setLineDash([]);
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#8c8066';
      for (const port of ['1', '2']) { const a = [XC + (port === '1' ? -10 : 10), BSY - 10], b = link.single ? [POS['D' + port][0], POS['D' + port][1] + 10] : PB[port]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      // nodes
      [[XA, 'Node A'], [XB, 'Node B']].forEach(([x, lab]) => {
        ctx.strokeStyle = '#076ce7'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, BSY, 20, 0, 2 * Math.PI); ctx.stroke();
        ctx.fillStyle = '#076ce7'; ctx.beginPath(); ctx.arc(x, BSY, 6, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#5c503c'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(lab, x, BSY + 40);
      });
      // 50:50 beam splitter
      ctx.fillStyle = '#faf5e9'; ctx.fillRect(XC - 16, BSY - 16, 32, 32); ctx.strokeStyle = '#5c503c'; ctx.lineWidth = 2; ctx.strokeRect(XC - 16, BSY - 16, 32, 32);
      ctx.beginPath(); ctx.moveTo(XC - 16, BSY + 16); ctx.lineTo(XC + 16, BSY - 16); ctx.stroke();
      ctx.fillStyle = '#5c503c'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('50:50 beam splitter', XC, BSY + 40);
      // detection: PBS + four APDs (two-photon) or two detectors (single-photon)
      const on = {}; if (flash > 0 && cur && cur.r.clicks) cur.r.clicks.forEach(d => { on[d] = (on[d] || 0) + 1; });
      const dets = link.single ? ['D1', 'D2'] : ['H1', 'V1', 'H2', 'V2'];
      if (!link.single) for (const port of ['1', '2']) {
        const [x, y] = PB[port]; ctx.fillStyle = '#faf5e9'; ctx.fillRect(x - 10, y - 10, 20, 20); ctx.strokeStyle = '#5c503c'; ctx.lineWidth = 1.5; ctx.strokeRect(x - 10, y - 10, 20, 20);
        ctx.beginPath(); port === '1' ? (ctx.moveTo(x + 10, y - 10), ctx.lineTo(x - 10, y + 10)) : (ctx.moveTo(x - 10, y - 10), ctx.lineTo(x + 10, y + 10)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(POS['H' + port][0], POS['H' + port][1] + 10); ctx.moveTo(x + (port === '1' ? -10 : 10), y); ctx.lineTo(POS['V' + port][0] + (port === '1' ? 14 : -14), y); ctx.stroke();
      }
      dets.forEach(d => {
        const [x, y] = POS[d], c = on[d], col = d[0] === 'H' ? '#926a03' : d[0] === 'V' ? '#076ce7' : '#1c805b';
        ctx.fillStyle = '#faf5e9'; ctx.fillRect(x - 14, y - 10, 28, 20); ctx.fillStyle = c ? (cur.r.herald ? '#1c805b' : '#e20b0b') : 'rgba(92,80,60,0.12)'; ctx.fillRect(x - 14, y - 10, 28, 20);
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.strokeRect(x - 14, y - 10, 28, 20);
        ctx.fillStyle = c ? '#faf5e9' : col; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(d[0] + (d[1] === '1' ? '₁' : '₂'), x, y + 4);
      });
      ctx.fillStyle = '#5c503c'; ctx.font = (narrow ? '13px' : '12px') + ' Inter, sans-serif'; ctx.textAlign = 'center';
      const scheme = link.single ? 'single-photon scheme: one click heralds' : 'two-photon scheme: PBS in each port, four detectors';
      const fib = 'fiber ' + (link.L_km < 1 ? (link.L_km * 1000).toFixed(0) + ' m' : link.L_km.toFixed(1) + ' km') + ' per arm (schematic)';
      if (narrow) { ctx.fillText(scheme, XC, H - 30); ctx.fillText(fib, XC, H - 12); } else ctx.fillText(scheme + ' · ' + fib, XC, H - 12);
      if (mode === 'slow' && cur) {
        const f = Math.min(1, (t - cur.t0) / 900), fi = Math.min(1, f / .62), fo = Math.max(0, (f - .62) / .38);
        if (f < .62 || !cur.r.clicks.length) { photonIn(XA, fi, cur.r.arrA ? null : cur.r.lossA, cur.r.emitA); photonIn(XB, fi, cur.r.arrB ? null : cur.r.lossB, cur.r.emitB); }
        else if (f < 1) cur.r.clicks.forEach((d, i) => photonOut(d, fo, cur.r.clicks.length === 2 && cur.r.clicks[0] === cur.r.clicks[1] ? (i ? 4 : -4) : 0));
      }
      if (flash > 0) {
        ctx.globalAlpha = Math.min(1, flash);
        ctx.fillStyle = flashText.startsWith('♥') ? '#1c805b' : '#8c8066';
        const fl = flashText.split('\n'), fx = narrow ? XC : W - 16; ctx.textAlign = narrow ? 'center' : 'right';
        ctx.font = 'bold 15px Inter, sans-serif'; ctx.fillText(fl[0], fx, 26);
        if (fl[1]) { ctx.font = '13px Inter, sans-serif'; ctx.fillText(fl[1], fx, 46); }
        ctx.globalAlpha = 1;
      }
      if (mode === 'fast') {
        ctx.fillStyle = '#5c503c'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = narrow ? 'center' : 'left'; ctx.fillText('real time: ' + fmtN(fastLast) + ' attempts per frame', narrow ? XC : 12, narrow ? 64 : 24);
      }
    }
    function frame(t) {
      const dt = lastT === null ? 16 : Math.min(100, t - lastT); lastT = t;
      if (flash > 0) flash -= dt / 900;
      if (mode === 'slow') {
        if (!cur || t - cur.t0 > 1500) {
          const r = attempt(); r.single = link.single; count(r); cur = { r, t0: t }; render();
        } else if (!cur.done && t - cur.t0 > 900) {
          cur.done = true;
          const r = cur.r;
          flash = 1;
          flashText = r.herald ? '♥ herald\natoms now in |' + r.bell + '⟩' : (!r.emitA && !r.emitB) ? 'no excitation\nneither atom emitted' :
            (r.arrA && r.arrB) ? (link.single ? 'no herald\ntwo clicks: rejected' : 'no herald\nboth photons in one detector') : (link.single && !(r.arrA || r.arrB)) ? 'no click\ntry again' : 'photon lost\ntry again';
        }
      } else {
        const k = Math.min(2e5, Math.max(1, Math.round(link.frep * dt / 1000)));
        let h = 0;
        for (let i = 0; i < k; i++) { const r = attempt(); count(r); if (r.herald) h++; }
        fastLast = k;
        if (h) { flash = 1; flashText = '♥ ' + h + ' herald' + (h > 1 ? 's' : '') + ' this frame'; cur = { r: { herald: true, single: link.single, arrA: true, clicks: link.single ? ['D1'] : ['H1', 'V2'] } }; }
        render();
      }
      draw(t);
    }
    function setMode(m) {
      mode = m; cur = null; flash = 0;
      document.getElementById('bkSlow').setAttribute('aria-pressed', String(m === 'slow'));
      document.getElementById('bkFast').setAttribute('aria-pressed', String(m === 'fast'));
    }
    document.getElementById('bkSlow').addEventListener('click', () => setMode('slow'));
    document.getElementById('bkFast').addEventListener('click', () => setMode('fast'));
    document.getElementById('bkReset').addEventListener('click', reset);
    tally = { n: 0, a: 0, b: 0, both: 0, h: 0 };
    const tracked = window.AMOInk ? AMOInk.track(frame) : frame;
    if (window.AMOMotion) AMOMotion.loop(cv, tracked, { anchors: [{ el: document.querySelector('#link-sim .bk-ctrls'), where: 'beforeend' }] });
    else { const g = ts => { tracked(ts); requestAnimationFrame(g); }; requestAnimationFrame(g); }
    return {
      setLink(l) {
        const changed = l.eta !== link.eta || l.single !== link.single || l.frep !== link.frep;
        link = l; if (changed) reset(); else render();
      }
    };
  })();

  /* ─── Init ─── */
  window.addEventListener('load', () => {
    initHOMChart();
    updateHOM();
    updateRate();
  });

  /* ─── KaTeX ─── */
  document.addEventListener('DOMContentLoaded', () => {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ], throwOnError: false
      });
    }
  });
