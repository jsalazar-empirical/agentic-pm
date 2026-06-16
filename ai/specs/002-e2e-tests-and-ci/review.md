# Reviewer Notes: E2E Tests + CI (EMP-81)

**Verdict: DONE** — Reviewer gate passed. Ready for `/sdd-pr`.

## Gate checklist

- [x] **All acceptance criteria pass** — see `test-report.md` (5/5; AC4's live CI signal
      confirmed against the PR in the shipping step).
- [x] **No unaddressed risks** — flakiness cut by the network mock; CI browser provisioning
      via `playwright install --with-deps chromium`; server-start race closed by the
      `webServer` readiness gate; the surfaced `form-data` advisory patched in-lockfile.
- [x] **Maintainable** — one config, one spec, one workflow; a new dev reads the critical
      path top-to-bottom in minutes. Selectors use stable ids already in the markup.
- [x] **No undocumented tech debt** — additive only; no app-code branches added for testing
      (mock lives in the test, per the documented tradeoff).

## Observations

- **Right call on the mock boundary.** Mocking `/api/generate` via `page.route` (vs a
  server stub flag) keeps production code free of test affordances and matches
  `ai/skills/ui_testing.md`. The structure-not-text assertions are exactly what keeps the
  suite non-flaky.
- **`/api/templates` left real.** Good — it's deterministic and file-backed, so the
  default-template assertion stays honest without a second mock.
- **Lockfile is new to the repo.** Committing `package-lock.json` is required for CI's
  `npm ci`; it was generated and security-cleaned (`npm audit fix`).

## Non-blocking follow-up

- The `form-data` advisory originates in `@anthropic-ai/sdk`'s tree and is broader than this
  ticket; pinning is handled here, but a periodic `npm audit` in CI could be a future
  hardening ticket (not required for EMP-81).
