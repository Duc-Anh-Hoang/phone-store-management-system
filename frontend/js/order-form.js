/**
 * XỬ LÝ VALIDATE FORM VÀ GỬI ĐƠN HÀNG (CẢ Ở SECTION 4 VÀ TRONG MODAL)
 */

function initOrderForms() {
  const forms = [
    document.getElementById('section-order-form'),
    document.getElementById('modal-order-form')
  ].filter(Boolean);

  // Regex kiểm tra số điện thoại Việt Nam hợp lệ
  const phoneRegex = /^(0)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;

  forms.forEach(form => {
    // 1. Lắng nghe thay đổi phương thức thanh toán để hiện ghi chú hướng dẫn
    const paymentRadios = form.querySelectorAll('input[type="radio"][name$="-payment"]');
    const paymentNotes = form.querySelectorAll('.payment-instruction-box');

    paymentRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        paymentNotes.forEach(box => {
          if (box.dataset.method === radio.value) {
            box.classList.remove('hidden');
          } else {
            box.classList.add('hidden');
          }
        });
      });
    });

    // 2. Validate form khi submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Họ tên
      const nameInput = form.querySelector('[data-field="name"]');
      const nameError = form.querySelector('[data-error="name"]');
      if (nameInput && nameError) {
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
          showError(nameInput, nameError, 'Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự)');
          isValid = false;
        } else {
          clearError(nameInput, nameError);
        }
      }

      // Số điện thoại
      const phoneInput = form.querySelector('[data-field="phone"]');
      const phoneError = form.querySelector('[data-error="phone"]');
      if (phoneInput && phoneError) {
        const cleanPhone = phoneInput.value.trim().replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          showError(phoneInput, phoneError, 'Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (VD: 0987654321)');
          isValid = false;
        } else {
          clearError(phoneInput, phoneError);
        }
      }

      // Tỉnh / Thành phố
      const cityInput = form.querySelector('[data-field="city"]');
      const cityError = form.querySelector('[data-error="city"]');
      if (cityInput && cityError) {
        if (!cityInput.value) {
          showError(cityInput, cityError, 'Vui lòng chọn Tỉnh/Thành phố nhận hàng');
          isValid = false;
        } else {
          clearError(cityInput, cityError);
        }
      }

      // Địa chỉ cụ thể
      const addressInput = form.querySelector('[data-field="address"]');
      const addressError = form.querySelector('[data-error="address"]');
      if (addressInput && addressError) {
        if (!addressInput.value.trim() || addressInput.value.trim().length < 5) {
          showError(addressInput, addressError, 'Vui lòng nhập địa chỉ chi tiết (Số nhà, tên đường, phường/xã)');
          isValid = false;
        } else {
          clearError(addressInput, addressError);
        }
      }

      if (!isValid) return;

      // 3. Tiến hành xử lý gửi đơn hàng tới Backend Java Spring Boot
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;

      // Trạng thái đang gửi
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang kết nối Backend xử lý đơn hàng...
        </span>
      `;

      // Chuẩn bị dữ liệu theo đúng chuẩn OrderRequestDTO của Spring Boot
      const paymentInput = form.querySelector('input[type="radio"][name$="-payment"]:checked');
      let method = paymentInput ? paymentInput.value : 'cod';
      // Chuẩn hóa sang constraint trong database Table.sql: 'cod', 'chuyen_khoan', 'the'
      let dbPaymentMethod = 'cod';
      if (method === 'qr' || method === 'chuyen_khoan') dbPaymentMethod = 'chuyen_khoan';
      else if (method === 'card' || method === 'installment' || method === 'the') dbPaymentMethod = 'the';

      const orderPayload = {
        tenNguoiNhan: nameInput.value.trim(),
        sdtNguoiNhan: phoneInput.value.trim().replace(/\s/g, ''),
        diaChiGiao: (addressInput ? addressInput.value.trim() : '') + ', ' + (cityInput ? cityInput.value : ''),
        phuongThucThanhToan: dbPaymentMethod,
        maKH: (window.TitanAuth && window.TitanAuth.getUser() && window.TitanAuth.getUser().maKH) 
          ? window.TitanAuth.getUser().maKH 
          : ('KH_' + phoneInput.value.trim().replace(/\s/g, '')),
        ghiChu: form.querySelector('input[placeholder*="Giao hàng"]') ? form.querySelector('input[placeholder*="Giao hàng"]').value.trim() : '',
        items: [
          {
            maHang: 'IP16PM_' + window.ProductState.storage.toUpperCase(),
            soLuong: window.ProductState.quantity,
            donGia: window.ProductState.getCurrentPrice(),
            mauSac: window.ProductState.getColorInfo().name,
            dungLuong: window.ProductState.getStorageInfo().capacity
          }
        ]
      };

      // Địa chỉ API Backend Spring Boot (Tự động nhận diện môi trường Docker / Localhost)
      const API_URL = (window.location.protocol === 'file:' || window.location.port === '5500') 
        ? 'http://localhost:8080/api/orders' 
        : '/api/orders';

      // Gọi API Backend với cơ chế tự động Fallback nếu chưa bật server
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Server trả về mã lỗi: ' + response.status);
        }
        return await response.json();
      })
      .then((serverData) => {
        console.log('>>> [BACKEND SUCCESS] Kết nối Spring Boot thành công:', serverData);
        const orderData = {
          code: serverData.maDH || ('DH' + Math.floor(100000 + Math.random() * 900000)),
          name: serverData.tenNguoiNhan || orderPayload.tenNguoiNhan,
          phone: serverData.sdtNguoiNhan || orderPayload.sdtNguoiNhan,
          address: serverData.diaChiGiao || orderPayload.diaChiGiao,
          product: window.ProductData.name,
          variant: `${window.ProductState.getColorInfo().name} - ${window.ProductState.getStorageInfo().capacity}`,
          quantity: window.ProductState.quantity,
          totalPrice: window.ProductState.formatCurrency(serverData.tongTien || window.ProductState.getTotalPrice()),
          date: serverData.ngayDat ? new Date(serverData.ngayDat).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
          isBackendConnected: true
        };
        finishSubmit(orderData);
      })
      .catch((error) => {
        console.warn('>>> [BACKEND OFFLINE/DEMO] Chưa phát hiện server Spring Boot tại http://localhost:8080. Đang dùng chế độ lưu trữ mô phỏng.', error.message);
        // Fallback: Tạo mã đơn mô phỏng để người dùng trải nghiệm mượt mà
        const orderData = {
          code: 'IP16-' + Math.floor(100000 + Math.random() * 900000),
          name: orderPayload.tenNguoiNhan,
          phone: orderPayload.sdtNguoiNhan,
          address: orderPayload.diaChiGiao,
          product: window.ProductData.name,
          variant: `${window.ProductState.getColorInfo().name} - ${window.ProductState.getStorageInfo().capacity}`,
          quantity: window.ProductState.quantity,
          totalPrice: window.ProductState.formatCurrency(window.ProductState.getTotalPrice()),
          date: new Date().toLocaleString('vi-VN'),
          isBackendConnected: false
        };
        finishSubmit(orderData);
      });

      function finishSubmit(orderData) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        if (window.OrderModal && window.OrderModal.isOpen()) {
          window.OrderModal.close();
        }

        showOrderSuccessModal(orderData);
        form.reset();
      }
    });
  });

  function showError(inputEl, errorEl, msg) {
    inputEl.classList.add('border-red-500', 'bg-red-50');
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }

  function clearError(inputEl, errorEl) {
    inputEl.classList.remove('border-red-500', 'bg-red-50');
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
}

/**
 * Hiển thị Popup xác nhận đặt hàng thành công
 */
function showOrderSuccessModal(orderData) {
  const successModal = document.getElementById('order-success-modal');
  if (!successModal) return;

  const codeEl = document.getElementById('success-order-code');
  const nameEl = document.getElementById('success-customer-name');
  const variantEl = document.getElementById('success-product-variant');
  const totalEl = document.getElementById('success-total-price');
  const dateEl = document.getElementById('success-order-date');

  if (codeEl) codeEl.textContent = orderData.code;
  if (nameEl) nameEl.textContent = `${orderData.name} (${orderData.phone})`;
  if (variantEl) variantEl.textContent = `${orderData.product} - ${orderData.variant} (Số lượng: ${orderData.quantity})`;
  if (totalEl) totalEl.textContent = orderData.totalPrice;
  if (dateEl) dateEl.textContent = orderData.date;

  const backendStatusEl = document.getElementById('success-backend-status');
  const backendStatusText = document.getElementById('success-backend-status-text');
  if (backendStatusEl && backendStatusText) {
    if (orderData.isBackendConnected) {
      backendStatusEl.className = "mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200";
      backendStatusText.textContent = "✓ Đã lưu đơn hàng vào CSDL SQL Server (QuanLyCuaHangDienThoai)";
    } else {
      backendStatusEl.className = "mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200";
      backendStatusText.textContent = "Đã cấu hình API Spring Boot (POST /api/orders) • Đang chạy chế độ Demo giao diện";
    }
  }

  successModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const closeBtn = successModal.querySelector('.btn-close-success');
  if (closeBtn) {
    closeBtn.onclick = () => {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    };
  }

  successModal.onclick = (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
}

window.initOrderForms = initOrderForms;
window.showOrderSuccessModal = showOrderSuccessModal;
