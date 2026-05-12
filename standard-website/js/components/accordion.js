import { qsa, on } from "../utils.js";

export function initAccordions() {
  qsa("[data-accordion]").forEach((accordion) => {
    const buttons = qsa("[data-accordion-trigger]", accordion);

    buttons.forEach((button) => {
      const panelId = button.getAttribute("data-accordion-trigger");
      const panel = document.getElementById(panelId);

      if (!panel) return;

      on(button, "click", () => {
        const isOpen = !panel.hidden;

        panel.hidden = isOpen;
        button.classList.toggle("active", !isOpen);
        button.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  });
}