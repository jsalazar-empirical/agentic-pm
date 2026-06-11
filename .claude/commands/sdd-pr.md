---
description: After the Reviewer gate, open a GitHub PR for the current spec/ticket and request review
---

You are shipping the current spec as a pull request.

## Procedure

1. **Read** `ai/skills/open_pull_request.md` end-to-end. Follow it.
2. **Read** `ai/context/integrations.md` for the repo, base branch, branch naming, and reviewers.
3. **Read** `ai/STATE.md` — require `current_phase: done`. If not done, stop and tell the human to finish `/sdd-orchestrate` first.
4. Branch, ensure tests pass, push, and **confirm before opening the PR.**
5. Open the PR (draft) with the ticket id in the title, linking the Linear ticket and the spec folder; request review.
6. Update `ai/STATE.md` with the PR URL (`current_pr`).

## Hard rules

- Never push to `main`. Never merge. Confirm before publishing the PR.
