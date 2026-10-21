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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
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
   * Hero Slider
   */
  const DEFAULT_HERO_SLIDES = [
    {
      id: "slide-1",
      title: "iPhone 16 Pro Max",
      subtitle: "ĐỈNH CAO TITAN SA MẠC - CHIP A18 PRO 3NM",
      desc: "Màn hình 6.9 inch viền siêu mỏng, Camera 48MP Zoom 5x, Phím Camera Control thế hệ mới.",
      badge: "Mở Bán Siêu Phẩm 2026",
      priceText: "Từ 31.490.000 đ",
      oldPriceText: "34.990.000 đ",
      discountText: "Giảm 3.500.000 đ",
      image: "images/phone-desert.svg",
      targetMaHang: "MH001",
      btnText: "Mua Ngay Giảm 10%",
      bgGradient: "from-[#061a0f] via-[#092b19] to-[#04120a]",
      themeColor: "#80ffbf"
    },
    {
      id: "slide-2",
      title: "Galaxy S24 Ultra 5G",
      subtitle: "QUYỀN NĂNG GALAXY AI - KHUNG VIỀN TITAN",
      desc: "Bút S-Pen quyền năng, Camera 200MP Mắt Thần Bóng Đêm, Màn hình Dynamic AMOLED 2X 2600 nits.",
      badge: "Flagship Đỉnh Cao",
      priceText: "28.490.000 đ",
      oldPriceText: "33.990.000 đ",
      discountText: "Giảm 5.500.000 đ",
      image: "images/galaxy-s24.svg",
      targetMaHang: "MH003",
      btnText: "Xem Chi Tiết",
      bgGradient: "from-slate-950 via-indigo-950 to-slate-900",
      themeColor: "#6366F1"
    },
    {
      id: "slide-3",
      title: "Đại Tiệc Phụ Kiện Cao Cấp",
      subtitle: "CHÍNH HÃNG APPLE & ANKER GIẢM ĐẾN 40%",
      desc: "Củ sạc 20W USB-C, Ốp lưng MagSafe, Cáp sạc bọc dù chống đứt, Tai nghe AirPods Pro 2.",
      badge: "Deal Hot Trong Ngày",
      priceText: "Chỉ từ 450.000 đ",
      oldPriceText: "650.000 đ",
      discountText: "Ưu Đãi Lớn",
      image: "images/accessories-pack.svg",
      targetMaHang: "MH006",
      btnText: "Săn Deal Ngay",
      bgGradient: "from-amber-950 via-rose-950 to-slate-950",
      themeColor: "#F59E0B"
    },
    {
      id: "slide-4",
      title: "Thu Cũ Đổi Mới Lên Đời",
      subtitle: "TRỢ GIÁ ĐẾN 2.500.000 Đ - KHÔNG LO BÙ TIỀN",
      desc: "Thu mua máy cũ giá cao nhất thị trường. Kiểm tra định giá nhanh trong 5 phút. Trả góp 0%.",
      badge: "Thu Cũ Trợ Giá Cao",
      priceText: "Thu đổi mọi thương hiệu",
      oldPriceText: "",
      discountText: "Trợ giá tới 2.5TR",
      image: "images/phone-natural.svg",
      targetMaHang: "MH001",
      btnText: "Định Giá Máy Cũ",
      bgGradient: "from-emerald-950 via-teal-950 to-slate-900",
      themeColor: "#80ffbf"
    }
  ];

  function renderHeroSlider() {
    const slidesContainer = document.getElementById('hero-slider-container');
    const dotsContainer = document.getElementById('hero-slider-dots');
    if (!slidesContainer) return;

    let slides = ((window.CellphoneSData || window.StoreData)?.config?.banners?.heroSlides);
    if (!slides || !slides.length) {
      slides = DEFAULT_HERO_SLIDES;
    }

    slidesContainer.innerHTML = slides.map((s, idx) => `
      <div class="hero-slide flex-shrink-0 w-full ${idx === 0 ? 'active-slide' : ''}" data-slide-index="${idx}">
        <div class="relative rounded-2xl overflow-hidden bg-gradient-to-r ${s.bgGradient} p-6 sm:p-10 text-white min-h-[340px] sm:min-h-[400px] flex items-center shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full z-10">
            <div class="md:col-span-7 space-y-3.5 transition-all duration-700 ease-out" style="${idx === 0 ? 'transform: translateY(0); opacity: 1;' : 'transform: translateY(6px); opacity: 0.7;'}">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider">
                <i class="fa-solid fa-bolt text-amber-400"></i> ${s.badge}
              </span>
              <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">${s.title}</h2>
              <p class="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg">${s.desc}</p>
              
              <div class="flex items-baseline gap-3 pt-1">
                <span class="text-2xl sm:text-3xl font-extrabold text-amber-300">${s.priceText}</span>
                ${s.oldPriceText ? `<span class="text-sm text-slate-400 line-through">${s.oldPriceText}</span>` : ''}
                ${s.discountText ? `<span class="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">${s.discountText}</span>` : ''}
              </div>

              <div class="pt-2 flex flex-wrap gap-3">
                <button type="button" onclick="(window.CellphoneSProductModal || window.ProductModal).open('${s.targetMaHang}')" class="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-white">
                  <i class="fa-solid fa-cart-shopping text-emerald-600"></i> ${s.btnText}
                </button>
                <button type="button" onclick="(window.CellphoneSLookup || window.Lookup).openTradeInModal()" class="px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border border-white/80">
                  <i class="fa-solid fa-arrows-rotate text-emerald-600"></i> Thu cũ đổi mới
                </button>
              </div>
            </div>

            <div class="md:col-span-5 flex justify-center">
              <div class="relative w-48 h-48 sm:w-64 sm:h-64 group cursor-pointer" onclick="(window.CellphoneSProductModal || window.ProductModal).open('${s.targetMaHang}')">
                <div class="absolute inset-0 bg-[#80ffbf]/20 rounded-full blur-2xl transform group-hover:scale-110 transition-transform"></div>
                <img src="${s.image}" alt="${s.title}" class="relative w-full h-full object-contain filter drop-shadow-2xl transition-all duration-700 ease-out group-hover:scale-105" style="${idx === 0 ? 'transform: scale(1); opacity: 1;' : 'transform: scale(0.92); opacity: 0.7;'}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map((_, idx) => `
        <button type="button" onclick="window.setHeroSlide(${idx})" class="w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === 0 ? 'w-7 bg-[#80ffbf]' : 'bg-slate-300 hover:bg-slate-400'}" aria-label="Slide ${idx + 1}"></button>
      `).join('');
    }

    startHeroSliderAuto(slides.length);
  }

  function startHeroSliderAuto(total) {
    if (heroSlideInterval) clearInterval(heroSlideInterval);
    heroSlideInterval = setInterval(() => {
      window.setHeroSlide((heroCurrentSlide + 1) % total);
    }, 5500);
  }

  window.setHeroSlide = function (idx) {
    const slidesContainer = document.getElementById('hero-slider-container');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#hero-slider-dots button');
    if (!slides.length || !slidesContainer) return;

    heroCurrentSlide = idx;
    slidesContainer.style.transform = `translateX(-${idx * 100}%)`;

    slides.forEach((s, i) => {
      const img = s.querySelector('img');
      const textGroup = s.querySelector('.md\\:col-span-7');
      if (i === idx) {
        s.classList.add('active-slide');
        if (img) {
          img.style.transform = 'scale(1)';
          img.style.opacity = '1';
        }
        if (textGroup) {
          textGroup.style.transform = 'translateY(0)';
          textGroup.style.opacity = '1';
        }
      } else {
        s.classList.remove('active-slide');
        if (img) {
          img.style.transform = 'scale(0.92)';
          img.style.opacity = '0.7';
        }
        if (textGroup) {
          textGroup.style.transform = 'translateY(6px)';
          textGroup.style.opacity = '0.7';
        }
      }
    });

    dots.forEach((d, i) => {
      if (i === idx) {
        d.className = 'w-7 h-2.5 rounded-full bg-[#00483d] transition-all cursor-pointer';
      } else {
        d.className = 'w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all cursor-pointer';
      }
    });
  };

  window.prevHeroSlide = function () {
    const total = document.querySelectorAll('.hero-slide').length;
    window.setHeroSlide((heroCurrentSlide - 1 + total) % total);
    startHeroSliderAuto(total);
  };

  window.nextHeroSlide = function () {
    const total = document.querySelectorAll('.hero-slide').length;
    window.setHeroSlide((heroCurrentSlide + 1) % total);
    startHeroSliderAuto(total);
  };

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

    // Cập nhật nút active trên sidebar danh mục nổi bật (Hero)
    const sidebarBtns = document.querySelectorAll('.sidebar-brand-btn');
    sidebarBtns.forEach(btn => {
      if (btn.dataset.brand === brand) {
        btn.classList.add('bg-[#eafff5]', 'text-[#064e29]', 'border', 'border-[#80ffbf]');
        btn.classList.remove('text-slate-700');
      } else {
        btn.classList.remove('bg-[#eafff5]', 'text-[#064e29]', 'border', 'border-[#80ffbf]');
        btn.classList.add('text-slate-700');
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
   * Tạo HTML thẻ sản phẩm chuẩn CellphoneS
   */
  function createProductCardHtml(p, options = {}) {
    const isFlashSale = options.isFlashSale || p.isFlashSale;
    const discountPercent = p.giaGoc > p.donGia 
      ? Math.round((1 - p.donGia / p.giaGoc) * 100) 
      : 0;

    const tonKho = p.tonKho !== undefined ? Number(p.tonKho) : 0;
    const stockHtml = tonKho > 0
      ? `<span class="text-emerald-600 font-semibold"><i class="fa-solid fa-circle-check text-[10px] mr-1"></i>Còn ${tonKho} máy</span>`
      : `<span class="text-rose-500 font-semibold"><i class="fa-solid fa-circle-xmark text-[10px] mr-1"></i>Tạm hết hàng</span>`;

    const bhHtml = (p.thoiHanBaoHanh && p.thoiHanBaoHanh > 0)
      ? `<span class="text-slate-500 text-[11px]"><i class="fa-solid fa-shield text-[10px] mr-0.5 text-blue-600"></i>Bảo hành ${p.thoiHanBaoHanh} tháng</span>`
      : '';

    return `
      <div class="product-card group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 hover:border-[#80ffbf] hover:shadow-xl transition-all duration-300">
        <!-- Badges góc trên -->
        <div class="flex items-center justify-between gap-1 mb-2 z-10">
          <div class="flex flex-wrap gap-1">
            ${p.tenLoai ? `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">${p.tenLoai}</span>` : ''}
          </div>
          ${discountPercent > 0 ? `
            <span class="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-tight">
              Giảm ${discountPercent}%
            </span>` : ''}
        </div>

        <!-- Ảnh sản phẩm -->
        <div class="relative w-full h-40 sm:h-48 my-2 flex items-center justify-center p-2 cursor-pointer overflow-hidden" onclick="(window.CellphoneSProductModal || window.ProductModal).open('${p.maHang}')">
          <img src="${p.anhChinh}" alt="${p.tenHang}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300">
        </div>

        <!-- Tên sản phẩm -->
        <div class="mt-2 flex-1">
          <h3 class="text-xs sm:text-sm font-bold text-navy hover:text-[#064e29] line-clamp-2 cursor-pointer transition-colors" onclick="(window.CellphoneSProductModal || window.ProductModal).open('${p.maHang}')" title="${p.tenHang}">
            ${p.tenHang}
          </h3>

          <!-- Giá bán -->
          <div class="flex flex-wrap items-baseline gap-2 mt-2">
            <span class="text-sm sm:text-base font-extrabold text-[#e11b1e]">${(window.CellphoneSCart || window.Cart) ? (window.CellphoneSCart || window.Cart).formatMoney(p.donGia) : p.donGia}</span>
            ${p.giaGoc > p.donGia ? `<span class="text-[11px] text-slate-400 line-through">${(window.CellphoneSCart || window.Cart).formatMoney(p.giaGoc)}</span>` : ''}
          </div>

          <!-- Tình trạng tồn kho & bảo hành -->
          <div class="mt-2 text-[11px] flex items-center justify-between gap-1">
            ${stockHtml}
            ${bhHtml}
          </div>
        </div>

        <!-- Nút hành động chuẩn W5: "Xem cấu hình" và "Mua ngay" -->
        <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button type="button" onclick="(window.CellphoneSProductModal || window.ProductModal).open('${p.maHang}')" class="flex-1 py-2 px-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors text-center cursor-pointer">
            Xem cấu hình
          </button>
          <button type="button" ${tonKho <= 0 ? 'disabled' : ''} onclick="window.quickBuy('${p.maHang}')" class="flex-1 py-2 px-2 rounded-xl ${tonKho > 0 ? 'bg-[#d70018] hover:bg-[#b80014] text-white cursor-pointer shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} font-bold text-xs transition-colors text-center">
            ${tonKho > 0 ? 'Mua ngay' : 'Hết hàng'}
          </button>
        </div>
      </div>
    `;
  }

  window.quickBuy = function (maHang) {
    if (!(window.CellphoneSData || window.StoreData)) return;
    const p = (window.CellphoneSData || window.StoreData).getProductById(maHang);
    if (!p) return;
    if (p.tonKho <= 0) {
      if (window.CellphoneSCart || window.Cart) {
        (window.CellphoneSCart || window.Cart).showToast('Sản phẩm hiện đang tạm hết hàng!', 'warning');
      }
      return;
    }
    if (window.CellphoneSCart || window.Cart) {
      (window.CellphoneSCart || window.Cart).addItem(p, null, null, 1);
    }
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
            <div class="mt-2 text-[#16A34A] font-semibold cursor-pointer" onclick="window.quickSearchTag('iPhone')">Gợi ý: Tìm "iPhone", "Samsung"</div>
          </div>
        `;
      } else {
        dropdown.innerHTML = `
          <div class="p-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Gợi ý sản phẩm (${results.length})
          </div>
          <div class="divide-y divide-slate-100">
            ${results.map(p => `
              <div class="p-2.5 flex items-center gap-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors" onclick="(window.CellphoneSProductModal || window.ProductModal).open('${p.maHang}'); document.getElementById('search-autocomplete-dropdown').classList.add('hidden');">
                <img src="${p.anhChinh}" class="w-10 h-10 object-contain p-1 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0" alt="${p.tenHang}">
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-bold text-navy truncate">${p.tenHang}</h4>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs font-bold text-rose-600">${(window.CellphoneSCart || window.Cart).formatMoney(p.donGia)}</span>
                    ${p.giaGoc > p.donGia ? `<span class="text-[10px] text-slate-400 line-through">${(window.CellphoneSCart || window.Cart).formatMoney(p.giaGoc)}</span>` : ''}
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
              </div>
            `).join('')}
          </div>
          <div class="p-2 border-t border-slate-100 text-center">
            <button type="button" onclick="window.openSearchModal('${q}')" class="text-xs font-bold text-[#16A34A] hover:text-[#15803D]">
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
      let color = 'text-[#16A34A]';
      if (nh.maNhom === 'NH02') { icon = 'fa-plug'; color = 'text-amber-600'; }
      else if (nh.maNhom === 'NH03') { icon = 'fa-headphones'; color = 'text-blue-600'; }
      else if (nh.maNhom === 'NH04') { icon = 'fa-tablet-screen-button'; color = 'text-indigo-600'; }
      else if (nh.maNhom === 'NH05') { icon = 'fa-clock'; color = 'text-purple-600'; }

      html += `
        <div class="space-y-3">
          <div class="font-bold text-navy text-sm flex items-center gap-2 ${color} border-b border-slate-100 pb-2">
            <i class="fa-solid ${icon}"></i>
            <span>${nh.tenNhom}</span>
          </div>
          <ul class="space-y-2 text-slate-600">
            ${loaiOfNhom.map(l => `
              <li>
                <button type="button" onclick="window.filterByLoaiHang('${l.tenLoai}'); window.toggleMegaMenu();" class="hover:text-[#16A34A] font-semibold text-left">
                  ${l.tenLoai}
                </button>
              </li>
            `).join('')}
            <li>
              <button type="button" onclick="window.filterByNhomHang('${nh.maNhom}'); window.toggleMegaMenu();" class="hover:text-[#16A34A] text-[#16A34A] font-bold">
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
        <div class="font-extrabold text-[#15803D] text-xs uppercase flex items-center gap-1.5">
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
    if (maNhom === 'NH01') {
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
  window.toggleMegaMenu = function () {
    const menu = document.getElementById('mega-menu-flyout');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  };

})();
