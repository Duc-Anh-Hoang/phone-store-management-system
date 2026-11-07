/**
 * PROFILE & ACCOUNT SETTINGS CONTROLLER - SAMAMOBILE
 * Quản lý Hồ sơ cá nhân, Cài đặt tài khoản, Đổi mật khẩu & Bảo mật
 */

(function () {
  'use strict';

  const AUTH_KEY = 'cellphones_auth_user';
  const REG_USERS_KEY = 'samamobile_registered_users';

  // Lấy dữ liệu user hiện tại
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(AUTH_KEY) || localStorage.getItem('auth_user');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  // Khởi tạo trang Profile & Cài đặt
  function initProfilePage() {
    let user = getCurrentUser();

    // Nếu chưa đăng nhập, tự tạo tài khoản khách mặc định hoặc dùng tài khoản gần nhất
    if (!user) {
      user = {
        hoTen: 'Khang Huy',
        email: 'huykhang666@gmail.com',
        sdt: '0383224846',
        taiKhoan: 'huykhang666',
        diaChi: '241 Lê Văn Việt, Phường Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
        ngaySinh: '2000-01-01',
        gioiTinh: 'Nam',
        diemTichLuy: 200,
        hangThanhVien: 'SamaMember',
        avatar: '',
        token: 'cust_' + Date.now()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }

    // Điền dữ liệu vào giao diện
    populateUserData(user);

    // Xử lý tab từ URL query (?tab=settings hoặc ?tab=profile)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') || window.location.hash.replace('#', '') || 'profile';
    switchProfileTab(tabParam);

    // Gắn sự kiện chuyển tab
    setupTabButtons();

    // Gắn sự kiện submit form
    setupForms(user);
    setupMainHeader(user);
  }

  // Điền dữ liệu vào các trường
  function populateUserData(user) {
    // Sidebar User Card
    const nameEls = document.querySelectorAll('.user-display-name');
    nameEls.forEach(el => el.textContent = user.hoTen || user.taiKhoan || 'Khách hàng');

    const emailEls = document.querySelectorAll('.user-display-email');
    emailEls.forEach(el => el.textContent = user.email || 'Chưa cập nhật');

    const phoneEls = document.querySelectorAll('.user-display-phone');
    phoneEls.forEach(el => el.textContent = user.sdt || 'Chưa cập nhật SĐT');

    const pointsEls = document.querySelectorAll('.user-display-points');
    pointsEls.forEach(el => el.textContent = (user.diemTichLuy || 200) + ' Đ');

    const badgeEls = document.querySelectorAll('.user-display-badge');
    badgeEls.forEach(el => el.textContent = user.hangThanhVien || 'SamaMember');

    // Avatar text or image
    const avatarLetter = (user.hoTen || user.taiKhoan || 'K').trim().charAt(0).toUpperCase();
    const avatarEls = document.querySelectorAll('.user-display-avatar');
    avatarEls.forEach(el => {
      if (user.avatar) {
        el.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="w-full h-full object-cover rounded-full" />`;
      } else {
        el.textContent = avatarLetter;
      }
    });

    // Form Hồ sơ cá nhân
    const inputName = document.getElementById('profile-fullname');
    if (inputName) inputName.value = user.hoTen || '';

    const inputPhone = document.getElementById('profile-phone');
    if (inputPhone) inputPhone.value = user.sdt || '';

    const inputEmail = document.getElementById('profile-email');
    if (inputEmail) inputEmail.value = user.email || '';

    const inputUsername = document.getElementById('profile-username');
    if (inputUsername) inputUsername.value = user.taiKhoan || (user.email ? user.email.split('@')[0] : '');

    const inputDob = document.getElementById('profile-dob');
    if (inputDob && user.ngaySinh) inputDob.value = user.ngaySinh;

    const inputAddress = document.getElementById('profile-address');
    if (inputAddress) inputAddress.value = user.diaChi || '';

    // Giới tính
    if (user.gioiTinh) {
      const genderRadio = document.querySelector(`input[name="profile-gender"][value="${user.gioiTinh}"]`);
      if (genderRadio) genderRadio.checked = true;
    }
  }

  // Chuyển tab Profile <-> Settings
  function switchProfileTab(tabName) {
    const isSettings = tabName === 'settings';

    const tabProfileBtn = document.getElementById('btn-tab-profile');
    const tabSettingsBtn = document.getElementById('btn-tab-settings');
    const panelProfile = document.getElementById('panel-profile');
    const panelSettings = document.getElementById('panel-settings');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');

    if (isSettings) {
      if (tabSettingsBtn) {
        tabSettingsBtn.className = 'w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 text-[#0057B7] font-bold text-sm shadow-xs transition-all';
      }
      if (tabProfileBtn) {
        tabProfileBtn.className = 'w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all';
      }
      if (panelProfile) panelProfile.classList.add('hidden');
      if (panelSettings) panelSettings.classList.remove('hidden');
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Cài đặt tài khoản & Bảo mật';
      document.title = 'Cài Đặt Tài Khoản & Bảo Mật - SamaMobile';
    } else {
      if (tabProfileBtn) {
        tabProfileBtn.className = 'w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 text-[#0057B7] font-bold text-sm shadow-xs transition-all';
      }
      if (tabSettingsBtn) {
        tabSettingsBtn.className = 'w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all';
      }
      if (panelSettings) panelSettings.classList.add('hidden');
      if (panelProfile) panelProfile.classList.remove('hidden');
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Hồ sơ cá nhân';
      document.title = 'Hồ Sơ Cá Nhân - SamaMobile';
    }

    // Cập nhật URL mà không reload trang
    const newUrl = window.location.pathname + '?tab=' + (isSettings ? 'settings' : 'profile');
    window.history.replaceState({ tab: tabName }, '', newUrl);
  }

  // Gắn sự kiện cho các nút tab
  function setupTabButtons() {
    const tabProfileBtn = document.getElementById('btn-tab-profile');
    if (tabProfileBtn) {
      tabProfileBtn.addEventListener('click', () => switchProfileTab('profile'));
    }

    const tabSettingsBtn = document.getElementById('btn-tab-settings');
    if (tabSettingsBtn) {
      tabSettingsBtn.addEventListener('click', () => switchProfileTab('settings'));
    }

    // Nút đổi avatar
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    if (btnChangeAvatar) {
      btnChangeAvatar.addEventListener('click', () => {
        const avatars = [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
        ];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        let u = getCurrentUser() || {};
        u.avatar = randomAvatar;
        localStorage.setItem(AUTH_KEY, JSON.stringify(u));
        populateUserData(u);
        showToast('Đã cập nhật ảnh đại diện mới!', 'success');
      });
    }
  }

  // Gắn sự kiện submit form
  function setupForms(initialUser) {
    // Form Cập nhật hồ sơ
    const formProfile = document.getElementById('form-update-profile');
    if (formProfile) {
      formProfile.addEventListener('submit', function (e) {
        e.preventDefault();

        const fullname = (document.getElementById('profile-fullname')?.value || '').trim();
        const phone = (document.getElementById('profile-phone')?.value || '').trim();
        const email = (document.getElementById('profile-email')?.value || '').trim();
        const dob = document.getElementById('profile-dob')?.value || '';
        const address = (document.getElementById('profile-address')?.value || '').trim();
        const gender = document.querySelector('input[name="profile-gender"]:checked')?.value || 'Nam';

        if (!fullname) {
          showToast('Vui lòng nhập họ và tên của bạn!', 'error');
          return;
        }

        let user = getCurrentUser() || initialUser;
        user.hoTen = fullname;
        user.sdt = phone;
        user.email = email;
        user.ngaySinh = dob;
        user.diaChi = address;
        user.gioiTinh = gender;

        // Lưu vào localStorage
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));

        // Cập nhật danh sách registered users nếu có
        try {
          let regList = JSON.parse(localStorage.getItem(REG_USERS_KEY) || '[]');
          const idx = regList.findIndex(r => (r.email && r.email.toLowerCase() === user.email.toLowerCase()) || r.taiKhoan === user.taiKhoan);
          if (idx > -1) {
            regList[idx] = { ...regList[idx], ...user };
          } else {
            regList.push(user);
          }
          localStorage.setItem(REG_USERS_KEY, JSON.stringify(regList));
        } catch (e) {}

        populateUserData(user);
        showToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
      });
    }

    // Form Đổi mật khẩu
    const formPassword = document.getElementById('form-change-password');
    if (formPassword) {
      formPassword.addEventListener('submit', function (e) {
        e.preventDefault();

        const currentPass = document.getElementById('pwd-current')?.value || '';
        const newPass = document.getElementById('pwd-new')?.value || '';
        const confirmPass = document.getElementById('pwd-confirm')?.value || '';

        if (!currentPass) {
          showToast('Vui lòng nhập mật khẩu hiện tại!', 'error');
          return;
        }
        if (!newPass || newPass.length < 6) {
          showToast('Mật khẩu mới phải có tối thiểu 6 ký tự!', 'error');
          return;
        }
        if (newPass !== confirmPass) {
          showToast('Mật khẩu xác nhận không trùng khớp!', 'error');
          return;
        }

        // Cập nhật mật khẩu thành công
        formPassword.reset();
        showToast('Đổi mật khẩu tài khoản thành công!', 'success');
      });
    }
  }

  // Toast thông báo nhỏ góc phải
  function showToast(message, type = 'success') {
    let container = document.getElementById('profile-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'profile-toast-container';
      container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none p-3';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${isSuccess ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'} text-xs sm:text-sm font-bold transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `
      <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'} text-base"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('opacity-0', 'translate-y-2'));

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
  window.showToast = showToast;
  window.switchProfileTab = switchProfileTab;

  // Toggle ẩn/hiện mật khẩu
  window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const icon = btn?.querySelector('i');
    if (icon) {
      icon.className = isPassword ? 'fa-solid fa-eye-slash text-slate-500' : 'fa-solid fa-eye text-slate-400';
    }
  };

  // Đăng xuất các thiết bị khác
  window.handleLogoutOtherSessions = function () {
    if (confirm('Bạn có muốn đăng xuất tài khoản khỏi tất cả các thiết bị và trình duyệt khác không?')) {
      showToast('Đã đăng xuất khỏi toàn bộ 2 phiên hoạt động khác thành công!', 'success');
    }
  };

  // Yêu cầu xóa tài khoản
  window.handleDeleteAccountRequest = function () {
    const reason = prompt('Vui lòng nhập lý do bạn muốn xóa tài khoản (hoặc nhấn OK để tiếp tục):');
    if (reason !== null) {
      showToast('Yêu cầu khóa/xóa tài khoản của bạn đã được ghi nhận. Hệ thống sẽ xử lý sau 14 ngày!', 'info');
    }
  };

  // Đăng xuất tài khoản
  window.doProfileLogout = function () {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?')) {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('customer_token');
      localStorage.removeItem('auth_user');
      window.location.href = '../index.html';
    }
  };


  // Thiết lập Header dùng chung trên trang Profile
  function setupMainHeader(user) {
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

    window.quickSearchTag = function (tag) {
      window.location.href = 'category.html?q=' + encodeURIComponent(tag);
    };

    window.filterPhoneBrand = function (brand) {
      window.location.href = 'category.html?type=dien-thoai&brand=' + encodeURIComponent(brand);
    };

    window.applySearchFilters = function () {
      const input = document.getElementById('search-input');
      const q = input ? input.value.trim() : '';
      if (q) window.location.href = 'category.html?q=' + encodeURIComponent(q);
    };

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.applySearchFilters();
        }
      });
    }

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

    // Cập nhật thông tin trên header
    const loginBtn = document.getElementById('btn-header-login');
    const custMenu = document.getElementById('header-customer-menu');
    if (loginBtn) loginBtn.classList.add('hidden');
    if (custMenu) {
      custMenu.style.display = 'flex';
      custMenu.classList.remove('hidden');
    }

    const custName = document.getElementById('customer-header-name');
    if (custName) custName.textContent = user.hoTen || user.taiKhoan || 'Khang Huy';

    const custPoints = document.getElementById('customer-header-points');
    if (custPoints) custPoints.textContent = (user.diemTichLuy != null ? user.diemTichLuy : 200) + ' Đ';

    const letter = (user.hoTen || user.taiKhoan || 'K').trim().charAt(0).toUpperCase();
    const custAvatar = document.getElementById('customer-header-avatar');
    if (custAvatar) {
      custAvatar.innerHTML = user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover rounded-full" />` : `<span class="font-black text-xs text-[#1E3A8A]">${letter}</span>`;
    }

    const popBadge = document.getElementById('customer-popover-badge');
    if (popBadge) {
      if (user.isStudent || user.hangThanhVien === 'S-Student' || user.hangThanhVien === 'S - Student') {
        popBadge.textContent = 'S-Student -5%';
        popBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex-shrink-0';
      } else {
        popBadge.textContent = user.hangThanhVien || 'SamaMember';
        popBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0';
      }
    }
    const popName = document.getElementById('customer-popover-name');
    if (popName) popName.textContent = user.hoTen || user.taiKhoan || 'Khang Huy';

    const popPhone = document.getElementById('customer-popover-phone');
    if (popPhone) popPhone.textContent = user.email || user.sdt || '';

    const popPoints = document.getElementById('customer-popover-points');
    if (popPoints) popPoints.textContent = user.diemTichLuy != null ? user.diemTichLuy : 200;

    const popAvatar = document.getElementById('customer-popover-avatar');
    if (popAvatar) {
      popAvatar.className = "w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center text-lg font-black shadow-md flex-shrink-0 overflow-hidden ring-2 ring-white";
      popAvatar.innerHTML = user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover rounded-full" />` : letter;
    }
  }

  // Khởi động khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilePage);
  } else {
    initProfilePage();
  }
})();
