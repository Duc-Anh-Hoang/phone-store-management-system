/**
 * CellphoneS - 241 Lê Văn Việt
 * Tra cứu không cần đăng nhập:
 * - Tra cứu đơn hàng theo Mã đơn + Số điện thoại (/api/orders/{id} và /api/orders/phone/{phone})
 * - Tra cứu tình trạng bảo hành theo số IMEI (/api/baohanh/trangthai/{imei})
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CellphoneSLookup = root.Lookup = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var API_BASE = window.API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '8080' ? '/api' : 'http://localhost:8080/api')
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
        if (btnOrder) btnOrder.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 border-[#d70018] text-[#d70018]';
        if (btnWarranty) btnWarranty.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-navy';
        if (tabOrder) tabOrder.classList.remove('hidden');
        if (tabWarranty) tabWarranty.classList.add('hidden');
      } else {
        if (btnWarranty) btnWarranty.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 border-[#d70018] text-[#d70018]';
        if (btnOrder) btnOrder.className = 'flex-1 py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-navy';
        if (tabWarranty) tabWarranty.classList.remove('hidden');
        if (tabOrder) tabOrder.classList.add('hidden');
      }
    }

    /**
     * Tra cứu Đơn Hàng từ CSDL thật
     */
    async lookupOrder() {
      const idInput = document.getElementById('lookup-order-id');
      const phoneInput = document.getElementById('lookup-order-phone');
      const resultBox = document.getElementById('lookup-order-result');

      const maDH = (idInput ? idInput.value : '').trim().toUpperCase();
      const phone = (phoneInput ? phoneInput.value : '').trim().replace(/\s/g, '');

      if (!maDH && !phone) {
        if ((window.CellphoneSCart || window.Cart)) (window.CellphoneSCart || window.Cart).showToast('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại', 'error');
        else alert('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại');
        if (idInput) idInput.focus();
        return;
      }

      if (!resultBox) return;
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tra cứu dữ liệu từ máy chủ...</div>';

      let found = null;

      // 1. Nếu có mã đơn: gọi /api/orders/{id}
      if (maDH) {
        try {
          const resp = await fetch(`${API_BASE}/orders/${maDH}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data && (!phone || (data.sdtNguoiNhan && data.sdtNguoiNhan.includes(phone.slice(-4))))) {
              found = data;
            }
          }
        } catch (e) {}
      }

      // 2. Nếu không tìm thấy hoặc chỉ nhập SĐT: gọi /api/orders/phone/{phone}
      if (!found && phone) {
        try {
          const resp = await fetch(`${API_BASE}/orders/phone/${phone}`);
          if (resp.ok) {
            const list = await resp.json();
            if (Array.isArray(list) && list.length > 0) {
              found = list[0];
            }
          }
        } catch (e) {}
      }

      if (!found) {
        resultBox.innerHTML = `
          <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
            <i class="fa-solid fa-circle-exclamation text-lg mb-1 block"></i>
            Không tìm thấy thông tin đơn hàng ${maDH ? `<strong>${maDH}</strong>` : ''} ${phone ? `với SĐT <strong>${phone}</strong>` : ''}. Vui lòng kiểm tra lại!
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

      const formatMoney = (n) => Number(n || 0).toLocaleString('vi-VN') + ' ₫';

      resultBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-md text-xs space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span class="font-extrabold text-[#d70018] font-mono text-sm">#${found.maDH}</span>
              <div class="text-[10px] text-slate-400">Ngày đặt: ${found.ngayDat ? found.ngayDat.substring(0, 16).replace('T', ' ') : 'Gần đây'}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full font-bold text-xs ${st.color}">${st.label}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-slate-600">
            <div>Người nhận: <strong class="text-navy block">${found.tenNguoiNhan || 'Khách hàng'}</strong></div>
            <div>Số điện thoại: <strong class="text-navy block">${found.sdtNguoiNhan || 'Chưa có'}</strong></div>
            <div class="col-span-2">Địa chỉ giao: <span class="text-navy font-medium block">${found.diaChiGiao || 'Nhận tại cửa hàng'}</span></div>
            <div>Phương thức: <span class="text-navy font-medium block uppercase">${found.phuongThucThanhToan || 'COD'}</span></div>
          </div>

          ${found.items && found.items.length > 0 ? `
            <div class="border-t border-slate-100 pt-2 space-y-1">
              <div class="font-semibold text-slate-700 mb-1">Danh sách sản phẩm:</div>
              ${found.items.map(it => `
                <div class="flex justify-between items-center text-[11px] text-slate-600">
                  <span>${it.maHang} (SL: ${it.soLuong})</span>
                  <span class="font-medium">${formatMoney(it.thanhTien || (it.donGia * it.soLuong))}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <span class="font-semibold text-slate-600">Tổng thanh toán:</span>
            <span class="font-bold text-base text-[#d70018]">${formatMoney(found.tongTien)}</span>
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

      if (!imei || !/^\d{15}$/.test(imei)) {
        if ((window.CellphoneSCart || window.Cart)) (window.CellphoneSCart || window.Cart).showToast('Số IMEI phải gồm đúng 15 chữ số!', 'error');
        else alert('Số IMEI phải gồm đúng 15 chữ số!');
        if (imeiInput) imeiInput.focus();
        return;
      }

      if (!resultBox) return;
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tra cứu CSDL bảo hành...</div>';

      let found = null;

      // 1. Thử gọi backend /api/baohanh/trangthai/{imei}
      try {
        const resp = await fetch(`${API_BASE}/baohanh/trangthai/${imei}`);
        if (resp.ok) {
          found = await resp.json();
        }
      } catch (e) {}

      // 2. Thử gọi backend /api/baohanh/imei/{imei}
      if (!found) {
        try {
          const resp = await fetch(`${API_BASE}/baohanh/imei/${imei}`);
          if (resp.ok) {
            found = await resp.json();
          }
        } catch (e) {}
      }

      if (!found) {
        resultBox.innerHTML = `
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
            <i class="fa-solid fa-triangle-exclamation text-lg mb-1 block"></i>
            Không tìm thấy thông tin bảo hành cho IMEI <strong>${imei}</strong>. Vui lòng kiểm tra lại số IMEI in trên hộp máy hoặc liên hệ CellphoneS <strong>1800 6870</strong>.
          </div>
        `;
        return;
      }

      const isHetHan = found.trangThai === 'het_han' || (found.soNgayConLai !== undefined && found.soNgayConLai < 0);
      const isDangSua = found.trangThai === 'dang_sua';

      let statusBadge = `<span class="px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-shield-check mr-1"></i> Còn hạn</span>`;
      if (isHetHan) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-circle-xmark mr-1"></i> Hết hạn</span>`;
      } else if (isDangSua) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full font-bold text-xs bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-wrench mr-1"></i> Đang sửa chữa</span>`;
      }

      resultBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-md text-xs space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span class="font-extrabold text-navy text-sm">${found.tenHang || 'Thiết bị di động'}</span>
              <div class="text-[10px] text-slate-400 font-mono">IMEI: ${found.soIMEI || found.soImei || imei}</div>
            </div>
            ${statusBadge}
          </div>

          <div class="grid grid-cols-2 gap-2 text-slate-600">
            <div>Mã bảo hành: <strong class="text-navy block">${found.maBH || 'BH---'}</strong></div>
            <div>Khách hàng: <strong class="text-navy block">${found.tenKH || 'Khách hàng'}</strong></div>
            <div>Ngày bắt đầu: <strong class="text-navy block">${found.ngayBD ? String(found.ngayBD).substring(0, 10) : 'Chưa có'}</strong></div>
            <div>Hết hạn: <strong class="text-navy block">${found.ngayKT ? String(found.ngayKT).substring(0, 10) : 'Chưa có'}</strong></div>
            <div>Thời hạn: <span class="text-navy font-semibold">${found.thoiHanThang || 12} tháng</span></div>
            <div>Còn lại: <span class="${isHetHan ? 'text-rose-600' : 'text-emerald-600'} font-bold">${found.soNgayConLai !== undefined ? found.soNgayConLai + ' ngày' : 'Đang hiệu lực'}</span></div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#F0FDF4] text-[#15803D] text-[11px] flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-[#16A34A]"></i>
            <span>${found.dieuKien || 'Bảo hành chính hãng tại hệ thống CellphoneS toàn quốc.'}</span>
          </div>
        </div>
      `;
    }

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
      if ((window.CellphoneSCart || window.Cart)) (window.CellphoneSCart || window.Cart).showToast('Cảm ơn quý khách! CellphoneS sẽ liên hệ tư vấn.', 'success');
      this.closeTradeInModal();
    }
  }

  return new LookupManager();
}));
