package com.cuahangdienthoai.common;

import com.cuahangdienthoai.common.entity.ThamSo;
import com.cuahangdienthoai.common.repository.ThamSoRepository;
import com.cuahangdienthoai.customer.entity.KhachHang;
import com.cuahangdienthoai.customer.repository.KhachHangRepository;
import com.cuahangdienthoai.employee.entity.NhanVien;
import com.cuahangdienthoai.employee.entity.PhanQuyen;
import com.cuahangdienthoai.employee.entity.TaiKhoan;
import com.cuahangdienthoai.employee.repository.NhanVienRepository;
import com.cuahangdienthoai.employee.repository.PhanQuyenRepository;
import com.cuahangdienthoai.employee.repository.TaiKhoanRepository;
import com.cuahangdienthoai.order.entity.ChiTietDonHangOnline;
import com.cuahangdienthoai.order.entity.ChiTietHoaDon;
import com.cuahangdienthoai.order.entity.DonHangOnline;
import com.cuahangdienthoai.order.entity.HoaDon;
import com.cuahangdienthoai.order.entity.KhuyenMai;
import com.cuahangdienthoai.order.repository.ChiTietDonHangOnlineRepository;
import com.cuahangdienthoai.order.repository.ChiTietHoaDonRepository;
import com.cuahangdienthoai.order.repository.DonHangOnlineRepository;
import com.cuahangdienthoai.order.repository.HoaDonRepository;
import com.cuahangdienthoai.order.repository.KhuyenMaiRepository;
import com.cuahangdienthoai.product.entity.ChiTietThuocTinh;
import com.cuahangdienthoai.product.entity.ChiTietThuocTinhId;
import com.cuahangdienthoai.product.entity.LoaiHang;
import com.cuahangdienthoai.product.entity.MatHang;
import com.cuahangdienthoai.product.entity.NhomHang;
import com.cuahangdienthoai.product.entity.ThuocTinh;
import com.cuahangdienthoai.product.repository.ChiTietThuocTinhRepository;
import com.cuahangdienthoai.product.repository.LoaiHangRepository;
import com.cuahangdienthoai.product.repository.MatHangRepository;
import com.cuahangdienthoai.product.repository.NhomHangRepository;
import com.cuahangdienthoai.product.repository.ThuocTinhRepository;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhap;
import com.cuahangdienthoai.supplier.entity.ChiTietPhieuNhapId;
import com.cuahangdienthoai.supplier.entity.Imei;
import com.cuahangdienthoai.supplier.entity.NhaCungCap;
import com.cuahangdienthoai.supplier.entity.PhieuNhap;
import com.cuahangdienthoai.supplier.repository.ChiTietPhieuNhapRepository;
import com.cuahangdienthoai.supplier.repository.ImeiRepository;
import com.cuahangdienthoai.supplier.repository.NhaCungCapRepository;
import com.cuahangdienthoai.supplier.repository.PhieuNhapRepository;
import com.cuahangdienthoai.warranty.entity.BaoHanh;
import com.cuahangdienthoai.warranty.entity.PhieuTiepNhanBaoHanh;
import com.cuahangdienthoai.warranty.entity.TraHang;
import com.cuahangdienthoai.warranty.repository.BaoHanhRepository;
import com.cuahangdienthoai.warranty.repository.PhieuTiepNhanBaoHanhRepository;
import com.cuahangdienthoai.warranty.repository.TraHangRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final PhanQuyenRepository phanQuyenRepository;
    private final NhanVienRepository nhanVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final NhomHangRepository nhomHangRepository;
    private final LoaiHangRepository loaiHangRepository;
    private final ThuocTinhRepository thuocTinhRepository;
    private final MatHangRepository matHangRepository;
    private final ChiTietThuocTinhRepository chiTietThuocTinhRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final PhieuNhapRepository phieuNhapRepository;
    private final ChiTietPhieuNhapRepository chiTietPhieuNhapRepository;
    private final ImeiRepository imeiRepository;
    private final KhachHangRepository khachHangRepository;
    private final KhuyenMaiRepository khuyenMaiRepository;
    private final ThamSoRepository thamSoRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final BaoHanhRepository baoHanhRepository;
    private final TraHangRepository traHangRepository;
    private final PhieuTiepNhanBaoHanhRepository phieuTiepNhanBaoHanhRepository;
    private final DonHangOnlineRepository donHangOnlineRepository;
    private final ChiTietDonHangOnlineRepository chiTietDonHangOnlineRepository;

    @Override
    public void run(String... args) {
        try {
            initData();
        } catch (Exception e) {
            log.warn("Lưu ý khi nạp dữ liệu ban đầu: " + e.getMessage());
        }
    }

    private void initData() {
        if (matHangRepository.existsById("MH006")) {
            log.info("Cơ sở dữ liệu đã có dữ liệu mẫu đầy đủ, bỏ qua bước khởi tạo.");
            return;
        }

        log.info("Đang khởi tạo dữ liệu mẫu cho hệ thống Quản lý cửa hàng điện thoại CellphoneS...");

        // 1. Phân quyền (6 quyền theo kế hoạch và DFD)
        PhanQuyen pqAdmin = phanQuyenRepository.save(new PhanQuyen("ADMIN", "Quản trị viên", "Toàn quyền hệ thống"));
        PhanQuyen pqQuanLy = phanQuyenRepository.save(new PhanQuyen("QUANLY", "Quản lý cửa hàng", "Quản lý toàn bộ hoạt động"));
        PhanQuyen pqBanHang = phanQuyenRepository.save(new PhanQuyen("BANHANG", "Nhân viên bán hàng", "Lập đơn, POS, tư vấn"));
        PhanQuyen pqThuNgan = phanQuyenRepository.save(new PhanQuyen("THUNGAN", "Nhân viên thu ngân", "Xác nhận thu tiền, xuất hóa đơn, chi hoàn trả"));
        PhanQuyen pqKho = phanQuyenRepository.save(new PhanQuyen("KHO", "Nhân viên kho", "Quản lý nhập kho, IMEI, tồn kho"));
        PhanQuyen pqKyThuat = phanQuyenRepository.save(new PhanQuyen("KYTHUAT", "Nhân viên kỹ thuật", "Tiếp nhận và sửa chữa bảo hành"));

        // 2. Nhân viên
        NhanVien nv1 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV001").hoTen("Nguyễn Văn Quản").chucVu("Quản lý")
                .sdt("0901112233").email("quanly@cellphones.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(12)).build());

        NhanVien nv2 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV002").hoTen("Trần Thị Thu Ngân").chucVu("Thu ngân")
                .sdt("0902223344").email("thungan@cellphones.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(8)).build());

        NhanVien nv3 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV003").hoTen("Lê Văn Bán Hàng").chucVu("Bán hàng")
                .sdt("0903334455").email("banhang@cellphones.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(6)).build());

        NhanVien nv4 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV004").hoTen("Phạm Kỹ Thuật").chucVu("Kỹ thuật & Bảo hành")
                .sdt("0904445566").email("kythuat@cellphones.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(4)).build());

        NhanVien nv5 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV005").hoTen("Hoàng Văn Kho").chucVu("Kho")
                .sdt("0905556677").email("kho@cellphones.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(5)).build());

        // 3. Tài khoản tương ứng 6 vai trò (B2: Băm mật khẩu BCrypt)
        org.springframework.security.crypto.password.PasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String defaultBcrypt = encoder.encode("123456");

        if (!taiKhoanRepository.existsById("admin")) {
            taiKhoanRepository.save(TaiKhoan.builder()
                    .username("admin").passwordHash(defaultBcrypt).nhanVien(nv1).phanQuyen(pqAdmin)
                    .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        }

        NhanVien nv6 = nhanVienRepository.findById("NV006").orElseGet(() ->
                nhanVienRepository.save(NhanVien.builder()
                        .maNV("NV006").hoTen("Nguyễn Quản Lý").chucVu("Quản lý")
                        .sdt("0906667788").email("quanly2@cellphones.vn").trangThai("dang_lam")
                        .ngayVaoLam(LocalDateTime.now().minusMonths(10)).build())
        );

        if (!taiKhoanRepository.existsById("quanly")) {
            taiKhoanRepository.save(TaiKhoan.builder()
                    .username("quanly").passwordHash(defaultBcrypt).nhanVien(nv6).phanQuyen(pqQuanLy)
                    .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        }
        if (!taiKhoanRepository.existsById("thungan")) {
            taiKhoanRepository.save(TaiKhoan.builder()
                    .username("thungan").passwordHash(defaultBcrypt).nhanVien(nv2).phanQuyen(pqThuNgan)
                    .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        }
        if (!taiKhoanRepository.existsById("banhang")) {
            taiKhoanRepository.save(TaiKhoan.builder()
                    .username("banhang").passwordHash(defaultBcrypt).nhanVien(nv3).phanQuyen(pqBanHang)
                    .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        }
        if (!taiKhoanRepository.existsById("kythuat")) {
            taiKhoanRepository.save(TaiKhoan.builder()
                    .username("kythuat").passwordHash(defaultBcrypt).nhanVien(nv4).phanQuyen(pqKyThuat)
                    .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        }
        if (!taiKhoanRepository.existsById("kho")) {
            taiKhoanRepository.save(TaiKhoan.builder()
                    .username("kho").passwordHash(defaultBcrypt).nhanVien(nv5).phanQuyen(pqKho)
                    .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        }

        // Tự động nâng cấp các tài khoản hiện có chưa băm BCrypt
        taiKhoanRepository.findAll().forEach(tk -> {
            if (tk.getPasswordHash() != null && !tk.getPasswordHash().startsWith("$2a$") && !tk.getPasswordHash().startsWith("$2b$")) {
                tk.setPasswordHash(encoder.encode(tk.getPasswordHash()));
                taiKhoanRepository.save(tk);
            }
        });

        // 4. Nhóm hàng & Loại hàng
        NhomHang nh1 = nhomHangRepository.save(new NhomHang("NH01", "Điện thoại di động"));
        NhomHang nh2 = nhomHangRepository.save(new NhomHang("NH02", "Phụ kiện công nghệ"));

        LoaiHang lhApple = loaiHangRepository.save(new LoaiHang("LH01", "Apple iPhone"));
        LoaiHang lhSamsung = loaiHangRepository.save(new LoaiHang("LH02", "Samsung Galaxy"));
        LoaiHang lhXiaomi = loaiHangRepository.save(new LoaiHang("LH03", "Xiaomi"));
        LoaiHang lhOppo = loaiHangRepository.save(new LoaiHang("LH04", "OPPO"));
        LoaiHang lhSacCap = loaiHangRepository.save(new LoaiHang("LH05", "Sạc & Cáp"));
        LoaiHang lhTaiNghe = loaiHangRepository.save(new LoaiHang("LH06", "Tai nghe"));
        LoaiHang lhOpLung = loaiHangRepository.save(new LoaiHang("LH07", "Ốp lưng & Bao da"));

        // 5. Thuộc tính kỹ thuật
        ThuocTinh ttRam = thuocTinhRepository.save(new ThuocTinh("TT01", "RAM"));
        ThuocTinh ttBoNho = thuocTinhRepository.save(new ThuocTinh("TT02", "Bộ nhớ trong"));
        ThuocTinh ttManHinh = thuocTinhRepository.save(new ThuocTinh("TT03", "Màn hình"));
        ThuocTinh ttChip = thuocTinhRepository.save(new ThuocTinh("TT04", "Vi xử lý (Chip)"));
        ThuocTinh ttCamera = thuocTinhRepository.save(new ThuocTinh("TT05", "Camera"));
        ThuocTinh ttPin = thuocTinhRepository.save(new ThuocTinh("TT06", "Pin & Sạc"));

        // 6. Mặt hàng: Máy (QUANLYIMEI=true, THOIHANBAOHANH=12), Phụ kiện (QUANLYIMEI=false, THOIHANBAOHANH=0)
        MatHang mh1 = matHangRepository.save(MatHang.builder()
                .maHang("MH001").tenHang("iPhone 16 Pro Max 256GB")
                .donGia(new BigDecimal("31490000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lhApple).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh2 = matHangRepository.save(MatHang.builder()
                .maHang("MH002").tenHang("iPhone 16 Pro 128GB")
                .donGia(new BigDecimal("27990000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lhApple).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh3 = matHangRepository.save(MatHang.builder()
                .maHang("MH003").tenHang("Samsung Galaxy S24 Ultra 256GB")
                .donGia(new BigDecimal("28490000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lhSamsung).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh4 = matHangRepository.save(MatHang.builder()
                .maHang("MH004").tenHang("Xiaomi 14 256GB")
                .donGia(new BigDecimal("18990000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lhXiaomi).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh5 = matHangRepository.save(MatHang.builder()
                .maHang("MH005").tenHang("OPPO Reno 12 5G")
                .donGia(new BigDecimal("12990000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lhOppo).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh6 = matHangRepository.save(MatHang.builder()
                .maHang("MH006").tenHang("Củ sạc Apple 20W Type-C")
                .donGia(new BigDecimal("550000")).dvt("Cái")
                .nhomHang(nh2).loaiHang(lhSacCap).quanLyImei(false).thoiHanBaoHanh(0).build());

        MatHang mh7 = matHangRepository.save(MatHang.builder()
                .maHang("MH007").tenHang("Cáp sạc Type-C to Type-C 60W")
                .donGia(new BigDecimal("290000")).dvt("Cái")
                .nhomHang(nh2).loaiHang(lhSacCap).quanLyImei(false).thoiHanBaoHanh(0).build());

        MatHang mh8 = matHangRepository.save(MatHang.builder()
                .maHang("MH008").tenHang("Tai nghe Apple AirPods Pro 2")
                .donGia(new BigDecimal("5990000")).dvt("Cái")
                .nhomHang(nh2).loaiHang(lhTaiNghe).quanLyImei(false).thoiHanBaoHanh(0).build());

        MatHang mh9 = matHangRepository.save(MatHang.builder()
                .maHang("MH009").tenHang("Ốp lưng MagSafe iPhone 16 Pro Max")
                .donGia(new BigDecimal("450000")).dvt("Cái")
                .nhomHang(nh2).loaiHang(lhOpLung).quanLyImei(false).thoiHanBaoHanh(0).build());

        // Chi tiết thuộc tính cho từng máy
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT01"), mh1, ttRam, "8 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT02"), mh1, ttBoNho, "256 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT03"), mh1, ttManHinh, "6.9 inch OLED Super Retina XDR 120Hz"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT04"), mh1, ttChip, "Apple A18 Pro 3nm"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT05"), mh1, ttCamera, "48MP Chính + 48MP Siêu rộng + 12MP Tele 5x"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT06"), mh1, ttPin, "4685 mAh, Sạc nhanh 30W"));

        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH002", "TT01"), mh2, ttRam, "8 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH002", "TT02"), mh2, ttBoNho, "128 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH002", "TT03"), mh2, ttManHinh, "6.3 inch OLED Super Retina XDR 120Hz"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH002", "TT04"), mh2, ttChip, "Apple A18 Pro 3nm"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH002", "TT05"), mh2, ttCamera, "48MP Chính + 48MP Góc rộng + 12MP Tele 5x"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH002", "TT06"), mh2, ttPin, "3582 mAh, Sạc nhanh 25W"));

        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH003", "TT01"), mh3, ttRam, "12 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH003", "TT02"), mh3, ttBoNho, "256 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH003", "TT03"), mh3, ttManHinh, "6.8 inch Dynamic AMOLED 2X 120Hz QHD+"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH003", "TT04"), mh3, ttChip, "Snapdragon 8 Gen 3 for Galaxy"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH003", "TT05"), mh3, ttCamera, "200MP Chính + 50MP + 12MP + 10MP"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH003", "TT06"), mh3, ttPin, "5000 mAh, Sạc nhanh 45W"));

        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH004", "TT01"), mh4, ttRam, "12 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH004", "TT02"), mh4, ttBoNho, "256 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH004", "TT03"), mh4, ttManHinh, "6.36 inch AMOLED 1.5K 120Hz LTPO"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH004", "TT04"), mh4, ttChip, "Snapdragon 8 Gen 3"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH004", "TT05"), mh4, ttCamera, "Leica 50MP Chính + 50MP Tele + 50MP Góc rộng"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH004", "TT06"), mh4, ttPin, "4610 mAh, Sạc nhanh HyperCharge 90W"));

        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH005", "TT01"), mh5, ttRam, "12 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH005", "TT02"), mh5, ttBoNho, "256 GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH005", "TT03"), mh5, ttManHinh, "6.7 inch AMOLED 120Hz FHD+"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH005", "TT04"), mh5, ttChip, "MediaTek Dimensity 7300-Energy"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH005", "TT05"), mh5, ttCamera, "50MP Sony LYT-600 OIS + 8MP + 2MP"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH005", "TT06"), mh5, ttPin, "5000 mAh, Sạc SUPERVOOC 80W"));

        // 7. Nhà cung cấp
        NhaCungCap ncc1 = nhaCungCapRepository.save(NhaCungCap.builder()
                .maNCC("NCC01").tenNCC("Công ty TNHH Apple Việt Nam")
                .sdt("02838222333").email("contact@apple.vn").diaChi("Tòa nhà Deutsches Haus, TP.HCM").build());

        NhaCungCap ncc2 = nhaCungCapRepository.save(NhaCungCap.builder()
                .maNCC("NCC02").tenNCC("Công ty CP Phân Phối Synnex FPT")
                .sdt("02473006666").email("synnex@fpt.com.vn").diaChi("Tòa nhà FPT, Cầu Giấy, Hà Nội").build());

        // 8. Phiếu nhập & Chi tiết & IMEI
        PhieuNhap pn1 = phieuNhapRepository.save(PhieuNhap.builder()
                .soPNhap("PN001").ngayNhap(LocalDateTime.now().minusDays(15))
                .nhaCungCap(ncc1).nhanVien(nv1).build());

        ChiTietPhieuNhap ctpn1 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH001"))
                .phieuNhap(pn1).matHang(mh1).slNhap(30).donGiaNhap(new BigDecimal("28000000")).build());

        ChiTietPhieuNhap ctpn2 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH002"))
                .phieuNhap(pn1).matHang(mh2).slNhap(20).donGiaNhap(new BigDecimal("24500000")).build());

        ChiTietPhieuNhap ctpn3 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH003"))
                .phieuNhap(pn1).matHang(mh3).slNhap(15).donGiaNhap(new BigDecimal("25000000")).build());

        ChiTietPhieuNhap ctpn4 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH004"))
                .phieuNhap(pn1).matHang(mh4).slNhap(20).donGiaNhap(new BigDecimal("16000000")).build());

        ChiTietPhieuNhap ctpn5 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH005"))
                .phieuNhap(pn1).matHang(mh5).slNhap(25).donGiaNhap(new BigDecimal("10500000")).build());

        ChiTietPhieuNhap ctpn6 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH006"))
                .phieuNhap(pn1).matHang(mh6).slNhap(50).donGiaNhap(new BigDecimal("400000")).build());

        ChiTietPhieuNhap ctpn7 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH007"))
                .phieuNhap(pn1).matHang(mh7).slNhap(50).donGiaNhap(new BigDecimal("200000")).build());

        ChiTietPhieuNhap ctpn8 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH008"))
                .phieuNhap(pn1).matHang(mh8).slNhap(20).donGiaNhap(new BigDecimal("4800000")).build());

        ChiTietPhieuNhap ctpn9 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH009"))
                .phieuNhap(pn1).matHang(mh9).slNhap(40).donGiaNhap(new BigDecimal("300000")).build());

        // IMEI 15 chữ số hợp lệ cho các máy (khởi tạo con_hang để trg_ChiTietHoaDon tự cập nhật da_ban khi bán)
        Imei imei1 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI001").chiTietPhieuNhap(ctpn1).soIMEI("356789123456781").trangThai("con_hang").build());
        Imei imei2 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI002").chiTietPhieuNhap(ctpn1).soIMEI("356789123456782").trangThai("con_hang").build());
        Imei imei3 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI003").chiTietPhieuNhap(ctpn1).soIMEI("356789123456783").trangThai("con_hang").build());
        Imei imei4 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI004").chiTietPhieuNhap(ctpn1).soIMEI("356789123456784").trangThai("con_hang").build());

        Imei imei5 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI005").chiTietPhieuNhap(ctpn2).soIMEI("356789123456785").trangThai("con_hang").build());
        Imei imei6 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI006").chiTietPhieuNhap(ctpn2).soIMEI("356789123456786").trangThai("con_hang").build());

        Imei imei7 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI007").chiTietPhieuNhap(ctpn3).soIMEI("356789123456787").trangThai("con_hang").build());
        Imei imei8 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI008").chiTietPhieuNhap(ctpn3).soIMEI("356789123456788").trangThai("con_hang").build());

        Imei imei9 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI009").chiTietPhieuNhap(ctpn4).soIMEI("356789123456789").trangThai("con_hang").build());
        Imei imei10 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI010").chiTietPhieuNhap(ctpn5).soIMEI("356789123456790").trangThai("con_hang").build());

        // 9. Khách hàng
        KhachHang kh1 = khachHangRepository.save(KhachHang.builder()
                .maKH("KH001").hoTen("Nguyễn Hoàng Long")
                .sdt("0987654321").email("long.nh@gmail.com").diaChi("128 Trần Duy Hưng, Cầu Giấy, Hà Nội").build());

        KhachHang kh2 = khachHangRepository.save(KhachHang.builder()
                .maKH("KH002").hoTen("Lê Thị Ngọc Mai")
                .sdt("0912345678").email("mai.le@yahoo.com").diaChi("45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh").build());

        KhachHang kh3 = khachHangRepository.save(KhachHang.builder()
                .maKH("KH003").hoTen("Trần Minh Đức")
                .sdt("0903888999").email("duc.tran@outlook.com").diaChi("23 Nguyễn Văn Linh, Đà Nẵng").build());

        // 10. Khuyến mãi đang hoạt động
        KhuyenMai km1 = khuyenMaiRepository.save(KhuyenMai.builder()
                .maKM("KM01").tenKM("Mở bán siêu phẩm điện thoại")
                .phanTramGiam(new BigDecimal("10.00"))
                .ngayBD(LocalDateTime.now().minusDays(10))
                .ngayKT(LocalDateTime.now().plusDays(20))
                .tamDung(false).build());

        KhuyenMai km2 = khuyenMaiRepository.save(KhuyenMai.builder()
                .maKM("KM02").tenKM("Ưu đãi thanh toán Chuyển khoản")
                .phanTramGiam(new BigDecimal("2.00"))
                .ngayBD(LocalDateTime.now().minusDays(5))
                .ngayKT(LocalDateTime.now().plusDays(25))
                .tamDung(false).build());

        KhuyenMai km3 = khuyenMaiRepository.save(KhuyenMai.builder()
                .maKM("KM03").tenKM("Tri ân thành viên S-Member")
                .phanTramGiam(new BigDecimal("5.00"))
                .ngayBD(LocalDateTime.now().minusDays(2))
                .ngayKT(LocalDateTime.now().plusDays(30))
                .tamDung(false).build());

        // 11. Tham số hệ thống
        thamSoRepository.save(new ThamSo("VAT_PHANTRAM", "Thuế VAT đã gồm trong giá bán", new BigDecimal("10.00"), "%"));
        thamSoRepository.save(new ThamSo("DIEM_MOI_VND", "Số tiền chi tiêu để được 1 điểm", new BigDecimal("100000.00"), "VND"));
        thamSoRepository.save(new ThamSo("HAN_DOITRA_NGAY", "Hạn đổi trả tính từ ngày lập hóa đơn", new BigDecimal("30.00"), "ngày"));

        // 12. Hóa đơn & Chi tiết hóa đơn
        HoaDon hd1 = hoaDonRepository.save(HoaDon.builder()
                .soHD("HD00891").ngayLap(LocalDateTime.now().minusDays(1))
                .khachHang(kh2).nhanVien(nv2).khuyenMai(km1).kenhBan("tai_quay")
                .tongTien(new BigDecimal("31490000")).tienGiamGia(new BigDecimal("3149000"))
                .phuongThucThanhToan("chuyen_khoan").build());

        chiTietHoaDonRepository.save(ChiTietHoaDon.builder()
                .hoaDon(hd1).matHang(mh1).imei(imei1).slBan(1).donGiaBan(new BigDecimal("31490000")).build());

        HoaDon hd2 = hoaDonRepository.save(HoaDon.builder()
                .soHD("HD00890").ngayLap(LocalDateTime.now().minusDays(2))
                .khachHang(kh3).nhanVien(nv2).khuyenMai(km1).kenhBan("online")
                .tongTien(new BigDecimal("31490000")).tienGiamGia(new BigDecimal("3149000"))
                .phuongThucThanhToan("the").build());

        chiTietHoaDonRepository.save(ChiTietHoaDon.builder()
                .hoaDon(hd2).matHang(mh1).imei(imei2).slBan(1).donGiaBan(new BigDecimal("31490000")).build());

        // 13. Bảo hành (mỗi IMEI đã bán tạo 1 sổ bảo hành)
        BaoHanh bh1 = baoHanhRepository.save(BaoHanh.builder()
                .maBH("BH001").hoaDon(hd1).imei(imei1)
                .ngayBD(LocalDateTime.now().minusDays(1)).thoiHanThang(12)
                .dieuKien("Bảo hành chính hãng 12 tháng Apple").build());

        BaoHanh bh2 = baoHanhRepository.save(BaoHanh.builder()
                .maBH("BH002").hoaDon(hd2).imei(imei2)
                .ngayBD(LocalDateTime.now().minusDays(2)).thoiHanThang(12)
                .dieuKien("Bảo hành chính hãng 12 tháng Apple").build());

        // 14. Tiếp nhận bảo hành
        phieuTiepNhanBaoHanhRepository.save(PhieuTiepNhanBaoHanh.builder()
                .maTN("TN001").baoHanh(bh1).ngayNhan(LocalDateTime.now())
                .tinhTrangLoi("Loa trong hơi rè khi đàm thoại")
                .nhanVienTiepNhan(nv4).nhanVienKyThuat(nv4)
                .ngayHenTra(LocalDateTime.now().plusDays(2))
                .chiPhi(BigDecimal.ZERO).trangThai("dang_sua").build());

        // 15. Trả hàng
        traHangRepository.save(TraHang.builder()
                .maTR("TR001").hoaDon(hd1).imei(imei1)
                .ngayTR(LocalDateTime.now())
                .lyDo("Lỗi cảm ứng màn hình nhà sản xuất")
                .hinhThucHoanTien("doi_hang").nhanVien(nv1).build());

        // 16. Đơn hàng online
        DonHangOnline dhol1 = donHangOnlineRepository.save(DonHangOnline.builder()
                .maDH("DH100234").ngayDat(LocalDateTime.now().minusHours(3))
                .maKH("KH001").tenNguoiNhan("Nguyễn Hoàng Long").sdtNguoiNhan("0987654321")
                .diaChiGiao("128 Trần Duy Hưng, Cầu Giấy, Hà Nội").phuongThucThanhToan("cod")
                .tongTien(new BigDecimal("31490000")).trangThai("cho_xac_nhan").build());

        chiTietDonHangOnlineRepository.save(ChiTietDonHangOnline.builder()
                .maDH(dhol1.getMaDH()).maHang(mh1.getMaHang()).soLuong(1).donGia(new BigDecimal("31490000")).build());

        DonHangOnline dhol2 = donHangOnlineRepository.save(DonHangOnline.builder()
                .maDH("DH100230").ngayDat(LocalDateTime.now().minusDays(1))
                .maKH("KH002").tenNguoiNhan("Lê Thị Ngọc Mai").sdtNguoiNhan("0912345678")
                .diaChiGiao("45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh").phuongThucThanhToan("chuyen_khoan")
                .tongTien(new BigDecimal("28490000")).trangThai("da_xac_nhan").build());

        chiTietDonHangOnlineRepository.save(ChiTietDonHangOnline.builder()
                .maDH(dhol2.getMaDH()).maHang(mh3.getMaHang()).soLuong(1).donGia(new BigDecimal("28490000")).build());

        DonHangOnline dhol3 = donHangOnlineRepository.save(DonHangOnline.builder()
                .maDH("DH100215").ngayDat(LocalDateTime.now().minusDays(2))
                .maKH("KH003").tenNguoiNhan("Trần Minh Đức").sdtNguoiNhan("0903888999")
                .diaChiGiao("23 Nguyễn Văn Linh, Đà Nẵng").phuongThucThanhToan("the")
                .tongTien(new BigDecimal("18990000")).trangThai("hoan_thanh").build());

        chiTietDonHangOnlineRepository.save(ChiTietDonHangOnline.builder()
                .maDH(dhol3.getMaDH()).maHang(mh4.getMaHang()).soLuong(1).donGia(new BigDecimal("18990000")).build());

        log.info("Khởi tạo toàn bộ dữ liệu mẫu CellphoneS thành công!");
    }
}
