const dbURL = "https://bms-database-d8fba-default-rtdb.firebaseio.com";

function cleanText(value) {
  return value ? value.replace(/^"+|"+$/g, "") : "";
}

function summarizeText(text, wordLimit = 10) {
  const words = text.trim().split(/\s+/);
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : text;
}

async function loadFeaturedProjects() {
  const container = document.getElementById("featured-projects");
  const modalContent = document.getElementById("modalContent");

  if (!container || !modalContent) return;

  container.innerHTML = "";

  try {
    const featuredRes = await fetch(`${dbURL}/system/featured_projects.json`);
    const featured = await featuredRes.json();

    if (!featured) return;

    const keys = Object.keys(featured);
    if (keys.length === 0) return;

    for (const key of keys) {
      const projectRes = await fetch(`${dbURL}/BMS/PROJECTS/${key}.json`);
      const project = await projectRes.json();
      if (!project) continue;

      const imageURL = cleanText(project.image);
      const logoURL = cleanText(project.logo);
      const name = cleanText(project.name);
      const description = cleanText(project.description);
      const wing = cleanText(project.wing);

      const cardCol = document.createElement("div");
      cardCol.className = "col-12 col-md-6 col-lg-4 d-flex mb-4";

      cardCol.innerHTML = `
        <div class="card w-100 h-100 featured-card"
             style="cursor:pointer; overflow:hidden;"
             data-bs-toggle="modal"
             data-bs-target="#projectModal"
             data-name="${name}"
             data-description="${description}"
             data-image="${imageURL}"
             data-logo="${logoURL}"
             data-wing="${wing}">

          <div class="card-header d-flex align-items-center justify-content-center gap-2 py-2"
               style="font-weight:800; font-size:1.5rem; cursor:pointer;">
            <img src="assets/media/wings/${wing}.jpg"
                 alt="${wing} logo"
                 style="width:35px; height:35px; object-fit:contain;">
            <span>${wing}</span>
          </div>

          <div class="w-100" style="aspect-ratio:4/3; overflow:hidden;">
            <img src="${imageURL}"
                 class="w-100 h-100"
                 alt="${name}"
                 style="object-fit:cover; display:block;">
          </div>

          <div class="card-body d-flex flex-column">
            <h5 class="fw-semibold mb-2 d-flex align-items-center overflow-hidden">
              ${logoURL ? `<img class="project-logo me-2" src="${logoURL}" alt="${name} logo" style="width:50px; height:50px; object-fit:contain; flex-shrink:0;">` : ""}
              <span class="text-truncate d-block w-100" style="font-size: 1.25rem; font-weight:700;">${name}</span>
            </h5>

            <p class="mb-0 project-card-desc text-body-md">
              ${summarizeText(description, 10)}
            </p>
          </div>
        </div>
      `;

      container.appendChild(cardCol);
    }

    container.addEventListener("click", (e) => {
      const card = e.target.closest(".featured-card");
      if (!card) return;

      const name = card.getAttribute("data-name") || "";
      const description = card.getAttribute("data-description") || "";
      const image = card.getAttribute("data-image") || "";
      const logo = card.getAttribute("data-logo") || "";

      modalContent.innerHTML = `
        <div class="container-fluid">
          <div class="row g-4">

            <!-- Mobile single column -->
            <div class="col-12 d-md-none">
              <div class="text-dark overflow-auto" style="max-height:80vh;">
                <div class="text-center mb-3">
                  <h3 class="fw-bold mb-3 text-dark">
                    ${logo ? `<img class="me-2 rounded" src="${logo}" alt="${name} logo" style="height:40px;">` : ''}${name}
                  </h3>
                  <img src="${image}" class="img-fluid rounded mb-3" alt="${name}">
                </div>
                <hr class="section-divider">
                <div class="text-start"><p class="text-body-lg">${description}</p></div>
              </div>
            </div>

            <!-- Desktop image -->
            <div class="col-md-6 d-none d-md-flex">
              <img src="${image}" class="img-fluid rounded w-100" alt="${name}" style="max-height:75vh; object-fit:contain; display:block;">
            </div>

            <!-- Desktop description -->
            <div class="col-md-6 d-none d-md-flex">
              <div class="w-100 d-flex flex-column" style="max-height:75vh;">
                <div class="mb-2 flex-shrink-0">
                  <h3 class="fw-bold mb-0 text-dark">
                    ${logo ? `<img class="me-2 rounded" src="${logo}" alt="${name} logo" style="height:40px;">` : ''}${name}
                  </h3>
                </div>
                <hr class="section-divider flex-shrink-0">
                <div class="text-dark overflow-auto flex-grow-1 pe-2">
                  <p class="text-body-lg">${description}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading featured projects:", error);
  }
}

loadFeaturedProjects();