import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = join(__dirname, "..", "src", "server.js");

let child;
let baseUrl;

// Start the real server on an ephemeral port in a child process.
// We only exercise routes that never reach the Anthropic API:
//   - GET /api/templates
//   - POST /api/generate validation failures (400s)
// so no API key or network access is needed.
before(async () => {
  const port = 4000 + Math.floor(Math.random() * 1000);
  baseUrl = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, [SERVER_PATH], {
    env: { ...process.env, PORT: String(port), ANTHROPIC_API_KEY: "test-not-used" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Wait for the "listening" log line.
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server did not start")), 8000);
    child.stdout.on("data", (buf) => {
      if (buf.toString().includes("listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on("error", reject);
  });
});

after(() => {
  if (child) child.kill();
});

test("GET /api/templates returns the template list", async () => {
  const res = await fetch(`${baseUrl}/api/templates`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.templates));
  assert.ok(body.templates.some((t) => t.id === "default-interview"));
});

test("GET / serves the frontend HTML", async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/html/);
  const html = await res.text();
  assert.match(html, /EasyFeedback/);
});

test("POST /api/generate rejects a missing templateId with 400", async () => {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript: "hello" }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /templateId/);
});

test("POST /api/generate rejects an empty transcript with 400", async () => {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId: "default-interview", transcript: "   " }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /transcript/);
});

test("POST /api/generate rejects an unknown template with 400", async () => {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId: "nope", transcript: "real transcript" }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /Unknown template/);
});

test("POST /api/generate rejects invalid JSON with 400", async () => {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /Invalid JSON/);
});
