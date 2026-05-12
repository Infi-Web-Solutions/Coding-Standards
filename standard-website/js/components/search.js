import { APP_CONFIG } from "../config.js";
import { qs, qsa, on, debounce } from "../utils.js";

export function initSearch() {
  const searchInput = qs("[data-search-input]");
  const searchScope = qs("[data-search-scope]");

  if (!searchInput || !searchScope) return;

  const searchableItems = qsa("[data-search-item]", searchScope);
  const emptyState = qs("[data-search-empty]");

  const handleSearch = debounce(() => {
    const query = searchInput.value.trim().toLowerCase();

    let visibleCount = 0;

    searchableItems.forEach((item) => {
      const explicitText = item.getAttribute("data-search-text");
      const searchableText = (explicitText || item.textContent || "").toLowerCase();

      const shouldShow =
        query.length < APP_CONFIG.search.minCharacters ||
        searchableText.includes(query);

      item.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }, 150);

  on(searchInput, "input", handleSearch);
}