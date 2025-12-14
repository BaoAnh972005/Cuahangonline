import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cart.js";

export const useAddToCart = () => {
  const dispatch = useDispatch();

  const addToCartp = (productDetail, soLuong) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const index = cart.findIndex(
      (item) => item.sanpham_id === productDetail.sanpham_id
    );

    if (index >= 0) {
      cart[index].so_luong += soLuong;
    } else {
      cart.push({
        sanpham_id: productDetail.sanpham_id,
        ten_sanpham: productDetail.ten_sanpham,
        gia_ban: Number(productDetail.gia_ban),
        so_luong: soLuong,
        url_sanpham: productDetail.url_sanpham,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    dispatch(addToCart({ ...productDetail, so_luong: soLuong }));

    toast.success("🛒 Đã thêm vào giỏ hàng");
  };

  return addToCartp;
};
