# Test Report: E2E Tests + CI (EMP-81)

Joined result of the two Tester forks. **Both forks green → Tester gate PASS.**

## Fork A — API / unit (`npm test`)

- `node --test` over `test/*.test.js`: **16 passed / 0 failed** (~0.5s).
- No regression from the additive change (no app code touched).

## Fork B — UI / E2E (`npx playwright test`, Chromium headless)

- `tests/e2e/critical-path.spec.js`: **2 passed / 0 failed** (~4.6s), app booted via the
  `webServer` config (readiness-gated, no manual server start).
- Generation mocked at the network layer (`page.route('**/api/generate')`) — deterministic,
  no Anthropic API key used.

## Acceptance criteria verdicts

| AC | Verdict | Evidence |
|---|---|---|
| AC1 — `@playwright/test` dev dep; `npx playwright test` runs headless | ✅ PASS | devDep in `package.json`; suite ran headless via `webServer`. |
| AC2 — critical path, mocked generate, structure not text | ✅ PASS | Spec drives load → default template selected → fill → Generate → result visible, `#status`="Done.", section headings (Candidate Information / Phase Snapshots / Candidate Summary & Recommendation) render; Copy sets "Copied!" and clipboard holds the feedback. |
| AC3 — targeted computed-CSS style assertions | ✅ PASS | `#generate` background `rgb(108,140,255)`, weight 600, pointer; `section.card` radius `12px`, background `rgb(24,27,34)`. |
| AC4 — CI runs `npm test` + `npx playwright test` on PR→main; red blocks merge | ✅ PASS (verified on PR) | `.github/workflows/ci.yml` triggers on `pull_request: [main]`, two jobs; job failure → red check → `/sdd-merge` gate blocks. Live run confirmed once PR opens. |
| AC5 — live real-model check out of PR CI; no API key required | ✅ PASS | E2E mocks generation; `npm ci`/test/e2e need no secret. Live model check stays a Tester/MCP or nightly concern. |

## Notes / findings

- **INFO (security, out of scope):** generating the first `package-lock.json` surfaced a known
  advisory in transitive `form-data` (via `@anthropic-ai/sdk`, GHSA-hmw2-7cc7-3qxx).
  Patched in-lockfile via `npm audit fix` (lockfile-only, 0 vulnerabilities after). Not
  exploitable in this app's usage; flagged for awareness.
- **Live model UI check:** unchanged from spec 001 (real generation verified there);
  intentionally excluded from PR-blocking CI per AC5.
- CI's real-world green status is confirmed against the opened PR in the `/sdd-pr` →
  `/sdd-merge` steps.
