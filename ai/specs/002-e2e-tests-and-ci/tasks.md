# Tasks: E2E Tests + CI (EMP-81)

- [x] T1 — `package.json`: add `@playwright/test` devDep + `test:e2e` script (keep `test`).
- [x] T2 — `playwright.config.js`: Chromium project, `webServer` (npm start + readiness url),
      `clipboard` permissions, headless, HTML reporter.
- [x] T3 — `tests/e2e/critical-path.spec.js`: load → default template selected → fill
      transcript+notes → mock `/api/generate` → Generate → assert sections render → Copy works.
- [x] T4 — style assertions: computed CSS on primary button + card (AC3).
- [x] T5 — `.github/workflows/ci.yml`: `pull_request` to `main`; unit step + e2e step
      (`playwright install --with-deps chromium`); red blocks merge.
- [x] T6 — `.gitignore`: `node_modules/`, `playwright-report/`, `test-results/`.
- [x] T7 — verify locally: `npm test` green + `npx playwright test` green; capture evidence.
