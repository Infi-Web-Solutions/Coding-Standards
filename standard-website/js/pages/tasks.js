import { initCatalogIndex, qsa, on } from "../utils.js";

export function initTasksPage() {
  initTaskPageSurface();
  initTasksCatalogIndex();
  initTaskFilters();
  initProjectMermaidDiagrams();
}

function initTaskPageSurface() {
  const page = document.body;
  const isTasksLibrary = document.querySelector("main.page.tasks-library-page");
  const isProjectDetail = page.classList.contains("project-detail-page");

  if (!isTasksLibrary && !isProjectDetail) {
    page.classList.add("task-detail-page");
  }
}

function initTasksCatalogIndex() {
  initCatalogIndex({
    catalogSelector: "#tasks-catalog",
    headerSelector: ".tasks-catalog-header",
    groupSelector: ".tasks-group",
    groupTitleSelector: ".tasks-group-header h3",
    groupDescriptionSelector: ".tasks-group-header > p",
    itemSelector: ".tasks-doc-card",
    itemTitleSelector: ".card-title, strong",
    extraContentSelectors: ["[data-search-empty]"],
    idPrefix: "tasks",
    groupTitleFallback: "Task Section",
  });
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

async function initProjectMermaidDiagrams() {
  const mermaidBlocks = qsa(".project-detail-page pre.mermaid");

  if (!mermaidBlocks.length) return;

  mermaidBlocks.forEach((block) => {
    if (!block.dataset.mermaidSource) {
      block.dataset.mermaidSource = block.textContent.trim();
    }
  });

  try {
    const { default: mermaid } = await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");

    const render = async () => {
      mermaidBlocks.forEach((block) => {
        block.removeAttribute("data-processed");
        block.textContent = block.dataset.mermaidSource || "";
      });

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: document.documentElement.dataset.theme === "dark" ? "dark" : "default",
      });

      await mermaid.run({
        nodes: mermaidBlocks,
      });
    };

    await render();

    const observer = new MutationObserver(() => {
      render();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  } catch (error) {
    console.error("Failed to load Mermaid diagrams", error);
  }
}
