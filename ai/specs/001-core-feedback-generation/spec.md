Linear: EMP-68 — https://linear.app/empirical/issue/EMP-68/core-feedback-generation-transcript-notes-template-conformant-feedback

# Spec: Core Feedback Generation

## Goal

An interviewer turns their rough notes plus the interview transcript into a completed,
template-conformant feedback write-up they can copy into Ashby — in under a minute.

---

## User Value

Interviewers defer manual feedback because it's slow, then forget key details and
struggle to reconstruct them. Generating template-conformant feedback immediately after
the interview makes the write-up effortless, fast, and reliable — capturing detail while
it's fresh.

---

## Requirements

- Select a feedback template from file-based templates. The provided interview feedback
  template (see Notes) is available as the default.
- Provide inputs: the interview transcript (pasted) and a few lines of notes.
- Generate feedback using Claude (Sonnet 4.6, `claude-sonnet-4-6`).
- Output conforms exactly to the selected template's structure — same sections, ratings,
  and tag fields, nothing extra.
- Each rated phase gets a 1–2 line, evidence-based summary plus a star rating, grounded
  in the supplied notes/transcript.
- Display the result with a one-click copy that pastes cleanly into Ashby.
- Runs locally and deploys to Railway; the Anthropic API key is read from an environment
  variable and never committed.

---

## Acceptance Criteria

- [ ] Interviewer can select a template from the available file-based templates; the
      provided interview feedback template is available as the default.
- [ ] Interviewer can paste an interview transcript and enter a few lines of notes.
- [ ] On Generate, the system calls Claude (Sonnet 4.6) and returns feedback that matches
      the selected template's exact section structure (Candidate Information, Phase
      Snapshots, Candidate Summary & Recommendation, Stack/Domain tags), where each rated
      phase has a 1–2 line evidence-based summary and a star rating (n/5) grounded in the
      notes/transcript — phases without evidence read "Not assessed," never invented.
- [ ] Generated feedback is displayed and copyable with one action, in a form that pastes
      cleanly into Ashby.
- [ ] The app runs locally and deploys to Railway; the Anthropic API key is read from an
      environment variable and is never committed.
- [ ] For a typical transcript, the interviewer gets from "paste" to "copied feedback" in
      under ~1 minute.

---

## Dependencies

- None (this is the first spec).
- External: Anthropic API access and an API key (env var).

---

## Risks

- **LLM output reliability** — the model may drift from the template structure or
  hallucinate evidence not present in the notes/transcript. Mitigation: inject the
  template verbatim, use a strict system prompt ("only use supplied evidence; match the
  template exactly"), and consider light post-generation structure validation.
- **LLM cost per generation** — currently unknown; needs measuring (see open question in
  `current_milestone.md`).
- **Transcript quality/length** — long or messy transcripts may degrade quality or
  approach context limits; may need truncation/handling guidance.

---

## Notes

### Out of scope for this round
- Creating / editing / uploading new templates (selection from existing files only).
- The **role-requirements-driven recommendation advice** feature (supply role
  requirements → sharper pass / keep-in-pool / no-hire advice). The template's *Fit* and
  *Overall Recommendation* fields are filled best-effort from the notes/transcript here;
  the dedicated advice capability is a future ticket.
- Persisting generated feedback (it's pasted into Ashby).
- Authentication / multi-user accounts.

### Reference template (cleaned — the default feedback template)

```markdown
## 🧑‍💼 Candidate Information

- **Name:**
- **Role:**
- **Seniority:**
- **Date:**
- **Interviewer:**

## 🧩 Phase Snapshots

> Keep these short, evidence-based, and grounded in the interviewer's real-time notes.
> Only include a phase if there is evidence for it. Star rating reflects the n/5 score.

### 🧠 Technical Discussion
- **Summary (1–2 lines):**
- **Rating:** ⭐⭐⭐☆☆ (3/5)

### 💻 Live Coding
- **Summary (1–2 lines):**
- **Rating:** ⭐⭐⭐⭐☆ (4/5)

### 🏗️ System Design
- **Summary (1–2 lines):**
- **Rating:** ⭐⭐⭐☆☆ (3/5)

### 🗣 Communication & Professionalism
- **Summary (1–2 lines):**
- **Rating:** ⭐⭐⭐⭐☆ (4/5)

## 🧩 Candidate Summary & Recommendation

> Distill key strengths, gaps, and overall fit to guide a confident, evidence-based decision.

### ⭐ Strengths
- 

### ⚠️ Areas to Improve
- 

### 🚩 Red Flags (if any)
- None

### 🎯 Fit for This Role
- **Strong / Medium / Weak** — explain in one sentence.

### ⭐ Overall Recommendation
- **Pass / Keep in Pool / No Hire** — explain in one sentence.

### 🏷 Stack Tags
- e.g. JavaScript, TypeScript, Node, React, Python, AWS Lambda, DynamoDB

### 🏢 Domain Tags
- e.g. Fintech, Retail, Banking, GovTech

### ✨ Additional Notes (optional)
- Anything extra worth remembering for calibration sessions.
```

> Generation rule: the model fills every field from the supplied notes + transcript only.
> Phases without evidence get an explicit "Not assessed" rather than an invented rating.
