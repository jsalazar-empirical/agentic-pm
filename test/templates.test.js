import { test } from "node:test";
import assert from "node:assert/strict";

import { loadTemplates, loadTemplate } from "../src/templates.js";

test("loadTemplates lists the default template with a humanized name", async () => {
  const templates = await loadTemplates();
  const ids = templates.map((t) => t.id);
  assert.ok(ids.includes("default-interview"), "default-interview should be listed");

  const def = templates.find((t) => t.id === "default-interview");
  assert.equal(def.name, "Default Interview");
});

test("loadTemplates returns only { id, name } objects", async () => {
  const templates = await loadTemplates();
  assert.ok(templates.length >= 1);
  for (const t of templates) {
    assert.equal(typeof t.id, "string");
    assert.equal(typeof t.name, "string");
    assert.deepEqual(Object.keys(t).sort(), ["id", "name"]);
  }
});

test("loadTemplate reads the default template verbatim", async () => {
  const text = await loadTemplate("default-interview");
  assert.equal(typeof text, "string");
  // Spot-check that key section headings from the spec are present, unparsed.
  assert.match(text, /## 🧑‍💼 Candidate Information/);
  assert.match(text, /## 🧩 Phase Snapshots/);
  assert.match(text, /## 🧩 Candidate Summary & Recommendation/);
  assert.match(text, /### 🏷 Stack Tags/);
  assert.match(text, /### 🏢 Domain Tags/);
  // The worked star example must survive verbatim.
  assert.match(text, /⭐⭐⭐☆☆ \(3\/5\)/);
});

test("loadTemplate returns null for an unknown template", async () => {
  assert.equal(await loadTemplate("does-not-exist"), null);
});

test("loadTemplate rejects path-traversal ids", async () => {
  assert.equal(await loadTemplate("../package"), null);
  assert.equal(await loadTemplate("../../etc/passwd"), null);
  assert.equal(await loadTemplate("foo/bar"), null);
});

test("loadTemplate rejects non-string ids", async () => {
  assert.equal(await loadTemplate(undefined), null);
  assert.equal(await loadTemplate(null), null);
  assert.equal(await loadTemplate(42), null);
});
