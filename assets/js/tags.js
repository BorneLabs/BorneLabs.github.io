document.addEventListener("DOMContentLoaded", () => {

  const tags = document.querySelectorAll(".tag-link");
  const sections = document.querySelectorAll("section[id]");
  const main = document.querySelector(".main");

  // ======================
  // SET ACTIVE TAG
  // ======================
  function setActive(id) {
    tags.forEach(tag => {
      tag.classList.toggle(
        "active",
        tag.getAttribute("href") === "#" + id
      );
    });
  }

  // ======================
  // SCROLL SYNC
  // ======================
  function handleScroll() {
    let current = "";

    const scrollPos = main ? main.scrollTop : window.scrollY;

    sections.forEach(section => {
      const top = section.offsetTop - 120;

      if (scrollPos >= top) {
        current = section.getAttribute("id");
      }
    });

    if (current) setActive(current);
  }

  // listen to correct scroll container
  (main || window).addEventListener("scroll", handleScroll);

  // ======================
  // URL SYNC (/services/websites)
  // ======================
  function syncFromURL() {
    const parts = location.pathname.replace(/^\/+/, "").split("/");
    const section = parts[1]; // services/websites → websites

    if (section) {
      setActive(section);
    }
  }

  // initial sync
  syncFromURL();

  // sync on back/forward navigation
  window.addEventListener("popstate", syncFromURL);

});