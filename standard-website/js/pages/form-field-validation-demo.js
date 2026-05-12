import { on, qsa } from "../utils.js";

function getPasswordStrength(value) {
  let score = 0;

  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (value.length === 0) {
    return { label: "Enter a password", width: "0%", tone: "var(--color-border)" };
  }

  if (score <= 2) {
    return { label: "Weak", width: "28%", tone: "var(--color-danger)" };
  }

  if (score === 3 || score === 4) {
    return { label: "Good", width: "68%", tone: "var(--color-warning)" };
  }

  return { label: "Strong", width: "100%", tone: "var(--color-success)" };
}

function setError(input, errorNode, message) {
  if (!input || !errorNode) return;

  input.classList.add("ui-demo-input-error");
  errorNode.textContent = message;
  errorNode.classList.remove("ui-demo-hidden");
}

function clearError(input, errorNode) {
  if (!input || !errorNode) return;

  input.classList.remove("ui-demo-input-error");
  errorNode.textContent = "";
  errorNode.classList.add("ui-demo-hidden");
}

function validateNameField(input, errorNode) {
  const trimmed = input.value.trim();

  if (!trimmed) {
    setError(input, errorNode, "Full name is required.");
    return false;
  }

  if (trimmed.length < 2) {
    setError(input, errorNode, "Full name must be at least 2 characters.");
    return false;
  }

  if (trimmed.length > 100) {
    setError(input, errorNode, "Full name must be under 100 characters.");
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function validateEmailField(input, errorNode) {
  const trimmed = input.value.trim();
  const normalized = trimmed.toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmed) {
    setError(input, errorNode, "Email address is required.");
    return false;
  }

  if (trimmed.includes(" ")) {
    setError(input, errorNode, "Email address cannot contain spaces.");
    return false;
  }

  if (normalized.length > 254) {
    setError(input, errorNode, "Email address must be under 254 characters.");
    return false;
  }

  if (!emailPattern.test(normalized)) {
    setError(input, errorNode, "Enter a valid email address.");
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function getPasswordRuleMessage(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Password must include at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must include at least one lowercase letter.";
  if (!/\d/.test(value)) return "Password must include at least one number.";
  return "";
}

function validatePasswordField(input, errorNode) {
  const message = getPasswordRuleMessage(input.value);

  if (message) {
    setError(input, errorNode, message);
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function setConfirmStatus(node, text, state) {
  if (!node) return;

  node.textContent = text;
  node.classList.remove("ui-demo-note", "ui-demo-error", "ui-demo-success");
  node.classList.add(state);
}

function validateConfirmField(passwordInput, confirmInput, errorNode, statusNode) {
  if (!confirmInput.value) {
    setError(confirmInput, errorNode, "Confirm password is required.");
    setConfirmStatus(statusNode, "Confirm password is required.", "ui-demo-error");
    return false;
  }

  if (passwordInput.value !== confirmInput.value) {
    setError(confirmInput, errorNode, "Passwords must match exactly.");
    setConfirmStatus(statusNode, "Passwords do not match.", "ui-demo-error");
    return false;
  }

  clearError(confirmInput, errorNode);
  setConfirmStatus(statusNode, "Passwords match.", "ui-demo-success");
  return true;
}

function validatePhoneField(codeInput, phoneInput, errorNode) {
  const digits = phoneInput.value.replace(/\D/g, "");
  const expectedLengths = {
    "+91": 10,
    "+1": 10,
    "+44": 10,
  };
  const expectedLength = expectedLengths[codeInput.value] || 10;

  if (!digits) {
    setError(phoneInput, errorNode, "Phone number is required.");
    return false;
  }

  if (digits.length !== expectedLength) {
    setError(phoneInput, errorNode, `Phone number must be ${expectedLength} digits for ${codeInput.value}.`);
    return false;
  }

  clearError(phoneInput, errorNode);
  return true;
}

function parseCurrency(value) {
  const normalized = value.replace(/[^0-9.]/g, "");

  if (!normalized) return Number.NaN;
  if ((normalized.match(/\./g) || []).length > 1) return Number.NaN;

  return Number(normalized);
}

function validateQuantityField(input, errorNode) {
  const trimmed = input.value.trim();
  const value = Number(trimmed);

  if (!trimmed) {
    setError(input, errorNode, "Quantity is required.");
    return false;
  }

  if (!Number.isInteger(value) || value < 1) {
    setError(input, errorNode, "Quantity must be a whole number greater than 0.");
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function validatePriceField(input, errorNode) {
  const trimmed = input.value.trim();
  const value = parseCurrency(trimmed);

  if (!trimmed) {
    setError(input, errorNode, "Price is required.");
    return false;
  }

  if (Number.isNaN(value) || value <= 0) {
    setError(input, errorNode, "Enter a valid price greater than 0.");
    return false;
  }

  if (!/^\$?\s?\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\$?\s?\d+(\.\d{1,2})?$/.test(trimmed)) {
    setError(input, errorNode, "Price must use a valid currency format with up to 2 decimals.");
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function validateDateField(input, errorNode) {
  if (!input.value) {
    setError(input, errorNode, "Start date is required.");
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function validatePercentageField(input, errorNode) {
  const trimmed = input.value.trim();
  const value = Number(trimmed);

  if (!trimmed) {
    setError(input, errorNode, "Percentage is required.");
    return false;
  }

  if (!Number.isFinite(value) || value < 0 || value > 100) {
    setError(input, errorNode, "Percentage must be between 0 and 100.");
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function validateColorField(input, errorNode) {
  const trimmed = input.value.trim().toUpperCase();
  const hexPattern = /^#[0-9A-F]{6}$/;

  if (!hexPattern.test(trimmed)) {
    setError(input, errorNode, "Enter a valid 6-digit hex color like #0C5ADB.");
    return false;
  }

  input.value = trimmed;
  clearError(input, errorNode);
  return true;
}

function initOtpDemo(inputs, errorNode) {
  if (!inputs.length || !errorNode) return;

  function syncOtpValidation() {
    const isComplete = inputs.every((input) => /^\d$/.test(input.value));

    if (!isComplete) {
      setError(inputs[0], errorNode, "Enter the full 6-digit verification code.");
      return false;
    }

    inputs.forEach((input) => input.classList.remove("ui-demo-input-error"));
    errorNode.textContent = "";
    errorNode.classList.add("ui-demo-hidden");
    return true;
  }

  inputs.forEach((input, index) => {
    on(input, "input", (event) => {
      const digits = event.target.value.replace(/\D/g, "");
      event.target.value = digits ? digits.slice(-1) : "";

      if (event.target.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
        inputs[index + 1].select();
      }

      syncOtpValidation();
    });

    on(input, "keydown", (event) => {
      if (event.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].value = "";
        syncOtpValidation();
      }

      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        inputs[index - 1].focus();
      }

      if (event.key === "ArrowRight" && index < inputs.length - 1) {
        event.preventDefault();
        inputs[index + 1].focus();
      }
    });

    on(input, "paste", (event) => {
      event.preventDefault();
      const pastedDigits = (event.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, inputs.length);

      if (!pastedDigits) {
        syncOtpValidation();
        return;
      }

      inputs.forEach((otpInput, otpIndex) => {
        otpInput.value = pastedDigits[otpIndex] || "";
      });

      const focusIndex = Math.min(pastedDigits.length, inputs.length) - 1;
      inputs[Math.max(focusIndex, 0)].focus();
      syncOtpValidation();
    });

    on(input, "blur", syncOtpValidation);
    input.setAttribute("maxlength", "1");
  });

  syncOtpValidation();
}

function initSearchDemo(input, loadingNode, resultsNode) {
  if (!input || !loadingNode || !resultsNode) return;

  let searchTimer = null;

  function renderSearchState() {
    const query = input.value.trim();

    loadingNode.classList.remove("ui-demo-hidden");
    resultsNode.classList.add("ui-demo-hidden");

    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      loadingNode.classList.add("ui-demo-hidden");
      resultsNode.classList.remove("ui-demo-hidden");

      if (!query) {
        resultsNode.innerHTML = '<div class="ui-demo-note">Start typing to search projects.</div>';
        return;
      }

      resultsNode.innerHTML = `<div class="ui-demo-note">Results for "${query}": ${query} Workspace, ${query} Dashboard, ${query} Archive</div>`;
    }, 250);
  }

  on(input, "input", renderSearchState);
  renderSearchState();
}

function initMultiSelectDemo(optionButtons, selectedContainer) {
  if (!optionButtons.length || !selectedContainer) return;

  const labelsByValue = Object.fromEntries(
    optionButtons.map((button) => [button.dataset.demoMultiselectOption, button.textContent.trim()])
  );

  function renderSelectedChips() {
    const selectedValues = optionButtons
      .filter((button) => button.classList.contains("is-selected"))
      .map((button) => button.dataset.demoMultiselectOption);

    selectedContainer.innerHTML = "";

    selectedValues.forEach((value) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ui-demo-chip ui-demo-chip-removable";
      chip.dataset.demoMultiselectChip = value;
      chip.innerHTML = `${labelsByValue[value]} <span aria-hidden="true">×</span>`;
      selectedContainer.appendChild(chip);
    });
  }

  optionButtons.forEach((button) => {
    on(button, "click", () => {
      button.classList.toggle("is-selected");
      renderSelectedChips();
    });
  });

  on(selectedContainer, "click", (event) => {
    const chip = event.target.closest("[data-demo-multiselect-chip]");

    if (!chip) return;

    const value = chip.dataset.demoMultiselectChip;
    const matchingButton = optionButtons.find((button) => button.dataset.demoMultiselectOption === value);

    if (matchingButton) {
      matchingButton.classList.remove("is-selected");
      renderSelectedChips();
    }
  });

  renderSelectedChips();
}

function formatFileSize(size) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function getFileExtension(filename) {
  const parts = String(filename || "").toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function initUploadDemo(config) {
  const {
    input,
    dropzone,
    chooseButton,
    successButton,
    failButton,
    clearButton,
    summary,
    nameNode,
    metaNode,
    statusNode,
    progressTrack,
    progressBar,
    errorNode,
  } = config;

  if (
    !input ||
    !dropzone ||
    !chooseButton ||
    !successButton ||
    !failButton ||
    !clearButton ||
    !summary ||
    !nameNode ||
    !metaNode ||
    !statusNode ||
    !progressTrack ||
    !progressBar ||
    !errorNode
  ) {
    return;
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "application/pdf"]);
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "pdf"]);
  const maxSize = 5 * 1024 * 1024;
  const sampleFile = {
    name: "requirements.pdf",
    type: "application/pdf",
    size: 1.4 * 1024 * 1024,
  };
  let activeFile = null;
  let progressTimer = null;

  function clearUploadTimer() {
    if (progressTimer) {
      window.clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function setUploadError(message) {
    errorNode.textContent = message;
    errorNode.classList.remove("ui-demo-hidden");
  }

  function clearUploadError() {
    errorNode.textContent = "";
    errorNode.classList.add("ui-demo-hidden");
  }

  function setSummaryState(message = "", toneClass = "") {
    statusNode.textContent = message;
    statusNode.classList.remove("ui-demo-hidden", "ui-demo-status-error", "ui-demo-status-success");

    if (!message) {
      statusNode.classList.add("ui-demo-hidden");
      return;
    }

    if (toneClass) {
      statusNode.classList.add(toneClass);
    }
  }

  function resetProgress() {
    progressBar.style.width = "0%";
    progressTrack.classList.add("ui-demo-hidden");
  }

  function renderFileSummary(file) {
    summary.classList.remove("ui-demo-hidden");
    clearButton.classList.remove("ui-demo-hidden");
    nameNode.textContent = file.name;
    metaNode.textContent = `${file.type || "Unknown type"}, ${formatFileSize(file.size)}`;
  }

  function resetUploadDemo() {
    clearUploadTimer();
    activeFile = null;
    input.value = "";
    nameNode.textContent = "No file selected";
    metaNode.textContent = "";
    summary.classList.add("ui-demo-hidden");
    clearButton.classList.add("ui-demo-hidden");
    clearUploadError();
    setSummaryState("");
    resetProgress();
  }

  function validateFile(file) {
    if (!file) {
      setUploadError("Choose a file before uploading.");
      return false;
    }

    const extension = getFileExtension(file.name);
    const hasValidType = allowedTypes.has(file.type);
    const hasValidExtension = allowedExtensions.has(extension);

    if (!hasValidType && !hasValidExtension) {
      setUploadError("Only JPG, PNG, and PDF files are allowed.");
      return false;
    }

    if (file.size > maxSize) {
      setUploadError("File must be 5 MB or smaller.");
      return false;
    }

    clearUploadError();
    return true;
  }

  function setActiveFile(file) {
    if (!validateFile(file)) {
      activeFile = null;
      summary.classList.add("ui-demo-hidden");
      clearButton.classList.add("ui-demo-hidden");
      setSummaryState("");
      resetProgress();
      return;
    }

    activeFile = file;
    renderFileSummary(file);
    setSummaryState("Ready to upload.");
    resetProgress();
  }

  function ensureActiveFile() {
    if (activeFile) {
      return true;
    }

    setActiveFile(sampleFile);
    return Boolean(activeFile);
  }

  function simulateUpload(mode) {
    if (!ensureActiveFile()) {
      setUploadError("Choose a valid file first.");
      return;
    }

    clearUploadError();
    clearUploadTimer();
    progressTrack.classList.remove("ui-demo-hidden");
    progressBar.style.width = "0%";
    setSummaryState("Uploading...");

    let progress = 0;

    progressTimer = window.setInterval(() => {
      progress += 20;
      progressBar.style.width = `${Math.min(progress, 100)}%`;

      if (progress >= 100) {
        clearUploadTimer();

        if (mode === "success") {
          setSummaryState("Upload completed successfully.", "ui-demo-status-success");
          return;
        }

        setSummaryState("Upload failed. Retry or choose another file.", "ui-demo-status-error");
        setUploadError("Network error: upload could not be completed.");
      }
    }, 180);
  }

  on(chooseButton, "click", () => input.click());
  on(successButton, "click", () => simulateUpload("success"));
  on(failButton, "click", () => simulateUpload("fail"));
  on(clearButton, "click", resetUploadDemo);

  on(input, "change", () => {
    const [file] = input.files || [];
    setActiveFile(file);
  });

  on(dropzone, "click", () => input.click());
  on(dropzone, "keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });

  on(dropzone, "dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  });

  on(dropzone, "dragleave", () => {
    dropzone.classList.remove("is-dragover");
  });

  on(dropzone, "drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
    const [file] = event.dataTransfer?.files || [];
    setActiveFile(file);
  });

  resetUploadDemo();
}

function initFormFieldValidationDemo() {
  const nameInput = document.querySelector("[data-demo-name]");
  const nameError = document.querySelector("[data-demo-name-error]");
  const emailInput = document.querySelector("[data-demo-email]");
  const emailError = document.querySelector("[data-demo-email-error]");
  const passwordInput = document.querySelector("[data-demo-password]");
  const passwordError = document.querySelector("[data-demo-password-error]");
  const confirmInput = document.querySelector("[data-demo-confirm-password]");
  const confirmError = document.querySelector("[data-demo-confirm-error]");
  const meter = document.querySelector("[data-demo-password-meter]");
  const status = document.querySelector("[data-demo-password-status]");
  const confirmStatus = document.querySelector("[data-demo-confirm-status]");
  const phoneCodeInput = document.querySelector("[data-demo-phone-code]");
  const phoneInput = document.querySelector("[data-demo-phone]");
  const phoneError = document.querySelector("[data-demo-phone-error]");
  const quantityInput = document.querySelector("[data-demo-quantity]");
  const quantityError = document.querySelector("[data-demo-quantity-error]");
  const priceInput = document.querySelector("[data-demo-price]");
  const priceError = document.querySelector("[data-demo-price-error]");
  const dateInput = document.querySelector("[data-demo-date]");
  const dateError = document.querySelector("[data-demo-date-error]");
  const searchInput = document.querySelector("[data-demo-search]");
  const searchLoading = document.querySelector("[data-demo-search-loading]");
  const searchResults = document.querySelector("[data-demo-search-results]");
  const otpInputs = qsa("[data-demo-otp]");
  const otpError = document.querySelector("[data-demo-otp-error]");
  const multiSelectOptions = qsa("[data-demo-multiselect-option]");
  const multiSelectSelected = document.querySelector("[data-demo-multiselect-selected]");
  const uploadInput = document.querySelector("[data-demo-upload-input]");
  const uploadDropzone = document.querySelector("[data-demo-upload-dropzone]");
  const uploadChooseButton = document.querySelector("[data-demo-upload-choose]");
  const uploadSuccessButton = document.querySelector("[data-demo-upload-success]");
  const uploadFailButton = document.querySelector("[data-demo-upload-fail]");
  const uploadClearButton = document.querySelector("[data-demo-upload-clear]");
  const uploadSummary = document.querySelector("[data-demo-upload-summary]");
  const uploadName = document.querySelector("[data-demo-upload-name]");
  const uploadMeta = document.querySelector("[data-demo-upload-meta]");
  const uploadStatus = document.querySelector("[data-demo-upload-status]");
  const uploadProgressTrack = document.querySelector("[data-demo-upload-progress-track]");
  const uploadProgressBar = document.querySelector("[data-demo-upload-progress-bar]");
  const uploadError = document.querySelector("[data-demo-upload-error]");
  const percentageInput = document.querySelector("[data-demo-percentage]");
  const percentageError = document.querySelector("[data-demo-percentage-error]");
  const colorPickerInput = document.querySelector("[data-demo-color-picker]");
  const colorTextInput = document.querySelector("[data-demo-color-text]");
  const colorError = document.querySelector("[data-demo-color-error]");
  const toggleButtons = qsa("[data-demo-toggle-password]");

  if (
    !nameInput ||
    !nameError ||
    !emailInput ||
    !emailError ||
    !passwordInput ||
    !passwordError ||
    !confirmInput ||
    !confirmError ||
    !meter ||
    !status ||
    !confirmStatus ||
    !phoneCodeInput ||
    !phoneInput ||
    !phoneError ||
    !quantityInput ||
    !quantityError ||
    !priceInput ||
    !priceError ||
    !dateInput ||
    !dateError ||
    !searchInput ||
    !searchLoading ||
    !searchResults ||
    !otpInputs.length ||
    !otpError ||
    !multiSelectOptions.length ||
    !multiSelectSelected ||
    !uploadInput ||
    !uploadDropzone ||
    !uploadChooseButton ||
    !uploadSuccessButton ||
    !uploadFailButton ||
    !uploadClearButton ||
    !uploadSummary ||
    !uploadName ||
    !uploadMeta ||
    !uploadStatus ||
    !uploadProgressTrack ||
    !uploadProgressBar ||
    !uploadError ||
    !percentageInput ||
    !percentageError ||
    !colorPickerInput ||
    !colorTextInput ||
    !colorError
  ) {
    return;
  }

  function syncStrength() {
    const { label, width, tone } = getPasswordStrength(passwordInput.value);
    meter.style.width = width;
    meter.style.background = tone;
    status.textContent = `Strength: ${label}`;
  }

  function syncPasswordGroup() {
    syncStrength();
    validatePasswordField(passwordInput, passwordError);
    validateConfirmField(passwordInput, confirmInput, confirmError, confirmStatus);
  }

  toggleButtons.forEach((button) => {
    on(button, "click", () => {
      const targetId = button.getAttribute("data-demo-toggle-password");
      const target = document.getElementById(targetId);

      if (!target) return;

      const nextType = target.type === "password" ? "text" : "password";
      target.type = nextType;
      button.textContent = nextType === "password" ? "Show" : "Hide";
    });
  });

  on(nameInput, "input", () => validateNameField(nameInput, nameError));
  on(nameInput, "blur", () => {
    nameInput.value = nameInput.value.trim();
    validateNameField(nameInput, nameError);
  });

  on(emailInput, "input", () => validateEmailField(emailInput, emailError));
  on(emailInput, "blur", () => {
    emailInput.value = emailInput.value.trim().toLowerCase();
    validateEmailField(emailInput, emailError);
  });

  on(passwordInput, "input", () => {
    syncPasswordGroup();
  });
  on(passwordInput, "blur", syncPasswordGroup);

  on(confirmInput, "input", () => validateConfirmField(passwordInput, confirmInput, confirmError, confirmStatus));
  on(confirmInput, "blur", () => validateConfirmField(passwordInput, confirmInput, confirmError, confirmStatus));

  on(phoneInput, "input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "");
    validatePhoneField(phoneCodeInput, phoneInput, phoneError);
  });
  on(phoneInput, "blur", () => validatePhoneField(phoneCodeInput, phoneInput, phoneError));
  on(phoneCodeInput, "change", () => validatePhoneField(phoneCodeInput, phoneInput, phoneError));

  on(quantityInput, "input", () => validateQuantityField(quantityInput, quantityError));
  on(quantityInput, "blur", () => validateQuantityField(quantityInput, quantityError));

  on(priceInput, "input", () => validatePriceField(priceInput, priceError));
  on(priceInput, "blur", () => validatePriceField(priceInput, priceError));

  on(dateInput, "input", () => validateDateField(dateInput, dateError));
  on(dateInput, "blur", () => validateDateField(dateInput, dateError));

  on(percentageInput, "input", () => validatePercentageField(percentageInput, percentageError));
  on(percentageInput, "blur", () => validatePercentageField(percentageInput, percentageError));

  on(colorPickerInput, "input", () => {
    colorTextInput.value = colorPickerInput.value.toUpperCase();
    validateColorField(colorTextInput, colorError);
  });

  on(colorTextInput, "input", () => validateColorField(colorTextInput, colorError));
  on(colorTextInput, "blur", () => {
    if (validateColorField(colorTextInput, colorError)) {
      colorPickerInput.value = colorTextInput.value.toLowerCase();
    }
  });

  validateNameField(nameInput, nameError);
  validateEmailField(emailInput, emailError);
  syncPasswordGroup();
  validatePhoneField(phoneCodeInput, phoneInput, phoneError);
  validateQuantityField(quantityInput, quantityError);
  validatePriceField(priceInput, priceError);
  validateDateField(dateInput, dateError);
  validatePercentageField(percentageInput, percentageError);
  validateColorField(colorTextInput, colorError);
  initOtpDemo(otpInputs, otpError);
  initSearchDemo(searchInput, searchLoading, searchResults);
  initMultiSelectDemo(multiSelectOptions, multiSelectSelected);
  initUploadDemo({
    input: uploadInput,
    dropzone: uploadDropzone,
    chooseButton: uploadChooseButton,
    successButton: uploadSuccessButton,
    failButton: uploadFailButton,
    clearButton: uploadClearButton,
    summary: uploadSummary,
    nameNode: uploadName,
    metaNode: uploadMeta,
    statusNode: uploadStatus,
    progressTrack: uploadProgressTrack,
    progressBar: uploadProgressBar,
    errorNode: uploadError,
  });
}

document.addEventListener("DOMContentLoaded", initFormFieldValidationDemo);
