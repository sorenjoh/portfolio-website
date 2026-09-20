// Loads projects.json and renders the filterable portfolio grid.

let allProjects = [];
let activeCategory = "alle";

async function loadProjects() {
  try {
    const res = await fetch("projects.json", { cache: "no-store" });
    allProjects = await res.json();
  } catch (err) {
    console.error("Kunne ikke hente projects.json", err);
    allProjects = [];
  }
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const filtered = allProjects.filter(
    (p) => activeCategory === "alle" || p.category === activeCategory
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">Ingen projekter i denne kategori endnu.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const bg = p.thumbnail
        ? `background-image:url('${p.thumbnail}')`
        : `background:linear-gradient(135deg, ${p.coverColor || "#1B4B4F"}, #0b0b0d)`;
      return `
        <article class="card" data-id="${p.id}">
          <div class="thumb" style="${bg}">
            <span class="tag">${p.category}</span>
          </div>
          <div class="meta">
            <h3>${escapeHtml(p.title)}</h3>
            <p class="sub">${escapeHtml(p.client || "")}${p.year ? " · " + p.year : ""}</p>
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
    mediaEl.innerHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg, ${p.coverColor || "#1B4B4F"}, #0b0b0d)"></div>`;
  }

  document.getElementById("lightbox-title").textContent = p.title;
  document.getElementById("lightbox-desc").textContent = p.description || "";
  document.getElementById("lightbox").classList.add("open");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.getElementById("lightbox-media").innerHTML = "";
}

// Converts a normal YouTube/Vimeo link to an embeddable URL
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
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
  div.textContent = str;
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

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});
