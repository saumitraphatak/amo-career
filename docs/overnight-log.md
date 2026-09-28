# Overnight log

Newest entries at the bottom. Each overnight run appends one entry covering: date/time (UTC), items worked, commits, sources used, tests run, and anything left in progress or needing Saumitra.

---

## 2026-09-28 04:20 UTC — setup (interactive session, not an overnight run)
- **Created the overnight system:** `docs/overnight-runbook.md` (rules), `docs/overnight-backlog.md` (queue) and this log.
- **Added `tests/browser/smoke.js` + `tests/browser/chartstub.js`.** This is a reusable rendered-page smoke test: every page, dark/light at 1280 px, dark at 390 px, page and console errors, horizontal overflow, and an optional baseline comparison.
- **First smoke run against the current site.** It found no page or console errors on any of the 34 pages, but **12 pages overflow horizontally at 390 px**. That is now the top P0 item in the backlog.
- **Pushing.** Pushing from the Mac VM fails (the proxy returns 403 for github.com), so overnight commits stay local until Saumitra pushes.
