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

  if (path.includes("/html/")) {
    const htmlPath = path.split("/html/")[1] || "";
    const htmlSegments = htmlPath.split("/").filter(Boolean);

    if (htmlSegments.length === 0) {
      return "./";
    }

    const depth = Math.max(htmlSegments.length - 1, 0);
    return `../`.repeat(depth + 1);
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

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initCatalogIndex(options) {
  const {
    catalogSelector,
    headerSelector,
    groupSelector,
    groupTitleSelector,
    groupDescriptionSelector,
    itemSelector,
    itemTitleSelector,
    getGroupTitle,
    getGroupDescription,
    getItemTitle,
    extraContentSelectors = [],
    idPrefix = "catalog",
    groupTitleFallback = "Section",
  } = options;

  const catalog = qs(catalogSelector);
  if (!catalog) return;

  const header = qs(headerSelector, catalog);
  const groups = qsa(groupSelector, catalog);
  if (!header || groups.length === 0) return;

  const shell = createElement("div", { className: "catalog-index-shell" });
  const sidebar = createElement("aside", {
    className: "catalog-index-sidebar catalog-index-sidebar--edge",
    attributes: { "aria-label": "Page index" },
  });
  const sidebarInner = createElement("div", { className: "catalog-index-sidebar-inner" });
  const sidebarLabel = createElement("p", {
    className: "catalog-index-label",
    textContent: "On This Page",
  });
  const sidebarList = createElement("div", { className: "catalog-index-list" });
  const content = createElement("div", { className: "catalog-index-content" });

  const scrollTargets = [];
  const groupLinkMap = new Map();
  const itemLinkMap = new Map();

  groups.forEach((group, groupIndex) => {
    const groupTitle =
      getGroupTitle?.(group, groupIndex, catalog) ||
      qs(groupTitleSelector, group)?.textContent?.trim() ||
      `${groupTitleFallback} ${groupIndex + 1}`;
    const groupDescription =
      getGroupDescription?.(group, groupIndex, catalog) ||
      (groupDescriptionSelector ? qs(groupDescriptionSelector, group)?.textContent?.trim() || "" : "");
    const groupId = group.id || `${idPrefix}-group-${slugify(groupTitle)}`;

    group.id = groupId;

    const groupItem = createElement("details", {
      className: "catalog-index-group",
      attributes: { "data-group-id": groupId },
    });
    if (groupIndex === 0) {
      groupItem.open = true;
    }

    const groupHeader = createElement("summary", { className: "catalog-index-group-header" });
    const groupLink = createElement("span", {
      className: "catalog-index-link catalog-index-link-group",
    });
    groupLink.innerHTML = `<span class="catalog-index-title">${escapeHtml(groupTitle)}</span>`;

    const jumpLink = createElement("a", {
      className: "catalog-index-jump",
      textContent: "Open section",
      attributes: { href: `#${groupId}` },
    });

    groupHeader.append(groupLink, jumpLink);
    groupItem.appendChild(groupHeader);
    groupLinkMap.set(groupId, groupHeader);
    scrollTargets.push({ id: groupId, type: "group", element: group });

    const items = qsa(itemSelector, group);
    const subList = createElement("div", {
      className: "catalog-index-sublist",
      attributes: { id: `${groupId}-sublist` },
    });

    const overviewLink = createElement("a", {
      className: "catalog-index-link catalog-index-link-item catalog-index-link-overview",
      textContent: "Section overview",
      attributes: { href: `#${groupId}` },
    });
    subList.appendChild(overviewLink);
    itemLinkMap.set(groupId, overviewLink);

    items.forEach((item, itemIndex) => {
      const itemTitle =
        getItemTitle?.(item, itemIndex, group, catalog) ||
        qs(itemTitleSelector, item)?.textContent?.trim();
      if (!itemTitle) return;

      const itemId = item.id || `${groupId}-item-${itemIndex + 1}-${slugify(itemTitle)}`;
      item.id = itemId;

      const itemLink = createElement("a", {
        className: "catalog-index-link catalog-index-link-item",
        textContent: itemTitle,
        attributes: { href: `#${itemId}` },
      });

      subList.appendChild(itemLink);
      itemLinkMap.set(itemId, itemLink);
      scrollTargets.push({ id: itemId, type: "item", element: item, groupId });
    });

    groupItem.appendChild(subList);

    sidebarList.appendChild(groupItem);
    content.appendChild(group);
  });

  extraContentSelectors.forEach((selector) => {
    qsa(selector, catalog).forEach((element) => content.appendChild(element));
  });

  sidebarInner.append(sidebarLabel, sidebarList);
  sidebar.appendChild(sidebarInner);
  shell.append(sidebar, content);
  header.insertAdjacentElement("afterend", shell);

  qsa(".catalog-index-group", sidebar).forEach((groupItem) => {
    on(groupItem, "toggle", () => {
      if (!groupItem.open) return;

      qsa(".catalog-index-group", sidebar).forEach((otherGroup) => {
        if (otherGroup !== groupItem) {
          otherGroup.open = false;
        }
      });
    });
  });

  const updateActiveIndex = () => {
    const offset = 160;
    let activeEntry = scrollTargets[0];

    scrollTargets.forEach((entry) => {
      const top = entry.element.getBoundingClientRect().top;
      if (top - offset <= 0) {
        activeEntry = entry;
      }
    });

    const activeGroupId = activeEntry.type === "item" ? activeEntry.groupId : activeEntry.id;

    groupLinkMap.forEach((link, id) => {
      const isActive = id === activeGroupId;
      link.classList.toggle("active", isActive);

      const parentGroup = link.closest(".catalog-index-group");
      if (parentGroup) {
        parentGroup.open = isActive;
      }

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    itemLinkMap.forEach((link, id) => {
      const isActive =
        (activeEntry.type === "item" && id === activeEntry.id) ||
        (activeEntry.type === "group" && id === activeEntry.id);
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  updateActiveIndex();
  on(window, "scroll", updateActiveIndex, { passive: true });
  on(window, "resize", updateActiveIndex);
}

export function initGlobalPageIndex() {
  if (document.body.dataset.page === "home") return;
  if (qs(".catalog-index-shell")) return;

  const container = qs("main.page .container");
  if (!container) return;

  const pageHeader = Array.from(container.children).find((element) =>
    element.classList?.contains("page-header")
  );
  if (!pageHeader) return;

  cleanupContentsSections(container);

  const sections = Array.from(container.children).filter((element) =>
    element.classList?.contains("section")
  );
  if (sections.length === 0) return;

  const catalog = createElement("section", {
    className: "section auto-page-index-catalog",
    attributes: { id: "auto-page-index-catalog" },
  });
  const catalogHeader = createElement("div", {
    className: "auto-page-index-header",
    attributes: { hidden: "" },
  });

  catalog.appendChild(catalogHeader);

  sections.forEach((section, index) => {
    ensureAutoIndexGroupId(section, index);
    markAutoIndexItems(section);
    catalog.appendChild(section);
  });

  pageHeader.insertAdjacentElement("afterend", catalog);

  initCatalogIndex({
    catalogSelector: "#auto-page-index-catalog",
    headerSelector: ".auto-page-index-header",
    groupSelector: ".section",
    itemSelector: "[data-auto-index-item]",
    itemTitleSelector: ".card-title, .section-title, h3, h4, strong",
    getGroupTitle: (group, groupIndex) => getAutoIndexGroupTitle(group, groupIndex),
    getGroupDescription: (group) => getAutoIndexGroupDescription(group),
    getItemTitle: (item) => getAutoIndexItemTitle(item),
    idPrefix: "page-index",
    groupTitleFallback: "Section",
  });
}

function cleanupContentsSections(container) {
  Array.from(container.children).forEach((section) => {
    if (!section.classList?.contains("section")) return;

    const heading = getFirstMeaningfulHeading(section);
    const headingText = heading?.textContent?.trim().toLowerCase();

    if (headingText === "contents") {
      section.remove();
    }
  });
}

function ensureAutoIndexGroupId(section, index) {
  if (section.id) return;

  const title = getAutoIndexGroupTitle(section, index);
  section.id = `page-index-group-${index + 1}-${slugify(title)}`;
}

function markAutoIndexItems(section) {
  const itemCandidates = qsa("article, details, .grid > .card, .grid > a.card", section)
    .filter((element, index, list) => list.indexOf(element) === index);

  itemCandidates.forEach((element) => {
    const title = getAutoIndexItemTitle(element);
    if (!title) return;

    element.setAttribute("data-auto-index-item", "");

    if (!element.id) {
      const groupId = section.id || "page-index-group";
      element.id = `${groupId}-item-${slugify(title)}`;
    }
  });
}

function getAutoIndexGroupTitle(section, groupIndex = 0) {
  const heading = getFirstMeaningfulHeading(section);
  const title = cleanAutoIndexTitle(heading?.textContent?.trim() || "");

  if (title) return title;
  if (groupIndex === 0) return "Overview";
  return `Section ${groupIndex + 1}`;
}

function getAutoIndexGroupDescription(section) {
  const description =
    qs(".section-description", section)?.textContent?.trim() ||
    qsa("p", section)
      .map((element) => element.textContent.trim())
      .find((text) => text.length > 0 && text.length <= 200) ||
    "";

  return description;
}

function getAutoIndexItemTitle(item) {
  const heading =
    qs(".card-title", item) ||
    qs(".section-title", item) ||
    qs("summary h2, summary h3, summary h4", item) ||
    qs("h3, h4, strong", item);

  return cleanAutoIndexTitle(heading?.textContent?.trim() || "");
}

function getFirstMeaningfulHeading(section) {
  return (
    qs(".section-title", section) ||
    qs(".card-title", section) ||
    qs("h2, h3, h4", section)
  );
}

function cleanAutoIndexTitle(title) {
  return String(title || "")
    .replace(/^\d+(\.\d+)?\.\s*/, "")
    .trim();
}
