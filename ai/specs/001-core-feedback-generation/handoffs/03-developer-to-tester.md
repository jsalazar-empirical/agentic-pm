# Handoff: Developer → Tester

Spec: `001-core-feedback-generation` · Ticket: EMP-68

## 1. Summary

The core feedback generation path is implemented exactly as `architecture.md` specifies:
a single Node.js service (raw `http`, no framework, no DB, no auth) that serves a static
frontend and exposes two routes — `GET /api/templates` and `POST /api/generate` — backed
by Claude `claude-sonnet-4-6` with adaptive thinking. Templates live as files and are
injected verbatim; conformance is enforced by a strict system prompt. The frontend is a
single screen: pick template → paste transcript + notes → Generate → result with one-click
copy. All source files pass `node --check`; the test suite is green (16/16). No real
Anthropic calls are made anywhere in the tests.

## 2. Completed Work

Files created:
- `package.json` — ESM (`"type": "module"`), `start` + `test` scripts, `@anthropic-ai/sdk` dep.
- `.env.example` — documents `ANTHROPIC_API_KEY` and optional `PORT`. (`.gitignore` already
  existed at the repo root and covers `node_modules` + `.env`, so no new file was added.)
- `templates/default-interview.md` — the cleaned reference template from the spec Notes, verbatim.
- `src/templates.js` — `loadTemplates()` → `[{ id, name }]`; `loadTemplate(id)` reads raw
  text verbatim, returns `null` for unknown/invalid ids (path-traversal guarded).
- `src/generate.js` — `buildPrompt(template, transcript, notes)` (verbatim template in a
  `<template>` block + `<transcript>` + `<notes>`), exported `SYSTEM_PROMPT` with the
  conformance rules, and `callClaude(...)` using model `claude-sonnet-4-6`,
  `thinking: { type: "adaptive" }`, `max_tokens: 8000`. Key read from `process.env.ANTHROPIC_API_KEY`.
- `src/server.js` — raw `http` server bound to `process.env.PORT || 3000` on `0.0.0.0`;
  routes the two APIs; serves `public/` (default `index.html`) with a path-traversal guard
  and a 5MB body cap; `400` on bad input/unknown template, `502` on Anthropic failure.
- `public/index.html`, `public/app.js`, `public/styles.css` — clean dark minimal UI; loads
  templates on start, posts to `/api/generate`, renders feedback in a `<pre>`, copies raw
  text via `navigator.clipboard.writeText`.
- Tests: `test/templates.test.js`, `test/generate.test.js`, `test/server.test.js`.

Validated decisions (all honoring KISS): raw `http` over Express; model-rendered stars
(no server-side star helper); verbatim template injection; key only ever server-side.

## 3. Pending Work

- **No live-Claude verification.** Per the task instructions, tests do NOT call the real
  API. The two acceptance criteria that depend on a real generation (exact-structure
  conformance + the under-1-minute end-to-end timing) are implemented but unverified against
  a live model — these are the Tester's job with a real key.
- No template CRUD, no persistence, no auth, no role-requirements advice feature (all
  explicitly out of scope this round).

## 4. Important Decisions

- **`max_tokens` set to 8000** (architecture suggested "~8000"). Non-streaming is used; this
  is well under the streaming threshold and fits the template-sized output. If real outputs
  ever truncate (`stop_reason: "max_tokens"`), raise it.
- **Non-streaming `messages.create`.** KISS — one request per click, output is bounded by the
  template. No streaming UI was built.
- **Server input validation rejects empty/whitespace transcripts** (not just missing), and
  `loadTemplate` rejects any id that isn't `[a-z0-9-]+` to prevent path traversal — a small
  hardening beyond the literal architecture text, consistent with its intent.
- **`.gitignore`**: reused the existing repo-root file instead of creating a second one; it
  already ignores `node_modules` and `.env`.

No deviations from `architecture.md` in component layout, routes, request/response shapes,
model, or config.

## 5. Risks

- **LLM output reliability (unverified):** mitigations are in place (verbatim template +
  strict system prompt: evidence-only, exact structure, `Not assessed`, no invented ratings,
  worked star example). Whether the model actually conforms must be checked against a live
  call — this is the highest-value thing for the Tester to confirm.
- **LLM cost per generation:** still unknown; read `response.usage` after the first real runs
  to resolve the open question in `current_milestone.md`.
- **Transcript length:** no truncation built (YAGNI; Sonnet 4.6 has a 1M context). A
  context-limit error surfaces as a readable `502`.

## 6. Questions

None blocking. Open items resolve during testing: (a) confirm `max_tokens: 8000` is enough
for full template output on real transcripts; (b) capture per-generation cost from
`response.usage`.

## 7. Recommended Next Step

**Tester** verifies each acceptance criterion. Suggested procedure:

1. `npm install` (already done in this env), then set a real key:
   - PowerShell: `$env:ANTHROPIC_API_KEY = "sk-ant-..."` then `npm start`.
   - Or use `node --env-file=.env src/server.js` with a local `.env` (gitignored).
2. Automated checks (no key needed): `npm test` — should report **16 pass, 0 fail**. These
   cover template listing/loading (incl. verbatim content + path-traversal rejection), prompt
   building, the system-prompt rules, the `GET /api/templates` and `GET /` routes, and all
   `POST /api/generate` 400 validation paths.
3. Manual / live checks (key needed), against each acceptance criterion:
   - **AC1 (select default template):** open `http://localhost:3000`; the select is populated
     and "Default Interview" is pre-selected.
   - **AC2 (paste transcript + notes):** paste a sample transcript and a few notes lines.
   - **AC3 (template-conformant generation):** click Generate; confirm the output reproduces
     the template's exact sections (Candidate Information, Phase Snapshots, Candidate Summary
     & Recommendation, Stack/Domain tags) with `⭐.. (n/5)` ratings, evidence-based phase
     summaries, and `Not assessed` for any phase your sample has no evidence for. Try a sparse
     transcript to force a `Not assessed`. Confirm nothing is invented.
   - **AC4 (display + one-click copy):** the result shows in the panel; "Copy" puts the raw
     text on the clipboard; paste into Ashby (or a plain editor) and confirm it pastes clean.
   - **AC5 (local + Railway + key from env):** confirm it runs via `npm start`, binds `PORT`,
     and that no key is in the repo (`.env` gitignored, `.env.example` is a placeholder).
   - **AC6 (under ~1 minute):** time paste → copied feedback for a typical transcript.
   - Negative paths: empty transcript and unknown template should show inline errors; if you
     deliberately use a bad key, the UI should surface a `502` message rather than hang.
