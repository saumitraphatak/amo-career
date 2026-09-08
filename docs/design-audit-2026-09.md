# Design & Visual Consistency Audit — September 2026

Scope: audit #3 of the broader audit menu. Whether the site's CSS design-token system (the "Lab Notebook" warm-paper redesign in `css/styles.css`) is actually followed consistently everywhere, or whether some pages/scripts have drifted from it — hardcoded colors that bypass the tokens, inconsistent component treatment for the same content type, heading-hierarchy issues, and anything that visually looks broken.

Method: read `css/styles.css`'s token system top to bottom, grepped all 28 pages + `home.html` for inline styles and hardcoded values that bypass it, checked heading structure, and did a live browser pass over 8 pages in both themes.

## Fixed (safe, mechanical, no design judgment needed)

**`--r-md` was used in 13 pages but never defined anywhere in `css/styles.css`.** `.route-card`'s `border-radius: var(--r-md)` silently computed to `0` (square corners) on every one of those pages, instead of the intended rounded corner — 2 other pages (`tweezer-designer.html`, one usage in `absorption-imaging.html`) already used the correct `var(--r)` and rendered fine. This wasn't a style-drift judgment call, just an undefined variable — replaced `var(--r-md)` with `var(--r)` in all 14 occurrences across the 13 files. Verified: regression suite still 11/11.

## Needs your call — a real product decision, not a code fix

**The site's actual default theme contradicts what the CSS says it should be.** `css/styles.css`'s own comment (line ~94) states: *"Light 'Lab Notebook' is now the default; this block restores every original [dark] token... kept as opt-in."* But `js/main.js`'s `getStoredTheme()` returns `'dark'` for any visitor with no stored preference — i.e. **every first-time visitor to every page on the site currently sees the old dark/neon theme**, not the warm-paper "Lab Notebook" redesign the CSS was rebuilt around as the intended default. (`main.js`'s own top-of-file comment agrees with the code, not the CSS — it says "dark (default) / light toggle," so this reads like the redesign shipped the new CSS without flipping the JS default to match, and nobody's toggled it since.)

This is genuinely a big, site-wide, every-visitor-affecting decision, not something I want to flip silently: **do you want light "Lab Notebook" to actually be the default** (matching the CSS's stated intent — a one-line fix, `getStoredTheme()` returns `'light'` by default instead of `'dark'`), **or was dark deliberately kept as the real default** (in which case the CSS comment is what's stale, and I'd fix the comment instead and leave the behavior alone)? I did not change this either way — flagging for your decision.

## A related, bigger finding this uncovered (needs your call before I touch it)

**Chart.js grid-line colors and hand-drawn canvas strokes across ~15 pages are hardcoded to old dark-theme hex values** (`#1e293b` primarily, ~150 occurrences; a handful of `rgba(255,255,255,0.0x)` and `rgba(100,100,150,0.1x)` too) rather than being theme-aware. This is a different (and much bigger) issue than simple "hardcoded color drift" — these values look *correct* in dark mode (subtle grid lines against a near-black background) and only look wrong once a visitor switches to light mode (a harsh dark line against the cream background), which is presumably why it's gone unnoticed: dark mode is what everyone's actually been seeing (see above). The site does already have a pattern for exactly this — a global `amoInk(alpha)` helper in `main.js` that returns the correct ink color for whichever theme is active, used by several hand-drawn `<canvas>` elements — but it was never extended to the many Chart.js chart configs, which just hardcode a color literal at chart-creation time.

Properly fixing this means making every chart's grid/axis colors theme-aware (re-read the current theme and either recreate or update each chart when the toggle fires), across roughly 15 files with 20+ individual chart instances. That's a real, multi-file engineering task, not a quick pass — I didn't want to start it without knowing whether it's worth doing now (e.g., it only matters if light becomes the real default, or if you expect a meaningful fraction of visitors to use the toggle). Let me know if you want this queued up as its own follow-on task.

## Proposed, low-risk, additive (will do unless you object)

**Two pages have leftover neon accent colors from the pre-redesign 16-hue palette, never remapped to the site's current three-ink system** (`--ink-rust`/`--ink-blue`/`--ink-green`, which 26 of 28 pages correctly use): `vacuum-systems.html` defines its own `--vac: #22d3ee` (bright cyan) and `rb-explorer.html` defines `--accent: #c084fc` (bright purple) — both are literal leftover values from the old dark-theme's 16-color per-tool palette (confirmed: `rb-explorer`'s purple is exactly the old `--c-learn` value) that the bulk remap to the three-ink system apparently missed. Live in the browser these two pages visibly clash with every other page's muted rust/blue/green look. I'd remap `vacuum-systems.html` to `--ink-blue` (equipment/hardware, matching how other lab-technique pages are inked) and `rb-explorer.html` to `--ink-blue` as well (quantum-computing/fidelity content elsewhere uses blue). This is purely a "match the already-established convention" fix, low risk — will proceed unless you'd rather pick different inks or leave them distinct on purpose.

## Checked, no action needed

- `.source-tag` badges, `.accordion` components, and references sections render identically everywhere they're used — no drift.
- The per-page `--page-color`/`--page-bg`/`--page-border` accent convention is followed correctly by 26 of 28 pages.
- A duplicate (harmless, dead) `.source-tag` base-class CSS rule exists at two places in `styles.css` — cosmetically fragile but currently produces no visible bug since every real usage adds a modifier class that wins on specificity. Not fixed this pass — noted here in case a future edit to that section trips over it.

## Cosmetic nitpicks — not pursued

- 9 of 28 pages skip `<h3>` and jump from `<h2>` to `<h4>` for sub-panel titles, likely chosen for font size rather than document structure. Doesn't affect how the page reads visually; would only matter for accessibility/outline-tool users. Flagging but not fixing without a decision on whether it's worth a pass.
- Three pages implement their own local `.stat-card` variant rather than sharing one from `styles.css` — visually close enough to each other that it reads as fine; only worth consolidating opportunistically.
- Scroll-reveal animations have no `prefers-reduced-motion` guard — a real accessibility nicety, not a visual-consistency issue; noting here since it came up during the live pass but it belongs more naturally under a future accessibility audit.
