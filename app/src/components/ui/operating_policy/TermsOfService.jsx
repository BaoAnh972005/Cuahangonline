import React, { useState } from "react";

export const terms = [
  {
    id: 1,
    title: "Điều khoản chung",
    category: "Chung",
    content: `
1. Người dùng khi truy cập và sử dụng dịch vụ của chúng tôi phải tuân thủ pháp luật Việt Nam.
2. Người dùng phải cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản.
3. Chúng tôi có quyền thay đổi, cập nhật các điều khoản này và sẽ thông báo trên trang web.
`,
  },
  {
    id: 2,
    title: "Quyền và nghĩa vụ của người dùng",
    category: "Quyền lợi",
    content: `
1. Người dùng có quyền truy cập, sử dụng dịch vụ, mua hàng, và phản hồi về sản phẩm/dịch vụ.
2. Người dùng có nghĩa vụ bảo mật thông tin tài khoản, mật khẩu, và chịu trách nhiệm về mọi hoạt động xảy ra từ tài khoản của mình.
3. Người dùng không được thực hiện các hành vi gian lận, giả mạo, hoặc vi phạm pháp luật khi sử dụng dịch vụ.
`,
  },
  {
    id: 3,
    title: "Thanh toán",
    category: "Thanh toán",
    content: `
1. Người dùng có thể thanh toán bằng các phương thức được chấp nhận (thẻ ngân hàng, ví điện tử, COD...).
2. Mọi giao dịch thanh toán phải bảo đảm chính xác, hợp pháp.
3. Chúng tôi không chịu trách nhiệm nếu người dùng cung cấp thông tin thanh toán sai hoặc bị lộ thông tin do bất cẩn.
`,
  },
  {
    id: 4,
    title: "Hoàn trả / Trả hàng",
    category: "Hoàn trả",
    content: `
1. Người dùng có quyền yêu cầu hoàn trả trong vòng 7 ngày kể từ ngày nhận hàng, nếu sản phẩm lỗi hoặc không đúng mô tả.
2. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng, kèm đầy đủ hóa đơn và phiếu bảo hành (nếu có).
3. Chi phí vận chuyển trong trường hợp hoàn trả sẽ theo chính sách công ty.
`,
  },
  {
    id: 5,
    title: "Trách nhiệm pháp lý",
    category: "Trách nhiệm",
    content: `
1. Chúng tôi không chịu trách nhiệm về các thiệt hại ngoài tầm kiểm soát, bao gồm thiên tai, sự cố mạng, lỗi từ nhà cung cấp dịch vụ thứ ba.
2. Người dùng đồng ý bồi thường thiệt hại nếu vi phạm các điều khoản, gây hại đến dịch vụ hoặc người dùng khác.
3. Mọi tranh chấp phát sinh sẽ được giải quyết theo pháp luật Việt Nam.
`,
  },
];

export default function TermsOfService() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      term.title.toLowerCase().includes(search.toLowerCase()) ||
      term.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Tất cả", ...new Set(terms.map((term) => term.category))];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Điều Khoản Dịch Vụ
      </h1>

      {/* Tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm kiếm điều khoản..."
        className="w-full p-2 border border-gray-300 rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Chọn loại điều khoản */}
      <div className="mb-4">
        <label htmlFor="category" className="mr-2">
          Phân loại:
        </label>
        <select
          id="category"
          className="p-2 border border-gray-300 rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Danh sách điều khoản */}
      <div className="space-y-4">
        {filteredTerms.map((term) => (
          <div
            key={term.id}
            className="p-4 border border-gray-200 rounded shadow-sm"
          >
            <h2 className="text-xl font-semibold text-orange-600">
              {term.title}
            </h2>
            <p className="text-gray-700">{term.content}</p>
          </div>
        ))}
        {filteredTerms.length === 0 && (
          <p className="text-gray-500">
            Không tìm thấy điều khoản nào phù hợp.
          </p>
        )}
      </div>
    </div>
  );
}
