import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  StarFilled,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { FaStore } from "react-icons/fa";

import apishop from "../../utils/API/shop.js";
import apiFeedback from "../../utils/API/bill/feedback.js";
import Navigate from "../layout/nagigate";

// --- COMPONENT KHUNG XƯƠNG (SKELETON) ---
const ShopPageSkeleton = () => (
  <div className="p-4 md:p-8 animate-pulse">
    {/* ... Skeleton thông tin shop (không đổi) ... */}
    <div className="mb-6 p-6 bg-white rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6">
      <div className="w-40 h-40 bg-gray-200 rounded-xl"></div>
      <div className="flex-1">
        <div className="h-9 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
      </div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col"
        >
          {/* SKELETON: Đổi sang tỉ lệ 2:1 (padding 50%) */}
          <div className="relative w-full pb-[50%] bg-gray-200"></div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="mt-auto h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- COMPONENT CHÍNH ---
export default function PageShop() {
  const { id } = useParams();
  const shop_id = id;
  const navigate = useNavigate();

  // ... (useQuery hooks không đổi) ...
  const { data: shopData, isLoading: isLoadingShop } = useQuery({
    queryKey: ["shopDetails", shop_id],
    queryFn: () => apishop.pageshop(shop_id),
    enabled: !!shop_id,
    onError: (error) => {
      console.error("❌ Lỗi khi lấy dữ liệu shop:", error);
      toast.error("Không thể tải dữ liệu shop.");
      navigate("/");
    },
  });

  const { data: ratingData, isLoading: isLoadingRating } = useQuery({
    queryKey: ["shopRating", shop_id],
    queryFn: () => apiFeedback.feedback_ofshop(shop_id),
    enabled: !!shop_id,
    onError: () => toast.error("Lỗi khi tải đánh giá của shop"),
  });

  const dataShop =
    shopData?.data?.status === "success" ? shopData.data.shop : null;
  const dataSP =
    shopData?.data?.status === "success" ? shopData.data.products : [];

  const shopRating =
    ratingData?.data?.status === "success" && ratingData.data.data.length > 0
      ? ratingData.data.data[0].rating_trung_binh_shop
      : null;

  // HÀM RENDER SAO (Đã dùng inline style cho màu vàng)
  const renderStars = (rating) => {
    const roundedRating = Math.round(Number(rating));
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarFilled
            key={i}
            className="mr-1 text-lg"
            // *** THAY ĐỔI MÀU VÀNG Ở ĐÂY ***
            style={{
              color: i < roundedRating ? "#FACC15" : "#D1D5DB", // FACC15 là màu vàng-400, D1D5DB là gray-300
            }}
          />
        ))}
      </div>
    );
  };

  if (isLoadingShop || isLoadingRating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navigate />
        <ShopPageSkeleton />
      </div>
    );
  }

  if (!dataShop) {
    return <Navigate />;
  }

  // ... (Variants không đổi) ...
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const productCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <Navigate />

      {/* ... (Thông tin shop không đổi) ... */}
      <motion.div
        className="mb-8 p-6 bg-gradient-to-r from-blue-300 to-blue-500 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-6 text-white"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <img
          src={dataShop.url_shop}
          alt={dataShop.ten_shop}
          className="w-40 h-40 object-cover rounded-xl shadow-md border-4 border-blue-300"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl font-extrabold mb-2 flex items-center justify-center md:justify-start gap-3">
            <FaStore /> {dataShop.ten_shop}
          </h2>
          <p className="text-blue-100 mb-3 text-lg">{dataShop.mo_ta}</p>
          <p className="flex items-center text-blue-200 mb-3 justify-center md:justify-start">
            <EnvironmentOutlined className="mr-2" /> {dataShop.dia_chi_shop}
          </p>
          <div className="flex items-center justify-center md:justify-start mb-2 gap-2">
            {shopRating !== null && shopRating > 0 && renderStars(shopRating)}
            <span className="ml-2 text-blue-100">
              ({dataSP.reduce((acc, p) => acc + Number(p.tong_luot_ban), 0)}{" "}
              lượt bán)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Danh sách sản phẩm */}
      <h3 className="text-3xl font-bold mb-5 text-blue-800">Tất cả sản phẩm</h3>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {dataSP.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Đang tải sản phẩm...
          </div>
        ) : (
          dataSP.map((sp) => (
            <motion.div
              key={sp.sanpham_id}
              className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Ảnh sản phẩm 2:1 responsive */}
              <div className="relative w-full aspect-[2/1] bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-200">
                <img
                  src={sp.url_sanpham}
                  alt={sp.ten_sanpham}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {sp.giam_gia_SP && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    -{sp.giam_Gia_SP}%
                  </span>
                )}
                <motion.div
                  whileHover={{ scale: 1.25, color: "#ef4444" }}
                  className="absolute top-2 right-2 text-white text-2xl cursor-pointer p-1 z-10"
                >
                  <HeartOutlined />
                </motion.div>
              </div>

              {/* Tên sản phẩm */}
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                {sp.ten_sanpham}
              </h3>

              {/* Giá sản phẩm */}
              <p className="text-lg font-bold text-blue-600 mb-3">
                {sp.gia_ban.toLocaleString()}₫
              </p>

              {/* Nút mua ngay */}
              <button
                onClick={() => navigate(`/product/${sp.sanpham_id}`)}
                className="mt-auto w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Mua ngay
              </button>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
