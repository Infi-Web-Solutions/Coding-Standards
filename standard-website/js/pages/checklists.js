import { initCatalogIndex, qsa, on } from "../utils.js";

export function initChecklistsPage() {
  initChecklistsCatalogIndex();
  initChecklistProgress();
}

function initChecklistsCatalogIndex() {
  initCatalogIndex({
    catalogSelector: "#checklists-catalog",
    headerSelector: ".checklists-catalog-header",
    groupSelector: ".checklists-group",
    groupTitleSelector: ".checklists-group-header h3",
    groupDescriptionSelector: ".checklists-group-header > p",
    itemSelector: ".checklists-doc-card",
    itemTitleSelector: ".card-title",
    extraContentSelectors: ["[data-search-empty]"],
    idPrefix: "checklists",
    groupTitleFallback: "Checklist Section",
  });
}

function initChecklistProgress() {
  const checkboxes = qsa("[data-checklist-item]");
  const progressText = document.querySelector("[data-checklist-progress]");

  if (!checkboxes.length || !progressText) return;

  const updateProgress = () => {
    const completed = checkboxes.filter((checkbox) => checkbox.checked).length;
    progressText.textContent = `${completed}/${checkboxes.length} completed`;
  };

  checkboxes.forEach((checkbox) => {
    on(checkbox, "change", updateProgress);
  });

  updateProgress();
}
