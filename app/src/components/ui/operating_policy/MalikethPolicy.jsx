// src/components/MalikethPolicy.jsx
import React, { useState, useMemo } from "react";

/**
 * MalikethPolicy.jsx
 * - Single-file React component (JSX)
 * - Requires Tailwind CSS in the project
 * - Provides a full "Quy chế hoạt động" page with TOC, search, highlight, responsive layout
 *
 * IMPORTANT: This document is a template/sample. Please have it reviewed by legal counsel
 * before using it as the binding policy for a real marketplace.
 */

// ======== POLICY CONTENT (CUSTOMIZE as needed) ========= //
const SECTIONS = [
  {
    id: "preambule",
    title: "Lời mở đầu & Căn cứ pháp lý",
    content: `1. Maliketh là sàn thương mại điện tử hoạt động tại Việt Nam, cung cấp nền tảng kết nối Người bán và Người mua để giao dịch hàng hóa và dịch vụ. 
2. Quy chế này (sau đây gọi tắt là "Quy chế") quy định quyền, nghĩa vụ và trách nhiệm của các bên khi sử dụng nền tảng Maliketh.
3. Căn cứ pháp lý: (ví dụ) Luật Thương mại, Luật Bảo vệ Người tiêu dùng, Nghị định, Thông tư liên quan về thương mại điện tử và thương mại. Maliketh có quyền cập nhật Quy chế nhằm tuân thủ pháp luật hiện hành.`,
  },

  {
    id: "scope",
    title: "Phạm vi điều chỉnh & Giải thích thuật ngữ",
    content: `1. Phạm vi: Quy chế điều chỉnh mọi hoạt động liên quan tới việc đăng ký, sử dụng, giao dịch, thanh toán, giao nhận, khiếu nại, xử lý vi phạm trên nền tảng Maliketh.
2. Giải thích một số thuật ngữ chính:
   - "Người dùng": mọi cá nhân/tổ chức sử dụng nền tảng, bao gồm Người bán và Người mua.
   - "Người bán": tài khoản đăng ký bán hàng trên Maliketh.
   - "Người mua": tài khoản thực hiện mua hàng hoặc đặt dịch vụ.
   - "Giao dịch": hành vi đặt hàng, thanh toán, giao/nhận hàng hoá/dịch vụ.`,
  },

  {
    id: "registration",
    title: "Điều kiện đăng ký & Tài khoản",
    content: `1. Điều kiện đăng ký:
   - Người dùng phải đủ 18 tuổi và có năng lực hành vi dân sự theo quy định của pháp luật.
   - Cung cấp thông tin đăng ký chính xác, trung thực và chịu trách nhiệm về tính hợp lệ của thông tin.
2. Tài khoản:
   - Người dùng tự chịu trách nhiệm bảo mật tên đăng nhập, mật khẩu và mọi hành vi phát sinh từ tài khoản.
   - Mọi hành vi vi phạm chính sách hoặc luật pháp có thể dẫn tới tạm khoá hoặc chấm dứt tài khoản.`,
  },

  {
    id: "seller_rights_obligations",
    title: "Quyền & Nghĩa vụ của Người bán",
    content: `Quyền:
  - Được đăng bán sản phẩm/dịch vụ theo danh mục được phép.
  - Quản lý danh mục, tin đăng, giá, tồn kho, khuyến mãi theo chính sách Maliketh.
Nghĩa vụ:
  - Cung cấp mô tả sản phẩm chính xác, minh bạch (tên, giá, mô tả, trọng lượng, kích thước, hình ảnh).
  - Chịu trách nhiệm về chất lượng hàng hoá, nguồn gốc, chứng từ (nếu có).
  - Tuân thủ quy định về hàng hoá cấm/giới hạn; cung cấp giấy phép khi đăng bán hàng thuộc hàng giới hạn.
  - Giao hàng đúng thời hạn, hợp tác giải quyết khiếu nại, hoàn trả và các trách nhiệm bảo hành (nếu có).`,
  },

  {
    id: "buyer_rights_obligations",
    title: "Quyền & Nghĩa vụ của Người mua",
    content: `Quyền:
  - Nhận hàng đúng mô tả; yêu cầu hỗ trợ khi có tranh chấp;
  - Yêu cầu hoàn tiền/hủy đơn theo chính sách hoàn tiền.
Nghĩa vụ:
  - Cung cấp thông tin giao hàng chính xác; thanh toán theo thỏa thuận.
  - Phải phối hợp cung cấp bằng chứng khiếu nại (hình ảnh, video, mã đơn hàng).`,
  },

  {
    id: "prohibited_items",
    title: "Danh mục hàng hóa & dịch vụ cấm / giới hạn",
    content: `1. Cấm bán: hàng vi phạm pháp luật, hàng giả, hàng xâm phạm SHTT, chất ma tuý, vũ khí, tài liệu mật, nội dung khiêu dâm trái pháp luật, hàng hóa nguy hiểm bị nghiêm cấm theo quy định.
2. Giới hạn: hàng cần giấy phép / chứng nhận (dược phẩm, thực phẩm chức năng, thiết bị y tế, hóa chất, vv.) phải có giấy tờ pháp lý kèm theo; Người bán phải chịu trách nhiệm cung cấp giấy tờ khi được yêu cầu.`,
  },

  {
    id: "listing_rules",
    title: "Quy định đăng tin, kiểm duyệt & Gỡ bỏ",
    content: `1. Nội dung đăng tải phải đúng sự thật, không gây hiểu lầm.
2. Maliketh có quyền rà soát, kiểm duyệt, từ chối, chỉnh sửa hoặc gỡ bỏ bài đăng vi phạm Quy chế hoặc pháp luật.
3. Trong trường hợp phát hiện vi phạm nghiêm trọng (lừa đảo, hàng giả), Maliketh có quyền tạm khoá hoặc chấm dứt tài khoản, lưu trữ chứng cứ và phối hợp với cơ quan chức năng.`,
  },

  {
    id: "pricing_and_fees",
    title: "Giá cả, Thanh toán & Phí dịch vụ",
    content: `1. Giá bán do Người bán quyết định; giá hiển thị trên nền tảng là cơ sở giao dịch giữa Người mua và Người bán.
2. Maliketh có thể thu phí dịch vụ, hoa hồng, phí xử lý thanh toán; mức phí và phương thức thu sẽ được thông báo trước.
3. Hình thức thanh toán hỗ trợ: chuyển khoản ngân hàng, thanh toán điện tử, COD, ví điện tử (tuỳ thuộc tích hợp).`,
  },

  {
    id: "delivery",
    title: "Giao nhận & Vận chuyển",
    content: `1. Điều kiện giao hàng, chi phí vận chuyển, thời gian giao do Người bán/đối tác vận chuyển và Người mua thỏa thuận hoặc theo cài đặt trên nền tảng.
2. Người bán phải cung cấp mã vận đơn khi giao; Người mua có quyền kiểm tra thông tin vận chuyển.
3. Trường hợp hàng bị hư hỏng/thiếu/K theo mô tả: Người mua có quyền khiếu nại trong thời hạn quy định và yêu cầu hoàn tiền/đổi trả theo chính sách.`,
  },

  {
    id: "refunds_and_disputes",
    title: "Khiếu nại, Hoàn tiền & Giải quyết tranh chấp",
    content: `1. Quy trình khiếu nại cơ bản:
  - Bước 1: Người mua gửi yêu cầu khiếu nại qua hệ thống Maliketh hoặc email hỗ trợ kèm bằng chứng.
  - Bước 2: Maliketh tiếp nhận trong vòng (ví dụ) 48-72 giờ, xác minh và chuyển yêu cầu đến Người bán để giải quyết.
  - Bước 3: Nếu không đạt thỏa thuận, Maliketh có thể đưa ra quyết định giải quyết theo chính sách và bằng chứng thu thập được.
2. Thời hạn khiếu nại: Người mua phải khiếu nại trong khung thời gian quy định kể từ ngày nhận hàng (ví dụ 7 - 30 ngày tuỳ loại hàng).
3. Hoàn tiền: Thực hiện theo quy trình và điều kiện do Maliketh quy định (có thể gồm giữ tiền tạm thời, hoàn vào ví nội bộ hoặc hoàn về tài khoản thanh toán).`,
  },

  {
    id: "violation_and_penalty",
    title: "Xử lý vi phạm, Trách nhiệm & Bồi thường",
    content: `1. Maliketh có quyền áp dụng biện pháp: cảnh cáo, giảm hiển thị, tạm khoá, khoá vĩnh viễn tài khoản, chấm dứt hợp tác, và/hoặc chuyển hồ sơ cho cơ quan chức năng.
2. Người dùng chịu trách nhiệm về mọi thiệt hại phát sinh do hành vi vi phạm (bồi thường cho bên bị thiệt hại).
3. Maliketh không chịu trách nhiệm bồi thường trong trường hợp thiệt hại do hành vi của Người dùng vi phạm pháp luật hoặc do lực majeure.`,
  },

  {
    id: "data_protection",
    title: "Bảo mật thông tin & Quyền riêng tư",
    content: `1. Maliketh cam kết bảo mật thông tin cá nhân; thu thập và xử lý dữ liệu theo Chính sách Bảo mật riêng.
2. Mục đích sử dụng dữ liệu: xác thực tài khoản, xử lý giao dịch, giao hàng, chăm sóc khách hàng, tuân thủ pháp luật.
3. Maliketh có thể chia sẻ dữ liệu với bên thứ ba (đối tác vận chuyển, thanh toán) khi cần để hoàn thành giao dịch.`,
  },

  {
    id: "amendments",
    title: "Sửa đổi Quy chế & Hiệu lực",
    content: `1. Maliketh có quyền sửa đổi Quy chế; mọi sửa đổi sẽ được thông báo công khai trên nền tảng và/hoặc qua email trước khi có hiệu lực.
2. Việc tiếp tục sử dụng dịch vụ sau khi Quy chế được cập nhật được coi là chấp thuận thay đổi.`,
  },

  {
    id: "contact",
    title: "Liên hệ, Báo cáo & Hỗ trợ",
    content: `Mọi thắc mắc, khiếu nại, báo cáo hành vi vi phạm vui lòng liên hệ:
- Email hỗ trợ: tuannguyenak47z@gmail.com
- Hệ thống hỗ trợ: mục 'Liên hệ' trên nền tảng Maliketh
Maliketh sẽ tiếp nhận và phản hồi theo SLA được thông báo.`,
  },

  {
    id: "final",
    title: "Điều khoản cuối cùng",
    content: `1. Quy chế này là thỏa thuận pháp lý giữa Maliketh và Người dùng. Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương lượng; nếu không thành công sẽ được đưa ra cơ quan tài phán có thẩm quyền theo pháp luật.
2. Phiên bản: 1.0 — Ngày ban hành: (ngày/tháng/năm).`,
  },
];

// ======== COMPONENT IMPLEMENTATION ========= //
function escapeRegExp(string = "") {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightString(text = "", query = "") {
  if (!query) return text;
  const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
  const parts = text.split(re);
  return parts.map((part, idx) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={idx} className="bg-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export default function MalikethPolicy() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  const filtered = useMemo(() => {
    if (!lower) return SECTIONS;
    return SECTIONS.filter((s) => {
      return (
        s.title.toLowerCase().includes(lower) ||
        s.content.toLowerCase().includes(lower)
      );
    });
  }, [lower]);

  function goToSection(id) {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setShowMobileTOC(false);
  }

  function printPage() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Quy chế hoạt động — Maliketh
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Email liên hệ:{" "}
              <a
                href="mailto:tuannguyenak47z@gmail.com"
                className="text-blue-600 underline"
              >
                tuannguyenak47z@gmail.com
              </a>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              LƯU Ý: Văn bản mẫu — vui lòng nhờ tư vấn pháp lý trước khi áp
              dụng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block w-72">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm trong quy chế (ví dụ: hoàn tiền, vận chuyển)..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Tìm trong quy chế"
              />
            </div>

            <button
              onClick={printPage}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
              title="In trang / Lưu PDF"
            >
              In / Lưu PDF
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left: TOC */}
          <aside className="md:col-span-1">
            <div className="md:hidden mb-3">
              <button
                onClick={() => setShowMobileTOC((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md bg-white"
                aria-expanded={showMobileTOC}
              >
                <span className="font-medium">Mục lục</span>
                <span>{showMobileTOC ? "▲" : "▼"}</span>
              </button>
            </div>

            <div
              className={`${
                showMobileTOC ? "block" : "hidden"
              } md:block sticky top-6 bg-white p-4 border border-gray-100 rounded-md shadow-sm`}
            >
              <div className="mb-3 hidden md:block">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm mục / từ khoá..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <nav aria-label="Table of contents">
                <ul className="space-y-2 text-sm">
                  {filtered.length === 0 && (
                    <li className="text-gray-500">Không tìm thấy mục</li>
                  )}
                  {filtered.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => goToSection(s.id)}
                        className={`w-full text-left px-2 py-1 rounded-md ${
                          s.id === activeId
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {highlightString(s.title, trimmed)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-4 text-xs text-gray-500">
                <p className="mb-1 font-medium">Phiên bản: 1.0</p>
                <p>Ngày ban hành: (ngày/tháng/năm)</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="md:col-span-3">
            <div className="mb-4 md:hidden">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm trong quy chế..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-6">
              {filtered.map((s) => (
                <section
                  id={s.id}
                  key={s.id}
                  className={`bg-white border border-gray-100 rounded-md p-6 shadow-sm ${
                    activeId === s.id ? "ring-2 ring-indigo-100" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold">
                      {highlightString(s.title, trimmed)}
                    </h2>
                    <div className="text-sm text-gray-500">
                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            `${window.location.href.split("#")[0]}#${s.id}`
                          )
                        }
                        className="mr-2 px-2 py-1 rounded hover:bg-gray-50"
                        title="Sao chép link mục"
                      >
                        Sao chép link
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                    {highlightString(s.content, trimmed)}
                  </div>

                  {/* Example: a more structured subsection for disputes */}
                  {s.id === "refunds_and_disputes" && (
                    <div className="mt-4 bg-gray-50 p-4 rounded">
                      <h3 className="font-medium mb-2">
                        Mẫu quy trình xử lý khiếu nại
                      </h3>
                      <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                        <li>
                          Người mua gửi yêu cầu khiếu nại qua hệ thống hoặc
                          email
                          <a
                            href="mailto:tuannguyenak47z@gmail.com"
                            className="ml-1 underline text-blue-600"
                          >
                            tuannguyenak47z@gmail.com
                          </a>
                          , kèm bằng chứng (hình ảnh, video, mã đơn).
                        </li>
                        <li>
                          Maliketh tiếp nhận và thông báo cho Người bán trong
                          vòng 72 giờ.
                        </li>
                        <li>
                          Maliketh phối hợp kiểm tra, nếu cần thu hồi tiền tạm
                          thời theo chính sách để bảo vệ quyền lợi Người mua.
                        </li>
                        <li>
                          Nếu có tranh chấp phức tạp, Maliketh sẽ lưu trữ chứng
                          cứ và có thể đề nghị hòa giải hoặc chuyển cho cơ quan
                          có thẩm quyền.
                        </li>
                      </ol>
                    </div>
                  )}
                </section>
              ))}

              {filtered.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-md p-6 text-gray-600">
                  Không tìm thấy nội dung phù hợp với từ khoá "
                  <span className="font-medium">{query}</span>".
                </div>
              )}

              {/* Back to top */}
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                >
                  Lên đầu trang
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
