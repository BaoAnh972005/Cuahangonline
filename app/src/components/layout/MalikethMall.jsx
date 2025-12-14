import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api_SP from "../../utils/API/sanpham.js";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function MalikethMall() {
  const [SP4, setSP4] = useState([]);
  const [bestseller4, setbestseller4] = useState([]);
  const [random20, setRandom20] = useState([]);

  // API: Danh sách sản phẩm giảm giá
  const { mutate: xem_SP } = useMutation({
    mutationFn: () => api_SP.SP_client(),
    onSuccess: (res) => {
      setSP4(res.data.data);
      console.log("Dữ liệu sản phẩm giảm giá:", res.data.data);
    },
    onError: (error) => console.error("❌ Lỗi khi gọi API SP_client:", error),
  });

  // API: Sản phẩm gợi ý ngẫu nhiên
  const handelrandom20 = useMutation({
    mutationFn: () => api_SP.random20(),
    onSuccess: (res) => setRandom20(res.data.data),
    onError: (error) => console.error("❌ Lỗi khi gọi API random20:", error),
  });

  // API: Sản phẩm bán chạy
  const { mutate: bestseller } = useMutation({
    mutationFn: () => api_SP.bestseller(),
    onSuccess: (res) => setbestseller4(res.data.data),
    onError: (error) => console.error("❌ Lỗi khi gọi API bestseller:", error),
  });

  // Gọi API khi component mount
  useEffect(() => {
    xem_SP();
    bestseller();
    handelrandom20.mutate();
  }, []);

  // Hàm định dạng tiền tệ VND
  const formatVND = (value) =>
    value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
    "0 ₫";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* --- Phần giới thiệu chính --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-7xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Maliketh MALL</h2>
        <p className="text-gray-600 text-lg mb-6 max-w-2xl">
          Nơi mua sắm trực tuyến với những ưu đãi hấp dẫn. Khám phá ngay các sản
          phẩm mới nhất và độc đáo!
        </p>
        <motion.button
          className="bg-blue-600 text-white py-2.5 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Khám phá ngay
        </motion.button>
      </motion.div>

      {/* --- Danh sách sản phẩm giảm giá --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-red-600 mb-6">
          🔥 Sản phẩm giảm giá
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SP4.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Đang tải sản phẩm...
            </div>
          ) : (
            SP4.map((item) => (
              <motion.div
                key={item.sanpham_id}
                className="bg-gray-50 rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative h-48 bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                  <img
                    src={item.url_sanpham}
                    alt={item.ten_sanpham}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    Giảm giá
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                  {item.ten_sanpham}
                </h3>
                <p className="text-sm line-through text-gray-400 mb-1">
                  {formatVND(item.gia_ban * 1.2)}
                </p>
                <p className="text-lg font-bold text-red-600">
                  {formatVND(item.gia_ban)}
                </p>
                <Link
                  to={`/product/${item.sanpham_id}`}
                  className="mt-3 block w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 text-center"
                >
                  Mua ngay
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* --- Sản phẩm bán chạy --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          🏆 Sản phẩm bán chạy hàng đầu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestseller4.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Đang tải sản phẩm...
            </div>
          ) : (
            bestseller4.map((item) => (
              <motion.div
                key={item.sanpham_id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-100"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative h-48 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4">
                  <img
                    src={item.url_sanpham}
                    alt={item.ten_sanpham}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    HOT 🔥
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                  {item.ten_sanpham}
                </h3>
                <p className="text-lg font-bold text-orange-600">
                  {formatVND(item.gia_ban)}
                </p>
                <Link
                  to={`/product/${item.sanpham_id}`}
                  className="mt-3 block w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 text-center"
                >
                  Mua ngay
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* --- Sản phẩm gợi ý --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          ❤️ Sản phẩm gợi ý cho bạn
        </h2>
        <p className="text-gray-600 text-lg mb-6 max-w-2xl">
          Không biết mua gì? Hãy thử xem những gợi ý dưới đây nhé!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {random20.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Đang tải sản phẩm...
            </div>
          ) : (
            random20.map((item) => (
              <motion.div
                key={item.sanpham_id}
                className="bg-gray-50 rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative h-48 bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                  <img
                    src={item.url_sanpham}
                    alt={item.ten_sanpham}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    Gợi ý
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                  {item.ten_sanpham}
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  {formatVND(item.gia_ban)}
                </p>
                <Link
                  to={`/product/${item.sanpham_id}`}
                  className="mt-3 block w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 text-center"
                >
                  Mua ngay
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
