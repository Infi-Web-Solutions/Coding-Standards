import { on, qsa } from "../utils.js";

function setError(input, node, message) {
  if (input) input.classList.add("ui-demo-input-error");
  if (!node) return;
  node.textContent = message;
  node.classList.remove("ui-demo-hidden");
}

function clearError(input, node) {
  if (input) input.classList.remove("ui-demo-input-error");
  if (!node) return;
  node.textContent = "";
  node.classList.add("ui-demo-hidden");
}

function setBanner(node, message, tone = "error") {
  if (!node) return;
  node.textContent = message;
  node.classList.remove("ui-demo-hidden", "ui-demo-success");
  if (tone === "success") {
    node.classList.add("ui-demo-success");
  }
}

function clearBanner(node) {
  if (!node) return;
  node.textContent = "";
  node.classList.add("ui-demo-hidden");
  node.classList.remove("ui-demo-success");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (!value) return { label: "Enter a password", width: "0%", tone: "var(--color-border)" };
  if (score <= 2) return { label: "Weak", width: "30%", tone: "var(--color-danger)" };
  if (score <= 4) return { label: "Fair", width: "68%", tone: "var(--color-warning)" };
  return { label: "Strong", width: "100%", tone: "var(--color-success)" };
}

function updateStrength(input, meter, status) {
  const { label, width, tone } = getPasswordStrength(input.value);
  meter.style.width = width;
  meter.style.background = tone;
  status.textContent = `Strength: ${label}`;
}

function validateRequiredEmail(input, errorNode, requiredMessage = "Email is required.") {
  const value = input.value.trim().toLowerCase();
  input.value = value;

  if (!value) {
    setError(input, errorNode, requiredMessage);
    return false;
  }

  if (!isValidEmail(value)) {
    setError(input, errorNode, "Enter a valid email address.");
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function validatePasswordPresence(input, errorNode, label = "Password") {
  if (!input.value) {
    setError(input, errorNode, `${label} is required.`);
    return false;
  }

  clearError(input, errorNode);
  return true;
}

function startButtonLoading(button, label) {
  button.disabled = true;
  button.innerHTML = `<span class="ui-demo-spinner"></span> ${label}`;
}

function stopButtonLoading(button, label) {
  button.disabled = false;
  button.textContent = label;
}

function initPasswordToggles() {
  qsa("[data-demo-toggle-password]").forEach((button) => {
    on(button, "click", () => {
      const target = document.getElementById(button.getAttribute("data-demo-toggle-password"));
      if (!target) return;
      const nextType = target.type === "password" ? "text" : "password";
      target.type = nextType;
      button.textContent = nextType === "password" ? "Show" : "Hide";
    });
  });
}

function initLoginDemo() {
  const email = document.querySelector("[data-demo-login-email]");
  const emailError = document.querySelector("[data-demo-login-email-error]");
  const password = document.querySelector("[data-demo-login-password]");
  const passwordError = document.querySelector("[data-demo-login-password-error]");
  const banner = document.querySelector("[data-demo-login-banner]");
  const submit = document.querySelector("[data-demo-login-submit]");
  const google = document.querySelector("[data-demo-google-login]");
  const microsoft = document.querySelector("[data-demo-microsoft-login]");
  const openForgot = document.querySelector("[data-demo-open-forgot]");

  if (!email || !emailError || !password || !passwordError || !banner || !submit || !google || !microsoft || !openForgot) return;

  function validate() {
    const okEmail = validateRequiredEmail(email, emailError);
    const okPassword = validatePasswordPresence(password, passwordError);
    return okEmail && okPassword;
  }

  on(email, "blur", () => validateRequiredEmail(email, emailError));
  on(email, "input", () => {
    clearBanner(banner);
    validateRequiredEmail(email, emailError);
  });
  on(password, "blur", () => validatePasswordPresence(password, passwordError));
  on(password, "input", () => {
    clearBanner(banner);
    validatePasswordPresence(password, passwordError);
  });

  on(submit, "click", () => {
    clearBanner(banner);
    if (!validate()) return;

    startButtonLoading(submit, "Signing in...");

    window.setTimeout(() => {
      stopButtonLoading(submit, "Log In");
      const value = email.value.trim().toLowerCase();

      if (value === "locked@example.com") {
        setBanner(banner, "Too many failed attempts. Try again in 30 minutes.");
        return;
      }

      if (value === "suspended@example.com") {
        setBanner(banner, "Your account has been suspended. Contact support.");
        return;
      }

      if (value !== "user@example.com" || password.value !== "SecretPass1!") {
        setBanner(banner, "Incorrect email or password.");
        return;
      }

      setBanner(banner, "Success: redirecting to your dashboard...", "success");
    }, 800);
  });

  function runOAuth(provider, outcome) {
    clearBanner(banner);
    const button = provider === "google" ? google : microsoft;
    startButtonLoading(button, "Connecting...");

    window.setTimeout(() => {
      stopButtonLoading(button, provider === "google" ? "Continue with Google" : "Continue with Microsoft");
      if (outcome === "success") {
        setBanner(banner, `${provider[0].toUpperCase()}${provider.slice(1)} login succeeded. Redirecting...`, "success");
      } else {
        setBanner(banner, `Could not connect to ${provider[0].toUpperCase()}${provider.slice(1)}. Try again or use email.`);
      }
    }, 700);
  }

  on(google, "click", () => runOAuth("google", "success"));
  on(microsoft, "click", () => runOAuth("microsoft", "error"));
  on(openForgot, "click", () => document.getElementById("forgot-email")?.focus());
}

function validateName(input, node, label) {
  const value = input.value.trim();
  input.value = value;

  if (!value) {
    setError(input, node, `${label} is required.`);
    return false;
  }

  if (!/^[A-Za-z' -]+$/.test(value)) {
    setError(input, node, `${label} can only include letters, spaces, hyphens, and apostrophes.`);
    return false;
  }

  if (value.length > 100) {
    setError(input, node, `${label} must be under 100 characters.`);
    return false;
  }

  clearError(input, node);
  return true;
}

function validateSignupPassword(input, node) {
  const value = input.value;
  if (!value) {
    setError(input, node, "Password is required.");
    return false;
  }
  if (!(value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value))) {
    setError(input, node, "Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
    return false;
  }
  clearError(input, node);
  return true;
}

function initSignupDemo() {
  const firstName = document.querySelector("[data-demo-signup-first-name]");
  const firstNameError = document.querySelector("[data-demo-signup-first-name-error]");
  const lastName = document.querySelector("[data-demo-signup-last-name]");
  const lastNameError = document.querySelector("[data-demo-signup-last-name-error]");
  const email = document.querySelector("[data-demo-signup-email]");
  const emailError = document.querySelector("[data-demo-signup-email-error]");
  const password = document.querySelector("[data-demo-signup-password]");
  const passwordError = document.querySelector("[data-demo-signup-password-error]");
  const confirm = document.querySelector("[data-demo-signup-confirm-password]");
  const confirmError = document.querySelector("[data-demo-signup-confirm-password-error]");
  const phone = document.querySelector("[data-demo-signup-phone]");
  const phoneError = document.querySelector("[data-demo-signup-phone-error]");
  const terms = document.querySelector("[data-demo-signup-terms]");
  const termsError = document.querySelector("[data-demo-signup-terms-error]");
  const banner = document.querySelector("[data-demo-signup-banner]");
  const submit = document.querySelector("[data-demo-signup-submit]");
  const meter = document.querySelector("[data-demo-signup-password-meter]");
  const status = document.querySelector("[data-demo-signup-password-status]");

  if (!firstName || !firstNameError || !lastName || !lastNameError || !email || !emailError || !password || !passwordError || !confirm || !confirmError || !phone || !phoneError || !terms || !termsError || !banner || !submit || !meter || !status) return;

  function validateConfirm() {
    if (!confirm.value) {
      setError(confirm, confirmError, "Confirm password is required.");
      return false;
    }
    if (confirm.value !== password.value) {
      setError(confirm, confirmError, "Passwords do not match.");
      return false;
    }
    clearError(confirm, confirmError);
    return true;
  }

  function validatePhone() {
    const digits = phone.value.replace(/\D/g, "");
    phone.value = digits;
    if (!digits) {
      clearError(phone, phoneError);
      return true;
    }
    if (digits.length !== 10) {
      setError(phone, phoneError, "Phone number must be 10 digits.");
      return false;
    }
    clearError(phone, phoneError);
    return true;
  }

  function validateTerms() {
    if (!terms.checked) {
      setError(null, termsError, "You must accept the Terms & Conditions to continue.");
      return false;
    }
    clearError(null, termsError);
    return true;
  }

  function validateAll() {
    const a = validateName(firstName, firstNameError, "First name");
    const b = validateName(lastName, lastNameError, "Last name");
    const c = validateRequiredEmail(email, emailError);
    const d = validateSignupPassword(password, passwordError);
    const e = validateConfirm();
    const f = validatePhone();
    const g = validateTerms();
    return a && b && c && d && e && f && g;
  }

  on(password, "input", () => updateStrength(password, meter, status));
  on(firstName, "input", () => {
    clearBanner(banner);
    validateName(firstName, firstNameError, "First name");
  });
  on(firstName, "blur", () => validateName(firstName, firstNameError, "First name"));
  on(lastName, "input", () => {
    clearBanner(banner);
    validateName(lastName, lastNameError, "Last name");
  });
  on(lastName, "blur", () => validateName(lastName, lastNameError, "Last name"));
  on(email, "input", () => {
    clearBanner(banner);
    validateRequiredEmail(email, emailError);
  });
  on(email, "blur", () => validateRequiredEmail(email, emailError));
  on(password, "input", () => {
    clearBanner(banner);
    updateStrength(password, meter, status);
    validateSignupPassword(password, passwordError);
    if (confirm.value) validateConfirm();
  });
  on(password, "blur", () => validateSignupPassword(password, passwordError));
  on(confirm, "input", () => {
    clearBanner(banner);
    validateConfirm();
  });
  on(confirm, "blur", validateConfirm);
  on(phone, "input", validatePhone);
  on(terms, "change", validateTerms);

  on(submit, "click", () => {
    clearBanner(banner);
    if (!validateAll()) return;

    startButtonLoading(submit, "Creating account...");

    window.setTimeout(() => {
      stopButtonLoading(submit, "Create Account");
      if (email.value === "existing@example.com") {
        setBanner(banner, "An account with this email already exists. Log in instead?");
        return;
      }
      setBanner(banner, "Account created. Redirecting to email verification...", "success");
      const verifyEmail = document.querySelector("[data-demo-verify-email]");
      if (verifyEmail) verifyEmail.textContent = email.value;
    }, 900);
  });

  updateStrength(password, meter, status);
}

function initForgotDemo() {
  const email = document.querySelector("[data-demo-forgot-email]");
  const emailError = document.querySelector("[data-demo-forgot-email-error]");
  const banner = document.querySelector("[data-demo-forgot-banner]");
  const submit = document.querySelector("[data-demo-forgot-submit]");
  const resend = document.querySelector("[data-demo-forgot-resend]");
  const countdown = document.querySelector("[data-demo-forgot-countdown]");
  const formPanel = document.querySelector('[data-demo-forgot-panel="form"]');
  const successPanel = document.querySelector('[data-demo-forgot-panel="success"]');
  const openLogin = document.querySelector("[data-demo-open-login]");

  if (!email || !emailError || !banner || !submit || !resend || !countdown || !formPanel || !successPanel || !openLogin) return;

  let timer = null;
  function startCountdown() {
    if (timer) window.clearInterval(timer);
    let remaining = 60;
    resend.disabled = true;
    countdown.textContent = `Please wait ${remaining}s before requesting another email.`;
    timer = window.setInterval(() => {
      remaining -= 1;
      countdown.textContent = remaining > 0 ? `Please wait ${remaining}s before requesting another email.` : "You can resend the link now.";
      if (remaining <= 0) {
        resend.disabled = false;
        window.clearInterval(timer);
      }
    }, 1000);
  }

  on(submit, "click", () => {
    clearBanner(banner);
    if (!validateRequiredEmail(email, emailError)) return;
    formPanel.classList.add("ui-demo-hidden");
    successPanel.classList.remove("ui-demo-hidden");
    startCountdown();
  });

  on(email, "input", () => validateRequiredEmail(email, emailError));
  on(email, "blur", () => validateRequiredEmail(email, emailError));
  on(resend, "click", startCountdown);
  on(openLogin, "click", () => document.getElementById("login-email")?.focus());
}

function initResetDemo() {
  const valid = document.querySelector("[data-demo-reset-valid]");
  const expired = document.querySelector("[data-demo-reset-expired]");
  const invalidPanel = document.querySelector('[data-demo-reset-panel="invalid"]');
  const formPanel = document.querySelector('[data-demo-reset-panel="form"]');
  const password = document.querySelector("[data-demo-reset-password]");
  const passwordError = document.querySelector("[data-demo-reset-password-error]");
  const confirm = document.querySelector("[data-demo-reset-confirm-password]");
  const confirmError = document.querySelector("[data-demo-reset-confirm-password-error]");
  const banner = document.querySelector("[data-demo-reset-banner]");
  const submit = document.querySelector("[data-demo-reset-submit]");
  const meter = document.querySelector("[data-demo-reset-password-meter]");
  const status = document.querySelector("[data-demo-reset-password-status]");

  if (!valid || !expired || !invalidPanel || !formPanel || !password || !passwordError || !confirm || !confirmError || !banner || !submit || !meter || !status) return;

  function showMode(mode) {
    invalidPanel.classList.toggle("ui-demo-hidden", mode !== "invalid");
    formPanel.classList.toggle("ui-demo-hidden", mode === "invalid");
  }

  function validateReset() {
    const okPassword = validateSignupPassword(password, passwordError);
    let okConfirm = true;
    if (!confirm.value) {
      setError(confirm, confirmError, "Confirm new password is required.");
      okConfirm = false;
    } else if (confirm.value !== password.value) {
      setError(confirm, confirmError, "Passwords do not match.");
      okConfirm = false;
    } else {
      clearError(confirm, confirmError);
    }
    return okPassword && okConfirm;
  }

  on(valid, "click", () => showMode("valid"));
  on(expired, "click", () => showMode("invalid"));
  on(password, "input", () => {
    clearBanner(banner);
    updateStrength(password, meter, status);
    validateSignupPassword(password, passwordError);
    if (confirm.value) validateReset();
  });
  on(password, "blur", () => validateSignupPassword(password, passwordError));
  on(confirm, "input", () => {
    clearBanner(banner);
    validateReset();
  });
  on(confirm, "blur", validateReset);
  on(submit, "click", () => {
    clearBanner(banner);
    if (!validateReset()) return;
    startButtonLoading(submit, "Updating password...");
    window.setTimeout(() => {
      stopButtonLoading(submit, "Update Password");
      if (password.value === "SecretPass1!") {
        setBanner(banner, "Your new password must be different from your previous password.");
        return;
      }
      setBanner(banner, "Password updated. Redirecting to login...", "success");
    }, 800);
  });

  updateStrength(password, meter, status);
  showMode("valid");
}

function initVerificationDemo() {
  const resend = document.querySelector("[data-demo-verify-resend]");
  const countdown = document.querySelector("[data-demo-verify-countdown]");
  const banner = document.querySelector("[data-demo-verify-banner]");

  if (!resend || !countdown || !banner) return;

  let timer = null;
  on(resend, "click", () => {
    clearBanner(banner);
    setBanner(banner, "Verification email resent. Check your inbox.", "success");
    if (timer) window.clearInterval(timer);
    let remaining = 60;
    resend.disabled = true;
    countdown.textContent = `Please wait ${remaining}s before requesting another verification email.`;
    timer = window.setInterval(() => {
      remaining -= 1;
      countdown.textContent = remaining > 0 ? `Please wait ${remaining}s before requesting another verification email.` : "Resend available now.";
      if (remaining <= 0) {
        resend.disabled = false;
        window.clearInterval(timer);
      }
    }, 1000);
  });
}

function initOAuthStatesDemo() {
  const buttons = qsa("[data-demo-oauth-provider]");
  const banner = document.querySelector("[data-demo-oauth-banner]");
  if (!buttons.length || !banner) return;

  buttons.forEach((button) => {
    on(button, "click", () => {
      clearBanner(banner);
      const provider = button.dataset.demoOauthProvider;
      startButtonLoading(button, "Redirecting...");
      window.setTimeout(() => {
        stopButtonLoading(button, provider[0].toUpperCase() + provider.slice(1));
        if (provider === "google") {
          setBanner(banner, "Google login succeeded. Redirecting to your dashboard...", "success");
        } else if (provider === "apple") {
          setBanner(banner, "Login cancelled");
        } else {
          setBanner(banner, `Could not connect to ${provider[0].toUpperCase()}${provider.slice(1)}. Try again or use email.`);
        }
      }, 700);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();
  initLoginDemo();
  initSignupDemo();
  initForgotDemo();
  initResetDemo();
  initVerificationDemo();
  initOAuthStatesDemo();
});
