/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — tweezer3d.js: true-to-scale 3D view of a tweezer array.
   Used by pages/tweezer-designer.html (section 03, Array Geometry).

   Every dimension comes from the page's own calculator, in micrometres:
     w0  = 0.52 λ/NA          (beam waist)
     zR  = π w0² / λ          (Rayleigh range)
     d, Nx, Ny                (site pitch and array size)
   Each tweezer is drawn as its Gaussian envelope w(z) = w0·√(1 + (z/zR)²)
   over ±3 zR, so the picture shows what the numbers imply: beams are
   long and thin (axial confinement ≪ radial), and neighbouring beams
   start to overlap away from focus when d is only a few w0.

   Raw WebGL 1, renders on demand only (input change, drag, resize, theme)
   — no animation loop, so it costs nothing while idle. Rotation uses the
   shared AMO3D.orbit (js/orbit3d.js). Returns null if WebGL is missing;
   the page then keeps its original top view.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  window.AMO3D = window.AMO3D || {};

  AMO3D.tweezerArray = function (canvas, opts) {
    opts = opts || {};
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, depth: false });
    } catch (e) { gl = null; }
    if (!gl) return null;
    var root = document.documentElement;

    /* ── shaders ── */
    var BEAM_VS = [
      'attribute float aU; attribute float aTh;',
      'uniform mat4 uVP; uniform vec2 uOff; uniform float uW0; uniform float uZR; uniform float uZMax; uniform vec3 uEye;',
      'varying vec3 vN; varying vec3 vV; varying float vU; varying float vFocus;',
      'void main(){',
      '  float z = aU * uZMax; float q = sqrt(1.0 + (z/uZR)*(z/uZR)); float w = uW0 * q;',
      '  vec3 p = vec3(uOff.x + w*cos(aTh), uOff.y + w*sin(aTh), z);',
      '  vN = vec3(cos(aTh), sin(aTh), -uW0 * (z/(uZR*uZR)) / q);',
      '  vV = uEye - p; vU = aU; vFocus = 1.0 / q;',
      '  gl_Position = uVP * vec4(p, 1.0);',
      '}'
    ].join('\n');
    var BEAM_FS = [
      'precision mediump float;',
      'varying vec3 vN; varying vec3 vV; varying float vU; varying float vFocus;',
      'uniform vec3 uCol; uniform float uAlpha; uniform float uMode;',
      'void main(){',
      '  float f = abs(dot(normalize(vN), normalize(vV)));',
      '  float ends = 1.0 - smoothstep(0.85, 1.0, abs(vU));',
      '  float focus = vFocus * vFocus;',                               // on-axis intensity ∝ (w0/w)²
      '  float shape = uMode < 0.5 ? 0.55 * pow(f, 1.6) * mix(0.25, 1.0, focus) + 0.6 * pow(1.0 - f, 4.0)',
      '                            : pow(1.0 - f, 3.0) * mix(0.4, 1.0, focus);',
      '  float a = shape * ends * uAlpha;',
      '  gl_FragColor = vec4(uCol * a, a);',
      '}'
    ].join('\n');
    var LINE_VS = 'attribute vec3 aPos; uniform mat4 uVP; void main(){ gl_Position = uVP * vec4(aPos, 1.0); }';
    var LINE_FS = 'precision mediump float; uniform vec4 uCol; void main(){ gl_FragColor = vec4(uCol.rgb * uCol.a, uCol.a); }';
    var PT_VS = [
      'attribute vec3 aPos; uniform mat4 uVP; uniform float uSize;',
      'void main(){ vec4 p = uVP * vec4(aPos, 1.0); gl_Position = p; gl_PointSize = clamp(uSize / p.w, 2.0, 64.0); }'
    ].join('\n');
    var PT_FS = [
      'precision mediump float; uniform vec3 uCol; uniform float uMode;',
      'void main(){ vec2 d = gl_PointCoord - 0.5; float r2 = dot(d,d)*4.0; if (r2 > 1.0) discard;',
      '  float a = uMode < 0.5 ? (exp(-r2*6.0) * 0.55 + exp(-r2*40.0)) : (1.0 - smoothstep(0.2, 0.45, r2));',
      '  vec3 c = uMode < 0.5 ? mix(uCol, vec3(1.0), exp(-r2*40.0)*0.6) : uCol;',
      '  gl_FragColor = vec4(c * a, a); }'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    function prog(vs, fs, attrs, unis) {
      var p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      var o = { p: p, a: {}, u: {} };
      attrs.forEach(function (n) { o.a[n] = gl.getAttribLocation(p, n); });
      unis.forEach(function (n) { o.u[n] = gl.getUniformLocation(p, n); });
      return o;
    }
    var beamP, lineP, ptP;
    try {
      beamP = prog(BEAM_VS, BEAM_FS, ['aU', 'aTh'], ['uVP', 'uOff', 'uW0', 'uZR', 'uZMax', 'uEye', 'uCol', 'uAlpha', 'uMode']);
      lineP = prog(LINE_VS, LINE_FS, ['aPos'], ['uVP', 'uCol']);
      ptP = prog(PT_VS, PT_FS, ['aPos'], ['uVP', 'uSize', 'uCol', 'uMode']);
    } catch (err) { if (window.console) console.info('[tweezer3d] ' + err.message); return null; }

    /* ── one unit beam mesh (u ∈ [-1,1] along the axis, θ around it) ── */
    var RINGS = 44, SEGS = 22, mesh = [], idx = [];
    for (var k = 0; k <= RINGS; k++) {
      var t = -1 + 2 * k / RINGS, u = (t < 0 ? -1 : 1) * Math.pow(Math.abs(t), 1.5);   // denser near focus
      for (var j = 0; j <= SEGS; j++) mesh.push(u, 2 * Math.PI * j / SEGS);
    }
    for (k = 0; k < RINGS; k++) for (j = 0; j < SEGS; j++) {
      var a = k * (SEGS + 1) + j, b = a + SEGS + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    var meshBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
    var idxBuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    var lineBuf = gl.createBuffer(), ptBuf = gl.createBuffer();

    var PAL = {
      dark:  { mode: 0, beam: [1.0, 0.66, 0.18], beamA: 0.3, atom: [1.0, 0.8, 0.45], grid: [0.62, 0.66, 0.74, 0.16], bar: [0.9, 0.92, 0.95, 0.85] },
      light: { mode: 1, beam: [0.55, 0.30, 0.02], beamA: 0.85, atom: [0.63, 0.24, 0.11], grid: [0.23, 0.17, 0.10, 0.16], bar: [0.23, 0.17, 0.10, 0.9] }
    };
    function pal() { return root.getAttribute('data-theme') === 'dark' ? PAL.dark : PAL.light; }

    var P = { nx: 5, ny: 5, d: 5, w0: 0.8, zR: 2.4 };
    var view = opts.view || { az: 0.6, el: 0.45 };
    var scaleEl = opts.scaleLabel || null, noteEl = opts.note || null;

    function niceBar(span) {
      var target = span / 3, steps = [0.5, 1, 2, 5, 10, 20, 50, 100], best = steps[0];
      steps.forEach(function (s) { if (s <= target) best = s; });
      return best;
    }

    function mat(eye, tgt, aspect, fov) {
      var f = 1 / Math.tan(fov / 2), n = 0.05, fr = 5000, nf = 1 / (n - fr);
      var Pm = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (fr + n) * nf, -1, 0, 0, 2 * fr * n * nf, 0];
      var zx = eye[0] - tgt[0], zy = eye[1] - tgt[1], zz = eye[2] - tgt[2], l = Math.hypot(zx, zy, zz);
      zx /= l; zy /= l; zz /= l;
      var ux = 0, uy = 0, uz = 1;                            // lab z is up
      var xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
      var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      var V = [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
        -(xx * eye[0] + xy * eye[1] + xz * eye[2]), -(yx * eye[0] + yy * eye[1] + yz * eye[2]), -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1];
      var o = new Float32Array(16);
      for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++)
        o[c * 4 + r] = Pm[r] * V[c * 4] + Pm[4 + r] * V[c * 4 + 1] + Pm[8 + r] * V[c * 4 + 2] + Pm[12 + r] * V[c * 4 + 3];
      return o;
    }
    function toScreen(M, x, y, z, W, H) {
      var cx = M[0] * x + M[4] * y + M[8] * z + M[12], cy = M[1] * x + M[5] * y + M[9] * z + M[13], cw = M[3] * x + M[7] * y + M[11] * z + M[15];
      return [(cx / cw * 0.5 + 0.5) * W, (1 - (cy / cw * 0.5 + 0.5)) * H];
    }

    function render() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      var C = pal();
      var zMax = 3 * P.zR, wMax = P.w0 * Math.sqrt(10);
      var Lx = (P.nx - 1) * P.d + 2 * wMax, Ly = (P.ny - 1) * P.d + 2 * wMax, Lz = 2 * zMax;
      var fov = 30 * Math.PI / 180, aspect = W / H;
      var ce = Math.cos(view.el), se = Math.sin(view.el), ca = Math.cos(view.az), sa = Math.sin(view.az);
      // Fit the rotated content box (not a bounding sphere, which wastes most of the frame
      // for a flat, wide array): project its 8 corners with the view rotation and pick the
      // distance that fits both the horizontal and vertical extents, with a small margin.
      var ex = 0, ey = 0, ed = 0;
      [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sy) { [-1, 1].forEach(function (sz) {
        var x = sx * Lx / 2, y = sy * Ly / 2, z = sz * Lz / 2, xr = x * ca - y * sa, yr = x * sa + y * ca;
        ex = Math.max(ex, Math.abs(xr)); ey = Math.max(ey, Math.abs(z * ce + yr * se)); ed = Math.max(ed, Math.abs(z * se - yr * ce));
      }); }); });
      var tv = Math.tan(fov / 2), th = tv * aspect;
      var dist = Math.max(ex / th, ey / tv) * 1.04 + ed * 0.6;
      var eye = [-ce * sa * dist, -ce * ca * dist, se * dist];      // matches AMO3D.project's "toward viewer"
      var M = mat(eye, [0, 0, 0], aspect, fov);

      gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND);
      if (C.mode === 0) gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      for (var i = 0; i < 4; i++) gl.disableVertexAttribArray(i);

      var x0 = -(P.nx - 1) * P.d / 2, y0 = -(P.ny - 1) * P.d / 2;

      // Focal-plane grid through the sites + a scale bar
      var L = [], pad = P.d * 0.6;
      for (var ix = 0; ix < P.nx; ix++) { var gx = x0 + ix * P.d; L.push(gx, y0 - pad, 0, gx, -y0 + pad, 0); }
      for (var iy = 0; iy < P.ny; iy++) { var gy = y0 + iy * P.d; L.push(x0 - pad, gy, 0, -x0 + pad, gy, 0); }
      var nGrid = L.length / 3;
      var bar = niceBar(Math.max((P.nx - 1) * P.d, (P.ny - 1) * P.d, 4 * P.w0));
      var bx = x0 - pad, by = y0 - pad - P.d * 0.35 - wMax;
      L.push(bx, by, 0, bx + bar, by, 0, bx, by - bar * 0.06, 0, bx, by + bar * 0.06, 0, bx + bar, by - bar * 0.06, 0, bx + bar, by + bar * 0.06, 0);
      gl.useProgram(lineP.p);
      gl.uniformMatrix4fv(lineP.u.uVP, false, M);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(L), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(lineP.a.aPos); gl.vertexAttribPointer(lineP.a.aPos, 3, gl.FLOAT, false, 12, 0);
      gl.uniform4fv(lineP.u.uCol, C.grid); gl.drawArrays(gl.LINES, 0, nGrid);
      gl.uniform4fv(lineP.u.uCol, C.bar); gl.drawArrays(gl.LINES, nGrid, 6);
      gl.disableVertexAttribArray(lineP.a.aPos);

      // Beams — one small mesh, drawn once per site (≤ 144 sites)
      gl.useProgram(beamP.p);
      var u = beamP.u;
      gl.uniformMatrix4fv(u.uVP, false, M);
      gl.uniform1f(u.uW0, P.w0); gl.uniform1f(u.uZR, P.zR); gl.uniform1f(u.uZMax, zMax);
      gl.uniform3fv(u.uEye, eye); gl.uniform3fv(u.uCol, C.beam); gl.uniform1f(u.uMode, C.mode);
      // Keep total glow roughly constant as the array grows (dark / additive mode)
      var n = P.nx * P.ny;
      gl.uniform1f(u.uAlpha, C.mode === 0 ? C.beamA * Math.min(1, 5 / Math.sqrt(n)) : C.beamA);
      gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf);
      gl.enableVertexAttribArray(beamP.a.aU); gl.vertexAttribPointer(beamP.a.aU, 1, gl.FLOAT, false, 8, 0);
      gl.enableVertexAttribArray(beamP.a.aTh); gl.vertexAttribPointer(beamP.a.aTh, 1, gl.FLOAT, false, 8, 4);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      var pts = [];
      for (ix = 0; ix < P.nx; ix++) for (iy = 0; iy < P.ny; iy++) {
        var ox = x0 + ix * P.d, oy = y0 + iy * P.d;
        gl.uniform2f(u.uOff, ox, oy);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        pts.push(ox, oy, 0);
      }
      gl.disableVertexAttribArray(beamP.a.aU); gl.disableVertexAttribArray(beamP.a.aTh);

      // Atoms at each focus (marker size tied to w0, not to scale — a real atom is ≪ w0)
      gl.useProgram(ptP.p);
      gl.uniformMatrix4fv(ptP.u.uVP, false, M);
      gl.uniform1f(ptP.u.uSize, P.w0 * (C.mode === 0 ? 2.2 : 1.3) * (H / 2) / Math.tan(fov / 2));
      gl.uniform3fv(ptP.u.uCol, C.atom); gl.uniform1f(ptP.u.uMode, C.mode);
      gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pts), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(ptP.a.aPos); gl.vertexAttribPointer(ptP.a.aPos, 3, gl.FLOAT, false, 12, 0);
      gl.drawArrays(gl.POINTS, 0, pts.length / 3);
      gl.disableVertexAttribArray(ptP.a.aPos);

      // HTML labels positioned from the same projection
      if (scaleEl) {
        var s0 = toScreen(M, bx + bar / 2, by, 0, r.width, r.height);
        scaleEl.style.left = s0[0].toFixed(1) + 'px'; scaleEl.style.top = (s0[1] + 6).toFixed(1) + 'px';
        scaleEl.textContent = bar + ' μm';
      }
      if (noteEl) {
        noteEl.textContent = 'To scale · w₀ = ' + P.w0.toFixed(2) + ' μm · z_R = ' + P.zR.toFixed(2) + ' μm · d = ' + P.d.toFixed(1) +
          ' μm · beams shown to ±3 z_R (w = √10 w₀ = ' + wMax.toFixed(2) + ' μm)';
      }
    }

    var pending = false;
    function schedule() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; render(); }); }
    if (view.onChange) view.onChange(schedule);
    new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(canvas); else window.addEventListener('resize', schedule);
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); if (opts.onLost) opts.onLost(); });

    return {
      set: function (p) { for (var key in p) if (p[key] != null && isFinite(p[key]) && p[key] > 0) P[key] = p[key]; schedule(); },
      render: render
    };
  };
})();
