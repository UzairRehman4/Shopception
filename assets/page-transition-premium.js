(() => {
  window.__shopceptionPremiumTransition = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  let isTransitioning = false;
  const duration = 540;

  const createWipe = () => {
    let wipe = document.querySelector('[data-pt-wipe]');
    if (wipe) return wipe;

    wipe = document.createElement('div');
    wipe.className = 'pt-wipe';
    wipe.setAttribute('data-pt-wipe', '');
    wipe.setAttribute('aria-hidden', 'true');
    const cols = window.matchMedia('(min-width: 769px)').matches ? 4 : 3;
    const rows = window.matchMedia('(min-width: 769px)').matches ? 4 : 6;
    wipe.innerHTML = Array.from({ length: cols * rows }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return `<span class="pt-tile" style="transition-delay:${(row + col) * 0.05}s"></span>`;
    }).join('');
    document.body.appendChild(wipe);
    return wipe;
  };

  const afterPaint = (callback) => requestAnimationFrame(() => requestAnimationFrame(callback));

  const enter = () => {
    if (prefersReducedMotion) return;
    const wipe = createWipe();
    wipe.classList.add('is-active');
    document.documentElement.classList.add('pt-animating');
    document.body.classList.add('pt-lock');

    afterPaint(() => {
      wipe.classList.remove('is-active');
      document.documentElement.classList.remove('pt-animating');
    });

    window.setTimeout(() => {
      document.body.classList.remove('pt-lock');
    }, duration + 360);
  };

  const leave = (href) => {
    if (isTransitioning) return;
    isTransitioning = true;

    if (prefersReducedMotion) {
      window.location.href = href;
      return;
    }

    const wipe = createWipe();
    wipe.classList.add('is-active');
    document.documentElement.classList.add('pt-animating');
    document.body.classList.add('pt-lock', 'pt-leaving');

    window.setTimeout(() => {
      window.location.href = href;
    }, duration + 20);
  };

  const shouldSkip = (link, event) => {
    if (!link || isModifiedClick(event)) return true;
    if (event.defaultPrevented) return true;
    if (link.target || link.hasAttribute('download')) return true;
    if (link.closest('[data-drawer]') || link.closest('.drawer') || link.closest('.product-media-trigger')) return true;
    if (link.closest('[data-drawer-open]') || link.closest('[data-drawer-close]') || link.closest('[data-add-to-cart]')) return true;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return true;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return true;
    if (url.href === window.location.href) return true;
    if (url.pathname === window.location.pathname && url.hash) return true;
    return false;
  };

  document.addEventListener('DOMContentLoaded', () => {
    createWipe();

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (shouldSkip(link, event)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      leave(link.href);
    }, true);
  });

  window.addEventListener('pageshow', () => {
    isTransitioning = false;
    document.documentElement.classList.remove('pt-animating');
    document.body.classList.remove('pt-lock', 'pt-leaving');
  });
})();
