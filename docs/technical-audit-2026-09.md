# Technical & Consistency Audit — September 2026

This audit runs alongside the extensive content-flow review already recorded in `docs/site-philosophy.md` and `docs/page-notes/*.md`. That review is genuinely thorough — I cross-checked every finding below against it before writing anything down, and several things I initially flagged (route-panel-to-tab mismatches on `polarimetry`/`zernike`/`rydberg-calculator`/`qc-landscape`/`paper-syllabus`, the References-section placement on `laser-planner`, the section-numbering gap on `amo-groups`) turned out to already be deliberate, discussed decisions, so they're left out or noted as "already known" rather than presented as new. What follows is either genuinely new or a confirmed-still-open item from your own backlog. Part 1 is site-wide/cross-cutting; Part 2 goes page by page.

## Part 1 — Site-wide findings

### Priority 1

**The author bio says "PhD student" / "PhD candidate" in five places, on a finished doctorate.** `home.html` line 1028 — the visible About section every visitor reads — says "Saumitra Phatak is a Physics PhD student at Purdue University." `README.md`, `llms.txt`, and `llms-full.txt` all say "Physics PhD candidate." Meanwhile `home.html`'s own meta description and `CLAUDE.md`'s header already say plain "Purdue Physics PhD" — so the site currently contradicts itself, and the most-read spot has the stale version. Since `llms.txt`/`llms-full.txt` also feed AI research tools and RAG pipelines, any AI summarizing the site right now would describe you as still in school.

**`pages/decoherence-lab.html` is missing from `sitemap.xml`.** It's fully live and NAV-integrated (nav dropdown, homepage tools-grid as `QC 01`, footer links, and cross-linked from `learn-quantum`, `fidelity-budget`, and `dd-playground`'s related-tools panels — confirmed in its own page-note), but the sitemap's 29 `<url>` entries stop at the pre-existing 27 pages plus home/root. Search engines will still find it by crawling links, but it gets no sitemap discovery/priority signal — it's the one page with no story at all in the SEO layer.

### Priority 2

**Title-tag / `og:title` punctuation is split roughly 10/18 between two formats.** Ten pages (e.g. "MOT Designer — AMO Toolkit") use the em-dash format from `CLAUDE.md`'s own page template; eighteen (e.g. "Atomic Species Selector, AMO Toolkit") use a comma instead. Since the template already picks the em-dash as canonical, a batch rename toward that would settle it.

**`decoherence-lab.html` is the only page on the entire site with no References section**, despite being unusually well-sourced — every physics claim is cited inline in small captions (Steck's *Quantum and Atom Optics* §5.2/5.4/5.5, Fox's *Quantum Optics: An Introduction* Ch. 9), but those citations never get collected into the numbered "References & Further Reading" section every sibling page ends with. A reader who wants to go verify a source has to hunt through figure captions instead of scrolling to the bottom.

**16 of 28 pages have meta descriptions longer than the ~160-character point where Google typically truncates search snippets.** `remote-entanglement.html` is the longest at 249 characters; `polarimetry.html` (203), `laser-cooling.html` (199), and `tweezer-designer.html` (191) are also well over. Not broken, just a snippet that gets cut off mid-sentence in search results rather than reading as tight as the pages already under the limit.

**Site-wide counts are stale in the documentation layer.** `CLAUDE.md` still says "27 pages," and its File Structure / NAV-object / "All Primary Tool Pages" listings don't mention `decoherence-lab.html` at all — it was added after that file was last synced. `README.md` undersells further at "20+ interactive research tools" against an actual 28. `llms.txt`/`llms-full.txt` were already flagged internally as behind (both still open with "This site contains 27 tool and content pages") and are now a page further out of date than that note assumed.

### Worth a look, lower priority

**`rb-explorer.html` and `dd-playground.html` have no homepage tools-grid card** — reachable only via nav dropdown, footer links, or an incidental guided-path route. `decoherence-lab.md`'s own notes confirm this is pre-existing, not new. But both are "Deep dive"/"Simulator" kind tools like `remote-entanglement.html`, which does get a card, so it's worth a deliberate yes/no rather than staying an inherited gap.

**`amo-groups.html`'s section numbering starts at "02"** — already caught in its own page-note as a "minor cosmetic note, not fixed... worth a one-line fix next time this page is touched." Confirming it's still open, not re-discovering it.

**`decoherence-lab.html`'s hero eyebrow reads "Quantum Computing 01"; every sibling Quantum page reads just "Quantum NN"** (`learn-quantum.html`: "Quantum 01", `rydberg-calculator.html`: "Quantum 02"). Its page-note explains why the *number* wasn't bumped when the page was inserted at the front of the category (deliberate, left as-is) — but the category *label* wording drift to "Quantum Computing" looks unintentional rather than part of that decision.

**`vacuum-systems.html`'s References section is markup as plain `<strong>` text, not the numbered `<h2 class="section-title">` every sibling page's References section uses** — it's the one page where "References" doesn't get its own number in the 01→07 sequence.

**`laser-planner.html`'s "References & Further Reading" heading is missing the numbered `<span class="accent">` every other heading on that page has** (01 through 05 all have one). Purely cosmetic — the section's *position* was already reviewed and approved.

**`sitemap.xml` has no `<lastmod>` on any of its 29 URLs.** Not required, but a low-cost freshness signal, and the file already carries `<changefreq>`/`<priority>` for every entry.

**`tests/formula_regression.py` doesn't yet guard `decoherence-lab.html`'s physics** — the T1/T2/T2* relation ($1/T_2 = 1/(2T_1) + 1/T_2'$) or the Torrey damped-resonance solution its own notes describe sourcing carefully. Matches README's own "Good Future Improvements" line: "Add regression tests for every numerical calculator."

**`index.html` (the GitHub Pages redirect) is missing `lang="en"`**, unlike every other page. `CLAUDE.md` says never touch this file's redirect logic; adding a `lang` attribute doesn't touch that, so flagging as optional given how trivial the page is.

### What's already solid

Across all 28 tool pages plus `home.html`/`404.html`/`index.html`: no broken internal links, no `<img>` missing `alt`, no `target="_blank"` link missing `rel="noopener"`, no duplicate `id`s (sampled), exactly one `<h1>` per page, a favicon and Google Analytics tag on every page, and fully consistent CDN pinning (Chart.js `4.4.3`, KaTeX `0.16.11`). `main.js?v=21`/`styles.css?v=18` are identical across all 30 referencing files, including `404.html` — the exact spot `CLAUDE.md` warns has drifted before. The homepage hero stats (`27+` in the raw HTML) are in fact live-corrected to `28` at runtime by `updateHeroStats()` reading `NAV.tools.length` — `CLAUDE.md`'s "Known Issues" note calling this unfixed is itself the stale part; the code was already fixed. Nearly every number input site-wide carries a `min=` constraint against physically nonsensical values — the one page that doesn't (`lab-calculators.html`'s unit-converter fields) is a free-form converter where unconstrained values are correct (dBm power, for instance, is legitimately negative), not an oversight.

## Part 2 — Page by page

Content flow, phantom-feature checks, and route-panel-to-section mapping were already reviewed exhaustively for every page below (see the citations to specific `docs/page-notes/*.md` decisions). I'm not re-opening any of that; each entry below is either a new observation from this pass or a pointer back to something already decided, so you can see at a glance which pages have open items and which don't.

### Build

**atom-library.html** — Reviewed and approved as a coherent narrowing funnel (compare-any-two → see-all-at-a-glance → drill in → who's using it → further reading). No new issues found. Given it's the most interactive-complexity-dense page on the site (7 tabs × 16 accordions), it's the one I'd manually click through after any shared-CSS or `main.js` change, since it has the most surface area for a silent regression.

**laser-planner.html** — Flow already reviewed and approved (the References block being always-visible above the dynamic output is intentional). Only new item: the References heading is missing its numbered accent span that every other heading on the page has (see Part 1).

**mot-designer.html** — The page's one big issue (phantom "MOT & Magnetic Trap Designer" title/feature) was already found and fixed by renaming rather than building the missing calculator — the canonical "no phantom features" example in `site-philosophy.md`. Numbering and References section (06) are both clean. No new issues found.

**laser-locking.html** — Reviewed and approved: three techniques taught in isolation (SAS/beat-note/PDH tabs), then synthesized in a Summary tab with a real "our lab: Cs + Li system" example. No new issues found.

**lab-techniques.html** — Its route-panel/tab mismatch (4 cards for 6 tabs) was the first instance of that pattern found and fixed site-wide. No new issues found.

**polarimetry.html** — Reviewed and approved; the 5 numbered tabs themselves serve as the wayfinding device, so the lack of a separate route-panel is a deliberate, considered choice, not a gap. No new issues found.

**zernike.html** — Same pattern as polarimetry, reviewed and approved, plus a "what problem is this solving" framing card called out as a nice touch. No new issues found.

**cavity-qed.html** — Its route-panel/tab mismatch (4 cards for 6 sections) was found and fixed. No new issues found.

**vacuum-systems.html** — Flow approved as a clean conceptual-to-practical guide. New item: its References section is styled as plain bold text rather than the numbered section heading every sibling page uses (see Part 1).

**tweezer-designer.html** — Called out in its own page-note as "the best-executed route-panel on the site" — verified anchor-linked cards resolving to real section IDs. No new issues found.

### Measure & Cool

**imaging-calculator.html** — Had two real issues already found and fixed: a theory-after-tool ordering bug (moved) and a route-panel missing a card for an entire section. Both resolved. No new issues found.

**release-recapture.html** — Had a phantom-feature claim ("fit temperature from experimental points") already found and fixed by rewording, both on-page and in `main.js`'s playbook text. No new issues found.

**tof-calculator.html** — Confirmed its "Fit Temperature from Data" is a genuine linear regression (unlike release-recapture's phantom claim) — explicitly verified, not assumed. No new issues found.

**lab-calculators.html** — Had the largest route-panel/tab mismatch on the site (4 cards for 7 tabs, two tabs with zero representation) already found and fixed. No new issues found on this pass.

**absorption-imaging.html** — Had a missing anchor ID and missing route-card for its Species Reference section, already found and fixed. No new issues found.

**laser-cooling.html** — The technique ordering (interleaving free-space and sideband methods rather than grouping them) was flagged and explicitly left as the user's deliberate call — not re-raising it. No new issues found.

**cooling-simulator.html** — Reviewed and approved; the two tabs excluded from its route-panel (Simulation Codes, References) were explicitly checked and confirmed as legitimate reference-material exclusions, not a gap. No new issues found.

### Quantum

**decoherence-lab.html** — The newest page; see Part 1 for its two open items (no References section, "Quantum Computing 01" vs. sibling pages' "Quantum NN" eyebrow label) and the sitemap/docs gaps.

**learn-quantum.html** — Had the largest reorder on the site (all 14 topic sections resequenced to match the promised 4-group course map, verified with a line-multiset identity check). No new issues found.

**rydberg-calculator.html** — A route-panel/section-count mismatch that looked similar to cavity-qed's was explicitly assessed and left as-is, since the cards describe a conceptual reasoning process rather than a literal index — a considered judgment call, contrasted directly with cavity-qed in its own notes. No new issues found.

**fidelity-budget.html** — Reviewed and approved as a clean linear flow (setup → budget → compare to published benchmarks → formulas → references). No new issues found.

**rb-explorer.html** — Reviewed and approved, no route-panel needed for its 9-section linear flow. See Part 1 for the homepage-card-visibility question it shares with dd-playground.

**dd-playground.html** — Reviewed and approved; already follows the theory-before-tool ordering without needing a fix. See Part 1 for the homepage-card-visibility question.

**remote-entanglement.html** — Reviewed and approved; interactive calculator correctly placed after all conceptual/mechanism/historical grounding. No new issues found.

### Career

**amo-groups.html** — See Part 1: the "02 Featured Directory" numbering gap is a confirmed-still-open item from the page's own notes, not new.

**paper-syllabus.html** — Reviewed and approved; its 4 route-cards were confirmed to be a genuinely different organizing axis (reading track) from its 4 tabs (career stage), not a 1:1 index — explicitly distinguished from the lab-calculators/cavity-qed cases where that distinction didn't hold. No new issues found.

**qc-landscape.html** — Reviewed and approved on the same "conceptual reading strategy, not literal index" grounds as rydberg-calculator. No new issues found.

**rb87-vs-yb171.html** — Reviewed and approved as a sensible build-up-then-synthesize structure (physics category by category, then a head-to-head table, then ecosystem/references). No new issues found.
