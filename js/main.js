document.addEventListener('DOMContentLoaded', function () {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].forEach((el) => new bootstrap.Tooltip(el));

  const barras = document.querySelectorAll('.progreso-fill');
  if ('IntersectionObserver' in window) {
    const observadorBarras = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const barra = entry.target;
            const anchoObjetivo = barra.getAttribute('data-ancho') || barra.style.width;
            barra.style.width = '0%';
            requestAnimationFrame(() => {
              barra.style.transition = 'width 1s cubic-bezier(0.16, 1, 0.3, 1)';
              barra.style.width = anchoObjetivo;
            });
            observer.unobserve(barra);
          }
        });
      },
      { threshold: 0.2 }
    );

    barras.forEach((barra) => {
      barra.setAttribute('data-ancho', barra.getAttribute('data-ancho') || barra.style.width);
      barra.style.width = '0%';
      observadorBarras.observe(barra);
    });
  } else {
    barras.forEach((barra) => {
      const anchoOriginal = barra.getAttribute('data-ancho') || barra.style.width;
      barra.style.width = '0%';
      setTimeout(() => {
        barra.style.width = anchoOriginal;
      }, 300);
    });
  }

  document.querySelectorAll('[data-carousel-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const carousel = bootstrap.Carousel.getOrCreateInstance(
        document.getElementById(btn.dataset.carouselToggle),
        { interval: 5000 }
      );
      const running = btn.getAttribute('aria-pressed') !== 'true';
      if (running) carousel.cycle();
      else carousel.pause();
      btn.setAttribute('aria-pressed', String(running));
      btn.textContent = running ? 'Pausar presentación' : 'Reproducir presentación';
    });
  });
});
