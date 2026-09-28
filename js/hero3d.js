/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — home hero: a live, dual-species optical tweezer array.

   Raw WebGL 1 (no Three.js, no build step, ~0 extra download) so the
   home page stays inside the site's CDN-light, render-blocking-averse
   performance budget. Only home.html loads this file.

   What it shows (one ~12 s cycle, looped):
     01  Li + Cs load stochastically (~58 % per site) from a dual-species
         MOT into an array of focused tweezers (Gaussian-beam hourglasses,
         w(y) = w0·√(1 + (y/zR)²), waist at the atom plane).
     02  A fluorescence image flashes every loaded atom.
     03  Mobile tweezers rearrange each species into a defect-free block,
         routing through the gaps between static traps; extra atoms are
         released and fall away.
     04  Each Li is carried onto its Cs neighbour — one Li–Cs pair per
         tweezer, the starting point for LiCs molecule assembly.

   Theme-aware: dark = additive glow; light = ink-on-graph-paper outlines.
   prefers-reduced-motion → one static frame of the assembled array.
   No WebGL / context loss → removes html.hero3d-on so the original
   Li / Cs cards show instead.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var root = document.documentElement;
  var stage = document.querySelector('.hero-3d');
  var canvas = document.getElementById('hero-canvas-3d');
  if (!stage || !canvas) return;

  function fallback(reason) {
    root.classList.remove('hero3d-on');
    if (window.console && console.info) console.info('[hero3d] using static fallback: ' + reason);
  }

  var gl = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: true, antialias: true,
      depth: false, stencil: false, powerPreference: 'low-power'
    });
  } catch (e) { gl = null; }
  if (!gl) { fallback('WebGL unavailable'); return; }

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Array geometry ─────────────────────────────────────────────── */
  var NC = 10, NR = 7, PITCH = 1.0;
  var TC0 = 2, TC1 = 7, TR0 = 1, TR1 = 5;       // target block: 6 × 5 sites = 3 Li–Cs pairs per row
  var LOAD_P = 0.58;
  var SITES = NC * NR;
  function sx(c) { return (c - (NC - 1) / 2) * PITCH; }
  function sz(r) { return (r - (NR - 1) / 2) * PITCH; }
  function speciesOf(c) { return c % 2; }        // 0 = Li (even columns), 1 = Cs (odd columns)
  function inTarget(c, r) { return c >= TC0 && c <= TC1 && r >= TR0 && r <= TR1; }

  // Gaussian beam envelope (exaggerated for visibility)
  var W0 = 0.075, ZR = 0.85, HALF = 2.9, RINGS = 29, SEGS = 14;

  /* ── Tiny seeded RNG so a cycle is reproducible (static frame) ─── */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ── mat4 helpers (column-major) ──────────────────────────────── */
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function lookAt(e, t, u) {
    var zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2];
    var l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    var xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
    l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1
    ]);
  }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }

  /* ── Shaders ─────────────────────────────────────────────────── */
  var BEAM_VS = [
    'attribute vec3 aPos; attribute vec3 aNrm; attribute vec2 aAux; attribute float aSp;',
    'uniform mat4 uVP; uniform vec2 uOff; uniform vec3 uEye; uniform vec3 uShift;',
    'uniform vec3 uTintA; uniform vec3 uTintB;',
    'varying vec3 vN; varying vec3 vV; varying vec2 vAux; varying vec3 vCol;',
    'void main(){',
    '  vec3 p = aPos + uShift;',
    '  vec4 cp = uVP * vec4(p, 1.0); cp.xy += uOff * cp.w; gl_Position = cp;',
    '  vN = aNrm; vV = uEye - p; vAux = aAux; vCol = mix(uTintA, uTintB, aSp);',
    '}'
  ].join('\n');
  var BEAM_FS = [
    'precision mediump float;',
    'varying vec3 vN; varying vec3 vV; varying vec2 vAux; varying vec3 vCol;',
    'uniform float uAlpha; uniform float uMode;',
    'void main(){',
    '  float f = abs(dot(normalize(vN), normalize(vV)));',
    '  float ends = 1.0 - smoothstep(0.45, 1.0, abs(vAux.x));',
    '  float focus = vAux.y * vAux.y;',                        // (w0/w)^2 — on-axis intensity
    '  float shape = uMode < 0.5 ? pow(f, 1.8) * mix(0.3, 1.0, focus)',
    '                            : pow(1.0 - f, 3.2) * mix(0.45, 1.0, focus);',
    '  float a = shape * ends * uAlpha;',
    '  gl_FragColor = vec4(vCol * a, a);',
    '}'
  ].join('\n');
  var PT_VS = [
    'attribute vec3 aPos; attribute float aSize; attribute vec4 aCol; attribute float aCore;',
    'uniform mat4 uVP; uniform vec2 uOff; uniform float uScale; uniform float uMaxPt;',
    'varying vec4 vCol; varying float vCore;',
    'void main(){',
    '  vec4 p = uVP * vec4(aPos, 1.0); p.xy += uOff * p.w; gl_Position = p;',
    '  gl_PointSize = clamp(aSize * uScale / p.w, 1.0, uMaxPt);',
    '  vCol = aCol; vCore = aCore;',
    '}'
  ].join('\n');
  var PT_FS = [
    'precision mediump float;',
    'varying vec4 vCol; varying float vCore; uniform float uMode;',
    'void main(){',
    '  vec2 d = gl_PointCoord - 0.5; float r2 = dot(d, d) * 4.0;',
    '  if (r2 > 1.0) discard;',
    '  float a; vec3 c;',
    '  if (uMode < 0.5) {',
    '    float halo = exp(-r2 * 5.0) - exp(-5.0);',
    '    float core = exp(-r2 * 48.0);',
    '    a = vCol.a * (halo * 0.6 + core * (0.9 + vCore));',
    '    c = mix(vCol.rgb, vec3(1.0), clamp(core * (0.35 + vCore), 0.0, 1.0));',
    '  } else {',
    '    float disc = 1.0 - smoothstep(0.14, 0.26, r2);',
    '    float halo = (exp(-r2 * 4.0) - exp(-4.0)) * (0.16 + vCore * 0.5);',
    '    a = vCol.a * max(disc, halo);',
    '    c = vCol.rgb;',
    '  }',
    '  gl_FragColor = vec4(c * a, a);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs, attribs, uniforms) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var o = { p: p, a: {}, u: {} };
    attribs.forEach(function (n) { o.a[n] = gl.getAttribLocation(p, n); });
    uniforms.forEach(function (n) { o.u[n] = gl.getUniformLocation(p, n); });
    return o;
  }

  var beamProg, ptProg;
  try {
    beamProg = program(BEAM_VS, BEAM_FS, ['aPos', 'aNrm', 'aAux', 'aSp'],
      ['uVP', 'uOff', 'uEye', 'uShift', 'uTintA', 'uTintB', 'uAlpha', 'uMode']);
    ptProg = program(PT_VS, PT_FS, ['aPos', 'aSize', 'aCol', 'aCore'],
      ['uVP', 'uOff', 'uScale', 'uMaxPt', 'uMode']);
  } catch (err) { fallback('shader error: ' + err.message); return; }

  /* ── Beam geometry: surface of revolution of the Gaussian envelope ── */
  function buildBeams(sites) {
    var verts = [], idx = [];
    sites.forEach(function (s) {
      var base = verts.length / 9;
      for (var k = 0; k < RINGS; k++) {
        var u = -1 + 2 * k / (RINGS - 1);
        var y = HALF * (u < 0 ? -1 : 1) * Math.pow(Math.abs(u), 1.6);   // denser rings near the focus
        var q = Math.sqrt(1 + (y / ZR) * (y / ZR));
        var w = W0 * q, dw = W0 * (y / (ZR * ZR)) / q;
        for (var j = 0; j <= SEGS; j++) {
          var th = 2 * Math.PI * j / SEGS, ct = Math.cos(th), st = Math.sin(th);
          verts.push(s.x + w * ct, y, s.z + w * st, ct, -dw, st, y / HALF, W0 / w, s.sp);
        }
      }
      for (var k2 = 0; k2 < RINGS - 1; k2++) for (var j2 = 0; j2 < SEGS; j2++) {
        var a = base + k2 * (SEGS + 1) + j2, b = a + SEGS + 1;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    });
    var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    return { vb: vb, ib: ib, count: idx.length };
  }

  var siteList = [];
  for (var c0 = 0; c0 < NC; c0++) for (var r0 = 0; r0 < NR; r0++) siteList.push({ x: sx(c0), z: sz(r0), sp: speciesOf(c0) });
  var staticBeams = buildBeams(siteList);                 // 70 tweezers ≈ 28k vertices (fits Uint16)
  var mobileBeam = buildBeams([{ x: 0, z: 0, sp: 0 }]);   // drawn once per moving atom with uShift

  var MAX_PTS = 1400, PT_STRIDE = 9;
  var ptData = new Float32Array(MAX_PTS * PT_STRIDE);
  var ptBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
  gl.bufferData(gl.ARRAY_BUFFER, ptData.byteLength, gl.DYNAMIC_DRAW);
  var maxPt = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [1, 64])[1];

  /* ── Palettes ─────────────────────────────────────────────────── */
  var PAL = {
    dark: {
      mode: 0, li: [0.30, 0.78, 1.00], cs: [1.00, 0.58, 0.25], mol: [0.80, 0.58, 1.00],
      beamLi: [0.45, 0.78, 1.00], beamCs: [1.00, 0.72, 0.48], beamA: 0.085, mobileA: 0.26,
      atomSize: 0.62, cloudSize: 0.10, cloudA: 0.20, molHaloA: 0.55
    },
    light: {
      mode: 1, li: [0.01, 0.40, 0.64], cs: [0.74, 0.24, 0.05], mol: [0.42, 0.17, 0.80],
      beamLi: [0.10, 0.30, 0.48], beamCs: [0.52, 0.20, 0.08], beamA: 0.75, mobileA: 0.9,
      atomSize: 0.40, cloudSize: 0.07, cloudA: 0.30, molHaloA: 0.40
    }
  };
  function pal() { return root.getAttribute('data-theme') === 'dark' ? PAL.dark : PAL.light; }

  /* ── MOT clouds (static random positions, gently drifting) ────── */
  var cloud = [];
  (function () {
    var R = rng(7);
    function gauss() { return Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(2 * Math.PI * R()); }
    for (var i = 0; i < 840; i++) {
      var sp = i % 2, s = sp === 0 ? [2.9, 0.75, 2.2] : [2.3, 0.6, 1.7];   // Li cloud is lighter / hotter → larger
      cloud.push({ sp: sp, x: gauss() * s[0], y: gauss() * s[1], z: gauss() * s[2], ph: R() * 6.283, w: 0.3 + R() * 0.6 });
    }
  })();

  /* ── One experimental cycle ───────────────────────────────────── */
  var cyc = null, cycleSeed = 1 + Math.floor(Math.random() * 1e6);

  function lanePath(x0, z0, xt, zt) {
    // Route through the gaps between static tweezers: step half a pitch
    // into the row-lane, travel in x, drop into the column-lane, travel in
    // z, then step into the target site.
    var sgz = zt > z0 ? 1 : -1, sgx = xt > x0 ? 1 : (xt < x0 ? -1 : 0);
    var zl = z0 + 0.5 * PITCH * sgz, xl = sgx === 0 ? xt + 0.5 * PITCH : xt - 0.5 * PITCH * sgx;
    var raw = [[x0, z0], [x0, zl], [xl, zl], [xl, zt], [xt, zt]], pts = [raw[0]];
    for (var i = 1; i < raw.length; i++) {
      var p = pts[pts.length - 1];
      if (Math.abs(raw[i][0] - p[0]) + Math.abs(raw[i][1] - p[1]) > 1e-6) pts.push(raw[i]);
    }
    var lens = [0];
    for (var k = 1; k < pts.length; k++) lens.push(lens[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    return { pts: pts, lens: lens, total: lens[lens.length - 1] };
  }
  function pathAt(path, u) {
    var d = u * path.total, k = 1;
    while (k < path.lens.length - 1 && path.lens[k] < d) k++;
    var seg = path.lens[k] - path.lens[k - 1] || 1, f = (d - path.lens[k - 1]) / seg;
    var a = path.pts[k - 1], b = path.pts[k];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  }
  function ease(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ramp(t, a, b) { return clamp01((t - a) / (b - a)); }

  function makeCycle(seed) {
    var R = rng(seed), atoms = [], byKey = {};
    for (var c = 0; c < NC; c++) for (var r = 0; r < NR; r++) {
      if (R() < LOAD_P) {
        var at = { sp: speciesOf(c), c: c, r: r, hx: sx(c), hz: sz(r), loadT: 0.55 + R() * 1.5,
          ph: R() * 6.283, move: null, removeT: null, merge: null };
        atoms.push(at); byKey[c + ',' + r] = at;
      }
    }
    var T = { img1: 3.0, rearr: 3.7 };
    var moves = [];
    [0, 1].forEach(function (sp) {
      var empties = [], reservoir = [];
      for (var c = TC0; c <= TC1; c++) for (var r = TR0; r <= TR1; r++) {
        if (speciesOf(c) === sp && !byKey[c + ',' + r]) empties.push({ c: c, r: r });
      }
      atoms.forEach(function (a) { if (a.sp === sp && !inTarget(a.c, a.r)) reservoir.push(a); });
      // Greedy global nearest-pair assignment
      while (empties.length && reservoir.length) {
        var best = null;
        empties.forEach(function (e, ei) {
          reservoir.forEach(function (a, ai) {
            var d = Math.abs(a.c - e.c) + Math.abs(a.r - e.r);
            if (!best || d < best.d) best = { d: d, ei: ei, ai: ai };
          });
        });
        var e = empties.splice(best.ei, 1)[0], a = reservoir.splice(best.ai, 1)[0];
        a.move = { path: lanePath(a.hx, a.hz, sx(e.c), sz(e.r)), to: e };
        moves.push(a);
      }
      reservoir.forEach(function (a) { a.removeT = 0; });  // excess — released later
    });
    moves.sort(function (a, b) { return a.move.path.total - b.move.path.total; });
    var end = T.rearr;
    moves.forEach(function (a, i) {
      a.move.t0 = T.rearr + i * 0.14;
      a.move.dur = 0.45 + 0.17 * a.move.path.total;
      end = Math.max(end, a.move.t0 + a.move.dur);
    });
    T.rearrEnd = end;
    T.remove = end + 0.15;
    atoms.forEach(function (a) { if (a.removeT === 0) a.removeT = T.remove; });
    T.img2 = T.remove + 0.6;
    T.merge = T.img2 + 0.8;
    T.mergeDur = 1.0;
    T.mol = T.merge + T.mergeDur;
    T.fade = T.mol + 2.8;
    T.end = T.fade + 1.1;

    // Final occupancy → Li–Cs pairs to merge (Li at even c onto Cs at c+1)
    var finalAt = {};
    atoms.forEach(function (a) {
      if (a.removeT) return;
      var c = a.move ? a.move.to.c : a.c, r = a.move ? a.move.to.r : a.r;
      finalAt[c + ',' + r] = a;
    });
    var pairs = 0;
    for (var rr = TR0; rr <= TR1; rr++) for (var cc = TC0; cc < TC1; cc += 2) {
      var li = finalAt[cc + ',' + rr], cs = finalAt[(cc + 1) + ',' + rr];
      if (li && cs) { li.merge = { x: sx(cc + 1), z: sz(rr), partner: cs }; cs.merge = { host: true }; pairs++; }
    }
    return { atoms: atoms, T: T, loaded: atoms.length, moves: moves.length, pairs: pairs,
      deficit: (TC1 - TC0 + 1) * (TR1 - TR0 + 1) - Object.keys(finalAt).filter(function (k) {
        var p = k.split(','); return inTarget(+p[0], +p[1]);
      }).length };
  }

  /* ── Per-frame atom state ─────────────────────────────────────── */
  function atomState(a, t, T) {
    var x = a.hx, z = a.hz, y = 0, alpha = 0, core = 0, moving = false;
    if (t >= a.loadT) {
      alpha = ramp(t, a.loadT, a.loadT + 0.25);
      core = Math.max(0, 1 - (t - a.loadT) / 0.45) * 0.8;          // tiny flash on capture
    }
    if (a.move) {
      var m = a.move, u = clamp01((t - m.t0) / m.dur);
      if (u > 0) {
        var p = pathAt(m.path, ease(u)); x = p[0]; z = p[1];
        moving = u < 1;
      }
    }
    if (a.merge && !a.merge.host && t >= T.merge) {
      var um = ease(clamp01((t - T.merge) / T.mergeDur));
      var from = a.move ? [sx(a.move.to.c), sz(a.move.to.r)] : [a.hx, a.hz];
      x = from[0] + (a.merge.x - from[0]) * um; z = from[1] + (a.merge.z - from[1]) * um;
      moving = um < 1;
    }
    // thermal jitter in the trap (suppressed while being transported)
    var j = moving ? 0.004 : 0.016;
    x += j * Math.sin(t * 7.3 + a.ph); z += j * Math.cos(t * 6.1 + a.ph * 1.7);
    // released atoms fall under gravity (−y) as they fade
    if (a.removeT && t >= a.removeT) {
      var dt = t - a.removeT; y -= 0.9 * dt * dt; alpha *= 1 - ramp(t, a.removeT, a.removeT + 0.55);
    }
    if (t >= T.fade) { var df = t - T.fade; y -= 0.7 * df * df; alpha *= 1 - ramp(t, T.fade, T.fade + 0.9); }
    // imaging flashes
    var f1 = Math.max(0, 1 - Math.abs(t - T.img1 - 0.2) / 0.3), f2 = Math.max(0, 1 - Math.abs(t - T.img2 - 0.2) / 0.3);
    core += 0.9 * (f1 + f2);
    return { x: x, y: y, z: z, alpha: alpha, core: core, moving: moving, flash: f1 + f2 };
  }

  /* ── Camera / layout ──────────────────────────────────────────── */
  var FOV = 30 * Math.PI / 180;
  var cam = { az: 0, el: 0, mx: 0, my: 0, tmx: 0, tmy: 0 };
  var view = { w: 1, h: 1, dpr: 1, offX: 0, offY: 0, dist: 17 };
  var quality = 1;

  function resize() {
    var cr = canvas.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    if (cr.width < 2 || cr.height < 2) return false;
    view.dpr = Math.max(0.5, Math.min(window.devicePixelRatio || 1, (window.innerWidth || 1024) < 700 ? 1.5 : 2) * quality);
    var W = Math.round(cr.width * view.dpr), H = Math.round(cr.height * view.dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    view.w = W; view.h = H;
    // Put the array's centre on the stage's centre even though the canvas overflows
    // asymmetrically — but never let the array run off the viewport edge: first
    // nudge it left into the column gap, then shrink it if it still doesn't fit.
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var visRight = Math.min(cr.right, vw) - 8, visLeft = Math.max(cr.left, 0) + 8;
    var stageCxAbs = sr.left + sr.width / 2;
    var halfW = Math.min(sr.width * 2.0, cr.width * 0.92) / 2;
    var cxAbs = stageCxAbs;
    if (cxAbs + halfW > visRight) cxAbs = Math.max(stageCxAbs - 90, visRight - halfW);
    halfW = Math.max(60, Math.min(halfW, visRight - cxAbs, cxAbs - visLeft));
    var stageCx = cxAbs - cr.left, stageCy = sr.top + sr.height * 0.43 - cr.top;
    view.offX = (stageCx - cr.width / 2) / (cr.width / 2);
    view.offY = -(stageCy - cr.height / 2) / (cr.height / 2);
    // Fit the *rotated* footprint of the grid (it's seen at ~30° azimuth), and keep
    // the beams inside the stage height.
    var AZ0 = 0.52;
    var extent = (NC * PITCH + 0.6) * Math.cos(AZ0) + (NR * PITCH + 0.6) * Math.sin(AZ0);
    var pxPerUnitAtD1 = (cr.height / 2) / Math.tan(FOV / 2);
    var dW = pxPerUnitAtD1 * extent / (2 * halfW);
    var dH = pxPerUnitAtD1 * 8.6 / (sr.height * 1.02);
    view.dist = Math.max(dW, dH, 9);
    return true;
  }

  function viewProj(t) {
    var az = -0.52 + (reducedMotion ? 0 : 0.10 * Math.sin(t * 2 * Math.PI / 36)) + cam.mx * 0.20;
    var el = 0.50 + cam.my * 0.07;
    var D = view.dist;
    var eye = [D * Math.cos(el) * Math.sin(az), D * Math.sin(el), D * Math.cos(el) * Math.cos(az)];
    var target = [0, 0.05, 0];
    var P = perspective(FOV, view.w / view.h, 0.5, 80);
    var V = lookAt(eye, target, [0, 1, 0]);
    return { vp: mul(P, V), eye: eye };
  }

  /* ── Draw ─────────────────────────────────────────────────────── */
  function bindBeamAttribs(buf) {
    var a = beamProg.a, S = 36;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.vb);
    gl.enableVertexAttribArray(a.aPos); gl.vertexAttribPointer(a.aPos, 3, gl.FLOAT, false, S, 0);
    gl.enableVertexAttribArray(a.aNrm); gl.vertexAttribPointer(a.aNrm, 3, gl.FLOAT, false, S, 12);
    gl.enableVertexAttribArray(a.aAux); gl.vertexAttribPointer(a.aAux, 2, gl.FLOAT, false, S, 24);
    gl.enableVertexAttribArray(a.aSp); gl.vertexAttribPointer(a.aSp, 1, gl.FLOAT, false, S, 32);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.ib);
  }
  function disableAll() { for (var i = 0; i < 8; i++) gl.disableVertexAttribArray(i); }

  var lastPhase = -1, labelEl = stage.querySelector('[data-hero3d-label]'), stepEls = stage.querySelectorAll('[data-hero3d-step]');
  function setPhase(i, text) {
    if (i === lastPhase && i !== 1) return;
    lastPhase = i;
    if (labelEl && labelEl.textContent !== text) labelEl.textContent = text;
    for (var k = 0; k < stepEls.length; k++) stepEls[k].classList.toggle('on', k <= i);
  }

  function draw(t) {
    var P = pal(), T = cyc.T, M = viewProj(t);
    gl.viewport(0, 0, view.w, view.h);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND);
    if (P.mode === 0) gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Static tweezer array
    gl.useProgram(beamProg.p);
    var u = beamProg.u;
    gl.uniformMatrix4fv(u.uVP, false, M.vp);
    gl.uniform2f(u.uOff, view.offX, view.offY);
    gl.uniform3fv(u.uEye, M.eye);
    gl.uniform1f(u.uMode, P.mode);
    gl.uniform3f(u.uShift, 0, 0, 0);
    gl.uniform3fv(u.uTintA, P.beamLi); gl.uniform3fv(u.uTintB, P.beamCs);
    gl.uniform1f(u.uAlpha, P.beamA);
    disableAll(); bindBeamAttribs(staticBeams);
    gl.drawElements(gl.TRIANGLES, staticBeams.count, gl.UNSIGNED_SHORT, 0);

    // Compute atom states once
    var states = cyc.atoms.map(function (a) { return atomState(a, t, T); });

    // Mobile (AOD) tweezers following transported atoms
    bindBeamAttribs(mobileBeam);
    gl.uniform1f(u.uAlpha, P.mobileA);
    states.forEach(function (s, i) {
      if (!s.moving || s.alpha < 0.05) return;
      var col = cyc.atoms[i].sp === 0 ? P.li : P.cs;
      gl.uniform3f(u.uShift, s.x, 0, s.z);
      gl.uniform3fv(u.uTintA, col); gl.uniform3fv(u.uTintB, col);
      gl.drawElements(gl.TRIANGLES, mobileBeam.count, gl.UNSIGNED_SHORT, 0);
    });

    // Points: MOT clouds + atoms (+ pair halos)
    var n = 0;
    function push(x, y, z, size, col, a, core) {
      if (n >= MAX_PTS || a <= 0.003) return;
      var o = n * PT_STRIDE;
      ptData[o] = x; ptData[o + 1] = y; ptData[o + 2] = z; ptData[o + 3] = size;
      ptData[o + 4] = col[0]; ptData[o + 5] = col[1]; ptData[o + 6] = col[2]; ptData[o + 7] = a; ptData[o + 8] = core;
      n++;
    }
    var cloudEnv = ramp(t, 0, 0.9) * (1 - ramp(t, 2.1, 2.8));
    if (cloudEnv > 0) {
      for (var i = 0; i < cloud.length; i++) {
        var q = cloud[i], tw = t * q.w;
        push(q.x + 0.18 * Math.sin(tw + q.ph), q.y + 0.08 * Math.sin(tw * 1.3 + q.ph * 2), q.z + 0.18 * Math.cos(tw + q.ph),
          P.cloudSize, q.sp === 0 ? P.li : P.cs, P.cloudA * cloudEnv, 0);
      }
    }
    var molMix = ease(ramp(t, T.mol, T.mol + 0.7));
    states.forEach(function (s, i) {
      var a = cyc.atoms[i], col = a.sp === 0 ? P.li : P.cs, x = s.x, z = s.z, size = P.atomSize;
      if (a.merge && molMix > 0) {
        // Bound Li–Cs pair sharing one tweezer: slow mutual orbit, colours blend toward the molecule hue.
        var ang = t * 2.4 + (a.merge.host ? Math.PI : 0);
        var rad = 0.085 * molMix;
        x += rad * Math.cos(ang); z += rad * Math.sin(ang);
        col = [col[0] + (P.mol[0] - col[0]) * molMix * 0.8, col[1] + (P.mol[1] - col[1]) * molMix * 0.8, col[2] + (P.mol[2] - col[2]) * molMix * 0.8];
        size *= 1 - 0.18 * molMix;
      }
      push(x, s.y, z, size * (1 + 0.35 * s.flash), col, s.alpha, s.core - 0.3 * molMix * (a.merge ? 1 : 0));
      if (a.merge && a.merge.host && molMix > 0) {
        var pulse = 0.75 + 0.25 * Math.sin(t * 3.2 + a.ph);
        push(s.x, s.y, s.z, P.atomSize * 2.4, P.mol, P.molHaloA * molMix * pulse * s.alpha, -0.35);
      }
    });

    gl.useProgram(ptProg.p);
    var pu = ptProg.u, pa = ptProg.a, PS = PT_STRIDE * 4;
    gl.uniformMatrix4fv(pu.uVP, false, M.vp);
    gl.uniform2f(pu.uOff, view.offX, view.offY);
    gl.uniform1f(pu.uScale, (view.h / 2) / Math.tan(FOV / 2));
    gl.uniform1f(pu.uMaxPt, maxPt);
    gl.uniform1f(pu.uMode, P.mode);
    disableAll();
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, ptData.subarray(0, n * PT_STRIDE));
    gl.enableVertexAttribArray(pa.aPos); gl.vertexAttribPointer(pa.aPos, 3, gl.FLOAT, false, PS, 0);
    gl.enableVertexAttribArray(pa.aSize); gl.vertexAttribPointer(pa.aSize, 1, gl.FLOAT, false, PS, 12);
    gl.enableVertexAttribArray(pa.aCol); gl.vertexAttribPointer(pa.aCol, 4, gl.FLOAT, false, PS, 16);
    gl.enableVertexAttribArray(pa.aCore); gl.vertexAttribPointer(pa.aCore, 1, gl.FLOAT, false, PS, 32);
    gl.drawArrays(gl.POINTS, 0, n);

    // Caption
    if (reducedMotion) setPhase(2, 'Li + Cs tweezer array, rearranged defect-free');
    else if (t < T.img1) setPhase(0, 'Loading Li + Cs from a dual-species MOT');
    else if (t < T.rearr) setPhase(1, 'Imaging: ' + cyc.loaded + ' of ' + SITES + ' tweezers loaded');
    else if (t < T.merge) setPhase(2, cyc.deficit ? 'Rearranging (' + cyc.deficit + ' site' + (cyc.deficit > 1 ? 's' : '') + ' short this shot)'
                                                   : 'Rearranging into a defect-free 6 × 5 block');
    else setPhase(3, 'Merging ' + cyc.pairs + ' Li–Cs pairs toward LiCs molecules');
  }

  /* ── Loop / lifecycle ─────────────────────────────────────────── */
  var running = false, visible = true, raf = 0, clock = 0, last = 0;
  // Adaptive quality: if the first ~90 frames average under 30 fps, render the
  // canvas at lower resolution (soft glows hide it well). At most two steps.
  var perf = { n: 0, sum: 0, steps: 0 };

  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
    if (dt > 0 && perf.steps < 2) {
      perf.n++; perf.sum += dt;
      if (perf.n === 90) {
        if (perf.sum / perf.n > 1 / 30) { quality *= 0.72; perf.steps++; resize(); }
        else perf.steps = 2;                     // fast enough — stop measuring
        perf.n = 0; perf.sum = 0;
      }
    }
    clock += dt;
    cam.mx += (cam.tmx - cam.mx) * Math.min(1, dt * 2.5);
    cam.my += (cam.tmy - cam.my) * Math.min(1, dt * 2.5);
    if (clock >= cyc.T.end) { clock = 0; cycleSeed++; cyc = makeCycle(cycleSeed); }
    draw(clock);
    raf = requestAnimationFrame(frame);
  }
  var paused = false;
  function start() {
    if (reducedMotion || paused || running || !visible || document.hidden) return;
    running = true; last = 0; raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function renderStatic() {
    // Find a shot with no deficit so the still frame shows the full block.
    var s = 11;
    for (var k = 0; k < 60; k++) { cyc = makeCycle(s + k); if (!cyc.deficit) break; }
    draw(cyc.T.img2 + 0.45);
  }

  function relayout() {
    if (!resize()) return;
    if (reducedMotion) renderStatic();
    else if (!running && cyc) draw(clock);
  }

  // First impression: start on a shot that fills the block completely.
  // Later cycles are fully random (and the caption says so when a shot comes up short).
  for (var tries = 0; tries < 60; tries++) { cyc = makeCycle(cycleSeed); if (!cyc.deficit) break; cycleSeed++; }
  if (!resize()) {
    // Stage hidden at load (e.g. print, or CSS says no) — try again once it has size.
  }
  if (reducedMotion) renderStatic(); else { draw(0); start(); }

  if (window.ResizeObserver) new ResizeObserver(relayout).observe(canvas);
  else window.addEventListener('resize', relayout);

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0.02 }).observe(stage);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });

  // Re-draw immediately when the theme toggles (the loop picks it up anyway; this covers reduced-motion).
  new MutationObserver(function () { if (reducedMotion) renderStatic(); else if (!running) draw(clock); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  if (!reducedMotion && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', function (e) {
      cam.tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      cam.tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); fallback('WebGL context lost'); });

  // Pause / play (WCAG 2.2.2: auto-playing motion longer than 5 s needs a way to stop it).
  var pauseBtn = stage.querySelector('[data-hero3d-pause]');
  if (pauseBtn) {
    if (reducedMotion) pauseBtn.hidden = true;           // already a still frame
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.textContent = paused ? '▶ Play animation' : '❚❚ Pause animation';
      if (paused) stop(); else start();
    });
  }

  // Test hook (used by the local screenshot harness; harmless in production).
  window.__hero3d = { seek: function (t) { stop(); clock = t; draw(t); }, cycle: function () { return cyc; }, resume: start,
    state: function () { return { paused: paused, running: running, clock: clock, reducedMotion: reducedMotion, phase: lastPhase, quality: quality, canvasPx: [canvas.width, canvas.height] }; } };
})();
