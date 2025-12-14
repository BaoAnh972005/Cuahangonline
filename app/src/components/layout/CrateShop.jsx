import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../utils/API/shop.js";
import "react-toastify/dist/ReactToastify.css";

export default function ShopForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const agree = watch("agree");

  // 🔹 Mutation: gửi form
  const mutation = useMutation({
    mutationFn: async (formData) => await API.crateshop(formData),
    onSuccess: (res) => {
      // res is the axios response from the backend
      const created = res?.data?.shop || res?.data;
      toast.success("✅ Tạo shop thành công!");
      if (created && created.id) {
        navigate(`/pageshop/${created.id}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error("❌ Có lỗi xảy ra khi tạo shop!");
    },
  });

  // 🔹 Xử lý submit
  const onSubmit = (data) => {
    if (!data.agree) {
      toast.warn("⚠️ Vui lòng đồng ý với điều khoản dịch vụ!");
      return;
    }

    const formData = new FormData();
    formData.append("ten_shop", data.ten_shop);
    formData.append("mo_ta", data.mo_ta || "");
    formData.append("the_loai", data.the_loai || "");
    if (data.url_shop && data.url_shop[0]) {
      formData.append("url_shop", data.url_shop[0]);
    }

    mutation.mutate(formData);
  };

  // 🔹 Xem trước ảnh
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white shadow-xl rounded-2xl relative">
      <h2 className="text-2xl font-semibold mb-4 text-center">Tạo Shop Mới</h2>

      {/* Hiệu ứng loading */}
      {mutation.isPending && (
        <div className="absolute inset-0 flex justify-center items-center bg-white/80 rounded-2xl z-10">
          <div className="custom-loader"></div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        encType="multipart/form-data"
      >
        {/* Tên shop */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên Shop
          </label>
          <input
            type="text"
            {...register("ten_shop", { required: "Tên shop là bắt buộc" })}
            className="mt-1 block w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-200"
          />
          {errors.ten_shop && (
            <p className="text-red-500 text-sm mt-1">
              {errors.ten_shop.message}
            </p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            {...register("mo_ta")}
            className="mt-1 block w-full border border-gray-200 rounded-lg p-2 resize-none"
            rows={3}
          />
        </div>

        {/* Thể loại */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thể loại
          </label>
          <input
            type="text"
            {...register("the_loai")}
            className="mt-1 block w-full border border-gray-200 rounded-lg p-2"
          />
        </div>

        {/* Ảnh shop */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ảnh Shop
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("url_shop", { onChange: handleFileChange })}
            className="mt-1 block w-full text-sm"
          />
          {preview && (
            <img
              src={preview}
              alt="Xem trước"
              className="mt-2 w-32 h-32 object-cover rounded-md border"
            />
          )}
        </div>

        {/* Checkbox điều khoản */}
        <div className="flex items-start space-x-3">
          <input
            id="agree"
            type="checkbox"
            {...register("agree")}
            className="mt-1 h-4 w-4"
          />
          <label htmlFor="agree" className="text-sm">
            Tôi đồng ý với{" "}
            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="text-blue-600 underline hover:text-blue-800 ml-1"
            >
              điều khoản dịch vụ
            </button>
          </label>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
          >
            Quay về Trang Chủ
          </button>

          <button
            type="submit"
            disabled={!agree || mutation.isPending}
            className={`flex-1 py-2 rounded-lg text-white transition ${
              !agree || mutation.isPending
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            {mutation.isPending ? "Đang tạo..." : "Tạo Shop"}
          </button>
        </div>
      </form>
    </div>
  );
}
