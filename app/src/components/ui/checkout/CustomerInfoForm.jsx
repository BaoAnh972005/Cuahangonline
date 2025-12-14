import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import APIkhachhang from "../../../utils/API/khachhang.js";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const CustomerInfoForm = ({ setValueParent }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [editAddress, setEditAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noCustomer, setNoCustomer] = useState(false);

  const { register, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      detailAddress: "",
      moTaDiaChi: "",
    },
  });

  const province = watch("province");
  const district = watch("district");

  // 🧠 Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await APIkhachhang.xemkh();
      console.log("📥 Dữ liệu trả về từ API.xemkh:", res.data);

      const data = res.data?.data;

      if (Array.isArray(data) && data.length > 0) {
        const activeAddresses = data.filter((addr) => addr.active === 1);
        setAddresses(activeAddresses);
        setNoCustomer(false);

        const defaultAddr =
          activeAddresses.find((addr) => addr.default_KH === 1) ||
          activeAddresses[0]; // nếu chưa có default

        if (!selectedAddr) {
          setSelectedAddr(defaultAddr || null);
          setValueParent(defaultAddr || null);
        }
      } else {
        console.warn("⚠️ Không có dữ liệu khách hàng hợp lệ!");
        setAddresses([]);
        setSelectedAddr(null);
        setValueParent(null);
        setNoCustomer(true);
        setShowForm(true);
      }
    } catch (err) {
      console.error("❌ Lỗi khi gọi API.xemkh:", err);
      setAddresses([]);
      setSelectedAddr(null);
      setValueParent(null);
      setNoCustomer(true);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 📦 Lấy danh sách tỉnh/huyện/xã
  useEffect(() => {
    if (!showForm) return;
    axios
      .get("https://provinces.open-api.vn/api/v1/p/")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("❌ Lỗi load tỉnh:", err));
  }, [showForm]);

  useEffect(() => {
    if (!province || !showForm) return;
    axios
      .get(`https://provinces.open-api.vn/api/v1/p/${province}?depth=2`)
      .then((res) => {
        setDistricts(res.data.districts || []);
        setWards([]);
        setValue("district", "");
        setValue("ward", "");
      })
      .catch((err) => console.error("❌ Lỗi load huyện:", err));
  }, [province, showForm]);

  useEffect(() => {
    if (!district || !showForm) return;
    axios
      .get(`https://provinces.open-api.vn/api/v1/d/${district}?depth=2`)
      .then((res) => {
        setWards(res.data.wards || []);
        setValue("ward", "");
      })
      .catch((err) => console.error("❌ Lỗi load xã:", err));
  }, [district, showForm]);

  // 💾 Lưu hoặc cập nhật địa chỉ
  const { mutate: saveAddress } = useMutation({
    mutationFn: (dataDC) => {
      console.log("📤 Gửi dữ liệu địa chỉ lên server:", dataDC);
      return editAddress
        ? APIkhachhang.updateDiaChi({
            ...dataDC,
            diachi_id: editAddress.diachi_id,
          })
        : APIkhachhang.newdiachi(dataDC);
    },
    onSuccess: (res) => {
      console.log("✅ Phản hồi từ API (save/update):", res.data);
      fetchAddresses(); // reload lại danh sách KH
      setShowForm(false);
      setEditAddress(null);
      reset();

      const savedAddr = res.data?.data;
      if (savedAddr?.default_KH === 1) {
        setSelectedAddr(savedAddr);
        setValueParent(savedAddr);
      }
    },
    onError: (err) => {
      console.error("❌ Lỗi khi lưu địa chỉ:", err);
    },
  });

  // 🧾 Tạo mới khách hàng + địa chỉ đầu tiên
  const { mutate: newkhachhang } = useMutation({
    mutationFn: (datakh) => {
      console.log("📤 Gửi dữ liệu khách hàng mới:", datakh);
      return APIkhachhang.newkhachhang({
        ten_khachhang: datakh.ten_khachhang,
        so_dien_thoai: datakh.so_dien_thoai,
      });
    },
    onSuccess: (res, variables) => {
      console.log("✅ Phản hồi khi tạo khách hàng:", res.data);
      const kh_id = res.data?.data?.khachhang_id;
      const dataDC = { ...variables, khachhang_id: kh_id, active: 1 };
      saveAddress(dataDC);
    },
    onError: (err) => {
      console.error("❌ Lỗi khi tạo khách hàng:", err);
    },
  });

  // 🧩 Xử lý lưu dữ liệu form
  const onSubmitAddress = (data) => {
    const provinceName =
      provinces.find((p) => p.code === Number(data.province))?.name || "";
    const districtName =
      districts.find((d) => d.code === Number(data.district))?.name || "";
    const wardName =
      wards.find((w) => w.code === Number(data.ward))?.name || "";

    const dataToSave = {
      ten_khachhang: data.fullName,
      so_dien_thoai: data.phone,
      province: provinceName,
      district: districtName,
      ward: wardName,
      dia_chi: data.detailAddress,
      mo_ta_dia_chi: data.moTaDiaChi || "Nhà riêng",
      active: 1,
    };

    console.log("📝 Dữ liệu form cần lưu:", dataToSave);

    if (editAddress) saveAddress(dataToSave);
    else newkhachhang(dataToSave);
  };

  // 🗑️ Xóa địa chỉ
  const handleDelete = (addr) => {
    console.log("🗑️ Xóa địa chỉ:", addr);
    setLoading(true);
    APIkhachhang.updateDiaChi({ diachi_id: addr.diachi_id, active: 0 })
      .then((res) => {
        console.log("✅ Xóa thành công:", res.data);
        if (selectedAddr?.diachi_id === addr.diachi_id) {
          setSelectedAddr(null);
          setValueParent(null);
        }
        fetchAddresses();
      })
      .catch((err) => console.error("❌ Lỗi khi xóa:", err))
      .finally(() => setLoading(false));
  };

  // 🧭 Chọn địa chỉ
  const handleSelectAddr = (addr) => {
    console.log("📍 Chọn địa chỉ:", addr);
    setSelectedAddr(addr);
    setValueParent(addr);
    setShowAll(false);
  };

  // 🧱 Giao diện hiển thị
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-gray-700">
        Địa chỉ giao hàng
      </h2>

      {/* 🧩 Nếu chưa có khách hàng */}
      {noCustomer && !showAll && !editAddress && (
        <div className="text-gray-600 mb-3">
          <p>Chưa có thông tin khách hàng, vui lòng thêm mới:</p>
        </div>
      )}

      {/* 🧭 Hiển thị địa chỉ mặc định */}
      {!showForm && selectedAddr && !showAll && (
        <div className="border border-gray-300 p-4 rounded-lg mb-2 hover:shadow hover:bg-gray-50 transition cursor-pointer">
          <p className="font-semibold text-gray-800">
            {selectedAddr.ten_khachhang} - {selectedAddr.so_dien_thoai}
          </p>
          <p className="text-gray-600">
            {selectedAddr.dia_chi}, {selectedAddr.ward}, {selectedAddr.district}
            , {selectedAddr.province}
          </p>
          <p className="text-gray-500">{selectedAddr.mo_ta_dia_chi}</p>
          <button
            className="text-blue-500 mt-2 hover:underline"
            onClick={() => setShowAll(true)}
          >
            Chọn khác
          </button>
        </div>
      )}

      {/* 🧾 Danh sách tất cả địa chỉ */}
      {!showForm && showAll && (
        <div>
          {addresses.length > 0 ? (
            addresses.map((addr) => (
              <div
                key={addr.diachi_id}
                className="border border-gray-300 p-4 rounded-lg mb-2 hover:shadow hover:bg-gray-50 transition cursor-pointer"
                onClick={() => handleSelectAddr(addr)}
              >
                <p className="font-semibold text-gray-800">
                  {addr.ten_khachhang} - {addr.so_dien_thoai}
                </p>
                <p className="text-gray-600">
                  {addr.dia_chi}, {addr.ward}, {addr.district}, {addr.province}
                </p>
                <p className="text-gray-500">{addr.mo_ta_dia_chi}</p>
                <div className="flex gap-2 mt-2">
                  <EditOutlined
                    className="cursor-pointer text-green-500 hover:text-green-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditAddress(addr);
                      setShowForm(true);
                      setValue("fullName", addr.ten_khachhang);
                      setValue("phone", addr.so_dien_thoai);
                      setValue("province", addr.province);
                      setValue("district", addr.district);
                      setValue("ward", addr.ward);
                      setValue("detailAddress", addr.dia_chi);
                      setValue("moTaDiaChi", addr.mo_ta_dia_chi);
                    }}
                  />
                  <DeleteOutlined
                    className="cursor-pointer text-red-500 hover:text-red-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(addr);
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="mb-2 text-gray-500">
              Chưa có địa chỉ nào, vui lòng tạo mới.
            </p>
          )}

          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center mt-2 hover:bg-blue-600 transition"
            onClick={() => setShowForm(true)}
          >
            <PlusOutlined className="mr-2" /> Thêm địa chỉ mới
          </button>
        </div>
      )}

      {/* 🧱 Form thêm/sửa */}
      {showForm && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              {...register("fullName", { required: true })}
              placeholder="Họ và tên"
              className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="tel"
              {...register("phone", {
                required: true,
                pattern: /^[0-9]{9,11}$/,
              })}
              placeholder="Số điện thoại"
              className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <select
              {...register("province", { required: true })}
              className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Chọn tỉnh/thành --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              {...register("district", { required: true })}
              className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Chọn quận/huyện --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              {...register("ward", { required: true })}
              className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Chọn phường/xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows="2"
            {...register("detailAddress", { required: true })}
            placeholder="Số nhà, đường, tòa nhà..."
            className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            {...register("moTaDiaChi")}
            placeholder="Mô tả địa chỉ (VD: Nhà riêng, Cơ quan...)"
            className="border border-gray-300 px-3 py-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              onClick={handleSubmit(onSubmitAddress)}
            >
              Lưu
            </button>
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              onClick={() => {
                reset();
                setShowForm(false);
                setEditAddress(null);
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInfoForm;
