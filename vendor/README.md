# Vendored libraries

The site serves its two JavaScript libraries itself instead of from a CDN, so a page works when the CDN is down or
blocked and the service worker can cache everything a page needs. Never edit these files; to upgrade, add a new
version folder, switch the pages to it, then remove the old one.

| Library | Version | Files | Source | Licence |
|---|---|---|---|---|
| KaTeX | 0.16.11 | `katex/0.16.11/` (`katex.min.css`, `katex.min.js`, `contrib/auto-render.min.js`, `fonts/*.woff2`) | `https://github.com/KaTeX/KaTeX/releases/download/v0.16.11/katex.tar.gz` | MIT, © Khan Academy and other contributors |
| Chart.js | 4.4.3 | `chart.js/4.4.3/chart.umd.js` | `https://github.com/chartjs/Chart.js/releases/download/v4.4.3/chart.js-4.4.3.tgz` (`package/dist/chart.umd.js`) | MIT, see `chart.js/4.4.3/LICENSE.md` |

The three KaTeX files are byte-identical to the CDN copies the pages used before (their SHA-384 hashes match the
`integrity` attributes those pages carried). The KaTeX stylesheet also lists `.woff` and `.ttf` fonts; only the
`.woff2` files are vendored, which every browser the site supports loads first. `chart.umd.js` is the official,
already-minified UMD build; the pages previously loaded jsDelivr's re-minified `chart.umd.min.js` of the same version.
Plotly (one page, `polarimetry.html`) still loads from `cdn.plot.ly`.
