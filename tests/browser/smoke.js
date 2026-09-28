#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — browser smoke test (rendered-page checks).

   Usage:
     node tests/browser/smoke.js <siteRoot> [--baseline <oldSiteRoot>] [--pages a,b,c] [--shots <dir>]

   Serves <siteRoot> (and optionally a baseline copy) with a tiny built-in
   static server, then loads every page (pages/*.html, home.html, 404.html)
   in headless Chromium:
     • dark + light theme at 1280 px, dark at 390 px
     • all external requests blocked (CDNs are unavailable in CI/sandboxes),
       Chart.js replaced by tests/browser/chartstub.js so pages still run
   and reports, per page: uncaught errors, console errors, and horizontal
   overflow at 390 px (document wider than the viewport).
   With --baseline, only problems NOT present in the baseline count as
   failures, so pre-existing issues don't hide new ones.
   Exit code 1 if there are new failures.

   Needs the `playwright` package (Chromium is preinstalled in the Claude
   cloud workspace; do not run `playwright install` there).
   ───────────────────────────────────────────────────────────────────── */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { console.error('playwright not found: run from a directory where `require("playwright")` resolves'); process.exit(2); }

const args = process.argv.slice(2);
const root = path.resolve(args[0] || '.');
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const baseline = opt('--baseline') ? path.resolve(opt('--baseline')) : null;
const only = opt('--pages') ? opt('--pages').split(',').map(s => s.trim()) : null;
const shots = opt('--shots');
const STUB = path.join(__dirname, 'chartstub.js');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webp': 'image/webp', '.gif': 'image/gif' };
function serve(dir) {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const p = path.join(dir, decodeURIComponent(q.url.split('?')[0].split('#')[0]));
      if (!p.startsWith(dir)) { r.writeHead(403); return r.end(); }
      fs.readFile(p, (err, buf) => {
        if (err) { r.writeHead(404); return r.end('not found'); }
        r.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); r.end(buf);
      });
    }).listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
function pageList(dir) {
  const pages = fs.readdirSync(path.join(dir, 'pages')).filter(f => f.endsWith('.html')).map(f => 'pages/' + f);
  return pages.concat(['home.html', '404.html'].filter(f => fs.existsSync(path.join(dir, f))))
    .filter(p => !only || only.some(o => p.includes(o)));
}

async function run(dir, label) {
  const { srv, port } = await serve(dir);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const out = {};
  const configs = [['dark', 1280], ['light', 1280], ['dark', 390]];
  for (const [theme, w] of configs) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    await ctx.route('**/*', r => r.request().url().startsWith(`http://127.0.0.1:${port}`) ? r.continue() : r.abort());
    await ctx.addInitScript({ path: STUB });
    await ctx.addInitScript(t => { try { localStorage.setItem('amo-theme', t); } catch (e) {} }, theme);
    for (const p of pageList(dir)) {
      const page = await ctx.newPage(), probs = [];
      page.on('pageerror', e => probs.push('error: ' + e.message.split('\n')[0].slice(0, 160)));
      page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) probs.push('console: ' + m.text().slice(0, 160)); });
      try {
        await page.goto(`http://127.0.0.1:${port}/${p}`, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate(() => document.querySelectorAll('.anim-in').forEach(e => e.classList.add('visible')));
        await page.waitForTimeout(300);
        if (w < 500) {
          const sw = await page.evaluate(() => document.documentElement.scrollWidth);
          if (sw > w + 1) probs.push(`overflow: page is ${sw}px wide at ${w}px`);
        }
        if (shots && label === 'new') await page.screenshot({ path: path.join(shots, `${p.replace(/\W+/g, '_')}-${theme}-${w}.png`) });
      } catch (e) { probs.push('load: ' + e.message.split('\n')[0].slice(0, 120)); }
      (out[p] = out[p] || []).push(...probs.map(x => `[${theme} ${w}] ${x}`));
      await page.close();
    }
    await ctx.close();
  }
  await browser.close(); srv.close();
  return out;
}

(async () => {
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const now = await run(root, 'new');
  const old = baseline ? await run(baseline, 'old') : {};
  let failures = 0, pre = 0;
  for (const [p, probs] of Object.entries(now)) {
    const known = new Set(old[p] || []);
    const fresh = probs.filter(x => !known.has(x)), kept = probs.filter(x => known.has(x));
    pre += kept.length;
    if (fresh.length) { failures += fresh.length; console.log(`✗ ${p}\n    ` + fresh.join('\n    ')); }
    else if (kept.length) console.log(`• ${p} (pre-existing: ${kept.length})`);
  }
  const n = Object.keys(now).length;
  console.log(`\n${n} pages × 3 configs checked · new problems: ${failures}` + (baseline ? ` · pre-existing (ignored): ${pre}` : ''));
  if (!baseline) for (const [p, probs] of Object.entries(now)) if (probs.length) console.log(`  ${p}: ${probs.length}`);
  process.exit(failures ? 1 : 0);
})();
