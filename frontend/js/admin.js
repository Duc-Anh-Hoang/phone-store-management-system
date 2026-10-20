/**
 * ADMIN PORTAL JAVASCRIPT - QUẢN LÝ CỬA HÀNG ĐIỆN THOẠI
 * Hỗ trợ: Giao diện Cập nhật dữ liệu, Xử lý dữ liệu & Báo cáo thống kê
 * Dựa trên cấu trúc CSDL QuanLyCuaHangDienThoai (Table.sql & Code.sql)
 */

// DỮ LIỆU KHỞI TẠO BAN ĐẦU THEO CSDL
const InitialDatabase = {
  // 1. Mặt hàng
  matHang: [
    { maHang: 'MH001', tenHang: 'iPhone 16 Pro Max 256GB', donGia: 31490000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 28 },
    { maHang: 'MH002', tenHang: 'iPhone 16 Pro Max 512GB', donGia: 36990000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 15 },
    { maHang: 'MH003', tenHang: 'iPhone 16 Pro Max 1TB', donGia: 42490000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 8 },
    { maHang: 'MH004', tenHang: 'iPhone 16 Pro 128GB', donGia: 27990000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 34 },
    { maHang: 'MH005', tenHang: 'Samsung Galaxy S24 Ultra 256GB', donGia: 28490000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH02', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 19 },
    { maHang: 'MH006', tenHang: 'Củ sạc Apple 20W USB-C', donGia: 550000, dvt: 'Cái', maNhom: 'NH02', maLoai: 'LH03', quanLyImei: false, thoiHanBaoHanh: 6, tonKho: 120 },
    { maHang: 'MH007', tenHang: 'Ốp lưng MagSafe iPhone 16 Pro Max', donGia: 450000, dvt: 'Cái', maNhom: 'NH02', maLoai: 'LH03', quanLyImei: false, thoiHanBaoHanh: 0, tonKho: 95 }
  ],

  // 2. Nhóm hàng & Loại hàng
  nhomHang: [
    { maNhom: 'NH01', tenNhom: 'Điện thoại di động' },
    { maNhom: 'NH02', tenNhom: 'Phụ kiện chính hãng' },
    { maNhom: 'NH03', tenNhom: 'Thiết bị âm thanh' }
  ],
  loaiHang: [
    { maLoai: 'LH01', tenLoai: 'Apple iPhone' },
    { maLoai: 'LH02', tenLoai: 'Samsung Galaxy' },
    { maLoai: 'LH03', tenLoai: 'Sạc & Cáp' }
  ],

  // 3. Khách hàng
  khachHang: [
    { maKH: 'KH001', hoTen: 'Nguyễn Hoàng Long', sdt: '0987654321', email: 'long.nh@gmail.com', diaChi: '128 Trần Duy Hưng, Cầu Giấy, Hà Nội' },
    { maKH: 'KH002', hoTen: 'Lê Thị Ngọc Mai', sdt: '0912345678', email: 'mai.le@yahoo.com', diaChi: '45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh' },
    { maKH: 'KH003', hoTen: 'Trần Minh Đức', sdt: '0903888999', email: 'duc.tran@outlook.com', diaChi: '23 Nguyễn Văn Linh, Đà Nẵng' }
  ],

  // 4. Nhân viên & Tài khoản
  nhanVien: [
    { maNV: 'NV001', hoTen: 'Nguyễn Văn Quản', chucVu: 'Quản lý', sdt: '0901112233', email: 'quanly@cellphones.com.vn', trangThai: 'dang_lam' },
    { maNV: 'NV002', hoTen: 'Trần Thị Thu Ngân', chucVu: 'Thu ngân', sdt: '0902223344', email: 'thungan@cellphones.com.vn', trangThai: 'dang_lam' },
    { maNV: 'NV003', hoTen: 'Lê Văn Bán Hàng', chucVu: 'Bán hàng', sdt: '0903334455', email: 'banhang@cellphones.com.vn', trangThai: 'dang_lam' },
    { maNV: 'NV004', hoTen: 'Phạm Kỹ Thuật', chucVu: 'Kỹ thuật & Bảo hành', sdt: '0904445566', email: 'kythuat@cellphones.com.vn', trangThai: 'dang_lam' }
  ],

  // 5. Nhà cung cấp
  nhaCungCap: [
    { maNCC: 'NCC01', tenNCC: 'Công ty TNHH Apple Việt Nam', sdt: '02838222333', email: 'contact@apple.vn', diaChi: 'Tòa nhà Deutsches Haus, TP.HCM' },
    { maNCC: 'NCC02', tenNCC: 'Công ty CP Phân Phối Synnex FPT', sdt: '02473006666', email: 'synnex@fpt.com.vn', diaChi: 'Tòa nhà FPT, Cầu Giấy, Hà Nội' }
  ],

  // 6. Khuyến mãi
  khuyenMai: [
    { maKM: 'KM01', tenKM: 'Mở bán siêu phẩm iPhone 16', phanTramGiam: 10, ngayBD: '2026-10-01', ngayKT: '2026-10-31', tamDung: false },
    { maKM: 'KM02', tenKM: 'Ưu đãi thanh toán QR Napas', phanTramGiam: 2, ngayBD: '2026-09-15', ngayKT: '2026-11-15', tamDung: false }
  ],

  // 7. Tham số hệ thống
  thamSo: [
    { maThamSo: 'VAT_PHANTRAM', tenThamSo: 'Thuế VAT đã gồm trong giá bán', giaTri: 10, donVi: '%' },
    { maThamSo: 'DIEM_MOI_VND', tenThamSo: 'Số tiền chi tiêu để được 1 điểm', giaTri: 100000, donVi: 'VND' },
    { maThamSo: 'HAN_DOITRA_NGAY', tenThamSo: 'Hạn đổi trả tính từ ngày lập hóa đơn', giaTri: 30, donVi: 'ngày' }
  ],

  // 8. Đơn hàng online (Xử lý dữ liệu)
  donHangOnline: [
    {
      maDH: 'DH100234',
      ngayDat: '2026-10-12 08:15',
      maKH: 'KH001',
      tenNguoiNhan: 'Nguyễn Hoàng Long',
      sdtNguoiNhan: '0987654321',
      diaChiGiao: '128 Trần Duy Hưng, Cầu Giấy, Hà Nội',
      phuongThucThanhToan: 'cod',
      tongTien: 31490000,
      trangThai: 'cho_xac_nhan',
      maHang: 'MH001',
      tenHang: 'iPhone 16 Pro Max 256GB (Sa Mạc)',
      soLuong: 1
    },
    {
      maDH: 'DH100230',
      ngayDat: '2026-10-11 16:40',
      maKH: 'KH002',
      tenNguoiNhan: 'Lê Thị Ngọc Mai',
      sdtNguoiNhan: '0912345678',
      diaChiGiao: '45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh',
      phuongThucThanhToan: 'chuyen_khoan',
      tongTien: 36990000,
      trangThai: 'da_xac_nhan',
      maHang: 'MH002',
      tenHang: 'iPhone 16 Pro Max 512GB (Tự Nhiên)',
      soLuong: 1
    },
    {
      maDH: 'DH100215',
      ngayDat: '2026-10-10 11:20',
      maKH: 'KH003',
      tenNguoiNhan: 'Trần Minh Đức',
      sdtNguoiNhan: '0903888999',
      diaChiGiao: '23 Nguyễn Văn Linh, Đà Nẵng',
      phuongThucThanhToan: 'the',
      tongTien: 31490000,
      trangThai: 'hoan_thanh',
      maHang: 'MH001',
      tenHang: 'iPhone 16 Pro Max 256GB (Đen)',
      soLuong: 1
    }
  ],

  // 9. Hóa đơn bán hàng
  hoaDon: [
    { soHD: 'HD00891', ngayLap: '2026-10-11 10:30', maKH: 'KH002', tenKH: 'Lê Thị Ngọc Mai', maNV: 'NV002', kenhBan: 'tai_quay', tongTien: 36990000, tienGiamGia: 3699000, thanhTien: 33291000, phuongThuc: 'chuyen_khoan', maImei: '356789123456781' },
    { soHD: 'HD00890', ngayLap: '2026-10-10 15:45', maKH: 'KH003', tenKH: 'Trần Minh Đức', maNV: 'NV002', kenhBan: 'online', tongTien: 31490000, tienGiamGia: 3149000, thanhTien: 28341000, phuongThuc: 'the', maImei: '356789123456782' }
  ],

  // 10. Phiếu bảo hành & Tiếp nhận
  baoHanh: [
    { maBH: 'BH001', soHD: 'HD00891', maImei: '356789123456781', tenHang: 'iPhone 16 Pro Max 512GB', ngayBD: '2026-10-11', thoiHanThang: 12, ngayKT: '2027-10-11' },
    { maBH: 'BH002', soHD: 'HD00890', maImei: '356789123456782', tenHang: 'iPhone 16 Pro Max 256GB', ngayBD: '2026-10-10', thoiHanThang: 12, ngayKT: '2027-10-10' }
  ],
  tiepNhanBaoHanh: [
    { maTN: 'TN001', maBH: 'BH001', soImei: '356789123456781', ngayNhan: '2026-10-12 09:00', tinhTrangLoi: 'Loa trong hơi rè khi đàm thoại', nvTiepNhan: 'NV004', nvKyThuat: 'NV004', ngayHenTra: '2026-10-14', chiPhi: 0, trangThai: 'dang_sua' }
  ],

  // 11. Phiếu nhập & IMEI
  phieuNhap: [
    { soPN: 'PN001', ngayNhap: '2026-10-01 09:30', maNCC: 'NCC01', tenNCC: 'Công ty TNHH Apple Việt Nam', maNV: 'NV001', slNhap: 50, tongTienNhap: 1450000000 }
  ],
  danhSachImei: [
    { maImei: 'IMEI001', soImei: '356789123456781', maHang: 'MH001', tenHang: 'iPhone 16 Pro Max 256GB', soPN: 'PN001', trangThai: 'da_ban' },
    { maImei: 'IMEI002', soImei: '356789123456782', maHang: 'MH001', tenHang: 'iPhone 16 Pro Max 256GB', soPN: 'PN001', trangThai: 'da_ban' },
    { maImei: 'IMEI003', soImei: '356789123456783', maHang: 'MH001', tenHang: 'iPhone 16 Pro Max 256GB', soPN: 'PN001', trangThai: 'con_hang' },
    { maImei: 'IMEI004', soImei: '356789123456784', maHang: 'MH002', tenHang: 'iPhone 16 Pro Max 512GB', soPN: 'PN001', trangThai: 'con_hang' },
    { maImei: 'IMEI005', soImei: '356789123456785', maHang: 'MH003', tenHang: 'iPhone 16 Pro Max 1TB', soPN: 'PN001', trangThai: 'con_hang' }
  ],

  // 12. Đổi trả hàng
  traHang: [
    { maTR: 'TR001', soHD: 'HD00870', maImei: '356789123456700', ngayTR: '2026-10-09', lyDo: 'Lỗi cảm ứng màn hình nhà sản xuất', hinhThuc: 'doi_hang', maNV: 'NV001' }
  ],

  // 13. Thuộc tính & Chi tiết thuộc tính (FR06)
  thuocTinh: [
    { maThuocTinh: 'TT01', tenThuocTinh: 'Dung lượng RAM' },
    { maThuocTinh: 'TT02', tenThuocTinh: 'Bộ nhớ trong (ROM)' },
    { maThuocTinh: 'TT03', tenThuocTinh: 'Màn hình & Tần số quét' },
    { maThuocTinh: 'TT04', tenThuocTinh: 'Chip xử lý (CPU/GPU)' },
    { maThuocTinh: 'TT05', tenThuocTinh: 'Dung lượng Pin & Sạc nhanh' }
  ],
  chiTietThuocTinh: [
    { maHang: 'MH001', maThuocTinh: 'TT01', giaTri: '8GB Unified RAM' },
    { maHang: 'MH001', maThuocTinh: 'TT02', giaTri: '256GB NVMe' },
    { maHang: 'MH001', maThuocTinh: 'TT03', giaTri: '6.9" Super Retina XDR OLED 120Hz' },
    { maHang: 'MH001', maThuocTinh: 'TT04', giaTri: 'Apple A19 Pro 3nm Bionic' },
    { maHang: 'MH001', maThuocTinh: 'TT05', giaTri: '4685 mAh, Sạc nhanh 35W' },
    { maHang: 'MH002', maThuocTinh: 'TT01', giaTri: '8GB Unified RAM' },
    { maHang: 'MH002', maThuocTinh: 'TT02', giaTri: '512GB NVMe' },
    { maHang: 'MH002', maThuocTinh: 'TT03', giaTri: '6.9" Super Retina XDR OLED 120Hz' },
    { maHang: 'MH002', maThuocTinh: 'TT04', giaTri: 'Apple A19 Pro 3nm Bionic' },
    { maHang: 'MH002', maThuocTinh: 'TT05', giaTri: '4685 mAh, Sạc nhanh 35W' },
    { maHang: 'MH005', maThuocTinh: 'TT01', giaTri: '12GB LPDDR5X' },
    { maHang: 'MH005', maThuocTinh: 'TT02', giaTri: '256GB UFS 4.0' },
    { maHang: 'MH005', maThuocTinh: 'TT03', giaTri: '6.8" Dynamic AMOLED 2X 120Hz' },
    { maHang: 'MH005', maThuocTinh: 'TT04', giaTri: 'Snapdragon 8 Gen 3 for Galaxy' },
    { maHang: 'MH005', maThuocTinh: 'TT05', giaTri: '5000 mAh, Sạc nhanh 45W' }
  ],

  // 14. Tài khoản nhân viên (FR04, BR22)
  taiKhoan: [
    { tenDangNhap: 'quanly', maNV: 'NV001', trangThai: 'hoat_dong', ngayTao: '2026-09-01' },
    { tenDangNhap: 'thungan', maNV: 'NV002', trangThai: 'hoat_dong', ngayTao: '2026-09-01' },
    { tenDangNhap: 'banhang', maNV: 'NV003', trangThai: 'hoat_dong', ngayTao: '2026-09-01' },
    { tenDangNhap: 'kythuat', maNV: 'NV004', trangThai: 'hoat_dong', ngayTao: '2026-09-01' }
  ],

  // 15. Phân quyền vai trò (FR05, BR23)
  phanQuyen: [
    { maQuyen: 'PQ01', tenQuyen: 'Quản lý', moTa: 'Toàn quyền điều hành, phân quyền và cấu hình tham số', soNhanVien: 1 },
    { maQuyen: 'PQ02', tenQuyen: 'Bán hàng', moTa: 'Bán hàng tại quầy POS, xử lý đơn online, xem tồn kho', soNhanVien: 1 },
    { maQuyen: 'PQ03', tenQuyen: 'Thu ngân', moTa: 'Xem doanh thu, in lại hóa đơn, tiếp nhận đổi trả hàng', soNhanVien: 1 },
    { maQuyen: 'PQ04', tenQuyen: 'Kho', moTa: 'Lập phiếu nhập, sinh mã IMEI 15 số, theo dõi tồn kho, NCC', soNhanVien: 0 },
    { maQuyen: 'PQ05', tenQuyen: 'Kỹ thuật & Bảo hành', moTa: 'Tra cứu hạn bảo hành, tiếp nhận và sửa chữa máy', soNhanVien: 1 }
  ]
};

// ĐỊA CHỈ API BACKEND SPRING BOT
var API_BASE = window.API_BASE = window.API_BASE || ((window.location.protocol === 'file:' || window.location.port === '5500') ? 'http://localhost:8080/api' : '/api');

// QUẢN LÝ STATE VÀ KẾT NỐI BACKEND DATABASE
class AdminStore {
  constructor() {
    this.storageKey = 'cellphones_admin_cache';
    this.data = this.loadLocal();
  }

  loadLocal() {
    let loaded = null;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) loaded = JSON.parse(raw);
    } catch (e) {
      console.warn('Lỗi đọc local store, dùng InitialDatabase:', e);
    }
    const def = JSON.parse(JSON.stringify(InitialDatabase));
    if (!loaded) return def;
    // Tự động đồng bộ các mảng danh mục mới nếu chưa có trong LocalStorage
    if (!loaded.thuocTinh) loaded.thuocTinh = def.thuocTinh;
    if (!loaded.chiTietThuocTinh) loaded.chiTietThuocTinh = def.chiTietThuocTinh;
    if (!loaded.taiKhoan) loaded.taiKhoan = def.taiKhoan;
    if (!loaded.phanQuyen) loaded.phanQuyen = def.phanQuyen;
    if (!loaded.nhomHang) loaded.nhomHang = def.nhomHang;
    if (!loaded.loaiHang) loaded.loaiHang = def.loaiHang;
    return loaded;
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('Không thể lưu admin store:', e);
    }
  }

  async syncFromBackend() {
    try {
      const res = await fetch(API_BASE + '/mathang');
      if (res.ok) {
        const mh = await res.json();
        if (Array.isArray(mh) && mh.length > 0) {
          this.data.matHang = mh;
          this.save();
        }
      }
    } catch (e) {
      // Offline fallback silent
    }
  }
}

const store = new AdminStore();

// CÁC HÀM TIỆN ÍCH ĐỊNH DẠNG (FORMATTERS)
const Format = {
  currency(val) {
    if (val === null || val === undefined) return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
  },

  date(d) {
    if (!d) return '-';
    return d.toString();
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
  'BANHANG': ['view-donhang', 'view-tonkho', 'view-imei', 'view-hoadon', 'view-hoadon-list', 'view-khachhang'],
  'THUNGAN': ['view-hoadon', 'view-hoadon-list', 'view-trahang'],
  'KHO': ['view-nhacungcap', 'view-nhapkho', 'view-imei', 'view-tonkho'],
  'KYTHUAT': ['view-baohanh', 'view-tracuu-baohanh']
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

  // Cập nhật trạng thái active sidebar (Phong cách #80ffbf: nền #eafff5, viền #80ffbf, chữ #064e29)
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    const isTarget = link.getAttribute('data-target') === sectionId || link.getAttribute('data-target') === currentActiveSection;
    const icon = link.querySelector('i');
    if (isTarget) {
      link.classList.add('bg-[#eafff5]', 'text-[#064e29]', 'font-bold', 'border-l-4', 'border-[#80ffbf]');
      link.classList.remove('text-slate-600', 'hover:bg-[#F9FAFB]', 'hover:text-slate-900', 'text-slate-300', 'hover:bg-slate-800', 'hover:text-white', 'bg-blue-600', 'text-white', 'bg-[#F0FDF4]', 'text-[#15803D]', 'bg-[#dbf9eb]', 'text-[#00483d]');
      if (icon) {
        icon.classList.remove('text-slate-400');
        icon.classList.add('text-[#064e29]');
      }
    } else {
      link.classList.remove('bg-[#eafff5]', 'text-[#064e29]', 'font-bold', 'border-l-4', 'border-[#80ffbf]', 'bg-[#dbf9eb]', 'text-[#00483d]', 'bg-blue-600', 'text-white', 'bg-[#F0FDF4]', 'text-[#15803D]');
      link.classList.add('text-slate-600', 'hover:bg-[#F9FAFB]', 'hover:text-slate-900');
      if (icon) {
        icon.classList.remove('text-[#064e29]', 'text-[#0a4a1f]', 'text-[#00483d]', 'text-[#15803D]');
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
// 1. DASHBOARD
// -------------------------------------------------------------
async function renderDashboard() {
  try {
    const [th, dt, orders] = await Promise.all([
      api.get('/thongke/tonghop'),
      api.get('/thongke/doanhthu').catch(() => []),
      api.get('/donhangonline').catch(() => [])
    ]);

    const revEl = document.getElementById('dash-revenue');
    if (revEl) revEl.textContent = Format.currency(th.tongDoanhThu || 0);

    const pendingCount = (orders || []).filter(o => o.trangThai === 'cho_xac_nhan').length;
    const pendingEl = document.getElementById('dash-pending-orders');
    if (pendingEl) pendingEl.textContent = pendingCount + ' đơn';

    const stockEl = document.getElementById('dash-total-stock');
    if (stockEl) stockEl.textContent = (th.tongMatHang || 0) + ' mặt hàng';

    const invoiceEl = document.getElementById('dash-warranty-count');
    if (invoiceEl) invoiceEl.textContent = (th.tongHoaDon || 0) + ' HĐ đã xuất';

    const tbody = document.getElementById('dash-recent-orders-table');
    if (tbody) {
      tbody.innerHTML = (orders || []).slice(0, 5).map(o => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="p-3 font-mono font-bold text-[#15803D] text-xs whitespace-nowrap">${o.maDH}</td>
          <td class="p-3 font-semibold text-xs text-navy whitespace-nowrap">${o.tenNguoiNhan || '-'}</td>
          <td class="p-3 text-xs text-slate-600 min-w-[150px] truncate">${o.diaChiGiao || '-'}</td>
          <td class="p-3 font-bold text-xs text-navy text-right whitespace-nowrap">${Format.currency(o.tongTien)}</td>
          <td class="p-3 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.trangThai)}</td>
          <td class="p-3 text-xs text-right whitespace-nowrap">
            <button onclick="renderSection('view-donhang')" class="px-2.5 py-1 bg-blue-50 text-[#166534] hover:bg-blue-100 font-bold rounded-lg text-xs whitespace-nowrap transition-colors">Xem đơn</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.warn('Lỗi render dashboard:', err);
  }
}

// -------------------------------------------------------------
// 2. MẶT HÀNG (SẢN PHẨM) - CRUD TRỰC TIẾP API BACKEND
// -------------------------------------------------------------
let cachedMatHangList = [];

async function renderMatHangTable(keyword = '') {
  const tbody = document.getElementById('table-mathang-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-500">Đang tải danh sách mặt hàng...</td></tr>';

  try {
    const list = await api.get('/mathang');
    cachedMatHangList = Array.isArray(list) ? list : [];
    const kw = (keyword || '').toLowerCase().trim();
    const items = kw
      ? cachedMatHangList.filter(m => (m.maHang && m.maHang.toLowerCase().includes(kw)) || (m.tenHang && m.tenHang.toLowerCase().includes(kw)))
      : cachedMatHangList;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400">Không tìm thấy mặt hàng nào</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(m => {
      const imeiBadge = m.quanLyIMEI || m.quanLyImei
        ? '<span class="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300/80 font-bold text-xs shrink-0 min-w-[90px] shadow-sm">Quản lý IMEI</span>'
        : '<span class="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300/80 text-xs shrink-0 min-w-[70px] shadow-sm">Không</span>';

      const tonKhoVal = m.tonKho != null ? m.tonKho : 0;
      const tonKhoClass = tonKhoVal > 10 ? 'text-slate-700' : (tonKhoVal > 0 ? 'text-amber-600' : 'text-rose-600');

      return `
      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${m.maHang}</td>
        <td class="p-3.5 font-semibold text-sm text-navy whitespace-nowrap">${m.tenHang}</td>
        <td class="p-3.5 font-bold text-sm text-slate-800 text-right whitespace-nowrap">${Format.currency(m.donGia)}</td>
        <td class="p-3.5 text-xs text-slate-500 text-center whitespace-nowrap">${m.dvt || 'Cái'}</td>
        <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${m.tenNhom || (m.maNhom === 'NH01' ? 'Điện thoại' : 'Phụ kiện')}</td>
        <td class="p-3.5 text-xs text-center whitespace-nowrap">${imeiBadge}</td>
        <td class="p-3.5 text-xs text-center text-slate-600 whitespace-nowrap">${m.thoiHanBaoHanh || 0} tháng</td>
        <td class="p-3.5 text-xs font-bold ${tonKhoClass} text-center whitespace-nowrap">${tonKhoVal}</td>
        <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
          <button onclick="editMatHang('${m.maHang}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="Chỉnh sửa mặt hàng">
            <i class="fa-solid fa-pen-to-square text-[11px]"></i>
            <span>Sửa</span>
          </button>
          <button onclick="deleteMatHang('${m.maHang}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="Xóa mặt hàng">
            <i class="fa-solid fa-trash-can text-[11px]"></i>
            <span>Xóa</span>
          </button>
        </td>
      </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-rose-500">Lỗi tải danh sách mặt hàng: ${err.message}</td></tr>`;
  }
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

  tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-500">Đang tải đơn hàng trực tuyến...</td></tr>';

  try {
    let orders = await api.get('/donhangonline');
    cachedDonHangList = Array.isArray(orders) ? orders : [];
    if (filter !== 'all') {
      orders = cachedDonHangList.filter(o => o.trangThai === filter);
    } else {
      orders = cachedDonHangList;
    }

    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400">Không có đơn hàng nào</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const ngay = o.ngayDat ? o.ngayDat.replace('T', ' ').substring(0, 16) : '-';
      let actions = '';
      if (o.trangThai === 'cho_xac_nhan') {
        actions = `
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="approveOrder('${o.maDH}')" class="px-3 py-1.5 bg-[#80ffbf] hover:bg-[#66e6a5] text-[#061a0f] font-black rounded-xl text-xs transition-colors shadow-sm" title="Duyệt đơn sang Đã xác nhận">
              Duyệt đơn
            </button>
            <button onclick="cancelOrder('${o.maDH}')" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200" title="Hủy đơn">
              Hủy
            </button>
          </div>
        `;
      } else if (o.trangThai === 'da_xac_nhan') {
        actions = `
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="shipOrder('${o.maDH}')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm" title="Chuyển đơn sang Đang giao">
              Giao hàng
            </button>
            <button onclick="cancelOrder('${o.maDH}')" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200" title="Hủy đơn">
              Hủy
            </button>
          </div>
        `;
      } else if (o.trangThai === 'dang_giao') {
        actions = `
          <button onclick="completeOrder('${o.maDH}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm" title="Tạo hóa đơn online & Hoàn thành đơn">
            Thu tiền & Hoàn thành
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

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${o.maDH}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
          <td class="p-3.5 whitespace-nowrap">
            <div class="font-bold text-sm text-navy">${o.tenNguoiNhan || '-'}</div>
            <div class="text-[11px] text-slate-500 font-mono">${o.sdtNguoiNhan || '-'}</div>
          </td>
          <td class="p-3.5 text-xs text-slate-600 max-w-[200px] truncate" title="${o.diaChiGiao || ''}">${o.diaChiGiao || '-'}</td>
          <td class="p-3.5 text-xs text-slate-700 whitespace-nowrap font-medium">${o.soHD ? ('Gắn HĐ ' + o.soHD) : '-'}</td>
          <td class="p-3.5 font-bold text-sm text-navy text-right whitespace-nowrap">${Format.currency(o.tongTien)}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.phuongThucThanhToan)}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.trangThai)}</td>
          <td class="p-3.5 text-xs text-right whitespace-nowrap">${actions}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-rose-500">Lỗi tải đơn hàng: ${err.message}</td></tr>`;
  }
}

function quickApproveOrder(maDH) {
  approveOrder(maDH);
}

async function approveOrder(maDH) {
  try {
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', { trangThai: 'da_xac_nhan' });
    showToast('Đã duyệt xác nhận đơn hàng ' + maDH, 'success');
    await renderDonHangTable();
  } catch (err) {
    alert('Lỗi xác nhận đơn: ' + err.message);
  }
}

async function shipOrder(maDH) {
  try {
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', { trangThai: 'dang_giao' });
    showToast('Đang giao hàng đơn ' + maDH, 'info');
    await renderDonHangTable();
  } catch (err) {
    alert('Lỗi chuyển trạng thái giao hàng: ' + err.message);
  }
}

async function cancelOrder(maDH) {
  if (!confirm('Bạn chắc chắn muốn hủy đơn hàng ' + maDH + '?')) return;
  try {
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', { trangThai: 'da_huy' });
    showToast('Đã hủy đơn hàng ' + maDH, 'warning');
    await renderDonHangTable();
  } catch (err) {
    alert('Lỗi hủy đơn: ' + err.message);
  }
}

async function completeOrder(maDH) {
  try {
    // 1. Lấy thông tin chi tiết đơn hàng
    const order = await api.get('/orders/' + encodeURIComponent(maDH));
    let soHD = order.soHD;

    // 2. Nếu đơn chưa có hóa đơn, tự động tạo hóa đơn KENHBAN='online'
    if (!soHD) {
      const items = order.items || [];
      const chiTietList = [];
      for (const item of items) {
        let selectedImei = null;
        try {
          const availImeis = await api.get('/imei/available/' + encodeURIComponent(item.maHang));
          if (availImeis && availImeis.length > 0) {
            selectedImei = availImeis[0].soIMEI || availImeis[0].soImei;
          }
        } catch (e) {}

        chiTietList.push({
          maHang: item.maHang,
          soIMEI: selectedImei,
          slBan: item.soLuong || 1,
          donGiaBan: item.donGia
        });
      }

      const hdPayload = {
        maKH: order.maKH || null,
        kenhBan: 'online',
        phuongThucThanhToan: (order.phuongThucThanhToan === 'cod') ? 'tien_mat' : order.phuongThucThanhToan,
        chiTiet: chiTietList
      };

      const createdHD = await api.post('/hoadon', hdPayload);
      soHD = createdHD.soHD;
    }

    // 3. Hoàn thành đơn hàng với mã hóa đơn online
    await api.put('/donhangonline/' + encodeURIComponent(maDH) + '/trangthai', {
      trangThai: 'hoan_thanh',
      soHD: soHD
    });

    showToast('Đã hoàn thành đơn hàng ' + maDH + ' (Gắn HĐ ' + soHD + ')', 'success');
    await renderDonHangTable();
    if (typeof renderHoaDonTable === 'function') renderHoaDonTable();
    if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
  } catch (err) {
    alert('Lỗi hoàn thành đơn hàng: ' + err.message);
  }
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
    const products = await api.get('/mathang');
    if (selectMH) {
      selectMH.innerHTML = products.map(m => `
        <option value="${m.maHang}">${m.tenHang} - ${Format.currency(m.donGia)} (Kho: ${m.tonKho != null ? m.tonKho : 0})</option>
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
  if (!selectMH || !selectImei) return;

  const maHang = selectMH.value;
  if (!maHang) {
    selectImei.innerHTML = '<option value="">-- Chưa chọn mặt hàng --</option>';
    return;
  }

  selectImei.innerHTML = '<option value="">Đang tải IMEI khả dụng...</option>';
  try {
    const imeis = await api.get('/imei/available/' + encodeURIComponent(maHang));
    if (!imeis || imeis.length === 0) {
      selectImei.innerHTML = '<option value="">-- Hết IMEI trong kho --</option>';
      selectImei.disabled = true;
    } else {
      selectImei.disabled = false;
      selectImei.innerHTML = imeis.map(i => `
        <option value="${i.soIMEI || i.soImei}">${i.soIMEI || i.soImei} (${i.soPn || i.soPN || 'Lô nhập'})</option>
      `).join('');
    }
  } catch (err) {
    selectImei.innerHTML = `<option value="">Lỗi tải IMEI: ${err.message}</option>`;
  }
}

async function saveLapHoaDon(e) {
  e.preventDefault();
  const form = e.target;
  const tenKH = form.tenKH.value.trim();
  const maHang = document.getElementById('pos-select-mathang').value;
  const selectImei = document.getElementById('pos-select-imei');
  const soImei = selectImei ? selectImei.value : null;
  const phuongThuc = form.phuongThuc.value;

  if (!soImei) {
    alert('Vui lòng chọn số IMEI máy còn trong kho!');
    return;
  }

  const payload = {
    kenhBan: 'tai_quay',
    phuongThucThanhToan: phuongThuc,
    chiTiet: [
      {
        maHang: maHang,
        soIMEI: soImei,
        slBan: 1
      }
    ]
  };

  try {
    const createdHD = await api.post('/hoadon', payload);
    showToast('Xuất hóa đơn POS thành công! Mã HĐ: ' + createdHD.soHD, 'success');
    closeModal('modal-lap-hoadon');
    form.reset();
    await renderHoaDonTable();
    if (typeof renderHoaDonListTable === 'function') renderHoaDonListTable();
    if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
  } catch (err) {
    alert('Lỗi xuất hóa đơn POS: ' + err.message);
  }
}


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

async function saveNhapKho(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    maNCC: form.maNCC.value,
    chiTiet: [
      {
        maHang: form.maHang.value,
        slNhap: Number(form.slNhap.value) || 1,
        donGiaNhap: Number(form.donGiaNhap.value) || 0
      }
    ]
  };

  try {
    const createdPn = await api.post('/phieunhap', payload);
    showToast('Lập phiếu nhập ' + createdPn.soPNhap + ' và sinh IMEI thành công!', 'success');
    closeModal('modal-nhapkho');
    form.reset();
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
// 6. TIẾP NHẬN BẢO HÀNH & SỬA CHỮA (B6 - API TRỰC TIẾP)
// -------------------------------------------------------------
async function renderBaoHanhTable() {
  const tbody = document.getElementById('table-baohanh-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-500">Đang tải phiếu bảo hành...</td></tr>';

  try {
    const list = await api.get('/tiepnhanbaohanh');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400">Chưa có phiếu bảo hành nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(t => {
      const ngay = t.ngayNhan ? t.ngayNhan.replace('T', ' ').substring(0, 16) : '-';
      let actions = '';
      if (t.trangThai === 'tiep_nhan') {
        actions = `
          <button onclick="updateTiepNhanStatus('${t.maTN}', 'dang_sua')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors shadow-sm">
            Sửa chữa
          </button>
          <button onclick="updateTiepNhanStatus('${t.maTN}', 'cho_linh_kien')" class="ml-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors">
            Chờ LK
          </button>
        `;
      } else if (t.trangThai === 'dang_sua' || t.trangThai === 'cho_linh_kien') {
        actions = `
          <button onclick="updateTiepNhanStatus('${t.maTN}', 'hoan_thanh')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm">
            Xong sửa
          </button>
        `;
      } else if (t.trangThai === 'hoan_thanh') {
        actions = `
          <button onclick="updateTiepNhanStatus('${t.maTN}', 'da_tra')" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm">
            Trả máy
          </button>
        `;
      } else {
        actions = '<span class="text-xs text-emerald-600 font-bold">Đã trả khách</span>';
      }

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${t.maTN}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
          <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${t.soIMEI || t.maIMEI || '-'}</td>
          <td class="p-3.5 text-xs text-slate-700 max-w-[200px] truncate" title="${t.tinhTrangLoi || ''}">${t.tinhTrangLoi || '-'}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${t.tenNVTiepNhan || t.maNVTiepNhan || '-'}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${t.tenNVKyThuat || t.maNVKyThuat || 'Chưa phân công'}</td>
          <td class="p-3.5 font-bold text-xs text-right whitespace-nowrap">${Format.currency(t.chiPhi || 0)}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(t.trangThai)}</td>
          <td class="p-3.5 text-xs text-right whitespace-nowrap">${actions}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-rose-500">Lỗi tải bảo hành: ${err.message}</td></tr>`;
  }
}

async function updateTiepNhanStatus(maTN, trangThai) {
  try {
    await api.put('/tiepnhanbaohanh/' + encodeURIComponent(maTN) + '/trangthai', { trangThai });
    showToast('Cập nhật trạng thái bảo hành thành công: ' + trangThai, 'success');
    await renderBaoHanhTable();
  } catch (err) {
    alert('Lỗi cập nhật trạng thái bảo hành: ' + err.message);
  }
}

async function openTiepNhanBaoHanhModal() {
  const modal = document.getElementById('modal-tiepnhan-baohanh');
  if (!modal) return;
  modal.classList.remove('hidden');
}

async function saveTiepNhanBaoHanh(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    soIMEI: form.soIMEI.value.trim(),
    tinhTrangLoi: form.tinhTrangLoi.value.trim(),
    chiPhi: Number(form.chiPhi ? form.chiPhi.value : 0) || 0
  };

  try {
    const res = await api.post('/tiepnhanbaohanh', payload);
    showToast('Đã tiếp nhận bảo hành máy: ' + res.maTN, 'success');
    closeModal('modal-tiepnhan-baohanh');
    form.reset();
    await renderBaoHanhTable();
  } catch (err) {
    alert('Lỗi tiếp nhận bảo hành: ' + err.message);
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
      tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">Chưa có phiếu đổi trả nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(t => {
      const ngay = t.ngayTR ? t.ngayTR.replace('T', ' ').substring(0, 16) : '-';
      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${t.maTR}</td>
          <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${ngay}</td>
          <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${t.soHD || '-'}</td>
          <td class="p-3.5 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">${t.soIMEI || t.maIMEI || '-'}</td>
          <td class="p-3.5 text-xs text-navy font-semibold">${t.tenHang || t.maHang || '-'}</td>
          <td class="p-3.5 text-xs text-slate-600 max-w-[200px] truncate" title="${t.lyDo || ''}">${t.lyDo || '-'}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(t.hinhThucHoanTien)}</td>
          <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${t.tenNhanVien || t.maNV || '-'}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-500">Lỗi tải danh sách đổi trả: ${err.message}</td></tr>`;
  }
}

async function openTraHangModal() {
  const modal = document.getElementById('modal-trahang');
  if (!modal) return;
  modal.classList.remove('hidden');
}

async function saveTraHang(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    soHD: form.soHD.value.trim(),
    soIMEI: form.soIMEI.value.trim(),
    lyDo: form.lyDo.value.trim(),
    hinhThucHoanTien: form.hinhThucHoanTien.value
  };

  try {
    const res = await api.post('/trahang', payload);
    showToast('Tạo phiếu đổi trả ' + res.maTR + ' thành công! IMEI đã chuyển sang trạng thái tra_hang.', 'success');
    closeModal('modal-trahang');
    form.reset();
    await renderTraHangTable();
    if (typeof renderTonKhoTable === 'function') renderTonKhoTable();
    if (typeof renderImeiTable === 'function') renderImeiTable();
  } catch (err) {
    alert('Lỗi tạo phiếu đổi trả: ' + err.message);
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
          <td class="p-3.5 font-extrabold text-sm text-[#15803D] text-right whitespace-nowrap">${diem} điểm</td>
          <td class="p-3.5 font-bold text-xs text-right whitespace-nowrap">${Format.currency(chiTieu)}</td>
          <td class="p-3.5 text-xs text-center whitespace-nowrap">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">${rank}</span>
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
          <span class="text-xs font-semibold text-slate-400">Hệ thống</span>
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

async function renderNhomLoai() {
  const tbodyNhom = document.getElementById('table-nhomhang-body');
  const tbodyLoai = document.getElementById('table-loaihang-body');

  try {
    const [nhomList, loaiList] = await Promise.all([
      api.get('/nhomhang'),
      api.get('/loaihang')
    ]);

    if (tbodyNhom) {
      tbodyNhom.innerHTML = nhomList.map(n => `
        <tr class="border-b border-slate-200">
          <td class="p-3 font-mono font-bold text-xs text-slate-600">${n.maNhom}</td>
          <td class="p-3 font-bold text-sm text-navy">${n.tenNhom}</td>
        </tr>
      `).join('');
    }

    if (tbodyLoai) {
      tbodyLoai.innerHTML = loaiList.map(l => `
        <tr class="border-b border-slate-200">
          <td class="p-3 font-mono font-bold text-xs text-slate-600">${l.maLoai}</td>
          <td class="p-3 font-bold text-sm text-navy">${l.tenLoai}</td>
          <td class="p-3 text-xs text-slate-500">${l.tenNhom || l.maNhom}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.warn('Lỗi tải nhóm/loại:', err);
  }
}

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

// 12. TỒN KHO & IMEI (API TRỰC TIẾP)
// -------------------------------------------------------------
async function renderTonKhoTable() {
  const tbody = document.getElementById('table-tonkho-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">Đang tải dữ liệu tồn kho...</td></tr>';

  try {
    const [matHangList, imeiList] = await Promise.all([
      api.get('/mathang'),
      api.get('/imei').catch(() => [])
    ]);

    tbody.innerHTML = matHangList.map(m => {
      const totalSold = (imeiList || []).filter(i => (i.maHang === m.maHang) && (i.trangThai === 'da_ban')).length;
      const currentStock = m.tonKho != null ? m.tonKho : 0;
      const totalImport = currentStock + totalSold;

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${m.maHang}</td>
          <td class="p-3.5 font-semibold text-sm text-navy">${m.tenHang}</td>
          <td class="p-3.5 text-xs text-slate-500 text-center whitespace-nowrap">${m.dvt || 'Cái'}</td>
          <td class="p-3.5 text-xs font-bold text-slate-700 text-center whitespace-nowrap">${totalImport}</td>
          <td class="p-3.5 text-xs font-bold text-slate-700 text-center whitespace-nowrap">${totalSold}</td>
          <td class="p-3.5 text-xs font-bold ${currentStock > 10 ? 'text-slate-700' : 'text-amber-600'} text-center whitespace-nowrap">${currentStock}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-500">Lỗi tải dữ liệu tồn kho: ${err.message}</td></tr>`;
  }
}

async function renderImeiTable(keyword = '') {
  const tbody = document.getElementById('table-imei-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">Đang tải danh sách IMEI...</td></tr>';

  try {
    const imeiList = await api.get('/imei');
    const kw = (keyword || '').toLowerCase().trim();
    const list = kw
      ? imeiList.filter(i => (i.soIMEI && i.soIMEI.includes(kw)) || (i.tenHang && i.tenHang.toLowerCase().includes(kw)) || (i.maIMEI && i.maIMEI.toLowerCase().includes(kw)))
      : imeiList;

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
    let list = await api.get('/hoadon');
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
    const h = await api.get('/hoadon/' + encodeURIComponent(soHD));
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
          <span>${activeTicket ? 'Thiết bị đang trong quá trình sửa chữa bảo hành (BR16)' : 'Không có yêu cầu bảo hành mở nào'}</span>
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
function viewImeiTimeline(soImei) {
  const imeiObj = store.data.danhSachImei.find(i => i.soImei === soImei);
  if (!imeiObj) return;

  const pn = store.data.phieuNhap.find(p => p.soPN === imeiObj.soPN);
  const hd = store.data.hoaDon.find(h => h.maImei === soImei);
  const bh = store.data.baoHanh.find(b => b.maImei === soImei);
  const tr = store.data.traHang.find(t => t.maImei === soImei);
  const tn = store.data.tiepNhanBaoHanh.filter(t => t.soImei === soImei);

  document.getElementById('timeline-imei-title').textContent = 'Vòng Đời Thiết Bị: ' + soImei;

  const body = document.getElementById('timeline-imei-body');
  if (!body) return;

  body.innerHTML = `
    <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      
      <!-- Giai đoạn 1: Nhập kho -->
      <div class="relative">
        <span class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-box"></i></span>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-navy">1. Nhập kho từ Nhà cung cấp</span>
            <span class="text-slate-400 font-mono">${pn ? pn.ngayNhap : '2026-10-01'}</span>
          </div>
          <div class="text-[11px] text-slate-600 mt-1">
            Số phiếu nhập: <strong class="font-mono text-[#15803D]">${imeiObj.soPN}</strong><br>
            Nhà cung cấp: <strong>${pn ? pn.tenNCC : 'Apple Việt Nam'}</strong><br>
            Thiết bị: <strong>${imeiObj.tenHang}</strong>
          </div>
        </div>
      </div>

      <!-- Giai đoạn 2: Xuất bán -->
      <div class="relative">
        <span class="absolute -left-6 top-0 w-5 h-5 rounded-full ${hd ? 'bg-emerald-600' : 'bg-slate-300'} text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-receipt"></i></span>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-navy">2. Xuất bán cho khách hàng</span>
            <span class="text-slate-400 font-mono">${hd ? hd.ngayLap : 'Chưa xuất bán'}</span>
          </div>
          ${hd ? `
            <div class="text-[11px] text-slate-600 mt-1">
              Số hóa đơn: <strong class="font-mono text-[#15803D]">${hd.soHD}</strong> (${hd.kenhBan === 'tai_quay' ? 'Tại Quầy' : 'Online'})<br>
              Khách hàng: <strong>${hd.tenKH}</strong><br>
              Tổng thanh toán: <strong class="text-[#166534]">${Format.currency(hd.thanhTien)}</strong> (${hd.phuongThuc})
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
              <span class="font-bold text-navy">3. Kích hoạt bảo hành điện tử (BR12)</span>
              <span class="text-slate-400 font-mono">${bh.ngayBD}</span>
            </div>
            <div class="text-[11px] text-slate-600 mt-1">
              Mã bảo hành: <strong class="font-mono text-indigo-600">${bh.maBH}</strong><br>
              Thời hạn: <strong>${bh.thoiHanThang} Tháng</strong> (Hết hạn: <strong class="text-slate-800">${bh.ngayKT}</strong>)
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
              <span class="font-bold text-rose-800">4. Phát sinh đổi trả hàng (BR14)</span>
              <span class="text-slate-400 font-mono">${tr.ngayTR}</span>
            </div>
            <div class="text-[11px] text-rose-700 mt-1">
              Mã phiếu trả: <strong class="font-mono">${tr.maTR}</strong><br>
              Lý do: <em>"${tr.lyDo}"</em><br>
              Hình thức xử lý: <strong class="uppercase">${tr.hinhThuc}</strong>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Giai đoạn 5: Sửa chữa bảo hành (nếu có) -->
      ${tn.length > 0 ? tn.map((t, idx) => `
        <div class="relative">
          <span class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-wrench"></i></span>
          <div class="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-amber-900">Tiếp nhận sửa chữa (${t.maTN})</span>
              <span class="text-slate-400 font-mono">${t.ngayNhan}</span>
            </div>
            <div class="text-[11px] text-amber-800 mt-1">
              Lỗi: <em>"${t.tinhTrangLoi}"</em><br>
              Kỹ thuật: <strong>${t.nvKyThuat}</strong> | Trạng thái: <strong>${t.trangThai === 'dang_sua' ? 'Đang sửa chữa' : 'Đã trả máy'}</strong>
            </div>
          </div>
        </div>
      `).join('') : ''}

    </div>
  `;

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
        <span class="text-slate-400 uppercase text-[10px] font-bold block">Điểm Thưởng Tích Lũy (BR21)</span>
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

  if (tbodyNhom) {
    tbodyNhom.innerHTML = store.data.nhomHang.map(n => {
      const modelCount = store.data.matHang.filter(m => m.maNhom === n.maNhom).length;
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="p-3 font-mono font-bold text-[#15803D]">${n.maNhom}</td>
          <td class="p-3 font-bold text-slate-800">${n.tenNhom}</td>
          <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">${modelCount} model</span></td>
          <td class="p-3 text-right space-x-1">
            <button onclick="openNhomHangModal('${n.maNhom}')" class="px-2.5 py-1 bg-[#F0FDF4] text-[#15803D] hover:bg-[#16A34A] hover:text-white rounded-lg text-xs font-bold transition-colors">Sửa</button>
            <button onclick="deleteNhomHang('${n.maNhom}')" class="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-colors">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (tbodyLoai) {
    tbodyLoai.innerHTML = store.data.loaiHang.map(l => {
      const modelCount = store.data.matHang.filter(m => m.maLoai === l.maLoai).length;
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="p-3 font-mono font-bold text-indigo-600">${l.maLoai}</td>
          <td class="p-3 font-bold text-slate-800">${l.tenLoai}</td>
          <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">${modelCount} model</span></td>
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
    alert('Không còn nhân viên nào chưa có tài khoản (BR22: Mỗi nhân viên tối đa 1 tài khoản).');
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
// KHỞI ĐỘNG TRANG ADMIN
// =============================================================
function initAdminDashboard() {
  initNavigation();
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

  // Kiểm tra quyền truy cập: Chỉ nhân viên/Admin mới được vào admin.html
  if (window.cellphonesAuth) {
    const curUser = window.cellphonesAuth.getUser();
    if (curUser) {
      if (curUser.type === 'customer') {
        const warnBox = document.createElement('div');
        warnBox.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm';
        warnBox.innerHTML = `
          <div class="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div class="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800">Khu Vực Quản Trị Hệ Thống</h3>
            <p class="text-xs text-slate-600">Bạn đang đăng nhập bằng tài khoản Khách hàng <strong>(${curUser.hoTen || curUser.sdt})</strong>.<br>Khu vực này chỉ dành cho Nhân viên & Quản lý cửa hàng.</p>
            <div class="flex gap-2 pt-2">
              <a href="/home" class="flex-1 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-xs hover:bg-blue-700 transition-colors">Về Trang Người Dùng</a>
              <button onclick="window.cellphonesAuth.logout();" class="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors">Đổi Tài Khoản</button>
            </div>
          </div>
        `;
        document.body.appendChild(warnBox);
      } else {
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

        // PHÂN QUYỀN HIỂN THỊ MENU THEO ROLE (KẾ HOẠCH MỤC 4)
        applyRolePermissions(curUser.username || curUser.tenQuyen);

        let detectedRole = 'quanly';
        const lowerU = (curUser.username || curUser.tenQuyen || '').toLowerCase();
        if (lowerU.includes('banhang') || lowerU.includes('bán hàng')) detectedRole = 'banhang';
        else if (lowerU.includes('thungan') || lowerU.includes('thu ngân')) detectedRole = 'thungan';
        else if (lowerU.includes('kho')) detectedRole = 'kho';
        else if (lowerU.includes('kythuat') || lowerU.includes('kỹ thuật')) detectedRole = 'kythuat';

        const roleSel = document.getElementById('admin-role-selector');
        if (roleSel) roleSel.value = detectedRole;
      }
    } else {
      // Mặc định hiển thị đầy đủ menu Admin khi vào trang quản trị
      applyRolePermissions('admin');
      const roleSel = document.getElementById('admin-role-selector');
      if (roleSel) roleSel.value = 'quanly';
    }
  } else {
    applyRolePermissions('admin');
    const roleSel = document.getElementById('admin-role-selector');
    if (roleSel) roleSel.value = 'quanly';
  }

  // Tự động đồng bộ toàn bộ cơ sở dữ liệu từ Backend Spring Boot
  store.syncFromBackend();

  // Lắng nghe tìm kiếm mặt hàng
  const searchMatHang = document.getElementById('search-mathang-input');
  if (searchMatHang) {
    searchMatHang.addEventListener('input', (e) => {
      renderMatHangTable(e.target.value);
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
  document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
  initAdminDashboard();
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
window.viewChiTietNhapKho = viewChiTietNhapKho;

window.openTiepNhanBaoHanhModal = openTiepNhanBaoHanhModal;
window.saveTiepNhanBaoHanh = saveTiepNhanBaoHanh;
window.updateTiepNhanStatus = updateTiepNhanStatus;

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
