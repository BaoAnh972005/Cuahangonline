import React, { useEffect, useState } from "react";
import KhoAPI from "../../../utils/API/kho.js";
import NagiveAdmin from "./nagiveadmin";
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
  const [khoList, setKhoList] = useState([]);

  const [soluongNhap, setSoluongNhap] = useState({});
  const [nha_cung_cap, setnha_cung_cap] = useState("");

  const [isnewkho, setisnewkho] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedKho, setSelectedKho] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  /* ==========================
     LOAD DANH SÁCH KHO
  ========================== */
  const fetchThongTinKho = async () => {
      console.log("🚀 fetchThongTinKho CALLED"); // 👈 thêm dòng này
    try {
      setIsloading(true);
      const res = await KhoAPI.xemthongtinkho();
      const data = res?.data?.data || [];

      setThongTinKho(data);

      // 👉 sinh danh sách tên kho cho filter
      const listKho = data.map((k) => k.ten_kho);
      setKhoList(listKho);
    } catch (err) {
      console.error("❌ Lỗi load kho:", err);
      toast.error("Không tải được danh sách kho");
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchThongTinKho();
  }, []);

  /* ==========================
     THÊM KHO MỚI
  ========================== */
  const mutationNewKho = useMutation({
    mutationFn: (data) => KhoAPI.newkho(data),
    onSuccess: async () => {
      toast.success("Thêm kho mới thành công ✅");
      await fetchThongTinKho();
      setisnewkho(false);
      reset();
    },
    onError: () => {
      toast.error("Lỗi thêm kho");
    },
  });

  const { mutate: newkho, isLoading: isloadingkho } = mutationNewKho;

  const onSubmit = (data) => newkho(data);

  /* ==========================
     CHỌN KHO – NHẬP KHO
  ========================== */
  const handleOpenNhapKho = async () => {
    setIsAddKho(true);
    await fetchThongTinKho();
  };

  const handleChonKho = (item) => {
    setSelectKho(item.id);
    setIsChonKho(true);
  };

  const { mutate: nhapKho, isLoading: isPending } = useMutation({
    mutationFn: (datakho) => KhoAPI.nhapkho(datakho),
    onSuccess: () => {
      toast.success("Nhập kho thành công ✅");
      setIsChonKho(false);
      setIsAddKho(false);
      setSoluongNhap({});
      setnha_cung_cap("");
    },
    onError: () => {
      toast.error("Lỗi nhập kho");
    },
  });

  const handleNhapKho = () => {
    const listSanPham = sanpham
      .map((sp) => ({
        sanpham_id: sp.sanpham_id,
        so_luong: parseInt(soluongNhap[sp.sanpham_id] || 0, 10),
      }))
      .filter((sp) => sp.so_luong > 0);

    nhapKho({ listSanPham, select_kho, nha_cung_cap });
  };

  /* ==========================
     LỌC SẢN PHẨM
  ========================== */
  const filteredSP = Array.isArray(sanpham)
    ? sanpham.filter((item) => {
        const matchName = search
          ? item.ten_sanpham?.toLowerCase().includes(search.toLowerCase())
          : true;

        const matchKho = selectedKho
          ? item.ten_kho === selectedKho
          : true;

        const matchPrice =
          (!minPrice || item.gia_ban >= Number(minPrice)) &&
          (!maxPrice || item.gia_ban <= Number(maxPrice));

        return matchName && matchKho && matchPrice;
      })
    : [];

  /* ==========================
     RENDER
  ========================== */
  return (
    <div className="flex min-h-screen bg-gray-50">
      <NagiveAdmin />

      <div className="flex-1 p-8">
        {/* BUTTONS */}
        <div className="fixed bottom-6 right-6 z-50 flex gap-4">
          <motion.button
            onClick={handleOpenNhapKho}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            Nhập kho
          </motion.button>

          <motion.button
            onClick={() => setisnewkho(true)}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            Thêm kho chứa
          </motion.button>
        </div>

        {/* ==========================
            MODAL THÊM KHO
        ========================== */}
        <AnimatePresence>
          {isnewkho && (
            <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <motion.div className="bg-white p-8 rounded-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center">
                  Thêm kho mới
                </h2>

                <input
                  {...register("ten_kho", { required: true })}
                  placeholder="Tên kho"
                  className="w-full p-3 border rounded mb-3"
                />

                <input
                  {...register("dia_chi", { required: true })}
                  placeholder="Địa chỉ"
                  className="w-full p-3 border rounded mb-4"
                />

                <div className="flex justify-end gap-3">
                  <button onClick={() => setisnewkho(false)}>Hủy</button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isloadingkho}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    {isloadingkho ? "Đang thêm..." : "Thêm"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================
            DANH SÁCH SẢN PHẨM
        ========================== */}
        <h2 className="text-3xl font-bold text-center mb-6">
          Danh sách sản phẩm
        </h2>

        {isloading ? (
          <div className="text-center py-8">⏳ Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr>
                  <th>Tên SP</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Kho</th>
                </tr>
              </thead>
              <tbody>
                {filteredSP.map((item) => (
                  <tr key={item.sanpham_id}>
                    <td>{item.ten_sanpham}</td>
                    <td>{item.gia_ban}</td>
                    <td>{item.so_luong_ton}</td>
                    <td>{item.ten_kho}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
