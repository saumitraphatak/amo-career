# pages/decoherence-lab.html

**Purpose:** Deep-dive companion to `learn-quantum.html#decoherence` — dissipation (T1), dephasing (T2*/Tφ), and combined decoherence (T2) for a laser-driven two-level atom, taught through live paired Bloch-sphere + detector-signal simulations rather than static diagrams or prose alone.

## Flow
1. Page hero — no route-panel (see below), small live Bloch-sphere preview in `.page-hero-anim` (same engine as §02, rendered small).
2. Sticky `.topic-nav` — 7 anchor links, 1:1 with the numbered sections (trivially, since it's just anchors, not conceptual workflow cards).
3. **7 numbered sections** (linear scroll): 01 Bloch sphere refresher (the shared OBE the whole page runs on) → 02 Coherent driving baseline → 03 Dissipation/T1 (Torrey's exact solution) → 04 Dephasing/T2*-Tφ (live 5-member ensemble average) → 05 Decoherence/T2 combined (same ensemble, both effects) → 06 How you'd measure each one (protocol table) → 07 Cheat sheet.

## Design decisions
- **No route-panel.** Per site-philosophy.md §2, a route-panel earns its place by describing a conceptual reasoning process or matching tabs 1:1. This page has neither tabs nor a natural 4-ish-step reasoning arc distinct from the numbered sections themselves — the sticky topic-nav already covers wayfinding without duplicating the section list as a second, harder-to-keep-in-sync index.
- **Physics engine, not canned animation:** all four dual-view panels (§02–§05) run one shared RK4 integrator over the exact boxed optical Bloch equations from §01 (Steck §5.5), with different (Γ, γ⊥, Δ) per panel. §05 (combined) is the same integrator with both Γ>0 and Δ≠0 at once — not a separately-derived formula. §04/§05's "ensemble average" vector is a live mean over 5 independently-integrated members, not a canned envelope curve.
- **Multiple oscillations before decay (user request):** Γ tuned to ≈0.12·Ω so panels 03/05 show ~5–6 full Rabi periods decaying before the sweep resets, rather than a near-instant collapse — the point is to let the damped oscillation itself be visible, not just the envelope.
- **Color mapping uses the site's existing 3-ink system** (`--ink-rust`/`--ink-blue`/`--ink-green`), not new hex values: rust = dissipation, blue = dephasing, green = coherent baseline (chosen for the "still fine, no decay" connotation), and the combined-decoherence trace blends rust→blue live via `getComputedStyle` (re-read on `data-theme` change via `MutationObserver`) — this is why it looks correct in both the light "Lab Notebook" and dark-toggle themes without any page-local dark override.
- **Sourcing:** every closed-form equation shown (Torrey's damped-resonance solution in §03, the undamped generalized-Rabi solution per ensemble member in §04) was checked against a full private read-through of Steck's *Quantum and Atom Optics* (the user's own annotated chapter notes), not derived fresh or approximated — cited inline by section number.

## Nav / home integration
- Inserted as **first entry** in `NAV.quantum` (`js/main.js`) at the user's explicit request ("first page on Quantum computing tab") — key `decoherence-lab`, color `#a13c1c` (rust), icon 🌀.
- Added as tools-grid card **`QC 01`** on `home.html` — this slot was unclaimed (existing cards jump straight to `QC 02`; `learn-quantum`, `rb-explorer`, and `dd-playground` were never given tools-grid cards at all, reached instead via NAV/footer/guided-paths — pre-existing site pattern, not something this change altered). Existing `QC 02/03/04` cards were left untouched rather than renumbered.
- Added footer link under "Measure & QC", added `PAGE_PLAYBOOKS` and `RELATED_TOOLS` entries in `main.js` so the auto-injected playbook/related-tools panels render on this page like every other tool page. No `REFERENCE_TRAILS` entry added — falls back to `defaultTool`, consistent with most other pages.
- `main.js` cache-bust bumped `v20`→`v21` site-wide (sed across `pages/*.html home.html 404.html`); `styles.css` left at `v18` since it wasn't touched.
