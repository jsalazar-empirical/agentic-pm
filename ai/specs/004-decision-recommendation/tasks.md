# Tasks: Decision Recommendation (EMP-83)

- [x] T1 — `src/generate.js`: `buildPrompt(..., requirements)` (block when non-empty + grounded
      instruction); `callClaude(..., requirements)`; `SYSTEM_PROMPT` vocabulary (Pass/Keep in
      Pool/No Hire, Strong/Medium/Weak, evidence-only, no invented requirements).
- [x] T2 — `src/server.js`: `handleGenerate` reads + forwards optional `requirements`.
- [x] T3 — `public/`: optional "Role requirements / job summary" textarea; include in POST.
- [x] T4 — `test/generate.test.js`: requirements present/omitted; SYSTEM_PROMPT vocabulary;
      existing assertions stay green.
- [x] T5 — `tests/e2e/recommendation.spec.js`: mocked generate — requirements sent; Pass/Fit
      section renders; no-requirements path still works.
- [x] T6 — verify: `npm test` + `npx playwright test` green; existing suites unaffected.
