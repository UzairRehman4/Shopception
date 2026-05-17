(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = () => window.gsap && window.ScrollTrigger;
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const markLoaded = () => document.body.classList.add('is-loaded');

  const splitTextToLines = (element) => {
    if (!element || element.dataset.gsapSplit === 'true') return [];
    const text = element.textContent.trim().replace(/\s+/g, ' ');
    if (!text) return [];
    element.dataset.gsapSplit = 'true';
    element.setAttribute('aria-label', text);
    element.innerHTML = text.split(' ').map((word) => `<span class="gsap-word-wrap" aria-hidden="true"><span class="gsap-word">${word}</span></span>`).join(' ');
    return qsa('.gsap-word', element);
  };

  const buildLoader = () => {
    markLoaded();
    return Promise.resolve();
  };

  const initHeader = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 18);
      header.classList.toggle('is-hidden', y > 180 && y > lastY && !document.body.classList.contains('drawer-open'));
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  };

  const initMegaMenuMotion = () => {
    if (!hasGSAP() || reduceMotion) return;
    qsa('.site-header__nav-item').forEach((item) => {
      const submenu = item.querySelector('.site-header__submenu');
      if (!submenu) return;
      const feature = submenu.querySelector('.site-header__submenu-feature');
      const links = qsa('.site-header__submenu-links a', submenu);
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
      tl.fromTo(submenu, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: .35 }, 0)
        .fromTo(feature, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .55 }, .08)
        .fromTo(links, { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .035, duration: .45 }, .12);
      item.addEventListener('mouseenter', () => tl.restart());
      item.addEventListener('focusin', () => tl.restart());
    });
  };

  const initHero = () => {
    if (!hasGSAP() || reduceMotion) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const words = splitTextToLines(hero.querySelector('.hero__heading'));
    const eyebrow = hero.querySelector('.hero__eyebrow');
    const text = hero.querySelector('.hero__text');
    const buttons = qsa('.hero__buttons > *, .hero .button');
    const media = hero.querySelector('.hero__media img, .hero__media video');
    const kicker = hero.querySelector('.hero__kicker');
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .08 });
    if (media) tl.fromTo(media, { scale: 1.08, opacity: .72 }, { scale: 1.01, opacity: 1, duration: 1.2 }, 0);
    if (kicker) tl.fromTo(kicker, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .65 }, .1);
    if (eyebrow) tl.fromTo(eyebrow, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .65 }, .16);
    if (words.length) tl.fromTo(words, { yPercent: 115, rotate: 2, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: .86, stagger: .026 }, .22);
    if (text) tl.fromTo(text, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .6);
    if (buttons.length) tl.fromTo(buttons, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7 }, .68);
  };

  const initTextReveals = () => {
    if (!hasGSAP() || reduceMotion) {
      qsa('.section, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content').forEach((item) => item.classList.add('is-visible'));
      markLoaded();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    qsa('.section__title, .collection-story__title, .promo-mosaic__content h3, .lookbook-band__title, .product-page__heading h1, .product-page__title').forEach((heading) => {
      if (heading.closest('.hero')) return;
      const words = splitTextToLines(heading);
      if (!words.length) return;
      gsap.fromTo(words, { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .78, stagger: .018, ease: 'power4.out', scrollTrigger: { trigger: heading, start: 'top 84%', once: true } });
    });
    qsa('.section, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content').forEach((item) => item.classList.add('is-visible'));
  };

  const initProductCards = () => {
    if (!hasGSAP() || reduceMotion) return;
    qsa('.product-card').forEach((card) => {
      const media = card.querySelector('.product-card__media');
      const info = card.querySelector('.product-card__info');
      const secondary = card.querySelector('.product-card__image--secondary');
      gsap.fromTo(card, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .68, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
      card.addEventListener('mouseenter', () => {
        gsap.to(media, { y: -4, duration: .38, ease: 'power3.out' });
        gsap.to(info, { y: 2, duration: .38, ease: 'power3.out' });
        if (secondary) gsap.to(secondary, { opacity: 1, scale: 1.03, duration: .5, ease: 'power3.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to([media, info], { y: 0, duration: .42, ease: 'power3.out' });
        if (secondary) gsap.to(secondary, { opacity: 0, scale: 1, duration: .42, ease: 'power3.out' });
      });
    });
  };

  const initCountdowns = () => {
    const countdowns = qsa('[data-countdown]');
    if (!countdowns.length) return;
    const pad = (value) => String(Math.max(0, value)).padStart(2, '0');
    const update = () => {
      countdowns.forEach((countdown) => {
        const target = new Date(countdown.dataset.countdown).getTime();
        if (Number.isNaN(target)) return;
        const diff = Math.max(0, target - Date.now());
        countdown.querySelector('[data-days]')?.replaceChildren(pad(Math.floor(diff / 86400000)));
        countdown.querySelector('[data-hours]')?.replaceChildren(pad(Math.floor((diff % 86400000) / 3600000)));
        countdown.querySelector('[data-minutes]')?.replaceChildren(pad(Math.floor((diff % 3600000) / 60000)));
        countdown.querySelector('[data-seconds]')?.replaceChildren(pad(Math.floor((diff % 60000) / 1000)));
      });
    };
    update();
    window.setInterval(update, 1000);
  };

  const initProductMediaModal = () => {
    const modal = document.querySelector('[data-product-media-modal]');
    if (!modal) return;
    const image = modal.querySelector('[data-product-media-modal-image]');
    const close = modal.querySelector('[data-product-media-close]');
    const open = (trigger) => {
      if (!image) return;
      image.src = trigger.dataset.mediaSrc || '';
      image.alt = trigger.dataset.mediaAlt || '';
      modal.hidden = false;
      document.body.classList.add('media-modal-open');
      if (hasGSAP() && !reduceMotion) {
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: .28, ease: 'power3.out' });
        gsap.fromTo(image, { scale: .95, y: 14, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: .52, ease: 'power4.out' });
      }
    };
    const closeModal = () => {
      const done = () => {
        modal.hidden = true;
        document.body.classList.remove('media-modal-open');
        image?.removeAttribute('src');
      };
      if (hasGSAP() && !reduceMotion) gsap.to(modal, { opacity: 0, duration: .2, ease: 'power2.out', onComplete: done });
      else done();
    };
    qsa('.product-media-trigger').forEach((button) => button.addEventListener('click', () => open(button)));
    close?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
  };

  const initPredictiveSearch = () => {
    const form = document.querySelector('[data-predictive-search-form]');
    if (!form) return;
    const input = form.querySelector('[data-predictive-search-input]');
    const resultsWrap = document.querySelector('[data-predictive-search-results]');
    const resultsList = document.querySelector('[data-predictive-search-list]');
    const recommendations = document.querySelector('[data-search-recommendations]');
    const previousWrap = document.querySelector('[data-previous-searches]');
    const previousList = document.querySelector('[data-previous-searches-list]');
    const clearBtn = document.querySelector('[data-clear-searches]');
    let timer;
    const getPrevious = () => JSON.parse(localStorage.getItem('shopceptionSearches') || '[]');
    const saveSearch = (term) => {
      const value = term.trim();
      if (!value) return;
      const next = [value, ...getPrevious().filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 6);
      localStorage.setItem('shopceptionSearches', JSON.stringify(next));
      renderPrevious();
    };
    const renderPrevious = () => {
      const items = getPrevious();
      if (!previousWrap || !previousList) return;
      previousWrap.hidden = items.length === 0;
      previousList.innerHTML = items.map((item) => `<button type="button" data-search-chip="${item.replace(/"/g, '&quot;')}">${item}</button>`).join('');
    };
    const renderProducts = (products = []) => {
      if (!resultsWrap || !resultsList) return;
      resultsWrap.hidden = products.length === 0;
      if (recommendations) recommendations.hidden = products.length > 0;
      resultsList.innerHTML = products.map((product) => `<article class="premium-search-product"><a class="premium-search-product__media" href="${product.url}">${product.image ? `<img src="${product.image}" alt="${product.title}">` : ''}</a><div><a class="premium-search-product__title" href="${product.url}">${product.title}</a><span>${product.price || ''}</span><a class="premium-mini-button" href="${product.url}">View</a></div></article>`).join('');
    };
    const search = async (term) => {
      const q = term.trim();
      if (q.length < 2) {
        if (resultsWrap) resultsWrap.hidden = true;
        if (recommendations) recommendations.hidden = false;
        return;
      }
      try {
        const res = await fetch(`/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last`);
        if (!res.ok) throw new Error('search failed');
        const data = await res.json();
        const products = (data.resources?.results?.products || []).map((p) => ({ title: p.title, url: p.url, image: p.image, price: p.price }));
        renderProducts(products);
      } catch {
        renderProducts([]);
      }
    };
    input?.addEventListener('input', () => { window.clearTimeout(timer); timer = window.setTimeout(() => search(input.value), 220); });
    form.addEventListener('submit', () => saveSearch(input.value));
    previousList?.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-search-chip]');
      if (!chip || !input) return;
      input.value = chip.dataset.searchChip;
      search(input.value);
    });
    clearBtn?.addEventListener('click', () => { localStorage.removeItem('shopceptionSearches'); renderPrevious(); });
    renderPrevious();
  };

  const initSearchFocus = () => {
    document.querySelectorAll('[data-drawer-open="search-drawer"]').forEach((button) => {
      button.addEventListener('click', () => window.setTimeout(() => {
        const input = document.querySelector('#search-drawer input[type="search"]');
        input?.focus();
        if (hasGSAP() && !reduceMotion) {
          gsap.fromTo('#search-drawer .premium-drawer-header, #search-drawer .premium-search__form, #search-drawer .premium-search__panel', { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .045, duration: .55, ease: 'power4.out' });
        }
      }, 260));
    });
  };

  const initPointerGlow = () => {
    if (reduceMotion || window.innerWidth < 990) return;
    const glow = document.createElement('div');
    glow.className = 'premium-pointer-glow';
    document.body.append(glow);
    window.addEventListener('pointermove', (event) => {
      if (hasGSAP()) gsap.to(glow, { x: event.clientX, y: event.clientY, duration: .55, ease: 'power3.out' });
      else glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
  };

  const initFallbackReveal = () => {
    const items = qsa('.section, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content');
    if (!items.length || hasGSAP()) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => observer.observe(item));
  };

  const init = async () => {
    await buildLoader();
    initHeader();
    initMegaMenuMotion();
    initHero();
    initTextReveals();
    initProductCards();
    initCountdowns();
    initProductMediaModal();
    initPredictiveSearch();
    initSearchFocus();
    initPointerGlow();
    initFallbackReveal();
    if (hasGSAP()) window.setTimeout(() => ScrollTrigger.refresh(), 400);
  };

  document.addEventListener('DOMContentLoaded', init);
})();