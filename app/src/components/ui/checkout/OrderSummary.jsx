import React from "react";
import { motion } from "framer-motion";

const OrderSummary = ({
  summary,
  formatCurrency,
  perShopTotals = [],
  isPending,
}) => {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 border border-blue-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-5">
        Tóm tắt đơn hàng
      </h2>

      {/* Hiển thị breakdown theo shop */}
      {perShopTotals.length > 0 && (
        <div className="space-y-4 mb-4">
          {perShopTotals.map((p) => (
            <motion.div
              key={p.shopId}
              className="p-3 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-base font-semibold text-blue-800 mb-2 border-b border-blue-100 pb-1">
                {p.ten_shop}
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(p.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(p.shipping)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 my-4"></div>

      <div className="flex justify-between text-gray-700 mb-2 text-sm">
        <span>Tạm tính</span>
        <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
      </div>
      <div className="flex justify-between text-gray-700 mb-2 text-sm">
        <span>Phí vận chuyển</span>
        <span className="font-medium">{formatCurrency(summary.shipping)}</span>
      </div>
      <div className="flex justify-between text-gray-700 mb-4 text-sm">
        <span>Giảm giá</span>
        <span className="font-medium">0 ₫</span>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
        <motion.span
          className="text-2xl font-bold text-blue-600"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatCurrency(summary.total)}
        </motion.span>
      </div>

      <motion.button
        type="submit"
        disabled={isPending}
        whileHover={{ scale: isPending ? 1 : 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md ${
          isPending
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        }`}
      >
        {isPending ? "Đang xử lý..." : "Đặt hàng"}
      </motion.button>
    </motion.div>
  );
};

export default OrderSummary;
