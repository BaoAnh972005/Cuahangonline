import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import APIUser from "../../../utils/API/user.js";
import toast from "react-hot-toast";
import { Avatar } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();

  // =========================
  // FETCH PROFILE (QUERY)
  // =========================
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: APIUser.profile,
    retry: false,
  });

  const dataProfile = data?.data?.user;

  // =========================
  // EFFECT: ERROR HANDLING
  // =========================
  React.useEffect(() => {
    if (isError) {
      console.error("Profile API error:", error);
      toast.error("Không thể tải thông tin cá nhân");
    }
  }, [isError, error]);

  // =========================
  // UTILS
  // =========================
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "—";

  const calculateActiveDays = (created_at) => {
    if (!created_at) return 0;
    const diffTime = new Date() - new Date(created_at);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // =========================
  // UI: LOADING
  // =========================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <p className="text-xl font-semibold text-gray-600">
          Đang tải thông tin cá nhân...
        </p>
      </div>
    );
  }

  // =========================
  // UI: ERROR
  // =========================
  if (isError || !dataProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <h1 className="text-xl font-semibold mb-4">
          Không thể tải hồ sơ người dùng
        </h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Trở về trang chủ
        </button>
      </div>
    );
  }

  // =========================
  // UI: SUCCESS
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4">
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Trở về
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden rounded-3xl p-12 text-center bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 shadow-lg">
          <Avatar
            size={160}
            src={dataProfile.avatar_url}
            icon={!dataProfile.avatar_url && <UserOutlined />}
            className="border-4 border-white shadow-2xl mb-6"
          />

          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            {dataProfile.first_name} {dataProfile.last_name}
          </h1>

          <div className="inline-flex items-center px-6 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white mt-4">
            <span className="text-xl font-medium">
              @{dataProfile.user_name || "user"}
            </span>
            <span className="mx-3 opacity-80">:</span>
            <span className="px-3 py-1 bg-white/30 rounded-full flex items-center gap-2">
              <CrownOutlined /> {dataProfile.role}
            </span>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="rounded-2xl shadow-xl p-8 bg-white/70 backdrop-blur-md">
              <h2 className="text-3xl font-bold mb-6 text-blue-600">
                Thông Tin Tài Khoản
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={<IdcardOutlined />}
                  label="ID"
                  value={dataProfile.user_id}
                />
                <InfoItem
                  icon={<UserOutlined />}
                  label="Tên đăng nhập"
                  value={dataProfile.user_name}
                />
                <InfoItem
                  icon={<CrownOutlined />}
                  label="Vai trò"
                  value={dataProfile.role}
                />
                <InfoItem
                  icon={<CalendarOutlined />}
                  label="Ngày sinh"
                  value={formatDate(dataProfile.date_of_birth)}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl shadow-xl p-8 bg-white/70 backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">
                Liên Hệ
              </h2>

              <InfoItem
                icon={<MailOutlined />}
                label="Email"
                value={dataProfile.email}
              />
              <InfoItem
                icon={<PhoneOutlined />}
                label="Điện thoại"
                value={dataProfile.phone}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="rounded-2xl shadow-xl p-8 bg-white/70 backdrop-blur-md text-center">
              <h2 className="text-2xl font-bold mb-6 text-blue-600">
                Thống Kê
              </h2>

              <div className="p-6 bg-blue-400 text-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold">
                  {calculateActiveDays(dataProfile.created_at)}
                </div>
                <div className="text-sm opacity-90">
                  Ngày hoạt động
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= COMPONENT PHỤ ================= */
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
      <span className="text-blue-500 text-xl">{icon}</span>
      <span className="font-semibold w-32">{label}:</span>
      <span className="truncate">{value || "—"}</span>
    </div>
  );
}
