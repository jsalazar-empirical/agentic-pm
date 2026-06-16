import { test, expect } from "@playwright/test";

// Template CRUD hits the real file API against the sandbox TEMPLATES_DIR (no LLM, so no
// mock needed). Serial: the created template is reused across edit → delete.
test.describe.serial("Template management", () => {
  const NAME = "E2E Temp Template";
  const ID = "e2e-temp-template";

  test("create a template → it appears in the list and selector, and is selected", async ({ page }) => {
    await page.goto("/");

    await page.click("#tpl-new");
    await expect(page.locator("#tpl-editor")).toBeVisible();
    await page.fill("#tpl-name", NAME);
    await page.fill("#tpl-body", "## Section A\n- created by E2E\n");
    await page.click("#tpl-save");

    // Editor closes; the new template shows in the manage list…
    await expect(page.locator("#tpl-editor")).toBeHidden();
    await expect(page.locator(`#tpl-list li[data-id="${ID}"]`)).toBeVisible();
    // …and in the selector, pre-selected.
    await expect(page.locator(`#template option[value="${ID}"]`)).toHaveCount(1);
    await expect(page.locator("#template")).toHaveValue(ID);
  });

  test("edit the body → change persists", async ({ page }) => {
    await page.goto("/");

    await page.click(`#tpl-list li[data-id="${ID}"] .tpl-edit`);
    await expect(page.locator("#tpl-editor")).toBeVisible();
    await expect(page.locator("#tpl-body")).toHaveValue(/created by E2E/);

    await page.fill("#tpl-body", "## Section A\n- edited by E2E marker\n");
    await page.click("#tpl-save");
    await expect(page.locator("#tpl-editor")).toBeHidden();

    // Reopen the editor and confirm the change persisted.
    await page.click(`#tpl-list li[data-id="${ID}"] .tpl-edit`);
    await expect(page.locator("#tpl-body")).toHaveValue(/edited by E2E marker/);
  });

  test("delete a non-default template (with confirm) → it disappears", async ({ page }) => {
    await page.goto("/");
    page.on("dialog", (dialog) => dialog.accept());

    await page.click(`#tpl-list li[data-id="${ID}"] .tpl-delete`);

    await expect(page.locator(`#tpl-list li[data-id="${ID}"]`)).toHaveCount(0);
    await expect(page.locator(`#template option[value="${ID}"]`)).toHaveCount(0);
  });

  test("the default template's delete control is disabled (protected)", async ({ page }) => {
    await page.goto("/");
    const delBtn = page.locator('#tpl-list li[data-id="default-interview"] .tpl-delete');
    await expect(delBtn).toBeVisible();
    await expect(delBtn).toBeDisabled();
  });

  test("import a .md file → its content lands in the editor", async ({ page }) => {
    await page.goto("/");

    await page.click("#tpl-new");
    await expect(page.locator("#tpl-editor")).toBeVisible();
    await page.locator("#tpl-file").setInputFiles({
      name: "imported-template.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("## Imported Section\n- from an uploaded file\n"),
    });

    await expect(page.locator("#tpl-body")).toHaveValue(/Imported Section/);
    // Name auto-fills from the filename when left blank.
    await expect(page.locator("#tpl-name")).toHaveValue(/imported-template/);
  });
});
