/**
 * AUTHENTICATION & LOGIN MODAL HANDLER
 * Phân luồng đăng nhập:
 * - Đăng nhập Quản trị viên / Nhân viên (Admin/Staff) -> Chuyển hướng vào admin.html
 * - Đăng nhập Khách hàng / Người dùng (Customer/User) -> Ở lại trang người dùng index.html và hiển thị thông tin tài khoản
 */

(function () {
  const API_BASE = (window.location.protocol === 'file:' || window.location.port === '5500') 
    ? 'http://localhost:8080/api' 
    : '/api';

  const AUTH_STORAGE_KEY = 'cellphones_auth_user';

  // Danh mục tài khoản mẫu (Offline Demo / Fallback)
  const DEMO_STAFF = {
    'admin': { type: 'staff', username: 'admin', tenNhanVien: 'Nguyễn Văn Quản', tenQuyen: 'Quản trị viên', maNV: 'NV001' },
    'quanly': { type: 'staff', username: 'quanly', tenNhanVien: 'Nguyễn Văn Quản', tenQuyen: 'Quản lý cửa hàng', maNV: 'NV001' },
    'thungan': { type: 'staff', username: 'thungan', tenNhanVien: 'Trần Thị Thu Ngân', tenQuyen: 'Thu ngân', maNV: 'NV002' },
    'banhang': { type: 'staff', username: 'banhang', tenNhanVien: 'Lê Văn Bán Hàng', tenQuyen: 'Bán hàng', maNV: 'NV003' },
    'kho': { type: 'staff', username: 'kho', tenNhanVien: 'Hoàng Thủ Kho', tenQuyen: 'Thủ kho', maNV: 'NV005' },
    'kythuat': { type: 'staff', username: 'kythuat', tenNhanVien: 'Phạm Kỹ Thuật', tenQuyen: 'Kỹ thuật & Bảo hành', maNV: 'NV004' }
  };

  const DEMO_CUSTOMERS = {
    '0987654321': { type: 'customer', maKH: 'KH001', hoTen: 'Nguyễn Hoàng Long', sdt: '0987654321', email: 'long.nh@gmail.com', diaChi: '128 Trần Duy Hưng, Cầu Giấy, Hà Nội' },
    '0912345678': { type: 'customer', maKH: 'KH002', hoTen: 'Lê Thị Ngọc Mai', sdt: '0912345678', email: 'mai.le@yahoo.com', diaChi: '45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh' },
    '0903888999': { type: 'customer', maKH: 'KH003', hoTen: 'Trần Minh Đức', sdt: '0903888999', email: 'duc.tran@outlook.com', diaChi: '23 Nguyễn Văn Linh, Đà Nẵng' }
  };

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

      // 1. Gọi API Backend Spring Boot
      try {
        const resp = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && (data.user || data.success)) {
          const u = data.user || {};
          const role = (data.role || u.maQuyen || 'ADMIN').toUpperCase();
          const userObj = {
            type: data.type || 'staff',
            username: u.username || username,
            tenNhanVien: u.tenNhanVien || username,
            tenQuyen: u.tenQuyen || role,
            maNV: u.maNV || 'NV001',
            role: role,
            token: data.token
          };
          if (data.token) {
            localStorage.setItem('admin_token', data.token);
          }
          this.setUser(userObj);
          return { success: true, redirect: data.redirect || 'admin.html', user: userObj };
        } else {
          throw new Error(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
        }
      } catch (err) {
        throw new Error(err.message || 'Lỗi kết nối máy chủ xác thực');
      }
    },

    /**
     * Đăng nhập Khách hàng / Người dùng
     */
    async loginCustomer(phone) {
      phone = (phone || '').trim().replace(/\s/g, '');
      if (!phone) {
        throw new Error('Vui lòng nhập số điện thoại khách hàng');
      }

      // 1. Gọi API Backend Spring Boot
      try {
        const resp = await fetch(`${API_BASE}/auth/customer-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && data.user) {
          const userObj = {
            type: 'customer',
            maKH: data.user.maKH,
            hoTen: data.user.hoTen,
            sdt: data.user.sdt,
            email: data.user.email,
            diaChi: data.user.diaChi
          };
          this.setUser(userObj);
          return { success: true, redirect: 'index.html', user: userObj };
        } else {
          throw new Error(data.error || 'Số điện thoại chưa có trên hệ thống. Quý khách vui lòng đặt hàng để đăng ký!');
        }
      } catch (err) {
        throw new Error(err.message || 'Lỗi kết nối máy chủ');
      }
    },

    logout() {
      this.setUser(null);
      const isFile = window.location.protocol === 'file:';
      if (window.location.pathname.includes('admin')) {
        window.location.href = isFile ? 'index.html' : '/home';
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

      // Fallback tra cứu từ LocalStore nếu có
      if (window.localStorage.getItem('QuanLyCuaHangDienThoai_DB')) {
        try {
          const db = JSON.parse(window.localStorage.getItem('QuanLyCuaHangDienThoai_DB'));
          if (db && db.donHangOnline) {
            return db.donHangOnline.filter(o => o.sdtNguoiNhan === phone);
          }
        } catch (e) {}
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
          if (nameEl) nameEl.textContent = isEn ? 'Admin Portal' : 'Vào Quản Trị';
          // Bỏ hoàn toàn phần hiển thị role (banhang) trong nút theo yêu cầu của người dùng
          if (roleEl) roleEl.remove();
          const linkEl = staffBadge.querySelector('a');
          if (linkEl) {
            const fullName = user.tenNhanVien ? (user.tenNhanVien + ' (' + (user.tenQuyen || user.username) + ')') : user.username;
            linkEl.title = (isEn ? 'Admin Portal: ' : 'Vào Quản Trị: ') + fullName;
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
          if (nameEl) nameEl.textContent = user.hoTen || 'Khách Hàng';
          if (phoneEl) phoneEl.textContent = user.sdt || '';
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
                  <input type="text" name="username" required value="admin" placeholder="admin / quanly / thungan / banhang / kythuat" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
                  <input type="password" name="password" required value="123456" placeholder="Mật khẩu (mặc định: 123456)" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">
                </div>
                <button type="submit" class="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all">
                  <i class="fa-solid fa-right-to-bracket mr-2"></i> Đăng Nhập
                </button>
                <div class="pt-2 border-t text-xs text-slate-500">
                  <span class="font-bold">Đăng nhập nhanh mẫu:</span>
                  <div class="grid grid-cols-3 gap-1.5 mt-2">
                    <button type="button" onclick="window.quickStaffLogin('admin')" class="px-2 py-1 bg-slate-100 hover:bg-[#F0FDF4] text-[11px] font-bold rounded-lg border">admin</button>
                    <button type="button" onclick="window.quickStaffLogin('banhang')" class="px-2 py-1 bg-slate-100 hover:bg-[#F0FDF4] text-[11px] font-bold rounded-lg border">banhang</button>
                    <button type="button" onclick="window.quickStaffLogin('thungan')" class="px-2 py-1 bg-slate-100 hover:bg-[#F0FDF4] text-[11px] font-bold rounded-lg border">thungan</button>
                    <button type="button" onclick="window.quickStaffLogin('kho')" class="px-2 py-1 bg-slate-100 hover:bg-[#F0FDF4] text-[11px] font-bold rounded-lg border">kho</button>
                    <button type="button" onclick="window.quickStaffLogin('kythuat')" class="px-2 py-1 bg-slate-100 hover:bg-[#F0FDF4] text-[11px] font-bold rounded-lg border">kythuat</button>
                  </div>
                </div>
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

  window.quickStaffLogin = async function(user) {
    try {
      await Auth.loginStaff(user, '123456');
      const isFile = window.location.protocol === 'file:';
      window.location.href = isFile ? 'admin.html' : '/admin';
    } catch (e) {
      alert(e.message || 'Lỗi đăng nhập');
    }
  };

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
      const uLower = username.toLowerCase();
      // Nếu là tài khoản nhân viên / admin
      if (DEMO_STAFF[uLower]) {
        await Auth.loginStaff(uLower, password);
        const isFile = window.location.protocol === 'file:';
        window.location.href = isFile ? 'admin.html' : '/admin';
        return;
      }

      // Nếu là số điện thoại hoặc khách hàng
      if (DEMO_CUSTOMERS[username] || /^[0-9]{9,11}$/.test(username)) {
        await Auth.loginCustomer(username);
        window.closeLoginModal();
        Auth.updateUI();
        alert('Đăng nhập thành công với tài khoản Khách hàng: ' + username);
        return;
      }

      // Backend fallback
      await Auth.loginStaff(username, password);
      const isFile = window.location.protocol === 'file:';
      window.location.href = isFile ? 'admin.html' : '/admin';
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

    // Quick Login cho Khách hàng
    const quickCustomerBtns = document.querySelectorAll('.btn-quick-customer');
    quickCustomerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const phone = btn.dataset.phone;
        if (customerForm) {
          customerForm.phone.value = phone;
          customerForm.dispatchEvent(new Event('submit'));
        }
      });
    });

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
            submitBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Thành công! Đang vào Quản trị...';
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

    // Quick Login cho Admin
    const quickStaffBtns = document.querySelectorAll('.btn-quick-staff');
    quickStaffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const u = btn.dataset.user;
        if (staffForm) {
          staffForm.username.value = u;
          staffForm.password.value = '123456';
          staffForm.dispatchEvent(new Event('submit'));
        }
      });
    });

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

