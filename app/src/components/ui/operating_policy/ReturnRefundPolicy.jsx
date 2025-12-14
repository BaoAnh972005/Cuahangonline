// src/pages/ReturnRefundPolicy.jsx
import React, { useState } from "react";

export default function ReturnRefundPolicy() {
  const [searchTerm, setSearchTerm] = useState("");

  const policies = [
    {
      category: "I. Mục đích và phạm vi áp dụng",
      content:
        "Chính sách Trả hàng & Hoàn tiền của sàn thương mại điện tử Maliketh nhằm bảo vệ quyền lợi người tiêu dùng, tạo điều kiện thuận lợi cho người mua và người bán trong các trường hợp phát sinh tranh chấp về chất lượng, giao hàng, hoặc thanh toán.",
    },
    {
      category: "II. Điều kiện trả hàng",
      content:
        "Người mua có thể yêu cầu trả hàng/hoàn tiền trong các trường hợp: (1) Hàng hóa bị hư hỏng, lỗi kỹ thuật hoặc không đúng mô tả; (2) Hàng bị giao sai mẫu, sai kích cỡ, sai số lượng; (3) Hàng không còn nguyên vẹn hoặc bị ảnh hưởng trong quá trình vận chuyển; (4) Sản phẩm còn trong thời hạn được trả theo quy định từng ngành hàng.",
    },
    {
      category: "III. Quy trình yêu cầu trả hàng và hoàn tiền",
      content:
        "1. Người mua gửi yêu cầu trả hàng qua hệ thống Maliketh trong vòng 3 ngày kể từ khi nhận hàng. 2. Người bán xác nhận tình trạng hàng hóa trong vòng 2 ngày làm việc. 3. Ban quản lý Maliketh thẩm định và hỗ trợ xử lý tranh chấp (nếu có). 4. Việc hoàn tiền được thực hiện trong 3-7 ngày làm việc tùy phương thức thanh toán.",
    },
    {
      category: "IV. Trách nhiệm của các bên",
      content:
        "Người bán có trách nhiệm phối hợp xử lý yêu cầu hợp lý, hoàn tiền đúng hạn, không gây cản trở hoặc gian lận. Người mua cần cung cấp đầy đủ bằng chứng (hình ảnh, video, mô tả) khi yêu cầu hoàn tiền. Maliketh đóng vai trò trung gian hỗ trợ, giám sát và đảm bảo công bằng cho hai bên.",
    },
    {
      category: "V. Các trường hợp không được hoàn tiền",
      content:
        "Không áp dụng trả hàng/hoàn tiền đối với: (1) Sản phẩm thuộc nhóm không được đổi trả (như hàng giảm giá sâu, quà tặng, hàng hóa tiêu dùng nhanh, thực phẩm tươi sống, phần mềm điện tử,...); (2) Sản phẩm bị hư do lỗi của người sử dụng; (3) Hết thời hạn yêu cầu hoàn tiền.",
    },
    {
      category: "VI. Thời gian xử lý và hoàn tiền",
      content:
        "Thời gian hoàn tiền phụ thuộc vào phương thức thanh toán: (1) Ví Maliketh: tối đa 24 giờ; (2) Chuyển khoản ngân hàng: 3-5 ngày làm việc; (3) Thanh toán qua thẻ: 5-7 ngày làm việc; (4) COD: Maliketh liên hệ xác nhận trước khi hoàn tiền.",
    },
    {
      category: "VII. Cơ chế giải quyết tranh chấp",
      content:
        "Trong trường hợp có tranh chấp giữa người mua và người bán, Maliketh đóng vai trò trung gian, tiếp nhận và xử lý khiếu nại theo quy định. Nếu hai bên không đạt được thỏa thuận, Maliketh có quyền đưa vụ việc ra cơ quan chức năng có thẩm quyền.",
    },
    {
      category: "VIII. Hiệu lực của chính sách",
      content:
        "Chính sách này có hiệu lực từ ngày 10/10/2025. Maliketh có quyền sửa đổi, bổ sung chính sách để phù hợp với quy định pháp luật và thực tế kinh doanh. Mọi thay đổi sẽ được công bố công khai trên website chính thức.",
    },
  ];

  const filteredPolicies = policies.filter(
    (item) =>
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-4 text-center">
        Chính Sách Trả Hàng & Hoàn Tiền - Maliketh
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm nội dung..."
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPolicies.length > 0 ? (
        <div className="space-y-6">
          {filteredPolicies.map((item, index) => (
            <div
              key={index}
              className="shadow-md border border-gray-200 rounded-2xl p-5 bg-white hover:shadow-lg transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {item.category}
              </h2>
              <p className="text-gray-700 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Không tìm thấy nội dung phù hợp 😢
        </p>
      )}
    </div>
  );
}
