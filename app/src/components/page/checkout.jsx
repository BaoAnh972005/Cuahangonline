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

  // =========================
  // LẤY SẢN PHẨM TỪ CART
  // =========================
  const savedProducts = sessionStorage.getItem("productsToCheckout");
  const productsToCheckout = useMemo(
    () => (savedProducts ? JSON.parse(savedProducts) : []),
    [savedProducts]
  );

  // 👉 Nếu reload mà không có sản phẩm → quay về cart
  useEffect(() => {
    if (!productsToCheckout.length) {
      toast.error("❌ Không có sản phẩm để thanh toán");
      navigate("/cart");
    }
  }, [productsToCheckout, navigate]);

  // =========================
  // FORM
  // =========================
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { shopNotes: {} },
  });

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [summary, setSummary] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0,
  });
  const [perShopTotals, setPerShopTotals] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const hasTriggeredPayment = useRef(false);

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // =========================
  // GOM SẢN PHẨM THEO SHOP
  // =========================
  const groupedItems = useMemo(() => {
    const grouped = {};
    productsToCheckout.forEach((item) => {
      const shopId = item.shop_id || "unknown";
      if (!grouped[shopId]) {
        grouped[shopId] = {
          ten_shop: item.ten_shop || "Shop không xác định",
          items: [],
        };
      }
      grouped[shopId].items.push(item);
    });
    return grouped;
  }, [productsToCheckout]);

  // =========================
  // TÍNH TIỀN
  // =========================
  useEffect(() => {
    const perShop = Object.entries(groupedItems).map(([shopId, shop]) => {
      const subtotal = shop.items.reduce(
        (s, it) => s + Number(it.gia_ban) * Number(it.so_luong),
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
    const total = subtotal + shipping;

    setPerShopTotals(perShop);
    setSummary({ subtotal, shipping, total });
  }, [groupedItems]);

  // =========================
  // API THANH TOÁN
  // =========================
  const checkoutMutation = useMutation({
    mutationFn: checkoutAPI.chekout_pay,
    onMutate: () => setIsProcessingPayment(true),
    onSuccess: (_, variables) => {
      toast.success("✅ Thanh toán thành công!");

      variables.list_sanpham.forEach((sp) =>
        dispatch(removeFromCart(sp.sanpham_id))
      );

      sessionStorage.removeItem("productsToCheckout");

      setTimeout(() => {
        dispatch(clearOtpState());
        setIsProcessingPayment(false);
        navigate("/");
      }, 1200);
    },
    onError: () => {
      toast.error("❌ Thanh toán thất bại!");
      setIsProcessingPayment(false);
    },
  });

  // =========================
  // SUBMIT ĐẶT HÀNG
  // =========================
  const onSubmit = (data) => {
    if (!selectedAddress)
      return toast.error("❌ Vui lòng chọn địa chỉ giao hàng");
    if (!data.paymentMethod)
      return toast.error("❌ Vui lòng chọn phương thức thanh toán");

    const shopNotes = watch("shopNotes") || {};

    const list_sanpham = perShopTotals.flatMap((p) => {
      const items = groupedItems[p.shopId]?.items || [];
      return items.map((item) => ({
        sanpham_id: item.sanpham_id,
        so_luong: item.so_luong,
        shop_id: p.shopId,
        ghi_chu: shopNotes[p.shopId] || "",
      }));
    });

    dispatch(
      setPendingOrderData({
        khachhang_id: selectedAddress.khachhang_id,
        hinh_thuc_thanh_toan: data.paymentMethod,
        list_sanpham,
      })
    );

    dispatch(setPopupVisible(true));
  };

  // =========================
  // OTP OK → THANH TOÁN
  // =========================
  useEffect(() => {
    if (verified && pendingOrderData && !hasTriggeredPayment.current) {
      hasTriggeredPayment.current = true;
      checkoutMutation.mutate(pendingOrderData);
    }
  }, [verified, pendingOrderData, checkoutMutation]);

  // =========================
  // UI
  // =========================
  return (
    <div className="container mx-auto max-w-5xl p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4 bg-blue-600 p-4 rounded">
        <h1 className="text-xl font-bold text-white">Xác nhận đơn hàng</h1>
        <button
          onClick={() => navigate("/cart")}
          className="text-white text-sm underline"
        >
          Quay lại giỏ hàng
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <CustomerInfoForm setValueParent={setSelectedAddress} />

            {/* ✅ DANH SÁCH SẢN PHẨM (CÓ ẢNH) */}
            <ProductList
              groupedItems={groupedItems}
              formatCurrency={formatCurrency}
              register={register}
            />

            <PaymentMethod register={register} errors={errors} />
          </div>

          {/* ✅ TỔNG TIỀN */}
          <OrderSummary
            summary={summary}
            perShopTotals={perShopTotals}
            formatCurrency={formatCurrency}
            isPending={checkoutMutation.isPending}
          />
        </div>
      </form>

      {popupVisible && <SendOtpPopup />}

      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold">Đang xử lý thanh toán...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
