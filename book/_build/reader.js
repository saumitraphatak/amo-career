/* Building with Atoms — reader script for the online edition (inlined into book/index.html by build.js).
   Theme, contents drawer, reading progress, search, figure zoom, resume reading, bookmarks, "mark as read",
   section and equation permalinks, and text size. Everything stored stays in this browser (localStorage).
   It does nothing while polish.js renders the book (window.__BOOK_BUILD__), so the saved HTML and the PDF carry
   none of the buttons it adds. Never write a closing script tag in this file. */
(function () {
  if (window.__BOOK_BUILD__) return;
  const $ = id => document.getElementById(id);
  const root = document.documentElement, book = document.querySelector('main.book'), toc = document.querySelector('.toc-side');
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clean = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();

  /* usage log, shared with the website (js/main.js keeps the same "amo-activity-log" and shows it on home.html):
     a GA4 event through the page's own gtag, plus a count in this browser. Nothing else leaves the browser. */
  function track(ev, detail) {
    const info = String(detail || '').trim().slice(0, 140), page = 'book/index.html';
    try { if (typeof window.gtag === 'function') window.gtag('event', ev, { page_path: page, asset_label: info || page }); } catch (e) {}
    const log = store.get('amo-activity-log', null) || { counts: { book_pdf_download: 0, figure_export: 0, notebook_download: 0, page_print: 0, citation_copy: 0 }, recent: [] };
    if (log.counts && Object.prototype.hasOwnProperty.call(log.counts, ev)) log.counts[ev] = (log.counts[ev] || 0) + 1;
    (log.recent = log.recent || []).unshift({ t: new Date().toISOString(), ev, page, detail: info || page });
    if (log.recent.length > 30) log.recent.length = 30;
    store.set('amo-activity-log', log);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a'); if (!a) return;
    const h = a.getAttribute('href') || '';
    if (/\.pdf(\?|#|$)/i.test(h) || a.hasAttribute('download')) track('book_pdf_download', h.split('/').pop() || 'building-with-atoms.pdf');
    else if (/\.ipynb(\?|#|$)/i.test(h) || h.includes('colab.research.google.com')) track('notebook_download', h.split('/').pop() || a.textContent.trim());
  }, true);
  window.addEventListener('beforeprint', () => track('page_print', 'Building with Atoms'));

  /* toast */
  const toastEl = $('book-toast'); let toastT = null;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1700); }

  /* theme (the site's own key, so the book follows the website) */
  const themeBtn = $('book-theme-btn');
  function syncTheme() { const d = root.getAttribute('data-theme') === 'dark'; if (themeBtn) { themeBtn.innerHTML = d ? '<span aria-hidden="true">☀️</span><span class="tb-l"> Light</span>' : '<span aria-hidden="true">🌙</span><span class="tb-l"> Dark</span>'; themeBtn.setAttribute('aria-pressed', String(d)); themeBtn.setAttribute('aria-label', d ? 'Switch to light theme' : 'Switch to dark theme'); } }
  syncTheme();
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const d = root.getAttribute('data-theme') === 'dark';
    if (d) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('amo-theme', d ? 'light' : 'dark'); } catch (e) {}
    syncTheme();
  });

  /* contents drawer, filter, "saved only" */
  const backdrop = $('toc-backdrop'), tocBtn = $('toc-toggle'), filter = $('toc-filter'), savedBtn = $('toc-saved-toggle');
  function setToc(open) { if (!toc) return; toc.classList.toggle('open', open); if (backdrop) backdrop.classList.toggle('open', open); if (tocBtn) tocBtn.setAttribute('aria-expanded', String(open)); }
  if (tocBtn) tocBtn.addEventListener('click', () => setToc(!toc.classList.contains('open')));
  if (backdrop) backdrop.addEventListener('click', () => setToc(false));
  if (toc) toc.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setToc(false)));
  let savedOnly = false;
  function applyTocFilter() {
    if (!toc) return;
    const q = filter ? filter.value.trim().toLowerCase() : '';
    toc.querySelectorAll('a.tc').forEach(a => {
      const show = (!q || a.textContent.toLowerCase().includes(q)) && (!savedOnly || a.classList.contains('is-bookmarked'));
      a.style.display = show ? '' : 'none';
    });
  }
  if (filter) filter.addEventListener('input', applyTocFilter);
  if (savedBtn) savedBtn.addEventListener('click', () => {
    savedOnly = !savedOnly; savedBtn.classList.toggle('on', savedOnly); savedBtn.setAttribute('aria-pressed', String(savedOnly));
    applyTocFilter();
    if (savedOnly && !toc.querySelector('a.tc.is-bookmarked')) toast('No bookmarked chapters yet: use ☆ Bookmark at the top of a chapter');
  });

  /* reading progress, back to top, active entry in the contents */
  const bar = $('read-progress'), topBtn = $('back-top');
  const links = toc ? [...toc.querySelectorAll('a.tc[href^="#"]')] : [];
  const secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  function onScroll() {
    const h = root.scrollHeight - window.innerHeight;
    if (bar && h > 0) bar.style.width = Math.min(100, Math.max(0, window.scrollY / h * 100)).toFixed(2) + '%';
    if (topBtn) topBtn.classList.toggle('show', window.scrollY > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  if ('IntersectionObserver' in window && secs.length) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a])); let active = null;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const a = map.get(e.target.id);
      if (a && a !== active) { if (active) active.classList.remove('is-active'); active = a; a.classList.add('is-active'); }
    }), { rootMargin: '-12% 0px -78% 0px' });
    secs.forEach(s => io.observe(s));
  }

  /* jump flash: briefly highlight whatever a link lands on */
  function flash(id) {
    const el = id && document.getElementById(id); if (!el) return;
    el.classList.remove('book-jump-flash'); void el.offsetWidth; el.classList.add('book-jump-flash');
    setTimeout(() => el.classList.remove('book-jump-flash'), 1500);
  }
  window.addEventListener('hashchange', () => flash(decodeURIComponent(location.hash.slice(1))));

  /* chapters: resume reading, bookmarks, mark as read */
  const chapters = [...document.querySelectorAll('section.chapter[id^="ch-"]')];
  const chLabel = sec => { const n = sec.querySelector('.ch-num'), h = sec.querySelector('h1'); return { n: n ? clean(n) : '', t: h ? clean(h) : '' }; };
  const pill = $('resume-pill'), last = store.get('amo-book-last', null);
  if (pill && last && document.getElementById(last)) {
    const l = chLabel(document.getElementById(last));
    pill.href = '#' + last; pill.textContent = `↺ Resume: Chapter ${l.n}${l.t ? ', ' + l.t : ''} →`; pill.classList.add('show');
  }
  let saveT = null;
  window.addEventListener('scroll', () => {
    if (window.scrollY < 700) return; clearTimeout(saveT);
    saveT = setTimeout(() => { let cur = null; for (const s of chapters) if (s.getBoundingClientRect().top <= 180) cur = s.id; if (cur) store.set('amo-book-last', cur); }, 400);
  }, { passive: true });

  const bmarks = new Set(store.get('amo-book-bookmarks', [])), read = new Set(store.get('amo-book-read', []));
  const readCount = $('toc-read-count');
  function syncToc() {
    if (toc) toc.querySelectorAll('a.tc[href^="#ch-"]').forEach(a => {
      const id = a.getAttribute('href').slice(1);
      a.classList.toggle('is-bookmarked', bmarks.has(id)); a.classList.toggle('is-read', read.has(id));
    });
    if (readCount) readCount.textContent = `${chapters.filter(s => read.has(s.id)).length} / ${chapters.length} chapters read`;
    applyTocFilter();
  }
  chapters.forEach(sec => {
    const l = chLabel(sec), comp = sec.querySelector('.ch-companion');
    if (comp) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ch-bmark-btn screen-only';
      const upd = () => { const on = bmarks.has(sec.id); b.classList.toggle('on', on); b.textContent = on ? '★ Bookmarked' : '☆ Bookmark'; b.setAttribute('aria-pressed', String(on)); };
      b.addEventListener('click', () => { bmarks.has(sec.id) ? bmarks.delete(sec.id) : bmarks.add(sec.id); store.set('amo-book-bookmarks', [...bmarks]); upd(); syncToc(); toast(bmarks.has(sec.id) ? `Chapter ${l.n} bookmarked` : 'Bookmark removed'); });
      upd(); comp.appendChild(b);
    }
    const end = sec.querySelector('.ch-next-bridge') || null;
    const rb = document.createElement('div'); rb.className = 'ch-read-bar screen-only';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ch-mark-read';
    const upd = () => { const done = read.has(sec.id); btn.classList.toggle('done', done); btn.textContent = done ? `✓ Chapter ${l.n} read` : `Mark Chapter ${l.n} as read`; btn.setAttribute('aria-pressed', String(done)); };
    btn.addEventListener('click', () => { read.has(sec.id) ? read.delete(sec.id) : read.add(sec.id); store.set('amo-book-read', [...read]); upd(); syncToc(); });
    upd(); rb.appendChild(btn);
    if (end) end.before(rb); else sec.appendChild(rb);
  });
  syncToc();

  /* permalinks: § on every numbered section, click an equation number to copy its link */
  function copyLink(id, label) {
    const url = location.origin + location.pathname + '#' + id;
    history.replaceState(null, '', '#' + id);
    track('citation_copy', label);
    const done = () => toast('Copied link to ' + label), fail = () => toast('Link: #' + id);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, fail); else fail();
  }
  if (book) {
    book.querySelectorAll('h2[id][data-num]').forEach(h => {
      const a = document.createElement('a'); a.href = '#' + h.id; a.className = 'sec-anchor screen-only'; a.textContent = '§';
      a.setAttribute('aria-label', `Copy link to section ${h.dataset.num}`); a.title = 'Copy link to this section';
      a.addEventListener('click', e => { e.preventDefault(); copyLink(h.id, 'section ' + h.dataset.num); });
      h.appendChild(a);
    });
    book.querySelectorAll('.eq-wrap[id] .eq-num').forEach(sp => {
      sp.title = 'Copy link to equation ' + clean(sp); sp.setAttribute('role', 'button'); sp.tabIndex = 0;
      const go = () => copyLink(sp.closest('.eq-wrap').id, 'equation ' + clean(sp));
      sp.addEventListener('click', go); sp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  /* text size */
  const dec = $('book-font-dec'), inc = $('book-font-inc');
  let scale = +store.get('amo-book-scale', 100); if (!(scale >= 88 && scale <= 124)) scale = 100;
  const applyScale = () => { if (book) book.style.fontSize = scale === 100 ? '' : scale + '%'; };
  applyScale();
  const setScale = d => { scale = Math.max(88, Math.min(124, scale + d)); applyScale(); store.set('amo-book-scale', scale); toast('Text size ' + scale + '%'); };
  if (dec) dec.addEventListener('click', () => setScale(-6));
  if (inc) inc.addEventListener('click', () => setScale(6));

  /* figure zoom */
  const lb = $('fig-lightbox'), stage = $('fig-lightbox-stage'), cap = $('fig-lightbox-cap'), lbClose = $('fig-lightbox-close');
  let lbReturn = null;
  function closeLb() { if (!lb || !lb.classList.contains('open')) return; lb.classList.remove('open'); stage.innerHTML = ''; if (document.activeElement && lb.contains(document.activeElement)) document.activeElement.blur(); if (lbReturn) lbReturn.focus({ preventScroll: true }); }
  if (lb && stage && cap && book) {
    book.querySelectorAll('figure.fig > img, figure.svgfig > svg').forEach(el => {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Enlarge figure');
      const open = () => {
        const clone = el.cloneNode(true); clone.removeAttribute('width'); clone.removeAttribute('height'); clone.removeAttribute('tabindex'); clone.removeAttribute('role');
        clone.querySelectorAll && clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
        stage.innerHTML = ''; stage.appendChild(clone);
        const fc = el.closest('figure').querySelector('figcaption'); cap.textContent = fc ? clean(fc) : (el.getAttribute('alt') || 'Figure');
        lbReturn = el; lb.classList.add('open'); if (lbClose) lbClose.focus();
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    if (lbClose) lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  }

  /* search: an index of chapters, sections, figures, tables, equations' sections, glossary, formulas and index terms */
  const modal = $('book-search-modal'), input = $('book-search-input'), results = $('book-search-results'), searchBtn = $('book-search-btn');
  let IDX = null, hits = [], sel = -1, searchReturn = null;
  function buildIndex() {
    IDX = [];
    const add = (kind, title, href, text, w) => { if (title && href) IDX.push({ kind, title, href, text: text || '', w, hay: (kind + ' ' + title + ' ' + (text || '')).toLowerCase() }); };
    const chOf = el => { const s = el.closest('section.chapter[id^="ch-"]'); return s ? 'Ch. ' + chLabel(s).n + ' · ' : ''; };
    chapters.forEach(s => { const l = chLabel(s), lead = s.querySelector('.ch-lead'); add('Chapter ' + l.n, l.t, '#' + s.id, clean(lead), 6); });
    document.querySelectorAll('section.part[id], section.appx[id], section.front[id], #prologue').forEach(s => { const h = s.querySelector('h1'); if (h) add(s.classList.contains('appx') ? 'Appendix' : s.classList.contains('part') ? 'Part' : 'Front matter', clean(h).replace(/^[A-I] · /, ''), '#' + s.id, '', 5); });
    if (book) book.querySelectorAll('h2[id][data-num], h3[id]').forEach(h => { let n = h.nextElementSibling; while (n && !/^(P|UL|OL)$/.test(n.tagName) && n.nextElementSibling && !/^H[1-3]$/.test(n.tagName)) n = n.nextElementSibling; add((h.dataset.num ? 'Section ' + h.dataset.num : chOf(h) + 'Section'), clean(h).replace(/§$/, ''), '#' + h.id, n && /^(P|UL|OL)$/.test(n.tagName) ? clean(n).slice(0, 220) : '', 4); });
    document.querySelectorAll('figure[id] figcaption.fig-cap').forEach(fc => { const num = fc.querySelector('.fig-num'); add(num ? clean(num) : 'Figure', clean(fc).replace(clean(num), '').replace(/Snapshot at the default settings;.*$/, '').trim(), '#' + fc.closest('figure').id, '', 3); });
    document.querySelectorAll('p.tab-cap').forEach(tc => { const t = tc.nextElementSibling && (tc.nextElementSibling.matches('table') ? tc.nextElementSibling : tc.nextElementSibling.querySelector('table')); const num = tc.querySelector('.fig-num'); if (t && t.id) add(num ? clean(num) : 'Table', clean(tc).replace(clean(num), '').trim() || clean(num), '#' + t.id, clean(t).slice(0, 160), 3); });
    document.querySelectorAll('.glossary-dl dt').forEach(dt => add('Glossary', clean(dt), '#' + (dt.id || 'appx-glossary'), clean(dt.nextElementSibling), 5));
    document.querySelectorAll('.formula-sheet-group tr').forEach(tr => { const c = tr.querySelectorAll('td'); if (c.length >= 3) add('Formula', clean(c[0]), '#appx-formulas', clean(c[1]) + ' · ' + clean(c[2]), 4); });
    document.querySelectorAll('.ix-e').forEach(e => { const a = e.querySelector('.ix-pg a'); if (a) add('Index', e.dataset.term || clean(e), a.getAttribute('href'), 'pages ' + clean(e.querySelector('.ix-pg')), 2); });
  }
  function hl(s, words) { let out = esc(s); words.forEach(w => { if (w.length > 1) out = out.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return out; }
  function runSearch() {
    if (!IDX) buildIndex();
    const q = input.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    sel = -1;
    if (!words.length) { hits = []; results.innerHTML = '<p class="book-search-snip" style="padding:10px 12px">Search chapters, sections, figures, tables, the glossary, the formula sheet and the index. Press <kbd>/</kbd> anywhere to open this.</p>'; return; }
    hits = IDX.filter(e => words.every(w => e.hay.includes(w))).map(e => {
      const t = e.title.toLowerCase(); let s = e.w;
      if (t === q) s += 12; else if (t.startsWith(q)) s += 8; else if (t.includes(q)) s += 5;
      words.forEach(w => { if (t.includes(w)) s += 2; });
      return { e, s };
    }).sort((a, b) => b.s - a.s).slice(0, 40).map(x => x.e);
    results.innerHTML = hits.length ? hits.map((e, i) => `<a class="book-search-item" href="${esc(e.href)}" data-i="${i}"><div class="book-search-meta">${esc(e.kind)}</div><div class="book-search-title">${hl(e.title, words)}</div>${e.text ? `<div class="book-search-snip">${hl(e.text.slice(0, 180), words)}</div>` : ''}</a>`).join('')
      : `<p class="book-search-snip" style="padding:10px 12px">Nothing matches “${esc(input.value.trim())}”.</p>`;
  }
  function openSearch() { if (!modal) return; searchReturn = document.activeElement; modal.classList.add('open'); input.value = ''; input.focus(); runSearch(); }
  function closeSearch() { if (!modal || !modal.classList.contains('open')) return; modal.classList.remove('open'); if (document.activeElement && modal.contains(document.activeElement)) document.activeElement.blur(); if (searchReturn && searchReturn !== document.body && searchReturn.focus) searchReturn.focus(); }
  function go(href) { closeSearch(); setToc(false); if (location.hash === href) flash(href.slice(1)); location.hash = href; }
  if (modal && input && results) {
    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    input.addEventListener('input', runSearch);
    results.addEventListener('click', e => { const a = e.target.closest('a.book-search-item'); if (a) { e.preventDefault(); go(a.getAttribute('href')); } });
    modal.addEventListener('click', e => { if (e.target === modal) closeSearch(); });
    modal.addEventListener('keydown', e => {
      const items = [...results.querySelectorAll('a.book-search-item')];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!items.length) return;
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[sel].focus();
      } else if (e.key === 'Enter' && document.activeElement === input && items[0]) { e.preventDefault(); go(items[0].getAttribute('href')); }
    });
  }

  /* keyboard: / or Ctrl/Cmd+K opens search, Escape closes whatever is open */
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openSearch(); return; }
    if (e.key === 'Escape') { closeSearch(); closeLb(); setToc(false); }
  });
})();
