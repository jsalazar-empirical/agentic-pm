# Test Report: Template Management (EMP-82)

Both Tester forks green → **Tester gate PASS.**

## Fork A — API / unit (`npm test`)

- **31 passed / 0 failed.** Adds `test/template-crud.test.js` (storage module over a temp
  `TEMPLATES_DIR`) and `test/server-templates.test.js` (routes via a spawned server with a
  sandbox `TEMPLATES_DIR`). The original 16 + spec-001 tests still pass (no regression).

## Fork B — UI / E2E (`npx playwright test`, Chromium headless)

- **7 passed / 0 failed.** `manage-templates.spec.js` (5) drives the real file API against
  the seeded sandbox dir; `critical-path.spec.js` (2, from EMP-81) still passes. Server booted
  via `webServer` with `TEMPLATES_DIR` → sandbox (seeded + cleaned by global setup/teardown).

## Acceptance criteria verdicts

| AC | Verdict | Evidence |
|---|---|---|
| AC1 — list/select preserved; generate flow unchanged | ✅ PASS | critical-path E2E still green; selector populated from `/api/templates`. |
| AC2 — create (name+body) → selectable immediately; persists | ✅ PASS | manage E2E "create" — new template appears in list + selector (pre-selected); `createTemplate` unit + POST 201 route test; file written to disk. |
| AC3 — edit name/body → persists; selector reflects | ✅ PASS | manage E2E "edit body persists"; unit "update body in place" + "rename"; PUT 200 route test. |
| AC4 — delete non-default (confirm) removes; default protected | ✅ PASS | manage E2E "delete" (confirm accepted) + "default delete disabled"; unit + DELETE 200 / 403 route tests. |
| AC5 — import via paste or `.md` upload lands in editor | ✅ PASS | manage E2E "import a .md file" — `setInputFiles` populates the body + auto-fills name. |
| AC6 — invalid input rejected; never writes outside dir | ✅ PASS | unit: empty name/body (400), duplicate (409), `!!!` (400), `../package` traversal (400); slug regex + in-dir resolution. |

## Notes

- **Storage decision implemented as resolved:** files under env-driven `TEMPLATES_DIR`
  (default `./templates`); production durability via a mounted Railway volume at that path
  (deploy config — documented, out of code scope). The same indirection isolates tests.
- **Live verification:** the committed Playwright E2E drives the real running server (not a
  mock) for all CRUD criteria, so it doubles as the live UI check. The real-model generation
  path is unchanged from spec 001 and stays out of PR CI (mocked) per the testing policy.
- **No regression:** the generate/copy flow and its EMP-81 E2E remain green.
