# pages/lab-calculators.html

**Purpose:** "Quick Lab Console" — the site's grab-bag of small, frequently-needed calculators, organized by lab question rather than alphabetically.

## Flow
1. Page hero.
2. Route panel — "Pick the calculation by the lab question" + workflow cards (now 7, see below).
3. **7 tabs**: 🔭 Beam & Imaging Optics, 📡 RF Power & AOMs, ⚛️ Atomic Scales, 🪤 Tweezers & Cavities, 🔢 Angular Momentum (Clebsch-Gordan), 🎛️ Modulators (EOM/AOM sidebands), 🔄 Unit Converter.

## Review outcome: changed (largest mismatch found)
Route panel had only 4 cards for 7 tabs — **2 entire tabs** (Beam & Imaging Optics, Angular Momentum) had zero card representation at all, and "Check an AOM/RF chain" ambiguously tried to cover both the RF Power tab and the separate Modulators tab. Expanded to 7 cards, one per tab, in exact tab-bar order: Design beam optics → Check an AOM/RF chain → Estimate atom scales → Design a tweezer → Couple angular momenta → Check modulator sidebands → Convert lab units fast.
