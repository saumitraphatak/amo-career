/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — orbit3d.js: drag-to-rotate for 3D figures.

   Loaded only by pages that have rotatable 3D figures (Bloch spheres,
   the tweezer-array view, the MOT view). Not part of main.js on purpose,
   so adding a page doesn't need a sitewide cache bump.

   Convention (matches the site's existing Bloch-sphere projections):
     lab frame is right-handed with z up;
     az rotates about z, el tilts the view (el > 0 = looking down from above).
     AMO3D.project(view, x, y, z) → [X right, Y up, D toward the viewer]
   With az = π/6, el = π/5 this reproduces the fixed projection every
   Bloch sphere on the site used before (so the default view is unchanged).

   AMO3D.orbit(elements, opts) attaches pointer drag, arrow keys, and
   double-click / Home to reset. Several elements can share one view
   (e.g. two spheres that should always be seen from the same angle).
   Touch: horizontal drags rotate; vertical swipes still scroll the page.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.AMO3D && window.AMO3D.orbit) return;

  var STYLE_ID = 'orbit3d-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '.orbit3d{cursor:grab;touch-action:pan-y;-webkit-user-select:none;user-select:none}' +
      '.orbit3d.orbit3d-dragging{cursor:grabbing}' +
      '.orbit3d:focus-visible{outline:2px solid var(--c-atom);outline-offset:3px;border-radius:6px}' +
      '.orbit3d-hint{display:block;margin:4px auto 0;text-align:center;font-family:var(--font-mono);' +
      'font-size:.66rem;letter-spacing:.03em;color:var(--text-muted);transition:opacity .6s;pointer-events:none}' +
      '.orbit3d-hint.gone{opacity:0}';
    document.head.appendChild(s);
  }

  var anyUsed = false, hints = [];
  function markUsed() {
    if (anyUsed) return;
    anyUsed = true;
    hints.forEach(function (h) { h.classList.add('gone'); });
  }

  function project(v, x, y, z) {
    var ca = Math.cos(v.az), sa = Math.sin(v.az), ce = Math.cos(v.el), se = Math.sin(v.el);
    var xr = x * ca - y * sa, yr = x * sa + y * ca;
    return [xr, z * ce + yr * se, z * se - yr * ce];
  }

  function orbit(targets, opts) {
    opts = opts || {};
    if (!targets) return null;
    var els = (targets.length !== undefined && !targets.nodeType) ? Array.prototype.slice.call(targets) : [targets];
    els = els.filter(Boolean);
    injectStyle();
    var home = { az: opts.az != null ? opts.az : Math.PI / 6, el: opts.el != null ? opts.el : Math.PI / 5 };
    var minEl = opts.minEl != null ? opts.minEl : -1.45, maxEl = opts.maxEl != null ? opts.maxEl : 1.45;
    var view = { az: home.az, el: home.el, version: 0 };
    var listeners = opts.onChange ? [opts.onChange] : [];

    function set(az, el) {
      view.az = az;
      view.el = Math.max(minEl, Math.min(maxEl, el));
      view.version++;
      for (var i = 0; i < listeners.length; i++) listeners[i](view);
    }
    view.reset = function () { set(home.az, home.el); };
    view.onChange = function (fn) { listeners.push(fn); };
    view.project = function (x, y, z) { return project(view, x, y, z); };

    els.forEach(function (el) {
      el.classList.add('orbit3d');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      // Keep any existing description (e.g. what a Bloch trajectory shows); just add how to rotate.
      var existing = el.getAttribute('aria-label');
      var base = existing ? existing.replace(/\s*$/, '') + ' ' : (opts.label || '3D figure') + '. ';
      el.setAttribute('aria-label', base + 'Drag, or use the arrow keys, to rotate; Home resets the view.');
      if (!el.getAttribute('role')) el.setAttribute('role', 'img');

      var drag = null;
      // Mouse: don't take focus (no focus ring after a drag) or start a text selection.
      // Keyboard users still reach the figure with Tab.
      el.addEventListener('mousedown', function (e) { e.preventDefault(); });
      el.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        drag = { x: e.clientX, y: e.clientY, az: view.az, el: view.el, id: e.pointerId };
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        el.classList.add('orbit3d-dragging');
      });
      el.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) markUsed();
        // "Grab" feel: the surface under the pointer follows it (drag right → front moves right).
        set(drag.az + dx * 0.011, drag.el + dy * 0.011);
      });
      function end(e) {
        if (!drag || (e && e.pointerId !== drag.id)) return;
        drag = null;
        el.classList.remove('orbit3d-dragging');
      }
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('lostpointercapture', end);
      el.addEventListener('dblclick', function () { markUsed(); view.reset(); });
      el.addEventListener('keydown', function (e) {
        var step = e.shiftKey ? 0.35 : 0.14, used = true;
        if (e.key === 'ArrowLeft') set(view.az - step, view.el);
        else if (e.key === 'ArrowRight') set(view.az + step, view.el);
        else if (e.key === 'ArrowUp') set(view.az, view.el + step);
        else if (e.key === 'ArrowDown') set(view.az, view.el - step);
        else if (e.key === 'Home') view.reset();
        else used = false;
        if (used) { e.preventDefault(); markUsed(); }
      });

      if (opts.hint !== false) {
        var hint = document.createElement('span');
        hint.className = 'orbit3d-hint';
        hint.setAttribute('aria-hidden', 'true');
        var touchOnly = window.matchMedia && window.matchMedia('(hover: none)').matches;
        hint.textContent = touchOnly ? '⟲ swipe sideways to rotate' : '⟲ drag to rotate · double-click to reset';
        if (opts.hintParent) opts.hintParent.appendChild(hint);
        else el.insertAdjacentElement('afterend', hint);
        hints.push(hint);
        if (anyUsed) hint.classList.add('gone');
      }
    });
    return view;
  }

  window.AMO3D = window.AMO3D || {};
  window.AMO3D.orbit = orbit;
  window.AMO3D.project = project;
})();
