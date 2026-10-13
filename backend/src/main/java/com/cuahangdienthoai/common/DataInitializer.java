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
import org.springframework.transaction.annotation.Transactional;

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
        if (phanQuyenRepository.count() > 0) {
            log.info("Cơ sở dữ liệu đã có dữ liệu, bỏ qua bước khởi tạo mẫu.");
            return;
        }

        log.info("Đang khởi tạo dữ liệu mẫu cho hệ thống Quản lý cửa hàng điện thoại...");

        // 1. Phân quyền
        PhanQuyen pqAdmin = phanQuyenRepository.save(new PhanQuyen("ADMIN", "Quản trị viên", "Toàn quyền hệ thống"));
        PhanQuyen pqQuanLy = phanQuyenRepository.save(new PhanQuyen("QUANLY", "Quản lý", "Quản lý cửa hàng"));
        PhanQuyen pqBanHang = phanQuyenRepository.save(new PhanQuyen("BANHANG", "Bán hàng", "Nhân viên bán hàng"));
        PhanQuyen pqThuNgan = phanQuyenRepository.save(new PhanQuyen("THUNGAN", "Thu ngân", "Nhân viên thu ngân"));
        PhanQuyen pqKyThuat = phanQuyenRepository.save(new PhanQuyen("KYTHUAT", "Kỹ thuật & Bảo hành", "Nhân viên kỹ thuật"));

        // 2. Nhân viên
        NhanVien nv1 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV001").hoTen("Nguyễn Văn Quản").chucVu("Quản lý")
                .sdt("0901112233").email("quanly@titanstore.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(12)).build());

        NhanVien nv2 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV002").hoTen("Trần Thị Thu Ngân").chucVu("Thu ngân")
                .sdt("0902223344").email("thungan@titanstore.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(8)).build());

        NhanVien nv3 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV003").hoTen("Lê Văn Bán Hàng").chucVu("Bán hàng")
                .sdt("0903334455").email("banhang@titanstore.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(6)).build());

        NhanVien nv4 = nhanVienRepository.save(NhanVien.builder()
                .maNV("NV004").hoTen("Phạm Kỹ Thuật").chucVu("Kỹ thuật & Bảo hành")
                .sdt("0904445566").email("kythuat@titanstore.vn").trangThai("dang_lam")
                .ngayVaoLam(LocalDateTime.now().minusMonths(4)).build());

        // 3. Tài khoản (mỗi nhân viên chỉ có 1 tài khoản do ràng buộc UQ_TaiKhoan_MaNV)
        taiKhoanRepository.save(TaiKhoan.builder()
                .username("admin").passwordHash("123456").nhanVien(nv1).phanQuyen(pqAdmin)
                .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        taiKhoanRepository.save(TaiKhoan.builder()
                .username("thungan").passwordHash("123456").nhanVien(nv2).phanQuyen(pqThuNgan)
                .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        taiKhoanRepository.save(TaiKhoan.builder()
                .username("banhang").passwordHash("123456").nhanVien(nv3).phanQuyen(pqBanHang)
                .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());
        taiKhoanRepository.save(TaiKhoan.builder()
                .username("kythuat").passwordHash("123456").nhanVien(nv4).phanQuyen(pqKyThuat)
                .trangThai("hoat_dong").ngayTao(LocalDateTime.now()).build());

        // 4. Nhóm hàng & Loại hàng
        NhomHang nh1 = nhomHangRepository.save(new NhomHang("NH01", "Điện thoại di động"));
        NhomHang nh2 = nhomHangRepository.save(new NhomHang("NH02", "Phụ kiện chính hãng"));
        NhomHang nh3 = nhomHangRepository.save(new NhomHang("NH03", "Thiết bị âm thanh"));

        LoaiHang lh1 = loaiHangRepository.save(new LoaiHang("LH01", "Apple iPhone"));
        LoaiHang lh2 = loaiHangRepository.save(new LoaiHang("LH02", "Samsung Galaxy"));
        LoaiHang lh3 = loaiHangRepository.save(new LoaiHang("LH03", "Sạc & Cáp"));

        // 5. Thuộc tính
        ThuocTinh ttDungLuong = thuocTinhRepository.save(new ThuocTinh("TT01", "Dung lượng bộ nhớ"));
        ThuocTinh ttMauSac = thuocTinhRepository.save(new ThuocTinh("TT02", "Màu sắc vỏ máy"));
        ThuocTinh ttManHinh = thuocTinhRepository.save(new ThuocTinh("TT03", "Kích thước màn hình"));
        ThuocTinh ttChip = thuocTinhRepository.save(new ThuocTinh("TT04", "Vi xử lý CPU"));

        // 6. Mặt hàng
        MatHang mh1 = matHangRepository.save(MatHang.builder()
                .maHang("MH001").tenHang("iPhone 16 Pro Max 256GB")
                .donGia(new BigDecimal("31490000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lh1).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh2 = matHangRepository.save(MatHang.builder()
                .maHang("MH002").tenHang("iPhone 16 Pro Max 512GB")
                .donGia(new BigDecimal("36990000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lh1).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh3 = matHangRepository.save(MatHang.builder()
                .maHang("MH003").tenHang("iPhone 16 Pro Max 1TB")
                .donGia(new BigDecimal("42490000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lh1).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh4 = matHangRepository.save(MatHang.builder()
                .maHang("MH004").tenHang("iPhone 16 Pro 128GB")
                .donGia(new BigDecimal("27990000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lh1).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh5 = matHangRepository.save(MatHang.builder()
                .maHang("MH005").tenHang("Samsung Galaxy S24 Ultra 256GB")
                .donGia(new BigDecimal("28490000")).dvt("Cái")
                .nhomHang(nh1).loaiHang(lh2).quanLyImei(true).thoiHanBaoHanh(12).build());

        MatHang mh6 = matHangRepository.save(MatHang.builder()
                .maHang("MH006").tenHang("Củ sạc Apple 20W USB-C")
                .donGia(new BigDecimal("550000")).dvt("Cái")
                .nhomHang(nh2).loaiHang(lh3).quanLyImei(false).thoiHanBaoHanh(6).build());

        MatHang mh7 = matHangRepository.save(MatHang.builder()
                .maHang("MH007").tenHang("Ốp lưng MagSafe iPhone 16 Pro Max")
                .donGia(new BigDecimal("450000")).dvt("Cái")
                .nhomHang(nh2).loaiHang(lh3).quanLyImei(false).thoiHanBaoHanh(0).build());

        // Chi tiết thuộc tính
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT01"), mh1, ttDungLuong, "256GB"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT02"), mh1, ttMauSac, "Titan Sa Mạc"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT03"), mh1, ttManHinh, "6.9 inch Super Retina XDR"));
        chiTietThuocTinhRepository.save(new ChiTietThuocTinh(new ChiTietThuocTinhId("MH001", "TT04"), mh1, ttChip, "Apple A18 Pro 3nm"));

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
                .phieuNhap(pn1).matHang(mh2).slNhap(20).donGiaNhap(new BigDecimal("33000000")).build());

        ChiTietPhieuNhap ctpn3 = chiTietPhieuNhapRepository.save(ChiTietPhieuNhap.builder()
                .id(new ChiTietPhieuNhapId("PN001", "MH003"))
                .phieuNhap(pn1).matHang(mh3).slNhap(10).donGiaNhap(new BigDecimal("38000000")).build());

        Imei imei1 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI001").chiTietPhieuNhap(ctpn1).soIMEI("356789123456781").trangThai("da_ban").build());
        Imei imei2 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI002").chiTietPhieuNhap(ctpn1).soIMEI("356789123456782").trangThai("da_ban").build());
        Imei imei3 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI003").chiTietPhieuNhap(ctpn1).soIMEI("356789123456783").trangThai("con_hang").build());
        Imei imei4 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI004").chiTietPhieuNhap(ctpn2).soIMEI("356789123456784").trangThai("con_hang").build());
        Imei imei5 = imeiRepository.save(Imei.builder()
                .maIMEI("IMEI005").chiTietPhieuNhap(ctpn3).soIMEI("356789123456785").trangThai("con_hang").build());

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

        // 10. Khuyến mãi
        KhuyenMai km1 = khuyenMaiRepository.save(KhuyenMai.builder()
                .maKM("KM01").tenKM("Mở bán siêu phẩm iPhone 16")
                .phanTramGiam(new BigDecimal("10.00"))
                .ngayBD(LocalDateTime.now().minusDays(10))
                .ngayKT(LocalDateTime.now().plusDays(20))
                .tamDung(false).build());

        KhuyenMai km2 = khuyenMaiRepository.save(KhuyenMai.builder()
                .maKM("KM02").tenKM("Ưu đãi thanh toán QR Napas")
                .phanTramGiam(new BigDecimal("2.00"))
                .ngayBD(LocalDateTime.now().minusDays(5))
                .ngayKT(LocalDateTime.now().plusDays(25))
                .tamDung(false).build());

        // 11. Tham số hệ thống
        thamSoRepository.save(new ThamSo("VAT_PHANTRAM", "Thuế VAT đã gồm trong giá bán", new BigDecimal("10.00"), "%"));
        thamSoRepository.save(new ThamSo("DIEM_MOI_VND", "Số tiền chi tiêu để được 1 điểm", new BigDecimal("100000.00"), "VND"));
        thamSoRepository.save(new ThamSo("HAN_DOITRA_NGAY", "Hạn đổi trả tính từ ngày lập hóa đơn", new BigDecimal("30.00"), "ngày"));

        // 12. Hóa đơn & Chi tiết hóa đơn
        HoaDon hd1 = hoaDonRepository.save(HoaDon.builder()
                .soHD("HD00891").ngayLap(LocalDateTime.now().minusDays(1))
                .khachHang(kh2).nhanVien(nv2).khuyenMai(km1).kenhBan("tai_quay")
                .tongTien(new BigDecimal("36990000")).tienGiamGia(new BigDecimal("3699000"))
                .phuongThucThanhToan("chuyen_khoan").build());

        chiTietHoaDonRepository.save(ChiTietHoaDon.builder()
                .hoaDon(hd1).matHang(mh2).imei(imei1).slBan(1).donGiaBan(new BigDecimal("36990000")).build());

        HoaDon hd2 = hoaDonRepository.save(HoaDon.builder()
                .soHD("HD00890").ngayLap(LocalDateTime.now().minusDays(2))
                .khachHang(kh3).nhanVien(nv2).khuyenMai(km1).kenhBan("online")
                .tongTien(new BigDecimal("31490000")).tienGiamGia(new BigDecimal("3149000"))
                .phuongThucThanhToan("the").build());

        chiTietHoaDonRepository.save(ChiTietHoaDon.builder()
                .hoaDon(hd2).matHang(mh1).imei(imei2).slBan(1).donGiaBan(new BigDecimal("31490000")).build());

        // 13. Bảo hành
        BaoHanh bh1 = baoHanhRepository.save(BaoHanh.builder()
                .maBH("BH001").hoaDon(hd1).imei(imei1)
                .ngayBD(LocalDateTime.now().minusDays(1)).thoiHanThang(12)
                .dieuKien("Bảo hành chính hãng 12 tháng Apple").build());

        BaoHanh bh2 = baoHanhRepository.save(BaoHanh.builder()
                .maBH("BH002").hoaDon(hd2).imei(imei2)
                .ngayBD(LocalDateTime.now().minusDays(2)).thoiHanThang(12)
                .dieuKien("Bảo hành tiêu chuẩn Apple").build());

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
                .tongTien(new BigDecimal("36990000")).trangThai("da_xac_nhan").build());

        chiTietDonHangOnlineRepository.save(ChiTietDonHangOnline.builder()
                .maDH(dhol2.getMaDH()).maHang(mh2.getMaHang()).soLuong(1).donGia(new BigDecimal("36990000")).build());

        DonHangOnline dhol3 = donHangOnlineRepository.save(DonHangOnline.builder()
                .maDH("DH100215").ngayDat(LocalDateTime.now().minusDays(2))
                .maKH("KH003").tenNguoiNhan("Trần Minh Đức").sdtNguoiNhan("0903888999")
                .diaChiGiao("23 Nguyễn Văn Linh, Đà Nẵng").phuongThucThanhToan("the")
                .tongTien(new BigDecimal("31490000")).trangThai("hoan_thanh").build());

        chiTietDonHangOnlineRepository.save(ChiTietDonHangOnline.builder()
                .maDH(dhol3.getMaDH()).maHang(mh1.getMaHang()).soLuong(1).donGia(new BigDecimal("31490000")).build());

        log.info("Khởi tạo toàn bộ dữ liệu mẫu thành công!");
    }
}
