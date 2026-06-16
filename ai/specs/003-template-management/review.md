# Reviewer Notes: Template Management (EMP-82)

**Verdict: DONE** — Reviewer gate passed. Ready for `/sdd-pr`.

## Gate checklist

- [x] **All acceptance criteria pass** — see `test-report.md` (6/6; 31 unit + 7 E2E green).
- [x] **No unaddressed risks** — traversal blocked by slug regex + in-dir resolution
      (unit-tested); default protected server-side (403) **and** in the UI (disabled);
      prod persistence handled by `TEMPLATES_DIR` + a documented Railway volume.
- [x] **Maintainable** — one storage module owns all file access; routes are thin and map a
      single `TemplateError.status`; the UI reuses existing tokens/components.
- [x] **No undocumented tech debt** — last-write-wins is the only accepted limitation and is
      called out in the spec (single-team MVP, YAGNI).

## Observations

- **The lazy `TEMPLATES_DIR` is the right seam.** One env-driven directory simultaneously
  satisfies the Railway volume, test isolation, and unchanged default behavior — no DB, no
  metadata sidecar, body stays the verbatim LLM template.
- **Edit = rename is a deliberate, documented tradeoff.** Acceptable because selection is
  transient; the default is shielded from rename (403) so it can never be orphaned.
- **Security of changed lines:** user input only ever reaches the filesystem through
  `slugify` → `^[a-z0-9-]+$` → `join(dir, id+'.md')`; no path the user controls escapes the
  dir. POST/PUT bodies are size-capped by the existing `readBody` guard. No secrets added.
- **Regression guard intact:** the generate/copy flow and EMP-81's CI/E2E are untouched and
  still green.

## Non-blocking follow-up

- Concurrent-edit safety (locking / ETags) is deferred by design; worth a future ticket only
  if multi-user editing becomes real.
