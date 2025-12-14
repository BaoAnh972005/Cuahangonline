import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import APIUser from "../../../utils/API/user.js";
import { useMutation } from "@tanstack/react-query";
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
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();
  const [dataProfile, setDataProfile] = useState(null);

  const fetchProfile = useMutation({
    mutationFn: APIUser.profile,
    onSuccess: (res) => setDataProfile(res.data.data),
    onError: (error) => {
      console.error("Error fetching profile:", error);
      toast.error("Lỗi khi tải thông tin cá nhân");
    },
  });

  useEffect(() => {
    fetchProfile.mutate();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("vi-VN");

  const calculateActiveDays = (created_at) => {
    const diffTime = new Date() - new Date(created_at);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4">
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Trở về
      </button>

      <AnimatePresence>
        {fetchProfile.isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-screen"
          >
            <p className="text-gray-600 text-xl font-semibold">
              Đang tải thông tin...
            </p>
          </motion.div>
        ) : !dataProfile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-screen flex-col"
          >
            <h1 className="text-xl font-semibold">Đang suy nghĩ .....</h1>
            <h2 className="text-gray-500 mb-4">AI đang hoạt động</h2>
            <div className="custom-loader"></div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header profile */}
            <div className="relative overflow-hidden rounded-3xl p-12 text-center bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 shadow-lg">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-block mb-6 relative"
              >
                {dataProfile.avatar_url ? (
                  <Avatar
                    size={160}
                    src={dataProfile.avatar_url}
                    className="border-4 border-white shadow-2xl rounded-full"
                  />
                ) : (
                  <Avatar
                    size={160}
                    icon={<UserOutlined />}
                    className="border-4 border-white shadow-2xl rounded-full"
                  />
                )}
              </motion.div>
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                {dataProfile.first_name} {dataProfile.last_name}
              </h1>
              <div className="inline-flex items-center px-6 py-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm border border-white mt-4">
                <span className="text-xl font-medium">
                  @{dataProfile.user_name || "user"}
                </span>
                <span className="mx-3 opacity-80">:</span>
                <span className="px-3 py-1 bg-white bg-opacity-30 text-xl rounded-full font-medium flex items-center gap-2">
                  <CrownOutlined /> {dataProfile.role}
                </span>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Thông tin tài khoản */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl shadow-xl p-8 bg-white/70 backdrop-blur-md"
                >
                  <h2 className="text-3xl font-bold mb-6 text-blue-600">
                    Thông Tin Tài Khoản
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <IdcardOutlined className="text-blue-500 text-xl" />
                        <span className="font-semibold">ID Người Dùng:</span>
                        <span className="font-mono bg-blue-50 p-2 rounded-lg border-l-4 border-blue-400">
                          {dataProfile.user_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserOutlined className="text-cyan-500 text-xl" />
                        <span className="font-semibold">Tên Đăng Nhập:</span>
                        <span className="p-2 bg-blue-50 rounded-lg border-l-4 border-cyan-400">
                          {dataProfile.user_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CrownOutlined className="text-green-500 text-xl" />
                        <span className="font-semibold">Vai Trò:</span>
                        <span className="p-2 rounded-lg border-l-4 border-green-400">
                          {dataProfile.role}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-blue-500 text-xl" />
                        <span className="font-semibold">Ngày Sinh:</span>
                        <span className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                          {formatDate(dataProfile.date_of_birth)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="font-semibold">Trạng Thái:</span>
                        <span className="p-2 rounded-lg border-l-4 border-green-400 inline-flex items-center">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-cyan-500 text-xl" />
                        <span className="font-semibold">Ngày Hoạt Động:</span>
                        <span className="p-2 bg-blue-50 rounded-lg border-l-4 border-cyan-400">
                          {calculateActiveDays(dataProfile.created_at)} ngày
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Liên hệ */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl shadow-xl p-8 bg-white/70 backdrop-blur-md"
                >
                  <h2 className="text-2xl font-bold mb-4 text-blue-600">
                    Liên Hệ
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                      <MailOutlined className="text-cyan-600 text-xl" />
                      <span className="font-semibold w-32">Email:</span>
                      <span>{dataProfile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-200">
                      <PhoneOutlined className="text-green-600 text-xl" />
                      <span className="font-semibold w-32">Điện thoại:</span>
                      <span>{dataProfile.phone}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Thống kê nhanh */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-2xl shadow-xl p-8 bg-white/70 backdrop-blur-md text-center"
                >
                  <h2 className="text-2xl font-bold mb-6 text-blue-600">
                    Thống Kê
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-blue-400 text-white rounded-xl shadow-lg flex flex-col items-center">
                      <div className="text-3xl font-bold">
                        {calculateActiveDays(dataProfile.created_at)}
                      </div>
                      <div className="text-sm opacity-90">Ngày hoạt động</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
