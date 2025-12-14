import React from "react";

const ProductList = ({ groupedItems, formatCurrency, register }) => {
  return (
    <div className="bg-white rounded-md shadow-md mb-6 p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-blue-600 mb-5 flex items-center gap-2">
        🛍️ Sản phẩm
      </h2>

      {Object.keys(groupedItems).length === 0 && (
        <div className="text-sm text-gray-500">
          Không có sản phẩm để thanh toán.
        </div>
      )}

      {Object.keys(groupedItems).map((shopId) => {
        const shop = groupedItems[shopId];
        return (
          <div
            key={shopId}
            className="border-t border-gray-200 pt-4 mt-4 hover:bg-blue-50 transition rounded-md"
          >
            <div className="mb-2 font-semibold text-gray-800 flex items-center justify-between">
              <span>{shop.ten_shop}</span>
              <span className="text-sm text-blue-500 font-medium">
                {shop.items.length} sản phẩm
              </span>
            </div>

            {shop.items.map((item) => (
              <div
                key={item.sanpham_id}
                className="flex items-center mb-4 p-2 rounded-md bg-gray-50 hover:bg-blue-100 transition"
              >
                <img
                  src={item.url_sanpham}
                  alt={item.ten_sanpham}
                  className="w-16 h-16 object-cover rounded-md mr-4 border border-gray-200"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {item.ten_sanpham}
                  </p>
                  <p className="text-sm text-gray-600">
                    Số lượng: {item.so_luong}
                  </p>
                </div>
                <p className="text-blue-600 font-semibold">
                  {formatCurrency(item.gia_ban * item.so_luong)}
                </p>
              </div>
            ))}

            {/* Ghi chú riêng cho từng shop */}
            <div className="mt-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Ghi chú cho shop
              </label>
              <textarea
                rows="2"
                {...register(`shopNotes.${shopId}`)}
                className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-md px-3 py-2 w-full transition"
                placeholder="Ví dụ: Giao giờ hành chính, đóng gói kỹ..."
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
