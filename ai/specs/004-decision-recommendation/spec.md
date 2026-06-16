Linear: EMP-83 — https://linear.app/empirical/issue/EMP-83/decision-recommendation-role-requirements-pass-no-pass-talent-pool

# Spec: Decision Recommendation

## Goal

An interviewer pastes the role requirements / job summary alongside the transcript + notes,
and the generated feedback's recommendation section gives a sharper, evidence-based
**Pass / Keep in Pool / No Hire** plus a **Fit (Strong / Medium / Weak)** grounded in how the
candidate maps to those requirements.

---

## User Value

EMP-68 fills the template's *Fit* and *Overall Recommendation* best-effort from notes +
transcript alone, so the call is only as good as the interviewer's framing. Letting them
supply the actual role requirements makes the recommendation defensible — it reflects how the
evidence maps to what the role needs, not a generic impression — which is the part hiring
managers trust least when it's hand-wavy.

---

## Requirements

- Add an optional **role requirements / job summary** input (pasted) to the generate flow,
  alongside transcript + notes.
- When provided, the model grounds the **Overall Recommendation** (Pass / Keep in Pool /
  No Hire) and **Fit** (Strong / Medium / Weak) in how the candidate's evidence maps to those
  requirements, each with a one-line rationale, placed in the selected template's existing
  recommendation section.
- When **not** provided, behavior is unchanged from today (best-effort) — no regression.
- Reasoning uses **only supplied evidence** (transcript, notes, requirements) — never invents
  requirements or claims.

---

## Acceptance Criteria

- [ ] The UI has an optional "Role requirements / job summary" field; its value is sent to
      `/api/generate` as `requirements` alongside `templateId`, `transcript`, `notes`.
- [ ] When `requirements` is provided, the built prompt includes a delimited requirements
      block and instructs the model to ground Fit + Overall Recommendation in it (verifiable
      deterministically via the prompt builder; the live wording quality is a Tester/nightly
      check, not CI).
- [ ] The recommendation (Pass / Keep in Pool / No Hire) + Fit (Strong / Medium / Weak)
      render in the generated feedback's recommendation section, consistent with the template.
- [ ] When `requirements` is empty/absent, the prompt omits the requirements block and the
      request still succeeds (fallback to best-effort) — existing tests stay green.
- [ ] The system prompt constrains reasoning to supplied evidence only (no invented
      requirements), encoding the Pass / Keep in Pool / No Hire + Strong / Medium / Weak vocabulary.

---

## Dependencies

- Spec 001 (`ai/specs/001-core-feedback-generation/`) — the generate pipeline
  (`src/generate.js`, `/api/generate`, the input UI) this extends.

---

## Risks

- **Non-deterministic model output** — the exact recommendation wording can't be asserted in
  CI. Mitigation: CI verifies the *plumbing and prompt construction* deterministically (unit
  + a mocked E2E asserting `requirements` is sent and the recommendation section renders); the
  real-model grounding check is a Tester/MCP or nightly step (out of PR CI), and **not run
  unattended in the loop** (a paid call = spend → human/nightly).
- **Regression to the no-requirements path** — adding a param could change today's behavior.
  Mitigation: requirements is optional; the block is omitted when empty; existing generate
  tests must stay green.
- **Hallucinated requirements** — model could invent role needs. Mitigation: explicit
  system-prompt rule to use only supplied evidence and never invent requirements.

---

## Notes

### In scope
- One optional input field; `requirements` plumbed UI → server → `buildPrompt`; system-prompt
  update for grounded, evidence-only recommendation; unit + mocked-E2E coverage.

### Out of scope
- Numeric scoring rubrics / weighted matching.
- Storing/managing role requirements (paste-in per generation).
- Multi-candidate / multi-role comparison.
- A real-model PR-blocking test (stays nightly/Tester per the testing policy).
