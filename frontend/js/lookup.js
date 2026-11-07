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

  function showNotification(message, type = 'info') {
    if (window.CellphoneSCart && typeof window.CellphoneSCart.showToast === 'function') {
      window.CellphoneSCart.showToast(message, type);
      return;
    }
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }

    let container = document.getElementById('cellphones-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cellphones-toast-container';
      container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const bgMap = {
      success: 'bg-[#22C55E] text-white',
      warning: 'bg-[#F59E0B] text-slate-900',
      error: 'bg-[#EF4444] text-white',
      info: 'bg-[#2563EB] text-white'
    };
    const iconMap = {
      success: 'fa-circle-check',
      warning: 'fa-triangle-exclamation',
      error: 'fa-circle-xmark',
      info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto transition-all transform duration-300 translate-y-[-20px] opacity-0 ${bgMap[type] || bgMap.info}`;
    toast.innerHTML = `
      <i class="fa-solid ${iconMap[type] || iconMap.info} text-lg"></i>
      <span class="text-xs sm:text-sm font-semibold">${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-[-20px]', 'opacity-0'));
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-[-20px]');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function formatDate(isoStr) {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return String(isoStr).substring(0, 10);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return String(isoStr).substring(0, 10);
    }
  }

  function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('vi-VN') + ' ₫';
  }

  async function fetchWarrantyByImei(imei) {
    if (window.api && typeof window.api.get === 'function') {
      return await window.api.get(`/baohanh/imei/${encodeURIComponent(imei)}`);
    }
    const apiBase = window.API_BASE || '/api';
    const res = await fetch(`${apiBase}/baohanh/imei/${encodeURIComponent(imei)}`);
    if (!res.ok) {
      let errMsg = 'Không tìm thấy thông tin bảo hành cho IMEI này.';
      try {
        const json = await res.json();
        if (json.message) errMsg = json.message;
      } catch {}
      throw new Error(errMsg);
    }
    return await res.json();
  }

  async function fetchOrderDetails(maDH, phone) {
    const path = `/orders/${encodeURIComponent(maDH)}?sdt=${encodeURIComponent(phone)}`;
    if (window.api && typeof window.api.get === 'function') {
      return await window.api.get(path);
    }
    const apiBase = window.API_BASE || '/api';
    const res = await fetch(`${apiBase}${path}`);
    if (!res.ok) {
      let errMsg = 'Không tìm thấy thông tin đơn hàng.';
      try {
        const json = await res.json();
        if (json.message) errMsg = json.message;
      } catch {}
      throw new Error(errMsg);
    }
    return await res.json();
  }

  async function fetchOrdersByPhone(phone) {
    const path = `/orders/phone/${encodeURIComponent(phone)}`;
    if (window.api && typeof window.api.get === 'function') {
      return await window.api.get(path);
    }
    const apiBase = window.API_BASE || '/api';
    const res = await fetch(`${apiBase}${path}`);
    if (!res.ok) return [];
    return await res.json();
  }

  function renderWarrantyCard(dto, imei) {
    const isHetHan = dto.trangThai === 'het_han' || (dto.soNgayConLai !== undefined && dto.soNgayConLai < 0);
    const isDangSua = dto.trangThai === 'dang_sua';

    let statusBadge = `<span class="px-2.5 py-1 rounded-full font-bold text-xs bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"><i class="fa-solid fa-shield-check mr-1"></i> Còn hạn</span>`;
    if (isHetHan) {
      statusBadge = `<span class="px-2.5 py-1 rounded-full font-bold text-xs bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"><i class="fa-solid fa-circle-xmark mr-1"></i> Hết hạn</span>`;
    } else if (isDangSua) {
      statusBadge = `<span class="px-2.5 py-1 rounded-full font-bold text-xs bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"><i class="fa-solid fa-wrench mr-1"></i> Đang sửa chữa</span>`;
    }

    const remainingText = isHetHan
      ? '<span class="text-[#EF4444] font-bold">Đã hết hạn bảo hành</span>'
      : (dto.soNgayConLai !== undefined
          ? `<span class="text-[#22C55E] font-bold">Còn ${dto.soNgayConLai} ngày</span>`
          : '<span class="text-[#22C55E] font-bold">Đang hiệu lực</span>');

    // Bảo mật: DTO không chứa tên khách hàng hoặc SĐT
    return `
      <div class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-md text-xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <span class="font-extrabold text-[#111827] text-sm">${dto.tenHang || 'Thiết bị di động'}</span>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">IMEI: ${dto.soIMEI || imei}</div>
          </div>
          ${statusBadge}
        </div>

        <div class="grid grid-cols-2 gap-2.5 text-slate-600">
          <div>Ngày kích hoạt: <strong class="text-[#111827] block font-mono">${formatDate(dto.ngayBD)}</strong></div>
          <div>Ngày hết hạn: <strong class="text-[#111827] block font-mono">${formatDate(dto.ngayKT)}</strong></div>
          <div>Tình trạng: <span class="block">${remainingText}</span></div>
          <div>Chính sách: <span class="text-[#111827] font-semibold block">1 đổi 1 trong 30 ngày</span></div>
        </div>

        <div class="p-2.5 rounded-xl bg-blue-50/60 text-[#1E3A8A] text-[11px] flex items-center gap-2 border border-blue-100">
          <i class="fa-solid fa-shield-halved text-[#2563EB]"></i>
          <span>Bảo hành chính hãng toàn quốc tại hệ thống CellphoneS - 241 Lê Văn Việt.</span>
        </div>
      </div>
    `;
  }

  function renderOrderCard(order) {
    const statusMap = {
      cho_xac_nhan: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800' },
      da_xac_nhan: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      dang_giao: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800' },
      hoan_thanh: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800' },
      da_huy: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800' }
    };
    const st = statusMap[order.trangThai] || statusMap.cho_xac_nhan;

    return `
      <div class="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-md text-xs space-y-2.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <span class="font-extrabold text-[#2563EB] font-mono text-sm">#${order.maDH}</span>
            <div class="text-[10px] text-slate-400">Ngày đặt: ${order.ngayDat ? order.ngayDat.substring(0, 16).replace('T', ' ') : 'Gần đây'}</div>
          </div>
          <span class="px-2.5 py-1 rounded-full font-bold text-xs ${st.color}">${st.label}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-slate-600">
          <div>Người nhận: <strong class="text-[#111827] block">${order.tenNguoiNhan || 'Khách hàng'}</strong></div>
          <div>Số điện thoại: <strong class="text-[#111827] block">${order.sdtNguoiNhan || '-'}</strong></div>
          <div class="col-span-2">Địa chỉ: <span class="text-[#111827] font-medium block">${order.diaChiGiao || 'Nhận tại cửa hàng'}</span></div>
          <div>Phương thức: <span class="text-[#111827] font-medium block uppercase">${order.phuongThucThanhToan || 'COD'}</span></div>
        </div>

        ${order.items && order.items.length > 0 ? `
          <div class="border-t border-slate-100 pt-2 space-y-1">
            <div class="font-semibold text-slate-700 mb-1">Sản phẩm:</div>
            ${order.items.map(it => `
              <div class="flex justify-between items-center text-[11px] text-slate-600">
                <span>${it.maHang} (SL: ${it.soLuong})</span>
                <span class="font-medium">${formatMoney(it.thanhTien || (it.donGia * it.soLuong))}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <span class="font-semibold text-slate-600">Tổng thanh toán:</span>
          <span class="font-bold text-base text-[#EF4444]">${formatMoney(order.tongTien)}</span>
        </div>
      </div>
    `;
  }

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

      const activeCls = 'flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 border-[#2563EB] text-[#1E3A8A] cursor-pointer';
      const inactiveCls = 'flex-1 py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-navy cursor-pointer';

      if (tabId === 'order') {
        if (btnOrder) btnOrder.className = activeCls;
        if (btnWarranty) btnWarranty.className = inactiveCls;
        if (tabOrder) tabOrder.classList.remove('hidden');
        if (tabWarranty) tabWarranty.classList.add('hidden');
      } else {
        if (btnWarranty) btnWarranty.className = activeCls;
        if (btnOrder) btnOrder.className = inactiveCls;
        if (tabWarranty) tabWarranty.classList.remove('hidden');
        if (tabOrder) tabOrder.classList.add('hidden');
      }
    }

    async lookupOrder() {
      const idInput = document.getElementById('lookup-order-id');
      const phoneInput = document.getElementById('lookup-order-phone');
      const resultBox = document.getElementById('lookup-order-result');
      const btn = document.querySelector('#lookup-tab-order button[type="button"]');

      const maDH = (idInput ? idInput.value : '').trim().toUpperCase();
      const phone = (phoneInput ? phoneInput.value : '').trim().replace(/\s/g, '');

      if (!maDH && !phone) {
        showNotification('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại', 'error');
        if (idInput) idInput.focus();
        return;
      }

      if (maDH && !phone) {
        showNotification('Tra cứu theo mã đơn hàng yêu cầu nhập kèm Số điện thoại đặt hàng', 'error');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!resultBox) return;

      const originalBtnHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Đang tra cứu...';
      }

      resultBox.classList.remove('hidden');
      resultBox.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2 text-[#2563EB]"></i> Đang tra cứu dữ liệu đơn hàng...</div>';

      try {
        let order = null;
        if (maDH) {
          order = await fetchOrderDetails(maDH, phone);
        } else {
          const list = await fetchOrdersByPhone(phone);
          if (Array.isArray(list) && list.length > 0) {
            order = list[0];
          }
        }

        if (!order) {
          resultBox.innerHTML = `
            <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
              <i class="fa-solid fa-circle-exclamation text-lg mb-1 block"></i>
              Không tìm thấy thông tin đơn hàng ${maDH ? `<strong>${maDH}</strong>` : ''} ${phone ? `với SĐT <strong>${phone}</strong>` : ''}. Vui lòng kiểm tra lại!
            </div>
          `;
          return;
        }

        resultBox.innerHTML = renderOrderCard(order);
      } catch (err) {
        resultBox.innerHTML = `
          <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
            <i class="fa-solid fa-circle-exclamation text-lg mb-1 block"></i>
            ${err.message || 'Lỗi tra cứu đơn hàng. Vui lòng thử lại.'}
          </div>
        `;
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalBtnHtml;
        }
      }
    }

    async lookupWarranty() {
      const imeiInput = document.getElementById('lookup-imei-code');
      const resultBox = document.getElementById('lookup-warranty-result');
      const btn = document.querySelector('#lookup-tab-warranty button[type="button"]');

      const imei = (imeiInput ? imeiInput.value : '').trim().replace(/\s/g, '');

      if (!imei || !/^\d{15}$/.test(imei)) {
        showNotification('Số IMEI phải gồm đúng 15 chữ số!', 'error');
        if (imeiInput) imeiInput.focus();
        return;
      }

      if (!resultBox) return;

      const originalBtnHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Đang tra cứu...';
      }

      resultBox.classList.remove('hidden');
      resultBox.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2 text-[#2563EB]"></i> Đang tra cứu CSDL bảo hành...</div>';

      try {
        const dto = await fetchWarrantyByImei(imei);
        resultBox.innerHTML = renderWarrantyCard(dto, imei);
      } catch (err) {
        resultBox.innerHTML = `
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
            <i class="fa-solid fa-triangle-exclamation text-lg mb-1 block text-amber-600"></i>
            ${err.message || 'Không tìm thấy thông tin bảo hành cho IMEI này. Vui lòng kiểm tra lại.'}
          </div>
        `;
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalBtnHtml;
        }
      }
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
      showNotification('Cảm ơn quý khách! CellphoneS sẽ liên hệ tư vấn.', 'success');
      this.closeTradeInModal();
    }
  }

  return new LookupManager();
}));
