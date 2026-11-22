// Post-fixes on index.html before a --reprint: render stray \( \) TeX, tidy stray section/step numbers.
const fs = require('fs'), katex = (() => { try { return require('katex'); } catch (e) { return require('/opt/npm-tools/node_modules/katex'); } })();
const f = process.argv[2]; let s = fs.readFileSync(f, 'utf8'); const n = {};
const parts = s.split(/(<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<annotation[\s\S]*?<\/annotation>)/);
for (let i = 0; i < parts.length; i += 2) {
  parts[i] = parts[i]
    .replace(/\\\((.{1,60}?)\\\)/g, (m, x) => { n.tex = (n.tex || 0) + 1; return katex.renderToString(x.replace(/&amp;/g, '&'), { throwOnError: false }); })
    .replace(/\$10\^\{-3\}\$–\$10\^\{-4\}\$/g, () => { n.money = (n.money || 0) + 1; return katex.renderToString('10^{-3}') + '–' + katex.renderToString('10^{-4}'); })
    .replace(/<p>\d{1,2}<\/p>(?=<h[2-4])/g, () => { n.secnum = (n.secnum || 0) + 1; return ''; })
    .replace(/<p>(?:Open (?:now ↓|chapter →|it →)|Jump ↓|Try it →)<\/p>/g, () => { n.ui = (n.ui || 0) + 1; return ''; })
    .replace(/<p>(\d{1,2})<\/p><p>/g, (m, d) => { n.step = (n.step || 0) + 1; return `<p><b class="stepn">${+d}.</b> `; })
    .replace(/<li><p>(\d{1,2})<\/p><p>/g, (m, d) => { n.step = (n.step || 0) + 1; return `<li><p><b class="stepn">${d}.</b> `; });
}
s = parts.join(''); fs.writeFileSync(f, s); console.log(n);
