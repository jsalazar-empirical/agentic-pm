# Architecture Principles

## Core Principles

- **KISS — keep it simple. This is the most important principle.** Favor elegant,
  effective implementations over clever or elaborate ones.
- Prefer readability over cleverness.
- Small incremental delivery; vertical slices.
- Avoid overengineering, premature optimization, and speculative abstractions.
- Clear boundaries; favor composability.
- Prefer maintainability over perfection.

---

## Product / Experience Principles

- **Clean, modern, agentic interface.** The UI should feel super modern and
  effortless — minimal friction from "interview done" to "feedback copied."
- Optimize the happy path: select template → paste transcript + notes → generate → copy.

---

## Domain-Specific Principles

- **Prompt + template logic is the core asset.** Keep it isolated, versioned, and easy
  to tweak without touching app plumbing.
- **Reliability of output matters.** Favor consistent, template-conformant results an
  interviewer can trust with minimal manual editing.

---

## Delivery Philosophy

Prefer:
- small specs
- iterative delivery
- vertical slices
- simple APIs
- understandable systems

Avoid:
- giant upfront architecture
- premature optimization
- speculative abstractions
- unnecessary microservices

---

## AI-Native Principles

AI performs significantly better when:
- context is structured
- terminology is consistent
- specs are focused
- workflows are incremental

The repository structure exists to improve AI consistency and collaboration.
