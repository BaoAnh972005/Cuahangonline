import React, { useMemo, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { removeFromCart } from "../../redux/slices/cart.js";
import checkoutAPI from "../../utils/API/checkout.js";
import CustomerInfoForm from "../ui/checkout/CustomerInfoForm.jsx";
import ProductList from "../ui/checkout/ProductList.jsx";
import OrderSummary from "../ui/checkout/OrderSummary.jsx";
import PaymentMethod from "../ui/checkout/PaymentMethod.jsx";
import SendOtpPopup from "../ui/email/send_otp.jsx";
import {
  setPopupVisible,
  setPendingOrderData,
  clearOtpState,
} from "../../redux/slices/otpSlice.js";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { popupVisible, verified, pendingOrderData } = useSelector(
    (state) => state.otp
  );

  const savedProducts = sessionStorage.getItem("productsToCheckout");
  const productsToCheckout = useMemo(
    () => (savedProducts ? JSON.parse(savedProducts) : []),
    [savedProducts]
  );

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { shopNotes: {} } });

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [summary, setSummary] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0,
  });
  const [perShopTotals, setPerShopTotals] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const hasTriggeredPayment = useRef(false);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // 🏪 Gom sản phẩm theo shop
  const groupedItems = useMemo(() => {
    const grouped = {};
    productsToCheckout.forEach((item) => {
      const shopId = item.shop_id || "unknown";
      if (!grouped[shopId])
        grouped[shopId] = {
          ten_shop: item.ten_shop || "Shop không xác định",
          items: [],
        };
      grouped[shopId].items.push(item);
    });
    return grouped;
  }, [productsToCheckout]);

  // 📦 Tính tổng tiền
  useEffect(() => {
    if (!Object.keys(groupedItems).length) return;
    const perShop = Object.entries(groupedItems).map(([shopId, shop]) => {
      const subtotal = shop.items.reduce(
        (s, it) => s + Number(it.gia_ban || 0) * Number(it.so_luong || 0),
        0
      );
      const shipping = subtotal > 0 ? 30000 : 0;
      return {
        shopId,
        ten_shop: shop.ten_shop,
        subtotal,
        shipping,
        total: subtotal + shipping,
      };
    });
    const subtotal = perShop.reduce((s, p) => s + p.subtotal, 0);
    const shipping = perShop.reduce((s, p) => s + p.shipping, 0);
    const total = perShop.reduce((s, p) => s + p.total, 0);
    setPerShopTotals(perShop);
    setSummary({ subtotal, shipping, total });
  }, [groupedItems]);

  // 💳 API thanh toán
  const checkoutMutation = useMutation({
    mutationFn: (data) => checkoutAPI.chekout_pay(data),
    onMutate: () => {
      setIsProcessingPayment(true);
    },
    onSuccess: (data, variables) => {
      toast.success("✅ Thanh toán thành công!");
      variables.list_sanpham.forEach((sp) =>
        dispatch(removeFromCart(sp.sanpham_id))
      );
      setTimeout(() => {
        setIsProcessingPayment(false);
        dispatch(clearOtpState());
        navigate("/"); // ✅ hoặc "/"
      }, 1500); // đợi animation 1.5s trước khi rời trang
    },
    onError: (error) => {
      console.error("❌ Lỗi thanh toán:", error);
      toast.error("❌ Có lỗi xảy ra khi thanh toán!");
      setIsProcessingPayment(false);
    },
  });

  // 🧾 Nhấn "Đặt hàng" → lưu đơn → bật OTP popup
  const onSubmit = (data) => {
    if (!selectedAddress)
      return toast.error("❌ Vui lòng chọn địa chỉ giao hàng!");
    if (!data.paymentMethod)
      return toast.error("❌ Vui lòng chọn phương thức thanh toán!");
    if (productsToCheckout.length === 0)
      return toast.error("❌ Giỏ hàng trống!");

    const shopNotes = watch("shopNotes") || {};
    const list_sanpham = perShopTotals.flatMap((p) => {
      const items = groupedItems[p.shopId]?.items || [];
      const ghiChuShop = shopNotes[p.shopId] || "";
      return items.map((item) => ({
        sanpham_id: item.sanpham_id,
        so_luong: item.so_luong,
        shop_id: p.shopId,
        ghi_chu: ghiChuShop,
      }));
    });

    const orderData = {
      khachhang_id: selectedAddress.khachhang_id,
      hinh_thuc_thanh_toan: data.paymentMethod,
      list_sanpham,
    };

    dispatch(setPendingOrderData(orderData));
    dispatch(setPopupVisible(true));
  };

  // 🔐 Khi OTP xác thực thành công → gọi API thanh toán tự động
  useEffect(() => {
    if (verified && pendingOrderData && !hasTriggeredPayment.current) {
      hasTriggeredPayment.current = true;
      checkoutMutation.mutate(pendingOrderData);
    }
  }, [verified, pendingOrderData]);

  return (
    <div className="relative container mx-auto p-4 max-w-5xl bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-blue-500 p-4 rounded-sm">
        <h1 className="text-2xl font-bold text-white">Đặt Hàng</h1>
        <a href="/cart" className="text-white hover:underline text-sm">
          Quay lại giỏ hàng
        </a>
      </div>

      {/* Nội dung checkout */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <CustomerInfoForm setValueParent={setSelectedAddress} />
            <ProductList
              groupedItems={groupedItems}
              formatCurrency={formatCurrency}
              register={register}
            />
            <PaymentMethod register={register} errors={errors} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              summary={summary}
              formatCurrency={formatCurrency}
              perShopTotals={perShopTotals}
              isPending={checkoutMutation.isPending}
            />
          </div>
        </div>
      </form>

      {/* Popup OTP */}
      {popupVisible && <SendOtpPopup />}

      {/* 🌀 Overlay xử lý thanh toán */}
      {isProcessingPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[9998] bg-black/60 flex flex-col items-center justify-center text-white"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="bg-white text-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center"
          >
            <div className="loader mb-4 border-4 border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
            <h2 className="text-lg font-semibold">Đang xử lý thanh toán...</h2>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng chờ trong giây lát
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Checkout;
