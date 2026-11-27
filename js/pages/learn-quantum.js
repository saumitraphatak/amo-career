/* learn-quantum.html — page script, moved out of the HTML on 2026-11-27 so browsers can cache it.
   Loaded as a classic script at the same place in the page; it runs exactly as the inline block did. */
/* ═══════════════════════════════════════════════
   Theme-aware canvas ink for this page's canvases (Bloch spheres, MZI, Rabi,
   Bell, Grover, Rydberg array). They were drawn with inks chosen for the cream
   light theme. LQ_INK.wrap(ctx) maps each of those inks to its dark-theme
   counterpart as it is set (fillStyle, strokeStyle, shadowColor, gradient
   stops), so the drawing code and the physics stay unchanged.
   LQ_INK.track(frame) remembers the last timestamp so a theme toggle can
   repaint the current frame, also while paused or under reduced motion.
   ═══════════════════════════════════════════════ */
const LQ_INK = (function () {
  const HEX = {
    '#faf5e9': '#0c1526',                                  // paper → --bg-card (dark)
    '#7a4ff7': '#a78bfa', '#7451fa': '#a78bfa',            // violet
    '#926a03': '#fbbf24', '#1c805b': '#34d399', '#076ce7': '#60a5fa',
    '#1e3a5f': 'rgba(148,163,184,0.7)', '#0f1e35': 'rgba(148,163,184,0.35)',
    '#1e293b': '#475569', '#334155': '#64748b',
    '#8c8066': '#94a3b8', '#5c503c': '#94a3b8',
  };
  const RGB = { '122,79,247': '167,139,250', '146,106,3': '251,191,36' };
  let dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const repaints = [];
  new MutationObserver(function () {
    dark = document.documentElement.getAttribute('data-theme') === 'dark';
    repaints.forEach(function (fn) { try { fn(); } catch (e) {} });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function map(v) {
    if (!dark || typeof v !== 'string') return v;
    const h = HEX[v.toLowerCase()];
    if (h) return h;
    return v.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/, function (m, r, g, b) {
      const n = RGB[r + ',' + g + ',' + b];
      return n ? m.slice(0, m.indexOf('(') + 1) + n : m;
    });
  }
  function wrapGradient(g) {
    const add = g.addColorStop.bind(g);
    g.addColorStop = function (o, c) { add(o, map(c)); };
    return g;
  }
  function wrap(ctx) {
    if (ctx.__lqInk) return ctx;           // idempotent (drawBloch asks for its context on every draw)
    ctx.__lqInk = true;
    const proto = Object.getPrototypeOf(ctx);
    ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (prop) {
      const d = Object.getOwnPropertyDescriptor(proto, prop);
      if (!d || !d.set) return;
      Object.defineProperty(ctx, prop, {
        configurable: true,
        get: function () { return d.get.call(ctx); },
        set: function (v) { d.set.call(ctx, map(v)); },
      });
    });
    ['createLinearGradient', 'createRadialGradient'].forEach(function (fn) {
      const orig = ctx[fn].bind(ctx);
      ctx[fn] = function () { return wrapGradient(orig.apply(null, arguments)); };
    });
    return ctx;
  }
  function track(frame) {
    let last = null;
    repaints.push(function () { if (last !== null) frame(last); });
    return function (ts) { last = ts; frame(ts); };
  }
  return { map: map, wrap: wrap, track: track, onTheme: function (fn) { repaints.push(fn); } };
})();

/* ═══════════════════════════════════════════════
   STICKY NAV HIGHLIGHT
   ═══════════════════════════════════════════════ */
const sections = ['bloch','superposition','rabi','gates','measurement',
                  'optical-pumping','hyperfine','entanglement','twoqubit','rydberg',
                  'decoherence','algorithms','analog-sim','qec','resources'];
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.topic-nav a').forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.topic-nav a[href="#${e.target.id}"]`);
      if (link) { link.classList.add('active'); link.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}); }
    }
  });
}, { threshold: 0.3 });
sections.forEach(id => { const el=document.getElementById(id); if(el) observer.observe(el); });

/* ═══════════════════════════════════════════════
   BLOCH SPHERE DRAWING
   ═══════════════════════════════════════════════ */
const BS_R = 95, BS_CX = 130, BS_CY = 140;
const BS_A = Math.PI/6, BS_B = Math.PI/5;   // default view: azimuth 30°, tilt 36°
// Each sphere can be rotated by dragging (js/orbit3d.js); drawBloch() loads that
// canvas's current view into bsAz/bsEl before projecting.
let bsAz = BS_A, bsEl = BS_B;
const BS_VIEWS = {}, BS_LAST = {};

// → [screenX, screenY, depth toward viewer]
function bsProject(x, y, z) {
  const ca = Math.cos(bsAz), sa = Math.sin(bsAz), ce = Math.cos(bsEl), se = Math.sin(bsEl);
  const xr = x*ca - y*sa;
  const yr = x*sa + y*ca;
  return [
    BS_CX + BS_R * xr,
    BS_CY - BS_R * (z*ce + yr*se),
    z*se - yr*ce
  ];
}

// Great circle with its far half drawn fainter — the main depth cue when rotating.
function bsCircle(ctx, pt, color, frontAlpha, backAlpha, width) {
  const N = 96;
  for (const front of [false, true]) {
    ctx.beginPath(); let pen = false;
    for (let i = 0; i <= N; i++) {
      const t = 2*Math.PI*i/N, p = pt(t), q = bsProject(p[0], p[1], p[2]);
      if ((q[2] >= 0) === front) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; }
      else pen = false;
    }
    ctx.globalAlpha = front ? frontAlpha : backAlpha;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawBloch(canvasId, theta, phi, opts) {
  const canvas = document.getElementById(canvasId);
  const ctx = LQ_INK.wrap(canvas.getContext('2d'));
  const view = BS_VIEWS[canvasId];
  bsAz = view ? view.az : BS_A; bsEl = view ? view.el : BS_B;
  BS_LAST[canvasId] = [theta, phi, opts];
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Sphere outline
  ctx.beginPath(); ctx.arc(BS_CX, BS_CY, BS_R, 0, 2*Math.PI);
  ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1.5; ctx.stroke();

  // Equator + the two meridians (x–z, y–z), far halves fainter
  ctx.setLineDash([4,4]);
  bsCircle(ctx, t => [Math.cos(t), Math.sin(t), 0], '#1e3a5f', 1, 0.35, 1);
  bsCircle(ctx, t => [Math.sin(t), 0, Math.cos(t)], '#1e3a5f', 0.8, 0.25, 1);
  bsCircle(ctx, t => [0, Math.sin(t), Math.cos(t)], '#1e3a5f', 0.45, 0.15, 1);
  ctx.setLineDash([]);

  // Axes
  const axes = [[1,0,0,'x'],[0,1,0,'y'],[0,0,1,'z']];
  axes.forEach(([ax,ay,az,name]) => {
    const [sx,sy] = bsProject(ax*1.3, ay*1.3, az*1.3);
    const [ox,oy] = bsProject(-ax*.6, -ay*.6, -az*.6);
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(sx,sy);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#64748b'; ctx.font = '11px Inter'; ctx.fillText(name, sx+4, sy+4);
  });

  // |0⟩ and |1⟩ labels
  const [z0x,z0y] = bsProject(0,0,1.15); ctx.fillStyle='#5c503c'; ctx.font='12px Inter'; ctx.fillText('|0⟩',z0x+4,z0y);
  const [z1x,z1y] = bsProject(0,0,-1.15); ctx.fillText('|1⟩',z1x+4,z1y);

  // ── Arc trail (animated gate rotation) ─────────
  if (opts && opts.trail && opts.trail.length > 1) {
    const tr = opts.trail;
    for (let i = 1; i < tr.length; i++) {
      const [x0,y0] = bsProject(...tr[i-1]);
      const [x1,y1] = bsProject(...tr[i]);
      const alpha = (i / (tr.length - 1)) * 0.7;
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
      ctx.strokeStyle = `rgba(122,79,247,${alpha.toFixed(2)})`;
      ctx.lineWidth = 2.5; ctx.stroke();
    }
  }
  // Ghost dot at target during animation
  if (opts && opts.target) {
    const [tx,ty] = bsProject(...opts.target);
    ctx.beginPath(); ctx.arc(tx,ty,5,0,2*Math.PI);
    ctx.fillStyle = 'rgba(167,139,250,0.22)'; ctx.fill();
    ctx.strokeStyle = 'rgba(122,79,247,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Measurement axis (dashed amber line through sphere)
  if (opts && opts.measureAxis) {
    const [ax, ay, az] = opts.measureAxis;
    const [px, py] = bsProject(ax * 1.25, ay * 1.25, az * 1.25);
    const [nx, ny] = bsProject(-ax * 1.25, -ay * 1.25, -az * 1.25);
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(px, py);
    ctx.strokeStyle = 'rgba(146,106,3,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.setLineDash([]);
  }

  // State vector
  const bx = Math.sin(theta)*Math.cos(phi);
  const by = Math.sin(theta)*Math.sin(phi);
  const bz = Math.cos(theta);
  const [sx,sy,sd] = bsProject(bx, by, bz);
  ctx.globalAlpha = sd < -0.05 ? 0.5 : 1;          // behind the sphere's centre plane
  ctx.beginPath(); ctx.moveTo(BS_CX,BS_CY); ctx.lineTo(sx,sy);
  ctx.strokeStyle = '#7a4ff7'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.arc(sx,sy,6,0,2*Math.PI);
  ctx.fillStyle = '#7a4ff7'; ctx.fill();
  ctx.globalAlpha = 1;

  // Dotted projection lines
  const [prx,pry] = bsProject(bx,by,0);
  ctx.setLineDash([2,3]); ctx.strokeStyle='#8c8066'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(prx,pry); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(BS_CX,BS_CY); ctx.lineTo(prx,pry); ctx.stroke();
  ctx.setLineDash([]);

  // State info
  const stateEl = document.getElementById(
    canvasId === 'blochCanvas'      ? 'blochState' :
    canvasId === 'gatesBlochCanvas' ? 'gatesBlochState' : 'measBlochState'
  );
  if (stateEl) {
    stateEl.textContent = `|ψ⟩: bx=${bx.toFixed(2)}, by=${by.toFixed(2)}, bz=${bz.toFixed(2)} | P(0)=${(Math.cos(theta/2)**2*100).toFixed(1)}%`;
  }
}

// Drag-to-rotate (js/orbit3d.js). Each sphere keeps its own view and redraws
// its last state when rotated, so gate trails / measurement axes rotate too.
if (window.AMO3D) {
  ['blochCanvas', 'gatesBlochCanvas', 'measBlochCanvas'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    BS_VIEWS[id] = AMO3D.orbit(el, {
      az: BS_A, el: BS_B, label: 'Bloch sphere',
      onChange: () => { if (BS_LAST[id]) drawBloch(id, ...BS_LAST[id]); }
    });
  });
}

// Initial Bloch sphere draw
drawBloch('blochCanvas', Math.PI/2, 0);
// Theme toggle: redraw each sphere's last state with the other theme's inks
LQ_INK.onTheme(() => Object.keys(BS_LAST).forEach(id => drawBloch(id, ...BS_LAST[id])));

/* ═══════════════════════════════════════════════
   QUANTUM GATES
   ═══════════════════════════════════════════════ */
// State as [alpha_re, alpha_im, beta_re, beta_im]
let gState = [1/Math.SQRT2, 0, 1/Math.SQRT2, 0]; // |+⟩
let gAnim = null; // animation handle

function stateToBloch(s) {
  const [ar,ai,br,bi] = s;
  return [2*(ar*br+ai*bi), 2*(ar*bi-ai*br), ar*ar+ai*ai-br*br-bi*bi];
}
function blochToAngles(bx,by,bz) {
  const theta = Math.acos(Math.max(-1,Math.min(1,bz)));
  const phi   = Math.atan2(by,bx);
  return [theta, phi < 0 ? phi+2*Math.PI : phi];
}

const s2 = 1/Math.SQRT2;
const p8 = Math.cos(Math.PI/4), q8 = Math.sin(Math.PI/4);

const GATES = {
  I:   { mat:[1,0,0,0,0,0,1,0],          label:'Identity',   desc:'No operation. Leaves state unchanged.' },
  X:   { mat:[0,0,1,0,1,0,0,0],          label:'Pauli X',    desc:'Bit-flip: |0⟩↔|1⟩. π rotation around x-axis.' },
  Y:   { mat:[0,0,0,-1,0,1,0,0],         label:'Pauli Y',    desc:'|0⟩→i|1⟩, |1⟩→-i|0⟩. π rotation around y-axis.' },
  Z:   { mat:[1,0,0,0,0,0,-1,0],         label:'Pauli Z',    desc:'Phase flip: |0⟩→|0⟩, |1⟩→-|1⟩. π rotation around z-axis.' },
  H:   { mat:[s2,0,s2,0,s2,0,-s2,0],     label:'Hadamard',   desc:'|0⟩→|+⟩, |1⟩→|−⟩. Creates superposition.' },
  S:   { mat:[1,0,0,0,0,0,0,1],          label:'S gate',     desc:'π/2 rotation around z. S² = Z.' },
  T:   { mat:[1,0,0,0,0,0,p8,q8],        label:'T gate',     desc:'π/4 rotation around z. T² = S, T⁴ = Z.' },
  Rx:  { mat:[p8,0,0,-p8,0,-p8,p8,0],    label:'Rx(π/2)',    desc:'π/2 rotation around x-axis.' },
  Ry:  { mat:[p8,0,-p8,0,p8,0,p8,0],     label:'Ry(π/2)',    desc:'π/2 rotation around y-axis.' },
  Rz:  { mat:[p8,-q8,0,0,0,0,p8,q8],     label:'Rz(π/2)',    desc:'π/2 rotation around z-axis.' },
};

const GATE_LABELS = {
  I:'[[1,0],[0,1]]',X:'[[0,1],[1,0]]',Y:'[[0,−i],[i,0]]',Z:'[[1,0],[0,−1]]',
  H:'1/√2[[1,1],[1,−1]]',S:'[[1,0],[0,i]]',T:'[[1,0],[0,e^{iπ/4}]]',
  Rx:'[[cos(π/4),−i sin(π/4)],[−i sin(π/4),cos(π/4)]]',
  Ry:'[[cos(π/4),−sin(π/4)],[sin(π/4),cos(π/4)]]',
  Rz:'[[e^{−iπ/4},0],[0,e^{iπ/4}]]',
};

function applyMat(state, mat) {
  const [ar,ai,br,bi] = state;
  const [m00r,m00i,m01r,m01i,m10r,m10i,m11r,m11i] = mat;
  return [
    m00r*ar-m00i*ai+m01r*br-m01i*bi,
    m00r*ai+m00i*ar+m01r*bi+m01i*br,
    m10r*ar-m10i*ai+m11r*br-m11i*bi,
    m10r*ai+m10i*ar+m11r*bi+m11i*br,
  ];
}

function setGateState() {
  const th = +document.getElementById('gThSlide').value * Math.PI/180;
  const ph = +document.getElementById('gPhSlide').value * Math.PI/180;
  gState = [Math.cos(th/2), 0, Math.sin(th/2)*Math.cos(ph), Math.sin(th/2)*Math.sin(ph)];
  redrawGateBloch();
}

function applyGateBtn(name) {
  const g = GATES[name];
  const fromBV = stateToBloch(gState);
  gState = applyMat(gState, g.mat);
  const toBV = stateToBloch(gState);

  document.getElementById('gateMatrix').innerHTML =
    `<strong style="font-size:.8rem;color:var(--c-qc)">${g.label}</strong><br>
     <span style="color:#5c503c;font-size:.78rem">${GATE_LABELS[name]}</span>`;
  document.getElementById('gateDesc').textContent = g.desc;

  // Animated SLERP rotation along the great-circle arc
  const dot = Math.max(-1, Math.min(1, fromBV[0]*toBV[0]+fromBV[1]*toBV[1]+fromBV[2]*toBV[2]));
  if (dot > 0.9999) { redrawGateBloch(); return; } // identity — nothing to animate

  if (gAnim) cancelAnimationFrame(gAnim.rafId);
  const trail = [fromBV];
  const Omega = Math.acos(dot);
  const sinO  = Math.sin(Omega);
  const STEPS = 28; // ~0.47 s at 60 fps
  let step = 0;

  function tick() {
    step++;
    const frac = step / STEPS;
    // Spherical linear interpolation (SLERP)
    const w1 = Math.sin((1-frac)*Omega) / sinO;
    const w2 = Math.sin(frac*Omega) / sinO;
    const bx = w1*fromBV[0] + w2*toBV[0];
    const by = w1*fromBV[1] + w2*toBV[1];
    const bz = w1*fromBV[2] + w2*toBV[2];
    trail.push([bx, by, bz]);

    const [th, ph] = blochToAngles(bx, by, bz);
    drawBloch('gatesBlochCanvas', th, ph, { trail, target: toBV });
    const stEl = document.getElementById('gatesBlochState');
    if (stEl) stEl.textContent =
      `|ψ⟩: bx=${bx.toFixed(2)}, by=${by.toFixed(2)}, bz=${bz.toFixed(2)} | P(0)=${(Math.cos(th/2)**2*100).toFixed(1)}%`;

    if (step >= STEPS) { gAnim = null; redrawGateBloch(); return; }
    gAnim = { rafId: requestAnimationFrame(tick) };
  }
  gAnim = { rafId: requestAnimationFrame(tick) };
}

function resetGateState() { setGateState(); document.getElementById('gateMatrix').innerHTML=''; document.getElementById('gateDesc').textContent=''; }

function redrawGateBloch() {
  const [bx,by,bz] = stateToBloch(gState);
  const [th,ph] = blochToAngles(bx,by,bz);
  drawBloch('gatesBlochCanvas', th, ph);
}
setGateState();

/* ═══════════════════════════════════════════════
   MZI — animated canvas (proper rectangular geometry)
   Upper and lower arms run horizontally; both converge at BS2.
   ═══════════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('mziCanvas');
  if (!cv) return;
  const cx = LQ_INK.wrap(cv.getContext('2d'));
  const W = 640, H = 210;

  // Geometry: horizontal arms between beamsplitters
  const INx = 18, INy = 105;           // photon input beam
  const BS1x = 100, BS1y = 105;        // first beamsplitter (center)
  const topY = 52, botY = 158;         // upper / lower arm heights
  const DIVx = 152;                    // where arms reach horizontal height
  const ARMend = 445;                  // where arms start converging back to BS2
  const BS2x = 493, BS2y = 105;        // second beamsplitter (center)
  const DETx = 565;                    // detector circle center x
  const DET0y = topY, DET1y = botY;   // detector y positions

  // Path segment arrays (polyline nodes for arc-length photon tracking)
  const upPath = [[BS1x, BS1y], [DIVx, topY],  [ARMend, topY],  [BS2x, BS2y]];
  const loPath = [[BS1x, BS1y], [DIVx, botY],  [ARMend, botY],  [BS2x, BS2y]];

  let photonT = 0, lastTs = 0;
  const CYCLE = 3000; // ms per loop

  function getPhi() {
    const el = document.getElementById('mziPhi');
    return el ? +el.value * Math.PI / 180 : 0;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  // Glow line helper
  function gline(x1, y1, x2, y2, col, alpha, w) {
    cx.save();
    cx.globalAlpha = alpha; cx.strokeStyle = col; cx.lineWidth = w || 1.5;
    cx.shadowColor = col; cx.shadowBlur = 6;
    cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
    cx.restore();
  }

  // Glow polyline
  function gpoly(pts, col, alpha, w) {
    if (pts.length < 2) return;
    cx.save();
    cx.globalAlpha = alpha; cx.strokeStyle = col; cx.lineWidth = w || 1.5;
    cx.shadowColor = col; cx.shadowBlur = 5;
    cx.beginPath(); cx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i][0], pts[i][1]);
    cx.stroke(); cx.restore();
  }

  // Point on a polypath at normalized arc-length t ∈ [0,1]
  function pathPt(segs, t) {
    let lens = [], total = 0;
    for (let i = 1; i < segs.length; i++) {
      const d = Math.hypot(segs[i][0] - segs[i-1][0], segs[i][1] - segs[i-1][1]);
      lens.push(d); total += d;
    }
    const tgt = t * total;
    let acc = 0;
    for (let i = 0; i < lens.length; i++) {
      if (acc + lens[i] >= tgt) {
        const f = (tgt - acc) / lens[i];
        return [lerp(segs[i][0], segs[i+1][0], f), lerp(segs[i][1], segs[i+1][1], f)];
      }
      acc += lens[i];
    }
    return segs[segs.length - 1];
  }

  function drawBS(x, y, label) {
    cx.save(); cx.translate(x, y); cx.rotate(Math.PI / 4);
    const g = cx.createLinearGradient(-15, 0, 15, 0);
    g.addColorStop(0, 'rgba(167,139,250,0.04)');
    g.addColorStop(0.5, 'rgba(167,139,250,0.30)');
    g.addColorStop(1, 'rgba(167,139,250,0.04)');
    cx.fillStyle = g; cx.strokeStyle = '#7a4ff7'; cx.lineWidth = 1.8;
    cx.shadowColor = '#7a4ff7'; cx.shadowBlur = 12;
    cx.beginPath(); cx.roundRect(-15, -4.5, 30, 9, 2); cx.fill(); cx.stroke();
    cx.restore();
    cx.fillStyle = '#7451fa'; cx.font = 'bold 12px Inter,sans-serif'; cx.textAlign = 'center';
    cx.fillText(label, x, y - 15);
  }

  function drawPhasePlate(phi) {
    const mx = (DIVx + ARMend) / 2, py = botY;
    cx.save();
    const g = cx.createLinearGradient(mx - 26, 0, mx + 26, 0);
    g.addColorStop(0, 'rgba(251,191,36,0.0)');
    g.addColorStop(0.3, 'rgba(251,191,36,0.22)');
    g.addColorStop(0.7, 'rgba(251,191,36,0.22)');
    g.addColorStop(1, 'rgba(251,191,36,0.0)');
    cx.fillStyle = g; cx.strokeStyle = '#926a03'; cx.lineWidth = 1.4;
    cx.shadowColor = '#926a03'; cx.shadowBlur = 8;
    cx.beginPath(); cx.roundRect(mx - 27, py - 14, 54, 28, 4); cx.fill(); cx.stroke();
    cx.fillStyle = '#926a03'; cx.font = '10px JetBrains Mono,monospace'; cx.textAlign = 'center';
    cx.fillText('φ=' + Math.round(phi * 180 / Math.PI) + '°', mx, py + 5);
    cx.restore();
  }

  function drawDetector(x, y, P, col, label) {
    cx.save();
    cx.shadowColor = col; cx.shadowBlur = P * 22;
    cx.globalAlpha = 0.18 + P * 0.82; cx.fillStyle = col;
    cx.beginPath(); cx.arc(x, y, 12, 0, 2 * Math.PI); cx.fill();
    cx.globalAlpha = 1; cx.strokeStyle = col; cx.lineWidth = 1.5;
    cx.beginPath(); cx.arc(x, y, 12, 0, 2 * Math.PI); cx.stroke();
    cx.restore();
    cx.fillStyle = col; cx.font = '11px Inter,sans-serif'; cx.textAlign = 'left';
    cx.fillText(label + '  ' + (P * 100).toFixed(0) + '%', x + 16, y + 4);
  }

  function drawPhoton(x, y, col, alpha) {
    cx.save();
    cx.shadowColor = col; cx.shadowBlur = 18; cx.globalAlpha = alpha;
    cx.fillStyle = col; cx.beginPath(); cx.arc(x, y, 5.5, 0, 2 * Math.PI); cx.fill();
    cx.restore();
  }

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs; lastTs = ts;
    photonT = (photonT + dt / CYCLE) % 1;
    const phi = getPhi();
    const P0 = Math.cos(phi / 2) ** 2;
    const P1 = Math.sin(phi / 2) ** 2;

    cx.clearRect(0, 0, W, H);
    cx.fillStyle = '#faf5e9'; cx.fillRect(0, 0, W, H);

    // Background beam paths (always visible, dim)
    gline(INx, INy, BS1x, BS1y, '#60a5fa', 0.45, 2);           // input
    gpoly(upPath, '#34d399', 0.38, 1.5);                         // upper arm (BS1 → BS2)
    gpoly(loPath, '#fbbf24', 0.38, 1.5);                         // lower arm (BS1 → BS2)
    gline(BS2x, BS2y, DETx - 12, DET0y, '#60a5fa', 0.18 + P0 * 0.6, 1.5);  // output |0⟩
    gline(BS2x, BS2y, DETx - 12, DET1y, '#f87171', 0.18 + P1 * 0.6, 1.5);  // output |1⟩

    // Arm labels (centred on horizontal sections)
    const armMidX = (DIVx + ARMend) / 2;
    cx.fillStyle = '#1c805b'; cx.font = '10px Inter,sans-serif'; cx.textAlign = 'center';
    cx.fillText('arm 0  |0⟩', armMidX, topY - 9);
    cx.fillStyle = '#926a03';
    cx.fillText('arm 1  |1⟩  + φ', armMidX, botY + 20);

    // Phase plate on lower arm
    drawPhasePlate(phi);

    // Beamsplitters (both at centre y = 105, where arms meet)
    drawBS(BS1x, BS1y, 'H');
    drawBS(BS2x, BS2y, 'H');

    // Input label
    cx.fillStyle = '#076ce7'; cx.font = '13px Inter,sans-serif'; cx.textAlign = 'right';
    cx.fillText('|0⟩', INx - 3, INy + 4);

    // Detectors
    drawDetector(DETx, DET0y, P0, '#60a5fa', '|0⟩');
    drawDetector(DETx, DET1y, P1, '#f87171', '|1⟩');

    // Animated photon
    const t = photonT;
    if (t < 0.18) {
      // Single photon: input → BS1
      const p = ease(t / 0.18);
      drawPhoton(lerp(INx, BS1x, p), INy, '#60a5fa', 1);
    } else if (t < 0.70) {
      // Both arms active simultaneously (superposition)
      const p = ease((t - 0.18) / 0.52);
      const [ux, uy] = pathPt(upPath, p);
      drawPhoton(ux, uy, '#34d399', 0.95);
      const [lx, ly] = pathPt(loPath, p);
      drawPhoton(lx, ly, '#fbbf24', 0.95);
    } else {
      // Interference output: photons from BS2 to respective detectors
      const p = ease((t - 0.70) / 0.30);
      if (P0 > 0.02) drawPhoton(lerp(BS2x, DETx, p), lerp(BS2y, DET0y, p), '#60a5fa', P0 * 0.9 + 0.1);
      if (P1 > 0.02) drawPhoton(lerp(BS2x, DETx, p), lerp(BS2y, DET1y, p), '#f87171', P1 * 0.9 + 0.1);
    }

  }

  const tick = LQ_INK.track(frame);
  if (window.AMOMotion) AMOMotion.loop(cv, tick); else requestAnimationFrame(function f(t){ tick(t); requestAnimationFrame(f); });
})();

function updateMZI() {
  const phi = +document.getElementById('mziPhi').value * Math.PI/180;
  const P0 = Math.cos(phi/2)**2, P1 = Math.sin(phi/2)**2;
  const b = document.getElementById('mziBanner');
  if (P0 > 0.99) { b.textContent='Constructive interference → all photons exit |0⟩ (upper output).'; b.style.background='#052e16'; }
  else if (P1 > 0.99) { b.textContent='Destructive interference → all photons exit |1⟩ (lower output).'; b.style.background='#1c1007'; }
  else { b.textContent=`P(|0⟩) = ${(P0*100).toFixed(1)}%,  P(|1⟩) = ${(P1*100).toFixed(1)}%  — partial interference.`; b.style.background='#0a1020'; }
}

/* ═══════════════════════════════════════════════
   MEASUREMENT — basis-aware Born rule demo
   ═══════════════════════════════════════════════ */
let measChart;
(function initMeasChart() {
  const ctx = document.getElementById('measChart').getContext('2d');
  measChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['|0⟩', '|1⟩'],
      datasets: [
        { label: 'Expected (Born)', data: [50, 50],
          backgroundColor: ['#60a5fa33','#f8717133'],
          borderColor: ['#60a5fa','#f87171'], borderWidth: 2, borderRadius: 5 },
        { label: 'Measured', data: [0, 0],
          backgroundColor: ['#60a5faaa','#f87171aa'],
          borderColor: ['#60a5fa','#f87171'], borderWidth: 2, borderRadius: 5 }
      ]
    },
    options: { responsive: true,
      plugins: { legend: { labels: { color: '#5c503c', font: { size: 11 } } } },
      scales: { y: { min: 0, ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                x: { ticks: { color: '#5c503c' }, grid: { color: '#1e293b' } } }
    }
  });
})();

let measBasis = 'Z';
let measCumulative = [0, 0];
let collapseAnim = null;

function getMeasProbs() {
  const thDeg  = +document.getElementById('measTh').value;
  const phiDeg = +document.getElementById('measPhi').value;
  const th  = thDeg  * Math.PI / 180;
  const phi = phiDeg * Math.PI / 180;
  const bx = Math.sin(th) * Math.cos(phi);
  const by = Math.sin(th) * Math.sin(phi);
  const bz = Math.cos(th);
  let P0, P1, label0, label1, col0, col1, mAxis, formula;
  if (measBasis === 'Z') {
    P0 = Math.cos(th / 2) ** 2; P1 = 1 - P0;
    label0 = '|0⟩'; label1 = '|1⟩'; col0 = '#60a5fa'; col1 = '#f87171';
    mAxis = [0, 0, 1];
    formula = 'Z basis:  P(|0⟩) = cos²(θ/2)  —  φ is undetectable';
  } else if (measBasis === 'X') {
    P0 = (1 + bx) / 2; P1 = 1 - P0;
    label0 = '|+⟩'; label1 = '|−⟩'; col0 = '#34d399'; col1 = '#fb923c';
    mAxis = [1, 0, 0];
    formula = 'X basis:  P(|+⟩) = ½(1 + sinθ cosφ)  —  sensitive to φ';
  } else {
    P0 = (1 + by) / 2; P1 = 1 - P0;
    label0 = '|+i⟩'; label1 = '|−i⟩'; col0 = '#e879f9'; col1 = '#fbbf24';
    mAxis = [0, 1, 0];
    formula = 'Y basis:  P(|+i⟩) = ½(1 + sinθ sinφ)  —  sensitive to φ';
  }
  return { P0, P1, label0, label1, col0, col1, mAxis, formula, bx, by, bz, th, phi };
}

function setBasis(b) {
  measBasis = b;
  ['Z','X','Y'].forEach(k => {
    const btn = document.getElementById('basisBtn' + k);
    if (!btn) return;
    btn.style.borderColor = k === b ? 'var(--c-qc)' : '';
    btn.style.color       = k === b ? 'var(--c-qc)' : '';
  });
  measCumulative = [0, 0];
  updateMeas();
}

function updateMeas() {
  document.getElementById('measThLbl').textContent  = document.getElementById('measTh').value  + '°';
  document.getElementById('measPhiLbl').textContent = document.getElementById('measPhi').value + '°';

  const { P0, P1, label0, label1, col0, col1, mAxis, formula, th, phi } = getMeasProbs();

  // Probability labels + values
  document.getElementById('meas0Lbl').textContent = 'P(' + label0 + ')';
  document.getElementById('meas1Lbl').textContent = 'P(' + label1 + ')';
  // the plot colours are tuned for the canvas; mix toward the text colour so the labels pass contrast in both themes
  document.getElementById('meas0Lbl').style.color = 'color-mix(in srgb, ' + col0 + ' 62%, var(--text-primary))';
  document.getElementById('meas1Lbl').style.color = 'color-mix(in srgb, ' + col1 + ' 62%, var(--text-primary))';
  document.getElementById('measP0').textContent = (P0 * 100).toFixed(1) + '%';
  document.getElementById('measP1').textContent = (P1 * 100).toFixed(1) + '%';

  // Basis formula banner
  document.getElementById('basisInfo').textContent = formula;

  // Histogram labels + expected bars + colors
  document.getElementById('histTitle').textContent = 'Measurement histogram — ' + measBasis + ' basis';
  measChart.data.labels = [label0, label1];
  measChart.data.datasets[0].data = [P0 * 100, P1 * 100];
  measChart.data.datasets[0].backgroundColor = [col0 + '33', col1 + '33'];
  measChart.data.datasets[0].borderColor      = [col0, col1];
  measChart.data.datasets[1].data = [...measCumulative];
  measChart.data.datasets[1].backgroundColor = [col0 + 'aa', col1 + 'aa'];
  measChart.data.datasets[1].borderColor      = [col0, col1];
  const tot = measCumulative[0] + measCumulative[1];
  measChart.options.scales.y.max = tot > 0 ? Math.max(tot * 0.7, Math.max(...measCumulative) * 1.1) : 100;
  measChart.update('none');

  // Mini Bloch sphere
  drawBloch('measBlochCanvas', th, phi < 0 ? phi + 2 * Math.PI : phi, { measureAxis: mAxis });
}

function singleShot() {
  const { P0, label0, label1, col0, col1, mAxis, th, phi } = getMeasProbs();
  const outcome = Math.random() < P0 ? 0 : 1;
  const lbl = outcome === 0 ? label0 : label1;
  const col = outcome === 0 ? col0   : col1;
  const el  = document.getElementById('collapseResult');
  el.textContent = '→ ' + lbl; el.style.color = col;

  // Collapse endpoint on Bloch sphere
  let tx, ty, tz;
  if      (measBasis === 'Z') { tx = 0; ty = 0; tz = outcome === 0 ? 1 : -1; }
  else if (measBasis === 'X') { tx = outcome === 0 ? 1 : -1; ty = 0; tz = 0; }
  else                        { tx = 0; ty = outcome === 0 ? 1 : -1; tz = 0; }

  const sx = Math.sin(th) * Math.cos(phi);
  const sy = Math.sin(th) * Math.sin(phi);
  const sz = Math.cos(th);

  const START = performance.now(), DUR = 480;
  if (collapseAnim) cancelAnimationFrame(collapseAnim);
  function animate(now) {
    const frac = Math.min((now - START) / DUR, 1);
    const t = frac < 0.5 ? 2*frac*frac : 1 - Math.pow(-2*frac+2, 2)/2;
    const ix = sx + (tx - sx) * t, iy = sy + (ty - sy) * t, iz = sz + (tz - sz) * t;
    const len = Math.sqrt(ix*ix + iy*iy + iz*iz) || 1;
    const newTh  = Math.acos(Math.max(-1, Math.min(1, iz / len)));
    const newPhi = Math.atan2(iy, ix);
    drawBloch('measBlochCanvas', newTh, newPhi < 0 ? newPhi + 2*Math.PI : newPhi, { measureAxis: mAxis });
    if (frac < 1) { collapseAnim = requestAnimationFrame(animate); return; }
    // Sync sliders to collapsed state
    document.getElementById('measTh').value  = Math.round(newTh  * 180 / Math.PI);
    document.getElementById('measPhi').value = Math.round((newPhi < 0 ? newPhi + 2*Math.PI : newPhi) * 180 / Math.PI);
    updateMeas();
  }
  collapseAnim = requestAnimationFrame(animate);
}

function runMeasurement() {
  const { P0, P1, label0, label1 } = getMeasProbs();
  const N = parseInt(document.getElementById('measShots').value);
  let cnt0 = 0;
  for (let i = 0; i < N; i++) if (Math.random() < P0) cnt0++;
  measCumulative[0] += cnt0;
  measCumulative[1] += N - cnt0;
  const tot = measCumulative[0] + measCumulative[1];
  measChart.data.datasets[1].data = [...measCumulative];
  measChart.options.scales.y.max = Math.max(tot * 0.7, (Math.max(...measCumulative) || 1) * 1.1);
  measChart.update('none');
  const f0 = (measCumulative[0]/tot*100).toFixed(1), f1 = (measCumulative[1]/tot*100).toFixed(1);
  document.getElementById('shotInfo').textContent =
    `Total: ${tot} shots  |  ${label0}: ${measCumulative[0]} (${f0}%)  |  ${label1}: ${measCumulative[1]} (${f1}%)`;
}

function clearMeasurement() {
  measCumulative = [0, 0];
  measChart.data.datasets[1].data = [0, 0];
  measChart.update('none');
  document.getElementById('shotInfo').textContent = '';
  document.getElementById('collapseResult').textContent = '';
}

updateMeas();

/* ═══════════════════════════════════════════════
   ENTANGLEMENT / BELL STATES
   ═══════════════════════════════════════════════ */
const BELL_STATES = [
  { name:'|Φ⁺⟩', vec:'(|00⟩ + |11⟩)/√2', amps:[s2,0,0,s2], desc:'Maximally entangled. Measuring qubit A in |0⟩ → qubit B collapses to |0⟩. Measuring |1⟩ → |1⟩.', type:'entangled' },
  { name:'|Φ⁻⟩', vec:'(|00⟩ − |11⟩)/√2', amps:[s2,0,0,-s2], desc:'Maximally entangled. Same correlated outcomes as |Φ⁺⟩ but with relative phase −1, distinguishable via interference, not single-qubit measurement.', type:'entangled' },
  { name:'|Ψ⁺⟩', vec:'(|01⟩ + |10⟩)/√2', amps:[0,s2,s2,0], desc:'Maximally entangled. Measuring |0⟩ on A → B collapses to |1⟩ (anti-correlated). Used in quantum teleportation.', type:'entangled' },
  { name:'|Ψ⁻⟩', vec:'(|01⟩ − |10⟩)/√2', amps:[0,s2,-s2,0], desc:'Singlet state. Antisymmetric under exchange. Total spin 0. Violates Bell inequality maximally.', type:'entangled' },
  { name:'|00⟩',  vec:'|0⟩⊗|0⟩ (product)', amps:[1,0,0,0], desc:'Separable product state, not entangled. Can be written as |ψ_A⟩⊗|ψ_B⟩. Measuring A tells you nothing about B beyond what you already knew.', type:'separable' },
  { name:'|++⟩',  vec:'(|0⟩+|1⟩)/√2 ⊗ (|0⟩+|1⟩)/√2', amps:[0.5,0.5,0.5,0.5], desc:'Separable superposition. |++⟩ = (|00⟩+|01⟩+|10⟩+|11⟩)/2. Each qubit independently in |+⟩.', type:'separable' },
];

let selBell = 0;
function selectBell(idx) {
  selBell = idx;
  document.querySelectorAll('.bell-card').forEach((c,i)=>c.classList.toggle('selected',i===idx));
  renderBellInfo();
}
function renderBellInfo() {
  const b = BELL_STATES[selBell];
  const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];
  const absSq = b.amps.map(a=>a*a);
  document.getElementById('bellInfo').innerHTML = `
    <div>
      <div class="theory-box">
        <h4>${b.name}, ${b.type === 'entangled' ? '🔗 Entangled' : '✓ Separable'}</h4>
        <p>${b.desc}</p>
      </div>
      <div class="formula-box">${b.vec}

Ket coefficients:
${labels.map((l,i)=>`  ${l}: amplitude = ${b.amps[i]>=0?'+':''}${b.amps[i].toFixed(3)},  prob = ${(absSq[i]*100).toFixed(0)}%`).join('\n')}</div>
    </div>
    <div class="chart-card">
      <h5>Measurement probabilities P(outcome)</h5>
      <canvas id="bellChart" height="200" role="img" aria-label="Bell Chart interactive visualization"></canvas>
    </div>`;
  setTimeout(()=>{
    const ctx = document.getElementById('bellChart').getContext('2d');
    new Chart(ctx,{type:'bar',data:{labels,datasets:[{
      data:absSq.map(v=>v*100),
      backgroundColor:['#60a5faaa','#34d399aa','#fbbf24aa','#f87171aa'],
      borderColor:['#60a5fa','#34d399','#fbbf24','#f87171'],
      borderWidth:2, borderRadius:5}]},
      options:{responsive:true,plugins:{legend:{display:false}},
        scales:{y:{min:0,max:100,ticks:{color:'#64748b',callback:v=>v+'%'},grid:{color:'#1e293b'}},
                x:{ticks:{color:'#5c503c'},grid:{color:'#1e293b'}}}}});
  },20);
}
renderBellInfo();

/* ═══════════════════════════════════════════════
   RYDBERG
   ═══════════════════════════════════════════════ */
let rydChart;
(function(){
  const ctx = document.getElementById('rydChart').getContext('2d');
  rydChart = new Chart(ctx,{type:'line',data:{labels:[],datasets:[
    {label:'V(R) = C₆/R⁶',data:[],borderColor:'#f87171',borderWidth:2,pointRadius:0},
    {label:'ℏΩ_R (blockade threshold)',data:[],borderColor:'#fbbf24',borderWidth:1.5,borderDash:[5,4],pointRadius:0}
  ]},options:{responsive:true,plugins:{legend:{labels:{color:'#5c503c',font:{size:11}}}},
    scales:{x:{title:{display:true,text:'Atom separation R (μm)',color:'#5c503c'},ticks:{color:'#64748b'},grid:{color:'#1e293b'}},
            y:{title:{display:true,text:'Energy / h (MHz)',color:'#5c503c'},ticks:{color:'#64748b'},grid:{color:'#1e293b'},type:'logarithmic'}}}});
  updateRydberg();
})();

function updateRydberg() {
  const n    = parseInt(document.getElementById('rydN').value);
  const OmMHz = parseFloat(document.getElementById('rydOm').value);
  const atom = document.getElementById('rydAtom').value;

  // C6 scales as n^11, calibrate to known Cs values (n=70, C6 ≈ 800 GHz·μm^6)
  const C6_70 = atom === 'Cs' ? 800e3 : 862e3;  // MHz·μm^6 (Rb 70S: 862 GHz·μm⁶, Bernien et al. 2017)
  const C6    = C6_70 * Math.pow(n/70, 11);

  // Blockade radius (C6 / (ℏΩ))^{1/6} = (C6 / Ω_MHz * 1e6)^{1/6} μm... be careful with units
  // C6 in MHz·μm^6, Ω in MHz → R_b = (C6/Ω)^(1/6) μm
  const Rb = Math.pow(C6 / OmMHz, 1/6);

  document.getElementById('rydResult').innerHTML = `
    <div class="r-pair"><span class="r-lbl">n</span><span class="r-val">${n}</span></div>
    <div class="r-pair"><span class="r-lbl">C₆ (MHz·μm⁶)</span><span class="r-val">${C6>=1e6?(C6/1e6).toFixed(1)+'T':(C6>=1e3?(C6/1e3).toFixed(1)+'G':C6.toFixed(0)+'M')}</span></div>
    <div class="r-pair"><span class="r-lbl">R_blockade</span><span class="r-val">${Rb.toFixed(1)} μm</span></div>
    <div class="r-pair"><span class="r-lbl">Typical spacing</span><span class="r-val">${(Rb*0.6).toFixed(1)} μm</span></div>`;
  document.getElementById('rydBanner').textContent =
    `Blockade radius R_b = ${Rb.toFixed(1)} μm at n=${n}. Tweezer spacing ≈ ${(Rb*0.6).toFixed(1)} μm.  C₆ scales as n*¹¹.`;

  const Rs=[], Vs=[], thresh=[];
  for (let R=1; R<=20; R+=0.2) {
    Rs.push(R.toFixed(1));
    Vs.push(Math.max(C6/Math.pow(R,6), 0.01));
    thresh.push(OmMHz);
  }
  rydChart.data.labels = Rs;
  rydChart.data.datasets[0].data = Vs;
  rydChart.data.datasets[1].data = thresh;
  rydChart.update('none');
}

/* ═══════════════════════════════════════════════
   TWO-QUBIT GATES
   ═══════════════════════════════════════════════ */
const TQ_GATES = {
  CNOT: {
    matrix: ['1','0','0','0', '0','1','0','0', '0','0','0','1', '0','0','1','0'],
    truth: [['|00⟩','→','|00⟩'],['|01⟩','→','|01⟩'],['|10⟩','→','|11⟩'],['|11⟩','→','|10⟩']],
    desc: '<h4>CNOT, Controlled-NOT</h4><p>Flips the target qubit if and only if the control qubit is |1⟩. Together with single-qubit gates, CNOT is universal for quantum computing. Applied to |+0⟩ → Bell state |Φ⁺⟩.</p>',
  },
  CZ: {
    matrix: ['1','0','0','0', '0','1','0','0', '0','0','1','0', '0','0','0','−1'],
    truth: [['|00⟩','→','|00⟩'],['|01⟩','→','|01⟩'],['|10⟩','→','|10⟩'],['|11⟩','→','−|11⟩']],
    desc: '<h4>CZ, Controlled-Z</h4><p>Adds a phase of −1 to |11⟩. Symmetric in the two qubits. Equivalent to CNOT via Hadamards: CZ = (I⊗H)·CNOT·(I⊗H). Natural two-qubit gate for Rydberg atoms.</p>',
  },
  iSWAP: {
    matrix: ['1','0','0','0', '0','0','i','0', '0','i','0','0', '0','0','0','1'],
    truth: [['|00⟩','→','|00⟩'],['|01⟩','→','i|10⟩'],['|10⟩','→','i|01⟩'],['|11⟩','→','|11⟩']],
    desc: '<h4>iSWAP</h4><p>Swaps the two qubits and adds a phase of i. Natural for superconducting transmon qubits (capacitive coupling). Can generate maximal entanglement: (iSWAP)^{1/2} is a "√iSWAP" entangling gate.</p>',
  },
  SWAP: {
    matrix: ['1','0','0','0', '0','0','1','0', '0','1','0','0', '0','0','0','1'],
    truth: [['|00⟩','→','|00⟩'],['|01⟩','→','|10⟩'],['|10⟩','→','|01⟩'],['|11⟩','→','|11⟩']],
    desc: '<h4>SWAP</h4><p>Exchanges the two qubit states. Not itself entangling but needed for routing in architectures with limited connectivity. SWAP = 3 × CNOT.</p>',
  },
};

function updateTwoQubit() {
  const key = document.getElementById('tqSel').value;
  const g = TQ_GATES[key];
  const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];
  const hilite = g.matrix.map(v => v!=='0' && v!=='1');

  document.getElementById('tqMatrix').innerHTML = `
    <div style="margin-bottom:.5rem; font-size:.82rem; font-weight:600; color:var(--text-muted);">${key} matrix (basis: |00⟩,|01⟩,|10⟩,|11⟩)</div>
    <div class="matrix-wrap"><table>
    ${[0,1,2,3].map(r=>`<tr>${[0,1,2,3].map(c=>`<td class="${g.matrix[r*4+c]!=='0'?'val':''}">${g.matrix[r*4+c]}</td>`).join('')}</tr>`).join('')}
    </table></div>
`;

  const rows = g.truth.map(([inp,,out]) =>
    `<tr><td>${inp}</td><td>→</td><td class="hilite">${out}</td></tr>`).join('');
  document.getElementById('tqTruth').innerHTML =
    `<thead><tr><th scope="col">Input</th><th scope="col"></th><th scope="col">Output</th></tr></thead><tbody>${rows}</tbody>`;
  document.getElementById('tqDesc').innerHTML = g.desc;
}
updateTwoQubit();

/* ═══════════════════════════════════════════════
   RABI OSCILLATIONS
   ═══════════════════════════════════════════════ */
let rabiChart;
(function(){
  const ctx = document.getElementById('rabiChart').getContext('2d');
  rabiChart = new Chart(ctx,{type:'line',data:{labels:[],datasets:[
    {label:'P₁(t)',data:[],borderColor:'#a78bfa',borderWidth:2,pointRadius:0,fill:true,backgroundColor:'#a78bfa18'},
    {label:'P₀(t)',data:[],borderColor:'#60a5fa',borderWidth:1.5,pointRadius:0,borderDash:[4,3]}
  ]},options:{responsive:true,plugins:{legend:{labels:{color:'#5c503c',font:{size:11}}}},
    scales:{x:{title:{display:true,text:'Time (μs)',color:'#5c503c'},ticks:{color:'#64748b'},grid:{color:'#1e293b'}},
            y:{min:0,max:1,title:{display:true,text:'Population',color:'#5c503c'},ticks:{color:'#64748b'},grid:{color:'#1e293b'}}}}});
  updateRabi();
})();

function updateRabi() {
  const Om = parseFloat(document.getElementById('rabiOm').value);
  const De = parseFloat(document.getElementById('rabiD').value);
  const OmP = Math.sqrt(Om*Om + De*De);
  const A = (Om/OmP)**2;
  const t_pi = 1/(2*Om);  // in μs
  const ts=[], P1=[], P0=[];
  for (let t=0; t<=6/Om; t+=0.02/Om) {
    ts.push((t*1e6).toFixed(2) + '');  // just use counter
    const p1 = A * Math.sin(Math.PI*OmP*t)**2;
    P1.push(p1); P0.push(1-p1);
  }
  // Re-label as μs
  const tArr = [];
  const dt = 6/Om / (ts.length-1);
  for (let i=0;i<ts.length;i++) tArr.push((i*dt).toFixed(3));
  rabiChart.data.labels = tArr;
  rabiChart.data.datasets[0].data = P1;
  rabiChart.data.datasets[1].data = P0;
  rabiChart.update('none');
  document.getElementById('rabiInfo').textContent =
    `Ω' = √(Ω²+Δ²) = ${OmP.toFixed(2)} MHz,  amplitude = ${(A*100).toFixed(1)}%,  π-pulse t = ${(t_pi*1e3).toFixed(0)} ns`;
}

/* ═══════════════════════════════════════════════
   RABI BLOCH SPHERE ANIMATION
   ═══════════════════════════════════════════════ */
(function() {
  const bCvs = document.getElementById('rabiBlochCanvas');
  const tCvs = document.getElementById('rabiTraceCanvas');
  if (!bCvs || !tCvs) return;
  const bCtx = LQ_INK.wrap(bCvs.getContext('2d'));
  const tCtx = LQ_INK.wrap(tCvs.getContext('2d'));

  // Bloch sphere geometry (same projection as main BS)
  const R = 80, CX = 110, CY = 120;
  const rabiView = window.AMO3D
    ? AMO3D.orbit(document.getElementById('rabiBlochCanvas'), { az: Math.PI/6, el: Math.PI/5, label: 'Rabi precession on the Bloch sphere' })
    : { az: Math.PI/6, el: Math.PI/5 };
  function proj(x, y, z) {
    const A = rabiView.az, B = rabiView.el;
    const xr = x*Math.cos(A) - y*Math.sin(A);
    const yr = x*Math.sin(A) + y*Math.cos(A);
    return [CX + R*xr, CY - R*(z*Math.cos(B) + yr*Math.sin(B))];
  }

  // Animation state
  let phase = 0;       // current rotation angle around effective axis
  let Om = 1.0, De = 0.0;  // Ω, Δ in MHz
  let traceData = [];  // P1 history for scrolling trace
  const TRACE_LEN = 180;

  // Sync from sliders
  window.rabiAnimSync = function(om, de) { Om = om; De = de; };

  // Patch updateRabi to also sync animation
  const _origUpdateRabi = updateRabi;
  window.updateRabi = function() {
    _origUpdateRabi();
    Om = parseFloat(document.getElementById('rabiOm').value);
    De = parseFloat(document.getElementById('rabiD').value);
  };

  function drawBS(bx, by, bz, trail) {
    const W = bCvs.width, H = bCvs.height;
    bCtx.fillStyle = '#faf5e9';
    bCtx.fillRect(0, 0, W, H);

    // Sphere
    bCtx.beginPath(); bCtx.arc(CX, CY, R, 0, 2*Math.PI);
    bCtx.strokeStyle = '#1e3a5f'; bCtx.lineWidth = 1.2; bCtx.stroke();

    // Equator
    bCtx.setLineDash([3,4]); bCtx.strokeStyle = '#1e3a5f'; bCtx.lineWidth = 0.8;
    bCtx.beginPath();
    for (let t=0; t<=2*Math.PI; t+=0.05) {
      const [sx,sy] = proj(Math.cos(t), Math.sin(t), 0);
      t===0 ? bCtx.moveTo(sx,sy) : bCtx.lineTo(sx,sy);
    }
    bCtx.stroke();
    bCtx.setLineDash([]);

    // Axes
    [[[1,0,0],'x','#334155'],[[0,1,0],'y','#334155'],[[0,0,1],'z','#8c8066']].forEach(([v,n,c]) => {
      const [sx,sy] = proj(v[0]*1.25,v[1]*1.25,v[2]*1.25);
      const [ox,oy] = proj(-v[0]*.5,-v[1]*.5,-v[2]*.5);
      bCtx.beginPath(); bCtx.moveTo(ox,oy); bCtx.lineTo(sx,sy);
      bCtx.strokeStyle = c; bCtx.lineWidth = 1; bCtx.stroke();
      bCtx.fillStyle = '#8c8066'; bCtx.font='10px Inter,sans-serif';
      bCtx.fillText(n, sx+3, sy+4);
    });
    // |0⟩ |1⟩
    const [z0x,z0y]=proj(0,0,1.18); bCtx.fillStyle='#64748b'; bCtx.font='11px Inter,sans-serif'; bCtx.fillText('|0⟩',z0x+3,z0y);
    const [z1x,z1y]=proj(0,0,-1.18); bCtx.fillText('|1⟩',z1x+3,z1y);

    // Effective axis (unit vector n̂_eff)
    const OmP = Math.sqrt(Om*Om+De*De) || 1;
    const nx = Om/OmP, nz = -De/OmP;
    const [ax,ay] = proj(nx*1.15, 0, nz*1.15);
    const [ax2,ay2] = proj(-nx*.5, 0, -nz*.5);
    bCtx.beginPath(); bCtx.moveTo(ax2,ay2); bCtx.lineTo(ax,ay);
    bCtx.strokeStyle = 'rgba(146,106,3,0.55)'; bCtx.lineWidth = 1.5;
    bCtx.setLineDash([4,3]); bCtx.stroke(); bCtx.setLineDash([]);
    bCtx.fillStyle='rgba(146,106,3,0.6)'; bCtx.font='9px Inter,sans-serif'; bCtx.fillText('n̂',ax+3,ay);

    // Trail (cone arc)
    if (trail.length > 1) {
      for (let i=1; i<trail.length; i++) {
        const [x0,y0]=proj(...trail[i-1]);
        const [x1,y1]=proj(...trail[i]);
        const alpha = (i/(trail.length-1))*0.6;
        bCtx.beginPath(); bCtx.moveTo(x0,y0); bCtx.lineTo(x1,y1);
        bCtx.strokeStyle=`rgba(122,79,247,${alpha.toFixed(2)})`; bCtx.lineWidth=2; bCtx.stroke();
      }
    }

    // State vector
    const [sx,sy]=proj(bx,by,bz);
    bCtx.beginPath(); bCtx.moveTo(CX,CY); bCtx.lineTo(sx,sy);
    bCtx.strokeStyle='#7a4ff7'; bCtx.lineWidth=2.5; bCtx.stroke();
    bCtx.beginPath(); bCtx.arc(sx,sy,5,0,2*Math.PI);
    bCtx.fillStyle='#7a4ff7'; bCtx.fill();
  }

  function drawTrace(P1) {
    const W = tCvs.width || 400, H = tCvs.height || 120;
    tCtx.fillStyle = '#faf5e9';
    tCtx.fillRect(0, 0, W, H);

    // Axes
    const pad = 20;
    tCtx.strokeStyle = '#1e293b'; tCtx.lineWidth = 1;
    tCtx.beginPath(); tCtx.moveTo(pad, pad); tCtx.lineTo(pad, H-pad); tCtx.lineTo(W-pad, H-pad); tCtx.stroke();
    // 0 and 1 lines
    tCtx.setLineDash([3,4]);
    [0, 0.5, 1].forEach(v => {
      const y = H - pad - v*(H-2*pad);
      tCtx.beginPath(); tCtx.moveTo(pad,y); tCtx.lineTo(W-pad,y);
      tCtx.strokeStyle = v===0.5 ? '#1e3a5f' : '#0f1e35'; tCtx.stroke();
    });
    tCtx.setLineDash([]);
    tCtx.fillStyle='#8c8066'; tCtx.font='9px Inter,sans-serif';
    tCtx.fillText('1', 4, H-pad-1*(H-2*pad)+4);
    tCtx.fillText('0', 6, H-pad+4);

    // P1 trace
    if (P1.length > 1) {
      tCtx.beginPath();
      P1.forEach((p,i) => {
        const x = pad + (i/(TRACE_LEN-1))*(W-2*pad);
        const y = H - pad - p*(H-2*pad);
        i===0 ? tCtx.moveTo(x,y) : tCtx.lineTo(x,y);
      });
      tCtx.strokeStyle='#7a4ff7'; tCtx.lineWidth=2; tCtx.stroke();
    }

    // Dot at current end
    if (P1.length) {
      const p = P1[P1.length-1];
      const x = pad + ((P1.length-1)/(TRACE_LEN-1))*(W-2*pad);
      const y = H - pad - p*(H-2*pad);
      tCtx.beginPath(); tCtx.arc(x,y,3.5,0,2*Math.PI);
      tCtx.fillStyle='#7a4ff7'; tCtx.fill();
    }
  }

  // Pre-compute cone trail (last 1.5 turns)
  const TRAIL_PTS = 60;
  function getConeTrail(phase, Om, De) {
    const OmP = Math.sqrt(Om*Om+De*De) || 1e-6;
    const nx = Om/OmP, nz = -De/OmP;
    // Rotation around n̂=(nx,0,nz) by angle φ, starting from |0⟩=(0,0,1)
    function rotate(phi) {
      // Rodrigues: v_rot = v cos φ + (n×v) sin φ + n(n·v)(1-cos φ)
      const v = [0, 0, 1]; // |0⟩
      const ndotv = nx*v[0] + nz*v[2];
      const ncrossv = [0*v[2]-nz*v[1], nz*v[0]-nx*v[2], nx*v[1]-0*v[0]]; // n×v
      return [
        v[0]*Math.cos(phi) + ncrossv[0]*Math.sin(phi) + nx*ndotv*(1-Math.cos(phi)),
        v[1]*Math.cos(phi) + ncrossv[1]*Math.sin(phi) + 0 *ndotv*(1-Math.cos(phi)),
        v[2]*Math.cos(phi) + ncrossv[2]*Math.sin(phi) + nz*ndotv*(1-Math.cos(phi)),
      ];
    }
    const trail = [];
    for (let i=0; i<=TRAIL_PTS; i++) {
      const phi = phase - (i/TRAIL_PTS)*2*Math.PI;
      trail.push(rotate(phi));
    }
    return trail.reverse();
  }

  // Repaint the current state without advancing it (theme toggle while paused)
  let lastBS = null;
  function redraw() { if (lastBS) { drawBS(...lastBS); drawTrace(traceData); } }
  LQ_INK.onTheme(redraw);
  if (rabiView.onChange) rabiView.onChange(redraw);   // dragging the sphere while paused

  function animate() {
    const OmP = Math.sqrt(Om*Om+De*De) || 1e-6;
    phase += OmP * 0.012; // speed in rad/frame (~60fps)

    // Current Bloch vector
    const nx = Om/OmP, nz = -De/OmP;
    const ndotv = nz; // n·|0⟩ = nz
    const ncrossv = [0, nz*0-nx*1, nx*0-0*0]; // simplified: n×|0⟩ = (0, nz, -nx) wait...
    // Rodrigues rotation of |0⟩=(0,0,1) around n̂=(nx,0,nz)
    const cp = Math.cos(phase), sp = Math.sin(phase);
    const bx = (0)*cp    + (nz)*sp        + nx*nz*(1-cp);
    const by = (0)*cp    + (-nx*1+nz*0)*sp+ 0*(1-cp);   // n×v|y = nz*vx-nx*vz = -nx
    const bz = (1)*cp    + (-nz*0)*sp     + nz*nz*(1-cp) + (1-nz*nz)*0;
    // Cleaner: direct Rodrigues
    const v0=[0,0,1];
    const ndv = nx*v0[0]+0*v0[1]+nz*v0[2]; // n·v
    const ncv=[0*v0[2]-nz*v0[1], nz*v0[0]-nx*v0[2], nx*v0[1]-0*v0[0]];
    const bvx=v0[0]*cp+ncv[0]*sp+nx*ndv*(1-cp);
    const bvy=v0[1]*cp+ncv[1]*sp+0 *ndv*(1-cp);
    const bvz=v0[2]*cp+ncv[2]*sp+nz*ndv*(1-cp);

    // P1 = (1 - bz)/2
    const P1cur = (1 - bvz)/2;
    traceData.push(P1cur);
    if (traceData.length > TRACE_LEN) traceData.shift();

    const trail = getConeTrail(phase, Om, De);
    lastBS = [bvx, bvy, bvz, trail];

    // Resize trace canvas first: setting width clears it, which left the trace blank
    // when only one frame is drawn (reduced motion / paused).
    const rect = tCvs.parentElement.getBoundingClientRect();
    if (rect.width > 10 && Math.abs(tCvs.width - rect.width) > 5) {
      tCvs.width = rect.width;
    }

    drawBS(bvx, bvy, bvz, trail);
    drawTrace(traceData);

    const lbl = document.getElementById('rabiBlochLbl');
    if (lbl) {
      const OmPd = OmP.toFixed(2);
      lbl.textContent = `Ω'=${OmPd} MHz  P₁=${(P1cur*100).toFixed(0)}%`;
    }
  }
  if (window.AMOMotion) AMOMotion.loop([document.getElementById('rabiBlochCanvas'), tCvs], animate, { anchors: [{ el: document.getElementById('rabiBlochLbl'), where: 'afterend' }] }); else requestAnimationFrame(function f(t){ animate(t); requestAnimationFrame(f); });
})();

/* ═══════════════════════════════════════════════
   DECOHERENCE
   ═══════════════════════════════════════════════ */
let decohChart;
(function(){
  const ctx = document.getElementById('decohChart').getContext('2d');
  decohChart = new Chart(ctx,{type:'line',data:{labels:[],datasets:[
    {label:'P₁(t) = ½ e^{−t/T₁} (from |+⟩)',data:[],borderColor:'#f87171',borderWidth:2,pointRadius:0},
    {label:'|ρ₀₁(t)| = ½ e^{−t/T₂}',data:[],borderColor:'#a78bfa',borderWidth:2,pointRadius:0,borderDash:[5,3]},
    {label:'P₁ steady state = 0',data:[],borderColor:'#334155',borderWidth:1,borderDash:[2,4],pointRadius:0}
  ]},options:{responsive:true,plugins:{legend:{labels:{color:'#5c503c',font:{size:11}}}},
    scales:{x:{title:{display:true,text:'Time (ms)',color:'#5c503c'},ticks:{color:'#64748b'},grid:{color:'#1e293b'}},
            y:{min:0,max:1,ticks:{color:'#64748b'},grid:{color:'#1e293b'}}}}});
  updateDecohere();
})();

function updateDecohere() {
  const T1 = parseFloat(document.getElementById('T1slide').value);
  const T2 = parseFloat(document.getElementById('T2slide').value);
  const tmax = Math.max(T1, T2) * 4;
  const ts=[], P1=[], coh=[], zero=[];
  for (let i=0; i<=100; i++) {
    const t = tmax * i/100;
    ts.push(t.toFixed(1));
    P1.push(0.5 * Math.exp(-t/T1));   // starting from |+⟩ (P₁ = ½), decays to |0⟩
    coh.push(0.5 * Math.exp(-t/T2));
    zero.push(0);
  }
  decohChart.data.labels = ts;
  decohChart.data.datasets[0].data = P1;
  decohChart.data.datasets[1].data = coh;
  decohChart.data.datasets[2].data = zero;
  decohChart.update('none');

  const info = document.getElementById('decohInfo');
  if (T2 > 2*T1) {
    info.className='info-banner'; info.textContent=`⚠ T₂ > 2T₁ is non-physical (T₂ ≤ 2T₁ always). Adjust sliders.`;
  } else {
    info.className='good-banner'; info.textContent=`T₁ = ${T1} ms, T₂ = ${T2} ms, T₂/T₁ = ${(T2/T1).toFixed(2)} (max = 2.0, pure dephasing = 1.0). Gate time must satisfy t_gate ≪ T₂.`;
  }
}


/* ═══════════════════════════════════════════════
   QEC THRESHOLD CHART
   ═══════════════════════════════════════════════ */
(function(){
  const ctx = document.getElementById('qecChart');
  if (!ctx) return;
  const pth = 0.01; // surface code threshold ~1%
  const nPts = 80;
  const pPhys = Array.from({length: nPts}, (_, i) => i * 0.015 / (nPts - 1)); // 0..1.5%

  function logicalRate(d, p) {
    const k = Math.ceil((d + 1) / 2);
    const ratio = p / pth;
    return Math.min(1, Math.pow(ratio, k));
  }

  const palette = { 3:'#60a5fa', 5:'#a78bfa', 7:'#34d399', 9:'#fbbf24', 11:'#f87171' };
  const datasets = [3, 5, 7, 9, 11].map(d => ({
    label: `d=${d} (${2*d*d-1} qubits)`,
    data: pPhys.map(p => ({ x: +(p * 100).toFixed(4), y: logicalRate(d, p) })),
    borderColor: palette[d],
    borderWidth: 1.8,
    pointRadius: 0,
    fill: false,
    tension: 0,
  }));
  // Threshold vertical dashed line
  datasets.push({
    label: 'Threshold 1%',
    data: [{ x: 1, y: 1e-10 }, { x: 1, y: 1 }],
    borderColor: '#ef4444',
    borderWidth: 1.5,
    borderDash: [5, 4],
    pointRadius: 0,
    fill: false,
  });

  new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: { datasets },
    options: {
      parsing: false,
      responsive: true,
      plugins: { legend: { labels: { color: '#5c503c', font: { size: 10 }, boxWidth: 14 } } },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Physical error rate p (%)', color: '#5c503c' },
          ticks: { color: '#64748b', callback: v => v.toFixed(2) + '%' },
          grid: { color: '#1e293b' },
          min: 0, max: 1.5,
        },
        y: {
          type: 'logarithmic',
          title: { display: true, text: 'Logical error rate p_L', color: '#5c503c' },
          ticks: { color: '#64748b' },
          grid: { color: '#1e293b' },
          min: 1e-10, max: 1,
        },
      },
    },
  });
})();

/* ═══════════════════════════════════════════════
   OPTICAL PUMPING SIMULATION
   Phenomenological 3-sublevel model for F=1 + σ⁺
   Transition matrix per photon scattered:
     From m=-1: → {-1: 0.12, 0: 0.38, +1: 0.50}
     From m= 0: → {-1: 0.00, 0: 0.25, +1: 0.75}
     From m=+1: → {-1: 0.00, 0: 0.00, +1: 1.00}  (stretch/dark state)
   ═══════════════════════════════════════════════ */
const OP_MAT = [
  [0.12, 0.38, 0.50],   // from m=-1
  [0.00, 0.25, 0.75],   // from m= 0
  [0.00, 0.00, 1.00],   // from m=+1
];

let opPop   = [1/3, 1/3, 1/3];   // populations [m=-1, m=0, m=+1]
let opTotal = 0;                   // total photons scattered

function opUpdateDisplay() {
  const ids  = ['m1','0','p1'];
  const cols = ['#f87171','#fbbf24','#4ade80'];
  opPop.forEach((p, i) => {
    document.getElementById('pop-' + ids[i]).textContent = (p * 100).toFixed(1) + '%';
    document.getElementById('bar-' + ids[i]).style.width = (p * 100) + '%';
  });
  document.getElementById('opCount').textContent = opTotal;

  const pEl = document.getElementById('pop-p1');
  const stat = document.getElementById('opStatus');
  const p1 = opPop[2];
  if (p1 > 0.98) {
    stat.className = 'good-banner';
    stat.innerHTML = '✅ Pumping complete, &gt;98% population in m<sub>F</sub> = +1 (stretch state). Qubit initialized.';
  } else if (p1 > 0.80) {
    stat.className = 'info-banner';
    stat.innerHTML = `${(p1*100).toFixed(1)}% in m<sub>F</sub> = +1. Almost done, scatter a few more photons.`;
  } else {
    stat.className = 'info-banner';
    stat.innerHTML = `Pumping in progress, ${(p1*100).toFixed(1)}% in m<sub>F</sub> = +1. Keep scattering.`;
  }
}

function opScatter(n) {
  for (let i = 0; i < n; i++) {
    const next = [0, 0, 0];
    opPop.forEach((p, from) => {
      OP_MAT[from].forEach((prob, to) => { next[to] += p * prob; });
    });
    opPop = next;
    opTotal++;
  }
  opUpdateDisplay();
}

function opReset() {
  opPop   = [1/3, 1/3, 1/3];
  opTotal = 0;
  document.getElementById('opStatus').className = 'info-banner';
  document.getElementById('opStatus').innerHTML =
    'Click "+1 photon" to begin pumping the population toward m<sub>F</sub> = +1.';
  opUpdateDisplay();
}

/* ═══════════════════════════════════════════════
   TWO-QUBIT: Bell state generation animation
   Steps: |00⟩ → H⊗I → |+0⟩ → CNOT → |Φ⁺⟩
   ═══════════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('tqBellCanvas');
  if (!cv) return;
  const cx = LQ_INK.wrap(cv.getContext('2d'));
  const W = 480, H = 140;
  const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];
  const colors  = ['#60a5fa','#a78bfa','#34d399','#fbbf24'];

  // Amplitude magnitudes at each step (real, non-negative display)
  const steps = [
    { title: 'Initial: |00⟩', amps: [1, 0, 0, 0] },
    { title: 'After H⊗I → (|00⟩+|10⟩)/√2', amps: [0.707, 0, 0.707, 0] },
    { title: 'After CNOT → |Φ⁺⟩ = (|00⟩+|11⟩)/√2', amps: [0.707, 0, 0, 0.707] },
  ];

  let step = 0, animT = 0, lastTs = 0, pauseT = null;
  const ANIM_MS = 800, PAUSE_MS = 2200;

  function frame(ts){
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs; lastTs = ts;

    if (pauseT !== null) {
      pauseT += dt;
      if (pauseT > PAUSE_MS) {
        step = (step + 1) % steps.length;
        animT = 0; pauseT = null;
      }
    } else {
      animT += dt;
      if (animT >= ANIM_MS) { animT = ANIM_MS; pauseT = 0; }
    }

    const t = Math.min(animT / ANIM_MS, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const prev = steps[(step + steps.length - 1) % steps.length].amps;
    const curr = steps[step].amps;
    const amps = curr.map((a, i) => prev[i] + (a - prev[i]) * ease);

    cx.clearRect(0, 0, W, H);

    // Title
    cx.fillStyle = '#5c503c';
    cx.font = '11px Inter,sans-serif';
    cx.textAlign = 'center';
    cx.fillText(steps[step].title, W/2, 16);

    // Bars
    const barW = 64, gap = 20;
    const totalW = labels.length * barW + (labels.length-1) * gap;
    const startX = (W - totalW) / 2;
    const maxH = 82, baseY = 118;

    amps.forEach((a, i) => {
      const x = startX + i * (barW + gap);
      const bh = a * maxH;

      // Shadow glow
      cx.save();
      cx.shadowColor = colors[i];
      cx.shadowBlur = a > 0.05 ? 12 : 0;
      cx.fillStyle = colors[i];
      cx.globalAlpha = 0.15 + a * 0.65;
      cx.beginPath();
      cx.roundRect(x, baseY - bh, barW, bh, [4,4,0,0]);
      cx.fill();
      cx.globalAlpha = 1;
      cx.strokeStyle = colors[i];
      cx.lineWidth = 1.4;
      cx.stroke();
      cx.restore();

      // Amplitude label on bar
      if (a > 0.05) {
        cx.fillStyle = colors[i];
        cx.font = '10px JetBrains Mono,monospace';
        cx.textAlign = 'center';
        cx.fillText((a).toFixed(2), x + barW/2, baseY - bh - 5);
      }

      // Basis state label
      cx.fillStyle = '#64748b';
      cx.font = '11px Inter,sans-serif';
      cx.textAlign = 'center';
      cx.fillText(labels[i], x + barW/2, baseY + 16);
    });

    // Baseline
    cx.strokeStyle = '#1e293b';
    cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(startX-4, baseY); cx.lineTo(startX+totalW+4, baseY); cx.stroke();

    // Step indicator dots
    steps.forEach((_, i) => {
      cx.beginPath();
      cx.arc(W/2 - (steps.length-1)*8 + i*16, H-6, 3, 0, 2*Math.PI);
      cx.fillStyle = i === step ? '#60a5fa' : '#1e3a5f';
      cx.fill();
    });

  }
  const tick = LQ_INK.track(frame);
  if (window.AMOMotion) AMOMotion.loop(document.getElementById('tqBellCanvas'), tick); else requestAnimationFrame(function f(t){ tick(t); requestAnimationFrame(f); });
})();

/* ═══════════════════════════════════════════════
   ALGORITHMS: Grover amplitude amplification
   N=8 states, target = state index 2 (★)
   ═══════════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('groverCanvas');
  if (!cv) return;
  const cx = LQ_INK.wrap(cv.getContext('2d'));
  const W = 500, H = 150;
  const N = 8, TARGET = 2;
  const k_opt = Math.round(Math.PI/4 * Math.sqrt(N)); // ≈2 iterations

  // Grover iteration: oracle + diffusion
  function groverStep(amps) {
    // Oracle: flip target
    const a = [...amps];
    a[TARGET] = -a[TARGET];
    // Diffusion: 2|s><s| - I
    const mean = a.reduce((s,v)=>s+v,0)/N;
    return a.map(v => 2*mean - v);
  }

  // Pre-compute snapshots
  const snapshots = [];
  let a = new Array(N).fill(1/Math.sqrt(N));
  snapshots.push({ title: 'Initial: equal superposition', amps: [...a] });
  for (let i = 0; i < k_opt; i++) {
    // Oracle step
    const ao = [...a]; ao[TARGET] = -ao[TARGET];
    snapshots.push({ title: `Step ${i+1}a: oracle flips target phase`, amps: [...ao] });
    // Diffusion step
    a = groverStep(a);
    snapshots.push({ title: `Step ${i+1}b: diffusion amplifies target`, amps: [...a] });
  }

  let step = 0, animT = 0, lastTs = 0, pauseT = null;
  const ANIM_MS = 700, PAUSE_MS = 1800;

  function frame(ts){
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs; lastTs = ts;

    if (pauseT !== null) {
      pauseT += dt;
      if (pauseT > PAUSE_MS) { step = (step+1) % snapshots.length; animT=0; pauseT=null; }
    } else {
      animT += dt;
      if (animT >= ANIM_MS) { animT=ANIM_MS; pauseT=0; }
    }

    const t = Math.min(animT/ANIM_MS, 1);
    const ease = t<0.5?2*t*t:-1+(4-2*t)*t;
    const prev = snapshots[(step+snapshots.length-1)%snapshots.length].amps;
    const curr = snapshots[step].amps;
    const amps = curr.map((v,i) => prev[i] + (v-prev[i])*ease);

    cx.clearRect(0,0,W,H);

    // Title
    cx.fillStyle = '#5c503c';
    cx.font = '10.5px Inter,sans-serif';
    cx.textAlign = 'center';
    cx.fillText(snapshots[step].title, W/2, 14);

    const barW = 44, gap = 12;
    const totalW = N*barW + (N-1)*gap;
    const startX = (W-totalW)/2;
    const maxH = 90, zeroY = 118;

    amps.forEach((a, i) => {
      const x = startX + i*(barW+gap);
      const isTarget = i === TARGET;
      const col = isTarget ? '#f87171' : '#60a5fa';
      const bh = a * maxH; // can be negative
      const rectY = bh >= 0 ? zeroY - bh : zeroY;
      const rectH = Math.abs(bh);

      if (rectH > 0.5) {
        cx.save();
        cx.shadowColor = col;
        cx.shadowBlur = isTarget ? 14 : 5;
        cx.fillStyle = col;
        cx.globalAlpha = isTarget ? 0.9 : 0.55;
        cx.beginPath(); cx.roundRect(x, rectY, barW, Math.max(rectH,1), 3); cx.fill();
        cx.globalAlpha = 1;
        cx.strokeStyle = col; cx.lineWidth = 1.2; cx.stroke();
        cx.restore();

        // Value label
        cx.fillStyle = col;
        cx.font = '9px JetBrains Mono,monospace';
        cx.textAlign = 'center';
        const lblY = bh >= 0 ? zeroY - bh - 4 : zeroY + Math.abs(bh) + 12;
        cx.fillText(a.toFixed(2), x+barW/2, lblY);
      }

      // Star for target
      cx.fillStyle = isTarget ? '#fbbf24' : '#334155';
      cx.font = isTarget ? 'bold 11px Inter' : '11px Inter';
      cx.textAlign = 'center';
      cx.fillText(isTarget ? '★' : (i+1).toString(), x+barW/2, zeroY+16);
    });

    // Zero line
    cx.strokeStyle = '#1e3a5f'; cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(startX-4,zeroY); cx.lineTo(startX+totalW+4,zeroY); cx.stroke();

    // Step dots
    snapshots.forEach((_,i) => {
      cx.beginPath(); cx.arc(W/2-(snapshots.length-1)*6+i*12, H-5, 2.5, 0, 2*Math.PI);
      cx.fillStyle = i===step?'#f87171':'#1e3a5f'; cx.fill();
    });

  }
  const tick = LQ_INK.track(frame);
  if (window.AMOMotion) AMOMotion.loop(document.getElementById('groverCanvas'), tick); else requestAnimationFrame(function f(t){ tick(t); requestAnimationFrame(f); });
})();

/* ═══════════════════════════════════════════════
   ANALOG-SIM: Rydberg array Z₂ phase animation
   5×4 array; tune Δ/Ω from disordered → Z₂ ordered
   ═══════════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('rydbergArrayCanvas');
  if (!cv) return;
  const cx = LQ_INK.wrap(cv.getContext('2d'));
  const W = 520, H = 155;
  const COLS = 8, ROWS = 4;
  // 4 rows × 48 px didn't fit the 155 px canvas (top row under the title, bottom row cut off,
  // last column under the legend); 34 px keeps the whole 8×4 array clear of both.
  const R_ATOM = 9, SPACING = 34;
  const startX = (W - (COLS-1)*SPACING) / 2;
  const startY = (H - (ROWS-1)*SPACING) / 2 + 5;

  // Z₂ checkerboard: excited if (col+row) % 2 === 0
  const z2 = (c,r) => (c+r)%2===0;

  let phase = 0; // 0→1 disordered, 1→2 hold, 2→3 back
  let phaseFrac = 0;
  let lastTs = 0;
  const PHASE_MS = 2800;

  function frame(ts){
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs; lastTs = ts;
    phaseFrac += dt / PHASE_MS;
    if (phaseFrac >= 1) { phaseFrac = 0; phase = (phase+1) % 3; }

    // Disorder fraction 0=ordered, 1=disordered
    let disorder;
    if (phase === 0) disorder = 1 - phaseFrac;         // ordering
    else if (phase === 1) disorder = 0;                  // hold ordered
    else disorder = phaseFrac;                           // disordering

    cx.clearRect(0,0,W,H);

    // Title
    const titles = ['Rydberg ordering (Δ/Ω → large)', 'Z₂ ordered phase', 'Disordered phase (small Δ/Ω)'];
    cx.fillStyle = '#5c503c'; cx.font = '11px Inter,sans-serif'; cx.textAlign = 'center';
    cx.fillText(titles[phase], W/2, 13);

    for (let r=0; r<ROWS; r++) {
      for (let c=0; c<COLS; c++) {
        const x = startX + c*SPACING;
        const y = startY + r*SPACING;
        const orderedExcited = z2(c,r);
        // Excitation probability with noise
        const noise = (Math.sin(ts*0.0023 + c*1.7 + r*2.3)*0.5+0.5) * disorder;
        const pExcited = orderedExcited ? Math.max(0, 1-disorder*0.5+noise*0.3) : Math.min(1, disorder*0.8*noise);

        // Blockade halo for excited atoms
        if (pExcited > 0.4) {
          cx.save();
          cx.globalAlpha = (pExcited-0.4)*0.15;
          cx.fillStyle = '#f97316';
          cx.beginPath();
          cx.arc(x, y, SPACING*0.82, 0, 2*Math.PI);
          cx.fill();
          cx.restore();
        }

        // Atom body
        const excited = pExcited > 0.5;
        const col = excited ? '#f97316' : '#1e3a5f';
        const glowCol = excited ? '#f97316' : '#38bdf8';
        cx.save();
        cx.shadowColor = glowCol;
        cx.shadowBlur = excited ? 14 : 4;
        const grad = cx.createRadialGradient(x-2,y-2,1,x,y,R_ATOM);
        grad.addColorStop(0, excited ? '#fde68a' : '#60a5fa');
        grad.addColorStop(1, excited ? '#f97316' : '#1d4ed8');
        cx.fillStyle = grad;
        cx.beginPath(); cx.arc(x, y, R_ATOM, 0, 2*Math.PI); cx.fill();
        cx.strokeStyle = excited ? '#fbbf24' : '#3b82f6';
        cx.lineWidth = 1.2; cx.stroke();
        cx.restore();
      }
    }

    // Legend
    cx.font = '10px Inter,sans-serif'; cx.textAlign = 'left';
    cx.fillStyle = '#f97316'; cx.fillText('● excited |r⟩', W-105, H-8);
    cx.fillStyle = '#076ce7'; cx.fillText('● ground |g⟩', W-105, H-20);

  }
  const tick = LQ_INK.track(frame);
  if (window.AMOMotion) AMOMotion.loop(document.getElementById('rydbergArrayCanvas'), tick); else requestAnimationFrame(function f(t){ tick(t); requestAnimationFrame(f); });
})();
