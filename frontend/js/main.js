/**
 * MAIN JAVASCRIPT
 * Khởi tạo toàn bộ tương tác giao diện và sự kiện người dùng
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo các module
  if (typeof window.initProductOptions === 'function') {
    window.initProductOptions();
  }

  if (typeof window.initHeroSlider === 'function') {
    window.initHeroSlider();
  }

  if (window.OrderModal && typeof window.OrderModal.init === 'function') {
    window.OrderModal.init();
  }

  if (typeof window.initOrderForms === 'function') {
    window.initOrderForms();
  }

  // 2. Xử lý Navbar Sticky & Mobile Menu
  const header = document.getElementById('main-header');
  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  const mobileMenu = document.getElementById('mobile-nav-menu');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('shadow-md', 'border-b', 'border-slate-200/80');
      } else {
        header.classList.remove('shadow-md', 'border-b', 'border-slate-200/80');
      }
    });
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      if (isOpen) {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      } else {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Đóng menu mobile khi click vào 1 liên kết
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Thanh mua hàng cố định dưới đáy Mobile (Sticky Mobile Bar)
  const mobileStickyBar = document.getElementById('mobile-sticky-bar');
  const heroSection = document.getElementById('hero');

  if (mobileStickyBar && heroSection) {
    window.addEventListener('scroll', () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        mobileStickyBar.classList.add('visible');
      } else {
        mobileStickyBar.classList.remove('visible');
      }
    });
  }

  // 4. Video Review Modal Popup
  const videoModal = document.getElementById('video-review-modal');
  const videoIframe = document.getElementById('video-review-iframe');
  const videoTitle = document.getElementById('video-modal-title');
  const closeVideoBtn = document.getElementById('btn-close-video-modal');

  document.querySelectorAll('.btn-play-video').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoSrc = btn.dataset.videoSrc;
      const title = btn.dataset.videoTitle || 'Video Đánh Giá Chi Tiết';

      if (videoIframe && videoModal) {
        videoIframe.src = videoSrc;
        if (videoTitle) videoTitle.textContent = title;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeVideoBtn && videoModal && videoIframe) {
    const closeVideo = () => {
      videoModal.classList.remove('active');
      videoIframe.src = '';
      document.body.style.overflow = '';
    };

    closeVideoBtn.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideo();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeVideo();
      }
    });
  }

  // 5. Đồng hồ đếm ngược ưu đãi kết thúc trong ngày
  const countdownEl = document.getElementById('flash-sale-countdown');
  if (countdownEl) {
    let targetTime = new Date();
    targetTime.setHours(23, 59, 59, 999);

    function updateCountdown() {
      const now = new Date();
      let diff = Math.floor((targetTime - now) / 1000);

      if (diff <= 0) {
        countdownEl.textContent = "00:00:00";
        return;
      }

      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      diff %= 3600;
      const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');

      countdownEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // 6. Khởi tạo Slick Slider cho Đánh giá khách hàng (Chuyển tự động từ trái qua phải)
  if (window.jQuery && typeof window.jQuery.fn.slick === 'function') {
    const $feedbackSlider = $('#feedback-slick-slider');
    if ($feedbackSlider.length) {
      $feedbackSlider.slick({
        dots: true,
        arrows: true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        speed: 700,
        cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
        pauseOnHover: true,
        prevArrow: '<button type="button" class="slick-prev" aria-label="Xem đánh giá trước"><i class="fa-solid fa-chevron-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next" aria-label="Xem đánh giá kế tiếp"><i class="fa-solid fa-chevron-right"></i></button>',
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 640,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false // Trên mobile ẩn nút bấm để trải nghiệm vuốt cảm ứng mượt hơn
            }
          }
        ]
      });

      // Tự động chuyển slide từ trái qua phải (slickPrev) sau mỗi 3 giây
      let feedbackAutoplayTimer = setInterval(() => {
        $feedbackSlider.slick('slickPrev');
      }, 3000);

      // Tạm dừng khi rê chuột vào, tiếp tục khi rời chuột ra
      $feedbackSlider.on('mouseenter', () => {
        clearInterval(feedbackAutoplayTimer);
      });

      $feedbackSlider.on('mouseleave', () => {
        clearInterval(feedbackAutoplayTimer);
        feedbackAutoplayTimer = setInterval(() => {
          $feedbackSlider.slick('slickPrev');
        }, 3000);
      });
    }
  }
});
