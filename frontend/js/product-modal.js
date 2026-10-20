/**
 * CellphoneS - 241 Lê Văn Việt
 * Xử lý xem chi tiết sản phẩm:
 * - Thư viện ảnh, đổi ảnh theo màu sắc
 * - Chọn phiên bản -> đổi giá và số lượng tồn kho (vw_TonKho)
 * - Tải thông số kỹ thuật thật từ API: /api/mathang/{maHang}/thongso
 * - Nút: Mua ngay / Thêm vào giỏ
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CellphoneSProductModal = root.ProductModal = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var API_BASE = window.API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '8080' ? '/api' : 'http://localhost:8080/api')
    : '/api';

  class ProductModalManager {
    constructor() {
      this.currentProduct = null;
      this.selectedColor = null;
      this.selectedVariant = null;
      this.selectedQty = 1;
    }

    async open(maHang) {
      if (!(window.CellphoneSData || window.StoreData)) return;
      let product = (window.CellphoneSData || window.StoreData).getProductById(maHang);
      if (!product) {
        try {
          const res = await fetch(`${API_BASE}/mathang/${maHang}`);
          if (res.ok) {
            const item = await res.json();
            product = {
              maHang: item.maHang,
              tenHang: item.tenHang,
              donGia: Number(item.donGia),
              thoiHanBaoHanh: item.thoiHanBaoHanh,
              tonKho: item.tonKho || 0,
              anhChinh: item.maNhom === 'NH02' ? 'images/accessories-pack.svg' : 'images/phone-desert.svg',
              phienBan: [{ id: 'std', dungLuong: 'Tiêu chuẩn', gia: Number(item.donGia), giaGoc: Math.round(Number(item.donGia) * 1.05), tonKho: item.tonKho || 0 }]
            };
          }
        } catch (e) {}
      }
      if (!product) return;

      this.currentProduct = product;
      this.selectedColor = (product.mauSac && product.mauSac.length > 0) ? product.mauSac[0] : null;
      this.selectedVariant = (product.phienBan && product.phienBan.length > 0) ? product.phienBan[0] : null;
      this.selectedQty = 1;

      const modal = document.getElementById('product-detail-modal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }

      this.render();

      // Gọi API lấy thông số kỹ thuật thật từ CSDL
      try {
        const specRes = await fetch(`${API_BASE}/mathang/${maHang}/thongso`);
        if (specRes.ok) {
          const specs = await specRes.json();
          if (Array.isArray(specs) && specs.length > 0) {
            const specContainer = document.getElementById('pmodal-specs-table');
            if (specContainer) {
              specContainer.innerHTML = specs.map(s => `
                <tr class="border-b border-slate-100 last:border-0">
                  <td class="py-2 px-3 text-slate-500 font-medium bg-slate-50/70 w-1/3 text-[11px]">${s.tenThuocTinh}</td>
                  <td class="py-2 px-3 text-navy font-semibold text-[11px]">${s.giaTri}</td>
                </tr>
              `).join('');
            }
          }
        }
      } catch (e) {}
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

      const elTitle = document.getElementById('pmodal-title');
      const elBrand = document.getElementById('pmodal-brand');
      const elRating = document.getElementById('pmodal-rating');

      if (elTitle) elTitle.textContent = p.tenHang;
      if (elBrand) elBrand.textContent = p.nhanHieu || (p.tenLoai || 'Chính hãng');
      if (elRating) elRating.innerHTML = `<i class="fa-solid fa-star text-amber-400 mr-1"></i>${p.rating || 5.0} (${p.reviewCount || 100}+ đánh giá)`;

      this.updateGallery();

      const colorContainer = document.getElementById('pmodal-colors');
      if (colorContainer && p.mauSac) {
        colorContainer.innerHTML = p.mauSac.map((c) => {
          const isSelected = this.selectedColor && this.selectedColor.id === c.id;
          return `
            <button type="button" onclick="window.CellphoneSProductModal.selectColor('${c.id}')" 
              class="flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                isSelected 
                  ? 'border-[#d70018] bg-[#fee2e2] text-[#d70018] font-bold shadow-sm ring-1 ring-[#d70018]' 
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }">
              <span class="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" style="background-color: ${c.hex};"></span>
              <span>${c.ten}</span>
            </button>
          `;
        }).join('');
      }

      const variantContainer = document.getElementById('pmodal-variants');
      if (variantContainer && p.phienBan) {
        variantContainer.innerHTML = p.phienBan.map(v => {
          const isSelected = this.selectedVariant && this.selectedVariant.id === v.id;
          return `
            <button type="button" onclick="window.CellphoneSProductModal.selectVariant('${v.id}')" 
              class="flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                isSelected 
                  ? 'border-[#d70018] bg-[#fee2e2] text-[#d70018] font-bold shadow-sm ring-1 ring-[#d70018]' 
                  : 'border-slate-200 bg-white text-slate-700 font-medium hover:border-slate-300'
              }">
              <span class="text-xs">${v.dungLuong}</span>
              <span class="text-[10px] ${isSelected ? 'text-[#d70018]' : 'text-rose-600'} font-semibold mt-0.5">
                ${(window.CellphoneSCart || window.Cart) ? (window.CellphoneSCart || window.Cart).formatMoney(v.gia) : v.gia}
              </span>
            </button>
          `;
        }).join('');
      }

      this.updatePriceAndStock();

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

      if (elPrice && (window.CellphoneSCart || window.Cart)) elPrice.textContent = (window.CellphoneSCart || window.Cart).formatMoney(currentPrice);
      if (elOldPrice && (window.CellphoneSCart || window.Cart)) {
        if (oldPrice > currentPrice) {
          elOldPrice.textContent = (window.CellphoneSCart || window.Cart).formatMoney(oldPrice);
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
      if (!this.currentProduct || !(window.CellphoneSCart || window.Cart)) return;

      const res = (window.CellphoneSCart || window.Cart).addItem(
        this.currentProduct,
        this.selectedVariant,
        this.selectedColor,
        this.selectedQty
      );

      if (res.success) {
        this.close();
        if (goToCheckout) {
          if ((window.CellphoneSCheckout || window.Checkout)) (window.CellphoneSCheckout || window.Checkout).openCheckout();
        } else {
          (window.CellphoneSCart || window.Cart).openDrawer();
        }
      } else {
        (window.CellphoneSCart || window.Cart).showToast(res.message, 'error');
      }
    }
  }

  return new ProductModalManager();
}));
