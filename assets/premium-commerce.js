(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = () => window.gsap && window.ScrollTrigger;
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

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
        if (image) image.removeAttribute('src');
      };

      if (hasGSAP() && !reduceMotion) {
        gsap.to(modal, { opacity: 0, duration: .25, ease: 'power2.out', onComplete: done });
      } else {
        done();
      }
    };

    qsa('.product-media-trigger').forEach((button) => button.addEventListener('click', () => open(button)));
    close?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
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

  const initProductCardDepth = () => {
    if (!hasGSAP() || reduceMotion || window.innerWidth < 990) return;

    qsa('.product-card--premium').forEach((card) => {
      const panel = card.querySelector('.product-card__hover-panel');
      const secondary = card.querySelector('.product-card__image--secondary');
      card.addEventListener('mouseenter', () => {
        if (panel) gsap.fromTo(panel, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' });
        if (secondary) gsap.to(secondary, { opacity: 1, scale: 1.04, duration: .65, ease: 'power3.out' });
      });
      card.addEventListener('mouseleave', () => {
        if (secondary) gsap.to(secondary, { opacity: 0, scale: 1, duration: .55, ease: 'power3.out' });
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    initCountdowns();
    initProductMediaModal();
    initMegaMenuMotion();
    initProductCardDepth();
  });
})();
