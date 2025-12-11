import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# --- THU VIEN BAO MAT ---
from passlib.context import CryptContext # De ma hoa mat khau
from jose import JWTError, jwt # De tao Token dang nhap

app = FastAPI()

# ==========================================
# 1. CẤU HÌNH BẢO MẬT (SECRET KEY & DATABASE)
# ==========================================
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

# CAU HINH JWT TOKEN
SECRET_KEY = "chuoi-bi-mat-sieu-kho-doan-cua-nhom-2" # Ban co the doi chuoi nay
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Token het han sau 30 phut

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Ket noi DB
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# 2. ĐỊNH NGHĨA BẢNG (MODELS)
# ==========================================

# Bảng Sản Phẩm
class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    description = Column(String, default="San pham chinh hang")
    image_url = Column(String, default="https://via.placeholder.com/150")

# Bảng User (Nguoi dung) - MOI THEM
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="member") # "admin" hoac "member"

Base.metadata.create_all(bind=engine)

# ==========================================
# 3. CÁC HÀM TIỆN ÍCH (HELPER FUNCTIONS)
# ==========================================

# Lay DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ma hoa mat khau
def get_password_hash(password):
    return pwd_context.hash(password)

# Kiem tra mat khau luc dang nhap
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Tao JWT Token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ==========================================
# 4. KIỂM TRA QUYỀN (DEPENDENCIES)
# ==========================================

# Ham nay se chay truoc cac API can bao mat: De lay thong tin user tu Token
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserDB).filter(UserDB.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Ham nay kiem tra: Phai la ADMIN moi duoc di tiep
async def check_admin_role(current_user: UserDB = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Ban khong du quyen (Admin only)")
    return current_user

# ==========================================
# 5. SCHEMAS (DATA DAU VAO)
# ==========================================
class ProductCreate(BaseModel):
    name: str
    price: float
    description: str = "Mo ta san pham"

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "member" # Mac dinh la member, muon lam admin thi gui "admin" len

class Token(BaseModel):
    access_token: str
    token_type: str

# ==========================================
# 6. API ENDPOINTS
# ==========================================

# Cau hinh CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend Full Auth & RBAC is running!", "status": "ok"}

# --- AUTHENTICATION API (DANG KY / DANG NHAP) ---

@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check trung ten
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Ten dang nhap da ton tai")
    
    # Tao user moi
    hashed_password = get_password_hash(user.password)
    new_user = UserDB(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    
    # Dang ky xong tu dong dang nhap luon (cap token)
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Tim user
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    # Kiem tra pass
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai tai khoan hoac mat khau",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Cap token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
def read_users_me(current_user: UserDB = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

# --- PRODUCT API (PHAN QUYEN CHAT CHE) ---

# AI CUNG XEM DUOC (Khong can Login)
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductDB).all()

# CHI ADMIN MOI DUOC THEM (Them Depends(check_admin_role))
@app.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    new_product = ProductDB(name=product.name, price=product.price, description=product.description)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# CHI ADMIN MOI DUOC SUA
@app.put("/products/{product_id}")
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.name = product.name
    db_product.price = product.price
    db_product.description = product.description
    db.commit()
    db.refresh(db_product)
    return db_product

# CHI ADMIN MOI DUOC XOA
@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), user: UserDB = Depends(check_admin_role)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Deleted successfully"}