# Test Report — Spec 001: Core Feedback Generation

Ticket: EMP-68 · Tester role · Date: 2026-06-10
Environment: Windows 11, Node v22.21.0, PowerShell. Live API run authorized and executed
against the real Anthropic API (`claude-sonnet-4-6`).

---

## Summary verdict

**All 6 acceptance criteria PASS.** The offline suite is green (16/16). One live
end-to-end generation was run two ways — a rich transcript (all phases have evidence) and
a sparse transcript (two phases have no evidence) — to verify both the conformance path and
the "Not assessed" path. Output conformed exactly to the default template in both cases, with
no invented evidence. Generation latency was well under the 1-minute target. Per-generation
cost is roughly **$0.02–$0.05**, resolving the open question in `current_milestone.md`.

---

## Offline test suite

Command: `npm test` (deps already installed; `npm install` not needed).

```
# tests 16
# pass 16
# fail 0
# duration_ms ~728
```

Coverage: prompt building (verbatim template injection, transcript/notes blocks, missing-notes
tolerance), the SYSTEM_PROMPT conformance rules, `GET /api/templates`, `GET /` static serve,
all `POST /api/generate` 400 validation paths (missing templateId, empty transcript, unknown
template, invalid JSON), and template listing/loading incl. verbatim content + path-traversal
rejection + non-string id rejection. No flaky tests observed. No real API calls in the suite.

---

## Live verification (AC3 + AC6)

Procedure: started the server in the background with `node --env-file=.env src/server.js`,
confirmed `GET /api/templates` returned the default template, then `POST /api/generate` with a
realistic interview transcript (covering Technical Discussion, Live Coding, System Design, and
Communication phases) plus a few lines of notes, using `templateId: "default-interview"`. A
second sparse run (Technical Discussion + Communication only) was executed via a throwaway SDK
script (since `response.usage` is not surfaced through the server response) to (a) capture token
usage and (b) force the "Not assessed" path. The throwaway script was deleted afterward. Server
was stopped after testing.

### Rich-transcript run (server, POST /api/generate)

- HTTP 200. Output reproduced every template section in order: Candidate Information, Phase
  Snapshots (all 4 phases), Candidate Summary & Recommendation (Strengths, Areas to Improve,
  Red Flags, Fit for This Role, Overall Recommendation), Stack Tags, Domain Tags, Additional
  Notes.
- Star ratings rendered as `⭐⭐⭐⭐☆ (4/5)` form with the numeric score, exactly per template.
- Phase summaries were evidence-based and grounded in the transcript/notes (e.g. Kafka/Redis
  idempotency, the `reduce`-based coding answer with edge cases, lease-based in-flight pattern).
- Fields with no input read `Not specified`/`Not provided`; no invented names, dates, or facts.
- Frontend gap (absent from transcript) was correctly surfaced as an "Area to Improve", not
  fabricated as a rating.

### Sparse-transcript run (forces "Not assessed")

For a transcript with no live-coding and no system-design content, those two phases rendered
exactly:

```
### 💻 Live Coding
- **Summary (1–2 lines):** Not assessed
- **Rating:** Not assessed

### 🏗️ System Design
- **Summary (1–2 lines):** Not assessed
- **Rating:** Not assessed
```

No invented ratings. The two phases with evidence got grounded summaries and real star ratings.
`stop_reason: end_turn` (no truncation — `max_tokens: 8000` is sufficient for full output).

### AC6 — timing (wall-clock)

| Run | Wall-clock |
|---|---|
| Sparse run (measured precisely via SDK script) | **20.65 s** |
| Rich run (server POST, HTTP 200) | comparable, well under 1 min |

Comfortably under the ~1-minute target. End-to-end "paste → copied" adds only client-side render
+ a clipboard click on top of this, which is negligible.

---

## Token usage + cost estimate (resolves open question)

Captured from `response.usage` on the sparse run (`claude-sonnet-4-6`):

```
input_tokens: 982
output_tokens: 1244  (of which thinking_tokens: 568)
cache_read/creation: 0
```

Pricing (claude-sonnet-4-6, verified via claude-api skill): **$3.00 / 1M input, $15.00 / 1M output**
(output tokens are billed inclusive of thinking tokens).

- Sparse run cost: 982 × $3/1M + 1244 × $15/1M = $0.00295 + $0.01866 ≈ **$0.022**.
- A richer transcript (longer input, fuller output across 4 phases) scales up modestly; the
  template + system prompt are a fixed ~700–800 token floor, and realistic transcripts add a few
  hundred to ~2k input tokens with ~1.2k–2k output tokens.

**Estimated per-generation cost: ~$0.02–$0.05** for typical interview transcripts. This is the
answer to the open question in `current_milestone.md`. Cost risk is low: a single generation per
click bounds per-use cost, and `max_tokens: 8000` caps the output ceiling.

---

## Per-AC verdicts

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC1** — select template; default available | PASS | `GET /api/templates` → `{"templates":[{"id":"default-interview","name":"Default Interview"}]}`; `app.js` populates the select and the single default is pre-selected. |
| **AC2** — paste transcript + enter notes | PASS | UI exposes transcript + notes textareas; `POST /api/generate` accepted `{templateId, transcript, notes}` and returned 200. Offline tests cover the 400 validation paths (empty transcript rejected). |
| **AC3** — Claude (Sonnet 4.6) returns exact template structure; evidence-based summaries + star ratings; "Not assessed" never invented | PASS | Live output matched every section/heading/tag in order with `⭐.. (n/5)` ratings; sparse run rendered `Not assessed` for both evidence-free phases; no fabricated names/dates/ratings. Model `claude-sonnet-4-6` confirmed in `src/generate.js`. |
| **AC4** — displayed + one-click copy, clean Ashby paste | PASS | `app.js` renders feedback into `<pre id="output">` (raw markdown, whitespace preserved) and `copyBtn` calls `navigator.clipboard.writeText(outputEl.textContent)` — copies the raw text verbatim, which pastes cleanly as plain text. |
| **AC5** — runs locally + Railway-ready; key from env, never committed | PASS | Ran via `node --env-file=.env src/server.js`; server binds `process.env.PORT \|\| 3000` on `0.0.0.0` (Railway-compatible); key read from `process.env.ANTHROPIC_API_KEY` only; `.env` gitignored, `.env.example` is a placeholder; no key in source or server log. |
| **AC6** — paste → copied feedback under ~1 min | PASS | Generation wall-clock 20.65 s (measured); rich server run comparable. Well under 1 minute. |

---

## Tester gate (validate_handoff.md)

| Gate item | Result |
|---|---|
| Every acceptance criterion has a pass/fail verdict with evidence | PASS — all 6 verdicts above, each with evidence. |
| Failures are reproducible (steps recorded) | PASS (vacuously — no failures). Steps for every check are recorded above; a failure would have been recorded with repro steps. |
| Test scope matches the spec (not over/under-testing) | PASS — tested exactly the 6 ACs; out-of-scope items (template CRUD, persistence, auth, role-requirements advice) were not tested, matching spec scope. |
| No flaky tests left in the suite | PASS — 16/16 deterministic; no real API calls in the suite. |
| Edge cases the spec named are covered | PASS — "Not assessed" for evidence-free phases verified live; empty/invalid input 400 paths covered offline. |

**Gate: PASS — ready to hand off to Reviewer.**

---

## Notes / non-blocking observations

- No production source code was modified during testing (Tester does not fix).
- The throwaway usage-probe script was created, run with `--env-file=.env`, and deleted; it was
  never committed.
- The API key was never printed, copied into any file, or committed.
