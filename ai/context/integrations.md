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

### Status workflow

The ticket's column tracks where the work is in the SDD loop. Each command moves the
linked ticket as it runs — the mechanism and rules live in `ai/skills/sync_ticket_status.md`
(the single source of truth). Mapping:

| Transition | Status |
|---|---|
| `/sdd-ticket` creates it | `Backlog` |
| Spec handed to PM (`/sdd-spec-from-ticket` / PM phase) | `Todo` |
| Handoff to Architect → Developer | `In Progress` |
| Handoff to Tester → Reviewer | `In Testing` if the column exists, else `In Progress` |
| PR opened (`/sdd-pr`) | `In Review` |
| Independent PR review (`/sdd-pr-review`) | stays `In Review` (approval unlocks merge) |
| PR merged (`/sdd-merge`) | `In Staging` |
| Deployed to prod (later) | `Done` |

**PR review & merge gate.** The internal Reviewer is a pre-PR quality gate. Once `/sdd-pr`
opens the (draft) PR, an **independent PR Reviewer** (`/sdd-pr-review`, own fork) reviews
the real diff vs. `main` and approves or requests changes — it does **not** merge. Merge is
the **human's** by default: run `/sdd-merge` (or merge in GitHub). `/sdd-merge` refuses
unless the PR is **approved + CI green**, then merges and advances the ticket to
`In Staging`. In autonomous mode the PR Reviewer may run the merge itself after approving.
`Done` is deferred to a later production deploy.

Team statuses today: `Backlog`, `Todo`, `In Progress`, `In Review`, `In Staging`, `Done`.
There is **no "In Testing"** column yet — the Linear MCP can't create one, so add it
manually in Linear → Settings → Team → Workflow (between *In Progress* and *In Review*).
Once it exists, the Tester/Reviewer rows pick it up automatically.

**Progress log (traceability).** Alongside each status move, a short structured comment is
auto-posted to the ticket summarizing what the role did, the gate result, and what's next
(see `ai/skills/log_ticket_progress.md`). This builds a full audit trail in the ticket
itself — spec → each role → PR → review → merge — without bloating the repo. These
progress comments are **pre-authorized** (auto-posted, no confirmation); ad-hoc comments
and issue create/edit still require confirmation.

---

## GitHub

- Repo: `jsalazar-empirical/agentic-pm`
- Default base branch: `main`
- Branch naming: `<type>/<TICKET-ID>-<short-slug>` where `type` is one of
  `feature` · `fix` · `hotfix` · `chore` · `docs` · `refactor`.
  - Examples: `feature/EMP-68-core-feedback-generation`, `fix/EMP-90-template-escaping`,
    `hotfix/EMP-91-prod-500`. For ticketless tooling/process work, drop the id:
    `chore/<short-slug>` (e.g. `chore/sdd-status-sync`).
  - Keep the `<TICKET-ID>` in the branch — Linear auto-links the PR from the id, so we get
    linking without the author-name prefix Linear suggests by default. Don't use bare
    `jsalazar/...` style prefixes.
- PRs: open as **draft**, title prefixed with the ticket id, body links the Linear
  ticket and the spec folder
- Reviewers: _fill in default reviewers, or rely on CODEOWNERS_
- Connection: GitHub CLI (`gh`). Each person authenticates with their own
  `gh auth login`. No tokens in the repo.

### Review identity (PR Reviewer bot)

The independent PR Reviewer (`/sdd-pr-review`) posts a **formal GitHub approval**, and
`/sdd-merge` requires `reviewDecision == APPROVED`. GitHub **blocks self-approval**, so the
reviewer must act as a **separate identity from the author** — a dedicated bot account or a
GitHub App. Setup (one-time):

**Configured reviewer:** the bot account **`empirical-pr-bot-sudo`** (GitHub login;
email `empirical-pr-bot@goempirical.com`). It is a collaborator on `agentic-pm` with
**write** (review) permission. Setup:

1. Create the reviewer identity (done — `empirical-pr-bot-sudo`):
   - **Bot account** (in use): a separate GitHub account added to the repo as a collaborator
     with at least **write** (review) permission. Generate a PAT for it (scope: `repo`).
   - **or GitHub App**: create + install an App on the repo with pull-request read/write,
     and use an installation token.
2. Store the token **out of the repo** as an env var: `PR_REVIEWER_GH_TOKEN` (e.g. in the
   gitignored `.env`, or your shell profile). Never commit it.
3. `/sdd-pr-review` posts the approval as the bot by setting `GH_TOKEN=$PR_REVIEWER_GH_TOKEN`
   for the `gh pr review --approve` call only; everything else uses the human's `gh`.

If `PR_REVIEWER_GH_TOKEN` is **not** set, the reviewer falls back to a comment-review +
visibility comment and warns that a formal approval isn't possible — and `/sdd-merge` will
correctly refuse to merge (no `APPROVED`). Until the bot exists, a human merges in GitHub.

---

## Linkage (the trail)

Conversation → Ticket → Spec → Implementation → PR.

- A spec created from a Linear ticket records the ticket id at the top of its `spec.md`
  and in `ai/STATE.md` (`current_ticket`).
- The PR references both the ticket id and the spec folder, so the whole trail is
  traceable from the merged change back to the original ask.
