(function () {
  'use strict';

  const content = document.getElementById('content');
  const main = document.querySelector('.main');

  async function loadPage(page) {
    if (!content) return;

    const pageName = page.toLowerCase();
    const file = new URL(`/Pages/${pageName}.html`, location.origin).href;

    try {
      const res = await fetch(`${file}?v=${Date.now()}`, { cache: 'no-store' });

      if (!res.ok) {
        if (pageName !== 'home') return loadPage('Home');
        throw new Error(res.status);
      }

      const html = await res.text();
      content.innerHTML = html;

      if (typeof loadFeaturedProjects === 'function') {
        loadFeaturedProjects();
      }

      if (main) {
        main.scrollTo({ top: 0, behavior: 'auto' });
      }

      let link = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }

      link.href = new URL(`/${pageName}`, location.origin).href;
    } catch (err) {
      content.innerHTML = `<div class="p-3 text-danger">Could not load "${file}" - ${err.message}</div>`;
    }
  }

  function scrollToSection(id) {
    if (!main) return;

    const section = document.getElementById(id);
    if (!section) return;

    main.scrollTo({ top: section.offsetTop - 70, behavior: 'smooth' });
  }

  function updateActiveNav(page) {
    const currentPage = page.toLowerCase();

    document.querySelectorAll('[data-page]').forEach(el => {
      if (el.dataset.page.toLowerCase() === currentPage) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  function navigateTo(page, section) {
    const path = section
      ? `/${page.toLowerCase()}/${section.toLowerCase()}`
      : `/${page.toLowerCase()}`;

    history.pushState({ page, section }, '', path);
    router();
  }

  function router() {
    let path = location.pathname.replace(/^\/+/, '').replace(/\/$/, '');

    if (!path || path === 'index.html') {
      path = 'Home';
    }

    let sectionId = '';

    if (path.includes('/')) {
      const parts = path.split('/');
      path = parts[0];
      sectionId = parts[1] || '';
    }

    if (!/^[a-zA-Z0-9\-]+$/.test(path)) {
      path = 'Home';
      sectionId = '';
    }

    loadPage(path).then(() => {
      if (sectionId) {
        scrollToSection(sectionId);
      }

      updateActiveNav(path);
    });
  }

  function initNavigation() {
    document.addEventListener('click', e => {
      const pageLink = e.target.closest('[data-page]');

      if (pageLink) {
        e.preventDefault();

        const page = pageLink.dataset.page;
        const section = pageLink.dataset.section;

        navigateTo(page, section);

        const menu = document.getElementById('mobileMenu');
        if (menu?.classList.contains('show')) {
          bootstrap.Collapse.getInstance(menu)?.hide();
        }

        return;
      }

      const tagLink = e.target.closest('a[href^="#"]');

      if (tagLink) {
        const id = tagLink.getAttribute('href').replace('#', '');
        const section = document.getElementById(id);

        if (section) {
          e.preventDefault();
          scrollToSection(id);

          const currentPage = location.pathname.split('/')[1] || 'home';
          history.replaceState({ page: currentPage, section: id }, '', `/${currentPage}/${id}`);

          document.querySelectorAll('.tag-link').forEach(el => el.classList.remove('active'));
          tagLink.classList.add('active');
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('r');

    if (redirectPath) {
      params.delete('r');

      const newSearch = params.toString();
      const newUrl = redirectPath + (newSearch ? `?${newSearch}` : '');

      history.replaceState(null, '', newUrl);

      let path = redirectPath.replace(/^\/+/, '').replace(/\/$/, '');
      if (!path || path === 'index.html') path = 'Home';

      let sectionId = '';

      if (path.includes('/')) {
        const parts = path.split('/');
        path = parts[0];
        sectionId = parts[1] || '';
      }

      initNavigation();

      loadPage(path).then(() => {
        if (sectionId) {
          scrollToSection(sectionId);
        }

        updateActiveNav(path);
      });

      window.addEventListener('popstate', router);
      return;
    }

    initNavigation();
    router();
    window.addEventListener('popstate', router);
  });
})();