from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- CẤU HÌNH CORS ---
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend OK", "status": "active"}

# --- ĐÂY LÀ DỮ LIỆU SẢN PHẨM ---
@app.get("/products")
def get_products():
    return [
        {"id": 1, "name": "iPhone 15 Pro", "price": 999},
        {"id": 2, "name": "MacBook Air M2", "price": 1199},
        {"id": 3, "name": "Samsung Galaxy S24", "price": 899},
        {"id": 4, "name": "Sony WH-1000XM5", "price": 348}
    ]
