import ShopProtectedRoute from "../../../app/routes/ShopProtectedRoute";
import Dashboard from "../dashboard_user/Dashboard";

export default function DashboardShop() {
  return (
    <ShopProtectedRoute>
      <Dashboard />
    </ShopProtectedRoute>
  );
}
