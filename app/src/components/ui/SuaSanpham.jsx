import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import apiSp from "../../utils/API/sanpham.js";

export default function SuaSanpham({ sanpham, onClose, onUpdated }) {
  console.log("sanpham cần sửa", sanpham);
  const { register, handleSubmit, setValue } = useForm();
  const [urlSanpham, setUrlSanpham] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalData] = useState(sanpham);

  useEffect(() => {
    if (sanpham) {
      Object.keys(sanpham).forEach((key) => {
        if (sanpham[key] !== null) setValue(key, sanpham[key]);
      });
    }
  }, [sanpham, setValue]);

  const handleSave = async (data) => {
    setLoading(true);
    try {
      const changed = {};
      for (const key in data) {
        if (data[key] !== originalData[key]) changed[key] = data[key];
      }
      if (urlSanpham) changed.url_sanpham = urlSanpham;

      if (Object.keys(changed).length === 0) {
        toast("Không có thay đổi nào!");
        setLoading(false);
        return;
      }

      console.log("🪶 Thay đổi:", changed);
      await apiSp.suaSP({ sanpham_id: sanpham.sanpham_id, ...changed });
      toast.success("Cập nhật thành công!");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 mx-4"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Sửa sản phẩm
          </h2>

          <div className="space-y-5">
            <motion.input
              {...register("ten_sanpham")}
              placeholder="Tên sản phẩm"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              {...register("gia_ban")}
              type="number"
              placeholder="Giá bán"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.textarea
              {...register("mo_ta")}
              placeholder="Mô tả"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 resize-none h-24"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.select
              {...register("loai_sanpham")}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">Chọn loại sản phẩm</option>
              <option value="dien_thoai">Điện thoại</option>
              <option value="may_tinh">Máy tính</option>
              <option value="phu_kien">Phụ kiện</option>
            </motion.select>
            <motion.input
              type="file"
              onChange={(e) => setUrlSanpham(e.target.files[0])}
              className="w-full p-2.5 rounded-lg border border-gray-200 file:bg-blue-50 file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
            />

            <div className="flex justify-end gap-4 mt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hủy
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                onClick={handleSubmit(handleSave)}
                className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } transition-colors duration-200`}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
