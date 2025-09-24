document.addEventListener('DOMContentLoaded', function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const gallery = document.querySelectorAll('.galeria-item img');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('closeBtn');
  const prevArrow = document.getElementById('prevArrowLight');
  const nextArrow = document.getElementById('nextArrowLight');

  let currentIndex = 0;
  let arrowTimeout;

  function showImage() {
    lightboxImg.src = gallery[currentIndex].src;
  }

  gallery.forEach((img, index) => {
    img.addEventListener('click', () => {
      currentIndex = index;
      showImage();
      lightbox.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lightbox.classList.remove('active');
  });

  if (prevArrow) {
    prevArrow.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
      showImage();
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % gallery.length;
      showImage();
    });
  }

  lightbox.addEventListener('click', e => {
    const mid = window.innerWidth / 2;
    if (e.target === lightboxImg || e.target === closeBtn) return;

    if (e.clientX < mid) {
      currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    } else {
      currentIndex = (currentIndex + 1) % gallery.length;
    }
    showImage();
  });

  lightbox.addEventListener('mousemove', e => {
    const mid = window.innerWidth / 2;
    clearTimeout(arrowTimeout);

    if (prevArrow && nextArrow) {
      if (e.clientX < mid) {
        prevArrow.style.display = 'block';
        nextArrow.style.display = 'none';
      } else {
        prevArrow.style.display = 'none';
        nextArrow.style.display = 'block';
      }

      arrowTimeout = setTimeout(() => {
        prevArrow.style.display = 'none';
        nextArrow.style.display = 'none';
      }, 2000);
    }
  });
});
