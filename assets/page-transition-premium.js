(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

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

  const animatePanel = (panel, transform, duration, delay = 0) => {
    panel.style.transition = `transform ${duration}ms cubic-bezier(.77,0,.175,1) ${delay}ms`;
    panel.style.transform = transform;
  };

  const enter = () => {
    if (prefersReducedMotion) return;
    const wipe = createWipe();
    const items = panels();
    wipe.classList.add('is-active');
    document.body.classList.add('pt-lock');

    items.forEach((panel) => {
      panel.style.transition = 'none';
      panel.style.transform = 'translate3d(0,0,0)';
    });

    requestAnimationFrame(() => {
      items.forEach((panel, index) => animatePanel(panel, 'translate3d(0,-101%,0)', 760, index * 45));
    });

    window.setTimeout(() => {
      wipe.classList.remove('is-active');
      document.body.classList.remove('pt-lock');
      items.forEach((panel) => {
        panel.style.transition = 'none';
        panel.style.transform = 'translate3d(0,100%,0)';
      });
    }, 1050);
  };

  const leave = (href) => {
    if (prefersReducedMotion) {
      window.location.href = href;
      return;
    }

    const wipe = createWipe();
    const items = panels();
    wipe.classList.add('is-active');
    document.body.classList.add('pt-lock', 'pt-leaving');

    items.forEach((panel) => {
      panel.style.transition = 'none';
      panel.style.transform = 'translate3d(0,100%,0)';
    });

    requestAnimationFrame(() => {
      items.forEach((panel, index) => animatePanel(panel, 'translate3d(0,0,0)', 620, index * 38));
    });

    window.setTimeout(() => {
      window.location.href = href;
    }, 820);
  };

  const shouldSkip = (link, event) => {
    if (!link || isModifiedClick(event)) return true;
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
      leave(link.href);
    }, true);
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('pt-lock', 'pt-leaving');
  });
})();
