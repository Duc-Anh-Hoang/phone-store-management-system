/**
 * TITAN STORE - MAIN CUSTOMER INTERFACE CONTROLLER
 * Điều khiển giao diện khách hàng tham khảo phong cách CellphoneS:
 * - Mega menu 3 tầng (NhomHang -> LoaiHang -> MatHang)
 * - Hero Banner Slider & Quick Tags
 * - 6 Dải sản phẩm: Flash Sale, Điện thoại nổi bật, Hàng mới, Bán chạy, Phụ kiện, Đã xem
 * - Thanh tìm kiếm thông minh với Autocomplete và Bộ lọc nâng cao
 * - Đồng hồ đếm ngược khuyến mãi theo vw_KhuyenMaiTrangThai
 * - Tương thích song ngữ và đồng bộ phiên đăng nhập
 */

(function () {
  'use strict';

  let heroCurrentSlide = 0;
  let heroSlideInterval = null;

  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Khởi tạo dữ liệu
    if (window.TitanStoreData) {
      await window.TitanStoreData.init();
    }

    // 2. Khởi tạo UI Giỏ hàng
    if (window.TitanCart) {
      window.TitanCart.updateUI();
    }

    // 3. Render các thành phần
    renderHeroSlider();
    renderShelves();
    initSearchAutocomplete();
    initCountdownTimers();
    initWelcomePopup();
    initScrollToTop();
    updateAuthHeader();

    // Lắng nghe đăng nhập thay đổi
    window.addEventListener('storage', () => {
      updateAuthHeader();
      if (window.TitanCart) window.TitanCart.updateUI();
    });
  });

  /**
   * Cập nhật Header theo trạng thái Đăng nhập khách hàng / Quản trị
   */
  function updateAuthHeader() {
    const user = window.TitanAuth ? window.TitanAuth.getUser() : null;
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
  function renderHeroSlider() {
    const slidesContainer = document.getElementById('hero-slider-container');
    const dotsContainer = document.getElementById('hero-slider-dots');
    if (!slidesContainer || !window.TitanStoreData) return;

    const slides = (window.TitanStoreData.config && window.TitanStoreData.config.banners)
      ? window.TitanStoreData.config.banners.heroSlides
      : [];

    if (slides.length === 0) return;

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
                <button type="button" onclick="window.TitanProductModal.open('${s.targetMaHang}')" class="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-white">
                  <i class="fa-solid fa-cart-shopping text-emerald-600"></i> ${s.btnText}
                </button>
                <button type="button" onclick="window.TitanLookup.openTradeInModal()" class="px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border border-white/80">
                  <i class="fa-solid fa-arrows-rotate text-emerald-600"></i> Thu cũ đổi mới
                </button>
              </div>
            </div>

            <div class="md:col-span-5 flex justify-center">
              <div class="relative w-48 h-48 sm:w-64 sm:h-64 group cursor-pointer" onclick="window.TitanProductModal.open('${s.targetMaHang}')">
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
    renderFlashSaleShelf();
    renderFeaturedPhonesShelf('all');
    renderNewArrivalsShelf();
    renderBestSellersShelf();
    renderAccessoriesShelf();
    renderRecentlyViewedShelf();
  }

  function renderFlashSaleShelf() {
    const container = document.getElementById('shelf-flash-sale-items');
    if (!container || !window.TitanStoreData) return;

    const items = window.TitanStoreData.getFlashSaleProducts();
    container.innerHTML = items.map(p => createProductCardHtml(p, { isFlashSale: true })).join('');
  }

  function renderFeaturedPhonesShelf(brand = 'all', shouldScroll = false) {
    const container = document.getElementById('shelf-phones-items');
    if (!container || !window.TitanStoreData) return;

    const items = window.TitanStoreData.getFeaturedPhones(brand);
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
        const brandCount = window.TitanStoreData.getProductsByBrand ? window.TitanStoreData.getProductsByBrand(brand).length : items.length;
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
    if (!container || !window.TitanStoreData) return;
    const items = window.TitanStoreData.getNewArrivals();
    container.innerHTML = items.map(p => createProductCardHtml(p)).join('');
  }

  function renderBestSellersShelf() {
    const container = document.getElementById('shelf-bestseller-items');
    if (!container || !window.TitanStoreData) return;
    const items = window.TitanStoreData.getBestSellers();
    container.innerHTML = items.map(p => createProductCardHtml(p)).join('');
  }

  function renderAccessoriesShelf() {
    const container = document.getElementById('shelf-accessories-items');
    if (!container || !window.TitanStoreData) return;
    const items = window.TitanStoreData.getAccessories();
    container.innerHTML = items.map(p => createProductCardHtml(p)).join('');
  }

  function renderRecentlyViewedShelf() {
    const container = document.getElementById('shelf-recent-items');
    const section = document.getElementById('section-recently-viewed');
    if (!container || !window.TitanStoreData) return;

    const items = window.TitanStoreData.getRecentlyViewed();
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

    return `
      <div class="product-card group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 hover:border-[#80ffbf] hover:shadow-xl transition-all duration-300">
        <!-- Badges góc trên -->
        <div class="flex items-center justify-between gap-1 mb-2 z-10">
          <div class="flex flex-wrap gap-1">
            ${p.traGop0 ? `<span class="px-2 py-0.5 rounded-md bg-[#eafff5] text-[#064e29] text-[10px] font-extrabold uppercase border border-[#80ffbf]/40">Trả góp 0%</span>` : ''}
            ${p.isNew ? `<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-200/60">Mới 2026</span>` : ''}
          </div>
          ${discountPercent > 0 ? `
            <span class="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-tight">
              Giảm ${discountPercent}%
            </span>` : ''}
        </div>

        <!-- Ảnh sản phẩm -->
        <div class="relative w-full h-40 sm:h-48 my-2 flex items-center justify-center p-2 cursor-pointer overflow-hidden" onclick="window.TitanProductModal.open('${p.maHang}')">
          <img src="${p.anhChinh}" alt="${p.tenHang}" class="max-w-full max-h-full object-contain group-hover:scale-108 transition-transform duration-300">
        </div>

        <!-- Tên sản phẩm -->
        <div class="mt-2">
          <h3 class="text-xs sm:text-sm font-bold text-navy hover:text-[#064e29] line-clamp-2 cursor-pointer transition-colors" onclick="window.TitanProductModal.open('${p.maHang}')" title="${p.tenHang}">
            ${p.tenHang}
          </h3>

          <!-- Giá bán chuẩn TMĐT -->
          <div class="flex flex-wrap items-baseline gap-2 mt-2">
            <span class="text-sm sm:text-base font-extrabold text-[#e11b1e]">${window.TitanCart ? window.TitanCart.formatMoney(p.donGia) : p.donGia}</span>
            ${p.giaGoc > p.donGia ? `<span class="text-[11px] text-slate-400 line-through">${window.TitanCart.formatMoney(p.giaGoc)}</span>` : ''}
          </div>

          <!-- Tình trạng hàng (Chỉ hiển thị Còn hàng hoặc Tạm hết hàng, không hiển thị số lượng cụ thể và không hiển thị đã bán) -->
          <div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>${p.tonKho > 0 ? `<span class="text-emerald-600 font-semibold"><i class="fa-solid fa-circle-check text-[10px] mr-1"></i>Còn hàng</span>` : '<span class="text-rose-500 font-semibold"><i class="fa-solid fa-circle-xmark text-[10px] mr-1"></i>Tạm hết hàng</span>'}</span>
            ${p.thoiHanBaoHanh ? `<span class="text-slate-400"><i class="fa-solid fa-shield text-[10px] mr-0.5"></i>${p.thoiHanBaoHanh}T BH</span>` : ''}
          </div>
        </div>

        <!-- Nút hành động nhanh -->
        <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button type="button" onclick="window.TitanProductModal.open('${p.maHang}')" class="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#eafff5] hover:text-[#064e29] text-slate-700 font-bold text-xs transition-colors text-center cursor-pointer">
            Chi tiết
          </button>
          <button type="button" onclick="window.TitanCart.addItem(window.TitanStoreData.getProductById('${p.maHang}'), null, null, 1)" class="w-9 h-9 rounded-xl bg-[#eafff5] hover:bg-[#80ffbf] text-[#064e29] hover:text-[#061a0f] flex items-center justify-center transition-colors cursor-pointer shadow-sm" title="Thêm nhanh vào giỏ">
            <i class="fa-solid fa-cart-plus text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }

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

      const results = window.TitanStoreData ? window.TitanStoreData.search(q).slice(0, 5) : [];
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
              <div class="p-2.5 flex items-center gap-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors" onclick="window.TitanProductModal.open('${p.maHang}'); document.getElementById('search-autocomplete-dropdown').classList.add('hidden');">
                <img src="${p.anhChinh}" class="w-10 h-10 object-contain p-1 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0" alt="${p.tenHang}">
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-bold text-navy truncate">${p.tenHang}</h4>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs font-bold text-rose-600">${window.TitanCart.formatMoney(p.donGia)}</span>
                    ${p.giaGoc > p.donGia ? `<span class="text-[10px] text-slate-400 line-through">${window.TitanCart.formatMoney(p.giaGoc)}</span>` : ''}
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

    if (!window.TitanStoreData) return;

    const results = window.TitanStoreData.search(query, {
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
   * Popup chào mừng Flash Sale (Phần A13)
   */
  function initWelcomePopup() {
    const popup = document.getElementById('welcome-flash-popup');
    if (!popup) return;

    const dismissed = sessionStorage.getItem('titan_welcome_popup_dismissed');
    if (!dismissed) {
      setTimeout(() => {
        popup.classList.remove('hidden');
      }, 1500);
    }
  }

  window.closeWelcomePopup = function () {
    const popup = document.getElementById('welcome-flash-popup');
    if (popup) {
      popup.classList.add('hidden');
      sessionStorage.setItem('titan_welcome_popup_dismissed', 'true');
    }
  };

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
   * Mega Menu Toggle (Mobile & Desktop)
   */
  window.toggleMegaMenu = function () {
    const menu = document.getElementById('mega-menu-flyout');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  };

})();
