const dbURL = "https://bms-database-d8fba-default-rtdb.firebaseio.com";

function cleanText(value) {
  return value ? value.replace(/^"+|"+$/g, "") : "";
}

function truncateText(value, maxLength = 110) {
  const text = cleanText(value).replace(/\s+/g, " ").trim();
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function normalizeProjectLinks(links) {
  if (!links || typeof links !== "object") {
    return [];
  }

  return Object.entries(links)
    .map(([label, value]) => {
      const href = cleanText(String(value));
      if (!href || !/^(https?:\/\/|mailto:)/i.test(href)) {
        return null;
      }

      return { label, href };
    })
    .filter(Boolean);
}

function buildProjectModal({ name, description, image, logo, wing, links }) {
  const safeWing = wing ? `<span class="tag project-modal-tag">${wing}</span>` : "";
  const safeLogo = logo
    ? `<img src="${logo}" alt="${name} logo" class="project-logo project-modal-logo">`
    : "";
  const safeImage = image
    ? `<div class="project-modal-image-frame"><img src="${image}" alt="${name}" class="project-modal-image"></div>`
    : "";

  const safeLinks = normalizeProjectLinks(links);
  const actions = safeLinks.length
    ? `<div class="project-modal-actions">${safeLinks.map(({ label, href }) => `<a class="project-modal-link" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`).join("")}</div>`
    : "";

  const metadata = safeWing
    ? `<div class="project-modal-meta">${safeWing}</div>`
    : "";

  return `
    <article class="project-modal-shell" aria-label="Project details for ${name}">
      <header class="project-modal-header">
        <div class="project-modal-header-main">
          ${safeLogo}
          <div class="project-modal-heading">
            <div class="project-modal-kicker">${safeWing}</div>
            <h2 class="section-title project-modal-title">${name}</h2>
          </div>
        </div>
        <button type="button" class="project-modal-close" data-bs-dismiss="modal" aria-label="Close project details">
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </header>

      <div class="project-modal-scroll">
        <div class="project-modal-content-wrap">
          <p class="project-modal-description">${description}</p>

          ${safeImage}

          ${metadata}
          ${actions}
        </div>
      </div>
    </article>
  `;
}

async function loadFeaturedProjects() {
  const container = document.getElementById("featured-projects");
  const modalContent = document.getElementById("modalContent");

  if (!container || !modalContent) {
    return;
  }

  container.innerHTML = "";

  try {
    const featuredRes = await fetch(`${dbURL}/system/featured_projects.json`);
    const featured = await featuredRes.json();

    if (!featured) {
      container.innerHTML = "<p class=\"page-meta\">No featured projects available right now.</p>";
      return;
    }

    const keys = Object.keys(featured);
    if (!keys.length) {
      container.innerHTML = "<p class=\"page-meta\">No featured projects available right now.</p>";
      return;
    }

    for (const key of keys) {
      const projectRes = await fetch(`${dbURL}/BMS/PROJECTS/${key}.json`);
      const project = await projectRes.json();
      if (!project) {
        continue;
      }

      const imageURL = cleanText(project.image);
      const logoURL = cleanText(project.logo);
      const name = cleanText(project.name);
      const fullDescription = cleanText(project.description);
      const cardDescription = truncateText(fullDescription);
      const wing = cleanText(project.wing);
      const links = project.links && typeof project.links === "object" ? project.links : null;

      const row = document.createElement("article");
      row.className = "project-row featured-card";
      row.setAttribute("data-bs-toggle", "modal");
      row.setAttribute("data-bs-target", "#projectModal");
      row.setAttribute("data-name", name);
      row.setAttribute("data-full-description", fullDescription);
      row.setAttribute("data-description", cardDescription);
      row.setAttribute("data-image", imageURL);
      row.setAttribute("data-logo", logoURL);
      row.setAttribute("data-wing", wing);
      row.setAttribute("data-links", links ? JSON.stringify(links) : "");
      row.style.cursor = "pointer";

      row.innerHTML = `
        ${logoURL ? `<img src="${logoURL}" alt="${name} logo" class="project-logo">` : "<span class=\"project-logo\" aria-hidden=\"true\"></span>"}
        <div>
          <h3 class="project-title">${name}</h3>
          <p class="project-description">${cardDescription}</p>
          <div class="tag-stack" style="margin-top: 0.5rem;">
            ${wing ? `<span class="tag">${wing}</span>` : ""}
          </div>
        </div>
        <div class="project-cta" aria-hidden="true"><i class="bi bi-chevron-right"></i></div>
      `;

      container.appendChild(row);
    }

    container.onclick = (event) => {
      const card = event.target.closest(".featured-card");
      if (!card) {
        return;
      }

      const rawLinks = card.getAttribute("data-links");
      let parsedLinks = null;

      try {
        parsedLinks = rawLinks ? JSON.parse(rawLinks) : null;
      } catch (error) {
        parsedLinks = null;
      }

      modalContent.innerHTML = buildProjectModal({
        name: card.getAttribute("data-name") || "",
        description: card.getAttribute("data-full-description") || card.getAttribute("data-description") || "",
        image: card.getAttribute("data-image") || "",
        logo: card.getAttribute("data-logo") || "",
        wing: card.getAttribute("data-wing") || "",
        links: parsedLinks
      });
    };
  } catch (error) {
    console.error("Error loading featured projects:", error);
    container.innerHTML = "<p class=\"page-meta\">Failed to load featured projects.</p>";
  }
}

window.loadFeaturedProjects = loadFeaturedProjects;
