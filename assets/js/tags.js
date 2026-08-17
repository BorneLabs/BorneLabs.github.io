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

function initMarqueeOverflow() {
  const marquees = document.querySelectorAll(".services-marquee");
  
  if (!marquees.length) {
    return;
  }

  const marqueeStates = new WeakMap();

  function checkAndStartOverflow(marquee) {
    const track = marquee.querySelector(".services-track");
    if (!track) return;

    const marqueeWidth = marquee.clientWidth;
    const trackWidth = track.scrollWidth;
    const hasOverflow = trackWidth > marqueeWidth;
    let state = marqueeStates.get(marquee) || { animationId: null, isAnimating: false };

    if (hasOverflow && !state.isAnimating) {
      state.isAnimating = true;
      marqueeStates.set(marquee, state);
      startSmoothScroll(marquee, marqueeWidth, trackWidth);
    } else if (!hasOverflow && state.animationId) {
      cancelAnimationFrame(state.animationId);
      state.isAnimating = false;
      marquee.scrollLeft = 0;
      marqueeStates.set(marquee, state);
    }
  }

  function startSmoothScroll(marquee, marqueeWidth, trackWidth) {
    const scrollRange = trackWidth - marqueeWidth;
    const scrollDuration = scrollRange * 30; // 30ms per pixel
    const startTime = Date.now();
    const state = marqueeStates.get(marquee) || {};
    let isPaused = false;

    marquee.addEventListener("mouseenter", () => {
      isPaused = true;
    }, { once: false, passive: true });

    marquee.addEventListener("mouseleave", () => {
      isPaused = false;
    }, { once: false, passive: true });

    function animateScroll() {
      if (!isPaused) {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % (scrollDuration * 2)) / scrollDuration;

        if (progress <= 1) {
          // Scroll forward
          marquee.scrollLeft = scrollRange * progress;
        } else {
          // Scroll back
          marquee.scrollLeft = scrollRange * (2 - progress);
        }
      }

      const newAnimationId = requestAnimationFrame(animateScroll);
      state.animationId = newAnimationId;
      marqueeStates.set(marquee, state);
    }

    animateScroll();
  }

  function checkAllOverflow() {
    marquees.forEach((marquee) => {
      checkAndStartOverflow(marquee);
    });
  }

  // Check on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAllOverflow);
  } else {
    checkAllOverflow();
  }

  // Re-check on resize
  window.addEventListener("resize", checkAllOverflow);

  // Re-check when content changes
  const observer = new MutationObserver(checkAllOverflow);
  marquees.forEach((marquee) => {
    observer.observe(marquee, { childList: true, subtree: true });
  });
}

window.initServiceTags = initServiceTags;
window.initMarqueeOverflow = initMarqueeOverflow;
