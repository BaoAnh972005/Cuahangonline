# Cuahangonline

## Mô tả dự án
Đây là một ứng dụng cửa hàng online full-stack với các tính năng hiện đại bao gồm:

- Backend: API REST với FastAPI, xác thực JWT, quản lý người dùng và sản phẩm
- Frontend: Giao diện người dùng thân thiện với HTML, CSS (Tailwind), JavaScript
- Cơ sở dữ liệu: PostgreSQL
- Triển khai: Backend trên Render, Frontend trên Vercel

## Tính năng

### Người dùng
- Đăng ký, đăng nhập, đăng xuất
- Phân quyền admin/member
- Xem sản phẩm
- Quản lý giỏ hàng (thêm, xóa, cập nhật sản phẩm)
- Thanh toán đơn hàng
- Xem lịch sử đơn hàng

### Admin
- Thêm, sửa, xóa sản phẩm
- Quản lý đơn hàng (sắp tới)

### Tích hợp thanh toán
- Mô phỏng quy trình thanh toán với Stripe
- Tạo payment intent
- Xác nhận thanh toán

## Công nghệ sử dụng
- Backend: Python, FastAPI, SQLAlchemy, JWT, PostgreSQL
- Frontend: HTML, CSS (Tailwind), JavaScript, Axios
- Triển khai: Render (Backend), Vercel (Frontend)
- Thanh toán: Stripe (mô phỏng)

## Cài đặt và chạy dự án

### Backend
1. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```

2. Cấu hình cơ sở dữ liệu:
   - Nếu dùng PostgreSQL (như trong yêu cầu đề bài):
     + Cài đặt PostgreSQL trên máy tính
     + Tạo database với tên `cuahangonline`
     + Đặt biến môi trường `DATABASE_URL` theo định dạng: `postgresql://username:password@localhost/cuahangonline`
   
   - Nếu dùng SQLite (để chạy thử nhanh):
     + Không cần cấu hình gì thêm, hệ thống sẽ tự động sử dụng file `test.db`

3. Chạy server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend
Chỉ cần mở file `index.html` trong trình duyệt hoặc triển khai lên Vercel.

## API endpoints

### Authentication
- `POST /register` - Đăng ký người dùng
- `POST /token` - Đăng nhập và nhận JWT token

### Products
- `GET /products` - Lấy danh sách sản phẩm
- `POST /products` - Tạo sản phẩm (admin)
- `PUT /products/{id}` - Cập nhật sản phẩm (admin)
- `DELETE /products/{id}` - Xóa sản phẩm (admin)

### Cart
- `GET /cart` - Lấy giỏ hàng
- `POST /cart` - Thêm sản phẩm vào giỏ
- `PUT /cart/{id}` - Cập nhật sản phẩm trong giỏ
- `DELETE /cart/{id}` - Xóa sản phẩm khỏi giỏ
- `DELETE /cart/clear` - Xóa toàn bộ giỏ hàng

### Orders
- `GET /orders` - Lấy lịch sử đơn hàng
- `POST /orders` - Tạo đơn hàng mới

### Payment
- `POST /create-payment-intent` - Tạo payment intent
- `POST /process-payment` - Xử lý thanh toán
