import { on, qsa } from "../utils.js";

const ROWS = [
  { name: "Marketing Q1", status: "Active", statusClass: "badge-success", owner: "Sarah K." },
  { name: "Website Redesign", status: "In Progress", statusClass: "badge-warning", owner: "John D." },
  { name: "API Integration", status: "Draft", statusClass: "badge-info", owner: "Alex M." },
];

let sortColumn = null;
let sortDirection = "asc";
let selectedRows = new Set();

function getSortedRows() {
  if (!sortColumn) return [...ROWS];

  return [...ROWS].sort((a, b) => {
    const aVal = a[sortColumn] || "";
    const bVal = b[sortColumn] || "";
    const cmp = aVal.localeCompare(bVal);
    return sortDirection === "asc" ? cmp : -cmp;
  });
}

function renderRows(tbody, selectAllCheckbox, bulkBar, selectedCountNode) {
  if (!tbody) return;

  const rows = getSortedRows();
  tbody.innerHTML = "";

  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.style.cssText = "transition: background 0.15s;";

    const isChecked = selectedRows.has(index);

    tr.innerHTML = `
      <td style="padding: 10px 12px; border-bottom: 1px solid var(--color-border);">
        <input type="checkbox" data-tables-row-checkbox="${index}" ${isChecked ? "checked" : ""} aria-label="Select row" />
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid var(--color-border); font-weight: 500;">${row.name}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid var(--color-border);">
        <span class="badge ${row.statusClass}">${row.status}</span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid var(--color-border);">${row.owner}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid var(--color-border);">
        <button type="button" class="btn btn-secondary btn-sm" style="margin-right: 4px;">Edit</button>
        <button type="button" class="btn btn-danger btn-sm">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  syncBulkBar(selectAllCheckbox, bulkBar, selectedCountNode, rows.length);
  bindRowCheckboxes(tbody, selectAllCheckbox, bulkBar, selectedCountNode, rows.length);
}

function syncBulkBar(selectAllCheckbox, bulkBar, selectedCountNode, total) {
  if (!selectAllCheckbox || !bulkBar || !selectedCountNode) return;

  const count = selectedRows.size;

  if (count > 0) {
    bulkBar.classList.remove("ui-demo-hidden");
    selectedCountNode.textContent = count;
  } else {
    bulkBar.classList.add("ui-demo-hidden");
  }

  selectAllCheckbox.checked = count === total && total > 0;
  selectAllCheckbox.indeterminate = count > 0 && count < total;
}

function bindRowCheckboxes(tbody, selectAllCheckbox, bulkBar, selectedCountNode, total) {
  qsa("[data-tables-row-checkbox]", tbody).forEach((checkbox) => {
    on(checkbox, "change", () => {
      const index = Number(checkbox.dataset.tablesRowCheckbox);
      if (checkbox.checked) {
        selectedRows.add(index);
      } else {
        selectedRows.delete(index);
      }
      syncBulkBar(selectAllCheckbox, bulkBar, selectedCountNode, total);
    });
  });
}

function updateSortArrows() {
  qsa("[data-tables-sort-arrow]").forEach((arrow) => {
    const col = arrow.dataset.tablesSortArrow;
    if (col === sortColumn) {
      arrow.textContent = sortDirection === "asc" ? "↑" : "↓";
    } else {
      arrow.textContent = "↕";
    }
  });
}

function showPanel(activeState) {
  const panels = ["loading", "empty", "error", "data"];

  panels.forEach((state) => {
    const panel = document.querySelector(`[data-tables-demo-panel="${state}"]`);
    if (!panel) return;

    if (state === activeState) {
      panel.classList.remove("ui-demo-hidden");
    } else {
      panel.classList.add("ui-demo-hidden");
    }
  });

  const buttons = qsa("[data-tables-state]");
  buttons.forEach((btn) => {
    if (btn.dataset.tablesState === activeState) {
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary");
    } else {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-secondary");
    }
  });
}

function initTablesDemo() {
  const stateButtons = qsa("[data-tables-state]");
  const tbody = document.querySelector("[data-tables-tbody]");
  const selectAllCheckbox = document.querySelector("[data-tables-select-all]");
  const bulkBar = document.querySelector("[data-tables-bulk-bar]");
  const selectedCountNode = document.querySelector("[data-tables-selected-count]");
  const retryButton = document.querySelector("[data-tables-retry]");
  const sortHeaders = qsa("[data-tables-sort]");

  if (!stateButtons.length) return;

  showPanel("data");

  stateButtons.forEach((btn) => {
    on(btn, "click", () => {
      const state = btn.dataset.tablesState;
      showPanel(state);
      if (state === "data") {
        renderRows(tbody, selectAllCheckbox, bulkBar, selectedCountNode);
      }
    });
  });

  if (retryButton) {
    on(retryButton, "click", () => {
      showPanel("loading");
      window.setTimeout(() => showPanel("data"), 1200);
    });
  }

  if (selectAllCheckbox) {
    on(selectAllCheckbox, "change", () => {
      const rows = getSortedRows();
      if (selectAllCheckbox.checked) {
        rows.forEach((_, i) => selectedRows.add(i));
      } else {
        selectedRows.clear();
      }
      renderRows(tbody, selectAllCheckbox, bulkBar, selectedCountNode);
    });
  }

  sortHeaders.forEach((header) => {
    on(header, "click", () => {
      const col = header.dataset.tablesSort;
      if (sortColumn === col) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortColumn = col;
        sortDirection = "asc";
      }
      updateSortArrows();
      renderRows(tbody, selectAllCheckbox, bulkBar, selectedCountNode);
    });
  });

  renderRows(tbody, selectAllCheckbox, bulkBar, selectedCountNode);
}

document.addEventListener("DOMContentLoaded", initTablesDemo);
