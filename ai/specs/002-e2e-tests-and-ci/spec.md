Linear: EMP-81 — https://linear.app/empirical/issue/EMP-81/add-playwright-e2e-ui-tests-and-ci-for-easyfeedback

# Spec: E2E Tests + CI for EasyFeedback

## Goal

A developer opening a pull request gets the critical UI path (template selection →
generate → display → copy) and the existing unit tests verified automatically, so a red
build blocks merge and UI regressions are caught before they reach `main`.

---

## User Value

The app has `node:test` unit coverage but no UI/E2E tests and no CI, so the `/sdd-merge`
"CI green" gate is currently vacuous and UI regressions (template selection, the
generate→display→copy flow, styling) ship unguarded. Committed Playwright E2E plus a CI
workflow that runs both test tiers on every PR turns the merge gate into a real signal and
guards the critical user path forever.

---

## Requirements

- Add `@playwright/test` as a dev dependency; `npx playwright test` runs the E2E suite
  headless against the real app.
- E2E covers the critical path: load app → the default template is selected → paste a
  transcript + notes → Generate → the result renders with the template's sections →
  one-click Copy works.
- Generation is **stubbed deterministically** in the E2E (mock `/api/generate`) — assert
  structure/behavior, never exact generated text (the real call is a non-deterministic LLM).
- A few targeted style/layout assertions on key elements, reading computed CSS (validates
  the clean/modern UI intent).
- A GitHub Actions workflow runs `npm test` **and** `npx playwright test` on every PR to
  `main`; the build must be green to merge.
- The live, real-model generation check stays **out** of the PR-blocking CI path (it
  remains a Tester/MCP or nightly concern).

---

## Acceptance Criteria

- [ ] `@playwright/test` is a dev dependency and `npx playwright test` runs the E2E suite
      headless (no browser UI), starting the app itself.
- [ ] An E2E spec drives the critical path against a **mocked** `/api/generate`: the app
      loads, the default template is pre-selected, transcript + notes are entered, Generate
      transitions to a rendered result containing the template's section headings, and the
      Copy button performs a one-click copy — asserting structure/behavior, not exact text.
- [ ] The E2E includes targeted style assertions on key elements via computed CSS (e.g. the
      primary button and card), validating the intended visual treatment rather than pixels.
- [ ] A GitHub Actions workflow triggers on `pull_request` to `main`, runs `npm test` and
      `npx playwright test`, and a failure in either fails the build (red blocks merge).
- [ ] The real-model generation path is **not** exercised by PR CI — no Anthropic API key is
      required for CI to pass; the live check is documented as a Tester/MCP or nightly step.

---

## Dependencies

- Spec 001 (`ai/specs/001-core-feedback-generation/`) — the app under test (server,
  `/api/templates`, `/api/generate`, the `public/` UI).

---

## Risks

- **Flaky UI E2E** — the #1 cause is letting the non-deterministic LLM call into the test.
  Mitigation: the committed E2E mocks `/api/generate` with a deterministic template-shaped
  body and asserts structure/behavior only; the live model check stays out of CI.
- **Browser provisioning in CI** — Playwright needs its browser binaries. Mitigation: the
  workflow runs `npx playwright install --with-deps chromium` before the E2E step; pin to a
  single browser (Chromium) to keep CI fast.
- **Server startup race in headless runs** — E2E may start before the server is listening.
  Mitigation: use Playwright's `webServer` config with a readiness URL so the run waits for
  the app to be up.

---

## Notes

### In scope
- One committed Playwright project (Chromium), a `webServer`-managed app under test, the
  critical-path spec, computed-CSS style assertions, and a `pull_request`-triggered CI
  workflow running both tiers.

### Out of scope
- Visual pixel-diff / snapshot regression (future).
- Deploy / CD (later).
- New product behavior — this ticket only adds tests + CI around the existing app.

### Implementation guidance
- Mock generation at the network layer (Playwright `page.route('**/api/generate', …)`)
  so no server change is needed and the test is fully deterministic. The mock body should
  contain the template's section headings so the "sections render" assertion is meaningful.
- `clipboard-read`/`clipboard-write` permissions (or asserting the post-copy "Copied!"
  affordance) cover the one-click copy criterion without depending on OS clipboard access.
