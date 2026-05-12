import { APP_CONFIG } from "../config.js";
import { qsa, on, getFromStorage, setToStorage } from "../utils.js";

export function initThemeToggle() {
  const savedTheme = getFromStorage(APP_CONFIG.storageKeys.theme, "light");
  applyTheme(savedTheme);

  qsa("[data-theme-toggle]").forEach((button) => {
    on(button, "click", () => {
      const currentTheme = document.documentElement.dataset.theme || "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);
      setToStorage(APP_CONFIG.storageKeys.theme, nextTheme);
    });
  });
}

function applyTheme(theme) {
  const safeTheme = theme === "dark" ? "dark" : "light";

  document.documentElement.dataset.theme = safeTheme;
  document.documentElement.style.colorScheme = safeTheme;

  const label = safeTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  qsa("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", label);
    button.textContent = safeTheme === "dark" ? "Light Mode" : "Dark Mode";
  });
}
