# pages/cavity-qed.html

**Purpose:** "Cavity QED Coupling Lab" — turn cavity/atom geometry into a coupling-regime classification.

## Flow
1. Page hero.
2. Route panel — "Turn geometry into a physical regime" + workflow cards (now 6, see below).
3. **6 numbered sections** (linear scroll, not tabs): 01 Cavity & Atom Parameters → 02 Results → 03 Coupling Rates vs Finesse (chart) → 04 Coupling Regimes → 05 Reference Systems → 06 Common Mistakes.

## Review outcome: changed
Route panel had 4 cards for 6 sections — card "Classify regime" skipped over section 03's chart entirely, and "Check intuition" quietly folded together sections 05 and 06. Expanded to 6 cards, 1:1 with the numbered sections (`.route-grid` again `auto-fit`, no CSS change needed).

Note: this page is a linear scroll, not tabs, so the mismatch was lower-stakes than lab-techniques' (nothing was actually hidden from a reader who scrolls the whole page) — but the user's call was still to fix it for consistency. Contrast with rydberg-calculator, where a similar-looking gap was judged intentional and left alone (site-philosophy.md §2).
