/**
 * SAMAMOBILE.COM - HOÀNG HÀ MOBILE CATEGORY CONTROLLER
 * Render động 8 chuyên mục chuẩn 5 phân vùng theo cấu trúc hoangha-categories.json:
 * 1. Header & Breadcrumb (Logo, MegaMenu, Search, Noti, User, Cart + Breadcrumb Trang chủ > [Tên Chuyên Mục])
 * 2. Sidebar Bộ Lọc (Thương hiệu, Khoảng giá có đếm SP, Bộ lọc thông số kỹ thuật đặc thù)
 * 3. Khối Hiển Thị Sản Phẩm (Tabs phân loại nhanh, Dải Hot Search Brands, Thanh sắp xếp, Lưới 4 cột, Nút Xem thêm)
 *    - Thẻ SP: Ảnh có Spec Badges nổi góc phải, Tên 2 dòng, Khối giá 3 tầng, Ưu đãi Ngân hàng/Trả góp 0%, Sẵn hàng + Giỏ đỏ
 * 4. Khối Bài Viết Tư Vấn SEO (Tiêu đề, Mục lục nội dung Index 1, 2, 3..., Bài viết tư vấn so sánh)
 * 5. Widget Tin Tức Công Nghệ (4 tin tức mới nhất từ related_news)
 */

(function () {
  'use strict';
  // Helper chuẩn hóa đường dẫn tài nguyên (tương thích cả khi chạy từ / hoặc /pages/)
  function resolveAssetPath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('//')) {
      return path;
    }
    const clean = path.replace(/^\.\.\//, '').replace(/^\//, '');
    const isInsidePages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    return isInsidePages ? ('../' + clean) : clean;
  }

  // Tải JSON an toàn qua nhiều ứng viên đường dẫn (tránh 404 tuyệt đối)
  async function fetchJsonSafely(relPath) {
    const clean = relPath.replace(/^\.\.\//, '').replace(/^\//, '');
    const candidates = [
      resolveAssetPath(clean),
      '../' + clean,
      clean,
      './' + clean,
      '../../' + clean,
      '/frontend/' + clean
    ];
    const unique = [...new Set(candidates)];
    for (const url of unique) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {}
    }
    return null;
  }


  // 8 Category IDs chuẩn từ hoangha-categories.json:
  // 'dien-thoai', 'tablet', 'laptop', 'man-hinh', 'dieu-hoa-may-lanh', 'dong-ho-thong-minh', 'am-thanh', 'phu-kien'
  var currentCategory = 'dien-thoai';
  var currentSubCategory = '';
  var selectedBrand = 'all';
  var selectedPriceRange = 'all';
  var selectedSpecs = {}; // { ram: '8GB', screen_size: '15.6 inch', ... }
  var currentSort = 'default';
  var allProducts = [];
  var filteredProducts = [];
  var visibleCount = 16;
  var searchQuery = '';

  var hoanghaCategoriesData = null;
  var activeCategoryObj = null;

  // Category Banner Map
  var CATEGORY_BANNERS = {
    'dien-thoai': 'images/banner/471331_S26-Series-1200x375.jpg',
    'tablet': 'images/banner/960301_samsung-festival-web.jpg',
    'laptop': 'images/banner/iphone-18-web-082925157.jpg',
    'man-hinh': 'images/banner/iphone-18-web-082925157.jpg',
    'dieu-hoa-may-lanh': 'images/banner/banner-samsung-tulanh.png',
    'dong-ho-thong-minh': 'images/banner/666649_KV-HUAWEI-WATCH-GT-7-Series-1200x375.jpg',
    'am-thanh': 'images/banner/banner-loa-sony-1.png',
    'phu-kien': 'images/banner/860851_OPPO-Find-X10-Series-web.jpg'
  };

  // Brand Logo Mapping Dictionary
  var BRAND_LOGOS = {
    'apple': 'images/brands/apple.png',
    'apple (iphone)': 'images/brands/apple.png',
    'apple ipad': 'images/brands/apple.png',
    'apple (macbook)': 'images/brands/apple.png',
    'apple watch': 'images/brands/apple-watch.png',
    'apple (airpods)': 'images/brands/apple.png',
    'samsung': 'images/brands/samsung.png',
    'samsung tab': 'images/brands/samsung.png',
    'samsung galaxy tab': 'images/brands/samsung.png',
    'samsung galaxy watch': 'images/brands/samsung.png',
    'xiaomi': 'images/brands/mi.png',
    'xiaomi pad': 'images/brands/mi.png',
    'xiaomi band': 'images/brands/mi.png',
    'tecno': 'images/brands/tecno.png',
    'oppo': 'images/brands/oppo.png',
    'oppo pad': 'images/brands/oppo.png',
    'honor': 'images/brands/honor.png',
    'philips': 'images/brands/philips.png',
    'vivo': 'images/brands/vivo.png',
    'realme': 'images/brands/realme.svg',
    'nokia': 'images/brands/nokia.png',
    'nokia tab': 'images/brands/nokia.png',
    'itel': 'images/brands/itel.png',
    'masstel': 'images/brands/masstel.png',
    'masstel tab': 'images/brands/masstel.png',
    'asus': 'images/brands/asus.png',
    'dell': 'images/brands/dell.png',
    'hp': 'images/brands/hp.png',
    'lenovo': 'images/brands/lenovo.png',
    'lenovo tab': 'images/brands/lenovo.png',
    'acer': 'images/brands/acer.png',
    'msi': 'images/brands/msi.png',
    'gigabyte': 'images/brands/gigabyte.png',
    'lg': 'images/brands/lg.png',
    'viewsonic': 'images/brands/viewsonic.png',
    'aoc': 'images/brands/aoc.png',
    'daikin': 'images/brands/daikin.png',
    'panasonic': 'images/brands/panasonic.png',
    'casper': 'images/brands/casper.png',
    'funiki': 'images/brands/funiki.png',
    'gree': 'images/brands/gree.svg',
    'midea': 'images/brands/midea.png',
    'garmin': 'images/brands/garmin.png',
    'huawei': 'images/brands/huawei.png',
    'huawei matepad': 'images/brands/huawei.png',
    'huawei watch': 'images/brands/huawei.png',
    'amazfit': 'images/brands/amazfit.png',
    'kieslect': 'images/brands/kieslect.png',
    'sony': 'images/brands/sony.png',
    'jbl': 'images/brands/jbl.png',
    'marshall': 'images/brands/marshall.png',
    'harman kardon': 'images/brands/harman-kardon.png',
    'sennheiser': 'images/brands/sennheiser.png',
    'edifier': 'images/brands/edifier.png',
    'anker': 'images/brands/anker.png',
    'ugreen': 'images/brands/ugreen.svg',
    'baseus': 'images/brands/baseus.png',
    'pisen': 'images/brands/pisen.svg',
    'innostyle': 'images/brands/innostyle.svg',
    'spigen': 'images/brands/spigen.svg',
    'uag': 'images/brands/uag.svg',
    'ezviz': 'images/brands/ezviz.png',
    'imou': 'images/brands/imou.png',
    'imou (camera)': 'images/brands/imou.png',
    'clair': 'images/brands/clair.png',
    'tp-link': 'images/brands/tp-link.png',
    'tapo': 'images/brands/tp-link.png',
    'uniarch': 'images/brands/uniarch.png',
    'mobifone': 'images/brands/viettel.png',
    'dreame': 'images/brands/dreame.png',
    'logitech': 'images/brands/acer.png',
    'dareu': 'images/brands/asus.png',
    'akko': 'images/brands/msi.png',
    'razer': 'images/brands/razer.png',
    'bravus': 'images/brands/abus.png',
    'myclair': 'images/brands/clair.png'
  };

  // Khởi động
  async function init() {
    setupMainHeader();
    await loadCategoriesData();
    resolveCategoryFromUrl();
    renderCategoryHeader();
    renderPriceFilters();
    renderSpecialSpecsFilters();
    renderBrandFilters();
    renderQuickBrandChips();
    await loadCategoryProducts();
    applyFiltersAndSort();
    renderSeoArticleAndNews();
  }

  // Tải dữ liệu hoangha-categories.json an toàn đa nguồn
  async function loadCategoriesData() {
    if (window.HOANGHA_CATEGORIES_DATA && Array.isArray(window.HOANGHA_CATEGORIES_DATA.categories)) {
      hoanghaCategoriesData = window.HOANGHA_CATEGORIES_DATA;
      return;
    }
    try {
      const json = await fetchJsonSafely('data/hoangha-categories.json');
      if (json) {
        hoanghaCategoriesData = json;
      }
    } catch (e) {
      console.warn('Could not load hoangha-categories.json:', e);
    }
  }

  // Thiết lập Header dùng chung chuẩn Hoàng Hà Mobile (SamaMobile)
  function setupMainHeader() {
    window.toggleMegaMenu = function () {
      const menu = document.getElementById('mega-menu-flyout');
      if (menu) menu.classList.toggle('hidden');
    };

    window.toggleNotificationPopover = function () {
      const pop = document.getElementById('notification-popover');
      if (pop) pop.classList.toggle('hidden');
    };

    window.toggleCustomerAvatarMenu = function (e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const pop = document.getElementById('customer-avatar-popover');
      const chev = document.getElementById('customer-avatar-chevron');
      if (!pop) return;
      const isHidden = pop.classList.contains('hidden');
      if (isHidden) {
        pop.classList.remove('hidden');
        if (chev) chev.style.transform = 'rotate(180deg)';
      } else {
        pop.classList.add('hidden');
        if (chev) chev.style.transform = 'rotate(0deg)';
      }
    };

    window.closeCustomerAvatarMenu = function () {
      const pop = document.getElementById('customer-avatar-popover');
      const chev = document.getElementById('customer-avatar-chevron');
      if (pop) pop.classList.add('hidden');
      if (chev) chev.style.transform = 'rotate(0deg)';
    };

    document.addEventListener('click', function (e) {
      const pop = document.getElementById('customer-avatar-popover');
      const btn = document.getElementById('btn-customer-avatar-toggle');
      if (pop && !pop.classList.contains('hidden') && !pop.contains(e.target) && !btn?.contains(e.target)) {
        window.closeCustomerAvatarMenu();
      }

      const notiPop = document.getElementById('notification-popover');
      const notiBtn = document.getElementById('btn-notification-toggle');
      if (notiPop && !notiPop.classList.contains('hidden') && !notiPop.contains(e.target) && !notiBtn?.contains(e.target)) {
        notiPop.classList.add('hidden');
      }
    });

    window.toggleCustomerAvatarMenu = function (e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const pop = document.getElementById('customer-avatar-popover');
      const chev = document.getElementById('customer-avatar-chevron');
      if (!pop) return;
      const isHidden = pop.classList.contains('hidden');
      if (isHidden) {
        pop.classList.remove('hidden');
        if (chev) chev.style.transform = 'rotate(180deg)';
      } else {
        pop.classList.add('hidden');
        if (chev) chev.style.transform = 'rotate(0deg)';
      }
    };

    window.closeCustomerAvatarMenu = function () {
      const pop = document.getElementById('customer-avatar-popover');
      const chev = document.getElementById('customer-avatar-chevron');
      if (pop) pop.classList.add('hidden');
      if (chev) chev.style.transform = 'rotate(0deg)';
    };

    document.addEventListener('click', function (e) {
      const pop = document.getElementById('customer-avatar-popover');
      const btn = document.getElementById('btn-customer-avatar-toggle');
      if (pop && !pop.classList.contains('hidden') && !pop.contains(e.target) && !btn?.contains(e.target)) {
        window.closeCustomerAvatarMenu();
      }

      const notiPop = document.getElementById('notification-popover');
      const notiBtn = document.getElementById('btn-notification-toggle');
      if (notiPop && !notiPop.classList.contains('hidden') && !notiPop.contains(e.target) && !notiBtn?.contains(e.target)) {
        notiPop.classList.add('hidden');
      }
    });

    window.quickSearchTag = function (tag) {
      const input = document.getElementById('search-input');
      if (input) input.value = tag;
      searchQuery = tag;
      applyFiltersAndSort();
    };

    window.filterPhoneBrand = function (brand) {
      currentCategory = 'dien-thoai';
      selectedBrand = brand === 'all' ? 'all' : brand.toLowerCase();
      selectedPriceRange = 'all';
      selectedSpecs = {};
      renderCategoryHeader();
      renderPriceFilters();
      renderSpecialSpecsFilters();
      renderBrandFilters();
      renderQuickBrandChips();
      loadCategoryProducts().then(() => {
        applyFiltersAndSort();
        renderSeoArticleAndNews();
      });
    };

    window.applySearchFilters = function () {
      const input = document.getElementById('search-input');
      searchQuery = input ? input.value.trim() : '';
      applyFiltersAndSort();
    };

    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    const autoDropdown = document.getElementById('search-autocomplete-dropdown');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const val = this.value.trim();
        if (clearBtn) clearBtn.classList.toggle('hidden', !val);

        if (autoDropdown) {
          if (val.length >= 2) {
            const matches = (allProducts || []).filter(p => p.tenHang && p.tenHang.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
            if (matches.length > 0) {
              autoDropdown.innerHTML = matches.map(p => `
                <a href="${(window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/')) ? '' : 'pages/'}product-detail.html?id=${encodeURIComponent(p.maHang || p.id)}" class="flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors">
                  <img src="${resolveAssetPath(p.anhChinh || 'images/default-phone.png')}" class="w-10 h-10 object-contain rounded" onerror="this.src='../images/default-phone.png'" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs sm:text-[13px] font-bold text-slate-900 truncate">${p.tenHang}</p>
                    <p class="text-xs sm:text-[13px] font-black text-[#E11B1E] font-mono mt-0.5">${Number(p.donGia || 0).toLocaleString('vi-VN')} ₫</p>
                  </div>
                </a>
              `).join('');
              autoDropdown.classList.remove('hidden');
            } else {
              autoDropdown.classList.add('hidden');
            }
          } else {
            autoDropdown.classList.add('hidden');
          }
        }
      });

      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.applySearchFilters();
        }
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        clearBtn.classList.add('hidden');
        if (autoDropdown) autoDropdown.classList.add('hidden');
        searchQuery = '';
        applyFiltersAndSort();
        searchInput.focus();
      });
    }

    document.addEventListener('click', function (e) {
      const megaMenu = document.getElementById('mega-menu-flyout');
      const megaBtn = document.getElementById('btn-mega-menu-toggle');
      if (megaMenu && !megaMenu.classList.contains('hidden')) {
        if (!megaMenu.contains(e.target) && !megaBtn?.contains(e.target)) {
          megaMenu.classList.add('hidden');
        }
      }

      const notiPop = document.getElementById('notification-popover');
      const notiBtn = document.getElementById('btn-notification-toggle');
      if (notiPop && !notiPop.classList.contains('hidden')) {
        if (!notiPop.contains(e.target) && !notiBtn?.contains(e.target)) {
          notiPop.classList.add('hidden');
        }
      }

      if (autoDropdown && !autoDropdown.classList.contains('hidden')) {
        if (!autoDropdown.contains(e.target) && !searchInput?.contains(e.target)) {
          autoDropdown.classList.add('hidden');
        }
      }
    });

    try {
      const savedUser = localStorage.getItem('cellphones_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const loginBtn = document.getElementById('btn-header-login');
        const custMenu = document.getElementById('header-customer-menu');
        const staffMenu = document.getElementById('header-staff-menu');

        if (loginBtn) loginBtn.classList.add('hidden');

        if (u.role === 'admin' || u.role === 'staff' || u.vaiTro === 'Nhân viên') {
          if (staffMenu) {
            staffMenu.style.display = 'flex';
            staffMenu.classList.remove('hidden');
          }
          const staffName = document.getElementById('staff-header-name');
          if (staffName) staffName.textContent = u.hoTen || u.name || 'Nhân viên';
        } else {
          if (custMenu) {
            custMenu.style.display = 'flex';
            custMenu.classList.remove('hidden');
          }
          const custName = document.getElementById('customer-header-name');
          if (custName) custName.textContent = u.hoTen || u.name || 'Khách hàng';
        }
      }
    } catch (e) {}

    window.CellphoneSAuth = window.CellphoneSAuth || {
      logout: function () {
        localStorage.removeItem('cellphones_auth_user');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('admin_token');
        window.location.reload();
      }
    };

    window.CellphoneSCustomerPortal = window.CellphoneSCustomerPortal || {
      openLoginModal: function () { const isPages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#login'; },
      openPortal: function () { const isPages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#portal'; }
    };

    window.CellphoneSLookup = window.CellphoneSLookup || {
      openModal: function (tab) { const isPages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#' + tab; },
      openTradeInModal: function () { const isPages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#hero-store'; }
    };
  }

  // Phân giải Category từ URL param và đồng bộ với 8 Category chuẩn
  function resolveCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const rawType = (params.get('type') || params.get('cat') || params.get('category') || '').toLowerCase().trim();

    const categoryMap = {
      'dien-thoai': 'dien-thoai',
      'dienthoai': 'dien-thoai',
      'phone': 'dien-thoai',
      'dien-thoai-di-dong': 'dien-thoai',
      'smartphone': 'dien-thoai',

      'tablet': 'tablet',
      'may-tinh-bang': 'tablet',
      'ipad': 'tablet',
      'tab': 'tablet',

      'laptop': 'laptop',
      'may-tinh-xach-tay': 'laptop',
      'macbook': 'laptop',

      'man-hinh': 'man-hinh',
      'pc': 'man-hinh',
      'monitor': 'man-hinh',
      'man-hinh-may-tinh': 'man-hinh',

      'dieu-hoa-may-lanh': 'dieu-hoa-may-lanh',
      'dieu-hoa': 'dieu-hoa-may-lanh',
      'may-lanh': 'dieu-hoa-may-lanh',
      'dien-may': 'dieu-hoa-may-lanh',
      'air': 'dieu-hoa-may-lanh',
      'purifier': 'dieu-hoa-may-lanh',
      'tivi': 'dieu-hoa-may-lanh',
      'dienmay': 'dieu-hoa-may-lanh',
      'may-loc-khong-khi': 'dieu-hoa-may-lanh',

      'dong-ho-thong-minh': 'dong-ho-thong-minh',
      'dong-ho': 'dong-ho-thong-minh',
      'smartband': 'dong-ho-thong-minh',
      'band': 'dong-ho-thong-minh',
      'smartwatch': 'dong-ho-thong-minh',
      'watch': 'dong-ho-thong-minh',
      'vong-deo-tay': 'dong-ho-thong-minh',

      'am-thanh': 'am-thanh',
      'audio': 'am-thanh',
      'tai-nghe': 'am-thanh',
      'loa': 'am-thanh',
      'thiet-bi-am-thanh': 'am-thanh',
      'headphone': 'am-thanh',
      'speaker': 'am-thanh',

      'phu-kien': 'phu-kien',
      'accessories': 'phu-kien',
      'phukien': 'phu-kien',
      'chuot-ban-phim': 'phu-kien',
      'chuot': 'phu-kien',
      'ban-phim': 'phu-kien',
      'mouse': 'phu-kien',
      'keyboard': 'phu-kien',
      'sac-cap': 'phu-kien',
      'pin-du-phong': 'phu-kien',
      'router': 'phu-kien',
      'network': 'phu-kien',
      'thiet-bi-mang': 'phu-kien',
      'camera': 'phu-kien',
      'smarthome': 'phu-kien',
      'smart-home': 'phu-kien',
      'sim': 'phu-kien',
      'dich-vu-sim': 'phu-kien',
      'linh-kien': 'man-hinh',
      'linhkien': 'man-hinh',
      'computer': 'laptop',
      'may-tinh': 'laptop'
    };

    currentCategory = categoryMap[rawType] || 'dien-thoai';

    const brandParamRaw = (params.get('brand') || '').toLowerCase().trim();
    const catParamRaw = (params.get('cat') || '').toLowerCase().trim();

    // Xác định chuẩn currentSubCategory tương ứng
    if (['camera', 'webcam'].includes(rawType) || ['camera', 'webcam'].includes(catParamRaw) || (['ezviz', 'imou', 'tapo'].some(b => brandParamRaw.includes(b)) && currentCategory === 'phu-kien')) {
      currentCategory = 'phu-kien';
      currentSubCategory = 'camera';
    } else if (['smarthome', 'smart-home', 'network', 'thiet-bi-mang'].includes(rawType) || ['smarthome', 'smart-home', 'network'].includes(catParamRaw)) {
      currentCategory = 'phu-kien';
      currentSubCategory = 'smarthome';
    } else if (['tablet', 'may-tinh-bang', 'ipad', 'tab'].includes(rawType)) {
      currentSubCategory = 'tablet';
    } else if (['dien-thoai', 'dienthoai', 'phone', 'smartphone'].includes(rawType)) {
      currentSubCategory = 'dien-thoai';
    } else if (['man-hinh', 'pc', 'monitor', 'man-hinh-may-tinh'].includes(rawType)) {
      currentSubCategory = 'man-hinh';
    } else if (['laptop', 'may-tinh-xach-tay', 'macbook', 'computer'].includes(rawType)) {
      currentSubCategory = 'laptop';
    } else if (['purifier', 'may-loc-khong-khi', 'dien-may', 'tivi', 'gia-dung', 'dienmay'].includes(rawType)) {
      currentSubCategory = 'purifier';
    } else if (['dieu-hoa', 'may-lanh', 'dieu-hoa-may-lanh', 'air'].includes(rawType)) {
      currentSubCategory = 'dieu-hoa';
    } else if (['smartband', 'vong-deo-tay', 'band'].includes(rawType)) {
      currentSubCategory = 'smartband';
    } else if (['dong-ho-thong-minh', 'smartwatch', 'watch', 'dong-ho'].includes(rawType)) {
      currentSubCategory = 'dong-ho-thong-minh';
    } else if (['loa', 'speaker', 'soundbar'].includes(rawType)) {
      currentSubCategory = 'loa';
    } else if (['tai-nghe', 'headphone', 'earphone', 'am-thanh', 'audio'].includes(rawType)) {
      currentSubCategory = 'tai-nghe';
    } else if (['chuot-ban-phim', 'chuot', 'ban-phim', 'mouse', 'keyboard'].includes(rawType)) {
      currentSubCategory = 'chuot-ban-phim';
    } else if (['sac-cap', 'pin-du-phong', 'phu-kien', 'accessories'].includes(rawType)) {
      currentSubCategory = 'sac-cap';
    } else {
      // Mặc định theo category
      if (currentCategory === 'dieu-hoa-may-lanh') currentSubCategory = 'dieu-hoa';
      else if (currentCategory === 'dong-ho-thong-minh') currentSubCategory = 'dong-ho-thong-minh';
      else if (currentCategory === 'am-thanh') currentSubCategory = 'tai-nghe';
      else if (currentCategory === 'phu-kien') currentSubCategory = 'sac-cap';
      else if (currentCategory === 'tablet') currentSubCategory = 'tablet';
      else if (currentCategory === 'dien-thoai') currentSubCategory = 'dien-thoai';
      else if (currentCategory === 'man-hinh') currentSubCategory = 'man-hinh';
      else if (currentCategory === 'laptop') currentSubCategory = 'laptop';
      else currentSubCategory = 'dien-thoai';
    }

    if (hoanghaCategoriesData && Array.isArray(hoanghaCategoriesData.categories)) {
      activeCategoryObj = hoanghaCategoriesData.categories.find(c => c.id === currentCategory) || hoanghaCategoriesData.categories[0];
    }

    const qParam = params.get('q');
    if (qParam) {
      searchQuery = qParam;
      const sInput = document.getElementById('search-input');
      if (sInput) sInput.value = qParam;
    }

    const brandParam = params.get('brand');
    if (brandParam) {
      selectedBrand = brandParam.toLowerCase();
    }
  }

  // 1. ZONE 1: Render Header, Breadcrumb, Tiêu đề trang & Hero Banner
  function renderCategoryHeader() {
    if (!activeCategoryObj) {
      if (hoanghaCategoriesData && Array.isArray(hoanghaCategoriesData.categories)) {
        activeCategoryObj = hoanghaCategoriesData.categories.find(c => c.id === currentCategory);
      }
    }
    const catName = activeCategoryObj ? activeCategoryObj.name : 'Điện thoại di động';
    document.title = `${catName} - SAMAMOBILE.COM`;

    const bc = document.getElementById('bc-current-cat');
    const title = document.getElementById('category-page-title');
    const desc = document.getElementById('category-page-desc');
    const banner = document.getElementById('category-hero-banner');

    if (bc) bc.textContent = catName;
    if (title) title.textContent = catName;

    // Mô tả sinh động theo từng ngành hàng
    var descText = `Khám phá các sản phẩm ${catName} chính hãng tại hệ thống SamaMobile. Sử dụng bộ lọc thông minh theo thương hiệu, mức giá và thông số kỹ thuật đặc thù để tìm kiếm sản phẩm tối ưu nhu cầu của bạn.`;
    if (activeCategoryObj && activeCategoryObj.seo_content && activeCategoryObj.seo_content.summary) {
      descText = activeCategoryObj.seo_content.summary;
    }
    if (desc) desc.textContent = descText;

    if (banner) {
      banner.src = resolveAssetPath(CATEGORY_BANNERS[currentCategory] || 'images/banner/471331_S26-Series-1200x375.jpg');
    }

    // Cập nhật Subcategory Switcher Tabs (Thích ứng theo từng cặp danh mục)
    updateSubcategorySwitcher();
  }

  // Subcategory Switcher Tabs thích ứng sinh động
  function updateSubcategorySwitcher() {
    const switcher = document.getElementById('subcategory-switcher');
    if (!switcher) return;

    var tabs = [];
    if (currentCategory === 'dien-thoai' || currentCategory === 'tablet') {
      tabs = [
        { label: 'ĐIỆN THOẠI', subType: 'dien-thoai', catId: 'dien-thoai' },
        { label: 'MÁY TÍNH BẢNG (TABLET)', subType: 'tablet', catId: 'tablet' }
      ];
    } else if (currentCategory === 'laptop' || currentCategory === 'man-hinh') {
      tabs = [
        { label: 'LAPTOP CHÍNH HÃNG', subType: 'laptop', catId: 'laptop' },
        { label: 'MÀN HÌNH MÁY TÍNH', subType: 'man-hinh', catId: 'man-hinh' }
      ];
    } else if (currentCategory === 'dieu-hoa-may-lanh') {
      tabs = [
        { label: 'MÁY LẠNH / ĐIỀU HÒA', subType: 'dieu-hoa', catId: 'dieu-hoa-may-lanh' },
        { label: 'ĐIỆN MÁY GIA DỤNG & LỌC KHÍ', subType: 'purifier', catId: 'dieu-hoa-may-lanh' }
      ];
    } else if (currentCategory === 'dong-ho-thong-minh') {
      tabs = [
        { label: 'ĐỒNG HỒ THÔNG MINH', subType: 'dong-ho-thong-minh', catId: 'dong-ho-thong-minh' },
        { label: 'VÒNG ĐEO TAY (SMARTBAND)', subType: 'smartband', catId: 'dong-ho-thong-minh' }
      ];
    } else if (currentCategory === 'am-thanh') {
      tabs = [
        { label: 'TAI NGHE CHÍNH HÃNG', subType: 'tai-nghe', catId: 'am-thanh' },
        { label: 'LOA BLUETOOTH', subType: 'loa', catId: 'am-thanh' }
      ];
    } else if (currentCategory === 'phu-kien') {
      tabs = [
        { label: 'CỦ CÁP / SẠC DỰ PHÒNG', subType: 'sac-cap', catId: 'phu-kien' },
        { label: 'CHUỘT & BÀN PHÍM', subType: 'chuot-ban-phim', catId: 'phu-kien' },
        { label: 'CAMERA AN NINH', subType: 'camera', catId: 'phu-kien' },
        { label: 'SMART HOME & MẠNG', subType: 'smarthome', catId: 'phu-kien' }
      ];
    }

    if (tabs.length > 0) {
      switcher.classList.remove('hidden');
      switcher.className = tabs.length > 2 
        ? 'grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 select-none' 
        : 'grid grid-cols-2 gap-3 select-none';
      switcher.innerHTML = tabs.map((t, idx) => {
        // DUY NHẤT 1 tab được active sáng xanh tại một thời điểm
        const isActive = (t.subType === currentSubCategory) || (!currentSubCategory && idx === 0);
        return `
          <a href="category.html?type=${t.subType}" 
             onclick="event.preventDefault(); window.switchCategorySubTab('${t.subType}', '${t.catId}');" 
             class="py-3 px-3 sm:px-4 rounded-2xl font-black text-xs sm:text-[13px] md:text-sm text-center uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center min-h-[46px] ${isActive ? 'dual-cat-tab-active shadow-md' : 'dual-cat-tab-inactive'}">
            ${t.label}
          </a>
        `;
      }).join('');
    } else {
      switcher.classList.add('hidden');
    }
  }

  // Hàm chuyển tab subcategory mượt mà, đổi màu xanh tức thì
  window.switchCategorySubTab = function(subType, catId) {
    currentCategory = catId;
    currentSubCategory = subType;
    selectedBrand = 'all';
    selectedPriceRange = 'all';
    selectedSpecs = {};

    if (hoanghaCategoriesData && Array.isArray(hoanghaCategoriesData.categories)) {
      activeCategoryObj = hoanghaCategoriesData.categories.find(c => c.id === currentCategory) || hoanghaCategoriesData.categories[0];
    }

    // Cập nhật URL trình duyệt không cần reload
    const newUrl = window.location.pathname + '?type=' + encodeURIComponent(subType);
    window.history.pushState({ type: subType, category: catId }, '', newUrl);

    // Cập nhật giao diện Header & Breadcrumb & Tabs
    renderCategoryHeader();
    renderPriceFilters();
    renderSpecialSpecsFilters();
    renderBrandFilters();
    renderQuickBrandChips();

    // Tải và lọc lại danh sách sản phẩm theo tab
    loadCategoryProducts().then(() => {
      applyFiltersAndSort();
      renderSeoArticleAndNews();
    });
  };

  window.addEventListener('popstate', function() {
    resolveCategoryFromUrl();
    renderCategoryHeader();
    renderPriceFilters();
    renderSpecialSpecsFilters();
    renderBrandFilters();
    renderQuickBrandChips();
    loadCategoryProducts().then(() => {
      applyFiltersAndSort();
      renderSeoArticleAndNews();
    });
  });

  // 2. ZONE 2: Render Bộ Lọc Khoảng Giá (Dynamic Price Ranges with Item Count)
  function renderPriceFilters() {
    const container = document.getElementById('price-filter-list');
    if (!container || !activeCategoryObj || !Array.isArray(activeCategoryObj.price_ranges)) return;

    let html = `
      <label class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
        <span class="flex items-center gap-2.5">
          <input type="radio" name="price-filter" value="all" ${selectedPriceRange === 'all' ? 'checked' : ''} onchange="window.onPriceFilterChange('all')" class="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5">
          <span class="font-bold text-slate-800 text-xs sm:text-sm">Tất cả mức giá</span>
        </span>
      </label>
    `;

    activeCategoryObj.price_ranges.forEach((pr, idx) => {
      const val = `${pr.min || 0}-${pr.max || 999999999}`;
      const isChecked = selectedPriceRange === val;
      html += `
        <label class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <span class="flex items-center gap-2.5">
            <input type="radio" name="price-filter" value="${val}" ${isChecked ? 'checked' : ''} onchange="window.onPriceFilterChange('${val}')" class="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5">
            <span class="text-xs sm:text-sm text-slate-700">${pr.label}</span>
          </span>
          <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">${pr.count || 0}</span>
        </label>
      `;
    });

    container.innerHTML = html;
  }

  // 2. ZONE 2: Render Bộ Lọc Thông Số Kỹ Thuật Đặc Thù Ngành Hàng (Filter Specs)
  function renderSpecialSpecsFilters() {
    const container = document.getElementById('filter-specs-container');
    if (!container) return;

    if (!activeCategoryObj || !activeCategoryObj.filter_specs || Object.keys(activeCategoryObj.filter_specs).length === 0) {
      container.innerHTML = '';
      return;
    }

    const specTitles = {
      ram: 'Dung lượng RAM',
      rom: 'Bộ nhớ trong (ROM)',
      features: 'Tính năng đặc biệt',
      screen_size: 'Kích thước màn hình',
      connectivity: 'Kết nối mạng',
      accessories_support: 'Phụ kiện tương thích',
      cpu: 'Vi xử lý (CPU)',
      gpu: 'Card đồ họa (GPU)',
      refresh_rate: 'Tần số quét',
      usage_type: 'Nhu cầu sử dụng',
      resolution: 'Độ phân giải',
      panel_type: 'Tấm nền hiển thị',
      design: 'Kiểu dáng thiết kế',
      capacity_btu: 'Công suất làm lạnh (BTU)',
      technology: 'Công nghệ tiết kiệm',
      cooling_type: 'Loại điều hòa',
      gas_type: 'Gas làm lạnh',
      special_features: 'Tiện ích nổi bật',
      user_type: 'Phong cách người dùng',
      health_sensors: 'Cảm biến sức khỏe',
      battery_life: 'Thời lượng sử dụng pin',
      device_type: 'Phân loại thiết bị',
      accessory_categories: 'Loại phụ kiện'
    };

    let html = '';
    const specsObj = activeCategoryObj.filter_specs;

    Object.keys(specsObj).forEach(specKey => {
      const title = specTitles[specKey] || specKey.toUpperCase();
      const options = specsObj[specKey] || [];
      const currentSelected = selectedSpecs[specKey] || '';

      html += `
        <div class="border-t border-slate-100 pt-4">
          <label class="block text-xs sm:text-[13px] font-black text-slate-800 uppercase tracking-wide mb-2.5">
            ${title}
          </label>
          <div class="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-0.5">
            ${options.map(opt => {
              const isSelected = currentSelected === opt;
              return `
                <button type="button" onclick="window.onSpecFilterClick('${specKey}', '${encodeURIComponent(opt)}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'}">
                  ${opt}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }


  // Trả về danh sách thương hiệu phù hợp ngữ cảnh danh mục & subcategory
  function getActiveCategoryBrands() {
    if (currentCategory === 'phu-kien') {
      if (currentSubCategory === 'camera') {
        return [
          { name: 'EZVIZ', featured: true },
          { name: 'IMOU', featured: true },
          { name: 'TP-Link', featured: true },
          { name: 'Xiaomi', featured: true },
          { name: 'Uniarch', featured: true },
          { name: 'MobiFone', featured: true }
        ];
      }
      if (currentSubCategory === 'smarthome') {
        return [
          { name: 'Xiaomi', featured: true },
          { name: 'Dreame', featured: true },
          { name: 'Mova', featured: true },
          { name: 'Philips', featured: true },
          { name: 'Bravus', featured: true }
        ];
      }
      if (currentSubCategory === 'chuot-ban-phim') {
        return [
          { name: 'Logitech', featured: true },
          { name: 'DareU', featured: true },
          { name: 'Akko', featured: true },
          { name: 'Razer', featured: true },
          { name: 'Rapoo', featured: true },
          { name: 'Asus', featured: true }
        ];
      }
      return [
        { name: 'Anker', featured: true },
        { name: 'Ugreen', featured: true },
        { name: 'Baseus', featured: true },
        { name: 'Innostyle', featured: false },
        { name: 'Pisen', featured: false },
        { name: 'Spigen', featured: false },
        { name: 'UAG', featured: false }
      ];
    }
    return activeCategoryObj && Array.isArray(activeCategoryObj.brands) ? activeCategoryObj.brands : [];
  }

  // 2. ZONE 2: Render Bộ Lọc Thương Hiệu (2-column Brand Grid)
  function renderBrandFilters() {
    const container = document.getElementById('brands-filter-grid');
    const countEl = document.getElementById('brand-filter-count');
    if (!container || !activeCategoryObj || !Array.isArray(activeCategoryObj.brands)) return;

    if (countEl) countEl.textContent = activeCategoryObj.brands.length;

    container.innerHTML = activeCategoryObj.brands.map(b => {
      const bName = typeof b === 'string' ? b : b.name;
      const bKey = bName.toLowerCase();
      const isSelected = selectedBrand === bKey;
      const rawLogo = BRAND_LOGOS[bKey] || getFallbackBrandLogo(bKey); const logoUrl = rawLogo ? resolveAssetPath(rawLogo) : '';

      return `
        <button type="button" onclick="window.onBrandFilterClick('${bKey}')" class="brand-filter-btn flex items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-semibold'}">
          ${logoUrl ? `<img src="${logoUrl}" alt="${bName}" class="max-h-6 max-w-[85px] object-contain" onerror="this.style.display='none'" />` : ''}
          ${logoUrl ? '' : `<span class="text-xs font-semibold">${bName}</span>`}
        </button>
      `;
    }).join('');
  }

  function getFallbackBrandLogo(brandKey) {
    for (let k in BRAND_LOGOS) {
      if (brandKey.includes(k) || k.includes(brandKey)) {
        return BRAND_LOGOS[k];
      }
    }
    return '';
  }

  // 3. ZONE 3: Render Dải Quick Brand Chips (Hot Search Brands with Scroll Arrows)
  function renderQuickBrandChips() {
    const container = document.getElementById('quick-brand-chips');
    if (!container || !activeCategoryObj || !Array.isArray(activeCategoryObj.brands)) return;

    let html = `
      <div class="flex items-center gap-2.5 w-full">
        <span class="text-xs sm:text-sm font-black text-slate-800 whitespace-nowrap px-1.5 flex-shrink-0">Hot Search:</span>
        <div id="quick-chips-scroll" class="flex-1 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          <button type="button" onclick="window.onBrandFilterClick('all')" class="chip-btn flex-shrink-0 px-5 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center h-9 sm:h-10 shadow-xs ${selectedBrand === 'all' ? 'bg-[#0057B7] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}">
            Tất cả
          </button>
    `;

    html += activeCategoryObj.brands.map(b => {
      const bName = typeof b === 'string' ? b : b.name;
      const bKey = bName.toLowerCase();
      const isSel = selectedBrand === bKey;
      const rawLogo = BRAND_LOGOS[bKey] || getFallbackBrandLogo(bKey); const logoUrl = rawLogo ? resolveAssetPath(rawLogo) : '';

      return `
        <button type="button" onclick="window.onBrandFilterClick('${bKey}')" title="${bName}" class="chip-btn flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center h-9 sm:h-10 shadow-2xs ${isSel ? 'bg-[#0057B7] text-white border border-[#0057B7]' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}">
          ${logoUrl ? `<img src="${logoUrl}" alt="${bName}" class="h-4.5 sm:h-5 max-w-[70px] sm:max-w-[85px] object-contain filter ${isSel ? 'brightness-0 invert' : ''}" onerror="this.style.display='none'" />` : ''}
          ${logoUrl ? '' : `<span>${bName}</span>`}
        </button>
      `;
    }).join('');

    html += `
        </div>
        <div class="hidden sm:flex items-center gap-1.5 flex-shrink-0 pl-1">
          <button type="button" onclick="document.getElementById('quick-chips-scroll')?.scrollBy({left: -240, behavior: 'smooth'})" class="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 text-sm shadow-2xs transition-all cursor-pointer" title="Cuộn trái">
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button type="button" onclick="document.getElementById('quick-chips-scroll')?.scrollBy({left: 240, behavior: 'smooth'})" class="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 text-sm shadow-2xs transition-all cursor-pointer" title="Cuộn phải">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Tải danh sách sản phẩm (Kết hợp sample_products từ JSON và products-meta.json)
  async function loadCategoryProducts() {
    allProducts = [];

    // 1. Nạp sample_products từ hoangha-categories.json trước (có badges đẹp đúng chuẩn)
    if (activeCategoryObj && Array.isArray(activeCategoryObj.sample_products)) {
      activeCategoryObj.sample_products.forEach((sp, idx) => {
        allProducts.push({
          maHang: `SAMPLE-${activeCategoryObj.id}-${idx + 1}`,
          id: `SAMPLE-${activeCategoryObj.id}-${idx + 1}`,
          tenHang: sp.name,
          donGia: sp.sale_price,
          giaGoc: sp.original_price,
          discount_percent: sp.discount_percent,
          member_price: sp.member_price,
          stock_status: sp.stock_status || 'Sẵn hàng',
          image_badges: sp.image_badges || [],
          bank_promo: sp.bank_promo,
          anhChinh: resolveAssetPath(getSampleProductImage(activeCategoryObj.id, idx, sp.name)),
          brand: extractBrandFromName(sp.name)
        });
      });
    }

    // 2. Nạp thêm sản phẩm từ products-meta.json
    try {
      const meta = await fetchJsonSafely('data/products-meta.json');
      if (meta) {
        const matchedMeta = Object.values(meta).filter(p => isProductMatchCategory(p, currentCategory));

        matchedMeta.forEach(p => {
          const price = Number(p.donGia) || 0;
          const oldPrice = Number(p.giaGoc) || Math.round(price * 1.15);
          const memberPrice = Math.round(price * 0.985);
          const pName = p.tenHang || '';

          allProducts.push({
            maHang: p.maHang || p.id,
            id: p.maHang || p.id,
            tenHang: pName,
            donGia: price,
            giaGoc: oldPrice,
            discount_percent: oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0,
            member_price: memberPrice,
            stock_status: 'Sẵn hàng',
            image_badges: extractSpecBadges(p, currentCategory),
            bank_promo: 'TPBank Evo - Giảm đến 500.000đ, trả góp 0% đến 6 tháng',
            anhChinh: resolveAssetPath(p.anhChinh || p.image || 'images/banner/iphone-18-cat-082925094.png'),
            brand: extractBrandFromName(pName) || p.nhanHieu || ''
          });
        });
      }
    } catch (e) {
      console.warn('Could not load products-meta.json:', e);
    }
    // Đảm bảo không bao giờ rỗng sản phẩm nếu products-meta bị lỗi
    if (allProducts.length === 0 && activeCategoryObj) {
      const sampleNames = {
        'tablet': ['iPad Gen 10 10.9 inch (2022) - Wi-Fi 64GB', 'Samsung Galaxy Tab S9 FE 5G - 6GB/128GB', 'Xiaomi Pad 6 8GB/256GB Chính Hãng', 'iPad Air 5 M1 10.9 inch Wi-Fi 64GB', 'iPad Pro M4 11 inch Ultra Retina XDR', 'Lenovo Tab M11 4GB/128GB Kèm Bút', 'Huawei MatePad 11.5 inch PaperMatte', 'Redmi Pad Pro 12.1 inch 8GB/128GB'],
        'laptop': ['MacBook Air 13 M3 2024 - 16GB / 256GB SSD', 'ASUS TUF Gaming F15 FX506HF Core i5', 'Lenovo ThinkPad E14 Gen 5 Core i5', 'Dell Inspiron 15 3520 Core i5 16GB', 'HP Pavilion 15 Core i7 16GB SSD 512GB'],
        'man-hinh': ['Màn hình Gaming ASUS TUF VG249Q3A 24" 180Hz', 'Màn hình Dell UltraSharp U2724D 27" 2K 120Hz', 'Màn hình Samsung ViewFinity S9 27" 5K', 'Màn hình LG UltraGear 27GR75Q-B 2K 165Hz'],
        'am-thanh': ['Apple AirPods 4 Chính Hãng VN/A', 'Loa Marshall Emberton II Bluetooth', 'Tai nghe Sony WH-1000XM5 Chống Ồn', 'Loa JBL Flip 6 Chống Nước IP67'],
        'phu-kien': ['Củ sạc nhanh Anker 511 Nano 3 30W GaN', 'Pin sạc dự phòng Baseus 20000mAh 65W', 'Cáp sạc Type-C to Lightning Ugreen MFi', 'Chuột không dây Logitech MX Master 3S']
      };
      const names = sampleNames[currentCategory] || ['Sản phẩm công nghệ cao cấp SamaMobile'];
      names.forEach((name, idx) => {
        const pPrice = 3000000 + (idx * 2500000);
        allProducts.push({
          maHang: 'SP-CAT-' + currentCategory + '-' + (idx + 1),
          id: 'SP-CAT-' + currentCategory + '-' + (idx + 1),
          tenHang: name,
          donGia: pPrice,
          giaGoc: Math.round(pPrice * 1.18),
          discount_percent: 15,
          member_price: Math.round(pPrice * 0.98),
          stock_status: 'Sẵn hàng',
          image_badges: [],
          bank_promo: 'Hỗ trợ trả góp 0% qua thẻ tín dụng',
          anhChinh: resolveAssetPath(getSampleProductImage(currentCategory, idx, name)),
          brand: extractBrandFromName(name)
        });
      });
    }
  }

  // Khớp sản phẩm từ meta với 8 categories chuẩn
  function isProductMatchCategory(p, catId) {
    const pGroup = (p.tenNhom || p.maNhom || '').toLowerCase();
    const pType = (p.tenLoai || p.maLoai || '').toLowerCase();
    const pName = (p.tenHang || p.name || '').toLowerCase();

    if (catId === 'dien-thoai') {
      if (p.maNhom === 'TABLET' || pGroup.includes('máy tính bảng') || pName.includes('ipad') || pName.includes('galaxy tab')) return false;
      return p.maNhom === 'DIENTHOAI' || pGroup.includes('điện thoại') || pType.includes('điện thoại') || pName.includes('iphone') || pName.includes('galaxy s') || pName.includes('galaxy a') || pName.includes('galaxy z') || pName.includes('nubia') || pName.includes('xiaomi 1') || pName.includes('redmi');
    }
    if (catId === 'tablet') {
      if (p.maNhom === 'LAPTOP' || pGroup.includes('laptop') || pName.includes('laptop') || pName.includes('ideapad') || pName.includes('thinkpad') || pName.includes('trackpad') || pName.includes('macbook') || pName.includes('chuột')) return false;
      if (p.maNhom === 'TABLET' || pGroup.includes('máy tính bảng') || pType.includes('tablet')) return true;
      return pName.includes('ipad') || pName.includes('galaxy tab') || pName.includes('tab s') || pName.includes('tab a') || pName.includes('matepad') || pName.includes('redmi pad') || pName.includes('xiaomi pad') || pName.includes('honor pad') || pName.includes('lenovo tab');
    }
    if (catId === 'laptop') {
      if (pName.includes('màn hình') || pName.includes('monitor') || pName.includes('chuột') || pName.includes('bàn phím') || pName.includes('trackpad')) return false;
      return p.maNhom === 'LAPTOP' || pGroup.includes('laptop') || pName.includes('macbook') || pName.includes('laptop') || pName.includes('vivobook') || pName.includes('zenbook') || pName.includes('thinkpad') || pName.includes('ideapad') || pName.includes('tuf gaming');
    }
    if (catId === 'man-hinh') {
      return pName.includes('màn hình') || pName.includes('monitor') || pName.includes('ultrasharp');
    }
    if (catId === 'dieu-hoa-may-lanh') {
      // Phân tách chuẩn giữa Tab Máy Lạnh và Tab Điện Máy Lọc Khí
      if (currentSubCategory === 'purifier') {
        if (pName.includes('điều hòa') || pName.includes('máy lạnh') || pName.includes('inverter 9.000') || pName.includes('inverter 12.000')) return false;
        return pName.includes('clair') || pName.includes('lọc không khí') || pName.includes('tivi') || pName.includes('hút bụi') || pName.includes('quạt') || pGroup.includes('gia dụng') || pGroup.includes('lọc khí') || pGroup.includes('điện máy');
      }
      if (currentSubCategory === 'dieu-hoa') {
        if (pName.includes('clair') || pName.includes('lọc không khí') || pName.includes('tivi')) return false;
        return pName.includes('điều hòa') || pName.includes('máy lạnh') || pName.includes('inverter') || pName.includes('daikin') || pName.includes('casper') || pName.includes('panasonic');
      }
      return p.maNhom === 'DIENMAY' || pName.includes('điều hòa') || pName.includes('máy lạnh') || pName.includes('clair') || pName.includes('lọc không khí') || pGroup.includes('điện máy');
    }
    if (catId === 'dong-ho-thong-minh') {
      if (currentSubCategory === 'smartband') {
        return pName.includes('band') || pName.includes('vòng đeo tay') || pName.includes('fit');
      }
      if (currentSubCategory === 'dong-ho-thong-minh') {
        if (pName.includes('band') || pName.includes('vòng đeo tay')) return false;
        return p.maNhom === 'DONGHO' || pGroup.includes('đồng hồ') || pName.includes('watch');
      }
      return p.maNhom === 'DONGHO' || pGroup.includes('đồng hồ') || pName.includes('watch') || pName.includes('smart band') || pName.includes('vòng đeo tay');
    }
    if (catId === 'am-thanh') {
      if (currentSubCategory === 'loa') {
        if (pName.includes('tai nghe') || pName.includes('airpods')) return false;
        return pName.includes('loa') || pName.includes('speaker') || pName.includes('soundbar') || pName.includes('emberton');
      }
      if (currentSubCategory === 'tai-nghe') {
        if (pName.includes('loa') && !pName.includes('tai nghe')) return false;
        return pName.includes('tai nghe') || pName.includes('airpods') || pName.includes('earphone') || pName.includes('headphone');
      }
      return p.maNhom === 'AMTHANH' || pGroup.includes('âm thanh') || pName.includes('tai nghe') || pName.includes('loa') || pName.includes('airpods') || pName.includes('emberton');
    }
    if (catId === 'phu-kien') {
      const pBrand = (p.nhanHieu || p.brand || '').toLowerCase();

      if (currentSubCategory === 'camera') {
        return pName.includes('camera') || pName.includes('webcam') || pName.includes('ezviz') || pName.includes('imou') || pName.includes('tapo') || pBrand.includes('ezviz') || pBrand.includes('imou') || pBrand.includes('uniarch');
      }
      if (currentSubCategory === 'smarthome') {
        if (pName.includes('camera') || pName.includes('webcam') || pName.includes('ezviz') || pName.includes('imou')) return false;
        return p.maNhom === 'SMARTHOME' || pGroup.includes('smart') || pName.includes('robot') || pName.includes('khóa cửa') || pName.includes('hút bụi') || pName.includes('ổ cắm') || pName.includes('router') || pName.includes('wi-fi');
      }
      if (currentSubCategory === 'chuot-ban-phim') {
        return pName.includes('chuột') || pName.includes('bàn phím') || pName.includes('mouse') || pName.includes('keyboard');
      }
      if (currentSubCategory === 'sac-cap') {
        if (pName.includes('chuột') || pName.includes('bàn phím') || pName.includes('camera') || pName.includes('robot') || pName.includes('khóa cửa')) return false;
        return pName.includes('củ sạc') || pName.includes('cáp sạc') || pName.includes('sạc dự phòng') || pName.includes('pin dự phòng') || pName.includes('sạc nhanh') || pName.includes('ốp lưng') || pName.includes('cường lực');
      }
      return p.maNhom === 'PHUKIEN' || p.maNhom === 'SMARTHOME' || pGroup.includes('phụ kiện') || pName.includes('camera');
    }
    return false;
  }

  // Trích xuất icon thông số nổi góc phải ảnh theo danh mục (Chip, RAM, Pin, Screen, BTU, Inverter...)
  function extractSpecBadges(p, catId) {
    const badges = [];
    const name = (p.tenHang || '').toLowerCase();
    const specs = p.thongSo || {};

    if (catId === 'dien-thoai') {
      if (name.includes('iphone 18')) badges.push('A20 Pro', '256GB', '6.9"');
      else if (name.includes('s25')) badges.push('Snap 8 Elite', '5000mAh', '256GB');
      else if (name.includes('nubia')) badges.push('Unisoc T8200', '5000mAh', '256GB');
      else {
        if (specs['Vi xử lý']) badges.push(specs['Vi xử lý']);
        if (specs['Bộ nhớ trong']) badges.push(specs['Bộ nhớ trong']);
        if (specs['Dung lượng pin']) badges.push(specs['Dung lượng pin']);
        if (badges.length === 0) badges.push('5000mAh', '128GB', '6.7"');
      }
    } else if (catId === 'tablet') {
      badges.push('10.9 inch Retina', 'Bút Stylus', 'Pin trâu');
    } else if (catId === 'laptop') {
      badges.push('Core i5/M-Series', '16GB RAM', '512GB SSD');
    } else if (catId === 'man-hinh') {
      badges.push('Fast IPS', '180Hz / 1ms', 'FHD/2K');
    } else if (catId === 'dieu-hoa-may-lanh') {
      badges.push('Inverter', 'Gas R32', 'Lọc PM2.5');
    } else if (catId === 'dong-ho-thong-minh') {
      badges.push('AMOLED', 'Pin 14 ngày', 'Đo SpO2');
    } else if (catId === 'am-thanh') {
      badges.push('Chống ồn ANC', 'Pin 30H', 'Spatial Audio');
    } else if (catId === 'phu-kien') {
      badges.push('Sạc nhanh GaN', 'An toàn chuẩn MFi');
    }

    return badges.slice(0, 3);
  }

  function extractBrandFromName(name) {
    const n = name.toLowerCase();
    const brands = ['apple', 'samsung', 'xiaomi', 'oppo', 'honor', 'tecno', 'nubia', 'vivo', 'realme', 'nokia', 'itel', 'masstel', 'asus', 'dell', 'hp', 'lenovo', 'acer', 'msi', 'daikin', 'panasonic', 'casper', 'garmin', 'amazfit', 'jbl', 'marshall', 'sony', 'anker', 'ugreen', 'baseus', 'clair', 'ezviz', 'imou', 'tapo', 'tp-link', 'mobifone', 'uniarch', 'dreame', 'mova', 'logitech', 'dareu', 'akko', 'pisen', 'innostyle', 'spigen', 'uag', 'bravus', 'philips'];
    for (let b of brands) {
      if (n.includes(b)) return b;
    }
    return '';
  }

  function getSampleProductImage(catId, idx, name) {
    const n = name.toLowerCase();
    if (n.includes('s25 ultra')) return 'https://i.hoanghamobile.vn/Uploads/2026/01/22/galaxy-s25-ultra-titan-den-1.png';
    if (n.includes('a57')) return 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png';
    if (n.includes('a27')) return 'https://i.hoanghamobile.vn/Uploads/2026/07/07/back-gold1-171113527.png';
    if (n.includes('a18')) return 'https://i.hoanghamobile.vn/Uploads/2026/08/01/q15a-green-back1-091121733.png';
    if (n.includes('ipad')) return 'https://i.hoanghamobile.vn/Uploads/2022/10/19/ipad-gen-10-silver.png';
    if (n.includes('tab s9')) return 'https://i.hoanghamobile.vn/Uploads/2023/10/04/tab-s9-fe-gray-1.png';
    if (n.includes('macbook')) return 'https://i.hoanghamobile.vn/Uploads/2024/03/05/macbook-air-m3-midnight-1.png';
    if (n.includes('tuf gaming')) return 'https://i.hoanghamobile.vn/Uploads/2023/06/15/asus-tuf-gaming-f15-fx506hf-hn014w-1.png';
    if (n.includes('vg249q3a')) return 'https://i.hoanghamobile.vn/Uploads/2023/11/10/man-hinh-gaming-asus-tuf-vg249q3a-1.png';
    if (n.includes('ultrasharp')) return 'https://i.hoanghamobile.vn/Uploads/2023/12/01/dell-ultrasharp-u2724d-1.png';
    if (n.includes('casper')) return 'https://i.hoanghamobile.vn/Uploads/2024/04/10/dieu-hoa-casper-inverter-tc-09is36-1.png';
    if (n.includes('daikin')) return 'https://i.hoanghamobile.vn/Uploads/2023/05/20/dieu-hoa-daikin-inverter-ftkb35xvmv-1.png';
    if (n.includes('band 9')) return 'https://i.hoanghamobile.vn/Uploads/2024/07/20/xiaomi-smart-band-9-black-1.png';
    if (n.includes('airpods')) return 'https://i.hoanghamobile.vn/Uploads/2024/09/10/airpods-4-1.png';
    if (n.includes('marshall')) return 'https://i.hoanghamobile.vn/Uploads/2022/06/15/marshall-emberton-ii-black-and-brass-1.png';
    if (n.includes('anker')) return 'https://i.hoanghamobile.vn/Uploads/2022/10/05/anker-511-nano-3-30w-a2147-1.png';

    return 'https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png';
  }

  // Lọc và Sắp Xếp Sản Phẩm
  function applyFiltersAndSort() {
    filteredProducts = allProducts.filter(p => {
      // 1. Tìm kiếm từ khóa
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const pName = (p.tenHang || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        if (!pName.includes(q) && !pBrand.includes(q)) return false;
      }

      // 2. Lọc theo Thương hiệu
      if (selectedBrand !== 'all') {
        const pBrand = (p.brand || '').toLowerCase();
        const pName = (p.tenHang || '').toLowerCase();
        const target = selectedBrand.toLowerCase();
        if (!pBrand.includes(target) && !pName.includes(target) && !target.includes(pBrand)) {
          return false;
        }
      }

      // 3. Lọc theo Khoảng giá
      if (selectedPriceRange !== 'all') {
        const parts = selectedPriceRange.split('-');
        if (parts.length === 2) {
          const min = Number(parts[0]) || 0;
          const max = Number(parts[1]) || 999999999;
          const price = Number(p.donGia) || 0;
          if (price < min || price > max) return false;
        }
      }

      // 4. Lọc theo Thông số kỹ thuật đặc thù
      for (let sKey in selectedSpecs) {
        const val = selectedSpecs[sKey];
        if (val) {
          const pName = (p.tenHang || '').toLowerCase();
          const badgesStr = (p.image_badges || []).join(' ').toLowerCase();
          const targetVal = val.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!pName.replace(/[^a-z0-9]/g, '').includes(targetVal) && !badgesStr.replace(/[^a-z0-9]/g, '').includes(targetVal)) {
            return false;
          }
        }
      }

      return true;
    });

    // Sắp xếp
    if (currentSort === 'price-asc') {
      filteredProducts.sort((a, b) => Number(a.donGia) - Number(b.donGia));
    } else if (currentSort === 'price-desc') {
      filteredProducts.sort((a, b) => Number(b.donGia) - Number(a.donGia));
    } else if (currentSort === 'new') {
      filteredProducts.reverse();
    }

    renderProductsGrid();
  }

  // 3. ZONE 3: Render Lưới Sản Phẩm 4 Cột (Chuẩn Cấu Trúc Hoàng Hà Mobile)
  function renderProductsGrid() {
    const grid = document.getElementById('category-products-grid');
    const countDisplay = document.getElementById('product-count-display');
    const loadMoreBtn = document.getElementById('btn-category-load-more');
    const loadMoreText = document.getElementById('load-more-text');
    if (!grid) return;

    if (countDisplay) countDisplay.textContent = filteredProducts.length;

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-box-open text-4xl text-slate-300 mb-2"></i>
          <p class="text-sm font-bold">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          <button type="button" onclick="window.resetCategoryFilters()" class="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
            Xem lại tất cả sản phẩm
          </button>
        </div>
      `;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    const itemsToRender = filteredProducts.slice(0, visibleCount);

    grid.innerHTML = itemsToRender.map(p => {
      const price = Number(p.donGia) || 0;
      const oldPrice = Number(p.giaGoc) || Math.round(price * 1.15);
      const memberPrice = p.member_price || Math.round(price * 0.985);
      const installmentMonth = Math.round(price / 6);
      const discount = p.discount_percent || (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
      const img = resolveAssetPath(p.anhChinh || 'https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png');
      const pId = p.maHang || p.id || 'SP01';
      const badges = p.image_badges || [];
      const bankPromo = p.bank_promo || 'TPBank Evo - Giảm đến 500.000đ, trả góp 0%';

      return `
        <div class="product-card bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer" onclick="window.navigateToDetail('${pId}')">
          
          <div>
            <!-- Khu vực ảnh to rõ có Spec Badges nổi ở góc phải & Discount tag góc trái -->
            <div class="relative h-52 sm:h-56 flex items-center justify-center p-3 mb-2.5 bg-slate-50/50 rounded-xl overflow-hidden">
              
              <!-- Discount Tag góc trái ảnh -->
              ${discount > 0 ? `
                <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#E0052B] text-white font-black text-xs shadow-xs z-10">
                  -${discount}%
                </span>
              ` : ''}

              <!-- Ảnh sản phẩm to rõ nét -->
              <img src="${img}" alt="${p.tenHang}" class="max-w-[155px] max-h-[155px] sm:max-w-[170px] sm:max-h-[170px] object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" onerror="this.onerror=null; this.src='https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png';" />
            </div>

            <!-- Tên sản phẩm 2 dòng cỡ chữ to rõ -->
            <h3 class="text-[14px] sm:text-[15px] font-bold text-slate-900 group-hover:text-[#0057B7] line-clamp-2 leading-snug min-h-[42px] transition-colors" title="${p.tenHang}">
              ${p.tenHang}
            </h3>

            <!-- Khối Giá 3 Tầng Chuẩn Hoàng Hà Mobile: Giá bán lẻ đỏ to, Giá gốc gạch, Dòng Member xanh cyan -->
            <div class="mt-2.5">
              <div class="flex items-baseline gap-2 flex-wrap">
                <span class="text-base sm:text-lg font-black text-[#E0052B] font-mono">
                  ${formatCurrency(price)}
                </span>
                ${oldPrice > price ? `
                  <span class="text-xs sm:text-[13px] text-slate-400 line-through">
                    ${formatCurrency(oldPrice)}
                  </span>
                ` : ''}
              </div>

              <!-- Dòng Trả góp -->
              <div class="mt-1 text-[#0057B7] text-[11px] sm:text-xs font-semibold flex items-center gap-1">
                <i class="fa-solid fa-credit-card text-[10px]"></i>
                <span>Hoặc ${formatCurrency(installmentMonth)} x 6T</span>
              </div>

              <!-- Dải 4 Logo Ngân Hàng Đối Tác Trả Góp (To rõ, có màu sắc thương hiệu nổi bật) -->
              <div class="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 w-full">
                <span class="h-7 sm:h-8 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs hover:border-purple-400 hover:bg-purple-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="TPBank Evo">
                  <img src="${resolveAssetPath('images/brands/tpbank.png')}" alt="TPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-purple-700\'>TPBank</span>'" loading="lazy" />
                </span>
                <span class="h-7 sm:h-8 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs hover:border-emerald-400 hover:bg-emerald-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VPBank">
                  <img src="${resolveAssetPath('images/brands/vpbank.png')}" alt="VPBank" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-emerald-700\'>VPBank</span>'" loading="lazy" />
                </span>
                <span class="h-7 sm:h-8 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs hover:border-blue-400 hover:bg-blue-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="VIB">
                  <img src="${resolveAssetPath('images/brands/vib.png')}" alt="VIB" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.outerHTML='<span class=\'text-[11px] font-black text-blue-700\'>VIB</span>'" loading="lazy" />
                </span>
                <span class="h-7 sm:h-8 bg-teal-50/70 border border-teal-200 rounded-xl shadow-2xs hover:border-teal-400 hover:bg-teal-100/50 hover:shadow-xs transition-all flex items-center justify-center p-1 w-full" title="Trả góp 0%">
                  <img src="${resolveAssetPath('images/brands/icon-2_639047641516424460.png')}" alt="Trả góp 0%" class="h-4 sm:h-4.5 w-auto object-contain max-w-[85%] max-h-full transition-transform group-hover:scale-105" onerror="this.src='${resolveAssetPath('images/brands/homecredit.png')}'" loading="lazy" />
                </span>
              </div>

              <!-- Hộp ưu đãi ngân hàng nổi bật: To rõ, tương phản sắc nét -->
              <div class="text-[11px] text-slate-700 font-semibold line-clamp-2 mt-2 bg-gradient-to-r from-blue-50/60 to-slate-50 p-2 rounded-xl border border-blue-100/80 min-h-[38px] leading-snug flex items-start gap-1.5 shadow-2xs">
                <i class="fa-solid fa-gift text-rose-500 text-xs mt-0.5 flex-shrink-0"></i>
                <span class="flex-1">${bankPromo}</span>
              </div>
            </div>
          </div>

          <!-- Trạng thái "Sẵn hàng" & Nút icon giỏ hàng đỏ mua nhanh -->
          <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs sm:text-[13px] font-bold text-emerald-600 flex items-center gap-1.5">
              <i class="fa-solid fa-circle text-[8px] text-emerald-500"></i> ${p.stock_status || 'Sẵn hàng'}
            </span>
            <button type="button" onclick="event.stopPropagation(); window.quickAddToCart('${pId}')" class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-[#E0052B] text-[#E0052B] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs" title="Thêm vào giỏ hàng">
              <i class="fa-solid fa-cart-shopping text-sm"></i>
            </button>
          </div>

        </div>
      `;
    }).join('');

    if (loadMoreBtn) {
      if (filteredProducts.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-flex';
        const remaining = filteredProducts.length - visibleCount;
        if (loadMoreText) loadMoreText.textContent = `Xem thêm ${remaining} sản phẩm`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  function getSpecIcon(badgeText) {
    const b = (badgeText || '').toLowerCase();
    if (b.includes('snap') || b.includes('exynos') || b.includes('pro') || b.includes('bionic') || b.includes('core') || b.includes('m1') || b.includes('m2') || b.includes('m3') || b.includes('chip') || b.includes('unisoc')) {
      return 'fa-solid fa-microchip';
    }
    if (b.includes('mah') || b.includes('pin') || b.includes('ngày') || b.includes('giờ')) {
      return 'fa-solid fa-battery-full';
    }
    if (b.includes('gb') || b.includes('tb') || b.includes('ssd') || b.includes('ram')) {
      return 'fa-solid fa-hard-drive';
    }
    if (b.includes('inch') || b.includes('"') || b.includes('màn') || b.includes('retina') || b.includes('fhd') || b.includes('2k') || b.includes('oled') || b.includes('ips')) {
      return 'fa-solid fa-mobile-screen-button';
    }
    if (b.includes('btu') || b.includes('lạnh')) {
      return 'fa-solid fa-snowflake';
    }
    if (b.includes('inverter') || b.includes('w') || b.includes('gan')) {
      return 'fa-solid fa-bolt';
    }
    if (b.includes('hz') || b.includes('ms')) {
      return 'fa-solid fa-gauge-high';
    }
    return 'fa-solid fa-circle-check';
  }

  // 4 & 5. ZONE 4 (Khối Bài Viết SEO) & ZONE 5 (Widget Tin Tức Công Nghệ)
  function renderSeoArticleAndNews() {
    if (!activeCategoryObj) return;

    // ZONE 4: Bài viết SEO & Mục lục
    const seoTitleEl = document.getElementById('article-section-title');
    const tocContainer = document.getElementById('article-toc-container');
    const tocList = document.getElementById('article-toc-list');
    const bodyContainer = document.getElementById('article-content-body');

    const seo = activeCategoryObj.seo_content || {};
    const catName = activeCategoryObj.name;

    if (seoTitleEl) {
      seoTitleEl.textContent = seo.title || `Thông tin thêm về ${catName}`;
    }

    if (tocList && Array.isArray(seo.table_of_contents) && seo.table_of_contents.length > 0) {
      tocList.innerHTML = seo.table_of_contents.map((item, idx) => `
        <li><a href="#art-sec-${idx + 1}" class="hover:underline">${item}</a></li>
      `).join('');
      if (tocContainer) tocContainer.classList.remove('hidden');
    }

    if (bodyContainer) {
      const summary = seo.summary || `Sở hữu các thiết bị ${catName} chính hãng tại hệ thống SamaMobile với chính sách giá tốt nhất thị trường, cam kết bảo hành 12-24 tháng 1 đổi 1 và hỗ trợ trả góp 0% lãi suất.`;
      
      bodyContainer.innerHTML = `
        <p id="art-sec-1" class="text-slate-700 leading-relaxed font-medium">
          ${summary}
        </p>

        <div class="relative w-full h-[220px] sm:h-[280px] md:h-[340px] rounded-xl overflow-hidden border border-slate-200 my-4 shadow-2xs bg-slate-900">
          <img src="${resolveAssetPath(CATEGORY_BANNERS[currentCategory] || 'images/banner/471331_S26-Series-1200x375.jpg')}" alt="${catName}" class="w-full h-full object-cover object-center block" style="width: 100% !important; height: 100% !important;" />
        </div>

        <p id="art-sec-2" class="text-slate-700 leading-relaxed">
          Tại <strong>SAMAMOBILE.COM</strong>, quý khách hàng hoàn toàn an tâm khi mua sắm các dòng <strong>${catName}</strong> với 100% nguồn gốc rõ ràng, hóa đơn VAT đầy đủ, áp dụng đặc quyền đổi mới linh hoạt trong 30 ngày nếu phát sinh lỗi kỹ thuật từ nhà sản xuất.
        </p>

        <p id="art-sec-3" class="text-slate-700 leading-relaxed">
          Đặc biệt, hội viên <strong>Sama Member</strong> luôn được hưởng mức chiết khấu độc quyền giảm trực tiếp trên giá bán, kết hợp cùng hàng loạt ưu đãi tài chính từ các đối tác thẻ ngân hàng BIDV, TPBank, VPBank, VIB giúp bạn dễ dàng sở hữu thiết bị mơ ước với chi phí tiết kiệm nhất.
        </p>
      `;
    }

    // ZONE 5: Widget Tin Tức Công Nghệ (4 items từ related_news)
    const newsContainer = document.getElementById('tech-news-widget-container');
    if (newsContainer) {
      const newsItems = (seo.related_news && seo.related_news.length > 0) ? seo.related_news : [
        { title: `Đánh giá chi tiết thế hệ ${catName} mới: Hiệu năng đỉnh cao & Công nghệ AI`, date: 'Hôm nay' },
        { title: `Top 5 mẫu ${catName} đáng mua nhất trong tầm giá tốt hiện nay`, date: '2 ngày trước' },
        { title: `Hướng dẫn sử dụng và tối ưu hiệu suất ${catName} bền bỉ nhất`, date: '1 tuần trước' },
        { title: 'Chính sách bảo hành và hỗ trợ kỹ thuật tại nhà của SamaCare', date: 'Tháng này' }
      ];

      const sampleNewsImgs = [
        resolveAssetPath('images/banner/iphone-18-cat-082925094.png'),
        'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png',
        resolveAssetPath('images/banner/471331_S26-Series-1200x375.jpg'),
        resolveAssetPath('images/banner/iphone-18-web-082925157.jpg')
      ];

      newsContainer.innerHTML = newsItems.slice(0, 4).map((item, idx) => `
        <div class="flex items-center gap-3.5 group cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors" onclick="window.location.href='index.html#news'">
          <img src="${sampleNewsImgs[idx % sampleNewsImgs.length]}" alt="News" class="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl border border-slate-200 flex-shrink-0" onerror="this.src='images/banner/iphone-18-cat-082925094.png';" />
          <div class="min-w-0">
            <h4 class="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
              ${item.title}
            </h4>
            <span class="text-xs text-slate-400 mt-1 block">${item.date || 'Gần đây'}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Window Event Handlers
  window.onBrandFilterClick = function (bKey) {
    if (selectedBrand === bKey) {
      selectedBrand = 'all';
    } else {
      selectedBrand = bKey;
    }
    renderBrandFilters();
    renderQuickBrandChips();
    applyFiltersAndSort();
  };

  window.onPriceFilterChange = function (val) {
    selectedPriceRange = val;
    applyFiltersAndSort();
  };

  window.onSpecFilterClick = function (specKey, optEncoded) {
    const opt = decodeURIComponent(optEncoded);
    if (selectedSpecs[specKey] === opt) {
      delete selectedSpecs[specKey];
    } else {
      selectedSpecs[specKey] = opt;
    }
    renderSpecialSpecsFilters();
    applyFiltersAndSort();
  };

  window.resetCategoryFilters = function () {
    selectedBrand = 'all';
    selectedPriceRange = 'all';
    selectedSpecs = {};
    searchQuery = '';

    const sInput = document.getElementById('search-input');
    if (sInput) sInput.value = '';

    renderPriceFilters();
    renderSpecialSpecsFilters();
    renderBrandFilters();
    renderQuickBrandChips();
    applyFiltersAndSort();
  };

  window.setSortOption = function (opt) {
    currentSort = opt;
    const btns = document.querySelectorAll('.sort-btn');
    btns.forEach(b => {
      b.className = 'sort-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:border-slate-300 font-medium whitespace-nowrap cursor-pointer';
    });
    if (event && event.target) {
      event.target.className = 'sort-btn px-3 py-1.5 rounded-xl border border-blue-600 bg-blue-50 text-blue-700 font-bold whitespace-nowrap cursor-pointer';
    }
    applyFiltersAndSort();
  };

  window.loadMoreCategoryProducts = function () {
    visibleCount += 16;
    renderProductsGrid();
  };

  window.navigateToDetail = function (maHang) {
    if (!maHang) return;
    const item = allProducts.find(p => (p.maHang === maHang || p.id === maHang));
    if (item) {
      try {
        sessionStorage.setItem('current_view_product', JSON.stringify(item));
        if (window.addRecentlyViewed) window.addRecentlyViewed(item);
      } catch (e) {}
    }
    const isPages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    window.location.href = (isPages ? '' : 'pages/') + 'product-detail.html?id=' + encodeURIComponent(maHang);
  };

  window.quickAddToCart = function (maHang) {
    const prod = allProducts.find(p => (p.maHang === maHang || p.id === maHang));
    if (!prod) return;
    const item = {
      maHang: prod.maHang || prod.id,
      tenHang: prod.tenHang,
      donGia: prod.donGia,
      giaGoc: prod.giaGoc || prod.donGia * 1.15,
      hinhAnh: prod.anhChinh || prod.image,
      soLuong: 1,
      mauSac: 'Mặc định',
      phienBan: 'Tiêu chuẩn'
    };
    if (window.CellphoneSCart || window.Cart) {
      (window.CellphoneSCart || window.Cart).addItem(item);
      (window.CellphoneSCart || window.Cart).openDrawer();
    } else {
      alert(`Đã thêm "${prod.tenHang}" vào giỏ hàng!`);
    }
  };

  function formatCurrency(val) {
    if (!val || isNaN(val)) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  }

  // Khởi chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
