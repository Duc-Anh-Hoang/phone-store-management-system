/**
 * TITAN STORE - CHUYÊN MỤC TRẢ GÓP 0% LÃI SUẤT (INSTALLMENT HANDLER)
 * Hỗ trợ bảng tính trả góp trực quan thời gian thực:
 * - Liên kết 25+ Ngân hàng (Thẻ tín dụng) & Công ty tài chính (CCCD duyệt online 5 phút)
 * - Tùy chọn trả trước: 0%, 20%, 30%, 50%
 * - Tùy chọn kỳ hạn: 3, 6, 9, 12 tháng
 * - Lãi suất 0%, Phí chuyển đổi 0đ, minh bạch số tiền góp mỗi tháng
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () { return factory(root); });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(typeof global !== 'undefined' ? global : root);
  } else {
    root.TitanInstallment = factory(root);
  }
}(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : this), function (root) {
  'use strict';

  class InstallmentManager {
    constructor() {
      this.selectedProductId = 'MH001';
      this.prepayPercent = 30; // 30% mặc định phổ biến nhất
      this.termMonths = 6;      // 6 tháng
      this.providerType = 'credit'; // 'credit' (Thẻ tín dụng) | 'finance' (CCCD / Home Credit)
      this.activeTab = 'calc';
    }

    /**
     * Mở Modal Trả Góp 0%
     */
    open(productId = null) {
      const modal = document.getElementById('installment-modal');
      if (!modal) return;

      this.populateProductSelect();

      if (productId && window.TitanStoreData && window.TitanStoreData.getProductById(productId)) {
        this.selectedProductId = productId;
      } else if (!this.selectedProductId) {
        this.selectedProductId = 'MH001';
      }

      const selectEl = document.getElementById('inst-product-select');
      if (selectEl) {
        selectEl.value = this.selectedProductId;
      }

      this.switchTab('calc');
      this.setProvider(this.providerType);
      this.setPrepay(this.prepayPercent);
      this.setTerm(this.termMonths);
      this.recalculate();
      this.renderProductsGrid();

      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    /**
     * Đóng Modal Trả Góp 0%
     */
    close() {
      const modal = document.getElementById('installment-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    /**
     * Chuyển Tab trong Modal: 'calc' | 'products' | 'policy'
     */
    switchTab(tabId) {
      this.activeTab = tabId;

      const btnCalc = document.getElementById('inst-tab-btn-calc');
      const btnProds = document.getElementById('inst-tab-btn-products');
      const btnPolicy = document.getElementById('inst-tab-btn-policy');

      const tabCalc = document.getElementById('inst-tab-calc');
      const tabProds = document.getElementById('inst-tab-products');
      const tabPolicy = document.getElementById('inst-tab-policy');

      const activeClass = 'px-4 py-2.5 rounded-xl font-bold text-xs bg-[#80ffbf] text-[#061a0f] shadow-sm transition-all cursor-pointer';
      const inactiveClass = 'px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-all cursor-pointer';

      if (btnCalc) btnCalc.className = tabId === 'calc' ? activeClass : inactiveClass;
      if (btnProds) btnProds.className = tabId === 'products' ? activeClass : inactiveClass;
      if (btnPolicy) btnPolicy.className = tabId === 'policy' ? activeClass : inactiveClass;

      if (tabCalc) {
        if (tabId === 'calc') tabCalc.classList.remove('hidden');
        else tabCalc.classList.add('hidden');
      }
      if (tabProds) {
        if (tabId === 'products') tabProds.classList.remove('hidden');
        else tabProds.classList.add('hidden');
      }
      if (tabPolicy) {
        if (tabId === 'policy') tabPolicy.classList.remove('hidden');
        else tabPolicy.classList.add('hidden');
      }
    }

    /**
     * Đổ danh sách sản phẩm hỗ trợ trả góp vào Select box
     */
    populateProductSelect() {
      const selectEl = document.getElementById('inst-product-select');
      if (!selectEl || !window.TitanStoreData) return;

      const items = window.TitanStoreData.getInstallmentProducts
        ? window.TitanStoreData.getInstallmentProducts()
        : (window.TitanStoreData.products || []).filter(p => p.traGop0);

      selectEl.innerHTML = items.map(p => `
        <option value="${p.maHang}">${p.tenHang} - ${this.formatMoney(p.donGia)}</option>
      `).join('');
    }

    /**
     * Khi khách hàng chọn sản phẩm khác từ dropdown
     */
    onProductChange(productId) {
      this.selectedProductId = productId;
      this.recalculate();
    }

    /**
     * Chọn hình thức: 'credit' (Thẻ tín dụng) hoặc 'finance' (Công ty tài chính CCCD)
     */
    setProvider(type) {
      this.providerType = type;

      const cardCredit = document.getElementById('inst-provider-credit');
      const cardFinance = document.getElementById('inst-provider-finance');

      if (cardCredit) {
        if (type === 'credit') {
          cardCredit.className = 'flex-1 p-3.5 rounded-2xl border-2 border-[#16A34A] bg-[#eafff5] text-[#064e29] cursor-pointer transition-all';
        } else {
          cardCredit.className = 'flex-1 p-3.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-700 cursor-pointer transition-all';
        }
      }

      if (cardFinance) {
        if (type === 'finance') {
          cardFinance.className = 'flex-1 p-3.5 rounded-2xl border-2 border-[#16A34A] bg-[#eafff5] text-[#064e29] cursor-pointer transition-all';
        } else {
          cardFinance.className = 'flex-1 p-3.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-700 cursor-pointer transition-all';
        }
      }

      // Đối với Công ty tài chính, mức trả trước tối thiểu thường là 10%-20%
      const btn0 = document.getElementById('inst-prepay-btn-0');
      if (btn0) {
        if (type === 'finance' && this.prepayPercent === 0) {
          this.setPrepay(20);
        }
      }

      this.recalculate();
    }

    /**
     * Chọn tỷ lệ trả trước (0%, 20%, 30%, 50%)
     */
    setPrepay(percent) {
      this.prepayPercent = Number(percent);

      const prepayButtons = document.querySelectorAll('.inst-prepay-btn');
      prepayButtons.forEach(btn => {
        if (Number(btn.dataset.percent) === this.prepayPercent) {
          btn.className = 'inst-prepay-btn flex-1 py-2 rounded-xl text-xs font-black bg-[#80ffbf] text-[#061a0f] border-2 border-[#80ffbf] shadow-sm transition-all cursor-pointer';
        } else {
          btn.className = 'inst-prepay-btn flex-1 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 transition-all cursor-pointer';
        }
      });

      this.recalculate();
    }

    /**
     * Chọn kỳ hạn (3, 6, 9, 12 tháng)
     */
    setTerm(months) {
      this.termMonths = Number(months);

      const termButtons = document.querySelectorAll('.inst-term-btn');
      termButtons.forEach(btn => {
        if (Number(btn.dataset.months) === this.termMonths) {
          btn.className = 'inst-term-btn flex-1 py-2 rounded-xl text-xs font-black bg-[#80ffbf] text-[#061a0f] border-2 border-[#80ffbf] shadow-sm transition-all cursor-pointer';
        } else {
          btn.className = 'inst-term-btn flex-1 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 transition-all cursor-pointer';
        }
      });

      this.recalculate();
    }

    /**
     * Tính toán thời gian thực các thông số trả góp 0%
     */
    recalculate() {
      if (!window.TitanStoreData) return;

      const product = window.TitanStoreData.getProductById(this.selectedProductId) || 
                      (window.TitanStoreData.products && window.TitanStoreData.products[0]);

      if (!product) return;

      const price = Number(product.donGia) || 0;
      const prepayAmount = Math.round((price * this.prepayPercent) / 100);
      const loanAmount = Math.max(0, price - prepayAmount);
      const monthlyPayment = this.termMonths > 0 ? Math.round(loanAmount / this.termMonths) : 0;

      // Cập nhật thẻ sản phẩm hiện tại
      const imgEl = document.getElementById('inst-product-thumb');
      const nameEl = document.getElementById('inst-product-title');
      const priceEl = document.getElementById('inst-product-price');
      const originalPriceEl = document.getElementById('inst-product-original-price');
      const prepayNoticeEl = document.getElementById('inst-prepay-amount-badge');

      if (imgEl && product.anhChinh) imgEl.src = product.anhChinh;
      if (nameEl) nameEl.textContent = product.tenHang;
      if (priceEl) priceEl.textContent = this.formatMoney(price);
      if (originalPriceEl) {
        if (product.giaGoc > product.donGia) {
          originalPriceEl.textContent = this.formatMoney(product.giaGoc);
          originalPriceEl.classList.remove('hidden');
        } else {
          originalPriceEl.classList.add('hidden');
        }
      }
      if (prepayNoticeEl) {
        prepayNoticeEl.textContent = `Trả trước: ${this.formatMoney(prepayAmount)} (${this.prepayPercent}%)`;
      }

      // Cập nhật bảng kết quả tài chính
      const outPrice = document.getElementById('inst-out-price');
      const outPrepay = document.getElementById('inst-out-prepay');
      const outLoan = document.getElementById('inst-out-loan');
      const outMonthly = document.getElementById('inst-out-monthly');
      const outTotal = document.getElementById('inst-out-total');
      const outDiff = document.getElementById('inst-out-diff');

      if (outPrice) outPrice.textContent = this.formatMoney(price);
      if (outPrepay) outPrepay.textContent = `${this.formatMoney(prepayAmount)} (${this.prepayPercent}%)`;
      if (outLoan) outLoan.textContent = this.formatMoney(loanAmount);
      if (outMonthly) outMonthly.textContent = `${this.formatMoney(monthlyPayment)}/tháng`;
      if (outTotal) outTotal.textContent = this.formatMoney(price);
      if (outDiff) outDiff.textContent = '0 đ (Đúng giá niêm yết)';
    }

    /**
     * Render lưới các sản phẩm hỗ trợ trả góp 0% trong Tab 2
     */
    renderProductsGrid() {
      const container = document.getElementById('inst-products-grid');
      if (!container || !window.TitanStoreData) return;

      const items = window.TitanStoreData.getInstallmentProducts
        ? window.TitanStoreData.getInstallmentProducts()
        : (window.TitanStoreData.products || []).filter(p => p.traGop0);

      container.innerHTML = items.map(p => {
        const monthly = Math.round(p.donGia * 0.7 / 6); // Dự tính 6 tháng trả trước 30%
        return `
          <div class="product-card bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between hover:border-[#80ffbf] hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="px-2 py-0.5 rounded bg-[#eafff5] text-[#064e29] text-[10px] font-extrabold uppercase border border-[#80ffbf]/40">
                0% Lãi Suất
              </span>
              <span class="text-[10px] text-slate-400 font-semibold">${p.nhanHieu}</span>
            </div>
            
            <div class="w-full h-32 my-2 flex items-center justify-center p-2 cursor-pointer" onclick="window.TitanInstallment.calculateProduct('${p.maHang}')">
              <img src="${p.anhChinh}" alt="${p.tenHang}" class="max-w-full max-h-full object-contain hover:scale-105 transition-transform">
            </div>

            <div class="space-y-1">
              <h4 class="text-xs font-bold text-navy line-clamp-2 hover:text-[#064e29] cursor-pointer" onclick="window.TitanInstallment.calculateProduct('${p.maHang}')" title="${p.tenHang}">
                ${p.tenHang}
              </h4>
              <div class="text-xs sm:text-sm font-extrabold text-[#e11b1e]">
                ${this.formatMoney(p.donGia)}
              </div>
              <div class="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-semibold flex items-center justify-between">
                <span>Góp từ:</span>
                <strong>${this.formatMoney(monthly)}/th</strong>
              </div>
            </div>

            <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
              <button type="button" onclick="window.TitanInstallment.calculateProduct('${p.maHang}')" class="flex-1 py-2 rounded-xl bg-[#80ffbf] hover:bg-[#68f5ab] text-[#061a0f] font-black text-xs transition-colors text-center cursor-pointer shadow-sm">
                Tính Trả Góp
              </button>
              <button type="button" onclick="window.TitanProductModal.open('${p.maHang}')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors" title="Xem chi tiết">
                <i class="fa-solid fa-eye text-xs"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    /**
     * Bấm "Tính Trả Góp" từ tab sản phẩm hoặc dải ngoài trang chủ
     */
    calculateProduct(productId) {
      this.selectedProductId = productId;
      const selectEl = document.getElementById('inst-product-select');
      if (selectEl) selectEl.value = productId;
      this.switchTab('calc');
      this.recalculate();
    }

    /**
     * Gửi đăng ký xét duyệt hồ sơ trả góp online
     */
    submitApplication() {
      const name = (document.getElementById('inst-lead-name')?.value || '').trim();
      const phone = (document.getElementById('inst-lead-phone')?.value || '').trim().replace(/\s/g, '');
      const idCard = (document.getElementById('inst-lead-idcard')?.value || '').trim();
      const bank = document.getElementById('inst-lead-bank')?.value || 'Vietcombank';

      if (!name) {
        if (window.TitanCart) window.TitanCart.showToast('Vui lòng nhập Họ và tên của bạn!', 'error');
        return;
      }

      if (!phone || phone.length < 9) {
        if (window.TitanCart) window.TitanCart.showToast('Vui lòng nhập Số điện thoại liên hệ chính xác!', 'error');
        return;
      }

      const product = window.TitanStoreData ? window.TitanStoreData.getProductById(this.selectedProductId) : null;
      const productName = product ? product.tenHang : 'Thiết bị';

      // Lưu trữ thông tin tư vấn vào LocalStorage
      try {
        const key = 'titan_installment_leads_v1';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({
          id: 'TG' + Date.now().toString().slice(-6),
          name: name,
          phone: phone,
          idCard: idCard,
          bank: bank,
          productCode: this.selectedProductId,
          productName: productName,
          prepayPercent: this.prepayPercent,
          termMonths: this.termMonths,
          providerType: this.providerType,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
      } catch (e) {}

      if (window.TitanCart) {
        window.TitanCart.showToast(`Đã gửi hồ sơ Trả Góp 0% cho ${productName}! Chuyên viên sẽ gọi thẩm định trong 5 phút.`, 'success');
      }

      // Xóa form và đóng modal
      if (document.getElementById('inst-lead-name')) document.getElementById('inst-lead-name').value = '';
      if (document.getElementById('inst-lead-phone')) document.getElementById('inst-lead-phone').value = '';
      if (document.getElementById('inst-lead-idcard')) document.getElementById('inst-lead-idcard').value = '';

      this.close();
    }

    /**
     * Chuyển thẳng sang luồng mua ngay với tùy chọn trả góp được chọn sẵn
     */
    orderNow() {
      const pId = this.selectedProductId;
      this.close();

      if (window.TitanProductModal) {
        window.TitanProductModal.open(pId);
      }
    }

    formatMoney(num) {
      if (window.TitanCart && typeof window.TitanCart.formatMoney === 'function') {
        return window.TitanCart.formatMoney(num);
      }
      return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
    }
  }

  const manager = new InstallmentManager();
  if (root) {
    root.TitanInstallment = manager;
    root.openInstallmentModal = function(productId = null) {
      manager.open(productId);
    };
    root.closeInstallmentModal = function() {
      manager.close();
    };
  }

  return manager;
}));
