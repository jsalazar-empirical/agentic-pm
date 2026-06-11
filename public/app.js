const templateSelect = document.getElementById("template");
const transcriptInput = document.getElementById("transcript");
const notesInput = document.getElementById("notes");
const generateBtn = document.getElementById("generate");
const statusEl = document.getElementById("status");
const resultSection = document.getElementById("result");
const outputEl = document.getElementById("output");
const copyBtn = document.getElementById("copy");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("status--error", isError);
}

// Load available templates and populate the select (first one pre-selected).
async function loadTemplates() {
  try {
    const res = await fetch("/api/templates");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { templates } = await res.json();

    templateSelect.innerHTML = "";
    for (const t of templates) {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.name;
      templateSelect.appendChild(opt);
    }
  } catch (err) {
    setStatus(`Could not load templates: ${err.message}`, true);
  }
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

generateBtn.addEventListener("click", generate);
copyBtn.addEventListener("click", copyFeedback);

loadTemplates();
