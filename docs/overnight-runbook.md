# Overnight build runbook

These are the standing instructions for the **unattended overnight improvement runs**. They fire hourly from about 22:49 to 05:49 Mountain time. Saumitra asked for them on 2026-09-28:

> Keep improving things on the website … get creative. Stay scientific. Amaze the audience with features, information, creative way of displaying everything and integrating to perfection. Don't leave out little things. Keep bugs away.

Each run is a **fresh session with no memory**. Everything it needs is in this repo: this runbook, `docs/overnight-backlog.md` (what to do next) and `docs/overnight-log.md` (what previous runs did). Read all three first, then `CLAUDE.md` and `docs/site-philosophy.md`.

## 0. Where things are
- **The repo.** It's the connected folder `amo-career` on Saumitra's Mac. With `mcp__remote-devices__device_bash`, use `cd $HOME/mnt/amo-career`; the device tools (stage/commit) see it as `/Users/curious/Projects/amo-career`. Edit files **in place on the Mac** with `device_bash` (python read-modify-write or `sed -i`), never by re-typing a whole file from tool output.
- **The Mac VM** has `node` and `python3` but **no browser**. Rendered-page tests run in the **cloud workspace** (`Bash`), where Chromium and the `playwright` package are preinstalled (`require('playwright')` resolves; never run `playwright install`).
- **Test harness in the repo:**
  - `python3 tests/formula_regression.py` (run on the Mac; must print `OK 11 …` or more).
  - `tests/browser/smoke.js`: loads every page, dark + light at 1280 px and dark at 390 px, and reports page errors, console errors and horizontal overflow. It compares against a baseline so pre-existing issues don't hide new ones.
  - `tests/browser/chartstub.js`: the Chart.js stand-in the smoke test injects.
  - **Real Chart.js / KaTeX for rendered checks.** npm and the CDNs are blocked in the cloud workspace, but GitHub release downloads work:
    - `curl -sSL -o cjs.tgz https://github.com/chartjs/Chart.js/releases/download/v4.4.3/chart.js-4.4.3.tgz` (use `package/dist/chart.umd.js`);
    - `https://github.com/KaTeX/KaTeX/releases/download/v0.16.11/katex.tar.gz`.

    In Playwright, route the jsdelivr URLs to these files and strip `integrity="…"` in your test server's HTML responses (never in the repo).

## 1. Start of run (in this order)
1. **Lock.** Read `.git/overnight-lock` (it's inside `.git`, so it's never committed).
   - If it says `running <ISO time>` and that time is less than 55 minutes ago, another run is still working: write a one-line note in your final summary and **stop**.
   - Otherwise write `running <now ISO time>` into it: `date -u +%FT%TZ | sed 's/^/running /' > .git/overnight-lock`.
2. **Git hygiene.** Use `GIT_OPTIONAL_LOCKS=0` on every read-only git command (`GIT_OPTIONAL_LOCKS=0 git status`, `… git log`, `… git diff`). A stranded `.git/index.lock` blocks Saumitra's push, and this sandbox cannot delete files.
   - If `.git/index.lock` already exists, **do not run any git write command**. Note it in the log and summary and stop.
3. **Leave other people's work alone.**
   - `GIT_OPTIONAL_LOCKS=0 git status --short`: files already modified or untracked belong to Saumitra or to the evening "AMO Toolkit daily audit" task. **Never edit, stage or commit them.** If the next backlog item needs one of them, pick a different item.
   - The untracked `Claude outputs/` folder is Saumitra's; ignore it.
4. **Baseline.** Run `python3 tests/formula_regression.py` on the Mac. If it is not green before you start, fix that first; that is the run's item.
5. **Pick the work.** Read `docs/overnight-log.md` (the last entries) and `docs/overnight-backlog.md`.
   - Take the highest-priority unchecked item. Bugs (P0) always come before features.
   - If an item turns out to need Saumitra's judgment, write it under "Needs Saumitra" in the backlog and move on.
   - You may add new items to the backlog. Propose them in the same format, keep them scientific and grounded, and put the best ones where the next run will see them.

## 2. Doing an item
- **Research before building.** Any physics number, record or company fact must come from a primary or authoritative source found this run (WebSearch/WebFetch). Record the URL in the page notes and in the log.
  - Never invent data, and never present an estimate as a measurement.
  - Label schematics as schematics.
  - Flag preprints as preprints; the site already has `source-tag` styles for peer-reviewed / preprint / company / roadmap.
- **Follow the site's rules.** See `CLAUDE.md`, `docs/site-philosophy.md` and the page's `docs/page-notes/<slug>.md`.
  - Static HTML/CSS/vanilla JS; CDN libraries only (no build step, no npm deps on the site).
  - "No phantom features."
  - Route-panel cards stay 1:1 with sections where they are 1:1 today.
  - Theory before tool.
- **Every new interactive must:**
  - work in dark **and** light theme and at 390 px;
  - honour `prefers-reduced-motion`;
  - have a pause control if it moves for more than 5 s (use `js/motion.js` → `AMOMotion.loop`, or the patterns in `js/globe3d.js`);
  - pause offscreen;
  - be keyboard-reachable or have an equivalent text version;
  - give canvases `data-export-ready="true"` plus `max-height:none !important` where needed (see CLAUDE.md "canvas traps").
- **Build on what exists.** Shared helpers:
  - `AMOTransitions` (main.js): tab/accordion/overlay motion.
  - `AMO3D.orbit` / `AMO3D.project` (`js/orbit3d.js`): rotatable 3D.
  - `AMO3D.globe` (`js/globe3d.js`).
  - `AMOVersus` (`js/versus.js`).
  - `AMOMotion.loop` (`js/motion.js`).
  - Page-local helpers go in their own `js/<name>.js?v=N`, loaded only by the pages that use them. A change to `main.js`/`styles.css` needs the sitewide cache bump described in CLAUDE.md (all `pages/*.html`, `home.html` **and `404.html`**).
- **Small is fine.** Bug fixes, stale numbers, a missing alt text, a mis-sized chart on phones all count ("don't leave out little things").

## 3. Verify (every item, before committing)
1. **Tests on the Mac.** `python3 tests/formula_regression.py` must be green, `node --check` every JS file you touched, and inline scripts must parse. Tag balance must be unchanged in every page you touched (compare the counts of `<div`, `<section`, `<table`, `<tr`, `<td`, `<button`, `<script` against `git show HEAD:<file>`).
2. **Rendered check in the cloud.** Both tars are written inside `.git/`, so they are never committed and can still be staged.
   - **Baseline** (from git, not from your edits): on the Mac, `GIT_OPTIONAL_LOCKS=0 git archive HEAD pages home.html 404.html js css tests > .git/overnight-base.tar`.
   - **Current working tree:** `tar cf .git/overnight-new.tar pages home.html 404.html js css tests`.
   - Stage both with `device_stage_files` (tested: files under `.git/` stage fine; they land at `/mnt/user-data/uploads/amo-career/.git/…`), then extract them into two folders in the cloud workspace.
   - **Run** `node <new>/tests/browser/smoke.js <new> --baseline <base>` from a directory where `playwright` resolves. **No new problems allowed.**
   - Then write a targeted Playwright check for the thing you built. Exercise it (click, drag, toggle, both themes, 390 px, reduced motion), take screenshots, and **look at them with Read**. Fix what looks wrong: overlapping labels, clipped text, unreadable colours in one theme, empty canvases.
3. **Numbers.** Check every number you added against its source or formula with a short script.

## 4. Commit (per item)
- `git add <exact paths>` only: never `-A`, never `.`, never someone else's modified file.
- Use one commit per item. The message says what changed and why, and ends with the attribution lines from **this session's system reminder** (the `Co-Authored-By` / `Claude-Session` lines).
- **Record, in the same commit or a follow-up:**
  - append a dated `## …` entry to `docs/page-notes/<slug>.md` for every page changed;
  - update `CLAUDE.md` if a convention, file or version changed;
  - tick the item in `docs/overnight-backlog.md`;
  - append a log entry to `docs/overnight-log.md` saying what was done, sources used, tests run and anything left over.
- **After every commit, check for stranded git files.** The Mac VM cannot unlink, so `git commit` leaves `.git/HEAD.lock`, `.git/objects/maintenance.lock` and `tmp_obj_*` files behind (the commit itself succeeds). A leftover `HEAD.lock` blocks the next commit. Move them, don't delete them: `mv .git/HEAD.lock .git/_to_delete/HEAD.lock.<run>`, the same for `maintenance.lock`, and each `tmp_obj_*` to `.git/_to_delete/.git_objects_<dir>_<name>`. Then `GIT_OPTIONAL_LOCKS=0 git fsck --connectivity-only` should print nothing. Mention it in the log so Saumitra can empty `.git/_to_delete/`.
- **Pushing.** Try `git push` once at the end of the run. From the Mac VM it currently fails (the egress proxy returns 403 for github.com). If it fails, **leave the commits**: Saumitra pushes in the morning. Never force-push, rewrite history, change remotes/credentials, or create branches.

## 5. Stopping
- Aim for **one substantial item or 2–4 small ones per run**. Keep going while there is clearly room.
- When the conversation is getting long (roughly two-thirds of the context used), or you hit a usage limit warning, finish or cleanly abandon the current item:
  - committed work stays;
  - uncommitted edits to tracked files you made are restored with `git checkout -- <those files>`, never deleted;
  - the log says what was in progress.
- **Never end a run with your own uncommitted edits in tracked files.** New untracked files you created but didn't finish: move them into `_to_delete/` (deletion isn't allowed) and mention them.
- Release the lock: `date -u +%FT%TZ | sed 's/^/free /' > .git/overnight-lock`.
- Finish with a short summary: what shipped, the commits, what's next, and anything that needs Saumitra.

## 6. Never
- Never delete files. Never touch `.github`, `CNAME` or deployment settings. Never weaken or edit a test to make it pass.
- Never change the site's default theme, fonts or palette sitewide, restructure the nav, or remove content without it being a backlog item marked OK. Put such ideas under "Needs Saumitra".
- Never add analytics, trackers, external embeds, or anything that sends visitor data anywhere.
- Never copy text or figures from papers beyond short quotes. Never reproduce logos or brand art for companies. Draw generic, labelled schematics instead.
