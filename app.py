import os
from datetime import datetime
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# --- CẤU HÌNH CƠ BẢN ---
app = Flask(__name__, static_folder='build/client', static_url_path='/')

# 1. Cấu hình Database (Sử dụng SQLite đơn giản)
# Database sẽ được lưu trong tệp "site.db" trong thư mục gốc
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 2. Cấu hình CORS
# Cho phép Frontend React trên cổng 5173 truy cập tất cả API (/api/*)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})


# --- ĐỊNH NGHĨA MODEL DATABASE (Sử dụng Flask-SQLAlchemy) ---

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
                            image_url='product1.jpg', is_discounted=True, category=cat_shoes)
            prod2 = Product(name='iPhone 15', price=25000000, image_url='product2.jpg', 
                            is_bestseller=True, category=cat_mobile)
            prod3 = Product(name='Giày Da Thời Trang', price=900000, image_url='product3.jpg', 
                            is_bestseller=True, category=cat_shoes)
            
            db.session.add_all([prod1, prod2, prod3])
            db.session.commit()
            print("Hoàn tất thêm dữ liệu mẫu.")


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


# --- CHẠY SERVER ---

if __name__ == '__main__':
    # Bắt đầu khởi tạo database và dữ liệu mẫu
    initialize_database() 
    
    print("\n=============================================")
    print(f"Backend Python (Flask) đang chạy trên: http://localhost:5000")
    print(f"Frontend React (Dev) đang chạy trên: http://localhost:5173")
    print("=============================================\n")
    
    # Chạy máy chủ Flask trên cổng 5000
    # Đảm bảo debug=True chỉ khi phát triển
    app.run(host='0.0.0.0', port=5000, debug=True)