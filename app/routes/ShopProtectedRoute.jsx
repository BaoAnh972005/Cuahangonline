import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ShopProtectedRoute({ children }) {
  const { user, isLoggedIn } = useSelector((state) => state.user);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (!user?.shop_id) return <Navigate to="/shop" replace />;

  return children;
}
