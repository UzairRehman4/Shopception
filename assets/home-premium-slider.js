(() => {
  const sliders = document.querySelectorAll('[data-home-slider]');
  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-home-slide]'));
    const next = slider.querySelector('[data-home-slider-next]');
    const prev = slider.querySelector('[data-home-slider-prev]');
    const current = slider.querySelector('[data-home-slider-current]');
    if (slides.length < 2) return;
    let index = 0;
    let timer;
    const show = (nextIndex) => {
      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      if (current) current.textContent = String(index + 1).padStart(2, '0');
    };
    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 6000);
    };
    next?.addEventListener('click', () => { show(index + 1); restart(); });
    prev?.addEventListener('click', () => { show(index - 1); restart(); });
    restart();
  });
})();