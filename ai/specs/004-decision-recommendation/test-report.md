# Test Report: Decision Recommendation (EMP-83)

Both Tester forks green → **Tester gate PASS.**

## Fork A — API / unit (`npm test`)

- **35 passed / 0 failed** (was 31; +4 generate tests). New: requirements block present when
  provided / omitted when empty, **byte-for-byte equality** of the no-requirements prompt vs
  the prior 3-arg call (AC4), and SYSTEM_PROMPT recommendation vocabulary. All prior tests
  (incl. the spec-001 SYSTEM_PROMPT assertions) stay green.

## Fork B — UI / E2E (`npx playwright test`, Chromium headless)

- **9 passed / 0 failed** (was 7; +2 recommendation). `recommendation.spec.js`: with
  requirements → the field is sent in the `/api/generate` body and the recommendation/fit
  section renders (mocked); without requirements → request still succeeds (`requirements: ""`).
  Generation is mocked (non-deterministic), so structure/plumbing is asserted, not prose.

## Acceptance criteria verdicts

| AC | Verdict | Evidence |
|---|---|---|
| AC1 — optional requirements field; sent as `requirements` | ✅ PASS | UI textarea `#requirements`; E2E asserts `sentBody.requirements`. |
| AC2 — when provided, prompt grounds Fit + Recommendation | ✅ PASS (plumbing) | unit: `<requirements>` block + "maps to these requirements" instruction; SYSTEM_PROMPT vocabulary. Live wording quality = nightly/Tester (below). |
| AC3 — recommendation (Pass/Pool/No Hire) + Fit render in section | ✅ PASS | E2E asserts "Overall Recommendation", "Pass", "Fit for This Role" render. |
| AC4 — no requirements → fallback, no regression | ✅ PASS | unit byte-for-byte equality; existing generate tests green; E2E no-requirements path. |
| AC5 — evidence-only; never invent requirements | ✅ PASS | SYSTEM_PROMPT rule asserted ("Never invent role requirements"; evidence-only). |

## Notes

- **Live real-model grounding check (AC2 wording quality):** intentionally **not run in the
  unattended loop** — a real generation is a paid call (spend = Always-escalate). It remains a
  Tester/MCP or nightly step, consistent with spec 001 and the testing policy (non-deterministic
  flows never block PR CI). The deterministic plumbing + prompt construction are fully covered.
- **No regression:** template selection, copy, template management, and EMP-81 CI all green.
