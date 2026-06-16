import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// templates.js resolves TEMPLATES_DIR lazily (per call), so a static import is fine —
// the env var set in before() is read when each function runs.
import {
  slugify,
  loadTemplates,
  createTemplate,
  readTemplate,
  updateTemplate,
  deleteTemplate,
  DEFAULT_TEMPLATE_ID,
  TemplateError,
} from "../src/templates.js";

let dir;

before(async () => {
  dir = await mkdtemp(join(tmpdir(), "tpl-crud-"));
  process.env.TEMPLATES_DIR = dir;
});

after(async () => {
  await rm(dir, { recursive: true, force: true });
  delete process.env.TEMPLATES_DIR;
});

// Reset the sandbox to just the (seeded) default before each test.
beforeEach(async () => {
  for (const f of await readdir(dir)) await rm(join(dir, f));
  await writeFile(join(dir, `${DEFAULT_TEMPLATE_ID}.md`), "## Default\n- seed\n", "utf8");
});

async function rejectsWithStatus(promise, status) {
  await assert.rejects(promise, (err) => err instanceof TemplateError && err.status === status);
}

test("slugify produces safe ids", () => {
  assert.equal(slugify("Backend Engineer Interview"), "backend-engineer-interview");
  assert.equal(slugify("  Spaces & symbols!! "), "spaces-symbols");
  assert.equal(slugify("Already-Slug"), "already-slug");
  assert.equal(slugify("!!!"), "");
});

test("create then list and read round-trips", async () => {
  const created = await createTemplate({ name: "Backend Engineer", body: "## Body\n- x\n" });
  assert.deepEqual(created, { id: "backend-engineer", name: "Backend Engineer" });

  const list = await loadTemplates();
  assert.ok(list.some((t) => t.id === "backend-engineer"));

  const read = await readTemplate("backend-engineer");
  assert.equal(read.body, "## Body\n- x\n");
  assert.equal(read.name, "Backend Engineer");
});

test("create rejects duplicate (409), empty name/body (400), nameless slug (400)", async () => {
  await createTemplate({ name: "Dup", body: "## a\n" });
  await rejectsWithStatus(createTemplate({ name: "Dup", body: "## b\n" }), 409);
  await rejectsWithStatus(createTemplate({ name: "", body: "## b\n" }), 400);
  await rejectsWithStatus(createTemplate({ name: "Ok", body: "   " }), 400);
  await rejectsWithStatus(createTemplate({ name: "!!!", body: "## b\n" }), 400);
});

test("read unknown is 404; bad id is 400", async () => {
  await rejectsWithStatus(readTemplate("nope"), 404);
  await rejectsWithStatus(readTemplate("../package"), 400);
});

test("update body in place keeps the id", async () => {
  await createTemplate({ name: "Keep", body: "## one\n" });
  const updated = await updateTemplate("keep", { name: "Keep", body: "## two\n" });
  assert.equal(updated.id, "keep");
  assert.equal((await readTemplate("keep")).body, "## two\n");
});

test("update with a new name renames the file", async () => {
  await createTemplate({ name: "Old Name", body: "## body\n" });
  const updated = await updateTemplate("old-name", { name: "New Name", body: "## body2\n" });
  assert.equal(updated.id, "new-name");
  await rejectsWithStatus(readTemplate("old-name"), 404);
  assert.equal((await readTemplate("new-name")).body, "## body2\n");
});

test("update rename collision is 409; unknown is 404; empty body is 400", async () => {
  await createTemplate({ name: "Alpha", body: "## a\n" });
  await createTemplate({ name: "Beta", body: "## b\n" });
  await rejectsWithStatus(updateTemplate("alpha", { name: "Beta", body: "## a2\n" }), 409);
  await rejectsWithStatus(updateTemplate("ghost", { name: "Ghost", body: "## g\n" }), 404);
  await rejectsWithStatus(updateTemplate("alpha", { name: "Alpha", body: "  " }), 400);
});

test("default template can be edited but not renamed", async () => {
  const edited = await updateTemplate(DEFAULT_TEMPLATE_ID, {
    name: "Default Interview",
    body: "## edited default\n",
  });
  assert.equal(edited.id, DEFAULT_TEMPLATE_ID);
  await rejectsWithStatus(
    updateTemplate(DEFAULT_TEMPLATE_ID, { name: "Renamed", body: "## x\n" }),
    403,
  );
});

test("delete removes a template; default is protected; unknown is 404", async () => {
  await createTemplate({ name: "Trash", body: "## t\n" });
  assert.deepEqual(await deleteTemplate("trash"), { ok: true });
  await rejectsWithStatus(readTemplate("trash"), 404);

  await rejectsWithStatus(deleteTemplate(DEFAULT_TEMPLATE_ID), 403);
  await rejectsWithStatus(deleteTemplate("never-existed"), 404);
  await rejectsWithStatus(deleteTemplate("../package"), 400);
});
