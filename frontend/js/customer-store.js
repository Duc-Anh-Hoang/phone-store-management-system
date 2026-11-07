/**
 * CellphoneS - 241 Lê Văn Việt - MAIN CUSTOMER INTERFACE CONTROLLER
 * Điều khiển giao diện khách hàng tham khảo phong cách CellphoneS:
 * - Mega menu 3 tầng (NhomHang -> LoaiHang -> MatHang)
 * - Hero Banner Slider & Quick Tags
 * - 6 Dải sản phẩm: Điện thoại nổi bật, Hàng mới, Bán chạy, Phụ kiện, Đã xem
 * - Thanh tìm kiếm thông minh với Autocomplete và Bộ lọc nâng cao
 * - Đồng hồ đếm ngược khuyến mãi theo vw_KhuyenMaiTrangThai
 * - Tương thích song ngữ và đồng bộ phiên đăng nhập
 */

(function () {
  'use strict';

  console.log('>>> [CUSTOMER STORE] IIFE is running! readyState:', document.readyState);

  let heroCurrentSlide = 0;
  let heroSlideInterval = null;

  async function initApp() {
    console.log('>>> [CUSTOMER STORE] initApp started');
    // 1. Khởi tạo dữ liệu
    if ((window.CellphoneSData || window.StoreData)) {
      await (window.CellphoneSData || window.StoreData).init();
      console.log('>>> [CUSTOMER STORE] StoreData inited, products:', (window.CellphoneSData || window.StoreData).products.length);
    }

    // 2. Khởi tạo UI Giỏ hàng
    if ((window.CellphoneSCart || window.Cart)) {
      (window.CellphoneSCart || window.Cart).updateUI();
    }

    // 3. Render các thành phần
    renderMegaMenu();
    renderHeroSlider();
    renderShelves();
    initTramTiepSucSection();
    initDualCategoryTabsSection();
    console.log('>>> [CUSTOMER STORE] renderShelves completed');
    initSearchAutocomplete();
    initScrollToTop();
    updateAuthHeader();

    // Lắng nghe đăng nhập thay đổi
    window.addEventListener('storage', () => {
      updateAuthHeader();
      if ((window.CellphoneSCart || window.Cart)) (window.CellphoneSCart || window.Cart).updateUI();
    });
  }

  /**
   * Cập nhật Header theo trạng thái Đăng nhập khách hàng / Quản trị
   */
  function updateAuthHeader() {
    const user = (window.CellphoneSAuth || window.Auth) ? (window.CellphoneSAuth || window.Auth).getUser() : null;
    const btnLogin = document.getElementById('btn-header-login');
    const menuStaff = document.getElementById('header-staff-menu');
    const menuCustomer = document.getElementById('header-customer-menu');
    const custName = document.getElementById('customer-header-name');
    const custPhone = document.getElementById('customer-header-phone');
    const custPoints = document.getElementById('customer-header-points');

    if (!user) {
      if (btnLogin) {
        btnLogin.classList.remove('hidden');
        btnLogin.style.display = 'inline-flex';
      }
      if (menuStaff) {
        menuStaff.classList.add('hidden');
        menuStaff.style.display = 'none';
      }
      if (menuCustomer) {
        menuCustomer.classList.add('hidden');
        menuCustomer.style.display = 'none';
      }
      return;
    }

    if (user.type === 'staff') {
      if (btnLogin) {
        btnLogin.classList.add('hidden');
        btnLogin.style.display = 'none';
      }
      if (menuStaff) {
        menuStaff.classList.remove('hidden');
        menuStaff.style.display = 'inline-flex';
        menuStaff.style.alignItems = 'center';
        menuStaff.style.flexWrap = 'nowrap';
        const roleEl = document.getElementById('staff-header-role');
        if (roleEl) roleEl.remove();
      }
      if (menuCustomer) {
        menuCustomer.classList.add('hidden');
        menuCustomer.style.display = 'none';
      }
    } else {
      // Khách hàng
      if (btnLogin) {
        btnLogin.classList.add('hidden');
        btnLogin.style.display = 'none';
      }
      if (menuStaff) {
        menuStaff.classList.add('hidden');
        menuStaff.style.display = 'none';
      }
      if (menuCustomer) {
        menuCustomer.classList.remove('hidden');
        menuCustomer.style.display = 'inline-flex';
        menuCustomer.style.alignItems = 'center';
        menuCustomer.style.flexWrap = 'nowrap';
      }
      if (custName) custName.textContent = user.hoTen || 'Thành viên';
      if (custPhone) custPhone.textContent = user.sdt || '';
      if (custPoints) custPoints.textContent = (user.diemTichLuy || 150) + ' Đ';
    }
  }

  /**
   * Hero Slider - 8 Banner Marketing Nét Chuẩn Hoàng Hà Mobile từ images/banner/
   */
  const DEFAULT_HERO_SLIDES = [
    {
      id: "slide-1",
      title: "Săn vé Galaxy Festival Concert",
      subtitle: "Cùng SAMAMOBILE",
      image: "images/banner/960301_samsung-festival-web.jpg",
      targetMaHang: "MH003",
      brand: "Samsung"
    },
    {
      id: "slide-2",
      title: "Galaxy S26 Series.",
      subtitle: "Mua Ngay",
      image: "images/banner/471331_S26-Series-1200x375.jpg",
      targetMaHang: "MH003",
      brand: "Samsung"
    },
    {
      id: "slide-3",
      title: "REDMAGIC Astra 2 Gaming",
      subtitle: "Đặt mua ngay",
      image: "images/banner/astra-2-web-083724546.jpg",
      targetMaHang: "MH002",
      brand: "Tablet"
    },
    {
      id: "slide-4",
      title: "Huawei Watch GT 7 Series",
      subtitle: "Chase the Wild",
      image: "images/banner/666649_KV-HUAWEI-WATCH-GT-7-Series-1200x375.jpg",
      targetMaHang: "MH008",
      brand: "Phụ kiện"
    },
    {
      id: "slide-5",
      title: "iPhone Duo",
      subtitle: "Đặt mua ngay hôm nay",
      image: "images/banner/iphone-duo-web-084156526.jpg",
      targetMaHang: "MH001",
      brand: "Apple"
    },
    {
      id: "slide-6",
      title: "OPPO Find X10 Series",
      subtitle: "Đặt Trước Rước Ngay",
      image: "images/banner/860851_OPPO-Find-X10-Series-web.jpg",
      targetMaHang: "MH006",
      brand: "OPPO"
    },
    {
      id: "slide-7",
      title: "iPhone 18 Pro Max",
      subtitle: "Đặt mua ngay",
      image: "images/banner/iphone-18-web-082925157.jpg",
      targetMaHang: "MH001",
      brand: "Apple"
    },
    {
      id: "slide-8",
      title: "Galaxy A18 | A08",
      subtitle: "Bền mượt cực đã",
      image: "images/banner/702904_KV-SS-A18-_-A08-1200x375-25w.jpg",
      targetMaHang: "MH004",
      brand: "Samsung"
    }
  ];

  // Quản lý Hero Slider & Dải Tab trượt liên tục từng cột (1|2|3|4 -> 2|3|4|5)
  let heroCurrentIndex = 8; // Bắt đầu ở Set 1 (index 8..15 cho 8 slides)
  let heroTotalSlides = 8;

  function getTabColWidth() {
    const viewport = document.getElementById('hero-tabs-viewport') || document.getElementById('hero-tabs-wrapper');
    if (!viewport) return 0;
    const isDesktop = window.innerWidth >= 768;
    const itemsVisible = isDesktop ? 4 : 2;
    return viewport.clientWidth / itemsVisible;
  }

  function applyTabsPosition(animate = true) {
    const tabsTrack = document.getElementById('hero-banner-tabs');
    if (!tabsTrack) return;
    const colWidth = getTabColWidth();
    const offset = heroCurrentIndex * colWidth;

    if (animate) {
      tabsTrack.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      tabsTrack.style.transition = 'none';
    }
    tabsTrack.style.transform = `translateX(-${offset}px)`;
  }

  function updateActiveSlideUI() {
    const activeSlide = ((heroCurrentIndex % heroTotalSlides) + heroTotalSlides) % heroTotalSlides;
    const slides = document.querySelectorAll('.hero-fade-slide');
    const dots = document.querySelectorAll('#hero-slider-dots button');
    const tabs = document.querySelectorAll('.hero-tab-item');

    // 1. Chuyển cảnh mờ dần ảnh banner
    slides.forEach((s, i) => {
      if (i === activeSlide) s.classList.add('active-slide');
      else s.classList.remove('active-slide');
    });

    // 2. Cập nhật dots
    dots.forEach((d, i) => {
      if (i === activeSlide) {
        d.className = 'w-6 h-1.5 rounded-full bg-[#2563EB] transition-all cursor-pointer shadow-sm';
      } else {
        d.className = 'w-2 h-1.5 rounded-full bg-white/70 hover:bg-white transition-all cursor-pointer';
      }
    });

    // 3. Cập nhật active tab: Cột đầu tiên trong khung hiển thị (tại heroCurrentIndex) là active (chỉ đổi màu chữ và gạch chân dưới, không đổi màu nền)
    tabs.forEach((tab) => {
      const domIdx = parseInt(tab.getAttribute('data-dom-index'), 10);
      const title = tab.querySelector('.tab-title');
      const subtitle = tab.querySelector('.tab-subtitle');
      if (domIdx === heroCurrentIndex) {
        tab.classList.add('active-tab');
        if (title) {
          title.className = 'tab-title text-[15px] sm:text-[16px] lg:text-[17px] font-extrabold leading-tight line-clamp-2 w-full text-center min-h-[40px] flex items-center justify-center text-[#2563EB] font-sans';
        }
        if (subtitle) {
          subtitle.className = 'tab-subtitle text-[14px] font-semibold leading-tight truncate w-full text-center mt-1 text-[#2563EB] font-sans';
        }
      } else {
        tab.classList.remove('active-tab');
        if (title) {
          title.className = 'tab-title text-[15px] sm:text-[16px] lg:text-[17px] font-bold leading-tight line-clamp-2 w-full text-center min-h-[40px] flex items-center justify-center text-slate-800 font-sans';
        }
        if (subtitle) {
          subtitle.className = 'tab-subtitle text-[14px] font-medium leading-tight truncate w-full text-center mt-1 text-slate-600 font-sans';
        }
      }
    });
  }

  function startHeroSliderAuto() {
    if (heroSlideInterval) clearInterval(heroSlideInterval);
    heroSlideInterval = setInterval(() => {
      heroCurrentIndex++;
      applyTabsPosition(true);
      updateActiveSlideUI();
    }, 3000); // Tự động chuyển slide đều đặn đúng mỗi 3 giây
  }

  // Chuyển tới slide kế tiếp (dịch 1 cột: 1|2|3|4 -> ẩn 1 hiện 2|3|4|5)
  window.nextHeroSlide = function () {
    heroCurrentIndex++;
    applyTabsPosition(true);
    updateActiveSlideUI();
    startHeroSliderAuto();
  };

  // Quay lại slide trước (dịch 1 cột ngược lại)
  window.prevHeroSlide = function () {
    heroCurrentIndex--;
    applyTabsPosition(true);
    updateActiveSlideUI();
    startHeroSliderAuto();
  };

  // Alias tương thích
  window.prevTabGroup = window.prevHeroSlide;
  window.nextTabGroup = window.nextHeroSlide;

  // Chuyển trực tiếp tới slide theo index (0..7) từ dot
  window.setHeroSlide = function (targetSlideIdx) {
    const currentSlide = ((heroCurrentIndex % heroTotalSlides) + heroTotalSlides) % heroTotalSlides;
    let diff = targetSlideIdx - currentSlide;
    if (diff === 0) return;
    heroCurrentIndex += diff;
    applyTabsPosition(true);
    updateActiveSlideUI();
    startHeroSliderAuto();
  };

  // Click vào một tab cụ thể trên dải tab: dịch đưa tab đó lên vị trí cột đầu tiên (active)
  window.onTabItemClick = function (domIdx) {
    if (domIdx === heroCurrentIndex) return;
    heroCurrentIndex = domIdx;
    applyTabsPosition(true);
    updateActiveSlideUI();
    startHeroSliderAuto();
  };

  window.addEventListener('resize', () => {
    applyTabsPosition(false);
  });

  window.addEventListener('load', () => {
    applyTabsPosition(false);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const total = heroTotalSlides;
      heroCurrentIndex = (((heroCurrentIndex % total) + total) % total) + total;
      applyTabsPosition(false);
      updateActiveSlideUI();
      startHeroSliderAuto();
    }
  });

  function renderHeroSlider() {
    const slidesContainer = document.getElementById('hero-slider-container');
    const dotsContainer = document.getElementById('hero-slider-dots');
    const tabsContainer = document.getElementById('hero-banner-tabs');
    if (!slidesContainer) return;

    let slides = ((window.CellphoneSData || window.StoreData)?.config?.banners?.heroSlides);
    if (!slides || !slides.length) {
      slides = DEFAULT_HERO_SLIDES;
    }
    heroTotalSlides = slides.length; // 8

    // 1. Render các slide hiệu ứng mờ dần (Cross-fade)
    slidesContainer.innerHTML = slides.map((s, idx) => `
      <div class="hero-fade-slide cursor-pointer select-none group ${idx === 0 ? 'active-slide' : ''}" data-slide-index="${idx}" onclick="window.onBannerClick('${s.targetMaHang || 'MH001'}', '${s.brand || 'all'}')">
        <img src="${s.image}?v=4" alt="${s.title}" class="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-[1.01]" loading="${idx === 0 ? 'eager' : 'lazy'}">
      </div>
    `).join('');

    // 2. Render dots chỉ số trên ảnh (Active là thanh capsule xanh dương #2563EB)
    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map((_, idx) => `
        <button type="button" onclick="window.setHeroSlide(${idx})" class="transition-all cursor-pointer ${idx === 0 ? 'w-6 h-1.5 rounded-full bg-[#2563EB]' : 'w-2 h-1.5 rounded-full bg-white/70 hover:bg-white'}" aria-label="Slide ${idx + 1}"></button>
      `).join('');
    }

    // 3. Render 3 bộ tabs liên tục (Set 0, Set 1, Set 2) để trượt vô tận từng cột (1|2|3|4 -> 2|3|4|5)
    if (tabsContainer) {
      const tripleSlides = [...slides, ...slides, ...slides];
      tabsContainer.innerHTML = tripleSlides.map((s, domIdx) => {
        const slideIdx = domIdx % slides.length;
        const isActive = domIdx === 8;
        return `
          <button type="button" onclick="window.onTabItemClick(${domIdx})" data-dom-index="${domIdx}" data-slide-index="${slideIdx}" class="hero-tab-item w-1/2 md:w-1/4 flex-shrink-0 py-3.5 sm:py-4 px-2.5 sm:px-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${isActive ? 'active-tab' : ''}">
            <span class="tab-title text-[15px] sm:text-[16px] lg:text-[17px] font-bold leading-tight line-clamp-2 w-full text-center min-h-[40px] flex items-center justify-center ${isActive ? 'text-[#2563EB] font-extrabold' : 'text-slate-800'}">${s.title}</span>
            <span class="tab-subtitle text-[14px] leading-tight truncate w-full text-center mt-1 ${isActive ? 'text-[#2563EB] font-semibold' : 'text-slate-600 font-medium'}">${s.subtitle || ''}</span>
          </button>
        `;
      }).join('');

      // Lắng nghe transitionend để chuẩn hóa vòng lặp vô tận (Set 1 <-> Set 2 <-> Set 0)
      if (!tabsContainer._hasTransitionListener) {
        tabsContainer._hasTransitionListener = true;
        tabsContainer.addEventListener('transitionend', (e) => {
          if (e && (e.target !== tabsContainer || e.propertyName !== 'transform')) return;
          const total = heroTotalSlides;
          if (heroCurrentIndex >= 2 * total || heroCurrentIndex < total) {
            heroCurrentIndex = (((heroCurrentIndex % total) + total) % total) + total;
            applyTabsPosition(false);
          }
        });
      }
    }

    // Khởi tạo vị trí ban đầu (Set 1: slide 0)
    heroCurrentIndex = heroTotalSlides; // 8
    requestAnimationFrame(() => {
      applyTabsPosition(false);
      updateActiveSlideUI();
    });
    startHeroSliderAuto();
  }

  window.onBannerClick = function(targetMaHang, brand) {
    const target = targetMaHang || 'MH001';
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(target);
  };

  window.showStudentPromo = function() {
    const shelf = document.getElementById('promotions-shelf') || document.getElementById('products-grid');
    if (shelf) {
      shelf.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Quản lý thông báo Realtime (sẵn sàng kết nối WebSocket / SSE / API)
  window.NotificationCenter = {
    toggle: function() {
      const pop = document.getElementById('notification-popover');
      if (pop) pop.classList.toggle('hidden');
    },
    setBadge: function(count) {
      const badge = document.getElementById('notification-badge');
      const countBadge = document.getElementById('notification-count-badge');
      if (count && count > 0) {
        if (badge) badge.classList.remove('hidden');
        if (countBadge) {
          countBadge.textContent = `${count} tin mới`;
          countBadge.classList.remove('hidden');
        }
      } else {
        if (badge) badge.classList.add('hidden');
        if (countBadge) countBadge.classList.add('hidden');
      }
    },
    render: function(notifications) {
      const listEl = document.getElementById('notification-list');
      if (!listEl) return;
      if (!Array.isArray(notifications) || notifications.length === 0) {
        listEl.innerHTML = `
          <div id="notification-empty" class="py-8 px-4 text-center text-slate-400 space-y-2">
            <i class="fa-regular fa-bell-slash text-2xl text-slate-300"></i>
            <p class="text-xs">Hiện chưa có thông báo mới</p>
          </div>
        `;
        this.setBadge(0);
        return;
      }
      this.setBadge(notifications.length);
      listEl.innerHTML = notifications.map(item => `
        <div class="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start" onclick="${item.onClick || ''}">
          <div class="w-8 h-8 rounded-lg ${item.bgClass || 'bg-blue-100'} ${item.colorClass || 'text-[#2563EB]'} flex items-center justify-center flex-shrink-0 text-xs">
            <i class="${item.icon || 'fa-solid fa-bell'}"></i>
          </div>
          <div class="space-y-0.5 min-w-0">
            <p class="font-bold text-slate-900 text-xs truncate">${item.title || ''}</p>
            <p class="text-[11px] text-slate-500 line-clamp-2">${item.message || ''}</p>
            <span class="text-[10px] text-slate-400">${item.time || 'Vừa xong'}</span>
          </div>
        </div>
      `).join('');
    }
  };

  window.toggleNotificationPopover = function() {
    window.NotificationCenter.toggle();
  };

  document.addEventListener('click', (e) => {
    const pop = document.getElementById('notification-popover');
    const btn = document.getElementById('btn-notification-toggle');
    if (pop && !pop.classList.contains('hidden')) {
      if (btn && !btn.contains(e.target) && !pop.contains(e.target)) {
        pop.classList.add('hidden');
      }
    }
  });



  /**
   * Render các dải sản phẩm (Shelves)
   */
  function renderShelves() {
    renderPromotionsShelf();
    renderFeaturedPhonesShelf('all');
    renderNewArrivalsShelf();
    renderBestSellersShelf();
    renderAccessoriesShelf();
    renderRecentlyViewedShelf();
  }

  function renderPromotionsShelf() {
    const container = document.getElementById('promotions-list');
    if (!container || !(window.CellphoneSData || window.StoreData)) return;

    const promos = (window.CellphoneSData || window.StoreData).promotions || [];
    const section = document.getElementById('shelf-promotions');
    if (promos.length === 0) {
      if (section) section.classList.add('hidden');
      return;
    }
    if (section) section.classList.remove('hidden');

    container.innerHTML = promos.map(km => {
      const phanTram = Number(km.phanTramGiam) || 0;
      const ngayKT = km.ngayKT ? String(km.ngayKT).substring(0, 10) : '';
      return `
        <div class="bg-white rounded-2xl border border-rose-200 p-4 shadow-sm flex items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-[#d70018] text-white font-mono font-black text-xs">${km.maKM}</span>
              <span class="text-xs font-black text-[#d70018]">GIẢM ${phanTram}%</span>
            </div>
            <h4 class="font-bold text-xs text-navy line-clamp-1">${km.tenKM}</h4>
            <p class="text-[10px] text-slate-400">Hiệu lực đến: ${ngayKT || 'Đang diễn ra'}</p>
          </div>
          <button type="button" onclick="window.applyPromoCodeFromShelf('${km.maKM}')" class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#d70018] font-bold text-xs whitespace-nowrap transition-colors border border-rose-200 cursor-pointer">
            Lưu mã
          </button>
        </div>
      `;
    }).join('');
  }

  window.applyPromoCodeFromShelf = function (code) {
    if (window.CellphoneSCart || window.Cart) {
      const res = (window.CellphoneSCart || window.Cart).applyPromoCode(code);
      if (res && res.success) {
        (window.CellphoneSCart || window.Cart).openDrawer();
      }
    }
  };

  function renderFeaturedPhonesShelf(brand = 'all', shouldScroll = false) {
    const container = document.getElementById('shelf-phones-items');
    if (!container || !(window.CellphoneSData || window.StoreData)) return;

    const items = (window.CellphoneSData || window.StoreData).getFeaturedPhones(brand);
    container.innerHTML = items.map(p => createProductCardHtml(p)).join('');

    // Cập nhật tab active trên dải sản phẩm
    const tabs = document.querySelectorAll('.tab-phone-brand');
    tabs.forEach(tab => {
      if (tab.dataset.brand === brand) {
        tab.className = 'tab-phone-brand px-3.5 py-1.5 rounded-full text-xs font-black bg-[#80ffbf] text-[#061a0f] shadow-sm transition-all cursor-pointer';
      } else {
        tab.className = 'tab-phone-brand px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-[#eafff5] hover:text-[#064e29] text-slate-700 transition-all cursor-pointer';
      }
    });

    // Cập nhật nút active trên dải chip danh mục ngang (Horizontal Chip Bar)
    const chipBtns = document.querySelectorAll('.chip-cat-btn');
    chipBtns.forEach(btn => {
      if (btn.dataset.brand === brand) {
        btn.classList.add('bg-[#1E3A8A]', 'text-white');
        btn.classList.remove('bg-white', 'text-slate-800', 'hover:bg-blue-50', 'border-slate-200');
      } else {
        btn.classList.remove('bg-[#1E3A8A]', 'text-white');
        btn.classList.add('bg-white', 'text-slate-800', 'hover:bg-blue-50', 'border-slate-200');
      }
    });

    // Cập nhật tiêu đề dải và nút xem thêm bộ lọc
    const titleTextEl = document.getElementById('shelf-phones-title-text');
    const viewAllBtn = document.getElementById('shelf-phones-view-all');
    if (titleTextEl) {
      if (brand === 'Apple') {
        titleTextEl.textContent = 'ĐIỆN THOẠI APPLE IPHONE CHÍNH HÃNG';
      } else if (brand === 'Samsung') {
        titleTextEl.textContent = 'ĐIỆN THOẠI SAMSUNG GALAXY AI';
      } else if (brand === 'Xiaomi') {
        titleTextEl.textContent = 'ĐIỆN THOẠI XIAOMI LEICA SIÊU PHẨM';
      } else {
        titleTextEl.textContent = 'ĐIỆN THOẠI NỔI BẬT';
      }
    }
    if (viewAllBtn) {
      if (brand !== 'all') {
        const brandCount = (window.CellphoneSData || window.StoreData).getProductsByBrand ? (window.CellphoneSData || window.StoreData).getProductsByBrand(brand).length : items.length;
        viewAllBtn.innerHTML = `Xem tất cả ${brand} (${brandCount}) <i class="fa-solid fa-arrow-right text-[10px] ml-1"></i>`;
        viewAllBtn.classList.remove('hidden');
        viewAllBtn.onclick = () => window.openSearchModal('', brand);
      } else {
        viewAllBtn.classList.add('hidden');
      }
    }

    // Cuộn mượt mà xuống Dải Điện Thoại Nổi Bật khi bấm từ menu
    if (shouldScroll) {
      const shelf = document.getElementById('shelf-phones');
      if (shelf) {
        const headerOffset = 70;
        const elemPos = shelf.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: elemPos, behavior: 'smooth' });

        // Hiệu ứng highlight trực quan khi chuyển dải
        shelf.classList.add('ring-4', 'ring-[#80ffbf]/50', 'transition-all', 'duration-500');
        setTimeout(() => {
          shelf.classList.remove('ring-4', 'ring-[#80ffbf]/50');
        }, 1200);
      }
    }
  }
  window.filterPhoneBrand = renderFeaturedPhonesShelf;

  function renderNewArrivalsShelf() {
    const container = document.getElementById('shelf-new-items');
    if (!container || !(window.CellphoneSData || window.StoreData)) return;
    const items = (window.CellphoneSData || window.StoreData).getNewArrivals();
    container.innerHTML = items.map(p => createProductCardHtml(p)).join('');
  }

  function renderBestSellersShelf() {
    const container = document.getElementById('shelf-bestseller-items');
    if (!container || !(window.CellphoneSData || window.StoreData)) return;
    const items = (window.CellphoneSData || window.StoreData).getBestSellers();
    container.innerHTML = items.map(p => createProductCardHtml(p)).join('');
  }

  function renderAccessoriesShelf() {
    const container = document.getElementById('shelf-accessories-items');
    if (!container || !(window.CellphoneSData || window.StoreData)) return;
    const items = (window.CellphoneSData || window.StoreData).getAccessories();
    container.innerHTML = items.map(p => createProductCardHtml(p)).join('');
  }

  function renderRecentlyViewedShelf() {
    const container = document.getElementById('shelf-recent-items');
    const section = document.getElementById('section-recently-viewed');
    if (!container || !(window.CellphoneSData || window.StoreData)) return;

    const items = (window.CellphoneSData || window.StoreData).getRecentlyViewed();
    if (items.length === 0) {
      if (section) section.classList.add('hidden');
    } else {
      if (section) section.classList.remove('hidden');
      container.innerHTML = items.map(p => createProductCardHtml(p)).join('');
    }
  }

  /**
   * Trích xuất thông số nổi bật dạng Spec Badges (Chip, Màn hình, Dung lượng...)
   */
  function extractProductSpecBadges(p) {
    if (Array.isArray(p.image_badges) && p.image_badges.length > 0) {
      return p.image_badges.slice(0, 3).map(b => {
        if (typeof b === 'object' && b.text) return b;
        return { icon: 'fa-microchip', text: String(b) };
      });
    }

    const badges = [];
    const name = (p.tenHang || '').toLowerCase();
    const specs = p.thongSo || {};

    if (specs['Màn hình']) badges.push({ icon: 'fa-mobile-screen', text: specs['Màn hình'] });
    if (specs['Vi xử lý'] || specs['Chip']) badges.push({ icon: 'fa-microchip', text: specs['Vi xử lý'] || specs['Chip'] });
    if (specs['Bộ nhớ trong'] || specs['ROM']) badges.push({ icon: 'fa-hard-drive', text: specs['Bộ nhớ trong'] || specs['ROM'] });
    if (specs['RAM']) badges.push({ icon: 'fa-memory', text: specs['RAM'] });

    if (badges.length === 0) {
      if (name.includes('iphone 18') || name.includes('iphone 17')) {
        badges.push({ icon: 'fa-mobile-screen', text: '6.9" Super Retina' });
        badges.push({ icon: 'fa-microchip', text: 'A19 Pro' });
        badges.push({ icon: 'fa-hard-drive', text: '256GB' });
      } else if (name.includes('iphone 16') || name.includes('iphone 15') || name.includes('iphone 14')) {
        badges.push({ icon: 'fa-mobile-screen', text: '6.7" Super Retina' });
        badges.push({ icon: 'fa-microchip', text: 'A18 Bionic' });
        badges.push({ icon: 'fa-hard-drive', text: '128GB' });
      } else if (name.includes('ipad') || name.includes('tab') || name.includes('lenovo')) {
        badges.push({ icon: 'fa-tablet-screen-button', text: '10.9 inch Retina' });
        badges.push({ icon: 'fa-microchip', text: 'A14 Bionic' });
        badges.push({ icon: 'fa-hard-drive', text: '64GB' });
      } else if (name.includes('s25') || name.includes('s24') || name.includes('galaxy')) {
        badges.push({ icon: 'fa-mobile-screen', text: '6.8" Dynamic AMOLED' });
        badges.push({ icon: 'fa-microchip', text: 'Snapdragon 8 Elite' });
        badges.push({ icon: 'fa-hard-drive', text: '256GB' });
      } else if (name.includes('laptop') || name.includes('macbook')) {
        badges.push({ icon: 'fa-laptop', text: '14 inch Retina' });
        badges.push({ icon: 'fa-microchip', text: 'Apple M3 / Core i5' });
        badges.push({ icon: 'fa-hard-drive', text: '512GB SSD' });
      }
    }

    return badges.slice(0, 3);
  }

  function formatCardMoney(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '0₫';
    return Number(amount).toLocaleString('vi-VN') + '₫';
  }

  /**
   * Tạo HTML thẻ sản phẩm chuẩn CellphoneS / Hoàng Hà Mobile mới
   */
  function createProductCardHtml(p, options = {}) {
    const isFlashSale = options.isFlashSale || p.isFlashSale;
    const donGia = Number(p.donGia) || 0;
    const giaGoc = Number(p.giaGoc) || (donGia > 0 ? Math.round(donGia * 1.15) : 0);
    const discountPercent = giaGoc > donGia 
      ? Math.round((1 - donGia / giaGoc) * 100) 
      : 0;

    const tonKho = p.tonKho !== undefined ? Number(p.tonKho) : 15;
    const installmentAmount = donGia > 0 ? Math.round(donGia / 6) : 0;
    const specBadges = extractProductSpecBadges(p);
    const promoDesc = p.moTaKhuyenMai || 'Home Credit - Trả góp 0%, duyệt hồ sơ nhanh chỉ 3 phút';

    return `
      <div class="product-card group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer" onclick="window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent('${p.maHang}')">
        
        <div>
          <!-- Icon ngôi sao / sparkle góc trên bên trái -->
          <div class="flex items-center justify-between mb-1">
            <span class="text-blue-500 font-black text-sm">✦</span>
          </div>

          <!-- Ảnh sản phẩm kèm Spec Badges nổi (Chip, Màn hình, Dung lượng...) -->
          <div class="relative w-full h-44 sm:h-48 my-1 flex items-center justify-center p-2 overflow-hidden">
            ${p.anhChinh ? `
              <img src="${p.anhChinh}" alt="${p.tenHang}" class="max-w-[160px] max-h-[160px] object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" onerror="this.onerror=null; this.src='images/banner/iphone-18-cat-082925094.png';">
            ` : `
              <div class="w-full h-full flex flex-col items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <i class="fa-solid fa-mobile-screen-button text-3xl mb-1 text-slate-300"></i>
                <span class="text-[10px] text-slate-400 font-medium">Chờ cập nhật ảnh</span>
              </div>
            `}

            <!-- Spec Badges nổi góc phải ảnh -->
            ${specBadges.length > 0 ? `
              <div class="absolute top-1 right-1 flex flex-col gap-1 items-end pointer-events-none z-10">
                ${specBadges.map(b => `
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-2xs text-[10px] font-bold text-slate-700">
                    <i class="fa-solid ${b.icon} text-blue-500 text-[9px]"></i>
                    <span>${b.text}</span>
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Tên sản phẩm 2 dòng -->
          <h3 class="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug min-h-[38px] transition-colors mt-2" title="${p.tenHang}">
            ${p.tenHang}
          </h3>

          <!-- Khối giá: Giá bán đỏ to, Badge giảm giá, Giá gốc gạch ngang, Trả góp 6T -->
          <div class="mt-2.5">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base sm:text-lg font-black text-[#E0052B] font-mono leading-none">
                ${formatCardMoney(donGia)}
              </span>
              ${discountPercent > 0 ? `
                <span class="px-1.5 py-0.5 rounded-md bg-red-50 text-[#E0052B] border border-red-200/80 text-[10.5px] font-bold leading-none">
                  -${discountPercent}%
                </span>
              ` : ''}
            </div>

            ${giaGoc > donGia ? `
              <div class="text-xs text-slate-400 line-through mt-1">
                ${formatCardMoney(giaGoc)}
              </div>
            ` : ''}

            <div class="text-xs font-semibold text-blue-600 mt-1">
              Hoặc ${formatCardMoney(installmentAmount)} x 6T
            </div>
          </div>

          <!-- 4 Bank badges 2x2: To rõ, viền & nền mang màu thương hiệu nổi bật -->
          <div class="grid grid-cols-2 gap-1.5 mt-2.5 w-full">
            <span class="h-7 sm:h-8 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs hover:border-purple-400 hover:bg-purple-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="TPBank Evo">
              <img src="images/brands/tpbank.png" alt="TPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-purple-700\'>TPBank</span>'" loading="lazy" />
            </span>
            <span class="h-7 sm:h-8 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs hover:border-emerald-400 hover:bg-emerald-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VPBank">
              <img src="images/brands/vpbank.png" alt="VPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-emerald-700\'>VPBank</span>'" loading="lazy" />
            </span>
            <span class="h-7 sm:h-8 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs hover:border-blue-400 hover:bg-blue-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VIB">
              <img src="images/brands/vib.png" alt="VIB" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-blue-700\'>VIB</span>'" loading="lazy" />
            </span>
            <span class="h-7 sm:h-8 bg-teal-50/70 border border-teal-200 rounded-xl shadow-2xs hover:border-teal-400 hover:bg-teal-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="Trả góp 0%">
              <img src="images/brands/icon-2_639047641516424460.png" alt="Trả góp 0%" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.src=\'images/brands/homecredit.png\'" loading="lazy" />
            </span>
          </div>

          <!-- Khung ưu đãi dịch vụ / tài chính: To rõ, tương phản cao, dễ nhìn -->
          <div class="mt-2 p-2 rounded-xl bg-gradient-to-r from-blue-50/60 to-slate-50 border border-blue-100/80 text-[11px] text-slate-700 font-semibold leading-snug line-clamp-2 flex items-start gap-1.5 shadow-2xs">
            <i class="fa-solid fa-gift text-rose-500 text-xs mt-0.5 flex-shrink-0"></i>
            <span class="flex-1">${promoDesc}</span>
          </div>
        </div>

        <!-- Hàng chân card: Trạng thái Sẵn hàng & Nút icon giỏ hàng mua nhanh -->
        <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <i class="fa-regular fa-circle-check text-emerald-500 text-sm"></i>
            <span>${tonKho > 0 ? 'Sẵn hàng' : 'Liên hệ'}</span>
          </div>
          <button type="button" onclick="window.quickAddToCart('${p.maHang}', event)" class="w-8 h-8 rounded-xl bg-blue-50 hover:bg-[#0057B7] text-[#0057B7] hover:text-white border border-blue-200 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95" title="Thêm vào giỏ hàng">
            <i class="fa-solid fa-cart-shopping text-xs"></i>
          </button>
        </div>

      </div>
    `;
  }

  window.quickAddToCart = function (maHang, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    let prod = null;
    if (window.CellphoneSData || window.StoreData) {
      prod = (window.CellphoneSData || window.StoreData).getProductById(maHang);
    }
    if (!prod && window.allProducts) {
      prod = window.allProducts.find(p => (p.maHang === maHang || p.id === maHang));
    }
    if (!prod) return;

    if (prod.tonKho !== undefined && Number(prod.tonKho) <= 0) {
      if (window.CellphoneSCart || window.Cart) {
        (window.CellphoneSCart || window.Cart).showToast('Sản phẩm hiện đang tạm hết hàng!', 'warning');
      } else {
        alert('Sản phẩm hiện đang tạm hết hàng!');
      }
      return;
    }

    const item = {
      maHang: prod.maHang || prod.id,
      tenHang: prod.tenHang,
      donGia: Number(prod.donGia) || 0,
      giaGoc: Number(prod.giaGoc) || (Number(prod.donGia) * 1.15),
      hinhAnh: prod.anhChinh || prod.image || 'images/banner/iphone-18-cat-082925094.png',
      soLuong: 1,
      mauSac: 'Mặc định',
      phienBan: 'Tiêu chuẩn'
    };

    if (window.CellphoneSCart || window.Cart) {
      (window.CellphoneSCart || window.Cart).addItem(item);
    } else {
      alert(`Đã thêm "${prod.tenHang}" vào giỏ hàng!`);
    }
  };

  window.quickBuy = function (maHang) {
    window.quickAddToCart(maHang);
    if (window.CellphoneSCheckout || window.Checkout) {
      (window.CellphoneSCheckout || window.Checkout).openCheckout();
    }
  };

  /**
   * Autocomplete Tìm Kiếm & Bộ lọc
   */
  function initSearchAutocomplete() {
    const input = document.getElementById('search-input');
    const dropdown = document.getElementById('search-autocomplete-dropdown');
    const clearBtn = document.getElementById('btn-clear-search');

    if (!input || !dropdown) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (clearBtn) {
        if (q) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }

      if (!q) {
        dropdown.classList.add('hidden');
        return;
      }

      const results = (window.CellphoneSData || window.StoreData) ? (window.CellphoneSData || window.StoreData).search(q).slice(0, 5) : [];
      if (results.length === 0) {
        dropdown.innerHTML = `
          <div class="p-4 text-center text-xs text-slate-500">
            Không tìm thấy sản phẩm khớp với "<strong>${q}</strong>".
            <div class="mt-2 text-[#0057B7] font-semibold cursor-pointer" onclick="window.quickSearchTag('iPhone')">Gợi ý: Tìm "iPhone", "Samsung"</div>
          </div>
        `;
      } else {
        dropdown.innerHTML = `
          <div class="p-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Gợi ý sản phẩm (${results.length})
          </div>
          <div class="divide-y divide-slate-100">
            ${results.map(p => `
              <div class="p-2.5 flex items-center gap-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors" onclick="window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent('${p.maHang}'); document.getElementById('search-autocomplete-dropdown').classList.add('hidden');">
                <div class="w-10 h-10 object-contain p-1 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                  ${p.anhChinh ? `
                    <img src="${p.anhChinh}" class="w-full h-full object-contain" alt="${p.tenHang}">
                  ` : `
                    <i class="fa-solid fa-mobile-screen-button text-slate-300 text-xs"></i>
                  `}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#0057B7] truncate transition-colors">${p.tenHang}</h4>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs sm:text-[13px] font-black text-[#E11B1E] font-mono">${(window.CellphoneSCart || window.Cart).formatMoney(p.donGia)}</span>
                    ${p.giaGoc > p.donGia ? `<span class="text-[10px] text-slate-400 line-through">${(window.CellphoneSCart || window.Cart).formatMoney(p.giaGoc)}</span>` : ''}
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
              </div>
            `).join('')}
          </div>
          <div class="p-2 border-t border-slate-100 text-center">
            <button type="button" onclick="window.openSearchModal('${q}')" class="text-xs font-bold text-[#0057B7] hover:text-[#004494]">
              Xem tất cả kết quả cho "${q}" &rarr;
            </button>
          </div>
        `;
      }
      dropdown.classList.remove('hidden');
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        dropdown.classList.add('hidden');
        window.openSearchModal(q);
      }
    });

    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.add('hidden');
        dropdown.classList.add('hidden');
        input.focus();
      });
    }
  }

  window.quickSearchTag = function (tag) {
    const input = document.getElementById('search-input');
    if (input) {
      input.value = tag;
      window.openSearchModal(tag);
    }
  };

  /**
   * Modal Kết quả tìm kiếm và bộ lọc (Phần A3)
   */
  window.openSearchModal = function (query = '', brand = '') {
    const modal = document.getElementById('search-results-modal');
    const input = document.getElementById('modal-search-input');
    const brandSelect = document.getElementById('filter-brand');
    if (input) input.value = query;
    if (brandSelect && brand) brandSelect.value = brand;

    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      applySearchFilters();
    }
  };

  window.closeSearchModal = function () {
    const modal = document.getElementById('search-results-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  window.applySearchFilters = function () {
    const query = (document.getElementById('modal-search-input')?.value || '').trim();
    const brand = document.getElementById('filter-brand')?.value || 'all';
    const priceRange = document.getElementById('filter-price')?.value || 'all';
    const inStock = document.getElementById('filter-instock')?.checked || false;
    const sortBy = document.getElementById('filter-sort')?.value || 'best_seller';

    if (!(window.CellphoneSData || window.StoreData)) return;

    const results = (window.CellphoneSData || window.StoreData).search(query, {
      brand: brand,
      priceRange: priceRange,
      inStockOnly: inStock,
      sortBy: sortBy
    });

    const container = document.getElementById('search-modal-results-grid');
    const countEl = document.getElementById('search-modal-count');

    if (countEl) countEl.textContent = results.length;

    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500">
          <i class="fa-solid fa-box-open text-4xl text-slate-300 mb-3 block"></i>
          <h4 class="font-bold text-sm text-navy mb-1">Không tìm thấy sản phẩm phù hợp</h4>
          <p class="text-xs text-slate-400">Hãy thử từ khóa khác hoặc bỏ bớt các bộ lọc đang chọn</p>
        </div>
      `;
    } else {
      container.innerHTML = results.map(p => createProductCardHtml(p)).join('');
    }
  };

  /**
   * Đếm ngược Khuyến Mãi (Phần A1)
   */
  function initCountdownTimers() {
    const countdownEl = document.getElementById('topbar-countdown');
    const flashCountdownEl = document.getElementById('flashsale-countdown');

    const targetDate = new Date('2026-10-31T23:59:59').getTime();

    function update() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        if (countdownEl) countdownEl.textContent = '00:00:00';
        if (flashCountdownEl) flashCountdownEl.textContent = '00:00:00';
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const str = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      if (countdownEl) countdownEl.textContent = str;
      if (flashCountdownEl) flashCountdownEl.textContent = str;
    }

    update();
    setInterval(update, 1000);
  }

  /**
   * Back-to-Top Button
   */
  function initScrollToTop() {
    const btn = document.getElementById('btn-back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Render Mega Menu từ API NhomHang và LoaiHang
   */
  function renderMegaMenu() {
    const container = document.getElementById('mega-menu-flyout');
    if (!container || !(window.CellphoneSData || window.StoreData)) return;

    const store = (window.CellphoneSData || window.StoreData);
    const nhomList = store.nhomHang || [];
    const loaiList = store.loaiHang || [];

    let html = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
    `;

    nhomList.forEach(nh => {
      const loaiOfNhom = loaiList.filter(l => {
        if (l.maNhom) return l.maNhom === nh.maNhom;
        return store.products.some(p => p.maNhom === nh.maNhom && p.maLoai === l.maLoai);
      });
      let icon = 'fa-mobile-screen';
      let color = 'text-[#0057B7]';
      if (nh.maNhom === 'NH02' || nh.maNhom === 'PHUKIEN') { icon = 'fa-plug'; color = 'text-amber-600'; }
      else if (nh.maNhom === 'NH03' || nh.maNhom === 'AMTHANH') { icon = 'fa-headphones'; color = 'text-blue-600'; }
      else if (nh.maNhom === 'NH04' || nh.maNhom === 'TABLET') { icon = 'fa-tablet-screen-button'; color = 'text-indigo-600'; }
      else if (nh.maNhom === 'NH05' || nh.maNhom === 'LAPTOP') { icon = 'fa-laptop'; color = 'text-purple-600'; }

      html += `
        <div class="space-y-3">
          <div class="font-bold text-navy text-sm flex items-center gap-2 ${color} border-b border-slate-100 pb-2">
            <i class="fa-solid ${icon}"></i>
            <span>${nh.tenNhom}</span>
          </div>
          <ul class="space-y-2 text-slate-600">
            ${loaiOfNhom.map(l => `
              <li>
                <button type="button" onclick="window.filterByLoaiHang('${l.tenLoai}'); window.toggleMegaMenu();" class="hover:text-[#0057B7] font-semibold text-left">
                  ${l.tenLoai}
                </button>
              </li>
            `).join('')}
            <li>
              <button type="button" onclick="window.filterByNhomHang('${nh.maNhom}'); window.toggleMegaMenu();" class="hover:text-[#0057B7] text-[#0057B7] font-bold">
                Xem tất cả ${nh.tenNhom} &rarr;
              </button>
            </li>
          </ul>
        </div>
      `;
    });

    // Cột Tra cứu & Hỗ trợ
    html += `
      <div class="space-y-3">
        <div class="font-bold text-navy text-sm flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-2">
          <i class="fa-solid fa-circle-question"></i>
          <span>Tra Cứu & Hỗ Trợ</span>
        </div>
        <ul class="space-y-2 text-slate-600">
          <li>
            <button type="button" onclick="window.CellphoneSLookup.openModal('order'); window.toggleMegaMenu();" class="hover:text-blue-600 font-semibold text-left">
              <i class="fa-solid fa-truck mr-1 text-slate-400"></i> Tra cứu đơn hàng online
            </button>
          </li>
          <li>
            <button type="button" onclick="window.CellphoneSLookup.openModal('warranty'); window.toggleMegaMenu();" class="hover:text-blue-600 font-semibold text-left">
              <i class="fa-solid fa-shield-halved mr-1 text-slate-400"></i> Tra cứu bảo hành IMEI
            </button>
          </li>
        </ul>
      </div>

      <!-- Cột S-Member -->
      <div class="space-y-3 bg-gradient-to-br from-[#F0FDF4] to-indigo-50 p-4 rounded-2xl border border-[#DCFCE7]">
        <div class="font-extrabold text-[#004494] text-xs uppercase flex items-center gap-1.5">
          <i class="fa-solid fa-award text-amber-500"></i>
          <span>Thành Viên S-Member</span>
        </div>
        <p class="text-[11px] text-slate-600">Tích điểm đổi quà, tra cứu lịch sử mua sắm và bảo hành thiết bị.</p>
        <button type="button" onclick="window.CellphoneSCustomerPortal.openLoginModal(); window.toggleMegaMenu();" class="w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs text-center shadow-md border border-slate-200">
          Đăng Nhập S-Member
        </button>
      </div>
    `;

    html += `</div>`;
    container.innerHTML = html;
  }

  window.filterByLoaiHang = function (tenLoai) {
    window.openSearchModal(tenLoai, tenLoai);
  };

  window.filterByNhomHang = function (maNhom) {
    if (maNhom === 'NH01' || maNhom === 'DIENTHOAI') {
      const shelf = document.getElementById('shelf-phones');
      if (shelf) shelf.scrollIntoView({ behavior: 'smooth' });
    } else {
      const shelf = document.getElementById('shelf-accessories');
      if (shelf) shelf.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /**
   * Mega Menu Toggle (Mobile & Desktop)
   */
  /**
   * =========================================================================
   * KHỐI TRẠM TIẾP SỨC ONLINE - GIÁ TỐT MỖI NGÀY (Chuẩn mẫu Hoàng Hà Mobile)
   * =========================================================================
   */
  const dealCategoriesData = {
    amthanh: [
      {
        id: 'DEAL-AT-01',
        name: 'Loa Bluetooth hiệu Alpha Works Classic V21',
        price: 2690000,
        oldPrice: 2990000,
        discount: 10,
        image: 'images/products/alpha-works-classic.png'
      },
      {
        id: 'DEAL-AT-02',
        name: 'Tai nghe AirPods Pro 3 (Chính hãng Apple)',
        price: 5790000,
        oldPrice: 6790000,
        discount: 15,
        image: 'images/products/airpods-pro-3.png'
      },
      {
        id: 'DEAL-AT-03',
        name: 'Tai nghe Sennheiser ACCENTUM Wireless',
        price: 1990000,
        oldPrice: 2390000,
        discount: 17,
        image: 'images/products/sennheiser-accentum.png'
      },
      {
        id: 'DEAL-AT-04',
        name: 'Loa di động không dây Sony ULT FIELD 1',
        price: 3290000,
        oldPrice: 3590000,
        discount: 8,
        image: 'images/products/sony-ult-field-1.png'
      },
      {
        id: 'DEAL-AT-05',
        name: 'Tai nghe chống ồn Sony WH-1000XM5 Hi-Res',
        price: 9790000,
        oldPrice: 11990000,
        discount: 18,
        image: 'images/products/airpods-pro-3.png'
      },
      {
        id: 'DEAL-AT-06',
        name: 'Loa Bluetooth JBL Charge 5 Siêu Trầm Bass',
        price: 3490000,
        oldPrice: 3990000,
        discount: 12,
        image: 'images/deal-tabs/deal-tab-audio.jpg'
      },
      {
        id: 'DEAL-AT-07',
        name: 'Tai nghe Marshall Major IV Bluetooth Cổ Điển',
        price: 3190000,
        oldPrice: 3690000,
        discount: 14,
        image: 'images/deal-tabs/deal-tab-audio.jpg'
      }
    ],
    dienthoai: [
      {
        id: 'DEAL-DT-01',
        name: 'iPhone 16 Pro 256GB - Chính Hãng VN/A',
        price: 28490000,
        oldPrice: 31990000,
        discount: 11,
        image: 'images/products/mh123.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-02',
        name: 'Samsung Galaxy S26 Ultra 12GB/256GB',
        price: 30490000,
        oldPrice: 32990000,
        discount: 8,
        image: 'images/products/mh109.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-03',
        name: 'Gaming REDMAGIC 10 PRO 16GB/512GB Quốc Tế',
        price: 17990000,
        oldPrice: 19990000,
        discount: 10,
        image: 'images/products/mh189.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-04',
        name: 'Xiaomi Redmi Note 14 Pro+ 5G 8GB/256GB',
        price: 9490000,
        oldPrice: 10990000,
        discount: 14,
        image: 'images/products/mh178.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-05',
        name: 'Xiaomi Redmi Note 14 8GB/128GB',
        price: 4990000,
        oldPrice: 5790000,
        discount: 14,
        image: 'images/products/mh161.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-06',
        name: 'TECNO POVA CURVE 2 5G 8GB/128GB',
        price: 5490000,
        oldPrice: 6490000,
        discount: 15,
        image: 'images/products/mh159.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-07',
        name: 'OPPO Find X10 Pro Max 16GB/512GB',
        price: 34990000,
        oldPrice: 37990000,
        discount: 8,
        image: 'images/products/mh129.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-08',
        name: 'REALME C75X 6GB/128GB',
        price: 4190000,
        oldPrice: 4690000,
        discount: 11,
        image: 'images/products/mh174.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-09',
        name: 'Tecno Camon 40 Pro 8GB/256GB',
        price: 5990000,
        oldPrice: 6990000,
        discount: 14,
        image: 'images/products/mh172.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-DT-10',
        name: 'HONOR 400 PRO 5G 12GB/512GB',
        price: 15990000,
        oldPrice: 17990000,
        discount: 11,
        image: 'images/products/mh152.png',
        status: 'Sẵn hàng'
      }
    ],
    tablet: [
      {
        id: 'MH163',
        name: 'Samsung Galaxy Tab S12 Ultra Wi-Fi 12GB/256GB',
        brand: 'Samsung',
        price: 34990000,
        oldPrice: 39990000,
        discount: 13,
        image: 'https://i.hoanghamobile.vn/Uploads/2026/10/02/galaxy-tab-s12-ultra-2-161156363.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'MH164',
        name: 'Samsung Galaxy Tab S12 Plus 5G 12GB/256GB',
        brand: 'Samsung',
        price: 34490000,
        oldPrice: 37990000,
        discount: 9,
        image: 'https://i.hoanghamobile.vn/Uploads/2026/10/02/galaxy-tab-s12-plus-1-161156166.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'MH165',
        name: 'Samsung Galaxy Tab S10 FE Wifi 8GB/128GB',
        brand: 'Samsung',
        price: 11190000,
        oldPrice: 13690000,
        discount: 18,
        image: 'https://i.hoanghamobile.vn/Uploads/2026/10/15/s10-fe-3-134808082.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'MH166',
        name: 'Máy tính bảng Samsung Galaxy Tab A11 Wi-Fi 4GB/64GB',
        brand: 'Samsung',
        price: 3550000,
        oldPrice: 4390000,
        discount: 19,
        image: 'https://i.hoanghamobile.vn/Uploads/2025/12/24/tab-a11-silver.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'MH167',
        name: 'Máy tính bảng Lenovo Tab ZAEH0147VN',
        brand: 'Lenovo',
        price: 3790000,
        oldPrice: 4190000,
        discount: 10,
        image: 'https://i.hoanghamobile.vn/Uploads/2024/03/12/lenovo-tab-m11-zadb0134vn-1.png',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-TB-01',
        name: 'iPad Air M2 11 inch Wi-Fi 128GB VN/A Siêu Mỏng',
        brand: 'Apple',
        price: 15890000,
        oldPrice: 16990000,
        discount: 6,
        image: 'images/products/ipad-air-m2.webp',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-TB-02',
        name: 'iPad Pro M4 11 inch Ultra Retina XDR 256GB',
        brand: 'Apple',
        price: 27990000,
        oldPrice: 29990000,
        discount: 7,
        image: 'images/products/ipad-air-m2.webp',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-TB-03',
        name: 'iPad Gen 10 10.9 inch Wi-Fi 64GB Đủ Màu',
        brand: 'Apple',
        price: 8990000,
        oldPrice: 9990000,
        discount: 10,
        image: 'images/deal-tabs/deal-tab-tablet.jpg',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-TB-04',
        name: 'Samsung Galaxy Tab S9 FE Wi-Fi 128GB Kèm Bút S-Pen',
        brand: 'Samsung',
        price: 8490000,
        oldPrice: 9990000,
        discount: 15,
        image: 'images/deal-tabs/deal-tab-tablet.jpg',
        status: 'Sẵn hàng'
      },
      {
        id: 'DEAL-TB-05',
        name: 'Xiaomi Pad 6 8GB/256GB Màn Hình 144Hz 2.8K',
        price: 7290000,
        oldPrice: 8490000,
        discount: 14,
        image: 'images/deal-tabs/deal-tab-tablet.jpg'
      },
      {
        id: 'DEAL-TB-06',
        name: 'Bút cảm ứng Apple Pencil Pro Dành Cho iPad M4/M2',
        price: 3290000,
        oldPrice: 3490000,
        discount: 6,
        image: 'images/deal-tabs/deal-tab-tablet.jpg'
      }
    ],
    dongho: [
      {
        id: 'DEAL-DH-01',
        name: 'Apple Watch Series 10 Nhôm 42mm GPS Dây Thể Thao',
        price: 9990000,
        oldPrice: 10990000,
        discount: 9,
        image: 'images/deal-tabs/deal-tab-watch.jpg'
      },
      {
        id: 'DEAL-DH-02',
        name: 'Apple Watch Ultra 2 Titanium 49mm GPS + Cellular',
        price: 19990000,
        oldPrice: 21990000,
        discount: 9,
        image: 'images/deal-tabs/deal-tab-watch.jpg'
      },
      {
        id: 'DEAL-DH-03',
        name: 'Samsung Galaxy Watch7 40mm Bluetooth Galaxy AI',
        price: 5490000,
        oldPrice: 6490000,
        discount: 15,
        image: 'images/deal-tabs/deal-tab-watch.jpg'
      },
      {
        id: 'DEAL-DH-04',
        name: 'Huawei Watch GT 5 Pro Dây Titanium Sang Trọng',
        price: 7990000,
        oldPrice: 8990000,
        discount: 11,
        image: 'images/deal-tabs/deal-tab-watch.jpg'
      },
      {
        id: 'DEAL-DH-05',
        name: 'Xiaomi Redmi Watch 4 Màn AMOLED Pin 20 Ngày',
        price: 2190000,
        oldPrice: 2690000,
        discount: 18,
        image: 'images/deal-tabs/deal-tab-watch.jpg'
      },
      {
        id: 'DEAL-DH-06',
        name: 'Đồng hồ thể thao Garmin Forerunner 165 Music',
        price: 6990000,
        oldPrice: 7990000,
        discount: 12,
        image: 'images/deal-tabs/deal-tab-watch.jpg'
      }
    ],
    phukien: [
      {
        id: 'DEAL-PK-01',
        name: 'Củ sạc nhanh Apple 20W Type-C Chính Hãng VN/A',
        price: 490000,
        oldPrice: 590000,
        discount: 17,
        image: 'images/deal-tabs/deal-tab-accessory.jpg'
      },
      {
        id: 'DEAL-PK-02',
        name: 'Cáp sạc C to C Apple Woven 1m Siêu Bền Dù',
        price: 390000,
        oldPrice: 550000,
        discount: 29,
        image: 'images/deal-tabs/deal-tab-accessory.jpg'
      },
      {
        id: 'DEAL-PK-03',
        name: 'Pin dự phòng MagSafe 10000mAh Không Dây Hút Nam Châm',
        price: 690000,
        oldPrice: 890000,
        discount: 22,
        image: 'images/deal-tabs/deal-tab-accessory.jpg'
      },
      {
        id: 'DEAL-PK-04',
        name: 'Ốp lưng iPhone 16 Pro Max MagSafe Trong Suốt Chống Ố',
        price: 290000,
        oldPrice: 450000,
        discount: 35,
        image: 'images/deal-tabs/deal-tab-accessory.jpg'
      },
      {
        id: 'DEAL-PK-05',
        name: 'Củ sạc Anker 30W GaN Nano II Nhỏ Gọn Sạc Nhanh',
        price: 380000,
        oldPrice: 450000,
        discount: 15,
        image: 'images/deal-tabs/deal-tab-accessory.jpg'
      },
      {
        id: 'DEAL-PK-06',
        name: 'Kính cường lực KingKong Chống Nhìn Trộm Cao Cấp',
        price: 150000,
        oldPrice: 220000,
        discount: 32,
        image: 'images/deal-tabs/deal-tab-accessory.jpg'
      }
    ],
    laptop: [
      {
        id: 'DEAL-LT-01',
        name: 'MacBook Air M3 13 inch 16GB/256GB Chính Hãng Apple',
        price: 26990000,
        oldPrice: 28990000,
        discount: 7,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-02',
        name: 'MacBook Pro M3 Pro 14 inch 18GB/512GB Space Black',
        price: 47990000,
        oldPrice: 49990000,
        discount: 4,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-03',
        name: 'Laptop ASUS Zenbook 14 OLED Intel Core Ultra 7 Mới',
        price: 28490000,
        oldPrice: 31990000,
        discount: 11,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-04',
        name: 'Màn hình Gaming LG UltraGear 27 inch 165Hz IPS 1ms',
        price: 4990000,
        oldPrice: 6290000,
        discount: 21,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-05',
        name: 'Màn hình Dell UltraSharp U2724D 27 inch 2K IPS Black',
        price: 9490000,
        oldPrice: 10990000,
        discount: 14,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-06',
        name: 'Laptop Dell Inspiron 15 3520 i5 1235U / 16GB / 512GB',
        price: 13990000,
        oldPrice: 15490000,
        discount: 10,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-07',
        name: 'Laptop Lenovo ThinkPad E14 Gen 5 Ryzen 5 7530U',
        price: 15490000,
        oldPrice: 17290000,
        discount: 10,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-08',
        name: 'Laptop HP Pavilion 15 Core i5 1335U / 16GB / 512GB',
        price: 16890000,
        oldPrice: 18990000,
        discount: 11,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-09',
        name: 'Màn hình ASUS ProArt PA278CV 27 inch 2K IPS Chuẩn Màu',
        price: 8690000,
        oldPrice: 9990000,
        discount: 13,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      },
      {
        id: 'DEAL-LT-10',
        name: 'Laptop Gaming Acer Nitro 5 Tiger Core i5 RTX 3050',
        price: 18990000,
        oldPrice: 21990000,
        discount: 14,
        image: 'images/deal-tabs/deal-tab-laptop.jpg'
      }
    ],
    pc: [
      {
        id: 'MH604',
        name: 'PC MSI PRO DP180 I5 (9S6-B0A741-1482)',
        price: 21990000,
        oldPrice: 24990000,
        discount: 12,
        brand: 'MSI',
        image: 'https://i.hoanghamobile.vn/Uploads/2026/08/10/msi-pro-dp180-i5-9s6-b0a741-1482-1-111909999.png'
      },
      {
        id: 'MH603',
        name: 'PC Mini MSI Cubi NUC AI+ 2MG-019BVN (936-B20611-019)',
        price: 21000000,
        oldPrice: 23500000,
        discount: 11,
        brand: 'MSI',
        image: 'https://i.hoanghamobile.vn/Uploads/2026/08/10/2mg-019bvn-5-100337539.png'
      },
      {
        id: 'MH605',
        name: 'Mac Mini M4 2024 16GB/512GB',
        price: 25490000,
        oldPrice: 27990000,
        discount: 9,
        brand: 'Apple',
        image: 'https://i.hoanghamobile.vn/Uploads/2024/11/04/mac-mini-m4.png'
      },
      {
        id: 'MH606',
        name: 'PC GAMING MSI MAG Infinite E1 AI Gaming 14-238VN 9S6-B91111-238',
        price: 28990000,
        oldPrice: 32990000,
        discount: 12,
        brand: 'MSI',
        image: 'https://i.hoanghamobile.vn/Uploads/2026/08/08/ninite-e1-3-112032182.png'
      },
      {
        id: 'MH607',
        name: 'PC Mini MSI Cubi NUC AI 1UMG 936-B20911-062',
        price: 17990000,
        oldPrice: 19990000,
        discount: 10,
        brand: 'MSI',
        image: 'https://i.hoanghamobile.vn/Uploads/2026/08/08/msi-cubi-nuc-ai-1umg-936-b20911-062-5-112302464.png'
      }
    ]
  };

  let currentDealCategory = 'dienthoai';
  let currentDealIndex = 0;

  async function loadDealProductsFromJson() {
    try {
      let res = await fetch('data/products-meta.json');
      if (!res.ok) res = await fetch('products-meta.json');
      if (!res.ok) return;
      const metaMap = await res.json();
      const allItems = Object.values(metaMap || {});
      if (!allItems.length) return;

      const mapCat = {
        dienthoai: allItems.filter(p => p.maNhom === 'DIENTHOAI'),
        tablet: allItems.filter(p => p.maNhom === 'TABLET'),
        amthanh: allItems.filter(p => p.maNhom === 'AMTHANH'),
        dongho: allItems.filter(p => p.maNhom === 'DONGHO'),
        phukien: allItems.filter(p => p.maNhom === 'PHUKIEN'),
        laptop: allItems.filter(p => p.maNhom === 'LAPTOP' || (p.tenHang || '').toLowerCase().includes('laptop') || (p.tenHang || '').toLowerCase().includes('macbook')),
        pc: allItems.filter(p => p.maNhom === 'PC' || (p.tenHang || '').toLowerCase().includes('pc ') || (p.tenHang || '').toLowerCase().includes('mac mini') || (p.tenHang || '').toLowerCase().includes('imac')),
        chuot_banphim: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return n.includes('bàn phím') || n.includes('chuột') || n.includes('keyboard') || n.includes('mouse');
        }),
        thietbi_mang: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          const l = (p.maLoai || '').toLowerCase();
          return n.includes('wifi') || n.includes('router') || n.includes('bộ phát') || n.includes('mạng') || l.includes('mang');
        }),
        loa: allItems.filter(p => (p.tenHang || '').toLowerCase().includes('loa ')),
        tainghe: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return n.includes('tai nghe') || n.includes('airpods') || n.includes('earbuds') || n.includes('headphone');
        }),
        dongho: allItems.filter(p => p.maNhom === 'DONGHO' || (p.tenHang || '').toLowerCase().includes('đồng hồ') || (p.tenHang || '').toLowerCase().includes('watch') || (p.tenHang || '').toLowerCase().includes('band')),
        camera: allItems.filter(p => (p.tenHang || '').toLowerCase().includes('camera') || (p.tenHang || '').toLowerCase().includes('webcam')),
        tivi: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return p.maLoai === 'TIVI' || n.includes('tivi') || n.includes('tv ');
        }),
        tulanh: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return p.maLoai === 'TULANH' || n.includes('tủ lạnh');
        }),
        dieuhoa: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return p.maLoai === 'DIEUHOA' || n.includes('điều hòa') || n.includes('điều hoà');
        }),
        maygiat: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return p.maLoai === 'MAYGIAT' || n.includes('máy giặt');
        }),
        mayloc_khongkhi: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return n.includes('lọc không khí') || n.includes('lõi lọc');
        }),
        may_hut_am: allItems.filter(p => {
          const n = (p.tenHang || '').toLowerCase();
          return n.includes('hút ẩm');
        })
      };

      const toDealItem = (p) => {
        const price = Number(p.donGia) || 0;
        const oldPrice = p.giaGoc ? Number(p.giaGoc) : (price > 0 ? Math.round(price * 1.08) : null);
        const discount = (oldPrice && oldPrice > price) ? Math.round((1 - price / oldPrice) * 100) : null;

        let img = p.anhChinh;
        if (!img || img.includes('reload')) {
          if ((p.tenHang || '').toLowerCase().includes('macbook') || (p.tenHang || '').toLowerCase().includes('mac mini') || (p.tenHang || '').toLowerCase().includes('imac')) {
            img = 'https://i.hoanghamobile.vn/Uploads/2026/10/28/macbook-pro-14-inch-m6-space-black-pdp-image-position-1-vi-vn-145528508.png';
          } else if ((p.maNhom || '').toLowerCase() === 'laptop' || (p.maNhom || '').toLowerCase() === 'pc') {
            img = 'images/deal-tabs/deal-tab-laptop.png';
          } else {
            img = 'images/deal-tabs/deal-tab-phone.png';
          }
        }

        return {
          id: p.maHang,
          name: p.tenHang,
          brand: p.nhanHieu || '',
          price: price,
          oldPrice: oldPrice,
          discount: discount,
          image: img,
          status: 'Sẵn hàng',
          rawProduct: p
        };
      };

      // Cập nhật đầy đủ các tab ngành hàng từ file JSON mới nhất
      ['dienthoai', 'tablet', 'amthanh', 'dongho', 'phukien', 'laptop', 'pc', 'chuot_banphim', 'thietbi_mang', 'loa', 'tainghe', 'camera', 'tivi', 'tulanh', 'dieuhoa', 'maygiat', 'mayloc_khongkhi', 'may_hut_am'].forEach(cat => {
        if (mapCat[cat] && mapCat[cat].length > 0) {
          let list = mapCat[cat].map(toDealItem);
          if (cat === 'tablet') {
            // Đưa các model hot trong ảnh mẫu lên đầu danh sách: Tab S12 Ultra, Tab S12 Plus, Tab S10 FE, Tab A11, Lenovo Tab
            const priorityIds = ['MH163', 'MH164', 'MH165', 'MH166', 'MH167', 'MH160'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'laptop') {
            // Đưa các model laptop hot trong ảnh mẫu lên đầu danh sách
            const priorityIds = ['MH289', 'MH290', 'MH291', 'MH292', 'MH293', 'MH294', 'MH295', 'MH296', 'MH297'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'pc') {
            const priorityIds = ['MH604', 'MH603', 'MH605', 'MH606', 'MH607', 'MH608', 'MH609', 'MH610', 'MH611', 'MH627'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'chuot_banphim') {
            const priorityIds = ['MH712', 'MH711', 'MH736', 'MH690', 'MH689', 'MH713', 'MH714', 'MH737', 'MH691', 'MH692'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'loa') {
            const priorityIds = ['MH1168', 'MH1171', 'MH1173', 'MH1175', 'MH1177', 'MH1179', 'MH1181', 'MH1183', 'MH1185', 'MH1187'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'tainghe') {
            const priorityIds = ['MH1169', 'MH1170', 'MH1172', 'MH1174', 'MH1176', 'MH1178', 'MH1180', 'MH1182'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'dongho') {
            const priorityIds = ['MH889', 'MH890', 'MH891', 'MH892', 'MH893', 'MH894', 'MH895', 'MH896', 'MH897', 'MH898'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'camera') {
            const priorityIds = ['MH2461', 'MH2518', 'MH2460', 'MH2459', 'MH2523', 'MH2524', 'MH2611'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'tivi') {
            const priorityIds = ['MH1681', 'MH1682', 'MH1683', 'MH1684', 'MH1685'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'dieuhoa') {
            const priorityIds = ['MH2078', 'MH2077', 'MH2080', 'MH2079', 'MH2043'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          if (cat === 'mayloc_khongkhi') {
            const priorityIds = ['MH1694', 'MH1696', 'MH1697', 'MH1699', 'MH1701', 'MH1702', 'MH1703', 'MH1704', 'MH1706', 'MH1707'];
            list.sort((a, b) => {
              const aIdx = priorityIds.indexOf(a.id);
              const bIdx = priorityIds.indexOf(b.id);
              if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
              if (aIdx !== -1) return -1;
              if (bIdx !== -1) return 1;
              return 0;
            });
          }
          dealCategoriesData[cat] = list;
        }
      });

      // Render lại giao diện sau khi nạp xong dữ liệu đầy đủ
      renderDealProducts();
      renderDualCategoryBrandPills(currentDualCategory);
      renderDualCategoryProducts();
      renderLaptopPcBrandPills(currentLaptopPcCategory);
      renderLaptopPcProducts();
      renderMouseBrandPills(currentMouseCategory);
      renderMouseProducts();
      renderAudioBrandPills(currentAudioCategory);
      renderAudioProducts();
      renderWatchBrandPills(currentWatchCategory);
      renderWatchProducts();
      renderTiviBrandPills(currentTiviCategory);
      renderTiviProducts();
      renderAirBrandPills(currentAirCategory);
      renderAirProducts();
      renderPurifierBrandPills(currentPurifierCategory);
      renderPurifierProducts();
    } catch (err) {
      console.warn('Load products-meta.json error:', err);
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function initTramTiepSucSection() {
    const track = document.getElementById('deal-products-track');
    if (!track) return;
    renderDealProducts();
    loadDealProductsFromJson();
    window.addEventListener('resize', debounce(() => {
      applyDealSliderPosition();
    }, 150));
  }

  function getCardsPerView() {
    const w = window.innerWidth;
    if (w >= 1024) return 5;
    if (w >= 640) return 3;
    return 2;
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '';
    return Number(amount).toLocaleString('vi-VN') + '₫';
  }

  function renderDealProducts() {
    const track = document.getElementById('deal-products-track');
    if (!track) return;

    const list = dealCategoriesData[currentDealCategory] || [];
    track.innerHTML = list.map(item => `
      <div class="w-1/2 sm:w-1/3 lg:w-1/5 flex-shrink-0 px-2.5 sm:px-3.5 py-2 border-r border-slate-100 last:border-r-0">
        <div class="deal-product-item h-full flex flex-col justify-between group/card select-none cursor-pointer" onclick="window.onDealProductClick('${item.id}')">
          <!-- Ảnh Sản Phẩm (Nền trắng tinh, kích thước to rõ nét) -->
          <div class="relative w-full h-44 sm:h-52 lg:h-56 mb-2 flex items-center justify-center p-0.5 overflow-hidden">
            <img src="${item.image}" alt="${item.name}" class="h-full w-full object-contain block mx-auto transition-transform duration-300 transform scale-105 group-hover/card:scale-115" loading="lazy" onerror="this.onerror=null; this.src='images/deal-tabs/deal-tab-phone.png';" />
          </div>

          <!-- Tiêu Đề Sản Phẩm -->
          <h4 class="text-xs sm:text-[13px] font-semibold text-slate-800 line-clamp-2 min-h-[38px] leading-snug hover:text-[#0057B7] transition-colors mb-2" title="${item.name}">
            ${item.name}
          </h4>

          <!-- Giá & Giảm Giá -->
          <div class="mb-1.5">
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-sm sm:text-base font-bold text-[#E11B1E]">${formatCurrency(item.price)}</span>
              ${item.discount ? `<span class="text-[10px] font-bold text-[#E11B1E] bg-rose-50 px-1 py-0.5 rounded border border-rose-100">-${item.discount}%</span>` : ''}
            </div>
            ${item.oldPrice ? `<div class="text-[11px] text-slate-400 line-through mt-0.5">${formatCurrency(item.oldPrice)}</div>` : '<div class="h-[18px]"></div>'}
          </div>

          <!-- Dải logo ngân hàng đối tác trả góp (Lưới 2x2 to rõ có màu nổi bật) -->
          <div class="grid grid-cols-2 gap-1.5 mb-2 w-full">
            <span class="h-7 sm:h-7.5 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs flex items-center justify-center p-1 w-full" title="TPBank">
              <img src="images/brands/tpbank.png" alt="TPBank" class="h-4 w-auto object-contain max-w-[85%] max-h-full" loading="lazy">
            </span>
            <span class="h-7 sm:h-7.5 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs flex items-center justify-center p-1 w-full" title="VPBank">
              <img src="images/brands/vpbank.png" alt="VPBank" class="h-4 w-auto object-contain max-w-[85%] max-h-full" loading="lazy">
            </span>
            <span class="h-7 sm:h-7.5 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs flex items-center justify-center p-1 w-full" title="VIB">
              <img src="images/brands/vib.png" alt="VIB" class="h-4 w-auto object-contain max-w-[85%] max-h-full" loading="lazy">
            </span>
            <span class="h-7 sm:h-7.5 bg-teal-50/70 border border-teal-200 rounded-xl shadow-2xs flex items-center justify-center p-1 w-full" title="Trả góp 0%">
              <img src="images/brands/icon-2_639047641516424460.png" alt="Trả góp 0%" class="h-4 w-auto object-contain max-w-[85%] max-h-full" onerror="this.src='images/brands/homecredit.png'" loading="lazy">
            </span>
          </div>

          <!-- Footer: Sẵn hàng + Nút thêm giỏ hàng màu xanh dương thương hiệu -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div class="flex items-center gap-1 text-[11px] text-emerald-600 font-normal">
              <i class="fa-regular fa-circle-check text-xs"></i>
              <span>Sẵn hàng</span>
            </div>
            <button type="button" onclick="window.addDealToCart('${item.id}', event)" class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 hover:bg-[#0057B7] text-[#0057B7] hover:text-white border border-blue-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs" title="Thêm vào giỏ hàng">
              <i class="fa-solid fa-cart-shopping text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    applyDealSliderPosition();
  }

  function applyDealSliderPosition() {
    const track = document.getElementById('deal-products-track');
    if (!track) return;
    const cardsPerView = getCardsPerView();
    const list = dealCategoriesData[currentDealCategory] || [];
    const maxIndex = Math.max(0, list.length - cardsPerView);
    if (currentDealIndex > maxIndex) currentDealIndex = maxIndex;
    if (currentDealIndex < 0) currentDealIndex = 0;

    const colWidthPercent = 100 / cardsPerView;
    track.style.transform = `translateX(-${currentDealIndex * colWidthPercent}%)`;
  }

  window.switchDealCategory = function (cat) {
    if (!dealCategoriesData[cat]) return;
    currentDealCategory = cat;
    currentDealIndex = 0;

    // Cập nhật tab active
    const tabs = document.querySelectorAll('.deal-tab-btn');
    tabs.forEach(btn => {
      if (btn.dataset.dealCat === cat) {
        btn.classList.add('active-deal-tab');
      } else {
        btn.classList.remove('active-deal-tab');
      }
    });

    renderDealProducts();
  };

  window.nextDealProduct = function () {
    const cardsPerView = getCardsPerView();
    const list = dealCategoriesData[currentDealCategory] || [];
    const maxIndex = Math.max(0, list.length - cardsPerView);
    if (currentDealIndex < maxIndex) {
      currentDealIndex++;
    } else {
      currentDealIndex = 0;
    }
    applyDealSliderPosition();
  };

  window.prevDealProduct = function () {
    const cardsPerView = getCardsPerView();
    const list = dealCategoriesData[currentDealCategory] || [];
    const maxIndex = Math.max(0, list.length - cardsPerView);
    if (currentDealIndex > 0) {
      currentDealIndex--;
    } else {
      currentDealIndex = maxIndex;
    }
    applyDealSliderPosition();
  };

  window.addDealToCart = function (id, event) {
    if (event) event.stopPropagation();
    const list = dealCategoriesData[currentDealCategory] || [];
    const item = list.find(p => p.id === id);
    if (!item) return;

    if (window.CellphoneSCart || window.Cart) {
      (window.CellphoneSCart || window.Cart).addItem({
        maHang: item.id,
        tenHang: item.name,
        donGia: item.price,
        giaGoc: item.oldPrice || item.price,
        anhChinh: item.image,
        mauSac: 'Mặc định',
        phienBan: 'Tiêu chuẩn'
      }, 1);

      (window.CellphoneSCart || window.Cart).openDrawer();
    }
  };

  window.onDealProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentDealCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  // =========================================================================
  // CỤM DANH MỤC SẢN PHẨM DẠNG DUAL TAB (ĐIỆN THOẠI & TABLET - Chuẩn Hoàng Hà Mobile)
  // =========================================================================
  const DUAL_CATEGORY_BRANDS = {
    tablet: [
      { brand: 'all', label: 'Tất cả' },
      { brand: 'Apple', logo: 'images/brands/apple.png', alt: 'Apple', hClass: 'h-4.5 sm:h-5.5' },
      { brand: 'Samsung', logo: 'images/brands/samsung.png', alt: 'Samsung', hClass: 'h-4 sm:h-5' },
      { brand: 'Lenovo', logo: 'images/brands/lenovo.png', alt: 'Lenovo', hClass: 'h-4 sm:h-5' },
      { brand: 'Huawei', logo: 'images/brands/huawei.png', alt: 'Huawei', hClass: 'h-4.5 sm:h-5.5' },
      { brand: 'Xiaomi', logo: 'images/brands/mi.png', alt: 'Mi', hClass: 'h-4 sm:h-5' },
      { brand: 'HONOR', logo: 'images/brands/honor.png', alt: 'Honor', hClass: 'h-3.5 sm:h-4.5' },
      { brand: 'Nubia', logo: 'images/brands/redmagic.png', alt: 'RedMagic', hClass: 'h-4 sm:h-5' },
      { brand: 'TCL', logo: 'images/brands/tcl.png', alt: 'TCL', hClass: 'h-4 sm:h-5' },
      { brand: 'OPPO', logo: 'images/brands/oppo.png', alt: 'Oppo', hClass: 'h-4 sm:h-5' },
      { brand: 'HTC', logo: 'images/brands/htc.png', alt: 'HTC', hClass: 'h-4 sm:h-5' },
      { brand: 'Nokia', logo: 'images/brands/nokia.png', alt: 'Nokia', hClass: 'h-4 sm:h-5' }
    ],
    dienthoai: [
      { brand: 'all', label: 'Tất cả' },
      { brand: 'Apple', logo: 'images/brands/apple.png', alt: 'Apple', hClass: 'h-4.5 sm:h-5.5' },
      { brand: 'Samsung', logo: 'images/brands/samsung.png', alt: 'Samsung', hClass: 'h-4 sm:h-5' },
      { brand: 'Xiaomi', logo: 'images/brands/mi.png', alt: 'Mi', hClass: 'h-4 sm:h-5' },
      { brand: 'OPPO', logo: 'images/brands/oppo.png', alt: 'Oppo', hClass: 'h-4 sm:h-5' },
      { brand: 'HONOR', logo: 'images/brands/honor.png', alt: 'Honor', hClass: 'h-3.5 sm:h-4.5' },
      { brand: 'TCL', logo: 'images/brands/tcl.png', alt: 'TCL', hClass: 'h-4 sm:h-5' },
      { brand: 'REDMAGIC', logo: 'images/brands/redmagic.png', alt: 'RedMagic', hClass: 'h-4 sm:h-5' },
      { brand: 'Masstel', logo: 'images/brands/masstel.png', alt: 'Masstel', hClass: 'h-4 sm:h-5' },
      { brand: 'Inoi', logo: 'images/brands/inoi.png', alt: 'Inoi', hClass: 'h-4 sm:h-5' },
      { brand: 'TECNO', logo: 'images/brands/tecno.png', alt: 'TECNO', hClass: 'h-3.5 sm:h-4.5' },
      { brand: 'Mobell', logo: 'images/brands/mobell.png', alt: 'Mobell', hClass: 'h-4 sm:h-5' },
      { brand: 'Nokia', logo: 'images/brands/nokia.png', alt: 'Nokia', hClass: 'h-4 sm:h-5' },
      { brand: 'Nubia', logo: 'images/brands/nubia.png', alt: 'Nubia', hClass: 'h-4 sm:h-5' },
      { brand: 'OSCAL', logo: 'images/brands/oscal.png', alt: 'OSCAL', hClass: 'h-3.5 sm:h-4.5' },
      { brand: 'HTC', logo: 'images/brands/htc.png', alt: 'HTC', hClass: 'h-4 sm:h-5' }
    ]
  };

  let currentDualCategory = 'tablet'; // Mặc định Tablet như ảnh mẫu tham chiếu
  let currentDualBrand = 'all';
  let dualCategoryPageSize = 8;

  function initDualCategoryTabsSection() {
    renderDualCategoryBrandPills(currentDualCategory);
    renderDualCategoryProducts();
    initAccessorySection();
    initLaptopPcTabsSection();
    initMouseKeyboardSection();
    initAudioSection();
    initWatchCameraSection();
    initTiviSection();
    initAirSection();
    initPurifierSection();
  }

  function renderDualCategoryBrandPills(cat) {
    const container = document.getElementById('dual-tab-brand-pills-container');
    if (!container) return;

    const list = DUAL_CATEGORY_BRANDS[cat] || DUAL_CATEGORY_BRANDS.tablet;
    container.innerHTML = list.map(item => {
      const isActive = currentDualBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `
          <button type="button" onclick="window.filterDualCategoryBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center h-9 sm:h-10">
            ${item.label || 'Tất cả'}
          </button>
        `;
      }

      return `
        <button type="button" onclick="window.filterDualCategoryBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-9 sm:h-10" title="${item.alt || item.brand}">
          <img src="${item.logo}" alt="${item.alt || item.brand}" class="${item.hClass || 'h-4 sm:h-5'} w-auto object-contain max-w-[75px]" loading="lazy">
        </button>
      `;
    }).join('');
  }

  window.switchDualCategory = function (cat) {
    if (cat !== 'tablet' && cat !== 'dienthoai') return;
    currentDualCategory = cat;
    currentDualBrand = 'all';
    dualCategoryPageSize = 8;

    // Cập nhật tab active/inactive
    const btnPhone = document.getElementById('btn-dual-tab-dienthoai');
    const btnTablet = document.getElementById('btn-dual-tab-tablet');

    if (cat === 'tablet') {
      if (btnTablet) {
        btnTablet.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnPhone) {
        btnPhone.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnPhone) {
        btnPhone.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnTablet) {
        btnTablet.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    }

    // Render lại dải Hot Search thương hiệu tương ứng với Điện thoại / Tablet
    renderDualCategoryBrandPills(cat);

    // Reset vị trí cuộn ngang về đầu
    const container = document.getElementById('dual-tab-brand-pills-container');
    if (container) container.scrollLeft = 0;

    renderDualCategoryProducts();
  };

  window.filterDualCategoryBrand = function (brand) {
    currentDualBrand = brand;
    dualCategoryPageSize = 8;

    const pills = document.querySelectorAll('.dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.classList.add('active-brand-pill');
        p.classList.remove('bg-white', 'text-slate-800', 'border', 'border-slate-200');
      } else {
        p.classList.remove('active-brand-pill');
        p.classList.add('bg-white', 'text-slate-800', 'border', 'border-slate-200');
      }
    });

    renderDualCategoryProducts();
  };

  window.scrollDualBrandPills = function (delta) {
    const container = document.getElementById('dual-tab-brand-pills-container');
    if (container) {
      container.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  window.loadMoreDualProducts = function () {
    const type = currentDualCategory === 'tablet' ? 'tablet' : 'dienthoai';
    window.location.href = 'pages/category.html?type=' + encodeURIComponent(type);
  };

  window.onDualProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentDualCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onDualCartClick = function (id) {
    const list = (dealCategoriesData && dealCategoriesData[currentDualCategory]) || [];
    const item = list.find(p => p.id === id);
    if (!item) return;

    if (window.CellphoneSCart || window.Cart) {
      (window.CellphoneSCart || window.Cart).addItem({
        maHang: item.id,
        tenHang: item.name,
        donGia: item.price,
        giaGoc: item.oldPrice || item.price,
        anhChinh: item.image,
        mauSac: 'Mặc định',
        phienBan: 'Tiêu chuẩn'
      }, 1);

      (window.CellphoneSCart || window.Cart).openDrawer();
    }
  };

  function renderDualCategoryProducts() {
    const grid = document.getElementById('dual-tab-products-grid');
    if (!grid) return;

    let items = (dealCategoriesData && dealCategoriesData[currentDualCategory]) ? [...dealCategoriesData[currentDualCategory]] : [];

    // Lọc theo Brand
    if (currentDualBrand && currentDualBrand !== 'all') {
      const bLower = currentDualBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        if (bLower === 'apple') {
          return brand.includes('apple') || name.includes('ipad') || name.includes('iphone');
        }
        if (bLower === 'samsung') {
          return brand.includes('samsung') || name.includes('galaxy') || name.includes('samsung');
        }
        if (bLower === 'xiaomi' || bLower === 'mi') {
          return brand.includes('xiaomi') || brand.includes('redmi') || brand.includes('mi') || name.includes('xiaomi') || name.includes('redmi') || name.includes('mi ') || name.includes('pad');
        }
        if (bLower === 'redmagic') {
          return brand.includes('redmagic') || name.includes('redmagic');
        }
        if (bLower === 'nubia') {
          return brand.includes('nubia') || brand.includes('redmagic') || name.includes('nubia') || name.includes('redmagic');
        }
        if (bLower === 'tecno') {
          return brand.includes('tecno') || name.includes('tecno');
        }
        if (bLower === 'masstel') {
          return brand.includes('masstel') || name.includes('masstel');
        }
        if (bLower === 'inoi') {
          return brand.includes('inoi') || name.includes('inoi');
        }
        if (bLower === 'mobell') {
          return brand.includes('mobell') || name.includes('mobell');
        }
        if (bLower === 'oscal') {
          return brand.includes('oscal') || name.includes('oscal');
        }
        if (bLower === 'honor') {
          return brand.includes('honor') || name.includes('honor');
        }
        if (bLower === 'tcl') {
          return brand.includes('tcl') || name.includes('tcl');
        }
        if (bLower === 'oppo') {
          return brand.includes('oppo') || name.includes('oppo');
        }
        if (bLower === 'htc') {
          return brand.includes('htc') || name.includes('htc');
        }
        if (bLower === 'nokia') {
          return brand.includes('nokia') || name.includes('nokia');
        }
        if (bLower === 'lenovo') {
          return brand.includes('lenovo') || name.includes('lenovo');
        }
        if (bLower === 'huawei') {
          return brand.includes('huawei') || name.includes('huawei');
        }
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500">
          <div class="w-16 h-16 mx-auto mb-3 text-slate-300">
            <i class="fa-solid fa-box-open text-4xl"></i>
          </div>
          <p class="text-sm font-semibold">Chưa có sản phẩm phù hợp với bộ lọc "${currentDualBrand}".</p>
          <button type="button" onclick="window.filterDualCategoryBrand('all')" class="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-[#0b45a6] text-white hover:bg-blue-700 cursor-pointer">Xem tất cả sản phẩm</button>
        </div>
      `;
      const moreBtnContainer = document.getElementById('dual-tab-more-container');
      if (moreBtnContainer) moreBtnContainer.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, dualCategoryPageSize);

    const BANK_PROMOS = [
      'TPBank - Giảm đến 500.000đ, trả góp 0%, 0 phí lên đến 6 tháng',
      'TPBank Evo - Giảm đến 500.000đ, trả góp 0%, 0 phí lên đến 6 tháng',
      'VIB - Mở thẻ Max Card nhận loạt đặc quyền - Hoàn tiền lên đến 18 triệu đồng',
      'VPBank - Ưu đãi thanh toán giảm ngay 300.000đ',
      'Home Credit - Trả góp 0%, duyệt hồ sơ nhanh chỉ 3 phút'
    ];

    grid.innerHTML = visibleItems.map((item, idx) => {
      const discountBadge = item.discount ? `<span class="bg-rose-50 text-[#d70018] text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5">-${item.discount}%</span>` : '';
      const oldPriceDisplay = item.oldPrice ? `<div class="text-slate-400 text-xs line-through mt-0.5">${formatCurrency(item.oldPrice)}</div>` : '<div class="h-4 mt-0.5"></div>';
      const installmentVal = item.price > 0 ? Math.round(item.price / 6) : 0;
      const installmentText = installmentVal > 0 ? `Hoặc ${formatCurrency(installmentVal)} x 6T` : 'Trả góp 0% linh hoạt';
      const bankPromo = BANK_PROMOS[idx % BANK_PROMOS.length];

      return `
        <div class="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-3 sm:p-3.5 relative group cursor-pointer" onclick="window.onDualProductClick('${item.id}')">
          
          <!-- 1. Sparkle Icon lấp lánh góc trên bên trái -->
          <div class="absolute top-2.5 left-2.5 text-blue-500 z-10 pointer-events-none">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
            </svg>
          </div>

          <div>
            <!-- 2. Ảnh sản phẩm căn giữa, phóng to rõ nét cho dễ nhìn -->
            <div class="relative w-full h-48 sm:h-56 lg:h-60 mb-2.5 flex items-center justify-center p-1 overflow-hidden">
              <img src="${item.image}" alt="${item.name}" class="h-full w-full object-contain mx-auto transition-transform duration-300 transform scale-105 group-hover:scale-115" loading="lazy" onerror="this.onerror=null; this.src='images/deal-tabs/deal-tab-tablet.png';" />
            </div>

            <!-- 3. Tên sản phẩm: 2 dòng line-clamp-2, font đậm -->
            <h4 class="font-bold text-xs sm:text-[13px] text-slate-800 line-clamp-2 min-h-[36px] leading-snug group-hover:text-blue-600 transition-colors mb-2" title="${item.name}">
              ${item.name}
            </h4>

            <!-- 4. Hàng giá: Giá bán đỏ nổi bật, badge giảm giá, giá cũ gạch ngang -->
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-[#d70018] font-black text-sm sm:text-base">${formatCurrency(item.price)}</span>
              ${discountBadge}
            </div>
            ${oldPriceDisplay}

            <!-- 5. Dòng gợi ý trả góp màu xanh lục -->
            <div class="text-[#0057B7] text-[11px] font-semibold mt-1">
              ${installmentText}
            </div>

            <!-- 6. Dải 4 logo thẻ ngân hàng có màu nổi bật, to rõ -->
            <div class="grid grid-cols-2 gap-1.5 mt-2.5 w-full">
              <span class="h-7 sm:h-8 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs hover:border-purple-400 hover:bg-purple-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="TPBank Evo">
                <img src="images/brands/tpbank.png" alt="TPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-purple-700\'>TPBank</span>'" loading="lazy" />
              </span>
              <span class="h-7 sm:h-8 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs hover:border-emerald-400 hover:bg-emerald-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VPBank">
                <img src="images/brands/vpbank.png" alt="VPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-emerald-700\'>VPBank</span>'" loading="lazy" />
              </span>
              <span class="h-7 sm:h-8 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs hover:border-blue-400 hover:bg-blue-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VIB">
                <img src="images/brands/vib.png" alt="VIB" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-blue-700\'>VIB</span>'" loading="lazy" />
              </span>
              <span class="h-7 sm:h-8 bg-teal-50/70 border border-teal-200 rounded-xl shadow-2xs hover:border-teal-400 hover:bg-teal-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="Trả góp 0%">
                <img src="images/brands/icon-2_639047641516424460.png" alt="Trả góp 0%" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.src=\'images/brands/homecredit.png\'" loading="lazy" />
              </span>
            </div>

            <!-- 7. Dòng khuyến mãi ngân hàng: To rõ, dễ nhìn -->
            <div class="text-[11px] text-slate-700 font-semibold line-clamp-2 mt-2 bg-gradient-to-r from-blue-50/60 to-slate-50 p-2 rounded-xl border border-blue-100/80 min-h-[38px] leading-snug flex items-start gap-1.5 shadow-2xs">
              <i class="fa-solid fa-gift text-rose-500 text-xs mt-0.5 flex-shrink-0"></i>
              <span class="flex-1">${bankPromo}</span>
            </div>
          </div>

          <!-- 8. Chân thẻ: Trạng thái sẵn hàng + Nút giỏ hàng màu xanh dương giống mục ở trên -->
          <div class="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <i class="fa-regular fa-circle-check text-xs"></i> Sẵn hàng
            </span>
            <button type="button" onclick="event.stopPropagation(); window.onDualCartClick('${item.id}')" class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-[#0057B7] text-[#0057B7] hover:text-white border border-blue-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs" title="Thêm vào giỏ hàng">
              <i class="fa-solid fa-cart-shopping text-xs"></i>
            </button>
          </div>

        </div>
      `;
    }).join('');

    // Xử lý nút xem thêm
    const moreBtnContainer = document.getElementById('dual-tab-more-container');
    const moreBtn = document.getElementById('btn-dual-tab-load-more');
    if (moreBtnContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreBtnContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) {
          textSpan.textContent = `Xem thêm ${remaining} sản phẩm ${currentDualCategory === 'tablet' ? 'Tablet' : 'Điện thoại'}`;
        }
      } else {
        moreBtnContainer.classList.add('hidden');
      }
    }
  }

  // =========================================================================
  // PHỤ KIỆN: DANH MỤC PHỤ KIỆN DẠNG LƯỚI / CAROUSEL SLIDER (CHÍNH HÃNG)
  // =========================================================================
  const ACCESSORY_CATEGORIES_DATA = [
    // Slide 1 (16 mục - 2 hàng x 8 cột)
    [
      { id: 'phan-mem', title: 'Phần mềm', icon: 'images/accessories/phan-mem.png' },
      { id: 'hub-chuyen-doi', title: 'Hub chuyển đổi', icon: 'images/accessories/hub-chuyen-doi.png' },
      { id: 'playstation-gear', title: 'PlayStation, gear', icon: 'images/accessories/playstation-gear.png' },
      { id: 'balo-tui-xach', title: 'Balo, túi xách, túi chống sốc', icon: 'images/accessories/balo-tui-xach.png' },
      { id: 'mic-thu-am', title: 'Mic thu âm', icon: 'images/accessories/mic-thu-am.png' },
      { id: 'pin-man-hinh', title: 'Pin và màn hình iPhone', icon: 'images/accessories/pin-man-hinh.png' },
      { id: 'the-nho-usb', title: 'Thẻ nhớ, USB', icon: 'images/accessories/the-nho-usb.jpg' },
      { id: 'sac-du-phong', title: 'Sạc dự phòng', icon: 'images/accessories/sac-du-phong.png' },
      { id: 'quat-mini', title: 'Quạt Mini', icon: 'images/accessories/quat-mini.png' },
      { id: 'loa', title: 'Loa', icon: 'images/accessories/loa.png' },
      { id: 'day-deo-airtag', title: 'Dây đeo, Airtag', icon: 'images/accessories/day-deo-airtag.png' },
      { id: 'cu-sac-day-cap', title: 'Củ sạc, Dây cáp', icon: 'images/accessories/cu-sac-day-cap.png' },
      { id: 'apple-chinh-hang', title: 'Phụ kiện chính hãng Apple', icon: 'images/accessories/apple-chinh-hang.png' },
      { id: 'samsung-chinh-hang', title: 'Phụ kiện chính hãng Samsung', icon: 'images/accessories/samsung-chinh-hang.png' },
      { id: 'bao-da-op-lung', title: 'Bao da - ốp lưng', icon: 'images/accessories/bao-da-op-lung.png' },
      { id: 'dan-man-hinh', title: 'Dán màn hình', icon: 'images/accessories/dan-man-hinh.png' }
    ],
    // Slide 2 (16 mục tiếp theo)
    [
      { id: 'linh-kien-laptop', title: 'Linh kiện Laptop', icon: 'images/accessories/linh-kien-laptop.png' },
      { id: 'gimbal', title: 'Gimbal', icon: 'images/accessories/gimbal.png' },
      { id: 'chuot-ban-phim', title: 'Chuột, Bàn phím', icon: 'images/categories/pc-linh-kien.png' },
      { id: 'tai-nghe-bluetooth', title: 'Tai nghe Bluetooth', icon: 'images/categories/am-thanh.png' },
      { id: 'camera-webcam', title: 'Camera, Webcam', icon: 'images/categories/camera.png' },
      { id: 'thiet-bi-mang', title: 'Thiết bị mạng WiFi', icon: 'images/categories/thiet-bi-mang.png' },
      { id: 'do-choi-cong-nghe', title: 'Đồ chơi công nghệ', icon: 'images/accessories/playstation-gear.png' },
      { id: 'phu-kien-khac', title: 'Phụ kiện cao cấp khác', icon: 'images/accessories/cu-sac-day-cap.png' },
      { id: 'but-cam-ung', title: 'Bút cảm ứng Stylus', icon: 'images/categories/phu-kien.png' },
      { id: 'gia-do-ke', title: 'Giá đỡ, Kệ điện thoại', icon: 'images/accessories/linh-kien-laptop.png' },
      { id: 'day-dong-ho', title: 'Dây đồng hồ thời trang', icon: 'images/accessories/day-deo-airtag.png' },
      { id: 'op-lung-ipad', title: 'Bao da, Ốp lưng iPad', icon: 'images/accessories/bao-da-op-lung.png' },
      { id: 'the-nho-camera', title: 'Thẻ nhớ chuyên dụng', icon: 'images/accessories/the-nho-usb.jpg' },
      { id: 'sac-khong-day', title: 'Sạc không dây MagSafe', icon: 'images/accessories/sac-du-phong.png' },
      { id: 'dau-doc-the', title: 'Đầu đọc thẻ đa năng', icon: 'images/accessories/hub-chuyen-doi.png' },
      { id: 've-sinh-thiet-bi', title: 'Bộ vệ sinh thiết bị', icon: 'images/accessories/dan-man-hinh.png' }
    ]
  ];

  let currentAccessorySlide = 0;
  let activeAccessoryId = 'phan-mem'; // Mục Phần mềm active mặc định theo ảnh mẫu

  function initAccessorySection() {
    renderAccessoryCategories();
  }

  function renderAccessoryCategories() {
    const track = document.getElementById('accessory-track');
    if (!track) return;

    track.innerHTML = ACCESSORY_CATEGORIES_DATA.map((slideItems, slideIdx) => `
      <div class="w-full flex-shrink-0">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 border-t border-l border-slate-100 rounded-lg overflow-hidden">
          ${slideItems.map(item => {
            const isSelected = item.id === activeAccessoryId;
            const bgClass = isSelected
              ? 'bg-[#ebf3fe] font-semibold text-[#0057B7] -translate-y-0.5 shadow-2xs z-1'
              : 'bg-white hover:bg-[#ebf3fe] hover:-translate-y-0.5 hover:shadow-2xs hover:z-1 text-slate-700 hover:text-[#0057B7]';
            return `
              <div onclick="window.onAccessoryCategoryClick('${item.id}', '${item.title}')" class="group flex flex-col items-center justify-between p-2.5 sm:py-3.5 sm:px-2 min-h-[110px] sm:min-h-[130px] border-r border-b border-slate-100 transition-all duration-200 cursor-pointer text-center select-none relative ${bgClass}" title="${item.title}">
                <div class="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-1.5 sm:mb-2">
                  <img src="${item.icon}" alt="${item.title}" class="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" loading="lazy" onerror="this.onerror=null; this.src='images/categories/phu-kien.png';" />
                </div>
                <span class="text-xs sm:text-[13px] leading-snug line-clamp-2 min-h-[32px] sm:min-h-[36px] flex items-center justify-center transition-colors">
                  ${item.title}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    updateAccessorySliderPosition();
  }

  function updateAccessorySliderPosition() {
    const track = document.getElementById('accessory-track');
    if (track) {
      track.style.transform = `translateX(-${currentAccessorySlide * 100}%)`;
    }

    const dot0 = document.getElementById('accessory-dot-0');
    const dot1 = document.getElementById('accessory-dot-1');
    if (dot0 && dot1) {
      if (currentAccessorySlide === 0) {
        dot0.className = 'h-1 w-8 rounded-full bg-[#0057B7] transition-all cursor-pointer';
        dot1.className = 'h-1 w-8 rounded-full bg-slate-200 hover:bg-slate-300 transition-all cursor-pointer';
      } else {
        dot0.className = 'h-1 w-8 rounded-full bg-slate-200 hover:bg-slate-300 transition-all cursor-pointer';
        dot1.className = 'h-1 w-8 rounded-full bg-[#0057B7] transition-all cursor-pointer';
      }
    }
  }

  window.slideAccessoryCategory = function (direction) {
    const totalSlides = ACCESSORY_CATEGORIES_DATA.length;
    currentAccessorySlide = (currentAccessorySlide + direction + totalSlides) % totalSlides;
    updateAccessorySliderPosition();
  };

  window.goToAccessorySlide = function (index) {
    if (index >= 0 && index < ACCESSORY_CATEGORIES_DATA.length) {
      currentAccessorySlide = index;
      updateAccessorySliderPosition();
    }
  };

  window.onAccessoryCategoryClick = function (id, title) {
    activeAccessoryId = id;
    renderAccessoryCategories();

    if (window.quickSearchTag) {
      window.quickSearchTag(title);
    }
  };

  // =========================================================================
  // CỤM DANH MỤC SẢN PHẨM DẠNG DUAL TAB (LAPTOP & PC - CHUẨN HOÀNG HÀ / CELLPHONES)
  // =========================================================================
  const LAPTOP_PC_BRANDS = {
    laptop: [
      { brand: 'all', label: 'Tất cả' },
      { brand: 'Apple', logo: 'images/brands/apple.png', alt: 'Apple', hClass: 'h-4.5 sm:h-5.5' },
      { brand: 'ASUS', logo: 'images/brands/asus.png', alt: 'ASUS', hClass: 'h-3.5 sm:h-4.5' },
      { brand: 'Dell', logo: 'images/brands/dell.png', alt: 'Dell', hClass: 'h-4 sm:h-5' },
      { brand: 'Lenovo', logo: 'images/brands/lenovo.png', alt: 'Lenovo', hClass: 'h-4 sm:h-5' },
      { brand: 'HP', logo: 'images/brands/hp.png', alt: 'HP', hClass: 'h-4 sm:h-5' },
      { brand: 'Acer', logo: 'images/brands/acer.png', alt: 'Acer', hClass: 'h-4 sm:h-5' },
      { brand: 'MSI', logo: 'images/brands/msi.png', alt: 'MSI', hClass: 'h-3.5 sm:h-4.5' },
      { brand: 'Colorful', logo: 'images/brands/colorful.png', alt: 'Colorful', hClass: 'h-3 sm:h-4' },
      { brand: 'Mobell', logo: 'images/brands/mobell.png', alt: 'Mobell', hClass: 'h-4 sm:h-5' }
    ],
    pc: [
      { brand: 'all', label: 'Tất cả' },
      { brand: 'Apple', logo: 'images/brands/apple.png', alt: 'Apple', hClass: 'h-4.5 sm:h-5.5' },
      { brand: 'MSI', logo: 'images/brands/msi.png', alt: 'MSI', hClass: 'h-3.5 sm:h-4.5' }
    ]
  };

  let currentLaptopPcCategory = 'laptop';
  let currentLaptopPcBrand = 'all';
  let laptopPcPageSize = 8;

  function initLaptopPcTabsSection() {
    renderLaptopPcBrandPills(currentLaptopPcCategory);
    renderLaptopPcProducts();
  }

  function renderLaptopPcBrandPills(cat) {
    const container = document.getElementById('laptop-pc-brand-pills-container');
    if (!container) return;

    const list = LAPTOP_PC_BRANDS[cat] || LAPTOP_PC_BRANDS.laptop;
    container.innerHTML = list.map(item => {
      const isActive = currentLaptopPcBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `
          <button type="button" onclick="window.filterLaptopPcBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center h-9 sm:h-10">
            ${item.label || 'Tất cả'}
          </button>
        `;
      }

      return `
        <button type="button" onclick="window.filterLaptopPcBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-9 sm:h-10" title="${item.alt || item.brand}">
          <img src="${item.logo}" alt="${item.alt || item.brand}" class="${item.hClass || 'h-4 sm:h-5'} w-auto object-contain max-w-[75px]" loading="lazy">
        </button>
      `;
    }).join('');
  }

  window.switchLaptopPcCategory = function (cat) {
    if (cat !== 'laptop' && cat !== 'pc') return;
    currentLaptopPcCategory = cat;
    currentLaptopPcBrand = 'all';
    laptopPcPageSize = 8;

    const btnLaptop = document.getElementById('btn-laptop-pc-tab-laptop');
    const btnPc = document.getElementById('btn-laptop-pc-tab-pc');

    if (cat === 'laptop') {
      if (btnLaptop) {
        btnLaptop.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnPc) {
        btnPc.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnPc) {
        btnPc.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnLaptop) {
        btnLaptop.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    }

    renderLaptopPcBrandPills(cat);

    const container = document.getElementById('laptop-pc-brand-pills-container');
    if (container) container.scrollLeft = 0;

    renderLaptopPcProducts();
  };

  window.filterLaptopPcBrand = function (brand) {
    currentLaptopPcBrand = brand;
    laptopPcPageSize = 8;

    const pills = document.querySelectorAll('#laptop-pc-brand-pills-container .dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.classList.add('active-brand-pill');
        p.classList.remove('bg-white', 'text-slate-800', 'border', 'border-slate-200');
      } else {
        p.classList.remove('active-brand-pill');
        p.classList.add('bg-white', 'text-slate-800', 'border', 'border-slate-200');
      }
    });

    renderLaptopPcProducts();
  };

  window.scrollLaptopPcBrandPills = function (delta) {
    const container = document.getElementById('laptop-pc-brand-pills-container');
    if (container) {
      container.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  window.loadMoreLaptopPcProducts = function () {
    const type = currentLaptopPcCategory === 'pc' ? 'pc' : 'laptop';
    window.location.href = 'pages/category.html?type=' + encodeURIComponent(type);
  };

  window.onLaptopPcProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentLaptopPcCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onLaptopPcCartClick = function (id) {
    const list = (dealCategoriesData && dealCategoriesData[currentLaptopPcCategory]) || [];
    const item = list.find(p => p.id === id);
    if (!item) return;

    if (window.CellphoneSCart || window.Cart) {
      const cartObj = window.CellphoneSCart || window.Cart;
      cartObj.addItem({
        maHang: item.id,
        tenHang: item.name,
        donGia: item.price,
        giaGoc: item.oldPrice || item.price,
        anhChinh: item.image,
        soLuong: 1
      }, 1);

      (window.CellphoneSCart || window.Cart).openDrawer();
    }
  };

  function renderLaptopPcProducts() {
    const grid = document.getElementById('laptop-pc-products-grid');
    if (!grid) return;

    let items = (dealCategoriesData && dealCategoriesData[currentLaptopPcCategory]) ? [...dealCategoriesData[currentLaptopPcCategory]] : [];

    if (currentLaptopPcBrand && currentLaptopPcBrand !== 'all') {
      const bLower = currentLaptopPcBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        if (bLower === 'apple') {
          return brand.includes('apple') || name.includes('macbook') || name.includes('mac mini') || name.includes('imac') || name.includes('apple');
        }
        if (bLower === 'asus') {
          return brand.includes('asus') || name.includes('asus') || name.includes('vivobook') || name.includes('tuf') || name.includes('zenbook') || name.includes('rog');
        }
        if (bLower === 'dell') {
          return brand.includes('dell') || name.includes('dell') || name.includes('inspiron') || name.includes('vostro');
        }
        if (bLower === 'lenovo') {
          return brand.includes('lenovo') || name.includes('lenovo') || name.includes('loq') || name.includes('ideapad') || name.includes('thinkpad') || name.includes('legion');
        }
        if (bLower === 'hp') {
          return brand.includes('hp') || name.includes('hp') || name.includes('victus') || name.includes('pavilion') || name.includes('envy');
        }
        if (bLower === 'acer') {
          return brand.includes('acer') || name.includes('acer') || name.includes('nitro') || name.includes('aspire') || name.includes('predator') || name.includes('swift');
        }
        if (bLower === 'msi') {
          return brand.includes('msi') || name.includes('msi') || name.includes('modern') || name.includes('katana') || name.includes('cubi') || name.includes('infinite');
        }
        if (bLower === 'colorful') {
          return brand.includes('colorful') || name.includes('colorful');
        }
        if (bLower === 'mobell') {
          return brand.includes('mobell') || name.includes('mobell') || name.includes('m-smart') || name.includes('mbook');
        }
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500">
          <div class="w-16 h-16 mx-auto mb-3 text-slate-300">
            <i class="fa-solid fa-box-open text-4xl"></i>
          </div>
          <p class="text-sm font-semibold">Chưa có sản phẩm phù hợp với bộ lọc "${currentLaptopPcBrand}".</p>
          <button type="button" onclick="window.filterLaptopPcBrand('all')" class="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-[#0b45a6] text-white hover:bg-blue-700 cursor-pointer">Xem tất cả sản phẩm</button>
        </div>
      `;
      const moreBtnContainer = document.getElementById('laptop-pc-more-container');
      if (moreBtnContainer) moreBtnContainer.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, laptopPcPageSize);

    const BANK_PROMOS = [
      'TPBank - Giảm đến 500.000đ, trả góp 0%, 0 phí lên đến 6 tháng',
      'TPBank Evo - Giảm đến 500.000đ, trả góp 0%, 0 phí lên đến 6 tháng',
      'VIB - Mở thẻ Max Card nhận loạt đặc quyền - Hoàn tiền lên đến 18 triệu đồng',
      'VPBank - Ưu đãi thanh toán giảm ngay 300.000đ',
      'Home Credit - Trả góp 0%, duyệt hồ sơ nhanh chỉ 3 phút'
    ];

    grid.innerHTML = visibleItems.map((item, idx) => {
      const discountBadge = item.discount ? `<span class="bg-rose-50 text-[#d70018] text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5">-${item.discount}%</span>` : '';
      const oldPriceDisplay = item.oldPrice ? `<div class="text-slate-400 text-xs line-through mt-0.5">${formatCurrency(item.oldPrice)}</div>` : '<div class="h-4 mt-0.5"></div>';
      const installmentVal = item.price > 0 ? Math.round(item.price / 6) : 0;
      const installmentText = installmentVal > 0 ? `Hoặc ${formatCurrency(installmentVal)} x 6T` : 'Trả góp 0% linh hoạt';
      const bankPromo = BANK_PROMOS[idx % BANK_PROMOS.length];

      return `
        <div class="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-3 sm:p-3.5 relative group cursor-pointer" onclick="window.onLaptopPcProductClick('${item.id}')">
          
          <div class="absolute top-2.5 left-2.5 text-blue-500 z-10 pointer-events-none">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
            </svg>
          </div>

          <div>
            <div class="relative w-full h-48 sm:h-56 lg:h-60 mb-2.5 flex items-center justify-center p-1 overflow-hidden">
              <img src="${item.image}" alt="${item.name}" class="h-full w-full object-contain mx-auto transition-transform duration-300 transform scale-105 group-hover:scale-115" loading="lazy" onerror="this.onerror=null; this.src='images/deal-tabs/deal-tab-laptop.png';" />
            </div>

            <h4 class="text-xs sm:text-[13px] font-bold text-slate-800 line-clamp-2 min-h-[38px] leading-snug hover:text-blue-600 transition-colors" title="${item.name}">
              ${item.name}
            </h4>

            <div class="mt-2.5">
              <div class="flex items-baseline flex-wrap gap-1">
                <span class="text-[#d70018] font-black text-sm sm:text-base">${item.price > 0 ? formatCurrency(item.price) : 'Liên hệ'}</span>
                ${discountBadge}
              </div>
              ${oldPriceDisplay}
            </div>

            <div class="mt-1.5 text-[#0057B7] text-[11px] font-semibold flex items-center gap-1">
              <i class="fa-solid fa-credit-card text-[10px]"></i>
              <span>${installmentText}</span>
            </div>

            <!-- 4 Bank badges 2x2: To rõ, viền & nền mang màu thương hiệu nổi bật -->
            <div class="grid grid-cols-2 gap-1.5 mt-2.5 w-full">
              <span class="h-7 sm:h-8 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs hover:border-purple-400 hover:bg-purple-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="TPBank Evo">
                <img src="images/brands/tpbank.png" alt="TPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-purple-700\'>TPBank</span>'" loading="lazy" />
              </span>
              <span class="h-7 sm:h-8 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs hover:border-emerald-400 hover:bg-emerald-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VPBank">
                <img src="images/brands/vpbank.png" alt="VPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-emerald-700\'>VPBank</span>'" loading="lazy" />
              </span>
              <span class="h-7 sm:h-8 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs hover:border-blue-400 hover:bg-blue-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VIB">
                <img src="images/brands/vib.png" alt="VIB" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-blue-700\'>VIB</span>'" loading="lazy" />
              </span>
              <span class="h-7 sm:h-8 bg-teal-50/70 border border-teal-200 rounded-xl shadow-2xs hover:border-teal-400 hover:bg-teal-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="Trả góp 0%">
                <img src="images/brands/icon-2_639047641516424460.png" alt="Trả góp 0%" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.src=\'images/brands/homecredit.png\'" loading="lazy" />
              </span>
            </div>

            <!-- Khuyến mãi ngân hàng: To rõ, dễ nhìn -->
            <div class="text-[11px] text-slate-700 font-semibold line-clamp-2 mt-2 bg-gradient-to-r from-blue-50/60 to-slate-50 p-2 rounded-xl border border-blue-100/80 min-h-[38px] leading-snug flex items-start gap-1.5 shadow-2xs">
              <i class="fa-solid fa-gift text-rose-500 text-xs mt-0.5 flex-shrink-0"></i>
              <span class="flex-1">${bankPromo}</span>
            </div>
          </div>

          <div class="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <i class="fa-regular fa-circle-check text-xs"></i> Sẵn hàng
            </span>
            <button type="button" onclick="event.stopPropagation(); window.onLaptopPcCartClick('${item.id}')" class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-[#0057B7] text-[#0057B7] hover:text-white border border-blue-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs" title="Thêm vào giỏ hàng">
              <i class="fa-solid fa-cart-shopping text-xs"></i>
            </button>
          </div>

        </div>
      `;
    }).join('');

    const moreBtnContainer = document.getElementById('laptop-pc-more-container');
    const moreBtn = document.getElementById('btn-laptop-pc-load-more');
    if (moreBtnContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreBtnContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) {
          textSpan.textContent = `Xem thêm ${remaining} sản phẩm ${currentLaptopPcCategory === 'laptop' ? 'Laptop' : 'PC'}`;
        }
      } else {
        moreBtnContainer.classList.add('hidden');
      }
    }
  }


  // =========================================================================
  // HÀM TIỆN ÍCH CHUNG TẠO THẺ SẢN PHẨM HOÀNG HÀ MOBILE / CELLPHONES (5 CỘT)
  // =========================================================================
  function createHoangHaCardHtml(item, fallbackImg, cartFnName, clickFnName) {
    const isContact = !item.price || item.price <= 0;
    const discountBadge = item.discount ? `<span class="bg-[#d70018] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-1.5 whitespace-nowrap">-${item.discount}%</span>` : '';
    const oldPriceDisplay = item.oldPrice ? `<div class="text-[11px] text-slate-400 line-through font-medium mt-0.5">${formatCurrency(item.oldPrice)}</div>` : '';
    const installmentVal = item.price > 0 ? Math.round(item.price / 6) : 0;
    const installmentText = installmentVal > 0 ? `Hoặc ${formatCurrency(installmentVal)} x 6T` : 'Hỗ trợ trả góp 0%';

    const bankPromos = [
      'TPBank Evo - Giảm đến 500.000đ, trả góp 0%, 0 phí lên đến 6 tháng',
      'VPBank - Giảm tới 400.000đ khi mở thẻ thành công',
      'VIB - Hoàn tiền lên đến 18 triệu đồng khi mở thẻ Max Card',
      'Thanh toán trả góp 0% duyệt nhanh chóng qua Home Credit'
    ];
    const bankPromo = item.bankPromo || bankPromos[Math.abs(item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % bankPromos.length];
    const isInStock = item.status !== 'Hết hàng' && !isContact;
    const statusHtml = isInStock 
      ? `<span class="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold"><i class="fa-regular fa-circle-check text-[11px]"></i> Sẵn hàng</span>`
      : `<span class="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium"><i class="fa-solid fa-phone text-[10px]"></i> Liên hệ</span>`;

    return `
      <div class="product-card group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:shadow-lg transition-all duration-300 p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer" onclick="${clickFnName}('${item.id}')">
        <div>
          <!-- Sparkle Icon -->
          <div class="absolute top-2.5 left-2.5 z-10 text-blue-500 opacity-80 group-hover:opacity-100 transition-opacity">
            <i class="fa-solid fa-sparkles text-xs"></i>
          </div>

          <!-- Product Image Container -->
          <div class="w-full aspect-square relative mb-2.5 flex items-center justify-center overflow-hidden">
            <img src="${item.image}" alt="${item.name}" class="h-full w-full object-contain mx-auto transition-transform duration-300 transform scale-100 group-hover:scale-110" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';" />
          </div>

          <!-- Title (2 lines clamp) -->
          <h4 class="text-xs sm:text-[13px] font-bold text-slate-800 line-clamp-2 min-h-[36px] leading-snug hover:text-blue-600 transition-colors" title="${item.name}">
            ${item.name}
          </h4>

          <!-- Price & Discount -->
          <div class="mt-2">
            <div class="flex items-baseline flex-wrap gap-1">
              <span class="text-[#d70018] font-black text-sm sm:text-base">${item.price > 0 ? formatCurrency(item.price) : 'Liên hệ'}</span>
              ${discountBadge}
            </div>
            ${oldPriceDisplay}
          </div>

          <!-- Installment -->
          <div class="mt-1 text-[#0057B7] text-[11px] font-semibold flex items-center gap-1">
            <i class="fa-solid fa-credit-card text-[10px]"></i>
            <span>${installmentText}</span>
          </div>

          <!-- 4 Bank badges 2x2: To rõ, viền & nền mang màu thương hiệu nổi bật -->
          <div class="grid grid-cols-2 gap-1.5 mt-2.5 w-full">
            <span class="h-7 sm:h-8 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs hover:border-purple-400 hover:bg-purple-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="TPBank Evo">
              <img src="images/brands/tpbank.png" alt="TPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-purple-700\'>TPBank</span>'" loading="lazy" />
            </span>
            <span class="h-7 sm:h-8 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs hover:border-emerald-400 hover:bg-emerald-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VPBank">
              <img src="images/brands/vpbank.png" alt="VPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-emerald-700\'>VPBank</span>'" loading="lazy" />
            </span>
            <span class="h-7 sm:h-8 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs hover:border-blue-400 hover:bg-blue-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VIB">
              <img src="images/brands/vib.png" alt="VIB" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-blue-700\'>VIB</span>'" loading="lazy" />
            </span>
            <span class="h-7 sm:h-8 bg-teal-50/70 border border-teal-200 rounded-xl shadow-2xs hover:border-teal-400 hover:bg-teal-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="Trả góp 0%">
              <img src="images/brands/icon-2_639047641516424460.png" alt="Trả góp 0%" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.src=\'images/brands/homecredit.png\'" loading="lazy" />
            </span>
          </div>

          <!-- Bank promo text box: To rõ, tương phản cao, dễ nhìn -->
          <div class="text-[11px] text-slate-700 font-semibold line-clamp-2 mt-2 bg-gradient-to-r from-blue-50/60 to-slate-50 p-2 rounded-xl border border-blue-100/80 min-h-[38px] leading-snug flex items-start gap-1.5 shadow-2xs">
            <i class="fa-solid fa-gift text-rose-500 text-xs mt-0.5 flex-shrink-0"></i>
            <span class="flex-1">${bankPromo}</span>
          </div>
        </div>

        <!-- Stock status & cart button -->
        <div class="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
          ${statusHtml}
          <button type="button" onclick="event.stopPropagation(); ${cartFnName}('${item.id}')" class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 hover:bg-[#0057B7] text-[#0057B7] hover:text-white border border-blue-200 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs" title="Thêm vào giỏ hàng">
            <i class="fa-solid fa-cart-shopping text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 1. CỤM CHUỘT VÀ BÀN PHÍM & THIẾT BỊ MẠNG (5 CỘT CHUẨN HOÀNG HÀ)
  // =========================================================================
  let currentMouseCategory = 'chuot_banphim';
  let currentMouseBrand = 'all';
  let mousePageSize = 10;

  const MOUSE_KEYBOARD_BRANDS = {
    chuot_banphim: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'Logitech', alt: 'Logitech', logo: 'images/brands/logitech.png' },
      { brand: 'Rapoo', alt: 'Rapoo', logo: 'images/brands/rapoo.png' },
      { brand: 'E-Dra', alt: 'E-Dra', logo: 'images/brands/edra.png' },
      { brand: 'MSI', alt: 'MSI', logo: 'images/brands/msi.png' },
      { brand: 'ASUS', alt: 'ASUS', logo: 'images/brands/asus.png' },
      { brand: 'Razer', alt: 'Razer', logo: 'images/brands/razer.png' },
      { brand: 'Elecom', alt: 'Elecom', logo: 'images/brands/elecom.png' },
      { brand: 'HyperX', alt: 'HyperX' },
      { brand: 'Apple', alt: 'Apple', logo: 'images/brands/apple.png' },
      { brand: 'Xiaomi', alt: 'Mi', logo: 'images/brands/mi.png' },
      { brand: 'Acer', alt: 'Acer', logo: 'images/brands/acer.png' },
      { brand: 'Colorful', alt: 'Colorful', logo: 'images/brands/colorful.png' },
      { brand: 'Genius', alt: 'Genius', logo: 'images/brands/genius.png' }
    ],
    thietbi_mang: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'TP-Link', alt: 'TP-Link', logo: 'images/brands/tp-link.png' },
      { brand: 'ASUS', alt: 'ASUS', logo: 'images/brands/asus.png' },
      { brand: 'Tenda', alt: 'Tenda' },
      { brand: 'Mercusys', alt: 'Mercusys', logo: 'images/brands/mercusys.png' },
      { brand: 'D-Link', alt: 'D-Link' },
      { brand: 'Totolink', alt: 'Totolink', logo: 'images/brands/totolink.png' },
      { brand: 'Ruijie', alt: 'Ruijie' }
    ]
  };

  function initMouseKeyboardSection() {
    renderMouseBrandPills(currentMouseCategory);
    renderMouseProducts();
  }

  function renderMouseBrandPills(cat) {
    const container = document.getElementById('mouse-brand-pills-container');
    if (!container) return;

    const brands = MOUSE_KEYBOARD_BRANDS[cat] || MOUSE_KEYBOARD_BRANDS.chuot_banphim;
    container.innerHTML = brands.map(item => {
      const isActive = currentMouseBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `<button type="button" onclick="window.filterMouseBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9">Tất cả</button>`;
      }

      if (item.logo) {
        return `<button type="button" onclick="window.filterMouseBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}"><img src="${item.logo}" alt="${item.alt}" class="h-3.5 sm:h-4 w-auto object-contain max-w-[65px]" onerror="this.outerHTML='<span class=\'text-xs font-bold\'>${item.alt}</span>'" loading="lazy" /></button>`;
      }

      return `<button type="button" onclick="window.filterMouseBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}">${item.alt}</button>`;
    }).join('');
  }

  window.switchMouseCategory = function (cat) {
    if (currentMouseCategory === cat) return;
    currentMouseCategory = cat;
    currentMouseBrand = 'all';
    mousePageSize = 10;

    const btnMouse = document.getElementById('btn-mouse-tab-mouse');
    const btnNet = document.getElementById('btn-mouse-tab-network');

    if (cat === 'chuot_banphim') {
      if (btnMouse) {
        btnMouse.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnNet) {
        btnNet.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnMouse) {
        btnMouse.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
      if (btnNet) {
        btnNet.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
    }

    renderMouseBrandPills(cat);
    renderMouseProducts();
  };

  window.filterMouseBrand = function (brand) {
    currentMouseBrand = brand;
    mousePageSize = 10;

    const pills = document.querySelectorAll('#mouse-brand-pills-container .dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.className = 'dual-brand-pill active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      } else {
        p.className = 'dual-brand-pill bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      }
    });

    renderMouseProducts();
  };

  window.scrollMouseBrandPills = function (delta) {
    const c = document.getElementById('mouse-brand-pills-container');
    if (c) c.scrollBy({ left: delta, behavior: 'smooth' });
  };

  window.loadMoreMouseProducts = function () {
    window.location.href = 'pages/category.html?type=mouse';
  };

  window.onMouseProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentMouseCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onMouseCartClick = function (id) {
    const list = dealCategoriesData[currentMouseCategory] || [];
    const item = list.find(p => p.id === id);
    if (!item) return;
    if (window.CartStore && window.CartStore.addItem) {
      window.CartStore.addItem({
        maHang: item.id,
        tenHang: item.name,
        giaBan: item.price,
        anhChinh: item.image,
        soLuong: 1
      });
      if (window.showToast) window.showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
  };

  function renderMouseProducts() {
    const grid = document.getElementById('mouse-products-grid');
    if (!grid) return;

    let items = dealCategoriesData[currentMouseCategory] ? [...dealCategoriesData[currentMouseCategory]] : [];
    if (currentMouseBrand && currentMouseBrand !== 'all') {
      const bLower = currentMouseBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-2 text-slate-300"></i><p class="text-sm font-semibold">Chưa có sản phẩm phù hợp.</p></div>`;
      const btn = document.getElementById('mouse-more-container');
      if (btn) btn.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, mousePageSize);
    grid.innerHTML = visibleItems.map(it => createHoangHaCardHtml(it, 'images/deal-tabs/deal-tab-accessory.jpg', 'window.onMouseCartClick', 'window.onMouseProductClick')).join('');

    const moreContainer = document.getElementById('mouse-more-container');
    const moreBtn = document.getElementById('btn-mouse-load-more');
    if (moreContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) textSpan.textContent = `Xem thêm ${remaining} sản phẩm`;
      } else {
        moreContainer.classList.add('hidden');
      }
    }
  }

  // =========================================================================
  // 2. CỤM BANNER NGANG + LOA & TAI NGHE (5 CỘT CHUẨN HOÀNG HÀ)
  // =========================================================================
  let currentAudioCategory = 'loa';
  let currentAudioBrand = 'all';
  let audioPageSize = 10;

  const AUDIO_BRANDS = {
    loa: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'JBL', alt: 'JBL', logo: 'images/brands/jbl.png' },
      { brand: 'Harman Kardon', alt: 'Harman Kardon', logo: 'images/brands/harman-kardon.png' },
      { brand: 'Arirang', alt: 'Arirang', logo: 'images/brands/arirang.png' },
      { brand: 'Sony', alt: 'Sony', logo: 'images/brands/sony.png' },
      { brand: 'LG', alt: 'LG', logo: 'images/brands/lg.png' },
      { brand: 'Marshall', alt: 'Marshall', logo: 'images/brands/marshall.png' },
      { brand: 'Monster', alt: 'Monster', logo: 'images/brands/monster.png' },
      { brand: 'Xiaomi', alt: 'Mi', logo: 'images/brands/mi.png' },
      { brand: 'Sounarc', alt: 'Sounarc', logo: 'images/brands/sounarc.png' },
      { brand: 'Qlike', alt: 'Olike', logo: 'images/brands/olike.png' },
      { brand: 'Samsung', alt: 'Samsung', logo: 'images/brands/samsung.png' },
      { brand: 'Soul', alt: 'Soul', logo: 'images/brands/soul.png' },
      { brand: 'Baseus', alt: 'Baseus', logo: 'images/brands/baseus.png' }
    ],
    tainghe: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'Apple', alt: 'Apple', logo: 'images/brands/apple.png' },
      { brand: 'Sony', alt: 'Sony', logo: 'images/brands/sony.png' },
      { brand: 'JBL', alt: 'JBL', logo: 'images/brands/jbl.png' },
      { brand: 'Marshall', alt: 'Marshall', logo: 'images/brands/marshall.png' },
      { brand: 'Samsung', alt: 'Samsung', logo: 'images/brands/samsung.png' },
      { brand: 'Soundpeats', alt: 'Soundpeats', logo: 'images/brands/soundpeats.png' },
      { brand: 'Baseus', alt: 'Baseus', logo: 'images/brands/baseus.png' },
      { brand: 'Huawei', alt: 'Huawei', logo: 'images/brands/huawei.png' }
    ]
  };

  function initAudioSection() {
    renderAudioBrandPills(currentAudioCategory);
    renderAudioProducts();
  }

  function renderAudioBrandPills(cat) {
    const container = document.getElementById('audio-brand-pills-container');
    if (!container) return;

    const brands = AUDIO_BRANDS[cat] || AUDIO_BRANDS.loa;
    container.innerHTML = brands.map(item => {
      const isActive = currentAudioBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `<button type="button" onclick="window.filterAudioBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9">Tất cả</button>`;
      }

      if (item.logo) {
        return `<button type="button" onclick="window.filterAudioBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}"><img src="${item.logo}" alt="${item.alt}" class="h-3.5 sm:h-4 w-auto object-contain max-w-[65px]" onerror="this.outerHTML='<span class=\'text-xs font-bold\'>${item.alt}</span>'" loading="lazy" /></button>`;
      }

      return `<button type="button" onclick="window.filterAudioBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}">${item.alt}</button>`;
    }).join('');
  }

  window.switchAudioCategory = function (cat) {
    if (currentAudioCategory === cat) return;
    currentAudioCategory = cat;
    currentAudioBrand = 'all';
    audioPageSize = 10;

    const btnSpeaker = document.getElementById('btn-audio-tab-speaker');
    const btnHeadphone = document.getElementById('btn-audio-tab-headphone');

    if (cat === 'loa') {
      if (btnSpeaker) {
        btnSpeaker.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnHeadphone) {
        btnHeadphone.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnSpeaker) {
        btnSpeaker.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
      if (btnHeadphone) {
        btnHeadphone.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
    }

    renderAudioBrandPills(cat);
    renderAudioProducts();
  };

  window.filterAudioBrand = function (brand) {
    currentAudioBrand = brand;
    audioPageSize = 10;

    const pills = document.querySelectorAll('#audio-brand-pills-container .dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.className = 'dual-brand-pill active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      } else {
        p.className = 'dual-brand-pill bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      }
    });

    renderAudioProducts();
  };

  window.scrollAudioBrandPills = function (delta) {
    const c = document.getElementById('audio-brand-pills-container');
    if (c) c.scrollBy({ left: delta, behavior: 'smooth' });
  };

  window.loadMoreAudioProducts = function () {
    window.location.href = 'pages/category.html?type=audio';
  };

  window.onAudioProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentAudioCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onAudioCartClick = function (id) {
    const list = dealCategoriesData[currentAudioCategory] || [];
    const item = list.find(p => p.id === id);
    if (!item) return;
    if (window.CartStore && window.CartStore.addItem) {
      window.CartStore.addItem({
        maHang: item.id,
        tenHang: item.name,
        giaBan: item.price,
        anhChinh: item.image,
        soLuong: 1
      });
      if (window.showToast) window.showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
  };

  function renderAudioProducts() {
    const grid = document.getElementById('audio-products-grid');
    if (!grid) return;

    let items = dealCategoriesData[currentAudioCategory] ? [...dealCategoriesData[currentAudioCategory]] : [];
    if (currentAudioBrand && currentAudioBrand !== 'all') {
      const bLower = currentAudioBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-2 text-slate-300"></i><p class="text-sm font-semibold">Chưa có sản phẩm phù hợp.</p></div>`;
      const btn = document.getElementById('audio-more-container');
      if (btn) btn.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, audioPageSize);
    grid.innerHTML = visibleItems.map(it => createHoangHaCardHtml(it, 'images/deal-tabs/deal-tab-audio.jpg', 'window.onAudioCartClick', 'window.onAudioProductClick')).join('');

    const moreContainer = document.getElementById('audio-more-container');
    const moreBtn = document.getElementById('btn-audio-load-more');
    if (moreContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) textSpan.textContent = `Xem thêm ${remaining} sản phẩm`;
      } else {
        moreContainer.classList.add('hidden');
      }
    }
  }

  // =========================================================================
  // 3. CỤM BANNER NGANG + ĐỒNG HỒ & CAMERA (5 CỘT CHUẨN HOÀNG HÀ)
  // =========================================================================
  let currentWatchCategory = 'dongho';
  let currentWatchBrand = 'all';
  let watchPageSize = 10;

  const WATCH_CAMERA_BRANDS = {
    dongho: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'Garmin', alt: 'GARMIN', logo: 'images/brands/garmin.png' },
      { brand: 'Apple', alt: 'Apple', logo: 'images/brands/apple.png' },
      { brand: 'Huawei', alt: 'HUAWEI', logo: 'images/brands/huawei.png' },
      { brand: 'Xiaomi', alt: 'Mi', logo: 'images/brands/mi.png' },
      { brand: 'Amazfit', alt: 'amazfit', logo: 'images/brands/amazfit.png' },
      { brand: 'Kieslect', alt: 'KIESLECT', logo: 'images/brands/kieslect.png' },
      { brand: 'Samsung', alt: 'SAMSUNG', logo: 'images/brands/samsung.png' },
      { brand: 'Masstel', alt: 'Masstel', logo: 'images/brands/masstel.png' },
      { brand: 'Honor', alt: 'HONOR', logo: 'images/brands/honor.png' },
      { brand: 'GloryFit', alt: 'GloryFit', logo: 'images/brands/gloryfit.png' },
      { brand: 'Riversong', alt: 'RIVERSONG', logo: 'images/brands/riversong.png' },
      { brand: 'Mibro', alt: 'mibro', logo: 'images/brands/mibro.png' },
      { brand: 'Myalo', alt: 'myalo', logo: 'images/brands/myalo.png' }
    ],
    camera: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'TP-Link', alt: 'Tapo', logo: 'images/brands/tp-link.png' },
      { brand: 'Ezviz', alt: 'Ezviz', logo: 'images/brands/ezviz.png' },
      { brand: 'Imou', alt: 'Imou', logo: 'images/brands/imou.png' },
      { brand: 'Xiaomi', alt: 'Mi', logo: 'images/brands/mi.png' },
      { brand: 'Hikvision', alt: 'Hikvision' },
      { brand: 'Dahua', alt: 'Dahua' }
    ]
  };

  function initWatchCameraSection() {
    renderWatchBrandPills(currentWatchCategory);
    renderWatchProducts();
  }

  function renderWatchBrandPills(cat) {
    const container = document.getElementById('watch-brand-pills-container');
    if (!container) return;

    const brands = WATCH_CAMERA_BRANDS[cat] || WATCH_CAMERA_BRANDS.dongho;
    container.innerHTML = brands.map(item => {
      const isActive = currentWatchBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `<button type="button" onclick="window.filterWatchBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9">Tất cả</button>`;
      }

      if (item.logo) {
        return `<button type="button" onclick="window.filterWatchBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}"><img src="${item.logo}" alt="${item.alt}" class="h-3.5 sm:h-4 w-auto object-contain max-w-[65px]" onerror="this.outerHTML='<span class=\'text-xs font-bold\'>${item.alt}</span>'" loading="lazy" /></button>`;
      }

      return `<button type="button" onclick="window.filterWatchBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}">${item.alt}</button>`;
    }).join('');
  }

  window.switchWatchCategory = function (cat) {
    if (currentWatchCategory === cat) return;
    currentWatchCategory = cat;
    currentWatchBrand = 'all';
    watchPageSize = 10;

    const btnWatch = document.getElementById('btn-watch-tab-watch');
    const btnCamera = document.getElementById('btn-watch-tab-camera');

    if (cat === 'dongho') {
      if (btnWatch) {
        btnWatch.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnCamera) {
        btnCamera.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnWatch) {
        btnWatch.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
      if (btnCamera) {
        btnCamera.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
    }

    renderWatchBrandPills(cat);
    renderWatchProducts();
  };

  window.filterWatchBrand = function (brand) {
    currentWatchBrand = brand;
    watchPageSize = 10;

    const pills = document.querySelectorAll('#watch-brand-pills-container .dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.className = 'dual-brand-pill active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      } else {
        p.className = 'dual-brand-pill bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      }
    });

    renderWatchProducts();
  };

  window.scrollWatchBrandPills = function (delta) {
    const c = document.getElementById('watch-brand-pills-container');
    if (c) c.scrollBy({ left: delta, behavior: 'smooth' });
  };

  window.loadMoreWatchProducts = function () {
    if (currentWatchCategory === 'camera') {
      window.location.href = 'pages/category.html?type=camera';
    } else {
      window.location.href = 'pages/category.html?type=watch';
    }
  };

  window.onWatchProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentWatchCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onWatchCartClick = function (id) {
    const list = dealCategoriesData[currentWatchCategory] || [];
    const item = list.find(p => p.id === id);
    if (!item) return;
    if (window.CartStore && window.CartStore.addItem) {
      window.CartStore.addItem({
        maHang: item.id,
        tenHang: item.name,
        giaBan: item.price,
        anhChinh: item.image,
        soLuong: 1
      });
      if (window.showToast) window.showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
  };

  function renderWatchProducts() {
    const grid = document.getElementById('watch-products-grid');
    if (!grid) return;

    let items = dealCategoriesData[currentWatchCategory] ? [...dealCategoriesData[currentWatchCategory]] : [];
    if (currentWatchBrand && currentWatchBrand !== 'all') {
      const bLower = currentWatchBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-2 text-slate-300"></i><p class="text-sm font-semibold">Chưa có sản phẩm phù hợp.</p></div>`;
      const moreCont = document.getElementById('watch-more-container');
      if (moreCont) moreCont.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, watchPageSize);
    grid.innerHTML = visibleItems.map(it => createHoangHaCardHtml(it, 'images/deal-tabs/deal-tab-watch.jpg', 'window.onWatchCartClick', 'window.onWatchProductClick')).join('');

    const moreContainer = document.getElementById('watch-more-container');
    const moreBtn = document.getElementById('btn-watch-load-more');
    if (moreContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) textSpan.textContent = `Xem thêm ${remaining} sản phẩm`;
      } else {
        moreContainer.classList.add('hidden');
      }
    }
  }


  // =========================================================================
  // 4. CỤM TIVI & TỦ LẠNH (5 CỘT CHUẨN HOÀNG HÀ)
  // =========================================================================
  let currentTiviCategory = 'tivi';
  let currentTiviBrand = 'all';
  let tiviPageSize = 10;

  const TIVI_TULANH_BRANDS = {
    tivi: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'LG', alt: 'LG', logo: 'images/brands/lg.png' },
      { brand: 'Samsung', alt: 'SAMSUNG', logo: 'images/brands/samsung.png' },
      { brand: 'TCL', alt: 'TCL', logo: 'images/brands/tcl.png' },
      { brand: 'Sony', alt: 'SONY', logo: 'images/brands/sony.png' },
      { brand: 'Xiaomi', alt: 'Mi', logo: 'images/brands/mi.png' },
      { brand: 'VSP', alt: 'VSP', logo: 'images/brands/vsp.png' },
      { brand: 'Coocaa', alt: 'coocaa', logo: 'images/brands/coocaa.png' },
      { brand: 'Casper', alt: 'Casper', logo: 'images/brands/casper.png' }
    ],
    tulanh: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'Samsung', alt: 'Samsung', logo: 'images/brands/samsung.png' },
      { brand: 'Panasonic', alt: 'Panasonic', logo: 'images/brands/panasonic.png' },
      { brand: 'Toshiba', alt: 'Toshiba', logo: 'images/brands/toshiba.png' },
      { brand: 'LG', alt: 'LG', logo: 'images/brands/lg.png' },
      { brand: 'Aqua', alt: 'AQUA', logo: 'images/brands/aqua.png' },
      { brand: 'Sharp', alt: 'SHARP', logo: 'images/brands/sharp.png' },
      { brand: 'Casper', alt: 'Casper', logo: 'images/brands/casper.png' },
      { brand: 'Electrolux', alt: 'Electrolux', logo: 'images/brands/electrolux.png' }
    ]
  };

  function initTiviSection() {
    renderTiviBrandPills(currentTiviCategory);
    renderTiviProducts();
  }

  function renderTiviBrandPills(cat) {
    const container = document.getElementById('tivi-brand-pills-container');
    if (!container) return;

    const brands = TIVI_TULANH_BRANDS[cat] || TIVI_TULANH_BRANDS.tivi;
    container.innerHTML = brands.map(item => {
      const isActive = currentTiviBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `<button type="button" onclick="window.filterTiviBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9">Tất cả</button>`;
      }

      if (item.logo) {
        return `<button type="button" onclick="window.filterTiviBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}"><img src="${item.logo}" alt="${item.alt}" class="h-3.5 sm:h-4 w-auto object-contain max-w-[65px]" onerror="this.outerHTML='<span class=\'text-xs font-bold\'>${item.alt}</span>'" loading="lazy" /></button>`;
      }

      return `<button type="button" onclick="window.filterTiviBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}">${item.alt}</button>`;
    }).join('');
  }

  window.switchTiviCategory = function (cat) {
    if (currentTiviCategory === cat) return;
    currentTiviCategory = cat;
    currentTiviBrand = 'all';
    tiviPageSize = 10;

    const btnTivi = document.getElementById('btn-tivi-tab-tivi');
    const btnTulanh = document.getElementById('btn-tivi-tab-tulanh');

    if (cat === 'tivi') {
      if (btnTivi) {
        btnTivi.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnTulanh) {
        btnTulanh.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnTivi) {
        btnTivi.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
      if (btnTulanh) {
        btnTulanh.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
    }

    renderTiviBrandPills(cat);
    renderTiviProducts();
  };

  window.filterTiviBrand = function (brand) {
    currentTiviBrand = brand;
    tiviPageSize = 10;

    const pills = document.querySelectorAll('#tivi-brand-pills-container .dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.className = 'dual-brand-pill active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      } else {
        p.className = 'dual-brand-pill bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      }
    });

    renderTiviProducts();
  };

  window.scrollTiviBrandPills = function (delta) {
    const c = document.getElementById('tivi-brand-pills-container');
    if (c) c.scrollBy({ left: delta, behavior: 'smooth' });
  };

  window.loadMoreTiviProducts = function () {
    window.location.href = 'pages/category.html?type=tivi';
  };

  window.onTiviProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentTiviCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onTiviCartClick = function (id) {
    const list = dealCategoriesData[currentTiviCategory] || [];
    const item = list.find(p => p.id === id);
    if (!item) return;
    if (window.CartStore && window.CartStore.addItem) {
      window.CartStore.addItem({
        maHang: item.id,
        tenHang: item.name,
        giaBan: item.price,
        anhChinh: item.image,
        soLuong: 1
      });
      if (window.showToast) window.showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
  };

  function renderTiviProducts() {
    const grid = document.getElementById('tivi-products-grid');
    if (!grid) return;

    let items = dealCategoriesData[currentTiviCategory] ? [...dealCategoriesData[currentTiviCategory]] : [];
    if (currentTiviBrand && currentTiviBrand !== 'all') {
      const bLower = currentTiviBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-2 text-slate-300"></i><p class="text-sm font-semibold">Chưa có sản phẩm phù hợp.</p></div>`;
      const btn = document.getElementById('tivi-more-container');
      if (btn) btn.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, tiviPageSize);
    grid.innerHTML = visibleItems.map(it => createHoangHaCardHtml(it, 'images/categories/tivi-dien-may.png', 'window.onTiviCartClick', 'window.onTiviProductClick')).join('');

    const moreContainer = document.getElementById('tivi-more-container');
    const moreBtn = document.getElementById('btn-tivi-load-more');
    if (moreContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) textSpan.textContent = `Xem thêm ${remaining} sản phẩm`;
      } else {
        moreContainer.classList.add('hidden');
      }
    }
  }

  // =========================================================================
  // 5. CỤM ĐIỀU HOÀ & MÁY GIẶT (5 CỘT CHUẨN HOÀNG HÀ)
  // =========================================================================
  let currentAirCategory = 'dieuhoa';
  let currentAirBrand = 'all';
  let airPageSize = 10;

  const AIR_WASHER_BRANDS = {
    dieuhoa: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'Funiki', alt: 'Funiki', logo: 'images/brands/funiki.png' },
      { brand: 'Casper', alt: 'Casper', logo: 'images/brands/casper.png' },
      { brand: 'Panasonic', alt: 'Panasonic', logo: 'images/brands/panasonic.png' },
      { brand: 'Daikin', alt: 'DAIKIN', logo: 'images/brands/daikin.png' },
      { brand: 'Nagakawa', alt: 'Nagakawa', logo: 'images/brands/nagakawa.png' },
      { brand: 'Toshiba', alt: 'TOSHIBA', logo: 'images/brands/toshiba.png' },
      { brand: 'Comfee', alt: 'Comfee', logo: 'images/brands/comfee.png' },
      { brand: 'Sharp', alt: 'SHARP', logo: 'images/brands/sharp.png' },
      { brand: 'TCL', alt: 'TCL', logo: 'images/brands/tcl.png' },
      { brand: 'LG', alt: 'LG', logo: 'images/brands/lg.png' },
      { brand: 'Aqua', alt: 'AQUA', logo: 'images/brands/aqua.png' },
      { brand: 'AUX', alt: 'AUX', logo: 'images/brands/aux-brand.png' },
      { brand: 'Midea', alt: 'Midea', logo: 'images/brands/midea.png' }
    ],
    maygiat: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'LG', alt: 'LG', logo: 'images/brands/lg.png' },
      { brand: 'Samsung', alt: 'Samsung', logo: 'images/brands/samsung.png' },
      { brand: 'Toshiba', alt: 'Toshiba', logo: 'images/brands/toshiba.png' },
      { brand: 'Panasonic', alt: 'Panasonic', logo: 'images/brands/panasonic.png' },
      { brand: 'Aqua', alt: 'AQUA', logo: 'images/brands/aqua.png' },
      { brand: 'Electrolux', alt: 'Electrolux', logo: 'images/brands/electrolux.png' },
      { brand: 'Casper', alt: 'Casper', logo: 'images/brands/casper.png' }
    ]
  };

  function initAirSection() {
    renderAirBrandPills(currentAirCategory);
    renderAirProducts();
  }

  function renderAirBrandPills(cat) {
    const container = document.getElementById('air-brand-pills-container');
    if (!container) return;

    const brands = AIR_WASHER_BRANDS[cat] || AIR_WASHER_BRANDS.dieuhoa;
    container.innerHTML = brands.map(item => {
      const isActive = currentAirBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `<button type="button" onclick="window.filterAirBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9">Tất cả</button>`;
      }

      if (item.logo) {
        return `<button type="button" onclick="window.filterAirBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}"><img src="${item.logo}" alt="${item.alt}" class="h-3.5 sm:h-4 w-auto object-contain max-w-[65px]" onerror="this.outerHTML='<span class=\'text-xs font-bold\'>${item.alt}</span>'" loading="lazy" /></button>`;
      }

      return `<button type="button" onclick="window.filterAirBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}">${item.alt}</button>`;
    }).join('');
  }

  window.switchAirCategory = function (cat) {
    if (currentAirCategory === cat) return;
    currentAirCategory = cat;
    currentAirBrand = 'all';
    airPageSize = 10;

    const btnAir = document.getElementById('btn-air-tab-dieuhoa');
    const btnMaygiat = document.getElementById('btn-air-tab-maygiat');

    if (cat === 'dieuhoa') {
      if (btnAir) {
        btnAir.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnMaygiat) {
        btnMaygiat.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnAir) {
        btnAir.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
      if (btnMaygiat) {
        btnMaygiat.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
    }

    renderAirBrandPills(cat);
    renderAirProducts();
  };

  window.filterAirBrand = function (brand) {
    currentAirBrand = brand;
    airPageSize = 10;

    const pills = document.querySelectorAll('#air-brand-pills-container .dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.className = 'dual-brand-pill active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      } else {
        p.className = 'dual-brand-pill bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      }
    });

    renderAirProducts();
  };

  window.scrollAirBrandPills = function (delta) {
    const c = document.getElementById('air-brand-pills-container');
    if (c) c.scrollBy({ left: delta, behavior: 'smooth' });
  };

  window.loadMoreAirProducts = function () {
    window.location.href = 'pages/category.html?type=air';
  };

  window.onAirProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentAirCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onAirCartClick = function (id) {
    const list = dealCategoriesData[currentAirCategory] || [];
    const item = list.find(p => p.id === id);
    if (!item) return;
    if (window.CartStore && window.CartStore.addItem) {
      window.CartStore.addItem({
        maHang: item.id,
        tenHang: item.name,
        giaBan: item.price,
        anhChinh: item.image,
        soLuong: 1
      });
      if (window.showToast) window.showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
  };

  function renderAirProducts() {
    const grid = document.getElementById('air-products-grid');
    if (!grid) return;

    let items = dealCategoriesData[currentAirCategory] ? [...dealCategoriesData[currentAirCategory]] : [];
    if (currentAirBrand && currentAirBrand !== 'all') {
      const bLower = currentAirBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-2 text-slate-300"></i><p class="text-sm font-semibold">Chưa có sản phẩm phù hợp.</p></div>`;
      const btn = document.getElementById('air-more-container');
      if (btn) btn.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, airPageSize);
    grid.innerHTML = visibleItems.map(it => createHoangHaCardHtml(it, 'images/categories/tivi-dien-may.png', 'window.onAirCartClick', 'window.onAirProductClick')).join('');

    const moreContainer = document.getElementById('air-more-container');
    const moreBtn = document.getElementById('btn-air-load-more');
    if (moreContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) textSpan.textContent = `Xem thêm ${remaining} sản phẩm`;
      } else {
        moreContainer.classList.add('hidden');
      }
    }
  }

  // =========================================================================
  // 6. CỤM MÁY LỌC KHÔNG KHÍ & MÁY HÚT ẨM (5 CỘT CHUẨN HOÀNG HÀ)
  // =========================================================================
  let currentPurifierCategory = 'mayloc_khongkhi';
  let currentPurifierBrand = 'all';
  let purifierPageSize = 10;

  const PURIFIER_BRANDS = {
    mayloc_khongkhi: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'Xiaomi', alt: 'Mi', logo: 'images/brands/mi.png' },
      { brand: 'Sharp', alt: 'SHARP', logo: 'images/brands/sharp.png' },
      { brand: 'LG', alt: 'LG', logo: 'images/brands/lg.png' },
      { brand: 'Clair', alt: 'clair', logo: 'images/brands/clair.png' },
      { brand: 'Daikin', alt: 'DAIKIN', logo: 'images/brands/daikin.png' },
      { brand: 'Electrolux', alt: 'Electrolux', logo: 'images/brands/electrolux.png' },
      { brand: 'Philips', alt: 'PHILIPS', logo: 'images/brands/philips.png' },
      { brand: 'Midea', alt: 'Midea', logo: 'images/brands/midea.png' },
      { brand: 'Nova', alt: 'NOVA' }
    ],
    may_hut_am: [
      { brand: 'all', alt: 'Tất cả' },
      { brand: 'Xiaomi', alt: 'Mi', logo: 'images/brands/mi.png' },
      { brand: 'Sharp', alt: 'SHARP', logo: 'images/brands/sharp.png' },
      { brand: 'Dorosin', alt: 'Dorosin' },
      { brand: 'Kosmen', alt: 'Kosmen' },
      { brand: 'FujiE', alt: 'FujiE' }
    ]
  };

  function initPurifierSection() {
    renderPurifierBrandPills(currentPurifierCategory);
    renderPurifierProducts();
  }

  function renderPurifierBrandPills(cat) {
    const container = document.getElementById('purifier-brand-pills-container');
    if (!container) return;

    const brands = PURIFIER_BRANDS[cat] || PURIFIER_BRANDS.mayloc_khongkhi;
    container.innerHTML = brands.map(item => {
      const isActive = currentPurifierBrand === item.brand;
      const activeClass = isActive
        ? 'active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600';

      if (item.brand === 'all') {
        return `<button type="button" onclick="window.filterPurifierBrand('all')" data-brand="all" class="dual-brand-pill ${activeClass} flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9">Tất cả</button>`;
      }

      if (item.logo) {
        return `<button type="button" onclick="window.filterPurifierBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}"><img src="${item.logo}" alt="${item.alt}" class="h-3.5 sm:h-4 w-auto object-contain max-w-[65px]" onerror="this.outerHTML='<span class=\'text-xs font-bold\'>${item.alt}</span>'" loading="lazy" /></button>`;
      }

      return `<button type="button" onclick="window.filterPurifierBrand('${item.brand}')" data-brand="${item.brand}" class="dual-brand-pill ${activeClass} flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9" title="${item.alt}">${item.alt}</button>`;
    }).join('');
  }

  window.switchPurifierCategory = function (cat) {
    if (currentPurifierCategory === cat) return;
    currentPurifierCategory = cat;
    currentPurifierBrand = 'all';
    purifierPageSize = 10;

    const btnAir = document.getElementById('btn-purifier-tab-air');
    const btnDehum = document.getElementById('btn-purifier-tab-dehum');

    if (cat === 'mayloc_khongkhi') {
      if (btnAir) {
        btnAir.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
      if (btnDehum) {
        btnDehum.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
    } else {
      if (btnAir) {
        btnAir.className = 'dual-cat-tab-inactive h-12 sm:h-14 rounded-2xl flex items-center justify-center font-bold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer bg-white border border-slate-200 shadow-2xs ';
      }
      if (btnDehum) {
        btnDehum.className = 'dual-cat-tab-active h-12 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer shadow-md';
      }
    }

    renderPurifierBrandPills(cat);
    renderPurifierProducts();
  };

  window.filterPurifierBrand = function (brand) {
    currentPurifierBrand = brand;
    purifierPageSize = 10;

    const pills = document.querySelectorAll('#purifier-brand-pills-container .dual-brand-pill');
    pills.forEach(p => {
      if (p.dataset.brand === brand) {
        p.className = 'dual-brand-pill active-brand-pill bg-[#0057B7] text-white border-blue-600 shadow-xs flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      } else {
        p.className = 'dual-brand-pill bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center h-8 sm:h-9';
      }
    });

    renderPurifierProducts();
  };

  window.scrollPurifierBrandPills = function (delta) {
    const c = document.getElementById('purifier-brand-pills-container');
    if (c) c.scrollBy({ left: delta, behavior: 'smooth' });
  };

  window.loadMorePurifierProducts = function () {
    window.location.href = 'pages/category.html?type=purifier';
  };

  window.onPurifierProductClick = function (id) {
    try {
      const list = (dealCategoriesData && dealCategoriesData[currentPurifierCategory]) || [];
      const item = list.find(p => p.id === id);
      if (item) sessionStorage.setItem('current_view_product', JSON.stringify(item));
    } catch (e) {}
    window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(id);
  };

  window.onPurifierCartClick = function (id) {
    const list = dealCategoriesData[currentPurifierCategory] || [];
    const item = list.find(p => p.id === id);
    if (!item) return;
    if (window.CartStore && window.CartStore.addItem) {
      window.CartStore.addItem({
        maHang: item.id,
        tenHang: item.name,
        giaBan: item.price,
        anhChinh: item.image,
        soLuong: 1
      });
      if (window.showToast) window.showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
  };

  function renderPurifierProducts() {
    const grid = document.getElementById('purifier-products-grid');
    if (!grid) return;

    let items = dealCategoriesData[currentPurifierCategory] ? [...dealCategoriesData[currentPurifierCategory]] : [];
    if (currentPurifierBrand && currentPurifierBrand !== 'all') {
      const bLower = currentPurifierBrand.toLowerCase();
      items = items.filter(it => {
        const brand = (it.brand || '').toLowerCase();
        const name = (it.name || '').toLowerCase();
        return brand.includes(bLower) || name.includes(bLower);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500"><i class="fa-solid fa-box-open text-4xl mb-2 text-slate-300"></i><p class="text-sm font-semibold">Chưa có sản phẩm phù hợp.</p></div>`;
      const btn = document.getElementById('purifier-more-container');
      if (btn) btn.classList.add('hidden');
      return;
    }

    const visibleItems = items.slice(0, purifierPageSize);
    grid.innerHTML = visibleItems.map(it => createHoangHaCardHtml(it, 'images/categories/smart-home.png', 'window.onPurifierCartClick', 'window.onPurifierProductClick')).join('');

    const moreContainer = document.getElementById('purifier-more-container');
    const moreBtn = document.getElementById('btn-purifier-load-more');
    if (moreContainer && moreBtn) {
      if (items.length > visibleItems.length) {
        moreContainer.classList.remove('hidden');
        const remaining = items.length - visibleItems.length;
        const textSpan = moreBtn.querySelector('span');
        if (textSpan) textSpan.textContent = `Xem thêm ${remaining} sản phẩm`;
      } else {
        moreContainer.classList.add('hidden');
      }
    }
  }

  window.toggleMegaMenu = function () {
    const menu = document.getElementById('mega-menu-flyout');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  };

  // Khởi động toàn bộ ứng dụng sau khi toàn bộ hằng số và hàm đã được định nghĩa
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
