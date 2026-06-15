# Skill: Apply Small Fix

## When to use this skill

The **fast lane** for a small, low-risk change to an **open PR's branch** — typically a
fix the PR Reviewer requested (`/sdd-pr-review`) that's too trivial to justify a full
re-run of the role loop. Invoked by `/sdd-fix`. It patches the branch in place and
re-reviews; it does **not** run `/sdd-orchestrate`, does **not** involve the Tester, and
does **not** change the `STATE` phase.

## What counts as "small" (all must hold)

- Docs / comments / naming / a localized one-liner.
- **No behavior change**, or a change so contained its effect is obvious.
- **No new or changed tests** needed to trust it.
- Confined to a file or two.

If any of these don't hold — logic/behavior change, multi-file, needs tests, or you're
**unsure** — this is **not** a small fix. **Stop** and route it back to the Developer:
record a send-back, set `STATE` `current_role: developer` / `current_phase: dev`, and run
`/sdd-orchestrate` so it re-verifies through Tester → Reviewer. Default to this safe lane
when in doubt.

---

## Inputs

- The fix: `$ARGUMENTS` (a short description) and/or the PR Reviewer's findings.
- The target PR + branch: from `ai/STATE.md` `current_pr` (or an explicit PR arg). Work on
  that PR's head branch — never on `main`.

## Procedure

1. **Confirm it's small** per the checklist above. If not → route to the Developer (stop here).
2. **Be on the PR branch** (`git switch <branch>`); pull latest.
3. **Apply the minimal edit(s).** Smallest change that resolves the finding — no drive-by edits.
4. **Sanity check:** if the repo has fast tests and code changed, run them; for docs-only,
   none needed. Don't start long-running processes.
5. **Commit + push** to the PR branch — one tight commit, clear message referencing the fix.
   No new PR; the existing PR updates.
6. **Re-review:** run `/sdd-pr-review <pr>` on the updated diff.

## Rules

- Never merge. Never use for substantive changes (those go through the Developer + full loop).
- The PR stays a **draft** until the re-review approves it.
- Keep `STATE` phase unchanged — a small fix is a patch, not a re-run of the loop.
- If a "small" fix balloons once you're in it, abort and route to the Developer.
