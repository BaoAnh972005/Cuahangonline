from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- Phải có dòng này

app = FastAPI()

# --- CẤU HÌNH CORS (BẮT BUỘC ĐỂ KẾT NỐI VERCEL) ---
origins = [
    "*", # Cho phép tất cả các trang web (bao gồm Vercel) truy cập
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CÁC API CHO CỬA HÀNG ---

@app.get("/")
def read_root():
    return {"message": "Backend Cửa Hàng Online đang chạy!", "status": "success"}

# API trả về danh sách sản phẩm để Frontend hiển thị
@app.get("/products")
def get_products():
    return [
        {"id": 1, "name": "iPhone 15 Pro", "price": 999},
        {"id": 2, "name": "MacBook Air M2", "price": 1199},
        {"id": 3, "name": "Samsung Galaxy S24", "price": 899},
        {"id": 4, "name": "Sony WH-1000XM5", "price": 348}
    ]