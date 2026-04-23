(function () {
  'use strict';

  const content = document.getElementById('content');
  const main = document.querySelector('.main');

  function getCurrentPageFromPath() {
    let path = location.pathname.replace(/^\/+/, '').replace(/\/$/, '');
    if (!path || path === 'index.html') return 'home';
    return path.split('/')[0].toLowerCase();
  }

  function getRouteFromPath() {
    let path = location.pathname.replace(/^\/+/, '').replace(/\/$/, '');

    if (!path || path === 'index.html') {
      return { page: 'home', sectionId: '' };
    }

    const parts = path.split('/');
    const page = (parts[0] || 'home').toLowerCase();
    const sectionId = (parts[1] || '').toLowerCase();

    if (!/^[a-zA-Z0-9\-]+$/.test(page)) {
      return { page: 'home', sectionId: '' };
    }

    return { page, sectionId };
  }

  function setCanonical(pageName) {
    let link = document.querySelector("link[rel='canonical']");

    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }

    link.href =
      pageName === 'home'
        ? `${location.origin}/`
        : new URL(`/${pageName}`, location.origin).href;
  }

  async function loadPage(page) {
    if (!content) return 'home';

    const pageName = (page || 'home').toLowerCase();
    const file = new URL(`/Pages/${pageName}.html`, location.origin).href;

    try {
      const res = await fetch(`${file}?v=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const html = await res.text();
      content.innerHTML = html;

      if (typeof loadFeaturedProjects === 'function') {
        loadFeaturedProjects();
      }

      if (main) {
        main.scrollTo({ top: 0, behavior: 'auto' });
      }

      setCanonical(pageName);
      return pageName;
    } catch (err) {
      content.innerHTML = `
        <div class="p-3 text-danger">
          Could not load "${file}" - ${err.message}
        </div>
      `;
      return pageName;
    }
  }

  function scrollToSection(id) {
    if (!main) return;

    const section = document.getElementById(id);
    if (!section) return;

    main.scrollTo({
      top: section.offsetTop - 70,
      behavior: 'smooth'
    });
  }

  function updateActiveNav(page) {
    const currentPage = (page || 'home').toLowerCase();

    document.querySelectorAll('[data-page]').forEach(el => {
      el.classList.toggle(
        'active',
        (el.dataset.page || '').toLowerCase() === currentPage
      );
    });
  }

  function navigateTo(page, section = '') {
    const pageName = (page || 'home').toLowerCase();
    const sectionName = (section || '').toLowerCase();

    const path = sectionName
      ? `/${pageName}/${sectionName}`
      : `/${pageName}`;

    history.pushState({ page: pageName, section: sectionName }, '', path);
    router();
  }

  async function router() {
    const { page, sectionId } = getRouteFromPath();
    const loadedPage = await loadPage(page);

    if (sectionId && loadedPage === 'services') {
      requestAnimationFrame(() => scrollToSection(sectionId));
    }

    updateActiveNav(loadedPage);
  }

  function initNavigation() {
    document.addEventListener('click', e => {
      const pageLink = e.target.closest('[data-page]');
      if (pageLink) {
        e.preventDefault();

        const page = pageLink.dataset.page;
        const section = pageLink.dataset.section || '';

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
        if (!id) return;

        e.preventDefault();

        const currentPage = getCurrentPageFromPath();

        if (currentPage !== 'services') {
          history.pushState(
            { page: 'services', section: id },
            '',
            `/services/${id}`
          );
          router();
        } else {
          history.replaceState(
            { page: 'services', section: id },
            '',
            `/services/${id}`
          );
          scrollToSection(id);
        }

        document.querySelectorAll('.tag-link').forEach(el => {
          el.classList.remove('active');
        });

        tagLink.classList.add('active');
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
    }

    initNavigation();
    router();
    window.addEventListener('popstate', router);
  });
})();