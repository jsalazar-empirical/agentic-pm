# Skill: Write Tests

## Prioritize

- critical workflows
- expected behavior
- important edge cases

## Philosophy

Testing should improve:
- confidence
- reliability
- maintainability

## Two tiers

- **Unit / integration** — fast, no browser, no network (stub LLM/external calls). Default
  for logic, validation, prompt building, file handling.
- **UI / E2E** — for anything with a UI surface, see `ai/skills/ui_testing.md`: live
  verification via the Claude Preview MCP (functionality + computed-CSS styles) plus
  committed `@playwright/test` specs for CI. Stub non-deterministic backends in CI.

The Tester runs these as two **parallel forks** (API/unit + UI/E2E), joined at the gate.
