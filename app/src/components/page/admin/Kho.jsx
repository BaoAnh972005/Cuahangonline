import React, { useEffect, useState } from "react";
import KhoAPI from "../../../utils/API/kho.js";
import NagiveAdmin from "./nagiveadmin";
import axios from "../../../utils/API/sanpham.js";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Kho() {
  const [sanpham, setSanpham] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [is_addkho, setIsAddKho] = useState(false);
  const [is_chonkho, setIsChonKho] = useState(false);
  const [select_kho, setSelectKho] = useState("");
  const [thongtinkho, setThongTinKho] = useState([]);
  const [soluongNhap, setSoluongNhap] = useState({});
  const [nha_cung_cap, setnha_cung_cap] = useState("");
  const [isnewkho, setisnewkho] = useState(false);
  const [search, setSearch] = useState("");
  const [khoList, setKhoList] = useState([]);
  const [selectedKho, setSelectedKho] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  // Hàm load danh sách kho
  const fetchThongTinKho = async () => {
    try {
      const res = await KhoAPI.xemthongtinkho();
      setThongTinKho(res.data.data);
    } catch (err) {
      console.error("❌ Lỗi load kho:", err);
    }
  };

  // Mutation thêm kho mới
  const mutationNewKho = useMutation({
    mutationFn: (data) => KhoAPI.newkho(data),
    onSuccess: async () => {
      toast.success("Thêm kho mới thành công ✅");

      await fetchThongTinKho(); // 🔥 LOAD LẠI KHO NGAY

      setisnewkho(false);
      reset();
    },
    onError: (error) => {
      console.error("❌ Lỗi ", error);
      toast.error("Lỗi thêm kho, vui lòng thử lại sau");
    },
  });

  const { mutate: newkho, isLoading: isloadingkho } = mutationNewKho;

  // Submit form thêm kho
  const onSubmit = (data) => {
    newkho(data);
  };

  const handleOpenNhapKho = () => {
    setIsAddKho(true);
    xemkho();
  };

  const handleChonKho = (item) => {
    setSelectKho(item.kho_id);
    setIsChonKho(true);
  };

  const handlenewkho = () => {
    setisnewkho(true);
  };

  // Lọc dữ liệu sản phẩm
  const filteredSP = Array.isArray(sanpham)
  ? sanpham.filter((item) => {
      const matchName = search
        ? item.ten_sanpham?.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchKho = selectedKho ? item.ten_kho === selectedKho : true;
      const matchPrice =
        (!minPrice || parseFloat(item.gia_ban) >= parseFloat(minPrice)) &&
        (!maxPrice || parseFloat(item.gia_ban) <= parseFloat(maxPrice));
      return matchName && matchKho && matchPrice;
    })
  : [];


  // Nhập kho mutation
  const { mutate: nhapKho, isLoading: isPending } = useMutation({
    mutationFn: (datakho) => KhoAPI.nhapkho(datakho),
    onSuccess: () => {
      console.log("✅ Nhập kho thành công");
      setIsChonKho(false);
      setIsAddKho(false);
      setSoluongNhap({});
      setnha_cung_cap("");
      toast.success("Nhập kho thành công ✅");
    },
    onError: (error) => {
      console.error("❌ Lỗi khi nhập kho:", error);
      toast.error("Lỗi nhập kho, vui lòng thử lại sau");
    },
  });

  // Submit nhập kho
  const handleNhapKho = () => {
    const listSanPham = sanpham
      .map((sp) => ({
        sanpham_id: sp.sanpham_id,
        ten_sanpham: sp.ten_sanpham,
        gia_ban: sp.gia_ban,
        so_luong: parseInt(soluongNhap[sp.sanpham_id] || 0, 10),
      }))
      .filter((r) => r.so_luong > 0);

    const datakho = { listSanPham, select_kho, nha_cung_cap };
    console.log(">>> Nhập kho:", datakho);
    nhapKho(datakho);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NagiveAdmin />

      <div className="flex-1 p-8">
        {/* Nút nhập kho và thêm kho */}
        <div className="fixed bottom-6 right-6 z-50 flex gap-4">
          <motion.button
            onClick={handleOpenNhapKho}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Nhập kho
          </motion.button>
          <motion.button
            onClick={handlenewkho}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Thêm kho chứa
          </motion.button>
        </div>

        {/* Modal thêm kho mới */}
        <AnimatePresence>
          {isnewkho && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Thêm kho mới
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1 text-gray-600 font-medium">
                      Tên kho
                    </label>
                    <motion.input
                      {...register("ten_kho", { required: "Tên kho bắt buộc" })}
                      type="text"
                      placeholder="Nhập tên kho"
                      className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                      whileFocus={{ scale: 1.02 }}
                    />
                    {errors.ten_kho && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.ten_kho.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 text-gray-600 font-medium">
                      Địa chỉ kho
                    </label>
                    <motion.input
                      {...register("dia_chi", {
                        required: "Địa chỉ kho bắt buộc",
                      })}
                      type="text"
                      placeholder="Nhập địa chỉ kho"
                      className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                      whileFocus={{ scale: 1.02 }}
                    />
                    {errors.dia_chi && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dia_chi.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <motion.button
                      type="button"
                      onClick={() => setisnewkho(false)}
                      className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                      disabled={isloadingkho}
                      whileHover={{ scale: isloadingkho ? 1 : 1.05 }}
                      whileTap={{ scale: isloadingkho ? 1 : 0.95 }}
                    >
                      Hủy
                    </motion.button>
                    <motion.button
                      type="submit"
                      className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                        isloadingkho
                          ? "bg-blue-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } transition-colors duration-200`}
                      disabled={isloadingkho}
                      onClick={handleSubmit(onSubmit)}
                      whileHover={{ scale: isloadingkho ? 1 : 1.05 }}
                      whileTap={{ scale: isloadingkho ? 1 : 0.95 }}
                    >
                      {isloadingkho ? "Đang thêm..." : "Thêm kho"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal nhập kho */}
        <AnimatePresence>
          {is_addkho && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto"
              >
                {!is_chonkho ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                      Chọn kho
                    </h2>
                    {isPendingXem ? (
                      <p className="text-center text-gray-500">
                        ⏳ Đang tải dữ liệu kho...
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {thongtinkho.map((item) => (
                          <motion.div
                            key={item.kho_id}
                            className="p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200"
                            onClick={() => handleChonKho(item)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <p className="font-semibold text-gray-800">
                              Tên kho: {item.ten_kho}
                            </p>
                            <p className="text-gray-600 mt-1">
                              Địa chỉ: {item.dia_chi}
                            </p>
                            <p className="text-gray-600 mt-1">
                              Nhà cung cấp: {item.nha_cung_cap || "Chưa có"}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end mt-6">
                      <motion.button
                        onClick={() => setIsAddKho(false)}
                        className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Hủy
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                      Phiếu nhập kho
                    </h2>
                    <div className="space-y-5">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm md:text-base">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-200 p-3 text-left font-semibold">
                                ID sản phẩm
                              </th>
                              <th className="border border-gray-200 p-3 text-left font-semibold">
                                Tên sản phẩm
                              </th>
                              <th className="border border-gray-200 p-3 text-left font-semibold">
                                Giá bán
                              </th>
                              <th className="border border-gray-200 p-3 text-left font-semibold">
                                Số lượng
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sanpham.map((item) => (
                              <tr key={item.sanpham_id}>
                                <td className="border border-gray-200 p-3">
                                  {item.sanpham_id}
                                </td>
                                <td className="border border-gray-200 p-3">
                                  {item.ten_sanpham}
                                </td>
                                <td className="border border-gray-200 p-3">
                                  {item.gia_ban.toLocaleString("vi-VN")} VND
                                </td>
                                <td className="border border-gray-200 p-3">
                                  <motion.input
                                    type="number"
                                    placeholder="0"
                                    value={soluongNhap[item.sanpham_id] || ""}
                                    onChange={(e) =>
                                      setSoluongNhap((prev) => ({
                                        ...prev,
                                        [item.sanpham_id]: e.target.value,
                                      }))
                                    }
                                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 text-center"
                                    whileFocus={{ scale: 1.02 }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <motion.input
                        type="text"
                        placeholder="Nhà cung cấp"
                        value={nha_cung_cap}
                        onChange={(e) => setnha_cung_cap(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
                        whileFocus={{ scale: 1.02 }}
                      />
                      <div className="flex justify-end gap-4 mt-6">
                        <motion.button
                          type="button"
                          onClick={() => {
                            setIsChonKho(false);
                            setIsAddKho(false);
                            setSoluongNhap({});
                            setnha_cung_cap("");
                          }}
                          className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Hủy
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleNhapKho}
                          className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                            isPending
                              ? "bg-blue-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          } transition-colors duration-200`}
                          disabled={isPending}
                          whileHover={{ scale: isPending ? 1 : 1.05 }}
                          whileTap={{ scale: isPending ? 1 : 0.95 }}
                        >
                          {isPending ? "Đang lưu..." : "Lưu kho"}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danh sách sản phẩm */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Danh sách sản phẩm
          </h2>

          {/* Thanh lọc */}
          <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-100 p-4 rounded-lg">
            <motion.input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.select
              value={selectedKho}
              onChange={(e) => setSelectedKho(e.target.value)}
              className="p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">-- Tất cả kho --</option>
              {khoList.map((kho, idx) => (
                <option key={idx} value={kho}>
                  {kho}
                </option>
              ))}
            </motion.select>
            <motion.input
              type="number"
              placeholder="Giá từ"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="p-3 w-32 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              type="number"
              placeholder="Đến"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="p-3 w-32 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              onClick={() => {
                setSearch("");
                setSelectedKho("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          </div>

          {isloading ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm md:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Tên sản phẩm
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Giá bán
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Số lượng
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Tên kho
                    </th>
                    <th className="border border-gray-200 p-3 text-left font-semibold">
                      Nhà cung cấp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSP.map((item) => (
                    <motion.tr
                      key={item.sanpham_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="border border-gray-200 p-3">
                        {item.ten_sanpham}
                      </td>
                      <td className="border border-gray-200 p-3">
                        {item.gia_ban.toLocaleString("vi-VN")} VND
                      </td>
                      <td className="border border-gray-200 p-3">
                        {item.so_luong_ton}
                      </td>
                      <td className="border border-gray-200 p-3">
                        {item.ten_kho}
                      </td>
                      <td className="border border-gray-200 p-3">
                        {item.nha_cung_cap}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">⏳ Đang tải...</div>
          )}
        </div>
      </div>
    </div>
  );
}
