import { qsa, on } from "../utils.js";

export function initTasksPage() {
  initTaskFilters();
}

function initTaskFilters() {
  const filterButtons = qsa("[data-task-filter]");
  const taskCards = qsa("[data-task-card]");

  if (!filterButtons.length || !taskCards.length) return;

  filterButtons.forEach((button) => {
    on(button, "click", () => {
      const selectedType = button.getAttribute("data-task-filter");

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      taskCards.forEach((card) => {
        const cardType = card.getAttribute("data-task-type");

        card.hidden = selectedType !== "all" && cardType !== selectedType;
      });
    });
  });
}