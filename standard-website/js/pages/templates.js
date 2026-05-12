import { qsa, on, copyToClipboard } from "../utils.js";

export function initTemplatesPage() {
  initCopyTemplateButtons();
}

function initCopyTemplateButtons() {
  qsa("[data-copy-template]").forEach((button) => {
    const targetId = button.getAttribute("data-copy-template");
    const target = document.getElementById(targetId);

    if (!target) return;

    on(button, "click", async () => {
      const originalText = button.textContent;

      try {
        await copyToClipboard(target.innerText || target.textContent || "");

        button.textContent = "Copied";
        button.classList.add("btn-primary");

        window.setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("btn-primary");
        }, 1200);
      } catch {
        button.textContent = "Copy Failed";

        window.setTimeout(() => {
          button.textContent = originalText;
        }, 1200);
      }
    });
  });
}