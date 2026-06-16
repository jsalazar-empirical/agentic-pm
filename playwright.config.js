import { defineConfig, devices } from "@playwright/test";

// The E2E suite drives the real Node server (booted by `webServer` below) in headless
// Chromium. Generation is mocked inside the specs (page.route) so CI needs no API key.
const PORT = process.env.PORT || "3000";
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // The copy flow uses navigator.clipboard; grant it so the assertion is real.
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Boot the app and wait until it is actually listening (closes the startup-race risk).
  webServer: {
    command: "npm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: { PORT: String(PORT) },
  },
});
