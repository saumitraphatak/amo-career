// Polish the draft in a browser (DOM transforms), write index.html, then print the PDF.
// usage: node polish.js <outDir>   (expects draft.html, img/, katex/ in outDir)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const out = path.resolve(process.argv[2]);
const T = { '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.html': 'text/html' };
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
      if (grp.children.length >= 2) { const c = document.createElement('p'); c.className = 'stats-cap'; c.textContent = "Calculator output at the page's default settings."; grp.after(c); }
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
    // canvas snapshots get a caption
    body.querySelectorAll('figure.fig img[src^="img/"]').forEach(img => {
      const f = img.closest('figure'); if (f.nextElementSibling && f.nextElementSibling.classList.contains('snap')) return;
      const c = document.createElement('p'); c.className = 'snap'; c.textContent = 'Snapshot of an interactive figure at its default settings. On the website it responds to the controls.'; f.after(c);
      const w = +img.dataset.w, hh = +img.dataset.h; if (w && hh) { img.width = Math.round(w / 2); img.height = Math.round(hh / 2); }
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


// UI hints that only make sense with a mouse on the live page
function cleanHints() {
  const RX = /^\(?\s*(drag (to rotate|to turn|the sphere|on the|to pan)[^]*|double-click to reset|hover( \/ tap)? [^]*|tap datasets[^]*|hover a qubit[^]*|press run( or step)?[^]*|click two[^]*)\)?\s*\.?$/i;
  let n = 0;
  document.querySelectorAll('.ch-body p, .ch-body span, .ch-body small, .ch-body div, .ch-body figcaption, .ch-body em, .ch-body i').forEach(e => {
    if (!e.isConnected) return;
    const t = e.textContent.replace(/\s+/g, ' ').trim();
    if (t.length && t.length < 110 && !e.querySelector('img,svg,.katex,table') && RX.test(t)) { e.remove(); n++; }
  });
  // hint fragments glued into a longer text node
  const FR = /\s*(drag to rotate|drag to turn it)\s*·\s*double-click to reset\s*/gi;
  const FR2 = /\s*(\(drag to rotate\)|Drag to (rotate|turn it)[^.]*\.|Hover \/ tap datasets to isolate\.?)/g;
  const w = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT);
  for (let x; (x = w.nextNode());) { FR.lastIndex = 0; FR2.lastIndex = 0; const v = x.nodeValue.replace(FR, ' ').replace(FR2, ''); if (v !== x.nodeValue) { x.nodeValue = v; n++; } }
  return n;
}

const REPRINT = process.argv.includes('--reprint');
srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port, b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:' + port) ? r.continue() : r.abort());
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/${REPRINT ? 'index' : 'draft'}.html`, { waitUntil: 'load' });
  if (!REPRINT) await p.evaluate(transform);
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
  const pages = JSON.parse(execFileSync('python3', [path.join(__dirname, 'markers.py'), pdf]).toString());
  await pp.evaluate(pages => {
    document.querySelectorAll('[data-pg]').forEach(s => { const k = s.dataset.pg.replace(/^ch-/, ''); if (pages[k]) s.textContent = pages[k]; });
  }, pages);
  await pp.pdf(opts);
  html = '<!DOCTYPE html>\n' + await pp.evaluate(() => document.documentElement.outerHTML);
  fs.writeFileSync(path.join(out, 'index.html'), html);   // keep the PDF page numbers in the online contents too
  const pages2 = JSON.parse(execFileSync('python3', [path.join(__dirname, 'markers.py'), pdf]).toString());
  const n = execFileSync('python3', ['-c', `import pypdf;print(len(pypdf.PdfReader("${pdf}").pages))`]).toString().trim();
  console.log('pdf pages', n, 'markers', Object.keys(pages2).length, 'stable', JSON.stringify(pages) === JSON.stringify(pages2));
  await b.close(); srv.close();
});
