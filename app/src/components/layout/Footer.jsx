import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="mt-5">
      <div className="bg-gray-900 text-gray-200 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1 - Thương hiệu */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Maliket Mall
            </h2>
            <p className="text-gray-400 text-sm">
              Nơi mua sắm đáng tin cậy với hàng ngàn sản phẩm chất lượng và giá
              tốt.
            </p>
          </div>

          {/* Cột 2 - Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Thông tin</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/security">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/MalikethPolicy">Quy chế hoạt động</Link>
              </li>
              <li>
                <Link to="/ReturnRefundPolicy">
                  Chính sách trả hàng hoàn tiền
                </Link>
              </li>
              <li>
                <Link to="/TermsOfService">Điều khoản dịch vụ</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3 - Hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="#">Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link to="#">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link to="#">Liên hệ hỗ trợ</Link>
              </li>
            </ul>
          </div>

          {/* Cột 4 - Liên hệ */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Liên hệ</h3>
            <p className="text-gray-400 text-sm">📍 123 Đường ABC, TP.HCM</p>
            <p className="text-gray-400 text-sm">📞 0123 456 789</p>
            <p className="text-gray-400 text-sm">✉ support@malikethmall.com</p>
            <div className="flex gap-4 mt-3">
              <a href="#">
                <i className="fab fa-facebook text-xl hover:text-blue-500"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram text-xl hover:text-pink-500"></i>
              </a>
              <a href="#">
                <i className="fab fa-tiktok text-xl hover:text-gray-300"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="border-t border-gray-700 text-center py-4 text-gray-400 text-sm">
          © 2025 Maliketh Mall. All rights reserved.
        </div>
      </div>
    </div>
  );
}
