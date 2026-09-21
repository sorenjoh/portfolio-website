// ============================================================
// Søren Johansen — Portfolio
// Builds the shared chrome (header, nav, filterbar, footer,
// lightbox), renders the work grid, and hosts a hidden admin
// panel that writes straight back to projects.json on GitHub.
// ============================================================

// ------------------------------------------------------------
// SITE — alt fælles indhold står ÉT sted.
// Ret her, og det opdateres på alle sider automatisk.
// ------------------------------------------------------------

const SITE = {
  name: "SØREN JOHANSEN",
  tagline: "FILMPRODUCER / VIDEOREDAKTØR / FOTOGRAF",

  // Fanebladsikon. Skift stien her, så følger alle sider med.
  favicon: "assets/sj_icon.ico",

  // Nøglen matcher data-page på <body> på hver side.
  nav: [
    { page: "work",    label: "Arbejde", href: "./" },
    { page: "bio",     label: "Bio",     href: "bio.html" },
    { page: "contact", label: "Kontakt", href: "contact.html" },
  ],

  // Filtre på forsiden. "value" skal matche category i projects.json.
  categories: [
    { value: "alle",  label: "Alle" },
    { value: "video", label: "Video" },
    { value: "foto",  label: "Foto" },
  ],

  footer: {
    owner: "Søren Johansen",
    location: "Baseret i — København, Danmark",
  },

  // Bruges på kontaktsiden.
  contact: {
    email: "din@email.dk",
    links: [
      { label: "Instagram", url: "https://instagram.com/" },
      { label: "LinkedIn",  url: "https://linkedin.com/" },
    ],
  },
};

let allProjects = [];
let activeCategory = "alle";

// ------------------------------------------------------------
// Fælles chrome — bygges på alle sider fra SITE ovenfor
// ------------------------------------------------------------

function currentPage() {
  return document.body.dataset.page || "work";
}

function buildFavicon() {
  if (!SITE.favicon) return;
  let link = document.querySelector('link[rel~="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = SITE.favicon;
}

function buildHeader() {
  const host = document.getElementById("site-header");
  if (!host) return;
  const page = currentPage();

  const links = SITE.nav
    .map(
      (item) =>
        `<a href="${item.href}"${item.page === page ? ' class="active"' : ""}>${escapeHtml(item.label)}</a>`
    )
    .join("");

  host.innerHTML = `
    <div class="wrap">
      <a href="./" class="site-title reveal" style="--d:0ms">${escapeHtml(SITE.name)}</a>
      <p class="site-tagline reveal" style="--d:140ms">${escapeHtml(SITE.tagline)}</p>
      <nav class="site-nav reveal" style="--d:260ms">${links}</nav>
    </div>`;
}

function buildFilterBar() {
  const host = document.getElementById("filter-bar");
  if (!host) return;

  host.innerHTML = SITE.categories
    .map(
      (c) =>
        `<button${c.value === activeCategory ? ' class="active"' : ""} data-category="${c.value}">${escapeHtml(c.label)}</button>`
    )
    .join("");
}

function buildContactLinks() {
  const host = document.getElementById("contact-links");
  if (!host) return;

  const all = [
    { label: SITE.contact.email, url: "mailto:" + SITE.contact.email, external: false },
    ...SITE.contact.links.map((l) => ({ ...l, external: true })),
  ];

  host.innerHTML = all
    .map(
      (l) =>
        `<a href="${l.url}"${l.external ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(l.label)}</a>`
    )
    .join("");
}

function buildFooter() {
  const host = document.getElementById("site-footer");
  if (!host) return;

  host.innerHTML = `
    <div class="wrap">
      <span>© ${new Date().getFullYear()} ${escapeHtml(SITE.footer.owner)}</span>
      <span>${escapeHtml(SITE.footer.location)}</span>
    </div>`;
}

function buildLightbox() {
  if (!document.getElementById("grid")) return; // kun nødvendig på arbejdssiden
  if (document.getElementById("lightbox")) return;

  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.id = "lightbox";
  lb.innerHTML = `
    <button class="lightbox-close" id="lightbox-close" aria-label="Luk">&times;</button>
    <div class="lightbox-inner">
      <div class="lightbox-media" id="lightbox-media"></div>
      <div class="lightbox-body">
        <h2 id="lightbox-title"></h2>
        <p id="lightbox-desc"></p>
      </div>
    </div>`;
  document.body.appendChild(lb);
}

function buildChrome() {
  if (currentPage() !== "work") document.body.classList.add("subpage");
  buildFavicon();
  buildHeader();
  buildFilterBar();
  buildContactLinks();
  buildFooter();
  buildLightbox();
}

// script.js ligger sidst i <body>, så DOM'et ovenfor findes allerede.
// Vi bygger med det samme — ingen blink, og animationerne starter samlet.
buildChrome();


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
    grid.innerHTML = `<div class="empty-state">Ingen projekter i denne kategori endnu.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p, i) => {
      const bg = p.thumbnail
        ? `background-image:url('${p.thumbnail}')`
        : `background:linear-gradient(135deg, ${p.coverColor || "#222"}, #0a0a0a)`;
      return `
        <article class="card" data-id="${p.id}" style="--i:${i}" tabindex="0" role="button" aria-label="${escapeHtml(p.title)}">
          <div class="card-media" style="${bg}"></div>
          <div class="overlay">
            <h3>${escapeHtml(p.title)}</h3>
            <p class="sub">${p.category}${p.client ? " · " + escapeHtml(p.client) : ""}</p>
          </div>
        </article>`;
    })
    .join("");

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => openLightbox(card.dataset.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(card.dataset.id);
      }
    });
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
const ADMIN_CODE_HASH = "c97adc4e1b1538e64cf507f8cdf426ef29de2f712af96b38251506d84e2e0c31";

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
    const code = prompt("Adminkode:");
    if (code === null) return;
    const hash = await sha256Hex(code);
    if (hash !== ADMIN_CODE_HASH) {
      alert("Forkert kode.");
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
      <p class="admin-sub">Tilføj, redigér eller slet projekter. Ændringer skrives direkte til projects.json på GitHub.</p>

      <fieldset>
        <legend>GitHub-forbindelse</legend>
        <div class="admin-row">
          <div>
            <label>Ejer (owner)</label>
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
            <label>Personligt adgangstoken</label>
            <input id="admin-token" type="password" placeholder="github_pat_...">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend id="admin-form-legend">Nyt projekt</legend>
        <label>Titel</label>
        <input id="f-title">
        <div class="admin-row">
          <div>
            <label>Kategori</label>
            <select id="f-category">
              <option value="video">Video</option>
              <option value="foto">Foto</option>
            </select>
          </div>
          <div>
            <label>År</label>
            <input id="f-year" placeholder="2026">
          </div>
        </div>
        <label>Kunde</label>
        <input id="f-client">
        <label>Beskrivelse</label>
        <textarea id="f-description"></textarea>
        <div class="admin-row">
          <div>
            <label>Video-link (YouTube/Vimeo)</label>
            <input id="f-videoUrl">
          </div>
          <div>
            <label>Billede-URL</label>
            <input id="f-thumbnail">
            <div class="admin-upload-row">
              <label class="admin-upload-btn" for="f-thumbnail-upload">Upload billede</label>
              <input type="file" id="f-thumbnail-upload" accept="image/*">
            </div>
            <p class="admin-field-status" id="f-thumbnail-status"></p>
          </div>
        </div>
        <label>Reservefarve</label>
        <input id="f-coverColor" type="color" value="#222222">
        <div class="admin-actions">
          <button class="admin-btn primary" id="admin-save-item">Tilføj til liste</button>
          <button class="admin-btn ghost" id="admin-cancel-edit" style="display:none;">Annullér redigering</button>
        </div>
      </fieldset>

      <div id="admin-list"></div>

      <div class="admin-actions">
        <button class="admin-btn primary" id="admin-save-changes">Gem ændringer</button>
        <button class="admin-btn ghost" id="admin-cancel-all">Luk uden at gemme</button>
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
  document.getElementById("f-thumbnail-upload").addEventListener("change", handleThumbnailUpload);
}

function renderAdminList() {
  const list = document.getElementById("admin-list");
  if (adminDraft.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">Ingen projekter endnu.</p>`;
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
  if (!title) { alert("Titel er påkrævet."); return; }

  const data = {
    id: adminEditingId || "proj-" + Date.now(),
    title,
    category: document.getElementById("f-category").value,
    year: valueOrPlaceholder("f-year"),
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
  document.getElementById("admin-form-legend").textContent = "Redigér projekt";
  document.getElementById("f-title").value = p.title;
  document.getElementById("f-category").value = p.category;
  document.getElementById("f-year").value = p.year || "";
  document.getElementById("f-client").value = p.client || "";
  document.getElementById("f-description").value = p.description || "";
  document.getElementById("f-videoUrl").value = p.videoUrl || "";
  document.getElementById("f-thumbnail").value = p.thumbnail || "";
  document.getElementById("f-coverColor").value = p.coverColor || "#222222";
  document.getElementById("f-thumbnail-status").textContent = "";
  document.getElementById("admin-cancel-edit").style.display = "inline-block";
}

function deleteAdminItem(id) {
  if (!confirm("Slet dette projekt?")) return;
  adminDraft = adminDraft.filter((p) => p.id !== id);
  renderAdminList();
}

function resetAdminForm() {
  adminEditingId = null;
  document.getElementById("admin-form-legend").textContent = "Nyt projekt";
  ["f-title", "f-year", "f-client", "f-description", "f-videoUrl", "f-thumbnail"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
  document.getElementById("f-category").value = "video";
  document.getElementById("f-coverColor").value = "#222222";
  document.getElementById("f-thumbnail-status").textContent = "";
  document.getElementById("admin-cancel-edit").style.display = "none";
}

// Reads an input's value; if left empty, falls back to its placeholder
// text (so the greyed-out example shown in the box is used as-is).
function valueOrPlaceholder(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  const v = el.value.trim();
  return v || el.placeholder || "";
}

// ---------- Image upload (stores files in assets/ on GitHub) ----------

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // strip data:...;base64,
    reader.onerror = () => reject(new Error("Kunne ikke læse filen."));
    reader.readAsDataURL(file);
  });
}

async function uploadImageToGitHub(file) {
  const cfg = {
    owner: valueOrPlaceholder("admin-owner"),
    repo: valueOrPlaceholder("admin-repo"),
    branch: valueOrPlaceholder("admin-branch"),
    token: document.getElementById("admin-token").value.trim(),
  };
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    throw new Error("Udfyld GitHub-forbindelsen ovenfor først.");
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
  const path = `assets/${Date.now()}-${safeName}`;
  const apiBase = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const base64 = await fileToBase64(file);

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify({
      message: `Upload billede ${safeName} via admin panel`,
      content: base64,
      branch: cfg.branch,
    }),
  });

  if (!putRes.ok) {
    const errBody = await putRes.json().catch(() => ({}));
    throw new Error(errBody.message || `Upload fejlede (${putRes.status})`);
  }

  return path;
}

async function handleThumbnailUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById("f-thumbnail-status");
  statusEl.textContent = "Uploader…";
  statusEl.className = "admin-field-status";

  try {
    const path = await uploadImageToGitHub(file);
    document.getElementById("f-thumbnail").value = path;
    statusEl.textContent = "Uploadet: " + path;
    statusEl.className = "admin-field-status ok";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Fejl: " + err.message;
    statusEl.className = "admin-field-status err";
  } finally {
    e.target.value = ""; // allow re-selecting the same file later
  }
}

async function saveChangesToGitHub() {
  const status = document.getElementById("admin-status");
  const cfg = {
    owner: valueOrPlaceholder("admin-owner"),
    repo: valueOrPlaceholder("admin-repo"),
    branch: valueOrPlaceholder("admin-branch"),
    token: document.getElementById("admin-token").value.trim(),
  };

  if (!cfg.owner || !cfg.repo || !cfg.token) {
    status.textContent = "Udfyld ejer, repo og token først.";
    status.className = "admin-status err";
    return;
  }

  setAdminConfig(cfg);
  status.textContent = "Gemmer…";
  status.className = "admin-status";

  try {
    const apiBase = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/projects.json`;

    // 1. get current file sha (required to update an existing file)
    const getRes = await fetch(`${apiBase}?ref=${cfg.branch}`, {
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" },
    });
    if (!getRes.ok) throw new Error(`Kunne ikke læse den nuværende fil (${getRes.status})`);
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
      throw new Error(errBody.message || `GitHub afviste opdateringen (${putRes.status})`);
    }

    // 3. reflect the change immediately in this tab, no reload needed
    allProjects = adminDraft;
    renderGrid();

    status.textContent = "Gemt. Er live på siden inden for et minuts tid.";
    status.className = "admin-status ok";
  } catch (err) {
    console.error(err);
    status.textContent = "Kunne ikke gemme: " + err.message;
    status.className = "admin-status err";
  }
}

window.editAdminItem = editAdminItem;
window.deleteAdminItem = deleteAdminItem;
