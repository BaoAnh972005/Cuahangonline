import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

# --- 1. KẾT NỐI DATABASE ---
# Lấy chuỗi kết nối từ biến môi trường chúng ta vừa cài đặt
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback: Nếu chạy local không có biến môi trường thì báo lỗi hoặc dùng SQLite tạm
if not DATABASE_URL:
    # Mẹo: Để chạy local bạn có thể dán chuỗi postgresql vào đây (nhưng đừng commit lên Github)
    # Hoặc để trống thì code sẽ báo lỗi khi chạy local, nhưng chạy trên Render thì OK.
    print("⚠️ CHƯA CÓ DATABASE_URL. Web có thể bị lỗi nếu chạy local.")
    DATABASE_URL = "sqlite:///./test.db" 

# Thiết lập kết nối
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. TẠO BẢNG SẢN PHẨM (Model) ---
class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    description = Column(String, default="Sản phẩm chính hãng")
    image_url = Column(String, default="https://via.placeholder.com/150") # Thêm ảnh cho đẹp

# Lệnh này sẽ tự động tạo bảng trong Database nếu chưa có
Base.metadata.create_all(bind=engine)

# --- 3. CẤU HÌNH CORS (Để Frontend gọi được) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hàm Dependency để lấy kết nối DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dữ liệu đầu vào khi tạo sản phẩm
class ProductCreate(BaseModel):
    name: str
    price: float
    description: str = "Mô tả sản phẩm"

# --- 4. CÁC API ---

@app.get("/")
def read_root():
    return {"message": "Backend đã kết nối PostgreSQL thành công!", "status": "active"}

# API Lấy danh sách (Lấy từ DB thật)
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductDB).all()

# API Tạo sản phẩm mới (Dùng để nạp dữ liệu)
@app.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductDB(name=product.name, price=product.price, description=product.description)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product
