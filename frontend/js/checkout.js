/**
 * CellphoneS - 241 Lê Văn Việt - CHECKOUT & ORDER DISPATCHER
 * Xử lý quy trình thanh toán:
 * - Thu thập thông tin giao hàng: TENNGUOINHAN, SDTNGUOINHAN, DIACHIGIAO
 * - Phương thức: COD, Chuyển khoản (VietQR tự động), Thẻ
 * - Gửi đơn hàng tới backend API (POST /api/orders) kết nối sp_DatHangOnline
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CellphoneSCheckout = root.Checkout = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var API_BASE = window.API_BASE || (window.location.protocol === 'file:' || window.location.port === '5500') 
    ? 'http://localhost:8080/api' 
    : '/api';

  const PHONE_REGEX = /^(0)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  const ORDER_PROMO_STORAGE = 'cellphones_order_promotions_v1';

  class CheckoutManager {
    constructor() {
      this.currentOrder = null;
    }

    openCheckout() {
      if (!(window.CellphoneSCart || window.Cart) || (window.CellphoneSCart || window.Cart).items.length === 0) {
        (window.CellphoneSCart || window.Cart).showToast('Giỏ hàng của bạn đang trống!', 'warning');
        return;
      }

      // Đóng drawer giỏ hàng nếu đang mở
      (window.CellphoneSCart || window.Cart).closeDrawer();

      const modal = document.getElementById('checkout-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }

      this.populateForm();
      this.renderSummary();
      this.bindPaymentToggle();
    }

    closeCheckout() {
      const modal = document.getElementById('checkout-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    /**
     * Ẩn/hiện khối VietQR khi chọn phương thức thanh toán
     * Chỉ hiện khi chọn "Chuyển khoản VietQR" (value="chuyen_khoan")
     */
    bindPaymentToggle() {
      const radios = document.querySelectorAll('input[name="checkout-payment"]');
      const qrBox = document.getElementById('checkout-vietqr-box');
      if (!radios.length || !qrBox) return;

      const updateVisibility = () => {
        const selected = document.querySelector('input[name="checkout-payment"]:checked');
        const isBanking = selected && selected.value === 'chuyen_khoan';

        // Toggle VietQR box
        if (isBanking) {
          qrBox.classList.remove('hidden');
        } else {
          qrBox.classList.add('hidden');
        }

        // Highlight active payment card
        radios.forEach(radio => {
          const label = radio.closest('label');
          if (!label) return;
          if (radio.checked) {
            label.classList.add('border-[#22C55E]', 'bg-[#F0FDF4]/50');
            label.classList.remove('border-slate-200');
          } else {
            label.classList.remove('border-[#22C55E]', 'bg-[#F0FDF4]/50');
            label.classList.add('border-slate-200');
          }
        });
      };

      radios.forEach(radio => {
        radio.addEventListener('change', updateVisibility);
      });

      // Run once to sync initial state (COD is checked by default → QR hidden)
      updateVisibility();
    }

    /**
     * Tự động điền thông tin nếu khách hàng đã đăng nhập
     */
    populateForm() {
      const user = (window.CellphoneSAuth || window.Auth) ? (window.CellphoneSAuth || window.Auth).getUser() : null;
      const nameInput = document.getElementById('checkout-fullname');
      const phoneInput = document.getElementById('checkout-phone');
      const addressInput = document.getElementById('checkout-address');

      if (user && user.type === 'customer') {
        if (nameInput && !nameInput.value) nameInput.value = user.hoTen || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = user.sdt || '';
        if (addressInput && !addressInput.value) addressInput.value = user.diaChi || '';
      }
    }

    renderSummary() {
      const container = document.getElementById('checkout-summary-items');
      const elSubtotal = document.getElementById('checkout-summary-subtotal');
      const elDiscountRow = document.getElementById('checkout-summary-discount-row');
      const elDiscount = document.getElementById('checkout-summary-discount');
      const elTotal = document.getElementById('checkout-summary-total');

      if (!container || !(window.CellphoneSCart || window.Cart)) return;

      const items = (window.CellphoneSCart || window.Cart).items;
      const subtotal = (window.CellphoneSCart || window.Cart).getSubtotal();
      const discount = (window.CellphoneSCart || window.Cart).getDiscountAmount();
      const total = (window.CellphoneSCart || window.Cart).getTotal();
      const promo = (window.CellphoneSCart || window.Cart).appliedPromo;

      container.innerHTML = items.map(item => `
        <div class="flex items-center justify-between gap-3 py-2 text-xs border-b border-slate-100 last:border-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-5 h-5 rounded-md bg-[#DCFCE7] text-[#166534] font-bold flex items-center justify-center text-[10px] flex-shrink-0">${item.qty}</span>
            <div class="truncate">
              <span class="font-bold text-navy truncate block">${item.tenHang}</span>
              <span class="text-[10px] text-slate-500">${item.variantName ? item.variantName + ' - ' : ''}${item.colorName || ''}</span>
            </div>
          </div>
          <span class="font-bold text-slate-700 whitespace-nowrap">${(window.CellphoneSCart || window.Cart).formatMoney(item.price * item.qty)}</span>
        </div>
      `).join('');

      if (elSubtotal) elSubtotal.textContent = (window.CellphoneSCart || window.Cart).formatMoney(subtotal);
      if (elTotal) elTotal.textContent = (window.CellphoneSCart || window.Cart).formatMoney(total);

      if (discount > 0 && promo) {
        if (elDiscountRow) elDiscountRow.classList.remove('hidden');
        if (elDiscount) elDiscount.textContent = `-${(window.CellphoneSCart || window.Cart).formatMoney(discount)} (${promo.phanTramGiam}%)`;
      } else {
        if (elDiscountRow) elDiscountRow.classList.add('hidden');
      }

      // Cập nhật số tiền hiển thị trên QR VietQR nếu thanh toán chuyển khoản
      this.updateBankQR(total);
    }

    updateBankQR(total) {
      const qrImg = document.getElementById('checkout-vietqr-image');
      const qrAmount = document.getElementById('checkout-qr-amount');
      const qrMemo = document.getElementById('checkout-qr-memo');
      const memoCode = 'CPS' + Math.floor(100000 + Math.random() * 900000);

      if (qrAmount) qrAmount.textContent = (window.CellphoneSCart || window.Cart).formatMoney(total);
      if (qrMemo) qrMemo.textContent = memoCode;
      if (qrImg) {
        // Sử dụng chuẩn QuickLink VietQR mở
        const qrUrl = `https://img.vietqr.io/image/970436-098765432100-compact2.png?amount=${Math.round(total)}&addInfo=${memoCode}&accountName=CELLPHONES%20241%20LE%20VAN%20VIET`;
        qrImg.src = qrUrl;
      }
    }

    /**
     * Submit và hoàn tất đặt hàng
     */
    async placeOrder() {
      const nameInput = document.getElementById('checkout-fullname');
      const phoneInput = document.getElementById('checkout-phone');
      const cityInput = document.getElementById('checkout-city');
      const addressInput = document.getElementById('checkout-address');
      const noteInput = document.getElementById('checkout-note');
      const paymentRadio = document.querySelector('input[name="checkout-payment"]:checked');

      const name = (nameInput ? nameInput.value : '').trim();
      const phone = (phoneInput ? phoneInput.value : '').trim().replace(/\s/g, '');
      const city = cityInput ? cityInput.value : '';
      const address = (addressInput ? addressInput.value : '').trim();
      const note = noteInput ? noteInput.value.trim() : '';
      const paymentMethod = paymentRadio ? paymentRadio.value : 'cod';

      // Validate
      if (!name || name.length < 2) {
        (window.CellphoneSCart || window.Cart).showToast('Vui lòng nhập họ và tên người nhận hợp lệ', 'error');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!PHONE_REGEX.test(phone)) {
        (window.CellphoneSCart || window.Cart).showToast('Số điện thoại không đúng định dạng 10 chữ số (VD: 0987654321)', 'error');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!city) {
        (window.CellphoneSCart || window.Cart).showToast('Vui lòng chọn Tỉnh/Thành phố nhận hàng', 'error');
        if (cityInput) cityInput.focus();
        return;
      }

      if (!address || address.length < 5) {
        (window.CellphoneSCart || window.Cart).showToast('Vui lòng nhập địa chỉ cụ thể (số nhà, đường, phường/xã)', 'error');
        if (addressInput) addressInput.focus();
        return;
      }

      const cartItems = (window.CellphoneSCart || window.Cart).items;
      if (cartItems.length === 0) {
        (window.CellphoneSCart || window.Cart).showToast('Giỏ hàng trống!', 'error');
        return;
      }

      const fullAddress = `${address}, ${city}`;
      const totalAmount = (window.CellphoneSCart || window.Cart).getTotal();
      const appliedPromo = (window.CellphoneSCart || window.Cart).appliedPromo;
      const user = (window.CellphoneSAuth || window.Auth) ? (window.CellphoneSAuth || window.Auth).getUser() : null;
      const maKH = (user && user.type === 'customer' && user.maKH) ? user.maKH : null;

      // Nút đặt hàng loading
      const submitBtn = document.getElementById('btn-checkout-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang xử lý đơn hàng...';
      }

      // Chuẩn bị payload chuẩn OrderRequestDTO
      const requestPayload = {
        tenNguoiNhan: name,
        sdtNguoiNhan: phone,
        diaChiGiao: fullAddress,
        phuongThucThanhToan: paymentMethod, // 'cod', 'chuyen_khoan', 'the'
        maKH: maKH,
        ghiChu: note,
        items: cartItems.map(item => ({
          maHang: item.maHang,
          soLuong: item.qty,
          donGia: item.price
        }))
      };

      let orderResult = null;

      // Gửi lên Spring Boot REST API
      try {
        const resp = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });
        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.message || `Lỗi đặt hàng (HTTP ${resp.status})`);
        }
        orderResult = await resp.json();
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-lock mr-2"></i> Xác Nhận Đặt Hàng';
        }
        (window.CellphoneSCart || window.Cart).showToast('Đặt hàng thất bại: ' + err.message, 'error');
        return;
      }

      // Xóa giỏ hàng và mở màn hình cảm ơn với mã đơn backend trả về
      (window.CellphoneSCart || window.Cart).clearCart();
      (window.CellphoneSCart || window.Cart).removePromo();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-lock mr-2"></i> Xác Nhận Đặt Hàng';
      }

      this.closeCheckout();
      this.showThankYou(orderResult, cartItems, totalAmount);
    }

    showThankYou(order, items, total) {
      const modal = document.getElementById('thankyou-modal');
      const elMaDH = document.getElementById('thankyou-order-id');
      const elName = document.getElementById('thankyou-name');
      const elPhone = document.getElementById('thankyou-phone');
      const elAddress = document.getElementById('thankyou-address');
      const elPayment = document.getElementById('thankyou-payment');
      const elTotal = document.getElementById('thankyou-total');

      if (elMaDH) elMaDH.textContent = order.maDH;
      if (elName) elName.textContent = order.tenNguoiNhan;
      if (elPhone) elPhone.textContent = order.sdtNguoiNhan;
      if (elAddress) elAddress.textContent = order.diaChiGiao;
      if (elTotal) elTotal.textContent = (window.CellphoneSCart || window.Cart).formatMoney(total);

      const paymentMap = {
        cod: 'Thanh toán tiền mặt khi nhận hàng (COD)',
        chuyen_khoan: 'Chuyển khoản ngân hàng (VietQR)',
        the: 'Thẻ tín dụng / Ghi nợ quốc tế'
      };
      if (elPayment) elPayment.textContent = paymentMap[order.phuongThucThanhToan] || order.phuongThucThanhToan;

      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    }

    closeThankYou() {
      const modal = document.getElementById('thankyou-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }
  }

  return new CheckoutManager();
}));
