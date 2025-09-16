(function () {
  const hero = document.querySelector('.hero');
  const heroBg = document.querySelector('.hero-bg');
  if (!hero || !heroBg) return;

  let heroHeight = 0;
  let bgHeight = 0;

  function recalcSizes() {
    heroHeight = hero.offsetHeight;
    bgHeight = heroBg.offsetHeight;
  }

  function update() {
    // desativa parallax no mobile
    if (window.innerWidth <= 767) {
      heroBg.style.transform = 'translateY(0)';
      return;
    }

    const start = hero.offsetTop;
    const scrollY = window.scrollY || window.pageYOffset;
    let progress = (scrollY - start) / heroHeight;
    progress = Math.min(Math.max(progress, 0), 1);

    const maxShift = bgHeight - heroHeight;
    const translateY = -progress * maxShift;

    heroBg.style.transform = `translateY(${translateY}px)`;
  }

  function onScroll() {
    requestAnimationFrame(update);
  }

  window.addEventListener('load', () => { recalcSizes(); update(); });
  window.addEventListener('resize', () => { recalcSizes(); update(); });
  window.addEventListener('scroll', onScroll, { passive: true });
})();
