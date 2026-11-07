/**
 * SAMAMOBILE.COM - RECENTLY VIEWED PRODUCTS CONTROLLER
 * Quản lý và hiển thị danh sách sản phẩm đã xem lưu trong LocalStorage:
 * - Lưu sản phẩm khi xem trang chi tiết (product-detail.html) hoặc khi bấm xem sản phẩm
 * - Hiển thị Khối "Sản phẩm đã xem" trên index.html, category.html, product-detail.html
 * - Popover thả xuống khi rê chuột/bấm vào "Sản phẩm đã xem" trên thanh top bar Header
 * - Nút xóa lịch sử xem sản phẩm
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'samamobile_recently_viewed';

  // Sản phẩm mẫu hiển thị khi người dùng mới vào chưa xem sản phẩm nào
  var DEFAULT_RECOMMENDED = [
    {
      id: 'MH101',
      maHang: 'MH101',
      tenHang: 'iPhone 18 Pro Max 256GB - Chính hãng VN/A',
      donGia: 41490000,
      giaGoc: 44990000,
      anhChinh: 'https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png',
      member_price: 40992000,
      badges: ['A20 Pro', '256GB', '6.9"']
    },
    {
      id: 'MH102',
      maHang: 'MH102',
      tenHang: 'iPhone 18 Pro 256GB - Chính hãng VN/A',
      donGia: 38490000,
      giaGoc: 41569000,
      anhChinh: 'https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-glacier-pdp-images-vi-vn-021533622.png',
      member_price: 38028000,
      badges: ['A20 Pro', '256GB', '6.3"']
    },
    {
      id: 'SAMPLE-dien-thoai-1',
      maHang: 'SAMPLE-dien-thoai-1',
      tenHang: 'Samsung Galaxy S25 Ultra - 12GB/256GB',
      donGia: 25790000,
      giaGoc: 33990000,
      anhChinh: 'https://i.hoanghamobile.vn/Uploads/2026/01/22/galaxy-s25-ultra-titan-den-1.png',
      member_price: 25481000,
      badges: ['Snap 8 Elite', '5000mAh', '256GB']
    },
    {
      id: 'MH249',
      maHang: 'MH249',
      tenHang: 'Nubia V80 Max 6GB/128GB - Chính hãng',
      donGia: 3890000,
      giaGoc: 4290000,
      anhChinh: 'https://i.hoanghamobile.vn/Uploads/2026/01/08/nubia-v80-max-bac.png',
      member_price: 3835000,
      badges: ['Unisoc T7280', '5000mAh', '6.9"']
    },
    {
      id: 'SAMPLE-laptop-1',
      maHang: 'SAMPLE-laptop-1',
      tenHang: 'MacBook Air 13 M3 2024 - 16GB / 256GB SSD',
      donGia: 27490000,
      giaGoc: 31990000,
      anhChinh: 'https://i.hoanghamobile.vn/Uploads/2024/03/05/macbook-air-m3-midnight-1.png',
      member_price: 27150000,
      badges: ['Apple M3', '16GB RAM', '256GB SSD']
    }
  ];

  // Lấy danh sách sản phẩm đã xem từ LocalStorage
  window.getRecentlyViewed = function () {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        var list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Lỗi đọc recently viewed:', e);
    }
    return [];
  };

  // Thêm sản phẩm vào danh sách đã xem
  window.addRecentlyViewed = function (prod) {
    if (!prod) return;
    try {
      var id = prod.id || prod.maHang;
      if (!id) return;

      var list = window.getRecentlyViewed();
      // Lọc bỏ nếu đã tồn tại để đưa lên đầu danh sách
      list = list.filter(function (item) {
        return (item.id !== id && item.maHang !== id);
      });

      var price = Number(prod.donGia) || Number(prod.price) || 0;
      var oldPrice = Number(prod.giaGoc) || Number(prod.oldPrice) || Math.round(price * 1.15);
      var memberPrice = prod.member_price || Math.round(price * 0.985);

      list.unshift({
        id: id,
        maHang: id,
        tenHang: prod.tenHang || prod.name || 'Sản phẩm công nghệ',
        donGia: price,
        giaGoc: oldPrice,
        member_price: memberPrice,
        anhChinh: prod.anhChinh || prod.image || 'https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png',
        badges: prod.image_badges || prod.badges || ['Chính hãng VN/A', 'Bảo hành 12T'],
        thoiGian: Date.now()
      });

      // Lưu tối đa 20 sản phẩm gần nhất
      list = list.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // Cập nhật lại giao diện
      window.renderRecentlyViewedUI();
    } catch (e) {
      console.warn('Lỗi lưu recently viewed:', e);
    }
  };

  // Xóa toàn bộ lịch sử xem
  window.clearRecentlyViewed = function () {
    if (confirm('Bạn có chắc muốn xóa danh sách các sản phẩm đã xem không?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.renderRecentlyViewedUI();
    }
  };

  // Xóa 1 sản phẩm khỏi lịch sử
  window.removeRecentlyViewedItem = function (id) {
    try {
      var list = window.getRecentlyViewed();
      list = list.filter(function (item) {
        return item.id !== id && item.maHang !== id;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.renderRecentlyViewedUI();
    } catch (e) {}
  };

  // Cuộn mượt đến khối sản phẩm đã xem trên trang
  window.scrollToRecentlyViewed = function () {
    var el = document.getElementById('shelf-recently-viewed') || document.getElementById('empty-cart-recently-viewed-section');
    if (el && !el.classList.contains('hidden') && el.offsetParent !== null) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      var isInsidePages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
      var targetUrl = (isInsidePages ? '../' : '') + 'index.html#shelf-recently-viewed';
      window.location.href = targetUrl;
    }
  };

  // Render toàn bộ giao diện: Khối trên trang + Popover thả xuống
  window.renderRecentlyViewedUI = function () {
    var rawList = window.getRecentlyViewed();
    var hasCustom = rawList.length > 0;
    var displayList = hasCustom ? rawList : DEFAULT_RECOMMENDED;

    // 1. Cập nhật Badge đếm số lượng trên thanh Header
    var badges = document.querySelectorAll('.badge-viewed-count');
    badges.forEach(function (b) {
      if (hasCustom) {
        b.textContent = rawList.length;
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });

    var counters = document.querySelectorAll('.recently-viewed-counter');
    counters.forEach(function (c) {
      c.textContent = hasCustom ? rawList.length : 'Gợi ý';
    });

    // 2. Render Khối trên trang (#recently-viewed-grid)
    var grids = document.querySelectorAll('.recently-viewed-grid');
    grids.forEach(function (grid) {
      grid.innerHTML = displayList.map(function (p) {
        var price = Number(p.donGia) || 0;
        var oldPrice = Number(p.giaGoc) || Math.round(price * 1.15);
        var memberPrice = p.member_price || Math.round(price * 0.985);
        var discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
        var pId = p.maHang || p.id;
        var img = p.anhChinh || 'https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png';

        return `
          <div class="product-card bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative" onclick="window.navigateToDetail ? window.navigateToDetail('${pId}') : window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'pages/product-detail.html?id=' + encodeURIComponent(pId)">
            
            ${hasCustom ? `
              <button type="button" onclick="event.stopPropagation(); window.removeRecentlyViewedItem('${pId}')" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center text-[10px] transition-colors z-20 shadow-xs cursor-pointer" title="Xóa khỏi lịch sử">
                <i class="fa-solid fa-xmark"></i>
              </button>
            ` : ''}

            <div>
              <div class="relative h-44 sm:h-48 flex items-center justify-center p-2 mb-2 bg-slate-50/50 rounded-xl overflow-hidden">
                ${discount > 0 ? `
                  <span class="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#E0052B] text-white font-black text-[10px] shadow-xs z-10">
                    -${discount}%
                  </span>
                ` : ''}
                <img src="${img}" alt="${p.tenHang}" class="max-w-[130px] max-h-[130px] object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" onerror="this.onerror=null; this.src='https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png';" />
              </div>

              <h4 class="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#0057B7] line-clamp-2 leading-snug min-h-[34px] transition-colors" title="${p.tenHang}">
                ${p.tenHang}
              </h4>

              <div class="mt-2">
                <div class="flex items-baseline gap-1.5 flex-wrap">
                  <span class="text-sm sm:text-base font-black text-[#E0052B] font-mono">
                    ${formatCurrency(price)}
                  </span>
                  ${oldPrice > price ? `
                    <span class="text-[10px] sm:text-[11px] text-slate-400 line-through">
                      ${formatCurrency(oldPrice)}
                    </span>
                  ` : ''}
                </div>

                <div class="mt-1 text-[10px] sm:text-[11px] text-slate-700 font-semibold leading-tight">
                  <span class="text-[#0057B7]"><i class="fa-solid fa-credit-card text-[9px] mr-1"></i>Trả góp 0%</span>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[10px] sm:text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <i class="fa-solid fa-circle text-[7px] text-emerald-500"></i> Sẵn hàng
              </span>
              <button type="button" onclick="event.stopPropagation(); window.quickAddToCart ? window.quickAddToCart('${pId}') : alert('Đã thêm vào giỏ!')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-[#E0052B] text-[#E0052B] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs" title="Thêm vào giỏ">
                <i class="fa-solid fa-cart-shopping text-xs"></i>
              </button>
            </div>

          </div>
        `;
      }).join('');
    });

    // 3. Render Popover Header nếu có (#recently-viewed-popover-list)
    var popoverList = document.getElementById('recently-viewed-popover-list');
    if (popoverList) {
      if (hasCustom) {
        popoverList.innerHTML = rawList.slice(0, 4).map(function (p) {
          var price = Number(p.donGia) || 0;
          var pId = p.maHang || p.id;
          var isPages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
          var targetUrl = (isPages ? '' : 'pages/') + 'product-detail.html?id=' + encodeURIComponent(pId);
          return `
            <a href="${targetUrl}" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item">
              <img src="${p.anhChinh}" alt="${p.tenHang}" class="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1 flex-shrink-0 shadow-2xs" onerror="this.src='https://i.hoanghamobile.vn/Uploads/2026/09/10/iphone-18-pro-max-burgundy-pdp-images-vi-vn-021130982.png';" />
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-1 group-hover/item:text-[#0057B7] transition-colors leading-snug">${p.tenHang}</p>
                <p class="text-xs sm:text-[13px] font-black text-[#E11B1E] font-mono mt-0.5">${formatCurrency(price)}</p>
              </div>
            </a>
          `;
        }).join('');
      } else {
        popoverList.innerHTML = `
          <div class="py-6 text-center text-slate-400">
            <i class="fa-regular fa-clock text-2xl mb-1 text-slate-300"></i>
            <p class="text-xs font-medium">Bạn chưa xem sản phẩm nào.</p>
          </div>
        `;
      }
    }
  };

  function formatCurrency(val) {
    if (!val || isNaN(val)) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  }

  // Khởi tạo khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.renderRecentlyViewedUI);
  } else {
    window.renderRecentlyViewedUI();
  }

})();
