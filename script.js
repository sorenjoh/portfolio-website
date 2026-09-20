// ============================================================
// Søren Johansen — Portfolio
// Renders the work grid + lightbox, and hosts a hidden admin
// panel that writes straight back to projects.json on GitHub.
// ============================================================

let allProjects = [];
let activeCategory = "alle";

// ---------- Public site: load + render ----------

async function loadProjects() {
  try {
    const res = await fetch("projects.json", { cache: "no-store" });
    allProjects = await res.json();
  } catch (err) {
    console.error("Could not load projects.json", err);
    allProjects = [];
  }
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("grid");
  if (!grid) return; // not on the work page

  const filtered = allProjects.filter(
    (p) => activeCategory === "alle" || p.category === activeCategory
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No projects in this category yet.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const bg = p.thumbnail
        ? `background-image:url('${p.thumbnail}')`
        : `background:linear-gradient(135deg, ${p.coverColor || "#222"}, #0a0a0a)`;
      return `
        <article class="card" data-id="${p.id}" style="${bg}">
          <div class="overlay">
            <h3>${escapeHtml(p.title)}</h3>
            <p class="sub">${p.category}${p.client ? " · " + escapeHtml(p.client) : ""}</p>
          </div>
        </article>`;
    })
    .join("");

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => openLightbox(card.dataset.id));
  });
}

function openLightbox(id) {
  const p = allProjects.find((proj) => proj.id === id);
  if (!p) return;

  const mediaEl = document.getElementById("lightbox-media");
  if (p.category === "video" && p.videoUrl) {
    mediaEl.innerHTML = `<iframe src="${toEmbedUrl(p.videoUrl)}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  } else if (p.thumbnail) {
    mediaEl.innerHTML = `<img src="${p.thumbnail}" alt="${escapeHtml(p.title)}">`;
  } else {
    mediaEl.innerHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg, ${p.coverColor || "#222"}, #0a0a0a)"></div>`;
  }

  document.getElementById("lightbox-title").textContent = p.title;
  document.getElementById("lightbox-desc").textContent = p.description || "";
  document.getElementById("lightbox").classList.add("open");
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  lb.classList.remove("open");
  document.getElementById("lightbox-media").innerHTML = "";
}

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();

  document.querySelectorAll(".filter-bar button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-bar button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      renderGrid();
    });
  });

  const lbClose = document.getElementById("lightbox-close");
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  const lb = document.getElementById("lightbox");
  if (lb) lb.addEventListener("click", (e) => { if (e.target.id === "lightbox") closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
});

// ============================================================
// Hidden admin panel
// Open it from the browser console by typing:  admin()
// ============================================================

// SHA-256 hash of the passcode. Default hashes "changeme" —
// change this before you publish. See README.md for how to
// generate a new hash for your own passcode.
const ADMIN_CODE_HASH = "057ba03d6c44104863dc7361fe4578965d1887360f90a0895882e58a6248fc86";

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAdminConfig() {
  const raw = localStorage.getItem("admin-config");
  return raw ? JSON.parse(raw) : null;
}

function setAdminConfig(cfg) {
  localStorage.setItem("admin-config", JSON.stringify(cfg));
}

let adminDraft = []; // working copy of projects while the panel is open
let adminEditingId = null;

async function admin() {
  if (sessionStorage.getItem("admin-unlocked") !== "true") {
    const code = prompt("Admin code:");
    if (code === null) return;
    const hash = await sha256Hex(code);
    if (hash !== ADMIN_CODE_HASH) {
      alert("Incorrect code.");
      return;
    }
    sessionStorage.setItem("admin-unlocked", "true");
  }
  openAdminPanel();
}
window.admin = admin;

function openAdminPanel() {
  ensureAdminOverlay();
  adminDraft = JSON.parse(JSON.stringify(allProjects)); // copy so cancel = no changes
  adminEditingId = null;
  renderAdminList();
  resetAdminForm();

  const cfg = getAdminConfig();
  document.getElementById("admin-owner").value = cfg?.owner || "";
  document.getElementById("admin-repo").value = cfg?.repo || "";
  document.getElementById("admin-branch").value = cfg?.branch || "main";
  document.getElementById("admin-token").value = cfg?.token || "";

  document.getElementById("admin-overlay").classList.add("open");
}

function closeAdminPanel() {
  document.getElementById("admin-overlay").classList.remove("open");
}

function ensureAdminOverlay() {
  if (document.getElementById("admin-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "admin-overlay";
  overlay.className = "admin-overlay";
  overlay.innerHTML = `
    <div class="admin-panel">
      <button class="admin-close-x" id="admin-close-x">&times;</button>
      <h2>Admin</h2>
      <p class="admin-sub">Add, edit or remove projects. Changes are written straight to projects.json on GitHub.</p>

      <fieldset>
        <legend>GitHub connection</legend>
        <div class="admin-row">
          <div>
            <label>Owner</label>
            <input id="admin-owner" placeholder="sorenjoh">
          </div>
          <div>
            <label>Repo</label>
            <input id="admin-repo" placeholder="portfolio-website">
          </div>
        </div>
        <div class="admin-row">
          <div>
            <label>Branch</label>
            <input id="admin-branch" placeholder="main">
          </div>
          <div>
            <label>Personal access token</label>
            <input id="admin-token" type="password" placeholder="github_pat_...">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend id="admin-form-legend">New project</legend>
        <label>Title</label>
        <input id="f-title">
        <div class="admin-row">
          <div>
            <label>Category</label>
            <select id="f-category">
              <option value="video">Video</option>
              <option value="foto">Foto</option>
            </select>
          </div>
          <div>
            <label>Year</label>
            <input id="f-year" placeholder="2026">
          </div>
        </div>
        <label>Client</label>
        <input id="f-client">
        <label>Description</label>
        <textarea id="f-description"></textarea>
        <div class="admin-row">
          <div>
            <label>Video URL (YouTube/Vimeo)</label>
            <input id="f-videoUrl">
          </div>
          <div>
            <label>Thumbnail URL</label>
            <input id="f-thumbnail">
          </div>
        </div>
        <label>Fallback color</label>
        <input id="f-coverColor" type="color" value="#222222">
        <div class="admin-actions">
          <button class="admin-btn primary" id="admin-save-item">Add to list</button>
          <button class="admin-btn ghost" id="admin-cancel-edit" style="display:none;">Cancel edit</button>
        </div>
      </fieldset>

      <div id="admin-list"></div>

      <div class="admin-actions">
        <button class="admin-btn primary" id="admin-save-changes">Save changes</button>
        <button class="admin-btn ghost" id="admin-cancel-all">Close without saving</button>
      </div>
      <div class="admin-status" id="admin-status"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("admin-close-x").addEventListener("click", closeAdminPanel);
  document.getElementById("admin-cancel-all").addEventListener("click", closeAdminPanel);
  document.getElementById("admin-cancel-edit").addEventListener("click", resetAdminForm);
  document.getElementById("admin-save-item").addEventListener("click", saveAdminItem);
  document.getElementById("admin-save-changes").addEventListener("click", saveChangesToGitHub);
}

function renderAdminList() {
  const list = document.getElementById("admin-list");
  if (adminDraft.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">No projects yet.</p>`;
    return;
  }
  list.innerHTML = adminDraft
    .map(
      (p) => `
    <div class="admin-list-item">
      <div>
        <div class="l-title">${escapeHtml(p.title)}</div>
        <div class="l-meta">${p.category} · ${escapeHtml(p.client || "")} ${p.year || ""}</div>
      </div>
      <div class="l-actions">
        <button onclick="editAdminItem('${p.id}')">Edit</button>
        <button onclick="deleteAdminItem('${p.id}')">Delete</button>
      </div>
    </div>`
    )
    .join("");
}

function saveAdminItem() {
  const title = document.getElementById("f-title").value.trim();
  if (!title) { alert("Title is required."); return; }

  const data = {
    id: adminEditingId || "proj-" + Date.now(),
    title,
    category: document.getElementById("f-category").value,
    year: document.getElementById("f-year").value.trim(),
    client: document.getElementById("f-client").value.trim(),
    description: document.getElementById("f-description").value.trim(),
    videoUrl: document.getElementById("f-videoUrl").value.trim(),
    thumbnail: document.getElementById("f-thumbnail").value.trim(),
    coverColor: document.getElementById("f-coverColor").value,
  };

  if (adminEditingId) {
    const idx = adminDraft.findIndex((p) => p.id === adminEditingId);
    adminDraft[idx] = data;
  } else {
    adminDraft.unshift(data);
  }

  resetAdminForm();
  renderAdminList();
}

function editAdminItem(id) {
  const p = adminDraft.find((proj) => proj.id === id);
  if (!p) return;
  adminEditingId = id;
  document.getElementById("admin-form-legend").textContent = "Edit project";
  document.getElementById("f-title").value = p.title;
  document.getElementById("f-category").value = p.category;
  document.getElementById("f-year").value = p.year || "";
  document.getElementById("f-client").value = p.client || "";
  document.getElementById("f-description").value = p.description || "";
  document.getElementById("f-videoUrl").value = p.videoUrl || "";
  document.getElementById("f-thumbnail").value = p.thumbnail || "";
  document.getElementById("f-coverColor").value = p.coverColor || "#222222";
  document.getElementById("admin-cancel-edit").style.display = "inline-block";
}

function deleteAdminItem(id) {
  if (!confirm("Delete this project?")) return;
  adminDraft = adminDraft.filter((p) => p.id !== id);
  renderAdminList();
}

function resetAdminForm() {
  adminEditingId = null;
  document.getElementById("admin-form-legend").textContent = "New project";
  ["f-title", "f-year", "f-client", "f-description", "f-videoUrl", "f-thumbnail"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
  document.getElementById("f-category").value = "video";
  document.getElementById("f-coverColor").value = "#222222";
  document.getElementById("admin-cancel-edit").style.display = "none";
}

async function saveChangesToGitHub() {
  const status = document.getElementById("admin-status");
  const cfg = {
    owner: document.getElementById("admin-owner").value.trim(),
    repo: document.getElementById("admin-repo").value.trim(),
    branch: document.getElementById("admin-branch").value.trim() || "main",
    token: document.getElementById("admin-token").value.trim(),
  };

  if (!cfg.owner || !cfg.repo || !cfg.token) {
    status.textContent = "Fill in owner, repo and token first.";
    status.className = "admin-status err";
    return;
  }

  setAdminConfig(cfg);
  status.textContent = "Saving…";
  status.className = "admin-status";

  try {
    const apiBase = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/projects.json`;

    // 1. get current file sha (required to update an existing file)
    const getRes = await fetch(`${apiBase}?ref=${cfg.branch}`, {
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" },
    });
    if (!getRes.ok) throw new Error(`Could not read current file (${getRes.status})`);
    const getData = await getRes.json();

    // 2. push updated content
    const jsonString = JSON.stringify(adminDraft, null, 2);
    const content = btoa(unescape(encodeURIComponent(jsonString)));

    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({
        message: "Update projects.json via admin panel",
        content,
        sha: getData.sha,
        branch: cfg.branch,
      }),
    });
    if (!putRes.ok) {
      const errBody = await putRes.json().catch(() => ({}));
      throw new Error(errBody.message || `GitHub rejected the update (${putRes.status})`);
    }

    // 3. reflect the change immediately in this tab, no reload needed
    allProjects = adminDraft;
    renderGrid();

    status.textContent = "Saved. Live on the site within a minute or so.";
    status.className = "admin-status ok";
  } catch (err) {
    console.error(err);
    status.textContent = "Save failed: " + err.message;
    status.className = "admin-status err";
  }
}

window.editAdminItem = editAdminItem;
window.deleteAdminItem = deleteAdminItem;
