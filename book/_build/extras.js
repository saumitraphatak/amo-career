// Edition 1.1 additions to "Building with Atoms", generated from the site's own pages:
//   prologue()          — "Follow one atom" (pages/follow-one-atom.html) + the apparatus map (pages/apparatus.html)
//   recordsAppendix()   — Appendix G, the records board (pages/records.html), with its check date
//   indexSection()      — Appendix H, a back-of-book index; page numbers are filled in by polish.js (index.py)
//   apparatusShot(out)  — a still of the exploded apparatus for the prologue figure
const fs = require('fs'), path = require('path'), vm = require('vm');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Pull a top-level `var NAME = [ … ];` literal out of a page script and evaluate it in a sandbox.
function literal(file, name, endMarker, ctx) {
  const s = fs.readFileSync(file, 'utf8'), i = s.indexOf(`var ${name} = [`);
  if (i < 0) throw new Error(`${name} not found in ${file}`);
  const j = s.indexOf('];', s.indexOf(endMarker, i)) + 2;
  const sandbox = Object.assign({}, ctx || {}); vm.createContext(sandbox);
  vm.runInContext(s.slice(i, j).replace(`var ${name}`, name), sandbox);
  return sandbox[name];
}

function prologue(site, chapters, SITE) {
  const html = fs.readFileSync(path.join(site, 'pages/follow-one-atom.html'), 'utf8');
  const steps = [...html.matchAll(/<section class="fa-step" data-stage="(\d+)" id="([a-z-]+)">([\s\S]*?)<\/section>/g)].map(m => {
    const b = m[3];
    return {
      n: +m[1] + 1, id: m[2],
      num: strip((b.match(/<div class="fa-num">([\s\S]*?)<\/div>/) || [])[1] || ''),
      title: strip((b.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || ''),
      chips: [...b.matchAll(/<span class="fa-chip">([\s\S]*?)<\/span>/g)].map(x => x[1]),
      paras: [...b.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(x => x[1].replace(/\s+/g, ' ').trim()),
      fact: ((b.match(/<div class="fa-fact">([\s\S]*?)<\/div>/) || [])[1] || '').replace(/\s+/g, ' ').trim(),
      tools: [...b.matchAll(/<a href="([a-z0-9-]+)\.html">([^<]+)<\/a>/g)].map(x => x[1]),
    };
  });
  const chRef = k => { const c = chapters.find(x => x.key === k); return c ? `<a href="#ch-${k}">Ch. ${c.no}</a>` : ''; };
  const stageHtml = steps.map(s => `
    <h3 class="pro-stage"><span class="pro-n">${s.n}</span>${esc(s.title)}</h3>
    <p class="pro-chips">${s.chips.map(c => `<span>${c}</span>`).join('')}</p>
    ${s.paras.map(p => `<p>${p.replace(/href="([a-z0-9-]+)\.html"/g, (q, k) => chapters.some(c => c.key === k) ? `href="#ch-${k}"` : `href="${SITE}pages/${k}.html"`)}</p>`).join('')}
    <aside class="note"><p>${s.fact}</p></aside>
    <p class="pro-read">Read next: ${s.tools.map(chRef).filter(Boolean).join(' · ') || '—'}</p>`).join('');
  const head = html.match(/<div class="fa-headline">([\s\S]*?)<\/div>/);
  const glance = steps.map(s => `<tr><td>${s.n}</td><td>${esc(s.num.replace(/^Stage \d+ · /, ''))}</td><td>${s.chips.join(' · ')}</td><td>${s.tools.map(chRef).filter(Boolean).join(', ')}</td></tr>`).join('');

  const PARTS = literal(path.join(site, 'pages/apparatus.html'), 'PARTS', "id: 'control'");
  const story = { build: 'Part I', trap: 'Part II', qc: 'Part III' };
  const partRows = PARTS.map(p => `<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.text)}</td><td>${p.links.map(l => chRef(l[0]) || `<a href="${SITE}pages/${l[0]}.html">${esc(l[1])}</a>`).join(', ')}</td></tr>`).join('');

  return `<section class="part pro" id="prologue" style="--pc:var(--accent)"><div class="pn">Prologue</div><h1>Follow One Atom</h1>
  <p class="pl">Before the chapters take the machine apart, ride through it once with a single rubidium-87 atom: from a 400 K oven to a qubit inside a quantum gate, about a second later. Every stage below is a chapter (or several) of this book.</p>
  ${head ? `<p class="pro-head">${strip(head[1].replace(/<\/span>/g, ' · ')).replace(/ · $/, '')}</p>` : ''}<span class="marker">@@CH:prologue@@</span></section>
  <section class="chapter pro-body" id="prologue-journey" style="--pc:var(--accent)">
    <h2 data-num="P.1">The journey at a glance</h2>
    <p>Numbers are for ⁸⁷Rb, computed from its constants (Steck, <em>Rubidium 87 D Line Data</em>); temperatures for the MOT, molasses and tweezer are typical values. Velocities are one-axis rms speeds except where noted. The interactive version, with live gauges, is at <a href="${SITE}pages/follow-one-atom.html">amotoolkit.com/pages/follow-one-atom.html</a>.</p>
    <div class="tablewrap"><table><tr><th>#</th><th>Stage</th><th>Key numbers</th><th>Chapters</th></tr>${glance}</table></div>
    <h2 data-num="P.2">Ten stages</h2>
    ${stageHtml}
    <h2 data-num="P.3">The machine, part by part</h2>
    <p>The same journey happens inside one apparatus. This exploded view (schematic, not to scale) names its parts; the table says what each does and where it is designed. The live version turns and comes apart in 3D: <a href="${SITE}pages/apparatus.html">amotoolkit.com/pages/apparatus.html</a>.</p>
    <figure class="fig"><img src="img/apparatus-map.png" alt="Exploded schematic of a neutral-atom tweezer experiment with labelled parts" data-w="2400" data-h="1400"></figure>
    <p class="snap">The apparatus map: vacuum chamber, atom source, pumps, coils, beams, objective, AODs, SLM, lasers, cameras, cavity, microwaves, fibres and control system.</p>
    <div class="tablewrap"><table class="wide-ok"><tr><th>Part</th><th>What it does</th><th>Where it is designed</th></tr>${partRows}</table></div>
  </section>`;
}

function recordsAppendix(site) {
  const CATS = literal(path.join(site, 'pages/records.html'), 'CATS', "id: 'qec'", { arx: id => 'https://arxiv.org/abs/' + id, doi: d => 'https://doi.org/' + d });
  const html = fs.readFileSync(path.join(site, 'pages/records.html'), 'utf8');
  const checked = (html.match(/Last checked: ([^·<]+)/) || [])[1] || '';
  const PF = { atom: 'Neutral atoms', ion: 'Trapped ions', sc: 'Superconducting', spin: 'Silicon spins', ph: 'Photonic' };
  const ST = { peer: 'peer-reviewed', pre: 'preprint', co: 'company-reported' };
  const SITE_P = 'https://amotoolkit.com/pages/';
  const link = s => /^https?:/.test(s[1]) ? `<a href="${s[1]}">${esc(s[0])}</a>` : `<a href="${SITE_P}${s[1]}">${esc(s[0])}</a>`;
  const cats = CATS.map(c => `<h2>${esc(c.title)}</h2><p>${esc(c.lead)}</p>
    <div class="tablewrap"><table class="rec"><tr><th>Platform</th><th>Record</th><th>What was measured</th><th>Who, when, source</th><th>Status</th></tr>${c.rows.map(r =>
      `<tr><td>${PF[r.pf]}</td><td class="rv">${r.val}</td><td>${r.what}${r.flags.length ? ` <span class="tag">${r.flags.join(', ')}</span>` : ''}</td><td>${r.who}<br>${r.src.map(link).join(' · ')}</td><td><span class="tag st-${r.st}">${ST[r.st]}</span></td></tr>`).join('')}</table></div>`).join('');
  return `<section class="appx" id="appx-records"><h1>G · Where the field stands</h1><span class="marker">@@CH:appx-records@@</span>
  <p>The best published numbers for each quantum-computing platform, from the website's records board, last checked ${esc(checked.trim())}. Records move quickly: treat this as a dated snapshot and check the live board, <a href="${SITE_P}records.html">amotoolkit.com/pages/records.html</a>, before quoting a value. Every entry names its source and says whether it is peer-reviewed, a preprint, or company-reported; "one pair" means it was measured on one or a few qubit pairs rather than averaged over a processor.</p>
  ${cats}</section>`;
}

function indexSection(terms) {
  const groups = {};
  Object.keys(terms).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })).forEach(t => { const L = t[0].toUpperCase().replace(/[^A-Z]/, '#'); (groups[L] = groups[L] || []).push(t); });
  const body = Object.keys(groups).sort().map(L => `<div class="ix-l"><h3>${L}</h3>${groups[L].map(t => `<p class="ix-e" data-term="${esc(t)}">${esc(t)}<span class="ix-pg"></span></p>`).join('')}</div>`).join('');
  return `<section class="appx" id="appx-index"><h1>H · Index</h1><span class="marker">@@CH:appx-index@@</span>
  <p class="ix-intro">Page numbers refer to the PDF edition; in the online edition each number links to the chapter that contains it. The pages listed for each term are where it is discussed most, not every mention.</p>
  <div class="ix">${body}</div></section>`;
}

async function apparatusShot(site, out, chromium, sharp) {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await ctx.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { try { localStorage.setItem('amo-theme', 'light'); } catch (e) {} });
  const p = await ctx.newPage();
  await p.goto('file://' + path.join(site, 'pages/apparatus.html')); await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById('apExplode'); s.value = 70; s.dispatchEvent(new Event('input')); });
  await p.evaluate(() => document.querySelectorAll('.ap-bar, .ap-tip').forEach(e => e.style.display = 'none'));
  await p.waitForTimeout(900);
  const el = await p.$('.ap-stagebox'); const buf = await el.screenshot();
  await sharp(buf).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(path.join(out, 'img/apparatus-map.png'));
  await b.close();
}


// Evaluate a top-level `const|var NAME = [ … ];` or `{ … };` from a page script (ends at the first line that closes it).
function pageConst(file, name) {
  const s = fs.readFileSync(file, 'utf8'), m = s.match(new RegExp(`\\n(?:const|var|let) ${name} = ([\\[{])`));
  if (!m) throw new Error(`${name} not found in ${file}`);
  const i = m.index + 1, eol = s.indexOf('\n', i), line = s.slice(i, eol).trim();
  const close = m[1] === '[' ? '\n];' : '\n};', j = /[\]}];$/.test(line) ? eol : s.indexOf(close, i) + close.length;   // one-line literals end with their line
  const sb = {}; vm.createContext(sb); vm.runInContext(s.slice(i, j).replace(/^(?:const|var|let) /, 'var '), sb);
  return sb[name];
}

// Chapter body for the research-group directory: the page's finder is interactive, so the book sets its data as tables.
function groupsBody(site, raw) {
  const file = path.join(site, 'pages/amo-groups.html');
  const G = pageConst(file, 'GROUPS'), TL = pageConst(file, 'TAG_LABELS'), AD = pageConst(file, 'AREA_DESC'),
    ORDER = pageConst(file, 'AREA_ORDER'), WEB = pageConst(file, 'GROUP_WEBSITES'), SHORT = pageConst(file, 'SUBFIELD_SHORTLISTS');
  const pageOrder = [...raw.body.matchAll(/<h3>([^<]+?)\s+\d+<\/h3>/g)].map(m => m[1].trim());   // the page's own country order
  const countries = [...new Set(G.map(g => g.country))].sort((x, y) => ((pageOrder.indexOf(x) + 1) || 99) - ((pageOrder.indexOf(y) + 1) || 99));
  const areas = `<h2>Research areas</h2><p>Every group in the directory is filed under one main area. The counts are the number of groups in each.</p>
    <div class="tablewrap"><table><tr><th>Area</th><th>What it covers</th><th>Groups</th></tr>${ORDER.map(t => `<tr><td><strong>${esc(TL[t])}</strong></td><td>${esc(AD[t])}</td><td>${G.filter(g => g.tag === t).length}</td></tr>`).join('')}</table></div>`;
  const dir = `<h2>The directory, by country</h2><p>${G.length} groups in ${countries.length} countries. For each: the principal investigator, the atoms they work with, their focus, and one paper to start reading. On the website you can filter by area, atom and country, see the groups on a globe, and keep a shortlist.</p>` +
    countries.map(c => { const gs = G.filter(g => g.country === c); return `<h3>${esc(c)} <span class="gcount">${gs.length}</span></h3>
    <div class="tablewrap"><table class="gdir"><tr><th>Group</th><th>Area · atoms</th><th>Focus</th><th>Start reading</th></tr>${gs.map(g => `<tr><td><strong>${WEB[g.name] ? `<a href="${WEB[g.name]}">${esc(g.name)}</a>` : esc(g.name)}</strong><br>${esc(g.pi)}<br><span class="gi">${esc(g.inst)}</span>${g.status ? ` <span class="tag">${esc(g.status)}</span>` : ''}</td><td>${esc(TL[g.tag] || g.tag)}<br><span class="gi">${(g.atoms || []).map(esc).join(', ')}</span></td><td>${esc(g.focus)}</td><td>${g.doi ? `<a href="https://doi.org/${g.doi}">${esc(g.paper)}</a>` : esc(g.paper || '')}</td></tr>`).join('')}</table></div>`; }).join('');
  const short = `<h2>Names to know, by subfield</h2><p>A short list per subfield, for when you want to know whose papers to read first.</p>` +
    SHORT.map(([t, names]) => `<h3>${esc(t)}</h3><p class="namelist">${names.map(n => { const [a, b] = n.split(' — '); return `<span><strong>${esc(a)}</strong>${b ? ` (${esc(b)})` : ''}</span>`; }).join(' · ')}</p>`).join('');
  // the wider watchlist: the page leaves out entries already in the directory, so keep the names its rendered list shows
  const WL = pageConst(file, 'WATCHLIST_SECTIONS'), wi = raw.body.indexOf('<h2>04'), seg = wi >= 0 ? raw.body.slice(wi) : '';
  const intro = (seg.match(/<\/h2>(<p>[\s\S]*?<\/p>)/) || [])[1] || '';
  let kept = 0, total = 0;
  const watch = seg ? `<h2>The wider watchlist</h2>${intro.replace(/ The search box above filters this list too\./, '')}` + WL.map(sec => {
    const items = sec.entries.map(e => e.split(' — ')).filter(p => (total++, seg.includes(`<p>${esc(p[0])}</p>`)));
    kept += items.length;
    return items.length ? `<h3>${esc(sec.title)}</h3><ul class="watch">${items.map(p => `<li><strong>${esc(p[0])}</strong>${p[1] ? `, ${esc(p[1])}` : ''}${p.length > 2 ? `: ${esc(p.slice(2).join(' — '))}` : ''}</li>`).join('')}</ul>` : '';
  }).join('') + `<p class="gi">${total - kept} of the ${total} watchlist entries are research groups in the directory above and are listed there instead.</p>` : '';
  return areas + dir + short + watch;
}

module.exports = { prologue, recordsAppendix, indexSection, apparatusShot, groupsBody };
