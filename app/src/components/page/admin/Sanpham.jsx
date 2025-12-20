import React, { useState, useEffect } from "react";
import Nagiveadmin from "./nagiveadmin";
import { useForm } from "react-hook-form";
import axios from "../../../utils/API/kho.js";
import APIADDSP from "../../../utils/API/sanpham.js";
import { toast } from "react-hot-toast";
import apiSp from "../../../utils/API/sanpham.js";
import SuaSanpham from "../../ui/SuaSanpham.jsx";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export default function Sanpham() {
  const [isAddSP, setIsAddSP] = useState(false);
  const [kho, setKho] = useState([]);
  const [urlSanpham, setUrlSanpham] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sanphamList, setSanphamList] = useState([]);
  const [editingSP, setEditingSP] = useState(null);
  const [giaBanInput, setGiaBanInput] = useState("");

  // ✅ Mutation xóa sản phẩm
  const feth_deleteSP = useMutation({
    mutationFn: async (id) => await APIADDSP.delete_sp(id),
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công!");
      fetchSanpham();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi xóa sản phẩm!");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  // 🔹 Lấy dữ liệu ban đầu
  useEffect(() => {
    const fetchKho = async () => {
      try {
        const res = await axios.xemthongtinkho();
        setKho(res.data.data);
      } catch (err) {
        console.log("Lỗi load kho:", err.response?.data || err.message);
      }
    };
    fetchKho();
    fetchSanpham();
  }, []);

  // 🔹 Load danh sách sản phẩm
  const fetchSanpham = async () => {
    try {
      const res = await apiSp.SP_ofshop();
      setSanphamList(res.data?.data || []);
    } catch (err) {
      console.log("Lỗi load sản phẩm:", err.response?.data || err.message);
      setSanphamList([]);
    }
  };

  // 🔹 Xử lý format giá bán khi nhập
  const handleGiaBanChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    setGiaBanInput(new Intl.NumberFormat("vi-VN").format(value));
    setValue("gia_ban", Number(value));
  };

  // 🔹 Thêm sản phẩm
const handelAddSP = async (data) => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("stock", data.stock);
    formData.append("category_id", data.category_id);
    formData.append("shop_id", 1); 

    if (urlSanpham) {
      formData.append("image", urlSanpham);
    }

    await APIADDSP.addSP(formData);

    toast.success("Thêm sản phẩm thành công!");
    fetchSanpham();
    setIsAddSP(false);
    reset();
    setGiaBanInput("");
    setUrlSanpham(null);
  } catch (err) {
    console.error("ADD SP ERROR:", err.response?.data);
    toast.error(err.response?.data?.msg || "Lỗi thêm sản phẩm!");
  } finally {
    setLoading(false);
  }
};

  // 🔹 Khi click "Sửa"
  const handleEditSP = (sp) => {
    setEditingSP(sp);
  };

  // 🔹 Khi click "Xóa"
  const handleDeleteSP = (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      feth_deleteSP.mutate(id);
    }
  };

  // 🔹 Format hiển thị giá tiền
  const formatTien = (number) => {
    if (!number && number !== 0) return "";
    return number.toLocaleString("vi-VN") + "₫";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nagiveadmin />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Danh sách sản phẩm
          </h1>
          <motion.button
            onClick={() => {
              setIsAddSP(true);
              reset();
              setUrlSanpham(null);
              setGiaBanInput("");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Thêm sản phẩm
          </motion.button>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sanphamList.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              Shop chưa có sản phẩm nào
            </div>
          ) : (
            sanphamList.map((sp) => (
            <motion.div
              key={sp.sanpham_id}
              className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {sp.image_url ? (
                  <img
                    src={`http://localhost:5000/images/${sp.image_url}`}
                    alt={sp.name}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <span className="text-gray-500">Ảnh sản phẩm</span>
                )}
              </div>
              <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                {sp.name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                {sp.mo_ta}
              </p>
              <p className="text-blue-600 font-bold text-lg mt-2">
                {formatTien(sp.price)}
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <motion.button
                  onClick={() => handleEditSP(sp)}
                  className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sửa
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteSP(sp.sanpham_id)}
                  className={`px-4 py-1.5 rounded-lg text-white font-medium ${
                    feth_deleteSP.isLoading
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } transition-colors duration-200`}
                  disabled={feth_deleteSP.isLoading}
                  whileHover={{ scale: feth_deleteSP.isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: feth_deleteSP.isLoading ? 1 : 0.95 }}
                >
                  {feth_deleteSP.isLoading ? "Đang xóa..." : "Xóa"}
                </motion.button>
              </div>
            </motion.div>
          )))}
        </div>
      </div>

      {/* Modal thêm sản phẩm */}
      <AnimatePresence>
        {isAddSP && (
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
                Thêm sản phẩm
              </h2>

              <div className="space-y-5">
                <div>
                  <motion.input
                    {...register("name", { required: true })}
                    type="text"
                    placeholder="Tên sản phẩm"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                    whileFocus={{ scale: 1.02 }}
                  />
                  {errors.ten_sanpham && (
                    <p className="text-red-500 text-sm mt-1">
                      Tên sản phẩm bắt buộc
                    </p>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Giá Bán"
                  {...register("price", { required: true })}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                  value={giaBanInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setGiaBanInput(new Intl.NumberFormat("vi-VN").format(raw));
                    setValue("price", Number(raw));
                  }}
                />

                <motion.textarea
                  {...register("mo_ta")}
                  placeholder="Mô tả"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 resize-none h-24"
                  whileFocus={{ scale: 1.02 }}
                />

                <div>
                  <motion.input
                    {...register("stock", { required: true, min: 0 })}
                    type="number"
                    placeholder="Số lượng tồn"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                    whileFocus={{ scale: 1.02 }}
                  />
                  {errors.so_luong_ton && (
                    <p className="text-red-500 text-sm mt-1">
                      Số lượng tồn bắt buộc và phải lớn hơn hoặc bằng 0
                    </p>
                  )}
                </div>

                <div>
                  <motion.select
                    {...register("category_id", { required: true })}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">Chọn loại sản phẩm</option>
                    <option value="1">Điện thoại</option>
                    <option value="2">Máy tính</option>
                    <option value="3">Phụ kiện</option>
                    <option value="3">Thời Trang</option>
                  </motion.select>
                  {errors.loai_sanpham && (
                    <p className="text-red-500 text-sm mt-1">
                      Loại sản phẩm bắt buộc
                    </p>
                  )}
                </div>

                <div>
                  <motion.input
                    {...register("nha_cung_cap", { required: true })}
                    type="text"
                    placeholder="Nhà cung cấp"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                    whileFocus={{ scale: 1.02 }}
                  />
                  {errors.nha_cung_cap && (
                    <p className="text-red-500 text-sm mt-1">
                      Nhà cung cấp bắt buộc
                    </p>
                  )}
                </div>

                <motion.input
                  type="file"
                  onChange={(e) => setUrlSanpham(e.target.files[0])}
                  className="w-full p-2.5 rounded-lg border border-gray-200 file:bg-blue-50 file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                />

                <div>
                  <motion.select
                    {...register("kho_id", { required: true })}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">Chọn kho</option>
                    {kho.map((item) => (
                      <option key={item.kho_id} value={item.kho_id}>
                        {item.ten_kho} - {item.dia_chi}
                      </option>
                    ))}

                  </motion.select>
                  {errors.kho_id && (
                    <p className="text-red-500 text-sm mt-1">Kho bắt buộc</p>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <motion.button
                    type="button"
                    className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => setIsAddSP(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                      loading
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } transition-colors duration-200`}
                    disabled={loading}
                    onClick={handleSubmit(handelAddSP)}
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                  >
                    {loading ? "Đang lưu..." : "Lưu"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Modal sửa sản phẩm */}
      <AnimatePresence>
        {editingSP && (
          <SuaSanpham
            sanpham={editingSP}
            onClose={() => setEditingSP(null)}
            onUpdated={fetchSanpham}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
