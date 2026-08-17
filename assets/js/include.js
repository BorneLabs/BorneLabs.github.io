(function () {
  "use strict";

  const content = document.getElementById("content");
  const scrollRoot = document.querySelector(".main");
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const mobileDrawerClose = document.getElementById("mobileDrawerClose");

  const validPages = new Set([
    "home",
    "projects",
    "services",
    "about",
    "contacts",
    "papers",
    "more",
    "policy"
  ]);

  function getRouteFromPath() {
    let path = location.pathname.replace(/^\/+/, "").replace(/\/$/, "");

    if (!path || path === "index.html") {
      return {
        page: "home",
        sectionId: ""
      };
    }

    const [rawPage, rawSection] = path.split("/");
    const page = (rawPage || "home").toLowerCase();
    const sectionId = (rawSection || "").toLowerCase();

    if (!validPages.has(page)) {
      return {
        page: "home",
        sectionId: ""
      };
    }

    return {
      page,
      sectionId
    };
  }

  function setCanonical(pageName) {
    let link = document.querySelector("link[rel='canonical']");

    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    link.href =
      pageName === "home"
        ? `${location.origin}/`
        : new URL(`/${pageName}`, location.origin).href;
  }

  function scrollToSection(sectionId) {
    if (!sectionId) {
      return;
    }

    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    if (scrollRoot) {
      const top =
        section.getBoundingClientRect().top -
        scrollRoot.getBoundingClientRect().top +
        scrollRoot.scrollTop -
        24;

      scrollRoot.scrollTo({
        top,
        behavior: "smooth"
      });

      return;
    }

    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        window.scrollY -
        24,
      behavior: "smooth"
    });
  }

  async function loadPage(page) {
    if (!content) {
      return "home";
    }

    const pageName = validPages.has(page) ? page : "home";

    const file = new URL(
      `/Pages/${pageName}.html`,
      location.origin
    ).href;

    try {
      const res = await fetch(
        `${file}?v=${Date.now()}`,
        {
          cache: "no-store"
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      content.innerHTML = await res.text();

      if (typeof loadFeaturedProjects === "function") {
        loadFeaturedProjects();
      }

      if (typeof fetchPlaylistVideos === "function") {
        fetchPlaylistVideos();
      }

      if (typeof window.initServiceTags === "function") {
        window.initServiceTags();
      }

      if (scrollRoot) {
        scrollRoot.scrollTo({
          top: 0,
          behavior: "auto"
        });
      }

      setCanonical(pageName);

      return pageName;
    } catch (err) {
      content.innerHTML = `
        <div class="loading-state">
          Could not load content. ${err.message}
        </div>
      `;

      return "home";
    }
  }

  function updateActiveNav(pageName) {
    const current = (pageName || "home").toLowerCase();

    document.body.setAttribute(
      "data-current-page",
      current
    );

    document.querySelectorAll("[data-page]").forEach((node) => {
      const page = (node.dataset.page || "").toLowerCase();

      node.classList.toggle(
        "active",
        page === current
      );
    });
  }

  function navigateTo(page, section) {
    const pageName = validPages.has(
      (page || "").toLowerCase()
    )
      ? page.toLowerCase()
      : "home";

    const sectionName = (section || "").toLowerCase();

    const path = sectionName
      ? `/${pageName}/${sectionName}`
      : `/${pageName}`;

    history.pushState(
      {
        page: pageName,
        section: sectionName
      },
      "",
      path
    );

    router();
  }

  async function router() {
    const {
      page,
      sectionId
    } = getRouteFromPath();

    const loadedPage = await loadPage(page);

    updateActiveNav(loadedPage);

    if (
      sectionId &&
      loadedPage === "services"
    ) {
      requestAnimationFrame(() => {
        scrollToSection(sectionId);
      });
    }
  }

  function setMobileDrawerOpen(isOpen) {
    if (
      !mobileDrawer ||
      !mobileOverlay ||
      !mobileToggle
    ) {
      return;
    }

    mobileDrawer.classList.toggle(
      "open",
      isOpen
    );

    mobileOverlay.hidden = !isOpen;

    mobileOverlay.classList.toggle(
      "show",
      isOpen
    );

    mobileToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    document.body.classList.toggle(
      "mobile-drawer-open",
      isOpen
    );
  }

  function initNavigation() {
    document.addEventListener("click", (event) => {
      /*
       * Service tags are handled exclusively by tags.js.
       */
      if (
        event.target.closest(".tag-link")
      ) {
        return;
      }

      const pageLink =
        event.target.closest("[data-page]");

      if (pageLink) {
        event.preventDefault();

        navigateTo(
          pageLink.dataset.page || "home",
          pageLink.dataset.section || ""
        );

        setMobileDrawerOpen(false);

        return;
      }

      const sectionLink =
        event.target.closest(
          "a[href^='#']:not(.tag-link)"
        );

      if (
        !sectionLink ||
        event.defaultPrevented
      ) {
        return;
      }

      const section = (
        sectionLink.getAttribute("href") || ""
      )
        .replace(/^#/, "")
        .trim();

      if (!section) {
        return;
      }

      event.preventDefault();

      const {
        page
      } = getRouteFromPath();

      if (page !== "services") {
        history.pushState(
          {
            page: "services",
            section
          },
          "",
          `/services/${section}`
        );

        router();
      } else {
        history.replaceState(
          {
            page: "services",
            section
          },
          "",
          `/services/${section}`
        );

        scrollToSection(section);
      }
    });
  }

  function initMobileDrawer() {
    if (
      !mobileToggle ||
      !mobileDrawer ||
      !mobileOverlay ||
      !mobileDrawerClose
    ) {
      return;
    }

    mobileToggle.addEventListener(
      "click",
      () => {
        const isOpen =
          mobileDrawer.classList.contains("open");

        setMobileDrawerOpen(!isOpen);
      }
    );

    mobileDrawerClose.addEventListener(
      "click",
      () => {
        setMobileDrawerOpen(false);
      }
    );

    mobileOverlay.addEventListener(
      "click",
      () => {
        setMobileDrawerOpen(false);
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          setMobileDrawerOpen(false);
        }
      }
    );
  }

  window.router = router;
  window.navigateTo = navigateTo;
  window.scrollToSection = scrollToSection;

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const params =
        new URLSearchParams(location.search);

      const redirectPath =
        params.get("r");

      if (redirectPath) {
        params.delete("r");

        const rest = params.toString();

        history.replaceState(
          null,
          "",
          redirectPath +
            (rest ? `?${rest}` : "")
        );
      }

      initNavigation();
      initMobileDrawer();
      router();

      window.addEventListener(
        "popstate",
        router
      );
    }
  );
})();