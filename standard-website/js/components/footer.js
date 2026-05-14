import { qs, qsa, resolveProjectPath } from "../utils.js";

export function initFooterBranding() {
  qsa(".footer").forEach((footer) => {
    const brand = qs(".footer-brand", footer);
    if (!brand) return;

    brand.innerHTML = `
      <span class="footer-brand-lockup">
        <img src="${resolveProjectPath("assets/images/infiweb-logo.png")}" alt="Infi Web Solutions Logo" class="footer-brand-logo" />
        <span class="footer-brand-copy">
          <span class="footer-brand-title">Development Standards</span>
          <span class="footer-brand-subtitle">by Infi Web Solutions</span>
        </span>
      </span>
    `;
  });
}
