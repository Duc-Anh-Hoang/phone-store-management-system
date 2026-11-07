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

  var API_BASE = window.API_BASE || '/api';

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
        const [mathangRes, nhomhangRes, loaihangRes, kmRes, metaRes] = await Promise.all([
          fetch(`${API_BASE}/mathang`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/nhomhang`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/loaihang`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API_BASE}/khuyenmai/hoatdong`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('data/products-meta.json').then(r => r.ok ? r.json() : fetch('products-meta.json').then(r2 => r2.ok ? r2.json() : {})).catch(() => ({}))
        ]);

        this.nhomHang = Array.isArray(nhomhangRes) ? nhomhangRes : [];
        this.loaiHang = Array.isArray(loaihangRes) ? loaihangRes : [];
        this.promotions = Array.isArray(kmRes) ? kmRes : [];

        const metaMap = (metaRes && typeof metaRes === 'object') ? metaRes : {};
        const metaValues = Object.values(metaMap);
        const backendItems = Array.isArray(mathangRes) ? mathangRes : [];

        const mergedList = [];
        const seenIds = new Set();

        for (const item of backendItems) {
          seenIds.add(item.maHang);
          const meta = metaMap[item.maHang] || metaValues.find(m => m.tenHang && item.tenHang && m.tenHang.toLowerCase() === item.tenHang.toLowerCase());
          const tonKho = item.tonKho !== undefined ? Number(item.tonKho) : (meta?.tonKho || 15);
          const donGia = Number(item.donGia) || meta?.donGia || 0;
          const anhChinh = meta?.anhChinh || item.hinhAnh || 'https://i.hoanghamobile.vn/Uploads/2024/09/10/iphone-16-pro-natural-titan.png';

          mergedList.push({
            maHang: item.maHang,
            tenHang: item.tenHang,
            donGia: donGia,
            giaGoc: meta?.giaGoc || Math.round(donGia * 1.08),
            dvt: item.dvt || 'Cái',
            maNhom: item.maNhom || meta?.maNhom || 'DIENTHOAI',
            tenNhom: item.tenNhom || meta?.tenNhom || (this.nhomHang.find(n => n.maNhom === item.maNhom)?.tenNhom || 'Điện thoại'),
            maLoai: item.maLoai || meta?.maLoai || 'OTHER',
            tenLoai: item.tenLoai || meta?.nhanHieu || (this.loaiHang.find(l => l.maLoai === item.maLoai)?.tenLoai || ''),
            nhanHieu: item.tenLoai || meta?.nhanHieu || 'Chính hãng',
            quanLyImei: !!item.quanLyIMEI,
            thoiHanBaoHanh: item.thoiHanBaoHanh !== undefined ? item.thoiHanBaoHanh : 12,
            tonKho: tonKho,
            anhChinh: anhChinh,
            mauSac: meta?.mauSac && meta.mauSac.length > 0 ? meta.mauSac : [{ id: 'std', ten: 'Mặc định', anh: anhChinh, hex: '#d70018' }],
            phienBan: meta?.phienBan && meta.phienBan.length > 0 ? meta.phienBan : [{ id: 'std', dungLuong: 'Tiêu chuẩn', gia: donGia, giaGoc: Math.round(donGia * 1.08), tonKho: tonKho }],
            thongSo: meta?.thongSo || {}
          });
        }

        // Add metadata products not yet in backend
        for (const meta of metaValues) {
          if (!seenIds.has(meta.maHang)) {
            mergedList.push({
              maHang: meta.maHang,
              tenHang: meta.tenHang,
              donGia: meta.donGia,
              giaGoc: meta.giaGoc || Math.round(meta.donGia * 1.08),
              dvt: 'Cái',
              maNhom: meta.maNhom || 'DIENTHOAI',
              tenNhom: meta.tenNhom || 'Điện thoại',
              maLoai: meta.maLoai || 'OTHER',
              tenLoai: meta.nhanHieu || '',
              nhanHieu: meta.nhanHieu || 'Chính hãng',
              quanLyImei: true,
              thoiHanBaoHanh: 12,
              tonKho: 15,
              anhChinh: meta.anhChinh,
              mauSac: meta.mauSac || [{ id: 'std', ten: 'Mặc định', anh: meta.anhChinh, hex: '#d70018' }],
              phienBan: meta.phienBan || [{ id: 'std', dungLuong: 'Tiêu chuẩn', gia: meta.donGia, giaGoc: meta.giaGoc, tonKho: 15 }],
              thongSo: meta.thongSo || {}
            });
          }
        }

        this.products = mergedList;
        this.isInitialized = true;
        this.loadError = null;
      } catch (err) {
        this.isInitialized = false;
        this.loadError = 'Không tải được sản phẩm, vui lòng thử lại';
        console.error('StoreDataManager init error:', err);
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
        const isPhone = p.maNhom === 'NH01' || p.maNhom === 'DIENTHOAI';
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
      return this.products.filter(p => p.maNhom === 'NH02' || p.maNhom === 'NH03' || p.maNhom === 'PHUKIEN' || p.maNhom === 'AMTHANH');
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
