# Handoff: Architect → Developer

Spec: `001-core-feedback-generation` · Ticket: EMP-68

## 1. Summary

The technical design for EasyFeedback's core generation path is complete and passes the
Architect gate. It's a single Node.js service (raw `http`, no framework, no database, no
auth) that serves a static frontend and exposes one generate endpoint backed by Claude
`claude-sonnet-4-6`. Files are named, the API surface and request/response shapes are
fixed, the template-injection and conformance strategy is specified, and local + Railway
config is defined. `architecture.md` and `tasks.md` are ready to execute without re-asking.

## 2. Completed Work

- `architecture.md`: components/files, API surface, template strategy, data flow, config,
  decisions (with documented tradeoffs), and the three spec risks each with a mitigation.
- `tasks.md`: ordered, honest (all unchecked) checkbox list mapping to the acceptance criteria.
- Confirmed `claude-sonnet-4-6` is the exact current model ID (1M context, adaptive thinking).

## 3. Pending Work

All implementation. Suggested order (from `tasks.md`): project setup → default template
file → `templates.js` → `generate.js` (prompt + Claude call) → `server.js` → frontend →
verify against acceptance criteria. Nothing is blocked.

## 4. Important Decisions

- **Raw Node `http` over Express** — two routes + a few static files; a framework adds weight
  without benefit. Swappable later if routing grows.
- **Stars rendered by the model, not the server** — the template already demonstrates the
  exact format (`⭐⭐⭐☆☆ (3/5)`); verbatim-template conformance is the contract, so
  server-side star rendering would duplicate and risk diverging from it. Always include `(n/5)`.
- **`@anthropic-ai/sdk` over raw fetch** — one official dependency; typed errors, adaptive
  thinking, standard key handling.
- **Templates as files, injected verbatim; conformance enforced by the system prompt** —
  keeps prompt/template logic isolated and tweakable without touching app plumbing.

## 5. Risks

- **LLM output reliability** — mitigate with verbatim template injection + strict system
  prompt (evidence-only, exact structure, `Not assessed`, no invented ratings). Optional
  light header-presence check only if drift appears.
- **LLM cost per generation** — unknown; measure from `response.usage` after first real runs.
  Sonnet 4.6 is the chosen cost/quality balance; one generation per click; `max_tokens` caps output.
- **Transcript length/quality** — Sonnet 4.6's 1M context gives wide margin for typical
  transcripts; surface any context-limit error as a readable `502`. No speculative truncation.

## 6. Questions

None blocking. The two open items resolve during implementation: (a) exact `max_tokens`
value (start ~8000, tune if outputs truncate) and (b) per-generation cost (read from
`response.usage` once real transcripts are run — this answers the `current_milestone.md`
open question).

## 7. Recommended Next Step

**Developer** implements spec 001 following `tasks.md` in order: scaffold the Node service,
add the default template, build `templates.js` + `generate.js` + `server.js`, then the
static frontend, then verify each acceptance criterion. Honor KISS — no extra abstractions,
no database, no auth. Keep `tasks.md` checkboxes honest as you go; document any deviation
from `architecture.md` in a Developer→Tester handoff note.
