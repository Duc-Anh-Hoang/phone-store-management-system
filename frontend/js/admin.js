/**
 * ADMIN PORTAL JAVASCRIPT - QUẢN LÝ CỬA HÀNG ĐIỆN THOẠI
 * Hỗ trợ: Giao diện Cập nhật dữ liệu, Xử lý dữ liệu & Báo cáo thống kê
 * Dựa trên cấu trúc CSDL QuanLyCuaHangDienThoai (Table.sql & Code.sql)
 */

// DỮ LIỆU KHỞI TẠO BAN ĐẦU THEO CSDL
const InitialDatabase = {
  // 1. Mặt hàng
  matHang: [
    { maHang: 'MH001', tenHang: 'iPhone 18 Pro Max 256GB', donGia: 31490000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 28 },
    { maHang: 'MH002', tenHang: 'iPhone 18 Pro Max 512GB', donGia: 36990000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 15 },
    { maHang: 'MH003', tenHang: 'iPhone 18 Pro Max 1TB', donGia: 42490000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 8 },
    { maHang: 'MH004', tenHang: 'iPhone 18 Pro 128GB', donGia: 27990000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH01', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 34 },
    { maHang: 'MH005', tenHang: 'Samsung Galaxy S24 Ultra 256GB', donGia: 28490000, dvt: 'Cái', maNhom: 'NH01', maLoai: 'LH02', quanLyImei: true, thoiHanBaoHanh: 12, tonKho: 19 },
    { maHang: 'MH006', tenHang: 'Củ sạc Apple 20W USB-C', donGia: 550000, dvt: 'Cái', maNhom: 'NH02', maLoai: 'LH03', quanLyImei: false, thoiHanBaoHanh: 6, tonKho: 120 },
    { maHang: 'MH007', tenHang: 'Ốp lưng MagSafe iPhone 18 Pro Max', donGia: 450000, dvt: 'Cái', maNhom: 'NH02', maLoai: 'LH03', quanLyImei: false, thoiHanBaoHanh: 0, tonKho: 95 }
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
    { maNV: 'NV001', hoTen: 'Nguyễn Văn Quản', chucVu: 'Quản lý', sdt: '0901112233', email: 'quanly@titanstore.vn', trangThai: 'dang_lam' },
    { maNV: 'NV002', hoTen: 'Trần Thị Thu Ngân', chucVu: 'Thu ngân', sdt: '0902223344', email: 'thungan@titanstore.vn', trangThai: 'dang_lam' },
    { maNV: 'NV003', hoTen: 'Lê Văn Bán Hàng', chucVu: 'Bán hàng', sdt: '0903334455', email: 'banhang@titanstore.vn', trangThai: 'dang_lam' },
    { maNV: 'NV004', hoTen: 'Phạm Kỹ Thuật', chucVu: 'Kỹ thuật & Bảo hành', sdt: '0904445566', email: 'kythuat@titanstore.vn', trangThai: 'dang_lam' }
  ],

  // 5. Nhà cung cấp
  nhaCungCap: [
    { maNCC: 'NCC01', tenNCC: 'Công ty TNHH Apple Việt Nam', sdt: '02838222333', email: 'contact@apple.vn', diaChi: 'Tòa nhà Deutsches Haus, TP.HCM' },
    { maNCC: 'NCC02', tenNCC: 'Công ty CP Phân Phối Synnex FPT', sdt: '02473006666', email: 'synnex@fpt.com.vn', diaChi: 'Tòa nhà FPT, Cầu Giấy, Hà Nội' }
  ],

  // 6. Khuyến mãi
  khuyenMai: [
    { maKM: 'KM01', tenKM: 'Mở bán siêu phẩm iPhone 18', phanTramGiam: 10, ngayBD: '2026-10-01', ngayKT: '2026-10-31', tamDung: false },
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
      tenHang: 'iPhone 18 Pro Max 256GB (Titan Sa Mạc)',
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
      tenHang: 'iPhone 18 Pro Max 512GB (Titan Tự Nhiên)',
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
      tenHang: 'iPhone 18 Pro Max 256GB (Titan Đen)',
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
    { maBH: 'BH001', soHD: 'HD00891', maImei: '356789123456781', tenHang: 'iPhone 18 Pro Max 512GB', ngayBD: '2026-10-11', thoiHanThang: 12, ngayKT: '2027-10-11' },
    { maBH: 'BH002', soHD: 'HD00890', maImei: '356789123456782', tenHang: 'iPhone 18 Pro Max 256GB', ngayBD: '2026-10-10', thoiHanThang: 12, ngayKT: '2027-10-10' }
  ],
  tiepNhanBaoHanh: [
    { maTN: 'TN001', maBH: 'BH001', soImei: '356789123456781', ngayNhan: '2026-10-12 09:00', tinhTrangLoi: 'Loa trong hơi rè khi đàm thoại', nvTiepNhan: 'NV004', nvKyThuat: 'NV004', ngayHenTra: '2026-10-14', chiPhi: 0, trangThai: 'dang_sua' }
  ],

  // 11. Phiếu nhập & IMEI
  phieuNhap: [
    { soPN: 'PN001', ngayNhap: '2026-10-01 09:30', maNCC: 'NCC01', tenNCC: 'Công ty TNHH Apple Việt Nam', maNV: 'NV001', slNhap: 50, tongTienNhap: 1450000000 }
  ],
  danhSachImei: [
    { maImei: 'IMEI001', soImei: '356789123456781', maHang: 'MH001', tenHang: 'iPhone 18 Pro Max 256GB', soPN: 'PN001', trangThai: 'da_ban' },
    { maImei: 'IMEI002', soImei: '356789123456782', maHang: 'MH001', tenHang: 'iPhone 18 Pro Max 256GB', soPN: 'PN001', trangThai: 'da_ban' },
    { maImei: 'IMEI003', soImei: '356789123456783', maHang: 'MH001', tenHang: 'iPhone 18 Pro Max 256GB', soPN: 'PN001', trangThai: 'con_hang' },
    { maImei: 'IMEI004', soImei: '356789123456784', maHang: 'MH002', tenHang: 'iPhone 18 Pro Max 512GB', soPN: 'PN001', trangThai: 'con_hang' },
    { maImei: 'IMEI005', soImei: '356789123456785', maHang: 'MH003', tenHang: 'iPhone 18 Pro Max 1TB', soPN: 'PN001', trangThai: 'con_hang' }
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
const API_BASE = (window.location.protocol === 'file:' || window.location.port === '5500') 
  ? 'http://localhost:8080/api' 
  : '/api';

// QUẢN LÝ STATE VÀ KẾT NỐI BACKEND DATABASE
class AdminStore {
  constructor() {
    this.storageKey = 'titan_admin_db_v3';
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
    const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
    const dict = {
      cho_xac_nhan: { labelVi: 'Chờ xác nhận', labelEn: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      da_xac_nhan:  { labelVi: 'Đã xác nhận', labelEn: 'Confirmed', cls: 'bg-blue-50 text-[#166534] border-blue-200' },
      dang_giao:    { labelVi: 'Đang giao', labelEn: 'Shipping', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
      hoan_thanh:   { labelVi: 'Hoàn thành', labelEn: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      da_huy:       { labelVi: 'Đã hủy', labelEn: 'Cancelled', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
      dang_lam:     { labelVi: 'Đang làm việc', labelEn: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      da_nghi:      { labelVi: 'Đã nghỉ việc', labelEn: 'Resigned', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
      con_hang:     { labelVi: 'Còn trong kho', labelEn: 'In Stock', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      da_ban:       { labelVi: 'Đã xuất bán', labelEn: 'Sold', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
      dang_sua:     { labelVi: 'Đang sửa chữa', labelEn: 'In Repair', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      da_tra_may:   { labelVi: 'Đã trả máy', labelEn: 'Returned', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      doi_hang:     { labelVi: 'Đổi máy 1-1', labelEn: 'Exchange 1-1', cls: 'bg-blue-50 text-[#166534] border-blue-200' },
      tien_mat:     { labelVi: 'Hoàn tiền mặt', labelEn: 'Cash Refund', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      chuyen_khoan: { labelVi: 'Chuyển khoản', labelEn: 'Transfer', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
      the:          { labelVi: 'Thẻ POS', labelEn: 'Card POS', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      cod:          { labelVi: 'Thu hộ COD', labelEn: 'COD', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
      tai_quay:     { labelVi: 'Tại quầy', labelEn: 'At POS', cls: 'bg-blue-50 text-[#166534] border-blue-200' },
      online:       { labelVi: 'Online', labelEn: 'Online', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
      hoat_dong:    { labelVi: 'Hoạt động', labelEn: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      bi_khoa:      { labelVi: 'Bị khóa', labelEn: 'Locked', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
      tra_hang:     { labelVi: 'Đã trả hàng', labelEn: 'Returned', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
    };

    const item = dict[status] || { labelVi: status, labelEn: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
    const text = isEn ? item.labelEn : item.labelVi;
    return '<span class="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border ' + item.cls + ' shrink-0 min-w-[85px]">' + text + '</span>';
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
    const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
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
    titleEl.textContent = titles[currentActiveSection] || 'TitanStore Admin';
  }

  // Render dữ liệu tương ứng
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

  // Luôn đồng bộ lại ngôn ngữ sau khi render view động
  if (window.TitanI18n) {
    window.TitanI18n.applyDOM();
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD
// -------------------------------------------------------------
function renderDashboard() {
  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const d = store.data;

  // Tính tổng doanh thu
  const totalRevenue = d.hoaDon.reduce((sum, h) => sum + (Number(h.thanhTien) || 0), 0);
  // Đơn chờ xác nhận
  const pendingOrders = d.donHangOnline.filter(o => o.trangThai === 'cho_xac_nhan').length;
  // Tổng tồn kho
  const totalStock = d.matHang.reduce((sum, m) => sum + (Number(m.tonKho) || 0), 0);
  // Máy đang bảo hành
  const repairingWarranty = d.tiepNhanBaoHanh.filter(t => t.trangThai === 'dang_sua').length;

  const revEl = document.getElementById('dash-revenue');
  if (revEl) revEl.textContent = Format.currency(totalRevenue);

  const pendingEl = document.getElementById('dash-pending-orders');
  if (pendingEl) pendingEl.textContent = pendingOrders + (isEn ? ' orders' : ' đơn');

  const stockEl = document.getElementById('dash-total-stock');
  if (stockEl) stockEl.textContent = totalStock + (isEn ? ' units' : ' máy');

  const warrEl = document.getElementById('dash-warranty-count');
  if (warrEl) warrEl.textContent = repairingWarranty + (isEn ? ' units' : ' máy');

  // Bảng đơn hàng online gần đây
  const tbody = document.getElementById('dash-recent-orders-table');
  if (tbody) {
    tbody.innerHTML = d.donHangOnline.slice(0, 5).map(o => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 font-mono font-bold text-[#15803D] text-xs whitespace-nowrap">${o.maDH}</td>
        <td class="p-3 font-semibold text-xs text-navy whitespace-nowrap">${o.tenNguoiNhan}</td>
        <td class="p-3 text-xs text-slate-600 min-w-[200px] truncate">${o.tenHang}</td>
        <td class="p-3 font-bold text-xs text-navy text-right whitespace-nowrap">${Format.currency(o.tongTien)}</td>
        <td class="p-3 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.trangThai)}</td>
        <td class="p-3 text-xs text-right whitespace-nowrap">
          ${o.trangThai === 'hoan_thanh' ? `
            <button onclick="renderSection('view-donhang')" class="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg text-xs whitespace-nowrap transition-colors">${isEn ? 'View' : 'Xem'}</button>
          ` : `
            <button onclick="quickApproveOrder('${o.maDH}')" class="px-2.5 py-1 bg-blue-50 text-[#166534] hover:bg-blue-100 font-bold rounded-lg text-xs whitespace-nowrap transition-colors">${isEn ? 'Process' : 'Xử lý'}</button>
          `}
        </td>
      </tr>
    `).join('');
  }

  // Báo cáo doanh thu theo kênh bán (FR25)
  const posRevenue = d.hoaDon.filter(h => h.kenhBan === 'tai_quay').reduce((s, h) => s + (Number(h.thanhTien) || 0), 0);
  const onlineRevenue = d.hoaDon.filter(h => h.kenhBan === 'online').reduce((s, h) => s + (Number(h.thanhTien) || 0), 0);
  const posCount = d.hoaDon.filter(h => h.kenhBan === 'tai_quay').length;
  const onlineCount = d.hoaDon.filter(h => h.kenhBan === 'online').length;
  const posPercent = totalRevenue > 0 ? Math.round((posRevenue / totalRevenue) * 100) : 50;
  const onlinePercent = totalRevenue > 0 ? (100 - posPercent) : 50;

  const channelStatsEl = document.getElementById('dash-channel-stats');
  if (channelStatsEl) {
    channelStatsEl.innerHTML = `
      <div class="p-3 bg-[#F0FDF4] rounded-xl border border-blue-100 flex items-center justify-between">
        <div>
          <div class="font-bold text-navy flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>${isEn ? 'POS In-Store Sales' : 'Bán Tại Quầy (POS)'}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${posCount} ${isEn ? 'invoices' : 'hóa đơn'} (${posPercent}%)</div>
        </div>
        <div class="text-right">
          <div class="font-extrabold text-[#166534] text-sm font-mono">${Format.currency(posRevenue)}</div>
          <div class="text-[10px] text-emerald-600 font-bold">${isEn ? 'Paid' : 'Đã thu tiền'}</div>
        </div>
      </div>
      <div class="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between">
        <div>
          <div class="font-bold text-navy flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>${isEn ? 'Online Storefront' : 'Kênh Trực Tuyến (Online)'}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${onlineCount} ${isEn ? 'invoices' : 'hóa đơn'} (${onlinePercent}%)</div>
        </div>
        <div class="text-right">
          <div class="font-extrabold text-purple-700 text-sm font-mono">${Format.currency(onlineRevenue)}</div>
          <div class="text-[10px] text-emerald-600 font-bold">${isEn ? 'Fulfilled' : 'Đã hoàn thành'}</div>
        </div>
      </div>
    `;
  }

  // Báo cáo doanh thu theo nhóm hàng (FR25)
  const catStatsEl = document.getElementById('dash-category-stats');
  if (catStatsEl) {
    catStatsEl.innerHTML = `
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <div class="font-bold text-navy flex items-center gap-1.5"><i class="fa-solid fa-mobile-screen text-[#15803D]"></i> ${isEn ? 'Mobile Phones (NH01)' : 'Điện thoại di động (NH01)'}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${d.danhSachImei.filter(i => i.trangThai === 'da_ban').length} ${isEn ? 'devices sold' : 'máy đã xuất bán'}</div>
        </div>
        <div class="text-right">
          <div class="font-extrabold text-slate-800 text-sm font-mono">${Format.currency(totalRevenue * 0.94)}</div>
          <div class="text-[10px] text-[#15803D] font-bold">94% ${isEn ? 'share' : 'tổng số'}</div>
        </div>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <div class="font-bold text-navy flex items-center gap-1.5"><i class="fa-solid fa-headphones text-purple-600"></i> ${isEn ? 'Accessories (NH02)' : 'Phụ kiện chính hãng (NH02)'}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Sạc, Cáp, Ốp lưng MagSafe</div>
        </div>
        <div class="text-right">
          <div class="font-extrabold text-slate-800 text-sm font-mono">${Format.currency(totalRevenue * 0.06)}</div>
          <div class="text-[10px] text-purple-600 font-bold">6% ${isEn ? 'share' : 'tổng số'}</div>
        </div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// 2. MẶT HÀNG (SẢN PHẨM) - CRUD ĐẦY ĐỦ
// -------------------------------------------------------------
function renderMatHangTable(keyword = '') {
  const tbody = document.getElementById('table-mathang-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const items = store.data.matHang.filter(m => 
    m.maHang.toLowerCase().includes(keyword.toLowerCase()) || 
    m.tenHang.toLowerCase().includes(keyword.toLowerCase())
  );

  tbody.innerHTML = items.map(m => {
    const imeiBadge = m.quanLyImei
      ? `<span class="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300/80 font-bold text-xs shrink-0 min-w-[90px] shadow-sm">${isEn ? 'IMEI Tracked' : 'Quản lý IMEI'}</span>`
      : `<span class="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300/80 text-xs shrink-0 min-w-[70px] shadow-sm">${isEn ? 'None' : 'Không'}</span>`;

    return `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${m.maHang}</td>
      <td class="p-3.5 font-semibold text-sm text-navy whitespace-nowrap">${m.tenHang}</td>
      <td class="p-3.5 font-bold text-sm text-slate-800 text-right whitespace-nowrap">${Format.currency(m.donGia)}</td>
      <td class="p-3.5 text-xs text-slate-500 text-center whitespace-nowrap">${m.dvt}</td>
      <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${m.maNhom === 'NH01' ? (isEn ? 'Phones' : 'Điện thoại') : (isEn ? 'Accessories' : 'Phụ kiện')}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${imeiBadge}</td>
      <td class="p-3.5 text-xs text-center text-slate-600 whitespace-nowrap">${m.thoiHanBaoHanh} ${isEn ? 'mo.' : 'tháng'}</td>
      <td class="p-3.5 text-xs font-bold ${m.tonKho > 10 ? 'text-slate-700' : 'text-amber-600'} text-center whitespace-nowrap">${m.tonKho}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
        <button onclick="editMatHang('${m.maHang}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Edit product' : 'Chỉnh sửa mặt hàng'}">
          <i class="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>${isEn ? 'Edit' : 'Sửa'}</span>
        </button>
        <button onclick="deleteMatHang('${m.maHang}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Delete product' : 'Xóa mặt hàng'}">
          <i class="fa-solid fa-trash-can text-[11px]"></i>
          <span>${isEn ? 'Delete' : 'Xóa'}</span>
        </button>
      </td>
    </tr>
  `}).join('');
}

function openMatHangModal(item = null) {
  const modal = document.getElementById('modal-mathang');
  const form = document.getElementById('form-mathang');
  if (!modal || !form) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  if (item) {
    document.getElementById('mh-modal-title').textContent = (isEn ? 'Edit Product: ' : 'Cập Nhật Mặt Hàng: ') + item.maHang;
    form.maHang.value = item.maHang;
    form.maHang.readOnly = true;
    form.tenHang.value = item.tenHang;
    form.donGia.value = item.donGia;
    form.dvt.value = item.dvt;
    form.maNhom.value = item.maNhom;
    form.maLoai.value = item.maLoai;
    form.thoiHanBaoHanh.value = item.thoiHanBaoHanh;
    form.quanLyImei.checked = !!item.quanLyImei;
    form.tonKho.value = item.tonKho || 0;
  } else {
    document.getElementById('mh-modal-title').textContent = isEn ? 'Add New Product' : 'Thêm Mặt Hàng Mới';
    form.reset();
    form.maHang.readOnly = false;
    const nextId = 'MH' + String(store.data.matHang.length + 1).padStart(3, '0');
    form.maHang.value = nextId;
    form.dvt.value = 'Cái';
    form.thoiHanBaoHanh.value = 12;
    form.tonKho.value = 0;
    form.quanLyImei.checked = true;
  }
  modal.classList.remove('hidden');
}

function editMatHang(maHang) {
  const item = store.data.matHang.find(m => m.maHang === maHang);
  if (item) openMatHangModal(item);
}

function saveMatHang(e) {
  e.preventDefault();
  const form = e.target;
  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const item = {
    maHang: form.maHang.value.trim(),
    tenHang: form.tenHang.value.trim(),
    donGia: Number(form.donGia.value),
    dvt: form.dvt.value.trim(),
    maNhom: form.maNhom.value,
    maLoai: form.maLoai.value,
    thoiHanBaoHanh: Number(form.thoiHanBaoHanh.value),
    quanLyImei: form.quanLyImei.checked,
    tonKho: Number(form.tonKho.value) || 0
  };

  const idx = store.data.matHang.findIndex(m => m.maHang === item.maHang);
  if (idx >= 0) {
    store.data.matHang[idx] = { ...store.data.matHang[idx], ...item };
    showToast(isEn ? 'Product updated successfully!' : 'Đã cập nhật mặt hàng!', 'success');
  } else {
    store.data.matHang.push(item);
    showToast(isEn ? 'Product added successfully!' : 'Đã thêm mặt hàng mới!', 'success');
  }

  store.save();
  closeModal('modal-mathang');
  renderMatHangTable();
  renderDashboard();
}

function deleteMatHang(maHang) {
  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const hasOrders = store.data.donHangOnline.some(o => o.maHang === maHang);
  const hasImeis = store.data.danhSachImei.some(i => i.maHang === maHang);
  if (hasOrders || hasImeis) {
    alert(isEn 
      ? 'Cannot delete! This product is linked to existing orders or warehouse IMEI stock.'
      : 'Không thể xóa! Mặt hàng này đã phát sinh đơn hàng hoặc tồn tại mã IMEI trong kho.');
    return;
  }

  if (confirm(isEn ? 'Are you sure you want to delete product ' + maHang + '?' : 'Bạn chắc chắn muốn xóa mặt hàng ' + maHang + '?')) {
    store.data.matHang = store.data.matHang.filter(m => m.maHang !== maHang);
    store.save();
    renderMatHangTable();
    showToast(isEn ? 'Product deleted!' : 'Đã xóa mặt hàng!', 'success');
  }
}

// -------------------------------------------------------------
// 3. ĐƠN HÀNG ONLINE
// -------------------------------------------------------------
function renderDonHangTable(filter = 'all') {
  const tbody = document.getElementById('table-donhang-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const orders = filter === 'all' 
    ? store.data.donHangOnline 
    : store.data.donHangOnline.filter(o => o.trangThai === filter);

  tbody.innerHTML = orders.map(o => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${o.maDH}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${o.ngayDat}</td>
      <td class="p-3.5 whitespace-nowrap">
        <div class="font-bold text-sm text-navy">${o.tenNguoiNhan}</div>
        <div class="text-[11px] text-slate-500 font-mono">${o.sdtNguoiNhan}</div>
      </td>
      <td class="p-3.5 text-xs text-slate-600 max-w-[200px] truncate" title="${o.diaChiGiao}">${o.diaChiGiao}</td>
      <td class="p-3.5 text-xs font-semibold text-navy max-w-[200px] truncate" title="${o.tenHang}">${o.tenHang}</td>
      <td class="p-3.5 font-bold text-sm text-navy text-right whitespace-nowrap">${Format.currency(o.tongTien)}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.phuongThucThanhToan)}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(o.trangThai)}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap">
        ${o.trangThai === 'cho_xac_nhan' ? `
          <button onclick="approveOrder('${o.maDH}')" class="px-3 py-1.5 bg-[#80ffbf] hover:bg-[#66e6a5] text-[#061a0f] font-black rounded-xl text-xs transition-colors shadow-sm">
            ${isEn ? 'Approve & POS' : 'Duyệt & Xuất HĐ'}
          </button>
        ` : o.trangThai === 'da_xac_nhan' ? `
          <button onclick="shipOrder('${o.maDH}')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors">
            ${isEn ? 'Ship Order' : 'Giao Hàng'}
          </button>
        ` : o.trangThai === 'dang_giao' ? `
          <button onclick="completeOrder('${o.maDH}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors">
            ${isEn ? 'Complete' : 'Hoàn Thành'}
          </button>
        ` : `
          <button onclick="renderSection('view-hoadon')" class="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg text-xs whitespace-nowrap transition-colors" title="${isEn ? 'View Invoice' : 'Xem Hóa đơn'}">${isEn ? 'View' : 'Xem'}</button>
        `}
      </td>
    </tr>
  `).join('');
}

function quickApproveOrder(maDH) {
  approveOrder(maDH);
}

function approveOrder(maDH) {
  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const order = store.data.donHangOnline.find(o => o.maDH === maDH);
  if (!order) return;

  const imeiAvailable = store.data.danhSachImei.find(i => i.maHang === order.maHang && i.trangThai === 'con_hang');
  if (!imeiAvailable) {
    alert(isEn 
      ? 'Out of stock! No IMEI available for this model.' 
      : 'Hết hàng! Không còn số IMEI nào cho sản phẩm này trong kho.');
    return;
  }

  imeiAvailable.trangThai = 'da_ban';
  order.trangThai = 'da_xac_nhan';

  const prod = store.data.matHang.find(m => m.maHang === order.maHang);
  if (prod && prod.tonKho > 0) prod.tonKho -= 1;

  const newHD = {
    soHD: 'HD' + String(store.data.hoaDon.length + 892),
    ngayLap: new Date().toISOString().replace('T', ' ').substring(0, 16),
    maKH: order.maKH || 'KH001',
    tenKH: order.tenNguoiNhan,
    maNV: 'NV002',
    kenhBan: 'online',
    tongTien: order.tongTien,
    tienGiamGia: 0,
    thanhTien: order.tongTien,
    phuongThuc: order.phuongThucThanhToan,
    maImei: imeiAvailable.soImei
  };
  store.data.hoaDon.unshift(newHD);

  const newBH = {
    maBH: 'BH' + String(store.data.baoHanh.length + 1).padStart(3, '0'),
    soHD: newHD.soHD,
    maImei: imeiAvailable.soImei,
    tenHang: order.tenHang,
    ngayBD: newHD.ngayLap.substring(0, 10),
    thoiHanThang: 12,
    ngayKT: '2027-' + newHD.ngayLap.substring(5, 10)
  };
  store.data.baoHanh.push(newBH);

  store.save();
  renderDonHangTable();
  renderDashboard();
  showToast((isEn ? 'Approved order ' : 'Đã duyệt đơn & xuất HĐ ') + newHD.soHD + ' (IMEI: ' + imeiAvailable.soImei + ')', 'success');
}

function shipOrder(maDH) {
  const order = store.data.donHangOnline.find(o => o.maDH === maDH);
  if (order) {
    order.trangThai = 'dang_giao';
    store.save();
    renderDonHangTable();
    showToast('Đang giao hàng đơn ' + maDH, 'info');
  }
}

function completeOrder(maDH) {
  const order = store.data.donHangOnline.find(o => o.maDH === maDH);
  if (order) {
    order.trangThai = 'hoan_thanh';
    store.save();
    renderDonHangTable();
    showToast('Đã hoàn thành đơn ' + maDH, 'success');
  }
}

// -------------------------------------------------------------
// 4. HÓA ĐƠN BÁN HÀNG & BÁN TẠI QUẦY (POS)
// -------------------------------------------------------------
function renderHoaDonTable() {
  const tbody = document.getElementById('table-hoadon-body');
  if (!tbody) return;

  tbody.innerHTML = store.data.hoaDon.map(h => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${h.soHD}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${h.ngayLap}</td>
      <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${h.tenKH}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.kenhBan)}</td>
      <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${h.maImei || '-'}</td>
      <td class="p-3.5 font-bold text-sm text-slate-700 text-right whitespace-nowrap">${Format.currency(h.tongTien)}</td>
      <td class="p-3.5 text-xs text-rose-600 text-right whitespace-nowrap">-${Format.currency(h.tienGiamGia)}</td>
      <td class="p-3.5 font-bold text-sm text-[#15803D] text-right whitespace-nowrap">${Format.currency(h.thanhTien)}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.phuongThuc)}</td>
    </tr>
  `).join('');
}

function openLapHoaDonModal() {
  const modal = document.getElementById('modal-lap-hoadon');
  if (!modal) return;

  const selectMH = document.getElementById('pos-select-mathang');
  if (selectMH) {
    selectMH.innerHTML = store.data.matHang.map(m => `
      <option value="${m.maHang}">${m.tenHang} - ${Format.currency(m.donGia)} (Kho: ${m.tonKho})</option>
    `).join('');
  }

  updatePosImeiOptions();
  modal.classList.remove('hidden');
}

function updatePosImeiOptions() {
  const selectMH = document.getElementById('pos-select-mathang');
  const selectImei = document.getElementById('pos-select-imei');
  if (!selectMH || !selectImei) return;

  const maHang = selectMH.value;
  const imeis = store.data.danhSachImei.filter(i => i.maHang === maHang && i.trangThai === 'con_hang');

  if (imeis.length === 0) {
    selectImei.innerHTML = '<option value="">-- Hết IMEI trong kho --</option>';
  } else {
    selectImei.innerHTML = imeis.map(i => `
      <option value="${i.soImei}">${i.soImei}</option>
    `).join('');
  }
}

function saveLapHoaDon(e) {
  e.preventDefault();
  const form = e.target;
  const tenKH = form.tenKH.value.trim();
  const maHang = document.getElementById('pos-select-mathang').value;
  const soImei = document.getElementById('pos-select-imei').value;
  const phuongThuc = form.phuongThuc.value;

  if (!soImei) {
    alert('Vui lòng chọn số IMEI máy còn trong kho!');
    return;
  }

  const prod = store.data.matHang.find(m => m.maHang === maHang);
  const donGia = prod ? prod.donGia : 30000000;

  const imeiObj = store.data.danhSachImei.find(i => i.soImei === soImei);
  if (imeiObj) imeiObj.trangThai = 'da_ban';

  if (prod && prod.tonKho > 0) prod.tonKho -= 1;

  const newHD = {
    soHD: 'HD' + String(store.data.hoaDon.length + 892),
    ngayLap: new Date().toISOString().replace('T', ' ').substring(0, 16),
    maKH: 'KH001',
    tenKH: tenKH,
    maNV: 'NV002',
    kenhBan: 'tai_quay',
    tongTien: donGia,
    tienGiamGia: 0,
    thanhTien: donGia,
    phuongThuc: phuongThuc,
    maImei: soImei
  };
  store.data.hoaDon.unshift(newHD);

  store.data.baoHanh.push({
    maBH: 'BH' + String(store.data.baoHanh.length + 1).padStart(3, '0'),
    soHD: newHD.soHD,
    maImei: soImei,
    tenHang: prod ? prod.tenHang : 'Thiết bị',
    ngayBD: newHD.ngayLap.substring(0, 10),
    thoiHanThang: 12,
    ngayKT: '2027-' + newHD.ngayLap.substring(5, 10)
  });

  store.save();
  closeModal('modal-lap-hoadon');
  renderHoaDonTable();
  renderDashboard();
  showToast('Đã xuất hóa đơn POS thành công: ' + newHD.soHD, 'success');
}

// -------------------------------------------------------------
// 5. NHẬP KHO & SINH IMEI TỰ ĐỘNG
// -------------------------------------------------------------
function renderNhapKhoTable() {
  const tbody = document.getElementById('table-nhapkho-body');
  if (!tbody) return;

  tbody.innerHTML = store.data.phieuNhap.map(p => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${p.soPN}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${p.ngayNhap}</td>
      <td class="p-3.5 font-bold text-sm text-navy">${p.tenNCC}</td>
      <td class="p-3.5 font-bold text-sm text-slate-800 text-center whitespace-nowrap">${p.slNhap}</td>
      <td class="p-3.5 font-bold text-sm text-[#15803D] text-right whitespace-nowrap">${Format.currency(p.tongTienNhap)}</td>
      <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${p.maNV}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap">
        <button onclick="viewChiTietNhapKho('${p.soPN}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-sm">
          <i class="fa-solid fa-barcode text-[11px]"></i>
          <span>Lô IMEI</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function openNhapKhoModal() {
  const modal = document.getElementById('modal-nhapkho');
  if (!modal) return;

  const nextPN = 'PN' + String(store.data.phieuNhap.length + 1).padStart(3, '0');
  const inputSoPN = document.getElementById('pn-soPN');
  if (inputSoPN) inputSoPN.value = nextPN;

  modal.classList.remove('hidden');
}

function saveNhapKho(e) {
  e.preventDefault();
  const form = e.target;
  const soPN = form.soPN.value;
  const maNCC = form.maNCC.value;
  const maHang = form.maHang.value;
  const slNhap = Number(form.slNhap.value) || 1;
  const donGiaNhap = Number(form.donGiaNhap.value) || 28000000;

  const ncc = store.data.nhaCungCap.find(c => c.maNCC === maNCC);
  const prod = store.data.matHang.find(m => m.maHang === maHang);

  const phieu = {
    soPN: soPN,
    ngayNhap: new Date().toISOString().replace('T', ' ').substring(0, 16),
    maNCC: maNCC,
    tenNCC: ncc ? ncc.tenNCC : 'Nhà Cung Cấp',
    maNV: 'NV001',
    slNhap: slNhap,
    tongTienNhap: slNhap * donGiaNhap
  };
  store.data.phieuNhap.unshift(phieu);

  const startNum = 356789100000000 + Math.floor(Math.random() * 1000000);
  for (let i = 0; i < slNhap; i++) {
    const imeiCode = String(startNum + i);
    store.data.danhSachImei.push({
      maImei: 'IMEI' + String(store.data.danhSachImei.length + 1).padStart(3, '0'),
      soImei: imeiCode,
      maHang: maHang,
      tenHang: prod ? prod.tenHang : 'Thiết bị',
      soPN: soPN,
      trangThai: 'con_hang'
    });
  }

  if (prod) {
    prod.tonKho = (prod.tonKho || 0) + slNhap;
  }

  store.save();
  closeModal('modal-nhapkho');
  renderNhapKhoTable();
  renderDashboard();
  showToast('Đã tạo phiếu nhập ' + soPN + ' và tự động sinh ' + slNhap + ' mã IMEI!', 'success');
}

// -------------------------------------------------------------
// 6. TIẾP NHẬN & SỬA CHỮA BẢO HÀNH
// -------------------------------------------------------------
function renderBaoHanhTable() {
  const tbody = document.getElementById('table-baohanh-body');
  if (!tbody) return;

  tbody.innerHTML = store.data.tiepNhanBaoHanh.map(t => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${t.maTN}</td>
      <td class="p-3.5 font-mono font-bold text-xs text-slate-800 whitespace-nowrap">${t.soImei || '-'}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${t.ngayNhan}</td>
      <td class="p-3.5 text-xs text-slate-700 min-w-[200px]">${t.tinhTrangLoi}</td>
      <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${t.nvKyThuat}</td>
      <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${t.ngayHenTra}</td>
      <td class="p-3.5 font-bold text-xs text-slate-800 text-right whitespace-nowrap">${Format.currency(t.chiPhi)}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(t.trangThai)}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap">
        ${t.trangThai === 'dang_sua' ? `
          <button onclick="traMayBaoHanh('${t.maTN}')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors">
            Trả máy
          </button>
        ` : `
          <span class="text-xs text-slate-400">Đã xong</span>
        `}
      </td>
    </tr>
  `).join('');
}

function openTiepNhanBaoHanhModal() {
  const modal = document.getElementById('modal-tiepnhan-baohanh');
  if (!modal) return;

  const nextTN = 'TN' + String(store.data.tiepNhanBaoHanh.length + 1).padStart(3, '0');
  const inputMaTN = document.getElementById('tn-maTN');
  if (inputMaTN) inputMaTN.value = nextTN;

  modal.classList.remove('hidden');
}

function saveTiepNhanBaoHanh(e) {
  e.preventDefault();
  const form = e.target;
  const maTN = form.maTN.value;
  const soImei = form.soImei.value.trim();
  const tinhTrangLoi = form.tinhTrangLoi.value.trim();
  const nvKyThuat = form.nvKyThuat.value;
  const ngayHenTra = form.ngayHenTra.value;
  const chiPhi = Number(form.chiPhi.value) || 0;

  const item = {
    maTN: maTN,
    maBH: 'BH001',
    soImei: soImei,
    ngayNhan: new Date().toISOString().replace('T', ' ').substring(0, 16),
    tinhTrangLoi: tinhTrangLoi,
    nvTiepNhan: 'NV004',
    nvKyThuat: nvKyThuat,
    ngayHenTra: ngayHenTra,
    chiPhi: chiPhi,
    trangThai: 'dang_sua'
  };

  store.data.tiepNhanBaoHanh.unshift(item);
  store.save();
  closeModal('modal-tiepnhan-baohanh');
  renderBaoHanhTable();
  renderDashboard();
  showToast('Đã lập phiếu tiếp nhận bảo hành: ' + maTN, 'success');
}

function traMayBaoHanh(maTN) {
  const item = store.data.tiepNhanBaoHanh.find(t => t.maTN === maTN);
  if (item) {
    item.trangThai = 'da_tra_may';
    store.save();
    renderBaoHanhTable();
    renderDashboard();
    showToast('Đã cập nhật trả máy bảo hành: ' + maTN, 'success');
  }
}

// -------------------------------------------------------------
// 7. ĐỔI TRẢ HÀNG - CRUD ĐẦY ĐỦ (XỬ LÝ ĐỔI TRẢ 30 NGÀY)
// -------------------------------------------------------------
function renderTraHangTable() {
  const tbody = document.getElementById('table-trahang-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  tbody.innerHTML = store.data.traHang.map(t => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${t.maTR}</td>
      <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${t.soHD || '-'}</td>
      <td class="p-3.5 font-mono font-bold text-xs text-slate-800 whitespace-nowrap">${t.maImei}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${t.ngayTR}</td>
      <td class="p-3.5 text-xs text-slate-700 min-w-[200px]">${t.lyDo}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(t.hinhThuc)}</td>
      <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${t.maNV}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
        <button onclick="editTraHang('${t.maTR}')" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Edit return ticket' : 'Sửa phiếu đổi trả'}">
          <i class="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>${isEn ? 'Edit' : 'Sửa'}</span>
        </button>
        <button onclick="deleteTraHang('${t.maTR}')" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Delete return ticket' : 'Xóa phiếu đổi trả'}">
          <i class="fa-solid fa-trash-can text-[11px]"></i>
          <span>${isEn ? 'Delete' : 'Xóa'}</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function openTraHangModal(tr = null) {
  const modal = document.getElementById('modal-trahang');
  if (!modal) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const modalTitle = modal.querySelector('h3');
  const inputMaTR = document.getElementById('tr-maTR');
  const inputImei = modal.querySelector('input[name="soImei"]');
  const inputLyDo = modal.querySelector('input[name="lyDo"]');
  const selectHinhThuc = modal.querySelector('select[name="hinhThuc"]');

  if (tr) {
    if (modalTitle) modalTitle.textContent = isEn ? 'Edit Return Ticket' : 'Chỉnh Sửa Phiếu Đổi Trả';
    if (inputMaTR) inputMaTR.value = tr.maTR;
    if (inputImei) inputImei.value = tr.maImei || '';
    if (inputLyDo) inputLyDo.value = tr.lyDo || '';
    if (selectHinhThuc) selectHinhThuc.value = tr.hinhThuc || 'doi_hang';
  } else {
    if (modalTitle) modalTitle.textContent = isEn ? 'Create Return Ticket' : 'Lập Phiếu Đổi Trả Hàng (30 ngày)';
    const nextTR = 'TR' + String(store.data.traHang.length + 1).padStart(3, '0');
    if (inputMaTR) inputMaTR.value = nextTR;
    if (inputImei) inputImei.value = '';
    if (inputLyDo) inputLyDo.value = '';
    if (selectHinhThuc) selectHinhThuc.value = 'doi_hang';
  }

  modal.classList.remove('hidden');
}

function editTraHang(maTR) {
  const tr = store.data.traHang.find(t => t.maTR === maTR);
  if (tr) openTraHangModal(tr);
}

function deleteTraHang(maTR) {
  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  const confirmMsg = isEn ? `Are you sure you want to delete return ticket ${maTR}?` : `Bạn có chắc chắn muốn xóa phiếu đổi trả ${maTR}?`;
  if (confirm(confirmMsg)) {
    store.data.traHang = store.data.traHang.filter(t => t.maTR !== maTR);
    store.save();
    renderTraHangTable();
    showToast((isEn ? 'Deleted return ticket: ' : 'Đã xóa phiếu đổi trả: ') + maTR, 'success');
  }
}

function saveTraHang(e) {
  e.preventDefault();
  const form = e.target;
  const maTR = form.maTR.value;
  const soImei = form.soImei.value.trim();
  const lyDo = form.lyDo.value.trim();
  const hinhThuc = form.hinhThuc.value;
  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';

  const existingIdx = store.data.traHang.findIndex(t => t.maTR === maTR);
  if (existingIdx !== -1) {
    store.data.traHang[existingIdx].maImei = soImei;
    store.data.traHang[existingIdx].lyDo = lyDo;
    store.data.traHang[existingIdx].hinhThuc = hinhThuc;
    store.save();
    closeModal('modal-trahang');
    renderTraHangTable();
    showToast((isEn ? 'Updated return ticket: ' : 'Đã cập nhật phiếu đổi trả: ') + maTR, 'success');
    return;
  }

  const item = {
    maTR: maTR,
    soHD: 'HD00891',
    maImei: soImei,
    ngayTR: new Date().toISOString().substring(0, 10),
    lyDo: lyDo,
    hinhThuc: hinhThuc,
    maNV: 'NV001'
  };

  store.data.traHang.unshift(item);
  store.save();
  closeModal('modal-trahang');
  renderTraHangTable();
  showToast((isEn ? 'Created return ticket: ' : 'Đã lập phiếu đổi trả: ') + maTR, 'success');
}

// -------------------------------------------------------------
// 8. KHÁCH HÀNG - CRUD ĐẦY ĐỦ
// -------------------------------------------------------------
function renderKhachHangTable() {
  const tbody = document.getElementById('table-khachhang-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  tbody.innerHTML = store.data.khachHang.map(k => {
    const totalSpent = store.data.hoaDon.filter(h => h.maKH === k.maKH).reduce((sum, h) => sum + (Number(h.thanhTien) || 0), 0);
    const points = Math.floor(Math.max(0, totalSpent) / 100000); // BR21: 1 điểm cho mỗi 100.000đ

    return `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${k.maKH}</td>
      <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${k.hoTen}</td>
      <td class="p-3.5 font-bold text-xs text-slate-700 whitespace-nowrap">${k.sdt}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${k.email || '-'}</td>
      <td class="p-3.5 text-xs text-slate-600">${k.diaChi}</td>
      <td class="p-3.5 text-center whitespace-nowrap">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold font-mono">
          <i class="fa-solid fa-star text-[10px] text-amber-500"></i> ${points} đ
        </span>
      </td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
        <button onclick="viewKhachHangHistory('${k.maKH}')" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="Xem lịch sử mua hàng & tích điểm">
          <i class="fa-solid fa-clock-rotate-left text-[11px]"></i>
          <span>Lịch sử</span>
        </button>
        <button onclick="editKhachHang('${k.maKH}')" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Edit customer' : 'Chỉnh sửa khách hàng'}">
          <i class="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>${isEn ? 'Edit' : 'Sửa'}</span>
        </button>
        <button onclick="deleteKhachHang('${k.maKH}')" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Delete customer' : 'Xóa khách hàng'}">
          <i class="fa-solid fa-trash-can text-[11px]"></i>
          <span>${isEn ? 'Delete' : 'Xóa'}</span>
        </button>
      </td>
    </tr>
  `}).join('');
}

function openKhachHangModal(cust = null) {
  let modal = document.getElementById('modal-khachhang');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-khachhang';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 id="kh-modal-title" class="font-bold text-navy text-base">Thêm Khách Hàng</h3>
          <button onclick="closeModal('modal-khachhang')" class="text-slate-400 hover:text-navy"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <form onsubmit="saveKhachHang(event)" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Mã KH:</label>
              <input type="text" name="maKH" required class="w-full h-10 px-3 border rounded-xl font-mono">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Số điện thoại:</label>
              <input type="text" name="sdt" required class="w-full h-10 px-3 border rounded-xl">
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Họ và tên:</label>
            <input type="text" name="hoTen" required class="w-full h-10 px-3 border rounded-xl font-bold">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email:</label>
            <input type="email" name="email" class="w-full h-10 px-3 border rounded-xl">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Địa chỉ giao hàng:</label>
            <input type="text" name="diaChi" required class="w-full h-10 px-3 border rounded-xl">
          </div>
          <div class="pt-3 border-t flex justify-end gap-2">
            <button type="button" onclick="closeModal('modal-khachhang')" class="px-4 py-2 bg-slate-100 rounded-xl">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-[#80ffbf] hover:bg-[#66e6a5] text-[#061a0f] font-black rounded-xl shadow-md transition-all">Lưu Dữ Liệu</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const form = modal.querySelector('form');
  if (cust) {
    document.getElementById('kh-modal-title').textContent = 'Cập Nhật Khách Hàng: ' + cust.maKH;
    form.maKH.value = cust.maKH;
    form.maKH.readOnly = true;
    form.hoTen.value = cust.hoTen;
    form.sdt.value = cust.sdt;
    form.email.value = cust.email || '';
    form.diaChi.value = cust.diaChi;
  } else {
    document.getElementById('kh-modal-title').textContent = 'Thêm Khách Hàng Mới';
    form.reset();
    form.maKH.readOnly = false;
    form.maKH.value = 'KH' + String(store.data.khachHang.length + 1).padStart(3, '0');
  }
  modal.classList.remove('hidden');
}

function editKhachHang(maKH) {
  const cust = store.data.khachHang.find(k => k.maKH === maKH);
  if (cust) openKhachHangModal(cust);
}

function saveKhachHang(e) {
  e.preventDefault();
  const form = e.target;
  const item = {
    maKH: form.maKH.value.trim(),
    hoTen: form.hoTen.value.trim(),
    sdt: form.sdt.value.trim(),
    email: form.email.value.trim(),
    diaChi: form.diaChi.value.trim()
  };

  const idx = store.data.khachHang.findIndex(k => k.maKH === item.maKH);
  if (idx >= 0) {
    store.data.khachHang[idx] = item;
    showToast('Đã cập nhật khách hàng!', 'success');
  } else {
    store.data.khachHang.push(item);
    showToast('Đã thêm khách hàng mới!', 'success');
  }

  store.save();
  closeModal('modal-khachhang');
  renderKhachHangTable();
}

function deleteKhachHang(maKH) {
  const hasOrders = store.data.donHangOnline.some(o => o.maKH === maKH);
  const hasInvoices = store.data.hoaDon.some(h => h.maKH === maKH);
  if (hasOrders || hasInvoices) {
    alert('Không thể xóa! Khách hàng này đã phát sinh lịch sử đơn hàng hoặc hóa đơn.');
    return;
  }

  if (confirm('Bạn chắc chắn muốn xóa khách hàng ' + maKH + '?')) {
    store.data.khachHang = store.data.khachHang.filter(k => k.maKH !== maKH);
    store.save();
    renderKhachHangTable();
    showToast('Đã xóa khách hàng!', 'success');
  }
}

// -------------------------------------------------------------
// 9. NHÂN VIÊN - CRUD KHÔNG XÓA (ĐỔI SANG DA_NGHI)
// -------------------------------------------------------------
function renderNhanVienTable() {
  const tbody = document.getElementById('table-nhanvien-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  tbody.innerHTML = store.data.nhanVien.map(n => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${n.maNV}</td>
      <td class="p-3.5 font-semibold text-sm text-navy whitespace-nowrap">${n.hoTen}</td>
      <td class="p-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">${n.chucVu}</td>
      <td class="p-3.5 text-xs text-slate-600 whitespace-nowrap">${n.sdt}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${n.email}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(n.trangThai)}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
        <button onclick="editNhanVien('${n.maNV}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Edit staff' : 'Sửa nhân viên'}">
          <i class="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>${isEn ? 'Edit' : 'Sửa'}</span>
        </button>
        ${n.trangThai === 'dang_lam' ? `
          <button onclick="deactivateNhanVien('${n.maNV}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Set Resigned (da_nghi)' : 'Đổi trạng thái sang Đã nghỉ việc (da_nghi)'}">
            <i class="fa-solid fa-user-slash text-[11px]"></i>
            <span>${isEn ? 'Resign' : 'Nghỉ việc'}</span>
          </button>
        ` : `
          <button onclick="activateNhanVien('${n.maNV}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Reactivate' : 'Kích hoạt lại làm việc'}">
            <i class="fa-solid fa-user-check text-[11px]"></i>
            <span>${isEn ? 'Activate' : 'Đi làm lại'}</span>
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

function openNhanVienModal(nv = null) {
  let modal = document.getElementById('modal-nhanvien');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-nhanvien';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 id="nv-modal-title" class="font-bold text-navy text-base">Thêm Nhân Viên</h3>
          <button onclick="closeModal('modal-nhanvien')" class="text-slate-400 hover:text-navy"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <form onsubmit="saveNhanVien(event)" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Mã NV:</label>
              <input type="text" name="maNV" required class="w-full h-10 px-3 border rounded-xl font-mono">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Chức vụ:</label>
              <select name="chucVu" class="w-full h-10 px-3 border rounded-xl bg-white">
                <option value="Quản lý">Quản lý</option>
                <option value="Thu ngân">Thu ngân</option>
                <option value="Bán hàng">Bán hàng</option>
                <option value="Kỹ thuật & Bảo hành">Kỹ thuật & Bảo hành</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Họ và tên:</label>
            <input type="text" name="hoTen" required class="w-full h-10 px-3 border rounded-xl font-bold">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Số điện thoại:</label>
              <input type="text" name="sdt" required class="w-full h-10 px-3 border rounded-xl">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Email:</label>
              <input type="email" name="email" required class="w-full h-10 px-3 border rounded-xl">
            </div>
          </div>
          <div class="pt-3 border-t flex justify-end gap-2">
            <button type="button" onclick="closeModal('modal-nhanvien')" class="px-4 py-2 bg-slate-100 rounded-xl">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-[#80ffbf] hover:bg-[#66e6a5] text-[#061a0f] font-black rounded-xl shadow-md transition-all">Lưu Nhân Viên</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const form = modal.querySelector('form');
  if (nv) {
    document.getElementById('nv-modal-title').textContent = 'Cập Nhật Nhân Viên: ' + nv.maNV;
    form.maNV.value = nv.maNV;
    form.maNV.readOnly = true;
    form.hoTen.value = nv.hoTen;
    form.chucVu.value = nv.chucVu;
    form.sdt.value = nv.sdt;
    form.email.value = nv.email;
  } else {
    document.getElementById('nv-modal-title').textContent = 'Thêm Nhân Viên Mới';
    form.reset();
    form.maNV.readOnly = false;
    form.maNV.value = 'NV' + String(store.data.nhanVien.length + 1).padStart(3, '0');
  }
  modal.classList.remove('hidden');
}

function editNhanVien(maNV) {
  const nv = store.data.nhanVien.find(n => n.maNV === maNV);
  if (nv) openNhanVienModal(nv);
}

function saveNhanVien(e) {
  e.preventDefault();
  const form = e.target;
  const item = {
    maNV: form.maNV.value.trim(),
    hoTen: form.hoTen.value.trim(),
    chucVu: form.chucVu.value,
    sdt: form.sdt.value.trim(),
    email: form.email.value.trim()
  };

  const idx = store.data.nhanVien.findIndex(n => n.maNV === item.maNV);
  if (idx >= 0) {
    store.data.nhanVien[idx] = { ...store.data.nhanVien[idx], ...item };
    showToast('Đã cập nhật thông tin nhân viên!', 'success');
  } else {
    item.trangThai = 'dang_lam';
    store.data.nhanVien.push(item);
    showToast('Đã thêm nhân viên mới!', 'success');
  }

  store.save();
  closeModal('modal-nhanvien');
  renderNhanVienTable();
}

function deactivateNhanVien(maNV) {
  const nv = store.data.nhanVien.find(n => n.maNV === maNV);
  if (nv && confirm('Đổi trạng thái nhân viên ' + nv.hoTen + ' sang Đã nghỉ việc (da_nghi)?')) {
    nv.trangThai = 'da_nghi';
    store.save();
    renderNhanVienTable();
    showToast('Đã chuyển nhân viên sang trạng thái Đã nghỉ việc!', 'info');
  }
}

function activateNhanVien(maNV) {
  const nv = store.data.nhanVien.find(n => n.maNV === maNV);
  if (nv) {
    nv.trangThai = 'dang_lam';
    store.save();
    renderNhanVienTable();
    showToast('Đã kích hoạt lại trạng thái Đang làm việc!', 'success');
  }
}

// -------------------------------------------------------------
// 10. NHÀ CUNG CẤP - CRUD ĐẦY ĐỦ
// -------------------------------------------------------------
function renderNhaCungCapTable() {
  const tbody = document.getElementById('table-nhacungcap-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  tbody.innerHTML = store.data.nhaCungCap.map(c => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${c.maNCC}</td>
      <td class="p-3.5 font-bold text-sm text-navy">${c.tenNCC}</td>
      <td class="p-3.5 text-xs text-slate-700 whitespace-nowrap">${c.sdt}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${c.email}</td>
      <td class="p-3.5 text-xs text-slate-600">${c.diaChi}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
        <button onclick="editNhaCungCap('${c.maNCC}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Edit supplier' : 'Sửa nhà cung cấp'}">
          <i class="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>${isEn ? 'Edit' : 'Sửa'}</span>
        </button>
        <button onclick="deleteNhaCungCap('${c.maNCC}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Delete supplier' : 'Xóa nhà cung cấp'}">
          <i class="fa-solid fa-trash-can text-[11px]"></i>
          <span>${isEn ? 'Delete' : 'Xóa'}</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function openNhaCungCapModal(ncc = null) {
  let modal = document.getElementById('modal-nhacungcap');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-nhacungcap';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 id="ncc-modal-title" class="font-bold text-navy text-base">Thêm Nhà Cung Cấp</h3>
          <button onclick="closeModal('modal-nhacungcap')" class="text-slate-400 hover:text-navy"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <form onsubmit="saveNhaCungCap(event)" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Mã NCC:</label>
              <input type="text" name="maNCC" required class="w-full h-10 px-3 border rounded-xl font-mono">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Số điện thoại:</label>
              <input type="text" name="sdt" required class="w-full h-10 px-3 border rounded-xl">
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên Nhà Cung Cấp:</label>
            <input type="text" name="tenNCC" required class="w-full h-10 px-3 border rounded-xl font-bold">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email:</label>
            <input type="email" name="email" required class="w-full h-10 px-3 border rounded-xl">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Địa chỉ trụ sở:</label>
            <input type="text" name="diaChi" required class="w-full h-10 px-3 border rounded-xl">
          </div>
          <div class="pt-3 border-t flex justify-end gap-2">
            <button type="button" onclick="closeModal('modal-nhacungcap')" class="px-4 py-2 bg-slate-100 rounded-xl">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-[#80ffbf] hover:bg-[#66e6a5] text-[#061a0f] font-black rounded-xl shadow-md transition-all">Lưu Nhà Cung Cấp</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const form = modal.querySelector('form');
  if (ncc) {
    document.getElementById('ncc-modal-title').textContent = 'Cập Nhật NCC: ' + ncc.maNCC;
    form.maNCC.value = ncc.maNCC;
    form.maNCC.readOnly = true;
    form.tenNCC.value = ncc.tenNCC;
    form.sdt.value = ncc.sdt;
    form.email.value = ncc.email;
    form.diaChi.value = ncc.diaChi;
  } else {
    document.getElementById('ncc-modal-title').textContent = 'Thêm Nhà Cung Cấp Mới';
    form.reset();
    form.maNCC.readOnly = false;
    form.maNCC.value = 'NCC' + String(store.data.nhaCungCap.length + 1).padStart(2, '0');
  }
  modal.classList.remove('hidden');
}

function editNhaCungCap(maNCC) {
  const ncc = store.data.nhaCungCap.find(c => c.maNCC === maNCC);
  if (ncc) openNhaCungCapModal(ncc);
}

function saveNhaCungCap(e) {
  e.preventDefault();
  const form = e.target;
  const item = {
    maNCC: form.maNCC.value.trim(),
    tenNCC: form.tenNCC.value.trim(),
    sdt: form.sdt.value.trim(),
    email: form.email.value.trim(),
    diaChi: form.diaChi.value.trim()
  };

  const idx = store.data.nhaCungCap.findIndex(c => c.maNCC === item.maNCC);
  if (idx >= 0) {
    store.data.nhaCungCap[idx] = item;
    showToast('Đã cập nhật nhà cung cấp!', 'success');
  } else {
    store.data.nhaCungCap.push(item);
    showToast('Đã thêm nhà cung cấp mới!', 'success');
  }

  store.save();
  closeModal('modal-nhacungcap');
  renderNhaCungCapTable();
}

function deleteNhaCungCap(maNCC) {
  const hasImports = store.data.phieuNhap.some(p => p.maNCC === maNCC);
  if (hasImports) {
    alert('Không thể xóa! Nhà cung cấp này đã phát sinh phiếu nhập kho.');
    return;
  }

  if (confirm('Bạn chắc chắn muốn xóa nhà cung cấp ' + maNCC + '?')) {
    store.data.nhaCungCap = store.data.nhaCungCap.filter(c => c.maNCC !== maNCC);
    store.save();
    renderNhaCungCapTable();
    showToast('Đã xóa nhà cung cấp!', 'success');
  }
}

// -------------------------------------------------------------
// 11. KHUYẾN MÃI - CRUD ĐẦY ĐỦ
// -------------------------------------------------------------
function renderKhuyenMaiTable() {
  const tbody = document.getElementById('table-khuyenmai-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  tbody.innerHTML = store.data.khuyenMai.map(k => {
    const kmBadge = k.tamDung
      ? `<span class="whitespace-nowrap inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold shrink-0 min-w-[95px]">${isEn ? 'Suspended' : 'Tạm dừng'}</span>`
      : `<span class="whitespace-nowrap inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shrink-0 min-w-[95px]">${isEn ? 'Active' : 'Đang áp dụng'}</span>`;

    return `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${k.maKM}</td>
      <td class="p-3.5 font-semibold text-sm text-navy">${k.tenKM}</td>
      <td class="p-3.5 font-bold text-sm text-slate-700 text-right whitespace-nowrap">-${k.phanTramGiam}%</td>
      <td class="p-3.5 text-xs text-slate-500 text-center whitespace-nowrap">${k.ngayBD} → ${k.ngayKT}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${kmBadge}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap space-x-1.5">
        <button onclick="editKhuyenMai('${k.maKM}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Edit promotion' : 'Sửa khuyến mãi'}">
          <i class="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>${isEn ? 'Edit' : 'Sửa'}</span>
        </button>
        <button onclick="deleteKhuyenMai('${k.maKM}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Delete promotion' : 'Xóa khuyến mãi'}">
          <i class="fa-solid fa-trash-can text-[11px]"></i>
          <span>${isEn ? 'Delete' : 'Xóa'}</span>
        </button>
      </td>
    </tr>
  `}).join('');
}

function openKhuyenMaiModal(km = null) {
  let modal = document.getElementById('modal-khuyenmai');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-khuyenmai';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 id="km-modal-title" class="font-bold text-navy text-base">Thêm Chương Trình Khuyến Mãi</h3>
          <button onclick="closeModal('modal-khuyenmai')" class="text-slate-400 hover:text-navy"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <form onsubmit="saveKhuyenMai(event)" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Mã KM:</label>
              <input type="text" name="maKM" required class="w-full h-10 px-3 border rounded-xl font-mono">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Giảm giá (%):</label>
              <input type="number" name="phanTramGiam" min="1" max="100" required class="w-full h-10 px-3 border rounded-xl">
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên chương trình:</label>
            <input type="text" name="tenKM" required class="w-full h-10 px-3 border rounded-xl font-bold">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Ngày bắt đầu:</label>
              <input type="date" name="ngayBD" required class="w-full h-10 px-3 border rounded-xl">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Ngày kết thúc:</label>
              <input type="date" name="ngayKT" required class="w-full h-10 px-3 border rounded-xl">
            </div>
          </div>
          <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
            <input type="checkbox" name="tamDung" class="w-4 h-4 text-[#15803D] rounded">
            <span>Tạm dừng áp dụng chương trình này</span>
          </label>
          <div class="pt-3 border-t flex justify-end gap-2">
            <button type="button" onclick="closeModal('modal-khuyenmai')" class="px-4 py-2 bg-slate-100 rounded-xl">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-[#80ffbf] hover:bg-[#66e6a5] text-[#061a0f] font-black rounded-xl shadow-md transition-all">Lưu Khuyến Mãi</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const form = modal.querySelector('form');
  if (km) {
    document.getElementById('km-modal-title').textContent = 'Cập Nhật Khuyến Mãi: ' + km.maKM;
    form.maKM.value = km.maKM;
    form.maKM.readOnly = true;
    form.tenKM.value = km.tenKM;
    form.phanTramGiam.value = km.phanTramGiam;
    form.ngayBD.value = km.ngayBD;
    form.ngayKT.value = km.ngayKT;
    form.tamDung.checked = !!km.tamDung;
  } else {
    document.getElementById('km-modal-title').textContent = 'Thêm Khuyến Mãi Mới';
    form.reset();
    form.maKM.readOnly = false;
    form.maKM.value = 'KM' + String(store.data.khuyenMai.length + 1).padStart(2, '0');
    form.phanTramGiam.value = 5;
    form.ngayBD.value = '2026-10-01';
    form.ngayKT.value = '2026-12-31';
  }
  modal.classList.remove('hidden');
}

function editKhuyenMai(maKM) {
  const km = store.data.khuyenMai.find(k => k.maKM === maKM);
  if (km) openKhuyenMaiModal(km);
}

function saveKhuyenMai(e) {
  e.preventDefault();
  const form = e.target;
  const item = {
    maKM: form.maKM.value.trim(),
    tenKM: form.tenKM.value.trim(),
    phanTramGiam: Number(form.phanTramGiam.value),
    ngayBD: form.ngayBD.value,
    ngayKT: form.ngayKT.value,
    tamDung: form.tamDung.checked
  };

  const idx = store.data.khuyenMai.findIndex(k => k.maKM === item.maKM);
  if (idx >= 0) {
    store.data.khuyenMai[idx] = item;
    showToast('Đã cập nhật khuyến mãi!', 'success');
  } else {
    store.data.khuyenMai.push(item);
    showToast('Đã thêm chương trình khuyến mãi mới!', 'success');
  }

  store.save();
  closeModal('modal-khuyenmai');
  renderKhuyenMaiTable();
}

function deleteKhuyenMai(maKM) {
  if (confirm('Bạn chắc chắn muốn xóa chương trình khuyến mãi ' + maKM + '?')) {
    store.data.khuyenMai = store.data.khuyenMai.filter(k => k.maKM !== maKM);
    store.save();
    renderKhuyenMaiTable();
    showToast('Đã xóa chương trình khuyến mãi!', 'success');
  }
}

// -------------------------------------------------------------
// 12. THAM SỐ HỆ THỐNG
// -------------------------------------------------------------
function renderThamSoTable() {
  const tbody = document.getElementById('table-thamso-body');
  if (!tbody) return;

  const isEn = window.TitanI18n && window.TitanI18n.getLang() === 'en';
  tbody.innerHTML = store.data.thamSo.map(s => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${s.maThamSo}</td>
      <td class="p-3.5 text-xs text-slate-800 font-semibold">${s.tenThamSo}</td>
      <td class="p-3.5 font-mono font-bold text-sm text-slate-800 text-right whitespace-nowrap">${s.giaTri} ${s.donVi}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap">
        <button onclick="editThamSo('${s.maThamSo}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95" title="${isEn ? 'Edit parameter' : 'Sửa tham số'}">
          <i class="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>${isEn ? 'Edit' : 'Sửa'}</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function openThamSoModal(ts) {
  let modal = document.getElementById('modal-thamso');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-thamso';
    modal.className = 'hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 id="ts-modal-title" class="font-bold text-navy text-base">Cập Nhật Tham Số</h3>
          <button onclick="closeModal('modal-thamso')" class="text-slate-400 hover:text-navy"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <form onsubmit="saveThamSo(event)" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mã tham số:</label>
            <input type="text" name="maThamSo" readonly class="w-full h-10 px-3 border rounded-xl font-mono bg-slate-50 text-slate-600">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Ý nghĩa tham số:</label>
            <input type="text" name="tenThamSo" required class="w-full h-10 px-3 border rounded-xl font-medium">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Giá trị:</label>
              <input type="number" name="giaTri" step="any" required class="w-full h-10 px-3 border rounded-xl font-bold">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Đơn vị:</label>
              <input type="text" name="donVi" required class="w-full h-10 px-3 border rounded-xl">
            </div>
          </div>
          <div class="pt-3 border-t flex justify-end gap-2">
            <button type="button" onclick="closeModal('modal-thamso')" class="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-[#80ffbf] hover:bg-[#66e6a5] text-[#061a0f] font-black rounded-xl shadow-md transition-all">Lưu Tham Số</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const form = modal.querySelector('form');
  form.maThamSo.value = ts.maThamSo;
  form.tenThamSo.value = ts.tenThamSo;
  form.giaTri.value = ts.giaTri;
  form.donVi.value = ts.donVi;
  modal.classList.remove('hidden');
}

function editThamSo(maThamSo) {
  const ts = store.data.thamSo.find(s => s.maThamSo === maThamSo);
  if (ts) openThamSoModal(ts);
}

function saveThamSo(e) {
  e.preventDefault();
  const form = e.target;
  const maThamSo = form.maThamSo.value;
  const ts = store.data.thamSo.find(s => s.maThamSo === maThamSo);
  if (ts) {
    ts.tenThamSo = form.tenThamSo.value.trim();
    ts.giaTri = Number(form.giaTri.value);
    ts.donVi = form.donVi.value.trim();
    store.save();
    closeModal('modal-thamso');
    renderThamSoTable();
    showToast('Đã cập nhật tham số hệ thống ' + maThamSo, 'success');
  }
}

// -------------------------------------------------------------
// 13. TỒN KHO & IMEI BÁO CÁO
// -------------------------------------------------------------
function renderTonKhoTable() {
  const tbody = document.getElementById('table-tonkho-body');
  if (!tbody) return;

  tbody.innerHTML = store.data.matHang.map(m => {
    const totalSold = store.data.danhSachImei.filter(i => i.maHang === m.maHang && i.trangThai === 'da_ban').length;
    const currentStock = m.tonKho || 0;
    const totalImport = currentStock + totalSold;

    return `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${m.maHang}</td>
      <td class="p-3.5 font-semibold text-sm text-navy">${m.tenHang}</td>
      <td class="p-3.5 text-xs text-slate-500 text-center whitespace-nowrap">${m.dvt}</td>
      <td class="p-3.5 text-xs font-bold text-slate-700 text-center whitespace-nowrap">${totalImport}</td>
      <td class="p-3.5 text-xs font-bold text-slate-700 text-center whitespace-nowrap">${totalSold}</td>
      <td class="p-3.5 text-xs font-bold ${currentStock > 10 ? 'text-slate-700' : 'text-amber-600'} text-center whitespace-nowrap">${currentStock}</td>
    </tr>
  `}).join('');
}

function renderImeiTable(keyword = '') {
  const tbody = document.getElementById('table-imei-body');
  if (!tbody) return;

  const kw = (keyword || '').toLowerCase().trim();
  const list = kw
    ? store.data.danhSachImei.filter(i => (i.soImei && i.soImei.includes(kw)) || (i.tenHang && i.tenHang.toLowerCase().includes(kw)) || (i.maImei && i.maImei.toLowerCase().includes(kw)))
    : store.data.danhSachImei;

  tbody.innerHTML = list.map(i => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-slate-600 whitespace-nowrap">${i.maImei}</td>
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${i.soImei}</td>
      <td class="p-3.5 font-semibold text-sm text-navy">${i.tenHang}</td>
      <td class="p-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">${i.soPN}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(i.trangThai)}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap">
        <button onclick="viewImeiTimeline('${i.soImei}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 rounded-lg text-xs font-bold transition-all shadow-sm">
          <i class="fa-solid fa-route text-[11px]"></i>
          <span>Truy vết</span>
        </button>
      </td>
    </tr>
  `).join('');
}

// -------------------------------------------------------------
// 14. HÓA ĐƠN BÁN HÀNG & IN LẠI HÓA ĐƠN (FR17, NFR05, BR24)
// -------------------------------------------------------------
function renderHoaDonListTable(keyword = '') {
  const tbody = document.getElementById('table-hoadon-list-body');
  if (!tbody) return;

  const kw = (keyword || '').toLowerCase().trim();
  const list = kw
    ? store.data.hoaDon.filter(h => (h.soHD && h.soHD.toLowerCase().includes(kw)) || (h.tenKH && h.tenKH.toLowerCase().includes(kw)) || (h.maImei && h.maImei.includes(kw)))
    : store.data.hoaDon;

  tbody.innerHTML = list.map(h => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-[#15803D] whitespace-nowrap">${h.soHD}</td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${h.ngayLap}</td>
      <td class="p-3.5 font-bold text-sm text-navy whitespace-nowrap">${h.tenKH}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.kenhBan)}</td>
      <td class="p-3.5 font-mono font-bold text-xs text-slate-700 whitespace-nowrap">${h.maImei || '-'}</td>
      <td class="p-3.5 font-bold text-sm text-slate-700 text-right whitespace-nowrap">${Format.currency(h.tongTien)}</td>
      <td class="p-3.5 text-xs text-rose-600 text-right whitespace-nowrap">-${Format.currency(h.tienGiamGia)}</td>
      <td class="p-3.5 font-bold text-sm text-[#15803D] text-right whitespace-nowrap">${Format.currency(h.thanhTien)}</td>
      <td class="p-3.5 text-xs text-center whitespace-nowrap">${Format.statusBadge(h.phuongThuc)}</td>
      <td class="p-3.5 text-xs text-right whitespace-nowrap">
        <button onclick="viewHoaDonDetail('${h.soHD}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-[#166534] hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">
          <i class="fa-solid fa-print text-[11px]"></i>
          <span>Xem & In HĐ</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function viewHoaDonDetail(soHD) {
  const h = store.data.hoaDon.find(item => item.soHD === soHD);
  if (!h) return;

  const bh = store.data.baoHanh.find(b => b.soHD === soHD || b.maImei === h.maImei);
  const container = document.getElementById('invoice-printable-content');
  if (!container) return;

  const vatPercent = 10;
  const vatAmount = Math.round((h.thanhTien * vatPercent) / 110);

  container.innerHTML = `
    <div class="border-b border-slate-300 pb-4 flex justify-between items-start">
      <div>
        <div class="font-extrabold text-slate-900 text-base tracking-tight">TITANSTORE VIỆT NAM</div>
        <div class="text-[11px] text-slate-500 mt-0.5">Hệ thống phân phối điện thoại & phụ kiện chính hãng</div>
        <div class="text-[11px] text-slate-500">Hotline: 1900 8888 | Website: https://titanstore.vn</div>
      </div>
      <div class="text-right">
        <div class="font-mono font-extrabold text-[#15803D] text-base">${h.soHD}</div>
        <div class="text-[11px] text-slate-500 mt-0.5">Ngày lập: ${h.ngayLap}</div>
        <div class="text-[11px] text-slate-500">Kênh bán: <strong class="uppercase">${h.kenhBan === 'tai_quay' ? 'Tại Quầy (POS)' : 'Trực Tuyến (Online)'}</strong></div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 py-2 border-b border-slate-200">
      <div>
        <span class="text-slate-400 font-bold uppercase text-[10px] block">Khách hàng:</span>
        <div class="font-bold text-slate-800 text-sm mt-0.5">${h.tenKH}</div>
        <div class="text-slate-600 text-[11px]">Mã KH: ${h.maKH || 'KH001'}</div>
      </div>
      <div>
        <span class="text-slate-400 font-bold uppercase text-[10px] block">Nhân viên phụ trách:</span>
        <div class="font-bold text-slate-800 text-sm mt-0.5">${h.maNV} - Trần Thị Thu Ngân</div>
        <div class="text-slate-600 text-[11px]">Phương thức: <strong class="uppercase">${h.phuongThuc}</strong></div>
      </div>
    </div>

    <div>
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="border-b border-slate-300 text-slate-500 text-[11px] font-bold uppercase">
            <th class="py-2">Mặt Hàng & Số IMEI</th>
            <th class="py-2 text-center w-16">SL</th>
            <th class="py-2 text-right w-28">Đơn Giá</th>
            <th class="py-2 text-right w-28">Thành Tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100">
            <td class="py-2.5">
              <div class="font-bold text-slate-900">${bh ? bh.tenHang : 'Thiết bị di động'}</div>
              ${h.maImei ? `<div class="font-mono text-[#15803D] text-[11px]">IMEI: ${h.maImei}</div>` : ''}
            </td>
            <td class="py-2.5 text-center font-bold">1</td>
            <td class="py-2.5 text-right font-mono">${Format.currency(h.tongTien)}</td>
            <td class="py-2.5 text-right font-mono font-bold">${Format.currency(h.tongTien)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-slate-300 pt-3 space-y-1.5 text-right text-xs">
      <div class="flex justify-between text-slate-600">
        <span>Tổng tiền hàng:</span>
        <span class="font-mono font-bold text-slate-800">${Format.currency(h.tongTien)}</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Thuế VAT (10% đã bao gồm theo quy tắc BR24):</span>
        <span class="font-mono text-slate-700">${Format.currency(vatAmount)}</span>
      </div>
      <div class="flex justify-between text-rose-600">
        <span>Chiết khấu khuyến mãi (BR11):</span>
        <span class="font-mono font-bold">-${Format.currency(h.tienGiamGia)}</span>
      </div>
      <div class="flex justify-between border-t border-slate-300 pt-2 text-sm font-extrabold text-[#166534]">
        <span>TỔNG TIỀN THANH TOÁN:</span>
        <span class="font-mono text-base">${Format.currency(h.thanhTien)}</span>
      </div>
    </div>

    ${bh ? `
      <div class="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 mt-4 space-y-1">
        <div class="font-bold text-blue-950 flex items-center gap-1.5">
          <i class="fa-solid fa-shield-halved text-[#15803D]"></i>
          <span>PHIẾU BẢO HÀNH ĐIỆN TỬ CHÍNH HÃNG (${bh.maBH})</span>
        </div>
        <div>Thiết bị: <strong>${bh.tenHang}</strong> | Số IMEI: <strong class="font-mono">${bh.maImei}</strong></div>
        <div>Hiệu lực bảo hành: Từ ngày <strong>${bh.ngayBD}</strong> đến ngày <strong>${bh.ngayKT}</strong> (12 Tháng chính hãng - BR12)</div>
        <div class="text-[11px] text-[#166534] italic">Đổi mới 1-1 trong vòng 30 ngày đầu tiên nếu phát sinh lỗi phần cứng từ nhà sản xuất (BR14).</div>
      </div>
    ` : ''}

    <div class="text-center text-[10px] text-slate-400 pt-2">
      Cảm ơn Quý khách đã mua sắm tại TitanStore! Vui lòng giữ hóa đơn để đối chiếu khi cần đổi trả hoặc bảo hành.
    </div>
  `;

  const modal = document.getElementById('modal-chitiethoadon');
  if (modal) modal.classList.remove('hidden');
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
function switchAdminRole(role) {
  const roleMap = {
    quanly: { title: 'Quản lý cửa hàng', name: 'Nguyễn Văn Quản', role: 'quanly' },
    banhang: { title: 'Nhân viên bán hàng', name: 'Lê Văn Bán Hàng', role: 'banhang' },
    thungan: { title: 'Thu ngân', name: 'Trần Thị Thu Ngân', role: 'thungan' },
    kho: { title: 'Nhân viên kho', name: 'Trần Văn Kho', role: 'kho' },
    kythuat: { title: 'Kỹ thuật viên', name: 'Phạm Kỹ Thuật', role: 'kythuat' }
  };
  const cur = roleMap[role] || roleMap.quanly;
  const roleSel = document.getElementById('admin-role-selector');
  if (roleSel && roleSel.value !== cur.role) roleSel.value = cur.role;

  const fullnameEl = document.getElementById('admin-user-fullname');
  const titleEl = document.getElementById('admin-user-title');
  const avatarEl = document.getElementById('admin-avatar-icon');
  if (fullnameEl) fullnameEl.textContent = cur.name;
  if (titleEl) titleEl.textContent = 'Chức vụ: ' + cur.title;
  if (avatarEl) avatarEl.textContent = cur.name.split(' ').pop().substring(0, 2).toUpperCase();

  applyRolePermissions(cur.role);
  showToast('Đã chuyển sang vai trò: ' + cur.title, 'info');
}

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
  if (window.TitanI18n) {
    window.TitanI18n.applyDOM();

    window.TitanI18n.onChange((cur) => {
      window.TitanI18n.applyDOM();
      renderSection(currentActiveSection || 'view-dashboard');
      showToast(cur === 'vi' ? 'Đã đổi sang Tiếng Việt 🇻🇳' : 'Switched language to English 🇬🇧', 'info');
    });
  }

  // Kiểm tra quyền truy cập: Chỉ nhân viên/Admin mới được vào admin.html
  if (window.TitanAuth) {
    const curUser = window.TitanAuth.getUser();
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
              <button onclick="window.TitanAuth.logout();" class="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors">Đổi Tài Khoản</button>
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

