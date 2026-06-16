import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";

import {
  loadTemplates,
  loadTemplate,
  readTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  TemplateError,
} from "./templates.js";
import { callClaude } from "./generate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      // Guard against unbounded bodies (~5MB cap).
      if (size > 5 * 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleGenerate(req, res) {
  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON request body." });
  }

  const { templateId, transcript, notes, requirements } = body ?? {};

  if (!templateId || typeof templateId !== "string") {
    return sendJson(res, 400, { error: "Missing or invalid 'templateId'." });
  }
  if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
    return sendJson(res, 400, { error: "Missing or empty 'transcript'." });
  }

  const template = await loadTemplate(templateId);
  if (template === null) {
    return sendJson(res, 400, { error: `Unknown template: '${templateId}'.` });
  }

  try {
    // `requirements` is optional — when absent, generation behaves exactly as before.
    const feedback = await callClaude(template, transcript, notes, requirements);
    return sendJson(res, 200, { feedback });
  } catch (err) {
    const message = err?.message || "Feedback generation failed.";
    return sendJson(res, 502, { error: `Anthropic request failed: ${message}` });
  }
}

function sendTemplateError(res, err) {
  if (err instanceof TemplateError) {
    return sendJson(res, err.status, { error: err.message });
  }
  return sendJson(res, 500, { error: "Template operation failed." });
}

async function readJsonBody(req, res) {
  // Returns the parsed body, or null after having already sent a 400.
  try {
    return JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: "Invalid JSON request body." });
    return null;
  }
}

async function handleCreateTemplate(req, res) {
  const body = await readJsonBody(req, res);
  if (body === null) return;
  try {
    return sendJson(res, 201, await createTemplate({ name: body?.name, body: body?.body }));
  } catch (err) {
    return sendTemplateError(res, err);
  }
}

async function handleReadTemplate(res, id) {
  try {
    return sendJson(res, 200, await readTemplate(id));
  } catch (err) {
    return sendTemplateError(res, err);
  }
}

async function handleUpdateTemplate(req, res, id) {
  const body = await readJsonBody(req, res);
  if (body === null) return;
  try {
    return sendJson(res, 200, await updateTemplate(id, { name: body?.name, body: body?.body }));
  } catch (err) {
    return sendTemplateError(res, err);
  }
}

async function handleDeleteTemplate(res, id) {
  try {
    return sendJson(res, 200, await deleteTemplate(id));
  } catch (err) {
    return sendTemplateError(res, err);
  }
}

async function serveStatic(req, res) {
  // Map "/" to index.html; resolve the path safely inside PUBLIC_DIR.
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const relPath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const filePath = normalize(join(PUBLIC_DIR, relPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const file = await readFile(filePath);
    const ext = filePath.slice(filePath.lastIndexOf("."));
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const TEMPLATE_ITEM_RE = /^\/api\/templates\/([^/]+)$/;

function methodNotAllowed(res) {
  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");

  // Templates collection: list + create.
  if (pathname === "/api/templates") {
    if (req.method === "GET") {
      try {
        const templates = await loadTemplates();
        return sendJson(res, 200, { templates });
      } catch {
        return sendJson(res, 500, { error: "Could not load templates." });
      }
    }
    if (req.method === "POST") return handleCreateTemplate(req, res);
    return methodNotAllowed(res);
  }

  // Single template: read + update + delete.
  const itemMatch = pathname.match(TEMPLATE_ITEM_RE);
  if (itemMatch) {
    const id = decodeURIComponent(itemMatch[1]);
    if (req.method === "GET") return handleReadTemplate(res, id);
    if (req.method === "PUT") return handleUpdateTemplate(req, res, id);
    if (req.method === "DELETE") return handleDeleteTemplate(res, id);
    return methodNotAllowed(res);
  }

  if (req.method === "POST" && pathname === "/api/generate") {
    return handleGenerate(req, res);
  }

  if (req.method === "GET") {
    return serveStatic(req, res);
  }

  methodNotAllowed(res);
});

server.listen(PORT, HOST, () => {
  console.log(`EasyFeedback listening on http://${HOST}:${PORT}`);
});
