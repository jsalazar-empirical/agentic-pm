# Skill: Log Ticket Progress

## Purpose

Keep a **traceability trail in the Linear ticket itself**: as each role finishes its duty
and right before the handoff to the next, post a short comment to the linked ticket
summarizing what was done. Anyone can then read the ticket and follow the whole story —
spec → each role → PR → review → merge — without cloning the repo or digging through git.

This complements, and does not duplicate, the in-repo handoff contracts
(`ai/specs/<id>/handoffs/`): those are the detailed working artifact for the next role;
these comments are short narrative summaries for stakeholders/audit. Keep this skill in
lockstep with `ai/skills/sync_ticket_status.md` — both fire at the same transition points.

---

## Authorization

Posting an SDD progress comment is **pre-authorized** — post it automatically, **no
confirmation prompt**, in both HITL and autonomous mode. The user opted into an automatic
audit trail; comments are low-stakes and reversible, so we are deliberately less rigid
here than for other Linear content writes. (Creating/editing issues and ad-hoc comments
still require confirmation; this exception covers only the structured progress comments
defined below, fired at the flow's own transition points.)

---

## When to post (one short comment per transition)

| Transition | Driven by | Header |
|---|---|---|
| Spec drafted, handed to PM | `/sdd-spec-from-ticket` | `🧭 Spec drafted → PM` |
| PM gate passed | `/sdd-orchestrate` | `🧭 PM ✅ → Architect` |
| Architect gate passed | `/sdd-orchestrate` | `🧭 Architect ✅ → Developer` |
| Developer gate passed | `/sdd-orchestrate` | `🧭 Developer ✅ → Tester` |
| Tester gate passed | `/sdd-orchestrate` | `🧭 Tester ✅ → Reviewer` |
| Reviewer gate passed (DONE) | `/sdd-orchestrate` | `🧭 Reviewer ✅ → DONE` |
| PR opened | `/sdd-pr` | `🧭 PR opened → In Review` |
| PR reviewed (approve / changes) | `/sdd-pr-review` | `🧭 PR review: ✅ approved` / `🔴 changes requested` |
| PR merged | `/sdd-merge` | `🧭 Merged → In Staging` |

On a **send-back**, post a short comment noting the send-back (from → to role) and why.

---

## How to apply

1. **Guard:** read `current_ticket` from `ai/STATE.md`. If it's `none`, **do nothing** —
   no ticket, no trail. (Spec-only work just relies on the repo artifacts.)
2. **Compose a short comment** (3–6 lines), derived from the role's handoff contract — a
   summary, not a copy. Use the header from the table above, then:
   - **Did:** 1–3 bullets of what this role produced/decided.
   - **Gate:** pass/fail (and the key evidence in a few words).
   - **Next:** which role/step is next.
   - Optionally link the artifact path (e.g. `ai/specs/<id>/architecture.md`).
3. **Post it:** `save_comment(issueId: <TICKET-ID>, body: <comment>)` via the Linear MCP.
   Automatically — no confirmation (see Authorization).
4. Keep it concise. The detail lives in the handoff contract; the comment is the headline.

---

## Example comment

```
🧭 Architect ✅ → Developer

**Did:** Chose raw Node `http` over Express (2 routes); templates as files injected
verbatim; `POST /api/generate` returns `{feedback}`.
**Gate:** Passed — components/boundaries named, 1 tradeoff documented, risks mitigated.
**Next:** Developer implements against `ai/specs/001-core-feedback-generation/architecture.md`.
```

---

## Notes

- One comment per transition — don't re-post on re-runs of the same gate unless something
  changed (avoid noise).
- This is a top-level comment (the audit timeline). It's separate from the PR Reviewer's
  GitHub PR comment, which lives on the PR; for full traceability the ticket also gets the
  short `PR review` line above.
