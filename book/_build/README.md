# Building with Atoms — build sources

The book is generated from the live pages, so it stays in step with the site.

1. `extract.js <site> <rawDir>` opens every page in headless Chromium (light theme, KaTeX and Chart.js served
   locally), opens accordions and hidden tab panels, and converts each page's content into simple book HTML:
   headings, paragraphs, lists, tables, KaTeX, SVG figures (with their computed colours inlined), canvas
   figures as PNG snapshots, dense CSS widgets as screenshots, calculator controls as one "interactive on the
   website" marker and small readout cards as stat chips.
2. `build.js <site> <rawDir> <out>` assembles the cover, front matter, contents, part openers, one chapter per
   story page (in NAV order, with links to the live page, the Python notebook and the course week, and the
   page's problems from `pages/teach.html`), Part V (the course) and the appendices. Images go to `img/`.
3. `polish.js <out>` cleans the draft in a browser (section numbers, stat grids, interactive notes, snapshot
   captions), writes `index.html`, prints the PDF twice and fills the contents with page numbers found by
   `markers.py` (pypdf).
   On the way it runs `patch.js` (renders stray `\( \)` TeX with KaTeX, folds stray step and section numbers
   into the text, drops "Open chapter →" buttons) and strips mouse-only hints ("drag to rotate").
4. `node book/_build/polish.js book --reprint` re-runs only the clean-up and the two PDF passes on the existing
   `index.html` (about 3–4 minutes), for CSS or wording changes that do not need a fresh extraction.

Requirements: Node with `npm i playwright sharp katex chart.js` (KaTeX and Chart.js are served to the pages
locally because the build blocks the network; set `KATEX_DIST` or `CHARTJS_UMD` to use other copies), Python
with pypdf, and the Lora and Inter fonts installed for the PDF. Regenerate the whole book after changing pages:

    node book/_build/extract.js . /tmp/raw && node book/_build/build.js . /tmp/raw book && node book/_build/polish.js book
