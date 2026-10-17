/**
 * TITAN STORE - LOOKUP & UTILITY HANDLER
 * Tra cứu không cần đăng nhập (Phần A11 & B1):
 * - Tra cứu đơn hàng theo Mã đơn + Số điện thoại
 * - Tra cứu tình trạng bảo hành theo số IMEI 15 chữ số (/api/baohanh/imei/{imei})
 * - Form đăng ký tư vấn Thu cũ đổi mới & Mua trả góp 0%
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TitanLookup = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const API_BASE = (window.location.protocol === 'file:' || window.location.port === '5500') 
    ? 'http://localhost:8080/api' 
    : '/api';

  class LookupManager {
    openModal(defaultTab = 'order') {
      const modal = document.getElementById('lookup-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.switchTab(defaultTab);
      }
    }

    closeModal() {
      const modal = document.getElementById('lookup-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    switchTab(tabId) {
      const btnOrder = document.getElementById('btn-lookup-tab-order');
      const btnWarranty = document.getElementById('btn-lookup-tab-warranty');
      const tabOrder = document.getElementById('lookup-tab-order');
      const tabWarranty = document.getElementById('lookup-tab-warranty');

      if (tabId === 'order') {
        if (btnOrder) btnOrder.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 border-[#16A34A] text-[#16A34A]';
        if (btnWarranty) btnWarranty.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-navy';
        if (tabOrder) tabOrder.classList.remove('hidden');
        if (tabWarranty) tabWarranty.classList.add('hidden');
      } else {
        if (btnWarranty) btnWarranty.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 border-[#16A34A] text-[#16A34A]';
        if (btnOrder) btnOrder.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-navy';
        if (tabWarranty) tabWarranty.classList.remove('hidden');
        if (tabOrder) tabOrder.classList.add('hidden');
      }
    }

    /**
     * Tra cứu Đơn Hàng không cần đăng nhập
     */
    async lookupOrder() {
      const idInput = document.getElementById('lookup-order-id');
      const phoneInput = document.getElementById('lookup-order-phone');
      const resultBox = document.getElementById('lookup-order-result');

      const maDH = (idInput ? idInput.value : '').trim().toUpperCase();
      const phone = (phoneInput ? phoneInput.value : '').trim().replace(/\s/g, '');

      if (!maDH) {
        window.TitanCart.showToast('Vui lòng nhập Mã đơn hàng (VD: DH100234)', 'error');
        if (idInput) idInput.focus();
        return;
      }

      if (!phone || phone.length < 9) {
        window.TitanCart.showToast('Vui lòng nhập Số điện thoại đặt hàng', 'error');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!resultBox) return;
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tra cứu dữ liệu...</div>';

      let found = null;

      // 1. Thử gọi backend /api/orders/{id}
      try {
        const resp = await fetch(`${API_BASE}/orders/${maDH}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data && (!phone || data.sdtNguoiNhan.endsWith(phone.slice(-4)))) {
            found = data;
          }
        }
      } catch (e) {}

      // 2. Tra cứu trong admin db
      if (!found) {
        try {
          const raw = localStorage.getItem('titan_admin_db_v3');
          if (raw) {
            const db = JSON.parse(raw);
            if (Array.isArray(db.donHangOnline)) {
              found = db.donHangOnline.find(o => o.maDH.toUpperCase() === maDH && o.sdtNguoiNhan.includes(phone.slice(-4)));
            }
          }
        } catch (e) {}
      }

      // 3. Tra cứu trong orders cục bộ của SĐT
      if (!found) {
        try {
          const local = JSON.parse(localStorage.getItem(`titan_orders_${phone}`) || '[]');
          found = local.find(o => o.maDH.toUpperCase() === maDH);
        } catch (e) {}
      }

      // 4. Mẫu fallback nếu tra cứu đơn demo
      if (!found && maDH === 'DH100234') {
        found = {
          maDH: 'DH100234',
          ngayDat: '12/10/2026 08:15',
          tenNguoiNhan: 'Nguyễn Hoàng Long',
          sdtNguoiNhan: phone,
          diaChiGiao: '128 Trần Duy Hưng, Cầu Giấy, Hà Nội',
          tenHang: 'iPhone 18 Pro Max 256GB (Titan Sa Mạc)',
          tongTien: 31490000,
          trangThai: 'cho_xac_nhan',
          phuongThucThanhToan: 'cod'
        };
      }

      if (!found) {
        resultBox.innerHTML = `
          <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
            <i class="fa-solid fa-circle-exclamation text-lg mb-1 block"></i>
            Không tìm thấy thông tin đơn hàng <strong>${maDH}</strong> khớp với số điện thoại <strong>${phone}</strong>. Vui lòng kiểm tra lại!
          </div>
        `;
        return;
      }

      const statusMap = {
        cho_xac_nhan: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800' },
        da_xac_nhan: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
        dang_giao: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800' },
        hoan_thanh: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800' },
        da_huy: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800' }
      };
      const st = statusMap[found.trangThai] || statusMap.cho_xac_nhan;

      resultBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-md text-xs space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span class="font-extrabold text-navy font-mono text-sm">#${found.maDH}</span>
              <div class="text-[10px] text-slate-400">Ngày đặt: ${found.ngayDat || 'Gần đây'}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full font-bold text-xs ${st.color}">${st.label}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-slate-600">
            <div>Người nhận: <strong class="text-navy block">${found.tenNguoiNhan}</strong></div>
            <div>Số điện thoại: <strong class="text-navy block">${found.sdtNguoiNhan}</strong></div>
            <div class="col-span-2">Địa chỉ giao: <span class="text-navy font-medium block">${found.diaChiGiao}</span></div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <span class="font-semibold text-slate-600">Tổng thanh toán:</span>
            <span class="font-bold text-base text-rose-600">${window.TitanCart.formatMoney(found.tongTien)}</span>
          </div>
        </div>
      `;
    }

    /**
     * Tra cứu Bảo Hành theo số IMEI (vw_BaoHanhTrangThai)
     */
    async lookupWarranty() {
      const imeiInput = document.getElementById('lookup-imei-code');
      const resultBox = document.getElementById('lookup-warranty-result');

      const imei = (imeiInput ? imeiInput.value : '').trim().replace(/\s/g, '');

      if (!imei || imei.length < 10) {
        window.TitanCart.showToast('Vui lòng nhập số IMEI 15 chữ số hợp lệ', 'error');
        if (imeiInput) imeiInput.focus();
        return;
      }

      if (!resultBox) return;
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang truy vấn CSDL bảo hành...</div>';

      let found = null;

      // 1. Thử gọi backend /api/baohanh/imei/{imei}
      try {
        const resp = await fetch(`${API_BASE}/baohanh/imei/${imei}`);
        if (resp.ok) {
          found = await resp.json();
        }
      } catch (e) {}

      // 2. Tra cứu trong admin db
      if (!found) {
        try {
          const raw = localStorage.getItem('titan_admin_db_v3');
          if (raw) {
            const db = JSON.parse(raw);
            if (Array.isArray(db.baoHanh)) {
              found = db.baoHanh.find(b => (b.maImei || '').includes(imei));
            }
          }
        } catch (e) {}
      }

      // 3. Fallback demo
      if (!found && imei.startsWith('356789')) {
        found = {
          maBH: 'BH001',
          soImei: imei,
          tenHang: 'iPhone 18 Pro Max 512GB (Titan Tự Nhiên)',
          ngayBD: '11/10/2026',
          ngayKT: '11/10/2027',
          thoiHanThang: 12,
          conLaiNgay: 363,
          tinhTrang: 'Đang áp dụng bảo hành chính hãng'
        };
      }

      if (!found) {
        resultBox.innerHTML = `
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
            <i class="fa-solid fa-triangle-exclamation text-lg mb-1 block"></i>
            Không tìm thấy thông tin bảo hành cho số IMEI <strong>${imei}</strong>. Vui lòng kiểm tra lại hoặc liên hệ tổng đài <strong>1800 6870</strong>.
          </div>
        `;
        return;
      }

      resultBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-md text-xs space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span class="font-extrabold text-navy text-sm">${found.tenHang || 'iPhone 18 Pro Max'}</span>
              <div class="text-[10px] text-slate-400 font-mono">IMEI: ${found.soImei || imei}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              <i class="fa-solid fa-shield-check mr-1"></i> Còn hạn
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-slate-600">
            <div>Ngày kích hoạt: <strong class="text-navy block">${found.ngayBD || '11/10/2026'}</strong></div>
            <div>Hết hạn bảo hành: <strong class="text-navy block">${found.ngayKT || '11/10/2027'}</strong></div>
            <div>Thời hạn: <span class="text-navy font-semibold">${found.thoiHanThang || 12} tháng</span></div>
            <div>Thời gian còn lại: <span class="text-emerald-600 font-bold">${found.conLaiNgay || 363} ngày</span></div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#F0FDF4] text-[#15803D] text-[11px] flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-[#16A34A]"></i>
            <span>Thiết bị đủ điều kiện bảo hành 1 đổi 1 trong 30 ngày đầu & sửa chữa miễn phí toàn quốc.</span>
          </div>
        </div>
      `;
    }

    /**
     * Modal Tư vấn Thu Cũ Đổi Mới / Trả Góp 0%
     */
    openTradeInModal() {
      const modal = document.getElementById('tradein-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    }

    closeTradeInModal() {
      const modal = document.getElementById('tradein-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    submitTradeIn() {
      const name = (document.getElementById('tradein-name')?.value || '').trim();
      const phone = (document.getElementById('tradein-phone')?.value || '').trim();
      const device = document.getElementById('tradein-device')?.value;

      if (!name || !phone) {
        window.TitanCart.showToast('Vui lòng điền họ tên và số điện thoại liên hệ!', 'error');
        return;
      }

      window.TitanCart.showToast('Đã gửi thông tin định giá! Chuyên viên TITAN STORE sẽ liên hệ trong 5 phút.', 'success');
      this.closeTradeInModal();
    }
  }

  return new LookupManager();
}));
