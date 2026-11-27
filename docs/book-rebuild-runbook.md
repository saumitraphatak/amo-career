# Book rebuild runbook (scheduled, nightly)

Standing instructions for the scheduled task **"AMO Toolkit book rebuild"**. Saumitra asked for it on 2026-11-27 so the
book (`book/index.html` and `book/building-with-atoms.pdf`) never falls behind the site. Each run is a fresh session with
no memory. Most nights nothing has changed and the run should stop within a minute.

## 0. Where things are
- The repo is the connected folder `amo-career` on Saumitra's Mac: `cd $HOME/mnt/amo-career` in `device_bash`;
  the stage/commit tools see it as `/Users/curious/Projects/amo-career`.
- The Mac has `node`, `python3` and `git` but **no browser**. The build runs in the **cloud workspace** (`Bash`), which has
  Chromium, Playwright, `sharp`, `pypdf`, `qpdf`, `pdftoppm` and the Lora and Inter fonts preinstalled.
- How the build works: `book/_build/README.md`. What the book contains and its checks: the book section of `CLAUDE.md`.

## 1. Decide whether to build
1. **Lock.** Read `.git/overnight-lock`. If it says `running <time>` less than 2 hours ago, another run (or Claude/Gemini in a
   live session) is working: stop and say so. Otherwise write
   `echo "running $(date -u +%FT%TZ) book-rebuild" > .git/overnight-lock`.
2. If `.git/index.lock` exists, run no git write command: note it and stop (release the lock first).
3. **Anything new?** Compare the last commit that touched the book with the last commit that touched its sources:
   ```
   B=$(GIT_OPTIONAL_LOCKS=0 git log -1 --format=%ct -- book/index.html)
   S=$(GIT_OPTIONAL_LOCKS=0 git log -1 --format=%ct -- pages home.html js/main.js css/styles.css book/_build vendor)
   ```
   If `S` is not newer than `B`, write `free <now>` to the lock and stop: "book is current".
4. **Never build from someone's half-finished work.** If `GIT_OPTIONAL_LOCKS=0 git status --short` lists any modified or
   untracked file under `pages/`, `book/`, `js/`, `css/` or `vendor/`, stop and say which (release the lock). Build only what
   is committed.

## 2. Build in the cloud
1. On the Mac, archive the committed tree without the old PDF:
   `git archive --format=tar HEAD -o "Claude outputs/book-src.tar" -- . ':!book/building-with-atoms.pdf'`
   (`Claude outputs/*.tar` is gitignored). Stage it with `device_stage_files` and unpack it into an empty folder in the cloud
   workspace, e.g. `$W/site`.
2. In the cloud, from `$W`:
   ```
   node site/book/_build/extract.js site raw            # ~8 min; KaTeX and Chart.js come from site/vendor
   node site/book/_build/build.js site raw site/book
   node site/book/_build/polish.js site/book            # ~4 min; prints "pdf pages N markers M stable true" and the qpdf size
   ```
   Then move `site/book/draft.html` out of the book folder (it must not be committed).
3. **Check before shipping** (all must pass; otherwise ship nothing and report what failed):
   - `polish.js` printed `stable true` and a page count within ±10% of the previous PDF;
   - `cd site && python3 tests/formula_regression.py` ends in `OK` (it includes `test_book`);
   - no `NaN`, `undefined` or raw `\(`/`$$` in `site/book/index.html` text;
   - render three random PDF pages with `pdftoppm -r 50` and look at them (layout not broken, figures present).

## 3. Ship
1. Tar the outputs: `site/book/index.html`, `site/book/building-with-atoms.pdf`, `site/book/img/`. Keep each tar under 25 MB
   (put the PDF in its own tar). Put them under `/mnt/user-data/outputs/`, write them to the Mac's `Claude outputs/` folder
   with `device_commit_files` (by `stagedPath`), and unpack there with `tar --overwrite -xf`.
2. Images that the new build no longer references: list `book/img/*` not named in `book/index.html`, move them to
   `Claude outputs/_to_delete/book-img-<date>/` (this sandbox cannot delete) and `git rm --cached` them so the commit
   records the removal.
3. Commit with explicit paths only (`git add book/index.html book/building-with-atoms.pdf book/img`), message
   `Book: rebuild from <short hash of the source commit>` plus the attribution lines from the session's system reminder.
   git leaves `.lock` and `tmp_obj_*` files it cannot delete: move them into `.git/_to_delete/<date>/`, never under
   `.git/refs`.
4. Append one line to `docs/page-notes/book.md` (date, source commit, page count, PDF size) in the same commit.
5. Do not push (Saumitra pushes). Write `free <now>` to the lock. Summarise in two lines: built or not, and why.
