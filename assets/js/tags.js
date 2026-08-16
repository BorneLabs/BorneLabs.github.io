function initServiceTags() {
  const tags = document.querySelectorAll(".tag-link");
  const main = document.querySelector(".main");

  if (!tags.length || !main) {
    return;
  }

  function normalizeSectionId(value) {
    return (value || "").replace(/^#/, "").trim().toLowerCase();
  }

  function setActive(id) {
    const targetId = normalizeSectionId(id);

    tags.forEach((tag) => {
      const tagId = normalizeSectionId(tag.dataset.section || tag.getAttribute("href"));
      const isActive = Boolean(targetId) && tagId === targetId;
      tag.classList.toggle("active", isActive);
      tag.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    const top = section.offsetTop - 88;
    main.scrollTo({ top, behavior: "smooth" });
    setActive(sectionId);
    history.replaceState(null, "", `#${sectionId}`);
  }

  tags.forEach((tag) => {
    const sectionId = normalizeSectionId(tag.dataset.section || tag.getAttribute("href"));
    if (!sectionId) {
      return;
    }

    tag.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToSection(sectionId);
    });
  });

  const sections = document.querySelectorAll(".service-section[id]");
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActive(visible.target.id);
        if (location.hash !== `#${visible.target.id}`) {
          history.replaceState(null, "", `#${visible.target.id}`);
        }
      }
    },
    {
      threshold: [0.3, 0.6],
      root: main,
      rootMargin: "-12% 0px -30% 0px"
    }
  );

  sections.forEach((section) => observer.observe(section));
  const currentHash = normalizeSectionId(location.hash) || "websites";
  setActive(currentHash);
}

window.initServiceTags = initServiceTags;
