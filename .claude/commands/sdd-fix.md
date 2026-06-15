---
description: Apply a small, low-risk fix to the current PR branch and re-review (fast lane — not for substantive changes)
---

You are applying a small fix to an open PR's branch — the fast lane out of a PR-review
request-changes, for trivial/low-risk changes only. You do **not** merge.

## Procedure

1. **Read** `ai/skills/apply_small_fix.md` end-to-end. Follow it.
2. **Read** `ai/STATE.md` for `current_pr` (or use a PR named in `$ARGUMENTS`). The fix to make is in `$ARGUMENTS` and/or the PR Reviewer's findings.
3. **Confirm the change is small/low-risk** per the skill's checklist. If it's substantive (logic/behavior, multi-file, needs tests, or you're unsure) → **stop**, record a send-back, set `STATE` to `current_role: developer` / `current_phase: dev`, and tell the human to run `/sdd-orchestrate` instead.
4. Switch to the PR branch, apply the **minimal** edit, run fast tests if code changed, and **commit + push** to the same branch (one tight commit; no new PR).
5. **Re-review:** run `/sdd-pr-review <pr>` on the updated diff.

## Hard rules

- Never merge — that's `/sdd-merge`.
- Small / low-risk only. When in doubt, route to the Developer (`/sdd-orchestrate`), don't patch.
- Don't touch `STATE` phase — a small fix is a patch, not a loop re-run.
- The PR stays a draft until the re-review approves it.
