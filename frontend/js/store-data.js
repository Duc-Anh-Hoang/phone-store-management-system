/**
 * TITAN STORE - DATA LAYER & REPOSITORY
 * Quản lý kho sản phẩm, danh mục, tồn kho, tìm kiếm và đồng bộ giữa:
 * 1. Backend REST API (Spring Boot / SQL Server: MatHang, NhomHang, LoaiHang, KhuyenMai, BaoHanh...)
 * 2. Kho dữ liệu LocalStorage quản trị (titan_admin_db_v3)
 * 3. File cấu hình home-config.json
 * Không sửa đổi schema database QuanLyCuaHangDienThoai.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TitanStoreData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const API_BASE = (window.location.protocol === 'file:' || window.location.port === '5500') 
    ? 'http://localhost:8080/api' 
    : '/api';

  const STORAGE_KEY_RECENT = 'titan_recently_viewed_v1';
  const STORAGE_KEY_FAVORITES = 'titan_favorite_products_v1';

  // Danh mục sản phẩm mở rộng chuẩn cho TITAN STORE
  const DEFAULT_PRODUCTS = [
    {
      maHang: 'MH001',
      tenHang: 'iPhone 18 Pro Max 256GB',
      donGia: 31490000,
      giaGoc: 34990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH01',
      tenLoai: 'Apple iPhone',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 28,
      daBan: 88,
      traGop0: true,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 142,
      anhChinh: 'images/phone-desert.svg',
      mauSac: [
        { id: 'desert', ten: 'Titan Sa Mạc', anh: 'images/phone-desert.svg', hex: '#C5A88E' },
        { id: 'natural', ten: 'Titan Tự Nhiên', anh: 'images/phone-natural.svg', hex: '#9E9D99' },
        { id: 'white', ten: 'Titan Trắng', anh: 'images/phone-white.svg', hex: '#F1F2F4' },
        { id: 'black', ten: 'Titan Đen', anh: 'images/phone-black.svg', hex: '#313237' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB', gia: 31490000, giaGoc: 34990000, tonKho: 28 },
        { id: '512gb', dungLuong: '512GB', gia: 36990000, giaGoc: 40990000, tonKho: 15 },
        { id: '1tb', dungLuong: '1TB', gia: 42490000, giaGoc: 46990000, tonKho: 8 }
      ],
      thongSo: {
        'Màn hình': '6.9" Super Retina XDR OLED 120Hz ProMotion',
        'Chipset': 'Apple A18 Pro 3nm 6-core GPU',
        'RAM': '8GB Unified RAM',
        'Camera sau': 'Chính 48MP + Góc rộng 48MP + Tele 12MP Zoom 5x',
        'Camera trước': '12MP TrueDepth FaceID',
        'Pin & Sạc': '4685 mAh, Sạc nhanh 35W, MagSafe 25W',
        'Tính năng': 'Nút Camera Control, Apple Intelligence tiếng Việt, Khung Titan Cấp 5'
      }
    },
    {
      maHang: 'MH002',
      tenHang: 'iPhone 18 Pro Max 512GB',
      donGia: 36990000,
      giaGoc: 40990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH01',
      tenLoai: 'Apple iPhone',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 15,
      daBan: 45,
      traGop0: true,
      isFlashSale: false,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 89,
      anhChinh: 'images/phone-natural.svg',
      mauSac: [
        { id: 'desert', ten: 'Titan Sa Mạc', anh: 'images/phone-desert.svg', hex: '#C5A88E' },
        { id: 'natural', ten: 'Titan Tự Nhiên', anh: 'images/phone-natural.svg', hex: '#9E9D99' },
        { id: 'white', ten: 'Titan Trắng', anh: 'images/phone-white.svg', hex: '#F1F2F4' },
        { id: 'black', ten: 'Titan Đen', anh: 'images/phone-black.svg', hex: '#313237' }
      ],
      phienBan: [
        { id: '512gb', dungLuong: '512GB', gia: 36990000, giaGoc: 40990000, tonKho: 15 }
      ],
      thongSo: {
        'Màn hình': '6.9" Super Retina XDR OLED 120Hz',
        'Chipset': 'Apple A18 Pro 3nm',
        'RAM': '8GB Unified RAM',
        'Camera sau': '48MP + 48MP + 12MP (Zoom 5x)',
        'Pin & Sạc': '4685 mAh, Sạc 35W'
      }
    },
    {
      maHang: 'MH003',
      tenHang: 'iPhone 18 Pro Max 1TB',
      donGia: 42490000,
      giaGoc: 46990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH01',
      tenLoai: 'Apple iPhone',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 8,
      daBan: 19,
      traGop0: true,
      isFlashSale: false,
      isNew: true,
      isBestSeller: false,
      rating: 5.0,
      reviewCount: 32,
      anhChinh: 'images/phone-black.svg',
      mauSac: [
        { id: 'black', ten: 'Titan Đen', anh: 'images/phone-black.svg', hex: '#313237' },
        { id: 'desert', ten: 'Titan Sa Mạc', anh: 'images/phone-desert.svg', hex: '#C5A88E' }
      ],
      phienBan: [
        { id: '1tb', dungLuong: '1TB', gia: 42490000, giaGoc: 46990000, tonKho: 8 }
      ],
      thongSo: {
        'Màn hình': '6.9" Super Retina XDR OLED',
        'Chipset': 'Apple A18 Pro 3nm',
        'RAM': '8GB RAM',
        'Bộ nhớ': '1TB NVMe Tốc độ cao'
      }
    },
    {
      maHang: 'MH004',
      tenHang: 'iPhone 18 Pro 128GB',
      donGia: 27990000,
      giaGoc: 30990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH01',
      tenLoai: 'Apple iPhone',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 34,
      daBan: 64,
      traGop0: true,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 110,
      anhChinh: 'images/phone-natural.svg',
      mauSac: [
        { id: 'natural', ten: 'Titan Tự Nhiên', anh: 'images/phone-natural.svg', hex: '#9E9D99' },
        { id: 'white', ten: 'Titan Trắng', anh: 'images/phone-white.svg', hex: '#F1F2F4' },
        { id: 'desert', ten: 'Titan Sa Mạc', anh: 'images/phone-desert.svg', hex: '#C5A88E' }
      ],
      phienBan: [
        { id: '128gb', dungLuong: '128GB', gia: 27990000, giaGoc: 30990000, tonKho: 34 }
      ],
      thongSo: {
        'Màn hình': '6.3" Super Retina XDR 120Hz',
        'Chipset': 'Apple A18 Pro 3nm',
        'RAM': '8GB RAM',
        'Camera sau': '48MP + 48MP + 12MP (Zoom 5x)',
        'Pin': '3582 mAh'
      }
    },
    {
      maHang: 'MH005',
      tenHang: 'Samsung Galaxy S24 Ultra 256GB',
      donGia: 28490000,
      giaGoc: 33990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH02',
      tenLoai: 'Samsung Galaxy',
      nhanHieu: 'Samsung',
      quanLyImei: true,
      tonKho: 19,
      daBan: 76,
      traGop0: true,
      isFlashSale: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 198,
      anhChinh: 'images/galaxy-s24.svg',
      mauSac: [
        { id: 'gray', ten: 'Xám Titan', anh: 'images/galaxy-s24.svg', hex: '#777576' },
        { id: 'black', ten: 'Đen Titan', anh: 'images/galaxy-s24.svg', hex: '#262626' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB', gia: 28490000, giaGoc: 33990000, tonKho: 19 },
        { id: '512gb', dungLuong: '512GB', gia: 32490000, giaGoc: 37490000, tonKho: 11 }
      ],
      thongSo: {
        'Màn hình': '6.8" Dynamic AMOLED 2X 120Hz 2600 nits',
        'Chipset': 'Snapdragon 8 Gen 3 for Galaxy',
        'RAM': '12GB LPDDR5X',
        'Camera sau': '200MP + 50MP (5x) + 12MP + 10MP (3x)',
        'Pin & Sạc': '5000 mAh, Sạc siêu nhanh 45W',
        'Tính năng': 'Bút S-Pen tích hợp, Khung Titan, Galaxy AI tiếng Việt'
      }
    },
    {
      maHang: 'MH006',
      tenHang: 'Củ sạc nhanh Apple 20W Type-C Chính Hãng',
      donGia: 550000,
      giaGoc: 690000,
      dvt: 'Cái',
      maNhom: 'NH02',
      tenNhom: 'Phụ kiện chính hãng',
      maLoai: 'LH03',
      tenLoai: 'Sạc & Cáp',
      nhanHieu: 'Apple',
      quanLyImei: false,
      thoiHanBaoHanh: 12,
      tonKho: 120,
      daBan: 350,
      traGop0: false,
      isFlashSale: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 382,
      anhChinh: 'images/accessories-pack.svg',
      mauSac: [
        { id: 'white', ten: 'Trắng', anh: 'images/accessories-pack.svg', hex: '#FFFFFF' }
      ],
      phienBan: [
        { id: 'std', dungLuong: '20W USB-C', gia: 550000, giaGoc: 690000, tonKho: 120 }
      ],
      thongSo: {
        'Công suất': '20W Power Delivery',
        'Cổng kết nối': 'USB Type-C',
        'Chuẩn sạc': 'PD 3.0 an toàn',
        'Tương thích': 'iPhone 18/17/16/15, iPad Air, iPad Pro'
      }
    },
    {
      maHang: 'MH007',
      tenHang: 'Ốp lưng MagSafe Trong Suốt iPhone 18 Pro Max',
      donGia: 450000,
      giaGoc: 590000,
      dvt: 'Cái',
      maNhom: 'NH02',
      tenNhom: 'Phụ kiện chính hãng',
      maLoai: 'LH03',
      tenLoai: 'Ốp lưng & Bao da',
      nhanHieu: 'Apple',
      quanLyImei: false,
      thoiHanBaoHanh: 0,
      tonKho: 95,
      daBan: 215,
      traGop0: false,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 165,
      anhChinh: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
      mauSac: [
        { id: 'clear', ten: 'Trong suốt', anh: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80', hex: '#E5E7EB' }
      ],
      phienBan: [
        { id: 'std', dungLuong: 'iPhone 18 Pro Max', gia: 450000, giaGoc: 590000, tonKho: 95 }
      ],
      thongSo: {
        'Chất liệu': 'Nhựa Polycarbonate & TPU chống ố vàng',
        'Tính năng': 'Tích hợp vòng nam châm MagSafe hít chặt 15W',
        'Bảo vệ': 'Chống rơi vỡ đạt chuẩn quân đội 2m'
      }
    },
    {
      maHang: 'MH008',
      tenHang: 'Tai nghe AirPods Pro 2 USB-C Chính Hãng VN/A',
      donGia: 5690000,
      giaGoc: 6290000,
      dvt: 'Cái',
      maNhom: 'NH03',
      tenNhom: 'Thiết bị âm thanh',
      maLoai: 'LH04',
      tenLoai: 'Tai nghe Bluetooth',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 42,
      daBan: 180,
      traGop0: true,
      isFlashSale: false,
      isNew: false,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 240,
      anhChinh: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      mauSac: [
        { id: 'white', ten: 'Trắng', anh: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80', hex: '#FFFFFF' }
      ],
      phienBan: [
        { id: 'std', dungLuong: 'Hộp sạc MagSafe USB-C', gia: 5690000, giaGoc: 6290000, tonKho: 42 }
      ],
      thongSo: {
        'Chip': 'Apple H2 chống ồn chủ động gấp 2 lần',
        'Cổng sạc': 'USB-C & Hỗ trợ sạc không dây MagSafe/Apple Watch',
        'Thời lượng pin': '6 giờ (tai nghe), 30 giờ (kèm hộp)',
        'Tính năng': 'Âm thanh không gian cá nhân hóa, Chế độ thích ứng'
      }
    },
    {
      maHang: 'MH009',
      tenHang: 'Xiaomi 14 Ultra 5G 16GB/512GB Leica',
      donGia: 26990000,
      giaGoc: 31990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH05',
      tenLoai: 'Xiaomi',
      nhanHieu: 'Xiaomi',
      quanLyImei: true,
      thoiHanBaoHanh: 18,
      tonKho: 14,
      daBan: 35,
      traGop0: true,
      isFlashSale: false,
      isNew: true,
      isBestSeller: false,
      rating: 4.8,
      reviewCount: 65,
      anhChinh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      mauSac: [
        { id: 'black', ten: 'Đen Da Thuần', anh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', hex: '#1C1917' }
      ],
      phienBan: [
        { id: '512gb', dungLuong: '512GB', gia: 26990000, giaGoc: 31990000, tonKho: 14 }
      ],
      thongSo: {
        'Màn hình': '6.73" LTPO AMOLED 120Hz 3000 nits',
        'Ống kính': 'Cụm 4 Camera Leica 50MP cảm biến 1 inch LYT-900',
        'Chip': 'Snapdragon 8 Gen 3 4nm',
        'Pin': '5000 mAh, Sạc siêu tốc 90W HyperCharge'
      }
    },
    {
      maHang: 'MH010',
      tenHang: 'Pin sạc dự phòng Anker MagGo 10.000mAh Qi2 15W',
      donGia: 1190000,
      giaGoc: 1490000,
      dvt: 'Cái',
      maNhom: 'NH02',
      tenNhom: 'Phụ kiện chính hãng',
      maLoai: 'LH03',
      tenLoai: 'Pin dự phòng',
      nhanHieu: 'Anker',
      quanLyImei: false,
      thoiHanBaoHanh: 18,
      tonKho: 55,
      daBan: 140,
      traGop0: false,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 92,
      anhChinh: 'images/accessories-pack.svg',
      mauSac: [
        { id: 'black', ten: 'Đen Nhám', anh: 'images/accessories-pack.svg', hex: '#262626' },
        { id: 'white', ten: 'Trắng Sữa', anh: 'images/accessories-pack.svg', hex: '#F3F4F6' }
      ],
      phienBan: [
        { id: 'std', dungLuong: '10.000 mAh Qi2', gia: 1190000, giaGoc: 1490000, tonKho: 55 }
      ],
      thongSo: {
        'Dung lượng': '10.000mAh sạc đầy ~2 lần iPhone',
        'Chuẩn sạc': 'Qi2 Không dây 15W & Cáp Type-C 27W',
        'Màn hình': 'Màn hình LED hiển thị thời gian sạc và pin'
      }
    },
    {
      maHang: 'MH011',
      tenHang: 'iPad Pro M4 11 inch 256GB Wi-Fi Ultra Retina XDR',
      donGia: 26990000,
      giaGoc: 28990000,
      dvt: 'Cái',
      maNhom: 'NH04',
      tenNhom: 'Máy tính bảng Tablet',
      maLoai: 'LH06',
      tenLoai: 'Apple iPad',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 22,
      daBan: 58,
      traGop0: true,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 112,
      anhChinh: 'images/ipad-pro.svg',
      mauSac: [
        { id: 'black', ten: 'Đen Không Gian', anh: 'images/ipad-pro.svg', hex: '#2E3033' },
        { id: 'silver', ten: 'Bạc Titan', anh: 'images/ipad-pro.svg', hex: '#E3E4E5' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB', gia: 26990000, giaGoc: 28990000, tonKho: 22 },
        { id: '512gb', dungLuong: '512GB', gia: 32490000, giaGoc: 34990000, tonKho: 12 }
      ],
      thongSo: {
        'Màn hình': '11" Tandem OLED Ultra Retina XDR 120Hz 1600 nits',
        'Chipset': 'Apple M4 9-core CPU, 10-core GPU',
        'Độ mỏng': '5.3 mm siêu nhẹ',
        'Phụ kiện hỗ trợ': 'Apple Pencil Pro, Magic Keyboard'
      }
    },
    {
      maHang: 'MH012',
      tenHang: 'iPad Air M2 11 inch 128GB Wi-Fi Chính Hãng VN/A',
      donGia: 15490000,
      giaGoc: 16990000,
      dvt: 'Cái',
      maNhom: 'NH04',
      tenNhom: 'Máy tính bảng Tablet',
      maLoai: 'LH06',
      tenLoai: 'Apple iPad',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 30,
      daBan: 95,
      traGop0: true,
      isFlashSale: false,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 88,
      anhChinh: 'images/ipad-pro.svg',
      mauSac: [
        { id: 'blue', ten: 'Xanh Dương', anh: 'images/ipad-pro.svg', hex: '#9BB8D3' },
        { id: 'purple', ten: 'Tím Khói', anh: 'images/ipad-pro.svg', hex: '#D2CEDB' }
      ],
      phienBan: [
        { id: '128gb', dungLuong: '128GB', gia: 15490000, giaGoc: 16990000, tonKho: 30 }
      ],
      thongSo: {
        'Màn hình': '11" Liquid Retina TrueTone',
        'Chipset': 'Apple M2 8-core CPU, 10-core GPU',
        'Camera': '12MP Góc Rộng Center Stage'
      }
    },
    {
      maHang: 'MH013',
      tenHang: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
      donGia: 20990000,
      giaGoc: 22990000,
      dvt: 'Cái',
      maNhom: 'NH05',
      tenNhom: 'Đồng hồ thông minh',
      maLoai: 'LH07',
      tenLoai: 'Apple Watch',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 16,
      daBan: 44,
      traGop0: true,
      isFlashSale: false,
      isNew: false,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 76,
      anhChinh: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      mauSac: [
        { id: 'titan', ten: 'Titan Tự Nhiên', anh: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', hex: '#C5A88E' }
      ],
      phienBan: [
        { id: '49mm', dungLuong: '49mm Dây Trail', gia: 20990000, giaGoc: 22990000, tonKho: 16 }
      ],
      thongSo: {
        'Vỏ': 'Titanium Cấp 5 chống va đập',
        'Màn hình': 'OLED 3000 nits siêu sáng dưới nắng gắt',
        'Thời lượng pin': 'Lên đến 72 giờ chế độ nguồn điện thấp'
      }
    },
    {
      maHang: 'MH014',
      tenHang: 'Samsung Galaxy Z Fold6 5G 12GB/256GB AI Mới',
      donGia: 40990000,
      giaGoc: 43990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH02',
      tenLoai: 'Samsung Galaxy',
      nhanHieu: 'Samsung',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 10,
      daBan: 28,
      traGop0: true,
      isFlashSale: true,
      isNew: true,
      isBestSeller: false,
      rating: 4.8,
      reviewCount: 39,
      anhChinh: 'images/galaxy-s24.svg',
      mauSac: [
        { id: 'silver', ten: 'Bạc Titan', anh: 'images/galaxy-s24.svg', hex: '#D1D5DB' },
        { id: 'navy', ten: 'Xanh Navy', anh: 'images/galaxy-s24.svg', hex: '#1E3A8A' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB', gia: 40990000, giaGoc: 43990000, tonKho: 10 }
      ],
      thongSo: {
        'Màn hình chính': '7.6" Dynamic AMOLED 2X 120Hz 2600 nits',
        'Màn hình phụ': '6.3" tỷ lệ chuẩn cầm nắm',
        'Chip': 'Snapdragon 8 Gen 3 for Galaxy',
        'Tính năng': 'Kháng nước bụi IP48, Galaxy AI toàn diện'
      }
    },
    {
      maHang: 'MH015',
      tenHang: 'Bút cảm ứng Apple Pencil Pro Chính Hãng',
      donGia: 3290000,
      giaGoc: 3490000,
      dvt: 'Cái',
      maNhom: 'NH02',
      tenNhom: 'Phụ kiện chính hãng',
      maLoai: 'LH03',
      tenLoai: 'Bút cảm ứng',
      nhanHieu: 'Apple',
      quanLyImei: false,
      thoiHanBaoHanh: 12,
      tonKho: 40,
      daBan: 110,
      traGop0: false,
      isFlashSale: false,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 52,
      anhChinh: 'images/ipad-pro.svg',
      mauSac: [
        { id: 'white', ten: 'Trắng', anh: 'images/ipad-pro.svg', hex: '#FFFFFF' }
      ],
      phienBan: [
        { id: 'std', dungLuong: 'Pencil Pro', gia: 3290000, giaGoc: 3490000, tonKho: 40 }
      ],
      thongSo: {
        'Cảm ứng lực': 'Bóp nhẹ (Squeeze) để mở bảng màu',
        'Cảm ứng xoay': 'Xoay thân bút đổi góc cọ vẽ (Barrel roll)',
        'Phản hồi xúc giác': 'Haptic feedback chân thực'
      }
    },
    {
      maHang: 'MH016',
      tenHang: 'Samsung Galaxy Z Flip6 5G 256GB Nhỏ Gọn Thời Trang',
      donGia: 24990000,
      giaGoc: 28990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH02',
      tenLoai: 'Samsung Galaxy',
      nhanHieu: 'Samsung',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 18,
      daBan: 62,
      traGop0: true,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 94,
      anhChinh: 'images/galaxy-s24.svg',
      mauSac: [
        { id: 'mint', ten: 'Xanh Mint', anh: 'images/galaxy-s24.svg', hex: '#A7F3D0' },
        { id: 'yellow', ten: 'Vàng Mù Tạt', anh: 'images/galaxy-s24.svg', hex: '#FDE047' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB', gia: 24990000, giaGoc: 28990000, tonKho: 18 }
      ],
      thongSo: {
        'Màn hình chính': '6.7" FHD+ Dynamic AMOLED 2X 120Hz',
        'Màn hình phụ': '3.4" Flex Window thông minh',
        'Camera': '50MP + 12MP chụp góc siêu rộng',
        'Pin': '4000 mAh bền bỉ cả ngày'
      }
    },
    {
      maHang: 'MH017',
      tenHang: 'iPhone 17 Plus 128GB Chính Hãng VN/A',
      donGia: 23490000,
      giaGoc: 25990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH01',
      tenLoai: 'Apple iPhone',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 25,
      daBan: 78,
      traGop0: true,
      isFlashSale: false,
      isNew: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 130,
      anhChinh: 'images/phone-white.svg',
      mauSac: [
        { id: 'white', ten: 'Trắng Sữa', anh: 'images/phone-white.svg', hex: '#F8FAFC' },
        { id: 'black', ten: 'Đen Huyền Bí', anh: 'images/phone-black.svg', hex: '#1E293B' }
      ],
      phienBan: [
        { id: '128gb', dungLuong: '128GB', gia: 23490000, giaGoc: 25990000, tonKho: 25 }
      ],
      thongSo: {
        'Màn hình': '6.7" Super Retina XDR OLED',
        'Chip': 'Apple A18 3nm',
        'Camera': 'Camera kép 48MP Fusion sắc nét',
        'Pin': 'Pin trâu nhất phân khúc lên đến 29 giờ'
      }
    },
    {
      maHang: 'MH018',
      tenHang: 'iPhone 16 128GB Chính Hãng VN/A',
      donGia: 20490000,
      giaGoc: 22990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH01',
      tenLoai: 'Apple iPhone',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 32,
      daBan: 145,
      traGop0: true,
      isFlashSale: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 210,
      anhChinh: 'images/phone-natural.svg',
      mauSac: [
        { id: 'natural', ten: 'Titan Tự Nhiên', anh: 'images/phone-natural.svg', hex: '#9E9D99' },
        { id: 'black', ten: 'Đen Titan', anh: 'images/phone-black.svg', hex: '#313237' }
      ],
      phienBan: [
        { id: '128gb', dungLuong: '128GB', gia: 20490000, giaGoc: 22990000, tonKho: 32 }
      ],
      thongSo: {
        'Màn hình': '6.1" OLED Super Retina XDR',
        'Chip': 'Apple A18 3nm 5-core GPU',
        'Nút Action & Camera Control': 'Thao tác chụp nhanh tức thì'
      }
    },
    {
      maHang: 'MH019',
      tenHang: 'Apple Watch Series 10 Nhôm 46mm GPS',
      donGia: 11490000,
      giaGoc: 12590000,
      dvt: 'Cái',
      maNhom: 'NH05',
      tenNhom: 'Đồng hồ thông minh',
      maLoai: 'LH07',
      tenLoai: 'Apple Watch',
      nhanHieu: 'Apple',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 20,
      daBan: 65,
      traGop0: true,
      isFlashSale: false,
      isNew: true,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 82,
      anhChinh: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      mauSac: [
        { id: 'jetblack', ten: 'Đen Bóng Jet Black', anh: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', hex: '#0A0A0A' },
        { id: 'silver', ten: 'Bạc Ánh Kim', anh: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', hex: '#E2E8F0' }
      ],
      phienBan: [
        { id: '46mm', dungLuong: '46mm Dây Thể Thao', gia: 11490000, giaGoc: 12590000, tonKho: 20 }
      ],
      thongSo: {
        'Thiết kế': 'Mỏng nhất từ trước đến nay chỉ 9.7mm',
        'Màn hình': 'Màn hình OLED góc nhìn rộng siêu sáng 2000 nits',
        'Sạc nhanh': 'Sạc 80% chỉ trong 30 phút'
      }
    },
    {
      maHang: 'MH020',
      tenHang: 'Samsung Galaxy Tab S9 Ultra 12GB/256GB Kèm S-Pen',
      donGia: 25490000,
      giaGoc: 28990000,
      dvt: 'Cái',
      maNhom: 'NH04',
      tenNhom: 'Máy tính bảng Tablet',
      maLoai: 'LH08',
      tenLoai: 'Samsung Tab',
      nhanHieu: 'Samsung',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 12,
      daBan: 34,
      traGop0: true,
      isFlashSale: false,
      isNew: false,
      isBestSeller: false,
      rating: 4.8,
      reviewCount: 45,
      anhChinh: 'images/ipad-pro.svg',
      mauSac: [
        { id: 'graphite', ten: 'Xám Chì', anh: 'images/ipad-pro.svg', hex: '#374151' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB Wi-Fi', gia: 25490000, giaGoc: 28990000, tonKho: 12 }
      ],
      thongSo: {
        'Màn hình': '14.6" Dynamic AMOLED 2X 120Hz khổng lồ',
        'Kháng nước bụi': 'Đạt chuẩn IP68 máy và bút S-Pen',
        'Chip': 'Snapdragon 8 Gen 2 for Galaxy'
      }
    },
    {
      maHang: 'MH021',
      tenHang: 'Sony WH-1000XM5 Tai Nghe Chống Ồn Cao Cấp Flagship',
      donGia: 7490000,
      giaGoc: 8990000,
      dvt: 'Cái',
      maNhom: 'NH03',
      tenNhom: 'Thiết bị âm thanh',
      maLoai: 'LH04',
      tenLoai: 'Tai nghe Bluetooth',
      nhanHieu: 'Sony',
      quanLyImei: false,
      thoiHanBaoHanh: 12,
      tonKho: 24,
      daBan: 90,
      traGop0: true,
      isFlashSale: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 156,
      anhChinh: 'images/accessories-pack.svg',
      mauSac: [
        { id: 'black', ten: 'Đen Nhám', anh: 'images/accessories-pack.svg', hex: '#1C1917' },
        { id: 'silver', ten: 'Bạc Bạch Kim', anh: 'images/accessories-pack.svg', hex: '#E7E5E4' }
      ],
      phienBan: [
        { id: 'std', dungLuong: 'Tiêu chuẩn', gia: 7490000, giaGoc: 8990000, tonKho: 24 }
      ],
      thongSo: {
        'Chống ồn': 'Bộ xử lý chống ồn tích hợp V1 & HD QN1',
        'Thời lượng pin': '30 giờ nghe nhạc liên tục kèm sạc nhanh',
        'Âm thanh': 'Hi-Res Audio Wireless LDAC chuyên nghiệp'
      }
    },
    {
      maHang: 'MH022',
      tenHang: 'Tai Nghe Marshall Major V Bluetooth Cổ Điển',
      donGia: 3790000,
      giaGoc: 4290000,
      dvt: 'Cái',
      maNhom: 'NH03',
      tenNhom: 'Thiết bị âm thanh',
      maLoai: 'LH04',
      tenLoai: 'Tai nghe Bluetooth',
      nhanHieu: 'Marshall',
      quanLyImei: false,
      thoiHanBaoHanh: 12,
      tonKho: 35,
      daBan: 115,
      traGop0: false,
      isFlashSale: false,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 88,
      anhChinh: 'images/accessories-pack.svg',
      mauSac: [
        { id: 'black', ten: 'Đen Cổ Điển', anh: 'images/accessories-pack.svg', hex: '#18181B' }
      ],
      phienBan: [
        { id: 'std', dungLuong: 'Major V', gia: 3790000, giaGoc: 4290000, tonKho: 35 }
      ],
      thongSo: {
        'Thời lượng pin': 'Hơn 100 giờ chơi nhạc không dây',
        'Sạc không dây': 'Tích hợp chuẩn sạc Qi tiện lợi',
        'Chất âm': 'Marshall Signature Sound bùng nổ âm bass'
      }
    },
    {
      maHang: 'MH023',
      tenHang: 'Trạm Sạc Không Dây 3-in-1 Anker MagGo Qi2 15W',
      donGia: 2390000,
      giaGoc: 2890000,
      dvt: 'Cái',
      maNhom: 'NH02',
      tenNhom: 'Phụ kiện chính hãng',
      maLoai: 'LH03',
      tenLoai: 'Sạc & Cáp',
      nhanHieu: 'Anker',
      quanLyImei: false,
      thoiHanBaoHanh: 18,
      tonKho: 40,
      daBan: 85,
      traGop0: false,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 67,
      anhChinh: 'images/accessories-pack.svg',
      mauSac: [
        { id: 'white', ten: 'Trắng Sứ', anh: 'images/accessories-pack.svg', hex: '#FFFFFF' },
        { id: 'black', ten: 'Đen Titan', anh: 'images/accessories-pack.svg', hex: '#27272A' }
      ],
      phienBan: [
        { id: 'std', dungLuong: 'Trạm 3 trong 1', gia: 2390000, giaGoc: 2890000, tonKho: 40 }
      ],
      thongSo: {
        'Công suất': 'Sạc nhanh chuẩn Qi2 15W cho iPhone',
        'Sạc đồng thời': 'iPhone + Apple Watch + AirPods cùng lúc',
        'Thiết kế': 'Gập gọn chuẩn du lịch thông minh'
      }
    },
    {
      maHang: 'MH024',
      tenHang: 'Kính Cường Lực KingKong Titan Chống Nhìn Trộm 18 Pro Max',
      donGia: 180000,
      giaGoc: 250000,
      dvt: 'Cái',
      maNhom: 'NH02',
      tenNhom: 'Phụ kiện chính hãng',
      maLoai: 'LH03',
      tenLoai: 'Ốp lưng & Bao da',
      nhanHieu: 'KingKong',
      quanLyImei: false,
      thoiHanBaoHanh: 0,
      tonKho: 150,
      daBan: 420,
      traGop0: false,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 310,
      anhChinh: 'images/phone-black.svg',
      mauSac: [
        { id: 'privacy', ten: 'Chống nhìn trộm', anh: 'images/phone-black.svg', hex: '#18181B' }
      ],
      phienBan: [
        { id: 'std', dungLuong: 'iPhone 18 Pro Max', gia: 180000, giaGoc: 250000, tonKho: 150 }
      ],
      thongSo: {
        'Độ cứng': 'Chuẩn 9H Sapphire chống trầy xước dao kéo',
        'Tính năng': 'Góc nhìn nghiêng 28 độ chống nhìn trộm thông tin',
        'Cảm ứng': 'Phủ nano mượt mà chống bám dấu vân tay'
      }
    },
    {
      maHang: 'MH025',
      tenHang: 'Cáp Sạc Type-C to Type-C Apple Woven Bện Dù 1m 60W',
      donGia: 490000,
      giaGoc: 590000,
      dvt: 'Cái',
      maNhom: 'NH02',
      tenNhom: 'Phụ kiện chính hãng',
      maLoai: 'LH03',
      tenLoai: 'Sạc & Cáp',
      nhanHieu: 'Apple',
      quanLyImei: false,
      thoiHanBaoHanh: 12,
      tonKho: 85,
      daBan: 280,
      traGop0: false,
      isFlashSale: false,
      isNew: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 195,
      anhChinh: 'images/accessories-pack.svg',
      mauSac: [
        { id: 'white', ten: 'Trắng bọc dù', anh: 'images/accessories-pack.svg', hex: '#F4F4F5' }
      ],
      phienBan: [
        { id: '1m', dungLuong: '1 Mét 60W', gia: 490000, giaGoc: 590000, tonKho: 85 }
      ],
      thongSo: {
        'Chiều dài': '1 mét bện dù chống gãy đứt',
        'Công suất': 'Truyền tải điện lên đến 60W PD',
        'Tốc độ dữ liệu': 'Chuẩn USB 2.0 đồng bộ siêu tốc'
      }
    },
    {
      maHang: 'MH026',
      tenHang: 'Xiaomi 14 Pro 5G 12GB/256GB Leica Summilux',
      donGia: 19990000,
      giaGoc: 22990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH05',
      tenLoai: 'Xiaomi',
      nhanHieu: 'Xiaomi',
      quanLyImei: true,
      thoiHanBaoHanh: 18,
      tonKho: 16,
      daBan: 42,
      traGop0: true,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 78,
      anhChinh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      mauSac: [
        { id: 'titan', ten: 'Titanium Xám', anh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', hex: '#64748B' },
        { id: 'black', ten: 'Đen Obsidian', anh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', hex: '#1E293B' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB', gia: 19990000, giaGoc: 22990000, tonKho: 16 }
      ],
      thongSo: {
        'Màn hình': '6.73" AMOLED 2K 120Hz LTPO 3000 nits',
        'Ống kính': 'Leica Vario-Summilux khẩu độ biến thiên f/1.42 - f/4.0',
        'Chipset': 'Snapdragon 8 Gen 3 4nm',
        'Pin & Sạc': '4880 mAh, Sạc siêu nhanh 120W HyperCharge'
      }
    },
    {
      maHang: 'MH027',
      tenHang: 'Xiaomi 14T Pro 5G 12GB/512GB Leica Summilux AI',
      donGia: 16490000,
      giaGoc: 17990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH05',
      tenLoai: 'Xiaomi',
      nhanHieu: 'Xiaomi',
      quanLyImei: true,
      thoiHanBaoHanh: 18,
      tonKho: 22,
      daBan: 58,
      traGop0: true,
      isFlashSale: false,
      isNew: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 92,
      anhChinh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      mauSac: [
        { id: 'blue', ten: 'Xanh Titan', anh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', hex: '#3B82F6' },
        { id: 'gray', ten: 'Xám Titan', anh: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', hex: '#6B7280' }
      ],
      phienBan: [
        { id: '512gb', dungLuong: '512GB', gia: 16490000, giaGoc: 17990000, tonKho: 22 }
      ],
      thongSo: {
        'Màn hình': '6.67" 144Hz AI CrystalRes AMOLED',
        'Ống kính': 'Cụm 3 Camera Leica Summilux 50MP chống rung OIS',
        'Chipset': 'MediaTek Dimensity 9300+ AI cực mạnh',
        'Pin & Sạc': '5000 mAh, Sạc HyperCharge 120W, Không dây 50W'
      }
    },
    {
      maHang: 'MH028',
      tenHang: 'Samsung Galaxy S24+ 5G 12GB/256GB Galaxy AI',
      donGia: 21990000,
      giaGoc: 26990000,
      dvt: 'Cái',
      maNhom: 'NH01',
      tenNhom: 'Điện thoại di động',
      maLoai: 'LH02',
      tenLoai: 'Samsung Galaxy',
      nhanHieu: 'Samsung',
      quanLyImei: true,
      thoiHanBaoHanh: 12,
      tonKho: 20,
      daBan: 64,
      traGop0: true,
      isFlashSale: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 115,
      anhChinh: 'images/galaxy-s24.svg',
      mauSac: [
        { id: 'black', ten: 'Đen Onyx', anh: 'images/galaxy-s24.svg', hex: '#18181B' },
        { id: 'purple', ten: 'Tím Cobalt', anh: 'images/galaxy-s24.svg', hex: '#7C3AED' }
      ],
      phienBan: [
        { id: '256gb', dungLuong: '256GB', gia: 21990000, giaGoc: 26990000, tonKho: 20 }
      ],
      thongSo: {
        'Màn hình': '6.7" Dynamic AMOLED 2X QHD+ 120Hz 2600 nits',
        'Chipset': 'Exynos 2400 / Snapdragon 8 Gen 3',
        'Camera sau': '50MP Chuyên nghiệp + 12MP Siêu rộng + 10MP Tele 3x',
        'Tính năng': 'Khoanh tròn để tìm kiếm Circle to Search, Phiên dịch trực tiếp AI'
      }
    }
  ];

  const DEFAULT_HOME_CONFIG = {
    storeInfo: {
      name: "TITAN STORE",
      slogan: "Apple & Smartphone Premium Store - Hàng Chính Hãng 100%",
      hotline: "1800 6868",
      vatPercent: 10,
      returnDays: 30,
      warrantyMonthsDefault: 12
    },
    banners: {
      heroSlides: [
        {
          id: "slide-1",
          title: "iPhone 18 Pro Max",
          subtitle: "ĐỈNH CAO TITAN SA MẠC - CHIP A18 PRO 3NM",
          desc: "Màn hình 6.9 inch viền siêu mỏng, Camera 48MP Zoom 5x, Phím Camera Control thế hệ mới.",
          badge: "Mở Bán Siêu Phẩm 2026",
          priceText: "Từ 31.490.000 đ",
          oldPriceText: "34.990.000 đ",
          discountText: "Giảm 3.500.000 đ",
          image: "images/phone-desert.svg",
          targetMaHang: "MH001",
          btnText: "Mua Ngay Giảm 10%",
          bgGradient: "from-[#061a0f] via-[#092b19] to-[#04120a]",
          themeColor: "#80ffbf"
        },
        {
          id: "slide-2",
          title: "Galaxy S24 Ultra 5G",
          subtitle: "QUYỀN NĂNG GALAXY AI - KHUNG VIỀN TITAN",
          desc: "Bút S-Pen quyền năng, Camera 200MP Mắt Thần Bóng Đêm, Màn hình Dynamic AMOLED 2X 2600 nits.",
          badge: "Xả Kho Đón Hè",
          priceText: "28.490.000 đ",
          oldPriceText: "33.990.000 đ",
          discountText: "Giảm 5.500.000 đ",
          image: "images/galaxy-s24.svg",
          targetMaHang: "MH005",
          btnText: "Xem Chi Tiết",
          bgGradient: "from-slate-950 via-indigo-950 to-slate-900",
          themeColor: "#6366F1"
        },
        {
          id: "slide-3",
          title: "Đại Tiệc Flash Sale Phụ Kiện",
          subtitle: "CHÍNH HÃNG APPLE & ANKER GIẢM ĐẾN 40%",
          desc: "Củ sạc 20W USB-C, Ốp lưng MagSafe, Cáp sạc bọc dù chống đứt, Pin sạc dự phòng tốc độ cao.",
          badge: "Flash Sale Cuối Tuần",
          priceText: "Chỉ từ 450.000 đ",
          oldPriceText: "650.000 đ",
          discountText: "Mua 1 Tặng 1",
          image: "images/accessories-pack.svg",
          targetMaHang: "MH006",
          btnText: "Săn Deal Ngay",
          bgGradient: "from-amber-950 via-rose-950 to-slate-950",
          themeColor: "#F59E0B"
        },
        {
          id: "slide-4",
          title: "Thu Cũ Đổi Mới Lên Đời",
          subtitle: "TRỢ GIÁ ĐẾN 2.500.000 Đ - KHÔNG LO BÙ TIỀN",
          desc: "Thu mua máy cũ giá cao nhất thị trường. Kiểm tra định giá nhanh trong 5 phút. Trả góp 0%.",
          badge: "Thu Cũ Trợ Giá Cao",
          priceText: "Thu đổi mọi thương hiệu",
          oldPriceText: "",
          discountText: "Trợ giá tới 2.5TR",
          image: "images/trade-in.svg",
          targetMaHang: "MH001",
          btnText: "Định Giá Máy Cũ",
          bgGradient: "from-emerald-950 via-teal-950 to-slate-900",
          themeColor: "#80ffbf"
        },
        {
          id: "slide-5",
          title: "iPad Pro M4 Tandem OLED",
          subtitle: "MỎNG NHẤT LỊCH SỬ APPLE - HIỆU NĂNG M4 ĐỘT PHÁ",
          desc: "Màn hình Ultra Retina XDR đỉnh cao, thiết kế siêu mỏng nhẹ chỉ 5.1mm, hỗ trợ Apple Pencil Pro thế hệ mới.",
          badge: "Mới Về Hàng",
          priceText: "Từ 26.990.000 đ",
          oldPriceText: "28.990.000 đ",
          discountText: "Giảm 2.000.000 đ",
          image: "images/ipad-pro.svg",
          targetMaHang: "MH011",
          btnText: "Khám Phá Ngay",
          bgGradient: "from-slate-950 via-teal-950 to-slate-900",
          themeColor: "#38BDF8"
        }
      ],
      subBanners: [
        {
          id: "sub-1",
          title: "Voucher Thành Viên 500K",
          subtitle: "Đăng ký TitanMember nhận ngay",
          badge: "Smember Hot",
          image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop&q=80",
          tag: "Đăng ký nhận quà"
        },
        {
          id: "sub-2",
          title: "Học Sinh Sinh Viên",
          subtitle: "Giảm thêm 5% tối đa 500.000 đ",
          badge: "Ưu đãi HSSV",
          image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80",
          tag: "Xuất trình thẻ SV"
        },
        {
          id: "sub-3",
          title: "Trả Góp 0% Lãi Suất",
          subtitle: "Qua thẻ tín dụng & Home Credit",
          badge: "0% Lãi suất",
          image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80",
          tag: "Duyệt nhanh 5 phút"
        }
      ]
    },
    flashSale: {
      title: "FLASH SALE HÔM NAY",
      badge: "ĐANG DIỄN RA",
      endTime: "2026-10-31T23:59:59"
    },
    promotions: [
      { maKM: "KM01", tenKM: "Khai trương TitanStore 2026", phanTramGiam: 10, donToiThieu: 10000000, giamToiDa: 3000000 },
      { maKM: "KM02", tenKM: "Ưu đãi thành viên TitanMember", phanTramGiam: 5, donToiThieu: 5000000, giamToiDa: 1000000 },
      { maKM: "TITAN15", tenKM: "Voucher siêu cấp VIP", phanTramGiam: 15, donToiThieu: 20000000, giamToiDa: 5000000 }
    ]
  };

  class TitanStoreDataManager {
    constructor() {
      this.products = [];
      this.promotions = [];
      this.config = DEFAULT_HOME_CONFIG;
      this.isInitialized = false;
    }

    async init() {
      if (this.isInitialized) return;

      // 1. Tải cấu hình từ home-config.json
      try {
        const resp = await fetch('home-config.json');
        if (resp.ok) {
          const loadedCfg = await resp.json();
          if (loadedCfg && loadedCfg.banners) {
            this.config = loadedCfg;
          }
        }
      } catch (err) {
        // Fallback to DEFAULT_HOME_CONFIG on file:/// or network error
        this.config = DEFAULT_HOME_CONFIG;
      }

      if (this.config && this.config.promotions) {
        this.promotions = this.config.promotions;
      }

      // 2. Tải sản phẩm từ LocalStorage Quản trị (titan_admin_db_v3) hoặc Backend API
      let loadedProducts = null;

      // Ưu tiên đồng bộ kho tồn từ admin db
      try {
        const adminDbRaw = localStorage.getItem('titan_admin_db_v3');
        if (adminDbRaw) {
          const adminDb = JSON.parse(adminDbRaw);
          if (adminDb && Array.isArray(adminDb.matHang) && adminDb.matHang.length > 0) {
            loadedProducts = this.mergeWithAdminData(adminDb.matHang);
          }
          if (adminDb && Array.isArray(adminDb.khuyenMai) && adminDb.khuyenMai.length > 0) {
            this.promotions = adminDb.khuyenMai;
          }
        }
      } catch (e) {
        console.warn('Lỗi đọc titan_admin_db_v3:', e);
      }

      // Thử gọi Backend API nếu đang kết nối Live
      if (!loadedProducts) {
        try {
          const res = await fetch(`${API_BASE}/mathang`, { timeout: 2000 });
          if (res.ok) {
            const apiItems = await res.json();
            if (Array.isArray(apiItems) && apiItems.length > 0) {
              loadedProducts = this.mergeWithApiData(apiItems);
            }
          }
        } catch (e) {
          // Offline / file protocol fallback
        }
      }

      this.products = loadedProducts || DEFAULT_PRODUCTS;
      this.isInitialized = true;
    }

    mergeWithAdminData(adminItems) {
      const base = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      adminItems.forEach(adminItem => {
        const found = base.find(p => p.maHang === adminItem.maHang);
        if (found) {
          found.tenHang = adminItem.tenHang || found.tenHang;
          found.donGia = Number(adminItem.donGia) || found.donGia;
          if (adminItem.tonKho !== undefined) found.tonKho = Number(adminItem.tonKho);
        } else {
          // Mặt hàng mới thêm từ trang quản trị
          base.push({
            maHang: adminItem.maHang,
            tenHang: adminItem.tenHang,
            donGia: Number(adminItem.donGia),
            giaGoc: Number(adminItem.donGia) * 1.1,
            dvt: adminItem.dvt || 'Cái',
            maNhom: adminItem.maNhom || 'NH01',
            tenNhom: adminItem.maNhom === 'NH02' ? 'Phụ kiện chính hãng' : 'Điện thoại di động',
            maLoai: adminItem.maLoai || 'LH01',
            tenLoai: 'Điện thoại',
            nhanHieu: 'Apple',
            quanLyImei: !!adminItem.quanLyImei,
            thoiHanBaoHanh: adminItem.thoiHanBaoHanh || 12,
            tonKho: adminItem.tonKho !== undefined ? Number(adminItem.tonKho) : 20,
            daBan: 15,
            traGop0: true,
            isFlashSale: false,
            isNew: true,
            isBestSeller: false,
            rating: 4.9,
            reviewCount: 10,
            anhChinh: 'images/phone-desert.svg',
            mauSac: [{ id: 'std', ten: 'Mặc định', anh: 'images/phone-desert.svg', hex: '#16a34a' }],
            phienBan: [{ id: 'std', dungLuong: 'Tiêu chuẩn', gia: Number(adminItem.donGia), giaGoc: Number(adminItem.donGia) * 1.1, tonKho: adminItem.tonKho || 20 }],
            thongSo: { 'Bảo hành': `${adminItem.thoiHanBaoHanh || 12} tháng chính hãng` }
          });
        }
      });
      return base;
    }

    mergeWithApiData(apiItems) {
      const base = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      apiItems.forEach(item => {
        const found = base.find(p => p.maHang === item.maHang);
        if (found) {
          found.tenHang = item.tenHang;
          found.donGia = Number(item.donGia);
        }
      });
      return base;
    }

    getAllProducts() {
      return this.products;
    }

    getProductById(maHang) {
      return this.products.find(p => p.maHang === maHang) || null;
    }

    getFlashSaleProducts() {
      return this.products.filter(p => p.isFlashSale);
    }

    getFeaturedPhones(brand = 'all') {
      return this.products.filter(p => {
        const isPhone = p.maNhom === 'NH01';
        if (!isPhone) return false;
        if (brand === 'all') return true;
        return (p.nhanHieu || '').toLowerCase() === brand.toLowerCase();
      });
    }

    getNewArrivals() {
      return this.products.filter(p => p.isNew);
    }

    getBestSellers() {
      return this.products.filter(p => p.isBestSeller);
    }

    getAccessories() {
      return this.products.filter(p => p.maNhom === 'NH02' || p.maNhom === 'NH03');
    }

    getInstallmentProducts() {
      return this.products.filter(p => p.traGop0);
    }

    getProductsByBrand(brand = 'all') {
      if (!brand || brand === 'all') return this.products;
      return this.products.filter(p => (p.nhanHieu || '').toLowerCase() === brand.toLowerCase());
    }

    /**
     * Tìm kiếm và lọc sản phẩm
     */
    search(query = '', filters = {}) {
      const q = (query || '').trim().toLowerCase();
      let list = this.products;

      if (q) {
        const isInstallmentQuery = q.includes('trả góp') || q.includes('tra gop') || q.includes('0%') || q.includes('tragop');
        list = list.filter(p => {
          if (isInstallmentQuery && p.traGop0) return true;
          const matchName = p.tenHang.toLowerCase().includes(q);
          const matchCode = p.maHang.toLowerCase().includes(q);
          const matchBrand = (p.nhanHieu || '').toLowerCase().includes(q);
          const matchGroup = (p.tenNhom || '').toLowerCase().includes(q);
          const matchType = (p.tenLoai || '').toLowerCase().includes(q);
          return matchName || matchCode || matchBrand || matchGroup || matchType;
        });
      }

      if (filters.brand && filters.brand !== 'all') {
        list = list.filter(p => (p.nhanHieu || '').toLowerCase() === filters.brand.toLowerCase());
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
          case 'best_seller':
            list.sort((a, b) => (b.daBan || 0) - (a.daBan || 0));
            break;
          case 'newest':
            list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
        }
      }

      return list;
    }

    /**
     * Sản phẩm đã xem gần đây (localStorage)
     */
    addRecentlyViewed(maHang) {
      try {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
        list = list.filter(id => id !== maHang);
        list.unshift(maHang);
        if (list.length > 8) list = list.slice(0, 8);
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(list));
      } catch (e) {}
    }

    getRecentlyViewed() {
      try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
        return list.map(id => this.getProductById(id)).filter(Boolean);
      } catch (e) {
        return [];
      }
    }

    /**
     * Kiểm tra khuyến mãi hợp lệ theo mã (từ vw_KhuyenMaiTrangThai / home-config)
     */
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

  return new TitanStoreDataManager();
}));
