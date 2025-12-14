import React from "react";
import Nagigate from "../layout/nagigate";
import Baner from "../layout/Baner.jsx";
import MalikethMall from "../layout/MalikethMall.jsx";
import Footer from "../layout/Footer.jsx";
import { Link } from "react-router-dom";
export default function HomePage() {
  return (
    <div>
      <Link
        to="shop"
        className="inline-block bg-gray-200 hover:bg-blue-700 text-black font-medium py-2 px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Trở thành người bán
      </Link>
      <Nagigate />
      <Baner />
      <MalikethMall />
      <Footer />
    </div>
  );
}
