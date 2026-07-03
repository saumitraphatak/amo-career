# Project Context: AMO Toolkit

## Short Description
AMO Toolkit is a static educational and career resource site for atomic, molecular, and optical physics. It combines calculators, explainers, literature paths, lab technique guides, and neutral-atom quantum science learning tools.

## What This Repo Is For
This repo is the main public technical toolkit for AMO learners and researchers. It should help a student move from curiosity to practical fluency: learning what a MOT is, designing tweezers, estimating imaging fidelity, comparing atomic species, exploring Rydberg interactions, and finding papers or career routes in the field.

## Current Shape
- Static HTML/CSS/JS site with many page-level tools.
- Main entry pages: `index.html` and `home.html`.
- Shared styling: `css/styles.css`.
- Shared behavior: `js/main.js`.
- Tool and topic pages live in `pages/`, including calculators, AMO groups, atom library, laser cooling, tweezer designer, release recapture, Rydberg calculator, and career/literature resources.
- SEO/AI context files already exist: `llms.txt`, `llms-full.txt`, `robots.txt`, and `sitemap.xml`.
- `CNAME` indicates custom-domain deployment.
- `tests/formula_regression.py` provides a place to verify formulas used by calculators.

## Design Intent
This should feel like a serious technical workbench, not a marketing site. Keep pages dense but readable, with strong visual hierarchy, small accurate diagrams, and clear calculator outputs. When adding a tool, prefer correctness and citations over flourish.

## Scientific Maintenance Notes
- Check all formulas against primary sources or standard AMO references.
- When adding calculators, include units, assumptions, and warning states for invalid regimes.
- Keep neutral-atom and tweezer pages aligned with current literature.
- Avoid hand-wavy numbers where users might use outputs experimentally.

## Local Preview
Open `index.html` directly or serve the folder with a simple local server if browser security blocks anything. Most functionality is static.

## Deployment
Push to GitHub. The custom domain and GitHub Pages configuration should handle deployment. Update `sitemap.xml` when adding or renaming pages.

## Good Future Improvements
- Add a contributor guide for adding new physics pages consistently.
- Add regression tests for every numerical calculator.
- Add short source notes or references to pages that contain formulas.
- Add a glossary page for recurring AMO notation.
