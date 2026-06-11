---
description: Turn a rough idea into a well-formed Linear ticket in the project (replaces pasting ticket-writing instructions at the start of a chat)
---

You are creating a Linear ticket from a rough ask, written clearly enough to spec from later.

## Procedure

1. **Read** `ai/skills/create_linear_ticket.md` end-to-end — it is the playbook. Follow it literally.
2. **Read** `ai/context/integrations.md` for the Linear project and default status.
3. Run the skill: clarify minimally (one or two questions at a time), draft in the standard format, and **only create the issue after the human confirms.**
4. On creation, return the new ticket identifier and URL, then suggest `/sdd-spec-from-ticket <id>`.

If `$ARGUMENTS` is given, treat it as the initial rough description.

## Hard rules

- Never write to Linear before the human confirms the draft.
- Don't interrogate — stop asking once the ticket is unambiguous.
- If the ask is really several pieces of work, propose splitting it into separate tickets.
