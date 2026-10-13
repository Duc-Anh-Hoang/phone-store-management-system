/**
 * TITANSTORE INTERNATIONALIZATION (i18n) MODULE
 * Hỗ trợ chuyển đổi ngôn ngữ song ngữ Tiếng Việt (VN) <-> Tiếng Anh (ENG)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TitanI18n = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'titan_app_language';

  const translations = {
    vi: {
      // General / Topbar
      app_title: 'Hệ Thống Quản Trị Cơ Sở Dữ Liệu Cửa Hàng',
      db_label: 'DB: QuanLyCuaHangDienThoai',
      api_live: 'Backend: Live API (Spring Boot)',
      api_demo: 'Chế độ Demo / Offline',
      api_connecting: 'Đang kết nối API...',
      search_placeholder: 'Tìm kiếm nhanh...',
      logout: 'Đăng Xuất',
      view_landing: 'Xem Landing Page Bán Hàng',
      role_manager: 'Quản lý cửa hàng',
      role_admin: 'Quản trị viên',
      role_cashier: 'Thu ngân',
      role_sales: 'Bán hàng',
      role_tech: 'Kỹ thuật & Bảo hành',

      // Sidebar Groups & Items
      group_tongquan: 'TỔNG QUAN',
      group_banhang: 'BÁN HÀNG',
      group_kho: 'KHO',
      group_baohanh: 'BẢO HÀNH',
      group_danhmuc: 'DANH MỤC',
      group_hethong: 'HỆ THỐNG',

      group_reports: 'Báo Cáo & Thống Kê',
      nav_dashboard: 'Dashboard',
      group_master_data: 'Cập Nhật Dữ Liệu (Master Data)',
      nav_mathang: 'Sản phẩm',
      nav_nhomloai: 'Hãng & Loại hàng',
      nav_thuoctinh: 'Thông số kỹ thuật',
      nav_khachhang: 'Khách hàng',
      nav_nhanvien: 'Nhân viên & phân quyền',
      nav_taikhoan: 'Tài khoản & Phân quyền',
      nav_nhacungcap: 'Nhà cung cấp',
      nav_khuyenmai: 'Khuyến mãi',
      nav_thamso: 'Tham số hệ thống',
      group_transactions: 'Xử Lý Dữ Liệu Nghiệp Vụ',
      nav_donhang: 'Đơn hàng online',
      nav_hoadon: 'Bán tại quầy',
      nav_hoadon_list: 'Hóa đơn',
      nav_nhapkho: 'Nhập kho',
      nav_baohanh: 'Tiếp nhận & sửa chữa',
      nav_tracuu_baohanh: 'Tra cứu bảo hành',
      nav_trahang: 'Đổi trả hàng',
      group_views: 'Tra Cứu Database Views',
      nav_tonkho: 'Tồn kho',
      nav_imei: 'Tra cứu IMEI',

      // Dashboard
      dash_revenue: 'Tổng Doanh Thu Bán',
      dash_revenue_trend: '+12% so với tháng trước',
      dash_pending_orders: 'Đơn Online Chờ Duyệt',
      dash_pending_desc: 'Cần xác nhận & xuất hóa đơn',
      dash_total_stock: 'Tổng Tồn Kho Máy',
      dash_stock_desc: 'Đang còn hàng',
      dash_warranty: 'Máy Đang Bảo Hành',
      dash_warranty_desc: 'Tiếp nhận & đang sửa',
      dash_recent_orders: 'Đơn Hàng Trực Tuyến Đặt Gần Đây',
      dash_recent_desc: 'Đồng bộ trực tiếp từ Landing Page bán điện thoại',
      dash_refresh: 'Làm mới',

      // Table Headers
      th_order_id: 'Mã ĐH',
      th_customer: 'Khách Hàng',
      th_product: 'Sản Phẩm Đặt',
      th_total: 'Tổng Tiền',
      th_status: 'Trạng Thái',
      th_actions: 'Thao Tác',
      th_product_id: 'Mã Hàng',
      th_product_name: 'Tên Mặt Hàng',
      th_unit_price: 'Đơn Giá',
      th_dvt: 'ĐVT',
      th_category: 'Nhóm Hàng',
      th_imei_flag: 'Quản Lý IMEI',
      th_warranty: 'Bảo Hành',
      th_stock: 'Tồn Kho',
      th_order_date: 'Ngày Đặt',
      th_recipient: 'Người Nhận',
      th_shipping_addr: 'Địa Chỉ Giao',
      th_payment_method: 'Thanh Toán',
      th_process_action: 'Xử Lý Nghiệp Vụ',
      th_invoice_no: 'Số HĐ',
      th_invoice_date: 'Ngày Lập',
      th_sales_channel: 'Kênh Bán',
      th_imei_assigned: 'IMEI Gán',
      th_discount: 'Giảm Giá',
      th_final_price: 'Thành Tiền',
      th_import_no: 'Số Phiếu Nhập',
      th_import_date: 'Ngày Nhập',
      th_supplier: 'Nhà Cung Cấp',
      th_quantity: 'Số Lượng',
      th_import_total: 'Tổng Tiền Nhập',
      th_creator: 'Người Lập',
      th_ticket_id: 'Mã Phiếu',
      th_imei_no: 'Số IMEI',
      th_received_date: 'Ngày Nhận',
      th_issue_desc: 'Tình Trạng Lỗi',
      th_technician: 'Kỹ Thuật Viên',
      th_appointment_date: 'Hẹn Trả',
      th_repair_cost: 'Chi Phí',
      th_return_id: 'Mã Phiếu Trả',
      th_return_date: 'Ngày Trả',
      th_return_reason: 'Lý Do Đổi Trả',
      th_return_type: 'Hình Thức',
      th_staff: 'Nhân Viên',
      th_cust_id: 'Mã KH',
      th_fullname: 'Họ Và Tên',
      th_phone: 'Số Điện Thoại',
      th_email: 'Email',
      th_staff_id: 'Mã NV',
      th_position: 'Chức Vụ',
      th_supplier_id: 'Mã NCC',
      th_supplier_name: 'Tên Nhà Cung Cấp',
      th_headquarters: 'Địa Chỉ Trụ Sở',
      th_promo_id: 'Mã KM',
      th_promo_name: 'Tên Chương Trình',
      th_promo_discount: 'Giảm Giá',
      th_validity_period: 'Thời Gian Áp Dụng',
      th_condition: 'Tình Trạng',
      th_param_id: 'Mã Tham Số',
      th_param_desc: 'Tên Tham Số Ý Nghĩa',
      th_param_value: 'Giá Trị Quy Định',
      th_total_imported: 'Tổng Nhập',
      th_total_sold: 'Tổng Xuất Bán',
      th_current_stock: 'Tồn Kho Hiện Tại',
      th_device_name: 'Tên Thiết Bị',
      th_import_batch: 'Lô Phiếu Nhập',

      // Buttons & Controls
      btn_add_product: 'Thêm Mặt Hàng Mới',
      btn_new_invoice: 'Lập Hóa Đơn Bán Mới',
      btn_new_import: 'Lập Phiếu Nhập Mới',
      btn_new_warranty: 'Tiếp Nhận Máy Bảo Hành',
      btn_new_return: 'Lập Phiếu Đổi Trả',
      btn_process: 'Xử lý',
      btn_edit: 'Sửa',
      btn_delete: 'Xóa',
      btn_save: 'Lưu Dữ Liệu',
      btn_cancel: 'Hủy',
      btn_quick_approve: 'Duyệt nhanh',
      btn_export_invoice: 'Xuất HĐ & Gán IMEI',
      btn_view_details: 'Chi tiết',
      btn_filter: 'Lọc dữ liệu',

      // Status Badges
      st_cho_xac_nhan: 'Chờ xác nhận',
      st_da_xac_nhan: 'Đã xác nhận',
      st_dang_giao: 'Đang giao hàng',
      st_hoan_thanh: 'Hoàn thành',
      st_da_huy: 'Đã hủy đơn',
      st_con_hang: 'Còn hàng',
      st_da_ban: 'Đã bán',
      st_tra_hang: 'Trả hàng',
      st_dang_lam: 'Đang làm việc',
      st_da_nghi: 'Đã nghỉ việc',
      st_tiep_nhan: 'Tiếp nhận',
      st_dang_sua: 'Đang sửa chữa',
      st_da_tra: 'Đã trả khách',
      st_active: 'Hoạt động',
      st_paused: 'Tạm dừng',

      // Modals & Placeholders
      modal_product_title: 'Thêm / Sửa Mặt Hàng',
      modal_pos_title: 'Lập Hóa Đơn Bán Hàng Tại Quầy (POS)',
      modal_import_title: 'Lập Phiếu Nhập Kho & Sinh IMEI Tự Động',
      modal_warranty_title: 'Tiếp Nhận Máy Bảo Hành & Sửa Chữa',
      modal_return_title: 'Xử Lý Đổi Trả Hàng (30 ngày)',
      lbl_product_code: 'Mã hàng:',
      lbl_unit: 'Đơn vị tính:',
      lbl_product_name: 'Tên mặt hàng:',
      lbl_price: 'Đơn giá bán (VNĐ):',
      lbl_warranty_months: 'Thời hạn BH (tháng):',
      lbl_category: 'Nhóm hàng:',
      lbl_type: 'Loại hàng:',
      lbl_imei_tracking: 'Quản lý theo mã IMEI',
      lbl_cust_name: 'Tên khách hàng:',
      lbl_select_product: 'Chọn mặt hàng:',
      lbl_select_imei: 'Chọn số IMEI máy còn trong kho:',
      lbl_payment_method: 'Phương thức thanh toán:',
      lbl_import_id: 'Số phiếu nhập:',
      lbl_supplier: 'Nhà cung cấp:',
      lbl_import_product: 'Mặt hàng nhập:',
      lbl_import_qty: 'Số lượng nhập:',
      lbl_import_price: 'Đơn giá nhập (VNĐ):',
      lbl_ticket_id: 'Mã phiếu tiếp nhận:',
      lbl_warranty_imei: 'Số IMEI cần bảo hành:',
      lbl_issue_desc: 'Tình trạng lỗi mô tả:',
      lbl_technician: 'Kỹ thuật viên phụ trách:',
      lbl_appointment_date: 'Ngày hẹn trả máy:',
      lbl_repair_cost: 'Chi phí phát sinh (nếu có):',
      lbl_return_id: 'Mã phiếu trả:',
      lbl_return_imei: 'Số IMEI máy trả:',
      lbl_return_reason: 'Lý do đổi trả:',
      lbl_return_type: 'Hình thức xử lý hoàn tiền:',
      opt_cash: 'Tiền mặt',
      opt_transfer: 'Chuyển khoản QR Napas',
      opt_card: 'Thẻ ngân hàng (Visa/Master)',
      opt_exchange: 'Đổi máy mới cùng loại (1 đổi 1)',
      opt_cash_refund: 'Hoàn tiền mặt 100%',
      opt_transfer_refund: 'Hoàn tiền chuyển khoản',
      btn_pos_submit: 'Xác Nhận & Xuất HĐ',
      btn_import_submit: 'Lưu & Sinh IMEI',
      btn_warranty_submit: 'Lập Phiếu Tiếp Nhận',
      btn_return_submit: 'Xác Nhận Đổi Trả',
      import_auto_imei_notice: 'Hệ thống sẽ tự động tạo đủ số lượng mã IMEI hợp lệ 15 chữ số cho từng máy vào bảng IMEI.',
      placeholder_cust_name: 'Nhập tên khách hàng lẻ...',
      placeholder_warranty_imei: 'Nhập 15 số IMEI...',
      placeholder_warranty_fault: 'Ví dụ: Không lên nguồn, loa rè, lỗi camera...',
      placeholder_return_imei: 'Nhập IMEI đã bán...',
      placeholder_return_reason: 'Ví dụ: Lỗi màn hình trong vòng 30 ngày...',
      search_product_ph: 'Tìm kiếm theo mã hoặc tên mặt hàng...',
      all_statuses: 'Tất cả trạng thái',

      th_points: 'Điểm Tích Lũy',

      // Landing Page (index.html) Keys
      nav_features: 'Tính Năng',
      nav_specs: 'Cấu Hình',
      nav_versions: 'Phiên Bản',
      nav_reviews: 'Đánh Giá',
      btn_login: 'Đăng Nhập',
      btn_buy_now: 'Mua Ngay',
      btn_admin_portal: 'Vào Quản Trị',
      btn_user_portal: 'Khách Hàng',
      auth_portal_title: 'Cổng Truy Cập Hệ Thống',
      auth_portal_subtitle: 'Quản trị cửa hàng & Dịch vụ khách hàng',
      tab_user: 'Người Dùng',
      tab_admin: 'Quản Trị Viên (Admin)',
      tab_track_order: 'Tra Cứu Đơn',
      banner_deal_text: 'Sự kiện mở bán iPhone 18 Pro Max: Giảm ngay 2.000.000đ khi thanh toán Napas QR',
      footer_back_home: 'Về trang bán hàng',
      login_system_title: 'Đăng Nhập Hệ Thống',
      login_system_desc: 'Quản trị viên, Nhân viên & Khách hàng',
      lbl_login_user: 'Tên đăng nhập / Số điện thoại',
      lbl_login_pass: 'Mật khẩu',
      login_quick_roles: 'Chọn nhanh tài khoản mẫu:',
      edit_return_title: 'Chỉnh Sửa Phiếu Đổi Trả',
      hero_badge: 'Mở bán chính thức iPhone 18 Pro Max chính hãng',
      hero_title: 'Đỉnh Cao Công Nghệ Titan',
      hero_desc: 'Thiết kế Titan sa mạc đẳng cấp, viền mỏng nhất từ trước đến nay, chip A18 Pro và nút Điều Khiển Camera hoàn toàn mới.',
      hero_price_label: 'Giá ưu đãi từ:',
      hero_btn_buy: 'Đặt Hàng Ngay',
      hero_btn_explore: 'Khám Phá Cấu Hình',
      feat_heading: 'Đột Phá Công Nghệ Thế Hệ Mới',
      feat_subheading: 'iPhone 18 Pro Max mang lại trải nghiệm đỉnh cao với vật liệu Titan cao cấp và Apple Intelligence',
      specs_heading: 'Thông Số Kỹ Thuật Chi Tiết',
      specs_subheading: 'Mọi chi tiết được hoàn thiện để mang lại hiệu năng phi thường',
      order_heading: 'Chọn Phiên Bản & Đặt Mua',
      order_subheading: 'Giao hàng miễn phí toàn quốc trong 2 giờ hoặc nhận tại cửa hàng gần nhất',
      review_heading: 'Khách Hàng Nói Gì Về Chúng Tôi',
      review_subheading: 'Hơn 50.000 khách hàng đã tin tưởng lựa chọn mua sắm tại TitanStore',

      // Dashboard extra
      dash_revenue_channel: 'Doanh Thu Theo Kênh Bán (FR25)',
      dash_revenue_category: 'Doanh Thu Theo Nhóm Hàng (FR25)',
      dash_channel_online: 'Online (Landing Page)',
      dash_channel_instore: 'Tại quầy (POS)',
      view_store: 'Xem Trang Bán Hàng'
    },

    en: {
      // General / Topbar
      app_title: 'TitanStore Database Management System',
      db_label: 'DB: QuanLyCuaHangDienThoai',
      api_live: 'Backend: Live API (Spring Boot)',
      api_demo: 'Demo / Offline Mode',
      api_connecting: 'Connecting to API...',
      search_placeholder: 'Quick search...',
      logout: 'Logout',
      view_landing: 'View Customer Storefront',
      role_manager: 'Store Manager',
      role_admin: 'System Administrator',
      role_cashier: 'Cashier',
      role_sales: 'Sales Representative',
      role_tech: 'Technician & Warranty',

      // Sidebar Groups & Items
      group_tongquan: 'OVERVIEW',
      group_banhang: 'SALES & POS',
      group_kho: 'INVENTORY & WAREHOUSE',
      group_baohanh: 'WARRANTY & REPAIR',
      group_danhmuc: 'CATALOG & MASTER DATA',
      group_hethong: 'SYSTEM & SETTINGS',

      group_reports: 'Reports & Analytics',
      nav_dashboard: 'Dashboard',
      group_master_data: 'Master Data Management',
      nav_mathang: 'Products',
      nav_nhomloai: 'Brands & Categories',
      nav_thuoctinh: 'Technical Specs',
      nav_khachhang: 'Customers',
      nav_nhanvien: 'Staff & Roles',
      nav_taikhoan: 'Accounts & Roles',
      nav_nhacungcap: 'Suppliers',
      nav_khuyenmai: 'Promotions',
      nav_thamso: 'System Parameters',
      group_transactions: 'Operations & Transactions',
      nav_donhang: 'Online Orders',
      nav_hoadon: 'POS Sales',
      nav_hoadon_list: 'Invoices',
      nav_nhapkho: 'Stock Import',
      nav_baohanh: 'Repair Intake',
      nav_tracuu_baohanh: 'Warranty Lookup',
      nav_trahang: 'Returns & Exchanges',
      group_views: 'Database Views & Logs',
      nav_tonkho: 'Stock Levels',
      nav_imei: 'IMEI Lookup',

      // Dashboard
      dash_revenue: 'Total Sales Revenue',
      dash_revenue_trend: '+12% vs last month',
      dash_pending_orders: 'Pending Online Orders',
      dash_pending_desc: 'Requires confirmation & invoice',
      dash_total_stock: 'Total Units in Stock',
      dash_stock_desc: 'Currently in stock',
      dash_warranty: 'Devices Under Warranty',
      dash_warranty_desc: 'Received & undergoing repair',
      dash_recent_orders: 'Recent Online Orders',
      dash_recent_desc: 'Synced live from store landing page',
      dash_refresh: 'Refresh',

      // Table Headers
      th_order_id: 'Order ID',
      th_customer: 'Customer',
      th_product: 'Ordered Product',
      th_total: 'Total Amount',
      th_status: 'Status',
      th_actions: 'Actions',
      th_product_id: 'Product Code',
      th_product_name: 'Product Name',
      th_unit_price: 'Unit Price',
      th_dvt: 'Unit',
      th_category: 'Category',
      th_imei_flag: 'IMEI Managed',
      th_warranty: 'Warranty',
      th_stock: 'Stock',
      th_order_date: 'Order Date',
      th_recipient: 'Recipient',
      th_shipping_addr: 'Delivery Address',
      th_payment_method: 'Payment',
      th_process_action: 'Operations',
      th_invoice_no: 'Invoice #',
      th_invoice_date: 'Issued Date',
      th_sales_channel: 'Channel',
      th_imei_assigned: 'Assigned IMEI',
      th_discount: 'Discount',
      th_final_price: 'Final Total',
      th_import_no: 'Import Slip #',
      th_import_date: 'Import Date',
      th_supplier: 'Supplier',
      th_quantity: 'Quantity',
      th_import_total: 'Total Cost',
      th_creator: 'Created By',
      th_ticket_id: 'Ticket #',
      th_imei_no: 'IMEI Number',
      th_received_date: 'Received Date',
      th_issue_desc: 'Fault Description',
      th_technician: 'Technician',
      th_appointment_date: 'Due Date',
      th_repair_cost: 'Repair Fee',
      th_return_id: 'Return ID',
      th_return_date: 'Return Date',
      th_return_reason: 'Return Reason',
      th_return_type: 'Method',
      th_staff: 'Staff',
      th_cust_id: 'Cust ID',
      th_fullname: 'Full Name',
      th_phone: 'Phone Number',
      th_email: 'Email',
      th_staff_id: 'Staff ID',
      th_position: 'Position',
      th_supplier_id: 'Supplier ID',
      th_supplier_name: 'Supplier Name',
      th_headquarters: 'Headquarters Address',
      th_promo_id: 'Promo ID',
      th_promo_name: 'Campaign Name',
      th_promo_discount: 'Discount',
      th_validity_period: 'Validity Period',
      th_condition: 'Status',
      th_param_id: 'Param ID',
      th_param_desc: 'Parameter Meaning',
      th_param_value: 'Configured Value',
      th_total_imported: 'Total Received',
      th_total_sold: 'Total Sold',
      th_current_stock: 'Current Stock',
      th_device_name: 'Device Model',
      th_import_batch: 'Batch Receipt',

      // Buttons & Controls
      btn_add_product: 'Add New Product',
      btn_new_invoice: 'New Sales Invoice',
      btn_new_import: 'New Stock Import',
      btn_new_warranty: 'Receive Warranty Device',
      btn_new_return: 'Create Return Slip',
      btn_process: 'Process',
      btn_edit: 'Edit',
      btn_delete: 'Delete',
      btn_save: 'Save Changes',
      btn_cancel: 'Cancel',
      btn_quick_approve: 'Quick Approve',
      btn_export_invoice: 'Invoice & Assign IMEI',
      btn_view_details: 'Details',
      btn_filter: 'Filter',

      // Status Badges
      st_cho_xac_nhan: 'Pending',
      st_da_xac_nhan: 'Confirmed',
      st_dang_giao: 'Shipping',
      st_hoan_thanh: 'Completed',
      st_da_huy: 'Cancelled',
      st_con_hang: 'In Stock',
      st_da_ban: 'Sold',
      st_tra_hang: 'Returned',
      st_dang_lam: 'Active',
      st_da_nghi: 'Resigned',
      st_tiep_nhan: 'Received',
      st_dang_sua: 'Repairing',
      st_da_tra: 'Returned to Customer',
      st_active: 'Active',
      st_paused: 'Paused',

      // Modals & Placeholders
      modal_product_title: 'Add / Edit Product',
      modal_pos_title: 'Create In-Store Sales Invoice (POS)',
      modal_import_title: 'Create Stock Import & Generate IMEI',
      modal_warranty_title: 'Receive Device For Warranty & Repair',
      modal_return_title: 'Process Product Return / Refund (30 Days)',
      lbl_product_code: 'Product code:',
      lbl_unit: 'Unit of measure:',
      lbl_product_name: 'Product name:',
      lbl_price: 'Sale price (VND):',
      lbl_warranty_months: 'Warranty (months):',
      lbl_category: 'Category:',
      lbl_type: 'Product type:',
      lbl_imei_tracking: 'Track by IMEI serial number',
      lbl_cust_name: 'Customer name:',
      lbl_select_product: 'Select product:',
      lbl_select_imei: 'Select available IMEI in stock:',
      lbl_payment_method: 'Payment method:',
      lbl_import_id: 'Import slip #:',
      lbl_supplier: 'Supplier:',
      lbl_import_product: 'Import product:',
      lbl_import_qty: 'Import quantity:',
      lbl_import_price: 'Import unit price (VND):',
      lbl_ticket_id: 'Ticket ID:',
      lbl_warranty_imei: 'Warranty IMEI #:',
      lbl_issue_desc: 'Fault description:',
      lbl_technician: 'Assigned technician:',
      lbl_appointment_date: 'Appointment date:',
      lbl_repair_cost: 'Repair fee (if any):',
      lbl_return_id: 'Return slip #:',
      lbl_return_imei: 'Returned device IMEI:',
      lbl_return_reason: 'Return reason:',
      lbl_return_type: 'Refund / Exchange method:',
      opt_cash: 'Cash',
      opt_transfer: 'Bank Transfer (QR Napas)',
      opt_card: 'Bank Card (Visa/Master)',
      opt_exchange: '1-for-1 Device Exchange',
      opt_cash_refund: '100% Cash Refund',
      opt_transfer_refund: 'Bank Transfer Refund',
      btn_pos_submit: 'Confirm & Issue Invoice',
      btn_import_submit: 'Save & Generate IMEI',
      btn_warranty_submit: 'Create Warranty Ticket',
      btn_return_submit: 'Confirm Return',
      import_auto_imei_notice: 'The system will automatically generate valid 15-digit IMEI serial numbers for each device.',
      placeholder_cust_name: 'Enter customer name...',
      placeholder_warranty_imei: 'Enter 15-digit IMEI...',
      placeholder_warranty_fault: 'e.g., No power, speaker static, camera fault...',
      placeholder_return_imei: 'Enter sold IMEI...',
      placeholder_return_reason: 'e.g., Screen malfunction within 30 days...',
      search_product_ph: 'Search by product code or name...',
      all_statuses: 'All statuses',

      th_points: 'Loyalty Points',

      // Landing Page (index.html) Keys
      nav_features: 'Features',
      nav_specs: 'Tech Specs',
      nav_versions: 'Versions',
      nav_reviews: 'Reviews',
      btn_login: 'Login',
      btn_buy_now: 'Buy Now',
      btn_admin_portal: 'Admin Portal',
      btn_user_portal: 'Customer',
      auth_portal_title: 'System Access Portal',
      auth_portal_subtitle: 'Store Management & Customer Services',
      tab_user: 'Customer',
      tab_admin: 'Admin Portal',
      tab_track_order: 'Track Order',
      banner_deal_text: 'iPhone 18 Pro Max Launch: Save 2,000,000 VND via Napas QR',
      footer_back_home: 'Back to Store',
      login_system_title: 'System Authentication',
      login_system_desc: 'Administrators, Staff & Customers',
      lbl_login_user: 'Username / Phone Number',
      lbl_login_pass: 'Password',
      login_quick_roles: 'Quick sample accounts:',
      edit_return_title: 'Edit Return Ticket',
      hero_badge: 'Official Launch iPhone 18 Pro Max Original VN/A',
      hero_title: 'Peak of Titanium Innovation',
      hero_desc: 'Desert Titanium luxury finish, thinnest borders ever, next-gen A18 Pro chip, and revolutionary Camera Control.',
      hero_price_label: 'Special price from:',
      hero_btn_buy: 'Order Now',
      hero_btn_explore: 'Explore Specs',
      feat_heading: 'Next-Gen Technological Breakthroughs',
      feat_subheading: 'iPhone 18 Pro Max delivers an extraordinary experience with aerospace-grade Titanium and Apple Intelligence',
      specs_heading: 'Detailed Technical Specifications',
      specs_subheading: 'Every component engineered to deliver phenomenal performance and endurance',
      order_heading: 'Select Version & Place Order',
      order_subheading: 'Free nationwide 2-hour fast delivery or pick up at your nearest TitanStore',
      review_heading: 'What Our Customers Say',
      review_subheading: 'Over 50,000 satisfied customers trust TitanStore for authentic Apple devices',

      // Dashboard extra
      dash_revenue_channel: 'Revenue by Sales Channel (FR25)',
      dash_revenue_category: 'Revenue by Product Category (FR25)',
      dash_channel_online: 'Online (Landing Page)',
      dash_channel_instore: 'In-Store (POS)',
      view_store: 'View Storefront'
    }
  };

  class I18nManager {
    constructor() {
      this.currentLang = this.getStoredLang();
      this.listeners = [];
    }

    getStoredLang() {
      try {
        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        return (stored === 'en' || stored === 'vi') ? stored : 'vi';
      } catch (e) {
        return 'vi';
      }
    }

    getLang() {
      return this.currentLang;
    }

    setLang(lang) {
      if (lang !== 'vi' && lang !== 'en') return;
      this.currentLang = lang;
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {}
      this.applyDOM();
      this.listeners.forEach(fn => {
        try { fn(lang); } catch (e) { console.error('i18n listener error:', e); }
      });
    }

    toggle() {
      const now = Date.now();
      if (this._lastToggle && (now - this._lastToggle < 300)) {
        return;
      }
      this._lastToggle = now;
      this.setLang(this.currentLang === 'vi' ? 'en' : 'vi');
    }

    t(key, fallback = '') {
      if (!key) return fallback;
      const lang = (this.currentLang === 'en') ? 'en' : 'vi';
      const dict = translations[lang] || translations.vi;
      if (dict && dict[key] !== undefined && dict[key] !== '') {
        return dict[key];
      }
      if (translations.vi && translations.vi[key] !== undefined && translations.vi[key] !== '') {
        return translations.vi[key];
      }
      return fallback;
    }

    onChange(fn) {
      if (typeof fn === 'function') {
        this.listeners.push(fn);
      }
    }

    applyDOM() {
      // Cập nhật text content cho các phần tử có thuộc tính [data-i18n]
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const text = this.t(key, '');
        // CHỈ cập nhật khi tìm thấy bản dịch hợp lệ và khác hẳn với tên biến key
        if (text && text !== key && text.trim().length > 0) {
          el.textContent = text;
        }
      });

      // Cập nhật placeholder cho input có [data-i18n-placeholder]
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (!key) return;
        const text = this.t(key, '');
        if (text && text !== key && text.trim().length > 0) {
          el.setAttribute('placeholder', text);
        }
      });

      // Cập nhật title tooltip cho phần tử có [data-i18n-title]
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (!key) return;
        const text = this.t(key, '');
        if (text && text !== key && text.trim().length > 0) {
          el.setAttribute('title', text);
        }
      });

      // Cập nhật trạng thái hiển thị của các nút chuyển ngôn ngữ nếu có
      document.querySelectorAll('#btn-i18n-toggle, .btn-i18n-toggle').forEach(toggleBtn => {
        const isVi = this.currentLang === 'vi';
        const flagEl = toggleBtn.querySelector('.i18n-flag');
        const textEl = toggleBtn.querySelector('.i18n-label');
        if (flagEl) flagEl.textContent = isVi ? '🇻🇳' : '🇬🇧';
        if (textEl) textEl.textContent = isVi ? 'Tiếng Việt' : 'English';
      });

      // Đổi thuộc tính lang của <html>
      document.documentElement.setAttribute('lang', this.currentLang);
    }
  }

  const instance = new I18nManager();

  // Tự động khởi chạy khi DOM tải xong
  if (typeof document !== 'undefined') {
    const bindToggleEvents = () => {
      instance.applyDOM();
      document.querySelectorAll('#btn-i18n-toggle, .btn-i18n-toggle').forEach(btn => {
        btn.removeAttribute('onclick');
        btn.onclick = null;
        if (!btn.dataset.i18nBound) {
          btn.dataset.i18nBound = 'true';
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            instance.toggle();
          });
        }
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindToggleEvents);
    } else {
      bindToggleEvents();
    }

    // Đồng bộ tức thì nếu ngôn ngữ thay đổi từ tab/trang khác
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue && (e.newValue === 'vi' || e.newValue === 'en')) {
        if (e.newValue !== instance.currentLang) {
          instance.setLang(e.newValue);
        }
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.TitanI18n = instance;
    window.toggleLanguage = function () {
      instance.toggle();
    };
  }

  return instance;
}));
