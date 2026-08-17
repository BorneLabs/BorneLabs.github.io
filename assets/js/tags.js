(function () {
  "use strict";

  const TAG_SELECTOR = ".tag-link";
  const MARQUEE_SELECTOR = ".services-marquee";
  const TRACK_SELECTOR = ".services-track";
  const SECTION_SELECTOR = ".service-section[id]";

  const SCROLL_OFFSET = 24;
  const AUTO_SCROLL_SPEED = 22;
  const RESUME_DELAY = 1200;

  const marqueeStates = new WeakMap();
  const managedMarquees = new Set();

  let activeObserver = null;
  let resizeObserver = null;
  let observedElements = new Set();
  let resizeTimer = null;

  function normalizeId(value) {
    return (value || "")
      .replace(/^#/, "")
      .trim()
      .toLowerCase();
  }

  function getTags() {
    return Array.from(
      document.querySelectorAll(TAG_SELECTOR)
    );
  }

  function getSectionId(tag) {
    return normalizeId(
      tag.dataset.section ||
      tag.getAttribute("href")
    );
  }

  function setActive(sectionId) {
    const targetId = normalizeId(sectionId);

    getTags().forEach((tag) => {
      const isActive =
        Boolean(targetId) &&
        getSectionId(tag) === targetId;

      tag.classList.toggle(
        "active",
        isActive
      );

      if (isActive) {
        tag.setAttribute(
          "aria-current",
          "true"
        );
      } else {
        tag.removeAttribute(
          "aria-current"
        );
      }
    });
  }

  function scrollToService(sectionId) {
    const section =
      document.getElementById(sectionId);

    if (!section) {
      return false;
    }

    if (
      typeof window.scrollToSection ===
      "function"
    ) {
      window.scrollToSection(sectionId);
      return true;
    }

    const main =
      document.querySelector(".main");

    if (main) {
      const top =
        section.getBoundingClientRect().top -
        main.getBoundingClientRect().top +
        main.scrollTop -
        SCROLL_OFFSET;

      main.scrollTo({
        top,
        behavior: "smooth"
      });

      return true;
    }

    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        window.scrollY -
        SCROLL_OFFSET,
      behavior: "smooth"
    });

    return true;
  }

  function navigateToService(sectionId) {
    if (!sectionId) {
      return;
    }

    const currentPage =
      (
        document.body.dataset.currentPage ||
        ""
      ).toLowerCase();

    const currentPath =
      window.location.pathname
        .replace(/\/+$/, "");

    const onServices =
      currentPage === "services" ||
      currentPath === "/services" ||
      currentPath.startsWith("/services/");

    if (onServices) {
      if (!scrollToService(sectionId)) {
        return;
      }

      history.replaceState(
        {
          page: "services",
          section: sectionId
        },
        "",
        `/services/${sectionId}`
      );

      setActive(sectionId);

      return;
    }

    history.pushState(
      {
        page: "services",
        section: sectionId
      },
      "",
      `/services/${sectionId}`
    );

    if (
      typeof window.router ===
      "function"
    ) {
      window.router();
    }
  }

  function initClickHandling() {
    if (
      document.documentElement.dataset
        .serviceTagsClickInitialized ===
      "true"
    ) {
      return;
    }

    document.documentElement.dataset
      .serviceTagsClickInitialized =
      "true";

    document.addEventListener(
      "click",
      (event) => {
        const tag =
          event.target.closest(TAG_SELECTOR);

        if (!tag) {
          return;
        }

        event.preventDefault();

        navigateToService(
          getSectionId(tag)
        );
      }
    );
  }

  function destroyActiveObserver() {
    if (activeObserver) {
      activeObserver.disconnect();
      activeObserver = null;
    }
  }

  function initActiveTracking() {
    destroyActiveObserver();

    const sections =
      Array.from(
        document.querySelectorAll(
          SECTION_SELECTOR
        )
      );

    if (!sections.length) {
      return;
    }

    const main =
      document.querySelector(".main");

    activeObserver =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];

          if (!visible) {
            return;
          }

          const sectionId =
            normalizeId(
              visible.target.id
            );

          setActive(sectionId);

          const currentRoute =
            `/services/${sectionId}`;

          if (
            window.location.pathname !==
            currentRoute
          ) {
            history.replaceState(
              {
                page: "services",
                section: sectionId
              },
              "",
              currentRoute
            );
          }
        },
        {
          root: main || null,
          threshold: [0.3, 0.6],
          rootMargin:
            "-10% 0px -35% 0px"
        }
      );

    sections.forEach(
      (section) =>
        activeObserver.observe(section)
    );

    const routeSection =
      normalizeId(
        window.location.pathname
          .split("/")
          .pop()
      );

    if (
      routeSection &&
      document.getElementById(routeSection)
    ) {
      setActive(routeSection);
    }
  }

  function stopMarquee(
    marquee,
    reset = false
  ) {
    const state =
      marqueeStates.get(marquee);

    if (!state) {
      return;
    }

    state.running = false;

    if (state.animationFrame) {
      cancelAnimationFrame(
        state.animationFrame
      );

      state.animationFrame = null;
    }

    if (state.resumeTimer) {
      clearTimeout(
        state.resumeTimer
      );

      state.resumeTimer = null;
    }

    state.previousTime = null;

    if (reset) {
      marquee.scrollLeft = 0;
    }
  }

  function stopAllManagedMarquees() {
    managedMarquees.forEach(
      (marquee) => {
        stopMarquee(
          marquee,
          true
        );
      }
    );

    managedMarquees.clear();
  }

  function shouldAnimate() {
    return !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }

  function startMarquee(
    marquee,
    overflow
  ) {
    const previousState =
      marqueeStates.get(marquee);

    if (
      previousState &&
      previousState.running &&
      Math.abs(
        previousState.overflow -
        overflow
      ) <= 1
    ) {
      return;
    }

    stopMarquee(marquee);

    if (!shouldAnimate()) {
      return;
    }

    const state = {
      running: true,
      paused: false,
      previousTime: null,
      animationFrame: null,
      resumeTimer: null,
      overflow
    };

    marqueeStates.set(
      marquee,
      state
    );

    managedMarquees.add(
      marquee
    );

    function animate(time) {
      if (!state.running) {
        return;
      }

      if (
        state.previousTime ===
        null
      ) {
        state.previousTime = time;
      }

      const delta =
        time -
        state.previousTime;

      state.previousTime = time;

      if (!state.paused) {
        let next =
          marquee.scrollLeft +
          (AUTO_SCROLL_SPEED *
            delta) /
            1000;

        if (next >= overflow) {
          next = overflow;
        }

        if (next < 0) {
          next = 0;
        }

        marquee.scrollLeft = next;

        if (next >= overflow) {
          state.running = false;

          state.animationFrame = null;

          const returnStart =
            () => {
              if (
                !document.body.contains(
                  marquee
                )
              ) {
                return;
              }

              marquee.scrollTo({
                left: 0,
                behavior: "smooth"
              });

              state.running = true;
              state.previousTime = null;

              state.animationFrame =
                requestAnimationFrame(
                  animate
                );
            };

          state.resumeTimer =
            setTimeout(
              returnStart,
              300
            );

          return;
        }
      }

      state.animationFrame =
        requestAnimationFrame(
          animate
        );
    }

    state.animationFrame =
      requestAnimationFrame(
        animate
      );
  }

  function pauseMarquee(
    marquee
  ) {
    const state =
      marqueeStates.get(
        marquee
      );

    if (!state) {
      return;
    }

    state.paused = true;
    state.previousTime = null;

    if (state.resumeTimer) {
      clearTimeout(
        state.resumeTimer
      );

      state.resumeTimer = null;
    }
  }

  function resumeMarquee(
    marquee
  ) {
    const state =
      marqueeStates.get(
        marquee
      );

    if (!state) {
      return;
    }

    if (state.resumeTimer) {
      clearTimeout(
        state.resumeTimer
      );
    }

    state.resumeTimer =
      setTimeout(
        () => {
          if (!state.running) {
            state.running = true;
            state.previousTime = null;

            state.animationFrame =
              requestAnimationFrame(
                (time) => {
                  state.previousTime =
                    time;

                  if (
                    state.running
                  ) {
                    state.animationFrame =
                      requestAnimationFrame(
                        () =>
                          resumeMarqueeAnimation(
                            marquee
                          )
                      );
                  }
                }
              );

            return;
          }

          state.paused = false;
          state.previousTime = null;
        },
        RESUME_DELAY
      );
  }

  function resumeMarqueeAnimation(
    marquee
  ) {
    const state =
      marqueeStates.get(
        marquee
      );

    if (!state) {
      return;
    }

    state.paused = false;
    state.previousTime = null;

    startMarquee(
      marquee,
      state.overflow
    );
  }

  function updateMarquee(
    marquee
  ) {
    if (
      !document.body.contains(
        marquee
      )
    ) {
      stopMarquee(
        marquee,
        true
      );

      managedMarquees.delete(
        marquee
      );

      return;
    }

    const track =
      marquee.querySelector(
        TRACK_SELECTOR
      );

    if (!track) {
      stopMarquee(
        marquee,
        true
      );

      managedMarquees.delete(
        marquee
      );

      return;
    }

    const overflow =
      Math.ceil(
        track.scrollWidth -
        marquee.clientWidth
      );

    const previousState =
      marqueeStates.get(marquee);

    if (overflow <= 1) {
      marquee.classList.remove(
        "is-overflowing"
      );

      stopMarquee(
        marquee,
        true
      );

      managedMarquees.delete(
        marquee
      );

      return;
    }

    marquee.classList.add(
      "is-overflowing"
    );

    const overflowChanged =
      !previousState ||
      Math.abs(
        previousState.overflow -
        overflow
      ) > 1;

    if (overflowChanged) {
      startMarquee(
        marquee,
        overflow
      );
    }
  }

  function cleanupObservedElements() {
    if (!resizeObserver) {
      return;
    }

    observedElements.forEach(
      (element) => {
        resizeObserver.unobserve(
          element
        );
      }
    );

    observedElements.clear();
  }

  function initResizeObserver() {
    if (!resizeObserver) {
      resizeObserver =
        new ResizeObserver(() => {
          clearTimeout(
            resizeTimer
          );

          resizeTimer =
            setTimeout(
              refreshMarquees,
              80
            );
        });
    }

    cleanupObservedElements();

    document
      .querySelectorAll(
        MARQUEE_SELECTOR
      )
      .forEach((marquee) => {
        const track =
          marquee.querySelector(
            TRACK_SELECTOR
          );

        resizeObserver.observe(
          marquee
        );

        observedElements.add(
          marquee
        );

        if (track) {
          resizeObserver.observe(
            track
          );

          observedElements.add(
            track
          );
        }
      });
  }

  function initMarquees() {
    const marquees =
      Array.from(
        document.querySelectorAll(
          MARQUEE_SELECTOR
        )
      );

    const currentSet =
      new Set(marquees);

    managedMarquees.forEach(
      (marquee) => {
        if (
          !currentSet.has(marquee) ||
          !document.body.contains(
            marquee
          )
        ) {
          stopMarquee(
            marquee,
            true
          );

          managedMarquees.delete(
            marquee
          );
        }
      }
    );

    marquees.forEach((marquee) => {
      if (
        marquee.dataset
          .serviceMarqueeInitialized !==
        "true"
      ) {
        marquee.dataset
          .serviceMarqueeInitialized =
          "true";

        marquee.addEventListener(
          "touchstart",
          () => {
            pauseMarquee(
              marquee
            );
          },
          { passive: true }
        );

        marquee.addEventListener(
          "touchend",
          () => {
            resumeMarquee(
              marquee
            );
          },
          { passive: true }
        );

        marquee.addEventListener(
          "touchcancel",
          () => {
            resumeMarquee(
              marquee
            );
          },
          { passive: true }
        );
      }

      updateMarquee(
        marquee
      );
    });

    initResizeObserver();

    if (
      document.fonts &&
      document.fonts.ready
    ) {
      document.fonts.ready.then(
        refreshMarquees
      );
    }
  }

  function refreshMarquees() {
    const marquees =
      document.querySelectorAll(
        MARQUEE_SELECTOR
      );

    marquees.forEach(
      updateMarquee
    );

    initResizeObserver();
  }

  function initServiceTags() {
    initClickHandling();
    initActiveTracking();
    initMarquees();

    requestAnimationFrame(() => {
      requestAnimationFrame(
        refreshMarquees
      );
    });
  }

  window.initServiceTags =
    initServiceTags;

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initServiceTags();
    }
  );
})();