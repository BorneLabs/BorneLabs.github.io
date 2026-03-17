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

      if (typeof loadFeaturedProjects === "function") loadFeaturedProjects();

      if (main) main.scrollTo({ top: 0, behavior: "auto" });

      let link = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", `https://www.bornelabs.org/${page.toLowerCase()}`);

    } catch (err) {
      content.innerHTML = `<div class="p-3 text-danger">Could not load "${file}"</div>`;
      console.error(err);
    }
  }

  function scrollToSection(id) {
    if (!main) return;
    const section = document.getElementById(id);
    if (!section) return;
    const offset = 70;
    main.scrollTo({ top: section.offsetTop - offset, behavior: "smooth" });
  }

  function router() {
    let path = location.pathname.replace("/", "");
    if (!path || path === "index.html") path = "Home";

    const hash = location.hash.replace("#", "");
    let sectionId;
    if (hash) {
      const parts = hash.split(":");
      path = parts[0];
      sectionId = parts[1];
    }

    loadPage(path).then(() => {
      if (sectionId) scrollToSection(sectionId);
    });
  }

  function initNavigation() {
    document.addEventListener("click", e => {
      const pageLink = e.target.closest("[data-page]");
      if (pageLink) {
        e.preventDefault();
        const page = pageLink.dataset.page;
        const section = pageLink.dataset.section;
        location.hash = page + (section ? ":" + section : "");
        document.querySelectorAll("[data-page]").forEach(el => el.classList.remove("active"));
        pageLink.classList.add("active");
        const menu = document.getElementById("mobileMenu");
        if (menu?.classList.contains("show")) {
          bootstrap.Collapse.getInstance(menu)?.hide();
        }
        return;
      }

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