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
    if (sessionStorage.getItem('shopceptionLoaderSeen') || reduceMotion) {
      markLoaded();
      return Promise.resolve();
    }

    const loader = document.createElement('div');
    loader.className = 'shopception-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="shopception-loader__inner">
        <div class="shopception-loader__brand"><span>${document.title.split('–')[0].trim() || 'Shopception'}</span></div>
        <div class="shopception-loader__bar"></div>
        <div class="shopception-loader__meta"><span>Editorial commerce</span><span>Premium storefront</span></div>
      </div>
    `;
    document.body.prepend(loader);

    return new Promise((resolve) => {
      if (!hasGSAP()) {
        window.setTimeout(() => {
          loader.classList.add('is-hidden');
          markLoaded();
          sessionStorage.setItem('shopceptionLoaderSeen', 'true');
          window.setTimeout(() => loader.remove(), 850);
          resolve();
        }, 1300);
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(loader.querySelector('.shopception-loader__brand span'), { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1 })
        .fromTo(loader.querySelectorAll('.shopception-loader__meta span'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .7 }, .25)
        .to(loader, {
          opacity: 0,
          duration: .65,
          delay: .35,
          onStart: () => {
            markLoaded();
            sessionStorage.setItem('shopceptionLoaderSeen', 'true');
          },
          onComplete: () => {
            loader.remove();
            resolve();
          }
        });
    });
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
    if (hasGSAP() && !reduceMotion) {
      gsap.fromTo(header, { yPercent: -100 }, { yPercent: 0, duration: 1, ease: 'power4.out', delay: .25 });
      gsap.fromTo(qsa('.site-header__nav-item, .site-header__actions > *'), { y: -10, opacity: 0 }, { y: 0, opacity: 1, stagger: .045, duration: .7, ease: 'power3.out', delay: .55 });
    }
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
    if (media) tl.fromTo(media, { scale: 1.12, opacity: .72 }, { scale: 1.01, opacity: 1, duration: 1.7 }, 0);
    if (kicker) tl.fromTo(kicker, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .75 }, .14);
    if (eyebrow) tl.fromTo(eyebrow, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .75 }, .18);
    if (words.length) tl.fromTo(words, { yPercent: 120, rotate: 4, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.05, stagger: .035 }, .28);
    if (text) tl.fromTo(text, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .85 }, .72);
    if (buttons.length) tl.fromTo(buttons, { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .85 }, .82);
    if (media) {
      gsap.to(media, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
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
      gsap.fromTo(words, { yPercent: 115, rotate: 3, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1, stagger: .028, ease: 'power4.out', scrollTrigger: { trigger: heading, start: 'top 82%', once: true } });
    });
    qsa('.eyebrow, .lede, .promo-mosaic__content p, .lookbook-band__text, .product-card__title, .price').forEach((item) => {
      if (item.closest('.hero')) return;
      gsap.fromTo(item, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
    });
    qsa('.section, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content').forEach((item) => item.classList.add('is-visible'));
  };

  const initMediaMotion = () => {
    if (!hasGSAP() || reduceMotion) return;
    qsa('.editorial-split__media img, .collection-story__media img, .promo-mosaic__media img, .lookbook-band__media img, .lookbook-band__media video').forEach((image) => {
      gsap.fromTo(image, { scale: 1.12, yPercent: -4 }, { scale: 1.02, yPercent: 5, ease: 'none', scrollTrigger: { trigger: image.closest('section') || image, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  };

  const initProductCards = () => {
    if (!hasGSAP() || reduceMotion) return;
    qsa('.product-card').forEach((card) => {
      const media = card.querySelector('.product-card__media');
      const info = card.querySelector('.product-card__info');
      const panel = card.querySelector('.product-card__hover-panel');
      const secondary = card.querySelector('.product-card__image--secondary');
      gsap.fromTo(card, { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
      card.addEventListener('mouseenter', () => {
        gsap.to(media, { y: -5, duration: .45, ease: 'power3.out' });
        gsap.to(info, { y: 3, duration: .45, ease: 'power3.out' });
        if (panel) gsap.fromTo(panel, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' });
        if (secondary) gsap.to(secondary, { opacity: 1, scale: 1.04, duration: .65, ease: 'power3.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to([media, info], { y: 0, duration: .5, ease: 'power3.out' });
        if (secondary) gsap.to(secondary, { opacity: 0, scale: 1, duration: .55, ease: 'power3.out' });
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
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        countdown.querySelector('[data-days]')?.replaceChildren(pad(days));
        countdown.querySelector('[data-hours]')?.replaceChildren(pad(hours));
        countdown.querySelector('[data-minutes]')?.replaceChildren(pad(minutes));
        countdown.querySelector('[data-seconds]')?.replaceChildren(pad(seconds));
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
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: .35, ease: 'power3.out' });
        gsap.fromTo(image, { scale: .92, y: 24, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: .75, ease: 'power4.out' });
      }
    };
    const closeModal = () => {
      const done = () => {
        modal.hidden = true;
        document.body.classList.remove('media-modal-open');
        image?.removeAttribute('src');
      };
      if (hasGSAP() && !reduceMotion) gsap.to(modal, { opacity: 0, duration: .25, ease: 'power2.out', onComplete: done });
      else done();
    };
    qsa('.product-media-trigger').forEach((button) => button.addEventListener('click', () => open(button)));
    close?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
  };

  const initSearchFocus = () => {
    document.querySelectorAll('[data-drawer-open="search-drawer"]').forEach((button) => {
      button.addEventListener('click', () => {
        window.setTimeout(() => {
          const input = document.querySelector('#search-drawer input[type="search"]');
          input?.focus();
          if (hasGSAP() && !reduceMotion) gsap.fromTo('#search-drawer .drawer__header, #search-drawer .drawer__search > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .8, ease: 'power4.out' });
        }, 260);
      });
    });
  };

  const initPageExit = () => {
    if (reduceMotion) return;
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.href === window.location.href || link.closest('.product-media-trigger')) return;
      document.body.classList.add('is-leaving');
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
    initMediaMotion();
    initProductCards();
    initCountdowns();
    initProductMediaModal();
    initSearchFocus();
    initPageExit();
    initPointerGlow();
    initFallbackReveal();
    if (hasGSAP()) window.setTimeout(() => ScrollTrigger.refresh(), 400);
  };

  document.addEventListener('DOMContentLoaded', init);
})();
