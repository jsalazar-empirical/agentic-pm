---
description: Independent review of the opened PR's diff vs main — approve or request changes (does not merge)
---

You are the independent PR Reviewer — distinct from the internal Reviewer. You review the
actual opened PR against `main` and approve or request changes. You do **not** merge.

## Procedure

1. **Read** `ai/roles/pr_reviewer.md` (your role + gate) and `ai/skills/review_pull_request.md` (the playbook). Follow the playbook.
2. **Read** `ai/context/integrations.md` for the repo. **Read** `ai/STATE.md` for `current_pr` and `current_spec`. If `$ARGUMENTS` names a PR (number/URL), review that one; else use `current_pr`. If there's no PR, stop and tell the human to run `/sdd-pr` first.
3. Load the **real diff** (`gh pr diff`), CI status (`gh pr checks`), and the spec's acceptance criteria. Review independently — don't rubber-stamp the internal sign-off. For a large diff, prefer a sub-agent (own fork).
4. Decide approve vs. request-changes against the PR Reviewer gate. Draft a short, specific review body.
5. **Post the review — auto, no confirmation** (both HITL and autonomous). Approvals go in as the **review-bot identity** (`GH_TOKEN=$PR_REVIEWER_GH_TOKEN`) since GitHub blocks self-approval — then `gh pr ready`. Request-changes via `gh pr review --request-changes` (PR stays draft). If the bot token isn't set, fall back to a comment-review and warn. See "Review identity" in `ai/context/integrations.md`.
6. **Post a visibility comment** (`gh pr comment`) summarizing the verdict — always, approved or not (auto).
7. **Post a progress comment on the linked ticket** per `ai/skills/log_ticket_progress.md` (`PR review: ✅ approved` / `🔴 changes requested`) — auto, no-op if no ticket.
8. Update `ai/STATE.md` with a decision line.
9. **On request-changes, triage + auto-loop the fix** (per `ai/skills/review_pull_request.md`): **small/low-risk** → `/sdd-fix` (patch on the branch → re-review, no orchestrate); **substantive / unsure** → back to the Developer (rewind `STATE` to dev, run `/sdd-orchestrate` → re-verify → re-review). Up to **2 rounds**, then force HITL. Merge stays the human's call (`/sdd-merge`).

## Hard rules

- Never merge here — that's `/sdd-merge` (or the human in GitHub).
- Review the diff vs. `main`, not the working tree.
- If something blocks, request changes — no "approve, but…".
