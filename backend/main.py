import os
from datetime import datetime, timedelta
from typing import Optional
import stripe

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# --- THU VIEN BAO MAT ---
from passlib.context import CryptContext
from jose import JWTError, jwt

app = FastAPI()

# --- 1. CAU HINH ---
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    DATABASE_URL = "postgresql://username:password@localhost/cuahangonline"

SECRET_KEY = "chuoi-bi-mat-cua-nhom-2"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Chấp nhận tất cả để test
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. MODELS (CẬP NHẬT THÊM CỘT) ---

class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    # --- MỚI THÊM ---
    original_price = Column(Float, nullable=True) # Giá gốc (để tính %)
    sold_count = Column(Integer, default=0)       # Số lượng đã bán
    is_featured = Column(Boolean, default=False)  # Sản phẩm nổi bật
    # ----------------
    description = Column(String, default="San pham chinh hang")
    image_url = Column(String, default="https://via.placeholder.com/150")

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="member")
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    birthdate = Column(String, nullable=True)

class CartItemDB(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)
    quantity = Column(Integer, default=1)

class WishlistItemDB(Base):
    __tablename__ = "wishlist_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)

class ReviewDB(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)
    rating = Column(Integer, default=5)
    comment = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

class CouponDB(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount_percent = Column(Float)
    min_order_amount = Column(Float, default=0)
    max_discount_amount = Column(Float, nullable=True)
    expiration_date = Column(String)
    usage_limit = Column(Integer, default=1)
    used_count = Column(Integer, default=0)

class OrderDB(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    total_amount = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    shipping_address = Column(String)

class OrderDetailDB(Base):
    __tablename__ = "order_details"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)
    quantity = Column(Integer, default=1)
    price = Column(Float)

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

# --- 5. SCHEMAS (CẬP NHẬT) ---
class ProductCreate(BaseModel):
    name: str
    price: float
    original_price: Optional[float] = None
    description: str = "Mo ta san pham"
    image_url: str = ""
    is_featured: bool = False

class UserRegister(BaseModel):
    username: str
    password: str
    phone: str
    email: str
    birthdate: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    shipping_address: str

class PaymentIntentCreate(BaseModel):
    amount: float
    currency: str = "usd"

class WishlistItemCreate(BaseModel):
    product_id: int

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: str

class CouponCreate(BaseModel):
    code: str
    discount_percent: float
    min_order_amount: float = 0
    max_discount_amount: float = None
    expiration_date: str
    usage_limit: int = 1

# --- 6. API ---

@app.get("/")
def read_root():
    return {"message": "Backend Updated v5 (Filters Added)", "status": "ok"}

# REGISTER & LOGIN
@app.post("/register", response_model=Token)
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(UserDB).filter(UserDB.username == user.username).first():
        raise HTTPException(status_code=400, detail="Ten dang nhap da ton tai")
    
    hashed_password = get_password_hash(user.password)
    new_user = UserDB(
        username=user.username,
        hashed_password=hashed_password,
        role="member",
        phone=user.phone,
        email=user.email,
        birthdate=user.birthdate
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

# --- PRODUCTS (ĐÃ NÂNG CẤP LỌC) ---
@app.get("/products")
def get_products(filter_type: str = "all", db: Session = Depends(get_db)):
    """
    filter_type: 'all', 'featured' (Nổi bật), 'bestseller' (Bán chạy), 
                 'discount' (Giảm giá), 'new' (Mới)
    """
    query = db.query(ProductDB)

    if filter_type == "featured":
        # Lọc sản phẩm có is_featured = True
        query = query.filter(ProductDB.is_featured == True)
    elif filter_type == "bestseller":
        # Sắp xếp theo sold_count giảm dần
        query = query.order_by(desc(ProductDB.sold_count))
    elif filter_type == "discount":
        # Lọc sản phẩm có giá hiện tại < giá gốc
        query = query.filter(ProductDB.original_price > ProductDB.price)
    elif filter_type == "new":
        # Sắp xếp theo ID giảm dần (ID lớn là mới thêm)
        query = query.order_by(desc(ProductDB.id))
    
    # Mặc định hoặc sau khi filter thì lấy tất cả
    return query.all()

@app.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    new_product = ProductDB(
        name=product.name, 
        price=product.price, 
        original_price=product.original_price, # Mới
        description=product.description,
        image_url=product.image_url,
        is_featured=product.is_featured        # Mới
    )
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
    db_product.original_price = product.original_price # Mới
    db_product.description = product.description
    db_product.image_url = product.image_url
    db_product.is_featured = product.is_featured # Mới
    db.commit()
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not db_product: raise HTTPException(status_code=404)
    db.delete(db_product)
    db.commit()
    return {"message": "Deleted"}

# CART
@app.get("/cart")
def get_cart(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    cart_items = get_cart_items(db, current_user.id)
    total = calculate_cart_total(db, current_user.id)
    return {"items": cart_items, "total": total}

@app.post("/cart")
def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    existing_item = db.query(CartItemDB).filter(
        CartItemDB.user_id == current_user.id,
        CartItemDB.product_id == item.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
    else:
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
    if not cart_item: raise HTTPException(status_code=404)
    cart_item.quantity = item.quantity
    db.commit()
    return {"message": "Cart item updated"}

@app.delete("/cart/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    cart_item = db.query(CartItemDB).filter(
        CartItemDB.id == item_id,
        CartItemDB.user_id == current_user.id
    ).first()
    if not cart_item: raise HTTPException(status_code=404)
    db.delete(cart_item)
    db.commit()
    return {"message": "Removed from cart"}

@app.delete("/cart/clear")
def clear_cart(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    db.query(CartItemDB).filter(CartItemDB.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}

# ORDERS
@app.get("/orders")
def get_orders(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    return db.query(OrderDB).filter(OrderDB.user_id == current_user.id).all()

@app.post("/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    cart_items = get_cart_items(db, current_user.id)
    if not cart_items: raise HTTPException(status_code=400, detail="Cart is empty")
    
    total_amount = calculate_cart_total(db, current_user.id)
    new_order = OrderDB(
        user_id=current_user.id,
        total_amount=total_amount,
        shipping_address=order.shipping_address
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Cập nhật số lượng đã bán (sold_count) cho sản phẩm
    for item in cart_items:
        order_detail = OrderDetailDB(
            order_id=new_order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["product_price"]
        )
        db.add(order_detail)
        
        # Tăng lượt bán
        product_obj = db.query(ProductDB).filter(ProductDB.id == item["product_id"]).first()
        if product_obj:
            product_obj.sold_count += item["quantity"]

    db.commit()
    
    db.query(CartItemDB).filter(CartItemDB.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Order created successfully", "order_id": new_order.id}

# PAYMENT
@app.post("/create-payment-intent")
def create_payment_intent(payment_data: PaymentIntentCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if payment_data.amount <= 0: raise HTTPException(status_code=400, detail="Invalid amount")
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
    try:
        latest_order = db.query(OrderDB).filter(
            OrderDB.user_id == current_user.id
        ).order_by(OrderDB.created_at.desc()).first()
        
        if latest_order:
            latest_order.status = "paid"
            db.commit()
        
        return {
            "payment_intent_id": payment_intent_id,
            "status": "succeeded",
            "order_id": latest_order.id if latest_order else None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# WISHLIST
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
    existing_item = db.query(WishlistItemDB).filter(
        WishlistItemDB.user_id == current_user.id,
        WishlistItemDB.product_id == item.product_id
    ).first()
    if existing_item: raise HTTPException(status_code=400, detail="Sản phẩm đã có trong wishlist")
    
    new_wishlist_item = WishlistItemDB(user_id=current_user.id, product_id=item.product_id)
    db.add(new_wishlist_item)
    db.commit()
    db.refresh(new_wishlist_item)
    return {"message": "Added to wishlist", "item_id": new_wishlist_item.id}

@app.delete("/wishlist/{item_id}")
def remove_from_wishlist(item_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    wishlist_item = db.query(WishlistItemDB).filter(
        WishlistItemDB.id == item_id,
        WishlistItemDB.user_id == current_user.id
    ).first()
    if not wishlist_item: raise HTTPException(status_code=404)
    db.delete(wishlist_item)
    db.commit()
    return {"message": "Removed from wishlist"}

# REVIEWS
@app.get("/products/{product_id}/reviews")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(ReviewDB).filter(ReviewDB.product_id == product_id).all()

@app.post("/products/{product_id}/reviews")
def create_review(product_id: int, review: ReviewCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if db.query(ReviewDB).filter(ReviewDB.user_id == current_user.id, ReviewDB.product_id == product_id).first():
        raise HTTPException(status_code=400, detail="Đã đánh giá rồi")
    
    new_review = ReviewDB(
        user_id=current_user.id,
        product_id=product_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {"message": "Review created", "review_id": new_review.id}

# COUPONS
@app.get("/coupons/{code}")
def get_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(CouponDB).filter(CouponDB.code == code).first()
    if not coupon: raise HTTPException(status_code=404, detail="Mã không tồn tại")
    
    from datetime import datetime
    if datetime.fromisoformat(coupon.expiration_date.replace('Z', '+00:00')) < datetime.now():
        raise HTTPException(status_code=400, detail="Mã hết hạn")
    
    if coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Mã hết lượt dùng")
    return coupon

@app.post("/coupons")
def create_coupon(coupon: CouponCreate, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    if db.query(CouponDB).filter(CouponDB.code == coupon.code).first():
        raise HTTPException(status_code=400, detail="Mã đã tồn tại")
    
    new_coupon = CouponDB(**coupon.dict())
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return {"message": "Coupon created", "coupon_id": new_coupon.id}

# SETUP DATA (CẬP NHẬT ĐỂ TẠO DỮ LIỆU TEST LỌC)
@app.get("/setup-data")
def setup_data(username: str, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == username).first()
    msg_user = "User not found"
    if user:
        user.role = "admin"
        db.commit()
        msg_user = f"User {username} is now ADMIN"

    # Tạo sản phẩm mẫu đa dạng để test bộ lọc
    if db.query(ProductDB).count() == 0:
        products = [
            ProductDB(name="iPhone 15 Pro Max", price=1200.0, original_price=1300.0, description="Titanium, Hot", image_url="https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg", is_featured=True, sold_count=100),
            ProductDB(name="Samsung S24 Ultra", price=1100.0, original_price=1400.0, description="AI Phone, Sale Soc", image_url="https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg", is_featured=True, sold_count=50),
            ProductDB(name="Xiaomi 14", price=800.0, original_price=800.0, description="Leica Camera", image_url="https://cdn.tgdd.vn/Products/Images/42/314143/xiaomi-14-black-thumb-600x600.jpg", is_featured=False, sold_count=200), # Bán chạy
            ProductDB(name="OPPO Reno 11", price=400.0, original_price=500.0, description="Chuyen gia chan dung", image_url="https://cdn.tgdd.vn/Products/Images/42/319207/oppo-reno11-f-green-thumb-600x600.jpg", is_featured=False, sold_count=10),
            ProductDB(name="MacBook Air M3", price=1099.0, original_price=1099.0, description="New Model 2024", image_url="https://cdn.tgdd.vn/Products/Images/44/322615/macbook-air-13-inch-m3-2024-gray-thumb-600x600.jpg", is_featured=True, sold_count=5),
        ]
        db.add_all(products)
        db.commit()
        msg_product = "Demo products added"
    else:
        msg_product = "Products already exist"

    return {"status": "success", "user_update": msg_user, "product_update": msg_product}