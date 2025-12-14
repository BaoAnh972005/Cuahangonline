import React from "react";
import Nagigate from "../layout/nagigate";
import Baner from "../layout/Baner.jsx";
import MalikethMall from "../layout/MalikethMall.jsx";
import Footer from "../layout/Footer.jsx";
import { Link } from "react-router-dom";
export default function HomePage() {
  return (
    <div>
      <Nagigate />
      <Baner />
      <MalikethMall />
      <Footer />
    </div>
  );
}
