import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cart.js";

export const useAddToCart = () => {
  const dispatch = useDispatch();

  const addToCartp = (product, quantity = 1) => {
    if (!product?.id) {
      toast.error("Sản phẩm không hợp lệ");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const index = cart.findIndex(
      (item) => item.product_id === product.id
    );

    if (index >= 0) {
      cart[index].quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: quantity,
        image: product.imageUrl,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    dispatch(
      addToCart({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: quantity,
        image: product.imageUrl,
      })
    );

    toast.success("🛒 Đã thêm vào giỏ hàng");
  };

  return addToCartp;
};
