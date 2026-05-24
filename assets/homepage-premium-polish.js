(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const hasGSAP = () => window.gsap && window.ScrollTrigger;
  const waitForGSAP = (callback, attempts = 0) => {
    if (hasGSAP()) {
      callback();
      return;
    }
    if (attempts > 80 || reduceMotion) return;
    window.setTimeout(() => waitForGSAP(callback, attempts + 1), 50);
  };

  const initHeroPolish = () => {
    const slider = document.querySelector('[data-home-slider]');
    if (!slider || !hasGSAP() || reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const active = slider.querySelector('[data-home-slide].is-active') || slider.querySelector('[data-home-slide]');
    const copyItems = active ? qsa('.home-premium-slider__copy > *', active) : [];
    const media = active?.querySelector('.home-premium-slider__media img, .home-premium-slider__media video, .home-premium-slider__poster');
    const card = active?.querySelector('.home-premium-slider__side-card');
    const orbs = qsa('.home-premium-slider__orb', slider);

    gsap.set(copyItems, { opacity: 1, clearProps: 'transform,filter' });
    gsap.fromTo(copyItems, {
      y: 42,
      opacity: 0,
      clipPath: 'inset(0 0 100% 0)'
    }, {
      y: 0,
      opacity: 1,
      clipPath: 'inset(0 0 0% 0)',
      duration: .95,
      stagger: .075,
      ease: 'power4.out',
      delay: .1
    });

    if (media) {
      gsap.fromTo(media, { scale: 1.1 }, { scale: 1.02, duration: 1.6, ease: 'expo.out' });
      gsap.to(media, {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: {
          trigger: slider,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    if (card) {
      gsap.fromTo(card, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power4.out', delay: .35 });
    }

    if (orbs.length) {
      gsap.fromTo(orbs, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .035, duration: .6, ease: 'power3.out', delay: .65 });
    }
  };

  const initSectionPolish = () => {
    if (!hasGSAP() || reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    qsa('.category-product-edit__tab, .premium-product-wall__toolbar, .premium-product-wall__cell, .category-product-edit__item').forEach((item, index) => {
      gsap.fromTo(item, {
        y: 24,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: .68,
        delay: Math.min(index * .012, .12),
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          once: true
        }
      });
    });

    qsa('.product-card__media img').forEach((image) => {
      const card = image.closest('.product-card');
      if (!card) return;
      gsap.to(image, {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  };

  const initSiteMotion = () => {
    if (!hasGSAP() || reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    document.documentElement.classList.add('gsap-ready');

    qsa('.flowbit-collection__hero > *, .flowbit-filter, .flowbit-collection__grid .product-card, .flowbit-list-collections__grid > *, .premium-brand-lab__point, .collection-story__card, .promo-mosaic__tile').forEach((item, index) => {
      gsap.fromTo(item, {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: .72,
        delay: Math.min(index * .018, .18),
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          once: true
        }
      });
    });
  };

  const initProductCardA11y = () => {
    qsa('[data-wishlist-toggle]').forEach((button) => {
      const syncWishlistButton = () => {
        const active = button.classList.contains('is-active');
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', active ? 'Saved' : button.getAttribute('aria-label') || 'Save product');
        button.querySelector('span')?.replaceChildren(active ? '\u2665' : '\u2661');
      };
      syncWishlistButton();
      button.addEventListener('click', () => {
        window.setTimeout(syncWishlistButton, 0);
      });
    });
  };

  const demoClothing = [
    {
      title: 'Oversized Heavyweight Tee',
      type: 'Tops',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=84'
    },
    {
      title: 'Lavender Training Hoodie',
      type: 'Hoodies',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1000&q=84'
    },
    {
      title: 'Wide-Leg Utility Pant',
      type: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=84'
    },
    {
      title: 'Cropped Studio Jacket',
      type: 'Outerwear',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=84'
    },
    {
      title: 'Ribbed Everyday Tank',
      type: 'Tops',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=84'
    },
    {
      title: 'Relaxed Fleece Short',
      type: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=84'
    },
    {
      title: 'Soft Shell Crossbody',
      type: 'Accessories',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=84'
    },
    {
      title: 'Drop Shoulder Crew',
      type: 'Essentials',
      image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1000&q=84',
      altImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=84'
    }
  ];

  const heroCampaignImages = {
    clothing: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=86',
    essentials: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=86',
    accessories: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=86',
    purple: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=86',
    new: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=86'
  };

  const initDemoClothingProducts = () => {
    qsa('[data-product-card]').forEach((card, index) => {
      const haystack = `${card.dataset.productType || ''} ${card.dataset.productTitle || ''}`.toLowerCase();
      if (!haystack.includes('snowboard')) return;

      const demo = demoClothing[index % demoClothing.length];
      card.classList.add('is-demo-clothing');
      card.style.setProperty('--clothing-product-image', `url("${demo.image}")`);
      card.style.setProperty('--clothing-product-alt-image', `url("${demo.altImage}")`);
      card.dataset.productType = demo.type;
      card.dataset.productTitle = demo.title;

      const media = card.querySelector('.product-card__media');
      if (media && !media.querySelector('.product-card__demo-gallery')) {
        media.insertAdjacentHTML('beforeend', `
          <span class="product-card__demo-gallery" aria-hidden="true">
            <span style="background-image:url('${demo.image}')"></span>
            <span style="background-image:url('${demo.altImage}')"></span>
          </span>
        `);
      }

      card.querySelector('.product-card__title a')?.replaceChildren(demo.title);
      const meta = card.querySelector('.product-card__meta-row span:first-child');
      if (meta) meta.textContent = demo.type;

      const quick = card.querySelector('[data-quick-view]');
      if (quick) {
        quick.dataset.title = demo.title;
        quick.dataset.type = demo.type;
        quick.dataset.image = demo.image;
        quick.setAttribute('aria-label', `Quick view ${demo.title}`);
      }

      const wishlist = card.querySelector('[data-wishlist-toggle]');
      wishlist?.setAttribute('aria-label', `Save ${demo.title}`);
    });
  };

  const initHeroCampaignMedia = () => {
    qsa('[data-home-slide]').forEach((slide) => {
      const heading = slide.querySelector('.home-premium-slider__copy h1')?.textContent.trim().toLowerCase() || '';
      const key = Object.keys(heroCampaignImages).find((name) => heading.includes(name)) || 'clothing';
      slide.querySelector('.home-premium-slider__media')?.style.setProperty('--hero-campaign-image', `url("${heroCampaignImages[key]}")`);
    });
  };

  const initTransitionState = () => {
    window.addEventListener('pageshow', () => {
      document.querySelector('[data-pt-wipe]')?.classList.remove('is-active');
      document.body.classList.remove('pt-lock', 'pt-leaving');
      document.documentElement.classList.remove('pt-animating');
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    initHeroCampaignMedia();
    initDemoClothingProducts();
    waitForGSAP(() => {
      initHeroPolish();
      initSectionPolish();
      initSiteMotion();
    });
    initProductCardA11y();
    initTransitionState();
  });
})();
