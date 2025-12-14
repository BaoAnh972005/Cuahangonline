import React from "react";
import { NavLink } from "react-router-dom";
import { DashboardOutlined, InboxOutlined } from "@ant-design/icons";

export default function NagiveAdmin() {
  return (
    <div>
      <div className="flex min-h-screen bg-gray-100">
        <aside className="w-64 bg-white shadow-md p-4 hidden md:block">
          <h1 className="text-xl font-bold mb-6">Ecommerce Admin</h1>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded ${
                    isActive ? "bg-gray-800 text-white" : "hover:bg-gray-200"
                  }`
                }
              >
                Dashboard
                <span className="flex gap-1">
                  <DashboardOutlined style={{ fontSize: 24 }} />
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/billingadmin"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`
                }
              >
                Đơn hàng
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Sanpham"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`
                }
              >
                Sản phẩm{" "}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/kho"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`
                }
              >
                Kho{" "}
                <span>
                  <InboxOutlined style={{ fontSize: "24px" }} />
                </span>
              </NavLink>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
