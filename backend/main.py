import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

# --- 1. KET NOI DATABASE ---
# Lay chuoi ket noi tu bien moi truong chung ta vua cai dat
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback: Neu chay local khong co bien moi truong thi bao loi hoac dung SQLite tam
if not DATABASE_URL:
    # Meo: De chay local ban co the dan chuoi postgresql vao day (nhung dung commit len Github)
    # Hoac de trong thi code se bao loi khi chay local, nhung chay tren Render thi OK.
    print("CHUA CO DATABASE_URL. Web co the bi loi neu chay local.")
    DATABASE_URL = "sqlite:///./test.db" 

# Thiet lap ket noi
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. TAO BANG SAN PHAM (Model) ---
class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    description = Column(String, default="San pham chinh hang")
    image_url = Column(String, default="https://via.placeholder.com/150") # Them anh cho dep

# Lenh nay se tu dong tao bang trong Database neu chua co
Base.metadata.create_all(bind=engine)

# --- 3. CAU HINH CORS (De Frontend goi duoc) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ham Dependency de lay ket noi DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Du lieu dau vao khi tao san pham
class ProductCreate(BaseModel):
    name: str
    price: float
    description: str = "Mo ta san pham"

# --- 4. CAC API ---

@app.get("/")
def read_root():
    return {"message": "Backend da ket noi PostgreSQL thanh cong!", "status": "active"}

# API Lay danh sach (Lay tu DB that)
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductDB).all()

# API Tao san pham moi (Dung de nap du lieu)
@app.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductDB(name=product.name, price=product.price, description=product.description)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product
