# Tech Stack

## Frontend

- Plain vanilla JavaScript (no framework), HTML, CSS.

---

## Backend

- **Node.js** (chosen over Python to keep the whole stack in one language and stay
  lightweight). A minimal HTTP layer (e.g. Express or built-in `http`) is enough —
  the backend mainly serves templates and proxies LLM calls.

---

## Database

- **None.** Feedback templates are stored as files in the repo. Generated feedback is
  loaded into **Ashby** by the user, so there is no need to persist it elsewhere.

---

## Infrastructure

- Must run **locally** and deploy to **Railway**.
- Keep it simple: a single Node service serving the static frontend + a small API.

---

## AI Tools

- **LLM:** Claude — default **Sonnet 4.6** (`claude-sonnet-4-6`) for reliable,
  professional output at a good cost/quality balance.
- **Fallback / cheaper path:** Haiku 4.5 (`claude-haiku-4-5-20251001`) for simpler
  templates if cost optimization is needed.
- Accessed via the Anthropic API. API key supplied through an environment variable
  (never committed).
- Dev assistance: Claude Code.
