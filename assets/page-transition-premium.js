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
    wipe.innerHTML = '<span class="pt-wipe__panel"></span><span class="pt-wipe__panel"></span><span class="pt-wipe__panel"></span><span class="pt-wipe__panel"></span>';
    document.body.appendChild(wipe);
    return wipe;
  };

  const panels = () => Array.from(document.querySelectorAll('.pt-wipe__panel'));

  const setPanel = (panel, transform) => {
    panel.style.transition = 'none';
    panel.style.transform = transform;
  };

  const animatePanel = (panel, transform, duration, delay = 0) => {
    panel.style.transition = `transform ${duration}ms cubic-bezier(.83,0,.17,1) ${delay}ms`;
    panel.style.transform = transform;
  };

  const afterPaint = (callback) => requestAnimationFrame(() => requestAnimationFrame(callback));

  const enter = () => {
    if (prefersReducedMotion) return;
    const wipe = createWipe();
    const items = panels();

    wipe.classList.add('is-active');
    document.body.classList.add('pt-lock');
    items.forEach((panel) => setPanel(panel, 'translate3d(0,0,0)'));

    afterPaint(() => {
      items.forEach((panel, index) => animatePanel(panel, 'translate3d(0,-100.5%,0)', 860, index * 34));
    });

    window.setTimeout(() => {
      wipe.classList.remove('is-active');
      document.body.classList.remove('pt-lock');
      items.forEach((panel) => setPanel(panel, 'translate3d(0,100.5%,0)'));
    }, 1120);
  };

  const leave = (href) => {
    if (isTransitioning) return;
    isTransitioning = true;

    if (prefersReducedMotion) {
      window.location.href = href;
      return;
    }

    const wipe = createWipe();
    const items = panels();

    wipe.classList.add('is-active');
    document.body.classList.add('pt-lock', 'pt-leaving');
    items.forEach((panel) => setPanel(panel, 'translate3d(0,100.5%,0)'));

    afterPaint(() => {
      items.forEach((panel, index) => animatePanel(panel, 'translate3d(0,0,0)', 720, index * 30));
    });

    window.setTimeout(() => {
      window.location.href = href;
    }, 940);
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
