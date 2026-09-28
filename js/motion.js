/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — motion.js: a pause/play control for looping canvas
   animations (WCAG 2.2.2 "Pause, Stop, Hide").

   AMOMotion.loop(targets, frame, opts) runs frame(t) once per display
   frame, where t is a requestAnimationFrame-style timestamp that does
   NOT advance while paused or offscreen (so dt-based simulations resume
   where they stopped instead of jumping).

     targets   element or array — the animated canvases/SVGs; the loop
               only runs while at least one of them is on screen.
     opts.anchors  [{ el, where }] — where to put pause buttons
               (insertAdjacentElement position, default 'afterend' of
               the first target, wrapped in a small row). Several
               buttons may control one loop.
     opts.onStatic() — called once instead of animating under
               prefers-reduced-motion (default: frame(now) once).

   Under prefers-reduced-motion the loop starts paused on a still frame;
   the button still lets the reader play it deliberately.
   Loaded only by pages with looping animations (not part of main.js).
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var M = window.AMOMotion = window.AMOMotion || {};
  if (M.loop) return;
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  M.reduced = reduced;

  if (!document.getElementById('amo-motion-style')) {
    var st = document.createElement('style'); st.id = 'amo-motion-style';
    st.textContent =
      '.amo-motion-row{display:flex;justify-content:center;margin-top:.4rem}' +
      '.amo-motion-btn{font:inherit;font-size:.7rem;line-height:1.4;color:var(--text-secondary);background:transparent;' +
      'border:1px solid var(--border-med);border-radius:999px;padding:2px 10px;cursor:pointer;white-space:nowrap}' +
      '.amo-motion-btn:hover{color:var(--text-primary)}' +
      '.amo-motion-btn:focus-visible{outline:2px solid var(--c-atom);outline-offset:2px}';
    document.head.appendChild(st);
  }

  M.loop = function (targets, frame, opts) {
    opts = opts || {};
    var els = (targets && targets.length !== undefined && !targets.nodeType) ? Array.prototype.slice.call(targets) : [targets];
    els = els.filter(Boolean);
    if (!els.length || typeof frame !== 'function') return null;

    var running = !reduced, raf = 0, offset = 0, stoppedAt = null, onScreen = new Set(), buttons = [];

    function now() { return performance.now(); }
    function live() { return running && onScreen.size > 0 && !document.hidden; }
    function tick(ts) {
      raf = 0;
      if (!live()) { if (stoppedAt === null) stoppedAt = now(); return; }
      frame(ts - offset);
      raf = requestAnimationFrame(tick);
    }
    function kick() {
      if (raf || !live()) return;
      if (stoppedAt !== null) { offset += now() - stoppedAt; stoppedAt = null; }
      raf = requestAnimationFrame(tick);
    }
    function sync() {
      buttons.forEach(function (b) {
        b.textContent = running ? '❚❚ Pause animation' : '▶ Play animation';
        b.setAttribute('aria-pressed', String(!running));
      });
    }
    function toggle() {
      running = !running;
      if (!running) { if (raf) { cancelAnimationFrame(raf); raf = 0; } if (stoppedAt === null) stoppedAt = now(); }
      sync(); kick();
    }

    var anchors = opts.anchors || [{ el: els[0], where: 'afterend', row: true }];
    anchors.forEach(function (a) {
      if (!a || !a.el) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'amo-motion-btn';
      b.addEventListener('click', toggle);
      buttons.push(b);
      var node = b;
      if (a.row !== false && (a.where || 'afterend') === 'afterend' && !a.inline) {
        node = document.createElement('div'); node.className = 'amo-motion-row'; node.appendChild(b);
      }
      a.el.insertAdjacentElement(a.where || 'afterend', node);
    });
    sync();

    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) onScreen.add(e.target); else onScreen.delete(e.target); });
        kick();
      }, { threshold: 0.02 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { onScreen.add(el); });
    }
    document.addEventListener('visibilitychange', kick);

    if (reduced) { stoppedAt = now(); if (opts.onStatic) opts.onStatic(); else frame(now()); }
    else kick();

    return { toggle: toggle, isRunning: function () { return running; }, buttons: buttons };
  };
})();
