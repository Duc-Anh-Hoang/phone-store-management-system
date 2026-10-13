# DỰ ÁN HỆ THỐNG LANDING PAGE & BACKEND QUẢN LÝ CỬA HÀNG ĐIỆN THOẠI

Hệ thống hoàn chỉnh bao gồm **Frontend Landing Page (HTML/Tailwind/JS/Slick)**, **Backend API (Java Spring Boot 3)** và **Database (Microsoft SQL Server)** được đóng gói tự động bằng **Docker & Docker Compose**.

---

## 1. Cấu Trúc Thư Mục Dự Án

```text
Website/
├── docker-compose.yml           # Đóng gói toàn bộ hệ thống (Frontend + Backend + SQL Server)
├── README.md                    # Tài liệu hướng dẫn cài đặt và sử dụng
├── database/                    # Chứa script khởi tạo CSDL
│   ├── Table.sql                # Định nghĩa 22 bảng CSDL QuanLyCuaHangDienThoai
│   └── Code.sql                 # Stored Procedures, Views, Triggers, Sequence
│
├── frontend/                    # Giao diện Landing Page bán điện thoại
│   ├── Dockerfile               # Đóng gói Frontend với Nginx Alpine
│   ├── nginx.conf               # Cấu hình Web server & Reverse Proxy /api/ -> backend:8080
│   ├── index.html               # Trang chủ giới thiệu & đặt hàng iPhone 16 Pro Max
│   ├── css/
│   │   └── style.css            # Custom CSS Variables, Glows, Slick Slider styling
│   ├── js/
│   │   ├── main.js              # Navbar, Slick feedback slider, countdown
│   │   ├── product-options.js   # Quản lý màu sắc, dung lượng, tính giá
│   │   ├── slider.js            # Slider tương tác ảnh điện thoại Hero
│   │   ├── order-modal.js       # Modal đặt hàng dùng chung
│   │   └── order-form.js        # Form validation và kết nối API Spring Boot
│   └── images/                  # Bộ vector SVG sản phẩm và icon công nghệ cao cấp
│
└── backend/                     # Backend Java Spring Boot 3 REST API
    ├── Dockerfile               # Multi-stage build Maven + Eclipse Temurin 17 JRE
    ├── pom.xml                  # Cấu hình Spring Data JPA, MSSQL Driver, Lombok, Validation
    └── src/main/
        ├── java/com/cuahangdienthoai/
        │   ├── QuanLyCuaHangDienThoaiApplication.java
        │   ├── common/CorsConfig.java
        │   ├── order/           # Module Đơn hàng: Controller, DTO, Entity, Repository, Service
        │   ├── product/         # Module Mặt hàng, danh mục, IMEI
        │   ├── customer/        # Module Khách hàng, khuyến mãi
        │   ├── employee/        # Module Nhân viên, tài khoản, phân quyền
        │   ├── supplier/        # Module Nhà cung cấp, nhập kho
        │   └── warranty/        # Module Bảo hành, sửa chữa, trả hàng
        └── resources/
            └── application.properties # Kết nối CSDL SQL Server
```

---

## 2. Hướng Dẫn Chạy Toàn Bộ Hệ Thống Bằng Docker (Khuyên Dùng)

Chỉ với 1 câu lệnh duy nhất, toàn bộ hệ thống (Frontend, Backend, Database) sẽ được build và khởi chạy cùng nhau:

```bash
docker compose up --build -d
```

### Các cổng dịch vụ sau khi khởi chạy:
| Dịch vụ | Địa chỉ truy cập | Mô tả |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost](http://localhost) hoặc [http://localhost:3000](http://localhost:3000) | Landing page bán điện thoại |
| **Backend API** | [http://localhost:8080/api/orders](http://localhost:8080/api/orders) | Spring Boot REST API |
| **Database** | `localhost:1433` | SQL Server (User: `sa`, Pass: `Password123!`) |

Để dừng toàn bộ hệ thống:
```bash
docker compose down
```

---

## 4. Tài Khoản Đăng Nhập & Phân Quyền Hệ Thống

Hệ thống hỗ trợ phân luồng thông minh:
- **Đăng nhập Quản trị viên / Nhân viên (Admin)** ➔ Chuyển hướng vào trang quản trị `admin.html`.
- **Đăng nhập Khách hàng (Người dùng)** ➔ Ở lại trang bán hàng `index.html`, tự động điền đơn hàng & hiển thị đơn hàng đã đặt.

### 4.1. Tài khoản Quản trị / Nhân viên (Admin Portal)
| Tên đăng nhập | Mật khẩu | Họ và tên | Chức vụ / Quyền hạn | Chuyển hướng |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `123456` | Nguyễn Văn Quản | Quản trị viên hệ thống | `admin.html` |
| `quanly` | `123456` | Nguyễn Văn Quản | Quản lý cửa hàng | `admin.html` |
| `thungan` | `123456` | Trần Thị Thu Ngân | Thu ngân | `admin.html` |
| `banhang` | `123456` | Lê Văn Bán Hàng | Bán hàng | `admin.html` |
| `kythuat` | `123456` | Phạm Kỹ Thuật | Kỹ thuật & Bảo hành | `admin.html` |

### 4.2. Tài khoản Khách hàng / Người dùng (User Portal)
| Số điện thoại | Họ và tên | Địa chỉ | Chuyển hướng |
| :--- | :--- | :--- | :--- |
| `0987654321` | Nguyễn Hoàng Long | 128 Trần Duy Hưng, Hà Nội | `index.html` |
| `0912345678` | Lê Thị Ngọc Mai | 45 Lê Duẩn, TP.HCM | `index.html` |
| `0903888999` | Trần Minh Đức | 23 Nguyễn Văn Linh, Đà Nẵng | `index.html` |
