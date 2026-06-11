import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPrompt, SYSTEM_PROMPT } from "../src/generate.js";

test("buildPrompt injects the template verbatim inside a delimited block", () => {
  const template = "## Section\n- **Rating:** ⭐⭐⭐☆☆ (3/5)";
  const prompt = buildPrompt(template, "some transcript", "some notes");

  assert.match(prompt, /<template>\n## Section\n- \*\*Rating:\*\* ⭐⭐⭐☆☆ \(3\/5\)\n<\/template>/);
});

test("buildPrompt includes the transcript and notes in their own blocks", () => {
  const prompt = buildPrompt("T", "TRANSCRIPT-TEXT", "NOTES-TEXT");
  assert.match(prompt, /<transcript>\nTRANSCRIPT-TEXT\n<\/transcript>/);
  assert.match(prompt, /<notes>\nNOTES-TEXT\n<\/notes>/);
});

test("buildPrompt tolerates missing notes", () => {
  const prompt = buildPrompt("T", "TRANSCRIPT", undefined);
  assert.match(prompt, /<notes>\n\n<\/notes>/);
});

test("SYSTEM_PROMPT encodes the core conformance rules", () => {
  // Evidence-only, exact structure, Not assessed, no invented ratings.
  assert.match(SYSTEM_PROMPT, /only the supplied notes and transcript/i);
  assert.match(SYSTEM_PROMPT, /Not assessed/);
  assert.match(SYSTEM_PROMPT, /structure exactly/i);
  assert.match(SYSTEM_PROMPT, /⭐⭐⭐☆☆ \(3\/5\)/);
});
