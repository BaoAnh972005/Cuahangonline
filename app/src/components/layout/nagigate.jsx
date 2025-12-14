import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import fetchUserFromCookie from "../../redux/slices/userThunk.js";
import { Link, useNavigate } from "react-router-dom";
import Shearch from "../ui/shearch/Shearch.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false); // Mobile menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // User dropdown
  const [keyword, setKeyword] = useState(""); // Search input
  const [showSearchDropdown, setShowSearchDropdown] = useState(false); // Search results dropdown
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Search input focus state

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.length;
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  const searchRef = useRef(null);

  // Danh sách từ khóa mẫu
  const hotKeywords = [
    "điện thoại",
    "laptop",
    "tai nghe",
    "máy tính bảng",
    "đồng hồ thông minh",
  ];

  useEffect(() => {
    // Only attempt to fetch user from cookie when not already logged in.
    // This prevents a failing refresh-token call from immediately
    // overwriting a successful `loginSuccess` dispatched after login.
    if (!isLoggedIn) {
      dispatch(fetchUserFromCookie()); // Gọi /refresh-token
    }
  }, [dispatch, isLoggedIn]);

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    navigate("/login");
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shearch/${encodeURIComponent(keyword)}`);
      setShowSearchDropdown(true);
    }
  };

  // Xử lý click vào từ khóa mẫu
  const handleKeywordClick = (kw) => {
    setKeyword(kw);
    navigate(`/shearch/${encodeURIComponent(kw)}`);
    setShowSearchDropdown(true);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-500">
          Maliket
        </Link>

        {/* Search bar desktop */}
        <div className="hidden md:flex flex-1 mx-6 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowSearchDropdown(e.target.value.trim() !== "");
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors duration-200"
            >
              Tìm
            </button>
          </form>

          {/* Dropdown từ khóa mẫu và kết quả tìm kiếm */}
          {(isSearchFocused || showSearchDropdown) && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
              {/* Từ khóa mẫu (hiển thị khi chưa có từ khóa) */}
              {!keyword.trim() && isSearchFocused && (
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Gợi ý tìm kiếm
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hotKeywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => handleKeywordClick(kw)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kết quả tìm kiếm */}
              {keyword.trim() && showSearchDropdown && (
                <div className="p-2">
                  <Shearch keyword={keyword} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu desktop */}
        <div className="hidden lg:flex items-center space-x-6"></div>

        {/* User + Cart + Hamburger */}
        <div className="flex items-center space-x-4">
          {/* Giỏ hàng */}
          <Link to="/cart" className="relative">
            <ShoppingCart size={22} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Tài khoản */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-500"
              >
                <User size={22} />
                <span className="text-sm">{user?.last_name}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/dashboardUser"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Đơn hàng của tôi
                  </Link>
                  {user?.shop_id && (
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Shop của tôi
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-500 text-sm"
            >
              Đăng nhập
            </Link>
          )}

          {/* Nút menu mobile */}
          <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="lg:hidden bg-white px-4 pb-4 space-y-3 border-t border-gray-200">
          <Link
            to="/categories"
            className="block text-gray-700 hover:text-blue-500"
          >
            Danh mục
          </Link>
          <Link
            to="/promotions"
            className="block text-gray-700 hover:text-blue-500"
          >
            Khuyến mãi
          </Link>

          {/* Search mobile */}
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setShowSearchDropdown(e.target.value.trim() !== "");
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors duration-200"
              >
                Tìm
              </button>
            </form>

            {/* Dropdown từ khóa mẫu và kết quả tìm kiếm (mobile) */}
            {(isSearchFocused || showSearchDropdown) && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
                {/* Từ khóa mẫu */}
                {!keyword.trim() && isSearchFocused && (
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Gợi ý tìm kiếm
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hotKeywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleKeywordClick(kw)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kết quả tìm kiếm */}
                {keyword.trim() && showSearchDropdown && (
                  <div className="p-2">
                    <Shearch keyword={keyword} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
