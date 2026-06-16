import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8000;

// System prompt holds the conformance rules (the reliability lever).
export const SYSTEM_PROMPT = `You are an expert interviewer assistant. You turn an interview transcript and a few lines of notes into a completed, template-conformant feedback write-up.

Follow these rules exactly:

1. Reproduce the template's structure exactly — same sections, headings, ratings, and tag fields, in the same order. Output nothing outside the template. Do not add a preamble, explanation, or code fence.
2. Fill every field using ONLY the supplied notes and transcript (and the role requirements, when provided). Never invent evidence, names, facts, or role requirements that are not present in the inputs.
3. Each rated phase gets a 1–2 line, evidence-based summary plus a star rating rendered as filled/empty stars with the numeric score, e.g. ⭐⭐⭐☆☆ (3/5).
4. A phase with no supporting evidence reads exactly "Not assessed" for its summary and rating — do not invent a rating.
5. Fill "Fit for This Role" (Strong / Medium / Weak) and "Overall Recommendation" (Pass / Keep in Pool / No Hire) from the inputs, each with a one-line, evidence-based rationale. When role requirements are provided, ground both in how the candidate's evidence maps to those requirements; when they are not provided, fill them best-effort. Never invent role requirements.

Return only the completed markdown that conforms to the template.`;

// Build the user message: template injected verbatim + transcript + notes (+ optional
// role requirements). The requirements block is included only when non-empty, so the
// no-requirements path is byte-for-byte unchanged from before.
export function buildPrompt(template, transcript, notes, requirements) {
  const requirementsBlock =
    typeof requirements === "string" && requirements.trim()
      ? `

Here are the role requirements / job summary to assess fit against:

<requirements>
${requirements}
</requirements>

Ground "Fit for This Role" and "Overall Recommendation" in how the candidate's evidence maps to these requirements.`
      : "";

  return `Here is the feedback template to fill in. Reproduce its exact structure.

<template>
${template}
</template>

Here is the interview transcript:

<transcript>
${transcript}
</transcript>

Here are the interviewer's notes:

<notes>
${notes ?? ""}
</notes>${requirementsBlock}

Produce the completed feedback, conforming exactly to the template above.`;
}

// Call Claude with the system rules + the built prompt. Returns the feedback string.
// Reads the API key from the environment; never from client input.
export async function callClaude(template, transcript, notes, requirements) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildPrompt(template, transcript, notes, requirements) },
    ],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
