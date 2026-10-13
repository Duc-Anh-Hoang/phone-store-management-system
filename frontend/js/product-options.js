/**
 * QUẢN LÝ TÙY CHỌN SẢN PHẨM (Màu sắc, Dung lượng, Số lượng, Giá tiền)
 */

const ProductData = {
  name: 'iPhone 18 Pro Max',
  colors: {
    desert: {
      id: 'desert',
      name: 'Titan Sa Mạc',
      fullName: 'Titan Sa Mạc (Desert Titanium)',
      badge: 'Màu mới độc quyền',
      image: 'images/phone-desert.svg'
    },
    natural: {
      id: 'natural',
      name: 'Titan Tự Nhiên',
      fullName: 'Titan Tự Nhiên (Natural Titanium)',
      badge: 'Sang trọng & Bền bỉ',
      image: 'images/phone-natural.svg'
    },
    white: {
      id: 'white',
      name: 'Titan Trắng',
      fullName: 'Titan Trắng (White Titanium)',
      badge: 'Tinh tế & Thanh lịch',
      image: 'images/phone-white.svg'
    },
    black: {
      id: 'black',
      name: 'Titan Đen',
      fullName: 'Titan Đen (Black Titanium)',
      badge: 'Huyền bí & Quyền lực',
      image: 'images/phone-black.svg'
    },
    back: {
      id: 'back',
      name: 'Mặt lưng 3 Camera',
      fullName: 'Góc nhìn mặt sau (Cụm 3 Camera 48MP)',
      badge: 'Ống kính Fusion Tetraprism',
      image: 'images/phone-back.svg'
    }
  },
  storages: {
    '256gb': {
      id: '256gb',
      capacity: '256GB',
      price: 31490000,
      oldPrice: 34990000,
      stockStatus: 'Còn hàng sẵn tại cửa hàng',
      discountPercent: 'Giảm 10%'
    },
    '512gb': {
      id: '512gb',
      capacity: '512GB',
      price: 36990000,
      oldPrice: 40990000,
      stockStatus: 'Còn hàng (Giao ngay 2h)',
      discountPercent: 'Giảm 10%'
    },
    '1tb': {
      id: '1tb',
      capacity: '1TB',
      price: 42490000,
      oldPrice: 46990000,
      stockStatus: 'Số lượng có hạn (Chỉ còn 3 máy)',
      discountPercent: 'Giảm 10%'
    }
  }
};

// Trạng thái hiện tại
const ProductState = {
  color: 'desert',
  storage: '256gb',
  quantity: 1,

  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount).replace('₫', 'đ');
  },

  getCurrentPrice() {
    return ProductData.storages[this.storage].price;
  },

  getOriginalPrice() {
    return ProductData.storages[this.storage].oldPrice;
  },

  getTotalPrice() {
    return this.getCurrentPrice() * this.quantity;
  },

  getColorInfo() {
    return ProductData.colors[this.color];
  },

  getStorageInfo() {
    return ProductData.storages[this.storage];
  }
};

/**
 * Cập nhật tất cả các vị trí hiển thị thông tin sản phẩm trên trang
 */
function updateProductUI() {
  const colorInfo = ProductState.getColorInfo();
  const storageInfo = ProductState.getStorageInfo();
  const unitPrice = ProductState.getCurrentPrice();
  const oldPrice = ProductState.getOriginalPrice();
  const totalPrice = ProductState.getTotalPrice();

  // 1. Cập nhật ảnh và tên màu sắc ở Hero Section
  const heroMainImg = document.getElementById('hero-product-img');
  if (heroMainImg && colorInfo) {
    heroMainImg.src = colorInfo.image;
    heroMainImg.alt = `${ProductData.name} - ${colorInfo.name}`;
  }

  const heroColorName = document.getElementById('hero-color-name');
  if (heroColorName) {
    heroColorName.textContent = colorInfo.name;
  }

  // 2. Cập nhật giá Hero & Mobile Bar
  const heroCurrentPrice = document.getElementById('hero-current-price');
  if (heroCurrentPrice) {
    heroCurrentPrice.textContent = ProductState.formatCurrency(unitPrice);
  }

  const heroOldPrice = document.getElementById('hero-old-price');
  if (heroOldPrice) {
    heroOldPrice.textContent = ProductState.formatCurrency(oldPrice);
  }

  const mobileBarPrice = document.getElementById('mobile-bar-price');
  if (mobileBarPrice) {
    mobileBarPrice.textContent = ProductState.formatCurrency(unitPrice);
  }

  // 3. Cập nhật ở Section 4 (Khu vực Đặt hàng)
  const orderSectionImg = document.getElementById('order-summary-img');
  if (orderSectionImg) {
    orderSectionImg.src = colorInfo.image;
  }

  const orderSelectedColor = document.getElementById('order-selected-color-text');
  if (orderSelectedColor) {
    orderSelectedColor.textContent = colorInfo.name;
  }

  const orderSelectedStorage = document.getElementById('order-selected-storage-text');
  if (orderSelectedStorage) {
    orderSelectedStorage.textContent = storageInfo.capacity;
  }

  const orderStockStatus = document.getElementById('order-stock-status');
  if (orderStockStatus) {
    orderStockStatus.textContent = storageInfo.stockStatus;
  }

  const orderSummaryUnitPrice = document.getElementById('order-summary-unit-price');
  if (orderSummaryUnitPrice) {
    orderSummaryUnitPrice.textContent = ProductState.formatCurrency(unitPrice);
  }

  const orderSummaryTotal = document.getElementById('order-summary-total');
  if (orderSummaryTotal) {
    orderSummaryTotal.textContent = ProductState.formatCurrency(totalPrice);
  }

  const orderSummaryQty = document.getElementById('order-summary-qty');
  if (orderSummaryQty) {
    orderSummaryQty.textContent = ProductState.quantity;
  }

  // 4. Cập nhật trong Modal Đặt Hàng (nếu mở)
  const modalImg = document.getElementById('modal-product-img');
  if (modalImg) {
    modalImg.src = colorInfo.image;
  }

  const modalSummaryText = document.getElementById('modal-summary-variant');
  if (modalSummaryText) {
    modalSummaryText.textContent = `${colorInfo.name} - ${storageInfo.capacity} (x${ProductState.quantity})`;
  }

  const modalSummaryTotal = document.getElementById('modal-summary-total');
  if (modalSummaryTotal) {
    modalSummaryTotal.textContent = ProductState.formatCurrency(totalPrice);
  }

  // Đồng bộ trạng thái checked của các input radio
  document.querySelectorAll(`input[name="hero-color"][value="${ProductState.color}"]`).forEach(input => input.checked = true);
  document.querySelectorAll(`input[name="order-color"][value="${ProductState.color}"]`).forEach(input => input.checked = true);
  document.querySelectorAll(`input[name="order-storage"][value="${ProductState.storage}"]`).forEach(input => input.checked = true);
  document.querySelectorAll(`input[name="modal-color"][value="${ProductState.color}"]`).forEach(input => input.checked = true);
  document.querySelectorAll(`input[name="modal-storage"][value="${ProductState.storage}"]`).forEach(input => input.checked = true);

  // Phát event tùy chỉnh để các module khác có thể bắt
  window.dispatchEvent(new CustomEvent('productStateChanged', { detail: ProductState }));
}

/**
 * Gán sự kiện lắng nghe lựa chọn màu, dung lượng, số lượng
 */
function initProductOptions() {
  // Bắt sự kiện chọn màu (ở Hero, Section 4 và Modal)
  document.addEventListener('change', (e) => {
    if (e.target.matches('input[name="hero-color"], input[name="order-color"], input[name="modal-color"]')) {
      ProductState.color = e.target.value;
      updateProductUI();
    }

    if (e.target.matches('input[name="order-storage"], input[name="modal-storage"]')) {
      ProductState.storage = e.target.value;
      updateProductUI();
    }
  });

  // Tăng giảm số lượng ở Section Đặt hàng
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const inputQty = document.getElementById('input-order-quantity');

  if (btnQtyMinus && inputQty) {
    btnQtyMinus.addEventListener('click', () => {
      let val = parseInt(inputQty.value) || 1;
      if (val > 1) {
        val -= 1;
        inputQty.value = val;
        ProductState.quantity = val;
        updateProductUI();
      }
    });
  }

  if (btnQtyPlus && inputQty) {
    btnQtyPlus.addEventListener('click', () => {
      let val = parseInt(inputQty.value) || 1;
      if (val < 10) {
        val += 1;
        inputQty.value = val;
        ProductState.quantity = val;
        updateProductUI();
      }
    });
  }

  if (inputQty) {
    inputQty.addEventListener('change', () => {
      let val = parseInt(inputQty.value) || 1;
      if (val < 1) val = 1;
      if (val > 10) val = 10;
      inputQty.value = val;
      ProductState.quantity = val;
      updateProductUI();
    });
  }

  // Khởi tạo ban đầu
  updateProductUI();
}

window.ProductData = ProductData;
window.ProductState = ProductState;
window.updateProductUI = updateProductUI;
window.initProductOptions = initProductOptions;
