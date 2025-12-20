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
app = Flask(
    __name__,
    static_folder="public",   # <-- đúng
    static_url_path="/"
)

ADMIN_EMAILS = [
    "admin@cuahang.com",
    "mythicskin@gmail.com"
]


# 1. Cấu hình Database (Sử dụng SQLite đơn giản)
# Database sẽ được lưu trong tệp "site.db" trong thư mục gốc
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "your-very-strong-jwt-secret-key"  # <-- THAY THẾ BẰNG CHUỖI KHÁC
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False  # Set True trong môi trường production (HTTPS)
app.config["JWT_COOKIE_SAMESITE"] = "Lax"
app.config["JWT_COOKIE_SECURE"] = False  # dev OK, prod = True
app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
app.config["JWT_COOKIE_CSRF_PROTECT"] = False 


db = SQLAlchemy(app)

# Initialize JWT manager
jwt = JWTManager(app)

# 2. Cấu hình CORS (mở rộng cho dev)
# Cho phép Frontend React trên cổng 5174 truy cập tất cả API (/api/*)
# Thêm 127.0.0.1 và các headers/methods cần thiết để tránh lỗi preflight

CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)


# --- ĐỊNH NGHĨA MODEL DATABASE (Sử dụng Flask-SQLAlchemy) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    is_admin = db.Column(db.Boolean, default=False)

    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    phone = db.Column(db.String(20), unique=True)
    date_of_birth = db.Column(db.Date)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ THÊM

    shop = db.relationship("Shop", backref="owner", uselist=False)  # ✅ THÊM

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "role": "admin" if self.is_admin else "user",
            "created_at": self.created_at.isoformat(),
            "shop": self.shop.to_dict() if self.shop else None
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
    __tablename__ = "product"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    discount_price = db.Column(db.Float, default=0.0)
    stock = db.Column(db.Integer, default=10)
    image_url = db.Column(db.String(200))
    is_bestseller = db.Column(db.Boolean, default=False)
    is_discounted = db.Column(db.Boolean, default=False)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey("shop.id"))


    def to_dict(self):
        # Resolve image filename: prefer public PNG/JPG variants only (no SVG fallback)
        image_url = None
        if self.image_url:
            public_dir = os.path.join(os.getcwd(), 'public')
            candidate = self.image_url
            base, ext = os.path.splitext(candidate)
            variants = [base + '.png', base + '.jpg', base + '.jpeg', candidate]

            # Prefer public PNG/JPG; do not return SVGs from images/
            for v in variants:
                if os.path.exists(os.path.join(public_dir, v)):
                    image_url = request.url_root.rstrip('/') + '/' + v
                    break

            # Optional: if no public image found, try a generic no-image placeholder in public
            if not image_url:
                placeholder = os.path.join(public_dir, 'no-image.jpg')
                if os.path.exists(placeholder):
                    image_url = request.url_root.rstrip('/') + '/no-image.jpg'

        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'discountPrice': self.discount_price,
            'imageUrl': image_url,
            'isDiscounted': self.is_discounted,
            'shop_id': self.shop_id,
        }


class Shop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), unique=True)  # ✅ THÊM

    ten_shop = db.Column(db.String(200), nullable=False)
    mo_ta = db.Column(db.Text)
    the_loai = db.Column(db.String(120))
    url_shop = db.Column(db.String(300))

    def to_dict(self):
        return {
            "id": self.id,
            "ten_shop": self.ten_shop,
            "mo_ta": self.mo_ta,
            "the_loai": self.the_loai,
            "url_shop": self.url_shop,
            "user_id": self.user_id,
        }

class Kho(db.Model):
    __tablename__ = "kho"

    id = db.Column(db.Integer, primary_key=True)
    ten_kho = db.Column(db.String(100), nullable=False) 
    dia_chi = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class NhapKho(db.Model):
    __tablename__ = "nhap_kho"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("product.id"),
        nullable=False
    )

    kho_id = db.Column(
        db.Integer,
        db.ForeignKey("kho.id"),
        nullable=False
    )

    so_luong = db.Column(db.Integer, nullable=False)
    gia_nhap = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shop.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=True)
    rating = db.Column(db.Integer, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'shop_id': self.shop_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
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
            # Use local SVG placeholders so development doesn't 404 on missing images
            prod1 = Product(
                name='Giày Thể Thao Pro',
                price=1500000,
                discount_price=1200000,
                image_url='product1.png',
                is_discounted=True,
                category=cat_shoes
            )

            prod2 = Product(
                name='iPhone 15',
                price=25000000,
                image_url='product2.jpg',
                is_bestseller=True,
                category=cat_mobile
            )

            prod3 = Product(
                name='Giày Da Thời Trang',
                price=900000,
                image_url='product3.png',
                is_bestseller=True,
                category=cat_shoes
            )
            
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
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('images', filename)


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

    # Các trường BẮT BUỘC
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Các trường MỞ RỘNG
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    date_of_birth_str = data.get('date_of_birth')

    # 1. Validate bắt buộc
    if not username or not email or not password:
        return jsonify({"msg": "Thiếu tên đăng nhập, email hoặc mật khẩu"}), 400

    # 2. Check trùng
    if User.query.filter(
        (User.username == username) | (User.email == email)
    ).first():
        return jsonify({"msg": "Tên đăng nhập hoặc Email đã tồn tại"}), 409

    # 3. Parse ngày sinh
    dob = None
    if date_of_birth_str:
        try:
            dob = date.fromisoformat(date_of_birth_str)
        except ValueError:
            return jsonify({"msg": "Ngày sinh không hợp lệ (YYYY-MM-DD)"}), 400

    # 4. Tạo user
    new_user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        date_of_birth=dob
    )
    new_user.set_password(password)

    # ✅ GÁN ADMIN THEO EMAIL (DUY NHẤT)
    new_user.is_admin = email.lower() in ADMIN_EMAILS

    db.session.add(new_user)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        if 'UNIQUE constraint failed: user.phone' in str(e):
            return jsonify({"msg": "Số điện thoại đã được đăng ký"}), 409
        return jsonify({"msg": f"Lỗi database: {e}"}), 500

    return jsonify({
        "msg": "Đăng ký thành công",
        "user": new_user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Sai tài khoản hoặc mật khẩu"}), 401

    access_token = create_access_token(identity=str(user.id))

    response = jsonify({
        "msg": "Đăng nhập thành công",
        "user": user.to_dict()
    })

    set_access_cookies(response, access_token)
    return response
    
@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "user": user.to_dict(),
        "shop": user.shop.to_dict() if user.shop else None
    })

@app.route("/api/user/profile", methods=["GET"])
@jwt_required()
def user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "user": {
            "user_id": user.id,
            "user_name": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "date_of_birth": user.date_of_birth,
            "role": "admin" if user.is_admin else "user",
            "created_at": user.created_at
        }
    })

from flask_jwt_extended import (
    unset_jwt_cookies,
    jwt_required
)

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required(optional=True)
def logout():
    response = jsonify({
        "msg": "Đăng xuất thành công"
    })

    unset_jwt_cookies(response)
    return response, 200


@app.route('/api/newshop', methods=['POST'])
@jwt_required()
def create_shop():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User không tồn tại, vui lòng đăng nhập lại"}), 401

    if user.shop:
        return jsonify({"msg": "Bạn đã có shop"}), 400

    ten_shop = request.form.get("ten_shop")
    if not ten_shop:
        return jsonify({"msg": "Thiếu tên shop"}), 400

    shop = Shop(
        user_id=user.id,
        ten_shop=ten_shop,
        mo_ta=request.form.get("mo_ta"),
        the_loai=request.form.get("the_loai")
    )

    db.session.add(shop)
    db.session.commit()

    return jsonify({
        "msg": "Tạo shop thành công",
        "shop": shop.to_dict()
    }), 201

# --- Admin / Kho endpoints ---
@app.route('/api/admin/addSanpham', methods=['POST'])
@jwt_required()
def admin_add_sanpham():
    try:
        # Accept multipart/form-data or JSON
        name = request.form.get('name') or request.json.get('name') if request.is_json else request.form.get('name')
        price = request.form.get('price') or (request.json.get('price') if request.is_json else None)
        stock = request.form.get('stock') or (request.json.get('stock') if request.is_json else 0)
        category_id = request.form.get('category_id') or (request.json.get('category_id') if request.is_json else None)
        shop_id = request.form.get('shop_id') or (request.json.get('shop_id') if request.is_json else None)

        # handle uploaded image
        image_file = request.files.get('image')
        filename = None
        if image_file:
            fname = secure_filename(image_file.filename)
            import time
            filename = f"prod_{int(time.time())}_{fname}"
            images_dir = 'images'
            os.makedirs(images_dir, exist_ok=True)
            image_file.save(os.path.join(images_dir, filename))

        # fallback defaults
        if not category_id:
            # pick first category if exists
            cat = Category.query.first()
            category_id = cat.id if cat else None

        p = Product(
            name=name or 'Untitled',
            price=float(price) if price else 0.0,
            discount_price=0.0,
            stock=int(stock) if stock else 0,
            image_url=filename,
            category_id=int(category_id) if category_id else (cat.id if (cat:=Category.query.first()) else 1),
            shop_id=int(shop_id) if shop_id else None
        )
        db.session.add(p)
        db.session.commit()
        return jsonify({"status": "success", "product": p.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        print('[admin_add_sanpham] Exception:', e)
        import traceback
        traceback.print_exc()
        return jsonify({"status": False, "msg": str(e)}), 500

@app.route('/api/shop/product', methods=['POST'])
@jwt_required()
def add_product():
    user_id = int(get_jwt_identity())

    shop = Shop.query.filter_by(user_id=user_id).first()
    if not shop:
        return jsonify({"msg": "Bạn chưa tạo shop"}), 403

    name = request.form.get('name')
    price = request.form.get('price')
    stock = request.form.get('stock')

    if not name or not price:
        return jsonify({"msg": "Thiếu dữ liệu"}), 400

    filename = None
    file = request.files.get('image')
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join('images', filename))

    product = Product(
        name=name,
        price=float(price),
        stock=int(stock or 0),
        image_url=filename,
        category_id=1,  # tạm
        shop_id=shop.id
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "msg": "Thêm sản phẩm thành công",
        "product": product.to_dict()
    }), 201


@app.route('/api/admin/xemsanpham', methods=['GET'])
@jwt_required()
def admin_xemsanpham():
    # optional query param shop_id
    shop_id = request.args.get('shop_id')
    try:
        if shop_id:
            prods = Product.query.filter_by(shop_id=shop_id).all()
        else:
            prods = Product.query.all()
        return jsonify({"status": "success", "products": [p.to_dict() for p in prods]})
    except Exception as e:
        print('[admin_xemsanpham] Exception:', e)
        return jsonify({"status": False, "msg": str(e)}), 500


@app.route('/api/admin/xemkho', methods=['GET'])
@jwt_required()
def admin_xemkho():
    danh_sach_kho = Kho.query.order_by(Kho.created_at.desc()).all()

    return jsonify({
        "data": [
            {
                "id": kho.id,
                "ten_kho": kho.ten_kho,
                "dia_chi": kho.dia_chi,
                "created_at": kho.created_at
            }
            for kho in danh_sach_kho
        ]
    }), 200



@app.route('/api/admin/suasanpham/<int:sp_id>', methods=['PATCH'])
@jwt_required()
def admin_suasanpham(sp_id):
    try:
        data = request.get_json() or {}
        p = Product.query.get(sp_id)
        if not p:
            return jsonify({"status": False, "msg": "Product not found"}), 404
        for k in ['name', 'price', 'discount_price', 'stock', 'image_url', 'category_id']:
            if k in data:
                setattr(p, k, data[k])
        db.session.commit()
        return jsonify({"status": "success", "product": p.to_dict()})
    except Exception as e:
        db.session.rollback()
        print('[admin_suasanpham] Exception:', e)
        return jsonify({"status": False, "msg": str(e)}), 500


@app.route('/api/admin/deletesanpham/<int:sp_id>', methods=['DELETE'])
@jwt_required()
def admin_deletesanpham(sp_id):
    try:
        p = Product.query.get(sp_id)
        if not p:
            return jsonify({"status": False, "msg": "Product not found"}), 404
        db.session.delete(p)
        db.session.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        db.session.rollback()
        print('[admin_deletesanpham] Exception:', e)
        return jsonify({"status": False, "msg": str(e)}), 500


@app.route('/api/admin/addkho', methods=['POST'])
@jwt_required()
def admin_addkho():
    data = request.get_json()

    ten_kho = data.get("ten_kho")
    dia_chi = data.get("dia_chi", "")

    if not ten_kho:
        return jsonify({"message": "Tên kho không được để trống"}), 400

    # ❗ Check trùng tên kho
    kho_ton_tai = Kho.query.filter_by(ten_kho=ten_kho).first()
    if kho_ton_tai:
        return jsonify({"message": "Kho đã tồn tại"}), 409

    kho = Kho(
        ten_kho=ten_kho,
        dia_chi=dia_chi
    )

    db.session.add(kho)
    db.session.commit()

    return jsonify({
        "message": "Thêm kho thành công",
        "data": {
            "id": kho.id,
            "ten_kho": kho.ten_kho
        }
    }), 201

@app.route('/api/admin/nhapkho', methods=['PUT'])
@jwt_required()
def admin_nhapkho():
    data = request.get_json()

    kho_id = data.get("kho_id")
    sanpham_id = data.get("sanpham_id")
    so_luong = data.get("so_luong")

    if not kho_id or not sanpham_id or not so_luong:
        return jsonify({"message": "Thiếu dữ liệu nhập kho"}), 400

    if so_luong <= 0:
        return jsonify({"message": "Số lượng phải lớn hơn 0"}), 400

    kho = Kho.query.get(kho_id)
    if not kho:
        return jsonify({"message": "Kho không tồn tại"}), 404

    sanpham = SanPham.query.get(sanpham_id)
    if not sanpham:
        return jsonify({"message": "Sản phẩm không tồn tại"}), 404

    # ✅ Lưu lịch sử nhập kho
    nhapkho = NhapKho(
        kho_id=kho_id,
        sanpham_id=sanpham_id,
        so_luong=so_luong
    )

    # ✅ Cộng tồn kho sản phẩm
    sanpham.so_luong += so_luong

    db.session.add(nhapkho)
    db.session.commit()

    return jsonify({
        "message": "Nhập kho thành công",
        "data": {
            "kho": kho.ten_kho,
            "sanpham": sanpham.ten_sanpham,
            "so_luong": so_luong
        }
    }), 200

@app.route("/api/inventory/import", methods=["POST"])
@jwt_required()
def import_inventory():
    user_id = int(get_jwt_identity())
    shop = Shop.query.filter_by(user_id=user_id).first()

    if not shop:
        return jsonify({"msg": "Bạn chưa có shop"}), 403

    data = request.get_json()
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 0))

    inv = Inventory.query.filter_by(
        shop_id=shop.id,
        product_id=product_id
    ).first()

    if not inv:
        inv = Inventory(
            shop_id=shop.id,
            product_id=product_id,
            quantity=0
        )
        db.session.add(inv)

    inv.quantity += quantity

    log = InventoryLog(
        shop_id=shop.id,
        product_id=product_id,
        type="IMPORT",
        quantity=quantity,
        note="Nhập kho"
    )

    db.session.add(log)
    db.session.commit()

    return jsonify({"msg": "Nhập kho thành công"})


@app.route("/api/inventory", methods=["GET"])
@jwt_required()
def view_inventory():
    user_id = int(get_jwt_identity())
    shop = Shop.query.filter_by(user_id=user_id).first()

    items = Inventory.query.filter_by(shop_id=shop.id).all()

    return jsonify([
        {
            "product_id": i.product_id,
            "quantity": i.quantity
        } for i in items
    ])


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


@app.route('/api/feedbackofshop/<int:shop_id>', methods=['GET'])
def feedback_of_shop(shop_id):
    try:
        feedbacks = Feedback.query.filter_by(shop_id=shop_id).order_by(Feedback.created_at.desc()).all()
        return jsonify({"status": "success", "feedbacks": [f.to_dict() for f in feedbacks]})
    except Exception as e:
        print('[feedback_of_shop] Exception:', e)
        return jsonify({"status": False, "msg": str(e)}), 500


@app.route('/api/feedbackofshop', methods=['POST'])
def create_feedback():
    # Accept JSON: { shop_id, user_id (optional), rating, comment }
    data = request.get_json() or {}
    shop_id = data.get('shop_id')
    if not shop_id:
        return jsonify({"status": False, "msg": "shop_id is required"}), 400
    try:
        fb = Feedback(
            shop_id=int(shop_id),
            user_id=data.get('user_id'),
            rating=data.get('rating'),
            comment=data.get('comment')
        )
        db.session.add(fb)
        db.session.commit()
        return jsonify({"status": "success", "feedback": fb.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        print('[create_feedback] Exception:', e)
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