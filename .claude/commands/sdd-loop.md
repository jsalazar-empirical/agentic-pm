---
description: Autonomously work the board one ticket at a time (board-drain loop) — human resolves blockers + merges
---

You are running the board-drain loop — high-autonomy (L2) operation where the human acts as
orchestrator (resolves blockers, merges) and you do everything in between.

## Procedure

1. **Read** `ai/skills/board_drain_loop.md` (the loop) and `ai/orchestration/escalation_policy.md` (when to stop vs proceed). Follow them.
2. **Read** `ai/STATE.md` + `ai/context/integrations.md`. Set autonomy to **L2** for this run; confirm any run guardrails (max tickets, whether loop-merge is pre-authorized — default NO).
3. **Loop:** list the board → pick the top actionable ticket → run the pipeline autonomously (`/sdd-spec-from-ticket` → `/sdd-orchestrate` → `/sdd-pr` → `/sdd-pr-review`) → at PR-approved, **park for human merge** (merge stays human by default) → on any escalation, **park the ticket and continue** to the next → repeat until no actionable tickets remain or a guardrail is hit.
4. **Report** the run summary: completed / parked (with reasons) / blocked.

## Hard rules

- **Merge and deploy stay human** by default — never merge to `main` in the loop unless explicitly pre-authorized for the run.
- **Park, don't stall** — one blocked ticket must not halt the loop.
- **Escalate per `escalation_policy.md`** — ambiguity, irreversible actions, repeated failure (2-round cap), security, spec conflicts.
- Safety rules are absolute; autonomy never loosens them.
- One ticket at a time (sequential) in this version.
