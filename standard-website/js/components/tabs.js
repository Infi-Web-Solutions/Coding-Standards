import { qsa, on } from "../utils.js";

export function initTabs() {
  qsa("[data-tabs]").forEach((tabRoot) => {
    const tabButtons = qsa("[data-tab-target]", tabRoot);
    const tabPanels = qsa("[data-tab-panel]", tabRoot);

    if (!tabButtons.length || !tabPanels.length) return;

    tabButtons.forEach((button) => {
      on(button, "click", () => {
        const targetId = button.getAttribute("data-tab-target");

        tabButtons.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });

        tabPanels.forEach((panel) => {
          panel.hidden = panel.id !== targetId;
        });

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
      });
    });
  });
}