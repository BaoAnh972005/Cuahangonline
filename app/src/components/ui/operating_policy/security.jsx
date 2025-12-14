import React, { useMemo, useState } from "react";

// Security_Policy_Mailketh.jsx
// React component (default export) showing Mailketh Privacy Policy styled like Shopee's
// Features:
// - Search across all policy sections
// - Filter by category / tag
// - Responsive layout using TailwindCSS
// - Accessible accordion for each section
// - Table of contents for easy navigation

export default function Security() {
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [openId, setOpenId] = useState(null);

  const sections = [
    {
      id: 1,
      title: "Phạm vi áp dụng",
      category: "Tổng quan",
      content:
        "Chính sách này áp dụng cho tất cả người dùng và khách truy cập của Mailketh — bao gồm người mua, người bán, đối tác và khách truy cập trang web hoặc ứng dụng di động do Mailketh vận hành. Chính sách không áp dụng cho các dịch vụ của bên thứ ba mà người dùng truy cập thông qua liên kết.",
    },
    {
      id: 2,
      title: "Thông tin chúng tôi thu thập",
      category: "Dữ liệu",
      content:
        "Chúng tôi thu thập: (1) Thông tin bạn cung cấp trực tiếp như họ tên, email, số điện thoại, địa chỉ giao hàng, thông tin thanh toán (do cổng thanh toán xử lý); (2) Thông tin thu thập tự động như địa chỉ IP, thông tin thiết bị, cookie; (3) Thông tin từ bên thứ ba như cổng thanh toán, nhà vận chuyển hoặc mạng xã hội nếu bạn đăng nhập bằng tài khoản đó.",
    },
    {
      id: 3,
      title: "Mục đích sử dụng thông tin",
      category: "Mục đích",
      content:
        "Chúng tôi sử dụng thông tin để: cung cấp và vận hành dịch vụ, xử lý đơn hàng, xác minh danh tính, ngăn chặn gian lận, giao tiếp với bạn, cá nhân hóa trải nghiệm, phân tích dữ liệu và tuân thủ các quy định pháp luật.",
    },
    {
      id: 4,
      title: "Chia sẻ và tiết lộ thông tin",
      category: "Bên thứ ba",
      content:
        "Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ (cổng thanh toán, vận chuyển, phân tích), đối tác thương mại hoặc cơ quan pháp luật khi có yêu cầu hợp pháp. Trong trường hợp sáp nhập hoặc chuyển nhượng, thông tin có thể được chuyển giao cho bên nhận.",
    },
    {
      id: 5,
      title: "Cookie và công nghệ theo dõi",
      category: "Dữ liệu",
      content:
        "Mailketh sử dụng cookie và các công nghệ tương tự để lưu thông tin đăng nhập, phân tích hành vi người dùng và hỗ trợ quảng cáo. Bạn có thể tắt cookie, nhưng một số chức năng có thể bị ảnh hưởng.",
    },
    {
      id: 6,
      title: "Bảo mật dữ liệu",
      category: "Bảo mật",
      content:
        "Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức như mã hóa, kiểm soát truy cập và hệ thống phát hiện xâm nhập để bảo vệ dữ liệu của bạn. Trong trường hợp xảy ra sự cố, chúng tôi sẽ thông báo theo quy định pháp luật.",
    },
    {
      id: 7,
      title: "Lưu giữ dữ liệu",
      category: "Mục đích",
      content:
        "Dữ liệu được lưu giữ trong thời gian cần thiết để phục vụ mục đích thu thập (xử lý đơn hàng, kế toán, giải quyết khiếu nại). Khi không còn cần thiết, dữ liệu sẽ được xóa hoặc ẩn danh, trừ khi pháp luật yêu cầu lưu giữ.",
    },
    {
      id: 8,
      title: "Quyền của bạn",
      category: "Quyền",
      content:
        "Bạn có quyền truy cập, chỉnh sửa, yêu cầu xóa hoặc hạn chế xử lý dữ liệu cá nhân, rút lại sự đồng ý (nếu xử lý dựa trên sự đồng ý) và khiếu nại với cơ quan bảo vệ dữ liệu nếu quyền của bạn bị xâm phạm.",
    },
    {
      id: 9,
      title: "Bảo mật cho trẻ em",
      category: "Tổng quan",
      content:
        "Dịch vụ không dành cho trẻ em dưới 13 tuổi (hoặc độ tuổi tối thiểu theo luật địa phương). Nếu phát hiện dữ liệu của trẻ em được thu thập trái phép, chúng tôi sẽ xóa ngay khi được thông báo.",
    },
    {
      id: 10,
      title: "Thay đổi chính sách",
      category: "Tổng quan",
      content:
        "Chúng tôi có thể cập nhật chính sách này. Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên trang web với ngày hiệu lực mới.",
    },
    {
      id: 11,
      title: "Thông tin liên hệ",
      category: "Liên hệ",
      content:
        "Nếu bạn có câu hỏi về chính sách này, vui lòng liên hệ qua email: tuannguyenak47@gmail.com.",
    },
  ];

  const categories = useMemo(() => {
    const set = new Set(sections.map((s) => s.category));
    return ["Tất cả", ...Array.from(set)];
  }, [sections]);

  const normalized = (str = "") => str.toLowerCase();

  const filtered = useMemo(() => {
    const qn = normalized(q).trim();
    return sections.filter((s) => {
      if (activeCategory !== "Tất cả" && s.category !== activeCategory)
        return false;
      if (!qn) return true;
      return (
        normalized(s.title).includes(qn) || normalized(s.content).includes(qn)
      );
    });
  }, [q, activeCategory, sections]);

  function toggleOpen(id) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
          Chính Sách Bảo Mật — Mailketh
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Hiệu lực từ: <span className="font-semibold">09/10/2025</span>
        </p>
        <p className="mt-1 text-sm text-gray-500 max-w-3xl mx-auto">
          Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ
          thông tin của bạn. Sử dụng thanh tìm kiếm hoặc mục lục để điều hướng
          dễ dàng.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Table of Contents + Filters */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Mục lục
            </h2>
            <ul className="space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#section-${s.id}`}
                    className="text-orange-600 hover:underline"
                    onClick={() => toggleOpen(s.id)}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <label className="block">
                <span className="sr-only">Tìm kiếm chính sách</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm (ví dụ: cookie, dữ liệu...)"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  type="search"
                  aria-label="Tìm kiếm chính sách"
                />
              </label>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Lọc theo danh mục
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`text-sm px-4 py-1.5 rounded-full border transition-colors
                      ${
                        activeCategory === c
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
                      }`}
                    aria-pressed={activeCategory === c}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Kết quả: <span className="font-semibold">{filtered.length}</span>{" "}
              mục
            </div>
          </div>
        </aside>

        {/* Right: Content */}
        <main className="flex-1">
          <div className="space-y-6">
            {filtered.length === 0 && (
              <div className="p-6 rounded-lg border border-dashed border-gray-300 text-center text-gray-600">
                Không tìm thấy nội dung phù hợp với từ khóa hoặc danh mục đã
                chọn.
              </div>
            )}

            {filtered.map((s) => (
              <article
                key={s.id}
                id={`section-${s.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <header className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                      {s.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">{s.category}</p>
                  </div>
                  <button
                    onClick={() => toggleOpen(s.id)}
                    className="px-4 py-2 text-sm rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200"
                    aria-expanded={openId === s.id}
                    aria-controls={`content-${s.id}`}
                  >
                    {openId === s.id ? "Thu gọn" : "Xem chi tiết"}
                  </button>
                </header>

                <div
                  id={`content-${s.id}`}
                  className={`${openId === s.id ? "block" : "hidden"} mt-4`}
                >
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {s.content}
                  </p>
                </div>

                <footer className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500 flex flex-col sm:flex-row gap-3">
                  <span>Cập nhật lần cuối: 09/10/2025</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          s.title + "\n\n" + s.content
                        );
                      }}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      Sao chép nội dung
                    </button>
                    <a
                      href="#contact"
                      className="px-4 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50"
                    >
                      Liên hệ hỗ trợ
                    </a>
                  </div>
                </footer>
              </article>
            ))}

            <div
              id="contact"
              className="mt-8 p-6 rounded-lg bg-white border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900">Liên hệ</h3>
              <p className="mt-2 text-base text-gray-600">
                Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ qua email:{" "}
                <a
                  className="text-orange-600 hover:underline"
                  href="mailto:tuannguyenak47@gmail.com"
                >
                  tuannguyenak47@gmail.com
                </a>
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setQ("");
                    setActiveCategory("Tất cả");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500">
        © Mailketh. Mọi quyền được bảo lưu.
      </footer>
    </div>
  );
}
