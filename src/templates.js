import { readFile, readdir, writeFile, unlink, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Where templates live. Configurable so production can mount a persistent volume here
// (Railway's FS is ephemeral) and tests can point at a sandbox dir. Defaults to the
// repo's templates/ — unchanged behavior when the env var is unset. Resolved lazily
// (per call) so the env var can be set before use, including in tests.
const DEFAULT_DIR = join(__dirname, "..", "templates");
function templatesDir() {
  return process.env.TEMPLATES_DIR || DEFAULT_DIR;
}

// The built-in default; protected from deletion/rename so the app always has a template.
export const DEFAULT_TEMPLATE_ID = "default-interview";

// Template ids are slugs — this is also the path-safety guard (no "/", no "..").
const ID_RE = /^[a-z0-9-]+$/;

// Typed error so the HTTP layer can map a failure to the right status code.
export class TemplateError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "TemplateError";
    this.status = status;
  }
}

// Turn a filename id like "default-interview" into "Default Interview".
function humanize(id) {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Derive a safe slug id from a human name: lowercase, non-alphanumerics → "-", trimmed.
export function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fileFor(id) {
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new TemplateError(400, "Invalid template id.");
  }
  return join(templatesDir(), `${id}.md`);
}

async function exists(id) {
  try {
    await access(fileFor(id));
    return true;
  } catch {
    return false;
  }
}

// List the .md files in TEMPLATES_DIR as { id, name }.
export async function loadTemplates() {
  const entries = await readdir(templatesDir());
  return entries
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const id = file.slice(0, -".md".length);
      return { id, name: humanize(id) };
    });
}

// Read one template's raw file text verbatim (no parsing).
// Returns null if the id is unknown or invalid. Used by the generate path.
export async function loadTemplate(id) {
  if (typeof id !== "string" || !ID_RE.test(id)) {
    return null;
  }
  try {
    return await readFile(join(templatesDir(), `${id}.md`), "utf8");
  } catch {
    return null;
  }
}

// Read one template as { id, name, body } for the editor. Throws TemplateError on miss.
export async function readTemplate(id) {
  const file = fileFor(id);
  try {
    const body = await readFile(file, "utf8");
    return { id, name: humanize(id), body };
  } catch {
    throw new TemplateError(404, `Unknown template: '${id}'.`);
  }
}

function requireBody(body) {
  if (typeof body !== "string" || !body.trim()) {
    throw new TemplateError(400, "Template body is required.");
  }
}

function idFromName(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw new TemplateError(400, "Template name is required.");
  }
  const id = slugify(name);
  if (!id || !ID_RE.test(id)) {
    throw new TemplateError(400, "Template name must contain letters or numbers.");
  }
  return id;
}

// Create a new template from { name, body }. 409 if the derived id already exists.
export async function createTemplate({ name, body } = {}) {
  const id = idFromName(name);
  requireBody(body);
  if (await exists(id)) {
    throw new TemplateError(409, `A template named '${humanize(id)}' already exists.`);
  }
  await writeFile(fileFor(id), body, "utf8");
  return { id, name: humanize(id) };
}

// Update a template's body, and optionally rename it (a new name → new slug → file rename).
// The default template may be edited but not renamed.
export async function updateTemplate(id, { name, body } = {}) {
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new TemplateError(400, "Invalid template id.");
  }
  if (!(await exists(id))) {
    throw new TemplateError(404, `Unknown template: '${id}'.`);
  }
  requireBody(body);

  let targetId = id;
  const wantsRename =
    name !== undefined && name !== null && String(name).trim().length > 0 && slugify(name) !== id;
  if (wantsRename) {
    if (id === DEFAULT_TEMPLATE_ID) {
      throw new TemplateError(403, "The default template can be edited but not renamed.");
    }
    targetId = idFromName(name);
    if (await exists(targetId)) {
      throw new TemplateError(409, `A template named '${humanize(targetId)}' already exists.`);
    }
  }

  await writeFile(fileFor(targetId), body, "utf8");
  if (targetId !== id) {
    await unlink(fileFor(id)).catch(() => {});
  }
  return { id: targetId, name: humanize(targetId) };
}

// Delete a template. The default template is protected (403).
export async function deleteTemplate(id) {
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new TemplateError(400, "Invalid template id.");
  }
  if (id === DEFAULT_TEMPLATE_ID) {
    throw new TemplateError(403, "The default template cannot be deleted.");
  }
  if (!(await exists(id))) {
    throw new TemplateError(404, `Unknown template: '${id}'.`);
  }
  await unlink(fileFor(id));
  return { ok: true };
}
