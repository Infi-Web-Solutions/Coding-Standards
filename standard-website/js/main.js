import { initGlobalPageIndex, setActiveLinks, qsa } from "./utils.js";
import { initNavbar } from "./components/navbar.js";
import { initFooterBranding } from "./components/footer.js";
import { initSidebar } from "./components/sidebar.js";
import { initSearch } from "./components/search.js";
import { initTabs } from "./components/tabs.js";
import { initAccordions } from "./components/accordion.js";
import { initModals } from "./components/modal.js";
import { initThemeToggle } from "./components/theme-toggle.js";

import { initHomePage } from "./pages/home.js";
import { initStandardsPage } from "./pages/standards.js";
import { initChecklistsPage } from "./pages/checklists.js";
import { initTasksPage } from "./pages/tasks.js";
import { initTemplatesPage } from "./pages/templates.js";

function initBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  document.body.appendChild(btn);

  const toggle = () => btn.classList.toggle("visible", window.scrollY > 400);
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = scrollable > 0 ? `${(window.scrollY / scrollable) * 100}%` : "0%";
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initStackBadgeColors() {
  const stackMap = [
    ["next", "nextjs"],
    ["weweb", "weweb"],
    ["react", "react"],
    ["django", "django"],
    ["xano", "xano"],
    ["supabase", "supabase"],
  ];

  qsa(".project-stack-badge, .tasks-project-kicker").forEach((el) => {
    const text = el.textContent.toLowerCase();
    for (const [key, value] of stackMap) {
      if (text.includes(key)) {
        el.setAttribute("data-stack", value);
        break;
      }
    }
  });
}

function initGlobalApp() {
  setActiveLinks();

  initNavbar();
  initFooterBranding();
  initSidebar();
  initSearch();
  initTabs();
  initAccordions();
  initModals();
  initThemeToggle();
  initBackToTop();
  initScrollProgress();
  initStackBadgeColors();

  initPageSpecificScripts();
  initGlobalPageIndex();
}

function initPageSpecificScripts() {
  const pageName = document.body.dataset.page;

  switch (pageName) {
    case "home":
      initHomePage();
      break;

    case "standards":
      initStandardsPage();
      break;

    case "checklists":
      initChecklistsPage();
      break;

    case "tasks":
      initTasksPage();
      break;

    case "templates":
      initTemplatesPage();
      break;

    default:
      break;
  }
}

document.addEventListener("DOMContentLoaded", initGlobalApp);
