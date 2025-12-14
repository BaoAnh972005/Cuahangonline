# create_admin.py
from app import app, db, User

def create_admin():
    with app.app_context():
        # Kiểm tra đã có admin chưa
        admin = User.query.filter_by(is_admin=True).first()
        if admin:
            print("⚠️ Admin đã tồn tại:", admin.username)
            return

        # Tạo admin mới
        admin = User(
            username="admin",
            email="admin@gmail.com",
            first_name="System",
            last_name="Administrator",
            phone="0900000000",
            is_admin=True
        )
        admin.set_password("admin123")  # 👉 đổi mật khẩu sau khi login

        db.session.add(admin)
        db.session.commit()

        print("✅ Tạo admin thành công!")
        print("👉 Username: admin")
        print("👉 Password: admin123")

if __name__ == "__main__":
    create_admin()
