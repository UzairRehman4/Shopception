(() => {
  window.__shopceptionPremiumTransition = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  let isTransitioning = false;

  const createWipe = () => {
    let wipe = document.querySelector('[data-pt-wipe]');
    if (wipe) return wipe;

    wipe = document.createElement('div');
    wipe.className = 'pt-wipe';
    wipe.setAttribute('data-pt-wipe', '');
    wipe.setAttribute('aria-hidden', 'true');
    wipe.innerHTML = '<span class="pt-wipe__panel"></span>';
    document.body.appendChild(wipe);
    return wipe;
  };

  const panel = () => document.querySelector('.pt-wipe__panel');

  const setPanel = (transform) => {
    const item = panel();
    if (!item) return;
    item.style.transition = 'none';
    item.style.transform = transform;
  };

  const animatePanel = (transform, duration) => {
    const item = panel();
    if (!item) return;
    item.style.transition = `transform ${duration}ms cubic-bezier(.83,0,.17,1)`;
    item.style.transform = transform;
  };

  const afterPaint = (callback) => requestAnimationFrame(() => requestAnimationFrame(callback));

  const enter = () => {
    if (prefersReducedMotion) return;
    const wipe = createWipe();
    wipe.classList.add('is-active');
    document.body.classList.add('pt-lock');

    setPanel('translate3d(0,0,0)');

    afterPaint(() => {
      animatePanel('translate3d(0,-100.25%,0)', 900);
    });

    window.setTimeout(() => {
      wipe.classList.remove('is-active');
      document.body.classList.remove('pt-lock');
      setPanel('translate3d(0,100.25%,0)');
    }, 980);
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
    document.body.classList.add('pt-lock', 'pt-leaving');

    setPanel('translate3d(0,100.25%,0)');

    afterPaint(() => {
      animatePanel('translate3d(0,0,0)', 720);
    });

    window.setTimeout(() => {
      window.location.href = href;
    }, 760);
  };

  const shouldSkip = (link, event) => {
    if (!link || isModifiedClick(event)) return true;
    if (event.defaultPrevented) return true;
    if (link.target || link.hasAttribute('download')) return true;
    if (link.closest('[data-drawer]') || link.closest('.product-media-trigger')) return true;

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
    enter();

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
    document.body.classList.remove('pt-lock', 'pt-leaving');
  });
})();
