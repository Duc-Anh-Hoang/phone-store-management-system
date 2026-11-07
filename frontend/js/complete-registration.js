/**
 * SAMAMOBILE - COMPLETE REGISTRATION CONTROLLER
 * Xử lý hoàn tất thông tin người dùng lần đầu đăng nhập (Google, SĐT, Email)
 */

(function () {
  'use strict';

  const AUTH_STORAGE_KEY = 'cellphones_auth_user';
  const PENDING_STORAGE_KEY = 'cellphones_pending_user';
  const REGISTERED_USERS_KEY = 'samamobile_registered_users';

  let currentAvatarData = '';

  document.addEventListener('DOMContentLoaded', () => {
    initPrefillData();
  });

  // 1. Tải và điền trước thông tin từ Google / Phone / Email đang đăng nhập
  function initPrefillData() {
    let pending = null;

    try {
      const rawPending = localStorage.getItem(PENDING_STORAGE_KEY);
      if (rawPending) pending = JSON.parse(rawPending);
    } catch (e) {}

    if (!pending) {
      try {
        const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (rawAuth) pending = JSON.parse(rawAuth);
      } catch (e) {}
    }

    // Nếu không có dữ liệu (mở test trực tiếp file html), dùng mẫu tài khoản như ảnh thiết kế
    if (!pending) {
      pending = {
        email: 'huykhang666@gmail.com',
        taiKhoan: 'huykhang666',
        hoTen: 'Huy Khang',
        sdt: '',
        avatar: '',
        diaChi: ''
      };
    }

    // Điền vào form
    const phoneEl = document.getElementById('reg-phone');
    const nameEl = document.getElementById('reg-fullname');
    const usernameEl = document.getElementById('reg-username');
    const emailEl = document.getElementById('reg-email');
    const addressEl = document.getElementById('reg-address');
    const dobEl = document.getElementById('reg-dob');

    if (phoneEl && pending.sdt) phoneEl.value = pending.sdt;
    if (nameEl && pending.hoTen) nameEl.value = pending.hoTen;
    if (emailEl && pending.email) emailEl.value = pending.email;
    if (addressEl && pending.diaChi) addressEl.value = pending.diaChi;
    if (dobEl && pending.ngaySinh) dobEl.value = pending.ngaySinh;

    // Tự sinh tên tài khoản nếu chưa có
    if (usernameEl) {
      if (pending.taiKhoan) {
        usernameEl.value = pending.taiKhoan;
      } else if (pending.email) {
        usernameEl.value = pending.email.split('@')[0];
      } else if (pending.sdt) {
        usernameEl.value = 'user_' + pending.sdt.slice(-4);
      } else {
        usernameEl.value = 'huykhang666';
      }
    }

    // Avatar
    if (pending.avatar) {
      currentAvatarData = pending.avatar;
      renderAvatar(pending.avatar);
    } else {
      const initial = (pending.hoTen || pending.email || 'S').charAt(0).toUpperCase();
      renderInitials(initial);
    }
  }

  // 2. Render Avatar
  function renderAvatar(src) {
    const box = document.getElementById('avatar-preview-box');
    if (!box) return;
    box.innerHTML = `<img src="${src}" alt="Avatar" class="w-full h-full object-cover">`;
  }

  function renderInitials(char) {
    const box = document.getElementById('avatar-preview-box');
    if (!box) return;
    box.innerHTML = `<span id="avatar-initials" class="font-black text-2xl text-emerald-700">${char || 'S'}</span>`;
  }

  // 3. Xử lý đổi ảnh đại diện
  window.handleAvatarChange = function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      currentAvatarData = e.target.result;
      renderAvatar(currentAvatarData);
      showToast('Đã tải ảnh đại diện lên thành công!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // 4. Toggle hiện/ẩn mật khẩu
  window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    }
  };

  // 5. Submit form Hoàn tất đăng ký
  window.skipToShopping = function () {
    let pending = null;
    try {
      const raw = localStorage.getItem(PENDING_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) pending = JSON.parse(raw);
    } catch (e) {}

    const completeUser = {
      type: 'customer',
      role: 'CUSTOMER',
      maKH: (pending && pending.maKH) || ('KH_' + Math.floor(100000 + Math.random() * 900000)),
      hoTen: (pending && pending.hoTen) || 'Khang Huy',
      sdt: (pending && pending.sdt) || '0901234567',
      taiKhoan: (pending && pending.taiKhoan) || 'huykhang666',
      email: (pending && pending.email) || 'huykhang666@gmail.com',
      diaChi: (pending && pending.diaChi) || 'TP. Hồ Chí Minh',
      isProfileComplete: true,
      diemTichLuy: 100,
      hangThanhVien: 'S-Member',
      avatar: (pending && pending.avatar) || '',
      token: (pending && pending.token) || ('cust_token_' + Date.now())
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(completeUser));
    localStorage.setItem('customer_token', completeUser.token);
    localStorage.removeItem(PENDING_STORAGE_KEY);

    try {
      let regList = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
      const idx = regList.findIndex(u => (completeUser.email && u.email && u.email.toLowerCase() === completeUser.email.toLowerCase()) || (completeUser.sdt && u.sdt && u.sdt === completeUser.sdt));
      if (idx > -1) regList[idx] = { ...regList[idx], ...completeUser };
      else regList.push(completeUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(regList));
    } catch (e) {}

    window.location.href = '../index.html';
  };

  window.handleCompleteRegistration = function (event) {
    event.preventDefault();

    const phone = (document.getElementById('reg-phone')?.value || '').trim().replace(/\s/g, '');
    const fullname = (document.getElementById('reg-fullname')?.value || '').trim();
    const username = (document.getElementById('reg-username')?.value || '').trim();
    const email = (document.getElementById('reg-email')?.value || '').trim();
    const dob = document.getElementById('reg-dob')?.value || '';
    const address = (document.getElementById('reg-address')?.value || '').trim();
    const gender = document.querySelector('input[name="reg-gender"]:checked')?.value || 'Nam';
    const password = document.getElementById('reg-password')?.value || '';
    const passwordConfirm = document.getElementById('reg-password-confirm')?.value || '';
    const isStudent = document.getElementById('reg-is-student')?.checked || false;
    const isBusiness = document.getElementById('reg-is-business')?.checked || false;

    // Validate
    let validPhone = phone || '0901234567';
    const phoneRegex = /^(0)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (phone && !phoneRegex.test(phone)) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số (Ví dụ: 0901234567)');
      document.getElementById('reg-phone')?.focus();
      return;
    }

    if (!fullname) {
      alert('Vui lòng nhập họ và tên của bạn');
      document.getElementById('reg-fullname')?.focus();
      return;
    }

    // Validate password nếu có nhập
    if (password) {
      if (password.length < 6) {
        alert('Mật khẩu phải có tối thiểu 6 ký tự');
        document.getElementById('reg-password')?.focus();
        return;
      }
      if (password !== passwordConfirm) {
        alert('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!');
        document.getElementById('reg-password-confirm')?.focus();
        return;
      }
    }

    const submitBtn = document.getElementById('btn-submit-registration');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang lưu thông tin...';
    }

    // Tạo đối tượng người dùng hoàn chỉnh
    const completeUser = {
      type: 'customer',
      role: 'CUSTOMER',
      maKH: 'KH_' + Math.floor(100000 + Math.random() * 900000),
      hoTen: fullname,
      sdt: validPhone || phone,
      taiKhoan: username || ('user_' + phone.slice(-4)),
      email: email,
      ngaySinh: dob,
      gioiTinh: gender,
      diaChi: address || 'TP. Hồ Chí Minh',
      isStudent: isStudent,
      isBusiness: isBusiness,
      avatar: currentAvatarData || '',
      isProfileComplete: true,
      diemTichLuy: isStudent ? 200 : 100,
      hangThanhVien: isStudent ? 'S-Student' : 'S-Null',
      token: 'cust_token_' + Date.now()
    };

    // 1. Lưu vào cellphones_auth_user
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(completeUser));
    localStorage.setItem('customer_token', completeUser.token);

    // 2. Lưu vào danh sách tài khoản đã đăng ký (samamobile_registered_users)
    try {
      let regList = [];
      const oldRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (oldRaw) regList = JSON.parse(oldRaw);
      // Cập nhật nếu đã có hoặc thêm mới
      const existingIdx = regList.findIndex(u => (u.email && completeUser.email && u.email.toLowerCase() === completeUser.email.toLowerCase()) || (u.sdt && completeUser.sdt && u.sdt.replace(/\s/g, "") === completeUser.sdt.replace(/\s/g, "")));
      if (existingIdx > -1) {
        regList[existingIdx] = completeUser;
      } else {
        regList.push(completeUser);
      }
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(regList));
    } catch (e) {}

    // 3. Xóa dữ liệu tạm
    localStorage.removeItem(PENDING_STORAGE_KEY);

    // 4. Thông báo và chuyển hướng vào index.html
    showToast('Hoàn tất đăng ký thành công! Đang chuyển hướng...', 'success');

    setTimeout(() => {
      // Kiểm tra nếu có redirect quay lại cart hoặc trang trước
      const redirectUrl = sessionStorage.getItem('redirect_after_login') || '../index.html';
      sessionStorage.removeItem('redirect_after_login');
      if (redirectUrl === 'index.html') redirectUrl = '../index.html';
      window.location.href = redirectUrl;
    }, 1200);
  };

  // Toast helper
  function showToast(msg, type = 'info') {
    const toast = document.getElementById('reg-toast');
    if (!toast) return;

    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-white font-extrabold text-xs flex items-center gap-2.5 transition-all transform duration-200 ${
      type === 'success' ? 'bg-emerald-600' : 'bg-[#0057B7]'
    }`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i><span>${msg}</span>`;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  }

})();
