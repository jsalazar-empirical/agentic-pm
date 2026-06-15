# Workflow

The end-to-end flow. Read top to bottom. Each step has a gate; each gate has a possible send-back.

---

## The picture

```
Stakeholder ask
      │
      ▼
┌──────────┐
│ Analyst  │  Socratic interview → spec draft   (skip if spec already concrete)
└─────┬────┘
      │  gate: Analyst (5 checks)
      ▼
┌──────────┐
│   PM     │  Refine AC, scope, priority
└─────┬────┘
      │  gate: PM
      ▼
┌──────────┐
│ Architect│  architecture.md: components, boundaries, tradeoffs, risks
└─────┬────┘
      │  gate: Architect
      ▼
┌──────────┐
│ Developer│  Implementation + tests + tasks.md update
└─────┬────┘
      │  gate: Developer
      ▼
┌──────────┐
│  Tester  │  Verify every AC; pass/fail with evidence
└─────┬────┘
      │  gate: Tester
      ▼
┌──────────┐
│ Reviewer │  Maintainability + completeness
└─────┬────┘
      │  gate: Reviewer
      ▼
    DONE
```

Send-backs are always **upstream** to the shallowest role that can fix the issue. See `ai/skills/validate_handoff.md` for the decision tree.

---

## Entry points

Three real entry points exist:

1. **`/sdd-spec-socratic`** — vague ask → drafted spec (BA-driven, runs the Analyst phase).
2. **`/sdd-spec`** — clear ask → drafted spec (developer-driven, skips Analyst).
3. **`/sdd-spec-from-ticket <id>`** — a Linear ticket → drafted spec. Pulls the ticket,
   reuses its problem statement and acceptance criteria as the early Socratic answers,
   and only interviews on what's still missing. Links the ticket id into the spec and
   `STATE.md`.

After any of them, run **`/sdd-orchestrate`** to drive the spec through PM → Reviewer.

## Linear + GitHub lane

The optional outer loop wraps the role loop:

```
/sdd-ticket  →  Linear ticket          (conversation → well-formed ticket)   [Backlog]
/sdd-board   →  pick a ticket          (or /sdd-task <id> to load one)
/sdd-spec-from-ticket <id>  →  spec     (links ticket ↔ spec)                 [→ Todo]
/sdd-orchestrate            →  DONE      (the existing role loop)              [→ In Progress / In Testing]
/sdd-pr                     →  draft PR  (links ticket + spec, requests review)[→ In Review]
/sdd-pr-review              →  approve / request changes  (independent, own fork; no merge)
/sdd-merge                  →  merge      (human default; approved + CI green) [→ In Staging]
```

The ticket's column tracks the work automatically at each step (see the bracketed status,
and `ai/skills/sync_ticket_status.md`). The internal Reviewer is a pre-PR gate; `/sdd-pr-review`
is an **independent** review of the opened PR's diff before merge. Merge is the human's by
default — `/sdd-merge` only merges when the PR is approved + CI is green. `Done` waits for a
later production deploy.

Coordinates (which Linear project, which repo, branch/PR conventions) live in
`ai/context/integrations.md`. Connections are per-person: Linear via `.mcp.json` + `/mcp`,
GitHub via `gh`. Writes to Linear content and opening/merging a PR are human-confirmed;
automatic ticket **status** moves are pre-authorized as part of the flow.

---

## Mode

- **HITL (default)** — orchestrator pauses at every gate.
- **Autonomous** — orchestrator decides at every gate, logs everything, hard-stops at 2 iterations per gate.
- **Autonomy levels & escalation** — `ai/orchestration/escalation_policy.md` defines L0/L1/L2
  and exactly what escalates to the human (irreversible actions, ambiguity, repeated failure,
  security, spec conflicts). At **L2**, `/sdd-loop` drains the board ticket-by-ticket
  unattended, parking blockers for the human and leaving merges to the human.

See `ai/orchestration/hitl_policy.md`.

---

## State

`ai/STATE.md` is the single state file. It holds: current spec, role, phase, mode, last 5 decisions, open send-backs. Read at the start of every orchestrate run; updated after every phase transition.

---

## Sizing guidance

- 3–8 specs per milestone is healthy for small/medium repos.
- One spec ≈ one screen. If it doesn't fit, split it before the Architect gate.
- A typical spec moves through the full loop in a few hours of human time (much less of clock time if autonomous mode is used for execute/test).

---

## What this workflow is NOT

- It is not BMAD — no 12+ personas, no Party Mode, no Enterprise track.
- It is not GSD — no 6 state files, no npm CLI, no installer.
- It is not a framework — it's a markdown scaffold you copy into your repo.
