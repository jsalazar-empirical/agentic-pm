import { test, expect } from "@playwright/test";

// Generation is non-deterministic, so the committed E2E mocks /api/generate and asserts
// the plumbing: the optional role-requirements field is sent, and the recommendation
// section renders. The real-model grounding quality is a Tester/nightly check (out of CI).

const RECO_FEEDBACK = [
  "## 🧩 Candidate Summary & Recommendation",
  "### 🎯 Fit for This Role",
  "- **Strong** — matches the stated backend + AWS requirements.",
  "### ⭐ Overall Recommendation",
  "- **Pass** — evidence maps cleanly to the role requirements.",
].join("\n");

test("role requirements are sent and the recommendation section renders", async ({ page }) => {
  let sentBody = null;
  await page.route("**/api/generate", async (route) => {
    sentBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ feedback: RECO_FEEDBACK }),
    });
  });

  await page.goto("/");
  await page.fill("#transcript", "Interviewer: Tell me about scaling a service.\nCandidate: …");
  await page.fill("#notes", "Solid systems thinking.");
  await page.fill("#requirements", "Senior Backend Engineer: Node, AWS, distributed systems.");
  await page.click("#generate");

  await expect(page.locator("#result")).toBeVisible();
  // The request carried the requirements field…
  expect(sentBody).toBeTruthy();
  expect(sentBody.requirements).toContain("Senior Backend Engineer");
  // …and the recommendation/fit render in the output.
  const output = page.locator("#output");
  await expect(output).toContainText("Overall Recommendation");
  await expect(output).toContainText("Pass");
  await expect(output).toContainText("Fit for This Role");
});

test("generation still works with no role requirements (fallback, no regression)", async ({ page }) => {
  let sentBody = null;
  await page.route("**/api/generate", async (route) => {
    sentBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ feedback: RECO_FEEDBACK }),
    });
  });

  await page.goto("/");
  await page.fill("#transcript", "Interviewer: …\nCandidate: …");
  await page.click("#generate");

  await expect(page.locator("#result")).toBeVisible();
  // requirements is sent as an empty string and generation succeeds.
  expect(sentBody.requirements).toBe("");
});
