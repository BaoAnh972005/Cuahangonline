import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

# --- 1. KET NOI DATABASE ---
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("CHUA CO DATABASE_URL. Web co the bi loi neu chay local.")
    DATABASE_URL = "sqlite:///./test.db" 

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
    image_url = Column(String, default="https://via.placeholder.com/150")

Base.metadata.create_all(bind=engine)

# --- 3. CAU HINH CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Du lieu dau vao (cho ca Tao moi va Sua)
class ProductCreate(BaseModel):
    name: str
    price: float
    description: str = "Mo ta san pham"

# --- 4. CAC API ---

@app.get("/")
def read_root():
    return {"message": "Backend API da update Full chuc nang!", "status": "active"}

# 1. Xem danh sach
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductDB).all()

# 2. Them moi
@app.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductDB(name=product.name, price=product.price, description=product.description)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# 3. SUA SAN PHAM (Moi them)
@app.put("/products/{product_id}")
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    # Tim san pham theo ID
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    
    # Neu khong thay thi bao loi
    if db_product is None:
        raise HTTPException(status_code=404, detail="Khong tim thay san pham")
    
    # Cap nhat thong tin moi
    db_product.name = product.name
    db_product.price = product.price
    db_product.description = product.description
    
    db.commit()
    db.refresh(db_product)
    return db_product

# 4. XOA SAN PHAM (Moi them)
@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    
    if db_product is None:
        raise HTTPException(status_code=404, detail="Khong tim thay san pham")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Da xoa san pham thanh cong"}