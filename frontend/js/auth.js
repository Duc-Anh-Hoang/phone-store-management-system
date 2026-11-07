/**
 * AUTHENTICATION & LOGIN MODAL HANDLER
 * Phân luồng đăng nhập:
 * - Đăng nhập Quản trị viên / Nhân viên (Admin/Staff) -> Chuyển hướng vào admin.html
 * - Đăng nhập Khách hàng / Người dùng (Customer/User) -> Ở lại trang người dùng index.html và hiển thị thông tin tài khoản
 */

(function () {
  const getApiBase = () => window.API_BASE || (
    (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '5501' || window.location.port === '3000'))
      ? 'http://localhost:5132/api'
      : '/api'
  );
  var API_BASE = getApiBase();

  const AUTH_STORAGE_KEY = 'cellphones_auth_user';

  const Auth = {
    getUser() {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!saved) return null;
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    },

    setUser(user) {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      this.updateUI();
    },

    isStaff() {
      const u = this.getUser();
      return u && u.type === 'staff';
    },

    isCustomer() {
      const u = this.getUser();
      return u && u.type === 'customer';
    },

    /**
     * Đăng nhập Nhân viên / Admin
     */
    async loginStaff(username, password) {
      username = (username || '').trim().toLowerCase();
      password = (password || '').trim();

      // 1. Gọi API Backend .NET 10 (nếu backend đang chạy)
      try {
        const resp = await fetch(`${getApiBase()}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && (data.user || data.token)) {
          const u = data.user || {};
          const role = (u.role || data.role || u.maQuyen || 'ADMIN').toUpperCase();
          const userObj = {
            type: data.type || 'staff',
            username: u.username || username,
            tenNhanVien: u.hoTen || u.tenNhanVien || username,
            tenQuyen: u.tenQuyen || role,
            maNV: u.maNV || '',
            role: role,
            token: data.token
          };
          if (data.token) {
            localStorage.setItem('admin_token', data.token);
          }
          this.setUser(userObj);
          return { success: true, redirect: data.redirect || (window.location.pathname.includes('/pages/') ? 'admin.html' : 'pages/admin.html'), user: userObj };
        } else if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
          throw new Error(data.message || data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
        }
      } catch (err) {
        if (err.message && (err.message.includes('mật khẩu') || err.message.includes('Tên đăng nhập') || err.message.includes('khóa'))) {
          throw err;
        }
        console.warn('Backend chưa online hoặc không kết nối được cổng 8080. Kiểm tra tài khoản mẫu seed hệ thống...');
      }

      // 2. Dự phòng tài khoản Seed (khớp chính xác với DbSeeder.cs)
      const SEED_STAFF = {
        'admin':   { hoTen: 'Nguyễn Văn Quản Trị', maNV: 'NV001', role: 'ADMIN', tenQuyen: 'Quản trị viên' },
        'quanly':  { hoTen: 'Trần Thị Quản Lý', maNV: 'NV002', role: 'MANAGER', tenQuyen: 'Quản lý' },
        'kythuat': { hoTen: 'Lê Văn Kỹ Thuật', maNV: 'NV003', role: 'TECH', tenQuyen: 'Kỹ thuật & Bảo hành' },
        'kho':     { hoTen: 'Phạm Văn Kho', maNV: 'NV004', role: 'WAREHOUSE', tenQuyen: 'Thủ kho' },
        'banhang': { hoTen: 'Hoàng Thị Bán Hàng', maNV: 'NV005', role: 'SALES', tenQuyen: 'Bán hàng' },
        'thungan': { hoTen: 'Đỗ Thị Thu Ngân', maNV: 'NV006', role: 'CASHIER', tenQuyen: 'Thu ngân' }
      };

      const matched = SEED_STAFF[username];
      const validPasswords = ['admin123', '123456', 'admin'];
      if (matched && validPasswords.includes(password)) {
        const fallbackToken = 'offline_admin_token_' + Date.now();
        const userObj = {
          type: 'staff',
          username: username,
          tenNhanVien: matched.hoTen,
          tenQuyen: matched.tenQuyen,
          maNV: matched.maNV,
          role: matched.role,
          token: fallbackToken
        };
        localStorage.setItem('admin_token', fallbackToken);
        this.setUser(userObj);
        return { success: true, redirect: (window.location.pathname.includes('/pages/') ? 'admin.html' : 'pages/admin.html'), user: userObj };
      }

      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
    },

    /**
     * Đăng nhập Khách hàng / Người dùng
     */
    async loginCustomer(phone) {
      phone = (phone || '').trim().replace(/\s/g, '');
      if (!phone) {
        throw new Error('Vui lòng nhập số điện thoại khách hàng');
      }

      // 1. Kiểm tra tài khoản đã hoàn tất thông tin chưa
      let existingProfile = null;
      try {
        const regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
        existingProfile = regList.find(reg => reg.sdt && reg.sdt.replace(/\s/g, '') === phone && reg.isProfileComplete);
      } catch (e) {}

      if (existingProfile && existingProfile.isProfileComplete) {
        this.setUser(existingProfile);
        return { success: true, redirect: 'index.html', user: existingProfile };
      }

      // 2. Thử gọi API Backend nếu online
      try {
        const resp = await fetch(`${API_BASE}/auth/customer-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && data.user && data.user.hoTen && data.user.isProfileComplete) {
          const userObj = {
            type: 'customer',
            role: 'CUSTOMER',
            maKH: data.user.maKH,
            hoTen: data.user.hoTen,
            sdt: data.user.sdt,
            email: data.user.email,
            diaChi: data.user.diaChi,
            isProfileComplete: true,
            token: data.token
          };
          this.setUser(userObj);
          return { success: true, redirect: 'index.html', user: userObj };
        }
      } catch (err) {
        // Backend offline -> xử lý frontend
      }

      // 3. Nếu là số mới / chưa có hồ sơ: Tự động khởi tạo và đăng nhập ngay
      const userObj = {
        type: 'customer',
        role: 'CUSTOMER',
        maKH: 'KH_' + Math.floor(100000 + Math.random() * 900000),
        hoTen: 'Khách hàng ' + phone.slice(-4),
        sdt: phone,
        taiKhoan: 'user_' + phone.slice(-4),
        email: '',
        diaChi: 'TP. Hồ Chí Minh',
        isProfileComplete: true,
        diemTichLuy: 100,
        hangThanhVien: 'S-Member',
        token: 'cust_token_' + Date.now()
      };
      localStorage.setItem('customer_token', userObj.token);
      this.setUser(userObj);
      try {
        let regList = JSON.parse(localStorage.getItem('samamobile_registered_users') || '[]');
        const idx = regList.findIndex(u => u.sdt && u.sdt.replace(/\s/g, '') === phone);
        if (idx > -1) regList[idx] = { ...regList[idx], ...userObj };
        else regList.push(userObj);
        localStorage.setItem('samamobile_registered_users', JSON.stringify(regList));
      } catch (e) {}
      return { success: true, redirect: 'index.html', user: userObj };
    },

    async logout() {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('customer_token');
      if (token) {
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ token })
          });
        } catch (e) {}
      }
      localStorage.removeItem('admin_token');
      localStorage.removeItem('customer_token');
      this.setUser(null);
      if (window.location.pathname.includes('admin') || window.location.href.includes('admin.html')) {
        if (typeof window.showAdminLoginScreen === 'function') {
          window.showAdminLoginScreen('Bạn đã đăng xuất thành công.');
          return;
        }
        window.location.reload();
      } else {
        window.location.reload();
      }
    },

    async lookupOrdersByPhone(phone) {
      phone = (phone || '').trim().replace(/\s/g, '');
      try {
        const resp = await fetch(`${API_BASE}/orders/phone/${phone}`);
        if (resp.ok) {
          return await resp.json();
        }
      } catch (e) {
        console.warn('Error fetching orders:', e.message);
      }
      return [];
    },

    updateUI() {
      const user = this.getUser();
      const loginBtn = document.getElementById('btn-header-login');
      const staffBadge = document.getElementById('header-staff-menu');
      const customerBadge = document.getElementById('header-customer-menu');

      if (!user) {
        if (loginBtn) {
          loginBtn.classList.remove('hidden');
          loginBtn.style.display = 'inline-flex';
        }
        if (staffBadge) {
          staffBadge.classList.add('hidden');
          staffBadge.style.display = 'none';
        }
        if (customerBadge) {
          customerBadge.classList.add('hidden');
          customerBadge.style.display = 'none';
        }
        return;
      }

      if (loginBtn) {
        loginBtn.classList.add('hidden');
        loginBtn.style.display = 'none';
      }

      if (user.type === 'staff') {
        // Giao diện khi Nhân viên / Admin đăng nhập
        if (customerBadge) {
          customerBadge.classList.add('hidden');
          customerBadge.style.display = 'none';
        }
        if (staffBadge) {
          staffBadge.classList.remove('hidden');
          staffBadge.style.display = 'inline-flex';
          staffBadge.style.alignItems = 'center';
          staffBadge.style.flexWrap = 'nowrap';
          const nameEl = document.getElementById('staff-header-name');
          const roleEl = document.getElementById('staff-header-role');
          const isEn = false && false.getLang() === 'en';
          if (nameEl) nameEl.textContent = user.tenNhanVien || user.username || (isEn ? 'Staff' : 'Nhân viên');
          // Bỏ hoàn toàn phần hiển thị role (banhang) trong nút theo yêu cầu của người dùng
          if (roleEl) roleEl.remove();
          const linkEl = staffBadge.querySelector('a');
          if (linkEl) {
            const fullName = user.tenNhanVien ? (user.tenNhanVien + ' (' + (user.tenQuyen || user.username) + ')') : user.username;
            linkEl.title = fullName;
          }
        }
      } else if (user.type === 'customer') {
        // Giao diện khi Khách hàng (Người dùng) đăng nhập
        if (staffBadge) {
          staffBadge.classList.add('hidden');
          staffBadge.style.display = 'none';
        }
        if (customerBadge) {
          customerBadge.classList.remove('hidden');
          customerBadge.style.display = 'inline-flex';
          customerBadge.style.alignItems = 'center';
          customerBadge.style.flexWrap = 'nowrap';
          const nameEl = document.getElementById('customer-header-name');
          const phoneEl = document.getElementById('customer-header-phone');
          const pointsEl = document.getElementById('customer-header-points');
          const avatarEl = document.getElementById('customer-header-avatar');

          const displayName = user.hoTen || user.username || 'Khách Hàng';
          const displayPoints = (user.diemTichLuy !== undefined ? user.diemTichLuy : 200);

          if (nameEl) nameEl.textContent = displayName;
          if (pointsEl) pointsEl.textContent = displayPoints + ' Đ';
          if (avatarEl) {
            if (user.avatar) {
              avatarEl.innerHTML = '<img src="' + user.avatar + '" alt="' + displayName + '" class="w-full h-full object-cover rounded-full">';
            } else {
              const initial = displayName.trim().charAt(0).toUpperCase() || 'K';
              avatarEl.innerHTML = '<span class="font-black text-xs text-[#1E3A8A]">' + initial + '</span>';
            }
          }
          if (phoneEl) phoneEl.textContent = user.sdt || '';

          // Cập nhật thông tin trong Popover Avatar Dropdown
          const popoverName = document.getElementById('customer-popover-name');
          const popoverPhone = document.getElementById('customer-popover-phone');
          const popoverPoints = document.getElementById('customer-popover-points');
          const popoverBadge = document.getElementById('customer-popover-badge');
          const popoverAvatar = document.getElementById('customer-popover-avatar');

          if (popoverName) popoverName.textContent = displayName;
          if (popoverPhone) popoverPhone.textContent = user.email || user.sdt || 'Chưa cập nhật SĐT';
          if (popoverPoints) popoverPoints.textContent = displayPoints;
          if (popoverBadge) {
            if (user.isStudent) {
              popoverBadge.textContent = 'S-Student -5%';
              popoverBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex-shrink-0';
            } else if (user.isBiz) {
              popoverBadge.textContent = 'Khách Doanh Nghiệp';
              popoverBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0';
            } else {
              popoverBadge.textContent = 'SamaMember';
              popoverBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0';
            }
          }
          if (popoverAvatar) {
            if (user.avatar) {
              popoverAvatar.innerHTML = '<img src="' + user.avatar + '" alt="' + displayName + '" class="w-full h-full object-cover rounded-full">';
            } else {
              const initial = displayName.trim().charAt(0).toUpperCase() || 'K';
              popoverAvatar.innerHTML = '<span class="font-black text-lg text-white">' + initial + '</span>';
            }
          }
        }

        // Tự động điền trước thông tin vào Form Đặt Hàng (Cả Section 4 và Modal)
        this.autoFillOrderForms(user);
      }
    },

    autoFillOrderForms(user) {
      if (!user) return;
      const forms = document.querySelectorAll('#section-order-form, #modal-order-form');
      forms.forEach(form => {
        const nameInput = form.querySelector('[data-field="name"]');
        const phoneInput = form.querySelector('[data-field="phone"]');
        const addressInput = form.querySelector('[data-field="address"]');

        if (nameInput && !nameInput.value) nameInput.value = user.hoTen || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = user.sdt || '';
        if (addressInput && !addressInput.value) addressInput.value = user.diaChi || '';
      });
    },

    openModal(tab = 'tab-staff-login') {
      let authModal = document.getElementById('auth-modal');
      if (!authModal) {
        // Tạo dynamic auth modal nếu trang chưa có sẵn
        authModal = document.createElement('div');
        authModal.id = 'auth-modal';
        authModal.className = 'modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm';
        authModal.innerHTML = `
          <div class="modal-content-box bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shadow-md shadow-green-600/20">
                  <i class="fa-solid fa-shield-halved text-lg"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-800 text-base leading-tight">Cổng Đăng Nhập Hệ Thống</h3>
                  <p class="text-xs text-slate-500">Đăng nhập Quản trị viên & Nhân viên</p>
                </div>
              </div>
              <button type="button" onclick="window.CellphoneSAuth.closeModal()" class="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div class="p-6">
              <div id="staff-login-error" class="hidden p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"></div>
              <form id="form-staff-login" onsubmit="window.handleStaffLoginSubmit ? window.handleStaffLoginSubmit(event) : null" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Tên đăng nhập / Mã nhân viên</label>
                  <input type="text" name="username" required placeholder="admin / quanly / thungan / banhang / kythuat" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
                  <input type="password" name="password" required placeholder="Mật khẩu (mặc định: 123456)" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">
                </div>
                <button type="submit" class="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all">
                  <i class="fa-solid fa-right-to-bracket mr-2"></i> Đăng Nhập
                </button>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(authModal);
      }
      authModal.classList.remove('hidden');
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (tab) {
        this.switchTab(tab);
      }
    },

    closeModal() {
      const authModal = document.getElementById('auth-modal');
      if (authModal) {
        authModal.classList.add('hidden');
        authModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    switchTab(tabId) {
      const tabBtns = document.querySelectorAll('[data-auth-tab]');
      const tabPanes = document.querySelectorAll('.auth-tab-pane');
      tabBtns.forEach(b => {
        if (b.dataset.authTab === tabId) {
          b.classList.add('border-[#16A34A]', 'text-[#16A34A]');
          b.classList.remove('border-transparent', 'text-slate-500');
        } else {
          b.classList.remove('border-[#16A34A]', 'text-[#16A34A]');
          b.classList.add('border-transparent', 'text-slate-500');
        }
      });
      tabPanes.forEach(pane => {
        if (pane.id === tabId) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });
    }
  };

  window.CellphoneSAuth = window.cellphonesAuth = window.Auth = Auth;
  window.openLoginModal = function(preferredUser = '') {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
      Auth.openModal();
      modal = document.getElementById('auth-modal');
    }
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const err = document.getElementById('staff-login-error') || document.getElementById('login-error-msg');
    if (err) err.classList.add('hidden');
    const uInp = modal.querySelector('input[name="username"]');
    if (uInp) {
      if (preferredUser) uInp.value = preferredUser;
      setTimeout(() => uInp.focus(), 80);
    }
  };

  window.closeLoginModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.doLogout = () => Auth.logout();


  window.handleDirectLogin = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const form = e ? (e.target || document.getElementById('form-direct-login')) : document.getElementById('form-direct-login');
    if (!form) return;
    const username = (form.querySelector('[name="username"]')?.value || '').trim();
    const password = (form.querySelector('[name="password"]')?.value || '').trim();
    const errBox = document.getElementById('staff-login-error') || document.getElementById('login-error-msg');
    if (errBox) errBox.classList.add('hidden');

    if (!username) {
      if (errBox) {
        errBox.textContent = 'Vui lòng nhập tên tài khoản hoặc số điện thoại!';
        errBox.classList.remove('hidden');
      }
      return;
    }

    try {
      // Nếu là số điện thoại 9-11 số: đăng nhập tài khoản Khách hàng
      if (/^[0-9]{9,11}$/.test(username)) {
        await Auth.loginCustomer(username);
        window.closeLoginModal();
        Auth.updateUI();
        alert('Đăng nhập thành công với tài khoản Khách hàng: ' + username);
        return;
      }

      // Ngược lại: Đăng nhập Nhân viên / Quản trị viên
      await Auth.loginStaff(username, password);
      window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'admin.html';
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || 'Sai tên đăng nhập hoặc mật khẩu!';
        errBox.classList.remove('hidden');
      } else {
        alert(err.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    }
  };

  window.handleStaffLoginSubmit = window.handleDirectLogin;

  // Lắng nghe các sự kiện tương tác
  function initAuthListeners() {
    Auth.updateUI();

    const authModal = document.getElementById('auth-modal');
    const openBtns = document.querySelectorAll('.btn-open-login-modal');
    const closeBtns = document.querySelectorAll('.btn-close-auth-modal');

    openBtns.forEach(b => b.addEventListener('click', (e) => {
      e.preventDefault();
      const prefTab = b.getAttribute('data-pref-tab') || 'tab-staff-login';
      Auth.openModal(prefTab);
    }));

    closeBtns.forEach(b => b.addEventListener('click', () => Auth.closeModal()));

    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) Auth.closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
          Auth.closeModal();
        }
      });
    }

    // Tabs trong Auth Modal
    const tabBtns = document.querySelectorAll('[data-auth-tab]');
    const tabPanes = document.querySelectorAll('.auth-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.authTab;
        tabBtns.forEach(b => {
          b.classList.remove('border-[#16A34A]', 'text-[#16A34A]');
          b.classList.add('border-transparent', 'text-slate-500');
        });
        btn.classList.add('border-[#16A34A]', 'text-[#16A34A]');
        btn.classList.remove('border-transparent', 'text-slate-500');

        tabPanes.forEach(pane => {
          if (pane.id === target) {
            pane.classList.remove('hidden');
          } else {
            pane.classList.add('hidden');
          }
        });
      });
    });

    // 1. Form Đăng nhập Khách hàng (Người dùng) -> Ở lại trang người dùng (index.html)
    const customerForm = document.getElementById('form-customer-login');
    const customerError = document.getElementById('customer-login-error');
    if (customerForm) {
      customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = customerForm.phone.value;
        const submitBtn = customerForm.querySelector('button[type="submit"]');

        if (customerError) customerError.classList.add('hidden');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang đăng nhập...';
        }

        try {
          const res = await Auth.loginCustomer(phone);
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Đăng nhập thành công!';
          }
          setTimeout(() => {
            closeModal();
            // Người dùng ở lại trang người dùng index.html và thấy thông tin của mình
            Auth.updateUI();
            showCustomerToast('Chào mừng ' + (res.user.hoTen || 'Quý khách') + ' đã đăng nhập!');
          }, 400);
        } catch (err) {
          if (customerError) {
            customerError.textContent = err.message || 'Đăng nhập không thành công';
            customerError.classList.remove('hidden');
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i> Đăng Nhập Khách Hàng';
          }
        }
      });
    }

    // 2. Form Đăng nhập Nhân viên / Admin -> Chuyển hướng vào admin.html
    const staffForm = document.getElementById('form-staff-login');
    const staffError = document.getElementById('staff-login-error');
    if (staffForm) {
      staffForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = staffForm.username.value;
        const password = staffForm.password.value;
        const submitBtn = staffForm.querySelector('button[type="submit"]');

        if (staffError) staffError.classList.add('hidden');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang xác thực Admin...';
        }

        try {
          const res = await Auth.loginStaff(username, password);
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Thành công! Đang xử lý...';
          }
          setTimeout(() => {
            closeModal();
            // Đăng nhập Admin thì vào Admin! Hỗ trợ clean url /admin hoặc admin.html
            const targetUrl = window.location.protocol === 'file:' ? 'admin.html' : '/admin';
            window.location.href = res.redirect || targetUrl;
          }, 400);
        } catch (err) {
          if (staffError) {
            staffError.textContent = err.message || 'Đăng nhập Admin không thành công';
            staffError.classList.remove('hidden');
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-shield-halved mr-2"></i> Đăng Nhập Quản Trị';
          }
        }
      });
    }

    // 3. Tra cứu đơn hàng
    const lookupForm = document.getElementById('form-order-lookup');
    const lookupResults = document.getElementById('lookup-results-container');
    const lookupError = document.getElementById('lookup-error-msg');

    if (lookupForm) {
      lookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = lookupForm.phone.value;
        const submitBtn = lookupForm.querySelector('button[type="submit"]');

        if (lookupError) lookupError.classList.add('hidden');
        if (lookupResults) lookupResults.innerHTML = '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tìm kiếm...';
        }

        try {
          const orders = await Auth.lookupOrdersByPhone(phone);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass mr-2"></i> Tra Cứu Đơn Hàng';
          }

          if (!orders || orders.length === 0) {
            if (lookupError) {
              lookupError.textContent = 'Không tìm thấy đơn hàng nào với số điện thoại này.';
              lookupError.classList.remove('hidden');
            }
            return;
          }

          if (lookupResults) {
            lookupResults.innerHTML = orders.map(ord => `
              <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-[#16A34A] font-mono">#${ord.maDH}</span>
                  <span class="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] font-bold text-[10px]">${ord.trangThai || 'Đang xử lý'}</span>
                </div>
                <div class="text-slate-600 space-y-0.5">
                  <div><strong>Người nhận:</strong> ${ord.tenNguoiNhan} (${ord.sdtNguoiNhan})</div>
                  <div><strong>Địa chỉ:</strong> ${ord.diaChiGiao}</div>
                  <div><strong>Tổng tiền:</strong> <span class="text-rose-600 font-bold">${new Intl.NumberFormat('vi-VN').format(ord.tongTien)} đ</span></div>
                  <div><strong>Ngày đặt:</strong> ${ord.ngayDat ? new Date(ord.ngayDat).toLocaleString('vi-VN') : 'Vừa xong'}</div>
                </div>
              </div>
            `).join('');
          }
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass mr-2"></i> Tra Cứu Đơn Hàng';
          }
          if (lookupError) {
            lookupError.textContent = 'Lỗi tra cứu đơn hàng: ' + err.message;
            lookupError.classList.remove('hidden');
          }
        }
      });
    }

    // Modal xem Đơn hàng & Thông tin cá nhân của Khách hàng
    const btnOpenCustomerOrders = document.getElementById('btn-open-customer-orders');
    if (btnOpenCustomerOrders) {
      btnOpenCustomerOrders.addEventListener('click', async (e) => {
        e.preventDefault();
        const user = Auth.getUser();
        if (!user || user.type !== 'customer') return;
        
        openModal();
        // Chuyển sang Tab tra cứu và tự động tìm theo SĐT khách hàng
        const tabLookupBtn = document.querySelector('[data-auth-tab="tab-customer-lookup"]');
        if (tabLookupBtn) tabLookupBtn.click();

        if (lookupForm && user.sdt) {
          lookupForm.phone.value = user.sdt;
          lookupForm.dispatchEvent(new Event('submit'));
        }
      });
    }

    // Đăng xuất
    const logoutBtns = document.querySelectorAll('.btn-do-logout');
    logoutBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    }));

    function showCustomerToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300';
      toast.innerHTML = `<i class="fa-solid fa-circle-check text-xl"></i><span class="font-bold text-xs">${msg}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthListeners);
  } else {
    initAuthListeners();
  }
})();



  /**
   * Đăng nhập nhanh 1-Click cho nhân viên / admin
   */
  window.quickStaffLogin = async function(role) {
    const roleMap = {
      admin: { username: 'admin', name: 'Quản Trị Viên' },
      quanly: { username: 'quanly', name: 'Quản Lý Cửa Hàng' },
      banhang: { username: 'banhang', name: 'Nhân Viên Bán Hàng' },
      thungan: { username: 'thungan', name: 'Nhân Viên Thu Ngân' },
      kho: { username: 'kho', name: 'Thủ Kho' },
      kythuat: { username: 'kythuat', name: 'Kỹ Thuật Viên' }
    };

    const target = roleMap[role] || roleMap.admin;
    const staffUser = {
      username: target.username,
      hoTen: target.name,
      type: 'staff',
      vaiTro: role.toUpperCase(),
      token: 'demo-staff-token-' + role
    };

    Auth.setUser(staffUser);
    alert('Đăng nhập thành công với quyền ' + target.name + '! Đang chuyển hướng vào Admin...');
    window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'admin.html';
  };

  /**
   * Modal / Thông tin Trả góp 0%
   */
  window.openInstallmentModal = function() {
    if (window.CellphoneSCart && typeof window.CellphoneSCart.showToast === 'function') {
      window.CellphoneSCart.showToast('Chương trình Trả Góp 0% áp dụng cho thẻ tín dụng kỳ hạn 3-12 tháng qua cổng Napas!', 'info');
    } else {
      alert('Chương trình Trả Góp 0% Lãi Suất:\n- Áp dụng cho mọi hóa đơn từ 3.000.000 đ\n- Hỗ trợ thẻ tín dụng Visa/MasterCard/JCB qua hơn 25 ngân hàng liên kết\n- Kỳ hạn linh hoạt 3, 6, 9, 12 tháng\n- Vui lòng chọn phương thức "Trả Góp 0%" tại bước thanh toán giỏ hàng!');
    }
  };
  