// permissions-demo.js — Live role-based UI demo

const ROLES = ["admin", "member", "viewer", "guest"];

// What each role can see/do
const ROLE_CONFIG = {
  admin: {
    addProject: "active",
    editIcons: true,
    deleteButtons: true,
    settings: "active",
    label: "Admin",
  },
  member: {
    addProject: "active",
    editIcons: true,
    deleteButtons: false,
    settings: "disabled",
    label: "Member",
  },
  viewer: {
    addProject: "hidden",
    editIcons: false,
    deleteButtons: false,
    settings: "hidden",
    label: "Viewer",
  },
  guest: {
    addProject: "hidden",
    editIcons: false,
    deleteButtons: false,
    settings: "hidden",
    label: "Guest",
  },
};

function show(el) {
  el.classList.remove("ui-demo-hidden");
  el.removeAttribute("disabled");
  el.removeAttribute("title");
  el.style.visibility = "";
}

function hide(el) {
  el.classList.add("ui-demo-hidden");
}

function disable(el, tooltip) {
  el.classList.remove("ui-demo-hidden");
  el.setAttribute("disabled", "");
  if (tooltip) el.setAttribute("title", tooltip);
  el.style.opacity = "0.45";
  el.style.cursor = "not-allowed";
}

function resetBtn(el) {
  el.removeAttribute("disabled");
  el.removeAttribute("title");
  el.style.opacity = "";
  el.style.cursor = "";
}

function applyRole(role) {
  const cfg = ROLE_CONFIG[role];

  // ── Role label ──────────────────────────────────────────
  const label = document.querySelector("[data-perm-role-label]");
  if (label) label.textContent = `Current role: ${cfg.label}`;

  // ── Role switcher button states ──────────────────────────
  document.querySelectorAll("[data-perm-role-btn]").forEach((btn) => {
    btn.classList.toggle("btn-primary", btn.dataset.permRoleBtn === role);
    btn.classList.toggle("btn-secondary", btn.dataset.permRoleBtn !== role);
  });

  // ── "Add Project" button ─────────────────────────────────
  const addBtn = document.querySelector("[data-perm-add-project]");
  if (addBtn) {
    resetBtn(addBtn);
    if (cfg.addProject === "active") {
      show(addBtn);
    } else {
      hide(addBtn);
    }
  }

  // ── Edit icons per row ───────────────────────────────────
  document.querySelectorAll("[data-perm-edit-icon]").forEach((icon) => {
    if (cfg.editIcons) show(icon);
    else hide(icon);
  });

  // ── Delete buttons per row ───────────────────────────────
  document.querySelectorAll("[data-perm-delete-btn]").forEach((btn) => {
    resetBtn(btn);
    if (cfg.deleteButtons) show(btn);
    else hide(btn);
  });

  // ── Settings menu item ───────────────────────────────────
  const settingsItem = document.querySelector("[data-perm-settings-item]");
  if (settingsItem) {
    resetBtn(settingsItem);
    if (cfg.settings === "active") {
      show(settingsItem);
    } else if (cfg.settings === "disabled") {
      show(settingsItem);
      disable(settingsItem, "Contact admin to change settings");
    } else {
      hide(settingsItem);
    }
  }

  // ── Hide vs Disable panel ────────────────────────────────
  const hvdCreate = document.querySelector("[data-perm-hvd-create]");
  const hvdDelete = document.querySelector("[data-perm-hvd-delete]");
  const hvdCreateNote = document.querySelector("[data-perm-hvd-create-note]");
  const hvdDeleteNote = document.querySelector("[data-perm-hvd-delete-note]");

  if (hvdCreate) {
    resetBtn(hvdCreate);
    hvdCreate.classList.remove("btn-primary", "btn-secondary");
    if (role === "admin" || role === "member") {
      show(hvdCreate);
      hvdCreate.classList.add("btn-primary");
      if (hvdCreateNote) hvdCreateNote.textContent = "Visible + active — user can create";
    } else {
      hide(hvdCreate);
      if (hvdCreateNote) hvdCreateNote.textContent = "Hidden — this role never needs to see Create";
    }
  }

  if (hvdDelete) {
    resetBtn(hvdDelete);
    if (role === "admin") {
      show(hvdDelete);
      hvdDelete.classList.remove("btn-secondary");
      hvdDelete.classList.add("btn-danger");
      if (hvdDeleteNote) hvdDeleteNote.textContent = "Visible + danger style — admins can delete";
    } else if (role === "member") {
      show(hvdDelete);
      hvdDelete.classList.remove("btn-danger");
      hvdDelete.classList.add("btn-secondary");
      disable(hvdDelete, "Only admins can delete");
      if (hvdDeleteNote) hvdDeleteNote.textContent = "Disabled + tooltip — member knows it exists but cannot use it";
    } else {
      hide(hvdDelete);
      if (hvdDeleteNote) hvdDeleteNote.textContent = "Hidden — viewers and guests should never see Delete";
    }
  }
}

function buildDemo() {
  const container = document.querySelector("[data-permissions-demo]");
  if (!container) return;

  container.innerHTML = `
    <div class="ui-demo">
      <div class="ui-demo-title">Live Role-Based UI Demo — switch role to see the UI change</div>

      <div class="ui-demo-actions" style="flex-wrap:wrap; gap:8px; margin-bottom:20px;">
        <button class="btn btn-primary btn-sm" data-perm-role-btn="admin">Admin</button>
        <button class="btn btn-secondary btn-sm" data-perm-role-btn="member">Member</button>
        <button class="btn btn-secondary btn-sm" data-perm-role-btn="viewer">Viewer</button>
        <button class="btn btn-secondary btn-sm" data-perm-role-btn="guest">Guest</button>
        <span class="badge badge-info" data-perm-role-label style="align-self:center;">Current role: Admin</span>
      </div>

      <!-- Mock Project Dashboard -->
      <div class="content-card" style="padding:16px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
          <strong>Project Dashboard</strong>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" data-perm-add-project>+ Add Project</button>
            <button class="btn btn-secondary btn-sm" data-perm-settings-item>Settings</button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alpha Redesign</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                  <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" data-perm-edit-icon>Edit</button>
                    <button class="btn btn-danger btn-sm" data-perm-delete-btn>Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Beta Launch</td>
                <td><span class="badge badge-warning">In Review</span></td>
                <td>
                  <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" data-perm-edit-icon>Edit</button>
                    <button class="btn btn-danger btn-sm" data-perm-delete-btn>Delete</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Gamma Report</td>
                <td><span class="badge badge-info">Draft</span></td>
                <td>
                  <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" data-perm-edit-icon>Edit</button>
                    <button class="btn btn-danger btn-sm" data-perm-delete-btn>Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hide vs Disable Rule -->
      <div style="margin-top:20px;">
        <div class="ui-demo-title" style="margin-bottom:12px;">Hide vs Disable — rule in action</div>
        <div class="ui-demo-note" style="margin-bottom:12px;">
          <strong>Create</strong> — Hidden for roles with no access at all (Viewer, Guest). Never disabled — seeing a greyed-out Create button you cannot use adds confusion with no benefit.<br/>
          <strong>Delete</strong> — Admin: full access. Member: disabled with tooltip (they know it exists, may get admin access later). Viewer/Guest: hidden entirely.
        </div>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
          <button class="btn btn-primary btn-sm" data-perm-hvd-create>Create Project</button>
          <button class="btn btn-danger btn-sm" data-perm-hvd-delete>Delete Project</button>
        </div>
        <div class="ui-demo-note" style="display:flex; flex-direction:column; gap:4px;">
          <span data-perm-hvd-create-note></span>
          <span data-perm-hvd-delete-note></span>
        </div>
      </div>
    </div>
  `;

  // Wire up role buttons
  container.querySelectorAll("[data-perm-role-btn]").forEach((btn) => {
    btn.addEventListener("click", () => applyRole(btn.dataset.permRoleBtn));
  });

  // Set initial state
  applyRole("admin");
}

buildDemo();
