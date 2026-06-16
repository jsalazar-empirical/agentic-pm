# State

Single source of truth for "where are we right now." Keep this file small (~50 lines max). Older history belongs in git or in `ai/specs/<spec-id>/notes.md`.

---

## Header

```
current_spec:    002-e2e-tests-and-ci
current_ticket:  EMP-81
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

- 2026-06-16 | loop | /sdd-loop L2 started; guardrails = drain EMP-81/82/83, loop-merge pre-authorized.
- 2026-06-16 | architect | architecture.md + tasks.md (Playwright webServer + page.route mock; GH Actions PR CI); Architect gate passed.
- 2026-06-16 | developer | Implemented playwright.config + critical-path.spec + ci.yml + lockfile (audit-clean); Dev gate passed.
- 2026-06-16 | tester | Fork A 16/16 + Fork B 2/2 E2E (mocked generate, computed-CSS styles); all 5 ACs PASS; Tester gate passed.
- 2026-06-16 | reviewer | Reviewer gate passed; 1 INFO (form-data advisory, patched); spec 002 DONE. Ready for /sdd-pr.

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
