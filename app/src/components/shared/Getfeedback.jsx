import React, { useState, useEffect } from "react";
import apiFeedback from "../../utils/API/bill/feedback.js";
import { UserOutlined, FilterOutlined, StarFilled } from "@ant-design/icons";

export default function GetFeedback({ shop_id, sanpham_id }) {
  const [dataFeedback, setDataFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ stars: 0, hasMedia: false });
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await apiFeedback.getfeedback({ sanpham_id, shop_id });
        const data = res.data.data || [];
        setDataFeedback(data);
        setFilteredFeedback(data);

        // 👉 Tính trung bình rating sản phẩm
        if (data.length > 0) {
          const validRatings = data.filter((f) => f.rating > 0);
          const avg =
            validRatings.reduce((sum, f) => sum + f.rating, 0) /
            validRatings.length;
          setAverageRating(Number(avg.toFixed(1)));
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy feedback:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [sanpham_id, shop_id]);

  // Hàm lọc feedback
  const handleFilter = (type, value) => {
    const newFilter = { ...filter, [type]: value };
    setFilter(newFilter);

    let filtered = [...dataFeedback];
    if (newFilter.stars > 0)
      filtered = filtered.filter((f) => f.rating === newFilter.stars);

    if (newFilter.hasMedia)
      filtered = filtered.filter(
        (f) =>
          (f.images && f.images.length > 0) || (f.videos && f.videos.length > 0)
      );

    setFilteredFeedback(filtered);
  };

  if (loading)
    return (
      <div className="text-center py-6 text-gray-500 animate-pulse">
        Đang tải feedback...
      </div>
    );

  if (!dataFeedback.length)
    return (
      <div className="text-center py-6 text-gray-500">
        Chưa có feedback cho sản phẩm này.
      </div>
    );

  return (
    <div className="mt-8 space-y-6">
      {/* ⭐ Tổng quan đánh giá */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-md rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
        <div>
          <p className="text-gray-600 text-sm">Đánh giá trung bình</p>
          <h2 className="text-3xl font-bold text-yellow-500">
            {averageRating} <span className="text-gray-800 text-lg">/ 5</span>
          </h2>
          <div className="flex justify-center sm:justify-start mt-1">
            {Array.from({ length: 5 }, (_, i) => {
              const full = i + 1 <= Math.floor(averageRating);
              const half =
                i + 1 === Math.ceil(averageRating) && averageRating % 1 >= 0.5;
              return (
                <span key={i} className="text-2xl mr-0.5">
                  {full ? (
                    <span className="text-yellow-400">★</span>
                  ) : half ? (
                    <span className="relative">
                      <span className="absolute left-0 w-[50%] overflow-hidden text-yellow-400">
                        ★
                      </span>
                      <span className="text-gray-300">★</span>
                    </span>
                  ) : (
                    <span className="text-gray-300">★</span>
                  )}
                </span>
              );
            })}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            ({dataFeedback.length} lượt đánh giá)
          </p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center justify-between bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl px-5 py-3 shadow-md">
        <div className="flex items-center space-x-2 text-gray-700 font-semibold">
          <FilterOutlined className="text-yellow-500 text-lg" />
          <span>Bộ lọc</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {[0, 5, 4, 3, 2, 1].map((num) => (
            <button
              key={num}
              onClick={() => handleFilter("stars", num)}
              className={`px-3 py-1 rounded-full border text-sm transition-all duration-200 ${
                filter.stars === num
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-transparent"
                  : "bg-white/70 text-gray-700 border-gray-300 hover:bg-yellow-50"
              }`}
            >
              {num === 0 ? "Tất cả" : `${num}★`}
            </button>
          ))}

          <button
            onClick={() => handleFilter("hasMedia", !filter.hasMedia)}
            className={`px-3 py-1 rounded-full border text-sm transition-all duration-200 ${
              filter.hasMedia
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-transparent"
                : "bg-white/70 text-gray-700 border-gray-300 hover:bg-yellow-50"
            }`}
          >
            Có hình / video
          </button>
        </div>
      </div>

      {/* Danh sách feedback */}
      {filteredFeedback.map((item) => (
        <div
          key={item.feedback_id}
          className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl p-5"
        >
          {/* Thông tin người dùng */}
          <div className="flex items-center mb-3">
            {item.avatar_url ? (
              <img
                src={item.avatar_url}
                alt={item.first_name}
                className="w-12 h-12 rounded-full object-cover mr-3 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <UserOutlined className="text-gray-500 text-xl" />
              </div>
            )}

            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {item.first_name} {item.last_name}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>

            {/* Hiển thị sao */}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={`text-2xl transition-transform ${
                    num <= item.rating
                      ? "text-yellow-400 drop-shadow-md"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Nội dung feedback */}
          <p className="text-gray-700 bg-white/70 p-3 rounded-xl shadow-sm mb-3">
            {item.mota}
          </p>

          {/* Hình ảnh nếu có */}
          {item.images && item.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2">
              {item.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="feedback"
                  className="w-28 h-28 object-cover rounded-xl shadow-md border border-gray-200 hover:scale-105 transition-transform duration-300"
                />
              ))}
            </div>
          )}

          {/* Video nếu có */}
          {item.videos && item.videos.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {item.videos.map((vid, idx) => (
                <video
                  key={idx}
                  src={vid}
                  controls
                  className="w-44 h-28 rounded-xl shadow-md border border-gray-200"
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Nếu lọc không có kết quả */}
      {filteredFeedback.length === 0 && (
        <div className="text-center py-6 text-gray-500 italic">
          Không có feedback phù hợp với bộ lọc.
        </div>
      )}
    </div>
  );
}
