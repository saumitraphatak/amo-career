# Technical & Consistency Audit — Rotation Follow-Up (2026-09-16)

Scope: a rotation re-check of the original technical/SEO/consistency audit (`docs/technical-audit-2026-09.md`, 2026-09-07) — the oldest of the eight original audits and the only one that had never been redone. Rather than re-verify each item from that report one at a time, I re-ran the full site-wide sweep it used (title/og/twitter/JSON-LD consistency, meta description length, canonical tags, `h1` counts, image alt text, `target="_blank"` safety, duplicate ids, CDN version pinning, cache-busting version consistency, favicon/analytics presence, sitemap coverage, `lang` attributes) across all 28 tool pages plus `home.html`/`404.html`/`index.html`, then diffed the results against what the September report had flagged.

## What the September 7 audit's own findings looked like now

Every single item raised in `docs/technical-audit-2026-09.md` has since been resolved — evidently across the many undocumented commits made since then. Confirmed fixed: the author-bio "PhD student/candidate" staleness (now "Purdue Physics PhD" everywhere), `decoherence-lab.html` missing from `sitemap.xml` (now present, 30/30 URLs), the 10/18 title-tag em-dash/comma split (now 28/28 em-dash), `decoherence-lab.html`'s missing References section (now section 08), the 16 meta descriptions over 160 characters (now 0 over), the stale "27 pages" counts in `CLAUDE.md`/`README.md`/`llms.txt`/`llms-full.txt` (all say 28 now), `amo-groups.html`'s section-numbering gap (now a clean 01→04 sequence), `decoherence-lab.html`'s "Quantum Computing 01" eyebrow (now "Quantum 01", matching siblings), `vacuum-systems.html`'s plain-text References heading (now a numbered `<h2>` like every sibling), `laser-planner.html`'s missing accent span on its References heading (now present), `sitemap.xml`'s missing `<lastmod>` (now on all 30 URLs), the missing `decoherence-lab.html` regression test (now `test_decoherence_lab_t1_t2_relation`, passing), and `index.html`'s missing `lang="en"` (now present). The rb-explorer/dd-playground homepage-card question flagged as "worth a look" also resolved itself — both now have `QC 05`/`QC 06` tool-grid cards. Nothing from that report is still open.

## New this pass — found and fixed

**A batch page-rename left `og:title`/`twitter:title`/JSON-LD `headline` out of sync with the real `<title>` on 11 pages**, plus a truncated `og:title` on `home.html`. At some point 11 tool pages were given clearer public names (in `<title>`, the visible `<h1>`, and `main.js`'s `NAV` array/home-page cards, which all agree with each other), but the social-share and structured-data tags on those same pages were never updated to match — so a link shared on social media, or a search engine reading the page's own JSON-LD, would still show the *old* name a search-engine or social-preview reader would never see reflected in the page's actual title bar or nav. Fixed all 12 (11 pages + home.html) by syncing `og:title`, `twitter:title`, and `"headline"` to the current `<title>`:

| Page | Old (og/twitter/headline) | New (now matches `<title>`) |
|---|---|---|
| `cooling-simulator.html` | Cooling Simulator | Laser Cooling Simulator |
| `dd-playground.html` | Dynamical Decoupling & T2 Playground | Dynamical Decoupling |
| `fidelity-budget.html` | Gate Fidelity Budget | Rydberg Gate Error Budget |
| `lab-calculators.html` | Lab Calculators | Quick Lab Console |
| `lab-techniques.html` | Lab Techniques | AMO Lab Operations Handbook |
| `laser-locking.html` | Laser Locking | Laser Locking Guide |
| `polarimetry.html` | Polarimetry Explorer | Polarimetry Simulator |
| `qc-landscape.html` | Quantum Computing Landscape | Quantum Industry Map |
| `rb-explorer.html` | Randomized Benchmarking Explorer | Randomized Benchmarking |
| `rb87-vs-yb171.html` | 87Rb vs 171Yb Qubits | Rb vs Yb Qubit Comparison |
| `rydberg-calculator.html` | Rydberg Calculator | Rydberg Blockade Lab |
| `home.html` (og:title only) | AMO Toolkit for AMO Physics *(truncated)* | AMO Toolkit for AMO Physics & Quantum Science |

**The same six old names were also still baked into the AI/docs layer** — `llms.txt`, `llms-full.txt` (both explicitly flagged in the original audit as feeding AI research tools/RAG pipelines), and `CLAUDE.md`'s per-page reference section headers. Updated all occurrences to the current names for: `lab-techniques.html` → AMO Lab Operations Handbook, `rydberg-calculator.html` → Rydberg Blockade Lab, `fidelity-budget.html` → Rydberg Gate Error Budget, `lab-calculators.html` → Quick Lab Console, `polarimetry.html` → Polarimetry Simulator, `cooling-simulator.html` → Laser Cooling Simulator (llms.txt entry text, the llms-full.txt prose cross-reference, and the llms-full.txt `## TOOL N:` section headers). Also caught two llms-full.txt headers that were half-renamed inconsistently with their own site (`RANDOMIZED BENCHMARKING EXPLORER` → `RANDOMIZED BENCHMARKING`, `DYNAMICAL DECOUPLING PLAYGROUND` → `DYNAMICAL DECOUPLING`), matching what `llms.txt` and `main.js`'s `NAV` already say for those two.

`README.md`'s tool table and `CLAUDE.md`'s `NAV` array documentation (a separate, newer section from the per-page headers above) were already fully up to date with every current name — only the older per-page `### N. <Name>` headers and the color-legend comments had drifted. Left the color-legend comments (`README.md`/`CLAUDE.md`'s `--c-lab`/`--c-cool`/etc. one-line CSS-variable annotations) alone — they're deliberately terse shorthand in an aligned comment block, not a claim about the page's actual name, so re-padding them for a cosmetic label wasn't worth the formatting risk.

**`404.html`'s `<title>` used a comma** (`Page Not Found, AMO Toolkit`) instead of the em-dash format every other page on the site now uses consistently (the exact drift the September audit's Priority-2 item fixed everywhere else, but 404.html wasn't in scope of the "28 tool pages" count that fix covered). Changed to `Page Not Found — AMO Toolkit` for consistency. `404.html` is `noindex`, so this has no SEO effect — purely a wording-consistency cleanup.

## Confirmed clean (no action)

Site-wide sweep across all 28 tool pages + `home.html`/`404.html`/`index.html`: no missing meta descriptions (except the intentionally `noindex`'d `404.html`), no `h1` counts other than exactly 1, no images missing `alt`, no `target="_blank"` link missing `rel="noopener"`, no duplicate `id`s, consistent CDN pinning (Chart.js `4.4.3`, KaTeX `0.16.11` on every page that uses them), and `main.js?v=24`/`styles.css?v=20` identical across all 30 referencing files. `robots.txt` correctly allows all crawlers including AI bots and points at both `sitemap.xml` and the `llms.txt`/`llms-full.txt` pair. All internal `pages/*.html` links resolve to real files. Page count is still 28 (no pages added or removed since the last audit); `sitemap.xml`'s 30 `<url>` entries (28 pages + home + root) are all present with `<lastmod>`.

## Not covered this round

- The color-legend comment abbreviations noted above (`README.md`/`CLAUDE.md`) — left as intentionally terse shorthand, not re-litigated.
- A full re-check of meta description *content* quality (as opposed to length) — this pass only checked the 160-character threshold the original audit flagged, not whether each description is still the best summary of its page.
- Structured-data (`ld+json`) field-by-field validation beyond the `headline` sync above — didn't check every `description`/`author`/`url` field inside each page's JSON-LD block for staleness this round.

## Verification performed

- `tests/formula_regression.py`: 11/11 passing after all edits.
- HTML tag-balance (div/ul/li/tr/td/section/p/a open-vs-close counts) checked clean on all 13 touched HTML files: `home.html`, `404.html`, and the 11 renamed tool pages.
- Every replacement was a scripted, exact-string, count-verified substitution (each old string's occurrence count was checked before writing) — no blind regex sweeps.
- No CSS/JS shared files were touched, so no cache-busting version bump was needed; confirmed `main.js?v=24`/`styles.css?v=20` are still uniform across all 30 files after the edit.
- Re-verified all internal `pages/*.html` links still resolve after the edits (no hrefs were touched, so this was a sanity check, not an expected-change check).

## Open decisions for Saumitra

None — every fix this round was a mechanical metadata-consistency sync (matching `og:title`/`twitter:title`/`headline`/doc references to the name the page, its nav entry, and its own `<title>` already agree on). No wording, design, or narrative judgment calls came up.

## Suggested next rotation

- The two "not covered" items above (meta-description content quality, full JSON-LD field audit) would make a reasonable follow-up if a future technical-audit rotation runs out of new drift to find.
- The industry-landscape company-profile freshness pass on `qc-landscape.html`, flagged as not yet re-checked by both the 2026-09-15 science audit and the 2026-09-16 link audit — still open, but belongs to a content rotation, not a technical one.
