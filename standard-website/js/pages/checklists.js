import { qsa, on } from "../utils.js";

export function initChecklistsPage() {
  initChecklistProgress();
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