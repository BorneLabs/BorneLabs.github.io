(function () {
  'use strict';

  const content = document.getElementById('content');
  const main = document.querySelector('.main');

  async function loadPage(page) {
    if (!content) return;
    const file = `Pages/${page.toLowerCase()}.html`;

    try {
      const res = await fetch(`${file}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) {
        // If page doesn't exist, load Home instead
        if (page.toLowerCase() !== "home") {
          return loadPage("Home");
        }
        throw new Error(res.status);
      }

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
    let path = location.pathname.replace(/^\/+/, "").replace(/\/$/, "");
    
    // Handle root path
    if (!path || path === "index.html") {
      path = "Home";
    }
    
    // Extract page and section from path (e.g., "services/websites" -> page: "services", section: "websites")
    let sectionId;
    if (path.includes('/')) {
      const parts = path.split('/');
      path = parts[0];
      sectionId = parts[1];
    }

    // Validate that path is a valid page name (alphanumeric/dash only, no suspicious patterns)
    if (!/^[a-zA-Z0-9\-]+$/.test(path)) {
      path = "Home";
      sectionId = undefined;
    }

    loadPage(path).then(() => {
      if (sectionId) scrollToSection(sectionId);
      updateActiveNav(path);
    });
  }

  function updateActiveNav(page) {
    // Update data-page navigation links
    document.querySelectorAll("[data-page]").forEach(el => {
      const pageAttr = el.dataset.page.toLowerCase();
      const currentPage = page.toLowerCase();
      if (pageAttr === currentPage) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  function navigateTo(page, section) {
    const path = section ? `/${page.toLowerCase()}/${section.toLowerCase()}` : `/${page.toLowerCase()}`;
    history.pushState({ page, section }, "", path);
    router();
  }

  function initNavigation() {
    document.addEventListener("click", e => {
      const pageLink = e.target.closest("[data-page]");
      if (pageLink) {
        e.preventDefault();
        const page = pageLink.dataset.page;
        const section = pageLink.dataset.section;
        navigateTo(page, section);
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
          // Update URL without page reload
          const currentPage = location.pathname.split('/')[1] || 'home';
          history.replaceState({ page: currentPage, section: id }, "", `/${currentPage}/${id}`);
          document.querySelectorAll(".tag-link").forEach(el => el.classList.remove("active"));
          tagLink.classList.add("active");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Handle redirect from 404.html using query parameter
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('r');
    if (redirectPath) {
      // Clean up the redirect parameter
      params.delete('r');
      const newSearch = params.toString();
      const newUrl = redirectPath + (newSearch ? '?' + newSearch : '');
      history.replaceState(null, "", newUrl);
      // After updating the URL in history, parse the redirectPath for routing
      let path = redirectPath.replace(/^\/+/, "").replace(/\/$/, "");
      if (!path || path === "index.html") path = "Home";
      
      let sectionId;
      if (path.includes('/')) {
        const parts = path.split('/');
        path = parts[0];
        sectionId = parts[1];
      }
      
      initNavigation();
      loadPage(path).then(() => {
        if (sectionId) scrollToSection(sectionId);
        updateActiveNav(path);
      });
      window.addEventListener("popstate", router);
      return;
    }
    
    initNavigation();
    router();
    window.addEventListener("popstate", router);
  });

})();