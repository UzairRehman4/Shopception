(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const markLoaded = () => {
    document.body.classList.add('is-loaded');
  };

  const buildLoader = () => {
    if (sessionStorage.getItem('shopceptionLoaderSeen') || reduceMotion) {
      markLoaded();
      return;
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

    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      markLoaded();
      sessionStorage.setItem('shopceptionLoaderSeen', 'true');
      window.setTimeout(() => loader.remove(), 850);
    }, 1450);
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

  const initReveal = () => {
    const items = document.querySelectorAll('.section, .product-card, .collection-story__card, .promo-mosaic__tile, .hero__content, .lookbook-band__content');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
      observer.observe(item);
    });
  };

  const initSearchFocus = () => {
    document.querySelectorAll('[data-drawer-open="search-drawer"]').forEach((button) => {
      button.addEventListener('click', () => {
        window.setTimeout(() => {
          document.querySelector('#search-drawer input[type="search"]')?.focus();
        }, 260);
      });
    });
  };

  const initPageExit = () => {
    if (reduceMotion) return;
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      if (link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.href === window.location.href) return;
      document.body.classList.add('is-leaving');
    });
  };

  const initPointerGlow = () => {
    if (reduceMotion || window.innerWidth < 990) return;
    const glow = document.createElement('div');
    glow.className = 'premium-pointer-glow';
    document.body.append(glow);
    window.addEventListener('pointermove', (event) => {
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
  };

  document.addEventListener('DOMContentLoaded', () => {
    buildLoader();
    initHeader();
    initReveal();
    initSearchFocus();
    initPageExit();
    initPointerGlow();
  });
})();
