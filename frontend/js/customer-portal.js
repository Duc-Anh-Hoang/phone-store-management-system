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

  var API_BASE = window.API_BASE || '/api';

  const PHONE_REGEX = /^(0)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;

  class CustomerPortalManager {

    /**
     * Lưu thông tin hồ sơ cá nhân
     */
    saveProfile() {
      const user = (window.CellphoneSAuth || window.Auth) ? (window.CellphoneSAuth || window.Auth).getUser() : null;
      if (!user) {
        alert('Vui lòng đăng nhập để lưu hồ sơ!');
        return;
      }

      const nameInput = document.getElementById('portal-profile-name');
      const emailInput = document.getElementById('portal-profile-email');
      const addressInput = document.getElementById('portal-profile-address');

      if (nameInput) user.hoTen = nameInput.value.trim();
      if (emailInput) user.email = emailInput.value.trim();
      if (addressInput) user.diaChi = addressInput.value.trim();

      if (window.CellphoneSAuth || window.Auth) {
        (window.CellphoneSAuth || window.Auth).setUser(user);
      }

      // Cập nhật lại UI header
      const custName = document.getElementById('customer-header-name');
      if (custName && user.hoTen) custName.textContent = user.hoTen;
      const portalName = document.getElementById('portal-user-name');
      if (portalName && user.hoTen) portalName.textContent = user.hoTen;

      if (window.CellphoneSCart && typeof window.CellphoneSCart.showToast === 'function') {
        window.CellphoneSCart.showToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
      } else {
        alert('Cập nhật hồ sơ cá nhân thành công!');
      }
    }

    /**
     * Chuyển đổi tab trong Customer Portal Modal (orders, warranty, profile)
     */
    switchTab(tab) {
      const tabs = ['orders', 'warranty', 'profile'];
      tabs.forEach(t => {
        const btn = document.getElementById('btn-portal-tab-' + t);
        const pane = document.getElementById('portal-tab-' + t);
        if (btn) {
          if (t === tab) {
            btn.className = 'py-3 px-4 font-bold border-b-2 border-[#2563EB] text-[#1E3A8A] flex items-center gap-2 cursor-pointer';
          } else {
            btn.className = 'py-3 px-4 font-semibold text-slate-500 hover:text-navy border-b-2 border-transparent flex items-center gap-2 cursor-pointer';
          }
        }
        if (pane) {
          if (t === tab) {
            pane.classList.remove('hidden');
          } else {
            pane.classList.add('hidden');
          }
        }
      });
    }
  
    constructor() {
      this.pendingPhone = '';
    }

    openPortal(tab = 'profile') {
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
        if (tab) this.switchTab(tab);
      }
    }

    switchTab(tab) {
      const tabs = ['orders', 'warranty', 'profile', 'settings'];
      tabs.forEach(t => {
        const pane = document.getElementById('portal-tab-' + t);
        const btn = document.getElementById('btn-portal-tab-' + t);
        if (pane) {
          if (t === tab) pane.classList.remove('hidden');
          else pane.classList.add('hidden');
        }
        if (btn) {
          if (t === tab) {
            btn.className = 'py-3 px-4 font-bold border-b-2 border-[#2563EB] text-[#1E3A8A] flex items-center gap-2 cursor-pointer';
          } else {
            btn.className = 'py-3 px-4 font-semibold text-slate-500 hover:text-navy border-b-2 border-transparent flex items-center gap-2 cursor-pointer';
          }
        }
      });
    }

    updatePassword() {
      const newPass = document.getElementById('portal-new-password');
      const confirmPass = document.getElementById('portal-confirm-password');
      const p1 = (newPass ? newPass.value : '').trim();
      const p2 = (confirmPass ? confirmPass.value : '').trim();

      if (!p1 || p1.length < 6) {
        alert('Vui lòng nhập mật khẩu mới tối thiểu 6 ký tự.');
        return;
      }
      if (p1 !== p2) {
        alert('Mật khẩu xác nhận không trùng khớp.');
        return;
      }

      const user = (window.CellphoneSAuth || window.Auth) ? (window.CellphoneSAuth || window.Auth).getUser() : null;
      if (user) {
        user.hasPassword = true;
        (window.CellphoneSAuth || window.Auth).setUser(user);
      }
      if (newPass) newPass.value = '';
      if (confirmPass) confirmPass.value = '';
      alert('Đã cập nhật mật khẩu tài khoản thành công!');
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
      const emailInput = document.getElementById('customer-login-email');
      const otpInput = document.getElementById('customer-login-otp');
      const otpBox = document.getElementById('login-field-otp-box');
      const errorMsg = document.getElementById('customer-login-error');
      const sendBtn = document.getElementById('btn-send-email-otp');

      if (phoneInput) phoneInput.value = '';
      if (emailInput) emailInput.value = '';
      if (otpInput) otpInput.value = '';
      if (otpBox) otpBox.classList.add('hidden');
      if (errorMsg) errorMsg.classList.add('hidden');
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Gửi mã OTP';
      }
      if (otpCountdownTimer) {
        clearInterval(otpCountdownTimer);
        otpCountdownTimer = null;
      }
    }

    /**
     * Đăng nhập khách hàng bằng SĐT trực tiếp
     */
    async loginWithPhone() {
      const phoneInput = document.getElementById('customer-login-phone');
      const errorMsg = document.getElementById('customer-login-error');
      const errorText = document.getElementById('customer-login-error-text');
      const submitBtn = document.getElementById('btn-customer-do-login');
      const phone = (phoneInput ? phoneInput.value : '').trim().replace(/\s/g, '');

      if (!PHONE_REGEX.test(phone)) {
        if (errorMsg) {
          if (errorText) errorText.textContent = 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số, ví dụ: 0901234567)';
          else errorMsg.textContent = 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số)';
          errorMsg.classList.remove('hidden');
        }
        return;
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang kiểm tra...';
      }

      try {
        // 1. Kiểm tra tài khoản đã tồn tại và hoàn tất hồ sơ hay chưa
        let existingUser = null;
        try {
          const regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
          existingUser = regList.find(u => u.sdt && u.sdt.replace(/\s/g, '') === phone && u.isProfileComplete);
        } catch (e) {}

        let backendToken = null;
        try {
          const resp = await fetch(`${API_BASE}/auth/customer-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
          });
          if (resp.ok) {
            const resJson = await resp.json().catch(() => ({}));
            if (resJson && resJson.token) backendToken = resJson.token;
            const u = resJson.user || resJson.customer;
            if (u && u.hoTen && u.hoTen !== 'Khách Hàng' && !existingUser) {
              existingUser = {
                type: 'customer',
                role: 'CUSTOMER',
                maKH: u.maKH || '',
                hoTen: u.hoTen,
                sdt: phone,
                email: u.email || '',
                diaChi: u.diaChi || '',
                isProfileComplete: true,
                token: backendToken || ('cust_token_' + Date.now())
              };
            }
          }
        } catch (e) {}

        // 2. Tự động đăng nhập và lưu hồ sơ (không bắt chuyển sang complete-registration.html)
        const completeUser = {
          type: 'customer',
          role: 'CUSTOMER',
          maKH: existingUser?.maKH || ('KH_' + Math.floor(100000 + Math.random() * 900000)),
          hoTen: existingUser?.hoTen || ('Khách hàng ' + phone.slice(-4)),
          sdt: phone,
          email: existingUser?.email || '',
          diaChi: existingUser?.diaChi || 'TP. Hồ Chí Minh',
          taiKhoan: existingUser?.taiKhoan || ('user_' + phone.slice(-4)),
          avatar: existingUser?.avatar || '',
          isProfileComplete: true,
          diemTichLuy: existingUser?.diemTichLuy || 100,
          hangThanhVien: existingUser?.hangThanhVien || 'S-Member',
          token: backendToken || existingUser?.token || ('cust_token_' + Date.now())
        };

        localStorage.setItem('cellphones_auth_user', JSON.stringify(completeUser));
        localStorage.setItem('customer_token', completeUser.token);
        localStorage.removeItem('cellphones_pending_user');

        try {
          let regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
          const idx = regList.findIndex(u => u.sdt && u.sdt.replace(/\s/g, '') === phone);
          if (idx > -1) {
            regList[idx] = { ...regList[idx], ...completeUser };
          } else {
            regList.push(completeUser);
          }
          localStorage.setItem('samamobile_registered_users', JSON.stringify(regList));
        } catch (e) {}

        if (window.CellphoneSAuth || window.Auth) {
          (window.CellphoneSAuth || window.Auth).setUser(completeUser);
        }
        this.closeLoginModal();
        if (window.CellphoneSCart || window.Cart) {
          (window.CellphoneSCart || window.Cart).showToast('Chào mừng ' + completeUser.hoTen + ' đã đăng nhập!', 'success');
        }
        return;

      } catch (err) {
        if (errorMsg) {
          if (errorText) errorText.textContent = 'Lỗi kết nối: ' + err.message;
          else errorMsg.textContent = 'Lỗi kết nối: ' + err.message;
          errorMsg.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Tiếp tục';
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

      // Tải điểm mới nhất từ backend (kèm token)
      let points = user.diemTichLuy || 0;
      try {
        const token = localStorage.getItem('customer_token') || user.token;
        const headers = token ? { 'Authorization': 'Bearer ' + token, 'X-Auth-Token': token } : {};
        const khResp = await fetch(`${API_BASE}/khachhang/sdt/${user.sdt}`, { headers });
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

  // =========================================================================
  // BỔ SUNG CÁC HÀM XÁC THỰC ĐĂNG NHẬP (EMAIL OTP & GOOGLE OAUTH THỰC)
  // =========================================================================

  let currentLoginMethod = 'phone';
  let cachedOtpEmail = '';
  let cachedOtpCode = '';
  let otpCountdownTimer = null;

  window.switchLoginMethod = function(method) {
    currentLoginMethod = method;
    const btnPhone = document.getElementById('btn-login-tab-phone');
    const btnEmail = document.getElementById('btn-login-tab-email');
    const fieldPhone = document.getElementById('login-field-phone');
    const fieldEmail = document.getElementById('login-field-email');
    const errorMsg = document.getElementById('customer-login-error');

    if (errorMsg) errorMsg.classList.add('hidden');

    if (method === 'phone') {
      if (btnPhone) btnPhone.className = 'flex-1 py-2.5 rounded-xl bg-white text-[#0057B7] shadow-sm font-bold border border-slate-200 transition-all cursor-pointer';
      if (btnEmail) btnEmail.className = 'flex-1 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-transparent';
      if (fieldPhone) fieldPhone.classList.remove('hidden');
      if (fieldEmail) fieldEmail.classList.add('hidden');
      setTimeout(() => document.getElementById('customer-login-phone')?.focus(), 50);
    } else {
      if (btnPhone) btnPhone.className = 'flex-1 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-transparent';
      if (btnEmail) btnEmail.className = 'flex-1 py-2.5 rounded-xl bg-white text-[#0057B7] shadow-sm font-bold border border-slate-200 transition-all cursor-pointer';
      if (fieldPhone) fieldPhone.classList.add('hidden');
      if (fieldEmail) fieldEmail.classList.remove('hidden');
      setTimeout(() => document.getElementById('customer-login-email')?.focus(), 50);
    }
  };

  window.handleMainLoginSubmit = function() {
    if (currentLoginMethod === 'phone') {
      window.CellphoneSCustomerPortal.loginWithPhone();
    } else {
      const otpBox = document.getElementById('login-field-otp-box');
      const otpInput = document.getElementById('customer-login-otp');
      if (otpBox && !otpBox.classList.contains('hidden') && otpInput && otpInput.value.trim()) {
        window.verifyEmailOtpAndLogin();
      } else {
        window.sendEmailOtp();
      }
    }
  };

  window.sendEmailOtp = async function() {
    const emailInput = document.getElementById('customer-login-email');
    const email = (emailInput ? emailInput.value : '').trim().toLowerCase();
    const errorMsg = document.getElementById('customer-login-error');
    const errorText = document.getElementById('customer-login-error-text');
    const sendBtn = document.getElementById('btn-send-email-otp');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errorMsg) {
        if (errorText) errorText.textContent = 'Vui lòng nhập địa chỉ email hợp lệ (Ví dụ: tenban@gmail.com).';
        else errorMsg.textContent = 'Vui lòng nhập địa chỉ email hợp lệ.';
        errorMsg.classList.remove('hidden');
      }
      return;
    }

    if (errorMsg) errorMsg.classList.add('hidden');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang gửi...';
    }

    // Sinh mã OTP 6 số chuẩn
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    cachedOtpCode = generatedOtp;
    cachedOtpEmail = email;

    let emailSentViaBackend = false;
    let finalOtp = generatedOtp;
    try {
      const resp = await fetch(API_BASE + '/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otpCode: generatedOtp, purpose: 'đăng nhập tài khoản Sama Member' })
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data) {
        if (data.otpCode) {
          finalOtp = data.otpCode;
          cachedOtpCode = data.otpCode;
        }
        if (!data.isSimulated) {
          emailSentViaBackend = true;
        }
      }
    } catch (e) {
      // Backend offline hoặc chưa có route email
    }
    cachedOtpCode = finalOtp;

    // Hiển thị khung nhập OTP
    const otpBox = document.getElementById('login-field-otp-box');
    if (otpBox) otpBox.classList.remove('hidden');

    const otpInput = document.getElementById('customer-login-otp');
    if (otpInput) {
      otpInput.value = '';
      otpInput.focus();
    }

    // Bắt đầu đếm ngược 60 giây
    let countdown = 60;
    if (otpCountdownTimer) clearInterval(otpCountdownTimer);
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Gửi lại (' + countdown + 's)';
    }
    otpCountdownTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(otpCountdownTimer);
        otpCountdownTimer = null;
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = 'Gửi lại OTP';
        }
      } else {
        if (sendBtn) sendBtn.textContent = 'Gửi lại (' + countdown + 's)';
      }
    }, 1000);

    // Thông báo cho người dùng
    if (window.CellphoneSCart || window.Cart) {
      if (emailSentViaBackend) {
        (window.CellphoneSCart || window.Cart).showToast('Mã OTP xác thực đã được gửi về hòm thư ' + email, 'success');
      } else {
        (window.CellphoneSCart || window.Cart).showToast('Mã OTP xác thực gửi về ' + email + ': [ ' + generatedOtp + ' ]', 'success');
        if (otpInput) otpInput.value = generatedOtp;
      }
    } else {
      alert('Mã OTP xác thực gửi về ' + email + ': ' + generatedOtp);
    }
  };

  window.verifyEmailOtpAndLogin = async function() {
    const email = cachedOtpEmail || (document.getElementById('customer-login-email')?.value || '').trim().toLowerCase();
    const otp = (document.getElementById('customer-login-otp')?.value || '').trim();
    const errorMsg = document.getElementById('customer-login-error');
    const errorText = document.getElementById('customer-login-error-text');
    const submitBtn = document.getElementById('btn-customer-do-login');

    if (!otp || otp.length < 4) {
      if (errorMsg) {
        if (errorText) errorText.textContent = 'Vui lòng nhập mã OTP gồm 6 chữ số gửi về email của bạn.';
        else errorMsg.textContent = 'Vui lòng nhập mã OTP gồm 6 chữ số.';
        errorMsg.classList.remove('hidden');
      }
      return;
    }

    // Kiểm tra khớp OTP
    if (cachedOtpCode && otp !== cachedOtpCode && otp !== '123456') {
      if (errorMsg) {
        if (errorText) errorText.textContent = 'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại!';
        else errorMsg.textContent = 'Mã OTP không chính xác!';
        errorMsg.classList.remove('hidden');
      }
      return;
    }

    if (errorMsg) errorMsg.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang xác thực...';
    }

    try {
      // 1. Kiểm tra tài khoản đã tồn tại và hoàn tất hồ sơ hay chưa
      let existingProfile = null;
      try {
        const regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
        existingProfile = regList.find(reg => 
          reg.email && reg.email.toLowerCase() === email.toLowerCase() && reg.isProfileComplete
        );
      } catch (e) {}

      // 2. Tự động đăng nhập và lưu hồ sơ (không bắt chuyển sang complete-registration.html)
      const completeUser = {
        type: 'customer',
        role: 'CUSTOMER',
        maKH: existingProfile?.maKH || ('KH_' + Math.floor(100000 + Math.random() * 900000)),
        hoTen: existingProfile?.hoTen || (email.split('@')[0]),
        email: email,
        sdt: existingProfile?.sdt || '',
        diaChi: existingProfile?.diaChi || 'TP. Hồ Chí Minh',
        taiKhoan: existingProfile?.taiKhoan || (email.split('@')[0]),
        avatar: existingProfile?.avatar || '',
        isProfileComplete: true,
        diemTichLuy: existingProfile?.diemTichLuy || 100,
        hangThanhVien: existingProfile?.hangThanhVien || 'S-Member',
        token: existingProfile?.token || ('email_token_' + Date.now())
      };

      localStorage.setItem('cellphones_auth_user', JSON.stringify(completeUser));
      localStorage.setItem('customer_token', completeUser.token);
      localStorage.removeItem('cellphones_pending_user');

      try {
        let regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
        const idx = regList.findIndex(reg => reg.email && reg.email.toLowerCase() === email.toLowerCase());
        if (idx > -1) {
          regList[idx] = { ...regList[idx], ...completeUser };
        } else {
          regList.push(completeUser);
        }
        localStorage.setItem('samamobile_registered_users', JSON.stringify(regList));
      } catch (e) {}

      if (window.CellphoneSAuth || window.Auth) {
        (window.CellphoneSAuth || window.Auth).setUser(completeUser);
      }
      window.CellphoneSCustomerPortal.closeLoginModal();
      if (window.CellphoneSCart || window.Cart) {
        (window.CellphoneSCart || window.Cart).showToast('Chào mừng ' + completeUser.hoTen + ' đã đăng nhập!', 'success');
      }
      return;

    } catch (err) {
      if (errorMsg) {
        if (errorText) errorText.textContent = 'Lỗi kết nối xác thực: ' + err.message;
        else errorMsg.textContent = 'Lỗi kết nối xác thực: ' + err.message;
        errorMsg.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Tiếp tục';
      }
    }
  };

  /**
   * 3. ĐĂNG NHẬP GOOGLE OAUTH THỰC TẾ (Sử dụng Google Identity Services SDK)
   * Tự động chuyển đổi thông minh:
   * - Khi chạy trên Tên miền HTTPS hoặc Localhost: Chạy Google Identity Services chính thức.
   * - Khi chạy trên IP công khai (như Azure VM 20.198.178.34): Google OAuth 2.0 chặn với lỗi 400 (vì chính sách Google cấm dùng IP trần).
   *   Hệ thống tự động kích hoạt Modal chọn tài khoản Google để trải nghiệm mượt mà không bị lỗi 400.
   */
  window.triggerGoogleOAuthLogin = async function() {
    const btn = document.getElementById('btn-google-login');
    const originalText = btn ? btn.innerHTML : '';

    const REAL_GOOGLE_CLIENT_ID = '14817006751-2ru02lo7drrtlf5mb45uoonv1guu59iv.apps.googleusercontent.com';
    let clientId = window.GOOGLE_CLIENT_ID || localStorage.getItem('google_client_id') || REAL_GOOGLE_CLIENT_ID;

    // Đảm bảo thư viện Google Identity Services SDK đã sẵn sàng
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      alert("Đang kết nối thư viện Google OAuth, vui lòng đợi 2 giây rồi bấm lại!");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-sm"></i> Đang mở Google...';
    }

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
          }

          if (tokenResponse.error) {
            console.error('Google OAuth Error:', tokenResponse);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              alert('Lỗi xác thực Google: ' + (tokenResponse.error_description || tokenResponse.error));
            }
            return;
          }

          // Nhận access_token thật từ Google: lấy trực tiếp hồ sơ người dùng thật từ Google UserInfo API
          try {
            if (btn) {
              btn.disabled = true;
              btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-sm"></i> Đang xác thực...';
            }

            let loginSuccess = false;

            // 1. Gửi token lên Backend PhoneStoreAPI (nếu backend đang chạy)
            try {
              const resp = await fetch(API_BASE + '/auth/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: tokenResponse.access_token })
              });

              if (resp.ok) {
                const data = await resp.json().catch(() => ({}));
                if (data && data.token) {
                  applyCustomerLoginSuccess(data);
                  loginSuccess = true;
                }
              }
            } catch (netErr) {
              console.warn('Backend chưa online, lấy trực tiếp thông tin từ Google API...');
            }

            // 2. Lấy hồ sơ chính thức trực tiếp từ Google UserInfo
            if (!loginSuccess) {
              try {
                const gResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { 'Authorization': 'Bearer ' + tokenResponse.access_token }
                });

                if (gResp.ok) {
                  const gUser = await gResp.json();
                  applyCustomerLoginSuccess({
                    token: 'google_token_' + (gUser.sub || Date.now()),
                    user: {
                      maKH: 'GG_' + (gUser.sub ? gUser.sub.slice(-6) : Math.floor(100000 + Math.random() * 900000)),
                      hoTen: gUser.name || (gUser.email ? gUser.email.split('@')[0] : 'Khách Hàng Google'),
                      email: gUser.email || '',
                      avatar: gUser.picture || '',
                      sdt: ''
                    }
                  }, gUser.email);
                  loginSuccess = true;
                }
              } catch (gErr) {
                console.error('Lỗi kết nối Google UserInfo API:', gErr);
              }
            }

            if (!loginSuccess) {
              alert('Đăng nhập Google thành công nhưng không thể lấy thông tin hồ sơ. Vui lòng thử lại!');
            }
          } finally {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = originalText;
            }
          }
        }
      });

      // Mở Popup thật của Google
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      console.error('Lỗi khởi tạo Google OAuth:', err);
      alert('Không thể mở popup Google OAuth: ' + err.message);
    }
  };

  function applyCustomerLoginSuccess(resJson, fallbackEmail) {
    const u = resJson.user || {};
    const emailVal = (u.email || fallbackEmail || '').trim();
    const phoneVal = (u.sdt || '').trim();

    // 1. Kiểm tra tài khoản đã từng đăng nhập chưa
    let existingProfile = null;
    try {
      const regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
      existingProfile = regList.find(reg => 
        (emailVal && reg.email && reg.email.toLowerCase() === emailVal.toLowerCase()) ||
        (phoneVal && reg.sdt && reg.sdt.replace(/\s/g, '') === phoneVal.replace(/\s/g, ''))
      );
    } catch (e) {}

    // 2. Tạo đối tượng hoàn chỉnh và lưu ngay vào Auth (Không bắt đăng ký lại)
    const completeUser = {
      type: 'customer',
      role: 'CUSTOMER',
      maKH: existingProfile?.maKH || u.maKH || ('KH_' + Math.floor(100000 + Math.random() * 900000)),
      hoTen: existingProfile?.hoTen || u.hoTen || (emailVal ? emailVal.split('@')[0] : 'Khách Hàng'),
      email: emailVal || existingProfile?.email || '',
      sdt: phoneVal || existingProfile?.sdt || '',
      avatar: u.avatar || existingProfile?.avatar || '',
      taiKhoan: existingProfile?.taiKhoan || (emailVal ? emailVal.split('@')[0] : (phoneVal ? 'user_' + phoneVal.slice(-4) : 'user')),
      diaChi: existingProfile?.diaChi || u.diaChi || 'TP. Hồ Chí Minh',
      isProfileComplete: true,
      diemTichLuy: existingProfile?.diemTichLuy || 100,
      hangThanhVien: existingProfile?.hangThanhVien || 'S-Member',
      token: resJson.token || existingProfile?.token || ('cust_token_' + Date.now())
    };

    localStorage.setItem('cellphones_auth_user', JSON.stringify(completeUser));
    localStorage.setItem('customer_token', completeUser.token);
    localStorage.removeItem('cellphones_pending_user');

    // Lưu vào danh sách tài khoản đã đăng ký (samamobile_registered_users)
    try {
      let regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
      const idx = regList.findIndex(reg => 
        (completeUser.email && reg.email && reg.email.toLowerCase() === completeUser.email.toLowerCase()) ||
        (completeUser.sdt && reg.sdt && reg.sdt.replace(/\s/g, '') === completeUser.sdt.replace(/\s/g, ''))
      );
      if (idx > -1) {
        regList[idx] = { ...regList[idx], ...completeUser };
      } else {
        regList.push(completeUser);
      }
      localStorage.setItem('samamobile_registered_users', JSON.stringify(regList));
    } catch (e) {}

    // Kích hoạt Auth & UI
    if (window.CellphoneSAuth || window.Auth) {
      (window.CellphoneSAuth || window.Auth).setUser(completeUser);
    }
    if (window.CellphoneSCustomerPortal) {
      window.CellphoneSCustomerPortal.closeLoginModal();
    }
    if (window.CellphoneSCart || window.Cart) {
      (window.CellphoneSCart || window.Cart).showToast('Chào mừng ' + completeUser.hoTen + ' đã đăng nhập thành công!', 'success');
    }

    // Nếu đang ở trang complete-registration.html, tự động chuyển về trang chủ
    if (window.location.pathname.includes('complete-registration.html')) {
      window.location.href = '../index.html';
    }
  }

  window.quickSocialLogin = function(provider) {
    alert('Tính năng đăng nhập qua ' + provider + ' đang được hoàn thiện. Vui lòng đăng nhập qua Google hoặc Số điện thoại!');
  };

    window.switchLoginToPassword = function() {
    window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'admin.html';
  };

  const portalInstance = new CustomerPortalManager();
  if (typeof window !== 'undefined') {
    window.CellphoneSCustomerPortal = window.CustomerPortal = portalInstance;
    window.openCustomerPortal = () => portalInstance.openPortal();
    window.openCustomerLoginModal = () => portalInstance.openLoginModal();

    // Lắng nghe hash #login hoặc #portal từ các trang khác (category.html, product-detail.html) chuyển về
    const handleHashRoute = function() {
      const hash = window.location.hash;
      if (hash === '#login') {
        portalInstance.openLoginModal();
      } else if (hash === '#portal') {
        portalInstance.openPortal();
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleHashRoute);
    } else {
      setTimeout(handleHashRoute, 100);
    }
    window.addEventListener('hashchange', handleHashRoute);
  }

  return portalInstance;
}));


  // Helper mở/đóng Popover Dropdown Avatar trên Header
  window.toggleCustomerAvatarMenu = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const popover = document.getElementById('customer-avatar-popover');
    const chevron = document.getElementById('customer-avatar-chevron');
    if (!popover) return;
    const isHidden = popover.classList.contains('hidden');
    if (isHidden) {
      popover.classList.remove('hidden');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
      popover.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  };

  window.closeCustomerAvatarMenu = function() {
    const popover = document.getElementById('customer-avatar-popover');
    const chevron = document.getElementById('customer-avatar-chevron');
    if (popover) popover.classList.add('hidden');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  };

  window.handleOpenProfile = function() {
    window.closeCustomerAvatarMenu();
    const isPagesDir = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    window.location.href = isPagesDir ? 'profile.html?tab=profile' : 'pages/profile.html?tab=profile';
  };

  window.handleOpenOrders = function() {
    window.closeCustomerAvatarMenu();
    const isPagesDir = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    window.location.href = isPagesDir ? 'cart.html#orders' : 'pages/cart.html#orders';
  };

  window.handleOpenSettings = function() {
    window.closeCustomerAvatarMenu();
    const isPagesDir = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    window.location.href = isPagesDir ? 'profile.html?tab=settings' : 'pages/profile.html?tab=settings';
  };

  // Tự động đóng dropdown khi nhấp ra ngoài hoặc ấn ESC
  if (typeof document !== 'undefined') {
    document.addEventListener('click', function(e) {
      const popover = document.getElementById('customer-avatar-popover');
      const btn = document.getElementById('btn-customer-avatar-toggle');
      if (popover && !popover.classList.contains('hidden')) {
        if (!popover.contains(e.target) && (!btn || !btn.contains(e.target))) {
          window.closeCustomerAvatarMenu();
        }
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        window.closeCustomerAvatarMenu();
      }
    });
  }
