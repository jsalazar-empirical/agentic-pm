# Architecture: E2E Tests + CI

## Scope of change

Additive only — **no application code changes**. The app (`src/`, `public/`) is the system
under test and stays untouched. We add a test tier and a CI pipeline around it.

| Touch | File | Why |
|---|---|---|
| add | `package.json` | `@playwright/test` devDep; `test:e2e` script; keep `test` = `node --test` |
| add | `playwright.config.js` | one Chromium project; `webServer` boots the app + waits for readiness |
| add | `tests/e2e/critical-path.spec.js` | the critical-path E2E with a mocked `/api/generate` |
| add | `.github/workflows/ci.yml` | `pull_request` → unit + e2e tiers; red blocks merge |
| add | `.gitignore` entries | `node_modules/`, `playwright-report/`, `test-results/` |

## Components & boundaries

- **Unit tier (unchanged):** `npm test` → `node --test` over `test/*.test.js`. Already green
  (16/16). CI just runs it.
- **E2E tier (new):** Playwright drives Chromium against the real Node server. The server is
  managed by Playwright's `webServer` block (`command: npm start`, `url: http://127.0.0.1:3000`,
  `reuseExistingServer: !process.env.CI`) so the run waits until the app is actually listening
  — closes the startup-race risk.
- **Generation boundary:** the spec's #1 risk is the non-deterministic LLM call. We cut it at
  the **network layer inside the test** — `page.route('**/api/generate', route => route.fulfill(...))`
  returns a fixed, template-shaped body. The server's real `/api/generate` (and the Anthropic
  key) is never exercised by E2E, so CI needs no secret. `/api/templates` is left real
  (deterministic, file-backed) so the default-template assertion is honest.
- **CI tier (new):** GitHub Actions, two jobs (or one job, two steps) on `pull_request` to
  `main`: (1) `npm ci` + `npm test`; (2) `npm ci` + `npx playwright install --with-deps chromium`
  + `npx playwright test`. Job failure → red check → merge blocked by the `/sdd-merge` gate.

## Key tradeoff

**Mock generation via Playwright `page.route` (chosen) over a server-side stub env flag.**
Network mocking keeps all test scaffolding in the test files with zero production-code
branches (`if (process.env.STUB)` in `generate.js` would be dead weight shipped to prod and a
divergence risk). The cost — the mock lives in the test, not the server — is acceptable and is
exactly what `ai/skills/ui_testing.md` prescribes ("the committed E2E must hit a stubbed
endpoint … assert structure/behavior").

## Risk mitigations

- **Flaky E2E** → deterministic mocked body; assert section headings + the "Done."/result
  transition + the Copy affordance, never generated prose.
- **CI browser provisioning** → `npx playwright install --with-deps chromium`, single browser.
- **Server-start race** → `webServer.url` readiness gate; `reuseExistingServer` off in CI.
- **Clipboard in headless** → grant `clipboard-read/write` permission in the Playwright
  context and assert the button's post-click "Copied!" state (no OS clipboard dependency).

## YAGNI check

One browser (Chromium), one spec file, no fixtures framework, no visual-diff, no sharding.
Matches the ticket's "a few targeted assertions," nothing speculative.
