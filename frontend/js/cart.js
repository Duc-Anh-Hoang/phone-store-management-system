/**
 * TITAN STORE - CART & CART DRAWER HANDLER
 * Quản lý giỏ hàng phía Client theo Phần B1 của bản kế hoạch:
 * - Lưu trữ trong LocalStorage (khách vãng lai và thành viên)
 * - Kiểm tra số lượng tồn kho (khớp mã lỗi 50503 của sp_DatHangOnline)
 * - Xử lý mã khuyến mãi (tính giảm % dự kiến trên tổng hóa đơn)
 * - Đồng bộ Drawer giỏ hàng trượt mượt mà từ mép phải
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TitanCart = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'titan_customer_cart_v1';
  const PROMO_STORAGE_KEY = 'titan_applied_promo_v1';

  class CartManager {
    constructor() {
      this.items = this.loadCart();
      this.appliedPromo = this.loadPromo();
    }

    loadCart() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    saveCart() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      } catch (e) {}
      this.updateUI();
    }

    loadPromo() {
      try {
        const raw = localStorage.getItem(PROMO_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    savePromo(promo) {
      this.appliedPromo = promo;
      if (promo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
      this.updateUI();
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param {Object} product Thông tin sản phẩm từ TitanStoreData
     * @param {Object} variant Phiên bản (dung lượng, ram)
     * @param {Object} color Màu sắc đã chọn
     * @param {Number} qty Số lượng muốn thêm
     */
    addItem(product, variant, color, qty = 1) {
      if (!product) return { success: false, message: 'Sản phẩm không hợp lệ' };
      qty = Math.max(1, parseInt(qty, 10) || 1);

      const variantId = variant ? variant.id : 'default';
      const colorId = color ? color.id : 'default';
      const cartItemId = `${product.maHang}_${variantId}_${colorId}`;

      // Giới hạn tồn kho
      const stockAvailable = (variant && variant.tonKho !== undefined) 
        ? variant.tonKho 
        : (product.tonKho || 99);

      const existingIndex = this.items.findIndex(item => item.id === cartItemId);
      const currentQty = existingIndex > -1 ? this.items[existingIndex].qty : 0;
      const totalRequested = currentQty + qty;

      if (totalRequested > stockAvailable) {
        return {
          success: false,
          error: 50503,
          message: `Rất tiếc! Số lượng tồn kho chỉ còn ${stockAvailable} sản phẩm. (Lỗi 50503)`
        };
      }

      const itemPrice = variant && variant.gia ? variant.gia : product.donGia;
      const oldPrice = variant && variant.giaGoc ? variant.giaGoc : (product.giaGoc || itemPrice);

      if (existingIndex > -1) {
        this.items[existingIndex].qty = totalRequested;
      } else {
        this.items.push({
          id: cartItemId,
          maHang: product.maHang,
          tenHang: product.tenHang,
          variantName: variant ? variant.dungLuong : '',
          colorName: color ? color.ten : '',
          colorHex: color ? color.hex : '#16A34A',
          image: (color && color.anh) ? color.anh : product.anhChinh,
          price: itemPrice,
          oldPrice: oldPrice,
          qty: qty,
          maxStock: stockAvailable
        });
      }

      this.saveCart();
      this.showToast(`Đã thêm "${product.tenHang}" vào giỏ hàng!`, 'success');
      return { success: true };
    }

    /**
     * Cập nhật số lượng mặt hàng
     */
    updateQty(cartItemId, newQty) {
      const index = this.items.findIndex(item => item.id === cartItemId);
      if (index === -1) return;

      newQty = parseInt(newQty, 10);
      if (newQty <= 0) {
        this.removeItem(cartItemId);
        return;
      }

      const item = this.items[index];
      if (newQty > item.maxStock) {
        this.showToast(`Chỉ còn tối đa ${item.maxStock} sản phẩm trong kho!`, 'warning');
        item.qty = item.maxStock;
      } else {
        item.qty = newQty;
      }

      this.saveCart();
    }

    /**
     * Xóa mặt hàng khỏi giỏ
     */
    removeItem(cartItemId) {
      const idx = this.items.findIndex(item => item.id === cartItemId);
      if (idx > -1) {
        const removed = this.items[idx];
        this.items.splice(idx, 1);
        this.saveCart();
        this.showToast(`Đã xóa "${removed.tenHang}" khỏi giỏ hàng`, 'info');
      }
    }

    clearCart() {
      this.items = [];
      this.saveCart();
    }

    getItemCount() {
      return this.items.reduce((sum, item) => sum + item.qty, 0);
    }

    getSubtotal() {
      return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }

    /**
     * Áp dụng mã khuyến mãi
     */
    applyPromoCode(code) {
      if (!window.TitanStoreData) return { success: false, message: 'Dữ liệu chưa sẵn sàng' };
      if (!code || !code.trim()) {
        this.savePromo(null);
        return { success: false, message: 'Vui lòng nhập mã khuyến mãi' };
      }

      const promo = window.TitanStoreData.verifyPromotion(code);
      if (!promo) {
        this.savePromo(null);
        return {
          success: false,
          message: 'Mã khuyến mãi không tồn tại hoặc đã hết hạn áp dụng!'
        };
      }

      this.savePromo(promo);
      this.showToast(`Áp dụng thành công mã ${promo.maKM}: Giảm ${promo.phanTramGiam}%!`, 'success');
      return {
        success: true,
        promo: promo,
        message: `Được giảm ${promo.phanTramGiam}% tổng đơn hàng!`
      };
    }

    removePromo() {
      this.savePromo(null);
      this.showToast('Đã hủy áp dụng mã khuyến mãi', 'info');
    }

    getDiscountAmount() {
      if (!this.appliedPromo || !this.appliedPromo.phanTramGiam) return 0;
      const subtotal = this.getSubtotal();
      return Math.round((subtotal * this.appliedPromo.phanTramGiam) / 100);
    }

    getTotal() {
      const subtotal = this.getSubtotal();
      const discount = this.getDiscountAmount();
      return Math.max(0, subtotal - discount);
    }

    /**
     * Mở / Đóng Drawer giỏ hàng
     */
    openDrawer() {
      const drawer = document.getElementById('cart-drawer');
      const backdrop = document.getElementById('cart-drawer-backdrop');
      if (drawer && backdrop) {
        backdrop.classList.remove('hidden');
        drawer.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
      }
      this.updateUI();
    }

    closeDrawer() {
      const drawer = document.getElementById('cart-drawer');
      const backdrop = document.getElementById('cart-drawer-backdrop');
      if (drawer && backdrop) {
        drawer.classList.add('translate-x-full');
        backdrop.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    /**
     * Cập nhật toàn bộ UI giỏ hàng
     */
    updateUI() {
      const count = this.getItemCount();
      const subtotal = this.getSubtotal();
      const discount = this.getDiscountAmount();
      const total = this.getTotal();

      // 1. Cập nhật badges số lượng
      const badges = document.querySelectorAll('.cart-badge-count');
      badges.forEach(b => {
        b.textContent = count;
        if (count > 0) {
          b.classList.remove('hidden');
        } else {
          b.classList.add('hidden');
        }
      });

      // 2. Render danh sách sản phẩm trong Drawer
      const container = document.getElementById('cart-drawer-items');
      const emptyState = document.getElementById('cart-drawer-empty');
      const footer = document.getElementById('cart-drawer-footer');

      if (!container) return;

      if (this.items.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');
      } else {
        if (emptyState) emptyState.classList.add('hidden');
        if (footer) footer.classList.remove('hidden');

        container.innerHTML = this.items.map(item => `
          <div class="flex gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-20 h-20 rounded-xl bg-slate-50 p-1.5 flex items-center justify-center flex-shrink-0 border border-slate-100 overflow-hidden">
              <img src="${item.image}" alt="${item.tenHang}" class="w-full h-full object-contain">
            </div>
            <div class="flex-1 flex flex-col justify-between min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-navy line-clamp-1">${item.tenHang}</h4>
                  <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    ${item.variantName ? `<span class="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">${item.variantName}</span>` : ''}
                    ${item.colorName ? `
                      <span class="inline-flex items-center gap-1">
                        <span class="w-2.5 h-2.5 rounded-full inline-block border border-slate-300" style="background-color: ${item.colorHex};"></span>
                        <span>${item.colorName}</span>
                      </span>` : ''}
                  </div>
                </div>
                <button type="button" onclick="window.TitanCart.removeItem('${item.id}')" class="text-slate-400 hover:text-rose-600 p-1 transition-colors" title="Xóa món">
                  <i class="fa-regular fa-trash-can text-sm"></i>
                </button>
              </div>

              <div class="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-50">
                <div class="flex items-baseline gap-1.5">
                  <span class="text-sm font-bold text-rose-600">${this.formatMoney(item.price)}</span>
                  ${item.oldPrice > item.price ? `<span class="text-[10px] text-slate-400 line-through">${this.formatMoney(item.oldPrice)}</span>` : ''}
                </div>
                <div class="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button type="button" onclick="window.TitanCart.updateQty('${item.id}', ${item.qty - 1})" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded font-bold text-xs transition-colors">-</button>
                  <span class="w-7 text-center font-bold text-xs text-navy">${item.qty}</span>
                  <button type="button" onclick="window.TitanCart.updateQty('${item.id}', ${item.qty + 1})" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded font-bold text-xs transition-colors">+</button>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }

      // 3. Render khối giá tiền
      const elSubtotal = document.getElementById('cart-drawer-subtotal');
      const elDiscountRow = document.getElementById('cart-drawer-discount-row');
      const elDiscount = document.getElementById('cart-drawer-discount');
      const elTotal = document.getElementById('cart-drawer-total');
      const promoTag = document.getElementById('cart-drawer-promo-tag');

      if (elSubtotal) elSubtotal.textContent = this.formatMoney(subtotal);
      if (elTotal) elTotal.textContent = this.formatMoney(total);

      if (discount > 0 && this.appliedPromo) {
        if (elDiscountRow) elDiscountRow.classList.remove('hidden');
        if (elDiscount) elDiscount.textContent = `-${this.formatMoney(discount)} (${this.appliedPromo.phanTramGiam}%)`;
        if (promoTag) {
          promoTag.innerHTML = `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <i class="fa-solid fa-tag"></i> Mã: ${this.appliedPromo.maKM} (-${this.appliedPromo.phanTramGiam}%)
              <button type="button" onclick="window.TitanCart.removePromo()" class="ml-1 text-emerald-800 hover:text-rose-600"><i class="fa-solid fa-xmark"></i></button>
            </span>
          `;
          promoTag.classList.remove('hidden');
        }
      } else {
        if (elDiscountRow) elDiscountRow.classList.add('hidden');
        if (promoTag) promoTag.classList.add('hidden');
      }
    }

    formatMoney(val) {
      return new Intl.NumberFormat('vi-VN').format(Math.round(val || 0)) + ' đ';
    }

    showToast(message, type = 'info') {
      let toastContainer = document.getElementById('titan-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'titan-toast-container';
        toastContainer.className = 'fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      const bgColors = {
        success: 'bg-emerald-600 text-white',
        warning: 'bg-amber-600 text-white',
        error: 'bg-rose-600 text-white',
        info: 'bg-blue-600 text-white'
      };
      const icons = {
        success: 'fa-circle-check',
        warning: 'fa-triangle-exclamation',
        error: 'fa-circle-xmark',
        info: 'fa-circle-info'
      };

      toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto transition-all transform duration-300 translate-y-[-20px] opacity-0 ${bgColors[type] || bgColors.info}`;
      toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} text-lg"></i>
        <span class="text-xs sm:text-sm font-semibold">${message}</span>
      `;

      toastContainer.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  }

  return new CartManager();
}));
