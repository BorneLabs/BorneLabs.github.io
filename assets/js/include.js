(function () {
  'use strict';

  const content = document.getElementById('content');
  const main = document.querySelector('.main');

  async function loadPage(page) {
    if (!content) return;

    const file = `Pages/${page.toLowerCase()}.html`;

    try {
      const res = await fetch(`${file}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);

      content.innerHTML = await res.text();

      // Call any page-specific functions
      if (typeof loadFeaturedProjects === "function") loadFeaturedProjects();

      // Reset main scroll to top
      if (main) main.scrollTo({ top: 0, behavior: "auto" });

    } catch (err) {
      content.innerHTML = `<div class="p-3 text-danger">Could not load "${file}"</div>`;
      console.error(err);
    }
  }

  function scrollToSection(id) {
    if (!main) return;

    const section = document.getElementById(id);
    if (!section) return;

    const offset = 70; // optional offset for headers
    const y = section.offsetTop - offset;

    main.scrollTo({
      top: y,
      behavior: "smooth"
    });
  }

  function router() {
    const hash = location.hash.replace("#", "");

    if (!hash) {
      loadPage("Home");
      return;
    }

    const [page, sectionId] = hash.split(":"); // handle #page:section

    loadPage(page).then(() => {
      if (sectionId) scrollToSection(sectionId);
    });
  }

  function initNavigation() {
    document.addEventListener("click", e => {

      // Handle elements with data-page (including small cards)
      const pageLink = e.target.closest("[data-page]");
      if (pageLink) {
        e.preventDefault();

        const page = pageLink.dataset.page;
        const section = pageLink.dataset.section; // optional target section

        location.hash = page + (section ? ":" + section : "");

        document.querySelectorAll("[data-page]").forEach(el => el.classList.remove("active"));
        pageLink.classList.add("active");

        // Close mobile menu if open
        const menu = document.getElementById("mobileMenu");
        if (menu?.classList.contains("show")) {
          bootstrap.Collapse.getInstance(menu)?.hide();
        }

        return;
      }

      // Handle standard anchor links with hashes
      const tagLink = e.target.closest('a[href^="#"]');
      if (tagLink) {
        const id = tagLink.getAttribute("href").replace("#", "");
        const section = document.getElementById(id);

        if (section) {
          e.preventDefault();
          scrollToSection(id);

          document.querySelectorAll(".tag-link").forEach(el => el.classList.remove("active"));
          tagLink.classList.add("active");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    router();

    window.addEventListener("hashchange", router);
  });

})();