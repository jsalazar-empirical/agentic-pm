# Architecture Notes

Spec: `001-core-feedback-generation` · Ticket: EMP-68
KISS is the governing constraint: one Node service, no framework, no database, no auth.

---

## Components

A single Node.js service serves a static frontend and exposes one API route. Layout
(everything under the repo root, created by the Developer):

```
package.json                 # name, "start": "node src/server.js", @anthropic-ai/sdk dep, "type": "module"
.env.example                 # ANTHROPIC_API_KEY=...  (real .env is gitignored, never committed)
.gitignore                   # node_modules, .env
src/
  server.js                  # entry: raw Node http server. Serves /public + routes POST /api/generate
  generate.js                # buildPrompt(template, transcript, notes) + callClaude(...) → feedback string
  templates.js               # loadTemplates() lists templates/*.md; loadTemplate(id) reads one verbatim
templates/
  default-interview.md       # the reference template from the spec Notes (the default)
public/
  index.html                 # template <select>, transcript + notes <textarea>s, Generate button, output + Copy
  app.js                     # fetch POST /api/generate, render result, one-click copy
  styles.css                 # clean, modern, minimal UI
```

Boundaries — **in scope:** the server, the one API route, prompt/template logic, the
static frontend, the default template file, local + Railway config. **Untouched / out:**
no database, no auth, no template CRUD, no persistence of generated feedback, no
role-requirements advice feature. Adding a template later = dropping a `.md` file in
`templates/`; no code change.

---

## APIs

Two routes, both on the same server:

- `GET /api/templates` → `{ "templates": [ { "id": "default-interview", "name": "Default Interview" } ] }`
  Lists the files in `templates/` so the frontend can populate the select. `id` is the
  filename without `.md`; `name` is a humanized form.

- `POST /api/generate`
  Request: `{ "templateId": "default-interview", "transcript": "...", "notes": "..." }`
  Success `200`: `{ "feedback": "<markdown string conforming to the template>" }`
  Errors: `400` `{ "error": "..." }` for missing `templateId`/`transcript` or unknown
  template; `502` `{ "error": "..." }` if the Anthropic call fails. The server reads
  `ANTHROPIC_API_KEY` from the environment; it is never sent to or from the client.

Static: `GET /` and other paths serve files from `public/` (default `index.html`).

---

## Template strategy

This is the core asset and the lever for both the reliability and the cost risks.

- **Templates are files.** Each lives as a `.md` file in `templates/`. The default is the
  cleaned reference template captured in the spec Notes, saved verbatim as
  `templates/default-interview.md`. Selection-only — no editing/upload this round.
- **Verbatim injection.** `loadTemplate(id)` reads the raw file text with no parsing or
  transformation. The exact bytes are injected into the prompt inside a delimited block
  (e.g. `<template>…</template>`), so the model sees the precise structure it must mirror.
- **Conformance enforced by the system prompt**, with these rules (drives reliability):
  1. Reproduce the template's structure exactly — same sections, headings, ratings, and
     tag fields, in the same order. Output nothing outside the template.
  2. Fill every field using **only** the supplied notes and transcript. Never invent
     evidence, names, or facts not present in the inputs.
  3. Each rated phase gets a 1–2 line, evidence-based summary plus a star rating rendered
     as filled/empty stars with the numeric score, e.g. `⭐⭐⭐☆☆ (3/5)`.
  4. A phase with no supporting evidence reads exactly `Not assessed` — no invented rating.
  5. *Fit* and *Overall Recommendation* are filled best-effort from the inputs (the sharper
     role-requirements advice is a future ticket, out of scope here).
- **Star formatting** is delegated to the model via an explicit rule and the worked example
  already present in the template (the template literally shows `⭐⭐⭐☆☆ (3/5)`). No
  server-side star rendering — KISS. The numeric `(n/5)` accompanies the stars so the
  output is unambiguous even if glyphs render differently when pasted.
- **Model:** `claude-sonnet-4-6` (per spec), `thinking: { type: "adaptive" }`, a generous
  `max_tokens` (e.g. 8000) with non-streaming (well under the ~16K streaming threshold).
  System prompt holds the rules; the user message holds the template + transcript + notes.

---

## Data flow

1. Browser loads `index.html`; `app.js` calls `GET /api/templates` and populates the select
   (default pre-selected).
2. Interviewer picks a template, pastes the transcript, types a few lines of notes, clicks
   Generate.
3. `app.js` POSTs `{ templateId, transcript, notes }` to `/api/generate`.
4. `server.js` validates input, calls `loadTemplate(templateId)`, then `generate.js`
   builds the prompt and calls the Anthropic API (`claude-sonnet-4-6`) with the system
   rules + template + transcript + notes.
5. The model returns template-conformant markdown; the server replies `{ feedback }`.
6. `app.js` renders the feedback and exposes a one-click Copy button
   (`navigator.clipboard.writeText`) that copies the raw text for clean paste into Ashby.

The API key lives only server-side; the browser never sees it.

---

## Config

- **Secret:** `ANTHROPIC_API_KEY` read via `process.env`. `.env.example` documents it;
  `.env` is gitignored and never committed. Locally, the dev exports the var (or uses a
  `.env` loaded by `node --env-file=.env` on Node 20+) before `npm start`.
- **Local run:** `npm install` then `npm start` → `node src/server.js`, listening on
  `process.env.PORT || 3000`. Open `http://localhost:3000`.
- **Railway deploy:** Railway sets `PORT` and injects env vars. The server **must** bind
  `process.env.PORT` (no hardcoded port) and host `0.0.0.0`. Start command `npm start`
  (Railway auto-detects, or set explicitly). `ANTHROPIC_API_KEY` is configured as a Railway
  variable, not in the repo. No build step needed (no bundler, no framework).

---

## Important Decisions

- **Raw Node `http` over Express.** The service has two routes and serves a handful of
  static files. The built-in `http` module plus a tiny static handler covers it with zero
  dependencies beyond the Anthropic SDK. *Chose raw `http` over Express because the surface
  is two endpoints — a framework adds dependency weight and indirection without buying
  anything here.* If routing ever grows, swapping in Express is a contained change.
- **Star rating produced by the model, not the server.** *Chose model-rendered stars over a
  server-side `renderStars(n)` helper because the template already demonstrates the exact
  format (`⭐⭐⭐☆☆ (3/5)`) and verbatim-template conformance is already the core mechanism —
  adding server post-processing would duplicate that contract and risk diverging from the
  template.* The numeric `(n/5)` is always included so the score is machine-clear.
- **Anthropic SDK (`@anthropic-ai/sdk`) over raw fetch.** One small, official dependency;
  gives typed errors and adaptive-thinking support without hand-rolling HTTP/SSE. Keeps the
  LLM call one line and the key handling standard.
- **Templates as the conformance contract.** Injecting the file verbatim and instructing the
  model to mirror it (rather than encoding the structure in code) keeps prompt/template logic
  isolated and tweakable without touching app plumbing — per the domain principle.

---

## Risks

Carried forward from the spec, each with a mitigation:

- **LLM output reliability** — the model may drift from the template or hallucinate evidence.
  *Mitigation:* inject the template verbatim; a strict system prompt ("use only supplied
  evidence; match the template exactly; `Not assessed` when no evidence; no invented
  ratings"); the template's own worked star example anchors formatting. Optional light
  post-generation check (e.g. confirm the output contains the template's section headings)
  can be added if drift is observed — not built speculatively.
- **LLM cost per generation** — currently unknown. *Mitigation:* Sonnet 4.6 is the
  cost/quality balance already chosen in the stack; a single generation per click bounds
  per-use cost; `max_tokens` caps output. Actual cost is measurable from `response.usage`
  after the first real generations (resolves the open question in `current_milestone.md`).
- **Transcript quality/length** — long or messy transcripts may degrade quality or approach
  limits. *Mitigation:* Sonnet 4.6 has a 1M-token context window, so typical interview
  transcripts fit comfortably with wide margin; the strict "evidence only / `Not assessed`"
  rules keep messy input from producing invented content. If a transcript ever exceeds
  context, the server surfaces the Anthropic error as a `502` with a readable message rather
  than failing silently. Proactive truncation is not built now (YAGNI) — revisit only if a
  real transcript approaches the limit.
