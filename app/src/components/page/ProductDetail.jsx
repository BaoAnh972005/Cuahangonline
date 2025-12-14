import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Nagigate from "../layout/nagigate.jsx";
import { useMutation } from "@tanstack/react-query";
import APISP from "../../utils/API/sanpham.js";
import { useAddToCart } from "../shared/cart.jsx"; // ✅ import đúng hook
import GetFeedback from "../shared/Getfeedback.jsx";
import apiFeedback from "../../utils/API/bill/feedback.js";
const formatVND = (number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [productDetail, setProductDetail] = useState(null);
  const [soLuong, setSoLuong] = useState(1);
  // laays rating shop
  const [shopRating, setShopRating] = useState(null);
  const RatingofShop = useMutation({
    mutationFn: (shop_id) => apiFeedback.feedback_ofshop(shop_id),
    onSuccess: (res) => {
      console.log("res rating shop", res.data);
      if (res.data?.status === "success") {
        if (res.data.data[0].rating_trung_binh_shop === 0) {
          return setShopRating(null);
        }
        setShopRating(res.data.data[0].rating_trung_binh_shop);
        console.log("rating shop", res.data.data[0].rating_trung_binh_shop);
      } else toast.error("Không tìm thấy đánh giá của shop");
    },
    onError: () => toast.error("Lỗi khi tải đánh giá của shop"),
  });
  // ✅ khai báo hook addToCartp
  const addToCartp = useAddToCart();

  const { mutate: xemCTSP, isPending: isPendingXem } = useMutation({
    mutationFn: (id) => APISP.xemCTSP(id),
    onSuccess: (res) => {
      setProductDetail(res.data.data);
      RatingofShop.mutate(res.data.data.shop_id);
    },
    onError: (error) => {
      console.error("❌ Lỗi khi xem chi tiết SP:", error);
    },
  });

  useEffect(() => {
    if (id) {
      xemCTSP(id);
    }
  }, [id]);

  if (isPendingXem)
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="custom-loader"></div>
      </div>
    );
  if (!productDetail) return <p className="p-6">Không có dữ liệu sản phẩm</p>;

  const product = {
    ten_sanpham: productDetail.ten_sanpham,
    gia_ban: productDetail.gia_ban,
    mo_ta: productDetail.mo_ta_sanpham,
    url_sanpham: productDetail.url_sanpham || "https://via.placeholder.com/400",
    so_luong: productDetail.tong_so_luong_ton,
  };
  console.log(">>>>", product.mo_ta);
  const shop = {
    ten_shop: productDetail.ten_shop,
    dia_chi: productDetail.dia_chi_shop,
    sdt: "cùng mua sắm nào ❤️",
    avatar: productDetail.url_shop, // ảnh logo shop
  };
  return (
    <div>
      <Nagigate />
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6">
          {/* Ảnh sản phẩm */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4">
            <img
              src={product.url_sanpham}
              alt={product.ten_sanpham}
              className="w-full h-[400px] object-contain"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-3">
              {product.ten_sanpham}
            </h1>
            <p className="text-3xl font-bold text-red-500 mb-4">
              {formatVND(product.gia_ban)}đ
            </p>
            <p className="text-3xl font-bold text-red-500 mb-4">
              còn: {product.so_luong}
            </p>

            {/* Số lượng */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-medium">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  className="px-3 py-1 text-lg font-bold"
                  onClick={() =>
                    setSoLuong((prev) => (prev > 1 ? prev - 1 : 1))
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  value={soLuong}
                  min="1"
                  onChange={(e) => setSoLuong(Number(e.target.value))}
                  className="w-16 text-center border-l border-r outline-none"
                />
                <button
                  className="px-3 py-1 text-lg font-bold"
                  onClick={() => setSoLuong((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-4">
              <button className="flex-1 bg-red-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition">
                Mua ngay
              </button>
              <button
                onClick={() => addToCartp(productDetail, soLuong)} // ✅ gọi hàm hook
                className="flex-1 border border-red-500 text-red-500 py-3 rounded-lg text-lg font-semibold hover:bg-red-50 transition"
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={shop.avatar}
              alt={shop.ten_shop}
              className="w-16 h-16 rounded-full border"
            />
            <div>
              <h2 className="text-lg font-semibold">{shop.ten_shop}</h2>
              <p className="text-gray-600">{shop.dia_chi}</p>
              {shopRating !== null && !isNaN(Number(shopRating)) && (
                <div className="flex items-center mt-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const rating = Number(shopRating);
                    const fullStar = i + 1 <= Math.floor(rating);
                    const halfStar =
                      i + 1 === Math.ceil(rating) && rating % 1 >= 0.5;

                    return (
                      <span
                        key={i}
                        className="relative text-yellow-400 text-xl mr-0.5"
                      >
                        {fullStar ? (
                          "★"
                        ) : halfStar ? (
                          <span className="relative">
                            <span className="absolute left-0 overflow-hidden w-[50%]">
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
                  <span className="ml-2 text-gray-700 text-xl">
                    {Number(shopRating).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/pageshop/${productDetail.shop_id}`)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Xem shop
          </button>
        </div>
        {/* mô tae ản phẩm */}
        <div className="p-6 bg-white rounded-lg shadow-md mt-3">
          <h2 className="text-2xl font-semibold mb-4">Mô tả sản phẩm:</h2>{" "}
          <p className="text-black text-xl">{product.mo_ta}</p>
        </div>
        <div>
          <GetFeedback
            shop_id={productDetail.shop_id}
            sanpham_id={productDetail.sanpham_id}
          />
        </div>
      </div>
      {/* danh gia sna pham */}
    </div>
  );
}
