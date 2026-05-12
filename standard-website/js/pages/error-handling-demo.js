import { on, qs } from "../utils.js";

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function show(el) {
  if (el) el.classList.remove("ui-demo-hidden");
}

function hide(el) {
  if (el) el.classList.add("ui-demo-hidden");
}

// ---------------------------------------------------------------------------
// Demo 1 — Field-Level Error
// ---------------------------------------------------------------------------

function initFieldErrorDemo() {
  const root = qs("[data-field-error-demo]");
  if (!root) return;

  const emailInput = qs("[data-fe-email]", root);
  const emailError = qs("[data-fe-email-error]", root);
  const triggerBtn = qs("[data-fe-trigger]", root);
  const clearBtn = qs("[data-fe-clear]", root);

  if (!emailInput || !emailError || !triggerBtn || !clearBtn) return;

  on(triggerBtn, "click", () => {
    emailInput.classList.add("ui-demo-input-error");
    emailError.textContent = "Email address is already in use.";
    show(emailError);
  });

  on(clearBtn, "click", () => {
    emailInput.classList.remove("ui-demo-input-error");
    emailError.textContent = "";
    hide(emailError);
  });

  on(emailInput, "input", () => {
    if (emailInput.classList.contains("ui-demo-input-error")) {
      emailInput.classList.remove("ui-demo-input-error");
      emailError.textContent = "";
      hide(emailError);
    }
  });
}

// ---------------------------------------------------------------------------
// Demo 2 — Form Banner Error
// ---------------------------------------------------------------------------

function initFormBannerDemo() {
  const root = qs("[data-form-banner-demo]");
  if (!root) return;

  const triggerBtn = qs("[data-fb-trigger]", root);
  const banner = qs("[data-fb-banner]", root);
  const dismissBtn = qs("[data-fb-dismiss]", root);

  if (!triggerBtn || !banner || !dismissBtn) return;

  on(triggerBtn, "click", () => {
    show(banner);
  });

  on(dismissBtn, "click", () => {
    hide(banner);
  });
}

// ---------------------------------------------------------------------------
// Demo 3 — Page-Level Error
// ---------------------------------------------------------------------------

function initPageErrorDemo() {
  const root = qs("[data-page-error-demo]");
  if (!root) return;

  const normalState = qs("[data-pe-normal]", root);
  const errorState = qs("[data-pe-error]", root);
  const networkState = qs("[data-pe-network]", root);

  const showNormalBtn = qs("[data-pe-show-normal]", root);
  const showErrorBtn = qs("[data-pe-show-error]", root);
  const showNetworkBtn = qs("[data-pe-show-network]", root);
  const retryBtn = qs("[data-pe-retry]", root);
  const retryNetworkBtn = qs("[data-pe-retry-network]", root);

  if (!normalState || !errorState || !networkState) return;

  function showNormal() {
    show(normalState);
    hide(errorState);
    hide(networkState);
  }

  function showError() {
    hide(normalState);
    show(errorState);
    hide(networkState);
  }

  function showNetwork() {
    hide(normalState);
    hide(errorState);
    show(networkState);
  }

  on(showNormalBtn, "click", showNormal);
  on(showErrorBtn, "click", showError);
  on(showNetworkBtn, "click", showNetwork);

  on(retryBtn, "click", () => {
    if (retryBtn) {
      retryBtn.disabled = true;
      retryBtn.textContent = "Retrying…";
      window.setTimeout(() => {
        retryBtn.disabled = false;
        retryBtn.textContent = "Retry";
        showNormal();
      }, 1200);
    }
  });

  on(retryNetworkBtn, "click", () => {
    if (retryNetworkBtn) {
      retryNetworkBtn.disabled = true;
      retryNetworkBtn.textContent = "Checking…";
      window.setTimeout(() => {
        retryNetworkBtn.disabled = false;
        retryNetworkBtn.textContent = "Try Again";
        showNormal();
      }, 1200);
    }
  });

  // Default state
  showNormal();
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function initErrorHandlingDemo() {
  initFieldErrorDemo();
  initFormBannerDemo();
  initPageErrorDemo();
}

document.addEventListener("DOMContentLoaded", initErrorHandlingDemo);
