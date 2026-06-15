# Skill: Review Pull Request

## When to use this skill

Use after `/sdd-pr` has opened a PR, to run the **independent PR review** on the real diff
against `main`. Invoked by `/sdd-pr-review`. This is the PR Reviewer role's playbook (see
`ai/roles/pr_reviewer.md`). It does **not** merge.

## Coordinates

Read `ai/context/integrations.md` for the repo. GitHub access is via the `gh` CLI.

---

## Inputs

- PR: from `$ARGUMENTS` (a number or URL) if given, else `current_pr` in `ai/STATE.md`.
- Spec: `ai/specs/<current_spec>/spec.md` for the acceptance criteria.
- Optional context: the spec's `review.md` and `test-report.md` (read, but judge the diff
  independently — don't rubber-stamp the internal sign-off).

---

## Procedure

1. **Load the PR reality**, don't trust memory of the branch:
   - `gh pr view <pr> --json title,state,isDraft,reviewDecision,headRefName,url`
   - `gh pr diff <pr>` — the actual diff that will land on `main`.
   - `gh pr checks <pr>` — CI status.
2. **Review against the PR Reviewer gate** in `ai/roles/pr_reviewer.md`: AC coverage, no
   secrets/dead code, scope, CI green, maintainability, correctness/security of changed lines.
   For a large diff, consider spawning a sub-agent (own fork) so the main session stays lean.
3. **Decide:** approve, or request changes.
4. **Draft the review body** — short and specific: a one-line verdict, then bullet findings
   with `file:line` and a fix direction for anything blocking.
5. **Post it** (publishes to GitHub) — **auto, no confirmation** in both HITL and
   autonomous mode. Posting a review (approve or request-changes) is pre-authorized, like
   the progress comment; the human is still the merge gate.
   - Approve: post as the **review-bot identity** (GitHub blocks self-approval), then mark
     the PR ready and (you still don't merge):
     `GH_TOKEN=$PR_REVIEWER_GH_TOKEN gh pr review <pr> --approve --body "<body>"` then
     `gh pr ready <pr>`. See "Review identity" in `ai/context/integrations.md`.
     - If `PR_REVIEWER_GH_TOKEN` is **not** set: you can't post a formal approval. Post a
       comment-review instead (`gh pr review <pr> --comment --body "<body>"`), mark ready,
       and warn that `/sdd-merge` will refuse until the bot is configured (or a human merges).
   - Request changes: `gh pr review <pr> --request-changes --body "<body>"` and leave it a draft.
6. **Post a visibility comment** (`gh pr comment <pr> --body "<summary>"`) — **always**, for
   both approve and request-changes. The formal review can be collapsed in the UI; a
   top-level comment is prominent in the timeline and notifies watchers. Format:
   `🤖 Independent PR Review — ✅ Approved` (or `🔴 Changes requested`), a one-line verdict,
   the per-AC status, and any findings / required changes. Auto-posted (no confirmation).
7. **Post a progress comment on the linked ticket** per `ai/skills/log_ticket_progress.md`
   summarizing the verdict (`PR review: ✅ approved` / `🔴 changes requested`) — auto,
   no-op if no ticket. This is on the Linear ticket, separate from the PR's GitHub comment.
8. **Record** a decision line in `ai/STATE.md`. The ticket stays `In Review` either way
   (an approval just unlocks the merge gate; requested changes route back to the Developer).
9. **On request-changes — triage the fix into one of two lanes (HITL and autonomous):**
   First **classify** the findings:
   - **Small / low-risk** — docs/comments/naming, a localized one-liner, no behavior change,
     no new or changed tests needed.
   - **Substantive** — logic/behavior change, touches multiple files, needs new/changed
     tests, or you're unsure. **When in doubt, treat it as substantive** (the safe lane).

   **Small-fix lane → `/sdd-fix`** (`ai/skills/apply_small_fix.md`):
   1. Apply the small fix on the **same branch**, push (no new PR). No `/sdd-orchestrate`,
      no Tester — it's a patch-in-place; `STATE` phase is unchanged.
   2. **Re-run this review** on the updated diff.

   **Substantive lane → back to the Developer (full verification):**
   1. Record the send-back in `ai/STATE.md` (`reviewer → developer | <reason> | <spec>`) and
      **rewind phase**: set `current_role: developer`, `current_phase: dev`.
   2. Run **`/sdd-orchestrate`** — it resumes at Developer → Tester → Reviewer, so the change
      is re-verified before it comes back. The Developer works on the **same branch** and pushes.
   3. When it reaches DONE again, **re-run this review** on the updated diff.

   **Both lanes:** the PR stays a **draft** (not mergeable) until an approval marks it ready.
   **Loop cap: 2 auto-rounds** of request-changes on the same PR; a 3rd forces HITL — surface
   the outstanding findings to the human and wait (mirrors the gate loop limit in
   `ai/orchestration/hitl_policy.md`; prevents reviewer↔fix ping-pong from running away).

---

## Rules

- Never merge here — that's `/sdd-merge` (or the human in GitHub).
- Review the diff vs. `main`, not the working tree.
- Approving is a gate, not a courtesy. If something blocks, request changes.
- Don't re-run the full suite; trust the Tester and CI.
