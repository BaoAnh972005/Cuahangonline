import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import apibill from "../../../../utils/API/bill/bill.js";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function BillDetail({ hoadon_id, onClose }) {
  const fetchBillDetail = useMutation({
    mutationFn: (hoadon_id) => apibill.getBillDetail(hoadon_id),
    onSuccess: (data) => {
      console.log("Chi tiết hóa đơn:", data);
    },
    onError: () => {
      toast.error("Không thể tải chi tiết hóa đơn!");
    },
  });

  useEffect(() => {
    if (hoadon_id) {
      fetchBillDetail.mutate(hoadon_id);
    }
  }, [hoadon_id]);

  const billData = fetchBillDetail.data?.data?.data;

  if (fetchBillDetail.isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="flex items-center gap-2 text-gray-600 text-lg"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Đang tải chi tiết hóa đơn...
        </motion.div>
      </div>
    );
  }

  if (!billData) return null;

  const { hoadon, sanpham } = billData;

  const statusColors = {
    "chờ xử lý": "bg-yellow-100 text-yellow-800",
    "đang xử lý": "bg-blue-100 text-blue-800",
    "đang vận chuyển": "bg-orange-100 text-orange-800",
    "đã giao": "bg-green-100 text-green-800",
    "đã hủy": "bg-red-100 text-red-800",
    "trả hàng/hoàn tiền": "bg-purple-100 text-purple-800",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Nút đóng */}
          <motion.button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl font-medium"
            onClick={onClose}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>

          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Chi tiết hóa đơn
          </h2>

          {/* Thông tin hóa đơn */}
          <div className="space-y-5 mb-8 bg-gray-50 p-6 rounded-lg">
            <p className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Mã hóa đơn:</span>
              <span className="text-gray-800">{hoadon.hoadon_id}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Ngày lập:</span>
              <span className="text-gray-800">
                {new Date(hoadon.ngay_lap).toLocaleString("vi-VN")}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Trạng thái:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[hoadon.trang_thai] || "bg-gray-100 text-gray-800"
                }`}
              >
                {hoadon.trang_thai}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">
                Hình thức thanh toán:
              </span>
              <span className="text-gray-800">
                {hoadon.hinh_thuc_thanh_toan}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Tổng tiền:</span>
              <span className="text-gray-800 font-semibold">
                {hoadon.tong_tien.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </p>
            {hoadon.ghi_chu && (
              <p className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Ghi chú:</span>
                <span className="text-gray-800">{hoadon.ghi_chu}</span>
              </p>
            )}
          </div>

          {/* Thông tin khách hàng */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Khách hàng
            </h3>
            <div className="space-y-3 bg-gray-50 p-6 rounded-lg">
              <p className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Tên:</span>
                <span className="text-gray-800">
                  {hoadon.khachhang?.ten_khachhang || "Không có"}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">
                  Số điện thoại:
                </span>
                <span className="text-gray-800">
                  {hoadon.khachhang?.so_dien_thoai || "Không có"}
                </span>
              </p>
            </div>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Địa chỉ giao hàng
            </h3>
            <div className="space-y-3 bg-gray-50 p-6 rounded-lg">
              <p className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Địa chỉ:</span>
                <span className="text-gray-800">
                  {hoadon.dia_chi
                    ? `${hoadon.dia_chi.dia_chi}, ${hoadon.dia_chi.ward}, ${hoadon.dia_chi.district}, ${hoadon.dia_chi.province}`
                    : "Không có"}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Mô tả:</span>
                <span className="text-gray-800">
                  {hoadon.dia_chi?.mo_ta_dia_chi || "Không có"}
                </span>
              </p>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Sản phẩm
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm md:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Sản phẩm
                    </th>
                    <th className="border border-gray-200 p-3 text-center font-semibold">
                      Giá
                    </th>
                    <th className="border border-gray-200 p-3 text-center font-semibold">
                      Số lượng
                    </th>
                    <th className="border border-gray-200 p-3 text-center font-semibold">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sanpham.map((sp) => (
                    <motion.tr
                      key={sp.cthd_id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="border border-gray-200 p-3 flex items-center gap-4">
                        <motion.img
                          src={sp.url_sanpham}
                          alt={sp.ten_sanpham}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                          whileHover={{ scale: 1.05 }}
                        />
                        <span className="line-clamp-2 font-medium">
                          {sp.ten_sanpham}
                        </span>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        {sp.gia_ban.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        {sp.so_luong}
                      </td>
                      <td className="border border-gray-200 p-3 text-center font-semibold text-green-600">
                        {sp.thanh_tien.toLocaleString("vi-VN")} đ
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
