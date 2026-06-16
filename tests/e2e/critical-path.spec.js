import { test, expect } from "@playwright/test";

// A deterministic, template-shaped generation result. The committed E2E must NOT call the
// real (non-deterministic) LLM — we mock /api/generate at the network layer and assert
// structure/behavior, never exact generated prose. The live real-model check lives in the
// Tester/MCP step or a nightly job, out of the PR-blocking path.
const MOCK_FEEDBACK = [
  "## 🧑‍💼 Candidate Information",
  "- **Name:** Jordan Rivera",
  "- **Role:** Senior Backend Engineer",
  "",
  "## 🧩 Phase Snapshots",
  "### 🧠 Technical Discussion",
  "- **Summary (1–2 lines):** Clear reasoning about tradeoffs and failure modes.",
  "- **Rating:** ⭐⭐⭐⭐☆ (4/5)",
  "",
  "## 🧩 Candidate Summary & Recommendation",
  "### ⭐ Overall Recommendation",
  "- **Pass** — strong, evidence-backed signal across phases.",
].join("\n");

test.describe("EasyFeedback critical path", () => {
  test("template select → generate (mocked) → result renders → copy", async ({ page }) => {
    // Cut the non-deterministic generation call at the network layer with a template-shaped body.
    await page.route("**/api/generate", async (route) => {
      expect(route.request().method()).toBe("POST");
      const body = route.request().postDataJSON();
      expect(body.transcript?.length).toBeGreaterThan(0);
      expect(typeof body.templateId).toBe("string");
      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({ feedback: MOCK_FEEDBACK }),
      });
    });

    await page.goto("/");

    // App loads with a default template pre-selected (populated from the real /api/templates).
    const templateSelect = page.locator("#template");
    await expect(templateSelect.locator("option")).not.toHaveCount(0);
    await expect(templateSelect).not.toHaveValue("");

    // Enter transcript + notes.
    await page.fill("#transcript", "Interviewer: Walk me through a hard bug.\nCandidate: I traced a race condition…");
    await page.fill("#notes", "Strong debugging instincts; communicates clearly.");

    // Result is hidden before generation.
    await expect(page.locator("#result")).toBeHidden();

    // Generate → result transition.
    await page.click("#generate");
    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#status")).toHaveText("Done.");

    // The template's section headings render (assert structure, not exact prose).
    const output = page.locator("#output");
    await expect(output).toContainText("Candidate Information");
    await expect(output).toContainText("Phase Snapshots");
    await expect(output).toContainText("Candidate Summary & Recommendation");

    // One-click copy: the button reflects the copied affordance…
    await page.click("#copy");
    await expect(page.locator("#copy")).toHaveText("Copied!");
    // …and the clipboard actually holds the generated feedback.
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain("Candidate Information");
  });

  test("key elements carry the intended styling (computed CSS)", async ({ page }) => {
    await page.goto("/");

    // Primary button: accent fill (#6c8cff → rgb(108, 140, 255)), bold, pointer cursor.
    const btn = page.locator("#generate");
    await expect(btn).toHaveCSS("background-color", "rgb(108, 140, 255)");
    await expect(btn).toHaveCSS("cursor", "pointer");
    await expect(btn).toHaveCSS("font-weight", "600");

    // Card surface: rounded radius + dark surface (#181b22 → rgb(24, 27, 34)).
    const card = page.locator("section.card").first();
    await expect(card).toHaveCSS("border-radius", "12px");
    await expect(card).toHaveCSS("background-color", "rgb(24, 27, 34)");
  });
});
