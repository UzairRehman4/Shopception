(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = () => window.gsap;

  const initHeroCanvas = (slider) => {
    const canvas = slider.querySelector('[data-hero-webgl]');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const rect = slider.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < 9; i += 1) {
        const x = width * (0.12 + i * 0.11) + Math.sin(time * 1.7 + i) * 28;
        const y = height * (0.25 + (i % 3) * 0.18) + Math.cos(time * 1.2 + i) * 34;
        const radius = Math.max(80, width * 0.08) + Math.sin(time + i) * 18;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, i % 2 ? 'rgba(169,132,175,.22)' : 'rgba(138,175,132,.18)');
        gradient.addColorStop(0.55, 'rgba(158,43,37,.08)');
        gradient.addColorStop(1, 'rgba(255,248,240,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255,248,240,.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i += 1) {
        const offset = Math.sin(time + i) * 18;
        ctx.beginPath();
        ctx.moveTo(width * 0.08, height * (0.18 + i * 0.1) + offset);
        ctx.lineTo(width * 0.92, height * (0.28 + i * 0.08) - offset);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
  };

  const sliders = document.querySelectorAll('[data-home-slider]');
  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-home-slide]'));
    const next = slider.querySelector('[data-home-slider-next]');
    const prev = slider.querySelector('[data-home-slider-prev]');
    const current = slider.querySelector('[data-home-slider-current]');
    const dots = Array.from(slider.querySelectorAll('[data-home-slider-dot]'));
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer;
    slides.forEach((slide, slideIndex) => {
      slide.dataset.slideState = slideIndex === index ? 'active' : slideIndex < index ? 'before' : 'after';
    });

    const animateSlide = (fromSlide, toSlide, direction = 1) => {
      if (!hasGSAP() || reduceMotion) return;
      const media = toSlide.querySelector('.home-premium-slider__media img, .home-premium-slider__media video, .home-premium-slider__poster');
      const copy = toSlide.querySelectorAll('.home-premium-slider__copy > *');
      const card = toSlide.querySelector('.home-premium-slider__side-card');
      const orbit = slider.querySelector('.home-premium-slider__orbit');

      gsap.killTweensOf([fromSlide, toSlide, media, copy, card, orbit]);
      gsap.fromTo(toSlide, {
        clipPath: direction > 0 ? 'polygon(18% 0, 100% 0, 82% 100%, 0 100%)' : 'polygon(0 0, 82% 0, 100% 100%, 18% 100%)',
        scale: 1.04,
        rotateY: direction * -8,
        filter: 'blur(10px)'
      }, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        scale: 1,
        rotateY: 0,
        filter: 'blur(0px)',
        duration: 1.05,
        ease: 'expo.out'
      });
      if (fromSlide) {
        gsap.to(fromSlide, {
          scale: 1.06,
          rotateY: direction * 7,
          filter: 'blur(8px)',
          duration: .72,
          ease: 'power3.out'
        });
      }
      if (media) {
        gsap.fromTo(media, { scale: 1.18, xPercent: direction * 3 }, { scale: 1.02, xPercent: 0, duration: 1.35, ease: 'expo.out' });
      }
      if (copy.length) {
        gsap.fromTo(copy, { y: 34, opacity: 0, rotateX: -18 }, { y: 0, opacity: 1, rotateX: 0, stagger: .06, duration: .82, ease: 'power4.out', delay: .12 });
      }
      if (card) {
        gsap.fromTo(card, { x: 36, opacity: 0, rotate: 2 }, { x: 0, opacity: 1, rotate: 0, duration: .78, ease: 'power4.out', delay: .2 });
      }
      if (orbit) {
        gsap.fromTo(orbit, { '--orbit-shift': `${direction * 18}px` }, { '--orbit-shift': '0px', duration: .8, ease: 'power3.out' });
      }
    };

    const show = (nextIndex) => {
      if (slides.length < 2) return;
      if (nextIndex === index) {
        const activeSlide = slides[index];
        activeSlide.classList.add('is-active');
        activeSlide.dataset.slideState = 'active';
        dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
        if (current) current.textContent = String(index + 1).padStart(2, '0');
        return;
      }
      const previous = index;
      const direction = nextIndex >= index ? 1 : -1;
      const fromSlide = slides[previous];
      fromSlide.classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      const toSlide = slides[index];
      toSlide.classList.add('is-active');

      slides.forEach((slide, slideIndex) => {
        slide.dataset.slideState = slideIndex === index ? 'active' : slideIndex < index ? 'before' : 'after';
        const video = slide.querySelector('video');
        if (video) {
          if (slideIndex === index) video.play().catch(() => {});
          else video.pause();
        }
      });

      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
      if (current) current.textContent = String(index + 1).padStart(2, '0');
      animateSlide(fromSlide, toSlide, direction);
    };

    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 7000);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const dotIndex = Number(dot.dataset.homeSliderDot);
        if (Number.isNaN(dotIndex) || dotIndex === index) return;
        show(dotIndex);
        restart();
      });
    });

    next?.addEventListener('click', () => { show(index + 1); restart(); });
    prev?.addEventListener('click', () => { show(index - 1); restart(); });
    slider.addEventListener('mouseenter', () => window.clearInterval(timer));
    slider.addEventListener('mouseleave', restart);
    initHeroCanvas(slider);
    show(index);
    restart();
  });
})();
