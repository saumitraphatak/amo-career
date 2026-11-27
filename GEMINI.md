# Notes for Gemini

This repo is the AMO Toolkit (amotoolkit.com). Claude also works here, often on the same day, and scheduled tasks
run here. Before changing anything, read `CLAUDE.md`, in particular "Working alongside other agents":

- Check `.git/overnight-lock` first. If another agent is `running` in the same area (less than 2 hours old), work on
  something else. Write your own `running <UTC time> gemini: <area>` line when you start and `free <UTC time>` when done.
- `book/_build/` and the generated book (`book/index.html`, the PDF) have one owner at a time. Never hand-edit the book;
  change pages or `book/_build/*` and rebuild (`book/_build/README.md`), or let the nightly rebuild do it.
- Run `GIT_OPTIONAL_LOCKS=0 git status --short` first and leave files someone else has modified alone.
- Commit your own work promptly with explicit paths and a descriptive message (not ".."), so others can see what changed.
- Libraries are vendored (`vendor/`); colours that need a dark-theme version use the `--dk-*` tokens (see `CLAUDE.md`),
  not new per-page patch blocks.
