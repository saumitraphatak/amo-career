# Motion & transitions — design record (2026-09-28)

Saumitra asked for every transition to be seamless, meaning moving between pages, tabs and so on should feel as smooth as a well-made native app. This file records what moves, how, and why, so later edits keep one consistent motion language instead of a patchwork.

## Principles
- **One curve.** Everything that arrives uses `cubic-bezier(.22,.8,.26,1)`: fast out of the gate, soft landing. It is `--ease-out` in CSS and `AMO_EASE` in main.js. Things that leave use a quicker ease-in and are shorter (about 160–260 ms against 280–380 ms), so leaving never holds up arriving.
- **Small distances.** Content travels 6–16 px, never whole screens. Direction carries meaning: a tab to the right slides in from the right.
- **Nothing blocks input.** Durations stay under 400 ms. Only the theme-switch reveal runs longer, at 560 ms.
- **Motion is optional.** Under `prefers-reduced-motion`, every transition becomes an instant state change: no view transitions, no WAAPI animations, `scroll-behavior: auto`, and no press-scale. Where an API is missing (for example, no cross-document view transitions in Firefox), the site behaves exactly as before.

## What moves

| Where | What happens | How |
|---|---|---|
| Page → page (links, back/forward) | Old page fades up and out (160 ms); the new page rises 12 px and fades in (340 ms, 70 ms later). The nav stays perfectly still. | CSS `@view-transition { navigation: auto }` + `::view-transition-*(root)` keyframes; nav named `site-nav` during `pageswap`/`pagereveal` only |
| First paint of every page | Held until the nav is rendered, so the nav never pops in | `<link rel="expect" href="#amo-nav-ready" blocking="render">` + marker div after the `renderNav` script |
| Card → tool page (home tool/intent cards, start-here see-also cards), and back | The clicked card's icon flies into the new page's hero icon (420 ms, same curve) while the page dissolves around it; back navigation flies it home. Added 2026-09-29. | `view-transition-name: amo-tool-icon` set in `pageswap` on the clicked icon and in `pagereveal` on its twin, only if both are on screen and show the same glyph; cleared when the transition ends. If only one side exists it leaves/arrives with the page (`:only-child` rules) |
| Next page loading | Prefetched when you hover or touch a link | Speculation Rules (`eagerness: moderate`); `<link rel=prefetch>` fallback; skipped on Save-Data or 2G |
| Above-the-fold `.anim-in` after a page transition | Shown at once (the page transition is the entrance) instead of fading in twice | `pagereveal` handler in main.js |
| Tabs (`.tab-bar`, polarimetry's `.pol-tab-nav`) | One underline glides to the new tab; the new panel slides in from the side you moved toward, and the panel height morphs so content below doesn't jump | `AMOTransitions.attachInk` + `swap` |
| Accordions, laser-locking "Practical notes" | Open by growing from zero height (padding included) and fading in; close by shrinking; the chevron rotates on the same curve | `AMOTransitions.expand` / `collapse` |
| `<details>` (lab-calculators) | Height animates where supported | `::details-content` + `interpolate-size` (Chrome 131+) |
| Nav dropdowns | Fade + 6 px drop + tiny scale from the top-left | CSS |
| Mobile menu, search | Slide/fade in, quicker slide/fade out; the backdrop fades | `AMOTransitions.enter` / `leave` |
| Theme toggle | The new theme grows as a circle out of the toggle | same-document `startViewTransition` + clip-path on `::view-transition-new(root)` |
| Buttons (tabs, nav, CTAs, run buttons) | Press down to 97% | CSS `:active` |
| In-page anchor links | Smooth scroll to the true document position, landing below the nav; the URL hash updates | `initSmoothScroll` + `[id] { scroll-margin-top: 84px }` |

## Verification (2026-09-28)
Chromium 141, with and without reduced motion:
- **All 34 pages, both themes:** no page errors, against a baseline of none.
- **Page transitions.** A cross-document transition fires on link, logo and back navigations, and the nav exists at the moment the new page is revealed. Before this change, start-here and home painted before the nav existed.
- **Tabs.** Height morphs (e.g. 4086 → 936 px on lab-techniques). The underline lands exactly on the active tab (0 px offset), including on a horizontally scrolled tab bar at 390 px. Rapid clicking ends with one active panel and no leftover inline styles.
- **Accordions.** They animate open and closed, and rapid toggling ends in a consistent state.
- **Overlays.** Search opens, focuses and closes on Escape; the mobile menu opens and closes.
- **Theme.** The toggle switches themes.
- **Anchors.** Anchor links land 80 px from the top.
- **Page-local switchers.** Polarimetry tabs and laser-locking notes work, and the globe and time-tower click-throughs into tabs still land on and highlight the right card.
- `tests/formula_regression.py`: 11/11.

## Not done / ideas
- ~~Shared-element morphs between pages~~: done 2026-09-29 for card icon → hero icon (see the table). The nav dropdown's icons don't morph: the nav is its own `site-nav` group and nesting a second name inside it would pull the icon out of the still nav.
- Chart.js charts inside a newly shown tab still draw their own intro animation after the panel arrives. This is consistent with before, but could be shortened.
