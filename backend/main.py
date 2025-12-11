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
from passlib.context import CryptContext
from jose import JWTError, jwt

app = FastAPI()

# --- 1. CAU HINH ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

SECRET_KEY = "chuoi-bi-mat-cua-nhom-2"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

# CẬP NHẬT BẢNG USER: Thêm Phone và Email
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="member") # Mac dinh la member
    phone = Column(String, nullable=True)   # Moi them
    email = Column(String, nullable=True)   # Moi them

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
    # Khong cho phep nguoi dung tu chon role nua (mac dinh la member)

class Token(BaseModel):
    access_token: str
    token_type: str

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
        email=user.email
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
        "email": current_user.email
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