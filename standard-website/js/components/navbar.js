import { on, qs, qsa, resolveProjectPath } from "../utils.js";

export function initNavbar() {
  initNavbarBranding();
  initMobileNavbar();
  initNavbarScrollState();
}

function initNavbarBranding() {
  qsa(".navbar-brand").forEach((brand) => {
    const logo = qs(".navbar-logo", brand);
    if (logo) {
      logo.src = resolveProjectPath("assets/images/infiweb-logo.png");
      logo.alt = "Infi Web Solutions Logo";
    }

    const existingText = Array.from(brand.children).find((element) => element.tagName === "SPAN");
    if (existingText) {
      existingText.remove();
    }

    const brandText = document.createElement("span");
    brandText.className = "navbar-brand-copy";
    brandText.innerHTML = `
      <span class="navbar-brand-title">Development Standards</span>
      <span class="navbar-brand-subtitle">by Infi Web Solutions</span>
    `;

    brand.appendChild(brandText);
  });
}

function initMobileNavbar() {
  const navbarInner = qs(".navbar-inner");
  const menu = qs(".navbar-menu");

  if (!navbarInner || !menu) return;

  menu.setAttribute("data-navbar-menu", "");

  let toggleButton = qs("[data-navbar-toggle]");

  if (!toggleButton) {
    toggleButton = document.createElement("button");
    toggleButton.className = "navbar-toggle";
    toggleButton.setAttribute("data-navbar-toggle", "");
    toggleButton.setAttribute("aria-label", "Open navigation menu");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.innerHTML = `
      <span class="navbar-toggle-bar"></span>
      <span class="navbar-toggle-bar"></span>
      <span class="navbar-toggle-bar"></span>
    `;
    navbarInner.appendChild(toggleButton);
  }

  const close = () => {
    menu.classList.remove("navbar-menu-open");
    toggleButton.classList.remove("navbar-toggle-open");
    toggleButton.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    menu.classList.add("navbar-menu-open");
    toggleButton.classList.add("navbar-toggle-open");
    toggleButton.setAttribute("aria-expanded", "true");
  };

  on(toggleButton, "click", (e) => {
    e.stopPropagation();
    menu.classList.contains("navbar-menu-open") ? close() : open();
  });

  qsa(".navbar-menu a").forEach((link) => {
    on(link, "click", close);
  });

  on(document, "click", (e) => {
    if (!navbarInner.contains(e.target)) {
      close();
    }
  });

  on(document, "keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initNavbarScrollState() {
  const navbar = qs(".navbar");

  if (!navbar) return;

  const updateNavbarState = () => {
    navbar.classList.toggle("navbar-scrolled", window.scrollY > 8);
  };

  updateNavbarState();
  on(window, "scroll", updateNavbarState, { passive: true });
}
