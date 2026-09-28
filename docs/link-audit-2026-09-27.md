# Link Audit — Rotation Follow-Up (2026-09-27)

Scope: a rotation re-check of the link audit (`docs/link-audit-2026-09-16.md`, most recently done 2026-09-16 — tied with the technical audit as the two oldest un-rechecked audits in the eight-audit rotation, and link rot compounds with time). This pass covered two buckets: (1) verifying the roughly 40 external links that have been added to the site since the 09-16 audit (mostly the 2026-09-22 comparison-page additions and the not-yet-committed 2026-09-26 science-audit additions — arXiv preprints, Nature articles, DOIs, and company/press pages for the quantum-computing content), and (2) resolving the items the 09-16 report's own "suggested next rotation" left open: the four vendor/equipment links that fetch-tool limitations left "inconclusive" (Mini-Circuits, Thorlabs objectgroup_id=15, Kepco, Sacher Lasertechnik), and a retry on finding a live replacement for the de-linked Gooch & Housego AOM page. The qc-landscape.html company-profile freshness item the 09-16 report also flagged as open belongs to content, not link-liveness, and was substantially addressed by the 2026-09-26 science-content rotation instead (Pasqal Nasdaq listing, Anderon CHIPS award, Microsoft Majorana 2 — see that report); not revisited here.

Method: a research subagent did the first-pass fetch/verify sweep across all ~40 newly-added links plus the four previously-inconclusive ones and the Gooch & Housego search, using WebFetch and WebSearch cross-checks (several links needed a search-engine corroboration where the direct fetch returned only JS-rendered metadata or hit a bot-block — the same class of fetch-tool limitation the 09-16 audit ran into repeatedly, not evidence of a dead page). Every item the subagent flagged as dead, and every proposed replacement URL, was independently re-fetched and verified here before any edit was made, per the site's established "delegate research, verify before acting" convention.

---

## Fixed — confirmed dead, replacement verified

- **Gooch & Housego AOM page — resolved.** De-linked to plain text on 09-16 after `goochandhousego.com`'s product path 404'd and no replacement could be verified (their site blocks automated fetchers on most paths). This pass found the company rebranded to "G&H" on a new domain, `gandh.com` — independently fetched and confirmed live, with matching content (I-M0 Series germanium AOM specs, modulation-frequency/rise-time figures, Fiber-Q fiber-coupled modulators). Re-linked in the "AOM vendors" card, `pages/lab-techniques.html`.
- **Mini-Circuits `WebStore/RF-Amplifiers.html` — confirmed dead** (empty response, no `<title>` even, unlike every other Mini-Circuits page fetched the same way). Replaced with `WebStore/Amplifiers.html`, independently verified live: a 600+-model amplifier catalog (LNAs, gain blocks, MMIC/connectorized) matching what the card cites. `pages/lab-techniques.html`, "Tools & instruments" card.
- **Kepco `kepco.com/products/dc-power-supplies/` — confirmed dead**, and turns out to be the wrong domain outright, not just a stale path: `kepco.com` fails with a TLS handshake error (reproduced twice, same failure as 09-16's fetch), while the actual manufacturer (Kepco, Inc., Flushing NY, maker of the BOP bipolar line the card cites) operates at `kepcopower.com`. Replaced with `kepcopower.com/ecom.htm`, independently verified live and explicitly listing the BOP/BOP-MG/BOP-GL bipolar supplies. `pages/lab-techniques.html`, "High-current supplies" card.

## Reconfirmed inconclusive / no action

- **Thorlabs `newgrouppage9.cfm?objectgroup_id=15`** (Nd:YAG, `lab-techniques.html`) — still returns bare-title/no-body to a direct fetch, but so does every other Thorlabs `objectgroup_id` link on the same page that's already independently confirmed live (753, 5128, 756, 10760, 740 — Thorlabs product pages are uniformly heavy client-side rendering, not a page-specific problem). No search-engine snippet could confirm or deny `id=15` specifically. Left unchanged; genuinely inconclusive rather than guessable.
- **Sacher Lasertechnik Littman/Metcalf page** — flagged inconclusive by the fetch tool on 09-16, but the exact URL already on the site (`sacher-laser.com/home/scientific-lasers/tunable_lasers/littman/tec_500__tec_520_littmanmetcalf_laser_system_lion.html`) fetched cleanly this pass and matches (LION-series Littman/Metcalf laser system). No change needed — was already correct, just previously unverifiable.
- **`theory.caltech.edu/~preskill/ph229/` and the `hammer.purdue.edu` thesis link** — not re-checked this round; both were already reconfirmed alive on 09-16 via chapter-file fetches and search-index evidence respectively, and nothing suggests that's changed in 11 days.

## Confirmed clean (no action) — ~40 links added since 09-16

All independently verified alive with matching content, no mismatches or dead links found:

- **14 arXiv/DOI papers**: the 09-22 comparison-page additions (`arxiv.org/abs/2103.05273` Feshbach coil design, `2305.03828` trapped-ion race-track processor, `2306.14887` tensor-network Eagle simulation, `2308.08015`/`doi.org/10.1119/5.0161369` ultrastable-cavity review, `2501.03158` phase-contrast imaging, `2510.17286` >99.99%-fidelity ion gates, `quant-ph/0103121` qubit-tomography classic, `2305.01064` Google-supremacy-claim critique, `doi.org/10.1103/PhysRevA.64.052312`, `doi.org/10.1126/science.273.5271.84`) and the not-yet-committed 09-26 science-audit additions (`2602.22211` Quantinuum "Skinny Logic" iceberg codes, `2609.03194` Quantinuum "Helix" compact code, `nature.com/.../s41586-026-10676-4` Helios 98-qubit paper).
- **7 Nature articles** (Sycamore supremacy, Xanadu Borealis, IBM 127-qubit utility, Xanadu Aurora, Google Willow, PsiQuantum manufacturable platform, plus the Helios paper above) — all open-access, titles confirmed against their citing context.
- **~25 company/press/news pages** across IBM, Microsoft/Azure, IonQ, Xanadu, PsiQuantum, Quantinuum, Google, Honeywell/Oxford Ionics, and independent trade press (The Quantum Insider, GlobeNewswire, MIT Technology Review) — all load with content matching the claim they're cited for. One minor note, no action: `microsoft.com/en-us/quantum` 302-redirects to `azure.microsoft.com/en-us/solutions/quantum-computing`, but the redirect target is still specific and relevant (not a generic-homepage downgrade like the JILA case from 09-16), so left as-is rather than "fixed."

## Not covered this round

- The remaining ~9 Thorlabs product pages beyond the two spot-checked this pass and last (still the same JS-rendering-friction issue a real browser would resolve in seconds).
- The 134 `doi.org` / 57 `arxiv.org` links that predate the 09-16 audit and were already bucketed as near-zero-rot-risk there — not re-swept.
- Internal `amotoolkit.com` link resolution — not re-checked this round (09-16 confirmed 34/34; no pages have been added or removed since per the 09-16 technical-audit page-count check).

## Verification performed

- `tests/formula_regression.py`: 11/11 passing after all edits.
- HTML tag-balance (div/ul/li/tr/td/section/p/a open-vs-close counts) checked clean on `pages/lab-techniques.html`, the only file touched.
- All three replacement URLs (Gooch & Housego, Mini-Circuits, Kepco) were independently re-fetched and content-verified here, separately from the research subagent's own verification, before editing.
- Grepped the whole site for the three old/dead URL strings after editing — no other occurrences.
- No CSS/JS shared files were touched, so no cache-busting version bump was needed.

## Open decisions for Saumitra

None this round — all three fixes were mechanical dead-link-with-verified-replacement swaps, same category as prior link-audit passes.

## Suggested next rotation

- A real-browser check of the remaining Thorlabs `objectgroup_id` pages (still fetch-tool-unfriendly) and `id=15` specifically.
- Note: `pages/qc-landscape.html` and `pages/quantinuum-vs-ionq.html` currently have uncommitted working-tree changes from the 2026-09-26 science-content rotation (not yet reviewed/pushed) — the three new links those changes add (`arxiv.org/abs/2602.22211`, `arxiv.org/abs/2609.03194`, the Helios Nature paper) were folded into this pass's link check above so they won't need a separate check once committed.
