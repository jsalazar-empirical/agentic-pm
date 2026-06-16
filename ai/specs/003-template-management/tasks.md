# Tasks: Template Management (EMP-82)

- [x] T1 — `src/templates.js`: env-driven `TEMPLATES_DIR`; `slugify`; `createTemplate`,
      `readTemplate`, `updateTemplate` (rename-aware), `deleteTemplate`; `DEFAULT_TEMPLATE_ID`.
- [x] T2 — `src/server.js`: `GET/POST /api/templates`, `GET/PUT/DELETE /api/templates/:id`;
      validation → 400/403/404/409; reuse `readBody`.
- [x] T3 — `public/`: manage-templates UI (list + New/Edit/Delete + editor + `.md` upload),
      live selector refresh, delete confirm, default protected; styles.
- [x] T4 — `test/template-crud.test.js`: unit over a temp dir (CRUD, slug, default-protect,
      dup/empty/traversal).
- [x] T5 — `test/server-templates.test.js`: route integration over a temp dir.
- [x] T6 — `tests/e2e/manage-templates.spec.js` + `playwright.config` sandbox + global
      setup/teardown; `.gitignore` the temp dir.
- [x] T7 — verify: `npm test` green + `npx playwright test` green; existing tests still pass.
