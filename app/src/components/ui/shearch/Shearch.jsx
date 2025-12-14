import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import shearchAPI from "../../../utils/API/bill/shearch.js";
import useDebounce from "../../shared/useDebounce.jsx";
import { useNavigate } from "react-router-dom";

export default function Shearch({ keyword }) {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const debouncedKeyword = useDebounce(keyword, 1000);

  // Danh sách từ khóa mẫu (hot keywords)
  const hotKeywords = [
    "điện thoại",
    "laptop",
    "tai nghe",
    "máy tính bảng",
    "đồng hồ thông minh",
  ];

  const shearch = useMutation({
    mutationFn: (data) => shearchAPI.Shearch(data),
    onSuccess: (res) => {
      setResults(res.data.data);
    },
    onError: () => {
      setResults([]);
    },
  });

  useEffect(() => {
    if (debouncedKeyword.trim() !== "") {
      shearch.mutate({ keyword: debouncedKeyword });
    } else {
      setResults([]);
    }
  }, [debouncedKeyword]);

  // Hàm xử lý khi click vào từ khóa gợi ý
  const handleKeywordClick = (keyword) => {
    navigate(`/shearch?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
      {/* Tiêu đề tìm kiếm */}
      {debouncedKeyword && (
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Kết quả tìm kiếm: "{debouncedKeyword}"
        </h2>
      )}

      {/* Từ khóa gợi ý (hiển thị nổi bật trên trang chủ) */}
      {(!debouncedKeyword || results.length === 0) && !shearch.isLoading && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-2">
            Khám phá sản phẩm
          </h3>
          <div className="flex flex-wrap gap-2">
            {hotKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => handleKeywordClick(kw)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trạng thái loading */}
      {shearch.isLoading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Kết quả tìm kiếm */}
      {!shearch.isLoading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((item) => (
            <div
              key={item.sanpham_id}
              className="relative bg-white rounded-md shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              <button
                onClick={() => navigate(`/shearch/${item.ten_sanpham}`)}
                className="w-full text-left"
              >
                <div className="relative">
                  <img
                    src={item.url_sanpham}
                    alt={item.ten_sanpham}
                    className="w-full h-48 object-cover transition-opacity duration-300 hover:opacity-90"
                    loading="lazy"
                  />
                  <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    Mới
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {item.ten_sanpham}
                  </h3>
                  <span className="text-sm font-bold text-blue-600">
                    {item.gia_sanpham
                      ? `${item.gia_sanpham.toLocaleString()} VNĐ`
                      : "Liên hệ"}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Không tìm thấy kết quả */}
      {!shearch.isLoading && results.length === 0 && debouncedKeyword && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <p className="text-base text-gray-500">
            Không tìm thấy sản phẩm nào cho "{debouncedKeyword}".
          </p>
        </div>
      )}
    </div>
  );
}
