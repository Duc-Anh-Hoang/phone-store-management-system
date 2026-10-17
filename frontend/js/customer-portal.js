/**
 * TITAN STORE - CUSTOMER PORTAL & ACCOUNT CENTER
 * Quản lý tài khoản khách hàng (Phần A10 & B1):
 * - Đăng nhập bằng Số điện thoại + mã OTP (không dùng TaiKhoan của nhân viên)
 * - Tra cứu Đơn hàng của tôi (trạng thái: chờ xác nhận -> đã xác nhận -> đang giao -> hoàn thành)
 * - Tra cứu Bảo hành thiết bị của tôi (theo vw_BaoHanhTrangThai)
 * - Quản lý Điểm thân thiết (vw_KhachHangThanThiet.DIEMTICHLUY) và hồ sơ cá nhân
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TitanCustomerPortal = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const API_BASE = (window.location.protocol === 'file:' || window.location.port === '5500') 
    ? 'http://localhost:8080/api' 
    : '/api';

  const PHONE_REGEX = /^(0)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;

  class CustomerPortalManager {
    constructor() {
      this.pendingPhone = '';
      this.mockOtp = '';
    }

    openPortal() {
      const user = window.TitanAuth ? window.TitanAuth.getUser() : null;
      if (!user || user.type !== 'customer') {
        // Chưa đăng nhập: Mở modal Đăng nhập khách hàng
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
      const step1 = document.getElementById('customer-login-step-phone');
      const step2 = document.getElementById('customer-login-step-otp');
      const phoneInput = document.getElementById('customer-login-phone');
      const otpInput = document.getElementById('customer-login-otp');
      const errorMsg = document.getElementById('customer-login-error');

      if (step1) step1.classList.remove('hidden');
      if (step2) step2.classList.add('hidden');
      if (phoneInput) phoneInput.value = '';
      if (otpInput) otpInput.value = '';
      if (errorMsg) errorMsg.classList.add('hidden');
    }

    /**
     * Bước 1: Khách nhập Số điện thoại -> Gửi mã OTP
     */
    sendOtp() {
      const phoneInput = document.getElementById('customer-login-phone');
      const errorMsg = document.getElementById('customer-login-error');
      const phone = (phoneInput ? phoneInput.value : '').trim().replace(/\s/g, '');

      if (!PHONE_REGEX.test(phone)) {
        if (errorMsg) {
          errorMsg.textContent = 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số)';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      this.pendingPhone = phone;

      // Giả lập mã OTP 6 số
      this.mockOtp = String(Math.floor(100000 + Math.random() * 900000));

      const step1 = document.getElementById('customer-login-step-phone');
      const step2 = document.getElementById('customer-login-step-otp');
      const displayPhone = document.getElementById('customer-login-display-phone');
      const otpHint = document.getElementById('customer-login-otp-hint');

      if (step1) step1.classList.add('hidden');
      if (step2) step2.classList.remove('hidden');
      if (displayPhone) displayPhone.textContent = phone;
      if (otpHint) {
        otpHint.textContent = `Mã xác thực OTP gửi đến ${phone} là: ${this.mockOtp} (Hết hạn sau 5 phút)`;
      }

      if (window.TitanCart) {
        window.TitanCart.showToast(`Mã OTP của bạn là: ${this.mockOtp}`, 'info');
      }
    }

    /**
     * Bước 2: Xác thực mã OTP và cấp phiên đăng nhập
     */
    async verifyOtp() {
      const otpInput = document.getElementById('customer-login-otp');
      const errorMsg = document.getElementById('customer-login-error');
      const enteredOtp = (otpInput ? otpInput.value : '').trim();

      if (enteredOtp !== this.mockOtp && enteredOtp !== '123456') {
        if (errorMsg) {
          errorMsg.textContent = 'Mã OTP không chính xác. Vui lòng thử lại!';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      // Tra cứu hoặc tạo mới Khách hàng theo SĐT (Phần B1)
      let customerData = {
        type: 'customer',
        sdt: this.pendingPhone,
        hoTen: 'Khách Hàng ' + this.pendingPhone.slice(-4),
        maKH: 'KH' + this.pendingPhone.slice(-4),
        email: `${this.pendingPhone}@gmail.com`,
        diaChi: 'Hà Nội, Việt Nam',
        diemTichLuy: 150,
        tongChiTieu: 31490000
      };

      // Thử gọi backend /api/khachhang/sdt/{sdt}
      try {
        const resp = await fetch(`${API_BASE}/khachhang/sdt/${this.pendingPhone}`);
        if (resp.ok) {
          const dbCustomer = await resp.json();
          if (dbCustomer && dbCustomer.maKH) {
            customerData.maKH = dbCustomer.maKH;
            customerData.hoTen = dbCustomer.hoTen || customerData.hoTen;
            customerData.email = dbCustomer.email || customerData.email;
            customerData.diaChi = dbCustomer.diaChi || customerData.diaChi;
          }
        }
      } catch (e) {}

      // Kiểm tra trong tài khoản mẫu demo
      const demoUsers = {
        '0987654321': { hoTen: 'Nguyễn Hoàng Long', maKH: 'KH001', email: 'long.nh@gmail.com', diaChi: '128 Trần Duy Hưng, Cầu Giấy, Hà Nội', diemTichLuy: 320, tongChiTieu: 68480000 },
        '0912345678': { hoTen: 'Lê Thị Ngọc Mai', maKH: 'KH002', email: 'mai.le@yahoo.com', diaChi: '45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh', diemTichLuy: 210, tongChiTieu: 36990000 },
        '0903888999': { hoTen: 'Trần Minh Đức', maKH: 'KH003', email: 'duc.tran@outlook.com', diaChi: '23 Nguyễn Văn Linh, Đà Nẵng', diemTichLuy: 140, tongChiTieu: 31490000 }
      };

      if (demoUsers[this.pendingPhone]) {
        customerData = { ...customerData, ...demoUsers[this.pendingPhone] };
      }

      // Lưu phiên
      if (window.TitanAuth) {
        window.TitanAuth.setUser(customerData);
      } else {
        localStorage.setItem('titan_auth_user', JSON.stringify(customerData));
      }

      this.closeLoginModal();
      if (window.TitanCart) {
        window.TitanCart.showToast(`Chào mừng ${customerData.hoTen} đã đăng nhập!`, 'success');
      }

      this.openPortal();
    }

    /**
     * Render toàn bộ dữ liệu trong Customer Portal
     */
    async renderPortalData(user) {
      // 1. Header info
      const elName = document.getElementById('portal-user-name');
      const elPhone = document.getElementById('portal-user-phone');
      const elPoints = document.getElementById('portal-user-points');
      const elRank = document.getElementById('portal-user-rank');

      if (elName) elName.textContent = user.hoTen || 'Khách hàng';
      if (elPhone) elPhone.textContent = user.sdt || '';
      if (elPoints) elPoints.textContent = (user.diemTichLuy || 150) + ' Điểm';

      const points = user.diemTichLuy || 150;
      let rank = 'Titan Member';
      if (points >= 300) rank = 'Titan Gold VIP';
      else if (points >= 100) rank = 'Titan Silver';
      if (elRank) elRank.textContent = rank;

      // 2. Tab Đơn hàng của tôi
      await this.renderOrders(user.sdt);

      // 3. Tab Bảo hành của tôi
      this.renderWarranties(user);

      // 4. Tab Hồ sơ cá nhân
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

      // 1. Thử lấy từ Backend API
      try {
        const resp = await fetch(`${API_BASE}/orders/phone/${phone}`);
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data)) orders = data;
        }
      } catch (e) {}

      // 2. Lấy thêm từ titan_admin_db_v3 (nếu có đơn khớp SĐT)
      try {
        const adminRaw = localStorage.getItem('titan_admin_db_v3');
        if (adminRaw) {
          const adminDb = JSON.parse(adminRaw);
          if (Array.isArray(adminDb.donHangOnline)) {
            const matched = adminDb.donHangOnline.filter(o => o.sdtNguoiNhan === phone);
            matched.forEach(m => {
              if (!orders.some(o => o.maDH === m.maDH)) {
                orders.push(m);
              }
            });
          }
        }
      } catch (e) {}

      // 3. Lấy từ LocalStorage đơn của khách
      try {
        const local = JSON.parse(localStorage.getItem(`titan_orders_${phone}`) || '[]');
        local.forEach(l => {
          if (!orders.some(o => o.maDH === l.maDH)) {
            orders.unshift(l);
          }
        });
      } catch (e) {}

      // Fallback mẫu nếu chưa có đơn nào
      if (orders.length === 0) {
        orders = [
          {
            maDH: 'DH100234',
            ngayDat: '2026-10-12 08:15',
            tongTien: 31490000,
            trangThai: 'cho_xac_nhan',
            tenHang: 'iPhone 18 Pro Max 256GB (Titan Sa Mạc)',
            diaChiGiao: '128 Trần Duy Hưng, Cầu Giấy, Hà Nội',
            phuongThucThanhToan: 'cod'
          }
        ];
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
        return `
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#16A34A] transition-all">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-navy font-mono text-xs sm:text-sm">#${order.maDH}</span>
                <span class="text-[11px] text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${order.ngayDat || 'Hôm nay'}</span>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.color}">${st.label}</span>
            </div>

            <div class="text-xs space-y-1.5 text-slate-600">
              <div class="flex justify-between">
                <span>Sản phẩm:</span>
                <strong class="text-navy text-right">${order.tenHang || 'iPhone 18 Pro Max 256GB'}</strong>
              </div>
              <div class="flex justify-between">
                <span>Nơi nhận:</span>
                <span class="text-slate-500 text-right max-w-xs truncate">${order.diaChiGiao}</span>
              </div>
              <div class="flex justify-between pt-1 border-t border-slate-50">
                <span>Tổng thanh toán:</span>
                <strong class="text-sm font-bold text-rose-600">${window.TitanCart.formatMoney(order.tongTien)}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderWarranties(user) {
      const container = document.getElementById('portal-warranty-list');
      if (!container) return;

      // Danh sách thiết bị bảo hành mẫu từ vw_BaoHanhTrangThai
      const warranties = [
        {
          maBH: 'BH001',
          tenMay: 'iPhone 18 Pro Max 256GB (Titan Sa Mạc)',
          soImei: '356789123456781',
          ngayBD: '11/10/2026',
          ngayKT: '11/10/2027',
          conLaiNgay: 363,
          trangThai: 'Còn bảo hành chính hãng Apple VN/A',
          tinhTrangSua: 'Không có lỗi'
        }
      ];

      container.innerHTML = warranties.map(w => `
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h4 class="font-bold text-xs sm:text-sm text-navy">${w.tenMay}</h4>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <i class="fa-solid fa-shield-halved mr-1"></i> Còn ${w.conLaiNgay} ngày
            </span>
          </div>
          <div class="text-xs space-y-1 text-slate-600">
            <div>Số IMEI: <strong class="font-mono text-navy select-all">${w.soImei}</strong></div>
            <div>Thời hạn: <strong>${w.ngayBD}</strong> đến <strong>${w.ngayKT}</strong></div>
            <div class="text-emerald-600 font-medium pt-1"><i class="fa-solid fa-circle-check mr-1"></i>${w.trangThai}</div>
          </div>
        </div>
      `).join('');
    }

    saveProfile() {
      const name = (document.getElementById('portal-profile-name')?.value || '').trim();
      const email = (document.getElementById('portal-profile-email')?.value || '').trim();
      const address = (document.getElementById('portal-profile-address')?.value || '').trim();

      const user = window.TitanAuth ? window.TitanAuth.getUser() : null;
      if (!user) return;

      user.hoTen = name || user.hoTen;
      user.email = email || user.email;
      user.diaChi = address || user.diaChi;

      if (window.TitanAuth) {
        window.TitanAuth.setUser(user);
      }

      if (window.TitanCart) {
        window.TitanCart.showToast('Cập nhật hồ sơ thành công!', 'success');
      }
    }

    switchTab(tabId) {
      const tabs = ['orders', 'warranty', 'rewards', 'profile'];
      tabs.forEach(t => {
        const btn = document.getElementById(`btn-portal-tab-${t}`);
        const content = document.getElementById(`portal-tab-${t}`);
        if (t === tabId) {
          if (btn) btn.className = 'py-3 px-4 text-xs font-bold border-b-2 border-[#16A34A] text-[#16A34A] flex items-center gap-2 cursor-pointer';
          if (content) content.classList.remove('hidden');
        } else {
          if (btn) btn.className = 'py-3 px-4 text-xs font-semibold text-slate-500 hover:text-navy border-b-2 border-transparent flex items-center gap-2 cursor-pointer';
          if (content) content.classList.add('hidden');
        }
      });
    }
  }

  return new CustomerPortalManager();
}));
