function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.disabled && !el.closest("[hidden]"));
}

function trapFocus(container, event) {
  const focusable = getFocusableElements(container);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function openModal(backdrop, triggerButton) {
  backdrop.classList.add("active");
  document.body.style.overflow = "hidden";

  const modal = backdrop.querySelector(".modal");
  if (modal) {
    const focusable = getFocusableElements(modal);
    if (focusable.length) {
      focusable[0].focus();
    }
  }

  backdrop._triggerButton = triggerButton || null;
}

function closeModal(backdrop) {
  backdrop.classList.remove("active");
  document.body.style.overflow = "";

  if (backdrop._triggerButton) {
    backdrop._triggerButton.focus();
    backdrop._triggerButton = null;
  }
}

function setButtonLoading(button, loading, originalText) {
  if (loading) {
    button.disabled = true;
    button.innerHTML = `<span class="ui-demo-spinner" style="vertical-align: middle; margin-right: 6px;"></span> ${originalText}`;
  } else {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function initConfirmModal() {
  const openBtn = document.querySelector("[data-demo-open-confirm]");
  const backdrop = document.querySelector("[data-demo-confirm-modal]");

  if (!openBtn || !backdrop) return;

  const modal = backdrop.querySelector(".modal");
  const cancelBtn = backdrop.querySelector("[data-demo-confirm-cancel]");
  const deleteBtn = backdrop.querySelector("[data-demo-confirm-delete]");

  if (!modal || !cancelBtn || !deleteBtn) return;

  function close() {
    closeModal(backdrop);
  }

  openBtn.addEventListener("click", () => {
    openModal(backdrop, openBtn);
  });

  cancelBtn.addEventListener("click", close);

  deleteBtn.addEventListener("click", () => {
    setButtonLoading(deleteBtn, true, "Delete");
    cancelBtn.disabled = true;

    setTimeout(() => {
      setButtonLoading(deleteBtn, false, "Delete");
      cancelBtn.disabled = false;
      close();
    }, 1500);
  });

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop && !deleteBtn.disabled) {
      close();
    }
  });

  backdrop.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteBtn.disabled) {
      close();
    }
    if (event.key === "Tab") {
      trapFocus(modal, event);
    }
  });
}

function initFormModal() {
  const openBtn = document.querySelector("[data-demo-open-form]");
  const backdrop = document.querySelector("[data-demo-form-modal]");

  if (!openBtn || !backdrop) return;

  const modal = backdrop.querySelector(".modal");
  const titleInput = backdrop.querySelector("[data-demo-form-title]");
  const titleError = backdrop.querySelector("[data-demo-form-title-error]");
  const cancelBtn = backdrop.querySelector("[data-demo-form-cancel]");
  const saveBtn = backdrop.querySelector("[data-demo-form-save]");
  const errorAlert = backdrop.querySelector("[data-demo-form-error-alert]");
  const triggerErrorBtn = backdrop.querySelector("[data-demo-form-trigger-error]");

  if (!modal || !titleInput || !titleError || !cancelBtn || !saveBtn || !errorAlert || !triggerErrorBtn) return;

  let isSaving = false;

  function resetForm() {
    titleInput.value = "";
    titleInput.classList.remove("ui-demo-input-error");
    titleError.textContent = "";
    titleError.classList.add("ui-demo-hidden");
    backdrop.querySelector("[data-demo-form-desc]").value = "";
    errorAlert.classList.add("ui-demo-hidden");
  }

  function close() {
    if (isSaving) return;
    closeModal(backdrop);
    resetForm();
  }

  function validateTitle() {
    const value = titleInput.value.trim();
    if (!value) {
      titleInput.classList.add("ui-demo-input-error");
      titleError.textContent = "Project title is required.";
      titleError.classList.remove("ui-demo-hidden");
      return false;
    }
    titleInput.classList.remove("ui-demo-input-error");
    titleError.textContent = "";
    titleError.classList.add("ui-demo-hidden");
    return true;
  }

  openBtn.addEventListener("click", () => {
    openModal(backdrop, openBtn);
  });

  cancelBtn.addEventListener("click", close);

  titleInput.addEventListener("input", () => {
    if (!titleInput.classList.contains("ui-demo-input-error")) return;
    validateTitle();
  });

  titleInput.addEventListener("blur", validateTitle);

  saveBtn.addEventListener("click", () => {
    if (!validateTitle()) return;
    if (isSaving) return;

    isSaving = true;
    errorAlert.classList.add("ui-demo-hidden");
    setButtonLoading(saveBtn, true, "Save");
    cancelBtn.disabled = true;
    triggerErrorBtn.disabled = true;

    setTimeout(() => {
      isSaving = false;
      setButtonLoading(saveBtn, false, "Save");
      cancelBtn.disabled = false;
      triggerErrorBtn.disabled = false;
      close();
    }, 1500);
  });

  triggerErrorBtn.addEventListener("click", () => {
    if (isSaving) return;
    errorAlert.classList.remove("ui-demo-hidden");
    errorAlert.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop && !isSaving) {
      close();
    }
  });

  backdrop.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !isSaving) {
      close();
    }
    if (event.key === "Tab") {
      trapFocus(modal, event);
    }
  });
}

function initModalsDemo() {
  initConfirmModal();
  initFormModal();
}

document.addEventListener("DOMContentLoaded", initModalsDemo);
