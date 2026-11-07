/**
 * SAMAMOBILE.COM - PRODUCT DETAIL CONTROLLER
 * Xử lý toàn bộ logic giao diện chi tiết sản phẩm chuẩn Hoàng Hà Mobile / SamaMobile:
 * - Gallery ảnh lớn, Carousel đa góc, Thumbnails tính năng & màu sắc
 * - Thông số nổi bật 4 ô có icon trực quan
 * - Bộ chọn Phiên bản & Màu sắc có checkmark active
 * - Khung giá to rõ, nút Mua ngay, Giỏ hàng, Trả góp 0%
 * - Khối Địa chỉ còn hàng (108 cửa hàng) có bộ lọc tìm kiếm & tỉnh thành
 * - Gói bảo hành mở rộng SamaCare (HCare 6 ô)
 * - Bài viết đánh giá chuyên sâu & Bảng Thông số kỹ thuật chi tiết 2 cột (Zebra table)
 * - Đánh giá & Bình luận (Interactive comments)
 * - Sticky bottom purchase bar tự động xuất hiện khi cuộn
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


  var currentProduct = null;
  var selectedVersion = null;
  var selectedColor = null;
  var allProductsMeta = {};
  var currentGalleryIndex = 0;
  var galleryImages = [];

  // Danh mục 108 chi nhánh của SAMAMOBILE chuẩn Hoàng Hà Mobile (Screenshot 3)
  var STORE_LOCATIONS = [
    { city: 'hanoi', name: '122 Thái Hà, Phường Đống Đa, Hà Nội', phone: '0973790122', stock: true },
    { city: 'hanoi', name: '194 Lê Duẩn, Phường Văn Miếu - Quốc Tử Giám, Hà Nội', phone: '0962066208', stock: true },
    { city: 'hanoi', name: '196 Quang Trung, Phường Hà Đông, Hà Nội', phone: '0375866186', stock: true },
    { city: 'hcm', name: 'Số 215 Lê Văn Việt, Phường Tăng Nhơn Phú, Hồ Chí Minh', phone: '0866356215', stock: true },
    { city: 'thanhhoa', name: '222 Trần Phú, Phường Hạc Thành, Thanh Hóa', phone: '0888203536', stock: true },
    { city: 'haiphong', name: 'Số 258 Đường Tô Hiệu, Phường Lê Chân, Hải Phòng', phone: '0961791516', stock: true },
    { city: 'hanoi', name: '28 Trần Phú, Phường Hà Đông, Hà Nội', phone: '0903202328', stock: true },
    { city: 'hanoi', name: '348 Hồ Tùng Mậu, Phường Cầu Diễn, Hà Nội', phone: '0965868348', stock: true },
    { city: 'hanoi', name: '382 Nguyễn Văn Cừ, Phường Bồ Đề, Hà Nội', phone: '0915963222', stock: true },
    { city: 'hanoi', name: '392 Cầu Giấy, Phường Cầu Giấy, Hà Nội', phone: '0968323399', stock: true },
    { city: 'hcm', name: '241 Lê Văn Việt, Phường Tăng Nhơn Phú B, TP. Thủ Đức, TP.HCM', phone: '18006868', stock: true },
    { city: 'hcm', name: '55 Trần Quang Khải, Phường Tân Định, Quận 1, TP.HCM', phone: '0908889977', stock: true },
    { city: 'hcm', name: '1060 Quang Trung, Phường 8, Gò Vấp, TP.HCM', phone: '0903332211', stock: true },
    { city: 'hcm', name: '347 Hoàng Văn Thụ, Phường 2, Tân Bình, TP.HCM', phone: '0902223344', stock: true },
    { city: 'danang', name: '153 Hàm Nghi, Quận Thanh Khê, Đà Nẵng', phone: '0905556677', stock: true },
    { city: 'danang', name: '580 Điện Biên Phủ, Quận Thanh Khê, Đà Nẵng', phone: '0905123789', stock: true },
    { city: 'cantho', name: '221 Đường 30 Tháng 4, Phường Hưng Lợi, Ninh Kiều, Cần Thơ', phone: '0939998877', stock: true }
  ];

  // Bộ dữ liệu nền sẵn sàng cho các sản phẩm chính (phòng khi không có mạng hoặc chưa nạp json)
  var BUILTIN_PRODUCTS = {
    'MH001': {
      maHang: 'MH001',
      sku: 'IP18PM256TN',
      tenHang: 'iPhone 18 Pro Max 256GB - Chính hãng VN/A',
      nhanHieu: 'Apple',
      tenLoai: 'Điện thoại',
      tenNhom: 'Điện thoại',
      donGia: 38490000,
      giaGoc: 41569000,
      anhChinh: 'images/banner/iphone-18-cat-082925094.png',
      phienBan: [
        { id: 'v_256', dungLuong: '256GB', gia: 38490000, giaGoc: 41569000 },
        { id: 'v_512', dungLuong: '512GB', gia: 42990000, giaGoc: 46990000 },
        { id: 'v_1tb', dungLuong: '1TB', gia: 48990000, giaGoc: 52990000 }
      ],
      mauSac: [
        { id: 'c_titan', ten: 'Titan Tự Nhiên', hex: '#A8A29E', anh: 'images/banner/iphone-18-cat-082925094.png' },
        { id: 'c_sa', ten: 'Titan Sa Mạc', hex: '#D7C4B7', anh: 'images/banner/iphone-18-cat-082925094.png' },
        { id: 'c_den', ten: 'Titan Đen', hex: '#1E293B', anh: 'images/banner/iphone-18-cat-082925094.png' }
      ],
      thongSoNoiBat: {
        'Kích thước màn hình': '6.9\"',
        'Bộ nhớ trong': '256GB',
        'Vi xử lý': 'Apple A20 Pro',
        'Dung lượng pin hiển thị': '4850mAh'
      },
      thongSoChiTiet: {
        'Kích thước': '163 x 77.6 x 8.25 mm',
        'Trọng lượng': '227g',
        'Chuẩn kháng nước/bụi': 'IP68 (độ sâu 6 mét trong 30 phút)',
        'Màn hình': '• Kích thước: 6.9 inch Super Retina XDR OLED<br>• Độ phân giải: 2868 x 1320 pixel, 460 ppi<br>• Tần số quét: ProMotion 120Hz<br>• Độ sáng tối đa: 2000 nit ngoài trời',
        'Vi xử lý': 'Apple A20 Pro (6 nhân CPU, 6 nhân GPU, 16 nhân Neural Engine thế hệ mới)',
        'Hệ điều hành': 'iOS 18 (Apple Intelligence Tiếng Việt)',
        'RAM': '8GB',
        'Bộ nhớ trong': '256GB',
        'Camera sau': '• Góc rộng 48MP Fusion (f/1.78, OIS)<br>• Siêu rộng 48MP (f/2.2)<br>• Telephoto 12MP 5x quang học (f/2.8)',
        'Camera trước': '12MP TrueDepth (f/1.9)',
        'Pin & Sạc': '4850mAh, Sạc nhanh MagSafe 25W, Sạc có dây qua cổng USB-C chuẩn USB 3 (10Gb/s)',
        'Mạng & Kết nối': '5G sub-6 GHz, Wi-Fi 7, Bluetooth 5.3, Thread, NFC, Ultra Wideband thế hệ 2'
      }
    },
    'MH249': {
      maHang: 'MH249',
      sku: 'Z257761280BC',
      tenHang: 'Nubia V80 Max 6GB/128GB - Chính hãng',
      nhanHieu: 'Nubia',
      tenLoai: 'Điện thoại',
      tenNhom: 'Điện thoại',
      donGia: 3890000,
      giaGoc: 4290000,
      anhChinh: 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png',
      phienBan: [
        { id: 'v_4_128', dungLuong: '4GB/128GB', gia: 3590000, giaGoc: 3990000 },
        { id: 'v_6_128', dungLuong: '6GB/128GB', gia: 3890000, giaGoc: 4290000 }
      ],
      mauSac: [
        { id: 'c_bac', ten: 'Bạc', hex: '#E2E8F0', anh: 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png' },
        { id: 'c_den', ten: 'Đen', hex: '#1E293B', anh: 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-den.png' }
      ],
      thongSoNoiBat: {
        'Kích thước màn hình': '6.9\"',
        'Bộ nhớ trong': '128GB',
        'Vi xử lý': 'Unisoc T7280',
        'Dung lượng pin hiển thị': '6000mAh'
      },
      thongSoChiTiet: {
        'Kích thước': '171.55 x 77.75 x 8.3 mm',
        'Trọng lượng': '191g',
        'Chuẩn kháng nước/bụi': 'IP64',
        'Màn hình': '• Kích thước: 6.9 inch<br>• Tấm nền: IPS LCD<br>• Độ phân giải: HD+ (720x1640 pixel)<br>• Tần số quét: 120Hz<br>• Độ sáng: 780 nit',
        'Vi xử lý': 'Unisoc T7250 / T7280 (8 nhân: 2 x 1.8GHz Cortex-A75 & 6 x 1.6GHz Cortex-A55, GPU: Mali-G57 MP1)',
        'Hệ điều hành': 'Android 14',
        'RAM': '6GB (hỗ trợ mở rộng RAM ảo)',
        'Bộ nhớ trong': '128GB',
        'Thẻ nhớ ngoài': 'Hỗ trợ thẻ nhớ MicroSD tối đa 1TB',
        'Camera sau': '• Góc rộng 50MP (f/1.8, PDAF) + 2 ống kính phụ<br>• Quay video: 1080p@30fps',
        'Camera trước': '8MP (f/2.0)',
        'Pin & Sạc': '6000mAh, Sạc nhanh 22.5W',
        'Cổng kết nối': 'Type-C, Jack tai nghe 3.5mm',
        'Mạng & Kết nối': '4G LTE, Wi-Fi 802.11 a/b/g/n/ac 2.4G+5GHz, Bluetooth 5.2, GPS'
      }
    }
  };

  // Khởi tạo trang
  async function init() {
    setupMainHeader();
    setupStickyPurchaseBar();
    setupCommentForm();
    await loadProductsData();
    resolveAndRenderProduct();
  }

  // Thiết lập tính năng Header dùng chung chuẩn Hoàng Hà Mobile
  function setupMainHeader() {
    // 1. Toggle Mega Menu
    window.toggleMegaMenu = function () {
      const menu = document.getElementById('mega-menu-flyout');
      if (menu) menu.classList.toggle('hidden');
    };

    // 2. Toggle Notification Popover
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

    // 3. Quick Search Tags
    window.quickSearchTag = function (tag) {
      window.location.href = 'category.html?q=' + encodeURIComponent(tag);
    };

    // 4. Filter Phone Brand
    window.filterPhoneBrand = function (brand) {
      window.location.href = 'category.html?type=dienthoai&brand=' + encodeURIComponent(brand);
    };

    // 5. Apply Search
    window.applySearchFilters = function () {
      const input = document.getElementById('search-input');
      const val = input ? input.value.trim() : '';
      if (val) {
        window.location.href = 'category.html?q=' + encodeURIComponent(val);
      }
    };

    // 6. Search Input Keydown & Clear button
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    const autoDropdown = document.getElementById('search-autocomplete-dropdown');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const val = this.value.trim();
        if (clearBtn) clearBtn.classList.toggle('hidden', !val);

        if (autoDropdown) {
          if (val.length >= 2) {
            const metaList = Object.values(allProductsMeta || {});
            const matches = metaList.filter(p => p.tenHang && p.tenHang.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
            if (matches.length > 0) {
              autoDropdown.innerHTML = matches.map(p => `
                <a href="product-detail.html?id=${encodeURIComponent(p.maHang || p.id)}" class="flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors">
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
        searchInput.focus();
      });
    }

    // 7. Click outside closes flyouts
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

    // 8. Auth state synchronization
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

    // 9. Global Fallbacks for Lookup & Auth
    window.CellphoneSAuth = window.CellphoneSAuth || {
      logout: function () {
        localStorage.removeItem('cellphones_auth_user');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('admin_token');
        window.location.reload();
      }
    };

    window.CellphoneSCustomerPortal = window.CellphoneSCustomerPortal || {
      openLoginModal: function () { const isPages = window.location.pathname.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#login'; },
      openPortal: function () { const isPages = window.location.pathname.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#portal'; }
    };

    window.CellphoneSLookup = window.CellphoneSLookup || {
      openModal: function (tab) { const isPages = window.location.pathname.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#' + tab; },
      openTradeInModal: function () { const isPages = window.location.pathname.includes('/pages/'); window.location.href = (isPages ? '../' : '') + 'index.html#hero-store'; }
    };
  }

  // Tải dữ liệu từ products-meta.json an toàn đa nguồn
  async function loadProductsData() {
    try {
      const data = await fetchJsonSafely('data/products-meta.json');
      if (data) {
        allProductsMeta = data;
      }
    } catch (e) {
      console.warn('Could not load products-meta.json, using built-in data', e);
    }
  }

  // Lấy ID sản phẩm từ URL (hỗ trợ ?id=, ?maHang=, ?slug=)
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Tìm và hiển thị sản phẩm
  function resolveAndRenderProduct() {
    const id = getQueryParam('id') || getQueryParam('maHang');
    const slug = getQueryParam('slug');

    let prod = null;

    // 1. Kiểm tra chính xác theo ID trong allProductsMeta hoặc BUILTIN_PRODUCTS
    if (id && allProductsMeta[id]) {
      prod = allProductsMeta[id];
    } else if (id && BUILTIN_PRODUCTS[id]) {
      prod = BUILTIN_PRODUCTS[id];
    }

    // 2. Kiểm tra trong sessionStorage xem có thông tin sản phẩm vừa bấm vào không
    if (!prod) {
      try {
        const stored = sessionStorage.getItem('current_view_product');
        if (stored) {
          const item = JSON.parse(stored);
          if (item && (!id || item.id === id || item.maHang === id)) {
            prod = item.rawProduct || item;
            if (!prod.tenHang && prod.name) prod.tenHang = prod.name;
            if (!prod.donGia && prod.price) prod.donGia = prod.price;
            if (!prod.giaGoc && prod.oldPrice) prod.giaGoc = prod.oldPrice;
            if (!prod.anhChinh && prod.image) prod.anhChinh = prod.image;
            if (!prod.maHang && prod.id) prod.maHang = prod.id;
          }
        }
      } catch (e) {}
    }

    // 3. Tìm theo slug hoặc maHang
    if (!prod && slug) {
      prod = Object.values(allProductsMeta).find(p => p.slug && p.slug.includes(slug));
    } else if (!prod && id) {
      prod = Object.values(allProductsMeta).find(p => p.maHang === id || p.id === id);
    }

    // 4. Mặc định ưu tiên MH249 (Nubia V80 Max) hoặc MH001 (iPhone 18 Pro Max)
    if (!prod) {
      prod = allProductsMeta['MH249'] || BUILTIN_PRODUCTS['MH249'] || BUILTIN_PRODUCTS['MH001'];
    }

    currentProduct = normalizeProduct(prod);
    renderProductDetail(currentProduct);
  }

  function normalizeProduct(p) {
    const donGia = Number(p.donGia) || 3890000;
    const giaGoc = Number(p.giaGoc) || Math.round(donGia * 1.15);
    const anh = resolveAssetPath(p.anhChinh || p.image || 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png');

    // Đảm bảo có danh sách phiên bản đầy đủ
    let phienBan = p.phienBan && p.phienBan.length > 0 ? p.phienBan : [];
    if (phienBan.length === 0) {
      if (p.tenHang && p.tenHang.toLowerCase().includes('nubia')) {
        phienBan = [
          { id: 'v_4_128', dungLuong: '4GB/128GB', gia: 3590000, giaGoc: 3990000 },
          { id: 'v_6_128', dungLuong: '6GB/128GB', gia: 3890000, giaGoc: 4290000 }
        ];
      } else if (p.tenHang && p.tenHang.toLowerCase().includes('iphone')) {
        phienBan = [
          { id: 'v_256', dungLuong: '256GB', gia: donGia, giaGoc: giaGoc },
          { id: 'v_512', dungLuong: '512GB', gia: Math.round(donGia * 1.12), giaGoc: Math.round(giaGoc * 1.12) }
        ];
      } else {
        phienBan = [
          { id: 'v_std', dungLuong: 'Tiêu chuẩn', gia: donGia, giaGoc: giaGoc }
        ];
      }
    }

    // Đảm bảo có danh sách màu sắc
    let mauSac = p.mauSac && p.mauSac.length > 0 ? p.mauSac : [];
    if (mauSac.length === 0) {
      if (p.tenHang && p.tenHang.toLowerCase().includes('nubia')) {
        mauSac = [
          { id: 'c_bac', ten: 'Bạc', hex: '#E2E8F0', anh: 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png' },
          { id: 'c_den', ten: 'Đen', hex: '#1E293B', anh: 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-den.png' }
        ];
      } else {
        mauSac = [
          { id: 'c1', ten: 'Mặc định', hex: '#3B82F6', anh: anh }
        ];
      }
    }

    // Thông số nổi bật 4 ô có icon
    let thongSoNoiBat = p.thongSoNoiBat || {
      'Kích thước màn hình': '6.9\"',
      'Bộ nhớ trong': '128GB',
      'Vi xử lý': 'Unisoc T7280',
      'Dung lượng pin hiển thị': '6000mAh'
    };

    // Thông số kỹ thuật chi tiết
    let thongSoChiTiet = p.thongSoChiTiet || p.thongSo || {
      'Kích thước': '171.55 x 77.75 x 8.3 mm',
      'Trọng lượng': '191g',
      'Chuẩn kháng nước/bụi': 'IP64',
      'Màn hình': '• Kích thước: 6.9 inch<br>• Tấm nền: IPS LCD<br>• Độ phân giải: HD+ (720x1640 pixel)<br>• Tần số quét: 120Hz<br>• Độ sáng: 780 nit',
      'Vi xử lý': 'Unisoc T7250 / T7280 (8 nhân: 2 x 1.8GHz Cortex-A75 & 6 x 1.6GHz Cortex-A55, GPU: Mali-G57 MP1)',
      'Hệ điều hành': 'Android 14',
      'RAM': '6GB (hỗ trợ RAM mở rộng)',
      'Bộ nhớ trong': '128GB',
      'Thẻ nhớ ngoài': 'Hỗ trợ thẻ nhớ MicroSD tối đa 1TB',
      'Camera sau': '• Góc rộng 50MP (f/1.8, PDAF) + 2 ống kính phụ<br>• Quay video: 1080p@30fps',
      'Camera trước': '8MP (f/2.0)',
      'Pin & Sạc': '6000mAh, Sạc nhanh 22.5W',
      'Cổng kết nối': 'Type-C, Jack tai nghe 3.5mm',
      'Mạng & Kết nối': '4G LTE, Wi-Fi 802.11 a/b/g/n/ac 2.4G+5GHz, Bluetooth 5.2, GPS'
    };

    return {
      maHang: p.maHang || 'SP' + Math.floor(Math.random() * 9000 + 1000),
      sku: p.sku || 'Z257761280BC',
      tenHang: p.tenHang || 'Nubia V80 Max 6GB/128GB - Chính hãng',
      nhanHieu: p.nhanHieu || 'Nubia',
      tenLoai: p.tenLoai || 'Điện thoại',
      tenNhom: p.tenNhom || 'Điện thoại',
      donGia: donGia,
      giaGoc: giaGoc,
      anhChinh: anh,
      mauSac: mauSac,
      phienBan: phienBan,
      thongSoNoiBat: thongSoNoiBat,
      thongSoChiTiet: thongSoChiTiet
    };
  }

  function formatCurrency(val) {
    if (!val || isNaN(val)) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  }

  // Render toàn bộ giao diện sản phẩm
  function renderProductDetail(prod) {
    selectedVersion = prod.phienBan[prod.phienBan.length > 1 ? 1 : 0];
    selectedColor = prod.mauSac[0];

    // Cập nhật title trình duyệt
    document.title = `${prod.tenHang} - SAMAMOBILE.COM`;

    // Lưu vào danh sách Sản phẩm đã xem
    if (window.addRecentlyViewed) {
      window.addRecentlyViewed(prod);
    }

    // 1. Breadcrumbs
    const bcCat = document.getElementById('bc-category');
    const bcProd = document.getElementById('bc-product-name');
    if (bcCat) bcCat.textContent = prod.tenNhom || prod.tenLoai || 'Điện thoại';
    if (bcProd) bcProd.textContent = prod.tenHang;

    // 2. Header Sản Phẩm & SKU
    const titleEl = document.getElementById('product-title');
    const skuEl = document.getElementById('product-sku');
    if (titleEl) titleEl.textContent = prod.tenHang;
    if (skuEl) skuEl.textContent = prod.sku || 'Z257761280BC';

    // Cập nhật tên trong bài viết đánh giá
    const artTitle = document.getElementById('article-product-name');
    if (artTitle) artTitle.textContent = prod.tenHang;

    // 3. Khởi tạo danh sách ảnh Gallery Carousel
    galleryImages = [
      prod.anhChinh,
      'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png',
      'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-den.png',
      'https://i.hoanghamobile.vn/Uploads/2026/01/07/v80-max-bac-1.png',
      'https://i.hoanghamobile.vn/Uploads/2026/01/07/v80-max-bac-2.png',
      'https://i.hoanghamobile.vn/Uploads/2026/01/07/v80-max-bac-3.png',
      'https://i.hoanghamobile.vn/Uploads/2026/01/12/nubia-v80-max-8-128gb-10.jpg',
      'https://i.hoanghamobile.vn/Uploads/2026/01/12/nubia-v80-max-8-128gb-02.jpg'
    ];
    currentGalleryIndex = 0;
    updateGalleryView();

    // 4. Render Thumbnails dưới ảnh chính
    renderGalleryThumbnails(prod);

    // 5. Render Thông Số Nổi Bật (4 Ô Có Icon)
    renderKeySpecsGrid(prod.thongSoNoiBat);

    // 6. Render Bộ Chọn Phiên Bản (Dung Lượng)
    renderVersionSelector(prod);

    // 7. Render Bộ Chọn Màu Sắc
    renderColorSelector(prod);

    // 8. Cập nhật Giá Bán
    updatePriceDisplay();

    // 9. Render Địa Chỉ Còn Hàng (108 Cửa Hàng)
    renderStoreLocations('all', '');

    // 10. Render Bảng Thông Số Chi Tiết (2 Cột Zebra)
    renderDetailedSpecsTable(prod.thongSoChiTiet);

    // 11. Render Bình Luận Mẫu
    renderCommentsThread();

    // 12. Render Sản Phẩm Mua Kèm & Tương Tự
    renderAddons();
    renderSimilarProducts();

    // 13. Đồng bộ Sticky Bottom Bar
    updateStickyBar();
  }

  // Gallery Navigation
  window.prevGalleryImage = function () {
    if (galleryImages.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateGalleryView();
  };

  window.nextGalleryImage = function () {
    if (galleryImages.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    updateGalleryView();
  };

  function updateGalleryView() {
    const mainImg = document.getElementById('main-product-image');
    const badge = document.getElementById('gallery-counter-badge');
    if (mainImg && galleryImages[currentGalleryIndex]) {
      mainImg.src = galleryImages[currentGalleryIndex];
    }
    if (badge) {
      badge.textContent = `${currentGalleryIndex + 1}/${galleryImages.length}`;
    }
  }

  // Thumbnails dưới ảnh chính (Screenshot 2)
  function renderGalleryThumbnails(prod) {
    const container = document.getElementById('gallery-thumbnails');
    if (!container) return;

    const tabs = [
      { id: 't_star', label: 'Tính năng nổi bật', icon: 'fa-solid fa-star', type: 'icon' },
      { id: 't_video', label: 'Video', icon: 'fa-solid fa-circle-play', type: 'icon' },
      { id: 't_c1', label: prod.mauSac[0] ? prod.mauSac[0].ten : 'Bạc', img: prod.mauSac[0] ? prod.mauSac[0].anh : prod.anhChinh, type: 'img' },
      { id: 't_c2', label: prod.mauSac[1] ? prod.mauSac[1].ten : 'Đen', img: prod.mauSac[1] ? prod.mauSac[1].anh : prod.anhChinh, type: 'img' },
      { id: 't_specs', label: 'Thông số kỹ thuật', icon: 'fa-solid fa-gear', type: 'icon' },
      { id: 't_info', label: 'Thông tin sản phẩm', icon: 'fa-solid fa-book-open', type: 'icon' },
      { id: 't_qr', label: 'Xem trên điện thoại', icon: 'fa-solid fa-mobile-screen', type: 'icon' }
    ];

    container.innerHTML = tabs.map((tab, idx) => {
      const activeClass = idx === 0 ? 'border-blue-600 bg-blue-50/70 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300';
      const visual = tab.type === 'icon'
        ? `<i class="${tab.icon} text-lg mb-1"></i>`
        : `<img src="${tab.img}" alt="${tab.label}" class="w-8 h-8 object-contain mb-1" />`;

      return `
        <button type="button" onclick="window.selectThumbnailTab(${idx})" class="thumb-tab flex-shrink-0 w-20 sm:w-22 h-20 sm:h-22 p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${activeClass}">
          ${visual}
          <span class="text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-1">${tab.label}</span>
        </button>
      `;
    }).join('');
  }

  window.selectThumbnailTab = function (idx) {
    const tabs = document.querySelectorAll('.thumb-tab');
    tabs.forEach((t, i) => {
      if (i === idx) {
        t.className = 'thumb-tab flex-shrink-0 w-20 sm:w-22 h-20 sm:h-22 p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer border-blue-600 bg-blue-50/70 text-blue-700';
      } else {
        t.className = 'thumb-tab flex-shrink-0 w-20 sm:w-22 h-20 sm:h-22 p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer border-slate-200 text-slate-600 hover:border-slate-300';
      }
    });

    if (idx === 0 || idx === 1) {
      currentGalleryIndex = 0;
      updateGalleryView();
    } else if (idx === 2) {
      currentGalleryIndex = 1;
      updateGalleryView();
    } else if (idx === 3) {
      currentGalleryIndex = 2;
      updateGalleryView();
    } else if (idx === 4) {
      document.getElementById('detailed-specs-section').scrollIntoView({ behavior: 'smooth' });
    } else if (idx === 6) {
      alert('Quét mã QR để mở trực tiếp trang sản phẩm này trên ứng dụng điện thoại!');
    }
  };

  // Render Thông Số Nổi Bật 4 Ô Có Icon (Screenshot 2)
  function renderKeySpecsGrid(specs) {
    const grid = document.getElementById('key-specs-grid');
    if (!grid) return;

    const specItems = [
      { key: 'Kích thước màn hình', icon: 'fa-solid fa-mobile-screen', val: specs['Kích thước màn hình'] || '6.9\"' },
      { key: 'Bộ nhớ trong', icon: 'fa-solid fa-hard-drive', val: specs['Bộ nhớ trong'] || '128GB' },
      { key: 'Vi xử lý', icon: 'fa-solid fa-microchip', val: specs['Vi xử lý'] || 'Unisoc T7280' },
      { key: 'Dung lượng pin hiển thị', icon: 'fa-solid fa-battery-full', val: specs['Dung lượng pin hiển thị'] || '6000mAh' }
    ];

    grid.innerHTML = specItems.map(item => `
      <div class="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col items-start justify-between min-h-[82px] hover:border-blue-300 transition-colors">
        <div class="text-[11px] text-slate-500 font-medium">${item.key}</div>
        <div class="flex items-center gap-2 mt-1">
          <i class="${item.icon} text-blue-600 text-sm flex-shrink-0"></i>
          <span class="font-black text-slate-900 text-xs sm:text-sm tracking-tight">${item.val}</span>
        </div>
      </div>
    `).join('');
  }

  // Bộ Chọn Phiên Bản (Dung Lượng) có Checkmark Active (Screenshot 2)
  function renderVersionSelector(prod) {
    const container = document.getElementById('product-versions-list');
    if (!container) return;

    container.innerHTML = prod.phienBan.map(v => {
      const isSelected = selectedVersion && selectedVersion.id === v.id;
      return `
        <div class="variant-card relative p-3 sm:p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'selected' : 'border-slate-200 hover:border-blue-300 bg-white'}" onclick="window.selectVersion('${v.id}')">
          <div class="font-extrabold text-xs sm:text-sm text-slate-900">${v.dungLuong}</div>
          <div class="text-xs font-bold text-rose-600 mt-1">${formatCurrency(v.gia)}</div>
          
          <!-- Badge checkmark xanh ở góc dưới phải -->
          <div class="check-badge ${isSelected ? 'flex' : 'hidden'} absolute bottom-0 right-0 w-5 h-5 bg-[#008774] text-white rounded-tl-lg items-center justify-center text-[10px]">
            <i class="fa-solid fa-check"></i>
          </div>
        </div>
      `;
    }).join('');
  }

  window.selectVersion = function (vId) {
    if (!currentProduct) return;
    const v = currentProduct.phienBan.find(item => item.id === vId);
    if (v) {
      selectedVersion = v;
      renderVersionSelector(currentProduct);
      updatePriceDisplay();
      updateStickyBar();
    }
  };

  // Bộ Chọn Màu Sắc Có Thumbnail & Checkmark (Screenshot 2)
  function renderColorSelector(prod) {
    const container = document.getElementById('product-colors-list');
    if (!container) return;

    container.innerHTML = prod.mauSac.map(c => {
      const isSelected = selectedColor && selectedColor.id === c.id;
      return `
        <div class="color-card relative p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${isSelected ? 'selected' : 'border-slate-200 hover:border-blue-300 bg-white'}" onclick="window.selectColor('${c.id}')">
          <img src="${c.anh}" alt="${c.ten}" class="w-8 h-8 object-contain rounded-md" />
          <div class="font-bold text-xs sm:text-sm text-slate-900">${c.ten}</div>
          
          <div class="check-badge ${isSelected ? 'flex' : 'hidden'} absolute bottom-0 right-0 w-5 h-5 bg-[#008774] text-white rounded-tl-lg items-center justify-center text-[10px]">
            <i class="fa-solid fa-check"></i>
          </div>
        </div>
      `;
    }).join('');
  }

  window.selectColor = function (cId) {
    if (!currentProduct) return;
    const c = currentProduct.mauSac.find(item => item.id === cId);
    if (c) {
      selectedColor = c;
      renderColorSelector(currentProduct);
      const mainImg = document.getElementById('main-product-image');
      if (mainImg) mainImg.src = c.anh;
      updateStickyBar();
    }
  };

  // Cập nhật giá bán to rõ
  function updatePriceDisplay() {
    const priceEl = document.getElementById('product-sale-price');
    const oldPriceEl = document.getElementById('product-original-price');
    const discountEl = document.getElementById('product-discount-badge');

    const currentPrice = selectedVersion ? selectedVersion.gia : currentProduct.donGia;
    const currentOldPrice = selectedVersion ? selectedVersion.giaGoc : currentProduct.giaGoc;

    if (priceEl) priceEl.textContent = formatCurrency(currentPrice);
    if (oldPriceEl) oldPriceEl.textContent = formatCurrency(currentOldPrice);

    if (discountEl && currentOldPrice > currentPrice) {
      const percent = Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100);
      discountEl.textContent = `-${percent}%`;
      discountEl.classList.remove('hidden');
    } else if (discountEl) {
      discountEl.classList.add('hidden');
    }
  }

  // Render Danh Sách Cửa Hàng (108 Cửa Hàng - Screenshot 3)
  function renderStoreLocations(city, query) {
    const container = document.getElementById('store-list-container');
    const countEl = document.getElementById('store-count-number');
    if (!container) return;

    let filtered = STORE_LOCATIONS;
    if (city && city !== 'all') {
      filtered = filtered.filter(s => s.city === city);
    }
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.phone.includes(q));
    }

    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-500 text-xs">
          Không tìm thấy chi nhánh nào phù hợp với từ khóa "${query}".
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(store => `
      <div class="p-3 sm:p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div class="font-bold text-slate-900 text-xs sm:text-sm leading-snug">${store.name}</div>
          <div class="flex items-center gap-2 mt-1.5">
            <a href="tel:${store.phone}" class="px-2.5 py-1 rounded-md bg-[#008774] hover:bg-teal-700 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors">
              <i class="fa-solid fa-phone text-[10px]"></i> ${store.phone}
            </a>
            <button type="button" onclick="alert('Địa chỉ chi tiết: ${store.name}. Giờ mở cửa: 08:00 - 21:30 hàng ngày.')" class="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition-colors cursor-pointer">
              Xem chi tiết
            </button>
          </div>
        </div>

        <div class="flex items-center gap-1.5 text-[#008774] text-xs font-bold self-start sm:self-center">
          <i class="fa-solid fa-circle-dot text-[10px]"></i> Đang sẵn hàng
        </div>
      </div>
    `).join('');
  }

  window.filterStoreLocations = function () {
    const city = document.getElementById('store-filter-city').value;
    const query = document.getElementById('store-filter-search').value;
    renderStoreLocations(city, query);
  };

  // Render Bảng Thông Số Chi Tiết (Screenshot 5 Chuẩn 2 Cột Zebra)
  function renderDetailedSpecsTable(specs) {
    const tbody = document.getElementById('detailed-specs-tbody');
    if (!tbody) return;

    const entries = Object.entries(specs);
    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="2" class="p-4 text-center text-slate-500 text-xs">Đang cập nhật thông số chi tiết...</td></tr>`;
      return;
    }

    tbody.innerHTML = entries.map(([key, val]) => `
      <tr>
        <td class="align-top">${key}</td>
        <td class="text-slate-700 align-top">${val}</td>
      </tr>
    `).join('');
  }

  // Render Luồng Bình Luận Mẫu
  function renderCommentsThread() {
    const container = document.getElementById('comments-thread-container');
    if (!container) return;

    container.innerHTML = `
      <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">NH</div>
            <div>
              <div class="font-bold text-xs sm:text-sm text-slate-900">Nguyễn Huy</div>
              <div class="text-[10px] text-slate-400">2 ngày trước</div>
            </div>
          </div>
          <div class="text-amber-400 text-xs flex gap-0.5">
            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
          </div>
        </div>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Máy pin trâu thực sự, lướt web cả ngày chỉ hết hơn 40% pin. Màn hình to 6.9 inch xem phim cực đã mắt. Đóng gói cẩn thận, giao hàng siêu nhanh trong 2 giờ!
        </p>
        
        <!-- Phản hồi Quản trị viên (QTV) -->
        <div class="ml-4 sm:ml-6 p-3 bg-white rounded-xl border border-blue-100 space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">QTV</span>
            <span class="font-bold text-xs text-blue-900">SamaMobile Chăm Sóc Khách Hàng</span>
            <span class="text-[10px] text-slate-400">• 1 ngày trước</span>
          </div>
          <p class="text-xs text-slate-600">
            Dạ SamaMobile xin chào anh Huy! Cảm ơn anh đã luôn tin tưởng và ủng hộ sản phẩm tại SamaMobile. Chúc anh có những trải nghiệm thật tuyệt vời cùng máy ạ!
          </p>
        </div>
      </div>
    `;
  }

  // Render Sản Phẩm Mua Kèm
  function renderAddons() {
    const container = document.getElementById('addons-container');
    if (!container) return;

    const addons = [
      { id: 'ADD-01', name: 'Củ sạc nhanh 30W Type-C SamaFast', price: 290000, img: resolveAssetPath('images/banner/iphone-18-cat-082925094.png') },
      { id: 'ADD-02', name: 'Tai nghe Bluetooth không dây TWS-09', price: 390000, img: resolveAssetPath('images/products/airpods-pro-3.png') },
      { id: 'ADD-03', name: 'Kính cường lực Full viền 9H chống va đập', price: 90000, img: 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png' }
    ];

    container.innerHTML = addons.map(item => `
      <div class="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors flex items-center justify-between gap-3">
        <img src="${item.img}" alt="${item.name}" class="w-11 h-11 object-contain rounded-lg flex-shrink-0" />
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold text-slate-800 line-clamp-1">${item.name}</div>
          <div class="text-xs font-black text-rose-600 mt-0.5">${formatCurrency(item.price)}</div>
        </div>
        <button type="button" onclick="alert('Đã thêm phụ kiện ${item.name} vào đơn hàng!')" class="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 flex-shrink-0 cursor-pointer">
          + Thêm
        </button>
      </div>
    `).join('');
  }

  // Render Sản Phẩm Tương Tự
  function renderSimilarProducts() {
    const grid = document.getElementById('similar-products-grid');
    if (!grid) return;

    const items = [
      { id: 'MH108', name: 'Samsung Galaxy A08 4GB/64GB', price: 4490000, oldPrice: 4890000, img: resolveAssetPath('images/products/phone-mh108.png') },
      { id: 'MH109', name: 'Samsung Galaxy A18 6GB/128GB', price: 6690000, oldPrice: 7190000, img: resolveAssetPath('images/products/phone-mh109.png') },
      { id: 'MH104', name: 'Nubia Air 5G 8GB/256GB', price: 5490000, oldPrice: 5990000, img: 'https://i.hoanghamobile.vn/Uploads/2026/07/07/back-gold1-171113527.png' },
      { id: 'MH112', name: 'Xiaomi Redmi Note 17 6GB/128GB', price: 4890000, oldPrice: 5290000, img: resolveAssetPath('images/products/phone-mh112.png') },
      { id: 'MH114', name: 'OPPO A68 5G 8GB/128GB', price: 5690000, oldPrice: 6190000, img: resolveAssetPath('images/products/phone-mh114.png') }
    ];

    grid.innerHTML = items.map(p => `
      <div class="bg-white rounded-2xl border border-slate-200/90 p-3 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group" onclick="window.location.href='product-detail.html?id=${p.id}'">
        <div class="relative w-full aspect-square flex items-center justify-center p-2 mb-2">
          <img src="${p.img}" alt="${p.name}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
          <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-bold text-[9px]">-8%</span>
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">${p.name}</h4>
          <div class="text-xs sm:text-sm font-black text-rose-600 mt-1">${formatCurrency(p.price)}</div>
          <div class="text-[10px] text-slate-400 line-through">${formatCurrency(p.oldPrice)}</div>
        </div>
      </div>
    `).join('');
  }

  // Đồng bộ Sticky Bottom Bar (Screenshots 2, 3, 4, 5)
  function updateStickyBar() {
    if (!currentProduct) return;
    const thumb = document.getElementById('sticky-bar-thumb');
    const title = document.getElementById('sticky-bar-title');
    const variant = document.getElementById('sticky-bar-variant');
    const price = document.getElementById('sticky-bar-price');

    const curPrice = selectedVersion ? selectedVersion.gia : currentProduct.donGia;
    const verText = selectedVersion ? selectedVersion.dungLuong : 'Tiêu chuẩn';
    const colText = selectedColor ? selectedColor.ten : 'Bạc';

    if (thumb) thumb.src = selectedColor ? selectedColor.anh : currentProduct.anhChinh;
    if (title) title.textContent = currentProduct.tenHang;
    if (variant) variant.textContent = `Phân loại: ${colText} - ${verText}`;
    if (price) price.textContent = formatCurrency(curPrice);
  }

  function setupStickyPurchaseBar() {
    const bar = document.getElementById('sticky-purchase-bar');
    if (!bar) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 450) {
        bar.classList.remove('translate-y-full');
      } else {
        bar.classList.add('translate-y-full');
      }
    });
  }

  function setupCommentForm() {
    const btn = document.getElementById('btn-submit-comment');
    const input = document.getElementById('comment-input');
    if (btn && input) {
      btn.addEventListener('click', function () {
        const val = input.value.trim();
        if (!val) {
          alert('Vui lòng nhập nội dung đánh giá của bạn.');
          return;
        }
        alert('Cảm ơn bạn đã gửi đánh giá! Bình luận sẽ được Quản trị viên xét duyệt và hiển thị sau ít phút.');
        input.value = '';
      });
    }
  }

  // Mua Ngay & Thêm Giỏ Hàng
  window.handleMainBuyNow = function () {
    if (!currentProduct) return;
    window.handleAddToCart(true);
  };

  window.handleAddToCart = function (openCheckout) {
    if (!currentProduct) return;

    const vName = selectedVersion ? selectedVersion.dungLuong : 'Tiêu chuẩn';
    const cName = selectedColor ? selectedColor.ten : 'Bạc';
    const priceVal = Number(selectedVersion ? selectedVersion.gia : currentProduct.donGia) || 0;
    const oldPriceVal = Number(selectedVersion ? selectedVersion.giaGoc : (currentProduct.giaGoc || currentProduct.donGia)) || priceVal;
    const imgVal = selectedColor ? selectedColor.anh : currentProduct.anhChinh;

    const cartItem = {
      id: currentProduct.maHang + '_' + vName + '_' + cName,
      maHang: currentProduct.maHang,
      tenHang: currentProduct.tenHang,
      donGia: priceVal,
      giaGoc: oldPriceVal,
      hinhAnh: imgVal,
      soLuong: 1,
      mauSac: cName,
      phienBan: vName,
      price: priceVal,
      oldPrice: oldPriceVal,
      image: imgVal,
      qty: 1,
      colorName: cName,
      variantName: vName
    };

    if (window.CellphoneSCart || window.Cart) {
      const cart = window.CellphoneSCart || window.Cart;
      cart.addItem(cartItem);
      if (openCheckout) {
        window.location.href = 'cart.html';
      } else {
        cart.openDrawer();
      }
    } else {
      // LocalStorage fallback
      try {
        const raw = localStorage.getItem('cellphones_cart');
        const list = raw ? JSON.parse(raw) : [];
        const existing = list.find(it => it.id === cartItem.id);
        if (existing) {
          existing.qty = (existing.qty || 1) + 1;
        } else {
          list.push(cartItem);
        }
        localStorage.setItem('cellphones_cart', JSON.stringify(list));
      } catch (e) {}

      if (openCheckout) {
        window.location.href = 'cart.html';
      } else {
        alert('Đã thêm "' + currentProduct.tenHang + '" vào giỏ hàng thành công!');
      }
    }
  };

  // Khởi động
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
