import React from "react";
import { useQuery } from "@tanstack/react-query";
import billAPI from "../../../utils/API/bill/bill";
import toast from "react-hot-toast";
import FeedBack from "./FeedBack";
import { motion } from "framer-motion";
import {
  FaPrint,
  FaArrowLeft,
  FaFileInvoiceDollar,
  FaUser,
  FaMapMarkedAlt,
  FaBoxOpen,
  FaCalendarAlt,
  FaTags,
  FaCreditCard,
  FaStickyNote,
} from "react-icons/fa";

// --- Component hiển thị trạng thái với màu sắc động ---
const StatusBadge = ({ status }) => {
  const statusColors = {
    "Đang xử lý": "bg-yellow-100 text-yellow-800",
    "Đã xác nhận": "bg-blue-100 text-blue-800",
    "Đang giao": "bg-indigo-100 text-indigo-800",
    "đã giao": "bg-green-100 text-green-800",
    "Hoàn thành": "bg-green-100 text-green-800",
    "Đã hủy": "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

export default function BillDetail({ hoadon_id }) {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["billDetail", hoadon_id],
    queryFn: () => billAPI.getBillDetail(hoadon_id),
    enabled: !!hoadon_id,
    onSuccess: (res) => {
      if (res.data?.status !== "success") {
        toast.error("Không tìm thấy chi tiết hóa đơn");
      }
    },
    onError: () => toast.error("Lỗi khi tải chi tiết hóa đơn"),
  });

  const billData = response?.data?.data;

  const formatVND = (v) =>
    v?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0 ₫";
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  if (isLoading)
    return (
      <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
    );

  if (isError || !billData)
    return (
      <p className="p-6 text-center text-gray-500">Không có dữ liệu hóa đơn.</p>
    );

  const { hoadon, sanpham } = billData;
  const { khachhang, dia_chi } = hoadon;
  const tongThanhToan = hoadon.tong_tien - (hoadon.giam_gia_tong_hd || 0);

  return (
    <motion.div
      className="bg-gray-50 min-h-screen py-12 font-['Roboto']"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto max-w-4xl px-4 space-y-8">
        {/* Header */}
        <motion.header className="text-center" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-gray-800">
            Chi Tiết Đơn Hàng
          </h1>
          <p className="text-gray-500 text-base mt-2">
            Mã đơn hàng:{" "}
            <span className="font-semibold text-blue-600">
              {hoadon.hoadon_id}
            </span>
          </p>
        </motion.header>

        {/* Tổng quan đơn hàng */}
        <motion.section
          className="bg-white rounded-xl shadow-lg p-8"
          variants={itemVariants}
        >
          <h2 className="flex items-center text-2xl font-semibold text-blue-600 mb-6">
            <FaFileInvoiceDollar className="mr-3" /> Tổng Quan Đơn Hàng
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 flex items-center">
                <FaCalendarAlt className="mr-2" />
                Ngày lập:
              </p>
              <p className="font-medium">{formatDate(hoadon.ngay_lap)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 flex items-center">
                <FaTags className="mr-2" />
                Trạng thái:
              </p>
              <StatusBadge status={hoadon.trang_thai} />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 flex items-center">
                <FaCreditCard className="mr-2" />
                Phương thức thanh toán:
              </p>
              <p className="font-medium">
                {hoadon.hinh_thuc_thanh_toan.toUpperCase()}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-gray-600 flex items-center">
                <FaStickyNote className="mr-2" />
                Ghi chú:
              </p>
              <p className="font-medium text-right italic">
                {hoadon.ghi_chu || "Không có"}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Thông tin khách hàng */}
        <motion.section
          className="bg-white rounded-xl shadow-lg p-8"
          variants={itemVariants}
        >
          <h2 className="flex items-center text-2xl font-semibold text-blue-600 mb-6">
            <FaUser className="mr-3" /> Thông Tin Khách Hàng
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Tên khách hàng:</p>
              <p className="font-medium">{khachhang.ten_khachhang}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Số điện thoại:</p>
              <p className="font-medium">{khachhang.so_dien_thoai}</p>
            </div>
          </div>
        </motion.section>

        {/* Địa chỉ giao hàng */}
        <motion.section
          className="bg-white rounded-xl shadow-lg p-8"
          variants={itemVariants}
        >
          <h2 className="flex items-center text-2xl font-semibold text-blue-600 mb-6">
            <FaMapMarkedAlt className="mr-3" /> Địa Chỉ Giao Hàng
          </h2>
          <p className="text-gray-700 leading-relaxed">{`${dia_chi.dia_chi}, ${dia_chi.ward}, ${dia_chi.district}, ${dia_chi.province}`}</p>
          {dia_chi.mo_ta_dia_chi && (
            <p className="text-sm text-gray-500 mt-2 italic">
              "{dia_chi.mo_ta_dia_chi}"
            </p>
          )}
        </motion.section>

        {/* Danh sách sản phẩm */}
        <motion.section
          className="bg-white rounded-xl shadow-lg p-8"
          variants={itemVariants}
        >
          <h2 className="flex items-center text-2xl font-semibold text-blue-600 mb-6">
            <FaBoxOpen className="mr-3" /> Sản Phẩm
          </h2>
          <div className="space-y-8">
            {sanpham.map((sp) => (
              <div key={sp.cthd_id}>
                <div className="flex items-start gap-5 border-b border-gray-200 pb-6">
                  <img
                    src={sp.url_sanpham}
                    alt={sp.ten_sanpham}
                    className="w-24 h-24 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {sp.ten_sanpham}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Loại: {sp.loai}
                    </p>
                    <div className="flex justify-between items-end mt-3">
                      <p className="text-gray-600">
                        SL: <span className="font-bold">{sp.so_luong}</span> x{" "}
                        {formatVND(sp.gia_ban)}
                      </p>
                      <p className="font-bold text-lg text-blue-600">
                        {formatVND(sp.thanh_tien)}
                      </p>
                    </div>
                  </div>
                </div>
                {hoadon.trang_thai === "đã giao" ? (
                  <div className="mt-4">
                    <FeedBack
                      sanpham_id={sp.sanpham_id}
                      hoadon_id={hoadon_id}
                    />
                  </div>
                ) : (
                  <div className="mt-4 text-gray-400 italic text-sm">
                    Chỉ có thể đánh giá sau khi đơn hàng đã được giao.
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 border-t-2 border-dashed border-gray-200 pt-6 text-right space-y-2">
            <div className="flex justify-between text-lg">
              <p className="text-gray-600">Tổng tiền hàng:</p>
              <p className="font-medium">{formatVND(hoadon.tong_tien)}</p>
            </div>
            <div className="flex justify-between text-lg">
              <p className="text-gray-600">Giảm giá:</p>
              <p className="font-medium">
                {formatVND(hoadon.giam_gia_tong_hd)}
              </p>
            </div>
            <div className="flex justify-between text-xl font-bold text-blue-700">
              <p>Tổng thanh toán:</p>
              <p>{formatVND(tongThanhToan)}</p>
            </div>
          </div>
        </motion.section>

        {/* Nút hành động */}
        <motion.div
          className="flex justify-center gap-4 pt-4"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPrint /> In Hóa Đơn
          </motion.button>
          <motion.button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Quay Lại
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
