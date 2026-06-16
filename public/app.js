const templateSelect = document.getElementById("template");
const transcriptInput = document.getElementById("transcript");
const notesInput = document.getElementById("notes");
const generateBtn = document.getElementById("generate");
const statusEl = document.getElementById("status");
const resultSection = document.getElementById("result");
const outputEl = document.getElementById("output");
const copyBtn = document.getElementById("copy");

// Manage-templates elements.
const tplListEl = document.getElementById("tpl-list");
const tplNewBtn = document.getElementById("tpl-new");
const tplEditor = document.getElementById("tpl-editor");
const tplNameInput = document.getElementById("tpl-name");
const tplBodyInput = document.getElementById("tpl-body");
const tplFileInput = document.getElementById("tpl-file");
const tplSaveBtn = document.getElementById("tpl-save");
const tplCancelBtn = document.getElementById("tpl-cancel");
const tplStatusEl = document.getElementById("tpl-status");
const tplEditorTitle = document.getElementById("tpl-editor-title");

const DEFAULT_TEMPLATE_ID = "default-interview";

// Editor state: { mode: "create" | "edit", id?: string }.
let editorState = null;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("status--error", isError);
}

function setTplStatus(message, isError = false) {
  tplStatusEl.textContent = message;
  tplStatusEl.classList.toggle("status--error", isError);
}

// Fetch the template list, repopulate the selector and the manage list.
// Optionally select `preferId` (e.g. a just-created/renamed template).
async function refreshTemplates(preferId) {
  const res = await fetch("/api/templates");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { templates } = await res.json();

  const previous = preferId ?? templateSelect.value;
  templateSelect.innerHTML = "";
  for (const t of templates) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    templateSelect.appendChild(opt);
  }
  // Restore selection if still present, else fall back to the first option.
  if (templates.some((t) => t.id === previous)) {
    templateSelect.value = previous;
  }

  renderTemplateList(templates);
}

function renderTemplateList(templates) {
  tplListEl.innerHTML = "";
  for (const t of templates) {
    const li = document.createElement("li");
    li.className = "tpl-item";
    li.dataset.id = t.id;

    const name = document.createElement("span");
    name.className = "tpl-item__name";
    name.textContent = t.name;
    li.appendChild(name);

    const isDefault = t.id === DEFAULT_TEMPLATE_ID;
    if (isDefault) {
      const badge = document.createElement("span");
      badge.className = "tpl-badge";
      badge.textContent = "default";
      li.appendChild(badge);
    }

    const actions = document.createElement("span");
    actions.className = "tpl-item__actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn--ghost tpl-edit";
    editBtn.textContent = "Edit";
    editBtn.dataset.id = t.id;
    actions.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn--ghost tpl-delete";
    delBtn.textContent = "Delete";
    delBtn.dataset.id = t.id;
    if (isDefault) {
      delBtn.disabled = true;
      delBtn.title = "The default template cannot be deleted.";
    }
    actions.appendChild(delBtn);

    li.appendChild(actions);
    tplListEl.appendChild(li);
  }
}

function openEditor(mode, { id = "", name = "", body = "" } = {}) {
  editorState = { mode, id };
  tplEditorTitle.textContent = mode === "create" ? "New template" : `Edit: ${name}`;
  tplNameInput.value = name;
  tplBodyInput.value = body;
  setTplStatus("");
  tplEditor.hidden = false;
  tplEditor.scrollIntoView({ behavior: "smooth", block: "nearest" });
  tplNameInput.focus();
}

function closeEditor() {
  editorState = null;
  tplEditor.hidden = true;
  tplNameInput.value = "";
  tplBodyInput.value = "";
  tplFileInput.value = "";
  setTplStatus("");
}

async function openEditFor(id) {
  setTplStatus("Loading…");
  try {
    const res = await fetch(`/api/templates/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    openEditor("edit", { id: data.id, name: data.name, body: data.body });
  } catch (err) {
    setTplStatus(`Could not load template: ${err.message}`, true);
  }
}

async function saveTemplate() {
  const name = tplNameInput.value.trim();
  const body = tplBodyInput.value.trim();
  if (!name) return setTplStatus("Please enter a name.", true);
  if (!body) return setTplStatus("Please enter the template body.", true);

  const editing = editorState?.mode === "edit";
  const url = editing
    ? `/api/templates/${encodeURIComponent(editorState.id)}`
    : "/api/templates";
  const method = editing ? "PUT" : "POST";

  tplSaveBtn.disabled = true;
  setTplStatus("Saving…");
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    await refreshTemplates(data.id);
    closeEditor();
    setStatus(`Template "${data.name}" saved.`);
  } catch (err) {
    setTplStatus(`Save failed: ${err.message}`, true);
  } finally {
    tplSaveBtn.disabled = false;
  }
}

async function deleteTemplate(id) {
  if (!window.confirm("Delete this template? This cannot be undone.")) return;
  try {
    const res = await fetch(`/api/templates/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    await refreshTemplates();
    setStatus("Template deleted.");
  } catch (err) {
    setStatus(`Delete failed: ${err.message}`, true);
  }
}

// Client-side import: read a chosen .md file into the body textarea.
function onFileChosen() {
  const file = tplFileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    tplBodyInput.value = String(reader.result ?? "");
    if (!tplNameInput.value.trim()) {
      tplNameInput.value = file.name.replace(/\.md$/i, "");
    }
    setTplStatus(`Loaded "${file.name}". Review and Save to add it.`);
  };
  reader.onerror = () => setTplStatus("Could not read the file.", true);
  reader.readAsText(file);
}

async function generate() {
  const templateId = templateSelect.value;
  const transcript = transcriptInput.value.trim();
  const notes = notesInput.value.trim();

  if (!transcript) {
    setStatus("Please paste an interview transcript first.", true);
    return;
  }

  generateBtn.disabled = true;
  setStatus("Generating feedback…");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, transcript, notes }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    outputEl.textContent = data.feedback;
    resultSection.hidden = false;
    setStatus("Done.");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    setStatus(`Generation failed: ${err.message}`, true);
  } finally {
    generateBtn.disabled = false;
  }
}

async function copyFeedback() {
  try {
    await navigator.clipboard.writeText(outputEl.textContent);
    const original = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = original;
    }, 1500);
  } catch {
    setStatus("Could not copy to clipboard.", true);
  }
}

// Wiring.
generateBtn.addEventListener("click", generate);
copyBtn.addEventListener("click", copyFeedback);

tplNewBtn.addEventListener("click", () => openEditor("create"));
tplCancelBtn.addEventListener("click", closeEditor);
tplSaveBtn.addEventListener("click", saveTemplate);
tplFileInput.addEventListener("change", onFileChosen);

// Event delegation for the per-template Edit/Delete buttons.
tplListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { id } = btn.dataset;
  if (btn.classList.contains("tpl-edit")) openEditFor(id);
  else if (btn.classList.contains("tpl-delete") && !btn.disabled) deleteTemplate(id);
});

refreshTemplates().catch((err) => setStatus(`Could not load templates: ${err.message}`, true));
