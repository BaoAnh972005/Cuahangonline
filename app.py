import os
from datetime import datetime
from flask import Flask, send_from_directory, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, set_access_cookies, unset_jwt_cookies
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import timedelta
from functools import wraps # Dùng cho decorator phân quyền
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta, date # Import date

# --- CẤU HÌNH CƠ BẢN ---
app = Flask(__name__, static_folder="images")

@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory("images", filename)


# 1. Cấu hình Database (Sử dụng SQLite đơn giản)
# Database sẽ được lưu trong tệp "site.db" trong thư mục gốc
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "your-very-strong-jwt-secret-key"  # <-- THAY THẾ BẰNG CHUỖI KHÁC
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False  # Set True trong môi trường production (HTTPS)
app.config["JWT_COOKIE_SAMESITE"] = "None"
app.config["JWT_COOKIE_SECURE"] = False  # dev OK, prod = True


db = SQLAlchemy(app)

# Initialize JWT manager
jwt = JWTManager(app)

# 2. Cấu hình CORS (mở rộng cho dev)
# Cho phép Frontend React trên cổng 5174 truy cập tất cả API (/api/*)
# Thêm 127.0.0.1 và các headers/methods cần thiết để tránh lỗi preflight
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5174", "http://127.0.0.1:5174"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# --- ĐỊNH NGHĨA MODEL DATABASE (Sử dụng Flask-SQLAlchemy) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Các trường chính
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    
    # --- CÁC TRƯỜNG MỚI ĐƯỢC THÊM THEO FRONTEND ---
    first_name = db.Column(db.String(80), nullable=True)  # Họ
    last_name = db.Column(db.String(80), nullable=True)   # Tên
    phone = db.Column(db.String(20), unique=True, nullable=True) # Số điện thoại
    date_of_birth = db.Column(db.Date, nullable=True)     # Ngày sinh
    # ------------------------------------------------
    
    # Các hàm khác (set_password, check_password, to_dict) giữ nguyên
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            # Thêm các trường mới vào dict trả về
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'date_of_birth': str(self.date_of_birth) if self.date_of_birth else None # Chuyển Date sang String
        }
    
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(100), nullable=True)
    products = db.relationship('Product', backref='category', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon
        }

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    discount_price = db.Column(db.Float, default=0.0)
    stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(200), nullable=True)
    is_bestseller = db.Column(db.Boolean, default=False)
    is_discounted = db.Column(db.Boolean, default=False)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'discountPrice': self.discount_price,
            'imageUrl': self.image_url,
            'isDiscounted': self.is_discounted
        }


class Shop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ten_shop = db.Column(db.String(200), nullable=False)
    mo_ta = db.Column(db.Text, nullable=True)
    the_loai = db.Column(db.String(120), nullable=True)
    url_shop = db.Column(db.String(300), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'ten_shop': self.ten_shop,
            'mo_ta': self.mo_ta,
            'the_loai': self.the_loai,
            'url_shop': f"/{self.url_shop}" if self.url_shop else None,
        }


# --- HÀM KHỞI TẠO DỮ LIỆU MẪU (CHỈ CHẠY MỘT LẦN) ---

def initialize_database():
    """Tạo database và thêm dữ liệu mẫu nếu chưa có."""
    with app.app_context():
        # Tạo tất cả các bảng nếu chúng chưa tồn tại
        db.create_all()
        
        # Kiểm tra xem có dữ liệu danh mục nào chưa
        if Category.query.count() == 0:
            print("Đang thêm dữ liệu mẫu...")
            
            # Thêm Danh mục
            cat_shoes = Category(name='Giày Dép', icon='shoe-icon')
            cat_mobile = Category(name='Điện Thoại & Phụ Kiện', icon='phone-icon')
            db.session.add_all([cat_shoes, cat_mobile])
            db.session.commit()
            
            # Thêm Sản phẩm
            prod1 = Product(name='Giày Thể Thao Pro', price=1500000, discount_price=1200000, 
                            image_url='product1.png', is_discounted=True, category=cat_shoes)
            prod2 = Product(name='iPhone 15', price=25000000, image_url='product2.jpg', 
                            is_bestseller=True, category=cat_mobile)
            prod3 = Product(name='Giày Da Thời Trang', price=900000, image_url='product3.png', 
                            is_bestseller=True, category=cat_shoes)
            
            db.session.add_all([prod1, prod2, prod3])
            # Ensure images directory exists for uploaded shop images
            if not os.path.exists('images'):
                os.makedirs('images')
            db.session.commit()
            print("Hoàn tất thêm dữ liệu mẫu.")
            # app.py

def admin_required():
    """Decorator kiểm tra người dùng hiện tại có phải là Admin không."""
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            try:
                user_id_int = int(user_id)
            except Exception:
                user_id_int = user_id
            user = User.query.get(user_id_int)
            
            if user is None or not user.is_admin:
                return jsonify({"msg": "Admin access required"}), 403 # Lỗi 403: Forbidden
            return fn(*args, **kwargs)
        return decorator
    return wrapper


# --- API ENDPOINTS ---

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Lấy danh sách các danh mục."""
    categories = Category.query.all()
    # Chuyển đối tượng Category thành dictionary
    return jsonify([c.to_dict() for c in categories])

@app.route('/api/products/discount', methods=['GET'])
def get_discount_products():
    """Lấy danh sách sản phẩm giảm giá."""
    # Lọc các sản phẩm có is_discounted = True
    products = Product.query.filter_by(is_discounted=True).all()
    return jsonify({
        "title": "Sản phẩm giảm giá",
        "products": [p.to_dict() for p in products]
    })

@app.route('/api/products/bestseller', methods=['GET'])
def get_bestseller_products():
    """Lấy danh sách sản phẩm bán chạy nhất."""
    # Lọc các sản phẩm có is_bestseller = True
    products = Product.query.filter_by(is_bestseller=True).all()
    return jsonify({
        "title": "Sản phẩm bán chạy hàng đầu",
        "products": [p.to_dict() for p in products]
    })

@app.route('/api/products/suggested', methods=['GET'])
def get_suggested_products():
    """Lấy danh sách sản phẩm gợi ý (có thể là sản phẩm bán chạy hoặc mới nhất)."""
    # Lấy 3 sản phẩm gần nhất
    products = Product.query.order_by(Product.date_added.desc()).limit(3).all()
    return jsonify({
        "title": "Sản phẩm gợi ý cho bạn",
        "products": [p.to_dict() for p in products]
    })
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_details(product_id):
    """Lấy chi tiết một sản phẩm theo ID."""
    
    # 1. Tìm sản phẩm trong database theo ID
    product = Product.query.get(product_id)
    
    # 2. Xử lý nếu không tìm thấy
    if not product:
        # Flask trả về lỗi 404
        return jsonify({"error": "Product not found"}), 404
    
    # 3. Tìm Category (để trả về thông tin chi tiết hơn)
    category = Category.query.get(product.category_id)
    
    # 4. Trả về chi tiết sản phẩm
    product_data = product.to_dict()
    
    # Thêm chi tiết Category vào dữ liệu trả về
    product_data['category'] = category.to_dict() if category else None
    
    # Thêm các trường chi tiết khác (Ví dụ: description)
    # (Bạn có thể thêm trường description vào Model Product sau)
    product_data['description'] = "Đây là mô tả chi tiết của sản phẩm " + product.name + ". Sản phẩm này đang có sẵn hàng."
    product_data['stock'] = product.stock # Lấy trường stock
    
    return jsonify({"product": product_data})
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    # Các trường BẮT BUỘC để tạo user
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Các trường MỚI
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    date_of_birth_str = data.get('date_of_birth') # Nhận chuỗi ngày sinh

    # 1. Kiểm tra dữ liệu bắt buộc
    if not username or not email or not password:
        return jsonify({"msg": "Thiếu tên đăng nhập, email hoặc mật khẩu"}), 400

    # 2. Kiểm tra trùng lặp
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"msg": "Tên đăng nhập hoặc Email đã tồn tại"}), 409

    # 3. Chuyển đổi Ngày sinh (định dạng YYYY-MM-DD từ Frontend)
    dob = None
    if date_of_birth_str:
        try:
            # Flask mong đợi YYYY-MM-DD
            dob = date.fromisoformat(date_of_birth_str) 
        except ValueError:
            # Nếu chuỗi ngày không đúng định dạng ISO
            return jsonify({"msg": "Ngày sinh không hợp lệ (YYYY-MM-DD)"}), 400

    # 4. Tạo User mới và lưu các trường
    new_user = User(
        username=username, 
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        date_of_birth=dob # Lưu đối tượng date
    )
    new_user.set_password(password)

    if User.query.count() == 0:
        new_user.is_admin = True

    db.session.add(new_user)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Xử lý nếu phone bị trùng (do phone là unique)
        if 'UNIQUE constraint failed: user.phone' in str(e):
            return jsonify({"msg": "Số điện thoại đã được đăng ký"}), 409
        return jsonify({"msg": f"Lỗi database: {e}"}), 500

    return jsonify({"msg": "Đăng ký thành công", "user": new_user.to_dict()}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        # Debug: log origin and request body for diagnosing CORS/network issues
        origin = request.headers.get('Origin')
        print(f"[login] Incoming Origin: {origin}")
        data = request.get_json()
        print(f"[login] Request JSON: {data}")

        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if user is None or not user.check_password(password):
            print("[login] Authentication failed for:", username)
            return jsonify({"msg": "Tên đăng nhập hoặc mật khẩu không đúng"}), 401 # Lỗi 401: Unauthorized

        # Tạo Access Token chứa ID người dùng để nhận dạng
        # Store identity as string to satisfy PyJWT 'sub' claim requirements
        access_token = create_access_token(identity=str(user.id))
        
        response = jsonify({
            "msg": "Đăng nhập thành công",
            "user": user.to_dict()
        })

        # Đặt Access Token vào HTTP-only cookie
        set_access_cookies(response, access_token)
        print("[login] Login successful, setting cookie and returning response")
        return response
    except Exception as e:
        # Log exception details to console for debugging
        print("[login] Exception:", e)
        import traceback
        traceback.print_exc()
        # Return error so frontend can see something (dev only)
        return jsonify({"msg": f"Server error: {e}"}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
    except Exception:
        user_id_int = user_id
    user = User.query.get(user_id_int)
    return jsonify({"user": user.to_dict()})


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    response = jsonify({'msg': 'Đăng xuất thành công'})
    # Xóa Access Token cookie
    unset_jwt_cookies(response)
    return response


@app.route('/api/newshop', methods=['POST'])
def create_shop():
    try:
        # Debug: log incoming request content for multipart/form-data
        try:
            print("[create_shop] Headers:", dict(request.headers))
            print("[create_shop] Form data:", request.form.to_dict())
            print("[create_shop] Files:", list(request.files.keys()))
        except Exception:
            pass
        # Expecting multipart/form-data
        ten_shop = request.form.get('ten_shop')
        mo_ta = request.form.get('mo_ta')
        the_loai = request.form.get('the_loai')

        if not ten_shop:
            return jsonify({"status": False, "msg": "Tên shop là bắt buộc"}), 400

        url_shop_file = request.files.get('url_shop')
        filename = None
        if url_shop_file:
            fname = secure_filename(url_shop_file.filename)
            # add timestamp to avoid collisions
            import time
            filename = f"shop_{int(time.time())}_{fname}"
            # Ensure images directory exists
            images_dir = 'images'
            if not os.path.exists(images_dir):
                os.makedirs(images_dir, exist_ok=True)
            save_path = os.path.join(images_dir, filename)
            url_shop_file.save(save_path)

        new_shop = Shop(
            ten_shop=ten_shop,
            mo_ta=mo_ta,
            the_loai=the_loai,
            url_shop=filename,
        )
        db.session.add(new_shop)
        db.session.commit()

        return jsonify({"status": "success", "shop": new_shop.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        print("[create_shop] Exception:", e)
        traceback.print_exc()
        return jsonify({"status": False, "msg": str(e)}), 500


@app.route('/api/pageshop', methods=['GET'])
def get_pageshop():
    shop_id = request.args.get('shop_id')
    if not shop_id:
        return jsonify({"status": False, "msg": "shop_id is required"}), 400
    try:
        try:
            sid = int(shop_id)
        except Exception:
            sid = shop_id
        shop = Shop.query.get(sid)
        if not shop:
            return jsonify({"status": False, "msg": "Shop not found"}), 404

        # For now return empty products list; can be extended
        return jsonify({"status": "success", "shop": shop.to_dict(), "products": []})
    except Exception as e:
        print("[get_pageshop] Exception:", e)
        return jsonify({"status": False, "msg": str(e)}), 500

# ... (Logic phục vụ Frontend tĩnh)

# --- PHỤC VỤ FRONTEND TĨNH (STATIC FILE SERVER) ---

# Tuyến đường phục vụ tệp index.html và các đường dẫn con của React Router
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Phục vụ các tệp tĩnh từ thư mục build/client."""
    static_folder = app.static_folder
    
    # Kiểm tra xem có tệp tĩnh nào khớp với đường dẫn được yêu cầu không
    if path != "" and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        # Nếu không tìm thấy, trả về index.html để React Router xử lý định tuyến (Fallback)
        return send_from_directory(static_folder, 'index.html')
    
@app.route('/api/auth/refresh-token', methods=['POST'])
@jwt_required()
def refresh_token():
    # Debug incoming cookies/headers to diagnose missing cookie issues
    try:
        print("[refresh_token] Incoming Cookies:", request.cookies)
        print("[refresh_token] Incoming Headers (Origin, Cookie):", request.headers.get('Origin'), request.headers.get('Cookie'))
    except Exception:
        pass

    # Lấy định danh người dùng từ token hiện tại
    current_user_id = get_jwt_identity()
    # Create new token; ensure identity is a string
    new_access_token = create_access_token(identity=str(current_user_id))
    
    # Trả về thông tin user kèm token mới để frontend cập nhật state
    try:
        try:
            user_id_int = int(current_user_id)
        except Exception:
            user_id_int = current_user_id
        user = User.query.get(user_id_int)
        response = jsonify({
            "status": True,
            "msg": "Token đã được làm mới",
            "user": user.to_dict() if user else None,
            "accessToken": new_access_token,
        })
        set_access_cookies(response, new_access_token)
        return response
    except Exception as e:
        print("[refresh_token] Exception:", e)
        return jsonify({"status": False, "msg": str(e)}), 500


# Backwards-compatible alias for older frontend paths
@app.route('/refresh-token', methods=['POST'])
@jwt_required()
def refresh_token_alias():
    return refresh_token()

# --- CHẠY SERVER ---

if __name__ == '__main__':
    # Bắt đầu khởi tạo database và dữ liệu mẫu
    initialize_database() 
    
    print("\n=============================================")
    print(f"Backend Python (Flask) đang chạy trên: http://localhost:5000")
    print(f"Frontend React (Dev) đang chạy trên: http://localhost:5174")
    print("=============================================\n")
    
    # Chạy máy chủ Flask trên cổng 5000
    # Đảm bảo debug=True chỉ khi phát triển
    app.run(host='0.0.0.0', port=5000, debug=True)