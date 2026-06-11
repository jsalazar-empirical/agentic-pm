# CLAUDE.md

This repo uses the Empirical SDD+DDD scaffold. Work flows through **specs** and **gated
roles**; load context on demand, not all at once. You don't need to paste instructions at
the start of a session — the commands below carry their own playbooks.

## State

`ai/STATE.md` is the single source of truth for where we are. Read it first when resuming.

## The flow — Conversation → Ticket → Spec → Implementation → PR → Merge

- `/sdd-ticket` — turn an idea into a Linear ticket in `agentic-pm`. The ticket-writing
  standard lives in `ai/skills/create_linear_ticket.md`, so nothing needs pasting.
- `/sdd-board` · `/sdd-task <id>` — see the Linear board / load one ticket.
- `/sdd-spec-from-ticket <id>` — draft a spec from a ticket (Socratic, links the ticket).
  Or `/sdd-spec` / `/sdd-spec-socratic` for specs without a ticket.
- `/sdd-orchestrate` — drive the spec through PM → Architect → Developer → Tester → Reviewer.
- `/sdd-pr` — open a GitHub PR for the finished spec and request review.
- `/sdd-pr-review` — independent review of the opened PR's diff (own fork); approve or
  request changes. Does not merge.
- `/sdd-merge` — merge once the PR is approved + CI green; advances the ticket to In Staging.
  Human-authorized by default.
- `/sdd-status` — where am I? · `/sdd-handoff` — structured role handoff.

The linked Linear ticket moves columns automatically at each step
(Backlog → Todo → In Progress → In Testing → In Review → In Staging); the mapping lives in
`ai/skills/sync_ticket_status.md`.

## Integrations

Linear and GitHub coordinates live in `ai/context/integrations.md`. Linear connects via
the project `.mcp.json` (run `/mcp` once to authorize). GitHub uses the `gh` CLI
(`gh auth login`). No tokens live in the repo.

## Principles

Clarity over cleverness. Small increments. Explicit gates and handoffs. Human-in-the-loop
by default. **Never write Linear content (create/edit issues, post comments) or open/merge
a PR without confirmation.** Automatic ticket **status** moves are pre-authorized as part of
the flow (see `ai/skills/sync_ticket_status.md`).
