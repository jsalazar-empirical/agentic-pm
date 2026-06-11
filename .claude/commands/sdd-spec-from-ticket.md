---
description: Pull a Linear ticket and draft a spec from it via the Socratic interview, linking the ticket to the spec (Linear-driven entry to the SDD loop)
---

You are creating a spec seeded by a Linear ticket. This is the Linear-driven entry point to the SDD loop.

## Procedure

1. **Read** `ai/skills/read_linear_board.md` (Task mode) and load the ticket named in `$ARGUMENTS` (identifier or title). If `$ARGUMENTS` is empty, run the board first and ask which ticket.
2. **Read** `ai/skills/write_spec_socratic.md` — that is the spec-authoring playbook. Follow it, but:
   - Treat the ticket's Context/Problem and Acceptance criteria as the human's answers to the Opening, Pass 1 (WHO), and Pass 2 (WHAT). Don't re-ask what the ticket already answers.
   - Only run the passes whose answers are still missing or ambiguous (usually WHY, sharper acceptance criteria, and WHAT COULD GO WRONG).
   - Keep it short — one pass per turn, reflect answers back.
3. **Crystallize** into `ai/specs/<NNN>-<short-kebab-name>/spec.md` using `ai/specs/_template/spec.md`. Add a line at the very top of the spec: `Linear: <TICKET-ID> — <url>`. Map the ticket's acceptance criteria into the **Acceptance Criteria** checkboxes.
4. **Run the Analyst self-check** from `write_spec_socratic.md`. Iterate once on any failed item.
5. **Update `ai/STATE.md`**: set `current_spec`, `current_ticket: <TICKET-ID>`, `current_role: pm`, `current_phase: pm`; append a decision line ("Spec drafted from <TICKET-ID>; handoff to PM.").
6. **Optionally** offer to post a one-line "spec drafted" comment back to the Linear ticket (writes to Linear — ask first).
7. **Hand off** to the PM. In HITL mode, ask the human to confirm before invoking `ai/roles/pm.md`.

## Anti-patterns

- Don't re-interview the human on things the ticket already answers.
- Don't dump all five passes at once.
- Don't proceed without recording the ticket id in both the spec and `STATE.md`.
