# ==========================================
# GIAI ĐOẠN 1: BUILD MÃ NGUỒN MAVEN
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml và tải dependencies trước để tận dụng Docker cache layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ mã nguồn và build file jar
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# GIAI ĐOẠN 2: RUNTIME CHẠY ỨNG DỤNG (SIÊU NHẸ)
# ==========================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Tạo group và user non-root để tăng cường bảo mật
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy file .jar đã đóng gói từ giai đoạn build
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080 cho Backend Spring Boot API
EXPOSE 8080

# Cấu hình biến môi trường Java
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# Khởi chạy ứng dụng
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
