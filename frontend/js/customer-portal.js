/**
 * CellphoneS - 241 Lê Văn Việt - CUSTOMER PORTAL & ACCOUNT CENTER
 * Quản lý tài khoản khách hàng (S-Member)
 * - Đăng nhập bằng Số điện thoại (POST /api/auth/customer-login)
 * - Tra cứu Đơn hàng qua API /api/orders/phone/{sdt}
 * - Điểm thân thiết từ vw_KhachHangThanThiet (DIEMTICHLUY, TONGCHITIEU)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CellphoneSCustomerPortal = root.CustomerPortal = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var API_BASE = window.API_BASE || (window.location.protocol === 'file:' || window.location.port === '5500') 
    ? 'http://localhost:8080/api' 
    : '/api';

  const PHONE_REGEX = /^(0)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;

  class CustomerPortalManager {
    constructor() {
      this.pendingPhone = '';
    }

    openPortal() {
      const user = (window.CellphoneSAuth || window.Auth) ? (window.CellphoneSAuth || window.Auth).getUser() : null;
      if (!user || user.type !== 'customer') {
        this.openLoginModal();
        return;
      }

      const modal = document.getElementById('customer-portal-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.renderPortalData(user);
      }
    }

    closePortal() {
      const modal = document.getElementById('customer-portal-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    openLoginModal() {
      const modal = document.getElementById('customer-login-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.resetLoginForm();
      }
    }

    closeLoginModal() {
      const modal = document.getElementById('customer-login-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    resetLoginForm() {
      const phoneInput = document.getElementById('customer-login-phone');
      const errorMsg = document.getElementById('customer-login-error');
      if (phoneInput) phoneInput.value = '';
      if (errorMsg) errorMsg.classList.add('hidden');
    }

    /**
     * Đăng nhập khách hàng bằng SĐT trực tiếp
     */
    async loginWithPhone() {
      const phoneInput = document.getElementById('customer-login-phone');
      const errorMsg = document.getElementById('customer-login-error');
      const submitBtn = document.getElementById('btn-customer-do-login');
      const phone = (phoneInput ? phoneInput.value : '').trim().replace(/\s/g, '');

      if (!PHONE_REGEX.test(phone)) {
        if (errorMsg) {
          errorMsg.textContent = 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số)';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang đăng nhập...';
      }

      try {
        let customerData = {
          type: 'customer',
          sdt: phone,
          hoTen: 'Khách Hàng',
          maKH: '',
          email: `${phone}@gmail.com`,
          diaChi: 'TP. Hồ Chí Minh',
          diemTichLuy: 0,
          tongChiTieu: 0
        };

        // 1. Gọi API backend POST /api/auth/customer-login
        const resp = await fetch(`${API_BASE}/auth/customer-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });

        if (resp.ok) {
          const resJson = await resp.json();
          if (resJson && resJson.customer) {
            customerData.maKH = resJson.customer.maKH || '';
            customerData.hoTen = resJson.customer.hoTen || customerData.hoTen;
            customerData.email = resJson.customer.email || customerData.email;
            customerData.diaChi = resJson.customer.diaChi || customerData.diaChi;
          }
        }

        // 2. Tải thông tin điểm tích lũy & chi tiêu từ view vw_KhachHangThanThiet
        try {
          const khResp = await fetch(`${API_BASE}/khachhang/sdt/${phone}`);
          if (khResp.ok) {
            const kh = await khResp.json();
            if (kh) {
              if (kh.maKH) customerData.maKH = kh.maKH;
              if (kh.hoTen) customerData.hoTen = kh.hoTen;
              if (kh.diemTichLuy !== undefined) customerData.diemTichLuy = kh.diemTichLuy;
              if (kh.tongChiTieu !== undefined) customerData.tongChiTieu = kh.tongChiTieu;
            }
          }
        } catch (e) {}

        // Lưu thông tin đăng nhập
        if ((window.CellphoneSAuth || window.Auth)) {
          (window.CellphoneSAuth || window.Auth).setUser(customerData);
        }

        this.closeLoginModal();
        if ((window.CellphoneSCart || window.Cart) && typeof (window.CellphoneSCart || window.Cart).showToast === 'function') {
          (window.CellphoneSCart || window.Cart).showToast(`Chào mừng ${customerData.hoTen} đã đăng nhập!`, 'success');
        }

        this.openPortal();
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = 'Lỗi kết nối máy chủ: ' + err.message;
          errorMsg.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Đăng Nhập S-Member &rarr;';
        }
      }
    }

    /**
     * Render toàn bộ dữ liệu trong Customer Portal
     */
    async renderPortalData(user) {
      const elName = document.getElementById('portal-user-name');
      const elPhone = document.getElementById('portal-user-phone');
      const elPoints = document.getElementById('portal-user-points');
      const elRank = document.getElementById('portal-user-rank');

      if (elName) elName.textContent = user.hoTen || 'Khách hàng';
      if (elPhone) elPhone.textContent = user.sdt || '';

      // Tải điểm mới nhất từ backend
      let points = user.diemTichLuy || 0;
      try {
        const khResp = await fetch(`${API_BASE}/khachhang/sdt/${user.sdt}`);
        if (khResp.ok) {
          const kh = await khResp.json();
          if (kh && kh.diemTichLuy !== undefined) {
            points = kh.diemTichLuy;
            user.diemTichLuy = points;
            if ((window.CellphoneSAuth || window.Auth)) (window.CellphoneSAuth || window.Auth).setUser(user);
          }
        }
      } catch (e) {}

      if (elPoints) elPoints.textContent = points + ' Điểm';

      let rank = 'S-Member';
      if (points >= 300) rank = 'S-VIP Gold';
      else if (points >= 100) rank = 'S-Member Silver';
      if (elRank) elRank.textContent = rank;

      // Tab Đơn hàng của tôi
      await this.renderOrders(user.sdt);

      // Tab Hồ sơ cá nhân
      const profileName = document.getElementById('portal-profile-name');
      const profilePhone = document.getElementById('portal-profile-phone');
      const profileEmail = document.getElementById('portal-profile-email');
      const profileAddress = document.getElementById('portal-profile-address');

      if (profileName) profileName.value = user.hoTen || '';
      if (profilePhone) profilePhone.value = user.sdt || '';
      if (profileEmail) profileEmail.value = user.email || '';
      if (profileAddress) profileAddress.value = user.diaChi || '';
    }

    async renderOrders(phone) {
      const container = document.getElementById('portal-orders-list');
      if (!container) return;

      container.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải đơn hàng...</div>';

      let orders = [];

      try {
        const resp = await fetch(`${API_BASE}/orders/phone/${phone}`);
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data)) orders = data;
        }
      } catch (e) {
        console.warn('Lỗi tải đơn hàng của khách:', e);
      }

      if (orders.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-slate-400 text-xs font-semibold">Bạn chưa có đơn hàng nào tại CellphoneS - 241 Lê Văn Việt.</div>';
        return;
      }

      const statusMap = {
        cho_xac_nhan: { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        da_xac_nhan: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        dang_giao: { label: 'Đang giao hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        hoan_thanh: { label: 'Đã hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        da_huy: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-200' }
      };

      container.innerHTML = orders.map(order => {
        const st = statusMap[order.trangThai] || statusMap.cho_xac_nhan;
        const price = Number(order.tongTien || 0).toLocaleString('vi-VN') + ' đ';
        return `
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-500 transition-all">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-navy font-mono text-xs sm:text-sm">#${order.maDH}</span>
                <span class="text-[11px] text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${order.ngayDat ? new Date(order.ngayDat).toLocaleDateString('vi-VN') : 'Hôm nay'}</span>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.color}">${st.label}</span>
            </div>

            <div class="text-xs space-y-1.5 text-slate-600">
              <div class="flex justify-between">
                <span>Người nhận:</span>
                <strong class="text-navy text-right">${order.tenNguoiNhan || phone}</strong>
              </div>
              <div class="flex justify-between">
                <span>Nơi nhận:</span>
                <span class="text-slate-500 text-right max-w-xs truncate">${order.diaChiGiao || 'Nhận tại cửa hàng 241 Lê Văn Việt'}</span>
              </div>
              <div class="flex justify-between pt-1 border-t border-slate-50">
                <span>Tổng thanh toán:</span>
                <strong class="text-sm font-bold text-rose-600">${price}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  return new CustomerPortalManager();
}));
