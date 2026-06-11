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
5. **Post it** (publishes to GitHub):
   - In **HITL**: show the drafted review + decision and confirm before posting.
   - In **autonomous**: post directly.
   - Approve: `gh pr review <pr> --approve --body "<body>"`, then mark the PR ready for
     review (`gh pr ready <pr>`) — a draft means "awaiting independent review," and your
     approval clears that. (You still don't merge.)
   - Request changes: `gh pr review <pr> --request-changes --body "<body>"` and leave it a draft.
6. **Post a visibility comment** (`gh pr comment <pr> --body "<summary>"`) — **always**, for
   both approve and request-changes. The formal review can be collapsed in the UI; a
   top-level comment is prominent in the timeline and notifies watchers. Format:
   `🤖 Independent PR Review — ✅ Approved` (or `🔴 Changes requested`), a one-line verdict,
   the per-AC status, and any findings / required changes. Confirm before posting in HITL.
7. **Record** a decision line in `ai/STATE.md`. The ticket stays `In Review` either way
   (an approval just unlocks the merge gate; requested changes route back to the Developer).
8. **On request-changes:** tell the human the fix should go back through `/sdd-orchestrate`
   (Developer), then re-run `/sdd-pr-review` once the branch is updated.

---

## Rules

- Never merge here — that's `/sdd-merge` (or the human in GitHub).
- Review the diff vs. `main`, not the working tree.
- Approving is a gate, not a courtesy. If something blocks, request changes.
- Don't re-run the full suite; trust the Tester and CI.
