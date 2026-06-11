# Skill: Open Pull Request

## When to use this skill

Use after a spec has passed the Reviewer gate (phase `done`) to ship it: branch, push,
open a PR, request review. Invoked by `/sdd-pr`.

## Coordinates

Read `ai/context/integrations.md` for the repo, base branch, branch naming, PR
conventions, and reviewers.

---

## Preconditions

- `ai/STATE.md` shows the current spec at `current_phase: done` (Reviewer signed off).
  If not, say so and stop — implementation should go through `/sdd-orchestrate` first.
- The implemented changes are committed (or commit them now with a clear message).

---

## Procedure

1. Read `ai/STATE.md` for `current_spec` and `current_ticket`. Read the spec's `spec.md`
   for the summary and acceptance criteria.
2. Create/confirm the feature branch. Prefer the Linear `branchName` for the ticket (so
   Linear auto-links the PR); else `<TICKET-ID>-<short-slug>`.
3. Run the project's tests and linter. **Don't open a PR over red tests.**
4. Push the branch.
5. **Confirm with the human before opening the PR** — opening a PR publishes content.
6. Open the PR with `gh pr create` against the repo from integrations:
   - Title: `<TICKET-ID>: <summary>`
   - Body: short summary, link to the Linear ticket, link to `ai/specs/<spec>/`, and a
     checklist mapping each acceptance criterion to how it's met.
   - `--draft` unless the human says otherwise.
7. Request review (`gh pr edit --add-reviewer …` or rely on CODEOWNERS).
8. Update `ai/STATE.md`: set `current_pr` to the PR URL and append a decision line.
   Report the PR URL to the human.

---

## Rules

- Never push to `main`. Never merge. Leave the PR for human review.
- Per `ai/orchestration/hitl_policy.md`, this is a human-gated step in HITL mode.
