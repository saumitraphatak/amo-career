/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — globe3d.js: a rotatable "dotted Earth" for data that
   lives on the map (research groups, company headquarters).

   Land = Natural Earth 1:50m land polygons (public domain, via the
   world-atlas land-50m TopoJSON), rasterized once to a 1° grid
   (180 rows × 360 cols, row 0 = 89.5°N, col 0 = 179.5°W, bit = land)
   and embedded below as 8.1 KB of base64 — no map service, tiles or
   extra download at runtime. Verified at build time: 18,698 land cells;
   spot checks land at Kansas/Boston/UK/Sahara/Australia/Antarctica,
   ocean at the mid-Atlantic/Pacific/Caspian.

   Canvas 2D orthographic globe; dots are spaced uniformly on the sphere.
   Markers within opts.clusterDeg (default 0.35°, ≈40 km) merge into one
   numbered marker; clicking it lists everything inside.
   Rotation uses the shared AMO3D.orbit (js/orbit3d.js must load first).
   Auto-spin (with a pause button — WCAG 2.2.2) stops when you interact,
   is off under prefers-reduced-motion, and pauses offscreen.

   Keyboard (2026-09-29): arrow keys turn it (AMO3D.orbit); ] and [ step
   through the markers from west to east, turning the globe to each one
   and pinning its card, with an aria-live line; Enter opens a single
   entry (opts.onPick) or moves focus into a cluster's list; Esc closes.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  window.AMO3D = window.AMO3D || {};

  var LAND_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//8AAb///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///+h//////6fAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gD/5////////gAAAAAAAAACwBgAAAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAA///+Af//////+AAAABrvwAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAeHznn/w////////4AAAAB3sAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAEcIA5M3AI///////4AAAAAPFAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAABoCGc+r+AH///////wAAAAAAAAAAAAAB4AAAAA/+AAAAAAAAAAAAAAAAAAAAAD/wPz78AAAP/////+AAAAAAAAAAAAD4AAAA////AAAB9oAAAAAAAAAAAAAACAwACAIAAAAD/////+AAAAAAAAAAAAOAAAAH///6AAAAAAAAAAAAAAAAAAAAP+AY8+M/gAAD////+4AAAAAAAAAAAA4AAGH///+O+HQAOAAAAAAAAAAAAAAAfv+4/Q944AAB////+wAAAAAAAAAAABgAHlH///////4AHwAAAAAP////////xyAD7nAAC//+gAAAEf///////////+P/wmBAAAAAAAHYQAf////AAAP8gAAAAAP+A8f//8AA3///ogAAAAAABvgAAAAAfv+////////////8AAAAAB///+BfWH/+CuBhf8AA3////AAAAAABf/wAAAA8Pv///////////////H8P/wAAAAAAAAvD+xMP8B//gAAAP//////6AAAPz+hAIBAAAAAAAAAAAAAAAAAB/8AAAAAAAABAAgIHnAP/AAAH///////8AAAB3AAAAwAAAAAAAAAAAAAAAAAAH7wAAAAAAAAAAAGf8AD/AAAf///////gAAGBwAAADAAAAAAAAAAAAAAAAAAcPAAAAAAAAAAAAAV/8Bn/gAP//QD////ADgB8AAAAAAAAAAAAAAAAAAAAAAAAwAf///////////zwx/gAH/wAAP8AAAB/4/+f//////////////////////4AMAf//////////+DAAbgAH/gAADAAAAN/z/////////////////////////+AAH///////////4AwgGQAD/AAAAAAAA//H///////////////////////n/6AAP///////////wAA/AAAB/AAAAAAAB/+D//////////////////////jP+AAAH/9z////////gAA/wAAAMAAAAAACB//D1////////////////////+A/YAAAA/wAD///////gAA/wQAAAAAAAAAAB9/Ab///////////////////+uDgAAAAAB0AAf//////4AA/94AAAAAAAAAYA5+C///////////////////4AAHAAAAAABcAAP//////4AAf/8AAAAAAAAB8AA+i///////////////////wAAfgAAAAAMAAAC///////wAf/8AAAAAAAAAYAOeH///////////////////AAA/gAAAAAAAAAC///////8Af//AAAAAAAAAcAPQH//////////////////8AAA/AAAAAEAAAAAP///////z///wAAAAAAADuAETv//////////////////+AAA+AAAAAAAAAABP///////x///8AAAAAAAPHAX/////////////////////4AA8AAAAAAAAAAAj///////x///8AAAAAAAPPx//////////////////////6AAwAAAAAAAAAAAD///////////6AAAAAAAAPj//////////////////////6AAwAAAAAAAAAAACf//////////EAAAAAAAAQP//////////////////////zAAAAAAAAAAAAAABv////////+MNAAAAAAAAC///////////////////////zAAAAAAAAAAAAAAAP////////7wPgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAL/////////gCgAAAAAAAD///////////////////////iAAAAAAAAAAAAAAAP/////////pAAAAAAAAAD/////vP/h//////////////BAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB//v//GP/B/////////////+AAAAAAAAAAAAAAAAP////////8wAAAAAAAAAB//H/+AP+P/////////////8CAAAAAAAAAAAAAAAP////////wAAAAAAAAADj/jx/+AD/H/////////////4HgAAAAAAAAAAAAAAP////////gAAAAAAAAAH/4Fw/8AA/B////////////+ACAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/wAcf8PB/g////////////8AAAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/gMHfB///x///////////v4AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/IMCOH///h//////////+ZwAMAAAAAAAAAAAAAAAH///////4AAAAAAAQAAH/AACHP///g//////////8BwAMAAAAAAAAAAAAAAAD///////wAAAAAAAAAAH+AAYCH///g//////////+wYAYAAAAAAAAAAAAAAAD///////wAAAAAAAAAAAgf+AABs//////////////gYD4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAAh/+AAAA//////////////A4PwAAAAAAAAAAAAAAAB///////gAAAAAAAAAAB//8AAAA//////////////Ah2AAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gjwAAAAAAAAAAAAAAAAAH/////4AAAAAAAAAAAH///4OAB//////////////gBAAAAAAAAAAAAAAAAAAG/////4AAAAAAAAAAAP///8P4D//////////////gCAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP////v////////////////gAAAAAAAAAAAAAAAAAAABv//hAYAAAAAAAAAAAP//////3//H///////////wAAAAAAAAAAAAAAAAAAAAv/+AAYAAAAAAAAAAAf/////////H///////////wAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAB///////8//h///////////gAAAAAAAAAAAAAAAAAAAAZ/+AAMAAAAAAAAAAD///////8//wH//////////AAAAAAAAAAAAAAAAAAAAAJ/+AAEAAAAAAAAAAH///////+f/wB/f////////AAAAAAAAAAAAAAAAAAAAAI/8AAAAAAAAAAAAAH///////+f/4YAf///////8QAAAAAAAAAAAAAAAAAAAACf8AAAAAAAAAAAAAP////////H//+AP///////4gAAAAAAAAAAAAAAAAAAAAAP8AAvAAAAAAAAAAP////////H///AD///////AgAAAAAAAAAAAAAAAAAAAAAH8AQBgAAAAAAAAAf////////n//+ADf/4P//IAAAAAAAAAAAAAAAAAAAAAAAP+A4AYAAAAAAAAAP////////j//+AAf/4H/+IAAAAAAAAAAAAAAAgAAAAAAAH/B4ABwAAAAAAAAP////////h//8AAf/gD/8YAAAAAAAAAAAAAAAAAAAAAAAD/lwAD8AAAAAAAAP////////x//4AAf/AD/8QAAAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAP////////4//gAAf+AB/+AAwAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAAAAAAP////////4f+AAAf8ADP/AAwAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAf////////8f8AAAPwAAP/gAgAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fgAAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAAAAAf/////////eAAAAHwAAN/gAsAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAf/////////gBAAAHwAAE/gACAAAAAAAAAAAAAAAAAAAAAAAADABIAAAAAAAAH/////////gIAAADwAAEfgALAAAAAAAAAAAAAAAAAAAAAAAADgPfIAAAAAAAH/////////34AAADwAAIOABAAAAAAAAAAAAAAAAAAAAAAAAAAyPf+AAAAAAAD//////////4AAADoAAIEACBAAAAAAAAAAAAAAAAAAAAAAAAA8///AAAAAAAB//////////wAAABIAAMAAAHAAAAAAAAAAAAAAAAAAAAAAAAAE///gAAAAAAA//////////wAAAAMAAEAAADgAAAAAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAf/7///////gAAAAMAADAAMDAAAAAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAP/B///////gAAAAAABDgAeAAAAAAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAACAAn//////AAAAAAAAxgA+AAAAAAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAD/////+AAAAAAAAZgB4AAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAAAAD/////8AAAAAAAAMwH8AIAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAD/////wAAAAAAAAHQf8AIAAAAAAAAAAAAAAAAAAAAAAAAD////4AAAAAAAAAH/////gAAAAAAAAHgf8cIAAAAAAAAAAAAAAAAAAAAAAAAD/////AAAAAAAAAH/////AAAAAAAAADof8ASgAAAAAAAAAAAAAAAAAAAAAAAH////u4AAAAAAAAH/////AAAAAAAAABwP5wQwAAAAAAAAAAAAAAAAAAAAAAAH////94AAAAAAAAD////+AAAAAAAAAB+P5wAD4AAAAAAAAAAAAAAAAAAAAAAH//////4AAAAAAAB////8AAAAAAAAAA8ARQif/AAAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAA////4AAAAAAAAAAcAAAAD/gAAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMABAAI/ywAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAA////4AAAAAAAAAADgAAAIf8BAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AABA/4AAAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///4AAAAAAAAAAAAfsgAOMAAAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///8AAAAAAAAAAAABCAAAGgAAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAP///8AAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAf/////+AAAAAAAAP///8AAAAAAAAAAAAAACgCAEAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAB+CAAAAAAAQAAAAAAAAAAAAAAAP/////4AAAAAAAAf///+AwAAAAAAAAAAAAD8DAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+AwAAAAAAAAAAAAz8DgAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////+DwAAAAAAAAAAAD/8HgAAAAAAAAAAAAAAAAAP////+B////4AAAAAAAA////8PwAAAAAAAAAAAH//XgAABABAAAAAgAAAAAAAAAAAAf////4AAAAAAAA////wPgAAAAAAAAAAAP//3wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAA////gPgAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///8AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgEAAAAAAAAAD////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf////+AAEAAAAAAAAAAAAAAAAAAAAP////AAAAAAAAAP///AfAAAAAAAAAAA//////AAAAAAAAAAAAAAAAAAAAAAAP///4AAAAAAAAAP//+APAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAH//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AEAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAD//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAAAAA//AAAAAAAAAAAAAAP/////4AAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAAAAA/+AAAAAAAAAAAAAAP/AP//wAAAAAAAAAAAAAAAAAAAAAA//vgAAAAAAAAAAA/4AAAAAAAAAAAAAAP8AG//gAAAAAAAAAAAAAAAAAAAAAA//3AAAAAAAAAAAAQAAAAAAAAAAAAAAAOAAF//gAAAAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAABAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAQAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAAAcAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAADQAAAAAAAAAAAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAOAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAP4AAAAAAD+HgBj/AAAAgAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAACf/gAAB//////////AAAAAAAAAAAAAAAAAAAAAAAABoAAAAAAAAAAAAAAAAB////8Af///////////gAAAAAAAAAAAAAAAAAAAAAB34AAAAAAAAAAAAAAAGD////4D/////////////8AAAAAAAAAAAAAAAAAAAAAb8AAAAAAAAAAAc/kB//////4f/////////////+gAAAAAAAAAAAAAAAAAAAB98AAAAAAAA7+///////////x////////////////4AAAAAAAAAAAAAAHAAAB5+AAAAAAAA/////////////n////////////////gAAAAAAAAABAAAAP/+Gl/+AAAAAAAP/////////////////////////////+AAAAAAAAAAiAfsAP/////+AAAAAAA//////////////////////////////oAAAAAAAAH////////////wAAAAAAF//////////////////////////////AAAAAAAAH////////////wAAAAAAf///////////////////////////////gAAAAAD+P///////////8AAAAAAP////////////////////////////////zgAAAAA////////////PgCAAD8A/////////////////////////////////+AAAAB4B////////////wwAAD+AA///////////////////////////////8AAAAAAAA////////////wA/A/gAH///////////////////////////////+AAAAABgf//////////////gAAA/////////////////////////////////+AAAAAAAH//////////////4D////////////////////////////////////4AAAB/X//////////////////////////////////////////////////////4AAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  var LAND = null;
  function land() {
    if (LAND) return LAND;
    var bin = atob(LAND_B64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    LAND = function (lat, lon) {
      var r = Math.min(179, Math.max(0, Math.floor(90 - lat))), c = Math.min(359, Math.max(0, Math.floor(lon + 180)));
      var n = r * 360 + c;
      return (bytes[n >> 3] >> (7 - (n & 7))) & 1;
    };
    return LAND;
  }

  var DEG = Math.PI / 180;
  function unit(lat, lon) { var cl = Math.cos(lat * DEG); return [cl * Math.cos(lon * DEG), cl * Math.sin(lon * DEG), Math.sin(lat * DEG)]; }
  // view (az, el) that puts (lat, lon) at the centre of the disc — inverse of AMO3D.project's facing direction
  function viewFor(lat, lon) { return { az: Math.atan2(-Math.cos(lon * DEG), -Math.sin(lon * DEG)), el: Math.max(-1.2, Math.min(1.2, lat * DEG)) }; }

  var dotCache = {};
  function landDots(stepDeg) {
    if (dotCache[stepDeg]) return dotCache[stepDeg];
    var isLand = land(), out = [];
    for (var lat = -88 + stepDeg / 2; lat < 88; lat += stepDeg) {
      var dLon = stepDeg / Math.max(0.12, Math.cos(lat * DEG));          // uniform density on the sphere
      var off = (Math.round(lat / stepDeg) % 2) * dLon / 2;                // stagger rows → hex-like packing
      for (var lon = -180 + off; lon < 180; lon += dLon) if (isLand(lat, lon)) out.push(unit(lat, lon));
    }
    return (dotCache[stepDeg] = out);
  }

  AMO3D.globe = function (canvas, opts) {
    opts = opts || {};
    if (!AMO3D.orbit || !canvas) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var root = document.documentElement;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var start = opts.center ? viewFor(opts.center.lat, opts.center.lon) : { az: 0, el: 0.5 };
    var view = AMO3D.orbit(canvas, { az: start.az, el: start.el, minEl: -1.25, maxEl: 1.25,
      label: opts.label || 'Rotatable globe', hintParent: opts.hintParent });
    var dots = landDots(opts.dotStep || 1.6);
    var pts = [], clusters = [];
    var W = 0, H = 0, R = 1, CX = 0, CY = 0, dpr = 1;

    var host = canvas.parentElement;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var tip = document.createElement('div');
    tip.className = 'globe3d-tip'; tip.hidden = true;
    host.appendChild(tip);

    function pal() {
      return root.getAttribute('data-theme') === 'dark'
        ? { dark: true, ocean0: '#0d1d36', ocean1: '#040a15', rim: 'rgba(96,165,250,0.35)', land: [150, 195, 255], grid: 'rgba(148,163,184,0.12)', ring: 'rgba(2,8,15,0.9)', text: '#e2e8f0' }
        : { dark: false, ocean0: '#fbf6ea', ocean1: '#efe6d1', rim: 'rgba(58,42,24,0.45)', land: [70, 52, 30], grid: 'rgba(58,42,24,0.10)', ring: 'rgba(34,25,15,0.75)', text: '#22190f' };
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) * 0.44; CX = W / 2; CY = H / 2;
      return true;
    }

    // Greedy clustering by great-circle distance (default ≈ 40 km: same campus / city),
    // so nearby markers merge into one numbered marker instead of hiding each other.
    var cosMax = Math.cos((opts.clusterDeg || 0.35) * DEG);
    function cluster() {
      var groups = [];
      pts.forEach(function (p) {
        var u = unit(p.lat, p.lon), best = null, bd = cosMax;
        groups.forEach(function (g) {
          var n = Math.hypot(g.s[0], g.s[1], g.s[2]), d = (g.s[0] * u[0] + g.s[1] * u[1] + g.s[2] * u[2]) / n;
          if (d >= bd) { bd = d; best = g; }
        });
        if (!best) groups.push(best = { list: [], s: [0, 0, 0] });
        best.list.push(p); best.s[0] += u[0]; best.s[1] += u[1]; best.s[2] += u[2];
      });
      clusters = groups.map(function (g) {
        var n = Math.hypot(g.s[0], g.s[1], g.s[2]), u = [g.s[0] / n, g.s[1] / n, g.s[2] / n];
        var tally = {}; g.list.forEach(function (p) { tally[p.color] = (tally[p.color] || 0) + 1; });
        var color = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })[0];
        return { list: g.list, u: u, lat: Math.asin(u[2]) / DEG, lon: Math.atan2(u[1], u[0]) / DEG, color: color };
      });
    }

    var screen = [];   // projected clusters for hit-testing
    function draw() {
      if (!W && !resize()) return;
      var P = pal();
      ctx.clearRect(0, 0, W, H);
      // ocean disc + atmosphere rim
      if (P.dark) {
        var halo = ctx.createRadialGradient(CX, CY, R * 0.96, CX, CY, R * 1.16);
        halo.addColorStop(0, 'rgba(56,189,248,0.22)'); halo.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(CX, CY, R * 1.16, 0, 6.2832); ctx.fill();
      }
      var og = ctx.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.1, CX, CY, R);
      og.addColorStop(0, P.ocean0); og.addColorStop(1, P.ocean1);
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = P.rim; ctx.lineWidth = 1.2; ctx.stroke();

      // graticule (30°), near side only
      ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
      var lat, lon, i, q;
      for (lat = -60; lat <= 60; lat += 30) line(function (t) { return unit(lat, -180 + 360 * t); });
      for (lon = -180; lon < 180; lon += 30) line(function (t) { return unit(-90 + 180 * t, lon); });
      function line(f) {
        ctx.beginPath(); var pen = false;
        for (var k = 0; k <= 72; k++) {
          var u = f(k / 72), p = AMO3D.project(view, u[0], u[1], u[2]);
          if (p[2] > 0) { var x = CX + R * p[0], y = CY - R * p[1]; pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false;
        }
        ctx.stroke();
      }

      // land dots with limb darkening
      var s = Math.max(1.1, R / 150) * (P.dark ? 1.25 : 1.15);
      for (i = 0; i < dots.length; i++) {
        var d = dots[i]; q = AMO3D.project(view, d[0], d[1], d[2]);
        if (q[2] <= 0.02) continue;
        var a = P.dark ? 0.25 + 0.65 * q[2] : 0.22 + 0.55 * q[2];
        ctx.fillStyle = 'rgba(' + P.land[0] + ',' + P.land[1] + ',' + P.land[2] + ',' + a.toFixed(2) + ')';
        ctx.fillRect(CX + R * q[0] - s / 2, CY - R * q[1] - s / 2, s, s);
      }

      // markers
      screen = [];
      clusters.forEach(function (c) {
        var p = AMO3D.project(view, c.u[0], c.u[1], c.u[2]);
        if (p[2] <= 0.05) return;
        var x = CX + R * p[0], y = CY - R * p[1], n = c.list.length;
        var r = (3.4 + 1.9 * Math.sqrt(n - 1)) * (0.75 + 0.25 * p[2]);
        if (P.dark) {
          var g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
          g.addColorStop(0, hexA(c.color, 0.55)); g.addColorStop(1, hexA(c.color, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 6.2832); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
        ctx.fillStyle = c.color; ctx.fill();
        ctx.lineWidth = 1.2; ctx.strokeStyle = P.ring; ctx.stroke();
        if (n > 1 && r > 6) {
          ctx.fillStyle = P.dark ? '#02080f' : '#fff'; ctx.font = '700 ' + Math.round(r * 1.05) + 'px system-ui,sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), x, y + 0.5);
        }
        screen.push({ x: x, y: y, r: Math.max(r, 7), c: c });
      });
    }
    function hexA(hex, a) {
      var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
      var n = parseInt(h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    /* ── hover / click ── */
    var pinned = null, hover = null;
    function hit(ev) {
      var r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = null, bd = 1e9;
      screen.forEach(function (s) { var d = Math.hypot(s.x - x, s.y - y); if (d <= s.r + 4 && d < bd) { bd = d; best = s; } });
      return best;
    }
    function showTip(s, pin) {
      var c = s.c, list = c.list;
      var head = opts.clusterTitle ? opts.clusterTitle(list) : (list.length + ' item' + (list.length > 1 ? 's' : ''));
      var rows = list.slice(0, 12).map(function (p, k) {
        return '<button type="button" class="globe3d-row" data-k="' + k + '"><i style="background:' + p.color + '"></i><span><b>' +
          esc(p.title) + '</b>' + (p.sub ? '<small>' + esc(p.sub) + '</small>' : '') + '</span></button>';
      }).join('') + (list.length > 12 ? '<div class="globe3d-more">+' + (list.length - 12) + ' more</div>' : '');
      tip.innerHTML = '<div class="globe3d-head">' + esc(head) + '</div>' + rows + (pin ? '' : '<div class="globe3d-hint">' + (list.length > 1 ? 'click to choose' : 'click for details') + '</div>');
      tip.hidden = false; tip.classList.toggle('pinned', !!pin);
      var hw = host.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
      var cr = canvas.getBoundingClientRect(), hr = host.getBoundingClientRect();
      var x = s.x + (cr.left - hr.left) + 14, y = s.y + (cr.top - hr.top) - 10;
      if (x + tw > hw - 4) x = s.x + (cr.left - hr.left) - tw - 14;
      tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, Math.min(y, host.clientHeight - th - 4)) + 'px';
      tip.querySelectorAll('.globe3d-row').forEach(function (b) {
        b.addEventListener('click', function () { var p = list[+b.dataset.k]; hideTip(); if (opts.onPick) opts.onPick(p); });
      });
    }
    function hideTip() { tip.hidden = true; pinned = null; }

    /* ── keyboard: ] / [ step through the markers west → east ── */
    var live = document.createElement('div');
    live.className = 'globe3d-live'; live.setAttribute('aria-live', 'polite');
    host.appendChild(live);
    function entryFor(c) { for (var i = 0; i < screen.length; i++) if (screen[i].c === c) return screen[i]; return null; }
    function refreshPin() { if (pinned) { var e = entryFor(pinned.c); if (e) pinned = e; showTip(pinned, true); } }
    function finishAnim() { if (anim) { view.az = anim.a1; view.el = anim.e1; anim = null; draw(); } }
    function stepMarker(dir) {
      if (!clusters.length) return;
      var order = clusters.slice().sort(function (a, b) { return a.lon - b.lon || b.lat - a.lat; });
      var cur = pinned ? order.indexOf(pinned.c) : -1;
      var i = cur < 0 ? (dir > 0 ? 0 : order.length - 1) : (cur + dir + order.length) % order.length;
      var c = order[i];
      focusOn(c.lat, c.lon);
      if (reduced) draw();
      pinned = entryFor(c) || { x: CX, y: CY, r: 7, c: c };
      showTip(pinned, true);
      var head = opts.clusterTitle ? opts.clusterTitle(c.list) : (c.list.length + ' item' + (c.list.length > 1 ? 's' : ''));
      var names = c.list.slice(0, 3).map(function (p) { return p.title; }).join('; ') + (c.list.length > 3 ? '; and ' + (c.list.length - 3) + ' more' : '');
      live.textContent = head + ': ' + names + '. Place ' + (i + 1) + ' of ' + order.length + ', west to east. ' +
        (c.list.length > 1 ? 'Enter moves to the list.' : 'Enter opens it.');
    }
    canvas.addEventListener('keydown', function (e) {
      if (e.key === ']' || e.key === '.') { e.preventDefault(); interacted(); stepMarker(1); }
      else if (e.key === '[' || e.key === ',') { e.preventDefault(); interacted(); stepMarker(-1); }
      else if (e.key === 'Enter' && pinned) {
        e.preventDefault(); finishAnim();
        var c = pinned.c;
        if (c.list.length === 1) { hideTip(); if (opts.onPick) opts.onPick(c.list[0]); }
        else { refreshPin(); var b = tip.querySelector('.globe3d-row'); if (b) b.focus(); }
      }
      else if (e.key === 'Escape' && pinned) { e.preventDefault(); hideTip(); }
    });
    tip.addEventListener('keydown', function (e) {           // Esc inside a cluster list goes back to the globe
      if (e.key === 'Escape' && pinned) { e.preventDefault(); hideTip(); canvas.focus(); }
    });
    function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

    var down = null;
    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; interacted(); });
    canvas.addEventListener('pointerup', function (e) {
      if (!down) return;
      var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 5) return;                                    // it was a drag, not a click
      var s = hit(e);
      if (!s) { hideTip(); return; }
      if (s.c.list.length === 1) { hideTip(); if (opts.onPick) opts.onPick(s.c.list[0]); }
      else { pinned = s; showTip(s, true); }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (pinned || e.pointerType === 'touch') return;
      var s = hit(e);
      canvas.style.cursor = s ? 'pointer' : '';
      if (s) { hover = s; showTip(s, false); interacted(); } else if (hover) { hover = null; hideTip(); }
    });
    canvas.addEventListener('pointerleave', function () { if (!pinned) { hover = null; hideTip(); } });
    document.addEventListener('pointerdown', function (e) { if (pinned && !host.contains(e.target)) hideTip(); });

    /* ── spin, pause, focus animation ── */
    var paused = !!reduced, userIdleAt = 0, running = false, raf = 0, last = 0, visible = true, anim = null;
    var pauseBtn = opts.pauseButton || null;
    function syncBtn() {
      if (!pauseBtn) return;
      pauseBtn.hidden = !!reduced;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.textContent = paused ? '▶ Spin globe' : '❚❚ Stop spinning';
    }
    if (pauseBtn) pauseBtn.addEventListener('click', function () { paused = !paused; syncBtn(); kick(); });
    syncBtn();
    function interacted() { userIdleAt = performance.now() + 6000; }
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
      var moving = false;
      if (anim) {
        var u = Math.min(1, (now - anim.t0) / anim.dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        view.az = anim.a0 + (anim.a1 - anim.a0) * e; view.el = anim.e0 + (anim.e1 - anim.e0) * e;
        if (u >= 1) anim = null; moving = true;
      } else if (!paused && now > userIdleAt && !pinned) {
        view.az += 0.11 * dt; moving = true;
      }
      draw();
      if (pinned && !tip.contains(document.activeElement)) refreshPin();   // the card follows its marker
      if (moving && visible && !document.hidden) raf = requestAnimationFrame(frame); else { running = false; last = 0; }
    }
    function kick() { if (!raf && visible && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } }
    var resumeT = 0;
    view.onChange(function () {
      interacted();
      if (!raf) requestAnimationFrame(function () { draw(); if (pinned && !tip.contains(document.activeElement)) refreshPin(); });
      clearTimeout(resumeT); resumeT = setTimeout(kick, 6100);                  // resume the spin once the user lets go
    });

    function focusOn(lat, lon) {
      var v = viewFor(lat, lon), a0 = view.az;
      var a1 = a0 + ((((v.az - a0) % 6.2832) + 9.4248) % 6.2832 - 3.1416);   // shortest way round
      if (reduced) { view.az = a1; view.el = v.el; draw(); return; }
      anim = { t0: performance.now(), dur: 900, a0: a0, a1: a1, e0: view.el, e1: v.el };
      interacted(); kick();
    }

    function setPoints(list, o) {
      pts = list || []; cluster(); hideTip();
      if (o && o.focus && pts.length) {
        var sx = 0, sy = 0, sz = 0;
        pts.forEach(function (p) { var u = unit(p.lat, p.lon); sx += u[0]; sy += u[1]; sz += u[2]; });
        var n = Math.hypot(sx, sy, sz);
        if (n / pts.length > 0.35) focusOn(Math.asin(sz / n) / DEG, Math.atan2(sy, sx) / DEG);   // only if they're roughly in one region
      }
      draw();
    }

    if (window.ResizeObserver) new ResizeObserver(function () { if (resize()) draw(); }).observe(canvas);
    else window.addEventListener('resize', function () { if (resize()) draw(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }, { threshold: 0.05 }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    new MutationObserver(function () { draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    resize(); setPoints(opts.points || []); kick();
    return { setPoints: setPoints, focusOn: focusOn, redraw: draw, view: view };
  };

  // Shared tooltip + pause-button styles (injected once; page CSS can override)
  if (!document.getElementById('globe3d-style')) {
    var st = document.createElement('style'); st.id = 'globe3d-style';
    st.textContent =
      '.globe3d-tip{position:absolute;z-index:5;max-width:280px;background:var(--bg-card);border:1px solid var(--border-med);border-radius:10px;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.25);padding:8px;font-size:.78rem;color:var(--text-primary);pointer-events:none}' +
      '.globe3d-tip.pinned{pointer-events:auto}' +
      '.globe3d-head{font-family:var(--font-mono);font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin:0 4px 6px}' +
      '.globe3d-row{display:flex;gap:8px;align-items:flex-start;width:100%;text-align:left;background:none;border:0;border-radius:6px;padding:4px 6px;color:inherit;font:inherit;cursor:pointer}' +
      '.globe3d-row:hover,.globe3d-row:focus-visible{background:var(--bg-card-hover)}' +
      '.globe3d-row i{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:4px}' +
      '.globe3d-row small{display:block;color:var(--text-muted);font-size:.7rem}' +
      '.globe3d-more,.globe3d-hint{color:var(--text-muted);font-size:.68rem;margin:4px 6px 0}' +
      '.globe3d-tip:not(.pinned) .globe3d-row{pointer-events:none}' +
      '.globe3d-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}';
    document.head.appendChild(st);
  }
})();
