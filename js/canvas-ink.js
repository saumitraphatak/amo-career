/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — canvas-ink.js: theme-aware inks for 2D canvases that were
   drawn with the cream (light-theme) palette.

   AMOInk.wrap(ctx[, extraMap]) makes a CanvasRenderingContext2D translate
   each light-theme ink to its dark-theme counterpart as it is set
   (fillStyle, strokeStyle, shadowColor and gradient colour stops) while
   the page is in the dark theme. Drawing code keeps writing the light
   colours, so the physics and layout code never change. Colours not in
   the table (the bright accents such as #34d399) pass through unchanged.
   extraMap adds or overrides entries for one context: { '#abcdef': '#123456' }.

   AMOInk.track(frame) wraps a (dt-based) frame function so a theme toggle
   repaints the last frame (frame called again with the same timestamp,
   i.e. dt = 0), also while paused or under reduced motion.
   AMOInk.onTheme(fn) runs fn after every theme toggle.
   AMOInk.isDark() tells whether the dark theme is on.

   Opt-in per page (not part of main.js). Same table as learn-quantum's
   inline LQ_INK helper.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.AMOInk) return;

  var HEX = {
    '#faf5e9': '#0c1526',                                 // cream paper → --bg-card (dark)
    '#f2ead9': '#0c1526', '#efe7d6': '#0c1526',           // other cream fills used by older canvases
    '#7a4ff7': '#a78bfa', '#7451fa': '#a78bfa', '#7c3aed': '#a78bfa',   // violet
    '#926a03': '#fbbf24', '#8d6c02': '#fbbf24',           // amber
    '#b75404': '#fb923c', '#b45309': '#f59e0b',           // orange
    '#1c805b': '#34d399', '#15803d': '#34d399', '#0f766e': '#2dd4bf',   // green / teal
    '#076ce7': '#60a5fa', '#2563eb': '#60a5fa', '#4f72a4': '#93c5fd',   // blue
    '#e20b0b': '#f87171', '#a13c1c': '#f87171',           // red
    '#1e3a5f': 'rgba(148,163,184,0.7)', '#0f1e35': 'rgba(148,163,184,0.35)',
    '#1e293b': '#475569', '#334155': '#64748b',
    '#0b7c8d': '#22d3ee',                                 // dark teal
    '#8c8066': '#94a3b8', '#5c503c': '#94a3b8'            // brown label inks → slate
  };
  var RGB = { '122,79,247': '167,139,250', '146,106,3': '251,191,36', '183,84,4': '251,146,60',
              '37,99,235': '96,165,250', '92,80,60': '148,163,184', '28,128,91': '52,211,153',
              '30,41,59': '100,116,139', '11,124,141': '34,211,238' };

  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var repaints = [];
  new MutationObserver(function () {
    var d = document.documentElement.getAttribute('data-theme') === 'dark';
    if (d === dark) return;
    dark = d;
    repaints.forEach(function (fn) { try { fn(); } catch (e) {} });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function map(v, extra) {
    if (!dark || typeof v !== 'string') return v;
    var k = v.toLowerCase();
    if (extra && extra[k]) return extra[k];
    if (HEX[k]) return HEX[k];
    if (/^#[0-9a-f]{8}$/.test(k)) {                     // #rrggbbaa
      var m = (extra && extra[k.slice(0, 7)]) || HEX[k.slice(0, 7)];
      return m && m.length === 7 ? m + k.slice(7) : v;
    }
    return v.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/, function (s, r, g, b) {
      var n = RGB[r + ',' + g + ',' + b];
      return n ? s.slice(0, s.indexOf('(') + 1) + n : s;
    });
  }

  function wrap(ctx, extra) {
    if (!ctx || ctx.__amoInk) return ctx;
    ctx.__amoInk = true;
    var ex = null;
    if (extra) { ex = {}; Object.keys(extra).forEach(function (k) { ex[k.toLowerCase()] = extra[k]; }); }
    var proto = Object.getPrototypeOf(ctx);
    ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (prop) {
      var d = Object.getOwnPropertyDescriptor(proto, prop);
      if (!d || !d.set) return;
      Object.defineProperty(ctx, prop, {
        configurable: true,
        get: function () { return d.get.call(ctx); },
        set: function (v) { d.set.call(ctx, map(v, ex)); }
      });
    });
    ['createLinearGradient', 'createRadialGradient', 'createConicGradient'].forEach(function (fn) {
      if (typeof ctx[fn] !== 'function') return;
      var orig = ctx[fn].bind(ctx);
      ctx[fn] = function () {
        var g = orig.apply(null, arguments), add = g.addColorStop.bind(g);
        g.addColorStop = function (o, c) { add(o, map(c, ex)); };
        return g;
      };
    });
    return ctx;
  }

  function track(frame) {
    var last = null;
    repaints.push(function () { if (last !== null) frame(last); });
    return function (ts) { last = ts; frame(ts); };
  }

  window.AMOInk = {
    wrap: wrap, map: map, track: track,
    onTheme: function (fn) { repaints.push(fn); },
    isDark: function () { return dark; }
  };
})();
