import React from "react";

const PaymentMethod = ({ register, errors }) => {
  const methods = [
    { id: "cod", label: "Thanh toán khi nhận hàng (COD)" },
    { id: "bank", label: "Chuyển khoản ngân hàng" },
    { id: "card", label: "Thẻ tín dụng/ghi nợ" },
  ];

  return (
    <div className="bg-white rounded-md shadow-md mb-6 p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-blue-600 mb-5 flex items-center gap-2">
        💳 Phương thức thanh toán
      </h2>

      <div className="space-y-3">
        {methods.map((m) => (
          <label
            key={m.id}
            htmlFor={m.id}
            className="flex items-center cursor-pointer hover:bg-blue-50 transition rounded-md p-2"
          >
            <input
              type="radio"
              id={m.id}
              value={m.id}
              {...register("paymentMethod", {
                required: "Vui lòng chọn phương thức thanh toán",
              })}
              className="text-blue-600 focus:ring-blue-500 mr-3 h-5 w-5"
            />
            <span className="text-gray-700">{m.label}</span>
          </label>
        ))}
      </div>

      {errors?.paymentMethod && (
        <p className="text-red-500 text-sm mt-3">
          {errors.paymentMethod.message}
        </p>
      )}
    </div>
  );
};

export default PaymentMethod;
