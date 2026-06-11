# CLAUDE.md

This repo uses the Empirical SDD+DDD scaffold. Work flows through **specs** and **gated
roles**; load context on demand, not all at once. You don't need to paste instructions at
the start of a session — the commands below carry their own playbooks.

## State

`ai/STATE.md` is the single source of truth for where we are. Read it first when resuming.

## The flow — Conversation → Ticket → Spec → Implementation → PR

- `/sdd-ticket` — turn an idea into a Linear ticket in `agentic-pm`. The ticket-writing
  standard lives in `ai/skills/create_linear_ticket.md`, so nothing needs pasting.
- `/sdd-board` · `/sdd-task <id>` — see the Linear board / load one ticket.
- `/sdd-spec-from-ticket <id>` — draft a spec from a ticket (Socratic, links the ticket).
  Or `/sdd-spec` / `/sdd-spec-socratic` for specs without a ticket.
- `/sdd-orchestrate` — drive the spec through PM → Architect → Developer → Tester → Reviewer.
- `/sdd-pr` — open a GitHub PR for the finished spec and request review.
- `/sdd-status` — where am I? · `/sdd-handoff` — structured role handoff.

## Integrations

Linear and GitHub coordinates live in `ai/context/integrations.md`. Linear connects via
the project `.mcp.json` (run `/mcp` once to authorize). GitHub uses the `gh` CLI
(`gh auth login`). No tokens live in the repo.

## Principles

Clarity over cleverness. Small increments. Explicit gates and handoffs. Human-in-the-loop
by default. **Never write to Linear or open a PR without confirmation.**
