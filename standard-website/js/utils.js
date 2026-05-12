export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function on(element, event, handler, options = {}) {
  if (!element) return null;

  element.addEventListener(event, handler, options);

  return function cleanup() {
    element.removeEventListener(event, handler, options);
  };
}

export function debounce(fn, delay = 250) {
  let timeoutId;

  return function debounced(...args) {
    window.clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function getProjectBasePath() {
  const path = window.location.pathname;

  /*
    Root page:
    /index.html

    Inner pages:
    /html/pages/about.html
    /html/standards/frontend-standards.html

    From inner pages, project root is ../../
  */
  if (path.includes("/html/")) {
    return "../../";
  }

  return "./";
}

export function resolveProjectPath(path) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${getProjectBasePath()}${cleanPath}`;
}

export function normalizePath(path) {
  return String(path || "")
    .replace(window.location.origin, "")
    .replace(/\/index\.html$/, "/")
    .replace(/^\//, "")
    .toLowerCase();
}

export function getCurrentPagePath() {
  return normalizePath(window.location.pathname);
}

export function setActiveLinks(selector = "a[href]") {
  const currentPath = getCurrentPagePath();

  qsa(selector).forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#") || href.startsWith("http")) {
      return;
    }

    const linkUrl = new URL(href, window.location.href);
    const linkPath = normalizePath(linkUrl.pathname);

    if (currentPath === linkPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

export function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getFromStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    throw new Error("Clipboard API is not supported in this browser.");
  }

  await navigator.clipboard.writeText(text);
}

export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  return element;
}