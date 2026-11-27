# Records-board check runbook (scheduled, monthly)

Standing instructions for the scheduled task **"AMO Toolkit records check"**. Saumitra asked for it on 2026-11-27 because
quantum-computing records go out of date within weeks, and `pages/records.html` (and Appendix H of the book, generated
from it) must show a date the reader can trust. Each run is a fresh session with no memory.

## 0. Where things are
- The repo is the connected folder `amo-career` on Saumitra's Mac: `cd $HOME/mnt/amo-career` in `device_bash`.
  Edit in place there (python read-modify-write), never by re-typing a file from tool output.
- The data: `var CATS = [...]` in `pages/records.html`. Five categories (`two-qubit`, `one-qubit`, `scale`, `coherence`,
  `qec`); each row is `{ pf, st, val, err, what, who, src, flags }`:
  - `pf` platform: `atom`, `ion`, `sc`, `spin` or `ph`;
  - `st` status: `peer` (peer-reviewed), `pre` (preprint) or `co` (company-reported);
  - `err` the error (1 − fidelity) used for sorting, or `null`;
  - `src` a list of `[label, url]`, with `arx('…')` and `doi('…')` helpers;
  - `flags` short qualifiers such as `one pair`, `full system`, `post-selected`.
- The page's own rules for what counts are in its "How entries are chosen" section (`#method`). Read it first.
  Earlier decisions, including results left out on purpose, are in `docs/page-notes/records.md`. Don't re-add something
  that was left out unless new evidence (a journal version, a correction) changes the reason.

## 1. Start
1. Lock: read `.git/overnight-lock`. If it says `running <time>` less than 2 hours ago, stop. Otherwise write
   `echo "running $(date -u +%FT%TZ) records-check" > .git/overnight-lock`.
2. If `.git/index.lock` exists, or `GIT_OPTIONAL_LOCKS=0 git status --short pages/records.html` shows it already modified,
   touch nothing: release the lock and stop.
3. Baseline: `python3 tests/formula_regression.py` must end in `OK`.

## 2. Check every category
For each category, search for results newer than the page's "Last checked" date (WebSearch, then the paper itself:
arXiv, the journal, or the company's own technical page). Typical searches: "two-qubit gate fidelity record <platform>
<year>", "largest neutral atom array", "logical qubit below threshold <year>", recent arXiv quant-ph listings.

- **Add or replace a row only from a primary source you opened in this run.** Quote the number exactly as the authors
  report it, with its uncertainty and conditions (one pair or full system, post-selected, with or without leakage or
  erasure). Never round up, never compute a record yourself.
- **Status:** a preprint stays `pre` until the arXiv page or a journal shows the published version; then switch it to `peer`
  and add the DOI. Company blog or press figures are `co`.
- **Promotions:** if a listed preprint has since been published, update its status and source; check the published number,
  which sometimes changes.
- A result that beats a row on a different basis (different metric, post-selected against raw) is added beside it with a
  flag, not as a replacement.
- If something is plausible but you cannot verify it from a primary source, leave it out and note it in
  `docs/page-notes/records.md`.

## 3. Finish
1. Update the stamp `Last checked: <D Month YYYY>` (in `.rb-stamp`) even if nothing else changed: the date is the claim
   that the board was checked.
2. Verify: `node -e` can still evaluate the `CATS` literal (the book's `extras.js` parses it), and
   `python3 tests/formula_regression.py` ends in `OK` (`test_explorer_pages` checks every row has a source and a status).
3. Append a dated entry to `docs/page-notes/records.md`: what changed, with source URLs, and what was considered and left
   out, with the reason.
4. Commit with explicit paths (`git add pages/records.html docs/page-notes/records.md`), message
   `Records board: monthly check <YYYY-MM-DD>` plus the attribution lines from the session's system reminder.
   Move any `.lock` or `tmp_obj_*` file git leaves into `.git/_to_delete/<date>/` (this sandbox cannot delete; never put
   anything under `.git/refs`). Do not push.
5. Write `free <now>` to the lock. Summarise: rows changed (old → new, with source), rows promoted to peer-reviewed,
   anything left out and why. The nightly book rebuild picks up the change for Appendix H.
