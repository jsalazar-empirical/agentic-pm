# State

Single source of truth for "where are we right now." Keep this file small (~50 lines max). Older history belongs in git or in `ai/specs/<spec-id>/notes.md`.

---

## Header

```
current_spec:    003-template-management
current_ticket:  EMP-82
current_role:    reviewer
current_phase:   done
mode:            autonomous
current_pr:      none
started_at:      2026-06-16
```

> Autonomy: **L2** board-drain loop (`/sdd-loop`). Run guardrails: drain EMP-81 → EMP-82 →
> EMP-83; **loop-merge pre-authorized** this run (approved + CI-green PRs may merge). All
> other Always-escalate items still hard-stop (ambiguity, repeated failure, security, spec
> conflict). One ticket at a time; park-and-continue on escalation.

---

## Recent decisions (rolling — keep last 5 only)

Format: `YYYY-MM-DD | role | decision`

- 2026-06-16 | shipping | EMP-81: PR #8 squash-merged → main (1fc93d1); EMP-81 → In Staging.
- 2026-06-16 | orchestrator | EMP-82: escalated storage decision → human chose Files + Railway volume (TEMPLATES_DIR).
- 2026-06-16 | analyst | Spec 003 drafted from EMP-82 (template CRUD over TEMPLATES_DIR; default protected).
- 2026-06-16 | developer | EMP-82: templates.js CRUD + 4 routes + manage UI; Dev gate passed.
- 2026-06-16 | tester/reviewer | EMP-82: 31 unit + 7 E2E green; all 6 ACs PASS; spec 003 DONE. Ready for /sdd-pr.

---

## Open send-backs

Format: `from <role> → to <role> | reason | spec`

- _none_

---

## Notes

- This file is read at the start of every `/sdd-orchestrate` invocation.
- The orchestrator updates it after every phase transition.
- When the rolling log fills, drop the oldest entry — don't grow this file.
- If you find yourself wanting more history here, you actually want `ai/specs/<spec-id>/notes.md` or git log.
