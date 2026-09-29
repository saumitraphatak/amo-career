# pages/lab-calculators.html

**Purpose:** "Quick Lab Console" — the site's grab-bag of small, frequently-needed calculators, organized by lab question rather than alphabetically.

## Flow
1. Page hero.
2. Route panel — "Pick the calculation by the lab question" + workflow cards (now 7, see below).
3. **7 tabs**: 🔭 Beam & Imaging Optics, 📡 RF Power & AOMs, ⚛️ Atomic Scales, 🪤 Tweezers & Cavities, 🔢 Angular Momentum (Clebsch-Gordan), 🎛️ Modulators (EOM/AOM sidebands), 🔄 Unit Converter.

## Review outcome: changed (largest mismatch found)
Route panel had only 4 cards for 7 tabs — **2 entire tabs** (Beam & Imaging Optics, Angular Momentum) had zero card representation at all, and "Check an AOM/RF chain" ambiguously tried to cover both the RF Power tab and the separate Modulators tab. Expanded to 7 cards, one per tab, in exact tab-bar order: Design beam optics → Check an AOM/RF chain → Estimate atom scales → Design a tweezer → Couple angular momenta → Check modulator sidebands → Convert lab units fast.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.


## Accessibility audit update (2026-09)
Converted the `.page-wrap` skip-link target to a real `<main>` landmark; converted the CG-table's single-line `<div class="accordion-header">Background &amp; Selection Rules</div>` to a real `<button>`; added `scope="col"` to the Key-β-Values table and to the JS-generated Clebsch–Gordan table's column headers, and converted the CG table's `<td class="row-label">` row headers to `<th scope="row">` (added a matching `table.cgt th.row-label` CSS rule so the visual style, originally written for a `td` selector, still applies); wired `for=`/`id` on 102 label/input pairs — by far the largest single-page instance of the site's most common accessibility gap (visually-adjacent but programmatically unassociated labels). See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Technical audit update (2026-09-16)
`og:title`, `twitter:title`, and the JSON-LD `headline` still said the page's old name, "Lab Calculators" -- stale from whenever this page was renamed to "Quick Lab Console" in `<title>`, the on-page content, and `main.js`'s `NAV` entry/home-page card. Synced all three meta fields to the current name, plus the matching reference in `llms.txt`/`llms-full.txt` and `CLAUDE.md`'s per-page section header. See docs/technical-audit-2026-09-16.md.

## Cross-page consistency re-audit (2026-09-18)
`BreadcrumbList` JSON-LD named this page's category "Measure & Cool" (the category's pre-rename name), while the hero eyebrow and NAV dropdown already said "Trap, Image & Cool." Corrected the breadcrumb to match. See docs/cross-page-consistency-audit-2026-09-18.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its BreadcrumbList JSON-LD leaf name used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`. See docs/flow-audit-2026-09-19.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- `.calc-grid` children get `min-width:0`, so the fiber/collimation formulas scroll inside their box instead of making the grid 503 px wide (only visible with KaTeX rendered; the CDN-free smoke test missed it). The Bessel-sideband table is wrapped in `.table-scroll`.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 3 labels rendered differently after the fix, e.g. "Β" → "β"; "J₀(Β)²" → "J₀(β)²". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight run 3): symbol tooltips work with keyboard, touch and screen readers
Sitewide change in main.js / styles.css (`main.js?v=35`, `styles.css?v=25`). The dashed-underline `.tip[data-tip]` symbols (5 on this page) only showed their bubble on mouse hover: the spans weren't focusable, a tap on a phone did nothing reliable, and screen readers never got the text. Now each is focusable (Tab shows the bubble, with a focus ring), its text is its accessible description (`aria-describedby` → a hidden `#amo-tip-descs` list), a tap or click pins the bubble open (tap again, tap elsewhere or Esc closes it), and Esc hides a keyboard-focused bubble (WCAG 1.4.13). A tip inside a `<label>` stays open when the tap moves focus to the label's input. Edge alignment now measures the first line box, so an anchor that wraps no longer misplaces its bubble. Checked in Playwright: all tips focusable with matching descriptions, focus shows / Esc hides / refocus shows, tap opens at 390 px (touch emulation), click elsewhere closes; `smoke.js` 0 new problems on all 34 pages.

## 2026-09-29: EOM sideband canvas follows the theme
- `eom_canvas` filled cream (`#f2ead9`) in the dark theme too. Its context is now wrapped with `js/canvas-ink.js?v=2`, and it redraws on a theme toggle (`AMOInk.onTheme(calcEOM)`).
- Still open: the Gaussian-beam canvas's propagating-dot loop (`animDot`) runs forever without a pause control.

## 2026-09-29: Gaussian-beam dot can be paused
The propagating dot on `gbCanvas` ran a forever loop. There is now one `AMOMotion.loop` per canvas (Pause button, offscreen stop, reduced-motion still frame), and each recompute swaps in the new frame (`gbAnimate`). The dot's phase uses a non-negative modulo, because timestamps can precede its start after a pause.

## 2026-09-29: chapter navigation (Saumitra: "not obvious that the page has more information")
The page's main tabs are now "chapters" (`data-chapters`, `AMOChapters` in main.js; see `docs/site-philosophy.md` §8):
- a chapter bar pinned under the site nav, with an n / N counter;
- a Previous/Next pager at the end of every chapter;
- deep links: `#ch-…`, or any `#id` inside a hidden chapter, opens that chapter.

The seven route-cards open their chapters (`data-chapter` 1–7). The Page Playbook above it is now a slim two-line note instead of a large card. Checked with Playwright in dark 1280 and light 390 px:
- the bar sticks at 64 px while scrolling a chapter;
- clicking a tab deep inside a chapter lands at the start of the new one;
- the pager, index cards, keyboard (Enter), deep links and hash updates all work.

`smoke.js` on all 34 pages: 0 new problems.
