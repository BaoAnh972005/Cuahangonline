import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NagiveAdmin from "./admin/nagiveadmin";
import { useMutation } from "@tanstack/react-query";
import apiThongke from "../../utils/API/dashborad/thongke";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [dtDay, setDtDay] = useState("");
  const [dtthang, setDtthang] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // === LẤY DOANH THU NGÀY ===
  const fethdoanhthu = useMutation({
    mutationFn: (data) => apiThongke.doanhthu(data),
    onSuccess: (res) => setDtDay(res.data.data),
    onError: (err) => console.error("Lỗi khi lấy doanh thu ngày:", err),
  });

  // === LẤY DOANH THU THÁNG ===
  const fethdoanhthuthang = useMutation({
    mutationFn: (data) => apiThongke.doanhthuthang(data),
    onMutate: () => setIsLoading(true),
    onSuccess: (res) => {
      const result = [];
      const start = new Date(startDate || new Date());
      const end = new Date(endDate || new Date());

      // Tạo danh sách các tháng trong khoảng thời gian
      const months = [];
      let d = new Date(start);
      while (d <= end) {
        months.push(d.toISOString().slice(0, 7));
        d.setMonth(d.getMonth() + 1);
      }

      // Xử lý dữ liệu trả về từ API
      months.forEach((month) => {
        const found = res.data.data.find((x) => x.thang === month);
        result.push({
          thang: month,
          tong_doanh_thu: found ? Number(found.tong_doanh_thu) : 0,
          tong_don_hang: found ? Number(found.tong_don_hang) : 0,
        });
      });
      setDtthang(result);
      setIsLoading(false);
    },
    onError: (err) => {
      console.error("Lỗi khi lấy doanh thu tháng:", err);
      setIsLoading(false);
    },
  });

  // === LOAD MẶC ĐỊNH ===
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fethdoanhthu.mutate({ startDate: today, endDate: today });
    fethdoanhthuthang.mutate({}); // Load mặc định cho 3 tháng gần nhất
  }, []);

  const COLORS = ["#6366F1", "#10B981", "#F59E0B"];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        <NagiveAdmin />

        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex-1 p-6 lg:p-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Dashboard / Home
            </h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 w-full sm:w-64"
              />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-indigo-100 rounded-full text-indigo-600 shadow-sm"
              >
                🔔
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-indigo-100 rounded-full text-indigo-600 shadow-sm"
              >
                ⚙️
              </motion.button>
            </div>
          </div>

          {/* Stats cards */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                title: "Doanh thu hôm nay",
                value: `${dtDay?.tong_doanh_thu?.toLocaleString() || 0} VND`,
              },
              { title: "Số đơn hàng", value: dtDay?.tong_don_hang || 0 },
              { title: "Khách hàng mới", value: "3,462" },
              { title: "Doanh số", value: "$103,430" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <p className="text-sm text-gray-600 font-medium">
                  {item.title}
                </p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                  {item.value}
                </h3>
              </motion.div>
            ))}
          </motion.div>

          {/* Date Selector */}
          <motion.div
            variants={cardVariants}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto mb-10"
          >
            <h3 className="text-xl font-bold text-indigo-600 mb-6 text-center">
              📅 Chọn khoảng thời gian
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Ngày bắt đầu */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                />
              </div>

              {/* Ngày kết thúc */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                />
              </div>

              {/* Nút xác nhận */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!startDate || !endDate)
                    return alert("Vui lòng chọn đủ ngày bắt đầu và kết thúc!");
                  if (new Date(startDate) > new Date(endDate))
                    return alert(
                      "Ngày bắt đầu không được lớn hơn ngày kết thúc!"
                    );
                  fethdoanhthuthang.mutate({ startDate, endDate });
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-medium w-full"
              >
                Xác nhận
              </motion.button>

              {/* Nút reset */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setStartDate("");
                  setEndDate("");
                  fethdoanhthu.mutate({ startDate: today, endDate: today });
                  fethdoanhthuthang.mutate({});
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300 font-medium w-full"
              >
                Reset
              </motion.button>
            </div>
          </motion.div>

          {/* Charts */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
          >
            {/* Hàng 1: BarChart Doanh thu + PieChart Đơn hàng */}
            {/* Cột: Doanh thu theo tháng */}
            <motion.div
              variants={cardVariants}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h4 className="font-bold text-lg text-gray-800">
                Doanh thu theo tháng
              </h4>
              <div className="h-64 relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dtthang}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="thang" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toLocaleString()} VND`,
                          "Doanh thu",
                        ]}
                      />
                      <Bar
                        dataKey="tong_doanh_thu"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Tròn: Tỷ lệ đơn hàng theo tháng */}
            <motion.div
              variants={cardVariants}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h4 className="font-bold text-lg text-gray-800">
                Tỷ lệ đơn hàng theo tháng
              </h4>
              <div className="h-64 relative flex justify-center">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dtthang}
                        dataKey="tong_don_hang"
                        nameKey="thang"
                        outerRadius={100}
                        label
                      >
                        {dtthang.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} đơn hàng`, "Tháng"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Hàng 2: AreaChart Doanh thu + AreaChart Đơn hàng */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Miền: Xu hướng doanh thu theo tháng */}
            <motion.div
              variants={cardVariants}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h4 className="font-bold text-lg text-gray-800">
                Xu hướng doanh thu theo tháng
              </h4>
              <div className="h-64 relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dtthang}>
                      <defs>
                        <linearGradient
                          id="colorDoanhthu"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366F1"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366F1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="thang" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toLocaleString()} VND`,
                          "Doanh thu",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="tong_doanh_thu"
                        stroke="#6366F1"
                        fill="url(#colorDoanhthu)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Miền: Xu hướng đơn hàng theo tháng */}
            <motion.div
              variants={cardVariants}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <h4 className="font-bold text-lg text-gray-800">
                Xu hướng đơn hàng theo tháng
              </h4>
              <div className="h-64 relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dtthang}>
                      <defs>
                        <linearGradient
                          id="colorDonHang"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F59E0B"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F59E0B"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="thang" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value) => [`${value} đơn hàng`, "Số lượng"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="tong_don_hang"
                        stroke="#F59E0B"
                        fill="url(#colorDonHang)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
