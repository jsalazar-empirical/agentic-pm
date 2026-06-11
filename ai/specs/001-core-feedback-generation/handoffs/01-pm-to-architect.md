# Handoff: PM → Architect

Spec: `001-core-feedback-generation` · Ticket: EMP-68

## 1. Summary

The spec for EasyFeedback's core generation path is PM-refined and passed the PM gate.
It's a single clean vertical slice: interviewer selects a template, pastes transcript +
notes, generates template-conformant feedback via Claude, and copies it into Ashby. Ready
for a small, concrete technical design in `architecture.md`.

## 2. Completed Work

- Spec drafted from EMP-68 and crystallized at `ai/specs/001-core-feedback-generation/spec.md`.
- Acceptance criteria consolidated to 6 observable items.
- Reference/default interview template captured (cleaned) in the spec Notes.
- Scope boundaries made explicit (out-of-scope items confirmed).

## 3. Pending Work

- Technical design (`architecture.md`): components/files, the Node API surface, the
  prompt/template injection strategy, and local + Railway config.
- `tasks.md` breakdown for the Developer.

## 4. Important Decisions

- **Stack (from context):** vanilla-JS frontend, Node.js backend, no database (templates
  as files), Claude Sonnet 4.6 (`claude-sonnet-4-6`), runs locally + Railway.
- **KISS is the governing principle** — elegant, minimal implementation; clean modern UI.
- **Template is the core asset** — keep prompt/template logic isolated and versioned.
- Recommendation fields in the template are filled best-effort from notes/transcript; the
  dedicated role-requirements advice feature stays out of scope (future ticket).

## 5. Risks

- LLM output reliability — drift from template structure or hallucinated evidence.
- LLM cost per generation — unknown; needs measuring.
- Transcript quality/length — long/messy input may degrade quality or approach limits.

## 6. Questions

- None blocking. The Architect should resolve how the template is injected into the prompt
  and how output conformance is enforced (these drive both the reliability and cost risks).

## 7. Recommended Next Step

**Architect** produces `architecture.md` (and `tasks.md`) for spec 001: name the files to
create, the API endpoint(s), the prompt strategy that guarantees template conformance, and
the env/config approach for local + Railway. Honor KISS — no speculative abstractions.
