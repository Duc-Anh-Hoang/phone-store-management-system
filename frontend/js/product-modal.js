/**
 * SAMAMOBILE - PRODUCT NAVIGATION ADAPTER
 * Thay thế hoàn toàn popup modal cũ.
 * Tất cả các hành động xem chi tiết sản phẩm đều chuyển hướng sang trang:
 * product-detail.html?id={maHang}
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CellphoneSProductModal = root.ProductModal = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    open: function (maHang) {
      if (!maHang) return;
      window.location.href = 'pages/product-detail.html?id=' + encodeURIComponent(maHang);
    },
    close: function () {
      // Không còn modal để đóng
    },
    addToCart: function () {
      // Hỗ trợ giỏ hàng tương thích ngược nếu có
    }
  };
}));
