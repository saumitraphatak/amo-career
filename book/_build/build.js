// Assemble "Building with Atoms" from extracted pages: node build.js <siteDir> <rawDir> <outDir>
const fs = require('fs'), path = require('path');
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { chromium } = require('playwright');
const [site0, raw0, out0] = process.argv.slice(2);
const site = path.resolve(site0), rawDir = path.resolve(raw0), out = path.resolve(out0);
const KATEX = '/opt/npm-tools/node_modules/katex/dist';
const SITE = 'https://amotoolkit.com/';
const EDITION = 'Edition 1 · November 2026';
const BOOK_URL = SITE + 'book/';
const PDF_NAME = 'building-with-atoms.pdf';
const META = JSON.parse(fs.readFileSync(path.join(__dirname, 'textbook-meta.json'), 'utf8'));
fs.mkdirSync(path.join(out, 'img'), { recursive: true });

const js = fs.readFileSync(path.join(site, 'js/main.js'), 'utf8');
const navGroup = name => {
  const i = js.indexOf(`  ${name}: [\n`), j = js.indexOf('\n  ],', i);
  return [...js.slice(i, j).matchAll(/key: '([a-z0-9-]+)',\s+step: (\d+),\s+label: '([^']+)',\s+tool: '([^']+)',\s+kind: '([^']+)',\s+icon: '([^']+)'/g)]
    .map(m => ({ key: m[1], step: +m[2], label: m[3], tool: m[4], kind: m[5], icon: m[6] }));
};
const week = Object.fromEntries([...js.slice(js.indexOf('const COURSE_WEEK'), js.indexOf('};', js.indexOf('const COURSE_WEEK'))).matchAll(/'([a-z0-9-]+)': (\d+)/g)].map(m => [m[1], +m[2]]));
const notebooks = new Set([...js.slice(js.indexOf('const NOTEBOOKS'), js.indexOf(']);', js.indexOf('const NOTEBOOKS'))).matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1]));
const teach = fs.readFileSync(path.join(site, 'pages/teach.html'), 'utf8');
const problems = {};
for (const m of teach.matchAll(/<div class="te-ps" id="ps-([a-z0-9-]+)">.*?<ol class="te-probs">(.*?)<\/ol><\/div>/gs))
  problems[m[1]] = m[2].replace(/<span class="te-tag (\w)">([^<]+)<\/span>/g, '<span class="ptag $1">$2</span>');
const weeks = [...teach.matchAll(/<article class="te-week-card"[^>]*id="week-(\d+)">.*?<h3>([^<]+)<\/h3>.*?<dt>Lecture 1<\/dt><dd>(.*?)<\/dd><dt>Lecture 2<\/dt><dd>(.*?)<\/dd><dt>In class<\/dt><dd>(.*?)<\/dd>.*?<div class="te-chips">(.*?)<\/div>/gs)]
  .map(m => ({ n: +m[1], title: m[2], a: m[3], b: m[4], demo: m[5], pages: [...m[6].matchAll(/href="([a-z0-9-]+)\.html"/g)].map(x => x[1]) }));

const PARTS = [
  { id: 'build', n: 'I', title: 'Build a Lab', color: 'var(--c-build)', items: navGroup('build'),
    lead: 'Twelve steps from an empty room to a working single-atom experiment: choose the atom, plan its lasers, pump down, lock, check polarisation, trap a cloud, wire the control system, build the tweezer array, correct the optics, automate the routine work, add a cavity, and run the lab day to day.' },
  { id: 'trap', n: 'II', title: 'Trap, Image and Cool', color: 'var(--c-trap)', items: navGroup('trapImageCool'),
    lead: 'Running a first experiment: cool atoms with light, image the cloud and measure its temperature, see one atom, measure its temperature, cool it to the motional ground state, run a full cycle, and keep the everyday numbers at hand.' },
  { id: 'qc', n: 'III', title: 'From Atoms to a Quantum Computer', color: 'var(--c-qc)', items: navGroup('quantum'),
    lead: 'Turning trapped atoms into qubits: how qubits work and lose coherence, how decoupling protects them, how Rydberg blockade entangles them, what limits gate fidelity, how gates are benchmarked, how circuits run on moving atoms, and how processors are linked with photons.' },
  { id: 'career', n: 'IV', title: 'Into the Field', color: 'var(--c-career)', items: navGroup('career'),
    lead: 'Reading the literature that built the field, finding a research group, and understanding the companies and platforms you may join. Facts about companies change quickly: every number here carries the date it was checked.' },
];
const allKeys = PARTS.flatMap(p => p.items.map(i => i.key));
let chapterNo = 0; const chapters = [];
for (const p of PARTS) for (const it of p.items) chapters.push({ ...it, part: p, no: ++chapterNo });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pageUrl = k => `${SITE}pages/${k}.html`;
const colab = k => `https://colab.research.google.com/github/saumitraphatak/amo-career/blob/main/notebooks/${k}.ipynb`;

async function saveImages(key, raw) {
  let body = raw.body;
  for (const im of raw.images) {
    const buf = Buffer.from(im.url.split(',')[1], 'base64');
    const file = `img/${key}-${im.id}.png`;
    const img = sharp(buf); const meta = await img.metadata();
    await img.resize({ width: Math.min(meta.width, 1400), withoutEnlargement: true }).flatten({ background: '#ffffff' }).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(path.join(out, file));
    const m2 = await sharp(path.join(out, file)).metadata();
    body = body.replace(`data-img="${im.id}" `, `src="${file}" loading="lazy" data-w="${m2.width}" data-h="${m2.height}" `);
  }
  return body;
}

function chapterHtml(c, body, raw) {
  const kicker = { build: 'Build step', trap: 'Experiment step', qc: 'Quantum step', career: 'Career step' }[c.part.id];
  const m = META[c.key] || {};
  const title = m.title || c.label;
  const comp = [`<a href="${pageUrl(c.key)}">Live interactive page ↗</a>`];
  if (notebooks.has(c.key)) comp.push(`Notebook: <a href="${colab(c.key)}">Open in Colab</a> · <a href="${SITE}notebooks/${c.key}.ipynb">download ${c.key}.ipynb</a>`);
  if (week[c.key]) comp.push(`<a href="#part-teach">Week ${week[c.key]}</a>`);
  const bridge = m.bridge ? `<p class="ch-bridge">${esc(m.bridge)}</p>` : '';
  const prereq = (m.prereqs && m.prereqs.length) ? 'Prerequisites: ' + m.prereqs.join(', ') : 'No prerequisites';
  const goals = (m.goals && m.goals.length) ? `<div class="ch-goals"><div class="ch-goals-head"><span class="ch-goals-title">In this chapter</span><span class="ch-prereqs">${esc(prereq)}</span></div><ul>${m.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>` : '';
  const summary = m.summary ? `<aside class="ch-summary"><div class="ch-summary-title">Chapter ${c.no} Summary</div><p>${esc(m.summary)}</p></aside>` : '';
  let end = '';
  if (problems[c.key]) end = `<section class="ch-end"><h2>Problems for Chapter ${c.no}</h2><ol>${problems[c.key]}</ol><p class="cap">Use the tool: on the interactive page. By hand: from the formulas in this chapter. Design: a decision a lab would make. Worked solutions are available to instructors on request (see Part V).</p></section>`;
  const prevC = chapters[c.no - 2], nextC = chapters[c.no];
  const prevLink = prevC ? `<a href="#ch-${prevC.key}">← Ch. ${prevC.no}: ${esc((META[prevC.key] || {}).title || prevC.label)}</a>` : '<a href="#contents">← Contents</a>';
  const nextLink = nextC ? `<a href="#ch-${nextC.key}">Ch. ${nextC.no}: ${esc((META[nextC.key] || {}).title || nextC.label)} →</a>` : '<a href="#part-teach">Part V: The 14-week course →</a>';
  return `<section class="chapter" id="ch-${c.key}" data-key="${c.key}" style="--pc:${c.part.color}">
  <header class="ch-head">
    <span class="ch-num">${c.no}</span>
    <div class="ch-kicker">Chapter ${c.no} · ${kicker} ${String(c.step).padStart(2, '0')}</div>
    <h1>${esc(title)}</h1>
    <div class="ch-sub">${c.icon} ${esc(c.tool)} · ${esc(c.kind)}</div>
    ${raw.desc ? `<p class="ch-lead">${raw.desc}</p>` : ''}
    ${bridge}${goals}
    <div class="ch-companion"><span class="ch-companion-label">Website Companion</span>${comp.join(' · ')}</div>
    <span class="marker">@@CH:${c.key}@@</span>
  </header>
  <div class="ch-body">${body}</div>
  ${summary}
  ${end}
  <nav class="ch-next-bridge screen-only" aria-label="Chapter navigation">${prevLink}${nextLink}</nav>
</section>`;
}

const COVER_ART = (() => {
  // a tweezer array under a focused beam: 9×4 sites, a few empty, one being moved
  let s = '<svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A tweezer array of single atoms">';
  s += '<defs><radialGradient id="g" r="0.5"><stop offset="0" stop-color="#fff7e6"/><stop offset="0.35" stop-color="#f4a261"/><stop offset="1" stop-color="#f4a261" stop-opacity="0"/></radialGradient>' +
       '<linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a13c1c" stop-opacity=".0"/><stop offset="1" stop-color="#a13c1c" stop-opacity=".16"/></linearGradient></defs>';
  s += '<rect width="640" height="260" rx="14" fill="#1f2a36"/>';
  s += '<path d="M250,0 L390,0 L340,120 L300,120 Z" fill="url(#beam)"/>';
  const empty = new Set(['2-1', '6-2', '4-3']);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    const x = 120 + c * 50, y = 80 + r * 40;
    s += `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#6b829a" stroke-width="1" stroke-dasharray="2 3"/>`;
    if (!empty.has(`${c}-${r}`)) s += `<circle cx="${x}" cy="${y}" r="11" fill="url(#g)"/><circle cx="${x}" cy="${y}" r="2.6" fill="#fffaf0"/>`;
  }
  s += '<path d="M570,120 C540,120 530,140 520,160" stroke="#9ad1d4" stroke-width="1.6" fill="none" stroke-dasharray="4 4"/><circle cx="570" cy="120" r="11" fill="url(#g)"/><circle cx="570" cy="120" r="2.6" fill="#fffaf0"/>';
  s += '<text x="320" y="244" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#8ea3b8" letter-spacing="3">ONE ATOM PER SITE · REARRANGED INTO A DEFECT-FREE ARRAY</text></svg>';
  return s;
})();

function front() {
  const toc = PARTS.map(p => `<div class="tp" style="--pc:${p.color}">Part ${p.n} · ${p.title}</div>` +
    chapters.filter(c => c.part === p).map(c => `<div class="tc"><span class="n">${c.no}</span><a href="#ch-${c.key}">${esc((META[c.key] || {}).title || c.label)}</a><span class="dots"></span><span class="pg" data-pg="ch-${c.key}"></span></div>`).join('')).join('') +
    `<div class="tp" style="--pc:var(--c-teach)">Part V · Teach with this Book</div><div class="tc"><span class="n">V</span><a href="#part-teach">The 14-week course</a><span class="dots"></span><span class="pg" data-pg="part-teach"></span></div>` +
    `<div class="tp" style="--pc:var(--c-app)">Appendices</div>` +
    [['appx-notebooks', 'A', 'Python notebooks'], ['appx-constants', 'B', 'Constants used in this book'], ['appx-cite', 'C', 'Citing this book and the work behind it'], ['appx-care', 'D', 'Using this material responsibly']]
      .map(([id, n, t]) => `<div class="tc"><span class="n">${n}</span><a href="#${id}">${t}</a><span class="dots"></span><span class="pg" data-pg="${id}"></span></div>`).join('');
  return `
<section class="cover">
  <div>
    <div class="kick">AMO Toolkit · Training Kit</div>
    <h1>Building with Atoms</h1>
    <div class="sub">A training kit for experimental AMO and neutral-atom researchers</div>
  </div>
  <div class="art">${COVER_ART}</div>
  <div>
    <div class="by">Saumitra Phatak</div>
    <div class="meta">${EDITION} · compiled from <a href="${SITE}">amotoolkit.com</a><br>Interactive tools, animations and updates: <a href="${SITE}">amotoolkit.com</a></div>
    <div class="bands"><i style="background:var(--c-build)"></i><i style="background:var(--c-trap)"></i><i style="background:var(--c-qc)"></i><i style="background:var(--c-career)"></i><i style="background:var(--c-teach)"></i></div>
  </div>
</section>

<section class="front" id="about">
  <h1>About this book</h1>
  <p><em>Building with Atoms</em> collects everything on <a href="${SITE}">AMO Toolkit</a> into one volume you can download, annotate and keep: the guides, the reference material, the derivations, the worked numbers and the figures of all ${chapters.length} pages, arranged in the order a new researcher meets them. It was written for students joining atomic, molecular and optical physics groups, and especially for those building or running neutral-atom and optical-tweezer experiments.</p>
  <h2>How it relates to the website</h2>
  <p>Each chapter is one page of the website. The website stays the place to <em>use</em> the material: its calculators, simulators and animations respond to your inputs, and it is updated as the field moves. This book is a snapshot of it, made so you do not have to come back to look something up.</p>
  <ul>
    <li><strong>Interactive figures</strong> appear here as snapshots at the page's default settings. A dashed <span class="ia-inline">▶ box</span> marks each place where the website has controls you can change, with a link straight to it.</li>
    <li><strong>Calculator readouts</strong> are shown as small panels of numbers. They are the page's output for its default inputs, so they double as worked examples.</li>
    <li><strong>Python notebooks</strong> reproduce ${notebooks.size} of the calculators and are linked at the start of their chapters and listed in Appendix A.</li>
    <li><strong>Problems</strong> close most chapters; Part V lays the chapters out as a 14-week course.</li>
  </ul>
  <h2>How to read it</h2>
  <p>Part I follows the build of a lab, Part II the first experiment with single atoms, Part III the step from atoms to qubits, and Part IV the literature, the research groups and the industry. Read a part in order, or go straight to the chapter you need: every chapter starts with what it is for and links to its live page.</p>
  <p>Boxes have consistent meanings. A <strong>tinted box</strong> is a key idea or a practical note; an <strong>amber box</strong> is a warning or a common mistake; a <strong>bordered box</strong> groups a worked example, a formula or a comparison. Tags such as <span class="tag">preprint</span> flag the status of a source.</p>
  <h2>A word of care</h2>
  <p>The numbers in this book are estimates from simple models, checked against their sources when written. They are good for scale, design trade-offs and intuition; they are not a substitute for measuring your own system. Preprints are marked as such, and company and funding figures carry the date they were checked. If you find an error, the "Found a problem?" link on any page of the website reaches the author. Appendix D says more.</p>
</section>

<section class="front" id="contents">
  <h1>Contents</h1>
  <div class="toc">${toc}</div>
</section>`;
}

function partOpener(p) {
  const list = chapters.filter(c => c.part === p).map(c => `<li><b>${c.no}</b><a href="#ch-${c.key}">${esc((META[c.key] || {}).title || c.label)}</a><span>${esc(c.tool)}</span></li>`).join('');
  return `<section class="part" id="part-${p.id}" style="--pc:${p.color}"><div class="pn">Part ${p.n}</div><h1>${p.title}</h1><p class="pl">${p.lead}</p><ol>${list}</ol><span class="marker">@@CH:part-${p.id}@@</span></section>`;
}

function partTeach() {
  const rows = weeks.map(w => `<tr><td><b>${String(w.n).padStart(2, '0')}</b></td><td><strong>${w.title}</strong><br><span class="cap">${w.a} ${w.b}</span></td><td>${w.pages.map(k => { const c = chapters.find(x => x.key === k); return c ? `<a href="#ch-${k}">Ch. ${c.no}</a>` : ''; }).filter(Boolean).join(', ')}</td></tr>`).join('');
  return `<section class="part" id="part-teach" style="--pc:var(--c-teach)"><div class="pn">Part V</div><h1>Teach with this Book</h1>
  <p class="pl">The chapters, laid out as a one-semester course for senior undergraduates and new graduate students.</p><span class="marker">@@CH:part-teach@@</span></section>
  <section class="chapter" id="course" style="--pc:var(--c-teach)">
    <h2 data-num="V.1">How the course works</h2>
    <p>Fourteen weeks, two lectures a week. Lecture 1 sets up the physics; Lecture 2 turns it into the engineering decision a lab actually makes. Each week uses one to three chapters as its reading and its demonstrations, and every chapter ends with problems of three kinds: <span class="ptag t">Use the tool</span> on the interactive page, <span class="ptag h">By hand</span> from the formulas, and <span class="ptag d">Design</span>, a decision to make and defend. Prerequisites are undergraduate quantum mechanics and electromagnetism and enough Python to read a short script.</p>
    <p>A suggested weighting is 40% weekly problems, 20% a midterm after week 7, 30% a final project and 10% paper summaries and participation. Project ideas: design a lab end to end with Part I; reproduce a published figure with a chapter and then in your own code; write and test a calculator in Python; rebuild the error budget of a published two-qubit gate (Chapter ${chapters.find(c => c.key === 'fidelity-budget').no}); run a full optimisation workflow on a simulated stage (Chapter ${chapters.find(c => c.key === 'automation').no}); or teach one week's topic yourself.</p>
    <h2 data-num="V.2">The fourteen weeks</h2>
    <div class="tablewrap"><table><tr><th>Week</th><th>Topic and lectures</th><th>Chapters</th></tr>${rows}</table></div>
    <aside class="note"><p>The live course page, <a href="${SITE}pages/teach.html">amotoolkit.com/pages/teach.html</a>, has the in-class demonstrations for each week, printable problem sets and the solutions request for instructors.</p></aside>
  </section>`;
}

function appendices() {
  const nb = [...notebooks].map(k => { const c = chapters.find(x => x.key === k); return `<tr><td>${c ? 'Ch. ' + c.no : ''}</td><td>${c ? esc(c.tool) : k}</td><td><a href="${colab(k)}">Colab</a> · <a href="${SITE}notebooks/${k}.ipynb">${k}.ipynb</a></td></tr>`; }).join('');
  const consts = [
    ['Speed of light', 'c', '299 792 458 m/s (exact)'], ['Planck constant', 'h', '6.626 070 15 × 10⁻³⁴ J s (exact)'], ['Reduced Planck constant', 'ħ', '1.054 571 817 × 10⁻³⁴ J s'],
    ['Boltzmann constant', 'k<sub>B</sub>', '1.380 649 × 10⁻²³ J/K (exact)'], ['Elementary charge', 'e', '1.602 176 634 × 10⁻¹⁹ C (exact)'],
    ['Atomic mass unit', 'u', '1.660 539 066 60 × 10⁻²⁷ kg'], ['Bohr magneton', 'μ<sub>B</sub>', '9.274 010 078 × 10⁻²⁴ J/T  (μ<sub>B</sub>/h ≈ 1.399 6 MHz/G)'],
    ['Bohr radius', 'a₀', '5.291 772 109 × 10⁻¹¹ m'], ['Vacuum permittivity', 'ε₀', '8.854 187 813 × 10⁻¹² F/m'], ['Hartree energy', 'E<sub>h</sub>', '4.359 744 722 × 10⁻¹⁸ J'],
    ['Standard gravity', 'g', '9.806 65 m/s²'],
  ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  return `<section class="appx" id="appx-notebooks"><h1>A · Python notebooks</h1><span class="marker">@@CH:appx-notebooks@@</span>
  <p>Each notebook reproduces one chapter's calculator with the page's own constants and formulas, adds a scan, fit or simulation the page does not show, and ends with a cell that checks its numbers against the live page. They need only numpy, scipy and matplotlib. The folder, with a README, is at <a href="https://github.com/saumitraphatak/amo-career/tree/main/notebooks">github.com/saumitraphatak/amo-career/tree/main/notebooks</a>.</p>
  <div class="tablewrap"><table><tr><th>Chapter</th><th>Calculator</th><th>Notebook</th></tr>${nb}</table></div></section>
  <section class="appx" id="appx-constants"><h1>B · Constants used in this book</h1><span class="marker">@@CH:appx-constants@@</span>
  <p>CODATA values (2018 adjustment, with the 2019 SI's exact constants marked). Individual pages sometimes round these to four or five figures, which the notebooks reproduce exactly; species data (wavelengths, linewidths, saturation intensities) are given in the chapters that use them, with their sources.</p>
  <div class="tablewrap"><table><tr><th>Quantity</th><th>Symbol</th><th>Value</th></tr>${consts}</table></div></section>
  <section class="appx" id="appx-cite"><h1>C · Citing this book and the work behind it</h1><span class="marker">@@CH:appx-cite@@</span>
  <p>If this book or the website helps your research, please cite the relevant chapter or page. For results, derivations or material from the author's doctoral research, please also cite the thesis or the relevant paper.</p>
  <div class="card"><h5>This book</h5><p>S. S. Phatak, <em>Building with Atoms: a training kit for experimental AMO and neutral-atom researchers</em>, ${EDITION.replace('Edition 1 · ', 'edition 1, ')}. AMO Toolkit, <a href="${BOOK_URL}">${BOOK_URL.replace('https://', '')}</a>.</p></div>
  <div class="card"><h5>Doctoral thesis</h5><p>Phatak, S. S. (2026). <em>Cooling Lithium and Cesium Single Atoms in Optical Tweezers</em> (Doctoral dissertation, Purdue University Graduate School). <a href="https://hammer.purdue.edu/articles/thesis/_b_Cooling_Lithium_and_Cesium_Single_Atoms_in_Optical_Tweezers_b_/32867018">hammer.purdue.edu</a></p></div>
  <div class="card"><h5>Paper (sideband cooling limits, used in Chapters ${['laser-cooling', 'cooling-simulator'].map(k => chapters.find(c => c.key === k).no).join(' and ')})</h5><p>S. S. Phatak <em>et al.</em>, <em>Phys. Rev. A</em> <strong>110</strong>, 043116 (2024). <a href="https://doi.org/10.1103/PhysRevA.110.043116">doi:10.1103/PhysRevA.110.043116</a></p></div></section>
  <section class="appx" id="appx-care"><h1>D · Using this material responsibly</h1><span class="marker">@@CH:appx-care@@</span>
  <ul>
    <li><strong>Models, not measurements.</strong> Most calculators use simple, clearly stated models (two-level atoms, Gaussian beams, linear error budgets). Each chapter says what its model leaves out. Use them for scale and for design trade-offs, then measure your own system.</li>
    <li><strong>Sources.</strong> Numbers quoted from papers are as their authors report them; preprints are tagged and may change. Follow the references to the original before relying on a value.</li>
    <li><strong>Dated facts.</strong> Company, funding and roadmap facts in Part IV change quickly. Each carries the date it was checked; check again before quoting.</li>
    <li><strong>Safety.</strong> Lasers, high-current coils, RF amplifiers and vacuum systems can injure people and damage equipment. Nothing here replaces your institution's safety training, interlocks and procedures.</li>
    <li><strong>This is a snapshot.</strong> The website is corrected and extended continuously; the book is regenerated from it. The edition date is on the cover. Report errors with the "Found a problem?" panel on any page.</li>
  </ul></section>`;
}

(async () => {
  const sections = [];
  sections.push(front());
  for (const p of PARTS) {
    sections.push(partOpener(p));
    for (const c of chapters.filter(c => c.part === p)) {
      const f = path.join(rawDir, c.key + '.json');
      if (!fs.existsSync(f)) { console.warn('missing', c.key); continue; }
      const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
      const body = await saveImages(c.key, raw);
      sections.push(chapterHtml(c, body, raw));
    }
  }
  sections.push(partTeach());
  sections.push(appendices());
  const tocSide = PARTS.map(p => `<div class="tp">Part ${p.n} · ${p.title}</div>` + chapters.filter(c => c.part === p).map(c => `<a class="tc" href="#ch-${c.key}">${c.no}. ${esc((META[c.key] || {}).title || c.label)}</a>`).join('')).join('') +
    `<div class="tp">Part V · Teach</div><a class="tc" href="#part-teach">The 14-week course</a><div class="tp">Appendices</div><a class="tc" href="#appx-notebooks">A · Python notebooks</a><a class="tc" href="#appx-constants">B · Constants</a><a class="tc" href="#appx-cite">C · Citing</a><a class="tc" href="#appx-care">D · Using it responsibly</a>`;
  const draft = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Building with Atoms — a training kit for experimental AMO and neutral-atom researchers</title>
<meta name="description" content="Building with Atoms: the whole of AMO Toolkit as one book. Lasers, vacuum, locking, MOTs, control systems, optical tweezers, automation, cavity QED, imaging, cooling, qubits, Rydberg gates, benchmarking, networks and careers, with links to every interactive tool. Read online or download the PDF.">
<link rel="canonical" href="${BOOK_URL}">
<meta property="og:title" content="Building with Atoms — AMO Toolkit"><meta property="og:url" content="${BOOK_URL}"><meta property="og:image" content="${SITE}assets/og-image.png">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="katex/katex.min.css">
<style>${fs.readFileSync(path.join(__dirname, 'book.css'), 'utf8')}
.marker { position: absolute; font: 1px monospace; font-variant-ligatures: none; color: #fff; opacity: .01; }
.ia-inline { font: 12px var(--sans); border: 1px dashed var(--accent); border-radius: 4px; padding: 0 5px; }
</style></head><body>
<div class="topbar screen-only"><div class="in"><button type="button" class="topbar-btn toc-toggle" id="toc-toggle" aria-expanded="false" aria-controls="book-toc">☰ Contents</button><a class="topbar-brand" href="../home.html">⚛️ AMO Toolkit</a><span class="topbar-sub">· Building with Atoms</span><div class="topbar-actions"><button type="button" class="topbar-btn" id="book-theme-btn" aria-pressed="false">🌙 Dark</button><a class="dl alt" href="${SITE}">Website</a><a class="dl" href="${PDF_NAME}" download>Download PDF</a></div></div><div class="read-progress" id="read-progress" aria-hidden="true"></div></div>
<div class="toc-backdrop screen-only" id="toc-backdrop" aria-hidden="true"></div>
<nav class="toc-side" id="book-toc" aria-label="Book contents"><div class="toc-filter-wrap"><input type="search" class="toc-filter" id="toc-filter" placeholder="Filter chapters…" aria-label="Filter book chapters"></div>${tocSide}</nav>
<main class="book">${sections.join('\n')}</main>
<button type="button" class="back-top screen-only" id="back-top" aria-label="Back to top">↑ Top</button>
<script>(function(){const r=document.documentElement,tb=document.getElementById('book-theme-btn'),bar=document.getElementById('read-progress'),toc=document.querySelector('.toc-side'),bg=document.getElementById('toc-backdrop'),tog=document.getElementById('toc-toggle'),flt=document.getElementById('toc-filter'),topBtn=document.getElementById('back-top');function syncTheme(){const d=r.getAttribute('data-theme')==='dark';if(tb){tb.textContent=d?'☀️ Light':'🌙 Dark';tb.setAttribute('aria-pressed',String(d));}}syncTheme();if(tb)tb.addEventListener('click',()=>{const d=r.getAttribute('data-theme')==='dark';if(d){r.removeAttribute('data-theme');try{localStorage.setItem('amo-theme','light');}catch(e){}}else{r.setAttribute('data-theme','dark');try{localStorage.setItem('amo-theme','dark');}catch(e){}}syncTheme();});function setToc(o){if(!toc)return;toc.classList.toggle('open',o);if(bg)bg.classList.toggle('open',o);if(tog)tog.setAttribute('aria-expanded',String(o));}if(tog)tog.addEventListener('click',()=>setToc(!toc.classList.contains('open')));if(bg)bg.addEventListener('click',()=>setToc(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')setToc(false);});if(toc)toc.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setToc(false)));if(flt&&toc){flt.addEventListener('input',()=>{const q=flt.value.trim().toLowerCase();toc.querySelectorAll('a.tc').forEach(a=>{a.style.display=!q||a.textContent.toLowerCase().includes(q)?'':'none';});});}const links=toc?Array.from(toc.querySelectorAll('a.tc[href^="#"]')):[];const secs=links.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);function onScroll(){const h=document.documentElement.scrollHeight-window.innerHeight;if(bar&&h>0)bar.style.width=Math.min(100,Math.max(0,(window.scrollY/h)*100)).toFixed(2)+'%';if(topBtn)topBtn.classList.toggle('show',window.scrollY>700);}window.addEventListener('scroll',onScroll,{passive:true});onScroll();if(topBtn)topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));if('IntersectionObserver' in window&&secs.length){const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));let active=null;const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const a=map.get(e.target.id);if(a&&a!==active){if(active)active.classList.remove('is-active');active=a;active.classList.add('is-active');}}});},{rootMargin:'-12% 0px -78% 0px'});secs.forEach(s=>io.observe(s));}})();</script>
</body></html>`;
  fs.writeFileSync(path.join(out, 'draft.html'), draft);
  console.log('draft', Math.round(draft.length / 1024), 'KB,', chapters.length, 'chapters');
})();
