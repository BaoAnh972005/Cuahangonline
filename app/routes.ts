import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // "/"  -> load routes/home.tsx
  index("routes/home.tsx"),

  // "/login" -> load routes/login.tsx
  route("login", "./src/components/page/LoginPage.jsx"),
  route("/dashboard", "./src/components/page/Dashborad.jsx"),
  route("billingadmin", "./src/components/page/admin/bill/Billing.jsx"),
  route("sanpham", "./src/components/page/admin/Sanpham.jsx"),
  route("kho", "./src/components/page/admin/Kho.jsx"),
  route("/product/:id", "./src/components/page/ProductDetail.jsx"),
  route("/pageshop/:id", "./src/components/page/PageShop.jsx"),
  route("/shop", "./src/components/layout/CrateShop.jsx"),
  route("/cart", "./src/components/page/Cart.jsx"),
  route("/checkout", "./src/components/page/checkout.jsx"),
  route("/security", "./src/components/ui/operating_policy/security.jsx"),
  route(
    "/MalikethPolicy",
    "./src/components/ui/operating_policy/MalikethPolicy.jsx"
  ),
  route(
    "/ReturnRefundPolicy",
    "./src/components/ui/operating_policy/ReturnRefundPolicy.jsx"
  ),
  route(
    "/TermsOfService",
    "./src/components/ui/operating_policy/TermsOfService.jsx"
  ),
  // ✅ Nested route: Billing nằm trong DashboardUser
  route(
    "/dashboardUser",
    "./src/components/page/dashborad_user/Dashborad.jsx",
    [route("billing", "./src/components/page/dashborad_user/Billing.jsx")]
  ),
  route("/shearch/:keyword", "./src/components/ui/shearch/Sheacrch_Detail.jsx"),
  route("/profile", "./src/components/page/profile/Profile.jsx"),
] satisfies RouteConfig;
