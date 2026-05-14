import { copyToClipboard, initCatalogIndex, on, qsa } from "../utils.js";

export function initTemplatesPage() {
  initTemplatesCatalogIndex();
  initCopyTemplateButtons();
}

function initTemplatesCatalogIndex() {
  initCatalogIndex({
    catalogSelector: "#templates-catalog",
    headerSelector: ".templates-catalog-header",
    groupSelector: ".templates-doc-list",
    itemSelector: ".templates-doc-card",
    itemTitleSelector: ".card-title",
    getGroupTitle: () => "Template Catalog",
    getGroupDescription: () =>
      "Pick the exact writing format you need, then open the matching template card below.",
    extraContentSelectors: ["[data-search-empty]"],
    idPrefix: "templates",
    groupTitleFallback: "Template Section",
  });
}

function initCopyTemplateButtons() {
  qsa("[data-copy-template]").forEach((button) => {
    const targetId = button.getAttribute("data-copy-template");
    const target = document.getElementById(targetId);

    if (!target) return;

    on(button, "click", async () => {
      const originalText = button.textContent;

      try {
        await copyToClipboard(target.innerText || target.textContent || "");

        button.textContent = "Copied";
        button.classList.add("btn-primary");

        window.setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("btn-primary");
        }, 1200);
      } catch {
        button.textContent = "Copy Failed";

        window.setTimeout(() => {
          button.textContent = originalText;
        }, 1200);
      }
    });
  });
}
