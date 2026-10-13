USE QuanLyCuaHangDienThoai;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.seq_PhieuNhap', 'SO') IS NULL CREATE SEQUENCE dbo.seq_PhieuNhap AS BIGINT START WITH 1 INCREMENT BY 1;
IF OBJECT_ID('dbo.seq_HoaDon', 'SO') IS NULL CREATE SEQUENCE dbo.seq_HoaDon AS BIGINT START WITH 1 INCREMENT BY 1;
IF OBJECT_ID('dbo.seq_BaoHanh', 'SO') IS NULL CREATE SEQUENCE dbo.seq_BaoHanh AS BIGINT START WITH 1 INCREMENT BY 1;
IF OBJECT_ID('dbo.seq_TraHang', 'SO') IS NULL CREATE SEQUENCE dbo.seq_TraHang AS BIGINT START WITH 1 INCREMENT BY 1;
IF OBJECT_ID('dbo.seq_TiepNhan', 'SO') IS NULL CREATE SEQUENCE dbo.seq_TiepNhan AS BIGINT START WITH 1 INCREMENT BY 1;
IF OBJECT_ID('dbo.seq_DonHang', 'SO') IS NULL CREATE SEQUENCE dbo.seq_DonHang AS BIGINT START WITH 1 INCREMENT BY 1;
GO

IF TYPE_ID('dbo.tt_ChiTietNhap') IS NULL
CREATE TYPE dbo.tt_ChiTietNhap AS TABLE (
    MAHANG      VARCHAR(10)   NOT NULL PRIMARY KEY,
    SLNHAP      INT           NOT NULL,
    DONGIA_NHAP DECIMAL(18,2) NOT NULL
);
GO

IF TYPE_ID('dbo.tt_IMEINhap') IS NULL
CREATE TYPE dbo.tt_IMEINhap AS TABLE (
    MAHANG VARCHAR(10) NOT NULL,
    SOIMEI VARCHAR(20) NOT NULL PRIMARY KEY
);
GO

IF TYPE_ID('dbo.tt_ChiTietBan') IS NULL
CREATE TYPE dbo.tt_ChiTietBan AS TABLE (
    MAHANG  VARCHAR(10) NOT NULL,
    SOIMEI  VARCHAR(20) NULL,
    SOLUONG INT         NOT NULL
);
GO

IF TYPE_ID('dbo.tt_ChiTietDatHang') IS NULL
CREATE TYPE dbo.tt_ChiTietDatHang AS TABLE (
    MAHANG  VARCHAR(10) NOT NULL PRIMARY KEY,
    SOLUONG INT         NOT NULL
);
GO

INSERT INTO dbo.ThamSo (MATHAMSO, TENTHAMSO, GIATRI, DONVI)
SELECT v.MATHAMSO, v.TENTHAMSO, v.GIATRI, v.DONVI
FROM (VALUES
    ('VAT_PHANTRAM',    N'Thuế VAT đã gồm trong giá bán',           10,     N'%'),
    ('DIEM_MOI_VND',    N'Số tiền chi tiêu để được 1 điểm',         100000, N'VND'),
    ('HAN_DOITRA_NGAY', N'Hạn đổi trả tính từ ngày lập hóa đơn',    30,     N'ngày')
) AS v (MATHAMSO, TENTHAMSO, GIATRI, DONVI)
WHERE NOT EXISTS (SELECT 1 FROM dbo.ThamSo t WHERE t.MATHAMSO = v.MATHAMSO);
GO

CREATE OR ALTER VIEW dbo.vw_TonKho AS
SELECT m.MAHANG, m.TENHANG, m.MANHOM, m.MALOAI,
       ISNULL(n.TONGNHAP, 0) AS TONGNHAP,
       ISNULL(b.TONGBAN, 0) AS TONGBAN,
       ISNULL(n.TONGNHAP, 0) - ISNULL(b.TONGBAN, 0) AS TONKHO
FROM dbo.MatHang m
LEFT JOIN (SELECT MAHANG, SUM(SLNHAP) AS TONGNHAP FROM dbo.ChiTietPhieuNhap GROUP BY MAHANG) n ON n.MAHANG = m.MAHANG
LEFT JOIN (SELECT MAHANG, SUM(SLBAN) AS TONGBAN FROM dbo.ChiTietHoaDon GROUP BY MAHANG) b ON b.MAHANG = m.MAHANG;
GO

CREATE OR ALTER VIEW dbo.vw_IMEIConHang AS
SELECT i.MAIMEI, i.SOIMEI, i.MAHANG, m.TENHANG, i.SOPN, pn.NGAYNHAP
FROM dbo.IMEI i
JOIN dbo.MatHang m ON m.MAHANG = i.MAHANG
JOIN dbo.PhieuNhap pn ON pn.SOPN = i.SOPN
WHERE i.TRANGTHAI = 'con_hang';
GO

CREATE OR ALTER VIEW dbo.vw_HoaDonChiTiet AS
SELECT h.SOHD, h.NGAYLAP, h.KENHBAN, h.MAKH, k.HOTEN AS TENKH, h.MANV, nv.HOTEN AS TENNV,
       h.MAKM, km.TENKM, km.PHANTRAMGIAM,
       h.TONGTIEN, h.TIENGIAMGIA, h.THANHTIEN,
       CAST(h.THANHTIEN - h.THANHTIEN / (1 + ISNULL(v.GIATRI, 0) / 100) AS DECIMAL(18,2)) AS TIENVAT_DA_GOM,
       h.PHUONGTHUCTHANHTOAN
FROM dbo.HoaDon h
JOIN dbo.NhanVien nv ON nv.MANV = h.MANV
LEFT JOIN dbo.KhachHang k ON k.MAKH = h.MAKH
LEFT JOIN dbo.KhuyenMai km ON km.MAKM = h.MAKM
OUTER APPLY (SELECT GIATRI FROM dbo.ThamSo WHERE MATHAMSO = 'VAT_PHANTRAM') v;
GO

CREATE OR ALTER VIEW dbo.vw_ChiTietBanHang AS
SELECT ct.SOHD, h.NGAYLAP, h.KENHBAN, ct.MAHANG, m.TENHANG, m.MANHOM, ng.TENNHOM, m.MALOAI, lh.TENLOAI,
       ct.MAIMEI, i.SOIMEI, ct.SLBAN, ct.DONGIA_BAN, ct.SLBAN * ct.DONGIA_BAN AS THANHTIEN_DONG
FROM dbo.ChiTietHoaDon ct
JOIN dbo.HoaDon h ON h.SOHD = ct.SOHD
JOIN dbo.MatHang m ON m.MAHANG = ct.MAHANG
JOIN dbo.NhomHang ng ON ng.MANHOM = m.MANHOM
JOIN dbo.LoaiHang lh ON lh.MALOAI = m.MALOAI
LEFT JOIN dbo.IMEI i ON i.MAIMEI = ct.MAIMEI;
GO

CREATE OR ALTER VIEW dbo.vw_DoanhThuThang AS
SELECT YEAR(NGAYLAP) AS NAM, MONTH(NGAYLAP) AS THANG, KENHBAN,
       COUNT(*) AS SOHOADON,
       SUM(TONGTIEN) AS TONGTIEN,
       SUM(TIENGIAMGIA) AS TIENGIAMGIA,
       SUM(THANHTIEN) AS DOANHTHU
FROM dbo.HoaDon
GROUP BY YEAR(NGAYLAP), MONTH(NGAYLAP), KENHBAN;
GO

CREATE OR ALTER VIEW dbo.vw_KhuyenMaiTrangThai AS
SELECT MAKM, TENKM, PHANTRAMGIAM, NGAYBD, NGAYKT, TAMDUNG,
       CASE WHEN TAMDUNG = 1 THEN 'tam_dung'
            WHEN CAST(GETDATE() AS DATE) < CAST(NGAYBD AS DATE) THEN 'chua_ap_dung'
            WHEN CAST(GETDATE() AS DATE) > CAST(NGAYKT AS DATE) THEN 'het_han'
            ELSE 'dang_ap_dung' END AS TRANGTHAI
FROM dbo.KhuyenMai;
GO

CREATE OR ALTER VIEW dbo.vw_BaoHanhTrangThai AS
SELECT bh.MABH, bh.SOHD, bh.MAIMEI, i.SOIMEI, i.MAHANG, m.TENHANG, h.MAKH, k.HOTEN AS TENKH,
       bh.NGAYBD, bh.THOIHANTHANG, bh.NGAYKT, bh.DIEUKIEN,
       CASE WHEN EXISTS (SELECT 1 FROM dbo.PhieuTiepNhanBaoHanh tn
                         WHERE tn.MABH = bh.MABH AND tn.TRANGTHAI IN ('tiep_nhan', 'dang_sua', 'cho_linh_kien'))
                 THEN 'dang_sua'
            WHEN GETDATE() > bh.NGAYKT THEN 'het_han'
            ELSE 'con_han' END AS TRANGTHAI,
       DATEDIFF(DAY, GETDATE(), bh.NGAYKT) AS SONGAYCONLAI
FROM dbo.BaoHanh bh
JOIN dbo.IMEI i ON i.MAIMEI = bh.MAIMEI
JOIN dbo.MatHang m ON m.MAHANG = i.MAHANG
JOIN dbo.HoaDon h ON h.SOHD = bh.SOHD
LEFT JOIN dbo.KhachHang k ON k.MAKH = h.MAKH;
GO

CREATE OR ALTER VIEW dbo.vw_KhachHangThanThiet AS
SELECT k.MAKH, k.HOTEN, k.SDT,
       ISNULL(c.TONGCHITIEU, 0) AS TONGCHITIEU,
       ISNULL(r.TONGHOAN, 0) AS TONGHOAN,
       CASE WHEN p.GIATRI IS NULL OR p.GIATRI <= 0 OR ISNULL(c.TONGCHITIEU, 0) - ISNULL(r.TONGHOAN, 0) <= 0 THEN 0
            ELSE CAST(FLOOR((ISNULL(c.TONGCHITIEU, 0) - ISNULL(r.TONGHOAN, 0)) / p.GIATRI) AS INT) END AS DIEMTICHLUY
FROM dbo.KhachHang k
LEFT JOIN (SELECT MAKH, SUM(THANHTIEN) AS TONGCHITIEU
           FROM dbo.HoaDon
           WHERE MAKH IS NOT NULL
           GROUP BY MAKH) c ON c.MAKH = k.MAKH
LEFT JOIN (SELECT h.MAKH, SUM(ct.DONGIA_BAN) AS TONGHOAN
           FROM dbo.TraHang t
           JOIN dbo.HoaDon h ON h.SOHD = t.SOHD
           JOIN dbo.ChiTietHoaDon ct ON ct.SOHD = t.SOHD AND ct.MAIMEI = t.MAIMEI
           WHERE t.HINHTHUCHOANTIEN IN ('tien_mat', 'chuyen_khoan') AND h.MAKH IS NOT NULL
           GROUP BY h.MAKH) r ON r.MAKH = k.MAKH
OUTER APPLY (SELECT GIATRI FROM dbo.ThamSo WHERE MATHAMSO = 'DIEM_MOI_VND') p;
GO

CREATE OR ALTER TRIGGER dbo.trg_IMEI_KiemTra ON dbo.IMEI
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.MatHang m ON m.MAHANG = i.MAHANG WHERE m.QUANLYIMEI = 0)
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50001, N'Mặt hàng này không quản lý theo IMEI.', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.ChiTietPhieuNhap c
        JOIN (SELECT x.SOPN, x.MAHANG, COUNT(*) AS SL
              FROM dbo.IMEI x
              WHERE EXISTS (SELECT 1 FROM inserted i WHERE i.SOPN = x.SOPN AND i.MAHANG = x.MAHANG)
              GROUP BY x.SOPN, x.MAHANG) d ON d.SOPN = c.SOPN AND d.MAHANG = c.MAHANG
        WHERE d.SL > c.SLNHAP
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50002, N'Số IMEI vượt quá số lượng đã nhập trong phiếu nhập.', 1;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_HoaDon_KiemTra ON dbo.HoaDon
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.KhuyenMai km ON km.MAKM = i.MAKM
        WHERE km.TAMDUNG = 1
           OR CAST(i.NGAYLAP AS DATE) < CAST(km.NGAYBD AS DATE)
           OR CAST(i.NGAYLAP AS DATE) > CAST(km.NGAYKT AS DATE)
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50020, N'Khuyến mãi đang tạm dừng hoặc không còn hiệu lực tại ngày lập hóa đơn.', 1;
    END;

    IF UPDATE(MAKM)
    BEGIN
        UPDATE h
        SET TIENGIAMGIA = ROUND(h.TONGTIEN * ISNULL(km.PHANTRAMGIAM, 0) / 100, 0)
        FROM dbo.HoaDon h
        JOIN inserted i ON i.SOHD = h.SOHD
        LEFT JOIN dbo.KhuyenMai km ON km.MAKM = h.MAKM;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ChiTietHoaDon ON dbo.ChiTietHoaDon
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @coThem BIT = CASE WHEN EXISTS (SELECT 1 FROM inserted) THEN 1 ELSE 0 END;
    DECLARE @coXoa BIT = CASE WHEN EXISTS (SELECT 1 FROM deleted) THEN 1 ELSE 0 END;

    IF @coThem = 1 AND @coXoa = 1 AND (UPDATE(SOHD) OR UPDATE(MAHANG) OR UPDATE(MAIMEI))
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50010, N'Không được đổi hóa đơn, mặt hàng hoặc IMEI của dòng chi tiết.', 1;
    END;

    IF @coThem = 1
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM inserted i
            JOIN dbo.MatHang m ON m.MAHANG = i.MAHANG
            WHERE (m.QUANLYIMEI = 1 AND i.MAIMEI IS NULL) OR (m.QUANLYIMEI = 0 AND i.MAIMEI IS NOT NULL)
        )
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50011, N'Mặt hàng quản lý IMEI phải chọn IMEI, mặt hàng còn lại không được có IMEI.', 1;
        END;

        IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.vw_TonKho t ON t.MAHANG = i.MAHANG WHERE t.TONKHO < 0)
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50014, N'Số lượng bán vượt quá tồn kho.', 1;
        END;

        IF @coXoa = 0
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM inserted i
                JOIN dbo.IMEI im ON im.MAIMEI = i.MAIMEI
                WHERE im.TRANGTHAI <> 'con_hang'
            )
            BEGIN
                ROLLBACK TRANSACTION;
                THROW 50012, N'IMEI đã bán hoặc đã trả, không thể bán lại.', 1;
            END;

            IF EXISTS (
                SELECT 1
                FROM inserted i
                JOIN dbo.HoaDon h ON h.SOHD = i.SOHD
                JOIN dbo.IMEI im ON im.MAIMEI = i.MAIMEI
                JOIN dbo.PhieuNhap pn ON pn.SOPN = im.SOPN
                WHERE h.NGAYLAP < pn.NGAYNHAP
            )
            BEGIN
                ROLLBACK TRANSACTION;
                THROW 50013, N'Ngày lập hóa đơn không được trước ngày nhập của IMEI.', 1;
            END;

            UPDATE im
            SET TRANGTHAI = 'da_ban'
            FROM dbo.IMEI im
            JOIN inserted i ON i.MAIMEI = im.MAIMEI;
        END;
    END;

    IF @coThem = 0 AND @coXoa = 1
    BEGIN
        UPDATE im
        SET TRANGTHAI = 'con_hang'
        FROM dbo.IMEI im
        JOIN deleted d ON d.MAIMEI = im.MAIMEI
        WHERE NOT EXISTS (SELECT 1 FROM dbo.TraHang t WHERE t.MAIMEI = im.MAIMEI);
    END;

    ;WITH ds AS (
        SELECT SOHD FROM inserted
        UNION
        SELECT SOHD FROM deleted
    )
    UPDATE h
    SET TONGTIEN = ISNULL(x.TONG, 0),
        TIENGIAMGIA = ROUND(ISNULL(x.TONG, 0) * ISNULL(km.PHANTRAMGIAM, 0) / 100, 0)
    FROM dbo.HoaDon h
    JOIN ds ON ds.SOHD = h.SOHD
    LEFT JOIN (SELECT c.SOHD, SUM(c.SLBAN * c.DONGIA_BAN) AS TONG
               FROM dbo.ChiTietHoaDon c
               JOIN ds d ON d.SOHD = c.SOHD
               GROUP BY c.SOHD) x ON x.SOHD = h.SOHD
    LEFT JOIN dbo.KhuyenMai km ON km.MAKM = h.MAKM;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_BaoHanh_KiemTra ON dbo.BaoHanh
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE NOT EXISTS (SELECT 1 FROM dbo.ChiTietHoaDon ct WHERE ct.SOHD = i.SOHD AND ct.MAIMEI = i.MAIMEI)
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50040, N'IMEI không thuộc hóa đơn đã chọn.', 1;
    END;

    IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.HoaDon h ON h.SOHD = i.SOHD WHERE i.NGAYBD < h.NGAYLAP)
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50041, N'Ngày bắt đầu bảo hành không được trước ngày lập hóa đơn.', 1;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_TraHang_KiemTra ON dbo.TraHang
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE NOT EXISTS (SELECT 1 FROM dbo.ChiTietHoaDon ct WHERE ct.SOHD = i.SOHD AND ct.MAIMEI = i.MAIMEI)
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50030, N'IMEI không thuộc hóa đơn đã chọn.', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.HoaDon h ON h.SOHD = i.SOHD
        OUTER APPLY (SELECT GIATRI FROM dbo.ThamSo WHERE MATHAMSO = 'HAN_DOITRA_NGAY') p
        WHERE i.NGAYTR < h.NGAYLAP OR p.GIATRI IS NULL OR DATEDIFF(DAY, h.NGAYLAP, i.NGAYTR) > p.GIATRI
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50031, N'Trả hàng ngoài hạn đổi trả hoặc chưa cấu hình tham số HAN_DOITRA_NGAY.', 1;
    END;

    UPDATE im
    SET TRANGTHAI = 'tra_hang'
    FROM dbo.IMEI im
    JOIN inserted i ON i.MAIMEI = im.MAIMEI;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ChiTietDonHangOnline ON dbo.ChiTietDonHangOnline
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ds AS (
        SELECT MADH FROM inserted
        UNION
        SELECT MADH FROM deleted
    )
    UPDATE d
    SET TONGTIEN = ISNULL(x.TONG, 0)
    FROM dbo.DonHangOnline d
    JOIN ds ON ds.MADH = d.MADH
    LEFT JOIN (SELECT c.MADH, SUM(c.SOLUONG * c.DONGIA) AS TONG
               FROM dbo.ChiTietDonHangOnline c
               JOIN ds s ON s.MADH = c.MADH
               GROUP BY c.MADH) x ON x.MADH = d.MADH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_NhapHang
    @MANCC   VARCHAR(10),
    @MANV    VARCHAR(10),
    @ChiTiet dbo.tt_ChiTietNhap READONLY,
    @IMEI    dbo.tt_IMEINhap READONLY,
    @SOPN    VARCHAR(15) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM @ChiTiet)
            THROW 50100, N'Phiếu nhập chưa có chi tiết.', 1;

        IF EXISTS (SELECT 1 FROM @ChiTiet c LEFT JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG WHERE m.MAHANG IS NULL)
            THROW 50101, N'Có mặt hàng không tồn tại.', 1;

        IF EXISTS (SELECT 1 FROM @IMEI x WHERE NOT EXISTS (SELECT 1 FROM @ChiTiet c WHERE c.MAHANG = x.MAHANG))
            THROW 50103, N'Có IMEI thuộc mặt hàng không nằm trong chi tiết phiếu nhập.', 1;

        IF EXISTS (
            SELECT 1
            FROM @ChiTiet c
            JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG
            LEFT JOIN (SELECT MAHANG, COUNT(*) AS SL FROM @IMEI GROUP BY MAHANG) i ON i.MAHANG = c.MAHANG
            WHERE (m.QUANLYIMEI = 1 AND ISNULL(i.SL, 0) <> c.SLNHAP)
               OR (m.QUANLYIMEI = 0 AND i.SL IS NOT NULL)
        )
            THROW 50102, N'Mặt hàng quản lý IMEI phải có số IMEI bằng số lượng nhập, mặt hàng còn lại không có IMEI.', 1;

        BEGIN TRANSACTION;

        DECLARE @n BIGINT = NEXT VALUE FOR dbo.seq_PhieuNhap;
        SET @SOPN = 'PN' + RIGHT('000000' + CAST(@n AS VARCHAR(10)), 6);

        INSERT INTO dbo.PhieuNhap (SOPN, NGAYNHAP, MANCC, MANV)
        VALUES (@SOPN, GETDATE(), @MANCC, @MANV);

        INSERT INTO dbo.ChiTietPhieuNhap (SOPN, MAHANG, SLNHAP, DONGIA_NHAP)
        SELECT @SOPN, MAHANG, SLNHAP, DONGIA_NHAP FROM @ChiTiet;

        INSERT INTO dbo.IMEI (MAIMEI, MAHANG, SOPN, SOIMEI, TRANGTHAI)
        SELECT 'IM' + SOIMEI, MAHANG, @SOPN, SOIMEI, 'con_hang' FROM @IMEI;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_BanHang
    @MANV       VARCHAR(10),
    @PHUONGTHUC VARCHAR(20),
    @ChiTiet    dbo.tt_ChiTietBan READONLY,
    @SOHD       VARCHAR(15) OUTPUT,
    @MAKH       VARCHAR(10) = NULL,
    @MAKM       VARCHAR(10) = NULL,
    @KENHBAN    VARCHAR(10) = 'tai_quay'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM @ChiTiet)
            THROW 50200, N'Hóa đơn chưa có mặt hàng.', 1;

        IF EXISTS (SELECT 1 FROM @ChiTiet c LEFT JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG WHERE m.MAHANG IS NULL)
            THROW 50201, N'Có mặt hàng không tồn tại.', 1;

        IF EXISTS (SELECT 1 FROM @ChiTiet WHERE SOLUONG <= 0)
            THROW 50202, N'Số lượng bán phải lớn hơn 0.', 1;

        IF EXISTS (
            SELECT 1
            FROM @ChiTiet c
            JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG
            LEFT JOIN dbo.IMEI im ON im.SOIMEI = c.SOIMEI AND im.MAHANG = c.MAHANG AND im.TRANGTHAI = 'con_hang'
            WHERE (m.QUANLYIMEI = 1 AND (c.SOIMEI IS NULL OR im.MAIMEI IS NULL))
               OR (m.QUANLYIMEI = 0 AND c.SOIMEI IS NOT NULL)
        )
            THROW 50203, N'IMEI không hợp lệ, đã bán hoặc không thuộc mặt hàng đã chọn.', 1;

        CREATE TABLE #Dong (
            MAHANG     VARCHAR(10)   NOT NULL,
            MAIMEI     VARCHAR(20)   NULL,
            SLBAN      INT           NOT NULL,
            DONGIA_BAN DECIMAL(18,2) NOT NULL
        );

        INSERT INTO #Dong (MAHANG, MAIMEI, SLBAN, DONGIA_BAN)
        SELECT c.MAHANG, im.MAIMEI, 1, m.DONGIA
        FROM @ChiTiet c
        JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG AND m.QUANLYIMEI = 1
        JOIN dbo.IMEI im ON im.SOIMEI = c.SOIMEI AND im.MAHANG = c.MAHANG;

        INSERT INTO #Dong (MAHANG, MAIMEI, SLBAN, DONGIA_BAN)
        SELECT c.MAHANG, NULL, SUM(c.SOLUONG), m.DONGIA
        FROM @ChiTiet c
        JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG AND m.QUANLYIMEI = 0
        GROUP BY c.MAHANG, m.DONGIA;

        BEGIN TRANSACTION;

        DECLARE @n BIGINT = NEXT VALUE FOR dbo.seq_HoaDon;
        SET @SOHD = 'HD' + RIGHT('000000' + CAST(@n AS VARCHAR(10)), 6);

        INSERT INTO dbo.HoaDon (SOHD, NGAYLAP, MAKH, MANV, MAKM, KENHBAN, PHUONGTHUCTHANHTOAN)
        VALUES (@SOHD, GETDATE(), @MAKH, @MANV, @MAKM, @KENHBAN, @PHUONGTHUC);

        INSERT INTO dbo.ChiTietHoaDon (SOHD, MAHANG, MAIMEI, SLBAN, DONGIA_BAN)
        SELECT @SOHD, MAHANG, MAIMEI, SLBAN, DONGIA_BAN FROM #Dong;

        INSERT INTO dbo.BaoHanh (MABH, SOHD, MAIMEI, NGAYBD, THOIHANTHANG, DIEUKIEN)
        SELECT 'BH' + RIGHT('000000' + CAST(NEXT VALUE FOR dbo.seq_BaoHanh OVER (ORDER BY d.MAIMEI) AS VARCHAR(10)), 6),
               @SOHD, d.MAIMEI, h.NGAYLAP, m.THOIHANBAOHANH,
               N'Bảo hành chính hãng ' + CAST(m.THOIHANBAOHANH AS NVARCHAR(10)) + N' tháng'
        FROM #Dong d
        JOIN dbo.MatHang m ON m.MAHANG = d.MAHANG
        JOIN dbo.HoaDon h ON h.SOHD = @SOHD
        WHERE d.MAIMEI IS NOT NULL AND m.THOIHANBAOHANH > 0;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_TraHang
    @SOHD     VARCHAR(15),
    @SOIMEI   VARCHAR(20),
    @LYDO     NVARCHAR(255),
    @HINHTHUC VARCHAR(20),
    @MANV     VARCHAR(10),
    @MATR     VARCHAR(15) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        DECLARE @MAIMEI VARCHAR(20) = (SELECT MAIMEI FROM dbo.IMEI WHERE SOIMEI = @SOIMEI);

        IF @MAIMEI IS NULL
            THROW 50300, N'Số IMEI không tồn tại.', 1;

        BEGIN TRANSACTION;

        DECLARE @n BIGINT = NEXT VALUE FOR dbo.seq_TraHang;
        SET @MATR = 'TR' + RIGHT('000000' + CAST(@n AS VARCHAR(10)), 6);

        INSERT INTO dbo.TraHang (MATR, SOHD, MAIMEI, NGAYTR, LYDO, HINHTHUCHOANTIEN, MANV)
        VALUES (@MATR, @SOHD, @MAIMEI, GETDATE(), @LYDO, @HINHTHUC, @MANV);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_TiepNhanBaoHanh
    @MABH          VARCHAR(15),
    @TINHTRANGLOI  NVARCHAR(255),
    @MANV_TIEPNHAN VARCHAR(10),
    @MATN          VARCHAR(15) OUTPUT,
    @NGAYHENTRA    DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.BaoHanh WHERE MABH = @MABH)
            THROW 50400, N'Phiếu bảo hành không tồn tại.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.PhieuTiepNhanBaoHanh
            WHERE MABH = @MABH AND TRANGTHAI IN ('tiep_nhan', 'dang_sua', 'cho_linh_kien')
        )
            THROW 50401, N'Máy này đang có phiếu tiếp nhận chưa hoàn tất.', 1;

        BEGIN TRANSACTION;

        DECLARE @n BIGINT = NEXT VALUE FOR dbo.seq_TiepNhan;
        SET @MATN = 'TN' + RIGHT('000000' + CAST(@n AS VARCHAR(10)), 6);

        INSERT INTO dbo.PhieuTiepNhanBaoHanh (MATN, MABH, NGAYNHAN, TINHTRANGLOI, MANV_TIEPNHAN, NGAYHENTRA)
        VALUES (@MATN, @MABH, GETDATE(), @TINHTRANGLOI, @MANV_TIEPNHAN, @NGAYHENTRA);

        COMMIT TRANSACTION;

        SELECT @MATN AS MATN,
               CASE WHEN GETDATE() <= NGAYKT THEN 1 ELSE 0 END AS TRONGHANBAOHANH
        FROM dbo.BaoHanh
        WHERE MABH = @MABH;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CapNhatTienDoBaoHanh
    @MATN         VARCHAR(15),
    @TRANGTHAI    VARCHAR(20),
    @MANV_KYTHUAT VARCHAR(10)   = NULL,
    @KETQUA       NVARCHAR(255) = NULL,
    @CHIPHI       DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        DECLARE @cu VARCHAR(20) = (SELECT TRANGTHAI FROM dbo.PhieuTiepNhanBaoHanh WHERE MATN = @MATN);

        IF @cu IS NULL
            THROW 50410, N'Phiếu tiếp nhận không tồn tại.', 1;

        DECLARE @bacCu INT = CASE @cu WHEN 'tiep_nhan' THEN 1 WHEN 'dang_sua' THEN 2 WHEN 'cho_linh_kien' THEN 2 WHEN 'hoan_thanh' THEN 3 ELSE 4 END;
        DECLARE @bacMoi INT = CASE @TRANGTHAI WHEN 'tiep_nhan' THEN 1 WHEN 'dang_sua' THEN 2 WHEN 'cho_linh_kien' THEN 2 WHEN 'hoan_thanh' THEN 3 WHEN 'da_tra' THEN 4 ELSE 0 END;

        IF @bacMoi = 0 OR @bacMoi < @bacCu OR @cu = 'da_tra'
            THROW 50411, N'Trạng thái mới không hợp lệ so với trạng thái hiện tại.', 1;

        IF @bacMoi >= 2 AND @MANV_KYTHUAT IS NULL
           AND NOT EXISTS (SELECT 1 FROM dbo.PhieuTiepNhanBaoHanh WHERE MATN = @MATN AND MANV_KYTHUAT IS NOT NULL)
            THROW 50412, N'Cần chỉ định kỹ thuật viên khi bắt đầu sửa chữa.', 1;

        UPDATE dbo.PhieuTiepNhanBaoHanh
        SET TRANGTHAI    = @TRANGTHAI,
            MANV_KYTHUAT = ISNULL(@MANV_KYTHUAT, MANV_KYTHUAT),
            KETQUA       = ISNULL(@KETQUA, KETQUA),
            CHIPHI       = ISNULL(@CHIPHI, CHIPHI),
            NGAYTRA      = CASE WHEN @TRANGTHAI = 'da_tra' THEN GETDATE() ELSE NGAYTRA END
        WHERE MATN = @MATN;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_DatHangOnline
    @MAKH          VARCHAR(10),
    @TENNGUOINHAN  NVARCHAR(100),
    @SDTNGUOINHAN  VARCHAR(15),
    @DIACHIGIAO    NVARCHAR(255),
    @PHUONGTHUC    VARCHAR(20),
    @ChiTiet       dbo.tt_ChiTietDatHang READONLY,
    @MADH          VARCHAR(15) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM @ChiTiet)
            THROW 50500, N'Đơn hàng chưa có mặt hàng.', 1;

        IF EXISTS (SELECT 1 FROM @ChiTiet c LEFT JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG WHERE m.MAHANG IS NULL)
            THROW 50501, N'Có mặt hàng không tồn tại.', 1;

        IF EXISTS (SELECT 1 FROM @ChiTiet WHERE SOLUONG <= 0)
            THROW 50502, N'Số lượng đặt phải lớn hơn 0.', 1;

        IF EXISTS (SELECT 1 FROM @ChiTiet c JOIN dbo.vw_TonKho t ON t.MAHANG = c.MAHANG WHERE t.TONKHO < c.SOLUONG)
            THROW 50503, N'Có mặt hàng không đủ tồn kho.', 1;

        BEGIN TRANSACTION;

        DECLARE @n BIGINT = NEXT VALUE FOR dbo.seq_DonHang;
        SET @MADH = 'DH' + RIGHT('000000' + CAST(@n AS VARCHAR(10)), 6);

        INSERT INTO dbo.DonHangOnline (MADH, NGAYDAT, MAKH, TENNGUOINHAN, SDTNGUOINHAN, DIACHIGIAO, PHUONGTHUCTHANHTOAN)
        VALUES (@MADH, GETDATE(), @MAKH, @TENNGUOINHAN, @SDTNGUOINHAN, @DIACHIGIAO, @PHUONGTHUC);

        INSERT INTO dbo.ChiTietDonHangOnline (MADH, MAHANG, SOLUONG, DONGIA)
        SELECT @MADH, c.MAHANG, c.SOLUONG, m.DONGIA
        FROM @ChiTiet c
        JOIN dbo.MatHang m ON m.MAHANG = c.MAHANG;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CapNhatTrangThaiDonOnline
    @MADH      VARCHAR(15),
    @TRANGTHAI VARCHAR(20),
    @MANV      VARCHAR(10),
    @SOHD      VARCHAR(15) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        DECLARE @cu VARCHAR(20) = (SELECT TRANGTHAI FROM dbo.DonHangOnline WHERE MADH = @MADH);

        IF @cu IS NULL
            THROW 50510, N'Đơn hàng online không tồn tại.', 1;

        IF NOT (
               (@cu = 'cho_xac_nhan' AND @TRANGTHAI IN ('da_xac_nhan', 'da_huy'))
            OR (@cu = 'da_xac_nhan' AND @TRANGTHAI IN ('dang_giao', 'da_huy'))
            OR (@cu = 'dang_giao'   AND @TRANGTHAI = 'hoan_thanh')
        )
            THROW 50511, N'Không thể chuyển đơn hàng sang trạng thái này.', 1;

        IF @TRANGTHAI = 'hoan_thanh'
           AND NOT EXISTS (SELECT 1 FROM dbo.HoaDon WHERE SOHD = @SOHD AND KENHBAN = 'online')
            THROW 50512, N'Hoàn thành đơn cần gắn với hóa đơn bán online.', 1;

        UPDATE dbo.DonHangOnline
        SET TRANGTHAI = @TRANGTHAI,
            MANV = @MANV,
            SOHD = ISNULL(@SOHD, SOHD)
        WHERE MADH = @MADH;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ThongKeDoanhThu
    @TuNgay  DATE,
    @DenNgay DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF @TuNgay > @DenNgay
        THROW 50600, N'Từ ngày không được lớn hơn đến ngày.', 1;

    DECLARE @bd DATETIME = CAST(@TuNgay AS DATETIME);
    DECLARE @kt DATETIME = DATEADD(DAY, 1, CAST(@DenNgay AS DATETIME));

    SELECT h.KENHBAN,
           COUNT(*) AS SOHOADON,
           SUM(h.TONGTIEN) AS TONGTIEN,
           SUM(h.TIENGIAMGIA) AS TIENGIAMGIA,
           SUM(h.THANHTIEN) AS DOANHTHU
    FROM dbo.HoaDon h
    WHERE h.NGAYLAP >= @bd AND h.NGAYLAP < @kt
    GROUP BY h.KENHBAN;

    SELECT v.MANHOM, v.TENNHOM, v.TENLOAI,
           SUM(v.SLBAN) AS SOLUONGBAN,
           SUM(v.THANHTIEN_DONG) AS DOANHTHU_TRUOCGIAM
    FROM dbo.vw_ChiTietBanHang v
    WHERE v.NGAYLAP >= @bd AND v.NGAYLAP < @kt
    GROUP BY v.MANHOM, v.TENNHOM, v.TENLOAI
    ORDER BY DOANHTHU_TRUOCGIAM DESC;
END;
GO

IF DATABASE_PRINCIPAL_ID('role_QuanLy') IS NULL CREATE ROLE role_QuanLy;
IF DATABASE_PRINCIPAL_ID('role_BanHang') IS NULL CREATE ROLE role_BanHang;
IF DATABASE_PRINCIPAL_ID('role_ThuNgan') IS NULL CREATE ROLE role_ThuNgan;
IF DATABASE_PRINCIPAL_ID('role_Kho') IS NULL CREATE ROLE role_Kho;
IF DATABASE_PRINCIPAL_ID('role_KyThuatBaoHanh') IS NULL CREATE ROLE role_KyThuatBaoHanh;
GO

GRANT SELECT ON SCHEMA::dbo TO role_QuanLy;
GRANT EXECUTE ON SCHEMA::dbo TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.NhanVien TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.TaiKhoan TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.PhanQuyen TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.NhomHang TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.LoaiHang TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.ThuocTinh TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.ChiTietThuocTinh TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.MatHang TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.NhaCungCap TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.KhuyenMai TO role_QuanLy;
GRANT INSERT, UPDATE, DELETE ON dbo.ThamSo TO role_QuanLy;
GRANT EXECUTE ON TYPE::dbo.tt_ChiTietNhap TO role_QuanLy;
GRANT EXECUTE ON TYPE::dbo.tt_IMEINhap TO role_QuanLy;
GRANT EXECUTE ON TYPE::dbo.tt_ChiTietBan TO role_QuanLy;
GRANT EXECUTE ON TYPE::dbo.tt_ChiTietDatHang TO role_QuanLy;

GRANT SELECT ON dbo.MatHang TO role_BanHang;
GRANT SELECT ON dbo.NhomHang TO role_BanHang;
GRANT SELECT ON dbo.LoaiHang TO role_BanHang;
GRANT SELECT ON dbo.ThuocTinh TO role_BanHang;
GRANT SELECT ON dbo.ChiTietThuocTinh TO role_BanHang;
GRANT SELECT, INSERT, UPDATE ON dbo.KhachHang TO role_BanHang;
GRANT SELECT ON dbo.DonHangOnline TO role_BanHang;
GRANT SELECT ON dbo.ChiTietDonHangOnline TO role_BanHang;
GRANT SELECT ON dbo.vw_TonKho TO role_BanHang;
GRANT SELECT ON dbo.vw_IMEIConHang TO role_BanHang;
GRANT SELECT ON dbo.vw_KhuyenMaiTrangThai TO role_BanHang;
GRANT SELECT ON dbo.vw_HoaDonChiTiet TO role_BanHang;
GRANT SELECT ON dbo.vw_KhachHangThanThiet TO role_BanHang;
GRANT EXECUTE ON dbo.sp_BanHang TO role_BanHang;
GRANT EXECUTE ON dbo.sp_DatHangOnline TO role_BanHang;
GRANT EXECUTE ON dbo.sp_CapNhatTrangThaiDonOnline TO role_BanHang;
GRANT EXECUTE ON TYPE::dbo.tt_ChiTietBan TO role_BanHang;
GRANT EXECUTE ON TYPE::dbo.tt_ChiTietDatHang TO role_BanHang;

GRANT SELECT ON dbo.KhachHang TO role_ThuNgan;
GRANT SELECT ON dbo.vw_HoaDonChiTiet TO role_ThuNgan;
GRANT SELECT ON dbo.vw_ChiTietBanHang TO role_ThuNgan;
GRANT SELECT ON dbo.vw_DoanhThuThang TO role_ThuNgan;
GRANT SELECT ON dbo.vw_KhachHangThanThiet TO role_ThuNgan;
GRANT EXECUTE ON dbo.sp_TraHang TO role_ThuNgan;
GRANT EXECUTE ON dbo.sp_ThongKeDoanhThu TO role_ThuNgan;

GRANT SELECT ON dbo.MatHang TO role_Kho;
GRANT SELECT ON dbo.NhomHang TO role_Kho;
GRANT SELECT ON dbo.LoaiHang TO role_Kho;
GRANT SELECT, INSERT, UPDATE ON dbo.NhaCungCap TO role_Kho;
GRANT SELECT ON dbo.PhieuNhap TO role_Kho;
GRANT SELECT ON dbo.ChiTietPhieuNhap TO role_Kho;
GRANT SELECT ON dbo.IMEI TO role_Kho;
GRANT SELECT ON dbo.vw_TonKho TO role_Kho;
GRANT SELECT ON dbo.vw_IMEIConHang TO role_Kho;
GRANT EXECUTE ON dbo.sp_NhapHang TO role_Kho;
GRANT EXECUTE ON TYPE::dbo.tt_ChiTietNhap TO role_Kho;
GRANT EXECUTE ON TYPE::dbo.tt_IMEINhap TO role_Kho;

GRANT SELECT ON dbo.PhieuTiepNhanBaoHanh TO role_KyThuatBaoHanh;
GRANT SELECT ON dbo.vw_BaoHanhTrangThai TO role_KyThuatBaoHanh;
GRANT EXECUTE ON dbo.sp_TiepNhanBaoHanh TO role_KyThuatBaoHanh;
GRANT EXECUTE ON dbo.sp_CapNhatTienDoBaoHanh TO role_KyThuatBaoHanh;

DENY SELECT ON dbo.TaiKhoan TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.HoaDon TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.ChiTietHoaDon TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.IMEI TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.PhieuNhap TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.ChiTietPhieuNhap TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.TraHang TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.BaoHanh TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.PhieuTiepNhanBaoHanh TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.DonHangOnline TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
DENY INSERT, UPDATE, DELETE ON dbo.ChiTietDonHangOnline TO role_BanHang, role_ThuNgan, role_Kho, role_KyThuatBaoHanh;
GO