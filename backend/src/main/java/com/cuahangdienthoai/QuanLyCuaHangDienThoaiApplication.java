package com.cuahangdienthoai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class QuanLyCuaHangDienThoaiApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuanLyCuaHangDienThoaiApplication.class, args);
        System.out.println(">>> Ứng dụng Backend Quản Lý Cửa Hàng Điện Thoại đã khởi chạy thành công tại http://localhost:8080 !");
    }
}
