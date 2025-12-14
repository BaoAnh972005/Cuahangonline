import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import shearchAPI from "../../../utils/API/bill/shearch.js";
import apifeedback from "../../../utils/API/bill/feedback.js";
import { useParams, useNavigate } from "react-router-dom";
import Nagigate from "../../layout/nagigate.jsx";

export default function SearchDetail() {
  const { keyword } = useParams();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // States cho filters
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    province: "",
    min_rating: "",
    sort_price: "", // asc hoặc desc
  });

  // Danh sách tỉnh thành Việt Nam (mẫu, có thể mở rộng)
  const provinces = [
    "Hà Nội",
    "TP Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    // ... (Thêm các tỉnh khác nếu cần)
  ];

  // --- Gọi API lấy điểm trung bình ---
  const avg_rating_SP = useMutation({
    mutationFn: async (sanpham_id) => {
      const res = await apifeedback.averagerating({ sanpham_id });
      return res;
    },
    onSuccess: (res, sanpham_id) => {
      const data = res?.data?.data;
      setRatings((prev) => ({
        ...prev,
        [sanpham_id]: {
          avg: data?.avg_rating ? parseFloat(data.avg_rating).toFixed(1) : null,
          total: data?.total_feedback || 0,
        },
      }));
    },
    onError: () => {},
  });

  // --- Gọi API tìm kiếm với filters ---
  const search = useMutation({
    mutationFn: async (data) => {
      const res = await shearchAPI.Sheacrch_Detail(data);
      return res;
    },
    onSuccess: (res) => {
      const products = res.data?.data || [];
      setSearchResults(products);
      setLoading(false);
      products.forEach((p) => {
        avg_rating_SP.mutate(p.sanpham_id);
      });
    },
    onError: () => {
      setLoading(false);
    },
  });

  // --- Khi keyword hoặc filters thay đổi ---
  useEffect(() => {
    if (keyword) {
      setLoading(true);
      search.mutate({ keyword, ...filters });
    }
  }, [keyword, filters]);

  // --- Format tiền ---
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // --- Hiển thị sao ---
  const renderStars = (avg, total) => {
    if (!avg || total === 0) {
      return <p className="text-sm text-gray-500">Chưa có đánh giá</p>;
    }
    const rating = parseFloat(avg);
    return (
      <div className="flex items-center text-yellow-400 text-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>{i <= Math.round(rating) ? "★" : "☆"}</span>
        ))}
        <span className="ml-1 text-gray-600">{rating}</span>
        <span className="ml-1 text-xs text-gray-500">({total})</span>
      </div>
    );
  };

  // --- Chuyển đến trang chi tiết ---
  const handleBuyNow = (sanpham_id) => {
    navigate(`/product/${sanpham_id}`);
  };

  // --- Cập nhật filters ---
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // --- Áp dụng filters ---
  const applyFilters = () => {
    setMobileFilterOpen(false);
  };

  // --- Reset filters ---
  const resetFilters = () => {
    setFilters({
      min_price: "",
      max_price: "",
      province: "",
      min_rating: "",
      sort_price: "",
    });
    setMobileFilterOpen(false);
  };

  // --- Filter component (dùng chung cho desktop và mobile) ---
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Lọc theo giá cố định */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Lọc theo mức giá</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Dưới 1 triệu", min: 0, max: 1000000 },
            { label: "1-5 triệu", min: 1000000, max: 5000000 },
            { label: "5-10 triệu", min: 5000000, max: 10000000 },
            { label: "Trên 10 triệu", min: 10000000, max: null },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                updateFilter("min_price", range.min);
                updateFilter("max_price", range.max || "");
              }}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                filters.min_price === range.min &&
                filters.max_price === (range.max || "")
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-100"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nhập khoảng giá */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Nhập khoảng giá</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={filters.min_price}
            onChange={(e) =>
              updateFilter(
                "min_price",
                e.target.value ? parseInt(e.target.value) : ""
              )
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Tối đa"
            value={filters.max_price}
            onChange={(e) =>
              updateFilter(
                "max_price",
                e.target.value ? parseInt(e.target.value) : ""
              )
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sắp xếp theo giá */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Sắp xếp theo giá</h3>
        <select
          value={filters.sort_price}
          onChange={(e) => updateFilter("sort_price", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Mặc định</option>
          <option value="asc">Giá thấp đến cao</option>
          <option value="desc">Giá cao đến thấp</option>
        </select>
      </div>

      {/* Lọc theo tỉnh thành */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">
          Lọc theo tỉnh/thành
        </h3>
        <select
          value={filters.province}
          onChange={(e) => updateFilter("province", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* Lọc theo đánh giá */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Lọc theo đánh giá</h3>
        <select
          value={filters.min_rating}
          onChange={(e) => updateFilter("min_rating", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả</option>
          <option value="3">3 sao trở lên</option>
          <option value="4">4 sao trở lên</option>
          <option value="5">5 sao</option>
        </select>
      </div>

      {/* Nút áp dụng/reset */}
      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-blue-500 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-600 transition-all"
        >
          Áp dụng
        </button>
        <button
          onClick={resetFilters}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md text-sm font-semibold hover:bg-gray-300 transition-all"
        >
          Xóa
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Nagigate />

      {/* Tiêu đề kết quả tìm kiếm */}
      {keyword && (
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Kết quả tìm kiếm: "{keyword}"
        </h2>
      )}

      {/* Nút mở filters mobile */}
      <button
        onClick={() => setMobileFilterOpen(true)}
        className="lg:hidden mb-4 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-semibold"
      >
        Bộ lọc
      </button>

      <div className="flex gap-6">
        {/* Sidebar filters - desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6">
            <FilterContent />
          </div>
        </div>

        {/* Mobile drawer filters */}
        {mobileFilterOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setMobileFilterOpen(false)}
          >
            <div
              className="bg-white w-80 h-full absolute right-0 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <FilterContent />
            </div>
          </div>
        )}

        {/* Kết quả tìm kiếm */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-3 animate-pulse"
                >
                  <div className="w-full h-48 md:h-56 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 mt-3 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 mt-2 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 mt-2 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 mt-3 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Thử từ khóa khác từ thanh tìm kiếm ở trên!
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-600 transition-all"
              >
                Quay lại tìm kiếm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((product) => {
                const ratingInfo = ratings[product.sanpham_id] || {
                  avg: null,
                  total: 0,
                };
                return (
                  <div
                    key={product.sanpham_id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-105"
                  >
                    {/* Ảnh sản phẩm */}
                    <div className="relative">
                      <img
                        src={product.url_sanpham}
                        alt={product.ten_sanpham}
                        className="w-full h-48 md:h-56 object-cover transition-opacity duration-300 hover:opacity-90"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        HOT
                      </span>
                    </div>

                    {/* Thông tin */}
                    <div className="p-3 md:p-4">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 truncate">
                        {product.ten_sanpham}
                      </h3>

                      {/* Hiển thị rating hoặc placeholder */}
                      <div className="min-h-[1.5rem] mt-1">
                        {renderStars(ratingInfo.avg, ratingInfo.total)}
                      </div>

                      <p className="text-blue-600 font-bold text-sm md:text-base mt-1">
                        {formatPrice(product.gia_ban)}
                      </p>

                      {/* Shop info */}
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={product.url_shop}
                          alt={product.ten_shop}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {product.ten_shop}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            📍 {product.dia_chi_shop}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyNow(product.sanpham_id)}
                        className="w-full bg-blue-500 text-white py-2 rounded-md text-sm font-semibold mt-3 hover:bg-blue-600 transition-all"
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
