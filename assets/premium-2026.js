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
      qsa('.section, .premium-brand-lab, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content').forEach((item) => item.classList.add('is-visible'));
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
    qsa('.section, .premium-brand-lab, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content').forEach((item) => item.classList.add('is-visible'));
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
    const suggestionsWrap = document.querySelector('[data-search-suggestions]');
    const suggestionsList = document.querySelector('[data-search-suggestions-list]');
    const discovery = document.querySelector('[data-search-discovery]');
    const clearBtn = document.querySelector('[data-clear-searches]');
    let timer;
    const resetButton = form.querySelector('[data-search-reset]');
    const suggestionTerms = ['tops', 'bottoms', 'accessories', 'new drops', 'socks', 'black', 'red', 'oversized', 'premium diamond', 'gift', 'limited'];
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
      if (discovery) discovery.hidden = products.length > 0;
      resultsList.innerHTML = products.map((product) => `
        <article class="flowbit-search-card">
          <a class="flowbit-search-card__link" href="${product.url}"><span class="visually-hidden">${product.title}</span></a>
          <div class="flowbit-search-card__media">${product.image ? `<img src="${product.image}" alt="" loading="lazy">` : ''}</div>
          <p>${product.title}</p>
        </article>
      `).join('');
    };
    const renderSuggestions = (term = '') => {
      if (!suggestionsWrap || !suggestionsList) return;
      const value = term.trim().toLowerCase();
      const items = suggestionTerms
        .filter((candidate) => !value || candidate.includes(value) || value.includes(candidate))
        .slice(0, 6);
      suggestionsWrap.hidden = items.length === 0 || value.length < 1;
      suggestionsList.innerHTML = items.map((item) => `<button type="button" data-search-term="${item}">${item}</button>`).join('');
    };
    const search = async (term) => {
      const q = term.trim();
      renderSuggestions(q);
      if (q.length < 2) {
        if (resultsWrap) resultsWrap.hidden = true;
        if (recommendations) recommendations.hidden = false;
        if (discovery) discovery.hidden = false;
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
    input?.addEventListener('input', () => {
      if (resetButton) resetButton.hidden = input.value.trim().length === 0;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => search(input.value), 220);
    });
    resetButton?.addEventListener('click', () => {
      if (!input) return;
      input.value = '';
      resetButton.hidden = true;
      if (resultsWrap) resultsWrap.hidden = true;
      if (recommendations) recommendations.hidden = false;
      input.focus();
    });
    form.addEventListener('submit', () => saveSearch(input.value));
    previousList?.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-search-chip]');
      if (!chip || !input) return;
      input.value = chip.dataset.searchChip;
      search(input.value);
    });
    form.addEventListener('click', (event) => {
      const termButton = event.target.closest('[data-search-term]');
      if (!termButton || !input) return;
      input.value = termButton.dataset.searchTerm || termButton.textContent.trim();
      if (resetButton) resetButton.hidden = input.value.trim().length === 0;
      search(input.value);
      input.focus();
    });
    clearBtn?.addEventListener('click', () => { localStorage.removeItem('shopceptionSearches'); renderPrevious(); });
    renderPrevious();
    renderSuggestions('');
  };

  const initSearchFocus = () => {
    document.querySelectorAll('[data-drawer-open="search-drawer"]').forEach((button) => {
      button.addEventListener('click', () => window.setTimeout(() => {
        const input = document.querySelector('#search-drawer input[type="search"]');
        input?.focus();
        if (hasGSAP() && !reduceMotion) {
          gsap.fromTo('#search-drawer .flowbit-search__header, #search-drawer .flowbit-search__content, #search-drawer .flowbit-search__footer', { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .045, duration: .55, ease: 'power4.out' });
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

  const initPremiumScroll = () => {
    const progress = document.createElement('div');
    progress.className = 'premium-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);

    const items = qsa('[data-premium-scroll], .flowbit-collection__grid .product-card, .flowbit-product .product-page__media-item');
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, window.scrollY / max)})`;

      if (reduceMotion) return;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const visible = rect.top < window.innerHeight * .92 && rect.bottom > window.innerHeight * .08;
        item.classList.toggle('is-premium-visible', visible);
        const media = item.querySelector('[data-premium-scroll-media], img');
        if (!media || !visible) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) / window.innerHeight;
        media.style.setProperty('--premium-scroll-y', `${offset * -18}px`);
      });
    };
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(update));
    update();
  };

  const initAnimatedBackdrops = () => {
    const targets = qsa('.home-premium-slider, .premium-brand-lab, .collection-story, .promo-mosaic, .protect-marquee, .premium-footer');
    targets.forEach((target, index) => target.style.setProperty('--svg-drift', `${index % 2 === 0 ? 1 : -1}`));
    if (!hasGSAP() || reduceMotion) return;

    targets.forEach((target, index) => {
      gsap.to(target, {
        '--svg-y': `${index % 2 === 0 ? -56 : 56}px`,
        '--svg-rotate': `${index % 2 === 0 ? 5 : -5}deg`,
        '--svg-scale': 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: target,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  };

  const initPremiumScrollEffects = () => {
    if (!hasGSAP() || reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    qsa('.premium-brand-lab__point, .premium-brand-lab__stats div, .promo-mosaic__tile, .collection-story__card').forEach((item, index) => {
      gsap.fromTo(item, {
        y: 46,
        opacity: 0,
        rotate: index % 2 === 0 ? -.6 : .6
      }, {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: .9,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true
        }
      });
    });

    qsa('.premium-brand-lab__intro, .section__header').forEach((item) => {
      gsap.fromTo(item, { clipPath: 'inset(0 18% 0 0)', opacity: .2 }, {
        clipPath: 'inset(0 0% 0 0)',
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 86%',
          once: true
        }
      });
    });
  };

  const initCategoryEdit = () => {
    qsa('[data-category-edit]').forEach((section) => {
      const tabs = qsa('[data-category-tab]', section);
      const panels = qsa('[data-category-panel]', section);
      if (!tabs.length || !panels.length) return;

      const activate = (targetId) => {
        tabs.forEach((tab) => tab.classList.toggle('is-active', tab.getAttribute('href') === `#${targetId}`));
        panels.forEach((panel) => {
          const active = panel.id === targetId;
          panel.classList.toggle('is-active', active);
          if (active && hasGSAP() && !reduceMotion) {
            gsap.fromTo(panel.querySelectorAll('.category-product-edit__item, .category-product-edit__panel-head > *'), {
              y: 22,
              opacity: 0
            }, {
              y: 0,
              opacity: 1,
              duration: .55,
              stagger: .045,
              ease: 'power3.out'
            });
          }
        });
      };

      tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
          const id = tab.getAttribute('href')?.replace('#', '');
          if (!id) return;
          event.preventDefault();
          activate(id);
        });
      });
    });
  };

  const initCollectionLayouts = () => {
    const grid = document.querySelector('[data-collection-grid]');
    if (!grid) return;
    const buttons = qsa('[data-grid-mode]');
    const label = document.querySelector('[data-layout-label]');
    const randomize = document.querySelector('[data-grid-randomize]');
    const cells = qsa('.collection-product-cell', grid);
    const labels = {
      clean: 'Clean grid',
      dense: 'Dense scan',
      editorial: 'Editorial rhythm',
      mosaic: 'Mosaic sizes'
    };

    const applyMode = (mode) => {
      const nextMode = labels[mode] ? mode : 'clean';
      grid.dataset.gridModeCurrent = nextMode;
      grid.classList.remove('is-clean', 'is-dense', 'is-editorial', 'is-mosaic');
      grid.classList.add(`is-${nextMode}`);
      buttons.forEach((button) => {
        const active = button.dataset.gridMode === nextMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (label) label.textContent = labels[nextMode];
      localStorage.setItem('premiumCollectionLayout', nextMode);
      if (hasGSAP() && !reduceMotion) {
        gsap.fromTo(cells, { y: 18, opacity: .72 }, { y: 0, opacity: 1, stagger: .018, duration: .42, ease: 'power3.out' });
        window.setTimeout(() => ScrollTrigger?.refresh(), 150);
      }
    };

    const applyPattern = (seed = Date.now()) => {
      cells.forEach((cell, index) => {
        const value = (index + seed) % 9;
        cell.classList.remove('is-wide', 'is-tall', 'is-feature');
        if (value === 0) cell.classList.add('is-feature');
        if (value === 2 || value === 6) cell.classList.add('is-wide');
        if (value === 4 || value === 7) cell.classList.add('is-tall');
      });
    };

    buttons.forEach((button) => button.addEventListener('click', () => applyMode(button.dataset.gridMode)));
    randomize?.addEventListener('click', () => {
      applyMode('mosaic');
      applyPattern(Math.floor(Math.random() * 100));
    });

    applyPattern(0);
    applyMode(localStorage.getItem('premiumCollectionLayout') || 'clean');
  };

  const initPremiumProductWall = () => {
    qsa('[data-product-wall]').forEach((wall) => {
      const grid = wall.querySelector('[data-wall-grid]');
      const cells = qsa('[data-wall-cell]', wall);
      const filterButtons = qsa('[data-wall-filter]', wall);
      const viewButtons = qsa('[data-wall-view]', wall);
      const sortButton = wall.querySelector('[data-wall-sort]');
      const quickView = wall.querySelector('[data-premium-quick-view]');
      let priceAscending = true;

      const animateCells = () => {
        if (!hasGSAP() || reduceMotion) return;
        gsap.fromTo(cells.filter((cell) => !cell.hidden), { y: 18, opacity: .55 }, { y: 0, opacity: 1, stagger: .025, duration: .46, ease: 'power3.out' });
      };

      filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const filter = button.dataset.wallFilter || 'all';
          filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
          cells.forEach((cell) => {
            const card = cell.querySelector('[data-product-card]');
            const haystack = `${card?.dataset.productType || ''} ${card?.dataset.productTitle || ''}`.toLowerCase();
            cell.hidden = filter !== 'all' && !haystack.includes(filter);
          });
          animateCells();
        });
      });

      viewButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const view = button.dataset.wallView || 'editorial';
          grid?.classList.remove('is-editorial', 'is-grid', 'is-compact');
          grid?.classList.add(`is-${view}`);
          viewButtons.forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
          });
          animateCells();
          if (hasGSAP()) window.setTimeout(() => ScrollTrigger?.refresh(), 120);
        });
      });

      sortButton?.addEventListener('click', () => {
        const sorted = [...cells].sort((a, b) => {
          const aPrice = Number(a.querySelector('[data-product-card]')?.dataset.productPrice || 0);
          const bPrice = Number(b.querySelector('[data-product-card]')?.dataset.productPrice || 0);
          return priceAscending ? aPrice - bPrice : bPrice - aPrice;
        });
        priceAscending = !priceAscending;
        sortButton.textContent = priceAscending ? 'Sort price' : 'Price high';
        sorted.forEach((cell) => grid?.append(cell));
        animateCells();
      });

      if (!quickView) return;
      const image = quickView.querySelector('[data-quick-view-image]');
      const title = quickView.querySelector('[data-quick-view-title]');
      const price = quickView.querySelector('[data-quick-view-price]');
      const type = quickView.querySelector('[data-quick-view-type]');
      const available = quickView.querySelector('[data-quick-view-available]');
      const link = quickView.querySelector('[data-quick-view-link]');
      const panel = quickView.querySelector('.premium-quick-view__panel');

      const closeQuickView = () => {
        const done = () => {
          quickView.hidden = true;
          document.body.classList.remove('drawer-open');
        };
        if (hasGSAP() && !reduceMotion) gsap.to(quickView, { opacity: 0, duration: .22, ease: 'power2.out', onComplete: done });
        else done();
      };

      qsa('[data-quick-view]', wall).forEach((button) => {
        button.addEventListener('click', () => {
          if (image) {
            image.src = button.dataset.image || '';
            image.alt = button.dataset.title || '';
          }
          title?.replaceChildren(button.dataset.title || '');
          price?.replaceChildren(button.dataset.price || '');
          type?.replaceChildren(button.dataset.type || 'Product');
          available?.replaceChildren(button.dataset.available || '');
          if (link) link.href = button.dataset.url || '#';
          quickView.hidden = false;
          document.body.classList.add('drawer-open');
          panel?.focus();
          if (hasGSAP() && !reduceMotion) {
            gsap.fromTo(quickView, { opacity: 0 }, { opacity: 1, duration: .24, ease: 'power2.out' });
            gsap.fromTo(panel, { y: 28, scale: .97 }, { y: 0, scale: 1, duration: .55, ease: 'power4.out' });
          }
        });
      });

      qsa('[data-quick-view-close]', quickView).forEach((button) => button.addEventListener('click', closeQuickView));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !quickView.hidden) closeQuickView();
      });
    });
  };

  const initFallbackReveal = () => {
    const items = qsa('.section, .premium-brand-lab, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content');
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
    initPremiumScroll();
    initAnimatedBackdrops();
    initPremiumScrollEffects();
    initCategoryEdit();
    initCollectionLayouts();
    initPremiumProductWall();
    initFallbackReveal();
    if (hasGSAP()) window.setTimeout(() => ScrollTrigger.refresh(), 400);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
