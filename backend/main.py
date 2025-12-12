import os
from datetime import datetime, timedelta
from typing import Optional
import stripe

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# --- THU VIEN BAO MAT ---
from passlib.context import CryptContext
from jose import JWTError, jwt

app = FastAPI()

# --- 1. CAU HINH ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Khi không có DATABASE_URL, sử dụng PostgreSQL local với cấu hình mặc định
    # Bạn cần cài đặt PostgreSQL trên máy và tạo database trước khi chạy
    DATABASE_URL = "postgresql://username:password@localhost/cuahangonline"
    # Nếu bạn chưa có PostgreSQL, có thể chuyển sang dùng SQLite tạm thời
    # DATABASE_URL = "sqlite:///./test.db"

SECRET_KEY = "chuoi-bi-mat-cua-nhom-2"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Cấu hình Stripe - trong thực tế, bạn sẽ lấy từ biến môi trường
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. MODELS (BANG DU LIEU) ---

class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    description = Column(String, default="San pham chinh hang")
    image_url = Column(String, default="https://via.placeholder.com/150")

# CẬP NHẬT BẢNG USER: Thêm Phone, Email và Birthdate
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="member") # Mac dinh la member
    phone = Column(String, nullable=True)   # Moi them
    email = Column(String, nullable=True)   # Moi them
    birthdate = Column(String, nullable=True)  # Them truong ngay sinh

# MODEL CHO GIO HANG
class CartItemDB(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)
    quantity = Column(Integer, default=1)

# MODEL CHO DANH SACH YEU THICH (WISHLIST)
class WishlistItemDB(Base):
    __tablename__ = "wishlist_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)

# MODEL CHO DANH GIA SAN PHAM
class ReviewDB(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)
    rating = Column(Integer, default=5)  # 1-5 sao
    comment = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

# MODEL CHO MA GIAM GIA
class CouponDB(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount_percent = Column(Float)  # Phần trăm giảm giá
    min_order_amount = Column(Float, default=0)  # Giá trị đơn hàng tối thiểu
    max_discount_amount = Column(Float, nullable=True)  # Mức giảm tối đa
    expiration_date = Column(String)  # Ngày hết hạn
    usage_limit = Column(Integer, default=1)  # Số lần có thể sử dụng
    used_count = Column(Integer, default=0)  # Số lần đã sử dụng

# MODEL CHO DON HANG
class OrderDB(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    total_amount = Column(Float)
    status = Column(String, default="pending")  # pending, paid, shipped, delivered
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    shipping_address = Column(String)

# CHI TIET DON HANG
class OrderDetailDB(Base):
    __tablename__ = "order_details"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)
    quantity = Column(Integer, default=1)
    price = Column(Float)  # Giá tại thời điểm đặt hàng

# Lenh nay tu dong tao bang.
# LUU Y: Neu bang Users cu da ton tai nhung thieu cot, no SE KHONG tu dong them cot.
# Ban can xoa bang cu di hoac xoa Database tao lai.
Base.metadata.create_all(bind=engine)

# --- 3. HELPER FUNCTIONS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# HÀM XỬ LÝ GIỎ HÀNG
def get_cart_items(db: Session, user_id: int):
    cart_items = db.query(CartItemDB).filter(CartItemDB.user_id == user_id).all()
    result = []
    for item in cart_items:
        product = db.query(ProductDB).filter(ProductDB.id == item.product_id).first()
        if product:
            result.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name,
                "product_price": product.price,
                "quantity": item.quantity
            })
    return result

def calculate_cart_total(db: Session, user_id: int):
    cart_items = get_cart_items(db, user_id)
    total = sum(item["product_price"] * item["quantity"] for item in cart_items)
    return total

# --- 4. DEPENDENCIES ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    
    user = db.query(UserDB).filter(UserDB.username == username).first()
    if user is None:
        raise HTTPException(status_code=401)
    return user

async def check_admin_role(current_user: UserDB = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

# --- 5. SCHEMAS (DU LIEU DAU VAO) ---
class ProductCreate(BaseModel):
    name: str
    price: float
    description: str = "Mo ta san pham"

# CẬP NHẬT: Thêm cac truong moi vao form dang ky
class UserRegister(BaseModel):
    username: str
    password: str
    phone: str
    email: str
    birthdate: Optional[str] = None  # Thêm trường ngày sinh (tùy chọn)
    # Khong cho phep nguoi dung tu chon role nua (mac dinh la member)

class Token(BaseModel):
    access_token: str
    token_type: str

# SCHEMA CHO GIO HANG
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    
    class Config:
        from_attributes = True

# SCHEMA CHO DON HANG
class OrderCreate(BaseModel):
    shipping_address: str

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    created_at: str
    shipping_address: str
    
    class Config:
        from_attributes = True

# SCHEMA CHO THANH TOAN
class PaymentIntentCreate(BaseModel):
    amount: float  # Tổng số tiền thanh toán
    currency: str = "usd"

# SCHEMA CHO DANH SACH YEU THICH
class WishlistItemCreate(BaseModel):
    product_id: int

# SCHEMA CHO DANH GIA
class ReviewCreate(BaseModel):
    product_id: int
    rating: int  # 1-5 sao
    comment: str

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: str
    created_at: str

    class Config:
        from_attributes = True

# SCHEMA CHO MA GIAM GIA
class CouponCreate(BaseModel):
    code: str
    discount_percent: float  # Phần trăm giảm giá (0-100)
    min_order_amount: float = 0
    max_discount_amount: float = None # Mức giảm tối đa
    expiration_date: str  # Ngày hết hạn (ISO format)
    usage_limit: int = 1  # Số lần có thể sử dụng

class CouponResponse(BaseModel):
    id: int
    code: str
    discount_percent: float
    min_order_amount: float
    max_discount_amount: float
    expiration_date: str
    usage_limit: int
    used_count: int

    class Config:
        from_attributes = True

# --- 6. API ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend Updated v3", "status": "ok"}

# API DANG KY MOI (Cap nhat logic)
@app.post("/register", response_model=Token)
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Check trung ten
    if db.query(UserDB).filter(UserDB.username == user.username).first():
        raise HTTPException(status_code=400, detail="Ten dang nhap da ton tai")
    
    # Tao user moi (Mac dinh role="member")
    hashed_password = get_password_hash(user.password)
    new_user = UserDB(
        username=user.username,
        hashed_password=hashed_password,
        role="member", # Luon luon la member
        phone=user.phone,
        email=user.email,
        birthdate=user.birthdate # Them truong ngay sinh
    )
    db.add(new_user)
    db.commit()
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Sai thong tin dang nhap")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
def read_users_me(current_user: UserDB = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "role": current_user.role,
        "phone": current_user.phone,
        "email": current_user.email,
        "birthdate": current_user.birthdate
    }

# --- PRODUCT API ---
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductDB).all()

@app.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    new_product = ProductDB(name=product.name, price=product.price, description=product.description)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/products/{product_id}")
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not db_product: raise HTTPException(status_code=404)
    db_product.name = product.name
    db_product.price = product.price
    db_product.description = product.description
    db.commit()
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not db_product: raise HTTPException(status_code=404)
    db.delete(db_product)
    db.commit()
    return {"message": "Deleted"}

# --- CART API ---
@app.get("/cart")
def get_cart(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    cart_items = get_cart_items(db, current_user.id)
    total = calculate_cart_total(db, current_user.id)
    return {"items": cart_items, "total": total}

@app.post("/cart")
def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    existing_item = db.query(CartItemDB).filter(
        CartItemDB.user_id == current_user.id,
        CartItemDB.product_id == item.product_id
    ).first()
    
    if existing_item:
        # Nếu đã tồn tại thì cập nhật số lượng
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
    else:
        # Nếu chưa tồn tại thì thêm mới
        new_cart_item = CartItemDB(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_cart_item)
        db.commit()
        db.refresh(new_cart_item)
    
    return {"message": "Added to cart", "item_id": existing_item.id if existing_item else new_cart_item.id}

@app.put("/cart/{item_id}")
def update_cart_item(item_id: int, item: CartItemCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    cart_item = db.query(CartItemDB).filter(
        CartItemDB.id == item_id,
        CartItemDB.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    cart_item.quantity = item.quantity
    db.commit()
    return {"message": "Cart item updated"}

@app.delete("/cart/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    cart_item = db.query(CartItemDB).filter(
        CartItemDB.id == item_id,
        CartItemDB.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Removed from cart"}

@app.delete("/cart/clear")
def clear_cart(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    db.query(CartItemDB).filter(CartItemDB.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}

# --- ORDERS API ---
@app.get("/orders")
def get_orders(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    orders = db.query(OrderDB).filter(OrderDB.user_id == current_user.id).all()
    return orders

@app.post("/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Lấy giỏ hàng của người dùng
    cart_items = get_cart_items(db, current_user.id)
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Tính tổng tiền
    total_amount = calculate_cart_total(db, current_user.id)
    
    # Tạo đơn hàng mới
    new_order = OrderDB(
        user_id=current_user.id,
        total_amount=total_amount,
        shipping_address=order.shipping_address
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Tạo chi tiết đơn hàng
    for item in cart_items:
        order_detail = OrderDetailDB(
            order_id=new_order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["product_price"]
        )
        db.add(order_detail)
    
    db.commit()
    
    # Xóa giỏ hàng sau khi tạo đơn hàng
    db.query(CartItemDB).filter(CartItemDB.user_id == current_user.id).delete()
    db.commit()
    
    return {"message": "Order created successfully", "order_id": new_order.id}

# --- PAYMENT API ---
@app.post("/create-payment-intent")
def create_payment_intent(payment_data: PaymentIntentCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Trong thực tế, bạn sẽ tích hợp với Stripe hoặc PayPal ở đây
    # Hiện tại, chúng ta sẽ mô phỏng quá trình tạo payment intent
    
    # Kiểm tra xem số tiền có hợp lệ không
    if payment_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    
    # Trả về một ID thanh toán giả lập
    import uuid
    payment_intent_id = f"pi_{uuid.uuid4().hex[:12]}"
    
    return {
        "payment_intent_id": payment_intent_id,
        "amount": payment_data.amount,
        "currency": payment_data.currency,
        "status": "created"
    }

@app.post("/process-payment")
def process_payment(payment_intent_id: str, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Trong thực tế, bạn sẽ gọi API của Stripe để xác nhận thanh toán
    # Ở đây, chúng ta sẽ mô phỏng quá trình xử lý thanh toán
    try:
        # Trong thực tế, bạn sẽ xác minh payment intent với Stripe
        # stripe_response = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Cập nhật trạng thái đơn hàng gần nhất của người dùng thành "paid"
        latest_order = db.query(OrderDB).filter(
            OrderDB.user_id == current_user.id
        ).order_by(OrderDB.created_at.desc()).first()
        
        if latest_order:
            latest_order.status = "paid"
            db.commit()
            
            # Ở đây bạn có thể thêm logic gửi email xác nhận đơn hàng
            # send_order_confirmation_email(current_user.email, latest_order)
        
        return {
            "payment_intent_id": payment_intent_id,
            "status": "succeeded",
            "order_id": latest_order.id if latest_order else None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Payment processing failed: {str(e)}")

# --- EMAIL CONFIRMATION (mô phỏng) ---
def send_order_confirmation_email(user_email: str, order: OrderDB):
    # Trong thực tế, bạn sẽ sử dụng một thư viện như aiosmtplib để gửi email
    # hoặc sử dụng dịch vụ như SendGrid, Mailgun, v.v.
    print(f"Gửi email xác nhận đơn hàng #{order.id} đến {user_email}")
    # Logic gửi email sẽ được thêm vào trong phiên bản hoàn thiện

# --- WISHLIST API ---
@app.get("/wishlist")
def get_wishlist(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    wishlist_items = db.query(WishlistItemDB).filter(WishlistItemDB.user_id == current_user.id).all()
    result = []
    for item in wishlist_items:
        product = db.query(ProductDB).filter(ProductDB.id == item.product_id).first()
        if product:
            result.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name,
                "product_price": product.price
            })
    return result

@app.post("/wishlist")
def add_to_wishlist(item: WishlistItemCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Kiểm tra xem sản phẩm đã tồn tại trong wishlist chưa
    existing_item = db.query(WishlistItemDB).filter(
        WishlistItemDB.user_id == current_user.id,
        WishlistItemDB.product_id == item.product_id
    ).first()
    
    if existing_item:
        raise HTTPException(status_code=400, detail="Sản phẩm đã có trong danh sách yêu thích")
    
    new_wishlist_item = WishlistItemDB(
        user_id=current_user.id,
        product_id=item.product_id
    )
    db.add(new_wishlist_item)
    db.commit()
    db.refresh(new_wishlist_item)
    
    return {"message": "Đã thêm vào danh sách yêu thích", "item_id": new_wishlist_item.id}

@app.delete("/wishlist/{item_id}")
def remove_from_wishlist(item_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    wishlist_item = db.query(WishlistItemDB).filter(
        WishlistItemDB.id == item_id,
        WishlistItemDB.user_id == current_user.id
    ).first()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm trong danh sách yêu thích")
    
    db.delete(wishlist_item)
    db.commit()
    return {"message": "Đã xóa khỏi danh sách yêu thích"}

# --- REVIEWS API ---
@app.get("/products/{product_id}/reviews")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(ReviewDB).filter(ReviewDB.product_id == product_id).all()
    return reviews

@app.post("/products/{product_id}/reviews")
def create_review(product_id: int, review: ReviewCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    existing_review = db.query(ReviewDB).filter(
        ReviewDB.user_id == current_user.id,
        ReviewDB.product_id == product_id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="Bạn đã đánh giá sản phẩm này rồi")
    
    new_review = ReviewDB(
        user_id=current_user.id,
        product_id=product_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return {"message": "Đánh giá đã được tạo", "review_id": new_review.id}

# --- COUPONS API ---
@app.get("/coupons/{code}")
def get_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(CouponDB).filter(CouponDB.code == code).first()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Mã giảm giá không tồn tại")
    
    # Kiểm tra hạn sử dụng
    from datetime import datetime
    if datetime.fromisoformat(coupon.expiration_date.replace('Z', '+00:00')) < datetime.now():
        raise HTTPException(status_code=400, detail="Mã giảm giá đã hết hạn")
    
    # Kiểm tra số lần sử dụng
    if coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Mã giảm giá đã hết lượt sử dụng")
    
    return coupon

@app.post("/coupons")
def create_coupon(coupon: CouponCreate, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    # Kiểm tra xem mã giảm giá đã tồn tại chưa
    existing_coupon = db.query(CouponDB).filter(CouponDB.code == coupon.code).first()
    if existing_coupon:
        raise HTTPException(status_code=400, detail="Mã giảm giá đã tồn tại")
    
    new_coupon = CouponDB(
        code=coupon.code,
        discount_percent=coupon.discount_percent,
        min_order_amount=coupon.min_order_amount,
        max_discount_amount=coupon.max_discount_amount,
        expiration_date=coupon.expiration_date,
        usage_limit=coupon.usage_limit
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    
    return {"message": "Mã giảm giá đã được tạo", "coupon_id": new_coupon.id}