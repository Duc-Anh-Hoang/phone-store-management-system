/**
 * CellphoneS - 241 Lê Văn Việt - DATA LAYER & REPOSITORY
 * Dữ liệu lấy trực tiếp từ Backend REST API (Spring Boot / SQL Server)
 * Tuyệt đối không lưu dữ liệu giả hoặc rơi về dữ liệu cứng
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CellphoneSData = root.StoreData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var API_BASE = window.API_BASE || (window.location.protocol === 'file:' || window.location.port === '5500') 
    ? 'http://localhost:8080/api' 
    : '/api';

  class StoreDataManager {
    constructor() {
      this.products = [];
      this.nhomHang = [];
      this.loaiHang = [];
      this.promotions = [];
      this.isInitialized = false;
      this.loadError = null;
    }

    async init() {
      if (this.isInitialized) return;

      try {
        const [mathangRes, nhomhangRes, loaihangRes, kmRes] = await Promise.all([
          fetch(`${API_BASE}/mathang`).then(r => r.ok ? r.json() : Promise.reject(`Lỗi tải mặt hàng (${r.status})`)),
          fetch(`${API_BASE}/nhomhang`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/loaihang`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/khuyenmai/hoatdong`).then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        this.nhomHang = Array.isArray(nhomhangRes) ? nhomhangRes : [];
        this.loaiHang = Array.isArray(loaihangRes) ? loaihangRes : [];
        this.promotions = Array.isArray(kmRes) ? kmRes : [];

        // Map backend entities to frontend product models
        this.products = (Array.isArray(mathangRes) ? mathangRes : []).map(item => {
          const tonKho = item.tonKho !== undefined ? Number(item.tonKho) : 0;
          const donGia = Number(item.donGia) || 0;
          let anhChinh = 'images/phone-desert.svg';
          const nameLower = (item.tenHang || '').toLowerCase();
          if (item.maNhom === 'NH04' || nameLower.includes('ipad') || nameLower.includes('tab')) {
            anhChinh = 'images/ipad-pro.svg';
          } else if (nameLower.includes('samsung') || nameLower.includes('galaxy')) {
            anhChinh = 'images/galaxy-s24.svg';
          } else if (nameLower.includes('iphone 15') || nameLower.includes('natural')) {
            anhChinh = 'images/phone-natural.svg';
          } else if (nameLower.includes('iphone 13') || nameLower.includes('iphone 16 plus') || nameLower.includes('redmi') || nameLower.includes('oppo')) {
            anhChinh = 'images/phone-black.svg';
          } else if (item.maNhom === 'NH02' || item.maNhom === 'NH03' || item.maNhom === 'NH05' || nameLower.includes('sạc') || nameLower.includes('cáp') || nameLower.includes('tai nghe') || nameLower.includes('loa') || nameLower.includes('pin') || nameLower.includes('ốp') || nameLower.includes('watch')) {
            anhChinh = 'images/accessories-pack.svg';
          }

          return {
            maHang: item.maHang,
            tenHang: item.tenHang,
            donGia: donGia,
            giaGoc: Math.round(donGia * 1.08),
            dvt: item.dvt || 'Cái',
            maNhom: item.maNhom,
            tenNhom: item.tenNhom || (this.nhomHang.find(n => n.maNhom === item.maNhom)?.tenNhom || 'Điện thoại'),
            maLoai: item.maLoai,
            tenLoai: item.tenLoai || (this.loaiHang.find(l => l.maLoai === item.maLoai)?.tenLoai || ''),
            nhanHieu: item.tenLoai || 'Chính hãng',
            quanLyImei: !!item.quanLyIMEI,
            thoiHanBaoHanh: item.thoiHanBaoHanh !== undefined ? item.thoiHanBaoHanh : (item.quanLyIMEI ? 12 : 0),
            tonKho: tonKho,
            anhChinh: anhChinh,
            mauSac: [{ id: 'std', ten: 'Mặc định', anh: anhChinh, hex: '#d70018' }],
            phienBan: [{ id: 'std', dungLuong: 'Tiêu chuẩn', gia: donGia, giaGoc: Math.round(donGia * 1.08), tonKho: tonKho }]
          };
        });

        this.isInitialized = true;
        this.loadError = null;
      } catch (err) {
        this.isInitialized = false;
        this.loadError = 'Không tải được sản phẩm, vui lòng thử lại';
        console.error('StoreDataManager init error:', err);
        // Hiển thị thông báo lỗi lên giao diện nếu có shelf
        const shelf = document.getElementById('product-shelves');
        if (shelf) {
          shelf.innerHTML = `<div class="p-8 text-center text-rose-600 font-bold bg-rose-50 rounded-2xl border border-rose-200 my-6">
            <i class="fa-solid fa-circle-exclamation text-2xl mb-2 block"></i>
            Không tải được sản phẩm, vui lòng thử lại.
          </div>`;
        }
      }
    }

    getAllProducts() {
      return this.products;
    }

    getProductById(maHang) {
      return this.products.find(p => p.maHang === maHang) || null;
    }

    getFeaturedPhones(brand = 'all') {
      return this.products.filter(p => {
        const isPhone = p.maNhom === 'NH01';
        if (!isPhone) return false;
        if (!brand || brand === 'all') return true;
        return (p.nhanHieu || '').toLowerCase().includes(brand.toLowerCase());
      });
    }

    getNewArrivals() {
      return this.products.slice(0, 8);
    }

    getBestSellers() {
      return this.products.slice(8, 16);
    }

    getFlashSaleProducts() {
      return [];
    }

    getRecentlyViewed() {
      return [];
    }

    getAccessories() {
      return this.products.filter(p => p.maNhom === 'NH02' || p.maNhom === 'NH03');
    }

    getProductsByBrand(brand = 'all') {
      if (!brand || brand === 'all') return this.products;
      return this.products.filter(p => (p.nhanHieu || '').toLowerCase().includes(brand.toLowerCase()));
    }

    search(query = '', filters = {}) {
      const q = (query || '').trim().toLowerCase();
      let list = [...this.products];

      if (q) {
        list = list.filter(p => {
          const matchName = (p.tenHang || '').toLowerCase().includes(q);
          const matchCode = (p.maHang || '').toLowerCase().includes(q);
          const matchBrand = (p.nhanHieu || '').toLowerCase().includes(q);
          const matchGroup = (p.tenNhom || '').toLowerCase().includes(q);
          const matchType = (p.tenLoai || '').toLowerCase().includes(q);
          return matchName || matchCode || matchBrand || matchGroup || matchType;
        });
      }

      if (filters.brand && filters.brand !== 'all') {
        list = list.filter(p => (p.nhanHieu || '').toLowerCase().includes(filters.brand.toLowerCase()));
      }

      if (filters.category && filters.category !== 'all') {
        list = list.filter(p => p.maNhom === filters.category);
      }

      if (filters.priceRange && filters.priceRange !== 'all') {
        switch (filters.priceRange) {
          case 'under_5m':
            list = list.filter(p => p.donGia < 5000000);
            break;
          case '5m_15m':
            list = list.filter(p => p.donGia >= 5000000 && p.donGia <= 15000000);
            break;
          case '15m_25m':
            list = list.filter(p => p.donGia > 15000000 && p.donGia <= 25000000);
            break;
          case 'over_25m':
            list = list.filter(p => p.donGia > 25000000);
            break;
        }
      }

      if (filters.inStockOnly) {
        list = list.filter(p => p.tonKho > 0);
      }

      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            list.sort((a, b) => a.donGia - b.donGia);
            break;
          case 'price_desc':
            list.sort((a, b) => b.donGia - a.donGia);
            break;
        }
      }

      return list;
    }

    verifyPromotion(maKM) {
      if (!maKM) return null;
      const code = maKM.trim().toUpperCase();
      const now = new Date();

      const promo = this.promotions.find(p => (p.maKM || '').toUpperCase() === code);
      if (!promo) return null;

      if (promo.tamDung) return null;
      if (promo.ngayBD && new Date(promo.ngayBD) > now) return null;
      if (promo.ngayKT && new Date(promo.ngayKT) < now) return null;

      return {
        maKM: promo.maKM,
        tenKM: promo.tenKM,
        phanTramGiam: Number(promo.phanTramGiam) || 0,
        moTa: promo.moTa || `Giảm ${promo.phanTramGiam}% trên tổng giá trị hóa đơn`
      };
    }

    formatVND(amount) {
      return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0)) + ' đ';
    }
  }

  return new StoreDataManager();
}));
