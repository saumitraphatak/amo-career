# home.html

**Purpose:** The front door. Sells the site's breadth and gives visitors several ways into the same 27 pages depending on their mindset.

## Flow
1. **Hero** — headline, tagline, 2 CTAs, 4 auto-computed stats, decorative atom canvas.
2. **"I am trying to..."** — job-to-be-done intent cards (now 6, see below) + a localStorage-personalized "Recently used tools" row.
3. **"Browse by workflow, not by alphabet"** — the main tools grid, grouped Build / Measure & Cool / Quantum (Career is intentionally not duplicated here — see below).
4. **"Build your AMO career"** — dedicated showcase for the 3 career-resource pages (AMO Group Finder, Paper Roadmap, QC Industry Map), with longer descriptions/tags than a flat grid card would carry.
5. **"Learn the underlying physics"** — Learn Quantum teaser.
6. **"Where should you start?"** — 6 Guided Paths (ordered sequences through 4 tools each) + the interactive concept-map graph (reads the `.path-card` DOM directly, no duplicated data).
7. **About** — author bio.
8. **Footer.**

## Review outcome: changed
Section 2 originally had 9 intent cards; 3 of them (Find AMO groups, Read the key papers, Prepare for AMO industry interviews) pitched the exact same pages as section 4's dedicated showcase with no new framing — pure redundancy. Removed those 3 cards, kept section 4 as the canonical "career" showcase. `.intent-grid` CSS changed from `repeat(5, 1fr)` to `repeat(3, 1fr)` for a clean 2×3 layout of the remaining 6 cards.

Section 6 (Guided Paths) was *not* touched despite also referencing career pages — it presents them as an ordered sequence, a genuinely different job than a flat pitch (see site-philosophy.md §1).
