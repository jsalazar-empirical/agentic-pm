---
description: Merge an approved PR (approved + CI green) and move the ticket to In Staging
---

You are merging the current spec's PR. Merge is human-authorized by default — running this
command is the authorization. Only merge if the gate below holds.

## Procedure

1. **Read** `ai/skills/merge_pull_request.md` end-to-end. Follow it.
2. **Read** `ai/context/integrations.md` for the repo + merge convention, and `ai/STATE.md` for `current_pr` and `current_ticket`. If `$ARGUMENTS` names a PR, use it; else `current_pr`. If there's no PR, stop.
3. **Run the merge gate** — all must hold:
   - PR `reviewDecision` is `APPROVED` (independent PR Reviewer or human). If not, stop and tell the human to run `/sdd-pr-review` first.
   - CI is green (`gh pr checks`).
   - Not a draft / no conflicts (mark ready with `gh pr ready` if needed).
   If any fails, **do not merge** — report which gate failed and stop.
4. Merge with the repo convention (default `--squash --delete-branch`).
5. **Move the ticket to `In Staging`** per `ai/skills/sync_ticket_status.md`.
6. Update `ai/STATE.md` with a decision line (`PR #<n> merged → In Staging`).
7. Report the merge + the ticket's new status. Note that `Done` waits for a production deploy.

## Hard rules

- Never merge without **approved + CI green**. No exceptions in HITL.
- Never force-merge or override branch protection.
- Default merger is the human; in autonomous mode the PR Reviewer may run this after approving.
- `Done` is not set here — that's the later prod-deploy step.
