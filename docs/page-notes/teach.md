# pages/teach.html

**Purpose:** "Teach with AMO Toolkit": the site as a one-semester course, for instructors (and students working alone). Supports a faculty application.

## Created 2026-11-22 (Saumitra: "Teach with AMO Toolkit. A 14-week course plan that maps the pages to lectures, with a problem set for each interactive tool and solutions available on request")
- **Flow:** hero (counts) → 01 how it works (audience, each week, three problem types) → 02 fourteen week cards in three phases → 03 problem sets (one `<details>` per week, expand / collapse / print) → 04 assessment (40/20/30/10) and six final projects → 05 solutions on request (mailto with a template), adapting, feedback.
- **Problems:** 86, three per page for 28 story pages plus two for the paper roadmap. Each "By hand" problem uses a formula the page itself uses (recoil uses the library's single-photon ħ²k²/2mk_B convention; cavity g₀ uses the page's √(3πΓc³/2ω²V)). Problems were written against the actual controls of each page (inputs and buttons read from the HTML); decoherence-lab has no controls, so its "tool" problem is about the animations.
- **Not published:** solutions. The mailto uses the address already in the site's "Found a problem?" panel.
- **Linking:** `COURSE_WEEK` in main.js adds "Teach with it → week N" to each page's playbook note; nav "Teach" (desktop and mobile), home paths intro and footer, Start Here hero; search entry.
- `test_teach_page` pins the week structure, the COURSE_WEEK map, the counts and the links.
