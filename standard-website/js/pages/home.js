import { qsa, on } from "../utils.js";

export function initHomePage() {
  initCardKeyboardNavigation();
}

function initCardKeyboardNavigation() {
  qsa(".card-clickable").forEach((card) => {
    if (card.tagName.toLowerCase() === "a") return;

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");

    on(card, "keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      card.click();
    });
  });
}