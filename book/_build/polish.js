// Polish the draft in a browser (DOM transforms), write index.html, then print the PDF.
// usage: node polish.js <outDir>   (expects draft.html, img/, katex/ in outDir)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const out = path.resolve(process.argv[2]);
const T = { '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.html': 'text/html' };
const srv = http.createServer((q, r) => {
  const p = path.join(out, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(p)] || 'application/octet-stream' }); r.end(b); });
});

function transform() {
  const SITE = 'https://amotoolkit.com/pages/';
  const emo = /^[\p{Extended_Pictographic}☀-➿️‍\s]+/u;
  document.querySelectorAll('.chapter[data-key]').forEach(ch => {
    const key = ch.dataset.key, no = ch.querySelector('.ch-num').textContent.trim(), body = ch.querySelector('.ch-body');
    // headings: drop the page's own numbering and leading emoji, number sections n.m
    let s = 0;
    body.querySelectorAll('h2,h3,h4,h5').forEach(h => {
      h.innerHTML = h.innerHTML.replace(/^\s*(?:\d{1,2}[.)]?|[①-⑳]|Step \d+:?)\s+/, '');
      const txt = h.textContent.replace(emo, '');
      if (h.firstChild && h.firstChild.nodeType === 3) h.firstChild.nodeValue = h.firstChild.nodeValue.replace(emo, '');
      if (!h.textContent.trim()) h.remove();
    });
    body.querySelectorAll('h2').forEach(h => h.setAttribute('data-num', `${no}.${++s}`));
    // empty blocks
    body.querySelectorAll('p,div.card,aside,li').forEach(e => { if (!e.textContent.trim() && !e.querySelector('img,svg,.katex,.ctl')) e.remove(); });
    // group stat chips
    const stats = [...body.querySelectorAll('.stat')];
    for (const st of stats) {
      if (st.parentElement.classList.contains('stats')) continue;
      const grp = document.createElement('div'); grp.className = 'stats';
      st.before(grp);
      let n = st; while (n && n.classList && n.classList.contains('stat')) { const nx = n.nextElementSibling; grp.appendChild(n); n = nx; }
    }
    // control markers → one "interactive" note per run
    const ctls = [...body.querySelectorAll('p.ctl')];
    let last = null;
    for (const m of ctls) {
      const prev = m.previousElementSibling;
      if (last && (prev === last || (prev && prev.classList.contains('ctl')))) { m.remove(); continue; }
      const ia = document.createElement('div'); ia.className = 'ia';
      ia.innerHTML = `<span><b>Interactive on the website.</b> The controls for this calculator or figure are on <a href="${SITE}${key}.html">${SITE.replace('https://', '')}${key}.html</a>; the numbers and figures below are its output at the default settings.</span>`;
      m.replaceWith(ia); last = ia;
    }
    body.querySelectorAll('.ia + .ia').forEach(x => x.remove());
    // canvas snapshots get a caption (bookish() turns it into the numbered figure caption); pages whose canvases are dark get a dark frame
    const DARK_FIGS = new Set(['atom-processor', 'virtual-lab', 'vacuum-systems']);
    body.querySelectorAll('figure.fig img[src^="img/"]').forEach(img => {
      const f = img.closest('figure'); if (DARK_FIGS.has(key)) f.classList.add('fig-dark');
      if (f.nextElementSibling && f.nextElementSibling.classList.contains('snap')) return;
      const c = document.createElement('p'); c.className = 'snap'; c.textContent = 'Snapshot of an interactive figure at its default settings. On the website it responds to the controls.'; f.after(c);
      const w = +img.dataset.w, hh = +img.dataset.h; if (w && hh) { img.width = Math.round(w / 2); img.height = Math.round(hh / 2); }
    });
    // numbered display equations (n.m)
    let eqN = 0;
    body.querySelectorAll('.math, :scope > .katex-display').forEach(m => {
      if (m.closest('.eq-wrap')) return;
      const w = document.createElement('div'); w.className = 'eq-wrap';
      m.before(w); w.appendChild(m);
      const num = document.createElement('span'); num.className = 'eq-num'; num.textContent = `(${no}.${++eqN})`;
      w.appendChild(num);
    });
    // ids inside inlined SVG figures (arrow markers, gradients) are unique per page on the site but collide
    // once every page is in one document; namespace them per figure and rewrite the references.
    body.querySelectorAll('svg').forEach((svg, si) => {
      const ids = [...svg.querySelectorAll('[id]')].map(e => e.id); if (!ids.length) return;
      const map = Object.fromEntries(ids.map(id => [id, `${key}-f${si}-${id}`]));
      svg.querySelectorAll('[id]').forEach(e => { e.id = map[e.id]; });
      const fix = v => v.replace(/url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/g, (m, id) => map[id] ? `url(#${map[id]})` : m);
      svg.querySelectorAll('*').forEach(e => { for (const at of [...e.attributes]) {
        if (/^(xlink:)?href$/.test(at.name) && at.value.startsWith('#') && map[at.value.slice(1)]) e.setAttribute(at.name, '#' + map[at.value.slice(1)]);
        else if (at.value.includes('url(')) e.setAttribute(at.name, fix(at.value));
      } });
    });
    // long formulas scroll sideways on screen instead of widening the page
    body.querySelectorAll('.katex').forEach(k => { const h = k.querySelector('.katex-html'); if (h && h.textContent.length > 70) k.classList.add('katex-wide'); });
    // repeated identical paragraphs
    let prevT = '';
    body.querySelectorAll(':scope > p').forEach(p => { const t = p.textContent.trim(); if (t && t === prevT) p.remove(); prevT = t; });
    // trailing headings with nothing after them
    body.querySelectorAll('h2,h3,h4,h5').forEach(h => { let n = h.nextElementSibling; if (!n || /^H[2-5]$/.test(n.tagName) && +n.tagName[1] <= +h.tagName[1]) h.remove(); });
  });
}


// Edition 1.1: numbered figures and tables with captions, calculator readouts as worked examples, wide tables.
function bookish() {
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const n = { fig: 0, tab: 0, ex: 0 };
  document.querySelectorAll('section.chapter').forEach(ch => {
    const numEl = ch.querySelector('.ch-num'), num = numEl ? numEl.textContent.trim() : (ch.id.startsWith('prologue') ? 'P' : null);
    if (!num) return;                                                  // the course section has its own tables
    const body = ch.querySelector('.ch-body') || ch, key = ch.dataset.key;
    let f = 0, t = 0;
    const heading = el => {                                            // nearest heading above an element, within its chapter
      let x = el;
      for (let k = 0; k < 40 && x && x !== body; k++) {
        if (x.previousElementSibling) { x = x.previousElementSibling; if (/^H[2-5]$/.test(x.tagName)) return x.textContent.trim(); const hs = x.querySelectorAll ? x.querySelectorAll('h2,h3,h4,h5') : []; if (hs.length) return hs[hs.length - 1].textContent.trim(); }
        else x = x.parentElement;
      }
      return '';
    };
    body.querySelectorAll('figure.fig, figure.svgfig').forEach(fig => {
      if (fig.closest('figure') !== fig) return;
      f++; n.fig++; fig.id = fig.id || `fig-${num}-${f}`;
      const sv = fig.querySelector(':scope > svg[viewBox]'); if (sv && +sv.getAttribute('viewBox').split(/[\s,]+/)[2] <= 240) { fig.classList.add('svg-small'); n.small = (n.small || 0) + 1; }
      const own = fig.querySelector('figcaption'), snap = fig.nextElementSibling && fig.nextElementSibling.classList.contains('snap') ? fig.nextElementSibling : null;
      const h = heading(fig);
      let text = own ? own.innerHTML.trim() : '';
      if (!text) text = h ? esc(h) + '.' : '';
      const live = key ? `https://amotoolkit.com/pages/${key}.html${fig.dataset.anchor ? '#' + fig.dataset.anchor : ''}` : '';
      if (snap) text += (text ? ' ' : '') + `<span class="fig-live">Snapshot at the default settings; ${live ? `<a href="${live}">interactive on the website</a>` : 'interactive on the website'}.</span>`;
      if (own) own.remove(); if (snap) snap.remove();
      const fc = document.createElement('figcaption'); fc.className = 'fig-cap'; fc.innerHTML = `<span class="fig-num">Figure ${num}.${f}</span>${text}`;
      fig.appendChild(fc);
    });
    body.querySelectorAll('table').forEach(tb => {
      if (tb.closest('figure, .stats, .worked-ex, .ch-end')) return;
      t++; n.tab++;
      const cols = Math.max(0, ...[...tb.rows].map(r => [...r.cells].reduce((a, c) => a + (c.colSpan || 1), 0)));
      if (cols >= 7) tb.classList.add('wide');
      const wrap = tb.closest('.tablewrap') || tb, h = heading(wrap);
      const cap = document.createElement('p'); cap.className = 'tab-cap'; cap.innerHTML = `<span class="fig-num">Table ${num}.${t}</span>${h ? esc(h) : ''}`;
      wrap.before(cap);
    });
    body.querySelectorAll('.card, .ia').forEach(c => { if (c.querySelectorAll('figure').length >= 2 || c.textContent.length > 1800) { c.classList.add('long'); n.long = (n.long || 0) + 1; } });   // too big to keep on one page
    if (key) body.querySelectorAll('.stats').forEach(st => {
      if (st.closest('.worked-ex') || st.children.length < 2) return;
      // only number panels: every chip carries a figure, none is a link card or a numbered step
      const chips = [...st.children];
      if (st.querySelector('a') || !chips.every(c => /\d/.test(c.textContent) && !/^\s*0\d(?!\d)/.test(c.textContent))) return;
      n.ex++;
      const cap = st.nextElementSibling && st.nextElementSibling.classList.contains('stats-cap') ? st.nextElementSibling : null;
      const box = document.createElement('div'); box.className = 'worked-ex';
      box.innerHTML = `<div class="worked-ex-head"><span>Key numbers</span><span class="worked-ex-note"><a href="https://amotoolkit.com/pages/${key}.html">Live version on the website</a></span></div>`;
      st.before(box); box.appendChild(st); if (cap) cap.remove();
    });
  });
  return n;
}

// UI hints that only make sense with a mouse on the live page
function cleanHints() {
  const RX = /^\(?\s*(drag (to rotate|to turn|the sphere|the sliders?|on the|to pan)[^]*|double-click to reset|hover( \/ tap)? [^]*|tap datasets[^]*|hover a qubit[^]*|press run( or step)?[^]*|click two[^]*)\)?\s*\.?$/i;
  let n = 0;
  document.querySelectorAll('.ch-body p, .ch-body span, .ch-body small, .ch-body div, .ch-body figcaption, .ch-body em, .ch-body i').forEach(e => {
    if (!e.isConnected) return;
    const t = e.textContent.replace(/\s+/g, ' ').trim();
    if (t.length && t.length < 110 && !e.querySelector('img,svg,.katex,table') && RX.test(t)) { e.remove(); n++; }
  });
  document.querySelectorAll('em').forEach(e => { if (!e.textContent.trim() && !e.children.length) { e.remove(); n++; } });
  // a link in the text to another chapter's page goes to that chapter in the book (a link to the chapter's own page stays live)
  const chNums = new Map([...document.querySelectorAll('section.chapter[data-key]')].map(s => [s.dataset.key, s.querySelector('.ch-num')?.textContent.trim()]));
  document.querySelectorAll('.ch-body p a[href*="/pages/"], .ch-body li a[href*="/pages/"]').forEach(a => {
    if (a.closest('.ia, .ch-companion')) return;
    const m = (a.getAttribute('href') || '').match(/\/pages\/([a-z0-9-]+)\.html(?:#[^"]*)?$/), own = a.closest('section.chapter[data-key]');
    if (m && chNums.has(m[1]) && !(own && own.dataset.key === m[1])) {
      a.setAttribute('href', `#ch-${m[1]}`);
      if (!/\bCh\.\s*\d+/i.test(a.textContent)) a.append(` (Ch. ${chNums.get(m[1])})`);
      n++;
    }
  });
  // hint fragments glued into a longer text node, and the website's "this page" phrasing
  const FR = /\s*(drag to rotate|drag to turn it)\s*·\s*double-click to reset\s*/gi;
  const FR2 = /\s*(\(drag to rotate\)|Drag to (rotate|turn it)[^.]*\.|Hover \/ tap datasets to isolate\.?|Press Run or Step\.?)/g;
  const w = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT);
  for (let x; (x = w.nextNode());) {
    FR.lastIndex = 0; FR2.lastIndex = 0;
    const v = x.nodeValue.replace(FR, ' ').replace(FR2, '')
      .replace(/\bon this page\b/gi, m => m[0] === 'O' ? 'In this chapter' : 'in this chapter')
      .replace(/\bthis page's\b/gi, m => m[0] === 'T' ? "This chapter's" : "this chapter's")
      .replace(/\bthis page\b/gi, m => m[0] === 'T' ? 'This chapter' : 'this chapter');
    if (v !== x.nodeValue) { x.nodeValue = v; n++; }
  }
  return n;
}

const REPRINT = process.argv.includes('--reprint');
srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port, b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:' + port) ? r.continue() : r.abort());
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/${REPRINT ? 'index' : 'draft'}.html`, { waitUntil: 'load' });
  if (!REPRINT) { await p.evaluate(transform); console.log('bookish', JSON.stringify(await p.evaluate(bookish))); }
  console.log('hints removed', await p.evaluate(cleanHints));
  let html = '<!DOCTYPE html>\n' + await p.evaluate(() => document.documentElement.outerHTML);
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log('patch', execFileSync('node', [path.join(__dirname, 'patch.js'), path.join(out, 'index.html')]).toString().trim());
  console.log('index.html', Math.round(html.length / 1024), 'KB');

  // PDF pass 1 → page numbers of every marker → fill the contents → pass 2
  const pdf = path.join(out, 'building-with-atoms.pdf');
  const footer = `<div style="width:100%;font:7.5px Inter,sans-serif;color:#8a8275;padding:0 0.72in;display:flex;justify-content:space-between"><span>Building with Atoms · amotoolkit.com</span><span class="pageNumber"></span></div>`;
  const opts = { path: pdf, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, outline: true, tagged: true };
  const pp = await ctx.newPage();
  await pp.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
  await pp.emulateMedia({ media: 'print' });
  await pp.evaluate(() => document.querySelectorAll('img[loading]').forEach(i => i.loading = 'eager'));
  await pp.waitForTimeout(1500);
  await pp.pdf(opts);
  const scan = () => JSON.parse(execFileSync('python3', [path.join(__dirname, 'index.py'), pdf, path.join(__dirname, 'index-terms.json')], { maxBuffer: 1 << 26 }).toString());
  const r1 = scan(), pages = r1.markers;
  await pp.evaluate(({ pages, index }) => {
    document.querySelectorAll('[data-pg]').forEach(s => { const k = s.dataset.pg.replace(/^ch-/, ''); if (pages[k]) s.textContent = pages[k]; });
    // index: page numbers, each linked (online) to the chapter or section that contains that page
    const starts = Object.entries(pages).filter(([k]) => !/^part-/.test(k)).sort((a, b) => a[1] - b[1]);
    const where = pg => { let id = null; for (const [k, v] of starts) if (v <= pg) id = k; return !id ? '#contents' : id === 'prologue' || /^appx-/.test(id) ? '#' + id : '#ch-' + id; };
    const compact = ps => ps.map((p, i) => [p, ps[i + 1] === p + 1]);
    document.querySelectorAll('.ix-e').forEach(e => {
      const ps = index[e.dataset.term]; const span = e.querySelector('.ix-pg');
      if (!ps || !ps.length) { e.remove(); return; }
      span.innerHTML = ps.map(p => `<a href="${where(p)}">${p}</a>`).join(', ');
    });
  }, { pages, index: r1.index });
  await pp.pdf(opts);
  html = '<!DOCTYPE html>\n' + await pp.evaluate(() => document.documentElement.outerHTML);
  fs.writeFileSync(path.join(out, 'index.html'), html);   // keep the PDF page numbers in the online contents too
  const pages2 = scan().markers;
  // smaller file for phones: object streams, maximum Flate, linearized for fast first-page display (qpdf, if installed)
  try {
    const before = fs.statSync(pdf).size;
    execFileSync('qpdf', ['--object-streams=generate', '--recompress-flate', '--compression-level=9', '--linearize', pdf, pdf + '.tmp']);
    fs.renameSync(pdf + '.tmp', pdf);
    console.log('qpdf', (before / 1e6).toFixed(1), '→', (fs.statSync(pdf).size / 1e6).toFixed(1), 'MB');
  } catch (e) { console.log('qpdf not available or failed; PDF left as printed'); }
  const n = execFileSync('python3', ['-c', `import pypdf;print(len(pypdf.PdfReader("${pdf}").pages))`]).toString().trim();
  console.log('pdf pages', n, 'markers', Object.keys(pages2).length, 'stable', JSON.stringify(pages) === JSON.stringify(pages2));
  await b.close(); srv.close();
});
