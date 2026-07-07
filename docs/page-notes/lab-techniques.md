# pages/lab-techniques.html

**Purpose:** "AMO Lab Operations Handbook" — an operations reference organized by lab task, not component name.

## Flow
1. Page hero.
2. Route panel — "Start from the lab problem, then open the matching drawer" + workflow cards (now 6, see below).
3. **6 tabs**: 🔦 Align Light, 🌀 Prepare Atomic States, 📡 Drive RF & Microwaves, 💻 Optimize & Simulate, 🔴 Lock & Route Lasers, ⚠️ Debugging & Pitfalls — each holding nested accordions (e.g. under Align Light: mode-matching + calculator, PM fiber alignment, cat's-eye retroreflector geometry, AOM types).
4. **References & Further Reading**.

## Review outcome: changed
Route panel originally had only 4 cards for 6 tabs — "Stabilize and optimize" tried to summarize *three* separate tabs (Optimize & Simulate, Lock & Route Lasers, Debugging & Pitfalls) at once. Expanded to 6 cards, one per tab, in the tab bar's exact left-to-right order (`.route-grid` uses `auto-fit`, so no CSS change was needed for the extra cards). This was the first instance of the "route-cards must match literal tabs" pattern — see `docs/site-philosophy.md` §2.
