import React, { useEffect, useState, useMemo } from "react";
import NagiveAdmin from "../nagiveadmin";
import apibill from "../../../../utils/API/bill/bill.js";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import BillDetail from "./BillDetail.jsx";

const statusLabels = {
  "chờ xử lý": "Chờ xác nhận",
  "đang xử lý": "Đang xử lý",
  "đang vận chuyển": "Đang vận chuyển",
  "đã giao": "Đã giao",
  "đã hủy": "Đã hủy",
  "trả hàng/hoàn tiền": "Trả hàng/Hoàn tiền",
};

const statusColors = {
  "chờ xử lý": "bg-yellow-100 text-yellow-800",
  "đang xử lý": "bg-blue-100 text-blue-800",
  "đang vận chuyển": "bg-orange-100 text-orange-800",
  "đã giao": "bg-green-100 text-green-800",
  "đã hủy": "bg-red-100 text-red-800",
  "trả hàng/hoàn tiền": "bg-purple-100 text-purple-800",
};

const statusFlowAdmin = ["chờ xử lý", "đang xử lý", "đang vận chuyển"];
const statusFlow = ["chờ xử lý", "đang xử lý", "đang vận chuyển", "đã giao"];

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("tất cả");
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await apibill.getallbillshop();
      setBills(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const updatebill = useMutation({
    mutationFn: ({ hoadon_id, trang_thai }) =>
      apibill.updatebill({ hoadon_id, trang_thai }),
    onSuccess: (data, variables) => {
      toast.success("Cập nhật trạng thái thành công");
      setBills((prevBills) =>
        prevBills.map((b) =>
          b.hoadon_id === variables.hoadon_id
            ? { ...b, trang_thai: variables.trang_thai }
            : b
        )
      );
      setUpdatingId(null);
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại sau!"),
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const handleStatusChange = (hoadon_id, currentStatus, trang_thai) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    const newIndex = statusFlow.indexOf(trang_thai);
    if (newIndex <= currentIndex) return;
    setUpdatingId(hoadon_id);
    updatebill.mutate(
      { hoadon_id, trang_thai },
      { onSettled: () => setUpdatingId(null) }
    );
  };

  const filteredBills = useMemo(() => {
    return bills
      .filter((b) =>
        filterStatus === "tất cả" ? true : b.trang_thai === filterStatus
      )
      .filter(
        (b) =>
          b.hoadon_id.toLowerCase().includes(search.toLowerCase()) ||
          b.khachhang_id.toLowerCase().includes(search.toLowerCase())
      );
  }, [bills, filterStatus, search]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NagiveAdmin />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Quản lý hóa đơn
        </h1>

        {/* Bộ lọc và tìm kiếm */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={() => setFilterStatus("tất cả")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === "tất cả"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors duration-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tất cả
            </motion.button>
            {Object.keys(statusLabels).map((status) => (
              <motion.button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === status
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition-colors duration-200`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {statusLabels[status]}
              </motion.button>
            ))}
          </div>

          <motion.input
            type="text"
            placeholder="Tìm theo hóa đơn hoặc khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 w-full sm:w-64"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        {/* Bảng hóa đơn */}
        {loading ? (
          <div className="text-center text-gray-600 py-8">
            Đang tải hóa đơn...
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center text-gray-600 py-8">Không có hóa đơn</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Hóa đơn ID
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Khách hàng
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Ngày lập
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Tổng tiền
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Thanh toán
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Trạng thái
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Ghi chú
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <motion.tr
                    key={bill.hoadon_id}
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="border p-3">{bill.hoadon_id}</td>
                    <td className="border p-3">{bill.khachhang_id}</td>
                    <td className="border p-3">
                      {new Date(bill.ngay_lap).toLocaleString()}
                    </td>
                    <td className="border p-3">
                      {bill.tong_tien.toLocaleString()} đ
                    </td>
                    <td className="border p-3">{bill.hinh_thuc_thanh_toan}</td>
                    <td className="border p-3">
                      <motion.select
                        disabled={
                          updatingId === bill.hoadon_id ||
                          !statusFlowAdmin.includes(bill.trang_thai) ||
                          bill.trang_thai === "đã giao"
                        }
                        value={bill.trang_thai}
                        onChange={(e) =>
                          handleStatusChange(
                            bill.hoadon_id,
                            bill.trang_thai,
                            e.target.value
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg font-semibold text-sm cursor-pointer ${statusColors[bill.trang_thai]} focus:ring-2 focus:ring-blue-500 outline-none`}
                      >
                        <option value={bill.trang_thai} disabled>
                          {statusLabels[bill.trang_thai]}
                        </option>
                        {statusFlowAdmin
                          .filter(
                            (status) =>
                              statusFlowAdmin.indexOf(status) >
                              statusFlowAdmin.indexOf(bill.trang_thai)
                          )
                          .map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status]}
                            </option>
                          ))}
                      </motion.select>
                    </td>
                    <td className="border p-3">{bill.ghi_chu || "-"}</td>
                    <td className="border p-3 text-center">
                      <motion.button
                        onClick={() => setSelectedBill(bill)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Xem
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Modal chi tiết hóa đơn (đã tích hợp BillDetail.jsx) */}
        <AnimatePresence>
          {selectedBill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <BillDetail
                hoadon_id={selectedBill.hoadon_id}
                onClose={() => setSelectedBill(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
