// settings-demo.js — Live settings & profile demo

// ── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(value) {
  if (!value) return { label: "", width: "0%", color: "var(--color-border)" };

  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score <= 2) return { label: "Weak", width: "28%", color: "var(--color-danger)" };
  if (score <= 3) return { label: "Fair", width: "56%", color: "var(--color-warning)" };
  if (score === 4) return { label: "Good", width: "78%", color: "var(--color-warning)" };
  return { label: "Strong", width: "100%", color: "var(--color-success)" };
}

// ── Subtle saved indicator ───────────────────────────────────────────────────
function showSavedIndicator(el) {
  el.textContent = "Saved";
  el.style.opacity = "1";
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.style.opacity = "0";
  }, 1800);
}

// ── Profile Section ──────────────────────────────────────────────────────────
function buildProfileSection() {
  return `
    <div class="content-card" style="padding:20px; margin-bottom:16px;">
      <h3 style="margin:0 0 16px; font-size:1rem; font-weight:600;">Profile</h3>

      <!-- Avatar -->
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
        <div class="ui-demo-avatar" data-settings-avatar style="width:64px; height:64px; font-size:1.4rem; flex-shrink:0;">JD</div>
        <div>
          <div style="font-size:0.85rem; color:var(--color-muted); margin-bottom:6px;">JPEG, PNG, or WebP — max 5 MB</div>
          <input type="file" accept="image/jpeg,image/png,image/webp" class="ui-demo-hidden" data-settings-avatar-input />
          <button class="btn btn-secondary btn-sm" data-settings-avatar-upload>Upload Photo</button>
        </div>
      </div>

      <!-- Name + Email -->
      <div class="ui-demo-field" style="margin-bottom:14px;">
        <label class="ui-demo-label" for="settings-name">Full Name</label>
        <input id="settings-name" class="form-control" type="text" value="Jane Doe" autocomplete="name" data-settings-name />
      </div>

      <div class="ui-demo-field" style="margin-bottom:4px;">
        <label class="ui-demo-label" for="settings-email">Email Address</label>
        <input id="settings-email" class="form-control" type="email" value="jane@example.com" autocomplete="email" data-settings-email />
        <div class="ui-demo-note">Email change requires verification — a link will be sent to the new address.</div>
      </div>

      <div class="ui-demo-actions" style="margin-top:16px;">
        <button class="btn btn-primary btn-sm" data-settings-profile-save>Save Changes</button>
      </div>
    </div>
  `;
}

function initProfileSection(root) {
  const saveBtn = root.querySelector("[data-settings-profile-save]");
  const avatarInput = root.querySelector("[data-settings-avatar-input]");
  const avatarUploadBtn = root.querySelector("[data-settings-avatar-upload]");
  const avatarEl = root.querySelector("[data-settings-avatar]");

  // Save with loading → success
  saveBtn.addEventListener("click", () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="ui-demo-spinner ui-demo-spinner-dark" style="width:14px;height:14px;margin-right:6px;"></span> Saving…`;

    setTimeout(() => {
      saveBtn.innerHTML = "Saved!";
      saveBtn.classList.remove("btn-primary");
      saveBtn.classList.add("btn-secondary");

      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "Save Changes";
        saveBtn.classList.remove("btn-secondary");
        saveBtn.classList.add("btn-primary");
      }, 1500);
    }, 1500);
  });

  // Avatar upload triggers file input
  avatarUploadBtn.addEventListener("click", () => avatarInput.click());

  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarEl.style.backgroundImage = `url(${e.target.result})`;
      avatarEl.style.backgroundSize = "cover";
      avatarEl.style.backgroundPosition = "center";
      avatarEl.textContent = "";
    };
    reader.readAsDataURL(file);
  });
}

// ── Password Section ─────────────────────────────────────────────────────────
function buildPasswordSection() {
  return `
    <div class="content-card" style="padding:20px; margin-bottom:16px;">
      <h3 style="margin:0 0 16px; font-size:1rem; font-weight:600;">Change Password</h3>

      <div class="ui-demo-field" style="margin-bottom:14px;">
        <label class="ui-demo-label" for="settings-current-pw">Current Password</label>
        <div class="ui-demo-inline">
          <input id="settings-current-pw" class="form-control" type="password" placeholder="Enter current password" data-settings-current-pw />
          <button type="button" class="btn btn-secondary btn-sm" data-settings-toggle-pw="settings-current-pw">Show</button>
        </div>
      </div>

      <div class="ui-demo-field" style="margin-bottom:6px;">
        <label class="ui-demo-label" for="settings-new-pw">New Password</label>
        <div class="ui-demo-inline">
          <input id="settings-new-pw" class="form-control" type="password" placeholder="Min 8 chars, uppercase, number" data-settings-new-pw />
          <button type="button" class="btn btn-secondary btn-sm" data-settings-toggle-pw="settings-new-pw">Show</button>
        </div>
        <!-- Strength bar -->
        <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
          <div style="flex:1; height:6px; background:var(--color-border); border-radius:4px; overflow:hidden;">
            <div data-settings-pw-bar style="height:100%; width:0%; background:var(--color-border); border-radius:4px; transition:width 0.2s, background 0.2s;"></div>
          </div>
          <span data-settings-pw-label style="font-size:0.78rem; color:var(--color-muted); min-width:44px;"></span>
        </div>
      </div>

      <div class="ui-demo-field" style="margin-bottom:4px;">
        <label class="ui-demo-label" for="settings-confirm-pw">Confirm New Password</label>
        <div class="ui-demo-inline">
          <input id="settings-confirm-pw" class="form-control" type="password" placeholder="Repeat new password" data-settings-confirm-pw />
          <button type="button" class="btn btn-secondary btn-sm" data-settings-toggle-pw="settings-confirm-pw">Show</button>
        </div>
        <div class="ui-demo-note ui-demo-hidden" data-settings-pw-match-note style="margin-top:4px;"></div>
      </div>

      <div class="ui-demo-actions" style="margin-top:16px;">
        <button class="btn btn-primary btn-sm" disabled data-settings-pw-save>Update Password</button>
      </div>
    </div>
  `;
}

function initPasswordSection(root) {
  const currentPw = root.querySelector("[data-settings-current-pw]");
  const newPw = root.querySelector("[data-settings-new-pw]");
  const confirmPw = root.querySelector("[data-settings-confirm-pw]");
  const pwBar = root.querySelector("[data-settings-pw-bar]");
  const pwLabel = root.querySelector("[data-settings-pw-label]");
  const matchNote = root.querySelector("[data-settings-pw-match-note]");
  const saveBtn = root.querySelector("[data-settings-pw-save]");

  // Show/hide toggles
  root.querySelectorAll("[data-settings-toggle-pw]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.settingsTogglePw;
      const input = root.querySelector(`#${targetId}`);
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.textContent = isHidden ? "Hide" : "Show";
    });
  });

  // Strength meter
  newPw.addEventListener("input", () => {
    const { label, width, color } = getPasswordStrength(newPw.value);
    pwBar.style.width = width;
    pwBar.style.background = color;
    pwLabel.textContent = label;
    checkCanSave();
  });

  // Match check
  function checkMatch() {
    if (!confirmPw.value) {
      matchNote.classList.add("ui-demo-hidden");
      return false;
    }
    const match = newPw.value === confirmPw.value;
    matchNote.classList.remove("ui-demo-hidden");
    matchNote.textContent = match ? "Passwords match" : "Passwords do not match";
    matchNote.style.color = match ? "var(--color-success)" : "var(--color-danger)";
    return match;
  }

  confirmPw.addEventListener("input", () => {
    checkMatch();
    checkCanSave();
  });

  function checkCanSave() {
    const allFilled = currentPw.value.length > 0 && newPw.value.length > 0 && confirmPw.value.length > 0;
    const match = newPw.value === confirmPw.value;
    saveBtn.disabled = !(allFilled && match);
  }

  currentPw.addEventListener("input", checkCanSave);

  // Save
  saveBtn.addEventListener("click", () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="ui-demo-spinner ui-demo-spinner-dark" style="width:14px;height:14px;margin-right:6px;"></span> Updating…`;

    setTimeout(() => {
      saveBtn.innerHTML = "Password Updated!";
      currentPw.value = "";
      newPw.value = "";
      confirmPw.value = "";
      pwBar.style.width = "0%";
      pwLabel.textContent = "";
      matchNote.classList.add("ui-demo-hidden");

      setTimeout(() => {
        saveBtn.innerHTML = "Update Password";
        saveBtn.disabled = true;
      }, 1500);
    }, 1500);
  });
}

// ── Notification Preferences ─────────────────────────────────────────────────
function buildNotifSection() {
  return `
    <div class="content-card" style="padding:20px; margin-bottom:16px;">
      <h3 style="margin:0 0 16px; font-size:1rem; font-weight:600;">Notification Preferences</h3>
      <div class="ui-demo-note" style="margin-bottom:14px;">Each toggle saves automatically — no Save button needed.</div>

      ${[
        { id: "notif-email", label: "Email notifications", checked: true },
        { id: "notif-browser", label: "Browser notifications", checked: false },
        { id: "notif-digest", label: "Weekly digest", checked: true },
      ]
        .map(
          ({ id, label, checked }) => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--color-border);">
          <label for="${id}" style="font-size:0.9rem; cursor:pointer; user-select:none;">${label}</label>
          <div style="display:flex; align-items:center; gap:10px;">
            <span data-notif-saved="${id}" style="font-size:0.78rem; color:var(--color-success); opacity:0; transition:opacity 0.3s;">Saved</span>
            <input type="checkbox" id="${id}" data-notif-toggle="${id}" ${checked ? "checked" : ""} style="width:16px;height:16px;cursor:pointer;" />
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function initNotifSection(root) {
  root.querySelectorAll("[data-notif-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const id = checkbox.dataset.notifToggle;
      const indicator = root.querySelector(`[data-notif-saved="${id}"]`);
      if (indicator) showSavedIndicator(indicator);
    });
  });
}

// ── Danger Zone ──────────────────────────────────────────────────────────────
function buildDangerSection() {
  return `
    <div class="content-card" style="padding:20px; border:2px solid var(--color-danger);">
      <h3 style="margin:0 0 4px; font-size:1rem; font-weight:600; color:var(--color-danger);">Danger Zone</h3>
      <div class="ui-demo-note" style="margin-bottom:16px;">These actions are permanent and cannot be undone.</div>

      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <div>
          <div style="font-size:0.9rem; font-weight:500; margin-bottom:2px;">Delete Account</div>
          <div class="ui-demo-note">Your account, projects, and all data will be permanently deleted.</div>
        </div>
        <button class="btn btn-danger btn-sm" data-settings-delete-trigger style="flex-shrink:0;">Delete Account</button>
      </div>

      <!-- Confirm panel — hidden until triggered -->
      <div class="ui-demo-hidden" data-settings-delete-confirm style="margin-top:16px; padding-top:16px; border-top:1px solid var(--color-border);">
        <div class="alert alert-danger" style="margin-bottom:12px;">
          <div class="alert-title">This cannot be undone</div>
          All your projects, data, and settings will be permanently deleted.
        </div>
        <div class="ui-demo-field" style="margin-bottom:12px;">
          <label class="ui-demo-label" for="settings-delete-input">Type <strong>DELETE</strong> to confirm</label>
          <input id="settings-delete-input" class="form-control" type="text" placeholder="DELETE" data-settings-delete-input autocomplete="off" />
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-danger btn-sm" disabled data-settings-delete-confirm-btn>Delete My Account</button>
          <button class="btn btn-secondary btn-sm" data-settings-delete-cancel>Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function initDangerSection(root) {
  const trigger = root.querySelector("[data-settings-delete-trigger]");
  const confirmPanel = root.querySelector("[data-settings-delete-confirm]");
  const deleteInput = root.querySelector("[data-settings-delete-input]");
  const confirmBtn = root.querySelector("[data-settings-delete-confirm-btn]");
  const cancelBtn = root.querySelector("[data-settings-delete-cancel]");

  trigger.addEventListener("click", () => {
    trigger.classList.add("ui-demo-hidden");
    confirmPanel.classList.remove("ui-demo-hidden");
    deleteInput.focus();
  });

  cancelBtn.addEventListener("click", () => {
    trigger.classList.remove("ui-demo-hidden");
    confirmPanel.classList.add("ui-demo-hidden");
    deleteInput.value = "";
    confirmBtn.disabled = true;
  });

  deleteInput.addEventListener("input", () => {
    confirmBtn.disabled = deleteInput.value !== "DELETE";
  });

  confirmBtn.addEventListener("click", () => {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="ui-demo-spinner" style="width:14px;height:14px;margin-right:6px;"></span> Deleting…`;
    // In a real app: call API, then redirect. Here we reset the demo.
    setTimeout(() => {
      confirmPanel.classList.add("ui-demo-hidden");
      trigger.classList.remove("ui-demo-hidden");
      deleteInput.value = "";
      confirmBtn.innerHTML = "Delete My Account";
      confirmBtn.disabled = true;
      const note = document.createElement("div");
      note.className = "alert alert-info";
      note.style.marginTop = "12px";
      note.textContent = "Demo only — in a real app this would delete the account and redirect.";
      confirmPanel.parentElement.appendChild(note);
      setTimeout(() => note.remove(), 3500);
    }, 1800);
  });
}

// ── Build full demo ──────────────────────────────────────────────────────────
function buildSettingsDemo() {
  const container = document.querySelector("[data-settings-demo]");
  if (!container) return;

  container.innerHTML = `
    <div class="ui-demo">
      <div class="ui-demo-title">Live Settings &amp; Profile Demo — interact with each section</div>

      ${buildProfileSection()}
      ${buildPasswordSection()}
      ${buildNotifSection()}
      ${buildDangerSection()}
    </div>
  `;

  initProfileSection(container);
  initPasswordSection(container);
  initNotifSection(container);
  initDangerSection(container);
}

buildSettingsDemo();
