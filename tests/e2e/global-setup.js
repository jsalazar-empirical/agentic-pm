import { mkdir, rm, copyFile } from "node:fs/promises";
import path from "node:path";

// Seed a sandbox templates dir (matching playwright.config's TEMPLATES_SANDBOX) with a
// fresh copy of the real default template, so CRUD specs run against disposable files.
const sandbox = path.join(process.cwd(), "tests", "e2e", ".tmp-templates");
const repoDefault = path.join(process.cwd(), "templates", "default-interview.md");

export default async function globalSetup() {
  await rm(sandbox, { recursive: true, force: true });
  await mkdir(sandbox, { recursive: true });
  await copyFile(repoDefault, path.join(sandbox, "default-interview.md"));
}
