import React from "react";
import Avatar from "../../../../../public/avatar.jpg";
import { EditOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

export default function Navigate() {
  const user = useSelector((state) => state.user.user);

  return (
    <div className="mt-16 bg-white shadow-md rounded-2xl p-6 border border-gray-100 max-w-sm mx-auto">
      {/* Hồ sơ người dùng */}
      <div className="flex flex-col items-center text-center">
        <img
          src={user?.avatar_url || Avatar}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-md"
        />
        <h2 className="mt-3 text-xl font-semibold text-gray-800">
          {user?.last_name || "Người dùng"}
        </h2>
        <button className="flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700 transition">
          <EditOutlined /> Sửa hồ sơ
        </button>
      </div>

      {/* Menu điều hướng */}
      <div className="flex flex-col gap-3 mt-6">
        <NavLink
          to="billing"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg font-medium text-center transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          🧾 Đơn hàng
        </NavLink>

        <NavLink
          to="notifications"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg font-medium text-center transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          🔔 Thông báo
        </NavLink>

        <NavLink
          to="settings"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg font-medium text-center transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          ⚙️ Cài đặt
        </NavLink>
      </div>
    </div>
  );
}
