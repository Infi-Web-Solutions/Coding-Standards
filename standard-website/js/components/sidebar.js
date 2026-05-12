import { qsa, on } from "../utils.js";

export function initSidebar() {
  initSidebarGroups();
  initSidebarActiveParents();
}

function initSidebarGroups() {
  qsa("[data-sidebar-toggle]").forEach((button) => {
    const targetId = button.getAttribute("data-sidebar-toggle");
    const target = document.getElementById(targetId);

    if (!target) return;

    on(button, "click", () => {
      const isOpen = target.classList.toggle("active");

      button.setAttribute("aria-expanded", String(isOpen));
      target.setAttribute("aria-hidden", String(!isOpen));
    });
  });
}

function initSidebarActiveParents() {
  qsa(".sidebar-link.active").forEach((activeLink) => {
    const group = activeLink.closest("[data-sidebar-group]");

    if (!group) return;

    group.classList.add("active");

    const toggle = group.querySelector("[data-sidebar-toggle]");
    const content = group.querySelector("[data-sidebar-content]");

    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (content) {
      content.classList.add("active");
      content.setAttribute("aria-hidden", "false");
    }
  });
}