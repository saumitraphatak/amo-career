// Extract each site page into simplified, book-ready HTML.
// usage: node extract.js <siteDir> <outDir> [page,page,...]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [dir0, out0, only] = process.argv.slice(2);
const dir = path.resolve(dir0), outDir = path.resolve(out0);
// Dependencies: Playwright, KaTeX and Chart.js (npm), resolved from node_modules; override with KATEX_DIST / CHARTJS_UMD.
const tryResolve = (...ids) => { for (const id of ids) { try { return require.resolve(id); } catch (e) {} } return null; };
const KATEX = process.env.KATEX_DIST || path.dirname(tryResolve('katex/dist/katex.min.js', '/opt/npm-tools/node_modules/katex/dist/katex.min.js') || '.');
const CHART = process.env.CHARTJS_UMD || tryResolve('chart.js/dist/chart.umd.js', 'chart.js/dist/chart.umd.min.js') || path.resolve(__dirname, '../vendor/chart.umd.js');
if (!fs.existsSync(path.join(KATEX, 'katex.min.js')) || !fs.existsSync(CHART)) { console.error('Need KaTeX and Chart.js: npm i katex chart.js (or set KATEX_DIST / CHARTJS_UMD)'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const T = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  const p = path.join(dir, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, b) => {
    if (e) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': T[path.extname(p)] || 'text/html' });
    r.end(p.endsWith('.html') ? b.toString().replace(/ integrity="[^"]*"/g, '') : b);
  });
});

// ── runs inside the page ──
function extractInPage(origin) {
  const SITE = 'https://amotoolkit.com/pages/';
  const SKIP_SEL = 'script,style,noscript,template,button,input,select,textarea,option,nav,footer,iframe,' +
    '.page-playbook-panel,.cite-panel,.feedback-panel,.reference-trail-panel,.story-trail,.see-also,.related-tools,' +
    '.topic-nav,.tnav,.sr-only,.visually-hidden,.skip-link,.notebook-actions,.paper-tool-bridge,.live-fab,.export-btn,' +
    '.copy-btn,.cs-copy,.tooltip,.tip-bubble,.page-hero-anim,[data-book="skip"]';
  const INLINE = new Set(['A', 'B', 'STRONG', 'I', 'EM', 'CODE', 'KBD', 'SUB', 'SUP', 'SPAN', 'SMALL', 'MARK', 'ABBR', 'TIME', 'Q', 'U', 'S', 'DEL', 'INS', 'VAR', 'SAMP', 'CITE', 'DFN', 'LABEL', 'BR', 'WBR']);
  const images = []; let imgN = 0;
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const absHref = h => {
    if (!h) return null;
    if (/^(mailto:|javascript:)/.test(h)) return null;
    if (/^https?:/.test(h)) return h.replace(/^http:\/\/127\.0\.0\.1:\d+\/pages\//, SITE).replace(/^http:\/\/127\.0\.0\.1:\d+\//, 'https://amotoolkit.com/');
    if (h.startsWith('#')) return SITE + location.pathname.split('/').pop() + h;
    if (h.startsWith('../')) return 'https://amotoolkit.com/' + h.slice(3);
    return SITE + h;
  };
  const visible = el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden'; };
  function isBlank(cv) {
    try {
      const w = cv.width, h = cv.height; if (w < 40 || h < 30) return true;
      const ctx = cv.getContext('2d'); if (!ctx) return false;
      const d = ctx.getImageData(0, 0, w, h).data;
      const r0 = d[0], g0 = d[1], b0 = d[2], a0 = d[3];
      let alphaN = 0, diffN = 0;
      for (let i = 0; i < d.length; i += 4 * 97) {
        if (d[i + 3] > 10) alphaN++;
        if (Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) + Math.abs(d[i + 3] - a0) > 24) {
          diffN++;
          if (diffN > 12) return false;
        }
      }
      return alphaN <= 8 || diffN <= 12;
    } catch (e) { return false; }
  }
  const SVG_PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-weight', 'font-family', 'font-style', 'text-anchor', 'dominant-baseline'];
  function svgOut(svg) {
    const r = svg.getBoundingClientRect();
    if (r.width < 60 || r.height < 40) return '';
    const clone = svg.cloneNode(true);
    const src = svg.querySelectorAll('*'), dst = clone.querySelectorAll('*');
    for (let i = 0; i < src.length; i++) {
      const cs = getComputedStyle(src[i]); let st = '';
      for (const p of SVG_PROPS) { const v = cs.getPropertyValue(p); if (v && v !== 'normal') st += p + ':' + v + ';'; }
      if (cs.display === 'none') st += 'display:none;';
      dst[i].setAttribute('style', st); dst[i].removeAttribute('class');
      [...dst[i].attributes].forEach(a => { if (/^on/.test(a.name) || a.name === 'tabindex' || a.name === 'role') dst[i].removeAttribute(a.name); });
    }
    clone.removeAttribute('class'); clone.removeAttribute('style'); clone.removeAttribute('id');
    if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${Math.round(r.width)} ${Math.round(r.height)}`);
    clone.removeAttribute('width'); clone.removeAttribute('height');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // keep <title>/<desc> for accessibility; drop scripts/styles that reference page classes
    clone.querySelectorAll('style,script').forEach(n => n.remove());
    return `<figure class="fig svgfig" style="--ar:${(r.width / r.height).toFixed(3)}">${clone.outerHTML}</figure>`;
  }
  function canvasOut(cv) {
    if (!visible(cv) || isBlank(cv)) return '';
    try {
      const url = cv.toDataURL('image/png'); const id = 'img' + (++imgN);
      images.push({ id, url, w: cv.width, h: cv.height });
      const label = cv.getAttribute('aria-label') || '';
      return `<figure class="fig"><img data-img="${id}" alt="${esc(label)}" width="${cv.width}" height="${cv.height}"></figure>`;
    } catch (e) { return ''; }
  }
  function inline(node) {
    if (node.nodeType === 3) return esc(node.nodeValue);
    if (node.nodeType !== 1) return '';
    const el = node;
    if (el.matches(SKIP_SEL)) return '';
    if (el.classList.contains('katex') || el.classList.contains('katex-display')) {
      const k = el.querySelector('.katex-html') ? el.outerHTML : ''; return k;
    }
    if (!visible(el) && el.tagName !== 'BR') return '';
    const tag = el.tagName, inner = () => [...el.childNodes].map(inline).join('');
    switch (tag) {
      case 'BR': return '<br>';
      case 'A': { const h = absHref(el.getAttribute('href')); const t = inner(); return h ? `<a href="${h}">${t}</a>` : t; }
      case 'B': case 'STRONG': return `<strong>${inner()}</strong>`;
      case 'I': case 'EM': case 'CITE': case 'VAR': case 'DFN': return `<em>${inner()}</em>`;
      case 'CODE': case 'KBD': case 'SAMP': return `<code>${inner()}</code>`;
      case 'SUB': return `<sub>${inner()}</sub>`;
      case 'SUP': return `<sup>${inner()}</sup>`;
      case 'svg': case 'SVG': return '';
      case 'IMG': return '';
      case 'LABEL': return el.querySelector('input,select,textarea') ? '' : inner();
      default: {
        let t = inner();
        const disp = getComputedStyle(el).display;
        if (t && disp !== 'inline' && disp !== 'contents') t = ' ' + t + ' ';
        if (el.classList.contains('source-tag') || el.classList.contains('badge') || el.classList.contains('chip') || el.classList.contains('te-tag')) return t ? ` <span class="tag">${t}</span> ` : '';
        if (el.classList.contains('mono') || el.classList.contains('val') || el.classList.contains('v')) return t ? `<span class="mono">${t}</span>` : '';
        return t;
      }
    }
  }
  const isInlineNode = n => n.nodeType === 3 || (n.nodeType === 1 && ((n.classList.contains('katex') && !n.closest('.katex-display')) || (INLINE.has(n.tagName) && !n.querySelector('div,p,ul,ol,table,svg,canvas,h1,h2,h3,h4,h5,h6,figure,section,details') && !n.classList.contains('katex-display'))));
  const BOXRE = /(note|warn|tip|callout|insight|mistake|concept|key-|keybox|caution|danger|alert|info-box|takeaway|pitfall|assumption|explain)/i;
  const CARDRE = /(card|tile|box|panel|cell)/i;
  function block(el, depth) {
    if (el.nodeType !== 1) return '';
    if (el.matches(SKIP_SEL)) return '';
    if (el.dataset && el.dataset.bookshot && window.__shots && window.__shots[el.dataset.bookshot]) {
      const id = 'img' + (++imgN), u = window.__shots[el.dataset.bookshot];
      images.push({ id, url: u.url, w: u.w, h: u.h });
      return `<figure class="fig"><img data-img="${id}" alt="" width="${u.w}" height="${u.h}"></figure>`;
    }
    if (el.tagName === 'svg' || el.tagName === 'SVG') return visible(el) ? svgOut(el) : '';
    if (el.tagName === 'CANVAS') return canvasOut(el);
    if (!visible(el)) return '';
    const tag = el.tagName, cls = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || '';
    if (/(^|\s|-|_)(empty|no-?match|progress|toolbar|filters?|search|ticks?|sort|pager|pagination|copy-list|readlist|share-url-card|cross-tool-handoff)(\s|-|_|$)/i.test(cls)) return '';
    if (/^H[1-6]$/.test(tag)) {
      const t = inline(el).trim(); if (!t) return '';
      const lvl = Math.min(5, Math.max(2, +tag[1]));
      return `<h${lvl}>${t}</h${lvl}>`;
    }
    if (el.classList.contains('katex-display') || (el.classList.contains('katex') && el.parentElement && el.parentElement.classList.contains('katex-display'))) return `<div class="math">${el.outerHTML}</div>`;
    if (tag === 'P') { const t = inline(el).trim(); return t ? `<p>${t}</p>` : ''; }
    if (tag === 'PRE') return `<pre>${esc(el.innerText)}</pre>`;
    if (tag === 'UL' || tag === 'OL') {
      const items = [...el.children].filter(li => li.tagName === 'LI' && visible(li)).map(li => {
        const hasBlock = [...li.childNodes].some(n => !isInlineNode(n));
        return `<li>${hasBlock ? children(li, depth + 1) : inline(li).trim()}</li>`;
      }).filter(x => x !== '<li></li>');
      return items.length ? `<${tag.toLowerCase()}>${items.join('')}</${tag.toLowerCase()}>` : '';
    }
    if (tag === 'DL') {
      let s = '';
      [...el.children].forEach(c => { if (c.tagName === 'DT') s += `<dt>${inline(c).trim()}</dt>`; else if (c.tagName === 'DD') s += `<dd>${inline(c).trim()}</dd>`; });
      return s ? `<dl>${s}</dl>` : '';
    }
    if (tag === 'TABLE') {
      const rows = [...el.querySelectorAll('tr')].filter(visible).map(tr => {
        const cells = [...tr.children].filter(c => /^T[DH]$/.test(c.tagName) && visible(c)).map(c => {
          const t = c.tagName.toLowerCase(), span = c.colSpan > 1 ? ` colspan="${c.colSpan}"` : '';
          const hasBlock = [...c.childNodes].some(n => !isInlineNode(n));
          return `<${t}${span}>${hasBlock ? children(c, depth + 1) : inline(c).trim()}</${t}>`;
        }).join('');
        return cells ? `<tr>${cells}</tr>` : '';
      }).join('');
      const cap = el.querySelector('caption');
      return rows ? `<div class="tablewrap"><table>${cap ? `<caption>${inline(cap)}</caption>` : ''}${rows}</table></div>` : '';
    }
    if (tag === 'IMG') {
      const src = el.currentSrc || el.src; if (!src || el.naturalWidth < 40) return '';
      return `<figure class="fig"><img src="${absHref(el.getAttribute('src'))}" alt="${esc(el.alt || '')}"></figure>`;
    }
    if (tag === 'DETAILS') {
      const sum = el.querySelector(':scope > summary');
      const head = sum ? inline(sum).trim() : '';
      const body = [...el.childNodes].filter(n => n !== sum).map(n => n.nodeType === 1 ? block(n, depth + 1) : (n.nodeType === 3 && n.nodeValue.trim() ? `<p>${esc(n.nodeValue.trim())}</p>` : '')).join('');
      return (head ? `<h5>${head}</h5>` : '') + body;
    }
    if (tag === 'FIGCAPTION') { const t = inline(el).trim(); return t ? `<p class="cap">${t}</p>` : ''; }
    // calculator controls → one marker; small readout cards → stat chips
    const nCtl = el.querySelectorAll('input,select,textarea').length;
    if (nCtl && !el.querySelector('svg,canvas,table')) {
      const longest = Math.max(0, ...[...el.querySelectorAll('p,li')].map(x => x.innerText.length));
      if (longest < 140 && el.innerText.length < 900) return '<p class="ctl"></p>';
    }
    if (CARDRE.test(cls) && !nCtl && !el.querySelector('svg,canvas,table,ul,ol,h2,h3') && el.innerText.trim().length < 160) {
      const leaves = [...el.querySelectorAll('*')].filter(x => visible(x) && !x.children.length && x.innerText && x.innerText.trim()).map(x => x.closest('.katex') ? null : x).filter(Boolean);
      const parts = []; const seen = new Set();
      for (const x of leaves) { const top = x.closest('p,div,span') || x; if (seen.has(top)) continue; seen.add(top); }
      const kids = [...el.children].filter(visible);
      if (kids.length >= 2 && kids.length <= 6 && kids.every(k => k.innerText.trim().length < 90)) {
        const t = kids.map(k => inline(k).replace(/\s+/g, ' ').trim()).filter(Boolean);
        if (t.length >= 2) {
          let val = t[1], rest = t.slice(2);
          if (rest.length && rest[0].length < 36 && !/[=≈∝]/.test(rest[0])) { val += ' ' + rest[0]; rest = rest.slice(1); }
          return `<div class="stat"><span class="sl">${t[0]}</span><span class="sv">${val}</span>${rest.length ? `<span class="sf">${rest.join(' · ')}</span>` : ''}</div>`;
        }
      }
    }
    const inner = children(el, depth + 1);
    if (!inner.trim()) return '';
    // keep inputs' containers? interactive marker
    if (BOXRE.test(cls)) return `<aside class="${/warn|mistake|caution|danger|pitfall/i.test(cls) ? 'warn' : 'note'}">${inner}</aside>`;
    if (CARDRE.test(cls) && el.children.length && getComputedStyle(el).borderTopStyle !== 'none' && depth > 0) return `<div class="card">${inner}</div>`;
    if (/(\b|-)cap(tion)?\b|fig-cap|chart-note|caption/i.test(cls)) return `<p class="cap">${inline(el).trim()}</p>`;
    return inner;
  }
  function children(el, depth) {
    let out = '', run = '';
    const flush = () => { const t = run.replace(/\s+/g, ' ').trim(); if (t) out += `<p>${t}</p>`; run = ''; };
    for (const n of el.childNodes) {
      if (isInlineNode(n)) run += inline(n);
      else { flush(); out += block(n, depth); }
    }
    flush();
    return out;
  }
  // hero
  const hero = document.querySelector('.page-hero, .hero');
  const eyebrow = hero && hero.querySelector('.page-hero-eyebrow') ? hero.querySelector('.page-hero-eyebrow').innerText.trim() : '';
  const h1 = document.querySelector('h1'); const title = h1 ? h1.innerText.trim() : document.title;
  const descEl = hero && hero.querySelector('.page-hero-desc, .hero-desc, p');
  const desc = descEl ? inline(descEl).trim() : '';
  const heroImg = hero && hero.querySelector('.page-hero-anim svg');
  // body: everything after the hero inside main
  const main = document.querySelector('main') || document.body;
  let body = '';
  const heroEl = hero;
  for (const n of main.children) {
    if (heroEl && (n === heroEl || n.contains(heroEl))) {
      if (n !== heroEl) { // hero nested: take siblings after it
        let after = false;
        for (const m of n.querySelectorAll(':scope > *')) { if (m === heroEl || m.contains(heroEl)) { after = true; continue; } if (after) body += block(m, 0); }
      }
      continue;
    }
    body += block(n, 0);
  }
  return { title, eyebrow, desc, body, images, interactive: document.querySelectorAll('main input, main select, main canvas, main [role=button]').length };
}

srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port, b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1120, height: 1000 }, deviceScaleFactor: 2 });
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('http://127.0.0.1:' + port)) return r.continue();
    const m = u.match(/katex@[^/]+\/dist\/(.*)$/);
    if (m) { const f = path.join(KATEX, m[1]); if (fs.existsSync(f)) return r.fulfill({ path: f }); }
    if (/chart\.umd|chart\.js@/.test(u)) return r.fulfill({ path: CHART, contentType: 'text/javascript' });
    return r.abort();
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('amo-theme', 'light'); } catch (e) {} });
  const pages = only ? only.split(',') : fs.readdirSync(path.join(dir, 'pages')).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));
  for (const key of pages) {
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/pages/${key}.html`, { waitUntil: 'load' });
    await p.waitForTimeout(1500);
    const PRE = {
      'laser-planner': () => { const b = [...document.querySelectorAll('.atom-btn')].find(x => /87/.test(x.textContent) && /Rb/.test(x.textContent)) || document.querySelector('.atom-btn'); if (b) b.click(); },
    };
    if (PRE[key]) { await p.evaluate(PRE[key]); await p.waitForTimeout(800); }
    await p.addStyleTag({ content: '.anim-in,.reveal,[data-reveal]{opacity:1!important;transform:none!important} *{animation-play-state:paused!important}' });
    // open accordions and hidden tab panels so their text is included
    await p.evaluate(() => {
      document.querySelectorAll('details').forEach(d => d.open = true);
      const main = document.querySelector('main') || document.body;
      main.querySelectorAll('[hidden]').forEach(e => { if (!e.closest('.cs-code,.tooltip')) e.hidden = false; });
      main.querySelectorAll('*').forEach(e => {
        if (e.matches('script,style,template,option,.tooltip,.tip-bubble,.modal,dialog,.sr-only')) return;
        const cs = getComputedStyle(e);
        if (cs.display === 'none' && /(tab|panel|pane|content|drawer|accordion|body|section|step|collapse|topic)/i.test(e.className || '') && !/(nav|menu|mobile|print|hint|pop|overlay|modal)/i.test(e.className || '')) e.style.display = 'block';
      });
      window.dispatchEvent(new Event('resize'));
    });
    await p.waitForTimeout(1200);
    // scroll through so lazy/observer-driven figures draw
    const h = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 900) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(60); }
    await p.waitForTimeout(800);
    const nShots = await p.evaluate(() => {
      const main = document.querySelector('main') || document.body; let n = 0;
      const cands = [...main.querySelectorAll('div,section,ul,ol')].filter(el => {
        const r = el.getBoundingClientRect(); if (r.width < 200 || r.height < 80 || r.height > 1400) return false;
        if (el.closest('[data-bookshot]')) return false;
        if ([...el.querySelectorAll('p,li')].some(x => x.innerText.length > 90)) return false;
        if (el.querySelector('.katex, table')) return false;
        const leaves = [...el.querySelectorAll('*')].filter(x => !x.children.length && x.innerText && x.innerText.trim());
        if (leaves.length < 30) return false;
        const L = leaves.map(x => x.innerText.trim().length);
        return L.reduce((a, b) => a + b, 0) / L.length <= 4.5 && Math.max(...L) <= 30;
      });
      for (const el of cands) { if (el.closest('[data-bookshot]')) continue; el.dataset.bookshot = String(++n); }
      return n;
    });
    const shots = {};
    for (let i = 1; i <= nShots; i++) {
      const loc = p.locator(`[data-bookshot="${i}"]`);
      try { await loc.scrollIntoViewIfNeeded(); const box = await loc.boundingBox(); const buf = await loc.screenshot(); shots[i] = { url: 'data:image/png;base64,' + buf.toString('base64'), w: Math.round(box.width * 2), h: Math.round(box.height * 2) }; } catch (e) {}
    }
    await p.evaluate(s => { window.__shots = s; }, shots);
    const r = await p.evaluate(extractInPage, 'x');
    r.shots = nShots;
    r.key = key; r.errors = errs;
    fs.writeFileSync(path.join(outDir, key + '.json'), JSON.stringify(r));
    console.log(key, 'html', Math.round(r.body.length / 1024) + 'KB', 'imgs', r.images.length, 'shots', r.shots, errs.length ? 'ERR ' + errs.slice(0, 2).join(' | ') : '');
    await p.close();
  }
  await b.close(); srv.close();
});
