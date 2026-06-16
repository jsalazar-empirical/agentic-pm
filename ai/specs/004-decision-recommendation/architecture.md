# Architecture: Decision Recommendation

## Scope of change

Thread one **optional** field, `requirements`, through the existing generate pipeline and
sharpen the system prompt. No new endpoints, no storage, no new dependencies.

| Touch | File | Change |
|---|---|---|
| edit | `src/generate.js` | `buildPrompt(template, transcript, notes, requirements)` adds a delimited `<requirements>` block **only when non-empty**; closing instruction grounds Fit + Recommendation in it. `callClaude(..., requirements)` passes it through. `SYSTEM_PROMPT` rule encodes Pass / Keep in Pool / No Hire + Strong / Medium / Weak, evidence-only, never invent requirements. |
| edit | `src/server.js` | `handleGenerate` reads optional `requirements` from the body and passes it to `callClaude`. Validation unchanged (requirements optional). |
| edit | `public/index.html` | an optional "Role requirements / job summary" textarea (`#requirements`) in the input card. |
| edit | `public/app.js` | include `requirements` in the `/api/generate` POST body. |
| add | `tests/e2e/recommendation.spec.js` | mocked-`/api/generate` E2E: requirements field sent in the body; recommendation section (Pass/…) renders; also a no-requirements path. |
| edit | `test/generate.test.js` | unit: requirements block present when provided / omitted when empty; SYSTEM_PROMPT vocabulary. |

## Boundaries

- **Additive + optional.** Existing 3-arg `buildPrompt` callers and the no-requirements path
  are unchanged — the requirements block is omitted when empty, so today's output is
  byte-for-byte preserved for that path. This is the AC4 "no regression" guarantee.
- **Determinism line.** The model's actual wording is non-deterministic, so CI asserts only
  the *plumbing + prompt construction* (unit + mocked E2E). The real-model grounding check is
  a Tester/MCP or nightly step — and is **not** run unattended in the loop (a paid call is a
  spend; deferred to human/nightly per the escalation policy).

## Key tradeoff

**Prompt-grounding (chosen) over a structured scoring step.** The ticket explicitly excludes
numeric rubrics/weighted matching; injecting requirements as evidence and instructing the
model to map candidate evidence to them is the KISS path and reuses the single existing LLM
call (no second round-trip, no parsing).

## Risk mitigations

- No-requirements regression → block omitted when empty; existing generate tests stay green.
- Hallucinated requirements → system-prompt rule: only supplied evidence, never invent.
- Prompt-test brittleness → keep the existing `SYSTEM_PROMPT` substrings intact when editing
  (the spec-001 test asserts them); add new assertions rather than rewording the old ones.

## YAGNI

No rubric engine, no requirements storage, no comparison UI — one optional field + a prompt
tweak.
