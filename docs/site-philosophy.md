# AMO Toolkit — Site & Page-Flow Philosophy

This file captures the *why* behind how pages on this site are structured — not the code (CLAUDE.md covers that), but the design reasoning we've converged on across repeated page-by-page reviews. Read this before restructuring navigation, route-panels, or section order on any page. Individual page notes live in `docs/page-notes/<slug>.md`.

## Core principles

### 1. Multiple entry points are good; flat duplication is not
Home page deliberately offers several "front doors" into the same tools: browse-by-workflow (the tools grid), job-to-be-done (`#intent-paths`), a dedicated career showcase, and ordered guided paths. This is intentional — different visitors arrive with different mental models (some want to browse, some have a specific job in mind, some want a suggested order). The line: each entry point must frame the *same* pages *differently enough* to earn its place. If two sections pitch the identical 3 pages with no new framing, that's redundancy, not multi-path navigation — cut or consolidate it. (We did this once: removed 3 duplicate intent-cards that only repeated the dedicated career showcase below them.)

### 2. Route-panel cards must match what they summarize — and the stakes depend on what they're summarizing
Many tool/guide pages open with a `.route-panel` (a 4-ish-card "workflow" summary) before the real content. Two different situations:

- **The content below is tabs or numbered sections (a literal index).** Here, route-cards must map 1:1, in the same order, to every real tab/section — excluding "References/Further Reading," which is consistently never a workflow step. A missing or wrong card is a real bug: a visitor may never discover a tab that isn't advertised. We found and fixed this repeatedly (lab-techniques: 4 cards → 6 to match 6 tabs; cavity-qed: 4 → 6; lab-calculators: 4 → 7; imaging-calculator: 4 → 7; absorption-imaging: added 1 missing card).
- **The content below is a linear scroll with no tabs.** Here nothing is actually hidden from a reader — cards can legitimately describe a *conceptual reasoning process* rather than a literal per-section index, and an "uncovered" section may just be supporting detail nested inside a step rather than its own step. We left rydberg-calculator's 4 conceptual cards (state → interaction → regime → caveats) alone for exactly this reason, and cooling-simulator's 4-of-6 cards alone because the two excluded tabs were reference material (Simulation Codes, References), the same category always excluded elsewhere.

When in doubt, ask rather than assume either way — this judgment call has gone both directions in practice.

### 3. No phantom features
A page's title, hero copy, route-card, or home-page tool-card description must describe what the page **actually does**, never what an old title or aspirational draft implied. We found two real instances:
- `mot-designer.html` was titled "MOT & Magnetic Trap Designer" and both the llms-full.txt entry and home-page card described a full Ioffe-Pritchard trap calculator (trap frequencies, evaporation parameter, Majorana loss warning) — none of it existed. Fix: renamed to "MOT Designer" everywhere (page, NAV label, search keywords, home card, llms.txt/llms-full.txt, README, CLAUDE.md) rather than build the missing feature.
- `release-recapture.html`'s route-card promised "fit temperature from experimental survival points" — the tool is a forward simulator only (you pick candidate temperatures, it shows you the curve; there's no data-fitting UI). Fix: reworded the card and the `PAGE_PLAYBOOKS` entry in `main.js` to describe estimation-by-comparison, not fitting.

Whenever a mismatch like this turns up, the fix is either (a) build the missing feature, or (b) correct the wording — never leave the promise and the reality disagreeing.

### 4. Theory before the interactive tool that assumes it
If a page has both a conceptual explanation ("what is a bimodal histogram / what does detection fidelity mean") and a live tool that only makes sense once you know that concept (a live histogram preview driven by your current inputs), the explanation must come first. We reordered `imaging-calculator.html` for exactly this: the live "Fluorescence Histogram — Threshold Preview" used to appear *before* the section explaining what dark/bright peaks and detection fidelity even are. Moved the theory section ahead of the live preview.

### 5. If you state a course map, honor it exactly
`learn-quantum.html`'s route-panel promised 4 topic groups (Qubit language → Operations → Many-qubit physics → Algorithms/QEC) but the actual 14 sections zigzagged between all four groups repeatedly (Rabi was promised in group 1 but appeared at position 8 of 14). Reordered all 14 sections — plus the sticky `topic-nav` and `NAV.learn` in `main.js` — to match the promised grouping exactly. Verified with a content-preserving diff (same set of lines, different order) before writing, given the size of the change.

### 6. Cache-busting discipline
Any edit to `js/main.js` or `css/styles.css` requires bumping the shared `?v=N` query param across **every** HTML file (`sed` across `pages/*.html home.html 404.html`), per CLAUDE.md's existing convention — otherwise returning visitors keep a stale cached copy. We do this once per batch of JS/CSS edits, not per individual page tweak.

### 7. Verify before writing, especially for large reorders
For multi-hundred-line content moves (imaging-calculator's section swap, learn-quantum's 14-section reorder), extract exact line ranges via script, assert each block starts with the expected unique marker (an `id=` or heading text) before reassembling, and for full-file reorders assert the *sorted* line-multiset of before/after are identical — this guarantees no content was lost, duplicated, or silently altered, independent of how careful the manual line-number bookkeeping was.

## How this review works, mechanically
We go page by page (home.html first, then each `pages/*.html` in NAV order). For each page: explain its concept and section-by-section flow, flag anything that looks like a real flow/content problem (not just stylistic), and either fix it immediately (for clear-cut, previously-established patterns) or ask before making the change (for judgment calls or large/risky edits like reorders). Approved-as-is pages get a short note; changed pages get the change and the reasoning recorded in `docs/page-notes/<slug>.md`.
