import { on, debounce } from "../utils.js";

const ALL_ITEMS = [
  { name: "Marketing Q1", status: "Active", owner: "Sarah K." },
  { name: "Website Redesign", status: "In Progress", owner: "John D." },
  { name: "API Integration", status: "Draft", owner: "Alex M." },
  { name: "Brand Refresh", status: "Active", owner: "Sarah K." },
  { name: "Mobile App v2", status: "Draft", owner: "Alex M." },
  { name: "Analytics Dashboard", status: "In Progress", owner: "John D." },
  { name: "Content Strategy", status: "Active", owner: "Sarah K." },
  { name: "Infrastructure Audit", status: "Draft", owner: "Alex M." },
];

const TOTAL_PAGES = 5;
const ITEMS_PER_PAGE = 4;

let activeFilters = new Set(["Active", "Sarah"]);
let currentPage = 2;
let searchQuery = "";

function statusBadgeClass(status) {
  if (status === "Active") return "badge-success";
  if (status === "In Progress") return "badge-warning";
  return "badge-info";
}

function getFilteredItems() {
  return ALL_ITEMS.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());

    const statusFilters = ["Active", "Draft", "In Progress"].filter((f) => activeFilters.has(f));
    const ownerFilters = [...activeFilters].filter((f) => !["Active", "Draft", "In Progress"].includes(f));

    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.status);
    const matchesOwner =
      ownerFilters.length === 0 || ownerFilters.some((f) => item.owner.includes(f));

    return matchesSearch && matchesStatus && matchesOwner;
  });
}

function renderResults(resultsNode) {
  if (!resultsNode) return;

  const filtered = getFilteredItems();
  const pageItems = filtered.slice(0, ITEMS_PER_PAGE);

  if (pageItems.length === 0) {
    resultsNode.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--color-text-muted); background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);">
        ${searchQuery
          ? `No results for "<strong>${searchQuery}</strong>"${activeFilters.size ? " with these filters" : ""}.`
          : "No items match your filters."}
      </div>
    `;
    return;
  }

  const rows = pageItems.map((item) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--color-border);">
      <div>
        <span style="font-weight: 500;">${item.name}</span>
        <span style="margin-left: 10px; color: var(--color-text-muted); font-size: 0.85rem;">${item.owner}</span>
      </div>
      <span class="badge ${statusBadgeClass(item.status)}">${item.status}</span>
    </div>
  `).join("");

  const total = filtered.length;
  const showing = Math.min(ITEMS_PER_PAGE, total);

  resultsNode.innerHTML = `
    <div style="background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border); overflow: hidden;">
      <div style="padding: 8px 14px; font-size: 0.8rem; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border);">
        Showing ${showing} of ${total} result${total !== 1 ? "s" : ""}
      </div>
      ${rows}
    </div>
  `;
}

function renderChips(chipsContainer, clearAllButton) {
  if (!chipsContainer) return;

  chipsContainer.innerHTML = "";

  const filterLabels = {
    Active: "Status: Active",
    Draft: "Status: Draft",
    "In Progress": "Status: In Progress",
    Sarah: "Owner: Sarah",
  };

  activeFilters.forEach((filter) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "ui-demo-chip ui-demo-chip-removable";
    chip.dataset.sfpChip = filter;
    chip.innerHTML = `${filterLabels[filter] || filter} <span aria-hidden="true">×</span>`;
    chipsContainer.appendChild(chip);
  });

  if (clearAllButton) {
    if (activeFilters.size > 0) {
      clearAllButton.classList.remove("ui-demo-hidden");
    } else {
      clearAllButton.classList.add("ui-demo-hidden");
    }
  }
}

function renderPagination() {
  const prevBtn = document.querySelector("[data-sfp-prev]");
  const nextBtn = document.querySelector("[data-sfp-next]");
  const pageButtons = document.querySelectorAll("[data-sfp-page]");

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.opacity = currentPage === 1 ? "0.4" : "";
    prevBtn.style.cursor = currentPage === 1 ? "not-allowed" : "";
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage === TOTAL_PAGES;
    nextBtn.style.opacity = currentPage === TOTAL_PAGES ? "0.4" : "";
    nextBtn.style.cursor = currentPage === TOTAL_PAGES ? "not-allowed" : "";
  }

  pageButtons.forEach((btn) => {
    const page = Number(btn.dataset.sfpPage);
    if (page === currentPage) {
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary");
    } else {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-secondary");
    }
  });
}

function syncAll(resultsNode, chipsContainer, clearAllButton) {
  renderChips(chipsContainer, clearAllButton);
  renderResults(resultsNode);
  renderPagination();
}

function initSearchFiltersPaginationDemo() {
  const searchInput = document.querySelector("[data-sfp-search]");
  const spinner = document.querySelector("[data-sfp-spinner]");
  const resultsNode = document.querySelector("[data-sfp-results]");
  const chipsContainer = document.querySelector("[data-sfp-chips]");
  const clearAllButton = document.querySelector("[data-sfp-clear-all]");
  const filterAddButtons = document.querySelectorAll("[data-sfp-filter-add]");
  const prevButton = document.querySelector("[data-sfp-prev]");
  const nextButton = document.querySelector("[data-sfp-next]");
  const pageButtons = document.querySelectorAll("[data-sfp-page]");

  if (!searchInput || !resultsNode) return;

  let searchTimer = null;

  function handleSearch() {
    const query = searchInput.value.trim();

    if (spinner) spinner.classList.remove("ui-demo-hidden");

    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      searchQuery = query;
      currentPage = 1;
      if (spinner) spinner.classList.add("ui-demo-hidden");
      syncAll(resultsNode, chipsContainer, clearAllButton);
    }, 300);
  }

  on(searchInput, "input", handleSearch);

  if (chipsContainer) {
    on(chipsContainer, "click", (event) => {
      const chip = event.target.closest("[data-sfp-chip]");
      if (!chip) return;
      activeFilters.delete(chip.dataset.sfpChip);
      currentPage = 1;
      syncAll(resultsNode, chipsContainer, clearAllButton);
    });
  }

  if (clearAllButton) {
    on(clearAllButton, "click", () => {
      activeFilters.clear();
      searchInput.value = "";
      searchQuery = "";
      currentPage = 1;
      syncAll(resultsNode, chipsContainer, clearAllButton);
    });
  }

  filterAddButtons.forEach((btn) => {
    on(btn, "click", () => {
      const filter = btn.dataset.sfpFilterAdd;
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
      } else {
        activeFilters.add(filter);
      }
      currentPage = 1;
      syncAll(resultsNode, chipsContainer, clearAllButton);
    });
  });

  if (prevButton) {
    on(prevButton, "click", () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderPagination();
        renderResults(resultsNode);
      }
    });
  }

  if (nextButton) {
    on(nextButton, "click", () => {
      if (currentPage < TOTAL_PAGES) {
        currentPage += 1;
        renderPagination();
        renderResults(resultsNode);
      }
    });
  }

  pageButtons.forEach((btn) => {
    on(btn, "click", () => {
      currentPage = Number(btn.dataset.sfpPage);
      renderPagination();
      renderResults(resultsNode);
    });
  });

  syncAll(resultsNode, chipsContainer, clearAllButton);
}

document.addEventListener("DOMContentLoaded", initSearchFiltersPaginationDemo);
