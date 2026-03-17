const dbURL = "https://bms-database-d8fba-default-rtdb.firebaseio.com";

async function loadFeaturedProjects() {
  const container = document.getElementById("featured-projects");
  if (!container) return;

  container.innerHTML = "";

  // Fetch featured projects keys
  const featuredRes = await fetch(`${dbURL}/system/featured_projects.json`);
  const featured = await featuredRes.json();
  if (!featured) return;

  const keys = Object.keys(featured);
  if (keys.length === 0) return;

  for (const key of keys) {
    // Fetch project details
    const projectRes = await fetch(`${dbURL}/BMS/PROJECTS/${key}.json`);
    const project = await projectRes.json();
    if (!project) continue;

    const imageURL = project.image ? project.image.replace(/^"+|"+$/g, '') : '';
    const logoURL = project.logo ? project.logo.replace(/^"+|"+$/g, '') : '';
    const name = project.name ? project.name.replace(/^"+|"+$/g, '') : '';
    const description = project.description ? project.description.replace(/^"+|"+$/g, '') : '';
    const wing = project.wing ? project.wing.replace(/^"+|"+$/g, '') : '';

    // Create card column
    const cardCol = document.createElement("div");
    cardCol.className = "col-12 col-md-6 col-lg-4 mb-4"; // Bootstrap grid

    cardCol.innerHTML = `
      <div class="card h-100 project-card shadow-sm" style="cursor:pointer; overflow:hidden;"
           data-bs-toggle="modal" data-bs-target="#projectModal"
           data-name="${name}" data-description="${description}" data-image="${imageURL}" data-logo="${logoURL}" data-wing="${wing}">

        <div class="d-flex align-items-center justify-content-center gap-2 bg-white text-dark px-2 py-1 border-bottom"
             style="font-weight:600; font-size:0.875rem;">
          <img src="assets/media/wings/${wing}.jpg" alt="${wing} logo" style="width:20px; height:20px; object-fit:contain;">
          <span>${wing}</span>
        </div>

        <div class="w-100" style="aspect-ratio:1/1; overflow:hidden; background:#f8f9fa;">
          <img src="${imageURL}" class="project-image w-100 h-100" alt="${name}" style="object-fit:cover; display:block;">
        </div>

        <div class="card-body d-flex flex-column">
          <h5 class="fw-semibold mb-2 d-flex align-items-center overflow-hidden">
            ${logoURL ? `<img class="project-logo me-2" src="${logoURL}" style="width:24px; height:24px; object-fit:contain; flex-shrink:0;">` : ''}
            <span class="text-truncate d-block w-100">${name}</span>
          </h5>

          <p class="mb-0 project-card-desc">${description}</p>
        </div>
      </div>
    `;

    container.appendChild(cardCol);
  }

  // Modal click handler — now after cards exist
  const modalContent = document.getElementById("modalContent");
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.getAttribute("data-name");
      const description = card.getAttribute("data-description");
      const image = card.getAttribute("data-image");
      const logo = card.getAttribute("data-logo");

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
                <hr>
                <div class="text-start"><p>${description}</p></div>
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
                <hr class="flex-shrink-0">
                <div class="text-dark overflow-auto flex-grow-1 pe-2">
                  <p>${description}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    });
  });
}

loadFeaturedProjects();