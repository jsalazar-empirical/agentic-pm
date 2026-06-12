# Skill: Create Linear Ticket

## When to use this skill

Use when someone has an idea or request that should become a ticket in the Linear
project, written clearly enough that a spec can be built from it without follow-up
questions. Invoked by `/sdd-ticket`.

This skill is where the ticket-writing standard lives, so nobody has to paste
instructions at the start of a conversation — running the command loads it.

---

## Inputs

- A rough description from the human (in the conversation or as `$ARGUMENTS`).
- Project coordinates from `ai/context/integrations.md` (which Linear project, default status).
- Project background from `ai/context/project_vision.md`, `personas.md`, `domain_glossary.md`
  — load only what you need to match the project's terminology.

---

## Procedure

1. Read `ai/context/integrations.md` for the Linear project and default status.
2. Skim the relevant context files for terminology. Don't load the whole `ai/` tree.
3. Clarify with the **minimum** number of questions — one or two at a time, concrete
   either/or framings where possible. Stop as soon as the ticket is unambiguous. Don't
   interrogate.
4. Draft the ticket in the standard below and show it to the human.
5. On explicit confirmation, create the issue in the `agentic-pm` project via the Linear
   MCP, set the default status (`Backlog` — the start of the status workflow in
   `ai/skills/sync_ticket_status.md`), and return the new identifier + URL.

---

## Ticket standard

- **Title** — one clear, action-oriented line.
- **Context / Problem** — a short paragraph: what's wrong or needed, and why it matters.
- **Acceptance criteria** — testable bullets describing "done".
- **Out of scope** — explicit boundaries so the implementer doesn't over-build.
- **Links** — related tickets, docs, or files when relevant.

Keep it concise and concrete. A developer (or `/sdd-spec-from-ticket`) should be able to
read it and write a spec without coming back with basic questions.

---

## Rules

- Never create or modify a Linear issue before the human confirms the draft — creating
  writes to Linear.
- Match the project's terminology and conventions from the context files.
- If the request is really several pieces of work, propose splitting it into separate
  tickets.
- After creating, suggest: "Run `/sdd-spec-from-ticket <id>` to turn this into a spec."
