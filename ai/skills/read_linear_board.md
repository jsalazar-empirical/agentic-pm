# Skill: Read Linear Board

## When to use this skill

Use to see the current state of the Linear project and choose a ticket (`/sdd-board`),
or to load one specific ticket in full (`/sdd-task <id-or-name>`).

## Coordinates

Read `ai/context/integrations.md` for the project (`agentic-pm`) and team (`empirical`).

---

## Board mode (`/sdd-board`)

1. Get the team's workflow statuses from Linear (their order matters: e.g. Backlog →
   Todo → In Progress → In Review → Done).
2. List the project's issues: identifier, title, status, assignee, priority.
3. Present **grouped by status, in workflow order**, one scannable line each:
   `EMP-123 · Title · @assignee · P2`.
4. Show only active statuses by default; offer to include Done / Canceled.
5. Ask which ticket to work on. **Don't start work** — hand off to `/sdd-task <id>` or
   `/sdd-spec-from-ticket <id>`.

---

## Task mode (`/sdd-task <id-or-name>`)

1. Resolve `$ARGUMENTS`: if it looks like an identifier (`EMP-###`), fetch directly; if
   it's a title fragment, search the project and disambiguate if more than one matches
   (list candidates, ask — don't guess).
2. Load full context: description, status, assignee, priority, labels, comments,
   parent/sub-issues, linked branches/PRs.
3. Summarize concisely: the goal in a sentence or two, plus a short list of the
   gaps/ambiguities a spec will need to close.
4. Offer: "Run `/sdd-spec-from-ticket <id>` to spec this."

---

## Rules

- Read-only. Never modify issues here.
- If Linear isn't authorized, tell the human to run `/mcp` to connect.
