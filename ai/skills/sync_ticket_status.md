# Skill: Sync Ticket Status

## Purpose

Keep the linked Linear ticket's column in sync with where the work actually is in the
SDD loop. As work moves Conversation → Ticket → Spec → Implementation → PR → merge, the
ticket should move Backlog → Todo → In Progress → (In Testing) → In Review → In Staging.

This is the single source of truth for the **phase → status** mapping. The commands and
skills below just call into it; don't duplicate the mapping elsewhere.

---

## The mapping

| When (transition) | Driven by | Linear status |
|---|---|---|
| Ticket created | `/sdd-ticket` (`create_linear_ticket.md`) | **Backlog** |
| Spec drafted, handed to PM | `/sdd-spec-from-ticket`, or the PM phase of `/sdd-orchestrate` | **Todo** |
| Handoff to Architect | `/sdd-orchestrate` (Architect phase) | **In Progress** |
| Developer phase | `/sdd-orchestrate` (Developer phase) | **In Progress** (no change) |
| Handoff to Tester | `/sdd-orchestrate` (Tester phase) | **In Testing** if it exists, else **In Progress** |
| Reviewer phase | `/sdd-orchestrate` (Reviewer phase) | **In Testing** if it exists, else **In Progress** (no change) |
| PR opened | `/sdd-pr` (`open_pull_request.md`) | **In Review** |
| PR reviewed (independent) | `/sdd-pr-review` (`review_pull_request.md`) | **In Review** (no change; approval unlocks merge) |
| PR merged | `/sdd-merge` (`merge_pull_request.md`) or manual | **In Staging** |
| Deployed to prod | later (separate PR + deploy) | **Done** *(deferred — see Notes)* |

---

## How to apply

1. **Guard:** read `current_ticket` from `ai/STATE.md`. If it's `none`, do nothing —
   there's no ticket to move (spec-only work). This skill is a no-op without a ticket.
2. **Resolve the target status** for the transition from the table above.
   - For the Tester/Reviewer rows: call `list_issue_statuses` for the team once and use
     `In Testing` if a status with that name exists; otherwise fall back to `In Progress`.
     (This makes adding the "In Testing" column later a zero-code change.)
3. **Set it:** `save_issue(id: <TICKET-ID>, state: "<Status Name>")` via the Linear MCP.
   Status names are stable for the Empirical team; pass the name, not a UUID.
4. **Forward-only by default:** set the status mapped to the *current* phase. A normal
   advance moves the ticket forward. A **send-back** legitimately regresses the phase
   (e.g. Tester → Developer), so moving back to **In Progress** is correct in that case.
   Don't otherwise move a ticket backward.
5. **The status move itself needs no commentary** — the column change is the signal. A
   short structured **progress comment** IS posted at this same transition, separately, per
   `ai/skills/log_ticket_progress.md` (the audit trail) — that's also pre-authorized. What
   still requires confirmation is *ad-hoc* Linear content (issue create/edit, freeform
   comments), not these two.

---

## Authorization

Moving a ticket's column is **pre-authorized** as part of the SDD flow — the user opted
into automatic status sync. It rides on a transition that is *already* gated:

- **HITL:** the human just approved the handoff at the gate → move the ticket as part of
  executing that approved transition. No extra confirmation prompt.
- **Autonomous:** move it as the phase advances, same as any other STATE update.

This is distinct from **content** writes to Linear (creating issues, editing descriptions,
posting comments), which still require explicit human confirmation per the project
principles. A column move is not content.

---

## Notes

- **"In Testing" column:** the Linear MCP cannot create workflow states. To get a true
  testing column, add it once in Linear → Settings → Team → Workflow (place it between
  *In Progress* and *In Review*). Until then this skill auto-falls back to *In Progress*.
- **Done:** intentionally not wired yet. Per the team's workflow, *Done* means the change
  is in production (a separate PR + deploy), so it's handled later, not at spec completion.
- Keep this skill in lockstep with `ai/context/integrations.md` → "Status workflow".
- **Companion:** `ai/skills/log_ticket_progress.md` posts a short progress comment at these
  same transition points (the audit trail). Fire both together at each transition.
