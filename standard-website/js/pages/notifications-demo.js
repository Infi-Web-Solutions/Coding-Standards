const TOAST_DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 5000,
};

const TOAST_ICONS = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const TOAST_LABELS = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

function getToastContainer() {
  return document.getElementById("toast-container");
}

function createToast(type, message) {
  const container = getToastContainer();
  if (!container) return;

  const typeClass = {
    success: "alert-success",
    error: "alert-danger",
    warning: "alert-warning",
    info: "alert-info",
  }[type] || "alert-info";

  const toast = document.createElement("div");
  toast.className = `alert ${typeClass}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.style.cssText = [
    "position: relative;",
    "box-shadow: 0 4px 16px rgba(0,0,0,0.12);",
    "opacity: 0;",
    "transform: translateX(40px);",
    "transition: opacity 0.2s ease, transform 0.2s ease;",
    "padding-right: 40px;",
  ].join("");

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.style.cssText = "margin-right: 8px; font-weight: 700;";
  icon.textContent = TOAST_ICONS[type] || "";

  const label = document.createElement("strong");
  label.style.cssText = "margin-right: 4px;";
  label.textContent = `${TOAST_LABELS[type]}: `;

  const text = document.createTextNode(message);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Dismiss notification");
  closeBtn.style.cssText = [
    "position: absolute;",
    "top: 50%;",
    "right: 10px;",
    "transform: translateY(-50%);",
    "background: none;",
    "border: none;",
    "cursor: pointer;",
    "font-size: 16px;",
    "line-height: 1;",
    "color: inherit;",
    "opacity: 0.6;",
    "padding: 4px;",
  ].join("");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => dismissToast(toast, timer));

  toast.appendChild(icon);
  toast.appendChild(label);
  toast.appendChild(text);
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    });
  });

  let isPaused = false;
  let startTime = Date.now();
  let remaining = TOAST_DURATIONS[type] || 5000;
  let timer = null;

  function startTimer() {
    timer = window.setTimeout(() => dismissToast(toast, timer), remaining);
  }

  function pauseTimer() {
    if (isPaused) return;
    isPaused = true;
    window.clearTimeout(timer);
    remaining -= Date.now() - startTime;
  }

  function resumeTimer() {
    if (!isPaused) return;
    isPaused = false;
    startTime = Date.now();
    startTimer();
  }

  toast.addEventListener("mouseenter", pauseTimer);
  toast.addEventListener("mouseleave", resumeTimer);

  startTimer();
}

function dismissToast(toast, timer) {
  window.clearTimeout(timer);
  toast.style.opacity = "0";
  toast.style.transform = "translateX(40px)";

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 220);
}

function initToastButtons() {
  const buttons = {
    "[data-demo-toast-success]": { type: "success", message: "Project saved successfully." },
    "[data-demo-toast-error]": { type: "error", message: "Failed to save project. Please try again." },
    "[data-demo-toast-warning]": { type: "warning", message: "Project saved, but 2 members could not be notified." },
    "[data-demo-toast-info]": { type: "info", message: "You are viewing read-only mode." },
  };

  Object.entries(buttons).forEach(([selector, config]) => {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.addEventListener("click", () => createToast(config.type, config.message));
    }
  });
}

function initInlineBannerDismiss() {
  document.querySelectorAll("[data-demo-banner-dismiss]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const banner = btn.closest(".alert");
      if (!banner) return;

      banner.style.transition = "opacity 0.2s ease";
      banner.style.opacity = "0";

      setTimeout(() => {
        banner.style.display = "none";
      }, 220);
    });
  });
}

function initNotificationsDemo() {
  initToastButtons();
  initInlineBannerDismiss();
}

document.addEventListener("DOMContentLoaded", initNotificationsDemo);
