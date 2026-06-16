Linear: EMP-82 — https://linear.app/empirical/issue/EMP-82/template-management-create-edit-upload-delete-feedback-templates

# Spec: Template Management

## Goal

An interviewer/admin maintains the feedback-template library from the app itself — create,
edit, upload, and delete templates — without editing the repo, and the changes show up in
the template selector immediately.

---

## User Value

Today templates are files in the repo and **selection-only** (EMP-68 scoped authoring out),
so changing the library means a code change + redeploy. Making templates self-serve lets the
people who actually run interviews keep the library current — add a team-specific template,
fix a section, remove a stale one — with zero developer involvement.

---

## Storage decision (resolved)

Templates remain **`.md` files**, read/written through a single storage module over a
configurable directory (`TEMPLATES_DIR`, default `./templates`). This keeps the
"templates as files" principle and the **Database: None** stance (KISS).

- **Production durability (Railway):** because Railway's filesystem is ephemeral, production
  mounts a **persistent volume** at `TEMPLATES_DIR`. That is a deploy/ops configuration (a
  volume + env var), not application code — deploy/CD remains out of scope here, but the
  requirement is documented so the "persist across restarts" criterion holds in production.
- The same `TEMPLATES_DIR` indirection lets tests point at a sandbox directory, so E2E never
  mutates the repo's real templates.

---

## Requirements

- **View/select** templates — existing behavior preserved (the generate flow is untouched).
- **Create** a template: name + markdown body → becomes selectable immediately.
- **Edit** an existing template's name and/or body → save persists it.
- **Delete** a template with a confirm step; the **default interview template is protected**
  (cannot be deleted) so the app always has a working default.
- **Import/upload**: paste markdown **or** choose a `.md` file to populate the body.
- **Persistence** across restarts (files on disk / mounted volume — see Storage decision).
- The selector **reflects changes immediately** after any create/edit/delete.
- Inputs are validated and path-safe (no traversal; ids derived from names, collisions handled).

---

## Acceptance Criteria

- [ ] The template selector lists existing templates and the generate flow still works
      unchanged (regression preserved).
- [ ] A user can create a template (name + markdown body); after save it appears in the
      selector without a reload and is usable for generation. Persists across restart.
- [ ] A user can edit an existing template's name/body; after save the changes persist and
      the selector reflects them.
- [ ] A user can delete a non-default template (after a confirm) and it disappears from the
      selector; attempting to delete the **default** template is prevented with a clear message.
- [ ] A user can import a template by pasting markdown or uploading a `.md` file; the content
      lands in the editor and can be saved as a new template.
- [ ] Invalid input is rejected with a clear error (empty name/body, duplicate name, unsafe
      id); the server never writes outside `TEMPLATES_DIR`.

---

## Dependencies

- Spec 001 (`ai/specs/001-core-feedback-generation/`) — the existing server, `templates.js`,
  `/api/templates`, and the `public/` UI this extends.

---

## Risks

- **Production persistence** — runtime file writes are lost on a Railway redeploy without a
  persistent volume. Mitigation: `TEMPLATES_DIR` + a mounted volume in prod (documented;
  deploy config, not code).
- **Path traversal / unsafe writes** — user-supplied names/ids could escape the templates
  dir. Mitigation: derive ids by slugifying the name to `[a-z0-9-]+`, reject anything else,
  and resolve every path inside `TEMPLATES_DIR` (reuse the existing guard pattern).
- **Concurrent edits / lost updates** — two editors overwriting each other. Accepted for this
  MVP (single-team, low concurrency); last-write-wins, no locking (YAGNI).
- **Deleting the default** — would break generation. Mitigation: the default id is protected
  server-side (DELETE refused) and in the UI.

---

## Notes

### In scope
- CRUD API for templates (list/read/create/update/delete) over `TEMPLATES_DIR`.
- A template-management UI (create/edit/delete/upload) that refreshes the selector live.
- Unit tests for the storage module + routes; a Playwright E2E for the manage flow (no LLM,
  so no mock needed — it exercises the real file API against a sandbox `TEMPLATES_DIR`).

### Out of scope
- Template versioning / history; access control / roles / multi-user permissions.
- The decision-recommendation feature (EMP-83).
- Rich WYSIWYG editing — plain markdown is fine.
- Deploy / CD (the volume mount is documented, not automated here).
