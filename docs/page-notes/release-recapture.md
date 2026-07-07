# pages/release-recapture.html

**Purpose:** "Single-atom Temperature" — release-recapture thermometry: forward-simulate survival probability vs release time at several candidate temperatures, to compare against a measured curve by eye.

## Flow
1. Route panel — "Read the survival curve before worrying about the derivation" + 4 cards (see below).
2. **What the Survival Curve Means** (concept) → **Run the Monte Carlo Thermometer** (the actual forward simulator: pick species/trap params + a list of candidate temperatures, see generated survival curves + trajectory snapshot) → **Species Polarizability Data** (D1/D2 transition table) → **Assumptions & Failure Modes**.
3. Sources.

## Review outcome: changed
Route-card 03 said "Fit temperature — Use experimental survival points to infer a temperature for the assumed trap potential." **That feature doesn't exist.** The tool only runs forward simulations at temperatures *you* pick; there is no UI to enter real experimental data points and have the tool fit/infer a temperature. Meanwhile the real "Species Polarizability Data" section had zero card representation.

Fixed by relabeling card 03 to describe Species Polarizability Data instead, and softened the intro paragraph's "measure survival, and fit temperature" to "...and compare against simulated curves to estimate temperature." Also found and fixed the same overclaim in `main.js`'s `PAGE_PLAYBOOKS` entry ("Fit temperature from survival" → "Estimate temperature from survival"). Second instance of the "no phantom features" pattern — see `docs/site-philosophy.md` §3. (First was mot-designer's magnetic-trap claims.)

Note: `tof-calculator.html`'s "Fit Temperature from Data" section is **not** a phantom feature — that one genuinely does a linear-regression fit of σ² vs t² from a real data table. Don't confuse the two pages.
