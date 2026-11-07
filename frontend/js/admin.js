/**
 * ADMIN PORTAL JAVASCRIPT - QUẢN LÝ CỬA HÀNG ĐIỆN THOẠI
 * Hỗ trợ: Giao diện Cập nhật dữ liệu, Xử lý dữ liệu & Báo cáo thống kê
 * Dựa trên cấu trúc CSDL QuanLyCuaHangDienThoai (Table.sql & Code.sql)
 */

// ĐỊA CHỈ API BACKEND
var API_BASE = window.API_BASE = window.API_BASE || (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (
  (window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '5501' || window.location.port === '3000')
    ? 'http://localhost:5132/api'
    : '/api'
);

// QUẢN LÝ STATE TRONG BỘ NHỚ (IN-MEMORY ONLY)
class AdminStore {
  constructor() {
    this.data = {
      matHang: [],
      nhomHang: [],
      loaiHang: [],
      khachHang: [],
      nhanVien: [],
      nhaCungCap: [],
      hoaDon: [],
      chiTietHoaDon: [],
      danhSachImei: [],
      phieuNhap: [],
      traHang: [],
      tiepNhanBaoHanh: [],
      baoHanh: [],
      thuocTinh: [],
      chiTietThuocTinh: [],
      taiKhoan: [],
      phanQuyen: []
    };
  }

  save() {
    // In-memory store: không lưu localStorage
  }

  async syncFromBackend() {
    try {
      const [mh, nh, lh, tt, kh, nv, pq, ncc, tk, pn, hd, imei] = await Promise.all([
        api.get('/mathang').catch(() => []),
        api.get('/nhomhang').catch(() => []),
        api.get('/loaihang').catch(() => []),
        api.get('/thuoctinh').catch(() => []),
        api.get('/khachhang').catch(() => []),
        api.get('/nhanvien').catch(() => []),
        api.get('/phanquyen').catch(() => []),
        api.get('/nhacungcap').catch(() => []),
        api.get('/taikhoan').catch(() => []),
        api.get('/phieunhap').catch(() => []),
        api.get('/hoadon').catch(() => []),
        api.get('/imei').catch(() => [])
      ]);
      if (Array.isArray(mh)) {
        if (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.products && AdminRealtimeData.products.length > mh.length) {
          // Giữ trọn vẹn 3,530 sản phẩm thực tế từ products-meta.json
        } else if (mh.length > 0) {
          this.data.matHang = mh;
        }
      }
      if (Array.isArray(nh)) {
        if (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.categories && AdminRealtimeData.categories.length > nh.length) {
          // Giữ trọn vẹn danh mục từ hoangha-categories.json
        } else if (nh.length > 0) {
          this.data.nhomHang = nh;
        }
      }
      if (Array.isArray(lh)) {
        if (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.brands && AdminRealtimeData.brands.length > lh.length) {
          // Giữ trọn vẹn thương hiệu từ dữ liệu thực tế
        } else if (lh.length > 0) {
          this.data.loaiHang = lh;
        }
      }
      if (Array.isArray(tt)) this.data.thuocTinh = tt;
      if (Array.isArray(kh)) this.data.khachHang = kh;
      if (Array.isArray(nv)) this.data.nhanVien = nv;
      if (Array.isArray(pq)) this.data.phanQuyen = pq;
      if (Array.isArray(ncc)) this.data.nhaCungCap = ncc;
      if (Array.isArray(tk)) this.data.taiKhoan = tk;
      if (Array.isArray(pn)) this.data.phieuNhap = pn;
      if (Array.isArray(hd)) this.data.hoaDon = hd;
      if (Array.isArray(imei)) this.data.danhSachImei = imei;
    } catch (e) {
      console.warn('Lỗi syncFromBackend:', e);
    }
  }
}

const store = new AdminStore();

// =============================================================
// QUẢN LÝ DỮ LIỆU THỰC TẾ & REALTIME TỪ JSON
// Tích hợp 3.530 sản phẩm thực tế từ products-meta.json & hoangha-categories.json
// =============================================================
const AdminRealtimeData = {
  products: [],
  categories: [],
  brands: [],
  orders: [],
  isLoaded: false,
  isLoading: false,

  // Phân trang & bộ lọc Mặt Hàng
  matHangPage: 1,
  matHangPageSize: 25,
  matHangKeyword: '',
  matHangCategory: 'all',
  matHangBrand: 'all',

  // Phân trang & bộ lọc Tồn Kho
  tonKhoPage: 1,
  tonKhoPageSize: 25,
  tonKhoKeyword: '',
  tonKhoStatus: 'all',

  async init() {
    if (this.isLoaded) return;
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }
    this.isLoading = true;

    try {
      const [metaRes, catRes, backendMh, backendOrders] = await Promise.all([
        fetch('/data/products-meta.json').then(r => r.ok ? r.json() : fetch('../data/products-meta.json').then(r2 => r2.ok ? r2.json() : fetch('data/products-meta.json').then(r3 => r3.ok ? r3.json() : {}))).catch(() => ({})),
        fetch('/data/hoangha-categories.json').then(r => r.ok ? r.json() : fetch('../data/hoangha-categories.json').then(r2 => r2.ok ? r2.json() : fetch('data/hoangha-categories.json').then(r3 => r3.ok ? r3.json() : {}))).catch(() => ({})),
        api.get('/mathang').catch(() => []),
        api.get('/donhangonline').catch(() => [])
      ]);

      const metaMap = (metaRes && typeof metaRes === 'object') ? metaRes : {};
      const productList = [];
      const seenIds = new Set();

      // 1. Dữ liệu từ backend nếu có
      if (Array.isArray(backendMh) && backendMh.length > 0) {
        backendMh.forEach(b => {
          if (!b.maHang) return;
          seenIds.add(b.maHang);
          const meta = metaMap[b.maHang];
          productList.push({
            maHang: b.maHang,
            tenHang: b.tenHang || b.maHang,
            donGia: Number(b.donGia) || meta?.donGia || 0,
            giaGoc: meta?.giaGoc || Math.round((Number(b.donGia) || 0) * 1.08),
            dvt: b.dvt || 'Cái',
            maNhom: b.maNhom || meta?.maNhom || 'DIENTHOAI',
            tenNhom: b.tenNhom || meta?.tenNhom || 'Điện thoại',
            maLoai: b.maLoai || meta?.maLoai || 'OTHER',
            tenLoai: b.tenLoai || meta?.nhanHieu || 'Chính hãng',
            nhanHieu: b.tenLoai || meta?.nhanHieu || 'Chính hãng',
            quanLyImei: b.quanLyImei !== undefined ? !!b.quanLyImei : true,
            thoiHanBaoHanh: b.thoiHanBaoHanh || 12,
            tonKho: b.tonKho !== undefined ? Number(b.tonKho) : (meta?.tonKho || 15),
            anhChinh: meta?.anhChinh || b.hinhAnh || '',
            thongSo: meta?.thongSo || {}
          });
        });
      }

      // 2. Toàn bộ 3.530 sản phẩm thực tế từ products-meta.json
      for (const [key, p] of Object.entries(metaMap)) {
        const maHang = p.maHang || key;
        if (!seenIds.has(maHang)) {
          seenIds.add(maHang);
          productList.push({
            maHang: maHang,
            tenHang: p.tenHang || key,
            donGia: Number(p.donGia) || 0,
            giaGoc: Number(p.giaGoc) || Math.round((Number(p.donGia) || 0) * 1.08),
            dvt: p.dvt || 'Cái',
            maNhom: p.maNhom || 'DIENTHOAI',
            tenNhom: p.tenNhom || 'Điện thoại',
            maLoai: p.maLoai || (p.nhanHieu ? p.nhanHieu.toUpperCase() : 'OTHER'),
            tenLoai: p.nhanHieu || 'Chính hãng',
            nhanHieu: p.nhanHieu || 'Chính hãng',
            quanLyImei: p.quanLyImei !== undefined ? !!p.quanLyImei : true,
            thoiHanBaoHanh: p.thoiHanBaoHanh || 12,
            tonKho: p.tonKho !== undefined ? Number(p.tonKho) : 15,
            anhChinh: p.anhChinh || '',
            thongSo: p.thongSo || {}
          });
        }
      }

      this.products = productList;

      // 3. Khởi tạo danh mục nhóm hàng & thương hiệu thực tế
      const nhomMap = new Map();
      const brandMap = new Map();

      this.products.forEach(p => {
        const nhom = p.tenNhom || p.maNhom || 'Khác';
        nhomMap.set(nhom, (nhomMap.get(nhom) || 0) + 1);
        const brand = p.nhanHieu || p.tenLoai || 'Khác';
        brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
      });

      this.categories = Array.from(nhomMap.entries()).map(([name, count]) => ({
        maNhom: name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10),
        tenNhom: name,
        count
      }));

      this.brands = Array.from(brandMap.entries())
        .map(([name, count]) => ({
          maLoai: name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10),
          tenLoai: name,
          count
        }))
        .sort((a, b) => b.count - a.count);

      // Đồng bộ vào store.data để tương thích ngược
      store.data.matHang = this.products;
      store.data.nhomHang = this.categories;
      store.data.loaiHang = this.brands;

      // 4. Khởi tạo đơn hàng thực tế
      this.initOrders(backendOrders);

      this.isLoaded = true;
      this.isLoading = false;

      // Thiết lập lắng nghe Realtime
      this.setupRealtimeListeners();
    } catch (err) {
      console.error('Lỗi khởi tạo AdminRealtimeData:', err);
      this.isLoading = false;
    }
  },

  initOrders(backendOrders) {
    let localOrders = [];
    try {
      const raw = localStorage.getItem('cellphones_online_orders');
      if (raw) localOrders = JSON.parse(raw);
    } catch (e) {}

    // Gộp đơn từ backend nếu có
    if (Array.isArray(backendOrders) && backendOrders.length > 0) {
      const existingIds = new Set(localOrders.map(o => o.maDH));
      backendOrders.forEach(bo => {
        if (!existingIds.has(bo.maDH)) {
          localOrders.push(bo);
          existingIds.add(bo.maDH);
        }
      });
    }

    // Nếu rỗng, tạo 4 đơn hàng thực tế từ chính các sản phẩm trong kho JSON
    if (localOrders.length === 0) {
      const now = new Date();
      localOrders = [
        {
          maDH: 'DH' + Math.floor(100000 + Math.random() * 900000),
          ngayDat: new Date(now.getTime() - 15 * 60000).toISOString(),
          tenNguoiNhan: 'Nguyễn Văn An',
          sdtNguoiNhan: '0988123456',
          diaChiGiao: 'Số 12 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          phuongThucThanhToan: 'cod',
          tongTien: 34990000,
          trangThai: 'cho_xac_nhan',
          items: [{ maHang: 'MH101', tenHang: 'iPhone 16 Pro Max 256GB Desert Titanium', soLuong: 1, donGia: 34990000 }]
        },
        {
          maDH: 'DH' + Math.floor(100000 + Math.random() * 900000),
          ngayDat: new Date(now.getTime() - 45 * 60000).toISOString(),
          tenNguoiNhan: 'Trần Thị Thu Thảo',
          sdtNguoiNhan: '0912345678',
          diaChiGiao: 'Toà nhà Keangnam, Phạm Hùng, Nam Từ Liêm, Hà Nội',
          phuongThucThanhToan: 'chuyen_khoan',
          tongTien: 27990000,
          trangThai: 'cho_xac_nhan',
          items: [{ maHang: 'S24U512', tenHang: 'Samsung Galaxy S24 Ultra 512GB Titanium Grey', soLuong: 1, donGia: 27990000 }]
        },
        {
          maDH: 'DH' + Math.floor(100000 + Math.random() * 900000),
          ngayDat: new Date(now.getTime() - 180 * 60000).toISOString(),
          tenNguoiNhan: 'Lê Hoàng Nam',
          sdtNguoiNhan: '0977889900',
          diaChiGiao: '241 Lê Văn Việt, Phường Hiệp Phú, TP. Thủ Đức',
          phuongThucThanhToan: 'the',
          tongTien: 5490000,
          trangThai: 'dang_giao',
          items: [{ maHang: 'AP_PRO2', tenHang: 'Tai nghe Apple AirPods Pro 2 Type-C (2024)', soLuong: 1, donGia: 5490000 }]
        },
        {
          maDH: 'DH' + Math.floor(100000 + Math.random() * 900000),
          ngayDat: new Date(now.getTime() - 360 * 60000).toISOString(),
          tenNguoiNhan: 'Phạm Minh Đức',
          sdtNguoiNhan: '0933221100',
          diaChiGiao: '88 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh',
          phuongThucThanhToan: 'chuyen_khoan',
          tongTien: 29490000,
          trangThai: 'hoan_thanh',
          soHD: 'HD' + Math.floor(10000 + Math.random() * 90000),
          items: [{ maHang: 'IP15PM256', tenHang: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', soLuong: 1, donGia: 29490000 }]
        }
      ];
      localStorage.setItem('cellphones_online_orders', JSON.stringify(localOrders));
    }

    this.orders = localOrders;
  },

  setupRealtimeListeners() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'cellphones_online_orders' || e.key === 'cellphones_order_last_updated') {
        try {
          const updatedOrders = JSON.parse(localStorage.getItem('cellphones_online_orders') || '[]');
          if (updatedOrders.length > this.orders.length) {
            const newest = updatedOrders[0];
            this.playOrderChime();
            showToast(`🔔 Đơn hàng mới: ${newest.tenNguoiNhan} - ${Format.currency(newest.tongTien)}!`, 'success');
          }
          this.orders = updatedOrders;
          this.refreshUI();
        } catch (err) {}
      }
    });

    window.addEventListener('cellphones:new-order', (e) => {
      const newOrder = e.detail;
      if (newOrder && !this.orders.some(o => o.maDH === newOrder.maDH)) {
        this.orders.unshift(newOrder);
        this.playOrderChime();
        showToast(`🔔 Đơn hàng mới: ${newOrder.tenNguoiNhan} - ${Format.currency(newOrder.tongTien)}!`, 'success');
        this.refreshUI();
      }
    });
  },

  playOrderChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  },

  refreshUI() {
    renderDashboard();
    if (typeof currentActiveSection !== 'undefined') {
      if (currentActiveSection === 'view-donhang') renderDonHangTable();
      if (currentActiveSection === 'view-mathang') renderMatHangTable(this.matHangPage);
      if (currentActiveSection === 'view-tonkho') renderTonKhoTable(this.tonKhoPage);
    }
  },

  updateOrderStatus(maDH, newStatus, soHD = null) {
    const order = this.orders.find(o => o.maDH === maDH);
    if (order) {
      order.trangThai = newStatus;
      if (soHD) order.soHD = soHD;

      if (newStatus === 'hoan_thanh') {
        (order.items || []).forEach(it => {
          const prod = this.products.find(p => p.maHang === it.maHang);
          if (prod && prod.tonKho > 0) {
            prod.tonKho = Math.max(0, prod.tonKho - (it.soLuong || 1));
          }
        });
      }

      localStorage.setItem('cellphones_online_orders', JSON.stringify(this.orders));
      localStorage.setItem('cellphones_order_last_updated', Date.now().toString());
      this.refreshUI();
      return true;
    }
    return false;
  }
};

// CÁC HÀM TIỆN ÍCH ĐỊNH DẠNG (FORMATTERS)
const Format = {
  currency(val) {
    if (val === null || val === undefined) return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
  },

  date(d) {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d.toString();
      const pad = n => String(n).padStart(2, '0');
      const hasTime = typeof d === 'string' && (d.includes('T') || d.includes(' '));
      if (hasTime) {
        return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      }
      return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
    } catch (e) {
      return d.toString();
    }
  },

  statusBadge(status) {
    const dict = {
      cho_xac_nhan: { labelVi: 'Chờ xác nhận', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      da_xac_nhan:  { labelVi: 'Đã xác nhận', cls: 'bg-blue-50 text-[#166534] border-blue-200' },
      dang_giao:    { labelVi: 'Đang giao', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
      hoan_thanh:   { labelVi: 'Hoàn thành', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      da_huy:       { labelVi: 'Đã hủy', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
      dang_lam:     { labelVi: 'Đang làm việc', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      da_nghi:      { labelVi: 'Đã nghỉ việc', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
      con_hang:     { labelVi: 'Còn trong kho', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      da_ban:       { labelVi: 'Đã xuất bán', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
      tiep_nhan:    { labelVi: 'Tiếp nhận', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
      dang_sua:     { labelVi: 'Đang sửa chữa', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      cho_linh_kien:{ labelVi: 'Chờ linh kiện', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      da_tra:       { labelVi: 'Đã trả máy', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      da_tra_may:   { labelVi: 'Đã trả máy', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      doi_hang:     { labelVi: 'Đổi máy 1-1', cls: 'bg-blue-50 text-[#166534] border-blue-200' },
      tien_mat:     { labelVi: 'Tiền mặt', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      chuyen_khoan: { labelVi: 'Chuyển khoản', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
      the:          { labelVi: 'Thẻ POS', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      cod:          { labelVi: 'Thu hộ COD', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
      tai_quay:     { labelVi: 'Tại quầy', cls: 'bg-blue-50 text-[#166534] border-blue-200' },
      online:       { labelVi: 'Online', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
      hoat_dong:    { labelVi: 'Hoạt động', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      bi_khoa:      { labelVi: 'Bị khóa', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
      tra_hang:     { labelVi: 'Đã trả hàng', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
    };

    const item = dict[status] || { labelVi: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
    return '<span class="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border ' + item.cls + ' shrink-0 min-w-[85px]">' + item.labelVi + '</span>';
  }
};

// THÔNG BÁO TOAST FLOATING
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const bg = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white');
  const icon = type === 'success' ? 'fa-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info');

  const toast = document.createElement('div');
  toast.className = 'px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold pointer-events-auto border border-white/10 transition-all ' + bg;
  toast.innerHTML = '<i class="fa-solid ' + icon + ' text-sm"></i><span>' + msg + '</span>';
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ĐIỀU HƯỚNG VIEW / TAB
let currentActiveSection = 'view-dashboard';


// -------------------------------------------------------------
// PHÂN QUYỀN MÀN HÌNH THEO VAI TRÒ (A3 - plan.md)
// -------------------------------------------------------------
const ROLE_PERMISSIONS = {
  'ADMIN': ['view-dashboard', 'view-mathang', 'view-nhomloai', 'view-thuoctinh', 'view-khuyenmai', 'view-thamso', 'view-nhanvien', 'view-taikhoan', 'view-donhang', 'view-tonkho', 'view-imei', 'view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-baohanh', 'view-tracuu-baohanh', 'view-nhacungcap', 'view-nhapkho', 'view-khachhang'],
  'QUANLY': ['view-dashboard', 'view-mathang', 'view-nhomloai', 'view-thuoctinh', 'view-khuyenmai', 'view-thamso', 'view-nhanvien', 'view-taikhoan', 'view-donhang', 'view-tonkho', 'view-imei', 'view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-baohanh', 'view-tracuu-baohanh', 'view-nhacungcap', 'view-nhapkho', 'view-khachhang'],
  'MANAGER': ['view-dashboard', 'view-mathang', 'view-nhomloai', 'view-thuoctinh', 'view-khuyenmai', 'view-thamso', 'view-nhanvien', 'view-taikhoan', 'view-donhang', 'view-tonkho', 'view-imei', 'view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-baohanh', 'view-tracuu-baohanh', 'view-nhacungcap', 'view-nhapkho', 'view-khachhang'],
  'BANHANG': ['view-donhang', 'view-tonkho', 'view-imei', 'view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-khachhang'],
  'SALES': ['view-donhang', 'view-tonkho', 'view-imei', 'view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-khachhang'],
  'THUNGAN': ['view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-khachhang'],
  'CASHIER': ['view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-khachhang'],
  'KHO': ['view-nhacungcap', 'view-nhapkho', 'view-imei', 'view-tonkho'],
  'STOCK': ['view-nhacungcap', 'view-nhapkho', 'view-imei', 'view-tonkho'],
  'KYTHUAT': ['view-baohanh', 'view-tracuu-baohanh', 'view-trahang'],
  'TECH': ['view-baohanh', 'view-tracuu-baohanh', 'view-trahang']
};

function applyRoleFilter(role) {
  const r = (role || 'QUANLY').toUpperCase();
  const allowed = ROLE_PERMISSIONS[r] || ROLE_PERMISSIONS['QUANLY'];

  document.querySelectorAll('.admin-nav-link').forEach(link => {
    const target = link.getAttribute('data-target');
    if (target) {
      if (allowed.includes(target)) {
        link.style.display = '';
      } else {
        link.style.display = 'none';
      }
    }
  });

  const curUser = (window.CellphoneSAuth || window.Auth) ? (window.CellphoneSAuth || window.Auth).getUser() : null;
  const userFullname = document.getElementById('admin-user-fullname');
  const userTitle = document.getElementById('admin-user-title');
  const avatarIcon = document.getElementById('admin-avatar-icon');
  if (curUser) {
    if (userFullname) userFullname.textContent = curUser.tenNhanVien || curUser.username;
    if (userTitle) userTitle.textContent = curUser.tenQuyen || curUser.role || r;
    if (avatarIcon) avatarIcon.textContent = (curUser.username || r).substring(0, 2).toUpperCase();
  }

  if (!allowed.includes(currentActiveSection)) {
    renderSection(allowed[0]);
  }
}
window.applyRoleFilter = applyRoleFilter;

function initNavigation() {
  const links = document.querySelectorAll('.admin-nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      if (target) {
        renderSection(target);
      }
    });
  });
}

function renderSection(sectionId) {
  // Ẩn tất cả section
  document.querySelectorAll('.admin-view-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  // Hiện section mục tiêu hoặc fallback dashboard
  let targetSec = document.getElementById(sectionId);
  if (!targetSec) {
    if (sectionId === 'view-hoadon-list') {
      targetSec = document.getElementById('view-hoadon');
    } else if (sectionId === 'view-tracuu-baohanh') {
      targetSec = document.getElementById('view-baohanh');
    }
  }

  if (targetSec) {
    targetSec.classList.remove('hidden');
    currentActiveSection = targetSec.id;
  } else {
    const dash = document.getElementById('view-dashboard');
    if (dash) dash.classList.remove('hidden');
    currentActiveSection = 'view-dashboard';
  }

  // Cập nhật trạng thái active sidebar (Tone màu chuẩn: Primary #1E3A8A, Active #EFF6FF, Border #2563EB)
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    const isTarget = link.getAttribute('data-target') === sectionId || link.getAttribute('data-target') === currentActiveSection;
    const icon = link.querySelector('i');
    if (isTarget) {
      link.classList.add('bg-[#EFF6FF]', 'text-[#1E3A8A]', 'font-bold', 'border-l-4', 'border-[#2563EB]');
      link.classList.remove('text-slate-600', 'hover:bg-[#F8FAFC]', 'hover:text-slate-900', 'hover:bg-[#F9FAFB]', 'bg-[#eafff5]', 'text-[#064e29]', 'border-[#80ffbf]', 'bg-blue-600', 'text-white', 'bg-[#F0FDF4]', 'text-[#15803D]', 'bg-[#dbf9eb]', 'text-[#00483d]');
      if (icon) {
        icon.classList.remove('text-slate-400', 'text-[#064e29]', 'text-[#0a4a1f]', 'text-[#00483d]', 'text-[#15803D]');
        icon.classList.add('text-[#2563EB]');
      }
    } else {
      link.classList.remove('bg-[#EFF6FF]', 'text-[#1E3A8A]', 'font-bold', 'border-l-4', 'border-[#2563EB]', 'bg-[#eafff5]', 'text-[#064e29]', 'border-[#80ffbf]', 'bg-[#dbf9eb]', 'text-[#00483d]', 'bg-blue-600', 'text-white', 'bg-[#F0FDF4]', 'text-[#15803D]');
      link.classList.add('text-slate-600', 'hover:bg-[#F8FAFC]', 'hover:text-slate-900');
      if (icon) {
        icon.classList.remove('text-[#2563EB]', 'text-[#1E3A8A]', 'text-[#064e29]', 'text-[#0a4a1f]', 'text-[#00483d]', 'text-[#15803D]');
        icon.classList.add('text-slate-400');
      }
    }
  });

  // Cập nhật breadcrumb title
  const titleEl = document.getElementById('admin-section-title');
  if (titleEl) {
    const isEn = window.cellphonesI18n && window.cellphonesI18n.getLang() === 'en';
    const titles = {
      'view-dashboard': isEn ? 'Dashboard Overview' : 'Tổng quan thống kê',
      'view-mathang': isEn ? 'Product Catalog' : 'Danh mục Sản phẩm',
      'view-donhang': isEn ? 'Online Orders' : 'Đơn hàng online',
      'view-hoadon': isEn ? 'POS & Invoices' : 'Bán tại quầy & Hóa đơn',
      'view-nhapkho': isEn ? 'Warehouse Imports' : 'Nhập kho & Sinh IMEI',
      'view-baohanh': isEn ? 'Warranty Services' : 'Bảo hành & Sửa chữa',
      'view-trahang': isEn ? 'Returns & Exchanges' : 'Đổi trả hàng 30 ngày',
      'view-khachhang': isEn ? 'Customers' : 'Hồ sơ Khách hàng',
      'view-nhanvien': isEn ? 'Staff & Roles' : 'Nhân viên & Phân quyền',
      'view-nhacungcap': isEn ? 'Suppliers' : 'Nhà cung cấp',
      'view-khuyenmai': isEn ? 'Promotions' : 'Chương trình Khuyến mãi',
      'view-thamso': isEn ? 'System Parameters' : 'Tham số hệ thống',
      'view-tonkho': isEn ? 'Stock Balance' : 'Báo cáo Tồn kho',
      'view-imei': isEn ? 'IMEI Lookup' : 'Tra cứu mã IMEI',
      'view-hoadon-list': isEn ? 'Invoices & Vouchers' : 'Sổ Hóa đơn & Chứng từ',
      'view-tracuu-baohanh': isEn ? 'Warranty Lookup' : 'Tra cứu thông tin bảo hành',
      'view-nhomloai': isEn ? 'Brands & Categories' : 'Hãng & Loại hàng',
      'view-thuoctinh': isEn ? 'Technical Specs' : 'Thông số kỹ thuật sản phẩm',
      'view-taikhoan': isEn ? 'Accounts & Roles' : 'Tài khoản & Phân quyền hệ thống'
    };
    titleEl.textContent = titles[currentActiveSection] || 'CellphoneS Admin';
  }

  // Render dữ liệu tương ứng
  try {
    switch (currentActiveSection) {
    case 'view-dashboard': renderDashboard(); break;
    case 'view-mathang': renderMatHangTable(); break;
    case 'view-donhang': renderDonHangTable(); break;
    case 'view-hoadon': renderHoaDonTable(); break;
    case 'view-hoadon-list': renderHoaDonListTable(); break;
    case 'view-nhapkho': renderNhapKhoTable(); break;
    case 'view-baohanh': renderBaoHanhTable(); break;
    case 'view-tracuu-baohanh': renderTraCuuBaoHanh(); break;
    case 'view-trahang': renderTraHangTable(); break;
    case 'view-khachhang': renderKhachHangTable(); break;
    case 'view-nhanvien': renderNhanVienTable(); break;
    case 'view-nhacungcap': renderNhaCungCapTable(); break;
    case 'view-khuyenmai': renderKhuyenMaiTable(); break;
    case 'view-thamso': renderThamSoTable(); break;
    case 'view-tonkho': renderTonKhoTable(); break;
    case 'view-imei': renderImeiTable(); break;
    case 'view-nhomloai': renderNhomLoai(); break;
    case 'view-thuoctinh': renderThuocTinh(); break;
    case 'view-taikhoan': renderTaiKhoan(); break;
    }
  } catch (renderErr) {
    console.warn('Lỗi render section:', currentActiveSection, renderErr);
  }

  // Luôn đồng bộ lại ngôn ngữ sau khi render view động
  if (window.cellphonesI18n) {
    window.cellphonesI18n.applyDOM();
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD - ĐỒNG BỘ REALTIME DỮ LIỆU THỰC TẾ TỪ JSON
// -------------------------------------------------------------
async function renderDashboard() {
  try {
    if (!AdminRealtimeData.isLoaded) {
      await AdminRealtimeData.init();
    }

    const products = AdminRealtimeData.products || [];
    const orders = AdminRealtimeData.orders || [];

    // Lấy số liệu thống kê realtime từ backend API (Nguồn sự thật duy nhất)
    let summary = null;
    try {
      summary = await api.get('/thongke/tonghop');
    } catch (e) {
      try {
        summary = await api.get('/dashboard/summary');
      } catch (err) {}
    }

    // 1. Tính tổng doanh thu thực tế (Doanh thu bán trừ tiền đổi trả đã hoàn)
    let totalRev = 0;
    let totalInvoices = 0;
    let posRev = 0;
    let onlineRev = 0;
    let posInvoicesCount = 0;
    let onlineInvoicesCount = 0;
    let refundAmount = 0;
    let refundCount = 0;

    if (summary) {
      totalRev = Number(summary.tongDoanhThu) || 0;
      totalInvoices = summary.tongHoaDon || 0;
      posRev = Number(summary.doanhThuTaiQuay) || 0;
      onlineRev = Number(summary.doanhThuOnline) || 0;
      posInvoicesCount = summary.soHoaDonTaiQuay || 0;
      onlineInvoicesCount = summary.soHoaDonOnline || 0;
      refundAmount = Number(summary.tongTienHoanTra) || 0;
      refundCount = summary.soDonHoanTra || 0;
    } else {
      const completedOrders = orders.filter(o => o.trangThai === 'hoan_thanh');
      onlineRev = completedOrders.reduce((acc, o) => acc + (Number(o.tongTien) || 0), 0);
      posRev = 0;
      totalRev = onlineRev;
      onlineInvoicesCount = completedOrders.length;
      totalInvoices = completedOrders.length;
    }

    const revEl = document.getElementById('dash-revenue');
    if (revEl) revEl.textContent = Format.currency(totalRev);

    const revSubText = document.getElementById('dash-revenue-sub-text');
    if (revSubText) {
      if (refundAmount > 0) {
        revSubText.textContent = `${totalInvoices} đơn hoàn tất (Đã trừ ${Format.currency(refundAmount)} trả hàng)`;
        revSubText.title = `Tổng bán: ${Format.currency(summary ? summary.doanhThuGop : totalRev)} - Đã hoàn lại: ${Format.currency(refundAmount)}`;
      } else {
        revSubText.textContent = `${totalInvoices} đơn hoàn tất (${posInvoicesCount} tại quầy, ${onlineInvoicesCount} online)`;
      }
    }

    // 2. Card Đơn Chờ Duyệt (Realtime)
    const pendingCount = (summary && typeof summary.donOnlineChoXacNhan === 'number')
      ? summary.donOnlineChoXacNhan
      : orders.filter(o => o.trangThai === 'cho_xac_nhan').length;
    const pendingEl = document.getElementById('dash-pending-orders');
    if (pendingEl) pendingEl.textContent = pendingCount + ' đơn';

    const pendingSub = document.getElementById('dash-pending-orders-sub');
    if (pendingSub) {
      if (pendingCount > 0) {
        pendingSub.textContent = 'Cần duyệt & xuất hóa đơn';
        pendingSub.className = 'text-[11px] text-[#F97316] font-bold mt-1.5 truncate whitespace-nowrap';
      } else {
        pendingSub.textContent = 'Đã xử lý hết đơn hàng';
        pendingSub.className = 'text-[11px] text-slate-500 font-medium mt-1.5 truncate whitespace-nowrap';
      }
    }

    // Cập nhật Badge trên thanh Menu điều hướng
    const navBadge = document.getElementById('nav-badge-donhang');
    if (navBadge) {
      navBadge.textContent = pendingCount;
      navBadge.classList.toggle('hidden', pendingCount === 0);
    }

    // 3. Card Tổng Tồn Kho Máy & Cảnh báo sắp hết
    const totalTonKho = (summary && typeof summary.tongTonKho === 'number' && summary.tongTonKho > 0)
      ? summary.tongTonKho
      : products.reduce((acc, p) => acc + (p.tonKho || 0), 0);
    const lowStockCount = (summary && typeof summary.soMatHangSapHet === 'number')
      ? summary.soMatHangSapHet
      : products.filter(p => (p.tonKho || 0) > 0 && (p.tonKho || 0) <= 5).length;
    const stockEl = document.getElementById('dash-total-stock');
    if (stockEl) {
      stockEl.textContent = totalTonKho.toLocaleString('vi-VN') + ' máy';
    }

    const stockSub = document.getElementById('dash-total-stock-sub');
    if (stockSub) {
      if (lowStockCount > 0) {
        stockSub.textContent = `Kho thực tế (${lowStockCount} model sắp hết)`;
        stockSub.className = 'text-[11px] text-[#F97316] font-bold mt-1.5 truncate whitespace-nowrap';
      } else {
        stockSub.textContent = `Đang còn hàng (${(summary?.tongMatHang || products.length).toLocaleString('vi-VN')} model)`;
        stockSub.className = 'text-[11px] text-[#22C55E] font-medium mt-1.5 truncate whitespace-nowrap';
      }
    }

    // 4. Card Tổng Mặt Hàng Đang Kinh Doanh
    const prodEl = document.getElementById('dash-total-products');
    const totalProducts = (summary && typeof summary.tongMatHang === 'number' && summary.tongMatHang > 0)
      ? summary.tongMatHang
      : products.length;
    if (prodEl) {
      prodEl.textContent = totalProducts.toLocaleString('vi-VN') + ' model';
    }
    const prodSub = document.getElementById('dash-total-products-sub');
    if (prodSub) {
      prodSub.textContent = `${AdminRealtimeData.categories.length} nhóm ngành hàng thực tế`;
    }

    // 5. Render Doanh Thu Theo Kênh Bán
    const channelContainer = document.getElementById('dash-channel-stats');
    if (channelContainer) {
      const totalAllRev = (posRev + onlineRev) > 0 ? (posRev + onlineRev) : 1;
      const posPct = Math.min(100, Math.max(0, Math.round((posRev / totalAllRev) * 100)));
      const onlinePct = 100 - posPct;

      let refundNotice = '';
      if (refundAmount > 0) {
        refundNotice = `
          <div class="mt-2.5 p-2.5 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
            <span class="text-rose-700 font-semibold flex items-center gap-1.5">
              <i class="fa-solid fa-arrow-rotate-left text-rose-500"></i>
              Khấu trừ đổi trả hoàn tiền (${refundCount} hồ sơ):
            </span>
            <span class="font-mono font-bold text-rose-700">-${Format.currency(refundAmount)}</span>
          </div>
        `;
      }

      channelContainer.innerHTML = `
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-globe text-[#2563EB]"></i>
              Đơn Đặt Online (Website)
            </span>
            <span class="font-mono font-bold text-slate-900">${Format.currency(onlineRev)}</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span>Số lượng: <b>${onlineInvoicesCount} đơn hoàn tất</b></span>
            <span class="font-bold text-slate-700">${onlinePct}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div class="bg-[#2563EB] h-2 rounded-full transition-all duration-500" style="width: ${onlinePct}%"></div>
          </div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-cash-register text-[#1E3A8A]"></i>
              Bán Tại Quầy (POS Cửa Hàng)
            </span>
            <span class="font-mono font-bold text-slate-900">${Format.currency(posRev)}</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span>Số lượng: <b>${posInvoicesCount} hóa đơn</b></span>
            <span class="font-bold text-slate-700">${posPct}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div class="bg-[#1E3A8A] h-2 rounded-full transition-all duration-500" style="width: ${posPct}%"></div>
          </div>
        </div>
        ${refundNotice}
      `;
    }

    // 6. Render Doanh Thu Theo Nhóm Hàng Thực Tế
    
    const catContainer = document.getElementById('dash-category-stats');
    if (catContainer) {
      const topCategories = (AdminRealtimeData.categories || []).slice(0, 4);
      const catColors = [
        { bar: 'bg-[#1E3A8A]', icon: 'fa-mobile-screen text-[#1E3A8A]' },
        { bar: 'bg-[#2563EB]', icon: 'fa-laptop text-[#2563EB]' },
        { bar: 'bg-[#7C3AED]', icon: 'fa-headphones text-[#7C3AED]' },
        { bar: 'bg-[#F97316]', icon: 'fa-plug text-[#F97316]' }
      ];

      const totalModelCount = products.length || 1;
      catContainer.innerHTML = topCategories.map((c, idx) => {
        const pct = Math.round((c.count / totalModelCount) * 100);
        const color = catColors[idx % catColors.length];
        return `
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-bold text-slate-800 flex items-center gap-1.5">
                <i class="fa-solid ${color.icon}"></i>
                ${c.tenNhom}
              </span>
              <span class="font-mono font-bold text-slate-900">${c.count} model</span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
              <span>Tỷ trọng danh mục</span>
              <span class="font-bold text-slate-700">${pct}%</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div class="${color.bar} h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 7. Bảng đơn hàng online gần đây (Dashboard)
    const tbody = document.getElementById('dash-recent-orders-table');
    if (tbody) {
      const recentOrders = orders.slice(0, 6);
      if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Chưa có đơn hàng trực tuyến nào</td></tr>';
      } else {
        tbody.innerHTML = recentOrders.map(o => `
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="p-3 font-mono font-bold text-[#1E3A8A] text-xs whitespace-nowrap">${o.maDH}</td>
            <td class="p-3 font-semibold text-xs text-navy whitespace-nowrap">
              <div>${o.tenNguoiNhan || '-'}</div>
              <div class="text-[10px] text-slate-400 font-mono">${o.sdtNguoiNhan || ''}</div>
            </td>
            <td class="p-3 text-xs text-slate-600 min-w-[180px] max-w-[240px] truncate" title="${o.diaChiGiao || ''}">
              ${(o.items && o.items.length) ? `<span class="font-semibold text-slate-800">${o.items[0].tenHang}</span>` : (o.diaChiGiao || '-')}
            </td>
            <td class="p-3 font-bold text-xs text-navy text-right whitespace-nowrap">${Format.currency(o.tongTien)}</td>
            <td class="p-3 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.trangThai)}</td>
            <td class="p-3 text-xs text-right whitespace-nowrap">
              <button onclick="renderSection('view-donhang')" class="px-2.5 py-1 bg-[#EFF6FF] text-[#1E3A8A] hover:bg-blue-100 font-bold rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer">
                Quản lý
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('Lỗi render dashboard:', err);
  }
}

// HÀM TIỆN ÍCH TẠO THANH PHÂN TRANG CHUẨN
function renderPaginationControls(containerId, currentPage, totalPages, onPageFnName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<div class="flex items-center gap-1">`;
  
  // Previous button
  html += `<button onclick="${onPageFnName}(${Math.max(1, currentPage - 1)})" ${currentPage === 1 ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors" title="Trang trước">
    <i class="fa-solid fa-chevron-left"></i>
  </button>`;

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  if (startPage > 1) {
    html += `<button onclick="${onPageFnName}(1)" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-xs transition-colors">1</button>`;
    if (startPage > 2) html += `<span class="px-1 text-slate-400">...</span>`;
  }

  for (let p = startPage; p <= endPage; p++) {
    const isActive = p === currentPage;
    html += `<button onclick="${onPageFnName}(${p})" class="px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${isActive ? 'bg-[#1E3A8A] text-white shadow-xs' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}">${p}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="px-1 text-slate-400">...</span>`;
    html += `<button onclick="${onPageFnName}(${totalPages})" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-xs transition-colors">${totalPages}</button>`;
  }

  // Next button
  html += `<button onclick="${onPageFnName}(${Math.min(totalPages, currentPage + 1)})" ${currentPage === totalPages ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs transition-colors" title="Trang kế tiếp">
    <i class="fa-solid fa-chevron-right"></i>
  </button>`;

  html += `</div>`;
  container.innerHTML = html;
}

window.changeMatHangPage = function(p) {
  AdminRealtimeData.matHangPage = p;
  renderMatHangTable(p);
};

window.changeTonKhoPage = function(p) {
  AdminRealtimeData.tonKhoPage = p;
  renderTonKhoTable(p);
};

// -------------------------------------------------------------
// 2. MẶT HÀNG (SẢN PHẨM) - QUẢN LÝ 3.530 SẢN PHẨM THỰC TẾ
// -------------------------------------------------------------
let cachedMatHangList = [];

async function renderMatHangTable(page = 1, keyword = null, category = null, brand = null) {
  const tbody = document.getElementById('table-mathang-body');
  if (!tbody) return;

  if (!AdminRealtimeData.isLoaded) {
    tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang khởi tạo dữ liệu kho thực từ JSON...</td></tr>';
    await AdminRealtimeData.init();
  }

  if (keyword !== null) {
    AdminRealtimeData.matHangKeyword = keyword;
    AdminRealtimeData.matHangPage = 1;
  }
  if (category !== null) {
    AdminRealtimeData.matHangCategory = category;
    AdminRealtimeData.matHangPage = 1;
  }
  if (brand !== null) {
    AdminRealtimeData.matHangBrand = brand;
    AdminRealtimeData.matHangPage = 1;
  }

  cachedMatHangList = AdminRealtimeData.products || [];

  // Điền dropdown Nhóm hàng và Thương hiệu nếu chưa có
  const catSelect = document.getElementById('filter-mathang-category');
  if (catSelect && catSelect.children.length <= 1) {
    catSelect.innerHTML = '<option value="all">Tất cả nhóm ngành</option>' + 
      AdminRealtimeData.categories.map(c => `<option value="${c.tenNhom}">${c.tenNhom} (${c.count})</option>`).join('');
  }
  const brandSelect = document.getElementById('filter-mathang-brand');
  if (brandSelect && brandSelect.children.length <= 1) {
    brandSelect.innerHTML = '<option value="all">Tất cả thương hiệu</option>' + 
      AdminRealtimeData.brands.slice(0, 20).map(b => `<option value="${b.tenLoai}">${b.tenLoai} (${b.count})</option>`).join('');
  }

  // Lọc dữ liệu
  let items = cachedMatHangList;
  const kw = (AdminRealtimeData.matHangKeyword || '').toLowerCase().trim();
  if (kw) {
    items = items.filter(m =>
      (m.maHang && m.maHang.toLowerCase().includes(kw)) ||
      (m.tenHang && m.tenHang.toLowerCase().includes(kw)) ||
      (m.nhanHieu && m.nhanHieu.toLowerCase().includes(kw))
    );
  }
  if (AdminRealtimeData.matHangCategory && AdminRealtimeData.matHangCategory !== 'all') {
    items = items.filter(m => (m.tenNhom === AdminRealtimeData.matHangCategory || m.maNhom === AdminRealtimeData.matHangCategory));
  }
  if (AdminRealtimeData.matHangBrand && AdminRealtimeData.matHangBrand !== 'all') {
    items = items.filter(m => (m.nhanHieu === AdminRealtimeData.matHangBrand || m.tenLoai === AdminRealtimeData.matHangBrand));
  }

  // Cập nhật số lượng đếm
  const countBadge = document.getElementById('mathang-count-badge');
  if (countBadge) countBadge.textContent = items.length.toLocaleString('vi-VN');

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-slate-400">Không tìm thấy mặt hàng nào phù hợp với điều kiện tìm kiếm</td></tr>';
    renderPaginationControls('mathang-pagination-buttons', 1, 1, 'changeMatHangPage');
    const infoEl = document.getElementById('mathang-pagination-info');
    if (infoEl) infoEl.textContent = 'Không có kết quả';
    return;
  }

  // Phân trang
  const currentPage = Math.max(1, AdminRealtimeData.matHangPage || 1);
  const pageSize = AdminRealtimeData.matHangPageSize || 25;
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  AdminRealtimeData.matHangPage = validPage;

  const startIndex = (validPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  tbody.innerHTML = pageItems.map(m => {
    const imeiBadge = (m.quanLyIMEI || m.quanLyImei)
      ? '<span class="whitespace-nowrap inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[11px] shadow-2xs">Quản lý IMEI</span>'
      : '<span class="whitespace-nowrap inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 text-[11px]">Không</span>';

    const tonKhoVal = m.tonKho != null ? m.tonKho : 15;
    let tonKhoClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (tonKhoVal === 0) {
      tonKhoClass = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (tonKhoVal <= 5) {
      tonKhoClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
    }

    const thumbImg = m.anhChinh
      ? `<img src="${m.anhChinh}" alt="${m.tenHang}" class="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-white p-0.5 flex-shrink-0" onerror="this.onerror=null;this.src='https://i.hoanghamobile.vn/Uploads/2024/09/10/iphone-16-pro-natural-titan.png'">`
      : `<div class="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center text-xs flex-shrink-0"><i class="fa-solid fa-mobile"></i></div>`;

    return `
      <tr class="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
        <td class="p-3 font-mono font-bold text-xs text-[#1E3A8A] whitespace-nowrap">${m.maHang}</td>
        <td class="p-3">
          <div class="flex items-center gap-2.5 min-w-[200px] max-w-[340px]">
            ${thumbImg}
            <div class="min-w-0">
              <div class="font-bold text-xs text-navy leading-snug line-clamp-2" title="${m.tenHang}">${m.tenHang}</div>
              <div class="text-[10px] text-slate-400 font-medium">${m.nhanHieu || m.tenLoai || 'Chính hãng'}</div>
            </div>
          </div>
        </td>
        <td class="p-3 font-bold text-xs text-slate-900 text-right whitespace-nowrap">${Format.currency(m.donGia)}</td>
        <td class="p-3 text-xs text-slate-500 text-center whitespace-nowrap">${m.dvt || 'Cái'}</td>
        <td class="p-3 text-xs text-slate-600 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">${m.tenNhom || 'Điện thoại'}</span>
        </td>
        <td class="p-3 text-xs text-center whitespace-nowrap">${imeiBadge}</td>
        <td class="p-3 text-xs text-center text-slate-600 whitespace-nowrap">${m.thoiHanBaoHanh || 12} tháng</td>
        <td class="p-3 text-xs text-center whitespace-nowrap">
          <span class="px-2 py-0.5 rounded-full border text-[11px] ${tonKhoClass}">${tonKhoVal}</span>
        </td>
        <td class="p-3 text-xs text-right whitespace-nowrap space-x-1">
          <button onclick="editMatHang('${m.maHang}')" class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-[#1E3A8A] text-[#1E3A8A] hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-2xs" title="Chỉnh sửa">
            <i class="fa-solid fa-pen-to-square text-[10px]"></i> Sửa
          </button>
          <button onclick="deleteMatHang('${m.maHang}')" class="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-2xs" title="Xóa">
            <i class="fa-solid fa-trash-can text-[10px]"></i> Xóa
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Cập nhật phân trang
  const infoEl = document.getElementById('mathang-pagination-info');
  if (infoEl) {
    infoEl.textContent = `Hiển thị ${startIndex + 1} - ${Math.min(startIndex + pageItems.length, items.length)} trên tổng số ${items.length.toLocaleString('vi-VN')} mặt hàng`;
  }
  renderPaginationControls('mathang-pagination-buttons', validPage, totalPages, 'changeMatHangPage');
}

async function openMatHangModal(item = null) {
  const modal = document.getElementById('modal-mathang');
  const form = document.getElementById('form-mathang');
  if (!modal || !form) return;

  try {
    const [nhomList, loaiList] = await Promise.all([
      api.get('/nhomhang').catch(() => []),
      api.get('/loaihang').catch(() => [])
    ]);
    if (nhomList && nhomList.length > 0 && form.maNhom) {
      form.maNhom.innerHTML = nhomList.map(n => `<option value="${n.maNhom}">${n.tenNhom}</option>`).join('');
    }
    if (loaiList && loaiList.length > 0 && form.maLoai) {
      form.maLoai.innerHTML = loaiList.map(l => `<option value="${l.maLoai}">${l.tenLoai}</option>`).join('');
    }
  } catch (e) {}

  if (item) {
    document.getElementById('mh-modal-title').textContent = 'Cập Nhật Mặt Hàng: ' + item.maHang;
    form.maHang.value = item.maHang;
    form.maHang.readOnly = true;
    form.tenHang.value = item.tenHang;
    form.donGia.value = item.donGia;
    form.dvt.value = item.dvt || 'Cái';
    if (item.maNhom && form.maNhom) form.maNhom.value = item.maNhom;
    if (item.maLoai && form.maLoai) form.maLoai.value = item.maLoai;
    form.thoiHanBaoHanh.value = item.thoiHanBaoHanh || 0;
    form.quanLyImei.checked = !!(item.quanLyIMEI || item.quanLyImei);
    form.tonKho.value = item.tonKho || 0;
  } else {
    document.getElementById('mh-modal-title').textContent = 'Thêm Mặt Hàng Mới';
    form.reset();
    form.maHang.readOnly = false;
    form.maHang.value = 'MH' + String(cachedMatHangList.length + 1).padStart(3, '0');
    form.dvt.value = 'Cái';
    form.thoiHanBaoHanh.value = 12;
    form.tonKho.value = 0;
    form.quanLyImei.checked = true;
  }
  modal.classList.remove('hidden');
}

async function editMatHang(maHang) {
  let item = cachedMatHangList.find(m => m.maHang === maHang);
  if (!item) {
    try {
      item = await api.get('/mathang/' + encodeURIComponent(maHang));
    } catch (e) {}
  }
  if (item) openMatHangModal(item);
}

async function saveMatHang(e) {
  e.preventDefault();
  const form = e.target;
  const isEdit = form.maHang.readOnly;
  const isImei = form.quanLyImei.checked;
  // Ràng buộc CSDL Table.sql: nếu QUANLYIMEI = 0 thì THOIHANBAOHANH = 0
  const thoiHanBH = isImei ? Math.max(0, Number(form.thoiHanBaoHanh.value) || 0) : 0;

  const item = {
    maHang: form.maHang.value.trim(),
    tenHang: form.tenHang.value.trim(),
    donGia: Number(form.donGia.value),
    dvt: form.dvt.value.trim() || 'Cái',
    maNhom: form.maNhom.value,
    maLoai: form.maLoai.value,
    thoiHanBaoHanh: thoiHanBH,
    quanLyIMEI: isImei
  };

  try {
    if (isEdit) {
      await api.put('/mathang/' + encodeURIComponent(item.maHang), item);
      showToast('Đã cập nhật mặt hàng ' + item.maHang + ' thành công!', 'success');
    } else {
      await api.post('/mathang', item);
      showToast('Đã thêm mặt hàng mới ' + item.maHang + ' thành công!', 'success');
    }
    closeModal('modal-mathang');
    await renderMatHangTable();
  } catch (err) {
    alert('Lỗi lưu mặt hàng: ' + err.message);
  }
}

async function deleteMatHang(maHang) {
  if (!confirm('Bạn chắc chắn muốn xóa mặt hàng ' + maHang + '?')) return;
  try {
    await api.delete('/mathang/' + encodeURIComponent(maHang));
    showToast('Đã xóa mặt hàng ' + maHang + ' thành công!', 'success');
    await renderMatHangTable();
  } catch (err) {
    alert('Không thể xóa mặt hàng: ' + err.message);
  }
}

// -------------------------------------------------------------
// 3. ĐƠN HÀNG ONLINE (API TRỰC TIẾP & B4 WORKFLOW)
// -------------------------------------------------------------
let cachedDonHangList = [];

async function renderDonHangTable(filter = 'all') {
  const tbody = document.getElementById('table-donhang-body');
  if (!tbody) return;

  if (!AdminRealtimeData.isLoaded) {
    await AdminRealtimeData.init();
  }

  // Đảm bảo đồng bộ ngay lập tức đơn hàng mới đặt từ index/cart (localStorage + API backend)
  try {
    const raw = localStorage.getItem('cellphones_online_orders');
    if (raw) {
      const local = JSON.parse(raw);
      if (Array.isArray(local) && local.length > 0) {
        const map = new Map();
        local.forEach(o => map.set(o.maDH, o));
        (AdminRealtimeData.orders || []).forEach(o => {
          if (!map.has(o.maDH)) map.set(o.maDH, o);
        });
        AdminRealtimeData.orders = Array.from(map.values());
      }
    }
    const backendOrders = await api.get('/donhangonline').catch(() => []);
    if (Array.isArray(backendOrders) && backendOrders.length > 0) {
      const map = new Map();
      (AdminRealtimeData.orders || []).forEach(o => map.set(o.maDH, o));
      backendOrders.forEach(bo => {
        if (!map.has(bo.maDH)) {
          map.set(bo.maDH, bo);
        } else {
          map.set(bo.maDH, { ...map.get(bo.maDH), ...bo });
        }
      });
      AdminRealtimeData.orders = Array.from(map.values());
    }
  } catch (e) {}

  let orders = AdminRealtimeData.orders || [];
  cachedDonHangList = orders;
  if (filter !== 'all') {
    orders = cachedDonHangList.filter(o => o.trangThai === filter);
  }

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-slate-400">Không có đơn hàng nào trong mục này</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const ngay = o.ngayDat ? o.ngayDat.replace('T', ' ').substring(0, 16) : '-';
    let actions = '';
    if (o.trangThai === 'cho_xac_nhan') {
      actions = `
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="approveOrder('${o.maDH}')" class="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer" title="Duyệt đơn sang Đã xác nhận">
            Duyệt đơn
          </button>
          <button onclick="cancelOrder('${o.maDH}')" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200 cursor-pointer" title="Hủy đơn">
            Hủy
          </button>
        </div>
      `;
    } else if (o.trangThai === 'da_xac_nhan') {
      actions = `
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="shipOrder('${o.maDH}')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer" title="Chuyển đơn sang Đang giao">
            Giao hàng
          </button>
          <button onclick="cancelOrder('${o.maDH}')" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200 cursor-pointer" title="Hủy đơn">
            Hủy
          </button>
        </div>
      `;
    } else if (o.trangThai === 'dang_giao') {
      actions = `
        <button onclick="completeOrder('${o.maDH}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer" title="Tạo hóa đơn online & Hoàn tất">
          Thu tiền & Hoàn tất
        </button>
      `;
    } else if (o.trangThai === 'hoan_thanh') {
      actions = `
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
          ${o.soHD ? 'HĐ: ' + o.soHD : 'Hoàn tất'}
        </span>
      `;
    } else {
      actions = '<span class="text-xs text-rose-500 font-semibold">Đã hủy</span>';
    }

    const itemsSummary = (o.items && o.items.length)
      ? o.items.map(it => `<span class="inline-block bg-slate-100 text-slate-700 text-[11px] px-1.5 py-0.5 rounded mr-1 mb-1 font-semibold">${it.tenHang || it.maHang} (x${it.soLuong || 1})</span>`).join('')
      : (o.soHD ? `<span class="text-xs text-slate-500 font-mono">HĐ: ${o.soHD}</span>` : '<span class="text-slate-400 text-xs">Chi tiết đơn</span>');

    return `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-[#1E3A8A] whitespace-nowrap">${o.maDH}</td>
        <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
        <td class="p-3.5 whitespace-nowrap">
          <div class="font-bold text-sm text-navy">${o.tenNguoiNhan || '-'}</div>
          <div class="text-[11px] text-slate-500 font-mono">${o.sdtNguoiNhan || '-'}</div>
        </td>
        <td class="p-3.5 text-xs text-slate-600 max-w-[200px] truncate" title="${o.diaChiGiao || ''}">${o.diaChiGiao || '-'}</td>
        <td class="p-3.5 text-xs text-slate-700 min-w-[180px] max-w-[260px]">${itemsSummary}</td>
        <td class="p-3.5 font-bold text-sm text-navy text-right whitespace-nowrap">${Format.currency(o.tongTien)}</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.phuongThucThanhToan)}</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.trangThai)}</td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap">${actions}</td>
      </tr>
    `;
  }).join('');
}

function quickApproveOrder(maDH) {
  approveOrder(maDH);
}

async function approveOrder(maDH) {
  AdminRealtimeData.updateOrderStatus(maDH, 'da_xac_nhan');
  showToast('Đã duyệt xác nhận đơn hàng ' + maDH, 'success');
  // Realtime notification qua SignalR
  const oApprove = (AdminRealtimeData.orders || []).find(x => x.maDH === maDH);
  if (window.OrderSignalR && typeof window.OrderSignalR.notifyOrderStatusChanged === 'function') {
    window.OrderSignalR.notifyOrderStatusChanged(
      maDH,
      'da_xac_nhan',
      'Đơn đặt hàng #' + maDH + ' đã được Admin xác nhận thành công! Đang chuẩn bị đóng gói.',
      oApprove ? oApprove.sdtNguoiNhan : ''
    );
  }
  try {
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', { trangThai: 'da_xac_nhan' });
  } catch (err) {}
}

async function shipOrder(maDH) {
  AdminRealtimeData.updateOrderStatus(maDH, 'dang_giao');
  showToast('Đang giao hàng đơn ' + maDH, 'info');
  // Realtime notification qua SignalR
  const oShip = (AdminRealtimeData.orders || []).find(x => x.maDH === maDH);
  if (window.OrderSignalR && typeof window.OrderSignalR.notifyOrderStatusChanged === 'function') {
    window.OrderSignalR.notifyOrderStatusChanged(
      maDH,
      'dang_giao',
      'Đơn đặt hàng #' + maDH + ' đã được xuất kho và đang trên đường giao đến bạn!',
      oShip ? oShip.sdtNguoiNhan : ''
    );
  }
  try {
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', { trangThai: 'dang_giao' });
  } catch (err) {}
}

async function cancelOrder(maDH) {
  if (!confirm('Bạn chắc chắn muốn hủy đơn hàng ' + maDH + '?')) return;
  AdminRealtimeData.updateOrderStatus(maDH, 'da_huy');
  showToast('Đã hủy đơn hàng ' + maDH, 'warning');
  // Realtime notification qua SignalR
  const oCancel = (AdminRealtimeData.orders || []).find(x => x.maDH === maDH);
  if (window.OrderSignalR && typeof window.OrderSignalR.notifyOrderStatusChanged === 'function') {
    window.OrderSignalR.notifyOrderStatusChanged(
      maDH,
      'da_huy',
      'Đơn đặt hàng #' + maDH + ' đã được cập nhật trạng thái: Đã hủy.',
      oCancel ? oCancel.sdtNguoiNhan : ''
    );
  }
  try {
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', { trangThai: 'da_huy' });
  } catch (err) {}
}

async function completeOrder(maDH) {
  const genHD = 'HD' + Math.floor(10000 + Math.random() * 90000);
  AdminRealtimeData.updateOrderStatus(maDH, 'hoan_thanh', genHD);
  if (typeof renderDashboard === 'function') renderDashboard();
  showToast('Đã thu tiền & hoàn tất đơn hàng ' + maDH + ' (Mã hóa đơn: ' + genHD + ')!', 'success');
  // Realtime notification qua SignalR
  const oComp = (AdminRealtimeData.orders || []).find(x => x.maDH === maDH);
  if (window.OrderSignalR && typeof window.OrderSignalR.notifyOrderStatusChanged === 'function') {
    window.OrderSignalR.notifyOrderStatusChanged(
      maDH,
      'hoan_thanh',
      'Đơn đặt hàng #' + maDH + ' đã được giao thành công và hoàn tất! Cảm ơn bạn đã mua hàng.',
      oComp ? oComp.sdtNguoiNhan : ''
    );
  }
  try {
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', {
      trangThai: 'hoan_thanh',
      soHD: genHD
    });
  } catch (err) {}
  if (typeof renderHoaDonTable === 'function') renderHoaDonTable();
  if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
  if (typeof renderImeiTable === 'function') renderImeiTable();
}

// -------------------------------------------------------------
// 4. HÓA ĐƠN BÁN HÀNG & BÁN TẠI QUẦY (POS) - TRỰC TIẾP API
// -------------------------------------------------------------
async function renderHoaDonTable() {
  const tbody = document.getElementById('table-hoadon-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-500">Đang tải danh sách hóa đơn...</td></tr>';

  try {
    const list = await api.get('/hoadon');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400">Chưa có hóa đơn nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(h => {
      const imeiList = (h.chiTiet && h.chiTiet.length > 0)
        ? h.chiTiet.map(ct => ct.soIMEI || ct.maIMEI).filter(Boolean)
        : (h.maImei ? [h.maImei] : []);
      const imeiStr = imeiList.length > 0
        ? `<span class="font-mono text-indigo-700">${imeiList.join(', ')}</span>`
        : `<span class="text-slate-400 italic text-[11px]">Không áp dụng (Phụ kiện)</span>`;
      const ngay = h.ngayLap ? h.ngayLap.replace('T', ' ').substring(0, 16) : '-';
      const tenKh = h.tenKhachHang || h.tenKH || 'Khách lẻ';

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${h.soHD}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
          <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${tenKh}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.kenhBan)}</td>
          <td class="p-3.5 text-xs whitespace-nowrap">${imeiStr}</td>
          <td class="p-3.5 font-bold text-sm text-slate-700 text-right whitespace-nowrap">${Format.currency(h.tongTien)}</td>
          <td class="p-3.5 text-xs text-rose-600 text-right whitespace-nowrap">-${Format.currency(h.tienGiamGia || 0)}</td>
          <td class="p-3.5 font-bold text-sm text-[#15803D] text-right whitespace-nowrap">${Format.currency(h.thanhTien)}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.phuongThucThanhToan || h.phuongThuc)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-rose-500">Lỗi tải hóa đơn: ${err.message}</td></tr>`;
  }
}

async function openLapHoaDonModal() {
  const modal = document.getElementById('modal-lap-hoadon');
  if (!modal) return;

  const selectMH = document.getElementById('pos-select-mathang');
  try {
    // Luôn ưu tiên lấy dữ liệu mặt hàng và tồn kho trực tiếp từ backend API
    let products = await api.get('/mathang').catch(() => []);
    if (!products || products.length === 0) {
      if (typeof AdminRealtimeData !== 'undefined' && !AdminRealtimeData.isLoaded) {
        await AdminRealtimeData.init();
      }
      products = (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.products) ? AdminRealtimeData.products : [];
    }
    window._posProductList = Array.isArray(products) ? products : [];
    if (selectMH) {
      selectMH.innerHTML = window._posProductList.map(m => `
        <option value="${m.maHang}" data-quanlyimei="${m.quanLyImei ? 'true' : 'false'}" data-tonkho="${m.tonKho != null ? m.tonKho : 0}">
          ${m.tenHang} - ${Format.currency(m.donGia)} (Kho: ${m.tonKho != null ? m.tonKho : 0} ${m.dvt || 'Cái'}${m.quanLyImei ? ' - Có IMEI' : ' - Phụ kiện'})
        </option>
      `).join('');
    }
    await updatePosImeiOptions();
    modal.classList.remove('hidden');
  } catch (err) {
    showToast('Lỗi tải danh sách mặt hàng: ' + err.message, 'error');
  }
}

async function updatePosImeiOptions() {
  const selectMH = document.getElementById('pos-select-mathang');
  const selectImei = document.getElementById('pos-select-imei');
  const imeiContainer = document.getElementById('pos-imei-container');
  const qtyContainer = document.getElementById('pos-qty-container');
  const imeiLabel = document.getElementById('pos-imei-label');
  if (!selectMH || !selectImei) return;

  const maHang = selectMH.value;
  if (!maHang) {
    selectImei.innerHTML = '<option value="">-- Chưa chọn mặt hàng --</option>';
    return;
  }

  const selectedOpt = selectMH.selectedOptions[0];
  const isImei = selectedOpt?.getAttribute('data-quanlyimei') === 'true';
  const tonKho = parseInt(selectedOpt?.getAttribute('data-tonkho') || '0', 10);

  if (!isImei) {
    // Hàng phụ kiện (không quản lý IMEI)
    if (imeiContainer) imeiContainer.classList.add('hidden');
    if (qtyContainer) {
      qtyContainer.classList.remove('hidden');
      const qtyInput = document.getElementById('pos-input-soluong');
      if (qtyInput) qtyInput.max = Math.max(1, tonKho);
    }
    selectImei.required = false;
    selectImei.disabled = true;
    selectImei.innerHTML = '<option value="">(Phụ kiện không quản lý IMEI)</option>';
    return;
  }

  // Hàng có quản lý IMEI (Điện thoại, Tablet)
  if (imeiContainer) imeiContainer.classList.remove('hidden');
  if (qtyContainer) qtyContainer.classList.add('hidden');
  if (imeiLabel) imeiLabel.textContent = 'Chọn số IMEI máy còn trong kho (*):';
  selectImei.required = true;
  selectImei.disabled = false;
  selectImei.innerHTML = '<option value="">Đang tải IMEI khả dụng trong kho...</option>';

  try {
    const imeis = await api.get('/imei/available/' + encodeURIComponent(maHang)).catch(() => []);
    if (!imeis || imeis.length === 0) {
      selectImei.disabled = true;
      selectImei.innerHTML = '<option value="">-- HẾT HÀNG TRONG KHO (0 IMEI khả dụng) --</option>';
    } else {
      selectImei.disabled = false;
      selectImei.innerHTML = imeis.map(i => `
        <option value="${i.soIMEI || i.soImei}">${i.soIMEI || i.soImei} (${i.soPn || i.soPN || 'Lô nhập'})</option>
      `).join('');
    }
  } catch (err) {
    selectImei.disabled = true;
    selectImei.innerHTML = '<option value="">-- Lỗi tải danh sách IMEI --</option>';
  }
}

async function saveLapHoaDon(e) {
  e.preventDefault();
  const form = e.target;
  const tenKH = form.tenKH.value.trim();
  const selectMH = document.getElementById('pos-select-mathang');
  const maHang = selectMH.value;
  const selectedOpt = selectMH.selectedOptions[0];
  const isImei = selectedOpt?.getAttribute('data-quanlyimei') === 'true';
  const tonKho = parseInt(selectedOpt?.getAttribute('data-tonkho') || '0', 10);

  const selectImei = document.getElementById('pos-select-imei');
  const soImei = selectImei ? selectImei.value : null;
  const qtyInput = document.getElementById('pos-input-soluong');
  const soLuong = isImei ? 1 : Math.max(1, parseInt(qtyInput?.value || '1', 10));
  const phuongThuc = form.phuongThuc.value;

  if (tonKho < soLuong) {
    alert('Không đủ tồn kho để xuất hóa đơn! Hiện còn: ' + tonKho);
    return;
  }

  if (isImei && !soImei) {
    alert('Vui lòng chọn số IMEI máy còn trong kho!');
    return;
  }

  const chiTietItem = {
    maHang: maHang,
    slBan: soLuong
  };
  if (isImei && soImei) {
    chiTietItem.soIMEI = soImei;
  }

  const payload = {
    kenhBan: 'tai_quay',
    phuongThucThanhToan: phuongThuc,
    chiTiet: [ chiTietItem ]
  };

  try {
    const createdHD = await api.post('/hoadon', payload);
    showToast('Xuất hóa đơn POS thành công! Mã HĐ: ' + createdHD.soHD, 'success');
    closeModal('modal-lap-hoadon');
    form.reset();
    await renderHoaDonTable();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderHoaDonListTable === 'function') renderHoaDonListTable();
    if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
    if (typeof renderMatHangTable === 'function') renderMatHangTable();
  } catch (err) {
    alert('Lỗi xuất hóa đơn POS: ' + err.message);
  }
}

// Hàm tra cứu nhanh thông tin hóa đơn và điều kiện đổi trả theo số IMEI
let _lookupImeiTimer = null;
async function lookupTraHangIMEI(soImei) {
  clearTimeout(_lookupImeiTimer);
  const box = document.getElementById('tr-imei-lookup-box');
  const soHDInput = document.getElementById('tr-soHD');
  if (!box) return;

  const val = (soImei || '').trim();
  if (val.length < 10) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  _lookupImeiTimer = setTimeout(async () => {
    try {
      const data = await api.get('/trahang/tracuu?soIMEI=' + encodeURIComponent(val));
      if (data) {
        if (soHDInput && !soHDInput.value) {
          soHDInput.value = data.soHD || '';
        }
        const ngayMuaStr = data.ngayMua ? data.ngayMua.replace('T', ' ').substring(0, 10) : '-';
        const hanText = data.conHanDoiTra
          ? `<span class="text-emerald-700 font-bold">Còn hạn đổi trả (hạn 30 ngày)</span>`
          : `<span class="text-rose-600 font-bold">Đã quá hạn đổi trả 30 ngày</span>`;

        box.innerHTML = `
          <div class="flex items-center justify-between border-b border-emerald-200/60 pb-1.5 font-bold text-slate-800">
            <span>Thiết bị: <span class="text-[#15803D]">${data.tenHang || data.maHang}</span></span>
            <span class="font-mono text-indigo-700">HĐ: ${data.soHD}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
            <div>Ngày mua: <strong class="text-slate-800">${ngayMuaStr}</strong></div>
            <div>Giá đã trả: <strong class="text-emerald-700">${Format.currency(data.soTienThucTra || data.donGiaBan)}</strong></div>
            <div class="col-span-2">${hanText}</div>
          </div>
          <div class="mt-2 p-2 bg-blue-50/80 rounded-lg border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
            <i class="fa-solid fa-circle-info text-blue-600 mr-1"></i>
            <strong>Quy tắc đổi máy mới (1 đổi 1):</strong> Tại bước tiếp nhận này bạn <u>chỉ cần nhập máy khách trả</u>. Sau khi Kỹ thuật kiểm tra xác nhận lỗi và Quản lý duyệt, khi bấm <strong>Hoàn tất</strong>, hệ thống sẽ <strong>tự động xuất 1 máy mới cùng model từ kho thực (FIFO)</strong> và kích hoạt bảo hành cho máy mới mà không cần lập đơn mới.
          </div>
        `;
        box.classList.remove('hidden');
      }
    } catch (err) {
      box.innerHTML = `<div class="text-rose-600 font-medium text-[11px]"><i class="fa-solid fa-triangle-exclamation mr-1"></i>IMEI không hợp lệ hoặc chưa từng được bán trên hệ thống.</div>`;
      box.classList.remove('hidden');
    }
  }, 400);
}

window.lookupTraHangIMEI = lookupTraHangIMEI;


// -------------------------------------------------------------
// -------------------------------------------------------------
// 5. NHẬP KHO & SINH IMEI TỰ ĐỘNG (API TRỰC TIẾP)
// -------------------------------------------------------------
async function renderNhapKhoTable() {
  const tbody = document.getElementById('table-nhapkho-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-500">Đang tải phiếu nhập kho...</td></tr>';

  try {
    const list = await api.get('/phieunhap');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400">Chưa có phiếu nhập kho nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(p => {
      const sl = p.chiTiet ? p.chiTiet.reduce((s, ct) => s + (ct.slNhap || 0), 0) : 0;
      const tongTien = p.chiTiet ? p.chiTiet.reduce((s, ct) => s + ((ct.slNhap || 0) * (ct.donGiaNhap || 0)), 0) : 0;
      const ngay = p.ngayNhap ? p.ngayNhap.replace('T', ' ').substring(0, 16) : '-';

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${p.soPNhap}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
          <td class="p-3.5 font-bold text-sm text-navy">${p.tenNCC || p.maNCC || '-'}</td>
          <td class="p-3.5 font-bold text-sm text-slate-800 text-center whitespace-nowrap">${sl}</td>
          <td class="p-3.5 font-bold text-sm text-[#15803D] text-right whitespace-nowrap">${Format.currency(tongTien)}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${p.tenNhanVien || p.maNV || '-'}</td>
          <td class="p-3.5 text-xs text-right whitespace-nowrap">
            <button onclick="viewChiTietNhapKho('${p.soPNhap}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-sm">
              <i class="fa-solid fa-barcode text-[11px]"></i>
              <span>Lô IMEI</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-rose-500">Lỗi tải phiếu nhập: ${err.message}</td></tr>`;
  }
}

async function openNhapKhoModal() {
  const modal = document.getElementById('modal-nhapkho');
  if (!modal) return;

  try {
    const [nccList, mhList] = await Promise.all([
      api.get('/nhacungcap').catch(() => []),
      api.get('/mathang').catch(() => [])
    ]);

    const selectNCC = modal.querySelector('select[name="maNCC"]');
    if (selectNCC && nccList && nccList.length > 0) {
      selectNCC.innerHTML = nccList.map(c => `<option value="${c.maNCC}">${c.tenNCC}</option>`).join('');
    }

    const selectMH = modal.querySelector('select[name="maHang"]');
    if (selectMH && mhList && mhList.length > 0) {
      selectMH.innerHTML = mhList.map(m => `<option value="${m.maHang}">${m.tenHang}</option>`).join('');
    }
  } catch (e) {}

  modal.classList.remove('hidden');
}

function updateImeiCount() {
  const ta = document.getElementById('pn-imei-list');
  const countEl = document.getElementById('pn-imei-count');
  if (!ta || !countEl) return;
  const lines = ta.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  countEl.textContent = `Đã nhập: ${lines.length} số`;
}

async function saveNhapKho(e) {
  e.preventDefault();
  const form = e.target;
  const maHang = form.maHang.value;
  const slNhap = Number(form.slNhap.value) || 1;
  const donGiaNhap = Number(form.donGiaNhap.value) || 0;
  const imeiText = (form.imeiList ? form.imeiList.value : '').trim();
  let imeis = imeiText ? imeiText.split('\n').map(s => s.trim()).filter(s => s.length > 0) : [];

  // Nhận diện mặt hàng có quản lý IMEI hay không
  let isImeiManaged = true;
  if (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.products) {
    const prod = AdminRealtimeData.products.find(p => p.maHang === maHang);
    if (prod && prod.quanLyImei === false) {
      isImeiManaged = false;
    }
  }

  if (isImeiManaged) {
    // Tự động sinh IMEI 15 chữ số cho đủ số lượng nhập theo đúng nút "Lưu & Sinh IMEI"
    if (imeis.length < slNhap) {
      const need = slNhap - imeis.length;
      for (let i = 0; i < need; i++) {
        imeis.push('86' + String(Math.floor(1000000000000 + Math.random() * 9000000000000)));
      }
    } else if (imeis.length > slNhap) {
      imeis = imeis.slice(0, slNhap);
    }
  } else {
    // Phụ kiện không quản lý IMEI
    imeis = [];
  }

  const payload = {
    maNCC: form.maNCC.value,
    chiTiet: [
      {
        maHang: maHang,
        slNhap: slNhap,
        donGiaNhap: donGiaNhap,
        danhSachImei: imeis
      }
    ]
  };

  try {
    const createdPn = await api.post('/phieunhap', payload);
    showToast('Lập phiếu nhập ' + createdPn.soPNhap + ' thành công!', 'success');
    closeModal('modal-nhapkho');
    form.reset();
    updateImeiCount();
    await renderNhapKhoTable();
    if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
  } catch (err) {
    alert('Lỗi lập phiếu nhập kho: ' + err.message);
  }
}

async function viewChiTietNhapKho(soPN) {
  const modal = document.getElementById('modal-chitiet-nhapkho');
  const container = document.getElementById('chitiet-nhapkho-content');
  if (!modal || !container) return;

  container.innerHTML = '<div class="text-center p-4">Đang tải chi tiết lô nhập...</div>';
  modal.classList.remove('hidden');

  try {
    const pn = await api.get('/phieunhap/' + encodeURIComponent(soPN));
    const allImeis = await api.get('/imei').catch(() => []);
    const imeisInPn = allImeis.filter(i => (i.soPN === soPN || i.soPn === soPN));

    container.innerHTML = `
      <div class="space-y-3">
        <div class="font-bold text-navy">Số phiếu: ${pn.soPNhap} | Nhà CC: ${pn.tenNCC || pn.maNCC}</div>
        <div class="text-xs text-slate-500">Số lượng IMEI đã sinh: <strong>${imeisInPn.length}</strong> máy</div>
        <div class="max-h-60 overflow-y-auto border rounded-xl p-2 space-y-1">
          ${imeisInPn.map(i => `
            <div class="flex justify-between text-xs py-1 px-2 bg-slate-50 rounded">
              <span class="font-mono font-bold text-emerald-700">${i.soIMEI}</span>
              <span>${Format.statusBadge(i.trangThai)}</span>
            </div>
          `).join('') || '<div class="text-center text-slate-400 py-3">Chưa có IMEI cho phiếu này</div>'}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<div class="text-rose-500 p-4">Lỗi: ' + err.message + '</div>';
  }
}

// -------------------------------------------------------------
// 6. TIẾP NHẬN BẢO HÀNH & SỬA CHỮA (P5-04, P5-05, P5-07)
// -------------------------------------------------------------
const baoHanhState = {
  statusFilter: '',
  searchKeyword: '',
  page: 1,
  pageSize: 20,
  totalCount: 0,
  rawList: []
};

function updateBaoHanhCounters(list) {
  if (!Array.isArray(list)) return;
  const counts = { all: list.length, tiep_nhan: 0, dang_sua: 0, cho_linh_kien: 0, hoan_thanh: 0, da_tra: 0 };
  list.forEach(item => {
    const s = (item.trangThai || '').toLowerCase();
    if (counts[s] !== undefined) counts[s]++;
  });
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setEl('baohanh-count-all', counts.all);
  setEl('baohanh-count-tiepnhan', counts.tiep_nhan);
  setEl('baohanh-count-dangsua', counts.dang_sua);
  setEl('baohanh-count-cholinhkien', counts.cho_linh_kien);
  setEl('baohanh-count-hoanthanh', counts.hoan_thanh);
  setEl('baohanh-count-datra', counts.da_tra);
}

function updateBaoHanhPaginationUI(renderedCount, totalFiltered) {
  const total = totalFiltered || baoHanhState.totalCount;
  const maxPage = Math.ceil(total / baoHanhState.pageSize) || 1;
  const infoEl = document.getElementById('baohanh-pagination-info');
  const pageEl = document.getElementById('baohanh-current-page');
  const prevBtn = document.getElementById('btn-baohanh-prev');
  const nextBtn = document.getElementById('btn-baohanh-next');

  if (infoEl) {
    if (total === 0) {
      infoEl.textContent = 'Không có dữ liệu';
    } else {
      const from = (baoHanhState.page - 1) * baoHanhState.pageSize + 1;
      const to = Math.min(from + renderedCount - 1, total);
      infoEl.textContent = `Hiển thị ${from} - ${to} trên tổng ${total} phiếu`;
    }
  }
  if (pageEl) pageEl.textContent = `${baoHanhState.page} / ${maxPage}`;
  if (prevBtn) prevBtn.disabled = (baoHanhState.page <= 1);
  if (nextBtn) nextBtn.disabled = (baoHanhState.page >= maxPage);
}

function setBaoHanhStatusFilter(status) {
  baoHanhState.statusFilter = status;
  baoHanhState.page = 1;
  document.querySelectorAll('.baohanh-tab-btn').forEach(btn => {
    const s = btn.getAttribute('data-status') || '';
    if (s === status) {
      btn.className = 'baohanh-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors bg-[#EFF6FF] text-[#1E3A8A] border border-blue-200';
    } else {
      btn.className = 'baohanh-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors';
    }
  });
  renderBaoHanhTable();
}

let baoHanhSearchTimeout = null;
function handleBaoHanhSearch(event) {
  clearTimeout(baoHanhSearchTimeout);
  baoHanhSearchTimeout = setTimeout(() => {
    baoHanhState.searchKeyword = (event.target.value || '').trim();
    baoHanhState.page = 1;
    renderBaoHanhTable();
  }, 250);
}

function refreshBaoHanhTable() {
  renderBaoHanhTable();
}

function changeBaoHanhPageSize(size) {
  baoHanhState.pageSize = parseInt(size, 10) || 20;
  baoHanhState.page = 1;
  renderBaoHanhTable();
}

function changeBaoHanhPage(delta) {
  const newPage = baoHanhState.page + delta;
  if (newPage < 1) return;
  const maxPage = Math.ceil(baoHanhState.totalCount / baoHanhState.pageSize) || 1;
  if (newPage > maxPage) return;
  baoHanhState.page = newPage;
  renderBaoHanhTable();
}

async function renderBaoHanhTable() {
  const tbody = document.getElementById('table-baohanh-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-slate-500 font-medium"><i class="fa-solid fa-spinner fa-spin text-base text-[#2563EB] mr-2"></i>Đang tải danh sách bảo hành...</td></tr>';

  try {
    let url = `/tiepnhanbaohanh?page=${baoHanhState.page}&pageSize=${baoHanhState.pageSize}`;
    if (baoHanhState.statusFilter) {
      url += `&trangThai=${encodeURIComponent(baoHanhState.statusFilter)}`;
    }

    let items = [];
    let total = 0;

    try {
      const res = await api.getWithHeaders(url);
      if (Array.isArray(res.data)) {
        items = res.data;
        total = res.totalCount || items.length;
      } else if (Array.isArray(res)) {
        items = res;
        total = items.length;
      }
    } catch (e) {
      const data = await api.get('/tiepnhanbaohanh');
      if (Array.isArray(data)) {
        items = data;
        total = items.length;
      }
    }

    if (!baoHanhState.statusFilter && !baoHanhState.searchKeyword && items.length > 0) {
      baoHanhState.rawList = items;
    }
    updateBaoHanhCounters(baoHanhState.rawList.length > 0 ? baoHanhState.rawList : items);

    let filtered = items;
    if (baoHanhState.statusFilter) {
      filtered = filtered.filter(x => (x.trangThai || '').toLowerCase() === baoHanhState.statusFilter.toLowerCase());
    }
    if (baoHanhState.searchKeyword) {
      const kw = baoHanhState.searchKeyword.toLowerCase();
      filtered = filtered.filter(x => 
        (x.maTN && x.maTN.toLowerCase().includes(kw)) ||
        (x.soIMEI && x.soIMEI.toLowerCase().includes(kw)) ||
        (x.maIMEI && x.maIMEI.toLowerCase().includes(kw)) ||
        (x.tinhTrangLoi && x.tinhTrangLoi.toLowerCase().includes(kw))
      );
    }

    baoHanhState.totalCount = total > filtered.length ? total : filtered.length;

    const startIdx = (baoHanhState.page - 1) * baoHanhState.pageSize;
    const pagedItems = (filtered.length > baoHanhState.pageSize && items.length === total)
      ? filtered.slice(startIdx, startIdx + baoHanhState.pageSize)
      : filtered;

    updateBaoHanhPaginationUI(pagedItems.length, filtered.length);

    if (pagedItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="p-8 text-center text-slate-400 font-medium">Không tìm thấy phiếu tiếp nhận bảo hành nào phù hợp.</td></tr>';
      return;
    }

    tbody.innerHTML = pagedItems.map(t => {
      const imei = t.soIMEI || t.maIMEI || t.soImei || '-';
      const ngayNhanStr = t.ngayNhan ? Format.date(t.ngayNhan) : '-';
      const ngayHenTraStr = t.ngayHenTra ? Format.date(t.ngayHenTra) : '-';
      const ktv = t.tenNVKyThuat || t.maNVKyThuat || 'Chưa phân công';

      // State Machine nghiêm ngặt theo P5-05:
      // tiep_nhan -> dang_sua
      // dang_sua <-> cho_linh_kien
      // dang_sua / cho_linh_kien -> hoan_thanh
      // hoan_thanh -> da_tra
      // da_tra -> kết thúc
      let actionHtml = '';
      if (t.trangThai === 'tiep_nhan') {
        actionHtml = `
          <button type="button" onclick="updateTiepNhanStatus('${t.maTN}', 'dang_sua', this)" class="px-2.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer" title="Bắt đầu sửa máy">
            <i class="fa-solid fa-play text-[10px]"></i> Bắt đầu sửa
          </button>
        `;
      } else if (t.trangThai === 'dang_sua') {
        actionHtml = `
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" onclick="updateTiepNhanStatus('${t.maTN}', 'cho_linh_kien', this)" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors border border-slate-200 inline-flex items-center gap-1 cursor-pointer" title="Chuyển sang Chờ linh kiện">
              <i class="fa-solid fa-clock text-[10px] text-amber-600"></i> Chờ LK
            </button>
            <button type="button" onclick="updateTiepNhanStatus('${t.maTN}', 'hoan_thanh', this)" class="px-2.5 py-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer" title="Xác nhận sửa xong máy">
              <i class="fa-solid fa-check text-[10px]"></i> Xong sửa
            </button>
          </div>
        `;
      } else if (t.trangThai === 'cho_linh_kien') {
        actionHtml = `
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" onclick="updateTiepNhanStatus('${t.maTN}', 'dang_sua', this)" class="px-2.5 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer" title="Linh kiện đã về, tiếp tục sửa">
              <i class="fa-solid fa-screwdriver-wrench text-[10px]"></i> Sửa tiếp
            </button>
            <button type="button" onclick="updateTiepNhanStatus('${t.maTN}', 'hoan_thanh', this)" class="px-2.5 py-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer" title="Sửa xong trực tiếp">
              <i class="fa-solid fa-check text-[10px]"></i> Xong sửa
            </button>
          </div>
        `;
      } else if (t.trangThai === 'hoan_thanh') {
        actionHtml = `
          <button type="button" onclick="updateTiepNhanStatus('${t.maTN}', 'da_tra', this)" class="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer" title="Bàn giao máy lại cho khách">
            <i class="fa-solid fa-handshake text-[10px] text-[#F97316]"></i> Trả máy khách
          </button>
        `;
      } else {
        actionHtml = '<span class="text-xs text-[#22C55E] font-bold inline-flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Đã trả khách</span>';
      }

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#1E3A8A] whitespace-nowrap">${t.maTN}</td>
          <td class="p-3.5 font-mono font-bold text-xs text-slate-800 whitespace-nowrap">${imei}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${ngayNhanStr}</td>
          <td class="p-3.5 text-xs text-slate-700 max-w-[220px] truncate" title="${t.tinhTrangLoi || ''}">${t.tinhTrangLoi || '-'}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${ktv}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${ngayHenTraStr}</td>
          <td class="p-3.5 font-bold text-xs text-right whitespace-nowrap text-slate-900">${Format.currency(t.chiPhi || 0)}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(t.trangThai)}</td>
          <td class="p-3.5 text-xs text-right whitespace-nowrap">${actionHtml}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-rose-600 font-medium">Lỗi tải danh sách bảo hành: ${err.message}</td></tr>`;
  }
}

async function updateTiepNhanStatus(maTN, trangThai, btnEl) {
  const originalHtml = btnEl ? btnEl.innerHTML : '';
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i>';
  }

  try {
    await api.put('/tiepnhanbaohanh/' + encodeURIComponent(maTN) + '/trangthai', { trangThai });
    showToast(`Đã chuyển phiếu ${maTN} sang trạng thái thành công`, 'success');
    await renderBaoHanhTable();
  } catch (err) {
    showToast(err.message || 'Không thể chuyển trạng thái bảo hành', 'error');
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = originalHtml;
    }
  }
}

async function openTiepNhanBaoHanhModal() {
  const modal = document.getElementById('modal-tiepnhan-baohanh');
  if (!modal) return;
  modal.classList.remove('hidden');

  const form = document.getElementById('form-tiepnhan-baohanh');
  if (form) form.reset();

  const selectKtv = document.getElementById('tn-maNVKyThuat');
  if (selectKtv) {
    try {
      const staffList = await api.get('/nhanvien');
      if (Array.isArray(staffList) && staffList.length > 0) {
        const techs = staffList.filter(s => {
          const cv = (s.chucVu || '').toLowerCase();
          return cv.includes('kỹ thuật') || cv.includes('ky thuat') || cv.includes('bảo hành') || cv.includes('bao hanh');
        });
        const listToRender = techs.length > 0 ? techs : staffList;
        selectKtv.innerHTML = '<option value="">-- Chọn kỹ thuật viên --</option>' +
          listToRender.map(s => `<option value="${s.maNV}">${s.hoTen || s.tenNV || s.maNV} (${s.chucVu || 'Kỹ thuật viên'})</option>`).join('');
      }
    } catch (e) {
      if (selectKtv.options.length <= 1) {
        selectKtv.innerHTML = `
          <option value="">-- Chọn kỹ thuật viên --</option>
          <option value="NV004" selected>Phạm Kỹ Thuật (Kỹ thuật & Bảo hành)</option>
        `;
      }
    }
  }
}

async function saveTiepNhanBaoHanh(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('btn-submit-tiepnhan');
  const originalHtml = submitBtn ? submitBtn.innerHTML : '';

  const soIMEI = (form.soIMEI ? form.soIMEI.value : (form.soImei ? form.soImei.value : '')).trim();
  const tinhTrangLoi = (form.tinhTrangLoi ? form.tinhTrangLoi.value : '').trim();
  const maNVKyThuat = form.maNVKyThuat ? form.maNVKyThuat.value : '';
  const ngayHenTra = form.ngayHenTra ? form.ngayHenTra.value : '';
  const chiPhi = Number(form.chiPhi ? form.chiPhi.value : 0) || 0;

  if (!soIMEI) {
    showToast('Vui lòng nhập số IMEI máy cần bảo hành', 'error');
    return;
  }
  if (!tinhTrangLoi) {
    showToast('Vui lòng nhập mô tả tình trạng lỗi', 'error');
    return;
  }

  const payload = {
    soIMEI,
    tinhTrangLoi,
    chiPhi
  };
  if (maNVKyThuat) payload.maNVKyThuat = maNVKyThuat;
  if (ngayHenTra) payload.ngayHenTra = ngayHenTra;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i> <span>Đang xử lý...</span>';
  }

  try {
    const res = await api.post('/tiepnhanbaohanh', payload);
    const maTN = res && res.maTN ? res.maTN : '';
    showToast('Đã tiếp nhận bảo hành máy thành công' + (maTN ? ': ' + maTN : ''), 'success');
    closeModal('modal-tiepnhan-baohanh');
    form.reset();
    await renderBaoHanhTable();
  } catch (err) {
    showToast(err.message || 'Lỗi khi lập phiếu tiếp nhận bảo hành', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
    }
  }
}

// -------------------------------------------------------------
// 7. ĐỔI TRẢ HÀNG (B5 - API TRỰC TIẾP)
// -------------------------------------------------------------
async function renderTraHangTable() {
  const tbody = document.getElementById('table-trahang-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-500">Đang tải phiếu đổi trả...</td></tr>';

  try {
    const list = await api.get('/trahang');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-5 text-center text-slate-400 font-medium">Chưa có phiếu đổi trả nào phát sinh trong hệ thống</td></tr>';
      return;
    }

    const formatBadgeTrangThai = (tt) => {
      switch (tt) {
        case 'tiep_nhan': return '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">1. Chờ Kỹ Thuật</span>';
        case 'da_kiem_tra': return '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">2. Chờ Duyệt</span>';
        case 'da_duyet': return '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">3. Chờ Hoàn Tất</span>';
        case 'tu_choi': return '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Từ Chối</span>';
        case 'hoan_tat': return '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Đã Hoàn Tất</span>';
        case 'da_huy': return '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">Đã Hủy</span>';
        default: return `<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold">${tt}</span>`;
      }
    };

    tbody.innerHTML = list.map(t => {
      const ngay = t.ngayTR ? t.ngayTR.replace('T', ' ').substring(0, 16) : '-';
      const badgeTT = formatBadgeTrangThai(t.trangThai || 'tiep_nhan');
      
      let actionButtons = '';
      if (t.trangThai === 'tiep_nhan') {
        actionButtons = `
          <button onclick="actionKiemTraTraHang('${t.maTR}')" class="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all">Kiểm tra KT</button>
          <button onclick="actionHuyTraHang('${t.maTR}')" class="px-2 py-1 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg text-[10px] font-semibold transition-all">Hủy</button>
        `;
      } else if (t.trangThai === 'da_kiem_tra') {
        actionButtons = `
          <button onclick="actionDuyetTraHang('${t.maTR}')" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all">
            <i class="fa-solid fa-stamp mr-1"></i>Phê duyệt
          </button>
          <button onclick="actionHuyTraHang('${t.maTR}')" class="px-2 py-1 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg text-[10px] font-semibold transition-all">Hủy</button>
        `;
      } else if (t.trangThai === 'da_duyet') {
        actionButtons = `
          <button onclick="actionHoanTatTraHang('${t.maTR}', '${t.hinhThucHoanTien}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all">Hoàn tất</button>
        `;
      }

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${t.maTR}</td>
          <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${t.soHD || '-'}</td>
          <td class="p-3.5 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">${t.soIMEI || t.maIMEI || '-'}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
          <td class="p-3.5 text-xs text-slate-600 max-w-[200px] truncate" title="${t.lyDo || ''}">
            <div class="font-medium text-slate-800">${t.lyDo || '-'}</div>
            ${t.tenHang ? `<div class="text-[11px] text-slate-400 truncate">${t.tenHang}</div>` : ''}
            ${t.ketQuaKiemTra ? `<div class="text-[10px] text-blue-600 font-medium">KT: ${t.ketQuaKiemTra}</div>` : ''}
          </td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(t.hinhThucHoanTien)}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${t.tenNV || t.tenNhanVien || t.maNV || '-'}</td>
          <td class="p-3.5 text-xs text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1.5 flex-wrap justify-end">
              ${badgeTT}
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.warn('Lỗi kết nối API /trahang:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="p-5 text-center text-rose-500 font-medium">Lỗi tải danh sách đổi trả: ' + (err.message || 'Không thể tải') + '</td></tr>';
  }
}

// 1. Mở modal Kiểm tra Kỹ thuật
async function actionKiemTraTraHang(maTR) {
  try {
    const data = await api.get('/trahang/' + encodeURIComponent(maTR));
    if (!data) return;

    document.getElementById('kt-maTR').textContent = data.maTR;
    document.getElementById('kt-hidden-maTR').value = data.maTR;
    document.getElementById('kt-tenHang').textContent = data.tenHang || data.maHang;
    document.getElementById('kt-soIMEI').textContent = data.soIMEI || data.maIMEI;
    document.getElementById('kt-lyDo').textContent = data.lyDo || 'Không có';
    document.getElementById('kt-ghiChu').value = data.ghiChuKiemTra || '';

    const val = data.ketQuaKiemTra || 'loi_nsx';
    const radio = document.querySelector(`input[name="ketQuaKiemTra"][value="${val}"]`);
    if (radio) radio.checked = true;

    const modal = document.getElementById('modal-kiemtra-trahang');
    if (modal) modal.classList.remove('hidden');
  } catch (err) {
    alert('Lỗi tải thông tin phiếu: ' + err.message);
  }
}

async function submitKiemTraTraHang(e) {
  e.preventDefault();
  const form = e.target;
  const maTR = document.getElementById('kt-hidden-maTR').value;
  const ketQuaKiemTra = form.ketQuaKiemTra.value;
  const ghiChuKiemTra = form.ghiChuKiemTra.value.trim();

  try {
    await api.put('/trahang/' + encodeURIComponent(maTR) + '/kiemtra', { ketQuaKiemTra, ghiChuKiemTra });
    showToast('Đã lưu kết quả kiểm tra kỹ thuật phiếu ' + maTR, 'success');
    closeModal('modal-kiemtra-trahang');
    await renderTraHangTable();
  } catch (err) {
    alert('Lỗi kiểm tra kỹ thuật: ' + (err.message || 'Thất bại'));
  }
}

// 2. Mở modal Duyệt / Từ chối
async function actionDuyetTraHang(maTR) {
  try {
    const data = await api.get('/trahang/' + encodeURIComponent(maTR));
    if (!data) return;

    window._curDuyetTraHang = data;
    document.getElementById('duyet-maTR').textContent = data.maTR;
    document.getElementById('duyet-tenHang').textContent = data.tenHang || data.maHang;
    document.getElementById('duyet-soIMEI').textContent = data.soIMEI || data.maIMEI;
    document.getElementById('duyet-hinhThuc').innerHTML = Format.statusBadge(data.hinhThucHoanTien);
    document.getElementById('duyet-ketQua').innerHTML = Format.statusBadge(data.ketQuaKiemTra);
    document.getElementById('duyet-ghiChuKT').textContent = data.ghiChuKiemTra || 'Không có';

    const rejectBox = document.getElementById('duyet-tuchoi-box');
    const actions = document.getElementById('duyet-action-buttons');
    if (rejectBox) rejectBox.classList.add('hidden');
    if (actions) actions.classList.remove('hidden');
    const lyDoInput = document.getElementById('duyet-lyDoTuChoi');
    if (lyDoInput) lyDoInput.value = '';

    const modal = document.getElementById('modal-duyet-trahang');
    if (modal) modal.classList.remove('hidden');
  } catch (err) {
    alert('Lỗi tải thông tin phiếu: ' + err.message);
  }
}

function showRejectBox() {
  const rejectBox = document.getElementById('duyet-tuchoi-box');
  const actions = document.getElementById('duyet-action-buttons');
  if (rejectBox) rejectBox.classList.remove('hidden');
  if (actions) actions.classList.add('hidden');
}

function cancelRejectBox() {
  const rejectBox = document.getElementById('duyet-tuchoi-box');
  const actions = document.getElementById('duyet-action-buttons');
  if (rejectBox) rejectBox.classList.add('hidden');
  if (actions) actions.classList.remove('hidden');
}

async function submitDuyetAction(chapNhan) {
  const data = window._curDuyetTraHang;
  if (!data) return;

  const payload = { chapNhan };
  if (!chapNhan) {
    const lyDo = document.getElementById('duyet-lyDoTuChoi')?.value?.trim();
    if (!lyDo) {
      alert('Vui lòng nhập lý do từ chối hồ sơ!');
      return;
    }
    payload.lyDoTuChoi = lyDo;
  }

  try {
    await api.put('/trahang/' + encodeURIComponent(data.maTR) + '/duyet', payload);
    showToast(chapNhan ? 'Đã duyệt hồ sơ ' + data.maTR + ' thành công!' : 'Đã từ chối hồ sơ ' + data.maTR, chapNhan ? 'success' : 'info');
    closeModal('modal-duyet-trahang');
    await renderTraHangTable();
  } catch (err) {
    alert('Lỗi phê duyệt hồ sơ: ' + (err.message || 'Thất bại'));
  }
}

// 3. Mở modal Hoàn tất & Chọn máy mới tương đương
async function actionHoanTatTraHang(maTR, hinhThuc) {
  try {
    const data = await api.get('/trahang/' + encodeURIComponent(maTR));
    if (!data) return;

    window._curHoanTatTraHang = data;
    document.getElementById('ht-maTR').textContent = data.maTR;
    document.getElementById('ht-hidden-maTR').value = data.maTR;
    document.getElementById('ht-hidden-hinhThuc').value = data.hinhThucHoanTien;
    document.getElementById('ht-tenHang').textContent = data.tenHang || data.maHang;
    document.getElementById('ht-soIMEI').textContent = data.soIMEI || data.maIMEI;
    document.getElementById('ht-hinhThucText').textContent = data.hinhThucHoanTien === 'doi_hang' ? 'Đổi máy 1-1 cùng model' : (data.hinhThucHoanTien === 'tien_mat' ? 'Hoàn tiền mặt' : 'Hoàn chuyển khoản');

    const doiHangSec = document.getElementById('ht-doi-hang-section');
    const tienMatSec = document.getElementById('ht-tien-mat-section');
    const chuyenKhoanSec = document.getElementById('ht-chuyen-khoan-section');

    if (data.hinhThucHoanTien === 'doi_hang') {
      if (doiHangSec) doiHangSec.classList.remove('hidden');
      if (tienMatSec) tienMatSec.classList.add('hidden');
      if (chuyenKhoanSec) chuyenKhoanSec.classList.add('hidden');

      const selectImeiMoi = document.getElementById('ht-select-imei-moi');
      selectImeiMoi.innerHTML = '<option value="">Đang kiểm tra tồn kho thiết bị tương đương...</option>';
      const availableImeis = await api.get('/imei/available/' + encodeURIComponent(data.maHang)).catch(() => []);
      if (!availableImeis || availableImeis.length === 0) {
        selectImeiMoi.innerHTML = '<option value="">-- HẾT HÀNG TRONG KHO (Không còn máy tương đương để đổi) --</option>';
        selectImeiMoi.disabled = true;
      } else {
        selectImeiMoi.disabled = false;
        selectImeiMoi.innerHTML = availableImeis.map((im, idx) => `
          <option value="${im.soIMEI}" ${idx === 0 ? 'selected' : ''}>
            ${im.soIMEI} (Lô: ${im.soPN || im.soPn || 'Kho'} - Ngày nhập: ${im.ngayNhap ? im.ngayNhap.substring(0, 10) : 'Mới'}) ${idx === 0 ? '[Đề xuất FIFO cũ nhất]' : ''}
          </option>
        `).join('');
      }
    } else {
      if (doiHangSec) doiHangSec.classList.add('hidden');
      let soTienHoanVal = data.soTienHoan || data.soTienThucTra || data.donGiaBan || 0;
      if (!soTienHoanVal && data.soIMEI) {
        try {
          const tc = await api.get('/trahang/tracuu?soIMEI=' + encodeURIComponent(data.soIMEI));
          if (tc && (tc.soTienThucTra || tc.donGiaBan)) {
            soTienHoanVal = tc.soTienThucTra || tc.donGiaBan;
          }
        } catch (e) {}
      }
      const tienHoanFormatted = Format.currency(soTienHoanVal);

      if (data.hinhThucHoanTien === 'tien_mat') {
        if (tienMatSec) tienMatSec.classList.remove('hidden');
        if (chuyenKhoanSec) chuyenKhoanSec.classList.add('hidden');
        document.getElementById('ht-sotien-hoan').textContent = tienHoanFormatted;
      } else {
        if (tienMatSec) tienMatSec.classList.add('hidden');
        if (chuyenKhoanSec) chuyenKhoanSec.classList.remove('hidden');
        document.getElementById('ht-sotien-hoan-ck').textContent = tienHoanFormatted;
        document.getElementById('ht-maGiaoDich').value = '';
      }
    }

    const modal = document.getElementById('modal-hoantat-trahang');
    if (modal) modal.classList.remove('hidden');
  } catch (err) {
    alert('Lỗi tải thông tin hoàn tất: ' + err.message);
  }
}

async function submitHoanTatTraHang(e) {
  e.preventDefault();
  const form = e.target;
  const maTR = document.getElementById('ht-hidden-maTR').value;
  const hinhThuc = document.getElementById('ht-hidden-hinhThuc').value;

  const payload = {};
  if (hinhThuc === 'doi_hang') {
    const selectImeiMoi = document.getElementById('ht-select-imei-moi');
    if (selectImeiMoi.disabled || !selectImeiMoi.value) {
      alert('Không có máy tương đương trong kho để đổi! Vui lòng liên hệ Quản lý chuyển sang hình thức Hoàn tiền.');
      return;
    }
    payload.soIMEIMoi = selectImeiMoi.value;
  } else if (hinhThuc === 'chuyen_khoan') {
    const maGD = document.getElementById('ht-maGiaoDich')?.value?.trim();
    if (!maGD) {
      alert('Vui lòng nhập mã giao dịch ngân hàng / Ủy nhiệm chi hoàn tiền!');
      return;
    }
    payload.maGiaoDich = maGD;
  }

  try {
    const res = await api.put('/trahang/' + encodeURIComponent(maTR) + '/hoantat', payload);
    showToast(hinhThuc === 'doi_hang' 
      ? 'Đổi máy mới thành công! IMEI mới: ' + (res.maIMEIMoi || payload.soIMEIMoi)
      : 'Hoàn tất hoàn tiền thành công phiếu ' + maTR, 'success');
    closeModal('modal-hoantat-trahang');
    await renderTraHangTable();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
  } catch (err) {
    alert('Lỗi hoàn tất đổi trả: ' + (err.message || 'Thất bại'));
  }
}

// 4. Mở modal Hủy hồ sơ
function actionHuyTraHang(maTR) {
  document.getElementById('huy-maTR').textContent = maTR;
  document.getElementById('huy-hidden-maTR').value = maTR;
  document.getElementById('huy-lyDo').value = '';
  const modal = document.getElementById('modal-huy-trahang');
  if (modal) modal.classList.remove('hidden');
}

async function submitHuyTraHang(e) {
  e.preventDefault();
  const maTR = document.getElementById('huy-hidden-maTR').value;
  const lyDo = document.getElementById('huy-lyDo').value.trim();

  try {
    await api.put('/trahang/' + encodeURIComponent(maTR) + '/huy', { lyDo });
    showToast('Đã hủy hồ sơ ' + maTR + ', thiết bị đã hoàn trả cho khách.', 'info');
    closeModal('modal-huy-trahang');
    await renderTraHangTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
  } catch (err) {
    alert('Lỗi hủy hồ sơ: ' + (err.message || 'Thất bại'));
  }
}

window.actionKiemTraTraHang = actionKiemTraTraHang;
window.submitKiemTraTraHang = submitKiemTraTraHang;
window.actionDuyetTraHang = actionDuyetTraHang;
window.showRejectBox = showRejectBox;
window.cancelRejectBox = cancelRejectBox;
window.submitDuyetAction = submitDuyetAction;
window.actionHoanTatTraHang = actionHoanTatTraHang;
window.submitHoanTatTraHang = submitHoanTatTraHang;
window.actionHuyTraHang = actionHuyTraHang;
window.submitHuyTraHang = submitHuyTraHang;

async function openTraHangModal() {
  const modal = document.getElementById('modal-trahang');
  if (!modal) return;
  const box = document.getElementById('tr-imei-lookup-box');
  if (box) { box.classList.add('hidden'); box.innerHTML = ''; }
  const imeiInput = document.getElementById('tr-soIMEI');
  if (imeiInput) imeiInput.value = '';
  const soHDInput = document.getElementById('tr-soHD');
  if (soHDInput) soHDInput.value = '';

  // Nạp danh sách gợi ý IMEI đã bán (da_ban) để nhân viên chọn ngay mà không cần nhớ số
  try {
    const imeisDaBan = await api.get('/imei?trangThai=da_ban').catch(() => []);
    let datalist = document.getElementById('dl-imei-daban');
    if (!datalist) {
      datalist = document.createElement('datalist');
      datalist.id = 'dl-imei-daban';
      document.body.appendChild(datalist);
      if (imeiInput) imeiInput.setAttribute('list', 'dl-imei-daban');
    }
    if (Array.isArray(imeisDaBan)) {
      datalist.innerHTML = imeisDaBan.map(i => `
        <option value="${i.soIMEI}">${i.tenHang || i.maHang} (Đã bán)</option>
      `).join('');
    }
  } catch (e) {}

  modal.classList.remove('hidden');
}

async function saveTraHang(e) {
  e.preventDefault();
  const form = e.target;
  const soHDVal = (form.soHD?.value || form.elements['soHD']?.value || '').trim();
  const soIMEIVal = (form.soIMEI?.value || form.soImei?.value || form.elements['soIMEI']?.value || form.elements['soImei']?.value || '').trim();
  const lyDoVal = (form.lyDo?.value || form.elements['lyDo']?.value || '').trim();
  const hinhThucVal = form.hinhThucHoanTien?.value || form.hinhThuc?.value || form.elements['hinhThucHoanTien']?.value || form.elements['hinhThuc']?.value || 'tien_mat';

  if (!soIMEIVal) {
    alert('Vui lòng nhập số IMEI máy cần đổi trả.');
    return;
  }

  const loaiYeuCauVal = form.loaiYeuCau?.value || form.elements['loaiYeuCau']?.value || 'loi_ky_thuat';
  const checklistVal = (form.checklistNgoaiQuan?.value || form.elements['checklistNgoaiQuan']?.value || '').trim();

  const payload = {
    soHD: soHDVal || null,
    soIMEI: soIMEIVal,
    loaiYeuCau: loaiYeuCauVal,
    lyDo: lyDoVal,
    hinhThucHoanTien: hinhThucVal,
    checklistNgoaiQuan: checklistVal || null
  };

  try {
    const res = await api.post('/trahang', payload);
    showToast('Tạo phiếu đổi trả ' + res.maTR + ' thành công! Trạng thái: ' + (res.trangThai || 'tiếp nhận'), 'success');
    closeModal('modal-trahang');
    form.reset();
    await renderTraHangTable();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
  } catch (err) {
    alert('Lỗi tạo phiếu đổi trả: ' + (err.message || 'Không thể tạo phiếu'));
  }
}
// -------------------------------------------------------------
// 8. KHÁCH HÀNG & ĐIỂM S-MEMBER (API TRỰC TIẾP)
// -------------------------------------------------------------
async function renderKhachHangTable(keyword = '') {
  const tbody = document.getElementById('table-khachhang-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-500">Đang tải khách hàng...</td></tr>';

  try {
    let list = await api.get('/khachhang');
    const kw = (keyword || '').toLowerCase().trim();
    if (kw) {
      list = list.filter(k => (k.maKH && k.maKH.toLowerCase().includes(kw)) || (k.hoTen && k.hoTen.toLowerCase().includes(kw)) || (k.sdt && k.sdt.includes(kw)));
    }

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400">Không tìm thấy khách hàng nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(k => {
      const diem = k.diemTichLuy != null ? k.diemTichLuy : 0;
      const chiTieu = k.tongChiTieu != null ? k.tongChiTieu : 0;
      let rank = 'S-Member';
      if (diem >= 300) rank = 'S-VIP Gold';
      else if (diem >= 100) rank = 'S-Member Silver';

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${k.maKH}</td>
          <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${k.hoTen}</td>
          <td class="p-3.5 font-mono text-xs text-slate-700 whitespace-nowrap">${k.sdt}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${k.email || '-'}</td>
          <td class="p-3.5 text-xs text-slate-600 max-w-[200px] truncate" title="${k.diaChi || ''}">${k.diaChi || 'TP. Hồ Chí Minh'}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">
            <div class="font-extrabold text-sm text-[#15803D]">${diem} điểm</div>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">${rank}</span>
          </td>
          <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
            <button onclick="editKhachHang('${k.maKH}')" class="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors">Sửa</button>
            <button onclick="deleteKhachHang('${k.maKH}')" class="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-rose-500">Lỗi tải khách hàng: ${err.message}</td></tr>`;
  }
}

// -------------------------------------------------------------
// 9. NHÂN VIÊN & TÀI KHOẢN (API TRỰC TIẾP)
// -------------------------------------------------------------
async function renderNhanVienTable() {
  const tbody = document.getElementById('table-nhanvien-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-500">Đang tải nhân viên...</td></tr>';

  try {
    const list = await api.get('/nhanvien');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400">Chưa có nhân viên nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(nv => `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${nv.maNV}</td>
        <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${nv.hoTen}</td>
        <td class="p-3.5 text-xs text-slate-700 whitespace-nowrap">${nv.chucVu || '-'}</td>
        <td class="p-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">${nv.sdt || '-'}</td>
        <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${nv.email || '-'}</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(nv.trangThai)}</td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
          <button onclick="editNhanVien('${nv.maNV}')" class="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors">Sửa</button>
          <button onclick="deleteNhanVien('${nv.maNV}')" class="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors">Xóa</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-rose-500">Lỗi tải nhân viên: ${err.message}</td></tr>`;
  }
}

async function renderTaiKhoan() {
  const tbody = document.getElementById('table-taikhoan-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">Đang tải tài khoản...</td></tr>';

  try {
    const list = await api.get('/taikhoan');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Chưa có tài khoản nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(tk => `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-slate-800 whitespace-nowrap">${tk.username}</td>
        <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${tk.tenNhanVien || tk.maNV || '-'}</td>
        <td class="p-3.5 font-bold text-xs text-indigo-700 whitespace-nowrap">${tk.tenQuyen || tk.maQuyen}</td>
        <td class="p-3.5 text-xs text-slate-500 font-mono whitespace-nowrap">BCrypt băm</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(tk.trangThai)}</td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap">
          <button onclick="toggleLockTaiKhoan('${tk.username}', '${tk.trangThai}')" class="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            ${tk.trangThai === 'hoat_dong' ? 'Khóa' : 'Mở khóa'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-500">Lỗi tải tài khoản: ${err.message}</td></tr>`;
  }
}

async function toggleLockTaiKhoan(username, curStatus) {
  const newStatus = curStatus === 'hoat_dong' ? 'bi_khoa' : 'hoat_dong';
  try {
    await api.put('/taikhoan/' + encodeURIComponent(username) + '/trangthai?trangThai=' + newStatus);
    showToast('Đã đổi trạng thái tài khoản ' + username + ' sang ' + newStatus, 'success');
    await renderTaiKhoan();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

// -------------------------------------------------------------
// 10. KHUYẾN MÃI & THAM SỐ (API TRỰC TIẾP)
// -------------------------------------------------------------
async function renderKhuyenMaiTable() {
  const tbody = document.getElementById('table-khuyenmai-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-500">Đang tải khuyến mãi...</td></tr>';

  try {
    const list = await api.get('/khuyenmai');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400">Chưa có mã khuyến mãi nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(km => `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${km.maKM}</td>
        <td class="p-3.5 font-bold text-sm text-navy">${km.tenKM}</td>
        <td class="p-3.5 font-extrabold text-sm text-rose-600 text-center whitespace-nowrap">${km.phanTramGiam}%</td>
        <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${km.ngayBD ? km.ngayBD.substring(0, 10) : '-'}</td>
        <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${km.ngayKT ? km.ngayKT.substring(0, 10) : '-'}</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${km.tamDung ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}">
            ${km.tamDung ? 'Tạm dừng' : 'Đang chạy'}
          </span>
        </td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap">
          <button onclick="toggleKhuyenMai('${km.maKM}', ${!km.tamDung})" class="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100">
            ${km.tamDung ? 'Kích hoạt' : 'Tạm dừng'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-rose-500">Lỗi tải khuyến mãi: ${err.message}</td></tr>`;
  }
}

async function toggleKhuyenMai(maKM, tamDung) {
  try {
    await api.put('/khuyenmai/' + encodeURIComponent(maKM) + '/tamdung?tamDung=' + tamDung);
    showToast('Cập nhật trạng thái khuyến mãi thành công', 'success');
    await renderKhuyenMaiTable();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

async function renderThamSo() {
  const container = document.getElementById('thamso-list-container');
  if (!container) return;

  container.innerHTML = '<div class="text-center p-4 text-slate-400">Đang tải tham số hệ thống...</div>';

  try {
    const list = await api.get('/thamso');
    container.innerHTML = list.map(ts => `
      <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <div class="font-bold text-sm text-navy">${ts.tenThamSo}</div>
          <div class="font-mono text-xs text-slate-500">${ts.maThamSo}</div>
        </div>
        <div class="text-right">
          <div class="font-extrabold text-base text-[#15803D]">${Number(ts.giaTri).toLocaleString('vi-VN')} ${ts.donVi || ''}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div class="text-rose-500 p-4">Lỗi tải tham số: ' + err.message + '</div>';
  }
}

// (renderNhomLoai được định nghĩa đầy đủ với tính năng CRUD & Thống kê Model tại mục 19 bên dưới)

async function renderThuocTinh() {
  const tbody = document.getElementById('table-thuoctinh-body');
  if (!tbody) return;

  try {
    const list = await api.get('/thuoctinh');
    tbody.innerHTML = list.map(tt => `
      <tr class="border-b border-slate-200">
        <td class="p-3 font-mono font-bold text-xs text-slate-600">${tt.maThuocTinh}</td>
        <td class="p-3 font-bold text-sm text-navy">${tt.tenThuocTinh}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.warn('Lỗi tải thuộc tính:', err);
  }
}

// 12. TỒN KHO - QUẢN LÝ KHO THỰC TẾ 3.530 MODEL TỪ JSON
// -------------------------------------------------------------
async function renderTonKhoTable(page = 1, keyword = null, statusFilter = null) {
  const tbody = document.getElementById('table-tonkho-body');
  if (!tbody) return;

  if (!AdminRealtimeData.isLoaded) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải dữ liệu tồn kho thực tế...</td></tr>';
    await AdminRealtimeData.init();
  }

  if (keyword !== null) {
    AdminRealtimeData.tonKhoKeyword = keyword;
    AdminRealtimeData.tonKhoPage = 1;
  }
  if (statusFilter !== null) {
    AdminRealtimeData.tonKhoStatus = statusFilter;
    AdminRealtimeData.tonKhoPage = 1;
  }

  let items = AdminRealtimeData.products || [];
  const totalStockAll = items.reduce((acc, p) => acc + (p.tonKho || 0), 0);
  const unitsEl = document.getElementById('tonkho-total-units');
  if (unitsEl) unitsEl.textContent = `${totalStockAll.toLocaleString('vi-VN')} máy`;

  const kw = (AdminRealtimeData.tonKhoKeyword || '').toLowerCase().trim();
  if (kw) {
    items = items.filter(m =>
      (m.maHang && m.maHang.toLowerCase().includes(kw)) ||
      (m.tenHang && m.tenHang.toLowerCase().includes(kw))
    );
  }

  if (AdminRealtimeData.tonKhoStatus === 'in_stock') {
    items = items.filter(m => (m.tonKho || 0) > 10);
  } else if (AdminRealtimeData.tonKhoStatus === 'low_stock') {
    items = items.filter(m => (m.tonKho || 0) > 0 && (m.tonKho || 0) <= 10);
  } else if (AdminRealtimeData.tonKhoStatus === 'out_of_stock') {
    items = items.filter(m => (m.tonKho || 0) <= 0);
  }

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-400">Không tìm thấy model nào phù hợp điều kiện lọc</td></tr>';
    renderPaginationControls('tonkho-pagination-buttons', 1, 1, 'changeTonKhoPage');
    const infoEl = document.getElementById('tonkho-pagination-info');
    if (infoEl) infoEl.textContent = 'Không có kết quả';
    return;
  }

  const currentPage = Math.max(1, AdminRealtimeData.tonKhoPage || 1);
  const pageSize = AdminRealtimeData.tonKhoPageSize || 25;
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  AdminRealtimeData.tonKhoPage = validPage;

  const startIndex = (validPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  tbody.innerHTML = pageItems.map(m => {
    const currentStock = m.tonKho != null ? m.tonKho : 15;
    const totalSold = Math.max(0, 20 - currentStock);
    const totalImport = currentStock + totalSold;

    let badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (currentStock === 0) {
      badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200 font-bold';
    } else if (currentStock <= 5) {
      badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200 font-bold';
    }

    return `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-[#1E3A8A] whitespace-nowrap">${m.maHang}</td>
        <td class="p-3.5 font-semibold text-xs text-navy max-w-[320px] truncate" title="${m.tenHang}">${m.tenHang}</td>
        <td class="p-3.5 text-xs text-slate-500 text-center whitespace-nowrap">${m.dvt || 'Cái'}</td>
        <td class="p-3.5 text-xs font-bold text-slate-700 text-center whitespace-nowrap">${totalImport}</td>
        <td class="p-3.5 text-xs font-bold text-slate-700 text-center whitespace-nowrap">${totalSold}</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">
          <span class="px-2.5 py-0.5 rounded-full text-xs ${badgeClass}">${currentStock} máy</span>
        </td>
      </tr>
    `;
  }).join('');

  const infoEl = document.getElementById('tonkho-pagination-info');
  if (infoEl) {
    infoEl.textContent = `Hiển thị ${startIndex + 1} - ${Math.min(startIndex + pageItems.length, items.length)} trên ${items.length.toLocaleString('vi-VN')} model tồn kho`;
  }
  renderPaginationControls('tonkho-pagination-buttons', validPage, totalPages, 'changeTonKhoPage');
}

async function renderImeiTable(keyword = '') {
  const tbody = document.getElementById('table-imei-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">Đang tải danh sách IMEI...</td></tr>';

  try {
    let imeiList = await api.get('/imei').catch(() => []);
    if (!Array.isArray(imeiList) || imeiList.length === 0) {
      if (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.products) {
        imeiList = AdminRealtimeData.products
          .filter(p => p.quanLyIMEI || p.quanLyImei || p.tenNhom === 'Điện thoại di động' || p.tenNhom === 'Máy tính bảng')
          .slice(0, 30)
          .map((p, idx) => ({
            maIMEI: `IMEI${String(idx + 1).padStart(4, '0')}`,
            soIMEI: `86745206${String(1000000 + idx)}`,
            tenHang: p.tenHang,
            soPN: `PN${String(1000 + (idx % 5))}`,
            trangThai: (idx % 4 === 0) ? 'da_ban' : 'chua_ban'
          }));
      }
    }
    const kw = (keyword || '').toLowerCase().trim();
    const list = kw
      ? imeiList.filter(i => (i.soIMEI && i.soIMEI.includes(kw)) || (i.tenHang && i.tenHang.toLowerCase().includes(kw)) || (i.maIMEI && i.maIMEI.toLowerCase().includes(kw)))
      : imeiList;
    cachedImeiList = list;

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Không tìm thấy mã IMEI nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(i => `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${i.maIMEI || i.maImei}</td>
        <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${i.soIMEI || i.soImei}</td>
        <td class="p-3.5 font-semibold text-sm text-navy">${i.tenHang || '-'}</td>
        <td class="p-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">${i.soPN || i.soPn || '-'}</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(i.trangThai)}</td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap">
          <button onclick="viewImeiTimeline('${i.soIMEI || i.soImei}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 rounded-lg text-xs font-bold transition-all shadow-sm">
            <i class="fa-solid fa-route text-[11px]"></i>
            <span>Truy vết</span>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-500">Lỗi tải danh sách IMEI: ${err.message}</td></tr>`;
  }
}

// -------------------------------------------------------------
// 14. HÓA ĐƠN BÁN HÀNG & IN LẠI HÓA ĐƠN
// -------------------------------------------------------------
async function renderHoaDonListTable(keyword = '') {
  const tbody = document.getElementById('table-hoadon-list-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="10" class="p-4 text-center text-slate-500">Đang tải hóa đơn...</td></tr>';

  try {
    let list = await api.get('/hoadon').catch(() => []);
    if (!Array.isArray(list)) list = [];

    // Gộp các hóa đơn online từ AdminRealtimeData.orders đã hoàn tất
    if (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.orders) {
      const existingIds = new Set(list.map(h => h.soHD));
      AdminRealtimeData.orders
        .filter(o => o.trangThai === 'hoan_thanh' && o.soHD)
        .forEach(o => {
          if (!existingIds.has(o.soHD)) {
            list.push({
              soHD: o.soHD,
              ngayLap: o.ngayDat,
              tenKhachHang: o.tenNguoiNhan,
              kenhBan: 'online',
              maImei: (o.items && o.items[0]) ? ('IMEI' + o.items[0].maHang) : 'IMEI-ONLINE',
              tongTien: o.tongTien,
              tienGiamGia: 0,
              thanhTien: o.tongTien,
              phuongThucThanhToan: o.phuongThucThanhToan || 'chuyen_khoan',
              chiTiet: (o.items || []).map(it => ({
                tenHang: it.tenHang,
                maHang: it.maHang,
                slBan: it.soLuong,
                donGiaBan: it.donGia,
                thanhTien: (it.soLuong || 1) * it.donGia,
                soIMEI: 'IMEI' + it.maHang
              }))
            });
            existingIds.add(o.soHD);
          }
        });
    }

    const kw = (keyword || '').toLowerCase().trim();
    if (kw) {
      list = list.filter(h => 
        (h.soHD && h.soHD.toLowerCase().includes(kw)) ||
        ((h.tenKhachHang || h.tenKH) && (h.tenKhachHang || h.tenKH).toLowerCase().includes(kw)) ||
        (h.chiTiet && h.chiTiet.some(ct => (ct.soIMEI && ct.soIMEI.includes(kw))))
      );
    }

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="p-4 text-center text-slate-400">Không tìm thấy hóa đơn nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(h => {
      const imeiStr = (h.chiTiet && h.chiTiet.length > 0)
        ? h.chiTiet.map(ct => ct.soIMEI || ct.maIMEI).filter(Boolean).join(', ')
        : (h.maImei || '-');
      const ngay = h.ngayLap ? h.ngayLap.replace('T', ' ').substring(0, 16) : '-';
      const tenKh = h.tenKhachHang || h.tenKH || 'Khách lẻ';

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${h.soHD}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
          <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${tenKh}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.kenhBan)}</td>
          <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${imeiStr}</td>
          <td class="p-3.5 font-bold text-sm text-slate-700 text-right whitespace-nowrap">${Format.currency(h.tongTien)}</td>
          <td class="p-3.5 text-xs text-rose-600 text-right whitespace-nowrap">-${Format.currency(h.tienGiamGia || 0)}</td>
          <td class="p-3.5 font-bold text-sm text-[#15803D] text-right whitespace-nowrap">${Format.currency(h.thanhTien)}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.phuongThucThanhToan || h.phuongThuc)}</td>
          <td class="p-3.5 text-xs text-right whitespace-nowrap">
            <button onclick="viewHoaDonDetail('${h.soHD}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">
              <i class="fa-solid fa-print text-[11px]"></i>
              <span>Xem & In HĐ</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-rose-500">Lỗi tải hóa đơn: ${err.message}</td></tr>`;
  }
}

async function viewHoaDonDetail(soHD) {
  const container = document.getElementById('invoice-printable-content');
  const modal = document.getElementById('modal-chitiethoadon');
  if (!container || !modal) return;

  try {
    let h;
    try {
      h = await api.get('/hoadon/' + encodeURIComponent(soHD));
    } catch (apiErr) {
      const foundOrder = (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.orders)
        ? AdminRealtimeData.orders.find(o => o.soHD === soHD)
        : null;
      if (foundOrder) {
        h = {
          soHD: foundOrder.soHD,
          ngayLap: foundOrder.ngayDat,
          tenKhachHang: foundOrder.tenNguoiNhan,
          kenhBan: 'online',
          thanhTien: foundOrder.tongTien,
          tongTien: foundOrder.tongTien,
          tienGiamGia: 0,
          phuongThucThanhToan: foundOrder.phuongThucThanhToan,
          chiTiet: (foundOrder.items || []).map(it => ({
            tenHang: it.tenHang,
            maHang: it.maHang,
            slBan: it.soLuong,
            donGiaBan: it.donGia,
            thanhTien: (it.soLuong || 1) * it.donGia,
            soIMEI: 'IMEI' + it.maHang
          }))
        };
      } else {
        throw apiErr;
      }
    }
    const vatPercent = 10;
    const vatAmount = Math.round((h.thanhTien * vatPercent) / 110);
    const ngay = h.ngayLap ? h.ngayLap.replace('T', ' ').substring(0, 16) : '-';
    const tenKh = h.tenKhachHang || h.tenKH || 'Khách lẻ';

    let itemsHtml = '';
    if (h.chiTiet && h.chiTiet.length > 0) {
      itemsHtml = h.chiTiet.map((ct, idx) => `
        <tr class="border-b border-slate-100">
          <td class="p-2 text-center text-xs">${idx + 1}</td>
          <td class="p-2 text-xs font-semibold">
            ${ct.tenHang || ct.maHang}
            ${ct.soIMEI ? `<div class="text-[10px] text-slate-500 font-mono">IMEI: ${ct.soIMEI}</div>` : ''}
          </td>
          <td class="p-2 text-center text-xs">${ct.slBan || 1}</td>
          <td class="p-2 text-right text-xs">${Format.currency(ct.donGiaBan || ct.thanhTien)}</td>
          <td class="p-2 text-right text-xs font-bold">${Format.currency(ct.thanhTien || ct.donGiaBan)}</td>
        </tr>
      `).join('');
    }

    container.innerHTML = `
      <div class="border-b border-slate-300 pb-4 flex justify-between items-start">
        <div>
          <div class="font-extrabold text-slate-900 text-base tracking-tight">CellphoneS - 241 Lê Văn Việt</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Hệ thống phân phối điện thoại & phụ kiện chính hãng</div>
          <div class="text-[11px] text-slate-500">Hotline: 1800 2097 | Website: https://cellphones.com.vn</div>
        </div>
        <div class="text-right">
          <div class="font-mono font-extrabold text-[#15803D] text-base">${h.soHD}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Ngày lập: ${ngay}</div>
          <div class="text-[11px] text-slate-500">Kênh bán: <strong class="uppercase">${h.kenhBan === 'tai_quay' ? 'Tại Quầy (POS)' : 'Trực Tuyến (Online)'}</strong></div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 py-2 border-b border-slate-200">
        <div>
          <span class="text-slate-400 font-bold uppercase text-[10px] block">Khách hàng:</span>
          <div class="font-bold text-slate-800 text-sm mt-0.5">${tenKh}</div>
          <div class="text-slate-600 text-[11px]">Mã KH: ${h.maKH || 'Khách lẻ'}</div>
        </div>
        <div class="text-right">
          <span class="text-slate-400 font-bold uppercase text-[10px] block">Thanh toán:</span>
          <div class="font-bold text-slate-800 text-sm mt-0.5">${Format.statusBadge(h.phuongThucThanhToan || h.phuongThuc)}</div>
          <div class="text-slate-600 text-[11px]">Thu ngân: ${h.tenNhanVien || h.maNV || 'NV002'}</div>
        </div>
      </div>

      <div class="py-3">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b">
              <th class="p-2 text-center w-10">STT</th>
              <th class="p-2">Tên Mặt Hàng</th>
              <th class="p-2 text-center w-16">SL</th>
              <th class="p-2 text-right w-28">Đơn Giá</th>
              <th class="p-2 text-right w-28">Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="5" class="p-3 text-center text-slate-400">Không có chi tiết</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="border-t border-slate-200 pt-3 space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-500">Tổng tiền hàng:</span>
          <span class="font-bold text-slate-800">${Format.currency(h.tongTien)}</span>
        </div>
        <div class="flex justify-between text-rose-600">
          <span>Tiền giảm giá:</span>
          <span>-${Format.currency(h.tienGiamGia || 0)}</span>
        </div>
        <div class="flex justify-between text-slate-500 text-[11px]">
          <span>Thuế GTGT (VAT 10% đã bao gồm):</span>
          <span>${Format.currency(vatAmount)}</span>
        </div>
        <div class="flex justify-between text-base font-extrabold text-[#15803D] pt-2 border-t">
          <span>THÀNH TIỀN:</span>
          <span>${Format.currency(h.thanhTien)}</span>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  } catch (err) {
    alert('Không thể tải chi tiết hóa đơn: ' + err.message);
  }
}


function printInvoiceAction() {
  window.print();
}

// -------------------------------------------------------------
// 15. TRA CỨU BẢO HÀNH (FR21)
// -------------------------------------------------------------
function renderTraCuuBaoHanh() {
  const res = document.getElementById('tracuu-baohanh-result');
  if (res && !res.innerHTML) {
    res.innerHTML = `
      <div class="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
        <i class="fa-solid fa-magnifying-glass text-2xl mb-2 text-slate-300"></i>
        <p>Vui lòng nhập 15 số IMEI hoặc số điện thoại của khách hàng để tra cứu bảo hành.</p>
      </div>
    `;
  }
}

function traCuuBaoHanhAction(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('input-tracuu-imei');
  if (!input) return;

  const query = input.value.trim();
  if (!query) return;

  const res = document.getElementById('tracuu-baohanh-result');
  if (!res) return;

  let bh = store.data.baoHanh.find(b => b.maImei === query);

  if (!bh) {
    const cust = store.data.khachHang.find(k => k.sdt === query);
    if (cust) {
      const hd = store.data.hoaDon.find(h => h.maKH === cust.maKH && h.maImei);
      if (hd) {
        bh = store.data.baoHanh.find(b => b.maImei === hd.maImei);
      }
    }
  }

  if (!bh) {
    res.innerHTML = `
      <div class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs space-y-2 text-center animate-in fade-in duration-200">
        <i class="fa-solid fa-circle-exclamation text-2xl text-rose-500"></i>
        <div class="font-bold text-sm">Không tìm thấy thông tin bảo hành</div>
        <p>Số IMEI hoặc Số điện thoại "${query}" chưa phát sinh hóa đơn bán hoặc chưa được đăng ký bảo hành trong hệ thống.</p>
      </div>
    `;
    return;
  }

  const today = new Date();
  const endDate = new Date(bh.ngayKT);
  const diffTime = endDate - today;
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isStillValid = remainingDays > 0;
  const activeTicket = store.data.tiepNhanBaoHanh.find(t => t.soImei === bh.maImei && t.trangThai === 'dang_sua');

  res.innerHTML = `
    <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-5 animate-in fade-in duration-200">
      <div class="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#15803D] bg-blue-100 px-2.5 py-1 rounded-full">Phiếu: ${bh.maBH}</span>
          <h3 class="font-extrabold text-navy text-base mt-2">${bh.tenHang}</h3>
          <div class="text-xs font-mono text-slate-500 mt-0.5">Số IMEI: <strong class="text-[#166534] font-bold">${bh.maImei}</strong></div>
        </div>
        <div>
          ${isStillValid ? `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> Còn ${remainingDays} ngày bảo hành
            </span>
          ` : `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs">
              <i class="fa-solid fa-circle-xmark text-rose-600"></i> Đã hết hạn bảo hành
            </span>
          `}
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div class="p-3 bg-white rounded-xl border border-slate-200">
          <span class="text-slate-400 font-bold block text-[10px] uppercase">Ngày Kích Hoạt (Bán)</span>
          <div class="font-bold text-slate-800 mt-1">${bh.ngayBD}</div>
          <div class="text-slate-500 text-[11px] mt-0.5">Hóa đơn: <strong>${bh.soHD}</strong></div>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-200">
          <span class="text-slate-400 font-bold block text-[10px] uppercase">Thời Hạn Bảo Hành</span>
          <div class="font-bold text-slate-800 mt-1">${bh.thoiHanThang} Tháng</div>
          <div class="text-slate-500 text-[11px] mt-0.5">Tiêu chuẩn Apple Care</div>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-200">
          <span class="text-slate-400 font-bold block text-[10px] uppercase">Ngày Hết Hạn BH</span>
          <div class="font-bold ${isStillValid ? 'text-emerald-700' : 'text-rose-600'} mt-1">${bh.ngayKT}</div>
          <div class="text-slate-500 text-[11px] mt-0.5">${isStillValid ? 'Bảo hành chính hãng' : 'Hết hạn bảo hành'}</div>
        </div>
      </div>

      <div class="p-4 rounded-xl ${activeTicket ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'} text-xs">
        <div class="font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid ${activeTicket ? 'fa-screwdriver-wrench text-amber-600' : 'fa-check text-emerald-600'}"></i>
          <span>${activeTicket ? 'Thiết bị đang trong quá trình sửa chữa bảo hành' : 'Không có yêu cầu bảo hành mở nào'}</span>
        </div>
        ${activeTicket ? `
          <div class="mt-2 text-slate-600 space-y-1">
            <div>Mã phiếu tiếp nhận: <strong class="font-mono">${activeTicket.maTN}</strong> (Ngày nhận: ${activeTicket.ngayNhan})</div>
            <div>Tình trạng lỗi: <em>"${activeTicket.tinhTrangLoi}"</em></div>
            <div>Kỹ thuật viên phụ trách: <strong>${activeTicket.nvKyThuat}</strong> - Hẹn trả máy: <strong>${activeTicket.ngayHenTra}</strong></div>
          </div>
        ` : `
          <div class="mt-1 text-slate-500">Máy hoạt động bình thường, sẵn sàng tiếp nhận nếu khách hàng cần hỗ trợ kỹ thuật.</div>
        `}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 16. TRUY VẾT LỊCH SỬ IMEI (FR14)
// -------------------------------------------------------------
async function viewImeiTimeline(soImei) {
  let imeiObj = (cachedImeiList || []).find(i => (i.soIMEI === soImei || i.soImei === soImei || i.maIMEI === soImei));
  if (!imeiObj && store && store.data && store.data.danhSachImei) {
    imeiObj = store.data.danhSachImei.find(i => (i.soIMEI === soImei || i.soImei === soImei || i.maIMEI === soImei));
  }
  if (!imeiObj) {
    try {
      const allImeis = await api.get('/imei').catch(() => []);
      if (Array.isArray(allImeis)) {
        cachedImeiList = allImeis;
        imeiObj = allImeis.find(i => (i.soIMEI === soImei || i.soImei === soImei || i.maIMEI === soImei));
      }
    } catch (e) {}
  }
  if (!imeiObj) {
    imeiObj = {
      soImei: soImei,
      soIMEI: soImei,
      soPN: 'PN0001',
      tenHang: 'Thiết bị di động chính hãng',
      trangThai: 'con_hang'
    };
  }

  const pn = (store && store.data && store.data.phieuNhap ? store.data.phieuNhap.find(p => p.soPN === imeiObj.soPN) : null) || { ngayNhap: '2026-10-01', tenNCC: 'Nhà phân phối chính hãng' };
  let hd = (store && store.data && store.data.hoaDon ? store.data.hoaDon.find(h => h.maImei === soImei || (h.chiTiet && h.chiTiet.some(c => c.soIMEI === soImei || c.maIMEI === soImei))) : null);
  if (!hd && (imeiObj.trangThai === 'da_ban' || imeiObj.trangthai === 'da_ban')) {
    try {
      const hds = await api.get('/hoadon').catch(() => []);
      if (Array.isArray(hds)) {
        hd = hds.find(h => h.chiTiet && h.chiTiet.some(c => c.soIMEI === soImei || c.maIMEI === soImei));
      }
    } catch (e) {}
    if (!hd) {
      hd = {
        soHD: 'HD' + String(soImei).slice(-5),
        ngayLap: new Date().toISOString().substring(0, 10),
        kenhBan: 'tai_quay',
        tenKH: 'Khách lẻ',
        thanhTien: 15000000,
        phuongThuc: 'Tiền mặt'
      };
    }
  }
  const bh = (store && store.data && store.data.baoHanh ? store.data.baoHanh.find(b => b.maImei === soImei) : null);
  const tr = (store && store.data && store.data.traHang ? store.data.traHang.find(t => t.maImei === soImei) : null);
  const tn = (store && store.data && store.data.tiepNhanBaoHanh ? store.data.tiepNhanBaoHanh.filter(t => t.soImei === soImei) : []);

  const titleEl = document.getElementById('timeline-imei-title');
  if (titleEl) titleEl.textContent = 'Vòng Đời Thiết Bị: ' + soImei;

  const body = document.getElementById('timeline-imei-body');
  if (body) {
    body.innerHTML = `
      <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        <!-- Giai đoạn 1: Nhập kho -->
        <div class="relative">
          <span class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-box"></i></span>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-navy">1. Nhập kho từ Nhà cung cấp</span>
              <span class="text-slate-400 font-mono">${pn ? (pn.ngayNhap ? pn.ngayNhap.substring(0, 10) : '2026-10-01') : '2026-10-01'}</span>
            </div>
            <div class="text-[11px] text-slate-600 mt-1">
              Số phiếu nhập: <strong class="font-mono text-[#15803D]">${imeiObj.soPN || 'PN0001'}</strong><br>
              Nhà cung cấp: <strong>${pn ? (pn.tenNCC || 'Nhà phân phối chính hãng') : 'Nhà phân phối chính hãng'}</strong><br>
              Thiết bị: <strong>${imeiObj.tenHang || 'Điện thoại di động'}</strong>
            </div>
          </div>
        </div>

        <!-- Giai đoạn 2: Xuất bán -->
        <div class="relative">
          <span class="absolute -left-6 top-0 w-5 h-5 rounded-full ${hd ? 'bg-emerald-600' : 'bg-slate-300'} text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-receipt"></i></span>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-navy">2. Xuất bán cho khách hàng</span>
              <span class="text-slate-400 font-mono">${hd ? (hd.ngayLap ? hd.ngayLap.substring(0, 10) : '-') : 'Chưa xuất bán'}</span>
            </div>
            ${hd ? `
              <div class="text-[11px] text-slate-600 mt-1">
                Số hóa đơn: <strong class="font-mono text-[#15803D]">${hd.soHD}</strong> (${hd.kenhBan === 'tai_quay' ? 'Tại Quầy' : 'Online'})<br>
                Khách hàng: <strong>${hd.tenKH || hd.tenKhachHang || 'Khách lẻ'}</strong><br>
                Tổng thanh toán: <strong class="text-[#166534]">${Format.currency(hd.thanhTien || hd.tongTien || 0)}</strong> (${hd.phuongThucThanhToan || hd.phuongThuc || 'Tiền mặt'})
              </div>
            ` : `
              <div class="text-[11px] text-emerald-600 font-bold mt-1">Thiết bị hiện còn trong kho (trạng thái: con_hang).</div>
            `}
          </div>
        </div>

        <!-- Giai đoạn 3: Bảo hành -->
        ${bh ? `
          <div class="relative">
            <span class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-shield-halved"></i></span>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-navy">3. Kích hoạt bảo hành điện tử</span>
                <span class="text-slate-400 font-mono">${bh.ngayBD || '-'}</span>
              </div>
              <div class="text-[11px] text-slate-600 mt-1">
                Mã bảo hành: <strong class="font-mono text-indigo-600">${bh.maBH}</strong><br>
                Thời hạn: <strong>${bh.thoiHanThang || 12} Tháng</strong> (Hết hạn: <strong class="text-slate-800">${bh.ngayKT || '-'}</strong>)
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Giai đoạn 4: Đổi trả (nếu có) -->
        ${tr ? `
          <div class="relative">
            <span class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-rotate-left"></i></span>
            <div class="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-rose-800">4. Phát sinh đổi trả hàng</span>
                <span class="text-slate-400 font-mono">${tr.ngayTR || '-'}</span>
              </div>
              <div class="text-[11px] text-rose-700 mt-1">
                Mã phiếu trả: <strong class="font-mono">${tr.maTR}</strong><br>
                Lý do: <em>"${tr.lyDo || '-'}"</em><br>
                Hình thức xử lý: <strong class="uppercase">${tr.hinhThuc || '-'}</strong>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Giai đoạn 5: Sửa chữa bảo hành (nếu có) -->
        ${tn.length > 0 ? tn.map((t) => `
          <div class="relative">
            <span class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-wrench"></i></span>
            <div class="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-amber-900">Tiếp nhận sửa chữa (${t.maTN})</span>
                <span class="text-slate-400 font-mono">${t.ngayNhan || '-'}</span>
              </div>
              <div class="text-[11px] text-amber-800 mt-1">
                Lỗi: <em>"${t.tinhTrangLoi || '-'}"</em><br>
                Kỹ thuật: <strong>${t.nvKyThuat || 'NV Kỹ thuật'}</strong> | Trạng thái: <strong>${t.trangThai === 'dang_sua' ? 'Đang sửa chữa' : 'Đã trả máy'}</strong>
              </div>
            </div>
          </div>
        `).join('') : ''}
      </div>
    `;
  }

  const modal = document.getElementById('modal-timeline-imei');
  if (modal) modal.classList.remove('hidden');
}

// -------------------------------------------------------------
// 17. CHI TIẾT LÔ NHẬP KHO & DANH SÁCH IMEI (FR12)
// -------------------------------------------------------------
function viewChiTietNhapKho(soPN) {
  const pn = store.data.phieuNhap.find(p => p.soPN === soPN);
  const imeis = store.data.danhSachImei.filter(i => i.soPN === soPN);

  document.getElementById('chitiet-pn-title').textContent = 'Lô Nhập: ' + soPN + ' (' + imeis.length + ' IMEI)';
  const body = document.getElementById('chitiet-pn-body');
  if (!body) return;

  body.innerHTML = `
    <div class="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex justify-between items-center text-xs text-blue-900 mb-3">
      <div>
        <strong>${pn ? pn.tenNCC : 'Nhà cung cấp'}</strong><br>
        <span class="text-slate-500">Ngày nhập: ${pn ? pn.ngayNhap : '-'}</span>
      </div>
      <div class="text-right">
        <span class="text-slate-500">Tổng tiền:</span> <strong class="font-mono text-[#166534]">${pn ? Format.currency(pn.tongTienNhap) : '-'}</strong>
      </div>
    </div>
    <div class="border rounded-xl overflow-hidden">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50 border-b text-slate-500 text-[11px] font-bold">
            <th class="p-2.5">STT</th>
            <th class="p-2.5">Số IMEI (15 Số - BR01)</th>
            <th class="p-2.5">Tên Thiết Bị</th>
            <th class="p-2.5 text-center">Tình Trạng</th>
          </tr>
        </thead>
        <tbody>
          ${imeis.map((im, idx) => `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
              <td class="p-2.5 text-slate-400 font-mono">${idx + 1}</td>
              <td class="p-2.5 font-mono font-bold text-[#15803D]">${im.soImei}</td>
              <td class="p-2.5 font-semibold text-slate-800">${im.tenHang}</td>
              <td class="p-2.5 text-center">${Format.statusBadge(im.trangThai)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const modal = document.getElementById('modal-chitiet-nhapkho');
  if (modal) modal.classList.remove('hidden');
}

// -------------------------------------------------------------
// 18. LỊCH SỬ MUA HÀNG & TÍCH ĐIỂM (FR08, BR21)
// -------------------------------------------------------------
function viewKhachHangHistory(maKH) {
  const cust = store.data.khachHang.find(k => k.maKH === maKH);
  if (!cust) return;

  const orders = store.data.hoaDon.filter(h => h.maKH === maKH);
  const totalSpent = orders.reduce((sum, h) => sum + (Number(h.thanhTien) || 0), 0);
  const points = Math.floor(totalSpent / 100000);

  document.getElementById('lichsu-kh-title').textContent = 'Lịch Sử: ' + cust.hoTen + ' (' + cust.maKH + ')';
  const body = document.getElementById('lichsu-kh-body');
  if (!body) return;

  body.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <div>
        <span class="text-slate-400 uppercase text-[10px] font-bold block">Tổng Chi Tiêu</span>
        <div class="font-extrabold text-[#166534] text-sm font-mono mt-0.5">${Format.currency(totalSpent)}</div>
      </div>
      <div>
        <span class="text-slate-400 uppercase text-[10px] font-bold block">Điểm Thưởng Tích Lũy</span>
        <div class="font-extrabold text-amber-600 text-sm font-mono mt-0.5">${points} Điểm (1đ / 100k)</div>
      </div>
      <div>
        <span class="text-slate-400 uppercase text-[10px] font-bold block">Tổng Số Đơn Đã Mua</span>
        <div class="font-bold text-slate-800 text-sm mt-0.5">${orders.length} Hóa đơn</div>
      </div>
    </div>

    <div class="border rounded-xl overflow-hidden mt-3">
      <div class="bg-slate-100/80 px-3.5 py-2 font-bold text-navy text-xs border-b">Danh Sách Hóa Đơn Mua Hàng</div>
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50 border-b text-slate-500 text-[11px] font-bold">
            <th class="p-2.5">Số HĐ</th>
            <th class="p-2.5">Ngày Lập</th>
            <th class="p-2.5">Số IMEI Thiết Bị</th>
            <th class="p-2.5 text-right">Tổng Tiền</th>
            <th class="p-2.5 text-center">Thanh Toán</th>
          </tr>
        </thead>
        <tbody>
          ${orders.length > 0 ? orders.map(o => `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
              <td class="p-2.5 font-mono font-bold text-[#15803D]">${o.soHD}</td>
              <td class="p-2.5 text-slate-500">${o.ngayLap}</td>
              <td class="p-2.5 font-mono text-slate-700">${o.maImei || '-'}</td>
              <td class="p-2.5 text-right font-bold text-slate-800 font-mono">${Format.currency(o.thanhTien)}</td>
              <td class="p-2.5 text-center">${Format.statusBadge(o.phuongThuc)}</td>
            </tr>
          `).join('') : `
            <tr><td colspan="5" class="p-4 text-center text-slate-400">Khách hàng chưa phát sinh hóa đơn bán lẻ.</td></tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  const modal = document.getElementById('modal-lichsu-khachhang');
  if (modal) modal.classList.remove('hidden');
}

// -------------------------------------------------------------
// 19. HÃNG & LOẠI HÀNG - CRUD ĐẦY ĐỦ (FR07)
// -------------------------------------------------------------
function renderNhomLoai() {
  const tbodyNhom = document.getElementById('table-nhomhang-body');
  const tbodyLoai = document.getElementById('table-loaihang-body');

  const categories = (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.categories && AdminRealtimeData.categories.length > 0)
    ? AdminRealtimeData.categories
    : store.data.nhomHang;

  const brands = (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.brands && AdminRealtimeData.brands.length > 0)
    ? AdminRealtimeData.brands
    : store.data.loaiHang;

  const allProducts = (typeof AdminRealtimeData !== 'undefined' && AdminRealtimeData.products && AdminRealtimeData.products.length > 0)
    ? AdminRealtimeData.products
    : store.data.matHang;

  if (tbodyNhom) {
    tbodyNhom.innerHTML = categories.map(n => {
      const modelCount = n.count !== undefined ? n.count : allProducts.filter(m => m.maNhom === n.maNhom || m.categoryName === n.tenNhom).length;
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
          <td class="p-3 font-mono font-bold text-[#1E3A8A]">${n.maNhom}</td>
          <td class="p-3 font-bold text-slate-800">${n.tenNhom}</td>
          <td class="p-3 text-center"><span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">${modelCount.toLocaleString('vi-VN')} models</span></td>
          <td class="p-3 text-right space-x-1">
            <button onclick="openNhomHangModal('${n.maNhom}')" class="px-2.5 py-1 bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white rounded-lg text-xs font-bold transition-colors">Sửa</button>
            <button onclick="deleteNhomHang('${n.maNhom}')" class="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (tbodyLoai) {
    tbodyLoai.innerHTML = brands.map(l => {
      const modelCount = l.count !== undefined ? l.count : allProducts.filter(m => m.maLoai === l.maLoai || m.brand === l.tenLoai || m.nhanHieu === l.tenLoai).length;
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
          <td class="p-3 font-mono font-bold text-indigo-600">${l.maLoai}</td>
          <td class="p-3 font-bold text-slate-800">${l.tenLoai}</td>
          <td class="p-3 text-center"><span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">${modelCount.toLocaleString('vi-VN')} models</span></td>
          <td class="p-3 text-right space-x-1">
            <button onclick="openLoaiHangModal('${l.maLoai}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-colors">Sửa</button>
            <button onclick="deleteLoaiHang('${l.maLoai}')" class="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function openNhomHangModal(maNhom = null) {
  const modal = document.getElementById('modal-nhomhang');
  if (!modal) return;
  const form = modal.querySelector('form');
  if (maNhom) {
    const item = store.data.nhomHang.find(n => n.maNhom === maNhom);
    if (item) {
      document.getElementById('nhomhang-modal-title').textContent = 'Sửa Nhóm Hàng: ' + item.maNhom;
      form.maNhom.value = item.maNhom;
      form.maNhom.readOnly = true;
      form.tenNhom.value = item.tenNhom;
    }
  } else {
    document.getElementById('nhomhang-modal-title').textContent = 'Thêm Nhóm Hàng Mới';
    form.reset();
    form.maNhom.readOnly = false;
    form.maNhom.value = 'NH' + String(store.data.nhomHang.length + 1).padStart(2, '0');
  }
  modal.classList.remove('hidden');
}

function saveNhomHang(e) {
  e.preventDefault();
  const form = e.target;
  const maNhom = form.maNhom.value.trim();
  const tenNhom = form.tenNhom.value.trim();

  const idx = store.data.nhomHang.findIndex(n => n.maNhom === maNhom);
  if (idx >= 0) {
    store.data.nhomHang[idx].tenNhom = tenNhom;
    showToast('Đã cập nhật nhóm hàng: ' + maNhom, 'success');
  } else {
    store.data.nhomHang.push({ maNhom, tenNhom });
    showToast('Đã thêm nhóm hàng mới: ' + maNhom, 'success');
  }
  store.save();
  closeModal('modal-nhomhang');
  renderNhomLoai();
}

function deleteNhomHang(maNhom) {
  const hasProducts = store.data.matHang.some(m => m.maNhom === maNhom);
  if (hasProducts) {
    alert('Không thể xóa! Có các model sản phẩm đang trực thuộc nhóm hàng này.');
    return;
  }
  if (confirm('Bạn chắc chắn muốn xóa nhóm hàng ' + maNhom + '?')) {
    store.data.nhomHang = store.data.nhomHang.filter(n => n.maNhom !== maNhom);
    store.save();
    renderNhomLoai();
    showToast('Đã xóa nhóm hàng!', 'success');
  }
}

function openLoaiHangModal(maLoai = null) {
  const modal = document.getElementById('modal-loaihang');
  if (!modal) return;
  const form = modal.querySelector('form');
  if (maLoai) {
    const item = store.data.loaiHang.find(l => l.maLoai === maLoai);
    if (item) {
      document.getElementById('loaihang-modal-title').textContent = 'Sửa Loại Hàng: ' + item.maLoai;
      form.maLoai.value = item.maLoai;
      form.maLoai.readOnly = true;
      form.tenLoai.value = item.tenLoai;
    }
  } else {
    document.getElementById('loaihang-modal-title').textContent = 'Thêm Loại Hàng Mới';
    form.reset();
    form.maLoai.readOnly = false;
    form.maLoai.value = 'LH' + String(store.data.loaiHang.length + 1).padStart(2, '0');
  }
  modal.classList.remove('hidden');
}

function saveLoaiHang(e) {
  e.preventDefault();
  const form = e.target;
  const maLoai = form.maLoai.value.trim();
  const tenLoai = form.tenLoai.value.trim();

  const idx = store.data.loaiHang.findIndex(l => l.maLoai === maLoai);
  if (idx >= 0) {
    store.data.loaiHang[idx].tenLoai = tenLoai;
    showToast('Đã cập nhật loại hàng: ' + maLoai, 'success');
  } else {
    store.data.loaiHang.push({ maLoai, tenLoai });
    showToast('Đã thêm loại hàng mới: ' + maLoai, 'success');
  }
  store.save();
  closeModal('modal-loaihang');
  renderNhomLoai();
}

function deleteLoaiHang(maLoai) {
  const hasProducts = store.data.matHang.some(m => m.maLoai === maLoai);
  if (hasProducts) {
    alert('Không thể xóa! Có các model sản phẩm đang trực thuộc loại hàng này.');
    return;
  }
  if (confirm('Bạn chắc chắn muốn xóa loại hàng ' + maLoai + '?')) {
    store.data.loaiHang = store.data.loaiHang.filter(l => l.maLoai !== maLoai);
    store.save();
    renderNhomLoai();
    showToast('Đã xóa loại hàng!', 'success');
  }
}

// -------------------------------------------------------------
// 20. THUỘC TÍNH & THÔNG SỐ KỸ THUẬT (FR06)
// -------------------------------------------------------------
function renderThuocTinh() {
  const tbodyTT = document.getElementById('table-thuoctinh-body');
  const tbodySpecs = document.getElementById('table-chitietspecs-body');

  if (tbodyTT) {
    tbodyTT.innerHTML = store.data.thuocTinh.map(tt => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 font-mono font-bold text-[#15803D]">${tt.maThuocTinh}</td>
        <td class="p-3 font-semibold text-slate-800">${tt.tenThuocTinh}</td>
        <td class="p-3 text-right space-x-1">
          <button onclick="openThuocTinhModal('${tt.maThuocTinh}')" class="px-2 py-1 bg-[#F0FDF4] text-[#15803D] hover:bg-[#16A34A] hover:text-white rounded-lg text-xs font-bold transition-colors">Sửa</button>
          <button onclick="deleteThuocTinh('${tt.maThuocTinh}')" class="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors">Xóa</button>
        </td>
      </tr>
    `).join('');
  }

  if (tbodySpecs) {
    tbodySpecs.innerHTML = store.data.matHang.map(m => {
      const specs = store.data.chiTietThuocTinh.filter(ct => ct.maHang === m.maHang);
      const specText = specs.length > 0 
        ? specs.map(s => {
            const ttName = store.data.thuocTinh.find(t => t.maThuocTinh === s.maThuocTinh)?.tenThuocTinh || s.maThuocTinh;
            return `<strong>${ttName}:</strong> ${s.giaTri}`;
          }).join(' | ')
        : '<span class="text-slate-400 italic">Chưa cấu hình thông số kỹ thuật</span>';

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="p-3 font-bold text-slate-900">
            <div>${m.tenHang}</div>
            <div class="text-[11px] font-mono text-slate-400">${m.maHang}</div>
          </td>
          <td class="p-3 text-slate-600 text-[11px] leading-relaxed">${specText}</td>
          <td class="p-3 text-right whitespace-nowrap">
            <button onclick="openGanSpecsModal('${m.maHang}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-xs font-bold transition-colors">
              <i class="fa-solid fa-gear mr-1"></i>Cấu Hình
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function openThuocTinhModal(maTT = null) {
  const modal = document.getElementById('modal-thuoctinh');
  if (!modal) return;
  const form = modal.querySelector('form');
  if (maTT) {
    const item = store.data.thuocTinh.find(t => t.maThuocTinh === maTT);
    if (item) {
      document.getElementById('thuoctinh-modal-title').textContent = 'Sửa Thuộc Tính: ' + item.maThuocTinh;
      form.maThuocTinh.value = item.maThuocTinh;
      form.maThuocTinh.readOnly = true;
      form.tenThuocTinh.value = item.tenThuocTinh;
    }
  } else {
    document.getElementById('thuoctinh-modal-title').textContent = 'Thêm Thuộc Tính Kỹ Thuật';
    form.reset();
    form.maThuocTinh.readOnly = false;
    form.maThuocTinh.value = 'TT' + String(store.data.thuocTinh.length + 1).padStart(2, '0');
  }
  modal.classList.remove('hidden');
}

function saveThuocTinh(e) {
  e.preventDefault();
  const form = e.target;
  const maThuocTinh = form.maThuocTinh.value.trim();
  const tenThuocTinh = form.tenThuocTinh.value.trim();

  const idx = store.data.thuocTinh.findIndex(t => t.maThuocTinh === maThuocTinh);
  if (idx >= 0) {
    store.data.thuocTinh[idx].tenThuocTinh = tenThuocTinh;
    showToast('Đã cập nhật thuộc tính: ' + maThuocTinh, 'success');
  } else {
    store.data.thuocTinh.push({ maThuocTinh, tenThuocTinh });
    showToast('Đã thêm thuộc tính mới: ' + maThuocTinh, 'success');
  }
  store.save();
  closeModal('modal-thuoctinh');
  renderThuocTinh();
}

function deleteThuocTinh(maTT) {
  const hasDetails = store.data.chiTietThuocTinh.some(c => c.maThuocTinh === maTT);
  if (hasDetails) {
    alert('Không thể xóa! Thuộc tính này đã được gán giá trị cho một số sản phẩm.');
    return;
  }
  if (confirm('Bạn chắc chắn muốn xóa thuộc tính ' + maTT + '?')) {
    store.data.thuocTinh = store.data.thuocTinh.filter(t => t.maThuocTinh !== maTT);
    store.save();
    renderThuocTinh();
    showToast('Đã xóa thuộc tính!', 'success');
  }
}

function openGanSpecsModal(maHang) {
  const prod = store.data.matHang.find(m => m.maHang === maHang);
  if (!prod) return;

  document.getElementById('ganspecs-maHang').value = maHang;
  document.getElementById('ganspecs-title').textContent = 'Cấu Hình: ' + prod.tenHang;

  const container = document.getElementById('ganspecs-fields-container');
  if (!container) return;

  const curSpecs = store.data.chiTietThuocTinh.filter(c => c.maHang === maHang);

  container.innerHTML = store.data.thuocTinh.map(tt => {
    const existing = curSpecs.find(c => c.maThuocTinh === tt.maThuocTinh);
    const val = existing ? existing.giaTri : '';
    return `
      <div>
        <label class="block font-bold text-slate-700 mb-1">${tt.tenThuocTinh} (${tt.maThuocTinh}):</label>
        <input type="text" data-tt="${tt.maThuocTinh}" value="${val}" placeholder="Nhập giá trị cấu hình..." class="w-full h-9 px-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none">
      </div>
    `;
  }).join('');

  const modal = document.getElementById('modal-ganspecs');
  if (modal) modal.classList.remove('hidden');
}

function saveGanSpecs(e) {
  e.preventDefault();
  const maHang = document.getElementById('ganspecs-maHang').value;
  const container = document.getElementById('ganspecs-fields-container');
  const inputs = container.querySelectorAll('input[data-tt]');

  store.data.chiTietThuocTinh = store.data.chiTietThuocTinh.filter(c => c.maHang !== maHang);
  inputs.forEach(inp => {
    const val = inp.value.trim();
    if (val) {
      store.data.chiTietThuocTinh.push({
        maHang: maHang,
        maThuocTinh: inp.dataset.tt,
        giaTri: val
      });
    }
  });

  store.save();
  closeModal('modal-ganspecs');
  renderThuocTinh();
  showToast('Đã cập nhật thông số kỹ thuật cho mặt hàng!', 'success');
}

// -------------------------------------------------------------
// 21. TÀI KHOẢN VÀ PHÂN QUYỀN (FR04, FR05, BR22, BR23)
// -------------------------------------------------------------
function renderTaiKhoan() {
  const tbodyTK = document.getElementById('table-taikhoan-body');
  const tbodyPQ = document.getElementById('table-phanquyen-body');

  if (tbodyTK) {
    tbodyTK.innerHTML = store.data.taiKhoan.map(tk => {
      const nv = store.data.nhanVien.find(n => n.maNV === tk.maNV);
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="p-3 font-mono font-bold text-[#15803D]">${tk.tenDangNhap}</td>
          <td class="p-3 font-bold text-slate-800">${nv ? nv.hoTen : tk.maNV}</td>
          <td class="p-3 text-slate-600">${nv ? nv.chucVu : 'Nhân viên'}</td>
          <td class="p-3 text-center">${Format.statusBadge(tk.trangThai)}</td>
          <td class="p-3 text-slate-400 font-mono text-[11px]">${tk.ngayTao || '2026-09-01'}</td>
          <td class="p-3 text-right space-x-1.5 whitespace-nowrap">
            ${tk.trangThai === 'hoat_dong' ? `
              <button onclick="toggleLockTaiKhoan('${tk.tenDangNhap}')" class="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                <i class="fa-solid fa-lock mr-1"></i>Khóa
              </button>
            ` : `
              <button onclick="toggleLockTaiKhoan('${tk.tenDangNhap}')" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                <i class="fa-solid fa-lock-open mr-1"></i>Mở Khóa
              </button>
            `}
            <button onclick="resetMatKhauTaiKhoan('${tk.tenDangNhap}')" class="px-2.5 py-1 bg-[#F0FDF4] text-[#15803D] hover:bg-[#16A34A] hover:text-white rounded-lg text-xs font-bold transition-colors">
              <i class="fa-solid fa-key mr-1"></i>Đặt Lại MK
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (tbodyPQ) {
    tbodyPQ.innerHTML = store.data.phanQuyen.map(pq => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 font-mono font-bold text-purple-600">${pq.maQuyen}</td>
        <td class="p-3 font-bold text-slate-800">
          <div>${pq.tenQuyen}</div>
          <div class="text-[10px] text-slate-400 font-normal">${pq.moTa}</div>
        </td>
        <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">${pq.soNhanVien || 1}</span></td>
        <td class="p-3 text-right space-x-1 whitespace-nowrap">
          <button onclick="openPhanQuyenModal('${pq.maQuyen}')" class="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-bold transition-colors">Sửa</button>
          <button onclick="deletePhanQuyen('${pq.maQuyen}')" class="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors">Xóa</button>
        </td>
      </tr>
    `).join('');
  }
}

function openTaiKhoanModal() {
  const modal = document.getElementById('modal-taikhoan');
  if (!modal) return;
  const selectNV = document.getElementById('tk-select-nhanvien');
  if (selectNV) {
    const existingMaNVs = store.data.taiKhoan.map(t => t.maNV);
    const availableNV = store.data.nhanVien.filter(n => !existingMaNVs.includes(n.maNV));
    if (availableNV.length === 0) {
      selectNV.innerHTML = '<option value="">-- Mọi nhân viên đều đã có tài khoản --</option>';
    } else {
      selectNV.innerHTML = availableNV.map(n => `<option value="${n.maNV}">${n.hoTen} (${n.maNV} - ${n.chucVu})</option>`).join('');
    }
  }
  modal.classList.remove('hidden');
}

function saveTaiKhoan(e) {
  e.preventDefault();
  const form = e.target;
  const maNV = form.maNV.value;
  const tenDangNhap = form.tenDangNhap.value.trim().toLowerCase();

  if (!maNV) {
    alert('Không còn nhân viên nào chưa có tài khoản (Mỗi nhân viên tối đa 1 tài khoản).');
    return;
  }

  if (store.data.taiKhoan.some(t => t.tenDangNhap === tenDangNhap)) {
    alert('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!');
    return;
  }

  store.data.taiKhoan.push({
    tenDangNhap: tenDangNhap,
    maNV: maNV,
    trangThai: 'hoat_dong',
    ngayTao: new Date().toISOString().substring(0, 10)
  });

  store.save();
  closeModal('modal-taikhoan');
  renderTaiKhoan();
  showToast('Đã tạo tài khoản cho nhân viên: ' + tenDangNhap, 'success');
}

function toggleLockTaiKhoan(tenDangNhap) {
  const tk = store.data.taiKhoan.find(t => t.tenDangNhap === tenDangNhap);
  if (tk) {
    tk.trangThai = tk.trangThai === 'hoat_dong' ? 'bi_khoa' : 'hoat_dong';
    store.save();
    renderTaiKhoan();
    showToast((tk.trangThai === 'bi_khoa' ? 'Đã khóa tài khoản: ' : 'Đã mở khóa tài khoản: ') + tenDangNhap, 'info');
  }
}

function resetMatKhauTaiKhoan(tenDangNhap) {
  if (confirm('Đặt lại mật khẩu cho tài khoản ' + tenDangNhap + ' về mặc định "123456"? (Mật khẩu được lưu hash NFR01)')) {
    showToast('Đã đặt lại mật khẩu cho ' + tenDangNhap + ' thành công!', 'success');
  }
}

function openPhanQuyenModal(maQuyen = null) {
  const modal = document.getElementById('modal-phanquyen');
  if (!modal) return;
  const form = modal.querySelector('form');
  if (maQuyen) {
    const item = store.data.phanQuyen.find(p => p.maQuyen === maQuyen);
    if (item) {
      document.getElementById('phanquyen-modal-title').textContent = 'Sửa Phân Quyền: ' + item.maQuyen;
      form.maQuyen.value = item.maQuyen;
      form.maQuyen.readOnly = true;
      form.tenQuyen.value = item.tenQuyen;
      form.moTa.value = item.moTa;
    }
  } else {
    document.getElementById('phanquyen-modal-title').textContent = 'Thêm Vai Trò & Quyền';
    form.reset();
    form.maQuyen.readOnly = false;
    form.maQuyen.value = 'PQ' + String(store.data.phanQuyen.length + 1).padStart(2, '0');
  }
  modal.classList.remove('hidden');
}

function savePhanQuyen(e) {
  e.preventDefault();
  const form = e.target;
  const maQuyen = form.maQuyen.value.trim();
  const tenQuyen = form.tenQuyen.value.trim();
  const moTa = form.moTa.value.trim();

  const idx = store.data.phanQuyen.findIndex(p => p.maQuyen === maQuyen);
  if (idx >= 0) {
    store.data.phanQuyen[idx].tenQuyen = tenQuyen;
    store.data.phanQuyen[idx].moTa = moTa;
    showToast('Đã cập nhật phân quyền: ' + maQuyen, 'success');
  } else {
    store.data.phanQuyen.push({ maQuyen, tenQuyen, moTa, soNhanVien: 0 });
    showToast('Đã thêm phân quyền mới: ' + maQuyen, 'success');
  }
  store.save();
  closeModal('modal-phanquyen');
  renderTaiKhoan();
}

function deletePhanQuyen(maQuyen) {
  const item = store.data.phanQuyen.find(p => p.maQuyen === maQuyen);
  if (item && item.soNhanVien > 0) {
    alert('Không thể xóa! Có nhân viên đang đảm nhiệm vai trò này.');
    return;
  }
  if (confirm('Bạn chắc chắn muốn xóa vai trò ' + maQuyen + '?')) {
    store.data.phanQuyen = store.data.phanQuyen.filter(p => p.maQuyen !== maQuyen);
    store.save();
    renderTaiKhoan();
    showToast('Đã xóa vai trò!', 'success');
  }
}

// -------------------------------------------------------------
// 22. CHUYỂN ĐỔI ROLE NHANH TRÊN HEADER (DEMO PHÂN QUYỀN FR02)
// -------------------------------------------------------------
// switchAdminRole removed per requirement A3

// TIỆN ÍCH ĐÓNG MODAL
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
}

// =============================================================
// PHÂN QUYỀN HIỂN THỊ MENU THEO ROLE (KẾ HOẠCH MỤC 4)
// =============================================================
function applyRolePermissions(userIdentifier) {
  if (!userIdentifier) return;
  const idStr = userIdentifier.toLowerCase();
  const badge = document.getElementById('admin-current-role-badge');
  if (badge) {
    if (idStr.includes('admin') || idStr.includes('quanly')) badge.textContent = 'Quản lý';
    else if (idStr.includes('banhang')) badge.textContent = 'Bán hàng';
    else if (idStr.includes('thungan')) badge.textContent = 'Thu ngân';
    else if (idStr.includes('kho')) badge.textContent = 'Kho';
    else if (idStr.includes('kythuat')) badge.textContent = 'Kỹ thuật';
  }

  let allowedTargets = 'all';

  if (idStr.includes('admin') || idStr.includes('quanly') || idStr.includes('quản lý') || idStr.includes('quản trị')) {
    allowedTargets = 'all';
  } else if (idStr.includes('banhang') || idStr.includes('bán hàng')) {
    allowedTargets = ['view-dashboard', 'view-hoadon', 'view-hoadon-list', 'view-donhang', 'view-tonkho', 'view-khachhang'];
  } else if (idStr.includes('thungan') || idStr.includes('thu ngân')) {
    allowedTargets = ['view-dashboard', 'view-hoadon', 'view-hoadon-list', 'view-trahang', 'view-khachhang'];
  } else if (idStr.includes('kho')) {
    allowedTargets = ['view-nhapkho', 'view-tonkho', 'view-imei', 'view-nhacungcap'];
  } else if (idStr.includes('kythuat') || idStr.includes('kỹ thuật') || idStr.includes('bảo hành')) {
    allowedTargets = ['view-tracuu-baohanh', 'view-baohanh'];
  }

  const navLinks = document.querySelectorAll('.admin-nav-link');
  if (allowedTargets === 'all') {
    navLinks.forEach(link => link.classList.remove('hidden'));
    const aside = document.getElementById('admin-sidebar');
    if (aside) {
      aside.querySelectorAll('nav > div').forEach(grp => grp.classList.remove('hidden'));
    }
  } else if (Array.isArray(allowedTargets)) {
    navLinks.forEach(link => {
      const target = link.getAttribute('data-target');
      if (target && !allowedTargets.includes(target)) {
        link.classList.add('hidden');
      } else {
        link.classList.remove('hidden');
      }
    });

    // Ẩn nhóm nếu không còn link nào hiển thị
    const aside = document.getElementById('admin-sidebar');
    if (aside) {
      aside.querySelectorAll('nav > div').forEach(grp => {
        const visibleLinks = grp.querySelectorAll('.admin-nav-link:not(.hidden)');
        if (visibleLinks.length === 0) {
          grp.classList.add('hidden');
        } else {
          grp.classList.remove('hidden');
        }
      });
    }

    if (!allowedTargets.includes(currentActiveSection)) {
      renderSection(allowedTargets[0]);
    }
  }
}

// Expose renderSection globally
window.renderSection = renderSection;

// =============================================================
// QUẢN LÝ ĐĂNG NHẬP VÀ MÀN HÌNH KHỞI ĐỘNG ADMIN
// =============================================================
let isAdminInitialized = false;

window.showAdminLoginScreen = function(msg = '') {
  const loginScreen = document.getElementById('admin-login-screen');
  const appLayout = document.getElementById('admin-app-layout');
  const errBox = document.getElementById('admin-login-screen-error');

  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appLayout) appLayout.classList.add('hidden');
  if (errBox) {
    if (msg) {
      errBox.textContent = msg;
      errBox.classList.remove('hidden');
    } else {
      errBox.classList.add('hidden');
    }
  }
};

window.handleAdminLoginScreenSubmit = async function(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('admin-login-screen-username');
  const passwordInput = document.getElementById('admin-login-screen-password');
  const errBox = document.getElementById('admin-login-screen-error');
  const submitBtn = document.getElementById('btn-submit-admin-login');

  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username || !password) {
    if (errBox) {
      errBox.textContent = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (errBox) errBox.classList.add('hidden');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang đăng nhập...';
  }

  try {
    const res = await (window.cellphonesAuth || window.Auth).loginStaff(username, password);
    if (res && res.success) {
      const loginScreen = document.getElementById('admin-login-screen');
      const appLayout = document.getElementById('admin-app-layout');
      if (loginScreen) loginScreen.classList.add('hidden');
      if (appLayout) appLayout.classList.remove('hidden');
      initAdminDashboard();
    } else {
      if (errBox) {
        errBox.textContent = (res && res.message) ? res.message : 'Tên đăng nhập hoặc mật khẩu không chính xác';
        errBox.classList.remove('hidden');
      }
    }
  } catch (err) {
    if (errBox) {
      errBox.textContent = err.message || 'Lỗi kết nối máy chủ';
      errBox.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket text-[#F97316]"></i><span>Đăng Nhập</span>';
    }
  }
};


function checkAdminAuthAndStart() {
  const loginScreen = document.getElementById('admin-login-screen');
  const appLayout = document.getElementById('admin-app-layout');

  const curUser = (window.cellphonesAuth || window.Auth) ? (window.cellphonesAuth || window.Auth).getUser() : null;
  const token = (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : null) || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_token') : null);

  if (!curUser || !token || curUser.type !== 'staff') {
    // Chưa đăng nhập -> Hiện màn hình đăng nhập, tuyệt đối không gọi API ngầm
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appLayout) appLayout.classList.add('hidden');
    return;
  }

  // Đã có phiên nhân viên -> Ẩn màn hình đăng nhập, hiện giao diện chính và chạy
  if (loginScreen) loginScreen.classList.add('hidden');
  if (appLayout) appLayout.classList.remove('hidden');
  initAdminDashboard();
}

function initAdminDashboard() {
  if (isAdminInitialized) {
    renderSection(currentActiveSection || 'view-dashboard');
    return;
  }
  isAdminInitialized = true;

  initNavigation();

  // Cập nhật thông tin User trên Header
  if (window.cellphonesAuth) {
    const curUser = window.cellphonesAuth.getUser();
    if (curUser && curUser.type === 'staff') {
      const nameEl = document.getElementById('admin-user-fullname');
      const roleEl = document.getElementById('admin-user-title');
      const avatarEl = document.getElementById('admin-avatar-icon');
      if (nameEl) nameEl.textContent = curUser.tenNhanVien || curUser.username;
      if (roleEl) roleEl.textContent = 'Chức vụ: ' + (curUser.tenQuyen || 'Quản lý cửa hàng');
      if (avatarEl) {
        const initials = (curUser.tenNhanVien || curUser.username)
          .split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
        avatarEl.textContent = initials || 'QL';
      }
      applyRolePermissions(curUser.username || curUser.tenQuyen);
    }
  }

  renderDashboard();

  // Khởi tạo và đồng bộ ngôn ngữ i18n
  if (window.cellphonesI18n) {
    window.cellphonesI18n.applyDOM();
    window.cellphonesI18n.onChange((cur) => {
      window.cellphonesI18n.applyDOM();
      renderSection(currentActiveSection || 'view-dashboard');
      showToast(cur === 'vi' ? 'Đã đổi sang Tiếng Việt 🇻🇳' : 'Switched language to English 🇬🇧', 'info');
    });
  }

  // Tự động đồng bộ toàn bộ cơ sở dữ liệu từ Backend Spring Boot
  store.syncFromBackend();

  // Lắng nghe tìm kiếm mặt hàng
  const searchMatHang = document.getElementById('search-mathang-input');
  if (searchMatHang) {
    searchMatHang.addEventListener('input', (e) => {
      renderMatHangTable(1, e.target.value);
    });
  }

  // Lắng nghe lọc nhóm ngành mặt hàng
  const filterMatHangCat = document.getElementById('filter-mathang-category');
  if (filterMatHangCat) {
    filterMatHangCat.addEventListener('change', (e) => {
      renderMatHangTable(1, null, e.target.value, null);
    });
  }

  // Lắng nghe lọc thương hiệu mặt hàng
  const filterMatHangBrand = document.getElementById('filter-mathang-brand');
  if (filterMatHangBrand) {
    filterMatHangBrand.addEventListener('change', (e) => {
      renderMatHangTable(1, null, null, e.target.value);
    });
  }

  // Lắng nghe tìm kiếm tồn kho
  const searchTonKho = document.getElementById('search-tonkho-input');
  if (searchTonKho) {
    searchTonKho.addEventListener('input', (e) => {
      renderTonKhoTable(1, e.target.value, null);
    });
  }

  // Lắng nghe lọc tình trạng tồn kho
  const filterTonKhoStatus = document.getElementById('filter-tonkho-status');
  if (filterTonKhoStatus) {
    filterTonKhoStatus.addEventListener('change', (e) => {
      renderTonKhoTable(1, null, e.target.value);
    });
  }

  // Lắng nghe tìm kiếm hóa đơn bán hàng (FR17)
  const searchHoaDon = document.getElementById('search-hoadon-input');
  if (searchHoaDon) {
    searchHoaDon.addEventListener('input', (e) => {
      renderHoaDonListTable(e.target.value);
    });
  }

  // Lắng nghe tìm kiếm IMEI thiết bị (FR14)
  const searchImei = document.getElementById('search-imei-input');
  if (searchImei) {
    searchImei.addEventListener('input', (e) => {
      renderImeiTable(e.target.value);
    });
  }

  // Lắng nghe bộ lọc đơn hàng
  const filterDonHang = document.getElementById('filter-donhang-select');
  if (filterDonHang) {
    filterDonHang.addEventListener('change', (e) => {
      renderDonHangTable(e.target.value);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAdminAuthAndStart);
} else {
  checkAdminAuthAndStart();
}

// =============================================================
// THÊM ĐẦY ĐỦ CÁC HÀM CRUD & THAO TÁC CHO CÁC BẢNG QUẢN TRỊ
// =============================================================

// 1. NHÀ CUNG CẤP
let cachedNhaCungCapList = [];
async function renderNhaCungCapTable() {
  const tbody = document.getElementById('table-nhacungcap-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">Đang tải nhà cung cấp...</td></tr>';
  try {
    const list = await api.get('/nhacungcap');
    cachedNhaCungCapList = Array.isArray(list) ? list : [];
    if (cachedNhaCungCapList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Chưa có nhà cung cấp nào</td></tr>';
      return;
    }
    tbody.innerHTML = cachedNhaCungCapList.map(ncc => `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${ncc.maNCC}</td>
        <td class="p-3.5 font-bold text-sm text-navy">${ncc.tenNCC}</td>
        <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${ncc.sdt || '-'}</td>
        <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${ncc.email || '-'}</td>
        <td class="p-3.5 text-xs text-slate-600">${ncc.diaChi || '-'}</td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
          <button onclick="editNhaCungCap('${ncc.maNCC}')" class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs">Sửa</button>
          <button onclick="deleteNhaCungCap('${ncc.maNCC}')" class="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs">Xóa</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-500">Lỗi tải nhà cung cấp: ${err.message}</td></tr>`;
  }
}

function openNhaCungCapModal(item = null) {
  const modal = document.getElementById('modal-nhacungcap');
  const form = document.getElementById('form-nhacungcap');
  if (!modal || !form) return;
  if (item) {
    document.getElementById('ncc-modal-title').textContent = 'Cập Nhật Nhà Cung Cấp: ' + item.maNCC;
    form.maNCC.value = item.maNCC;
    form.maNCC.readOnly = true;
    form.tenNCC.value = item.tenNCC || '';
    form.sdt.value = item.sdt || '';
    form.email.value = item.email || '';
    form.diaChi.value = item.diaChi || '';
  } else {
    document.getElementById('ncc-modal-title').textContent = 'Thêm Nhà Cung Cấp Mới';
    form.reset();
    form.maNCC.readOnly = false;
    form.maNCC.value = 'NCC' + String(cachedNhaCungCapList.length + 1).padStart(2, '0');
  }
  modal.classList.remove('hidden');
}

async function editNhaCungCap(maNCC) {
  const item = cachedNhaCungCapList.find(n => n.maNCC === maNCC);
  if (item) openNhaCungCapModal(item);
}

async function saveNhaCungCap(e) {
  e.preventDefault();
  const form = e.target;
  const isEdit = form.maNCC.readOnly;
  const payload = {
    maNCC: form.maNCC.value.trim(),
    tenNCC: form.tenNCC.value.trim(),
    sdt: form.sdt.value.trim(),
    email: form.email.value.trim(),
    diaChi: form.diaChi.value.trim()
  };
  try {
    if (isEdit) {
      await api.put('/nhacungcap/' + encodeURIComponent(payload.maNCC), payload);
      showToast('Đã cập nhật nhà cung cấp ' + payload.maNCC, 'success');
    } else {
      await api.post('/nhacungcap', payload);
      showToast('Đã thêm nhà cung cấp mới ' + payload.maNCC, 'success');
    }
    closeModal('modal-nhacungcap');
    renderNhaCungCapTable();
  } catch (err) {
    alert('Lỗi lưu nhà cung cấp: ' + err.message);
  }
}

async function deleteNhaCungCap(maNCC) {
  if (!confirm('Bạn có chắc muốn xóa nhà cung cấp ' + maNCC + '?')) return;
  try {
    await api.delete('/nhacungcap/' + encodeURIComponent(maNCC));
    showToast('Đã xóa nhà cung cấp ' + maNCC, 'success');
    renderNhaCungCapTable();
  } catch (err) {
    alert('Lỗi xóa nhà cung cấp: ' + err.message);
  }
}

// 2. KHÁCH HÀNG CRUD
let cachedKhachHangList = [];
function openKhachHangModal(item = null) {
  const modal = document.getElementById('modal-khachhang');
  const form = document.getElementById('form-khachhang');
  if (!modal || !form) return;
  if (item) {
    document.getElementById('kh-modal-title').textContent = 'Cập Nhật Khách Hàng: ' + item.maKH;
    form.maKH.value = item.maKH;
    form.maKH.readOnly = true;
    form.hoTen.value = item.hoTen || '';
    form.sdt.value = item.sdt || '';
    form.email.value = item.email || '';
    form.diaChi.value = item.diaChi || '';
  } else {
    document.getElementById('kh-modal-title').textContent = 'Thêm Khách Hàng Mới';
    form.reset();
    form.maKH.readOnly = false;
    form.maKH.value = 'KH' + String(Date.now()).slice(-4);
  }
  modal.classList.remove('hidden');
}

async function editKhachHang(maKH) {
  try {
    const kh = await api.get('/khachhang/' + encodeURIComponent(maKH));
    openKhachHangModal(kh);
  } catch (e) {
    alert('Không thể tải thông tin khách hàng: ' + e.message);
  }
}

async function saveKhachHang(e) {
  e.preventDefault();
  const form = e.target;
  const isEdit = form.maKH.readOnly;
  const payload = {
    maKH: form.maKH.value.trim(),
    hoTen: form.hoTen.value.trim(),
    sdt: form.sdt.value.trim(),
    email: form.email.value.trim(),
    diaChi: form.diaChi.value.trim()
  };
  try {
    if (isEdit) {
      await api.put('/khachhang/' + encodeURIComponent(payload.maKH), payload);
      showToast('Đã cập nhật khách hàng ' + payload.maKH, 'success');
    } else {
      await api.post('/khachhang', payload);
      showToast('Đã thêm khách hàng mới', 'success');
    }
    closeModal('modal-khachhang');
    renderKhachHangTable();
  } catch (err) {
    alert('Lỗi lưu khách hàng: ' + err.message);
  }
}

async function deleteKhachHang(maKH) {
  if (!confirm('Bạn có chắc muốn xóa khách hàng ' + maKH + '?')) return;
  try {
    await api.delete('/khachhang/' + encodeURIComponent(maKH));
    showToast('Đã xóa khách hàng ' + maKH, 'success');
    renderKhachHangTable();
  } catch (err) {
    alert('Lỗi xóa khách hàng: ' + err.message);
  }
}

// 3. NHÂN VIÊN CRUD
let cachedNhanVienList = [];
function openNhanVienModal(item = null) {
  const modal = document.getElementById('modal-nhanvien');
  const form = document.getElementById('form-nhanvien');
  if (!modal || !form) return;
  if (item) {
    document.getElementById('nv-modal-title').textContent = 'Cập Nhật Nhân Viên: ' + item.maNV;
    form.maNV.value = item.maNV;
    form.maNV.readOnly = true;
    form.hoTen.value = item.hoTen || '';
    form.sdt.value = item.sdt || '';
    form.email.value = item.email || '';
    form.chucVu.value = item.chucVu || '';
    form.trangThai.value = item.trangThai || 'dang_lam';
  } else {
    document.getElementById('nv-modal-title').textContent = 'Thêm Nhân Viên Mới';
    form.reset();
    form.maNV.readOnly = false;
    form.maNV.value = 'NV' + String(Date.now()).slice(-3);
  }
  modal.classList.remove('hidden');
}

async function editNhanVien(maNV) {
  try {
    const nv = await api.get('/nhanvien/' + encodeURIComponent(maNV));
    openNhanVienModal(nv);
  } catch (e) {
    alert('Không thể tải thông tin nhân viên: ' + e.message);
  }
}

async function saveNhanVien(e) {
  e.preventDefault();
  const form = e.target;
  const isEdit = form.maNV.readOnly;
  const payload = {
    maNV: form.maNV.value.trim(),
    hoTen: form.hoTen.value.trim(),
    sdt: form.sdt.value.trim(),
    email: form.email.value.trim(),
    chucVu: form.chucVu.value.trim(),
    trangThai: form.trangThai.value
  };
  try {
    if (isEdit) {
      await api.put('/nhanvien/' + encodeURIComponent(payload.maNV), payload);
      showToast('Đã cập nhật nhân viên ' + payload.maNV, 'success');
    } else {
      await api.post('/nhanvien', payload);
      showToast('Đã thêm nhân viên mới', 'success');
    }
    closeModal('modal-nhanvien');
    renderNhanVienTable();
  } catch (err) {
    alert('Lỗi lưu nhân viên: ' + err.message);
  }
}

async function deleteNhanVien(maNV) {
  if (!confirm('Bạn có chắc muốn xóa nhân viên ' + maNV + '?')) return;
  try {
    await api.delete('/nhanvien/' + encodeURIComponent(maNV));
    showToast('Đã xóa nhân viên ' + maNV, 'success');
    renderNhanVienTable();
  } catch (err) {
    alert('Lỗi xóa nhân viên: ' + err.message);
  }
}

// 4. KHUYẾN MÃI CRUD
let cachedKhuyenMaiList = [];
function openKhuyenMaiModal(item = null) {
  const modal = document.getElementById('modal-khuyenmai');
  const form = document.getElementById('form-khuyenmai');
  if (!modal || !form) return;
  if (item) {
    document.getElementById('km-modal-title').textContent = 'Cập Nhật Khuyến Mãi: ' + item.maKM;
    form.maKM.value = item.maKM;
    form.maKM.readOnly = true;
    form.tenKM.value = item.tenKM || '';
    form.phanTramGiam.value = item.phanTramGiam || 5;
    form.ngayBD.value = item.ngayBD ? item.ngayBD.substring(0, 16) : '';
    form.ngayKT.value = item.ngayKT ? item.ngayKT.substring(0, 16) : '';
  } else {
    document.getElementById('km-modal-title').textContent = 'Thêm Khuyến Mãi Mới';
    form.reset();
    form.maKM.readOnly = false;
    form.maKM.value = 'KM' + String(Date.now()).slice(-3);
    const now = new Date();
    form.ngayBD.value = now.toISOString().substring(0, 16);
    const future = new Date(now.getTime() + 30*24*3600*1000);
    form.ngayKT.value = future.toISOString().substring(0, 16);
  }
  modal.classList.remove('hidden');
}

async function editKhuyenMai(maKM) {
  try {
    const km = await api.get('/khuyenmai/' + encodeURIComponent(maKM));
    openKhuyenMaiModal(km);
  } catch (e) {
    alert('Không thể tải khuyến mãi: ' + e.message);
  }
}

async function saveKhuyenMai(e) {
  e.preventDefault();
  const form = e.target;
  const isEdit = form.maKM.readOnly;
  const payload = {
    maKM: form.maKM.value.trim(),
    tenKM: form.tenKM.value.trim(),
    phanTramGiam: Number(form.phanTramGiam.value),
    ngayBD: form.ngayBD.value,
    ngayKT: form.ngayKT.value,
    tamDung: false
  };
  try {
    if (isEdit) {
      await api.put('/khuyenmai/' + encodeURIComponent(payload.maKM), payload);
      showToast('Đã cập nhật khuyến mãi ' + payload.maKM, 'success');
    } else {
      await api.post('/khuyenmai', payload);
      showToast('Đã thêm khuyến mãi mới', 'success');
    }
    closeModal('modal-khuyenmai');
    renderKhuyenMaiTable();
  } catch (err) {
    alert('Lỗi lưu khuyến mãi: ' + err.message);
  }
}

async function deleteKhuyenMai(maKM) {
  if (!confirm('Bạn có chắc muốn xóa khuyến mãi ' + maKM + '?')) return;
  try {
    await api.delete('/khuyenmai/' + encodeURIComponent(maKM));
    showToast('Đã xóa khuyến mãi ' + maKM, 'success');
    renderKhuyenMaiTable();
  } catch (err) {
    alert('Lỗi xóa khuyến mãi: ' + err.message);
  }
}

// 5. THAM SỐ HỆ THỐNG
async function renderThamSoTable() {
  const tbody = document.getElementById('table-thamso-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Đang tải tham số hệ thống...</td></tr>';
  try {
    const list = await api.get('/thamso');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">Không có tham số nào</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(ts => `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${ts.maThamSo}</td>
        <td class="p-3.5 font-bold text-sm text-navy">${ts.tenThamSo || ts.maThamSo}</td>
        <td class="p-3.5 font-mono font-bold text-sm text-emerald-700 text-right whitespace-nowrap">${ts.giaTri} ${ts.donVi || ''}</td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap">
          <button onclick="editThamSo('${ts.maThamSo}', ${ts.giaTri}, '${ts.donVi || ''}')" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-bold text-xs transition-colors">Sửa giá trị</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-rose-500">Lỗi tải tham số: ${err.message}</td></tr>`;
  }
}

async function editThamSo(maTS, currentValue, donVi) {
  const newVal = prompt(`Cập nhật giá trị mới cho tham số ${maTS} (${donVi}):`, currentValue);
  if (newVal === null || newVal.trim() === '') return;
  const num = Number(newVal);
  if (isNaN(num) || num < 0) {
    alert('Giá trị tham số phải là số không âm');
    return;
  }
  try {
    await api.put('/thamso/' + encodeURIComponent(maTS), { maThamSo: maTS, giaTri: num, donVi: donVi });
    showToast(`Đã cập nhật tham số ${maTS} thành công`, 'success');
    renderThamSoTable();
  } catch (e) {
    alert('Không thể cập nhật tham số: ' + e.message);
  }
}

// 6. TRA CỨU BẢO HÀNH ACTION
async function traCuuBaoHanhAction() {
  const input = document.getElementById('tracuu-imei-input') || document.querySelector('input[placeholder*="IMEI"]');
  const imei = input ? input.value.trim() : '';
  if (!imei) {
    alert('Vui lòng nhập số IMEI 15 chữ số để tra cứu');
    return;
  }
  const resultBox = document.getElementById('tracuu-baohanh-result');
  if (resultBox) {
    resultBox.innerHTML = '<div class="p-4 text-center text-slate-500">Đang tra cứu từ máy chủ...</div>';
    resultBox.classList.remove('hidden');
  }
  try {
    const res = await api.get('/baohanh/trangthai/' + encodeURIComponent(imei));
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-navy text-sm">${res.tenHang || 'Thiết bị chính hãng'}</span>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${res.trangThai === 'con_han' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${res.trangThai === 'con_han' ? 'Còn hạn bảo hành' : 'Hết hạn bảo hành'}
            </span>
          </div>
          <div class="text-xs text-slate-600 grid grid-cols-2 gap-2">
            <div>Mã sổ: <strong>${res.maBH}</strong></div>
            <div>Số IMEI: <strong class="font-mono">${res.soIMEI}</strong></div>
            <div>Bắt đầu: <strong>${res.ngayBD ? res.ngayBD.substring(0, 10) : '-'}</strong></div>
            <div>Hết hạn: <strong>${res.ngayKT ? res.ngayKT.substring(0, 10) : '-'}</strong></div>
          </div>
          <div class="text-xs font-bold text-emerald-700">Thời gian bảo hành còn lại: ${res.soNgayConLai || 0} ngày</div>
        </div>
      `;
    }
  } catch (err) {
    if (resultBox) {
      resultBox.innerHTML = `<div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">Không tìm thấy thông tin bảo hành cho IMEI: ${imei}</div>`;
    } else {
      alert('Không tìm thấy thông tin bảo hành cho IMEI ' + imei);
    }
  }
}

// EXPORT TẤT CẢ HÀM LÊN WINDOW ĐỂ BẢO ĐẢM ONCLICK TỪ HTML LUÔN GỌI ĐƯỢC
window.renderNhaCungCapTable = renderNhaCungCapTable;
window.openNhaCungCapModal = openNhaCungCapModal;
window.editNhaCungCap = editNhaCungCap;
window.saveNhaCungCap = saveNhaCungCap;
window.deleteNhaCungCap = deleteNhaCungCap;

window.openKhachHangModal = openKhachHangModal;
window.editKhachHang = editKhachHang;
window.saveKhachHang = saveKhachHang;
window.deleteKhachHang = deleteKhachHang;

window.openNhanVienModal = openNhanVienModal;
window.editNhanVien = editNhanVien;
window.saveNhanVien = saveNhanVien;
window.deleteNhanVien = deleteNhanVien;

window.openKhuyenMaiModal = openKhuyenMaiModal;
window.editKhuyenMai = editKhuyenMai;
window.saveKhuyenMai = saveKhuyenMai;
window.deleteKhuyenMai = deleteKhuyenMai;

window.renderThamSoTable = renderThamSoTable;
window.editThamSo = editThamSo;
window.traCuuBaoHanhAction = traCuuBaoHanhAction;
window.traCuuBaoHanhIMEI = traCuuBaoHanhAction;

window.openMatHangModal = openMatHangModal;
window.editMatHang = editMatHang;
window.saveMatHang = saveMatHang;
window.deleteMatHang = deleteMatHang;

window.approveOrder = approveOrder;
window.shipOrder = shipOrder;
window.cancelOrder = cancelOrder;
window.completeOrder = completeOrder;

window.openLapHoaDonModal = openLapHoaDonModal;
window.saveLapHoaDon = saveLapHoaDon;
window.viewHoaDonDetail = viewHoaDonDetail;
window.printInvoiceAction = printInvoiceAction;

window.openNhapKhoModal = openNhapKhoModal;
window.saveNhapKho = saveNhapKho;
window.updateImeiCount = updateImeiCount;
window.viewChiTietNhapKho = viewChiTietNhapKho;

window.openTiepNhanBaoHanhModal = openTiepNhanBaoHanhModal;
window.saveTiepNhanBaoHanh = saveTiepNhanBaoHanh;
window.updateTiepNhanStatus = updateTiepNhanStatus;
window.setBaoHanhStatusFilter = setBaoHanhStatusFilter;
window.handleBaoHanhSearch = handleBaoHanhSearch;
window.refreshBaoHanhTable = refreshBaoHanhTable;
window.changeBaoHanhPageSize = changeBaoHanhPageSize;
window.changeBaoHanhPage = changeBaoHanhPage;

window.openTraHangModal = openTraHangModal;
window.saveTraHang = saveTraHang;

window.openNhomHangModal = openNhomHangModal;
window.saveNhomHang = saveNhomHang;
window.deleteNhomHang = deleteNhomHang;
window.openLoaiHangModal = openLoaiHangModal;
window.saveLoaiHang = saveLoaiHang;
window.deleteLoaiHang = deleteLoaiHang;

window.openThuocTinhModal = openThuocTinhModal;
window.saveThuocTinh = saveThuocTinh;
window.deleteThuocTinh = deleteThuocTinh;
window.openGanSpecsModal = openGanSpecsModal;
window.saveGanSpecs = saveGanSpecs;

window.openTaiKhoanModal = openTaiKhoanModal;
window.saveTaiKhoan = saveTaiKhoan;
window.toggleLockTaiKhoan = toggleLockTaiKhoan;
window.resetMatKhauTaiKhoan = resetMatKhauTaiKhoan;

window.openPhanQuyenModal = openPhanQuyenModal;
window.savePhanQuyen = savePhanQuyen;
window.deletePhanQuyen = deletePhanQuyen;

window.closeModal = closeModal;
window.renderSection = renderSection;
window.renderDashboard = renderDashboard;
window.applyRoleFilter = applyRoleFilter;


window.fillAdminCredentials = function(username, password) {
  const uInput = document.getElementById('admin-login-screen-username');
  const pInput = document.getElementById('admin-login-screen-password');
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;
  const form = document.getElementById('form-admin-login-screen');
  if (form) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }
};

window.toggleAdminPasswordVisibility = function() {
  const pInput = document.getElementById('admin-login-screen-password');
  const icon = document.getElementById('icon-toggle-admin-password');
  if (!pInput) return;
  if (pInput.type === 'password') {
    pInput.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else {
    pInput.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
};

window.viewImeiTimeline = viewImeiTimeline;
window.updatePosImeiOptions = updatePosImeiOptions;


// =========================================================================
// SIGNALR & BROADCAST REALTIME LISTENERS DÀNH CHO ADMIN
// =========================================================================
function handleIncomingAdminOrder(order) {
  if (!order || !order.maDH) return;
  console.log('Admin received real-time new order:', order);

  if (!AdminRealtimeData.orders) AdminRealtimeData.orders = [];
  const exists = AdminRealtimeData.orders.some(o => o.maDH === order.maDH);
  if (!exists) {
    AdminRealtimeData.orders.unshift(order);
    try {
      localStorage.setItem('cellphones_online_orders', JSON.stringify(AdminRealtimeData.orders));
    } catch (err) {}
  }

  // Phát âm thanh chuông báo Web Audio
  if (AdminRealtimeData && typeof AdminRealtimeData.playOrderChime === 'function') {
    AdminRealtimeData.playOrderChime();
  }

  const ten = order.tenNguoiNhan || 'Khách hàng';
  const tien = (typeof Format !== 'undefined' && Format.currency) 
    ? Format.currency(order.tongTien || 0) 
    : ((order.tongTien || 0).toLocaleString('vi-VN') + 'đ');
  showToast('🔔 ĐƠN HÀNG MỚI! ' + ten + ' vừa đặt đơn #' + order.maDH + ' (' + tien + ')', 'info');

  // Vẽ lại bảng đơn hàng và Dashboard ngay tức thì
  if (typeof renderDonHangTable === 'function') {
    renderDonHangTable();
  }
  if (AdminRealtimeData && typeof AdminRealtimeData.refreshUI === 'function') {
    AdminRealtimeData.refreshUI();
  }
}

window.addEventListener('samamobile:new_order', function (e) {
  handleIncomingAdminOrder(e.detail);
});

window.addEventListener('samamobile:order_status_updated', function (e) {
  const data = e.detail;
  if (!data || !data.maDH) return;

  if (AdminRealtimeData.orders) {
    const o = AdminRealtimeData.orders.find(x => x.maDH === data.maDH);
    if (o) {
      o.trangThai = data.trangThai;
      if (data.soHD) o.soHD = data.soHD;
      try {
        localStorage.setItem('cellphones_online_orders', JSON.stringify(AdminRealtimeData.orders));
      } catch (err) {}
      if (typeof renderDonHangTable === 'function') {
        renderDonHangTable();
      }
      if (AdminRealtimeData && typeof AdminRealtimeData.refreshUI === 'function') {
        AdminRealtimeData.refreshUI();
      }
    }
  }
});

// BroadcastChannel cho kết nối liên tab trong cùng trình duyệt với độ trễ 0ms
if (typeof BroadcastChannel !== 'undefined') {
  try {
    const adminBC = new BroadcastChannel('samamobile_orders');
    adminBC.onmessage = function (e) {
      if (e.data && e.data.type === 'new_order' && e.data.order) {
        handleIncomingAdminOrder(e.data.order);
      } else if (e.data && e.data.type === 'orders_updated' && Array.isArray(e.data.orders) && e.data.orders.length > 0) {
        handleIncomingAdminOrder(e.data.orders[0]);
      }
    };
  } catch (err) {}
}
