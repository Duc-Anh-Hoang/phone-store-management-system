# Sử dụng Nginx Alpine nhẹ, bảo mật và hiệu năng cao
FROM nginx:alpine

# Copy cấu hình Nginx tùy chỉnh (bao gồm reverse proxy tới backend:8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy mã nguồn trang web vào thư mục web root của Nginx
COPY index.html /usr/share/nginx/html/
COPY admin.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY images/ /usr/share/nginx/html/images/

# Mở cổng 80 cho web traffic
EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
