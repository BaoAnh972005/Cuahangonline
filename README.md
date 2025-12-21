# Maliketh - Hệ Thống Bán Hàng Online Đa Nền Tảng

## Mô tả tổng quan

**Maliketh** là một hệ thống bán hàng online hiện đại được xây dựng với công nghệ React Router 7 cho giao diện người dùng và Flask (Python) cho hệ thống backend. Hệ thống cung cấp nền tảng cho cả người dùng cá nhân và chủ shop để quản lý và bán hàng hiệu quả.

## Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Tính năng chính](#tính-năng-chính)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [Cài đặt và triển khai](#cài-đặt-và-triển-khai)
5. [Cấu trúc dự án](#cấu-trúc-dự-án)
6. [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
7. [API endpoints](#api-endpoints)
8. [Quản lý người dùng](#quản-lý-người-dùng)
9. [Quản lý sản phẩm và kho](#quản-lý-sản-phẩm-và-kho)
10. [Quản lý shop](#quản-lý-shop)
11. [Giao diện người dùng](#giao-diện-người-dùng)
12. [Bảo mật và xác thực](#bảo-mật-và-xác-thực)
13. [Đánh giá và phản hồi](#đánh-giá-và-phản-hồi)
14. [Kết luận](#kết-luận)

## Giới thiệu

Hệ thống Maliketh là một nền tảng thương mại điện tử cho phép người dùng đăng ký tài khoản, tạo shop riêng, quản lý sản phẩm, kho hàng và tương tác với khách hàng. Hệ thống hỗ trợ cả vai trò người dùng thông thường và người dùng có quyền admin để quản lý hệ thống tổng thể.

## Tính năng chính

### Người dùng
- Đăng ký, đăng nhập và quản lý hồ sơ cá nhân
- Duyệt và tìm kiếm sản phẩm
- Thêm sản phẩm vào giỏ hàng và thanh toán
- Đánh giá và phản hồi sản phẩm/shop
- Quản lý đơn hàng cá nhân

### Chủ shop
- Tạo và quản lý shop riêng
- Thêm, sửa, xóa sản phẩm
- Quản lý kho hàng
- Theo dõi đơn hàng
- Xem đánh giá từ khách hàng

### Admin
- Quản lý người dùng
- Quản lý sản phẩm toàn hệ thống
- Quản lý kho hàng
- Quản lý danh mục sản phẩm
- Quản lý shop

## Công nghệ sử dụng

### Frontend
- **React Router 7**: Điều hướng và quản lý route
- **React 19.1.0**: Thư viện xây dựng giao diện người dùng
- **Redux Toolkit**: Quản lý trạng thái ứng dụng
- **Ant Design 5.27.4**: Thư viện UI components
- **React Hook Form**: Xử lý form
- **React Query**: Quản lý trạng thái dữ liệu
- **Axios**: Giao tiếp với API backend
- **Framer Motion**: Animation và hiệu ứng giao diện

### Backend
- **Flask**: Framework web Python
- **Flask-SQLAlchemy**: ORM cho cơ sở dữ liệu
- **Flask-JWT-Extended**: Xác thực và phân quyền
- **Flask-CORS**: Hỗ trợ Cross-Origin Resource Sharing
- **Werkzeug**: Công cụ bảo mật và tiện ích
- **SQLite**: Cơ sở dữ liệu

### Công cụ khác
- **TypeScript**: Ngôn ngữ lập trình (frontend)
- **Vite**: Công cụ build và phát triển
- **Tailwind CSS**: Framework CSS

## Cài đặt và triển khai

### Yêu cầu hệ thống
- Node.js (>=18.0.0)
- Python (>=3.8)
- npm hoặc yarn

### Cài đặt frontend
```bash
# Cài đặt dependencies
npm install

# Chạy ứng dụng ở chế độ phát triển
npm run dev

# Build ứng dụng cho production
npm run build
```

### Cài đặt backend
```bash
# Cài đặt Flask và các thư viện cần thiết
pip install flask-sqlalchemy flask-jwt-extended flask-cors werkzeug python-dotenv

# Chạy server
python app.py
```

## Cấu trúc dự án

```
Cuahangonline-main/
├── app/                          # Thư mục frontend
│   ├── app.css                   # CSS toàn ứng dụng
│   ├── root.tsx                  # Root component
│   ├── routes.ts                 # Định nghĩa routes
│   ├── routes/                   # Các route components
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Components layout
│   │   │   ├── page/             # Components cho các trang
│   │   │   ├── shared/           # Components chia sẻ
│   │   │   └── ui/               # UI components
│   │   ├── redux/                # Cấu hình Redux
│   │   ├── style/                # CSS và hình ảnh
│   │   └── utils/                # Utility functions và API
├── app.py                        # Backend Flask
├── package.json                  # Dependencies frontend
├── .env                          # Biến môi trường
├── .env.docker                   # Biến môi trường cho Docker
├── public/                       # Static files
└── images/                       # Hình ảnh sản phẩm
```

## Cơ sở dữ liệu

Hệ thống sử dụng SQLite với các bảng dữ liệu sau:

### Bảng User
- id: Integer (Primary Key)
- username: String(80) (Unique, Not Null)
- email: String(120) (Unique, Not Null)
- password_hash: String(128) (Not Null)
- is_admin: Boolean (Default: False)
- first_name: String(80)
- last_name: String(80)
- phone: String(20) (Unique)
- date_of_birth: Date
- created_at: DateTime (Default: now)

### Bảng Category
- id: Integer (Primary Key)
- name: String(100) (Unique, Not Null)
- icon: String(100)

### Bảng Product
- id: Integer (Primary Key)
- name: String(100) (Not Null)
- price: Float (Not Null)
- discount_price: Float (Default: 0.0)
- stock: Integer (Default: 0)
- image_url: String(200)
- is_bestseller: Boolean (Default: False)
- is_discounted: Boolean (Default: False)
- date_added: DateTime (Default: now)
- category_id: Integer (Foreign Key to Category.id, Not Null)
- shop_id: Integer (Foreign Key to Shop.id)

### Bảng Shop
- id: Integer (Primary Key)
- user_id: Integer (Foreign Key to User.id, Unique)
- ten_shop: String(200) (Not Null)
- mo_ta: Text
- the_loai: String(120)
- url_shop: String(300)

### Bảng Kho
- id: Integer (Primary Key)
- ten_kho: String(100) (Not Null)
- dia_chi: String(255)
- created_at: DateTime (Default: now)

### Bảng NhapKho
- id: Integer (Primary Key)
- product_id: Integer (Foreign Key to Product.id, Not Null)
- kho_id: Integer (Foreign Key to Kho.id, Not Null)
- so_luong: Integer (Not Null)
- gia_nhap: Float (Not Null)
- created_at: DateTime (Default: now)

### Bảng Feedback
- id: Integer (Primary Key)
- shop_id: Integer (Foreign Key to Shop.id, Not Null)
- user_id: Integer
- rating: Integer
- comment: Text
- created_at: DateTime (Default: now)

## API endpoints

### Xác thực
- `POST /api/auth/register` - Đăng ký người dùng
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin người dùng
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh-token` - Làm mới token
- `GET /api/user/profile` - Lấy thông tin hồ sơ người dùng

### Sản phẩm
- `GET /api/products/discount` - Lấy sản phẩm giảm giá
- `GET /api/products/bestseller` - Lấy sản phẩm bán chạy
- `GET /api/products/suggested` - Lấy sản phẩm gợi ý
- `GET /api/products/:product_id` - Lấy chi tiết sản phẩm
- `GET /api/categories` - Lấy danh sách danh mục

### Quản lý sản phẩm
- `POST /api/admin/addSanpham` - Thêm sản phẩm (admin)
- `GET /api/admin/xemsanpham` - Xem sản phẩm
- `PATCH /api/admin/suasanpham/:sp_id` - Sửa sản phẩm
- `DELETE /api/admin/deletesanpham/:sp_id` - Xóa sản phẩm
- `POST /api/shop/product` - Thêm sản phẩm cho shop

### Quản lý kho
- `GET /api/admin/xemkho` - Xem danh sách kho
- `POST /api/admin/addkho` - Thêm kho
- `PUT /api/admin/nhapkho` - Nhập kho
- `POST /api/inventory/import` - Nhập kho cho shop
- `GET /api/inventory` - Xem tồn kho

### Quản lý shop
- `POST /api/newshop` - Tạo shop mới
- `GET /api/pageshop` - Lấy thông tin shop

### Đánh giá
- `GET /api/feedbackofshop/:shop_id` - Lấy đánh giá cho shop
- `POST /api/feedbackofshop` - Tạo đánh giá mới

## Quản lý người dùng

Hệ thống có ba loại người dùng:
1. **Người dùng thường**: Có thể mua hàng, đánh giá sản phẩm
2. **Chủ shop**: Có thể tạo và quản lý shop, sản phẩm
3. **Admin**: Có toàn quyền quản lý hệ thống

Quy trình đăng ký:
- Người dùng cung cấp thông tin: họ tên, email, số điện thoại, tên đăng nhập, mật khẩu
- Người dùng có thể đăng nhập sau khi đăng ký
- Email admin được xác định trong mã nguồn để cấp quyền admin (admin@cuahang.com, mythicskin@gmail.com)

## Quản lý sản phẩm và kho

### Quản lý sản phẩm
- Thêm, sửa, xóa sản phẩm
- Phân loại sản phẩm theo danh mục
- Quản lý giá cả, số lượng tồn kho
- Quản lý hình ảnh sản phẩm
- Hỗ trợ cả sản phẩm bán chạy và giảm giá

### Quản lý kho
- Tạo và quản lý các kho hàng
- Nhập kho sản phẩm
- Theo dõi lịch sử nhập kho
- Quản lý số lượng tồn kho
- Hỗ trợ quản lý nhiều kho cho hệ thống

## Quản lý shop

### Tạo shop
- Người dùng có thể tạo một shop duy nhất
- Cung cấp thông tin: tên shop, mô tả, loại hình kinh doanh
- Quản lý sản phẩm trong shop

### Quản lý sản phẩm shop
- Thêm sản phẩm vào shop
- Cập nhật thông tin sản phẩm
- Theo dõi tồn kho

## Giao diện người dùng

### Trang chủ
- Hiển thị sản phẩm nổi bật, giảm giá, bán chạy
- Thanh điều hướng
- Banner quảng cáo
- Footer

### Trang đăng nhập/đăng ký
- Form đăng nhập với xác thực
- Form đăng ký với đầy đủ thông tin
- Xác thực dữ liệu đầu vào

### Trang quản lý
- Giao diện quản lý sản phẩm cho admin
- Giao diện quản lý shop cho chủ shop
- Giao diện quản lý cá nhân cho người dùng

### Trang sản phẩm
- Hiển thị chi tiết sản phẩm
- Hình ảnh, giá cả, mô tả
- Đánh giá từ người dùng

## Bảo mật và xác thực

### JWT Authentication
- Sử dụng JSON Web Token cho xác thực người dùng
- Token được lưu trữ trong cookie với các cài đặt bảo mật
- Token có thời hạn 1 giờ và có thể làm mới

### Phân quyền
- Admin: Có quyền truy cập tất cả chức năng hệ thống
- Chủ shop: Có quyền quản lý sản phẩm trong shop của mình
- Người dùng: Có quyền mua hàng và đánh giá

### Xác thực dữ liệu đầu vào
- Sử dụng React Hook Form để xác thực dữ liệu
- Kiểm tra định dạng email, số điện thoại
- Kiểm tra độ dài mật khẩu

## Đánh giá và phản hồi

### Hệ thống đánh giá
- Người dùng có thể đánh giá shop (hiện tại chưa có đánh giá sản phẩm riêng lẻ)
- Hệ thống sao đánh giá (1-5 sao)
- Hiển thị trung bình đánh giá
- Lưu trữ lịch sử đánh giá

### Quản lý phản hồi
- Chủ shop có thể xem đánh giá từ khách hàng
- Phản hồi đánh giá của khách hàng
- Cải thiện chất lượng dịch vụ dựa trên phản hồi

### Mô hình dữ liệu
- Bảng Feedback có các trường: shop_id (bắt buộc), user_id (tùy chọn), rating (tùy chọn), comment (tùy chọn), created_at (mặc định là now)
- Đánh giá được liên kết với shop thay vì sản phẩm riêng lẻ

## Kết luận

Hệ thống Maliketh là một nền tảng thương mại điện tử toàn diện với đầy đủ chức năng cho cả người dùng, chủ shop và quản trị viên. Hệ thống được xây dựng với các công nghệ hiện đại, đảm bảo tính mở rộng, bảo mật và trải nghiệm người dùng tốt.

Với kiến trúc tách biệt frontend và backend, hệ thống có thể dễ dàng mở rộng và bảo trì. Giao diện người dùng thân thiện và trực quan giúp người dùng dễ dàng sử dụng các chức năng của hệ thống.

Hệ thống cũng tích hợp đầy đủ các tính năng cần thiết cho một nền tảng thương mại điện tử như quản lý sản phẩm, kho hàng, đánh giá, thanh toán và quản trị hệ thống.

Link Render : https://cuahangonline-twnl.onrender.com
Link Vercel : https://cuahangonline.vercel.app/
