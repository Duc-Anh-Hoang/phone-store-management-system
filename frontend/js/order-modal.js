/**
 * HỆ THỐNG MODAL ĐẶT HÀNG DÙNG CHUNG (SHARED ORDER MODAL)
 * Dùng một modal duy nhất cho tất cả các nút CTA trên toàn bộ website
 */

const OrderModal = {
  modalEl: null,
  closeBtns: [],

  init() {
    this.modalEl = document.getElementById('shared-order-modal');
    if (!this.modalEl) return;

    this.closeBtns = this.modalEl.querySelectorAll('.btn-close-modal');

    // 1. Lắng nghe tất cả các nút CTA mở modal đặt hàng trên trang
    document.addEventListener('click', (e) => {
      const openTrigger = e.target.closest('.btn-open-order, [data-open-modal="order-modal"]');
      if (openTrigger) {
        e.preventDefault();
        const isInstallment = openTrigger.dataset.installment === 'true';
        this.open(isInstallment);
      }
    });

    // 2. Nút đóng modal
    this.closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // 3. Đóng khi click ngoài nền (backdrop)
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // 4. Đóng khi bấm phím Escape (ESC)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  },

  open(isInstallment = false) {
    if (window.TitanProductModal) {
      window.TitanProductModal.open('MH001');
      return;
    }
    if (!this.modalEl) {
      this.modalEl = document.getElementById('shared-order-modal');
    }
    if (!this.modalEl) return;

    // Đồng bộ lựa chọn hiện tại vào modal
    if (typeof window.updateProductUI === 'function') {
      try { window.updateProductUI(); } catch (e) {}
    }

    // Nếu người dùng bấm CTA "Mua trả góp 0%"
    if (isInstallment) {
      const installmentRadio = this.modalEl.querySelector('input[name="modal-payment"][value="installment"]');
      if (installmentRadio) {
        installmentRadio.checked = true;
        installmentRadio.dispatchEvent(new Event('change'));
      }
    }

    // Hiển thị modal và khóa cuộn body
    this.modalEl.classList.remove('hidden');
    this.modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus vào ô input đầu tiên để tăng trải nghiệm tiếp cận
    setTimeout(() => {
      const firstInput = this.modalEl.querySelector('input[name="customer-name"]');
      if (firstInput) firstInput.focus();
    }, 150);
  },

  close() {
    if (!this.modalEl) {
      this.modalEl = document.getElementById('shared-order-modal');
    }
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    this.modalEl.classList.remove('active');
    document.body.style.overflow = '';
  },

  isOpen() {
    if (!this.modalEl) {
      this.modalEl = document.getElementById('shared-order-modal');
    }
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }
};

window.OrderModal = OrderModal;
window.openOrderModal = function(isInstallment = false) {
  OrderModal.open(isInstallment);
};
window.closeOrderModal = function() {
  OrderModal.close();
};

// Tự động khởi tạo ngay lập tức nếu DOM đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => OrderModal.init());
} else {
  OrderModal.init();
}
