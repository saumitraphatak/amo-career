# pages/learn-quantum.html

**Purpose:** "Quantum Computing Learning Path" — 14 topics as a short course, then a reference. The site's flagship educational page; also hosts the spaced-repetition Quantum Quiz (`#quiz-root`, see below).

## Flow (post-fix)
1. Page hero.
2. Route panel — "Course map" framing 4 topic groups: **Qubit language** (Bloch, Superposition, Rabi) → **Operations** (Gates, Measurement, Optical Pumping, Hyperfine) → **Many-qubit physics** (Entanglement, Rydberg, Two-Qubit, Decoherence) → **Algorithms and QEC** (Algorithms, Analog Sim, QEC).
3. `#quiz-root` — 28-question spaced-repetition quiz (Leitner boxes in localStorage), inserted right after the route panel, before the first topic.
4. **14 topic sections in the order the course map promises** (see below) → Resources.
5. Sticky `topic-nav` at the top mirrors the same order.

## Review outcome: changed (largest reorder on the site)
The 14 sections did **not** follow the promised 4-group order at all — they zigzagged between all four groups repeatedly. Most strikingly, **Rabi Oscillations** was promised in Group 1 ("Qubit language... phase, and Rabi rotations") but the actual section appeared at position 8 of 14, deep into Group-3 territory.

Reordered all 14 sections to: Bloch → Superposition → Rabi → Gates → Measurement → Optical Pumping → Hyperfine → Entanglement → Rydberg → Two-Qubit → Decoherence → Algorithms → Analog Sim → QEC. Also reordered the sticky `topic-nav` links and `NAV.learn` in `main.js` (used by the site-wide nav dropdown) to match.

**Verification method** (see `docs/site-philosophy.md` §7): extracted each of the 14 section blocks by exact line range, asserted each started with its own unique `id=`, reassembled in the new order, then asserted the *sorted line-multiset* of the whole file was identical before vs after — i.e., mathematically guaranteed the reorder was pure reordering with zero content loss/duplication, independent of manual line-number bookkeeping. Ran the JS syntax check and full regression suite afterward.

The quiz's "Review this topic ↑" links use `href="#anchor-id"`, which are order-independent, so the reorder didn't require any quiz-data changes.

## Design audit update (2026-09)
`.route-card`'s `border-radius: var(--r-md)` referenced an undefined CSS variable (silently rendering square corners). Fixed to `var(--r)`, the correct/intended token. See docs/design-audit-2026-09.md.

## Flow audit update (2026-09)
Found a real forward-reference: "Rydberg Atoms & Blockade" was taught before "Two-Qubit Gates" despite already using two-qubit-gate concepts in its own theory box. Swapped the two sections. This also surfaced that all 15 internal section-marker HTML comments (invisible to readers, but used to label sections for editors) were mismatched/stale, likely left behind by the earlier Rabi reorder — relabeled all 15 to match actual content and order. Also updated topic-nav link order, the "Many-qubit physics" route-card blurb, and the scrollspy JS array to match. See docs/flow-audit-2026-09.md.


## Accessibility audit update (2026-09)
Fixed a skip-link targeting bug: the page already had a real `<main class="container">` landmark, but `id="main-content"` was on the *outer* wrapping div (which also contains the sticky topic-nav) instead of on the `<main>` itself — moved the id so "skip to content" now actually skips past the topic-nav. Made all 6 `.bell-card` Bell-state selector tiles keyboard-operable; added `scope="col"` to 12 table column headers; wired `for=`/`id` on 15 label/input pairs. See docs/accessibility-audit-2026-09.md.


## Navigation/IA audit update (2026-09)
A JS bug (`initRelatedToolsPanel()`'s "already exists" guard checked for its own `.auto-related-tools` class instead of any existing `.see-also` section) was auto-injecting a second, often-contradictory "Related tools" panel right before this page's hand-written "See Also" section on every load. Fixed the guard so the auto-panel only fires when no related-tools section exists yet — this page's own hand-curated See Also block is unaffected and is now the only one shown. See docs/navigation-audit-2026-09.md.

## Navigation/IA audit update (2026-09), continued
Also added global-search keywords for all 14 `NAV.learn` sub-topic anchors on this page (Bloch Sphere, Quantum Gates, Rabi Oscillations, etc.) — previously none of them had any keywords at all, so searching e.g. "CNOT" or "T2 star" wouldn't surface the matching in-page section. See docs/navigation-audit-2026-09.md.


## Performance audit update (2026-09)
Added a `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` hint next to the existing font preconnects — this page loads KaTeX and/or Chart.js from jsdelivr with no early connection hint before this fix. See docs/performance-audit-2026-09.md.


## Science-content refresh (2026-09-15)
The "2024–25 State of the Art" box (Bell-inequality/QEC section) cited Quantinuum H2's 2024 99.9% two-qubit fidelity as the trapped-ion reference point. Extended the box (retitled "2024–26") with one added sentence noting Quantinuum's Helios system (98 qubits, all-to-all) pushed this to a peer-reviewed 99.92% two-qubit fidelity and 48 fully error-corrected logical qubits in 2026 — see the qc-landscape.html note above for the full verification. Left the original Willow/Bluvstein/H2 sentences untouched; this was a single additive sentence, not a rewrite.

## Design/visual-consistency audit update (2026-09-17)
This page's `<style>` block used `var(--mono)` for 23 monospace-styled rules — `--mono` was never defined anywhere in the codebase (only `--font-mono` exists in `css/styles.css`), so with no fallback these elements silently inherited the page's body font instead of rendering in the mono typeface. Replaced all 23 with `var(--font-mono)`. See docs/design-audit-2026-09-17.md.


## Content-flow & pedagogy audit update (2026-09-19)
Cross-reference naming drift: this page's own outgoing "See Also" card label(s) and its page-footer signature line used a stale, pre-rename name for one or more target/self pages (the site has renamed several pages more than once over its history; og/twitter/JSON-LD headline were already synced by the 2026-09-16 technical audit and the breadcrumb *category* name by the 2026-09-18 cross-page-consistency audit, but these three other copies of a page's name were not). Synced to each page's current `<title>`.

Also fixed: the "2024–26 State of the Art" theory box states Bluvstein/Harvard reached "48 logical qubits" and, two sentences later, that Quantinuum's Helios also reached "48 fully error-corrected logical qubits" — a coincidental identical headline number for two unrelated platforms stated back-to-back with nothing signaling it's a coincidence. Added "separately" before the second mention for clarity. See docs/flow-audit-2026-09-19.md.


## 3D visualization update (2026-09-28)
All four Bloch spheres (`blochCanvas`, `gatesBlochCanvas`, `measBlochCanvas`, and the Rabi section's `rabiBlochCanvas`) are now rotatable in 3D via the shared `js/orbit3d.js` (drag, arrow keys, double-click/Home reset). `bsProject()` now reads a per-canvas view (`BS_VIEWS`) whose default equals the old fixed 30°/36° projection, so the page looks identical until someone drags; `drawBloch()` remembers its last arguments (`BS_LAST`) so gate trails and measurement axes rotate with the sphere. Added depth cues only: far halves of the equator/meridians and a state vector pointing away from the viewer render fainter. No physics or state math changed.

## Pause control for looping animations (2026-09-28)
The five looping canvases (Mach–Zehnder photon `#mziCanvas`, Rabi sphere + P₁ trace, Bell-state `#tqBellCanvas`, Grover `#groverCanvas`, Rydberg array `#rydbergArrayCanvas`) each get a "❚❚ Pause animation" button under the figure.

The loops now run through the shared `js/motion.js?v=1` (`AMOMotion.loop`), which does four things:
- **Pause and play.** A pause button (WCAG 2.2.2).
- **Offscreen.** The loop stops while its canvases are offscreen or the tab is hidden. They used to run forever.
- **Time.** Frames get a timestamp that doesn't advance while paused or offscreen, so simulations resume where they stopped.
- **Reduced motion.** Under `prefers-reduced-motion` the loop starts paused on a still frame, and the button can still play it.

The drawing code is unchanged. Only the self-scheduling `requestAnimationFrame` lines moved into the helper. This closes open item 3 of docs/3d-visualization-audit-2026-09-28.md.

## 2026-09-28 (overnight): phone overflow fix
Part of the sitewide 390 px overflow fix (see `docs/overnight-log.md`). Checked with KaTeX rendered (a local copy routed in place of the CDN), at 390 and 360 px, both themes; desktop 1280 px screenshots are unchanged.
- The two hyperfine tables and the truth table are wrapped in `.table-scroll`.

## 2026-09-28 (overnight): symbols keep their case in uppercase labels
Sitewide fix in main.js/styles.css (see `docs/overnight-log.md` and CLAUDE.md "Case-safe symbols"). `text-transform: uppercase` had been turning symbols into different symbols. On this page 4 labels rendered differently after the fix, e.g. "P₁(T), POPULATION IN |1⟩" → "P₁(t), POPULATION IN |1⟩"; "P₁(T) LIVE" → "P₁(t) LIVE". No markup on the page changed apart from the cache version.

## 2026-09-28 (overnight run 3): the six animation canvases follow the theme
Backlog P0 "cream canvases in dark theme", learn-quantum part. The MZI (`mziCanvas`), live Rabi sphere and P₁ trace (`rabiBlochCanvas`, `rabiTraceCanvas`), Bell-state bars (`tqBellCanvas`), Grover bars (`groverCanvas`) and Rydberg Z₂ array (`rydbergArrayCanvas`) were cream `#faf5e9` blocks in the (default) dark theme, drawn with inks picked for cream paper.
- **How.** A page-local `LQ_INK` helper (just above the MZI script). `LQ_INK.wrap(ctx)` maps each light-theme ink to a dark counterpart as it is set on the context (fillStyle / strokeStyle / shadowColor and gradient stops): paper `#faf5e9` → `#0c1526` (`--bg-card`), dark violet/amber/green/blue inks → the site's dark accents (`#a78bfa`, `#fbbf24`, `#34d399`, `#60a5fa`), slate lines and brown labels → slate greys. Colours not in the table (the bright accents) pass through. So no drawing code or physics changed, and the light theme looks the same apart from the fixes listed below. The three canvases that only `clearRect` now have CSS background `var(--bg-card)`.
- **Theme toggle repaints** the current frame, also while paused or under reduced motion: `LQ_INK.track(frame)` remembers the last timestamp and re-calls the dt-based frame with dt = 0; the Rabi block has a `redraw()` of its stored state.
- **Fixed on the way (both themes):**
  - MZI phase-plate label "φ=0°" and the P₁ trace's "0"/"1" axis labels were drawn in the paper colour, so they were invisible; they now use the page's amber / label inks.
  - The P₁ trace was blank under reduced motion: the canvas was resized (which clears it) after drawing the only frame. Resize now happens before drawing.
  - Dragging the Rabi sphere while paused didn't redraw it; it now does (`rabiView.onChange(redraw)`).
  - Rydberg array: 4 rows at 48 px spacing didn't fit the 155 px canvas (top row under the title, bottom row cut off, last column under the legend). Spacing is now 34 px; the schematic is otherwise unchanged (halo radius still 0.82 × spacing).
  - At 390 px the live Rabi row (220 px sphere + trace side by side) left the trace ~70 px wide; the row (`.rabi-live`) now stacks below 600 px.
- **Checks.** Rendered (Chart.js stubbed): corner pixels dark `#0c1526` / light `#faf5e9` for all six; theme toggle on a paused page repaints all six; screenshots dark 1280 (animating), light 1280 and dark 390 (reduced motion), dark/light 390 of the Rabi row, reviewed. No page errors; no horizontal overflow; `smoke.js` 0 new problems.
- **Follow-up, same run: the three section Bloch spheres** (`blochCanvas`, `gatesBlochCanvas`, `measBlochCanvas`) draw on a transparent canvas over `--bg-surface` with the same light inks (`#1e3a5f` outline was barely visible in dark theme). `drawBloch()` now wraps its context too (the wrap is idempotent), and a theme toggle redraws each sphere's last state from `BS_LAST`. The helper moved to the top of the page script so it exists before the first `drawBloch()` call. Screenshots dark/light 1280 and dark 390 reviewed; toggle repaints all three.
