from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- CẤU HÌNH CORS (BẮT BUỘC ĐỂ FRONTEND GỌI ĐƯỢC) ---
origins = [
    "*", # Cho phép tất cả các trang web truy cập
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API MẶC ĐỊNH ---
@app.get("/")
def read_root():
    return {"message": "Backend đang chạy ngon lành!", "status": "ok"}

# --- API DANH SÁCH SẢN PHẨM (Cái Frontend đang cần tìm) ---
@app.get("/products")
def get_products():
    return [
        {"id": 1, "name": "iPhone 15 Pro", "price": 999},
        {"id": 2, "name": "MacBook Air M2", "price": 1199},
        {"id": 3, "name": "Samsung Galaxy S24", "price": 899},
        {"id": 4, "name": "Sony WH-1000XM5", "price": 348}
    ]
# Cap nhat lan 2 de Render nhan code