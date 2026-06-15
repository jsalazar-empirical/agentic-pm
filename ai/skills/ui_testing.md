# Skill: UI / E2E Testing

## Purpose

Verify a spec's **UI acceptance criteria** — functionality, layout, and styles — by driving
the **real running app**, not just unit tests. Used by the Tester (and the PR Reviewer when
a diff is UI-facing). Covers two complementary tiers; use both.

## The two tiers

| Tier | Tool | What it's for |
|---|---|---|
| **Live verification** | **Claude Preview MCP** (`mcp__Claude_Preview__*`) | The agent drives the running app in the Tester phase: functional happy-path, **computed-CSS/style checks**, screenshots as evidence. Exploratory + authoring. |
| **Durable regression** | **`@playwright/test`** committed specs (`tests/e2e/*.spec.ts`) | Headless E2E re-run by **CI** on every PR. This is the real merge-gate signal — the MCP is not a CI signal. |

The MCP is how the agent *checks and authors*; the committed Playwright specs are what
*guard forever*. A UI spec should end with both: live evidence **and** a committed spec.

---

## Live verification with the Preview MCP

Prefer the Preview MCP over raw screenshots — it gives structured, assertable feedback:

- `preview_start` → run the app; `preview_snapshot` → a11y tree (verify text/structure/presence).
- `preview_click` / `preview_fill` → drive the flow.
- **`preview_inspect`** → read **computed CSS** of an element. Use this for *style* checks
  (color, font-size, spacing, layout) — don't eyeball a screenshot for styles.
- `preview_screenshot` → capture evidence for `test-report.md` (general appearance only).
- `preview_console_logs` / `preview_network` → catch JS errors / failed requests.

Record concrete evidence per UI acceptance criterion (what you drove, what you asserted,
the screenshot path).

---

## Committed Playwright specs (for CI)

- Live under `tests/e2e/`, run with `npx playwright test` (headless in CI).
- Cover the **critical user path(s)** the spec names — not every pixel.
- Assert **behavior and structure**, with targeted style assertions where a criterion is
  about styling. Use role/text/`data-testid` locators + auto-wait; avoid sleeps.

### The non-determinism rule (critical)

If a flow calls an **LLM or other non-deterministic backend**, the committed E2E must hit a
**stubbed/mocked** endpoint so it's deterministic — assert *structure/behavior* (the
expected sections render, a "Generating…"→result transition happens, copy works), **never
exact generated text**. Keep the *live* (real-model) check as a Tester/MCP step or a nightly
job, **out of the PR-blocking CI path**. Skipping this is the #1 cause of flaky UI E2E.

---

## Parallel test forks (Tester phase)

The Tester phase **fans out into two forks that run in parallel**, then joins:

- **Fork A — API / unit:** `npm test` (node:test) + verify the non-UI acceptance criteria.
- **Fork B — UI / E2E:** this skill — drive the app via the Preview MCP (functionality +
  computed-CSS styles + screenshots) and run/author the committed Playwright specs.

Each runs in its **own fork** (separate context), concurrently. The orchestrator joins both
results into one `test-report.md`; the **Tester gate passes only if both forks pass**. A
send-back from either routes per `validate_handoff.md` (UI bug → Developer; design-level UI
issue → Architect).

---

## Rules

- Skip Fork B (UI) when a spec has **no UI surface** (pure API/lib work) — don't gold-plate.
- Don't make the real-LLM/live check a CI gate (non-deterministic) — stub for CI.
- Evidence over assertion-free screenshots: prefer `preview_inspect`/`preview_snapshot`
  assertions; use screenshots to *show*, not to *prove*.
