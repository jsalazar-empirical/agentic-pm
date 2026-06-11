# Integrations

External systems this project is wired to. The Linear and GitHub commands read this
file — change coordinates here, not inside the commands.

---

## Linear

- Workspace / team: `empirical`
- Project: `agentic-pm`
- Project URL: https://linear.app/empirical/project/agentic-pm-bcbf3c6d1fca/issues
- Default status for new tickets: `Backlog`
- Connection: Linear MCP, configured project-wide in `.mcp.json`. Each person authorizes
  once per machine by running `/mcp` inside a Claude Code session and completing the
  browser OAuth. No tokens live in the repo.

---

## GitHub

- Repo: `jsalazar-empirical/agentic-pm`
- Default base branch: `main`
- Branch naming: prefer the `branchName` Linear exposes for the ticket (so Linear
  auto-links the PR); otherwise `<TICKET-ID>-<short-slug>`
- PRs: open as **draft**, title prefixed with the ticket id, body links the Linear
  ticket and the spec folder
- Reviewers: _fill in default reviewers, or rely on CODEOWNERS_
- Connection: GitHub CLI (`gh`). Each person authenticates with their own
  `gh auth login`. No tokens in the repo.

---

## Linkage (the trail)

Conversation → Ticket → Spec → Implementation → PR.

- A spec created from a Linear ticket records the ticket id at the top of its `spec.md`
  and in `ai/STATE.md` (`current_ticket`).
- The PR references both the ticket id and the spec folder, so the whole trail is
  traceable from the merged change back to the original ask.
