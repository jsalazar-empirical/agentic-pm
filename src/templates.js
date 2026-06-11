import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");

// Turn a filename id like "default-interview" into "Default Interview".
function humanize(id) {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// List the .md files in templates/ as { id, name }.
// id is the filename without ".md"; name is a humanized form.
export async function loadTemplates() {
  const entries = await readdir(TEMPLATES_DIR);
  return entries
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const id = file.slice(0, -".md".length);
      return { id, name: humanize(id) };
    });
}

// Read one template's raw file text verbatim (no parsing).
// Returns null if the id is unknown or invalid.
export async function loadTemplate(id) {
  // Reject anything that isn't a plain template id (no path traversal).
  if (typeof id !== "string" || !/^[a-z0-9-]+$/i.test(id)) {
    return null;
  }
  try {
    return await readFile(join(TEMPLATES_DIR, `${id}.md`), "utf8");
  } catch {
    return null;
  }
}
