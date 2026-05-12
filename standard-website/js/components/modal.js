import { qs, qsa, on } from "../utils.js";

export function initModals() {
  qsa("[data-modal-open]").forEach((button) => {
    const modalId = button.getAttribute("data-modal-open");
    const modal = document.getElementById(modalId);

    if (!modal) return;

    on(button, "click", () => openModal(modal));
  });

  qsa("[data-modal-close]").forEach((button) => {
    on(button, "click", () => {
      const modal = button.closest(".modal-backdrop");
      closeModal(modal);
    });
  });

  qsa(".modal-backdrop").forEach((backdrop) => {
    on(backdrop, "click", (event) => {
      if (event.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  on(document, "keydown", (event) => {
    if (event.key !== "Escape") return;

    const activeModal = qs(".modal-backdrop.active");

    if (activeModal) {
      closeModal(activeModal);
    }
  });
}

export function openModal(modal) {
  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  const focusableElement = modal.querySelector(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );

  if (focusableElement) {
    focusableElement.focus();
  }
}

export function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}