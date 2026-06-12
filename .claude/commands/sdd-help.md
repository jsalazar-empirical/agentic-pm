---
description: List the SDD commands — the main flow plus supporting commands, each with a one-line description and example
---

Print the SDD command reference below to the user **as-is** (GitHub-flavored markdown).
Don't invent commands beyond this list; if asked about one, point to its file in
`.claude/commands/`. If `$ARGUMENTS` names a command (e.g. `sdd-pr`), additionally read that
command file and give a short explanation.

# SDD Commands

## The flow — run these in order

| Command | What it does | Example |
|---|---|---|
| `/sdd-ticket` | Turn an idea into a Linear ticket | `/sdd-ticket add CSV export` |
| `/sdd-spec-from-ticket <id>` | Draft a spec from a ticket (Socratic, linked) | `/sdd-spec-from-ticket EMP-68` |
| `/sdd-orchestrate` | Run PM → Architect → Developer → Tester → Reviewer | `/sdd-orchestrate` |
| `/sdd-pr` | Open the GitHub PR for the finished spec | `/sdd-pr` |
| `/sdd-pr-review <pr>` | Independent review of the PR — approve / request changes | `/sdd-pr-review 3` |
| `/sdd-merge <pr>` | Merge once approved + CI green → ticket to In Staging | `/sdd-merge 3` |

## Other commands

| Command | What it does | Example |
|---|---|---|
| `/sdd-init` | Set up `ai/context/*` for a new/empty project (run once) | `/sdd-init` |
| `/sdd-board` | List the Linear board, grouped by status | `/sdd-board` |
| `/sdd-task <id>` | Load one ticket and summarize the gaps a spec must close | `/sdd-task EMP-68` |
| `/sdd-spec` | Draft a spec directly from a clear ask | `/sdd-spec` |
| `/sdd-spec-socratic` | Draft a spec via a Socratic interview (vague ask) | `/sdd-spec-socratic` |
| `/sdd-status` | Show where you are — active spec, role, phase, mode | `/sdd-status` |
| `/sdd-handoff` | Produce a role-to-role handoff contract | `/sdd-handoff` |
| `/sdd-help` | Show this command list | `/sdd-help` |

The linked Linear ticket moves columns automatically as you go:
**Backlog → Todo → In Progress → In Testing → In Review → In Staging.**
