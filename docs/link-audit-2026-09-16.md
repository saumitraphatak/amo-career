# Link Audit — Rotation Follow-Up (2026-09-16)

Scope: a rotation re-check of the link audit (`docs/link-audit-2026-09.md`, 2026-09-08 — link rot compounds with time, and it had gone the longest of any audit without a re-check). This pass covered three buckets: (1) re-verifying the four links the original audit left as INCONCLUSIVE due to fetch-tool errors, (2) spot-checking the handful of new external links added by the 2026-09-15 science-content rotation for typos, and (3) a first-ever pass over the "equipment-vendor and software-documentation links," a category the original audit explicitly skipped as lower-priority. Internal `amotoolkit.com` links were also re-verified (still 34/34 clean — three more pages exist since 09-08, all resolve).

Method: same as before — fetch each URL and read for real content vs. an error/parked/blank page, cross-checking with a web search when a fetch is inconclusive (bot-blocked, TLS handshake quirk, or JS-only rendering). Every replacement URL below was independently verified to load the *matching* content before being applied — not just "loads something."

---

## Fixed — confirmed dead or stale, replacement verified

- **`cua.mit.edu/groups/ketterle-group/` — confirmed 404.** Used on `amo-groups.html` and `atom-library.html`. The sibling `/groups/vuletic-group/` and `/groups/zwierlein-group/` URLs on the same page both still work fine, so this isn't a site-wide CUA restructuring — just Ketterle's specific group-page slug being gone. Replaced with `cua.mit.edu/people/wolfgang-ketterle`, his current CUA profile page (verified live, correct research group).
- **`jila.colorado.edu/yelabs/research/laser-cooling-and-trapping` — 302-redirects to a generic top-level `colorado.edu/jila` page,** losing the specific research context the `laser-cooling.html` resource card promises ("Research overview + papers" on gray molasses/EIT cooling). Replaced with `colorado.edu/jila/ye-group-research`, the current Ye-group research landing page (verified to cover the right research area).
- **`qubig.com/electro-optic-modulator.html` — confirmed 404.** Replaced with `qubig.com/products/electro-optic-modulators_eom`, QUBIG's current EOM product-category page (verified).
- **`jenoptik.com/products/optical-systems/electro-optical-components` — confirmed 404.** Replaced with `jenoptik.com/products/optoelectronic-systems/light-modulation`, Jenoptik's current light-modulator page (verified — note the page itself says Jenoptik discontinued its liquid-crystal modulator line, but the integrated-optical amplitude/phase modulators our page cites are still there).
- **`bkprecision.com/categories/dc-power-supplies` — confirmed 404, *and* the anchor text was wrong** (linked text read "itech" — a different, real vendor, ITECH Electronics — while the `href` pointed at B&K Precision). Rather than guess at ITECH's own URL structure (their site didn't render usable content for verification), fixed both bugs against what could be verified: updated the href to `bkprecision.com/products/power-supplies` (confirmed live) and relabeled the link text to "B&K Precision" to match where it actually points. `pages/lab-techniques.html`.
- **`ametek-programmablepower.com` — the whole domain no longer resolves.** AMETEK Programmable Power rebranded to `programmablepower.com` (confirmed via their own official 2020s site-relaunch press release, and the new domain loads their real product catalog). Updated.
- **`lesker.com/newweb/technical_info/technical_info_overview.cfm` — confirmed 404.** Kurt J. Lesker's technical-info hub moved to `lesker.com/newweb/techinfo.cfm` (verified — same content: tech support, VacTran, reference tables). `pages/vacuum-systems.html`.
- **`moglabs.com/products/lasers/tunable-lasers/ldl/` — redirects, because MOGLabs was acquired by Santec** (confirmed via Santec's own acquisition press release). The redirect target the server offers is Santec's *LDL* product page — but our link is labeled "MOGLabs CEL," a *different* MOGLabs product line (the Cateye external-cavity laser, not the Littrow diode laser). Checked further and found Santec kept the CEL line under its own URL too; linked to the correct product-matched page, `inst.santec.com/products/quantum-instruments/quantum-lasers/cel`, rather than blindly following the redirect to the wrong product.
- **`lasercomponents.com/us/laser-diodes/` — confirmed 404** (2 occurrences, `pages/lab-techniques.html`). Replaced with `lasercomponents.com/us/products/emitters/`, their current laser-diode/emitter category page (verified).

## De-linked — confirmed dead, no trustworthy replacement found

- **`goochandhousego.com/products/acousto-optic-modulators/` — confirmed 404.** Unlike the others above, I couldn't verify a replacement: their site root and every category-page guess either 404'd or was blocked by `robots.txt` for automated fetchers, and web search only surfaces third-party resellers (AMS Technologies, Coherent Scientific, etc.), not G&H's own current page structure. Rather than link to a reseller as if it were the manufacturer, or guess a URL I couldn't verify, followed the site's established precedent (the Tiecke potassium-PDF case from the original link audit): de-linked the vendor name to plain text, `Gooch & Housego (site unreachable)`, in the AOM-vendors card on `pages/lab-techniques.html`. Worth a manual check — the domain itself is very likely alive (robots.txt blocking bots is not the same as the page being gone), just not verifiable from here.

## Reconfirmed inconclusive (fetch-tool limitation, not evidence of being broken)

- **`theory.caltech.edu/~preskill/ph229/`** — the bare directory URL still loops redirects for the fetch tool (same as 2026-09-08), but this pass went further: individual chapter files under the *exact same path* (`.../ph229/notes/chap1.pdf`, `chap6.pdf`, etc.) fetch cleanly and are actively indexed by search engines, confirming the course page is genuinely alive — the directory-index request itself is just fetcher-unfriendly. No change; stronger evidence than last time that this is a non-issue.
- **`hammer.purdue.edu`** thesis link — still 403s to the fetch tool; reconfirmed via search that the exact thesis record is indexed and live (same conclusion as 2026-09-08).
- **New this pass:** `minicircuits.com/WebStore/RF-Amplifiers.html`, `thorlabs.com/newgrouppage9.cfm?objectgroup_id=15`, and the Sacher Lasertechnik Littman/Metcalf page all returned empty or nav-only content to the fetch tool — consistent with heavy client-side (JS) rendering rather than a dead page, especially for Thorlabs, one of the most reliably-alive domains in the industry. `kepco.com/products/dc-power-supplies/` failed with a TLS handshake error at the fetch-tool level, the same class of quirk flagged for Preskill's page last time. None of these are treated as confirmed-broken; none were changed.

## Confirmed clean (no action)

- **Internal links:** 34/34 `amotoolkit.com` links resolve to real files (3 more than 09-08's 29, from pages added since — decoherence-lab.html primarily).
- **New links added by the 2026-09-15 science-content rotation** (6 checked: the Nature Helios paper, the two June-2026 Nature Physics papers, the NIST/PsiQuantum press release, the QuEra roadmap press release, the Quantinuum H2 launch press release) — all load, all match their cited content. No typos.
- **First-time equipment/software pass, ~35 links confirmed clean:** AA Opto-Electronic, Isomet, EOSpace, Siglent, iSeg, Wavelength Electronics, Vescent, RIO Lasers (now part of Luna Innovations, still live), eagleyard/TOPTICA products, TOPTICA DL pro, QuTiP (root + 3 doc pages), joblib, scikit-learn, ARC-Alkali-Rydberg-Calculator docs, pylcp (python-laser-cooling-physics) docs, ae6ty.com Smith-chart page.
- `cua.mit.edu/groups/vuletic-group/` and `.../zwierlein-group/` — both still live (checked to rule out a site-wide CUA restructuring when the Ketterle one 404'd; it's specific to that one slug).

## Not covered this round

- The 134 `doi.org` and 57 `arxiv.org` links, plus GitHub links, Quantum Computing Stack Exchange, and `algassert.com/quirk` — treated the same as the original audit's near-zero-rot-risk bucket (permanent identifiers / major platforms).
- The remaining individual Thorlabs product/`objectgroup_id` pages (7 total on the site) beyond the one spot-checked — Thorlabs as a domain is about as low-risk as it gets; not worth the fetch-tool's JS-rendering friction for a full sweep this round.
- Company profile pages on `qc-landscape.html` (IonQ, Rigetti, D-Wave, Microsoft, Pasqal, Infleqtion) that the 2026-09-15 science audit flagged as not re-audited for *content* freshness — that's a different kind of check than link liveness and is better suited to a future science-content or industry-landscape rotation.

## Verification performed

- `tests/formula_regression.py`: 11/11 passing after all edits.
- HTML tag-balance (div/ul/li/tr/td/section/p/a open-vs-close counts) checked clean on all five touched files: `pages/amo-groups.html`, `pages/atom-library.html`, `pages/lab-techniques.html`, `pages/laser-cooling.html`, `pages/vacuum-systems.html`.
- Every replacement URL was independently fetched and read for matching content before being applied — none were swapped in on a redirect target or search-result title alone (see the MOGLabs/Santec case above, where the naive redirect target was actually the *wrong* product).
- No CSS/JS shared files were touched, so no cache-busting version bump was needed.

## Open decisions for Saumitra

- **Gooch & Housego link (de-linked):** if you know their current AOM product-page URL, it's a one-line re-link (`pages/lab-techniques.html`, "AOM vendors" card). I couldn't verify one from here — their site blocks automated fetchers on most paths.
- Everything else this pass was a mechanical dead-link-or-stale-domain fix with an independently-verified replacement, so no other judgment calls came up.

## Suggested next rotation

- A closer look at the ~10 remaining Thorlabs/Mini-Circuits/Kepco/Sacher links flagged inconclusive here, ideally from something that can render JS (a real browser check would resolve these in seconds; the fetch tool can't).
- The industry-landscape company-profile freshness pass on `qc-landscape.html` that the 2026-09-15 science audit flagged as not yet re-checked this year (IonQ, Rigetti, D-Wave, Microsoft, Pasqal, Infleqtion).
