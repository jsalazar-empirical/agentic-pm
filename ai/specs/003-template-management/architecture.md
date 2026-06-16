# Architecture: Template Management

## Storage model

Templates stay one-file-per-template under a single directory, now **configurable**:

```
const TEMPLATES_DIR = process.env.TEMPLATES_DIR || join(__dirname, "..", "templates");
```

This one change serves three needs at once: the Railway **persistent volume** (mount at
`TEMPLATES_DIR`), **test isolation** (point E2E at a sandbox dir), and zero behavior change
when unset (default path = today's `templates/`). **Database: None** preserved (KISS).

**`name` stays derived from `id`** (`humanize(id)`), so there is no separate metadata store
and the file body remains the verbatim template injected into the LLM (no front-matter
pollution). Consequently **editing a name = renaming the file** (new slug → new id).

## Files to touch

| Touch | File | Change |
|---|---|---|
| edit | `src/templates.js` | env-driven `TEMPLATES_DIR`; add `slugify`, `createTemplate`, `updateTemplate`, `deleteTemplate`, `readTemplate` (id+name+body); export `DEFAULT_TEMPLATE_ID`. |
| edit | `src/server.js` | route `GET/POST /api/templates`, `GET/PUT/DELETE /api/templates/:id`; reuse `readBody`; map errors → 400/403/404/409. |
| edit | `public/index.html` | a "Manage templates" card: list + New/Edit/Delete + editor (name, body, upload `.md`, save/cancel). |
| edit | `public/app.js` | wire the manage UI to the CRUD API; refresh selector+list after each change; `confirm()` on delete; client-side `.md` upload via `FileReader`. |
| edit | `public/styles.css` | minimal styles for the manage panel/list/editor (reuse existing tokens). |
| add | `test/template-crud.test.js` | unit: slug, create/read/update(rename)/delete, default-protection, dup/empty/traversal rejection (uses a temp `TEMPLATES_DIR`). |
| add | `test/server-templates.test.js` | integration: the new routes' status codes + bodies (temp `TEMPLATES_DIR`). |
| add | `tests/e2e/manage-templates.spec.js` | E2E: create → appears in selector; edit body persists; delete non-default removes; default delete blocked; upload fills editor. |
| edit | `playwright.config.js` | `webServer.env.TEMPLATES_DIR` = sandbox; `globalSetup`/`globalTeardown` seed+clean it. |
| add | `tests/e2e/global-setup.js` / `global-teardown.js` | seed sandbox dir with `default-interview.md`; remove on teardown. |
| edit | `.gitignore` | `tests/e2e/.tmp-templates/`. |

## API

| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/api/templates` | — | `{templates:[{id,name}]}` (unchanged) |
| GET | `/api/templates/:id` | — | `{id,name,body}` · 404 unknown |
| POST | `/api/templates` | `{name,body}` | 201 `{id,name}` · 400 invalid · 409 duplicate |
| PUT | `/api/templates/:id` | `{name?,body}` | 200 `{id,name}` · 400 · 404 · 409 (rename collision) |
| DELETE | `/api/templates/:id` | — | 200 `{ok:true}` · 403 default · 404 unknown |

`/api/generate` and the selection flow are untouched (regression preserved).

## Validation & safety

- `slugify(name)` → lowercase, non-`[a-z0-9]` → `-`, collapse/trim dashes; **must** match
  `^[a-z0-9-]+$` and be non-empty, else 400. This is also the path-safety guard (no `/`, no
  `..`), layered on the existing `loadTemplate` regex + in-dir resolution.
- `name` and `body` required, non-empty after trim (400 otherwise).
- `DEFAULT_TEMPLATE_ID = "default-interview"` is refused by DELETE (403) and by a rename that
  would orphan it.
- Last-write-wins; no locking (single-team MVP — YAGNI).

## Key tradeoff

**Name derived from id + rename-on-edit (chosen) over a metadata store / front-matter.**
Keeps the file body pristine for the LLM and avoids a DB/sidecar — the cost is that renaming
changes the id, which is fine because template selection is transient (no durable references).

## Risk mitigations

- Prod persistence → `TEMPLATES_DIR` + mounted volume (documented; deploy config).
- Traversal → slug regex + in-dir path resolution (unit-tested).
- Default deletion → server-side 403 + UI guard.
- E2E mutating real templates → sandbox `TEMPLATES_DIR` seeded in global setup, gitignored.

## YAGNI

No versioning, no auth, no WYSIWYG, no locking, no DB. Plain files + 4 small routes + one
manage panel.
