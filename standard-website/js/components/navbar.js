import { qs, qsa, on } from "../utils.js";

export function initNavbar() {
  initMobileNavbar();
  initNavbarScrollState();
  initHashLinkClosing();
}

function initMobileNavbar() {
  const toggleButton = qs("[data-navbar-toggle]");
  const menu = qs("[data-navbar-menu]");

  if (!toggleButton || !menu) return;

  on(toggleButton, "click", () => {
    const isOpen = menu.classList.toggle("active");

    toggleButton.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-hidden", String(!isOpen));
  });
}

function initNavbarScrollState() {
  const navbar = qs(".navbar");

  if (!navbar) return;

  const updateNavbarState = () => {
    if (window.scrollY > 8) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  };

  updateNavbarState();
  on(window, "scroll", updateNavbarState, { passive: true });
}

function initHashLinkClosing() {
  const menu = qs("[data-navbar-menu]");
  const toggleButton = qs("[data-navbar-toggle]");

  if (!menu || !toggleButton) return;

  qsa('[data-navbar-menu] a[href^="#"]').forEach((link) => {
    on(link, "click", () => {
      menu.classList.remove("active");
      menu.setAttribute("aria-hidden", "true");
      toggleButton.setAttribute("aria-expanded", "false");
    });
  });
}