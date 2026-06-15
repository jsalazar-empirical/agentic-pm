# Skill: Board-Drain Loop

## Purpose

Work the board **autonomously, one ticket at a time**, until there's nothing actionable
left — the "human as orchestrator" mode. The human resolves blockers and merges; the agent
does everything in between. Invoked by `/sdd-loop`.

Runs at autonomy **L2** (see `ai/orchestration/escalation_policy.md`). The board status
*is* the loop's state — no separate bookkeeping.

---

## The loop

```
repeat:
  1. List the board (read_linear_board). Pick the top ACTIONABLE ticket:
     - in Backlog/Todo, not blocked/parked, dependencies satisfied; highest priority / oldest first.
     - none left → STOP (report: done + parked + blocked).
  2. Run the pipeline for that ticket, in autonomous mode:
     /sdd-spec-from-ticket → /sdd-orchestrate → /sdd-pr → /sdd-pr-review
       - Spec from a well-formed ticket is drafted NON-interactively (take the ticket's AC;
         escalate only on genuine ambiguity — don't run the Socratic Q&A unattended).
       - Tester fans out (API + UI forks) as usual; /sdd-fix handles small review fixes;
         substantive fixes loop back to Developer (2-round cap).
  3. Terminal state per ticket = PR approved + ready. MERGE IS HUMAN → park as
     "awaiting merge" (escalation), unless the human pre-authorized loop-merge for this run.
  4. On any escalation (ambiguity / irreversible / repeated failure / security / spec
     conflict — see escalation_policy.md): PARK the ticket (Linear comment + STATE blocker +
     notify) and CONTINUE to the next ticket. Never stall the loop on one blocker.
  5. Honor run guardrails (below). Then loop.
```

---

## Guardrails (hard limits)

- **Merge/deploy stay human** by default — the loop never merges to `main` unless explicitly
  pre-authorized for the run.
- **Caps:** a max-tickets-per-run and/or token/time budget; stop when reached and report.
- **Repeated failure:** if a ticket can't progress after the 2-round caps, park it — don't retry forever.
- **Safety rules are absolute** — autonomy never loosens them.
- **One ticket at a time** (sequential) for now; parallel tickets via isolated worktrees is a
  future enhancement, not this version.

---

## Output

A run summary: tickets **completed** (to PR-ready / merged), **parked** (with the escalation
reason + where the human picks up), and **blocked**. Each ticket's trail is already in its
Linear progress comments; the summary is the loop-level view.

---

## Notes

- Pair with `/loop` (the generic interval runner) only if you want periodic re-checks; the
  board-drain loop itself runs until drained, not on a timer.
- This is L2 of `escalation_policy.md`; start teams at L0/L1 and raise autonomy as trust grows.
