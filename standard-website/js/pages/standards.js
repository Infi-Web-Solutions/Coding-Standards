import { qsa } from "../utils.js";

export function initStandardsPage() {
  updateStandardsCount();
  initSupabaseSeriesNav();
  initTeamOwnershipSections();
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

function initTeamOwnershipSections() {
  const page = document.querySelector(".team-ownership-page");
  if (!page) return;

  const cards = page.querySelectorAll(".content-card");

  cards.forEach((card) => {
    const heading = Array.from(card.children).find((element) => element.tagName === "H1");
    if (!heading) return;

    const parentSection = card.closest(".section");
    if (!parentSection) return;

    const introSection = document.createElement("section");
    introSection.className = "section ownership-section-intro";

    const introCard = document.createElement("div");
    introCard.className = "content-card ownership-section-card";

    let node = heading;
    while (node) {
      const nextNode = node.nextSibling;
      introCard.appendChild(node);
      node = nextNode;
    }

    const trailingChild = card.lastElementChild;
    if (trailingChild?.tagName === "HR") {
      trailingChild.remove();
    }

    introSection.appendChild(introCard);
    parentSection.insertAdjacentElement("afterend", introSection);
  });
}
