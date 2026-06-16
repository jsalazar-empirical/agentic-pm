import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = join(__dirname, "..", "src", "server.js");

let child;
let baseUrl;
let dir;

// Start the real server against a sandbox TEMPLATES_DIR so the CRUD routes never touch
// the repo's templates. No Anthropic key needed — these routes don't reach the API.
before(async () => {
  dir = await mkdtemp(join(tmpdir(), "tpl-routes-"));
  await writeFile(join(dir, "default-interview.md"), "## Default\n- seed\n", "utf8");

  const port = 4100 + Math.floor(Math.random() * 800);
  baseUrl = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, [SERVER_PATH], {
    env: { ...process.env, PORT: String(port), TEMPLATES_DIR: dir },
    stdio: ["ignore", "pipe", "pipe"],
  });

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

after(async () => {
  if (child) child.kill();
  await rm(dir, { recursive: true, force: true });
});

const json = (method, path, body) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

test("POST creates a template (201) and it appears in the list", async () => {
  const res = await json("POST", "/api/templates", { name: "QA Engineer", body: "## QA\n- x\n" });
  assert.equal(res.status, 201);
  // name is derived from the id via humanize(), so "QA Engineer" → id "qa-engineer" → "Qa Engineer".
  assert.deepEqual(await res.json(), { id: "qa-engineer", name: "Qa Engineer" });

  const list = await (await fetch(`${baseUrl}/api/templates`)).json();
  assert.ok(list.templates.some((t) => t.id === "qa-engineer"));
});

test("GET /api/templates/:id returns id, name, body", async () => {
  const res = await fetch(`${baseUrl}/api/templates/qa-engineer`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.id, "qa-engineer");
  assert.match(body.body, /## QA/);
});

test("PUT updates the body (200)", async () => {
  const res = await json("PUT", "/api/templates/qa-engineer", {
    name: "QA Engineer",
    body: "## QA v2\n- y\n",
  });
  assert.equal(res.status, 200);
  const read = await (await fetch(`${baseUrl}/api/templates/qa-engineer`)).json();
  assert.match(read.body, /## QA v2/);
});

test("POST duplicate is 409; empty body is 400", async () => {
  assert.equal((await json("POST", "/api/templates", { name: "QA Engineer", body: "## dup\n" })).status, 409);
  assert.equal((await json("POST", "/api/templates", { name: "Bad", body: "  " })).status, 400);
});

test("DELETE removes a template (200); default is protected (403)", async () => {
  assert.equal((await json("DELETE", "/api/templates/qa-engineer")).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/templates/qa-engineer`)).status, 404);

  const protectedRes = await json("DELETE", "/api/templates/default-interview");
  assert.equal(protectedRes.status, 403);
  assert.match((await protectedRes.json()).error, /default/i);
});

test("unknown template id is 404 on read and delete", async () => {
  assert.equal((await fetch(`${baseUrl}/api/templates/ghost`)).status, 404);
  assert.equal((await json("DELETE", "/api/templates/ghost")).status, 404);
});
