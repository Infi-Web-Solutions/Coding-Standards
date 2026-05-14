import { initGlobalPageIndex, setActiveLinks } from "./utils.js";
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
