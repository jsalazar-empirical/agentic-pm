# Tasks

Ordered for the Developer. Derived from `architecture.md` and the spec's acceptance
criteria. Checked off as implementation lands.

## Project setup
- [x] Create `package.json` (`"type": "module"`, `"start": "node src/server.js"`, dependency `@anthropic-ai/sdk`)
- [x] Add `.gitignore` (`node_modules`, `.env`) — already present at repo root; covers both
- [x] Add `.env.example` documenting `ANTHROPIC_API_KEY`
- [x] `npm install`

## Templates
- [x] Create `templates/default-interview.md` with the cleaned reference template from the spec Notes (verbatim)
- [x] Implement `src/templates.js`: `loadTemplates()` (list `templates/*.md` → `{ id, name }`) and `loadTemplate(id)` (read raw file text, no parsing)

## Prompt + Claude call
- [x] Implement `src/generate.js`: `buildPrompt(template, transcript, notes)` injecting the template verbatim in a delimited block
- [x] Write the system prompt rules: match template exactly; use only supplied evidence; `Not assessed` for phases without evidence; never invent ratings; stars as `⭐⭐⭐☆☆ (n/5)`; Fit/Recommendation best-effort
- [x] Implement `callClaude(...)` using `@anthropic-ai/sdk`, model `claude-sonnet-4-6`, `thinking: { type: "adaptive" }`, `max_tokens` ~8000, returning the feedback string
- [x] Read `ANTHROPIC_API_KEY` from `process.env` (never from client input)

## Server
- [x] Implement `src/server.js` using the built-in `http` module
- [x] Bind `process.env.PORT || 3000` on host `0.0.0.0` (Railway-compatible)
- [x] Route `GET /api/templates` → `{ templates }`
- [x] Route `POST /api/generate`: parse JSON body, validate `templateId` + `transcript` (`400` on missing/unknown), call generate, return `{ feedback }`; `502` on Anthropic failure with a readable message
- [x] Serve static files from `public/` (default `index.html`)

## Frontend
- [x] Build `public/index.html`: template `<select>`, transcript + notes `<textarea>`s, Generate button, result area, Copy button
- [x] Build `public/app.js`: load templates on start, POST to `/api/generate`, render result, show loading/error states
- [x] Implement one-click copy via `navigator.clipboard.writeText` (raw feedback text for clean Ashby paste)
- [x] Build `public/styles.css`: clean, modern, minimal UI

## Verify against acceptance criteria
- [x] Interviewer can select the default template from the file-based list (covered by `GET /api/templates` + frontend select; tested)
- [x] Interviewer can paste a transcript and enter notes (frontend textareas wired to the POST)
- [~] Generate returns feedback matching the template's exact section structure, with evidence-based phase summaries + star ratings, and `Not assessed` where there is no evidence — *implemented via verbatim injection + strict system prompt; NOT verified against a live Claude call (no real API calls in this round). Tester to validate with a real key.*
- [x] Result is displayed and copyable with one action, pasting cleanly into Ashby (raw text in `<pre>`, `navigator.clipboard.writeText`)
- [x] App runs locally (`npm start`) and is deployable to Railway; key read from env, never committed (`.env` gitignored, `.env.example` provided, binds `process.env.PORT`/`0.0.0.0`)
- [~] Paste → copied feedback flows in well under ~1 minute for a typical transcript — *UI path is one screen + one click; end-to-end latency depends on the live Claude call, to be confirmed by the Tester.*
