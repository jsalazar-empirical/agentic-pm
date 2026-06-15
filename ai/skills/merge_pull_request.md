# Skill: Merge Pull Request

## When to use this skill

Use to merge an approved PR and advance the ticket to `In Staging`. Invoked by `/sdd-merge`.
Merge is **human-authorized by default** — the human running `/sdd-merge` (or merging in
GitHub) *is* the authorization. In elevated/autonomous mode the PR Reviewer may run this
step itself after it approves.

## Coordinates

Read `ai/context/integrations.md` for the repo and merge convention. GitHub via `gh`.

---

## Inputs

- PR: from `$ARGUMENTS` (number/URL) if given, else `current_pr` in `ai/STATE.md`.
- Linked ticket: `current_ticket` in `ai/STATE.md`.

---

## Merge gate (all must hold — never merge otherwise)

1. **Approved:** `gh pr view <pr> --json reviewDecision` is `APPROVED` — a formal GitHub
   approval from a **non-author** (the review-bot identity, or another teammate; GitHub
   blocks self-approval). If it's `REVIEW_REQUIRED` / `CHANGES_REQUESTED` / empty, stop and
   tell the human to run `/sdd-pr-review` (or address the requested changes) first. If the
   review-bot isn't configured yet, there can be no `APPROVED` on a self-authored PR — say
   so and stop; the human must merge in GitHub or set up the bot (see `ai/context/integrations.md`).
2. **CI green:** `gh pr checks <pr>` shows all checks passing. If checks are still running,
   wait or report; if failing, stop. **No CI configured** (no checks at all) is treated as
   **non-blocking** — there's nothing to wait on — but say so explicitly in the report and
   recommend adding CI. Don't silently imply checks passed when none ran.
3. **Mergeable:** not a draft, no conflicts (`gh pr view <pr> --json isDraft,mergeable`).
   If it's still a draft, mark ready first: `gh pr ready <pr>`.

If any check fails, **do not merge** — report which gate failed and stop.

---

## Procedure

1. Resolve the PR and run the merge gate above. Stop on any failure.
2. Merge with the repo's convention (default squash unless integrations says otherwise):
   `gh pr merge <pr> --squash --delete-branch`.
3. **Move the ticket to `In Staging`** per `ai/skills/sync_ticket_status.md` (no-op if no
   ticket is linked), and post a "Merged → In Staging" progress comment per
   `ai/skills/log_ticket_progress.md` (auto).
4. Update `ai/STATE.md`: append a decision line (`PR #<n> merged → In Staging`). Leave
   `current_pr` as the (now-merged) URL for traceability.
5. Report: merged commit, the ticket's new status, and that `Done` remains for a later
   production deploy.

---

## Rules

- Never merge without **approved + CI green** (the gate above). No exceptions in HITL.
- Never force-merge, never override branch protection, never merge your own unreviewed work.
- `Done` is **not** set here — per the team workflow, Done means deployed to production
  (a separate PR + deploy), handled later.
