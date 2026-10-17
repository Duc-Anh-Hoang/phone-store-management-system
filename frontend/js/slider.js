/**
 * SLIDER & GALLERY ẢNH SẢN PHẨM HERO SECTION
 */

function initHeroSlider() {
  const sliderList = ['desert', 'natural', 'white', 'black', 'back'];
  let currentIndex = 0;

  const btnPrev = document.getElementById('hero-slider-prev');
  const btnNext = document.getElementById('hero-slider-next');
  const thumbs = document.querySelectorAll('.hero-thumb-btn');

  function goToSlide(index) {
    if (index < 0) index = sliderList.length - 1;
    if (index >= sliderList.length) index = 0;
    currentIndex = index;

    const colorKey = sliderList[currentIndex];
    if (window.ProductState) {
      window.ProductState.color = colorKey;
      if (typeof window.updateProductUI === 'function') {
        window.updateProductUI();
      }
    }

    // Cập nhật viền active cho thumbnail
    thumbs.forEach(thumb => {
      if (thumb.dataset.color === colorKey) {
        thumb.classList.add('border-[#16A34A]', 'ring-2', 'ring-emerald-400');
        thumb.classList.remove('border-transparent');
      } else {
        thumb.classList.remove('border-[#16A34A]', 'ring-2', 'ring-emerald-400');
        thumb.classList.add('border-transparent');
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex - 1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentIndex + 1);
    });
  }

  thumbs.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      const color = thumb.dataset.color;
      const index = sliderList.indexOf(color);
      if (index !== -1) {
        goToSlide(index);
      }
    });
  });

  // Hỗ trợ Touch Swipe trên Mobile
  const sliderContainer = document.getElementById('hero-slider-container');
  if (sliderContainer) {
    let startX = 0;
    let endX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = endX - startX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          goToSlide(currentIndex + 1); // Vuốt sang trái -> Ảnh tiếp theo
        } else {
          goToSlide(currentIndex - 1); // Vuốt sang phải -> Ảnh trước
        }
      }
    }
  }

  // Lắng nghe khi màu thay đổi từ bên ngoài (ví dụ bấm radio button)
  window.addEventListener('productStateChanged', (e) => {
    const newColor = e.detail.color;
    const idx = sliderList.indexOf(newColor);
    if (idx !== -1 && idx !== currentIndex) {
      currentIndex = idx;
      thumbs.forEach(thumb => {
        if (thumb.dataset.color === newColor) {
          thumb.classList.add('border-[#16A34A]', 'ring-2', 'ring-emerald-400');
          thumb.classList.remove('border-transparent');
        } else {
          thumb.classList.remove('border-[#16A34A]', 'ring-2', 'ring-emerald-400');
          thumb.classList.add('border-transparent');
        }
      });
    }
  });

  // Thiết lập thumbnail active ban đầu
  goToSlide(0);
}

window.initHeroSlider = initHeroSlider;

