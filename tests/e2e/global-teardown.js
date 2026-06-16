import { rm } from "node:fs/promises";
import path from "node:path";

const sandbox = path.join(process.cwd(), "tests", "e2e", ".tmp-templates");

export default async function globalTeardown() {
  await rm(sandbox, { recursive: true, force: true });
}
