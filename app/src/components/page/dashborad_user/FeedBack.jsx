import React, { useState, useEffect, useRef } from "react";
import bill from "../../../utils/API/bill/bill";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function FeedBack({ sanpham_id, hoadon_id }) {
  const [isFeedback, setIsFeedback] = useState(null);
  const [formData, setFormData] = useState({
    mota: "",
    image_url: [],
    rating: 0,
  });
  const [feedbackType, setFeedbackType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();

  // Kiểm tra đã đánh giá chưa
  const checkFeedback = useMutation({
    mutationFn: (data) => bill.check_feedback(data),
    onSuccess: (res) => setIsFeedback(res.data.status),
  });

  useEffect(() => {
    checkFeedback.mutate({ sanpham_id, hoadon_id });
  }, [sanpham_id, hoadon_id]);

  // Gửi đánh giá
  const newFeedBack = useMutation({
    mutationFn: (data) => bill.feedBack(data),
    onMutate: () => setIsSubmitting(true),
    onSuccess: () => {
      toast.success("Cảm ơn bạn đã đánh giá!");
      setIsFeedback("ok");
      setFormData({ mota: "", image_url: [], rating: 0 });
    },
    onError: () => toast.error("Có lỗi, vui lòng thử lại sau."),
    onSettled: () => setIsSubmitting(false),
  });

  // Xử lý chọn sao
  const handleRating = (num) => {
    setFormData({ ...formData, rating: num });
    if (num <= 2) setFeedbackType("Không hài lòng 😞");
    else if (num === 3) setFeedbackType("Bình thường 😐");
    else setFeedbackType("Rất hài lòng 😍");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append("mota", formData.mota);
    dataToSend.append("sanpham_id", sanpham_id);
    dataToSend.append("hoadon_id", hoadon_id);
    dataToSend.append("rating", formData.rating);
    formData.image_url.forEach((file) => dataToSend.append("image_url", file));
    newFeedBack.mutate(dataToSend);
  };

  // Upload hình
  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image_url: Array.from(e.target.files),
    });
  };

  if (isFeedback === "ok")
    return (
      <div className="p-6 bg-white/30 backdrop-blur-md rounded-2xl text-center shadow-lg mt-5">
        <h3 className="text-xl font-semibold text-green-600">
          Bạn đã gửi đánh giá rồi. Cảm ơn bạn ❤️
        </h3>
      </div>
    );

  return (
    <div className="flex justify-center items-center mt-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30"
      >
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
          Đánh giá sản phẩm
        </h2>

        {/* Rating stars */}
        <div className="flex justify-center mb-2 space-x-3">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleRating(num)}
              className={`w-14 h-14 text-3xl rounded-full transition-all duration-300 transform hover:scale-125 ${
                num <= formData.rating
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl"
                  : "bg-white/40 text-gray-300 hover:text-yellow-400"
              } flex items-center justify-center`}
            >
              ★
            </button>
          ))}
        </div>

        {feedbackType && (
          <p className="text-center text-lg text-gray-700 mb-4 animate-fade-in">
            {feedbackType}
          </p>
        )}

        {/* Mô tả */}
        <textarea
          className="w-full rounded-xl bg-white/40 p-3 text-gray-800 placeholder-gray-500 outline-none border border-gray-200 focus:ring-2 focus:ring-yellow-400 mb-3"
          placeholder="Chia sẻ cảm nhận của bạn..."
          rows="3"
          value={formData.mota}
          onChange={(e) => setFormData({ ...formData, mota: e.target.value })}
        />

        {/* Upload hình ảnh đẹp */}
        <div
          onClick={() => fileInputRef.current.click()}
          className="cursor-pointer border-2 border-dashed border-yellow-400 rounded-2xl bg-white/40 p-5 flex flex-col items-center justify-center hover:bg-yellow-50 transition-all duration-300 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-yellow-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16l5.586-5.586a2 2 0 012.828 0L17 16m0 0l3-3m-3 3v6m0-6H4"
            />
          </svg>
          <p className="text-gray-600 font-medium">
            Chọn hoặc kéo thả hình ảnh tại đây
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Hiển thị preview hình */}
        {formData.image_url.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {formData.image_url.map((file, index) => (
              <div
                key={index}
                className="relative w-full aspect-square overflow-hidden rounded-xl border border-gray-300"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Nút gửi */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-800 text-white font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
        >
          {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
}
