# Escalation Policy

The line between what the agent **resolves on its own** and what it **escalates to a human**.
This is the keystone for high-autonomy operation (the board-drain loop, future mobile
unblocking): the more reliably the agent knows when to stop, the more it can safely run.

Generalizes pieces that already exist — HITL gates, `question_contract`, the 2-round loop
caps — into one rule set. The vision: the human acts mainly as an **orchestrator who
resolves blockers and crucial decisions**, not someone who approves every step.

---

## Autonomy levels

Set per run in `ai/STATE.md` (`mode:`) or by the human's instruction:

- **L0 — HITL (default):** pause at every gate. (Today's `hitl` mode.)
- **L1 — Assisted:** run autonomously, pause only at **Always-escalate** items below.
- **L2 — Autonomous loop:** L1 + drive multiple tickets unattended (see
  `ai/skills/board_drain_loop.md`). Still pauses at Always-escalate items.

L1/L2 are the "human as orchestrator" modes. Even at L2, the escalations below are hard stops.

---

## Always escalate (never auto-resolve)

1. **Irreversible / outward-facing / high-impact actions** — merge to `main`, deploy,
   deleting data, force-push, sending external messages, changing access/permissions,
   spending money. (These already require confirmation per the safety rules — autonomy does
   not loosen them.)
2. **Genuine ambiguity** the agent can't resolve from the spec/context — raise a
   `question_contract`. Don't guess on something that changes the outcome.
3. **Repeated failure** — a gate hits its **2-round cap**, or a fix loop won't converge.
4. **Security-sensitive findings** — secrets, auth/permission changes, anything that looks
   exploitable.
5. **Spec-level conflicts** — contradictory or shifting requirements, scope changes the
   agent shouldn't decide unilaterally. Route to PM/Analyst.
6. **Project "always-ask" items** — anything the project explicitly flags (declare in
   `ai/context/integrations.md` or `STATE.md`).

**Merge and deploy stay human by default at every autonomy level** — the agent takes work
to "approved + ready" and parks it for the human to merge (unless the human has explicitly
pre-authorized loop-merge for a run).

---

## Auto-resolve (proceed; just log)

Normal phase transitions, passing gates, deterministic test passes, the `/sdd-fix` small-fix
lane, ticket status sync, and the progress-comment audit trail. These are pre-authorized and
need no human — log them (`STATE.md` + ticket comments) and continue.

---

## How an escalation works

1. **Park** the item — don't stall the whole run on it.
2. **Record** it as a blocker in `ai/STATE.md` (Open send-backs / blockers) with the reason.
3. **Surface** it: `question_contract` and/or a Linear comment; notify the human (future:
   Telegram/WhatsApp transport).
4. In the **loop**, move on to the next ticket; the parked item resumes when the human resolves it.

---

## Anti-patterns

- ❌ Auto-deciding an Always-escalate item because "it probably wanted X."
- ❌ Stalling the entire loop on one blocked ticket instead of parking it and continuing.
- ❌ Treating a chat/phone reply as authorization without identity verification (future mobile).
- ❌ Letting autonomy level loosen the safety rules — it never does.
