/**
 * TITAN STORE - PRODUCT DETAIL MODAL & QUICK VIEW
 * Xử lý xem chi tiết sản phẩm (Phần A7 của bản kế hoạch):
 * - Thư viện ảnh, đổi ảnh theo màu sắc
 * - Chọn phiên bản (dung lượng, RAM) -> đổi giá và số lượng tồn kho (vw_TonKho)
 * - Hiển thị giá VAT (VAT_PHANTRAM = 10%), freeship, bảo hành, đổi trả (HAN_DOITRA_NGAY = 30 ngày)
 * - Nút: Mua ngay / Thêm vào giỏ / Mua trả góp 0%
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TitanProductModal = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class ProductModalManager {
    constructor() {
      this.currentProduct = null;
      this.selectedColor = null;
      this.selectedVariant = null;
      this.selectedQty = 1;
    }

    open(maHang) {
      if (!window.TitanStoreData) return;
      const product = window.TitanStoreData.getProductById(maHang);
      if (!product) return;

      this.currentProduct = product;
      this.selectedColor = (product.mauSac && product.mauSac.length > 0) ? product.mauSac[0] : null;
      this.selectedVariant = (product.phienBan && product.phienBan.length > 0) ? product.phienBan[0] : null;
      this.selectedQty = 1;

      // Ghi nhận vào sản phẩm đã xem gần đây (localStorage)
      window.TitanStoreData.addRecentlyViewed(maHang);

      const modal = document.getElementById('product-detail-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }

      this.render();
    }

    close() {
      const modal = document.getElementById('product-detail-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    render() {
      const p = this.currentProduct;
      if (!p) return;

      // 1. Tên, thương hiệu, đánh giá
      const elTitle = document.getElementById('pmodal-title');
      const elBrand = document.getElementById('pmodal-brand');
      const elRating = document.getElementById('pmodal-rating');

      if (elTitle) elTitle.textContent = p.tenHang;
      if (elBrand) elBrand.textContent = p.nhanHieu || 'Chính hãng';
      if (elRating) elRating.innerHTML = `<i class="fa-solid fa-star text-amber-400 mr-1"></i>${p.rating || 5.0} (${p.reviewCount || 100}+ đánh giá)`;

      // 2. Ảnh chính & màu sắc
      this.updateGallery();

      // 3. Khối chọn màu sắc
      const colorContainer = document.getElementById('pmodal-colors');
      if (colorContainer && p.mauSac) {
        colorContainer.innerHTML = p.mauSac.map((c, idx) => {
          const isSelected = this.selectedColor && this.selectedColor.id === c.id;
          return `
            <button type="button" onclick="window.TitanProductModal.selectColor('${c.id}')" 
              class="flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                isSelected 
                  ? 'border-[#00483d] bg-[#dbf9eb] text-[#00483d] font-bold shadow-sm ring-1 ring-[#00483d]' 
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }">
              <span class="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" style="background-color: ${c.hex};"></span>
              <span>${c.ten}</span>
            </button>
          `;
        }).join('');
      }

      // 4. Khối chọn phiên bản (dung lượng)
      const variantContainer = document.getElementById('pmodal-variants');
      if (variantContainer && p.phienBan) {
        variantContainer.innerHTML = p.phienBan.map(v => {
          const isSelected = this.selectedVariant && this.selectedVariant.id === v.id;
          return `
            <button type="button" onclick="window.TitanProductModal.selectVariant('${v.id}')" 
              class="flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                isSelected 
                  ? 'border-[#00483d] bg-[#dbf9eb] text-[#00483d] font-bold shadow-sm ring-1 ring-[#00483d]' 
                  : 'border-slate-200 bg-white text-slate-700 font-medium hover:border-slate-300'
              }">
              <span class="text-xs">${v.dungLuong}</span>
              <span class="text-[10px] ${isSelected ? 'text-[#00483d]' : 'text-rose-600'} font-semibold mt-0.5">
                ${window.TitanCart ? window.TitanCart.formatMoney(v.gia) : v.gia}
              </span>
            </button>
          `;
        }).join('');
      }

      // 5. Giá tiền & Tồn kho
      this.updatePriceAndStock();

      // 6. Thông số kỹ thuật
      const specContainer = document.getElementById('pmodal-specs-table');
      if (specContainer && p.thongSo) {
        specContainer.innerHTML = Object.entries(p.thongSo).map(([k, v]) => `
          <tr class="border-b border-slate-100 last:border-0">
            <td class="py-2 px-3 text-slate-500 font-medium bg-slate-50/70 w-1/3 text-[11px]">${k}</td>
            <td class="py-2 px-3 text-navy font-semibold text-[11px]">${v}</td>
          </tr>
        `).join('');
      }
    }

    selectColor(colorId) {
      if (!this.currentProduct || !this.currentProduct.mauSac) return;
      const found = this.currentProduct.mauSac.find(c => c.id === colorId);
      if (found) {
        this.selectedColor = found;
        this.render();
      }
    }

    selectVariant(variantId) {
      if (!this.currentProduct || !this.currentProduct.phienBan) return;
      const found = this.currentProduct.phienBan.find(v => v.id === variantId);
      if (found) {
        this.selectedVariant = found;
        this.render();
      }
    }

    updateGallery() {
      const mainImg = document.getElementById('pmodal-main-image');
      if (mainImg) {
        const imgSrc = (this.selectedColor && this.selectedColor.anh) 
          ? this.selectedColor.anh 
          : this.currentProduct.anhChinh;
        mainImg.src = imgSrc;
        mainImg.alt = this.currentProduct.tenHang;
      }
    }

    updatePriceAndStock() {
      const currentPrice = this.selectedVariant ? this.selectedVariant.gia : this.currentProduct.donGia;
      const oldPrice = this.selectedVariant ? this.selectedVariant.giaGoc : (this.currentProduct.giaGoc || currentPrice);
      const stock = this.selectedVariant ? this.selectedVariant.tonKho : this.currentProduct.tonKho;

      const elPrice = document.getElementById('pmodal-price');
      const elOldPrice = document.getElementById('pmodal-oldprice');
      const elStock = document.getElementById('pmodal-stock');
      const elDiscountTag = document.getElementById('pmodal-discount-tag');

      if (elPrice && window.TitanCart) elPrice.textContent = window.TitanCart.formatMoney(currentPrice);
      if (elOldPrice && window.TitanCart) {
        if (oldPrice > currentPrice) {
          elOldPrice.textContent = window.TitanCart.formatMoney(oldPrice);
          elOldPrice.classList.remove('hidden');
          const percent = Math.round((1 - currentPrice / oldPrice) * 100);
          if (elDiscountTag) {
            elDiscountTag.textContent = `Tiết kiệm ${percent}%`;
            elDiscountTag.classList.remove('hidden');
          }
        } else {
          elOldPrice.classList.add('hidden');
          if (elDiscountTag) elDiscountTag.classList.add('hidden');
        }
      }

      if (elStock) {
        if (stock > 0) {
          elStock.innerHTML = `<span class="inline-flex items-center gap-1.5 text-emerald-600 font-bold"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Còn hàng (${stock} sản phẩm sẵn có)</span>`;
        } else {
          elStock.innerHTML = `<span class="inline-flex items-center gap-1.5 text-rose-600 font-bold"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Tạm hết hàng</span>`;
        }
      }
    }

    addToCart(goToCheckout = false) {
      if (!this.currentProduct || !window.TitanCart) return;

      const res = window.TitanCart.addItem(
        this.currentProduct,
        this.selectedVariant,
        this.selectedColor,
        this.selectedQty
      );

      if (res.success) {
        this.close();
        if (goToCheckout) {
          if (window.TitanCheckout) window.TitanCheckout.openCheckout();
        } else {
          window.TitanCart.openDrawer();
        }
      } else {
        window.TitanCart.showToast(res.message, 'error');
      }
    }
  }

  return new ProductModalManager();
}));
