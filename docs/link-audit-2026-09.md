# Link Audit — September 2026

Scope: every external hyperlink on the site (398 unique URLs across 30 pages), checked for link rot — dead domains, 404s, parked pages, or stale post-rebrand URLs. This is audit #1 of the broader audit menu (link/structural/design/etc.) — mechanical and fast, so it went first.

Method: extracted every `href="http…"` across the site and bucketed by risk. Internal `amotoolkit.com` links (29) were checked for free via the filesystem — does the target file actually exist in the repo. External links were bucketed by domain type: `doi.org` (134) and `arxiv.org` (57) are permanent identifiers with near-zero rot risk and were not individually fetched. The remaining ~55 "high-risk" links — academic personal/lab pages and quantum-computing company homepages, the two categories that actually go dark or get restructured — were fetched one by one and read for real content vs. an error/parked/blank page. Equipment-vendor and software-doc links were not covered this round.

## Results

**Internal links: 29/29 clean.** Every absolute `amotoolkit.com` link resolves to a real page in the repo. No action needed.

**High-risk external links: 1 confirmed dead, 3 stale-but-working, 51 clean.**

### Fixed

- **`http://www.tobiastiecke.nl/archive/PotassiumProperties.pdf` — confirmed dead (404).** Used twice on `atom-library.html` as the potassium D-line data-sheet reference alongside Steck's alkali data. Worth noting: this isn't a fluke on our end — Steck's own canonical alkali-data index page (`steck.us/alkalidata/`) links to the exact same dead URL as its potassium reference, so this is a known, site-wide-in-the-community broken link, not something specific to us. I searched for a working mirror (Semantic Scholar, ResearchGate, a couple of third-party PDF-hosting sites) and didn't find one I'd trust as an equivalent authoritative replacement, so rather than link to a low-quality mirror I de-linked both references — they now read "K properties, Tiecke (2010) — source offline" as plain text instead of a dead link. If you know of a good mirror, happy to re-link it.
- **`https://dwavesys.com` → `https://www.dwavequantum.com/`** — D-Wave's old domain redirects (works, but stale). Updated on `qc-landscape.html`.
- **`https://meetiqm.com` → `https://iqm.tech/`** — IQM's old domain redirects (works, but stale). Updated on `qc-landscape.html`.
- **`https://sqc.com.au` → `https://sqc.com/`** — Silicon Quantum Computing's old domain 302-redirects to their new one. Updated on `qc-landscape.html`.

### Flagged, not changed (couldn't get a clean verdict)

- **`hammer.purdue.edu`** (two separate links: the `home.html` thesis-download link with a `?file=` query param, and the bare domain) returned a 403 to the fetch tool both times. I cross-checked via search and the thesis page itself (same URL slug) shows up in search results as a live Purdue Figshare record, so this reads as the fetch tool getting bot-blocked rather than the page actually being gone — figshare-hosted sites commonly do this. Left as-is; worth a manual click-check since I can't fully confirm it from here.
- **`theory.caltech.edu/~preskill/ph229/`, `cua.mit.edu/groups/ketterle-group/`, `jila.colorado.edu/yelabs/research/laser-cooling-and-trapping`** — all three failed with SSL/connection-timeout errors at the fetch-tool level (not a 404 or parked-page response). Inconclusive rather than confirmed-broken; these are the kind of academic pages that sometimes have TLS cert quirks that a real browser tolerates but an automated fetcher doesn't. Left as-is — worth a manual check next time you're on the site.
- **`rigetti.com`** — flagged as a possible blank/broken page on the first pass, came back fully loaded with normal content (nav, product info, footer) on re-check. False alarm, no change made.

### Confirmed clean (no action)

All other ~48 checked links — academic lab pages (Rice, Purdue Hood Lab, NC State JET Lab), company sites (Oxford Ionics, QuEra, Xanadu, Silicon Quantum Computing post-redirect), the Quantinuum press-release link, Purdue's GitHub Enterprise, and others — loaded with real, on-topic content.

## Not covered this round

- Equipment-vendor links (laser/optics/vacuum suppliers) and software-documentation links (Python libraries, Chart.js/KaTeX docs) — lower rot risk, not individually checked.
- The 134 `doi.org` and 57 `arxiv.org` links — permanent identifiers, essentially never rot at the domain level. Could still be spot-checked for the rarer case of a wrong/typo'd DOI, but that's a different kind of check (a "citation accuracy" pass, not a link-rot pass) and wasn't in scope here.
