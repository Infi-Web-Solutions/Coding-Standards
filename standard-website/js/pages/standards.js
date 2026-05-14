import { initCatalogIndex, qsa, slugify } from "../utils.js";

export function initStandardsPage() {
  updateStandardsCount();
  prepareSelectedStandardDetailPage();
  initStandardsCatalogIndex();
  initSupabaseSeriesNav();
  initTeamOwnershipLayout();
}

function updateStandardsCount() {
  const counter = document.querySelector("[data-standards-count]");

  if (!counter) return;

  const count = qsa("[data-standard-card]").length;
  counter.textContent = String(count);
}

function initSupabaseSeriesNav() {
  const pageHeader = document.querySelector(".page-header");
  if (!pageHeader) return;

  const currentPath = window.location.pathname;
  if (!currentPath.includes("/html/standards/supabase-")) return;

  const seriesItems = [
    { href: "./supabase-standards.html", label: "Overview" },
    { href: "./supabase-database-and-rls.html", label: "01 Database & RLS" },
    { href: "./supabase-api-design.html", label: "02 API Design" },
    { href: "./supabase-api-documentation.html", label: "03 API Docs" },
    { href: "./supabase-edge-functions.html", label: "04 Edge Functions" },
    { href: "./supabase-validation-multitenant-storage.html", label: "05 Validation & Storage" },
    { href: "./supabase-operations-and-testing.html", label: "06 Operations & Testing" },
    { href: "./supabase-rpc-functions.html", label: "07 RPC Functions" },
  ];

  const currentFile = currentPath.split("/").pop();
  const nav = document.createElement("section");
  nav.className = "section standards-series-nav";

  const linksMarkup = seriesItems
    .map((item) => {
      const itemFile = item.href.replace("./", "");
      const activeClass = itemFile === currentFile ? " active" : "";
      const currentAttr = itemFile === currentFile ? ' aria-current="page"' : "";
      return `<a href="${item.href}" class="standards-series-link${activeClass}"${currentAttr}>${item.label}</a>`;
    })
    .join("");

  nav.innerHTML = `
    <div class="standards-series-shell">
      <div class="standards-series-header">
        <span class="standards-series-label">Supabase Standards</span>
        <p>Browse the overview and all seven backend standards files from the Supabase standards folder.</p>
      </div>
      <div class="standards-series-grid">
        ${linksMarkup}
      </div>
    </div>
  `;

  pageHeader.insertAdjacentElement("afterend", nav);
}

function initStandardsCatalogIndex() {
  initCatalogIndex({
    catalogSelector: "#standards-catalog",
    headerSelector: ".standards-catalog-header",
    groupSelector: ".standards-group",
    groupTitleSelector: ".standards-group-header .badge",
    groupDescriptionSelector: ".standards-group-header p",
    itemSelector: ".standards-doc-card",
    itemTitleSelector: ".card-title",
    extraContentSelectors: ["[data-search-empty]"],
    idPrefix: "standards",
    groupTitleFallback: "Standards Section",
  });
}

function prepareSelectedStandardDetailPage() {
  if (!isSelectedStandardDetailPage()) return;

  document.body.classList.add("standard-detail-page");

  const actionRow = document.querySelector('.page-header > div[style*="display: flex"]');
  if (actionRow) {
    actionRow.classList.add("standard-detail-actions");
    actionRow.removeAttribute("style");
  }

  cleanupLegacyContentsSection();
}

function cleanupLegacyContentsSection() {
  const contentsSection =
    document.getElementById("contents") ||
    Array.from(document.querySelectorAll("main.page .section")).find((section) => {
      const heading = section.querySelector(".section-title");
      return heading?.textContent.trim().toLowerCase() === "contents";
    });
  if (!contentsSection) return;

  const card = contentsSection.querySelector(".content-card");
  if (!card) {
    contentsSection.remove();
    return;
  }

  const contentsHeading = Array.from(card.querySelectorAll(".section-title"))
    .find((heading) => heading.textContent.trim().toLowerCase() === "contents");
  if (contentsHeading) {
    contentsHeading.remove();
  }

  const firstTable = card.querySelector(".table-wrapper");
  if (firstTable) {
    firstTable.remove();
  }

  const firstGrid = card.querySelector(".grid");
  if (firstGrid) {
    firstGrid.remove();
  }

  const clickableCards = card.querySelectorAll(".card-clickable");
  if (clickableCards.length) {
    clickableCards.forEach((link) => link.remove());
  }

  const firstDivider = card.querySelector("hr");
  if (firstDivider) {
    firstDivider.remove();
  }

  const remainingContent = Array.from(card.children).some((element) =>
    !["HR"].includes(element.tagName)
  );

  if (!remainingContent) {
    contentsSection.remove();
  }
}

function initSelectedStandardDetailIndex() {
  if (document.querySelector(".team-ownership-page")) return;

  if (!isSelectedStandardDetailPage()) return;

  const container = document.querySelector("main.page .container");
  const header = container?.querySelector(".page-header");
  if (!container || !header || container.querySelector(".standard-detail-shell")) return;

  const shell = document.createElement("div");
  shell.className = "standard-detail-shell";

  const sidebar = document.createElement("aside");
  sidebar.className = "standard-detail-index";
  sidebar.setAttribute("aria-label", "Page index");

  const sidebarInner = document.createElement("div");
  sidebarInner.className = "standard-detail-index-inner";

  const sidebarLabel = document.createElement("p");
  sidebarLabel.className = "standard-detail-index-label";
  sidebarLabel.textContent = "On This Page";

  const sidebarList = document.createElement("div");
  sidebarList.className = "standard-detail-index-list";

  const content = document.createElement("div");
  content.className = "standard-detail-content";

  const sections = Array.from(container.children).filter(
    (element) => element.classList?.contains("section")
  );

  const trackedSections = [];

  sections.forEach((section, index) => {
    const heading =
      section.querySelector(".section-title") ||
      section.querySelector("h1") ||
      section.querySelector("h2") ||
      section.querySelector("h3");

    if (!heading) {
      if (!section.textContent.trim()) {
        section.remove();
        return;
      }

      content.appendChild(section);
      return;
    }

    if (!section.id) {
      section.id = `standard-detail-${index + 1}-${slugify(heading.textContent.trim())}`;
    }

    const link = document.createElement("a");
    link.className = "standard-detail-index-link";
    link.href = `#${section.id}`;
    link.textContent = cleanIndexTitle(heading.textContent.trim());
    sidebarList.appendChild(link);

    trackedSections.push({ section, link });
    content.appendChild(section);
  });

  sidebarInner.append(sidebarLabel, sidebarList);
  sidebar.appendChild(sidebarInner);
  shell.append(sidebar, content);
  header.insertAdjacentElement("afterend", shell);

  const updateActiveLink = () => {
    const offset = 180;
    let active = trackedSections[0];

    trackedSections.forEach((entry) => {
      if (entry.section.getBoundingClientRect().top - offset <= 0) {
        active = entry;
      }
    });

    trackedSections.forEach((entry) => {
      const isActive = entry === active;
      entry.link.classList.toggle("active", isActive);
      if (isActive) {
        entry.link.setAttribute("aria-current", "location");
      } else {
        entry.link.removeAttribute("aria-current");
      }
    });
  };

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
}

function cleanIndexTitle(title) {
  return title.replace(/^\d+(\.\d+)?\.\s*/, "").trim();
}

function isSelectedStandardDetailPage() {
  const fileName = window.location.pathname.split("/").pop();
  return [
    "backend-first-logic.html",
    "code-reusability-standards.html",
    "team-ownership.html",
    "frontend-standards.html",
    "frontend-forms-validation.html",
    "frontend-data-display.html",
    "frontend-ui-standards.html",
    "frontend-ui-components.html",
    "frontend-error-feedback.html",
    "frontend-permissions-auth.html",
    "frontend-settings.html",
    "qa-delivery-standards.html",
    "supabase-standards.html",
    "supabase-database-and-rls.html",
    "supabase-api-design.html",
    "supabase-api-documentation.html",
    "supabase-edge-functions.html",
    "supabase-validation-multitenant-storage.html",
    "supabase-operations-and-testing.html",
    "supabase-rpc-functions.html",
    "xano-standards.html",
    "website-standards.html",
    "website-scoping-and-design.html",
    "website-building-by-platform.html",
    "website-migration.html",
    "website-responsive-qa-performance.html",
    "website-launch-and-handoff.html",
    "django-template-standards.html",
  ].includes(fileName);
}

function initTeamOwnershipLayout() {
  const page = document.querySelector(".team-ownership-page");
  if (!page) return;

  const container = document.querySelector("main.page .container");
  const header = container?.querySelector(".page-header");
  if (!container || !header || container.querySelector("#team-ownership-catalog")) return;

  const sections = Array.from(container.children).filter((element) =>
    element.classList?.contains("section")
  );

  const groups = [];
  let currentGroup = null;

  sections.forEach((section) => {
    if (section === header || section.classList.contains("ownership-intro-grid")) {
      return;
    }

    if (section.id === "contents") {
      section.remove();
      return;
    }

    const card = section.querySelector(".content-card");
    if (!card) {
      section.remove();
      return;
    }

    const childNodes = Array.from(card.children);
    const headingIndex = childNodes.findIndex((node) => node.tagName === "H1");

    if (headingIndex >= 0) {
      const beforeNodes = childNodes.slice(0, headingIndex);
      if (currentGroup && hasMeaningfulNodes(beforeNodes)) {
        appendTeamOwnershipSubgroup(currentGroup, section, beforeNodes);
      }

      const afterNodes = childNodes.slice(headingIndex);
      currentGroup = createTeamOwnershipGroup(section, afterNodes);
      if (currentGroup) {
        groups.push(currentGroup);
      }

      section.remove();
      return;
    }

    if (currentGroup && hasMeaningfulNodes(childNodes)) {
      appendTeamOwnershipSubgroup(currentGroup, section, childNodes);
    }

    section.remove();
  });

  const catalog = document.createElement("section");
  catalog.className = "section team-ownership-catalog";
  catalog.id = "team-ownership-catalog";

  const catalogHeader = document.createElement("div");
  catalogHeader.className = "team-ownership-catalog-header";
  catalogHeader.setAttribute("aria-hidden", "true");

  groups.forEach((group) => {
    catalog.appendChild(group.section);
  });

  catalog.prepend(catalogHeader);
  header.insertAdjacentElement("afterend", catalog);

  initCatalogIndex({
    catalogSelector: "#team-ownership-catalog",
    headerSelector: ".team-ownership-catalog-header",
    groupSelector: ".team-ownership-group",
    groupTitleSelector: ".team-ownership-group-header h3",
    groupDescriptionSelector: ".team-ownership-group-header > p",
    itemSelector: ".team-ownership-subgroup",
    itemTitleSelector: ".team-ownership-subgroup-summary h4",
    idPrefix: "team-ownership",
    groupTitleFallback: "Section",
  });
}

function hasMeaningfulNodes(nodes) {
  return nodes.some((node) => {
    if (node.tagName === "HR") return false;
    return Boolean(node.textContent?.trim());
  });
}

function createTeamOwnershipGroup(sourceSection, nodes) {
  const heading = nodes.find((node) => node.tagName === "H1");
  if (!heading) return null;

  const rawHeadingText = heading.textContent.trim();
  const match = rawHeadingText.match(/^(\d+)\.\s*(.*)$/);
  const sectionNumber = match?.[1] || "";
  const sectionTitle = match?.[2] || cleanIndexTitle(rawHeadingText);
  const sectionId = heading.id || sourceSection.id || `team-ownership-${slugify(sectionTitle)}`;

  const section = document.createElement("section");
  section.className = "checklists-group team-ownership-group";
  section.id = sectionId;

  const header = document.createElement("div");
  header.className = "checklists-group-header team-ownership-group-header";

  const headerCopy = document.createElement("div");

  const badge = document.createElement("span");
  badge.className = "badge badge-success";
  badge.textContent = sectionNumber ? `${sectionNumber}.` : "Section";

  const title = document.createElement("h3");
  title.textContent = sectionTitle;

  headerCopy.append(badge, title);
  header.appendChild(headerCopy);

  const body = document.createElement("div");
  body.className = "team-ownership-group-body";

  const introNodes = nodes.slice(nodes.indexOf(heading) + 1).filter((node) => node.tagName !== "HR");
  const introFragment = document.createDocumentFragment();
  introNodes.forEach((node) => introFragment.appendChild(node));

  if (introFragment.childNodes.length > 0) {
    const intro = document.createElement("div");
    intro.className = "team-ownership-group-intro";
    intro.appendChild(introFragment);

    const introParagraph = intro.querySelector("p");
    if (introParagraph) {
      const description = document.createElement("p");
      description.textContent = introParagraph.textContent.trim();
      header.appendChild(description);
      introParagraph.remove();
    }

    if (intro.childNodes.length > 0) {
      body.appendChild(intro);
    }
  }

  section.append(header, body);

  return {
    id: sectionId,
    title: sectionTitle,
    section,
    body,
    subgroups: [],
  };
}

function appendTeamOwnershipSubgroup(group, sourceSection, nodes) {
  const fragment = document.createDocumentFragment();
  nodes.forEach((node) => {
    if (node.tagName !== "HR") {
      fragment.appendChild(node);
    }
  });

  const wrapper = document.createElement("div");
  wrapper.appendChild(fragment);

  const heading =
    wrapper.querySelector(".section-title") ||
    wrapper.querySelector("h2") ||
    wrapper.querySelector("h3");

  if (!heading) {
    group.body.append(...Array.from(wrapper.childNodes));
    sourceSection.remove();
    return;
  }

  const subgroupTitle = cleanIndexTitle(heading.textContent.trim());
  const subgroupId = sourceSection.id || `${group.id}-item-${group.subgroups.length + 1}-${slugify(subgroupTitle)}`;

  const details = document.createElement("details");
  details.className = "team-ownership-subgroup";
  details.id = subgroupId;
  details.open = group.subgroups.length === 0;

  const summary = document.createElement("summary");
  summary.className = "team-ownership-subgroup-summary";

  const summaryText = document.createElement("div");
  summaryText.className = "team-ownership-subgroup-summary-text";

  const kicker = document.createElement("span");
  kicker.className = "checklists-subgroup-kicker";
  kicker.textContent = "Checklist";

  const title = document.createElement("h4");
  title.textContent = subgroupTitle;

  summaryText.append(kicker, title);
  summary.appendChild(summaryText);

  const firstParagraph = Array.from(wrapper.children).find(
    (element) =>
      element !== heading &&
      element.tagName === "P" &&
      element.textContent.trim().length <= 180
  );
  if (firstParagraph) {
    const summaryDescription = document.createElement("p");
    summaryDescription.textContent = firstParagraph.textContent.trim();
    summary.appendChild(summaryDescription);
    firstParagraph.remove();
  }

  heading.remove();

  const body = document.createElement("div");
  body.className = "team-ownership-subgroup-body";
  body.append(...Array.from(wrapper.childNodes));

  details.append(summary, body);
  group.body.appendChild(details);
  group.subgroups.push({ id: subgroupId, title: subgroupTitle, details });
  sourceSection.remove();
}
