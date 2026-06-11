# Integrations — Linear + GitHub

This starter now has an outer loop that connects the SDD role loop to **Linear** (tickets)
and **GitHub** (pull requests), so the full path is:

```
Conversation → Ticket → Spec → Implementation → PR
   /sdd-ticket   /sdd-spec-from-ticket   /sdd-orchestrate   /sdd-pr
```

You never paste ticket-writing instructions into a chat anymore — the standard lives in
`ai/skills/create_linear_ticket.md` and loads when you run `/sdd-ticket`.

---

## What was added

```
.mcp.json                                  ← Linear MCP, project-scoped (committed, no secrets)
CLAUDE.md                                  ← always-loaded baseline orientation
.claude/settings.json                      ← pre-approves read-ish git/gh commands
.claude/commands/
  sdd-ticket.md  sdd-board.md  sdd-task.md
  sdd-spec-from-ticket.md  sdd-pr.md
ai/context/integrations.md                 ← Linear project + GitHub repo coordinates
ai/skills/
  create_linear_ticket.md                  ← the ticket-writing standard
  read_linear_board.md                     ← board listing + single-ticket load
  open_pull_request.md                     ← branch → push → draft PR → review
```

`ai/STATE.md` also gained `current_ticket` and `current_pr` so the ticket ↔ spec ↔ PR
trail is tracked.

---

## One-time setup (per person, per machine)

Everything authenticates on each person's own machine — **no keys are shared or stored in
the repo.**

1. **Clone and open the repo in Claude Code.** Because `.mcp.json` is committed, the Linear
   server is already configured for everyone; you just authorize it.

2. **Authorize Linear:** in a Claude Code session in the repo, run

   ```
   /mcp
   ```

   and complete the browser OAuth for the `empirical` workspace. (You'll be asked to trust
   the project's `.mcp.json` the first time.)

3. **Authenticate GitHub:**

   ```bash
   gh auth login
   ```

   Make sure the repo's `origin` is `jsalazar-empirical/agentic-pm` and you have push access.

4. **Fill in `ai/context/integrations.md`** if anything changed (default reviewers,
   status names, etc.). This file — not the commands — is where coordinates live.

That's it. New teammates repeat steps 1–3 and inherit the same commands and standard.

---

## Daily flow

```
/sdd-ticket                  # idea → well-formed Linear ticket  (or file it in Claude Chat)
/sdd-board                   # see the backlog, pick a ticket
/sdd-spec-from-ticket EMP-123  # ticket → spec (links the ticket, asks only what's missing)
/sdd-orchestrate             # PM → Architect → Developer → Tester → Reviewer
/sdd-pr                      # finished spec → draft PR with review requested
/sdd-status                  # where am I?
```

---

## Safety defaults

- `.claude/settings.json` pre-approves only **read-ish** git/gh commands. `git push`,
  `gh pr create`, and adding reviewers are left to prompt, so publishing always has a hard
  gate. Loosen or tighten to taste.
- Every command that writes (creating a ticket, posting a comment, opening a PR) confirms
  with you first.
- `/sdd-pr` never pushes to `main` and never merges — it leaves a draft PR for human review.
- Secrets stay out of the repo: Linear uses per-user OAuth, GitHub uses your own `gh` login.

---

## GitHub via MCP instead of `gh` (optional)

This setup uses the `gh` CLI for PRs because it keeps tokens off the repo and is the
simplest path. If you'd rather use a GitHub MCP server, add it project-scoped and point
`ai/skills/open_pull_request.md` at it:

```bash
claude mcp add --scope project --transport http github https://api.githubcopilot.com/mcp/
```

Keep any token in your environment, not in `.mcp.json`.
