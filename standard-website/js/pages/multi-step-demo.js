import { on, qs, escapeHtml } from "../utils.js";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 3;

const state = {
  currentStep: 1,
  // Step 1 data
  projectName: "",
  description: "",
  status: "active",
  // Step 2 data
  members: ["Sarah K.", "John D."],
  searchQuery: "",
};

const MOCK_MEMBERS = [
  "Alice R.",
  "Bob M.",
  "Carol T.",
  "David L.",
  "Emma W.",
  "Frank O.",
  "Grace P.",
  "Henry S.",
];

// ---------------------------------------------------------------------------
// DOM refs (populated after DOMContentLoaded)
// ---------------------------------------------------------------------------

let refs = {};

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function show(el) {
  if (el) el.classList.remove("ui-demo-hidden");
}

function hide(el) {
  if (el) el.classList.add("ui-demo-hidden");
}

function setError(inputEl, errorEl, message) {
  if (inputEl) inputEl.classList.add("ui-demo-input-error");
  if (errorEl) {
    errorEl.textContent = message;
    show(errorEl);
  }
}

function clearError(inputEl, errorEl) {
  if (inputEl) inputEl.classList.remove("ui-demo-input-error");
  if (errorEl) {
    errorEl.textContent = "";
    hide(errorEl);
  }
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function updateProgressBar() {
  const pct = Math.round(((state.currentStep - 1) / TOTAL_STEPS) * 100);
  if (refs.progressBar) refs.progressBar.style.width = `${pct}%`;
  if (refs.progressLabel) refs.progressLabel.textContent = `Step ${state.currentStep} of ${TOTAL_STEPS}`;
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEP_LABELS = ["Project Details", "Team Members", "Review"];

function buildStepIndicator() {
  if (!refs.stepIndicator) return;

  refs.stepIndicator.innerHTML = STEP_LABELS.map((label, i) => {
    const stepNum = i + 1;
    const isCurrent = stepNum === state.currentStep;
    const isCompleted = stepNum < state.currentStep;

    let dotContent;
    if (isCompleted) {
      dotContent = "✓";
    } else if (isCurrent) {
      dotContent = "●";
    } else {
      dotContent = "○";
    }

    const stateClass = isCompleted ? "is-completed" : isCurrent ? "is-current" : "is-future";

    const connector = stepNum < TOTAL_STEPS
      ? `<span class="ms-step-connector" aria-hidden="true"></span>`
      : "";

    return `
      <button
        type="button"
        class="ms-step-item ${stateClass}"
        data-step="${stepNum}"
        aria-label="Step ${stepNum}: ${label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}"
        ${!isCompleted ? "disabled" : ""}
      >
        <span class="ms-step-dot" aria-hidden="true">${dotContent}</span>
        <span class="ms-step-label">Step ${stepNum}: ${label}</span>
      </button>
      ${connector}
    `;
  }).join("");

  // Allow clicking completed steps to jump back
  refs.stepIndicator.querySelectorAll(".ms-step-item:not([disabled])").forEach((btn) => {
    on(btn, "click", () => {
      const target = Number(btn.dataset.step);
      if (target < state.currentStep) {
        goToStep(target);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Step panels — show/hide
// ---------------------------------------------------------------------------

function showStep(step) {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const panel = refs[`step${i}Panel`];
    if (panel) {
      if (i === step) {
        show(panel);
      } else {
        hide(panel);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Step 1 — read values into state
// ---------------------------------------------------------------------------

function readStep1() {
  state.projectName = (refs.projectName?.value ?? "").trim();
  state.description = (refs.description?.value ?? "").trim();
  state.status = refs.statusSelect?.value ?? "active";
}

function validateStep1() {
  readStep1();
  let valid = true;

  if (!state.projectName) {
    setError(refs.projectName, refs.projectNameError, "Project name is required.");
    valid = false;
  } else if (state.projectName.length < 3) {
    setError(refs.projectName, refs.projectNameError, "Project name must be at least 3 characters.");
    valid = false;
  } else {
    clearError(refs.projectName, refs.projectNameError);
  }

  return valid;
}

// ---------------------------------------------------------------------------
// Step 2 — member chips
// ---------------------------------------------------------------------------

function renderMemberChips() {
  if (!refs.memberChips) return;

  refs.memberChips.innerHTML = state.members.map((name) => `
    <button type="button" class="ui-demo-chip ui-demo-chip-removable ms-member-chip" data-member="${escapeHtml(name)}">
      ${escapeHtml(name)} <span aria-hidden="true">×</span>
    </button>
  `).join("");

  refs.memberChips.querySelectorAll(".ms-member-chip").forEach((chip) => {
    on(chip, "click", () => {
      const name = chip.dataset.member;
      state.members = state.members.filter((m) => m !== name);
      renderMemberChips();
      renderMemberSearchResults();
    });
  });
}

function renderMemberSearchResults() {
  if (!refs.memberResults) return;

  const query = state.searchQuery.toLowerCase();
  const filtered = MOCK_MEMBERS.filter(
    (name) =>
      !state.members.includes(name) &&
      (query === "" || name.toLowerCase().includes(query))
  );

  if (!filtered.length) {
    refs.memberResults.innerHTML = `<p class="ui-demo-note" style="margin:8px 0 0;">No members found.</p>`;
    return;
  }

  refs.memberResults.innerHTML = filtered.map((name) => `
    <button type="button" class="ui-demo-option-button ms-member-result" data-member="${escapeHtml(name)}">
      ${escapeHtml(name)}
    </button>
  `).join("");

  refs.memberResults.querySelectorAll(".ms-member-result").forEach((btn) => {
    on(btn, "click", () => {
      const name = btn.dataset.member;
      if (!state.members.includes(name)) {
        state.members.push(name);
        renderMemberChips();
        renderMemberSearchResults();
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Step 3 — review
// ---------------------------------------------------------------------------

function renderReview() {
  if (!refs.reviewContent) return;

  const statusLabel = { active: "Active", draft: "Draft", paused: "Paused" }[state.status] ?? state.status;
  const memberList = state.members.length
    ? state.members.map((m) => escapeHtml(m)).join(", ")
    : "<em>No members added</em>";

  refs.reviewContent.innerHTML = `
    <div class="ms-review-section">
      <div class="ms-review-header">
        <strong>Project Details</strong>
        <button type="button" class="btn btn-secondary btn-sm" data-edit-step="1">Edit</button>
      </div>
      <div class="ms-review-row"><span class="ms-review-key">Name</span><span class="ms-review-val">${escapeHtml(state.projectName) || "<em>—</em>"}</span></div>
      <div class="ms-review-row"><span class="ms-review-key">Description</span><span class="ms-review-val">${escapeHtml(state.description) || "<em>—</em>"}</span></div>
      <div class="ms-review-row"><span class="ms-review-key">Status</span><span class="ms-review-val">${statusLabel}</span></div>
    </div>
    <div class="ms-review-section">
      <div class="ms-review-header">
        <strong>Team Members</strong>
        <button type="button" class="btn btn-secondary btn-sm" data-edit-step="2">Edit</button>
      </div>
      <div class="ms-review-row"><span class="ms-review-key">Members</span><span class="ms-review-val">${memberList}</span></div>
    </div>
  `;

  refs.reviewContent.querySelectorAll("[data-edit-step]").forEach((btn) => {
    on(btn, "click", () => {
      goToStep(Number(btn.dataset.editStep));
    });
  });
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function goToStep(step) {
  state.currentStep = step;
  showStep(step);
  buildStepIndicator();
  updateProgressBar();
  syncInputsFromState();

  if (step === 2) {
    renderMemberChips();
    renderMemberSearchResults();
  }

  if (step === 3) {
    renderReview();
    resetSubmitState();
  }
}

function syncInputsFromState() {
  if (refs.projectName) refs.projectName.value = state.projectName;
  if (refs.description) refs.description.value = state.description;
  if (refs.statusSelect) refs.statusSelect.value = state.status;
}

function resetSubmitState() {
  if (refs.submitBtn) {
    refs.submitBtn.disabled = false;
    refs.submitBtn.textContent = "Submit";
  }
  hide(refs.submitSuccess);
}

// ---------------------------------------------------------------------------
// Submit (step 3)
// ---------------------------------------------------------------------------

function handleSubmit() {
  if (!refs.submitBtn || refs.submitBtn.disabled) return;

  refs.submitBtn.disabled = true;
  refs.submitBtn.innerHTML = `<span class="ui-demo-spinner"></span> Submitting…`;

  window.setTimeout(() => {
    refs.submitBtn.disabled = false;
    refs.submitBtn.textContent = "Submit";
    show(refs.submitSuccess);
  }, 1500);
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function initMultiStepDemo() {
  const root = qs("[data-multi-step-demo]");
  if (!root) return;

  refs = {
    progressBar: qs("[data-ms-progress-bar]", root),
    progressLabel: qs("[data-ms-progress-label]", root),
    stepIndicator: qs("[data-ms-step-indicator]", root),

    step1Panel: qs("[data-ms-step='1']", root),
    step2Panel: qs("[data-ms-step='2']", root),
    step3Panel: qs("[data-ms-step='3']", root),

    // Step 1
    projectName: qs("[data-ms-project-name]", root),
    projectNameError: qs("[data-ms-project-name-error]", root),
    description: qs("[data-ms-description]", root),
    statusSelect: qs("[data-ms-status]", root),
    nextStep1Btn: qs("[data-ms-next-1]", root),

    // Step 2
    memberSearch: qs("[data-ms-member-search]", root),
    memberChips: qs("[data-ms-member-chips]", root),
    memberResults: qs("[data-ms-member-results]", root),
    backStep2Btn: qs("[data-ms-back-2]", root),
    nextStep2Btn: qs("[data-ms-next-2]", root),

    // Step 3
    reviewContent: qs("[data-ms-review-content]", root),
    backStep3Btn: qs("[data-ms-back-3]", root),
    submitBtn: qs("[data-ms-submit]", root),
    submitSuccess: qs("[data-ms-submit-success]", root),
  };

  // Step 1 — live validation on name
  on(refs.projectName, "input", () => {
    if (refs.projectName.value.trim().length >= 3) {
      clearError(refs.projectName, refs.projectNameError);
    }
  });

  on(refs.projectName, "blur", () => {
    readStep1();
    if (state.projectName) validateStep1();
  });

  on(refs.nextStep1Btn, "click", () => {
    if (validateStep1()) goToStep(2);
  });

  // Step 2 — member search
  on(refs.memberSearch, "input", () => {
    state.searchQuery = refs.memberSearch.value;
    renderMemberSearchResults();
  });

  on(refs.backStep2Btn, "click", () => {
    readStep1();
    goToStep(1);
  });

  on(refs.nextStep2Btn, "click", () => {
    goToStep(3);
  });

  // Step 3
  on(refs.backStep3Btn, "click", () => {
    goToStep(2);
  });

  on(refs.submitBtn, "click", handleSubmit);

  // Boot
  goToStep(1);
}

document.addEventListener("DOMContentLoaded", initMultiStepDemo);
